import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Award,
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
  isleclub,
  students,
  subjectProgress,
  subjects,
  teachers,
} from '../data/dummyData.js'
import { englishMaterials } from '../data/englishMaterials.js'
import {
  ActionList,
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
  TimelineList,
  Toast,
  ProgressRing,
} from '../components/ui.jsx'
import { AIChatPanel, AIGeneratorPanel, BadgeCard, DailyMissionCard, FlashcardDeck, LearningPath, IsleClubCorner } from '../components/learning.jsx'
import { fetchMaterialLookups, fetchMaterials, fetchStudentMaterialProgress, markMaterialCompleted, removeMaterial, saveMaterial } from '../services/materialService.js'
import { fetchQuestions, removeQuestion, saveQuestion } from '../services/questionService.js'
import { fetchQuizAttempts, fetchQuizQuestions, fetchQuizzes, fetchStudentRecord, removeQuiz, saveQuiz, submitQuizAttempt } from '../services/quizService.js'
import { exportBackupData, fetchAdminStudents, fetchAdminTeachers, fetchClasses, fetchSubjects, removeAdminStudent, removeAdminTeacher, removeClass, removeSubject, saveAdminStudent, saveAdminTeacher, saveClass, saveSubject } from '../services/adminService.js'
import { createAssignmentSubmission, fetchAssignmentSubmissions, fetchAssignments, removeAssignment, saveAssignment } from '../services/assignmentService.js'

const ContentStudio = lazy(() => import('./ContentStudio.jsx'))

export default function RolePage({ role, page }) {
  const { user, accessToken, supabaseEnabled } = useAuth()
  const [toast, setToast] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const notify = (message) => setToast(message)

  const content = useMemo(() => {
    if (role === 'siswa') return renderSiswa(page, user, notify, { accessToken, supabaseEnabled })
    if (role === 'guru') return renderGuru(page, user, notify, setConfirmOpen, { accessToken, supabaseEnabled })
    if (role === 'admin') return renderAdmin(page, notify, setConfirmOpen, { accessToken, supabaseEnabled })
    return renderPimpinan(page, notify)
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
  if (page === 'dashboard') return <GuruDashboard notify={notify} />
  if (page === 'kelas') return <GuruKelas />
  if (page === 'materi') return <GuruMateri user={user} notify={notify} appContext={appContext} />
  if (page === 'bank-soal') return <BankSoal user={user} notify={notify} appContext={appContext} />
  if (page === 'tugas') return <GuruTugas user={user} notify={notify} appContext={appContext} />
  if (page === 'kuis-live') return <KuisLive user={user} notify={notify} appContext={appContext} />
  if (page === 'studio-konten') {
    return (
      <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-500 shadow-soft">Memuat Siapkan Pembelajaran...</div>}>
        <ContentStudio user={user} notify={notify} />
      </Suspense>
    )
  }
  if (page === 'analisis-nilai') return <AnalisisNilai />
  if (page === 'remedial') return <RemedialPage notify={notify} />
  if (page === 'ai-generator') return <AIGeneratorPage />
  if (page === 'laporan') return <LaporanGuru notify={notify} />
  return <EmptyState />
}

function renderAdmin(page, notify, setConfirmOpen, appContext) {
  if (page === 'dashboard') return <AdminDashboard />
  if (page === 'guru') return <AdminProfiles role="guru" title="Data Guru" notify={notify} appContext={appContext} />
  if (page === 'siswa') return <AdminProfiles role="siswa" title="Data Siswa" notify={notify} appContext={appContext} />
  if (page === 'kelas') return <AdminKelas notify={notify} appContext={appContext} />
  if (page === 'mapel') return <AdminMapel notify={notify} appContext={appContext} />
  if (page === 'pengaturan') return <Pengaturan notify={notify} />
  if (page === 'laporan') return <LaporanSekolah notify={notify} />
  if (page === 'backup') return <BackupPage notify={notify} setConfirmOpen={setConfirmOpen} appContext={appContext} />
  return <EmptyState />
}

function renderPimpinan(page, notify) {
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
  const completedMaterials = getCompletedMaterials(userId)
  const practiceResults = getStoredResultsByPrefix('islelearn-practice-result-')
  const quizResults = getStoredResultsByPrefix(`islelearn-quiz-result-${userId}-`)
  const assignmentSubmissions = readLocalRowsByPrefix('islelearn-assignment-submissions-').filter((item) => item.userId === userId)
  const average = averageScore([...practiceResults, ...quizResults])
  const learningProgress = Math.min(100, completedMaterials.length * 20 + practiceResults.length * 10 + quizResults.length * 15 + assignmentSubmissions.length * 15)

  const classAssignments = assignments.filter((item) => !user?.className || item.className === user.className)
  const activeAssignments = classAssignments.filter((item) => ['Aktif', 'Terlambat'].includes(item.status))
  const activeQuizzes = quizzes.filter((item) => ['Berlangsung', 'Belum mulai'].includes(item.status))
  const continuingMaterials = getAvailablePublishedMaterials()
    .filter((item) => item.status !== 'Selesai')
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3)

  const metricItems = [
    { label: 'Progress', value: `${learningProgress}%`, caption: `${completedMaterials.length} materi selesai`, icon: BarChart3 },
    { label: 'Tugas', value: assignmentSubmissions.length, caption: 'submission tersimpan', icon: ClipboardCheck },
    { label: 'Aktivitas', value: practiceResults.length + quizResults.length, caption: 'latihan/kuis', icon: CalendarClock },
    { label: 'Rata-rata', value: average || '-', caption: average ? 'nilai tersimpan' : 'belum ada skor', icon: Award },
  ]

  const quickLinks = [
    { label: 'Materi', description: 'Lanjutkan materi dari guru', icon: BookOpen, onClick: () => navigate('/siswa/materi') },
    { label: 'Tugas', description: 'Cek dan kirim jawaban', icon: ClipboardCheck, onClick: () => navigate('/siswa/tugas') },
    { label: 'Kuis', description: 'Kerjakan kuis aktif', icon: FileQuestion, onClick: () => navigate('/siswa/kuis') },
    { label: 'AI Tutor', description: 'Tanya materi yang sulit', icon: Bot, onClick: () => navigate('/siswa/ai-tutor') },
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

  const activityItems = [
    ...activities.slice(0, 4),
    learningProgress === 0 ? 'Mulai satu materi untuk membuka rekomendasi belajar berikutnya.' : `${firstName} sudah mencapai ${learningProgress}% progres belajar.`,
  ]

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[1.6rem] sea-ink-panel p-5 text-white shadow-[0_20px_54px_rgba(15,31,42,0.16)]">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b9e4dc]">Today view · {user?.className || 'Kelas aktif'}</p>
            <h1 className="mt-3 text-balance text-3xl font-black leading-none tracking-[-0.02em] sm:text-4xl">
              Halo, {firstName}. Mulai dari yang paling penting dulu.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200/78">
              Buka materi lanjutan, cek tugas aktif, lalu kerjakan kuis yang sudah dibuka guru.
            </p>
          </div>

          <div className="rounded-2xl bg-white/[0.08] p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#b9e4dc]">Fokus hari ini</p>
                <p className="mt-1 text-lg font-black">Lanjutkan materi aktif</p>
              </div>
              <StatusBadge tone={learningProgress >= 70 ? 'green' : 'amber'}>{learningProgress}%</StatusBadge>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/14">
              <div className="h-2 rounded-full bg-[#f1c36d]" style={{ width: `${learningProgress}%` }} />
            </div>
            <button
              onClick={() => navigate('/siswa/materi')}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#f1c36d] px-4 text-sm font-black text-[#13232d] transition hover:-translate-y-0.5 hover:bg-[#ffd37f]"
            >
              <BookOpen size={17} /> Mulai belajar
            </button>
          </div>
        </div>
      </section>

      <MetricStrip items={metricItems} />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <CompactList
            title="Perlu dikerjakan"
            description="Tugas dan kuis aktif muncul sebagai antrean kerja, bukan kartu besar."
            items={priorityItems}
            emptyLabel="Tidak ada tugas atau kuis aktif saat ini."
          />

          <CompactList
            title="Lanjutkan belajar"
            description="Materi yang masih berjalan diprioritaskan agar progres tidak tercecer."
            items={materialItems}
          />
        </div>

        <div className="space-y-4">
          <ActionList items={quickLinks} />
          <TimelineList title="Aktivitas terbaru" items={activityItems} />
        </div>
      </div>
    </div>
  )
}


function LineChartIcon(props) {
  return <BarChart3 {...props} />
}

function KelasSaya() {
  return (
    <div>
      <PageHeader eyebrow="Kelas Saya" title="Pilih orbit kelasmu" description="Masuk ke kelas, lanjutkan materi, dan pantau progres tiap mata pelajaran." />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {subjects.slice(0, 5).map((subject, index) => (
          <SectionCard key={subject.id}>
            <StatusBadge>{subject.name}</StatusBadge>
            <h2 className="mt-3 text-lg font-black">{subject.name}</h2>
            <p className="mt-2 text-sm text-gray-500">Guru: {subject.teacher}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
              <span className="rounded-2xl bg-galaxy-surface p-3">{6 + index} materi</span>
              <span className="rounded-2xl bg-galaxy-surface p-3">{2 + index} tugas</span>
              <span className="rounded-2xl bg-galaxy-surface p-3">{64 + index * 5}%</span>
            </div>
            <button className="mt-5 w-full rounded-2xl bg-galaxy-action px-4 py-3 text-sm font-extrabold text-white">Masuk Kelas</button>
          </SectionCard>
        ))}
      </div>
    </div>
  )
}


function readLocalRowsByPrefix(prefix) {
  if (typeof localStorage === 'undefined') return []

  try {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(prefix))
      .flatMap((key) => {
        const rows = safeReadLocalJson(key, [])
        return Array.isArray(rows) ? rows : []
      })
      .filter((row) => !isLegacyDemoRow(row))
  } catch (error) {
    return []
  }
}

