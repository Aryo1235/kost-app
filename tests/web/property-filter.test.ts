import { describe, expect, it } from "vitest";
import { parsePropertyParam, resolvePropertyFilter } from "@/lib/property/filter";

const melati = { id: 1, name: "Melati" };
const mawar = { id: 2, name: "Mawar" };

describe("parameter ?properti", () => {
  it("bilangan bulat positif dibaca, sisanya dianggap tidak ada", () => {
    expect(parsePropertyParam("3")).toBe(3);
    expect(parsePropertyParam("0")).toBeUndefined();
    expect(parsePropertyParam("-2")).toBeUndefined();
    expect(parsePropertyParam("abc")).toBeUndefined();
    expect(parsePropertyParam("1.5")).toBeUndefined();
    expect(parsePropertyParam(null)).toBeUndefined();
    expect(parsePropertyParam("")).toBeUndefined();
  });
});

describe("filter properti per halaman (FR-PRO-02, FR-PRO-06)", () => {
  it("owner dengan banyak properti: nilai awal 'Semua properti' dan kolom Properti tampil", () => {
    expect(resolvePropertyFilter(undefined, [melati, mawar], true)).toEqual({
      show: true,
      allLabel: "Semua properti",
      selectedId: undefined,
      scopeLabel: "Semua properti",
      multiple: true,
    });
  });

  it("pengelola dengan banyak properti melihat 'Semua properti saya'", () => {
    const filter = resolvePropertyFilter(undefined, [melati, mawar], false);
    expect(filter.allLabel).toBe("Semua properti saya");
    expect(filter.scopeLabel).toBe("Semua properti saya");
  });

  it("satu properti dipilih: header menyebut namanya dan kolom Properti hilang", () => {
    expect(resolvePropertyFilter(2, [melati, mawar], true)).toMatchObject({
      show: true,
      selectedId: 2,
      scopeLabel: "Mawar",
      multiple: false,
    });
  });

  it("id yang tidak ada dalam daftar jatuh kembali ke semua", () => {
    expect(resolvePropertyFilter(99, [melati, mawar], false)).toMatchObject({
      selectedId: undefined,
      multiple: true,
    });
  });

  it("hanya satu properti: tanpa filter, nama ditulis di header, tidak ada kolom Properti", () => {
    expect(resolvePropertyFilter(undefined, [melati], false)).toEqual({
      show: false,
      allLabel: "Semua properti saya",
      selectedId: 1,
      scopeLabel: "Melati",
      multiple: false,
    });
  });

  it("tanpa properti: tidak ada filter dan tidak ada cakupan", () => {
    expect(resolvePropertyFilter(undefined, [], true)).toMatchObject({
      show: false,
      selectedId: undefined,
      scopeLabel: undefined,
    });
  });
});
