import { db } from "@/server/db/client";
import { AuthService } from "./auth.service";

// Satu instance untuk seluruh aplikasi. Route dan skrip memakai ini, bukan membuat sendiri.
export const authService = new AuthService({ db });

export { SESSION_COOKIE, sessionCookieOptions } from "./cookies";
export { assertSameOrigin, isAllowedOrigin } from "./origin";
export { requireAuthed } from "./guard";
export type { AuthUser, SessionContext } from "./auth.service";
