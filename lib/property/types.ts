import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/root";

// Baris properti dari router (hanya tipe, TECH-SPEC 6.1).
export type PropertyRow = inferRouterOutputs<AppRouter>["property"]["list"][number];
