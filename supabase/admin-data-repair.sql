-- IsleLearn admin data repair
-- Run this in Supabase Dashboard > SQL Editor.
-- It restores the rows used by Admin > Data Guru, Data Siswa, Data Kelas, and Mata Pelajaran.

begin;

create or replace function public.current_user_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.users_profile where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.resolve_login_email(login_identifier text)
returns table(email text)
language sql
security definer
stable
set search_path = public
as $$
  select aliases.email
  from public.login_aliases aliases
  where aliases.username = lower(trim(regexp_replace(coalesce(login_identifier, ''), '\s+', ' ', 'g')))
  limit 1;
$$;

grant execute on function public.current_user_role() to anon, authenticated;
grant execute on function public.resolve_login_email(text) to anon, authenticated;

alter table public.users_profile enable row level security;
alter table public.classes enable row level security;
alter table public.subjects enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.login_aliases enable row level security;

create unique index if not exists classes_name_academic_year_uidx on public.classes (name, academic_year);
create unique index if not exists subjects_code_uidx on public.subjects (code);
create unique index if not exists students_user_uidx on public.students (user_id);
create unique index if not exists teachers_user_uidx on public.teachers (user_id);
create unique index if not exists login_aliases_username_uidx on public.login_aliases (username);

drop policy if exists "Authenticated users can read profiles" on public.users_profile;
drop policy if exists "Authenticated users can read classes" on public.classes;
drop policy if exists "Authenticated users can read subjects" on public.subjects;
drop policy if exists "Students can read own student row" on public.students;
drop policy if exists "Admins can manage profiles" on public.users_profile;
drop policy if exists "Admins can manage classes" on public.classes;
drop policy if exists "Admins can manage subjects" on public.subjects;
drop policy if exists "Admins can manage students" on public.students;
drop policy if exists "Admins can manage teachers" on public.teachers;
drop policy if exists "Admins can manage login aliases" on public.login_aliases;

create policy "Authenticated users can read profiles" on public.users_profile
  for select to authenticated
  using (
    auth_user_id = auth.uid()
    or role = 'guru'
    or public.current_user_role() in ('admin', 'pimpinan')
  );

create policy "Authenticated users can read classes" on public.classes
  for select to authenticated
  using (true);

create policy "Authenticated users can read subjects" on public.subjects
  for select to authenticated
  using (true);

create policy "Students can read own student row" on public.students
  for select to authenticated
  using (
    exists (
      select 1 from public.users_profile profile
      where profile.id = students.user_id
        and profile.auth_user_id = auth.uid()
    )
  );

create policy "Admins can manage profiles" on public.users_profile
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "Admins can manage classes" on public.classes
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "Admins can manage subjects" on public.subjects
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "Admins can manage students" on public.students
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "Admins can manage teachers" on public.teachers
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "Admins can manage login aliases" on public.login_aliases
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

with admin_auth as (
  select id, email
  from auth.users
  where email in ('admin@sea-learning.local', 'admin@islelearn.local')
  order by case when email = 'admin@sea-learning.local' then 0 else 1 end
  limit 1
)
update public.users_profile profile
set
  auth_user_id = admin_auth.id,
  email = admin_auth.email,
  role = 'admin',
  status = 'Aktif'
from admin_auth
where profile.role = 'admin';

insert into public.login_aliases (profile_id, username, email, role)
select id, 'admin', email, 'admin'
from public.users_profile
where role = 'admin'
order by created_at
limit 1
on conflict (username) do update set
  profile_id = excluded.profile_id,
  email = excluded.email,
  role = excluded.role;

insert into public.classes (name, grade, academic_year)
values
  ('XI Pangeran Diponegoro', 11, '2026/2027'),
  ('XI Soeharto', 11, '2026/2027'),
  ('XII Jenderal Sudirman', 12, '2026/2027'),
  ('XII B.J. Habibie', 12, '2026/2027')
on conflict (name, academic_year) do update set
  grade = excluded.grade;

