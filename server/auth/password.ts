import { randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";

// Parameter scrypt yang dianjurkan OWASP (TECH-SPEC 3.4). Hanya modul crypto bawaan Node.
const PARAMS = { N: 32768, r: 8, p: 3 } as const;
const KEY_BYTES = 64;
const SALT_BYTES = 16;
const MAX_MEM = 64 * 1024 * 1024;

function derive(
  password: string,
  salt: Buffer,
  params: { N: number; r: number; p: number },
  keyBytes: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      keyBytes,
      { N: params.N, r: params.r, p: params.p, maxmem: MAX_MEM },
      (err, key) => (err ? reject(err) : resolve(key)),
    );
  });
}

// Format: scrypt$N$r$p$salt$hash. Parameter ikut disimpan supaya bisa dinaikkan nanti.
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await derive(password, salt, PARAMS, KEY_BYTES);
  return [
    "scrypt",
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join("$");
}

type Parsed = { N: number; r: number; p: number; salt: Buffer; hash: Buffer };

function parse(stored: string): Parsed | null {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return null;
  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (![N, r, p].every((n) => Number.isInteger(n) && n > 0)) return null;
  const salt = Buffer.from(parts[4], "base64url");
  const hash = Buffer.from(parts[5], "base64url");
  if (hash.length < 16) return null;
  return { N, r, p, salt, hash };
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parsed = parse(stored);
  if (!parsed) return false;
  try {
    const key = await derive(password, parsed.salt, parsed, parsed.hash.length);
    return key.length === parsed.hash.length && timingSafeEqual(key, parsed.hash);
  } catch {
    return false;
  }
}

// Hash lama dengan parameter lebih lemah diperbarui saat login berhasil.
export function needsRehash(stored: string): boolean {
  const parsed = parse(stored);
  return (
    parsed === null ||
    parsed.N < PARAMS.N ||
    parsed.r < PARAMS.r ||
    parsed.p < PARAMS.p
  );
}

// Hash palsu untuk pengguna yang tidak ada. Membuat waktu respons login sama.
let dummy: Promise<string> | undefined;
export function dummyHash(): Promise<string> {
  dummy ??= hashPassword(randomBytes(16).toString("base64url"));
  return dummy;
}

// Sandi sementara 16 karakter. Huruf yang mudah tertukar (I, l, O, 0, 1) dibuang.
const TEMP_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
export function generateTemporaryPassword(length = 16): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += TEMP_ALPHABET[randomInt(TEMP_ALPHABET.length)];
  }
  return out;
}
