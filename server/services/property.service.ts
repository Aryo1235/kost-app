import type { Db } from "@/server/db/client";
import { ForbiddenError, NotFoundError } from "@/server/errors";
import { PropertyRepository } from "@/server/repositories/property.repository";
import type { Scope } from "@/server/scope";
import type { createPropertyInput, updatePropertyInput } from "@/shared/schemas/property";
import type { z } from "zod";
import { AuditService } from "./audit.service";

type CreateInput = z.infer<typeof createPropertyInput>;
type UpdateInput = z.infer<typeof updatePropertyInput>;

export class PropertyService {
  constructor(private readonly deps: { db: Db }) {}

  list(scope: Scope) {
    return new PropertyRepository(this.deps.db, scope).list();
  }

  async get(scope: Scope, propertyId: number) {
    const row = await new PropertyRepository(this.deps.db, scope).findById(propertyId);
    if (!row) throw new NotFoundError("PROPERTY_NOT_FOUND");
    return row;
  }

  // Hanya owner yang membuat dan mengubah properti (PRD 2.2).
  async create(scope: Scope, input: CreateInput) {
    if (scope.role !== "OWNER") throw new ForbiddenError();
    return this.deps.db.transaction(async (tx) => {
      const row = await new PropertyRepository(tx, scope).insert(input);
      await AuditService.record(tx, scope, {
        entityType: "property",
        entityId: row.id,
        propertyId: row.id,
        action: "CREATE",
        after: { name: row.name, address: row.address },
      });
      return row;
    });
  }

  async update(scope: Scope, input: UpdateInput) {
    if (scope.role !== "OWNER") throw new ForbiddenError();
    return this.deps.db.transaction(async (tx) => {
      const repo = new PropertyRepository(tx, scope);
      const before = await repo.findById(input.propertyId);
      if (!before) throw new NotFoundError("PROPERTY_NOT_FOUND");

      const patch: { name?: string; address?: string } = {};
      if (input.name !== undefined) patch.name = input.name;
      if (input.address !== undefined) patch.address = input.address;
      const after = await repo.update(input.propertyId, patch);
      if (!after) throw new NotFoundError("PROPERTY_NOT_FOUND");

      await AuditService.record(tx, scope, {
        entityType: "property",
        entityId: after.id,
        propertyId: after.id,
        action: "UPDATE",
        before: { name: before.name, address: before.address },
        after: { name: after.name, address: after.address },
      });
      return after;
    });
  }
}
