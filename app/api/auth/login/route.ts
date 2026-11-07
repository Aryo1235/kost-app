import { NextResponse, type NextRequest } from "next/server";
import {
  assertSameOrigin,
  authService,
  clientIp,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/server/auth";
import { toErrorResponse } from "@/server/errors";
import { loginInput } from "@/shared/schemas/auth";

// Adapter tipis: validasi, panggil service, atur cookie (TECH-SPEC 2.1).
export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const body = loginInput.parse(await request.json());
    const result = await authService.login({
      username: body.username,
      password: body.password,
      ip: clientIp(request),
    });

    const res = NextResponse.json({
      role: result.user.role,
      mustChangePassword: result.user.mustChangePassword,
    });
    res.cookies.set(SESSION_COOKIE, result.token, sessionCookieOptions(result.expiresAt));
    return res;
  } catch (err) {
    return toErrorResponse(err);
  }
}
