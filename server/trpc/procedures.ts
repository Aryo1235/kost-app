import { z } from "zod";
import { ForbiddenError, UnauthorizedError } from "@/server/errors";
import { publicProcedure } from "./init";

// Hanya cek kesehatan dan halaman masuk. Data kost tidak boleh memakai ini.
export { publicProcedure };

// Sesi valid dan pengguna aktif. Dipakai hanya untuk auth.me (boleh saat wajib ganti sandi).
export const sessionProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session) throw new UnauthorizedError();
  return next({ ctx: { session: ctx.session } });
});

// Sesi valid dan sudah mengganti sandi awal (FR-AUTH-06).
export const authedProcedure = sessionProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.mustChangePassword) {
    throw new ForbiddenError("PASSWORD_CHANGE_REQUIRED");
  }
  return next();
});

// Dasar semua data kost. Memberi scope organisasi dan akses properti.
export const orgProcedure = authedProcedure.use(({ ctx, next }) =>
  next({ ctx: { scope: ctx.session.scope } }),
);

// Hanya owner (PRD 2.2).
export const ownerProcedure = orgProcedure.use(({ ctx, next }) => {
  if (ctx.scope.role !== "OWNER") throw new ForbiddenError();
  return next();
});

// Prosedur yang menerima propertyId. Pengelola hanya ke properti yang ditugaskan.
export const propertyProcedure = orgProcedure
  .input(z.object({ propertyId: z.number().int().positive() }))
  .use(({ ctx, input, next }) => {
    const allowed =
      ctx.scope.propertyIds === "ALL" || ctx.scope.propertyIds.includes(input.propertyId);
    if (!allowed) throw new ForbiddenError();
    return next();
  });
