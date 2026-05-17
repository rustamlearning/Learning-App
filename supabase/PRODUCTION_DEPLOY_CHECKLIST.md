# IsleLearn - Production Deploy Checklist

## A. Supabase

- [ ] Jalankan `supabase/schema.sql`
- [ ] Jalankan `supabase/seed.sql`
- [ ] Buat akun Auth:
  - [ ] admin@islelearn.local
  - [ ] guru@islelearn.local
  - [ ] siswa@islelearn.local
  - [ ] pimpinan@islelearn.local
- [ ] Copy User UID dari Authentication
- [ ] Edit `supabase/production-accounts-template.sql`
- [ ] Jalankan `supabase/production-accounts-template.sql`
- [ ] Jalankan `supabase/production-smoke-test.sql`
- [ ] Pastikan semua profile memiliki `auth_status = TERHUBUNG`
- [ ] Pastikan `login_aliases` berisi admin, guru, siswa, pimpinan
- [ ] Pastikan tabel classes, subjects, students, teachers, materials, questions, quizzes tidak kosong

## B. Vercel Environment Variables

Isi di Vercel > Project > Settings > Environment Variables:

- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`

Jangan isi di production:

- [ ] `VITE_ENABLE_DEMO_AUTH=true`

## C. Redeploy

- [ ] Redeploy project di Vercel
- [ ] Tunggu build selesai
- [ ] Buka `https://learning-sman6pangkep.vercel.app/login`

## D. Tes Login Production

- [ ] Login admin
- [ ] Login guru
- [ ] Login siswa
- [ ] Login pimpinan
- [ ] Login sembarang ditolak
- [ ] Akses demo tidak muncul

## E. Tes Role

### Admin
- [ ] Dashboard admin terbuka
- [ ] Data guru terbaca
- [ ] Data siswa terbaca
- [ ] Data kelas terbaca
- [ ] Data mapel terbaca
- [ ] Laporan bisa export CSV/JSON

### Guru
- [ ] Dashboard guru terbuka
- [ ] Materi terbaca
- [ ] Bank soal terbaca
- [ ] Kuis Live terbaca
- [ ] Studio Konten terbuka
- [ ] Guru bisa membuat draft konten

### Siswa
- [ ] Dashboard siswa terbuka
- [ ] Materi terbaca
- [ ] Latihan terbuka
- [ ] Kuis terbuka
- [ ] Flashcard terbuka
- [ ] Progress tersimpan lokal

### Pimpinan
- [ ] Dashboard pimpinan terbuka
- [ ] Monitoring kelas terbuka
- [ ] Laporan akademik terbuka
- [ ] Export laporan berjalan

## F. Catatan Keamanan

- Jangan commit password.
- Jangan commit anon key ke GitHub.
- Jangan aktifkan demo auth di production.
- Jika login berhasil tetapi profile error, cek ulang `auth_user_id`.
