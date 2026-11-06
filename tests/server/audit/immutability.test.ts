import { sql } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db/client";
import { auditLogs, organizations } from "@/server/db/schema";
import { AuditRepository } from "@/server/repositories/audit.repository";
import { resetDb } from "../../helpers/db";

beforeEach(async () => {
  await resetDb();
});

// Drizzle membungkus galat dengan "Failed query"; pesan dari trigger ada di cause.
async function failureOf(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (err) {
    const e = err as { message?: string; cause?: { message?: string } };
    return `${e.message ?? ""} ${e.cause?.message ?? ""}`;
  }
  throw new Error("diharapkan galat dari trigger, tetapi berhasil");
}

// Trigger di migrasi 0001 menolak UPDATE dan DELETE pada audit_logs (FR-AUD-04, TECH-SPEC 3.7).
describe("audit_logs tidak bisa diubah atau dihapus", () => {
  async function insertOne(): Promise<number> {
    const [org] = await db.insert(organizations).values({ name: "Kost A" }).returning();
    const row = await new AuditRepository(db, {
      organizationId: org.id,
      userId: null,
      role: "OWNER",
      propertyIds: "ALL",
    }).insert({
      propertyId: null,
      entityType: "property",
      entityId: "1",
      action: "CREATE",
      before: null,
      after: { name: "Melati" },
    });
    return row.id;
  }

  it("UPDATE ditolak trigger dan nilai tidak berubah", async () => {
    const id = await insertOne();
    const message = await failureOf(
      db.update(auditLogs).set({ action: "UPDATE" }).where(sql`id = ${id}`),
    );
    expect(message).toMatch(/tidak boleh diubah atau dihapus/);

    const [row] = await db.select().from(auditLogs);
    expect(row.action).toBe("CREATE");
  });

  it("DELETE ditolak trigger dan baris tetap ada", async () => {
    const id = await insertOne();
    const message = await failureOf(db.delete(auditLogs).where(sql`id = ${id}`));
    expect(message).toMatch(/tidak boleh diubah atau dihapus/);

    expect(await db.select().from(auditLogs)).toHaveLength(1);
  });
});
