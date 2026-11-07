import { sql } from "drizzle-orm";
import { authService } from "@/server/auth";
import { db } from "@/server/db/client";
import { systemScope } from "@/server/scope";
import { services } from "@/server/services";
import type { RoomStatus } from "@/shared/enums";

// Data contoh untuk pengembangan (TECH-SPEC 10). Menghapus semua data, jadi hanya untuk database *_dev.
function assertDevDatabase(url: string): void {
  const name = new URL(url).pathname.replace(/^\//, "");
  if (!name.endsWith("_dev")) {
    throw new Error(`SEED_ONLY_DEV_DATABASE: "${name}" bukan database dev`);
  }
}

// Kamar contoh untuk satu properti. Kode dibuat dari awalan dan nomor; sebagian dibuat rusak supaya filter status punya isi.
const ROOM_TYPES = ["Standar", "Standar", "AC", "AC dan kamar mandi dalam"];

type RoomSeed = { code: string; roomType: string; baseRentAmount: number; status: RoomStatus };

function roomSeeds(
  count: number,
  prefix: string,
  width: number,
  baseRent: number,
  brokenEvery: number | null,
): RoomSeed[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    return {
      code: `${prefix}-${String(n).padStart(width, "0")}`,
      roomType: ROOM_TYPES[i % ROOM_TYPES.length],
      baseRentAmount: baseRent + (i % 4) * 100_000,
      status: brokenEvery !== null && n % brokenEvery === 0 ? "BROKEN" : "AVAILABLE",
    };
  });
}

export type SeedSummary = {
  accounts: { role: string; username: string; password: string; organization: string }[];
};

// large: menambah properti "Besar" dengan 300 kamar untuk menguji kecepatan daftar (PRD 10.1).
export async function seedDevData(options: { large?: boolean } = {}): Promise<SeedSummary> {
  assertDevDatabase(process.env.DATABASE_URL ?? "");

  await db.execute(
    sql`TRUNCATE audit_logs, property_access, rooms, properties, sessions, login_attempts, users, organizations RESTART IDENTITY CASCADE`,
  );

  const ownerA = await authService.createOwner({
    organizationName: "Kost Melati Group",
    name: "Owner A",
    username: "owner.a",
    password: "kata-sandi-owner-a",
  });
  const ownerB = await authService.createOwner({
    organizationName: "Kost Anggrek",
    name: "Owner B",
    username: "owner.b",
    password: "kata-sandi-owner-b",
  });

  const scopeA = systemScope(ownerA.organizationId);
  const scopeB = systemScope(ownerB.organizationId);

  const melati = await services.property.create(scopeA, {
    name: "Melati",
    address: "Jl. Contoh No. 1, Jakarta Selatan",
    hasFacilities: true,
    electricityManaged: true,
    electricityPattern: "C",
  });
  const mawar = await services.property.create(scopeA, {
    name: "Mawar",
    address: "Jl. Contoh No. 2, Jakarta Selatan",
    hasFacilities: false,
    electricityManaged: false,
    electricityPattern: "A",
  });
  const anggrek = await services.property.create(scopeB, {
    name: "Anggrek",
    address: "Jl. Contoh No. 3, Bandung",
    hasFacilities: false,
    electricityManaged: true,
    electricityPattern: "B",
  });

  // Sepuluh kamar per properti. Kode boleh sama di properti berbeda, karena keunikannya per properti.
  for (const room of roomSeeds(10, "A", 2, 1_000_000, 7)) {
    await services.room.create(scopeA, { propertyId: melati.id, ...room });
  }
  for (const room of roomSeeds(10, "A", 2, 900_000, null)) {
    await services.room.create(scopeA, { propertyId: mawar.id, ...room });
  }
  for (const room of roomSeeds(10, "A", 2, 1_200_000, 5)) {
    await services.room.create(scopeB, { propertyId: anggrek.id, ...room });
  }

  if (options.large) {
    const besar = await services.property.create(scopeA, {
      name: "Besar",
      address: "Jl. Contoh No. 4, Depok",
      hasFacilities: false,
      electricityManaged: true,
      electricityPattern: "CUSTOM",
    });
    for (const room of roomSeeds(300, "L", 3, 800_000, 25)) {
      await services.room.create(scopeA, { propertyId: besar.id, ...room });
    }
  }

  // Pengelola A hanya boleh melihat Melati. Kata sandi awalnya wajib diganti saat masuk pertama.
  await services.user.create(scopeA, {
    name: "Pengelola A",
    username: "pengelola.a",
    password: "kata-sandi-awal-a",
    propertyIds: [melati.id],
    phone: undefined,
  });

  return {
    accounts: [
      { role: "OWNER", username: "owner.a", password: "kata-sandi-owner-a", organization: "Organisasi A" },
      { role: "MANAGER", username: "pengelola.a", password: "kata-sandi-awal-a", organization: "Organisasi A" },
      { role: "OWNER", username: "owner.b", password: "kata-sandi-owner-b", organization: "Organisasi B" },
    ],
  };
}
