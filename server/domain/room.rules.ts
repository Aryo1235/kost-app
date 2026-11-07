import { BusinessRuleError } from "@/server/errors";
import type { RoomStatus } from "@/shared/enums";

// Aturan kamar (FR-ROOM-03, FR-ROOM-04). Fungsi murni: tanpa database.

// OCCUPIED hanya diatur otomatis saat tenant masuk (M2). Pengelola tidak boleh mengaturnya langsung.
export function assertManualRoomStatus(status: RoomStatus): void {
  if (status === "OCCUPIED") {
    throw new BusinessRuleError("ROOM_STATUS_AUTOMATIC", "FR-ROOM-03");
  }
}

// Kamar tidak bisa ditambah ke properti yang dinonaktifkan (FR-PRO-03).
export function assertPropertyAcceptsRooms(property: { isActive: boolean }): void {
  if (!property.isActive) {
    throw new BusinessRuleError("PROPERTY_INACTIVE", "FR-PRO-03");
  }
}
