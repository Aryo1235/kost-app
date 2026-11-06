import { randomBytes } from "node:crypto";
import type { FileKind } from "@/shared/enums";

// Batas dan format file (PRD 10.1, TECH-SPEC 7.2).
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ALLOWED_FORMATS = {
  jpeg: { ext: "jpg", contentType: "image/jpeg" },
  png: { ext: "png", contentType: "image/png" },
  webp: { ext: "webp", contentType: "image/webp" },
} as const;
export type ImageFormat = keyof typeof ALLOWED_FORMATS;

// Kunci: {organization_id}/{property_id}/{jenis}/{acak}.{ext}
const KEY_PATTERN = /^(\d+)\/(\d+)\/(tenant|ticket|meter|payment|expense|asset)\/([0-9a-f]{32})\.(jpg|png|webp)$/;

export type ParsedKey = {
  organizationId: number;
  propertyId: number;
  kind: FileKind;
};

export function buildKey(organizationId: number, propertyId: number, kind: FileKind, format: ImageFormat): string {
  const random = randomBytes(16).toString("hex");
  return `${organizationId}/${propertyId}/${kind}/${random}.${ALLOWED_FORMATS[format].ext}`;
}

// Mengembalikan null untuk kunci yang tidak sesuai pola. Mencegah penelusuran path.
export function parseKey(key: string): ParsedKey | null {
  const m = KEY_PATTERN.exec(key);
  if (!m) return null;
  return {
    organizationId: Number(m[1]),
    propertyId: Number(m[2]),
    kind: m[3] as FileKind,
  };
}

export function contentTypeForKey(key: string): string {
  const ext = key.split(".").pop();
  const match = Object.values(ALLOWED_FORMATS).find((f) => f.ext === ext);
  return match?.contentType ?? "application/octet-stream";
}
