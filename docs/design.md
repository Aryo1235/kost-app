# Panduan Desain

**Versi:** 0.1 · **Tanggal:** 6 November 2026
**Berlaku untuk:** seluruh aplikasi (login, area berlogin, ekspor PDF bila relevan)
**Dibaca bersama:** `docs/AGENTS.md`, `docs/prd-aplikasi-kost.md` (bagian 1, 2, 7, 8, 9), `docs/TECH-SPEC.md` (bagian 6)

Dokumen ini satu-satunya sumber warna, huruf, jarak, dan pola komponen. Agen pengodean **tidak memilih warna atau gaya sendiri**. Bila butuh sesuatu yang tidak ada di sini, tanyakan dulu lalu tambahkan ke dokumen ini.

Parameter gaya: `DESIGN_VARIANCE 3` (tata letak lurus dan dapat ditebak), `MOTION_INTENSITY 2` (hanya transisi halus), `VISUAL_DENSITY 6` (padat tetapi lega). Panduan ini mengikuti disiplin skill `design-taste-frontend` (satu sistem, tanpa dekorasi, hover halus), tanpa bagian landing page.

---

## 1. Prinsip Desain dan Larangan

### 1.1 Tiga prinsip

1. **Tenang.** Satu aksen (navy), satu tombol aksen per layar, tanpa bayangan, tanpa gradasi. Pemisah dibuat dengan garis 1px dan jarak, bukan kotak berlapis.
2. **Padat tetapi lega.** Angka dan tabel rapat (baris 44px, huruf 14px) namun diberi napas lewat jarak kelipatan 4px dan kolom yang rata. Tidak ada ruang kosong dekoratif.
3. **Status selalu terbaca tanpa warna.** Setiap status punya teks Indonesia dan ikon kecil. Warna hanya penegas. Pengelola bekerja di luar ruangan dengan layar terang dan kadang melihat dengan satu tangan.

### 1.2 Aturan keras

| Aturan | Isi |
| --- | --- |
| Satu tombol aksen | Maksimal satu tombol `primary` (navy) terlihat per layar. Di dalam dialog atau sheet, tombol utama dialog yang berlaku. |
| Warna status hanya untuk status | Hijau, kuning, merah dipakai khusus untuk `StatusBadge`, teks status, dan indikator galat/berhasil. Tidak untuk dekorasi, judul, ikon menu, atau grafik biasa. |
| Tanpa bayangan | `box-shadow: none` di semua komponen (timpa bawaan shadcn `shadow-xs` dan `shadow-sm`). Lapisan dibedakan oleh garis 1px dan scrim. |
| Radius | 8px untuk komponen (tombol, kolom isian, kartu). 6px untuk lencana. 12px hanya untuk dialog dan sheet. Tidak ada bentuk pil penuh. |
| Hanya mode terang | `color-scheme: light`. Tidak ada `prefers-color-scheme: dark` dan tidak ada sakelar tema (Tech Spec bagian 1). |
| Teks pengguna dalam bahasa Indonesia | Semua lewat `lib/labels.ts`, `lib/errors.ts`, `lib/format.ts` (AGENTS aturan batas nomor 5). |

### 1.3 Dilarang

- Bayangan, gradasi, kaca buram (blur), glow, tekstur, ilustrasi dekoratif, emoji di antarmuka.
- Ikon di dalam lingkaran atau kotak berwarna. Ikon berdiri sendiri, garis 1,5px, ukuran 16 atau 20px (`lucide-react`, bawaan shadcn).
- Lencana status berbentuk pil, huruf kapital semua, atau hanya berupa titik warna tanpa teks.
- Dua tombol aksen pada satu layar. Dua tombol yang tampak sama pentingnya.
- Garis belang-belang (zebra) pada tabel. Pakai garis pemisah dan hover.
- Kartu di dalam kartu lebih dari dua tingkat.
- Dialog untuk form panjang (lebih dari 4 kolom). Pakai halaman penuh.
- Tabel yang menggulir ke samping di HP. Di HP tabel menjadi daftar kartu.
- Informasi yang hanya muncul lewat hover atau tooltip (HP tidak punya hover).
- Placeholder sebagai pengganti label.
- `window.confirm`, `alert`, atau `prompt` bawaan peramban.
- Tombol nonaktif tanpa alasan terlihat. Bila dinonaktifkan, tulis sebabnya di dekatnya.
- Memotong nominal atau angka dengan elipsis. Teks panjang boleh dipotong, angka tidak.
- Singkatan "jt" atau "rb" di tabel dan kartu. Singkatan hanya boleh di sumbu grafik.
- Animasi yang dipicu gulir (parallax, fade-in saat muncul), hitung naik angka, kedipan acak, karusel, tab berputar otomatis.
- Mengandalkan menu tersembunyi sebagai pengamanan (AGENTS aturan keras nomor 2). Menu tetap disembunyikan sesuai peran dan BR-16, tetapi izin ditegakkan di backend.

---

## 2. Token Warna

Semua warna didefinisikan sebagai variabel CSS di `app/globals.css`. Nama mengikuti shadcn/ui supaya komponen bawaan langsung memakainya. Komponen **tidak** menulis kode warna heksa langsung.

### 2.1 Token

| Variabel | Nilai | Dipakai untuk |
| --- | --- | --- |
| `--background` | `#FAFAF9` | Latar halaman |
| `--foreground` | `#1C1917` | Teks utama |
| `--card` | `#FFFFFF` | Permukaan: kartu, tabel, panel, kolom isian |
| `--card-foreground` | `#1C1917` | Teks di atas `--card` |
| `--popover` | `#FFFFFF` | Menu, popover, dialog, sheet |
| `--popover-foreground` | `#1C1917` | Teks di atas `--popover` |
| `--primary` | `#1E3A5F` | Aksen tunggal: tombol utama, tautan, tab aktif, ceklis, seri grafik utama |
| `--primary-foreground` | `#FFFFFF` | Teks di atas `--primary` |
| `--primary-hover` | `#16304F` | Tombol utama saat hover dan ditekan (token tambahan) |
| `--secondary` | `#F5F5F4` | Isian halus (mis. tombol sekunder berisi, jarang dipakai) |
| `--secondary-foreground` | `#1C1917` | Teks di atas `--secondary` |
| `--muted` | `#F5F5F4` | Header tabel, hover baris, skeleton, lencana netral |
| `--muted-foreground` | `#6B645E` | Teks redup: label, keterangan, placeholder, metadata |
| `--accent` | `#E8EEF5` | Aksen lembut: menu terpilih, hover item menu, lencana "info" |
| `--accent-foreground` | `#1E3A5F` | Teks di atas `--accent` |
| `--border` | `#E7E5E4` | Garis dekoratif: pemisah, tepi kartu, tepi tabel |
| `--input` | `#8A837D` | Garis kolom isian, kotak centang, sakelar (usulan perubahan, lihat 2.3) |
| `--ring` | `#1E3A5F` | Cincin fokus |
| `--destructive` | `#A12D22` | Alias `--danger` untuk tombol berbahaya (komponen shadcn) |
| `--destructive-foreground` | `#FFFFFF` | Teks di atas `--destructive` |
| `--success` | `#1F6B3A` | Teks/ikon status baik (Lunas, Baik, Selesai) |
| `--success-soft` | `#E8F3EC` | Latar lencana baik |
| `--warning` | `#8A5A00` | Teks/ikon status menunggu (Belum bayar, Dikerjakan) |
| `--warning-soft` | `#FBF1DC` | Latar lencana menunggu |
| `--danger` | `#A12D22` | Teks/ikon status buruk (Terlambat, Rusak), teks galat |
| `--danger-soft` | `#FBE7E4` | Latar lencana buruk, kotak galat |
| `--chart-1` | `#1E3A5F` | Seri grafik 1 |
| `--chart-2` | `#78716C` | Seri grafik 2 (abu hangat) |
| `--chart-3` | `#5B7BA3` | Seri grafik 3 (navy muda) |
| `--chart-grid` | `#E7E5E4` | Garis kisi grafik |
| `--radius` | `0.5rem` (8px) | Radius dasar |
| `--sidebar` | `#FFFFFF` | Latar sidebar |
| `--sidebar-foreground` | `#1C1917` | Teks sidebar |
| `--sidebar-accent` | `#E8EEF5` | Item sidebar terpilih |
| `--sidebar-accent-foreground` | `#1E3A5F` | Teks item terpilih |
| `--sidebar-border` | `#E7E5E4` | Garis sidebar |
| `--sidebar-ring` | `#1E3A5F` | Fokus di sidebar |

Hanya tiga seri grafik yang diizinkan (semuanya ≥3:1 terhadap putih). Untuk data lebih dari tiga kategori, pakai satu warna `--chart-1` dengan label langsung dan urutan nilai (lihat 6.14).

### 2.2 Rasio kontras (WCAG 2.2 AA)

Dihitung dengan rumus luminansi relatif WCAG. Batas: teks biasa ≥4,5:1, teks besar (≥24px atau ≥19px tebal) ≥3:1, komponen antarmuka dan grafik ≥3:1.

