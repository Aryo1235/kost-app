// Pemetaan kode galat dari backend ke teks Indonesia (AGENTS.md batas 5).
// Kode yang tidak dikenal memakai pesan umum.
const MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Username atau kata sandi salah.",
  RATE_LIMITED: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.",
  WRONG_CURRENT_PASSWORD: "Kata sandi lama tidak sesuai.",
  PASSWORD_SAME_AS_USERNAME: "Kata sandi tidak boleh sama dengan username.",
  PASSWORD_TOO_SHORT: "Kata sandi minimal 10 karakter.",
  PASSWORD_TOO_LONG: "Kata sandi maksimal 128 karakter.",
  USERNAME_INVALID: "Username 3-30 karakter: huruf kecil, angka, titik, atau garis bawah.",
  USERNAME_TAKEN: "Username sudah dipakai.",
  REQUIRED: "Kolom ini wajib diisi.",
  PASSWORD_MISMATCH: "Konfirmasi kata sandi tidak sama.",
  ROOM_CODE_TAKEN: "Kode kamar sudah dipakai di properti ini.",
  ROOM_NOT_FOUND: "Kamar tidak ditemukan.",
  ROOM_STATUS_AUTOMATIC: "Status Terisi diatur otomatis saat ada penghuni. Pilih Kosong atau Rusak.",
  ROOM_HAS_TENANT: "Kamar masih ditempati. Keluarkan penghuni dulu.",
  PROPERTY_INACTIVE: "Properti ini nonaktif. Aktifkan dulu untuk menambah kamar.",
  PATTERN_MANAGED_MISMATCH: "Pola listrik tidak sesuai dengan pengaturan listrik dikelola.",
  AMOUNT_INVALID: "Nominal harus bilangan bulat, tidak negatif.",
  PROPERTY_NOT_FOUND: "Properti tidak ditemukan.",
  USER_NOT_FOUND: "Pengguna tidak ditemukan.",
  TARGET_NOT_MANAGER: "Hanya akun pengelola yang bisa diubah di sini.",
  PASSWORD_CHANGE_REQUIRED: "Ganti kata sandi sementara Anda terlebih dahulu.",
  UNAUTHORIZED: "Sesi Anda berakhir. Masuk lagi untuk melanjutkan.",
  FORBIDDEN: "Anda tidak punya akses untuk tindakan ini.",
  ORIGIN_NOT_ALLOWED: "Permintaan ditolak. Muat ulang halaman lalu coba lagi.",
  VALIDATION_FAILED: "Ada isian yang belum benar. Periksa kembali.",
  INTERNAL_ERROR: "Terjadi kesalahan di sistem. Coba lagi.",
};

const FALLBACK = "Terjadi kesalahan. Coba lagi.";

export function errorMessage(code: string | null | undefined): string {
  if (!code) return FALLBACK;
  return MESSAGES[code] ?? FALLBACK;
}

// Mengambil kode domain dari galat tRPC (data.domainCode) atau dari respons route biasa (code).
export function codeFromError(err: unknown): string | null {
  if (typeof err !== "object" || err === null) return null;
  const data = (err as { data?: { domainCode?: unknown } }).data;
  if (data && typeof data.domainCode === "string") return data.domainCode;
  const message = (err as { message?: unknown }).message;
  return typeof message === "string" ? message : null;
}
