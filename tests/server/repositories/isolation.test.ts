import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db/client";
import { organizations, properties, users } from "@/server/db/schema";
import { AuditRepository } from "@/server/repositories/audit.repository";
import { PropertyRepository } from "@/server/repositories/property.repository";
import type { Scope } from "@/server/scope";
import { resetDb } from "../../helpers/db";

// Dua organisasi berisi data. Semua repository baru wajib punya tes seperti ini (AGENTS.md aturan 1).
type Seed = {
  orgA: number;
  orgB: number;
  ownerA: number;
  managerA: number;
  ownerB: number;
  propA1: number;
  propA2: number;
  propB1: number;
};

async function seed(): Promise<Seed> {
  const [a, b] = await db
    .insert(organizations)
    .values([{ name: "Organisasi A" }, { name: "Organisasi B" }])
    .returning();

  const [ownerA, managerA, ownerB] = await db
    .insert(users)
    .values([
      { organizationId: a.id, name: "Owner A", username: "owner.a", role: "OWNER", passwordHash: "x" },
      { organizationId: a.id, name: "Pengelola A", username: "pengelola.a", role: "MANAGER", passwordHash: "x" },
      { organizationId: b.id, name: "Owner B", username: "owner.b", role: "OWNER", passwordHash: "x" },
    ])
    .returning();

  const [propA1, propA2, propB1] = await db
    .insert(properties)
    .values([
      { organizationId: a.id, name: "Melati", address: "Jl. Contoh 1" },
      { organizationId: a.id, name: "Mawar", address: "Jl. Contoh 2" },
      { organizationId: b.id, name: "Anggrek", address: "Jl. Contoh 3" },
    ])
    .returning();

  return {
    orgA: a.id,
    orgB: b.id,
    ownerA: ownerA.id,
    managerA: managerA.id,
    ownerB: ownerB.id,
    propA1: propA1.id,
    propA2: propA2.id,
    propB1: propB1.id,
  };
}

function scopes(s: Seed) {
  return {
    ownerA: { organizationId: s.orgA, userId: s.ownerA, role: "OWNER", propertyIds: "ALL" } as Scope,
    managerA: { organizationId: s.orgA, userId: s.managerA, role: "MANAGER", propertyIds: [s.propA1] } as Scope,
    ownerB: { organizationId: s.orgB, userId: s.ownerB, role: "OWNER", propertyIds: "ALL" } as Scope,
  };
}

let s: Seed;

beforeEach(async () => {
  await resetDb();
  s = await seed();
});

describe("PropertyRepository: isolasi antar organisasi", () => {
  it("owner A hanya melihat properti organisasi A", async () => {
    const repo = new PropertyRepository(db, scopes(s).ownerA);
    const rows = await repo.list();
    expect(rows.map((r) => r.id).sort()).toEqual([s.propA1, s.propA2].sort());
  });

  it("owner A tidak bisa membaca properti organisasi B", async () => {
    const repo = new PropertyRepository(db, scopes(s).ownerA);
    expect(await repo.findById(s.propB1)).toBeNull();
  });

  it("owner A tidak bisa mengubah properti organisasi B", async () => {
    const repo = new PropertyRepository(db, scopes(s).ownerA);
    expect(await repo.update(s.propB1, { name: "Diubah" })).toBeNull();

    const ownerB = new PropertyRepository(db, scopes(s).ownerB);
    const [rowB] = await ownerB.list();
    expect(rowB.name).toBe("Anggrek");
  });

  it("insert memakai organization_id dari scope, bukan dari input", async () => {
    const repo = new PropertyRepository(db, scopes(s).ownerA);
    const row = await repo.insert({
      name: "Baru",
      address: "Jl. Baru",
      organizationId: s.orgB,
    } as { name: string; address: string });
    expect(row.organizationId).toBe(s.orgA);

    const ownerB = new PropertyRepository(db, scopes(s).ownerB);
    expect((await ownerB.list()).map((r) => r.name)).toEqual(["Anggrek"]);
  });
});

describe("PropertyRepository: akses per properti (pengelola)", () => {
  it("pengelola hanya melihat properti yang ditugaskan", async () => {
    const repo = new PropertyRepository(db, scopes(s).managerA);
    const rows = await repo.list();
    expect(rows.map((r) => r.id)).toEqual([s.propA1]);
  });

  it("pengelola ditolak untuk properti lain di organisasi yang sama", async () => {
    const repo = new PropertyRepository(db, scopes(s).managerA);
    expect(await repo.findById(s.propA2)).toBeNull();
    expect(await repo.update(s.propA2, { name: "Diubah" })).toBeNull();
  });
});

describe("AuditRepository: isolasi antar organisasi", () => {
  it("catatan audit organisasi A tidak terlihat oleh organisasi B", async () => {
    const audit = new AuditRepository(db, scopes(s).ownerA);
    await audit.insert({
      propertyId: s.propA1,
      actorId: s.ownerA,
      entityType: "property",
      entityId: String(s.propA1),
      action: "CREATE",
      before: null,
      after: { name: "Melati" },
    });

    const forA = await audit.list();
    expect(forA).toHaveLength(1);
    expect(forA[0].organizationId).toBe(s.orgA);

    const forB = await new AuditRepository(db, scopes(s).ownerB).list();
    expect(forB).toHaveLength(0);
  });

  it("insert audit dengan organization_id palsu tetap masuk organisasi scope", async () => {
    const audit = new AuditRepository(db, scopes(s).ownerA);
    // Variabel, bukan literal, agar TypeScript membiarkan field tambahan.
    // Field itu sengaja dikirim untuk membuktikan nilainya diabaikan.
    const input = {
      propertyId: null,
      actorId: s.ownerA,
      entityType: "property",
      entityId: "1",
      action: "UPDATE" as const,
      before: null,
      after: null,
      organizationId: s.orgB,
    };
    const row = await audit.insert(input);
    expect(row.organizationId).toBe(s.orgA);
  });
});