| Pasangan | Rasio | Hasil |
| --- | --- | --- |
| `--foreground` #1C1917 di `--background` #FAFAF9 | 16,74:1 | Lolos AAA |
| `--foreground` di `--card` #FFFFFF | 17,49:1 | Lolos AAA |
| `--muted-foreground` #6B645E di `--background` | 5,57:1 | Lolos AA |
| `--muted-foreground` di `--card` | 5,82:1 | Lolos AA |
| `--muted-foreground` di `--muted` #F5F5F4 | 5,33:1 | Lolos AA |
| `--muted-foreground` di `--accent` #E8EEF5 | 4,98:1 | Lolos AA |
| `--primary-foreground` #FFFFFF di `--primary` #1E3A5F | 11,50:1 | Lolos AAA |
| `--primary-foreground` di `--primary-hover` #16304F | 13,38:1 | Lolos AAA |
| `--primary` di `--background` (tautan) | 11,01:1 | Lolos AAA |
| `--accent-foreground` #1E3A5F di `--accent` #E8EEF5 | 9,85:1 | Lolos AAA |
| `--success` #1F6B3A di `--success-soft` #E8F3EC | 5,73:1 | Lolos AA |
| `--success` di `--card` | 6,52:1 | Lolos AA |
| `--warning` #8A5A00 di `--warning-soft` #FBF1DC | 5,28:1 | Lolos AA |
| `--warning` di `--card` | 5,93:1 | Lolos AA |
| `--danger` #A12D22 di `--danger-soft` #FBE7E4 | 6,06:1 | Lolos AA |
| `--danger` di `--card` | 7,21:1 | Lolos AA |
| `--destructive-foreground` #FFFFFF di `--destructive` #A12D22 | 7,21:1 | Lolos AA |
| `--input` #8A837D di `--card` (garis kolom isian) | 3,73:1 | Lolos 3:1 (komponen) |
| `--input` di `--background` | 3,58:1 | Lolos 3:1 (komponen) |
| `--ring` #1E3A5F di `--card` | 11,50:1 | Lolos 3:1 |
| `--chart-1` #1E3A5F di `--card` | 11,50:1 | Lolos 3:1 |
| `--chart-2` #78716C di `--card` | 4,80:1 | Lolos 3:1 |
| `--chart-3` #5B7BA3 di `--card` | 4,37:1 | Lolos 3:1 |
| `--border` #E7E5E4 di `--background` | 1,20:1 | **Tidak** untuk komponen interaktif. Hanya pemisah dekoratif |

### 2.3 Perubahan yang diusulkan dari titik awal

| Perubahan | Alasan |
| --- | --- |
| Tambah `--input` #8A837D | Garis kolom isian #E7E5E4 hanya 1,2:1, tidak memenuhi WCAG 1.4.11 (kontras komponen non-teks ≥3:1). Garis #E7E5E4 tetap untuk pemisah dekoratif. |
| Tambah `--primary-hover` #16304F | Tombol utama perlu tingkat hover yang jelas tanpa bayangan atau perubahan ukuran. |
| Tambah `--chart-2` #78716C dan `--chart-3` #5B7BA3 | Warna #A8A29E (abu terang) hanya 2,5:1, tidak lolos untuk grafik. Dua warna ini lolos ≥3:1. |
| Placeholder memakai `--muted-foreground` | Garis `--input` (3,73:1) tidak cukup untuk teks. Placeholder wajib ≥4,5:1. |
| Teks status boleh dipasang di `--card`, `--background`, `--muted`, atau latar lembutnya sendiri | Sudah dihitung: di `--background` sukses 6,24:1, menunggu 5,67:1, bahaya 6,90:1. Di `--muted` sukses 5,97:1, menunggu 5,43:1, bahaya 6,61:1. Semua lolos AA. |

Semua warna titik awal lainnya dipakai apa adanya.

---

## 3. Tipografi

### 3.1 Huruf

- **Inter** lewat `next/font/google`, variabel `--font-sans`, subset `latin`, `display: swap`. Dipilih karena sama dengan huruf PDF laporan (Tech Spec 7.4), sehingga layar dan cetak seragam. Alternatif Geist (sudah ada di scaffold) menjadi salah satu keputusan di akhir dokumen.
- Tidak ada huruf kedua. Tidak ada huruf monospace kecuali untuk kata sandi sementara dan plat nomor bila perlu (`font-mono` bawaan sistem).
- `html lang="id"`. Hapus `Arial, Helvetica` dari `body` di scaffold.

### 3.2 Angka tabular

- Semua rupiah, kWh, tanggal dalam tabel, kolom jumlah, dan kartu angka memakai `font-variant-numeric: tabular-nums` (kelas Tailwind `tabular-nums`). Dibungkus kelas `.num` di `globals.css` agar tidak lupa.
- Kolom angka **rata kanan** di tabel desktop. Nominal tidak boleh terpotong.

### 3.3 Skala ukuran

| Peran | HP (<768px) | Desktop (≥768px) | Bobot | Contoh |
| --- | --- | --- | --- | --- |
| Angka besar (kartu dashboard) | 24/32 | 28/36 | 600 | `Rp 24.500.000` |
| Judul halaman (h1) | 20/28 | 24/32 | 600 | Tagihan |
| Judul bagian (h2) | 16/24 | 16/24 | 600 | Tunggakan |
| Isi teks | 16/24 | 14/20 | 400 | Catatan tenant |
| Isi tabel dan daftar | 15/22 | 14/20 | 400 | Nama, kamar |
| Label kolom isian | 14/20 | 14/20 | 500 | Nama lengkap |
| Keterangan, bantuan, metadata | 13/18 | 13/18 | 400 | Jatuh tempo 5 Nov 2026 |
| Lencana status | 13/16 | 13/16 | 500 | Lunas |
| Teks terkecil (kaki tabel, sumbu grafik) | 12/16 | 12/16 | 400 | |

- Minimum 12px. Isian di HP selalu 16px agar iOS tidak memperbesar halaman.
- Hanya bobot 400, 500, 600. Tidak ada 700 atau lebih.
- `letter-spacing: -0.01em` hanya untuk ≥20px. Selain itu normal. Tidak ada huruf kapital semua dan tidak ada garis bawah selain tautan.
- Panjang baris isi teks maksimal 72 karakter (`max-w-prose`).

---

## 4. Spasi, Radius, Garis, Tinggi Elemen

### 4.1 Spasi

Skala (px): **4, 8, 12, 16, 20, 24, 32, 48**. Kelas Tailwind `1, 2, 3, 4, 5, 6, 8, 12`. Tidak ada nilai lain.

| Konteks | Nilai |
| --- | --- |
| Tepi halaman kiri-kanan | 16 (HP) · 24 (768–1023) · 32 (≥1024) |
| Antar bagian halaman | 24 |
| Antar kolom isian | 16 |
| Label ke kolom isian | 8 |
| Bantuan/galat di bawah kolom isian | 4 di atas teks |
| Padding kartu | 16 (HP) · 20 (≥768) |
| Padding sel tabel | 12 horizontal, vertikal mengikuti tinggi baris |
| Antar tombol sejajar | 8 (jarak sentuh minimal) |

### 4.2 Lebar konten

- Konten maksimal **1200px**, rata tengah di area di samping sidebar.
- Form satu kolom, lebar maksimal **640px**. Dua kolom hanya ≥768px dan hanya untuk pasangan pendek (tanggal + nominal).

### 4.3 Radius dan garis

| Elemen | Radius |
| --- | --- |
| Tombol, kolom isian, kartu, panel, menu, foto | 8px (`--radius`) |
| Lencana status, chip | 6px |
| Dialog (desktop) dan sheet (sudut atas HP) | 12px |
| Avatar/foto tenant | 8px (kotak, bukan lingkaran) |

- Garis dekoratif: 1px `--border`. Garis kolom isian: 1px `--input` (2px saat fokus lewat cincin).
- Tidak ada garis tebal 2px di luar fokus dan indikator tab aktif.

### 4.4 Tinggi elemen dan target sentuh

Target sentuh minimal **44×44px** di HP (<1024px), termasuk area transparan di sekitar elemen visual.

| Elemen | HP (<768px) | Desktop (≥768px) |
| --- | --- | --- |
| Tombol `md` (bawaan) | 44 | 40 |
| Tombol `sm` | tidak dipakai (pakai `md`) | 32 |
| Tombol utama bar bawah form | 48 penuh lebar | tidak ada (di header) |
| Tombol ikon | 44×44 | 40×40 |
| Kolom isian, select | 44 | 40 |
| Textarea | min 96 | min 96 |
| Kotak centang/sakelar (area sentuh) | 44×44 | 24×24 |
| Chip filter | visual 36, area sentuh 44 | visual 32 |
| Baris tabel | kartu min 72 | 44 |
| Header tabel | tidak ada | 40 |
| Item sidebar | item laci 48 | 36 |
| Bilah bawah | 56 + `env(safe-area-inset-bottom)` | tidak ada |
| Header HP | 56 | tidak ada (judul di dalam konten) |

Jarak antar dua target sentuh minimal 8px.

### 4.5 Titik henti

| Nama | Lebar | Perilaku |
| --- | --- | --- |
| HP | <768px | Bilah bawah + laci, daftar kartu, dialog menjadi sheet bawah |
| Tablet | 768–1023px | Bilah bawah + laci (navigasi seperti HP), **tabel** muncul, dialog tetap sheet bawah |
| Desktop | ≥1024px | Sidebar tetap 232px, tabel, dialog di tengah |

### 4.6 Gerak

- Durasi 120ms `ease-out` untuk warna latar/teks/garis saat hover dan fokus. Dialog dan popover muncul dengan fade 160ms. Sheet naik 200ms.
- Tidak ada transformasi lain kecuali tombol saat ditekan (`translateY(1px)`).
- Satu-satunya animasi berulang: denyut skeleton (opasitas 1 ke 0,6, 1,5 detik). Semua berhenti bila `prefers-reduced-motion: reduce`.

---

## 5. Kerangka Aplikasi

### 5.1 Daftar menu

Urutan dan pengelompokan sama di sidebar dan laci. Menu disembunyikan sesuai peran dan pengaturan properti (BR-16, FR-PRO-05).

| Kelompok | Menu (rute) | Tampil jika |
| --- | --- | --- |
| Ringkasan | Dashboard (`/dashboard`) | Selalu |
| Operasional | Kamar (`/kamar`), Tenant (`/tenant`), Tagihan (`/tagihan`) | Selalu |
| | Listrik (`/listrik`) | Properti mengaktifkan "listrik dikelola aplikasi" |
| | Asset (`/asset`) | Selalu (fasum hanya muncul bila properti punya fasum) |
| | Maintenance (`/maintenance`), Pengeluaran (`/pengeluaran`) | Selalu |
| Laporan | Laporan (`/laporan`) | Selalu |
| | Audit Log (`/audit-log`) | Owner saja |
| Pengaturan | Pengaturan (`/pengaturan`), Pengguna (`/pengguna`) | Pengaturan: semua (pengelola hanya lihat). Pengguna: Owner saja |
| Akun | Akun (`/akun`), Keluar | Selalu |

