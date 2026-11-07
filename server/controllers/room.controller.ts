import { services } from "@/server/services";
import { router } from "@/server/trpc/init";
import { orgProcedure, propertyProcedure } from "@/server/trpc/procedures";
import {
  createRoomInput,
  roomIdInput,
  roomListInput,
  updateRoomInput,
} from "@/shared/schemas/room";

// Kamar: pengelola dan owner sama-sama bisa C R U D di properti yang ditugaskan (PRD 2.2).
export const roomRouter = router({
  list: orgProcedure
    .input(roomListInput)
    .query(({ ctx, input }) => services.room.list(ctx.scope, input)),

  get: orgProcedure
    .input(roomIdInput)
    .query(({ ctx, input }) => services.room.get(ctx.scope, input.roomId)),

  // propertyProcedure memastikan propertyId berada dalam tugas pengelola.
  create: propertyProcedure
    .input(createRoomInput)
    .mutation(({ ctx, input }) => services.room.create(ctx.scope, input)),

  update: orgProcedure
    .input(updateRoomInput)
    .mutation(({ ctx, input }) => services.room.update(ctx.scope, input.roomId, input)),

  remove: orgProcedure
    .input(roomIdInput)
    .mutation(({ ctx, input }) => services.room.remove(ctx.scope, input.roomId)),
});
