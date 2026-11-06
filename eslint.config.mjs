import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Batas FE/BE (TECH-SPEC 2.2, AGENTS.md batas 1-3).
  // 1) Frontend tidak boleh mengimpor kode server/ kecuali import type.
  {
    files: ["app/**", "components/**", "lib/**", "types/**"],
    ignores: ["app/api/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/*", "**/server/**"],
              allowTypeImports: true,
              message:
                "Frontend tidak boleh mengimpor kode backend. Pakai tRPC, atau import type.",
            },
          ],
        },
      ],
    },
  },
  // 2) Backend tidak boleh mengimpor frontend.
  {
    files: ["server/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/*", "@/components/*", "@/lib/*", "@/types/*"],
              message: "Backend tidak boleh mengimpor frontend.",
            },
          ],
        },
      ],
    },
  },
  // 3) shared/ hanya boleh bergantung pada zod.
  {
    files: ["shared/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/*", "@/app/*", "@/components/*", "@/lib/*", "@/types/*"],
              message: "shared/ tidak boleh bergantung pada sisi mana pun.",
            },
          ],
        },
      ],
    },
  },
  // 4) Klien db mentah hanya dipakai di server/db, repository, dan service (TECH-SPEC 3.1).
  // Memakai aturan inti no-restricted-imports agar tidak menimpa aturan 1-3 di atas.
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["server/db/**", "server/repositories/**", "server/services/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/db/client", "**/server/db/client"],
              message:
                "Klien db hanya boleh dipakai di repository atau service.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Berkas skill dan alat bantu agen, bukan kode aplikasi.
    ".claude/**",
    ".kilo/**",
  ]),
]);

export default eslintConfig;
