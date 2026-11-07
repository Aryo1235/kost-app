# Milestone dan Prompt Siap Salin

Letakkan di `docs/MILESTONES.md`. Berkas ini adalah daftar kerja dan kumpulan prompt untuk Claude Code, satu prompt per milestone.

## Cara memakai

1. Kerjakan **satu milestone sekali**, sesuai urutan di bawah.
2. Mulai percakapan baru di Claude Code untuk tiap milestone (`/clear`), pakai mode rencana, lalu salin prompt milestone itu.
3. Baca rencana yang diajukan Claude Code. Setujui, atau minta perbaikan, **sebelum** dia menulis kode.
4. Setelah selesai: tes hijau, kamu coba sendiri di browser (HP dan desktop) memakai data contoh, gabungkan ke cabang utama, lalu centang di sini.

## Urutan pengerjaan

| Urut | Tahap  | Isi                                                                                                                     | Selesai |
| ---- | ------ | ----------------------------------------------------------------------------------------------------------------------- | ------- |
| 1    | **M0** | Fondasi: login, peran, isolasi data, audit log, file privat                                                             | [ ]     |
| 2    | **M1** | Properti dan kamar                                                                                                      | [x]     |
| 3    | **M2** | Tenant                                                                                                                  | [ ]     |
| 4    | **M3** | Tagihan, pembayaran, pengingat WhatsApp, tenant keluar                                                                  | [ ]     |
| 5    | **M5** | Asset dan maintenance                                                                                                   | [ ]     |
| 6    | **M6** | Pengeluaran                                                                                                             | [ ]     |
| 7    | **M4** | Listrik (setelah M6 karena memakai tabel pengeluaran; sebaiknya setelah pola A sampai E divalidasi dengan pemilik kost) | [ ]     |
| 8    | **M7** | Dashboard, laporan, ekspor                                                                                              | [ ]     |
| 9    | **M8** | Audit log, pengaturan, perapian, uji menyeluruh, siap rilis                                                             | [ ]     |

## Ketergantungan lintas tahap

- Tagihan pertama saat tenant dibuat dikerjakan di **M3**, bukan M2.
- Status pembayaran di daftar kamar dan filter "ada tunggakan" di daftar tenant menyusul di **M3**.
- Pemilihan meteran di form kamar dan kewajiban meteran pada pengeluaran listrik diaktifkan di **M4**.
- Pemicu pembuatan tagihan saat Dashboard dibuka ditambahkan di **M7**.
- Detail kamar bertambah bertahap: tenant (M2), asset dan tiket (M5), riwayat meteran (M4).
- Cakupan properti: filter di tiap halaman daftar (PRD FR-PRO-02, `?properti=ID`), bukan pemilih global di navbar. Formulir pembuatan selalu menanyakan properti secara eksplisit.

## Penutup yang sama di semua prompt

Setiap prompt di bawah sudah memuat bagian ini. Kalau mau menyingkat, bagian ini bisa ditempel sendiri di akhir prompt apa pun:

```
Di akhir: jalankan yarn lint, yarn typecheck, dan yarn test. Periksa kriteria "Selesai jika"
milestone ini (PRD bagian 12) satu per satu dan laporkan lolos atau tidak beserta buktinya.
Catat kekurangan PRD atau spec yang ditemukan di laporan, jangan mengubah dokumennya. Perbarui
baris Status di AGENTS.md. Commit per langkah.
```

---

## M0 — Fondasi

Pertama kali dijalankan. Syarat: proyek sudah dibuat, `docs/` dan `AGENTS.md`/`CLAUDE.md` sudah di tempatnya, `docs/design.md` sudah ada.

