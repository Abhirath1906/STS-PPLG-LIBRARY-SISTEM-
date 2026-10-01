Sistem Perpustakaan Sederhana

Aplikasi web untuk mengelola koleksi buku dan mencatat peminjamannya.

Identitas


Nama: Abhirath
Kelas: 12 RPL


Tema

Manajemen perpustakaan pribadi. Aplikasi ini bernama "Library": peminjaman, dan pelacakan tenggat pengembalian dalam satu halaman dashboard.

Tujuan

- Memudahkan pemilik perpustakaan mencatat dan mengelola koleksi buku.
- Mencatat siapa yang meminjam buku dan kapan harus dikembalikan.
- Menandai peminjaman yang sudah melewati tenggat.

Fitur

**Autentikasi**
- Registrasi dan login pengguna.
- Password disimpan dalam bentuk hash (bcrypt).
- Dashboard hanya bisa diakses setelah login.

**Manajemen buku**
- Tambah, edit, dan hapus buku (judul, penulis, kategori Fiksi / Non-Fiksi).
- Pencarian berdasarkan judul atau penulis.
- Filter kategori.

**Peminjaman**
- Pinjam buku dengan nama peminjam dan tenggat pengembalian.
- Edit nama peminjam dan tenggat.
- Kembalikan buku (data peminjaman dihapus).
- Penanda "Telat X hari" untuk peminjaman yang melewati tenggat.
- Tidak ada sistem stok: satu buku bisa dipinjam beberapa orang sekaligus.


Teknologi

| Frontend | Next.js, React, TypeScript, Ant Design, dayjs |
| Backend | Node.js, Express, bcryptjs, cors |
| Database | MariaDB / MySQL |

Struktur Database
Nama database: `library`

Tabel `users`

| Field | Tipe | Null | Key | Keterangan |
|---|---|---|---|---|
| id | int(11) | NO | PRI | auto_increment |
| username | varchar(50) | NO | UNI | |
| password | varchar(255) | NO | | hash bcrypt |
| email | varchar(100) | NO | UNI | |
| created_at | timestamp | NO | | default `current_timestamp()` |

Tabel `book`

| Field | Tipe | Null | Key | Keterangan |
|---|---|---|---|---|
| id | int(11) | NO | PRI | auto_increment |
| name | varchar(100) | NO | | judul buku |
| penulis | varchar(100) | NO | | |
| category | enum('Fiksi','Non-Fiksi') | NO | | |
| user_id | int(11) | NO | MUL | pemilik buku |
| created_at | timestamp | NO | | default `current_timestamp()` |

Tabel `peminjaman`

| Field | Tipe | Null | Key | Keterangan |
|---|---|---|---|---|
| id | int(11) | NO | PRI | auto_increment |
| book_id | int(11) | NO | MUL | buku yang dipinjam |
| user_id | int(11) | NO | MUL | pemilik perpustakaan |
| peminjam | varchar(100) | NO | | nama peminjam |
| tenggat | date | NO | | batas pengembalian |
| created_at | timestamp | NO | | default `current_timestamp()` |





Prasyarat

- Node.js 
- MariaDB / MySQL

1. Siapkan database

```sql
CREATE DATABASE library;
USE library;

CREATE TABLE users (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE book (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    penulis VARCHAR(100) NOT NULL,
    category ENUM('Fiksi','Non-Fiksi') NOT NULL,
    user_id INT(11) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE peminjaman (
    id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    book_id INT(11) NOT NULL,
    user_id INT(11) NOT NULL,
    peminjam VARCHAR(100) NOT NULL,
    tenggat DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES book(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

2. Jalankan backend

```bash
cd backend
npm install express mysql cors bcryptjs
node server.js
```

Backend berjalan di `http://localhost:5000`. 
3. Jalankan frontend

```bash
cd libary
npm run dev
```

Frontend berjalan di `http://localhost:3000`.

4. Mulai memakai

1. Buka aplikasi, lalu daftar akun baru.
2. Login dengan akun tersebut.
3. Tambahkan buku lewat **TAMBAH BUKU BARU**.
4. Catat peminjaman lewat **PINJAM CEPAT**.

Daftar Endpoint API

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/register` | Daftar akun |
| POST | `/api/login` | Login |
| GET | `/api/user/:id` | Data pengguna |
| GET | `/api/book/:userId` | Daftar buku milik pengguna |
| POST | `/api/book` | Tambah buku |
| PUT | `/api/book/:id` | Edit buku |
| DELETE | `/api/book/:id/:userId` | Hapus buku |
| GET | `/api/peminjaman/:userId` | Daftar peminjaman aktif |
| POST | `/api/peminjaman` | Tambah peminjaman |
| PUT | `/api/peminjaman/:id` | Edit peminjaman |
| DELETE | `/api/peminjaman/:id/:userId` | Kembalikan buku |