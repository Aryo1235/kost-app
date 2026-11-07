import { permissionsFor } from "@/server/permissions";
import { router } from "@/server/trpc/init";
import { sessionProcedure } from "@/server/trpc/procedures";

export const authRouter = router({
  // Profil sendiri dan izin. Boleh dipanggil saat wajib ganti sandi (FR-AUTH-06).
  me: sessionProcedure.query(({ ctx }) => {
    const { user, scope } = ctx.session;
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: ctx.session.organizationName,
      mustChangePassword: user.mustChangePassword,
      permissions: permissionsFor(user.role),
      // "ALL" untuk owner, daftar id properti untuk pengelola.
      propertyIds: scope.propertyIds === "ALL" ? "ALL" : [...scope.propertyIds],
    };
  }),
});
