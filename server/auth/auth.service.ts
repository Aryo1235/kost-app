import type { Db } from "@/server/db/client";
import {
  BusinessRuleError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  RateLimitedError,
  UnauthorizedError,
} from "@/server/errors";
import { childLogger } from "@/server/logger";
import { systemScope, type Scope } from "@/server/scope";
import { AuditService } from "@/server/services/audit.service";
import type { Role } from "@/shared/enums";
import { normalizeUsername } from "@/shared/schemas/auth";
import { AuthRepository } from "./auth.repository";
import {
  dummyHash,
  generateTemporaryPassword,
  hashPassword,
  needsRehash,
  verifyPassword,
} from "./password";
import {
  hashToken,
  newToken,
  sessionExpiry,
  TOUCH_INTERVAL_MS,
} from "./session";

// Batas percobaan login (TECH-SPEC 3.4).
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES_PER_USERNAME = 5;
const MAX_FAILURES_PER_IP = 20;
const ATTEMPT_RETENTION_MS = 24 * 60 * 60 * 1000;

export type AuthUser = {
  id: number;
  organizationId: number;
  name: string;
  username: string;
  role: Role;
  mustChangePassword: boolean;
};

export type SessionContext = {
  sessionId: number;
  user: AuthUser;
  scope: Scope;
};

type UserRow = {
  id: number;
  organizationId: number;
  name: string;
  username: string;
  role: Role;
  passwordHash: string;
  mustChangePassword: boolean;
  isActive: boolean;
};

function toAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    username: row.username,
    role: row.role,
    mustChangePassword: row.mustChangePassword,
  };
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && err.code === "23505";
}

export class AuthService {
  private readonly now: () => Date;
  private readonly log = childLogger("service", "auth");

  constructor(private readonly deps: { db: Db; now?: () => Date }) {
    this.now = deps.now ?? (() => new Date());
  }

  // Login. Galat untuk username salah, sandi salah, dan akun nonaktif sama (INVALID_CREDENTIALS).
  async login(input: { username: string; password: string; ip: string | null }) {
    const username = normalizeUsername(input.username);
    const now = this.now();
    const since = new Date(now.getTime() - WINDOW_MS);
    const repo = new AuthRepository(this.deps.db);

    const failuresForUser = await repo.countFailuresForUsername(username, since);
    const failuresForIp = input.ip
      ? await repo.countFailuresForIp(input.ip, since)
      : 0;
    if (
      failuresForUser >= MAX_FAILURES_PER_USERNAME ||
      failuresForIp >= MAX_FAILURES_PER_IP
    ) {
      // Percobaan yang diblokir tidak dicatat, supaya blokir tidak memanjang sendiri.
      this.log.warn({ username, ip: input.ip }, "login diblokir: terlalu banyak percobaan gagal");
      throw new RateLimitedError();
    }

    const user = await repo.findUserByUsername(username);
    // Verifikasi tetap dijalankan walau pengguna tidak ada, supaya waktu respons sama.
    const hashToCheck = user?.passwordHash ?? (await dummyHash());
    const passwordOk = await verifyPassword(input.password, hashToCheck);
    const ok = user !== null && user.isActive && passwordOk;

    await repo.recordAttempt({ username, ip: input.ip, success: ok });
    if (!ok || user === null) {
      this.log.info({ username, ip: input.ip }, "login gagal");
      throw new UnauthorizedError("INVALID_CREDENTIALS");
    }

    if (needsRehash(user.passwordHash)) {
      await repo.setPasswordHash(
        user.id,
        await hashPassword(input.password),
        user.mustChangePassword,
      );
    }

    // Pembersihan oportunistik, bukan cron (BR-18).
    await repo.deleteExpiredSessionsForUser(user.id, now);
    await repo.deleteAttemptsBefore(new Date(now.getTime() - ATTEMPT_RETENTION_MS));

    const token = newToken();
    const session = await repo.createSession({
      userId: user.id,
      organizationId: user.organizationId,
      tokenHash: hashToken(token),
      createdAt: now,
      lastUsedAt: now,
      expiresAt: sessionExpiry(now, now),
    });

    this.log.info({ userId: user.id, organizationId: user.organizationId }, "login berhasil");
    return { token, expiresAt: session.expiresAt, user: toAuthUser(user) };
  }

  async logout(token: string | undefined): Promise<void> {
    if (!token) return;
    await new AuthRepository(this.deps.db).deleteSessionByTokenHash(hashToken(token));
  }

  // Memeriksa token dari cookie. Mengembalikan null bila tidak valid, kedaluwarsa, atau pengguna nonaktif.
  async resolveSession(token: string | undefined): Promise<SessionContext | null> {
    if (!token) return null;
    const repo = new AuthRepository(this.deps.db);
    const row = await repo.findSessionByTokenHash(hashToken(token));
    if (!row) return null;

    const now = this.now();
    if (row.session.expiresAt <= now || !row.user.isActive) return null;

    if (now.getTime() - row.session.lastUsedAt.getTime() >= TOUCH_INTERVAL_MS) {
      await repo.touchSession(row.session.id, now, sessionExpiry(now, row.session.createdAt));
    }

    const user = toAuthUser(row.user);
    const propertyIds =
      user.role === "OWNER"
        ? ("ALL" as const)
        : await repo.findPropertyIdsForUser(user.id);

    return {
      sessionId: row.session.id,
      user,
      scope: {
        organizationId: user.organizationId,
        userId: user.id,
        role: user.role,
        propertyIds,
      },
    };
  }

