<br />
<div align="center">
  <a href="https://github.com/raihanachmad8/ngejoblist">
    <img src="./swagger.png" alt="Logo" height="1000">
  </a>

  <h3 align="center">NgeJobList Backend</h3>

  <p align="center">
    Solusi backend modern untuk platform pencarian dan manajemen pekerjaan
    <br />
    <a href="https://github.com/raihanachmad8/ngejoblist"><strong>Explore the docs »</strong></a>
  </p>
</div>

## 🌟 Tentang Proyek

NgeJobList adalah aplikasi backend canggih untuk memfasilitasi pencarian dan publikasi lowongan pekerjaan, dirancang untuk memberikan pengalaman yang efisien bagi perekrut dan pencari kerja.

### ✨ Fitur Utama

- 🔐 Autentikasi Pengguna: Registrasi dan login aman
- 📋 Manajemen Posting Pekerjaan: Tambah, perbarui, dan hapus lowongan
- 🔍 Pencarian dan Filter Pekerjaan: Opsi filter canggih
- 🔔 Notifikasi Real-Time: Pemberitahuan update dan lamaran
- 📊 Dasbor Analitik: Wawasan mendalam tentang lamaran dan posting pekerjaan

## 🚀 Teknologi Utama

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

---

## 🏗️ Arsitektur Proyek: Common Core Module

### Struktur Direktori

 ```plaintext
  ├───common
  │   ├───config
  │   ├───decorators
  │   ├───filters
  │   ├───guards
  │   ├───interceptors
  │   ├───pipes
  │   ├───types
  │   └───utils
  ├───core
  │   ├───cloudinary
  │   ├───database
  │   ├───logger
  │   └───middleware
  └───modules
      ├───application
      │   ├───controllers
      │   ├───dto
      │   └───services
      ├───auth
      │   ├───controllers
      │   ├───dto
      │   ├───guards
      │   ├───services
      │   └───strategies
      ├───job
      │   ├───controllers
      │   ├───dto
      │   └───services
      └───user-management
          ├───controllers
          ├───dto
          └───services
 ```

---

### ✨ Keunggulan Struktur Folder Common Core Module

Struktur direktori ini dirancang untuk memaksimalkan skalabilitas, keterbacaan, dan pemeliharaan aplikasi. Berikut adalah keunggulannya:

#### 🔍 1. Modularitas Tingkat Lanjut

- Penjelasan: Setiap folder mencerminkan tanggung jawab spesifik, memisahkan logika berdasarkan fungsi atau fitur.
- Keuntungan:
  - 📦 Isolasi kode: Mempermudah pengembangan dengan membagi tugas berdasarkan modul.
  - 👥 Kolaborasi tim: Membantu banyak developer bekerja secara paralel tanpa konflik kode.

#### 🛠️ 2. Manajemen Dependensi Terintegrasi

- Penjelasan: Struktur ini menggunakan Dependency Injection (DI) yang dikelola secara terpusat.
- Keuntungan:
  - 🔄 Fleksibilitas: Mempermudah konfigurasi modul dan layanan saat aplikasi berkembang.
  - 🏗️ Konsistensi: DI memungkinkan komponen dapat diganti atau diujikan dengan mudah tanpa mengubah kode lainnya.

#### 🔒 3. Keamanan & Validasi Terpusat

- Penjelasan: Menggunakan guards, interceptors, dan pipes untuk memastikan validasi dan keamanan berjalan terpusat.
- Keuntungan:
  - 🛡️ Guard global: Membatasi akses berdasarkan logika otentikasi.
  - ⚙️ Validasi dinamis: Memastikan data valid sebelum mencapai controller.
  - 🚨 Error handling: Penanganan error terstruktur membuat debugging lebih mudah.

#### 📂 4. Folder common: Komponen Global

- Tujuan: Menyediakan komponen dan utilitas yang dapat digunakan di seluruh aplikasi.
- Keunggulan:
  - 🔧 config: Tempat penyimpanan konfigurasi global seperti pengaturan aplikasi atau lingkungan.
  - 🎨 decorators: Menambahkan metadata atau logika tambahan pada class, method, atau properti.
  - 🧱 filters: Menangani error atau exception secara terpusat.
  - 🛡️ guards: Keamanan tambahan untuk membatasi akses.
  - 🚦 interceptors: Menambahkan logika tambahan, seperti logging atau transformasi data.
  - 🔄 pipes: Validasi dan transformasi data sebelum mencapai controller.
  - 🧩 types: Mendefinisikan tipe atau antarmuka yang digunakan secara global.
  - 🛠️ utils: Fungsi bantu untuk menyederhanakan logika umum.

