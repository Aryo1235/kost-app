import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { authService, type SessionContext } from "@/server/auth";
import { hashPassword } from "@/server/auth/password";
import { db } from "@/server/db/client";
import {
  auditLogs,
  organizations,
  properties,
  propertyAccess,
  users,
} from "@/server/db/schema";
import { DomainError } from "@/server/errors";
import { appRouter } from "@/server/trpc/root";
import { resetDb } from "../../helpers/db";

const PASSWORD = "kata-sandi-benar-123";

// Panggilan lewat createCaller memakai prosedur yang sama dengan HTTP, tanpa server.
const caller = (session: SessionContext | null) =>
  appRouter.createCaller({ requestId: "test-request", session });

async function sessionFor(username: string): Promise<{ ctx: SessionContext; token: string }> {
  const { token } = await authService.login({ username, password: PASSWORD, ip: null });
  const ctx = await authService.resolveSession(token);
  if (!ctx) throw new Error("sesi tidak terbentuk");
  return { ctx, token };
}

// Mengembalikan kode tRPC, pesan, dan kode domain. Melempar bila tidak ada galat.
async function errOf(p: Promise<unknown>) {
  try {
    await p;
  } catch (err) {
    if (err instanceof TRPCError) {
      return {
        code: err.code,
        message: err.message,
        domain: err.cause instanceof DomainError ? err.cause.code : null,
      };
    }
    throw err;
  }
  throw new Error("diharapkan galat, tetapi berhasil");
}

async function seedOrg(name: string) {
  const [row] = await db.insert(organizations).values({ name }).returning();
  return row.id;
}

async function seedUser(opts: {
  orgId: number;
  username: string;
  role?: "OWNER" | "MANAGER";
  mustChange?: boolean;
}) {
  const [row] = await db
    .insert(users)
    .values({
      organizationId: opts.orgId,
      name: opts.username,
      username: opts.username,
      role: opts.role ?? "OWNER",
      passwordHash: await hashPassword(PASSWORD),
      mustChangePassword: opts.mustChange ?? false,
    })
    .returning();
  return row;
}

async function seedProperty(orgId: number, name: string) {
  const [row] = await db
    .insert(properties)
    .values({ organizationId: orgId, name, address: `Alamat ${name}` })
    .returning();
  return row.id;
}

type Seed = {
  orgA: number;
  orgB: number;
  ownerA: number;
  managerA: number;
  propA1: number;
  propA2: number;
  propB1: number;
};

let s: Seed;

beforeEach(async () => {
  await resetDb();
  const orgA = await seedOrg("Kost A");
  const orgB = await seedOrg("Kost B");
  const ownerA = await seedUser({ orgId: orgA, username: "owner.a" });
  const managerA = await seedUser({ orgId: orgA, username: "pengelola.a", role: "MANAGER" });
  await seedUser({ orgId: orgB, username: "owner.b" });
  const propA1 = await seedProperty(orgA, "Melati");
  const propA2 = await seedProperty(orgA, "Mawar");
  const propB1 = await seedProperty(orgB, "Anggrek");
  await db.insert(propertyAccess).values({ organizationId: orgA, userId: managerA.id, propertyId: propA1 });
  s = { orgA, orgB, ownerA: ownerA.id, managerA: managerA.id, propA1, propA2, propB1 };
});

