import { describe, expect, it } from "vitest";
import { fieldErrorMessage } from "@/lib/errors";
import { createRoomInput } from "@/shared/schemas/room";

const base = { propertyId: 1, code: "A-01", baseRentAmount: 1_000_000 };

// Skema kamar dipakai form dan server. Pesan galat berupa kode, lalu dipetakan ke kalimat di lib/errors.ts.
describe("skema kamar: harga sewa", () => {
  it("bilangan bulat lebih dari 0 diterima", () => {
    expect(createRoomInput.safeParse(base).success).toBe(true);
    expect(createRoomInput.safeParse({ ...base, baseRentAmount: 1 }).success).toBe(true);
  });

  it("harga nol ditolak AMOUNT_INVALID (design.md 6.4: harus lebih dari 0)", () => {
    const result = createRoomInput.safeParse({ ...base, baseRentAmount: 0 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("AMOUNT_INVALID");
  });

  it("harga desimal ditolak AMOUNT_INVALID", () => {
    const result = createRoomInput.safeParse({ ...base, baseRentAmount: 1000.5 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("AMOUNT_INVALID");
  });

  it("harga negatif ditolak AMOUNT_INVALID", () => {
    const result = createRoomInput.safeParse({ ...base, baseRentAmount: -1 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("AMOUNT_INVALID");
  });

  it("harga kosong ditolak REQUIRED, bukan pesan Zod bawaan", () => {
    const result = createRoomInput.safeParse({ ...base, baseRentAmount: undefined });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("REQUIRED");
  });
});

describe("skema kamar: kode dan status", () => {
  it("kode kosong ditolak REQUIRED", () => {
    const result = createRoomInput.safeParse({ ...base, code: "   " });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("REQUIRED");
  });

  it("status OCCUPIED lolos skema dan baru ditolak aturan domain (FR-ROOM-03)", () => {
    expect(createRoomInput.safeParse({ ...base, status: "OCCUPIED" }).success).toBe(true);
  });
});

describe("galat satu kolom", () => {
  it("kode dari skema dipetakan ke kalimat Indonesia", () => {
    expect(fieldErrorMessage("REQUIRED")).toBe("Kolom ini wajib diisi.");
  });

  it("pesan bawaan Zod diganti kalimat umum, bukan ditampilkan mentah", () => {
    expect(fieldErrorMessage("Too big: expected string to have <=20 characters")).toBe(
      "Isian ini belum benar.",
    );
  });

  it("tanpa galat tidak ada pesan", () => {
    expect(fieldErrorMessage(undefined)).toBeUndefined();
    expect(fieldErrorMessage("")).toBeUndefined();
  });
});
