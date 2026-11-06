import type { AuthService } from "@/server/auth/auth.service";
import { AuthRepository } from "@/server/auth/auth.repository";
import { hashPassword } from "@/server/auth/password";
import type { Db } from "@/server/db/client";
import { ConflictError, ForbiddenError, NotFoundError } from "@/server/errors";
import { PropertyRepository } from "@/server/repositories/property.repository";
import { UserRepository, type UserRow } from "@/server/repositories/user.repository";
import type { Scope } from "@/server/scope";
import { AuditService } from "./audit.service";

type CreateUserInput = {
  name: string;
  username: string;
  phone?: string;
  password: string;
  propertyIds: number[];
};

function requireOwner(scope: Scope): void {
  if (scope.role !== "OWNER") throw new ForbiddenError();
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && err.code === "23505";
}

// Pengelolaan akun pengelola oleh owner (FR-AUTH-03, FR-AUTH-05, FR-AUTH-07).
export class UserService {
  constructor(private readonly deps: { db: Db; auth: AuthService }) {}

  async list(scope: Scope) {
    requireOwner(scope);
    const repo = new UserRepository(this.deps.db, scope);
    const rows = await repo.list();
    const access = await repo.listAccessByUser(rows.map((r) => r.id));
    return rows.map((row) => toView(row, access.get(row.id) ?? []));
  }

  async create(scope: Scope, input: CreateUserInput) {
    requireOwner(scope);
    const username = input.username;

    // Username unik di seluruh sistem (TECH-SPEC 3.4).
    if (await new AuthRepository(this.deps.db).findUserByUsername(username)) {
      throw new ConflictError("USERNAME_TAKEN");
    }

    await this.assertPropertiesOwned(scope, input.propertyIds);
    const passwordHash = await hashPassword(input.password);

    try {
      return await this.deps.db.transaction(async (tx) => {
        const users = new UserRepository(tx, scope);
        const row = await users.insert({
          name: input.name,
          username,
          phone: input.phone ?? null,
          role: "MANAGER",
          passwordHash,
          mustChangePassword: true,
        });
        await users.replacePropertyAccess(row.id, input.propertyIds);
        await AuditService.record(tx, scope, {
          entityType: "user",
          entityId: row.id,
          action: "CREATE",
          after: { username, role: "MANAGER", propertyIds: input.propertyIds },
        });
        return toView(row, input.propertyIds);
      });
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictError("USERNAME_TAKEN");
      throw err;
    }
  }

  async setActive(scope: Scope, userId: number, isActive: boolean) {
    requireOwner(scope);
    const target = await this.findManager(scope, userId);

    return this.deps.db.transaction(async (tx) => {
      await new UserRepository(tx, scope).setActive(target.id, isActive);
      // Menonaktifkan pengguna mengakhiri semua sesinya (FR-AUTH-07).
      if (!isActive) await new AuthRepository(tx).deleteSessionsForUser(target.id);
      await AuditService.record(tx, scope, {
        entityType: "user",
        entityId: target.id,
        action: "UPDATE",
        before: { isActive: target.isActive },
        after: { isActive },
      });
      return { id: target.id, isActive };
    });
  }

  async setPropertyAccess(scope: Scope, userId: number, propertyIds: number[]) {
    requireOwner(scope);
    const target = await this.findManager(scope, userId);
    await this.assertPropertiesOwned(scope, propertyIds);

    return this.deps.db.transaction(async (tx) => {
      const users = new UserRepository(tx, scope);
      const before = await users.listPropertyIds(target.id);
      await users.replacePropertyAccess(target.id, propertyIds);
      await AuditService.record(tx, scope, {
        entityType: "user",
        entityId: target.id,
        action: "UPDATE",
        before: { propertyIds: before },
        after: { propertyIds },
      });
      return { id: target.id, propertyIds };
    });
  }

  // Reset sandi pengelola. Sandi sementara dikembalikan sekali ke owner (FR-AUTH-05).
  async resetPassword(scope: Scope, userId: number) {
    requireOwner(scope);
    await this.findManager(scope, userId);
    return this.deps.auth.resetPassword(scope, userId);
  }

  private async findManager(scope: Scope, userId: number): Promise<UserRow> {
    const target = await new UserRepository(this.deps.db, scope).findById(userId);
    if (!target) throw new NotFoundError("USER_NOT_FOUND");
    // Owner hanya mengelola pengelola, tidak mengelola owner lain atau dirinya sendiri.
    if (target.role !== "MANAGER") throw new ForbiddenError("TARGET_NOT_MANAGER");
    return target;
  }

  // Semua properti yang dipilih harus milik organisasi pemanggil.
  private async assertPropertiesOwned(scope: Scope, propertyIds: number[]): Promise<void> {
    if (propertyIds.length === 0) return;
    const owned = new Set(
      (await new PropertyRepository(this.deps.db, scope).list()).map((p) => p.id),
    );
    if (propertyIds.some((id) => !owned.has(id))) {
      throw new NotFoundError("PROPERTY_NOT_FOUND");
    }
  }
}

function toView(row: UserRow, propertyIds: number[]) {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    phone: row.phone,
    role: row.role,
    isActive: row.isActive,
    mustChangePassword: row.mustChangePassword,
    propertyIds,
  };
}
