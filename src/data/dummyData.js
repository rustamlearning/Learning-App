import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Brain,
  DatabaseBackup,
  FileQuestion,
  FlaskConical,
  GraduationCap,
  Home,
  Layers3,
  LineChart,
  Megaphone,
  NotebookTabs,
  School,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  UsersRound,
} from 'lucide-react'

export const school = {
  name: 'SMA Negeri 6 Pangkajene dan Kepulauan',
  shortName: 'SMA Negeri 6 Pangkajene dan Kepulauan',
  appName: 'SEA Learning',
  tagline: 'Dari Pesisir ke Masa Depan Digital',
}

export const demoUsers = {
  siswa: {
    id: 'u-siswa-1',
    name: 'Andi Saputra',
    email: 'andi@sman6pangkep.sch.id',
    role: 'siswa',
    classId: 'kelas-x1',
    className: 'X.1',
    nis: '2026001',
    avatar: 'AS',
  },
  guru: {
    id: 'u-guru-1',
    name: 'Rustam, S.Pd.',
    email: 'rustam@sman6pangkep.sch.id',
    role: 'guru',
    subject: 'Bahasa Inggris',
    avatar: 'RS',
  },
  admin: {
    id: 'u-admin-1',
    name: 'Admin Sekolah',
    email: 'admin@sman6pangkep.sch.id',
    role: 'admin',
    avatar: 'AD',
  },
  pimpinan: {
    id: 'u-pimpinan-1',
    name: 'Wakasek Kesiswaan',
    email: 'wakasek@sman6pangkep.sch.id',
    role: 'pimpinan',
    avatar: 'WK',
  },
}

export const roleHome = {
  siswa: '/siswa/dashboard',
  guru: '/guru/dashboard',
  admin: '/admin/dashboard',
  pimpinan: '/pimpinan/dashboard',
}

export const roleLabels = {
  siswa: 'Siswa',
  guru: 'Guru',
  admin: 'Admin',
  pimpinan: 'Pimpinan',
}

export const navItems = {
  siswa: [
    { label: 'Dashboard', path: '/siswa/dashboard', icon: Home },
    { label: 'Kelas Saya', path: '/siswa/kelas', icon: School },
    { label: 'Materi Belajar', path: '/siswa/materi', icon: BookOpen },
    { label: 'Latihan', path: '/siswa/latihan', icon: Brain },
    { label: 'Kuis / Ujian', path: '/siswa/kuis', icon: FileQuestion },
    { label: 'Flashcard', path: '/siswa/flashcard', icon: Layers3 },
    { label: 'AI Tutor', path: '/siswa/ai-tutor', icon: Bot },
    { label: 'Nilai & Progres', path: '/siswa/progres', icon: LineChart },
    { label: 'Leaderboard', path: '/siswa/leaderboard', icon: Trophy },
    { label: 'SEAClub Corner', path: '/siswa/seaclub', icon: Sparkles },
    { label: 'Profil', path: '/siswa/profil', icon: UserRound },
  ],
  guru: [
    { label: 'Dashboard', path: '/guru/dashboard', icon: Home },
    { label: 'Kelas', path: '/guru/kelas', icon: School },
    { label: 'Materi', path: '/guru/materi', icon: BookOpen },
    { label: 'Bank Soal', path: '/guru/bank-soal', icon: FileQuestion },
    { label: 'Tugas', path: '/guru/tugas', icon: NotebookTabs },
    { label: 'Kuis Live', path: '/guru/kuis-live', icon: FlaskConical },
    { label: 'Studio Konten', path: '/guru/studio-konten', icon: Sparkles },
    { label: 'Analisis Nilai', path: '/guru/analisis-nilai', icon: BarChart3 },
    { label: 'Remedial', path: '/guru/remedial', icon: Brain },
    { label: 'AI Cepat', path: '/guru/ai-generator', icon: Sparkles },
    { label: 'Laporan', path: '/guru/laporan', icon: LineChart },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: Home },
    { label: 'Data Guru', path: '/admin/guru', icon: GraduationCap },
    { label: 'Data Siswa', path: '/admin/siswa', icon: UsersRound },
    { label: 'Data Kelas', path: '/admin/kelas', icon: School },
    { label: 'Mata Pelajaran', path: '/admin/mapel', icon: BookOpen },
    { label: 'Pengaturan', path: '/admin/pengaturan', icon: Settings },
    { label: 'Laporan Sekolah', path: '/admin/laporan', icon: LineChart },
    { label: 'Backup', path: '/admin/backup', icon: DatabaseBackup },
  ],
  pimpinan: [
    { label: 'Dashboard', path: '/pimpinan/dashboard', icon: Home },
    { label: 'Monitoring Kelas', path: '/pimpinan/monitoring-kelas', icon: School },
    { label: 'Monitoring Guru', path: '/pimpinan/monitoring-guru', icon: GraduationCap },
    { label: 'Monitoring Siswa', path: '/pimpinan/monitoring-siswa', icon: UsersRound },
    { label: 'Laporan Akademik', path: '/pimpinan/laporan-akademik', icon: LineChart },
    { label: 'Laporan Aktivitas', path: '/pimpinan/laporan-aktivitas', icon: Bell },
  ],
}

