import { z } from "zod";

export const propertyIdInput = z.object({
  propertyId: z.number().int().positive(),
});

export const createPropertyInput = z.object({
  name: z.string().trim().min(1, { error: "REQUIRED" }).max(100),
  address: z.string().trim().min(1, { error: "REQUIRED" }).max(300),
});

export const updatePropertyInput = propertyIdInput.extend({
  name: z.string().trim().min(1, { error: "REQUIRED" }).max(100).optional(),
  address: z.string().trim().min(1, { error: "REQUIRED" }).max(300).optional(),
});
