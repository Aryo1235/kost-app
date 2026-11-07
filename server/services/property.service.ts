import type { Db } from "@/server/db/client";
import { ForbiddenError, NotFoundError } from "@/server/errors";
import { assertPatternSettings } from "@/server/domain/property.rules";
import { PropertyRepository } from "@/server/repositories/property.repository";
import type { Scope } from "@/server/scope";
import type { createPropertyInput, updatePropertyInput } from "@/shared/schemas/property";
import type { z } from "zod";
import { AuditService } from "./audit.service";

type CreateInput = z.infer<typeof createPropertyInput>;
type UpdateInput = z.infer<typeof updatePropertyInput>;

// Hanya owner yang membuat, mengubah, dan menonaktifkan properti (PRD 2.2).
function requireOwner(scope: Scope): void {
  if (scope.role !== "OWNER") throw new ForbiddenError();
}

export class PropertyService {
  constructor(private readonly deps: { db: Db }) {}

  // Properti nonaktif hanya ikut dibaca oleh owner, dan hanya bila diminta (FR-PRO-03).
  list(scope: Scope, options: { includeInactive?: boolean } = {}) {
    const includeInactive = options.includeInactive === true && scope.role === "OWNER";
    return new PropertyRepository(this.deps.db, scope).list({ includeInactive });
  }

  async get(scope: Scope, propertyId: number) {
    const row = await new PropertyRepository(this.deps.db, scope).findById(propertyId);
    if (!row) throw new NotFoundError("PROPERTY_NOT_FOUND");
    return row;
  }

  async create(scope: Scope, input: CreateInput) {
    requireOwner(scope);
    assertPatternSettings({
      electricityPattern: input.electricityPattern,
      electricityManaged: input.electricityManaged,
    });
    return this.deps.db.transaction(async (tx) => {
      const row = await new PropertyRepository(tx, scope).insert(input);
      await AuditService.record(tx, scope, {
        entityType: "property",
        entityId: row.id,
        propertyId: row.id,
        action: "CREATE",
        after: settingsOf(row),
      });
      return row;
    });
  }

  async update(scope: Scope, input: UpdateInput) {
    requireOwner(scope);
    return this.deps.db.transaction(async (tx) => {
      const repo = new PropertyRepository(tx, scope);
      const before = await repo.findById(input.propertyId);
      if (!before) throw new NotFoundError("PROPERTY_NOT_FOUND");

      // Pola dan "listrik dikelola" diperiksa setelah digabung dengan nilai yang tersimpan.
      assertPatternSettings({
        electricityPattern: input.electricityPattern ?? before.electricityPattern,
        electricityManaged: input.electricityManaged ?? before.electricityManaged,
      });

      const patch = definedOnly({
        name: input.name,
        address: input.address,
        notes: input.notes,
        hasFacilities: input.hasFacilities,
        electricityManaged: input.electricityManaged,
        electricityPattern: input.electricityPattern,
      });
      const after = await repo.update(input.propertyId, patch);
      if (!after) throw new NotFoundError("PROPERTY_NOT_FOUND");

      await AuditService.record(tx, scope, {
        entityType: "property",
        entityId: after.id,
        propertyId: after.id,
        action: "UPDATE",
        before: settingsOf(before),
        after: settingsOf(after),
      });
      return after;
    });
  }

  // Menonaktifkan atau mengaktifkan kembali properti. Datanya tetap ada (FR-PRO-03).
  async setActive(scope: Scope, propertyId: number, isActive: boolean) {
    requireOwner(scope);
    return this.deps.db.transaction(async (tx) => {
      const repo = new PropertyRepository(tx, scope);
      const before = await repo.findById(propertyId);
      if (!before) throw new NotFoundError("PROPERTY_NOT_FOUND");
      const after = await repo.setActive(propertyId, isActive);
      if (!after) throw new NotFoundError("PROPERTY_NOT_FOUND");

      await AuditService.record(tx, scope, {
        entityType: "property",
        entityId: after.id,
        propertyId: after.id,
        action: "STATUS_CHANGE",
        before: { isActive: before.isActive },
        after: { isActive: after.isActive },
      });
      return after;
    });
  }
}

// Pengaturan yang dicatat di audit (FR-PRO-04).
function settingsOf(row: {
  name: string;
  address: string;
  notes: string | null;
  hasFacilities: boolean;
  electricityManaged: boolean;
  electricityPattern: string;
}) {
  return {
    name: row.name,
    address: row.address,
    notes: row.notes,
    hasFacilities: row.hasFacilities,
    electricityManaged: row.electricityManaged,
    electricityPattern: row.electricityPattern,
  };
}

// Hanya kolom yang benar-benar dikirim yang diubah. Nilai undefined dilewati.
function definedOnly<T extends Record<string, unknown>>(values: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(values).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}