#### 🔗 5. Folder core: Komponen Inti

- Tujuan: Menyediakan fitur foundational yang sering digunakan.
- Keunggulan:
  - ☁️ cloudinary: Integrasi layanan Cloudinary untuk pengelolaan media.
  - 📊 database: Abstraksi dan konfigurasi database.
  - 📜 logger: Logging terpusat untuk memantau aktivitas aplikasi.
  - 🔍 middleware: Logika yang dijalankan sebelum controller, seperti autentikasi atau logging permintaan.

#### 🧩 6. Folder modules: Modularisasi Fitur

- Tujuan: Menyusun fitur berdasarkan domain aplikasi.
- Keunggulan:\
Setiap modul memiliki struktur seragam:
  - 🌐 controllers: Menangani permintaan HTTP dan memberikan respons.
  - 📤 dto: Validasi data yang masuk/keluar.
  - 💡 services: Tempat logika bisnis utama.
- Modul opsional:
  - 🛡️ guards: Keamanan tambahan untuk modul tertentu.
  - 🔐 strategies: Implementasi strategi autentikasi.

---

## 🛠️ Prerequisites

Ensure you have the following installed:

1. **Node.js** (v18 or higher) - [Download Node.js](https://nodejs.org/)
2. **npm** (bundled with Node.js) or **Yarn** (latest version)
3. **PostgreSQL** (v13 or higher) - [Download PostgreSQL](https://www.postgresql.org/)
4. **Git** - [Download Git](https://git-scm.com/)

---

## 🚦 Instalasi

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/raihanachmad8/ngejoblist
cd ngejoblist
```

### 2. Install Dependencies

Run the following command to install required packages:

```bash
npm install
```

or if using Yarn:

```bash
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory. Use the `.env.example` file as a template:

```bash
cp .env.example .env
```

Fill in the necessary environment variables in the `.env` file. For example:

```env
# Konfigurasi Database
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=root
DB_DATABASE=ngejoblist
DB_LOGGING=true
DB_TIMEZONE=UTC
DB_SYNCRONIZE=false

# Konfigurasi Autentikasi
JWT_ACCESS_SECRET=your_very_long_and_secure_access_secret_key
JWT_REFRESH_SECRET=your_very_long_and_secure_refresh_secret_key
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d
BCRYPT_SALT_ROUNDS=10
```

---

### 4. Database Setup

#### a. Create the Database

Ensure PostgreSQL is running and create a new database for the application:

```sql
CREATE DATABASE your_database_name;
```

#### b. Run Database Migrations

Run the Prisma migrations to set up the database schema:

```bash
npx prisma migrate dev
```

---

### 5. Start the Application

#### a. Development Mode

Run the application in development mode:

```bash
npm run start:dev
```

#### b. Production Mode

Build the application and start it in production mode:

```bash
npm run build
npm run start:prod
```

---

### 6. Running Tests

To execute the test suite:

```bash
npm run test
```

To run end-to-end (e2e) tests:

```bash
npm run test:e2e
```

---

## API Documentation

The application comes with integrated Swagger documentation. After starting the server, visit:

```
http://localhost:<PORT>/api/docs
```

Here, `<PORT>` is the port specified in the `.env` file (default: 3000).

---

## Additional Commands

- **Generate Prisma Client:**

```bash
npx prisma generate
```

- **Linting:**

```bash
npm run lint
```

- **Format Code:**

```bash
npm run format
```

---

## 🛡️ Fitur Keamanan

Autentikasi JWT
Kontrol Akses Berbasis Peran
Validasi Input Komprehensif
Perlindungan dari Serangan Umum

---

## 🤝 Kontribusi

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewFeature`)
3. Commit your Changes (`git commit -m 'Add some NewFeature'`)
4. Push to the Branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

📞 Kontak
Email: <raihanachmad@gmail.com>

Link Proyek: <https://github.com/raihanachmad8/ngejoblist>
