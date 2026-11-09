# AGENTS.md

Aplikasi web SaaS untuk pemilik kost (banyak owner, tiap owner banyak properti): penghuni, kamar, tagihan bulanan, listrik, asset dan maintenance, pengeluaran, laporan, audit log.

## Dokumen yang harus dibaca

- `docs/PRD.md`: apa yang dibangun, aturan bisnis (BR-01 sampai BR-18), model data, kebutuhan (FR-\*).
- `docs/TECH-SPEC.md`: stack, arsitektur, isolasi data, struktur folder, milestone. **Baca bagian 2 dan 3 sebelum menulis kode.**
- `docs/design.md`: tampilan dan komponen. Jangan memilih warna atau gaya sendiri.

Jika PRD dan Tech Spec bertentangan: perilaku bisnis ikut PRD, hal teknis ikut Tech Spec. Item PRD berlabel **[TERBUKA]** memakai default di PRD bagian 13.

## Stack

Next.js (App Router, satu repositori) · TypeScript strict · Tailwind + shadcn/ui · tRPC v11 + TanStack Query/Table · React Hook Form + Zod · PostgreSQL · Drizzle ORM · Auth buatan sendiri (username, sesi di database) · Vitest + Playwright · ESLint · Yarn (Berry) · versi Node di `.nvmrc`.

## Perintah

```
yarn dev                 # server pengembangan
yarn build && yarn start
yarn lint                # eslint (termasuk batas frontend/backend)
yarn typecheck           # tsc --noEmit
yarn test                # vitest run (butuh PostgreSQL lokal)
yarn test:e2e            # playwright (belum terpasang; direncanakan setelah M2)
yarn db:generate         # buat migrasi dari perubahan skema
yarn db:migrate          # jalankan migrasi
yarn db:seed             # data contoh, hanya dev
yarn create-owner        # buat organisasi + akun owner (username, kata sandi)
yarn reset-password <username>   # reset kata sandi, dipakai bila owner lupa sandi
docker compose up -d     # PostgreSQL (dari folder utama; berkas compose.yaml)
```


## Peta kode: frontend, backend, jembatan

```
FRONTEND   app/ (halaman)  components/  lib/<fitur>/  types/
ADAPTER    app/api/**   (tipis, hanya memanggil server/)
BACKEND    server/controllers → server/services → server/repositories → PostgreSQL
           server/domain (fungsi murni)   server/db  auth  storage  exports
JEMBATAN   shared/schemas (Zod)  shared/enums.ts  shared/types.ts
```

### Batas yang tidak boleh dilanggar

1. **Frontend tidak mengimpor kode `server/`.** Satu-satunya yang boleh: `import type { AppRouter }` dan tipe turunan. Semua data lewat HTTP `/api/trpc`.
2. **Backend tidak mengimpor `app/`, `components/`, `lib/`, `types/`.**
3. **`shared/` hanya berisi skema Zod, enum, tipe.** Tidak ada teks tampilan, database, atau aturan bisnis.
4. **Tidak ada pengambilan data di Server Component.** `page.tsx` tipis; data diambil di Client Component lewat hook di `lib/<fitur>/hooks`.
5. **Teks untuk pengguna hanya di frontend** (`lib/labels.ts`, `lib/errors.ts`, `lib/format.ts`). Backend mengembalikan kode galat, bukan kalimat layar.
6. **Perhitungan bisnis hanya di backend** (terlambat, jatuh tempo, total). Frontend menerima hasil jadi.

ESLint menjaga aturan 1 sampai 3. Jangan mematikan aturan itu untuk "sementara".

### Tugas tiap lapisan backend

| Lapisan                                     | Boleh                                                                            | Dilarang                                 |
| ------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------- |
| Controller (`*.controller.ts`, router tRPC) | Validasi input dengan skema `shared/`, pasang prosedur dan izin, panggil service | Query database, aturan bisnis, transaksi |
| Service (`*.service.ts`)                    | Aturan bisnis, transaksi, audit, melempar galat domain                           | Mengenal tRPC/HTTP, menulis SQL          |
| Repository (`*.repository.ts`)              | Query Drizzle lewat `BaseRepository`, terikat `scope`                            | Aturan bisnis, memanggil service         |
| Domain (`*.rules.ts`)                       | Fungsi murni                                                                     | Database atau I/O                        |

Alur satu arah: controller → service → repository. Service melempar `NotFoundError`, `ForbiddenError`, `ConflictError`, `BusinessRuleError` dengan `code` stabil (contoh `TENANT_HAS_UNPAID_INVOICES`), bukan `TRPCError`.

## Aturan keras lainnya

