// Menggabungkan nama kelas. Tanpa dependensi tambahan. Konflik kelas Tailwind tidak diselesaikan
// otomatis, jadi hindari menimpa kelas yang sudah diberikan komponen.
export function cn(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}
