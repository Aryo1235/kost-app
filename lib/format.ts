import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Format tampilan (design.md 8.2). Semua waktu dibaca dalam zona Asia/Jakarta (BR-13).
export const TIMEZONE = "Asia/Jakarta";

// Contoh: "Jumat, 6 November 2026".
export function formatDayLong(date: Date = new Date()): string {
  return format(new TZDate(date, TIMEZONE), "EEEE, d MMMM yyyy", { locale: id });
}

// Sapaan Beranda menurut jam WIB (design.md 8.1).
export function greetingWIB(date: Date = new Date()): string {
  const hour = new TZDate(date, TIMEZONE).getHours();
  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}
