import { AuditRepository } from "@/server/repositories/audit.repository";
import type { DbClient } from "@/server/repositories/base.repository";
import type { Scope } from "@/server/scope";
import type { AuditAction } from "@/shared/enums";

export type AuditEntry = {
  entityType: string;
  entityId: string | number;
  action: AuditAction;
  before?: unknown;
  after?: unknown;
  propertyId?: number | null;
};

export class AuditService {
  // Dipanggil dari service lain, dengan koneksi transaksi yang sama dengan perubahannya (TECH-SPEC 4).
  static record(db: DbClient, scope: Scope, entry: AuditEntry) {
    return new AuditRepository(db, scope).insert({
      propertyId: entry.propertyId ?? null,
      entityType: entry.entityType,
      entityId: String(entry.entityId),
      action: entry.action,
      before: entry.before ?? null,
      after: entry.after ?? null,
    });
  }
}
