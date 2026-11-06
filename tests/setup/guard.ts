// Pengaman: tes hanya boleh berjalan di database yang namanya diakhiri _test.
// Tes menjalankan TRUNCATE, jadi salah database berarti data hilang.
export function assertTestDatabase(url: string): void {
  const name = new URL(url).pathname.replace(/^\//, "");
  if (!name.endsWith("_test")) {
    throw new Error(
      `Tes menolak berjalan di database "${name}". Nama database tes harus diakhiri _test.`,
    );
  }
}
