# Technical Spec: Aplikasi Manajemen Kost

Terakhir diperbarui: 6 November 2026. Pendamping `PRD.md`.

Label: **[PUTUSAN]** sudah diputuskan pemilik produk. **[DEFAULT]** pilihan awal yang boleh diganti sebelum M0 dimulai, tetapi setelah itu dianggap tetap.

---

## 0. Cara Memakai Dokumen Ini

- **PRD** menjelaskan _apa_ yang dibangun. **Spec ini** menjelaskan _bagaimana_. **`AGENTS.md`** (dibaca juga lewat `CLAUDE.md`) berisi aturan harian untuk Claude Code.
- Jika bertentangan: untuk perilaku bisnis, PRD menang. Untuk hal teknis, spec ini menang.
- `docs/design.md` (tampilan, warna, komponen) dibuat nanti di Claude Code, **sebelum M1 dimulai**. M0 hanya membuat halaman login dan kerangka aplikasi yang polos.

---

## 1. Stack

| Lapisan            | Pilihan                                                                                                              | Label                            | Catatan                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Aplikasi           | Next.js (App Router), satu repositori dan satu proses (monolith), TypeScript `strict`                                | PUTUSAN                          | Versi stabil terbaru saat M0 mulai. Frontend dan backend dipisah **secara folder dan aturan impor** (bagian 2) |
| Arsitektur backend | Berlapis: controller → service → repository                                                                          | PUTUSAN                          | Bagian 2.3                                                                                                     |
| UI                 | Tailwind CSS, shadcn/ui                                                                                              | PUTUSAN                          | Komponen di `components/ui`                                                                                    |
| API                | tRPC v11 + TanStack Query                                                                                            | PUTUSAN                          | Pengganti `fetcher` dan `apiUrls` pada proyek REST. Semua data lewat `/api/trpc`                               |
| Tabel di klien     | TanStack Table                                                                                                       | PUTUSAN                          | Paginasi di server                                                                                             |
| Form               | React Hook Form + Zod                                                                                                | PUTUSAN                          | Skema Zod berada di `shared/schemas`                                                                           |
| Database           | PostgreSQL 17 atau lebih baru                                                                                        | PUTUSAN                          | Lokal dulu (Docker Compose), VPS saat rilis                                                                    |
| ORM dan migrasi    | Drizzle ORM + drizzle-kit                                                                                            | DEFAULT                          | Alternatif: Prisma                                                                                             |
| Autentikasi        | **Dibangun sendiri** (tanpa pustaka autentikasi): username dan kata sandi, hash scrypt bawaan Node, sesi di database | PUTUSAN                          | Lihat 3.4. Tanpa email dan tanpa dua langkah di fase 1                                                         |
| Penyimpanan file   | Disk privat di VPS lewat `StorageDriver`                                                                             | DEFAULT                          | Bisa diganti S3-kompatibel                                                                                     |
| Gambar             | `sharp` di server, kompresi di klien                                                                                 | DEFAULT                          | Menghapus EXIF dari semua foto                                                                                 |
| Ekspor             | `exceljs`, `@react-pdf/renderer`                                                                                     | DEFAULT                          | Dibuat di server                                                                                               |
| Grafik             | Recharts (komponen chart shadcn)                                                                                     | DEFAULT                          |                                                                                                                |
| Tanggal            | `date-fns` + `@date-fns/tz`                                                                                          | DEFAULT                          | Semua perhitungan hari memakai Asia/Jakarta                                                                    |
| Validasi env       | `@t3-oss/env-nextjs` + Zod                                                                                           | DEFAULT                          | Dipecah: `server/env.ts` dan `lib/env.ts`                                                                      |
| Log                | `pino`                                                                                                               | DEFAULT                          | Tanpa data pribadi                                                                                             |
| Lint               | ESLint (flat config, `eslint.config.mjs`) + `eslint-config-next`                                                     | DEFAULT                          | Juga menjaga batas BE/FE (bagian 2.2)                                                                          |
| Tes                | Vitest, Playwright                                                                                                   | DEFAULT                          | Tes backend memakai **PostgreSQL asli**, bukan mock                                                            |
| Paket dan Node     | Yarn (Berry, via Corepack), `nodeLinker: node-modules`, versi Node di `.nvmrc`                                       | DEFAULT                          | Sama seperti proyek frontend yang biasa kamu pakai                                                             |
| CI                 | GitHub Actions `.github/workflows/dev.yml` + Dependabot                                                              | DEFAULT                          | Lint, typecheck, tes dengan PostgreSQL service                                                                 |
| Deploy             | Docker (`Dockerfile`), Docker Compose di VPS sendiri, Caddy (HTTPS otomatis)                                         | PUTUSAN (VPS), DEFAULT (rincian) |                                                                                                                |

Tidak dipakai di fase 1 **[PUTUSAN]**: cron atau job latar (BR-18), **Row Level Security**, **email** (undangan dan reset sandi lewat email), antrean pesan, Redis, aplikasi native, multi-bahasa, dark mode.

---

## 2. Arsitektur

### 2.1 Gambaran

```
Browser
  │  halaman (React)                       ┌───────────────────── FRONTEND ─────────────────────┐
  │                                        │ app/ (halaman)  components/  lib/<fitur>/hooks      │
  │  panggilan data: HTTP /api/trpc ───────┤        │ memakai tRPC client (lib/api)              │
  ▼                                        └────────┼────────────────────────────────────────────┘
Caddy ──> Next.js (satu proses)                     │  hanya lewat HTTP, dan tipe (import type)
                                           ┌────────▼───────────────────── BACKEND ──────────────┐
                                           │ app/api/*  (adapter tipis)                          │
                                           │   └> server/controllers  (tRPC router)              │
                                           │        └> server/services  (aturan bisnis)          │
                                           │             └> server/repositories (query Drizzle)  │
                                           │                  └> PostgreSQL  /  Disk privat      │
                                           └─────────────────────────────────────────────────────┘
                              shared/  = skema Zod, enum, tipe (satu-satunya kode yang dipakai bersama)
```

### 2.2 Pemisahan backend dan frontend

Tujuannya agar saat debugging jelas masalahnya di sisi mana: **setiap panggilan data dari frontend selalu lewat HTTP `/api/trpc`**, sehingga terlihat di tab Network browser. Frontend tidak pernah menjalankan kode backend.