```
Baca CLAUDE.md (dan AGENTS.md), docs/PRD.md (bagian 0 sampai 6, 7.1, 7.13, 10, 12),
docs/TECH-SPEC.md secara lengkap, dan docs/design.md. Kerjakan Milestone M0 saja, sesuai
TECH-SPEC bagian 13.

Keadaan proyek: sudah dibuat dengan create-next-app (Next.js 16, App Router, tanpa src/,
TypeScript, Tailwind, ESLint) dan Yarn Berry. Jangan dibuat ulang; sesuaikan strukturnya ke
TECH-SPEC bagian 8.

Mulai dengan rencana singkat dan tunggu persetujuan saya. Rencana harus memuat:
1. Urutan kerja.
2. Skema tabel M0 beserta kebiasaan umum semua tabel: kolom dasar, tipe uang dan tanggal,
   pilihan enum di database (pgEnum atau teks dengan CHECK), indeks unik parsial.
3. Rancangan autentikasi buatan sendiri (TECH-SPEC 3.4): tabel users, sessions, login_attempts,
   format hash kata sandi, alur sesi dan cookie, serta daftar tes keamanan autentikasi yang akan
   ditulis.

Urutan kerja setelah disetujui: aturan batas frontend/backend di ESLint dulu; lalu skema dan
migrasi; BaseRepository dan tes isolasi (TECH-SPEC 3.8); autentikasi buatan sendiri (TECH-SPEC 3.4); tRPC dan satu fitur contoh
tiga lapis (property); audit; file privat; terakhir kerangka UI.

UI: ikuti docs/design.md untuk halaman login, kerangka aplikasi (sidebar di desktop, navigasi di
HP), halaman Pengguna (owner membuat dan mereset akun pengelola, FR-AUTH-03 dan 05) dan halaman
Akun (ubah kata sandi sendiri). Pasang shadcn/ui dan terapkan token desain ke app/globals.css.
Jika ada halaman pratinjau sementara (app/design-preview), hapus di akhir.

Data contoh (seed): dua organisasi (A dan B), owner di tiap organisasi, satu pengelola di A, sesuai
TECH-SPEC bagian 10. Jangan membuat fitur di luar M0.

Di akhir: jalankan yarn lint, yarn typecheck, dan yarn test. Periksa kriteria "Selesai jika" M0
(PRD bagian 12 dan TECH-SPEC 13) satu per satu dan laporkan lolos atau tidak beserta buktinya.
Catat kekurangan PRD atau spec di laporan, jangan mengubah dokumennya. Perbarui baris Status di
AGENTS.md. Commit per langkah.
```

Kamu coba sendiri: login sebagai owner A dan owner B, masing-masing hanya melihat propertinya. Buat properti baru, lalu pastikan ada satu baris di `audit_logs`.

Karena autentikasinya dibuat sendiri, setelah M0 selesai minta **tinjauan keamanan terpisah** sebelum lanjut: sesi Claude Code baru yang hanya meninjau `server/auth/` terhadap TECH-SPEC 3.4 dan 3.8 (atau plugin `security-guidance`), dan perbaiki temuannya dulu.

---

## M1 — Properti dan kamar

```
Baca CLAUDE.md, docs/PRD.md (bagian 2.2, 5, 6.2 untuk properties, property_access, rooms, meters,
7.2, 7.3, 8, 9.1), docs/TECH-SPEC.md bagian 12 (baris M1), dan docs/design.md. Kerjakan Milestone
M1 saja.

Mulai dengan rencana singkat dan tunggu persetujuan saya.

Lingkup:
- Lengkapi tabel properties (has_facilities, electricity_managed, electricity_pattern), buat tabel
  rooms dan kerangka tabel meters (hanya tabel dan relasi rooms.meter_id; antarmuka meteran
  menyusul di M4).
- Properti (FR-PRO-01 sampai 05): owner membuat, mengubah, menonaktifkan; pertanyaan pengaturan
  saat membuat (ada fasum, listrik dikelola aplikasi, pola listrik) dengan nilai awal dari
  Lampiran C. Pola hanya disimpan, belum dipakai. Pemilih properti di header, owner punya "Semua
  properti". Menu mengikuti pengaturan properti (BR-16).
- Kamar (FR-ROOM-01, 02, 04, 06): buat, ubah, daftar dengan paginasi, pencarian, dan filter di
  server. Tanpa kolom tenant, status bayar, dan pemilihan meteran dulu (menyusul M2, M3, M4).
  Aturan yang butuh tenant (FR-ROOM-04 dan 06) cukup disiapkan titik panggilnya, diselesaikan di M2.
- Pengelola hanya melihat properti yang ditugaskan (PRD 2.2). Owner memberi akses per properti di
  halaman Pengguna.
- Seed: tambahkan untuk organisasi A dua properti dengan 10 kamar masing-masing, organisasi B satu
  properti, dan sediakan opsi seed satu properti 300 kamar untuk menguji kecepatan daftar.

Tes wajib: akses pengelola per properti, BR-16 (menu), kode kamar unik per properti, isolasi
antar organisasi untuk repository baru.

Di akhir: jalankan yarn lint, yarn typecheck, dan yarn test. Periksa kriteria "Selesai jika" M1
(PRD bagian 12) satu per satu dan laporkan lolos atau tidak beserta buktinya. Catat kekurangan PRD
atau spec di laporan, jangan mengubah dokumennya. Perbarui baris Status di AGENTS.md. Commit per
langkah.
```