  // Ubah sandi sendiri. Semua sesi dicabut dan satu sesi baru diterbitkan (TECH-SPEC 3.4).
  async changePassword(
    ctx: SessionContext,
    input: { currentPassword: string; newPassword: string },
  ): Promise<{ token: string; expiresAt: Date }> {
    const repo = new AuthRepository(this.deps.db);
    const user = await repo.findUserById(ctx.user.id);
    if (!user) throw new UnauthorizedError();

    if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
      throw new ForbiddenError("WRONG_CURRENT_PASSWORD");
    }
    if (input.newPassword.toLowerCase() === user.username) {
      throw new BusinessRuleError("PASSWORD_SAME_AS_USERNAME");
    }

    const newHash = await hashPassword(input.newPassword);
    const now = this.now();
    const token = newToken();
    const expiresAt = sessionExpiry(now, now);

    await this.deps.db.transaction(async (tx) => {
      const t = new AuthRepository(tx);
      await t.setPasswordHash(user.id, newHash, false);
      await t.deleteSessionsForUser(user.id);
      await t.createSession({
        userId: user.id,
        organizationId: user.organizationId,
        tokenHash: hashToken(token),
        createdAt: now,
        lastUsedAt: now,
        expiresAt,
      });
    });

    return { token, expiresAt };
  }

  // Reset sandi oleh owner (untuk pengelola) atau skrip server (scope sistem).
  // Sandi sementara ditampilkan sekali oleh pemanggil dan tidak pernah masuk log atau audit.
  async resetPassword(
    actor: Scope,
    targetUserId: number,
  ): Promise<{ temporaryPassword: string }> {
    const repo = new AuthRepository(this.deps.db);
    const target = await repo.findUserById(targetUserId);
    if (!target || target.organizationId !== actor.organizationId) {
      throw new NotFoundError("USER_NOT_FOUND");
    }
    // Owner hanya mereset pengelola. Sandi owner direset lewat skrip (FR-AUTH-05).
    if (actor.userId !== null && (actor.role !== "OWNER" || target.role === "OWNER")) {
      throw new ForbiddenError();
    }

    const temporaryPassword = generateTemporaryPassword();
    const hash = await hashPassword(temporaryPassword);

    await this.deps.db.transaction(async (tx) => {
      const t = new AuthRepository(tx);
      await t.setPasswordHash(target.id, hash, true);
      await t.deleteSessionsForUser(target.id);
      await AuditService.record(tx, actor, {
        entityType: "user",
        entityId: target.id,
        action: "UPDATE",
        after: { passwordReset: true },
      });
    });

    this.log.info({ userId: target.id, organizationId: target.organizationId }, "kata sandi direset");
    return { temporaryPassword };
  }

  // Reset sandi owner lewat skrip (yarn reset-password). Organisasi dicari dari username.
  async resetPasswordByUsername(
    username: string,
  ): Promise<{ temporaryPassword: string; userId: number }> {
    const user = await new AuthRepository(this.deps.db).findUserByUsername(
      normalizeUsername(username),
    );
    if (!user) throw new NotFoundError("USER_NOT_FOUND");
    const result = await this.resetPassword(systemScope(user.organizationId), user.id);
    return { ...result, userId: user.id };
  }

  // Dipakai saat pengguna dinonaktifkan (FR-AUTH-07).
  async revokeSessionsForUser(userId: number): Promise<void> {
    await new AuthRepository(this.deps.db).deleteSessionsForUser(userId);
  }

  // Membuat organisasi dan akun owner pertama (skrip create-owner).
  async createOwner(input: {
    organizationName: string;
    name: string;
    username: string;
    password: string;
  }): Promise<{ organizationId: number; userId: number }> {
    const username = normalizeUsername(input.username);
    const repo = new AuthRepository(this.deps.db);
    if (await repo.findUserByUsername(username)) {
      throw new ConflictError("USERNAME_TAKEN");
    }
    const passwordHash = await hashPassword(input.password);

    try {
      return await this.deps.db.transaction(async (tx) => {
        const t = new AuthRepository(tx);
        const org = await t.insertOrganization(input.organizationName);
        const user = await t.insertUser({
          organizationId: org.id,
          name: input.name,
          username,
          role: "OWNER",
          passwordHash,
          mustChangePassword: false,
        });
        await AuditService.record(
          tx,
          systemScope(org.id),
          { entityType: "user", entityId: user.id, action: "CREATE", after: { username, role: "OWNER" } },
        );
        return { organizationId: org.id, userId: user.id };
      });
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictError("USERNAME_TAKEN");
      throw err;
    }
  }
}
