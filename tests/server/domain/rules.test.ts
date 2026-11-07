import { describe, expect, it } from "vitest";
import { assertPatternSettings, managedForPattern, showsElectricityMenu } from "@/server/domain/property.rules";
import { assertManualRoomStatus, assertPropertyAcceptsRooms } from "@/server/domain/room.rules";
import { DomainError } from "@/server/errors";

function codeOf(fn: () => void): string | null {
  try {
    fn();
    return null;
  } catch (err) {
    return err instanceof DomainError ? err.code : "BUKAN_DOMAIN_ERROR";
  }
}

describe("pola listrik (Lampiran C)", () => {
  it("pola A tidak dikelola, B sampai E dikelola, CUSTOM bebas", () => {
    expect(managedForPattern("A")).toBe(false);
    expect(managedForPattern("B")).toBe(true);
    expect(managedForPattern("C")).toBe(true);
    expect(managedForPattern("D")).toBe(true);
    expect(managedForPattern("E")).toBe(true);
    expect(managedForPattern("CUSTOM")).toBeNull();
  });

  it("kombinasi yang cocok lolos", () => {
    expect(codeOf(() => assertPatternSettings({ electricityPattern: "A", electricityManaged: false }))).toBeNull();
    expect(codeOf(() => assertPatternSettings({ electricityPattern: "C", electricityManaged: true }))).toBeNull();
    expect(codeOf(() => assertPatternSettings({ electricityPattern: "CUSTOM", electricityManaged: false }))).toBeNull();
    expect(codeOf(() => assertPatternSettings({ electricityPattern: "CUSTOM", electricityManaged: true }))).toBeNull();
  });

  it("pola bertentangan dengan 'listrik dikelola' ditolak", () => {
    expect(codeOf(() => assertPatternSettings({ electricityPattern: "A", electricityManaged: true }))).toBe(
      "PATTERN_MANAGED_MISMATCH",
    );
    expect(codeOf(() => assertPatternSettings({ electricityPattern: "B", electricityManaged: false }))).toBe(
      "PATTERN_MANAGED_MISMATCH",
    );
  });

  it("menu listrik hanya tampil bila listrik dikelola (BR-16)", () => {
    expect(showsElectricityMenu({ electricityManaged: true })).toBe(true);
    expect(showsElectricityMenu({ electricityManaged: false })).toBe(false);
  });
});

describe("status dan aktivasi kamar", () => {
  it("AVAILABLE dan BROKEN boleh diatur manual", () => {
    expect(codeOf(() => assertManualRoomStatus("AVAILABLE"))).toBeNull();
    expect(codeOf(() => assertManualRoomStatus("BROKEN"))).toBeNull();
  });

  it("OCCUPIED tidak boleh diatur manual (FR-ROOM-03)", () => {
    expect(codeOf(() => assertManualRoomStatus("OCCUPIED"))).toBe("ROOM_STATUS_AUTOMATIC");
  });

  it("kamar tidak bisa ditambahkan ke properti nonaktif (FR-PRO-03)", () => {
    expect(codeOf(() => assertPropertyAcceptsRooms({ isActive: true }))).toBeNull();
    expect(codeOf(() => assertPropertyAcceptsRooms({ isActive: false }))).toBe("PROPERTY_INACTIVE");
  });
});
