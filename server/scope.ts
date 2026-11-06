import type { Role } from "@/shared/enums";

// Batas akses satu permintaan. Dibentuk dari sesi di server, tidak pernah dari input klien.
// propertyIds "ALL" untuk owner (semua properti organisasinya).
export type Scope = {
  organizationId: number;
  // null untuk aksi sistem dari skrip server (create-owner, reset-password).
  userId: number | null;
  role: Role;
  propertyIds: readonly number[] | "ALL";
};

// Scope untuk skrip server. Tidak ada pengguna sebagai aktor.
export function systemScope(organizationId: number): Scope {
  return { organizationId, userId: null, role: "OWNER", propertyIds: "ALL" };
}
