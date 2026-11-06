import type { Role } from "@/shared/enums";

// Batas akses satu permintaan. Dibentuk dari sesi di server, tidak pernah dari input klien.
// propertyIds "ALL" untuk owner (semua properti organisasinya).
export type Scope = {
  organizationId: number;
  userId: number;
  role: Role;
  propertyIds: readonly number[] | "ALL";
};
