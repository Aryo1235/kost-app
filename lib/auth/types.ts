import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/root";

// Tipe tampilan diturunkan dari router (TECH-SPEC 6.1). Hanya tipe, bukan kode backend.
export type Me = inferRouterOutputs<AppRouter>["auth"]["me"];
