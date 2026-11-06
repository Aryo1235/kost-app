import { NextResponse, type NextRequest } from "next/server";
import {
  assertSameOrigin,
  authService,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/server/auth";
import { toErrorResponse, UnauthorizedError } from "@/server/errors";
import { changePasswordInput } from "@/shared/schemas/auth";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const ctx = await authService.resolveSession(request.cookies.get(SESSION_COOKIE)?.value);
    if (!ctx) throw new UnauthorizedError();

    const body = changePasswordInput.parse(await request.json());
    const result = await authService.changePassword(ctx, body);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, result.token, sessionCookieOptions(result.expiresAt));
    return res;
  } catch (err) {
    return toErrorResponse(err);
  }
}
