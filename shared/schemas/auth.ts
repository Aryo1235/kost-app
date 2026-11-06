import { z } from "zod";

// Skema dipakai form (frontend) dan route (backend). Pesan galat berupa kode, bukan kalimat
// (AGENTS.md batas 5). Frontend memetakan kode ke teks di lib/errors.ts.
export const USERNAME_PATTERN = /^[a-z0-9._]{3,30}$/;

export const normalizeUsername = (raw: string): string => raw.trim().toLowerCase();

export const usernameSchema = z
  .string()
  .transform(normalizeUsername)
  .pipe(z.string().regex(USERNAME_PATTERN, { error: "USERNAME_INVALID" }));

export const passwordSchema = z
  .string()
  .min(10, { error: "PASSWORD_TOO_SHORT" })
  .max(128, { error: "PASSWORD_TOO_LONG" });

export const loginInput = z.object({
  username: z.string().min(1, { error: "REQUIRED" }).max(100),
  password: z.string().min(1, { error: "REQUIRED" }).max(128),
});

export const changePasswordInput = z.object({
  currentPassword: z.string().min(1, { error: "REQUIRED" }).max(128),
  newPassword: passwordSchema,
});
