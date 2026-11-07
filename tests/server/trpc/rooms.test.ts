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
  rooms,
  users,
} from "@/server/db/schema";
import { DomainError } from "@/server/errors";
import { appRouter } from "@/server/trpc/root";
import { resetDb } from "../../helpers/db";

const PASSWORD = "kata-sandi-benar-123";

const caller = (session: SessionContext | null) =>
  appRouter.createCaller({ requestId: "test-request", session });

async function sessionFor(username: string): Promise<SessionContext> {
  const { token } = await authService.login({ username, password: PASSWORD, ip: null });
  const ctx = await authService.resolveSession(token);
  if (!ctx) throw new Error("sesi tidak terbentuk");
  return ctx;
}

// Kode tRPC, pesan, dan kode domain. Melempar bila tidak ada galat.
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

type Seed = {
  orgA: number;
  orgB: number;
  ownerAId: number;
  propA1: number;
  propA2: number;
  propB1: number;
  roomA1: number;
  roomB1: number;
};

let s: Seed;

beforeEach(async () => {
  await resetDb();
  const [a, b] = await db
    .insert(organizations)
    .values([{ name: "Kost A" }, { name: "Kost B" }])
    .returning();
  const [ownerA, managerA] = await db
    .insert(users)
    .values([
      { organizationId: a.id, name: "Owner A", username: "owner.a", role: "OWNER", passwordHash: await hashPassword(PASSWORD) },
      { organizationId: a.id, name: "Pengelola A", username: "pengelola.a", role: "MANAGER", passwordHash: await hashPassword(PASSWORD) },
      { organizationId: b.id, name: "Owner B", username: "owner.b", role: "OWNER", passwordHash: await hashPassword(PASSWORD) },
    ])
    .returning();
  const [p1, p2, pb] = await db
    .insert(properties)
    .values([
      { organizationId: a.id, name: "Melati", address: "Jl. 1", electricityManaged: true, electricityPattern: "B" },
      { organizationId: a.id, name: "Mawar", address: "Jl. 2" },
      { organizationId: b.id, name: "Anggrek", address: "Jl. 3" },
    ])
    .returning();
  await db.insert(propertyAccess).values({ organizationId: a.id, userId: managerA.id, propertyId: p1.id });
  const [r1] = await db
    .insert(rooms)
    .values({
      organizationId: a.id,
      propertyId: p1.id,
      code: "A-01",
      baseRentAmount: 1_000_000,
      status: "AVAILABLE",
    })
    .returning();
  const [rb1] = await db
    .insert(rooms)
    .values({
      organizationId: b.id,
      propertyId: pb.id,
      code: "B-01",
      baseRentAmount: 1_500_000,
      status: "AVAILABLE",
    })
    .returning();

  s = {
    orgA: a.id,
    orgB: b.id,
    ownerAId: ownerA.id,
    propA1: p1.id,
    propA2: p2.id,
    propB1: pb.id,
    roomA1: r1.id,
    roomB1: rb1.id,
  };
});

const room = (propertyId: number, code: string, extra: Record<string, unknown> = {}) => ({
  propertyId,
  code,
  baseRentAmount: 1_250_000,
  ...extra,
});

describe("kamar: pembuatan dan kode unik", () => {
  it("owner membuat kamar: audit CREATE tercatat dengan aktor dari sesi", async () => {
    const ctx = await sessionFor("owner.a");
    const created = await caller(ctx).room.create(room(s.propA1, "A-02"));
    expect(created.organizationId).toBe(s.orgA);

    const audit = await db.select().from(auditLogs).where(eq(auditLogs.entityType, "room"));
    expect(audit.some((a) => a.action === "CREATE" && a.actorId === s.ownerAId)).toBe(true);
  });

  it("kode sama di properti yang sama ditolak CONFLICT, termasuk beda huruf besar", async () => {
    const ctx = await sessionFor("owner.a");
    expect(await errOf(caller(ctx).room.create(room(s.propA1, "a-01")))).toMatchObject({
      code: "CONFLICT",
      message: "ROOM_CODE_TAKEN",
    });
  });

  it("kamar di properti nonaktif ditolak PROPERTY_INACTIVE", async () => {
    const ctx = await sessionFor("owner.a");
    await caller(ctx).property.setActive({ propertyId: s.propA1, isActive: false });
    expect(await errOf(caller(ctx).room.create(room(s.propA1, "A-09")))).toMatchObject({
      message: "PROPERTY_INACTIVE",
    });
  });

  it("status OCCUPIED tidak bisa diatur manual (FR-ROOM-03)", async () => {
    const ctx = await sessionFor("owner.a");
    expect(await errOf(caller(ctx).room.create(room(s.propA1, "A-05", { status: "OCCUPIED" })))).toMatchObject({
      message: "ROOM_STATUS_AUTOMATIC",
    });
  });

  it("kode yang dihapus bisa dipakai lagi", async () => {
    const ctx = await sessionFor("owner.a");
    await caller(ctx).room.remove({ roomId: s.roomA1 });
    const again = await caller(ctx).room.create(room(s.propA1, "A-01"));
    expect(again.code).toBe("A-01");
  });
});

