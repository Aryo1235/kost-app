import { describe, expect, it } from "vitest";
import { resolveSelection, type PropertyOption } from "@/lib/property/selection";

const melati: PropertyOption = { id: 1, name: "Melati", electricityManaged: true, hasFacilities: false };
const mawar: PropertyOption = { id: 2, name: "Mawar", electricityManaged: false, hasFacilities: true };
const list = [melati, mawar];

describe("pemilihan properti di navbar", () => {
  it("owner tanpa pilihan melihat semua properti", () => {
    expect(resolveSelection(null, list, true)).toEqual({ kind: "all" });
  });

  it("pilihan 'all' hanya berlaku untuk owner", () => {
    expect(resolveSelection("all", list, true)).toEqual({ kind: "all" });
    expect(resolveSelection("all", list, false)).toEqual({ kind: "one", property: melati });
  });

  it("id yang dipilih dipakai bila masih ada dalam daftar", () => {
    expect(resolveSelection(2, list, true)).toEqual({ kind: "one", property: mawar });
  });

  it("id yang tidak ada lagi (misal akses dicabut) jatuh kembali ke bawaan", () => {
    expect(resolveSelection(99, list, true)).toEqual({ kind: "all" });
    expect(resolveSelection(99, list, false)).toEqual({ kind: "one", property: melati });
  });

  it("pengelola tanpa properti tidak punya pilihan", () => {
    expect(resolveSelection(null, [], false)).toEqual({ kind: "none" });
  });
});
