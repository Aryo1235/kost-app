import { describe, expect, it } from "vitest";
import { createPropertyInput, updatePropertyInput } from "@/shared/schemas/property";

const base = { name: "Melati", address: "Jl. Contoh 1" };

// BR-17: fase 1 hanya mendukung pola Lampiran C (A sampai E). Pola lama CUSTOM tidak bisa dipilih lagi.
describe("skema properti: pola listrik", () => {
  it.each(["A", "B", "C", "D", "E"])("pola %s diterima", (pattern) => {
    expect(createPropertyInput.safeParse({ ...base, electricityPattern: pattern }).success).toBe(true);
  });

  it("pola CUSTOM ditolak saat membuat properti", () => {
    expect(createPropertyInput.safeParse({ ...base, electricityPattern: "CUSTOM" }).success).toBe(false);
  });

  it("pola CUSTOM ditolak saat mengubah properti", () => {
    expect(updatePropertyInput.safeParse({ propertyId: 1, electricityPattern: "CUSTOM" }).success).toBe(false);
  });

  it("pola bawaan saat membuat adalah A", () => {
    const parsed = createPropertyInput.parse(base);
    expect(parsed.electricityPattern).toBe("A");
  });
});
