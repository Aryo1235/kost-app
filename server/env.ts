import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Variabel khusus server. Hanya dibaca dari sini (TECH-SPEC 11.1).
export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    APP_ORIGIN: z.url(),
    FILE_SIGNING_SECRET: z.string().min(32),
    STORAGE_DIR: z.string().min(1).default("./storage"),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    APP_ORIGIN: process.env.APP_ORIGIN,
    FILE_SIGNING_SECRET: process.env.FILE_SIGNING_SECRET,
    STORAGE_DIR: process.env.STORAGE_DIR,
  },
  emptyStringAsUndefined: true,
});
