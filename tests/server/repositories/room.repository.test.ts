import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db/client";
import { organizations, properties, propertyAccess, rooms, users } from "@/server/db/schema";
import { PropertyRepository } from "@/server/repositories/property.repository";
import { RoomRepository } from "@/server/repositories/room.repository";
import type { Scope } from "@/server/scope";
import { resetDb } from "../../helpers/db";

// Isolasi dua organisasi dan akses per properti untuk RoomRepository (AGENTS.md aturan 1).
type Seed = {
  orgA: number;
  orgB: number;
  ownerA: Scope;
  managerA: Scope;
  ownerB: Scope;
  propA1: number;
  propA2: number;
  propB1: number;
  roomA1a: number;
  roomA1b: number;
  roomA2a: number;
  roomB1a: number;
};

let s: Seed;

async function roomValues(propertyId: number, code: string, extra: Record<string, unknown> = {}) {
  return {
    propertyId,
    code,
    roomType: null,
    baseRentAmount: 1_250_000,
    facilities: null,
    status: "AVAILABLE" as const,
    notes: null,
    ...extra,
  };
}

beforeEach(async () => {
  await resetDb();
  const [a, b] = await db
    .insert(organizations)
    .values([{ name: "Kost A" }, { name: "Kost B" }])
    .returning();
  const [ownerA, managerA, ownerB] = await db
    .insert(users)
    .values([
      { organizationId: a.id, name: "Owner A", username: "owner.a", role: "OWNER", passwordHash: "x" },
      { organizationId: a.id, name: "Pengelola A", username: "pengelola.a", role: "MANAGER", passwordHash: "x" },
      { organizationId: b.id, name: "Owner B", username: "owner.b", role: "OWNER", passwordHash: "x" },
    ])
    .returning();
  const [p1, p2, pb] = await db
    .insert(properties)
    .values([
      { organizationId: a.id, name: "Melati", address: "Jl. 1" },
      { organizationId: a.id, name: "Mawar", address: "Jl. 2" },
      { organizationId: b.id, name: "Anggrek", address: "Jl. 3" },
    ])
    .returning();
  await db.insert(propertyAccess).values({ organizationId: a.id, userId: managerA.id, propertyId: p1.id });

  const [r1a, r1b, r2a, rb1] = await db
    .insert(rooms)
    .values([
      { ...(await roomValues(p1.id, "A-01")), organizationId: a.id, baseRentAmount: 1_000_000 },
      { ...(await roomValues(p1.id, "A-02")), organizationId: a.id, baseRentAmount: 1_100_000 },
      { ...(await roomValues(p2.id, "M-01")), organizationId: a.id, baseRentAmount: 900_000 },
      { ...(await roomValues(pb.id, "B-01")), organizationId: b.id, baseRentAmount: 1_500_000 },
    ])
    .returning();

  const scope = (orgId: number, userId: number, role: "OWNER" | "MANAGER", propertyIds: number[] | "ALL"): Scope =>
    ({ organizationId: orgId, userId, role, propertyIds }) as Scope;

  s = {
    orgA: a.id,
    orgB: b.id,
    ownerA: scope(a.id, ownerA.id, "OWNER", "ALL"),
    managerA: scope(a.id, managerA.id, "MANAGER", [p1.id]),
    ownerB: scope(b.id, ownerB.id, "OWNER", "ALL"),
    propA1: p1.id,
    propA2: p2.id,
    propB1: pb.id,
    roomA1a: r1a.id,
    roomA1b: r1b.id,
    roomA2a: r2a.id,
    roomB1a: rb1.id,
  };
});

const list = (scope: Scope, extra: Partial<Parameters<RoomRepository["list"]>[0]> = {}) =>
  new RoomRepository(db, scope).list({ page: 1, pageSize: 50, ...extra });

