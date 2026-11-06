import { services } from "@/server/services";
import { router } from "@/server/trpc/init";
import { orgProcedure, ownerProcedure, propertyProcedure } from "@/server/trpc/procedures";
import { createPropertyInput, updatePropertyInput } from "@/shared/schemas/property";

export const propertyRouter = router({
  list: orgProcedure.query(({ ctx }) => services.property.list(ctx.scope)),

  get: propertyProcedure.query(({ ctx, input }) =>
    services.property.get(ctx.scope, input.propertyId),
  ),

  create: ownerProcedure
    .input(createPropertyInput)
    .mutation(({ ctx, input }) => services.property.create(ctx.scope, input)),

  update: ownerProcedure
    .input(updatePropertyInput)
    .mutation(({ ctx, input }) => services.property.update(ctx.scope, input)),
});
