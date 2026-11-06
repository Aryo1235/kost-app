// Teks tampilan untuk nilai enum dan status (AGENTS.md batas 5). Komponen tidak menulis label sendiri.
import type { Role } from "@/shared/enums";

export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Owner",
  MANAGER: "Pengelola",
};

export function activeStatus(isActive: boolean): { label: string; tone: Tone } {
  return isActive ? { label: "Aktif", tone: "info" } : { label: "Nonaktif", tone: "neutral" };
}
