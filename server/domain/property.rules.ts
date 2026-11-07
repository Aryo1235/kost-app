import { BusinessRuleError } from "@/server/errors";
import type { ElectricityPattern } from "@/shared/enums";

// Aturan pengaturan properti (FR-PRO-04, Lampiran C). Fungsi murni: tanpa database.

// Pola A: penyewa membayar sendiri, listrik tidak dikelola aplikasi.
// Pola B sampai E: listrik dikelola aplikasi. CUSTOM: bebas, diatur pemilik.
export function managedForPattern(pattern: ElectricityPattern): boolean | null {
  if (pattern === "A") return false;
  if (pattern === "CUSTOM") return null;
  return true;
}

// Menolak kombinasi pola dan "listrik dikelola" yang bertentangan.
export function assertPatternSettings(input: {
  electricityPattern: ElectricityPattern;
  electricityManaged: boolean;
}): void {
  const expected = managedForPattern(input.electricityPattern);
  if (expected !== null && expected !== input.electricityManaged) {
    throw new BusinessRuleError("PATTERN_MANAGED_MISMATCH", "FR-PRO-04");
  }
}

// Menu dan fitur listrik hanya tampil bila listrik dikelola aplikasi (BR-16, FR-PRO-05).
export function showsElectricityMenu(settings: { electricityManaged: boolean }): boolean {
  return settings.electricityManaged;
}
