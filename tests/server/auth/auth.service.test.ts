import { randomBytes, scryptSync } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthService } from "@/server/auth/auth.service";
import { hashPassword } from "@/server/auth/password";
import { hashToken } from "@/server/auth/session";
import { db } from "@/server/db/client";
import { auditLogs, organizations, sessions, users } from "@/server/db/schema";
import { DomainError } from "@/server/errors";
import type { Scope } from "@/server/scope";
import { resetDb } from "../../helpers/db";

const DAY = 24 * 60 * 60 * 1000;
const PASSWORD = "kata-sandi-benar-123";

let clock: Date;
const svc = () => new AuthService({ db, now: () => clock });

async function codeOf(p: Promise<unknown>): Promise<{ code: string; status: number }> {
  try {
    await p;
  } catch (err) {
    if (err instanceof DomainError) return { code: err.code, status: err.status };
    throw err;
  }
  throw new Error("diharapkan galat, tetapi berhasil");
}

async function seedOrg(name: string): Promise<number> {
  const [row] = await db.insert(organizations).values({ name }).returning();
  return row.id;
}

async function seedUser(opts: {
  orgId: number;
  username: string;
  role?: "OWNER" | "MANAGER";
  password?: string;
  active?: boolean;
  mustChange?: boolean;
}) {
  const [row] = await db
    .insert(users)
    .values({
      organizationId: opts.orgId,
      name: opts.username,
      username: opts.username,
      role: opts.role ?? "OWNER",
      passwordHash: await hashPassword(opts.password ?? PASSWORD),
      isActive: opts.active ?? true,
      mustChangePassword: opts.mustChange ?? false,
    })
    .returning();
  return row;
}

beforeEach(async () => {
  await resetDb();
  clock = new Date("2026-11-06T02:00:00Z");
});

describe("login", () => {
  it("berhasil dan token hanya tersimpan sebagai hash", async () => {
    const orgId = await seedOrg("Kost A");
    await seedUser({ orgId, username: "owner.a" });

    const result = await svc().login({ username: "  OWNER.A ", password: PASSWORD, ip: "10.0.0.1" });
    const rows = await db.select().from(sessions);

    expect(rows).toHaveLength(1);
    expect(rows[0].tokenHash).toBe(hashToken(result.token));
    expect(rows[0].tokenHash).not.toBe(result.token);
    expect(JSON.stringify(rows)).not.toContain(result.token);
  });

  it("username salah, sandi salah, dan akun nonaktif menghasilkan galat yang sama", async () => {
    const orgId = await seedOrg("Kost A");
    await seedUser({ orgId, username: "owner.a" });
    await seedUser({ orgId, username: "nonaktif.a", active: false });

    const unknown = await codeOf(svc().login({ username: "tidak.ada", password: PASSWORD, ip: null }));
    const wrong = await codeOf(svc().login({ username: "owner.a", password: "sandi-salah-123", ip: null }));
    const inactive = await codeOf(svc().login({ username: "nonaktif.a", password: PASSWORD, ip: null }));

    expect(unknown).toEqual({ code: "INVALID_CREDENTIALS", status: 401 });
    expect(wrong).toEqual(unknown);
    expect(inactive).toEqual(unknown);
  });

  it("5 gagal untuk satu username memblokir percobaan berikutnya, termasuk sandi yang benar", async () => {
    const orgId = await seedOrg("Kost A");
    await seedUser({ orgId, username: "owner.a" });

    for (let i = 0; i < 5; i++) {
      await codeOf(svc().login({ username: "owner.a", password: "sandi-salah-123", ip: "10.0.0.2" }));
    }
    const blocked = await codeOf(svc().login({ username: "owner.a", password: PASSWORD, ip: "10.0.0.2" }));
    expect(blocked).toEqual({ code: "RATE_LIMITED", status: 429 });
  });

  it("20 gagal dari satu IP memblokir IP itu, IP lain tetap bisa masuk", async () => {
    const orgId = await seedOrg("Kost A");
    await seedUser({ orgId, username: "owner.a" });

    for (let i = 0; i < 20; i++) {
      await codeOf(svc().login({ username: `tebakan${i}`, password: "sandi-salah-123", ip: "10.0.0.3" }));
    }
    expect(
      await codeOf(svc().login({ username: "owner.a", password: PASSWORD, ip: "10.0.0.3" })),
    ).toEqual({ code: "RATE_LIMITED", status: 429 });

    const ok = await svc().login({ username: "owner.a", password: PASSWORD, ip: "10.0.0.4" });
    expect(ok.token).toBeTruthy();
  });

  it("hash lama dengan parameter lebih lemah diperbarui setelah login berhasil", async () => {
    const orgId = await seedOrg("Kost A");
    const salt = randomBytes(16);
    const weakHash = [
      "scrypt",
      16384,
      8,
      3,
      salt.toString("base64url"),
      scryptSync(PASSWORD, salt, 64, { N: 16384, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }).toString("base64url"),
    ].join("$");
    await db.insert(users).values({
      organizationId: orgId,
      name: "Owner Lama",
      username: "owner.lama",
      role: "OWNER",
      passwordHash: weakHash,
    });

    await svc().login({ username: "owner.lama", password: PASSWORD, ip: null });
    const [row] = await db.select().from(users);
    expect(row.passwordHash.startsWith("scrypt$32768$8$3$")).toBe(true);
  });
});

