import type { ActiveProperty } from "@/lib/property/active";

export type PropertyOption = {
  id: number;
  name: string;
  electricityManaged: boolean;
  hasFacilities: boolean;
};

// Hasil pemilihan yang dipakai tampilan. Tidak mengubah izin: server tetap menentukan apa yang boleh dibaca.
export type Selection =
  | { kind: "all" }
  | { kind: "one"; property: PropertyOption }
  | { kind: "none" };

// Pilihan tersimpan diutamakan. Bila tidak ada atau sudah tidak valid, owner mendapat "Semua properti"
// dan pengelola mendapat properti pertama yang ditugaskan.
export function resolveSelection(
  active: ActiveProperty,
  properties: PropertyOption[],
  isOwner: boolean,
): Selection {
  if (active === "all" && isOwner) return { kind: "all" };
  if (typeof active === "number") {
    const found = properties.find((p) => p.id === active);
    if (found) return { kind: "one", property: found };
  }
  if (isOwner) return { kind: "all" };
  const first = properties[0];
  return first ? { kind: "one", property: first } : { kind: "none" };
}