export const students = [
  ['Andi Saputra', '2026001', 'X.1', 1240, 5],
  ['Nur Aisyah', '2026002', 'X.1', 1180, 7],
  ['Muhammad Fikri', '2026003', 'X.2', 1010, 3],
  ['Siti Rahma', '2026004', 'XI.1', 980, 4],
  ['Nurul Azizah', '2026005', 'XI.2', 940, 6],
  ['Ahmad Farhan', '2026006', 'XII.1', 900, 2],
  ['Indah Lestari', '2026007', 'X.1', 880, 4],
  ['Wahyu Pratama', '2026008', 'X.2', 820, 2],
  ['Dinda Safitri', '2026009', 'XI.1', 790, 3],
  ['Rizky Maulana', '2026010', 'XII.1', 740, 1],
].map(([name, nis, className, xp, streak], index) => ({
  id: `student-${index + 1}`,
  userId: `u-student-${index + 1}`,
  name,
  email: `${name.toLowerCase().replaceAll(' ', '.')}@siswa.sman6pangkep.sch.id`,
  role: 'siswa',
  nis,
  nisn: `006${index + 120001}`,
  classId: `kelas-${className.toLowerCase().replace('.', '')}`,
  className,
  gender: index % 2 ? 'P' : 'L',
  status: index > 8 ? 'Perlu perhatian' : 'Aktif',
  xp,
  streak,
  avatar: name.split(' ').map((part) => part[0]).join('').slice(0, 2),
}))

export const teachers = [
  ['Rustam, S.Pd.', 'Bahasa Inggris'],
  ['Guru Matematika', 'Matematika'],
  ['Guru Biologi', 'Biologi'],
  ['Guru Sejarah', 'Sejarah'],
  ['Guru Ekonomi', 'Ekonomi'],
].map(([name, subject], index) => ({
  id: `teacher-${index + 1}`,
  userId: `u-teacher-${index + 1}`,
  name,
  nip: `19870${index + 1}202601${index + 1}`,
  email: `guru${index + 1}@sman6pangkep.sch.id`,
  subject,
  status: 'Aktif',
  classIds: ['kelas-x1', 'kelas-x2', 'kelas-xi1'].slice(0, 2 + (index % 2)),
  materialsCreated: 4 + index,
  lastActive: `${index + 1} jam lalu`,
}))

export const classes = [
  { id: 'kelas-x1', name: 'X.1', grade: 10, homeroom: 'Rustam, S.Pd.', students: 31, average: 84, progress: 72 },
  { id: 'kelas-x2', name: 'X.2', grade: 10, homeroom: 'Guru Matematika', students: 29, average: 81, progress: 68 },
  { id: 'kelas-xi1', name: 'XI.1', grade: 11, homeroom: 'Guru Biologi', students: 30, average: 86, progress: 76 },
  { id: 'kelas-xi2', name: 'XI.2', grade: 11, homeroom: 'Guru Sejarah', students: 28, average: 79, progress: 63 },
  { id: 'kelas-xii1', name: 'XII.1', grade: 12, homeroom: 'Guru Ekonomi', students: 27, average: 88, progress: 82 },
]

export const subjects = [
  'Bahasa Inggris',
  'Matematika',
  'Bahasa Indonesia',
  'Biologi',
  'Kimia',
  'Fisika',
  'Sejarah',
  'Ekonomi',
].map((name, index) => ({
  id: `subject-${index + 1}`,
  name,
  code: name.split(' ').map((word) => word[0]).join('').toUpperCase(),
  teacher: teachers[index % teachers.length].name,
  classes: classes.slice(0, 2 + (index % 3)).map((item) => item.name),
}))

