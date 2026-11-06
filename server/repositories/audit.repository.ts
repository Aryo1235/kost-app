import { desc } from "drizzle-orm";
import { auditLogs } from "@/server/db/schema";
import type { AuditAction } from "@/shared/enums";
import { BaseRepository } from "./base.repository";

export type AuditRow = typeof auditLogs.$inferSelect;

// Audit hanya punya insert dan list. Tidak ada ubah atau hapus (FR-AUD-04).
export class AuditRepository extends BaseRepository {
  // actor_id selalu dari scope (FR-AUD-02). Nilai dari input tidak dipakai.
  async insert(values: {
    propertyId: number | null;
    entityType: string;
    entityId: string;
    action: AuditAction;
    before: unknown;
    after: unknown;
  }): Promise<AuditRow> {
    const [row] = await this.db
      .insert(auditLogs)
      .values(
        this.withOrg({
          propertyId: values.propertyId,
          actorId: this.scope.userId,
          entityType: values.entityType,
          entityId: values.entityId,
          action: values.action,
          beforeJson: values.before ?? null,
          afterJson: values.after ?? null,
        }),
      )
      .returning();
    return row;
  }

  async list(limit = 50): Promise<AuditRow[]> {
    return this.db
      .select()
      .from(auditLogs)
      .where(this.orgWhere(auditLogs.organizationId))
      .orderBy(desc(auditLogs.id))
      .limit(limit);
  }
}
