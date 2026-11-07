// Filter properti per halaman (design.md 6.16, PRD FR-PRO-02 dan FR-PRO-06).
// Cakupan ditentukan oleh `?properti=ID` di halaman itu, bukan pilihan global. Hanya tampilan:
// server tetap membatasi data ke properti yang boleh diakses (AGENTS.md aturan 2).
export type FilterProperty = { id: number; name: string };

export type PropertyFilter = {
  // Tampilkan kontrol filter. Tidak tampil bila hanya ada satu properti (nama ditulis di header).
  show: boolean;
  // Teks pilihan "semua": owner "Semua properti", pengelola "Semua properti saya".
  allLabel: string;
  // Properti yang sedang disaring. Kosong berarti semua yang tercakup.
  selectedId: number | undefined;
  // Keterangan cakupan untuk header halaman.
  scopeLabel: string | undefined;
  // Lebih dari satu properti tercakup: daftar menampilkan kolom Properti.
  multiple: boolean;
};

// Membaca `?properti=`. Nilai yang bukan bilangan bulat positif dianggap tidak ada.
export function parsePropertyParam(raw: string | null | undefined): number | undefined {
  if (!raw) return undefined;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

export function resolvePropertyFilter(
  param: number | undefined,
  properties: FilterProperty[],
  isOwner: boolean,
): PropertyFilter {
  const allLabel = isOwner ? "Semua properti" : "Semua properti saya";
  const only = properties.length === 1 ? properties[0] : undefined;
  if (properties.length === 0) {
    return { show: false, allLabel, selectedId: undefined, scopeLabel: undefined, multiple: false };
  }
  if (only) {
    return { show: false, allLabel, selectedId: only.id, scopeLabel: only.name, multiple: false };
  }
  // Id yang tidak ada dalam daftar (akses dicabut, atau diketik sembarang) diperlakukan sebagai "semua".
  const selected = properties.find((p) => p.id === param);
  return {
    show: true,
    allLabel,
    selectedId: selected?.id,
    scopeLabel: selected?.name ?? allLabel,
    multiple: selected === undefined,
  };
}