function isLegacyDemoRow(row) {
  return /^(material|question|assignment|quiz)-\d+$/.test(row?.id || '')
}

function safeReadLocalJson(key, fallback = null) {
  if (typeof localStorage === 'undefined') return fallback

  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback

    const parsed = JSON.parse(raw)

    if (Array.isArray(fallback)) {
      return Array.isArray(parsed) ? parsed : fallback
    }

    if (fallback && typeof fallback === 'object') {
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback
    }

    return parsed ?? fallback
  } catch (error) {
    return fallback
  }
}

function safeWriteLocalJson(key, value) {
  if (typeof localStorage === 'undefined') return false

  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    return false
  }
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
    ...englishMaterials,
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
  const subjectsFilter = ['Semua', ...Array.from(new Set(data.map((item) => item.subject))), 'Selesai', 'Dipelajari', 'Belum Mulai']
  const enriched = data.map((item) => {
    if (completedIds.includes(item.id)) return { ...item, status: 'Selesai', progress: 100 }
    if (item.status === 'Publish') return { ...item, status: Number(item.progress || 0) > 0 ? 'Dipelajari' : 'Belum Mulai' }
    return item
  })
  const filtered = enriched.filter((item) => (filter === 'Semua' || item.status === filter || item.subject === filter) && item.title.toLowerCase().includes(search.toLowerCase()))
  const materialFolders = getMaterialSubjectFolders(filtered).filter((folder) => folder.rows.length > 0)

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
    <div>
      <PageHeader eyebrow="Materi" title="Materi belajar" description={data.length > 0 ? 'Materi publish siap dibaca siswa.' : 'Materi akan muncul setelah guru publish.'} />
      {error && <div className="mb-4 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data materi: {error}. Data lokal tetap ditampilkan.</div>}
      <SearchFilterBar search={search} setSearch={setSearch} filters={subjectsFilter} activeFilter={filter} setActiveFilter={setFilter} />
      {loading ? <LoadingState label="Memuat materi dari Supabase..." /> : (
        filtered.length > 0 ? (
          <section className="space-y-3">
            {materialFolders.map((folder) => (
              <details key={folder.key} open className="overflow-hidden rounded-[1.15rem] border border-[#123c3b]/10 bg-white/86 shadow-[0_14px_44px_rgba(15,31,42,0.06)]">
                <summary className="flex cursor-pointer list-none flex-col gap-2 bg-[#fbfaf7]/78 px-4 py-3 transition hover:bg-[#f7f4ee] sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0f766e]">Mata pelajaran</p>
                    <h2 className="text-lg font-black text-[#13232d]">{folder.name}</h2>
                  </div>
                  <StatusBadge tone="teal">{folder.rows.length} materi</StatusBadge>
                </summary>
                <div className="space-y-3 border-t border-[#123c3b]/8 p-3">
                  {folder.gradeFolders.map((gradeFolder) => (
                    <StudentMaterialGradeFolder
                      key={gradeFolder.key}
                      gradeFolder={gradeFolder}
                      onOpen={setSelected}
                      notify={notify}
                    />
                  ))}
                </div>
              </details>
            ))}
          </section>
        ) : (
          <EmptyState title="Belum ada materi di pulau ini." description="Guru akan segera menambahkan materi baru untuk kelasmu." />
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
  'Matematika',
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

function MaterialCard({ item, onOpen, notify }) {
  const navigate = useNavigate()
  return (
    <SectionCard>
      <div className="mb-4 flex items-center justify-between gap-2">
        <StatusBadge tone="cyan">{item.subject}</StatusBadge>
        <StatusBadge tone={item.status === 'Selesai' ? 'green' : 'amber'}>{item.status}</StatusBadge>
      </div>
      <h2 className="text-lg font-black text-gray-950">{item.title}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-500">{item.description}</p>
      <div className="mt-4 h-2 rounded-full bg-galaxy-lavender"><div className="h-2 rounded-full bg-galaxy-action" style={{ width: `${item.progress}%` }} /></div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button onClick={onOpen} className="rounded-2xl bg-galaxy-deep px-4 py-3 text-sm font-bold text-white">Lanjutkan</button>
        <button onClick={() => navigate('/siswa/ai-tutor')} className="rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-extrabold text-galaxy-purple">Tanya AI</button>
      </div>
    </SectionCard>
  )
}

function StudentMaterialGradeFolder({ gradeFolder, onOpen, notify }) {
  const hasRows = gradeFolder.rows.length > 0

  return (
    <details open={hasRows} className="overflow-hidden rounded-[0.95rem] border border-[#123c3b]/10 bg-[#fbfaf7]/72">
      <summary className="flex cursor-pointer list-none flex-col gap-2 px-3 py-2.5 transition hover:bg-[#f7f4ee] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Tingkat</p>
          <h3 className="text-base font-black text-[#13232d]">{gradeFolder.name}</h3>
        </div>
        <StatusBadge tone={hasRows ? 'green' : 'gray'}>{gradeFolder.rows.length} materi</StatusBadge>
      </summary>

      <div className="border-t border-[#123c3b]/8 p-3">
        {hasRows ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {gradeFolder.rows.map((item) => (
              <MaterialCard key={item.id} item={item} onOpen={() => onOpen(item)} notify={notify} />
            ))}
          </div>
        ) : (
          <p className="rounded-[0.85rem] bg-white/78 px-3 py-2 text-sm font-semibold text-slate-500 ring-1 ring-[#123c3b]/8">
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

function isExternalMaterialType(type) {
  return ['Link', 'Video', 'PDF'].includes(type)
}

function isHtmlMaterialType(type) {
  return type === 'HTML'
}

function isLinkedMaterialType(type) {
  return isExternalMaterialType(type) || isHtmlMaterialType(type)
}

function isValidMaterialUrl(value) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch (error) {
    return false
  }
}

function isValidMaterialPath(value) {
  return /^\/materials\/.+\.html(?:[?#].*)?$/i.test(String(value || '').trim())
}

function isValidLinkedMaterial(value, type) {
  if (isHtmlMaterialType(type)) return isValidMaterialUrl(value) || isValidMaterialPath(value)
  if (isExternalMaterialType(type)) return isValidMaterialUrl(value)
  return true
}

function MaterialDetail({ item, onBack, onComplete, notify }) {
  const navigate = useNavigate()
  const sections = buildMaterialLearningSections(item)
  const progress = Number(item.progress || 0)
  const completed = item.status === 'Selesai' || progress >= 100
  const htmlMaterial = isHtmlMaterialType(item.type) && isValidLinkedMaterial(item.content, item.type)
  const externalMaterial = !htmlMaterial && isExternalMaterialType(item.type) && isValidMaterialUrl(item.content)

  return (
    <div>
      <PageHeader eyebrow={item.subject} title={item.title} description={`${item.className} · ${item.topic} · ${item.type || 'Teks'} · Ringan dibuka`} action={<button onClick={onBack} className="rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-extrabold text-galaxy-purple">Kembali</button>} />
      <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
        <SectionCard>
          <StatusBadge tone={item.status === 'Selesai' ? 'green' : 'cyan'}>{item.status}</StatusBadge>
          {htmlMaterial && (
            <div className="mt-5 overflow-hidden rounded-[1rem] border border-[#123c3b]/10 bg-white shadow-[0_14px_44px_rgba(15,31,42,0.06)]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#123c3b]/8 bg-[#fbfaf7] px-3 py-2">
                <StatusBadge tone="teal">HTML interaktif</StatusBadge>
                <a href={item.content} target="_blank" rel="noreferrer" className="rounded-[0.75rem] bg-[#e8f4ef] px-3 py-1.5 text-xs font-black text-[#0f766e] ring-1 ring-[#0f766e]/10">
                  Buka layar penuh
                </a>
              </div>
              <iframe
                title={item.title}
                src={item.content}
                className="h-[78vh] w-full bg-[#f7f4ee]"
                sandbox="allow-scripts allow-same-origin"
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

function getCompletedMaterials(userId) {
  return safeReadLocalJson(`islelearn-material-progress-${userId || 'demo'}`, [])
}

function setCompletedMaterials(userId, ids) {
  safeWriteLocalJson(`islelearn-material-progress-${userId || 'demo'}`, Array.isArray(ids) ? ids : [])
}

function assignmentSubmissionStorageKey(assignmentId) {
  return `islelearn-assignment-submissions-${assignmentId || 'unknown'}`
}

function getLocalAssignmentSubmissions(assignmentId) {
  return safeReadLocalJson(assignmentSubmissionStorageKey(assignmentId), [])
}

function getLocalAssignmentSubmission(assignmentId, userId) {
  return getLocalAssignmentSubmissions(assignmentId).find((item) => item.userId === (userId || 'demo')) || null
}

function saveLocalAssignmentSubmission(assignmentId, submission) {
  const rows = getLocalAssignmentSubmissions(assignmentId)
  const nextRows = rows.some((item) => item.userId === submission.userId)
    ? rows.map((item) => item.userId === submission.userId ? submission : item)
    : [submission, ...rows]

  safeWriteLocalJson(assignmentSubmissionStorageKey(assignmentId), nextRows)
  return nextRows
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

function getQuizResult(quizId, userId) {
  return safeReadLocalJson(`islelearn-quiz-result-${userId || 'demo'}-${quizId}`, null)
}

function saveQuizResult(quizId, userId, result) {
  safeWriteLocalJson(`islelearn-quiz-result-${userId || 'demo'}-${quizId}`, result || {})
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

function getStoredResultsByPrefix(prefix) {
  if (typeof localStorage === 'undefined') return []

  try {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(prefix))
      .map((key) => {
        const item = safeReadLocalJson(key, null)
        return item && typeof item === 'object' ? item : null
      })
      .filter((item) => item && typeof item.score === 'number')
  } catch (error) {
    return []
  }
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
        <SectionCard className="mb-4 bg-gradient-to-r from-[#e8f4ef] to-cyan-50">
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
              <Line type="monotone" dataKey="nilai" stroke="#0F766E" strokeWidth={3} />
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

function GuruDashboard({ notify }) {
  const navigate = useNavigate()
  const teacherMaterials = readLocalRowsByPrefix('islelearn-teacher-materials-')
  const teacherAssignments = readLocalRowsByPrefix('islelearn-teacher-assignments-')
  const teacherQuestions = readLocalRowsByPrefix('islelearn-teacher-questions-')
  const teacherQuizzes = readLocalRowsByPrefix('islelearn-teacher-quizzes-')
  const assignmentSubmissions = readLocalRowsByPrefix('islelearn-assignment-submissions-')
  const isStatus = (item, status) => String(item?.status || '').toLowerCase() === status.toLowerCase()
  const draftMaterials = teacherMaterials.filter((item) => isStatus(item, 'Draft'))
  const publishedMaterials = teacherMaterials.filter((item) => isStatus(item, 'Publish'))
  const activeAssignments = teacherAssignments.filter((item) => isStatus(item, 'Aktif'))
  const draftAssignments = teacherAssignments.filter((item) => !isStatus(item, 'Aktif'))
  const draftQuizzes = teacherQuizzes.filter((item) => isStatus(item, 'Draft'))
  const publishedQuizzes = teacherQuizzes.filter((item) => isStatus(item, 'Publish'))
  const ungradedSubmissions = assignmentSubmissions.filter((item) => item.score === undefined || item.score === null || item.score === '')
  const draftTotal = draftMaterials.length + draftAssignments.length + draftQuizzes.length
  const openWorkTotal = draftTotal + activeAssignments.length + ungradedSubmissions.length
  const hasTeacherData = teacherMaterials.length > 0 || teacherAssignments.length > 0 || teacherQuestions.length > 0 || teacherQuizzes.length > 0 || assignmentSubmissions.length > 0

  const metricItems = [
    { label: 'Perlu dipublish', value: draftTotal, caption: 'draft materi/tugas/kuis', icon: Send },
    { label: 'Tugas aktif', value: activeAssignments.length, caption: 'sedang berjalan', icon: ClipboardCheck },
    { label: 'Submission', value: assignmentSubmissions.length, caption: `${ungradedSubmissions.length} belum dinilai`, icon: FileText },
    { label: 'Bank soal', value: teacherQuestions.length, caption: 'siap dipakai ulang', icon: FileQuestion },
    { label: 'Kuis publish', value: publishedQuizzes.length, caption: `${draftQuizzes.length} draft kuis`, icon: PlayCircle },
  ]

  const quickActions = [
    { label: 'Siapkan Pembelajaran', description: 'Rancang pertemuan dari kebutuhan kelas', icon: Sparkles, onClick: () => navigate('/guru/studio-konten') },
    { label: 'Materi', description: `${publishedMaterials.length} publish · ${draftMaterials.length} draft`, icon: BookOpen, onClick: () => navigate('/guru/materi') },
    { label: 'Tugas', description: `${activeAssignments.length} aktif · ${draftAssignments.length} draft`, icon: ClipboardList, onClick: () => navigate('/guru/tugas') },
    { label: 'Bank Soal', description: `${teacherQuestions.length} soal tersimpan`, icon: FileQuestion, onClick: () => navigate('/guru/bank-soal') },
    { label: 'Kuis Live', description: `${publishedQuizzes.length} publish · ${draftQuizzes.length} draft`, icon: PlayCircle, onClick: () => navigate('/guru/kuis-live') },
    { label: 'Analisis', description: 'Tentukan remedial dan pengayaan', icon: LineChartIcon, onClick: () => navigate('/guru/analisis-nilai') },
  ]

  const priorityItems = hasTeacherData ? [
    {
      id: 'publish-content',
      title: draftTotal > 0 ? `${draftTotal} draft perlu dicek sebelum tampil ke siswa` : 'Belum ada draft yang menunggu publish',
      eyebrow: 'Sebelum siswa melihat',
      meta: draftTotal > 0 ? 'Review instruksi, contoh, dan status publish.' : 'Buat bahan ajar atau tugas dari Siapkan Pembelajaran.',
      status: draftTotal > 0 ? 'Review' : 'Kosong',
      icon: Send,
      actionLabel: draftTotal > 0 ? 'Cek' : 'Mulai',
      onClick: () => navigate(draftTotal > 0 ? '/guru/materi' : '/guru/studio-konten'),
    },
    {
      id: 'assignment-monitoring',
      title: activeAssignments.length > 0 ? `${activeAssignments.length} tugas aktif perlu dipantau` : 'Tidak ada tugas aktif saat ini',
      eyebrow: 'Saat pembelajaran berjalan',
      meta: activeAssignments.length > 0 ? `${assignmentSubmissions.length} submission terbaca di perangkat.` : 'Aktifkan tugas saat aktivitas siswa sudah siap.',
      status: activeAssignments.length > 0 ? 'Pantau' : 'Tenang',
      icon: ClipboardCheck,
      actionLabel: 'Tugas',
      onClick: () => navigate('/guru/tugas'),
    },
    {
      id: 'feedback-loop',
      title: ungradedSubmissions.length > 0 ? `${ungradedSubmissions.length} submission belum dinilai` : 'Belum ada submission yang perlu dinilai',
      eyebrow: 'Umpan balik',
      meta: ungradedSubmissions.length > 0 ? 'Berikan nilai atau komentar singkat agar siswa tahu langkah berikutnya.' : 'Submission siswa akan muncul setelah tugas dikerjakan.',
      status: ungradedSubmissions.length > 0 ? 'Nilai' : 'Kosong',
      icon: PencilLine,
      actionLabel: 'Buka',
      onClick: () => navigate('/guru/tugas'),
    },
    {
      id: 'next-meeting',
      title: 'Siapkan pertemuan belajar berikutnya',
      eyebrow: 'Rencana mengajar',
      meta: 'Mulai dari kelas, topik, tujuan, dan kebutuhan siswa.',
      status: 'Siap',
      icon: Sparkles,
      actionLabel: 'Rancang',
      onClick: () => navigate('/guru/studio-konten'),
    },
  ] : [
    {
      id: 'start-teaching-flow',
      title: 'Siapkan pertemuan pertama',
      eyebrow: 'Mulai kerja guru',
      meta: 'Isi kelas, mapel, topik, tujuan, dan kebutuhan siswa.',
      status: 'Mulai',
      icon: Sparkles,
      actionLabel: 'Rancang',
      onClick: () => navigate('/guru/studio-konten'),
    },
    {
      id: 'create-material',
      title: 'Buat bahan ajar yang bisa langsung dibaca siswa',
      eyebrow: 'Bahan belajar',
      meta: 'Materi tidak masuk Bank Soal, Kuis, atau Tugas.',
      status: 'Belum ada',
      icon: BookOpen,
      actionLabel: 'Materi',
      onClick: () => navigate('/guru/studio-konten'),
    },
    {
      id: 'check-understanding',
      title: 'Tambahkan cek pemahaman setelah materi siap',
      eyebrow: 'Asesmen ringan',
      meta: 'Gunakan tugas, kuis, atau soal hanya saat tujuan belajarnya jelas.',
      status: 'Nanti',
      icon: Target,
      actionLabel: 'Siapkan',
      onClick: () => navigate('/guru/studio-konten'),
    },
  ]

  const rhythmCards = [
    {
      title: '1. Siapkan',
      text: 'Rancang pertemuan dari konteks kelas, tujuan, kesiapan siswa, dan bahan guru.',
      meta: hasTeacherData ? `${draftTotal} draft menunggu keputusan` : 'Belum ada draft',
      icon: Sparkles,
      action: 'Siapkan Pembelajaran',
      onClick: () => navigate('/guru/studio-konten'),
    },
    {
      title: '2. Bagikan',
      text: 'Publish materi, aktifkan tugas, atau jadwalkan kuis hanya setelah instruksi jelas.',
      meta: `${publishedMaterials.length} materi publish · ${activeAssignments.length} tugas aktif`,
      icon: Send,
      action: 'Kelola materi',
      onClick: () => navigate('/guru/materi'),
    },
    {
      title: '3. Tindak lanjut',
      text: 'Baca hasil kerja siswa, beri umpan balik, lalu pilih remedial atau pengayaan.',
      meta: `${assignmentSubmissions.length} submission · ${teacherQuestions.length} soal`,
      icon: ClipboardCheck,
      action: 'Pantau tugas',
      onClick: () => navigate('/guru/tugas'),
    },
  ]

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[1.35rem] bg-white shadow-[0_18px_60px_rgba(15,31,42,0.08)] ring-1 ring-[#123c3b]/10">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="sea-ink-panel p-5 text-white sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b9e4dc]">Ruang kerja guru</p>
            <h1 className="mt-3 text-balance text-3xl font-black leading-none tracking-[-0.02em] sm:text-4xl">
              {openWorkTotal > 0 ? `${openWorkTotal} pekerjaan terbuka.` : 'Mulai dari pertemuan berikutnya.'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200/78">
              Dashboard ini membaca data nyata yang sudah dibuat guru. Tidak ada data contoh; kalau masih kosong, alurnya mulai dari menyiapkan pembelajaran.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/guru/studio-konten')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#f1c36d] px-4 text-sm font-black text-[#13232d] transition hover:-translate-y-0.5 hover:bg-[#ffd37f]"
              >
                <Sparkles size={17} /> Siapkan Pembelajaran
              </button>
              <button
                onClick={() => navigate('/guru/tugas')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-black text-white ring-1 ring-white/15 transition hover:bg-white/15"
              >
                <ClipboardCheck size={17} /> Pantau Tugas
              </button>
            </div>
          </div>

          <div className="bg-[#f7f4ee]/78 p-4 sm:p-5">
            <p className="text-sm font-black text-[#13232d]">Keputusan hari ini</p>
            <div className="mt-3 grid gap-2">
              {[
                ['Draft menunggu', draftTotal, draftTotal > 0 ? 'Cek dan publish yang sudah layak.' : 'Tidak ada draft tertahan.'],
                ['Aktivitas berjalan', activeAssignments.length + publishedQuizzes.length, activeAssignments.length || publishedQuizzes.length ? 'Pantau tugas atau kuis aktif.' : 'Belum ada aktivitas aktif.'],
                ['Umpan balik', ungradedSubmissions.length, ungradedSubmissions.length > 0 ? 'Nilai submission siswa.' : 'Belum ada submission menunggu.'],
              ].map(([label, value, text]) => (
                <div key={label} className="flex items-center gap-3 rounded-[0.95rem] bg-white px-3 py-3 ring-1 ring-[#123c3b]/8">
                  <span className="font-mono text-2xl font-black text-[#0f766e]">{value}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black text-[#13232d]">{label}</span>
                    <span className="block truncate text-xs font-semibold text-slate-500">{text}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <MetricStrip items={metricItems} />

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <CompactList
          title="Antrean kerja"
          description={hasTeacherData ? 'Urutan kerja yang perlu diputuskan guru berdasarkan data yang ada.' : 'Belum ada data kelas atau konten. Mulai dari pertemuan pertama.'}
          items={priorityItems}
        />

        <section className="rounded-[1.15rem] border border-[#123c3b]/10 bg-white/88 p-4 shadow-[0_14px_44px_rgba(15,31,42,0.065)]">
          <h2 className="text-lg font-black tracking-[-0.01em] text-[#13232d]">Ritme mengajar</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Satu siklus kerja yang lebih dekat dengan rutinitas guru.</p>
          <div className="mt-4 grid gap-3">
            {rhythmCards.map(({ title, text, meta, icon: Icon, action, onClick }) => (
              <article key={title} className="rounded-[1rem] bg-[#f7f4ee]/78 p-3 ring-1 ring-[#123c3b]/8">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-[0.85rem] bg-[#e8f4ef] text-[#0f766e] ring-1 ring-[#0f766e]/10">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-black text-[#13232d]">{title}</h3>
                      <StatusBadge tone="teal">{meta}</StatusBadge>
                    </div>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{text}</p>
                    <button onClick={onClick} className="mt-3 rounded-[0.8rem] bg-white px-3 py-2 text-xs font-black text-[#0f766e] ring-1 ring-[#123c3b]/10 transition hover:bg-[#e8f4ef]">
                      {action}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
        <TimelineList
          title="Alur cepat"
          items={[
            'Siapkan pertemuan dari kelas, topik, tujuan, dan kebutuhan siswa.',
            'Review hasil, lalu kirim ke Materi, Bank Soal, Tugas, atau Kuis.',
            'Publish agar siswa bisa melihat dan mengerjakan.',
            'Baca submission atau hasil kuis untuk menentukan tindak lanjut.',
          ]}
        />
        <ActionList items={quickActions} />
      </section>
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
  const englishScope = !normalizedSubject || normalizedSubject === normalizeLookupText('Bahasa Inggris') || normalizedSubject.includes('inggris')

  if (!englishScope) return []

  return englishMaterials.map((item) => ({
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
  const filledFolderCount = subjectFolders.filter((folder) => folder.rows.length > 0).length
  const gradeSubfolderCount = subjectFolders.reduce((total, folder) => total + folder.gradeFolders.length, 0)
  const filledGradeSubfolderCount = subjectFolders.reduce((total, folder) => total + folder.gradeFolders.filter((gradeFolder) => gradeFolder.rows.length > 0).length, 0)
  const localMode = !appContext?.accessToken || !isUuid(user?.id)
  const sourceLabel = localMode ? 'Preview lokal' : 'Supabase'

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

      <section className="mb-4 flex flex-col gap-3 rounded-[1.15rem] border border-[#123c3b]/10 bg-white/80 px-4 py-3 shadow-[0_12px_36px_rgba(15,31,42,0.055)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs font-black text-[#13232d]">
          <span className="inline-flex items-center gap-1.5 rounded-[0.75rem] bg-[#e8f4ef] px-3 py-1.5 text-[#0f766e] ring-1 ring-[#0f766e]/10">
            <BookOpen size={14} /> {rows.length} materi
          </span>
          <span className="rounded-[0.75rem] bg-[#f7f4ee] px-3 py-1.5 text-slate-600 ring-1 ring-[#123c3b]/8">{subjectFolders.length} folder mapel</span>
          <span className="rounded-[0.75rem] bg-[#f7f4ee] px-3 py-1.5 text-slate-600 ring-1 ring-[#123c3b]/8">{filledGradeSubfolderCount}/{gradeSubfolderCount} subfolder kelas terisi</span>
          <span className="rounded-[0.75rem] bg-[#f7f4ee] px-3 py-1.5 text-slate-600 ring-1 ring-[#123c3b]/8">{filledFolderCount} folder terisi</span>
          <span className="rounded-[0.75rem] bg-[#f7f4ee] px-3 py-1.5 text-slate-600 ring-1 ring-[#123c3b]/8">{publishedCount} publish</span>
          <span className="rounded-[0.75rem] bg-[#f7f4ee] px-3 py-1.5 text-slate-600 ring-1 ring-[#123c3b]/8">{draftCount} draft</span>
        </div>
        <p className="text-xs font-bold text-slate-500">
          Sumber data: <span className="text-[#0f766e]">{sourceLabel}</span>
        </p>
      </section>

      {error && <div className="mb-4 rounded-[1rem] bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data materi: {error}. Data lokal mapel guru ditampilkan.</div>}
      
      {editing && <MaterialForm material={editing} lookups={lookups} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label="Memuat materi guru dari Supabase..." /> : (
        <section className="space-y-3">
          {subjectFolders.map((folder) => (
            <details
              key={folder.key}
              open={folder.rows.length > 0 || folder.key === normalizeLookupText('Bahasa Inggris')}
              className="group overflow-hidden rounded-[1.15rem] border border-[#123c3b]/10 bg-white/86 shadow-[0_14px_44px_rgba(15,31,42,0.06)]"
            >
              <summary className="flex cursor-pointer list-none flex-col gap-3 bg-[#fbfaf7]/78 px-4 py-3 transition hover:bg-[#f7f4ee] sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-[0.9rem] bg-[#e8f4ef] text-[#0f766e] ring-1 ring-[#0f766e]/10">
                    <BookOpen size={19} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0f766e]">Folder mata pelajaran</p>
                    <h2 className="truncate text-lg font-black text-[#13232d]">{folder.name}</h2>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                      {folder.rows.length > 0 ? `${folder.rows.length} materi tersedia` : 'Belum ada materi untuk mapel ini.'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <StatusBadge tone={folder.rows.length > 0 ? 'green' : 'gray'}>{folder.rows.length} materi</StatusBadge>
                  <StatusBadge tone="teal">{folder.publishedCount} publish</StatusBadge>
                  {folder.draftCount > 0 && <StatusBadge tone="amber">{folder.draftCount} draft</StatusBadge>}
                </div>
              </summary>

              <div className="space-y-3 border-t border-[#123c3b]/8 p-3">
                {folder.gradeFolders.map((gradeFolder) => (
                  <TeacherMaterialGradeFolder
                    key={gradeFolder.key}
                    subjectName={folder.name}
                    gradeFolder={gradeFolder}
                    lookups={lookups}
                    onAdd={() => setEditing(emptyMaterial(lookups, folder.name, gradeFolder.name))}
                    onEdit={setEditing}
                    onToggleStatus={(row) => handleSave({ ...row, status: row.status === 'Publish' ? 'Draft' : 'Publish' })}
                    onDelete={setDeleting}
                  />
                ))}
              </div>
            </details>
          ))}
        </section>
      )}
      <ConfirmDialog open={Boolean(deleting)} title="Hapus materi?" description={`Materi "${deleting?.title || ''}" akan dihapus. Aksi ini membutuhkan konfirmasi.`} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  )
}

function TeacherMaterialGradeFolder({ subjectName, gradeFolder, onAdd, onEdit, onToggleStatus, onDelete }) {
  const hasRows = gradeFolder.rows.length > 0

  return (
    <details open={hasRows} className="overflow-hidden rounded-[0.95rem] border border-[#123c3b]/10 bg-[#fbfaf7]/72">
      <summary className="flex cursor-pointer list-none flex-col gap-2 px-3 py-2.5 transition hover:bg-[#f7f4ee] sm:flex-row sm:items-center sm:justify-between">
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

      <div className="border-t border-[#123c3b]/8">
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
            <button onClick={onAdd} className="inline-flex items-center justify-center gap-1.5 rounded-[0.85rem] bg-[#e8f4ef] px-3 py-2 text-xs font-black text-[#0f766e] ring-1 ring-[#0f766e]/10 transition hover:bg-[#d9eee8]">
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
    <article className="grid gap-3 border-b border-[#123c3b]/8 p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
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
        <button onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-[#f7f4ee] px-3 py-2 text-xs font-black text-[#0f766e] ring-1 ring-[#123c3b]/8 transition hover:bg-[#e8f4ef]">
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

const materialInputClass = 'w-full rounded-[0.9rem] border border-[#123c3b]/10 bg-white/86 px-3 py-2.5 text-sm font-semibold text-[#13232d] outline-none transition placeholder:text-slate-400 focus:border-[#0f766e] focus:bg-white focus:ring-4 focus:ring-[#0f766e]/10'
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
    <section className="mb-5 overflow-hidden rounded-[1.15rem] border border-[#123c3b]/10 bg-white/88 shadow-[0_16px_48px_rgba(15,31,42,0.07)] backdrop-blur-xl">
      <header className="flex flex-col gap-3 border-b border-[#123c3b]/8 bg-[#fbfaf7]/78 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-[0.9rem] bg-[#e8f4ef] text-[#0f766e] ring-1 ring-[#0f766e]/10">
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
              Untuk HTML, gunakan path /materials/...html atau URL lengkap. Untuk PDF, Video, dan Link, gunakan URL lengkap yang diawali http atau https.
            </div>
          )}
          {publishNeedsContent && (
            <div className="rounded-[0.9rem] bg-amber-50 px-3 py-2.5 text-sm font-bold leading-6 text-amber-800 ring-1 ring-amber-100">
              Publish membutuhkan isi materi atau URL agar siswa tidak melihat halaman kosong.
            </div>
          )}
        </div>

        <aside className="space-y-4 border-t border-[#123c3b]/8 bg-[#f7f4ee]/58 p-4 lg:border-l lg:border-t-0">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0f766e]">Jenis materi</p>
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
                        ? 'bg-[#123c3b] text-white ring-[#123c3b]'
                        : 'bg-white text-slate-600 ring-[#123c3b]/10 hover:bg-[#e8f4ef] hover:text-[#0f766e]'
                    }`}
                  >
                    <TypeIcon size={14} /> {type}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0f766e]">Status</p>
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
                        ? 'bg-[#123c3b] text-white ring-[#123c3b]'
                        : 'bg-white text-slate-600 ring-[#123c3b]/10 hover:bg-[#e8f4ef] hover:text-[#0f766e]'
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

      <footer className="flex flex-col-reverse gap-2 border-t border-[#123c3b]/8 bg-white/72 px-4 py-3 sm:flex-row sm:justify-end">
        <button onClick={onCancel} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-100">
          <X size={16} /> Batal
        </button>
        <button onClick={() => onSave(form)} disabled={!validMaterial} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] bg-[#123c3b] px-4 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(15,31,42,0.14)] transition hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:opacity-45">
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

function teacherQuestionStorageKey(user, teacherSubject) {
  return `islelearn-teacher-questions-${user?.id || teacherSubject || 'demo'}`
}

function getLocalTeacherQuestions(user, teacherSubject) {
  const key = teacherQuestionStorageKey(user, teacherSubject)
  const storedRows = safeReadLocalJson(key, null)

  if (Array.isArray(storedRows)) {
    return storedRows.filter((row) => !isLegacyDemoRow(row))
  }

  return []
}

function setLocalTeacherQuestions(user, teacherSubject, rows) {
  safeWriteLocalJson(teacherQuestionStorageKey(user, teacherSubject), Array.isArray(rows) ? rows : [])
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

      <section className="mb-4 flex flex-col gap-3 rounded-[1.15rem] border border-[#123c3b]/10 bg-white/80 px-4 py-3 shadow-[0_12px_36px_rgba(15,31,42,0.055)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs font-black text-[#13232d]">
          <span className="inline-flex items-center gap-1.5 rounded-[0.75rem] bg-[#e8f4ef] px-3 py-1.5 text-[#0f766e] ring-1 ring-[#0f766e]/10">
            <FileQuestion size={14} /> {rows.length} soal
          </span>
          <span className="rounded-[0.75rem] bg-[#f7f4ee] px-3 py-1.5 text-slate-600 ring-1 ring-[#123c3b]/8">{multipleChoiceCount} pilihan ganda</span>
          <span className="rounded-[0.75rem] bg-[#f7f4ee] px-3 py-1.5 text-slate-600 ring-1 ring-[#123c3b]/8">{essayCount} uraian/isian</span>
        </div>
        <p className="text-xs font-bold text-slate-500">
          Sumber data: <span className="text-[#0f766e]">{sourceLabel}</span>
        </p>
      </section>

      {error && <div className="mb-4 rounded-[1rem] bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data soal: {error}. Data lokal mapel guru ditampilkan.</div>}
      {editing && <QuestionForm question={editing} lookups={lookups} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label="Memuat bank soal dari Supabase..." /> : rows.length > 0 ? (
        <section className="overflow-hidden rounded-[1.15rem] border border-[#123c3b]/10 bg-white/86 shadow-[0_14px_44px_rgba(15,31,42,0.06)]">
          {rows.map((row) => (
            <article key={row.id} className="grid gap-3 border-b border-[#123c3b]/8 p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
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
                <button onClick={() => setEditing(row)} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-[#f7f4ee] px-3 py-2 text-xs font-black text-[#0f766e] ring-1 ring-[#123c3b]/8 transition hover:bg-[#e8f4ef]">
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

function QuestionForm({ question, lookups, onCancel, onSave }) {
  const [form, setForm] = useState({
    ...question,
    optionsText: (question.options || []).join('\n'),
  })
  const subjectsList = lookups.subjects.length > 0 ? lookups.subjects : [{ id: '', name: question.subject || 'Mapel belum dipilih' }]
  const classesList = lookups.classes.length > 0 ? lookups.classes : [{ id: '', name: question.className || 'Semua kelas' }]
  const options = form.optionsText.split('\n').map((item) => item.trim()).filter(Boolean)
  const isMultipleChoice = form.type === 'Pilihan ganda'
  const validQuestion = form.questionText.trim()
    && form.correctAnswer.trim()
    && (!isMultipleChoice || options.length >= 2)
    && (!isMultipleChoice || options.includes(form.correctAnswer.trim()))

  useEffect(() => {
    setForm({
      ...question,
      optionsText: (question.options || []).join('\n'),
    })
  }, [question])

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

  function submit() {
    if (!validQuestion) return
    onSave({
      ...form,
      options,
    })
  }

  return (
    <section className="mb-5 overflow-hidden rounded-[1.15rem] border border-[#123c3b]/10 bg-white/88 shadow-[0_16px_48px_rgba(15,31,42,0.07)] backdrop-blur-xl">
      <header className="flex flex-col gap-3 border-b border-[#123c3b]/8 bg-[#fbfaf7]/78 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-[0.9rem] bg-[#e8f4ef] text-[#0f766e] ring-1 ring-[#0f766e]/10">
            <FileQuestion size={20} />
          </span>
          <div>
            <h2 className="text-xl font-black leading-tight text-[#13232d]">{form.id ? 'Edit butir soal' : 'Tulis butir soal'}</h2>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              Soal asesmen boleh memuat kunci, pilihan jawaban, dan pembahasan. Buat ringkas agar mudah dipakai ulang ke kuis.
            </p>
          </div>
        </div>
        <StatusBadge tone={validQuestion ? 'green' : 'amber'}>{validQuestion ? 'Siap disimpan' : 'Lengkapi soal'}</StatusBadge>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="space-y-3 p-4">
          <label className={materialLabelClass}>Pertanyaan
            <textarea value={form.questionText || ''} onChange={(event) => updateField('questionText', event.target.value)} rows={4} placeholder="Tulis pertanyaan asesmen di sini." className={`${materialInputClass} resize-y leading-7`} />
          </label>

          {isMultipleChoice && (
            <label className={materialLabelClass}>Pilihan jawaban
              <textarea value={form.optionsText} onChange={(event) => updateField('optionsText', event.target.value)} rows={4} placeholder="Satu opsi per baris. Jawaban benar harus sama persis dengan salah satu opsi." className={`${materialInputClass} resize-y leading-7`} />
            </label>
          )}

          <label className={materialLabelClass}>Pembahasan
            <textarea value={form.explanation || ''} onChange={(event) => updateField('explanation', event.target.value)} rows={3} placeholder="Tulis alasan jawaban atau catatan koreksi untuk guru/siswa." className={`${materialInputClass} resize-y leading-7`} />
          </label>

          {!validQuestion && (
            <div className="rounded-[0.9rem] bg-amber-50 px-3 py-2.5 text-sm font-bold leading-6 text-amber-800 ring-1 ring-amber-100">
              Pertanyaan dan jawaban benar wajib diisi. Untuk pilihan ganda, minimal 2 opsi dan jawaban benar harus sama persis dengan salah satu opsi.
            </div>
          )}
        </div>

        <aside className="space-y-4 border-t border-[#123c3b]/8 bg-[#f7f4ee]/58 p-4 lg:border-l lg:border-t-0">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0f766e]">Jenis soal</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {['Pilihan ganda', 'Benar/salah', 'Isian', 'Essay'].map((type) => {
                const active = form.type === type
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={active}
                    onClick={() => updateField('type', type)}
                    className={`rounded-[0.85rem] px-3 py-2.5 text-xs font-black ring-1 transition ${
                      active
                        ? 'bg-[#123c3b] text-white ring-[#123c3b]'
                        : 'bg-white text-slate-600 ring-[#123c3b]/10 hover:bg-[#e8f4ef] hover:text-[#0f766e]'
                    }`}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0f766e]">Level</p>
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
                        ? 'bg-[#123c3b] text-white ring-[#123c3b]'
                        : 'bg-white text-slate-600 ring-[#123c3b]/10 hover:bg-[#e8f4ef] hover:text-[#0f766e]'
                    }`}
                  >
                    {level}
                  </button>
                )
              })}
            </div>
          </div>

          <label className={materialLabelClass}>Jawaban benar
            <input value={form.correctAnswer || ''} onChange={(event) => updateField('correctAnswer', event.target.value)} placeholder={isMultipleChoice ? 'Sama persis dengan salah satu opsi' : 'Jawaban/kunci'} className={materialInputClass} />
          </label>

          <label className={materialLabelClass}>Topik
            <input value={form.topic || ''} onChange={(event) => updateField('topic', event.target.value)} placeholder="Topik soal" className={materialInputClass} />
          </label>

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

      <footer className="flex flex-col-reverse gap-2 border-t border-[#123c3b]/8 bg-white/72 px-4 py-3 sm:flex-row sm:justify-end">
        <button onClick={onCancel} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-100">
          <X size={16} /> Batal
        </button>
        <button onClick={submit} disabled={!validQuestion} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] bg-[#123c3b] px-4 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(15,31,42,0.14)] transition hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:opacity-45">
          <Save size={16} /> Simpan soal
        </button>
      </footer>
    </section>
  )
}

function emptyQuestion(lookups, teacherSubject) {
  const subject = lookups.subjects.find((item) => item.name === teacherSubject) || lookups.subjects[0]
  const classItem = lookups.classes[0]
  return {
    questionText: '',
    options: [''],
    correctAnswer: '',
    explanation: '',
    subjectId: subject?.id || '',
    classId: classItem?.id || '',
    subject: subject?.name || teacherSubject || 'Mapel belum dipilih',
    className: classItem?.name || 'Semua kelas',
    topic: '',
    difficulty: 'Mudah',
    type: 'Pilihan ganda',
  }
}

function teacherAssignmentStorageKey(user, teacherSubject) {
  return `islelearn-teacher-assignments-${user?.id || teacherSubject || 'demo'}`
}

function getLocalTeacherAssignments(user, teacherSubject) {
  const key = teacherAssignmentStorageKey(user, teacherSubject)
  const storedRows = safeReadLocalJson(key, null)

  if (Array.isArray(storedRows)) {
    return storedRows.filter((row) => !isLegacyDemoRow(row))
  }

  return []
}

function setLocalTeacherAssignments(user, teacherSubject, rows) {
  safeWriteLocalJson(teacherAssignmentStorageKey(user, teacherSubject), Array.isArray(rows) ? rows : [])
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
          action={<button onClick={() => setViewingSubmissions(null)} className="rounded-[0.85rem] bg-[#f7f4ee] px-3 py-2 text-xs font-black text-[#0f766e] ring-1 ring-[#123c3b]/8 transition hover:bg-[#e8f4ef]">Kembali</button>}
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

      <section className="mb-4 flex flex-col gap-3 rounded-[1.15rem] border border-[#123c3b]/10 bg-white/80 px-4 py-3 shadow-[0_12px_36px_rgba(15,31,42,0.055)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs font-black text-[#13232d]">
          <span className="inline-flex items-center gap-1.5 rounded-[0.75rem] bg-[#e8f4ef] px-3 py-1.5 text-[#0f766e] ring-1 ring-[#0f766e]/10">
            <ClipboardList size={14} /> {rows.length} tugas
          </span>
          <span className="rounded-[0.75rem] bg-[#f7f4ee] px-3 py-1.5 text-slate-600 ring-1 ring-[#123c3b]/8">{activeCount} aktif</span>
          <span className="rounded-[0.75rem] bg-[#f7f4ee] px-3 py-1.5 text-slate-600 ring-1 ring-[#123c3b]/8">{draftCount} draft/selesai</span>
        </div>
        <p className="text-xs font-bold text-slate-500">
          Sumber data: <span className="text-[#0f766e]">{sourceLabel}</span>
        </p>
      </section>

      {error && <div className="mb-4 rounded-[1rem] bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data tugas: {error}. Data lokal ditampilkan.</div>}
      
      {editing && <AssignmentForm assignment={editing} lookups={lookups} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label="Memuat tugas dari Supabase..." /> : rows.length > 0 ? (
        <section className="overflow-hidden rounded-[1.15rem] border border-[#123c3b]/10 bg-white/86 shadow-[0_14px_44px_rgba(15,31,42,0.06)]">
          {rows.map((row) => (
            <article key={row.id} className="grid gap-3 border-b border-[#123c3b]/8 p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
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
                <button onClick={() => setEditing(row)} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-[#f7f4ee] px-3 py-2 text-xs font-black text-[#0f766e] ring-1 ring-[#123c3b]/8 transition hover:bg-[#e8f4ef]">
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
    <section className="mb-5 overflow-hidden rounded-[1.15rem] border border-[#123c3b]/10 bg-white/88 shadow-[0_16px_48px_rgba(15,31,42,0.07)] backdrop-blur-xl">
      <header className="flex flex-col gap-3 border-b border-[#123c3b]/8 bg-[#fbfaf7]/78 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-[0.9rem] bg-[#e8f4ef] text-[#0f766e] ring-1 ring-[#0f766e]/10">
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

        <aside className="space-y-4 border-t border-[#123c3b]/8 bg-[#f7f4ee]/58 p-4 lg:border-l lg:border-t-0">
          <label className={materialLabelClass}>Deadline
            <input type="date" value={form.deadline || ''} onChange={(event) => updateField('deadline', event.target.value)} className={materialInputClass} />
          </label>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0f766e]">Status</p>
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
                        ? 'bg-[#123c3b] text-white ring-[#123c3b]'
                        : 'bg-white text-slate-600 ring-[#123c3b]/10 hover:bg-[#e8f4ef] hover:text-[#0f766e]'
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

      <footer className="flex flex-col-reverse gap-2 border-t border-[#123c3b]/8 bg-white/72 px-4 py-3 sm:flex-row sm:justify-end">
        <button onClick={onCancel} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-100">
          <X size={16} /> Batal
        </button>
        <button onClick={() => onSave(form)} disabled={!validAssignment} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] bg-[#123c3b] px-4 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(15,31,42,0.14)] transition hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:opacity-45">
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

function teacherQuizStorageKey(user, teacherSubject) {
  return `islelearn-teacher-quizzes-${user?.id || teacherSubject || 'demo'}`
}

function getLocalTeacherQuizzes(user, teacherSubject) {
  const key = teacherQuizStorageKey(user, teacherSubject)
  const storedRows = safeReadLocalJson(key, null)

  if (Array.isArray(storedRows)) {
    return storedRows.filter((row) => !isLegacyDemoRow(row))
  }

  return []
}

function setLocalTeacherQuizzes(user, teacherSubject, rows) {
  safeWriteLocalJson(teacherQuizStorageKey(user, teacherSubject), Array.isArray(rows) ? rows : [])
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

      <section className="mb-4 flex flex-col gap-3 rounded-[1.15rem] border border-[#123c3b]/10 bg-white/80 px-4 py-3 shadow-[0_12px_36px_rgba(15,31,42,0.055)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs font-black text-[#13232d]">
          <span className="inline-flex items-center gap-1.5 rounded-[0.75rem] bg-[#e8f4ef] px-3 py-1.5 text-[#0f766e] ring-1 ring-[#0f766e]/10">
            <FlaskConical size={14} /> {quizRows.length} kuis
          </span>
          <span className="rounded-[0.75rem] bg-[#f7f4ee] px-3 py-1.5 text-slate-600 ring-1 ring-[#123c3b]/8">{publishedCount} publish</span>
          <span className="rounded-[0.75rem] bg-[#f7f4ee] px-3 py-1.5 text-slate-600 ring-1 ring-[#123c3b]/8">{draftCount} draft</span>
          <span className="rounded-[0.75rem] bg-[#f7f4ee] px-3 py-1.5 text-slate-600 ring-1 ring-[#123c3b]/8">{questionRows.length} soal tersedia</span>
        </div>
        <p className="text-xs font-bold text-slate-500">
          Sumber data: <span className="text-[#0f766e]">{sourceLabel}</span>
        </p>
      </section>

      {error && <div className="mb-4 rounded-[1rem] bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data kuis: {error}. Data lokal mapel guru ditampilkan.</div>}
      
      {editing && <QuizForm quiz={editing} lookups={lookups} questions={questionRows} onCancel={() => setEditing(null)} onSave={handleSave} />}
      
      {loading ? <LoadingState label="Memuat kuis guru dari Supabase..." /> : (
        quizRows.length > 0 ? (
          <section className="overflow-hidden rounded-[1.15rem] border border-[#123c3b]/10 bg-white/86 shadow-[0_14px_44px_rgba(15,31,42,0.06)]">
            {quizRows.map((quiz) => (
              <article key={quiz.id} className="grid gap-3 border-b border-[#123c3b]/8 p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
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
                  <button onClick={() => setEditing(quiz)} className="inline-flex items-center gap-1.5 rounded-[0.8rem] bg-[#f7f4ee] px-3 py-2 text-xs font-black text-[#0f766e] ring-1 ring-[#123c3b]/8 transition hover:bg-[#e8f4ef]">
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
    <section className="mb-5 overflow-hidden rounded-[1.15rem] border border-[#123c3b]/10 bg-white/88 shadow-[0_16px_48px_rgba(15,31,42,0.07)] backdrop-blur-xl">
      <header className="flex flex-col gap-3 border-b border-[#123c3b]/8 bg-[#fbfaf7]/78 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-[0.9rem] bg-[#e8f4ef] text-[#0f766e] ring-1 ring-[#0f766e]/10">
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
                        ? 'bg-[#123c3b] text-white ring-[#123c3b]'
                        : 'bg-[#f7f4ee] text-slate-700 ring-[#123c3b]/8 hover:bg-[#e8f4ef] hover:text-[#0f766e]'
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

        <aside className="space-y-4 border-t border-[#123c3b]/8 bg-[#f7f4ee]/58 p-4 lg:border-l lg:border-t-0">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0f766e]">Status</p>
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
                        ? 'bg-[#123c3b] text-white ring-[#123c3b]'
                        : 'bg-white text-slate-600 ring-[#123c3b]/10 hover:bg-[#e8f4ef] hover:text-[#0f766e]'
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

      <footer className="flex flex-col-reverse gap-2 border-t border-[#123c3b]/8 bg-white/72 px-4 py-3 sm:flex-row sm:justify-end">
        <button onClick={onCancel} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] px-4 py-2.5 text-sm font-black text-slate-600 transition hover:bg-slate-100">
          <X size={16} /> Batal
        </button>
        <button onClick={() => onSave(form, selectedQuestionIds)} disabled={!validQuiz} className="inline-flex items-center justify-center gap-2 rounded-[0.85rem] bg-[#123c3b] px-4 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(15,31,42,0.14)] transition hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:opacity-45">
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
              <Bar dataKey="nilai" fill="#0F766E" radius={[12, 12, 0, 0]} />
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

      <SectionCard className="mb-5 bg-gradient-to-br from-[#e8f4ef] via-white to-cyan-50">
        <div className="grid gap-4 lg:grid-cols-[1fr_18rem] lg:items-center">
          <div>
            <StatusBadge tone="cyan">Shortcut AI</StatusBadge>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-slate-950">
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

          <div className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-[#123c3b]/10">
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
    { label: 'Guru', description: `${teachers.length} data guru`, icon: UsersRound, onClick: () => navigate('/admin/guru') },
    { label: 'Siswa', description: `${students.length} data siswa`, icon: UsersRound, onClick: () => navigate('/admin/siswa') },
    { label: 'Kelas', description: `${classes.length} rombel`, icon: School, onClick: () => navigate('/admin/kelas') },
    { label: 'Mapel', description: `${subjects.length} mata pelajaran`, icon: BookOpen, onClick: () => navigate('/admin/mapel') },
    { label: 'Backup', description: 'Ekspor data aman', icon: Download, onClick: () => navigate('/admin/backup') },
  ]

  const metricItems = [
    { label: 'Guru', value: teachers.length, caption: 'akun/profile', icon: UsersRound },
    { label: 'Siswa', value: students.length, caption: 'dalam sistem', icon: UsersRound },
    { label: 'Kelas', value: classes.length, caption: 'rombel', icon: School },
    { label: 'Konten', value: localContent.length, caption: 'lokal guru', icon: BookOpen },
  ]

  return (
    <div className="space-y-4">
      <section className="rounded-[1.6rem] sea-ink-panel p-5 text-white shadow-[0_20px_54px_rgba(15,31,42,0.16)]">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b9e4dc]">Admin · konsol data</p>
        <h1 className="mt-3 text-balance text-3xl font-black leading-none tracking-[-0.02em] sm:text-4xl">
          Pusat data sekolah.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200/78">
          Kelola data utama aplikasi dengan ringkasan compact, daftar aksi, dan tabel yang mudah dipindai.
        </p>
      </section>

      <MetricStrip items={metricItems} />

      <ActionList items={adminMenus} />
    </div>
  )
}


function adminProfileStorageKey(role) {
  return `islelearn-admin-profiles-${role}`
}

function getLocalAdminProfiles(role, fallbackRows) {
  const safeFallbackRows = Array.isArray(fallbackRows) ? fallbackRows : []
  const key = adminProfileStorageKey(role)
  const storedRows = safeReadLocalJson(key, null)

  if (Array.isArray(storedRows)) {
    return storedRows
  }

  safeWriteLocalJson(key, safeFallbackRows)
  return safeFallbackRows
}

function setLocalAdminProfiles(role, rows) {
  safeWriteLocalJson(adminProfileStorageKey(role), Array.isArray(rows) ? rows : [])
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
        setRows(getLocalAdminProfiles(role, fallbackRows))
        setLookups({ classes, subjects })
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
          setRows(profileRows.length > 0 ? profileRows : fallbackRows)
          setLookups({ classes: classRows, subjects: subjectRows })
          setError('')
        }
      } catch (loadError) {
        if (active) {
          setRows(getLocalAdminProfiles(role, fallbackRows))
          setLookups({ classes, subjects })
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
        classes: lookups.classes.length > 0 ? lookups.classes : classes,
        subjects: lookups.subjects.length > 0 ? lookups.subjects : subjects,
      }
      const localProfile = enrichAdminProfileRow({ ...profile, id: profile.id || `local-${role}-${Date.now()}`, role }, role, lookupRows)

      setRows((current) => {
        const nextRows = profile.id
          ? current.map((item) => item.id === profile.id ? localProfile : item)
          : [localProfile, ...current]
        setLocalAdminProfiles(role, nextRows)
        return nextRows
      })

      setEditing(null)
      notify(`${title} tersimpan lokal di perangkat.`)
      return
    }

    try {
      const saved = role === 'guru'
        ? await saveAdminTeacher({ accessToken: appContext.accessToken, teacher: { ...profile, role } })
        : await saveAdminStudent({ accessToken: appContext.accessToken, student: { ...profile, role } })
      const enriched = enrichAdminProfileRow(saved, role, lookups)
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
        setLocalAdminProfiles(role, nextRows)
        return nextRows
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
  const classItem = lookups.classes.find((item) => item.id === classId)
  return { ...row, classId, className: classItem?.name || row.className || '-' }
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

function adminCollectionStorageKey(collection) {
  return `islelearn-admin-${collection}`
}

function getLocalAdminCollection(collection, fallbackRows) {
  const safeFallbackRows = Array.isArray(fallbackRows) ? fallbackRows : []
  const key = adminCollectionStorageKey(collection)
  const storedRows = safeReadLocalJson(key, null)

  if (Array.isArray(storedRows)) {
    return storedRows
  }

  safeWriteLocalJson(key, safeFallbackRows)
  return safeFallbackRows
}

function setLocalAdminCollection(collection, rows) {
  safeWriteLocalJson(adminCollectionStorageKey(collection), Array.isArray(rows) ? rows : [])
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
        setRows(getLocalAdminCollection('classes', classes))
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const classRows = await fetchClasses({ accessToken: appContext.accessToken })
        if (active) {
          setRows(classRows.length > 0 ? classRows : classes)
          setError('')
        }
      } catch (loadError) {
        if (active) {
          setRows(getLocalAdminCollection('classes', classes))
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
      const localClass = { ...classItem, id: classItem.id || `local-class-${Date.now()}` }

      setRows((current) => {
        const nextRows = classItem.id
          ? current.map((item) => item.id === classItem.id ? localClass : item)
          : [localClass, ...current]
        setLocalAdminCollection('classes', nextRows)
        return nextRows
      })

      setEditing(null)
      notify('Kelas tersimpan lokal di perangkat.')
      return
    }
    try {
      const saved = await saveClass({ accessToken: appContext.accessToken, classItem })
      setRows((current) => classItem.id ? current.map((item) => item.id === classItem.id ? saved : item) : [saved, ...current])
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
        const nextRows = current.filter((item) => item.id !== deleting.id)
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
  const practiceResults = getStoredResultsByPrefix('islelearn-practice-result-')
  const quizResults = getStoredResultsByPrefix('islelearn-quiz-result-')
  const assignmentSubmissions = readLocalRowsByPrefix('islelearn-assignment-submissions-')
  const localAverage = averageScore([...practiceResults, ...quizResults])

  return (
    <div>
      <PageHeader
        eyebrow="Pimpinan"
        title="Monitoring sekolah"
        description="Ringkasan inti performa kelas, siswa, guru, dan aktivitas belajar."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={School} label="Kelas Aktif" value={classes.length} caption="terpantau" tone="purple" />
        <StatCard icon={UsersRound} label="Siswa" value={students.length} caption="dalam sistem" tone="cyan" />
        <StatCard icon={Trophy} label="Rata-rata" value={localAverage || '-'} caption="latihan/kuis lokal" tone="green" />
        <StatCard icon={Target} label="Submission" value={assignmentSubmissions.length} caption="tugas terkirim" tone="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Fokus Monitoring">
          <div className="grid gap-2 text-sm font-semibold text-slate-600">
            <p>• Pantau kelas aktif dan progres siswa.</p>
            <p>• Cek aktivitas guru melalui materi, tugas, dan kuis yang dipublish.</p>
            <p>• Gunakan laporan untuk melihat ringkasan akademik.</p>
          </div>
        </DashboardCard>

        <DashboardCard title="Akses Laporan">
          <div className="grid gap-2 sm:grid-cols-2">
            <a href="/pimpinan/laporan" className="rounded-2xl bg-cyan-50 p-3 text-sm font-bold text-cyan-800 ring-1 ring-cyan-100">Laporan Akademik</a>
            <a href="/pimpinan/guru" className="rounded-2xl bg-violet-50 p-3 text-sm font-bold text-violet-800 ring-1 ring-violet-100">Monitoring Guru</a>
            <a href="/pimpinan/kelas" className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">Monitoring Kelas</a>
            <a href="/pimpinan/siswa" className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800 ring-1 ring-amber-100">Monitoring Siswa</a>
          </div>
        </DashboardCard>
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
              <Line dataKey="nilai" stroke="#0F766E" strokeWidth={3} />
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
