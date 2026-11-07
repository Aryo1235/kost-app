import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db/client";
import { organizations, properties, rooms } from "@/server/db/schema";
import { PropertyRepository } from "@/server/repositories/property.repository";
import type { Scope } from "@/server/scope";
import { resetDb } from "../../helpers/db";

// Jumlah kamar per properti: terikat organisasi dan akses, dan tidak menghitung kamar terhapus (BR-14).
let orgA: number;
let propA1: number;
let propA2: number;
let propB1: number;

const owner = (organizationId: number): Scope => ({
  organizationId,
  userId: 1,
  role: "OWNER",
  propertyIds: "ALL",
});

async function addRoom(
  organizationId: number,
  propertyId: number,
  code: string,
  extra: { status?: "AVAILABLE" | "OCCUPIED" | "BROKEN"; deletedAt?: Date } = {},
) {
  await db.insert(rooms).values({
    organizationId,
    propertyId,
    code,
    baseRentAmount: 1_000_000,
    status: extra.status ?? "AVAILABLE",
    deletedAt: extra.deletedAt ?? null,
  });
}

beforeEach(async () => {
  await resetDb();
  const [a, b] = await db
    .insert(organizations)
    .values([{ name: "Kost A" }, { name: "Kost B" }])
    .returning();
  orgA = a.id;
  const [p1, p2, pb] = await db
    .insert(properties)
    .values([
      { organizationId: a.id, name: "Melati", address: "Jl. 1" },
      { organizationId: a.id, name: "Mawar", address: "Jl. 2" },
      { organizationId: b.id, name: "Anggrek", address: "Jl. 3" },
    ])
    .returning();
  propA1 = p1.id;
  propA2 = p2.id;
  propB1 = pb.id;

  await addRoom(a.id, p1.id, "A-01");
  await addRoom(a.id, p1.id, "A-02");
  await addRoom(a.id, p1.id, "A-03", { status: "BROKEN" });
  await addRoom(a.id, p1.id, "A-04", { status: "OCCUPIED" });
  await addRoom(a.id, p1.id, "A-05", { deletedAt: new Date() });
  await addRoom(b.id, pb.id, "B-01");
  await addRoom(b.id, pb.id, "B-02");
});

describe("PropertyRepository.list: jumlah kamar", () => {
  it("menghitung total, kosong, dan rusak, tanpa kamar yang sudah dihapus", async () => {
    const list = await new PropertyRepository(db, owner(orgA)).list();
    const melati = list.find((p) => p.id === propA1);
    expect(melati).toMatchObject({ roomCount: 4, availableCount: 2, brokenCount: 1 });
  });

  it("properti tanpa kamar bernilai nol, bukan kosong", async () => {
    const list = await new PropertyRepository(db, owner(orgA)).list();
    const mawar = list.find((p) => p.id === propA2);
    expect(mawar).toMatchObject({ roomCount: 0, availableCount: 0, brokenCount: 0 });
  });

  it("tidak membawa properti atau kamar organisasi lain", async () => {
    const list = await new PropertyRepository(db, owner(orgA)).list();
    expect(list.map((p) => p.id)).not.toContain(propB1);
    expect(list.reduce((sum, p) => sum + p.roomCount, 0)).toBe(4);
  });

  it("pengelola hanya melihat properti yang ditugaskan beserta jumlahnya", async () => {
    const manager: Scope = { organizationId: orgA, userId: 2, role: "MANAGER", propertyIds: [propA2] };
    const list = await new PropertyRepository(db, manager).list();
    expect(list.map((p) => p.id)).toEqual([propA2]);
    expect(list[0].roomCount).toBe(0);
  });
});
