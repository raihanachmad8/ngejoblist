<br />
<div align="center">
  <a href="https://github.com/raihanachmad8/ngejoblist">
    <img src="./logo.png" alt="Logo" height="80">
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

## 🏗️ Arsitektur Proyek: Common Core Module

### Struktur Direktori
src/
├── app.module.ts
├── core/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts   
│   │   │   └── prisma.service.ts  
│   ├── logger/
│   │   ├── logger.module.ts
│   │   └── logger.service.ts
│   └── middleware/
│       └── (middleware files)
├── common/
│   ├── config/
│   ├── decorators/
│   ├── enums/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── utils/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   └── strategies/
│   ├── user/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.module.ts
│   ├── company/
│   │   ├── company.controller.ts
│   │   ├── company.service.ts
│   │   └── company.module.ts
│   ├── job/
│   │   ├── job.controller.ts
│   │   ├── job.service.ts
│   │   └── job.module.ts
│   └── application/
│       ├── application.controller.ts
│       ├── application.service.ts
│       └── application.module.ts

### 🔍 Keunggulan Arsitektur

#### 1. Modularitas Tingkat Lanjut
- Pemisahan clear antara infrastruktur dan domain bisnis
- Komponen dapat digunakan ulang di seluruh aplikasi
- Konsistensi implementasi

#### 2. Manajemen Dependensi Terintegrasi
- Dependency Injection terpusat
- Kemudahan konfigurasi modul
- Fleksibilitas dalam pengembangan

#### 3. Keamanan & Validasi Terpusat
- Guard dan interceptor global
- Mekanisme validasi dinamis
- Penanganan error terstruktur

## 🛠️ Prasyarat

- Git
- Node.js 20+
- PostgreSQL
- Postman
- Text Editor (VS Code disarankan)

## 🚦 Instalasi




## 🔍 Akses API
Dokumentasi API tersedia di: http://localhost:3000/api

## 🛡️ Fitur Keamanan
Autentikasi JWT
Kontrol Akses Berbasis Peran
Validasi Input Komprehensif
Perlindungan dari Serangan Umum

## 🤝 Kontribusi

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewFeature`)
3. Commit your Changes (`git commit -m 'Add some NewFeature'`)
4. Push to the Branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

## 📄 Lisensi

📞 Kontak
Email: raihanachmad@gmail.com

Link Proyek: https://github.com/raihanachmad8/ngejoblist