describe("kamar: akses dan isolasi", () => {
  it("pengelola membuat kamar di properti yang ditugaskan", async () => {
    const ctx = await sessionFor("pengelola.a");
    const created = await caller(ctx).room.create(room(s.propA1, "A-03"));
    expect(created.propertyId).toBe(s.propA1);
  });

  it("pengelola membuat kamar di properti lain ditolak FORBIDDEN", async () => {
    const ctx = await sessionFor("pengelola.a");
    expect(await errOf(caller(ctx).room.create(room(s.propA2, "M-01")))).toMatchObject({ code: "FORBIDDEN" });
  });

  it("pengelola meminta daftar properti di luar tugasnya ditolak FORBIDDEN", async () => {
    const ctx = await sessionFor("pengelola.a");
    expect(await errOf(caller(ctx).room.list({ propertyId: s.propA2, page: 1, pageSize: 20 }))).toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("pengelola hanya melihat kamar di properti yang ditugaskan", async () => {
    const ctx = await sessionFor("pengelola.a");
    const { rows } = await caller(ctx).room.list({ page: 1, pageSize: 20 });
    expect(rows.map((r) => r.code)).toEqual(["A-01"]);
  });

  it("owner A mengubah kamar organisasi B ditolak NOT_FOUND", async () => {
    const ctx = await sessionFor("owner.a");
    expect(await errOf(caller(ctx).room.update({ roomId: s.roomB1, notes: "x" }))).toMatchObject({
      message: "ROOM_NOT_FOUND",
    });
  });
});

describe("kamar: ubah, status, dan hapus", () => {
  it("mengubah status ke BROKEN tercatat sebagai STATUS_CHANGE", async () => {
    const ctx = await sessionFor("owner.a");
    await caller(ctx).room.update({ roomId: s.roomA1, status: "BROKEN" });
    const audit = await db.select().from(auditLogs).where(eq(auditLogs.entityId, String(s.roomA1)));
    expect(audit.some((a) => a.action === "STATUS_CHANGE")).toBe(true);
  });

  it("mengubah harga tanpa status tercatat sebagai UPDATE", async () => {
    const ctx = await sessionFor("owner.a");
    await caller(ctx).room.update({ roomId: s.roomA1, baseRentAmount: 1_300_000 });
    const audit = await db.select().from(auditLogs).where(eq(auditLogs.entityId, String(s.roomA1)));
    expect(audit.some((a) => a.action === "UPDATE")).toBe(true);
  });

  it("hapus adalah hapus lunak: baris tetap ada dan audit DELETE tercatat", async () => {
    const ctx = await sessionFor("owner.a");
    await caller(ctx).room.remove({ roomId: s.roomA1 });
    const [row] = await db.select().from(rooms).where(eq(rooms.id, s.roomA1));
    expect(row.deletedAt).not.toBeNull();
    const audit = await db.select().from(auditLogs).where(eq(auditLogs.entityId, String(s.roomA1)));
    expect(audit.some((a) => a.action === "DELETE")).toBe(true);
  });

  it("kamar yang sudah dihapus tidak bisa dibaca lagi", async () => {
    const ctx = await sessionFor("owner.a");
    await caller(ctx).room.remove({ roomId: s.roomA1 });
    expect(await errOf(caller(ctx).room.get({ roomId: s.roomA1 }))).toMatchObject({ message: "ROOM_NOT_FOUND" });
  });
});

describe("daftar kamar: cari, filter, dan paginasi", () => {
  it("cari, filter status, dan paginasi bekerja di server", async () => {
    const ctx = await sessionFor("owner.a");
    for (const code of ["A-02", "A-03", "A-04"]) await caller(ctx).room.create(room(s.propA1, code));
    await caller(ctx).room.update({ roomId: s.roomA1, status: "BROKEN" });

    const found = await caller(ctx).room.list({ search: "a-0", page: 1, pageSize: 20 });
    expect(found.total).toBe(4);

    const broken = await caller(ctx).room.list({ status: "BROKEN", page: 1, pageSize: 20 });
    expect(broken.rows.map((r) => r.code)).toEqual(["A-01"]);

    const page2 = await caller(ctx).room.list({ page: 2, pageSize: 3 });
    expect(page2.total).toBe(4);
    expect(page2.rows).toHaveLength(1);
  });
});

describe("pengaturan properti", () => {
  it("pola bertentangan dengan 'listrik dikelola' ditolak PATTERN_MANAGED_MISMATCH", async () => {
    const ctx = await sessionFor("owner.a");
    expect(await errOf(caller(ctx).property.update({ propertyId: s.propA1, electricityPattern: "A" }))).toMatchObject({
      message: "PATTERN_MANAGED_MISMATCH",
    });
  });

  it("pola dan listrik yang cocok diterima, dan perubahan tercatat di audit", async () => {
    const ctx = await sessionFor("owner.a");
    const updated = await caller(ctx).property.update({
      propertyId: s.propA1,
      electricityPattern: "D",
      hasFacilities: true,
    });
    expect(updated.hasFacilities).toBe(true);
    const audit = await db.select().from(auditLogs).where(eq(auditLogs.entityId, String(s.propA1)));
    expect(audit.some((a) => a.action === "UPDATE" && a.entityType === "property")).toBe(true);
  });

  it("nonaktifkan properti tercatat sebagai STATUS_CHANGE dan disembunyikan dari daftar", async () => {
    const ctx = await sessionFor("owner.a");
    await caller(ctx).property.setActive({ propertyId: s.propA2, isActive: false });
    const list = await caller(ctx).property.list();
    expect(list.map((p) => p.name)).not.toContain("Mawar");
    const withInactive = await caller(ctx).property.list({ includeInactive: true });
    expect(withInactive.map((p) => p.name)).toContain("Mawar");
    const audit = await db.select().from(auditLogs).where(eq(auditLogs.entityId, String(s.propA2)));
    expect(audit.some((a) => a.action === "STATUS_CHANGE")).toBe(true);
  });

  it("pengelola tidak bisa mengubah atau menonaktifkan properti", async () => {
    const ctx = await sessionFor("pengelola.a");
    expect(await errOf(caller(ctx).property.setActive({ propertyId: s.propA1, isActive: false }))).toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
