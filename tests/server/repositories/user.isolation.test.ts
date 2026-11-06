import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db/client";
import { organizations, properties, propertyAccess, users } from "@/server/db/schema";
import { UserRepository } from "@/server/repositories/user.repository";
import type { Scope } from "@/server/scope";
import { resetDb } from "../../helpers/db";

// Isolasi dua organisasi untuk UserRepository (AGENTS.md aturan 1).
type Seed = { orgA: number; orgB: number; ownerA: Scope; userB: number; propB1: number };

let s: Seed;

beforeEach(async () => {
  await resetDb();
  const [a, b] = await db
    .insert(organizations)
    .values([{ name: "Kost A" }, { name: "Kost B" }])
    .returning();
  const [ownerA] = await db
    .insert(users)
    .values({ organizationId: a.id, name: "Owner A", username: "owner.a", role: "OWNER", passwordHash: "x" })
    .returning();
  const [mgrB] = await db
    .insert(users)
    .values({ organizationId: b.id, name: "Pengelola B", username: "pengelola.b", role: "MANAGER", passwordHash: "x" })
    .returning();
  const [propB1] = await db
    .insert(properties)
    .values({ organizationId: b.id, name: "Anggrek", address: "Jl. B" })
    .returning();
  await db.insert(propertyAccess).values({ organizationId: b.id, userId: mgrB.id, propertyId: propB1.id });

  s = {
    orgA: a.id,
    orgB: b.id,
    ownerA: { organizationId: a.id, userId: ownerA.id, role: "OWNER", propertyIds: "ALL" },
    userB: mgrB.id,
    propB1: propB1.id,
  };
});

describe("UserRepository: isolasi antar organisasi", () => {
  it("daftar pengguna hanya berisi organisasi scope", async () => {
    const rows = await new UserRepository(db, s.ownerA).list();
    expect(rows.map((r) => r.username)).toEqual(["owner.a"]);
  });

  it("pengguna organisasi B tidak bisa ditemukan dengan scope A", async () => {
    expect(await new UserRepository(db, s.ownerA).findById(s.userB)).toBeNull();
  });

  it("nonaktifkan pengguna organisasi B dengan scope A tidak mengubah apa pun", async () => {
    await new UserRepository(db, s.ownerA).setActive(s.userB, false);
    const [row] = await db.select().from(users).where(eq(users.id, s.userB));
    expect(row.isActive).toBe(true);
  });

  it("mengganti akses properti pengguna organisasi B dengan scope A tidak menyentuh aksesnya", async () => {
    await new UserRepository(db, s.ownerA).replacePropertyAccess(s.userB, []);
    const rows = await db.select().from(propertyAccess);
    expect(rows.map((r) => r.propertyId)).toEqual([s.propB1]);
  });

  it("daftar akses hanya memuat organisasi scope", async () => {
    const map = await new UserRepository(db, s.ownerA).listAccessByUser([s.userB]);
    expect(map.size).toBe(0);
  });
});