insert into public.subjects (name, code)
values
  ('Pendidikan Agama Islam dan Budi Pekerti', 'PAI-BP'),
  ('Pendidikan Pancasila', 'PP'),
  ('Bahasa Indonesia', 'BIN'),
  ('Matematika Umum', 'MTK-U'),
  ('Bahasa Inggris', 'BIG'),
  ('Pendidikan Jasmani, Olahraga, dan Kesehatan', 'PJOK'),
  ('Sejarah', 'SEJ'),
  ('Seni Budaya', 'SBD'),
  ('Prakarya dan Kewirausahaan', 'PKWU'),
  ('Muatan Lokal', 'MULOK'),
  ('Informatika', 'INF'),
  ('Fisika', 'FIS'),
  ('Kimia', 'KIM'),
  ('Biologi', 'BIO'),
  ('Ekonomi', 'EKO'),
  ('Geografi', 'GEO'),
  ('Sosiologi', 'SOS'),
  ('Antropologi', 'ANT'),
  ('Matematika Tingkat Lanjut', 'MTK-L'),
  ('Bahasa Indonesia Tingkat Lanjut', 'BIN-L'),
  ('Bahasa Inggris Tingkat Lanjut', 'BIG-L')
on conflict (code) do update set
  name = excluded.name;

with teacher_seed (name, email, nip, subject_code) as (
  values
  ('ABD. ASIS MUSLIM, S.Pd., M.Pd.', 'teacher-abd-asis-muslim@guru.islelearn.local', '198406152008041001', 'KIM'),
  ('RUSTAM, S.Pd.', 'guru@sea-learning.local', '198503112011011007', 'BIG'),
  ('SAYID ACHMAD AZWAR ANWAR BAGDADI, S.Or., S.Pd.', 'teacher-sayid-achmad-azwar-anwar-bagdadi@guru.islelearn.local', '198210152010011026', 'PJOK'),
  ('BELOTANI, S.Pd.I', 'teacher-belotani@guru.islelearn.local', '198310192010012033', 'BIG'),
  ('M. BASRI, S.Pd.', 'teacher-m-basri@guru.islelearn.local', '198203072009021004', 'BIN'),
  ('SOFYAN, S.Pd.', 'teacher-sofyan@guru.islelearn.local', '198707172022211022', 'SOS'),
  ('SHALIHAN, S.Pd.I', 'teacher-shalihan@guru.islelearn.local', '198404172022211015', 'PAI-BP'),
  ('AHMADI, S.Pd.', 'teacher-ahmadi@guru.islelearn.local', '199010012023211021', null),
  ('ROSITA HADIING, S.Pd., M.M.', 'teacher-rosita-hadiing@guru.islelearn.local', '197103012023212005', 'PKWU'),
  ('SAP''ARI, S.Pd.', 'teacher-sapari@guru.islelearn.local', '199310062023211016', 'FIS'),
  ('NURHIDAYATI, S.Pd.', 'teacher-nurhidayati@guru.islelearn.local', '198904272023212034', 'PP'),
  ('AMRU ICHWAN LUTHFI, S.Pd.', 'teacher-amru-ichwan-luthfi@guru.islelearn.local', '199207262023211019', 'KIM'),
  ('SYAMSURYANI, S.Pd.', 'teacher-syamsuryani@guru.islelearn.local', '199307242023212033', 'BIO'),
  ('KHAERUNNISA, S.Pd.', 'teacher-khaerunnisa@guru.islelearn.local', '199704052023212020', 'GEO'),
  ('SUDIRMAN, S.Pd.', 'teacher-sudirman@guru.islelearn.local', '199301032025211127', 'PAI-BP'),
  ('MURSALIM EVENDY, S.Pd.', 'teacher-mursalim-evendy@guru.islelearn.local', '198811122023211017', null),
  ('Hj. HUSNAENI, S.Pd', 'teacher-hj-husnaeni@guru.islelearn.local', '197303272023212005', null)
),
teacher_profiles as (
  insert into public.users_profile (name, email, role, status)
  select name, email, 'guru', 'Aktif'
  from teacher_seed
  on conflict (email) do update set
    name = excluded.name,
    role = 'guru',
    status = 'Aktif'
  returning id, email
)
insert into public.teachers (user_id, nip, subject_id, status)
select profile.id, seed.nip, subject.id, 'Aktif'
from teacher_seed seed
join teacher_profiles profile on profile.email = seed.email
left join public.subjects subject on subject.code = seed.subject_code
on conflict (user_id) do update set
  nip = excluded.nip,
  subject_id = excluded.subject_id,
  status = excluded.status;

