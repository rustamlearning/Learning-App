-- IsleLearn teacher NIP login repair
-- Run once in Supabase Dashboard > SQL Editor.

begin;

create unique index if not exists login_aliases_username_uidx
  on public.login_aliases (username);

insert into public.login_aliases (profile_id, username, email, role)
select
  profile.id,
  lower(regexp_replace(teacher.nip, '\s+', '', 'g')),
  lower(profile.email),
  'guru'
from public.teachers teacher
join public.users_profile profile on profile.id = teacher.user_id
where profile.role = 'guru'
  and profile.email is not null
  and teacher.nip is not null
  and trim(teacher.nip) <> ''
on conflict (username) do update set
  profile_id = excluded.profile_id,
  email = excluded.email,
  role = excluded.role;

create or replace function public.resolve_login_email(login_identifier text)
returns table(email text)
language sql
security definer
stable
set search_path = public
as $$
  with normalized as (
    select
      lower(trim(regexp_replace(coalesce(login_identifier, ''), '\s+', ' ', 'g'))) as alias_username,
      lower(regexp_replace(coalesce(login_identifier, ''), '\s+', '', 'g')) as teacher_nip
  ),
  candidates as (
    select aliases.email as resolved_email, 0 as priority
    from public.login_aliases aliases
    cross join normalized
    where aliases.username = normalized.alias_username

    union all

    select profile.email as resolved_email, 1 as priority
    from public.teachers teacher
    join public.users_profile profile on profile.id = teacher.user_id
    cross join normalized
    where profile.role = 'guru'
      and lower(regexp_replace(coalesce(teacher.nip, ''), '\s+', '', 'g')) = normalized.teacher_nip
  )
  select candidates.resolved_email
  from candidates
  where candidates.resolved_email is not null
  order by candidates.priority
  limit 1;
$$;

grant execute on function public.resolve_login_email(text) to anon, authenticated;

commit;

select
  profile.name,
  teacher.nip,
  profile.email,
  aliases.username as login_nip,
  case when aliases.id is null then 'BELUM TERHUBUNG' else 'SIAP' end as login_status
from public.teachers teacher
join public.users_profile profile on profile.id = teacher.user_id
left join public.login_aliases aliases
  on aliases.profile_id = profile.id
  and aliases.username = lower(regexp_replace(teacher.nip, '\s+', '', 'g'))
order by profile.name;
