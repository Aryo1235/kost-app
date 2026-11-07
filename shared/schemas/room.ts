import { z } from "zod";
import { ROOM_STATUSES } from "@/shared/enums";

// Batas harga sewa: bilangan bulat rupiah, tanpa desimal (BR-12).
const MAX_RENT = 1_000_000_000_000;

export const roomIdInput = z.object({
  roomId: z.number().int().positive(),
});

// Kode kamar: angka atau nama pendek. Keunikan per properti dicek di database (indeks parsial).
const roomFields = {
  code: z.string().trim().min(1, { error: "REQUIRED" }).max(20),
  roomType: z.string().trim().max(50).optional(),
  // Kosong dibedakan dari salah format agar form bisa menulis pesan yang tepat.
  baseRentAmount: z
    .number({ error: (issue) => (issue.input === undefined ? "REQUIRED" : "AMOUNT_INVALID") })
    .int({ error: "AMOUNT_INVALID" })
    .min(1, { error: "AMOUNT_INVALID" })
    .max(MAX_RENT, { error: "AMOUNT_INVALID" }),
  facilities: z.string().trim().max(300).optional(),
  // OCCUPIED lolos skema tetapi ditolak aturan domain: diatur otomatis saat tenant masuk (M2).
  status: z.enum(ROOM_STATUSES).optional(),
  notes: z.string().trim().max(1000).optional(),
};

export const createRoomInput = z.object({
  propertyId: z.number().int().positive(),
  ...roomFields,
  baseRentAmount: roomFields.baseRentAmount,
});

export const updateRoomInput = roomIdInput.extend({
  code: roomFields.code.optional(),
  roomType: roomFields.roomType,
  baseRentAmount: roomFields.baseRentAmount.optional(),
  facilities: roomFields.facilities,
  status: roomFields.status,
  notes: roomFields.notes,
});

export const roomListInput = z.object({
  propertyId: z.number().int().positive().optional(),
  search: z.string().trim().max(50).optional(),
  status: z.enum(ROOM_STATUSES).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});
