create extension if not exists "pgcrypto";

create table if not exists users_profile (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  name text not null,
  email text unique not null,
  role text not null check (role in ('siswa', 'guru', 'admin', 'pimpinan')),
  avatar_url text,
  status text not null default 'Aktif',
  created_at timestamptz not null default now()
);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade int not null,
  homeroom_teacher_id uuid references users_profile(id),
  academic_year text not null default '2026/2027',
  created_at timestamptz not null default now()
);

create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  teacher_id uuid references users_profile(id),
  created_at timestamptz not null default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users_profile(id) on delete cascade,
  nis text unique,
  nisn text unique,
  class_id uuid references classes(id),
  gender text,
  status text not null default 'Aktif',
  created_at timestamptz not null default now()
);

create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users_profile(id) on delete cascade,
  nip text unique,
  subject_id uuid references subjects(id),
  status text not null default 'Aktif',
  created_at timestamptz not null default now()
);

create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  content text,
  subject_id uuid references subjects(id),
  class_id uuid references classes(id),
  teacher_id uuid references users_profile(id),
  topic text,
  type text not null default 'Teks',
  status text not null default 'Draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  question_text text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer text,
  explanation text,
  subject_id uuid references subjects(id),
  class_id uuid references classes(id),
  topic text,
  difficulty text,
  type text not null default 'Pilihan ganda',
  created_by uuid references users_profile(id),
  created_at timestamptz not null default now()
);

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject_id uuid references subjects(id),
  class_id uuid references classes(id),
  teacher_id uuid references users_profile(id),
  duration int not null default 30,
  start_time timestamptz,
  end_time timestamptz,
  status text not null default 'Draft',
  created_at timestamptz not null default now()
);

create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade
);

create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade,
  student_id uuid references students(id),
  answers jsonb not null default '{}'::jsonb,
  score numeric,
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject_id uuid references subjects(id),
  class_id uuid references classes(id),
  teacher_id uuid references users_profile(id),
  deadline timestamptz,
  status text not null default 'Draft',
  created_at timestamptz not null default now()
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references assignments(id) on delete cascade,
  student_id uuid references students(id),
  answer_text text,
  file_url text,
  score numeric,
  feedback text,
  submitted_at timestamptz not null default now()
);

create table if not exists progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id),
  material_id uuid references materials(id) on delete cascade,
  status text not null default 'Belum Mulai',
  completed_at timestamptz
);

create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text
);

create table if not exists student_badges (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id),
  badge_id uuid references badges(id),
  earned_at timestamptz not null default now()
);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  target_role text,
  created_by uuid references users_profile(id),
  created_at timestamptz not null default now()
);

create unique index if not exists classes_name_academic_year_uidx on classes (name, academic_year);
create unique index if not exists materials_title_subject_class_uidx on materials (title, subject_id, class_id);
create unique index if not exists questions_text_subject_class_uidx on questions (question_text, subject_id, class_id);
create unique index if not exists quizzes_title_subject_class_uidx on quizzes (title, subject_id, class_id);
create unique index if not exists quiz_questions_quiz_question_uidx on quiz_questions (quiz_id, question_id);
create unique index if not exists students_user_uidx on students (user_id);
create unique index if not exists teachers_user_uidx on teachers (user_id);

create or replace function current_user_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from users_profile where auth_user_id = auth.uid() limit 1;
$$;

alter table users_profile enable row level security;
alter table classes enable row level security;
alter table subjects enable row level security;
alter table students enable row level security;
alter table teachers enable row level security;
alter table materials enable row level security;
alter table questions enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_attempts enable row level security;
alter table assignments enable row level security;
alter table submissions enable row level security;
alter table progress enable row level security;
alter table badges enable row level security;
alter table student_badges enable row level security;
alter table announcements enable row level security;

alter table materials add column if not exists topic text;
alter table materials add column if not exists type text not null default 'Teks';
alter table materials add column if not exists updated_at timestamptz not null default now();