| Folder                                            | Sisi            | Boleh mengimpor                                                          | Dilarang mengimpor                      |
| ------------------------------------------------- | --------------- | ------------------------------------------------------------------------ | --------------------------------------- |
| `app/` (halaman), `components/`, `lib/`, `types/` | Frontend        | `shared/`, dan **hanya tipe** dari backend (`import type { AppRouter }`) | Apa pun yang berjalan dari `server/`    |
| `app/api/**`                                      | Adapter backend | `server/`, `shared/`                                                     | Komponen React, `components/`, `lib/`   |
| `server/`                                         | Backend         | `shared/`                                                                | `app/`, `components/`, `lib/`, `types/` |
| `shared/`                                         | Jembatan        | `zod` saja                                                               | Semua folder lain                       |

Aturan tambahan:

- `page.tsx` di `app/` tipis: hanya memasang komponen. Data diambil di Client Component lewat hook tRPC. **Tidak ada pengambilan data di Server Component** (tidak ada `createCaller`, tidak ada akses database dari halaman).
- Isi `shared/` hanya skema Zod, enum, dan tipe. Tidak ada teks tampilan, tidak ada akses database, tidak ada aturan bisnis.
- Teks untuk pengguna (label status, pesan galat, format rupiah dan tanggal) hanya ada di frontend (`lib/labels.ts`, `lib/errors.ts`, `lib/format.ts`). Backend mengembalikan **kode** (misalnya `TENANT_HAS_UNPAID_INVOICES`), bukan kalimat untuk layar.
- Perhitungan bisnis (terlambat, jatuh tempo, total) dilakukan di backend dan dikirim sebagai data jadi (misalnya `isOverdue`). Frontend tidak menghitung ulang.

**Penjagaan otomatis (ESLint, dijalankan juga di CI):**

```js
// eslint.config.mjs (sketsa)
// 1) Frontend tidak boleh mengimpor server/ (kecuali import type)
{ files: ["app/**", "components/**", "lib/**", "types/**"],
  ignores: ["app/api/**"],
  rules: { "@typescript-eslint/no-restricted-imports": ["error", { patterns: [
    { group: ["@/server/*", "**/server/**"], allowTypeImports: true,
      message: "Frontend tidak boleh mengimpor kode backend. Pakai tRPC, atau import type." } ] }] } },
// 2) Backend tidak boleh mengimpor frontend
{ files: ["server/**"],
  rules: { "no-restricted-imports": ["error", { patterns: [
    { group: ["@/app/*", "@/components/*", "@/lib/*", "**/components/**", "**/lib/**"],
      message: "Backend tidak boleh mengimpor frontend." } ] }] } },
// 3) shared hanya boleh zod
{ files: ["shared/**"],
  rules: { "no-restricted-imports": ["error", { patterns: [
    { group: ["@/server/*", "@/app/*", "@/components/*", "@/lib/*"], message: "shared/ tidak boleh bergantung pada sisi mana pun." } ] }] } },
```

Pelanggaran membuat `yarn lint` dan CI gagal. Selain itu, Next.js juga gagal melakukan build jika kode backend (`pg`, `fs`, dan sebagainya) terbawa ke bundel browser.

### 2.3 Lapisan backend

Alur satu arah. Lapisan di atas boleh memanggil lapisan di bawah, tidak sebaliknya.

| Lapisan           | Lokasi                                                         | Tugas                                                                                                                            | Dilarang                                      |
| ----------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **Controller**    | `server/controllers/<fitur>.controller.ts` (router tRPC)       | Validasi input (skema dari `shared/schemas`), pasang prosedur dan izin, panggil **satu atau beberapa service**, kembalikan hasil | Query database, aturan bisnis, transaksi      |
| **Service**       | `server/services/<fitur>.service.ts`                           | Aturan bisnis, urutan langkah, **transaksi**, pencatatan audit. Melempar galat domain                                            | Mengenal tRPC atau HTTP, menulis SQL langsung |
| **Repository**    | `server/repositories/<fitur>.repository.ts`                    | Satu-satunya tempat query Drizzle. Terikat ke organisasi (bagian 3.1). Mengembalikan baris atau objek polos                      | Aturan bisnis, memanggil service lain         |
| **Domain**        | `server/domain/<fitur>.rules.ts`                               | Fungsi murni tanpa database: jatuh tempo (BR-11), terlambat (BR-10), hitung listrik                                              | Mengakses database atau I/O                   |
| **Infrastruktur** | `server/db`, `server/auth`, `server/storage`, `server/exports` | Koneksi, skema, auth, file, PDF dan Excel                                                                                        | Aturan bisnis                                 |

**Pembuatan objek**: tanpa kontainer dependency injection. Setiap permintaan membuat `ctx` yang berisi `scope` (organisasi, pengguna, peran, properti yang boleh diakses) dan fungsi pembuat service. Controller memakai `ctx.services.invoices.generateDue(input)`. Service menerima repository yang sudah terikat `scope`.

**Galat**: service melempar galat domain (`NotFoundError`, `ForbiddenError`, `ConflictError`, `BusinessRuleError`) dari `server/errors.ts`, dengan `code` yang stabil (contoh `TENANT_HAS_UNPAID_INVOICES`) dan `ruleId` bila ada (contoh `BR-04`). Satu middleware di `server/trpc/error-mapper.ts` mengubahnya menjadi `TRPCError` dan menambahkan `requestId`. Service tidak pernah melempar `TRPCError`.

### 2.4 Prosedur tRPC

Setiap endpoint dibuat dari salah satu prosedur dasar ini. Dilarang memakai `publicProcedure` untuk data kost.

| Prosedur            | Memeriksa                                                        | Dipakai untuk                                  |
| ------------------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| `publicProcedure`   | Tidak ada                                                        | Hanya cek kesehatan                            |
| `authedProcedure`   | Sesi valid, pengguna aktif                                       | Profil sendiri (`me`)                          |
| `orgProcedure`      | Di atas, plus membentuk `scope` organisasi                       | Dasar semua data kost                          |
| `ownerProcedure`    | Di atas, plus peran `OWNER`                                      | Properti baru, pengguna, audit log, pengaturan |
| `propertyProcedure` | Di atas, plus `propertyId` di input harus boleh diakses pengguna | Hampir semua data operasional                  |

Hak akses (matriks PRD 2.2) ditulis **satu kali** di `server/permissions.ts`. Frontend mendapat daftar izin dari `me` untuk menyembunyikan menu. Server tetap penentu akhir.

### 2.5 Membantu debugging

- **`requestId`** dibuat per permintaan, ikut di respons galat tRPC, dan muncul di semua baris log permintaan itu.
- Log `pino` diberi label lapisan: `{ layer: "controller" | "service" | "repository", module: "invoices" }`. Controller mencatat jalur, durasi, dan hasil. Service mencatat keputusan bisnis penting. Repository hanya mencatat galat.
- Log tidak memuat NIK, nomor telepon, kata sandi, atau isi `before_json` dan `after_json`.

Panduan cepat mencari sumber masalah:

