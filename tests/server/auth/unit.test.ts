import { randomBytes, scryptSync } from "node:crypto";
import { Writable } from "node:stream";
import { describe, expect, it } from "vitest";
import { clientIp } from "@/server/auth/client-ip";
import { isAllowedOrigin } from "@/server/auth/origin";
import {
  hashPassword,
  needsRehash,
  verifyPassword,
} from "@/server/auth/password";
import { ABSOLUTE_MS, IDLE_MS, hashToken, sessionExpiry } from "@/server/auth/session";
import { createLogger } from "@/server/logger";
import { passwordSchema, usernameSchema } from "@/shared/schemas/auth";

describe("hash kata sandi", () => {
  it("memakai format scrypt dengan parameter OWASP", async () => {
    const stored = await hashPassword("kata-sandi-benar-123");
    expect(stored).toMatch(/^scrypt\$32768\$8\$3\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/);
  });

  it("salt berbeda menghasilkan hash berbeda untuk kata sandi yang sama", async () => {
    const a = await hashPassword("kata-sandi-sama-1");
    const b = await hashPassword("kata-sandi-sama-1");
    expect(a).not.toBe(b);
  });

  it("verifikasi benar untuk sandi yang cocok dan salah untuk yang lain", async () => {
    const stored = await hashPassword("kata-sandi-benar-123");
    expect(await verifyPassword("kata-sandi-benar-123", stored)).toBe(true);
    expect(await verifyPassword("kata-sandi-salah-123", stored)).toBe(false);
  });

  it("format yang rusak selalu ditolak", async () => {
    expect(await verifyPassword("apa-saja-10", "bukan-hash")).toBe(false);
    expect(await verifyPassword("apa-saja-10", "scrypt$x$8$3$abc$def")).toBe(false);
  });

  it("hash dengan parameter lebih lemah perlu diperbarui", async () => {
    const weak = [
      "scrypt",
      16384,
      8,
      3,
      randomBytes(16).toString("base64url"),
      scryptSync("kata-sandi-lama-1", "salt", 64, { N: 16384, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }).toString("base64url"),
    ].join("$");
    expect(needsRehash(weak)).toBe(true);
    expect(needsRehash(await hashPassword("kata-sandi-baru-1"))).toBe(false);
  });
});

describe("sesi", () => {
  it("masa berlaku mengikuti batas terkecil (idle 14 hari atau absolut 60 hari)", () => {
    const now = new Date("2026-11-06T00:00:00Z");
    expect(sessionExpiry(now, now).getTime()).toBe(now.getTime() + IDLE_MS);
    const created = new Date(now.getTime() - 59 * 24 * 3600 * 1000);
    expect(sessionExpiry(now, created).getTime()).toBe(created.getTime() + ABSOLUTE_MS);
  });

  it("yang disimpan adalah hash, bukan token", () => {
    const token = "contoh-token-acak";
    expect(hashToken(token)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(token)).not.toBe(token);
    expect(hashToken(token)).toBe(hashToken(token));
  });
});

describe("alamat klien untuk pembatasan percobaan", () => {
  const withXff = (value?: string) =>
    new Request("http://localhost:3000/api/auth/login", {
      headers: value === undefined ? {} : { "x-forwarded-for": value },
    });

  it("memakai entri paling kanan, bukan yang dikirim klien", () => {
    expect(clientIp(withXff("1.2.3.4, 203.0.113.9"))).toBe("203.0.113.9");
  });

  it("tanpa header, atau nilai yang bukan IP, menghasilkan null", () => {
    expect(clientIp(withXff())).toBeNull();
    expect(clientIp(withXff("bukan-ip"))).toBeNull();
    expect(clientIp(withXff("1.2.3.4; drop table"))).toBeNull();
  });

  it("IPv4 dan IPv6 diterima", () => {
    expect(clientIp(withXff("2001:db8::1"))).toBe("2001:db8::1");
    expect(clientIp(withXff("198.51.100.7"))).toBe("198.51.100.7");
  });
});

describe("origin", () => {
  const app = "http://localhost:3000";
  it("hanya APP_ORIGIN yang diterima", () => {
    expect(isAllowedOrigin("http://localhost:3000", app)).toBe(true);
    expect(isAllowedOrigin("http://localhost:3001", app)).toBe(false);
    expect(isAllowedOrigin("https://evil.example", app)).toBe(false);
    expect(isAllowedOrigin(null, app)).toBe(false);
    expect(isAllowedOrigin("bukan-url", app)).toBe(false);
  });
});

describe("skema input", () => {
  it("username dinormalisasi dan divalidasi", () => {
    expect(usernameSchema.parse("  Owner.A ")).toBe("owner.a");
    expect(usernameSchema.safeParse("ab").success).toBe(false);
    expect(usernameSchema.safeParse("a b").success).toBe(false);
  });

  it("kata sandi minimal 10 karakter", () => {
    expect(passwordSchema.safeParse("123456789").success).toBe(false);
    expect(passwordSchema.safeParse("1234567890").success).toBe(true);
  });
});

describe("logger", () => {
  it("kata sandi dan token disamarkan, nilainya tidak pernah tertulis", () => {
    let output = "";
    const sink = new Writable({
      write(chunk, _enc, cb) {
        output += chunk.toString();
        cb();
      },
    });
    const log = createLogger(sink, "info");
    log.info(
      { password: "rahasia-123", user: { token: "token-rahasia-xyz" }, username: "owner.a" },
      "contoh",
    );
    expect(output).toContain("[REDACTED]");
    expect(output).not.toContain("rahasia-123");
    expect(output).not.toContain("token-rahasia-xyz");
    expect(output).toContain("owner.a");
  });
});