drop policy if exists "Authenticated users can read profiles" on users_profile;
drop policy if exists "Authenticated users can read classes" on classes;
drop policy if exists "Authenticated users can read subjects" on subjects;
drop policy if exists "Authenticated users can read materials" on materials;
drop policy if exists "Authenticated users can read questions" on questions;
drop policy if exists "Authenticated users can read quizzes" on quizzes;
drop policy if exists "Authenticated users can read assignments" on assignments;
drop policy if exists "Authenticated users can read badges" on badges;
drop policy if exists "Teachers and admins can insert materials" on materials;
drop policy if exists "Teachers and admins can update materials" on materials;
drop policy if exists "Teachers and admins can delete materials" on materials;
drop policy if exists "Teachers and admins can insert questions" on questions;
drop policy if exists "Teachers and admins can update questions" on questions;
drop policy if exists "Teachers and admins can delete questions" on questions;
drop policy if exists "Teachers and admins can insert quizzes" on quizzes;
drop policy if exists "Teachers and admins can update quizzes" on quizzes;
drop policy if exists "Teachers and admins can delete quizzes" on quizzes;
drop policy if exists "Teachers and admins can manage quiz questions" on quiz_questions;
drop policy if exists "Authenticated users can read quiz questions" on quiz_questions;
drop policy if exists "Students can insert quiz attempts" on quiz_attempts;
drop policy if exists "Students and teachers can read quiz attempts" on quiz_attempts;
drop policy if exists "Admins can manage profiles" on users_profile;
drop policy if exists "Admins can manage classes" on classes;
drop policy if exists "Admins can manage subjects" on subjects;
drop policy if exists "Admins can manage students" on students;
drop policy if exists "Admins can manage teachers" on teachers;
drop policy if exists "Admins can read submissions" on submissions;
drop policy if exists "Admins can read progress" on progress;
drop policy if exists "Admins can read student badges" on student_badges;
drop policy if exists "Admins can read announcements" on announcements;

create policy "Authenticated users can read profiles" on users_profile for select to authenticated using (true);
create policy "Authenticated users can read classes" on classes for select to authenticated using (true);
create policy "Authenticated users can read subjects" on subjects for select to authenticated using (true);
create policy "Authenticated users can read materials" on materials for select to authenticated using (true);
create policy "Authenticated users can read questions" on questions for select to authenticated using (true);
create policy "Authenticated users can read quizzes" on quizzes for select to authenticated using (true);
create policy "Authenticated users can read quiz questions" on quiz_questions for select to authenticated using (true);
create policy "Authenticated users can read assignments" on assignments for select to authenticated using (true);
create policy "Authenticated users can read badges" on badges for select to authenticated using (true);

create policy "Admins can manage profiles" on users_profile
  for all to authenticated
  using (current_user_role() = 'admin')
  with check (current_user_role() = 'admin');

create policy "Admins can manage classes" on classes
  for all to authenticated
  using (current_user_role() = 'admin')
  with check (current_user_role() = 'admin');

create policy "Admins can manage subjects" on subjects
  for all to authenticated
  using (current_user_role() = 'admin')
  with check (current_user_role() = 'admin');

create policy "Admins can manage students" on students
  for all to authenticated
  using (current_user_role() = 'admin')
  with check (current_user_role() = 'admin');

create policy "Admins can manage teachers" on teachers
  for all to authenticated
  using (current_user_role() = 'admin')
  with check (current_user_role() = 'admin');

create policy "Admins can read submissions" on submissions
  for select to authenticated
  using (current_user_role() in ('admin', 'pimpinan'));

create policy "Admins can read progress" on progress
  for select to authenticated
  using (current_user_role() in ('admin', 'pimpinan'));

create policy "Admins can read student badges" on student_badges
  for select to authenticated
  using (current_user_role() in ('admin', 'pimpinan'));

create policy "Admins can read announcements" on announcements
  for select to authenticated
  using (current_user_role() in ('admin', 'pimpinan'));

create policy "Teachers and admins can insert materials" on materials
  for insert to authenticated
  with check (
    exists (
      select 1 from users_profile profile
      where profile.auth_user_id = auth.uid()
        and (
          profile.role = 'admin'
          or (profile.role = 'guru' and profile.id = teacher_id)
        )
    )
  );

create policy "Teachers and admins can update materials" on materials
  for update to authenticated
  using (
    exists (
      select 1 from users_profile profile
      where profile.auth_user_id = auth.uid()
        and (
          profile.role = 'admin'
          or (profile.role = 'guru' and profile.id = teacher_id)
        )
    )
  )
  with check (
    exists (
      select 1 from users_profile profile
      where profile.auth_user_id = auth.uid()
        and (
          profile.role = 'admin'
          or (profile.role = 'guru' and profile.id = teacher_id)
        )
    )
  );

