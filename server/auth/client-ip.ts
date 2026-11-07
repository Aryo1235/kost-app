// Alamat klien untuk pembatasan percobaan login.
// Dibaca dari entri PALING KANAN X-Forwarded-For, yang ditambahkan proxy tepercaya (Caddy).
// Entri paling kiri bisa dikirim klien sendiri, jadi tidak dipakai (TECH-SPEC 3.4, temuan tinjauan M0).
// Batasan: aplikasi harus hanya bisa dijangkau lewat Caddy. Akses langsung tetap bisa memalsukan header.
const IP_PATTERN = /^[0-9a-fA-F:.]{2,45}$/;

export function clientIp(request: Request): string | null {
  const header = request.headers.get("x-forwarded-for");
  if (!header) return null;
  const entries = header
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  const last = entries[entries.length - 1];
  return last && IP_PATTERN.test(last) ? last : null;
}
