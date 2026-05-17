-- IsleLearn Production Smoke Test
-- Jalankan di Supabase SQL Editor setelah schema, seed, dan akun Auth selesai dihubungkan.

-- 1. Cek profile utama dan auth_user_id
select
  role,
  name,
  email,
  status,
  case
    when auth_user_id is null then 'BELUM TERHUBUNG'
    else 'TERHUBUNG'
  end as auth_status
from users_profile
order by role, name;

-- 2. Cek alias login
select
  username,
  email,
  role
from login_aliases
order by role, username;

-- 3. Cek jumlah data inti
select 'users_profile' as table_name, count(*) as total from users_profile
union all select 'login_aliases', count(*) from login_aliases
union all select 'classes', count(*) from classes
union all select 'subjects', count(*) from subjects
union all select 'students', count(*) from students
union all select 'teachers', count(*) from teachers
union all select 'materials', count(*) from materials
union all select 'questions', count(*) from questions
union all select 'quizzes', count(*) from quizzes
union all select 'quiz_questions', count(*) from quiz_questions;

-- 4. Cek guru dan mapel
select
  profile.name as teacher_name,
  profile.email,
  teacher.nip,
  subject.name as subject_name,
  teacher.status
from teachers teacher
join users_profile profile on profile.id = teacher.user_id
left join subjects subject on subject.id = teacher.subject_id
order by profile.name;

-- 5. Cek siswa dan kelas
select
  profile.name as student_name,
  profile.email,
  student.nis,
  student.nisn,
  class.name as class_name,
  student.status
from students student
join users_profile profile on profile.id = student.user_id
left join classes class on class.id = student.class_id
order by profile.name;

-- 6. Cek materi publish
select
  material.title,
  material.status,
  subject.name as subject_name,
  class.name as class_name,
  teacher.name as teacher_name
from materials material
left join subjects subject on subject.id = material.subject_id
left join classes class on class.id = material.class_id
left join users_profile teacher on teacher.id = material.teacher_id
order by material.created_at desc
limit 20;

-- 7. Cek kuis dan soal
select
  quiz.title,
  quiz.status,
  quiz.duration,
  subject.name as subject_name,
  class.name as class_name,
  count(quiz_question.question_id) as total_questions
from quizzes quiz
left join subjects subject on subject.id = quiz.subject_id
left join classes class on class.id = quiz.class_id
left join quiz_questions quiz_question on quiz_question.quiz_id = quiz.id
group by quiz.id, subject.name, class.name
order by quiz.created_at desc;