describe("RoomRepository: isolasi antar organisasi", () => {
  it("owner A hanya melihat kamar organisasi A", async () => {
    const { rows, total } = await list(s.ownerA);
    expect(total).toBe(3);
    expect(rows.every((r) => r.organizationId === s.orgA)).toBe(true);
  });

  it("owner A tidak bisa membaca kamar organisasi B", async () => {
    expect(await new RoomRepository(db, s.ownerA).findById(s.roomB1a)).toBeNull();
  });

  it("owner A tidak bisa mengubah atau menghapus kamar organisasi B", async () => {
    const repo = new RoomRepository(db, s.ownerA);
    expect(await repo.update(s.roomB1a, { notes: "diubah" })).toBeNull();
    expect(await repo.softDelete(s.roomB1a)).toBeNull();

    const [untouched] = await db.select().from(rooms).where(eq(rooms.id, s.roomB1a));
    expect(untouched.notes).toBeNull();
    expect(untouched.deletedAt).toBeNull();
  });

  it("insert memakai organization_id dari scope, bukan dari input", async () => {
    const repo = new RoomRepository(db, s.ownerA);
    const row = await repo.insert({
      ...(await roomValues(s.propA1, "A-09")),
      organizationId: s.orgB,
    } as Parameters<RoomRepository["insert"]>[0]);
    expect(row.organizationId).toBe(s.orgA);
  });
});

describe("RoomRepository: akses per properti (pengelola)", () => {
  it("pengelola hanya melihat kamar di properti yang ditugaskan", async () => {
    const { rows } = await list(s.managerA);
    expect(rows.map((r) => r.propertyName)).toEqual(["Melati", "Melati"]);
  });

  it("pengelola tidak bisa membaca kamar di properti lain di organisasi yang sama", async () => {
    expect(await new RoomRepository(db, s.managerA).findById(s.roomA2a)).toBeNull();
  });
});

describe("RoomRepository: kode unik per properti (indeks parsial)", () => {
  it("kode sama di properti yang sama ditolak, termasuk beda huruf besar", async () => {
    const repo = new RoomRepository(db, s.ownerA);
    await expect(repo.insert(await roomValues(s.propA1, "a-01"))).rejects.toThrow();
  });

  it("kode sama di properti lain diizinkan", async () => {
    const repo = new RoomRepository(db, s.ownerA);
    await expect(repo.insert(await roomValues(s.propA2, "A-01"))).resolves.toMatchObject({ code: "A-01" });
  });

  it("kode bisa dipakai lagi setelah kamar lama dihapus lunak", async () => {
    const repo = new RoomRepository(db, s.ownerA);
    await repo.softDelete(s.roomA1a);
    const row = await repo.insert(await roomValues(s.propA1, "A-01"));
    expect(row.code).toBe("A-01");
    // Kamar yang dihapus tidak ikut dibaca.
    expect(await repo.findById(s.roomA1a)).toBeNull();
  });
});

describe("RoomRepository: daftar, cari, filter, paginasi", () => {
  it("filter status dan properti bekerja", async () => {
    await new RoomRepository(db, s.ownerA).update(s.roomA1b, { status: "BROKEN" });
    const broken = await list(s.ownerA, { status: "BROKEN" });
    expect(broken.rows.map((r) => r.code)).toEqual(["A-02"]);

    const onlyMawar = await list(s.ownerA, { propertyId: s.propA2 });
    expect(onlyMawar.rows.map((r) => r.code)).toEqual(["M-01"]);
  });

  it("cari kode tidak peka huruf besar-kecil, dan % dibaca sebagai karakter biasa", async () => {
    expect((await list(s.ownerA, { search: "a-0" })).total).toBe(2);
    expect((await list(s.ownerA, { search: "%" })).total).toBe(0);
  });

  it("paginasi menghitung total dari seluruh hasil, bukan dari halaman", async () => {
    const page2 = await list(s.ownerA, { page: 2, pageSize: 2 });
    expect(page2.total).toBe(3);
    expect(page2.rows).toHaveLength(1);
  });
});

describe("PropertyRepository: nonaktif", () => {
  it("properti nonaktif disembunyikan kecuali diminta", async () => {
    const repo = new PropertyRepository(db, s.ownerA);
    await repo.setActive(s.propA2, false);
    expect((await repo.list()).map((p) => p.name)).toEqual(["Melati"]);
    expect((await repo.list({ includeInactive: true })).map((p) => p.name)).toEqual(["Melati", "Mawar"]);
  });
});
