-- Enable multiple subjects for each IsleLearn teacher.
-- Run in Supabase Dashboard > SQL Editor before using the multi-subject admin form.

begin;

create table if not exists public.teacher_subjects (
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (teacher_id, subject_id)
);

create index if not exists teacher_subjects_subject_idx
  on public.teacher_subjects (subject_id);

insert into public.teacher_subjects (teacher_id, subject_id)
select id, subject_id
from public.teachers
where subject_id is not null
on conflict (teacher_id, subject_id) do nothing;

insert into public.teacher_subjects (teacher_id, subject_id)
select teacher.id, subject.id
from public.subjects subject
join public.teachers teacher on teacher.user_id = subject.teacher_id
where subject.teacher_id is not null
on conflict (teacher_id, subject_id) do nothing;

alter table public.teacher_subjects enable row level security;

drop policy if exists "Authenticated users can read teacher subjects" on public.teacher_subjects;
drop policy if exists "Admins can manage teacher subjects" on public.teacher_subjects;

create policy "Authenticated users can read teacher subjects" on public.teacher_subjects
  for select to authenticated
  using (
    public.current_user_role() in ('admin', 'pimpinan')
    or exists (
      select 1
      from public.teachers teacher
      join public.users_profile profile on profile.id = teacher.user_id
      where teacher.id = teacher_subjects.teacher_id
        and profile.auth_user_id = auth.uid()
    )
  );

create policy "Admins can manage teacher subjects" on public.teacher_subjects
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

notify pgrst, 'reload schema';

commit;

select count(*) as teacher_subject_links
from public.teacher_subjects;
