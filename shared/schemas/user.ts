import { z } from "zod";
import { passwordSchema, usernameSchema } from "./auth";

export const userIdInput = z.object({
  userId: z.number().int().positive(),
});

export const createUserInput = z.object({
  name: z.string().trim().min(1, { error: "REQUIRED" }).max(100),
  username: usernameSchema,
  phone: z.string().trim().max(20).optional(),
  password: passwordSchema,
  propertyIds: z.array(z.number().int().positive()).max(500),
});

export const setActiveInput = userIdInput.extend({
  isActive: z.boolean(),
});

export const setPropertyAccessInput = userIdInput.extend({
  propertyIds: z.array(z.number().int().positive()).max(500),
});
