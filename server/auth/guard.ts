import type { NextRequest } from "next/server";
import { ForbiddenError, UnauthorizedError } from "@/server/errors";
import { authService } from "./index";
import { SESSION_COOKIE } from "./cookies";

// Sesi valid dan sudah mengganti sandi awal. Dipakai route handler non-tRPC (unggah, unduh file).
export async function requireAuthed(request: NextRequest) {
  const ctx = await authService.resolveSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!ctx) throw new UnauthorizedError();
  if (ctx.user.mustChangePassword) throw new ForbiddenError("PASSWORD_CHANGE_REQUIRED");
  return ctx;
}