### 5.2 Desktop (≥1024px): sidebar

```
┌─────────────┬──────────────────────────────────────────────────────┐
│ ▣ Nama kost │                                                      │
│ [Melati   ▾]│  Tagihan                       [Buat tagihan bulan ini]│
│─────────────│  Properti Melati · November 2026                     │
│ Dashboard   │                                                      │
│             │  [Cari…] [Periode ▾] [Status ▾]        Hapus filter  │
│ Kamar       │  ──────────────────────────────────────────────────  │
│ Tenant      │  (isi halaman)                                       │
│ Tagihan  ◀  │                                                      │
│ Listrik     │                                                      │
│ …           │                                                      │
│─────────────│                                                      │
│ Budi · Owner│                                                      │
│ Akun  Keluar│                                                      │
└─────────────┴──────────────────────────────────────────────────────┘
   232px                         konten maks 1200px
```

- Sidebar **tetap 232px**, tidak bisa diciutkan (satu keadaan, lebih sedikit kasus uji). Latar `--sidebar`, garis kanan 1px.
- Atas: nama produk/logo (belum ditentukan) lalu **pemilih properti** (FR-PRO-02). Owner punya opsi "Semua properti". Bila hanya satu properti, tampil sebagai teks tanpa panah.
- Item menu: tinggi 36, ikon 16 + teks 14. Item terpilih: latar `--sidebar-accent`, teks `--sidebar-accent-foreground`, bobot 500. Hover: latar `--muted`.
- Bawah: nama pengguna + peran, tautan Akun dan Keluar.
- Tidak ada bilah atas. Judul halaman ada di dalam konten.

### 5.3 HP dan tablet (<1024px): bilah bawah + laci

```
┌───────────────────────────────┐
│ [Melati ▾]            [ + ]   │  header 56px: pemilih properti, aksi halaman
├───────────────────────────────┤
│                               │
│  (isi halaman)                │
│                               │
├───────────────────────────────┤
│ Beranda Tagihan Tenant Lainnya│  bilah bawah 56px + safe area
└───────────────────────────────┘
```

- **Empat slot:** Beranda (Dashboard), Tagihan, Tenant, Lainnya. Slot aktif: ikon dan teks `--primary`, latar `--accent`. Teks 12px di bawah ikon 20px.
- **Lainnya** membuka laci dari bawah (sheet) berisi seluruh menu lain (Kamar, Listrik, Asset, Maintenance, Pengeluaran, Laporan, Audit Log, Pengaturan, Akun, Keluar) dengan item 48px bergrup.
- Pekerjaan lapangan yang paling sering (catat meteran, lapor kerusakan, tambah tenant) ada di **Aksi cepat** pada Beranda (lihat 7.1), bukan di bilah bawah.
- Bilah bawah **disembunyikan** di halaman form penuh (mis. tambah tenant, tiket baru). Gantinya, bar tindakan melekat di bawah (lihat 6.1).
- Header: pada halaman daftar, kiri = pemilih properti, kanan = satu aksi utama. Pada halaman detail/form, kiri = tombol kembali (44×44) + judul, kanan = menu "⋯".
- Pemilih properti di HP membuka sheet bawah dengan daftar pilihan (radio).

### 5.4 Pola header halaman

Desktop:
```
Judul halaman (h1 24/32)                       [Sekunder] [Sekunder] [Utama]
Keterangan satu baris (14, redup)
```
- Maksimal **satu** tombol utama + dua tombol sekunder + menu "⋯" untuk sisanya. Aksi berbahaya selalu di "⋯", tidak pernah sejajar dengan tombol utama.
- Halaman detail memakai jejak: `Tenant / Budi Santoso` (13px, redup, tautan) di atas judul.

HP: judul 20/28 di baris pertama konten (bukan di header), keterangan di bawahnya, aksi utama di header sebagai tombol teks ringkas ("+ Tambah").

### 5.5 Bar filter

Desktop (di bawah header halaman, sebelum tabel):
```
[🔍 Cari kamar atau nama…        ] [Periode: Nov 2026 ▾] [Status: Semua ▾]   Hapus filter
```
- Kolom cari 280px, filter berupa select 40px, "Hapus filter" tautan teks muncul hanya jika ada filter aktif.
- Semua nilai filter disimpan di **URL** (Tech Spec 6.3). Properti aktif di cookie.

HP:
```
[🔍 Cari…                          ] [Filter (2)]
( Semua )( Belum bayar )( Terlambat )( Lunas )  → bisa digeser
```
- Baris pertama: kolom cari + tombol "Filter" (sekunder, angka jumlah filter aktif). Membuka sheet bawah berisi seluruh filter, dengan tombol "Terapkan" (utama) dan "Atur ulang" (tautan).
- Baris kedua: chip status untuk filter paling sering (satu pilihan). Chip terpilih: latar `--accent`, teks `--accent-foreground`, garis `--primary`.
- Angka ringkasan dan total di atas daftar (mis. "Total Rp 24.500.000 · 18 lunas · 4 belum · 2 terlambat") boleh ditekan sebagai pintasan filter.

---

## 6. Spesifikasi Komponen

Komponen dasar dari shadcn di `components/ui`. Komponen gabungan di `components/shared`. Nama berkas mengikuti Tech Spec 8.

### 6.1 Button

| Varian | Tampilan | Pemakaian |
| --- | --- | --- |
| `primary` | Latar `--primary`, teks `--primary-foreground`. Hover `--primary-hover`. | **Satu per layar.** Simpan, Tambah, Buat tagihan |
| `outline` (sekunder) | Latar `--card`, garis 1px `--input`, teks `--foreground`. Hover latar `--muted`. | Aksi kedua: Batal, Ekspor, Filter, Tandai lunas di baris tabel |
| `ghost` | Tanpa garis dan latar. Hover `--muted`. | Aksi ringan di toolbar, ikon |
| `destructive` | Latar `--destructive`, teks putih. | Hanya di dalam dialog konfirmasi (6.9) |
| `destructive-outline` | Garis 1px `--danger`, teks `--danger`, latar `--card`. | Item aksi berbahaya di menu "⋯" dan halaman detail |
| `link` | Teks `--primary`, garis bawah saat hover. | Tautan di dalam kalimat |

- Label: **kata kerja + objek**, maksimal tiga kata ("Tandai lunas", "Simpan tenant", "Buat tagihan"). Tanpa titik, tanpa huruf kapital semua.
- Status: `hover` (latar bergeser), `active` (`translateY(1px)`), `focus-visible` (cincin 2px `--ring` offset 2px), `disabled` (opasitas 50%, kursor `not-allowed`, sebab ditulis di dekatnya), `loading` (spinner 16px menggantikan ikon, label menjadi "Menyimpan…", tombol nonaktif dan lebar tetap).
- HP: tinggi 44. Di bar tindakan bawah form: tombol utama 48 penuh lebar.
- Ikon opsional di kiri (16px, jarak 8). Tombol ikon wajib `aria-label`.

### 6.2 Input

- Struktur: label (14/500) di atas, kolom isian, bantuan (13 redup) atau galat (13 `--danger`) di bawah. Label selalu terlihat.
- Kolom isian: tinggi 44/40, padding horizontal 12, garis 1px `--input`, radius 8, latar `--card`, teks 16 (HP) / 14 (desktop). Placeholder `--muted-foreground`.
- Fokus: garis menjadi `--primary` dan cincin 2px `--ring` offset 0. Galat: garis `--danger`, ikon 16 dan teks galat di bawah, `aria-invalid="true"`, `aria-describedby` ke pesan.
- Wajib tidak ditandai bintang. Kolom yang **tidak wajib** diberi akhiran "(opsional)" di labelnya.
- Atribut: `autocomplete` benar (`username`, `current-password`, `new-password`, `tel`), `inputmode="numeric"` untuk NIK, `inputmode="tel"` untuk telepon. NIK `maxlength=16`.
- Tombol "Tampilkan/Sembunyikan" kata sandi di dalam kolom (ikon 20, area sentuh 44).
- Textarea: sama, tinggi minimum 96, bisa diubah ukurannya secara vertikal di desktop.
- Kotak centang/radio/sakelar: garis `--input`, terpilih `--primary`. Label di kanan dan ikut area sentuh.

### 6.3 Select

- ≤7 pilihan tetap: **`<select>` native** bergaya sama dengan Input (panah ikon 16 di kanan). Di HP ini memberi pemilih bawaan OS yang paling cepat dipakai.
- Daftar panjang atau perlu cari (kamar, tenant, asset, properti): **combobox** dengan kolom cari. Desktop = popover di bawah kolom (maks tinggi 320). HP = sheet bawah dengan kolom cari di atas dan item 48px.
- Opsi menampilkan teks utama dan keterangan redup di kanan (mis. "A-03 · Terisi"). Pilihan kosong: "Pilih kamar".
- Kamar yang tidak bisa dipilih (mis. tidak `AVAILABLE`) tampil nonaktif dengan sebabnya ("Sudah terisi").

### 6.4 MoneyInput (`components/shared/MoneyInput.tsx`)

- Kolom Input dengan awalan statis "Rp" di kiri (teks redup, di dalam kolom). `inputmode="numeric"`.
- Tampilan memakai pemisah titik saat mengetik (`1250000` menjadi `1.250.000`). Nilai yang disimpan ke form adalah **bilangan bulat rupiah** (BR-12), tidak pernah desimal atau negatif.
- Menempel `Rp 1.250.000` atau `1250000` dibersihkan otomatis. Karakter selain angka diabaikan.
- Teks kolom `tabular-nums`, rata kiri setelah awalan. Pada ringkasan baca-saja, nominal rata kanan.
- Galat contoh: "Nominal harus lebih dari 0." Bantuan opsional: "Tanpa desimal."
- Tombol bantuan "Samakan dengan total tagihan" tidak ada. Nilai bawaan diisi sistem (FR-PAY-01).

### 6.5 PhotoInput (`components/shared/PhotoInput.tsx`)

