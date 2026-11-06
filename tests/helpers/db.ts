import { sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { assertTestDatabase } from "../setup/guard";

// Kosongkan semua tabel dan mulai ulang ID dari 1. Dipanggil di awal tiap tes.
export async function resetDb(): Promise<void> {
  assertTestDatabase(process.env.DATABASE_URL ?? "");
  await db.execute(
    sql`TRUNCATE audit_logs, property_access, properties, sessions, login_attempts, users, organizations RESTART IDENTITY CASCADE`,
  );
}