---

## M2 — Tenant

```
Baca CLAUDE.md, docs/PRD.md (bagian 2.2, 5, 6.2 untuk tenants, rent_price_history, tenant_vehicles,
tenant_electronics, 7.4, 9.2, 10.2), docs/TECH-SPEC.md (bagian 3.6, 7, 12 baris M2), dan
docs/design.md. Kerjakan Milestone M2 saja.

Mulai dengan rencana singkat dan tunggu persetujuan saya.

Lingkup:
- Tenant FR-TEN-01 sampai 07 dan 09 sampai 13. FR-TEN-08 dibagi dua: di M2 hanya baris pertama
  rent_price_history; pembuatan tagihan pertama dikerjakan di M3 (jangan buat tabel invoice).
- NIK: validasi 16 digit, simpan terenkripsi AES-256-GCM (kolom nik_encrypted ditambah nik_last4),
  kunci dari env. Daftar hanya menampilkan 4 digit terakhir; NIK penuh hanya di detail dan
  membukanya menulis audit VIEW_SENSITIVE. NIK tidak boleh muncul di log.
- Foto tenant lewat /api/upload (kompres di klien, EXIF dibuang di server) dan ditampilkan lewat
  /api/files dengan tautan bertanda tangan.
- Nomor WhatsApp dinormalisasi ke format 62.
- Hanya kamar AVAILABLE yang bisa dipilih; satu tenant aktif per kamar (BR-01, indeks unik parsial
  di database). Status kamar menjadi OCCUPIED otomatis. Selesaikan FR-ROOM-04 dan 06 yang
  tertunda dari M1.
- Tanggal tagihan default dari tanggal masuk, harga default dari harga dasar kamar (BR-02, BR-06).
  Ubah harga per tenant dan ubah harga massal memakai tanggal mulai berlaku (FR-TEN-09 dan 10).
- Penanggung listrik: nilai awal dari pola listrik properti (hanya tampil jika listrik dikelola
  aplikasi). Simpan penanggung, metode, dan tarif saja; penagihan listrik dikerjakan di M4.
  Ingat aturan 13 di AGENTS.md (TENANT_DIRECT tidak dicatat).
- Kendaraan dan barang elektronik pribadi. Detail kamar menampilkan tenant aktif.
- Seed: tenant dengan berbagai penanggung listrik di properti organisasi A.

Tes wajib: BR-01, BR-06 (riwayat harga), enkripsi NIK (nilai di database bukan teks biasa),
VIEW_SENSITIVE tercatat, normalisasi telepon, isolasi antar organisasi, akses per properti.

Di akhir: jalankan yarn lint, yarn typecheck, dan yarn test. Periksa kriteria "Selesai jika" M2
(PRD bagian 12) satu per satu dan laporkan lolos atau tidak beserta buktinya. Catat kekurangan PRD
atau spec di laporan, jangan mengubah dokumennya. Perbarui baris Status di AGENTS.md. Commit per
langkah.
```

---

## M3 — Tagihan, pembayaran, pengingat, tenant keluar