Tech Spec 6.2: kamera lewat atribut `capture`, kompres sisi terpanjang ±1600px, maksimum 10MB, JPG/PNG/WebP.

Kosong (HP):
```
┌──────────────────────────────┐
│            ▢ (kamera 24)     │
│   Foto kondisi rusak         │
│  [ Ambil foto ]  [ Galeri ]  │
└──────────────────────────────┘
```
- Kotak 4:3, tinggi minimum 160, garis 1px `--input`, radius 8, latar `--card`. Isi rata tengah: ikon 24 redup, label, dua tombol `outline` 44px: **Ambil foto** (`capture="environment"`; untuk foto tenant `capture="user"`) dan **Galeri**.
- Desktop: satu tombol "Pilih foto" dan teks "atau seret foto ke sini" (zona jatuh).
- Terisi: pratinjau mengisi kotak, tombol "Ganti" dan "Hapus" (ghost, 44) di bawah. Teks nama berkas tidak ditampilkan. `alt` mendeskripsikan fungsi ("Foto kondisi rusak").
- Proses: "Memproses foto…" saat kompres. Unggah: batang tipis 2px `--primary` di dasar kotak, dan persen di teks.
- Galat: "Foto terlalu besar (maksimal 10 MB)." / "Format harus JPG, PNG, atau WebP." / "Foto gagal diunggah. Coba lagi." dengan tombol "Coba lagi".
- Mode banyak foto (tiket): kisi 2 kolom di HP, 3 di desktop, sel pertama = tombol tambah. Dikelompokkan dengan judul "Foto sebelum" dan "Foto sesudah" (BEFORE/AFTER).
- Foto dimuat lewat tautan bertanda tangan. Tampilkan skeleton sampai muncul. Ketuk foto membuka penampil layar penuh (Dialog) dengan tombol tutup 44.

### 6.6 DataTable (`components/shared/DataTable.tsx`)

Satu komponen, dua tampilan. TanStack Table, paginasi/cari/filter di server.

**Desktop dan tablet (≥768px): tabel**
- Header 40px, latar `--muted`, teks 13/500 redup, tidak huruf kapital. Judul kolom yang bisa diurutkan memakai ikon panah 12 dan `aria-sort`.
- Baris 44px, garis bawah 1px `--border`, hover latar `--muted`, seluruh baris dapat ditekan menuju detail (kecuali sel aksi). Tanpa zebra.
- Kolom angka rata kanan `tabular-nums`. Status rata kiri. Aksi di kolom terakhir (lebar tetap): tombol `outline` `sm` untuk satu aksi paling umum + menu "⋯" untuk sisanya.
- Kontainer: latar `--card`, garis 1px `--border`, radius 8, tanpa bayangan. Header lengket saat gulir.
- Kaki: "Menampilkan 1–20 dari 134" kiri; "Sebelumnya" / "Berikutnya" (outline) kanan. 20 baris per halaman.
- Teks panjang (nama, catatan) dipotong satu baris dengan elipsis dan judul lengkap di detail. Angka tidak dipotong.

**HP (<768px): daftar kartu**
```
┌────────────────────────────────────┐
│ Kamar A-03 · Budi Santoso          │  16/600
│ Jatuh tempo 5 Nov 2026             │  14 redup
│ Rp 1.250.000        ⚠ Terlambat 1 hari│  angka kiri, lencana kanan
│ [ Tandai lunas ]  [ Pengingat WA ] │  tombol 44 (hanya bila relevan)
├────────────────────────────────────┤
```
- Daftar berada dalam **satu** kontainer (`--card`, garis `--border`), setiap kartu dipisah garis 1px, bukan kotak sendiri-sendiri. Padding 16, tinggi minimum 72.
- Seluruh kartu menuju detail. Tombol aksi dalam kartu memakai `outline` 44px dan berhenti perambatan ketukan.
- Judul baris: kolom utama; baris kedua: kolom pendukung; baris ketiga: nominal di kiri dan lencana di kanan. Setiap tabel mendefinisikan pemetaan kolom ke kartu lewat `mobile: { title, subtitle, meta, badge, actions }`.
- Paginasi: "Muat lebih banyak" (outline, penuh lebar) di akhir daftar. Total di atas daftar.

**Keadaan**: memuat = skeleton (6.12), kosong = EmptyState (6.11), galat = kotak galat di dalam kontainer dengan "Coba lagi", mengambil ulang di latar = batang tipis 2px `--primary` di atas kontainer.

### 6.7 StatusBadge (`components/shared/StatusBadge.tsx`)

- Komponen menerima `kind` dan `value`, mengambil `{ label, tone, icon }` dari `lib/labels.ts`. Komponen tidak memuat string status.
- Tampilan: tinggi 24 (26 di HP), padding 0 8, radius 6, teks 13/500, ikon 12 di kiri (jarak 4), tanpa garis, tanpa huruf kapital.
- Warna per `tone`:

| Tone | Latar | Teks dan ikon | Makna |
| --- | --- | --- | --- |
| `success` | `--success-soft` | `--success` | Selesai atau baik |
| `warning` | `--warning-soft` | `--warning` | Menunggu atau sedang diproses |
| `danger` | `--danger-soft` | `--danger` | Masalah, perlu tindakan |
| `info` | `--accent` | `--accent-foreground` | Keadaan aktif atau baru, bukan baik/buruk |
| `neutral` | `--muted` | `--muted-foreground` | Tidak aktif, dibatalkan, atau atribut |

**Peta lengkap (PRD 6.3)**

| Objek | Nilai | Teks Indonesia | Tone | Ikon (lucide) |
| --- | --- | --- | --- | --- |
| Tagihan | `UNPAID` | Belum bayar | warning | `Clock` |
| Tagihan | `PAID` | Lunas | success | `CheckCircle2` |
| Tagihan | `VOID` | Dibatalkan | neutral | `Ban` |
| Tagihan (dihitung, BR-10) | `UNPAID` dan lewat jatuh tempo | Terlambat {n} hari | danger | `AlertCircle` |
| Kamar | `AVAILABLE` | Kosong | neutral | `DoorOpen` |
| Kamar | `OCCUPIED` | Terisi | info | `User` |
| Kamar | `BROKEN` | Rusak | danger | `Wrench` |
| Tenant | `ACTIVE` | Aktif | info | `User` |
| Tenant | `CHECKED_OUT` | Sudah keluar | neutral | `LogOut` |
| Asset | `GOOD` | Baik | success | `CheckCircle2` |
| Asset | `DAMAGED` | Rusak | danger | `AlertCircle` |
| Asset | `UNDER_REPAIR` | Diperbaiki | warning | `Wrench` |
| Tiket | `OPEN` | Baru | info | `CircleDot` |
| Tiket | `IN_PROGRESS` | Dikerjakan | warning | `Loader` |
| Tiket | `DONE` | Selesai | success | `CheckCircle2` |
| Tiket | `CANCELLED` | Dibatalkan | neutral | `Ban` |
| Tiket (dihitung) | `OPEN`/`IN_PROGRESS` lewat `due_date` | Terlambat | danger | `AlertCircle` |
| Jadwal (dihitung) | `next_due_date` ≤ 7 hari | Jatuh tempo {n} hari lagi | warning | `Clock` |
| Jadwal (dihitung) | `next_due_date` terlewat | Terlambat | danger | `AlertCircle` |
| Jenis tiket | `SCHEDULED` | Terjadwal | neutral | `CalendarClock` |
| Jenis tiket | `ACCIDENTAL` | Kerusakan | neutral | `AlertTriangle` |
| Penanggung listrik | `OWNER` | Ditanggung pemilik | neutral | tanpa ikon |
| Penanggung listrik | `TENANT_BILLED` | Ditagihkan ke tenant | neutral | tanpa ikon |
| Penanggung listrik | `TENANT_DIRECT` | Dibayar tenant sendiri | neutral | tanpa ikon |
| Jenis meteran | `ROOM` / `SHARED` / `FASUM` | Per kamar / Bersama / Fasum | neutral | tanpa ikon |
| Sistem PLN | `PREPAID_TOKEN` / `POSTPAID` | Token / Pascabayar | neutral | tanpa ikon |
| Meteran per periode | belum ada angka | Belum dicatat | warning | `Clock` |
| Meteran per periode | sudah ada angka | Tercatat | success | `CheckCircle2` |
| Akun | `is_active` benar / salah | Aktif / Nonaktif | info / neutral | tanpa ikon |
| Foto | `BEFORE` / `AFTER` | Sebelum / Sesudah | neutral | tanpa ikon |

Aturan tampil:
- Satu tagihan menampilkan **satu** lencana. "Terlambat {n} hari" menggantikan "Belum bayar" saat BR-10 terpenuhi.
- Atribut (penanggung listrik, jenis meteran, sistem PLN, jenis tiket) memakai tone `neutral` karena bukan status baik/buruk. Warna status tidak dipakai untuknya.
- "Terisi" dan "Aktif" bernada `info` (navy lembut), bukan hijau, agar hijau hanya berarti "selesai atau baik".

### 6.8 Dialog dan Sheet

- **Dialog (desktop)**: lebar 480 (maks 640), radius 12, latar `--popover`, garis 1px `--border`, scrim hitam 40%. Header judul 18/600 + deskripsi 14 redup; isi; kaki dengan tombol rata kanan (sekunder lalu utama).
- **Sheet bawah (HP dan tablet)**: konten yang sama, menempel di dasar, sudut atas 12, tinggi maksimum `90dvh`, bisa digulir, pegangan kecil 36×4 di atas, `padding-bottom` aman. Tombol di kaki bertumpuk penuh lebar: **utama di atas**, sekunder di bawah.
- Tombol tutup (X) 44×44 di pojok. `Esc` menutup. Fokus terkunci di dalam dan kembali ke pemicu saat ditutup. Fokus awal ke kolom pertama, atau ke "Batal" pada dialog berbahaya.
- Maksimal 4 kolom isian. Lebih dari itu, jadikan halaman. Tidak ada dialog di atas dialog.
- Contoh dialog: Tandai lunas (tanggal bayar, foto bukti opsional), Kirim pengingat (pratinjau pesan), Pemilih properti, Filter.

