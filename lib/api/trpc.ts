import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@/server/trpc/root";

// Satu-satunya impor dari server/ di frontend: tipe saja (AGENTS.md batas 1).
export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();