| Gejala                                                                  | Periksa di                                                                              |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Tampilan salah, tombol tidak bereaksi, tidak ada request di tab Network | Console browser, `components/`, `lib/<fitur>/hooks`                                     |
| Request `/api/trpc/...` merah                                           | Baca respons (`code`, `requestId`), cari `requestId` di log server                      |
| `BAD_REQUEST` validasi                                                  | `shared/schemas/<fitur>.ts` atau nilai yang dikirim form                                |
| `UNAUTHORIZED` atau `FORBIDDEN`                                         | `server/trpc/procedures.ts`, `server/permissions.ts`                                    |
| Data salah atau kosong padahal ada                                      | `server/repositories/<fitur>.repository.ts` (filter organisasi, properti, `deleted_at`) |
| Angka atau status salah                                                 | `server/domain/<fitur>.rules.ts`, lalu service                                          |
| Data tersimpan setengah                                                 | Transaksi di service                                                                    |
| Foto tidak muncul                                                       | `/api/files`, `server/storage`, tautan kedaluwarsa                                      |

---

## 3. Isolasi Data dan Keamanan

Syarat PRD: data satu owner tidak boleh terlihat oleh owner lain dalam kondisi apa pun. **[PUTUSAN]** Fase 1 **tidak memakai RLS**. Isolasi dijaga sepenuhnya di lapisan aplikasi, sehingga disiplin di repository dan tes otomatis menjadi penentu. Satu filter yang terlupa berarti data bocor antar owner, jadi aturan 3.1 sampai 3.3 tidak boleh dilonggarkan.

### 3.1 Repository terikat organisasi

- Setiap tabel domain **wajib punya kolom `organization_id`**, termasuk tabel yang di ERD PRD hanya terhubung lewat `property_id` (rooms, tenants, invoices, dan seterusnya). Ini penyimpangan sengaja dari ERD supaya filter organisasi bisa dipasang di satu langkah tanpa join.
- Semua repository mewarisi `BaseRepository`, yang dibuat dengan `scope`. `organization_id` **diambil dari `scope`, bukan dari parameter pemanggil**:
  - `orgWhere(table)` menambahkan `organization_id = scope.organizationId` ke setiap query baca, ubah, dan hapus.
  - `insert` mengisi `organization_id` dari `scope`. Nilai dari input diabaikan.
  - Untuk peran `MANAGER`, `propertyWhere(table)` menambahkan `property_id IN scope.propertyIds`.
  - `notDeleted(table)` menambahkan `deleted_at IS NULL` (BR-14).
- Repository **dilarang** menjalankan query tanpa helper di atas. Query lintas organisasi hanya boleh ada di `server/auth` (login, pencarian pengguna saat masuk) dan skrip `create-owner` / `seed`.
- Klien `db` mentah hanya diimpor oleh `server/db`, repository, dan transaksi di service.

### 3.2 Transaksi

Mutasi yang menyentuh lebih dari satu tabel, atau menulis audit, dijalankan dalam **satu transaksi yang dibuka di service** (tenant keluar, buat tagihan massal, simpan meteran lalu perbarui tagihan, sesuai PRD 10.3). Di dalam transaksi, service membuat repository baru di atas koneksi transaksi itu. Entri audit ditulis di transaksi yang sama dengan perubahannya.

### 3.3 Akses per properti

Pengelola hanya boleh mengakses properti yang ditugaskan. Dijaga di dua tempat: `propertyProcedure` (menolak lebih awal) dan `BaseRepository.propertyWhere` (jaring kedua).

### 3.4 Autentikasi (dibangun sendiri) **[PUTUSAN]**

Tanpa pustaka autentikasi (tanpa Better Auth, Auth.js, atau sejenisnya). Dibuat kecil dan mengikuti panduan OWASP, memakai modul `crypto` bawaan Node. Kode ada di `server/auth/` (`password.ts`, `session.ts`, `cookies.ts`, `rate-limit.ts`, `auth.service.ts`, `auth.repository.ts`). Folder ini satu-satunya tempat yang boleh mencari pengguna lintas organisasi, karena organisasi baru diketahui setelah login. Pengelolaan akun (buat pengelola, reset, nonaktifkan) memakai `UserService` dan `UserRepository` biasa yang terikat organisasi.

**Tabel**

