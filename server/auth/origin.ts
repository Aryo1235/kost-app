import { env } from "@/server/env";
import { ForbiddenError } from "@/server/errors";

// Pemeriksaan CSRF tambahan: setiap POST harus berasal dari APP_ORIGIN (TECH-SPEC 3.4).
export function isAllowedOrigin(origin: string | null, appOrigin: string): boolean {
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(appOrigin).origin;
  } catch {
    return false;
  }
}

export function assertSameOrigin(request: Request): void {
  if (!isAllowedOrigin(request.headers.get("origin"), env.APP_ORIGIN)) {
    throw new ForbiddenError("ORIGIN_NOT_ALLOWED");
  }
}
