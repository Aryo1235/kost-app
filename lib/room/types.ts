import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/trpc/root";

// Tipe tampilan kamar diturunkan dari router (hanya tipe, TECH-SPEC 6.1).
export type RoomListResult = inferRouterOutputs<AppRouter>["room"]["list"];
export type RoomRow = RoomListResult["rows"][number];
export type RoomDetail = inferRouterOutputs<AppRouter>["room"]["get"];
