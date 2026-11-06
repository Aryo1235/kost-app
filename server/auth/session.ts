import { createHash, randomBytes } from "node:crypto";

const DAY_MS = 24 * 60 * 60 * 1000;

// Sesi habis 14 hari tanpa dipakai, dan paling lama 60 hari sejak dibuat (TECH-SPEC 3.4).
export const IDLE_MS = 14 * DAY_MS;
export const ABSOLUTE_MS = 60 * DAY_MS;
// last_used_at ditulis paling sering sekali per jam, supaya tidak menulis di setiap permintaan.
export const TOUCH_INTERVAL_MS = 60 * 60 * 1000;

export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

// Hanya hash yang disimpan di database. Token asli hanya ada di cookie.
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function sessionExpiry(now: Date, createdAt: Date): Date {
  return new Date(
    Math.min(now.getTime() + IDLE_MS, createdAt.getTime() + ABSOLUTE_MS),
  );
}