describe("isolasi lewat API", () => {
  it("owner A hanya melihat propertinya sendiri", async () => {
    const { ctx } = await sessionFor("owner.a");
    const rows = await caller(ctx).property.list();
    expect(rows.map((r) => r.id).sort()).toEqual([s.propA1, s.propA2].sort());
  });

  it("owner A dengan ID milik organisasi B ditolak NOT_FOUND (baca)", async () => {
    const { ctx } = await sessionFor("owner.a");
    expect(await errOf(caller(ctx).property.get({ propertyId: s.propB1 }))).toEqual({
      code: "NOT_FOUND",
      message: "PROPERTY_NOT_FOUND",
      domain: "PROPERTY_NOT_FOUND",
    });
  });

  it("owner A dengan ID milik organisasi B ditolak NOT_FOUND (ubah)", async () => {
    const { ctx } = await sessionFor("owner.a");
    expect(
      await errOf(caller(ctx).property.update({ propertyId: s.propB1, name: "Diubah" })),
    ).toMatchObject({ code: "NOT_FOUND" });
  });

  it("owner membuat properti: satu baris audit CREATE tercatat dengan aktor dari sesi", async () => {
    const { ctx } = await sessionFor("owner.a");
    const created = await caller(ctx).property.create({ name: "Baru", address: "Jl. Baru 1" });
    expect(created.organizationId).toBe(s.orgA);

    const audit = await db.select().from(auditLogs);
    const create = audit.filter((a) => a.action === "CREATE" && a.entityType === "property");
    expect(create).toHaveLength(1);
    expect(create[0].actorId).toBe(s.ownerA);
    expect(create[0].organizationId).toBe(s.orgA);
  });
});

