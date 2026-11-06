import { and, asc, eq, inArray } from "drizzle-orm";
import { propertyAccess, users } from "@/server/db/schema";
import { BaseRepository } from "./base.repository";

export type UserRow = typeof users.$inferSelect;

export class UserRepository extends BaseRepository {
  async list(): Promise<UserRow[]> {
    return this.db
      .select()
      .from(users)
      .where(this.orgWhere(users.organizationId))
      .orderBy(asc(users.id));
  }

  async findById(id: number): Promise<UserRow | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, id), this.orgWhere(users.organizationId)))
      .limit(1);
    return row ?? null;
  }

  async insert(values: {
    name: string;
    username: string;
    phone?: string | null;
    role: "OWNER" | "MANAGER";
    passwordHash: string;
    mustChangePassword: boolean;
  }): Promise<UserRow> {
    const [row] = await this.db.insert(users).values(this.withOrg(values)).returning();
    return row;
  }

  async setActive(id: number, isActive: boolean): Promise<void> {
    await this.db
      .update(users)
      .set({ isActive })
      .where(and(eq(users.id, id), this.orgWhere(users.organizationId)));
  }

  async listPropertyIds(userId: number): Promise<number[]> {
    const rows = await this.db
      .select({ propertyId: propertyAccess.propertyId })
      .from(propertyAccess)
      .where(
        and(
          eq(propertyAccess.userId, userId),
          this.orgWhere(propertyAccess.organizationId),
        ),
      )
      .orderBy(asc(propertyAccess.propertyId));
    return rows.map((r) => r.propertyId);
  }

  // Akses properti seluruh pengguna dalam organisasi, dikelompokkan per pengguna.
  async listAccessByUser(userIds: number[]): Promise<Map<number, number[]>> {
    const map = new Map<number, number[]>();
    if (userIds.length === 0) return map;
    const rows = await this.db
      .select({ userId: propertyAccess.userId, propertyId: propertyAccess.propertyId })
      .from(propertyAccess)
      .where(
        and(
          inArray(propertyAccess.userId, userIds),
          this.orgWhere(propertyAccess.organizationId),
        ),
      );
    for (const r of rows) {
      const list = map.get(r.userId) ?? [];
      list.push(r.propertyId);
      map.set(r.userId, list);
    }
    return map;
  }

  // Mengganti seluruh akses properti satu pengguna. Dipanggil di dalam transaksi service.
  async replacePropertyAccess(userId: number, propertyIds: number[]): Promise<void> {
    await this.db
      .delete(propertyAccess)
      .where(
        and(
          eq(propertyAccess.userId, userId),
          this.orgWhere(propertyAccess.organizationId),
        ),
      );
    if (propertyIds.length === 0) return;
    await this.db.insert(propertyAccess).values(
      propertyIds.map((propertyId) =>
        this.withOrg({ userId, propertyId }),
      ),
    );
  }
}
