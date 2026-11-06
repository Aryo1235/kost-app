import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Satu-satunya variabel yang boleh dibaca frontend (TECH-SPEC 11.1).
export const env = createEnv({
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  emptyStringAsUndefined: true,
});