```
Baca CLAUDE.md, docs/PRD.md (bagian 5 khususnya BR-02, 03, 04, 09, 10, 11, 12, 13, 18; 6.2 untuk
invoices, invoice_items, reminder_logs; 7.5, 7.6, 7.7, 9.3, 9.5, Lampiran A), docs/TECH-SPEC.md
(bagian 5, 5.2, 12 baris M3), dan docs/design.md. Kerjakan Milestone M3 saja.

Mulai dengan rencana singkat dan tunggu persetujuan saya.

Lingkup:
- Tagihan pertama dibuat dalam transaksi yang sama dengan pembuatan tenant (FR-TEN-08, FR-INV-02);
  sambungkan ke TenantService dari M2.
- InvoiceService.generateDue: idempoten (INSERT ... ON CONFLICT DO NOTHING ditambah
  pg_advisory_xact_lock per organisasi), jendela 7 hari, tanpa cron (BR-18). Dipicu saat halaman
  Tagihan dibuka (di useEffect, bukan saat render) dan lewat tombol "Buat tagihan bulan ini".
  Pemicu di Dashboard menyusul di M7.
- Aturan jatuh tempo (dueDateFor, BR-11) dan terlambat (isOverdue plus jumlah hari) di
  server/domain, dihitung di backend.
- Rincian tagihan: RENT sesuai harga berlaku pada tanggal jatuh tempo, OTHER yang bisa
  ditambah/diubah/dihapus selagi UNPAID, total selalu sama dengan jumlah baris. Tagihan PAID tidak
  bisa diubah; koreksi lewat batal bayar. VOID dengan alasan. Tidak ada hapus permanen (BR-09).
- Pembayaran: tanggal bayar, foto bukti opsional, payment_method opsional. Riwayat pembayaran per
  tenant. Filter dan pencarian daftar tagihan.
- Pengingat WhatsApp: tombol membuka tautan wa.me dengan template (variabel di FR-REM-03), template
  bisa diedit di Pengaturan, reset ke bawaan Lampiran A, dicatat di reminder_logs, tampil
  "pengingat terakhir dikirim".
- Tenant keluar (FR-OUT-01 sampai 05) dalam satu transaksi: tolak jika masih ada tagihan UNPAID
  dan tampilkan daftarnya; jika lunas, tenant CHECKED_OUT, kamar AVAILABLE, pembuatan tagihan
  berhenti. Listrik terakhir dimasukkan manual sebagai baris OTHER.
- Tambahan dari tahap sebelumnya: kolom status bayar bulan berjalan di daftar kamar dan filter
  "ada tunggakan" di daftar tenant.
- Seed: tagihan dengan campuran lunas, belum bayar, terlambat, dan VOID.

Tes wajib: BR-04, BR-09, BR-10, BR-11 (tanggal 31 menjadi 30 November, 28 dan 29 Februari),
generateDue dipanggil dua kali dan secara paralel tidak membuat tagihan ganda, unik per tenant dan
periode kecuali VOID, total sama dengan jumlah baris, tagihan PAID tidak bisa diubah, audit
tercatat, isolasi antar organisasi.

Di akhir: jalankan yarn lint, yarn typecheck, dan yarn test. Periksa kriteria "Selesai jika" M3
(PRD bagian 12) satu per satu dan laporkan lolos atau tidak beserta buktinya. Catat kekurangan PRD
atau spec di laporan, jangan mengubah dokumennya. Perbarui baris Status di AGENTS.md. Commit per
langkah.
```

---

## M5 — Asset dan maintenance

