import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";
import { assertSameOrigin } from "@/server/auth";
import { toErrorResponse } from "@/server/errors";
import { appRouter } from "@/server/trpc/root";
import { createContext } from "@/server/trpc/context";

// Adapter tipis ke tRPC (TECH-SPEC 2.1). Semua data kost lewat /api/trpc.
async function handler(req: NextRequest) {
  try {
    // Mutasi hanya lewat POST, dan POST wajib berasal dari APP_ORIGIN (TECH-SPEC 3.4).
    if (req.method === "POST") assertSameOrigin(req);
    return await fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext: () => createContext(req),
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export { handler as GET, handler as POST };
