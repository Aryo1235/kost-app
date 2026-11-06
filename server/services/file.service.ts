import sharp from "sharp";
import type { Db } from "@/server/db/client";
import { BusinessRuleError, ForbiddenError, NotFoundError, UnauthorizedError } from "@/server/errors";
import {
  ALLOWED_FORMATS,
  buildKey,
  contentTypeForKey,
  type ImageFormat,
  MAX_UPLOAD_BYTES,
  parseKey,
} from "@/server/files/keys";
import { signFileLink, verifyFileLink } from "@/server/files/signing";
import { PropertyRepository } from "@/server/repositories/property.repository";
import type { Scope } from "@/server/scope";
import type { StorageDriver } from "@/server/storage/driver";
import type { FileKind } from "@/shared/enums";

function isImageFormat(value: string | undefined): value is ImageFormat {
  return value !== undefined && value in ALLOWED_FORMATS;
}

// Tipe file diperiksa dari isi, bukan dari nama atau ekstensi (TECH-SPEC 7.2).
async function detectFormat(bytes: Buffer): Promise<ImageFormat> {
  let format: string | undefined;
  try {
    format = (await sharp(bytes).metadata()).format;
  } catch {
    format = undefined;
  }
  if (!isImageFormat(format)) throw new BusinessRuleError("INVALID_FILE_TYPE");
  return format;
}

export class FileService {
  private readonly now: () => Date;

  constructor(
    private readonly deps: { db: Db; storage: StorageDriver; secret: string; now?: () => Date },
  ) {
    this.now = deps.now ?? (() => new Date());
  }

  // Unggah foto. EXIF dibuang lewat rotate() dan keluaran ulang tanpa metadata.
  async upload(
    scope: Scope,
    input: { propertyId: number; kind: FileKind; bytes: Buffer },
  ): Promise<{ key: string; url: string }> {
    if (input.bytes.length > MAX_UPLOAD_BYTES) throw new BusinessRuleError("FILE_TOO_LARGE");

    const property = await new PropertyRepository(this.deps.db, scope).findById(input.propertyId);
    if (!property) throw new NotFoundError("PROPERTY_NOT_FOUND");

    const format = await detectFormat(input.bytes);
    const clean = await sharp(input.bytes).rotate().toFormat(format).toBuffer();

    const key = buildKey(scope.organizationId, input.propertyId, input.kind, format);
    await this.deps.storage.put(key, clean);
    return { key, url: this.signedUrl(key) };
  }

  signedUrl(key: string): string {
    const nowSeconds = Math.floor(this.now().getTime() / 1000);
    const { exp, sig } = signFileLink(key, nowSeconds, this.deps.secret);
    return `/api/files/${key}?exp=${exp}&sig=${sig}`;
  }

  // Baca file. Tautan harus valid dan belum kedaluwarsa, lalu organisasi dan properti diperiksa.
  async read(
    scope: Scope,
    key: string,
    exp: number,
    sig: string,
  ): Promise<{ bytes: Buffer; contentType: string }> {
    const nowSeconds = Math.floor(this.now().getTime() / 1000);
    const link = verifyFileLink(key, exp, sig, nowSeconds, this.deps.secret);
    if (link !== "OK") throw new UnauthorizedError(link);

    const parsed = parseKey(key);
    if (!parsed || parsed.organizationId !== scope.organizationId) {
      throw new NotFoundError("FILE_NOT_FOUND");
    }
    if (scope.propertyIds !== "ALL" && !scope.propertyIds.includes(parsed.propertyId)) {
      throw new ForbiddenError();
    }

    const bytes = await this.deps.storage.get(key);
    if (!bytes) throw new NotFoundError("FILE_NOT_FOUND");
    return { bytes, contentType: contentTypeForKey(key) };
  }
}
