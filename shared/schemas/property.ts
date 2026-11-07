import { z } from "zod";
import { ELECTRICITY_PATTERNS } from "@/shared/enums";

export const propertyIdInput = z.object({
  propertyId: z.number().int().positive(),
});

// Pengaturan properti (FR-PRO-04). Pola dan "listrik dikelola" diperiksa aturannya di server/domain.
const name = z.string().trim().min(1, { error: "REQUIRED" }).max(100);
const address = z.string().trim().min(1, { error: "REQUIRED" }).max(300);
const notes = z.string().trim().max(1000).optional();
const hasFacilities = z.boolean();
const electricityManaged = z.boolean();
const electricityPattern = z.enum(ELECTRICITY_PATTERNS);

// Saat membuat, pengaturan diisi bawaan: tanpa fasum, listrik tidak dikelola, pola A (Lampiran C).
export const createPropertyInput = z.object({
  name,
  address,
  notes,
  hasFacilities: hasFacilities.default(false),
  electricityManaged: electricityManaged.default(false),
  electricityPattern: electricityPattern.default("A"),
});

export const updatePropertyInput = propertyIdInput.extend({
  name: name.optional(),
  address: address.optional(),
  notes,
  hasFacilities: hasFacilities.optional(),
  electricityManaged: electricityManaged.optional(),
  electricityPattern: electricityPattern.optional(),
});

export const setPropertyActiveInput = propertyIdInput.extend({
  isActive: z.boolean(),
});
