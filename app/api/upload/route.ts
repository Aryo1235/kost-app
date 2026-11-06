import { NextResponse, type NextRequest } from "next/server";
import { assertSameOrigin, requireAuthed } from "@/server/auth";
import { BusinessRuleError, toErrorResponse } from "@/server/errors";
import { services } from "@/server/services";
import { FILE_KINDS, type FileKind } from "@/shared/enums";

// Unggah foto privat. Adapter tipis ke FileService (TECH-SPEC 7.2).
export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const ctx = await requireAuthed(request);

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new BusinessRuleError("FILE_REQUIRED");

    const propertyId = Number(form.get("propertyId"));
    if (!Number.isInteger(propertyId) || propertyId <= 0) {
      throw new BusinessRuleError("PROPERTY_ID_INVALID");
    }
    const kind = form.get("kind");
    if (typeof kind !== "string" || !(FILE_KINDS as readonly string[]).includes(kind)) {
      throw new BusinessRuleError("FILE_KIND_INVALID");
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await services.file.upload(ctx.scope, {
      propertyId,
      kind: kind as FileKind,
      bytes,
    });
    return NextResponse.json(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}
