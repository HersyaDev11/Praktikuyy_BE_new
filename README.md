# 🚀 Praktikuy Backend API

Praktikuy adalah platform manajemen praktikum modern berbasis web3 yang dirancang untuk mengintegrasikan sistem akademik tradisional dengan keamanan dan transparansi blockchain. Repository ini berisi *source code* untuk Backend (REST API).

Aplikasi ini dibangun menggunakan tumpukan teknologi Node.js modern dengan arsitektur yang mendukung skalabilitas, keamanan peran (*Role-Based Access Control*), dan penerbitan sertifikat kelulusan dalam bentuk **NFT (Non-Fungible Token)**.

## 🛠️ Tech Stack
- **Runtime:** [Node.js](https://nodejs.org/) (v18+)
- **Framework:** [Express.js](https://expressjs.com/)
- **ORM / Database:** [Prisma](https://www.prisma.io/) + SQLite (Siap migrasi ke PostgreSQL/Supabase)
- **Autentikasi:** JSON Web Tokens (JWT) & bcryptjs
- **Web3 / Blockchain:** [Ethers.js](https://docs.ethers.org/) (Sepolia Testnet / Hardhat Local)

---

## ✨ Fitur Utama

### 1. 🔐 Autentikasi & Otorisasi Multi-Peran
Sistem mengimplementasikan JWT untuk memvalidasi pengguna dengan 3 peran berbeda:
- **`ADMIN`**: Mengelola seluruh *user*, menyetujui pembukaan kelas, dan melakukan *generate* Token akses unik.
- **`DOSEN`**: Mengelola materi modul, memantau *enrollment* mahasiswa, memberi nilai, dan menerbitkan sertifikat kelulusan.
- **`MAHASISWA`**: Mengakses modul dengan token, mengumpulkan laporan, melihat nilai, dan melihat sertifikat yang terverifikasi.

### 2. 🔑 Token-Based Enrollment
Akses ke kelas praktikum dilindungi oleh sistem token. Admin dapat mem-buat (generate) token unik yang kemudian didistribusikan ke mahasiswa untuk membuka (*unlock*) akses materi kelas praktikum tertentu.

### 3. 🎓 Blockchain NFT Certificates
Setiap kelulusan mahasiswa pada sebuah praktikum akan dicatat secara *off-chain* di database dan dapat di-minting secara *on-chain* sebagai NFT (Non-Fungible Token) menggunakan `ethers.js` untuk menjamin keaslian sertifikat yang mustahil dipalsukan.

---

## 🚀 Panduan Instalasi (Untuk Developer)

Ikuti langkah-langkah di bawah ini untuk menjalankan server secara lokal.

### 1. Clone Repository
```bash
git clone https://github.com/HersyaDev11/Praktikuyy_BE_new.git
cd Praktikuyy_BE_new
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables (`.env`)
Buat file bernama `.env` di *root* folder backend dan tambahkan variabel berikut:
```env
# Database koneksi (Gunakan SQLite untuk dev)
DATABASE_URL="file:./dev.db"

# JWT Secret untuk Autentikasi
JWT_SECRET="rahasia_untuk_jwt_token_123"
```

### 4. Setup Database (Prisma)
Jalankan sinkronisasi skema database dan *seeding* akun default:
```bash
npx prisma db push
node prisma/seed.js
```
*(Seeding akan otomatis membuat akun Admin, Dosen, dan beberapa kelas dummy)*

### 5. Jalankan Server
```bash
npm run dev
```
Server akan berjalan di `http://localhost:5000` 🚀

---

## 📖 Ringkasan Struktur Direktori
```text
📦 Praktikuy_BE
 ┣ 📂 prisma            # Skema Database & Seeder
 ┣ 📂 src
 ┃ ┣ 📂 blockchain      # Logika interaksi dengan Smart Contract (Ethers.js)
 ┃ ┣ 📂 controllers     # Bisnis logika (Auth, Practicum, Nilai, Token, dll)
 ┃ ┣ 📂 middleware      # Proteksi JWT & Verifikasi Role
 ┃ ┗ 📂 routes          # Definisi REST API Endpoints
 ┣ 📜 index.js          # Entry point server Express
 ┗ 📜 package.json      # Dependencies config
```

---
*Dibuat untuk keperluan Lomba & Kompetisi Web3.* 🏆
