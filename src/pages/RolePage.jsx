import { Fragment, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Award,
  ArrowLeft,
  Atom,
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  Calculator,
  CalendarClock,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Download,
  FileText,
  FileQuestion,
  FlaskConical,
  Globe2,
  Handshake,
  Landmark,
  Languages,
  Layers3,
  Link2,
  Microscope,
  Palette,
  Megaphone,
  PencilLine,
  PlayCircle,
  Plus,
  Printer,
  Radio,
  Save,
  Scale,
  School,
  Search,
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
import { exportBackupData, fetchAdminStudents, fetchAdminTeachers, fetchClasses, fetchSubjects, removeAdminStudent, removeAdminTeacher, removeClass, saveAdminStudent, saveAdminTeacher, saveClass } from '../services/adminService.js'
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
  subscribeToSharedSchoolDataChanges,
} from '../utils/localLearningStore.js'
import {
  getHomeroomAssignmentForUser,
  getHomeroomAssignments,
  getHomeroomClassesForUser,
  isTeacherHomeroom,
  promoteHomeroomClassName,
  setHomeroomAssignments,
} from '../utils/homeroomAccess.js'

const ContentStudio = lazy(() => import('./ContentStudio.jsx'))

export default function RolePage({ role, page }) {
  const { user, accessToken, supabaseEnabled } = useAuth()
  const [toast, setToast] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [schoolDataRevision, setSchoolDataRevision] = useState(0)
  const notify = (message) => setToast(message)

  useEffect(() => subscribeToSharedSchoolDataChanges(() => {
    setSchoolDataRevision((revision) => revision + 1)
  }), [])

  const content = useMemo(() => {
    if (role === 'siswa') return renderSiswa(page, user, notify, { accessToken, supabaseEnabled })
    if (role === 'guru') return renderGuru(page, user, notify, setConfirmOpen, { accessToken, supabaseEnabled })
    if (role === 'admin') return renderAdmin(page, user, notify, setConfirmOpen, { accessToken, supabaseEnabled })
    return renderPimpinan(page, user, notify)
  }, [role, page, user, accessToken, supabaseEnabled, schoolDataRevision])

  return (
    <>
      <Fragment key={`${role}-${page}-${schoolDataRevision}`}>{content}</Fragment>
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
  if (page === 'rapor') {
    if (!isTeacherHomeroom(user)) {
      return <GuruRaporAccessDenied />
    }
    return <GuruRapor user={user} notify={notify} />
  }
  if (page === 'analisis-nilai') return <AnalisisNilai />
  if (page === 'remedial') return <RemedialPage notify={notify} />
  if (page === 'ai-generator') return <AIGeneratorPage />
  if (page === 'laporan') return <LaporanGuru notify={notify} />
  if (page === 'profil') return <ProfilPage user={user} />
  return <EmptyState />
}

function GuruRaporAccessDenied() {
  const navigate = useNavigate()
  return (
    <EmptyState
      title="Rapor hanya untuk wali kelas."
      description="Guru mapel tetap menginput nilai melalui Daftar Nilai. Admin dapat menetapkan wali kelas agar guru tertentu bisa membuka Rapor."
      action={<QuickActionButton icon={BarChart3} label="Buka Daftar Nilai" onClick={() => navigate('/guru/daftar-nilai')} />}
    />
  )
}

function renderAdmin(page, user, notify, setConfirmOpen, appContext) {
  if (page === 'dashboard') return <AdminDashboard />
  if (page === 'guru') return <AdminProfiles role="guru" title="Data Guru" notify={notify} appContext={appContext} />
  if (page === 'siswa') return <AdminProfiles role="siswa" title="Data Siswa" notify={notify} appContext={appContext} />
  if (page === 'kelas') return <AdminKelas notify={notify} appContext={appContext} />
  if (page === 'wali-kelas') return <AdminWaliKelas notify={notify} />
  if (page === 'mapel') return <AdminMapel notify={notify} appContext={appContext} />
  if (page === 'daftar-hadir') return <GuruDaftarHadir user={user} notify={notify} />
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
  if (page === 'laporan-akademik') return <LaporanAkademik notify={notify} />
  if (page === 'laporan-aktivitas') return <LaporanAktivitas notify={notify} />
  return <EmptyState />
}

function SiswaDashboard({ user, notify }) {
  const firstName = user?.name?.split(' ')[0] || 'Siswa'
  const navigate = useNavigate()
  const userId = user?.id || 'demo'
  const studentClassName = user?.className || (user?.id === 'local-preview-siswa' ? 'XI Utsman Bin Affan' : 'Kelas XI')
  const studentGrade = extractGrade(studentClassName)
  const completedMaterials = getCompletedMaterials(userId)
  const availableMaterials = getAvailablePublishedMaterials()
  const gradeMaterials = availableMaterials.filter((item) => !studentGrade || extractGrade(item.className) === studentGrade)
  const practiceResults = getStoredResultsByPrefix('islelearn-practice-result-')
  const quizResults = getStoredResultsByPrefix(`islelearn-quiz-result-${userId}-`)
  const assignmentSubmissions = readLocalRowsByPrefix('islelearn-assignment-submissions-').filter((item) => item.userId === userId)
  const average = averageScore([...practiceResults, ...quizResults])
  const learningProgress = Math.min(100, completedMaterials.length * 20 + practiceResults.length * 10 + quizResults.length * 15 + assignmentSubmissions.length * 15)
  const normalizedProgress = Math.max(0, Math.min(100, learningProgress))

  const classAssignments = assignments.filter((item) => !user?.className || item.className === user.className)
  const activeAssignments = classAssignments.filter((item) => ['Aktif', 'Terlambat'].includes(item.status))
  const activeQuizzes = quizzes.filter((item) => ['Berlangsung', 'Belum mulai'].includes(item.status))
  const continuingMaterials = gradeMaterials
    .filter((item) => item.status !== 'Selesai')
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3)
  const nextMaterial = continuingMaterials[0] || gradeMaterials[0]
  const nextProgress = Math.min(100, Number(nextMaterial?.progress || 0))
  const todayWorkCount = activeAssignments.length + activeQuizzes.length

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

  const featureTiles = [
    {
      label: 'Belajar',
      caption: `${gradeMaterials.length} materi kelasmu`,
      icon: BookOpen,
      path: '/siswa/materi',
      tone: 'from-[#DCEEFF] to-[#F8FBFF] text-[#17446E] ring-[#B9D8F7]',
    },
    {
      label: 'Tugas',
      caption: `${activeAssignments.length} perlu dicek`,
      icon: ClipboardList,
      path: '/siswa/tugas',
      tone: 'from-[#FFF3D7] to-[#F8FBFF] text-amber-800 ring-amber-100',
    },
    {
      label: 'Kuis',
      caption: `${activeQuizzes.length} aktif`,
      icon: FileQuestion,
      path: '/siswa/kuis',
      tone: 'from-[#DCFCE7] to-[#F8FBFF] text-emerald-800 ring-emerald-100',
    },
    {
      label: 'Laporan Belajar',
      caption: average ? `Rata-rata ${average}` : `${learningProgress}% progres`,
      icon: LineChartIcon,
      path: '/siswa/progres',
      tone: 'from-[#E8F2FF] to-[#F8FBFF] text-[#17446E] ring-[#B9D8F7]',
    },
    {
      label: 'AI Tutor',
      caption: 'Tanya konsep sulit',
      icon: Bot,
      path: '/siswa/ai-tutor',
      tone: 'from-[#EEF7FF] to-[#F8FBFF] text-[#2F80D8] ring-[#B9D8F7]',
    },
    {
      label: 'Flashcard',
      caption: 'Review cepat',
      icon: Layers3,
      path: '/siswa/flashcard',
      tone: 'from-[#F1F5F9] to-[#F8FBFF] text-slate-800 ring-slate-200',
    },
  ]

  const metricItems = [
    { label: 'Progres', value: `${normalizedProgress}%`, caption: `${completedMaterials.length} materi selesai`, icon: BarChart3 },
    { label: 'Prioritas', value: todayWorkCount, caption: 'tugas/kuis aktif', icon: ClipboardCheck },
    { label: 'Aktivitas', value: practiceResults.length + quizResults.length + assignmentSubmissions.length, caption: 'latihan dan submission', icon: CalendarClock },
    { label: 'Rata-rata', value: average || '-', caption: 'nilai tersimpan', icon: Award },
  ]

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[1.35rem] bg-white shadow-[0_18px_52px_rgba(15,36,55,0.07)] ring-1 ring-[#D9E6F5]">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="bg-[linear-gradient(135deg,#17446E_0%,#2F80D8_72%,#DDF2FF_100%)] p-5 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-xl bg-white/16 px-3 py-1.5 text-xs font-black ring-1 ring-white/18">{studentClassName}</span>
              <span className="rounded-xl bg-white/16 px-3 py-1.5 text-xs font-black ring-1 ring-white/18">Kurikulum Merdeka</span>
            </div>
            <h2 className="mt-4 max-w-3xl text-balance text-3xl font-black leading-tight sm:text-[2.2rem]">
              Halo, {firstName}. Cek progres dan lanjutkan yang penting dulu.
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-sky-100/88">
              Dashboard ini untuk ringkasan. Pilih mapel dan daftar bab tetap ada di menu Belajar.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl bg-white/14 px-3 py-2 ring-1 ring-white/18">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-sky-100">Progres</p>
                <p className="mt-1 font-mono text-2xl font-black">{normalizedProgress}%</p>
              </div>
              <div className="rounded-xl bg-white/14 px-3 py-2 ring-1 ring-white/18">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-sky-100">Prioritas</p>
                <p className="mt-1 font-mono text-2xl font-black">{todayWorkCount}</p>
              </div>
              <div className="rounded-xl bg-white/14 px-3 py-2 ring-1 ring-white/18">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-sky-100">Rata-rata</p>
                <p className="mt-1 font-mono text-2xl font-black">{average || '-'}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/siswa/materi')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-[#123B63] shadow-[0_12px_24px_rgba(5,20,35,0.18)] transition hover:-translate-y-0.5 hover:bg-[#EAF4FF] active:translate-y-0"
              >
                <BookOpen size={16} /> Buka Belajar
              </button>
              <button
                onClick={() => navigate('/siswa/tugas')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-black text-white ring-1 ring-white/18 transition hover:-translate-y-0.5 hover:bg-white/16 active:translate-y-0"
              >
                <ClipboardCheck size={16} /> Cek tugas
              </button>
            </div>
          </div>

          <article className="flex min-h-full flex-col justify-between bg-[#F8FBFF] p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#2F80D8]">Lanjut terdekat</p>
              <h3 className="mt-3 text-xl font-black leading-tight text-[#132437]">
                {nextMaterial ? nextMaterial.title : 'Belum ada materi aktif'}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-[#64748B]">
                {nextMaterial ? `${nextMaterial.subject} · ${nextMaterial.topic || studentClassName}` : 'Materi akan muncul setelah guru mempublish bahan belajar.'}
              </p>
            </div>
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-black text-[#64748B]">
                <span>Progress materi</span>
                <span>{nextProgress}%</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-white ring-1 ring-[#D9E6F5]">
                <div className="h-3 rounded-full bg-[#2F80D8]" style={{ width: `${nextProgress}%` }} />
              </div>
            </div>
            <button
              onClick={() => navigate('/siswa/materi')}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#17446E] px-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#2F80D8]"
            >
              <PlayCircle size={16} /> Buka materi
            </button>
          </article>
        </div>
      </section>

      <MetricStrip items={metricItems} />

      <div className={`grid gap-4 ${priorityItems.length > 0 && materialItems.length > 0 ? 'xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]' : ''}`}>
        {priorityItems.length > 0 && (
          <CompactList
            title="Prioritas hari ini"
            description="Tugas dan kuis terdekat ditaruh paling atas."
            items={priorityItems}
          />
        )}

        <CompactList
          title="Lanjutkan materi"
          items={materialItems}
          emptyLabel="Materi belum tersedia untuk kelas ini. Cek kembali nanti atau tanya guru."
        />
      </div>

      <section className="rounded-[1.15rem] bg-white p-3 shadow-[0_10px_28px_rgba(15,36,55,0.045)] ring-1 ring-[#D9E6F5]">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-[#132437]">Akses cepat siswa</h2>
            <p className="mt-1 text-sm font-semibold text-[#64748B]">Menu utama tanpa mengulang daftar mapel.</p>
          </div>
          <span className="text-xs font-black uppercase tracking-[0.12em] text-[#2F80D8]">{featureTiles.length} menu</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {featureTiles.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`group flex min-h-16 items-center gap-3 rounded-[0.95rem] bg-gradient-to-br px-3 py-2 text-left ring-1 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,36,55,0.08)] ${item.tone}`}
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/82 shadow-sm ring-1 ring-white/80">
                  <Icon size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black">{item.label}</span>
                  <span className="mt-0.5 block truncate text-xs font-bold opacity-75">{item.caption}</span>
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function StudentSubjectGrid({ subjectTiles = [], activeSubjectKey = '', onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
      {subjectTiles.map((subject) => {
        const Icon = subject.icon
        const active = activeSubjectKey === subject.key
        return (
          <button
            key={subject.key}
            data-testid={`student-subject-${subject.key}`}
            onClick={() => onSelect?.(subject)}
            className={`group min-h-[8.75rem] rounded-[1rem] border bg-white p-3 text-center transition hover:-translate-y-0.5 hover:border-[#B9D8F7] hover:shadow-[0_16px_34px_rgba(15,36,55,0.08)] ${
              active
                ? 'border-[#2F80D8] shadow-[0_16px_34px_rgba(47,128,216,0.14)]'
                : 'border-[#E5EDF7] shadow-[0_10px_24px_rgba(15,36,55,0.035)]'
            }`}
          >
            <span className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ring-1 ${subject.tone}`}>
              <Icon size={26} />
            </span>
            <span className="mt-3 block min-h-[2.5rem] text-sm font-black leading-tight text-[#132437]">{subject.shortName}</span>
            <span className="mt-2 inline-flex rounded-full bg-[#F8FBFF] px-2.5 py-1 text-[11px] font-black text-[#64748B] ring-1 ring-[#D9E6F5]">
              {subject.count || 0} materi
            </span>
          </button>
        )
      })}
    </div>
  )
}

function DashboardColorGrid({ items = [] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Kartu dashboard">
      {items.map((item) => <DashboardColorCard key={item.label} {...item} />)}
    </section>
  )
}

function DashboardColorCard({ label, value, caption, icon: Icon = Sparkles, tone = 'blue', onClick }) {
  const tones = {
    blue: 'from-[#DCEEFF] to-[#F8FBFF] text-[#17446E] ring-[#B9D8F7]',
    cyan: 'from-[#DDF7FF] to-[#F8FBFF] text-[#087EA4] ring-[#B7ECF8]',
    green: 'from-[#DCFCE7] to-[#F8FBFF] text-emerald-800 ring-emerald-100',
    amber: 'from-[#FFF3D7] to-[#F8FBFF] text-amber-800 ring-amber-100',
    rose: 'from-[#FFE4E6] to-[#F8FBFF] text-rose-800 ring-rose-100',
    slate: 'from-[#EAF4FF] to-[#F8FBFF] text-[#132437] ring-[#D9E6F5]',
  }
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/78 shadow-[0_10px_24px_rgba(15,36,55,0.08)] ring-1 ring-white/80">
          <Icon size={19} />
        </span>
        <span className="rounded-lg bg-white/64 px-2.5 py-1 text-[11px] font-black ring-1 ring-white/70">{label}</span>
      </div>
      <p className="mt-5 font-mono text-3xl font-black leading-none">{value}</p>
      <p className="mt-2 line-clamp-2 text-sm font-bold leading-5 opacity-80">{caption}</p>
    </>
  )
  const className = `min-h-[9rem] rounded-[1.1rem] bg-gradient-to-br p-4 text-left shadow-[0_14px_34px_rgba(15,36,55,0.07)] ring-1 transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(15,36,55,0.10)] ${tones[tone] || tones.blue}`

  return onClick ? (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  ) : (
    <article className={className}>{content}</article>
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

const studentSubjectVisualRules = [
  { match: 'matematika', icon: Calculator, tone: 'bg-[#E8F2FF] text-[#2563EB] ring-[#B9D8F7]' },
  { match: 'bahasa indonesia', icon: BookOpen, tone: 'bg-[#F0F7FF] text-[#17446E] ring-[#B9D8F7]' },
  { match: 'bahasa inggris', icon: Languages, tone: 'bg-[#EEF7FF] text-[#2F80D8] ring-[#B9D8F7]' },
  { match: 'biologi', icon: Microscope, tone: 'bg-[#E8F8EF] text-emerald-700 ring-emerald-100' },
  { match: 'kimia', icon: FlaskConical, tone: 'bg-[#FFF6DE] text-amber-700 ring-amber-100' },
  { match: 'fisika', icon: Atom, tone: 'bg-[#ECFEFF] text-cyan-700 ring-cyan-100' },
  { match: 'ekonomi', icon: BarChart3, tone: 'bg-[#FFF6DE] text-amber-800 ring-amber-100' },
  { match: 'geografi', icon: Globe2, tone: 'bg-[#DCFCE7] text-green-700 ring-green-100' },
  { match: 'sejarah', icon: Landmark, tone: 'bg-[#F1F5F9] text-slate-700 ring-slate-200' },
  { match: 'pancasila', icon: Scale, tone: 'bg-[#E0F2FE] text-sky-700 ring-sky-100' },
  { match: 'seni', icon: Palette, tone: 'bg-[#FFF6DE] text-amber-800 ring-amber-100' },
  { match: 'jasmani', icon: Trophy, tone: 'bg-[#FEF3C7] text-yellow-800 ring-yellow-100' },
  { match: 'prakarya', icon: Handshake, tone: 'bg-[#F1F5F9] text-slate-700 ring-slate-200' },
  { match: 'informatika', icon: LaptopIcon, tone: 'bg-[#E0F2FE] text-[#0369A1] ring-sky-100' },
]

const studentSubjectFallbackTones = [
  'bg-[#E8F2FF] text-[#2563EB] ring-[#B9D8F7]',
  'bg-[#FFF6DE] text-amber-700 ring-amber-100',
  'bg-[#E8F8EF] text-emerald-700 ring-emerald-100',
  'bg-[#F0F7FF] text-[#17446E] ring-[#B9D8F7]',
  'bg-[#EEF7FF] text-[#2F80D8] ring-[#B9D8F7]',
  'bg-[#ECFEFF] text-cyan-700 ring-cyan-100',
]

function LaptopIcon(props) {
  return <School {...props} />
}

function getStudentSubjectVisual(subjectName, index = 0) {
  const normalized = normalizeLookupText(subjectName)
  const matched = studentSubjectVisualRules.find((rule) => normalized.includes(normalizeLookupText(rule.match)))
  if (matched) return matched
  return {
    icon: BookOpen,
    tone: studentSubjectFallbackTones[index % studentSubjectFallbackTones.length],
  }
}

function getStudentSubjectShortLabel(subjectName) {
  const normalized = normalizeLookupText(subjectName)
  if (normalized.includes('pendidikanagamaislam')) return 'Pendidikan Agama'
  if (normalized.includes('pendidikanjasmani')) return 'PJOK'
  if (normalized.includes('matematikaumum')) return 'Matematika'
  if (normalized.includes('pendidikanpancasila')) return 'PKN'
  if (normalized.includes('prakaryadankewirausahaan')) return 'Prakarya'
  return subjectName
}

function KelasSaya() {
  const navigate = useNavigate()
  const visibleSubjects = subjects.slice(0, 5)
  return (
    <div>
      <PageHeader
        eyebrow="Belajar"
        title="Kelas dan materi sekarang digabung."
        description="Agar siswa tidak masuk lewat dua jalur berbeda, semua mapel dan materi dibuka dari halaman Belajar."
        action={<QuickActionButton icon={BookOpen} label="Buka Belajar" onClick={() => navigate('/siswa/materi')} />}
      />
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
              <button onClick={() => navigate('/siswa/materi')} className="mt-5 w-full rounded-xl bg-[#17446E] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#2F80D8]">Lihat materi</button>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState title="Belum ada kelas." description="Materi belum tersedia untuk kelas ini. Cek kembali nanti atau tanya guru." action={<QuickActionButton icon={BookOpen} label="Buka Belajar" onClick={() => navigate('/siswa/materi')} />} />
      )}
    </div>
  )
}


function getPublishedLocalTeacherMaterials() {
  return publishHtmlMaterialRows(readLocalRowsByPrefix('islelearn-teacher-materials-'))
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

function isHtmlMaterial(row) {
  const type = String(row?.type || '').trim().toLowerCase()
  const content = String(row?.content || '').trim()
  if (isAdvancedMaterialContent(content)) return false
  return type === 'html' || /\.html(?:[?#].*)?$/i.test(content)
}

function publishHtmlMaterial(row) {
  if (!row || !isHtmlMaterial(row)) return row
  const progress = Number(row.progress || 0)
  return {
    ...row,
    type: row.type || 'HTML',
    status: 'Publish',
    progress: Math.max(progress, 35),
  }
}

function publishHtmlMaterialRows(rows = []) {
  return Array.isArray(rows) ? rows.map((row) => publishHtmlMaterial(row)) : []
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
    .filter((item) => item && item.status === 'Aktif' && isAssignmentReleased(item))
    .map((item) => ({
      ...item,
      source: item.source || 'local',
      subject: item.subject || 'Mata pelajaran',
      className: item.className || 'Kelas umum',
      classNames: normalizeAssignmentClassNames(item),
      teacher: item.teacher || 'Guru',
      description: item.description || 'Instruksi tugas belum diisi lengkap.',
      deadline: item.deadline || '',
      submissionTypes: normalizeAssignmentSubmissionTypes(item.submissionTypes),
      attachments: normalizeAssignmentAttachments(item.attachments),
      rubricRows: normalizeAssignmentRubricRows(item.rubricRows || item.rubric),
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
  ]).filter((item) => item && item.status !== 'Draft' && isMaterialReleased(item))
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

  const studentClassName = user?.className || (user?.id === 'local-preview-siswa' ? 'XI Utsman Bin Affan' : '')
  const studentGrade = extractGrade(studentClassName)
  const data = getAvailablePublishedMaterials(remoteMaterials)
    .filter((item) => !studentGrade || extractGrade(item.className) === studentGrade)
  const statusFilters = ['Semua', 'Selesai', 'Dipelajari', 'Belum Mulai']
  const enriched = data.map((item) => {
    if (completedIds.includes(item.id)) return { ...item, status: 'Selesai', progress: 100 }
    if (item.status === 'Publish') return { ...item, status: Number(item.progress || 0) > 0 ? 'Dipelajari' : 'Belum Mulai' }
    return item
  })
  const statusRows = enriched.filter((item) => filter === 'Semua' || item.status === filter)
  const materialFolders = getMaterialSubjectFolders(enriched).filter((folder) => folder.rows.length > 0)
  const [activeSubjectKey, setActiveSubjectKey] = useState('')
  const materialFolderKeys = materialFolders.map((folder) => folder.key).join('|')
  const activeFolder = materialFolders.find((folder) => folder.key === activeSubjectKey) || null
  const activeRows = activeFolder ? statusRows.filter((item) => normalizeLookupText(canonicalSubjectName(item.subject)) === activeFolder.key) : []
  const searchQuery = search.trim().toLowerCase()
  const visibleRows = activeRows.filter((item) => {
    if (!searchQuery) return true
    return [item.title, item.description, item.topic, item.className, item.subject]
      .some((value) => String(value || '').toLowerCase().includes(searchQuery))
  })
  const visibleGradeFolders = getMaterialGradeFolders(visibleRows).filter((gradeFolder) => gradeFolder.rows.length > 0)
  const subjectTiles = materialFolders.map((folder, index) => {
    const visual = getStudentSubjectVisual(folder.name, index)
    const totalProgress = folder.rows.reduce((total, item) => total + Number(item.progress || 0), 0)
    return {
      ...visual,
      key: folder.key,
      name: folder.name,
      shortName: getStudentSubjectShortLabel(folder.name),
      count: folder.rows.length,
      progress: folder.rows.length ? Math.round(totalProgress / folder.rows.length) : 0,
    }
  })

  useEffect(() => {
    if (activeSubjectKey && !materialFolders.some((folder) => folder.key === activeSubjectKey)) {
      setActiveSubjectKey('')
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
      <section className="overflow-hidden rounded-[1.35rem] border border-[#D9E6F5] bg-white shadow-[0_18px_52px_rgba(15,36,55,0.08)]">
        <div className="bg-[linear-gradient(135deg,#17446E_0%,#2F80D8_66%,#DDF2FF_100%)] px-5 pb-16 pt-7 text-white">
          <p className="text-sm font-black">Mau belajar apa hari ini?</p>
          <h1 className="mt-2 max-w-3xl text-balance text-3xl font-black leading-tight sm:text-4xl">
            Pilih mapel, lalu lanjutkan bab yang tersedia untuk kelasmu.
          </h1>
        </div>

        <div className="-mt-9 px-4 pb-4">
          <div className="grid gap-3 rounded-[1.15rem] bg-white p-3 shadow-[0_16px_42px_rgba(15,36,55,0.12)] ring-1 ring-[#D9E6F5] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <label className="flex min-h-14 min-w-0 items-center gap-3 rounded-[0.95rem] bg-white px-4 text-left text-[#64748B] ring-1 ring-[#D9E6F5] transition focus-within:ring-[#2F80D8]">
              <Search size={22} className="shrink-0 text-[#17446E]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Coba cari materi belajarmu di sini"
                className="min-w-0 flex-1 bg-transparent text-base font-bold text-[#132437] outline-none placeholder:text-[#94A3B8]"
              />
            </label>

            <button
              type="button"
              className="flex min-h-14 items-center justify-between gap-4 rounded-[0.95rem] border border-[#B9D8F7] bg-[#F8FBFF] px-4 text-sm font-black text-[#132437] lg:min-w-[18rem]"
            >
              <span className="min-w-0 truncate">{studentClassName || 'Kelas'} · Kurikulum Merdeka</span>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#2F80D8] text-white">
                <ChevronDown size={17} />
              </span>
            </button>
          </div>
        </div>
      </section>

      {error && <div className="rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data materi: {error}. Data lokal tetap ditampilkan.</div>}

      {!activeFolder ? (
        <section className="rounded-[1.35rem] border border-[#D9E6F5] bg-white p-4 shadow-[0_12px_36px_rgba(15,36,55,0.055)]">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#132437]">IsleBelajar</h2>
              <p className="mt-1 text-sm font-semibold text-[#64748B]">Pilih mapel seperti membuka folder belajar.</p>
            </div>
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#2F80D8]">{subjectTiles.length} mapel</span>
          </div>

          {subjectTiles.length > 0 ? (
            <StudentSubjectGrid
              subjectTiles={subjectTiles}
              activeSubjectKey=""
              onSelect={(subject) => {
                setActiveSubjectKey(subject.key)
                setSearch('')
                setFilter('Semua')
              }}
            />
          ) : (
            <EmptyState title="Belum ada mapel." description="Materi yang dipublish guru akan muncul sebagai daftar mapel di sini." />
          )}
        </section>
      ) : (
        <section className="min-w-0 overflow-hidden rounded-[1.15rem] border border-[#D9E6F5] bg-white shadow-[0_14px_44px_rgba(15,31,42,0.065)]">
          <header className="grid gap-4 border-b border-[#D9E6F5] bg-[#F8FAFC]/82 px-4 py-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,34rem)] xl:items-center">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => {
                  setActiveSubjectKey('')
                  setSearch('')
                  setFilter('Semua')
                }}
                className="mb-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#17446E] px-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(23,68,110,0.16)] transition hover:bg-[#2F80D8]"
              >
                <ArrowLeft size={16} /> Kembali ke daftar mapel
              </button>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#2F80D8]">Folder mapel</p>
              <h2 className="break-words text-2xl font-black leading-tight text-[#132437] sm:text-3xl">{activeFolder.name}</h2>
              <p className="mt-1 text-sm font-semibold text-[#64748B]">
                {activeFolder.rows.length} materi tersedia untuk kelasmu.
              </p>
            </div>
            <div className="min-w-0">
              <SearchFilterBar search={search} setSearch={setSearch} filters={statusFilters} activeFilter={filter} setActiveFilter={setFilter} />
            </div>
          </header>

          {loading ? <div className="p-4"><LoadingState label="Memuat materi dari Supabase..." /></div> : (
            visibleGradeFolders.length > 0 ? (
              <div className="divide-y divide-[#D9E6F5]">
                {visibleGradeFolders.map((gradeFolder) => (
                  <StudentMaterialGradeFolder
                    key={gradeFolder.key}
                    gradeFolder={gradeFolder}
                    onOpen={setSelected}
                    defaultOpen
                  />
                ))}
              </div>
            ) : (
              <div className="p-4">
                <EmptyState title="Materi tidak ditemukan." description="Coba ganti kata pencarian atau status filter." />
              </div>
            )
          )}
        </section>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[1.35rem] border border-[#0284c7]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(224,242,254,0.72),rgba(248,250,252,0.88))] p-4 shadow-[0_18px_52px_rgba(15,31,42,0.07)] backdrop-blur-xl sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-[0.75rem] bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-[#0284c7] ring-1 ring-[#0284c7]/10">
                Belajar
              </span>
              <span className="rounded-[0.75rem] bg-[#fff7ed] px-3 py-1.5 text-[11px] font-black text-amber-700 ring-1 ring-amber-100">
                {studentClassName || 'Semua kelas'}
              </span>
            </div>
            <h1 className="max-w-3xl text-balance text-3xl font-black leading-[0.98] text-[#13232d] sm:text-5xl">
              Satu tempat untuk kelas, mapel, dan materi.
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-600 sm:text-base">
              Tidak perlu bingung membedakan Kelas Saya dan Materi Belajar. Pilih mapel, lihat kelasnya, lalu lanjutkan chapter yang tersedia.
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
          <section className="grid min-w-0 gap-3 xl:grid-cols-[17rem_minmax(0,1fr)]">
            <aside className="hidden min-w-0 overflow-hidden rounded-[1.05rem] border border-[#0B3A5B]/10 bg-white/88 p-2 shadow-[0_14px_44px_rgba(15,31,42,0.065)] backdrop-blur-xl xl:block">
              <div className="px-2 pb-2 pt-1">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0284c7]">Mapel</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Folder course dipisah agar chapter tidak bercampur.</p>
              </div>
              <div className="grid gap-1">
                {materialFolders.map((folder) => {
                  const selectedFolder = activeFolder?.key === folder.key
                  return (
                    <button
                      key={folder.key}
                      onClick={() => setActiveSubjectKey(folder.key)}
                      className={`group grid min-h-[3.35rem] w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 overflow-hidden rounded-[0.85rem] px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284c7] ${selectedFolder ? 'bg-[#0B3A5B] text-white shadow-[0_8px_18px_rgba(15,31,42,0.12)]' : 'bg-transparent text-[#13232d] hover:bg-[#E0F2FE]'}`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black">{folder.name}</span>
                      </span>
                      <span className={`flex-shrink-0 rounded-[0.7rem] px-2.5 py-1 text-xs font-black ring-1 ${selectedFolder ? 'bg-white/12 text-white ring-white/18' : 'bg-white text-[#0284c7] ring-[#0284c7]/10'}`}>
                        {folder.rows.length}
                      </span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <section className="min-w-0 overflow-hidden rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/88 shadow-[0_14px_44px_rgba(15,31,42,0.065)] backdrop-blur-xl">
              <header className="flex flex-col gap-3 border-b border-[#0B3A5B]/8 bg-[#F8FAFC]/82 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0284c7]">Folder mapel</p>
                  <h2 className="break-words text-2xl font-black leading-tight text-[#13232d]">{activeFolder?.name || 'Materi'}</h2>
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
  'Pendidikan Agama Islam dan Budi Pekerti',
  'Pendidikan Pancasila',
  'Bahasa Indonesia',
  'Matematika Umum',
  'Bahasa Inggris',
  'Pendidikan Jasmani, Olahraga, dan Kesehatan',
  'Sejarah',
  'Seni Budaya',
  'Prakarya dan Kewirausahaan',
  'Informatika',
  'Fisika',
  'Kimia',
  'Biologi',
  'Ekonomi',
  'Geografi',
  'Sosiologi',
  'Bahasa Inggris Tingkat Lanjut',
]

const subjectAliasMap = {
  [normalizeLookupText('Pendidikan Agama dan Budi Pekerti')]: 'Pendidikan Agama Islam dan Budi Pekerti',
  [normalizeLookupText('Pendidikan Agama Islam')]: 'Pendidikan Agama Islam dan Budi Pekerti',
  [normalizeLookupText('PJOK')]: 'Pendidikan Jasmani, Olahraga, dan Kesehatan',
  [normalizeLookupText('Pendidikan Jasmani Olahraga dan Kesehatan')]: 'Pendidikan Jasmani, Olahraga, dan Kesehatan',
  [normalizeLookupText('Matematika')]: 'Matematika Umum',
  [normalizeLookupText('Matematika Peminatan')]: 'Matematika Umum',
  [normalizeLookupText('Sejarah Indonesia')]: 'Sejarah',
  [normalizeLookupText('Mulok')]: 'Muatan Lokal',
}

function canonicalSubjectName(value) {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''
  return subjectAliasMap[normalizeLookupText(trimmed)] || trimmed
}

function splitSubjectNames(value) {
  return String(value || '')
    .split(/[;\n]+/)
    .map(canonicalSubjectName)
    .filter(Boolean)
}

function sameSubjectName(left, right) {
  return normalizeLookupText(canonicalSubjectName(left)) === normalizeLookupText(canonicalSubjectName(right))
}

function isGradeSubjectOption(value) {
  const key = normalizeLookupText(canonicalSubjectName(value))
  return !['bpbk', 'bk', 'bimbingankonseling'].includes(key)
}

function preferredSubjectOption(userSubject, subjectOptions = []) {
  const candidates = splitSubjectNames(userSubject)
  const matched = subjectOptions.find((option) => candidates.some((candidate) => sameSubjectName(option, candidate)))
  return matched || subjectOptions[0] || 'Mata pelajaran'
}

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
    const trimmed = canonicalSubjectName(name)
    const key = normalizeLookupText(trimmed)
    if (!key || seen.has(key)) return
    seen.add(key)
    names.push(trimmed)
  })

  return names
}

const materialSubjectNames = Object.freeze(uniqueSubjectNames(schoolMaterials))
const materialSubjectKeys = new Set(materialSubjectNames.map(normalizeLookupText))

function isMaterialSubjectName(value) {
  return materialSubjectKeys.has(normalizeLookupText(canonicalSubjectName(value)))
}

function normalizeMaterialSubjectRows(rows = []) {
  const sourceRows = Array.isArray(rows) ? rows : []
  const byName = new Map()

  ;[...sourceRows, ...subjects].forEach((row) => {
    const name = canonicalSubjectName(row?.name || row?.subject)
    const key = normalizeLookupText(name)
    if (!key || !materialSubjectKeys.has(key) || byName.has(key)) return
    byName.set(key, row)
  })

  return materialSubjectNames.map((name, index) => {
    const key = normalizeLookupText(name)
    const saved = byName.get(key) || {}
    const fallback = subjects.find((item) => sameSubjectName(item.name, name)) || {}
    return {
      ...saved,
      ...fallback,
      id: fallback.id || saved.id || `subject-material-${index + 1}`,
      name,
      code: fallback.code || saved.code || `MP-${String(index + 1).padStart(2, '0')}`,
    }
  })
}

function getTeacherProfileSubjectNames(row = {}, lookupSubjects = normalizeMaterialSubjectRows(subjects)) {
  const subjectIds = Array.isArray(row.subjectIds)
    ? row.subjectIds
    : Array.isArray(row.subject_ids)
      ? row.subject_ids
      : [row.subjectId || row.subject_id].filter(Boolean)
  const namesFromIds = subjectIds
    .map((subjectId) => lookupSubjects.find((item) => item.id === subjectId)?.name)
    .filter(Boolean)
  const names = Array.isArray(row.subjectNames) ? row.subjectNames : []

  return uniqueSubjectNames(names, namesFromIds, splitSubjectNames(row.subject || row.mapel))
    .filter(isMaterialSubjectName)
}

function getMaterialSubjectFolders(rows = [], lookupSubjects = []) {
  const subjectNames = uniqueSubjectNames(highSchoolSubjectFolders, lookupSubjects, rows)
  return subjectNames.map((name) => {
    const key = normalizeLookupText(canonicalSubjectName(name))
    const subjectRows = sortMaterialRowsByChapter(rows.filter((row) => normalizeLookupText(canonicalSubjectName(row.subject || 'Mapel belum dipilih')) === key))
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
    const gradeRows = sortMaterialRowsByChapter(rows.filter((row) => {
      const sameGrade = extractGrade(row.className) === gradeFolder.grade
      if (sameGrade) matchedRows.add(row)
      return sameGrade
    }))

    return {
      ...gradeFolder,
      rows: gradeRows,
      publishedCount: gradeRows.filter((item) => item.status === 'Publish').length,
      draftCount: gradeRows.filter((item) => item.status !== 'Publish').length,
    }
  })

  const unassignedRows = sortMaterialRowsByChapter(rows.filter((row) => !matchedRows.has(row)))
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

function getMaterialSubjectOptions(lookupSubjects = [], materialsForContext = [], fallbackSubjects = highSchoolSubjectFolders) {
  const names = uniqueSubjectNames(fallbackSubjects, lookupSubjects, materialsForContext)
  return names.map((name) => {
    const lookup = lookupSubjects.find((item) => sameSubjectName(item.name, name))
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

function getScopedSubjectLookupRows(lookupSubjects = [], subjectOptions = []) {
  if (!Array.isArray(subjectOptions) || subjectOptions.length === 0) return lookupSubjects

  return subjectOptions.map((subjectName) => {
    const matched = lookupSubjects.find((subject) => sameSubjectName(subject?.name, subjectName))
    return matched || { id: '', name: subjectName, synthetic: true }
  })
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

function getMaterialChapterNumber(row) {
  const text = [
    row?.title,
    row?.topic,
    row?.description,
    row?.content,
    row?.id,
  ].filter(Boolean).join(' ')
  const match = String(text).match(/\b(?:bab|chapter)\s*[-.:]?\s*(\d{1,2})\b/i)
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY
}

function sortMaterialRowsByChapter(rows = []) {
  return [...rows].sort((left, right) => {
    const leftChapter = getMaterialChapterNumber(left)
    const rightChapter = getMaterialChapterNumber(right)
    if (leftChapter !== rightChapter) return leftChapter - rightChapter

    const leftTitle = String(left?.title || left?.topic || '').toLowerCase()
    const rightTitle = String(right?.title || right?.topic || '').toLowerCase()
    return leftTitle.localeCompare(rightTitle, 'id', { numeric: true, sensitivity: 'base' })
  })
}

function getChapterLabel(title) {
  const match = String(title || '').match(/\b(?:bab|chapter)\s*[-.:]?\s*(\d{1,2})\b/i)
  return match ? `Bab ${match[1]}` : 'Materi'
}

function getChapterTitle(title) {
  return String(title || '').replace(/^(?:bab|chapter)\s*[-.:]?\s*\d+\s*[—:-]?\s*/i, '').trim() || title
}

const materialCardTones = [
  {
    background: 'linear-gradient(145deg, #F0F9FF 0%, #FFFFFF 58%, #E0F2FE 100%)',
    border: '#BAE6FD',
    accent: '#0284C7',
    accentSoft: '#E0F2FE',
    button: '#0B3A5B',
    buttonHover: '#0284C7',
  },
  {
    background: 'linear-gradient(145deg, #F0FDF4 0%, #FFFFFF 58%, #DCFCE7 100%)',
    border: '#BBF7D0',
    accent: '#15803D',
    accentSoft: '#DCFCE7',
    button: '#166534',
    buttonHover: '#16A34A',
  },
  {
    background: 'linear-gradient(145deg, #FFFBEB 0%, #FFFFFF 58%, #FEF3C7 100%)',
    border: '#FDE68A',
    accent: '#B45309',
    accentSoft: '#FEF3C7',
    button: '#92400E',
    buttonHover: '#D97706',
  },
  {
    background: 'linear-gradient(145deg, #F8FAFC 0%, #FFFFFF 58%, #EAF4FF 100%)',
    border: '#D9E6F5',
    accent: '#17446E',
    accentSoft: '#EAF4FF',
    button: '#17446E',
    buttonHover: '#2F80D8',
  },
  {
    background: 'linear-gradient(145deg, #EEF7FF 0%, #FFFFFF 58%, #DDF2FF 100%)',
    border: '#B9D8F7',
    accent: '#2F80D8',
    accentSoft: '#E8F2FF',
    button: '#0B3A5B',
    buttonHover: '#2F80D8',
  },
  {
    background: 'linear-gradient(145deg, #ECFEFF 0%, #FFFFFF 58%, #CFFAFE 100%)',
    border: '#A5F3FC',
    accent: '#0E7490',
    accentSoft: '#CFFAFE',
    button: '#155E75',
    buttonHover: '#0891B2',
  },
]

function getMaterialCardTone(item) {
  const chapter = getMaterialChapterNumber(item)
  const fallbackSeed = normalizeLookupText(`${item?.subject || ''}${item?.title || ''}`).length
  const index = Number.isFinite(chapter) ? chapter - 1 : fallbackSeed
  return materialCardTones[Math.abs(index) % materialCardTones.length]
}

const materialCoverCache = new Map()

function getMaterialLinkedUrl(item) {
  const raw = cleanMaterialUrl(item?.content || item?.url || item?.href || '')
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/') || raw.startsWith('data:')) return raw
  if (/\.html(?:[?#].*)?$/i.test(raw)) return raw.startsWith('materials/') ? `/${raw}` : raw
  return ''
}

function resolveMaterialAssetUrl(assetUrl, baseUrl) {
  if (!assetUrl) return ''
  if (/^(data:|https?:\/\/|blob:)/i.test(assetUrl)) return assetUrl
  try {
    const base = /^https?:\/\//i.test(baseUrl)
      ? baseUrl
      : new URL(baseUrl || '/', window.location.origin).toString()
    return new URL(assetUrl, base).toString()
  } catch {
    return assetUrl
  }
}

function extractFirstImageFromHtml(html, baseUrl) {
  const metaImage = String(html || '').match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i)?.[1]
  if (metaImage) return resolveMaterialAssetUrl(metaImage, baseUrl)
  const inlineImage = String(html || '').match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]
  if (inlineImage) return resolveMaterialAssetUrl(inlineImage, baseUrl)
  const backgroundImage = String(html || '').match(/background(?:-image)?\s*:\s*url\((["']?)([^"')]+)\1\)/i)?.[2]
  if (backgroundImage) return resolveMaterialAssetUrl(backgroundImage, baseUrl)
  return ''
}

function useMaterialCoverImage(item) {
  const explicitCover = item?.coverImage || item?.thumbnail || item?.image || item?.imageUrl || item?.heroImage || ''
  const htmlUrl = getMaterialLinkedUrl(item)
  const [cover, setCover] = useState(() => explicitCover || materialCoverCache.get(htmlUrl) || '')

  useEffect(() => {
    let active = true
    if (explicitCover) {
      setCover(explicitCover)
      return undefined
    }
    if (!htmlUrl || !isHtmlMaterial(item)) {
      setCover('')
      return undefined
    }
    if (materialCoverCache.has(htmlUrl)) {
      setCover(materialCoverCache.get(htmlUrl) || '')
      return undefined
    }

    fetch(htmlUrl)
      .then((response) => response.ok ? response.text() : '')
      .then((html) => {
        if (!active) return
        const nextCover = extractFirstImageFromHtml(html, htmlUrl)
        materialCoverCache.set(htmlUrl, nextCover)
        setCover(nextCover)
      })
      .catch(() => {
        materialCoverCache.set(htmlUrl, '')
        if (active) setCover('')
      })

    return () => {
      active = false
    }
  }, [explicitCover, htmlUrl, item])

  return cover
}

function StudentMaterialRow({ item, onOpen }) {
  const navigate = useNavigate()
  const completed = item.status === 'Selesai' || Number(item.progress || 0) >= 100
  const chapterTitle = getChapterTitle(item.title)
  const subjectLine = [item.subject, item.className].filter(Boolean).join(' · ')
  const tone = getMaterialCardTone(item)
  const coverImage = useMaterialCoverImage(item)
  const hasCover = Boolean(coverImage)

  return (
    <article
      className="group relative flex min-h-[15.5rem] min-w-0 flex-col overflow-hidden rounded-[0.95rem] p-3 shadow-[0_12px_28px_rgba(15,31,42,0.045)] ring-1 transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(15,31,42,0.085)]"
      style={hasCover
        ? {
          backgroundImage: `linear-gradient(145deg, rgba(255,255,255,0.92), rgba(248,251,255,0.78) 48%, ${tone.accentSoft}CC 100%), linear-gradient(135deg, ${tone.accentSoft}AA, rgba(250,204,21,0.25)), url("${coverImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '--tw-ring-color': tone.border,
        }
        : { background: tone.background, '--tw-ring-color': tone.border }}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <span
          className={`inline-flex shrink-0 justify-center rounded-[0.7rem] px-2.5 py-1.5 font-mono text-xs font-black ring-1 ${hasCover ? 'bg-white text-[#0B3A5B] shadow-[0_8px_20px_rgba(15,31,42,0.18)] ring-white/80 backdrop-blur-xl' : ''}`}
          style={hasCover ? undefined : { backgroundColor: tone.accentSoft, color: tone.accent, '--tw-ring-color': tone.border }}
        >
          {getChapterLabel(item.title)}
        </span>
        <span className="min-w-0 shrink-0">
          <StatusBadge tone={completed ? 'green' : 'amber'}>{item.status}</StatusBadge>
        </span>
      </div>

      <div className="mt-3 min-w-0 flex-1">
        <h3 className="line-clamp-2 min-h-[2.35rem] break-words text-[0.96rem] font-black leading-snug text-[#13232d]">
          {chapterTitle}
        </h3>
        <p className="mt-2 truncate text-[11px] font-black uppercase tracking-[0.08em]" style={{ color: tone.accent }}>
          {subjectLine || 'Materi'}
        </p>
        <p className="mt-2 line-clamp-2 min-h-[2.35rem] break-words text-[0.82rem] font-semibold leading-5 text-slate-600">{item.description}</p>
        <div className="mt-4 h-1.5 rounded-full" style={{ backgroundColor: hasCover ? 'rgba(255,255,255,0.78)' : tone.accentSoft }}>
          <div className="h-1.5 rounded-full" style={{ width: `${item.progress}%`, backgroundColor: tone.accent }} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 text-xs font-bold text-slate-600">
          <span>{Number(item.progress || 0)}% progress</span>
          <span>{item.type || 'Materi'}</span>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 pt-4">
        <button
          onClick={onOpen}
          className="inline-flex min-h-10 items-center justify-center rounded-[0.85rem] px-4 text-sm font-black text-white transition"
          style={{ backgroundColor: tone.button, backdropFilter: hasCover ? 'blur(16px)' : undefined }}
          onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = tone.buttonHover }}
          onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = tone.button }}
        >
          Buka
        </button>
        <button
          onClick={() => navigate('/siswa/ai-tutor')}
          aria-label="Tanya AI Tutor"
          className={`inline-flex h-10 w-10 items-center justify-center rounded-[0.85rem] text-xs font-black ring-1 transition ${hasCover ? 'bg-white/86 shadow-sm ring-white/80 backdrop-blur-xl hover:bg-white' : 'hover:bg-white'}`}
          style={hasCover ? undefined : { backgroundColor: tone.accentSoft, color: tone.accent, '--tw-ring-color': tone.border }}
        >
          <Bot size={17} />
        </button>
      </div>
    </article>
  )
}

function StudentMaterialGradeFolder({ gradeFolder, onOpen, defaultOpen = false }) {
  const hasRows = gradeFolder.rows.length > 0

  return (
    <details open={hasRows && defaultOpen} className="group min-w-0 overflow-hidden">
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
          <div className="grid min-w-0 gap-2.5 bg-[#f8fafc]/80 p-2.5 md:grid-cols-2 2xl:grid-cols-3">
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
  const actionGateRef = useRef(null)
  const frameCleanupRef = useRef(null)
  const sections = buildMaterialLearningSections(item)
  const progress = Number(item.progress || 0)
  const completed = item.status === 'Selesai' || progress >= 100
  const htmlMaterial = isHtmlMaterialType(item.type) && isValidLinkedMaterial(item.content, item.type)
  const externalMaterial = !htmlMaterial && isExternalMaterialType(item.type) && isValidMaterialUrl(item.content)
  const materialUrl = cleanMaterialUrl(item.content)
  const videoEmbedUrl = externalMaterial && ['Video', 'Embed'].includes(item.type) ? getEmbeddableVideoUrl(materialUrl) : ''
  const directVideoUrl = externalMaterial && item.type === 'Video' && !videoEmbedUrl ? materialUrl : ''
  const directAudioUrl = externalMaterial && item.type === 'Audio' ? materialUrl : ''
  const documentPreviewUrl = externalMaterial ? getDocumentPreviewUrl(materialUrl, item.type) : ''
  const genericEmbedUrl = externalMaterial && item.type === 'Embed' && !videoEmbedUrl ? materialUrl : ''
  const framePreviewUrl = videoEmbedUrl || documentPreviewUrl || genericEmbedUrl
  const linkOnlyMaterial = externalMaterial && !framePreviewUrl && !directVideoUrl && !directAudioUrl
  const advancedMaterial = isAdvancedMaterialContent(item.content)
  const showAdvancedMaterial = advancedMaterial && !htmlMaterial && !framePreviewUrl && !directVideoUrl && !linkOnlyMaterial
  const showTextSections = !showAdvancedMaterial && !htmlMaterial && !framePreviewUrl && !directVideoUrl && !directAudioUrl && !linkOnlyMaterial
  const displayProgress = completed ? 100 : progress
  const [materialReadComplete, setMaterialReadComplete] = useState(false)
  const showCompletionActions = Boolean(onComplete && materialReadComplete)

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

  useEffect(() => {
    setMaterialReadComplete(false)
    if (frameCleanupRef.current) frameCleanupRef.current()
    frameCleanupRef.current = null
    return () => {
      if (frameCleanupRef.current) frameCleanupRef.current()
      frameCleanupRef.current = null
    }
  }, [item.id])

  useEffect(() => {
    if (!onComplete || htmlMaterial) return undefined
    const gate = actionGateRef.current
    if (!gate) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      setMaterialReadComplete(Boolean(entry?.isIntersecting))
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 })

    observer.observe(gate)
    return () => observer.disconnect()
  }, [htmlMaterial, item.id, onComplete])

  useEffect(() => {
    if (showAdvancedMaterial) requestMathTypeset()
  }, [item.id, showAdvancedMaterial])

  function handleMaterialFrameLoad(event) {
    if (!onComplete || !htmlMaterial) return
    if (frameCleanupRef.current) frameCleanupRef.current()

    try {
      const frameWindow = event.currentTarget.contentWindow
      const frameDocument = event.currentTarget.contentDocument || frameWindow?.document
      const scrollElement = frameDocument?.scrollingElement || frameDocument?.documentElement || frameDocument?.body
      if (!frameWindow || !scrollElement) return

      const checkEndReached = () => {
        const remaining = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight
        setMaterialReadComplete(remaining <= 96)
      }

      frameWindow.addEventListener('scroll', checkEndReached, { passive: true })
      frameWindow.addEventListener('resize', checkEndReached)
      frameDocument.addEventListener('scroll', checkEndReached, { passive: true })
      checkEndReached()

      frameCleanupRef.current = () => {
        frameWindow.removeEventListener('scroll', checkEndReached)
        frameWindow.removeEventListener('resize', checkEndReached)
        frameDocument.removeEventListener('scroll', checkEndReached)
      }
    } catch {
      setMaterialReadComplete(false)
    }
  }

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
      <div className="space-y-4">
        <section className="rounded-[1rem] border border-[#0B3A5B]/10 bg-white/88 p-3 shadow-[0_10px_28px_rgba(15,31,42,0.045)]">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_17rem] xl:items-center">
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
              <StatusBadge tone={item.status === 'Selesai' ? 'green' : 'cyan'}>{item.status}</StatusBadge>
              <span className="rounded-[0.75rem] bg-[#F8FAFC] px-3 py-2 ring-1 ring-[#0B3A5B]/8">
                <b>Mapel:</b> {item.subject}
              </span>
              <span className="rounded-[0.75rem] bg-[#F8FAFC] px-3 py-2 ring-1 ring-[#0B3A5B]/8">
                <b>Kelas:</b> {item.className}
              </span>
              <span className="max-w-full truncate rounded-[0.75rem] bg-[#F8FAFC] px-3 py-2 ring-1 ring-[#0B3A5B]/8">
                <b>Guru:</b> {item.teacher}
              </span>
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Progress</span>
                <span>{displayProgress}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#E0F2FE]">
                <div className="h-2.5 rounded-full bg-[#0284c7]" style={{ width: `${displayProgress}%` }} />
              </div>
            </div>
          </div>
        </section>

        <SectionCard className="min-w-0">
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
                onLoad={handleMaterialFrameLoad}
                className="h-[78vh] w-full bg-[#F1F7FF]"
                loading="lazy"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              />
            </div>
          )}
          {framePreviewUrl && (
            <div className="mt-5 overflow-hidden rounded-[1rem] border border-[#0B3A5B]/10 bg-white shadow-[0_14px_44px_rgba(15,31,42,0.06)]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#0B3A5B]/8 bg-[#F8FAFC] px-3 py-2">
                <StatusBadge tone="cyan">{videoEmbedUrl ? 'Video tertanam' : item.type}</StatusBadge>
                <a href={materialUrl} target="_blank" rel="noreferrer" className="rounded-[0.75rem] bg-[#E0F2FE] px-3 py-1.5 text-xs font-black text-[#0284c7] ring-1 ring-[#0284c7]/10">
                  Buka di tab baru
                </a>
              </div>
              <iframe
                title={item.title}
                src={framePreviewUrl}
                className="h-[72vh] w-full bg-[#F1F7FF]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              />
            </div>
          )}
          {directVideoUrl && (
            <div className="mt-5 overflow-hidden rounded-[1rem] border border-[#0B3A5B]/10 bg-slate-950 shadow-[0_14px_44px_rgba(15,31,42,0.12)]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-900 px-3 py-2">
                <StatusBadge tone="cyan">Video</StatusBadge>
                <a href={directVideoUrl} target="_blank" rel="noreferrer" className="rounded-[0.75rem] bg-white/10 px-3 py-1.5 text-xs font-black text-white ring-1 ring-white/15">
                  Buka di tab baru
                </a>
              </div>
              <video controls src={directVideoUrl} className="aspect-video w-full bg-black" />
            </div>
          )}
          {directAudioUrl && (
            <div className="mt-5 overflow-hidden rounded-[1rem] border border-[#0B3A5B]/10 bg-white shadow-[0_14px_44px_rgba(15,31,42,0.06)]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#0B3A5B]/8 bg-[#F8FAFC] px-3 py-2">
                <StatusBadge tone="cyan">Audio</StatusBadge>
                <a href={directAudioUrl} target="_blank" rel="noreferrer" className="rounded-[0.75rem] bg-[#E0F2FE] px-3 py-1.5 text-xs font-black text-[#0284c7] ring-1 ring-[#0284c7]/10">
                  Buka di tab baru
                </a>
              </div>
              <div className="p-4">
                <audio controls src={directAudioUrl} className="w-full" />
              </div>
            </div>
          )}
          {linkOnlyMaterial && (
            <div className="mt-5 rounded-2xl bg-cyan-50 p-3 ring-1 ring-cyan-100">
              <StatusBadge tone="cyan">{item.type}</StatusBadge>
              <p className="mt-2 text-sm leading-6 text-cyan-800">
                Materi ini memakai URL eksternal. Buka link untuk melihat bahan belajar di sumber aslinya.
              </p>
              <a href={item.content} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-cyan-700 ring-1 ring-cyan-100">
                Buka materi
              </a>
            </div>
          )}
          {showAdvancedMaterial && (
            <div className="mt-5">
              <AdvancedMaterialViewer material={item} />
            </div>
          )}
          {showTextSections && (
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
          {onComplete && <div ref={actionGateRef} aria-hidden="true" className="h-px" />}
          {showCompletionActions && (
            <>
              <div className="mt-6 flex flex-wrap gap-2">
                <button onClick={onComplete} disabled={completed} className="rounded-xl bg-galaxy-action px-4 py-2.5 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60">
                  {completed ? 'Materi selesai' : 'Tandai selesai'}
                </button>
                <button onClick={() => navigate('/siswa/ai-tutor')} className="rounded-2xl bg-galaxy-surface px-5 py-3 text-sm font-bold text-galaxy-purple">Tanya AI Tutor</button>
              </div>
              <div className="mt-4 rounded-2xl bg-cyan-50 p-3 text-sm font-semibold leading-6 text-cyan-800 ring-1 ring-cyan-100">
                Jika AI Tutor belum aktif, gunakan bagian Latihan Cepat dan Refleksi di atas sebagai panduan belajar mandiri.
              </div>
            </>
          )}
        </SectionCard>
      </div>
    </div>
  )
}

function AdvancedMaterialViewer({ material, draft, compact = false }) {
  const content = draft || parseAdvancedMaterialContent(material?.content)
  const tone = getAdvancedTone(content.accentTone)

  useEffect(() => {
    requestMathTypeset()
  }, [content.body, content.equations?.length])

  return (
    <article className={`space-y-4 ${compact ? 'text-sm' : ''}`}>
      {(content.targetLevel || content.tags?.length > 0 || content.releaseAt) && (
        <div className="flex flex-wrap items-center gap-2">
          {content.targetLevel && <StatusBadge tone="cyan">{content.targetLevel}</StatusBadge>}
          {content.releaseAt && (
            <span className="rounded-[0.75rem] bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700 ring-1 ring-amber-100">
              Rilis {new Date(content.releaseAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          )}
          {content.tags?.slice(0, 8).map((tag) => (
            <span key={tag} className="rounded-[0.75rem] bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-600 ring-1 ring-slate-100">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {content.body?.trim() && (
        <section className="overflow-hidden rounded-[1rem] border bg-white shadow-[0_12px_34px_rgba(15,31,42,0.05)]" style={{ borderColor: tone.border }}>
          <div className="h-2" style={{ background: `linear-gradient(90deg, ${tone.accent}, ${tone.border})` }} />
          <div
            className="prose-material space-y-2 p-4"
            dangerouslySetInnerHTML={{ __html: richTextToHtml(content.body) }}
          />
        </section>
      )}

      {content.equations?.length > 0 && (
        <section className="rounded-[1rem] bg-slate-50 p-4 ring-1 ring-slate-100">
          <div className="mb-3 flex items-center gap-2">
            <Calculator size={18} className="text-sky-700" />
            <h3 className="text-lg font-black text-slate-950">Rumus dan persamaan</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {content.equations.map((equation) => (
              <div key={equation.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
                <p className="text-sm font-black text-slate-950">{equation.label || 'Rumus'}</p>
                <div className="mt-3 overflow-x-auto rounded-xl bg-slate-950 px-4 py-3 font-mono text-sm font-bold text-white">
                  {equation.latex?.startsWith('$$') ? equation.latex : `$$${equation.latex || ''}$$`}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {content.tables?.length > 0 && (
        <section className="rounded-[1rem] bg-white p-4 ring-1 ring-slate-100">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardList size={18} className="text-emerald-700" />
            <h3 className="text-lg font-black text-slate-950">Tabel data</h3>
          </div>
          <div className="space-y-4">
            {content.tables.map((table) => (
              <div key={table.id} className="overflow-hidden rounded-2xl ring-1 ring-slate-100">
                <div className="bg-slate-50 px-3 py-2 text-sm font-black text-slate-900">{table.title || 'Tabel'}</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                    <thead className="bg-white">
                      <tr>
                        {(table.headers || []).map((header, index) => (
                          <th key={`${table.id}-h-${index}`} className="px-3 py-2 font-black text-slate-700">{header || `Kolom ${index + 1}`}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {(table.rows || []).map((row, rowIndex) => (
                        <tr key={`${table.id}-r-${rowIndex}`}>
                          {(row || []).map((cell, cellIndex) => (
                            <td key={`${table.id}-${rowIndex}-${cellIndex}`} className="px-3 py-2 font-semibold text-slate-600">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {content.media?.length > 0 && (
        <section className="rounded-[1rem] bg-white p-4 ring-1 ring-slate-100">
          <div className="mb-3 flex items-center gap-2">
            <PlayCircle size={18} className="text-sky-700" />
            <h3 className="text-lg font-black text-slate-950">Media dan lampiran</h3>
          </div>
          <div className="grid gap-3">
            {content.media.map((media) => <AdvancedMaterialMedia key={media.id} media={media} />)}
          </div>
        </section>
      )}

      {content.quizzes?.length > 0 && (
        <section className="rounded-[1rem] bg-[#F8FAFC] p-4 ring-1 ring-slate-100">
          <div className="mb-3 flex items-center gap-2">
            <FileQuestion size={18} className="text-violet-700" />
            <h3 className="text-lg font-black text-slate-950">Kuis sela</h3>
          </div>
          <div className="grid gap-3">
            {content.quizzes.map((quiz, index) => <AdvancedMaterialQuiz key={quiz.id} quiz={quiz} index={index} />)}
          </div>
        </section>
      )}

      {content.spoilers?.length > 0 && (
        <section className="rounded-[1rem] bg-white p-4 ring-1 ring-slate-100">
          <div className="mb-3 flex items-center gap-2">
            <Brain size={18} className="text-amber-700" />
            <h3 className="text-lg font-black text-slate-950">Pembahasan bertahap</h3>
          </div>
          <div className="space-y-2">
            {content.spoilers.map((spoiler) => (
              <details key={spoiler.id} className="group rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-100">
                <summary className="cursor-pointer list-none font-black text-amber-900">
                  {spoiler.title || 'Buka pembahasan'}
                </summary>
                <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-7 text-amber-900">{spoiler.body}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

function AdvancedMaterialMedia({ media }) {
  const mediaUrl = media.dataUrl || media.url || ''
  const embedUrl = ['Video', 'Simulasi', 'Embed'].includes(media.type) ? getEmbeddableVideoUrl(mediaUrl) : ''
  const frameUrl = embedUrl || (['PDF', 'Dokumen', 'Presentasi', 'Spreadsheet'].includes(media.type) ? getDocumentPreviewUrl(mediaUrl, media.type) : '') || (['Simulasi', 'Embed'].includes(media.type) ? mediaUrl : '')

  return (
    <div className="overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-950">{media.title || media.name || media.type}</p>
          <p className="text-xs font-semibold text-slate-500">{media.type}{media.size ? ` · ${formatFileSize(media.size)}` : ''}</p>
        </div>
        {mediaUrl && <a href={mediaUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-sky-50 px-3 py-1.5 text-xs font-black text-sky-700 ring-1 ring-sky-100">Buka</a>}
      </div>
      {media.type === 'Gambar' && mediaUrl && <img src={mediaUrl} alt={media.title || media.name || 'Gambar materi'} className="max-h-[28rem] w-full object-contain bg-white" />}
      {media.type === 'Audio' && mediaUrl && <div className="p-4"><audio controls src={mediaUrl} className="w-full" /></div>}
      {media.type === 'Video' && mediaUrl && !frameUrl && <video controls src={mediaUrl} className="aspect-video w-full bg-black" />}
      {frameUrl && (
        <iframe
          title={media.title || media.name || media.type}
          src={frameUrl}
          className="h-[28rem] w-full bg-white"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
        />
      )}
      {!mediaUrl && <p className="p-4 text-sm font-semibold text-slate-500">Media belum memiliki URL atau file.</p>}
    </div>
  )
}

function AdvancedMaterialQuiz({ quiz, index }) {
  const [answer, setAnswer] = useState('')
  const checked = Boolean(answer)
  const correct = checked && normalizeLookupText(answer) === normalizeLookupText(quiz.answer)

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
      <p className="text-sm font-black uppercase tracking-[0.12em] text-violet-700">Soal {index + 1}</p>
      <h4 className="mt-2 text-base font-black text-slate-950">{quiz.question || 'Pertanyaan belum diisi.'}</h4>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {normalizeStringList(quiz.options).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setAnswer(option)}
            className={`rounded-xl px-3 py-2 text-left text-sm font-bold ring-1 transition ${answer === option ? 'bg-violet-50 text-violet-800 ring-violet-200' : 'bg-slate-50 text-slate-600 ring-slate-100 hover:bg-white'}`}
          >
            {option}
          </button>
        ))}
      </div>
      {checked && (
        <div className={`mt-3 rounded-xl px-3 py-2 text-sm font-bold ring-1 ${correct ? 'bg-emerald-50 text-emerald-800 ring-emerald-100' : 'bg-amber-50 text-amber-800 ring-amber-100'}`}>
          {correct ? 'Jawaban tepat.' : `Jawaban yang disarankan: ${quiz.answer || '-'}`}
          {quiz.explanation && <p className="mt-1 font-semibold leading-6">{quiz.explanation}</p>}
        </div>
      )}
    </div>
  )
}

function SiswaTugas({ user, notify, appContext }) {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [selected, setSelected] = useState(null)
  const [answer, setAnswer] = useState('')
  const [submissionLink, setSubmissionLink] = useState('')
  const [submissionFiles, setSubmissionFiles] = useState([])
  const [tab, setTab] = useState('Aktif')
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadAssignments() {
      if (!appContext?.accessToken) {
        setRows(uniqueRowsById([...assignments.filter((item) => isAssignmentVisibleToStudent(item, user)), ...getPublishedLocalTeacherAssignments()].filter((item) => isAssignmentVisibleToStudent(item, user))))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const remoteRows = await fetchAssignments({ accessToken: appContext.accessToken, publishedOnly: true })
        if (active) {
          setRows(uniqueRowsById([...(remoteRows.length > 0 ? remoteRows : assignments.filter((item) => item.status === 'Aktif')), ...getPublishedLocalTeacherAssignments()].filter((item) => isAssignmentVisibleToStudent(item, user))))
          setError('')
        }
      } catch (loadError) {
        if (active) {
          setRows(uniqueRowsById([...assignments.filter((item) => item.status === 'Aktif'), ...getPublishedLocalTeacherAssignments()].filter((item) => isAssignmentVisibleToStudent(item, user))))
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
  }, [appContext?.accessToken, user])

  function openAssignment(assignment) {
    const normalized = normalizeAssignmentForEdit(assignment)
    const submission = getLocalAssignmentSubmission(normalized.id, user?.id)
    setSelected(normalized)
    setAnswer(submission?.answerText || '')
    setSubmissionLink(submission?.link || '')
    setSubmissionFiles(normalizeAssignmentAttachments(submission?.files))
  }

  async function addSubmissionFiles(event) {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    const items = await Promise.all(files.map(async (file) => ({
      id: createMaterialBlockId('submission-file'),
      title: file.name,
      type: inferMediaTypeFromFile(file),
      dataUrl: await blobToDataUrl(file),
      url: '',
      mime: file.type,
      size: file.size,
    })))
    setSubmissionFiles((current) => [...normalizeAssignmentAttachments(current), ...items])
    event.target.value = ''
  }

  async function submitAssignment() {
    if (!selected) return
    const allowedTypes = normalizeAssignmentSubmissionTypes(selected.submissionTypes)
    const hasText = allowedTypes.includes('text') && answer.trim()
    const hasLink = allowedTypes.includes('link') && submissionLink.trim()
    const hasFiles = allowedTypes.includes('file') && submissionFiles.length > 0
    if (isAssignmentLocked(selected)) {
      notify('Deadline tugas sudah lewat dan pengumpulan dikunci.')
      return
    }
    if (!hasText && !hasLink && !hasFiles) {
      notify('Isi minimal satu bentuk jawaban sesuai metode pengumpulan tugas.')
      return
    }
    const late = isAssignmentPastDeadline(selected)

    const localSubmission = {
      id: `local-submission-${Date.now()}`,
      assignmentId: selected.id,
      userId: user?.id || 'demo',
      studentName: user?.name || 'Siswa',
      answerText: answer.trim(),
      link: submissionLink.trim(),
      files: normalizeAssignmentAttachments(submissionFiles),
      submittedAt: new Date().toISOString(),
      status: late ? 'Terlambat' : 'Terkirim',
    }

    if (appContext?.accessToken && selected.source === 'supabase' && isUuid(user?.id)) {
      try {
        const student = await fetchStudentRecord({ accessToken: appContext.accessToken, profileId: user.id })
        if (!student?.id) {
          notify('Profil siswa belum terhubung ke data kelas. Hubungi admin sekolah.')
          return
        }
        const remoteAnswerText = [
          answer.trim(),
          submissionLink.trim() ? `Tautan: ${submissionLink.trim()}` : '',
          submissionFiles.length ? `Lampiran lokal: ${submissionFiles.map((file) => file.title).join(', ')}` : '',
        ].filter(Boolean).join('\n\n')
        await createAssignmentSubmission({ accessToken: appContext.accessToken, assignmentId: selected.id, studentId: student?.id, answerText: remoteAnswerText })
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

  const taskTabs = ['Aktif', 'Selesai', 'Riwayat']
  const visibleRows = rows.filter((assignment) => {
    const hasSubmission = Boolean(getLocalAssignmentSubmission(assignment.id, user?.id))
    if (tab === 'Selesai') return hasSubmission
    if (tab === 'Riwayat') return true
    return !hasSubmission
  })
  const activeQuizRows = uniqueRowsById([...quizzes, ...getPublishedLocalTeacherQuizzes()])
    .filter((item) => ['Berlangsung', 'Belum mulai', 'Publish'].includes(item.status))
    .slice(0, 3)
  const taskHubItems = [
    { label: 'Latihan', icon: Brain, onClick: () => navigate('/siswa/latihan') },
    { label: 'Kuis / Ujian', icon: FileQuestion, onClick: () => navigate('/siswa/kuis') },
    { label: 'AI Tutor', icon: Bot, onClick: () => navigate('/siswa/ai-tutor') },
  ]

  if (selected) {
    const submission = getLocalAssignmentSubmission(selected.id, user?.id)
    const submissionTypes = normalizeAssignmentSubmissionTypes(selected.submissionTypes)
    const attachments = normalizeAssignmentAttachments(selected.attachments)
    const locked = isAssignmentLocked(selected)
    return (
      <div>
        <PageHeader
          eyebrow={selected.subject}
          title={selected.title}
          description={`${normalizeAssignmentClassNames(selected).join(', ') || selected.className} · Deadline ${formatAssignmentDateTime(selected.deadline)} · ${selected.status}`}
          action={<button onClick={() => setSelected(null)} className="rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-extrabold text-galaxy-purple">Kembali</button>}
        />

        <div className="grid gap-4">
          <SectionCard className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={submission ? 'green' : 'amber'}>{submission ? 'Sudah submit' : 'Belum submit'}</StatusBadge>
              <StatusBadge tone={statusTone(selected.status)}>{selected.status}</StatusBadge>
              {isAssignmentPastDeadline(selected) && <StatusBadge tone={locked ? 'red' : 'amber'}>{locked ? 'Dikunci' : 'Lewat deadline'}</StatusBadge>}
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <p className="text-sm font-extrabold text-slate-950">Instruksi tugas</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{selected.description}</p>
            </div>

            {attachments.length > 0 && (
              <div className="mt-5 space-y-2">
                <p className="text-sm font-extrabold text-slate-950">Lampiran tugas</p>
                {attachments.map((attachment) => <AssignmentAttachmentPreview key={attachment.id} attachment={attachment} />)}
              </div>
            )}

            <div className="mt-5 rounded-2xl bg-[#F8FBFF] p-3 ring-1 ring-[#0B3A5B]/8">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {submissionTypes.map((type) => (
                  <StatusBadge key={type} tone="cyan">{assignmentSubmissionTypeOptions.find((item) => item.value === type)?.label || type}</StatusBadge>
                ))}
              </div>

              {submissionTypes.includes('text') && (
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Jawaban teks
                  <textarea
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    rows={8}
                    disabled={locked}
                    className="rounded-xl border border-purple-100 bg-white px-3 py-2.5 outline-none focus:border-purple-300 disabled:bg-slate-100"
                    placeholder="Tulis jawaban tugas di sini."
                  />
                </label>
              )}

              {submissionTypes.includes('file') && (
                <div className="mt-4">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-black text-[#0284c7] ring-1 ring-[#0B3A5B]/10">
                    <FileText size={16} /> Unggah berkas jawaban
                    <input type="file" multiple disabled={locked} onChange={addSubmissionFiles} className="hidden" />
                  </label>
                  {submissionFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {submissionFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-[#0B3A5B]/8">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-800">{file.title}</p>
                            <p className="text-xs font-bold text-slate-500">{file.type}{file.size ? ` · ${formatFileSize(file.size)}` : ''}</p>
                          </div>
                          <button type="button" onClick={() => setSubmissionFiles((current) => current.filter((item) => item.id !== file.id))} className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-black text-rose-700">
                            Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {submissionTypes.includes('link') && (
                <label className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
                  Tautan jawaban
                  <input
                    value={submissionLink}
                    onChange={(event) => setSubmissionLink(event.target.value)}
                    disabled={locked}
                    placeholder="https://drive.google.com/... atau link karya siswa"
                    className="rounded-xl border border-purple-100 bg-white px-3 py-2.5 outline-none focus:border-purple-300 disabled:bg-slate-100"
                  />
                </label>
              )}
            </div>

            <button disabled={locked} onClick={submitAssignment} className="mt-5 rounded-xl bg-galaxy-action px-4 py-2.5 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-45">
              {submission ? 'Perbarui submission' : 'Submit tugas'}
            </button>
          </SectionCard>

          <SectionCard className="min-w-0">
            <p className="text-sm font-extrabold text-gray-950">Status Submission</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p><b>Guru:</b> {selected.teacher || 'Guru'}</p>
              <p><b>Rilis:</b> {formatAssignmentDateTime(selected.releaseAt)}</p>
              <p><b>Deadline:</b> {formatAssignmentDateTime(selected.deadline)}</p>
              <p><b>Mapel:</b> {selected.subject}</p>
              <p><b>Mode:</b> {selected.workMode || 'Individu'}</p>
              <p><b>Skor maksimal:</b> {selected.maxScore || 100}</p>
              <p><b>Terakhir submit:</b> {submission ? new Date(submission.submittedAt).toLocaleString('id-ID') : '-'}</p>
            </div>
            <div className="mt-5 rounded-2xl bg-cyan-50 p-3 text-sm font-semibold leading-6 text-cyan-800 ring-1 ring-cyan-100">
              Ikuti metode pengumpulan yang dipilih guru. Link video atau dokumen akan tetap tersimpan sebagai tautan jawaban.
            </div>
            {normalizeAssignmentRubricRows(selected.rubricRows || selected.rubric).length > 0 && (
              <div className="mt-3 rounded-2xl bg-purple-50 p-3 text-sm leading-6 text-purple-800 ring-1 ring-purple-100">
                <b>Rubrik:</b>
                <div className="mt-2 space-y-2">
                  {normalizeAssignmentRubricRows(selected.rubricRows || selected.rubric).map((row) => (
                    <div key={row.id} className="rounded-xl bg-white/70 px-3 py-2">
                      <p className="font-black">{row.component} {row.weight ? `(${row.weight}%)` : ''}</p>
                      <p className="text-xs leading-5">{row.description || '-'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader eyebrow="Tugas" title="Kerjakan tugas kelas." description="Daftar ini fokus pada tugas siswa. Kuis punya menu sendiri agar lebih mudah ditemukan." />
      {error && <div className="mb-4 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim tugas: {error}. Data lokal tetap ditampilkan.</div>}
      <div className="mb-4 grid gap-3 xl:grid-cols-[1fr_20rem]">
        <DashboardPanel title="Kuis aktif" description="Kerjakan kuis yang sedang tersedia sebelum deadline.">
          {activeQuizRows.length ? (
            <div className="space-y-2">
              {activeQuizRows.map((quiz) => (
                <button key={quiz.id} onClick={() => navigate('/siswa/kuis')} className="flex w-full items-center gap-3 rounded-xl bg-[#F8FBFF] p-3 text-left ring-1 ring-[#D9E6F5] transition hover:bg-white">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#EAF4FF] text-[#2F80D8]"><FileQuestion size={18} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black text-[#132437]">{quiz.title}</span>
                    <span className="block truncate text-xs font-semibold text-[#64748B]">{quiz.subject} · {quiz.duration || 30} menit</span>
                  </span>
                  <StatusBadge tone="amber">{quiz.status}</StatusBadge>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState title="Belum ada kuis aktif." description="Kamu bisa lanjut latihan atau buka materi terakhir." action={<QuickActionButton icon={BookOpen} label="Lanjutkan Belajar" onClick={() => navigate('/siswa/materi')} />} />
          )}
        </DashboardPanel>

        <DashboardActionGrid items={taskHubItems} title="Aksi cepat" />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {taskTabs.map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`min-h-10 flex-shrink-0 rounded-xl px-4 text-sm font-black ring-1 transition ${tab === item ? 'bg-[#17446E] text-white ring-[#17446E]' : 'bg-white text-[#64748B] ring-[#D9E6F5] hover:bg-[#EAF4FF] hover:text-[#2F80D8]'}`}>
            {item}
          </button>
        ))}
      </div>
      {loading ? <LoadingState label="Memuat tugas siswa..." /> : rows.length > 0 ? (
        visibleRows.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleRows.map((assignment) => {
              const submission = getLocalAssignmentSubmission(assignment.id, user?.id)
              return (
                <SectionCard key={assignment.id}>
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <StatusBadge tone={submission ? 'green' : statusTone(assignment.status)}>{submission ? 'Terkirim' : assignment.status}</StatusBadge>
                    <StatusBadge tone="cyan">{assignment.subject}</StatusBadge>
                  </div>
                  <h2 className="text-lg font-extrabold">{assignment.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-500">{assignment.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {normalizeAssignmentSubmissionTypes(assignment.submissionTypes).map((type) => (
                      <span key={type} className="rounded-full bg-[#E0F2FE] px-2.5 py-1 text-xs font-black text-[#0284c7]">
                        {assignmentSubmissionTypeOptions.find((item) => item.value === type)?.label || type}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs font-bold text-slate-500">{assignment.subject} · Deadline {formatAssignmentDateTime(assignment.deadline)}</p>
                  <button onClick={() => openAssignment(assignment)} className="mt-5 w-full rounded-2xl bg-galaxy-action px-4 py-3 text-sm font-bold text-white">
                    {submission ? 'Lihat / perbarui jawaban' : 'Kerjakan tugas'}
                  </button>
                </SectionCard>
              )
            })}
          </div>
        ) : (
          <EmptyState
            title={tab === 'Selesai' ? 'Belum ada tugas selesai.' : 'Tidak ada tugas pada tab ini.'}
            description={tab === 'Selesai' ? 'Tugas yang sudah kamu kirim akan muncul di sini.' : 'Coba buka tab Riwayat atau lanjutkan materi sambil menunggu tugas baru.'}
            action={<QuickActionButton icon={BookOpen} label="Lanjutkan Belajar" onClick={() => navigate('/siswa/materi')} />}
          />
        )
      ) : (
        <EmptyState title="Belum ada tugas aktif." description="Belum ada tugas aktif. Kamu bisa lanjut belajar materi terakhir." action={<QuickActionButton icon={BookOpen} label="Lanjutkan Belajar" onClick={() => navigate('/siswa/materi')} />} />
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
  const { changeTeacherPassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const isTeacher = user.role === 'guru'
  const profileDetails = [
    user.nip ? `NIP ${user.nip}` : '',
    user.nis ? `NIS ${user.nis}` : '',
    user.className ? `Kelas ${user.className}` : '',
    user.subject ? `Mapel ${user.subject}` : '',
    user.email || '',
  ].filter(Boolean)

  function submitPasswordChange(event) {
    event.preventDefault()
    setPasswordMessage('')
    setPasswordError('')

    if (nextPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password belum sama.')
      return
    }

    try {
      changeTeacherPassword(currentPassword, nextPassword)
      setCurrentPassword('')
      setNextPassword('')
      setConfirmPassword('')
      setPasswordMessage('Password berhasil diganti. Login berikutnya tetap memakai NIP sebagai username.')
    } catch (error) {
      setPasswordError(error.message || 'Password belum bisa diganti.')
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Profil" title={isTeacher ? 'Profil guru' : 'Profil belajar'} description="Identitas akun dan pengaturan keamanan." />
      <SectionCard className="max-w-3xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid h-24 w-24 place-items-center rounded-2xl bg-galaxy-action text-3xl font-extrabold text-white shadow-glow">{user.avatar}</div>
          <div>
            <h2 className="text-3xl font-extrabold">{user.name}</h2>
            <p className="mt-1 text-gray-500">{profileDetails.join(' · ')}</p>
            <div className="mt-3 flex flex-wrap gap-2">{badges.slice(0, 3).map((badge) => <StatusBadge key={badge.id}>{badge.name}</StatusBadge>)}</div>
          </div>
        </div>
        <div className="mt-6 rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-extrabold text-galaxy-purple ring-1 ring-purple-100">Profil aktif dan tersimpan di perangkat.</div>
      </SectionCard>

      {isTeacher && (
        <SectionCard className="mt-5 max-w-3xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-950">Keamanan akun</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Username guru tetap memakai NIP. Password awal adalah NIP, lalu bisa diganti dari sini.
              </p>
            </div>
            <StatusBadge tone="cyan">NIP login</StatusBadge>
          </div>

          <form onSubmit={submitPasswordChange} className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm font-bold text-gray-700">
                Password saat ini
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="rounded-xl border border-blue-100 bg-white px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  placeholder="NIP atau password lama"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-gray-700">
                Password baru
                <input
                  type="password"
                  value={nextPassword}
                  onChange={(event) => setNextPassword(event.target.value)}
                  className="rounded-xl border border-blue-100 bg-white px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  placeholder="Minimal 6 karakter"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-gray-700">
                Konfirmasi
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="rounded-xl border border-blue-100 bg-white px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  placeholder="Ulangi password"
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold leading-5 text-gray-500">
                Setelah diganti, guru login dengan NIP sebagai username dan password baru.
              </p>
              <button className="rounded-xl bg-galaxy-deep px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-700">
                Simpan password
              </button>
            </div>

            {passwordMessage && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">{passwordMessage}</p>}
            {passwordError && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-100">{passwordError}</p>}
          </form>
        </SectionCard>
      )}
    </div>
  )
}

const attendanceStatuses = ['Hadir', 'Izin', 'Sakit', 'Alpa']
const attendanceTypeOptions = [
  {
    value: 'daily',
    label: 'Daftar Hadir Harian',
    shortLabel: 'Harian',
    actor: 'Wali kelas',
    description: 'Absensi resmi harian yang diisi wali kelas.',
  },
  {
    value: 'subject',
    label: 'Daftar Hadir Mapel',
    shortLabel: 'Per Mapel',
    actor: 'Guru mapel',
    description: 'Absensi setiap pertemuan saat guru mengajar di kelas.',
  },
]

const gradeFormatClassRoster = {
  'XI Utsman Bin Affan': [
    ['ABD. WAHAB', 'L'], ['ADAM PUTRA PERDANA', 'L'], ['AL HUSNA', 'P'], ['ANDI NUR SALAM', 'L'],
    ['ASLAM', 'L'], ['BERLIAN', 'P'], ['DANDI BARATA', 'L'], ['KRISDAYANTI', 'P'],
    ['MUH. ALI RAHMAT', 'L'], ['MUH. YAZIN', 'L'], ['MUH. FAJRI', 'L'], ['MUHAMMAD YASIN', 'L'],
    ['NABILA', 'P'], ['NAYLA', 'P'], ['NUR SYAMSI', 'P'], ['RAHMAT SANJAYA', 'L'],
    ['RAMLI', 'L'], ['RICO SUKARNO', 'L'], ['SAKINAH', 'P'], ['SALMAN ALFAREZY', 'L'],
    ['SALMAN ALFARISI', 'L'], ['SALSABILAH', 'P'], ['SITI AINUN NISYA', 'P'], ['ZAHIRA', 'P'],
  ],
  'XI Ali Bin Abi Thalib': [
    ['ABD. HAMID SATRIADI', 'L'], ['ABD. KARIM', 'L'], ['ADHA NOVIANA', 'L'], ['ARIFIN', 'L'],
    ['ARYADITYA PUTRA', 'L'], ['AYATUL HUSNA', 'P'], ['DZUL JALALI WALIQRAM', 'L'], ['ERNA', 'P'],
    ['FAUZI TEGUH', 'L'], ['FERDI', 'L'], ['HALIDAH', 'P'], ['HARIANDI', 'L'],
    ['IRMA', 'P'], ['M. SALJI', 'L'], ['MUH. ARPIN', 'L'], ['MUH. ADRIANO', 'L'],
    ['MUH. RESKI ARIF RAHMAN', 'L'], ['MUH. TASBIQ RISKY', 'L'], ['NUR FADILA', 'P'], ['RIKI MAULANA', 'L'],
    ['SAHARUDDIN', 'L'], ['SUCI SETIAWATI', 'P'], ['SYAHRINI', 'P'], ['NUR SALEH', 'L'],
    ['MAGFIRA ZASKIA', 'P'],
  ],
  'XII Abu Bakar Ash Siddiq': [
    ['ACHMAD', 'L'], ['AJIE SAPUTRA', 'L'], ['ALGAZALI', 'L'], ['ALIF HALIL', 'L'],
    ['ANDIRA FALDIA', 'P'], ['FERDY PRANANDA', 'L'], ['HENRIK SAPUTRA', 'L'], ['INGGI ADITYA', 'L'],
    ['ISDA DAHLIA', 'P'], ['JULIANI', 'P'], ['LASTRIANI', 'P'], ['M. FACHMI', 'L'],
    ['M. YUSUF', 'L'], ['MARWA', 'P'], ['MUHARRAM JANUARI', 'L'], ['MUTRIFA', 'P'],
    ['NABILA', 'P'], ['NURFAIDAH', 'P'], ['PANIA', 'P'], ['PINA SARIANTI', 'P'],
    ['RAY LALO MAULANA', 'L'], ['RESKI ADITIA', 'L'], ['REZA ADITYA', 'L'], ['SITI KHUMAIRAH', 'P'],
    ['SULAEMAN', 'L'], ['WAHYUNI', 'P'], ['WINDI MAJID', 'P'],
  ],
  'XII Umar Bin Khattab': [
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
  return promoteHomeroomClassName(className) || 'Kelas umum'
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
  if (role === 'guru') return normalizeTeacherProfileRows(normalizedRows)
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

const schoolAttendanceStorageKey = 'islelearn-attendance-school'

function attendanceStorageKey(user) {
  return `islelearn-attendance-${user?.id || 'demo'}`
}

function normalizeAttendanceType(type) {
  return type === 'subject' ? 'subject' : 'daily'
}

function getAttendanceTypeMeta(type) {
  return attendanceTypeOptions.find((item) => item.value === normalizeAttendanceType(type)) || attendanceTypeOptions[0]
}

function attendanceSessionMatchesScope(session, { date, className, type = 'daily', subject = '', lessonTime = '' } = {}) {
  const sessionType = normalizeAttendanceType(session?.type)
  if (date && session?.date !== date) return false
  if (className && promoteClassName(session?.className) !== promoteClassName(className)) return false
  if (sessionType !== normalizeAttendanceType(type)) return false
  if (sessionType === 'subject') {
    if (subject && String(session?.subject || '') !== String(subject || '')) return false
    if (lessonTime && String(session?.lessonTime || '') !== String(lessonTime || '')) return false
  }
  return true
}

function normalizeAttendanceSession(session = {}) {
  return {
    ...session,
    type: normalizeAttendanceType(session.type),
    subject: session.subject || '',
    lessonTime: session.lessonTime || '',
    teacherName: session.teacherName || '',
    className: promoteClassName(session.className),
    rows: Array.isArray(session.rows)
      ? session.rows.map((row) => ({ ...row, className: promoteClassName(row.className || session.className) }))
      : [],
  }
}

function dedupeAttendanceSessions(rows = []) {
  const byScope = new Map()
  rows.forEach((row) => {
    const session = normalizeAttendanceSession(row)
    if (isLegacyPreviewClassName(session.className)) return
    const key = [
      session.date,
      promoteClassName(session.className),
      normalizeAttendanceType(session.type),
      session.subject || '',
      session.lessonTime || '',
    ].join('|')
    byScope.set(key, session)
  })
  return Array.from(byScope.values()).sort((a, b) => String(b.updatedAt || b.date || '').localeCompare(String(a.updatedAt || a.date || '')))
}

function getAttendanceSessions(user) {
  return dedupeAttendanceSessions([
    ...safeReadLocalJson(schoolAttendanceStorageKey, []),
    ...safeReadLocalJson(attendanceStorageKey(user), []),
  ])
}

function setAttendanceSessions(user, rows) {
  const normalizedRows = dedupeAttendanceSessions(Array.isArray(rows) ? rows : [])
  safeWriteLocalJson(schoolAttendanceStorageKey, normalizedRows)
  safeWriteLocalJson(attendanceStorageKey(user), normalizedRows)
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
  const targetClass = promoteClassName(className)
  return roster.filter((item) => promoteClassName(item.className) === targetClass)
}

function getGradeRosterForClass(roster, className) {
  const targetClass = promoteClassName(className)
  const rows = roster.filter((item) => promoteClassName(item.className) === targetClass)
  if (rows.length) return rows
  return getGradeFormatRoster().filter((item) => promoteClassName(item.className) === targetClass)
}

function getAttendanceSession(sessions, date, className, options = {}) {
  return sessions.find((item) => attendanceSessionMatchesScope(item, { date, className, ...options })) || null
}

function buildAttendanceRows(roster, savedRows = []) {
  const savedById = new Map(savedRows.map((item) => [item.studentId || item.id || item.name, item]))
  return roster.map((student) => {
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
  const sessionType = normalizeAttendanceType(session.type)
  const nextSession = {
    ...session,
    type: sessionType,
    id: session.id || `attendance-${sessionType}-${session.date}-${session.className}-${session.subject || 'harian'}-${session.lessonTime || ''}`.replace(/\s+/g, '-').toLowerCase(),
    updatedAt: new Date().toISOString(),
  }
  const exists = sessions.some((item) => attendanceSessionMatchesScope(item, nextSession))
  return exists
    ? sessions.map((item) => (attendanceSessionMatchesScope(item, nextSession) ? { ...item, ...nextSession } : item))
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

function getAttendanceSessionsForRange(sessions, className, range, options = {}) {
  const targetClass = promoteClassName(className)
  return sessions.filter((session) => (
    promoteClassName(session.className) === targetClass
    && isIsoDateInRange(session.date, range)
    && attendanceSessionMatchesScope(session, options)
  ))
}

function filterAttendanceSessionsByMode(sessions, { type = 'daily', className = '', subject = '' } = {}) {
  return sessions.filter((session) => (
    attendanceSessionMatchesScope(session, { type, className, subject })
  ))
}

function buildStudentAttendanceRecap(roster, rangeSessions) {
  return roster.map((student) => {
    const counts = attendanceStatuses.reduce((acc, status) => ({ ...acc, [status]: 0 }), {})
    const dailyStatuses = []

    rangeSessions.forEach((session) => {
      const row = Array.isArray(session.rows)
        ? session.rows.find((item) => item.studentId === student.id || item.name === student.name)
        : null
      const status = attendanceStatuses.includes(row?.status) ? row.status : ''
      if (status) {
        counts[status] += 1
        dailyStatuses.push({
          date: session.date,
          day: formatAttendanceDate(session.date, { weekday: 'long' }),
          label: formatAttendanceDate(session.date, { weekday: 'short', day: '2-digit', month: 'short' }),
          status,
          note: row?.note || '',
          subject: session.subject || '',
          lessonTime: session.lessonTime || '',
        })
      }
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
      dailyStatuses,
    }
  })
}

function buildSemesterMonthRecap(sessions, className, anchorDate = toLocalIsoDate(), options = {}) {
  const semesterRange = getAttendanceSemesterRange(anchorDate)
  return Array.from({ length: semesterRange.endMonth - semesterRange.startMonth + 1 }, (_, index) => {
    const monthDate = new Date(semesterRange.year, semesterRange.startMonth + index, 1)
    const monthRange = getAttendanceMonthRange(toLocalIsoDate(monthDate))
    const monthSessions = getAttendanceSessionsForRange(sessions, className, monthRange, options)
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

function AttendanceChartPair({ weeklyData, monthlyData, showWeekly = true }) {
  return (
    <div className={`grid gap-4 ${showWeekly ? 'xl:grid-cols-2' : ''}`}>
      {showWeekly && <div>
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
      </div>}

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

function AttendanceRecapTable({ monthlyRows, semesterRows, leftTitle = 'Bulan ini', rightTitle = 'Semester ini' }) {
  const semesterByStudent = new Map(semesterRows.map((row) => [row.studentId, row]))
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[58rem] text-left text-sm">
        <thead>
          <tr className="border-b border-[#D9E6F5] text-[10px] uppercase tracking-[0.14em] text-[#2F80D8]">
            <th rowSpan={2} className="py-3 pr-4 font-black">Siswa</th>
            <th colSpan={5} className="bg-[#EEF7FF] px-3 py-2 text-center font-black">{leftTitle}</th>
            <th colSpan={5} className="bg-[#F8FBFF] px-3 py-2 text-center font-black">{rightTitle}</th>
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

function escapeReportHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function tableRowsToHtml(rows = []) {
  if (!rows.length) {
    return '<p class="empty">Belum ada data pada periode ini.</p>'
  }

  const headers = Object.keys(rows[0])
  return `
    <table>
      <thead><tr>${headers.map((header) => `<th>${escapeReportHtml(header)}</th>`).join('')}</tr></thead>
      <tbody>
        ${rows.map((row) => `<tr>${headers.map((header) => `<td>${escapeReportHtml(row[header])}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `
}

function getMonthDates(anchorDate = toLocalIsoDate()) {
  const range = getAttendanceMonthRange(anchorDate)
  const days = []
  for (let date = range.startIso; date <= range.endIso; date = addDaysIso(date, 1)) {
    days.push(date)
  }
  return days
}

function attendanceStatusExportLabel(status = '') {
  if (status === 'Alpa') return 'Alfa'
  return status || ''
}

function attendanceStatusKey(status = '') {
  if (status === 'Alfa') return 'Alpa'
  return status
}

function getStudentSessionRow(session, student) {
  return Array.isArray(session?.rows)
    ? session.rows.find((row) => row.studentId === student.studentId || row.studentId === student.id || row.name === student.name)
    : null
}

function getStudentStatusOnDate(sessions, date, student) {
  const session = sessions.find((item) => item.date === date && getStudentSessionRow(item, student))
  return attendanceStatusExportLabel(getStudentSessionRow(session, student)?.status || '')
}

function countStudentStatusInSessions(sessions, student, status) {
  const targetStatus = attendanceStatusKey(status)
  return sessions.reduce((total, session) => {
    const row = getStudentSessionRow(session, student)
    return total + (row?.status === targetStatus ? 1 : 0)
  }, 0)
}

function buildDigitalMonthRows(students = [], sessions = [], selectedDate = toLocalIsoDate()) {
  const monthDates = getMonthDates(selectedDate)
  return students.map((student, index) => {
    const statusByDate = monthDates.map((date) => getStudentStatusOnDate(sessions, date, student))
    const sakit = statusByDate.filter((status) => status === 'Sakit').length
    const izin = statusByDate.filter((status) => status === 'Izin').length
    const alfa = statusByDate.filter((status) => status === 'Alfa').length
    const terlambat = statusByDate.filter((status) => status === 'Terlambat').length
    const hadir = statusByDate.filter((status) => status === 'Hadir').length
    const terisi = statusByDate.filter(Boolean).length
    return {
      no: index + 1,
      name: student.name,
      gender: student.gender || '',
      statuses: statusByDate,
      sakit,
      izin,
      alfa,
      terlambat,
      tidakHadir: sakit + izin + alfa,
      hadir,
      rate: terisi ? Math.round((hadir / terisi) * 100) : 0,
    }
  })
}

function getAttendanceMatrixDates(type, sessions = [], selectedDate = toLocalIsoDate()) {
  if (normalizeAttendanceType(type) === 'daily') return getMonthDates(selectedDate)
  const monthRange = getAttendanceMonthRange(selectedDate)
  return Array.from(new Set(
    sessions
      .map((session) => session.date)
      .filter((date) => date && isIsoDateInRange(date, monthRange)),
  )).sort()
}

function attendanceStatusInitial(status = '') {
  if (status === 'Hadir') return 'H'
  if (status === 'Izin') return 'I'
  if (status === 'Sakit') return 'S'
  if (status === 'Alpa' || status === 'Alfa') return 'A'
  return '-'
}

function attendanceMatrixCellClass(status = '') {
  if (status === 'Hadir') return 'bg-emerald-50 text-emerald-700'
  if (status === 'Izin') return 'bg-amber-50 text-amber-700'
  if (status === 'Sakit') return 'bg-sky-50 text-sky-700'
  if (status === 'Alpa' || status === 'Alfa') return 'bg-rose-50 text-rose-700'
  return 'bg-white text-slate-300'
}

function AttendanceMonthMatrix({ type, students = [], sessions = [], selectedDate, onSelectDate }) {
  const dates = getAttendanceMatrixDates(type, sessions, selectedDate)
  const mode = getAttendanceTypeMeta(type)

  if (!students.length) {
    return (
      <DashboardPanel title={`Tabel ${mode.shortLabel.toLowerCase()}`} description="Siswa selalu dipisahkan berdasarkan rombel yang dipilih.">
        <EmptyState title="Belum ada siswa di kelas ini." description="Tambahkan atau pindahkan siswa melalui Data Siswa pada akun admin." />
      </DashboardPanel>
    )
  }

  if (normalizeAttendanceType(type) === 'subject' && !dates.length) {
    return (
      <DashboardPanel title="Tabel pertemuan mapel" description="Kolom tanggal muncul setelah guru menyimpan absensi pertemuan.">
        <EmptyState title="Belum ada tanggal pertemuan." description="Pilih tanggal mengajar, isi kehadiran, lalu tekan Simpan." />
      </DashboardPanel>
    )
  }

  const rowData = students.map((student, index) => {
    const statuses = dates.map((date) => getStudentStatusOnDate(sessions, date, student))
    return {
      student,
      no: index + 1,
      statuses,
      hadir: statuses.filter((status) => status === 'Hadir').length,
      izin: statuses.filter((status) => status === 'Izin').length,
      sakit: statuses.filter((status) => status === 'Sakit').length,
      alpa: statuses.filter((status) => status === 'Alfa').length,
    }
  })
  const tableWidth = Math.max(860, 300 + dates.length * 46)

  return (
    <DashboardPanel
      title={type === 'daily' ? 'Absensi wali kelas sebulan penuh' : 'Absensi mapel per tanggal mengajar'}
      description={type === 'daily'
        ? `${getAttendanceMonthRange(selectedDate).label}. Semua tanggal ditampilkan, termasuk tanggal yang belum diisi.`
        : `${getAttendanceMonthRange(selectedDate).label}. Hanya tanggal pertemuan yang sudah disimpan guru yang ditampilkan.`}
    >
      <div className="overflow-x-auto rounded-xl border border-[#D9E6F5]">
        <table className="text-left text-xs" style={{ minWidth: `${tableWidth}px`, width: '100%' }}>
          <thead className="bg-[#F8FBFF] text-[#64748B]">
            <tr className="border-b border-[#D9E6F5]">
              <th className="sticky left-0 z-20 w-12 bg-[#F8FBFF] px-2 py-3 text-center font-black">No</th>
              <th className="sticky left-12 z-20 min-w-48 bg-[#F8FBFF] px-3 py-3 font-black">Nama siswa</th>
              {dates.map((date) => {
                const active = date === selectedDate
                return (
                  <th key={date} className={`min-w-11 px-1 py-2 text-center font-black ${active ? 'bg-[#DDF2FF] text-[#17446E]' : ''}`}>
                    <button type="button" onClick={() => onSelectDate(date)} className="w-full rounded-md py-1 hover:bg-white" title={`Buka ${formatAttendanceDate(date, { day: '2-digit', month: 'long', year: 'numeric' })}`}>
                      <span className="block text-[9px] uppercase">{formatAttendanceDate(date, { weekday: 'short' })}</span>
                      <span className="mt-0.5 block font-mono text-sm">{parseIsoDate(date).getDate()}</span>
                    </button>
                  </th>
                )
              })}
              {['H', 'I', 'S', 'A'].map((label) => <th key={label} className="min-w-10 bg-[#EEF7FF] px-1 py-3 text-center font-black text-[#17446E]">{label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9E6F5] bg-white">
            {rowData.map((row) => (
              <tr key={row.student.id}>
                <td className="sticky left-0 z-10 bg-white px-2 py-2 text-center font-mono font-black text-[#64748B]">{row.no}</td>
                <td className="sticky left-12 z-10 bg-white px-3 py-2">
                  <p className="font-black text-[#132437]">{row.student.name}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-[#64748B]">{row.student.nis || row.student.className}</p>
                </td>
                {row.statuses.map((status, index) => (
                  <td key={`${row.student.id}-${dates[index]}`} className="p-1 text-center">
                    <span title={status || 'Belum diisi'} className={`grid h-7 min-w-7 place-items-center rounded-md font-mono text-[11px] font-black ${attendanceMatrixCellClass(status)}`}>
                      {attendanceStatusInitial(status)}
                    </span>
                  </td>
                ))}
                {[row.hadir, row.izin, row.sakit, row.alpa].map((value, index) => (
                  <td key={`${row.student.id}-summary-${index}`} className="bg-[#F8FBFF] px-1 py-2 text-center font-mono font-black text-[#17446E]">{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs font-semibold text-[#64748B]">H = Hadir, I = Izin, S = Sakit, A = Alpa. Klik tanggal pada kepala tabel untuk membuka pengisian tanggal tersebut.</p>
    </DashboardPanel>
  )
}

function buildDigitalSemesterRows(students = [], sessions = []) {
  return students.map((student, index) => {
    const sakit = countStudentStatusInSessions(sessions, student, 'Sakit')
    const izin = countStudentStatusInSessions(sessions, student, 'Izin')
    const alfa = countStudentStatusInSessions(sessions, student, 'Alfa')
    const terlambat = countStudentStatusInSessions(sessions, student, 'Terlambat')
    const hadir = countStudentStatusInSessions(sessions, student, 'Hadir')
    const total = sakit + izin + alfa + terlambat + hadir
    return {
      no: index + 1,
      name: student.name,
      gender: student.gender || '',
      sakit,
      izin,
      alfa,
      terlambat,
      tidakHadir: sakit + izin + alfa,
      hadir,
      rate: total ? Math.round((hadir / total) * 100) : 0,
    }
  })
}

function buildSubjectMonthlyRows(students = [], monthlySessions = [], semesterSessions = []) {
  return students.map((student, index) => {
    const month = buildDigitalSemesterRows([student], monthlySessions)[0]
    const semester = buildDigitalSemesterRows([student], semesterSessions)[0]
    return {
      No: index + 1,
      Nama: student.name,
      'L/P': student.gender || '',
      'Hadir Bulan Ini': month.hadir,
      'Sakit Bulan Ini': month.sakit,
      'Izin Bulan Ini': month.izin,
      'Alfa Bulan Ini': month.alfa,
      'Persen Bulan Ini': `${month.rate}%`,
      'Hadir Semester': semester.hadir,
      'Sakit Semester': semester.sakit,
      'Izin Semester': semester.izin,
      'Alfa Semester': semester.alfa,
      'Persen Semester': `${semester.rate}%`,
    }
  })
}

function buildAttendanceExportReport({ type, className, subject, lessonTime, teacherName, selectedDate, monthlySessions, monthlySummary, semesterSessions, semesterSummary, students }) {
  const mode = getAttendanceTypeMeta(type)
  const monthRange = getAttendanceMonthRange(selectedDate)
  const semesterRange = getAttendanceSemesterRange(selectedDate)
  const monthDates = getMonthDates(selectedDate)
  const title = `${mode.label} ${className}`
  const subjectLine = type === 'subject' ? `${subject} · ${lessonTime}` : 'Absensi harian wali kelas'
  const monthRows = buildDigitalMonthRows(students, monthlySessions, selectedDate)
  const semesterRows = buildDigitalSemesterRows(students, semesterSessions)
  return {
    title,
    filename: `${slugFileName(title)}-${toLocalIsoDate()}`,
    mode,
    className,
    subjectLine,
    teacherName,
    selectedDate,
    monthRange,
    semesterRange,
    monthDates,
    monthlySummary,
    semesterSummary,
    monthRows,
    semesterRows,
    subjectRows: buildSubjectMonthlyRows(students, monthlySessions, semesterSessions),
  }
}

function buildAttendanceReportHtml(report, { print = false } = {}) {
  const dailyMode = report.mode.value === 'daily'
  const style = `
    <style>
      body { font-family: Arial, sans-serif; color: #132437; margin: ${print ? '24px' : '16px'}; }
      h1 { margin: 0; font-size: 20px; }
      h2 { margin: 22px 0 8px; font-size: 15px; color: #17446E; }
      p { margin: 4px 0; color: #44546A; font-size: 12px; }
      .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 16px; margin-top: 12px; }
      .summary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 16px 0; }
      .box { border: 1px solid #D9E6F5; border-radius: 10px; padding: 10px; background: #F8FBFF; }
      .box b { display: block; font-size: 22px; color: #17446E; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; page-break-inside: auto; }
      th, td { border: 1px solid #C9D8E8; padding: 6px 7px; font-size: 11px; vertical-align: top; }
      th { background: #C1FA70; color: #132437; text-align: center; }
      td.center { text-align: center; }
      td.name { min-width: 180px; font-weight: 700; }
      .sheet { page-break-after: always; }
      .wide { min-width: 1320px; }
      .scroll { overflow-x: auto; }
      tr { page-break-inside: avoid; }
      .empty { border: 1px dashed #C9D8E8; padding: 12px; border-radius: 10px; }
      @media print { body { margin: 12mm; } .no-print { display: none; } }
    </style>
  `
  const monthTable = `
    <div class="scroll">
      <table class="wide">
        <thead>
          <tr>
            <th rowspan="2">NO</th>
            <th rowspan="2">NAMA PESERTA DIDIK</th>
            <th>TGL</th>
            ${report.monthDates.map((date) => `<th>${parseIsoDate(date).getDate()}</th>`).join('')}
            <th colspan="6">KET</th>
          </tr>
          <tr>
            <th>L/P</th>
            ${report.monthDates.map((date) => `<th>${formatAttendanceDate(date, { weekday: 'short' })}</th>`).join('')}
            <th>S</th><th>I</th><th>A</th><th>T</th><th>HADIR</th><th>PERSEN</th>
          </tr>
        </thead>
        <tbody>
          ${report.monthRows.map((row) => `
            <tr>
              <td class="center">${row.no}</td>
              <td class="name">${escapeReportHtml(row.name)}</td>
              <td class="center">${escapeReportHtml(row.gender)}</td>
              ${row.statuses.map((status) => `<td class="center">${escapeReportHtml(status)}</td>`).join('')}
              <td class="center">${row.sakit}</td>
              <td class="center">${row.izin}</td>
              <td class="center">${row.alfa}</td>
              <td class="center">${row.terlambat}</td>
              <td class="center">${row.hadir}</td>
              <td class="center">${row.rate}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
  const semesterTable = `
    <table>
      <thead>
        <tr>
          <th rowspan="2">NO</th>
          <th rowspan="2">NAMA PESERTA DIDIK</th>
          <th>TGL</th>
          <th colspan="7">KET</th>
        </tr>
        <tr>
          <th>L/P</th><th>S</th><th>I</th><th>A</th><th>T</th><th>TDK HADIR</th><th>HADIR</th><th>PERSENTASE KEHADIRAN</th>
        </tr>
      </thead>
      <tbody>
        ${report.semesterRows.map((row) => `
          <tr>
            <td class="center">${row.no}</td>
            <td class="name">${escapeReportHtml(row.name)}</td>
            <td class="center">${escapeReportHtml(row.gender)}</td>
            <td class="center">${row.sakit}</td>
            <td class="center">${row.izin}</td>
            <td class="center">${row.alfa}</td>
            <td class="center">${row.terlambat}</td>
            <td class="center">${row.tidakHadir}</td>
            <td class="center">${row.hadir}</td>
            <td class="center">${row.rate}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `

  return `<!doctype html>
    <html>
      <head><meta charset="utf-8" />${style}</head>
      <body>
        <button class="no-print" onclick="window.print()" style="margin-bottom:14px;padding:10px 14px;border-radius:10px;border:0;background:#17446E;color:white;font-weight:700">Cetak / Simpan PDF</button>
        <h1>${escapeReportHtml(report.title)}</h1>
        <p>${escapeReportHtml(school.name)} · ${escapeReportHtml(report.mode.actor)}</p>
        <div class="meta">
          <p><b>Kelas:</b> ${escapeReportHtml(report.className)}</p>
          <p><b>Jenis:</b> ${escapeReportHtml(report.mode.label)}</p>
          <p><b>Mapel/Jam:</b> ${escapeReportHtml(report.subjectLine)}</p>
          <p><b>Guru:</b> ${escapeReportHtml(report.teacherName || '-')}</p>
          <p><b>Bulan:</b> ${escapeReportHtml(report.monthRange.label)}</p>
          <p><b>Semester:</b> ${escapeReportHtml(report.semesterRange.label)}</p>
        </div>
        <div class="summary">
          <div class="box"><span>Bulanan</span><b>${report.monthlySummary.rate}%</b><p>H ${report.monthlySummary.hadir} · I ${report.monthlySummary.izin} · S ${report.monthlySummary.sakit} · A ${report.monthlySummary.alpa}</p></div>
          <div class="box"><span>Semester</span><b>${report.semesterSummary.rate}%</b><p>H ${report.semesterSummary.hadir} · I ${report.semesterSummary.izin} · S ${report.semesterSummary.sakit} · A ${report.semesterSummary.alpa}</p></div>
        </div>
        ${dailyMode ? `
          <section class="sheet">
            <h2>${escapeReportHtml(report.monthRange.label.toUpperCase())}</h2>
            ${monthTable}
          </section>
          <section>
            <h2>REKAP HADIR ${escapeReportHtml(report.semesterRange.semester.toUpperCase())}</h2>
            ${semesterTable}
          </section>
        ` : `
          <h2>REKAP PERTEMUAN GURU MAPEL - BULANAN DAN SEMESTER</h2>
          ${tableRowsToHtml(report.subjectRows)}
        `}
      </body>
    </html>`
}

function downloadAttendanceExcel(report) {
  downloadTextFile(`${report.filename}.xls`, '\ufeff' + buildAttendanceReportHtml(report), 'application/vnd.ms-excel;charset=utf-8')
}

function printAttendancePdf(report) {
  const printWindow = window.open('', '_blank', 'width=1100,height=800')
  if (!printWindow) {
    downloadTextFile(`${report.filename}.html`, buildAttendanceReportHtml(report, { print: true }), 'text/html;charset=utf-8')
    return
  }
  printWindow.document.write(buildAttendanceReportHtml(report, { print: true }))
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 250)
}

const teacherDashboardThresholds = {
  lowAttendanceRate: 85,
  lowGradeScore: 75,
}

const teacherWorkflowTones = [
  'from-[#E0F2FE] to-[#F8FBFF] text-sky-800 ring-sky-100',
  'from-[#DCFCE7] to-[#F8FBFF] text-emerald-800 ring-emerald-100',
  'from-[#FEF3C7] to-[#F8FBFF] text-amber-800 ring-amber-100',
  'from-[#F5F3FF] to-[#F8FBFF] text-violet-800 ring-violet-100',
  'from-[#FFE4E6] to-[#F8FBFF] text-rose-800 ring-rose-100',
  'from-[#ECFEFF] to-[#F8FBFF] text-cyan-800 ring-cyan-100',
]

function isTeacherDashboardStatus(item, status) {
  return normalizeLookupText(item?.status || '') === normalizeLookupText(status)
}

function isTeacherDashboardPublished(item) {
  return ['publish', 'published', 'aktif', 'active'].includes(normalizeLookupText(item?.status || ''))
}

function isTeacherDashboardDraft(item) {
  const status = normalizeLookupText(item?.status || '')
  return !status || ['draft', 'draf', 'belumpublish', 'belumterbit'].includes(status)
}

function getTeacherDashboardMaterials(user, subjectOptions = []) {
  return filterRowsByTeacherSubjects(uniqueRowsById([
    ...schoolMaterials,
    ...readLocalRowsByPrefix('islelearn-teacher-materials-'),
  ]).map((item) => ({
    ...item,
    subject: canonicalSubjectName(item.subject || item.mapel || item.category || 'Mata pelajaran'),
    status: item.status || 'Publish',
  })), user, subjectOptions)
}

function getTeacherDashboardAssignments(user, subjectOptions = []) {
  return filterRowsByTeacherSubjects(readLocalRowsByPrefix('islelearn-teacher-assignments-'), user, subjectOptions)
}

function getTeacherDashboardQuizzes(user, subjectOptions = []) {
  return filterRowsByTeacherSubjects(readLocalRowsByPrefix('islelearn-teacher-quizzes-'), user, subjectOptions)
}

function getTeacherDashboardQuestions(user, subjectOptions = []) {
  return filterRowsByTeacherSubjects(getAllLocalTeacherQuestions(), user, subjectOptions)
}

function getTeacherClassStudentCount(roster = [], className = '') {
  const targetClass = promoteClassName(className)
  const count = roster.filter((student) => promoteClassName(student.className) === targetClass).length
  return count
}

function getTeacherAssignmentSubmissionCount(assignments = []) {
  return assignments.reduce((sum, assignment) => sum + getLocalAssignmentSubmissions(assignment.id).length, 0)
}

function getTeacherDashboardTimestamp(row = {}) {
  const value = row.updatedAt || row.updated_at || row.createdAt || row.created_at || row.submittedAt || row.date || row.deadline
  const time = value ? new Date(value).getTime() : 0
  return Number.isFinite(time) ? time : 0
}

function formatTeacherDashboardDate(value) {
  const time = getTeacherDashboardTimestamp({ date: value })
  if (!time) return 'Tanggal belum ada'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(time))
}

function getAssignmentDashboardClassNames(assignment = {}) {
  const names = normalizeAssignmentClassNames(assignment)
  return names.length ? names.map(promoteClassName) : [promoteClassName(assignment.className || 'Kelas umum')]
}

function buildTeacherAttentionItems({ draftMaterials = [], draftAssignments = [], draftQuizzes = [], activeAssignments = [], attendanceSessions = [], gradebookRows = [], questionRows = [] }) {
  const items = []

  if (draftMaterials.length > 0) {
    items.push({
      id: 'draft-materials',
      type: 'materi',
      priority: 10,
      icon: BookOpen,
      title: `${draftMaterials.length} materi masih draft`,
      meta: 'Publish materi yang sudah siap agar bisa dibuka siswa.',
      actionLabel: 'Buka materi',
      target: '/guru/materi',
    })
  }

  if (draftAssignments.length > 0) {
    items.push({
      id: 'draft-assignments',
      type: 'tugas',
      priority: 20,
      icon: ClipboardCheck,
      title: `${draftAssignments.length} tugas belum aktif`,
      meta: 'Lengkapi instruksi, target kelas, dan tenggat sebelum diterbitkan.',
      actionLabel: 'Cek tugas',
      target: '/guru/tugas',
    })
  }

  if (draftQuizzes.length > 0) {
    items.push({
      id: 'draft-quizzes',
      type: 'kuis',
      priority: 30,
      icon: FileQuestion,
      title: `${draftQuizzes.length} kuis masih draft`,
      meta: 'Publish kuis saat soal dan durasi sudah siap.',
      actionLabel: 'Cek kuis',
      target: '/guru/kuis-live',
    })
  }

  activeAssignments.forEach((assignment) => {
    const submissionCount = getLocalAssignmentSubmissions(assignment.id).length
    if (!submissionCount) return
    items.push({
      id: `assignment-${assignment.id}`,
      type: 'tugas',
      priority: 40,
      icon: ClipboardCheck,
      title: `${submissionCount} submission perlu dinilai`,
      meta: `${assignment.title || 'Tugas'} · ${assignment.className || 'Kelas'}`,
      actionLabel: 'Nilai tugas',
      target: '/guru/tugas',
    })
  })

  const gradeSummary = summarizeGradebook(gradebookRows)
  if (gradeSummary.total > 0 && gradeSummary.readyRate < 100) {
    items.push({
      id: 'gradebook-incomplete',
      type: 'nilai',
      priority: 50,
      icon: BarChart3,
      title: `${gradeSummary.total - gradeSummary.completed} nilai belum lengkap`,
      meta: `${gradeSummary.completed}/${gradeSummary.total} nilai sudah terisi.`,
      actionLabel: 'Isi nilai',
      target: '/guru/daftar-nilai',
    })
  }

  const lowGradeByClass = new Map()
  gradebookRows.forEach((row) => {
    const score = Number(row.finalScore || 0)
    if (!score || score >= teacherDashboardThresholds.lowGradeScore) return
    const className = promoteClassName(row.className || 'Kelas')
    lowGradeByClass.set(className, (lowGradeByClass.get(className) || 0) + 1)
  })
  Array.from(lowGradeByClass.entries()).forEach(([className, count]) => {
    items.push({
      id: `grade-${className}`,
      type: 'nilai',
      priority: 40,
      icon: BarChart3,
      title: `${count} siswa perlu penguatan nilai`,
      meta: `${className} · di bawah KKTP ${teacherDashboardThresholds.lowGradeScore}`,
      actionLabel: 'Buka nilai',
      target: '/guru/daftar-nilai',
    })
  })

  const attendanceByClass = new Map()
  attendanceSessions.forEach((session) => {
    const className = promoteClassName(session.className || 'Kelas')
    const rows = Array.isArray(session.rows) ? session.rows : []
    attendanceByClass.set(className, [...(attendanceByClass.get(className) || []), ...rows])
  })
  Array.from(attendanceByClass.entries()).forEach(([className, rows]) => {
    const summary = summarizeAttendanceRows(rows)
    if (!summary.total || summary.rate >= teacherDashboardThresholds.lowAttendanceRate) return
    items.push({
      id: `attendance-rate-${className}`,
      type: 'siswa',
      priority: 50,
      icon: UsersRound,
      title: `Kehadiran ${className} di bawah ${teacherDashboardThresholds.lowAttendanceRate}%`,
      meta: `${summary.rate}% hadir · ${summary.tidakHadir} tidak hadir tercatat`,
      actionLabel: 'Lihat rekap',
      target: '/guru/daftar-hadir',
    })
  })

  if (questionRows.length === 0) {
    items.push({
      id: 'bank-soal-empty',
      type: 'soal',
      priority: 90,
      icon: FileQuestion,
      title: 'Bank soal mapel belum berisi soal',
      meta: 'Tambahkan atau impor soal agar tugas dan kuis lebih cepat dibuat.',
      actionLabel: 'Buka bank soal',
      target: '/guru/bank-soal',
    })
  }

  return items.sort((left, right) => left.priority - right.priority).slice(0, 6)
}

function collectTeacherDashboardClassNames({ assignments = [], gradebookRows = [], attendanceSessions = [] }) {
  return Array.from(new Set([
    ...assignments.flatMap(getAssignmentDashboardClassNames),
    ...gradebookRows.map((row) => row.className),
    ...attendanceSessions.map((row) => row.className),
  ].filter(Boolean).map(promoteClassName))).filter((className) => className && className !== 'Kelas umum')
}

function buildTeacherClassOverview({ assignments = [], gradebookRows = [], attendanceSessions = [], roster = [] }) {
  const classNames = collectTeacherDashboardClassNames({ assignments, gradebookRows, attendanceSessions })

  return classNames.slice(0, 6).map((className) => {
    const classGrades = gradebookRows.filter((row) => promoteClassName(row.className) === className)
    const gradeSummary = summarizeGradebook(classGrades)
    const classAttendanceRows = attendanceSessions
      .filter((session) => promoteClassName(session.className) === className)
      .flatMap((session) => Array.isArray(session.rows) ? session.rows : [])
    const attendanceSummary = summarizeAttendanceRows(classAttendanceRows)
    const studentCount = getTeacherClassStudentCount(roster, className)
    const classAssignments = assignments.filter((assignment) => getAssignmentDashboardClassNames(assignment).includes(className))

    return {
      className,
      studentCount,
      average: gradeSummary.average || 0,
      attendanceRate: attendanceSummary.rate || 0,
      assignmentCount: classAssignments.length,
      note: gradeSummary.total
        ? `${gradeSummary.completed}/${gradeSummary.total} nilai terisi`
        : attendanceSummary.total
          ? `${attendanceSummary.total} data absensi`
          : `${classAssignments.length} tugas/kuis terkait`,
    }
  })
}

function buildTeacherSubjectWorkflowRows({ subjects = [], materials = [], assignments = [], quizzes = [], questions = [], gradebookRows = [], attendanceSessions = [] }) {
  const subjectNames = subjects.length
    ? subjects
    : uniqueSubjectNames(
      materials.map((item) => item.subject),
      assignments.map((item) => item.subject),
      quizzes.map((item) => item.subject),
      questions.map((item) => item.subject),
      gradebookRows.map((item) => item.subject),
      attendanceSessions.map((item) => item.subject),
    )

  return subjectNames.map((subject, index) => {
    const subjectMaterials = materials.filter((item) => sameSubjectName(item.subject, subject))
    const subjectAssignments = assignments.filter((item) => sameSubjectName(item.subject, subject))
    const subjectQuizzes = quizzes.filter((item) => sameSubjectName(item.subject, subject))
    const subjectQuestions = questions.filter((item) => sameSubjectName(item.subject, subject))
    const subjectGrades = gradebookRows.filter((item) => sameSubjectName(item.subject, subject))
    const subjectAttendance = attendanceSessions.filter((item) => sameSubjectName(item.subject, subject))
    const gradeSummary = summarizeGradebook(subjectGrades)
    const attendanceSummary = summarizeAttendanceSessions(subjectAttendance)

    return {
      subject,
      tone: teacherWorkflowTones[index % teacherWorkflowTones.length],
      materials: subjectMaterials.length,
      activeAssignments: subjectAssignments.filter((item) => isTeacherDashboardStatus(item, 'Aktif')).length,
      quizzes: subjectQuizzes.filter((item) => isTeacherDashboardStatus(item, 'Publish')).length,
      questions: subjectQuestions.length,
      gradeReadyRate: gradeSummary.readyRate,
      attendanceRate: attendanceSummary.rate,
    }
  })
}

function buildTeacherRecentActivities({ materials = [], assignments = [], quizzes = [], attendanceSessions = [], gradebookRows = [] }) {
  const entries = [
    ...materials
      .filter((item) => getTeacherDashboardTimestamp(item))
      .map((item) => ({
        id: `material-${item.id}`,
        type: 'Materi',
        icon: BookOpen,
        title: item.title || item.topic || 'Materi',
        meta: `${item.subject || 'Mapel'} · ${item.status || 'Publish'}`,
        target: '/guru/materi',
        timestamp: getTeacherDashboardTimestamp(item),
      })),
    ...assignments.map((item) => ({
      id: `assignment-${item.id}`,
      type: 'Tugas',
      icon: ClipboardCheck,
      title: item.title || 'Tugas',
      meta: `${item.subject || 'Mapel'} · ${item.status || 'Draft'}`,
      target: '/guru/tugas',
      timestamp: getTeacherDashboardTimestamp(item),
    })),
    ...quizzes.map((item) => ({
      id: `quiz-${item.id}`,
      type: 'Kuis',
      icon: FileQuestion,
      title: item.title || 'Kuis',
      meta: `${item.subject || 'Mapel'} · ${item.status || 'Draft'}`,
      target: '/guru/kuis-live',
      timestamp: getTeacherDashboardTimestamp(item),
    })),
    ...attendanceSessions.map((item) => ({
      id: `attendance-${item.id}`,
      type: 'Absensi',
      icon: CalendarClock,
      title: item.className || 'Kelas',
      meta: `${item.subject || 'Mapel'} · ${formatAttendanceDate(item.date)}`,
      target: '/guru/daftar-hadir',
      timestamp: getTeacherDashboardTimestamp(item),
    })),
    ...gradebookRows
      .filter((item) => getTeacherDashboardTimestamp(item))
      .map((item) => ({
        id: `grade-${item.id}`,
        type: 'Nilai',
        icon: BarChart3,
        title: item.name || 'Siswa',
        meta: `${item.subject || 'Mapel'} · ${item.finalScore || 0}`,
        target: '/guru/daftar-nilai',
        timestamp: getTeacherDashboardTimestamp(item),
      })),
  ]

  return entries
    .filter((item) => item.timestamp)
    .sort((left, right) => right.timestamp - left.timestamp)
    .slice(0, 6)
}

function TeacherDashboardSkeleton() {
  return (
    <div className="space-y-5" aria-label="Memuat dashboard guru">
      <div className="h-56 animate-pulse rounded-[1.35rem] bg-[#EAF4FF]" />
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-48 animate-pulse rounded-[1.15rem] bg-white ring-1 ring-[#D9E6F5]" />
        <div className="h-48 animate-pulse rounded-[1.15rem] bg-white ring-1 ring-[#D9E6F5]" />
        <div className="h-48 animate-pulse rounded-[1.15rem] bg-white ring-1 ring-[#D9E6F5]" />
      </div>
    </div>
  )
}

function TeacherWorkflowHero({ teacherFirstName, subjectLabel, summary, actions = [] }) {
  return (
    <section className="overflow-hidden rounded-[1.35rem] bg-[linear-gradient(135deg,#E0F2FE_0%,#F8FBFF_48%,#ECFDF5_100%)] p-4 shadow-[0_18px_52px_rgba(15,36,55,0.08)] ring-1 ring-[#D9E6F5]">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)] xl:items-stretch">
        <div className="rounded-[1.1rem] bg-white/78 p-4 ring-1 ring-white/80">
          <div>
            <p className="text-xs font-black uppercase text-[#2F80D8]">Ruang kerja guru</p>
            <h2 className="mt-2 max-w-2xl text-balance text-3xl font-black leading-tight text-[#102A43] sm:text-[2.05rem]">
              {teacherFirstName}, pilih pekerjaan utama hari ini.
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#52647A]">
              Dashboard mengikuti data nyata yang guru buat. Tidak memakai jadwal tetap.
            </p>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <span className="truncate rounded-xl bg-white/82 px-3 py-2 text-xs font-black text-[#17446E] ring-1 ring-[#CDE4F8]">{subjectLabel}</span>
            <span className="rounded-xl bg-white/82 px-3 py-2 text-xs font-black text-emerald-800 ring-1 ring-emerald-100">{summary.activeAssignments} tugas aktif</span>
            <span className="rounded-xl bg-white/82 px-3 py-2 text-xs font-black text-amber-800 ring-1 ring-amber-100">{summary.submissions} submission</span>
          </div>
        </div>

        <div className="rounded-[1.1rem] bg-white/78 p-3 ring-1 ring-white/80">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <p className="text-xs font-black uppercase text-[#17446E]">Fitur sering dibuka</p>
            <span className="rounded-lg bg-[#EAF4FF] px-2.5 py-1 text-[11px] font-black text-[#2F80D8] ring-1 ring-[#CDE4F8]">Aksi utama</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {actions.slice(0, 4).map((action, index) => {
              const Icon = action.icon
              return (
                <button key={action.label} onClick={action.onClick} className={`group flex min-h-[5.1rem] items-center gap-2.5 rounded-[1rem] bg-gradient-to-br p-2.5 text-left shadow-[0_12px_28px_rgba(15,36,55,0.06)] ring-1 transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,36,55,0.1)] ${teacherWorkflowTones[index % teacherWorkflowTones.length]}`}>
                  <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-white/85 ring-1 ring-white/80">
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black leading-tight">{action.label}</span>
                    <span className="mt-1 block truncate text-xs font-bold opacity-75">{action.caption}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function TeacherDashboardStatsStrip({ items = [] }) {
  return (
    <section className="rounded-[1.1rem] bg-white p-2 shadow-[0_10px_28px_rgba(15,36,55,0.045)] ring-1 ring-[#D9E6F5]" aria-label="Ringkasan statistik guru">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(({ label, value, caption, icon: Icon = Sparkles }) => (
          <div key={label} className="flex min-h-16 items-center gap-3 rounded-[0.95rem] bg-[#F8FBFF] px-3 py-2 ring-1 ring-[#E5EDF7]">
            <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-white text-[#2F80D8] ring-1 ring-[#D9E6F5]">
              <Icon size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline gap-2">
                <span className="font-mono text-xl font-black leading-none text-[#132437]">{value}</span>
                <span className="truncate text-xs font-black text-[#64748B]">{label}</span>
              </span>
              <span className="mt-1 block truncate text-xs font-semibold text-[#64748B]">{caption}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function TeacherDashboardActionStrip({ actions = [] }) {
  return (
    <section className="rounded-[1.1rem] bg-white p-2.5 shadow-[0_10px_28px_rgba(15,36,55,0.045)] ring-1 ring-[#D9E6F5]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase text-[#17446E]">Aksi lanjutan</p>
        <span className="rounded-lg bg-[#F8FBFF] px-2.5 py-1 text-[11px] font-black text-[#64748B] ring-1 ring-[#D9E6F5]">{actions.length} menu</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <button key={action.label} onClick={action.onClick} className={`group flex min-h-14 items-center gap-2.5 rounded-[0.9rem] bg-gradient-to-br px-3 py-2 text-left ring-1 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,36,55,0.08)] ${teacherWorkflowTones[index % teacherWorkflowTones.length]}`}>
              <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-white/82 ring-1 ring-white/80">
                <Icon size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black leading-tight">{action.label}</span>
                <span className="mt-0.5 block truncate text-xs font-bold opacity-75">{action.caption}</span>
              </span>
              <span className="hidden rounded-lg bg-white/62 px-2 py-1 text-[10px] font-black ring-1 ring-white/70 2xl:inline-flex">{action.badge}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function TeacherAttentionSection({ items = [], onNavigate }) {
  const attentionGridClass = items.length > 1 ? 'grid gap-2 xl:grid-cols-2' : 'grid gap-2'

  return (
    <DashboardPanel title="Perlu dikerjakan" description="Dibaca dari data materi, tugas, kuis, absensi, nilai, dan bank soal guru.">
      {items.length ? (
        <div className={attentionGridClass}>
          {items.map((item) => <TeacherAttentionItem key={item.id} item={item} onNavigate={onNavigate} />)}
        </div>
      ) : (
        <div className="rounded-[1rem] bg-emerald-50 p-4 text-emerald-900 ring-1 ring-emerald-100">
          <p className="text-sm font-black">Belum ada pekerjaan tertunda dari data saat ini.</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-emerald-800/80">Gunakan tombol kerja cepat untuk membuat materi, tugas, kuis, absensi mapel, atau input nilai.</p>
        </div>
      )}
    </DashboardPanel>
  )
}

function TeacherAttentionItem({ item, onNavigate }) {
  const Icon = item.icon || Megaphone
  const tones = {
    absensi: 'bg-rose-50 text-rose-700 ring-rose-100',
    siswa: 'bg-rose-50 text-rose-700 ring-rose-100',
    tugas: 'bg-amber-50 text-amber-700 ring-amber-100',
    kuis: 'bg-violet-50 text-violet-700 ring-violet-100',
    materi: 'bg-sky-50 text-sky-700 ring-sky-100',
    nilai: 'bg-slate-100 text-slate-700 ring-slate-200',
    soal: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
  }
  return (
    <article className="grid gap-3 rounded-[1rem] bg-[#F8FBFF] p-3 ring-1 ring-[#D9E6F5] sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
      <span className={`grid h-11 w-11 place-items-center rounded-[0.9rem] ring-1 ${tones[item.type] || tones.nilai}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-black leading-tight text-[#132437]">{item.title}</h3>
        <p className="mt-1 truncate text-xs font-semibold text-[#64748B]">{item.meta}</p>
      </div>
      <button onClick={() => onNavigate(item.target)} className="inline-flex min-h-10 items-center justify-center rounded-[0.8rem] bg-[#F8FBFF] px-3 text-xs font-black text-[#0B3A5B] ring-1 ring-[#D9E6F5] transition hover:bg-[#EAF4FF]">
        {item.actionLabel}
      </button>
    </article>
  )
}

function TeacherSubjectWorkflow({ rows = [], onNavigate }) {
  return (
    <DashboardPanel title="Mapel yang diampu" description="Mapel mengikuti data guru. Tidak perlu memilih mapel lagi di dashboard.">
      {rows.length ? (
        <div className="space-y-3">
          {rows.map((row) => (
            <article key={row.subject} className={`grid gap-4 rounded-[1rem] bg-gradient-to-br p-4 ring-1 md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:items-center ${row.tone}`}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-white/82 ring-1 ring-white/80">
                  <BookOpen size={20} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-black leading-tight">{row.subject}</span>
                  <span className="mt-1 inline-flex rounded-lg bg-white/70 px-2.5 py-1 text-[11px] font-black ring-1 ring-white/70">{row.materials} materi publish</span>
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <button onClick={() => onNavigate('/guru/tugas')} className="rounded-xl bg-white/68 px-3 py-2 text-left text-xs font-black ring-1 ring-white/80">{row.activeAssignments} tugas aktif</button>
                <button onClick={() => onNavigate('/guru/kuis-live')} className="rounded-xl bg-white/68 px-3 py-2 text-left text-xs font-black ring-1 ring-white/80">{row.quizzes} kuis publish</button>
                <button onClick={() => onNavigate('/guru/bank-soal')} className="rounded-xl bg-white/68 px-3 py-2 text-left text-xs font-black ring-1 ring-white/80">{row.questions} soal</button>
                <button onClick={() => onNavigate('/guru/daftar-nilai')} className="rounded-xl bg-white/68 px-3 py-2 text-left text-xs font-black ring-1 ring-white/80">{row.gradeReadyRate}% nilai</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="Mapel guru belum terdeteksi" description="Admin dapat melengkapi mapel pada data guru agar dashboard hanya menampilkan alur kerja sesuai mapel yang diampu." />
      )}
    </DashboardPanel>
  )
}

function ClassOverviewGrid({ rows = [], onOpen }) {
  return (
    <DashboardPanel title="Kelas yang sedang dikelola" description="Muncul hanya bila ada data tugas, absensi mapel, atau nilai yang terkait kelas.">
      {rows.length ? (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {rows.map((row) => (
            <button key={row.className} onClick={() => onOpen(row.className)} className="group rounded-[1rem] bg-[#F8FBFF] p-4 text-left ring-1 ring-[#D9E6F5] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_34px_rgba(15,36,55,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-[0.9rem] bg-white text-[#2F80D8] ring-1 ring-[#D9E6F5]">
                  <School size={19} />
                </span>
                <span className="font-mono text-2xl font-black text-[#132437]">{row.average || '-'}</span>
              </div>
              <h3 className="mt-4 text-base font-black leading-tight text-[#132437]">{row.className}</h3>
              <p className="mt-1 text-xs font-semibold text-[#64748B]">{row.studentCount || '-'} siswa · {row.assignmentCount} tugas</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EAF4FF]">
                <span className="block h-full rounded-full bg-[#2F80D8]" style={{ width: `${Math.min(100, row.attendanceRate || 0)}%` }} />
              </div>
              <p className="mt-2 text-xs font-bold text-[#64748B]">{row.attendanceRate || 0}% kehadiran · {row.note}</p>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState title="Belum ada kelas aktif dari data guru" description="Kelas akan muncul setelah guru membuat tugas, mengisi absensi mapel, atau menginput daftar nilai." />
      )}
    </DashboardPanel>
  )
}

function TeacherActivityFeed({ rows = [], onNavigate }) {
  return (
    <DashboardPanel title="Aktivitas terakhir" description="Aktivitas tersimpan yang punya tanggal perubahan.">
      {rows.length ? (
        <div className="space-y-2">
          {rows.map((row) => {
            const Icon = row.icon
            return (
              <button key={row.id} onClick={() => onNavigate(row.target)} className="grid w-full gap-3 rounded-[1rem] bg-[#F8FBFF] p-3 text-left ring-1 ring-[#D9E6F5] transition hover:bg-white sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#2F80D8] ring-1 ring-[#D9E6F5]">
                  <Icon size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black text-[#132437]">{row.title}</span>
                  <span className="mt-1 block truncate text-xs font-semibold text-[#64748B]">{row.type} · {row.meta}</span>
                </span>
                <span className="text-xs font-black text-[#64748B]">{formatTeacherDashboardDate(row.timestamp)}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="rounded-[1rem] bg-[#F8FBFF] p-4 text-sm font-semibold leading-6 text-[#64748B] ring-1 ring-[#D9E6F5]">
          Belum ada aktivitas bertanggal dari materi, tugas, kuis, absensi, atau nilai.
        </div>
      )}
    </DashboardPanel>
  )
}

function TeacherDashboardGuideCard({ onNavigate }) {
  const guideItems = [
    { label: 'Publish materi', caption: 'Agar siswa punya bahan belajar.', icon: BookOpen, target: '/guru/materi' },
    { label: 'Isi absensi', caption: 'Catat kehadiran saat mengajar.', icon: CalendarClock, target: '/guru/daftar-hadir' },
    { label: 'Input nilai', caption: 'Nilai siswa langsung tersusun.', icon: BarChart3, target: '/guru/daftar-nilai' },
  ]

  return (
    <section className="rounded-[1.1rem] bg-[#0B3A5B] p-4 text-white shadow-[0_16px_40px_rgba(11,58,91,0.18)]">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-sky-100">Alur kerja</p>
          <h2 className="mt-2 text-xl font-black leading-tight">Mulai dari satu pekerjaan utama.</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-sky-100/82">
            Aktivitas dan kelas akan terisi otomatis setelah guru mulai menyimpan data.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {guideItems.map((item) => {
            const Icon = item.icon
            return (
              <button key={item.label} onClick={() => onNavigate(item.target)} className="flex min-h-16 items-center gap-3 rounded-[0.95rem] bg-white/10 px-3 text-left ring-1 ring-white/14 transition hover:-translate-y-0.5 hover:bg-white/16">
                <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-white text-[#17446E]">
                  <Icon size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black">{item.label}</span>
                  <span className="mt-0.5 block truncate text-xs font-semibold text-sky-100/82">{item.caption}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function GuruDashboard({ user }) {
  const navigate = useNavigate()
  const allSubjectOptions = useMemo(() => getGradeSubjectOptions(), [])
  const teacherSubjectOptions = useMemo(() => getTeacherSubjectOptions(user, allSubjectOptions), [allSubjectOptions, user?.subject])
  const [dashboardReady, setDashboardReady] = useState(false)
  const [dashboardRetryKey, setDashboardRetryKey] = useState(0)

  useEffect(() => {
    setDashboardReady(false)
    const timeout = window.setTimeout(() => setDashboardReady(true), 140)
    return () => window.clearTimeout(timeout)
  }, [dashboardRetryKey, user?.id])

  const dashboard = useMemo(() => {
    try {
      const hasAssignedSubjects = getTeacherSubjectNames(user).length > 0
      const teacherSubjectLabel = hasAssignedSubjects ? teacherSubjectOptions.join(', ') : 'Semua mapel'
      const teacherMaterials = getTeacherDashboardMaterials(user, teacherSubjectOptions)
      const teacherAssignments = getTeacherDashboardAssignments(user, teacherSubjectOptions)
      const teacherQuizzes = getTeacherDashboardQuizzes(user, teacherSubjectOptions)
      const questionRows = getTeacherDashboardQuestions(user, teacherSubjectOptions)
      const attendanceSessions = filterAttendanceSessionsByMode(getAttendanceSessions(user), { type: 'subject' })
      const gradebookRows = filterRowsByTeacherSubjects(getGradebookRows(user), user, teacherSubjectOptions)
      const roster = getAttendanceRoster()
      const publishedMaterials = teacherMaterials.filter(isTeacherDashboardPublished)
      const draftMaterials = teacherMaterials.filter(isTeacherDashboardDraft)
      const activeAssignments = teacherAssignments.filter((item) => isTeacherDashboardStatus(item, 'Aktif'))
      const draftAssignments = teacherAssignments.filter((item) => !isTeacherDashboardStatus(item, 'Aktif'))
      const publishedQuizzes = teacherQuizzes.filter((item) => isTeacherDashboardStatus(item, 'Publish'))
      const draftQuizzes = teacherQuizzes.filter((item) => isTeacherDashboardStatus(item, 'Draft'))
      const monthRange = getAttendanceMonthRange(toLocalIsoDate())
      const monthAttendanceSessions = attendanceSessions.filter((session) => isIsoDateInRange(session.date, monthRange))
      const attendanceSummary = summarizeAttendanceSessions(monthAttendanceSessions)
      const gradeSummary = summarizeGradebook(gradebookRows)
      const submissions = getTeacherAssignmentSubmissionCount(teacherAssignments)

      return {
        error: null,
        teacherSubjectLabel,
        teacherFirstName: (user?.name?.split(' ')[0] || 'Guru').replace(/[,.]+$/, ''),
        summary: {
          materials: publishedMaterials.length,
          activeAssignments: activeAssignments.length,
          draftAssignments: draftAssignments.length,
          publishedQuizzes: publishedQuizzes.length,
          submissions,
          questionRows: questionRows.length,
          attendanceRate: attendanceSummary.rate,
          attendanceRecorded: attendanceSummary.total,
          gradeReadyRate: gradeSummary.readyRate,
          gradeCompleted: gradeSummary.completed,
          gradeTotal: gradeSummary.total,
        },
        attentionItems: buildTeacherAttentionItems({
          draftMaterials,
          draftAssignments,
          draftQuizzes,
          activeAssignments,
          attendanceSessions,
          gradebookRows,
          questionRows,
        }),
        subjectRows: buildTeacherSubjectWorkflowRows({
          subjects: hasAssignedSubjects ? teacherSubjectOptions : [],
          materials: teacherMaterials,
          assignments: teacherAssignments,
          quizzes: teacherQuizzes,
          questions: questionRows,
          gradebookRows,
          attendanceSessions,
        }),
        classRows: buildTeacherClassOverview({
          assignments: teacherAssignments,
          gradebookRows,
          attendanceSessions,
          roster,
        }),
        activityRows: buildTeacherRecentActivities({
          materials: teacherMaterials,
          assignments: teacherAssignments,
          quizzes: teacherQuizzes,
          attendanceSessions,
          gradebookRows,
        }),
      }
    } catch (error) {
      return { error }
    }
  }, [dashboardRetryKey, teacherSubjectOptions, user])

  if (!dashboardReady) return <TeacherDashboardSkeleton />

  if (dashboard.error) {
    return (
      <DashboardPanel title="Dashboard belum bisa dimuat" description="Koneksi atau data lokal sedang tidak siap. Coba muat ulang bagian dashboard.">
        <button onClick={() => setDashboardRetryKey((value) => value + 1)} className="inline-flex min-h-10 items-center justify-center rounded-[0.85rem] bg-[#0B3A5B] px-4 text-sm font-black text-white">
          Coba lagi
        </button>
      </DashboardPanel>
    )
  }

  return (
    <div className="space-y-5">
      <TeacherWorkflowHero
        teacherFirstName={dashboard.teacherFirstName}
        subjectLabel={dashboard.teacherSubjectLabel}
        summary={dashboard.summary}
        actions={[
          { label: 'Tulis materi', caption: `${dashboard.summary.materials} materi publish`, icon: PencilLine, onClick: () => navigate('/guru/materi') },
          { label: 'Isi absensi mapel', caption: `${dashboard.summary.attendanceRecorded} data bulan ini`, icon: CalendarClock, onClick: () => navigate('/guru/daftar-hadir') },
          { label: 'Input daftar nilai', caption: `${dashboard.summary.gradeReadyRate}% nilai terisi`, icon: BarChart3, onClick: () => navigate('/guru/daftar-nilai') },
          { label: 'Buka bank soal', caption: `${dashboard.summary.questionRows} soal tersedia`, icon: FileQuestion, onClick: () => navigate('/guru/bank-soal') },
        ]}
      />

      <TeacherDashboardStatsStrip
        items={[
          { label: 'Materi publish', value: dashboard.summary.materials, caption: 'sesuai mapel guru', icon: BookOpen },
          { label: 'Tugas aktif', value: dashboard.summary.activeAssignments, caption: `${dashboard.summary.draftAssignments} draft · ${dashboard.summary.submissions} submission`, icon: ClipboardCheck },
          { label: 'Kuis publish', value: dashboard.summary.publishedQuizzes, caption: 'siap dikerjakan siswa', icon: FileQuestion },
          { label: 'Nilai terisi', value: `${dashboard.summary.gradeReadyRate}%`, caption: `${dashboard.summary.gradeCompleted}/${dashboard.summary.gradeTotal} nilai`, icon: BarChart3 },
        ]}
      />

      <TeacherDashboardActionStrip
        actions={[
          { label: 'Buat tugas', caption: 'Instruksi, deadline, rubrik', badge: 'Tugas', icon: ClipboardCheck, onClick: () => navigate('/guru/tugas') },
          { label: 'Buat kuis', caption: 'Ambil dari bank soal', badge: 'Kuis', icon: FileQuestion, onClick: () => navigate('/guru/kuis-live') },
          { label: 'Impor soal', caption: 'PDF, DOCX, HTML', badge: 'Bank soal', icon: Download, onClick: () => navigate('/guru/bank-soal') },
          { label: 'Rekap absensi', caption: 'Mapel bulanan/semester', badge: 'Absensi', icon: CalendarClock, onClick: () => navigate('/guru/daftar-hadir') },
          { label: 'Export nilai', caption: 'PDF atau Excel', badge: 'Nilai', icon: BarChart3, onClick: () => navigate('/guru/daftar-nilai') },
          { label: 'Siapkan pembelajaran', caption: 'Bahan ajar, tugas, kuis', badge: 'Studio', icon: Sparkles, onClick: () => navigate('/guru/studio-konten') },
        ]}
      />

      <TeacherAttentionSection items={dashboard.attentionItems} onNavigate={navigate} />

      <TeacherSubjectWorkflow rows={dashboard.subjectRows} onNavigate={navigate} />

      {(dashboard.activityRows.length > 0 || dashboard.classRows.length > 0) ? (
        <div className={`grid items-start gap-5 ${dashboard.activityRows.length > 0 && dashboard.classRows.length > 0 ? 'xl:grid-cols-2' : ''}`}>
          {dashboard.activityRows.length > 0 && <TeacherActivityFeed rows={dashboard.activityRows} onNavigate={navigate} />}
          {dashboard.classRows.length > 0 && <ClassOverviewGrid rows={dashboard.classRows} onOpen={() => navigate('/guru/kelas')} />}
        </div>
      ) : (
        <TeacherDashboardGuideCard onNavigate={navigate} />
      )}
    </div>
  )
}

function GuruDaftarHadir({ user, notify }) {
  const roster = useMemo(() => getAttendanceRoster(), [])
  const classOptions = useMemo(() => getAttendanceClassOptions(roster), [roster])
  const teacherSubjectOptions = useMemo(() => getTeacherSubjectNames(user), [user])
  const subjectOptionsForAttendance = useMemo(() => (
    teacherSubjectOptions.length ? teacherSubjectOptions : subjects.map((subject) => subject.name)
  ), [teacherSubjectOptions])
  const homeroomClasses = useMemo(() => getHomeroomClassesForUser(user), [user])
  const canFillDailyAttendance = user?.role === 'admin' || homeroomClasses.length > 0
  const canFillSubjectAttendance = user?.role === 'guru'
  const availableAttendanceTypes = useMemo(() => attendanceTypeOptions.filter((option) => (
    option.value === 'daily' ? canFillDailyAttendance : canFillSubjectAttendance
  )), [canFillDailyAttendance, canFillSubjectAttendance])
  const recapAttendanceTypes = useMemo(() => attendanceTypeOptions.filter((option) => {
    if (user?.role === 'admin') return option.value === 'daily'
    return user?.role === 'guru'
  }), [user?.role])
  const defaultSubject = subjectOptionsForAttendance[0] || 'Mata pelajaran'
  const [selectedDate, setSelectedDate] = useState(toLocalIsoDate())
  const [selectedClass, setSelectedClass] = useState((homeroomClasses[0] || classOptions[0]) || 'Kelas umum')
  const [attendanceType, setAttendanceType] = useState(canFillDailyAttendance ? 'daily' : 'subject')
  const [recapType, setRecapType] = useState(canFillDailyAttendance ? 'daily' : 'subject')
  const [selectedSubject, setSelectedSubject] = useState(defaultSubject)
  const [lessonTime, setLessonTime] = useState('07.30 - 09.00')
  const [sessions, setSessions] = useState(() => getAttendanceSessions(user))
  const [attendanceDirty, setAttendanceDirty] = useState(false)
  const fillClassOptions = useMemo(() => attendanceType === 'daily' && user?.role === 'guru' && homeroomClasses.length
    ? homeroomClasses
    : classOptions, [attendanceType, classOptions, homeroomClasses, user?.role])
  const rosterForClass = useMemo(() => getRosterForClass(roster, selectedClass), [roster, selectedClass])
  const attendanceMode = getAttendanceTypeMeta(attendanceType)
  const recapMode = getAttendanceTypeMeta(recapType)
  const canEditCurrentAttendance = attendanceType === 'daily' ? canFillDailyAttendance : canFillSubjectAttendance
  const sessionScope = attendanceType === 'subject'
    ? { type: attendanceType, subject: selectedSubject, lessonTime }
    : { type: attendanceType }
  const recapScope = recapType === 'subject'
    ? { type: recapType, subject: selectedSubject }
    : { type: recapType }
  const savedSession = getAttendanceSession(sessions, selectedDate, selectedClass, sessionScope)
  const [rows, setRows] = useState(() => buildAttendanceRows(rosterForClass, savedSession?.rows || []))
  const draftSession = {
    ...(savedSession || {}),
    type: attendanceType,
    date: selectedDate,
    className: selectedClass,
    subject: attendanceType === 'subject' ? selectedSubject : '',
    lessonTime: attendanceType === 'subject' ? lessonTime : '',
    teacherName: user?.name || attendanceMode.actor,
    rows,
    createdBy: user?.id || 'demo',
  }
  const monthRange = getAttendanceMonthRange(selectedDate)
  const attendanceMonthScope = attendanceType === 'subject'
    ? { type: 'subject', subject: selectedSubject }
    : { type: 'daily' }
  const attendanceMonthlySessions = getAttendanceSessionsForRange(sessions, selectedClass, monthRange, attendanceMonthScope)
  const attendanceCalendarDays = attendanceType === 'daily'
    ? getMonthDates(selectedDate)
    : Array.from(new Set([...getAttendanceMatrixDates('subject', attendanceMonthlySessions, selectedDate), selectedDate])).sort()
  const selectedAttendanceSessions = filterAttendanceSessionsByMode(sessions, { className: selectedClass, ...attendanceMonthScope })
  const selectedClassSessions = filterAttendanceSessionsByMode(sessions, { className: selectedClass, ...recapScope })
  const weeklyAttendanceData = buildWeeklyAttendanceData(selectedClassSessions, selectedDate)
  const monthlyAttendanceData = buildMonthlyAttendanceData(selectedClassSessions, selectedDate)
  const semesterRange = getAttendanceSemesterRange(selectedDate)
  const monthlySessions = getAttendanceSessionsForRange(sessions, selectedClass, monthRange, recapScope)
  const semesterSessions = getAttendanceSessionsForRange(sessions, selectedClass, semesterRange, recapScope)
  const monthlySummary = summarizeAttendanceSessions(monthlySessions)
  const semesterSummary = summarizeAttendanceSessions(semesterSessions)
  const monthlyStudentRows = buildStudentAttendanceRecap(rosterForClass, monthlySessions)
  const semesterStudentRows = buildStudentAttendanceRecap(rosterForClass, semesterSessions)
  const semesterMonthRows = buildSemesterMonthRecap(sessions, selectedClass, selectedDate, recapScope)
  const summary = summarizeAttendanceRows(rows)
  const unsavedAttendanceMessage = 'Perubahan absensi belum disimpan. Simpan dulu agar data tidak hilang.'

  useEffect(() => {
    if (!availableAttendanceTypes.some((option) => option.value === attendanceType) && availableAttendanceTypes[0]) {
      setAttendanceType(availableAttendanceTypes[0].value)
    }
  }, [attendanceType, availableAttendanceTypes])

  useEffect(() => {
    if (!recapAttendanceTypes.some((option) => option.value === recapType) && recapAttendanceTypes[0]) {
      setRecapType(recapAttendanceTypes[0].value)
    }
  }, [recapAttendanceTypes, recapType])

  useEffect(() => {
    if (!fillClassOptions.includes(selectedClass) && fillClassOptions[0]) {
      setSelectedClass(fillClassOptions[0])
    }
  }, [fillClassOptions, selectedClass])

  useEffect(() => {
    if (!subjectOptionsForAttendance.includes(selectedSubject) && subjectOptionsForAttendance[0]) {
      setSelectedSubject(subjectOptionsForAttendance[0])
    }
  }, [selectedSubject, subjectOptionsForAttendance])

  useEffect(() => {
    const session = getAttendanceSession(sessions, selectedDate, selectedClass, sessionScope)
    setRows(buildAttendanceRows(getRosterForClass(roster, selectedClass), session?.rows || []))
    setAttendanceDirty(false)
  }, [roster, selectedClass, selectedDate, attendanceType, selectedSubject, lessonTime, sessions])

  useEffect(() => {
    if (!attendanceDirty) return undefined
    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = unsavedAttendanceMessage
      return unsavedAttendanceMessage
    }
    const handleInternalNavigation = (event) => {
      const anchor = event.target?.closest?.('a[href]')
      if (!anchor) return
      const href = anchor.getAttribute('href') || ''
      if (!href || href.startsWith('#') || anchor.target && anchor.target !== '_self') return
      const targetUrl = new URL(anchor.href, window.location.href)
      const currentUrl = new URL(window.location.href)
      if (targetUrl.origin !== currentUrl.origin || targetUrl.pathname === currentUrl.pathname) return
      if (!window.confirm(`${unsavedAttendanceMessage}\n\nLanjut tanpa menyimpan?`)) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('click', handleInternalNavigation, true)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('click', handleInternalNavigation, true)
    }
  }, [attendanceDirty, unsavedAttendanceMessage])

  function confirmDiscardAttendanceChanges() {
    if (!attendanceDirty) return true
    const confirmed = window.confirm(`${unsavedAttendanceMessage}\n\nLanjut tanpa menyimpan?`)
    if (confirmed) setAttendanceDirty(false)
    return confirmed
  }

  function changeAttendanceType(nextType) {
    if (nextType === attendanceType) return
    if (!confirmDiscardAttendanceChanges()) return
    setAttendanceType(nextType)
  }

  function changeSelectedDate(nextDate) {
    if (nextDate === selectedDate) return
    if (!confirmDiscardAttendanceChanges()) return
    setSelectedDate(nextDate)
  }

  function changeSelectedClass(nextClass) {
    if (nextClass === selectedClass) return
    if (!confirmDiscardAttendanceChanges()) return
    setSelectedClass(nextClass)
  }

  function changeSelectedSubject(nextSubject) {
    if (nextSubject === selectedSubject) return
    if (!confirmDiscardAttendanceChanges()) return
    setSelectedSubject(nextSubject)
  }

  function changeLessonTime(nextLessonTime) {
    if (nextLessonTime === lessonTime) return
    if (!confirmDiscardAttendanceChanges()) return
    setLessonTime(nextLessonTime)
  }

  function updateRow(studentId, patch) {
    if (!canEditCurrentAttendance) return
    setAttendanceDirty(true)
    setRows((currentRows) => currentRows.map((row) => (
      row.studentId === studentId ? { ...row, ...patch } : row
    )))
  }

  function markAll(status) {
    if (!canEditCurrentAttendance) return
    setAttendanceDirty(true)
    setRows((currentRows) => currentRows.map((row) => ({ ...row, status })))
  }

  function saveAttendance() {
    if (!canEditCurrentAttendance) {
      notify('Akun ini hanya dapat melihat rekap kehadiran, bukan mengisi daftar hadir pada mode ini.')
      return
    }

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
    setAttendanceDirty(false)
    notify('Daftar hadir berhasil disimpan.')
  }

  function exportAttendance(format) {
    const report = buildAttendanceExportReport({
      type: recapType,
      className: selectedClass,
      subject: recapType === 'subject' ? selectedSubject : '',
      lessonTime: recapType === 'subject' ? 'Semua pertemuan' : '',
      teacherName: user?.name || recapMode.actor,
      selectedDate,
      monthlySessions,
      monthlySummary,
      semesterSessions,
      semesterSummary,
      students: rosterForClass,
    })

    if (format === 'excel') {
      downloadAttendanceExcel(report)
      notify('Rekap absensi Excel berhasil diunduh.')
      return
    }

    printAttendancePdf(report)
    notify('Dialog cetak dibuka. Pilih Save as PDF untuk menyimpan rekap absensi.')
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Daftar Hadir"
        title="Daftar hadir siswa."
        description="Absensi harian diisi wali kelas. Absensi per mata pelajaran diisi guru mapel setiap mengajar di kelas."
        action={
          <div className="flex flex-wrap gap-2">
            <QuickActionButton icon={Printer} label="PDF" onClick={() => exportAttendance('pdf')} />
            <QuickActionButton icon={Download} label="Excel" onClick={() => exportAttendance('excel')} />
          </div>
        }
      />

      <section className={`grid gap-3 rounded-2xl border border-[#D9E6F5] bg-white p-3 shadow-[0_10px_28px_rgba(15,36,55,0.045)] ${availableAttendanceTypes.length > 1 ? 'lg:grid-cols-2' : ''}`}>
        {availableAttendanceTypes.map((option) => {
          const active = attendanceType === option.value
          return (
            <button
              key={option.value}
              onClick={() => changeAttendanceType(option.value)}
              className={`rounded-2xl p-4 text-left ring-1 transition ${active ? 'bg-[#17446E] text-white ring-[#17446E]' : 'bg-[#F8FBFF] text-[#132437] ring-[#D9E6F5] hover:bg-[#EAF4FF]'}`}
            >
              <span className={`text-xs font-black uppercase tracking-[0.14em] ${active ? 'text-sky-100' : 'text-[#2F80D8]'}`}>{option.actor}</span>
              <span className="mt-1 block text-lg font-black">{option.label}</span>
              <span className={`mt-1 block text-sm font-semibold leading-6 ${active ? 'text-sky-100/85' : 'text-[#64748B]'}`}>{option.description}</span>
            </button>
          )
        })}
        {availableAttendanceTypes.length === 0 && (
          <div className="rounded-2xl bg-[#F8FBFF] p-4 ring-1 ring-[#D9E6F5]">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#2F80D8]">Rekap kehadiran</p>
            <p className="mt-1 text-lg font-black text-[#132437]">Mode pengisian belum tersedia untuk akun ini.</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-[#64748B]">Guru tetap dapat melihat rekap kehadiran siswa di bawah.</p>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#D9E6F5] bg-white shadow-[0_10px_28px_rgba(15,36,55,0.045)]">
        <div className="grid gap-4 border-b border-[#D9E6F5] bg-[#F8FBFF] p-4 xl:grid-cols-[1fr_14rem_14rem_16rem_13rem] xl:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#2F80D8]">{attendanceType === 'daily' ? 'Tanggal bulan berjalan' : 'Tanggal pertemuan mapel'}</p>
            <h2 className="mt-1 text-xl font-black text-[#132437]">
              {attendanceType === 'daily' ? monthRange.label : `${selectedSubject} · ${monthRange.label}`}
            </h2>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-black text-[#64748B]">Tanggal</span>
            <input type="date" value={selectedDate} onChange={(event) => changeSelectedDate(event.target.value)} className={materialInputClass} />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-black text-[#64748B]">Kelas</span>
            <select value={selectedClass} onChange={(event) => changeSelectedClass(event.target.value)} className={materialInputClass}>
              {fillClassOptions.map((className) => <option key={className} value={className}>{className}</option>)}
            </select>
          </label>

          {attendanceType === 'subject' && (
            <>
              {subjectOptionsForAttendance.length <= 1 ? (
                <div className="block">
                  <span className="mb-1 block text-xs font-black text-[#64748B]">Mata pelajaran</span>
                  <div className={`${materialInputClass} flex min-h-[2.75rem] items-center bg-[#EEF7FF] text-[#17446E]`}>
                    {selectedSubject}
                  </div>
                </div>
              ) : (
                <label className="block">
                  <span className="mb-1 block text-xs font-black text-[#64748B]">Mata pelajaran diampu</span>
                  <select value={selectedSubject} onChange={(event) => changeSelectedSubject(event.target.value)} className={materialInputClass}>
                    {subjectOptionsForAttendance.map((subjectName) => <option key={subjectName} value={subjectName}>{subjectName}</option>)}
                  </select>
                </label>
              )}

              <label className="block">
                <span className="mb-1 block text-xs font-black text-[#64748B]">Jam / pertemuan</span>
                <input value={lessonTime} onChange={(event) => changeLessonTime(event.target.value)} placeholder="07.30 - 09.00" className={materialInputClass} />
              </label>
            </>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1.5 p-3 sm:grid-cols-7">
          {attendanceCalendarDays.map((date) => {
            const active = date === selectedDate
            const daySummary = summarizeAttendanceSessions(selectedAttendanceSessions.filter((item) => item.date === date))
            return (
              <button
                key={date}
                onClick={() => changeSelectedDate(date)}
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
        <p className="border-t border-[#D9E6F5] px-4 py-3 text-xs font-semibold text-[#64748B]">
          {attendanceType === 'daily'
            ? 'Mode wali kelas menampilkan seluruh tanggal pada bulan yang dipilih.'
            : 'Mode mapel menampilkan tanggal pertemuan yang tersimpan, ditambah tanggal yang sedang diisi.'}
        </p>
      </section>

      <DashboardPanel title={`Daftar hadir ${selectedClass}`} description={`${rows.length} siswa pada tanggal terpilih.`}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge tone={attendanceType === 'subject' ? 'cyan' : 'teal'}>{attendanceMode.shortLabel}</StatusBadge>
          <StatusBadge tone="gray">{attendanceMode.actor}</StatusBadge>
          {attendanceType === 'subject' && <StatusBadge tone="amber">{selectedSubject} · {lessonTime}</StatusBadge>}
          {!canEditCurrentAttendance && <StatusBadge tone="amber">Rekap saja</StatusBadge>}
        </div>
        {canEditCurrentAttendance && <div className="mb-3 flex flex-wrap gap-2">
          <button onClick={() => markAll('Hadir')} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white transition hover:bg-emerald-700">
            Semua hadir
          </button>
          <button onClick={() => markAll('Alpa')} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-[#64748B] ring-1 ring-[#D9E6F5] transition hover:bg-[#F8FBFF]">
            Reset status
          </button>
          <button onClick={saveAttendance} className="inline-flex items-center gap-1.5 rounded-xl bg-[#17446E] px-3 py-2 text-xs font-black text-white shadow-[0_10px_20px_rgba(23,68,110,0.18)] transition hover:bg-[#2F80D8]">
            <Save size={14} /> Simpan
          </button>
        </div>}
        {attendanceDirty && (
          <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-800">
            Absensi sudah diubah tetapi belum disimpan. Tekan <b>Simpan</b> sebelum mengganti tanggal, kelas, mapel, atau meninggalkan halaman.
          </div>
        )}

        <div className="space-y-2 md:hidden">
          {rows.map((row) => (
            <article key={row.studentId} className="rounded-xl bg-[#F8FBFF] p-3 ring-1 ring-[#D9E6F5]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="line-clamp-1 font-black text-[#132437]">{row.name}</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#64748B]">{row.nis || row.className}</p>
                </div>
                <StatusBadge tone={row.status === 'Hadir' ? 'green' : row.status === 'Alpa' ? 'red' : 'amber'}>{row.status}</StatusBadge>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {attendanceStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateRow(row.studentId, { status })}
                    disabled={!canEditCurrentAttendance}
                    className={`min-h-10 rounded-lg px-2 text-xs font-black ring-1 transition ${statusButtonClass(status, row.status === status)}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <input
                value={row.note}
                onChange={(event) => updateRow(row.studentId, { note: event.target.value })}
                disabled={!canEditCurrentAttendance}
                placeholder="Catatan opsional"
                className="mt-3 w-full rounded-xl border border-[#D9E6F5] bg-white px-3 py-2.5 text-sm font-semibold text-[#132437] outline-none focus:border-[#2F80D8]"
              />
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
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
                          disabled={!canEditCurrentAttendance}
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
                      disabled={!canEditCurrentAttendance}
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

      <AttendanceMonthMatrix
        type={attendanceType}
        students={rosterForClass}
        sessions={attendanceMonthlySessions}
        selectedDate={selectedDate}
        onSelectDate={changeSelectedDate}
      />

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

        <DashboardPanel title="Grafik bulanan" description="Grafik dibuat per minggu dalam bulan terpilih agar rekap tetap sederhana.">
          <AttendanceChartPair weeklyData={weeklyAttendanceData} monthlyData={monthlyAttendanceData} showWeekly={false} />
        </DashboardPanel>
      </div>

      <DashboardPanel
        title="Rekap bulan dan semester"
        description={`Membaca ${recapMode.label.toLowerCase()} ${selectedClass} pada ${monthRange.label} dan ${semesterRange.label}.`}
      >
        {recapAttendanceTypes.length > 1 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">Jenis rekap</span>
            {recapAttendanceTypes.map((option) => {
              const active = recapType === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => setRecapType(option.value)}
                  className={`rounded-xl px-3 py-2 text-xs font-black ring-1 transition ${
                    active
                      ? 'bg-[#17446E] text-white ring-[#17446E]'
                      : 'bg-white text-[#17446E] ring-[#D9E6F5] hover:bg-[#EAF4FF]'
                  }`}
                >
                  {option.shortLabel}
                </button>
              )
            })}
          </div>
        )}

        <div className="grid gap-3 xl:grid-cols-2">
          <AttendanceRecapCard title="Rekap bulanan" subtitle={monthRange.label} summary={monthlySummary} sessionCount={monthlySessions.length} />
          <AttendanceRecapCard title="Rekap semester" subtitle={semesterRange.label} summary={semesterSummary} sessionCount={semesterSessions.length} />
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">Ringkasan bulan dalam semester</p>
          <SemesterMonthRecap rows={semesterMonthRows} />
        </div>

        <details className="mt-4 rounded-2xl border border-[#D9E6F5] bg-[#F8FBFF]">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-[#17446E]">
            Lihat rekap per siswa
          </summary>
          <div className="border-t border-[#D9E6F5] bg-white p-3">
            <AttendanceRecapTable monthlyRows={monthlyStudentRows} semesterRows={semesterStudentRows} leftTitle="Bulan ini" rightTitle="Semester ini" />
          </div>
        </details>
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
const gradeMaterialScopeCount = gradeSummativeScoreFields.length
const gradeFormatWeights = [
  { label: 'KKTP', value: gradeKktp },
  { label: 'Formatif', value: 'Catatan proses' },
  { label: 'Sumatif LM', value: `${Math.round(gradeWeights.summative * 100)}%` },
  { label: 'SAS', value: `${Math.round(gradeWeights.finalAssessment * 100)}%` },
  { label: 'Nilai Akhir', value: 'NA + capaian' },
]

const gradeSubjectFallbacks = highSchoolSubjectFolders

function gradebookStorageKey(user) {
  return `islelearn-gradebook-${user?.id || 'demo'}`
}

function gradeMaterialScopeStorageKey(user) {
  return `islelearn-gradebook-scopes-${user?.id || 'demo'}`
}

function getGradebookRows(user) {
  return safeReadLocalJson(gradebookStorageKey(user), [])
    .map(normalizeGradebookRow)
    .filter((row) => !isLegacyPreviewClassName(row.className) && !isLegacyPreviewStudentRow(row))
}

function setGradebookRows(user, rows) {
  safeWriteLocalJson(gradebookStorageKey(user), Array.isArray(rows) ? rows : [])
}

function getGradeMaterialScopeState(user) {
  const stored = safeReadLocalJson(gradeMaterialScopeStorageKey(user), {})
  return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {}
}

function setGradeMaterialScopeState(user, value) {
  safeWriteLocalJson(gradeMaterialScopeStorageKey(user), value && typeof value === 'object' ? value : {})
}

function getGradeContextStorageKey(context = {}) {
  return [
    promoteClassName(context.className),
    canonicalSubjectName(context.subject || ''),
    context.semester,
    context.academicYear,
  ]
    .map((item) => String(item || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    .join('|')
}

function getDefaultGradeMaterialScopes(subject = '') {
  return Array.from({ length: gradeMaterialScopeCount }, (_, index) => ({
    key: gradeSummativeScoreFields[index]?.key || `slm${index + 1}`,
    name: `Lingkup Materi ${index + 1}`,
    competency: `Peserta didik mampu memahami dan menerapkan materi ${canonicalSubjectName(subject || 'pelajaran')} pada lingkup materi ${index + 1}.`,
    enrichment: '',
  }))
}

function normalizeGradeMaterialScopes(scopes = [], subject = '') {
  const source = Array.isArray(scopes) ? scopes : []
  const defaults = getDefaultGradeMaterialScopes(subject)
  return defaults.map((fallback, index) => ({
    ...fallback,
    ...(source[index] || {}),
    key: gradeSummativeScoreFields[index]?.key || fallback.key,
    name: source[index]?.name ?? fallback.name,
    competency: source[index]?.competency ?? fallback.competency,
    enrichment: source[index]?.enrichment ?? '',
  }))
}

function getSavedGradeMaterialScopes(scopeState, context, savedRows = []) {
  const key = getGradeContextStorageKey(context)
  if (Array.isArray(scopeState?.[key])) return normalizeGradeMaterialScopes(scopeState[key], context.subject)
  const saved = savedRows.find((row) => sameGradeContext(row, context) && Array.isArray(row.materialScopes))
  return normalizeGradeMaterialScopes(saved?.materialScopes, context.subject)
}

function getGradeSubjectOptions() {
  const localSubjects = normalizeMaterialSubjectRows(getLocalAdminCollection('subjects', subjects))
    .flatMap((item) => splitSubjectNames(item?.name || item?.subject))
    .filter(isGradeSubjectOption)
  const teacherSubjects = teachers
    .flatMap((teacher) => splitSubjectNames(teacher.subject))
    .filter(isGradeSubjectOption)
  return uniqueSubjectNames(gradeSubjectFallbacks, localSubjects, teacherSubjects)
}

function getTeacherSubjectNames(user) {
  return getTeacherProfileSubjectNames(user)
}

function getTeacherSubjectOptions(user, fallbackOptions = []) {
  const teacherSubjects = getTeacherSubjectNames(user)
  if (!teacherSubjects.length) return fallbackOptions

  const matchedOptions = fallbackOptions.filter((option) => teacherSubjects.some((subject) => sameSubjectName(option, subject)))
  const unmatchedOptions = teacherSubjects.filter((subject) => !matchedOptions.some((option) => sameSubjectName(option, subject)))
  return uniqueSubjectNames(matchedOptions, unmatchedOptions)
}

function filterRowsByTeacherSubjects(rows = [], user, subjectOptions = [], { keepUnscoped = false } = {}) {
  const teacherSubjects = getTeacherSubjectNames(user)
  if (!teacherSubjects.length) return rows

  return rows.filter((row) => {
    const rowSubject = row?.subject || row?.mapel || row?.mataPelajaran
    if (!String(rowSubject || '').trim()) return keepUnscoped
    return subjectOptions.some((subject) => sameSubjectName(rowSubject, subject))
  })
}

function buildGradebookRows(roster, savedRows, context, materialScopes = []) {
  const contextRows = savedRows.filter((row) => sameGradeContext(row, context))
  const savedByStudentId = new Map(contextRows.map((row) => [row.studentId, row]))
  const rows = roster.map((student, index) => {
    const saved = savedByStudentId.get(student.id) || contextRows.find((row) => row.name === student.name) || {}
    const scores = normalizeGradeScores(saved.scores)
    const breakdown = calculateGradeBreakdown(scores)
    const rowMaterialScopes = normalizeGradeMaterialScopes(saved.materialScopes?.length ? saved.materialScopes : materialScopes, context.subject)

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
      materialScopes: rowMaterialScopes,
      competency: saved.competency || defaultCompetencyDescription(context.subject, breakdown.finalScore, scores, rowMaterialScopes),
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
    && sameSubjectName(row.subject, context.subject)
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
      materialScopes: normalizeGradeMaterialScopes(row.materialScopes, context.subject),
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

function getMaterialScopeScoreEntries(scores = {}, materialScopes = []) {
  return normalizeGradeMaterialScopes(materialScopes)
    .map((scope) => ({
      ...scope,
      score: normalizeScoreValue(scores?.[scope.key]),
    }))
    .filter((scope) => scope.score !== '')
}

function getScopePrintLabel(scope = {}, fallback = 'materi') {
  return scope.name || scope.competency || fallback
}

function defaultCompetencyDescription(subject, score, scores = {}, materialScopes = []) {
  const scopeScores = getMaterialScopeScoreEntries(scores, materialScopes)
  const strongest = scopeScores.length ? [...scopeScores].sort((a, b) => b.score - a.score)[0] : null
  const weakest = scopeScores.length ? [...scopeScores].sort((a, b) => a.score - b.score)[0] : null
  const strongestLabel = strongest ? getScopePrintLabel(strongest, subject) : subject
  const weakestLabel = weakest ? getScopePrintLabel(weakest, subject) : subject

  if (!score) return `Capaian kompetensi ${subject} belum diisi.`
  if (score >= 90) return `Sangat baik pada ${strongestLabel}; mampu menerapkan konsep ${subject} secara mandiri dan konsisten.`
  if (score >= 80) return `Baik pada ${strongestLabel}; perlu latihan lanjutan agar penguasaan ${weakestLabel} makin kuat.`
  if (score >= gradeKktp) return `Cukup pada ${strongestLabel}; perlu penguatan bertahap pada ${weakestLabel}.`
  return `Perlu bimbingan pada ${weakestLabel}; lakukan latihan, umpan balik, dan asesmen perbaikan pada ${subject}.`
}

function normalizeGradebookRow(row = {}) {
  const breakdown = calculateGradeBreakdown(row.scores)
  const subject = canonicalSubjectName(row.subject || 'Mata pelajaran')
  const finalScore = breakdown.finalScore
  const materialScopes = normalizeGradeMaterialScopes(row.materialScopes, subject)
  return {
    ...row,
    subject,
    className: promoteClassName(row.className),
    scores: breakdown.scores,
    averageFormative: breakdown.averageFormative,
    averageDaily: breakdown.averageFormative,
    averageSummative: breakdown.averageSummative,
    finalAssessment: breakdown.finalAssessment,
    finalScore,
    status: getGradeStatus(finalScore),
    predicate: getGradePredicate(finalScore),
    materialScopes,
    competency: row.competency || defaultCompetencyDescription(subject, finalScore, breakdown.scores, materialScopes),
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

function buildSampleGradeRows(rows, materialScopes = []) {
  return rows.map((row, index) => {
    const base = 78 + (index % 4) * 4
    const scores = Object.fromEntries(gradeScoreFields.map(({ key }, fieldIndex) => [
      key,
      Math.min(98, base + ((fieldIndex + index) % 5)),
    ]))
    const breakdown = calculateGradeBreakdown(scores)
    const rowMaterialScopes = normalizeGradeMaterialScopes(materialScopes?.length ? materialScopes : row.materialScopes, row.subject)
    return {
      ...row,
      ...breakdown,
      materialScopes: rowMaterialScopes,
      status: getGradeStatus(breakdown.finalScore),
      predicate: getGradePredicate(breakdown.finalScore),
      competency: defaultCompetencyDescription(row.subject, breakdown.finalScore, scores, rowMaterialScopes),
    }
  })
}

function gradeExportCell(value) {
  return value === '' || value === null || value === undefined ? '' : value
}

function buildGradebookExportRows(rows = [], materialScopes = []) {
  return rows.map((row, index) => ({
    No: index + 1,
    'NISN/NIS': row.nis || '',
    'Nama Siswa': row.name,
    'L/P': row.gender || '',
    ...Object.fromEntries(gradeFormativeScoreFields.map((field) => [field.label, gradeExportCell(row.scores?.[field.key])])),
    'Rata Formatif': gradeExportCell(row.averageFormative),
    ...Object.fromEntries(gradeSummativeScoreFields.map((field, fieldIndex) => {
      const scopeName = materialScopes[fieldIndex]?.name || `Lingkup Materi ${fieldIndex + 1}`
      return [`${field.label} - ${scopeName}`, gradeExportCell(row.scores?.[field.key])]
    })),
    'Rata SLM': gradeExportCell(row.averageSummative),
    SAS: gradeExportCell(row.scores?.sas),
    'Nilai Akhir': gradeExportCell(row.finalScore),
    Ketercapaian: row.status || '',
    Predikat: row.predicate || '',
    'Capaian Kompetensi': row.competency || '',
  }))
}

function buildGradebookScopeRows(materialScopes = []) {
  return normalizeGradeMaterialScopes(materialScopes).map((scope, index) => ({
    No: index + 1,
    Kolom: gradeSummativeScoreFields[index]?.label || `SLM ${index + 1}`,
    'Lingkup Materi': scope.name || '',
    'Capaian Kompetensi / Tujuan Pembelajaran': scope.competency || '',
    'Tindak Lanjut': scope.enrichment || '',
  }))
}

function buildGradebookExportReport({ user, context, rows, materialScopes, summary }) {
  const title = `Daftar Nilai ${context.subject} ${promoteClassName(context.className)}`
  return {
    title,
    filename: `${slugFileName(title)}-${toLocalIsoDate()}`,
    className: promoteClassName(context.className),
    subject: context.subject,
    semester: context.semester,
    academicYear: context.academicYear,
    teacherName: user?.name || '-',
    generatedAt: formatAttendanceDate(toLocalIsoDate(), { weekday: 'long' }),
    summary,
    rows: buildGradebookExportRows(rows, materialScopes),
    scopes: buildGradebookScopeRows(materialScopes),
  }
}

function buildGradebookReportHtml(report, { print = false } = {}) {
  const style = `
    <style>
      @page { size: 330mm 215mm; margin: 10mm; }
      body { font-family: Arial, sans-serif; color: #132437; margin: ${print ? '0' : '16px'}; }
      h1 { margin: 0; font-size: 20px; }
      h2 { margin: 18px 0 8px; font-size: 14px; color: #17446E; }
      p { margin: 4px 0; color: #44546A; font-size: 12px; }
      .meta { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px 14px; margin: 12px 0 14px; }
      .summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin: 14px 0; }
      .box { border: 1px solid #C9D8E8; border-radius: 10px; padding: 9px; background: #F8FBFF; }
      .box span { display: block; color: #64748B; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; }
      .box b { display: block; margin-top: 3px; font-size: 20px; color: #17446E; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; page-break-inside: auto; }
      th, td { border: 1px solid #C9D8E8; padding: 5px 6px; font-size: 9px; vertical-align: top; }
      th { background: #D9EBFF; color: #132437; text-align: center; font-weight: 800; }
      td { color: #132437; }
      tr { page-break-inside: avoid; }
      .wide { min-width: 1680px; }
      .scroll { overflow-x: auto; }
      .empty { border: 1px dashed #C9D8E8; padding: 12px; border-radius: 10px; }
      .no-print { margin-bottom: 14px; padding: 10px 14px; border-radius: 10px; border: 0; background: #17446E; color: white; font-weight: 700; }
      @media print {
        body { margin: 0; }
        .no-print { display: none; }
        .scroll { overflow: visible; }
      }
    </style>
  `
  return `<!doctype html>
    <html>
      <head><meta charset="utf-8" />${style}</head>
      <body>
        ${print ? '<button class="no-print" onclick="window.print()">Cetak / Simpan PDF</button>' : ''}
        <h1>${escapeReportHtml(report.title)}</h1>
        <p>${escapeReportHtml(school.name)} · Format nilai Kurikulum Merdeka</p>
        <div class="meta">
          <p><b>Kelas:</b> ${escapeReportHtml(report.className)}</p>
          <p><b>Mapel:</b> ${escapeReportHtml(report.subject)}</p>
          <p><b>Semester:</b> ${escapeReportHtml(report.semester)}</p>
          <p><b>Tahun Ajaran:</b> ${escapeReportHtml(report.academicYear)}</p>
          <p><b>Guru:</b> ${escapeReportHtml(report.teacherName)}</p>
          <p><b>KKTP:</b> ${gradeKktp}</p>
          <p><b>Bobot SLM:</b> ${Math.round(gradeWeights.summative * 100)}%</p>
          <p><b>Bobot SAS:</b> ${Math.round(gradeWeights.finalAssessment * 100)}%</p>
        </div>
        <div class="summary">
          <div class="box"><span>Rata-rata</span><b>${report.summary.average || '-'}</b></div>
          <div class="box"><span>Terisi</span><b>${report.summary.completed}/${report.summary.total}</b></div>
          <div class="box"><span>Tercapai</span><b>${report.summary.tuntas}</b></div>
          <div class="box"><span>Perlu penguatan</span><b>${report.summary.remedial}</b></div>
        </div>
        <h2>Lingkup Materi dan Capaian Kompetensi</h2>
        ${tableRowsToHtml(report.scopes)}
        <h2>Daftar Nilai Peserta Didik</h2>
        <div class="scroll">${tableRowsToHtml(report.rows).replace('<table>', '<table class="wide">')}</div>
      </body>
    </html>`
}

function downloadGradebookExcel(report) {
  downloadTextFile(`${report.filename}.xls`, '\ufeff' + buildGradebookReportHtml(report), 'application/vnd.ms-excel;charset=utf-8')
}

function printGradebookPdf(report) {
  const printWindow = window.open('', '_blank', 'width=1200,height=800')
  if (!printWindow) {
    downloadTextFile(`${report.filename}.html`, buildGradebookReportHtml(report, { print: true }), 'text/html;charset=utf-8')
    return
  }
  printWindow.document.write(buildGradebookReportHtml(report, { print: true }))
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 250)
}

function GuruDaftarNilai({ user, notify }) {
  const navigate = useNavigate()
  const roster = useMemo(() => getGradebookRoster(), [])
  const classOptions = useMemo(() => getGradebookClassOptions(roster), [roster])
  const allSubjectOptions = useMemo(() => getGradeSubjectOptions(), [])
  const subjectOptions = useMemo(() => getTeacherSubjectOptions(user, allSubjectOptions), [allSubjectOptions, user?.subject])
  const teacherSubjectLabel = getTeacherSubjectNames(user).length > 0 ? subjectOptions.join(', ') : 'Semua mapel'
  const homeroomClasses = getHomeroomClassesForUser(user)
  const hasRaporAccess = homeroomClasses.length > 0
  const [selectedClass, setSelectedClass] = useState(classOptions[0] || 'Kelas umum')
  const [selectedSubject, setSelectedSubject] = useState(() => preferredSubjectOption(user?.subject, subjectOptions))
  const [semester, setSemester] = useState('Genap')
  const [academicYear, setAcademicYear] = useState('2026/2027')
  const [savedRows, setSavedRows] = useState(() => getGradebookRows(user))
  const [scopeState, setScopeState] = useState(() => getGradeMaterialScopeState(user))
  const context = { className: selectedClass, subject: selectedSubject, semester, academicYear }
  const rosterForClass = useMemo(() => getGradeRosterForClass(roster, selectedClass), [roster, selectedClass])
  const materialScopes = useMemo(() => getSavedGradeMaterialScopes(scopeState, context, savedRows), [scopeState, savedRows, selectedClass, selectedSubject, semester, academicYear])
  const [rows, setRows] = useState(() => buildGradebookRows(rosterForClass, savedRows, context, materialScopes))
  const summary = summarizeGradebook(rows)

  useEffect(() => {
    if (!classOptions.includes(selectedClass) && classOptions[0]) setSelectedClass(classOptions[0])
  }, [classOptions, selectedClass])

  useEffect(() => {
    if (!subjectOptions.some((subject) => sameSubjectName(subject, selectedSubject))) {
      setSelectedSubject(preferredSubjectOption(user?.subject, subjectOptions))
    }
  }, [selectedSubject, subjectOptions, user?.subject])

  useEffect(() => {
    setRows(buildGradebookRows(rosterForClass, savedRows, context, materialScopes))
  }, [rosterForClass, savedRows, selectedClass, selectedSubject, semester, academicYear, materialScopes])

  function updateScore(studentId, key, value) {
    const cleanValue = value === '' ? '' : Math.max(0, Math.min(100, Number(value)))
    setRows((currentRows) => currentRows.map((row) => {
      if (row.studentId !== studentId) return row
      const scores = normalizeGradeScores({ ...row.scores, [key]: cleanValue })
      const previousAutoDescription = defaultCompetencyDescription(row.subject, row.finalScore, row.scores, row.materialScopes || materialScopes)
      const breakdown = calculateGradeBreakdown(scores)
      const autoDescription = defaultCompetencyDescription(row.subject, breakdown.finalScore, scores, row.materialScopes || materialScopes)
      return {
        ...row,
        ...breakdown,
        status: getGradeStatus(breakdown.finalScore),
        predicate: getGradePredicate(breakdown.finalScore),
        competency: !row.competency || row.competency === previousAutoDescription ? autoDescription : row.competency,
      }
    }))
  }

  function updateMaterialScope(index, field, value) {
    const nextScopes = normalizeGradeMaterialScopes(materialScopes, selectedSubject)
    nextScopes[index] = { ...nextScopes[index], [field]: value }
    const scopeKey = getGradeContextStorageKey(context)
    const previousScopes = materialScopes

    setScopeState((current) => {
      const nextState = {
        ...(current || {}),
        [scopeKey]: nextScopes,
      }
      setGradeMaterialScopeState(user, nextState)
      return nextState
    })

    setRows((currentRows) => currentRows.map((row) => {
      const previousAutoDescription = defaultCompetencyDescription(row.subject, row.finalScore, row.scores, previousScopes)
      const autoDescription = defaultCompetencyDescription(row.subject, row.finalScore, row.scores, nextScopes)
      return {
        ...row,
        materialScopes: nextScopes,
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
    const rowsWithScopes = nextRows.map((row) => ({ ...row, materialScopes }))
    const mergedRows = mergeGradebookRows(savedRows, context, rowsWithScopes)
    setGradeMaterialScopeState(user, {
      ...(scopeState || {}),
      [getGradeContextStorageKey(context)]: materialScopes,
    })
    setGradebookRows(user, mergedRows)
    setSavedRows(mergedRows)
    notify('Daftar nilai tersimpan.')
  }

  function fillSampleRows() {
    const nextRows = buildSampleGradeRows(rows, materialScopes)
    setRows(nextRows)
    saveRows(nextRows)
  }

  function getCurrentGradebookReport() {
    return buildGradebookExportReport({
      user,
      context,
      rows,
      materialScopes,
      summary,
    })
  }

  function exportGrades(format) {
    const report = getCurrentGradebookReport()
    if (format === 'excel') {
      downloadGradebookExcel(report)
      notify('Export Excel daftar nilai disiapkan.')
      return
    }
    printGradebookPdf(report)
    notify('Jendela cetak PDF daftar nilai dibuka.')
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Daftar Nilai"
        title="Format nilai Kurikulum Merdeka."
        description="Formatif dipakai sebagai umpan balik belajar. Nilai akhir dihitung dari Sumatif Lingkup Materi dan Sumatif Akhir Semester, lalu menghasilkan capaian kompetensi."
        action={
          <div className="flex flex-wrap gap-2">
            {hasRaporAccess && <QuickActionButton icon={FileText} label="Buka Rapor" onClick={() => navigate('/guru/rapor')} />}
          </div>
        }
      />

      <div className="rounded-2xl border border-[#D9E6F5] bg-white p-4 text-sm font-semibold leading-6 text-[#64748B] shadow-[0_10px_28px_rgba(15,36,55,0.035)]">
        Guru mapel mengisi nilai di halaman ini. Nilai akhir dan capaian kompetensi otomatis menjadi sumber Rapor, sedangkan akses membuka dan mencetak Rapor hanya diberikan kepada wali kelas yang ditetapkan Admin.
        <span className="mt-2 block font-black text-[#2F80D8]">
          Mapel yang tersedia untuk akun ini: {teacherSubjectLabel}.
        </span>
        {hasRaporAccess && (
          <span className="mt-2 block font-black text-[#17446E]">
            Akses wali kelas aktif: {homeroomClasses.join(', ')}.
          </span>
        )}
      </div>

      <section className="rounded-2xl border border-[#D9E6F5] bg-white p-4 shadow-[0_10px_28px_rgba(15,36,55,0.045)]">
        <div className="grid gap-3 md:grid-cols-4">
          <label className={materialLabelClass}>Kelas
            <select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)} className={materialInputClass}>
              {classOptions.map((className) => <option key={className} value={className}>{className}</option>)}
            </select>
          </label>
          {subjectOptions.length <= 1 ? (
            <div className={materialLabelClass}>Mata pelajaran
              <div className={`${materialInputClass} flex min-h-[2.75rem] items-center bg-[#EEF7FF] text-[#17446E]`}>
                {selectedSubject || 'Mapel belum dipilih'}
              </div>
            </div>
          ) : (
            <label className={materialLabelClass}>Mata pelajaran diampu
              <select value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)} className={materialInputClass}>
                {subjectOptions.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
              </select>
            </label>
          )}
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
        { label: 'Lengkap', value: `${summary.readyRate}%`, caption: 'nilai akhir terisi', icon: ClipboardCheck },
      ]} />

      <DashboardPanel title="Lingkup materi dan capaian kompetensi" description="Nama lingkup materi ini terhubung ke kolom SLM dan menjadi dasar kalimat capaian kompetensi pada rapor.">
        <div className="grid gap-3 lg:grid-cols-2">
          {materialScopes.map((scope, index) => (
            <div key={scope.key} className="rounded-2xl border border-[#D9E6F5] bg-[#F8FBFF] p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#2F80D8]">{gradeSummativeScoreFields[index]?.label || `SLM ${index + 1}`}</p>
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#64748B] ring-1 ring-[#D9E6F5]">Nilai {scope.key.toUpperCase()}</span>
              </div>
              <div className="grid gap-2">
                <label className={materialLabelClass}>Lingkup materi
                  <input
                    value={scope.name || ''}
                    onChange={(event) => updateMaterialScope(index, 'name', event.target.value)}
                    placeholder={`Lingkup Materi ${index + 1}`}
                    className={materialInputClass}
                  />
                </label>
                <label className={materialLabelClass}>Capaian kompetensi / tujuan pembelajaran
                  <textarea
                    value={scope.competency || ''}
                    onChange={(event) => updateMaterialScope(index, 'competency', event.target.value)}
                    rows={2}
                    placeholder="Tuliskan kompetensi yang akan dirujuk pada deskripsi rapor."
                    className={`${materialInputClass} resize-y leading-6`}
                  />
                </label>
                <label className={materialLabelClass}>Catatan tindak lanjut
                  <input
                    value={scope.enrichment || ''}
                    onChange={(event) => updateMaterialScope(index, 'enrichment', event.target.value)}
                    placeholder="Opsional, misalnya remedial/pengayaan."
                    className={materialInputClass}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </DashboardPanel>

      <DashboardPanel title={`Daftar nilai ${selectedClass}`} description={`${selectedSubject} · Semester ${semester} · ${academicYear}`}>
        <div className="mb-3 flex flex-wrap gap-2">
          <button onClick={fillSampleRows} className="rounded-xl bg-[#EAF4FF] px-3 py-2 text-xs font-black text-[#2F80D8] ring-1 ring-[#D9E6F5] transition hover:bg-white">
            Isi nilai awal
          </button>
          <button onClick={() => saveRows()} className="inline-flex items-center gap-1.5 rounded-xl bg-[#17446E] px-3 py-2 text-xs font-black text-white shadow-[0_10px_20px_rgba(23,68,110,0.18)] transition hover:bg-[#2F80D8]">
            <Save size={14} /> Simpan Nilai
          </button>
          <button onClick={() => exportGrades('pdf')} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-black text-[#17446E] ring-1 ring-[#D9E6F5] transition hover:bg-[#F8FBFF]">
            <Printer size={14} /> PDF
          </button>
          <button onClick={() => exportGrades('excel')} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-black text-[#2F80D8] ring-1 ring-[#D9E6F5] transition hover:bg-[#F8FBFF]">
            <Download size={14} /> Excel
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
                <th colSpan={3} className="bg-[#F8FBFF] px-3 py-2 font-black">Nilai akhir</th>
              </tr>
              <tr className="border-b border-[#D9E6F5] text-xs uppercase tracking-[0.12em] text-[#64748B]">
                <th className="py-3 pr-3 font-black">No</th>
                <th className="py-3 pr-3 font-black">NISN/NIS</th>
                <th className="py-3 pr-3 font-black">Nama siswa</th>
                <th className="py-3 pr-3 font-black">L/P</th>
                {gradeFormativeScoreFields.map((field) => <th key={field.key} className="py-3 pr-3 font-black">{field.label}</th>)}
                <th className="py-3 pr-3 font-black">Rata F</th>
                {gradeSummativeScoreFields.map((field, fieldIndex) => (
                  <th key={field.key} className="py-3 pr-3 font-black">
                    <span className="block">{field.label}</span>
                    <span className="block max-w-28 truncate text-[10px] normal-case tracking-normal text-[#64748B]">{materialScopes[fieldIndex]?.name || `Lingkup ${fieldIndex + 1}`}</span>
                  </th>
                ))}
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

const raporStorageVersion = 1
const raporExtraCount = 5
const raporSubjectSlotCount = 15
const raporPaperOptions = [
  { key: 'f4', label: 'F4', size: '215 x 330 mm' },
  { key: 'a4', label: 'A4', size: '210 x 297 mm' },
]
const raporTabs = [
  { key: 'data', label: 'Data rapor' },
  { key: 'nilai', label: 'Nilai & leger' },
  { key: 'cetak', label: 'Preview cetak' },
]
const raporPrintSections = [
  { key: 'all', label: 'Semua bagian' },
  { key: 'sampul', label: 'Sampul Rapor' },
  { key: 'rapor', label: 'Rapor' },
  { key: 'mutasi', label: 'Mutasi' },
  { key: 'induk', label: 'Buku Induk' },
]

function GuruRapor({ user, notify }) {
  const navigate = useNavigate()
  const roster = useMemo(() => getGradebookRoster(), [])
  const classOptions = useMemo(() => getGradebookClassOptions(roster), [roster])
  const homeroomClasses = useMemo(() => getHomeroomClassesForUser(user), [user])
  const raporClassOptions = useMemo(() => {
    const availableClasses = classOptions.filter((className) => homeroomClasses.includes(className))
    return availableClasses.length ? availableClasses : homeroomClasses
  }, [classOptions, homeroomClasses])
  const subjectOptions = useMemo(() => getGradeSubjectOptions(), [])
  const [selectedClass, setSelectedClass] = useState(raporClassOptions[0] || 'Kelas umum')
  const rosterForClass = useMemo(() => getGradeRosterForClass(roster, selectedClass), [roster, selectedClass])
  const [selectedStudentId, setSelectedStudentId] = useState(rosterForClass[0]?.id || '')
  const [semester, setSemester] = useState('Ganjil')
  const [academicYear, setAcademicYear] = useState('2026/2027')
  const [activeTab, setActiveTab] = useState('data')
  const [printPreviewMode, setPrintPreviewMode] = useState('all')
  const [raporState, setRaporStateValue] = useState(() => getRaporState(user))
  const gradeRows = useMemo(() => getReportGradebookRows(user), [user])
  const attendanceSessions = useMemo(() => getReportAttendanceSessions(user), [user])
  const selectedStudent = rosterForClass.find((student) => student.id === selectedStudentId) || rosterForClass[0] || roster[0] || null
  const reportKey = getRaporContextKey(selectedStudent?.id, selectedClass, semester, academicYear)
  const reportData = buildRaporDocument({
    user,
    student: selectedStudent,
    className: selectedClass,
    semester,
    academicYear,
    subjectOptions,
    gradeRows,
    attendanceSessions,
    raporState,
    reportKey,
  })

  useEffect(() => {
    if (!raporClassOptions.includes(selectedClass) && raporClassOptions[0]) setSelectedClass(raporClassOptions[0])
  }, [raporClassOptions, selectedClass])

  useEffect(() => {
    if (!rosterForClass.length) return
    if (!rosterForClass.some((student) => student.id === selectedStudentId)) {
      setSelectedStudentId(rosterForClass[0].id)
    }
  }, [rosterForClass, selectedStudentId])

  function patchRaporState(patcher) {
    setRaporStateValue((current) => {
      const nextState = patcher(current)
      setRaporState(user, nextState)
      return nextState
    })
  }

  function updateSchoolProfile(field, value) {
    patchRaporState((current) => ({
      ...current,
      schoolProfile: {
        ...getDefaultRaporSchoolProfile(user),
        ...(current.schoolProfile || {}),
        [field]: value,
      },
    }))
  }

  function updateStudentIdentity(field, value) {
    if (!selectedStudent) return
    patchRaporState((current) => ({
      ...current,
      studentProfiles: {
        ...(current.studentProfiles || {}),
        [selectedStudent.id]: {
          ...getDefaultRaporStudentProfile(selectedStudent),
          ...(current.studentProfiles?.[selectedStudent.id] || {}),
          [field]: value,
        },
      },
    }))
  }

  function updateReportOverride(field, value) {
    patchRaporState((current) => ({
      ...current,
      reports: {
        ...(current.reports || {}),
        [reportKey]: {
          ...getDefaultRaporOverride(user),
          ...(current.reports?.[reportKey] || {}),
          [field]: value,
        },
      },
    }))
  }

  function updateExtracurricular(index, field, value) {
    patchRaporState((current) => {
      const currentReport = {
        ...getDefaultRaporOverride(user),
        ...(current.reports?.[reportKey] || {}),
      }
      const extracurriculars = normalizeRaporExtracurriculars(currentReport.extracurriculars)
      extracurriculars[index] = {
        ...extracurriculars[index],
        [field]: value,
      }

      return {
        ...current,
        reports: {
          ...(current.reports || {}),
          [reportKey]: {
            ...currentReport,
            extracurriculars,
          },
        },
      }
    })
  }

  function saveRapor() {
    setRaporState(user, raporState)
    notify('Rapor tersimpan dan siap dicetak.')
  }

  function printRapor(mode = 'all') {
    setRaporState(user, raporState)
    if (typeof window === 'undefined') return

    const cleanup = () => {
      document.body.classList.remove('is-printing-rapor')
      document.body.removeAttribute('data-rapor-print-mode')
    }
    document.body.setAttribute('data-rapor-print-mode', mode)
    document.body.classList.add('is-printing-rapor')
    window.addEventListener('afterprint', cleanup, { once: true })
    window.setTimeout(() => window.print(), 50)
    window.setTimeout(cleanup, 1600)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Rapor"
        title="Rapor Kurikulum Merdeka siap cetak."
        description="Layout dibuat mengikuti struktur file rapor: sampul, identitas, nilai intrakurikuler, ekstrakurikuler, ketidakhadiran, catatan wali kelas, dan tanda tangan."
        action={
          <div className="flex flex-wrap gap-2">
            <QuickActionButton icon={BarChart3} label="Daftar Nilai" onClick={() => navigate('/guru/daftar-nilai')} />
            <QuickActionButton icon={Save} label="Simpan" onClick={saveRapor} />
            <QuickActionButton icon={Printer} label="Cetak Semua" onClick={() => printRapor('all')} />
          </div>
        }
      />

      <section className="rounded-2xl border border-[#D9E6F5] bg-white p-4 shadow-[0_10px_28px_rgba(15,36,55,0.045)]">
        <div className="grid gap-3 md:grid-cols-5">
          <label className={materialLabelClass}>Kelas
            <select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)} className={materialInputClass}>
              {raporClassOptions.map((className) => <option key={className} value={className}>{className}</option>)}
            </select>
          </label>
          <label className={materialLabelClass}>Peserta didik
            <select value={selectedStudent?.id || ''} onChange={(event) => setSelectedStudentId(event.target.value)} className={materialInputClass}>
              {rosterForClass.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
            </select>
          </label>
          <label className={materialLabelClass}>Semester
            <select value={semester} onChange={(event) => setSemester(event.target.value)} className={materialInputClass}>
              <option>Ganjil</option>
              <option>Genap</option>
            </select>
          </label>
          <label className={materialLabelClass}>Tahun pelajaran
            <input value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} className={materialInputClass} />
          </label>
          <label className={materialLabelClass}>Ukuran cetak
            <select value={reportData.reportOverride.paperSize} onChange={(event) => updateReportOverride('paperSize', event.target.value)} className={materialInputClass}>
              {raporPaperOptions.map((paper) => <option key={paper.key} value={paper.key}>{paper.label} · {paper.size}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-5">
          {[
            ['Nilai terhubung', reportData.scoredSubjectCount],
            ['Slot mapel', reportData.subjectRows.length],
            ['Ekstrakurikuler', reportData.extracurriculars.filter((item) => item.name || item.description).length],
            ['Kehadiran', `${reportData.attendance.hadir}/${reportData.attendance.total}`],
            ['Kertas', `${reportData.paper.label} · ${reportData.paper.size}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-[#F8FBFF] px-3 py-2 ring-1 ring-[#D9E6F5]">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#64748B]">{label}</p>
              <p className="mt-1 text-lg font-black text-[#17446E]">{value || 0}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-[#D9E6F5] bg-white p-2 shadow-[0_10px_28px_rgba(15,36,55,0.035)]">
        {raporTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-xl px-4 py-2 text-sm font-black transition ${
              activeTab === tab.key
                ? 'bg-[#17446E] text-white shadow-[0_10px_24px_rgba(23,68,110,0.16)]'
                : 'bg-[#F8FBFF] text-[#64748B] hover:bg-[#EAF4FF] hover:text-[#2F80D8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'data' && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <DashboardPanel title="Data sekolah" description="Diisi dari profil sekolah IsleLearn. Kosongkan field yang belum tersedia, nanti bisa dilengkapi admin.">
            <RaporFieldGrid
              fields={[
                ['Nama sekolah', 'schoolName'],
                ['NPSN', 'npsn'],
                ['Alamat sekolah', 'address'],
                ['Kode pos', 'postalCode'],
                ['Desa/Kelurahan', 'village'],
                ['Kecamatan', 'district'],
                ['Kabupaten/Kota', 'city'],
                ['Provinsi', 'province'],
                ['Website', 'website'],
                ['Email', 'email'],
                ['Nama kepala sekolah', 'principalName'],
                ['NIP kepala sekolah', 'principalNip'],
                ['Nama wali kelas', 'homeroomName'],
                ['NIP wali kelas', 'homeroomNip'],
              ]}
              values={reportData.schoolProfile}
              onChange={updateSchoolProfile}
            />
          </DashboardPanel>

          <DashboardPanel title="Identitas peserta didik" description="Data siswa berasal dari IsleLearn, lalu bisa dilengkapi untuk kebutuhan sampul dan buku induk.">
            {selectedStudent ? (
              <RaporFieldGrid
                fields={[
                  ['Nama peserta didik', 'name'],
                  ['NIS', 'nis'],
                  ['NISN', 'nisn'],
                  ['Tempat lahir', 'birthPlace'],
                  ['Tanggal lahir', 'birthDate', 'date'],
                  ['Jenis kelamin', 'gender'],
                  ['Agama', 'religion'],
                  ['Pendidikan sebelumnya', 'previousSchool'],
                  ['Alamat peserta didik', 'address'],
                  ['Nama ayah', 'fatherName'],
                  ['Nama ibu', 'motherName'],
                  ['Pekerjaan ayah', 'fatherJob'],
                  ['Pekerjaan ibu', 'motherJob'],
                  ['Alamat orang tua', 'parentAddress'],
                  ['Nama wali', 'guardianName'],
                  ['Pekerjaan wali', 'guardianJob'],
                  ['Alamat wali', 'guardianAddress'],
                ]}
                values={reportData.studentProfile}
                onChange={updateStudentIdentity}
              />
            ) : (
              <EmptyState title="Belum ada siswa." description="Tambahkan siswa terlebih dahulu di data siswa admin." />
            )}
          </DashboardPanel>

          <DashboardPanel title="Ekstrakurikuler" description="Mengikuti format file: maksimal 5 pilihan ekstrakurikuler beserta keterangannya.">
            <div className="space-y-3">
              {reportData.extracurriculars.map((item, index) => (
                <div key={`extra-${index}`} className="grid gap-2 rounded-xl bg-[#F8FBFF] p-3 ring-1 ring-[#D9E6F5] md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
                  <input
                    value={item.name}
                    onChange={(event) => updateExtracurricular(index, 'name', event.target.value)}
                    placeholder={`Ekstrakurikuler ${index + 1}`}
                    className={materialInputClass}
                  />
                  <input
                    value={item.description}
                    onChange={(event) => updateExtracurricular(index, 'description', event.target.value)}
                    placeholder="Keterangan atau deskripsi"
                    className={materialInputClass}
                  />
                </div>
              ))}
            </div>
          </DashboardPanel>

          <DashboardPanel title="Catatan dan keputusan" description="Bagian akhir rapor: catatan wali kelas, status kenaikan, tempat/tanggal, dan tanda tangan.">
            <div className="grid gap-3">
              <label className={materialLabelClass}>Catatan wali kelas
                <textarea value={reportData.reportOverride.homeroomNote} onChange={(event) => updateReportOverride('homeroomNote', event.target.value)} rows={4} className={`${materialInputClass} resize-y leading-6`} />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className={materialLabelClass}>Keputusan
                  <select value={reportData.reportOverride.decision} onChange={(event) => updateReportOverride('decision', event.target.value)} className={materialInputClass}>
                    <option>Naik kelas</option>
                    <option>Tinggal di kelas</option>
                    <option>Lulus</option>
                    <option>Belum ditentukan</option>
                  </select>
                </label>
                <label className={materialLabelClass}>Tempat rapor
                  <input value={reportData.reportOverride.reportPlace} onChange={(event) => updateReportOverride('reportPlace', event.target.value)} className={materialInputClass} />
                </label>
                <label className={materialLabelClass}>Tanggal rapor
                  <input type="date" value={reportData.reportOverride.reportDate} onChange={(event) => updateReportOverride('reportDate', event.target.value)} className={materialInputClass} />
                </label>
                <label className={materialLabelClass}>Catatan tambahan
                  <input value={reportData.reportOverride.additionalNote} onChange={(event) => updateReportOverride('additionalNote', event.target.value)} className={materialInputClass} />
                </label>
              </div>
            </div>
          </DashboardPanel>
        </div>
      )}

      {activeTab === 'nilai' && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <DashboardPanel title="Leger nilai intrakurikuler" description="Nilai akhir dan capaian kompetensi diambil langsung dari Daftar Nilai.">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[56rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#D9E6F5] text-xs uppercase tracking-[0.12em] text-[#2F80D8]">
                    <th className="py-3 pr-3 font-black">No</th>
                    <th className="py-3 pr-3 font-black">Muatan pelajaran</th>
                    <th className="py-3 pr-3 text-center font-black">Nilai akhir</th>
                    <th className="py-3 pr-3 font-black">Ketercapaian</th>
                    <th className="py-3 pr-3 font-black">Capaian kompetensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E6F5]">
                  {reportData.subjectRows.map((row, index) => (
                    <tr key={row.subject}>
                      <td className="py-3 pr-3 align-top font-mono font-black text-[#64748B]">{index + 1}</td>
                      <td className="py-3 pr-3 align-top font-black text-[#132437]">{row.subject}</td>
                      <td className="py-3 pr-3 align-top text-center font-mono text-lg font-black text-[#17446E]">{row.finalScore || '-'}</td>
                      <td className="py-3 pr-3 align-top"><StatusBadge tone={gradeStatusTone(row.finalScore)}>{row.status}</StatusBadge></td>
                      <td className="py-3 pr-3 align-top leading-6 text-[#475569]">{row.competency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardPanel>

          <div className="space-y-4">
            <DashboardPanel title="Ketidakhadiran" description={reportData.attendance.rangeLabel}>
              <div className="grid gap-2">
                {[
                  ['Hadir', reportData.attendance.hadir],
                  ['Sakit', reportData.attendance.sakit],
                  ['Izin', reportData.attendance.izin],
                  ['Tanpa keterangan', reportData.attendance.alpa],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl bg-[#F8FBFF] px-3 py-2 ring-1 ring-[#D9E6F5]">
                    <span className="text-sm font-black text-[#132437]">{label}</span>
                    <span className="font-mono text-lg font-black text-[#17446E]">{value}</span>
                  </div>
                ))}
              </div>
            </DashboardPanel>

            <DashboardPanel title="Kesiapan cetak" description="Data yang masih kosong akan tampil sebagai garis titik di dokumen cetak.">
              <div className="space-y-2">
                {reportData.readiness.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl bg-[#F8FBFF] px-3 py-2 ring-1 ring-[#D9E6F5]">
                    <span className="text-sm font-black text-[#132437]">{item.label}</span>
                    <StatusBadge tone={item.done ? 'green' : 'amber'}>{item.done ? 'Siap' : 'Lengkapi'}</StatusBadge>
                  </div>
                ))}
              </div>
            </DashboardPanel>
          </div>
        </div>
      )}

      {activeTab === 'cetak' && (
        <DashboardPanel title="Preview dokumen cetak" description="Area putih di bawah ini yang akan keluar saat tombol Cetak Rapor ditekan.">
          <div className="mb-4 flex flex-wrap gap-2">
            {raporPrintSections.map((section) => (
              <button
                key={section.key}
                type="button"
                onClick={() => setPrintPreviewMode(section.key)}
                className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                  printPreviewMode === section.key
                    ? 'bg-[#17446E] text-white shadow-[0_10px_24px_rgba(23,68,110,0.16)]'
                    : 'bg-[#F8FBFF] text-[#64748B] ring-1 ring-[#D9E6F5] hover:bg-white hover:text-[#2F80D8]'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
          <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {raporPrintSections.map((section) => (
              <button
                key={`print-${section.key}`}
                type="button"
                onClick={() => printRapor(section.key)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-[#17446E] ring-1 ring-[#D9E6F5] transition hover:bg-[#EAF4FF]"
              >
                <Printer className="h-4 w-4" />
                Cetak {section.label}
              </button>
            ))}
          </div>
          <RaporPrintDocument reportData={reportData} mode={printPreviewMode} />
        </DashboardPanel>
      )}

      <div className="rapor-print-only">
        <RaporPrintDocument reportData={reportData} printOnly />
      </div>
    </div>
  )
}

function RaporFieldGrid({ fields, values, onChange }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {fields.map(([label, key, type = 'text']) => (
        <label key={key} className={materialLabelClass}>{label}
          <input
            type={type}
            value={values?.[key] || ''}
            onChange={(event) => onChange(key, event.target.value)}
            className={materialInputClass}
          />
        </label>
      ))}
    </div>
  )
}

function RaporPrintDocument({ reportData, printOnly = false, mode = 'all' }) {
  const paperClass = `rapor-paper-${reportData.paper.key}`
  const showSection = (section) => mode === 'all' || mode === section
  return (
    <div data-print-area="rapor" data-paper-size={reportData.paper.key} data-rapor-preview-mode={mode} className={`${paperClass} ${printOnly ? 'rapor-print-host' : 'rounded-2xl bg-[#EEF4FA] p-3'}`}>
      {showSection('sampul') && (
        <RaporPrintSection section="sampul">
          <RaporCoverPage reportData={reportData} />
          <RaporIdentityPage reportData={reportData} />
        </RaporPrintSection>
      )}
      {showSection('rapor') && (
        <RaporPrintSection section="rapor">
          <RaporResultPages reportData={reportData} />
        </RaporPrintSection>
      )}
      {showSection('mutasi') && (
        <RaporPrintSection section="mutasi">
          <RaporMutationPage reportData={reportData} />
        </RaporPrintSection>
      )}
      {showSection('induk') && (
        <RaporPrintSection section="induk">
          <RaporIndukPage reportData={reportData} />
        </RaporPrintSection>
      )}
    </div>
  )
}

function RaporPrintSection({ section, children }) {
  return (
    <div data-rapor-section={section}>
      {children}
    </div>
  )
}

function RaporCoverPage({ reportData }) {
  const { schoolProfile, studentProfile } = reportData
  return (
    <section className="rapor-page rapor-cover-page rapor-print-page" data-rapor-section="sampul">
      <div className="rapor-cover-title">
        <p>R A P O R</p>
        <p>PESERTA DIDIK</p>
        <p>{schoolProfile.schoolName || school.name}</p>
      </div>

      <div className="rapor-cover-student">
        <p>Nama Peserta Didik :</p>
        <h2>{studentProfile.name || '........................................'}</h2>
        <p>NISN</p>
        <h3>{studentProfile.nisn || '........................................'}</h3>
      </div>

      <div className="rapor-cover-footer">
        <p>KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH</p>
        <p>REPUBLIK INDONESIA</p>
      </div>
    </section>
  )
}

function RaporIdentityPage({ reportData }) {
  const { schoolProfile, studentProfile } = reportData
  return (
    <section className="rapor-page rapor-identity-page rapor-print-page" data-rapor-section="sampul">
      <h2 className="rapor-page-title">R A P O R PESERTA DIDIK</h2>
      <h3 className="rapor-section-title">Data Sekolah</h3>
      <RaporInfoTable rows={[
        ['Nama Sekolah', schoolProfile.schoolName],
        ['NPSN', schoolProfile.npsn],
        ['Alamat Sekolah', schoolProfile.address],
        ['Kode Pos', schoolProfile.postalCode],
        ['Desa / Kelurahan', schoolProfile.village],
        ['Kecamatan', schoolProfile.district],
        ['Kabupaten / Kota', schoolProfile.city],
        ['Provinsi', schoolProfile.province],
        ['Website', schoolProfile.website],
        ['E-mail', schoolProfile.email],
      ]} />

      <h3 className="rapor-section-title">Identitas Peserta Didik</h3>
      <RaporInfoTable rows={[
        ['Nama Peserta Didik', studentProfile.name],
        ['NIS / NISN', compactJoin([studentProfile.nis, studentProfile.nisn], ' / ')],
        ['Tempat, Tanggal Lahir', compactJoin([studentProfile.birthPlace, formatRaporDate(studentProfile.birthDate)], ', ')],
        ['Jenis Kelamin', studentProfile.gender],
        ['Agama', studentProfile.religion],
        ['Pendidikan Sebelumnya', studentProfile.previousSchool],
        ['Alamat Peserta Didik', studentProfile.address],
        ['Nama Ayah', studentProfile.fatherName],
        ['Nama Ibu', studentProfile.motherName],
        ['Pekerjaan Ayah', studentProfile.fatherJob],
        ['Pekerjaan Ibu', studentProfile.motherJob],
        ['Alamat Orang Tua', studentProfile.parentAddress],
        ['Nama Wali', studentProfile.guardianName],
        ['Pekerjaan Wali', studentProfile.guardianJob],
        ['Alamat Wali', studentProfile.guardianAddress],
      ]} />
    </section>
  )
}

function RaporResultPages({ reportData }) {
  const firstPageRows = reportData.subjectRows.slice(0, 9)
  const secondPageRows = reportData.subjectRows.slice(9)

  return (
    <>
      <RaporResultAcademicPage reportData={reportData} rows={firstPageRows} startIndex={0} />
      <RaporResultSummaryPage reportData={reportData} rows={secondPageRows} startIndex={9} />
    </>
  )
}

function RaporResultSubjectTable({ rows, startIndex = 0 }) {
  return (
    <table className="rapor-table rapor-score-table">
      <thead>
        <tr>
          <th>No</th>
          <th>Muatan Pelajaran</th>
          <th>Nilai Akhir</th>
          <th>Capaian Kompetensi</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={`${startIndex}-${row.subject}`}>
            <td>{startIndex + index + 1}</td>
            <td>{row.subject}</td>
            <td className="rapor-score">{row.finalScore || ''}</td>
            <td>{row.competency || dottedLine()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function RaporResultAcademicPage({ reportData, rows, startIndex }) {
  return (
    <section className="rapor-page rapor-result-page rapor-print-page" data-rapor-section="rapor">
      <h2 className="rapor-page-title">LAPORAN HASIL BELAJAR</h2>
      <p className="rapor-subtitle">(RAPOR)</p>
      <RaporStudentHeader reportData={reportData} />
      <RaporResultSubjectTable rows={rows} startIndex={startIndex} />
    </section>
  )
}

function RaporResultSummaryPage({ reportData, rows, startIndex }) {
  const { schoolProfile, studentProfile, reportOverride, attendance } = reportData
  return (
    <section className="rapor-page rapor-result-page rapor-result-summary-page rapor-print-page" data-rapor-section="rapor">
      <RaporStudentHeader reportData={reportData} />
      <RaporResultSubjectTable rows={rows} startIndex={startIndex} />

      <table className="rapor-table rapor-extra-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Ekstrakurikuler</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {reportData.extracurriculars.map((item, index) => (
            <tr key={`print-extra-${index}`}>
              <td>{index + 1}</td>
              <td>{item.name || ''}</td>
              <td>{item.description || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="rapor-bottom-grid">
        <table className="rapor-table">
          <thead>
            <tr><th colSpan={3}>Ketidakhadiran</th></tr>
          </thead>
          <tbody>
            <tr><td>Sakit</td><td>{attendance.sakit}</td><td>hari</td></tr>
            <tr><td>Izin</td><td>{attendance.izin}</td><td>hari</td></tr>
            <tr><td>Tanpa Keterangan</td><td>{attendance.alpa}</td><td>hari</td></tr>
          </tbody>
        </table>
      </div>

      <div className="rapor-note-box">
        <h3>Catatan Wali Kelas</h3>
        <p>{reportOverride.homeroomNote || dottedLine()}</p>
        {reportOverride.additionalNote && <p>{reportOverride.additionalNote}</p>}
      </div>

      <div className="rapor-signature-grid">
        <RaporSignature title="Orang Tua/Wali" name="........................................" />
        <RaporSignature title={`${reportOverride.reportPlace || ''}, ${formatRaporDate(reportOverride.reportDate)}`} subtitle="Wali Kelas" name={schoolProfile.homeroomName} nip={schoolProfile.homeroomNip} />
      </div>
      <div className="rapor-principal-signature">
        <RaporSignature title="Mengetahui," subtitle="Kepala Sekolah" name={schoolProfile.principalName} nip={schoolProfile.principalNip} />
      </div>
    </section>
  )
}

function RaporIndukPage({ reportData }) {
  return (
    <section className="rapor-page rapor-ledger-page rapor-induk-page rapor-print-page" data-rapor-section="induk">
      <h2 className="rapor-page-title">BUKU INDUK</h2>
      <RaporStudentHeader reportData={reportData} compact />
      <table className="rapor-table rapor-ledger-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Muatan Pelajaran</th>
            <th>Nilai</th>
          </tr>
        </thead>
        <tbody>
          {reportData.subjectRows.map((row, index) => (
            <tr key={`ledger-${row.subject}`}>
              <td>{index + 1}</td>
              <td>{row.subject}</td>
              <td className="rapor-score">{row.finalScore || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="rapor-table rapor-extra-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Ekstrakurikuler</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {reportData.extracurriculars.map((item, index) => (
            <tr key={`ledger-extra-${index}`}>
              <td>{index + 1}</td>
              <td>{item.name || ''}</td>
              <td>{item.description || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="rapor-table rapor-attendance-table">
        <thead>
          <tr><th colSpan={3}>Ketidakhadiran</th></tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>Sakit</td><td>{reportData.attendance.sakit} hari</td></tr>
          <tr><td>2</td><td>Izin</td><td>{reportData.attendance.izin} hari</td></tr>
          <tr><td>3</td><td>Tanpa Keterangan</td><td>{reportData.attendance.alpa} hari</td></tr>
        </tbody>
      </table>
    </section>
  )
}

function RaporMutationPage({ reportData }) {
  const { studentProfile, schoolProfile } = reportData
  return (
    <section className="rapor-page rapor-mutation-page rapor-print-page" data-rapor-section="mutasi">
      <h2 className="rapor-page-title">KETERANGAN PINDAH SEKOLAH</h2>
      <p className="rapor-muted">Nama Peserta Didik : {studentProfile.name || dottedLine()}</p>
      <table className="rapor-table rapor-mutation-table">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Kelas yang Ditinggalkan</th>
            <th>Alasan</th>
            <th>Tanda Tangan Kepala Sekolah, Stempel Sekolah, dan Tanda Tangan Orang Tua/Wali</th>
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2].map((item) => (
            <tr key={`mutation-row-${item}`}>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <p>Kepala Sekolah</p>
                <br />
                <br />
                <p>{schoolProfile.principalName || '........................................'}</p>
                {schoolProfile.principalNip && <p>NIP. {schoolProfile.principalNip}</p>}
                <br />
                <p>Orang Tua/Wali</p>
                <br />
                <p>........................................</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="rapor-section-title">Keterangan Masuk Sekolah</h3>
      <table className="rapor-table rapor-mutation-entry-table">
        <tbody>
          {[0, 1, 2].map((item) => (
            <tr key={`entry-${item}`}>
              <td>{item + 1}.</td>
              <td>
                <p>Nama Peserta Didik</p>
                <p>Nomor Induk</p>
                <p>NISN</p>
                <p>Nama Sekolah</p>
                <p>Masuk di Sekolah ini :</p>
                <p>a. Tanggal</p>
                <p>b. Di Kelas</p>
                <p>c. Tahun Pelajaran</p>
              </td>
              <td>
                <p>{item === 0 ? withColon(studentProfile.name) : dottedLine()}</p>
                <p>{item === 0 ? withColon(studentProfile.nis) : dottedLine()}</p>
                <p>{item === 0 ? withColon(studentProfile.nisn) : dottedLine()}</p>
                <p>{item === 0 ? withColon(schoolProfile.schoolName) : dottedLine()}</p>
                <p>&nbsp;</p>
                <p>{dottedLine()}</p>
                <p>{item === 0 ? withColon(reportData.className) : dottedLine()}</p>
                <p>{item === 0 ? withColon(reportData.academicYear) : dottedLine()}</p>
              </td>
              <td>
                <p>{reportData.reportOverride.reportPlace || '................'}, {formatRaporDate(reportData.reportOverride.reportDate) || '........................'}</p>
                <p>Kepala Sekolah</p>
                <br />
                <br />
                <p>{schoolProfile.principalName || '........................................'}</p>
                {schoolProfile.principalNip && <p>NIP. {schoolProfile.principalNip}</p>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="rapor-mutation-signatures">
        <RaporSignature title="Mengetahui" subtitle="Orang Tua/Wali" name="........................................" />
        <RaporSignature title="Mengetahui" subtitle="Kepala Sekolah" name={schoolProfile.principalName} nip={schoolProfile.principalNip} />
        <RaporSignature title={`${reportData.reportOverride.reportPlace || ''}, ${formatRaporDate(reportData.reportOverride.reportDate)}`} subtitle="Guru Kelas" name={schoolProfile.homeroomName} nip={schoolProfile.homeroomNip} />
      </div>
    </section>
  )
}

function RaporStudentHeader({ reportData, compact = false }) {
  const { schoolProfile, studentProfile } = reportData
  return (
    <table className={`rapor-info-table ${compact ? 'rapor-info-compact' : ''}`}>
      <tbody>
        <tr>
          <td>Nama Peserta Didik</td>
          <td>{withColon(studentProfile.name)}</td>
          <td>Kelas</td>
          <td>{withColon(reportData.className)}</td>
        </tr>
        <tr>
          <td>{compact ? 'NIS / NISN' : 'NISN'}</td>
          <td>{withColon(compact ? compactJoin([studentProfile.nis, studentProfile.nisn], ' / ') : (studentProfile.nisn || studentProfile.nis))}</td>
          <td>Fase</td>
          <td>{withColon(reportData.phase)}</td>
        </tr>
        <tr>
          <td>Sekolah</td>
          <td>{withColon(schoolProfile.schoolName)}</td>
          <td>Semester</td>
          <td>{withColon(reportData.semesterLabel)}</td>
        </tr>
        <tr>
          <td>Alamat</td>
          <td>{withColon(compact ? studentProfile.address : schoolProfile.address)}</td>
          <td>Tahun Pelajaran</td>
          <td>{withColon(reportData.academicYear)}</td>
        </tr>
      </tbody>
    </table>
  )
}

function RaporInfoTable({ rows }) {
  return (
    <table className="rapor-info-table">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <td>{label}</td>
            <td>{withColon(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function RaporSignature({ title, subtitle, name, nip }) {
  return (
    <div className="rapor-signature">
      <p>{title}</p>
      {subtitle && <p>{subtitle}</p>}
      <div className="rapor-signature-space" />
      <p className="rapor-signature-name">{name || '........................................'}</p>
      {nip && <p>NIP. {nip}</p>}
    </div>
  )
}

function getRaporStorageKey(user) {
  return `islelearn-rapor-${user?.id || 'demo'}`
}

function getRaporState(user) {
  const stored = safeReadLocalJson(getRaporStorageKey(user), null)
  if (!stored || typeof stored !== 'object') {
    return {
      version: raporStorageVersion,
      schoolProfile: getDefaultRaporSchoolProfile(user),
      studentProfiles: {},
      reports: {},
    }
  }

  return {
    version: raporStorageVersion,
    schoolProfile: {
      ...getDefaultRaporSchoolProfile(user),
      ...(stored.schoolProfile || {}),
    },
    studentProfiles: stored.studentProfiles && typeof stored.studentProfiles === 'object' ? stored.studentProfiles : {},
    reports: stored.reports && typeof stored.reports === 'object' ? stored.reports : {},
  }
}

function setRaporState(user, value) {
  safeWriteLocalJson(getRaporStorageKey(user), {
    version: raporStorageVersion,
    schoolProfile: value?.schoolProfile || getDefaultRaporSchoolProfile(user),
    studentProfiles: value?.studentProfiles || {},
    reports: value?.reports || {},
  })
}

function getDefaultRaporSchoolProfile(user) {
  const teacherProfile = getTeacherProfileForUser(user)
  return {
    schoolName: school.name,
    npsn: '',
    address: '',
    postalCode: '',
    village: '',
    district: '',
    city: '',
    province: '',
    website: '',
    email: '',
    principalName: '',
    principalNip: '',
    homeroomName: teacherProfile?.name || user?.name || '',
    homeroomNip: teacherProfile?.nip || user?.nip || '',
  }
}

function getTeacherProfileForUser(user) {
  if (!user) return null
  const normalizedName = normalizeLookupText(user.name)
  const normalizedSubject = normalizeLookupText(user.subject)
  return teachers.find((teacher) => normalizeLookupText(teacher.name) === normalizedName)
    || teachers.find((teacher) => normalizedSubject && splitSubjectNames(teacher.subject).some((subject) => normalizeLookupText(subject) === normalizedSubject))
    || null
}

function getDefaultRaporStudentProfile(student = {}) {
  return {
    name: student.name || student.fullName || '',
    nis: student.nis || student.studentNumber || '',
    nisn: student.nisn || '',
    birthPlace: student.birthPlace || '',
    birthDate: student.birthDate || '',
    gender: student.gender || student.sex || student.jk || '',
    religion: student.religion || '',
    previousSchool: student.previousSchool || '',
    address: student.address || '',
    fatherName: student.fatherName || '',
    motherName: student.motherName || '',
    fatherJob: student.fatherJob || '',
    motherJob: student.motherJob || '',
    parentAddress: student.parentAddress || '',
    guardianName: student.guardianName || '',
    guardianJob: student.guardianJob || '',
    guardianAddress: student.guardianAddress || '',
  }
}

function getDefaultRaporOverride(user) {
  return {
    extracurriculars: normalizeRaporExtracurriculars([]),
    homeroomNote: 'Terus pertahankan semangat belajar dan kembangkan kebiasaan baik di sekolah maupun di rumah.',
    decision: 'Naik kelas',
    reportPlace: '',
    reportDate: toLocalIsoDate(),
    paperSize: 'f4',
    additionalNote: '',
    updatedBy: user?.name || '',
  }
}

function normalizeRaporExtracurriculars(rows = []) {
  return Array.from({ length: raporExtraCount }, (_, index) => ({
    name: rows[index]?.name || '',
    description: rows[index]?.description || '',
  }))
}

function getRaporContextKey(studentId, className, semester, academicYear) {
  return [studentId || 'student', promoteClassName(className), semester, academicYear]
    .map((item) => String(item || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    .join('|')
}

function getReportGradebookRows(user) {
  return uniqueRowsById([
    ...getGradebookRows(user),
    ...readLocalRowsByPrefix('islelearn-gradebook-').map(normalizeGradebookRow),
  ]).filter((row) => !isLegacyPreviewClassName(row.className) && !isLegacyPreviewStudentRow(row))
}

function getReportAttendanceSessions(user) {
  return filterAttendanceSessionsByMode(uniqueRowsById([
    ...getAttendanceSessions(user),
    ...readLocalRowsByPrefix('islelearn-attendance-').map(normalizeAttendanceSession),
  ]).filter((session) => !isLegacyPreviewClassName(session.className)), { type: 'daily' })
}

function buildRaporDocument({ user, student, className, semester, academicYear, subjectOptions, gradeRows, attendanceSessions, raporState, reportKey }) {
  const safeStudent = student || {}
  const reportOverride = {
    ...getDefaultRaporOverride(user),
    ...(raporState.reports?.[reportKey] || {}),
  }
  const studentProfile = {
    ...getDefaultRaporStudentProfile(safeStudent),
    ...(raporState.studentProfiles?.[safeStudent.id] || {}),
  }
  const schoolProfile = {
    ...getDefaultRaporSchoolProfile(user),
    ...(raporState.schoolProfile || {}),
  }
  const subjectRows = buildRaporSubjectRows({
    student: safeStudent,
    className,
    semester,
    academicYear,
    subjectOptions,
    gradeRows,
  })
  const attendance = buildRaporAttendanceSummary({
    student: safeStudent,
    className,
    semester,
    academicYear,
    attendanceSessions,
  })

  return {
    schoolProfile,
    studentProfile,
    reportOverride: {
      ...reportOverride,
      paperSize: getRaporPaper(reportOverride.paperSize).key,
      extracurriculars: normalizeRaporExtracurriculars(reportOverride.extracurriculars),
    },
    extracurriculars: normalizeRaporExtracurriculars(reportOverride.extracurriculars),
    paper: getRaporPaper(reportOverride.paperSize),
    subjectRows,
    attendance,
    className: promoteClassName(className),
    semester,
    semesterLabel: semester === 'Ganjil' ? '1 (Satu)' : '2 (Dua)',
    academicYear,
    phase: getRaporPhase(className),
    scoredSubjectCount: subjectRows.filter((row) => row.finalScore > 0).length,
    readiness: buildRaporReadiness({ schoolProfile, studentProfile, subjectRows, reportOverride }),
  }
}

function getRaporPaper(value) {
  return raporPaperOptions.find((paper) => paper.key === value) || raporPaperOptions[0]
}

function buildRaporSubjectRows({ student, className, semester, academicYear, subjectOptions, gradeRows }) {
  const contextRows = gradeRows.filter((row) => {
    const sameStudent = row.studentId === student.id || normalizeLookupText(row.name) === normalizeLookupText(student.name)
    return sameStudent
      && promoteClassName(row.className) === promoteClassName(className)
      && row.semester === semester
      && row.academicYear === academicYear
  })
  const subjectsWithGrades = contextRows.map((row) => row.subject)
  const orderedSubjects = uniqueSubjectNames(subjectOptions, subjectsWithGrades).slice(0, Math.max(raporSubjectSlotCount, subjectsWithGrades.length))

  return orderedSubjects.map((subject) => {
    const saved = contextRows.find((row) => sameSubjectName(row.subject, subject))
    const normalized = saved ? normalizeGradebookRow(saved) : null
    return {
      subject,
      finalScore: normalized?.finalScore || 0,
      status: normalized?.status || 'Belum Diisi',
      materialScopes: normalizeGradeMaterialScopes(normalized?.materialScopes, subject),
      competency: normalized?.competency || defaultCompetencyDescription(subject, normalized?.finalScore || 0, normalized?.scores, normalized?.materialScopes),
    }
  })
}

function buildRaporAttendanceSummary({ student, className, semester, academicYear, attendanceSessions }) {
  const range = getRaporSemesterRange(semester, academicYear)
  const sessions = attendanceSessions.filter((session) => (
    promoteClassName(session.className) === promoteClassName(className)
    && isIsoDateInRange(session.date, range)
    && normalizeAttendanceType(session.type) === 'daily'
  ))
  const counts = attendanceStatuses.reduce((acc, status) => ({ ...acc, [status]: 0 }), {})

  sessions.forEach((session) => {
    const row = Array.isArray(session.rows)
      ? session.rows.find((item) => item.studentId === student.id || normalizeLookupText(item.name) === normalizeLookupText(student.name))
      : null
    const status = attendanceStatuses.includes(row?.status) ? row.status : ''
    if (status) counts[status] += 1
  })

  const total = attendanceStatuses.reduce((sum, status) => sum + counts[status], 0)
  return {
    total,
    hadir: counts.Hadir,
    izin: counts.Izin,
    sakit: counts.Sakit,
    alpa: counts.Alpa,
    rangeLabel: range.label,
  }
}

function getRaporSemesterRange(semester, academicYear) {
  const [startYearRaw, endYearRaw] = String(academicYear || '').split(/[/-]/).map((item) => Number(item))
  const startYear = Number.isFinite(startYearRaw) ? startYearRaw : new Date().getFullYear()
  const endYear = Number.isFinite(endYearRaw) ? endYearRaw : startYear + 1
  const isOdd = semester === 'Ganjil'
  const startDate = isOdd ? new Date(startYear, 6, 1) : new Date(endYear, 0, 1)
  const endDate = isOdd ? new Date(startYear, 11, 31) : new Date(endYear, 5, 30)
  return {
    startIso: toLocalIsoDate(startDate),
    endIso: toLocalIsoDate(endDate),
    label: `Semester ${semester} ${academicYear}`,
  }
}

function getRaporPhase(className = '') {
  const grade = gradeLevelFromClassName(className)
  if (grade === 10) return 'E'
  if (grade === 11 || grade === 12) return 'F'
  return ''
}

function buildRaporReadiness({ schoolProfile, studentProfile, subjectRows, reportOverride }) {
  return [
    { label: 'Data sekolah', done: Boolean(schoolProfile.schoolName && schoolProfile.principalName) },
    { label: 'Identitas siswa', done: Boolean(studentProfile.name && (studentProfile.nis || studentProfile.nisn)) },
    { label: 'Nilai intrakurikuler', done: subjectRows.some((row) => row.finalScore > 0) },
    { label: 'Catatan wali kelas', done: Boolean(reportOverride.homeroomNote) },
  ]
}

function formatRaporDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(parseIsoDate(value))
}

function compactJoin(values, separator = ', ') {
  return values.filter(Boolean).join(separator)
}

function withColon(value) {
  return `: ${value || dottedLine()}`
}

function dottedLine() {
  return '........................................'
}

const classCardTones = [
  {
    surface: 'from-[#EAF4FF] via-white to-[#DDF2FF]',
    icon: 'bg-[#17446E] text-white',
    text: 'text-[#17446E]',
    ring: 'ring-[#B9D8F7]',
    accent: '#2F80D8',
  },
  {
    surface: 'from-[#ECFDF5] via-white to-[#DCFCE7]',
    icon: 'bg-emerald-700 text-white',
    text: 'text-emerald-800',
    ring: 'ring-emerald-100',
    accent: '#15803D',
  },
  {
    surface: 'from-[#FFFBEB] via-white to-[#FEF3C7]',
    icon: 'bg-amber-700 text-white',
    text: 'text-amber-800',
    ring: 'ring-amber-100',
    accent: '#B45309',
  },
  {
    surface: 'from-[#F8FAFC] via-white to-[#E2E8F0]',
    icon: 'bg-slate-700 text-white',
    text: 'text-slate-800',
    ring: 'ring-slate-200',
    accent: '#334155',
  },
]

function getClassRoster(className) {
  return students
    .filter((student) => sameAssignmentClassName(student.className, className))
    .sort((left, right) => String(left.name || '').localeCompare(String(right.name || ''), 'id', { sensitivity: 'base' }))
}

function GuruKelas() {
  const [selectedClass, setSelectedClass] = useState(null)
  const selectedRoster = selectedClass ? getClassRoster(selectedClass.name) : []

  if (selectedClass) {
    return (
      <div className="space-y-4">
        <PageHeader
          eyebrow="Detail kelas"
          title={selectedClass.name}
          description={`${selectedRoster.length} siswa terdaftar pada kelas ini.`}
          action={(
            <button
              type="button"
              onClick={() => setSelectedClass(null)}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#17446E] px-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(23,68,110,0.16)] transition hover:bg-[#2F80D8]"
            >
              <ArrowLeft size={16} /> Kembali ke daftar kelas
            </button>
          )}
        />

        <section className="liquid-glass-light overflow-hidden rounded-[1.25rem]">
          <header className="flex flex-col gap-3 border-b border-white/70 bg-white/40 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#2F80D8]">Folder kelas</p>
              <h2 className="text-2xl font-black text-[#132437]">{selectedClass.name}</h2>
              <p className="mt-1 text-sm font-semibold text-[#64748B]">
                Daftar siswa muncul setelah kelas dibuka.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone={selectedRoster.length ? 'green' : 'gray'}>{selectedRoster.length || 0} siswa</StatusBadge>
              <StatusBadge tone="teal">{selectedClass.progress || 0}% progress</StatusBadge>
            </div>
          </header>

          {selectedRoster.length ? (
            <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
              {selectedRoster.map((student, index) => (
                <article key={student.id} className="liquid-glass-field flex min-w-0 items-center gap-3 rounded-[1rem] px-3 py-3">
                  <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[#EAF4FF] font-mono text-sm font-black text-[#2F80D8] ring-1 ring-white/70">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-[#132437]">{student.name}</h3>
                    <p className="truncate text-xs font-semibold text-[#64748B]">{student.gender === 'P' ? 'Perempuan' : 'Laki-laki'}{student.nis ? ` · NIS ${student.nis}` : ''}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-4">
              <EmptyState title="Belum ada daftar siswa." description="Nama siswa akan muncul setelah data siswa tersimpan pada kelas ini." />
            </div>
          )}
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Kelas"
        title="Folder kelas"
        description="Klik detail untuk membuka daftar siswa pada satu kelas penuh."
      />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {classes.map((classItem, index) => {
          const tone = classCardTones[index % classCardTones.length]
          const roster = getClassRoster(classItem.name)

          return (
            <button
              key={classItem.id}
              type="button"
              onClick={() => setSelectedClass(classItem)}
              className={`liquid-glass-light group min-h-[13rem] rounded-[1.15rem] bg-gradient-to-br p-4 text-left ring-1 transition hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(15,36,55,0.10)] ${tone.surface} ${tone.ring}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl shadow-[0_14px_30px_rgba(15,36,55,0.12)] ${tone.icon}`}>
                  <School size={22} />
                </span>
                <span className="rounded-xl bg-white/76 px-3 py-1.5 text-xs font-black text-slate-600 ring-1 ring-white/70">
                  Kelas {classItem.grade}
                </span>
              </div>
              <h2 className="mt-5 line-clamp-2 min-h-[3rem] text-xl font-black leading-tight text-[#132437]">{classItem.name}</h2>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <span className="rounded-xl bg-white/72 px-3 py-2 ring-1 ring-white/70">
                  <span className={`block font-mono text-xl font-black ${tone.text}`}>{roster.length || classItem.students || 0}</span>
                  <span className="text-xs font-bold text-slate-500">siswa</span>
                </span>
                <span className="rounded-xl bg-white/72 px-3 py-2 ring-1 ring-white/70">
                  <span className={`block font-mono text-xl font-black ${tone.text}`}>{classItem.progress || 0}%</span>
                  <span className="text-xs font-bold text-slate-500">progress</span>
                </span>
              </div>
              <span className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white/80 px-3 py-2 text-sm font-black text-[#17446E] ring-1 ring-white/80 transition group-hover:bg-white">
                Detail
              </span>
            </button>
          )
        })}
      </section>
    </div>
  )
}

function teacherMaterialStorageKey(user, teacherSubject) {
  return `islelearn-teacher-materials-${user?.id || teacherSubject || 'demo'}`
}

function getSeededTeacherMaterials(teacherSubjects) {
  const normalizedSubjects = (Array.isArray(teacherSubjects) ? teacherSubjects : [teacherSubjects])
    .map((subject) => normalizeLookupText(subject))
    .filter(Boolean)
  const scopedMaterials = normalizedSubjects.length
    ? schoolMaterials.filter((item) => {
      const itemSubject = normalizeLookupText(item.subject)
      return normalizedSubjects.some((normalizedSubject) => (
        itemSubject === normalizedSubject || itemSubject.includes(normalizedSubject) || normalizedSubject.includes(itemSubject)
      ))
    })
    : schoolMaterials

  return publishHtmlMaterialRows(scopedMaterials).map((item) => ({
    ...item,
    progress: item.status === 'Publish' ? 35 : 0,
  }))
}

function getLocalTeacherMaterials(user, teacherSubject, teacherSubjectOptions = []) {
  const key = teacherMaterialStorageKey(user, teacherSubject)
  const storedRows = safeReadLocalJson(key, null)
  const seedSubjects = teacherSubjectOptions.length ? teacherSubjectOptions : teacherSubject

  if (Array.isArray(storedRows)) {
    const storedTeacherRows = storedRows.filter((row) => !isLegacyDemoRow(row))
    const publishedTeacherRows = publishHtmlMaterialRows(storedTeacherRows)
    if (JSON.stringify(storedTeacherRows) !== JSON.stringify(publishedTeacherRows)) {
      safeWriteLocalJson(key, publishedTeacherRows)
    }

    return uniqueRowsById([
      ...publishedTeacherRows,
      ...getSeededTeacherMaterials(seedSubjects),
    ])
  }

  return getSeededTeacherMaterials(seedSubjects)
}

function setLocalTeacherMaterials(user, teacherSubject, rows) {
  safeWriteLocalJson(teacherMaterialStorageKey(user, teacherSubject), publishHtmlMaterialRows(rows))
}

function materialSourceLabel(source) {
  if (source === 'supabase') return 'Tersimpan server'
  if (source === 'school-content') return 'Materi sekolah'
  return 'Tersimpan perangkat'
}

function GuruMateri({ user, notify, appContext }) {
  const allSubjectOptions = useMemo(() => getGradeSubjectOptions(), [])
  const effectiveTeacherSubject = user?.subject || (user?.id === 'local-preview-guru' ? 'Bahasa Inggris' : '')
  const teacherScopeUser = useMemo(() => ({ ...(user || {}), subject: effectiveTeacherSubject }), [effectiveTeacherSubject, user])
  const teacherSubjectOptions = useMemo(() => getTeacherSubjectOptions(teacherScopeUser, allSubjectOptions), [allSubjectOptions, teacherScopeUser])
  const hasTeacherSubject = getTeacherSubjectNames(teacherScopeUser).length > 0
  const teacherSubject = hasTeacherSubject ? teacherSubjectOptions[0] : ''
  const teacherSubjectLabel = hasTeacherSubject ? teacherSubjectOptions.join(', ') : 'mapel yang diampu'
  const pageTitle = hasTeacherSubject ? `Materi ${teacherSubjectLabel}` : 'Materi guru'
  const materialScope = teacherSubjectLabel
  const [rows, setRows] = useState([])
  const [lookups, setLookups] = useState({ subjects: [], classes: [] })
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [previewing, setPreviewing] = useState(null)
  const scopedRows = filterRowsByTeacherSubjects(rows, teacherScopeUser, teacherSubjectOptions)
  const publishedCount = scopedRows.filter((item) => item.status === 'Publish').length
  const draftCount = scopedRows.filter((item) => item.status !== 'Publish').length
  const subjectFolders = getMaterialSubjectFolders(scopedRows, lookups.subjects)
  const visibleSubjectFolders = subjectFolders.filter((folder) => folder.rows.length > 0)
  const filledFolderCount = visibleSubjectFolders.filter((folder) => folder.rows.length > 0).length
  const gradeSubfolderCount = visibleSubjectFolders.reduce((total, folder) => total + folder.gradeFolders.length, 0)
  const filledGradeSubfolderCount = visibleSubjectFolders.reduce((total, folder) => total + folder.gradeFolders.filter((gradeFolder) => gradeFolder.rows.length > 0).length, 0)
  const [activeSubjectKey, setActiveSubjectKey] = useState('')
  const visibleSubjectFolderKeys = visibleSubjectFolders.map((folder) => folder.key).join('|')
  const activeFolder = visibleSubjectFolders.find((folder) => folder.key === activeSubjectKey) || visibleSubjectFolders[0] || null
  const localMode = !appContext?.accessToken || !isUuid(user?.id)
  const sourceLabel = localMode ? 'Preview lokal' : 'Supabase'
  const overviewStats = [
    { label: 'Materi', value: scopedRows.length, helper: `${publishedCount} publish` },
    { label: 'Mapel', value: visibleSubjectFolders.length, helper: `${filledFolderCount} terisi` },
    { label: 'Subfolder', value: `${filledGradeSubfolderCount}/${gradeSubfolderCount || 0}`, helper: 'kelas terisi' },
    { label: 'Draft', value: draftCount, helper: 'belum publish' },
  ]

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
        setRows(getLocalTeacherMaterials(teacherScopeUser, teacherSubject, teacherSubjectOptions))
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
          setRows(uniqueRowsById([...materialRows, ...getSeededTeacherMaterials(teacherSubjectOptions)]))
          setLookups(lookupRows)
          setError('')
        }
      } catch (loadError) {
        if (active) {
          setRows(getLocalTeacherMaterials(teacherScopeUser, teacherSubject, teacherSubjectOptions))
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
  }, [appContext?.accessToken, teacherScopeUser, teacherSubject, teacherSubjectOptions, user?.id])

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
        setLocalTeacherMaterials(teacherScopeUser, teacherSubject, nextRows)
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
        setLocalTeacherMaterials(teacherScopeUser, teacherSubject, nextRows)
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

  if (previewing) {
    return <MaterialDetail item={previewing} onBack={() => setPreviewing(null)} notify={notify} />
  }

  return (
    <div>
      <PageHeader
        eyebrow="Materi"
        title={pageTitle}
        description={`Tulis dan kelola bahan belajar siswa untuk ${materialScope}. Materi bisa berupa teks, dokumen, PDF, HTML, video, embed, atau tautan belajar.`}
        action={<QuickActionButton icon={Plus} label={editing ? 'Editor terbuka' : 'Tulis materi'} disabled={Boolean(editing)} onClick={() => setEditing(emptyMaterial(lookups, teacherSubject, highSchoolGradeFolders[0].name))} />}
      />

      <section className="mb-4 rounded-[1rem] border border-sky-100 bg-white/82 p-3 shadow-[0_14px_38px_rgba(37,99,235,0.06)]">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {overviewStats.map((stat) => (
            <div key={stat.label} className="min-w-0 rounded-[0.85rem] bg-[#F7FBFF] px-3 py-2.5 ring-1 ring-sky-100/80">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-sky-600">{stat.label}</p>
              <div className="mt-1 flex items-end justify-between gap-2">
                <strong className="text-xl font-black leading-none text-[#13232d]">{stat.value}</strong>
                <span className="truncate text-xs font-bold text-slate-500">{stat.helper}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-right text-xs font-bold text-slate-500">
          Sumber data: <span className="text-sky-600">{sourceLabel}</span>
        </p>
      </section>

      {error && <div className="mb-4 rounded-[1rem] bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data materi: {error}. Data lokal mapel guru ditampilkan.</div>}
      
      {editing && <MaterialForm material={editing} lookups={lookups} subjectOptions={hasTeacherSubject ? teacherSubjectOptions : []} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label="Memuat materi guru dari Supabase..." /> : (
        visibleSubjectFolders.length > 0 ? (
          <section className="min-w-0 overflow-hidden rounded-[1rem] border border-sky-100 bg-white/88 shadow-[0_10px_28px_rgba(37,99,235,0.045)]">
            <div className="border-b border-sky-100 bg-[#F8FBFF]/92 px-4 py-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-sky-600">Mapel diampu</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Mapel mengikuti data mengajar akun guru.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone={activeFolder?.rows.length ? 'green' : 'gray'}>{activeFolder?.rows.length || 0} materi</StatusBadge>
                  <StatusBadge tone="teal">{activeFolder?.publishedCount || 0} publish</StatusBadge>
                  {(activeFolder?.draftCount || 0) > 0 && <StatusBadge tone="amber">{activeFolder.draftCount} draft</StatusBadge>}
                </div>
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {visibleSubjectFolders.map((folder) => {
                  const selectedFolder = activeFolder?.key === folder.key

                  return (
                    <button
                      key={folder.key}
                      onClick={() => setActiveSubjectKey(folder.key)}
                      className={`group flex min-w-[14rem] max-w-[18rem] items-center gap-2.5 rounded-[0.85rem] border px-3 py-2.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${selectedFolder ? 'border-sky-200 bg-white text-[#13232d] shadow-[0_8px_22px_rgba(37,99,235,0.08)]' : 'border-sky-100 bg-sky-50/50 text-[#13232d] hover:border-sky-200 hover:bg-white'}`}
                    >
                      <span className={`h-8 w-1 flex-shrink-0 rounded-full ${selectedFolder ? 'bg-sky-500' : 'bg-sky-200'}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black">{folder.name}</span>
                        <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">Mapel diampu</span>
                      </span>
                      <span className={`flex-shrink-0 rounded-[0.65rem] px-2.5 py-1 text-xs font-black ring-1 ${selectedFolder ? 'bg-white text-sky-700 ring-sky-200' : 'bg-white text-slate-500 ring-slate-200'}`}>
                        {folder.rows.length}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <header className="flex flex-col gap-1 border-b border-sky-100 bg-white px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-sky-600">Folder kelas</p>
              <h2 className="truncate text-xl font-black text-[#13232d]">{activeFolder?.name || 'Materi'}</h2>
            </header>

            <div className="grid gap-3 bg-[#F8FBFF]/70 p-3">
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
                    onOpen={setPreviewing}
                    onEdit={setEditing}
                    onToggleStatus={(row) => handleSave({ ...row, status: row.status === 'Publish' ? 'Draft' : 'Publish' })}
                    onDelete={setDeleting}
                  />
                )
              })}
            </div>
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

function TeacherMaterialGradeFolder({ subjectName, gradeFolder, defaultOpen = false, onAdd, onOpen, onEdit, onToggleStatus, onDelete }) {
  const hasRows = gradeFolder.rows.length > 0

  return (
    <details open={hasRows || defaultOpen} className="min-w-0 overflow-hidden rounded-[1rem] border border-sky-100 bg-white shadow-[0_10px_26px_rgba(37,99,235,0.04)]">
      <summary className="flex cursor-pointer list-none flex-col gap-2 px-4 py-3 transition hover:bg-[#F7FBFF] sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-sky-500">Folder kelas</p>
          <h3 className="truncate text-lg font-black text-[#13232d]">{gradeFolder.name}</h3>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <span className={`rounded-[0.65rem] px-2 py-1 text-xs font-black ring-1 ${hasRows ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-slate-50 text-slate-500 ring-slate-200'}`}>
            {gradeFolder.rows.length}
          </span>
          <span className="rounded-[0.65rem] bg-sky-50 px-2 py-1 text-xs font-black text-sky-700 ring-1 ring-sky-100">
            {gradeFolder.publishedCount} publish
          </span>
        </div>
      </summary>

      <div className="border-t border-sky-100 bg-[#F8FBFF]/70 p-3">
        {hasRows ? (
          <div className="grid gap-2.5 xl:grid-cols-2">
            {gradeFolder.rows.map((row) => (
              <MaterialFolderRow
                key={row.id}
                row={row}
                onOpen={() => onOpen(row)}
                onEdit={() => onEdit(row)}
                onToggleStatus={() => onToggleStatus(row)}
                onDelete={() => onDelete(row)}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 bg-[#F8FBFF] px-3 py-3">
            <div className="min-w-0">
              <p className="text-sm font-black text-[#13232d]">Subfolder ini masih kosong.</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Belum ada bahan belajar untuk {subjectName} {gradeFolder.name}.</p>
            </div>
            <button onClick={onAdd} className="inline-flex items-center justify-center gap-1.5 rounded-[0.75rem] bg-sky-50 px-3 py-2 text-xs font-black text-sky-700 ring-1 ring-sky-100 transition hover:bg-sky-100">
              <Plus size={14} /> Tambah materi
            </button>
          </div>
        )}
      </div>
    </details>
  )
}

function MaterialFolderRow({ row, onOpen, onEdit, onToggleStatus, onDelete }) {
  const tone = getMaterialCardTone(row)
  const chapterTitle = getChapterTitle(row.title || 'Tanpa judul')
  const chapterLabel = getChapterLabel([row.title, row.topic, row.content, row.id].filter(Boolean).join(' '))
  const coverImage = useMaterialCoverImage(row)
  const hasCover = Boolean(coverImage)

  return (
    <article
      className={`group relative flex min-h-[15rem] min-w-0 flex-col overflow-hidden rounded-[0.9rem] p-3 shadow-[0_10px_24px_rgba(15,31,42,0.045)] ring-1 transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,31,42,0.08)] ${hasCover ? 'text-white' : ''}`}
      style={hasCover
        ? {
          backgroundImage: `linear-gradient(145deg, rgba(10,31,51,0.90), rgba(23,68,110,0.60)), url("${coverImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '--tw-ring-color': 'rgba(255,255,255,0.42)',
        }
        : { background: tone.background, '--tw-ring-color': tone.border }}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <span
          className={`inline-flex shrink-0 justify-center rounded-[0.7rem] px-3 py-1.5 font-mono text-xs font-black ring-1 ${hasCover ? 'bg-white text-[#0B3A5B] shadow-[0_8px_20px_rgba(15,31,42,0.2)] ring-white/80 backdrop-blur-xl' : ''}`}
          style={hasCover ? undefined : { backgroundColor: tone.accentSoft, color: tone.accent, '--tw-ring-color': tone.border }}
        >
          {chapterLabel}
        </span>
        <div className="flex min-w-0 flex-wrap justify-end gap-1.5">
          <StatusBadge tone={statusTone(row.status)}>{row.status}</StatusBadge>
          <StatusBadge tone="teal">{row.type || 'Teks'}</StatusBadge>
        </div>
      </div>

      <div className="mt-3 min-w-0 flex-1">
        <h2 className={`line-clamp-2 min-h-[2.35rem] break-words text-[0.96rem] font-black leading-snug ${hasCover ? 'text-white drop-shadow-sm' : 'text-[#13232d]'}`}>{chapterTitle}</h2>
        <p className={`mt-2 truncate text-[11px] font-black uppercase tracking-[0.08em] ${hasCover ? 'text-sky-100' : ''}`} style={hasCover ? undefined : { color: tone.accent }}>
          {materialSourceLabel(row.source)}
        </p>
        <p className={`mt-2 line-clamp-2 min-h-[2.35rem] break-words text-[0.82rem] font-semibold leading-5 ${hasCover ? 'text-white/82' : 'text-slate-500'}`}>
          {row.topic || row.description || 'Belum ada topik.'}
        </p>
      </div>

      <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
        <button onClick={onOpen} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[0.7rem] px-2.5 text-xs font-black text-white shadow-[0_8px_18px_rgba(15,31,42,0.12)] transition hover:opacity-90" style={{ backgroundColor: hasCover ? 'rgba(255,255,255,0.18)' : tone.button, backdropFilter: hasCover ? 'blur(16px)' : undefined }}>
          <BookOpen size={14} /> Buka
        </button>
        <button onClick={onEdit} className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[0.7rem] px-2.5 text-xs font-black ring-1 transition ${hasCover ? 'bg-white/16 text-white ring-white/30 backdrop-blur-xl hover:bg-white/25' : 'bg-white/72 hover:bg-white'}`} style={hasCover ? undefined : { color: tone.accent, '--tw-ring-color': tone.border }}>
          <PencilLine size={14} /> Edit
        </button>
        <button onClick={onToggleStatus} className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[0.7rem] px-2.5 text-xs font-black ring-1 transition sm:col-span-2 ${hasCover ? 'bg-white/16 text-white ring-white/30 backdrop-blur-xl hover:bg-white/25' : 'bg-white/72 hover:bg-white'}`} style={hasCover ? undefined : { color: tone.accent, '--tw-ring-color': tone.border }}>
          <Send size={14} /> {row.status === 'Publish' ? 'Jadikan draft' : 'Publish'}
        </button>
        {row.source !== 'school-content' && (
          <button onClick={onDelete} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[0.7rem] bg-rose-50 px-2.5 text-xs font-black text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100 sm:col-span-2">
            <Trash2 size={14} /> Hapus
          </button>
        )}
      </div>
    </article>
  )
}

const materialInputClass = 'w-full rounded-[0.9rem] border border-[#0B3A5B]/10 bg-white/86 px-3 py-2.5 text-sm font-semibold text-[#13232d] outline-none transition placeholder:text-slate-400 focus:border-[#0284c7] focus:bg-white focus:ring-4 focus:ring-[#0284c7]/10'
const materialLabelClass = 'grid gap-1.5 text-sm font-black text-[#13232d]'
const materialTypeOptions = [
  { value: 'Teks', label: 'Teks', helper: 'Tulis langsung di editor.' },
  { value: 'Dokumen', label: 'Dokumen', helper: 'Word, Docs, atau file office via URL.' },
  { value: 'PDF', label: 'PDF', helper: 'PDF online atau Google Drive.' },
  { value: 'Presentasi', label: 'Presentasi', helper: 'Slides, PPT, atau presentasi online.' },
  { value: 'Spreadsheet', label: 'Spreadsheet', helper: 'Sheet atau file nilai/latihan.' },
  { value: 'HTML', label: 'HTML', helper: 'Path internal atau halaman web.' },
  { value: 'Video', label: 'Video', helper: 'YouTube, Vimeo, atau video URL.' },
  { value: 'Audio', label: 'Audio', helper: 'Audio penjelasan atau rekaman guru.' },
  { value: 'Link', label: 'Link', helper: 'Tautan materi eksternal.' },
  { value: 'Embed', label: 'Embed', helper: 'URL yang bisa tampil dalam frame.' },
]

function getMaterialTypeIcon(type) {
  if (type === 'HTML') return FileText
  if (type === 'PDF') return Download
  if (type === 'Video') return PlayCircle
  if (type === 'Audio') return Radio
  if (['Dokumen', 'Document', 'Presentasi', 'Spreadsheet'].includes(type)) return FileText
  if (type === 'Embed') return PlayCircle
  if (type === 'Link') return Link2
  return FileText
}

function getMaterialTypeDetails(type) {
  return materialTypeOptions.find((option) => option.value === type) || materialTypeOptions[0]
}

function isDocumentMaterialType(type) {
  return ['Dokumen', 'Document', 'Presentasi', 'Spreadsheet'].includes(type)
}

function isFrameMaterialType(type) {
  return ['HTML', 'PDF', 'Video', 'Dokumen', 'Document', 'Presentasi', 'Spreadsheet', 'Embed'].includes(type)
}

function getMaterialContentLabel(type, linkedMaterial) {
  if (!linkedMaterial) return 'Isi materi'
  if (type === 'HTML') return 'Path atau URL HTML'
  if (type === 'Video') return 'URL video'
  if (type === 'Audio') return 'URL audio'
  if (type === 'PDF') return 'URL PDF'
  if (type === 'Dokumen' || type === 'Document') return 'URL dokumen'
  if (type === 'Presentasi') return 'URL presentasi'
  if (type === 'Spreadsheet') return 'URL spreadsheet'
  if (type === 'Embed') return 'URL embed'
  return 'URL materi'
}

function getMaterialContentPlaceholder(type, linkedMaterial) {
  if (!linkedMaterial) return 'Tulis isi materi, instruksi baca, contoh, atau catatan ringkas untuk siswa.'
  if (type === 'HTML') return '/materials/mapel/nama-file.html atau https://contoh.sch.id/materi.html'
  if (type === 'Video') return 'https://www.youtube.com/watch?v=... atau https://youtu.be/...'
  if (type === 'Audio') return 'https://.../audio-penjelasan.mp3'
  if (type === 'PDF') return 'https://.../modul.pdf atau link Google Drive yang bisa diakses siswa'
  if (type === 'Dokumen' || type === 'Document') return 'https://.../dokumen.docx atau link Google Docs'
  if (type === 'Presentasi') return 'https://.../slide.pptx atau link Google Slides'
  if (type === 'Spreadsheet') return 'https://.../lembar.xlsx atau link Google Sheets'
  if (type === 'Embed') return 'https://... halaman yang mengizinkan embed iframe'
  return 'https://...'
}

function getMaterialTypeHint(type) {
  const details = getMaterialTypeDetails(type)
  if (type === 'Teks') return 'Cocok untuk bacaan ringkas, LKPD pendek, atau instruksi belajar yang diketik langsung.'
  if (type === 'HTML') return 'HTML bisa berupa file internal di folder /materials atau halaman web yang boleh ditampilkan dalam iframe.'
  if (type === 'Video') return 'URL YouTube dan Vimeo akan diubah otomatis menjadi video tertanam di halaman siswa.'
  if (type === 'Audio') return 'Audio ditampilkan dengan pemutar langsung di halaman siswa.'
  if (type === 'PDF') return 'PDF ditampilkan sebagai preview dokumen agar siswa bisa membaca tanpa meninggalkan aplikasi.'
  if (isDocumentMaterialType(type)) return 'Dokumen office ditampilkan lewat preview dokumen; pastikan link dapat diakses oleh siswa.'
  if (type === 'Embed') return 'Gunakan untuk simulasi, peta, atau media web yang memang menyediakan URL embed.'
  return details.helper
}

function cleanMaterialUrl(value) {
  return String(value || '').trim()
}

function getYoutubeVideoId(url) {
  const host = url.hostname.replace(/^www\./, '').toLowerCase()
  if (host === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || ''
  if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    if (url.pathname.startsWith('/embed/')) return url.pathname.split('/').filter(Boolean)[1] || ''
    if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/').filter(Boolean)[1] || ''
    return url.searchParams.get('v') || ''
  }
  return ''
}

function getEmbeddableVideoUrl(value) {
  try {
    const url = new URL(cleanMaterialUrl(value))
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    const youtubeId = getYoutubeVideoId(url)
    if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}`
    if (host.endsWith('drive.google.com')) {
      const parts = url.pathname.split('/').filter(Boolean)
      const fileIndex = parts.indexOf('file')
      const driveId = fileIndex >= 0 && parts[fileIndex + 1] === 'd' ? parts[fileIndex + 2] : url.searchParams.get('id')
      if (driveId) return `https://drive.google.com/file/d/${driveId}/preview`
    }
    if (host === 'player.vimeo.com' && url.pathname.startsWith('/video/')) return url.toString()
    if (host === 'vimeo.com') {
      const vimeoId = url.pathname.split('/').filter(Boolean)[0]
      if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`
    }
  } catch (error) {
    return ''
  }
  return ''
}

function getGoogleWorkspacePreviewUrl(value) {
  try {
    const url = new URL(cleanMaterialUrl(value))
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    if (host === 'drive.google.com') {
      const fileId = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || url.searchParams.get('id')
      return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : ''
    }
    if (host === 'docs.google.com') {
      const match = url.pathname.match(/\/(document|presentation|spreadsheets)\/d\/([^/]+)/)
      return match ? `https://docs.google.com/${match[1]}/d/${match[2]}/preview` : ''
    }
  } catch (error) {
    return ''
  }
  return ''
}

function getDocumentPreviewUrl(value, type) {
  const url = cleanMaterialUrl(value)
  if (!url) return ''
  const googlePreview = getGoogleWorkspacePreviewUrl(url)
  if (googlePreview) return googlePreview
  if (type === 'PDF') return url
  if (isDocumentMaterialType(type)) return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`
  return ''
}

const advancedMaterialSchema = 'islelearn-material-v1'
const materialTargetLevels = ['SMA/MA', 'Pemula', 'Mahir', 'SMP/MTs', 'SD/MI', 'Kuliah']
const materialToneOptions = [
  { value: 'sky', label: 'Biru edukasi', accent: '#2F80D8', soft: '#E8F2FF', border: '#B9D8F7' },
  { value: 'emerald', label: 'Sains hijau', accent: '#15803D', soft: '#ECFDF5', border: '#BBF7D0' },
  { value: 'amber', label: 'Catatan kuning', accent: '#B45309', soft: '#FFFBEB', border: '#FDE68A' },
  { value: 'rose', label: 'Fokus merah muda', accent: '#BE123C', soft: '#FFF1F2', border: '#FECDD3' },
  { value: 'violet', label: 'Konsep ungu', accent: '#6D5BD0', soft: '#F5F3FF', border: '#DDD6FE' },
]
const scienceSymbolGroups = [
  ['Yunani', ['α', 'β', 'γ', 'Δ', 'θ', 'λ', 'μ', 'π', 'Σ', 'Ω']],
  ['Matematika', ['≈', '≠', '≤', '≥', '∞', '√', '∫', '∑', '∈', '∴']],
  ['Kimia', ['→', '⇌', '↑', '↓', '°C', 'mol', 'pH', 'H₂O', 'CO₂', 'O₂']],
]
const materialPreviewDevices = [
  { value: 'phone', label: 'HP', width: 'max-w-[23rem]' },
  { value: 'tablet', label: 'Tablet', width: 'max-w-[42rem]' },
  { value: 'laptop', label: 'Laptop', width: 'max-w-full' },
]

function createMaterialBlockId(prefix = 'block') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function parseAdvancedMaterialContent(content) {
  const raw = String(content || '').trim()
  if (!raw) return createEmptyAdvancedMaterialContent()
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.schema === advancedMaterialSchema) {
      return {
        ...createEmptyAdvancedMaterialContent(),
        ...parsed,
        tags: normalizeStringList(parsed.tags),
        media: normalizeArray(parsed.media),
        equations: normalizeArray(parsed.equations),
        tables: normalizeArray(parsed.tables),
        quizzes: normalizeArray(parsed.quizzes),
        spoilers: normalizeArray(parsed.spoilers),
      }
    }
  } catch {
    // Konten lama tetap dianggap sebagai isi teks biasa.
  }
  return {
    ...createEmptyAdvancedMaterialContent(),
    body: content || '',
  }
}

function createEmptyAdvancedMaterialContent() {
  return {
    schema: advancedMaterialSchema,
    body: '',
    targetLevel: 'SMA/MA',
    tags: [],
    accentTone: 'sky',
    releaseAt: '',
    media: [],
    equations: [],
    tables: [],
    quizzes: [],
    spoilers: [],
    updatedAt: new Date().toISOString(),
  }
}

function isAdvancedMaterialContent(content) {
  try {
    return JSON.parse(String(content || '')).schema === advancedMaterialSchema
  } catch {
    return false
  }
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function normalizeStringList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean)
  return String(value || '').split(/[,\n;]+/).map((item) => item.trim()).filter(Boolean)
}

function serializeAdvancedMaterialContent(draft) {
  return JSON.stringify({
    ...createEmptyAdvancedMaterialContent(),
    ...draft,
    tags: normalizeStringList(draft.tags),
    media: normalizeArray(draft.media),
    equations: normalizeArray(draft.equations),
    tables: normalizeArray(draft.tables),
    quizzes: normalizeArray(draft.quizzes),
    spoilers: normalizeArray(draft.spoilers),
    updatedAt: new Date().toISOString(),
  })
}

function getAdvancedTone(value) {
  return materialToneOptions.find((tone) => tone.value === value) || materialToneOptions[0]
}

function isMaterialReleased(item) {
  if (!item || item.status === 'Draft') return false
  const releaseAt = parseAdvancedMaterialContent(item.content).releaseAt
  if (!releaseAt) return true
  const releaseDate = new Date(releaseAt)
  if (Number.isNaN(releaseDate.getTime())) return true
  return releaseDate.getTime() <= Date.now()
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatRichInline(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/~~([^~]+)~~/g, '<s>$1</s>')
    .replace(/==([^=]+)==/g, '<mark class="rounded bg-amber-100 px-1">$1</mark>')
    .replace(/\^([^^]+)\^/g, '<sup>$1</sup>')
    .replace(/~([^~]+)~/g, '<sub>$1</sub>')
    .replace(/\[biru\]([\s\S]*?)\[\/biru\]/g, '<span class="font-semibold text-sky-700">$1</span>')
    .replace(/\[hijau\]([\s\S]*?)\[\/hijau\]/g, '<span class="font-semibold text-emerald-700">$1</span>')
    .replace(/\[merah\]([\s\S]*?)\[\/merah\]/g, '<span class="font-semibold text-rose-700">$1</span>')
    .replace(/\[tengah\]([\s\S]*?)\[\/tengah\]/g, '<span class="block text-center">$1</span>')
    .replace(/\[kanan\]([\s\S]*?)\[\/kanan\]/g, '<span class="block text-right">$1</span>')
    .replace(/\[kiri\]([\s\S]*?)\[\/kiri\]/g, '<span class="block text-left">$1</span>')
}

function richTextToHtml(value) {
  const lines = String(value || '').split('\n')
  const html = []
  let inCode = false
  let codeLines = []

  function flushCode() {
    if (!codeLines.length) return
    html.push(`<pre class="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-50"><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
    codeLines = []
  }

  lines.forEach((line) => {
    if (line.trim().startsWith('```')) {
      if (inCode) flushCode()
      inCode = !inCode
      return
    }
    if (inCode) {
      codeLines.push(line)
      return
    }
    if (!line.trim()) {
      html.push('<div class="h-2"></div>')
      return
    }
    if (/^###\s+/.test(line)) {
      html.push(`<h3 class="mt-5 text-xl font-black leading-tight text-slate-950">${formatRichInline(line.replace(/^###\s+/, ''))}</h3>`)
      return
    }
    if (/^##\s+/.test(line)) {
      html.push(`<h2 class="mt-6 text-2xl font-black leading-tight text-slate-950">${formatRichInline(line.replace(/^##\s+/, ''))}</h2>`)
      return
    }
    if (/^#\s+/.test(line)) {
      html.push(`<h1 class="mt-6 text-3xl font-black leading-tight text-slate-950">${formatRichInline(line.replace(/^#\s+/, ''))}</h1>`)
      return
    }
    if (/^>\s*/.test(line)) {
      html.push(`<p class="rounded-2xl border-l-4 border-sky-400 bg-sky-50 px-4 py-3 text-sm font-semibold leading-7 text-sky-900">${formatRichInline(line.replace(/^>\s*/, ''))}</p>`)
      return
    }
    if (/^\s*[-*]\s+/.test(line)) {
      html.push(`<p class="pl-4 text-sm leading-7 text-slate-700 before:mr-2 before:text-sky-600 before:content-['•']">${formatRichInline(line.replace(/^\s*[-*]\s+/, ''))}</p>`)
      return
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      html.push(`<p class="pl-4 text-sm leading-7 text-slate-700">${formatRichInline(line)}</p>`)
      return
    }
    if (/^\$\$[\s\S]*\$\$$/.test(line.trim()) || /\\\([\s\S]*\\\)/.test(line)) {
      html.push(`<div class="overflow-x-auto rounded-2xl bg-slate-50 px-4 py-3 font-mono text-sm font-bold text-slate-800 ring-1 ring-slate-100">${escapeHtml(line)}</div>`)
      return
    }
    html.push(`<p class="text-sm leading-7 text-slate-700">${formatRichInline(line)}</p>`)
  })
  if (inCode) flushCode()
  return html.join('')
}

function formatFileSize(size) {
  const bytes = Number(size || 0)
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function inferMediaTypeFromFile(file) {
  const mime = file?.type || ''
  const name = file?.name || ''
  if (mime.startsWith('image/')) return 'Gambar'
  if (mime.startsWith('audio/')) return 'Audio'
  if (mime.startsWith('video/')) return 'Video'
  if (mime.includes('pdf') || /\.pdf$/i.test(name)) return 'PDF'
  if (mime.includes('presentation') || /\.(ppt|pptx)$/i.test(name)) return 'Presentasi'
  if (mime.includes('sheet') || /\.(xls|xlsx|csv)$/i.test(name)) return 'Spreadsheet'
  return 'Dokumen'
}

function parseTableDraft(headersText, rowsText) {
  const headers = String(headersText || '')
    .split(/[,\t]/)
    .map((item) => item.trim())
    .filter(Boolean)
  const rows = String(rowsText || '')
    .split('\n')
    .map((line) => line.split(/[,\t]/).map((item) => item.trim()))
    .filter((row) => row.some(Boolean))
  return { headers: headers.length ? headers : ['Kolom 1', 'Kolom 2'], rows }
}

function requestMathTypeset() {
  if (typeof window === 'undefined') return
  if (window.MathJax?.typesetPromise) {
    window.MathJax.typesetPromise().catch(() => {})
    return
  }
  if (document.getElementById('islelearn-mathjax')) return
  window.MathJax = {
    tex: { inlineMath: [['\\(', '\\)']], displayMath: [['$$', '$$']] },
    svg: { fontCache: 'global' },
  }
  const script = document.createElement('script')
  script.id = 'islelearn-mathjax'
  script.async = true
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js'
  document.head.appendChild(script)
}

function MaterialForm({ material, lookups, subjectOptions = [], onCancel, onSave }) {
  const [form, setForm] = useState(material)
  const [draft, setDraft] = useState(() => parseAdvancedMaterialContent(material.content))
  const [activePanel, setActivePanel] = useState('editor')
  const [previewDevice, setPreviewDevice] = useState('laptop')
  const [autosaveNotice, setAutosaveNotice] = useState('')
  const [equationDraft, setEquationDraft] = useState({ label: '', latex: '' })
  const [mediaDraft, setMediaDraft] = useState({ type: 'Video', title: '', url: '' })
  const [tableDraft, setTableDraft] = useState({ title: 'Tabel data', headers: 'Variabel,Nilai,Keterangan', rows: 'Contoh,10,Satuan' })
  const [quizDraft, setQuizDraft] = useState({ question: '', options: 'A\nB\nC\nD', answer: '', explanation: '' })
  const [spoilerDraft, setSpoilerDraft] = useState({ title: 'Pembahasan', body: '' })
  const bodyRef = useRef(null)
  const scopedSubjects = getScopedSubjectLookupRows(lookups.subjects, subjectOptions)
  const subjectsList = getMaterialSubjectOptions(scopedSubjects, [material], subjectOptions.length ? subjectOptions : highSchoolSubjectFolders)
  const classesList = getMaterialClassOptions(lookups.classes, material.className)
  const activeTypeDetails = getMaterialTypeDetails(form.type)
  const linkedMaterial = isLinkedMaterialType(form.type)
  const content = linkedMaterial ? (form.content || '') : (draft.body || '')
  const autosaveKey = `islelearn-material-autosave-${material.id || 'baru'}`
  const hasContent = content.trim().length > 0
    || (!linkedMaterial && (draft.media.length > 0 || draft.equations.length > 0 || draft.tables.length > 0 || draft.quizzes.length > 0 || draft.spoilers.length > 0))
  const hasTitle = (form.title || '').trim().length > 0
  const invalidLinkedMaterial = linkedMaterial && hasContent && !isValidLinkedMaterial(content, form.type)
  const publishNeedsContent = form.status === 'Publish' && !hasContent
  const publishNeedsLinkedMaterial = form.status === 'Publish' && linkedMaterial && !isValidLinkedMaterial(content, form.type)
  const validMaterial = hasTitle && !invalidLinkedMaterial && !publishNeedsContent && !publishNeedsLinkedMaterial
  const selectedDevice = materialPreviewDevices.find((device) => device.value === previewDevice) || materialPreviewDevices[2]

  useEffect(() => {
    setForm(material)
    setDraft(parseAdvancedMaterialContent(material.content))
    const saved = safeReadLocalJson(autosaveKey, null)
    setAutosaveNotice(saved?.draft ? 'Autosave tersedia' : '')
  }, [material])

  useEffect(() => {
    if (!hasTitle && !hasContent) return undefined
    const timer = setTimeout(() => {
      safeWriteLocalJson(autosaveKey, {
        form,
        draft,
        savedAt: new Date().toISOString(),
      })
      setAutosaveNotice('Tersimpan otomatis')
    }, 700)
    return () => clearTimeout(timer)
  }, [autosaveKey, draft, form, hasContent, hasTitle])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }))
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

  function restoreAutosave() {
    const saved = safeReadLocalJson(autosaveKey, null)
    if (!saved?.draft) return
    setForm((current) => ({ ...current, ...(saved.form || {}) }))
    setDraft({ ...createEmptyAdvancedMaterialContent(), ...saved.draft })
    setAutosaveNotice('Autosave dipulihkan')
  }

  function saveCurrentMaterial() {
    const nextContent = linkedMaterial ? content : serializeAdvancedMaterialContent(draft)
    safeWriteLocalJson(autosaveKey, null)
    onSave({
      ...form,
      content: nextContent,
      description: form.description || draft.body.slice(0, 160),
    })
  }

  function wrapBodySelection(before, after = before, placeholder = 'teks') {
    const textarea = bodyRef.current
    const currentBody = draft.body || ''
    const start = textarea?.selectionStart ?? currentBody.length
    const end = textarea?.selectionEnd ?? currentBody.length
    const selected = currentBody.slice(start, end) || placeholder
    const nextBody = `${currentBody.slice(0, start)}${before}${selected}${after}${currentBody.slice(end)}`
    updateDraft('body', nextBody)
    requestAnimationFrame(() => {
      bodyRef.current?.focus()
      const cursor = start + before.length + selected.length + after.length
      bodyRef.current?.setSelectionRange(cursor, cursor)
    })
  }

  function insertBodyText(text) {
    const textarea = bodyRef.current
    const currentBody = draft.body || ''
    const start = textarea?.selectionStart ?? currentBody.length
    const end = textarea?.selectionEnd ?? currentBody.length
    const nextBody = `${currentBody.slice(0, start)}${text}${currentBody.slice(end)}`
    updateDraft('body', nextBody)
    requestAnimationFrame(() => {
      bodyRef.current?.focus()
      const cursor = start + text.length
      bodyRef.current?.setSelectionRange(cursor, cursor)
    })
  }

  function addEquation() {
    if (!equationDraft.latex.trim()) return
    setDraft((current) => ({
      ...current,
      equations: [
        ...current.equations,
        { id: createMaterialBlockId('equation'), label: equationDraft.label || 'Rumus', latex: equationDraft.latex.trim() },
      ],
      body: `${current.body || ''}\n\n$$${equationDraft.latex.trim().replace(/^\$\$|\$\$$/g, '')}$$`,
    }))
    setEquationDraft({ label: '', latex: '' })
  }

  function addMediaFromUrl(type = mediaDraft.type) {
    if (!mediaDraft.url.trim()) return
    setDraft((current) => ({
      ...current,
      media: [
        ...current.media,
        {
          id: createMaterialBlockId('media'),
          type,
          title: mediaDraft.title || type,
          url: mediaDraft.url.trim(),
        },
      ],
    }))
    setMediaDraft({ type, title: '', url: '' })
  }

  function readFilesIntoDraft(files) {
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        setDraft((current) => ({
          ...current,
          media: [
            ...current.media,
            {
              id: createMaterialBlockId('file'),
              type: inferMediaTypeFromFile(file),
              title: file.name,
              name: file.name,
              size: file.size,
              mime: file.type,
              dataUrl: reader.result,
            },
          ],
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  function handleFileUpload(event) {
    readFilesIntoDraft(Array.from(event.target.files || []))
    event.target.value = ''
  }

  function handleFileDrop(event) {
    event.preventDefault()
    readFilesIntoDraft(Array.from(event.dataTransfer?.files || []))
  }

  function addTable() {
    const parsed = parseTableDraft(tableDraft.headers, tableDraft.rows)
    setDraft((current) => ({
      ...current,
      tables: [
        ...current.tables,
        { id: createMaterialBlockId('table'), title: tableDraft.title || 'Tabel data', ...parsed },
      ],
    }))
  }

  function addQuiz() {
    if (!quizDraft.question.trim()) return
    setDraft((current) => ({
      ...current,
      quizzes: [
        ...current.quizzes,
        {
          id: createMaterialBlockId('quiz'),
          question: quizDraft.question.trim(),
          options: normalizeStringList(quizDraft.options),
          answer: quizDraft.answer.trim(),
          explanation: quizDraft.explanation.trim(),
        },
      ],
    }))
    setQuizDraft({ question: '', options: 'A\nB\nC\nD', answer: '', explanation: '' })
  }

  function addSpoiler() {
    if (!spoilerDraft.body.trim()) return
    setDraft((current) => ({
      ...current,
      spoilers: [
        ...current.spoilers,
        { id: createMaterialBlockId('spoiler'), title: spoilerDraft.title || 'Pembahasan', body: spoilerDraft.body.trim() },
      ],
    }))
    setSpoilerDraft({ title: 'Pembahasan', body: '' })
  }

  function removeDraftItem(collection, id) {
    setDraft((current) => ({ ...current, [collection]: current[collection].filter((item) => item.id !== id) }))
  }

  return (
    <section className="liquid-glass-light mb-5 overflow-hidden rounded-[1.25rem]">
      <header className="flex flex-col gap-3 border-b border-white/70 bg-white/45 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-[0.9rem] bg-[#E8F2FF] text-[#2F80D8] ring-1 ring-[#B9D8F7]">
            <BookOpen size={20} />
          </span>
          <div>
            <h2 className="text-xl font-black leading-tight text-[#13232d]">{form.id ? 'Edit materi belajar' : 'Tulis materi belajar'}</h2>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              Tulis cepat, sisipkan rumus, media, kuis sela, pembahasan tersembunyi, lalu preview sebelum publish.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {autosaveNotice && <StatusBadge tone="cyan">{autosaveNotice}</StatusBadge>}
          {autosaveNotice === 'Autosave tersedia' && (
            <button type="button" onClick={restoreAutosave} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-sky-700 ring-1 ring-sky-100">
              Pulihkan
            </button>
          )}
          <StatusBadge tone={form.status === 'Publish' ? 'green' : 'amber'}>{form.status}</StatusBadge>
        </div>
      </header>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_25rem]">
        <div className="space-y-4 p-4 lg:p-5">
          <section className="glass-inset rounded-[1rem] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#2F80D8]">Informasi materi</p>
                <h3 className="text-lg font-black text-[#13232d]">Identitas yang dilihat siswa</h3>
              </div>
              <span className="rounded-xl bg-white px-3 py-1.5 text-xs font-black text-slate-500 ring-1 ring-slate-100">Wajib ringkas</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className={materialLabelClass}>Judul utama
                <input value={form.title || ''} onChange={(event) => updateField('title', event.target.value)} placeholder="Contoh: Bab 1 Teks LHO" className={materialInputClass} />
              </label>
              <label className={materialLabelClass}>Topik / Bab
                <input value={form.topic || ''} onChange={(event) => updateField('topic', event.target.value)} placeholder="Topik singkat" className={materialInputClass} />
              </label>
              <label className={materialLabelClass}>Target tingkatan
                <select value={draft.targetLevel} onChange={(event) => updateDraft('targetLevel', event.target.value)} className={materialInputClass}>
                  {materialTargetLevels.map((level) => <option key={level}>{level}</option>)}
                </select>
              </label>
              <label className={materialLabelClass}>Tag & kata kunci
                <input value={draft.tags.join(', ')} onChange={(event) => updateDraft('tags', normalizeStringList(event.target.value))} placeholder="observasi, teks, latihan" className={materialInputClass} />
              </label>
            </div>
            <label className={`${materialLabelClass} mt-3`}>Deskripsi singkat
              <textarea value={form.description || ''} onChange={(event) => updateField('description', event.target.value)} rows={2} placeholder="Rangkuman 1-2 kalimat tentang apa yang akan dipelajari siswa." className={`${materialInputClass} resize-y leading-6`} />
            </label>
          </section>

          {linkedMaterial ? (
            <section className="rounded-[1rem] bg-white p-4 ring-1 ring-[#D9E6F5]">
              <div className="mb-3 flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                  {(() => {
                    const ActiveIcon = getMaterialTypeIcon(form.type)
                    return <ActiveIcon size={18} />
                  })()}
                </span>
                <div>
                  <h3 className="text-lg font-black text-[#13232d]">{getMaterialContentLabel(form.type, linkedMaterial)}</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{getMaterialTypeHint(form.type)}</p>
                </div>
              </div>
              <textarea
                value={content}
                onChange={(event) => updateField('content', event.target.value)}
                rows={4}
                placeholder={getMaterialContentPlaceholder(form.type, linkedMaterial)}
                className={`${materialInputClass} resize-y leading-7`}
              />
            </section>
          ) : (
            <>
              <section className="glass-panel rounded-[1rem] p-4">
                <div className="liquid-toolbar sticky top-3 z-20 mb-4 rounded-[1rem] p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#2F80D8]">Editor teks</p>
                    <h3 className="text-lg font-black text-[#13232d]">Tulis isi materi</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      ['B', () => wrapBodySelection('**', '**', 'teks tebal')],
                      ['I', () => wrapBodySelection('*', '*', 'teks miring')],
                      ['S', () => wrapBodySelection('~~', '~~', 'teks coret')],
                      ['H1', () => insertBodyText('\n# Judul besar\n')],
                      ['H2', () => insertBodyText('\n## Sub-bab\n')],
                      ['H3', () => insertBodyText('\n### Poin kecil\n')],
                      ['•', () => insertBodyText('\n- Poin materi')],
                      ['1.', () => insertBodyText('\n1. Langkah pertama')],
                      ['Callout', () => insertBodyText('\n> Info penting: tulis definisi atau catatan kunci di sini.\n')],
                      ['Code', () => insertBodyText('\n```js\n// tulis kode di sini\n```\n')],
                      ['x²', () => wrapBodySelection('^', '^', '2')],
                      ['H₂O', () => wrapBodySelection('~', '~', '2')],
                      ['Mark', () => wrapBodySelection('==', '==', 'kata penting')],
                      ['Biru', () => wrapBodySelection('[biru]', '[/biru]', 'teks berwarna')],
                      ['Hijau', () => wrapBodySelection('[hijau]', '[/hijau]', 'teks berwarna')],
                      ['Merah', () => wrapBodySelection('[merah]', '[/merah]', 'teks berwarna')],
                      ['Kiri', () => wrapBodySelection('[kiri]', '[/kiri]', 'teks rata kiri')],
                      ['Tengah', () => wrapBodySelection('[tengah]', '[/tengah]', 'teks rata tengah')],
                      ['Kanan', () => wrapBodySelection('[kanan]', '[/kanan]', 'teks rata kanan')],
                    ].map(([label, action]) => (
                      <button key={label} type="button" onClick={action} className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-black text-slate-700 ring-1 ring-slate-100 transition hover:bg-sky-50 hover:text-sky-700">
                        {label}
                      </button>
                    ))}
                  </div>
                  </div>
                </div>
                <textarea
                  ref={bodyRef}
                  value={draft.body}
                  onChange={(event) => updateDraft('body', event.target.value)}
                  rows={21}
                  placeholder="Tulis materi di sini. Gunakan toolbar untuk judul, daftar, callout, kode, pangkat, rumus, dan penekanan."
                  className={`${materialInputClass} min-h-[32rem] resize-y bg-white/88 leading-7 shadow-inner`}
                />
              </section>

              <section className="hidden">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">Matematika & science</p>
                    <h3 className="text-lg font-black text-[#13232d]">Rumus, simbol, simulasi, dan tabel</h3>
                  </div>
                  <button type="button" onClick={() => setActivePanel(activePanel === 'science' ? 'editor' : 'science')} className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800 ring-1 ring-emerald-100">
                    {activePanel === 'science' ? 'Ringkas' : 'Buka tools'}
                  </button>
                </div>
                <div className="grid gap-3 xl:grid-cols-2">
                  <div className="rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
                    <p className="text-sm font-black text-emerald-950">Equation editor</p>
                    <div className="mt-3 grid gap-2">
                      <input value={equationDraft.label} onChange={(event) => setEquationDraft((current) => ({ ...current, label: event.target.value }))} placeholder="Nama rumus, contoh: Hukum Newton" className={materialInputClass} />
                      <input value={equationDraft.latex} onChange={(event) => setEquationDraft((current) => ({ ...current, latex: event.target.value }))} placeholder="LaTeX: F = m \\times a" className={materialInputClass} />
                      <button type="button" onClick={addEquation} className="rounded-xl bg-emerald-700 px-3 py-2.5 text-sm font-black text-white">Sisipkan rumus</button>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                    <p className="text-sm font-black text-slate-950">Library simbol cepat</p>
                    <div className="mt-3 space-y-2">
                      {scienceSymbolGroups.map(([label, symbols]) => (
                        <div key={label}>
                          <p className="mb-1 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {symbols.map((symbol) => (
                              <button key={symbol} type="button" onClick={() => insertBodyText(symbol)} className="rounded-lg bg-white px-2.5 py-1.5 font-mono text-xs font-black text-slate-700 ring-1 ring-slate-100 hover:bg-sky-50">
                                {symbol}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr]">
                  <div className="rounded-2xl bg-sky-50 p-3 ring-1 ring-sky-100">
                    <p className="text-sm font-black text-sky-950">Sematkan simulasi</p>
                    <div className="mt-3 grid gap-2">
                      <input value={mediaDraft.type === 'Simulasi' ? mediaDraft.title : ''} onChange={(event) => setMediaDraft({ type: 'Simulasi', title: event.target.value, url: mediaDraft.url })} placeholder="Judul simulasi, contoh: Gerak parabola" className={materialInputClass} />
                      <input value={mediaDraft.type === 'Simulasi' ? mediaDraft.url : ''} onChange={(event) => setMediaDraft({ type: 'Simulasi', title: mediaDraft.title, url: event.target.value })} placeholder="URL embed PhET, GeoGebra, Desmos" className={materialInputClass} />
                      <button type="button" onClick={() => addMediaFromUrl('Simulasi')} className="rounded-xl bg-sky-700 px-3 py-2.5 text-sm font-black text-white">Tambahkan simulasi</button>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-100">
                    <p className="text-sm font-black text-amber-950">Pembuat tabel struktur</p>
                    <div className="mt-3 grid gap-2">
                      <input value={tableDraft.title} onChange={(event) => setTableDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Judul tabel" className={materialInputClass} />
                      <input value={tableDraft.headers} onChange={(event) => setTableDraft((current) => ({ ...current, headers: event.target.value }))} placeholder="Kolom dipisahkan koma" className={materialInputClass} />
                      <textarea value={tableDraft.rows} onChange={(event) => setTableDraft((current) => ({ ...current, rows: event.target.value }))} rows={3} placeholder="Satu baris data per baris, kolom dipisahkan koma" className={`${materialInputClass} resize-y`} />
                      <button type="button" onClick={addTable} className="rounded-xl bg-amber-600 px-3 py-2.5 text-sm font-black text-white">Tambahkan tabel</button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="hidden">
                <div className="mb-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#2F80D8]">Media & berkas</p>
                  <h3 className="text-lg font-black text-[#13232d]">Gambar, video, audio, PDF, dokumen, dan embed</h3>
                </div>
                <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
                  <label
                    className="grid min-h-[9rem] cursor-pointer place-items-center rounded-2xl border border-dashed border-sky-200 bg-sky-50/50 p-4 text-center transition hover:bg-sky-50"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={handleFileDrop}
                  >
                    <input type="file" multiple className="sr-only" onChange={handleFileUpload} accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv" />
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-sky-700 ring-1 ring-sky-100"><Download size={18} /></span>
                    <span className="mt-2 text-sm font-black text-slate-950">Klik atau drop file</span>
                    <span className="mt-1 text-xs font-semibold leading-5 text-slate-500">Gambar akan tertanam. File besar lebih baik memakai URL/Drive.</span>
                  </label>
                  <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
                    <div className="grid gap-2">
                      <select value={mediaDraft.type} onChange={(event) => setMediaDraft((current) => ({ ...current, type: event.target.value }))} className={materialInputClass}>
                        {['Gambar', 'Video', 'Audio', 'PDF', 'Dokumen', 'Presentasi', 'Spreadsheet', 'Embed'].map((type) => <option key={type}>{type}</option>)}
                      </select>
                      <input value={mediaDraft.title} onChange={(event) => setMediaDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Judul media" className={materialInputClass} />
                      <input value={mediaDraft.url} onChange={(event) => setMediaDraft((current) => ({ ...current, url: event.target.value }))} placeholder="URL YouTube/Drive/PDF/embed" className={materialInputClass} />
                      <button type="button" onClick={() => addMediaFromUrl(mediaDraft.type)} className="rounded-xl bg-[#0B3A5B] px-3 py-2.5 text-sm font-black text-white">Tambahkan URL</button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="hidden">
                <div className="mb-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-violet-700">Evaluasi & pembahasan</p>
                  <h3 className="text-lg font-black text-[#13232d]">Kuis sela dan spoiler solusi</h3>
                </div>
                <div className="grid gap-3 xl:grid-cols-2">
                  <div className="rounded-2xl bg-violet-50 p-3 ring-1 ring-violet-100">
                    <p className="text-sm font-black text-violet-950">Penyisip kuis sela</p>
                    <div className="mt-3 grid gap-2">
                      <textarea value={quizDraft.question} onChange={(event) => setQuizDraft((current) => ({ ...current, question: event.target.value }))} rows={2} placeholder="Pertanyaan cek pemahaman" className={`${materialInputClass} resize-y`} />
                      <textarea value={quizDraft.options} onChange={(event) => setQuizDraft((current) => ({ ...current, options: event.target.value }))} rows={4} placeholder="Pilihan jawaban, satu opsi per baris" className={`${materialInputClass} resize-y`} />
                      <input value={quizDraft.answer} onChange={(event) => setQuizDraft((current) => ({ ...current, answer: event.target.value }))} placeholder="Jawaban benar" className={materialInputClass} />
                      <textarea value={quizDraft.explanation} onChange={(event) => setQuizDraft((current) => ({ ...current, explanation: event.target.value }))} rows={2} placeholder="Pembahasan singkat" className={`${materialInputClass} resize-y`} />
                      <button type="button" onClick={addQuiz} className="rounded-xl bg-violet-700 px-3 py-2.5 text-sm font-black text-white">Tambahkan kuis</button>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-100">
                    <p className="text-sm font-black text-amber-950">Blok pembahasan tersembunyi</p>
                    <div className="mt-3 grid gap-2">
                      <input value={spoilerDraft.title} onChange={(event) => setSpoilerDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Judul spoiler" className={materialInputClass} />
                      <textarea value={spoilerDraft.body} onChange={(event) => setSpoilerDraft((current) => ({ ...current, body: event.target.value }))} rows={6} placeholder="Langkah penyelesaian atau jawaban yang baru dibuka siswa saat diklik." className={`${materialInputClass} resize-y`} />
                      <button type="button" onClick={addSpoiler} className="rounded-xl bg-amber-600 px-3 py-2.5 text-sm font-black text-white">Tambahkan spoiler</button>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {(invalidLinkedMaterial || publishNeedsContent) && (
            <div className="rounded-[0.9rem] bg-amber-50 px-3 py-2.5 text-sm font-bold leading-6 text-amber-800 ring-1 ring-amber-100">
              {invalidLinkedMaterial
                ? 'Gunakan path internal /materials/...html atau URL lengkap yang diawali http/https.'
                : 'Publish membutuhkan isi materi, media, atau URL agar siswa tidak melihat halaman kosong.'}
            </div>
          )}
        </div>

        <aside className="liquid-side-panel space-y-4 border-t border-white/70 p-4 xl:border-l xl:border-t-0">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0284c7]">Jenis materi</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {materialTypeOptions.map((option) => {
                const type = option.value
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
                    <TypeIcon size={14} /> {option.label}
                  </button>
                )
              })}
            </div>
            <section className="mt-3 rounded-[0.95rem] bg-white/76 p-3 ring-1 ring-[#0B3A5B]/8">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-[0.7rem] bg-[#E0F2FE] text-[#0284c7] ring-1 ring-[#0284c7]/10">
                  {(() => {
                    const ActiveIcon = getMaterialTypeIcon(form.type)
                    return <ActiveIcon size={15} />
                  })()}
                </span>
                <div>
                  <p className="text-sm font-black text-[#13232d]">{activeTypeDetails.label}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{getMaterialTypeHint(form.type)}</p>
                </div>
              </div>
            </section>
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
              Draft tetap tersimpan untuk guru. Publish membuat materi muncul di halaman siswa saat jadwal rilis sudah tiba.
            </p>
          </div>

          {subjectOptions.length === 1 ? (
            <div className={materialLabelClass}>Mata pelajaran
              <div className={`${materialInputClass} flex min-h-[2.75rem] items-center bg-[#EEF7FF] text-[#17446E]`}>
                {form.subject || subjectsList[0]?.name || subjectOptions[0]}
              </div>
            </div>
          ) : (
            <label className={materialLabelClass}>Mata pelajaran
              <select value={form.subjectId || `subject:${form.subject || subjectsList[0]?.name || ''}`} onChange={(event) => updateSubject(event.target.value)} className={materialInputClass}>
                {subjectsList.map((subject) => <option key={subjectOptionValue(subject)} value={subjectOptionValue(subject)}>{subject.name}</option>)}
              </select>
            </label>
          )}

          <label className={materialLabelClass}>Kelas
            <select value={form.classId || `class:${form.className || classesList[0]?.name || ''}`} onChange={(event) => updateClass(event.target.value)} className={materialInputClass}>
              {classesList.map((classItem) => <option key={classOptionValue(classItem)} value={classOptionValue(classItem)}>{classItem.name}</option>)}
            </select>
          </label>

          {!linkedMaterial && (
            <>
              <label className={materialLabelClass}>Jadwal rilis
                <input type="datetime-local" value={draft.releaseAt || ''} onChange={(event) => updateDraft('releaseAt', event.target.value)} className={materialInputClass} />
              </label>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0284c7]">Tone visual</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {materialToneOptions.map((tone) => (
                    <button
                      key={tone.value}
                      type="button"
                      onClick={() => updateDraft('accentTone', tone.value)}
                      className={`rounded-xl px-3 py-2 text-left text-xs font-black ring-1 transition ${draft.accentTone === tone.value ? 'bg-white text-slate-950 shadow-sm' : 'bg-white/60 text-slate-600'}`}
                      style={{ borderColor: tone.border }}
                    >
                      <span className="mb-1 block h-2 rounded-full" style={{ backgroundColor: tone.accent }} />
                      {tone.label}
                    </button>
                  ))}
                </div>
              </div>

              <details className="glass-panel group rounded-2xl p-3" open>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-[#132437]">
                  Rumus & sains
                  <span className="rounded-lg bg-white/70 px-2 py-1 text-[11px] font-black text-[#2F80D8] ring-1 ring-white/70">Tools</span>
                </summary>
                <div className="mt-3 space-y-3">
                  <div className="grid gap-2">
                    <input value={equationDraft.label} onChange={(event) => setEquationDraft((current) => ({ ...current, label: event.target.value }))} placeholder="Nama rumus" className={materialInputClass} />
                    <input value={equationDraft.latex} onChange={(event) => setEquationDraft((current) => ({ ...current, latex: event.target.value }))} placeholder="LaTeX: F = m \\times a" className={materialInputClass} />
                    <button type="button" onClick={addEquation} className="rounded-xl bg-emerald-700 px-3 py-2.5 text-sm font-black text-white">Sisipkan rumus</button>
                  </div>
                  <div>
                    <p className="mb-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Simbol cepat</p>
                    <div className="flex flex-wrap gap-1.5">
                      {scienceSymbolGroups.flatMap(([, symbols]) => symbols).slice(0, 30).map((symbol) => (
                        <button key={symbol} type="button" onClick={() => insertBodyText(symbol)} className="rounded-lg bg-white px-2.5 py-1.5 font-mono text-xs font-black text-slate-700 ring-1 ring-slate-100 hover:bg-sky-50">
                          {symbol}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <input value={mediaDraft.type === 'Simulasi' ? mediaDraft.title : ''} onChange={(event) => setMediaDraft({ type: 'Simulasi', title: event.target.value, url: mediaDraft.url })} placeholder="Judul simulasi" className={materialInputClass} />
                    <input value={mediaDraft.type === 'Simulasi' ? mediaDraft.url : ''} onChange={(event) => setMediaDraft({ type: 'Simulasi', title: mediaDraft.title, url: event.target.value })} placeholder="URL PhET, GeoGebra, Desmos" className={materialInputClass} />
                    <button type="button" onClick={() => addMediaFromUrl('Simulasi')} className="rounded-xl bg-sky-700 px-3 py-2.5 text-sm font-black text-white">Tambahkan simulasi</button>
                  </div>
                </div>
              </details>

              <details className="glass-panel group rounded-2xl p-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-[#132437]">
                  Media & lampiran
                  <span className="rounded-lg bg-white/70 px-2 py-1 text-[11px] font-black text-[#2F80D8] ring-1 ring-white/70">Embed</span>
                </summary>
                <div className="mt-3 space-y-3">
                  <label
                    className="grid min-h-[7rem] cursor-pointer place-items-center rounded-2xl border border-dashed border-sky-200 bg-white/60 p-4 text-center transition hover:bg-sky-50"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={handleFileDrop}
                  >
                    <input type="file" multiple className="sr-only" onChange={handleFileUpload} accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv" />
                    <span className="text-sm font-black text-slate-950">Upload / drop file</span>
                    <span className="mt-1 text-xs font-semibold leading-5 text-slate-500">Gambar, video, audio, PDF, dokumen, atau spreadsheet.</span>
                  </label>
                  <div className="grid gap-2">
                    <select value={mediaDraft.type} onChange={(event) => setMediaDraft((current) => ({ ...current, type: event.target.value }))} className={materialInputClass}>
                      {['Gambar', 'Video', 'Audio', 'PDF', 'Dokumen', 'Presentasi', 'Spreadsheet', 'Embed'].map((type) => <option key={type}>{type}</option>)}
                    </select>
                    <input value={mediaDraft.title} onChange={(event) => setMediaDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Judul media" className={materialInputClass} />
                    <input value={mediaDraft.url} onChange={(event) => setMediaDraft((current) => ({ ...current, url: event.target.value }))} placeholder="URL YouTube/Drive/PDF/embed" className={materialInputClass} />
                    <button type="button" onClick={() => addMediaFromUrl(mediaDraft.type)} className="rounded-xl bg-[#0B3A5B] px-3 py-2.5 text-sm font-black text-white">Tambahkan media</button>
                  </div>
                </div>
              </details>

              <details className="glass-panel group rounded-2xl p-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-[#132437]">
                  Tabel, kuis & pembahasan
                  <span className="rounded-lg bg-white/70 px-2 py-1 text-[11px] font-black text-[#2F80D8] ring-1 ring-white/70">Interaktif</span>
                </summary>
                <div className="mt-3 space-y-3">
                  <div className="grid gap-2 rounded-2xl bg-white/62 p-2 ring-1 ring-white/70">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Tabel data</p>
                    <input value={tableDraft.title} onChange={(event) => setTableDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Judul tabel" className={materialInputClass} />
                    <input value={tableDraft.headers} onChange={(event) => setTableDraft((current) => ({ ...current, headers: event.target.value }))} placeholder="Kolom dipisahkan koma" className={materialInputClass} />
                    <textarea value={tableDraft.rows} onChange={(event) => setTableDraft((current) => ({ ...current, rows: event.target.value }))} rows={3} placeholder="Satu baris data per baris" className={`${materialInputClass} resize-y`} />
                    <button type="button" onClick={addTable} className="rounded-xl bg-amber-600 px-3 py-2.5 text-sm font-black text-white">Tambahkan tabel</button>
                  </div>
                  <div className="grid gap-2 rounded-2xl bg-white/62 p-2 ring-1 ring-white/70">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Kuis sela</p>
                    <textarea value={quizDraft.question} onChange={(event) => setQuizDraft((current) => ({ ...current, question: event.target.value }))} rows={2} placeholder="Pertanyaan cek pemahaman" className={`${materialInputClass} resize-y`} />
                    <textarea value={quizDraft.options} onChange={(event) => setQuizDraft((current) => ({ ...current, options: event.target.value }))} rows={3} placeholder="Pilihan jawaban, satu opsi per baris" className={`${materialInputClass} resize-y`} />
                    <input value={quizDraft.answer} onChange={(event) => setQuizDraft((current) => ({ ...current, answer: event.target.value }))} placeholder="Jawaban benar" className={materialInputClass} />
                    <textarea value={quizDraft.explanation} onChange={(event) => setQuizDraft((current) => ({ ...current, explanation: event.target.value }))} rows={2} placeholder="Pembahasan singkat" className={`${materialInputClass} resize-y`} />
                    <button type="button" onClick={addQuiz} className="rounded-xl bg-sky-700 px-3 py-2.5 text-sm font-black text-white">Tambahkan kuis</button>
                  </div>
                  <div className="grid gap-2 rounded-2xl bg-white/62 p-2 ring-1 ring-white/70">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Spoiler pembahasan</p>
                    <input value={spoilerDraft.title} onChange={(event) => setSpoilerDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Judul spoiler" className={materialInputClass} />
                    <textarea value={spoilerDraft.body} onChange={(event) => setSpoilerDraft((current) => ({ ...current, body: event.target.value }))} rows={4} placeholder="Langkah penyelesaian tersembunyi." className={`${materialInputClass} resize-y`} />
                    <button type="button" onClick={addSpoiler} className="rounded-xl bg-[#0B3A5B] px-3 py-2.5 text-sm font-black text-white">Tambahkan spoiler</button>
                  </div>
                </div>
              </details>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0284c7]">Preview</p>
                  <div className="flex rounded-xl bg-white p-1 ring-1 ring-slate-100">
                    {materialPreviewDevices.map((device) => (
                      <button key={device.value} type="button" onClick={() => setPreviewDevice(device.value)} className={`rounded-lg px-2 py-1 text-[11px] font-black ${previewDevice === device.value ? 'bg-[#0B3A5B] text-white' : 'text-slate-500'}`}>
                        {device.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="max-h-[34rem] overflow-auto rounded-2xl bg-white p-2 ring-1 ring-slate-100">
                  <div className={`mx-auto ${selectedDevice.width}`}>
                    <AdvancedMaterialViewer material={form} draft={draft} compact />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-100">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Isi tambahan</p>
                <div className="mt-3 grid gap-2 text-xs font-bold text-slate-600">
                  {[
                    ['Rumus', draft.equations.length, 'equations'],
                    ['Media', draft.media.length, 'media'],
                    ['Tabel', draft.tables.length, 'tables'],
                    ['Kuis', draft.quizzes.length, 'quizzes'],
                    ['Spoiler', draft.spoilers.length, 'spoilers'],
                  ].map(([label, count, key]) => (
                    <div key={key} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
                      <span>{label}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
                {[...draft.equations.map((item) => ['equations', item]), ...draft.media.map((item) => ['media', item]), ...draft.tables.map((item) => ['tables', item]), ...draft.quizzes.map((item) => ['quizzes', item]), ...draft.spoilers.map((item) => ['spoilers', item])].length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {[...draft.equations.map((item) => ['equations', item]), ...draft.media.map((item) => ['media', item]), ...draft.tables.map((item) => ['tables', item]), ...draft.quizzes.map((item) => ['quizzes', item]), ...draft.spoilers.map((item) => ['spoilers', item])].slice(0, 7).map(([collection, item]) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-white px-2 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
                        <span className="min-w-0 truncate">{item.title || item.label || item.question || item.name || collection}</span>
                        <button type="button" onClick={() => removeDraftItem(collection, item.id)} className="text-rose-600"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </aside>
      </div>

      <footer className="flex flex-col-reverse gap-2 border-t border-[#0B3A5B]/8 bg-white/72 px-4 py-3 sm:flex-row sm:justify-end">
        <button onClick={onCancel} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-100">
          <X size={16} /> Batal
        </button>
        <button onClick={saveCurrentMaterial} disabled={!validMaterial} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] bg-[#0B3A5B] px-4 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(15,31,42,0.14)] transition hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-45">
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

const questionImportFileTypes = '.pdf,.docx,.html,.htm,.txt'
const questionMediaTypeOptions = ['Gambar', 'Audio', 'Video', 'PDF', 'Dokumen', 'HTML', 'Embed']

function normalizeQuestionMedia(media) {
  return normalizeArray(media).map((item, index) => ({
    id: item.id || createMaterialBlockId(`question-media-${index + 1}`),
    type: item.type || 'Embed',
    title: item.title || item.name || item.type || 'Media soal',
    url: item.url || item.dataUrl || '',
    dataUrl: item.dataUrl || '',
    name: item.name || '',
    size: item.size || 0,
    mime: item.mime || '',
  })).filter((item) => item.url || item.dataUrl)
}

function questionMediaUrl(media) {
  return media?.dataUrl || media?.url || ''
}

function questionMediaMarker(type, title, url) {
  if (!url) return ''
  return `[[MEDIA|${encodeURIComponent(type || 'Embed')}|${encodeURIComponent(title || type || 'Media')}|${encodeURIComponent(url)}]]`
}

function extractQuestionMediaMarkers(lines) {
  const media = []
  const cleanLines = []
  const markerPattern = /\[\[MEDIA\|([^|]+)\|([^|]*)\|([^\]]+)\]\]/g

  lines.forEach((line) => {
    let nextLine = line
    markerPattern.lastIndex = 0
    let match = markerPattern.exec(line)
    while (match) {
      media.push({
        id: createMaterialBlockId('import-media'),
        type: decodeURIComponent(match[1] || 'Embed'),
        title: decodeURIComponent(match[2] || 'Media soal'),
        url: decodeURIComponent(match[3] || ''),
      })
      nextLine = nextLine.replace(match[0], '').trim()
      match = markerPattern.exec(line)
    }
    if (nextLine) cleanLines.push(nextLine)
  })

  return { media, lines: cleanLines }
}

function prettifyQuestionFileName(name = '') {
  return String(name || 'Topik umum')
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function questionTopicFromLine(line) {
  const text = String(line || '').trim()
  const match = text.match(/^(?:bab|topik|materi|chapter)\s*(?:\d+|[ivxlcdm]+)?\s*[:：.\-–]?\s*(.+)$/i)
  if (match?.[1] && match[1].length <= 90) return match[1].trim()
  if (/^(?:bab|topik|materi|chapter)\b/i.test(text) && text.length <= 90) return text
  return ''
}

function isQuestionStartLine(line) {
  const text = String(line || '').trim()
  return /^(\d{1,3}|soal\s*\d{1,3}|question\s*\d{1,3})[\).:\-–\s]/i.test(text)
}

function cleanQuestionStart(line) {
  return String(line || '')
    .replace(/^(?:soal|question)?\s*\d{1,3}[\).:\-–\s]+/i, '')
    .trim()
}

function normalizeImportedText(text) {
  return String(text || '')
    .replace(/\r/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function decodePdfLiteralString(value) {
  return String(value || '')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, ' ')
    .replace(/\\([()\\])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function decodePdfHexString(value) {
  const hex = String(value || '').replace(/\s+/g, '')
  if (!hex || hex.length % 2 !== 0) return ''
  const bytes = []
  for (let index = 0; index < hex.length; index += 2) {
    const byte = Number.parseInt(hex.slice(index, index + 2), 16)
    if (Number.isFinite(byte)) bytes.push(byte)
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    let text = ''
    for (let index = 2; index < bytes.length; index += 2) {
      text += String.fromCharCode((bytes[index] << 8) + (bytes[index + 1] || 0))
    }
    return text.trim()
  }
  return bytes.map((byte) => String.fromCharCode(byte)).join('').replace(/\s+/g, ' ').trim()
}

function extractPdfTextFromBuffer(buffer) {
  const decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('latin1') : null
  const raw = decoder ? decoder.decode(buffer) : ''
  const pieces = []

  raw.replace(/\((?:\\.|[^\\)]){2,}\)\s*Tj/g, (match) => {
    pieces.push(decodePdfLiteralString(match.replace(/\)\s*Tj$/, '').slice(1)))
    return match
  })
  raw.replace(/<([0-9a-fA-F\s]{6,})>\s*Tj/g, (match, hex) => {
    const decoded = decodePdfHexString(hex)
    if (decoded) pieces.push(decoded)
    return match
  })
  raw.replace(/\[((?:\s*(?:\((?:\\.|[^\\)])*\)|<[0-9a-fA-F\s]+>|\-?\d+\.?\d*)\s*)+)\]\s*TJ/g, (match, body) => {
    const line = []
    body.replace(/\((?:\\.|[^\\)])*\)|<[0-9a-fA-F\s]+>/g, (token) => {
      if (token.startsWith('(')) line.push(decodePdfLiteralString(token.slice(1, -1)))
      if (token.startsWith('<')) line.push(decodePdfHexString(token.slice(1, -1)))
      return token
    })
    const text = line.join(' ').replace(/\s+/g, ' ').trim()
    if (text) pieces.push(text)
    return match
  })

  return pieces
    .filter((piece) => /[A-Za-z0-9À-ž]/.test(piece) && !/^https?:\/\//i.test(piece))
    .join('\n')
}

function fileToText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function getZipString(bytes, offset, length) {
  return Array.from(bytes.slice(offset, offset + length)).map((byte) => String.fromCharCode(byte)).join('')
}

async function inflateZipEntry(bytes, method, mime = 'application/octet-stream') {
  if (method === 0) return bytes
  if (method !== 8 || typeof DecompressionStream === 'undefined') {
    throw new Error('Browser belum bisa membaca kompresi DOCX ini.')
  }
  const stream = new Blob([bytes], { type: mime }).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function unzipDocxEntries(buffer) {
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)
  let eocdOffset = -1
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 66000); offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      eocdOffset = offset
      break
    }
  }
  if (eocdOffset < 0) throw new Error('Struktur DOCX tidak terbaca.')

  const totalEntries = view.getUint16(eocdOffset + 10, true)
  let centralOffset = view.getUint32(eocdOffset + 16, true)
  const entries = {}

  for (let index = 0; index < totalEntries; index += 1) {
    if (view.getUint32(centralOffset, true) !== 0x02014b50) break
    const method = view.getUint16(centralOffset + 10, true)
    const compressedSize = view.getUint32(centralOffset + 20, true)
    const fileNameLength = view.getUint16(centralOffset + 28, true)
    const extraLength = view.getUint16(centralOffset + 30, true)
    const commentLength = view.getUint16(centralOffset + 32, true)
    const localOffset = view.getUint32(centralOffset + 42, true)
    const name = getZipString(bytes, centralOffset + 46, fileNameLength)
    const localNameLength = view.getUint16(localOffset + 26, true)
    const localExtraLength = view.getUint16(localOffset + 28, true)
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength
    const compressed = bytes.slice(dataOffset, dataOffset + compressedSize)
    entries[name] = await inflateZipEntry(compressed, method)
    centralOffset += 46 + fileNameLength + extraLength + commentLength
  }

  return entries
}

function decodeUtf8(bytes) {
  return new TextDecoder('utf-8').decode(bytes)
}

function getXmlElementsByLocalName(node, localName) {
  return Array.from(node.getElementsByTagName('*')).filter((element) => element.localName === localName)
}

async function extractDocxTextAndMedia(file) {
  const entries = await unzipDocxEntries(await fileToArrayBuffer(file))
  const documentXml = entries['word/document.xml']
  if (!documentXml) throw new Error('DOCX tidak memiliki word/document.xml.')

  const relsXml = entries['word/_rels/document.xml.rels']
  const rels = {}
  if (relsXml) {
    const relDoc = new DOMParser().parseFromString(decodeUtf8(relsXml), 'application/xml')
    getXmlElementsByLocalName(relDoc, 'Relationship').forEach((element) => {
      rels[element.getAttribute('Id')] = element.getAttribute('Target')
    })
  }

  const xmlDoc = new DOMParser().parseFromString(decodeUtf8(documentXml), 'application/xml')
  const lines = []
  const paragraphs = getXmlElementsByLocalName(xmlDoc, 'p')

  for (const paragraph of paragraphs) {
    const text = getXmlElementsByLocalName(paragraph, 't').map((element) => element.textContent || '').join('').trim()
    const paragraphLines = []
    if (text) paragraphLines.push(text)

    const blips = getXmlElementsByLocalName(paragraph, 'blip')
    for (const blip of blips) {
      const relationshipId = blip.getAttribute('r:embed') || blip.getAttribute('embed')
      const target = rels[relationshipId]
      if (!target) continue
      const entryName = target.startsWith('media/') ? `word/${target}` : `word/${target.replace(/^\.\.\//, '')}`
      const mediaBytes = entries[entryName]
      if (!mediaBytes) continue
      const fileName = target.split('/').pop() || 'gambar-soal'
      const type = inferMediaTypeFromFile({ name: fileName, type: '' })
      const mime = type === 'Gambar' ? `image/${(fileName.split('.').pop() || 'png').replace('jpg', 'jpeg')}` : 'application/octet-stream'
      const dataUrl = await blobToDataUrl(new Blob([mediaBytes], { type: mime }))
      paragraphLines.push(questionMediaMarker(type, fileName, dataUrl))
    }

    if (paragraphLines.length) lines.push(paragraphLines.join('\n'))
  }

  return lines.join('\n')
}

function extractHtmlTextAndMedia(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('script, style, noscript').forEach((element) => element.remove())
  doc.querySelectorAll('img, audio, video, iframe, embed, object').forEach((element, index) => {
    const tag = element.tagName.toLowerCase()
    const src = element.getAttribute('src') || element.getAttribute('data') || element.querySelector('source')?.getAttribute('src') || ''
    const type = tag === 'img' ? 'Gambar' : tag === 'audio' ? 'Audio' : tag === 'video' ? 'Video' : 'Embed'
    const title = element.getAttribute('alt') || element.getAttribute('title') || `${type} ${index + 1}`
    element.replaceWith(doc.createTextNode(`\n${questionMediaMarker(type, title, src)}\n`))
  })
  return doc.body?.innerText || ''
}

async function readQuestionImportFile(file) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (['html', 'htm'].includes(extension)) return extractHtmlTextAndMedia(await fileToText(file))
  if (extension === 'docx') return extractDocxTextAndMedia(file)
  if (extension === 'pdf') return extractPdfTextFromBuffer(await fileToArrayBuffer(file))
  return fileToText(file)
}

function parseImportedQuestionBlock(lines, context) {
  const { media, lines: cleanLines } = extractQuestionMediaMarkers(lines)
  const options = []
  let answerToken = ''
  let explanation = ''
  const questionLines = []

  cleanLines.forEach((line) => {
    const answerMatch = line.match(/^(?:kunci|jawaban|answer|ans)\s*[:：]\s*(.+)$/i)
    if (answerMatch) {
      answerToken = answerMatch[1].trim()
      return
    }

    const explanationMatch = line.match(/^(?:pembahasan|alasan|explanation)\s*[:：]\s*(.+)$/i)
    if (explanationMatch) {
      explanation = explanationMatch[1].trim()
      return
    }

    const optionMatch = line.match(/^([A-E])[\).]\s+(.+)$/i)
    if (optionMatch) {
      options.push({ key: optionMatch[1].toUpperCase(), text: optionMatch[2].trim() })
      return
    }

    questionLines.push(questionLines.length === 0 ? cleanQuestionStart(line) : line)
  })

  const questionText = questionLines.join('\n').trim()
  if (!questionText && media.length === 0) return null

  const optionTexts = options.map((option) => option.text)
  const keyAnswer = options.find((option) => option.key === answerToken.toUpperCase())
  const trueFalseAnswer = /^(benar|salah|true|false)$/i.test(answerToken) ? answerToken : ''
  const type = optionTexts.length >= 2 ? 'Pilihan ganda' : trueFalseAnswer ? 'Benar/salah' : 'Essay'

  return {
    id: createMaterialBlockId('import-question'),
    questionText: questionText || 'Soal berbasis media. Periksa kembali sebelum dipakai.',
    options: type === 'Pilihan ganda' ? optionLetters.map((_, index) => optionTexts[index] || '') : type === 'Benar/salah' ? ['Benar', 'Salah'] : [],
    correctAnswer: keyAnswer?.text || answerToken || '',
    explanation,
    subject: context.subject,
    className: context.className,
    topic: context.topic,
    difficulty: 'Sedang',
    type,
    media,
    needsReview: !answerToken,
    importMeta: {
      fileName: context.fileName,
      importedAt: new Date().toISOString(),
    },
  }
}

function parseQuestionsFromImportedText(text, context) {
  const defaultTopic = context.topic || prettifyQuestionFileName(context.fileName)
  let currentTopic = defaultTopic
  const lines = normalizeImportedText(text)
  const blocks = []
  let currentBlock = []

  lines.forEach((line) => {
    const nextTopic = questionTopicFromLine(line)
    if (nextTopic && !isQuestionStartLine(line)) {
      currentTopic = nextTopic
      return
    }

    if (isQuestionStartLine(line) && currentBlock.length) {
      blocks.push({ topic: currentTopic, lines: currentBlock })
      currentBlock = []
    }
    currentBlock.push(line)
  })

  if (currentBlock.length) blocks.push({ topic: currentTopic, lines: currentBlock })

  const parsed = blocks
    .map((block) => parseImportedQuestionBlock(block.lines, { ...context, topic: block.topic || defaultTopic }))
    .filter(Boolean)

  if (parsed.length) return parsed

  const fallback = parseImportedQuestionBlock(lines, { ...context, topic: defaultTopic })
  return fallback ? [fallback] : []
}

function groupQuestionsByTopic(rows) {
  const map = new Map()
  rows.forEach((row) => {
    const topic = String(row.topic || 'Topik umum').trim() || 'Topik umum'
    if (!map.has(topic)) map.set(topic, [])
    map.get(topic).push(row)
  })
  return Array.from(map.entries()).map(([topic, items]) => ({ topic, items }))
}

function BankSoal({ user, notify, appContext }) {
  const allSubjectOptions = useMemo(() => getGradeSubjectOptions(), [])
  const teacherSubjectOptions = useMemo(() => getTeacherSubjectOptions(user, allSubjectOptions), [allSubjectOptions, user?.subject])
  const hasTeacherSubject = getTeacherSubjectNames(user).length > 0
  const teacherSubject = hasTeacherSubject ? teacherSubjectOptions[0] : ''
  const teacherSubjectLabel = hasTeacherSubject ? teacherSubjectOptions.join(', ') : 'semua mapel'
  const pageTitle = hasTeacherSubject ? `Bank soal ${teacherSubjectLabel}` : 'Bank soal'
  const assessmentScope = teacherSubjectLabel
  const [rows, setRows] = useState([])
  const [lookups, setLookups] = useState({ subjects: [], classes: [] })
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [importing, setImporting] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const localMode = !appContext?.accessToken || !isUuid(user?.id)
  const sourceLabel = localMode ? 'Preview lokal' : 'Supabase'
  const scopedRows = filterRowsByTeacherSubjects(rows, user, teacherSubjectOptions)
  const multipleChoiceCount = scopedRows.filter((item) => item.type === 'Pilihan ganda').length
  const essayCount = scopedRows.filter((item) => ['Essay', 'Isian'].includes(item.type)).length
  const mediaQuestionCount = scopedRows.filter((item) => normalizeQuestionMedia(item.media).length > 0).length
  const topicGroups = groupQuestionsByTopic(scopedRows)

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
        media: normalizeQuestionMedia(question.media),
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

  async function handleImportQuestions(importedQuestions) {
    const normalizedQuestions = importedQuestions.map((question, index) => ({
      ...question,
      id: question.id || `local-question-import-${Date.now()}-${index + 1}`,
      subject: question.subject || teacherSubject || 'Mapel belum dipilih',
      className: question.className || 'Semua kelas',
      media: normalizeQuestionMedia(question.media),
      source: localMode ? 'local' : 'supabase',
    }))

    if (!normalizedQuestions.length) {
      notify('Belum ada soal yang bisa diimpor dari file.')
      return
    }

    if (!appContext?.accessToken || !isUuid(user?.id)) {
      setRows((current) => {
        const nextRows = [...normalizedQuestions, ...current]
        setLocalTeacherQuestions(user, teacherSubject, nextRows)
        return nextRows
      })
      setImporting(false)
      notify(`${normalizedQuestions.length} soal berhasil diimpor ke Bank Soal lokal.`)
      return
    }

    try {
      const savedRows = []
      for (const question of normalizedQuestions) {
        const saved = await saveQuestion({ accessToken: appContext.accessToken, teacherId: user.id, question })
        savedRows.push({ ...saved, media: question.media, importMeta: question.importMeta, needsReview: question.needsReview })
      }
      setRows((current) => [...savedRows, ...current])
      setImporting(false)
      notify(`${savedRows.length} soal berhasil diimpor ke Supabase.`)
    } catch (saveError) {
      notify(`Gagal mengimpor soal: ${saveError.message}`)
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
        action={(
          <div className="flex flex-wrap gap-2">
            <QuickActionButton icon={Download} label={importing ? 'Import terbuka' : 'Impor soal'} disabled={Boolean(importing)} onClick={() => {
              setEditing(null)
              setImporting(true)
            }} />
            <QuickActionButton icon={Plus} label={editing ? 'Editor terbuka' : 'Tulis soal'} disabled={Boolean(editing)} onClick={() => {
              setImporting(false)
              setEditing(emptyQuestion(lookups, teacherSubject))
            }} />
          </div>
        )}
      />

      <section className="mb-4 flex flex-col gap-3 rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/80 px-4 py-3 shadow-[0_12px_36px_rgba(15,31,42,0.055)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs font-black text-[#13232d]">
          <span className="inline-flex items-center gap-1.5 rounded-[0.75rem] bg-[#E0F2FE] px-3 py-1.5 text-[#0284c7] ring-1 ring-[#0284c7]/10">
            <FileQuestion size={14} /> {scopedRows.length} soal
          </span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{multipleChoiceCount} pilihan ganda</span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{essayCount} uraian/isian</span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{topicGroups.length} folder topik</span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{mediaQuestionCount} soal bermedia</span>
        </div>
        <p className="text-xs font-bold text-slate-500">
          Sumber data: <span className="text-[#0284c7]">{sourceLabel}</span>
        </p>
      </section>

      {error && <div className="mb-4 rounded-[1rem] bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data soal: {error}. Data lokal mapel guru ditampilkan.</div>}
      {importing && (
        <QuestionImportPanel
          lookups={lookups}
          teacherSubject={teacherSubject}
          subjectOptions={hasTeacherSubject ? teacherSubjectOptions : []}
          onCancel={() => setImporting(false)}
          onImport={handleImportQuestions}
        />
      )}
      {editing && <QuestionForm question={editing} lookups={lookups} subjectOptions={hasTeacherSubject ? teacherSubjectOptions : []} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label="Memuat bank soal dari Supabase..." /> : scopedRows.length > 0 ? (
        <div className="space-y-4">
          {topicGroups.map((group) => (
            <section key={group.topic} className="overflow-hidden rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/86 shadow-[0_14px_44px_rgba(15,31,42,0.06)]">
              <header className="flex flex-col gap-2 border-b border-[#0B3A5B]/8 bg-[#F8FBFF] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#0284c7]">Folder topik</p>
                  <h2 className="text-lg font-black text-[#13232d]">{group.topic}</h2>
                </div>
                <StatusBadge tone="cyan">{group.items.length} soal</StatusBadge>
              </header>
              {group.items.map((row) => (
                <QuestionRowCard key={row.id} row={row} onEdit={() => setEditing(row)} onDelete={() => setDeleting(row)} />
              ))}
            </section>
          ))}
        </div>
      ) : (
        !editing && (
          <EmptyState
            title={hasTeacherSubject ? `Belum ada soal ${teacherSubject}.` : 'Belum ada soal.'}
            description="Tulis soal pertama atau impor dari PDF, DOCX, HTML, dan TXT."
            action={(
              <div className="flex flex-wrap justify-center gap-2">
                <QuickActionButton icon={Download} label="Impor soal" onClick={() => setImporting(true)} />
                <QuickActionButton icon={Plus} label="Tulis soal pertama" onClick={() => setEditing(emptyQuestion(lookups, teacherSubject))} />
              </div>
            )}
          />
        )
      )}
      <ConfirmDialog open={Boolean(deleting)} title="Hapus soal?" description="Soal akan dihapus dari bank soal setelah konfirmasi." onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  )
}

function QuestionImportPanel({ lookups, teacherSubject, subjectOptions = [], onCancel, onImport }) {
  const scopedSubjects = getScopedSubjectLookupRows(lookups.subjects, subjectOptions)
  const subjectsList = getMaterialSubjectOptions(scopedSubjects, [], subjectOptions.length ? subjectOptions : highSchoolSubjectFolders)
  const classesList = getMaterialClassOptions(lookups.classes, highSchoolGradeFolders[0].name)
  const [subject, setSubject] = useState(subjectsList[0]?.name || teacherSubject || highSchoolSubjectFolders[0])
  const [subjectId, setSubjectId] = useState(subjectsList[0]?.synthetic ? '' : subjectsList[0]?.id || '')
  const [className, setClassName] = useState(classesList[0]?.name || highSchoolGradeFolders[0].name)
  const [classId, setClassId] = useState(classesList[0]?.synthetic ? '' : classesList[0]?.id || '')
  const [topicOverride, setTopicOverride] = useState('')
  const [previewRows, setPreviewRows] = useState([])
  const [errors, setErrors] = useState([])
  const [parsing, setParsing] = useState(false)

  function updateSubject(value) {
    const selected = subjectsList.find((item) => subjectOptionValue(item) === value)
    setSubject(selected?.name || subject)
    setSubjectId(selected?.synthetic ? '' : selected?.id || '')
  }

  function updateClass(value) {
    const selected = classesList.find((item) => classOptionValue(item) === value)
    setClassName(selected?.name || className)
    setClassId(selected?.synthetic ? '' : selected?.id || '')
  }

  async function parseFiles(files) {
    if (!files.length) return
    setParsing(true)
    const nextRows = []
    const nextErrors = []

    for (const file of files) {
      try {
        const text = await readQuestionImportFile(file)
        const rows = parseQuestionsFromImportedText(text, {
          fileName: file.name,
          subject,
          subjectId,
          className,
          classId,
          topic: topicOverride.trim(),
        }).map((row) => ({
          ...row,
          subjectId,
          classId,
          subject,
          className,
          importMeta: { ...(row.importMeta || {}), fileName: file.name, fileSize: file.size },
        }))
        if (rows.length) nextRows.push(...rows)
        if (!rows.length) nextErrors.push(`${file.name}: belum ditemukan pola soal yang bisa dibaca.`)
      } catch (error) {
        nextErrors.push(`${file.name}: ${error.message || 'gagal dibaca'}`)
      }
    }

    setPreviewRows((current) => [...nextRows, ...current])
    setErrors((current) => [...nextErrors, ...current])
    setParsing(false)
  }

  function handleFileInput(event) {
    parseFiles(Array.from(event.target.files || []))
    event.target.value = ''
  }

  function handleDrop(event) {
    event.preventDefault()
    parseFiles(Array.from(event.dataTransfer?.files || []))
  }

  const groups = groupQuestionsByTopic(previewRows)
  const readyCount = previewRows.filter((row) => !row.needsReview).length
  const mediaCount = previewRows.filter((row) => normalizeQuestionMedia(row.media).length > 0).length

  return (
    <section className="mb-5 overflow-hidden rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/90 shadow-[0_16px_48px_rgba(15,31,42,0.07)]">
      <header className="flex flex-col gap-3 border-b border-[#0B3A5B]/8 bg-[#F8FBFF] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-[0.9rem] bg-[#E0F2FE] text-[#0284c7] ring-1 ring-[#0284c7]/10">
            <Download size={20} />
          </span>
          <div>
            <h2 className="text-xl font-black leading-tight text-[#13232d]">Impor soal dari file</h2>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              Terima PDF, DOCX, HTML, dan TXT. Soal akan dipetakan ke folder topik, pilihan jawaban, kunci, pembahasan, dan media jika terbaca.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="cyan">{previewRows.length} terbaca</StatusBadge>
          <StatusBadge tone="green">{readyCount} siap</StatusBadge>
          <StatusBadge tone="amber">{mediaCount} bermedia</StatusBadge>
        </div>
      </header>

      <div className="grid gap-4 p-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="space-y-3">
          {subjectOptions.length === 1 ? (
            <div className={materialLabelClass}>Mata pelajaran
              <div className={`${materialInputClass} flex min-h-[2.75rem] items-center bg-[#EEF7FF] text-[#17446E]`}>
                {subject}
              </div>
            </div>
          ) : (
            <label className={materialLabelClass}>Mata pelajaran
              <select value={subjectId || `subject:${subject || subjectsList[0]?.name || ''}`} onChange={(event) => updateSubject(event.target.value)} className={materialInputClass}>
                {subjectsList.map((item) => <option key={subjectOptionValue(item)} value={subjectOptionValue(item)}>{item.name}</option>)}
              </select>
            </label>
          )}

          <label className={materialLabelClass}>Kelas
            <select value={classId || `class:${className || classesList[0]?.name || ''}`} onChange={(event) => updateClass(event.target.value)} className={materialInputClass}>
              {classesList.map((item) => <option key={classOptionValue(item)} value={classOptionValue(item)}>{item.name}</option>)}
            </select>
          </label>

          <label className={materialLabelClass}>Topik default
            <input value={topicOverride} onChange={(event) => setTopicOverride(event.target.value)} placeholder="Kosongkan jika topik dibaca dari file" className={materialInputClass} />
          </label>

          <label
            className="grid min-h-[10rem] cursor-pointer place-items-center rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-4 text-center transition hover:bg-sky-50"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <input type="file" multiple accept={questionImportFileTypes} className="sr-only" onChange={handleFileInput} />
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-sky-700 ring-1 ring-sky-100"><Download size={18} /></span>
            <span className="mt-2 text-sm font-black text-slate-950">{parsing ? 'Membaca file...' : 'Klik atau drop file soal'}</span>
            <span className="mt-1 text-xs font-semibold leading-5 text-slate-500">PDF teks, DOCX, HTML, atau TXT. PDF hasil scan perlu OCR terlebih dahulu.</span>
          </label>

          {errors.length > 0 && (
            <div className="rounded-2xl bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-800 ring-1 ring-amber-100">
              {errors.slice(0, 4).map((error) => <p key={error}>{error}</p>)}
            </div>
          )}
        </aside>

        <div className="min-w-0 rounded-[1rem] bg-[#F8FBFF] p-3 ring-1 ring-[#D9E6F5]">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#0284c7]">Preview hasil impor</p>
              <h3 className="text-lg font-black text-[#13232d]">Folder topik dari file</h3>
            </div>
            <button
              type="button"
              disabled={!previewRows.length || parsing}
              onClick={() => onImport(previewRows)}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#0B3A5B] px-4 text-sm font-black text-white transition hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Save size={16} /> Masukkan ke Bank Soal
            </button>
          </div>

          {previewRows.length > 0 ? (
            <div className="space-y-3">
              {groups.map((group) => (
                <section key={group.topic} className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#D9E6F5]">
                  <header className="flex items-center justify-between gap-3 border-b border-[#D9E6F5] px-3 py-2">
                    <h4 className="text-sm font-black text-[#13232d]">{group.topic}</h4>
                    <StatusBadge tone="cyan">{group.items.length} soal</StatusBadge>
                  </header>
                  <div className="divide-y divide-[#EEF4FB]">
                    {group.items.slice(0, 5).map((row) => (
                      <QuestionPreviewLine key={row.id} row={row} />
                    ))}
                    {group.items.length > 5 && <p className="px-3 py-2 text-xs font-bold text-slate-500">+{group.items.length - 5} soal lain di folder ini.</p>}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="grid min-h-[16rem] place-items-center rounded-2xl bg-white text-center ring-1 ring-[#D9E6F5]">
              <div className="max-w-sm p-5">
                <FileQuestion className="mx-auto text-[#2F80D8]" size={32} />
                <h4 className="mt-3 text-lg font-black text-[#13232d]">Belum ada file dibaca</h4>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                  Gunakan format nomor soal dan opsi A-E agar hasil impor langsung rapi.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="flex justify-end border-t border-[#0B3A5B]/8 bg-white/72 px-4 py-3">
        <button onClick={onCancel} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-100">
          <X size={16} /> Tutup import
        </button>
      </footer>
    </section>
  )
}

function QuestionPreviewLine({ row }) {
  const media = normalizeQuestionMedia(row.media)
  return (
    <article className="px-3 py-3">
      <div className="mb-2 flex flex-wrap gap-2">
        <StatusBadge tone={row.needsReview ? 'amber' : 'green'}>{row.needsReview ? 'Perlu review' : 'Siap'}</StatusBadge>
        <StatusBadge tone="teal">{row.type}</StatusBadge>
        {media.length > 0 && <StatusBadge tone="cyan">{media.length} media</StatusBadge>}
      </div>
      <p className="line-clamp-2 text-sm font-black leading-6 text-[#13232d]">{row.questionText}</p>
      {row.options?.length > 0 && (
        <p className="mt-1 text-xs font-semibold text-slate-500">{row.options.filter(Boolean).length} opsi · Kunci: {row.correctAnswer || 'belum terbaca'}</p>
      )}
    </article>
  )
}

function QuestionRowCard({ row, onEdit, onDelete }) {
  const media = normalizeQuestionMedia(row.media)
  return (
    <article className="grid gap-3 border-b border-[#0B3A5B]/8 p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <StatusBadge tone={row.difficulty === 'Sulit' ? 'red' : row.difficulty === 'Sedang' ? 'amber' : 'green'}>{row.difficulty || 'Level belum diisi'}</StatusBadge>
          <StatusBadge tone="teal">{row.type || 'Jenis belum diisi'}</StatusBadge>
          {row.needsReview && <StatusBadge tone="amber">Perlu review</StatusBadge>}
          {media.length > 0 && <StatusBadge tone="cyan">{media.length} media</StatusBadge>}
          <span className="text-xs font-bold text-slate-400">{row.source === 'supabase' ? 'Tersimpan server' : 'Tersimpan perangkat'}</span>
        </div>
        <h2 className="line-clamp-2 text-base font-black leading-6 text-[#13232d]">{row.questionText || 'Pertanyaan belum diisi'}</h2>
        <p className="mt-2 text-xs font-bold text-slate-500">
          {(row.subject || 'Mapel belum dipilih')} · {(row.className || 'Semua kelas')} · {(row.topic || 'Tanpa topik')}
        </p>
        {media.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {media.slice(0, 4).map((item) => (
              <a key={item.id} href={questionMediaUrl(item)} target="_blank" rel="noreferrer" className="rounded-lg bg-[#E0F2FE] px-2 py-1 text-[11px] font-black text-[#0284c7] ring-1 ring-[#0284c7]/10">
                {item.type}: {item.title}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 lg:justify-end">
        <button onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-[#F1F7FF] px-3 py-2 text-xs font-black text-[#0284c7] ring-1 ring-[#0B3A5B]/8 transition hover:bg-[#E0F2FE]">
          <PencilLine size={14} /> Edit
        </button>
        <button onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100">
          <Trash2 size={14} /> Hapus
        </button>
      </div>
    </article>
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
    media: normalizeQuestionMedia(question.media),
  }
}

function getQuestionSubmitOptions(form) {
  const answer = String(form.correctAnswer || '').trim()

  if (form.type === 'Pilihan ganda') {
    return optionLetters.map((_, index) => String(form.options?.[index] || '').trim()).filter(Boolean)
  }

  const options = Array.isArray(form.options) ? form.options.map((item) => String(item || '').trim()).filter(Boolean) : []

  if (form.type === 'Benar/salah') return ['Benar', 'Salah']
  if (form.type === 'Isian') return Array.from(new Set([answer, ...options].filter(Boolean)))
  return []
}

function QuestionForm({ question, lookups, subjectOptions = [], onCancel, onSave }) {
  const [form, setForm] = useState(() => normalizeQuestionForm(question))
  const [mediaDraft, setMediaDraft] = useState({ type: 'Gambar', title: '', url: '' })
  const scopedSubjects = getScopedSubjectLookupRows(lookups.subjects, subjectOptions)
  const subjectsList = getMaterialSubjectOptions(scopedSubjects, [question], subjectOptions.length ? subjectOptions : highSchoolSubjectFolders)
  const classesList = getMaterialClassOptions(lookups.classes, question.className)
  const answer = String(form.correctAnswer || '').trim()
  const isMultipleChoice = form.type === 'Pilihan ganda'
  const isTrueFalse = form.type === 'Benar/salah'
  const isShortAnswer = form.type === 'Isian'
  const isEssay = form.type === 'Essay'
  const multipleChoiceOptions = optionLetters.map((_, index) => String(form.options?.[index] || '').trim())
  const mediaItems = normalizeQuestionMedia(form.media)
  const multipleChoiceReady = multipleChoiceOptions.filter(Boolean).length >= 2 && multipleChoiceOptions.includes(answer)
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

  function addQuestionMedia(item) {
    setForm((current) => ({ ...current, media: [...normalizeQuestionMedia(current.media), item] }))
  }

  function addQuestionMediaUrl() {
    if (!mediaDraft.url.trim()) return
    addQuestionMedia({
      id: createMaterialBlockId('question-media'),
      type: mediaDraft.type,
      title: mediaDraft.title || mediaDraft.type,
      url: mediaDraft.url.trim(),
    })
    setMediaDraft((current) => ({ ...current, title: '', url: '' }))
  }

  async function handleQuestionMediaUpload(event) {
    const files = Array.from(event.target.files || [])
    for (const file of files) {
      const dataUrl = await blobToDataUrl(file)
      addQuestionMedia({
        id: createMaterialBlockId('question-file'),
        type: inferMediaTypeFromFile(file),
        title: file.name,
        name: file.name,
        size: file.size,
        mime: file.type,
        dataUrl,
      })
    }
    event.target.value = ''
  }

  function removeQuestionMedia(id) {
    setForm((current) => ({ ...current, media: normalizeQuestionMedia(current.media).filter((item) => item.id !== id) }))
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
      media: mediaItems,
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
                  <p className="text-xs font-semibold leading-5 text-slate-500">Isi minimal dua opsi, lalu pilih salah satu sebagai kunci. Opsi E boleh dikosongkan jika file hanya A-D.</p>
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

          <section className="rounded-[1rem] bg-[#F8FBFF] p-4 ring-1 ring-[#D9E6F5]">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#0284c7]">Media soal</p>
                <h3 className="text-lg font-black text-[#13232d]">Gambar, audio, video, atau lampiran</h3>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                  Media akan ikut menempel pada soal, baik dari impor maupun input manual.
                </p>
              </div>
              <StatusBadge tone={mediaItems.length ? 'cyan' : 'gray'}>{mediaItems.length} media</StatusBadge>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <label className="grid min-h-[8.5rem] cursor-pointer place-items-center rounded-2xl border border-dashed border-sky-200 bg-sky-50/60 p-4 text-center transition hover:bg-sky-50">
                <input type="file" multiple className="sr-only" onChange={handleQuestionMediaUpload} accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.html,.htm" />
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-sky-700 ring-1 ring-sky-100"><Download size={17} /></span>
                <span className="mt-2 text-sm font-black text-slate-950">Upload media soal</span>
                <span className="mt-1 text-xs font-semibold leading-5 text-slate-500">Gambar, audio, video, PDF, DOCX, atau HTML.</span>
              </label>

              <div className="rounded-2xl bg-white p-3 ring-1 ring-[#D9E6F5]">
                <div className="grid gap-2">
                  <select value={mediaDraft.type} onChange={(event) => setMediaDraft((current) => ({ ...current, type: event.target.value }))} className={materialInputClass}>
                    {questionMediaTypeOptions.map((type) => <option key={type}>{type}</option>)}
                  </select>
                  <input value={mediaDraft.title} onChange={(event) => setMediaDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Judul media" className={materialInputClass} />
                  <input value={mediaDraft.url} onChange={(event) => setMediaDraft((current) => ({ ...current, url: event.target.value }))} placeholder="URL YouTube/audio/gambar/embed" className={materialInputClass} />
                  <button type="button" onClick={addQuestionMediaUrl} className="rounded-xl bg-[#0B3A5B] px-3 py-2.5 text-sm font-black text-white">Tambahkan media</button>
                </div>
              </div>
            </div>

            {mediaItems.length > 0 && (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {mediaItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2 ring-1 ring-[#D9E6F5]">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[#13232d]">{item.title}</p>
                      <p className="text-xs font-semibold text-slate-500">{item.type}{item.size ? ` · ${formatFileSize(item.size)}` : ''}</p>
                    </div>
                    <button type="button" onClick={() => removeQuestionMedia(item.id)} className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {!validQuestion && (
            <div className="rounded-[0.9rem] bg-amber-50 px-3 py-2.5 text-sm font-bold leading-6 text-amber-800 ring-1 ring-amber-100">
              Lengkapi pertanyaan dan kunci. Untuk pilihan ganda, minimal dua opsi harus terisi dan satu opsi harus dipilih sebagai kunci.
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

          {subjectOptions.length === 1 ? (
            <div className={materialLabelClass}>Mata pelajaran
              <div className={`${materialInputClass} flex min-h-[2.75rem] items-center bg-[#EEF7FF] text-[#17446E]`}>
                {form.subject || subjectsList[0]?.name || subjectOptions[0]}
              </div>
            </div>
          ) : (
            <label className={materialLabelClass}>Mata pelajaran
              <select value={form.subjectId || `subject:${form.subject || subjectsList[0]?.name || ''}`} onChange={(event) => updateSubject(event.target.value)} className={materialInputClass}>
                {subjectsList.map((subject) => <option key={subjectOptionValue(subject)} value={subjectOptionValue(subject)}>{subject.name}</option>)}
              </select>
            </label>
          )}

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
    media: [],
  }
}

function GuruTugas({ user, notify, appContext }) {
  const allSubjectOptions = useMemo(() => getGradeSubjectOptions(), [])
  const teacherSubjectOptions = useMemo(() => getTeacherSubjectOptions(user, allSubjectOptions), [allSubjectOptions, user?.subject])
  const hasTeacherSubject = getTeacherSubjectNames(user).length > 0
  const teacherSubject = hasTeacherSubject ? teacherSubjectOptions[0] : ''
  const [rows, setRows] = useState([])
  const [lookups, setLookups] = useState({ subjects: [], classes: [] })
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [viewingSubmissions, setViewingSubmissions] = useState(null)
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')
  const normalizedRows = useMemo(() => rows.map((item) => normalizeAssignmentForEdit(item, lookups, teacherSubject)), [lookups, rows, teacherSubject])
  const scopedRows = filterRowsByTeacherSubjects(normalizedRows, user, teacherSubjectOptions)
  const activeCount = scopedRows.filter((item) => item.status === 'Aktif').length
  const draftCount = scopedRows.filter((item) => item.status !== 'Aktif').length
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
    const preparedAssignment = prepareAssignmentForSave({
      ...assignment,
      subject: assignment.subject || teacherSubject || 'Mapel belum dipilih',
    })
    const validation = getAssignmentValidation(preparedAssignment)
    if (!validation.valid) {
      notify(`Lengkapi tugas sebelum disimpan: ${validation.missing.join(', ')}.`)
      return
    }
    if (!appContext?.accessToken || !isUuid(user?.id)) {
      const localAssignment = {
        ...preparedAssignment,
        id: preparedAssignment.id || `local-assignment-${Date.now()}`,
        source: 'local',
      }

      setRows((current) => {
        const nextRows = preparedAssignment.id
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
      const assignmentPayload = { ...preparedAssignment, description: buildAssignmentStoredDescription(preparedAssignment) }
      const saved = await saveAssignment({ accessToken: appContext.accessToken, teacherId: user.id, assignment: assignmentPayload })
      const mergedSaved = { ...preparedAssignment, ...saved, description: preparedAssignment.description }
      setRows((current) => preparedAssignment.id ? current.map((item) => item.id === preparedAssignment.id ? mergedSaved : item) : [mergedSaved, ...current])
      setEditing(null)
      notify(preparedAssignment.id ? 'Tugas berhasil diperbarui di Supabase.' : 'Tugas berhasil dibuat di Supabase.')
    } catch (saveError) {
      notify(`Gagal menyimpan tugas: ${saveError.message}`)
    }
  }

  async function handleClone(row) {
    const cloned = prepareAssignmentForSave({
      ...row,
      id: '',
      title: `${row.title || 'Tugas'} (Salinan)`,
      status: 'Draft',
      releaseAt: '',
      deadline: '',
    })
    await handleSave(cloned)
    notify('Salinan tugas dibuat sebagai Draft.')
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
                {submission.link && (
                  <a href={submission.link} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-[0.8rem] bg-[#E0F2FE] px-3 py-2 text-xs font-black text-[#0284c7]">
                    Buka tautan siswa
                  </a>
                )}
                {normalizeAssignmentAttachments(submission.files).length > 0 && (
                  <div className="mt-3 space-y-2">
                    {normalizeAssignmentAttachments(submission.files).map((file) => <AssignmentAttachmentPreview key={file.id} attachment={file} />)}
                  </div>
                )}
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
            <ClipboardList size={14} /> {scopedRows.length} tugas
          </span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{activeCount} aktif</span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{draftCount} draft/selesai</span>
        </div>
        <p className="text-xs font-bold text-slate-500">
          Sumber data: <span className="text-[#0284c7]">{sourceLabel}</span>
        </p>
      </section>

      {error && <div className="mb-4 rounded-[1rem] bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data tugas: {error}. Data lokal ditampilkan.</div>}
      
      {editing && <AssignmentForm assignment={editing} lookups={lookups} subjectOptions={hasTeacherSubject ? teacherSubjectOptions : []} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label="Memuat tugas dari Supabase..." /> : scopedRows.length > 0 ? (
        <section className="overflow-hidden rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/86 shadow-[0_14px_44px_rgba(15,31,42,0.06)]">
          {scopedRows.map((row) => (
            <article key={row.id} className="grid gap-3 border-b border-[#0B3A5B]/8 p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge tone={statusTone(row.status)}>{row.status}</StatusBadge>
                  <StatusBadge tone="teal">{normalizeAssignmentClassNames(row).join(', ') || 'Semua kelas'}</StatusBadge>
                  <StatusBadge tone="cyan">{row.workMode || 'Individu'}</StatusBadge>
                  <span className="text-xs font-bold text-slate-400">Deadline {formatAssignmentDateTime(row.deadline)}</span>
                </div>
                <h2 className="truncate text-lg font-black text-[#13232d]">{row.title || 'Tanpa judul'}</h2>
                <p className="mt-1 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">{row.description || 'Belum ada deskripsi.'}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                  <span>{row.subject || 'Mapel belum dipilih'}</span>
                  <span>·</span>
                  <span>{normalizeAssignmentSubmissionTypes(row.submissionTypes).map((type) => assignmentSubmissionTypeOptions.find((item) => item.value === type)?.label || type).join(', ')}</span>
                  {normalizeAssignmentAttachments(row.attachments).length > 0 && (
                    <>
                      <span>·</span>
                      <span>{normalizeAssignmentAttachments(row.attachments).length} lampiran</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button onClick={() => setEditing(row)} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-[#F1F7FF] px-3 py-2 text-xs font-black text-[#0284c7] ring-1 ring-[#0B3A5B]/8 transition hover:bg-[#E0F2FE]">
                  <PencilLine size={14} /> Edit
                </button>
                <button onClick={() => handleSave({ ...row, status: row.status === 'Aktif' ? 'Draft' : 'Aktif' })} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-800 ring-1 ring-cyan-100 transition hover:bg-cyan-100">
                  <Send size={14} /> {row.status === 'Aktif' ? 'Jadikan draft' : 'Aktifkan'}
                </button>
                <button onClick={() => handleClone(row)} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 ring-1 ring-violet-100 transition hover:bg-violet-100">
                  <Layers3 size={14} /> Duplikasi
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

const assignmentStatusOptions = ['Draft', 'Aktif', 'Selesai']
const assignmentWorkModeOptions = [
  { value: 'Individu', label: 'Individu', helper: 'Setiap siswa mengumpulkan jawaban sendiri.' },
  { value: 'Kelompok', label: 'Kelompok', helper: 'Siswa dapat mengerjakan sebagai kelompok.' },
]
const assignmentLatePolicyOptions = [
  { value: 'allow-late', label: 'Boleh terlambat', helper: 'Submission tetap diterima dengan tanda Terlambat.' },
  { value: 'hard-lock', label: 'Kunci otomatis', helper: 'Siswa tidak bisa submit setelah tenggat.' },
]
const assignmentSubmissionTypeOptions = [
  { value: 'text', label: 'Teks langsung', helper: 'Siswa mengetik jawaban di aplikasi.' },
  { value: 'file', label: 'Unggah berkas', helper: 'PDF, Word, Excel, gambar, audio, atau video.' },
  { value: 'link', label: 'Tautan luar', helper: 'Google Drive, Canva, YouTube, atau URL lain.' },
]
const defaultAssignmentRubricRows = [
  { id: 'rubric-accuracy', component: 'Ketepatan jawaban', weight: 60, description: 'Isi jawaban sesuai konsep dan instruksi.' },
  { id: 'rubric-process', component: 'Proses pengerjaan', weight: 20, description: 'Langkah kerja, alasan, atau bukti pendukung terlihat jelas.' },
  { id: 'rubric-presentation', component: 'Kerapian', weight: 20, description: 'Format rapi, mudah dibaca, dan dikumpulkan sesuai ketentuan.' },
]

function getAssignmentValidation(assignment = {}) {
  const missing = []
  const targetClasses = normalizeAssignmentClassNames(assignment)
  if (!String(assignment.title || '').trim()) missing.push('judul tugas')
  if (!String(assignment.subject || '').trim() || normalizeLookupText(assignment.subject) === normalizeLookupText('Mapel belum dipilih')) missing.push('mata pelajaran')
  if (!targetClasses.length) missing.push('target kelas')

  if (assignment.status === 'Aktif') {
    if (!String(assignment.description || '').trim()) missing.push('instruksi tugas')
    if (!String(assignment.deadline || '').trim()) missing.push('tanggal dan jam tenggat')
  }

  return {
    missing,
    valid: missing.length === 0,
  }
}

function normalizeAssignmentSubmissionTypes(value) {
  const aliases = {
    teks: 'text',
    text: 'text',
    'teks langsung': 'text',
    file: 'file',
    berkas: 'file',
    upload: 'file',
    link: 'link',
    tautan: 'link',
  }
  const rawItems = Array.isArray(value) ? value : String(value || 'text').split(/[,\n;]+/)
  const selected = rawItems
    .map((item) => aliases[normalizeLookupText(item)] || String(item || '').trim())
    .filter((item) => assignmentSubmissionTypeOptions.some((option) => option.value === item))
  return selected.length > 0 ? Array.from(new Set(selected)) : ['text']
}

function normalizeAssignmentAttachments(value) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item) => item && (item.url || item.dataUrl || item.title))
    .map((item, index) => ({
      id: item.id || createMaterialBlockId(`assignment-attachment-${index + 1}`),
      title: item.title || item.name || `Lampiran ${index + 1}`,
      type: item.type || inferMediaTypeFromFile({ name: item.title || item.name || '', type: item.mime || '' }),
      url: item.url || '',
      dataUrl: item.dataUrl || '',
      mime: item.mime || '',
      size: Number(item.size || 0),
    }))
}

function normalizeAssignmentRubricRows(value) {
  if (Array.isArray(value)) {
    const rows = value
      .filter((item) => item && (item.component || item.description || item.weight))
      .map((item, index) => ({
        id: item.id || createMaterialBlockId(`rubric-${index + 1}`),
        component: item.component || `Komponen ${index + 1}`,
        weight: Number(item.weight || 0),
        description: item.description || '',
      }))
    return rows.length > 0 ? rows : defaultAssignmentRubricRows.map((row) => ({ ...row }))
  }

  const text = String(value || '').trim()
  if (!text) return defaultAssignmentRubricRows.map((row) => ({ ...row }))
  const rows = text.split('\n').map((line, index) => {
    const match = line.match(/(.+?)(\d{1,3})\s*%/)
    return {
      id: createMaterialBlockId(`rubric-${index + 1}`),
      component: (match ? match[1] : line).replace(/[:,-]\s*$/, '').trim() || `Komponen ${index + 1}`,
      weight: match ? Number(match[2]) : 0,
      description: line.trim(),
    }
  })
  return rows.length > 0 ? rows : defaultAssignmentRubricRows.map((row) => ({ ...row }))
}

function getAssignmentRubricText(rows = []) {
  return normalizeAssignmentRubricRows(rows)
    .map((row) => `${row.component}${row.weight ? ` ${row.weight}%` : ''}: ${row.description || '-'}`)
    .join('\n')
}

function normalizeAssignmentClassIds(assignment = {}) {
  if (Array.isArray(assignment.classIds)) return assignment.classIds.map(String).filter(Boolean)
  return assignment.classId ? [String(assignment.classId)] : []
}

function normalizeAssignmentClassNames(assignment = {}) {
  if (Array.isArray(assignment.classNames)) return assignment.classNames.map((item) => String(item || '').trim()).filter(Boolean)
  const value = String(assignment.className || '').trim()
  if (!value) return []
  return value.split(/\s*,\s*/).map((item) => item.trim()).filter(Boolean)
}

function sameAssignmentClassName(left, right) {
  const leftText = String(left || '').trim()
  const rightText = String(right || '').trim()
  if (!leftText || !rightText) return false
  if (normalizeLookupText(leftText) === normalizeLookupText(rightText)) return true
  const leftGrade = extractGrade(leftText)
  const rightGrade = extractGrade(rightText)
  return Boolean(leftGrade && rightGrade && leftGrade === rightGrade)
}

function getAssignmentClassOptions(lookupClasses = [], assignment = {}) {
  const options = getMaterialClassOptions(lookupClasses, assignment.className || '')
  normalizeAssignmentClassNames(assignment).forEach((name) => {
    if (!options.some((classItem) => sameAssignmentClassName(classItem.name, name))) {
      options.push({ id: '', name, synthetic: true })
    }
  })
  return options.length > 0 ? options : highSchoolGradeFolders.map((gradeFolder) => ({ id: '', name: gradeFolder.name, synthetic: true }))
}

function normalizeAssignmentForEdit(assignment = {}, lookups = { subjects: [], classes: [] }, fallbackSubject = '') {
  const subjectName = assignment.subject || fallbackSubject || 'Mapel belum dipilih'
  const classesList = getAssignmentClassOptions(lookups.classes || [], assignment)
  const classNames = normalizeAssignmentClassNames(assignment)
  const targetClassNames = classNames.length > 0 ? classNames : [classesList[0]?.name || 'Semua kelas']
  const classIds = normalizeAssignmentClassIds(assignment)
  return {
    ...assignment,
    title: assignment.title || '',
    description: assignment.description || assignment.instructions || '',
    subjectId: assignment.subjectId || assignment.subject_id || '',
    subject: subjectName,
    classIds,
    classNames: targetClassNames,
    classId: assignment.classId || assignment.class_id || classIds[0] || '',
    className: targetClassNames.join(', '),
    releaseAt: assignment.releaseAt || assignment.release_at || '',
    deadline: assignment.deadline || '',
    latePolicy: assignment.latePolicy || 'allow-late',
    submissionTypes: normalizeAssignmentSubmissionTypes(assignment.submissionTypes),
    maxScore: Number(assignment.maxScore || 100),
    gradeWeight: Number(assignment.gradeWeight || 10),
    rubricRows: normalizeAssignmentRubricRows(assignment.rubricRows || assignment.rubric),
    rubric: assignment.rubric || getAssignmentRubricText(assignment.rubricRows),
    workMode: assignment.workMode || 'Individu',
    attachments: normalizeAssignmentAttachments(assignment.attachments),
    status: assignment.status || 'Draft',
  }
}

function prepareAssignmentForSave(assignment = {}) {
  const classNames = normalizeAssignmentClassNames(assignment)
  const rubricRows = normalizeAssignmentRubricRows(assignment.rubricRows || assignment.rubric)
  const submissionTypes = normalizeAssignmentSubmissionTypes(assignment.submissionTypes)
  const attachments = normalizeAssignmentAttachments(assignment.attachments)
  return {
    ...assignment,
    title: String(assignment.title || '').trim(),
    description: String(assignment.description || '').trim(),
    classIds: normalizeAssignmentClassIds(assignment),
    classNames,
    classId: normalizeAssignmentClassIds(assignment)[0] || assignment.classId || '',
    className: classNames.length > 0 ? classNames.join(', ') : assignment.className || 'Semua kelas',
    deadline: assignment.deadline || '',
    releaseAt: assignment.releaseAt || '',
    latePolicy: assignment.latePolicy || 'allow-late',
    submissionTypes,
    maxScore: Number(assignment.maxScore || 100),
    gradeWeight: Number(assignment.gradeWeight || 0),
    rubricRows,
    rubric: getAssignmentRubricText(rubricRows),
    workMode: assignment.workMode || 'Individu',
    attachments,
    updatedAt: new Date().toISOString(),
  }
}

function buildAssignmentStoredDescription(assignment = {}) {
  const prepared = prepareAssignmentForSave(assignment)
  const details = [
    prepared.description,
    '',
    '--- Pengaturan Tugas IsleLearn ---',
    `Target kelas: ${prepared.className || '-'}`,
    `Rilis: ${formatAssignmentDateTime(prepared.releaseAt)}`,
    `Deadline: ${formatAssignmentDateTime(prepared.deadline)}`,
    `Kebijakan terlambat: ${assignmentLatePolicyOptions.find((item) => item.value === prepared.latePolicy)?.label || prepared.latePolicy}`,
    `Metode submit: ${prepared.submissionTypes.map((type) => assignmentSubmissionTypeOptions.find((item) => item.value === type)?.label || type).join(', ')}`,
    `Skor maksimal: ${prepared.maxScore}`,
    `Bobot nilai: ${prepared.gradeWeight}%`,
    `Mode: ${prepared.workMode}`,
    prepared.rubric ? `Rubrik:\n${prepared.rubric}` : '',
    prepared.attachments.length ? `Lampiran:\n${prepared.attachments.map((item) => `- ${item.title}${item.url ? ` (${item.url})` : ''}`).join('\n')}` : '',
  ].filter(Boolean)
  return details.join('\n')
}

function isAssignmentReleased(assignment = {}) {
  if (assignment.status !== 'Aktif') return false
  if (!assignment.releaseAt && !assignment.release_at) return true
  const releaseDate = new Date(assignment.releaseAt || assignment.release_at)
  if (Number.isNaN(releaseDate.getTime())) return true
  return releaseDate.getTime() <= Date.now()
}

function isAssignmentPastDeadline(assignment = {}) {
  if (!assignment.deadline) return false
  const deadlineDate = new Date(assignment.deadline)
  if (Number.isNaN(deadlineDate.getTime())) return false
  return deadlineDate.getTime() < Date.now()
}

function isAssignmentLocked(assignment = {}) {
  return assignment.latePolicy === 'hard-lock' && isAssignmentPastDeadline(assignment)
}

function isAssignmentVisibleToStudent(assignment = {}, user = {}) {
  if (!isAssignmentReleased(assignment)) return false
  const targetNames = normalizeAssignmentClassNames(assignment)
  if (!targetNames.length || targetNames.some((name) => /semua/i.test(name))) return true
  const studentClass = user?.className || user?.class || user?.kelas || user?.rombel || ''
  if (!studentClass) return true
  return targetNames.some((name) => sameAssignmentClassName(name, studentClass))
}

function formatAssignmentDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

function getAssignmentAttachmentPreviewUrl(attachment = {}) {
  const rawUrl = attachment.dataUrl || attachment.url || ''
  if (!rawUrl) return ''
  if (attachment.type === 'Video') return getEmbeddableVideoUrl(rawUrl) || rawUrl
  if (['PDF', 'Dokumen', 'Presentasi', 'Spreadsheet'].includes(attachment.type)) return getDocumentPreviewUrl(rawUrl, attachment.type) || rawUrl
  return rawUrl
}

function AssignmentAttachmentPreview({ attachment }) {
  const previewUrl = getAssignmentAttachmentPreviewUrl(attachment)
  if (!previewUrl) return null
  const isFrame = ['Video', 'PDF', 'Dokumen', 'Presentasi', 'Spreadsheet', 'Embed'].includes(attachment.type)
  const isDocumentFrame = ['PDF', 'Dokumen', 'Presentasi', 'Spreadsheet'].includes(attachment.type)
  const frameClass = isDocumentFrame
    ? 'assignment-attachment-frame h-[72dvh] min-h-[34rem] w-full bg-white md:min-h-[42rem]'
    : 'h-[56dvh] min-h-[18rem] w-full bg-white sm:aspect-video sm:h-auto'
  return (
    <div className="overflow-hidden rounded-[1.1rem] border border-[#0B3A5B]/10 bg-white shadow-[0_14px_34px_rgba(15,36,55,0.055)]">
      <div className="flex flex-col gap-2 border-b border-[#0B3A5B]/8 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-[#13232d]">{attachment.title}</p>
          <p className="text-xs font-bold text-slate-500">{attachment.type}{attachment.size ? ` · ${formatFileSize(attachment.size)}` : ''}</p>
        </div>
        {attachment.url && (
          <a href={attachment.url} target="_blank" rel="noreferrer" className="rounded-[0.7rem] bg-[#E0F2FE] px-2.5 py-1.5 text-xs font-black text-[#0284c7]">
            Buka
          </a>
        )}
      </div>
      {attachment.type === 'Gambar' ? (
        <img src={previewUrl} alt={attachment.title} className="max-h-[76dvh] min-h-[18rem] w-full bg-slate-50 object-contain" />
      ) : attachment.type === 'Audio' ? (
        <div className="p-3"><audio controls src={previewUrl} className="w-full" /></div>
      ) : isFrame ? (
        <iframe title={attachment.title} src={previewUrl} className={frameClass} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      ) : (
        <div className="rounded-b-[1.1rem] bg-[#F8FBFF] p-5 text-sm font-semibold leading-6 text-slate-600">
          Lampiran siap dibuka oleh siswa. Gunakan tombol Buka untuk melihat file penuh di tab baru.
        </div>
      )}
    </div>
  )
}

function AssignmentStudentPreview({ assignment }) {
  const prepared = prepareAssignmentForSave(assignment)
  return (
    <div className="rounded-[1rem] border border-[#0B3A5B]/10 bg-[#F8FBFF] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={prepared.status === 'Aktif' ? 'green' : 'amber'}>{prepared.status}</StatusBadge>
        <StatusBadge tone="cyan">{prepared.workMode}</StatusBadge>
        <StatusBadge tone="teal">{prepared.maxScore} poin</StatusBadge>
      </div>
      <h3 className="mt-3 text-lg font-black leading-tight text-[#13232d]">{prepared.title || 'Judul tugas'}</h3>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#0284c7]">{prepared.subject} · {prepared.className}</p>
      <div className="mt-3 grid gap-2 text-xs font-bold text-slate-600 sm:grid-cols-2">
        <span>Rilis: {formatAssignmentDateTime(prepared.releaseAt)}</span>
        <span>Deadline: {formatAssignmentDateTime(prepared.deadline)}</span>
      </div>
      <div className="mt-3 rounded-[0.9rem] bg-white p-3 text-sm leading-7 text-slate-700 ring-1 ring-[#0B3A5B]/8">
        {prepared.description || 'Instruksi tugas akan tampil di sini.'}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {prepared.submissionTypes.map((type) => (
          <span key={type} className="rounded-full bg-[#E0F2FE] px-3 py-1 text-xs font-black text-[#0284c7]">
            {assignmentSubmissionTypeOptions.find((item) => item.value === type)?.label || type}
          </span>
        ))}
      </div>
      {prepared.attachments.length > 0 && (
        <div className="mt-3 space-y-2">
          {prepared.attachments.map((attachment) => <AssignmentAttachmentPreview key={attachment.id} attachment={attachment} />)}
        </div>
      )}
      <div className="mt-3 overflow-hidden rounded-[0.9rem] border border-[#0B3A5B]/10 bg-white">
        {prepared.rubricRows.map((row) => (
          <div key={row.id} className="grid gap-1 border-b border-[#0B3A5B]/8 px-3 py-2 last:border-b-0 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-black text-[#13232d]">{row.component}</p>
              <p className="text-xs font-semibold leading-5 text-slate-500">{row.description || 'Deskripsi rubrik belum diisi.'}</p>
            </div>
            <span className="text-sm font-black text-[#0284c7]">{row.weight}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AssignmentForm({ assignment, lookups, subjectOptions = [], onCancel, onSave }) {
  const autosaveKey = useMemo(() => `islelearn-assignment-autosave-${assignment?.id || 'baru'}`, [assignment?.id])
  const [form, setForm] = useState(() => normalizeAssignmentForEdit(assignment, lookups, assignment?.subject || subjectOptions[0]))
  const [showPreview, setShowPreview] = useState(false)
  const [autosaveNotice, setAutosaveNotice] = useState('')
  const [attachmentDraft, setAttachmentDraft] = useState({ type: 'Video', title: '', url: '' })
  const scopedSubjects = getScopedSubjectLookupRows(lookups.subjects, subjectOptions)
  const subjectsList = scopedSubjects.length > 0 ? scopedSubjects : [{ id: '', name: form.subject || assignment.subject || 'Mapel belum dipilih', synthetic: true }]
  const classesList = getAssignmentClassOptions(lookups.classes || [], form)
  const assignmentValidation = getAssignmentValidation(form)
  const validAssignment = assignmentValidation.valid

  useEffect(() => {
    const saved = safeReadLocalJson(autosaveKey, null)
    const savedAssignment = saved?.assignment
    const shouldRestore = savedAssignment && (savedAssignment.id === assignment?.id || (!savedAssignment.id && !assignment?.id))
    setForm(normalizeAssignmentForEdit(shouldRestore ? savedAssignment : assignment, lookups, assignment?.subject || subjectOptions[0]))
    setAutosaveNotice(shouldRestore ? 'Draf otomatis dipulihkan.' : '')
  }, [assignment, autosaveKey, lookups])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      safeWriteLocalJson(autosaveKey, { assignment: form, savedAt: new Date().toISOString() })
      setAutosaveNotice(`Tersimpan otomatis ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`)
    }, 900)
    return () => window.clearTimeout(timeout)
  }, [autosaveKey, form])

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

  function toggleClass(classItem) {
    const currentNames = normalizeAssignmentClassNames(form)
    const active = currentNames.some((name) => sameAssignmentClassName(name, classItem.name))
    const nextNames = active
      ? currentNames.filter((name) => !sameAssignmentClassName(name, classItem.name))
      : [...currentNames, classItem.name]
    const normalizedNames = nextNames.length > 0 ? nextNames : [classItem.name]
    const nextIds = classesList
      .filter((item) => normalizedNames.some((name) => sameAssignmentClassName(name, item.name)) && item.id)
      .map((item) => String(item.id))
    setForm((current) => ({
      ...current,
      classIds: nextIds,
      classNames: normalizedNames,
      classId: nextIds[0] || '',
      className: normalizedNames.join(', '),
    }))
  }

  function toggleSubmissionType(value) {
    const currentTypes = normalizeAssignmentSubmissionTypes(form.submissionTypes)
    const nextTypes = currentTypes.includes(value)
      ? currentTypes.filter((item) => item !== value)
      : [...currentTypes, value]
    updateField('submissionTypes', nextTypes.length ? nextTypes : ['text'])
  }

  function updateRubricRow(id, field, value) {
    setForm((current) => ({
      ...current,
      rubricRows: normalizeAssignmentRubricRows(current.rubricRows).map((row) => row.id === id ? { ...row, [field]: field === 'weight' ? Number(value || 0) : value } : row),
    }))
  }

  function addRubricRow() {
    setForm((current) => ({
      ...current,
      rubricRows: [...normalizeAssignmentRubricRows(current.rubricRows), { id: createMaterialBlockId('rubric'), component: 'Komponen baru', weight: 0, description: '' }],
    }))
  }

  function removeRubricRow(id) {
    setForm((current) => ({
      ...current,
      rubricRows: normalizeAssignmentRubricRows(current.rubricRows).filter((row) => row.id !== id),
    }))
  }

  function appendInstruction(snippet) {
    setForm((current) => ({
      ...current,
      description: `${current.description || ''}${current.description ? '\n\n' : ''}${snippet}`,
    }))
  }

  async function addAttachmentFiles(event) {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    const items = await Promise.all(files.map(async (file) => ({
      id: createMaterialBlockId('assignment-file'),
      title: file.name,
      type: inferMediaTypeFromFile(file),
      dataUrl: await blobToDataUrl(file),
      url: '',
      mime: file.type,
      size: file.size,
    })))
    setForm((current) => ({ ...current, attachments: [...normalizeAssignmentAttachments(current.attachments), ...items] }))
    event.target.value = ''
  }

  function addLinkAttachment() {
    const url = cleanMaterialUrl(attachmentDraft.url)
    if (!url) return
    setForm((current) => ({
      ...current,
      attachments: [
        ...normalizeAssignmentAttachments(current.attachments),
        {
          id: createMaterialBlockId('assignment-link'),
          title: attachmentDraft.title || `${attachmentDraft.type} referensi`,
          type: attachmentDraft.type,
          url,
          dataUrl: '',
          size: 0,
        },
      ],
    }))
    setAttachmentDraft({ type: 'Video', title: '', url: '' })
  }

  function removeAttachment(id) {
    setForm((current) => ({ ...current, attachments: normalizeAssignmentAttachments(current.attachments).filter((item) => item.id !== id) }))
  }

  function generateDraftWithAiHelper() {
    const topic = form.title || 'topik pembelajaran'
    const subject = form.subject || 'mapel'
    setForm((current) => ({
      ...current,
      description: `Pelajari materi tentang ${topic} pada mata pelajaran ${subject}. Kerjakan tugas sesuai instruksi berikut:\n\n1. Baca atau tonton materi pendukung yang diberikan guru.\n2. Buat jawaban ringkas namun lengkap dengan contoh atau bukti pendukung.\n3. Pastikan jawaban dikumpulkan sesuai metode yang dipilih.\n4. Tulis refleksi singkat tentang bagian yang paling kamu pahami dan bagian yang masih perlu ditanyakan.`,
      rubricRows: [
        { id: createMaterialBlockId('rubric'), component: 'Pemahaman konsep', weight: 50, description: 'Jawaban menunjukkan konsep utama dipahami dengan tepat.' },
        { id: createMaterialBlockId('rubric'), component: 'Argumentasi dan bukti', weight: 30, description: 'Jawaban memakai alasan, data, contoh, atau langkah kerja yang jelas.' },
        { id: createMaterialBlockId('rubric'), component: 'Kerapian pengumpulan', weight: 20, description: 'Format jawaban rapi dan dikumpulkan sesuai tenggat.' },
      ],
    }))
    setAutosaveNotice('Draf instruksi dan rubrik dibuat dari Bantuan AI Creator lokal.')
  }

  const prepared = prepareAssignmentForSave(form)
  const rubricTotal = prepared.rubricRows.reduce((sum, row) => sum + Number(row.weight || 0), 0)
  const rubricTotalIsIdeal = rubricTotal === 100

  return (
    <section className="liquid-glass-light mb-5 overflow-hidden rounded-[1.25rem]">
      <header className="flex flex-col gap-3 border-b border-white/70 bg-white/45 px-4 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-[0.9rem] bg-[#E0F2FE] text-[#0284c7] ring-1 ring-[#0284c7]/10">
            <ClipboardList size={20} />
          </span>
          <div>
            <h2 className="text-xl font-black leading-tight text-[#13232d]">{form.id ? 'Edit tugas' : 'Buat tugas'}</h2>
            <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
              Semua pengaturan utama tugas ada di sini: kelas paralel, lampiran, jadwal rilis, deadline, metode submit, rubrik, dan pratinjau siswa.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={prepared.status === 'Aktif' ? 'green' : 'amber'}>{prepared.status}</StatusBadge>
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-500 ring-1 ring-[#0B3A5B]/8">{autosaveNotice || 'Auto-save aktif'}</span>
          <button type="button" onClick={() => setShowPreview((current) => !current)} className="inline-flex items-center gap-2 rounded-[0.85rem] bg-white px-3 py-2 text-xs font-black text-[#0284c7] ring-1 ring-[#0B3A5B]/10 transition hover:bg-[#E0F2FE]">
            <Search size={14} /> {showPreview ? 'Tutup preview' : 'Preview siswa'}
          </button>
        </div>
      </header>

      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <div className="space-y-4 p-4 lg:p-5">
          <div className="glass-inset grid gap-3 rounded-[1rem] p-4 lg:grid-cols-[1.25fr_0.75fr]">
            <label className={materialLabelClass}>Judul tugas
              <input value={form.title || ''} onChange={(event) => updateField('title', event.target.value)} placeholder="Contoh: Latihan 3: Hukum Newton" className={materialInputClass} />
            </label>
            {subjectOptions.length === 1 ? (
              <div className={materialLabelClass}>Mata pelajaran
                <div className={`${materialInputClass} flex min-h-[2.75rem] items-center bg-[#EEF7FF] text-[#17446E]`}>
                  {form.subject || subjectsList[0]?.name || subjectOptions[0]}
                </div>
              </div>
            ) : (
              <label className={materialLabelClass}>Mata pelajaran
                <select value={form.subjectId || `subject:${form.subject || subjectsList[0]?.name || ''}`} onChange={(event) => updateSubject(event.target.value)} className={materialInputClass}>
                  {subjectsList.map((subject) => <option key={subjectOptionValue(subject)} value={subjectOptionValue(subject)}>{subject.name}</option>)}
                </select>
              </label>
            )}
          </div>

          <div className="hidden">
            <p className="text-sm font-black text-[#13232d]">Target kelas</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">Bisa memilih lebih dari satu kelas paralel.</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {classesList.map((classItem) => {
                const active = normalizeAssignmentClassNames(form).some((name) => sameAssignmentClassName(name, classItem.name))
                return (
                  <button
                    key={classOptionValue(classItem)}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleClass(classItem)}
                    className={`rounded-[0.9rem] px-3 py-3 text-left text-sm font-black ring-1 transition ${
                      active
                        ? 'bg-[#0B3A5B] text-white ring-[#0B3A5B]'
                        : 'bg-white text-slate-700 ring-[#0B3A5B]/10 hover:bg-[#E0F2FE] hover:text-[#0284c7]'
                    }`}
                  >
                    {classItem.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="hidden">
            <section className="rounded-[1rem] border border-[#0B3A5B]/10 bg-[#F8FBFF] p-3">
              <p className="text-sm font-black text-[#13232d]">Metode pengumpulan</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Pilih satu atau beberapa cara siswa mengirim jawaban.</p>
              <div className="mt-3 grid gap-2">
                {assignmentSubmissionTypeOptions.map((option) => {
                  const active = prepared.submissionTypes.includes(option.value)
                  return (
                    <label key={option.value} className={`flex cursor-pointer gap-3 rounded-[0.9rem] px-3 py-2.5 ring-1 transition ${active ? 'bg-white text-[#13232d] ring-[#0284c7]/30' : 'bg-white/70 text-slate-500 ring-[#0B3A5B]/8'}`}>
                      <input type="checkbox" checked={active} onChange={() => toggleSubmissionType(option.value)} className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0284c7]" />
                      <span>
                        <span className="block text-sm font-black">{option.label}</span>
                        <span className="mt-0.5 block text-xs font-semibold leading-5 text-slate-500">{option.helper}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </section>

            <section className="rounded-[1rem] border border-[#0B3A5B]/10 bg-white p-3">
              <p className="text-sm font-black text-[#13232d]">Mode kerja</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Tentukan apakah tugas dikerjakan sendiri atau berkelompok.</p>
              <div className="mt-3 grid gap-2">
                {assignmentWorkModeOptions.map((option) => {
                  const active = form.workMode === option.value
                  return (
                    <button key={option.value} type="button" onClick={() => updateField('workMode', option.value)} className={`rounded-[0.9rem] px-3 py-2.5 text-left ring-1 transition ${active ? 'bg-[#0B3A5B] text-white ring-[#0B3A5B]' : 'bg-white text-slate-600 ring-[#0B3A5B]/10 hover:bg-[#E0F2FE]'}`}>
                      <span className="block text-sm font-black">{option.label}</span>
                      <span className={`mt-0.5 block text-xs font-semibold leading-5 ${active ? 'text-white/78' : 'text-slate-500'}`}>{option.helper}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          </div>

          <div className="glass-panel rounded-[1rem] p-4">
            <div className="liquid-toolbar sticky top-3 z-20 rounded-[1rem] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-black text-[#13232d]">Instruksi tugas</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">Mendukung format cepat: heading, tebal, daftar, callout, dan code block.</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  ['H2', '## Subbagian'],
                  ['B', '**teks tebal**'],
                  ['List', '- poin instruksi'],
                  ['Info', '> Catatan penting'],
                  ['Code', '```\ncontoh kode\n```'],
                ].map(([label, snippet]) => (
                  <button key={label} type="button" onClick={() => appendInstruction(snippet)} className="rounded-[0.7rem] bg-[#F1F7FF] px-2.5 py-1.5 text-xs font-black text-[#0284c7] ring-1 ring-[#0B3A5B]/8">
                    {label}
                  </button>
                ))}
              </div>
              </div>
            </div>
            <textarea value={form.description || ''} onChange={(event) => updateField('description', event.target.value)} rows={18} placeholder="Tulis detail pengerjaan, format jawaban, dan langkah-langkah yang harus diikuti siswa." className={`${materialInputClass} mt-4 min-h-[29rem] resize-y bg-white/88 leading-7 shadow-inner`} />
          </div>

          <div className="hidden">
            <div className="rounded-[1rem] border border-[#0B3A5B]/10 bg-[#F8FBFF] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[#13232d]">Lampiran dan referensi</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Dokumen, gambar, audio, video, PDF, atau link YouTube/Drive bisa muncul sebagai embed.</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-[0.8rem] bg-white px-3 py-2 text-xs font-black text-[#0284c7] ring-1 ring-[#0B3A5B]/10">
                  <FileText size={14} /> Upload
                  <input type="file" multiple onChange={addAttachmentFiles} className="hidden" accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.html,.htm" />
                </label>
              </div>
              <div className="mt-3 grid gap-2">
                <select value={attachmentDraft.type} onChange={(event) => setAttachmentDraft((current) => ({ ...current, type: event.target.value }))} className={materialInputClass}>
                  {['Video', 'PDF', 'Dokumen', 'Presentasi', 'Spreadsheet', 'Gambar', 'Audio', 'Embed', 'Link'].map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <input value={attachmentDraft.title} onChange={(event) => setAttachmentDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Judul lampiran" className={materialInputClass} />
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input value={attachmentDraft.url} onChange={(event) => setAttachmentDraft((current) => ({ ...current, url: event.target.value }))} placeholder="URL YouTube, Drive, PDF, audio, atau embed" className={materialInputClass} />
                  <button type="button" onClick={addLinkAttachment} className="rounded-[0.85rem] bg-[#0B3A5B] px-4 py-2.5 text-sm font-black text-white">
                    Tambah
                  </button>
                </div>
              </div>
              {prepared.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {prepared.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between gap-3 rounded-[0.85rem] bg-white px-3 py-2 ring-1 ring-[#0B3A5B]/8">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#13232d]">{attachment.title}</p>
                        <p className="text-xs font-bold text-slate-500">{attachment.type}{attachment.size ? ` · ${formatFileSize(attachment.size)}` : ''}</p>
                      </div>
                      <button type="button" onClick={() => removeAttachment(attachment.id)} className="rounded-[0.7rem] bg-rose-50 px-2.5 py-1.5 text-xs font-black text-rose-700 ring-1 ring-rose-100">
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[1rem] border border-[#0B3A5B]/10 bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[#13232d]">Rubrik penilaian</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Total bobot saat ini {rubricTotal}%.</p>
                </div>
                <StatusBadge tone={rubricTotalIsIdeal ? 'green' : 'amber'}>{rubricTotalIsIdeal ? '100%' : 'Cek bobot'}</StatusBadge>
              </div>
              {!rubricTotalIsIdeal && (
                <div className="mt-3 rounded-[0.85rem] bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800 ring-1 ring-amber-100">
                  Total bobot rubrik sebaiknya 100% agar penilaian transparan untuk siswa.
                </div>
              )}
              <button type="button" onClick={addRubricRow} className="mt-3 rounded-[0.8rem] bg-[#E0F2FE] px-3 py-2 text-xs font-black text-[#0284c7]">Tambah komponen rubrik</button>
              <div className="mt-3 space-y-2">
                {prepared.rubricRows.map((row) => (
                  <div key={row.id} className="rounded-[0.9rem] border border-[#0B3A5B]/10 bg-[#F8FBFF] p-2">
                    <div className="grid gap-2 sm:grid-cols-[1fr_5rem_auto]">
                      <input value={row.component} onChange={(event) => updateRubricRow(row.id, 'component', event.target.value)} className={materialInputClass} />
                      <input type="number" min="0" max="100" value={row.weight} onChange={(event) => updateRubricRow(row.id, 'weight', event.target.value)} className={materialInputClass} />
                      <button type="button" onClick={() => removeRubricRow(row.id)} className="rounded-[0.8rem] bg-white px-3 py-2 text-xs font-black text-rose-700 ring-1 ring-rose-100">Hapus</button>
                    </div>
                    <textarea value={row.description} onChange={(event) => updateRubricRow(row.id, 'description', event.target.value)} rows={2} placeholder="Deskripsi kriteria penilaian" className={`${materialInputClass} mt-2 resize-y leading-6`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {showPreview && <AssignmentStudentPreview assignment={form} />}

          {!validAssignment && (
            <div className="rounded-[0.9rem] bg-amber-50 px-3 py-2.5 text-sm font-bold leading-6 text-amber-800 ring-1 ring-amber-100">
              Lengkapi: {assignmentValidation.missing.join(', ')}.
            </div>
          )}
        </div>

        <aside className="liquid-side-panel space-y-4 border-t border-white/70 p-4 xl:border-l xl:border-t-0">
          <div className="grid gap-3">
            <label className={materialLabelClass}>Tanggal & jam rilis
              <input type="datetime-local" value={form.releaseAt || ''} onChange={(event) => updateField('releaseAt', event.target.value)} className={materialInputClass} />
            </label>
            <label className={materialLabelClass}>Tanggal & jam tenggat
              <input type="datetime-local" value={form.deadline || ''} onChange={(event) => updateField('deadline', event.target.value)} className={materialInputClass} />
            </label>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0284c7]">Status tugas</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {assignmentStatusOptions.map((status) => {
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
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0284c7]">Keterlambatan</p>
            <div className="mt-2 space-y-2">
              {assignmentLatePolicyOptions.map((option) => {
                const active = form.latePolicy === option.value
                return (
                  <button key={option.value} type="button" onClick={() => updateField('latePolicy', option.value)} className={`w-full rounded-[0.9rem] px-3 py-2.5 text-left ring-1 transition ${active ? 'bg-[#0B3A5B] text-white ring-[#0B3A5B]' : 'bg-white text-slate-600 ring-[#0B3A5B]/10 hover:bg-[#E0F2FE]'}`}>
                    <span className="block text-sm font-black">{option.label}</span>
                    <span className={`mt-0.5 block text-xs font-semibold leading-5 ${active ? 'text-white/78' : 'text-slate-500'}`}>{option.helper}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className={materialLabelClass}>Skor maksimal
              <input type="number" min="1" value={form.maxScore || 100} onChange={(event) => updateField('maxScore', event.target.value)} className={materialInputClass} />
            </label>
            <label className={materialLabelClass}>Bobot nilai %
              <input type="number" min="0" max="100" value={form.gradeWeight || 0} onChange={(event) => updateField('gradeWeight', event.target.value)} className={materialInputClass} />
            </label>
          </div>

          <details className="glass-panel rounded-2xl p-3" open>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-[#132437]">
              Target kelas
              <span className="rounded-lg bg-white/70 px-2 py-1 text-[11px] font-black text-[#2F80D8] ring-1 ring-white/70">{normalizeAssignmentClassNames(form).length} kelas</span>
            </summary>
            <div className="mt-3 grid gap-2">
              {classesList.map((classItem) => {
                const active = normalizeAssignmentClassNames(form).some((name) => sameAssignmentClassName(name, classItem.name))
                return (
                  <button
                    key={classOptionValue(classItem)}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleClass(classItem)}
                    className={`rounded-[0.9rem] px-3 py-2.5 text-left text-sm font-black ring-1 transition ${
                      active
                        ? 'bg-[#0B3A5B] text-white ring-[#0B3A5B]'
                        : 'bg-white/78 text-slate-700 ring-white/70 hover:bg-[#E0F2FE] hover:text-[#0284c7]'
                    }`}
                  >
                    {classItem.name}
                  </button>
                )
              })}
            </div>
          </details>

          <details className="glass-panel rounded-2xl p-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-[#132437]">
              Pengumpulan
              <span className="rounded-lg bg-white/70 px-2 py-1 text-[11px] font-black text-[#2F80D8] ring-1 ring-white/70">{prepared.submissionTypes.length} mode</span>
            </summary>
            <div className="mt-3 space-y-2">
              {assignmentSubmissionTypeOptions.map((option) => {
                const active = prepared.submissionTypes.includes(option.value)
                return (
                  <label key={option.value} className={`flex cursor-pointer gap-3 rounded-[0.9rem] px-3 py-2.5 ring-1 transition ${active ? 'bg-white text-[#13232d] ring-[#0284c7]/30' : 'bg-white/68 text-slate-500 ring-white/70'}`}>
                    <input type="checkbox" checked={active} onChange={() => toggleSubmissionType(option.value)} className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0284c7]" />
                    <span>
                      <span className="block text-sm font-black">{option.label}</span>
                      <span className="mt-0.5 block text-xs font-semibold leading-5 text-slate-500">{option.helper}</span>
                    </span>
                  </label>
                )
              })}
              <div className="grid gap-2 pt-1">
                {assignmentWorkModeOptions.map((option) => {
                  const active = form.workMode === option.value
                  return (
                    <button key={option.value} type="button" onClick={() => updateField('workMode', option.value)} className={`rounded-[0.9rem] px-3 py-2.5 text-left ring-1 transition ${active ? 'bg-[#0B3A5B] text-white ring-[#0B3A5B]' : 'bg-white/78 text-slate-600 ring-white/70 hover:bg-[#E0F2FE]'}`}>
                      <span className="block text-sm font-black">{option.label}</span>
                      <span className={`mt-0.5 block text-xs font-semibold leading-5 ${active ? 'text-white/78' : 'text-slate-500'}`}>{option.helper}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </details>

          <details className="glass-panel rounded-2xl p-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-[#132437]">
              Lampiran & embed
              <span className="rounded-lg bg-white/70 px-2 py-1 text-[11px] font-black text-[#2F80D8] ring-1 ring-white/70">{prepared.attachments.length}</span>
            </summary>
            <div className="mt-3 space-y-3">
              <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[0.9rem] bg-white/76 px-3 py-2.5 text-sm font-black text-[#0284c7] ring-1 ring-white/70">
                <FileText size={14} /> Upload file
                <input type="file" multiple onChange={addAttachmentFiles} className="hidden" accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.html,.htm" />
              </label>
              <div className="grid gap-2">
                <select value={attachmentDraft.type} onChange={(event) => setAttachmentDraft((current) => ({ ...current, type: event.target.value }))} className={materialInputClass}>
                  {['Video', 'PDF', 'Dokumen', 'Presentasi', 'Spreadsheet', 'Gambar', 'Audio', 'Embed', 'Link'].map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <input value={attachmentDraft.title} onChange={(event) => setAttachmentDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Judul lampiran" className={materialInputClass} />
                <input value={attachmentDraft.url} onChange={(event) => setAttachmentDraft((current) => ({ ...current, url: event.target.value }))} placeholder="URL YouTube, Drive, PDF, audio, atau embed" className={materialInputClass} />
                <button type="button" onClick={addLinkAttachment} className="rounded-[0.85rem] bg-[#0B3A5B] px-4 py-2.5 text-sm font-black text-white">
                  Tambahkan lampiran
                </button>
              </div>
              {prepared.attachments.length > 0 && (
                <div className="space-y-2">
                  {prepared.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between gap-3 rounded-[0.85rem] bg-white/74 px-3 py-2 ring-1 ring-white/70">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#13232d]">{attachment.title}</p>
                        <p className="text-xs font-bold text-slate-500">{attachment.type}{attachment.size ? ` · ${formatFileSize(attachment.size)}` : ''}</p>
                      </div>
                      <button type="button" onClick={() => removeAttachment(attachment.id)} className="rounded-[0.7rem] bg-rose-50 px-2.5 py-1.5 text-xs font-black text-rose-700 ring-1 ring-rose-100">
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </details>

          <details className="glass-panel rounded-2xl p-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black text-[#132437]">
              Rubrik penilaian
              <StatusBadge tone={rubricTotalIsIdeal ? 'green' : 'amber'}>{rubricTotal}%</StatusBadge>
            </summary>
            <div className="mt-3 space-y-3">
              {!rubricTotalIsIdeal && (
                <div className="rounded-[0.85rem] bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800 ring-1 ring-amber-100">
                  Total bobot rubrik sebaiknya 100%.
                </div>
              )}
              <button type="button" onClick={addRubricRow} className="rounded-[0.8rem] bg-[#E0F2FE] px-3 py-2 text-xs font-black text-[#0284c7]">Tambah komponen</button>
              <div className="space-y-2">
                {prepared.rubricRows.map((row) => (
                  <div key={row.id} className="rounded-[0.9rem] bg-white/70 p-2 ring-1 ring-white/70">
                    <div className="grid gap-2 sm:grid-cols-[1fr_4.5rem]">
                      <input value={row.component} onChange={(event) => updateRubricRow(row.id, 'component', event.target.value)} className={materialInputClass} />
                      <input type="number" min="0" max="100" value={row.weight} onChange={(event) => updateRubricRow(row.id, 'weight', event.target.value)} className={materialInputClass} />
                    </div>
                    <textarea value={row.description} onChange={(event) => updateRubricRow(row.id, 'description', event.target.value)} rows={2} placeholder="Deskripsi kriteria penilaian" className={`${materialInputClass} mt-2 resize-y leading-6`} />
                    <button type="button" onClick={() => removeRubricRow(row.id)} className="mt-2 rounded-[0.8rem] bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 ring-1 ring-rose-100">Hapus</button>
                  </div>
                ))}
              </div>
            </div>
          </details>

          <button type="button" onClick={generateDraftWithAiHelper} className="inline-flex w-full items-center justify-center gap-2 rounded-[0.95rem] bg-cyan-50 px-4 py-3 text-sm font-black text-cyan-800 ring-1 ring-cyan-100 transition hover:bg-cyan-100">
            <Sparkles size={16} /> Bantuan AI Creator
          </button>
        </aside>
      </div>

      <footer className="flex flex-col-reverse gap-2 border-t border-[#0B3A5B]/8 bg-white/78 px-4 py-3 sm:flex-row sm:justify-end">
        <button onClick={onCancel} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-100">
          <X size={16} /> Batal
        </button>
        <button onClick={() => onSave(prepareAssignmentForSave(form))} disabled={!validAssignment} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] bg-[#0B3A5B] px-4 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(15,31,42,0.14)] transition hover:bg-[#0284c7] disabled:cursor-not-allowed disabled:opacity-45">
          <Save size={16} /> Simpan tugas
        </button>
      </footer>
    </section>
  )
}

function emptyAssignment(lookups, teacherSubject) {
  const subject = lookups.subjects.find((item) => sameSubjectName(item.name, teacherSubject)) || lookups.subjects[0]
  const classItem = getAssignmentClassOptions(lookups.classes || [], {})[0]
  return normalizeAssignmentForEdit({
    title: '',
    description: '',
    subjectId: subject?.id || '',
    classId: classItem?.synthetic ? '' : classItem?.id || '',
    classIds: classItem?.id ? [classItem.id] : [],
    subject: subject?.name || teacherSubject || 'Mapel belum dipilih',
    classNames: [classItem?.name || 'Kelas X'],
    className: classItem?.name || 'Kelas X',
    releaseAt: '',
    deadline: '',
    latePolicy: 'allow-late',
    submissionTypes: ['text'],
    maxScore: 100,
    gradeWeight: 10,
    status: 'Draft',
    workMode: 'Individu',
    attachments: [],
    rubricRows: defaultAssignmentRubricRows.map((row) => ({ ...row })),
  }, lookups, teacherSubject)
}

function KuisLive({ user, notify, appContext }) {
  const allSubjectOptions = useMemo(() => getGradeSubjectOptions(), [])
  const teacherSubjectOptions = useMemo(() => getTeacherSubjectOptions(user, allSubjectOptions), [allSubjectOptions, user?.subject])
  const hasTeacherSubject = getTeacherSubjectNames(user).length > 0
  const teacherSubject = hasTeacherSubject ? teacherSubjectOptions[0] : ''
  const [quizRows, setQuizRows] = useState([])
  const [questionRows, setQuestionRows] = useState([])
  const [lookups, setLookups] = useState({ subjects: [], classes: [] })
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')
  const scopedQuizRows = filterRowsByTeacherSubjects(quizRows, user, teacherSubjectOptions)
  const scopedQuestionRows = filterRowsByTeacherSubjects(questionRows, user, teacherSubjectOptions)
  const publishedCount = scopedQuizRows.filter((item) => item.status === 'Publish').length
  const draftCount = scopedQuizRows.filter((item) => item.status !== 'Publish').length
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
        action={<QuickActionButton icon={FlaskConical} label={scopedQuestionRows.length === 0 ? 'Butuh soal' : editing ? 'Editor terbuka' : 'Buat kuis'} disabled={Boolean(editing) || scopedQuestionRows.length === 0} onClick={() => setEditing(emptyQuiz(lookups, teacherSubject))} />}
      />

      <section className="mb-4 flex flex-col gap-3 rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/80 px-4 py-3 shadow-[0_12px_36px_rgba(15,31,42,0.055)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs font-black text-[#13232d]">
          <span className="inline-flex items-center gap-1.5 rounded-[0.75rem] bg-[#E0F2FE] px-3 py-1.5 text-[#0284c7] ring-1 ring-[#0284c7]/10">
            <FlaskConical size={14} /> {scopedQuizRows.length} kuis
          </span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{publishedCount} publish</span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{draftCount} draft</span>
          <span className="rounded-[0.75rem] bg-[#F1F7FF] px-3 py-1.5 text-slate-600 ring-1 ring-[#0B3A5B]/8">{scopedQuestionRows.length} soal tersedia</span>
        </div>
        <p className="text-xs font-bold text-slate-500">
          Sumber data: <span className="text-[#0284c7]">{sourceLabel}</span>
        </p>
      </section>

      {error && <div className="mb-4 rounded-[1rem] bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data kuis: {error}. Data lokal mapel guru ditampilkan.</div>}
      
      {editing && <QuizForm quiz={editing} lookups={lookups} questions={scopedQuestionRows} subjectOptions={hasTeacherSubject ? teacherSubjectOptions : []} onCancel={() => setEditing(null)} onSave={handleSave} />}
      
      {loading ? <LoadingState label="Memuat kuis guru dari Supabase..." /> : (
        scopedQuizRows.length > 0 ? (
          <section className="overflow-hidden rounded-[1.15rem] border border-[#0B3A5B]/10 bg-white/86 shadow-[0_14px_44px_rgba(15,31,42,0.06)]">
            {scopedQuizRows.map((quiz) => (
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
              description={scopedQuestionRows.length > 0 ? 'Buat kuis pertama dari soal yang sudah tersedia.' : 'Buat soal di Bank Soal dulu, lalu rakit kuis saat siap.'}
              action={<QuickActionButton icon={FlaskConical} label="Buat kuis" disabled={scopedQuestionRows.length === 0} onClick={() => setEditing(emptyQuiz(lookups, teacherSubject))} />}
            />
          )
        )
      )}
      <ConfirmDialog open={Boolean(deleting)} title="Hapus kuis?" description={`Kuis "${deleting?.title || ''}" akan dihapus setelah konfirmasi.`} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  )
}

function QuizForm({ quiz, lookups, questions: availableQuestions, subjectOptions = [], onCancel, onSave }) {
  const [form, setForm] = useState(quiz)
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(quiz.questionIds || [])
  const scopedSubjects = getScopedSubjectLookupRows(lookups.subjects, subjectOptions)
  const subjectsList = scopedSubjects.length > 0 ? scopedSubjects : [{ id: '', name: quiz.subject || 'Mapel belum dipilih' }]
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
    const selected = subjectsList.find((subject) => subjectOptionValue(subject) === value)
    setForm((current) => ({
      ...current,
      subjectId: selected?.synthetic ? '' : selected?.id || '',
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

          {subjectOptions.length === 1 ? (
            <div className={materialLabelClass}>Mata pelajaran
              <div className={`${materialInputClass} flex min-h-[2.75rem] items-center bg-[#EEF7FF] text-[#17446E]`}>
                {form.subject || subjectsList[0]?.name || subjectOptions[0]}
              </div>
            </div>
          ) : (
            <label className={materialLabelClass}>Mata pelajaran
              <select value={form.subjectId || `subject:${form.subject || subjectsList[0]?.name || ''}`} onChange={(event) => updateSubject(event.target.value)} className={materialInputClass}>
                {subjectsList.map((subject) => <option key={subjectOptionValue(subject)} value={subjectOptionValue(subject)}>{subject.name}</option>)}
              </select>
            </label>
          )}

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
  const subject = lookups.subjects.find((item) => sameSubjectName(item.name, teacherSubject)) || lookups.subjects[0]
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
  const homeroomAssignments = getHomeroomAssignments()

  const adminMenus = [
    { label: 'Guru', icon: UsersRound, onClick: () => navigate('/admin/guru') },
    { label: 'Siswa', icon: UsersRound, onClick: () => navigate('/admin/siswa') },
    { label: 'Kelas', icon: School, onClick: () => navigate('/admin/kelas') },
    { label: 'Wali Kelas', icon: ClipboardList, onClick: () => navigate('/admin/wali-kelas') },
    { label: 'Mapel', icon: BookOpen, onClick: () => navigate('/admin/mapel') },
    { label: 'Backup', icon: Download, onClick: () => navigate('/admin/backup') },
  ]

  const metricItems = [
    { label: 'Guru', value: teachers.length, caption: 'profil terdaftar', icon: UsersRound },
    { label: 'Siswa', value: students.length, caption: 'akun siswa', icon: UsersRound },
    { label: 'Kelas', value: classes.length, caption: 'rombel aktif', icon: School },
    { label: 'Wali kelas', value: homeroomAssignments.filter((item) => item.teacherId || item.teacherNip || item.teacherName).length, caption: 'akses rapor', icon: ClipboardList },
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
              { label: 'Wali kelas', description: 'Tentukan guru yang boleh membuka dan mencetak Rapor per rombel.', icon: ClipboardList, done: homeroomAssignments.some((item) => item.teacherId || item.teacherNip), actionLabel: 'Atur', onClick: () => navigate('/admin/wali-kelas') },
              { label: 'Backup data', description: 'Simpan salinan data utama secara berkala.', icon: Download, done: false, actionLabel: 'Backup', onClick: () => navigate('/admin/backup') },
            ]}
          />
        </DashboardPanel>

        <DashboardPanel title="Status sistem" description="Ringkasan singkat untuk melihat kesiapan data.">
          <div className="space-y-2">
            {[
              ['Profil sekolah', 'Siap dikonfigurasi', 'Pengaturan'],
              ['Konten pembelajaran', `${localContent.length} item lokal`, 'Guru'],
              ['Akses rapor', `${homeroomAssignments.filter((item) => item.teacherId || item.teacherNip || item.teacherName).length} wali kelas`, 'Admin'],
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

function AdminWaliKelas({ notify }) {
  const classRows = useMemo(() => normalizeClassLookupRows(getLocalAdminCollection('classes', classes)), [])
  const teacherRows = useMemo(() => normalizeTeacherProfileRows(getLocalAdminProfiles('guru', teachers.map((teacher) => ({ ...teacher, role: 'guru' })))), [])
  const [rows, setRows] = useState(() => buildHomeroomAssignmentRows(classRows, teacherRows))
  const assignedCount = rows.filter((row) => row.teacherId || row.teacherNip || row.teacherName).length

  function updateTeacher(className, teacherId) {
    const teacher = teacherRows.find((item) => item.id === teacherId) || null
    setRows((current) => current.map((row) => (
      row.className === className
        ? {
          ...row,
          teacherId: teacher?.id || '',
          teacherNip: teacher?.nip || '',
          teacherName: teacher?.name || '',
          subject: teacher?.subject || '',
          updatedAt: new Date().toISOString(),
        }
        : row
    )))
  }

  function saveAssignments() {
    setHomeroomAssignments(rows)
    notify('Penugasan wali kelas tersimpan dan langsung tersinkron ke akun guru di perangkat ini.')
  }

  function clearAssignment(className) {
    setRows((current) => current.map((row) => (
      row.className === className
        ? { ...row, teacherId: '', teacherNip: '', teacherName: '', subject: '', updatedAt: new Date().toISOString() }
        : row
    )))
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Admin"
        title="Wali Kelas"
        description="Tentukan guru yang bertanggung jawab atas Rapor setiap rombel. Guru lain tetap menginput nilai di Daftar Nilai."
        action={<QuickActionButton icon={Save} label="Simpan wali kelas" onClick={saveAssignments} />}
      />

      <MetricStrip items={[
        { label: 'Rombel', value: rows.length, caption: 'kelas tersedia', icon: School },
        { label: 'Wali kelas', value: assignedCount, caption: 'sudah ditetapkan', icon: ClipboardList },
        { label: 'Guru mapel', value: teacherRows.length, caption: 'bisa input nilai', icon: UsersRound },
        { label: 'Akses Rapor', value: assignedCount, caption: 'akun wali kelas', icon: FileText },
      ]} />

      <DashboardPanel
        title="Penugasan wali kelas per rombel"
        description="Pilih satu wali kelas untuk tiap rombel. Hak akses Rapor mengikuti NIP/id guru yang dipilih di sini."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[#D9E6F5] text-xs uppercase tracking-[0.12em] text-[#64748B]">
                <th className="py-3 pr-3 font-black">Kelas</th>
                <th className="py-3 pr-3 font-black">Wali kelas</th>
                <th className="py-3 pr-3 font-black">NIP</th>
                <th className="py-3 pr-3 font-black">Mapel</th>
                <th className="py-3 pr-3 font-black">Akses</th>
                <th className="py-3 pr-3 font-black">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E6F5]">
              {rows.map((row) => (
                <tr key={row.className}>
                  <td className="py-3 pr-3 align-top">
                    <p className="font-black text-[#132437]">{row.className}</p>
                    <p className="text-xs font-semibold text-[#64748B]">{getClassStudentCount(row.className)} siswa</p>
                  </td>
                  <td className="py-3 pr-3 align-top">
                    <select
                      value={row.teacherId || ''}
                      onChange={(event) => updateTeacher(row.className, event.target.value)}
                      className={`${materialInputClass} min-w-[18rem]`}
                    >
                      <option value="">Belum ditetapkan</option>
                      {teacherRows.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 pr-3 align-top font-mono text-sm font-black text-[#17446E]">{row.teacherNip || '-'}</td>
                  <td className="py-3 pr-3 align-top text-sm font-semibold text-[#64748B]">{row.subject || '-'}</td>
                  <td className="py-3 pr-3 align-top">
                    <StatusBadge tone={row.teacherId || row.teacherNip ? 'green' : 'gray'}>
                      {row.teacherId || row.teacherNip ? 'Rapor aktif' : 'Belum aktif'}
                    </StatusBadge>
                  </td>
                  <td className="py-3 pr-3 align-top">
                    <button
                      type="button"
                      onClick={() => clearAssignment(row.className)}
                      className="rounded-xl bg-[#F8FBFF] px-3 py-2 text-xs font-black text-[#64748B] ring-1 ring-[#D9E6F5] transition hover:bg-rose-50 hover:text-rose-700"
                    >
                      Kosongkan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-xl bg-[#F8FBFF] p-3 text-sm font-semibold leading-6 text-[#64748B] ring-1 ring-[#D9E6F5]">
          Alur akses: Admin menetapkan wali kelas di halaman ini, guru mapel mengisi Daftar Nilai, lalu wali kelas membuka Rapor untuk melengkapi identitas, catatan wali kelas, dan cetak dokumen.
        </div>
      </DashboardPanel>
    </div>
  )
}

function normalizeTeacherProfileRows(rows = []) {
  const subjectRows = normalizeMaterialSubjectRows(subjects)
  return (Array.isArray(rows) ? rows : [])
    .filter((row) => row && (row.name || row.fullName))
    .map((row, index) => {
      const name = row.name || row.fullName || `Guru ${index + 1}`
      const nip = String(row.nip || row.username || '').trim()
      const subjectNames = getTeacherProfileSubjectNames(row, subjectRows)
      return {
        ...row,
        id: row.id || (nip ? `teacher-${nip}` : `teacher-${index + 1}`),
        name,
        email: row.email || '',
        nip,
        subjectIds: subjectNames.map((subjectName) => subjectRows.find((item) => sameSubjectName(item.name, subjectName))?.id).filter(Boolean),
        subjectNames,
        subject: subjectNames.join('; '),
        status: row.status || 'Aktif',
        role: 'guru',
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'id-ID'))
}

function buildHomeroomAssignmentRows(classRows = [], teacherRows = []) {
  const existingRows = getHomeroomAssignments()
  const existingByClass = new Map(existingRows.map((row) => [promoteClassName(row.className), row]))
  const baseClassRows = classRows.length ? classRows : normalizeClassLookupRows(classes)

  return baseClassRows.map((classItem) => {
    const className = promoteClassName(classItem.name || classItem.className)
    const existing = existingByClass.get(className) || {}
    const teacher = teacherRows.find((item) => (
      (existing.teacherId && item.id === existing.teacherId)
      || (existing.teacherNip && item.nip === existing.teacherNip)
      || (existing.teacherName && normalizeLookupText(item.name) === normalizeLookupText(existing.teacherName))
    ))

    return {
      id: existing.id || `homeroom-${className.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      className,
      teacherId: teacher?.id || existing.teacherId || '',
      teacherNip: teacher?.nip || existing.teacherNip || '',
      teacherName: teacher?.name || existing.teacherName || '',
      subject: teacher?.subject || existing.subject || '',
      updatedAt: existing.updatedAt || '',
    }
  })
}

function getClassStudentCount(className) {
  return getGradeRosterForClass(getGradebookRoster(), className).filter((student) => student.className === className).length
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
        setLocalAdminProfiles(role, localRows)
        setLookups({ classes: normalizeClassLookupRows(classes), subjects: normalizeMaterialSubjectRows(getLocalAdminCollection('subjects', subjects)) })
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
          setLookups({ classes: normalizeClassLookupRows(classRows.length > 0 ? classRows : classes), subjects: normalizeMaterialSubjectRows(subjectRows) })
          setError('')
        }
      } catch (loadError) {
        if (active) {
          const localRows = normalizeAdminProfileRows(role, getLocalAdminProfiles(role, fallbackRows))
          setRows(localRows)
          setLocalAdminProfiles(role, localRows)
          setLookups({ classes: normalizeClassLookupRows(classes), subjects: normalizeMaterialSubjectRows(getLocalAdminCollection('subjects', subjects)) })
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
      notify(`${title} tersimpan dan tersinkron ke semua akun di perangkat ini.`)
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
      notify('Data dihapus dan perubahan tersinkron ke semua akun di perangkat ini.')
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
      {editing && <ProfileForm key={editing.id || `new-${role}`} title={title} role={role} profile={editing} lookups={lookups} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label={`Memuat ${title.toLowerCase()} dari Supabase...`} /> : (
        <DataTable columns={[
          { key: 'name', label: 'Nama' },
          { key: 'email', label: 'Email' },
          ...(role === 'guru'
            ? [{ key: 'nip', label: 'NIP' }, { key: 'subject', label: 'Mapel', render: (row) => row.subject || '-' }]
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
    const subjectRows = normalizeMaterialSubjectRows(lookups.subjects)
    const subjectNames = getTeacherProfileSubjectNames(row, subjectRows)
    const subjectIds = subjectNames
      .map((subjectName) => subjectRows.find((item) => sameSubjectName(item.name, subjectName))?.id)
      .filter(Boolean)
    return {
      ...row,
      subjectId: subjectIds[0] || '',
      subjectIds,
      subjectNames,
      subject: subjectNames.join('; '),
    }
  }

  const classId = row.classId || row.class_id
  const classItem = normalizeClassLookupRows(lookups.classes).find((item) => item.id === classId)
  return { ...row, classId, className: classItem?.name || promoteClassName(row.className || row.class || row.class_name || '-') }
}

function ProfileForm({ title, role, profile, lookups, onCancel, onSave }) {
  const subjectRows = normalizeMaterialSubjectRows(lookups.subjects)
  const [form, setForm] = useState(() => ({
    ...profile,
    name: profile.name || profile.fullName || '',
    email: profile.email || '',
    status: profile.status || 'Aktif',
    subjectNames: role === 'guru' ? getTeacherProfileSubjectNames(profile, subjectRows) : [],
  }))

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function toggleSubject(subjectName) {
    setForm((current) => {
      const selected = Array.isArray(current.subjectNames) ? current.subjectNames : []
      return {
        ...current,
        subjectNames: selected.some((item) => sameSubjectName(item, subjectName))
          ? selected.filter((item) => !sameSubjectName(item, subjectName))
          : [...selected, subjectName],
      }
    })
  }

  function submitForm() {
    if (role !== 'guru') {
      onSave(form)
      return
    }

    const subjectNames = uniqueSubjectNames(form.subjectNames).filter(isMaterialSubjectName)
    const subjectIds = subjectNames
      .map((subjectName) => subjectRows.find((item) => sameSubjectName(item.name, subjectName))?.id)
      .filter(Boolean)
    onSave({
      ...form,
      subjectId: subjectIds[0] || '',
      subjectIds,
      subjectNames,
      subject: subjectNames.join('; '),
    })
  }

  return (
    <SectionCard className="mb-4">
      <h2 className="text-lg font-black text-gray-950">{profile.id ? `Edit ${title}` : `Tambah ${title}`}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-gray-700">Nama
          <input value={form.name || ''} onChange={(event) => updateField('name', event.target.value)} className="rounded-xl border border-purple-100 bg-galaxy-surface px-3 py-2.5 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Email <span className="font-semibold text-gray-400">(opsional)</span>
          <input type="email" value={form.email || ''} onChange={(event) => updateField('email', event.target.value)} className="rounded-xl border border-purple-100 bg-galaxy-surface px-3 py-2.5 outline-none focus:border-purple-300" />
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
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-bold text-gray-700">Mata pelajaran yang diampu</legend>
              <p className="mt-1 text-xs font-semibold text-gray-500">Pilih satu atau beberapa mapel yang memiliki materi di IsleLearn.</p>
              <div className="mt-2 grid max-h-64 gap-2 overflow-y-auto rounded-xl border border-purple-100 bg-galaxy-surface p-3 sm:grid-cols-2 lg:grid-cols-3">
                {subjectRows.map((subject) => {
                  const checked = (form.subjectNames || []).some((item) => sameSubjectName(item, subject.name))
                  return (
                    <label key={subject.id} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ring-1 transition ${checked ? 'bg-blue-50 text-[#17446E] ring-blue-200' : 'bg-white text-gray-600 ring-gray-200 hover:bg-gray-50'}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleSubject(subject.name)} className="h-4 w-4 accent-[#17446E]" />
                      <span>{subject.name}</span>
                    </label>
                  )
                })}
              </div>
              <p className="mt-2 text-xs font-black text-[#2F80D8]">{(form.subjectNames || []).length} mapel dipilih</p>
            </fieldset>
          </>
        )}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-xl px-3 py-2 text-xs font-extrabold text-gray-600 hover:bg-gray-50">Batal</button>
        <button onClick={submitForm} disabled={!String(form.name || '').trim()} className="rounded-xl bg-galaxy-action px-4 py-2.5 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">Simpan</button>
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
      notify('Kelas tersimpan dan tersinkron ke semua akun di perangkat ini.')
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
      notify('Kelas dihapus dan perubahan tersinkron ke semua akun di perangkat ini.')
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

function AdminMapel() {
  const navigate = useNavigate()
  const teacherRows = normalizeTeacherProfileRows(getLocalAdminProfiles('guru', teachers.map((teacher) => ({ ...teacher, role: 'guru' }))))
  const materialCountBySubject = schoolMaterials.reduce((counts, material) => {
    const key = normalizeLookupText(canonicalSubjectName(material.subject))
    counts.set(key, (counts.get(key) || 0) + 1)
    return counts
  }, new Map())
  const rows = normalizeMaterialSubjectRows(getLocalAdminCollection('subjects', subjects)).map((subject) => {
    const assignedTeachers = teacherRows
      .filter((teacher) => getTeacherProfileSubjectNames(teacher).some((teacherSubject) => sameSubjectName(teacherSubject, subject.name)))
      .map((teacher) => teacher.name)
    return {
      ...subject,
      materialCount: materialCountBySubject.get(normalizeLookupText(subject.name)) || 0,
      teacher: assignedTeachers.join(', ') || '-',
    }
  })

  return (
    <div>
      <PageHeader
        eyebrow="Mapel"
        title="Mata Pelajaran"
        description="Daftar mapel mengikuti katalog materi IsleLearn. Guru pengampu diatur melalui Data Guru."
        action={<QuickActionButton icon={UsersRound} label="Atur guru" onClick={() => navigate('/admin/guru')} />}
      />
      <DataTable columns={[
        { key: 'name', label: 'Nama Mapel' },
        { key: 'code', label: 'Kode' },
        { key: 'materialCount', label: 'Materi', render: (row) => `${row.materialCount} materi` },
        { key: 'teacher', label: 'Guru Pengampu' },
      ]} rows={rows} />
    </div>
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
