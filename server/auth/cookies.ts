import { ABSOLUTE_MS } from "./session";

// Di produksi memakai prefiks __Host- (wajib Secure, path /, tanpa Domain).
export const SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-kost_session" : "kost_session";

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
    maxAge: Math.floor(ABSOLUTE_MS / 1000),
  };
}