with student_seed (name, email, class_name, gender) as (
  values
  ('ABD. WAHAB', 'siswa@sea-learning.local', 'XI Pangeran Diponegoro', 'L'),
  ('ADAM PUTRA PERDANA', 'student-xi-pangeran-diponegoro-2@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'L'),
  ('AL HUSNA', 'student-xi-pangeran-diponegoro-3@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'P'),
  ('ANDI NUR SALAM', 'student-xi-pangeran-diponegoro-4@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'L'),
  ('ASLAM', 'student-xi-pangeran-diponegoro-5@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'L'),
  ('BERLIAN', 'student-xi-pangeran-diponegoro-6@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'P'),
  ('DANDI BARATA', 'student-xi-pangeran-diponegoro-7@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'L'),
  ('KRISDAYANTI', 'student-xi-pangeran-diponegoro-8@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'P'),
  ('MUH. ALI RAHMAT', 'student-xi-pangeran-diponegoro-9@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'L'),
  ('MUH. YAZIN', 'student-xi-pangeran-diponegoro-10@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'L'),
  ('MUH. FAJRI', 'student-xi-pangeran-diponegoro-11@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'L'),
  ('MUHAMMAD YASIN', 'student-xi-pangeran-diponegoro-12@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'L'),
  ('NABILA', 'student-xi-pangeran-diponegoro-13@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'P'),
  ('NAYLA', 'student-xi-pangeran-diponegoro-14@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'P'),
  ('NUR SYAMSI', 'student-xi-pangeran-diponegoro-15@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'P'),
  ('RAHMAT SANJAYA', 'student-xi-pangeran-diponegoro-16@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'L'),
  ('RAMLI', 'student-xi-pangeran-diponegoro-17@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'L'),
  ('RICO SUKARNO', 'student-xi-pangeran-diponegoro-18@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'L'),
  ('SAKINAH', 'student-xi-pangeran-diponegoro-19@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'P'),
  ('SALMAN ALFAREZY', 'student-xi-pangeran-diponegoro-20@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'L'),
  ('SALMAN ALFARISI', 'student-xi-pangeran-diponegoro-21@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'L'),
  ('SALSABILAH', 'student-xi-pangeran-diponegoro-22@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'P'),
  ('SITI AINUN NISYA', 'student-xi-pangeran-diponegoro-23@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'P'),
  ('ZAHIRA', 'student-xi-pangeran-diponegoro-24@siswa.islelearn.local', 'XI Pangeran Diponegoro', 'P'),
  ('ABD. HAMID SATRIADI', 'student-xi-soeharto-1@siswa.islelearn.local', 'XI Soeharto', 'L'),
  ('ABD. KARIM', 'student-xi-soeharto-2@siswa.islelearn.local', 'XI Soeharto', 'L'),
  ('ADHA NOVIANA', 'student-xi-soeharto-3@siswa.islelearn.local', 'XI Soeharto', 'L'),
  ('ARIFIN', 'student-xi-soeharto-4@siswa.islelearn.local', 'XI Soeharto', 'L'),
  ('ARYADITYA PUTRA', 'student-xi-soeharto-5@siswa.islelearn.local', 'XI Soeharto', 'L'),
  ('AYATUL HUSNA', 'student-xi-soeharto-6@siswa.islelearn.local', 'XI Soeharto', 'P'),
  ('DZUL JALALI WALIQRAM', 'student-xi-soeharto-7@siswa.islelearn.local', 'XI Soeharto', 'L'),
  ('ERNA', 'student-xi-soeharto-8@siswa.islelearn.local', 'XI Soeharto', 'P'),
  ('FAUZI TEGUH', 'student-xi-soeharto-9@siswa.islelearn.local', 'XI Soeharto', 'L'),
  ('FERDI', 'student-xi-soeharto-10@siswa.islelearn.local', 'XI Soeharto', 'L'),
  ('HALIDAH', 'student-xi-soeharto-11@siswa.islelearn.local', 'XI Soeharto', 'P'),
  ('HARIANDI', 'student-xi-soeharto-12@siswa.islelearn.local', 'XI Soeharto', 'L'),
  ('IRMA', 'student-xi-soeharto-13@siswa.islelearn.local', 'XI Soeharto', 'P'),
  ('M. SALJI', 'student-xi-soeharto-14@siswa.islelearn.local', 'XI Soeharto', 'L'),
  ('MUH. ARPIN', 'student-xi-soeharto-15@siswa.islelearn.local', 'XI Soeharto', 'L'),
  ('MUH. ADRIANO', 'student-xi-soeharto-16@siswa.islelearn.local', 'XI Soeharto', 'L'),
  ('MUH. RESKI ARIF RAHMAN', 'student-xi-soeharto-17@siswa.islelearn.local', 'XI Soeharto', 'L'),
  ('MUH. TASBIQ RISKY', 'student-xi-soeharto-18@siswa.islelearn.local', 'XI Soeharto', 'L'),
  ('NUR FADILA', 'student-xi-soeharto-19@siswa.islelearn.local', 'XI Soeharto', 'P'),
  ('RIKI MAULANA', 'student-xi-soeharto-20@siswa.islelearn.local', 'XI Soeharto', 'L'),
  ('SAHARUDDIN', 'student-xi-soeharto-21@siswa.islelearn.local', 'XI Soeharto', 'L'),
  ('SUCI SETIAWATI', 'student-xi-soeharto-22@siswa.islelearn.local', 'XI Soeharto', 'P'),
  ('SYAHRINI', 'student-xi-soeharto-23@siswa.islelearn.local', 'XI Soeharto', 'P'),
  ('NUR SALEH', 'student-xi-soeharto-24@siswa.islelearn.local', 'XI Soeharto', 'L'),
  ('MAGFIRA ZASKIA', 'student-xi-soeharto-25@siswa.islelearn.local', 'XI Soeharto', 'P'),
  ('ACHMAD', 'student-xii-jenderal-sudirman-1@siswa.islelearn.local', 'XII Jenderal Sudirman', 'L'),
  ('AJIE SAPUTRA', 'student-xii-jenderal-sudirman-2@siswa.islelearn.local', 'XII Jenderal Sudirman', 'L'),
  ('ALGAZALI', 'student-xii-jenderal-sudirman-3@siswa.islelearn.local', 'XII Jenderal Sudirman', 'L'),
  ('ALIF HALIL', 'student-xii-jenderal-sudirman-4@siswa.islelearn.local', 'XII Jenderal Sudirman', 'L'),
  ('ANDIRA FALDIA', 'student-xii-jenderal-sudirman-5@siswa.islelearn.local', 'XII Jenderal Sudirman', 'P'),
  ('FERDY PRANANDA', 'student-xii-jenderal-sudirman-6@siswa.islelearn.local', 'XII Jenderal Sudirman', 'L'),
  ('HENRIK SAPUTRA', 'student-xii-jenderal-sudirman-7@siswa.islelearn.local', 'XII Jenderal Sudirman', 'L'),
  ('INGGI ADITYA', 'student-xii-jenderal-sudirman-8@siswa.islelearn.local', 'XII Jenderal Sudirman', 'L'),
  ('ISDA DAHLIA', 'student-xii-jenderal-sudirman-9@siswa.islelearn.local', 'XII Jenderal Sudirman', 'P'),
  ('JULIANI', 'student-xii-jenderal-sudirman-10@siswa.islelearn.local', 'XII Jenderal Sudirman', 'P'),
  ('LASTRIANI', 'student-xii-jenderal-sudirman-11@siswa.islelearn.local', 'XII Jenderal Sudirman', 'P'),
  ('M. FACHMI', 'student-xii-jenderal-sudirman-12@siswa.islelearn.local', 'XII Jenderal Sudirman', 'L'),
  ('M. YUSUF', 'student-xii-jenderal-sudirman-13@siswa.islelearn.local', 'XII Jenderal Sudirman', 'L'),
  ('MARWA', 'student-xii-jenderal-sudirman-14@siswa.islelearn.local', 'XII Jenderal Sudirman', 'P'),
  ('MUHARRAM JANUARI', 'student-xii-jenderal-sudirman-15@siswa.islelearn.local', 'XII Jenderal Sudirman', 'L'),
  ('MUTRIFA', 'student-xii-jenderal-sudirman-16@siswa.islelearn.local', 'XII Jenderal Sudirman', 'P'),
  ('NABILA', 'student-xii-jenderal-sudirman-17@siswa.islelearn.local', 'XII Jenderal Sudirman', 'P'),
  ('NURFAIDAH', 'student-xii-jenderal-sudirman-18@siswa.islelearn.local', 'XII Jenderal Sudirman', 'P'),
  ('PANIA', 'student-xii-jenderal-sudirman-19@siswa.islelearn.local', 'XII Jenderal Sudirman', 'P'),
  ('PINA SARIANTI', 'student-xii-jenderal-sudirman-20@siswa.islelearn.local', 'XII Jenderal Sudirman', 'P'),
  ('RAY LALO MAULANA', 'student-xii-jenderal-sudirman-21@siswa.islelearn.local', 'XII Jenderal Sudirman', 'L'),
  ('RESKI ADITIA', 'student-xii-jenderal-sudirman-22@siswa.islelearn.local', 'XII Jenderal Sudirman', 'L'),
  ('REZA ADITYA', 'student-xii-jenderal-sudirman-23@siswa.islelearn.local', 'XII Jenderal Sudirman', 'L'),
  ('SITI KHUMAIRAH', 'student-xii-jenderal-sudirman-24@siswa.islelearn.local', 'XII Jenderal Sudirman', 'P'),
  ('SULAEMAN', 'student-xii-jenderal-sudirman-25@siswa.islelearn.local', 'XII Jenderal Sudirman', 'L'),
  ('WAHYUNI', 'student-xii-jenderal-sudirman-26@siswa.islelearn.local', 'XII Jenderal Sudirman', 'P'),
  ('WINDI MAJID', 'student-xii-jenderal-sudirman-27@siswa.islelearn.local', 'XII Jenderal Sudirman', 'P'),
  ('ABDAN SYAKUR', 'student-xii-bj-habibie-1@siswa.islelearn.local', 'XII B.J. Habibie', 'L'),
  ('ADITIA', 'student-xii-bj-habibie-2@siswa.islelearn.local', 'XII B.J. Habibie', 'L'),
  ('AHMAD DANI', 'student-xii-bj-habibie-3@siswa.islelearn.local', 'XII B.J. Habibie', 'L'),
  ('AHMAD FAJRI', 'student-xii-bj-habibie-4@siswa.islelearn.local', 'XII B.J. Habibie', 'L'),
  ('AMEL SINTIA', 'student-xii-bj-habibie-5@siswa.islelearn.local', 'XII B.J. Habibie', 'P'),
  ('ANDIKA', 'student-xii-bj-habibie-6@siswa.islelearn.local', 'XII B.J. Habibie', 'L'),
  ('ARYA', 'student-xii-bj-habibie-7@siswa.islelearn.local', 'XII B.J. Habibie', 'L'),
  ('ASMADI', 'student-xii-bj-habibie-8@siswa.islelearn.local', 'XII B.J. Habibie', 'L'),
  ('ASMAUL HUSNA', 'student-xii-bj-habibie-9@siswa.islelearn.local', 'XII B.J. Habibie', 'P'),
  ('DEWI ASRIANI', 'student-xii-bj-habibie-10@siswa.islelearn.local', 'XII B.J. Habibie', 'P'),
  ('EKA MARLISA', 'student-xii-bj-habibie-11@siswa.islelearn.local', 'XII B.J. Habibie', 'P'),
  ('ENDANG PURWANTI', 'student-xii-bj-habibie-12@siswa.islelearn.local', 'XII B.J. Habibie', 'P'),
  ('FERDIANSYAH S.', 'student-xii-bj-habibie-13@siswa.islelearn.local', 'XII B.J. Habibie', 'L'),
  ('HALAMUDDIN', 'student-xii-bj-habibie-14@siswa.islelearn.local', 'XII B.J. Habibie', 'L'),
  ('MAHATIR MUHAMMAD', 'student-xii-bj-habibie-15@siswa.islelearn.local', 'XII B.J. Habibie', 'L'),
  ('MAHESA PURWADI', 'student-xii-bj-habibie-16@siswa.islelearn.local', 'XII B.J. Habibie', 'L'),
  ('MARWAGA', 'student-xii-bj-habibie-17@siswa.islelearn.local', 'XII B.J. Habibie', 'P'),
  ('MUH. FARHAN', 'student-xii-bj-habibie-18@siswa.islelearn.local', 'XII B.J. Habibie', 'L'),
  ('NIA RAHMAWATI', 'student-xii-bj-habibie-19@siswa.islelearn.local', 'XII B.J. Habibie', 'P'),
  ('NUR AULIA', 'student-xii-bj-habibie-20@siswa.islelearn.local', 'XII B.J. Habibie', 'P'),
  ('PIA HANDAYANI', 'student-xii-bj-habibie-21@siswa.islelearn.local', 'XII B.J. Habibie', 'P'),
  ('RISKI OLIVIA', 'student-xii-bj-habibie-22@siswa.islelearn.local', 'XII B.J. Habibie', 'P'),
  ('SARTIKA PATARANI', 'student-xii-bj-habibie-23@siswa.islelearn.local', 'XII B.J. Habibie', 'P'),
  ('SRI AULIA ZAHRI', 'student-xii-bj-habibie-24@siswa.islelearn.local', 'XII B.J. Habibie', 'P'),
  ('SITI RAHMAWATI', 'student-xii-bj-habibie-25@siswa.islelearn.local', 'XII B.J. Habibie', 'P'),
  ('YULIANA', 'student-xii-bj-habibie-26@siswa.islelearn.local', 'XII B.J. Habibie', 'P')
),
student_profiles as (
  insert into public.users_profile (name, email, role, status)
  select name, email, 'siswa', 'Aktif'
  from student_seed
  on conflict (email) do update set
    name = excluded.name,
    role = 'siswa',
    status = 'Aktif'
  returning id, email
)
insert into public.students (user_id, class_id, gender, status)
select profile.id, class_item.id, seed.gender, 'Aktif'
from student_seed seed
join student_profiles profile on profile.email = seed.email
left join public.classes class_item
  on class_item.name = seed.class_name
  and class_item.academic_year = '2026/2027'
on conflict (user_id) do update set
  class_id = excluded.class_id,
  gender = excluded.gender,
  status = excluded.status;

notify pgrst, 'reload schema';

commit;

select 'users_profile' as table_name, role, count(*) as total
from public.users_profile
where role in ('admin', 'guru', 'siswa')
group by role
union all
select 'classes', null, count(*) from public.classes
union all
select 'subjects', null, count(*) from public.subjects
union all
select 'teachers', null, count(*) from public.teachers
union all
select 'students', null, count(*) from public.students
order by table_name, role;
