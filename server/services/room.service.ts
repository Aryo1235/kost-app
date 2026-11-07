import type { Db } from "@/server/db/client";
import {
  assertManualRoomStatus,
  assertPropertyAcceptsRooms,
} from "@/server/domain/room.rules";
import {
  BusinessRuleError,
  ConflictError,
  ForbiddenError,
  isUniqueViolation,
  NotFoundError,
} from "@/server/errors";
import { PropertyRepository } from "@/server/repositories/property.repository";
import {
  RoomRepository,
  type RoomRow,
  type RoomValues,
} from "@/server/repositories/room.repository";
import type { Scope } from "@/server/scope";
import type { RoomStatus } from "@/shared/enums";
import { AuditService } from "./audit.service";

type CreateRoomInput = {
  propertyId: number;
  code: string;
  roomType?: string;
  baseRentAmount: number;
  facilities?: string;
  status?: RoomStatus;
  notes?: string;
};

type UpdateRoomInput = {
  code?: string;
  roomType?: string;
  baseRentAmount?: number;
  facilities?: string;
  status?: RoomStatus;
  notes?: string;
};

// Kamar yang disimpan. Teks kosong disimpan sebagai NULL.
function toValues(input: CreateRoomInput): RoomValues {
  return {
    propertyId: input.propertyId,
    code: input.code,
    roomType: input.roomType ?? null,
    baseRentAmount: input.baseRentAmount,
    facilities: input.facilities ?? null,
    status: input.status ?? "AVAILABLE",
    notes: input.notes ?? null,
  };
}

function snapshotOf(row: RoomRow) {
  return {
    code: row.code,
    roomType: row.roomType,
    baseRentAmount: row.baseRentAmount,
    facilities: row.facilities,
    status: row.status,
    notes: row.notes,
  };
}

export class RoomService {
  constructor(private readonly deps: { db: Db }) {}

  // Titik panggilan untuk FR-ROOM-04 dan FR-ROOM-06. Di M1 belum ada tenant, jadi selalu false.
  // M2 menyambungkannya ke tabel tenants.
  private async hasActiveTenant(roomId: number): Promise<boolean> {
    void roomId; // dipakai di M2
    return false;
  }

  async list(
    scope: Scope,
    filter: { propertyId?: number; search?: string; status?: RoomStatus; page: number; pageSize: number },
  ) {
    // Pengelola yang meminta properti di luar tugasnya ditolak, bukan dikembalikan kosong.
    if (
      filter.propertyId !== undefined &&
      scope.propertyIds !== "ALL" &&
      !scope.propertyIds.includes(filter.propertyId)
    ) {
      throw new ForbiddenError();
    }
    return new RoomRepository(this.deps.db, scope).list(filter);
  }

  async get(scope: Scope, roomId: number) {
    const row = await new RoomRepository(this.deps.db, scope).findById(roomId);
    if (!row) throw new NotFoundError("ROOM_NOT_FOUND");
    return row;
  }

  async create(scope: Scope, input: CreateRoomInput) {
    return this.deps.db.transaction(async (tx) => {
      const property = await new PropertyRepository(tx, scope).findById(input.propertyId);
      if (!property) throw new NotFoundError("PROPERTY_NOT_FOUND");
      assertPropertyAcceptsRooms(property);

      const values = toValues(input);
      assertManualRoomStatus(values.status);

      let row: RoomRow;
      try {
        row = await new RoomRepository(tx, scope).insert(values);
      } catch (err) {
        if (isUniqueViolation(err)) throw new ConflictError("ROOM_CODE_TAKEN");
        throw err;
      }

      await AuditService.record(tx, scope, {
        entityType: "room",
        entityId: row.id,
        propertyId: row.propertyId,
        action: "CREATE",
        after: snapshotOf(row),
      });
      return row;
    });
  }

  async update(scope: Scope, roomId: number, input: UpdateRoomInput) {
    return this.deps.db.transaction(async (tx) => {
      const repo = new RoomRepository(tx, scope);
      const before = await repo.findById(roomId);
      if (!before) throw new NotFoundError("ROOM_NOT_FOUND");

      if (input.status !== undefined) {
        assertManualRoomStatus(input.status);
        // BROKEN hanya bila kamar tidak berpenghuni (FR-ROOM-04).
        if (input.status === "BROKEN" && (await this.hasActiveTenant(roomId))) {
          throw new BusinessRuleError("ROOM_HAS_TENANT", "FR-ROOM-04");
        }
      }

      const patch = definedOnly({
        code: input.code,
        roomType: input.roomType,
        baseRentAmount: input.baseRentAmount,
        facilities: input.facilities,
        status: input.status,
        notes: input.notes,
      });

      let after: RoomRow | null;
      try {
        after = await repo.update(roomId, patch);
      } catch (err) {
        if (isUniqueViolation(err)) throw new ConflictError("ROOM_CODE_TAKEN");
        throw err;
      }
      if (!after) throw new NotFoundError("ROOM_NOT_FOUND");

      const statusChanged = before.status !== after.status;
      await AuditService.record(tx, scope, {
        entityType: "room",
        entityId: after.id,
        propertyId: after.propertyId,
        action: statusChanged ? "STATUS_CHANGE" : "UPDATE",
        before: snapshotOf(before),
        after: snapshotOf(after),
      });
      return after;
    });
  }

  // Hapus lunak (BR-14). Kamar yang masih berpenghuni tidak bisa dihapus (FR-ROOM-06).
  async remove(scope: Scope, roomId: number) {
    return this.deps.db.transaction(async (tx) => {
      const repo = new RoomRepository(tx, scope);
      const before = await repo.findById(roomId);
      if (!before) throw new NotFoundError("ROOM_NOT_FOUND");
      if (await this.hasActiveTenant(roomId)) {
        throw new BusinessRuleError("ROOM_HAS_TENANT", "FR-ROOM-06");
      }

      const after = await repo.softDelete(roomId);
      if (!after) throw new NotFoundError("ROOM_NOT_FOUND");

      await AuditService.record(tx, scope, {
        entityType: "room",
        entityId: after.id,
        propertyId: after.propertyId,
        action: "DELETE",
        before: snapshotOf(before),
      });
      return after;
    });
  }
}

// Hanya kolom yang benar-benar dikirim yang diubah.
function definedOnly<T extends Record<string, unknown>>(values: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(values).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}
