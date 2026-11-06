import { NextResponse, type NextRequest } from "next/server";
import { assertSameOrigin, authService, SESSION_COOKIE } from "@/server/auth";
import { toErrorResponse } from "@/server/errors";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    await authService.logout(request.cookies.get(SESSION_COOKIE)?.value);
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(SESSION_COOKIE);
    return res;
  } catch (err) {
    return toErrorResponse(err);
  }
}
