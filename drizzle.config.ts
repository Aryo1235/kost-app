import { defineConfig } from "drizzle-kit";

// DATABASE_URL dimuat dari .env lewat skrip package.json (node --env-file-if-exists).
export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
