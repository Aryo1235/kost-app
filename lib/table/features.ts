import { tableFeatures } from "@tanstack/react-table";

// Fitur tabel yang dipakai di seluruh aplikasi. Paginasi, cari, dan filter dilakukan di server,
// jadi tidak ada fitur klien yang diaktifkan di sini (TECH-SPEC 6.3).
export const tableFeatureSet = tableFeatures({});
export type TableFeatureSet = typeof tableFeatureSet;
