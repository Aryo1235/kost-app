import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { assertTestDatabase } from "./guard";

// Dijalankan sekali sebelum semua tes: pasang migrasi ke database tes.
export default async function setup(): Promise<void> {
  const url = process.env.DATABASE_URL ?? "";
  assertTestDatabase(url);
  const pool = new Pool({ connectionString: url });
  try {
    await migrate(drizzle({ client: pool }), { migrationsFolder: "./drizzle" });
  } finally {
    await pool.end();
  }
}
