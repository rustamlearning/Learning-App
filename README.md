# SEA Learning App

SEA Learning App adalah aplikasi pembelajaran digital untuk SMA Negeri 6 Pangkajene dan Kepulauan. Aplikasi ini dirancang ringan, modern, role-based, dan cocok digunakan untuk lingkungan sekolah kepulauan dengan kondisi jaringan yang beragam.

## Fitur Utama

- Landing page modern dan responsif
- Login page role-based
- Dashboard siswa, guru, admin, dan pimpinan
- Materi belajar
- Latihan dan kuis
- Flashcard
- AI Tutor dan AI Generator
- Bank soal guru
- Tugas guru
- Monitoring nilai dan progres belajar
- Admin data guru, siswa, kelas, dan mata pelajaran
- Backup data
- Integrasi Supabase
- API AI server-side melalui Vercel Function

## Role Pengguna

- Siswa
- Guru
- Admin
- Pimpinan

## Tech Stack

- React
- Vite
- Tailwind CSS
- React Router
- Lucide React
- Recharts
- Framer Motion
- Supabase
- Vercel Serverless Function
- Groq API untuk fitur AI

## Menjalankan Project Lokal

```bash
npm install
npm run dev
```

## Build Production

```bash
npm run build
```

## Preview Build

```bash
npm run preview
```

## Environment Variables

Copy file `.env.example` menjadi `.env.local`, lalu isi value yang sesuai.

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.1-8b-instant
```

## Setup Supabase

1. Buat project Supabase.
2. Buka Supabase SQL Editor.
3. Jalankan file `supabase/schema.sql`.
4. Jalankan file `supabase/seed.sql`.
5. Buat Auth user di Supabase.
6. Hubungkan Auth user ke tabel `users_profile` melalui kolom `auth_user_id`.

Jika Supabase belum dikonfigurasi, aplikasi tetap bisa berjalan menggunakan mode demo.

## Fitur Supabase

- Email/password login melalui Supabase Auth
- Role pengguna dari tabel `users_profile`
- Materi siswa dari tabel `materials`
- Progress materi siswa dari tabel `progress`
- CRUD materi guru
- CRUD bank soal guru
- Kuis dan attempt siswa
- Data guru, siswa, kelas, dan mata pelajaran
- Backup data admin
- Login alias melalui tabel `login_aliases`

## Fitur AI

AI Tutor dan AI Generator menggunakan endpoint server-side:

```bash
/api/ai
```

API key Groq tidak disimpan di frontend. Key hanya digunakan di server melalui environment variable `GROQ_API_KEY`.

Jika API AI belum dikonfigurasi, aplikasi tetap menggunakan mode fallback aman.

## Deploy ke Vercel

Project ini siap dideploy ke Vercel.

Pastikan environment variables berikut sudah ditambahkan di Vercel:

```bash
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
GROQ_API_KEY
GROQ_MODEL
```

Vercel akan otomatis deploy setiap kali branch `main` di-push ke GitHub.

## Struktur Folder

```bash
src/
  components/
  context/
  data/
  hooks/
  layouts/
  pages/
  routes/
  services/

api/
  ai.js

supabase/
  schema.sql
  seed.sql
```

## Status Project

SEA Learning App saat ini sudah memiliki UI utama, routing role-based, demo login, optimasi bundle production, struktur Supabase, dan endpoint AI server-side.

Project masih dapat dikembangkan lebih lanjut untuk fitur real production seperti upload file, manajemen akun lengkap, absensi, notifikasi real-time, dan laporan PDF.
