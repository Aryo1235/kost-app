// Nilai enum yang dipakai bersama. Hanya nilai, tanpa teks tampilan (AGENTS.md batas 3).
export const ROLES = ["OWNER", "MANAGER"] as const;
export type Role = (typeof ROLES)[number];

export const AUDIT_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "STATUS_CHANGE",
  "VIEW_SENSITIVE",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

// Jenis file privat. Dipakai sebagai bagian kunci file (TECH-SPEC 7.1).
export const FILE_KINDS = ["tenant", "ticket", "meter", "payment", "expense", "asset"] as const;
export type FileKind = (typeof FILE_KINDS)[number];

// Pola listrik siap pilih (PRD Lampiran C). A berarti listrik tidak dikelola aplikasi.
export const ELECTRICITY_PATTERNS = ["A", "B", "C", "D", "E", "CUSTOM"] as const;
// Pilihan yang boleh dikirim di fase 1 (BR-17): hanya pola Lampiran C. CUSTOM tinggal di data lama.
export const ELECTRICITY_PATTERN_OPTIONS = ["A", "B", "C", "D", "E"] as const;
export type ElectricityPattern = (typeof ELECTRICITY_PATTERNS)[number];

// Status kamar. OCCUPIED diatur otomatis saat tenant masuk (M2), tidak bisa diatur manual.
export const ROOM_STATUSES = ["AVAILABLE", "OCCUPIED", "BROKEN"] as const;
export type RoomStatus = (typeof ROOM_STATUSES)[number];