export const materials = [
  ['Descriptive Text', 'Bahasa Inggris', 'Text Type', 78, 'Selesai'],
  ['Simple Present Tense', 'Bahasa Inggris', 'Grammar', 64, 'Dipelajari'],
  ['Narrative Text', 'Bahasa Inggris', 'Reading', 42, 'Belum Mulai'],
  ['Vocabulary: School Life', 'Bahasa Inggris', 'Vocabulary', 86, 'Selesai'],
  ['Speaking: Introducing Yourself', 'Bahasa Inggris', 'Speaking', 55, 'Dipelajari'],
  ['Persamaan Kuadrat', 'Matematika', 'Aljabar', 70, 'Dipelajari'],
  ['Fungsi', 'Matematika', 'Relasi', 46, 'Belum Mulai'],
  ['Trigonometri Dasar', 'Matematika', 'Geometri', 32, 'Belum Mulai'],
  ['Sistem Pernapasan', 'Biologi', 'Organ tubuh', 74, 'Dipelajari'],
  ['Pergerakan Nasional', 'Sejarah', 'Indonesia', 81, 'Selesai'],
].map(([title, subject, topic, progress, status], index) => ({
  id: `material-${index + 1}`,
  title,
  description: `Materi ${topic} dengan format ringan dibuka untuk jaringan kepulauan.`,
  content: `Ringkasan pembelajaran ${title}. Materi ini disiapkan ringkas, bertahap, dan mudah dibuka di HP.`,
  subject,
  className: classes[index % classes.length].name,
  teacher: teachers[index % teachers.length].name,
  topic,
  status,
  type: ['Teks', 'PDF', 'Video', 'Link'][index % 4],
  progress,
  lightweight: true,
}))

export const assignments = [
  ['Daily Writing: My Island', 'Bahasa Inggris', 'X.1', 'Aktif', '2026-05-06', 18],
  ['Latihan Fungsi', 'Matematika', 'X.2', 'Draft', '2026-05-08', 0],
  ['Rangkuman Biologi', 'Biologi', 'XI.1', 'Selesai', '2026-04-29', 27],
  ['Analisis Teks Naratif', 'Bahasa Inggris', 'X.1', 'Aktif', '2026-05-10', 12],
  ['Timeline Sejarah', 'Sejarah', 'XI.2', 'Terlambat', '2026-04-30', 21],
].map(([title, subject, className, status, deadline, submitted], index) => ({
  id: `assignment-${index + 1}`,
  title,
  description: 'Tugas ringkas dengan instruksi jelas dan bisa dikumpulkan nanti.',
  subject,
  className,
  status,
  deadline,
  submitted,
}))

export const quizzes = [
  ['Quiz Descriptive Text', 'Bahasa Inggris', 'Rustam, S.Pd.', 'Berlangsung', 20, '2026-05-04'],
  ['Ujian Simple Present', 'Bahasa Inggris', 'Rustam, S.Pd.', 'Belum mulai', 45, '2026-05-09'],
  ['Kuis Persamaan Kuadrat', 'Matematika', 'Guru Matematika', 'Selesai', 30, '2026-04-26'],
  ['Tryout Biologi', 'Biologi', 'Guru Biologi', 'Dikunci', 60, '2026-05-12'],
  ['Ulangan Sejarah', 'Sejarah', 'Guru Sejarah', 'Terlambat', 35, '2026-04-28'],
].map(([title, subject, teacher, status, duration, date], index) => ({
  id: `quiz-${index + 1}`,
  title,
  subject,
  teacher,
  className: classes[index % classes.length].name,
  status,
  duration,
  date,
  score: status === 'Selesai' ? 88 : null,
}))

