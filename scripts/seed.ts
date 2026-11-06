import { seedDevData } from "@/server/db/seed";

// yarn db:seed: data contoh untuk pengembangan. Menghapus data di database dev lebih dulu.
seedDevData()
  .then((summary) => {
    console.log("Data contoh dibuat. Akun untuk pengujian lokal:");
    for (const a of summary.accounts) {
      console.log(`  ${a.role.padEnd(8)} ${a.username.padEnd(14)} ${a.password}   (${a.organization})`);
    }
    process.exit(0);
  })
  .catch((err: unknown) => {
    console.error(`Gagal: ${err instanceof Error ? err.message : "UNKNOWN"}`);
    process.exit(1);
  });
