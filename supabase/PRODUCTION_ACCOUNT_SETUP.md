# SEA Learning - Setup Akun Production Supabase

## Urutan aman

### 1. Jalankan schema
Buka Supabase Dashboard > SQL Editor, lalu jalankan isi file `supabase/schema.sql`.

### 2. Jalankan seed
Masih di SQL Editor, jalankan isi file `supabase/seed.sql`.

Seed ini membuat data awal:
- users_profile
- login_aliases
- classes
- subjects
- students
- teachers
- materials
- questions
- quizzes

### 3. Buat akun Auth
Buka Supabase Dashboard > Authentication > Users > Add user.

Buat akun berikut:

| Role | Email | Username alias | Catatan |
|---|---|---|---|
| Admin | admin@sea-learning.local | admin | Akun pengelola |
| Guru | guru@sea-learning.local | guru | Akun guru Bahasa Inggris |
| Siswa | siswa@sea-learning.local | siswa | Akun siswa contoh |
| Pimpinan | pimpinan@sea-learning.local | pimpinan | Akun monitoring |

Gunakan password yang kuat. Jangan commit password ke GitHub.

### 4. Copy User ID Auth
Setelah akun dibuat, buka detail masing-masing user di Authentication, lalu copy nilai `User UID`.

### 5. Link Auth ke users_profile
Buka file `supabase/production-accounts-template.sql`.

Ganti:
- AUTH_USER_ID_ADMIN
- AUTH_USER_ID_GURU
- AUTH_USER_ID_SISWA
- AUTH_USER_ID_PIMPINAN

dengan User UID dari Supabase Authentication.

Lalu jalankan SQL tersebut di SQL Editor.

### 6. Isi environment di Vercel
Buka Vercel > Project > Settings > Environment Variables.

Isi:
- VITE_SUPABASE_URL = Project URL dari Supabase
- VITE_SUPABASE_ANON_KEY = anon public key dari Supabase

Jangan isi ini di production:
- VITE_ENABLE_DEMO_AUTH=true

Karena itu akan membuka demo auth di production.

### 7. Redeploy Vercel
Setelah env diisi, lakukan redeploy dari Vercel.

### 8. Tes login production
Buka `https://learning-sman6pangkep.vercel.app/login`.

Tes:
- admin
- guru
- siswa
- pimpinan

Atau login dengan email masing-masing.

Jika login berhasil tetapi muncul error profile, berarti `auth_user_id` belum cocok dengan User UID Auth.
