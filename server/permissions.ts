import type { Role } from "@/shared/enums";

// Matriks hak akses (PRD 2.2) ditulis satu kali di sini.
// Server yang menegakkan; frontend hanya memakai daftar ini untuk menyembunyikan menu.
const PERMISSIONS = {
  OWNER: {
    manageProperties: true,
    manageUsers: true,
    viewAudit: true,
    manageSettings: true,
  },
  MANAGER: {
    manageProperties: false,
    manageUsers: false,
    viewAudit: false,
    manageSettings: false,
  },
} as const satisfies Record<Role, Record<string, boolean>>;

export type Permissions = (typeof PERMISSIONS)[Role];

export function permissionsFor(role: Role): Permissions {
  return PERMISSIONS[role];
}