| Tabel            | Isi                                                                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`          | Entitas PRD 6.2 ditambah `password_hash`, `password_changed_at`, `last_login_at`. Tanpa kolom email                                             |
| `sessions`       | `id`, `user_id`, `organization_id`, `token_hash` (SHA-256 dari token di cookie), `created_at`, `last_used_at`, `expires_at`, `ip`, `user_agent` |
| `login_attempts` | `username` (sudah dinormalisasi), `ip`, `success`, `created_at`                                                                                 |

**Username**: huruf kecil, 3 sampai 30 karakter, hanya `a-z`, `0-9`, titik, dan garis bawah, **unik di seluruh sistem** karena halaman login tidak meminta memilih organisasi.

**Kata sandi**

- Hash dengan `crypto.scrypt` bawaan Node: `N=2^15`, `r=8`, `p=3` (parameter yang dianjurkan OWASP), salt acak 16 byte per kata sandi, `maxmem` disesuaikan.
- Disimpan sebagai teks berformat `scrypt$N$r$p$salt$hash` supaya parameter bisa dinaikkan nanti. Jika parameter tersimpan lebih lemah dari parameter terkini, hash diperbarui saat login berhasil.
- Verifikasi dengan `crypto.timingSafeEqual`.
- Minimal 10 karakter, maksimal 128, tidak boleh sama dengan username.
- Dilarang menulis ulang algoritma kripto sendiri. Hanya memakai fungsi `crypto` bawaan. Alternatif yang lebih kuat bila kelak mau menambah dependensi: argon2id (`@node-rs/argon2`).

**Alur login** (`POST /api/auth/login`, adapter tipis ke `AuthService.login`)

1. Validasi input dengan skema `shared/schemas/auth.ts`, normalisasi username (pangkas spasi, huruf kecil).
2. Periksa pembatasan: 5 kegagalan untuk satu username dalam 15 menit, atau 20 kegagalan dari satu alamat IP dalam 15 menit, ditolak dengan kode `RATE_LIMITED`.
3. Cari pengguna. Jika tidak ada atau nonaktif, tetap jalankan verifikasi terhadap hash palsu supaya waktu respons sama, lalu gagal.
4. Kode galat untuk username salah, kata sandi salah, dan akun nonaktif **sama**: `INVALID_CREDENTIALS`.
5. Jika berhasil: buat token acak 32 byte (`crypto.randomBytes`), simpan hash SHA-256-nya di `sessions`, kirim token asli lewat cookie.
6. Pembersihan oportunistik saat login (bukan cron): hapus sesi kedaluwarsa milik pengguna itu dan `login_attempts` yang lebih tua dari 24 jam.

**Sesi dan cookie**

- Nama `kost_session` (di produksi `__Host-kost_session`). Atribut `HttpOnly`, `Secure` (produksi), `SameSite=Lax`, `Path=/`.
- Sesi habis setelah 14 hari tidak dipakai, dan paling lama 60 hari sejak dibuat. `last_used_at` diperbarui paling sering sekali per jam supaya tidak menulis di setiap permintaan.
- Setiap permintaan: baca cookie, hash, cari di `sessions`, periksa belum kedaluwarsa dan pengguna masih aktif, lalu bentuk `scope` (organisasi, pengguna, peran, daftar properti dari `property_access`).
- Logout menghapus baris sesi dan cookie.

**Ubah dan reset kata sandi**

- Ubah sendiri (`POST /api/auth/change-password`): wajib kata sandi lama. Berhasil berarti semua sesi lain dicabut dan sesi baru diterbitkan.
- Reset pengelola oleh owner, atau reset owner lewat `yarn reset-password`: server membuat kata sandi sementara acak (16 karakter, tanpa karakter yang mudah tertukar), menandai `must_change_password`, mencabut semua sesi pengguna itu, mencatat audit **tanpa** kata sandinya, dan menampilkan kata sandi sementara satu kali.
- Selama `must_change_password` aktif, semua prosedur ditolak dengan kode `PASSWORD_CHANGE_REQUIRED` kecuali `auth.me`. Frontend mengalihkan ke halaman Akun (FR-AUTH-06).
- Menonaktifkan pengguna menghapus semua sesinya (FR-AUTH-07).

**Perlindungan lain**

- CSRF: `SameSite=Lax`, semua mutasi memakai `POST`, dan setiap `POST` ke `/api/*` memeriksa header `Origin` terhadap `APP_ORIGIN`. Tidak cocok berarti ditolak.
- Alamat IP diambil dari `x-forwarded-for` yang dipasang Caddy. Aplikasi hanya boleh bisa dijangkau lewat Caddy, tidak langsung dari internet.
- Logger `pino` menyamarkan `password`, `currentPassword`, `newPassword`, `token`, `cookie`, `authorization`. Username pada percobaan gagal boleh dicatat, kata sandi tidak.

**Di luar fase 1**: autentikasi dua langkah, reset kata sandi lewat email, login sosial, "ingat saya", dan daftar perangkat.

### 3.5 Pembuatan akun

**[PUTUSAN]** Fase 1 tanpa email dan tanpa pendaftaran publik.

- Owner dan organisasinya dibuat lewat skrip `yarn create-owner` (meminta username dan kata sandi).
- Owner membuat akun pengelola dari menu Pengguna: nama, username, telepon, kata sandi awal, dan properti yang boleh diakses (FR-AUTH-03). Akun baru bertanda `must_change_password`, sehingga pengelola wajib mengganti sandi saat login pertama (FR-AUTH-06).
- Pengelola lupa sandi: owner mengatur kata sandi sementara baru (FR-AUTH-05). Kata sandi hanya ditampilkan sekali dan tidak pernah masuk log atau audit. Kejadian reset tercatat di audit log.
- Owner lupa sandi: tidak ada reset mandiri tanpa email. Dijalankan lewat skrip di server, `yarn reset-password <username>`, oleh pengelola sistem. Risikonya: owner terkunci sampai skrip dijalankan. Email untuk reset mandiri ditambahkan nanti bila dibutuhkan (bagian 14).
- Pendaftaran mandiri owner ditunda (bagian 14).

### 3.6 NIK, foto, dan data pribadi

- **NIK**: terenkripsi AES-256-GCM di kolom `nik_encrypted`, plus `nik_last4` untuk tampilan tersamar. Kunci dari env `NIK_ENCRYPTION_KEY`. NIK penuh hanya dibuka lewat aksi eksplisit yang menulis `VIEW_SENSITIVE` ke audit log (FR-AUD-07). NIK tidak ada di log, daftar, maupun ekspor.
- **Kunci enkripsi hilang berarti NIK tidak bisa dibaca lagi.** Simpan di tempat terpisah dari cadangan database.
- **Foto**: penyimpanan privat (bagian 7). EXIF dibuang saat unggah.
- Nomor WhatsApp dinormalisasi ke format `62...` sebelum disimpan.

### 3.7 Audit log tidak bisa diubah

`audit_logs` hanya punya `insert` dan `list` di repository (tidak ada metode ubah atau hapus). Sebagai jaring kedua, migrasi memasang **trigger** PostgreSQL yang menolak `UPDATE` dan `DELETE` pada tabel itu (FR-AUD-04). Ini bukan RLS dan tidak mempengaruhi tabel lain.

### 3.8 Tes keamanan wajib (syarat selesai M0)

| Tes                | Yang dibuktikan                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Isolasi repository | Untuk setiap repository: dua organisasi berisi data. Dengan `scope` organisasi A, semua metode baca, ubah, dan sisip **tidak pernah** menyentuh atau mengembalikan data B. Repository baru **wajib** disertai tes ini                                                                                                                                                                                                                                                                                                                                                                      |
| Isolasi lewat API  | Pengguna owner A memanggil prosedur dengan ID milik B (baca, ubah, hapus) dan mendapat `NOT_FOUND` atau `FORBIDDEN`                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Properti           | Pengelola A (properti 1) memanggil prosedur untuk properti 2 dan ditolak                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Peran              | Pengelola memanggil prosedur khusus owner dan ditolak                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Autentikasi        | Kode dan pesan galat sama untuk username salah, kata sandi salah, dan akun nonaktif. Lima kegagalan per username (dan 20 per IP) dalam 15 menit memblokir login. Token sesi tidak tersimpan mentah di database (hanya hash). Sesi kedaluwarsa atau dicabut ditolak. Menonaktifkan pengguna mencabut sesinya. Ubah kata sandi mencabut sesi lain. Reset oleh owner mencabut sesi dan memaksa ganti sandi. `must_change_password` memblokir prosedur lain. `POST` dengan `Origin` salah ditolak. Kata sandi tidak muncul di log. Format hash scrypt benar dan diperbarui bila parameter naik |
| Insert aman        | `insert` dengan `organization_id` palsu di input tetap tersimpan di organisasi milik `scope`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Audit log          | `UPDATE` dan `DELETE` pada `audit_logs` ditolak trigger                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| File               | Pengguna organisasi A meminta file organisasi B dan ditolak. Tautan kedaluwarsa ditolak                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| NIK                | Enkripsi lalu dekripsi menghasilkan nilai asli. Nilai di database bukan teks biasa                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Batas BE/FE        | `yarn lint` lolos (aturan 2.2), dan tidak ada impor runtime dari `server/` di frontend                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

### 3.9 Pengamanan umum

- Aturan cookie, kata sandi, dan pembatasan percobaan login ada di 3.4. Pesan galat login sama untuk username salah, kata sandi salah, dan akun nonaktif.
- Mutasi tRPC hanya lewat `POST`. Header keamanan dasar (CSP, `X-Content-Type-Options`, `Referrer-Policy`) dipasang di Caddy atau `next.config.ts`.
- Dilarang cache bersama untuk data tenant (`unstable_cache`, `use cache`). Jika perlu cache, kuncinya wajib memuat `organization_id`.
- Bila kelak dibutuhkan, RLS dapat ditambahkan tanpa mengubah lapisan di atas, karena kolom `organization_id` sudah ada di semua tabel domain.

---

## 4. Audit Log

- `AuditService.record({ entityType, entityId, action, before, after, propertyId })` di `server/services/audit.service.ts`, memakai `AuditRepository`. **Dipanggil dari service lain**, di transaksi yang sama dengan perubahan.
- `actor_id` dan `organization_id` diambil dari `scope`, bukan dari input.
- Setiap service yang mengubah data untuk daftar di FR-AUD-01 wajib memanggil `record`. Tes integrasi per service memeriksa baris audit tercipta.
- Kalimat "bahasa manusia" (FR-AUD-06) dibentuk di frontend dari `entity_type`, `action`, dan selisih `before_json` dan `after_json`. Tidak disimpan.

---

## 5. Aturan Teknis Domain

| Topik        | Aturan                                                                                                                                                    |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| Uang         | Bilangan bulat rupiah. Kolom `bigint` (mode `number` di Drizzle). Tanpa desimal dan tanpa `float` (BR-12). Format tampilan di `lib/format.ts` (frontend)  |
| Hari ini     | Di backend selalu lewat `todayWIB()` di `server/domain/dates.ts`. Dilarang `new Date()` untuk menentukan "hari ini" atau jatuh tempo (BR-13)              |
| Tipe tanggal | `date` untuk tanggal kalender (jatuh tempo, tanggal masuk). `timestamptz` untuk waktu kejadian (`created_at`, `paid_at`)                                  |
| Periode      | Teks `YYYY-MM` dengan `CHECK (period ~ '^\d{4}-(0[1-9]                                                                                                    | 1[0-2])$')` |
| Jatuh tempo  | Fungsi murni `dueDateFor(period, billingDay)` di `server/domain/invoice.rules.ts` dengan aturan BR-11. Diuji untuk Februari, tahun kabisat, bulan 30 hari |
| Terlambat    | Dihitung di backend (BR-10): `UNPAID` dan `todayWIB() > due_date`. Dikirim ke frontend sebagai `isOverdue`                                                |
| Soft delete  | `deleted_at`, disaring oleh `BaseRepository.notDeleted` (BR-14)                                                                                           |
| Tagihan      | Tidak pernah dihapus permanen. Repository tagihan tidak punya metode hapus. Koreksi lewat `VOID` (BR-09)                                                  |

### 5.1 Batasan di tingkat database

Ditulis dalam SQL migrasi kustom bila drizzle-kit tidak menghasilkannya.

| Batasan                             | Rumusan                                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| BR-01 satu tenant aktif per kamar   | Indeks unik parsial `tenants(room_id)` dengan `status = 'ACTIVE' and deleted_at is null`                                        |
| Satu tagihan per tenant per periode | Indeks unik parsial `invoices(tenant_id, period)` dengan `status <> 'VOID'`                                                     |
| Satu bacaan meteran per periode     | Unik `meter_readings(meter_id, period)`                                                                                         |
| Kode kamar unik per properti        | Unik parsial `rooms(property_id, code)` dengan `deleted_at is null`                                                             |
| Tanggal tagihan                     | `CHECK (billing_day between 1 and 31)`                                                                                          |
| Audit log tidak berubah             | Trigger penolak `UPDATE` dan `DELETE` (3.7)                                                                                     |
| Kamar dan meteran                   | Satu kamar paling banyak satu meteran (`rooms.meter_id`). Aturan "`ROOM` melayani tepat satu kamar" dijaga di service dan diuji |

Indeks tabel domain diawali `organization_id`, misalnya `(organization_id, property_id, status)`.

### 5.2 Pembuatan tagihan (BR-18, tanpa cron)

`generateDue` adalah **metode service** (`InvoiceService.generateDue`), bukan fungsi database.

- Dipicu oleh mutasi `invoices.generateDue`. Frontend memanggilnya sekali saat Dashboard atau halaman Tagihan dibuka (di `useEffect`, bukan saat render), dan lewat tombol "Buat tagihan bulan ini".
- **Idempoten**: memakai `INSERT ... ON CONFLICT DO NOTHING` pada indeks unik tagihan, dan `pg_advisory_xact_lock` per organisasi supaya dua pemanggilan bersamaan tidak saling menimpa.
- Mengembalikan jumlah tagihan baru dan yang dilewati, dan mencatatnya ke log.
- Jika kelak butuh cron, cukup panggil service yang sama.

---

## 6. Frontend

### 6.1 Pola halaman dan data

- `app/(contents)/<rute>/page.tsx` tipis. Isinya dipasang dari `_components/` milik halaman itu (komponen yang hanya dipakai satu halaman) atau dari `components/<fitur>/` (komponen yang dipakai ulang).
- Data selalu lewat hook tRPC. Setiap fitur punya pembungkus di `lib/<fitur>/hooks` (contoh `useInvoices`, `useMarkInvoicePaid`) yang mengurus invalidasi cache dan notifikasi. Komponen memakai pembungkus itu, bukan memanggil `trpc.*` langsung.
- `lib/<fitur>/types.ts` berisi tipe tampilan yang diturunkan dari `RouterOutputs`. `lib/<fitur>/index.ts` adalah barrel.
- Penjaga login: middleware atau proxy Next.js hanya memeriksa keberadaan cookie sesi dan mengalihkan ke `/login`. Otorisasi sebenarnya di backend.

### 6.2 Form

- Skema Zod dari `shared/schemas/<fitur>.ts`, dipakai `useForm` (lewat `@hookform/resolvers/zod`) **dan** controller. Satu sumber kebenaran.
- Komponen bersama di `components/shared`: `MoneyInput` (format rupiah, simpan bilangan bulat), `PhoneInput` (normalisasi `62`), `PhotoInput` (kamera HP lewat atribut `capture`, kompres sisi terpanjang sekitar 1600 px, maksimum 10 MB, JPG/PNG/WebP, sesuai PRD 10.1), `DataTable`, `StatusBadge`.
- Pesan galat dipetakan dari `code` backend di `lib/errors.ts`, dengan pesan umum sebagai cadangan.

### 6.3 Tabel

- TanStack Table dengan **paginasi, pencarian, dan filter di server** (PRD: properti hingga 500 kamar, halaman daftar kurang dari 2 detik).
- Filter disimpan di URL, termasuk filter properti (`?properti=ID`). Tidak ada properti aktif global di cookie atau penyimpanan lain: cakupan properti ditentukan per halaman (PRD FR-PRO-02).

### 6.4 Bahasa dan penamaan

- Kode, nama tabel, variabel, pesan commit: **bahasa Inggris**. Teks yang dilihat pengguna: **bahasa Indonesia**, tanpa pustaka i18n.
- URL memakai bahasa Indonesia: `/dashboard`, `/properti`, `/kamar`, `/tenant`, `/tagihan`, `/listrik`, `/asset`, `/maintenance`, `/pengeluaran`, `/laporan`, `/audit-log`, `/pengaturan`, `/pengguna`, `/akun` (ubah kata sandi sendiri).
- Menu dan fitur disembunyikan sesuai pengaturan properti (BR-16): menu bersyarat (Fasum, Listrik) tampil bila minimal satu properti yang dapat diakses pengguna mengaktifkannya. Di dalam halaman, filter hanya menawarkan properti yang mengaktifkannya.

---

## 7. File dan Ekspor

Semua ini **backend**. Rute di `app/api/*` hanya adapter yang memanggil `server/`.

### 7.1 Penyimpanan

- Antarmuka `StorageDriver` (`put`, `get`, `delete`, `exists`) di `server/storage` dengan driver `local` sekarang.
- `STORAGE_DIR` berada **di luar** folder `public` dan tidak pernah disajikan langsung oleh Caddy.
- Kunci file: `{organization_id}/{property_id}/{jenis}/{uuid}.{ext}`. Nilai ini yang disimpan di kolom `*_path` PRD.

### 7.2 Unggah

`POST /api/upload`: periksa sesi dan akses properti, periksa **tipe sebenarnya** dari isi file, batasi 10 MB, proses dengan `sharp` (putar sesuai orientasi, hapus EXIF), lalu simpan. Mengembalikan kunci file.

### 7.3 Unduh

`GET /api/files/{kunci}?exp=...&sig=...`: tautan ditandatangani HMAC (`FILE_SIGNING_SECRET`) dan kedaluwarsa singkat (sekitar 5 menit). Handler tetap memeriksa sesi, organisasi, dan akses properti, jadi tautan yang bocor tidak berguna bagi orang lain. Tidak ada URL publik permanen.

### 7.4 Ekspor

- `GET /api/export/{jenis}` memanggil `ReportService` yang sama dengan dashboard, sehingga angkanya identik (syarat M7).
- Excel: `exceljs`, banyak sheet, NIK tidak ikut. PDF: `@react-pdf/renderer`, font Inter ditanam. Kode pembuatnya berada di `server/exports/`.

---

## 8. Struktur Folder

Frontend mengikuti pola proyek yang biasa kamu pakai (`app/`, `components/`, `lib/<fitur>/`). Backend berada di `server/`.

```
kost-app/
├─ .github/
│  ├─ dependabot.yml
│  └─ workflows/dev.yml
├─ .nvmrc  .yarnrc.yml  .dockerignore  .gitignore
├─ .env  .env.example
├─ AGENTS.md  CLAUDE.md  README.md
├─ Dockerfile  eslint.config.mjs  next.config.ts  tsconfig.json  package.json
├─ docs/                          # PRD.md, TECH-SPEC.md, design.md (nanti)
├─ docker/                        # compose.dev.yml, compose.prod.yml, Caddyfile
├─ drizzle/                       # migrasi SQL (hasil generate dan kustom)
├─ scripts/                       # create-owner.ts, backup.sh, restore.sh
│
│  ──────────────  FRONTEND  ──────────────
├─ app/
│  ├─ layout.tsx  globals.css  page.tsx  client.tsx  favicon.ico   # client.tsx = provider (tRPC, Query)
│  ├─ login/                      # + _components/
│  ├─ (contents)/                 # area berlogin
│  │  ├─ layout.tsx               # sidebar, header
│  │  ├─ dashboard/  properti/  kamar/  tenant/  tagihan/  listrik/
│  │  ├─ asset/  maintenance/  pengeluaran/  laporan/
│  │  └─ audit-log/  pengaturan/  pengguna/  akun/      # masing-masing: page.tsx + _components/
│  └─ api/                        # ADAPTER BACKEND (tipis, hanya memanggil server/)
│     ├─ trpc/[trpc]/route.ts
│     ├─ auth/{login,logout,change-password}/route.ts
│     ├─ upload/route.ts
│     ├─ files/[...key]/route.ts
│     ├─ export/[type]/route.ts
│     └─ health/route.ts
├─ components/
│  ├─ ui/                         # shadcn
│  ├─ shared/                     # DataTable, MoneyInput, PhotoInput, StatusBadge
│  └─ <fitur>/                    # invoices/, tenants/, rooms/, ...
├─ lib/
│  ├─ api/                        # trpc.ts (client), provider, penanganan galat
│  ├─ auth/                       # index.ts, client.ts, logout.ts, types.ts
│  ├─ hooks/                      # useMe.ts, query-string/
│  ├─ <fitur>/                    # hooks/, index.ts, types.ts   (invoices, tenants, rooms, ...)
│  ├─ format.ts  labels.ts  errors.ts  env.ts  utils.ts
├─ types/                         # react-table.d.ts
├─ public/
│
│  ──────────────  BACKEND  ──────────────
├─ server/
│  ├─ trpc/                       # init.ts, context.ts, procedures.ts, root.ts, error-mapper.ts
│  ├─ controllers/                # invoice.controller.ts, tenant.controller.ts, ...
│  ├─ services/                   # invoice.service.ts, audit.service.ts, ...
│  ├─ repositories/               # base.repository.ts, invoice.repository.ts, ...
│  ├─ domain/                     # invoice.rules.ts, electricity.rules.ts, dates.ts
│  ├─ db/                         # schema/, client.ts, seed.ts
│  ├─ auth/  storage/  exports/
│  └─ permissions.ts  errors.ts  logger.ts  crypto.ts  env.ts
│
│  ──────────────  JEMBATAN  ──────────────
├─ shared/
│  ├─ schemas/                    # skema Zod per fitur (invoice.ts, tenant.ts, ...)
│  ├─ enums.ts                    # InvoiceStatus, RoomStatus, ElectricityPayer, ...
│  └─ types.ts
│
└─ tests/
   ├─ server/                     # unit (domain) dan integrasi (repository, service) - PostgreSQL asli
   ├─ web/                        # tes hook/komponen bila perlu
   └─ e2e/                        # Playwright
```

Alias impor: `@/*` menunjuk ke akar repositori (`@/server/...`, `@/shared/...`, `@/lib/...`).

---

## 9. Konvensi

- TypeScript `strict`. Dilarang `any` dan `@ts-ignore` tanpa komentar alasan.
- Nama berkas backend: `<fitur>.<lapisan>.ts` (`invoice.service.ts`). Nama fitur satu per modul domain: `property`, `room`, `tenant`, `invoice`, `meter`, `asset`, `maintenance`, `expense`, `report`, `audit`, `user`.
- Controller hanya memanggil service. Service hanya memanggil repository, domain, dan service lain. Repository tidak memanggil apa pun selain database.
- Migrasi dibuat drizzle-kit, diberi nama deskriptif, dan di-commit. **Migrasi yang sudah dijalankan tidak diedit**, buat migrasi baru.
- Commit kecil, format `type(scope): ringkasan`. Satu cabang per milestone.
- Milestone selesai hanya jika `yarn lint`, `yarn typecheck`, dan `yarn test` lolos.
- Dependensi baru di luar spec ini: tanyakan dulu.

---

## 10. Pengujian

| Jenis     | Isi                                                                                                                      | Lokasi                |
| --------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| Unit      | `server/domain`: jatuh tempo (BR-11), terlambat (BR-10), hitung listrik                                                  | `tests/server/domain` |
| Integrasi | Repository dan service terhadap PostgreSQL asli (database `kost_test`, di-reset sebelum tes). Termasuk tes isolasi (3.8) | `tests/server/...`    |
| Frontend  | Hook dan komponen penting bila perlu                                                                                     | `tests/web`           |
| E2E       | Alur kritis: login, buat tenant, tagihan lunas, tenant keluar, unggah foto                                               | `tests/e2e`           |

Tes aturan bisnis wajib untuk BR-01 sampai BR-18, terutama **BR-01, BR-04, BR-09, BR-11**, dan idempotensi pembuatan tagihan (dipanggil dua kali, hasilnya sama).

**Data contoh** (`yarn db:seed`, hanya dev): dua organisasi (A dan B), satu owner di tiap organisasi, satu pengelola di A, dua properti di A dan satu di B, 10 kamar per properti, tenant dengan berbagai penanggung listrik dan status bayar. Data B dipakai untuk membuktikan isolasi.

---

## 11. Lingkungan dan Deploy

### 11.1 Variabel lingkungan (`.env.example`)

| Variabel                        | Fungsi                                                                                             |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                  | Koneksi PostgreSQL (aplikasi, migrasi, seed)                                                       |
| `APP_ORIGIN`                    | Alamat resmi aplikasi (misalnya `https://kost.contoh.id`), dipakai pemeriksaan `Origin` dan cookie |
| `NIK_ENCRYPTION_KEY`            | Kunci 32 byte (base64) untuk NIK                                                                   |
| `FILE_SIGNING_SECRET`           | Tanda tangan tautan file                                                                           |
| `STORAGE_DRIVER`, `STORAGE_DIR` | Penyimpanan file                                                                                   |
| `NEXT_PUBLIC_APP_URL`           | Satu-satunya variabel yang boleh dibaca frontend (`lib/env.ts`)                                    |
| `TZ=Asia/Jakarta`               | Zona waktu proses                                                                                  |

Berkas `.env` tidak masuk git. Variabel server dibaca hanya lewat `server/env.ts`.

### 11.2 Lokal (sekarang)

`docker compose -f docker/compose.dev.yml up -d` menjalankan PostgreSQL (hanya terbuka di `127.0.0.1`). Lalu `yarn db:migrate`, `yarn db:seed`, `yarn dev`. PostgreSQL yang terpasang langsung di komputer juga bisa.

### 11.3 CI

`.github/workflows/dev.yml`: pasang dependensi dengan `yarn install --immutable`, jalankan `yarn lint`, `yarn typecheck`, dan `yarn test` dengan PostgreSQL sebagai service container. `dependabot.yml` untuk pembaruan dependensi.

### 11.4 Produksi (VPS)

- Next.js `output: 'standalone'` dalam image Docker. Caddy di depan untuk HTTPS dan header keamanan. Perlu nama domain.
- PostgreSQL **tidak dibuka ke internet**. Hanya port 80, 443, dan SSH (kunci saja) yang terbuka. Firewall `ufw`, `fail2ban`, pembaruan keamanan otomatis.
- Migrasi dijalankan sebagai langkah terpisah sebelum aplikasi baru dinyalakan. Rilis awal boleh manual (`git pull`, build, `docker compose up -d`).
- `GET /api/health` memeriksa koneksi database. Pantau dari luar dengan layanan uptime.

### 11.5 Cadangan

Cadangan adalah **tugas infrastruktur di server**, bukan fitur aplikasi, jadi tidak melanggar BR-18.

- `scripts/backup.sh` lewat crontab server: `pg_dump` harian terkompresi, ditambah salinan folder `STORAGE_DIR`.
- Salin ke **lokasi lain di luar VPS** (misalnya objek storage via `rclone`). Retensi awal: 14 harian dan 8 mingguan.
- `NIK_ENCRYPTION_KEY` dan `.env` disimpan terpisah dari cadangan data.
- **Uji pemulihan sebelum rilis** (`scripts/restore.sh` ke database kosong).
- Lokasi server dan UU PDP: VPS di Indonesia memudahkan, tetapi kewajiban hukumnya belum dicek **[TERBUKA]**.

---

## 12. Peta Teknis per Milestone

Urutan dan kriteria selesai mengikuti PRD bagian 12. **Urutan eksekusi: M0, M1, M2, M3, M5, M6, M4, M7, M8** (M4 setelah M6 karena memakai tabel pengeluaran; ketergantungan lain ada di PRD bagian 12). Tambahan teknis:

| Tahap | Catatan teknis                                                                                                                                                                          |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M0    | Bagian 13 di bawah                                                                                                                                                                      |
| M1    | `PropertyRepository`, `RoomRepository`, `MeterRepository` (daftar saja). Pengaturan properti (`has_facilities`, `electricity_managed`, `electricity_pattern`) menggerakkan menu (BR-16) |
| M2    | Enkripsi NIK, unggah foto tenant, riwayat harga sewa (BR-06), indeks unik BR-01                                                                                                         |
| M3    | `InvoiceService.generateDue` idempoten (5.2), pembuat tautan `wa.me` dan templat, `reminder_logs`, tenant keluar dalam satu transaksi (BR-04)                                           |
| M4    | Meteran dan bacaan, rumus listrik di `electricity.rules.ts`, baris `ELECTRICITY` di tagihan. `TENANT_DIRECT` tidak dicatat sama sekali (PRD 7.8)                                        |
| M5    | Unggah foto sebelum dan sesudah, kondisi asset mengikuti status tiket                                                                                                                   |
| M6    | Pengeluaran. Pengeluaran listrik membawa `meter_id`                                                                                                                                     |
| M7    | `ReportService` tunggal, dipakai dashboard dan ekspor. Uji angka dashboard sama dengan ekspor                                                                                           |
| M8    | Halaman audit log, manifest PWA dan ikon (tanpa service worker offline), perapian, uji pemulihan cadangan                                                                               |

---

## 13. M0 Rinci

**Tujuan** (PRD): login berjalan, dua owner terbukti terpisah datanya, perubahan tercatat di `audit_logs`.

Pekerjaan, berurutan:

1. **Kerangka proyek**: `create-next-app` (TypeScript, Tailwind, App Router) dengan Yarn Berry, `.nvmrc`, shadcn/ui, ESLint dengan aturan batas BE/FE (2.2), Vitest, Playwright, `lib/env.ts` dan `server/env.ts`, alias `@/*`, skrip `package.json` (lihat `AGENTS.md`), `Dockerfile`, `.dockerignore`, `.github/workflows/dev.yml`, `dependabot.yml`.
2. **Database lokal**: `compose.dev.yml`, konfigurasi drizzle-kit, database tes.
3. **Skema dan migrasi dasar**: `organizations`, `users`, `sessions`, `login_attempts`, `properties` (minimal), `property_access`, `audit_logs` (+ trigger penolak ubah dan hapus).
4. **Fondasi backend**: `BaseRepository` (3.1), pembuat `scope` dan `ctx`, galat domain dan `error-mapper`, `logger` dengan `requestId`.
5. **Autentikasi buatan sendiri** (3.4): hash kata sandi (scrypt), sesi dan cookie, login dengan pembatasan percobaan, logout, ubah kata sandi sendiri, wajib ganti sandi awal (`must_change_password`), pemeriksaan `Origin`, owner membuat dan mereset akun pengelola, penonaktifan pengguna (sesi dicabut), skrip `create-owner` dan `reset-password`. Tes keamanan autentikasi (3.8) ditulis bersamaan.
6. **tRPC**: `init.ts`, lima prosedur (2.4), `permissions.ts`, satu fitur contoh lengkap tiga lapis (`property`: controller, service, repository) dengan skema di `shared/schemas/property.ts`.
7. **Audit**: `AuditService` dan pemakaiannya di `PropertyService.create`.
8. **File privat**: `StorageDriver` lokal, `/api/upload`, `/api/files`, tautan bertanda tangan.
9. **Kerangka UI polos**: `app/login`, `app/(contents)/layout.tsx` dengan menu menurut peran, `lib/api` (klien tRPC), `lib/auth`, `useMe`. Tanpa gaya khusus (gaya menunggu `design.md`).
10. **Seed dan tes** sesuai bagian 3.8 dan 10.

**Selesai jika**: semua tes di 3.8 lolos, `yarn lint`, `yarn typecheck`, `yarn test` hijau, owner A dan owner B login di peramban dan masing-masing hanya melihat propertinya, dan membuat properti menghasilkan satu baris di `audit_logs`.

---

## 14. Keputusan Teknis yang Masih Terbuka

| No  | Pertanyaan                                                                         | Default sementara                                                                                                                          |
| --- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | ORM: Drizzle atau Prisma?                                                          | Drizzle                                                                                                                                    |
| 2   | Autentikasi                                                                        | **Dibangun sendiri** [PUTUSAN]. Hash alternatif: argon2id (`@node-rs/argon2`) bila kelak mau menambah dependensi                           |
| 3   | Backend tetap satu aplikasi Next.js, atau dipisah menjadi dua paket (API dan web)? | Satu aplikasi, dipisah dengan folder dan lint. Pemisahan fisik menambah satu layanan untuk dijaga dan memutus pemakaian tipe tRPC langsung |
| 4   | Email untuk reset kata sandi mandiri dan undangan                                  | Ditunda. Fase 1 tanpa email; ditambah nanti (perlu penyedia SMTP)                                                                          |
| 5   | Pendaftaran owner: mandiri atau dibuatkan oleh kamu?                               | Dibuatkan lewat `yarn create-owner`                                                                                                        |
| 6   | File disimpan di disk VPS atau layanan S3-kompatibel?                              | Disk VPS, lapisan sudah siap diganti                                                                                                       |
| 7   | Lokasi VPS, domain, dan spesifikasi                                                | Belum ditentukan. Perlu domain sebelum rilis                                                                                               |
| 8   | PostgreSQL produksi di dalam Docker atau terpasang di host?                        | Docker, volume terpisah, cadangan lewat `pg_dump`                                                                                          |
| 9   | Kewajiban UU PDP (retensi, persetujuan tenant, lokasi data)                        | Dicek sebelum rilis                                                                                                                        |
| 10  | Username unik di seluruh sistem atau per organisasi?                               | Unik di seluruh sistem (login tanpa memilih organisasi)                                                                                    |

---

## 15. Prompt Awal untuk Claude Code (M0)

Letakkan `AGENTS.md` dan `CLAUDE.md` di akar proyek, `PRD.md` dan `TECH-SPEC.md` di `docs/`, lalu jalankan:

```
Baca CLAUDE.md (dan AGENTS.md), docs/PRD.md (bagian 0 sampai 6, 7.1, 7.13, 10, 12) dan
docs/TECH-SPEC.md secara lengkap. Kerjakan Milestone M0 saja, sesuai TECH-SPEC bagian 13.

Mulai dengan rencana singkat: urutan pekerjaan dan berkas yang akan dibuat. Setelah saya setujui,
kerjakan berurutan. Pasang aturan batas frontend/backend di ESLint lebih dulu, lalu migrasi dan
tes isolasi repository (TECH-SPEC 3.8), baru kode aplikasi. Jaga pemisahan: frontend tidak boleh
mengimpor kode server, dan semua data lewat /api/trpc. Jangan membuat fitur di luar M0 dan jangan
menentukan warna atau gaya tampilan; itu menunggu docs/design.md.

Jika ada keputusan yang belum tertulis, pakai default di TECH-SPEC bagian 14 dan catat di akhir
pekerjaan. Setelah selesai, jalankan lint, typecheck, dan semua tes, lalu laporkan hasilnya.
```
