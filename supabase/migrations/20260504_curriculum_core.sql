-- SEA Learning Curriculum Core
-- Kurikulum Merdeka + Pembelajaran Mendalam
-- Additive/idempotent migration. Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists academic_years (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  start_date date,
  end_date date,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists semesters (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid references academic_years(id) on delete cascade,
  name text not null,
  start_date date,
  end_date date,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists curriculum_subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  group_name text not null default 'Umum',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists curriculum_phases (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  grade_range text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists curriculum_elements (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references curriculum_subjects(id) on delete cascade,
  phase_id uuid references curriculum_phases(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists learning_outcomes (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references curriculum_subjects(id) on delete cascade,
  phase_id uuid references curriculum_phases(id) on delete cascade,
  element_id uuid references curriculum_elements(id) on delete set null,
  code text unique not null,
  statement text not null,
  official_source text,
  verification_status text not null default 'Perlu verifikasi CP resmi',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists learning_objectives (
  id uuid primary key default gen_random_uuid(),
  learning_outcome_id uuid references learning_outcomes(id) on delete cascade,
  subject_id uuid references curriculum_subjects(id) on delete cascade,
  phase_id uuid references curriculum_phases(id) on delete cascade,
  grade int,
  semester int,
  code text unique not null,
  objective text not null,
  indicators text,
  suggested_assessment text,
  deep_learning_focus jsonb not null default '{}'::jsonb,
  is_school_custom boolean not null default true,
  verification_status text not null default 'Template sekolah - perlu verifikasi',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists learning_objective_flow (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references curriculum_subjects(id) on delete cascade,
  phase_id uuid references curriculum_phases(id) on delete cascade,
  grade int,
  semester int,
  sequence_number int not null default 1,
  learning_objective_id uuid references learning_objectives(id) on delete cascade,
  suggested_duration text,
  prerequisite_objective_id uuid references learning_objectives(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

alter table materials add column if not exists learning_objective_id uuid references learning_objectives(id) on delete set null;
alter table questions add column if not exists learning_objective_id uuid references learning_objectives(id) on delete set null;
alter table quizzes add column if not exists learning_objective_id uuid references learning_objectives(id) on delete set null;
alter table assignments add column if not exists learning_objective_id uuid references learning_objectives(id) on delete set null;

create unique index if not exists semesters_year_name_uidx on semesters (academic_year_id, name);
create unique index if not exists curriculum_elements_uidx on curriculum_elements (subject_id, phase_id, name);
create unique index if not exists learning_objective_flow_uidx on learning_objective_flow (subject_id, phase_id, grade, semester, sequence_number, learning_objective_id);

create index if not exists curriculum_subjects_code_idx on curriculum_subjects (code);
create index if not exists curriculum_subjects_active_idx on curriculum_subjects (is_active);
create index if not exists curriculum_elements_subject_phase_idx on curriculum_elements (subject_id, phase_id);
create index if not exists learning_outcomes_subject_phase_idx on learning_outcomes (subject_id, phase_id);
create index if not exists learning_objectives_subject_phase_grade_semester_idx on learning_objectives (subject_id, phase_id, grade, semester);
create index if not exists learning_objectives_active_idx on learning_objectives (is_active);
create index if not exists learning_objective_flow_subject_grade_semester_idx on learning_objective_flow (subject_id, grade, semester, sequence_number);

create index if not exists materials_learning_objective_id_idx on materials (learning_objective_id);
create index if not exists questions_learning_objective_id_idx on questions (learning_objective_id);
create index if not exists quizzes_learning_objective_id_idx on quizzes (learning_objective_id);
create index if not exists assignments_learning_objective_id_idx on assignments (learning_objective_id);

create index if not exists materials_status_idx on materials (status);
create index if not exists materials_teacher_id_idx on materials (teacher_id);
create index if not exists materials_subject_id_idx on materials (subject_id);
create index if not exists materials_class_id_idx on materials (class_id);
create index if not exists materials_updated_at_idx on materials (updated_at desc);

create index if not exists questions_subject_id_idx on questions (subject_id);
create index if not exists questions_class_id_idx on questions (class_id);
create index if not exists questions_created_by_idx on questions (created_by);

create index if not exists quizzes_subject_id_idx on quizzes (subject_id);
create index if not exists quizzes_class_id_idx on quizzes (class_id);
create index if not exists quizzes_teacher_id_idx on quizzes (teacher_id);
create index if not exists quizzes_status_idx on quizzes (status);

create index if not exists assignments_subject_id_idx on assignments (subject_id);
create index if not exists assignments_class_id_idx on assignments (class_id);
create index if not exists assignments_teacher_id_idx on assignments (teacher_id);
create index if not exists assignments_status_idx on assignments (status);

create or replace function current_user_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from users_profile where auth_user_id = auth.uid() limit 1;
$$;

alter table academic_years enable row level security;
alter table semesters enable row level security;
alter table curriculum_subjects enable row level security;
alter table curriculum_phases enable row level security;
alter table curriculum_elements enable row level security;
alter table learning_outcomes enable row level security;
alter table learning_objectives enable row level security;
alter table learning_objective_flow enable row level security;

drop policy if exists "Authenticated users can read academic years" on academic_years;
drop policy if exists "Authenticated users can read semesters" on semesters;
drop policy if exists "Authenticated users can read curriculum subjects" on curriculum_subjects;
drop policy if exists "Authenticated users can read curriculum phases" on curriculum_phases;
drop policy if exists "Authenticated users can read curriculum elements" on curriculum_elements;
drop policy if exists "Authenticated users can read learning outcomes" on learning_outcomes;
drop policy if exists "Authenticated users can read learning objectives" on learning_objectives;
drop policy if exists "Authenticated users can read learning objective flow" on learning_objective_flow;

drop policy if exists "Admins can manage academic years" on academic_years;
drop policy if exists "Admins can manage semesters" on semesters;
drop policy if exists "Admins can manage curriculum subjects" on curriculum_subjects;
drop policy if exists "Admins can manage curriculum phases" on curriculum_phases;
drop policy if exists "Admins can manage curriculum elements" on curriculum_elements;
drop policy if exists "Admins can manage learning outcomes" on learning_outcomes;
drop policy if exists "Admins can manage learning objectives" on learning_objectives;
drop policy if exists "Admins can manage learning objective flow" on learning_objective_flow;

create policy "Authenticated users can read academic years" on academic_years for select to authenticated using (true);
create policy "Authenticated users can read semesters" on semesters for select to authenticated using (true);
create policy "Authenticated users can read curriculum subjects" on curriculum_subjects for select to authenticated using (true);
create policy "Authenticated users can read curriculum phases" on curriculum_phases for select to authenticated using (true);
create policy "Authenticated users can read curriculum elements" on curriculum_elements for select to authenticated using (true);
create policy "Authenticated users can read learning outcomes" on learning_outcomes for select to authenticated using (true);
create policy "Authenticated users can read learning objectives" on learning_objectives for select to authenticated using (true);
create policy "Authenticated users can read learning objective flow" on learning_objective_flow for select to authenticated using (true);

create policy "Admins can manage academic years" on academic_years for all to authenticated using (current_user_role() = 'admin') with check (current_user_role() = 'admin');
create policy "Admins can manage semesters" on semesters for all to authenticated using (current_user_role() = 'admin') with check (current_user_role() = 'admin');
create policy "Admins can manage curriculum subjects" on curriculum_subjects for all to authenticated using (current_user_role() = 'admin') with check (current_user_role() = 'admin');
create policy "Admins can manage curriculum phases" on curriculum_phases for all to authenticated using (current_user_role() = 'admin') with check (current_user_role() = 'admin');
create policy "Admins can manage curriculum elements" on curriculum_elements for all to authenticated using (current_user_role() = 'admin') with check (current_user_role() = 'admin');
create policy "Admins can manage learning outcomes" on learning_outcomes for all to authenticated using (current_user_role() = 'admin') with check (current_user_role() = 'admin');
create policy "Admins can manage learning objectives" on learning_objectives for all to authenticated using (current_user_role() = 'admin') with check (current_user_role() = 'admin');
create policy "Admins can manage learning objective flow" on learning_objective_flow for all to authenticated using (current_user_role() = 'admin') with check (current_user_role() = 'admin');
