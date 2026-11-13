# Panduan Manajemen Artikel Sepatu Brotrher Boots

Kini setiap artikel sepatu dipisah rapi menjadi **1 file per 1 artikel** di dalam folder `src/data/products/`.

---

## 📁 Struktur File
```
src/data/products/
├── _template.ts             <-- Template contoh untuk artikel baru
├── index.ts                 <-- Daftar pusat yang menggabungkan semua artikel
├── douglas.ts               <-- Artikel Douglas Full Kulit
├── deville.ts               <-- Artikel Deville
├── fitgo-mamba-pm-tni.ts    <-- Artikel Fitgo Mamba PM / TNI
├── pdh-sus.ts               <-- Artikel PDH SUS Kowad & Polwan
└── ...                      <-- Artikel sepatu lainnya
```

---

## ✏️ Cara Mengedit Artikel yang Sudah Ada
1. Cari nama file sepatu di dalam folder `src/data/products/` (misalnya: `douglas.ts` atau `new-mamba.ts`).
2. Buka filenya, Anda bisa langsung mengubah:
   - `name`: Nama sepatu
   - `price`: Harga jual
   - `originalPrice`: Harga coret
   - `tagline`: Deskripsi singkat
   - `image`: Path foto produk
   - `categories`: Kategori (`pdl`, `pdh`, `tali-putar`, `tali-biasa`, `full-kulit`)
   - `specs`: Spesifikasi bahan, sol, resleting, jahitan
3. Simpan file. Perubahan langsung otomatis tampil di web.

---

## ➕ Cara Menambah Artikel Baru
1. Duplikat file `_template.ts`, beri nama file baru Anda (contoh: `ranger-tactical.ts`).
2. Isi data spesifikasi dan harga sepatu pada file baru tersebut.
3. Buka file `src/data/products/index.ts`:
   - Tambahkan baris import di atas:
     ```ts
     import rangerTactical from './ranger-tactical';
     ```
   - Masukkan nama variabelnya ke dalam array `PRODUCTS`:
     ```ts
     export const PRODUCTS: Product[] = [
       rangerTactical, // <-- artikel baru Anda
       pdhSus,
       fitgoLantas6inch,
       ...
     ];
     ```
4. Selesai! Artikel baru otomatis langsung muncul di katalog, lengkap dengan filter kategori dan pagination responsif.