```
Baca CLAUDE.md, docs/PRD.md (bagian 5 khususnya BR-05 dan BR-14; 6.2 untuk assets,
maintenance_schedules, maintenance_tickets, ticket_photos; 7.9, 7.10, 9.4; 7.3 untuk FR-ROOM-05
dan 07), docs/TECH-SPEC.md (bagian 7, 12 baris M5), dan docs/design.md. Kerjakan Milestone M5
saja.

Mulai dengan rencana singkat dan tunggu persetujuan saya.

Lingkup:
- Asset kamar dan asset fasum (fasum hanya jika properti punya fasum), kondisi GOOD, DAMAGED,
  UNDER_REPAIR. Filter daftar. Detail asset menampilkan riwayat tiket dan biaya.
- Jadwal perawatan: tanpa pembuatan tiket otomatis. Jadwal jatuh tempo dalam 7 hari atau lewat
  ditandai di daftar jadwal; tombol "Kerjakan sekarang" membuat tiket SCHEDULED. Saat tiket
  selesai dan biaya terisi, next_due_date maju sebesar interval.
- Tiket ACCIDENTAL: minimal satu foto BEFORE saat dibuat. Status OPEN, IN_PROGRESS, DONE, atau
  CANCELLED dengan alasan. DONE hanya jika ada minimal satu foto AFTER dan biaya terisi (boleh 0).
  Foto sebelum dan sesudah tampil berdampingan. Kolom dilaporkan oleh.
- Kondisi asset mengikuti tiket (FR-AST-04). Jika makes_room_unusable dan kamar tanpa tenant aktif,
  kamar menjadi BROKEN lalu kembali AVAILABLE saat tiket DONE (FR-ROOM-05).
- Biaya tiket DONE dihitung sebagai pengeluaran di laporan tanpa membuat baris di tabel expenses
  (FR-MNT-10, FR-EXP-06). Sediakan satu fungsi query di MaintenanceService yang kelak dipakai
  ReportService di M7.
- Detail kamar menampilkan asset dan tiket kamar itu (bagian dari FR-ROOM-07).
- Foto lewat /api/upload (beberapa foto per tiket) dan /api/files. Semua perubahan status masuk
  audit.
- Seed: asset, jadwal (ada yang jatuh tempo), dan tiket dalam berbagai status.

Tes wajib: tiket tidak bisa DONE tanpa foto AFTER atau tanpa biaya, kondisi asset mengikuti tiket,
interval jadwal maju, status kamar BROKEN dan kembali, fasum tersembunyi bila properti tanpa
fasum, isolasi antar organisasi dan akses per properti.

Di akhir: jalankan yarn lint, yarn typecheck, dan yarn test. Periksa kriteria "Selesai jika" M5
(PRD bagian 12) satu per satu dan laporkan lolos atau tidak beserta buktinya. Catat kekurangan PRD
atau spec di laporan, jangan mengubah dokumennya. Perbarui baris Status di AGENTS.md. Commit per
langkah.
```

---

## M6 — Pengeluaran

```
Baca CLAUDE.md, docs/PRD.md (bagian 6.2 untuk expenses dan expense_categories, 6.4, 7.11,
Lampiran B), docs/TECH-SPEC.md bagian 12 (baris M6), dan docs/design.md. Kerjakan Milestone M6
saja.

Mulai dengan rencana singkat dan tunggu persetujuan saya.

Lingkup:
- Tabel expense_categories dan expenses. Kategori bawaan (PRD 6.4) dibuat per organisasi saat
  organisasi dibuat, termasuk lewat skrip create-owner dan seed. Kategori baru bisa ditambah;
  kategori bawaan tidak bisa dihapus.
- Pengeluaran: properti, kategori, tanggal, nominal, deskripsi, foto nota opsional. Ubah dan hapus
  (soft delete) masuk audit.
- Daftar: filter bulan, properti, kategori, dengan total sesuai filter.
- Kolom meter_id dan electricity_type sudah ada. Kewajiban memilih meteran untuk kategori Listrik
  diaktifkan di M4; sampai saat itu kategori Listrik boleh disimpan tanpa meteran.
- Biaya tiket maintenance tidak dicatat di sini (FR-EXP-06).
- Seed: pengeluaran beberapa kategori dan bulan.

Tes wajib: kategori bawaan tidak bisa dihapus, soft delete, audit tercatat, total sesuai filter,
isolasi antar organisasi dan akses per properti.

Di akhir: jalankan yarn lint, yarn typecheck, dan yarn test. Periksa kriteria "Selesai jika" M6
(PRD bagian 12) satu per satu dan laporkan lolos atau tidak beserta buktinya. Catat kekurangan PRD
atau spec di laporan, jangan mengubah dokumennya. Perbarui baris Status di AGENTS.md. Commit per
langkah.
```

---

## M4 — Listrik

Kerjakan setelah M6. Idealnya setelah pola listrik A sampai E divalidasi dengan 3 sampai 5 pemilik kost.

