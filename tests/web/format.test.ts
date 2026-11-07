import { describe, expect, it } from "vitest";
import { formatRupiah } from "@/lib/format";
import { formatRupiahInput, parseRupiahInput } from "@/components/shared/money-input";

describe("formatRupiah", () => {
  it("memakai titik ribuan dan spasi tak terputus", () => {
    expect(formatRupiah(1_250_000)).toBe("Rp 1.250.000");
    expect(formatRupiah(0)).toBe("Rp 0");
  });

  it("nilai negatif diberi tanda minus di depan Rp", () => {
    expect(formatRupiah(-250_000)).toBe("-Rp 250.000");
  });
});

describe("MoneyInput: parsing ketikan", () => {
  it("hanya angka yang diambil, titik dan spasi dibuang", () => {
    expect(parseRupiahInput("1.250.000")).toBe(1_250_000);
    expect(parseRupiahInput("Rp 1 250")).toBe(1250);
  });

  it("kosong berarti belum diisi, bukan nol", () => {
    expect(parseRupiahInput("")).toBeUndefined();
    expect(parseRupiahInput("Rp")).toBeUndefined();
  });

  it("tanda minus tidak bisa diketik, jadi nilai selalu tidak negatif", () => {
    expect(parseRupiahInput("-500")).toBe(500);
  });

  it("tampilan memakai titik ribuan", () => {
    expect(formatRupiahInput(1_250_000)).toBe("1.250.000");
    expect(formatRupiahInput(undefined)).toBe("");
  });
});
