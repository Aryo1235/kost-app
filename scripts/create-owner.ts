import { authService } from "@/server/auth";
import { passwordSchema, usernameSchema } from "@/shared/schemas/auth";
import { ask, askSecret } from "./lib/prompt";

// yarn create-owner: membuat organisasi dan akun owner pertama (TECH-SPEC 3.5).
async function main(): Promise<void> {
  const organizationName = await ask("Nama organisasi: ");
  if (!organizationName) throw new Error("NAME_REQUIRED");
  const name = await ask("Nama lengkap owner: ");
  if (!name) throw new Error("NAME_REQUIRED");

  const usernameResult = usernameSchema.safeParse(await ask("Username (huruf kecil, 3-30 karakter): "));
  if (!usernameResult.success) throw new Error("USERNAME_INVALID");

  const password = await askSecret("Kata sandi (minimal 10 karakter): ");
  const passwordResult = passwordSchema.safeParse(password);
  if (!passwordResult.success) throw new Error("PASSWORD_INVALID");
  const confirm = await askSecret("Ulangi kata sandi: ");
  if (confirm !== password) throw new Error("PASSWORD_MISMATCH");

  const result = await authService.createOwner({
    organizationName,
    name,
    username: usernameResult.data,
    password,
  });
  console.log(`Owner dibuat. Organisasi ${result.organizationId}, pengguna ${result.userId}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    const code = err instanceof Error ? err.message : "UNKNOWN";
    const detail = typeof err === "object" && err !== null && "code" in err ? String(err.code) : code;
    console.error(`Gagal: ${detail}`);
    process.exit(1);
  });