```
Baca CLAUDE.md, docs/PRD.md (bagian 5 khususnya BR-07, 15, 16, 17; 6.2 untuk meters dan
meter_readings; 7.2 untuk FR-PRO-04 dan 05; 7.8 lengkap; 7.3 untuk FR-ROOM-01 dan 07; 7.11 untuk
FR-EXP-03; Lampiran C), docs/TECH-SPEC.md bagian 12 (baris M4), dan docs/design.md. Kerjakan
Milestone M4 saja.

Mulai dengan rencana singkat dan tunggu persetujuan saya. Jika ada pola listrik di Lampiran C yang
menurutmu tidak jelas atau bertentangan, tanyakan sebelum membangun.

Lingkup:
- Daftar meteran (FR-ELC-01 sampai 03): jenis ROOM, SHARED, FASUM; sistem PREPAID_TOKEN atau
  POSTPAID; FASUM hanya jika properti punya fasum; satu kamar paling banyak satu meteran; meteran
  yang punya riwayat dinonaktifkan, bukan dihapus. Pilihan meteran di form kamar.
- Pencatatan angka per meteran per periode (FR-ELC-04 sampai 06): angka sebelumnya otomatis, tolak
  angka lebih kecil kecuali ditandai meteran diganti atau direset, foto meteran opsional.
- Tagihan listrik ke tenant TENANT_BILLED (FR-ELC-10 sampai 12): PER_KWH hanya untuk meteran ROOM,
  FLAT satu-satunya untuk meteran SHARED. Saat angka disimpan dan tagihan periode itu masih UNPAID,
  baris ELECTRICITY ditambah atau diperbarui; jika sudah PAID, tampilkan peringatan dan jangan
  ubah.
- TENANT_DIRECT tidak dicatat sama sekali (aturan 13 AGENTS.md, FR-ELC-09).
- Biaya ke PLN (FR-ELC-07 dan 08): form catat token atau tagihan PLN per meteran membuat
  pengeluaran kategori Listrik dengan meter_id. Aktifkan kewajiban meteran pada pengeluaran Listrik
  (FR-EXP-03) dan beri label per jenis meteran.
- Menu Listrik tampil jika minimal satu properti yang dapat diakses mengaktifkan listrik dikelola aplikasi (BR-16). Halaman Listrik hanya memuat properti yang mengaktifkannya.
  Ringkasan per meteran dan per label (FR-ELC-13). Riwayat meteran di detail kamar.
- Pola A sampai E di Lampiran C mengisi nilai awal saat properti dibuat.
- Seed: properti contoh untuk tiap pola A sampai E.

Tes wajib: rumus per kWh dan flat, SHARED hanya flat, angka lebih kecil ditolak kecuali reset,
baris ELECTRICITY diperbarui pada tagihan UNPAID dan memberi peringatan pada PAID, TENANT_DIRECT
tidak menghasilkan catatan apa pun, menu Listrik tersembunyi bila tidak dikelola, pengeluaran
Listrik wajib meteran, isolasi antar organisasi.

Di akhir: jalankan yarn lint, yarn typecheck, dan yarn test. Periksa kriteria "Selesai jika" M4
(PRD bagian 12) satu per satu dan laporkan lolos atau tidak beserta buktinya. Catat kekurangan PRD
atau spec di laporan, jangan mengubah dokumennya. Perbarui baris Status di AGENTS.md. Commit per
langkah.
```

---

## M7 — Dashboard, laporan, ekspor

