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
