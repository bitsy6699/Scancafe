# ☕ ScanCafe - Digital Cafe Ordering & Management System

ScanCafe adalah sistem manajemen cafe modern yang memungkinkan pelanggan memesan menu melalui scan QR Code di meja, serta memberikan kendali penuh bagi pegawai untuk mengelola operasional cafe.

## 🚀 Fitur Utama

### 📱 Untuk Pelanggan (Public)
- **Menu Digital**: Lihat daftar menu yang tersedia (Minuman, Makanan, Snack).
- **QR Table Detection**: Otomatis mendeteksi nomor meja dari URL QR.
- **Keranjang Belanja**: Tambah, kurang, atau hapus item sebelum checkout.
- **Multi-Payment**:
  - **Bayar Online**: Simulasi integrasi payment gateway (Transfer/QRIS).
  - **Bayar Cash**: Pesanan dibuat dan menunggu konfirmasi kasir.
- **Order Tracking**: Lacak status pesanan secara real-time (Diproses → Siap → Selesai).

### 💼 Untuk Pegawai (Dashboard)
- **Dashboard Summary**: Pantau pendapatan harian, jumlah pesanan, dan stok kritis.
- **Manajemen Pesanan**: Update status pesanan dan konfirmasi pembayaran cash.
- **Manajemen Menu**: CRUD menu dengan dukungan upload gambar dan kategori.
- **Manajemen Stok**: Pantau bahan baku dengan fitur notifikasi stok menipis.
- **Manajemen Resep**: Hubungkan menu dengan bahan baku untuk pemotongan stok otomatis.
- **QR Generator**: Buat dan unduh QR Code unik untuk setiap meja cafe.
- **Laporan Penjualan**: Grafik pendapatan, menu terlaris, dan riwayat transaksi lengkap (Export Excel).

## 🛠️ Teknologi yang Digunakan
- **Frontend**: React.js, Tailwind CSS, Zustand, Lucide React.
- **Backend**: Node.js, Express.js, Better-SQLite3.
- **Database**: SQLite (No setup required).
- **Payment**: Simulasi Sandbox.

## 📦 Cara Menjalankan Aplikasi

### 1. Prasyarat
- Node.js (v16 ke atas)
- npm atau yarn

### 2. Instalasi & Setup

```bash
# Clone repository ini (atau salin kodenya)
cd "RPL Sir Yoga"

# Setup Backend
cd backend
npm install
npm run seed  # Untuk mengisi data demo (Admin, Menu, Bahan Baku)

# Setup Frontend
cd ../frontend
npm install
```

### 3. Jalankan Aplikasi

Buka dua terminal terpisah:

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Akses aplikasi di: [http://localhost:5173](http://localhost:5173)

### 🔑 Akun Demo (Pegawai)
- **Email**: `admin@scancafe.com`
- **Password**: `password123`

## 📐 Struktur Database
- `users`: Data pegawai/admin.
- `menus`: Daftar menu cafe.
- `ingredients`: Stok bahan baku.
- `recipes`: Relasi menu dan bahan (resep).
- `orders`: Data transaksi dan status.
- `order_items`: Detail item dalam setiap pesanan.

## 📝 Catatan Penting
- **Otomatisasi Stok**: Stok bahan baku akan berkurang secara otomatis saat status pesanan berubah menjadi **Paid** (Dibayar).
- **Auto-Availability**: Menu akan otomatis ditandai "Habis" jika salah satu bahan baku dalam resep tidak mencukupi.
- **QR Meja**: Gunakan fitur **QR Code** di dashboard pegawai untuk mencoba scan meja tertentu (misal: `?table=5`).

---
Dibuat dengan ❤️ oleh Antigravity.