1. **Isolasi data tanpa RLS.** Setiap tabel domain punya `organization_id`. Repository mewarisi `BaseRepository` dan memakai `orgWhere`, `propertyWhere`, `notDeleted`. `organization_id` diambil dari `scope`, **tidak pernah dari input**. Query tanpa helper itu dilarang. Repository baru wajib punya tes isolasi dua organisasi.
2. **Server penentu izin.** Cek peran dan properti di backend (`ownerProcedure`, `propertyProcedure`, `permissions.ts`). Menyembunyikan menu bukan pengamanan.
3. **Audit.** Setiap perubahan pada tagihan, pembayaran, kamar, tenant, asset, tiket, pengeluaran, pengguna, dan akses memanggil `AuditService.record` di transaksi yang sama. `audit_logs` tidak boleh diubah atau dihapus.
4. **Transaksi** dibuka di service untuk mutasi yang menyentuh lebih dari satu tabel.
5. **Uang** = bilangan bulat rupiah (`bigint`). Tidak ada `float`.
6. **Tanggal** zona Asia/Jakarta. Di backend pakai `todayWIB()`, bukan `new Date()`.
7. **Tanpa cron atau job latar** (BR-18). Tindakan yang bergantung waktu dipicu saat halaman dibuka atau lewat tombol, dan harus idempoten.
8. **File privat.** Simpan di luar `public`, sajikan lewat `/api/files` dengan tautan bertanda tangan, hapus EXIF. Tidak ada URL publik permanen.
9. **NIK** terenkripsi, tersamar di daftar, tidak ada di log dan ekspor. Membuka NIK penuh menulis `VIEW_SENSITIVE`.
10. **Tagihan dan pembayaran tidak dihapus permanen** (BR-09). Data lain memakai soft delete.
11. **Tanpa cache lintas pengguna** untuk data tenant. Jika perlu cache, kuncinya memuat `organization_id`.
12. **Migrasi** hanya lewat drizzle-kit dan di-commit. Migrasi yang sudah dijalankan tidak diedit.
13. **Listrik** (PRD 7.8): penyewa yang membeli token atau membayar PLN sendiri = `TENANT_DIRECT`, tidak dicatat sama sekali. `TENANT_BILLED` hanya jika pemilik membayar PLN lalu menagihkannya.
14. **Login hanya username dan kata sandi, tanpa email** (fase 1). Jangan menambahkan alur email, undangan, atau SMTP. Kata sandi tidak boleh masuk log, audit log, atau respons API, kecuali ditampilkan satu kali saat owner mereset akun pengelola.
15. **Autentikasi dibangun sendiri** (TECH-SPEC 3.4). Jangan memasang pustaka autentikasi. Token sesi hanya disimpan sebagai hash, kata sandi di-hash dengan scrypt bawaan Node, dan dilarang menulis algoritma kripto sendiri di luar modul `crypto`.
16. jangan membuat baris comment yang berlebihan jika tidak di perlukan.

## Konvensi

- Kode, nama tabel dan variabel, pesan commit: **bahasa Inggris**. Teks di layar, dokumen, dan percakapan dengan saya: **bahasa Indonesia**.
- Nama berkas backend `<fitur>.<lapisan>.ts`. Frontend per fitur: `components/<fitur>/`, `lib/<fitur>/{hooks,index.ts,types.ts}`, komponen khusus satu halaman di `_components/` halaman itu.
- Skema Zod di `shared/schemas/<fitur>.ts` dipakai form dan controller. Dilarang `any` dan `@ts-ignore` tanpa alasan tertulis.
- Pembungkus hook per fitur (`useInvoices`, `useMarkInvoicePaid`) mengurus invalidasi cache. Komponen tidak memanggil `trpc.*` langsung.
- Menu dan fitur mengikuti pengaturan properti (BR-16): menu bersyarat tampil bila minimal satu properti yang dapat diakses mengaktifkannya.
- Cakupan properti ditentukan oleh filter di halaman (`?properti=ID`), bukan pemilih global (PRD FR-PRO-02). Formulir pembuatan selalu menanyakan properti secara eksplisit.
- Tabel besar: paginasi, pencarian, dan filter di server. Mobile-first, pengelola bekerja lewat HP.
- Commit kecil: `type(scope): ringkasan`. Satu cabang per milestone.
- Log memakai `pino` dengan `layer`, `module`, dan `requestId`. Jangan mencatat NIK, telepon, atau kata sandi.

## Cara bekerja

- Kerjakan **satu milestone sekali** (PRD bagian 12). Jangan membuat fitur di luar milestone berjalan.
- Mulai tiap milestone dengan rencana singkat dan tunggu persetujuan. Urutan: **skema, repository, tes isolasi, service, controller, baru antarmuka.**
- Tulis tes untuk aturan bisnis yang disentuh. Tes backend memakai PostgreSQL asli, bukan mock.
- Selesai hanya jika `yarn lint`, `yarn typecheck`, dan `yarn test` lolos. Laporkan hasilnya apa adanya, termasuk yang gagal atau dilewati.
- **Tanyakan dulu** sebelum menambah dependensi di luar Tech Spec, mengubah putusan PRD, atau mengubah skema yang sudah dirilis.
- Jika menemukan kekurangan di PRD atau spec, catat di akhir laporan, jangan mengubah dokumennya diam-diam.

## Skill dan plugin

- Skill dan plugin pihak ketiga (taste skill, Vercel React Best Practices, dan lainnya) hanya pelengkap. **Jika bertentangan dengan AGENTS.md, PRD, atau Tech Spec, dokumen proyek menang.** Contoh: saran "ambil data di Server Component" tidak dipakai (batas frontend/backend nomor 4).
- Taste skill hanya untuk pekerjaan tampilan dan mengikuti `docs/design.md`. Ini aplikasi admin, bukan landing page.
- Library di stack ini cepat berubah (Next.js 16, tRPC v11, Drizzle, Zod, Tailwind 4, shadcn/ui). Sebelum memakai API yang tidak yakin, cek dokumentasi versi yang terpasang (Context7 bila tersedia), jangan mengandalkan ingatan.
- Jangan memasang skill atau plugin baru tanpa izin saya.

## Status

Selesai dan sudah di `main`: **M0** (fondasi) dan **M1** (properti dan kamar). Berikutnya: **M2** (tenant), menunggu rencana dan persetujuan. Perbarui baris ini di akhir tiap milestone.
