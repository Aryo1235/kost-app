import { describe, expect, it } from "vitest";
import { authService, type SessionContext } from "@/server/auth";
import { hashPassword } from "@/server/auth/password";
import { db } from "@/server/db/client";
import { organizations, properties, rooms, users } from "@/server/db/schema";
import { appRouter } from "@/server/trpc/root";
import { resetDb } from "../../helpers/db";

const PASSWORD = "kata-sandi-benar-123";
const TOTAL_ROOMS = 300;

// PRD 10.1: daftar kamar dengan 300 kamar dimuat di bawah 2 detik. Yang diukur adalah sisi server.
describe("daftar kamar: kecepatan muat (PRD 10.1)", () => {
  it("300 kamar di satu properti: satu halaman dimuat di bawah 2 detik", async () => {
    await resetDb();
    const [org] = await db.insert(organizations).values({ name: "Kost Besar" }).returning();
    await db.insert(users).values({
      organizationId: org.id,
      name: "Owner Besar",
      username: "owner.besar",
      role: "OWNER",
      passwordHash: await hashPassword(PASSWORD),
    });
    const [prop] = await db
      .insert(properties)
      .values({ organizationId: org.id, name: "Besar", address: "Jl. Uji 1" })
      .returning();
    await db.insert(rooms).values(
      Array.from({ length: TOTAL_ROOMS }, (_, i) => ({
        organizationId: org.id,
        propertyId: prop.id,
        code: `L-${String(i + 1).padStart(3, "0")}`,
        baseRentAmount: 800_000 + (i % 5) * 50_000,
        status: i % 25 === 24 ? ("BROKEN" as const) : ("AVAILABLE" as const),
      })),
    );

    const { token } = await authService.login({ username: "owner.besar", password: PASSWORD, ip: null });
    const session = (await authService.resolveSession(token)) as SessionContext;
    const caller = appRouter.createCaller({ requestId: "perf-test", session });

    const started = performance.now();
    const page = await caller.room.list({ propertyId: prop.id, page: 1, pageSize: 100 });
    const elapsed = performance.now() - started;

    expect(page.total).toBe(TOTAL_ROOMS);
    expect(page.rows).toHaveLength(100);
    expect(elapsed).toBeLessThan(2000);
  });
});
