create extension if not exists "pgcrypto";

create or replace function current_user_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from users_profile where auth_user_id = auth.uid() limit 1;
$$;

create table if not exists attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  scope_key text unique not null,
  client_session_id text,
  type text not null check (type in ('daily', 'subject')),
  attendance_date date not null,
  class_id uuid references classes(id),
  class_name text not null,
  subject_id uuid references subjects(id),
  subject_name text,
  lesson_time text,
  recorded_by uuid references users_profile(id),
  teacher_name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists attendance_rows (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references attendance_sessions(id) on delete cascade,
  student_id uuid references students(id),
  student_key text not null,
  student_name text not null,
  nis text,
  class_name text,
  status text not null default 'Hadir' check (status in ('Hadir', 'Izin', 'Sakit', 'Alpa')),
  note text,
  row_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table classes add column if not exists homeroom_teacher_id uuid references users_profile(id);
alter table attendance_sessions add column if not exists scope_key text;
alter table attendance_sessions add column if not exists client_session_id text;
alter table attendance_sessions add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table attendance_rows add column if not exists student_key text;
alter table attendance_rows add column if not exists row_order int not null default 0;

create unique index if not exists attendance_sessions_scope_key_uidx on attendance_sessions (scope_key);
create index if not exists attendance_sessions_date_idx on attendance_sessions (attendance_date);
create index if not exists attendance_sessions_class_idx on attendance_sessions (class_id);
create index if not exists attendance_sessions_subject_idx on attendance_sessions (subject_id);
create index if not exists attendance_sessions_recorded_by_idx on attendance_sessions (recorded_by);
create unique index if not exists attendance_rows_session_student_key_uidx on attendance_rows (session_id, student_key);
create index if not exists attendance_rows_session_idx on attendance_rows (session_id);
create index if not exists attendance_rows_student_idx on attendance_rows (student_id);

alter table attendance_sessions enable row level security;
alter table attendance_rows enable row level security;

create or replace function can_manage_attendance_session(session_recorded_by uuid, session_class_id uuid, session_subject_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select current_user_role() = 'admin'
    or exists (
      select 1
      from users_profile profile
      where profile.auth_user_id = auth.uid()
        and profile.role = 'guru'
        and (
          profile.id = session_recorded_by
          or exists (
            select 1
            from subjects subject
            where subject.id = session_subject_id
              and subject.teacher_id = profile.id
          )
          or exists (
            select 1
            from classes class_row
            where class_row.id = session_class_id
              and class_row.homeroom_teacher_id = profile.id
          )
        )
    );
$$;

drop policy if exists "School staff can read attendance sessions" on attendance_sessions;
drop policy if exists "Teachers and admins can manage attendance sessions" on attendance_sessions;
drop policy if exists "School staff can read attendance rows" on attendance_rows;
drop policy if exists "Teachers and admins can manage attendance rows" on attendance_rows;

grant execute on function can_manage_attendance_session(uuid, uuid, uuid) to authenticated;
grant select, insert, update, delete on attendance_sessions to authenticated;
grant select, insert, update, delete on attendance_rows to authenticated;

create policy "School staff can read attendance sessions" on attendance_sessions
  for select to authenticated
  using (current_user_role() in ('admin', 'guru', 'pimpinan'));

create policy "Teachers and admins can manage attendance sessions" on attendance_sessions
  for all to authenticated
  using (can_manage_attendance_session(recorded_by, class_id, subject_id))
  with check (can_manage_attendance_session(recorded_by, class_id, subject_id));

create policy "School staff can read attendance rows" on attendance_rows
  for select to authenticated
  using (current_user_role() in ('admin', 'guru', 'pimpinan'));

create policy "Teachers and admins can manage attendance rows" on attendance_rows
  for all to authenticated
  using (
    exists (
      select 1
      from attendance_sessions session
      where session.id = attendance_rows.session_id
        and can_manage_attendance_session(session.recorded_by, session.class_id, session.subject_id)
    )
  )
  with check (
    exists (
      select 1
      from attendance_sessions session
      where session.id = attendance_rows.session_id
        and can_manage_attendance_session(session.recorded_by, session.class_id, session.subject_id)
    )
  );
