import { and, count, eq, gte, lt } from "drizzle-orm";
import {
  loginAttempts,
  organizations,
  propertyAccess,
  sessions,
  users,
} from "@/server/db/schema";
import type { DbClient } from "@/server/repositories/base.repository";

// Satu-satunya repository yang boleh mencari pengguna lintas organisasi (TECH-SPEC 3.4).
// Organisasi belum diketahui sebelum login, jadi tidak memakai orgWhere.
export class AuthRepository {
  constructor(private readonly db: DbClient) {}

  async findUserByUsername(username: string) {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return row ?? null;
  }

  async findUserById(id: number) {
    const [row] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return row ?? null;
  }

  async insertOrganization(name: string) {
    const [row] = await this.db.insert(organizations).values({ name }).returning();
    return row;
  }

  async insertUser(values: {
    organizationId: number;
    name: string;
    username: string;
    phone?: string | null;
    role: "OWNER" | "MANAGER";
    passwordHash: string;
    mustChangePassword: boolean;
  }) {
    const [row] = await this.db.insert(users).values(values).returning();
    return row;
  }

  async setPasswordHash(userId: number, passwordHash: string, mustChangePassword: boolean) {
    await this.db
      .update(users)
      .set({ passwordHash, mustChangePassword })
      .where(eq(users.id, userId));
  }

  async recordAttempt(values: { username: string; ip: string | null; success: boolean }) {
    await this.db.insert(loginAttempts).values(values);
  }

  async countFailuresForUsername(username: string, since: Date): Promise<number> {
    const [row] = await this.db
      .select({ n: count() })
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.username, username),
          eq(loginAttempts.success, false),
          gte(loginAttempts.createdAt, since),
        ),
      );
    return Number(row?.n ?? 0);
  }

  async countFailuresForIp(ip: string, since: Date): Promise<number> {
    const [row] = await this.db
      .select({ n: count() })
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.ip, ip),
          eq(loginAttempts.success, false),
          gte(loginAttempts.createdAt, since),
        ),
      );
    return Number(row?.n ?? 0);
  }

  async createSession(values: {
    userId: number;
    organizationId: number;
    tokenHash: string;
    createdAt: Date;
    lastUsedAt: Date;
    expiresAt: Date;
  }) {
    const [row] = await this.db.insert(sessions).values(values).returning();
    return row;
  }

  async findSessionByTokenHash(tokenHash: string) {
    const [row] = await this.db
      .select({ session: sessions, user: users })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(eq(sessions.tokenHash, tokenHash))
      .limit(1);
    return row ?? null;
  }

  async touchSession(id: number, lastUsedAt: Date, expiresAt: Date) {
    await this.db
      .update(sessions)
      .set({ lastUsedAt, expiresAt })
      .where(eq(sessions.id, id));
  }

  async deleteSessionByTokenHash(tokenHash: string) {
    await this.db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }

  async deleteSessionsForUser(userId: number) {
    await this.db.delete(sessions).where(eq(sessions.userId, userId));
  }

  async deleteExpiredSessionsForUser(userId: number, now: Date) {
    await this.db
      .delete(sessions)
      .where(and(eq(sessions.userId, userId), lt(sessions.expiresAt, now)));
  }

  async deleteAttemptsBefore(before: Date) {
    await this.db.delete(loginAttempts).where(lt(loginAttempts.createdAt, before));
  }

  async findPropertyIdsForUser(userId: number): Promise<number[]> {
    const rows = await this.db
      .select({ propertyId: propertyAccess.propertyId })
      .from(propertyAccess)
      .where(eq(propertyAccess.userId, userId));
    return rows.map((r) => r.propertyId);
  }
}
