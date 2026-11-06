import { rm } from "node:fs/promises";
import sharp from "sharp";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db/client";
import { env } from "@/server/env";
import { DomainError } from "@/server/errors";
import { signFileLink } from "@/server/files/signing";
import { properties, propertyAccess, organizations, users } from "@/server/db/schema";
import { LocalStorageDriver } from "@/server/storage/local.driver";
import { FileService } from "@/server/services/file.service";
import { hashPassword } from "@/server/auth/password";
import type { Scope } from "@/server/scope";
import { resetDb } from "../../helpers/db";

const ROOT = "./.test-storage/files";
const storage = new LocalStorageDriver(ROOT);
const SECRET = env.FILE_SIGNING_SECRET;

let clock: Date;
const files = () => new FileService({ db, storage, secret: SECRET, now: () => clock });

afterAll(async () => {
  await rm("./.test-storage", { recursive: true, force: true });
});

async function codeOf(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (err) {
    if (err instanceof DomainError) return err.code;
    throw err;
  }
  throw new Error("diharapkan galat, tetapi berhasil");
}

// Gambar JPEG dengan EXIF, untuk membuktikan metadata dibuang.
async function jpegWithExif(): Promise<Buffer> {
  return sharp({ create: { width: 24, height: 24, channels: 3, background: "#336699" } })
    .jpeg()
    .withExif({ IFD0: { Copyright: "rahasia-pemilik", Artist: "Budi" } })
    .toBuffer();
}

type Seed = {
  orgA: number;
  orgB: number;
  propA1: number;
  propA2: number;
  propB1: number;
  ownerA: Scope;
  managerA: Scope;
  ownerB: Scope;
};

let s: Seed;

beforeEach(async () => {
  await resetDb();
  clock = new Date("2026-11-06T02:00:00Z");
  const [a, b] = await db
    .insert(organizations)
    .values([{ name: "Kost A" }, { name: "Kost B" }])
    .returning();
  const [ownerA, managerA, ownerB] = await db
    .insert(users)
    .values([
      { organizationId: a.id, name: "Owner A", username: "owner.a", role: "OWNER", passwordHash: await hashPassword("x-x-x-x-x-x") },
      { organizationId: a.id, name: "Pengelola A", username: "pengelola.a", role: "MANAGER", passwordHash: await hashPassword("x-x-x-x-x-x") },
      { organizationId: b.id, name: "Owner B", username: "owner.b", role: "OWNER", passwordHash: await hashPassword("x-x-x-x-x-x") },
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

  s = {
    orgA: a.id,
    orgB: b.id,
    propA1: p1.id,
    propA2: p2.id,
    propB1: pb.id,
    ownerA: { organizationId: a.id, userId: ownerA.id, role: "OWNER", propertyIds: "ALL" },
    managerA: { organizationId: a.id, userId: managerA.id, role: "MANAGER", propertyIds: [p1.id] },
    ownerB: { organizationId: b.id, userId: ownerB.id, role: "OWNER", propertyIds: "ALL" },
  };
});

describe("unggah foto", () => {
  it("JPG disimpan dengan kunci sesuai pola dan EXIF dibuang", async () => {
    const original = await jpegWithExif();
    expect((await sharp(original).metadata()).exif).toBeDefined();

    const { key } = await files().upload(s.ownerA, { propertyId: s.propA1, kind: "ticket", bytes: original });
    expect(key).toMatch(new RegExp(`^${s.orgA}/${s.propA1}/ticket/[0-9a-f]{32}\\.jpg$`));

    const stored = await storage.get(key);
    expect(stored).not.toBeNull();
    const meta = await sharp(stored!).metadata();
    expect(meta.format).toBe("jpeg");
    expect(meta.exif).toBeUndefined();
    expect(stored!.includes("rahasia-pemilik")).toBe(false);
  });

  it("berkas bukan gambar ditolak meski namanya .jpg", async () => {
    const fake = Buffer.from("ini teks biasa, bukan foto");
    expect(
      await codeOf(files().upload(s.ownerA, { propertyId: s.propA1, kind: "ticket", bytes: fake })),
    ).toBe("INVALID_FILE_TYPE");
  });

  it("berkas lebih dari 10 MB ditolak", async () => {
    const big = Buffer.alloc(10 * 1024 * 1024 + 1);
    expect(
      await codeOf(files().upload(s.ownerA, { propertyId: s.propA1, kind: "ticket", bytes: big })),
    ).toBe("FILE_TOO_LARGE");
  });

  it("unggah ke properti organisasi lain ditolak NOT_FOUND", async () => {
    expect(
      await codeOf(files().upload(s.ownerA, { propertyId: s.propB1, kind: "ticket", bytes: await jpegWithExif() })),
    ).toBe("PROPERTY_NOT_FOUND");
  });

  it("pengelola tanpa akses ke properti tidak bisa mengunggah ke sana", async () => {
    expect(
      await codeOf(files().upload(s.managerA, { propertyId: s.propA2, kind: "ticket", bytes: await jpegWithExif() })),
    ).toBe("PROPERTY_NOT_FOUND");
  });
});

describe("unduh file dan tautan bertanda tangan", () => {
  async function uploadedKey(): Promise<string> {
    const { key } = await files().upload(s.ownerA, {
      propertyId: s.propA1,
      kind: "ticket",
      bytes: await jpegWithExif(),
    });
    return key;
  }

  function linkFor(key: string, at: Date) {
    return signFileLink(key, Math.floor(at.getTime() / 1000), SECRET);
  }

  it("tautan yang valid dapat dibaca pemiliknya", async () => {
    const key = await uploadedKey();
    const { exp, sig } = linkFor(key, clock);
    const got = await files().read(s.ownerA, key, exp, sig);
    expect(got.contentType).toBe("image/jpeg");
    expect(got.bytes.length).toBeGreaterThan(0);
  });

  it("tautan kedaluwarsa ditolak", async () => {
    const key = await uploadedKey();
    const { exp, sig } = linkFor(key, clock);
    clock = new Date(clock.getTime() + 6 * 60 * 1000);
    expect(await codeOf(files().read(s.ownerA, key, exp, sig))).toBe("LINK_EXPIRED");
  });

  it("tautan yang diubah ditolak", async () => {
    const key = await uploadedKey();
    const { exp, sig } = linkFor(key, clock);
    const tampered = sig.startsWith("A") ? `B${sig.slice(1)}` : `A${sig.slice(1)}`;
    expect(await codeOf(files().read(s.ownerA, key, exp, tampered))).toBe("LINK_INVALID");
  });

  it("organisasi B tidak bisa membaca file organisasi A, walau tautannya valid", async () => {
    const key = await uploadedKey();
    const { exp, sig } = linkFor(key, clock);
    expect(await codeOf(files().read(s.ownerB, key, exp, sig))).toBe("FILE_NOT_FOUND");
  });

  it("pengelola tanpa akses ke properti file ditolak FORBIDDEN", async () => {
    const { key } = await files().upload(s.ownerA, {
      propertyId: s.propA2,
      kind: "ticket",
      bytes: await jpegWithExif(),
    });
    const { exp, sig } = linkFor(key, clock);
    expect(await codeOf(files().read(s.managerA, key, exp, sig))).toBe("FORBIDDEN");
  });

  it("kunci dengan penelusuran path ditolak meski tanda tangannya valid", async () => {
    const key = `${s.orgA}/${s.propA1}/ticket/../../../../etc/passwd`;
    const { exp, sig } = linkFor(key, clock);
    expect(await codeOf(files().read(s.ownerA, key, exp, sig))).toBe("FILE_NOT_FOUND");
  });
});
