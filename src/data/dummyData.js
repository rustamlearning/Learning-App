import {
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
  NotebookTabs,
  School,
  Settings,
  Sparkles,
  Trophy,
  UserRound,
  UsersRound,
} from 'lucide-react'

export const school = {
  name: 'SMA Negeri 6 Pangkajene dan Kepulauan',
  shortName: 'SMA Negeri 6 Pangkajene dan Kepulauan',
  appName: 'IsleLearn',
  tagline: 'Dari Pesisir ke Masa Depan Digital',
}

export const demoUsers = {}

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
    { label: 'Tugas', path: '/siswa/tugas', icon: NotebookTabs },
    { label: 'Latihan', path: '/siswa/latihan', icon: Brain },
    { label: 'Kuis / Ujian', path: '/siswa/kuis', icon: FileQuestion },
    { label: 'Flashcard', path: '/siswa/flashcard', icon: Layers3 },
    { label: 'AI Tutor', path: '/siswa/ai-tutor', icon: Bot },
    { label: 'Nilai & Progres', path: '/siswa/progres', icon: LineChart },
    { label: 'Leaderboard', path: '/siswa/leaderboard', icon: Trophy },
    { label: 'IsleClub Corner', path: '/siswa/isleclub', icon: Sparkles },
    { label: 'Profil', path: '/siswa/profil', icon: UserRound },
  ],
  guru: [
    { label: 'Dashboard', path: '/guru/dashboard', icon: Home },
    { label: 'Kelas', path: '/guru/kelas', icon: School },
    { label: 'Materi', path: '/guru/materi', icon: BookOpen },
    { label: 'Bank Soal', path: '/guru/bank-soal', icon: FileQuestion },
    { label: 'Tugas', path: '/guru/tugas', icon: NotebookTabs },
    { label: 'Kuis Live', path: '/guru/kuis-live', icon: FlaskConical },
    { label: 'Siapkan Pembelajaran', path: '/guru/studio-konten', icon: Sparkles },
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

export const students = []
export const teachers = []
export const classes = []
export const subjects = []
export const materials = []
export const assignments = []
export const quizzes = []
export const questions = []
export const flashcardDecks = []
export const badges = []
export const leaderboard = []
export const remedials = []
export const activities = []
export const scoreTrend = []
export const subjectProgress = []
export const isleclub = {
  word: '',
  phrase: '',
  challenge: '',
  prompt: '',
  dialogue: [],
}
export const liveParticipants = []
