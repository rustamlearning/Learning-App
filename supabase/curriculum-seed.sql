-- SEA Learning Curriculum Seed
-- Template awal CP/TP/ATP Kurikulum Merdeka.
-- CP/TP/ATP yang berstatus "Perlu verifikasi" harus diverifikasi/diedit sekolah.
-- Default mapel agama: Pendidikan Agama Islam dan Budi Pekerti saja.

insert into academic_years (name, start_date, end_date, is_active)
values ('2026/2027', '2026-07-01', '2027-06-30', true)
on conflict (name) do update set
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  is_active = excluded.is_active;

insert into semesters (academic_year_id, name, start_date, end_date, is_active)
select id, 'Ganjil', '2026-07-01', '2026-12-31', true
from academic_years where name = '2026/2027'
on conflict (academic_year_id, name) do update set
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  is_active = excluded.is_active;

insert into semesters (academic_year_id, name, start_date, end_date, is_active)
select id, 'Genap', '2027-01-01', '2027-06-30', false
from academic_years where name = '2026/2027'
on conflict (academic_year_id, name) do update set
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  is_active = excluded.is_active;

insert into curriculum_phases (name, grade_range, description)
values
  ('Fase E', 'Kelas X', 'Fase E untuk kelas X SMA/MA.'),
  ('Fase F', 'Kelas XI-XII', 'Fase F untuk kelas XI dan XII SMA/MA.')
on conflict (name) do update set
  grade_range = excluded.grade_range,
  description = excluded.description;

insert into curriculum_subjects (name, code, group_name, is_active)
values
  ('Pendidikan Agama Islam dan Budi Pekerti', 'PAI', 'Umum', true),
  ('Pendidikan Pancasila', 'PPKN', 'Umum', true),
  ('Bahasa Indonesia', 'BIN', 'Umum', true),
  ('Matematika', 'MTK', 'Umum', true),
  ('Bahasa Inggris', 'BIG', 'Umum', true),
  ('PJOK', 'PJOK', 'Umum', true),
  ('Sejarah', 'SEJ', 'Umum', true),
  ('Seni Budaya', 'SENI', 'Umum', true),
  ('Informatika', 'INF', 'Umum/MIPA', true),
  ('Matematika Tingkat Lanjut', 'MTKL', 'MIPA/Pilihan', true),
  ('Fisika', 'FIS', 'MIPA', true),
  ('Kimia', 'KIM', 'MIPA', true),
  ('Biologi', 'BIO', 'MIPA', true),
  ('Ekonomi', 'EKO', 'IPS', true),
  ('Geografi', 'GEO', 'IPS', true),
  ('Sosiologi', 'SOS', 'IPS', true),
  ('Sejarah Tingkat Lanjut', 'SEJL', 'IPS/Pilihan', true),
  ('Bahasa Inggris Tingkat Lanjut', 'BIGL', 'Pilihan', true),
  ('Prakarya dan Kewirausahaan', 'PKWU', 'Pilihan', true),
  ('Muatan Lokal', 'MULOK', 'Lokal', false)
on conflict (code) do update set
  name = excluded.name,
  group_name = excluded.group_name,
  is_active = excluded.is_active;

with subject_phase as (
  select s.id as subject_id, s.code, s.name as subject_name, p.id as phase_id, p.name as phase_name
  from curriculum_subjects s
  cross join curriculum_phases p
  where s.is_active = true
),
element_templates as (
  select * from (values
    ('Pemahaman Konsep', 'Membangun pemahaman konsep, prinsip, fakta, prosedur, dan hubungan antargagasan.'),
    ('Aplikasi Kontekstual', 'Menerapkan konsep pada masalah nyata, konteks lokal, proyek, atau situasi lintas disiplin.'),
    ('Refleksi dan Komunikasi', 'Merefleksikan proses belajar, menyampaikan gagasan, dan menguatkan karakter.')
  ) as t(name, description)
)
insert into curriculum_elements (subject_id, phase_id, name, description)
select subject_id, phase_id, name, description
from subject_phase
cross join element_templates
on conflict (subject_id, phase_id, name) do update set
  description = excluded.description;