export const questions = [
  {
    questionText: 'What is the main purpose of descriptive text?',
    options: ['To describe details', 'To argue an opinion', 'To tell steps', 'To announce news'],
    correctAnswer: 'To describe details',
    explanation: 'Descriptive text describes a person, place, animal, or object in detail.',
    subject: 'Bahasa Inggris',
    topic: 'Descriptive Text',
    difficulty: 'Mudah',
  },
  {
    questionText: 'Which structure is commonly used in descriptive text?',
    options: ['Identification and description', 'Goal and steps', 'Issue and argument', 'Orientation and complication'],
    correctAnswer: 'Identification and description',
    explanation: 'Descriptive text usually starts with identification, then continues with detailed description.',
    subject: 'Bahasa Inggris',
    topic: 'Descriptive Text',
    difficulty: 'Sedang',
  },
  {
    questionText: 'Which sentence is suitable for describing a place?',
    options: ['The beach is beautiful and quiet.', 'Please submit your task tomorrow.', 'Do not enter this room.', 'First, boil the water.'],
    correctAnswer: 'The beach is beautiful and quiet.',
    explanation: 'The sentence gives details about the beach, so it fits descriptive text.',
    subject: 'Bahasa Inggris',
    topic: 'Descriptive Text',
    difficulty: 'Mudah',
  },
  {
    questionText: 'What tense is commonly used in descriptive text?',
    options: ['Simple present tense', 'Past continuous tense', 'Future perfect tense', 'Present perfect continuous tense'],
    correctAnswer: 'Simple present tense',
    explanation: 'Descriptive text usually uses simple present tense because it describes general characteristics.',
    subject: 'Bahasa Inggris',
    topic: 'Descriptive Text',
    difficulty: 'Sedang',
  },
  {
    questionText: 'Which sentence uses simple present tense correctly?',
    options: ['She goes to school every day.', 'She go to school every day.', 'She going to school every day.', 'She went to school every day tomorrow.'],
    correctAnswer: 'She goes to school every day.',
    explanation: 'For the subject “she”, the verb needs -s or -es in simple present tense.',
    subject: 'Bahasa Inggris',
    topic: 'Simple Present Tense',
    difficulty: 'Mudah',
  },
  {
    questionText: 'Choose the correct negative sentence.',
    options: ['He does not like coffee.', 'He do not likes coffee.', 'He does not likes coffee.', 'He not like coffee.'],
    correctAnswer: 'He does not like coffee.',
    explanation: 'After “does not”, the verb returns to its base form: like.',
    subject: 'Bahasa Inggris',
    topic: 'Simple Present Tense',
    difficulty: 'Sedang',
  },
  {
    questionText: 'Which question is correct?',
    options: ['Does she speak English?', 'Do she speaks English?', 'Does she speaks English?', 'She does speak English?'],
    correctAnswer: 'Does she speak English?',
    explanation: 'For she/he/it, use “does” before the subject and the base verb after it.',
    subject: 'Bahasa Inggris',
    topic: 'Simple Present Tense',
    difficulty: 'Sedang',
  },
  {
    questionText: 'Which sentence uses simple past tense correctly?',
    options: ['They visited the island yesterday.', 'They visit the island yesterday.', 'They visits the island yesterday.', 'They are visit the island yesterday.'],
    correctAnswer: 'They visited the island yesterday.',
    explanation: 'The word “yesterday” shows past time, so the verb should be in past form: visited.',
    subject: 'Bahasa Inggris',
    topic: 'Simple Past Tense',
    difficulty: 'Mudah',
  },
  {
    questionText: 'Choose the correct past form of “go”.',
    options: ['Went', 'Goed', 'Goes', 'Going'],
    correctAnswer: 'Went',
    explanation: '“Go” is an irregular verb. Its past form is “went”.',
    subject: 'Bahasa Inggris',
    topic: 'Simple Past Tense',
    difficulty: 'Mudah',
  },
  {
    questionText: 'Which negative sentence is correct in simple past tense?',
    options: ['I did not watch TV last night.', 'I did not watched TV last night.', 'I do not watched TV last night.', 'I was not watch TV last night.'],
    correctAnswer: 'I did not watch TV last night.',
    explanation: 'After “did not”, use the base verb: watch.',
    subject: 'Bahasa Inggris',
    topic: 'Simple Past Tense',
    difficulty: 'Sedang',
  },
  {
    questionText: 'What is 25% of 80?',
    options: ['20', '25', '40', '60'],
    correctAnswer: '20',
    explanation: '25% is one fourth. One fourth of 80 is 20.',
    subject: 'Matematika',
    topic: 'Persentase',
    difficulty: 'Mudah',
  },
  {
    questionText: 'If 3x = 12, what is x?',
    options: ['4', '3', '9', '15'],
    correctAnswer: '4',
    explanation: 'Divide both sides by 3, so x = 12 ÷ 3 = 4.',
    subject: 'Matematika',
    topic: 'Aljabar Dasar',
    difficulty: 'Mudah',
  },
  {
    questionText: 'Which organ is mainly used for breathing in humans?',
    options: ['Lungs', 'Heart', 'Stomach', 'Kidney'],
    correctAnswer: 'Lungs',
    explanation: 'Humans breathe using lungs.',
    subject: 'Biologi',
    topic: 'Sistem Pernapasan',
    difficulty: 'Mudah',
  },
  {
    questionText: 'What gas do humans need when breathing?',
    options: ['Oxygen', 'Carbon dioxide', 'Nitrogen only', 'Hydrogen'],
    correctAnswer: 'Oxygen',
    explanation: 'Humans need oxygen for respiration.',
    subject: 'Biologi',
    topic: 'Sistem Pernapasan',
    difficulty: 'Mudah',
  },
].map((question, index) => ({
  id: `question-${index + 1}`,
  className: classes[index % classes.length].name,
  type: 'Pilihan ganda',
  ...question,
}))

