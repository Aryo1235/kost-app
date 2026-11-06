import { NextResponse, type NextRequest } from "next/server";
import { requireAuthed } from "@/server/auth";
import { toErrorResponse } from "@/server/errors";
import { services } from "@/server/services";

// Unduh file privat. Tautan bertanda tangan, sesi, organisasi, dan properti diperiksa (TECH-SPEC 7.3).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  try {
    const ctx = await requireAuthed(request);
    const { key } = await params;
    const exp = Number(request.nextUrl.searchParams.get("exp"));
    const sig = request.nextUrl.searchParams.get("sig") ?? "";

    const { bytes, contentType } = await services.file.read(ctx.scope, key.join("/"), exp, sig);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