### 6.9 Konfirmasi aksi berbahaya

Tiga tingkat, semua memakai Dialog/Sheet di atas:

| Tingkat | Contoh | Perilaku |
| --- | --- | --- |
| Ringan (dapat dibalik) | Nonaktifkan meteran, hapus asset | Judul = pertanyaan, satu kalimat dampak, tombol `destructive-outline` bergaris verba+objek. |
| Berat (tercatat di audit) | Batalkan tagihan (VOID), batalkan pembayaran, tenant keluar, nonaktifkan pengguna, reset kata sandi | Dampak dijabarkan, **kolom alasan wajib** untuk VOID dan batalkan pembayaran, tombol `destructive` solid, fokus awal ke "Batal". |
| Diblokir | Tenant keluar dengan tagihan belum lunas (FR-OUT-02) | Bukan konfirmasi: dialog menampilkan **daftar tagihan** penghalang dengan tautan, hanya tombol "Mengerti"/"Lihat tagihan". |

Susunan dialog berat:
```
Batalkan pembayaran?
Tagihan Kamar A-03 (Nov 2026) akan kembali menjadi "Belum bayar".
Perubahan ini tercatat di Audit Log.

Alasan
[                                 ]

        [ Batal ]  [ Batalkan pembayaran ]
```
- Tombol destruktif tidak pernah berada di sisi yang sama dengan tombol utama halaman. Tombol berlabel spesifik, bukan "Ya" atau "OK".
- Reset kata sandi pengelola: setelah berhasil, tampilkan kata sandi sementara satu kali (monospace, tombol "Salin", peringatan "Kata sandi hanya tampil sekali"), dan tidak masuk toast atau log (FR-AUTH-05).
- Tidak ada konfirmasi ketik-ulang. Semua aksi dapat dipulihkan lewat soft delete atau audit.

### 6.10 Toast

- Pustaka: `sonner` (bawaan shadcn). Latar `--popover`, garis `--border`, radius 8, teks 14, ikon 16 berwarna tone di kiri. Tanpa bayangan.
- Posisi: HP = bawah tengah, di atas bilah bawah (offset 72px + area aman). Desktop = kanan bawah.
- Durasi: berhasil 4 detik, galat 8 detik dan memiliki tombol tutup. Satu baris, maksimal dua.
- Isi: kalimat lampau pendek: "Tagihan Kamar A-03 ditandai lunas." Boleh satu tautan aksi ("Lihat").
- Dipakai untuk konfirmasi hasil. **Tidak** dipakai untuk galat validasi (tampil di kolom isian), untuk keputusan, atau informasi yang harus dibaca (pakai kotak galat di halaman).
- Wilayah `aria-live`: `polite` untuk berhasil, `assertive` untuk galat.

### 6.11 EmptyState (`components/shared/EmptyState.tsx`)

- Susunan tengah: ikon 32 garis `--muted-foreground`, judul 16/600, satu kalimat penjelas 14 redup (maks 2 baris), **maksimal satu** tombol. Tanpa ilustrasi.
- Tiga varian:
  - **Belum ada data** (pertama kali): tombol berupa aksi tambah. Ini boleh `primary` bila tidak ada tombol utama lain di layar, selain itu `outline`.
  - **Hasil filter kosong**: tombol "Hapus filter" (`outline`).
  - **Tidak ada akses**: tanpa tombol, hanya penjelasan.
- Berada di dalam kontainer tabel/daftar, bukan menutupi seluruh halaman.

### 6.12 Skeleton

- Blok `--muted`, radius 8, denyut opasitas 1,5 detik. Bentuk meniru isi akhir (baris tabel, kartu, kartu angka) dan menjaga tinggi agar tidak melompat.
- Muncul bila pemuatan lebih dari 200ms. Tidak ada spinner halaman penuh. Spinner hanya di dalam tombol.
- `aria-busy="true"` pada kontainer dan teks tersembunyi "Memuat…".

### 6.13 Kartu angka dashboard (`StatCard`)

```
┌──────────────────────────┐
│ Sudah masuk              │  13 redup
│ Rp 18.750.000            │  24/28 600 tabular
│ 15 dari 19 tagihan       │  13 redup
└──────────────────────────┘
```
- Latar `--card`, garis 1px `--border`, radius 8, padding 16/20. Tanpa ikon dan tanpa panah tren (PRD tidak memuat perbandingan antarperiode).
- Warna status hanya pada teks keterangan bila merupakan status (mis. "2 terlambat" `--danger`). Angka besar selalu `--foreground`.
- Seluruh kartu adalah tautan ke daftar terfilter (mis. kartu Terlambat menuju `/tagihan?status=terlambat`). Hover latar `--muted`. Fokus: cincin.
- Kisi: 2 kolom (HP), 2 atau 4 (768–1023), 4 (≥1024). Nominal tidak disingkat, pakai penuh dengan `Rp`.

### 6.14 Gaya grafik (Recharts, komponen chart shadcn)

- Jenis yang dipakai: **batang horizontal** (pengeluaran per kategori), **batang bertumpuk tunggal** (status kamar: terisi, kosong, rusak), **garis/batang vertikal** (pemasukan vs pengeluaran per bulan bila FR-REP-09 diaktifkan). Tidak ada diagram lingkaran atau donat.
- Warna: `--chart-1` untuk seri utama, `--chart-2` untuk pembanding, `--chart-3` untuk ketiga. Lebih dari tiga kategori: satu warna `--chart-1`, urut menurut nilai, label di ujung batang.
- Kisi: garis horizontal tipis `--chart-grid`, tanpa garis vertikal. Tanpa garis sumbu tebal, tanpa bayangan, tanpa gradasi, tanpa animasi masuk.
- Teks sumbu 12px `--muted-foreground`. Nominal di sumbu boleh disingkat ("12 jt"). Nilai pasti ditampilkan di tooltip dan di tabel/daftar yang menyertai grafik.
- Label langsung di batang atau di ujungnya, legenda hanya bila lebih dari satu seri. Tooltip: kartu putih, garis `--border`, teks 13.
- Setiap grafik wajib punya padanan teks (tabel atau daftar) agar bisa dibaca pembaca layar. Warna status tidak dipakai untuk seri grafik biasa.

---

## 7. Sketsa Teks Lima Layar

Notasi: `[ ]` tombol, `[ ▾ ]` select, `▣` foto/gambar, `│` garis pemisah. `(P)` menandai satu tombol aksen layar itu.

### 7.1 Dashboard owner

**Desktop (≥1024px)**, properti "Semua properti", November 2026:
```
Dashboard                                                          [Semua properti ▾]
Ringkasan November 2026

┌─ Sudah masuk ─────┐┌─ Belum masuk ─────┐┌─ Terlambat ───────┐┌─ Kamar terisi ────┐
│ Rp 18.750.000     ││ Rp 5.000.000      ││ Rp 2.500.000      ││ 22 dari 25        │
│ 15 dari 19 tagihan││ 4 tagihan         ││ 2 tagihan         ││ 3 kosong · 0 rusak│
└───────────────────┘└───────────────────┘└───────────────────┘└───────────────────┘

┌─ Tunggakan ──────────────────────────────────────────┐ ┌─ Jatuh tempo 7 hari ───────┐
│ Kamar  Tenant          Jatuh tempo  Nominal   Status │ │ A-05  Dewi   8 Nov  Rp 1,2 │
│ A-03   Budi Santoso    5 Nov 2026   1.250.000 ⚠ 1 hr│ │ B-02  Rudi   9 Nov  …      │
│ B-07   Sari Wulandari  1 Nov 2026   1.250.000 ⚠ 5 hr│ │ B-04  Tono   11 Nov …      │
│                                         Lihat semua →│ └────────────────────────────┘
└──────────────────────────────────────────────────────┘
┌─ Maintenance ─────────────────────┐ ┌─ Pengeluaran bulan ini ──────────────────────┐
│ Baru 2 · Dikerjakan 1 · Terlambat 0│ │ Total Rp 6.420.000                          │
│ Jadwal rutin ≤ 7 hari: Servis AC  │ │ Gaji/honor      ████████████  3.000.000      │
│   Kamar A-02 · 9 Nov              │ │ Listrik         ██████        1.850.000      │
└───────────────────────────────────┘ │ Perawatan       ███           900.000        │
                                      └──────────────────────────────────────────────┘
```
- Tidak ada tombol aksen karena dashboard tidak punya aksi utama. Bila perlu satu, hanya "Buat tagihan bulan ini".
- Tunggakan dan jatuh tempo memakai DataTable ringkas (tanpa paginasi, lima baris, tautan "Lihat semua").
- Status kamar sebagai batang bertumpuk tunggal bila lebar cukup.

**HP**:
```
┌───────────────────────────────┐
│ [Melati ▾]                    │
├───────────────────────────────┤
│ Dashboard                     │
│ November 2026                 │
│ Aksi cepat                    │
│ [ Catat meteran ][ Lapor rusak]│  tombol outline 44px
│ [ Tenant baru ] [ Tagihan ]   │
│ ┌ Sudah masuk ┐┌ Belum masuk ┐│
│ │ Rp 18.750.000││ Rp 5.000.000││
│ └─────────────┘└─────────────┘│
│ ┌ Terlambat ──┐┌ Kamar terisi┐│
│ │ Rp 2.500.000││ 22 dari 25  ││
│ └─────────────┘└─────────────┘│
│ Tunggakan                     │
│ A-03 · Budi Santoso      ⚠ 1 hr│
│ Rp 1.250.000                  │
│ [ Tandai lunas ][ Pengingat ] │
│ …                             │
├───────────────────────────────┤
│ Beranda Tagihan Tenant Lainnya│
└───────────────────────────────┘
```
- "Aksi cepat" hanya tampil untuk peran dan pengaturan yang relevan (Catat meteran bila listrik dikelola). Semua berupa `outline`, tidak ada `primary`.

### 7.2 Daftar tagihan

