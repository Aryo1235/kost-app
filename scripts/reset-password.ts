import { authService } from "@/server/auth";
import { ask } from "./lib/prompt";

// yarn reset-password <username>: reset sandi owner lewat server (FR-AUTH-05).
// Sandi sementara ditampilkan sekali dan tidak dicatat di mana pun.
async function main(): Promise<void> {
  const username = process.argv[2] ?? (await ask("Username yang direset: "));
  if (!username) throw new Error("USERNAME_REQUIRED");

  const result = await authService.resetPasswordByUsername(username);
  console.log(`Kata sandi sementara untuk ${username}: ${result.temporaryPassword}`);
  console.log("Kata sandi ini hanya tampil sekali. Pengguna wajib menggantinya saat login.");
}

main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    const detail =
      typeof err === "object" && err !== null && "code" in err
        ? String(err.code)
        : err instanceof Error
          ? err.message
          : "UNKNOWN";
    console.error(`Gagal: ${detail}`);
    process.exit(1);
  });
