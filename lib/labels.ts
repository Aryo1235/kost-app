// Teks tampilan untuk nilai enum dan status (AGENTS.md batas 5). Komponen tidak menulis label sendiri.
import type { ElectricityPattern, Role, RoomStatus } from "@/shared/enums";

export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Owner",
  MANAGER: "Pengelola",
};

export function activeStatus(isActive: boolean): { label: string; tone: Tone } {
  return isActive ? { label: "Aktif", tone: "info" } : { label: "Nonaktif", tone: "neutral" };
}

// Pola listrik siap pilih (PRD Lampiran C), dengan keterangan singkat untuk pengaturan properti.
export const ELECTRICITY_PATTERN_LABELS: Record<ElectricityPattern, { label: string; note: string }> = {
  A: { label: "Pola A", note: "Penyewa membayar listrik sendiri. Tidak dikelola aplikasi." },
  B: { label: "Pola B", note: "Pemilik membayar token atau tagihan PLN per meteran." },
  C: { label: "Pola C", note: "Per kamar, ditagihkan ke penyewa lewat tagihan." },
  D: { label: "Pola D", note: "Satu meteran untuk beberapa kamar, ditanggung pemilik." },
  E: { label: "Pola E", note: "Satu meteran untuk beberapa kamar, ditagihkan ke penyewa." },
  CUSTOM: { label: "Lainnya", note: "Pengaturan listrik diatur sendiri." },
};

export const ROOM_STATUS_LABELS: Record<RoomStatus, { label: string; tone: Tone }> = {
  AVAILABLE: { label: "Kosong", tone: "neutral" },
  OCCUPIED: { label: "Terisi", tone: "info" },
  BROKEN: { label: "Rusak", tone: "danger" },
};
