import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tes backend memakai PostgreSQL asli (AGENTS.md, TECH-SPEC 10).
// Tes SELALU memakai database *_test. DATABASE_URL dari shell atau .env ditimpa
// supaya tes tidak pernah menghapus data database dev.
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgres://kost:kost@127.0.0.1:5432/kost_test";
process.env.DATABASE_URL = TEST_DATABASE_URL;

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["./tests/setup/global.ts"],
    // Semua tes berbagi satu database, jadi berkas tes dijalankan berurutan.
    fileParallelism: false,
    testTimeout: 20_000,
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      APP_ORIGIN: "http://localhost:3000",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      FILE_SIGNING_SECRET: "test-only-secret-minimal-tiga-puluh-dua-karakter",
      STORAGE_DIR: "./.test-storage",
    },
  },
});
