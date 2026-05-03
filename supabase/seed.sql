insert into users_profile (name, email, role, status)
values
  ('Andi Saputra', 'siswa@sea-learning.local', 'siswa', 'Aktif'),
  ('Rustam, S.Pd.', 'guru@sea-learning.local', 'guru', 'Aktif'),
  ('Admin Sekolah', 'admin@sea-learning.local', 'admin', 'Aktif'),
  ('Wakasek Kesiswaan', 'pimpinan@sea-learning.local', 'pimpinan', 'Aktif')
on conflict (email) do update set
  name = excluded.name,
  role = excluded.role,
  status = excluded.status;

insert into login_aliases (profile_id, username, email, role)
select id, lower(regexp_replace(name, '\s+', ' ', 'g')), lower(email), role
from users_profile
where email in (
  'siswa@sea-learning.local',
  'guru@sea-learning.local',
  'admin@sea-learning.local',
  'pimpinan@sea-learning.local'
)
on conflict (username) do update set
  profile_id = excluded.profile_id,
  email = excluded.email,
  role = excluded.role;

insert into classes (name, grade, academic_year)
values
  ('X.1', 10, '2026/2027'),
  ('X.2', 10, '2026/2027'),
  ('XI.1', 11, '2026/2027'),
  ('XI.2', 11, '2026/2027'),
  ('XII.1', 12, '2026/2027')
on conflict (name, academic_year) do update set
  grade = excluded.grade;

insert into subjects (name, code, teacher_id)
values
  ('Bahasa Inggris', 'BIG', (select id from users_profile where email = 'guru@sea-learning.local')),
  ('Matematika', 'MTK', null),
  ('Bahasa Indonesia', 'BIN', null),
  ('Biologi', 'BIO', null),
  ('Kimia', 'KIM', null),
  ('Fisika', 'FIS', null),
  ('Sejarah', 'SEJ', null),
  ('Ekonomi', 'EKO', null)
on conflict (code) do update set
  name = excluded.name,
  teacher_id = excluded.teacher_id;

insert into students (user_id, nis, nisn, class_id, gender, status)
values (
  (select id from users_profile where email = 'siswa@sea-learning.local'),
  '2026001',
  '006120001',
  (select id from classes where name = 'X.1' and academic_year = '2026/2027'),
  'L',
  'Aktif'
)
on conflict (user_id) do update set
  nis = excluded.nis,
  nisn = excluded.nisn,
  class_id = excluded.class_id,
  gender = excluded.gender,
  status = excluded.status;

insert into teachers (user_id, nip, subject_id, status)
values (
  (select id from users_profile where email = 'guru@sea-learning.local'),
  '1987012026011',
  (select id from subjects where code = 'BIG'),
  'Aktif'
)
on conflict (user_id) do update set
  nip = excluded.nip,
  subject_id = excluded.subject_id,
  status = excluded.status;

insert into materials (title, description, content, subject_id, class_id, teacher_id, topic, type, status)
values
  (
    'Descriptive Text',
    'Materi text type ringan dibuka untuk jaringan kepulauan.',
    'Descriptive text adalah teks yang menjelaskan orang, tempat, benda, atau hewan secara detail. Struktur umumnya identification dan description. Hari ini, coba deskripsikan pulau atau sekolahmu dengan kalimat sederhana.',
    (select id from subjects where code = 'BIG'),
    (select id from classes where name = 'X.1' and academic_year = '2026/2027'),
    (select id from users_profile where email = 'guru@sea-learning.local'),
    'Text Type',
    'Teks',
    'Publish'
  ),
  (
    'Simple Present Tense',
    'Materi grammar singkat dengan contoh kalimat sehari-hari.',
    'Simple Present Tense dipakai untuk rutinitas, fakta umum, dan kebiasaan. Pola dasarnya Subject + Verb 1. Untuk he, she, it, tambahkan s/es pada verb.',
    (select id from subjects where code = 'BIG'),
    (select id from classes where name = 'X.1' and academic_year = '2026/2027'),
    (select id from users_profile where email = 'guru@sea-learning.local'),
    'Grammar',
    'Teks',
    'Publish'
  ),
  (
    'Narrative Text',
    'Materi reading bertahap dengan contoh cerita pendek.',
    'Narrative text menceritakan kejadian imajinatif atau pengalaman dengan struktur orientation, complication, dan resolution. Fokus utama: memahami alur cerita dan pesan moral.',
    (select id from subjects where code = 'BIG'),
    (select id from classes where name = 'XI.1' and academic_year = '2026/2027'),
    (select id from users_profile where email = 'guru@sea-learning.local'),
    'Reading',
    'Teks',
    'Draft'
  )