**Desktop**:
```
Tagihan                                                       (P) [Buat tagihan bulan ini]
Properti Melati · November 2026

Total Rp 24.500.000   Lunas 18   Belum bayar 4   Terlambat 2          ← pintasan filter

[🔍 Cari kamar atau nama…       ] [Periode: Nov 2026 ▾] [Status: Semua ▾]   Hapus filter
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Kamar ↑  Tenant            Jatuh tempo   Nominal        Status               Aksi     │
│────────────────────────────────────────────────────────────────────────────────────────│
│ A-03     Budi Santoso      5 Nov 2026    Rp 1.250.000   ⚠ Terlambat 1 hari  [Tandai lunas] ⋯│
│ A-05     Dewi Lestari      8 Nov 2026    Rp 1.400.000   ⏱ Belum bayar       [Tandai lunas] ⋯│
│ B-02     Rudi Hartono      1 Nov 2026    Rp 1.250.000   ✓ Lunas                          ⋯│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Menampilkan 1–20 dari 24                              [ Sebelumnya ] [ Berikutnya ]    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
- Menu "⋯" per baris: Lihat detail, Kirim pengingat WhatsApp (hanya `UNPAID`), Batalkan pembayaran (hanya `PAID`), Batalkan tagihan (VOID).
- Membuka halaman ini memicu pembuatan tagihan yang jatuh tempo ≤7 hari (FR-INV-03); tampilkan skeleton dulu, lalu toast hanya bila ada tagihan baru: "3 tagihan baru dibuat."

**HP**:
```
┌───────────────────────────────┐
│ [Melati ▾]            [ + ]   │
├───────────────────────────────┤
│ Tagihan                       │
│ November 2026                 │
│ [🔍 Cari…            ][Filter]│
│ (Semua)(Belum bayar)(Terlambat)(Lunas)→
│ Total Rp 24.500.000 · 24 tagihan│
│───────────────────────────────│
│ Kamar A-03 · Budi Santoso     │
│ Jatuh tempo 5 Nov 2026        │
│ Rp 1.250.000   ⚠ Terlambat 1 hr│
│ [ Tandai lunas ][ Pengingat ] │
│───────────────────────────────│
│ Kamar B-02 · Rudi Hartono     │
│ Rp 1.250.000          ✓ Lunas │
│───────────────────────────────│
│ [ Muat lebih banyak ]         │
├───────────────────────────────┤
│ Beranda Tagihan Tenant Lainnya│
└───────────────────────────────┘
```
- Header HP: "+" membuka form tagihan manual (FR-INV-04). "Buat tagihan bulan ini" ada di menu "⋯" header.
- "Tandai lunas" membuka sheet: tanggal bayar (bawaan hari ini), foto bukti (opsional), tombol utama "Tandai lunas".

### 7.3 Detail tenant

**Desktop**:
```
Tenant / Budi Santoso
┌──────┐  Budi Santoso                                   [Kirim pesan WA] (P)[Ubah data] ⋯
│ ▣    │  Kamar A-03 · Properti Melati
│ foto │  ⓘ Aktif   Masuk 5 Okt 2025   Tagihan tiap tanggal 5
└──────┘
[ Profil ]  Tagihan   Kendaraan dan elektronik   Listrik          ← tab, aktif bergaris bawah navy
──────────────────────────────────────────────────────────────────────────────
Data diri                                   Sewa
 Nomor WhatsApp  +62 812-3456-7890           Harga sewa     Rp 1.250.000
 NIK             •••• •••• •••• 3456 [Tampilkan]   Berlaku sejak 5 Okt 2025
 Catatan         Menghuni berdua dengan adik  Listrik        Ditagihkan ke tenant
                                                              Per kWh · Rp 1.500
```
- Satu aksen: "Ubah data". "Tenant keluar" dan "Ubah harga sewa" di menu "⋯", "Tenant keluar" berwarna `--danger`.
- Pasangan label-nilai: label 13 redup di kiri, nilai 14 di kanan, dua kolom di ≥1024px.
- "Tampilkan" NIK = ghost kecil. Setelah ditekan, NIK penuh tampil dan keterangan "Pembukaan data ini tercatat di Audit Log."
- Tab Tagihan = DataTable riwayat pembayaran (FR-PAY-03) dengan tautan "Lihat bukti" yang membuka penampil foto.

**HP**:
```
┌───────────────────────────────┐
│ ←  Budi Santoso            ⋯ │
├───────────────────────────────┤
│ [▣ foto]  Budi Santoso        │
│           Kamar A-03          │
│           ⓘ Aktif              │
│ [ Hubungi lewat WA ][ Ubah ]  │
│ Profil|Tagihan|Kendaraan|Listrik→  (tab dapat digeser)
│───────────────────────────────│
│ Nomor WhatsApp                │
│ +62 812-3456-7890             │
│ NIK                           │
│ •••• •••• •••• 3456 [Tampilkan]│
│ Harga sewa                    │
│ Rp 1.250.000                  │
│ …                             │
└───────────────────────────────┘
```
- Bilah bawah disembunyikan di halaman detail; tombol kembali di kiri. Tombol utama "Ubah" tetap satu aksen; "Hubungi lewat WA" `outline`.

### 7.4 Form tiket maintenance dengan foto sebelum dan sesudah

**HP: membuat tiket kerusakan** (halaman penuh, bilah bawah disembunyikan)
```
┌───────────────────────────────┐
│ ←  Tiket kerusakan baru       │
├───────────────────────────────┤
│ Judul                         │
│ [ AC kamar A-03 tidak dingin ]│
│ Asset atau kamar              │
│ [ AC · Kamar A-03          ▾ ]│
│ Deskripsi (opsional)          │
│ [                             ]│
│ Dilaporkan oleh (opsional)    │
│ [ Budi Santoso (tenant)       ]│
│ [✓] Kamar tidak bisa dipakai  │
│     Status kamar jadi "Rusak" │
│                               │
│ Foto sebelum                  │
│ ┌ ▣ ┐ ┌ ▣ ┐ ┌──────┐         │
│ └───┘ └───┘ │ + foto│         │
│             └──────┘          │
│ Minimal satu foto kondisi rusak│
├───────────────────────────────┤
│ [          Simpan tiket      ]│  (P) 48px, melekat di bawah
│ [            Batal           ]│
└───────────────────────────────┘
```
- Foto sebelum **wajib minimal satu** (FR-MNT-05). Tombol "Simpan tiket" menampilkan galat bila kosong: "Tambahkan minimal satu foto kondisi rusak."
- Sakelar "Kamar tidak bisa dipakai" hanya muncul bila kamar tidak berpenghuni (FR-ROOM-05).

**Desktop: detail tiket yang sedang dikerjakan, sebelum diselesaikan**
```
Maintenance / AC kamar A-03 tidak dingin
AC kamar A-03 tidak dingin                      [Batalkan tiket] (P)[Selesaikan tiket]
Kerusakan · Kamar A-03 · Dilaporkan 4 Nov 2026 oleh Budi Santoso
[Baru] ── [● Dikerjakan] ── [Selesai]                 ← langkah, tahap kini tercetak tebal

┌─ Foto sebelum ─────────────────┐ ┌─ Foto sesudah ────────────────────┐
│ ┌────┐ ┌────┐                  │ │ ┌──────────────────────────────┐  │
│ │ ▣  │ │ ▣  │  4 Nov 2026      │ │ │ Belum ada foto sesudah        │  │
│ └────┘ └────┘                  │ │ │ [ Ambil foto ] [ Pilih foto ] │  │
└────────────────────────────────┘ │ └──────────────────────────────┘  │
                                   └───────────────────────────────────┘
Deskripsi            Remote AC tidak responsif, kompresor tidak menyala.
Biaya                Rp 0 (diisi saat tiket diselesaikan)
```
- Dua kolom sejajar di ≥768px (FR-MNT-08), tumpuk di HP: sebelum di atas, sesudah di bawah.
- "Selesaikan tiket" membuka dialog: **Foto sesudah** (wajib minimal satu, FR-MNT-07), **Biaya** (MoneyInput, boleh 0), tanggal selesai (bawaan hari ini). Tombol utama "Selesaikan tiket". Teks bantuan: "Biaya otomatis masuk laporan pengeluaran."
- Setelah `DONE`: kedua kolom foto dapat dibuka penuh, tombol aksi hilang, tampil lencana "Selesai".

### 7.5 Catat meteran listrik

**HP: daftar lalu isi satu per satu**
```
┌───────────────────────────────┐
│ ←  Catat meteran        Nov 2026 ▾│
├───────────────────────────────┤
│ 5 dari 12 sudah dicatat       │
│ ▓▓▓▓▓░░░░░░░                  │  batang kemajuan tipis 4px, --primary
│ (Semua)(Belum dicatat)(Tercatat)→
│───────────────────────────────│
│ Kamar A-03 · Meteran A-03     │
│ Sebelumnya 1.204 kWh          │
│ ⏱ Belum dicatat               │
│───────────────────────────────│
│ Kamar A-04 · Meteran A-04     │
│ 1.318 kWh · pakai 92 kWh      │
│ ✓ Tercatat                    │
├───────────────────────────────┤
```
Ketuk satu meteran, sheet bawah penuh:
```
┌───────────────────────────────┐
│ Meteran A-03 · Kamar A-03   ✕ │
├───────────────────────────────┤
│ Angka sebelumnya              │
│ 1.204 kWh  (12 Okt 2026)      │
│ Angka sekarang                │
│ [ 1290                  kWh ] │  input angka 24px, inputmode numeric
│ Pemakaian: 86 kWh             │  otomatis, tebal
│ Tanggal                       │
│ [ 6 Nov 2026               ] │
│ Foto meteran (opsional)       │
│ [ Ambil foto ]  [ Galeri ]    │
│ [ ] Meteran diganti atau direset│
├───────────────────────────────┤
│ [       Simpan dan berikutnya]│  (P) 48px
│ [          Simpan saja       ]│
└───────────────────────────────┘
```
- Setelah simpan: toast "Meteran A-03 tersimpan. Listrik Rp 129.000 masuk ke tagihan." (hanya bila `TENANT_BILLED`), lalu sheet berpindah ke meteran belum dicatat berikutnya.
- Galat angka lebih kecil: "Angka lebih kecil dari angka sebelumnya (1.204). Jika meteran diganti, centang 'Meteran diganti atau direset'." (FR-ELC-05).
- Bila tagihan periode itu sudah lunas: kotak peringatan `--warning-soft` "Tagihan Kamar A-03 sudah lunas dan tidak diubah otomatis." (FR-ELC-11).

**Desktop: tabel dengan isian langsung**
```
Catat meteran listrik                                   [Nov 2026 ▾]   [Properti Melati ▾]
5 dari 12 sudah dicatat

