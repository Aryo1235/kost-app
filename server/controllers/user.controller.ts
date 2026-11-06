import { services } from "@/server/services";
import { router } from "@/server/trpc/init";
import { ownerProcedure } from "@/server/trpc/procedures";
import { createUserInput, setActiveInput, setPropertyAccessInput, userIdInput } from "@/shared/schemas/user";

export const userRouter = router({
  list: ownerProcedure.query(({ ctx }) => services.user.list(ctx.scope)),

  create: ownerProcedure
    .input(createUserInput)
    .mutation(({ ctx, input }) => services.user.create(ctx.scope, input)),

  setActive: ownerProcedure
    .input(setActiveInput)
    .mutation(({ ctx, input }) =>
      services.user.setActive(ctx.scope, input.userId, input.isActive),
    ),

  setPropertyAccess: ownerProcedure
    .input(setPropertyAccessInput)
    .mutation(({ ctx, input }) =>
      services.user.setPropertyAccess(ctx.scope, input.userId, input.propertyIds),
    ),

  // Mengembalikan sandi sementara sekali. Tidak dicatat di log (FR-AUTH-05).
  resetPassword: ownerProcedure
    .input(userIdInput)
    .mutation(({ ctx, input }) => services.user.resetPassword(ctx.scope, input.userId)),
});
