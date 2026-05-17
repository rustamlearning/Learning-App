-- IsleLearn Production Account Linking Template
-- Jalankan file ini di Supabase SQL Editor SETELAH:
-- 1. supabase/schema.sql dijalankan
-- 2. supabase/seed.sql dijalankan
-- 3. Akun dibuat di Supabase Dashboard > Authentication > Users
--
-- GANTI semua AUTH_USER_ID_* dengan ID user dari Supabase Authentication.

-- 1. Hubungkan profile aplikasi dengan akun Auth Supabase
update users_profile
set auth_user_id = 'AUTH_USER_ID_ADMIN'
where email = 'admin@islelearn.local';

update users_profile
set auth_user_id = 'AUTH_USER_ID_GURU'
where email = 'guru@islelearn.local';

update users_profile
set auth_user_id = 'AUTH_USER_ID_SISWA'
where email = 'siswa@islelearn.local';

update users_profile
set auth_user_id = 'AUTH_USER_ID_PIMPINAN'
where email = 'pimpinan@islelearn.local';

-- 2. Pastikan alias login tersedia
insert into login_aliases (profile_id, username, email, role)
select id, 'admin', lower(email), role
from users_profile
where email = 'admin@islelearn.local'
on conflict (username) do update set
  profile_id = excluded.profile_id,
  email = excluded.email,
  role = excluded.role;

insert into login_aliases (profile_id, username, email, role)
select id, 'guru', lower(email), role
from users_profile
where email = 'guru@islelearn.local'
on conflict (username) do update set
  profile_id = excluded.profile_id,
  email = excluded.email,
  role = excluded.role;

insert into login_aliases (profile_id, username, email, role)
select id, 'siswa', lower(email), role
from users_profile
where email = 'siswa@islelearn.local'
on conflict (username) do update set
  profile_id = excluded.profile_id,
  email = excluded.email,
  role = excluded.role;

insert into login_aliases (profile_id, username, email, role)
select id, 'pimpinan', lower(email), role
from users_profile
where email = 'pimpinan@islelearn.local'
on conflict (username) do update set
  profile_id = excluded.profile_id,
  email = excluded.email,
  role = excluded.role;

-- 3. Cek hasil akhir
select
  name,
  email,
  role,
  status,
  auth_user_id
from users_profile
order by role, name;

select
  username,
  email,
  role
from login_aliases
order by role, username;