[Semua] [Belum dicatat] [Tercatat]
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ Meteran  Kamar  Sebelumnya   Sekarang          Pemakaian   Foto       Status      Aksi     │
│───────────────────────────────────────────────────────────────────────────────────────────│
│ A-03     A-03   1.204 kWh    [ 1290      ]     86 kWh      ▣ Tambah   ⏱ Belum     [Simpan] │
│ A-04     A-04   1.226 kWh    1.318 kWh         92 kWh      ▣ Lihat    ✓ Tercatat    ⋯      │
│ B-01     B-01   880 kWh      [           ]     —           ▣ Tambah   ⏱ Belum     [Simpan] │
└───────────────────────────────────────────────────────────────────────────────────────────┘
Tekan Enter untuk menyimpan dan pindah ke baris berikutnya.
```
- Tidak ada tombol aksen tingkat halaman. Tiap baris menyimpan sendiri (Enter atau "Simpan"), sebab satu catatan = satu entri audit. Setelah tersimpan, sel "Sekarang" menjadi teks dan baris menampilkan "✓ Tercatat" selama 2 detik di tempat toast.
- Kolom angka rata kanan, `tabular-nums`. "Sebelumnya" dan "Pemakaian" otomatis.
- Pencatatan token/tagihan PLN (pengeluaran owner) ada di tab terpisah "Token dan tagihan PLN" di halaman yang sama dan memakai form pengeluaran biasa.

---

## 8. Gaya Bahasa dan Format

### 8.1 Nada

- **Sopan, singkat, langsung.** Kalimat aktif, kata kerja di awal untuk tombol. Tidak memakai tanda seru, emoji, atau bahasa gaul. Tidak menyalahkan pengguna.
- Sapaan "Anda" hanya dipakai bila perlu (galat, hak akses). Selebihnya tidak menyebut pelaku.
- Istilah tetap (ikut PRD): **Tenant**, **Kamar**, **Tagihan**, **Pengelola**, **Owner**, **Properti**, **Fasum**, **Asset**, **Meteran**, **Lunas**, **Belum bayar**, **Terlambat**, **Tiket**. Jangan campur dengan "penyewa", "penghuni", "pemilik" untuk objek yang sama. (Keputusan istilah ada di akhir dokumen.)
- Tombol: kata kerja + objek ("Tandai lunas", "Simpan tenant", "Catat meteran"). Judul: kata benda ("Tagihan", "Catat meteran listrik"). Tidak memakai "Silakan", "Mohon", atau "Klik di sini".

### 8.2 Format

| Jenis | Format | Contoh |
| --- | --- | --- |
| Rupiah | `Rp` + spasi tak terputus + pemisah titik, tanpa desimal. Negatif: `-Rp` | `Rp 1.250.000`, `-Rp 250.000` |
| Tanggal (UI) | `d MMM yyyy`, bulan singkat Indonesia | `6 Nov 2026` |
| Tanggal (panjang) | `d MMMM yyyy` untuk judul laporan, dialog resmi, PDF | `6 November 2026` |
| Periode | `MMM yyyy` / `MMMM yyyy` | `Nov 2026` / `November 2026` |
| Bulan singkat | Jan, Feb, Mar, Apr, Mei, Jun, Jul, Agu, Sep, Okt, Nov, Des | |
| Jam | `HH.mm` + WIB, titik pemisah | `14.30 WIB` |
| Tanggal + jam | `6 Nov 2026, 14.30` | |
| Hari relatif | "hari ini", "besok", "3 hari lagi", "terlambat 5 hari" | |
| kWh | Angka titik + spasi + `kWh` | `1.204 kWh` |
| Telepon (tampil) | `+62 812-3456-7890`; disimpan `62xxxxxxxxxx` | |
| NIK (daftar) | Tersamar `•••• •••• •••• 3456` | |
| Persentase | Tanpa spasi | `85%` |
| Jumlah | Titik pemisah ribuan | `1.204` |

- Semua format dihasilkan oleh `lib/format.ts` (`formatRupiah`, `formatDate`, `formatDateLong`, `formatPeriod`, `formatTime`, `formatKwh`, `formatRelativeDays`, `formatPhone`) memakai `date-fns` + `@date-fns/tz` (Asia/Jakarta). Komponen tidak memformat sendiri.
- Tanggal di kolom diberi `<time datetime="2026-11-06">`.
- Nominal tidak pernah disingkat di tabel/kartu. Di sumbu grafik boleh "12 jt".
- Catatan: PRD bagian 8 menulis `dd/mm/yyyy`; panduan ini memakai `6 Nov 2026` sesuai arahan desain. Bila disetujui, PRD bagian 8 diperbarui (lihat keputusan).

### 8.3 Contoh teks

**Teks kosong**

| Tempat | Judul | Penjelasan | Tombol |
| --- | --- | --- | --- |
| Tagihan, awal | Belum ada tagihan | Tagihan dibuat otomatis 7 hari sebelum jatuh tempo tenant. | Buat tagihan bulan ini |
| Tagihan, filter | Tidak ada tagihan yang cocok | Ubah kata kunci atau filter. | Hapus filter |
| Tenant, awal | Belum ada tenant | Tambahkan tenant pertama untuk membuat tagihan pertamanya. | Tambah tenant |
| Kamar, awal | Belum ada kamar | Tambahkan kamar sebelum mencatat tenant. | Tambah kamar |
| Maintenance | Belum ada tiket | Catat kerusakan atau jadwal perawatan di sini. | Buat tiket |
| Listrik | Belum ada meteran | Daftarkan meteran untuk mulai mencatat pemakaian. | Tambah meteran |
| Audit Log | Belum ada perubahan | Perubahan data oleh pengguna akan muncul di sini. | tanpa tombol |
| Tunggakan | Tidak ada tunggakan | Semua tagihan bulan ini sudah lunas atau belum jatuh tempo. | tanpa tombol |

**Galat dan validasi** (pola: apa yang terjadi + apa yang dilakukan)

| Situasi | Pesan |
| --- | --- |
| Kolom wajib kosong | "Nama wajib diisi." |
| NIK salah | "NIK harus 16 digit angka." |
| Nomor WhatsApp salah | "Nomor WhatsApp tidak valid. Contoh: 0812 3456 7890." |
| Kata sandi pendek | "Kata sandi minimal 10 karakter." |
| Username salah | "Username 3–30 karakter: huruf kecil, angka, titik, atau garis bawah." |
| Login gagal | "Username atau kata sandi salah." |
| Nominal nol | "Nominal harus lebih dari 0." |
| Kamar sudah terisi | "Kamar A-03 sudah punya tenant aktif. Pilih kamar lain." |
| Tenant keluar ditolak | "Tenant masih punya 2 tagihan belum lunas. Lunasi dulu sebelum menyatakan keluar." |
| Foto wajib | "Tambahkan minimal satu foto kondisi rusak." |
| Foto sesudah wajib | "Tambahkan foto sesudah perbaikan sebelum menyelesaikan tiket." |
| Tanpa izin | "Anda tidak punya akses ke properti ini." |
| Sesi habis | "Sesi Anda berakhir. Masuk lagi untuk melanjutkan." |
| Jaringan | "Tidak dapat terhubung. Periksa koneksi internet Anda, lalu coba lagi." |
| Server | "Terjadi kesalahan di sistem. Coba lagi. Bila terus terjadi, hubungi owner." |
| Tidak ditemukan | "Halaman tidak ditemukan." |

**Keberhasilan (toast)**: "Tagihan Kamar A-03 ditandai lunas." · "Tenant Budi Santoso disimpan." · "Meteran A-03 tersimpan." · "3 tagihan baru dibuat." · "Foto diunggah."

**Konfirmasi**: judul pertanyaan ("Batalkan pembayaran?"), satu kalimat dampak, tombol verba spesifik ("Batalkan pembayaran") dan "Batal".

**Pesan galat tidak pernah memuat** kode galat mentah, jejak tumpukan, NIK, nomor telepon, atau kata sandi. Kode dari backend dipetakan di `lib/errors.ts` dengan pesan umum sebagai cadangan.

---

## 9. Aksesibilitas

Sasaran: **WCAG 2.2 level AA**.

- **Kontras**: seluruh teks ≥4,5:1 dan komponen ≥3:1 (bagian 2.2). Token baru wajib dihitung sebelum dipakai.
- **Bukan warna saja**: status = ikon + teks. Galat = ikon + teks + garis merah. Tautan di dalam kalimat bergaris bawah.
- **Fokus terlihat**: cincin 2px `--ring` offset 2px di semua elemen interaktif, tidak boleh dihilangkan (`outline: none` hanya jika diganti cincin). Urutan fokus mengikuti urutan visual.
- **Papan ketik penuh**: semua tindakan bisa dilakukan tanpa tetikus. Menu, combobox, dialog, dan tab mengikuti pola WAI-ARIA (komponen Radix/shadcn sudah memenuhi). Tautan "Lewati ke konten" di awal halaman.
- **Target sentuh**: ≥44×44px di HP dengan jarak ≥8px (bagian 4.4).
- **Label dan galat**: setiap kolom punya `<label>` terlihat. Galat memakai `aria-invalid` dan `aria-describedby`; saat submit gagal, fokus pindah ke kolom galat pertama dan ringkasan galat muncul di atas form panjang.
- **Dialog**: `role="dialog"`/`alertdialog` untuk konfirmasi berbahaya, kunci fokus, `Esc`, kembalikan fokus ke pemicu, scroll latar dikunci.
- **Tabel**: `<table>` semantik dengan `<th scope>` dan `<caption class="sr-only">`; kolom urut memakai `aria-sort`. Tampilan kartu di HP memakai `<ul>/<li>` dan tautan yang punya nama (bukan "Klik di sini").
- **Gambar dan foto**: `alt` menyatakan fungsi ("Foto sebelum perbaikan AC"). Ikon dekoratif `aria-hidden`. Tombol ikon punya `aria-label`. Grafik punya padanan teks.
- **Toast**: `aria-live` (polite/assertive), tidak hilang sebelum 4 detik, galat tidak hilang sendiri sebelum 8 detik dan bisa ditutup. Informasi penting tidak hanya di toast.
- **Gerak**: hormati `prefers-reduced-motion: reduce` (matikan transisi dan denyut skeleton). Tidak ada yang berkedip.
- **Zoom dan reflow**: viewport tidak mengunci zoom (tanpa `maximum-scale`). Halaman tetap dapat dipakai pada 200% dan lebar 320px tanpa gulir mendatar (kecuali penampil foto).
- **Isian HP**: huruf ≥16px, `inputmode` dan `autocomplete` benar, tanpa fokus otomatis ke kolom cari yang memunculkan papan ketik.
- **Bahasa**: `<html lang="id">`. Tanggal dan nominal memakai elemen/atribut yang dapat dibaca pembaca layar (`<time>`, teks "Rp 1.250.000" tanpa memecah angka).
- **Waktu**: tidak ada batas waktu pada tindakan pengguna. Sesi habis diberi pesan dan data form tidak hilang bila memungkinkan.
- **Uji**: periksa dengan pembaca layar (VoiceOver/TalkBack) untuk login, bayar tagihan, dan tiket. `eslint-plugin-jsx-a11y` aktif (bawaan `eslint-config-next`). Uji e2e Playwright memuat pemeriksaan `axe` untuk halaman utama.

---

## 10. Cara Menerapkan di Kode

### 10.1 Letak berkas

| Hal | Letak |
| --- | --- |
| Token warna, radius, huruf, `.num` | `app/globals.css` |
| Huruf Inter, `lang="id"`, viewport | `app/layout.tsx` |
| Komponen shadcn (Button, Input, Select, Dialog, Sheet, Table, Tabs, Sidebar, Sonner, Skeleton, Popover, Command) | `components/ui/` |
| Komponen gabungan (`DataTable`, `MoneyInput`, `PhoneInput`, `PhotoInput`, `StatusBadge`, `EmptyState`, `StatCard`, `PageHeader`, `FilterBar`, `ConfirmDialog`, `PropertySwitcher`) | `components/shared/` |
| Kerangka (`AppSidebar`, `MobileNav`, `MoreSheet`) | `components/layout/` atau `app/(contents)/_components/` |
| Peta status (`{ label, tone, icon }`) | `lib/labels.ts` |
| Pemformat rupiah, tanggal, kWh, telepon | `lib/format.ts` |
| Pesan galat per kode backend | `lib/errors.ts` |

### 10.2 `app/globals.css` (disalin saat M0; Tailwind v4)

```css
@import "tailwindcss";