export const flashcardDecks = [
  ['English Vocabulary', 'Bahasa Inggris', 24, 66],
  ['Biology Terms', 'Biologi', 18, 44],
  ['History Dates', 'Sejarah', 16, 50],
  ['Math Formulas', 'Matematika', 22, 72],
  ['Chemistry Symbols', 'Kimia', 20, 38],
  ['Economy Basics', 'Ekonomi', 14, 61],
  ['Physics Units', 'Fisika', 18, 57],
  ['Grammar Guardian', 'Bahasa Inggris', 30, 80],
].map(([title, subject, count, progress], index) => ({
  id: `deck-${index + 1}`,
  title,
  subject,
  count,
  progress,
  front: 'Explore',
  back: 'Menjelajahi; to travel through something to learn about it.',
}))

export const badges = [
  'Island Starter',
  'Galaxy Explorer',
  'Ocean Learner',
  'Vocabulary Voyager',
  'Grammar Guardian',
  'Quiz Comet',
  'SEAClub Speaker',
  'Pangkep Star Achiever',
].map((name, index) => ({
  id: `badge-${index + 1}`,
  name,
  description: [
    'Langkah awal dari pulau belajar.',
    'Berani menjelajah materi baru.',
    'Belajar ringan, tetap terhubung.',
    'Kosakata meningkat setiap pekan.',
    'Grammar makin rapi dan percaya diri.',
    'Tangguh menghadapi tantangan kuis.',
    'Aktif berlatih English Corner.',
    'Prestasi dari Pangkep untuk masa depan.',
  ][index],
  tone: ['teal', 'purple', 'cyan', 'purple', 'coral', 'gold', 'teal', 'gold'][index],
  icon: [Award, Trophy, Sparkles, ShieldCheck][index % 4],
}))

export const leaderboard = students
  .map((student) => ({ ...student, category: ['XP Mingguan', 'Streak Terbaik', 'SEAClub Challenge'][student.id.length % 3] }))
  .sort((a, b) => b.xp - a.xp)

export const remedials = [
  ['Muhammad Fikri', 'Simple Past Tense', 'Bahasa Inggris', 68],
  ['Wahyu Pratama', 'Persamaan Kuadrat', 'Matematika', 65],
  ['Rizky Maulana', 'Narrative Text', 'Bahasa Inggris', 62],
  ['Siti Rahma', 'Trigonometri Dasar', 'Matematika', 69],
  ['Dinda Safitri', 'Sistem Pernapasan', 'Biologi', 66],
].map(([student, topic, subject, score], index) => ({ id: `remedial-${index + 1}`, student, topic, subject, score, status: index % 2 ? 'Dikirim' : 'Perlu latihan' }))

export const activities = [
  'Rustam menambahkan materi Descriptive Text.',
  'Andi menyelesaikan daily mission.',
  'X.1 mengerjakan Quiz Descriptive Text.',
  'Admin memperbarui data kelas XI.1.',
  'SEAClub challenge minggu ini sudah dibuka.',
]

export const scoreTrend = [
  { name: 'Jan', nilai: 76, aktivitas: 58 },
  { name: 'Feb', nilai: 79, aktivitas: 64 },
  { name: 'Mar', nilai: 82, aktivitas: 70 },
  { name: 'Apr', nilai: 84, aktivitas: 78 },
  { name: 'Mei', nilai: 87, aktivitas: 82 },
]

export const subjectProgress = subjects.slice(0, 6).map((subject, index) => ({
  name: subject.name,
  progress: [72, 68, 82, 61, 74, 58][index],
  average: [84, 81, 86, 79, 83, 77][index],
}))

export const seaclub = {
  word: 'Explore',
  phrase: 'Keep moving forward',
  challenge: 'Tell us about your island in 5 English sentences.',
  prompt: 'Write a short paragraph about your school.',
  dialogue: [
    ['A', 'What makes your island special?'],
    ['B', 'The sea, the people, and the way we learn together.'],
  ],
}

export const liveParticipants = ['Andi', 'Aisyah', 'Fikri', 'Rahma', 'Nurul', 'Farhan']