create policy "Teachers and admins can delete materials" on materials
  for delete to authenticated
  using (
    exists (
      select 1 from users_profile profile
      where profile.auth_user_id = auth.uid()
        and (
          profile.role = 'admin'
          or (profile.role = 'guru' and profile.id = teacher_id)
        )
    )
  );

create policy "Teachers and admins can insert questions" on questions
  for insert to authenticated
  with check (
    exists (
      select 1 from users_profile profile
      where profile.auth_user_id = auth.uid()
        and (
          profile.role = 'admin'
          or (profile.role = 'guru' and profile.id = created_by)
        )
    )
  );

create policy "Teachers and admins can update questions" on questions
  for update to authenticated
  using (
    exists (
      select 1 from users_profile profile
      where profile.auth_user_id = auth.uid()
        and (
          profile.role = 'admin'
          or (profile.role = 'guru' and profile.id = created_by)
        )
    )
  )
  with check (
    exists (
      select 1 from users_profile profile
      where profile.auth_user_id = auth.uid()
        and (
          profile.role = 'admin'
          or (profile.role = 'guru' and profile.id = created_by)
        )
    )
  );

create policy "Teachers and admins can delete questions" on questions
  for delete to authenticated
  using (
    exists (
      select 1 from users_profile profile
      where profile.auth_user_id = auth.uid()
        and (
          profile.role = 'admin'
          or (profile.role = 'guru' and profile.id = created_by)
        )
    )
  );

create policy "Teachers and admins can insert quizzes" on quizzes
  for insert to authenticated
  with check (
    exists (
      select 1 from users_profile profile
      where profile.auth_user_id = auth.uid()
        and (
          profile.role = 'admin'
          or (profile.role = 'guru' and profile.id = teacher_id)
        )
    )
  );

create policy "Teachers and admins can update quizzes" on quizzes
  for update to authenticated
  using (
    exists (
      select 1 from users_profile profile
      where profile.auth_user_id = auth.uid()
        and (
          profile.role = 'admin'
          or (profile.role = 'guru' and profile.id = teacher_id)
        )
    )
  )
  with check (
    exists (
      select 1 from users_profile profile
      where profile.auth_user_id = auth.uid()
        and (
          profile.role = 'admin'
          or (profile.role = 'guru' and profile.id = teacher_id)
        )
    )
  );

create policy "Teachers and admins can delete quizzes" on quizzes
  for delete to authenticated
  using (
    exists (
      select 1 from users_profile profile
      where profile.auth_user_id = auth.uid()
        and (
          profile.role = 'admin'
          or (profile.role = 'guru' and profile.id = teacher_id)
        )
    )
  );

create policy "Teachers and admins can manage quiz questions" on quiz_questions
  for all to authenticated
  using (
    exists (
      select 1
      from quizzes quiz
      join users_profile profile on profile.id = quiz.teacher_id
      where quiz.id = quiz_questions.quiz_id
        and profile.auth_user_id = auth.uid()
        and profile.role in ('guru', 'admin')
    )
  )
  with check (
    exists (
      select 1
      from quizzes quiz
      join users_profile profile on profile.id = quiz.teacher_id
      where quiz.id = quiz_questions.quiz_id
        and profile.auth_user_id = auth.uid()
        and profile.role in ('guru', 'admin')
    )
  );

create policy "Students can insert quiz attempts" on quiz_attempts
  for insert to authenticated
  with check (
    student_id is null
    or exists (
      select 1
      from students student
      join users_profile profile on profile.id = student.user_id
      where student.id = student_id
        and profile.auth_user_id = auth.uid()
        and profile.role = 'siswa'
    )
  );

create policy "Students and teachers can read quiz attempts" on quiz_attempts
  for select to authenticated
  using (
    exists (
      select 1 from users_profile profile
      where profile.auth_user_id = auth.uid()
        and profile.role in ('guru', 'admin', 'pimpinan')
    )
    or student_id is null
    or exists (
      select 1
      from students student
      join users_profile profile on profile.id = student.user_id
      where student.id = student_id
        and profile.auth_user_id = auth.uid()
    )
  );
