import { sql } from "drizzle-orm";
import { authService } from "@/server/auth";
import { db } from "@/server/db/client";
import { systemScope } from "@/server/scope";
import { services } from "@/server/services";

// Data contoh untuk pengembangan (TECH-SPEC 10). Menghapus semua data, jadi hanya untuk database *_dev.
function assertDevDatabase(url: string): void {
  const name = new URL(url).pathname.replace(/^\//, "");
  if (!name.endsWith("_dev")) {
    throw new Error(`SEED_ONLY_DEV_DATABASE: "${name}" bukan database dev`);
  }
}

export type SeedSummary = {
  accounts: { role: string; username: string; password: string; organization: string }[];
};

export async function seedDevData(): Promise<SeedSummary> {
  assertDevDatabase(process.env.DATABASE_URL ?? "");

  await db.execute(
    sql`TRUNCATE audit_logs, property_access, properties, sessions, login_attempts, users, organizations RESTART IDENTITY CASCADE`,
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
  });
  await services.property.create(scopeA, {
    name: "Mawar",
    address: "Jl. Contoh No. 2, Jakarta Selatan",
  });
  await services.property.create(scopeB, {
    name: "Anggrek",
    address: "Jl. Contoh No. 3, Bandung",
  });

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