describe("sesi", () => {
  it("sesi habis setelah 14 hari tanpa dipakai", async () => {
    const orgId = await seedOrg("Kost A");
    await seedUser({ orgId, username: "owner.a" });
    const { token } = await svc().login({ username: "owner.a", password: PASSWORD, ip: null });

    clock = new Date(clock.getTime() + 13 * DAY);
    expect(await svc().resolveSession(token)).not.toBeNull();

    clock = new Date(clock.getTime() + 15 * DAY);
    expect(await svc().resolveSession(token)).toBeNull();
  });

  it("sesi habis paling lama 60 hari sejak dibuat, walau terus dipakai", async () => {
    const orgId = await seedOrg("Kost A");
    await seedUser({ orgId, username: "owner.a" });
    const { token } = await svc().login({ username: "owner.a", password: PASSWORD, ip: null });

    for (const day of [10, 20, 30, 40, 50]) {
      clock = new Date(clock.getTime() + 10 * DAY);
      expect(await svc().resolveSession(token), `hari ${day}`).not.toBeNull();
    }
    clock = new Date(clock.getTime() + 11 * DAY); // hari 61
    expect(await svc().resolveSession(token)).toBeNull();
  });

  it("logout mencabut sesi", async () => {
    const orgId = await seedOrg("Kost A");
    await seedUser({ orgId, username: "owner.a" });
    const { token } = await svc().login({ username: "owner.a", password: PASSWORD, ip: null });

    await svc().logout(token);
    expect(await svc().resolveSession(token)).toBeNull();
  });

  it("menonaktifkan pengguna mencabut sesinya", async () => {
    const orgId = await seedOrg("Kost A");
    const user = await seedUser({ orgId, username: "owner.a" });
    const { token } = await svc().login({ username: "owner.a", password: PASSWORD, ip: null });

    await svc().revokeSessionsForUser(user.id);
    expect(await svc().resolveSession(token)).toBeNull();
    expect(await db.select().from(sessions)).toHaveLength(0);
  });

  it("tanpa token tidak ada sesi", async () => {
    expect(await svc().resolveSession(undefined)).toBeNull();
  });
});

describe("ubah kata sandi sendiri", () => {
  it("sandi lama yang salah ditolak", async () => {
    const orgId = await seedOrg("Kost A");
    await seedUser({ orgId, username: "owner.a" });
    const { token } = await svc().login({ username: "owner.a", password: PASSWORD, ip: null });
    const ctx = (await svc().resolveSession(token))!;

    const err = await codeOf(
      svc().changePassword(ctx, { currentPassword: "salah-sekali-123", newPassword: "kata-sandi-baru-1" }),
    );
    expect(err).toEqual({ code: "WRONG_CURRENT_PASSWORD", status: 403 });
  });

  it("sandi baru sama dengan username ditolak", async () => {
    const orgId = await seedOrg("Kost A");
    await seedUser({ orgId, username: "owner.a" });
    const { token } = await svc().login({ username: "owner.a", password: PASSWORD, ip: null });
    const ctx = (await svc().resolveSession(token))!;

    const err = await codeOf(
      svc().changePassword(ctx, { currentPassword: PASSWORD, newPassword: "OWNER.A" }),
    );
    expect(err).toEqual({ code: "PASSWORD_SAME_AS_USERNAME", status: 422 });
  });

  it("berhasil: sesi lain dicabut, token baru berlaku, wajib ganti sandi dimatikan", async () => {
    const orgId = await seedOrg("Kost A");
    await seedUser({ orgId, username: "owner.a", mustChange: true });
    const first = await svc().login({ username: "owner.a", password: PASSWORD, ip: null });
    const second = await svc().login({ username: "owner.a", password: PASSWORD, ip: null });
    const ctx = (await svc().resolveSession(first.token))!;

    const fresh = await svc().changePassword(ctx, {
      currentPassword: PASSWORD,
      newPassword: "kata-sandi-baru-1",
    });

    expect(await svc().resolveSession(first.token)).toBeNull();
    expect(await svc().resolveSession(second.token)).toBeNull();
    expect(await svc().resolveSession(fresh.token)).not.toBeNull();

    const [row] = await db.select().from(users);
    expect(row.mustChangePassword).toBe(false);

    const again = await svc().login({ username: "owner.a", password: "kata-sandi-baru-1", ip: null });
    expect(again.user.mustChangePassword).toBe(false);
  });
});

