# Learning-App

SEA Learning adalah aplikasi learning app untuk SMA Negeri 6 Pangkajene dan Kepulauan.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Demo Role

- Siswa
- Guru
- Admin
- Pimpinan

## Supabase

Copy `.env.example` to `.env.local`, then fill the Supabase anon key.

```bash
VITE_SUPABASE_URL=https://qhxlsczsbgxfilvzzads.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
```

Run the SQL in `supabase/schema.sql` from the Supabase SQL editor to create the initial tables and policies. Then run `supabase/seed.sql` to add starter classes, subjects, and materials.

When Supabase env variables are available, email/password login will use Supabase Auth and load the role from `users_profile`. Demo role buttons remain available for local testing.

Current Supabase-backed features:

- Email/password login through Supabase Auth.
- Role loading from `users_profile`.
- Student material list reads published materials from Supabase with dummy fallback.
- Student material detail can be opened and marked complete locally.
- Teacher material page can create, edit, publish/unpublish, and delete materials in Supabase when the logged-in teacher profile exists.
- Teacher bank soal can create, edit, and delete questions in Supabase when the logged-in teacher profile exists.
- Teacher quiz page can create/publish quizzes from bank soal, and students can submit quiz answers with scores saved to `quiz_attempts`.
- Admin can manage basic guru/siswa profiles, classes, subjects, and export a JSON backup.
- AI Tutor and AI Generator call the server-side `/api/ai` endpoint on Vercel when `GROQ_API_KEY` is configured, with safe mock fallback when the endpoint is unavailable.

Important: after creating Auth users in Supabase, connect each Auth user to `users_profile.auth_user_id` so role-based login and teacher-owned materials work correctly.