describe("akses per properti dan peran", () => {
  it("pengelola hanya melihat properti yang ditugaskan", async () => {
    const { ctx } = await sessionFor("pengelola.a");
    const rows = await caller(ctx).property.list();
    expect(rows.map((r) => r.id)).toEqual([s.propA1]);
  });

  it("pengelola ke properti lain di organisasi yang sama ditolak FORBIDDEN", async () => {
    const { ctx } = await sessionFor("pengelola.a");
    expect(await errOf(caller(ctx).property.get({ propertyId: s.propA2 }))).toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("pengelola memanggil prosedur khusus owner ditolak FORBIDDEN", async () => {
    const { ctx } = await sessionFor("pengelola.a");
    expect(
      await errOf(caller(ctx).property.create({ name: "X", address: "Y" })),
    ).toMatchObject({ code: "FORBIDDEN" });
    expect(await errOf(caller(ctx).user.list())).toMatchObject({ code: "FORBIDDEN" });
  });

  it("tanpa sesi ditolak UNAUTHORIZED", async () => {
    expect(await errOf(caller(null).property.list())).toMatchObject({ code: "UNAUTHORIZED" });
  });
});

describe("wajib ganti sandi awal", () => {
  it("auth.me tetap boleh, prosedur lain ditolak PASSWORD_CHANGE_REQUIRED", async () => {
    const orgId = await seedOrg("Kost Baru");
    await seedUser({ orgId, username: "owner.baru", mustChange: true });
    const { ctx } = await sessionFor("owner.baru");

    const me = await caller(ctx).auth.me();
    expect(me.mustChangePassword).toBe(true);

    expect(await errOf(caller(ctx).property.list())).toEqual({
      code: "FORBIDDEN",
      message: "PASSWORD_CHANGE_REQUIRED",
      domain: "PASSWORD_CHANGE_REQUIRED",
    });
  });
});

describe("kelola pengelola oleh owner", () => {
  it("owner membuat pengelola: wajib ganti sandi, akses properti tersimpan, audit CREATE", async () => {
    const { ctx } = await sessionFor("owner.a");
    const created = await caller(ctx).user.create({
      name: "Pengelola Baru",
      username: "pengelola.baru",
      password: PASSWORD,
      propertyIds: [s.propA2],
    });
    expect(created.mustChangePassword).toBe(true);
    expect(created.propertyIds).toEqual([s.propA2]);

    const access = await db.select().from(propertyAccess);
    expect(access.map((a) => a.propertyId).sort()).toEqual([s.propA1, s.propA2].sort());

    const audit = await db.select().from(auditLogs);
    expect(audit.some((a) => a.action === "CREATE" && a.entityType === "user")).toBe(true);
  });

  it("username yang sudah dipakai ditolak CONFLICT", async () => {
    const { ctx } = await sessionFor("owner.a");
    expect(
      await errOf(
        caller(ctx).user.create({ name: "X", username: "pengelola.a", password: PASSWORD, propertyIds: [] }),
      ),
    ).toMatchObject({ code: "CONFLICT", message: "USERNAME_TAKEN" });
  });

  it("memberi akses ke properti organisasi lain ditolak NOT_FOUND", async () => {
    const { ctx } = await sessionFor("owner.a");
    expect(
      await errOf(
        caller(ctx).user.create({ name: "X", username: "pengelola.x", password: PASSWORD, propertyIds: [s.propB1] }),
      ),
    ).toMatchObject({ code: "NOT_FOUND", message: "PROPERTY_NOT_FOUND" });
  });

  it("menonaktifkan pengelola langsung mencabut sesinya dan login ditolak", async () => {
    const manager = await sessionFor("pengelola.a");
    const owner = await sessionFor("owner.a");

    await caller(owner.ctx).user.setActive({ userId: s.managerA, isActive: false });

    expect(await authService.resolveSession(manager.token)).toBeNull();
    await expect(
      authService.login({ username: "pengelola.a", password: PASSWORD, ip: null }),
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  it("reset sandi pengelola: sesi lama dicabut dan sandi sementara wajib diganti saat masuk", async () => {
    const manager = await sessionFor("pengelola.a");
    const owner = await sessionFor("owner.a");

    const { temporaryPassword } = await caller(owner.ctx).user.resetPassword({ userId: s.managerA });
    expect(await authService.resolveSession(manager.token)).toBeNull();

    const relogin = await authService.login({
      username: "pengelola.a",
      password: temporaryPassword,
      ip: null,
    });
    expect(relogin.user.mustChangePassword).toBe(true);
  });

  it("owner tidak bisa mengelola owner lain di organisasinya", async () => {
    await seedUser({ orgId: s.orgA, username: "owner.kedua" });
    const owner = await sessionFor("owner.a");
    const [other] = await db.select().from(users).where(eq(users.username, "owner.kedua"));

    expect(
      await errOf(caller(owner.ctx).user.setActive({ userId: other.id, isActive: false })),
    ).toMatchObject({ code: "FORBIDDEN", message: "TARGET_NOT_MANAGER" });
  });

  it("owner A tidak bisa mengelola pengelola organisasi B", async () => {
    const managerB = await seedUser({ orgId: s.orgB, username: "pengelola.b", role: "MANAGER" });
    const owner = await sessionFor("owner.a");

    expect(
      await errOf(caller(owner.ctx).user.setPropertyAccess({ userId: managerB.id, propertyIds: [] })),
    ).toMatchObject({ code: "NOT_FOUND", message: "USER_NOT_FOUND" });
  });

  it("ubah akses properti pengelola: login berikutnya hanya melihat properti baru", async () => {
    const owner = await sessionFor("owner.a");
    await caller(owner.ctx).user.setPropertyAccess({ userId: s.managerA, propertyIds: [s.propA2] });

    const manager = await sessionFor("pengelola.a");
    const rows = await caller(manager.ctx).property.list();
    expect(rows.map((r) => r.id)).toEqual([s.propA2]);
  });
});

describe("ubah properti", () => {
  it("owner mengubah properti: audit UPDATE menyimpan nilai sebelum dan sesudah", async () => {
    const { ctx } = await sessionFor("owner.a");
    await caller(ctx).property.update({ propertyId: s.propA1, name: "Melati Baru" });

    const audit = await db.select().from(auditLogs);
    const update = audit.find((a) => a.action === "UPDATE" && a.entityType === "property");
    expect(update).toBeDefined();
    expect(update!.beforeJson).toMatchObject({ name: "Melati" });
    expect(update!.afterJson).toMatchObject({ name: "Melati Baru" });
  });
});