```
Baca CLAUDE.md, docs/PRD.md (bagian 7.12 lengkap, 9.6, 10.1, 5 khususnya BR-10 dan BR-12),
docs/TECH-SPEC.md (bagian 7.4, 12 baris M7), dan docs/design.md. Kerjakan Milestone M7 saja.

Mulai dengan rencana singkat dan tunggu persetujuan saya.

Lingkup:
- Satu ReportService yang dipakai dashboard, halaman laporan, dan ekspor, supaya angkanya sama.
- Dashboard (widget di PRD 7.12): pembayaran bulan ini, status kamar, jatuh tempo dekat,
  tunggakan, maintenance (termasuk jadwal rutin jatuh tempo dalam 7 hari), pengeluaran bulan ini.
  Owner bisa "Semua properti". Panggil InvoiceService.generateDue saat Dashboard dibuka (lihat M3).
- Laporan bulanan FR-REP-01 sampai 07: bagian Kamar, Penghuni dan pembayaran, Pemasukan,
  Pengeluaran, Maintenance, dengan aturan hitung di PRD (pemasukan berdasarkan due_date;
  pengeluaran = expenses ditambah tiket DONE berdasarkan completed_at, memakai fungsi query dari
  M5). Tampilan gabungan menampilkan total dan rincian per properti.
- Ekspor FR-REP-08: Excel dengan exceljs, satu sheet per bagian; PDF dengan @react-pdf/renderer,
  font Inter. NIK tidak ikut di ekspor. Lewat /api/export/{jenis} sebagai adapter tipis.
- FR-REP-09 (laba rugi sederhana dan tingkat hunian) sebagai bagian opsional di bawah ringkasan.
- Grafik mengikuti docs/design.md.
- Seed tambahan agar laporan terisi beberapa bulan.

Tes wajib: angka dashboard sama dengan angka laporan dan ekspor, dan sama dengan hitungan manual
dari data seed; NIK tidak ada di ekspor; VOID tidak dihitung; akses pengelola hanya untuk properti
yang ditugaskan; isolasi antar organisasi; daftar dan laporan untuk properti 300 kamar tetap di
bawah 2 detik.

Di akhir: jalankan yarn lint, yarn typecheck, dan yarn test. Periksa kriteria "Selesai jika" M7
(PRD bagian 12) satu per satu dan laporkan lolos atau tidak beserta buktinya. Catat kekurangan PRD
atau spec di laporan, jangan mengubah dokumennya. Perbarui baris Status di AGENTS.md. Commit per
langkah.
```

---

## M8 — Audit log, pengaturan, perapian, siap rilis

```
Baca CLAUDE.md, docs/PRD.md (bagian 7.13, 8, 10, 12), docs/TECH-SPEC.md (bagian 4, 11, 12 baris
M8), dan docs/design.md. Kerjakan Milestone M8 saja.

Mulai dengan rencana singkat dan tunggu persetujuan saya.

Lingkup:
- Halaman Audit Log khusus owner (FR-AUD-05 sampai 07): filter properti, pengguna, jenis entitas,
  rentang tanggal; kalimat "bahasa manusia" dibentuk di frontend; entri VIEW_SENSITIVE tampil.
- Halaman Pengaturan terpusat: pengaturan properti, kategori pengeluaran, template WhatsApp.
- PWA: manifest dan ikon agar bisa dipasang ke layar utama. Tanpa service worker offline.
- Perapian: keadaan kosong, memuat (skeleton), penanganan galat (semua kode galat backend punya
  teks Indonesia di lib/errors.ts), aksesibilitas, tampilan HP.
- Uji audit: tes yang memastikan setiap mutasi di daftar FR-AUD-01 menulis audit log.
- Uji E2E Playwright untuk alur kritis: login, buat tenant, tagihan lunas, tenant keluar, unggah
  foto kerusakan sebelum dan sesudah, ekspor laporan.
- Pastikan ada tes untuk setiap BR-01 sampai BR-18; laporkan tabel BR dan lokasi tesnya.
- Siap rilis: Dockerfile produksi, docker/compose.prod.yml, Caddyfile, scripts/backup.sh dan
  restore.sh, endpoint /api/health, dan catatan langkah deploy ke VPS di README. Uji pemulihan
  cadangan ke database kosong.

Di akhir: jalankan yarn lint, yarn typecheck, yarn test, dan yarn test:e2e. Periksa seluruh
kriteria diterima di PRD bagian 7 dan laporkan lolos atau tidak. Catat kekurangan PRD atau spec di
laporan, jangan mengubah dokumennya. Perbarui baris Status di AGENTS.md. Commit per langkah.
```

---

## Jika Claude Code menyimpang

- **Mengerjakan di luar lingkup milestone**: _"Berhenti. Kembali ke lingkup M{n} di PRD bagian 12. Batalkan perubahan di luar lingkup dan lanjutkan hanya yang ada di rencana."_
- **Melanggar batas frontend/backend atau melewati lapisan**: _"Ini melanggar aturan di AGENTS.md (batas frontend/backend atau tugas lapisan). Perbaiki sesuai TECH-SPEC bagian 2 sebelum lanjut."_
- **Ragu atau mengarang aturan bisnis**: _"Jangan menebak. Kalau PRD tidak menjelaskan, pakai default di PRD bagian 13, atau tanyakan saya."_
