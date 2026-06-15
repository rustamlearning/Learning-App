import { Fragment, Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Award,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  Download,
  FileText,
  FileQuestion,
  FlaskConical,
  Layers3,
  Link2,
  Megaphone,
  PencilLine,
  PlayCircle,
  Plus,
  Radio,
  Save,
  School,
  Send,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  UsersRound,
  X,
} from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAuth } from '../context/AuthContext.jsx'
import {
  activities,
  assignments,
  badges,
  classes,
  flashcardDecks,
  leaderboard,
  liveParticipants,
  materials,
  questions,
  quizzes,
  remedials,
  scoreTrend,
  school,
  isleclub,
  students,
  subjectProgress,
  subjects,
  teachers,
} from '../data/dummyData.js'
import { schoolMaterials } from '../data/englishMaterials.js'
import {
  CompactList,
  ConfirmDialog,
  DashboardCard,
  DataTable,
  EmptyState,
  LoadingState,
  MetricStrip,
  PageHeader,
  QuickActionButton,
  SearchFilterBar,
  SectionCard,
  StatCard,
  StatusBadge,
  Toast,
  ProgressRing,
} from '../components/ui.jsx'
import { AIChatPanel, AIGeneratorPanel, BadgeCard, DailyMissionCard, FlashcardDeck, LearningPath, IsleClubCorner } from '../components/learning.jsx'
import { fetchMaterialLookups, fetchMaterials, fetchStudentMaterialProgress, markMaterialCompleted, removeMaterial, saveMaterial } from '../services/materialService.js'
import { fetchQuestions, removeQuestion, saveQuestion } from '../services/questionService.js'
import { fetchQuizAttempts, fetchQuizQuestions, fetchQuizzes, fetchStudentRecord, removeQuiz, saveQuiz, submitQuizAttempt } from '../services/quizService.js'
import { exportBackupData, fetchAdminStudents, fetchAdminTeachers, fetchClasses, fetchSubjects, removeAdminStudent, removeAdminTeacher, removeClass, removeSubject, saveAdminStudent, saveAdminTeacher, saveClass, saveSubject } from '../services/adminService.js'
import { createAssignmentSubmission, fetchAssignmentSubmissions, fetchAssignments, removeAssignment, saveAssignment } from '../services/assignmentService.js'
import {
  isExternalMaterialType,
  isHtmlMaterialType,
  isLinkedMaterialType,
  isValidLinkedMaterial,
  isValidMaterialUrl,
} from '../utils/materialSecurity.js'
import {
  getCompletedMaterials,
  getLocalAdminCollection,
  getLocalAdminProfiles,
  getLocalAssignmentSubmission,
  getLocalAssignmentSubmissions,
  getLocalTeacherAssignments,
  getLocalTeacherQuestions,
  getLocalTeacherQuizzes,
  getQuizResult,
  getStoredResultsByPrefix,
  isLegacyDemoRow,
  readLocalRowsByPrefix,
  safeReadLocalJson,
  safeWriteLocalJson,
  saveLocalAssignmentSubmission,
  saveQuizResult,
  setCompletedMaterials,
  setLocalAdminCollection,
  setLocalAdminProfiles,
  setLocalTeacherAssignments,
  setLocalTeacherQuestions,
  setLocalTeacherQuizzes,
} from '../utils/localLearningStore.js'

const ContentStudio = lazy(() => import('./ContentStudio.jsx'))

export default function RolePage({ role, page }) {
  const { user, accessToken, supabaseEnabled } = useAuth()
  const [toast, setToast] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const notify = (message) => setToast(message)

  const content = useMemo(() => {
    if (role === 'siswa') return renderSiswa(page, user, notify, { accessToken, supabaseEnabled })
    if (role === 'guru') return renderGuru(page, user, notify, setConfirmOpen, { accessToken, supabaseEnabled })
    if (role === 'admin') return renderAdmin(page, user, notify, setConfirmOpen, { accessToken, supabaseEnabled })
    return renderPimpinan(page, user, notify)
  }, [role, page, user, accessToken, supabaseEnabled])

  return (
    <>
      {content}
      <Toast message={toast} onClose={() => setToast('')} />
      <ConfirmDialog open={confirmOpen} title="Konfirmasi aksi" description="Aksi penting membutuhkan konfirmasi agar data tidak berubah tanpa sengaja." onCancel={() => setConfirmOpen(false)} onConfirm={() => { setConfirmOpen(false); notify('Aksi dikonfirmasi.') }} />
    </>
  )
}

function renderSiswa(page, user, notify, appContext) {
  if (page === 'dashboard') return <SiswaDashboard user={user} notify={notify} />
  if (page === 'kelas') return <KelasSaya />
  if (page === 'materi') return <MateriBelajar user={user} notify={notify} appContext={appContext} />
  if (page === 'tugas') return <SiswaTugas user={user} notify={notify} appContext={appContext} />
  if (page === 'latihan') return <LatihanPage notify={notify} />
  if (page === 'kuis') return <KuisPage user={user} notify={notify} appContext={appContext} />
  if (page === 'flashcard') return <FlashcardPage />
  if (page === 'ai-tutor') return <AIPage />
  if (page === 'progres') return <ProgresPage user={user} />
  if (page === 'leaderboard') return <LeaderboardPage />
  if (page === 'isleclub') return <IsleClubPage />
  if (page === 'profil') return <ProfilPage user={user} />
  return <EmptyState />
}

function renderGuru(page, user, notify, setConfirmOpen, appContext) {
  if (page === 'dashboard') return <GuruDashboard user={user} notify={notify} />
  if (page === 'kelas') return <GuruKelas />
  if (page === 'materi') return <GuruMateri user={user} notify={notify} appContext={appContext} />
  if (page === 'bank-soal') return <BankSoal user={user} notify={notify} appContext={appContext} />
  if (page === 'tugas') return <GuruTugas user={user} notify={notify} appContext={appContext} />
  if (page === 'kuis-live') return <KuisLive user={user} notify={notify} appContext={appContext} />
  if (page === 'daftar-hadir') return <GuruDaftarHadir user={user} notify={notify} />
  if (page === 'studio-konten') {
    return (
      <Suspense fallback={<div className="rounded-2xl border border-[#D9E6F5] bg-white p-4 text-sm font-bold text-slate-500 shadow-[0_10px_28px_rgba(15,36,55,0.045)]">Memuat Siapkan Pembelajaran...</div>}>
        <ContentStudio user={user} notify={notify} />
      </Suspense>
    )
  }
  if (page === 'daftar-nilai') return <GuruDaftarNilai user={user} notify={notify} />
  if (page === 'e-rapor') return <GuruERapor user={user} notify={notify} />
  if (page === 'analisis-nilai') return <AnalisisNilai />
  if (page === 'remedial') return <RemedialPage notify={notify} />
  if (page === 'ai-generator') return <AIGeneratorPage />
  if (page === 'laporan') return <LaporanGuru notify={notify} />
  return <EmptyState />
}

function renderAdmin(page, user, notify, setConfirmOpen, appContext) {
  if (page === 'dashboard') return <AdminDashboard />
  if (page === 'guru') return <AdminProfiles role="guru" title="Data Guru" notify={notify} appContext={appContext} />
  if (page === 'siswa') return <AdminProfiles role="siswa" title="Data Siswa" notify={notify} appContext={appContext} />
  if (page === 'kelas') return <AdminKelas notify={notify} appContext={appContext} />
  if (page === 'mapel') return <AdminMapel notify={notify} appContext={appContext} />
  if (page === 'e-rapor') return <GuruERapor user={user} notify={notify} allRows canEdit={false} />
  if (page === 'pengaturan') return <Pengaturan notify={notify} />
  if (page === 'laporan') return <LaporanSekolah notify={notify} />
  if (page === 'backup') return <BackupPage notify={notify} setConfirmOpen={setConfirmOpen} appContext={appContext} />
  return <EmptyState />
}

function renderPimpinan(page, user, notify) {
  if (page === 'dashboard') return <PimpinanDashboard />
  if (page === 'monitoring-kelas') return <MonitoringKelas />
  if (page === 'monitoring-guru') return <MonitoringGuru />
  if (page === 'monitoring-siswa') return <MonitoringSiswa />
  if (page === 'e-rapor') return <GuruERapor user={user} notify={notify} allRows canEdit={false} />
  if (page === 'laporan-akademik') return <LaporanAkademik notify={notify} />
  if (page === 'laporan-aktivitas') return <LaporanAktivitas notify={notify} />
  return <EmptyState />
}