:root {
  color-scheme: light;
  --background: #FAFAF9;
  --foreground: #1C1917;
  --card: #FFFFFF;
  --card-foreground: #1C1917;
  --popover: #FFFFFF;
  --popover-foreground: #1C1917;
  --primary: #1E3A5F;
  --primary-foreground: #FFFFFF;
  --primary-hover: #16304F;
  --secondary: #F5F5F4;
  --secondary-foreground: #1C1917;
  --muted: #F5F5F4;
  --muted-foreground: #6B645E;
  --accent: #E8EEF5;
  --accent-foreground: #1E3A5F;
  --border: #E7E5E4;
  --input: #8A837D;
  --ring: #1E3A5F;
  --destructive: #A12D22;
  --destructive-foreground: #FFFFFF;

  --success: #1F6B3A;  --success-soft: #E8F3EC;
  --warning: #8A5A00;  --warning-soft: #FBF1DC;
  --danger:  #A12D22;  --danger-soft:  #FBE7E4;

  --chart-1: #1E3A5F;  --chart-2: #78716C;  --chart-3: #5B7BA3;
  --chart-grid: #E7E5E4;

  --sidebar: #FFFFFF;  --sidebar-foreground: #1C1917;
  --sidebar-accent: #E8EEF5;  --sidebar-accent-foreground: #1E3A5F;
  --sidebar-border: #E7E5E4;  --sidebar-ring: #1E3A5F;

  --radius: 0.5rem;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary-hover: var(--primary-hover);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-destructive: var(--destructive);
  --color-success: var(--success);   --color-success-soft: var(--success-soft);
  --color-warning: var(--warning);   --color-warning-soft: var(--warning-soft);
  --color-danger: var(--danger);     --color-danger-soft: var(--danger-soft);
  --color-sidebar: var(--sidebar);   /* dst. untuk token sidebar */
  --radius-sm: 6px;  --radius-md: 8px;  --radius-lg: 12px;
  --font-sans: var(--font-inter);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.num { font-variant-numeric: tabular-nums; }

@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after { animation: none !important; transition: none !important; }
}
```

Blok di atas adalah acuan untuk M0. Hapus blok `prefers-color-scheme: dark` bawaan scaffold. Setelah menjalankan inisialisasi shadcn, **timpa** nilai warna bawaan shadcn dengan token ini dan hapus kelas `shadow-*` dari komponen yang dihasilkan.

### 10.3 `lib/labels.ts` (bentuk, bukan isi akhir)

```ts
type Tone = "success" | "warning" | "danger" | "info" | "neutral";
type StatusMeta = { label: string; tone: Tone; icon?: IconName };

// Satu peta per enum di shared/enums.ts, kunci = nilai enum.
export const invoiceStatus: Record<InvoiceStatus, StatusMeta> = { /* ... */ };
export const roomStatus: Record<RoomStatus, StatusMeta> = { /* ... */ };
// Status dihitung (BR-10): fungsi, bukan peta.
export function invoiceDisplay(inv: { status: InvoiceStatus; overdueDays: number }): StatusMeta { /* ... */ }
```

Aturan:
- `StatusBadge` hanya menerima `kind` dan `value`. String "Lunas", "Terlambat" dan sejenisnya tidak boleh muncul di komponen lain.
- Peta memakai `Record<Enum, ...>` sehingga TypeScript gagal kompilasi bila enum bertambah tanpa label.
- Bila backend mengirim hasil hitung (mis. `overdueDays`), frontend hanya memetakan, tidak menghitung ulang (AGENTS aturan batas nomor 6).

### 10.4 Pedoman untuk agen pengodean

1. Pakai komponen di `components/ui` dan `components/shared`. Jangan membuat tombol, lencana, atau kartu ad hoc.
2. Hanya kelas warna token (`bg-card`, `text-muted-foreground`, `border-border`, `bg-warning-soft text-warning`). Tidak ada `#hex`, `bg-blue-*`, atau `shadow-*`.
3. Satu halaman = satu `PageHeader` dengan paling banyak satu tombol `primary`.
4. Semua teks pengguna dari `lib/labels.ts`, `lib/errors.ts`, atau literal Indonesia di komponen; semua angka dari `lib/format.ts`.
5. Semua daftar memakai `DataTable` (tabel di ≥768px, kartu di HP) dan memiliki keadaan memuat, kosong, galat.
6. Setiap form: label, galat terhubung, tombol utama melekat di bawah pada HP, `autocomplete` dan `inputmode` benar.
7. Uji di lebar 375 (HP) dan 1280 (desktop) sebelum menyatakan UI selesai. Laporkan hasilnya apa adanya.

### 10.5 Daftar periksa tinjauan UI

- [ ] Tidak ada bayangan, gradasi, ikon berlingkaran, emoji
- [ ] Satu tombol aksen terlihat; aksi berbahaya tidak di samping tombol utama
- [ ] Warna status hanya pada status; status ada teks + ikon
- [ ] Target sentuh ≥44px di HP; isian 16px
- [ ] Tabel menjadi kartu di <768px, tanpa gulir mendatar
- [ ] Keadaan memuat, kosong, galat tersedia
- [ ] Format `Rp 1.250.000` dan `6 Nov 2026` lewat `lib/format.ts`
- [ ] Kontras dihitung bila ada token baru
- [ ] Fokus terlihat, bisa dioperasikan papan ketik

---

## Lima hal yang perlu Anda putuskan sendiri

1. **Huruf: Inter atau Geist.** Rekomendasi Inter (seragam dengan PDF laporan, angka tabular andal), tetapi scaffold sekarang memakai Geist. Memilih Inter berarti mengganti impor di `app/layout.tsx` saat M0.
2. **Format tanggal di layar: `6 Nov 2026` atau `dd/mm/yyyy`.** Brief Anda dan panduan ini memakai `6 Nov 2026`, sedangkan PRD bagian 8 menulis `dd/mm/yyyy`. Bila `6 Nov 2026` dipilih, PRD bagian 8 perlu direvisi agar tidak bertentangan.
3. **Istilah baku di antarmuka.** PRD memakai "Tenant" dan "Pengelola" tetapi juga "penyewa/penghuni". Putuskan satu: "Tenant" atau "Penghuni" (saya pakai "Tenant" mengikuti menu PRD), dan "Owner" atau "Pemilik".
4. **Empat slot bilah bawah di HP.** Saya menetapkan Beranda, Tagihan, Tenant, Lainnya, dengan Catat meteran dan Lapor kerusakan di Aksi cepat Beranda. Jika pengelola Anda lebih sering membuka Maintenance atau Listrik daripada Tenant, ganti slotnya (maksimal lima slot).
5. **Nama produk dan logo.** PRD menyatakan nama produk belum ditentukan. Dibutuhkan wordmark teks sederhana untuk sidebar (tinggi 24px) dan layar login, serta favikon. Tanpa keputusan ini, saya memakai teks "Kost" bergaya Inter 600 sebagai penampung sementara.
