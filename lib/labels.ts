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

// Pola listrik (PRD Lampiran C). Keterangan menjelaskan siapa yang membayar PLN dan apakah ditagihkan.
export const ELECTRICITY_PATTERN_LABELS: Record<ElectricityPattern, { label: string; note: string }> = {
  A: {
    label: "Pola A",
    note: "Penyewa membayar listrik sendiri ke PLN. Aplikasi tidak mencatat listrik, dan menu Listrik tidak tampil.",
  },
  B: {
    label: "Pola B",
    note: "Pemilik membeli token atau membayar tagihan PLN per kamar. Biayanya tidak ditagihkan ke penyewa dan dicatat sebagai pengeluaran.",
  },
  C: {
    label: "Pola C",
    note: "Pemilik membayar PLN per kamar, lalu menagihkannya ke penyewa lewat tagihan, per kWh atau flat. Angka meteran dicatat tiap bulan.",
  },
  D: {
    label: "Pola D",
    note: "Satu meteran untuk beberapa kamar, dibayar pemilik. Biayanya tidak ditagihkan ke penyewa dan dicatat sebagai satu pengeluaran.",
  },
  E: {
    label: "Pola E",
    note: "Satu meteran untuk beberapa kamar, dibayar pemilik, lalu ditagihkan ke penyewa dengan nominal flat per kamar.",
  },
  // Pola lama dari data sebelum BR-17. Tidak bisa dipilih lagi.
  CUSTOM: { label: "Lainnya (pola lama)", note: "Pola ini tidak lagi dipakai. Pilih pola A sampai E." },
};

export const ROOM_STATUS_LABELS: Record<RoomStatus, { label: string; tone: Tone }> = {
  AVAILABLE: { label: "Kosong", tone: "neutral" },
  OCCUPIED: { label: "Terisi", tone: "info" },
  BROKEN: { label: "Rusak", tone: "danger" },
};
