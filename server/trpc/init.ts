import { initTRPC, TRPCError } from "@trpc/server";
import { DomainError } from "@/server/errors";
import { childLogger } from "@/server/logger";
import type { Context } from "./context";

const log = childLogger("controller", "trpc");

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error, ctx }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Kode domain (mis. TENANT_HAS_UNPAID_INVOICES) untuk frontend, dan requestId untuk log.
        domainCode: error.cause instanceof DomainError ? error.cause.code : null,
        requestId: ctx?.requestId ?? null,
      },
    };
  },
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;

function toTrpcCode(status: number): TRPCError["code"] {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 422:
      return "PRECONDITION_FAILED";
    case 429:
      return "TOO_MANY_REQUESTS";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}

// Setiap prosedur lewat sini: mencatat hasil, dan mengubah galat domain menjadi TRPCError.
// Service tidak pernah melempar TRPCError (TECH-SPEC 2.3).
const observe = t.middleware(async ({ ctx, path, type, next }) => {
  const started = Date.now();
  const result = await next();
  if (result.ok) {
    log.info({ requestId: ctx.requestId, path, type, ms: Date.now() - started }, "prosedur selesai");
    return result;
  }
  const cause = result.error.cause;
  if (cause instanceof DomainError) {
    log.info({ requestId: ctx.requestId, path, code: cause.code }, "prosedur ditolak");
    throw new TRPCError({
      code: toTrpcCode(cause.status),
      message: cause.code,
      cause,
    });
  }
  log.error({ requestId: ctx.requestId, path, err: result.error.message }, "galat tak terduga");
  return result;
});

export const publicProcedure = t.procedure.use(observe);
