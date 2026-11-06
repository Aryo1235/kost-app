import { createHmac, timingSafeEqual } from "node:crypto";

// Tautan file kedaluwarsa dalam sekitar 5 menit (TECH-SPEC 7.3).
export const LINK_TTL_SECONDS = 5 * 60;

function signature(key: string, exp: number, secret: string): string {
  return createHmac("sha256", secret).update(`${key}:${exp}`).digest("base64url");
}

export function signFileLink(key: string, nowSeconds: number, secret: string): { exp: number; sig: string } {
  const exp = nowSeconds + LINK_TTL_SECONDS;
  return { exp, sig: signature(key, exp, secret) };
}

export type LinkCheck = "OK" | "LINK_EXPIRED" | "LINK_INVALID";

export function verifyFileLink(
  key: string,
  exp: number,
  sig: string,
  nowSeconds: number,
  secret: string,
): LinkCheck {
  if (!Number.isInteger(exp)) return "LINK_INVALID";
  const expected = Buffer.from(signature(key, exp, secret));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return "LINK_INVALID";
  }
  return exp < nowSeconds ? "LINK_EXPIRED" : "OK";
}
