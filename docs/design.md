# Panduan Desain Kostra

**Versi:** 0.8 · **Tanggal:** 7 November 2026
**Nama produk:** Kostra
**Berlaku untuk:** seluruh aplikasi (login, area berlogin, ekspor PDF bila relevan)
**Dibaca bersama:** `AGENTS.md`, `docs/PRD.md` (bagian 1, 2, 7, 8, 9), `docs/TECH-SPEC.md` (bagian 6)

Dokumen ini satu-satunya sumber warna, huruf, jarak, dan pola komponen. Agen pengodean **tidak memilih warna atau gaya sendiri**. Bila butuh sesuatu yang tidak ada di sini, tanyakan dulu lalu tambahkan ke dokumen ini.

**Arah gaya:** minimalis, elegan, modern. Dashboard profesional seperti produk SaaS, bukan landing page.
**Template dasar:** [shadcn/ui Blocks](https://ui.shadcn.com/blocks) `dashboard-01` untuk kerangka dan `login-02` untuk halaman masuk. Kode block disalin ke proyek lalu disesuaikan dengan aturan di dokumen ini. Bila kode template bertentangan dengan dokumen ini, dokumen ini yang menang.
**Parameter gaya:** `DESIGN_VARIANCE 3` (tata letak lurus dan dapat ditebak), `MOTION_INTENSITY 2` (transisi halus saja), `VISUAL_DENSITY 6` (padat tetapi lega).

### Perubahan dari versi 0.1

| Bagian | 0.1 | 0.2 |
| --- | --- | --- |
| Nama | Belum ada ("Kost" sementara) | **Kostra** |
| Kerangka | Sidebar tetap 232px, tanpa navbar | **Sidebar inset bisa diciutkan + navbar atas 48px** (shadcn dashboard-01) |
| Navigasi HP | Bilah bawah 4 slot + laci "Lainnya" | **Laci sidebar saja**, dibuka dari tombol di navbar |
| Huruf | Inter | **Plus Jakarta Sans** |
| Login | Formulir di tengah | **Dua kolom** (shadcn login-02): formulir kiri, foto kanan |
| Foto | Dilarang | **Satu foto** di panel login saja, berlisensi bebas, dengan kredit |
| Kartu angka | Kotak polos | Pola `section-cards` shadcn, tanpa gradasi dan bayangan |
| Kartu angka (0.3) | Dua kartu terpisah, ikon di pojok | **Strip angka**: satu panel bergaris dengan sel berpembagi, tanpa ikon (6.13) |
| Halaman Akun (0.3) | Satu kolom sempit berisi formulir sandi | **Bagian bertingkat**: judul di kiri, isi di kanan. Ada bagian Profil (baca saja) dan Kata sandi (6.18) |
| Kamar dan properti (0.4) | Belum diatur | **Daftar kamar** dengan kolom properti saat "Semua properti" (6.19). **Form kamar** halaman penuh (6.20). **Sakelar** dan pola listrik di pengaturan properti (6.20) |
| Detail kamar (0.5) | Belum diatur | **Halaman detail kamar** baca saja: strip harga dan status, bagian data kamar, dan bagian lain yang muncul bertahap (6.21, 7.7). Ubah dan hapus pindah dari form ke halaman detail (6.20, 6.21) |
| Keputusan M1 (0.6) | Pola listrik A sampai E, harga bisa 0, detail dan ubah kamar satu halaman | **Pola A sampai E saja** (BR-17). Keterangan pola ditulis dalam bahasa awam. **Harga harus lebih dari 0.** **Detail dan ubah kamar dipisah** (6.21). Lihat 11.1 |
| Cakupan properti per halaman (0.8) | Pemilih properti global di navbar | **Filter properti di tiap halaman** (6.16), navbar tanpa pemilih. Kamar selalu menyebut propertinya (6.22, 7.8). PRD FR-PRO-02 dan FR-PRO-06 ikut berubah |

---

## 1. Prinsip Desain dan Larangan

### 1.0 Satu keluarga panel

Semua panel konten memakai gaya yang sama: latar `--card`, garis 1px `--border`, radius 12, tanpa bayangan. Judul bagian ada **di luar** panel (kecuali bagian pengaturan, yang judulnya di kiri panel, lihat 6.18). Satu panel dipakai untuk satu kelompok isi, bukan beberapa kartu yang mengambang. Tidak ada kartu di dalam kartu, dan tidak ada teks pengisi untuk memenuhi ruang.

### 1.1 Tiga prinsip

1. **Tenang.** Satu aksen (navy), satu tombol aksen per layar, tanpa bayangan, tanpa gradasi. Lapisan dibedakan oleh warna latar (sidebar di latar halaman, konten di panel putih) dan garis 1px.
2. **Padat tetapi lega.** Angka dan tabel rapat (baris 44px, huruf 14px), diberi napas lewat jarak kelipatan 4px dan kolom yang rata.
3. **Status selalu terbaca tanpa warna.** Setiap status punya teks Indonesia dan ikon kecil. Warna hanya penegas.

### 1.2 Aturan keras

| Aturan | Isi |
| --- | --- |
| Satu tombol aksen | Maksimal satu tombol `primary` (navy) terlihat per layar. Di dalam dialog, tombol utama dialog yang berlaku. |
| Warna status hanya untuk status | Hijau, kuning, merah hanya untuk `StatusBadge`, teks status, dan indikator galat/berhasil. |
| Tanpa bayangan | `box-shadow` tidak dipakai. Kelas bawaan shadcn/template seperti `shadow-xs`, `shadow-sm`, dan bayangan panel `SidebarInset` dihapus saat block disalin. Cincin fokus tetap ada. |
| Tanpa gradasi | Gradasi tipis bawaan `section-cards` (`bg-gradient-to-t from-primary/5`) dihapus. |
| Radius | 8px untuk tombol, kolom isian, menu. 6px untuk lencana. 12px untuk kartu, tabel, dialog, sheet, dan panel konten inset. |
| Hanya mode terang | `color-scheme: light`. Kode dark mode dari template (`dark:`) boleh tetap ada di komponen tetapi tidak pernah aktif dan tidak ada sakelar tema. |
| Teks pengguna bahasa Indonesia | Semua lewat `lib/labels.ts`, `lib/errors.ts`, `lib/format.ts`. Teks contoh template ("Acme Inc.", "Documents", data dummy) wajib diganti atau dihapus. |
| Data nyata saja | Kartu angka, grafik, dan tabel hanya menampilkan data yang benar-benar ada di sistem. Tidak ada angka contoh, tren palsu, atau persentase karangan. |

### 1.3 Dilarang

- Bayangan, gradasi, kaca buram, glow, tekstur, emoji di antarmuka.
- Ilustrasi dekoratif dan foto di dalam aplikasi. **Satu-satunya pengecualian:** foto panel login (bagian 6.17).
- Ikon di dalam lingkaran atau kotak berwarna. Ikon berdiri sendiri, garis 1,5 sampai 2px, ukuran 16 atau 20px (`lucide-react`). Pengecualian: logo Kostra di sidebar boleh di kotak `--sidebar-primary` (pola logo template).
- Lencana status berbentuk pil, huruf kapital semua, atau hanya titik warna tanpa teks.
- Dua tombol aksen pada satu layar.
- Garis belang (zebra) pada tabel.
- Kartu di dalam kartu lebih dari dua tingkat.
- Dialog untuk form panjang (lebih dari 4 kolom). Pakai halaman penuh.
- Tabel yang menggulir ke samping di HP. Di HP tabel menjadi daftar kartu.
- Informasi yang hanya muncul lewat hover atau tooltip. Pengecualian: tooltip nama menu saat sidebar diciutkan menjadi ikon (desktop saja, nama menu tetap terbaca bila sidebar dibuka).
- Placeholder sebagai pengganti label.
- `window.confirm`, `alert`, atau `prompt`.
- Memotong nominal atau angka dengan elipsis.
- Singkatan "jt" atau "rb" di tabel dan kartu. Hanya boleh di sumbu grafik.
- Animasi yang dipicu gulir, hitung naik angka, kedipan, karusel, tab berputar otomatis.
- Fitur seret-urut baris tabel dari template (`@dnd-kit`). Tidak dipasang.

---

## 2. Token Warna

Semua warna adalah variabel CSS di `app/globals.css` dengan nama shadcn. Komponen tidak menulis kode heksa langsung.

### 2.1 Token

| Variabel | Nilai | Dipakai untuk |
| --- | --- | --- |
| `--background` | `#FAFAF9` | Latar halaman dan latar sidebar (varian inset) |
| `--foreground` | `#1C1917` | Teks utama |
| `--card` | `#FFFFFF` | Panel konten inset, kartu, tabel, kolom isian |
| `--card-foreground` | `#1C1917` | Teks di atas `--card` |
| `--popover` | `#FFFFFF` | Menu, popover, dialog, sheet, laci |
| `--popover-foreground` | `#1C1917` | Teks di atas `--popover` |
| `--primary` | `#1E3A5F` | Aksen tunggal: tombol utama, tautan, ceklis, seri grafik utama |
| `--primary-foreground` | `#FFFFFF` | Teks di atas `--primary` |
| `--primary-hover` | `#16304F` | Tombol utama saat hover |
| `--secondary` | `#F5F5F4` | Isian halus |
| `--secondary-foreground` | `#1C1917` | Teks di atas `--secondary` |
| `--muted` | `#F5F5F4` | Header tabel, hover baris, skeleton, lencana netral |
| `--muted-foreground` | `#6B645E` | Teks redup |
| `--accent` | `#E8EEF5` | Aksen lembut: lencana "info", pilihan terpilih di menu dropdown |
| `--accent-foreground` | `#1E3A5F` | Teks di atas `--accent` |
| `--border` | `#E7E5E4` | Garis dekoratif, tepi panel inset, tepi kartu |
| `--input` | `#8A837D` | Garis kolom isian, kotak centang (lolos 3:1) |
| `--ring` | `#1E3A5F` | Cincin fokus |
| `--destructive` | `#A12D22` | Tombol berbahaya |
| `--destructive-foreground` | `#FFFFFF` | Teks di atas `--destructive` |
| `--success` / `--success-soft` | `#1F6B3A` / `#E8F3EC` | Status baik |
| `--warning` / `--warning-soft` | `#8A5A00` / `#FBF1DC` | Status menunggu |
| `--danger` / `--danger-soft` | `#A12D22` / `#FBE7E4` | Status buruk, galat |
| `--chart-1` / `--chart-2` / `--chart-3` | `#1E3A5F` / `#78716C` / `#5B7BA3` | Seri grafik (maksimal tiga) |
| `--chart-grid` | `#E7E5E4` | Garis kisi grafik |
| `--sidebar` | `#FAFAF9` | Latar sidebar, sama dengan latar halaman (varian inset) |
| `--sidebar-foreground` | `#1C1917` | Teks menu |
| `--sidebar-primary` | `#1E3A5F` | Kotak logo Kostra |
| `--sidebar-primary-foreground` | `#FFFFFF` | Ikon logo |
| `--sidebar-accent` | `#EEEDEB` | Item menu aktif dan hover (netral, bukan navy) |
| `--sidebar-accent-foreground` | `#1C1917` | Teks item aktif |
| `--sidebar-border` | `#E7E5E4` | Garis di sidebar |
| `--sidebar-ring` | `#1E3A5F` | Fokus di sidebar |
| `--radius` | `0.5rem` (8px) | Radius dasar |

### 2.2 Rasio kontras (WCAG 2.2 AA)

Batas: teks biasa ≥4,5:1, teks besar ≥3:1, komponen dan grafik ≥3:1.

| Pasangan | Rasio | Hasil |
| --- | --- | --- |
| `--foreground` di `--background` | 16,74:1 | AAA |
| `--foreground` di `--card` | 17,49:1 | AAA |
| `--muted-foreground` di `--background` | 5,57:1 | AA |
| `--muted-foreground` di `--card` | 5,82:1 | AA |
| `--muted-foreground` di `--muted` | 5,33:1 | AA |
| `--foreground` di `--sidebar-accent` | 14,95:1 | AAA |
| `--muted-foreground` di `--sidebar-accent` | 4,97:1 | AA |
| `--primary` di `--sidebar-accent` | 9,83:1 | AAA |
| Putih di `--primary` | 11,50:1 | AAA |
| Putih di `--primary-hover` | 13,38:1 | AAA |
| `--accent-foreground` di `--accent` | 9,85:1 | AAA |
| `--success` di `--success-soft` | 5,73:1 | AA |
| `--warning` di `--warning-soft` | 5,28:1 | AA |
| `--danger` di `--danger-soft` | 6,06:1 | AA |
| Teks status di `--background` | 5,67:1 sampai 6,90:1 | AA |
| Putih di `--destructive` | 7,21:1 | AA |
| `--input` di `--card` | 3,73:1 | Komponen 3:1 |
| `--chart-1` / `--chart-2` / `--chart-3` di `--card` | 11,50 / 4,80 / 4,37 | Grafik 3:1 |
| `--border` di `--background` | 1,20:1 | **Hanya dekoratif**, tidak untuk komponen interaktif |

Teks putih di atas foto login selalu memakai lapisan gelap (bagian 6.17) supaya tetap ≥4,5:1 di seluruh area teks.

---

## 3. Tipografi

### 3.1 Huruf

- **Plus Jakarta Sans** lewat `next/font/google`, variabel `--font-jakarta`, subset `latin`, `display: swap`, bobot 400, 500, 600, 700.
- Huruf ini dipilih karena modern, geometris, dan dibuat oleh desainer Indonesia. Satu huruf untuk seluruh aplikasi.
- Monospace sistem hanya untuk kata sandi sementara.
- `html lang="id"`.
- **Catatan ekspor PDF:** TECH-SPEC 7.4 menyebut Inter untuk PDF. Supaya seragam, PDF sebaiknya ikut Plus Jakarta Sans. Ini perlu keputusan di TECH-SPEC (lihat bagian 11).

### 3.2 Angka tabular

- Semua rupiah, kWh, kolom jumlah, dan kartu angka memakai `font-variant-numeric: tabular-nums` (kelas `.num` atau `tabular-nums`).
- **Sudah diperiksa (6 November 2026):** Plus Jakarta Sans memuat fitur `tnum`. Di 30px, "111111" dan "000000" sama-sama 108px dengan `tabular-nums`, dibanding 66,8px dan 131,8px tanpa fitur itu.
- Kolom angka rata kanan di tabel desktop.

### 3.3 Skala ukuran

| Peran | HP (<768px) | Desktop (≥768px) | Bobot | Contoh |
| --- | --- | --- | --- | --- |
| Angka besar (kartu) | 24/32 | 30/36 | 600 | `Rp 24.500.000` |
| Judul halaman (h1) | 20/28 | 24/32 | 600 | Properti |
| Judul di navbar | 14/20 | 14/20 | 500 | breadcrumb `Properti` |
| Judul bagian (h2) | 16/24 | 16/24 | 600 | Tunggakan |
| Isi teks | 16/24 | 14/20 | 400 | Catatan |
| Isi tabel dan daftar | 15/22 | 14/20 | 400 | Nama, kamar |
| Label kolom isian | 14/20 | 14/20 | 500 | Username |
| Keterangan, metadata | 13/18 | 13/18 | 400 | Jatuh tempo 5 Nov 2026 |
| Lencana | 13/16 | 12/16 | 500 | Lunas |
| Terkecil (kredit foto, sumbu grafik) | 12/16 | 12/16 | 400 | |

- Minimum 12px. Isian di HP selalu 16px.
- `letter-spacing: -0.02em` untuk ≥24px (judul dan angka besar), `-0.01em` untuk 16 sampai 20px.

---

## 4. Spasi, Radius, Garis, Tinggi Elemen

### 4.1 Spasi

Skala (px): **4, 8, 12, 16, 20, 24, 32, 48**.

| Konteks | Nilai |
| --- | --- |
| Tepi konten di panel inset | 16 (HP) · 24 (≥1024) |
| Jarak antar bagian di halaman | 24 (HP) · 32 (desktop) |
| Antar kolom isian | 16 |
| Label ke kolom isian | 8 |
| Padding kartu | 20 (HP) · 24 (desktop) |
| Antar kartu angka | 16 |

### 4.2 Ukuran kerangka

| Elemen | Nilai |
| --- | --- |
| Lebar sidebar terbuka | 288px (`--sidebar-width: 18rem`, sama dengan template dashboard-01) |
| Lebar sidebar diciutkan (ikon) | 48px (`--sidebar-width-icon: 3rem`) |
| Tinggi navbar | 48px (`--header-height: 3rem`) |
| Celah panel inset ke tepi layar | 8px (desktop), 0 (HP) |
| Lebar maksimal isi halaman | 1280px di dalam panel inset |
| Form satu kolom | maksimal 640px |

### 4.3 Radius dan garis

| Elemen | Radius |
| --- | --- |
| Tombol, kolom isian, menu, item sidebar, kotak galat | 8px |
| Lencana, chip | 6px |
| Kartu, tabel, daftar bergaris, panel konten inset, dialog, sheet, laci | 12px (`rounded-xl` bawaan Card shadcn) |
| Foto panel login | 12px (desktop, panel di dalam bingkai) |
| Avatar pengguna | 8px (kotak, inisial) |

Garis dekoratif 1px `--border`. Garis kolom isian 1px `--input`.

### 4.4 Tinggi elemen dan target sentuh

Target sentuh minimal **44×44px** di HP.

| Elemen | HP (<768px) | Desktop (≥768px) |
| --- | --- | --- |
| Tombol bawaan | 44 | 40 |
| Tombol kecil | tidak dipakai | 32 |
| Tombol ikon (termasuk pemicu sidebar) | 44×44 | 32×32 |
| Kolom isian, select | 44 | 40 |
| Item menu sidebar | 44 (di laci) | 32 |
| Item menu pengguna (bawah sidebar) | 48 | 48 |
| Baris tabel | kartu min 72 | 44 |
| Navbar | 56 | 48 |

### 4.5 Titik henti

| Nama | Lebar | Perilaku |
| --- | --- | --- |
| HP | <768px | Sidebar menjadi **laci** dari kiri, dibuka lewat tombol di navbar. Tabel menjadi daftar kartu. Dialog menjadi sheet bawah. |
| Tablet | 768–1023px | Sidebar tampil, bisa diciutkan ke ikon. Tabel tampil. |
| Desktop | ≥1024px | Sidebar terbuka bawaan (status terakhir disimpan di cookie `sidebar_state` bawaan shadcn). |

Batas 768px mengikuti `useIsMobile` bawaan komponen sidebar shadcn.

### 4.6 Gerak

- 120ms `ease-out` untuk warna hover dan fokus. Sidebar menciut dan melebar 200ms (bawaan shadcn). Laci dan sheet 200ms. Dialog fade 160ms.
- Tombol saat ditekan bergeser 1px ke bawah. Panah di tautan baris bergeser 2px ke kanan saat hover.
- Tidak ada animasi gulir. Semua berhenti bila `prefers-reduced-motion: reduce`.

---

## 5. Kerangka Aplikasi

### 5.1 Struktur (shadcn dashboard-01, varian `inset`)

Desktop:

```
┌──────────────────────┬──────────────────────────────────────────────────────────┐
│ ▣ Kostra             │ ┌──────────────────────────────────────────────────────┐ │
│   Kost Melati Group  │ │ [≡] │ Beranda / Properti                               │ │ navbar 48px
│                      │ ├──────────────────────────────────────────────────────┤ │
│ RINGKASAN            │ │                                                      │ │
│ ⌂ Beranda            │ │  Properti                          [Tambah properti] │ │ header halaman
│                      │ │  2 properti                                          │ │
│ OPERASIONAL          │ │                                                      │ │
│ ▦ Properti        ◀  │ │  (isi halaman)                                       │ │
│ ▢ Kamar              │ │                                                      │ │ panel inset putih,
│ ☺ Tenant             │ │                                                      │ │ radius 12, garis 1px
│ ⎘ Tagihan            │ │                                                      │ │
│                      │ │                                                      │ │
│ PENGATURAN           │ │                                                      │ │
│ ⚇ Pengguna           │ │                                                      │ │
│                      │ │                                                      │ │
│ ┌──────────────────┐ │ │                                                      │ │
│ │ OA Owner A     ⋮ │ │ │                                                      │ │
│ │    Owner         │ │ │                                                      │ │
│ └──────────────────┘ │ └──────────────────────────────────────────────────────┘ │
└──────────────────────┴──────────────────────────────────────────────────────────┘
   sidebar 288px, latar halaman          celah 8px, panel konten putih
```

HP:

```
┌───────────────────────────────┐
│ [≡]  Properti                 │  navbar 56px, menempel di atas
├───────────────────────────────┤
│ Properti                      │
│ 2 properti     [+ Tambah]     │
│ (isi halaman)                 │
└───────────────────────────────┘
[≡] membuka laci sidebar dari kiri (lebar 288px, isi sama dengan sidebar desktop)
```

### 5.2 Sidebar

Komponen: `components/layout/app-sidebar.tsx` (dari `app-sidebar` template), memakai `components/ui/sidebar.tsx` dengan `collapsible="icon"` dan `variant="inset"`.

| Bagian | Isi |
| --- | --- |
| Atas (`SidebarHeader`) | Logo: kotak 32px `--sidebar-primary` berisi ikon gedung putih, lalu **Kostra** (14/600) dan nama organisasi (12, redup). Saat diciutkan, hanya kotak logo. |
| Tengah (`SidebarContent`) | Menu berkelompok. Label grup 12/500 redup, tanpa huruf kapital penuh di kode (kapital hanya di sketsa). Item: ikon 16px + teks 14px, tinggi 32px. Item aktif: latar `--sidebar-accent`, teks 500. Saat diciutkan, tooltip nama menu. |
| Bawah (`SidebarFooter`) | Menu pengguna (`nav-user`): avatar kotak 32px berisi inisial (tanpa foto), nama (14/500), peran (12, redup), ikon titik tiga. Membuka dropdown: nama dan username, **Akun**, garis, **Keluar**. |

Kelompok menu (disembunyikan sesuai peran. Menu bersyarat tampil bila minimal satu properti yang bisa diakses pengguna mengaktifkannya, BR-16):

| Grup | Menu (rute) | Tampil jika |
| --- | --- | --- |
| Ringkasan | Beranda (`/dashboard`) | Selalu |
| Operasional | Properti (`/properti`), Kamar (`/kamar`), Tenant (`/tenant`), Tagihan (`/tagihan`) | Kamar, Tenant, Tagihan mulai milestone masing-masing |
| | Listrik (`/listrik`) | Minimal satu properti yang bisa diakses mengaktifkan listrik dikelola aplikasi |
| | Asset (`/asset`), Maintenance (`/maintenance`), Pengeluaran (`/pengeluaran`) | Mulai milestone masing-masing |
| Laporan | Laporan (`/laporan`), Audit Log (`/audit-log`) | Audit Log owner saja |
| Pengaturan | Pengguna (`/pengguna`), Pengaturan (`/pengaturan`) | Pengguna owner saja |

Menu untuk fitur yang belum dibangun **tidak ditampilkan** (bukan dinonaktifkan). Akun dan Keluar ada di menu pengguna, bukan di daftar menu.

### 5.3 Navbar (site header)

Komponen: `components/layout/site-header.tsx` (dari `site-header` template).

| Posisi | Isi |
| --- | --- |
| Kiri | Tombol pemicu sidebar (ikon panel, 32px desktop, 44px HP), garis pemisah vertikal 16px, lalu breadcrumb: `Beranda / Properti` (14/500, item terakhir `--foreground`, sebelumnya redup dan bisa diklik). Di HP hanya nama halaman. |
| Kanan | Kosong di fase 1. Tidak ada pemilih properti: cakupan properti ditentukan di tiap halaman lewat filter (6.16). |

- Navbar berada di dalam panel inset, garis bawah 1px, menempel di atas saat halaman digulir.
- Navbar **tidak** memuat tombol aksi utama. Tombol aksi utama ada di header halaman (5.4), supaya tetap satu per layar.
- Pintasan keyboard bawaan shadcn: `Ctrl/Cmd + B` menciutkan sidebar.

### 5.4 Header halaman

Di bagian atas isi halaman, di bawah navbar:

```
Judul halaman (h1)                                  [Sekunder] [Utama]
Keterangan satu baris (redup, contoh: "2 properti")
```

- Maksimal satu tombol utama, dua tombol sekunder, dan menu "⋯" untuk sisanya. Aksi berbahaya selalu di menu "⋯".
- Di HP, tombol utama tetap di kanan judul (ringkas, misalnya "+ Tambah"), atau di bar tindakan bawah untuk form panjang.
- Breadcrumb di navbar menggantikan jejak di halaman detail.

### 5.5 Bar filter

Desktop, di bawah header halaman:

```
[🔍 Cari kamar atau nama…        ] [Properti: Semua ▾] [Periode: Nov 2026 ▾] [Status: Semua ▾]   Hapus filter
```

HP:

```
[🔍 Cari…                          ] [Filter (2)]
( Semua )( Belum bayar )( Terlambat )( Lunas )  → bisa digeser
```

Filter disimpan di URL (TECH-SPEC 6.3). Tombol "Filter" di HP membuka sheet bawah berisi semua filter, kecuali filter Properti yang tampil sebagai baris sendiri di bawah kolom cari (6.16). Halaman yang bercakupan properti memasang filter Properti sebagai kontrol pertama setelah kolom cari.

---

## 6. Spesifikasi Komponen

Komponen dasar dari shadcn di `components/ui`. Komponen gabungan di `components/shared`. Kerangka di `components/layout`.

### 6.1 Button

| Varian | Tampilan | Pemakaian |
| --- | --- | --- |
| `default` (utama) | Latar `--primary`, teks putih, hover `--primary-hover` | **Satu per layar** |
| `outline` | Latar `--card`, garis `--input`, hover `--muted` | Aksi kedua, Batal |
| `ghost` | Tanpa garis dan latar, hover `--muted` | Pemicu sidebar, aksi di toolbar |
| `destructive` | Latar `--destructive`, teks putih | Hanya di dialog konfirmasi |
| `link` | Teks `--primary`, garis bawah saat hover | Tautan dalam kalimat |

Label kata kerja + objek ("Tambah properti", "Tandai lunas"). Status `loading`: label "Menyimpan…", tombol nonaktif, lebar tetap. Tombol ikon wajib `aria-label`.

### 6.2 Input

Label di atas (14/500), kolom 44/40px, garis `--input`, radius 8, teks 16 di HP. Bantuan atau galat (13px) di bawah. Galat: garis `--danger`, `aria-invalid`, `aria-describedby`. Kolom tidak wajib diberi akhiran "(opsional)".

### 6.3 Select

≤7 pilihan: `<select>` native bergaya Input. Daftar panjang atau perlu cari: combobox (popover di desktop, sheet bawah di HP).

### 6.4 MoneyInput

Awalan "Rp" di dalam kolom, `inputmode="numeric"`, pemisah titik saat mengetik, menyimpan bilangan bulat rupiah (BR-12). Galat: "Nominal harus lebih dari 0."

### 6.5 PhotoInput

Kotak 4:3, dua tombol "Ambil foto" (`capture`) dan "Galeri" di HP, zona seret di desktop. Pratinjau dengan "Ganti" dan "Hapus". Galat ukuran (10 MB) dan format (JPG, PNG, WebP). Mode banyak foto untuk tiket: kelompok "Foto sebelum" dan "Foto sesudah".

### 6.6 DataTable

Berdasarkan `data-table` template, **tanpa** seret-urut (`@dnd-kit`) dan tanpa kolom centang baris kecuali untuk aksi massal (FR-TEN-10).

- **Desktop:** tabel di dalam kartu bergaris (radius 12). Header 40px, latar `--muted`, teks 13/500 redup. Baris 44px, garis bawah, hover `--muted`. Angka rata kanan `tabular-nums`. Aksi: satu tombol outline kecil + menu "⋯". Kaki: "Menampilkan 1–20 dari 134" dan tombol Sebelumnya/Berikutnya.
- **Tab di atas tabel** (pola template, misalnya "Semua · Belum bayar · Terlambat · Lunas"): boleh menggantikan chip filter status.
- **HP:** daftar kartu dalam satu kontainer bergaris, dipisah garis 1px, padding 16, tinggi minimal 72. "Muat lebih banyak" di akhir.
- Keadaan memuat (skeleton), kosong (EmptyState), galat (kotak galat dengan "Coba lagi").
- Paginasi, cari, filter di server (TECH-SPEC 6.3).

### 6.7 StatusBadge

Tinggi 24, padding 0 8, radius 6, teks 12 sampai 13/500, ikon 12. Komponen menerima `label` dan `tone` dari `lib/labels.ts`.

| Tone | Latar | Teks | Makna |
| --- | --- | --- | --- |
| `success` | `--success-soft` | `--success` | Selesai atau baik |
| `warning` | `--warning-soft` | `--warning` | Menunggu |
| `danger` | `--danger-soft` | `--danger` | Masalah |
| `info` | `--accent` | `--accent-foreground` | Aktif atau baru |
| `neutral` | `--muted` | `--muted-foreground` | Tidak aktif, atribut |

**Peta status PRD 6.3:**

| Objek | Nilai | Teks | Tone | Ikon |
| --- | --- | --- | --- | --- |
| Tagihan | `UNPAID` | Belum bayar | warning | `Clock` |
| Tagihan | `PAID` | Lunas | success | `CheckCircle2` |
| Tagihan | `VOID` | Dibatalkan | neutral | `Ban` |
| Tagihan (dihitung) | lewat jatuh tempo | Terlambat {n} hari | danger | `AlertCircle` |
| Kamar | `AVAILABLE` / `OCCUPIED` / `BROKEN` | Kosong / Terisi / Rusak | neutral / info / danger | `DoorOpen` / `User` / `Wrench` |
| Tenant | `ACTIVE` / `CHECKED_OUT` | Aktif / Sudah keluar | info / neutral | `User` / `LogOut` |
| Asset | `GOOD` / `DAMAGED` / `UNDER_REPAIR` | Baik / Rusak / Diperbaiki | success / danger / warning | |
| Tiket | `OPEN` / `IN_PROGRESS` / `DONE` / `CANCELLED` | Baru / Dikerjakan / Selesai / Dibatalkan | info / warning / success / neutral | |
| Tiket, jadwal (dihitung) | terlewat | Terlambat | danger | `AlertCircle` |
| Jadwal (dihitung) | ≤7 hari | Jatuh tempo {n} hari lagi | warning | `Clock` |
| Jenis tiket | `SCHEDULED` / `ACCIDENTAL` | Terjadwal / Kerusakan | neutral | |
| Penanggung listrik | `OWNER` / `TENANT_BILLED` / `TENANT_DIRECT` | Ditanggung pemilik / Ditagihkan ke tenant / Dibayar tenant sendiri | neutral | |
| Meteran | `ROOM` / `SHARED` / `FASUM` | Per kamar / Bersama / Fasum | neutral | |
| Sistem PLN | `PREPAID_TOKEN` / `POSTPAID` | Token / Pascabayar | neutral | |
| Meteran per periode | belum / sudah | Belum dicatat / Tercatat | warning / success | |
| Akun | aktif / nonaktif | Aktif / Nonaktif | info / neutral | |

Satu tagihan satu lencana: "Terlambat {n} hari" menggantikan "Belum bayar".

### 6.8 Dialog dan Sheet

Dialog desktop lebar 480 (maks 640), radius 12, garis, scrim hitam 40%, tanpa bayangan. Di HP menjadi sheet bawah (radius atas 12, maks 90dvh). Tombol: sekunder lalu utama (rata kanan di desktop, bertumpuk penuh lebar di HP, utama di atas). Maksimal 4 kolom isian.

### 6.9 Konfirmasi aksi berbahaya

| Tingkat | Contoh | Perilaku |
| --- | --- | --- |
| Ringan | Nonaktifkan meteran | Satu kalimat dampak, tombol bergaris merah |
| Berat | VOID tagihan, batalkan pembayaran, tenant keluar, nonaktifkan pengguna, reset sandi | Dampak dijabarkan, kolom alasan wajib untuk VOID dan batalkan pembayaran, tombol `destructive` solid, fokus awal ke "Batal" |
| Diblokir | Tenant keluar dengan tagihan belum lunas | Menampilkan daftar penghalang, tanpa tombol konfirmasi |

Reset sandi: kata sandi sementara tampil sekali (monospace, tombol "Salin", peringatan "hanya tampil sekali").

### 6.10 Toast

`sonner` (bawaan shadcn), latar `--popover`, garis, radius 8, tanpa bayangan. HP: bawah tengah. Desktop: kanan bawah. Berhasil 4 detik, galat 8 detik dengan tombol tutup. Bukan untuk galat validasi.

### 6.11 EmptyState

Ikon 32 garis redup (tanpa kotak), judul 16/600, satu kalimat, maksimal satu tombol. Varian: belum ada data, hasil filter kosong, tidak ada akses.

### 6.12 Skeleton

Blok `--muted`, radius 8, denyut opasitas 1,5 detik. Bentuk meniru isi akhir. Muncul bila memuat lebih dari 200ms.

### 6.13 Strip angka (`StatStrip`)

Satu panel bergaris, dibagi garis vertikal tipis. **Bukan** beberapa kartu terpisah. Tanpa ikon, tanpa gradasi, tanpa bayangan.

```
┌─────────────────────────┬─────────────────────────┐
│ Properti                │ Pengelola               │  label 14 redup
│ 2                       │ 1                       │  angka 30/600 tabular
│ Semua properti organisasi│ 1 aktif                │  keterangan 14 redup
└─────────────────────────┴─────────────────────────┘
```

- Panel: latar `--card`, garis 1px `--border`, radius 12. Sel: padding 24 horizontal, 20 vertikal.
- Pembagi: `divide-x` di ≥640px, `divide-y` di HP (sel disusun vertikal).
- Dua atau tiga sel per strip. Tambah sel baru di milestone berikutnya, bukan kartu baru.
- Sel boleh menjadi tautan ke halaman terkait. Hover latar `--muted` 60%, fokus cincin.
- Tidak ada teks pengisi. Keterangan hanya memuat fakta (contoh: "1 aktif"). Bila tidak ada data, tampilkan "–", bukan angka karangan.

### 6.18 Bagian pengaturan (`SettingsSection`)

Dipakai di halaman Akun. Judul dan penjelasan di kiri, isi di panel kanan. Di bawah 1024px bertumpuk: judul di atas, panel di bawahnya.

```
Profil                    ┌─────────────────────────────────────┐
Data akun Anda.           │ Nama          Owner A               │
Hubungi owner untuk       │ Username      @owner.a              │
mengubahnya.              │ Peran         Owner                 │
                          └─────────────────────────────────────┘

Kata sandi                ┌─────────────────────────────────────┐
Minimal 10 karakter.      │ Kata sandi sekarang  [          ]   │
Sesi lain keluar          │ Kata sandi baru      [          ]   │
otomatis.                 │ Ulangi               [          ]   │
                          ├─────────────────────────────────────┤
                          │                    [Simpan kata sandi]│  kaki panel, rata kanan
                          └─────────────────────────────────────┘
```

- Pemisah antarbagian: garis atas 1px `--border`, jarak 32.
- Baris label-nilai (profil): label 14 redup di kolom 8rem, nilai 14/500. Hanya baca.
- Kaki panel untuk tombol simpan: latar `--muted` 40%, tombol rata kanan. Lebar tombol `w-full` di HP, `auto` di ≥640px.
- Satu tombol utama per bagian. Bagian profil tidak punya tombol.

### 6.14 Grafik (dari `chart-area-interactive`, mulai M7)

Recharts lewat komponen chart shadcn. Area atau batang, seri `--chart-1` sampai `--chart-3`, kisi horizontal `--chart-grid`, tanpa gradasi isi area (isian area warna padat 15% opasitas), tanpa animasi masuk. Pilihan rentang waktu memakai `ToggleGroup` (desktop) atau `Select` (HP), seperti template. Setiap grafik punya padanan tabel.

### 6.15 Menu pengguna (`nav-user`)

Avatar kotak 32px, radius 8, latar `--muted`, inisial 12/600 (dua huruf pertama nama). Tanpa foto pengguna. Dropdown terbuka ke kanan di desktop, ke atas di HP. Isi: nama (14/500) dan `@username` (12 redup), garis, "Akun" (ikon `UserCog`), garis, "Keluar" (ikon `LogOut`).

### 6.16 Filter properti

Pengganti pemilih properti global (versi 0.8, PRD FR-PRO-02). Tidak ada properti aktif yang berlaku di semua halaman. Setiap halaman yang bercakupan properti punya filter sendiri.

- **Letak:** kontrol pertama setelah kolom cari di bar filter (5.5). Di Dashboard dan Laporan: di bawah header halaman. Di HP: satu baris penuh (44px) di bawah kolom cari, tidak di dalam sheet "Filter", karena paling sering dipakai.
- **Bentuk:** select native bergaya Input (6.3) dengan label "Properti" yang terlihat. Bila lebih dari 7 properti: combobox yang bisa dicari.
- **Pilihan:** "Semua properti" untuk owner, atau "Semua properti saya" untuk pengelola yang ditugaskan ke lebih dari satu properti. Lalu tiap properti aktif yang bisa diakses, berurut abjad. Properti nonaktif tidak muncul (FR-PRO-03).
- **Nilai awal "Semua", disimpan di URL** (`?properti=ID`). Halaman bisa dibagikan dan dimuat ulang, dan tombol kembali bekerja. Tidak ada cookie dan tidak ada ingatan antarhalaman.
- **Tidak ikut berpindah halaman.** Tautan sidebar tidak membawa filter. Tautan di dalam konten yang memang menuju satu properti (jumlah kamar di halaman Properti, properti di detail kamar) membawa `?properti=ID`.
- **Pengelola dengan satu properti:** filter tidak tampil. Nama propertinya ditulis di keterangan header halaman.
- **Header menulis cakupan:** keterangan header menyebut properti yang disaring ("Melati" atau "Semua properti"), supaya cakupan terbaca tanpa membuka filter.
- **Kolom Properti di daftar:** daftar yang bisa mencakup lebih dari satu properti (kamar, tenant, tagihan, asset, tiket, pengeluaran, meteran) menampilkan kolom Properti saat filter bernilai "Semua", sama seperti daftar kamar (6.19). Daftar asset juga menampilkan "Kamar" atau "Fasum" di kolom lokasi.
- **Halaman tanpa filter:** Properti, Pengguna, Pengaturan, Akun, dan Audit log (halaman ini punya filter properti sendiri di bar filternya).
- **Formulir tidak bergantung pada filter.** Form pembuatan selalu menanyakan properti secara eksplisit (6.22). Filter hanya memberi nilai awal lewat `?properti=ID`.
- **Menu bersyarat (BR-16):** menu Listrik tampil bila minimal satu properti yang bisa diakses mengaktifkan listrik dikelola. Asset dan Maintenance selalu tampil, dengan bagian fasum hanya untuk properti yang punya fasum. Di halaman bersyarat, filter hanya menawarkan properti yang mengaktifkannya.

### 6.17 Halaman login (`login-02`)

```
Desktop (≥1024px)
┌──────────────────────────────────────────┬──────────────────────────────────────────┐
│ ▣ Kostra                                 │ ┌──────────────────────────────────────┐ │
│                                          │ │                                      │ │
│                                          │ │            (foto, object-cover)      │ │
│          Masuk ke Kostra                 │ │                                      │ │
│          Kelola properti dan pengelola   │ │                                      │ │
│          kost Anda.                      │ │                                      │ │
│                                          │ │                                      │ │
│          Username                        │ │                                      │ │
│          [                    ]          │ │                                      │ │
│          Kata sandi                      │ │                                      │ │
│          [                    ]          │ │                                      │ │
│          [         Masuk          ]      │ │                                      │ │
│                                          │ │                                      │ │
│          Akun dibuat oleh owner.         │ └──────────────────────────────────────┘ │
│                                          │  Foto: Irene van der Poel, CC0           │
└──────────────────────────────────────────┴──────────────────────────────────────────┘
```

- Kolom kiri: logo di kiri atas, formulir rata tengah vertikal, lebar maksimal 360px.
- Kolom kanan (≥1024px saja): foto `public/images/photo-m61880133*.webp` (bangku jendela, bantal, lampu; CC0 via Wikimedia Commons) dengan `object-cover`, radius 12, celah 8px dari tepi layar, **tanpa teks di atas foto**, tanpa lapisan warna. Kredit satu baris 12px redup di bawah foto.
- HP dan tablet: hanya kolom formulir, foto tidak dimuat (`sizes` dan `hidden` di <1024px).
- Foto memakai `next/image` dengan `priority` di desktop, `alt=""` karena dekoratif (kredit tetap ditulis).
- Foto ini **stand-in**: bukan foto kost klien. Bila klien punya foto sendiri (kamar atau bangunan), ganti file yang sama.

---

### 6.19 Daftar kamar (`/kamar`)

- Judul "Kamar". Keterangan memuat cakupan (6.16): nama properti yang disaring, atau "Semua properti". Tombol "Tambah kamar" (utama) selalu tampil, dan properti dipilih di form (6.20). Bila filter menunjuk satu properti, tautannya membawa `?properti=ID`.
- Bar filter (5.5): kolom "Cari kode kamar…", filter Properti (6.16), pilihan status "Semua status / Kosong / Terisi / Rusak", dan "Hapus filter" (hantu) saat ada filter. Cari, properti, status, dan halaman disimpan di URL (`q`, `properti`, `status`, `page`) dan dijalankan di server. Daftar diurutkan menurut properti lalu kode.
- Kolom tabel: Kode (tautan ke halaman kamar), Properti (hanya saat lebih dari satu properti tercakup, yaitu filter "Semua"), Tipe (kosong ditulis "—"), Harga sewa (rata kanan, `tabular-nums`), Status (`StatusBadge`).
- HP: satu kartu per kamar. Baris pertama kode dan status, baris kedua properti (tebal, hanya bila lebih dari satu properti tercakup) dan tipe (redup), baris ketiga harga dengan "/ bulan". Tidak ada gulir samping.
- Kosong: "Belum ada kamar" dengan satu kalimat. Hasil filter kosong: "Tidak ada data yang cocok" dengan tombol "Hapus filter".

### 6.20 Form kamar dan pengaturan properti

**Form kamar** memakai halaman penuh karena isiannya lebih dari 4 kolom (1.3). Isian berada di satu kartu: dua kolom di desktop, satu kolom di HP.
- Urutan: Properti (select wajib, nilai awal dari `?properti=ID`, baca-saja bila pengguna hanya punya satu properti dan saat ubah), Kode kamar (bantuan: unik di dalam properti yang dipilih, huruf besar dan kecil dianggap sama), Tipe kamar, Harga sewa per bulan (`MoneyInput`), Status, Fasilitas kamar, Catatan.
- Status hanya Kosong dan Rusak yang bisa dipilih. Terisi tampil sebagai keterangan saja dan diatur otomatis saat ada penghuni (M2).
- Tombol: "Batal" (garis) dan "Simpan kamar" atau "Simpan perubahan" (utama, satu per layar). Hapus kamar tidak ada di form. Aksi hapus ada di menu ⋯ halaman detail (6.21).

**Pengaturan properti** tampil di dialog. Isian: nama, alamat, pola listrik, dan catatan (empat kolom, sesuai batas 6.8). Dua sakelar: "Ada fasum" dan "Listrik dikelola aplikasi".
- Keterangan pola ditampilkan di bawah pilihan pola (teks dari `lib/labels.ts`, sesuai Lampiran C PRD).
- Sakelar listrik tidak berubah sendiri saat pola diganti. Aturan "pola A tidak dikelola aplikasi, B sampai E dikelola aplikasi" hanya ada di server. Kombinasi yang tidak cocok ditolak dengan galat "Pola listrik tidak sesuai dengan pengaturan listrik dikelola."
- Nonaktifkan dan aktifkan properti memakai konfirmasi ringan (6.9): satu kalimat dampak, tombol nonaktifkan bergaris merah.
- Daftar properti menampilkan lencana pengaturan: "Ada fasum" atau "Tanpa fasum", "Listrik dikelola" atau "Listrik tidak dikelola", pola ("Pola A" sampai "Pola E"), dan "Nonaktif" bila berlaku. Lencana memakai nada `neutral`.

**Sakelar** (`Switch`, dari paket `radix-ui` yang sudah ada): trek 40×24, tertutup `--input`, terbuka `--primary`, bulatan `--card`. Di HP, seluruh baris berlabel menjadi area sentuh minimal 44px.

---

### 6.21 Halaman detail kamar (`/kamar/[id]`)

Disetujui (versi 0.6, lihat 11.1). Polanya sama dengan detail tenant (7.3): halaman baca, dengan tombol ubah dan menu aksi di header. Di M1 halaman ini hanya memuat data kamar. Bagian lain muncul di milestone masing-masing.

**Header** (5.4):
- Judul h1 "Kamar A-07". Keterangan satu baris berisi nama properti, misalnya "Properti Melati". Judul tanpa lencana, karena status sudah ada di strip.
- Aksi: "Ubah data" (tombol garis, menuju `/kamar/[id]/ubah`) dan menu ⋯ (ikon, 32px desktop, 44px HP, `aria-label` "Aksi kamar").
- Menu ⋯ hanya berisi "Hapus kamar" dengan teks merah.
- Tidak ada tombol utama di halaman ini.

**Strip angka** (6.13), di bawah header:
- Di M1 dua sel:
  - "Harga sewa per bulan": nilai rupiah, keterangan "Harga dasar kamar".
  - "Status": nilai berupa lencana status (6.7), bukan angka. Keterangan "Diatur di form ubah" untuk Kosong dan Rusak, dan "Diatur otomatis" untuk Terisi.
- Sel baru ditambahkan saat fiturnya ada: "Penyewa" (M2). Bila data belum ada, tampilkan "–".

**Bagian** (6.18, judul di kiri, panel di kanan), urutannya tetap:
1. **Data kamar** (M1). Baris label-nilai: Properti (tautan ke `/kamar?properti=ID`), Tipe kamar, Fasilitas kamar, Catatan. Kosong ditulis "–". Kode dan harga tidak diulang karena sudah ada di judul dan strip.
2. **Penyewa aktif** (M2, FR-ROOM-07). Nama, kontak, tanggal masuk, dan tautan ke detail tenant (7.3). Kamar kosong cukup satu kalimat, misalnya "Kamar ini sedang kosong.", tanpa tombol.
3. **Riwayat meteran** (M4). Hanya tampil bila listrik properti dikelola (BR-16, FR-PRO-05). Berisi meteran yang melayani kamar dan angka terakhir.
4. **Asset kamar** dan **Tiket maintenance** (M5). Baris bergaris. Setiap asset menampilkan kondisi (6.7), setiap tiket menampilkan statusnya (6.7).

Aturan bagian:
- Bagian yang fiturnya belum ada tidak ditampilkan, tanpa kerangka kosong (1.2, tidak ada teks pengisi).
- Bagian baca saja tidak punya tombol simpan (6.18).
- Bagian tanpa data memakai satu kalimat (6.11) dan paling banyak satu tombol.

**Hapus kamar** (6.9, tingkat berat):
- Dialog berjudul "Hapus kamar A-07?". Dampak: "Kamar hilang dari daftar. Kodenya bisa dipakai lagi nanti." Tombol merah solid. Fokus awal ke "Batal".
- Bila kamar masih punya penyewa aktif (M2 ke atas), dialog diblokir: tampilkan "Kamar masih ditempati {nama penyewa}. Keluarkan penyewa dulu." dan tanpa tombol konfirmasi (FR-ROOM-06).

**Keadaan**:
- Memuat: kerangka (6.12) berbentuk strip dan dua baris bagian.
- Kamar tidak ditemukan (galat ROOM_NOT_FOUND): judul "Kamar tidak ditemukan" dan tombol "Kembali ke daftar" (garis).
- Galat lain: kotak galat dengan "Coba lagi" (6.6).

**Navigasi**: breadcrumb navbar `Beranda / Kamar`, sama seperti halaman kamar lain (5.3). Breadcrumb dibentuk dari alamat halaman dan tidak mengambil data, jadi kode kamar tampil di judul halaman, bukan di breadcrumb. Di HP hanya "Kamar".

**Halaman ubah** (`/kamar/[id]/ubah`), memakai form 6.20:
- Judul "Ubah kamar A-07", keterangan nama properti.
- Tombol "Batal" (garis, kembali ke detail) dan "Simpan perubahan" (utama, satu-satunya di halaman).
- Setelah disimpan, kembali ke halaman detail dengan data terbaru.
- Breadcrumb `Beranda / Kamar / A-07 / Ubah`.

**Tambah kamar**: setelah disimpan, pindah ke halaman detail kamar baru.

---

### 6.22 Kamar dan propertinya (0.8)

Keputusan pemilik produk: cakupan properti ditentukan per halaman (PRD FR-PRO-02, 6.16), bukan lewat pemilih global. Bagian ini menyesuaikan tampilan kamar dengan keputusan itu.

**Masalah yang diselesaikan**
- Setiap kamar milik tepat satu properti (di database `property_id` wajib), tetapi tampilan lama lemah menyatakannya: properti hanya tertulis kecil di bawah judul, form tambah kamar tidak menyebut properti, dan tombol "Tambah kamar" hilang saat "Semua properti".
- Kode kamar hanya unik di dalam satu properti ("A-01" boleh ada di Melati dan Mawar). Kode saja tidak cukup untuk mengenali kamar.
- Pemilih global memaksakan satu cakupan ke semua halaman, termasuk halaman yang tidak memakainya.

**Prinsip**
1. Identitas kamar adalah properti + kode. Di tempat mana pun properti tidak jelas dari halamannya, properti ikut ditulis.
2. Cakupan properti ditentukan oleh filter di halaman itu sendiri, bukan oleh pilihan di tempat lain.
3. Tidak ada pilihan tersembunyi: properti tempat kamar dibuat selalu terlihat dan dipilih di form.

**Aturan**
1. **Daftar kamar**: filter Properti di bar filter (6.16). Saat "Semua", kolom Properti tampil dan daftar diurutkan properti lalu kode. Di HP properti jadi baris kedua yang tebal (14/500), tipe redup di sampingnya. Saat satu properti, tidak ada kolom Properti, dan keterangan header memakai ikon `Building2` 16 redup di depan nama properti. "Tambah kamar" selalu tampil. Bila filter menunjuk satu properti, tautannya `/kamar/baru?properti=ID`.
2. **Form tambah kamar**: kolom pertama "Properti" (select native, wajib). Nilai awal dari `?properti=ID`, bila tidak ada kosong dengan teks "Pilih properti". Isinya properti aktif yang bisa diakses pengguna (FR-PRO-03). Pengelola dengan satu properti melihat baris baca-saja "Properti Melati". Bantuan kolom kode: "Unik di dalam properti yang dipilih."
3. **Form ubah kamar**: properti tampil sebagai baris baca-saja di atas isian, dengan bantuan "Kamar tidak bisa dipindah ke properti lain." Pemindahan kamar tidak masuk fase 1.
4. **Detail kamar**: "Properti" menjadi baris pertama bagian Data kamar, nilainya tautan ke `/kamar?properti=ID`. Navbar tidak punya pemilih, jadi tidak ada konteks yang bisa bertentangan dengan halaman.
5. **Halaman Properti**: setiap baris memuat satu baris fakta, misalnya "10 kamar · 3 kosong · 1 rusak", sebagai tautan ke `/kamar?properti=ID`. Aksi baris: "Ubah" (garis) dan menu ⋯ berisi "Tambah kamar" (menuju `/kamar/baru?properti=ID`) dan "Nonaktifkan" (merah). Properti nonaktif tidak punya "Tambah kamar". Angka dihitung server (AGENTS aturan 6), bukan di layar.
6. **Pengelola dengan banyak properti**: filter "Semua properti saya" di halaman daftar (6.16, FR-PRO-06). Tambah dan ubah tetap per satu properti. Harus memilih ulang filter di tiap halaman diterima untuk fase 1 (lihat 11.2 butir 5).

---

## 7. Sketsa Teks Layar

Semua layar memakai kerangka bagian 5 (sidebar + navbar di desktop, laci di HP). Sketsa hanya menggambar isi panel inset.

### 7.1 Beranda owner

Desktop:
```
[≡] │ Beranda
──────────────────────────────────────────────────────────────────────────────────
Selamat pagi, Owner A
Ringkasan November 2026                                       [Properti: Semua ▾]

┌ Sudah masuk ──────┐┌ Belum masuk ──────┐┌ Terlambat ────────┐┌ Kamar terisi ────┐
│ Rp 18.750.000     ││ Rp 5.000.000      ││ Rp 2.500.000      ││ 22 / 25          │
│ 15 dari 19 lunas  ││ 4 tagihan         ││ 2 tagihan         ││ 3 kosong         │
└───────────────────┘└───────────────────┘└───────────────────┘└──────────────────┘
┌ Pemasukan 6 bulan (grafik area)                     [3 bulan|6 bulan|12 bulan] ┐
└────────────────────────────────────────────────────────────────────────────────┘
[ Tunggakan | Jatuh tempo 7 hari | Maintenance ]                     ← tab tabel
┌────────────────────────────────────────────────────────────────────────────────┐
│ Kamar  Tenant          Jatuh tempo   Nominal        Status                     │
│ A-03   Budi Santoso    5 Nov 2026    Rp 1.250.000   Terlambat 1 hari           │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Beranda M0** (sebelum modul tagihan ada): sapaan, kartu angka hanya untuk data yang ada (jumlah properti, jumlah pengelola untuk owner), dan daftar jalan pintas ke halaman yang sudah dibangun, berupa baris bergaris dengan ikon tanpa kotak dan panah di kanan. Tanpa grafik dan tanpa angka contoh.

HP: kartu bertumpuk satu kolom, grafik penuh lebar, tab tabel menjadi daftar kartu.

### 7.2 Daftar tagihan

```
[≡] │ Beranda / Tagihan
──────────────────────────────────────────────────────────────────────────
Tagihan                                            (P)[Buat tagihan bulan ini]
24 tagihan · November 2026
[ Semua | Belum bayar | Terlambat | Lunas ] [🔍 Cari…] [Properti: Melati ▾] [Periode ▾]
┌────────────────────────────────────────────────────────────────────────┐
│ Kamar  Tenant          Jatuh tempo  Nominal        Status        Aksi  │
│ A-03   Budi Santoso    5 Nov 2026   Rp 1.250.000   Terlambat…  [Tandai lunas] ⋯ │
└────────────────────────────────────────────────────────────────────────┘
Menampilkan 1–20 dari 24                          [Sebelumnya] [Berikutnya]
```
HP: navbar `[≡] Tagihan`, judul + "+ Buat", filter Properti sebagai baris penuh di bawah kolom cari, tab bisa digeser, daftar kartu dengan tombol "Tandai lunas" 44px.

### 7.3 Detail tenant

```
[≡] │ Beranda / Tenant / Budi Santoso
─────────────────────────────────────────────────────────────────────────────
Budi Santoso   Aktif                                (P)[Ubah data]  ⋯
Kamar A-03 · Masuk 5 Okt 2025 · Tagihan tiap tanggal 5
[ Profil | Tagihan | Kendaraan dan elektronik | Listrik ]
(isi tab dalam kartu bergaris)
```
"Tenant keluar" di menu ⋯ (merah). NIK tersamar dengan tombol "Tampilkan".

### 7.4 Tiket maintenance dengan foto

Form baru di HP: halaman penuh, judul, asset/kamar, deskripsi, foto sebelum (wajib), bar tindakan bawah "Simpan tiket". Detail di desktop: dua kartu berdampingan "Foto sebelum" dan "Foto sesudah", tombol utama "Selesaikan tiket" di header halaman.

### 7.5 Catat meteran listrik

Desktop: tabel dengan isian angka langsung, simpan per baris dengan Enter. HP: daftar meteran dengan status, ketuk membuka sheet berisi angka sebelumnya, isian angka sekarang (24px), pemakaian otomatis, foto opsional, "Simpan dan berikutnya".

### 7.6 Login

Lihat 6.17.

---

### 7.7 Detail kamar

Desktop:
```
[≡] │ Beranda / Kamar
──────────────────────────────────────────────────────────────────────────────
A-07                                                     [Ubah data]    ⋯
Properti Melati
┌──────────────────────────────┬──────────────────────────────┐
│ Harga sewa per bulan         │ Status                       │
│ Rp 1.250.000                 │ [Rusak]                      │
│ Harga dasar kamar            │ Diatur di form ubah          │
└──────────────────────────────┴──────────────────────────────┘

Data kamar                     ┌──────────────────────────────────────────┐
Diisi di form ubah.            │ Tipe kamar     AC                        │
                               │ Fasilitas      Kipas angin, kamar mandi  │
                               │ Catatan        –                         │
                               └──────────────────────────────────────────┘

(Penyewa aktif, riwayat meteran, asset dan tiket tampil di sini saat fiturnya ada.)
```

HP: judul dan aksi di dua baris, strip bertumpuk (divide-y), bagian satu kolom, label di atas nilai.

---

### 7.8 Kamar dan properti (0.8)

Daftar kamar, filter Properti "Semua" (owner, atau pengelola dengan banyak properti):
```
[≡] │ Beranda / Kamar
────────────────────────────────────────────────────────────────────────────────
Kamar                                                            [Tambah kamar]
Semua properti
[Cari kode kamar…         ] [Properti: Semua ▾] [Semua status ▾]
┌────────────────────────────────────────────────────────────────────────────┐
│ Kode    Properti   Tipe                     Harga sewa       Status        │
│ A-01    Mawar      AC                       Rp 900.000       Kosong        │
│ A-01    Melati     Standar                  Rp 1.000.000     Kosong        │
│ A-02    Melati     Standar                  Rp 1.100.000     Kosong        │
└────────────────────────────────────────────────────────────────────────────┘
```

Daftar kamar, pengelola dengan satu properti (tanpa filter Properti dan tanpa kolom Properti):
```
Kamar                                                            [Tambah kamar]
Melati
[Cari kode kamar…         ] [Semua status ▾]
```

Form tambah kamar (properti dipilih di form):
```
Tambah kamar
┌────────────────────────────────────────────────────────────────────────────┐
│ Properti                [Pilih properti                                  ▾] │
│ Kode kamar              [                ]    Tipe kamar     [             ] │
│ Unik di dalam properti yang dipilih.                                        │
│ Harga sewa per bulan    [Rp              ]    Status         [Kosong     ▾] │
│ Fasilitas kamar         [                                                 ] │
│ Catatan                 [                                                 ] │
└────────────────────────────────────────────────────────────────────────────┘
                                                      [Batal] [Simpan kamar]
```

Baris di halaman Properti:
```
Melati                                                          [Ubah]    ⋯
Jl. Contoh No. 1, Jakarta Selatan                                    ┌ Tambah kamar
[Ada fasum] [Listrik dikelola] [Pola C]                              └ Nonaktifkan
11 kamar · 10 kosong · 1 rusak  →
```

HP: filter Properti tampil sebagai baris penuh di bawah kolom cari. Kartu kamar saat "Semua" menulis properti tebal di baris kedua.

---

## 8. Gaya Bahasa dan Format

### 8.1 Nada

Sopan, singkat, langsung. Tanpa tanda seru, emoji, atau bahasa gaul. Tombol kata kerja + objek. Judul kata benda. Istilah tetap: Tenant, Kamar, Tagihan, Pengelola, Owner, Properti, Fasum, Asset, Meteran, Lunas, Belum bayar, Terlambat, Tiket.

Sapaan Beranda mengikuti jam WIB: "Selamat pagi" (04.00–10.59), "Selamat siang" (11.00–14.59), "Selamat sore" (15.00–17.59), "Selamat malam" (18.00–03.59).

### 8.2 Format

| Jenis | Format | Contoh |
| --- | --- | --- |
| Rupiah | `Rp` + spasi tak terputus + titik ribuan | `Rp 1.250.000` |
| Tanggal | `d MMM yyyy` | `6 Nov 2026` |
| Tanggal panjang | `d MMMM yyyy` | `6 November 2026` |
| Periode | `MMM yyyy` / `MMMM yyyy` | `Nov 2026` |
| Jam | `HH.mm` WIB | `14.30 WIB` |
| kWh | titik ribuan + `kWh` | `1.204 kWh` |
| Telepon | `+62 812-3456-7890` | |
| NIK di daftar | `•••• •••• •••• 3456` | |

Semua format dari `lib/format.ts` (date-fns + `@date-fns/tz`, Asia/Jakarta).

### 8.3 Contoh teks

| Situasi | Teks |
| --- | --- |
| Login gagal | "Username atau kata sandi salah." |
| Terlalu banyak percobaan | "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." |
| Sesi habis | "Sesi Anda berakhir. Masuk lagi untuk melanjutkan." |
| Tanpa izin | "Anda tidak punya akses untuk tindakan ini." |
| Jaringan | "Tidak dapat terhubung. Periksa koneksi internet Anda, lalu coba lagi." |
| Belum ada properti (owner) | "Belum ada properti" · "Tambahkan properti pertama Anda." · [Tambah properti] |
| Belum ada tagihan | "Belum ada tagihan" · "Tagihan dibuat otomatis 7 hari sebelum jatuh tempo tenant." |
| Hasil filter kosong | "Tidak ada data yang cocok" · [Hapus filter] |
| Berhasil (toast) | "Properti Melati disimpan." · "Tagihan Kamar A-03 ditandai lunas." |

---

## 9. Aksesibilitas

Sasaran **WCAG 2.2 AA**.

- Kontras sesuai 2.2. Token baru wajib dihitung sebelum dipakai.
- Status = ikon + teks. Galat = ikon + teks + garis merah.
- Fokus terlihat (cincin 2px `--ring`) di semua elemen, termasuk item sidebar dan pemicu sidebar.
- Papan ketik penuh. Sidebar: `Ctrl/Cmd + B`, item menu bisa dijangkau Tab, laci HP mengunci fokus dan kembali ke tombol pemicu saat ditutup. Tautan "Lewati ke konten" di awal halaman menuju panel inset.
- Target sentuh ≥44px di HP, termasuk pemicu sidebar dan item laci.
- `nav` sidebar berlabel "Menu utama", breadcrumb berlabel "Lokasi halaman", item aktif `aria-current="page"`.
- Saat sidebar diciutkan, setiap ikon punya `aria-label` dan tooltip nama menu.
- Label terlihat untuk setiap kolom. Galat terhubung `aria-describedby`.
- Foto login `alt=""` (dekoratif), kredit sebagai teks biasa.
- `prefers-reduced-motion` mematikan animasi sidebar, laci, dan skeleton.
- Zoom 200% dan lebar 320px tanpa gulir samping.

---

## 10. Cara Menerapkan di Kode

### 10.1 Letak berkas

| Hal | Letak |
| --- | --- |
| Token, huruf, `.num` | `app/globals.css` |
| Huruf Plus Jakarta Sans, `lang="id"` | `app/layout.tsx` |
| Komponen shadcn (sidebar, breadcrumb, separator, avatar, dropdown-menu, sheet, tooltip, card, badge, skeleton, button, input, label, dialog, checkbox) | `components/ui/` |
| Kerangka: `AppSidebar`, `NavMain`, `NavUser`, `SiteHeader`, `PropertySwitcher` | `components/layout/` |
| Gabungan: `StatCard`, `StatusBadge`, `EmptyState`, `PageHeader`, `DataTable`, `MoneyInput`, `PhotoInput`, `Wordmark` | `components/shared/` |
| Layout area berlogin (`SidebarProvider` + `AppSidebar` + `SidebarInset` + `SiteHeader`) | `app/(contents)/layout.tsx` |
| Halaman login dua kolom | `app/login/page.tsx` + `app/login/_components/` |
| Foto login dan kredit | `public/images/` (`credits.json` menyimpan sumber dan lisensi) |
| Peta status, label, galat, format | `lib/labels.ts`, `lib/errors.ts`, `lib/format.ts` |

### 10.2 Menyalin block shadcn

1. `npx shadcn@4.21.5 add dashboard-01 login-02` (versi CLI dipin). Block ditulis ke `app/dashboard/` dan `components/`; pindahkan ke letak di 10.1.
2. **Wajib dibersihkan saat menyalin:**
   - impor paket `cn` diganti `@/lib/utils` (paket `cn` tidak dipakai);
   - kelas `shadow-*`, `bg-gradient-*`, dan bayangan `SidebarInset` dihapus;
   - `data.json`, teks contoh ("Acme Inc.", "Documents"), dan data dummy dihapus;
   - `chart-area-interactive` dan `data-table` tidak dipasang sebelum ada datanya (M7 dan M1+);
   - dependensi `@dnd-kit/*` **tidak** dipasang. `@tanstack/react-table` dipasang saat DataTable pertama dibuat (sudah di TECH-SPEC).
3. Komponen template boleh diubah bebas. Bila diubah, ikuti dokumen ini, bukan bentuk aslinya.

### 10.3 Token di `app/globals.css`

Token bagian 2.1 ditulis sebagai variabel `:root` dan dipetakan di `@theme inline` (Tailwind v4). Tambahan dari 0.1: `--sidebar` sama dengan `--background`, `--sidebar-accent: #EEEDEB`, `--sidebar-primary`, `--sidebar-primary-foreground`, dan `--font-sans: var(--font-jakarta)`.

### 10.4 Pedoman untuk agen pengodean

1. Pakai komponen di `components/ui`, `components/layout`, dan `components/shared`. Jangan membuat kerangka atau kartu ad hoc.
2. Hanya kelas warna token. Tidak ada `#hex`, `bg-blue-*`, `shadow-*`, `bg-gradient-*`.
3. Satu halaman = satu header halaman dengan paling banyak satu tombol `primary`.
4. Menu sidebar hanya untuk halaman yang sudah ada.
5. Semua daftar memakai DataTable dengan keadaan memuat, kosong, dan galat.
6. Uji di lebar 375 (HP), 820 (tablet), dan 1440 (desktop) sebelum menyatakan UI selesai.

### 10.5 Daftar periksa tinjauan UI

- [ ] Tidak ada bayangan, gradasi, ikon di kotak warna (kecuali logo), emoji
- [ ] Teks contoh template sudah hilang semua
- [ ] Satu tombol aksen per layar, tidak di navbar
- [ ] Warna status hanya untuk status, status ada teks + ikon
- [ ] Sidebar bisa diciutkan, laci HP berfungsi, target sentuh ≥44px di HP
- [ ] Tidak ada angka atau grafik karangan
- [ ] Format `Rp 1.250.000` dan `6 Nov 2026` dari `lib/format.ts`
- [ ] Fokus terlihat dan bisa dioperasikan papan ketik

---

## 11. Keputusan

### 11.1 Sudah diputuskan (versi 0.2)

| Hal | Keputusan |
| --- | --- |
| Nama produk | Kostra |
| Template | shadcn/ui Blocks `dashboard-01` dan `login-02`, disesuaikan |
| Navigasi HP | Laci sidebar saja, tanpa bilah bawah |
| Huruf | Plus Jakarta Sans |
| Foto login | Foto bebas pakai berlisensi (CC0), dengan kredit, sebagai stand-in sampai ada foto kost sendiri |
| Form kamar (0.4) | Halaman penuh, bukan dialog, karena lebih dari 4 kolom (1.3) |
| Sakelar (0.4) | Komponen `Switch` dari `radix-ui` yang sudah terpasang. Tidak ada paket baru |
| Pola listrik fase 1 (0.6) | Hanya pola A sampai E (Lampiran C, BR-17). Pilihan "Lainnya" dihapus. Data lama dengan pola CUSTOM tampil, tetapi harus dipilih ulang |
| Keterangan pola (0.6) | Ditulis dalam bahasa awam, satu kalimat per pola: siapa yang membayar PLN dan apakah ditagihkan ke penyewa (6.20) |
| Harga sewa (0.6) | Harus lebih dari 0, sesuai 6.4. Harga 0 ditolak |
| Detail dan ubah kamar (0.6) | Dipisah: `/kamar/[id]` untuk baca, `/kamar/[id]/ubah` untuk form. Hapus kamar di menu ⋯ halaman detail (6.21) |
| Cakupan properti per halaman (0.8) | Filter properti di tiap halaman bercakupan properti, tersimpan di URL, bernilai awal "Semua". Tidak ada pemilih global di navbar. PRD FR-PRO-02 diubah (6.16) |
| Pengelola banyak properti (0.8) | "Semua properti saya" di halaman daftar. Tambah dan ubah tetap per satu properti. Asumsi di PRD FR-PRO-06 |

### 11.2 Masih terbuka

1. **Format tanggal di layar:** `6 Nov 2026` (dokumen ini) atau `dd/mm/yyyy` (PRD bagian 8). Perlu satu sumber.
2. **Istilah baku:** "Tenant" atau "Penghuni", "Owner" atau "Pemilik".
3. **Huruf ekspor PDF:** TECH-SPEC 7.4 menyebut Inter. Agar seragam, sebaiknya Plus Jakarta Sans. Perubahan ini di TECH-SPEC, bukan di sini.
4. **Foto kost sendiri** untuk menggantikan foto stand-in di login (kamar, jendela, atau bangunan, orientasi potret).
5. **Ingat pilihan filter properti per halaman** (0.8): sekarang filter selalu mulai dari "Semua" di setiap halaman. Bila pengelola banyak properti mengeluh harus memilih ulang, tambahkan ingatan pilihan terakhir per halaman di perangkat (bukan global).