with elements as (
  select
    s.code as subject_code,
    s.name as subject_name,
    p.name as phase_name,
    p.id as phase_id,
    e.id as element_id,
    e.name as element_name,
    s.id as subject_id
  from curriculum_elements e
  join curriculum_subjects s on s.id = e.subject_id
  join curriculum_phases p on p.id = e.phase_id
  where s.is_active = true
)
insert into learning_outcomes (
  subject_id,
  phase_id,
  element_id,
  code,
  statement,
  official_source,
  verification_status,
  is_active
)
select
  subject_id,
  phase_id,
  element_id,
  subject_code || '-' || replace(phase_name, ' ', '') || '-' || regexp_replace(upper(element_name), '[^A-Z0-9]+', '-', 'g') as code,
  'Template CP ' || subject_name || ' ' || phase_name || ' pada elemen ' || element_name || '. Isi ini adalah placeholder awal dan perlu diverifikasi dengan dokumen CP resmi Kurikulum Merdeka sebelum digunakan sebagai rujukan final.' as statement,
  'Template awal SEA Learning - perlu verifikasi dokumen resmi',
  'Perlu verifikasi CP resmi',
  true
from elements
on conflict (code) do update set
  statement = excluded.statement,
  official_source = excluded.official_source,
  verification_status = excluded.verification_status,
  is_active = excluded.is_active;

with outcomes as (
  select
    lo.id as learning_outcome_id,
    s.id as subject_id,
    s.code as subject_code,
    s.name as subject_name,
    p.id as phase_id,
    p.name as phase_name,
    ce.name as element_name
  from learning_outcomes lo
  join curriculum_subjects s on s.id = lo.subject_id
  join curriculum_phases p on p.id = lo.phase_id
  left join curriculum_elements ce on ce.id = lo.element_id
  where s.is_active = true
),
grade_semester as (
  select 'Fase E' as phase_name, 10 as grade, 1 as semester
  union all select 'Fase E', 10, 2
  union all select 'Fase F', 11, 1
  union all select 'Fase F', 11, 2
  union all select 'Fase F', 12, 1
  union all select 'Fase F', 12, 2
)
insert into learning_objectives (
  learning_outcome_id,
  subject_id,
  phase_id,
  grade,
  semester,
  code,
  objective,
  indicators,
  suggested_assessment,
  deep_learning_focus,
  is_school_custom,
  verification_status,
  is_active
)
select
  o.learning_outcome_id,
  o.subject_id,
  o.phase_id,
  gs.grade,
  gs.semester,
  o.subject_code || '-K' || gs.grade || '-S' || gs.semester || '-' || regexp_replace(upper(o.element_name), '[^A-Z0-9]+', '-', 'g') as code,
  'Siswa mampu memahami, mengaplikasikan, dan merefleksikan konsep inti ' || o.subject_name || ' pada elemen ' || o.element_name || ' sesuai konteks kelas ' || gs.grade || ' semester ' || gs.semester || '.' as objective,
  'Indikator template: siswa menjelaskan konsep, menerapkan pada konteks nyata, menyelesaikan latihan/aktivitas, dan menuliskan refleksi belajar.',
  'Diagnostik awal, formatif proses, refleksi diri, dan asesmen akhir berbasis produk/kuis/tugas.',
  jsonb_build_object(
    'experiences', jsonb_build_array('Memahami', 'Mengaplikasi', 'Merefleksi'),
    'principles', jsonb_build_array('Berkesadaran', 'Bermakna', 'Menggembirakan'),
    'holistic', jsonb_build_array('Olah pikir', 'Olah hati', 'Olah rasa'),
    'assessment', jsonb_build_array('Assessment as learning', 'Assessment for learning', 'Assessment of learning')
  ),
  true,
  'Template sekolah - perlu verifikasi',
  true
from outcomes o
join grade_semester gs on gs.phase_name = o.phase_name
on conflict (code) do update set
  objective = excluded.objective,
  indicators = excluded.indicators,
  suggested_assessment = excluded.suggested_assessment,
  deep_learning_focus = excluded.deep_learning_focus,
  verification_status = excluded.verification_status,
  is_active = excluded.is_active;

with objectives as (
  select
    lo.id,
    lo.subject_id,
    lo.phase_id,
    lo.grade,
    lo.semester,
    row_number() over (partition by lo.subject_id, lo.grade, lo.semester order by lo.code) as seq
  from learning_objectives lo
  where lo.is_active = true
)
insert into learning_objective_flow (
  subject_id,
  phase_id,
  grade,
  semester,
  sequence_number,
  learning_objective_id,
  suggested_duration,
  notes
)
select
  subject_id,
  phase_id,
  grade,
  semester,
  seq,
  id,
  '2-4 JP',
  'ATP template awal. Sekolah/guru dapat menyesuaikan urutan, durasi, dan catatan sesuai konteks.'
from objectives
on conflict (subject_id, phase_id, grade, semester, sequence_number, learning_objective_id) do update set
  suggested_duration = excluded.suggested_duration,
  notes = excluded.notes;