describe("reset kata sandi", () => {
  async function setupOrgWithOwnerAndManager() {
    const orgA = await seedOrg("Kost A");
    const orgB = await seedOrg("Kost B");
    const owner = await seedUser({ orgId: orgA, username: "owner.a" });
    const manager = await seedUser({ orgId: orgA, username: "pengelola.a", role: "MANAGER" });
    const ownerB = await seedUser({ orgId: orgB, username: "owner.b" });
    const ownerScope: Scope = { organizationId: orgA, userId: owner.id, role: "OWNER", propertyIds: "ALL" };
    return { orgA, orgB, owner, manager, ownerB, ownerScope };
  }

  it("owner mereset pengelola: sandi sementara, wajib ganti, sesi dicabut, audit tanpa sandi", async () => {
    const { manager, ownerScope } = await setupOrgWithOwnerAndManager();
    const { token } = await svc().login({ username: "pengelola.a", password: PASSWORD, ip: null });

    const { temporaryPassword } = await svc().resetPassword(ownerScope, manager.id);

    expect(await svc().resolveSession(token)).toBeNull();
    const again = await svc().login({ username: "pengelola.a", password: temporaryPassword, ip: null });
    expect(again.user.mustChangePassword).toBe(true);

    const audit = await db.select().from(auditLogs);
    expect(audit).toHaveLength(1);
    expect(audit[0].action).toBe("UPDATE");
    expect(audit[0].actorId).toBe(ownerScope.userId);
    expect(JSON.stringify(audit)).not.toContain(temporaryPassword);
  });

  it("owner tidak bisa mereset owner lain di organisasinya", async () => {
    const { orgA, ownerScope } = await setupOrgWithOwnerAndManager();
    const other = await seedUser({ orgId: orgA, username: "owner.kedua" });
    expect(await codeOf(svc().resetPassword(ownerScope, other.id))).toEqual({
      code: "FORBIDDEN",
      status: 403,
    });
  });

  it("owner organisasi lain tidak bisa mereset pengelola ini", async () => {
    const { manager, ownerB } = await setupOrgWithOwnerAndManager();
    const scopeB: Scope = { organizationId: ownerB.organizationId, userId: ownerB.id, role: "OWNER", propertyIds: "ALL" };
    expect(await codeOf(svc().resetPassword(scopeB, manager.id))).toEqual({
      code: "USER_NOT_FOUND",
      status: 404,
    });
  });

  it("pengelola tidak bisa mereset siapa pun", async () => {
    const { manager, owner, ownerScope } = await setupOrgWithOwnerAndManager();
    const managerScope: Scope = { organizationId: ownerScope.organizationId, userId: manager.id, role: "MANAGER", propertyIds: [] };
    expect(await codeOf(svc().resetPassword(managerScope, owner.id))).toEqual({
      code: "FORBIDDEN",
      status: 403,
    });
  });

  it("skrip reset untuk owner: sandi sementara dibuat, audit aktornya kosong", async () => {
    const { owner } = await setupOrgWithOwnerAndManager();
    const { temporaryPassword, userId } = await svc().resetPasswordByUsername("owner.a");

    expect(userId).toBe(owner.id);
    expect(temporaryPassword).toHaveLength(16);
    const audit = await db.select().from(auditLogs);
    expect(audit[0].actorId).toBeNull();
    expect(JSON.stringify(audit)).not.toContain(temporaryPassword);
  });
});

describe("pembuatan owner (skrip create-owner)", () => {
  it("membuat organisasi dan owner, audit CREATE tercatat tanpa sandi", async () => {
    const result = await svc().createOwner({
      organizationName: "Kost Melati",
      name: "Budi",
      username: "budi.owner",
      password: PASSWORD,
    });

    const [user] = await db.select().from(users);
    expect(user.id).toBe(result.userId);
    expect(user.role).toBe("OWNER");
    expect(user.passwordHash).not.toContain(PASSWORD);

    const audit = await db.select().from(auditLogs);
    expect(audit).toHaveLength(1);
    expect(audit[0].action).toBe("CREATE");
    expect(audit[0].actorId).toBeNull();
    expect(JSON.stringify(audit)).not.toContain(PASSWORD);
  });

  it("username yang sudah dipakai ditolak", async () => {
    await svc().createOwner({ organizationName: "A", name: "A", username: "budi.owner", password: PASSWORD });
    expect(
      await codeOf(
        svc().createOwner({ organizationName: "B", name: "B", username: "BUDI.OWNER", password: PASSWORD }),
      ),
    ).toEqual({ code: "USERNAME_TAKEN", status: 409 });
  });
});