on conflict (title, subject_id, class_id) do update set
  description = excluded.description,
  content = excluded.content,
  teacher_id = excluded.teacher_id,
  topic = excluded.topic,
  type = excluded.type,
  status = excluded.status,
  updated_at = now();

insert into questions (question_text, options, correct_answer, explanation, subject_id, class_id, topic, difficulty, type, created_by)
values
  (
    'What is the purpose of descriptive text?',
    '["To describe details", "To argue an opinion", "To tell steps", "To announce news"]'::jsonb,
    'To describe details',
    'Descriptive text explains a person, place, animal, or object in detail.',
    (select id from subjects where code = 'BIG'),
    (select id from classes where name = 'X.1' and academic_year = '2026/2027'),
    'Text Type',
    'Mudah',
    'Pilihan ganda',
    (select id from users_profile where email = 'guru@sea-learning.local')
  ),
  (
    'Which sentence uses simple present tense correctly?',
    '["She studies every morning", "She studied tomorrow", "She studying every day", "She study yesterday"]'::jsonb,
    'She studies every morning',
    'Simple present uses verb 1. For she/he/it, add s or es to the verb.',
    (select id from subjects where code = 'BIG'),
    (select id from classes where name = 'X.1' and academic_year = '2026/2027'),
    'Grammar',
    'Sedang',
    'Pilihan ganda',
    (select id from users_profile where email = 'guru@sea-learning.local')
  ),
  (
    'Mention the generic structure of narrative text.',
    '["Orientation, complication, resolution", "Goal, material, steps", "Thesis, argument, conclusion", "Identification, description"]'::jsonb,
    'Orientation, complication, resolution',
    'Narrative text usually has orientation, complication, and resolution.',
    (select id from subjects where code = 'BIG'),
    (select id from classes where name = 'XI.1' and academic_year = '2026/2027'),
    'Reading',
    'Sedang',
    'Pilihan ganda',
    (select id from users_profile where email = 'guru@sea-learning.local')
  )
on conflict (question_text, subject_id, class_id) do update set
  options = excluded.options,
  correct_answer = excluded.correct_answer,
  explanation = excluded.explanation,
  topic = excluded.topic,
  difficulty = excluded.difficulty,
  type = excluded.type,
  created_by = excluded.created_by;

insert into quizzes (title, description, subject_id, class_id, teacher_id, duration, status)
values (
  'Quiz Descriptive Text',
  'Kuis singkat untuk mengukur pemahaman descriptive text.',
  (select id from subjects where code = 'BIG'),
  (select id from classes where name = 'X.1' and academic_year = '2026/2027'),
  (select id from users_profile where email = 'guru@sea-learning.local'),
  20,
  'Publish'
)
on conflict (title, subject_id, class_id) do update set
  description = excluded.description,
  teacher_id = excluded.teacher_id,
  duration = excluded.duration,
  status = excluded.status;

insert into quiz_questions (quiz_id, question_id)
select
  (select id from quizzes where title = 'Quiz Descriptive Text'),
  question.id
from questions question
where question.subject_id = (select id from subjects where code = 'BIG')
  and question.class_id = (select id from classes where name = 'X.1' and academic_year = '2026/2027')
on conflict do nothing;

insert into assignments (title, description, subject_id, class_id, teacher_id, deadline, status)
values
  (
    'Daily Writing: My Island',
    'Write five English sentences about your island or neighborhood.',
    (select id from subjects where code = 'BIG'),
    (select id from classes where name = 'X.1' and academic_year = '2026/2027'),
    (select id from users_profile where email = 'guru@sea-learning.local'),
    '2026-05-06 23:59:00+08',
    'Aktif'
  ),
  (
    'Vocabulary Journal',
    'Collect ten new English words from your daily life and write the meanings.',
    (select id from subjects where code = 'BIG'),
    (select id from classes where name = 'X.1' and academic_year = '2026/2027'),
    (select id from users_profile where email = 'guru@sea-learning.local'),
    '2026-05-10 23:59:00+08',
    'Draft'
  )
on conflict (title, subject_id, class_id) do update set
  description = excluded.description,
  teacher_id = excluded.teacher_id,
  deadline = excluded.deadline,
  status = excluded.status;
