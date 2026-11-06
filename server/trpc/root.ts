import { authRouter } from "@/server/controllers/auth.controller";
import { propertyRouter } from "@/server/controllers/property.controller";
import { userRouter } from "@/server/controllers/user.controller";
import { router } from "./init";

export const appRouter = router({
  auth: authRouter,
  property: propertyRouter,
  user: userRouter,
});

// Satu-satunya yang boleh diimpor frontend dari server/ (import type, AGENTS.md batas 1).
export type AppRouter = typeof appRouter;