function SiswaDashboard({ user, notify }) {
  const firstName = user?.name?.split(' ')[0] || 'Siswa'
  const navigate = useNavigate()
  const userId = user?.id || 'demo'
  const completedMaterials = getCompletedMaterials(userId)
  const availableMaterials = getAvailablePublishedMaterials()
  const practiceResults = getStoredResultsByPrefix('islelearn-practice-result-')
  const quizResults = getStoredResultsByPrefix(`islelearn-quiz-result-${userId}-`)
  const assignmentSubmissions = readLocalRowsByPrefix('islelearn-assignment-submissions-').filter((item) => item.userId === userId)
  const average = averageScore([...practiceResults, ...quizResults])
  const learningProgress = Math.min(100, completedMaterials.length * 20 + practiceResults.length * 10 + quizResults.length * 15 + assignmentSubmissions.length * 15)

  const classAssignments = assignments.filter((item) => !user?.className || item.className === user.className)
  const activeAssignments = classAssignments.filter((item) => ['Aktif', 'Terlambat'].includes(item.status))
  const activeQuizzes = quizzes.filter((item) => ['Berlangsung', 'Belum mulai'].includes(item.status))
  const continuingMaterials = availableMaterials
    .filter((item) => item.status !== 'Selesai')
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3)
  const nextMaterial = continuingMaterials[0] || availableMaterials[0]
  const dailyGoal = Math.max(18, Math.min(100, learningProgress))
  const todayWorkCount = activeAssignments.length + activeQuizzes.length

  const metricItems = [
    { label: 'Progres', value: `${learningProgress}%`, caption: `${completedMaterials.length} materi selesai`, icon: BarChart3 },
    { label: 'Prioritas', value: todayWorkCount, caption: 'tugas/kuis aktif', icon: ClipboardCheck },
    { label: 'Aktivitas', value: practiceResults.length + quizResults.length, caption: 'latihan/kuis tersimpan', icon: CalendarClock },
    { label: 'Rata-rata', value: average || '-', caption: 'nilai tersimpan', icon: Award },
  ]

  const quickLinks = [
    { label: 'Materi', icon: BookOpen, onClick: () => navigate('/siswa/materi') },
    { label: 'Tugas', icon: ClipboardCheck, onClick: () => navigate('/siswa/tugas') },
    { label: 'Kuis', icon: FileQuestion, onClick: () => navigate('/siswa/kuis') },
    { label: 'AI Tutor', icon: Bot, onClick: () => navigate('/siswa/ai-tutor') },
  ]

  const priorityItems = [
    ...activeQuizzes.slice(0, 2).map((item) => ({
      id: `quiz-${item.id}`,
      title: item.title,
      eyebrow: item.subject,
      meta: `${item.duration} menit · ${item.date}`,
      status: item.status,
      icon: FileQuestion,
      actionLabel: item.status === 'Berlangsung' ? 'Kerjakan' : 'Lihat',
      onClick: () => navigate('/siswa/kuis'),
    })),
    ...activeAssignments.slice(0, 2).map((item) => ({
      id: `assignment-${item.id}`,
      title: item.title,
      eyebrow: item.subject,
      meta: `Deadline ${item.deadline} · ${item.className}`,
      status: item.status,
      icon: ClipboardCheck,
      actionLabel: 'Buka',
      onClick: () => navigate('/siswa/tugas'),
    })),
  ].slice(0, 4)

  const materialItems = continuingMaterials.map((item) => ({
    id: item.id,
    title: item.title,
    eyebrow: item.subject,
    meta: `${item.topic} · ${item.progress}% selesai`,
    status: item.status === 'Publish' ? (Number(item.progress || 0) > 0 ? 'Dipelajari' : 'Belum Mulai') : item.status,
    icon: BookOpen,
    actionLabel: 'Lanjut',
    onClick: () => navigate('/siswa/materi'),
  }))

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[1.35rem] border border-[#123B63] bg-[#123B63] p-5 text-white shadow-[0_20px_52px_rgba(11,37,64,0.22)] sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-center">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-sky-200">Ruang belajar</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-white">Pilih langkah berikutnya.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-sky-100/82">
              Materi, tugas, dan kuis akan muncul saat guru mempublikasikan aktivitas kelas.
            </p>
            <div className="mt-5 flex flex-wrap gap-2" aria-label={`Aksi belajar ${firstName}`}>
              <button
                onClick={() => navigate('/siswa/materi')}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-[#123B63] shadow-[0_12px_24px_rgba(5,20,35,0.18)] transition hover:-translate-y-0.5 hover:bg-[#EAF4FF] active:translate-y-0"
              >
                <PlayCircle size={16} /> Lanjut materi
              </button>
              <button
                onClick={() => navigate('/siswa/kuis')}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-black text-white ring-1 ring-white/14 transition hover:-translate-y-0.5 hover:bg-white/16 active:translate-y-0"
              >
                <FileQuestion size={16} /> Kuis
              </button>
              <button
                onClick={() => navigate('/siswa/ai-tutor')}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-black text-white ring-1 ring-white/14 transition hover:-translate-y-0.5 hover:bg-white/16 active:translate-y-0"
              >
                <Bot size={16} /> AI Tutor
              </button>
              <span className="inline-flex min-h-10 items-center rounded-xl bg-sky-300/16 px-3 text-xs font-black text-sky-100 ring-1 ring-sky-100/18">
                {todayWorkCount} aktif
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/14 bg-white/10 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-sky-100/72">Progres</span>
              <span className="font-mono text-3xl font-black text-white">{dailyGoal}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/14">
              <div className="h-2 rounded-full bg-[#8BD4FF]" style={{ width: `${dailyGoal}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
              <span className="truncate rounded-lg bg-white/12 px-2.5 py-1 text-sky-50 ring-1 ring-white/12">{nextMaterial?.subject || 'Belum ada mapel'}</span>
              <span className="rounded-lg bg-white/12 px-2.5 py-1 text-sky-50 ring-1 ring-white/12">Nilai {average || '-'}</span>
            </div>
          </div>
        </div>
      </section>

      <MetricStrip items={metricItems} />

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <CompactList
          title="Prioritas"
          items={priorityItems}
          emptyLabel="Belum ada tugas atau kuis aktif."
        />

        <CompactList
          title="Lanjutkan materi"
          items={materialItems}
          emptyLabel="Belum ada materi yang dipublish guru."
        />
      </div>

      <DashboardActionGrid items={quickLinks} title="Akses cepat" />
    </div>
  )
}

function DashboardActionGrid({ items = [], title, bare = false }) {
  const content = (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
      {items.map(({ label, icon: Icon = Sparkles, onClick, href }) => {
        const className = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#F8FBFF] px-3 text-sm font-black text-slate-700 ring-1 ring-[#D9E6F5] transition hover:-translate-y-0.5 hover:bg-[#EAF4FF] hover:text-[#2F80D8]"
        const inner = (
          <>
            <Icon size={16} />
            {label}
          </>
        )
        return href ? (
          <a key={label} href={href} className={className}>
            {inner}
          </a>
        ) : (
          <button key={label} onClick={onClick} className={className}>
            {inner}
          </button>
        )
      })}
    </div>
  )

  if (bare) return content

  return (
    <section className="rounded-2xl border border-[#D9E6F5] bg-white p-3 shadow-[0_10px_28px_rgba(15,36,55,0.045)]">
      {title && <h2 className="mb-2 text-base font-black text-[#132437]">{title}</h2>}
      {content}
    </section>
  )
}

function DashboardPanel({ title, description, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-[#D9E6F5] bg-white p-4 shadow-[0_10px_28px_rgba(15,36,55,0.045)] ${className}`}>
      {(title || description) && (
        <header className="mb-3">
          {title && <h2 className="text-lg font-black text-[#132437]">{title}</h2>}
          {description && <p className="mt-1 text-sm leading-6 text-[#64748B]">{description}</p>}
        </header>
      )}
      {children}
    </section>
  )
}

function SetupSteps({ items = [] }) {
  return (
    <div className="space-y-2">
      {items.map(({ label, description, icon: Icon = ClipboardCheck, done = false, actionLabel, onClick }) => (
        <div key={label} className="flex items-center gap-3 rounded-xl border border-[#D9E6F5] bg-[#F8FBFF] p-3">
          <span className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg ${done ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-[#2F80D8]'} ring-1 ring-[#D9E6F5]`}>
            <Icon size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-black text-[#132437]">{label}</span>
            {description && <span className="block text-xs font-semibold leading-5 text-[#64748B]">{description}</span>}
          </span>
          {actionLabel && (
            <button onClick={onClick} className="rounded-lg bg-white px-3 py-2 text-xs font-black text-[#2F80D8] ring-1 ring-[#D9E6F5] transition hover:bg-[#EAF4FF]">
              {actionLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

function LineChartIcon(props) {
  return <BarChart3 {...props} />
}

function KelasSaya() {
  const visibleSubjects = subjects.slice(0, 5)
  return (
    <div>
      <PageHeader eyebrow="Kelas Saya" title="Pilih kelas" description="Masuk ke kelas, lanjutkan materi, dan pantau progres tiap mata pelajaran." />
      {visibleSubjects.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleSubjects.map((subject, index) => (
            <SectionCard key={subject.id}>
              <StatusBadge>{subject.name}</StatusBadge>
              <h2 className="mt-3 text-lg font-black">{subject.name}</h2>
              <p className="mt-2 text-sm text-gray-500">Guru: {subject.teacher}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <span className="rounded-xl bg-[#F8FBFF] p-3 ring-1 ring-[#D9E6F5]">{6 + index} materi</span>
                <span className="rounded-xl bg-[#F8FBFF] p-3 ring-1 ring-[#D9E6F5]">{2 + index} tugas</span>
                <span className="rounded-xl bg-[#F8FBFF] p-3 ring-1 ring-[#D9E6F5]">{64 + index * 5}%</span>
              </div>
              <button className="mt-5 w-full rounded-xl bg-[#17446E] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#2F80D8]">Masuk Kelas</button>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState title="Belum ada kelas." description="Kelas dan mata pelajaran akan muncul setelah admin atau guru menyiapkan data sekolah." />
      )}
    </div>
  )
}


function getPublishedLocalTeacherMaterials() {
  return readLocalRowsByPrefix('islelearn-teacher-materials-')
    .filter((item) => item && item.status === 'Publish')
    .map((item) => ({
      ...item,
      source: item.source || 'local',
      type: item.type || 'Teks',
      progress: item.progress || 0,
      description: item.description || `Materi ${item.topic || item.title} dari guru.`,
      content: item.content || item.description || 'Konten materi belum tersedia.',
      className: item.className || 'Kelas umum',
      teacher: item.teacher || 'Guru',
    }))
}

function getPublishedLocalTeacherQuizzes() {
  return readLocalRowsByPrefix('islelearn-teacher-quizzes-')
    .filter((item) => item && item.status === 'Publish')
    .map((item) => ({
      ...item,
      source: item.source || 'local',
      duration: Number(item.duration || 30),
      date: item.date || 'Aktif',
      teacher: item.teacher || 'Guru',
      className: item.className || 'Kelas umum',
    }))
}

function getPublishedLocalTeacherAssignments() {
  return readLocalRowsByPrefix('islelearn-teacher-assignments-')
    .filter((item) => item && item.status === 'Aktif')
    .map((item) => ({
      ...item,
      source: item.source || 'local',
      subject: item.subject || 'Mata pelajaran',
      className: item.className || 'Kelas umum',
      teacher: item.teacher || 'Guru',
      description: item.description || 'Instruksi tugas belum diisi lengkap.',
      deadline: item.deadline || '',
      submitted: getLocalAssignmentSubmissions(item.id).length,
    }))
}

function getAllLocalTeacherQuestions() {
  return readLocalRowsByPrefix('islelearn-teacher-questions-')
    .filter((item) => item && item.questionText)
    .map((item) => ({
      ...item,
      source: item.source || 'local',
      options: Array.isArray(item.options) ? item.options : ['Benar', 'Salah'],
      correctAnswer: item.correctAnswer || (Array.isArray(item.options) ? item.options[0] : 'Benar'),
      explanation: item.explanation || 'Pembahasan belum tersedia.',
      difficulty: item.difficulty || 'Sedang',
      type: item.type || 'Pilihan ganda',
    }))
}

function uniqueRowsById(rows) {
  const seen = new Set()
  return rows.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function getAvailablePublishedMaterials(remoteRows = []) {
  return uniqueRowsById([
    ...getPublishedLocalTeacherMaterials(),
    ...schoolMaterials,
    ...(remoteRows.length > 0 ? remoteRows : materials),
  ]).filter((item) => item && item.status !== 'Draft')
}


function MateriBelajar({ user, notify, appContext }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Semua')
  const [selected, setSelected] = useState(null)
  const [remoteMaterials, setRemoteMaterials] = useState([])
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')
  const [completedIds, setCompletedIds] = useState(() => getCompletedMaterials(user?.id))

  useEffect(() => {
    let active = true

    async function loadMaterials() {
      if (!appContext?.accessToken) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [rows, progress] = await Promise.all([
          fetchMaterials({ accessToken: appContext.accessToken, publishedOnly: true }),
          isUuid(user?.id) ? fetchStudentMaterialProgress({ accessToken: appContext.accessToken, profileId: user.id }) : Promise.resolve({ completedIds: [] }),
        ])
        if (active) {
          setRemoteMaterials(rows)
          if (progress.completedIds.length > 0) {
            setCompletedIds((current) => Array.from(new Set([...current, ...progress.completedIds])))
          }
          setError('')
        }
      } catch (loadError) {
        if (active) setError(loadError.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadMaterials()
    return () => {
      active = false
    }
  }, [appContext?.accessToken, user?.id])

  const data = getAvailablePublishedMaterials(remoteMaterials)
  const statusFilters = ['Semua', 'Selesai', 'Dipelajari', 'Belum Mulai']
  const enriched = data.map((item) => {
    if (completedIds.includes(item.id)) return { ...item, status: 'Selesai', progress: 100 }
    if (item.status === 'Publish') return { ...item, status: Number(item.progress || 0) > 0 ? 'Dipelajari' : 'Belum Mulai' }
    return item
  })
  const statusRows = enriched.filter((item) => filter === 'Semua' || item.status === filter)
  const materialFolders = getMaterialSubjectFolders(statusRows).filter((folder) => folder.rows.length > 0)
  const [activeSubjectKey, setActiveSubjectKey] = useState('')
  const materialFolderKeys = materialFolders.map((folder) => folder.key).join('|')
  const activeFolder = materialFolders.find((folder) => folder.key === activeSubjectKey) || materialFolders[0] || null
  const activeRows = activeFolder ? statusRows.filter((item) => normalizeLookupText(item.subject) === activeFolder.key) : []
  const searchQuery = search.trim().toLowerCase()
  const visibleRows = activeRows.filter((item) => {
    if (!searchQuery) return true
    return [item.title, item.description, item.topic, item.className, item.subject]
      .some((value) => String(value || '').toLowerCase().includes(searchQuery))
  })
  const visibleGradeFolders = getMaterialGradeFolders(visibleRows).filter((gradeFolder) => gradeFolder.rows.length > 0)

  useEffect(() => {
    if (!materialFolders.length) {
      if (activeSubjectKey) setActiveSubjectKey('')
      return
    }

    if (!activeSubjectKey || !materialFolders.some((folder) => folder.key === activeSubjectKey)) {
      setActiveSubjectKey(materialFolders[0].key)
    }
  }, [activeSubjectKey, materialFolderKeys])

  async function markComplete(item) {
    if (appContext?.accessToken && item.source === 'supabase' && isUuid(user?.id)) {
      try {
        await markMaterialCompleted({ accessToken: appContext.accessToken, profileId: user.id, materialId: item.id })
      } catch (progressError) {
        notify(`Progress lokal disimpan, tetapi Supabase gagal: ${progressError.message}`)
      }
    }
    const next = Array.from(new Set([...completedIds, item.id]))
    setCompletedIds(next)
    setCompletedMaterials(user?.id, next)
    notify(`${item.title} ditandai selesai.`)
  }

  const completedCount = enriched.filter((item) => item.status === 'Selesai').length
  const inProgressCount = enriched.filter((item) => item.status === 'Dipelajari').length
  const activeSubjectName = activeFolder?.name || 'Semua mapel'
  const libraryStats = [
    { label: 'Materi tersedia', value: enriched.length, caption: 'chapter aktif', icon: BookOpen },
    { label: 'Selesai', value: completedCount, caption: 'materi rampung', icon: Trophy },
    { label: 'Berjalan', value: inProgressCount, caption: 'sedang dipelajari', icon: PlayCircle },
    { label: 'Mapel', value: materialFolders.length, caption: 'folder tersedia', icon: Layers3 },
  ]

  if (selected) {
    return (
      <MaterialDetail
        item={selected}
        onBack={() => setSelected(null)}
        onComplete={async () => {
          await markComplete(selected)
          setSelected((current) => current ? { ...current, status: 'Selesai', progress: 100 } : current)
        }}
        notify={notify}
      />
    )
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[1.35rem] border border-[#0284c7]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(224,242,254,0.72),rgba(248,250,252,0.88))] p-4 shadow-[0_18px_52px_rgba(15,31,42,0.07)] backdrop-blur-xl sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-[0.75rem] bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-[#0284c7] ring-1 ring-[#0284c7]/10">
                Course library
              </span>
              <span className="rounded-[0.75rem] bg-[#fff7ed] px-3 py-1.5 text-[11px] font-black text-amber-700 ring-1 ring-amber-100">
                {user?.className || 'Semua kelas'}
              </span>
            </div>
            <h1 className="max-w-3xl text-balance text-3xl font-black leading-[0.98] text-[#13232d] sm:text-5xl">
              Pilih mapel, buka chapter, lanjutkan progres.
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-600 sm:text-base">
              Struktur materi dibuat seperti aplikasi course modern: folder mapel, tingkat kelas, kartu chapter, dan progress yang langsung terbaca.
            </p>
          </div>

          <div className="rounded-[1.05rem] bg-[linear-gradient(145deg,#0B3A5B,#0284c7)] p-4 text-white shadow-[0_18px_42px_rgba(15,31,42,0.18)]">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-sky-100">Sedang dibuka</p>
            <h2 className="mt-2 line-clamp-2 text-2xl font-black leading-tight">{activeSubjectName}</h2>
            <div className="mt-4 h-2 rounded-full bg-white/15">
              <div className="h-2 rounded-full bg-[#facc15]" style={{ width: `${enriched.length ? Math.round((completedCount / enriched.length) * 100) : 0}%` }} />
            </div>
            <p className="mt-2 text-xs font-semibold text-sky-50/80">{completedCount} dari {enriched.length} materi selesai</p>
          </div>
        </div>
      </section>

      {error && <div className="mb-4 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data materi: {error}. Data lokal tetap ditampilkan.</div>}
      <MetricStrip items={libraryStats} />
      <SearchFilterBar search={search} setSearch={setSearch} filters={statusFilters} activeFilter={filter} setActiveFilter={setFilter} />
      {materialFolders.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {materialFolders.map((folder) => {
            const selectedFolder = activeFolder?.key === folder.key
            return (
              <button
                key={folder.key}
                onClick={() => setActiveSubjectKey(folder.key)}
                className={`flex-shrink-0 rounded-[0.9rem] px-4 py-2.5 text-xs font-black ring-1 transition ${
                  selectedFolder
                    ? 'bg-[#0B3A5B] text-white ring-[#0B3A5B] shadow-[0_12px_28px_rgba(15,31,42,0.14)]'
                    : 'bg-white text-slate-600 ring-[#0B3A5B]/10 hover:bg-[#E0F2FE] hover:text-[#0284c7]'
                }`}
              >
                {folder.name} · {folder.rows.length}
              </button>
            )
          })}
        </div>
      )}
      {loading ? <LoadingState label="Memuat materi dari Supabase..." /> : (
        materialFolders.length > 0 ? (
          <section className="grid gap-4 xl:grid-cols-[18rem_1fr]">
            <aside className="hidden rounded-[1.05rem] border border-[#0B3A5B]/10 bg-white/88 p-2 shadow-[0_14px_44px_rgba(15,31,42,0.065)] backdrop-blur-xl xl:block">
              <div className="px-2 pb-2 pt-1">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0284c7]">Mapel</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Folder course dipisah agar chapter tidak bercampur.</p>
              </div>
              <div className="grid gap-1">
                {materialFolders.map((folder) => {
                  const selectedFolder = activeFolder?.key === folder.key
                  const gradeSummary = folder.gradeFolders
                    .filter((gradeFolder) => gradeFolder.rows.length > 0)
                    .map((gradeFolder) => `${gradeFolder.name.replace('Kelas ', '')}: ${gradeFolder.rows.length}`)
                    .join(' · ')

                  return (
                    <button
                      key={folder.key}
                      onClick={() => setActiveSubjectKey(folder.key)}
                      className={`group flex min-h-[4.25rem] items-center justify-between gap-3 rounded-[0.9rem] px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284c7] ${selectedFolder ? 'bg-[#0B3A5B] text-white shadow-[0_10px_22px_rgba(15,31,42,0.13)]' : 'bg-transparent text-[#13232d] hover:bg-[#E0F2FE]'}`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black">{folder.name}</span>
                        <span className={`mt-0.5 block truncate text-xs font-semibold ${selectedFolder ? 'text-white/68' : 'text-slate-500'}`}>{gradeSummary || 'Belum ada kelas'}</span>
                      </span>
                      <span className={`flex-shrink-0 rounded-[0.7rem] px-2.5 py-1 text-xs font-black ring-1 ${selectedFolder ? 'bg-white/12 text-white ring-white/18' : 'bg-white text-[#0284c7] ring-[#0284c7]/10'}`}>
                        {folder.rows.length}
                      </span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <section className="overflow-hidden rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/88 shadow-[0_14px_44px_rgba(15,31,42,0.065)] backdrop-blur-xl">
              <header className="flex flex-col gap-3 border-b border-[#0B3A5B]/8 bg-[#F8FAFC]/82 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0284c7]">Folder mapel</p>
                  <h2 className="text-2xl font-black text-[#13232d]">{activeFolder?.name || 'Materi'}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone="teal">{activeFolder?.rows.length || 0} materi</StatusBadge>
                  {searchQuery && <StatusBadge tone="amber">{visibleRows.length} hasil</StatusBadge>}
                </div>
              </header>

              {visibleGradeFolders.length > 0 ? (
                <div className="divide-y divide-[#0B3A5B]/8">
                  {visibleGradeFolders.map((gradeFolder, index) => (
                    <StudentMaterialGradeFolder
                      key={gradeFolder.key}
                      gradeFolder={gradeFolder}
                      onOpen={setSelected}
                      defaultOpen={index === 0}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-4">
                  <EmptyState title="Materi tidak ditemukan." description="Coba ganti kata pencarian, status, atau pilih mapel lain." />
                </div>
              )}
            </section>
          </section>
        ) : (
          <EmptyState title="Belum ada materi." description="Materi yang dipublish guru akan muncul di sini." />
        )
      )}
    </div>
  )
}

function normalizeLookupText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
}

const highSchoolSubjectFolders = [
  'Pendidikan Agama dan Budi Pekerti',
  'Pendidikan Pancasila',
  'Bahasa Indonesia',
  'Matematika Umum',
  'Bahasa Inggris',
  'Informatika',
  'Sejarah',
  'PJOK',
  'Seni Budaya',
  'Prakarya dan Kewirausahaan',
  'Biologi',
  'Fisika',
  'Kimia',
  'Geografi',
  'Ekonomi',
  'Sosiologi',
  'Antropologi',
  'Muatan Lokal',
]

const highSchoolGradeFolders = [
  { key: 'kelas-x', name: 'Kelas X', grade: 10 },
  { key: 'kelas-xi', name: 'Kelas XI', grade: 11 },
  { key: 'kelas-xii', name: 'Kelas XII', grade: 12 },
]

function uniqueSubjectNames(...collections) {
  const names = []
  const seen = new Set()

  collections.flat().forEach((item) => {
    const name = typeof item === 'string' ? item : item?.name || item?.subject
    const trimmed = String(name || '').trim()
    const key = normalizeLookupText(trimmed)
    if (!key || seen.has(key)) return
    seen.add(key)
    names.push(trimmed)
  })

  return names
}

function getMaterialSubjectFolders(rows = [], lookupSubjects = []) {
  const subjectNames = uniqueSubjectNames(highSchoolSubjectFolders, lookupSubjects, rows)
  return subjectNames.map((name) => {
    const key = normalizeLookupText(name)
    const subjectRows = rows.filter((row) => normalizeLookupText(row.subject || 'Mapel belum dipilih') === key)
    const gradeFolders = getMaterialGradeFolders(subjectRows)
    return {
      key,
      name,
      rows: subjectRows,
      gradeFolders,
      publishedCount: subjectRows.filter((item) => item.status === 'Publish').length,
      draftCount: subjectRows.filter((item) => item.status !== 'Publish').length,
    }
  })
}

function getMaterialGradeFolders(rows = []) {
  const matchedRows = new Set()
  const gradeFolders = highSchoolGradeFolders.map((gradeFolder) => {
    const gradeRows = rows.filter((row) => {
      const sameGrade = extractGrade(row.className) === gradeFolder.grade
      if (sameGrade) matchedRows.add(row)
      return sameGrade
    })

    return {
      ...gradeFolder,
      rows: gradeRows,
      publishedCount: gradeRows.filter((item) => item.status === 'Publish').length,
      draftCount: gradeRows.filter((item) => item.status !== 'Publish').length,
    }
  })

  const unassignedRows = rows.filter((row) => !matchedRows.has(row))
  if (unassignedRows.length > 0) {
    gradeFolders.push({
      key: 'kelas-belum-dipilih',
      name: 'Kelas belum dipilih',
      grade: null,
      rows: unassignedRows,
      publishedCount: unassignedRows.filter((item) => item.status === 'Publish').length,
      draftCount: unassignedRows.filter((item) => item.status !== 'Publish').length,
    })
  }

  return gradeFolders
}

function getMaterialSubjectOptions(lookupSubjects = [], materialsForContext = []) {
  const names = uniqueSubjectNames(highSchoolSubjectFolders, lookupSubjects, materialsForContext)
  return names.map((name) => {
    const lookup = lookupSubjects.find((item) => normalizeLookupText(item.name) === normalizeLookupText(name))
    return {
      id: lookup?.id || '',
      name,
      synthetic: !lookup?.id,
    }
  })
}

function subjectOptionValue(subject) {
  return subject?.id || `subject:${subject?.name || ''}`
}

function getMaterialClassOptions(lookupClasses = [], selectedClassName = '') {
  const options = []
  const seen = new Set()

  function addOption(option) {
    const name = String(option?.name || '').trim()
    const key = normalizeLookupText(name)
    if (!key || seen.has(key)) return
    seen.add(key)
    options.push(option)
  }

  lookupClasses.forEach((classItem) => addOption(classItem))
  highSchoolGradeFolders.forEach((gradeFolder) => addOption({ id: '', name: gradeFolder.name, synthetic: true }))
  addOption({ id: '', name: selectedClassName, synthetic: true })

  return options
}

function classOptionValue(classItem) {
  return classItem?.id || `class:${classItem?.name || ''}`
}

function extractGrade(value) {
  const text = String(value || '').toLowerCase()
  const match = text.match(/\b(10|11|12|[7-9])\b/)
  if (match) return Number(match[1])
  if (/(^|[^a-z])xii([^a-z]|$)/.test(text)) return 12
  if (/(^|[^a-z])xi([^a-z]|$)/.test(text)) return 11
  if (/(^|[^a-z])x([^a-z]|$)/.test(text)) return 10
  return match ? Number(match[1]) : null
}

function getChapterLabel(title) {
  const match = String(title || '').match(/chapter\s*(\d+)/i)
  return match ? `Chapter ${match[1]}` : 'Materi'
}

function getChapterTitle(title) {
  return String(title || '').replace(/^chapter\s*\d+\s*[—:-]\s*/i, '').trim() || title
}

function StudentMaterialRow({ item, onOpen }) {
  const navigate = useNavigate()
  const completed = item.status === 'Selesai' || Number(item.progress || 0) >= 100

  return (
    <article className="group rounded-[1rem] bg-white p-3 ring-1 ring-[#0B3A5B]/9 transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,31,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex justify-center rounded-[0.75rem] bg-[#E0F2FE] px-2.5 py-1.5 font-mono text-xs font-black text-[#0284c7] ring-1 ring-[#0284c7]/10">
          {getChapterLabel(item.title)}
        </span>
        <StatusBadge tone={completed ? 'green' : 'amber'}>{item.status}</StatusBadge>
      </div>

      <div className="mt-4 min-w-0">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-base font-black leading-snug text-[#13232d]">
          {getChapterTitle(item.title)}
        </h3>
        <p className="mt-2 truncate text-xs font-black uppercase tracking-[0.12em] text-[#0284c7]">
          {item.topic || item.subject} · {item.className}
        </p>
        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-slate-500">{item.description}</p>
        <div className="mt-4 h-1.5 rounded-full bg-[#E0F2FE]">
          <div className="h-1.5 rounded-full bg-[#0284c7]" style={{ width: `${item.progress}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 text-xs font-bold text-slate-500">
          <span>{Number(item.progress || 0)}% progress</span>
          <span>{item.type || 'Materi'}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-2">
        <button onClick={onOpen} className="inline-flex min-h-10 items-center justify-center rounded-[0.85rem] bg-[#0B3A5B] px-4 text-sm font-black text-white transition hover:bg-[#0284c7]">
          Buka
        </button>
        <button onClick={() => navigate('/siswa/ai-tutor')} aria-label="Tanya AI Tutor" className="inline-flex h-10 w-10 items-center justify-center rounded-[0.85rem] bg-[#E0F2FE] text-xs font-black text-[#0284c7] ring-1 ring-[#0284c7]/10 transition hover:bg-[#d8eee8]">
          <Bot size={17} />
        </button>
      </div>
    </article>
  )
}

function StudentMaterialGradeFolder({ gradeFolder, onOpen, defaultOpen = false }) {
  const hasRows = gradeFolder.rows.length > 0

  return (
    <details open={hasRows && defaultOpen} className="group">
      <summary className="flex cursor-pointer list-none flex-col gap-2 bg-[#F8FAFC]/72 px-4 py-3 transition hover:bg-[#F1F7FF] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-[0.75rem] bg-white font-mono text-xs font-black text-[#0284c7] ring-1 ring-[#0B3A5B]/8">
            {gradeFolder.grade || '-'}
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Tingkat</p>
            <h3 className="text-base font-black text-[#13232d]">{gradeFolder.name}</h3>
          </div>
        </div>
        <StatusBadge tone={hasRows ? 'green' : 'gray'}>{gradeFolder.rows.length} materi</StatusBadge>
      </summary>

      <div className="border-t border-[#0B3A5B]/8">
        {hasRows ? (
          <div className="grid gap-3 bg-[#f8fafc]/80 p-3 md:grid-cols-2 2xl:grid-cols-3">
            {gradeFolder.rows.map((item) => (
              <StudentMaterialRow key={item.id} item={item} onOpen={() => onOpen(item)} />
            ))}
          </div>
        ) : (
          <p className="m-3 rounded-[0.85rem] bg-white/78 px-3 py-2 text-sm font-semibold text-slate-500 ring-1 ring-[#0B3A5B]/8">
            Belum ada materi untuk {gradeFolder.name}.
          </p>
        )}
      </div>
    </details>
  )
}

function splitLearningParagraphs(content) {
  return String(content || '')
    .split(/\n{2,}|\r?\n/)
    .map((item) => item.trim().replace(/^[-*#\d.\s]+/, '').trim())
    .filter((item) => item.length > 0)
}

function findLearningText(paragraphs, keywords) {
  return paragraphs.find((paragraph) => {
    const value = paragraph.toLowerCase()
    return keywords.some((keyword) => value.includes(keyword))
  })
}

function buildMaterialLearningSections(item) {
  const paragraphs = splitLearningParagraphs(item.content)
  const mainText = paragraphs.length > 0 ? paragraphs.join('\n\n') : item.description || 'Materi ini belum memiliki isi lengkap.'
  const objectiveText = findLearningText(paragraphs, ['tujuan', 'mampu', 'target belajar', 'learning objective'])
  const exampleText = findLearningText(paragraphs, ['contoh', 'model text', 'example'])
  const practiceText = findLearningText(paragraphs, ['latihan', 'pertanyaan', 'cek pemahaman', 'guided practice'])
  const reflectionText = findLearningText(paragraphs, ['refleksi', 'exit ticket', 'kesimpulan'])

  return [
    {
      title: 'Target Belajar',
      body: objectiveText || `Setelah membaca materi ini, pahami ide utama ${item.topic || item.title}, catat bagian sulit, dan siapkan satu pertanyaan untuk guru atau AI Tutor.`,
      tone: 'green',
    },
    {
      title: 'Pengantar',
      body: item.description || `Mulai pelajari ${item.topic || item.title} secara bertahap. Baca bagian inti, cek contoh, lalu kerjakan latihan singkat.`,
      tone: 'cyan',
    },
    {
      title: 'Isi Utama',
      body: mainText,
      tone: 'teal',
    },
    {
      title: 'Contoh',
      body: exampleText || `Buat satu contoh yang dekat dengan kehidupan sehari-hari atau lingkungan sekolah tentang ${item.topic || item.title}.`,
      tone: 'cyan',
    },
    {
      title: 'Latihan Cepat',
      body: practiceText || `Jawab singkat: 1. Apa ide utama materi ini? 2. Berikan satu contoh penerapan. 3. Bagian mana yang perlu ditanyakan ke guru?`,
      tone: 'amber',
    },
    {
      title: 'Refleksi',
      body: reflectionText || `Tuliskan satu hal yang sudah dipahami, satu hal yang masih membingungkan, dan satu rencana belajar berikutnya.`,
      tone: 'green',
    },
  ]
}

function MaterialDetail({ item, onBack, onComplete, notify }) {
  const navigate = useNavigate()
  const sections = buildMaterialLearningSections(item)
  const progress = Number(item.progress || 0)
  const completed = item.status === 'Selesai' || progress >= 100
  const htmlMaterial = isHtmlMaterialType(item.type) && isValidLinkedMaterial(item.content, item.type)
  const externalMaterial = !htmlMaterial && isExternalMaterialType(item.type) && isValidMaterialUrl(item.content)

  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      document.querySelectorAll('main').forEach((element) => {
        element.scrollTop = 0
      })
    }

    resetScroll()
    const frame = requestAnimationFrame(resetScroll)
    return () => cancelAnimationFrame(frame)
  }, [item.id])

  return (
    <div>
      <div className="mb-5 border-b border-[#0B3A5B]/10 pb-4">
        <button
          onClick={onBack}
          className="mb-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-[0.85rem] bg-[#0B3A5B] px-4 text-sm font-black text-white transition hover:bg-[#0284c7]"
        >
          <ArrowLeft size={16} /> Kembali ke daftar
        </button>
        <p className="mb-1 text-xs font-black uppercase tracking-[0.16em] text-[#0284c7]">{item.subject}</p>
        <h1 className="text-balance text-3xl font-black leading-none text-[#13232d] sm:text-4xl">{item.title}</h1>
        <p className="mt-2 max-w-3xl text-sm font-medium leading-7 text-slate-600">
          {item.className} · {item.topic} · {item.type || 'Teks'} · Ringan dibuka
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
        <SectionCard>
          <StatusBadge tone={item.status === 'Selesai' ? 'green' : 'cyan'}>{item.status}</StatusBadge>
          {htmlMaterial && (
            <div className="mt-5 overflow-hidden rounded-[1rem] border border-[#0B3A5B]/10 bg-white shadow-[0_14px_44px_rgba(15,31,42,0.06)]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#0B3A5B]/8 bg-[#F8FAFC] px-3 py-2">
                <StatusBadge tone="teal">HTML interaktif</StatusBadge>
                <a href={item.content} target="_blank" rel="noreferrer" className="rounded-[0.75rem] bg-[#E0F2FE] px-3 py-1.5 text-xs font-black text-[#0284c7] ring-1 ring-[#0284c7]/10">
                  Buka layar penuh
                </a>
              </div>
              <iframe
                title={item.title}
                src={item.content}
                className="h-[78vh] w-full bg-[#F1F7FF]"
                loading="lazy"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-forms allow-popups"
              />
            </div>
          )}
          {externalMaterial && (
            <div className="mt-5 rounded-2xl bg-cyan-50 p-3 ring-1 ring-cyan-100">
              <StatusBadge tone="cyan">{item.type}</StatusBadge>
              <p className="mt-2 text-sm leading-6 text-cyan-800">
                Materi ini memakai URL agar database tetap ringan. Buka link untuk melihat file atau video.
              </p>
              <a href={item.content} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-cyan-700 ring-1 ring-cyan-100">
                Buka materi
              </a>
            </div>
          )}
          {!htmlMaterial && (
            <div className="mt-5 grid gap-4">
              {sections.map((section) => (
                <div key={section.title} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge tone={section.tone}>{section.title}</StatusBadge>
                  </div>
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{section.body}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={onComplete} disabled={completed} className="rounded-xl bg-galaxy-action px-4 py-2.5 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {completed ? 'Materi selesai' : 'Tandai selesai'}
            </button>
            <button onClick={() => navigate('/siswa/ai-tutor')} className="rounded-2xl bg-galaxy-surface px-5 py-3 text-sm font-bold text-galaxy-purple">Tanya AI Tutor</button>
          </div>
          <div className="mt-4 rounded-2xl bg-cyan-50 p-3 text-sm font-semibold leading-6 text-cyan-800 ring-1 ring-cyan-100">
            Jika AI Tutor belum aktif, gunakan bagian Latihan Cepat dan Refleksi di atas sebagai panduan belajar mandiri.
          </div>
        </SectionCard>
        <SectionCard>
          <p className="text-sm font-extrabold text-gray-950">Info Materi</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p><b>Mapel:</b> {item.subject}</p>
            <p><b>Kelas:</b> {item.className}</p>
            <p><b>Guru:</b> {item.teacher}</p>
            <p><b>Status:</b> {item.status}</p>
            <p><b>Topik:</b> {item.topic || item.title}</p>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Progress</span>
              <span>{completed ? 100 : progress}%</span>
            </div>
            <div className="h-3 rounded-full bg-galaxy-lavender">
              <div className="h-3 rounded-full bg-galaxy-action" style={{ width: `${completed ? 100 : progress}%` }} />
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

function SiswaTugas({ user, notify, appContext }) {
  const [rows, setRows] = useState([])
  const [selected, setSelected] = useState(null)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadAssignments() {
      if (!appContext?.accessToken) {
        setRows(uniqueRowsById([...assignments.filter((item) => item.status === 'Aktif'), ...getPublishedLocalTeacherAssignments()]))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const remoteRows = await fetchAssignments({ accessToken: appContext.accessToken, publishedOnly: true })
        if (active) {
          setRows(uniqueRowsById([...(remoteRows.length > 0 ? remoteRows : assignments.filter((item) => item.status === 'Aktif')), ...getPublishedLocalTeacherAssignments()]))
          setError('')
        }
      } catch (loadError) {
        if (active) {
          setRows(uniqueRowsById([...assignments.filter((item) => item.status === 'Aktif'), ...getPublishedLocalTeacherAssignments()]))
          setError(loadError.message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadAssignments()
    return () => {
      active = false
    }
  }, [appContext?.accessToken])

  function openAssignment(assignment) {
    setSelected(assignment)
    setAnswer(getLocalAssignmentSubmission(assignment.id, user?.id)?.answerText || '')
  }

  async function submitAssignment() {
    if (!selected) return
    if (!answer.trim()) {
      notify('Isi jawaban tugas terlebih dahulu.')
      return
    }

    const localSubmission = {
      id: `local-submission-${Date.now()}`,
      assignmentId: selected.id,
      userId: user?.id || 'demo',
      studentName: user?.name || 'Siswa',
      answerText: answer.trim(),
      submittedAt: new Date().toISOString(),
      status: 'Terkirim',
    }

    if (appContext?.accessToken && selected.source === 'supabase' && isUuid(user?.id)) {
      try {
        const student = await fetchStudentRecord({ accessToken: appContext.accessToken, profileId: user.id })
        if (!student?.id) {
          notify('Profil siswa belum terhubung ke data kelas. Hubungi admin sekolah.')
          return
        }
        await createAssignmentSubmission({ accessToken: appContext.accessToken, assignmentId: selected.id, studentId: student?.id, answerText: answer.trim() })
        notify('Jawaban tugas dikirim ke Supabase.')
      } catch (submitError) {
        notify(`Supabase belum menerima submission, jawaban disimpan lokal: ${submitError.message}`)
      }
    } else {
      notify('Jawaban tugas tersimpan lokal di perangkat.')
    }

    saveLocalAssignmentSubmission(selected.id, localSubmission)
    setSelected((current) => current ? { ...current, submitted: getLocalAssignmentSubmissions(current.id).length } : current)
  }

  if (selected) {
    const submission = getLocalAssignmentSubmission(selected.id, user?.id)
    return (
      <div>
        <PageHeader
          eyebrow={selected.subject}
          title={selected.title}
          description={`${selected.className} · Deadline ${selected.deadline || '-'} · ${selected.status}`}
          action={<button onClick={() => setSelected(null)} className="rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-extrabold text-galaxy-purple">Kembali</button>}
        />

        <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
          <SectionCard>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={submission ? 'green' : 'amber'}>{submission ? 'Sudah submit' : 'Belum submit'}</StatusBadge>
              <StatusBadge tone={statusTone(selected.status)}>{selected.status}</StatusBadge>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <p className="text-sm font-extrabold text-slate-950">Instruksi tugas</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{selected.description}</p>
            </div>
            <label className="mt-5 grid gap-2 text-sm font-bold text-slate-700">
              Jawaban teks
              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                rows={8}
                className="rounded-xl border border-purple-100 bg-galaxy-surface px-3 py-2.5 outline-none focus:border-purple-300"
                placeholder="Tulis jawaban tugas di sini. File upload belum diaktifkan agar storage tetap ringan."
              />
            </label>
            <button onClick={submitAssignment} className="mt-5 rounded-xl bg-galaxy-action px-4 py-2.5 text-xs font-extrabold text-white">
              {submission ? 'Perbarui submission' : 'Submit tugas'}
            </button>
          </SectionCard>

          <SectionCard>
            <p className="text-sm font-extrabold text-gray-950">Status Submission</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p><b>Guru:</b> {selected.teacher || 'Guru'}</p>
              <p><b>Deadline:</b> {selected.deadline || '-'}</p>
              <p><b>Mapel:</b> {selected.subject}</p>
              <p><b>Terakhir submit:</b> {submission ? new Date(submission.submittedAt).toLocaleString('id-ID') : '-'}</p>
            </div>
            <div className="mt-5 rounded-2xl bg-cyan-50 p-3 text-sm font-semibold leading-6 text-cyan-800 ring-1 ring-cyan-100">
              Untuk tahap ini, jawaban berupa teks. File besar nanti memakai link atau Supabase Storage agar database tetap ringan.
            </div>
            {selected.rubric && (
              <div className="mt-3 rounded-2xl bg-purple-50 p-3 text-sm leading-6 text-purple-800 ring-1 ring-purple-100">
                <b>Rubrik:</b> {selected.rubric}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader eyebrow="Tugas" title="Tugas siswa" description="Baca instruksi dan kirim jawaban." />
      {error && <div className="mb-4 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim tugas: {error}. Data lokal tetap ditampilkan.</div>}
      {loading ? <LoadingState label="Memuat tugas siswa..." /> : rows.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((assignment) => {
            const submission = getLocalAssignmentSubmission(assignment.id, user?.id)
            return (
              <SectionCard key={assignment.id}>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <StatusBadge tone={submission ? 'green' : statusTone(assignment.status)}>{submission ? 'Terkirim' : assignment.status}</StatusBadge>
                  <StatusBadge tone="cyan">{assignment.subject}</StatusBadge>
                </div>
                <h2 className="text-lg font-extrabold">{assignment.title}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">{assignment.description}</p>
                <p className="mt-3 text-xs font-bold text-slate-500">{assignment.subject} · Deadline {assignment.deadline || '-'}</p>
                <button onClick={() => openAssignment(assignment)} className="mt-5 w-full rounded-2xl bg-galaxy-action px-4 py-3 text-sm font-bold text-white">
                  {submission ? 'Lihat / perbarui jawaban' : 'Kerjakan tugas'}
                </button>
              </SectionCard>
            )
          })}
        </div>
      ) : (
        <EmptyState title="Belum ada tugas aktif." description="Tugas yang sudah dipublish guru akan muncul di sini." />
      )}
    </div>
  )
}

function getPracticeResult(practiceId) {
  return safeReadLocalJson(`islelearn-practice-result-${practiceId}`, null)
}

function savePracticeResult(practiceId, result) {
  safeWriteLocalJson(`islelearn-practice-result-${practiceId}`, result || {})
}

function LatihanPage({ notify }) {
  const [selected, setSelected] = useState(null)

  const practices = useMemo(() => {
    const availableQuestions = uniqueRowsById([...questions, ...getAllLocalTeacherQuestions()])
    const grouped = availableQuestions.reduce((acc, question) => {
      const key = `${question.subject}-${question.topic}`
      if (!acc[key]) {
        acc[key] = {
          id: `practice-${key.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          title: question.topic,
          topic: question.topic,
          subject: question.subject,
          difficulty: question.difficulty,
          items: [],
        }
      }
      acc[key].items.push(question)
      return acc
    }, {})

    return Object.values(grouped).slice(0, 8).map((practice) => ({
      ...practice,
      soal: practice.items.length,
      waktu: Math.max(5, practice.items.length * 2),
      difficulty: practice.items.some((item) => item.difficulty === 'Sulit')
        ? 'Sulit'
        : practice.items.some((item) => item.difficulty === 'Sedang')
          ? 'Sedang'
          : 'Mudah',
    }))
  }, [])

  if (selected) return <PracticeDetail practice={selected} onBack={() => setSelected(null)} notify={notify} />

  return (
    <div>
      <PageHeader eyebrow="Latihan" title="Latihan soal" description="Kerjakan soal pendek dan lihat pembahasan." />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {practices.map((item) => {
          const result = getPracticeResult(item.id)
          return (
            <SectionCard key={item.id}>
              <div className="mb-4 flex items-center justify-between gap-2">
                <StatusBadge tone={item.difficulty === 'Sulit' ? 'red' : item.difficulty === 'Sedang' ? 'amber' : 'green'}>{item.difficulty}</StatusBadge>
                <StatusBadge tone={result ? 'green' : 'amber'}>{result ? `Skor ${result.score}` : 'Belum dikerjakan'}</StatusBadge>
              </div>
              <h2 className="text-lg font-extrabold">{item.topic}</h2>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{item.subject}</p>
              <p className="mt-2 text-sm leading-6 text-gray-500">{item.soal} soal · {item.waktu} menit · {result ? `${result.correct}/${result.total} benar` : 'siap latihan'}</p>
              <button onClick={() => setSelected(item)} className="mt-5 w-full rounded-2xl bg-galaxy-action px-4 py-3 text-sm font-bold text-white">
                {result ? 'Latihan lagi' : 'Mulai latihan'}
              </button>
            </SectionCard>
          )
        })}
      </div>
    </div>
  )
}

function PracticeDetail({ practice, onBack, notify }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const items = practice.items || []
  const answeredCount = Object.keys(answers).length
  const correctCount = items.filter((question) => answers[question.id] === question.correctAnswer).length
  const score = items.length ? Math.round((correctCount / items.length) * 100) : 0

  const chooseAnswer = (questionId, option) => {
    if (submitted) return
    setAnswers((current) => ({ ...current, [questionId]: option }))
  }

  const submitPractice = () => {
    if (answeredCount < items.length) {
      notify(`Jawab semua soal dulu: ${answeredCount}/${items.length} terisi.`)
      return
    }

    const result = {
      score,
      correct: correctCount,
      total: items.length,
      date: new Date().toISOString(),
    }

    savePracticeResult(practice.id, result)
    setSubmitted(true)
    notify(`Latihan selesai. Skor ${score}.`)
  }

  const resetPractice = () => {
    setAnswers({})
    setSubmitted(false)
    notify('Latihan diulang.')
  }

  const optionClass = (question, option) => {
    const selected = answers[question.id] === option
    const correct = question.correctAnswer === option

    if (submitted && correct) return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    if (submitted && selected && !correct) return 'bg-rose-50 text-rose-700 ring-rose-200'
    if (selected) return 'bg-galaxy-deep text-white ring-galaxy-deep'
    return 'bg-white text-gray-700 ring-purple-100 hover:bg-galaxy-lavender'
  }

  return (
    <div>
      <PageHeader
        eyebrow={practice.subject}
        title={practice.topic}
        description={`${items.length} soal · ${practice.waktu} menit · jawab semua soal lalu lihat skor akhir.`}
        action={<button onClick={onBack} className="rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-extrabold text-galaxy-purple">Kembali</button>}
      />

      {submitted && (
        <SectionCard className="mb-4 bg-gradient-to-r from-emerald-50 to-cyan-50">
          <StatusBadge tone={score >= 75 ? 'green' : 'amber'}>{score >= 75 ? 'Tuntas' : 'Perlu latihan lagi'}</StatusBadge>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Skor {score}</h2>
          <p className="mt-2 text-sm font-bold text-slate-600">{correctCount} benar dari {items.length} soal.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={resetPractice} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-galaxy-purple ring-1 ring-purple-100">Ulangi latihan</button>
            <button onClick={onBack} className="rounded-xl bg-galaxy-action px-3 py-2.5 text-xs font-extrabold text-white">Kembali ke daftar</button>
          </div>
        </SectionCard>
      )}

      <div className="grid gap-4">
        {items.map((question, index) => (
          <SectionCard key={question.id}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <StatusBadge tone="cyan">Soal {index + 1}</StatusBadge>
              <StatusBadge tone={question.difficulty === 'Sulit' ? 'red' : question.difficulty === 'Sedang' ? 'amber' : 'green'}>{question.difficulty}</StatusBadge>
            </div>
            <h2 className="text-xl font-extrabold leading-8 text-slate-950">{question.questionText}</h2>
            <div className="mt-5 grid gap-2">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => chooseAnswer(question.id, option)}
                  className={`rounded-2xl px-4 py-3 text-left text-sm font-bold ring-1 transition ${optionClass(question, option)}`}
                >
                  {option}
                </button>
              ))}
            </div>
            {submitted && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-700 ring-1 ring-slate-100">
                <b>Pembahasan:</b> {question.explanation}
              </div>
            )}
          </SectionCard>
        ))}
      </div>

      {!submitted && (
        <div className="sticky bottom-4 mt-4 rounded-2xl bg-white/90 p-3 shadow-soft ring-1 ring-purple-100 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-600">{answeredCount}/{items.length} soal terjawab</p>
            <button onClick={submitPractice} className="rounded-xl bg-galaxy-action px-4 py-2.5 text-xs font-extrabold text-white">Submit latihan</button>
          </div>
        </div>
      )}
    </div>
  )
}

function getQuizQuestionSet(quiz) {
  const allQuestions = uniqueRowsById([...questions, ...getAllLocalTeacherQuestions()])

  if (Array.isArray(quiz.questionIds) && quiz.questionIds.length > 0) {
    const selectedQuestions = allQuestions.filter((item) => quiz.questionIds.includes(item.id))
    if (selectedQuestions.length > 0) return selectedQuestions
  }

  const bySubject = allQuestions.filter((item) => item.subject === quiz.subject)
  if (bySubject.length > 0) return bySubject.slice(0, 8)
  return allQuestions.slice(0, 8)
}

function KuisPage({ user, notify, appContext }) {
  const [quizRows, setQuizRows] = useState([])
  const [selected, setSelected] = useState(null)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadQuizzes() {
      if (!appContext?.accessToken) {
        setQuizRows(uniqueRowsById([...quizzes, ...getPublishedLocalTeacherQuizzes()]))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const rows = await fetchQuizzes({ accessToken: appContext.accessToken, publishedOnly: true })
        if (active) {
          setQuizRows(uniqueRowsById([...(rows.length > 0 ? rows : quizzes), ...getPublishedLocalTeacherQuizzes()]))
          setError('')
        }
      } catch (loadError) {
        if (active) {
          setQuizRows(uniqueRowsById([...quizzes, ...getPublishedLocalTeacherQuizzes()]))
          setError(loadError.message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadQuizzes()
    return () => {
      active = false
    }
  }, [appContext?.accessToken])

  async function openQuiz(quiz) {
    if (quiz.status === 'Dikunci') {
      notify('Kuis masih dikunci oleh guru.')
      return
    }

    setSelected(quiz)
    setAnswers({})
    setResult(getQuizResult(quiz.id, user?.id))

    if (!appContext?.accessToken || quiz.source !== 'supabase') {
      setQuizQuestions(getQuizQuestionSet(quiz))
      return
    }

    try {
      const rows = await fetchQuizQuestions({ accessToken: appContext.accessToken, quizId: quiz.id })
      setQuizQuestions(rows.length > 0 ? rows : getQuizQuestionSet(quiz))
    } catch (loadError) {
      notify(`Gagal membuka soal kuis: ${loadError.message}`)
      setQuizQuestions(getQuizQuestionSet(quiz))
    }
  }

  async function submitQuiz() {
    if (!selected) return

    const total = quizQuestions.length
    const answeredCount = Object.keys(answers).length

    if (total === 0) {
      notify('Soal kuis belum tersedia.')
      return
    }

    if (answeredCount < total) {
      notify(`Jawab semua soal dulu: ${answeredCount}/${total} terisi.`)
      return
    }

    const correct = quizQuestions.filter((question) => answers[question.id] === question.correctAnswer).length
    const score = Math.round((correct / total) * 100)
    const status = score >= 75 ? 'Tuntas' : 'Remedial'
    const localResult = {
      score,
      correct,
      total,
      status,
      answers,
      submittedAt: new Date().toISOString(),
    }

    if (!appContext?.accessToken || selected.source !== 'supabase') {
      saveQuizResult(selected.id, user?.id, localResult)
      setResult(localResult)
      notify(`Kuis selesai. Skor ${score}.`)
      return
    }

    try {
      const student = isUuid(user?.id) ? await fetchStudentRecord({ accessToken: appContext.accessToken, profileId: user.id }) : null
      if (!student?.id) {
        notify('Profil siswa belum terhubung ke data kelas. Hubungi admin sekolah.')
        return
      }
      const attempt = await submitQuizAttempt({ accessToken: appContext.accessToken, quiz: selected, questions: quizQuestions, answers, studentId: student?.id })
      const savedResult = {
        ...localResult,
        ...attempt,
        status: attempt.score >= 75 ? 'Tuntas' : 'Remedial',
        answers,
      }
      saveQuizResult(selected.id, user?.id, savedResult)
      setResult(savedResult)
      notify('Jawaban kuis tersimpan.')
    } catch (submitError) {
      notify(`Gagal submit kuis: ${submitError.message}`)
    }
  }

  function resetQuiz() {
    setAnswers({})
    setResult(null)
    notify('Jawaban direset. Silakan kerjakan ulang.')
  }

  function optionClass(question, option) {
    const selectedAnswer = answers[question.id] === option
    const correct = question.correctAnswer === option

    if (result && correct) return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    if (result && selectedAnswer && !correct) return 'bg-rose-50 text-rose-700 ring-rose-200'
    if (selectedAnswer) return 'bg-galaxy-deep text-white ring-galaxy-deep'
    return 'bg-white text-gray-700 ring-purple-100 hover:bg-galaxy-lavender'
  }

  if (selected) {
    const answeredCount = Object.keys(answers).length
    const previousResult = result || getQuizResult(selected.id, user?.id)

    return (
      <div>
        <PageHeader
          eyebrow={selected.subject}
          title={selected.title}
          description={`${selected.duration} menit · ${selected.teacher} · ${quizQuestions.length} soal`}
          action={<button onClick={() => setSelected(null)} className="rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-extrabold text-galaxy-purple">Kembali</button>}
        />

        {previousResult && (
          <SectionCard className="mb-4 bg-gradient-to-r from-violet-50 to-cyan-50">
            <StatusBadge tone={previousResult.score >= 75 ? 'green' : 'amber'}>{previousResult.score >= 75 ? 'Tuntas' : 'Remedial'}</StatusBadge>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Skor {previousResult.score}</h2>
            <p className="mt-2 text-sm font-bold text-slate-600">{previousResult.correct} benar dari {previousResult.total} soal.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={resetQuiz} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-galaxy-purple ring-1 ring-purple-100">Kerjakan ulang</button>
              <button onClick={() => setSelected(null)} className="rounded-xl bg-galaxy-action px-3 py-2.5 text-xs font-extrabold text-white">Kembali ke daftar</button>
            </div>
          </SectionCard>
        )}

        <div className="grid gap-4">
          {quizQuestions.map((question, index) => (
            <SectionCard key={question.id}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <StatusBadge tone="cyan">Soal {index + 1}</StatusBadge>
                <StatusBadge tone={question.difficulty === 'Sulit' ? 'red' : question.difficulty === 'Sedang' ? 'amber' : 'green'}>{question.difficulty || 'Mudah'}</StatusBadge>
              </div>
              <h2 className="text-xl font-extrabold leading-8 text-slate-950">{question.questionText}</h2>
              <div className="mt-5 grid gap-2">
                {(question.options || []).map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      if (previousResult) return
                      setAnswers((current) => ({ ...current, [question.id]: option }))
                    }}
                    className={`rounded-2xl px-4 py-3 text-left text-sm font-bold ring-1 transition ${optionClass(question, option)}`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {previousResult && (
                <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-700 ring-1 ring-slate-100">
                  <b>Pembahasan:</b> {question.explanation || 'Pembahasan belum tersedia.'}
                </div>
              )}
            </SectionCard>
          ))}
        </div>

        {!previousResult && (
          <div className="sticky bottom-4 mt-4 rounded-2xl bg-white/90 p-3 shadow-soft ring-1 ring-purple-100 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-600">{answeredCount}/{quizQuestions.length} soal terjawab</p>
              <button onClick={submitQuiz} disabled={quizQuestions.length === 0} className="rounded-xl bg-galaxy-action px-4 py-2.5 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">Submit jawaban</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) return <LoadingState label="Memuat kuis..." />

  return (
    <div>
      <PageHeader eyebrow="Kuis" title="Kuis aktif" description="Pilih kuis yang sudah dipublish guru." />
      {error && <div className="mb-4 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data kuis: {error}. Data lokal ditampilkan.</div>}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {quizRows.map((quiz) => {
          const savedResult = getQuizResult(quiz.id, user?.id)
          const locked = quiz.status === 'Dikunci'
          return (
            <SectionCard key={quiz.id}>
              <div className="mb-4 flex items-center justify-between gap-2">
                <StatusBadge tone={statusTone(locked ? 'Dikunci' : savedResult ? 'Selesai' : quiz.status)}>{savedResult ? 'Selesai' : quiz.status}</StatusBadge>
                {savedResult && <StatusBadge tone={savedResult.score >= 75 ? 'green' : 'amber'}>Skor {savedResult.score}</StatusBadge>}
              </div>
              <h2 className="text-lg font-extrabold">{quiz.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">{quiz.date} · {quiz.duration} menit · {quiz.teacher}</p>
              <button
                onClick={() => openQuiz(quiz)}
                disabled={locked}
                className="mt-5 w-full rounded-2xl bg-galaxy-action px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {locked ? 'Dikunci' : savedResult ? 'Lihat hasil' : 'Mulai / Detail'}
              </button>
            </SectionCard>
          )
        })}
      </div>
    </div>
  )
}


function getStudioFlashcardDecks() {
  return readLocalRowsByPrefix('sman6_studio_flashcards_v1')
    .filter((item) => item && item.title)
    .map((item) => {
      const firstCard = item.cards?.[0]
      return {
        ...item,
        source: 'studio',
        count: item.count || item.cards?.length || 0,
        progress: item.progress || 0,
        front: item.front || firstCard?.front || 'Konsep utama',
        back: item.back || firstCard?.back || 'Penjelasan konsep belum tersedia.',
      }
    })
}

function getStudioLearningPacks() {
  return readLocalRowsByPrefix('sman6_studio_content_v1')
    .filter((item) => item && ['Remedial', 'Pengayaan'].includes(item.outputType || item.savedAs))
    .map((item) => ({
      ...item,
      source: 'studio',
      outputType: item.outputType || item.savedAs,
      subject: item.subject || 'Mata pelajaran',
      className: item.className || 'Kelas umum',
      topic: item.topic || item.title,
      sections: Array.isArray(item.sections) ? item.sections : [],
    }))
}

function FlashcardPage() {
  const [selectedPack, setSelectedPack] = useState(null)
  const studioDecks = getStudioFlashcardDecks()
  const decks = uniqueRowsById([...flashcardDecks, ...studioDecks])
  const learningPacks = getStudioLearningPacks()

  if (selectedPack) {
    return <LearningPackDetail pack={selectedPack} onBack={() => setSelectedPack(null)} />
  }

  return (
    <div>
      <PageHeader
        eyebrow="Flashcard & Paket Belajar"
        title="Review cepat, remedial, dan pengayaan."
        description="Flashcard membantu mengingat konsep inti. Paket remedial dan pengayaan dari guru akan muncul di sini."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatCard icon={Layers3} label="Deck flashcard" value={decks.length} caption={`${studioDecks.length} dari Siapkan Pembelajaran`} tone="green" />
        <StatCard icon={Brain} label="Remedial" value={learningPacks.filter((item) => item.outputType === 'Remedial').length} caption="Latihan perbaikan" tone="amber" />
        <StatCard icon={Sparkles} label="Pengayaan" value={learningPacks.filter((item) => item.outputType === 'Pengayaan').length} caption="Tantangan lanjutan" tone="cyan" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <DashboardCard title="Flashcard">
          {decks.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {decks.map((deck) => (
                <SectionCard key={deck.id}>
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <StatusBadge tone={deck.source === 'studio' ? 'cyan' : 'purple'}>{deck.subject}</StatusBadge>
                    <StatusBadge tone="green">{deck.count} kartu</StatusBadge>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-950">{deck.title}</h2>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{deck.topic || 'Review konsep'}</p>
                  <div className="mt-4 rounded-2xl bg-galaxy-surface p-3 ring-1 ring-purple-100">
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Depan</p>
                    <p className="mt-2 font-extrabold text-slate-950">{deck.front}</p>
                    <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.14em] text-cyan-700">Belakang</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{deck.back}</p>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-galaxy-lavender">
                    <div className="h-2 rounded-full bg-galaxy-action" style={{ width: `${deck.progress || 0}%` }} />
                  </div>
                </SectionCard>
              ))}
            </div>
          ) : (
            <EmptyState title="Belum ada flashcard." description="Flashcard dari guru akan muncul di sini." />
          )}
        </DashboardCard>

        <DashboardCard title="Remedial & Pengayaan">
          {learningPacks.length > 0 ? (
            <div className="space-y-3">
              {learningPacks.map((pack) => (
                <div key={pack.id} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StatusBadge tone={pack.outputType === 'Remedial' ? 'amber' : 'cyan'}>{pack.outputType}</StatusBadge>
                    <StatusBadge tone="purple">{pack.subject}</StatusBadge>
                  </div>
                  <h3 className="mt-3 font-extrabold text-slate-950">{pack.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                    {pack.sections?.[0]?.body || pack.description || 'Paket belajar dari guru.'}
                  </p>
                  <button onClick={() => setSelectedPack(pack)} className="mt-4 rounded-2xl bg-galaxy-action px-4 py-3 text-sm font-extrabold text-white">
                    Buka paket
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Belum ada paket remedial/pengayaan." description="Guru dapat membuatnya dari Siapkan Pembelajaran." />
          )}
        </DashboardCard>
      </div>
    </div>
  )
}

function LearningPackDetail({ pack, onBack }) {
  return (
    <div>
      <PageHeader
        eyebrow={pack.outputType}
        title={pack.title}
        description={`${pack.subject} · ${pack.className} · ${pack.topic}`}
        action={<button onClick={onBack} className="rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-extrabold text-galaxy-purple">Kembali</button>}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
        <SectionCard>
          <StatusBadge tone={pack.outputType === 'Remedial' ? 'amber' : 'cyan'}>{pack.outputType}</StatusBadge>
          <div className="mt-5 space-y-3">
            {(pack.sections || []).length > 0 ? (
              pack.sections.map((section) => (
                <div key={section.title} className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                  <h3 className="font-extrabold text-slate-950">{section.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{section.body}</p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-slate-600">{pack.description || 'Konten paket belajar belum tersedia.'}</p>
            )}
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-sm font-extrabold text-slate-950">Info Paket</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p><b>Jenis:</b> {pack.outputType}</p>
            <p><b>Mapel:</b> {pack.subject}</p>
            <p><b>Kelas:</b> {pack.className}</p>
            <p><b>Topik:</b> {pack.topic}</p>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}


function AIPage() {
  return <><PageHeader eyebrow="AI Tutor" title="AI Tutor siap membantu kamu memahami materi." description="Terhubung ke AI server saat tersedia, dengan mode fallback aman jika API belum dikonfigurasi." /><AIChatPanel /></>
}

function averageScore(rows) {
  if (!rows.length) return 0
  return Math.round(rows.reduce((sum, item) => sum + Number(item.score || 0), 0) / rows.length)
}

function ProgresPage({ user }) {
  const userId = user?.id || 'demo'
  const completedMaterials = getCompletedMaterials(userId)
  const practiceResults = getStoredResultsByPrefix('islelearn-practice-result-')
  const quizResults = getStoredResultsByPrefix(`islelearn-quiz-result-${userId}-`)

  const materialProgress = Math.min(100, completedMaterials.length * 25)
  const practiceAverage = averageScore(practiceResults)
  const quizAverage = averageScore(quizResults)
  const allScores = [...practiceResults, ...quizResults]
  const overallAverage = averageScore(allScores)

  const trendData = [
    { name: 'Materi', nilai: materialProgress, aktivitas: completedMaterials.length },
    { name: 'Latihan', nilai: practiceAverage, aktivitas: practiceResults.length },
    { name: 'Kuis', nilai: quizAverage, aktivitas: quizResults.length },
    { name: 'Rata-rata', nilai: overallAverage, aktivitas: allScores.length },
  ]

  const progressData = [
    { name: 'Materi selesai', progress: materialProgress },
    { name: 'Latihan', progress: practiceAverage },
    { name: 'Kuis', progress: quizAverage },
  ]

  const lowQuizResults = quizResults.filter((item) => Number(item.score) < 75)
  const hasLearningData = completedMaterials.length > 0 || practiceResults.length > 0 || quizResults.length > 0

  return (
    <div>
      <PageHeader
        eyebrow="Nilai & Progres"
        title="Pantau perkembangan belajarmu."
        description="Ringkasan ini membaca progres materi, skor latihan, dan hasil kuis yang sudah kamu kerjakan."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Materi selesai" value={completedMaterials.length} caption={`${materialProgress}% estimasi progres`} tone="cyan" />
        <StatCard icon={FileQuestion} label="Rata-rata latihan" value={practiceAverage || '-'} caption={`${practiceResults.length} latihan tersimpan`} tone="amber" />
        <StatCard icon={ClipboardCheck} label="Rata-rata kuis" value={quizAverage || '-'} caption={`${quizResults.length} kuis tersimpan`} tone="purple" />
        <StatCard icon={Trophy} label="Status belajar" value={overallAverage >= 75 ? 'Tuntas' : hasLearningData ? 'Perlu latihan' : 'Mulai dulu'} caption={hasLearningData ? `Rata-rata ${overallAverage || 0}` : 'Belum ada data'} tone={overallAverage >= 75 ? 'green' : 'amber'} />
      </div>

      {!hasLearningData && (
        <SectionCard className="mb-4 bg-gradient-to-r from-[#E0F2FE] to-cyan-50">
          <StatusBadge tone="amber">Belum ada data nyata</StatusBadge>
          <h2 className="mt-3 text-xl font-extrabold text-slate-950">Mulai dari materi, latihan, atau kuis.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Setelah kamu menandai materi selesai, menyelesaikan latihan, atau submit kuis, halaman ini akan otomatis menampilkan progresmu.
          </p>
        </SectionCard>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <DashboardCard title="Perkembangan nilai">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="nilai" stroke="#0284C7" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </DashboardCard>

        <DashboardCard title="Progress aktivitas">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={progressData}>
              <XAxis dataKey="name" hide />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="progress" fill="#22D3EE" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {lowQuizResults.length > 0 ? (
          lowQuizResults.map((item, index) => (
            <SectionCard key={`${item.submittedAt || 'quiz'}-${index}`}>
              <StatusBadge tone="amber">Remedial</StatusBadge>
              <h2 className="mt-3 font-extrabold">Kuis perlu diulang</h2>
              <p className="text-sm leading-6 text-gray-500">Skor {item.score} · {item.correct}/{item.total} benar. Pelajari pembahasan lalu kerjakan ulang.</p>
            </SectionCard>
          ))
        ) : (
          <>
            <SectionCard>
              <StatusBadge tone="green">Rekomendasi</StatusBadge>
              <h2 className="mt-3 font-extrabold">Pertahankan konsistensi</h2>
              <p className="text-sm leading-6 text-gray-500">Selesaikan minimal satu materi dan satu latihan setiap hari agar progres stabil.</p>
            </SectionCard>
            <SectionCard>
              <StatusBadge tone="cyan">Langkah berikutnya</StatusBadge>
              <h2 className="mt-3 font-extrabold">Coba kuis berikutnya</h2>
              <p className="text-sm leading-6 text-gray-500">Setelah latihan terasa mudah, lanjutkan ke kuis untuk mengukur pemahaman.</p>
            </SectionCard>
          </>
        )}
      </div>
    </div>
  )
}

function LeaderboardPage() {
  return (
    <div>
      <PageHeader eyebrow="Leaderboard" title="Ranking sehat, bukan mempermalukan." description="Top 10, posisi kamu, dan kategori challenge." />
      <div className="space-y-3">{leaderboard.map((student, index) => <div key={student.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-purple-100"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-galaxy-lavender font-extrabold text-galaxy-purple">#{index + 1}</span><div className="flex-1"><p className="font-extrabold">{student.name}</p><p className="text-sm text-gray-500">{student.className} · {student.streak} hari streak</p></div><StatusBadge tone="cyan">{student.xp} XP</StatusBadge></div>)}</div>
    </div>
  )
}

function IsleClubPage() {
  return (
    <div>
      <PageHeader eyebrow="IsleClub Corner" title="English practice for island learners." description="Word, phrase, speaking challenge, writing prompt, dan AI feedback untuk latihan siswa." />
      <IsleClubCorner />
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Mini Dialogue">{isleclub.dialogue.map(([speaker, text]) => <p key={text} className="mb-2 rounded-2xl bg-galaxy-surface p-3 text-sm"><b>{speaker}:</b> {text}</p>)}</DashboardCard>
        <DashboardCard title="IsleClub Leaderboard">{leaderboard.slice(0, 5).map((item, index) => <p key={item.id} className="flex justify-between border-b border-purple-50 py-2 text-sm"><span>{index + 1}. {item.name}</span><b>{item.xp} XP</b></p>)}</DashboardCard>
      </div>
    </div>
  )
}

function ProfilPage({ user }) {
  return (
    <div>
      <PageHeader eyebrow="Profil" title="Profil belajar" description="Identitas, badge, dan statistik belajar." />
      <SectionCard className="max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid h-24 w-24 place-items-center rounded-2xl bg-galaxy-action text-3xl font-extrabold text-white shadow-glow">{user.avatar}</div>
          <div>
            <h2 className="text-3xl font-extrabold">{user.name}</h2>
            <p className="mt-1 text-gray-500">NIS {user.nis} · Kelas {user.className} · {user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">{badges.slice(0, 3).map((badge) => <StatusBadge key={badge.id}>{badge.name}</StatusBadge>)}</div>
          </div>
        </div>
        <div className="mt-6 rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-extrabold text-galaxy-purple ring-1 ring-purple-100">Profil aktif dan tersimpan di perangkat.</div>
      </SectionCard>
    </div>
  )
}

const attendanceStatuses = ['Hadir', 'Izin', 'Sakit', 'Alpa']

const gradeFormatClassRoster = {
  'XI Pangeran Diponegoro': [
    ['ABD. WAHAB', 'L'], ['ADAM PUTRA PERDANA', 'L'], ['AL HUSNA', 'P'], ['ANDI NUR SALAM', 'L'],
    ['ASLAM', 'L'], ['BERLIAN', 'P'], ['DANDI BARATA', 'L'], ['KRISDAYANTI', 'P'],
    ['MUH. ALI RAHMAT', 'L'], ['MUH. YAZIN', 'L'], ['MUH. FAJRI', 'L'], ['MUHAMMAD YASIN', 'L'],
    ['NABILA', 'P'], ['NAYLA', 'P'], ['NUR SYAMSI', 'P'], ['RAHMAT SANJAYA', 'L'],
    ['RAMLI', 'L'], ['RICO SUKARNO', 'L'], ['SAKINAH', 'P'], ['SALMAN ALFAREZY', 'L'],
    ['SALMAN ALFARISI', 'L'], ['SALSABILAH', 'P'], ['SITI AINUN NISYA', 'P'], ['ZAHIRA', 'P'],
  ],
  'XI Soeharto': [
    ['ABD. HAMID SATRIADI', 'L'], ['ABD. KARIM', 'L'], ['ADHA NOVIANA', 'L'], ['ARIFIN', 'L'],
    ['ARYADITYA PUTRA', 'L'], ['AYATUL HUSNA', 'P'], ['DZUL JALALI WALIQRAM', 'L'], ['ERNA', 'P'],
    ['FAUZI TEGUH', 'L'], ['FERDI', 'L'], ['HALIDAH', 'P'], ['HARIANDI', 'L'],
    ['IRMA', 'P'], ['M. SALJI', 'L'], ['MUH. ARPIN', 'L'], ['MUH. ADRIANO', 'L'],
    ['MUH. RESKI ARIF RAHMAN', 'L'], ['MUH. TASBIQ RISKY', 'L'], ['NUR FADILA', 'P'], ['RIKI MAULANA', 'L'],
    ['SAHARUDDIN', 'L'], ['SUCI SETIAWATI', 'P'], ['SYAHRINI', 'P'], ['NUR SALEH', 'L'],
    ['MAGFIRA ZASKIA', 'P'],
  ],
  'XII Jenderal Sudirman': [
    ['ACHMAD', 'L'], ['AJIE SAPUTRA', 'L'], ['ALGAZALI', 'L'], ['ALIF HALIL', 'L'],
    ['ANDIRA FALDIA', 'P'], ['FERDY PRANANDA', 'L'], ['HENRIK SAPUTRA', 'L'], ['INGGI ADITYA', 'L'],
    ['ISDA DAHLIA', 'P'], ['JULIANI', 'P'], ['LASTRIANI', 'P'], ['M. FACHMI', 'L'],
    ['M. YUSUF', 'L'], ['MARWA', 'P'], ['MUHARRAM JANUARI', 'L'], ['MUTRIFA', 'P'],
    ['NABILA', 'P'], ['NURFAIDAH', 'P'], ['PANIA', 'P'], ['PINA SARIANTI', 'P'],
    ['RAY LALO MAULANA', 'L'], ['RESKI ADITIA', 'L'], ['REZA ADITYA', 'L'], ['SITI KHUMAIRAH', 'P'],
    ['SULAEMAN', 'L'], ['WAHYUNI', 'P'], ['WINDI MAJID', 'P'],
  ],
  'XII B.J. Habibie': [
    ['ABDAN SYAKUR', 'L'], ['ADITIA', 'L'], ['AHMAD DANI', 'L'], ['AHMAD FAJRI', 'L'],
    ['AMEL SINTIA', 'P'], ['ANDIKA', 'L'], ['ARYA', 'L'], ['ASMADI', 'L'],
    ['ASMAUL HUSNA', 'P'], ['DEWI ASRIANI', 'P'], ['EKA MARLISA', 'P'], ['ENDANG PURWANTI', 'P'],
    ['FERDIANSYAH S.', 'L'], ['HALAMUDDIN', 'L'], ['MAHATIR MUHAMMAD', 'L'], ['MAHESA PURWADI', 'L'],
    ['MARWAGA', 'P'], ['MUH. FARHAN', 'L'], ['NIA RAHMAWATI', 'P'], ['NUR AULIA', 'P'],
    ['PIA HANDAYANI', 'P'], ['RISKI OLIVIA', 'P'], ['SARTIKA PATARANI', 'P'], ['SRI AULIA ZAHRI', 'P'],
    ['SITI RAHMAWATI', 'P'], ['YULIANA', 'P'],
  ],
}

function makeGradeRosterId(className, index) {
  return `format-${className.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`
}

function promoteClassName(className = '') {
  const normalizedClass = String(className || '').trim()
  if (normalizedClass === 'X Pangeran Diponegoro') return 'XI Pangeran Diponegoro'
  if (normalizedClass === 'X Soeharto') return 'XI Soeharto'
  if (normalizedClass === 'XI Jenderal Sudirman') return 'XII Jenderal Sudirman'
  if (normalizedClass === 'XI B.J. Habibie') return 'XII B.J. Habibie'
  return normalizedClass || 'Kelas umum'
}

function isLegacyPreviewClassName(className = '') {
  return ['X IPA 1', 'XI IPA 1'].includes(String(className || '').trim())
}

function isLegacyPreviewStudentRow(item = {}) {
  const name = item.name || item.fullName || ''
  const className = item.className || item.class || item.class_name || ''
  return isLegacyPreviewClassName(className)
    || /^attendance-preview-/.test(item.id || '')
    || ['A. Rahma', 'Muh. Ilham', 'Nabila Putri', 'Rafi Pratama', 'Siti Aulia', 'Andi Farhan'].includes(name)
}

function gradeLevelFromClassName(className = '', fallbackGrade = '') {
  const normalizedClass = String(className || '').trim()
  if (normalizedClass.startsWith('XII ')) return 12
  if (normalizedClass.startsWith('XI ')) return 11
  if (normalizedClass.startsWith('X ')) return 10
  return fallbackGrade
}

function normalizeClassLookupRows(rows = []) {
  const normalizedRows = Array.isArray(rows) ? rows : []
  const byName = new Map()

  normalizedRows.forEach((row) => {
    const className = promoteClassName(row?.name || row?.className || row?.class_name || '')
    if (!className || isLegacyPreviewClassName(className)) return
    byName.set(className, {
      ...row,
      name: className,
      grade: gradeLevelFromClassName(className, row?.grade || row?.level || ''),
    })
  })

  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name, 'id-ID'))
}

function normalizeAdminProfileRows(role, rows = []) {
  const normalizedRows = Array.isArray(rows) ? rows : []
  if (role !== 'siswa') return normalizedRows

  return normalizedRows
    .filter((row) => row && (row.name || row.fullName))
    .filter((row) => !isLegacyPreviewStudentRow(row))
    .map((row, index) => {
      const studentName = row.name || row.fullName || `Siswa ${index + 1}`
      return {
        ...row,
        id: row.id || `student-${index + 1}`,
        name: studentName,
        fullName: row.fullName || studentName,
        className: promoteClassName(row.className || row.class || row.class_name || 'Kelas umum'),
        role: 'siswa',
      }
    })
}

function getGradeFormatRoster() {
  return Object.entries(gradeFormatClassRoster).flatMap(([className, rows]) => (
    rows.map(([name, gender], index) => ({
      id: makeGradeRosterId(className, index),
      name,
      className,
      gender,
      nis: '',
    }))
  ))
}

function attendanceStorageKey(user) {
  return `islelearn-attendance-${user?.id || 'demo'}`
}

function normalizeAttendanceSession(session = {}) {
  return {
    ...session,
    className: promoteClassName(session.className),
    rows: Array.isArray(session.rows)
      ? session.rows.map((row) => ({ ...row, className: promoteClassName(row.className || session.className) }))
      : [],
  }
}

function getAttendanceSessions(user) {
  return safeReadLocalJson(attendanceStorageKey(user), [])
    .map(normalizeAttendanceSession)
    .filter((session) => !isLegacyPreviewClassName(session.className))
}

function setAttendanceSessions(user, rows) {
  safeWriteLocalJson(attendanceStorageKey(user), Array.isArray(rows) ? rows : [])
}

function toLocalIsoDate(date = new Date()) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

function parseIsoDate(isoDate) {
  const [year, month, day] = String(isoDate || toLocalIsoDate()).split('-').map(Number)
  return new Date(year || new Date().getFullYear(), (month || 1) - 1, day || 1)
}

function addDaysIso(isoDate, amount) {
  const date = parseIsoDate(isoDate)
  date.setDate(date.getDate() + amount)
  return toLocalIsoDate(date)
}

function formatAttendanceDate(isoDate, options = { day: '2-digit', month: 'short' }) {
  return new Intl.DateTimeFormat('id-ID', options).format(parseIsoDate(isoDate))
}

function getAttendanceRoster() {
  const savedStudents = getLocalAdminProfiles('siswa', students)
    .filter((item) => !isLegacyPreviewStudentRow(item))
    .filter((item) => item && (item.name || item.fullName))
    .map((item, index) => ({
      id: item.id || `student-${index}`,
      name: item.name || item.fullName,
      className: promoteClassName(item.className || item.class || item.class_name || 'Kelas umum'),
      nis: item.nis || item.studentNumber || item.email || '',
    }))

  return savedStudents.length ? savedStudents : getGradeFormatRoster()
}

function getAttendanceClassOptions(roster) {
  const adminClasses = normalizeClassLookupRows(getLocalAdminCollection('classes', classes)).map((item) => item.name)
  const rosterClasses = roster.map((item) => item.className).filter(Boolean)
  return Array.from(new Set([...adminClasses, ...rosterClasses])).sort((a, b) => a.localeCompare(b, 'id-ID'))
}

function getGradebookRoster() {
  const savedStudents = getLocalAdminProfiles('siswa', students)
    .filter((item) => !isLegacyPreviewStudentRow(item))
    .filter((item) => item && (item.name || item.fullName))
    .map((item, index) => ({
      id: item.id || `student-${index}`,
      name: item.name || item.fullName,
      className: promoteClassName(item.className || item.class || item.class_name || 'Kelas umum'),
      nis: item.nis || item.studentNumber || item.email || '',
      gender: item.gender || item.sex || item.jk || '',
    }))

  return savedStudents.length ? savedStudents : getGradeFormatRoster()
}

function getGradebookClassOptions(roster) {
  const adminClasses = normalizeClassLookupRows(getLocalAdminCollection('classes', classes)).map((item) => item.name)
  const formatClasses = Object.keys(gradeFormatClassRoster)
  const rosterClasses = roster.map((item) => item.className).filter(Boolean)
  return Array.from(new Set([...formatClasses, ...adminClasses, ...rosterClasses]))
}

function getRosterForClass(roster, className) {
  const rows = roster.filter((item) => item.className === className)
  return rows.length ? rows : roster
}

function getGradeRosterForClass(roster, className) {
  const rows = roster.filter((item) => item.className === className)
  if (rows.length) return rows
  const formatRows = getGradeFormatRoster().filter((item) => item.className === className)
  return formatRows.length ? formatRows : roster
}

function getAttendanceSession(sessions, date, className) {
  return sessions.find((item) => item.date === date && item.className === className) || null
}

function buildAttendanceRows(roster, savedRows = []) {
  const savedById = new Map(savedRows.map((item) => [item.studentId || item.id || item.name, item]))
  const rosterRows = roster.map((student) => {
    const saved = savedById.get(student.id) || savedById.get(student.name) || {}
    return {
      studentId: student.id,
      name: student.name,
      nis: student.nis || '',
      className: student.className || 'Kelas umum',
      status: attendanceStatuses.includes(saved.status) ? saved.status : 'Hadir',
      note: saved.note || '',
    }
  })
  const rosterIds = new Set(rosterRows.map((item) => item.studentId))
  const extraRows = savedRows
    .filter((item) => item && !rosterIds.has(item.studentId || item.id))
    .map((item, index) => ({
      studentId: item.studentId || item.id || `saved-${index}`,
      name: item.name || 'Siswa',
      nis: item.nis || '',
      className: item.className || 'Kelas umum',
      status: attendanceStatuses.includes(item.status) ? item.status : 'Hadir',
      note: item.note || '',
    }))

  return [...rosterRows, ...extraRows]
}

function summarizeAttendanceRows(rows = []) {
  const total = rows.length
  const hadir = rows.filter((item) => item.status === 'Hadir').length
  const izin = rows.filter((item) => item.status === 'Izin').length
  const sakit = rows.filter((item) => item.status === 'Sakit').length
  const alpa = rows.filter((item) => item.status === 'Alpa').length
  const tidakHadir = izin + sakit + alpa

  return {
    total,
    hadir,
    izin,
    sakit,
    alpa,
    tidakHadir,
    rate: total ? Math.round((hadir / total) * 100) : 0,
  }
}

function upsertAttendanceSession(sessions, session) {
  const nextSession = {
    ...session,
    id: session.id || `attendance-${session.date}-${session.className}`.replace(/\s+/g, '-').toLowerCase(),
    updatedAt: new Date().toISOString(),
  }
  const exists = sessions.some((item) => item.date === nextSession.date && item.className === nextSession.className)
  return exists
    ? sessions.map((item) => (item.date === nextSession.date && item.className === nextSession.className ? { ...item, ...nextSession } : item))
    : [nextSession, ...sessions]
}

function summarizeAttendanceSessions(sessions) {
  return summarizeAttendanceRows(sessions.flatMap((item) => Array.isArray(item.rows) ? item.rows : []))
}

function buildWeeklyAttendanceData(sessions, anchorDate = toLocalIsoDate()) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDaysIso(anchorDate, index - 6)
    const daySummary = summarizeAttendanceSessions(sessions.filter((item) => item.date === date))
    return {
      name: formatAttendanceDate(date, { weekday: 'short' }),
      tanggal: formatAttendanceDate(date),
      Hadir: daySummary.hadir,
      Tidak: daySummary.tidakHadir,
      Persen: daySummary.rate,
    }
  })
}

function buildMonthlyAttendanceData(sessions, anchorDate = toLocalIsoDate()) {
  const [year, month] = anchorDate.split('-')
  return Array.from({ length: 5 }, (_, index) => {
    const week = index + 1
    const weekSessions = sessions.filter((item) => {
      if (!String(item.date || '').startsWith(`${year}-${month}`)) return false
      const day = Number(item.date.slice(8, 10))
      return Math.ceil(day / 7) === week
    })
    const weekSummary = summarizeAttendanceSessions(weekSessions)
    return {
      name: `M${week}`,
      Hadir: weekSummary.hadir,
      Tidak: weekSummary.tidakHadir,
      Persen: weekSummary.rate,
    }
  })
}

function getAttendanceMonthRange(anchorDate = toLocalIsoDate()) {
  const date = parseIsoDate(anchorDate)
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return {
    startIso: toLocalIsoDate(startDate),
    endIso: toLocalIsoDate(endDate),
    label: formatAttendanceDate(toLocalIsoDate(startDate), { month: 'long', year: 'numeric' }),
  }
}

function getAttendanceSemesterRange(anchorDate = toLocalIsoDate()) {
  const date = parseIsoDate(anchorDate)
  const month = date.getMonth()
  const isOddSemester = month >= 6
  const startMonth = isOddSemester ? 6 : 0
  const endMonth = isOddSemester ? 11 : 5
  const academicStartYear = isOddSemester ? date.getFullYear() : date.getFullYear() - 1
  const startDate = new Date(date.getFullYear(), startMonth, 1)
  const endDate = new Date(date.getFullYear(), endMonth + 1, 0)

  return {
    startIso: toLocalIsoDate(startDate),
    endIso: toLocalIsoDate(endDate),
    semester: isOddSemester ? 'Ganjil' : 'Genap',
    academicYear: `${academicStartYear}/${academicStartYear + 1}`,
    startMonth,
    endMonth,
    year: date.getFullYear(),
    label: `Semester ${isOddSemester ? 'Ganjil' : 'Genap'} ${academicStartYear}/${academicStartYear + 1}`,
  }
}

function isIsoDateInRange(isoDate, range) {
  const safeDate = String(isoDate || '')
  return safeDate >= range.startIso && safeDate <= range.endIso
}

function getAttendanceSessionsForRange(sessions, className, range) {
  const targetClass = promoteClassName(className)
  return sessions.filter((session) => (
    promoteClassName(session.className) === targetClass
    && isIsoDateInRange(session.date, range)
  ))
}

function buildStudentAttendanceRecap(roster, rangeSessions) {
  return roster.map((student) => {
    const counts = attendanceStatuses.reduce((acc, status) => ({ ...acc, [status]: 0 }), {})

    rangeSessions.forEach((session) => {
      const row = Array.isArray(session.rows)
        ? session.rows.find((item) => item.studentId === student.id || item.name === student.name)
        : null
      const status = attendanceStatuses.includes(row?.status) ? row.status : ''
      if (status) counts[status] += 1
    })

    const total = attendanceStatuses.reduce((sum, status) => sum + counts[status], 0)
    return {
      studentId: student.id,
      name: student.name,
      className: student.className,
      total,
      hadir: counts.Hadir,
      izin: counts.Izin,
      sakit: counts.Sakit,
      alpa: counts.Alpa,
      rate: total ? Math.round((counts.Hadir / total) * 100) : 0,
    }
  })
}

function buildSemesterMonthRecap(sessions, className, anchorDate = toLocalIsoDate()) {
  const semesterRange = getAttendanceSemesterRange(anchorDate)
  return Array.from({ length: semesterRange.endMonth - semesterRange.startMonth + 1 }, (_, index) => {
    const monthDate = new Date(semesterRange.year, semesterRange.startMonth + index, 1)
    const monthRange = getAttendanceMonthRange(toLocalIsoDate(monthDate))
    const monthSessions = getAttendanceSessionsForRange(sessions, className, monthRange)
    const summary = summarizeAttendanceSessions(monthSessions)
    return {
      label: formatAttendanceDate(monthRange.startIso, { month: 'short' }),
      sessionCount: monthSessions.length,
      ...summary,
    }
  })
}

function statusButtonClass(status, selected) {
  if (!selected) return 'bg-white text-[#64748B] ring-[#D9E6F5] hover:bg-[#EAF4FF] hover:text-[#2F80D8]'
  if (status === 'Hadir') return 'bg-emerald-600 text-white ring-emerald-600'
  if (status === 'Izin') return 'bg-[#2F80D8] text-white ring-[#2F80D8]'
  if (status === 'Sakit') return 'bg-amber-500 text-white ring-amber-500'
  return 'bg-rose-600 text-white ring-rose-600'
}

function AttendanceChartPair({ weeklyData, monthlyData }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm font-black text-[#132437]">Mingguan</h3>
          <span className="rounded-lg bg-[#EAF4FF] px-2.5 py-1 text-[11px] font-black text-[#2F80D8]">7 hari</span>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={weeklyData}>
            <CartesianGrid stroke="#E5EEF8" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="Hadir" fill="#2F80D8" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Tidak" fill="#D8A642" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm font-black text-[#132437]">Bulanan</h3>
          <span className="rounded-lg bg-[#EAF4FF] px-2.5 py-1 text-[11px] font-black text-[#2F80D8]">per minggu</span>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={monthlyData}>
            <CartesianGrid stroke="#E5EEF8" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value, name) => name === 'Persen' ? `${value}%` : value} />
            <Line type="monotone" dataKey="Persen" stroke="#17446E" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function AttendanceRecapCard({ title, subtitle, summary, sessionCount }) {
  return (
    <div className="rounded-2xl border border-[#D9E6F5] bg-[#F8FBFF] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#2F80D8]">{title}</p>
          <p className="mt-1 text-sm font-semibold text-[#64748B]">{subtitle}</p>
        </div>
        <span className="rounded-xl bg-white px-3 py-1.5 text-xs font-black text-[#17446E] ring-1 ring-[#D9E6F5]">
          {sessionCount} hari
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-5xl font-black text-[#132437]">{summary.rate}%</p>
          <p className="mt-1 text-xs font-bold text-[#64748B]">{summary.hadir}/{summary.total} catatan hadir</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {[
            ['I', summary.izin],
            ['S', summary.sakit],
            ['A', summary.alpa],
          ].map(([label, value]) => (
            <div key={label} className="min-w-12 rounded-xl bg-white px-2 py-2 ring-1 ring-[#D9E6F5]">
              <p className="text-[10px] font-black text-[#64748B]">{label}</p>
              <p className="font-mono text-lg font-black text-[#132437]">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AttendanceRecapTable({ monthlyRows, semesterRows }) {
  const semesterByStudent = new Map(semesterRows.map((row) => [row.studentId, row]))
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[58rem] text-left text-sm">
        <thead>
          <tr className="border-b border-[#D9E6F5] text-[10px] uppercase tracking-[0.14em] text-[#2F80D8]">
            <th rowSpan={2} className="py-3 pr-4 font-black">Siswa</th>
            <th colSpan={5} className="bg-[#EEF7FF] px-3 py-2 text-center font-black">Bulan ini</th>
            <th colSpan={5} className="bg-[#F8FBFF] px-3 py-2 text-center font-black">Semester ini</th>
          </tr>
          <tr className="border-b border-[#D9E6F5] text-xs uppercase tracking-[0.12em] text-[#64748B]">
            {['H', 'I', 'S', 'A', '%'].map((label) => <th key={`m-${label}`} className="py-3 pr-3 text-center font-black">{label}</th>)}
            {['H', 'I', 'S', 'A', '%'].map((label) => <th key={`s-${label}`} className="py-3 pr-3 text-center font-black">{label}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D9E6F5]">
          {monthlyRows.map((monthlyRow) => {
            const semesterRow = semesterByStudent.get(monthlyRow.studentId) || monthlyRow
            return (
              <tr key={monthlyRow.studentId}>
                <td className="py-3 pr-4">
                  <p className="font-black text-[#132437]">{monthlyRow.name}</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#64748B]">{monthlyRow.className}</p>
                </td>
                {[monthlyRow.hadir, monthlyRow.izin, monthlyRow.sakit, monthlyRow.alpa, `${monthlyRow.rate}%`].map((value, index) => (
                  <td key={`month-${monthlyRow.studentId}-${index}`} className="py-3 pr-3 text-center font-mono font-black text-[#132437]">{value}</td>
                ))}
                {[semesterRow.hadir, semesterRow.izin, semesterRow.sakit, semesterRow.alpa, `${semesterRow.rate}%`].map((value, index) => (
                  <td key={`semester-${monthlyRow.studentId}-${index}`} className="py-3 pr-3 text-center font-mono font-black text-[#17446E]">{value}</td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function SemesterMonthRecap({ rows }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
      {rows.map((row) => (
        <div key={row.label} className="rounded-xl border border-[#D9E6F5] bg-white px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-black uppercase text-[#64748B]">{row.label}</p>
            <span className="rounded-lg bg-[#EAF4FF] px-2 py-0.5 text-[10px] font-black text-[#2F80D8]">{row.sessionCount} hari</span>
          </div>
          <p className="mt-2 font-mono text-2xl font-black text-[#132437]">{row.rate}%</p>
          <p className="mt-1 text-[11px] font-semibold text-[#64748B]">H {row.hadir} · I {row.izin} · S {row.sakit} · A {row.alpa}</p>
        </div>
      ))}
    </div>
  )
}

function GuruDashboard({ user, notify }) {
  const navigate = useNavigate()
  const teacherMaterials = readLocalRowsByPrefix('islelearn-teacher-materials-')
  const teacherAssignments = readLocalRowsByPrefix('islelearn-teacher-assignments-')
  const teacherQuestions = readLocalRowsByPrefix('islelearn-teacher-questions-')
  const teacherQuizzes = readLocalRowsByPrefix('islelearn-teacher-quizzes-')
  const assignmentSubmissions = readLocalRowsByPrefix('islelearn-assignment-submissions-')
  const attendanceSessions = getAttendanceSessions(user)
  const gradebookRows = getGradebookRows(user)
  const gradeSummary = summarizeGradebook(gradebookRows)
  const todayDate = toLocalIsoDate()
  const todayAttendance = summarizeAttendanceSessions(attendanceSessions.filter((item) => item.date === todayDate))
  const weeklyAttendanceData = buildWeeklyAttendanceData(attendanceSessions, todayDate)
  const monthlyAttendanceData = buildMonthlyAttendanceData(attendanceSessions, todayDate)
  const isStatus = (item, status) => String(item?.status || '').toLowerCase() === status.toLowerCase()
  const draftMaterials = teacherMaterials.filter((item) => isStatus(item, 'Draft'))
  const activeAssignments = teacherAssignments.filter((item) => isStatus(item, 'Aktif'))
  const draftAssignments = teacherAssignments.filter((item) => !isStatus(item, 'Aktif'))
  const draftQuizzes = teacherQuizzes.filter((item) => isStatus(item, 'Draft'))
  const publishedQuizzes = teacherQuizzes.filter((item) => isStatus(item, 'Publish'))
  const ungradedSubmissions = assignmentSubmissions.filter((item) => item.score === undefined || item.score === null || item.score === '')
  const draftTotal = draftMaterials.length + draftAssignments.length + draftQuizzes.length
  const hasTeacherData = teacherMaterials.length > 0 || teacherAssignments.length > 0 || teacherQuestions.length > 0 || teacherQuizzes.length > 0 || assignmentSubmissions.length > 0 || gradebookRows.length > 0

  const metricItems = [
    { label: 'Kehadiran', value: `${todayAttendance.rate}%`, caption: `${todayAttendance.hadir}/${todayAttendance.total} hadir hari ini`, icon: CalendarClock },
    { label: 'E-Rapor', value: `${gradeSummary.readyRate}%`, caption: `${gradeSummary.completed} nilai tersimpan`, icon: FileText },
    { label: 'Draft', value: draftTotal, caption: 'perlu review', icon: Send },
    { label: 'Tugas', value: activeAssignments.length, caption: 'sedang aktif', icon: ClipboardCheck },
    { label: 'Submission', value: assignmentSubmissions.length, caption: `${ungradedSubmissions.length} belum dinilai`, icon: FileText },
    { label: 'Bank soal', value: teacherQuestions.length, caption: 'soal tersimpan', icon: FileQuestion },
    { label: 'Kuis', value: publishedQuizzes.length, caption: 'dipublish', icon: PlayCircle },
  ]

  const quickActions = [
    { label: 'Daftar Hadir', icon: CalendarClock, onClick: () => navigate('/guru/daftar-hadir') },
    { label: 'Daftar Nilai', icon: BarChart3, onClick: () => navigate('/guru/daftar-nilai') },
    { label: 'E-Rapor', icon: FileText, onClick: () => navigate('/guru/e-rapor') },
    { label: 'Siapkan', icon: Sparkles, onClick: () => navigate('/guru/studio-konten') },
    { label: 'Materi', icon: BookOpen, onClick: () => navigate('/guru/materi') },
    { label: 'Tugas', icon: ClipboardList, onClick: () => navigate('/guru/tugas') },
    { label: 'Bank Soal', icon: FileQuestion, onClick: () => navigate('/guru/bank-soal') },
    { label: 'Kuis', icon: PlayCircle, onClick: () => navigate('/guru/kuis-live') },
    { label: 'Analisis', icon: LineChartIcon, onClick: () => navigate('/guru/analisis-nilai') },
  ]

  const priorityItems = hasTeacherData ? [
    {
      id: 'publish-content',
      title: draftTotal > 0 ? `${draftTotal} draft` : 'Draft kosong',
      eyebrow: 'Konten',
      meta: draftTotal > 0 ? 'Materi/tugas/kuis perlu dicek sebelum dipublish.' : 'Mulai dari Siapkan Pembelajaran.',
      status: draftTotal > 0 ? 'Review' : 'Kosong',
      icon: Send,
      actionLabel: draftTotal > 0 ? 'Cek' : 'Mulai',
      onClick: () => navigate(draftTotal > 0 ? '/guru/materi' : '/guru/studio-konten'),
    },
    {
      id: 'assignment-monitoring',
      title: activeAssignments.length > 0 ? `${activeAssignments.length} tugas aktif` : 'Tugas kosong',
      eyebrow: 'Tugas',
      meta: activeAssignments.length > 0 ? 'Pantau pengumpulan siswa.' : 'Belum ada tugas yang berjalan.',
      status: activeAssignments.length > 0 ? 'Pantau' : 'Kosong',
      icon: ClipboardCheck,
      actionLabel: 'Tugas',
      onClick: () => navigate('/guru/tugas'),
    },
    {
      id: 'feedback-loop',
      title: ungradedSubmissions.length > 0 ? `${ungradedSubmissions.length} belum dinilai` : 'Nilai kosong',
      eyebrow: 'Feedback',
      meta: ungradedSubmissions.length > 0 ? 'Beri nilai atau komentar ke submission.' : 'Belum ada submission siswa.',
      status: ungradedSubmissions.length > 0 ? 'Nilai' : 'Kosong',
      icon: PencilLine,
      actionLabel: 'Buka',
      onClick: () => navigate('/guru/tugas'),
    },
    {
      id: 'next-meeting',
      title: 'Pertemuan baru',
      eyebrow: 'Perencanaan',
      meta: 'Susun materi, tugas, dan cek pemahaman.',
      status: 'Siap',
      icon: Sparkles,
      actionLabel: 'Rancang',
      onClick: () => navigate('/guru/studio-konten'),
    },
  ] : [
    {
      id: 'start-teaching-flow',
      title: 'Pertemuan pertama',
      eyebrow: 'Mulai',
      meta: 'Buat alur belajar pertama untuk kelas.',
      status: 'Mulai',
      icon: Sparkles,
      actionLabel: 'Rancang',
      onClick: () => navigate('/guru/studio-konten'),
    },
    {
      id: 'create-material',
      title: 'Materi pertama',
      eyebrow: 'Materi',
      meta: 'Tambahkan materi yang bisa diakses siswa.',
      status: 'Belum ada',
      icon: BookOpen,
      actionLabel: 'Materi',
      onClick: () => navigate('/guru/studio-konten'),
    },
    {
      id: 'check-understanding',
      title: 'Cek pemahaman',
      eyebrow: 'Evaluasi',
      meta: 'Siapkan soal singkat atau tugas.',
      status: 'Nanti',
      icon: Target,
      actionLabel: 'Siapkan',
      onClick: () => navigate('/guru/studio-konten'),
    },
  ]

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[1.35rem] border border-[#123B63] bg-[#123B63] p-5 text-white shadow-[0_20px_52px_rgba(11,37,64,0.22)]">
        <div className="grid gap-4 xl:grid-cols-[1fr_21rem] xl:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-sky-200">Ruang mengajar</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-white">Kelola kelas dari antrean kerja.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-100/82">
              Mulai dari konten yang belum publish, submission yang perlu dinilai, lalu pantau aktivitas kelas.
            </p>
            <div className="mt-4">
              <DashboardActionGrid items={quickActions.slice(0, 3)} bare />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ['Hadir', `${todayAttendance.rate}%`],
              ['Aktif', activeAssignments.length + publishedQuizzes.length],
              ['Nilai', ungradedSubmissions.length],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white/10 px-3 py-4 text-center ring-1 ring-white/14">
                <p className="font-mono text-2xl font-black text-white">{value}</p>
                <p className="text-[11px] font-black text-sky-100/72">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MetricStrip items={metricItems} />

      <div className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
        <DashboardPanel title="Daftar hadir hari ini" description={formatAttendanceDate(todayDate, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#F8FBFF] px-3 py-3 ring-1 ring-[#D9E6F5]">
              <p className="text-xs font-black text-[#64748B]">Hadir</p>
              <p className="mt-1 font-mono text-2xl font-black text-[#132437]">{todayAttendance.hadir}</p>
            </div>
            <div className="rounded-xl bg-[#F8FBFF] px-3 py-3 ring-1 ring-[#D9E6F5]">
              <p className="text-xs font-black text-[#64748B]">Tidak hadir</p>
              <p className="mt-1 font-mono text-2xl font-black text-[#132437]">{todayAttendance.tidakHadir}</p>
            </div>
          </div>
          <button onClick={() => navigate('/guru/daftar-hadir')} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#17446E] px-4 text-sm font-black text-white transition hover:bg-[#2F80D8]">
            <CalendarClock size={16} /> Buka daftar hadir
          </button>
        </DashboardPanel>

        <DashboardPanel title="Grafik kehadiran" description="Grafik otomatis membaca daftar hadir yang disimpan guru.">
          <AttendanceChartPair weeklyData={weeklyAttendanceData} monthlyData={monthlyAttendanceData} />
        </DashboardPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <CompactList
          title="Antrean kerja"
          description="Urutkan pekerjaan mengajar yang paling dekat ke siswa."
          items={priorityItems}
        />

        <DashboardPanel title="Checklist kelas" description="Langkah minimal agar kelas terasa siap dipakai.">
          <SetupSteps
            items={[
              { label: 'Buat materi awal', description: 'Tambahkan satu materi sebagai pintu masuk siswa.', icon: BookOpen, done: teacherMaterials.length > 0, actionLabel: 'Buka', onClick: () => navigate('/guru/studio-konten') },
              { label: 'Siapkan evaluasi', description: 'Tugas atau kuis pendek untuk cek pemahaman.', icon: ClipboardCheck, done: activeAssignments.length + publishedQuizzes.length > 0, actionLabel: 'Siapkan', onClick: () => navigate('/guru/studio-konten') },
              { label: 'Beri feedback', description: 'Nilai submission agar siswa tahu langkah berikutnya.', icon: PencilLine, done: assignmentSubmissions.length > 0 && ungradedSubmissions.length === 0, actionLabel: 'Cek', onClick: () => navigate('/guru/tugas') },
            ]}
          />
        </DashboardPanel>
      </div>

      <DashboardActionGrid items={quickActions.slice(3)} title="Menu mengajar" />
    </div>
  )
}

function GuruDaftarHadir({ user, notify }) {
  const roster = useMemo(() => getAttendanceRoster(), [])
  const classOptions = useMemo(() => getAttendanceClassOptions(roster), [roster])
  const [selectedDate, setSelectedDate] = useState(toLocalIsoDate())
  const [selectedClass, setSelectedClass] = useState(classOptions[0] || 'Kelas umum')
  const [sessions, setSessions] = useState(() => getAttendanceSessions(user))
  const rosterForClass = useMemo(() => getRosterForClass(roster, selectedClass), [roster, selectedClass])
  const savedSession = getAttendanceSession(sessions, selectedDate, selectedClass)
  const [rows, setRows] = useState(() => buildAttendanceRows(rosterForClass, savedSession?.rows || []))
  const calendarDays = Array.from({ length: 7 }, (_, index) => addDaysIso(selectedDate, index - 3))
  const draftSession = {
    ...(savedSession || {}),
    date: selectedDate,
    className: selectedClass,
    rows,
    createdBy: user?.id || 'demo',
  }
  const previewSessions = upsertAttendanceSession(sessions, draftSession)
  const selectedClassPreviewSessions = previewSessions.filter((session) => promoteClassName(session.className) === promoteClassName(selectedClass))
  const weeklyAttendanceData = buildWeeklyAttendanceData(selectedClassPreviewSessions, selectedDate)
  const monthlyAttendanceData = buildMonthlyAttendanceData(selectedClassPreviewSessions, selectedDate)
  const monthRange = getAttendanceMonthRange(selectedDate)
  const semesterRange = getAttendanceSemesterRange(selectedDate)
  const monthlySessions = getAttendanceSessionsForRange(previewSessions, selectedClass, monthRange)
  const semesterSessions = getAttendanceSessionsForRange(previewSessions, selectedClass, semesterRange)
  const monthlySummary = summarizeAttendanceSessions(monthlySessions)
  const semesterSummary = summarizeAttendanceSessions(semesterSessions)
  const monthlyStudentRows = buildStudentAttendanceRecap(rosterForClass, monthlySessions)
  const semesterStudentRows = buildStudentAttendanceRecap(rosterForClass, semesterSessions)
  const semesterMonthRows = buildSemesterMonthRecap(previewSessions, selectedClass, selectedDate)
  const summary = summarizeAttendanceRows(rows)

  useEffect(() => {
    if (!classOptions.includes(selectedClass) && classOptions[0]) {
      setSelectedClass(classOptions[0])
    }
  }, [classOptions, selectedClass])

  useEffect(() => {
    const session = getAttendanceSession(sessions, selectedDate, selectedClass)
    setRows(buildAttendanceRows(getRosterForClass(roster, selectedClass), session?.rows || []))
  }, [roster, selectedClass, selectedDate, sessions])

  function updateRow(studentId, patch) {
    setRows((currentRows) => currentRows.map((row) => (
      row.studentId === studentId ? { ...row, ...patch } : row
    )))
  }

  function markAll(status) {
    setRows((currentRows) => currentRows.map((row) => ({ ...row, status })))
  }

  function saveAttendance() {
    const nextSessions = upsertAttendanceSession(sessions, {
      ...draftSession,
      rows: rows.map((row) => ({
        studentId: row.studentId,
        name: row.name,
        nis: row.nis,
        className: row.className,
        status: row.status,
        note: row.note,
      })),
    })
    setAttendanceSessions(user, nextSessions)
    setSessions(nextSessions)
    notify('Daftar hadir berhasil disimpan.')
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Daftar Hadir"
        title="Daftar hadir harian siswa."
        description="Pilih tanggal dan kelas, tandai status siswa, lalu simpan. Grafik dashboard guru akan mengikuti data ini."
        action={<QuickActionButton icon={Save} label="Simpan" onClick={saveAttendance} />}
      />

      <section className="overflow-hidden rounded-2xl border border-[#D9E6F5] bg-white shadow-[0_10px_28px_rgba(15,36,55,0.045)]">
        <div className="grid gap-4 border-b border-[#D9E6F5] bg-[#F8FBFF] p-4 lg:grid-cols-[1fr_18rem_18rem] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#2F80D8]">Kalender hadir</p>
            <h2 className="mt-1 text-xl font-black text-[#132437]">
              {formatAttendanceDate(selectedDate, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </h2>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-black text-[#64748B]">Tanggal</span>
            <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className={materialInputClass} />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-black text-[#64748B]">Kelas</span>
            <select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)} className={materialInputClass}>
              {classOptions.map((className) => <option key={className} value={className}>{className}</option>)}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-7 gap-1.5 p-3">
          {calendarDays.map((date) => {
            const active = date === selectedDate
            const daySummary = summarizeAttendanceSessions(selectedClassPreviewSessions.filter((item) => item.date === date))
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`min-h-[4.5rem] rounded-xl px-2 py-2 text-center transition ring-1 ${
                  active
                    ? 'bg-[#17446E] text-white ring-[#17446E]'
                    : 'bg-white text-[#132437] ring-[#D9E6F5] hover:bg-[#EAF4FF]'
                }`}
              >
                <span className={`block text-[10px] font-black uppercase ${active ? 'text-sky-100' : 'text-[#64748B]'}`}>
                  {formatAttendanceDate(date, { weekday: 'short' })}
                </span>
                <span className="mt-1 block font-mono text-xl font-black">{parseIsoDate(date).getDate()}</span>
                <span className={`mt-1 block text-[10px] font-black ${active ? 'text-sky-100' : 'text-[#2F80D8]'}`}>
                  {daySummary.total ? `${daySummary.rate}%` : '-'}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <DashboardPanel title={`Daftar hadir ${selectedClass}`} description={`${rows.length} siswa pada tanggal terpilih.`}>
        <div className="mb-3 flex flex-wrap gap-2">
          <button onClick={() => markAll('Hadir')} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white transition hover:bg-emerald-700">
            Semua hadir
          </button>
          <button onClick={() => markAll('Alpa')} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-[#64748B] ring-1 ring-[#D9E6F5] transition hover:bg-[#F8FBFF]">
            Reset status
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[#D9E6F5] text-xs uppercase tracking-[0.12em] text-[#64748B]">
                <th className="py-3 pr-4 font-black">Siswa</th>
                <th className="py-3 pr-4 font-black">Status</th>
                <th className="py-3 pr-4 font-black">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E6F5]">
              {rows.map((row) => (
                <tr key={row.studentId}>
                  <td className="py-3 pr-4">
                    <p className="font-black text-[#132437]">{row.name}</p>
                    <p className="mt-0.5 text-xs font-semibold text-[#64748B]">{row.nis || row.className}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1.5">
                      {attendanceStatuses.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateRow(row.studentId, { status })}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-black ring-1 transition ${statusButtonClass(status, row.status === status)}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      value={row.note}
                      onChange={(event) => updateRow(row.studentId, { note: event.target.value })}
                      placeholder="Opsional"
                      className="w-full rounded-xl border border-[#D9E6F5] bg-[#F8FBFF] px-3 py-2 text-sm font-semibold text-[#132437] outline-none focus:border-[#2F80D8] focus:bg-white"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardPanel>

      <MetricStrip
        items={[
          { label: 'Hadir', value: summary.hadir, caption: `${summary.rate}% dari ${summary.total} siswa`, icon: ClipboardCheck },
          { label: 'Izin', value: summary.izin, caption: 'izin tercatat', icon: FileText },
          { label: 'Sakit', value: summary.sakit, caption: 'sakit tercatat', icon: FileText },
          { label: 'Alpa', value: summary.alpa, caption: 'tanpa keterangan', icon: Target },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <DashboardPanel title="Rekap cepat" description="Ringkasan ini ikut tampil di dashboard guru.">
          <div className="mb-4 rounded-2xl bg-[#123B63] p-4 text-white">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-sky-200">Kehadiran</p>
            <p className="mt-2 font-mono text-5xl font-black">{summary.rate}%</p>
            <p className="mt-2 text-sm font-semibold text-sky-100/80">{summary.hadir} hadir dari {summary.total} siswa</p>
          </div>
          <div className="space-y-2">
            {[
              ['Izin', summary.izin],
              ['Sakit', summary.sakit],
              ['Alpa', summary.alpa],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-[#F8FBFF] px-3 py-2 ring-1 ring-[#D9E6F5]">
                <span className="text-sm font-black text-[#132437]">{label}</span>
                <span className="font-mono text-lg font-black text-[#2F80D8]">{value}</span>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel title="Grafik kehadiran" description="Mingguan menampilkan 7 hari terakhir. Bulanan menampilkan persentase per minggu pada bulan terpilih.">
          <AttendanceChartPair weeklyData={weeklyAttendanceData} monthlyData={monthlyAttendanceData} />
        </DashboardPanel>
      </div>

      <DashboardPanel
        title="Rekap bulan dan semester"
        description={`Membaca data ${selectedClass} pada ${monthRange.label} dan ${semesterRange.label}.`}
      >
        <div className="grid gap-3 xl:grid-cols-2">
          <AttendanceRecapCard title="Rekap bulanan" subtitle={monthRange.label} summary={monthlySummary} sessionCount={monthlySessions.length} />
          <AttendanceRecapCard title="Rekap semester" subtitle={semesterRange.label} summary={semesterSummary} sessionCount={semesterSessions.length} />
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">Ringkasan bulan dalam semester</p>
          <SemesterMonthRecap rows={semesterMonthRows} />
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">Rekap per siswa</p>
          <AttendanceRecapTable monthlyRows={monthlyStudentRows} semesterRows={semesterStudentRows} />
        </div>
      </DashboardPanel>
    </div>
  )
}

const gradeKktp = 75
const gradeWeights = { summative: 0.7, finalAssessment: 0.3 }
const gradeFormativeScoreFields = Array.from({ length: 6 }, (_, index) => ({ key: `f${index + 1}`, label: `F ${index + 1}` }))
const gradeSummativeScoreFields = Array.from({ length: 6 }, (_, index) => ({ key: `slm${index + 1}`, label: `SLM ${index + 1}` }))
const gradeFinalScoreField = { key: 'sas', label: 'SAS' }
const gradeScoreFields = [...gradeFormativeScoreFields, ...gradeSummativeScoreFields, gradeFinalScoreField]
const gradeFormatWeights = [
  { label: 'KKTP', value: gradeKktp },
  { label: 'Formatif', value: 'Catatan proses' },
  { label: 'Sumatif LM', value: `${Math.round(gradeWeights.summative * 100)}%` },
  { label: 'SAS', value: `${Math.round(gradeWeights.finalAssessment * 100)}%` },
  { label: 'Rapor', value: 'NA + capaian' },
]

const reportSubjectFallbacks = [
  'Bahasa Indonesia',
  'Matematika',
  'Bahasa Inggris',
  'Biologi',
  'Pendidikan Agama Islam',
  'Pendidikan Pancasila',
]

const reportSchoolProfile = {
  name: school.name,
  npsn: '-',
  address: 'Belum diatur',
  district: 'Pangkajene dan Kepulauan',
  province: 'Sulawesi Selatan',
}

const reportPrintProfile = {
  ministry: 'Kementerian Pendidikan Dasar dan Menengah',
  directorate: 'Direktorat Jenderal Pendidikan Anak Usia Dini, Pendidikan Dasar, dan Pendidikan Menengah',
  title: 'Laporan Hasil Belajar Peserta Didik',
  subtitle: 'Rapor Kurikulum Merdeka',
  application: 'IsleLearn E-Rapor',
}

const graduateProfileDimensions = [
  'Keimanan dan ketakwaan terhadap Tuhan YME',
  'Kewargaan',
  'Penalaran kritis',
  'Kreativitas',
  'Kolaborasi',
  'Kemandirian',
  'Kesehatan',
  'Komunikasi',
]

const reportMandatorySubjectKeywords = [
  'pendidikan agama',
  'pendidikan pancasila',
  'bahasa indonesia',
  'matematika',
  'bahasa inggris',
  'sejarah',
  'pjok',
  'seni',
  'informatika',
]

const reportMonths = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

function gradebookStorageKey(user) {
  return `islelearn-gradebook-${user?.id || 'demo'}`
}

function getGradebookRows(user) {
  return safeReadLocalJson(gradebookStorageKey(user), [])
    .map(normalizeGradebookRow)
    .filter((row) => !isLegacyPreviewClassName(row.className) && !isLegacyPreviewStudentRow(row))
}

function setGradebookRows(user, rows) {
  safeWriteLocalJson(gradebookStorageKey(user), Array.isArray(rows) ? rows : [])
}

function getAllGradebookRows() {
  return readLocalRowsByPrefix('islelearn-gradebook-')
    .map(normalizeGradebookRow)
    .filter((row) => !isLegacyPreviewClassName(row.className) && !isLegacyPreviewStudentRow(row))
}

function getAllAttendanceSessions() {
  return readLocalRowsByPrefix('islelearn-attendance-')
}

function getGradeSubjectOptions() {
  const localSubjects = getLocalAdminCollection('subjects', subjects)
    .map((item) => item?.name || item?.subject)
    .filter(Boolean)
  return Array.from(new Set([...localSubjects, ...reportSubjectFallbacks]))
}

function buildGradebookRows(roster, savedRows, context) {
  const contextRows = savedRows.filter((row) => sameGradeContext(row, context))
  const savedByStudentId = new Map(contextRows.map((row) => [row.studentId, row]))
  const rows = roster.map((student, index) => {
    const saved = savedByStudentId.get(student.id) || contextRows.find((row) => row.name === student.name) || {}
    const scores = normalizeGradeScores(saved.scores)
    const breakdown = calculateGradeBreakdown(scores)

    return {
      id: saved.id || `grade-${student.id}-${context.subject}-${context.semester}-${context.academicYear}`.replace(/\s+/g, '-').toLowerCase(),
      studentId: student.id,
      name: student.name,
      nis: saved.nis || student.nis || '',
      gender: saved.gender || student.gender || '',
      className: promoteClassName(context.className),
      subject: context.subject,
      semester: context.semester,
      academicYear: context.academicYear,
      scores,
      averageFormative: breakdown.averageFormative,
      averageSummative: breakdown.averageSummative,
      finalScore: breakdown.finalScore,
      status: getGradeStatus(breakdown.finalScore),
      predicate: getGradePredicate(breakdown.finalScore),
      competency: saved.competency || defaultCompetencyDescription(context.subject, breakdown.finalScore),
      note: saved.note || '',
      order: saved.order ?? index,
    }
  })

  const rosterIds = new Set(rows.map((row) => row.studentId))
  const rosterNames = new Set(rows.map((row) => normalizeLookupText(row.name)))
  const extraRows = contextRows.filter((row) => !rosterIds.has(row.studentId) && !rosterNames.has(normalizeLookupText(row.name)))
  return [...rows, ...extraRows.map(normalizeGradebookRow)]
}

function sameGradeContext(row, context) {
  return promoteClassName(row.className) === promoteClassName(context.className)
    && row.subject === context.subject
    && row.semester === context.semester
    && row.academicYear === context.academicYear
}

function mergeGradebookRows(savedRows, context, rows) {
  return [
    ...savedRows.filter((row) => !sameGradeContext(row, context)),
    ...rows.map((row) => ({
      ...row,
      ...context,
      className: promoteClassName(context.className),
      ...calculateGradeBreakdown(row.scores),
      status: getGradeStatus(calculateFinalScore(row.scores)),
      predicate: getGradePredicate(calculateFinalScore(row.scores)),
      updatedAt: new Date().toISOString(),
    })),
  ]
}

function normalizeScoreValue(value) {
  if (value === '' || value === null || value === undefined) return ''
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? Math.max(0, Math.min(100, numericValue)) : ''
}

function normalizeGradeScores(scores = {}) {
  const hasNewFormat = gradeScoreFields.some(({ key }) => scores?.[key] !== undefined && scores?.[key] !== '')
  const legacyScores = hasNewFormat ? scores : {
    f1: scores?.formatif ?? scores?.nh1,
    f2: scores?.nh2,
    f3: scores?.nh3,
    f4: scores?.nh4,
    f5: scores?.nh5,
    f6: scores?.nh6,
    slm1: scores?.sumatif ?? scores?.s1,
    slm2: scores?.pts ?? scores?.s2,
    slm3: scores?.pas ?? scores?.s3,
    slm4: scores?.s4,
    slm5: scores?.s5,
    slm6: scores?.s6,
    sas: scores?.sa ?? scores?.proyek,
  }

  return Object.fromEntries(gradeScoreFields.map(({ key }) => [key, normalizeScoreValue(legacyScores?.[key])]))
}

function averageScoreFields(scores = {}, fields = []) {
  const values = fields
    .map(({ key }) => normalizeScoreValue(scores[key]))
    .filter((value) => value !== '')
  if (!values.length) return ''
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function calculateGradeBreakdown(scores = {}) {
  const normalizedScores = normalizeGradeScores(scores)
  const averageFormative = averageScoreFields(normalizedScores, gradeFormativeScoreFields)
  const averageSummative = averageScoreFields(normalizedScores, gradeSummativeScoreFields)
  const finalAssessment = normalizeScoreValue(normalizedScores.sas)
  const weightedValues = [
    averageSummative !== '' ? { value: averageSummative, weight: gradeWeights.summative } : null,
    finalAssessment !== '' ? { value: finalAssessment, weight: gradeWeights.finalAssessment } : null,
  ].filter(Boolean)

  const totalWeight = weightedValues.reduce((sum, item) => sum + item.weight, 0)
  const finalScore = totalWeight
    ? Math.round(weightedValues.reduce((sum, item) => sum + item.value * item.weight, 0) / totalWeight)
    : 0

  return {
    scores: normalizedScores,
    averageFormative,
    averageDaily: averageFormative,
    averageSummative,
    finalAssessment: finalAssessment === '' ? 0 : finalAssessment,
    finalScore,
  }
}

function calculateFinalScore(scores = {}) {
  return calculateGradeBreakdown(scores).finalScore
}

function getGradeStatus(score) {
  if (!score) return 'Belum Diisi'
  return score >= gradeKktp ? 'Tercapai' : 'Perlu Penguatan'
}

function gradeStatusTone(score) {
  if (!score) return 'gray'
  return score >= gradeKktp ? 'green' : 'amber'
}

function getGradePredicate(score) {
  if (score >= 90) return 'Sangat Baik'
  if (score >= 80) return 'Baik'
  if (score >= gradeKktp) return 'Cukup'
  if (score > 0) return 'Perlu Bimbingan'
  return '-'
}

function defaultCompetencyDescription(subject, score) {
  if (!score) return `Capaian kompetensi ${subject} belum diisi.`
  if (score >= 90) return `Sangat baik dalam memahami konsep ${subject}, mandiri, dan konsisten menyelesaikan tugas.`
  if (score >= 80) return `Baik dalam memahami konsep ${subject} dan mampu menerapkan materi pada sebagian besar aktivitas.`
  if (score >= gradeKktp) return `Cukup memahami konsep ${subject}; perlu latihan lanjutan pada beberapa bagian.`
  return `Belum tuntas pada ${subject}; perlu pembimbingan, latihan bertahap, dan asesmen perbaikan.`
}

function normalizeGradebookRow(row = {}) {
  const breakdown = calculateGradeBreakdown(row.scores)
  const subject = row.subject || 'Mata pelajaran'
  const finalScore = breakdown.finalScore
  return {
    ...row,
    className: promoteClassName(row.className),
    scores: breakdown.scores,
    averageFormative: breakdown.averageFormative,
    averageDaily: breakdown.averageFormative,
    averageSummative: breakdown.averageSummative,
    finalAssessment: breakdown.finalAssessment,
    finalScore,
    status: getGradeStatus(finalScore),
    predicate: getGradePredicate(finalScore),
    competency: row.competency || defaultCompetencyDescription(subject, finalScore),
  }
}

function summarizeGradebook(rows = []) {
  const scoredRows = rows.filter((row) => row.finalScore > 0)
  const average = scoredRows.length
    ? Math.round(scoredRows.reduce((sum, row) => sum + row.finalScore, 0) / scoredRows.length)
    : 0
  return {
    average,
    completed: scoredRows.length,
    total: rows.length,
    readyRate: rows.length ? Math.round((scoredRows.length / rows.length) * 100) : 0,
    highest: scoredRows.length ? Math.max(...scoredRows.map((row) => row.finalScore)) : 0,
    lowest: scoredRows.length ? Math.min(...scoredRows.map((row) => row.finalScore)) : 0,
    tuntas: scoredRows.filter((row) => row.finalScore >= gradeKktp).length,
    remedial: scoredRows.filter((row) => row.finalScore < gradeKktp).length,
  }
}

function buildSampleGradeRows(rows) {
  return rows.map((row, index) => {
    const base = 78 + (index % 4) * 4
    const scores = Object.fromEntries(gradeScoreFields.map(({ key }, fieldIndex) => [
      key,
      Math.min(98, base + ((fieldIndex + index) % 5)),
    ]))
    const breakdown = calculateGradeBreakdown(scores)
    return {
      ...row,
      ...breakdown,
      status: getGradeStatus(breakdown.finalScore),
      predicate: getGradePredicate(breakdown.finalScore),
      competency: defaultCompetencyDescription(row.subject, breakdown.finalScore),
    }
  })
}

function getReportStudentOptions(rows, roster = getGradebookRoster()) {
  const fromRows = rows.map((row) => ({
    id: row.studentId,
    name: row.name,
    nis: row.nis || '',
    className: promoteClassName(row.className),
    gender: row.gender || '',
  })).filter((student) => !isLegacyPreviewStudentRow(student))
  const merged = [...fromRows, ...roster]
  const seen = new Set()
  return merged.filter((student) => {
    const key = `${normalizeLookupText(student.name)}-${normalizeLookupText(promoteClassName(student.className))}`
    if (!student.name || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function getReportRowsForStudent(rows, student, semester, academicYear) {
  if (!student) return []
  return rows
    .filter((row) => (row.studentId === student.id || row.name === student.name)
      && row.semester === semester
      && row.academicYear === academicYear)
    .sort((a, b) => a.subject.localeCompare(b.subject, 'id-ID'))
}

function getReportAttendanceSummary(student, className) {
  const relevantRows = getAllAttendanceSessions()
    .filter((session) => !className || session.className === className)
    .flatMap((session) => Array.isArray(session.rows) ? session.rows : [])
    .filter((row) => row.studentId === student?.id || row.name === student?.name)
  return summarizeAttendanceRows(relevantRows)
}

function getClassLevel(className = '') {
  const normalizedClass = String(className).toUpperCase()
  if (normalizedClass.includes('XII')) return 'XII'
  if (normalizedClass.includes('XI')) return 'XI'
  if (normalizedClass.includes('X')) return 'X'
  return '-'
}

function getReportPhase(className = '') {
  const level = getClassLevel(className)
  if (level === 'X') return 'E'
  if (level === 'XI' || level === 'XII') return 'F'
  return '-'
}

function getSemesterNumber(semester) {
  return semester === 'Genap' ? '2 (Dua)' : '1 (Satu)'
}

function formatLongIndonesianDate(date = new Date()) {
  return `${date.getDate()} ${reportMonths[date.getMonth()]} ${date.getFullYear()}`
}

function isMandatoryReportSubject(subject = '') {
  const normalizedSubject = normalizeLookupText(subject)
  return reportMandatorySubjectKeywords.some((keyword) => normalizedSubject.includes(normalizeLookupText(keyword)))
}

function groupReportRows(rows = []) {
  const mandatoryRows = rows.filter((row) => isMandatoryReportSubject(row.subject))
  const electiveRows = rows.filter((row) => !isMandatoryReportSubject(row.subject))

  return [
    { label: 'A. Kelompok Mata Pelajaran Umum', rows: mandatoryRows },
    { label: 'B. Kelompok Mata Pelajaran Pilihan / Muatan Sekolah', rows: electiveRows },
  ].filter((group) => group.rows.length)
}

function getReportDocumentNumber({ student, semester, academicYear, className }) {
  const cleanYear = String(academicYear || '').replace(/\D/g, '') || '0000'
  const semesterCode = semester === 'Genap' ? '02' : '01'
  const classCode = normalizeLookupText(className || 'kelas').replace(/\s+/g, '-').toUpperCase().slice(0, 12)
  const studentCode = normalizeLookupText(student?.name || student?.id || 'siswa').replace(/\s+/g, '-').toUpperCase().slice(0, 12)
  return `ER-${cleanYear}-${semesterCode}-${classCode}-${studentCode}`
}

function getReportDecision(summary, semester, level) {
  if (!summary.completed) return 'Belum dapat ditetapkan'
  if (semester === 'Genap' && level === 'XII') return summary.average >= gradeKktp ? 'Lulus' : 'Perlu rapat dewan guru'
  if (semester === 'Genap') return summary.average >= gradeKktp ? 'Naik kelas' : 'Perlu rapat dewan guru'
  return summary.average >= gradeKktp ? 'Melanjutkan pembelajaran' : 'Perlu bimbingan lanjutan'
}

function getReportValidationItems(report) {
  const rows = report?.rows || []
  const attendance = report?.attendance || {}
  const hasCompetencyDescriptions = rows.length > 0 && rows.every((row) => row.competency && !row.competency.includes('belum diisi'))
  const hasAllScores = rows.length > 0 && rows.every((row) => row.finalScore > 0)
  const hasIdentity = Boolean(report?.student?.name && report?.className && report?.academicYear && report?.semester)
  const hasAttendance = ['hadir', 'izin', 'sakit', 'alpa'].some((key) => Number(attendance[key] || 0) > 0)
  const hasProfile = (report?.graduateProfileRows || []).some((row) => row.description && !row.description.includes('belum diisi'))

  return [
    { label: 'Identitas peserta didik', done: hasIdentity, detail: hasIdentity ? 'Nama, kelas, semester, dan tahun ajaran tersedia.' : 'Lengkapi identitas rapor.' },
    { label: 'Nilai akhir mata pelajaran', done: hasAllScores, detail: hasAllScores ? `${rows.length} nilai siap dicetak.` : 'Simpan nilai akhir pada daftar nilai.' },
    { label: 'Capaian kompetensi', done: hasCompetencyDescriptions, detail: hasCompetencyDescriptions ? 'Deskripsi capaian terisi.' : 'Lengkapi deskripsi capaian tiap mapel.' },
    { label: 'Profil lulusan', done: hasProfile, detail: hasProfile ? 'Deskripsi profil lulusan tersedia.' : 'Profil lulusan belum siap.' },
    { label: 'Rekap kehadiran', done: hasAttendance, detail: hasAttendance ? 'Rekap hadir/izin/sakit/alpa terbaca.' : 'Belum ada data daftar hadir.' },
  ]
}

function getReportReadiness(report) {
  const items = getReportValidationItems(report)
  const completed = items.filter((item) => item.done).length
  return {
    items,
    completed,
    total: items.length,
    percent: items.length ? Math.round((completed / items.length) * 100) : 0,
    status: completed === items.length ? 'Siap cetak' : 'Perlu dilengkapi',
  }
}

function buildGraduateProfileRows(summary) {
  const achievement = summary.average >= 85
    ? 'Menunjukkan perkembangan sangat baik pada dimensi profil lulusan, terutama kolaborasi, kemandirian, penalaran kritis, dan tanggung jawab.'
    : summary.average >= gradeKktp
      ? 'Berkembang sesuai harapan pada dimensi profil lulusan; perlu menjaga konsistensi refleksi, komunikasi, dan penyelesaian tugas.'
      : 'Perlu pendampingan untuk menguatkan kemandirian, kolaborasi, komunikasi, dan refleksi belajar.'

  return [
    {
      aspect: 'Profil Lulusan',
      dimension: graduateProfileDimensions.join('; '),
      description: summary.completed ? achievement : 'Data profil lulusan belum diisi.',
    },
  ]
}

function getExtracurricularRows(student) {
  const storedRows = safeReadLocalJson(`islelearn-extracurricular-${student?.id || 'demo'}`, [])
  if (Array.isArray(storedRows) && storedRows.length) return storedRows
  return [
    {
      activity: 'Belum diisi',
      predicate: '-',
      description: 'Data ekstrakurikuler belum tersedia.',
    },
  ]
}

function buildReportData({ rows, student, semester, academicYear }) {
  const reportRows = getReportRowsForStudent(rows, student, semester, academicYear)
  const summary = summarizeGradebook(reportRows)
  const attendance = getReportAttendanceSummary(student, student?.className)
  const className = promoteClassName(student?.className || reportRows[0]?.className || 'Kelas')
  const level = getClassLevel(className)
  return {
    student,
    semester,
    semesterNumber: getSemesterNumber(semester),
    academicYear,
    className,
    phase: getReportPhase(className),
    level,
    school: reportSchoolProfile,
    printProfile: reportPrintProfile,
    documentNumber: getReportDocumentNumber({ student, semester, academicYear, className }),
    rows: reportRows,
    groupedRows: groupReportRows(reportRows),
    summary,
    attendance,
    graduateProfileRows: buildGraduateProfileRows(summary),
    extracurricularRows: getExtracurricularRows(student),
    waliNote: summary.average >= 85
      ? 'Pertahankan kebiasaan belajar dan bantu teman saat diskusi kelas.'
      : summary.average >= 75
        ? 'Tingkatkan konsistensi belajar dan selesaikan latihan tepat waktu.'
        : 'Perlu pendampingan belajar lebih teratur bersama guru dan orang tua.',
    parentResponse: '................................................................................................................................................................',
    decision: getReportDecision(summary, semester, level),
    issuePlace: 'Pangkajene dan Kepulauan',
    issueDate: formatLongIndonesianDate(),
    homeroomName: 'Wali Kelas',
    principalName: 'Kepala Sekolah',
  }
}

function GuruDaftarNilai({ user, notify }) {
  const navigate = useNavigate()
  const roster = useMemo(() => getGradebookRoster(), [])
  const classOptions = useMemo(() => getGradebookClassOptions(roster), [roster])
  const subjectOptions = useMemo(() => getGradeSubjectOptions(), [])
  const [selectedClass, setSelectedClass] = useState(classOptions[0] || 'Kelas umum')
  const [selectedSubject, setSelectedSubject] = useState(user?.subject || subjectOptions[0] || 'Mata pelajaran')
  const [semester, setSemester] = useState('Genap')
  const [academicYear, setAcademicYear] = useState('2026/2027')
  const [savedRows, setSavedRows] = useState(() => getGradebookRows(user))
  const context = { className: selectedClass, subject: selectedSubject, semester, academicYear }
  const rosterForClass = useMemo(() => getGradeRosterForClass(roster, selectedClass), [roster, selectedClass])
  const [rows, setRows] = useState(() => buildGradebookRows(rosterForClass, savedRows, context))
  const summary = summarizeGradebook(rows)

  useEffect(() => {
    if (!classOptions.includes(selectedClass) && classOptions[0]) setSelectedClass(classOptions[0])
  }, [classOptions, selectedClass])

  useEffect(() => {
    setRows(buildGradebookRows(rosterForClass, savedRows, context))
  }, [rosterForClass, savedRows, selectedClass, selectedSubject, semester, academicYear])

  function updateScore(studentId, key, value) {
    const cleanValue = value === '' ? '' : Math.max(0, Math.min(100, Number(value)))
    setRows((currentRows) => currentRows.map((row) => {
      if (row.studentId !== studentId) return row
      const scores = normalizeGradeScores({ ...row.scores, [key]: cleanValue })
      const previousAutoDescription = defaultCompetencyDescription(row.subject, row.finalScore)
      const breakdown = calculateGradeBreakdown(scores)
      const autoDescription = defaultCompetencyDescription(row.subject, breakdown.finalScore)
      return {
        ...row,
        ...breakdown,
        status: getGradeStatus(breakdown.finalScore),
        predicate: getGradePredicate(breakdown.finalScore),
        competency: !row.competency || row.competency === previousAutoDescription ? autoDescription : row.competency,
      }
    }))
  }

  function updateRow(studentId, patch) {
    setRows((currentRows) => currentRows.map((row) => (
      row.studentId === studentId ? { ...row, ...patch } : row
    )))
  }

  function saveRows(nextRows = rows) {
    const mergedRows = mergeGradebookRows(savedRows, context, nextRows)
    setGradebookRows(user, mergedRows)
    setSavedRows(mergedRows)
    notify('Daftar nilai tersimpan dan e-rapor diperbarui.')
  }

  function fillSampleRows() {
    const nextRows = buildSampleGradeRows(rows)
    setRows(nextRows)
    saveRows(nextRows)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Daftar Nilai"
        title="Format nilai Kurikulum Merdeka."
        description="Formatif dipakai sebagai umpan balik belajar. Nilai akhir rapor dihitung dari Sumatif Lingkup Materi dan Sumatif Akhir Semester, lalu menghasilkan capaian kompetensi."
        action={
          <div className="flex flex-wrap gap-2">
            <QuickActionButton icon={Save} label="Simpan nilai" onClick={() => saveRows()} />
            <QuickActionButton icon={FileText} label="Buka E-Rapor" onClick={() => navigate('/guru/e-rapor')} />
          </div>
        }
      />

      <section className="rounded-2xl border border-[#D9E6F5] bg-white p-4 shadow-[0_10px_28px_rgba(15,36,55,0.045)]">
        <div className="grid gap-3 md:grid-cols-4">
          <label className={materialLabelClass}>Kelas
            <select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)} className={materialInputClass}>
              {classOptions.map((className) => <option key={className} value={className}>{className}</option>)}
            </select>
          </label>
          <label className={materialLabelClass}>Mata pelajaran
            <select value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)} className={materialInputClass}>
              {subjectOptions.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
            </select>
          </label>
          <label className={materialLabelClass}>Semester
            <select value={semester} onChange={(event) => setSemester(event.target.value)} className={materialInputClass}>
              <option>Ganjil</option>
              <option>Genap</option>
            </select>
          </label>
          <label className={materialLabelClass}>Tahun ajaran
            <input value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} className={materialInputClass} />
          </label>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {gradeFormatWeights.map((item) => (
            <div key={item.label} className="rounded-xl border border-[#D9E6F5] bg-[#F8FBFF] px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#64748B]">{item.label}</p>
              <p className="mt-1 font-mono text-lg font-black text-[#17446E]">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <MetricStrip items={[
        { label: 'Rata-rata', value: summary.average || '-', caption: `${summary.completed}/${summary.total} siswa sudah bernilai`, icon: BarChart3 },
        { label: 'Tercapai', value: summary.tuntas, caption: `KKTP ${gradeKktp}`, icon: Trophy },
        { label: 'Perlu penguatan', value: summary.remedial, caption: 'butuh tindak lanjut', icon: Target },
        { label: 'Siap rapor', value: `${summary.readyRate}%`, caption: 'terhubung ke e-rapor', icon: FileText },
      ]} />

      <DashboardPanel title={`Daftar nilai ${selectedClass}`} description={`${selectedSubject} · Semester ${semester} · ${academicYear}`}>
        <div className="mb-3 flex flex-wrap gap-2">
          <button onClick={fillSampleRows} className="rounded-xl bg-[#EAF4FF] px-3 py-2 text-xs font-black text-[#2F80D8] ring-1 ring-[#D9E6F5] transition hover:bg-white">
            Isi nilai awal
          </button>
          <button onClick={() => navigate('/guru/e-rapor')} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-[#64748B] ring-1 ring-[#D9E6F5] transition hover:bg-[#F8FBFF]">
            Lihat E-Rapor
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[124rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[#D9E6F5] text-[10px] uppercase tracking-[0.14em] text-[#2F80D8]">
                <th colSpan={4} className="bg-[#F8FBFF] px-3 py-2 font-black">Data siswa</th>
                <th colSpan={6} className="bg-[#EEF7FF] px-3 py-2 font-black">Asesmen formatif</th>
                <th className="bg-[#F8FBFF] px-3 py-2 font-black">Rata formatif</th>
                <th colSpan={6} className="bg-[#EEF7FF] px-3 py-2 font-black">Sumatif lingkup materi</th>
                <th className="bg-[#F8FBFF] px-3 py-2 font-black">Rata sumatif</th>
                <th className="bg-[#EEF7FF] px-3 py-2 font-black">Sumatif akhir semester</th>
                <th colSpan={3} className="bg-[#F8FBFF] px-3 py-2 font-black">Rapor</th>
              </tr>
              <tr className="border-b border-[#D9E6F5] text-xs uppercase tracking-[0.12em] text-[#64748B]">
                <th className="py-3 pr-3 font-black">No</th>
                <th className="py-3 pr-3 font-black">NISN/NIS</th>
                <th className="py-3 pr-3 font-black">Nama siswa</th>
                <th className="py-3 pr-3 font-black">L/P</th>
                {gradeFormativeScoreFields.map((field) => <th key={field.key} className="py-3 pr-3 font-black">{field.label}</th>)}
                <th className="py-3 pr-3 font-black">Rata F</th>
                {gradeSummativeScoreFields.map((field) => <th key={field.key} className="py-3 pr-3 font-black">{field.label}</th>)}
                <th className="py-3 pr-3 font-black">Rata SLM</th>
                <th className="py-3 pr-3 font-black">SAS</th>
                <th className="py-3 pr-3 font-black">Nilai Akhir</th>
                <th className="py-3 pr-3 font-black">Ketercapaian</th>
                <th className="py-3 pr-3 font-black">Capaian Kompetensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E6F5]">
              {rows.map((row, index) => (
                <tr key={row.studentId}>
                  <td className="py-3 pr-3 align-top font-mono text-sm font-black text-[#64748B]">{index + 1}</td>
                  <td className="py-3 pr-3 align-top">
                    <input
                      value={row.nis || ''}
                      onChange={(event) => updateRow(row.studentId, { nis: event.target.value })}
                      placeholder="-"
                      className="w-28 rounded-xl border border-[#D9E6F5] bg-[#F8FBFF] px-3 py-2 text-sm font-black text-[#132437] outline-none focus:border-[#2F80D8] focus:bg-white"
                    />
                  </td>
                  <td className="py-3 pr-3 align-top">
                    <p className="min-w-[13rem] font-black text-[#132437]">{row.name}</p>
                    <p className="mt-0.5 text-xs font-semibold text-[#64748B]">{row.className}</p>
                  </td>
                  <td className="py-3 pr-3 align-top">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F8FBFF] font-black text-[#17446E] ring-1 ring-[#D9E6F5]">{row.gender || '-'}</span>
                  </td>
                  {gradeFormativeScoreFields.map((field) => (
                    <td key={field.key} className="py-3 pr-3 align-top">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.scores?.[field.key] ?? ''}
                        onChange={(event) => updateScore(row.studentId, field.key, event.target.value)}
                        className="w-16 rounded-xl border border-[#D9E6F5] bg-[#FFFDF4] px-2 py-2 text-center text-sm font-black text-[#132437] outline-none focus:border-[#2F80D8] focus:bg-white"
                      />
                    </td>
                  ))}
                  <td className="py-3 pr-3 align-top">
                    <span className="grid h-10 w-16 place-items-center rounded-xl bg-[#F8FBFF] font-mono font-black text-[#132437] ring-1 ring-[#D9E6F5]">{row.averageFormative || '-'}</span>
                  </td>
                  {gradeSummativeScoreFields.map((field) => (
                    <td key={field.key} className="py-3 pr-3 align-top">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.scores?.[field.key] ?? ''}
                        onChange={(event) => updateScore(row.studentId, field.key, event.target.value)}
                        className="w-16 rounded-xl border border-[#D9E6F5] bg-[#FFFDF4] px-2 py-2 text-center text-sm font-black text-[#132437] outline-none focus:border-[#2F80D8] focus:bg-white"
                      />
                    </td>
                  ))}
                  <td className="py-3 pr-3 align-top">
                    <span className="grid h-10 w-20 place-items-center rounded-xl bg-[#F8FBFF] font-mono font-black text-[#132437] ring-1 ring-[#D9E6F5]">{row.averageSummative || '-'}</span>
                  </td>
                  <td className="py-3 pr-3 align-top">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={row.scores?.sas ?? ''}
                      onChange={(event) => updateScore(row.studentId, 'sas', event.target.value)}
                      className="w-16 rounded-xl border border-[#D9E6F5] bg-[#FFFDF4] px-2 py-2 text-center text-sm font-black text-[#132437] outline-none focus:border-[#2F80D8] focus:bg-white"
                    />
                  </td>
                  <td className="py-3 pr-3 align-top">
                    <span className="font-mono text-xl font-black text-[#132437]">{row.finalScore || '-'}</span>
                  </td>
                  <td className="py-3 pr-3 align-top">
                    <StatusBadge tone={gradeStatusTone(row.finalScore)}>{row.status}</StatusBadge>
                  </td>
                  <td className="py-3 pr-3 align-top">
                    <textarea
                      value={row.competency || ''}
                      onChange={(event) => updateRow(row.studentId, { competency: event.target.value })}
                      rows={2}
                      className="w-96 rounded-xl border border-[#D9E6F5] bg-[#F8FBFF] px-3 py-2 text-sm font-semibold leading-6 text-[#132437] outline-none focus:border-[#2F80D8] focus:bg-white"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardPanel>
    </div>
  )
}

function GuruERapor({ user, notify, allRows = false, canEdit = true }) {
  const navigate = useNavigate()
  const rows = allRows ? getAllGradebookRows() : getGradebookRows(user)
  const [semester, setSemester] = useState('Genap')
  const [academicYear, setAcademicYear] = useState('2026/2027')
  const currentRows = rows.filter((row) => row.semester === semester && row.academicYear === academicYear)
  const roster = getReportStudentOptions(rows)
  const classOptions = Array.from(new Set([
    ...currentRows.map((row) => row.className),
    ...roster.map((student) => student.className),
  ].filter(Boolean)))
  const defaultClass = currentRows[0]?.className || classOptions[0] || 'Kelas umum'
  const [selectedClass, setSelectedClass] = useState(defaultClass)
  const currentRowsForClass = currentRows.filter((row) => row.className === selectedClass)
  const studentsForClass = roster.filter((student) => student.className === selectedClass)
  const defaultStudentId = currentRowsForClass[0]?.studentId || studentsForClass[0]?.id || roster[0]?.id || ''
  const [selectedStudentId, setSelectedStudentId] = useState(defaultStudentId)
  const selectedStudent = studentsForClass.find((student) => student.id === selectedStudentId)
    || roster.find((student) => student.id === selectedStudentId)
    || studentsForClass[0]
    || roster[0]
  const report = buildReportData({ rows, student: selectedStudent, semester, academicYear })
  const readiness = getReportReadiness(report)

  useEffect(() => {
    if (!classOptions.includes(selectedClass) && defaultClass) {
      setSelectedClass(defaultClass)
    }
  }, [classOptions, defaultClass, selectedClass])

  useEffect(() => {
    const nextStudents = roster.filter((student) => student.className === selectedClass)
    const preferredStudentId = currentRowsForClass[0]?.studentId || nextStudents[0]?.id || roster[0]?.id || ''
    if (!nextStudents.some((student) => student.id === selectedStudentId) && preferredStudentId) {
      setSelectedStudentId(preferredStudentId)
    }
  }, [currentRowsForClass, roster, selectedClass, selectedStudentId])

  function printReport() {
    if (!report.rows.length) {
      notify('Simpan daftar nilai terlebih dahulu sebelum mencetak rapor.')
      return
    }
    document.body.classList.add('is-printing-rapor')
    window.addEventListener('afterprint', () => {
      document.body.classList.remove('is-printing-rapor')
    }, { once: true })
    window.print()
    notify('Dialog cetak dibuka. Pilih Save as PDF untuk menyimpan e-rapor.')
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="E-Rapor"
        title="E-Rapor siswa."
        description="Ruang finalisasi rapor: validasi data, cek kelengkapan, preview dokumen, lalu cetak format A4 resmi."
        action={
          <div className="flex flex-wrap gap-2">
            {canEdit && <QuickActionButton icon={BarChart3} label="Edit nilai" onClick={() => navigate('/guru/daftar-nilai')} />}
            <QuickActionButton icon={Download} label="Cetak / PDF" onClick={printReport} />
          </div>
        }
      />

      <section className="rounded-2xl border border-[#D9E6F5] bg-white p-4 shadow-[0_10px_28px_rgba(15,36,55,0.045)] print:hidden">
        <div className="grid gap-3 md:grid-cols-4">
          <label className={materialLabelClass}>Kelas
            <select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)} className={materialInputClass}>
              {classOptions.map((className) => <option key={className} value={className}>{className}</option>)}
            </select>
          </label>
          <label className={materialLabelClass}>Siswa
            <select value={selectedStudentId} onChange={(event) => setSelectedStudentId(event.target.value)} className={materialInputClass}>
              {(studentsForClass.length ? studentsForClass : roster).map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
            </select>
          </label>
          <label className={materialLabelClass}>Semester
            <select value={semester} onChange={(event) => setSemester(event.target.value)} className={materialInputClass}>
              <option>Ganjil</option>
              <option>Genap</option>
            </select>
          </label>
          <label className={materialLabelClass}>Tahun ajaran
            <input value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} className={materialInputClass} />
          </label>
        </div>
      </section>

      {report.rows.length ? (
        <>
          <div className="grid gap-4 print:hidden xl:grid-cols-[1fr_0.82fr]">
            <DashboardPanel title="Finalisasi e-rapor" description="Checklist ini membantu guru memastikan rapor siap dicetak seperti dokumen resmi.">
              <div className="grid gap-4 lg:grid-cols-[14rem_1fr]">
                <div className="rounded-2xl bg-[#123B63] p-4 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-sky-100/75">Status dokumen</p>
                  <p className="mt-3 text-4xl font-black leading-none">{readiness.percent}%</p>
                  <p className="mt-2 text-sm font-bold text-sky-100">{readiness.status}</p>
                  <div className="mt-4 h-2 rounded-full bg-white/18">
                    <div className="h-2 rounded-full bg-[#8BD4FF]" style={{ width: `${readiness.percent}%` }} />
                  </div>
                  <p className="mt-3 text-xs font-semibold leading-5 text-sky-100/78">{readiness.completed} dari {readiness.total} komponen siap.</p>
                </div>

                <ReportValidationList items={readiness.items} />
              </div>
            </DashboardPanel>

            <DashboardPanel title="Format cetak" description="Dokumen cetak dipisahkan dari halaman web agar hasil PDF bersih.">
              <div className="space-y-3">
                <ReportMetaRow label="Nomor dokumen" value={report.documentNumber} />
                <ReportMetaRow label="Template" value="A4 portrait, margin 12 mm" />
                <ReportMetaRow label="Kurikulum" value={report.printProfile.subtitle} />
                <ReportMetaRow label="Jumlah mapel" value={`${report.rows.length} mata pelajaran`} />
                <ReportMetaRow label="Kehadiran" value={`${report.attendance.hadir || 0} hadir · ${report.attendance.alpa || 0} alpa`} />
              </div>
            </DashboardPanel>
          </div>

          <div className="grid gap-4 print:hidden md:grid-cols-3">
            <EReportFeatureCard icon={FileText} title="Dokumen formal" description="Header, identitas, nilai, deskripsi, kehadiran, catatan, keputusan, dan tanda tangan berada dalam satu template cetak." />
            <EReportFeatureCard icon={ClipboardCheck} title="Validasi sebelum cetak" description="Guru melihat data mana yang sudah lengkap dan mana yang masih perlu diperbaiki sebelum PDF dibuat." />
            <EReportFeatureCard icon={School} title="Siap dikembangkan" description="Struktur data sudah dipisah untuk integrasi Dapodik/e-Rapor resmi pada tahap berikutnya." />
          </div>

          <ReportCardView report={report} />
        </>
      ) : (
        <EmptyState title="E-Rapor belum siap" description="Simpan daftar nilai terlebih dahulu agar e-rapor siswa otomatis terbentuk." />
      )}
    </div>
  )
}

function ReportValidationList({ items = [] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-start gap-3 rounded-xl border border-[#D9E6F5] bg-[#F8FBFF] p-3">
          <span className={`mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-sm font-black ${
            item.done ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
          }`}>
            {item.done ? 'OK' : '!'}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-black text-[#132437]">{item.label}</span>
            <span className="mt-0.5 block text-xs font-semibold leading-5 text-[#64748B]">{item.detail}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

function ReportMetaRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-[#D9E6F5] bg-[#F8FBFF] px-3 py-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">{label}</p>
      <p className="max-w-[12rem] text-right text-sm font-black text-[#132437]">{value}</p>
    </div>
  )
}

function EReportFeatureCard({ icon: Icon, title, description }) {
  return (
    <section className="rounded-2xl border border-[#D9E6F5] bg-white p-4 shadow-[0_10px_28px_rgba(15,36,55,0.045)]">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF4FF] text-[#2F80D8] ring-1 ring-[#D9E6F5]">
        <Icon size={18} />
      </span>
      <h3 className="mt-3 text-sm font-black text-[#132437]">{title}</h3>
      <p className="mt-1 text-sm font-semibold leading-6 text-[#64748B]">{description}</p>
    </section>
  )
}

function ReportCardView({ report }) {
  const {
    student,
    groupedRows,
    summary,
    attendance,
    semester,
    semesterNumber,
    academicYear,
    waliNote,
    decision,
    school: reportSchool,
    printProfile,
    documentNumber,
    className,
    phase,
    level,
    graduateProfileRows,
    extracurricularRows,
    parentResponse,
    issuePlace,
    issueDate,
    homeroomName,
    principalName,
  } = report
  let subjectNumber = 0
  const identityRows = [
    ['Nama Peserta Didik', student?.name || '-'],
    ['NISN/NIS', student?.nis || '-'],
    ['Kelas', className || '-'],
    ['Fase', phase || '-'],
    ['Semester', `${semesterNumber} / ${semester}`],
    ['Tahun Ajaran', academicYear],
  ]
  const schoolRows = [
    ['Nama Sekolah', reportSchool.name],
    ['NPSN', reportSchool.npsn],
    ['Alamat', reportSchool.address],
    ['Kabupaten/Kota', reportSchool.district],
    ['Provinsi', reportSchool.province],
  ]

  return (
    <section id="report-print-area" data-print-area="rapor" className="e-rapor-document overflow-hidden rounded-2xl border border-[#D9E6F5] bg-white shadow-[0_10px_28px_rgba(15,36,55,0.045)] print:rounded-none print:border-0 print:shadow-none">
      <div className="bg-[#F8FBFF] px-5 py-5 print:bg-white print:px-0 print:py-0">
        <article className="rapor-page mx-auto max-w-[62rem] rounded-2xl border border-[#D9E6F5] bg-white p-6 text-[#132437] print:max-w-none print:rounded-none print:border-0 print:p-0">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[#2F80D8] print:hidden">Preview dokumen cetak</p>

          <header className="rapor-letterhead border-b-2 border-[#111827] pb-4">
            <div className="grid gap-4 sm:grid-cols-[5rem_1fr_5rem] sm:items-center">
              <div className="grid h-20 w-20 place-items-center rounded-xl bg-white ring-1 ring-[#D9E6F5] print:h-16 print:w-16 print:ring-0">
                <img src="/brand/islelearn-logo.png" alt="Logo IsleLearn" className="h-16 w-16 object-contain print:h-14 print:w-14" />
              </div>
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#34465D] print:text-black">{printProfile.ministry}</p>
                <p className="mt-1 text-[11px] font-bold uppercase leading-5 text-[#34465D] print:text-black">{printProfile.directorate}</p>
                <h2 className="mt-2 text-xl font-black uppercase leading-tight text-[#111827] print:text-[15pt]">{reportSchool.name}</h2>
                <p className="mt-1 text-xs font-semibold leading-5 text-[#34465D] print:text-black">{reportSchool.address} · {reportSchool.district} · {reportSchool.province}</p>
              </div>
              <div className="hidden sm:block" />
            </div>
          </header>

          <div className="mt-4 text-center">
            <p className="text-sm font-black uppercase tracking-[0.12em] text-[#111827]">{printProfile.title}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-[#34465D] print:text-black">{printProfile.subtitle}</p>
          </div>

          <div className="mt-4 grid gap-2 border-y border-[#111827] py-2 text-xs font-bold text-[#111827] sm:grid-cols-3">
            <p>No. Dokumen: <span className="font-black">{documentNumber}</span></p>
            <p className="sm:text-center">Semester: <span className="font-black">{semesterNumber}</span></p>
            <p className="sm:text-right">Tahun Ajaran: <span className="font-black">{academicYear}</span></p>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2 print:grid-cols-2">
            <ReportInfoTable title="Identitas Sekolah" rows={schoolRows} />
            <ReportInfoTable title="Identitas Peserta Didik" rows={identityRows} />
          </div>

          <ReportSection title="A. Nilai Akhir dan Capaian Kompetensi">
            <div className="overflow-x-auto">
              <table className="rapor-table w-full min-w-[48rem] border-collapse text-sm print:min-w-0">
                <thead>
                  <tr className="bg-[#EAF4FF] text-[#132437] print:bg-white">
                    <th className="w-12 border border-[#AFC9E8] px-3 py-2 text-center font-black">No</th>
                    <th className="border border-[#AFC9E8] px-3 py-2 text-left font-black">Mata Pelajaran</th>
                    <th className="w-24 border border-[#AFC9E8] px-3 py-2 text-center font-black">Nilai Akhir</th>
                    <th className="border border-[#AFC9E8] px-3 py-2 text-left font-black">Capaian Kompetensi</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedRows.map((group) => (
                    <Fragment key={group.label}>
                      <tr>
                        <td colSpan={4} className="border border-[#AFC9E8] bg-[#F8FBFF] px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#17446E] print:bg-white print:text-black">
                          {group.label}
                        </td>
                      </tr>
                      {group.rows.map((row) => {
                        subjectNumber += 1
                        return (
                          <tr key={`${row.studentId}-${row.subject}`}>
                            <td className="border border-[#AFC9E8] px-3 py-2 text-center font-semibold text-[#132437]">{subjectNumber}</td>
                            <td className="border border-[#AFC9E8] px-3 py-2 font-black text-[#132437]">{row.subject}</td>
                            <td className="border border-[#AFC9E8] px-3 py-2 text-center font-mono text-lg font-black text-[#132437]">{row.finalScore || '-'}</td>
                            <td className="border border-[#AFC9E8] px-3 py-2 text-sm font-semibold leading-6 text-[#34465D] print:text-black">
                              {row.competency}
                              <span className="mt-1 block text-xs font-black text-[#64748B] print:text-black">Ketercapaian: {row.status}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </ReportSection>

          <ReportSection title="B. Ekstrakurikuler">
            <table className="rapor-table w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#EAF4FF] print:bg-white">
                  <th className="w-12 border border-[#AFC9E8] px-3 py-2 text-center font-black">No</th>
                  <th className="border border-[#AFC9E8] px-3 py-2 text-left font-black">Kegiatan</th>
                  <th className="w-24 border border-[#AFC9E8] px-3 py-2 text-center font-black">Predikat</th>
                  <th className="border border-[#AFC9E8] px-3 py-2 text-left font-black">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {extracurricularRows.map((row, index) => (
                  <tr key={`${row.activity}-${index}`}>
                    <td className="border border-[#AFC9E8] px-3 py-2 text-center font-semibold">{index + 1}</td>
                    <td className="border border-[#AFC9E8] px-3 py-2 font-black text-[#132437]">{row.activity}</td>
                    <td className="border border-[#AFC9E8] px-3 py-2 text-center font-black text-[#132437]">{row.predicate}</td>
                    <td className="border border-[#AFC9E8] px-3 py-2 font-semibold leading-6 text-[#34465D] print:text-black">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ReportSection>

          <div className="grid gap-4 print:grid-cols-[1fr_18rem] xl:grid-cols-[1fr_20rem]">
            <ReportSection title="C. Profil Lulusan">
              <table className="rapor-table w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#EAF4FF] print:bg-white">
                    <th className="border border-[#AFC9E8] px-3 py-2 text-left font-black">Aspek</th>
                    <th className="border border-[#AFC9E8] px-3 py-2 text-left font-black">Dimensi</th>
                    <th className="border border-[#AFC9E8] px-3 py-2 text-left font-black">Deskripsi</th>
                  </tr>
                </thead>
                <tbody>
                  {graduateProfileRows.map((row) => (
                    <tr key={row.aspect}>
                      <td className="border border-[#AFC9E8] px-3 py-2 font-black text-[#132437]">{row.aspect}</td>
                      <td className="border border-[#AFC9E8] px-3 py-2 font-semibold leading-6 text-[#34465D] print:text-black">{row.dimension}</td>
                      <td className="border border-[#AFC9E8] px-3 py-2 font-semibold leading-6 text-[#34465D] print:text-black">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ReportSection>

            <ReportSection title="D. Ketidakhadiran">
              <table className="rapor-table w-full border-collapse text-sm">
                <tbody>
                  {[
                    ['Sakit', attendance.sakit],
                    ['Izin', attendance.izin],
                    ['Tanpa Keterangan', attendance.alpa],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td className="border border-[#AFC9E8] px-3 py-2 font-black text-[#132437]">{label}</td>
                      <td className="w-20 border border-[#AFC9E8] px-3 py-2 text-center font-mono text-lg font-black text-[#132437]">{value}</td>
                      <td className="w-14 border border-[#AFC9E8] px-3 py-2 text-center font-semibold text-[#64748B] print:text-black">hari</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ReportSection>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ReportSection title="E. Catatan Wali Kelas">
              <p className="min-h-24 rounded-xl border border-[#AFC9E8] bg-[#F8FBFF] p-3 text-sm font-semibold leading-7 text-[#34465D] print:rounded-none print:bg-white print:text-black">{waliNote}</p>
            </ReportSection>

            <ReportSection title="F. Tanggapan Orang Tua/Wali">
              <p className="min-h-24 rounded-xl border border-[#AFC9E8] bg-white p-3 text-sm font-semibold leading-7 text-[#34465D] print:rounded-none print:text-black">{parentResponse}</p>
            </ReportSection>
          </div>

          <ReportSection title="G. Keputusan">
            <table className="rapor-table w-full border-collapse text-sm">
              <tbody>
                <tr>
                  <td className="w-52 border border-[#AFC9E8] bg-[#F8FBFF] px-3 py-2 font-black text-[#132437] print:bg-white">Rata-rata Nilai Akhir</td>
                  <td className="border border-[#AFC9E8] px-3 py-2 font-mono text-lg font-black text-[#132437]">{summary.average || '-'}</td>
                </tr>
                <tr>
                  <td className="border border-[#AFC9E8] bg-[#F8FBFF] px-3 py-2 font-black text-[#132437] print:bg-white">Ketuntasan</td>
                  <td className="border border-[#AFC9E8] px-3 py-2 font-semibold text-[#34465D] print:text-black">{summary.tuntas} mata pelajaran tuntas, {summary.remedial} perlu bimbingan.</td>
                </tr>
                <tr>
                  <td className="border border-[#AFC9E8] bg-[#F8FBFF] px-3 py-2 font-black text-[#132437] print:bg-white">Keputusan</td>
                  <td className="border border-[#AFC9E8] px-3 py-2 font-black text-[#132437]">{decision}</td>
                </tr>
                <tr>
                  <td className="border border-[#AFC9E8] bg-[#F8FBFF] px-3 py-2 font-black text-[#132437] print:bg-white">Kelas/Fase</td>
                  <td className="border border-[#AFC9E8] px-3 py-2 font-semibold text-[#34465D] print:text-black">{className} · Fase {phase} · Tingkat {level}</td>
                </tr>
              </tbody>
            </table>
          </ReportSection>

          <div className="mt-8 grid gap-8 text-center text-sm font-semibold text-[#132437] sm:grid-cols-3">
            <SignatureBlock title="Orang Tua/Wali" name="................................" />
            <SignatureBlock title={`${issuePlace}, ${issueDate}\nWali Kelas`} name={homeroomName} />
            <SignatureBlock title="Kepala Sekolah" name={principalName} />
          </div>

          <p className="mt-6 text-center text-[11px] font-semibold leading-5 text-[#64748B] print:hidden">
            Preview modern dibuat oleh {printProfile.application}. Hasil cetak hanya memuat dokumen rapor.
          </p>
        </article>
      </div>
    </section>
  )
}

function ReportInfoTable({ title, rows }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#17446E] print:text-black">{title}</h3>
      <table className="rapor-table w-full border-collapse text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td className="w-40 border border-[#AFC9E8] bg-[#F8FBFF] px-3 py-2 font-black text-[#132437] print:bg-white">{label}</td>
              <td className="border border-[#AFC9E8] px-3 py-2 font-semibold text-[#34465D] print:text-black">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReportSection({ title, children }) {
  return (
    <section className="mt-5">
      <h3 className="mb-2 text-sm font-black uppercase tracking-[0.1em] text-[#132437]">{title}</h3>
      {children}
    </section>
  )
}

function SignatureBlock({ title, name }) {
  const titleLines = String(title).split('\n')
  return (
    <div className="min-h-36">
      {titleLines.map((line) => <p key={line}>{line}</p>)}
      <div className="h-20" />
      <p className="font-black underline decoration-[#132437]/45 underline-offset-4">{name}</p>
      <p>NIP. ................................</p>
    </div>
  )
}


function GuruKelas() {
  return <CardsPage eyebrow="Kelas" title="Kelas yang diajar" items={classes.map((c) => ({ title: c.name, meta: `${c.students} siswa · rata-rata ${c.average}`, value: `${c.progress}% progress`, status: `${Math.max(1, 6 - c.grade + 10)} remedial` }))} />
}

function teacherMaterialStorageKey(user, teacherSubject) {
  return `islelearn-teacher-materials-${user?.id || teacherSubject || 'demo'}`
}

function getSeededTeacherMaterials(teacherSubject) {
  const normalizedSubject = normalizeLookupText(teacherSubject)
  const scopedMaterials = normalizedSubject
    ? schoolMaterials.filter((item) => {
      const itemSubject = normalizeLookupText(item.subject)
      return itemSubject === normalizedSubject || itemSubject.includes(normalizedSubject) || normalizedSubject.includes(itemSubject)
    })
    : schoolMaterials

  return scopedMaterials.map((item) => ({
    ...item,
    progress: item.status === 'Publish' ? 35 : 0,
  }))
}

function getLocalTeacherMaterials(user, teacherSubject) {
  const key = teacherMaterialStorageKey(user, teacherSubject)
  const storedRows = safeReadLocalJson(key, null)

  if (Array.isArray(storedRows)) {
    return uniqueRowsById([
      ...storedRows.filter((row) => !isLegacyDemoRow(row)),
      ...getSeededTeacherMaterials(teacherSubject),
    ])
  }

  return getSeededTeacherMaterials(teacherSubject)
}

function setLocalTeacherMaterials(user, teacherSubject, rows) {
  safeWriteLocalJson(teacherMaterialStorageKey(user, teacherSubject), Array.isArray(rows) ? rows : [])
}

function materialSourceLabel(source) {
  if (source === 'supabase') return 'Tersimpan server'
  if (source === 'school-content') return 'Materi sekolah'
  return 'Tersimpan perangkat'
}

function GuruMateri({ user, notify, appContext }) {
  const hasTeacherSubject = Boolean(user?.subject?.trim())
  const teacherSubject = hasTeacherSubject ? user.subject.trim() : ''
  const pageTitle = hasTeacherSubject ? `Materi ${teacherSubject}` : 'Materi guru'
  const materialScope = hasTeacherSubject ? teacherSubject : 'semua mapel'
  const [rows, setRows] = useState([])
  const [lookups, setLookups] = useState({ subjects: [], classes: [] })
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const publishedCount = rows.filter((item) => item.status === 'Publish').length
  const draftCount = rows.filter((item) => item.status !== 'Publish').length
  const subjectFolders = getMaterialSubjectFolders(rows, lookups.subjects)
  const teacherSubjectKey = normalizeLookupText(teacherSubject)
  const teacherSubjectFolders = hasTeacherSubject
    ? subjectFolders.filter((folder) => folder.key === teacherSubjectKey)
    : subjectFolders.filter((folder) => folder.rows.length > 0)
  const visibleSubjectFolders = teacherSubjectFolders.length > 0
    ? teacherSubjectFolders
    : subjectFolders.filter((folder) => !hasTeacherSubject || folder.key === teacherSubjectKey)
  const filledFolderCount = visibleSubjectFolders.filter((folder) => folder.rows.length > 0).length
  const gradeSubfolderCount = visibleSubjectFolders.reduce((total, folder) => total + folder.gradeFolders.length, 0)
  const filledGradeSubfolderCount = visibleSubjectFolders.reduce((total, folder) => total + folder.gradeFolders.filter((gradeFolder) => gradeFolder.rows.length > 0).length, 0)
  const [activeSubjectKey, setActiveSubjectKey] = useState('')
  const visibleSubjectFolderKeys = visibleSubjectFolders.map((folder) => folder.key).join('|')
  const activeFolder = visibleSubjectFolders.find((folder) => folder.key === activeSubjectKey) || visibleSubjectFolders[0] || null
  const localMode = !appContext?.accessToken || !isUuid(user?.id)
  const sourceLabel = localMode ? 'Preview lokal' : 'Supabase'

  useEffect(() => {
    if (!visibleSubjectFolders.length) {
      if (activeSubjectKey) setActiveSubjectKey('')
      return
    }

    if (!activeSubjectKey || !visibleSubjectFolders.some((folder) => folder.key === activeSubjectKey)) {
      setActiveSubjectKey(visibleSubjectFolders[0].key)
    }
  }, [activeSubjectKey, visibleSubjectFolderKeys])

  useEffect(() => {
    let active = true

    async function loadTeacherMaterials() {
      if (!appContext?.accessToken || !isUuid(user?.id)) {
        setRows(getLocalTeacherMaterials(user, teacherSubject))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [materialRows, lookupRows] = await Promise.all([
          fetchMaterials({ accessToken: appContext.accessToken, teacherId: user.id }),
          fetchMaterialLookups({ accessToken: appContext.accessToken }),
        ])
        if (active) {
          setRows(materialRows)
          setLookups(lookupRows)
          setError('')
        }
      } catch (loadError) {
        if (active) {
          setRows(getLocalTeacherMaterials(user, teacherSubject))
          setError(loadError.message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadTeacherMaterials()
    return () => {
      active = false
    }
  }, [appContext?.accessToken, teacherSubject, user?.id])

  async function handleSave(material) {
    if (!appContext?.accessToken || !isUuid(user?.id)) {
      const now = Date.now()
      const localMaterial = {
        ...material,
        id: material.id || `local-material-${now}`,
        subject: material.subject || teacherSubject || 'Mapel belum dipilih',
        className: material.className || 'Semua kelas',
        teacher: user?.name,
        progress: material.status === 'Publish' ? 35 : 0,
      }

      setRows((current) => {
        const nextRows = material.id
          ? current.map((item) => item.id === material.id ? { ...item, ...localMaterial } : item)
          : [localMaterial, ...current]
        setLocalTeacherMaterials(user, teacherSubject, nextRows)
        return nextRows
      })

      setEditing(null)
      notify('Materi tersimpan lokal di perangkat.')
      return
    }

    try {
      const saved = await saveMaterial({ accessToken: appContext.accessToken, teacherId: user.id, material })
      setRows((current) => material.id ? current.map((item) => item.id === material.id ? saved : item) : [saved, ...current])
      setEditing(null)
      notify(material.id ? 'Materi berhasil diperbarui di Supabase.' : 'Materi berhasil ditambahkan ke Supabase.')
    } catch (saveError) {
      notify(`Gagal menyimpan materi: ${saveError.message}`)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    if (!appContext?.accessToken || !isUuid(user?.id) || deleting.source !== 'supabase') {
      setRows((current) => {
        const nextRows = current.filter((item) => item.id !== deleting.id)
        setLocalTeacherMaterials(user, teacherSubject, nextRows)
        return nextRows
      })
      setDeleting(null)
      notify('Materi lokal dihapus dan tersimpan di perangkat.')
      return
    }

    try {
      await removeMaterial({ accessToken: appContext.accessToken, id: deleting.id })
      setRows((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
      notify('Materi berhasil dihapus dari Supabase.')
    } catch (deleteError) {
      notify(`Gagal menghapus materi: ${deleteError.message}`)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Materi"
        title={pageTitle}
        description={`Tulis dan kelola bahan belajar siswa untuk ${materialScope}. Fokus pada bacaan, tautan, video, dan catatan ringkas yang mudah dibuka.`}
        action={<QuickActionButton icon={Plus} label={editing ? 'Editor terbuka' : 'Tulis materi'} disabled={Boolean(editing)} onClick={() => setEditing(emptyMaterial(lookups, teacherSubject, highSchoolGradeFolders[0].name))} />}
      />

      <section className="mb-4 flex flex-col gap-3 rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/80 px-4 py-3 shadow-[0_12px_36px_rgba(15,31,42,0.055)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs font-black text-[#13232d]">
          <span className="inline-flex items-center gap-1.5 rounded-[0.75rem] bg-[#E0F2FE] px-3 py-1.5 text-[#0284c7] ring-1 ring-[#0284c7]/10">
            <BookOpen size={14} /> {rows.length} materi
          </span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{subjectFolders.length} folder mapel</span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{filledGradeSubfolderCount}/{gradeSubfolderCount} subfolder kelas terisi</span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{filledFolderCount} folder terisi</span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{publishedCount} publish</span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{draftCount} draft</span>
        </div>
        <p className="text-xs font-bold text-slate-500">
          Sumber data: <span className="text-[#0284c7]">{sourceLabel}</span>
        </p>
      </section>

      {error && <div className="mb-4 rounded-[1rem] bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data materi: {error}. Data lokal mapel guru ditampilkan.</div>}
      
      {editing && <MaterialForm material={editing} lookups={lookups} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label="Memuat materi guru dari Supabase..." /> : (
        visibleSubjectFolders.length > 0 ? (
          <section className="grid gap-3 xl:grid-cols-[18rem_1fr]">
            <aside className="rounded-[1.05rem] border border-[#0B3A5B]/10 bg-white/88 p-2 shadow-[0_12px_34px_rgba(15,31,42,0.055)]">
              <div className="px-2 pb-2 pt-1">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0284c7]">Daftar mapel</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Pilih mapel, lalu kelola chapter per kelas.</p>
              </div>
              <div className="grid gap-1">
                {visibleSubjectFolders.map((folder) => {
                  const selectedFolder = activeFolder?.key === folder.key
                  const gradeSummary = folder.gradeFolders
                    .filter((gradeFolder) => gradeFolder.rows.length > 0)
                    .map((gradeFolder) => `${gradeFolder.name.replace('Kelas ', '')}: ${gradeFolder.rows.length}`)
                    .join(' · ')

                  return (
                    <button
                      key={folder.key}
                      onClick={() => setActiveSubjectKey(folder.key)}
                      className={`group flex min-h-[4.25rem] items-center justify-between gap-3 rounded-[0.9rem] px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284c7] ${selectedFolder ? 'bg-[#0B3A5B] text-white shadow-[0_10px_22px_rgba(15,31,42,0.13)]' : 'bg-transparent text-[#13232d] hover:bg-[#E0F2FE]'}`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black">{folder.name}</span>
                        <span className={`mt-0.5 block truncate text-xs font-semibold ${selectedFolder ? 'text-white/68' : 'text-slate-500'}`}>{gradeSummary || 'Belum ada kelas terisi'}</span>
                      </span>
                      <span className={`flex-shrink-0 rounded-[0.7rem] px-2.5 py-1 text-xs font-black ring-1 ${selectedFolder ? 'bg-white/12 text-white ring-white/18' : 'bg-white text-[#0284c7] ring-[#0284c7]/10'}`}>
                        {folder.rows.length}
                      </span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <section className="overflow-hidden rounded-[1.05rem] border border-[#0B3A5B]/10 bg-white/88 shadow-[0_12px_34px_rgba(15,31,42,0.055)]">
              <header className="flex flex-col gap-2 border-b border-[#0B3A5B]/8 bg-[#F8FAFC]/82 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0284c7]">Folder mapel</p>
                  <h2 className="text-xl font-black text-[#13232d]">{activeFolder?.name || 'Materi'}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone={activeFolder?.rows.length ? 'green' : 'gray'}>{activeFolder?.rows.length || 0} materi</StatusBadge>
                  <StatusBadge tone="teal">{activeFolder?.publishedCount || 0} publish</StatusBadge>
                  {(activeFolder?.draftCount || 0) > 0 && <StatusBadge tone="amber">{activeFolder.draftCount} draft</StatusBadge>}
                </div>
              </header>

              <div className="divide-y divide-[#0B3A5B]/8">
                {activeFolder?.gradeFolders.map((gradeFolder, index) => {
                  const firstFilledIndex = activeFolder.gradeFolders.findIndex((folder) => folder.rows.length > 0)
                  const defaultOpen = index === (firstFilledIndex >= 0 ? firstFilledIndex : 0)

                  return (
                    <TeacherMaterialGradeFolder
                      key={gradeFolder.key}
                      subjectName={activeFolder.name}
                      gradeFolder={gradeFolder}
                      defaultOpen={defaultOpen}
                      onAdd={() => setEditing(emptyMaterial(lookups, activeFolder.name, gradeFolder.name))}
                      onEdit={setEditing}
                      onToggleStatus={(row) => handleSave({ ...row, status: row.status === 'Publish' ? 'Draft' : 'Publish' })}
                      onDelete={setDeleting}
                    />
                  )
                })}
              </div>
            </section>
          </section>
        ) : (
          <EmptyState
            title="Belum ada materi guru."
            description="Tulis materi pertama agar folder mapel dan kelas mulai terisi."
            action={<QuickActionButton icon={Plus} label="Tulis materi pertama" onClick={() => setEditing(emptyMaterial(lookups, teacherSubject, highSchoolGradeFolders[0].name))} />}
          />
        )
      )}
      <ConfirmDialog open={Boolean(deleting)} title="Hapus materi?" description={`Materi "${deleting?.title || ''}" akan dihapus. Aksi ini membutuhkan konfirmasi.`} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  )
}

function TeacherMaterialGradeFolder({ subjectName, gradeFolder, onAdd, onEdit, onToggleStatus, onDelete }) {
  const hasRows = gradeFolder.rows.length > 0

  return (
    <details open={hasRows} className="overflow-hidden rounded-[0.95rem] border border-[#0B3A5B]/10 bg-[#F8FAFC]/72">
      <summary className="flex cursor-pointer list-none flex-col gap-2 px-3 py-2.5 transition hover:bg-[#F1F7FF] sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Subfolder kelas</p>
          <h3 className="truncate text-base font-black text-[#13232d]">{gradeFolder.name}</h3>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <StatusBadge tone={hasRows ? 'green' : 'gray'}>{gradeFolder.rows.length} materi</StatusBadge>
          <StatusBadge tone="teal">{gradeFolder.publishedCount} publish</StatusBadge>
          {gradeFolder.draftCount > 0 && <StatusBadge tone="amber">{gradeFolder.draftCount} draft</StatusBadge>}
        </div>
      </summary>

      <div className="border-t border-[#0B3A5B]/8">
        {hasRows ? (
          gradeFolder.rows.map((row) => (
            <MaterialFolderRow
              key={row.id}
              row={row}
              onEdit={() => onEdit(row)}
              onToggleStatus={() => onToggleStatus(row)}
              onDelete={() => onDelete(row)}
            />
          ))
        ) : (
          <div className="flex flex-col gap-3 bg-white/48 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-[#13232d]">Subfolder ini masih kosong.</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">Belum ada bahan belajar nyata untuk {subjectName} {gradeFolder.name}. Tambahkan hanya saat materinya siap.</p>
            </div>
            <button onClick={onAdd} className="inline-flex items-center justify-center gap-1.5 rounded-[0.85rem] bg-[#E0F2FE] px-3 py-2 text-xs font-black text-[#0284c7] ring-1 ring-[#0284c7]/10 transition hover:bg-[#BAE6FD]">
              <Plus size={14} /> Tambah materi
            </button>
          </div>
        )}
      </div>
    </details>
  )
}

function MaterialFolderRow({ row, onEdit, onToggleStatus, onDelete }) {
  return (
    <article className="grid gap-3 border-b border-[#0B3A5B]/8 p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <StatusBadge tone={statusTone(row.status)}>{row.status}</StatusBadge>
          <StatusBadge tone="teal">{row.type || 'Teks'}</StatusBadge>
          <span className="text-xs font-bold text-slate-400">{materialSourceLabel(row.source)}</span>
        </div>
        <h2 className="truncate text-lg font-black text-[#13232d]">{row.title || 'Tanpa judul'}</h2>
        <p className="mt-1 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">{row.description || 'Belum ada deskripsi.'}</p>
        <p className="mt-2 text-xs font-bold text-slate-500">
          {(row.className || 'Semua kelas')} · {(row.topic || 'Tanpa topik')}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 lg:justify-end">
        <button onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-[#F1F7FF] px-3 py-2 text-xs font-black text-[#0284c7] ring-1 ring-[#0B3A5B]/8 transition hover:bg-[#E0F2FE]">
          <PencilLine size={14} /> Edit
        </button>
        <button onClick={onToggleStatus} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-800 ring-1 ring-cyan-100 transition hover:bg-cyan-100">
          <Send size={14} /> {row.status === 'Publish' ? 'Jadikan draft' : 'Publish'}
        </button>
        {row.source !== 'school-content' && (
          <button onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100">
            <Trash2 size={14} /> Hapus
          </button>
        )}
      </div>
    </article>
  )
}

const materialInputClass = 'w-full rounded-[0.9rem] border border-[#0B3A5B]/10 bg-white/86 px-3 py-2.5 text-sm font-semibold text-[#13232d] outline-none transition placeholder:text-slate-400 focus:border-[#0284c7] focus:bg-white focus:ring-4 focus:ring-[#0284c7]/10'
const materialLabelClass = 'grid gap-1.5 text-sm font-black text-[#13232d]'
const materialTypeOptions = ['Teks', 'HTML', 'PDF', 'Video', 'Link']

function getMaterialTypeIcon(type) {
  if (type === 'HTML') return FileText
  if (type === 'PDF') return Download
  if (type === 'Video') return PlayCircle
  if (type === 'Link') return Link2
  return FileText
}

function MaterialForm({ material, lookups, onCancel, onSave }) {
  const [form, setForm] = useState(material)
  const subjectsList = getMaterialSubjectOptions(lookups.subjects, [material])
  const classesList = getMaterialClassOptions(lookups.classes, material.className)
  const linkedMaterial = isLinkedMaterialType(form.type)
  const content = form.content || ''
  const hasContent = content.trim().length > 0
  const hasTitle = (form.title || '').trim().length > 0
  const invalidLinkedMaterial = linkedMaterial && hasContent && !isValidLinkedMaterial(content, form.type)
  const publishNeedsContent = form.status === 'Publish' && !hasContent
  const publishNeedsLinkedMaterial = form.status === 'Publish' && linkedMaterial && !isValidLinkedMaterial(content, form.type)
  const validMaterial = hasTitle && !invalidLinkedMaterial && !publishNeedsContent && !publishNeedsLinkedMaterial

  useEffect(() => {
    setForm(material)
  }, [material])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateSubject(value) {
    const selected = subjectsList.find((subject) => subjectOptionValue(subject) === value)
    setForm((current) => ({
      ...current,
      subjectId: selected?.synthetic ? '' : selected?.id || '',
      subject: selected?.name || current.subject || 'Mapel belum dipilih',
    }))
  }

  function updateClass(value) {
    const selected = classesList.find((classItem) => classOptionValue(classItem) === value)
    setForm((current) => ({
      ...current,
      classId: selected?.synthetic ? '' : selected?.id || '',
      className: selected?.name || current.className || 'Semua kelas',
    }))
  }

  return (
    <section className="mb-5 overflow-hidden rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/88 shadow-[0_16px_48px_rgba(15,31,42,0.07)] backdrop-blur-xl">
      <header className="flex flex-col gap-3 border-b border-[#0B3A5B]/8 bg-[#F8FAFC]/78 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-[0.9rem] bg-[#E0F2FE] text-[#0284c7] ring-1 ring-[#0284c7]/10">
            <BookOpen size={20} />
          </span>
          <div>
            <h2 className="text-xl font-black leading-tight text-[#13232d]">{form.id ? 'Edit bahan belajar' : 'Tulis bahan belajar'}</h2>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              Materi adalah bacaan, tautan, video, atau PDF untuk siswa. Gunakan bagian ini untuk penjelasan, contoh, dan arahan belajar yang ringan dibuka.
            </p>
          </div>
        </div>
        <StatusBadge tone={form.status === 'Publish' ? 'green' : 'amber'}>{form.status}</StatusBadge>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="space-y-3 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className={materialLabelClass}>Judul
              <input value={form.title || ''} onChange={(event) => updateField('title', event.target.value)} placeholder="Judul materi" className={materialInputClass} />
            </label>
            <label className={materialLabelClass}>Topik
              <input value={form.topic || ''} onChange={(event) => updateField('topic', event.target.value)} placeholder="Topik singkat" className={materialInputClass} />
            </label>
          </div>

          <label className={materialLabelClass}>Deskripsi
            <textarea value={form.description || ''} onChange={(event) => updateField('description', event.target.value)} rows={2} placeholder="Ringkasan singkat untuk membantu siswa memilih materi." className={`${materialInputClass} resize-y leading-6`} />
          </label>

          <label className={materialLabelClass}>{linkedMaterial ? (form.type === 'HTML' ? 'Path/URL HTML' : `URL ${form.type}`) : 'Isi materi'}
            <textarea
              value={content}
              onChange={(event) => updateField('content', event.target.value)}
              rows={linkedMaterial ? 3 : 7}
              placeholder={linkedMaterial ? (form.type === 'HTML' ? '/materials/english-x/nama-file.html' : 'https://...') : 'Tulis isi materi, instruksi baca, atau catatan ringkas untuk siswa.'}
              className={`${materialInputClass} resize-y leading-7`}
            />
          </label>

          {invalidLinkedMaterial && (
            <div className="rounded-[0.9rem] bg-amber-50 px-3 py-2.5 text-sm font-bold leading-6 text-amber-800 ring-1 ring-amber-100">
              Untuk HTML, gunakan path internal /materials/...html. Untuk PDF, Video, dan Link, gunakan URL lengkap yang diawali http atau https.
            </div>
          )}
          {publishNeedsContent && (
            <div className="rounded-[0.9rem] bg-amber-50 px-3 py-2.5 text-sm font-bold leading-6 text-amber-800 ring-1 ring-amber-100">
              Publish membutuhkan isi materi atau URL agar siswa tidak melihat halaman kosong.
            </div>
          )}
        </div>

        <aside className="space-y-4 border-t border-[#0B3A5B]/8 bg-[#F1F7FF]/58 p-4 lg:border-l lg:border-t-0">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0284c7]">Jenis materi</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {materialTypeOptions.map((type) => {
                const TypeIcon = getMaterialTypeIcon(type)
                const active = form.type === type
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={active}
                    onClick={() => updateField('type', type)}
                    className={`inline-flex items-center justify-center gap-2 rounded-[0.85rem] px-3 py-2.5 text-xs font-black ring-1 transition ${
                      active
                        ? 'bg-[#0B3A5B] text-white ring-[#0B3A5B]'
                        : 'bg-white text-slate-600 ring-[#0B3A5B]/10 hover:bg-[#E0F2FE] hover:text-[#0284c7]'
                    }`}
                  >
                    <TypeIcon size={14} /> {type}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0284c7]">Status</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {['Draft', 'Publish'].map((status) => {
                const active = form.status === status
                return (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={active}
                    onClick={() => updateField('status', status)}
                    className={`rounded-[0.85rem] px-3 py-2.5 text-xs font-black ring-1 transition ${
                      active
                        ? 'bg-[#0B3A5B] text-white ring-[#0B3A5B]'
                        : 'bg-white text-slate-600 ring-[#0B3A5B]/10 hover:bg-[#E0F2FE] hover:text-[#0284c7]'
                    }`}
                  >
                    {status}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
              Draft tetap tersimpan untuk guru. Publish membuat materi muncul di halaman siswa.
            </p>
          </div>

          <label className={materialLabelClass}>Mata pelajaran
            <select value={form.subjectId || `subject:${form.subject || subjectsList[0]?.name || ''}`} onChange={(event) => updateSubject(event.target.value)} className={materialInputClass}>
              {subjectsList.map((subject) => <option key={subjectOptionValue(subject)} value={subjectOptionValue(subject)}>{subject.name}</option>)}
            </select>
          </label>

          <label className={materialLabelClass}>Kelas
            <select value={form.classId || `class:${form.className || classesList[0]?.name || ''}`} onChange={(event) => updateClass(event.target.value)} className={materialInputClass}>
              {classesList.map((classItem) => <option key={classOptionValue(classItem)} value={classOptionValue(classItem)}>{classItem.name}</option>)}
            </select>
          </label>
        </aside>
      </div>

      <footer className="flex flex-col-reverse gap-2 border-t border-[#0B3A5B]/8 bg-white/72 px-4 py-3 sm:flex-row sm:justify-end">
        <button onClick={onCancel} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-100">
          <X size={16} /> Batal
        </button>
        <button onClick={() => onSave(form)} disabled={!validMaterial} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] bg-[#0B3A5B] px-4 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(15,31,42,0.14)] transition hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-45">
          <Save size={16} /> Simpan materi
        </button>
      </footer>
    </section>
  )
}

function emptyMaterial(lookups, teacherSubject, className = highSchoolGradeFolders[0].name) {
  const subject = lookups.subjects.find((item) => normalizeLookupText(item.name) === normalizeLookupText(teacherSubject))
  const classOptions = getMaterialClassOptions(lookups.classes, className)
  const classItem = classOptions.find((item) => normalizeLookupText(item.name) === normalizeLookupText(className)) || classOptions[0]
  const subjectName = subject?.name || teacherSubject || highSchoolSubjectFolders[0]
  return {
    title: '',
    description: '',
    content: '',
    subjectId: subject?.id || '',
    classId: classItem?.synthetic ? '' : classItem?.id || '',
    subject: subjectName,
    className: classItem?.name || className || highSchoolGradeFolders[0].name,
    topic: '',
    type: 'Teks',
    status: 'Draft',
  }
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '')
}

function BankSoal({ user, notify, appContext }) {
  const hasTeacherSubject = Boolean(user?.subject?.trim())
  const teacherSubject = hasTeacherSubject ? user.subject.trim() : ''
  const pageTitle = hasTeacherSubject ? `Bank soal ${teacherSubject}` : 'Bank soal'
  const assessmentScope = hasTeacherSubject ? teacherSubject : 'semua mapel'
  const [rows, setRows] = useState([])
  const [lookups, setLookups] = useState({ subjects: [], classes: [] })
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const localMode = !appContext?.accessToken || !isUuid(user?.id)
  const sourceLabel = localMode ? 'Preview lokal' : 'Supabase'
  const multipleChoiceCount = rows.filter((item) => item.type === 'Pilihan ganda').length
  const essayCount = rows.filter((item) => ['Essay', 'Isian'].includes(item.type)).length

  useEffect(() => {
    let active = true

    async function loadQuestions() {
      if (!appContext?.accessToken || !isUuid(user?.id)) {
        setRows(getLocalTeacherQuestions(user, teacherSubject))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [questionRows, lookupRows] = await Promise.all([
          fetchQuestions({ accessToken: appContext.accessToken, teacherId: user.id }),
          fetchMaterialLookups({ accessToken: appContext.accessToken }),
        ])
        if (active) {
          setRows(questionRows)
          setLookups(lookupRows)
          setError('')
        }
      } catch (loadError) {
        if (active) {
          setRows(getLocalTeacherQuestions(user, teacherSubject))
          setError(loadError.message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadQuestions()
    return () => {
      active = false
    }
  }, [appContext?.accessToken, teacherSubject, user?.id])

  async function handleSave(question) {
    if (!appContext?.accessToken || !isUuid(user?.id)) {
      const localQuestion = {
        ...question,
        id: question.id || `local-question-${Date.now()}`,
        subject: question.subject || teacherSubject || 'Mapel belum dipilih',
        className: question.className || 'Semua kelas',
        source: 'local',
      }

      setRows((current) => {
        const nextRows = question.id
          ? current.map((item) => item.id === question.id ? { ...item, ...localQuestion } : item)
          : [localQuestion, ...current]
        setLocalTeacherQuestions(user, teacherSubject, nextRows)
        return nextRows
      })

      setEditing(null)
      notify('Soal tersimpan lokal di perangkat.')
      return
    }

    try {
      const saved = await saveQuestion({ accessToken: appContext.accessToken, teacherId: user.id, question })
      setRows((current) => question.id ? current.map((item) => item.id === question.id ? saved : item) : [saved, ...current])
      setEditing(null)
      notify(question.id ? 'Soal berhasil diperbarui di Supabase.' : 'Soal berhasil ditambahkan ke Supabase.')
    } catch (saveError) {
      notify(`Gagal menyimpan soal: ${saveError.message}`)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    if (!appContext?.accessToken || !isUuid(user?.id) || deleting.source !== 'supabase') {
      setRows((current) => {
        const nextRows = current.filter((item) => item.id !== deleting.id)
        setLocalTeacherQuestions(user, teacherSubject, nextRows)
        return nextRows
      })
      setDeleting(null)
      notify('Soal lokal dihapus dan tersimpan di perangkat.')
      return
    }

    try {
      await removeQuestion({ accessToken: appContext.accessToken, id: deleting.id })
      setRows((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
      notify('Soal berhasil dihapus dari Supabase.')
    } catch (deleteError) {
      notify(`Gagal menghapus soal: ${deleteError.message}`)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Bank Soal"
        title={pageTitle}
        description={`Kelola butir soal, kunci, pilihan jawaban, dan pembahasan untuk asesmen ${assessmentScope}.`}
        action={<QuickActionButton icon={Plus} label={editing ? 'Editor terbuka' : 'Tulis soal'} disabled={Boolean(editing)} onClick={() => setEditing(emptyQuestion(lookups, teacherSubject))} />}
      />

      <section className="mb-4 flex flex-col gap-3 rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/80 px-4 py-3 shadow-[0_12px_36px_rgba(15,31,42,0.055)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs font-black text-[#13232d]">
          <span className="inline-flex items-center gap-1.5 rounded-[0.75rem] bg-[#E0F2FE] px-3 py-1.5 text-[#0284c7] ring-1 ring-[#0284c7]/10">
            <FileQuestion size={14} /> {rows.length} soal
          </span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{multipleChoiceCount} pilihan ganda</span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{essayCount} uraian/isian</span>
        </div>
        <p className="text-xs font-bold text-slate-500">
          Sumber data: <span className="text-[#0284c7]">{sourceLabel}</span>
        </p>
      </section>

      {error && <div className="mb-4 rounded-[1rem] bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data soal: {error}. Data lokal mapel guru ditampilkan.</div>}
      {editing && <QuestionForm question={editing} lookups={lookups} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label="Memuat bank soal dari Supabase..." /> : rows.length > 0 ? (
        <section className="overflow-hidden rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/86 shadow-[0_14px_44px_rgba(15,31,42,0.06)]">
          {rows.map((row) => (
            <article key={row.id} className="grid gap-3 border-b border-[#0B3A5B]/8 p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge tone={row.difficulty === 'Sulit' ? 'red' : row.difficulty === 'Sedang' ? 'amber' : 'green'}>{row.difficulty || 'Level belum diisi'}</StatusBadge>
                  <StatusBadge tone="teal">{row.type || 'Jenis belum diisi'}</StatusBadge>
                  <span className="text-xs font-bold text-slate-400">{row.source === 'supabase' ? 'Tersimpan server' : 'Tersimpan perangkat'}</span>
                </div>
                <h2 className="line-clamp-2 text-base font-black leading-6 text-[#13232d]">{row.questionText || 'Pertanyaan belum diisi'}</h2>
                <p className="mt-2 text-xs font-bold text-slate-500">
                  {(row.subject || 'Mapel belum dipilih')} · {(row.className || 'Semua kelas')} · {(row.topic || 'Tanpa topik')}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button onClick={() => setEditing(row)} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-[#F1F7FF] px-3 py-2 text-xs font-black text-[#0284c7] ring-1 ring-[#0B3A5B]/8 transition hover:bg-[#E0F2FE]">
                  <PencilLine size={14} /> Edit
                </button>
                <button onClick={() => setDeleting(row)} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100">
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        !editing && (
          <EmptyState
            title={hasTeacherSubject ? `Belum ada soal ${teacherSubject}.` : 'Belum ada soal.'}
            description="Tulis soal pertama saat siap. Halaman ini tidak menampilkan contoh palsu."
            action={<QuickActionButton icon={Plus} label="Tulis soal pertama" onClick={() => setEditing(emptyQuestion(lookups, teacherSubject))} />}
          />
        )
      )}
      <ConfirmDialog open={Boolean(deleting)} title="Hapus soal?" description="Soal akan dihapus dari bank soal setelah konfirmasi." onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  )
}

const questionTypes = [
  { value: 'Pilihan ganda', label: 'Pilihan ganda', description: 'Opsi A-E dengan satu kunci.' },
  { value: 'Benar/salah', label: 'Benar/salah', description: 'Pernyataan dengan kunci Benar atau Salah.' },
  { value: 'Isian', label: 'Isian singkat', description: 'Jawaban pendek atau beberapa variasi jawaban.' },
  { value: 'Essay', label: 'Uraian/essay', description: 'Jawaban terbuka dengan rubrik ringkas.' },
]

const optionLetters = ['A', 'B', 'C', 'D', 'E']

function normalizeQuestionForm(question) {
  const type = question.type || 'Pilihan ganda'
  const rawOptions = Array.isArray(question.options) ? question.options.map((item) => String(item || '')) : []
  let options = rawOptions.filter(Boolean)

  if (type === 'Pilihan ganda') {
    options = optionLetters.map((_, index) => rawOptions[index] || '')
  }

  if (type === 'Benar/salah') {
    options = ['Benar', 'Salah']
  }

  return {
    ...question,
    type,
    options,
    correctAnswer: question.correctAnswer || (type === 'Benar/salah' ? 'Benar' : ''),
  }
}

function getQuestionSubmitOptions(form) {
  const answer = String(form.correctAnswer || '').trim()

  if (form.type === 'Pilihan ganda') {
    return optionLetters.map((_, index) => String(form.options?.[index] || '').trim())
  }

  const options = Array.isArray(form.options) ? form.options.map((item) => String(item || '').trim()).filter(Boolean) : []

  if (form.type === 'Benar/salah') return ['Benar', 'Salah']
  if (form.type === 'Isian') return Array.from(new Set([answer, ...options].filter(Boolean)))
  return []
}

function QuestionForm({ question, lookups, onCancel, onSave }) {
  const [form, setForm] = useState(() => normalizeQuestionForm(question))
  const subjectsList = getMaterialSubjectOptions(lookups.subjects, [question])
  const classesList = getMaterialClassOptions(lookups.classes, question.className)
  const answer = String(form.correctAnswer || '').trim()
  const isMultipleChoice = form.type === 'Pilihan ganda'
  const isTrueFalse = form.type === 'Benar/salah'
  const isShortAnswer = form.type === 'Isian'
  const isEssay = form.type === 'Essay'
  const multipleChoiceOptions = optionLetters.map((_, index) => String(form.options?.[index] || '').trim())
  const multipleChoiceReady = multipleChoiceOptions.every(Boolean) && multipleChoiceOptions.includes(answer)
  const validQuestion = Boolean(
    String(form.questionText || '').trim()
      && answer
      && (!isMultipleChoice || multipleChoiceReady)
      && (!isTrueFalse || ['Benar', 'Salah'].includes(answer)),
  )
  const activeType = questionTypes.find((item) => item.value === form.type) || questionTypes[0]

  useEffect(() => {
    setForm(normalizeQuestionForm(question))
  }, [question])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function changeType(type) {
    setForm((current) => {
      if (type === 'Pilihan ganda') {
        const currentOptions = current.type === 'Pilihan ganda' && current.options?.length ? current.options : []
        const options = optionLetters.map((_, index) => currentOptions[index] || '')
        const correctAnswer = options.includes(current.correctAnswer) ? current.correctAnswer : ''
        return { ...current, type, options, correctAnswer }
      }

      if (type === 'Benar/salah') {
        return { ...current, type, options: ['Benar', 'Salah'], correctAnswer: ['Benar', 'Salah'].includes(current.correctAnswer) ? current.correctAnswer : 'Benar' }
      }

      if (type === 'Isian') {
        return { ...current, type, options: current.type === 'Isian' ? current.options || [] : [], correctAnswer: current.correctAnswer || '' }
      }

      return { ...current, type, options: [], correctAnswer: current.correctAnswer || '' }
    })
  }

  function updateSubject(value) {
    const selected = subjectsList.find((subject) => subjectOptionValue(subject) === value)
    setForm((current) => ({
      ...current,
      subjectId: selected?.synthetic ? '' : selected?.id || '',
      subject: selected?.name || current.subject || 'Mapel belum dipilih',
    }))
  }

  function updateClass(value) {
    const selected = classesList.find((classItem) => classOptionValue(classItem) === value)
    setForm((current) => ({
      ...current,
      classId: selected?.synthetic ? '' : selected?.id || '',
      className: selected?.name || current.className || 'Semua kelas',
    }))
  }

  function updateOption(index, value) {
    setForm((current) => {
      const options = [...(current.options || [])]
      const previous = options[index]
      options[index] = value
      return {
        ...current,
        options,
        correctAnswer: previous && current.correctAnswer === previous ? value : current.correctAnswer,
      }
    })
  }

  function submit() {
    if (!validQuestion) return
    onSave({
      ...form,
      questionText: String(form.questionText || '').trim(),
      correctAnswer: answer,
      explanation: String(form.explanation || '').trim(),
      topic: String(form.topic || '').trim(),
      options: getQuestionSubmitOptions(form),
    })
  }

  return (
    <section className="mb-5 overflow-hidden rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/88 shadow-[0_16px_48px_rgba(15,31,42,0.07)] backdrop-blur-xl">
      <header className="flex flex-col gap-3 border-b border-[#0B3A5B]/8 bg-[#F8FAFC]/78 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-[0.9rem] bg-[#E0F2FE] text-[#0284c7] ring-1 ring-[#0284c7]/10">
            <FileQuestion size={20} />
          </span>
          <div>
            <h2 className="text-xl font-black leading-tight text-[#13232d]">{form.id ? 'Edit butir soal' : 'Tulis butir soal'}</h2>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              Pilih model soal dulu. Field kunci dan pilihan jawaban akan menyesuaikan supaya guru tidak perlu menebak format input.
            </p>
          </div>
        </div>
        <StatusBadge tone={validQuestion ? 'green' : 'amber'}>{validQuestion ? 'Siap disimpan' : 'Lengkapi soal'}</StatusBadge>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4 p-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0284c7]">Model soal</p>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {questionTypes.map((type) => {
                const active = form.type === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => changeType(type.value)}
                    className={`min-h-[4.25rem] rounded-[0.95rem] px-3 py-2 text-left ring-1 transition ${
                      active
                        ? 'bg-[#0B3A5B] text-white ring-[#0B3A5B]'
                        : 'bg-[#F8FAFC] text-[#13232d] ring-[#0B3A5B]/10 hover:bg-[#E0F2FE]'
                    }`}
                  >
                    <span className="block text-sm font-black">{type.label}</span>
                    <span className={`mt-1 block text-xs font-semibold leading-5 ${active ? 'text-white/70' : 'text-slate-500'}`}>{type.description}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <label className={materialLabelClass}>Pertanyaan atau stimulus
            <textarea value={form.questionText || ''} onChange={(event) => updateField('questionText', event.target.value)} rows={5} placeholder={isTrueFalse ? 'Tulis pernyataan yang akan dinilai benar atau salah.' : 'Tulis pertanyaan, instruksi, atau stimulus singkat di sini.'} className={`${materialInputClass} resize-y leading-7`} />
          </label>

          {isMultipleChoice && (
            <div>
              <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-black text-[#13232d]">Pilihan jawaban</p>
                  <p className="text-xs font-semibold leading-5 text-slate-500">Isi opsi A-E, lalu pilih huruf opsi sebagai kunci. Tidak perlu mengetik huruf A/B/C/D/E di teks jawaban.</p>
                </div>
              </div>
              <div className="grid gap-2">
                {optionLetters.map((letter, index) => {
                  const option = form.options?.[index] || ''
                  const trimmed = String(option || '').trim()
                  const selected = answer && trimmed === answer

                  return (
                    <div key={letter} className={`grid gap-2 rounded-[0.95rem] p-2 ring-1 sm:grid-cols-[auto_1fr] sm:items-center ${selected ? 'bg-[#E0F2FE] ring-[#0284c7]/25' : 'bg-[#F8FAFC] ring-[#0B3A5B]/8'}`}>
                      <button
                        type="button"
                        onClick={() => trimmed && updateField('correctAnswer', trimmed)}
                        className={`grid h-9 w-9 place-items-center rounded-[0.75rem] font-mono text-xs font-black ring-1 ${selected ? 'bg-[#0B3A5B] text-white ring-[#0B3A5B]' : 'bg-white text-[#0284c7] ring-[#0B3A5B]/10'}`}
                        aria-label={`Jadikan opsi ${letter} sebagai kunci`}
                      >
                        {letter}
                      </button>
                      <input value={option} onChange={(event) => updateOption(index, event.target.value)} placeholder={`Opsi ${letter}`} className={materialInputClass} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {isTrueFalse && (
            <div>
              <p className="text-sm font-black text-[#13232d]">Kunci jawaban</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {['Benar', 'Salah'].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateField('correctAnswer', value)}
                    className={`rounded-[0.95rem] px-4 py-3 text-sm font-black ring-1 transition ${answer === value ? 'bg-[#0B3A5B] text-white ring-[#0B3A5B]' : 'bg-[#F8FAFC] text-[#13232d] ring-[#0B3A5B]/10 hover:bg-[#E0F2FE]'}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isShortAnswer && (
            <div className="grid gap-3">
              <label className={materialLabelClass}>Kunci jawaban utama
                <input value={form.correctAnswer || ''} onChange={(event) => updateField('correctAnswer', event.target.value)} placeholder="Contoh: mitosis" className={materialInputClass} />
              </label>
              <label className={materialLabelClass}>Alternatif jawaban yang masih diterima
                <textarea value={(form.options || []).join('\n')} onChange={(event) => updateField('options', event.target.value.split('\n'))} rows={3} placeholder="Opsional. Satu variasi jawaban per baris." className={`${materialInputClass} resize-y leading-7`} />
              </label>
            </div>
          )}

          {isEssay && (
            <label className={materialLabelClass}>Rubrik atau jawaban ideal
              <textarea value={form.correctAnswer || ''} onChange={(event) => updateField('correctAnswer', event.target.value)} rows={4} placeholder="Tulis poin-poin jawaban yang diharapkan atau rubrik penilaian singkat." className={`${materialInputClass} resize-y leading-7`} />
            </label>
          )}

          <label className={materialLabelClass}>{isEssay ? 'Catatan pembahasan untuk guru/siswa' : 'Pembahasan'}
            <textarea value={form.explanation || ''} onChange={(event) => updateField('explanation', event.target.value)} rows={3} placeholder="Tulis alasan jawaban atau catatan koreksi." className={`${materialInputClass} resize-y leading-7`} />
          </label>

          {!validQuestion && (
            <div className="rounded-[0.9rem] bg-amber-50 px-3 py-2.5 text-sm font-bold leading-6 text-amber-800 ring-1 ring-amber-100">
              Lengkapi pertanyaan dan kunci. Untuk pilihan ganda, opsi A sampai E wajib terisi dan satu opsi harus dipilih sebagai kunci.
            </div>
          )}
        </div>

        <aside className="space-y-4 border-t border-[#0B3A5B]/8 bg-[#F1F7FF]/58 p-4 lg:border-l lg:border-t-0">
          <section className="rounded-[0.95rem] bg-white/72 p-3 ring-1 ring-[#0B3A5B]/8">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0284c7]">Ringkasan model</p>
            <h3 className="mt-2 text-base font-black text-[#13232d]">{activeType.label}</h3>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{activeType.description}</p>
          </section>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0284c7]">Level</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {['Mudah', 'Sedang', 'Sulit'].map((level) => {
                const active = form.difficulty === level
                return (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={active}
                    onClick={() => updateField('difficulty', level)}
                    className={`rounded-[0.85rem] px-2 py-2.5 text-xs font-black ring-1 transition ${
                      active
                        ? 'bg-[#0B3A5B] text-white ring-[#0B3A5B]'
                        : 'bg-white text-slate-600 ring-[#0B3A5B]/10 hover:bg-[#E0F2FE] hover:text-[#0284c7]'
                    }`}
                  >
                    {level}
                  </button>
                )
              })}
            </div>
          </div>

          <label className={materialLabelClass}>Topik
            <input value={form.topic || ''} onChange={(event) => updateField('topic', event.target.value)} placeholder="Misalnya: Keanekaragaman hayati" className={materialInputClass} />
          </label>

          <label className={materialLabelClass}>Mata pelajaran
            <select value={form.subjectId || `subject:${form.subject || subjectsList[0]?.name || ''}`} onChange={(event) => updateSubject(event.target.value)} className={materialInputClass}>
              {subjectsList.map((subject) => <option key={subjectOptionValue(subject)} value={subjectOptionValue(subject)}>{subject.name}</option>)}
            </select>
          </label>

          <label className={materialLabelClass}>Kelas
            <select value={form.classId || `class:${form.className || classesList[0]?.name || ''}`} onChange={(event) => updateClass(event.target.value)} className={materialInputClass}>
              {classesList.map((classItem) => <option key={classOptionValue(classItem)} value={classOptionValue(classItem)}>{classItem.name}</option>)}
            </select>
          </label>
        </aside>
      </div>

      <footer className="flex flex-col-reverse gap-2 border-t border-[#0B3A5B]/8 bg-white/72 px-4 py-3 sm:flex-row sm:justify-end">
        <button onClick={onCancel} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-100">
          <X size={16} /> Batal
        </button>
        <button onClick={submit} disabled={!validQuestion} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] bg-[#0B3A5B] px-4 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(15,31,42,0.14)] transition hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-45">
          <Save size={16} /> Simpan soal
        </button>
      </footer>
    </section>
  )
}

function emptyQuestion(lookups, teacherSubject) {
  const subject = lookups.subjects.find((item) => normalizeLookupText(item.name) === normalizeLookupText(teacherSubject))
  const classOptions = getMaterialClassOptions(lookups.classes, highSchoolGradeFolders[0].name)
  const classItem = classOptions.find((item) => normalizeLookupText(item.name) === normalizeLookupText(highSchoolGradeFolders[0].name)) || classOptions[0]
  const subjectName = subject?.name || teacherSubject || highSchoolSubjectFolders[0]

  return {
    questionText: '',
    options: optionLetters.map(() => ''),
    correctAnswer: '',
    explanation: '',
    subjectId: subject?.id || '',
    classId: classItem?.synthetic ? '' : classItem?.id || '',
    subject: subjectName,
    className: classItem?.name || highSchoolGradeFolders[0].name,
    topic: '',
    difficulty: 'Mudah',
    type: 'Pilihan ganda',
  }
}

function GuruTugas({ user, notify, appContext }) {
  const teacherSubject = user?.subject?.trim() || ''
  const [rows, setRows] = useState([])
  const [lookups, setLookups] = useState({ subjects: [], classes: [] })
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [viewingSubmissions, setViewingSubmissions] = useState(null)
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')
  const activeCount = rows.filter((item) => item.status === 'Aktif').length
  const draftCount = rows.filter((item) => item.status !== 'Aktif').length
  const sourceLabel = (!appContext?.accessToken || !isUuid(user?.id)) ? 'Preview lokal' : 'Supabase'

  useEffect(() => {
    let active = true
    async function loadAssignments() {
      if (!appContext?.accessToken || !isUuid(user?.id)) {
        setRows(getLocalTeacherAssignments(user, teacherSubject))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [assignmentRows, lookupRows] = await Promise.all([
          fetchAssignments({ accessToken: appContext.accessToken, teacherId: user.id }),
          fetchMaterialLookups({ accessToken: appContext.accessToken }),
        ])
        if (active) {
          setRows(assignmentRows)
          setLookups(lookupRows)
          setError('')
        }
      } catch (loadError) {
        if (active) {
          setRows(getLocalTeacherAssignments(user, teacherSubject))
          setError(loadError.message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    loadAssignments()
    return () => { active = false }
  }, [appContext?.accessToken, teacherSubject, user?.id])

  async function handleSave(assignment) {
    if (!appContext?.accessToken || !isUuid(user?.id)) {
      const localAssignment = {
        ...assignment,
        id: assignment.id || `local-assignment-${Date.now()}`,
        subject: assignment.subject || teacherSubject || 'Mapel belum dipilih',
        className: assignment.className || 'Semua kelas',
        source: 'local',
      }

      setRows((current) => {
        const nextRows = assignment.id
          ? current.map((item) => item.id === assignment.id ? { ...item, ...localAssignment } : item)
          : [localAssignment, ...current]
        setLocalTeacherAssignments(user, teacherSubject, nextRows)
        return nextRows
      })

      setEditing(null)
      notify('Tugas tersimpan lokal di perangkat.')
      return
    }

    try {
      const assignmentPayload = assignment.rubric
        ? { ...assignment, description: `${assignment.description || ''}\n\nRubrik sederhana:\n${assignment.rubric}`.trim() }
        : assignment
      const saved = await saveAssignment({ accessToken: appContext.accessToken, teacherId: user.id, assignment: assignmentPayload })
      setRows((current) => assignment.id ? current.map((item) => item.id === assignment.id ? saved : item) : [saved, ...current])
      setEditing(null)
      notify(assignment.id ? 'Tugas berhasil diperbarui di Supabase.' : 'Tugas berhasil dibuat di Supabase.')
    } catch (saveError) {
      notify(`Gagal menyimpan tugas: ${saveError.message}`)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    if (!appContext?.accessToken || !isUuid(user?.id) || deleting.source !== 'supabase') {
      setRows((current) => {
        const nextRows = current.filter((item) => item.id !== deleting.id)
        setLocalTeacherAssignments(user, teacherSubject, nextRows)
        return nextRows
      })
      setDeleting(null)
      notify('Tugas lokal dihapus dan tersimpan di perangkat.')
      return
    }
    try {
      await removeAssignment({ accessToken: appContext.accessToken, id: deleting.id })
      setRows((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
      notify('Tugas berhasil dihapus dari Supabase.')
    } catch (deleteError) {
      notify(`Gagal menghapus tugas: ${deleteError.message}`)
    }
  }

  async function openSubmissions(row) {
    const localRows = getLocalAssignmentSubmissions(row.id)
    if (appContext?.accessToken && row.source === 'supabase') {
      try {
        const remoteRows = await fetchAssignmentSubmissions({ accessToken: appContext.accessToken, assignmentId: row.id })
        setViewingSubmissions({ assignment: row, rows: remoteRows.length > 0 ? remoteRows : localRows, source: remoteRows.length > 0 ? 'supabase' : 'local' })
        return
      } catch (submissionError) {
        notify(`Submission Supabase belum bisa dibaca guru, memakai data lokal: ${submissionError.message}`)
      }
    }
    setViewingSubmissions({ assignment: row, rows: localRows, source: 'local' })
  }

  if (viewingSubmissions) {
    return (
      <div>
        <PageHeader
          eyebrow="Submission Tugas"
          title={viewingSubmissions.assignment.title}
          description={`${viewingSubmissions.rows.length} submission terbaca · sumber ${viewingSubmissions.source}`}
          action={<button onClick={() => setViewingSubmissions(null)} className="rounded-[0.85rem] bg-[#F1F7FF] px-3 py-2 text-xs font-black text-[#0284c7] ring-1 ring-[#0B3A5B]/8 transition hover:bg-[#E0F2FE]">Kembali</button>}
        />
        {viewingSubmissions.rows.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {viewingSubmissions.rows.map((submission, index) => (
              <SectionCard key={submission.id || `${submission.student_id}-${index}`}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <StatusBadge tone="green">Terkirim</StatusBadge>
                  <StatusBadge tone="cyan">{submission.score ? `Skor ${submission.score}` : 'Belum dinilai'}</StatusBadge>
                </div>
                <p className="text-sm font-extrabold text-slate-950">{submission.studentName || submission.student_id || `Siswa ${index + 1}`}</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{submission.answerText || submission.answer_text || 'Jawaban kosong.'}</p>
                <p className="mt-3 text-xs font-bold text-slate-400">
                  {submission.submittedAt || submission.submitted_at ? new Date(submission.submittedAt || submission.submitted_at).toLocaleString('id-ID') : 'Waktu belum tersedia'}
                </p>
              </SectionCard>
            ))}
          </div>
        ) : (
          <EmptyState title="Belum ada submission." description="Submission siswa akan muncul setelah siswa mengirim jawaban teks dari halaman Tugas." />
        )}
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Tugas"
        title="Tugas kelas"
        description="Kelola instruksi, tenggat, rubrik, dan submission siswa tanpa contoh palsu."
        action={<QuickActionButton icon={Plus} label={editing ? 'Editor terbuka' : 'Buat tugas'} disabled={Boolean(editing)} onClick={() => setEditing(emptyAssignment(lookups, teacherSubject))} />}
      />

      <section className="mb-4 flex flex-col gap-3 rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/80 px-4 py-3 shadow-[0_12px_36px_rgba(15,31,42,0.055)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs font-black text-[#13232d]">
          <span className="inline-flex items-center gap-1.5 rounded-[0.75rem] bg-[#E0F2FE] px-3 py-1.5 text-[#0284c7] ring-1 ring-[#0284c7]/10">
            <ClipboardList size={14} /> {rows.length} tugas
          </span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{activeCount} aktif</span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{draftCount} draft/selesai</span>
        </div>
        <p className="text-xs font-bold text-slate-500">
          Sumber data: <span className="text-[#0284c7]">{sourceLabel}</span>
        </p>
      </section>

      {error && <div className="mb-4 rounded-[1rem] bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data tugas: {error}. Data lokal ditampilkan.</div>}
      
      {editing && <AssignmentForm assignment={editing} lookups={lookups} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label="Memuat tugas dari Supabase..." /> : rows.length > 0 ? (
        <section className="overflow-hidden rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/86 shadow-[0_14px_44px_rgba(15,31,42,0.06)]">
          {rows.map((row) => (
            <article key={row.id} className="grid gap-3 border-b border-[#0B3A5B]/8 p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge tone={statusTone(row.status)}>{row.status}</StatusBadge>
                  <StatusBadge tone="teal">{row.className || 'Semua kelas'}</StatusBadge>
                  <span className="text-xs font-bold text-slate-400">Deadline {row.deadline || 'belum diatur'}</span>
                </div>
                <h2 className="truncate text-lg font-black text-[#13232d]">{row.title || 'Tanpa judul'}</h2>
                <p className="mt-1 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">{row.description || 'Belum ada deskripsi.'}</p>
                <p className="mt-2 text-xs font-bold text-slate-500">{row.subject || 'Mapel belum dipilih'}</p>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button onClick={() => setEditing(row)} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-[#F1F7FF] px-3 py-2 text-xs font-black text-[#0284c7] ring-1 ring-[#0B3A5B]/8 transition hover:bg-[#E0F2FE]">
                  <PencilLine size={14} /> Edit
                </button>
                <button onClick={() => handleSave({ ...row, status: row.status === 'Aktif' ? 'Draft' : 'Aktif' })} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-800 ring-1 ring-cyan-100 transition hover:bg-cyan-100">
                  <Send size={14} /> {row.status === 'Aktif' ? 'Jadikan draft' : 'Aktifkan'}
                </button>
                <button onClick={() => openSubmissions(row)} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100">
                  <ClipboardCheck size={14} /> Submission ({getLocalAssignmentSubmissions(row.id).length})
                </button>
                <button onClick={() => setDeleting(row)} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100">
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        !editing && (
          <EmptyState
            title="Belum ada tugas."
            description="Buat tugas pertama saat instruksi, tenggat, dan rubrik sudah siap."
            action={<QuickActionButton icon={Plus} label="Buat tugas pertama" onClick={() => setEditing(emptyAssignment(lookups, teacherSubject))} />}
          />
        )
      )}
      <ConfirmDialog open={Boolean(deleting)} title="Hapus tugas?" description={`Tugas "${deleting?.title || ''}" akan dihapus setelah konfirmasi.`} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  )
}

function AssignmentForm({ assignment, lookups, onCancel, onSave }) {
  const [form, setForm] = useState(assignment)
  const subjectsList = lookups.subjects.length > 0 ? lookups.subjects : [{ id: '', name: assignment.subject || 'Mapel belum dipilih' }]
  const classesList = lookups.classes.length > 0 ? lookups.classes : [{ id: '', name: assignment.className || 'Semua kelas' }]
  const validAssignment = form.title.trim()

  useEffect(() => {
    setForm(assignment)
  }, [assignment])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateSubject(value) {
    const selected = subjectsList.find((subject) => String(subject.id || '') === value)
    setForm((current) => ({
      ...current,
      subjectId: value,
      subject: selected?.name || current.subject || 'Mapel belum dipilih',
    }))
  }

  function updateClass(value) {
    const selected = classesList.find((classItem) => String(classItem.id || '') === value)
    setForm((current) => ({
      ...current,
      classId: value,
      className: selected?.name || current.className || 'Semua kelas',
    }))
  }

  return (
    <section className="mb-5 overflow-hidden rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/88 shadow-[0_16px_48px_rgba(15,31,42,0.07)] backdrop-blur-xl">
      <header className="flex flex-col gap-3 border-b border-[#0B3A5B]/8 bg-[#F8FAFC]/78 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-[0.9rem] bg-[#E0F2FE] text-[#0284c7] ring-1 ring-[#0284c7]/10">
            <ClipboardList size={20} />
          </span>
          <div>
            <h2 className="text-xl font-black leading-tight text-[#13232d]">{form.id ? 'Edit tugas' : 'Buat tugas'}</h2>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              Tugas berisi instruksi kerja siswa, tenggat, dan rubrik ringkas agar penilaian tetap jelas.
            </p>
          </div>
        </div>
        <StatusBadge tone={form.status === 'Aktif' ? 'green' : 'amber'}>{form.status}</StatusBadge>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="space-y-3 p-4">
          <label className={materialLabelClass}>Judul
            <input value={form.title || ''} onChange={(event) => updateField('title', event.target.value)} placeholder="Judul tugas" className={materialInputClass} />
          </label>

          <label className={materialLabelClass}>Instruksi tugas
            <textarea value={form.description || ''} onChange={(event) => updateField('description', event.target.value)} rows={5} placeholder="Tulis instruksi pengerjaan, format jawaban, dan batasan yang perlu diketahui siswa." className={`${materialInputClass} resize-y leading-7`} />
          </label>

          <label className={materialLabelClass}>Rubrik sederhana
            <textarea value={form.rubric || ''} onChange={(event) => updateField('rubric', event.target.value)} rows={3} placeholder="Contoh: isi 40%, ketepatan konsep 30%, kerapian 20%, refleksi 10%." className={`${materialInputClass} resize-y leading-7`} />
          </label>

          {!validAssignment && (
            <div className="rounded-[0.9rem] bg-amber-50 px-3 py-2.5 text-sm font-bold leading-6 text-amber-800 ring-1 ring-amber-100">
              Judul tugas wajib diisi sebelum disimpan.
            </div>
          )}
        </div>

        <aside className="space-y-4 border-t border-[#0B3A5B]/8 bg-[#F1F7FF]/58 p-4 lg:border-l lg:border-t-0">
          <label className={materialLabelClass}>Deadline
            <input type="date" value={form.deadline || ''} onChange={(event) => updateField('deadline', event.target.value)} className={materialInputClass} />
          </label>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0284c7]">Status</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {['Draft', 'Aktif', 'Selesai'].map((status) => {
                const active = form.status === status
                return (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={active}
                    onClick={() => updateField('status', status)}
                    className={`rounded-[0.85rem] px-2 py-2.5 text-xs font-black ring-1 transition ${
                      active
                        ? 'bg-[#0B3A5B] text-white ring-[#0B3A5B]'
                        : 'bg-white text-slate-600 ring-[#0B3A5B]/10 hover:bg-[#E0F2FE] hover:text-[#0284c7]'
                    }`}
                  >
                    {status}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
              Draft belum tampil. Aktif membuat tugas muncul di halaman siswa.
            </p>
          </div>

          <label className={materialLabelClass}>Mata pelajaran
            <select value={form.subjectId || ''} onChange={(event) => updateSubject(event.target.value)} className={materialInputClass}>
              {subjectsList.map((subject) => <option key={subject.id || subject.name} value={subject.id || ''}>{subject.name}</option>)}
            </select>
          </label>

          <label className={materialLabelClass}>Kelas
            <select value={form.classId || ''} onChange={(event) => updateClass(event.target.value)} className={materialInputClass}>
              {classesList.map((classItem) => <option key={classItem.id || classItem.name} value={classItem.id || ''}>{classItem.name}</option>)}
            </select>
          </label>
        </aside>
      </div>

      <footer className="flex flex-col-reverse gap-2 border-t border-[#0B3A5B]/8 bg-white/72 px-4 py-3 sm:flex-row sm:justify-end">
        <button onClick={onCancel} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-100">
          <X size={16} /> Batal
        </button>
        <button onClick={() => onSave(form)} disabled={!validAssignment} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] bg-[#0B3A5B] px-4 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(15,31,42,0.14)] transition hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-45">
          <Save size={16} /> Simpan tugas
        </button>
      </footer>
    </section>
  )
}

function emptyAssignment(lookups, teacherSubject) {
  const subject = lookups.subjects.find((item) => item.name === teacherSubject) || lookups.subjects[0]
  const classItem = lookups.classes[0]
  return {
    title: '',
    description: '',
    subjectId: subject?.id || '',
    classId: classItem?.id || '',
    subject: subject?.name || teacherSubject || 'Mapel belum dipilih',
    className: classItem?.name || 'Semua kelas',
    deadline: '',
    status: 'Draft',
    rubric: '',
  }
}

function KuisLive({ user, notify, appContext }) {
  const teacherSubject = user?.subject?.trim() || ''
  const [quizRows, setQuizRows] = useState([])
  const [questionRows, setQuestionRows] = useState([])
  const [lookups, setLookups] = useState({ subjects: [], classes: [] })
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')
  const publishedCount = quizRows.filter((item) => item.status === 'Publish').length
  const draftCount = quizRows.filter((item) => item.status !== 'Publish').length
  const sourceLabel = (!appContext?.accessToken || !isUuid(user?.id)) ? 'Preview lokal' : 'Supabase'

  useEffect(() => {
    let active = true

    async function loadTeacherQuizzes() {
      if (!appContext?.accessToken || !isUuid(user?.id)) {
        setQuizRows(getLocalTeacherQuizzes(user, teacherSubject))
        setQuestionRows(getLocalTeacherQuestions(user, teacherSubject))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [quizData, questionData, lookupRows, attemptRows] = await Promise.all([
          fetchQuizzes({ accessToken: appContext.accessToken, teacherId: user.id }),
          fetchQuestions({ accessToken: appContext.accessToken, teacherId: user.id }),
          fetchMaterialLookups({ accessToken: appContext.accessToken }),
          fetchQuizAttempts({ accessToken: appContext.accessToken }),
        ])
        if (active) {
          setQuizRows(quizData)
          setQuestionRows(questionData)
          setLookups(lookupRows)
          setAttempts(attemptRows)
          setError('')
        }
      } catch (loadError) {
        if (active) {
          setQuizRows(getLocalTeacherQuizzes(user, teacherSubject))
          setQuestionRows(getLocalTeacherQuestions(user, teacherSubject))
          setError(loadError.message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadTeacherQuizzes()
    return () => {
      active = false
    }
  }, [appContext?.accessToken, teacherSubject, user?.id])

  async function handleSave(quiz, selectedQuestionIds) {
    if (!appContext?.accessToken || !isUuid(user?.id)) {
      const localQuiz = {
        ...quiz,
        id: quiz.id || `local-quiz-${Date.now()}`,
        subject: quiz.subject || teacherSubject || 'Mapel belum dipilih',
        teacher: user?.name,
        className: quiz.className || 'Semua kelas',
        source: 'local',
        questionIds: selectedQuestionIds,
        questionCount: selectedQuestionIds.length,
      }

      setQuizRows((current) => {
        const nextRows = quiz.id
          ? current.map((item) => item.id === quiz.id ? { ...item, ...localQuiz } : item)
          : [localQuiz, ...current]
        setLocalTeacherQuizzes(user, teacherSubject, nextRows)
        return nextRows
      })

      setEditing(null)
      notify('Kuis tersimpan lokal di perangkat.')
      return
    }

    try {
      const saved = await saveQuiz({ accessToken: appContext.accessToken, teacherId: user.id, quiz, questionIds: selectedQuestionIds })
      setQuizRows((current) => quiz.id ? current.map((item) => item.id === quiz.id ? saved : item) : [saved, ...current])
      setEditing(null)
      notify(quiz.id ? 'Kuis berhasil diperbarui di Supabase.' : 'Kuis berhasil dibuat di Supabase.')
    } catch (saveError) {
      notify(`Gagal menyimpan kuis: ${saveError.message}`)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    if (!appContext?.accessToken || !isUuid(user?.id) || deleting.source !== 'supabase') {
      setQuizRows((current) => {
        const nextRows = current.filter((item) => item.id !== deleting.id)
        setLocalTeacherQuizzes(user, teacherSubject, nextRows)
        return nextRows
      })
      setDeleting(null)
      notify('Kuis lokal dihapus dan tersimpan di perangkat.')
      return
    }

    try {
      await removeQuiz({ accessToken: appContext.accessToken, id: deleting.id })
      setQuizRows((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
      notify('Kuis berhasil dihapus dari Supabase.')
    } catch (deleteError) {
      notify(`Gagal menghapus kuis: ${deleteError.message}`)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Kuis Live"
        title="Kuis live"
        description="Rakit kuis dari Bank Soal, atur durasi, lalu publish saat siap dikerjakan siswa."
        action={<QuickActionButton icon={FlaskConical} label={questionRows.length === 0 ? 'Butuh soal' : editing ? 'Editor terbuka' : 'Buat kuis'} disabled={Boolean(editing) || questionRows.length === 0} onClick={() => setEditing(emptyQuiz(lookups, teacherSubject))} />}
      />

      <section className="mb-4 flex flex-col gap-3 rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/80 px-4 py-3 shadow-[0_12px_36px_rgba(15,31,42,0.055)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs font-black text-[#13232d]">
          <span className="inline-flex items-center gap-1.5 rounded-[0.75rem] bg-[#E0F2FE] px-3 py-1.5 text-[#0284c7] ring-1 ring-[#0284c7]/10">
            <FlaskConical size={14} /> {quizRows.length} kuis
          </span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{publishedCount} publish</span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{draftCount} draft</span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{questionRows.length} soal tersedia</span>
        </div>
        <p className="text-xs font-bold text-slate-500">
          Sumber data: <span className="text-[#0284c7]">{sourceLabel}</span>
        </p>
      </section>

      {error && <div className="mb-4 rounded-[1rem] bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data kuis: {error}. Data lokal mapel guru ditampilkan.</div>}
      
      {editing && <QuizForm quiz={editing} lookups={lookups} questions={questionRows} onCancel={() => setEditing(null)} onSave={handleSave} />}
      
      {loading ? <LoadingState label="Memuat kuis guru dari Supabase..." /> : (
        quizRows.length > 0 ? (
          <section className="overflow-hidden rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/86 shadow-[0_14px_44px_rgba(15,31,42,0.06)]">
            {quizRows.map((quiz) => (
              <article key={quiz.id} className="grid gap-3 border-b border-[#0B3A5B]/8 p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusBadge tone={statusTone(quiz.status)}>{quiz.status}</StatusBadge>
                    <StatusBadge tone="teal">{quiz.duration} menit</StatusBadge>
                    <span className="text-xs font-bold text-slate-400">{attempts.filter((attempt) => attempt.quiz_id === quiz.id).length} attempt masuk</span>
                  </div>
                  <h2 className="truncate text-lg font-black text-[#13232d]">{quiz.title || 'Tanpa judul'}</h2>
                  <p className="mt-2 text-xs font-bold text-slate-500">
                    {(quiz.subject || 'Mapel belum dipilih')} · {(quiz.className || 'Semua kelas')} · {(quiz.questionCount || quiz.questionIds?.length || 0)} soal
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <button onClick={() => setEditing(quiz)} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-[#F1F7FF] px-3 py-2 text-xs font-black text-[#0284c7] ring-1 ring-[#0B3A5B]/8 transition hover:bg-[#E0F2FE]">
                    <PencilLine size={14} /> Edit
                  </button>
                  <button onClick={() => handleSave({ ...quiz, status: quiz.status === 'Publish' ? 'Draft' : 'Publish' }, quiz.questionIds || [])} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-800 ring-1 ring-cyan-100 transition hover:bg-cyan-100">
                    <Send size={14} /> {quiz.status === 'Publish' ? 'Jadikan draft' : 'Publish'}
                  </button>
                  <button onClick={() => setDeleting(quiz)} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100">
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          !editing && (
            <EmptyState
              title="Belum ada kuis."
              description={questionRows.length > 0 ? 'Buat kuis pertama dari soal yang sudah tersedia.' : 'Buat soal di Bank Soal dulu, lalu rakit kuis saat siap.'}
              action={<QuickActionButton icon={FlaskConical} label="Buat kuis" disabled={questionRows.length === 0} onClick={() => setEditing(emptyQuiz(lookups, teacherSubject))} />}
            />
          )
        )
      )}
      <ConfirmDialog open={Boolean(deleting)} title="Hapus kuis?" description={`Kuis "${deleting?.title || ''}" akan dihapus setelah konfirmasi.`} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  )
}

function QuizForm({ quiz, lookups, questions: availableQuestions, onCancel, onSave }) {
  const [form, setForm] = useState(quiz)
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(quiz.questionIds || [])
  const subjectsList = lookups.subjects.length > 0 ? lookups.subjects : [{ id: '', name: quiz.subject || 'Mapel belum dipilih' }]
  const classesList = lookups.classes.length > 0 ? lookups.classes : [{ id: '', name: quiz.className || 'Semua kelas' }]
  const selectedCount = selectedQuestionIds.length
  const validQuiz = form.title.trim() && selectedCount > 0

  useEffect(() => {
    setForm(quiz)
    setSelectedQuestionIds(quiz.questionIds || [])
  }, [quiz])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateSubject(value) {
    const selected = subjectsList.find((subject) => String(subject.id || '') === value)
    setForm((current) => ({
      ...current,
      subjectId: value,
      subject: selected?.name || current.subject || 'Mapel belum dipilih',
    }))
  }

  function updateClass(value) {
    const selected = classesList.find((classItem) => String(classItem.id || '') === value)
    setForm((current) => ({
      ...current,
      classId: value,
      className: selected?.name || current.className || 'Semua kelas',
    }))
  }

  function toggleQuestion(questionId) {
    setSelectedQuestionIds((current) => current.includes(questionId) ? current.filter((id) => id !== questionId) : [...current, questionId])
  }

  return (
    <section className="mb-5 overflow-hidden rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/88 shadow-[0_16px_48px_rgba(15,31,42,0.07)] backdrop-blur-xl">
      <header className="flex flex-col gap-3 border-b border-[#0B3A5B]/8 bg-[#F8FAFC]/78 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-[0.9rem] bg-[#E0F2FE] text-[#0284c7] ring-1 ring-[#0284c7]/10">
            <FlaskConical size={20} />
          </span>
          <div>
            <h2 className="text-xl font-black leading-tight text-[#13232d]">{form.id ? 'Edit kuis' : 'Buat kuis'}</h2>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              Pilih soal dari Bank Soal agar kuis tetap terstruktur dan bisa dipakai ulang.
            </p>
          </div>
        </div>
        <StatusBadge tone={validQuiz ? 'green' : 'amber'}>{selectedCount} soal dipilih</StatusBadge>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className={materialLabelClass}>Judul
              <input value={form.title || ''} onChange={(event) => updateField('title', event.target.value)} placeholder="Judul kuis" className={materialInputClass} />
            </label>
            <label className={materialLabelClass}>Durasi menit
              <input type="number" min="1" value={form.duration} onChange={(event) => updateField('duration', event.target.value)} className={materialInputClass} />
            </label>
          </div>

          <label className={materialLabelClass}>Deskripsi
            <textarea value={form.description || ''} onChange={(event) => updateField('description', event.target.value)} rows={3} placeholder="Keterangan singkat untuk siswa sebelum memulai kuis." className={`${materialInputClass} resize-y leading-7`} />
          </label>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-black text-[#13232d]">Pilih soal dari Bank Soal</p>
              <StatusBadge tone={selectedCount > 0 ? 'green' : 'amber'}>{selectedCount} soal dipilih</StatusBadge>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {availableQuestions.length > 0 ? availableQuestions.map((question) => {
                const selected = selectedQuestionIds.includes(question.id)
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => toggleQuestion(question.id)}
                    className={`rounded-[0.95rem] p-3 text-left text-sm font-semibold ring-1 transition ${
                      selected
                        ? 'bg-[#0B3A5B] text-white ring-[#0B3A5B]'
                        : 'bg-[#F1F7FF] text-slate-700 ring-[#0B3A5B]/8 hover:bg-[#E0F2FE] hover:text-[#0284c7]'
                    }`}
                  >
                    <span className="line-clamp-2 font-black">{question.questionText}</span>
                    <span className="mt-2 block text-xs opacity-75">{question.topic || 'Tanpa topik'} · {question.difficulty || 'Mudah'}</span>
                  </button>
                )
              }) : (
                <div className="rounded-[0.9rem] bg-amber-50 px-3 py-2.5 text-sm font-bold leading-6 text-amber-800 ring-1 ring-amber-100 md:col-span-2">
                  Bank Soal belum tersedia. Buat soal terlebih dahulu di menu Bank Soal, lalu kembali membuat kuis.
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4 border-t border-[#0B3A5B]/8 bg-[#F1F7FF]/58 p-4 lg:border-l lg:border-t-0">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0284c7]">Status</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {['Draft', 'Publish'].map((status) => {
                const active = form.status === status
                return (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={active}
                    onClick={() => updateField('status', status)}
                    className={`rounded-[0.85rem] px-3 py-2.5 text-xs font-black ring-1 transition ${
                      active
                        ? 'bg-[#0B3A5B] text-white ring-[#0B3A5B]'
                        : 'bg-white text-slate-600 ring-[#0B3A5B]/10 hover:bg-[#E0F2FE] hover:text-[#0284c7]'
                    }`}
                  >
                    {status}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
              Publish membuat kuis bisa dikerjakan siswa.
            </p>
          </div>

          <label className={materialLabelClass}>Mata pelajaran
            <select value={form.subjectId || ''} onChange={(event) => updateSubject(event.target.value)} className={materialInputClass}>
              {subjectsList.map((subject) => <option key={subject.id || subject.name} value={subject.id || ''}>{subject.name}</option>)}
            </select>
          </label>

          <label className={materialLabelClass}>Kelas
            <select value={form.classId || ''} onChange={(event) => updateClass(event.target.value)} className={materialInputClass}>
              {classesList.map((classItem) => <option key={classItem.id || classItem.name} value={classItem.id || ''}>{classItem.name}</option>)}
            </select>
          </label>
        </aside>
      </div>

      <footer className="flex flex-col-reverse gap-2 border-t border-[#0B3A5B]/8 bg-white/72 px-4 py-3 sm:flex-row sm:justify-end">
        <button onClick={onCancel} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-100">
          <X size={16} /> Batal
        </button>
        <button onClick={() => onSave(form, selectedQuestionIds)} disabled={!validQuiz} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] bg-[#0B3A5B] px-4 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(15,31,42,0.14)] transition hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-45">
          <Save size={16} /> Simpan kuis
        </button>
      </footer>
    </section>
  )
}

function emptyQuiz(lookups, teacherSubject) {
  const subject = lookups.subjects.find((item) => item.name === teacherSubject) || lookups.subjects[0]
  const classItem = lookups.classes[0]
  return {
    title: '',
    description: '',
    subjectId: subject?.id || '',
    classId: classItem?.id || '',
    subject: subject?.name || teacherSubject || 'Mapel belum dipilih',
    className: classItem?.name || 'Semua kelas',
    duration: 30,
    status: 'Draft',
  }
}

function AnalisisNilai() {
  const nilaiRows = scoreTrend.filter((item) => Number.isFinite(Number(item.nilai)))
  const nilaiValues = nilaiRows.map((item) => Number(item.nilai))
  const average = nilaiValues.length ? Math.round(nilaiValues.reduce((total, item) => total + item, 0) / nilaiValues.length) : 0
  const highest = nilaiValues.length ? Math.max(...nilaiValues) : 0
  const lowest = nilaiValues.length ? Math.min(...nilaiValues) : 0

  return (
    <div>
      <PageHeader eyebrow="Analisis Nilai" title="Insight kelas untuk tindak lanjut." />
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <StatCard label="Rata-rata" value={average || '-'} icon={BarChart3} />
        <StatCard label="Tertinggi" value={highest || '-'} tone="green" />
        <StatCard label="Terendah" value={lowest || '-'} tone="amber" />
        <StatCard label="Soal sulit" value="-" tone="teal" />
      </div>
      <DashboardCard title="Sebaran nilai">
        {nilaiRows.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={nilaiRows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="nilai" fill="#0284C7" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            title="Belum ada data nilai"
            description="Nilai akan muncul setelah siswa mengerjakan latihan, kuis, atau tugas yang dipublish."
          />
        )}
      </DashboardCard>
    </div>
  )
}

function RemedialPage({ notify }) {
  return <ManageList eyebrow="Remedial" title="Siswa di bawah KKM" rows={remedials} button="Kirim remedial" notify={notify} type="remedial" />
}

function AIGeneratorPage() {
  return (
    <div>
      <PageHeader
        eyebrow="AI Cepat"
        title="Generator cepat untuk draft sederhana."
        description="Gunakan halaman ini untuk membuat draft cepat. Untuk menyiapkan pembelajaran lengkap, gunakan Siapkan Pembelajaran."
        action={
          <a href="/guru/studio-konten" className="rounded-2xl bg-galaxy-action px-5 py-3 text-sm font-extrabold text-white shadow-glow">
            Buka Siapkan Pembelajaran
          </a>
        }
      />

      <SectionCard className="mb-5 bg-gradient-to-br from-[#E0F2FE] via-white to-cyan-50">
        <div className="grid gap-4 lg:grid-cols-[1fr_18rem] lg:items-center">
          <div>
            <StatusBadge tone="cyan">Shortcut AI</StatusBadge>
            <h2 className="mt-3 text-2xl font-black text-slate-950">
              AI Cepat cocok untuk kebutuhan singkat.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Pakai AI Cepat saat guru hanya butuh draft ringkas seperti soal, rangkuman,
              flashcard, atau rubrik awal. Jika ingin membuat materi lengkap, LKPD, video
              interaktif, STEM tools, remedial, pengayaan, dan mengirim hasil ke fitur siswa,
              gunakan Siapkan Pembelajaran.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge tone="teal">Soal cepat</StatusBadge>
              <StatusBadge tone="amber">Rangkuman</StatusBadge>
              <StatusBadge tone="green">Rubrik awal</StatusBadge>
              <StatusBadge tone="cyan">Flashcard draft</StatusBadge>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-[#0B3A5B]/10">
            <p className="text-sm font-extrabold text-slate-950">Butuh paket lengkap?</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Siapkan Pembelajaran adalah ruang utama untuk membuat dan mengirim konten ke Materi,
              Bank Soal, Kuis Live, Flashcard, Remedial, dan Pengayaan.
            </p>
            <a href="/guru/studio-konten" className="mt-4 inline-flex w-full justify-center rounded-2xl bg-galaxy-action px-4 py-3 text-sm font-extrabold text-white">
              Masuk Siapkan Pembelajaran
            </a>
          </div>
        </div>
      </SectionCard>

      <AIGeneratorPanel />
    </div>
  )
}

function LaporanGuru({ notify }) {
  return <ReportPage eyebrow="Laporan Guru" title="Laporan kelas, tugas, dan kuis" notify={notify} />
}

function AdminDashboard() {
  const navigate = useNavigate()
  const localMaterials = readLocalRowsByPrefix('islelearn-teacher-materials-')
  const localAssignments = readLocalRowsByPrefix('islelearn-teacher-assignments-')
  const localQuestions = readLocalRowsByPrefix('islelearn-teacher-questions-')
  const localQuizzes = readLocalRowsByPrefix('islelearn-teacher-quizzes-')
  const localContent = [...localMaterials, ...localAssignments, ...localQuestions, ...localQuizzes]

  const adminMenus = [
    { label: 'Guru', icon: UsersRound, onClick: () => navigate('/admin/guru') },
    { label: 'Siswa', icon: UsersRound, onClick: () => navigate('/admin/siswa') },
    { label: 'Kelas', icon: School, onClick: () => navigate('/admin/kelas') },
    { label: 'Mapel', icon: BookOpen, onClick: () => navigate('/admin/mapel') },
    { label: 'E-Rapor', icon: FileText, onClick: () => navigate('/admin/e-rapor') },
    { label: 'Backup', icon: Download, onClick: () => navigate('/admin/backup') },
  ]

  const metricItems = [
    { label: 'Guru', value: teachers.length, caption: 'profil terdaftar', icon: UsersRound },
    { label: 'Siswa', value: students.length, caption: 'akun siswa', icon: UsersRound },
    { label: 'Kelas', value: classes.length, caption: 'rombel aktif', icon: School },
    { label: 'Konten', value: localContent.length, caption: 'item tersimpan', icon: BookOpen },
  ]

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[1.35rem] border border-[#123B63] bg-[#123B63] p-5 text-white shadow-[0_20px_52px_rgba(11,37,64,0.22)]">
        <div className="grid gap-4 xl:grid-cols-[1fr_24rem] xl:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-sky-200">Konsol sekolah</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-white">Lengkapi data inti sebelum kelas berjalan.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-100/82">
              Dashboard admin harus memberi tanda jelas data apa yang sudah siap dan apa yang masih perlu dilengkapi.
            </p>
          </div>
          <DashboardActionGrid items={adminMenus.slice(0, 5)} bare />
        </div>
      </section>

      <MetricStrip items={metricItems} />

      <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <DashboardPanel title="Checklist data sekolah" description="Urutan setup yang membuat aplikasi siap dipakai kelas.">
          <SetupSteps
            items={[
              { label: 'Data guru', description: 'Tambahkan akun guru dan mapel yang diampu.', icon: UsersRound, done: teachers.length > 0, actionLabel: 'Kelola', onClick: () => navigate('/admin/guru') },
              { label: 'Data siswa', description: 'Import atau tambahkan siswa per rombel.', icon: UsersRound, done: students.length > 0, actionLabel: 'Kelola', onClick: () => navigate('/admin/siswa') },
              { label: 'Kelas dan mapel', description: 'Pastikan rombel dan mata pelajaran tersedia.', icon: School, done: classes.length > 0 && subjects.length > 0, actionLabel: 'Cek', onClick: () => navigate('/admin/kelas') },
              { label: 'Backup data', description: 'Simpan salinan data utama secara berkala.', icon: Download, done: false, actionLabel: 'Backup', onClick: () => navigate('/admin/backup') },
            ]}
          />
        </DashboardPanel>

        <DashboardPanel title="Status sistem" description="Ringkasan singkat untuk melihat kesiapan data.">
          <div className="space-y-2">
            {[
              ['Profil sekolah', 'Siap dikonfigurasi', 'Pengaturan'],
              ['Konten pembelajaran', `${localContent.length} item lokal`, 'Guru'],
              ['Database', 'Mode lokal/dev', 'Koneksi'],
            ].map(([label, value, tag]) => (
              <div key={label} className="flex items-center justify-between gap-3 rounded-xl border border-[#D9E6F5] bg-[#F8FBFF] px-3 py-3">
                <span>
                  <span className="block text-sm font-black text-[#132437]">{label}</span>
                  <span className="block text-xs font-semibold text-[#64748B]">{value}</span>
                </span>
                <span className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-black text-[#2F80D8] ring-1 ring-[#D9E6F5]">{tag}</span>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>
    </div>
  )
}


function AdminProfiles({ role, title, notify, appContext }) {
  const fallbackRows = role === 'guru' ? teachers.map((teacher) => ({ ...teacher, role: 'guru' })) : students.map((student) => ({ ...student, role: 'siswa' }))
  const [rows, setRows] = useState([])
  const [lookups, setLookups] = useState({ classes: [], subjects: [] })
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadProfiles() {
      if (!appContext?.accessToken) {
        const localRows = normalizeAdminProfileRows(role, getLocalAdminProfiles(role, fallbackRows))
        setRows(localRows)
        if (role === 'siswa') setLocalAdminProfiles(role, localRows)
        setLookups({ classes: normalizeClassLookupRows(classes), subjects })
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [profileRows, classRows, subjectRows] = await Promise.all([
          role === 'guru' ? fetchAdminTeachers({ accessToken: appContext.accessToken }) : fetchAdminStudents({ accessToken: appContext.accessToken }),
          fetchClasses({ accessToken: appContext.accessToken }),
          fetchSubjects({ accessToken: appContext.accessToken }),
        ])
        if (active) {
          setRows(normalizeAdminProfileRows(role, profileRows.length > 0 ? profileRows : fallbackRows))
          setLookups({ classes: normalizeClassLookupRows(classRows.length > 0 ? classRows : classes), subjects: subjectRows })
          setError('')
        }
      } catch (loadError) {
        if (active) {
          const localRows = normalizeAdminProfileRows(role, getLocalAdminProfiles(role, fallbackRows))
          setRows(localRows)
          if (role === 'siswa') setLocalAdminProfiles(role, localRows)
          setLookups({ classes: normalizeClassLookupRows(classes), subjects })
          setError(loadError.message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProfiles()
    return () => {
      active = false
    }
  }, [appContext?.accessToken, role])

  async function handleSave(profile) {
    if (!appContext?.accessToken) {
      const lookupRows = {
        classes: normalizeClassLookupRows(lookups.classes.length > 0 ? lookups.classes : classes),
        subjects: lookups.subjects.length > 0 ? lookups.subjects : subjects,
      }
      const localProfile = normalizeAdminProfileRows(role, [
        enrichAdminProfileRow({ ...profile, id: profile.id || `local-${role}-${Date.now()}`, role }, role, lookupRows),
      ])[0] || enrichAdminProfileRow({ ...profile, id: profile.id || `local-${role}-${Date.now()}`, role }, role, lookupRows)

      setRows((current) => {
        const nextRows = profile.id
          ? current.map((item) => item.id === profile.id ? localProfile : item)
          : [localProfile, ...current]
        const cleanedRows = normalizeAdminProfileRows(role, nextRows)
        setLocalAdminProfiles(role, cleanedRows)
        return cleanedRows
      })

      setEditing(null)
      notify(`${title} tersimpan lokal di perangkat.`)
      return
    }

    try {
      const saved = role === 'guru'
        ? await saveAdminTeacher({ accessToken: appContext.accessToken, teacher: { ...profile, role } })
        : await saveAdminStudent({ accessToken: appContext.accessToken, student: { ...profile, role } })
      const enriched = normalizeAdminProfileRows(role, [enrichAdminProfileRow(saved, role, lookups)])[0] || enrichAdminProfileRow(saved, role, lookups)
      setRows((current) => profile.id ? current.map((item) => item.id === profile.id ? enriched : item) : [enriched, ...current])
      setEditing(null)
      notify(`${title} berhasil disimpan di Supabase.`)
    } catch (saveError) {
      notify(`Gagal menyimpan data: ${saveError.message}`)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    if (!appContext?.accessToken || !isUuid(deleting.id)) {
      setRows((current) => {
        const nextRows = current.filter((item) => item.id !== deleting.id)
        const cleanedRows = normalizeAdminProfileRows(role, nextRows)
        setLocalAdminProfiles(role, cleanedRows)
        return cleanedRows
      })
      setDeleting(null)
      notify('Data lokal dihapus dan tersimpan di perangkat.')
      return
    }

    try {
      if (role === 'guru') {
        await removeAdminTeacher({ accessToken: appContext.accessToken, teacher: deleting })
      } else {
        await removeAdminStudent({ accessToken: appContext.accessToken, student: deleting })
      }
      setRows((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
      notify('Data berhasil dihapus dari Supabase.')
    } catch (deleteError) {
      notify(`Gagal menghapus data: ${deleteError.message}`)
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Data" title={title} description="Kelola profil dan detail akademik." action={<QuickActionButton icon={Plus} label={`Tambah ${role === 'guru' ? 'guru' : 'siswa'}`} onClick={() => setEditing({ name: '', email: '', role, status: 'Aktif', detailStatus: 'Aktif' })} />} />
      {error && <div className="mb-4 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data: {error}. Data lokal ditampilkan.</div>}
      {editing && <ProfileForm title={title} role={role} profile={editing} lookups={lookups} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label={`Memuat ${title.toLowerCase()} dari Supabase...`} /> : (
        <DataTable columns={[
          { key: 'name', label: 'Nama' },
          { key: 'email', label: 'Email' },
          ...(role === 'guru'
            ? [{ key: 'nip', label: 'NIP' }, { key: 'subject', label: 'Mapel' }]
            : [{ key: 'nis', label: 'NIS' }, { key: 'className', label: 'Kelas' }]),
          { key: 'status', label: 'Status' },
          { key: 'action', label: 'Aksi', render: (row) => <div className="flex gap-2"><button onClick={() => setEditing(row)} className="rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-extrabold text-galaxy-purple">Edit</button><button onClick={() => setDeleting(row)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">Hapus</button></div> },
        ]} rows={rows} />
      )}
      <ConfirmDialog open={Boolean(deleting)} title="Hapus data?" description={`Data "${deleting?.name || ''}" akan dihapus setelah konfirmasi.`} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  )
}

function enrichAdminProfileRow(row, role, lookups) {
  if (role === 'guru') {
    const subjectId = row.subjectId || row.subject_id
    const subject = lookups.subjects.find((item) => item.id === subjectId)
    return { ...row, subjectId, subject: subject?.name || row.subject || '-' }
  }

  const classId = row.classId || row.class_id
  const classItem = normalizeClassLookupRows(lookups.classes).find((item) => item.id === classId)
  return { ...row, classId, className: classItem?.name || promoteClassName(row.className || row.class || row.class_name || '-') }
}

function ProfileForm({ title, role, profile, lookups, onCancel, onSave }) {
  const [form, setForm] = useState(profile)

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <SectionCard className="mb-4">
      <h2 className="text-lg font-black text-gray-950">{profile.id ? `Edit ${title}` : `Tambah ${title}`}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-gray-700">Nama
          <input value={form.name} onChange={(event) => updateField('name', event.target.value)} className="rounded-xl border border-purple-100 bg-galaxy-surface px-3 py-2.5 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Email
          <input value={form.email} onChange={(event) => updateField('email', event.target.value)} className="rounded-xl border border-purple-100 bg-galaxy-surface px-3 py-2.5 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Status
          <select value={form.status || 'Aktif'} onChange={(event) => updateField('status', event.target.value)} className="rounded-xl border border-purple-100 bg-galaxy-surface px-3 py-2.5 outline-none focus:border-purple-300">
            {['Aktif', 'Nonaktif', 'Perlu perhatian'].map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        {role === 'siswa' && (
          <>
            <label className="grid gap-1 text-sm font-bold text-gray-700">NIS
              <input value={form.nis || ''} onChange={(event) => updateField('nis', event.target.value)} className="rounded-xl border border-purple-100 bg-galaxy-surface px-3 py-2.5 outline-none focus:border-purple-300" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-gray-700">NISN
              <input value={form.nisn || ''} onChange={(event) => updateField('nisn', event.target.value)} className="rounded-xl border border-purple-100 bg-galaxy-surface px-3 py-2.5 outline-none focus:border-purple-300" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-gray-700">Kelas
              <select value={form.classId || ''} onChange={(event) => updateField('classId', event.target.value)} className="rounded-xl border border-purple-100 bg-galaxy-surface px-3 py-2.5 outline-none focus:border-purple-300">
                <option value="">Pilih kelas</option>
                {lookups.classes.map((classItem) => <option key={classItem.id} value={classItem.id}>{classItem.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-bold text-gray-700">Gender
              <select value={form.gender || ''} onChange={(event) => updateField('gender', event.target.value)} className="rounded-xl border border-purple-100 bg-galaxy-surface px-3 py-2.5 outline-none focus:border-purple-300">
                <option value="">Pilih gender</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </label>
          </>
        )}
        {role === 'guru' && (
          <>
            <label className="grid gap-1 text-sm font-bold text-gray-700">NIP
              <input value={form.nip || ''} onChange={(event) => updateField('nip', event.target.value)} className="rounded-xl border border-purple-100 bg-galaxy-surface px-3 py-2.5 outline-none focus:border-purple-300" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-gray-700">Mata pelajaran
              <select value={form.subjectId || ''} onChange={(event) => updateField('subjectId', event.target.value)} className="rounded-xl border border-purple-100 bg-galaxy-surface px-3 py-2.5 outline-none focus:border-purple-300">
                <option value="">Pilih mapel</option>
                {lookups.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </label>
          </>
        )}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-xl px-3 py-2 text-xs font-extrabold text-gray-600 hover:bg-gray-50">Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.name.trim() || !form.email.trim()} className="rounded-xl bg-galaxy-action px-4 py-2.5 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">Simpan</button>
      </div>
    </SectionCard>
  )
}

function AdminKelas({ notify, appContext }) {
  const [rows, setRows] = useState([])
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function loadClasses() {
      if (!appContext?.accessToken) {
        const localRows = normalizeClassLookupRows(getLocalAdminCollection('classes', classes))
        setRows(localRows)
        setLocalAdminCollection('classes', localRows)
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const classRows = await fetchClasses({ accessToken: appContext.accessToken })
        if (active) {
          setRows(normalizeClassLookupRows(classRows.length > 0 ? classRows : classes))
          setError('')
        }
      } catch (loadError) {
        if (active) {
          const localRows = normalizeClassLookupRows(getLocalAdminCollection('classes', classes))
          setRows(localRows)
          setLocalAdminCollection('classes', localRows)
          setError(loadError.message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    loadClasses()
    return () => { active = false }
  }, [appContext?.accessToken])

  async function handleSave(classItem) {
    if (!appContext?.accessToken) {
      const localClass = normalizeClassLookupRows([{ ...classItem, id: classItem.id || `local-class-${Date.now()}` }])[0]
        || { ...classItem, id: classItem.id || `local-class-${Date.now()}` }

      setRows((current) => {
        const nextRows = classItem.id
          ? current.map((item) => item.id === classItem.id ? localClass : item)
          : [localClass, ...current]
        const cleanedRows = normalizeClassLookupRows(nextRows)
        setLocalAdminCollection('classes', cleanedRows)
        return cleanedRows
      })

      setEditing(null)
      notify('Kelas tersimpan lokal di perangkat.')
      return
    }
    try {
      const saved = await saveClass({ accessToken: appContext.accessToken, classItem })
      const normalizedSaved = normalizeClassLookupRows([saved])[0] || saved
      setRows((current) => normalizeClassLookupRows(classItem.id ? current.map((item) => item.id === classItem.id ? normalizedSaved : item) : [normalizedSaved, ...current]))
      setEditing(null)
      notify('Kelas berhasil disimpan di Supabase.')
    } catch (saveError) {
      notify(`Gagal menyimpan kelas: ${saveError.message}`)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    if (!appContext?.accessToken || !isUuid(deleting.id)) {
      setRows((current) => {
        const nextRows = normalizeClassLookupRows(current.filter((item) => item.id !== deleting.id))
        setLocalAdminCollection('classes', nextRows)
        return nextRows
      })
      setDeleting(null)
      notify('Kelas lokal dihapus dan tersimpan di perangkat.')
      return
    }
    try {
      await removeClass({ accessToken: appContext.accessToken, id: deleting.id })
      setRows((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
      notify('Kelas berhasil dihapus.')
    } catch (deleteError) {
      notify(`Gagal menghapus kelas: ${deleteError.message}`)
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Kelas" title="Kelola rombel" action={<QuickActionButton icon={Plus} label="Tambah kelas" onClick={() => setEditing({ name: '', grade: 10, academicYear: '2026/2027' })} />} />
      {error && <div className="mb-4 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data kelas: {error}. Data lokal ditampilkan.</div>}
      {editing && <ClassForm classItem={editing} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label="Memuat kelas dari Supabase..." /> : (
        <DataTable columns={[
          { key: 'name', label: 'Kelas' },
          { key: 'grade', label: 'Tingkat' },
          { key: 'academic_year', label: 'Tahun Ajaran', render: (row) => row.academic_year || row.academicYear || '2026/2027' },
          { key: 'action', label: 'Aksi', render: (row) => <div className="flex gap-2"><button onClick={() => setEditing(row)} className="rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-extrabold text-galaxy-purple">Edit</button><button onClick={() => setDeleting(row)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">Hapus</button></div> },
        ]} rows={rows} />
      )}
      <ConfirmDialog open={Boolean(deleting)} title="Hapus kelas?" description={`Kelas "${deleting?.name || ''}" akan dihapus setelah konfirmasi.`} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  )
}

function ClassForm({ classItem, onCancel, onSave }) {
  const [form, setForm] = useState({ ...classItem, academicYear: classItem.academicYear || classItem.academic_year || '2026/2027' })
  return (
    <SectionCard className="mb-4">
      <h2 className="text-lg font-black text-gray-950">{form.id ? 'Edit kelas' : 'Tambah kelas'}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-gray-700">Nama kelas
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="rounded-xl border border-purple-100 bg-galaxy-surface px-3 py-2.5 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Tingkat
          <input type="number" value={form.grade} onChange={(event) => setForm((current) => ({ ...current, grade: event.target.value }))} className="rounded-xl border border-purple-100 bg-galaxy-surface px-3 py-2.5 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Tahun ajaran
          <input value={form.academicYear} onChange={(event) => setForm((current) => ({ ...current, academicYear: event.target.value }))} className="rounded-xl border border-purple-100 bg-galaxy-surface px-3 py-2.5 outline-none focus:border-purple-300" />
        </label>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-xl px-3 py-2 text-xs font-extrabold text-gray-600 hover:bg-gray-50">Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.name.trim()} className="rounded-xl bg-galaxy-action px-4 py-2.5 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">Simpan</button>
      </div>
    </SectionCard>
  )
}

function AdminMapel({ notify, appContext }) {
  const [rows, setRows] = useState([])
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function loadSubjects() {
      if (!appContext?.accessToken) {
        setRows(getLocalAdminCollection('subjects', subjects))
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const subjectRows = await fetchSubjects({ accessToken: appContext.accessToken })
        if (active) {
          setRows(subjectRows.length > 0 ? subjectRows.map((item) => ({ ...item, teacher: item.users_profile?.name || '-' })) : subjects)
          setError('')
        }
      } catch (loadError) {
        if (active) {
          setRows(getLocalAdminCollection('subjects', subjects))
          setError(loadError.message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    loadSubjects()
    return () => { active = false }
  }, [appContext?.accessToken])

  async function handleSave(subject) {
    if (!appContext?.accessToken) {
      const localSubject = { ...subject, id: subject.id || `local-subject-${Date.now()}` }

      setRows((current) => {
        const nextRows = subject.id
          ? current.map((item) => item.id === subject.id ? localSubject : item)
          : [localSubject, ...current]
        setLocalAdminCollection('subjects', nextRows)
        return nextRows
      })

      setEditing(null)
      notify('Mapel tersimpan lokal di perangkat.')
      return
    }
    try {
      const saved = await saveSubject({ accessToken: appContext.accessToken, subject })
      setRows((current) => subject.id ? current.map((item) => item.id === subject.id ? saved : item) : [saved, ...current])
      setEditing(null)
      notify('Mapel berhasil disimpan di Supabase.')
    } catch (saveError) {
      notify(`Gagal menyimpan mapel: ${saveError.message}`)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    if (!appContext?.accessToken || !isUuid(deleting.id)) {
      setRows((current) => {
        const nextRows = current.filter((item) => item.id !== deleting.id)
        setLocalAdminCollection('subjects', nextRows)
        return nextRows
      })
      setDeleting(null)
      notify('Mapel lokal dihapus dan tersimpan di perangkat.')
      return
    }
    try {
      await removeSubject({ accessToken: appContext.accessToken, id: deleting.id })
      setRows((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
      notify('Mapel berhasil dihapus.')
    } catch (deleteError) {
      notify(`Gagal menghapus mapel: ${deleteError.message}`)
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Mapel" title="Mata Pelajaran" action={<QuickActionButton icon={Plus} label="Tambah mapel" onClick={() => setEditing({ name: '', code: '' })} />} />
      {error && <div className="mb-4 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data mapel: {error}. Data lokal ditampilkan.</div>}
      {editing && <SubjectForm subject={editing} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label="Memuat mata pelajaran dari Supabase..." /> : (
        <DataTable columns={[
          { key: 'name', label: 'Nama Mapel' },
          { key: 'code', label: 'Kode' },
          { key: 'teacher', label: 'Guru Pengampu' },
          { key: 'action', label: 'Aksi', render: (row) => <div className="flex gap-2"><button onClick={() => setEditing(row)} className="rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-extrabold text-galaxy-purple">Edit</button><button onClick={() => setDeleting(row)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">Hapus</button></div> },
        ]} rows={rows} />
      )}
      <ConfirmDialog open={Boolean(deleting)} title="Hapus mapel?" description={`Mapel "${deleting?.name || ''}" akan dihapus setelah konfirmasi.`} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  )
}

function SubjectForm({ subject, onCancel, onSave }) {
  const [form, setForm] = useState(subject)
  return (
    <SectionCard className="mb-4">
      <h2 className="text-lg font-black text-gray-950">{form.id ? 'Edit mapel' : 'Tambah mapel'}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-gray-700">Nama mapel
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="rounded-xl border border-purple-100 bg-galaxy-surface px-3 py-2.5 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Kode
          <input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} className="rounded-xl border border-purple-100 bg-galaxy-surface px-3 py-2.5 outline-none focus:border-purple-300" />
        </label>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-xl px-3 py-2 text-xs font-extrabold text-gray-600 hover:bg-gray-50">Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.name.trim() || !form.code.trim()} className="rounded-xl bg-galaxy-action px-4 py-2.5 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">Simpan</button>
      </div>
    </SectionCard>
  )
}

function Pengaturan({ notify }) {
  return (
    <div><PageHeader eyebrow="Pengaturan" title="Pengaturan aplikasi" description="Identitas sekolah, semester, KKM, tema, AI, dan maintenance mode." /><SectionCard><div className="grid gap-3 md:grid-cols-2">{['Nama sekolah', 'Logo sekolah', 'Tahun ajaran', 'Semester', 'KKM', 'Tema warna', 'Pengaturan ujian', 'Pengaturan AI'].map((item) => <label key={item} className="grid gap-1 text-sm font-bold text-gray-700">{item}<input defaultValue={item === 'Nama sekolah' ? 'SMA Negeri 6 Pangkajene dan Kepulauan' : ''} className="rounded-xl border border-purple-100 bg-galaxy-surface px-3 py-2.5 outline-none" /></label>)}</div><button onClick={() => notify('Pengaturan tersimpan lokal di perangkat.')} className="mt-5 rounded-xl bg-galaxy-action px-4 py-2.5 text-xs font-extrabold text-white">Simpan pengaturan</button></SectionCard></div>
  )
}

function LaporanSekolah({ notify }) {
  return <ReportPage eyebrow="Laporan Sekolah" title="Aktivitas, nilai, ujian, dan remedial" notify={notify} />
}



function BackupPage({ notify, setConfirmOpen, appContext }) {
  const [exporting, setExporting] = useState(false)

  async function handleBackup() {
    if (!appContext?.accessToken) {
      const fallback = {
        exportedAt: new Date().toISOString(),
        app: 'IsleLearn',
        school: 'SMA Negeri 6 Pangkajene dan Kepulauan',
        data: { students, teachers, classes, subjects, materials, questions, quizzes },
      }
      downloadJson(fallback)
      notify('Backup JSON lokal berhasil dibuat.')
      return
    }

    try {
      setExporting(true)
      const backup = await exportBackupData({ accessToken: appContext.accessToken })
      downloadJson(backup)
      notify('Backup JSON Supabase berhasil dibuat.')
    } catch (backupError) {
      notify(`Gagal membuat backup: ${backupError.message}`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div><PageHeader eyebrow="Backup" title="Backup aman dan terkendali" /><SectionCard><StatusBadge tone="green">Backup JSON tersedia</StatusBadge><p className="mt-4 text-sm text-gray-500">Backup mengekspor data utama ke file JSON. Restore tetap dinonaktifkan karena berisiko menghapus atau menimpa data dan perlu konfirmasi berlapis.</p><div className="mt-4 flex flex-wrap gap-2"><QuickActionButton icon={Download} label={exporting ? 'Membuat backup...' : 'Backup sekarang'} onClick={handleBackup} /><button onClick={() => setConfirmOpen(true)} className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-extrabold text-rose-700">Restore dikunci</button></div></SectionCard></div>
  )
}

function downloadJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `islelearn-backup-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

function PimpinanDashboard() {
  const navigate = useNavigate()
  const practiceResults = getStoredResultsByPrefix('islelearn-practice-result-')
  const quizResults = getStoredResultsByPrefix('islelearn-quiz-result-')
  const assignmentSubmissions = readLocalRowsByPrefix('islelearn-assignment-submissions-')
  const localAverage = averageScore([...practiceResults, ...quizResults])
  const metricItems = [
    { label: 'Kelas', value: classes.length, caption: 'terpantau', icon: School },
    { label: 'Siswa', value: students.length, caption: 'akun aktif', icon: UsersRound },
    { label: 'Rata-rata', value: localAverage || '-', caption: 'nilai tersimpan', icon: Trophy },
    { label: 'Submission', value: assignmentSubmissions.length, caption: 'aktivitas masuk', icon: Target },
  ]
  const reportLinks = [
    { label: 'E-Rapor', onClick: () => navigate('/pimpinan/e-rapor'), icon: FileText },
    { label: 'Akademik', onClick: () => navigate('/pimpinan/laporan-akademik'), icon: BarChart3 },
    { label: 'Guru', onClick: () => navigate('/pimpinan/monitoring-guru'), icon: UsersRound },
    { label: 'Kelas', onClick: () => navigate('/pimpinan/monitoring-kelas'), icon: School },
    { label: 'Siswa', onClick: () => navigate('/pimpinan/monitoring-siswa'), icon: Target },
  ]

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[1.35rem] border border-[#123B63] bg-[#123B63] p-5 text-white shadow-[0_20px_52px_rgba(11,37,64,0.22)]">
        <div className="grid gap-4 xl:grid-cols-[1fr_22rem] xl:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-sky-200">Monitoring sekolah</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-white">Lihat kondisi belajar tanpa membuka banyak halaman.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-100/82">
              Ringkasan ini menyorot kelas, guru, siswa, dan laporan yang perlu dipantau lebih dulu.
            </p>
          </div>
          <DashboardActionGrid items={reportLinks} bare />
        </div>
      </section>

      <MetricStrip items={metricItems} />

      <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <DashboardPanel title="Perlu perhatian" description="Area yang sebaiknya dicek saat data sudah masuk.">
          <SetupSteps
            items={[
              { label: 'Kelas belum aktif', description: classes.length ? 'Pantau kelas dengan aktivitas rendah.' : 'Data kelas belum tersedia.', icon: School, actionLabel: 'Kelas', onClick: () => navigate('/pimpinan/monitoring-kelas') },
              { label: 'Aktivitas guru', description: teachers.length ? 'Lihat guru dengan materi terbaru.' : 'Data guru belum tersedia.', icon: UsersRound, actionLabel: 'Guru', onClick: () => navigate('/pimpinan/monitoring-guru') },
              { label: 'Nilai dan submission', description: assignmentSubmissions.length ? 'Lihat tren nilai dan aktivitas.' : 'Belum ada submission siswa.', icon: BarChart3, actionLabel: 'Laporan', onClick: () => navigate('/pimpinan/laporan-akademik') },
            ]}
          />
        </DashboardPanel>

        <DashboardPanel title="Ringkasan laporan" description="Arah baca untuk rapat atau monitoring harian.">
          <div className="space-y-2">
            {[
              ['Akademik', localAverage ? `Rata-rata ${localAverage}` : 'Belum ada nilai'],
              ['Aktivitas', `${assignmentSubmissions.length} submission tersimpan`],
              ['Kesiapan data', classes.length && students.length ? 'Data utama tersedia' : 'Data utama belum lengkap'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[#D9E6F5] bg-[#F8FBFF] px-3 py-3">
                <p className="text-sm font-black text-[#132437]">{label}</p>
                <p className="mt-1 text-xs font-semibold text-[#64748B]">{value}</p>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>
    </div>
  )
}


function GraduationCapIcon(props) {
  return <School {...props} />
}

function MonitoringKelas() {
  return <CardsPage eyebrow="Monitoring Kelas" title="Aktivitas dan progress kelas" items={classes.map((c) => ({ title: c.name, meta: `${c.students} siswa · rata-rata ${c.average}`, value: `${c.progress}% progress`, status: 'Aktif' }))} />
}

function MonitoringGuru() {
  return <CardsPage eyebrow="Monitoring Guru" title="Aktivitas guru" items={teachers.map((t) => ({ title: t.name, meta: `${t.subject} · ${t.classIds.length} kelas`, value: `${t.materialsCreated} materi`, status: t.lastActive }))} />
}

function MonitoringSiswa() {
  return <AdminTable title="Monitoring Siswa" rows={students} columns={[['name', 'Nama'], ['className', 'Kelas'], ['xp', 'XP'], ['streak', 'Streak'], ['status', 'Status']]} button="Filter kelas" />
}

function LaporanAkademik({ notify }) {
  return <ReportPage eyebrow="Laporan Akademik" title="Nilai rata-rata per kelas dan mapel" notify={notify} />
}

function LaporanAktivitas({ notify }) {
  return <ReportPage eyebrow="Laporan Aktivitas" title="Login, belajar, guru, dan ujian" notify={notify} />
}

function ManageList({ eyebrow, title, rows, button, notify, type, emptyTitle, emptyDescription }) {
  return (
    <div>
      <PageHeader eyebrow={eyebrow} title={title} action={<QuickActionButton icon={Plus} label={button} onClick={() => notify(`${button} dibuka.`)} />} />
      {rows.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{rows.map((row) => <SectionCard key={row.id}><StatusBadge tone={statusTone(row.status)}>{row.status || row.subject}</StatusBadge><h2 className="mt-4 text-lg font-extrabold">{row.title || row.student}</h2><p className="mt-2 text-sm leading-6 text-gray-500">{row.description || row.subject || row.topic} {row.deadline ? `· Deadline ${row.deadline}` : ''}</p><button onClick={() => notify(`Membuka detail ${type}.`)} className="mt-5 rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-extrabold text-galaxy-purple">Detail</button></SectionCard>)}</div>
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </div>
  )
}

function AdminTable({ title, rows, columns, button, notify = () => {}, setConfirmOpen = () => {} }) {
  return (
    <div><PageHeader eyebrow="Manajemen Data" title={title} action={<QuickActionButton icon={Plus} label={button} onClick={() => notify(`${button} masih dikunci untuk keamanan data.`)} />} /><DataTable columns={[...columns.map(([key, label]) => ({ key, label, render: key === 'classes' ? (row) => row.classes.join(', ') : undefined })), { key: 'action', label: 'Aksi', render: () => <button onClick={() => setConfirmOpen(true)} className="rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-extrabold text-galaxy-purple">Edit</button> }]} rows={rows} /></div>
  )
}

function CardsPage({ eyebrow, title, items, action }) {
  return (
    <div>
      <PageHeader eyebrow={eyebrow} title={title} action={action} />
      {items.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <SectionCard key={`${item.title}-${item.meta}`}>
              <StatusBadge>{item.status}</StatusBadge>
              <h2 className="mt-3 text-lg font-black">{item.title}</h2>
              <p className="mt-2 text-sm text-gray-500">{item.meta}</p>
              <p className="mt-3 text-xl font-black text-galaxy-purple">{item.value}</p>
              <button className="mt-5 w-full rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-extrabold text-galaxy-purple">Detail</button>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Belum ada data"
          description="Data akan muncul setelah terhubung ke database atau dibuat dari menu terkait."
        />
      )}
    </div>
  )
}


function downloadTextFile(filename, content, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function rowsToCsv(rows) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escapeCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
  return [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(',')),
  ].join('\n')
}

function slugFileName(text) {
  return String(text || 'laporan')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function ReportPage({ eyebrow, title, notify }) {
  const reportRows = scoreTrend.map((item) => ({
    bulan: item.name,
    nilai_rata_rata: item.nilai,
    aktivitas_belajar: item.aktivitas,
  }))

  const reportMeta = {
    judul: title,
    kategori: eyebrow,
    tanggal_export: new Date().toISOString(),
    jumlah_baris: reportRows.length,
    data: reportRows,
  }

  function handlePrint() {
    window.print()
    notify('Dialog cetak dibuka. Pilih Save as PDF untuk menyimpan laporan.')
  }

  function handleExportCsv() {
    const csv = rowsToCsv(reportRows)
    downloadTextFile(`${slugFileName(title)}.csv`, '\ufeff' + csv, 'text/csv;charset=utf-8')
    notify('Laporan CSV berhasil diunduh.')
  }

  function handleExportJson() {
    downloadTextFile(`${slugFileName(title)}.json`, JSON.stringify(reportMeta, null, 2), 'application/json;charset=utf-8')
    notify('Laporan JSON berhasil diunduh.')
  }

  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        action={
          <div className="flex flex-wrap gap-2">
            <QuickActionButton icon={Download} label="Cetak / PDF" onClick={handlePrint} />
            <QuickActionButton icon={Download} label="Export CSV" onClick={handleExportCsv} />
            <QuickActionButton icon={Download} label="Export JSON" onClick={handleExportJson} />
          </div>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatCard label="Rata-rata akhir" value={reportRows.at(-1)?.nilai_rata_rata || '-'} tone="purple" />
        <StatCard label="Aktivitas akhir" value={reportRows.at(-1)?.aktivitas_belajar || '-'} tone="cyan" />
        <StatCard label="Periode data" value={reportRows.length} tone="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Trend nilai">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={scoreTrend}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line dataKey="nilai" stroke="#0284C7" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </DashboardCard>

        <DashboardCard title="Aktivitas belajar">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={scoreTrend}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="aktivitas" fill="#22D3EE" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>
      </div>

      <SectionCard className="mt-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Data Laporan</p>
            <h2 className="text-xl font-black text-slate-950">Ringkasan nilai dan aktivitas</h2>
          </div>
          <StatusBadge tone="green">Siap export</StatusBadge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="py-3 pr-4 font-extrabold">Bulan</th>
                <th className="py-3 pr-4 font-extrabold">Nilai rata-rata</th>
                <th className="py-3 pr-4 font-extrabold">Aktivitas belajar</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.map((row) => (
                <tr key={row.bulan} className="border-b border-slate-50">
                  <td className="py-3 pr-4 font-bold text-slate-800">{row.bulan}</td>
                  <td className="py-3 pr-4 text-slate-600">{row.nilai_rata_rata}</td>
                  <td className="py-3 pr-4 text-slate-600">{row.aktivitas_belajar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}

function statusTone(status) {
  if (['Aktif', 'Berlangsung', 'Selesai', 'Terkirim', 'Publish'].includes(status)) return 'green'
  if (['Draft', 'Belum mulai', 'Belum Mulai', 'Dipelajari'].includes(status)) return 'amber'
  if (['Terlambat', 'Dikunci', 'Perlu latihan', 'Perlu perhatian'].includes(status)) return 'red'
  return 'teal'
}
