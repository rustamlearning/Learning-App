import { useEffect, useMemo, useState } from 'react'
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
  FileQuestion,
  FlaskConical,
  Megaphone,
  PlayCircle,
  Plus,
  Radio,
  School,
  Sparkles,
  Target,
  Trophy,
  UsersRound,
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
  seaclub,
  students,
  subjectProgress,
  subjects,
  teachers,
} from '../data/dummyData.js'
import {
  ConfirmDialog,
  DashboardCard,
  DataTable,
  EmptyState,
  LoadingState,
  PageHeader,
  QuickActionButton,
  SearchFilterBar,
  SectionCard,
  StatCard,
  StatusBadge,
  Toast,
  ProgressRing,
} from '../components/ui.jsx'
import { AIChatMockup, AIGeneratorMockup, BadgeCard, DailyMissionCard, FlashcardDeck, LearningPath, SEAClubCorner } from '../components/learning.jsx'
import { fetchMaterialLookups, fetchMaterials, fetchStudentMaterialProgress, markMaterialCompleted, removeMaterial, saveMaterial } from '../services/materialService.js'
import { fetchQuestions, removeQuestion, saveQuestion } from '../services/questionService.js'
import { fetchQuizAttempts, fetchQuizQuestions, fetchQuizzes, fetchStudentRecord, removeQuiz, saveQuiz, submitQuizAttempt } from '../services/quizService.js'
import { exportBackupData, fetchAdminStudents, fetchAdminTeachers, fetchClasses, fetchSubjects, removeAdminStudent, removeAdminTeacher, removeClass, removeSubject, saveAdminStudent, saveAdminTeacher, saveClass, saveSubject } from '../services/adminService.js'
import { fetchAssignments, removeAssignment, saveAssignment } from '../services/assignmentService.js'

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
      <ConfirmDialog open={confirmOpen} title="Konfirmasi aksi" description="Aksi penting di aplikasi nyata akan meminta konfirmasi berlapis. Untuk demo ini, aksi hanya menampilkan feedback." onCancel={() => setConfirmOpen(false)} onConfirm={() => { setConfirmOpen(false); notify('Aksi dikonfirmasi pada mode demo.') }} />
    </>
  )
}

function renderSiswa(page, user, notify, appContext) {
  if (page === 'dashboard') return <SiswaDashboard user={user} notify={notify} />
  if (page === 'kelas') return <KelasSaya />
  if (page === 'materi') return <MateriBelajar user={user} notify={notify} appContext={appContext} />
  if (page === 'latihan') return <LatihanPage notify={notify} />
  if (page === 'kuis') return <KuisPage user={user} notify={notify} appContext={appContext} />
  if (page === 'flashcard') return <FlashcardPage />
  if (page === 'ai-tutor') return <AIPage />
  if (page === 'progres') return <ProgresPage />
  if (page === 'leaderboard') return <LeaderboardPage />
  if (page === 'seaclub') return <SEAClubPage />
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

  return (
    <div>
      <PageHeader
        eyebrow="Student Dashboard"
        title={`Halo, ${firstName} 👋`}
        description="Lanjutkan belajar, selesaikan misi harian, dan pantau progresmu dalam satu tempat."
        action={
          <div className="flex flex-wrap gap-2">
            <QuickActionButton icon={BookOpen} label="Lanjutkan Belajar" onClick={() => notify('Membuka materi terakhir pada mode demo.')} />
            <QuickActionButton icon={Bot} label="Tanya AI Tutor" onClick={() => notify('AI Tutor siap di menu siswa.')} />
          </div>
        }
      />

      <section className="dashboard-aurora-card island-wave mb-5 overflow-hidden rounded-[2rem] p-5 text-white shadow-glow sm:p-6">
        <div className="absolute right-10 top-8 h-28 w-28 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="absolute bottom-3 left-12 h-24 w-44 rounded-full bg-purple-300/12 blur-3xl" />

        <div className="relative z-10 grid gap-5 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 lg:grid-cols-[1fr_17rem] lg:items-center">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-cyan-100">
              SEA Learning Mission
            </p>
            <h2 className="mt-2 text-balance text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              Misi hari ini: 2 dari 3 selesai.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-purple-100/85">
              Selesaikan satu materi, satu latihan, dan satu refleksi singkat untuk menjaga progres belajarmu tetap konsisten.
            </p>

            <div className="mt-5 h-3 max-w-md rounded-full bg-white/15">
              <div className="h-3 rounded-full bg-gradient-to-r from-galaxy-cyan via-galaxy-teal to-galaxy-gold" style={{ width: '67%' }} />
            </div>
            <p className="mt-2 text-xs font-bold text-cyan-100">
              Progress misi 67% · reward +50 XP
            </p>
          </div>

          <div className="rounded-3xl bg-white p-4 text-gray-950 shadow-soft">
            <ProgressRing value={72} label="Progress belajar" />
          </div>
        </div>
      </section>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={LineChartIcon} label="Progress Belajar" value="72%" caption="Target minggu ini 85%" tone="purple" />
        <StatCard icon={Sparkles} label="XP Hari Ini" value="120 XP" caption="Target +50 XP lagi" tone="cyan" />
        <StatCard icon={CalendarClock} label="Streak" value="5 hari" caption="Jaga konsistensi" tone="amber" />
        <StatCard icon={Award} label="Nilai Rata-rata" value="84" caption="Naik 3 poin" tone="green" />
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <DailyMissionCard />
        <DashboardCard title="Learning Path" className="pt-7">
          <div className="mt-2">
            <LearningPath />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              ['Materi Berikutnya', 'Descriptive Text', '65% selesai', BookOpen, 'cyan'],
              ['Latihan Fokus', 'Simple Past Tense', '10 menit', FileQuestion, 'amber'],
              ['Target Minggu Ini', 'Mastery Badge', '+50 XP lagi', Trophy, 'purple'],
            ].map(([label, title, detail, Icon, tone]) => (
              <div key={label} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-violet-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
                    <Icon size={18} />
                  </span>
                  <StatusBadge tone={tone}>{detail}</StatusBadge>
                </div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-black text-slate-950">{title}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-3xl bg-gradient-to-r from-violet-50 to-cyan-50 p-4 ring-1 ring-violet-100">
            <p className="text-sm font-bold leading-6 text-slate-700">
              Saran hari ini: selesaikan materi Descriptive Text, lanjutkan 5 soal latihan, lalu cek kesiapan kuis.
            </p>
          </div>
        </DashboardCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr_0.85fr]">
        <DashboardCard title="Rekomendasi Pintar">
          <p className="text-sm leading-7 text-gray-600">
            Kamu masih perlu latihan di <b>Simple Past Tense</b>. Coba 10 menit hari ini agar grammar naik sebelum kuis berikutnya.
          </p>
          <button onClick={() => notify('Membuka latihan Simple Past Tense demo.')} className="mt-4 rounded-2xl bg-galaxy-surface px-4 py-3 text-sm font-bold text-galaxy-purple">
            Mulai latihan 10 menit
          </button>
        </DashboardCard>

        <DashboardCard title="Lanjutkan Belajar">
          <StatusBadge tone="cyan">Ringan dibuka</StatusBadge>
          <h3 className="mt-3 text-xl font-extrabold">Descriptive Text</h3>
          <p className="mt-2 text-sm text-gray-500">Progress 65% · Bahasa Inggris · Text Type</p>
          <div className="mt-4 h-2 rounded-full bg-galaxy-lavender">
            <div className="h-2 rounded-full bg-galaxy-action" style={{ width: '65%' }} />
          </div>
          <button onClick={() => notify('Melanjutkan Descriptive Text pada mode demo.')} className="mt-4 w-full rounded-2xl bg-galaxy-action px-4 py-3 text-sm font-bold text-white">
            Lanjutkan
          </button>
        </DashboardCard>

        <DashboardCard title="Kuis Terdekat">
          <StatusBadge tone="green">Berlangsung</StatusBadge>
          <h3 className="mt-3 text-lg font-extrabold">Quiz Descriptive Text</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">4 Mei 2026 · 20 menit · Rustam, S.Pd.</p>
          <button onClick={() => notify('Membuka detail kuis demo.')} className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
            Cek kesiapan
          </button>
        </DashboardCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <DashboardCard title="Badge terbaru">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {badges.filter((badge) => ['Island Starter', 'Vocabulary Voyager', 'SEAClub Speaker'].includes(badge.name)).map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="SEAClub Corner" className="archipelago-soft island-wave">
          <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-2xl bg-white/85 p-4 ring-1 ring-cyan-100">
              <p className="text-xs font-extrabold uppercase tracking-wide text-galaxy-teal">Word of the Day</p>
              <p className="mt-2 text-2xl font-extrabold text-gray-950">Explore</p>
              <p className="mt-1 text-sm text-slate-500">menjelajahi</p>
            </div>
            <div className="rounded-2xl bg-white/85 p-4 ring-1 ring-cyan-100">
              <p className="text-xs font-extrabold uppercase tracking-wide text-galaxy-teal">Challenge</p>
              <p className="mt-2 text-sm font-bold leading-6 text-gray-800">Tell us about your island in 5 sentences.</p>
              <button onClick={() => notify('SEAClub challenge dibuka pada mode demo.')} className="mt-3 rounded-2xl bg-teal-50 px-4 py-2.5 text-sm font-extrabold text-teal-700 ring-1 ring-teal-100">
                Mulai Challenge
              </button>
            </div>
          </div>
        </DashboardCard>
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {subjects.slice(0, 5).map((subject, index) => (
          <SectionCard key={subject.id}>
            <StatusBadge>{subject.name}</StatusBadge>
            <h2 className="mt-4 text-xl font-extrabold">{subject.name}</h2>
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

  const data = remoteMaterials.length > 0 ? remoteMaterials : materials
  const subjectsFilter = ['Semua', ...Array.from(new Set(data.map((item) => item.subject))), 'Selesai', 'Dipelajari', 'Belum Mulai']
  const enriched = data.map((item) => completedIds.includes(item.id) ? { ...item, status: 'Selesai', progress: 100 } : item)
  const filtered = enriched.filter((item) => (filter === 'Semua' || item.status === filter || item.subject === filter) && item.title.toLowerCase().includes(search.toLowerCase()))

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
    return <MaterialDetail item={selected} onBack={() => setSelected(null)} onComplete={() => markComplete(selected)} notify={notify} />
  }

  return (
    <div>
      <PageHeader eyebrow="Materi Belajar" title="Jelajahi materi baru hari ini." description={remoteMaterials.length > 0 ? 'Materi sudah dibaca dari Supabase dan diberi label ringan dibuka.' : 'Materi dummy tampil sebagai fallback sampai data Supabase diisi.'} />
      {error && <div className="mb-4 rounded-3xl bg-amber-50 p-4 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data materi: {error}. Fallback dummy tetap ditampilkan.</div>}
      <SearchFilterBar search={search} setSearch={setSearch} filters={subjectsFilter} activeFilter={filter} setActiveFilter={setFilter} />
      {loading ? <LoadingState label="Memuat materi dari Supabase..." /> : (
        filtered.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => <MaterialCard key={item.id} item={item} onOpen={() => setSelected(item)} notify={notify} />)}
          </div>
        ) : (
          <EmptyState title="Belum ada materi di pulau ini." description="Guru akan segera menambahkan materi baru untuk kelasmu." />
        )
      )}
    </div>
  )
}

function MaterialCard({ item, onOpen, notify }) {
  return (
    <SectionCard>
      <div className="mb-4 flex items-center justify-between"><StatusBadge tone="cyan">{item.subject}</StatusBadge><StatusBadge tone="green">Ringan dibuka</StatusBadge></div>
      <h2 className="text-xl font-extrabold text-gray-950">{item.title}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-500">{item.description}</p>
      <div className="mt-4 h-2 rounded-full bg-galaxy-lavender"><div className="h-2 rounded-full bg-galaxy-action" style={{ width: `${item.progress}%` }} /></div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button onClick={onOpen} className="rounded-2xl bg-galaxy-deep px-4 py-3 text-sm font-bold text-white">Lanjutkan</button>
        <button onClick={() => notify('AI Tutor siap membantu materi ini.')} className="rounded-2xl bg-galaxy-surface px-4 py-3 text-sm font-bold text-galaxy-purple">Tanya AI</button>
      </div>
    </SectionCard>
  )
}

function MaterialDetail({ item, onBack, onComplete, notify }) {
  return (
    <div>
      <PageHeader eyebrow={item.subject} title={item.title} description={`${item.className} · ${item.topic} · ${item.type || 'Teks'} · Ringan dibuka`} action={<button onClick={onBack} className="rounded-2xl bg-galaxy-surface px-4 py-3 text-sm font-bold text-galaxy-purple">Kembali</button>} />
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <SectionCard>
          <StatusBadge tone={item.status === 'Selesai' ? 'green' : 'cyan'}>{item.status}</StatusBadge>
          <div className="prose prose-slate mt-5 max-w-none">
            <p className="text-base leading-8 text-slate-700">{item.content}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={onComplete} className="rounded-2xl bg-galaxy-action px-5 py-3 text-sm font-bold text-white">Tandai selesai</button>
            <button onClick={() => notify('AI Tutor siap membantu materi ini.')} className="rounded-2xl bg-galaxy-surface px-5 py-3 text-sm font-bold text-galaxy-purple">Tanya AI Tutor</button>
          </div>
        </SectionCard>
        <SectionCard>
          <p className="text-sm font-extrabold text-gray-950">Info Materi</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p><b>Mapel:</b> {item.subject}</p>
            <p><b>Kelas:</b> {item.className}</p>
            <p><b>Guru:</b> {item.teacher}</p>
            <p><b>Status:</b> {item.status}</p>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

function getCompletedMaterials(userId) {
  try {
    return JSON.parse(localStorage.getItem(`sea-learning-material-progress-${userId || 'demo'}`)) || []
  } catch (error) {
    return []
  }
}

function setCompletedMaterials(userId, ids) {
  localStorage.setItem(`sea-learning-material-progress-${userId || 'demo'}`, JSON.stringify(ids))
}

function LatihanPage({ notify }) {
  const [selected, setSelected] = useState(null)
  if (selected) return <PracticeDetail item={selected} onBack={() => setSelected(null)} notify={notify} />
  const practices = questions.slice(0, 8).map((q, index) => ({ ...q, soal: 8 + index, waktu: 8 + index * 2, lastScore: [82, 76, 91, 68][index % 4] }))
  return (
    <div>
      <PageHeader eyebrow="Latihan" title="Kuasai satu topik lagi hari ini." description="Latihan pendek, feedback cepat, pembahasan jelas." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {practices.map((item) => (
          <SectionCard key={item.id}>
            <StatusBadge tone={item.difficulty === 'Sulit' ? 'red' : item.difficulty === 'Sedang' ? 'amber' : 'green'}>{item.difficulty}</StatusBadge>
            <h2 className="mt-4 text-lg font-extrabold">{item.topic}</h2>
            <p className="mt-2 text-sm text-gray-500">{item.soal} soal · {item.waktu} menit · skor terakhir {item.lastScore}</p>
            <button onClick={() => setSelected(item)} className="mt-5 w-full rounded-2xl bg-galaxy-action px-4 py-3 text-sm font-bold text-white">Mulai latihan</button>
          </SectionCard>
        ))}
      </div>
    </div>
  )
}

function PracticeDetail({ item, onBack, notify }) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const correct = answer === item.correctAnswer
  return (
    <SectionCard>
      <button onClick={onBack} className="mb-4 rounded-2xl bg-galaxy-surface px-4 py-2 text-sm font-bold text-galaxy-purple">Kembali</button>
      <h1 className="text-2xl font-extrabold">{item.questionText}</h1>
      <div className="mt-5 grid gap-2">
        {item.options.map((option) => <button key={option} onClick={() => setAnswer(option)} className={`rounded-2xl px-4 py-3 text-left text-sm font-bold ring-1 ${answer === option ? 'bg-galaxy-deep text-white ring-galaxy-deep' : 'bg-white ring-purple-100'}`}>{option}</button>)}
      </div>
      <button onClick={() => { setSubmitted(true); notify(correct ? 'Jawaban benar. +50 XP' : 'Coba cek pembahasan dulu.') }} className="mt-5 rounded-2xl bg-galaxy-action px-5 py-3 text-sm font-bold text-white">Submit</button>
      {submitted && <div className={`mt-4 rounded-3xl p-4 ${correct ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}><b>{correct ? 'Benar.' : 'Belum tepat.'}</b> {item.explanation}</div>}
    </SectionCard>
  )
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
        setQuizRows(quizzes)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const rows = await fetchQuizzes({ accessToken: appContext.accessToken, publishedOnly: true })
        if (active) {
          setQuizRows(rows.length > 0 ? rows : quizzes)
          setError('')
        }
      } catch (loadError) {
        if (active) {
          setQuizRows(quizzes)
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
    setSelected(quiz)
    setAnswers({})
    setResult(null)

    if (!appContext?.accessToken || quiz.source !== 'supabase') {
      setQuizQuestions(questions.filter((item) => item.subject === quiz.subject).slice(0, 5))
      return
    }

    try {
      const rows = await fetchQuizQuestions({ accessToken: appContext.accessToken, quizId: quiz.id })
      setQuizQuestions(rows.length > 0 ? rows : questions.filter((item) => item.subject === quiz.subject).slice(0, 5))
    } catch (loadError) {
      notify(`Gagal membuka soal kuis: ${loadError.message}`)
      setQuizQuestions(questions.filter((item) => item.subject === quiz.subject).slice(0, 5))
    }
  }

  async function submitQuiz() {
    if (!selected) return
    const total = quizQuestions.length || 1
    const correct = quizQuestions.filter((question) => answers[question.id] === question.correctAnswer).length

    if (!appContext?.accessToken || selected.source !== 'supabase') {
      setResult({ score: Math.round((correct / total) * 100), correct, total })
      notify('Kuis demo berhasil dikirim.')
      return
    }

    try {
      const student = isUuid(user?.id) ? await fetchStudentRecord({ accessToken: appContext.accessToken, profileId: user.id }) : null
      const attempt = await submitQuizAttempt({ accessToken: appContext.accessToken, quiz: selected, questions: quizQuestions, answers, studentId: student?.id })
      setResult(attempt)
      notify('Jawaban kuis tersimpan di Supabase.')
    } catch (submitError) {
      notify(`Gagal submit kuis: ${submitError.message}`)
    }
  }

  if (selected) {
    return (
      <div>
        <PageHeader eyebrow={selected.subject} title={selected.title} description={`${selected.duration} menit · ${selected.teacher}`} action={<button onClick={() => setSelected(null)} className="rounded-2xl bg-galaxy-surface px-4 py-3 text-sm font-bold text-galaxy-purple">Kembali</button>} />
        <SectionCard>
          <div className="space-y-4">
            {quizQuestions.map((question, index) => (
              <div key={question.id} className="rounded-3xl bg-galaxy-surface p-4 ring-1 ring-purple-100">
                <p className="text-sm font-extrabold text-gray-950">{index + 1}. {question.questionText}</p>
                <div className="mt-3 grid gap-2">
                  {(question.options || []).map((option) => (
                    <button key={option} onClick={() => setAnswers((current) => ({ ...current, [question.id]: option }))} className={`rounded-2xl px-4 py-3 text-left text-sm font-bold ring-1 ${answers[question.id] === option ? 'bg-galaxy-deep text-white ring-galaxy-deep' : 'bg-white text-gray-700 ring-purple-100'}`}>
                      {option}
                    </button>
                  ))}
                </div>
                {result && <p className="mt-3 text-sm text-slate-600"><b>Pembahasan:</b> {question.explanation}</p>}
              </div>
            ))}
          </div>
          {result ? (
            <div className="mt-5 rounded-3xl bg-emerald-50 p-5 text-emerald-800 ring-1 ring-emerald-100">
              <p className="text-lg font-extrabold">Skor: {result.score}</p>
              <p className="mt-1 text-sm">Benar {result.correct} dari {result.total} soal.</p>
            </div>
          ) : (
            <button onClick={submitQuiz} disabled={quizQuestions.length === 0} className="mt-5 rounded-2xl bg-galaxy-action px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Submit jawaban</button>
          )}
        </SectionCard>
      </div>
    )
  }

  return (
    <div>
      <PageHeader eyebrow="Kuis / Ujian" title="Kuis aktif dan ujian resmi" description="Cek status sebelum mulai. Tidak ada autoplay, ringan dibuka." />
      {error && <div className="mb-4 rounded-3xl bg-amber-50 p-4 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data kuis: {error}. Fallback dummy ditampilkan.</div>}
      {loading ? <LoadingState label="Memuat kuis dari Supabase..." /> : <div className="grid gap-4 md:grid-cols-2">
        {quizRows.map((quiz) => (
          <SectionCard key={quiz.id}>
            <div className="flex items-center justify-between gap-3"><StatusBadge tone={statusTone(quiz.status)}>{quiz.status}</StatusBadge><span className="text-sm font-bold text-gray-500">{quiz.duration} menit</span></div>
            <h2 className="mt-4 text-xl font-extrabold">{quiz.title}</h2>
            <p className="mt-2 text-sm text-gray-500">{quiz.subject} · {quiz.teacher} · {quiz.date}</p>
            <button onClick={() => openQuiz(quiz)} className="mt-5 w-full rounded-2xl bg-galaxy-action px-4 py-3 text-sm font-bold text-white">{quiz.status === 'Selesai' ? 'Lihat hasil' : 'Mulai / Detail'}</button>
          </SectionCard>
        ))}
      </div>}
    </div>
  )
}

function FlashcardPage() {
  return (
    <div>
      <PageHeader eyebrow="Flashcard" title="Review cepat, ingatan kuat." description="Balik kartu, tandai tahu atau ulangi." />
      <div className="grid gap-4 lg:grid-cols-2">{flashcardDecks.map((deck) => <FlashcardDeck key={deck.id} deck={deck} />)}</div>
    </div>
  )
}

function AIPage() {
  return <><PageHeader eyebrow="AI Tutor" title="AI Tutor siap membantu kamu memahami materi." description="Mockup aman dan edukatif, siap integrasi nanti." /><AIChatMockup /></>
}

function ProgresPage() {
  return (
    <div>
      <PageHeader eyebrow="Nilai & Progres" title="Pantau perkembangan belajarmu." description="Grafik nilai, progres mapel, dan rekomendasi remedial." />
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <DashboardCard title="Perkembangan nilai"><ResponsiveContainer width="100%" height={280}><LineChart data={scoreTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="nilai" stroke="#7C3AED" strokeWidth={3} /></LineChart></ResponsiveContainer></DashboardCard>
        <DashboardCard title="Progress mapel"><ResponsiveContainer width="100%" height={280}><BarChart data={subjectProgress}><XAxis dataKey="name" hide /><YAxis /><Tooltip /><Bar dataKey="progress" fill="#22D3EE" radius={[12, 12, 0, 0]} /></BarChart></ResponsiveContainer></DashboardCard>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{remedials.slice(0, 4).map((item) => <SectionCard key={item.id}><StatusBadge tone="amber">Perlu latihan</StatusBadge><h2 className="mt-3 font-extrabold">{item.topic}</h2><p className="text-sm text-gray-500">{item.subject} · rekomendasi remedial 10 menit</p></SectionCard>)}</div>
    </div>
  )
}

function LeaderboardPage() {
  return (
    <div>
      <PageHeader eyebrow="Leaderboard" title="Ranking sehat, bukan mempermalukan." description="Top 10, posisi kamu, dan kategori challenge." />
      <div className="space-y-3">{leaderboard.map((student, index) => <div key={student.id} className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-soft ring-1 ring-purple-100"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-galaxy-lavender font-extrabold text-galaxy-purple">#{index + 1}</span><div className="flex-1"><p className="font-extrabold">{student.name}</p><p className="text-sm text-gray-500">{student.className} · {student.streak} hari streak</p></div><StatusBadge tone="cyan">{student.xp} XP</StatusBadge></div>)}</div>
    </div>
  )
}

function SEAClubPage() {
  return (
    <div>
      <PageHeader eyebrow="SEAClub Corner" title="English practice for island learners." description="Word, phrase, speaking challenge, writing prompt, dan AI feedback placeholder." />
      <SEAClubCorner />
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <DashboardCard title="Mini Dialogue">{seaclub.dialogue.map(([speaker, text]) => <p key={text} className="mb-2 rounded-2xl bg-galaxy-surface p-3 text-sm"><b>{speaker}:</b> {text}</p>)}</DashboardCard>
        <DashboardCard title="SEAClub Leaderboard">{leaderboard.slice(0, 5).map((item, index) => <p key={item.id} className="flex justify-between border-b border-purple-50 py-2 text-sm"><span>{index + 1}. {item.name}</span><b>{item.xp} XP</b></p>)}</DashboardCard>
      </div>
    </div>
  )
}

function ProfilPage({ user }) {
  return (
    <div>
      <PageHeader eyebrow="Profil" title="Profil belajar" description="Identitas, badge, dan statistik belajar." />
      <SectionCard className="max-w-3xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-galaxy-action text-3xl font-extrabold text-white shadow-glow">{user.avatar}</div>
          <div>
            <h2 className="text-3xl font-extrabold">{user.name}</h2>
            <p className="mt-1 text-gray-500">NIS {user.nis} · Kelas {user.className} · {user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">{badges.slice(0, 3).map((badge) => <StatusBadge key={badge.id}>{badge.name}</StatusBadge>)}</div>
          </div>
        </div>
        <button className="mt-6 rounded-2xl bg-galaxy-surface px-4 py-3 text-sm font-bold text-galaxy-purple">Edit profil placeholder</button>
      </SectionCard>
    </div>
  )
}

function GuruDashboard({ notify }) {
  const quickActions = [
    ['Tambah Materi', Plus],
    ['Buat Soal', FileQuestion],
    ['Buat Tugas', ClipboardList],
    ['Kuis Live', PlayCircle],
    ['AI Generator', Sparkles],
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Teacher Command Center"
        title="Ruang mengajar modern."
        description="Pantau kelas, buat konten, dan lihat sinyal belajar siswa dengan cepat."
      />

      <section className="command-banner mb-5 rounded-[1.75rem] p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-sm font-extrabold text-galaxy-purple">Fokus Mengajar Hari Ini</p>
            <h2 className="mt-2 text-balance text-3xl font-black tracking-[-0.04em] text-gray-950 sm:text-4xl">
              117 siswa aktif belajar minggu ini.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              3 siswa perlu perhatian, 2 kuis berjalan, dan 5 tugas menunggu pantauan.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <StatusBadge>4 kelas aktif</StatusBadge>
              <StatusBadge tone="cyan">117 siswa aktif</StatusBadge>
              <StatusBadge tone="amber">5 tugas aktif</StatusBadge>
              <StatusBadge tone="purple">2 kuis berjalan</StatusBadge>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {quickActions.map(([label, Icon]) => (
              <button
                key={label}
                onClick={() => notify(`${label} dibuka pada mode demo.`)}
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-purple-500/[0.12] bg-[linear-gradient(135deg,rgba(124,58,237,0.10),rgba(34,211,238,0.10))] px-4 text-sm font-bold text-purple-700 shadow-[0_10px_24px_rgba(30,27,75,0.06)] transition hover:-translate-y-0.5"
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={School} label="Kelas" value="4" caption="aktif diajar" tone="purple" />
        <StatCard icon={UsersRound} label="Siswa aktif" value="117" caption="minggu ini" tone="cyan" />
        <StatCard icon={ClipboardCheck} label="Tugas aktif" value="5" caption="butuh pantauan" tone="amber" />
        <StatCard icon={FileQuestion} label="Kuis berjalan" value="2" caption="hari ini" tone="quiz" />
        <StatCard icon={BarChart3} label="Rata-rata" value="84" caption="kelas utama" tone="green" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <DashboardCard title="Kelas Perlu Perhatian">
          {[
            ['X.1', '8 siswa belum remedial'],
            ['XI.1', '5 siswa belum membuka materi'],
            ['XII.1', 'rata-rata kuis turun 6 poin'],
          ].map(([kelas, detail]) => (
            <p key={kelas} className="mb-2 rounded-2xl bg-orange-50 p-3 text-sm font-semibold text-orange-800 ring-1 ring-orange-100">
              <b>{kelas}:</b> {detail}
            </p>
          ))}
        </DashboardCard>

        <DashboardCard title="AI Insight">
          <div className="rounded-3xl bg-gradient-to-br from-purple-50 to-cyan-50 p-4 ring-1 ring-purple-100">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-galaxy-purple ring-1 ring-purple-200">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-sm leading-6 text-gray-700">
                  <b>Siswa banyak salah di Simple Past Tense.</b> Rekomendasi: buat latihan remedial 10 soal.
                </p>
                <button onClick={() => notify('AI Generator siap membuat remedial demo.')} className="mt-3 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-galaxy-purple ring-1 ring-purple-100">
                  Buat remedial
                </button>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Soal Paling Banyak Salah">
          {[
            ['Simple Past Tense', '62% salah'],
            ['Narrative Text', '48% salah'],
            ['Persamaan Kuadrat', '41% salah'],
          ].map(([item, score]) => (
            <p key={item} className="flex justify-between border-b border-purple-50 py-3 text-sm last:border-b-0">
              <span className="font-semibold text-gray-700">{item}</span>
              <span className="text-slate-500">{score}</span>
            </p>
          ))}
        </DashboardCard>

        <DashboardCard title="Aktivitas Kelas Hari Ini">
          {[
            'X.1 menyelesaikan Quiz Descriptive Text.',
            'XI.1 membuka materi Narrative Text.',
            '12 siswa mengumpulkan tugas Daily Writing.',
          ].map((item) => (
            <p key={item} className="border-b border-purple-50 py-3 text-sm leading-6 text-gray-600 last:border-b-0">{item}</p>
          ))}
        </DashboardCard>
      </div>
    </div>
  )
}

function GuruKelas() {
  return <CardsPage eyebrow="Kelas" title="Kelas yang diajar" items={classes.map((c) => ({ title: `${c.name} Bahasa Inggris`, meta: `${c.students} siswa · rata-rata ${c.average}`, value: `${c.progress}% progress`, status: `${Math.max(1, 6 - c.grade + 10)} remedial` }))} />
}

function GuruMateri({ user, notify, appContext }) {
  const teacherSubject = user?.subject || 'Bahasa Inggris'
  const [rows, setRows] = useState([])
  const [lookups, setLookups] = useState({ subjects: [], classes: [] })
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    let active = true

    async function loadTeacherMaterials() {
      if (!appContext?.accessToken || !isUuid(user?.id)) {
        setRows(materials.filter((item) => item.subject === teacherSubject))
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
          setRows(materials.filter((item) => item.subject === teacherSubject))
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
      const localMaterial = { ...material, id: material.id || `local-material-${now}`, subject: teacherSubject, className: 'Kelas demo', teacher: user?.name, progress: material.status === 'Publish' ? 35 : 0 }
      setRows((current) => material.id ? current.map((item) => item.id === material.id ? { ...item, ...localMaterial } : item) : [localMaterial, ...current])
      setEditing(null)
      notify('Materi tersimpan lokal. Login Supabase guru diperlukan untuk menyimpan ke database.')
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
      setRows((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
      notify('Materi demo dihapus dari tampilan lokal.')
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
      <PageHeader eyebrow="Materi" title={`Kelola materi ${teacherSubject}`} description="Materi guru dibatasi berdasarkan akun guru yang login. Data Supabase tampil jika akun guru dan tabel sudah siap." action={<QuickActionButton icon={Plus} label="Tambah materi" onClick={() => setEditing(emptyMaterial(lookups, teacherSubject))} />} />
      {error && <div className="mb-4 rounded-3xl bg-amber-50 p-4 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data materi: {error}. Fallback dummy mapel guru ditampilkan.</div>}
      {editing && <MaterialForm material={editing} lookups={lookups} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label="Memuat materi guru dari Supabase..." /> : (
        rows.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((row) => (
              <SectionCard key={row.id}>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <StatusBadge tone={statusTone(row.status)}>{row.status}</StatusBadge>
                  <StatusBadge tone="cyan">{row.type || 'Teks'}</StatusBadge>
                </div>
                <h2 className="text-lg font-extrabold">{row.title}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">{row.description}</p>
                <p className="mt-3 text-xs font-bold text-slate-500">{row.subject} · {row.className} · {row.topic}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button onClick={() => setEditing(row)} className="rounded-2xl bg-galaxy-surface px-4 py-3 text-sm font-bold text-galaxy-purple">Edit</button>
                  <button onClick={() => handleSave({ ...row, status: row.status === 'Publish' ? 'Draft' : 'Publish' })} className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">{row.status === 'Publish' ? 'Unpublish' : 'Publish'}</button>
                  <button onClick={() => setDeleting(row)} className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">Hapus</button>
                </div>
              </SectionCard>
            ))}
          </div>
        ) : (
          <EmptyState title={`Belum ada materi ${teacherSubject}.`} description="Klik Tambah materi untuk membuat materi pertama." />
        )
      )}
      <ConfirmDialog open={Boolean(deleting)} title="Hapus materi?" description={`Materi "${deleting?.title || ''}" akan dihapus. Aksi ini membutuhkan konfirmasi.`} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  )
}

function MaterialForm({ material, lookups, onCancel, onSave }) {
  const [form, setForm] = useState(material)
  const subjectsList = lookups.subjects.length > 0 ? lookups.subjects : [{ id: '', name: material.subject || 'Bahasa Inggris' }]
  const classesList = lookups.classes.length > 0 ? lookups.classes : [{ id: '', name: material.className || 'Kelas demo' }]

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <SectionCard className="mb-5">
      <h2 className="text-xl font-extrabold text-gray-950">{form.id ? 'Edit materi' : 'Tambah materi'}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-gray-700">Judul
          <input value={form.title} onChange={(event) => updateField('title', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Topik
          <input value={form.topic} onChange={(event) => updateField('topic', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Mata pelajaran
          <select value={form.subjectId || ''} onChange={(event) => updateField('subjectId', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
            {subjectsList.map((subject) => <option key={subject.id || subject.name} value={subject.id}>{subject.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Kelas
          <select value={form.classId || ''} onChange={(event) => updateField('classId', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
            {classesList.map((classItem) => <option key={classItem.id || classItem.name} value={classItem.id}>{classItem.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Jenis
          <select value={form.type} onChange={(event) => updateField('type', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
            {['Teks', 'PDF', 'Video', 'Link'].map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Status
          <select value={form.status} onChange={(event) => updateField('status', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
            {['Draft', 'Publish'].map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700 md:col-span-2">Deskripsi
          <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} rows={3} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700 md:col-span-2">Konten materi
          <textarea value={form.content} onChange={(event) => updateField('content', event.target.value)} rows={6} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-2xl px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.title.trim()} className="rounded-2xl bg-galaxy-action px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Simpan materi</button>
      </div>
    </SectionCard>
  )
}

function emptyMaterial(lookups, teacherSubject) {
  const subject = lookups.subjects.find((item) => item.name === teacherSubject) || lookups.subjects[0]
  const classItem = lookups.classes[0]
  return {
    title: '',
    description: '',
    content: '',
    subjectId: subject?.id || '',
    classId: classItem?.id || '',
    subject: subject?.name || teacherSubject,
    className: classItem?.name || 'Kelas demo',
    topic: '',
    type: 'Teks',
    status: 'Draft',
  }
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '')
}

function BankSoal({ user, notify, appContext }) {
  const teacherSubject = user?.subject || 'Bahasa Inggris'
  const [rows, setRows] = useState([])
  const [lookups, setLookups] = useState({ subjects: [], classes: [] })
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    let active = true

    async function loadQuestions() {
      if (!appContext?.accessToken || !isUuid(user?.id)) {
        setRows(questions.filter((item) => item.subject === teacherSubject))
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
          setRows(questions.filter((item) => item.subject === teacherSubject))
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
      const localQuestion = { ...question, id: question.id || `local-question-${Date.now()}`, subject: teacherSubject, className: 'Kelas demo', source: 'local' }
      setRows((current) => question.id ? current.map((item) => item.id === question.id ? { ...item, ...localQuestion } : item) : [localQuestion, ...current])
      setEditing(null)
      notify('Soal tersimpan lokal. Login Supabase guru diperlukan untuk menyimpan ke database.')
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
      setRows((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
      notify('Soal demo dihapus dari tampilan lokal.')
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
      <PageHeader eyebrow="Bank Soal" title={`Bank soal ${teacherSubject}`} description="Soal dibatasi berdasarkan akun guru yang login dan siap dipakai untuk kuis berikutnya." action={<QuickActionButton icon={Plus} label="Tambah soal" onClick={() => setEditing(emptyQuestion(lookups, teacherSubject))} />} />
      {error && <div className="mb-4 rounded-3xl bg-amber-50 p-4 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data soal: {error}. Fallback dummy mapel guru ditampilkan.</div>}
      {editing && <QuestionForm question={editing} lookups={lookups} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label="Memuat bank soal dari Supabase..." /> : rows.length > 0 ? (
        <DataTable columns={[
          { key: 'questionText', label: 'Soal' },
          { key: 'subject', label: 'Mapel' },
          { key: 'topic', label: 'Topik' },
          { key: 'difficulty', label: 'Level' },
          { key: 'type', label: 'Jenis' },
          { key: 'action', label: 'Aksi', render: (row) => <div className="flex gap-2"><button onClick={() => setEditing(row)} className="rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-bold text-galaxy-purple">Edit</button><button onClick={() => setDeleting(row)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">Hapus</button></div> },
        ]} rows={rows} />
      ) : (
        <EmptyState title={`Belum ada soal ${teacherSubject}.`} description="Soal mapel yang Anda ampu akan tampil di sini setelah dibuat." />
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
  const subjectsList = lookups.subjects.length > 0 ? lookups.subjects : [{ id: '', name: question.subject || 'Bahasa Inggris' }]
  const classesList = lookups.classes.length > 0 ? lookups.classes : [{ id: '', name: question.className || 'Kelas demo' }]

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function submit() {
    onSave({
      ...form,
      options: form.optionsText.split('\n').map((item) => item.trim()).filter(Boolean),
    })
  }

  return (
    <SectionCard className="mb-5">
      <h2 className="text-xl font-extrabold text-gray-950">{form.id ? 'Edit soal' : 'Tambah soal'}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-gray-700 md:col-span-2">Pertanyaan
          <textarea value={form.questionText} onChange={(event) => updateField('questionText', event.target.value)} rows={3} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Mata pelajaran
          <select value={form.subjectId || ''} onChange={(event) => updateField('subjectId', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
            {subjectsList.map((subject) => <option key={subject.id || subject.name} value={subject.id}>{subject.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Kelas
          <select value={form.classId || ''} onChange={(event) => updateField('classId', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
            {classesList.map((classItem) => <option key={classItem.id || classItem.name} value={classItem.id}>{classItem.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Topik
          <input value={form.topic} onChange={(event) => updateField('topic', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Level
          <select value={form.difficulty} onChange={(event) => updateField('difficulty', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
            {['Mudah', 'Sedang', 'Sulit'].map((level) => <option key={level}>{level}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Jenis soal
          <select value={form.type} onChange={(event) => updateField('type', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
            {['Pilihan ganda', 'Benar/salah', 'Isian', 'Essay'].map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Jawaban benar
          <input value={form.correctAnswer} onChange={(event) => updateField('correctAnswer', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700 md:col-span-2">Pilihan jawaban, satu baris per opsi
          <textarea value={form.optionsText} onChange={(event) => updateField('optionsText', event.target.value)} rows={4} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700 md:col-span-2">Pembahasan
          <textarea value={form.explanation} onChange={(event) => updateField('explanation', event.target.value)} rows={3} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-2xl px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
        <button onClick={submit} disabled={!form.questionText.trim()} className="rounded-2xl bg-galaxy-action px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Simpan soal</button>
      </div>
    </SectionCard>
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
    subject: subject?.name || teacherSubject,
    className: classItem?.name || 'Kelas demo',
    topic: '',
    difficulty: 'Mudah',
    type: 'Pilihan ganda',
  }
}

function GuruTugas({ user, notify, appContext }) {
  const teacherSubject = user?.subject || 'Bahasa Inggris'
  const [rows, setRows] = useState([])
  const [lookups, setLookups] = useState({ subjects: [], classes: [] })
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function loadAssignments() {
      if (!appContext?.accessToken || !isUuid(user?.id)) {
        setRows(assignments.filter((item) => item.subject === teacherSubject))
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
          setRows(assignments.filter((item) => item.subject === teacherSubject))
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
      const localAssignment = { ...assignment, id: assignment.id || `local-assignment-${Date.now()}`, subject: teacherSubject, className: 'Kelas demo', source: 'local' }
      setRows((current) => assignment.id ? current.map((item) => item.id === assignment.id ? localAssignment : item) : [localAssignment, ...current])
      setEditing(null)
      notify('Tugas tersimpan lokal. Login Supabase guru diperlukan untuk menyimpan ke database.')
      return
    }

    try {
      const saved = await saveAssignment({ accessToken: appContext.accessToken, teacherId: user.id, assignment })
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
      setRows((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
      notify('Tugas demo dihapus.')
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

  return (
    <div>
      <PageHeader eyebrow="Tugas" title="Tugas kelas" description="Buat dan publish tugas untuk kelas yang Anda ajar." action={<QuickActionButton icon={Plus} label="Buat tugas" onClick={() => setEditing(emptyAssignment(lookups, teacherSubject))} />} />
      {error && <div className="mb-4 rounded-3xl bg-amber-50 p-4 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data tugas: {error}. Fallback dummy ditampilkan.</div>}
      {editing && <AssignmentForm assignment={editing} lookups={lookups} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label="Memuat tugas dari Supabase..." /> : rows.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <SectionCard key={row.id}>
              <div className="mb-4 flex items-center justify-between gap-2"><StatusBadge tone={statusTone(row.status)}>{row.status}</StatusBadge><StatusBadge tone="cyan">{row.className}</StatusBadge></div>
              <h2 className="text-lg font-extrabold">{row.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">{row.description}</p>
              <p className="mt-3 text-xs font-bold text-slate-500">{row.subject} · Deadline {row.deadline || '-'}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={() => setEditing(row)} className="rounded-2xl bg-galaxy-surface px-4 py-3 text-sm font-bold text-galaxy-purple">Edit</button>
                <button onClick={() => handleSave({ ...row, status: row.status === 'Aktif' ? 'Draft' : 'Aktif' })} className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">{row.status === 'Aktif' ? 'Unpublish' : 'Publish'}</button>
                <button onClick={() => setDeleting(row)} className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">Hapus</button>
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState title="Belum ada tugas." description="Klik Buat tugas untuk menambahkan tugas kelas." />
      )}
      <ConfirmDialog open={Boolean(deleting)} title="Hapus tugas?" description={`Tugas "${deleting?.title || ''}" akan dihapus setelah konfirmasi.`} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  )
}

function AssignmentForm({ assignment, lookups, onCancel, onSave }) {
  const [form, setForm] = useState(assignment)
  const subjectsList = lookups.subjects.length > 0 ? lookups.subjects : [{ id: '', name: assignment.subject || 'Bahasa Inggris' }]
  const classesList = lookups.classes.length > 0 ? lookups.classes : [{ id: '', name: assignment.className || 'Kelas demo' }]

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <SectionCard className="mb-5">
      <h2 className="text-xl font-extrabold text-gray-950">{form.id ? 'Edit tugas' : 'Buat tugas'}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-gray-700">Judul
          <input value={form.title} onChange={(event) => updateField('title', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Deadline
          <input type="date" value={form.deadline || ''} onChange={(event) => updateField('deadline', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Mata pelajaran
          <select value={form.subjectId || ''} onChange={(event) => updateField('subjectId', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
            {subjectsList.map((subject) => <option key={subject.id || subject.name} value={subject.id}>{subject.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Kelas
          <select value={form.classId || ''} onChange={(event) => updateField('classId', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
            {classesList.map((classItem) => <option key={classItem.id || classItem.name} value={classItem.id}>{classItem.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Status
          <select value={form.status} onChange={(event) => updateField('status', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
            {['Draft', 'Aktif', 'Selesai'].map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700 md:col-span-2">Deskripsi
          <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} rows={4} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-2xl px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.title.trim()} className="rounded-2xl bg-galaxy-action px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Simpan tugas</button>
      </div>
    </SectionCard>
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
    subject: subject?.name || teacherSubject,
    className: classItem?.name || 'Kelas demo',
    deadline: '',
    status: 'Draft',
  }
}

function KuisLive({ user, notify, appContext }) {
  const teacherSubject = user?.subject || 'Bahasa Inggris'
  const [quizRows, setQuizRows] = useState([])
  const [questionRows, setQuestionRows] = useState([])
  const [lookups, setLookups] = useState({ subjects: [], classes: [] })
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(Boolean(appContext?.accessToken))
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadTeacherQuizzes() {
      if (!appContext?.accessToken || !isUuid(user?.id)) {
        setQuizRows(quizzes.filter((item) => item.subject === teacherSubject))
        setQuestionRows(questions.filter((item) => item.subject === teacherSubject))
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
          setQuizRows(quizzes.filter((item) => item.subject === teacherSubject))
          setQuestionRows(questions.filter((item) => item.subject === teacherSubject))
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
      const localQuiz = { ...quiz, id: quiz.id || `local-quiz-${Date.now()}`, subject: teacherSubject, teacher: user?.name, className: 'Kelas demo', source: 'local' }
      setQuizRows((current) => quiz.id ? current.map((item) => item.id === quiz.id ? { ...item, ...localQuiz } : item) : [localQuiz, ...current])
      setEditing(null)
      notify('Kuis tersimpan lokal. Login Supabase guru diperlukan untuk menyimpan ke database.')
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
      setQuizRows((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
      notify('Kuis demo dihapus dari tampilan lokal.')
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
      <PageHeader eyebrow="Kuis Live" title="Kuis dan ujian dari bank soal" description="Buat kuis ringan, publish ke siswa, lalu pantau hasil submit." action={<QuickActionButton icon={FlaskConical} label="Buat Kuis" onClick={() => setEditing(emptyQuiz(lookups, teacherSubject))} />} />
      {error && <div className="mb-4 rounded-3xl bg-amber-50 p-4 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data kuis: {error}. Fallback dummy mapel guru ditampilkan.</div>}
      {editing && <QuizForm quiz={editing} lookups={lookups} questions={questionRows} onCancel={() => setEditing(null)} onSave={handleSave} />}
      <SectionCard dark><p className="text-sm text-white/60">Kode join kelas</p><p className="mt-3 text-6xl font-extrabold">482 913</p><p className="mt-3 text-white/70">{liveParticipants.length} peserta bergabung.</p></SectionCard>
      {loading ? <LoadingState label="Memuat kuis guru dari Supabase..." /> : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quizRows.map((quiz) => (
            <SectionCard key={quiz.id}>
              <div className="flex items-center justify-between gap-2"><StatusBadge tone={statusTone(quiz.status)}>{quiz.status}</StatusBadge><StatusBadge tone="cyan">{quiz.duration} menit</StatusBadge></div>
              <h2 className="mt-4 text-lg font-extrabold">{quiz.title}</h2>
              <p className="mt-2 text-sm text-gray-500">{quiz.subject} · {quiz.className}</p>
              <p className="mt-3 text-sm font-bold text-galaxy-purple">{attempts.filter((attempt) => attempt.quiz_id === quiz.id).length} attempt masuk</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={() => setEditing(quiz)} className="rounded-2xl bg-galaxy-surface px-4 py-3 text-sm font-bold text-galaxy-purple">Edit</button>
                <button onClick={() => handleSave({ ...quiz, status: quiz.status === 'Publish' ? 'Draft' : 'Publish' }, [])} className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">{quiz.status === 'Publish' ? 'Unpublish' : 'Publish'}</button>
                <button onClick={() => setDeleting(quiz)} className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">Hapus</button>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
      <ConfirmDialog open={Boolean(deleting)} title="Hapus kuis?" description={`Kuis "${deleting?.title || ''}" akan dihapus setelah konfirmasi.`} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  )
}

function QuizForm({ quiz, lookups, questions: availableQuestions, onCancel, onSave }) {
  const [form, setForm] = useState(quiz)
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([])
  const subjectsList = lookups.subjects.length > 0 ? lookups.subjects : [{ id: '', name: quiz.subject || 'Bahasa Inggris' }]
  const classesList = lookups.classes.length > 0 ? lookups.classes : [{ id: '', name: quiz.className || 'Kelas demo' }]

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function toggleQuestion(questionId) {
    setSelectedQuestionIds((current) => current.includes(questionId) ? current.filter((id) => id !== questionId) : [...current, questionId])
  }

  return (
    <SectionCard className="mb-5">
      <h2 className="text-xl font-extrabold text-gray-950">{form.id ? 'Edit kuis' : 'Buat kuis'}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-gray-700">Judul
          <input value={form.title} onChange={(event) => updateField('title', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Durasi menit
          <input type="number" value={form.duration} onChange={(event) => updateField('duration', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Mata pelajaran
          <select value={form.subjectId || ''} onChange={(event) => updateField('subjectId', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
            {subjectsList.map((subject) => <option key={subject.id || subject.name} value={subject.id}>{subject.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Kelas
          <select value={form.classId || ''} onChange={(event) => updateField('classId', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
            {classesList.map((classItem) => <option key={classItem.id || classItem.name} value={classItem.id}>{classItem.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Status
          <select value={form.status} onChange={(event) => updateField('status', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
            {['Draft', 'Publish'].map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700 md:col-span-2">Deskripsi
          <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} rows={3} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
      </div>
      <div className="mt-5">
        <p className="text-sm font-extrabold text-gray-950">Pilih soal dari bank soal</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {availableQuestions.map((question) => (
            <button key={question.id} onClick={() => toggleQuestion(question.id)} className={`rounded-2xl p-3 text-left text-sm font-semibold ring-1 ${selectedQuestionIds.includes(question.id) ? 'bg-galaxy-deep text-white ring-galaxy-deep' : 'bg-galaxy-surface text-gray-700 ring-purple-100'}`}>
              {question.questionText}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-2xl px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
        <button onClick={() => onSave(form, selectedQuestionIds)} disabled={!form.title.trim()} className="rounded-2xl bg-galaxy-action px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Simpan kuis</button>
      </div>
    </SectionCard>
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
    subject: subject?.name || teacherSubject,
    className: classItem?.name || 'Kelas demo',
    duration: 30,
    status: 'Draft',
  }
}

function AnalisisNilai() {
  return (
    <div>
      <PageHeader eyebrow="Analisis Nilai" title="Insight kelas untuk tindak lanjut." />
      <div className="mb-5 grid gap-3 sm:grid-cols-4"><StatCard label="Rata-rata" value="84" icon={BarChart3} /><StatCard label="Tertinggi" value="96" tone="green" /><StatCard label="Terendah" value="62" tone="amber" /><StatCard label="Soal sulit" value="7" tone="purple" /></div>
      <DashboardCard title="Sebaran nilai"><ResponsiveContainer width="100%" height={300}><BarChart data={scoreTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="nilai" fill="#7C3AED" radius={[12, 12, 0, 0]} /></BarChart></ResponsiveContainer></DashboardCard>
    </div>
  )
}

function RemedialPage({ notify }) {
  return <ManageList eyebrow="Remedial" title="Siswa di bawah KKM" rows={remedials} button="Kirim remedial" notify={notify} type="remedial" />
}

function AIGeneratorPage() {
  return <><PageHeader eyebrow="AI Generator" title="Buat soal, rangkuman, flashcard, dan rubrik." description="Output mock siap disimpan ke bank soal nanti." /><AIGeneratorMockup /></>
}

function LaporanGuru({ notify }) {
  return <ReportPage eyebrow="Laporan Guru" title="Laporan kelas, tugas, dan kuis" notify={notify} />
}

function AdminDashboard() {
  return (
    <div>
      <PageHeader
        eyebrow="Admin Center"
        title="Pusat kendali data sekolah."
        description="Kelola guru, siswa, kelas, mata pelajaran, laporan, dan backup data dari satu dashboard."
      />

      <section className="command-banner mb-5 rounded-[1.75rem] p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_18rem] lg:items-center">
          <div>
            <p className="text-sm font-extrabold text-galaxy-purple">Status Sistem</p>
            <h2 className="mt-2 text-balance text-3xl font-black tracking-[-0.04em] text-gray-950 sm:text-4xl">
              Data sekolah siap dipantau.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Gunakan menu admin untuk menjaga data guru, siswa, kelas, dan mata pelajaran tetap rapi.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <StatusBadge tone="green">Database aktif</StatusBadge>
              <StatusBadge tone="cyan">Backup tersedia</StatusBadge>
              <StatusBadge tone="purple">Role-based access</StatusBadge>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-4 shadow-soft ring-1 ring-purple-100">
            <p className="text-sm font-extrabold text-gray-950">Ringkasan Data</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Guru, siswa, kelas, dan mapel terpusat untuk kebutuhan aplikasi.</p>
          </div>
        </div>
      </section>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={UsersRound} label="Guru" value={teachers.length} caption="terdaftar" tone="purple" />
        <StatCard icon={School} label="Siswa" value={students.length} caption="terdata" tone="cyan" />
        <StatCard icon={BookOpen} label="Kelas" value={classes.length} caption="aktif" tone="amber" />
        <StatCard icon={ClipboardCheck} label="Mapel" value={subjects.length} caption="tersedia" tone="green" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <DashboardCard title="Prioritas Admin">
          {[
            'Periksa data siswa baru sebelum publikasi akun.',
            'Pastikan setiap guru sudah terhubung dengan mata pelajaran.',
            'Lakukan backup berkala setelah perubahan data besar.',
          ].map((item) => (
            <p key={item} className="border-b border-purple-50 py-3 text-sm leading-6 text-gray-600 last:border-b-0">{item}</p>
          ))}
        </DashboardCard>

        <DashboardCard title="Aktivitas Terbaru">
          {activities.slice(0, 5).map((activity) => (
            <p key={activity.id} className="border-b border-purple-50 py-3 text-sm leading-6 text-gray-600 last:border-b-0">
              <b>{activity.actor}</b> · {activity.action}
            </p>
          ))}
        </DashboardCard>
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
        setRows(fallbackRows)
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
          setRows(fallbackRows)
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
      const localProfile = { ...profile, id: profile.id || `local-${role}-${Date.now()}`, role }
      setRows((current) => profile.id ? current.map((item) => item.id === profile.id ? localProfile : item) : [localProfile, ...current])
      setEditing(null)
      notify(`${title} tersimpan lokal. Login admin Supabase diperlukan untuk menyimpan ke database.`)
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
      setRows((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
      notify('Data demo dihapus dari tampilan lokal.')
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
      <PageHeader eyebrow="Manajemen Data" title={title} description="Admin mengelola profile dan detail akademik. Akun login Auth tetap dibuat terpisah di Supabase Authentication." action={<QuickActionButton icon={Plus} label={`Tambah ${role === 'guru' ? 'guru' : 'siswa'}`} onClick={() => setEditing({ name: '', email: '', role, status: 'Aktif', detailStatus: 'Aktif' })} />} />
      {error && <div className="mb-4 rounded-3xl bg-amber-50 p-4 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data: {error}. Fallback dummy ditampilkan.</div>}
      {editing && <ProfileForm title={title} role={role} profile={editing} lookups={lookups} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label={`Memuat ${title.toLowerCase()} dari Supabase...`} /> : (
        <DataTable columns={[
          { key: 'name', label: 'Nama' },
          { key: 'email', label: 'Email' },
          ...(role === 'guru'
            ? [{ key: 'nip', label: 'NIP' }, { key: 'subject', label: 'Mapel' }]
            : [{ key: 'nis', label: 'NIS' }, { key: 'className', label: 'Kelas' }]),
          { key: 'status', label: 'Status' },
          { key: 'action', label: 'Aksi', render: (row) => <div className="flex gap-2"><button onClick={() => setEditing(row)} className="rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-bold text-galaxy-purple">Edit</button><button onClick={() => setDeleting(row)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">Hapus</button></div> },
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
    <SectionCard className="mb-5">
      <h2 className="text-xl font-extrabold text-gray-950">{profile.id ? `Edit ${title}` : `Tambah ${title}`}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-gray-700">Nama
          <input value={form.name} onChange={(event) => updateField('name', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Email
          <input value={form.email} onChange={(event) => updateField('email', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Status
          <select value={form.status || 'Aktif'} onChange={(event) => updateField('status', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
            {['Aktif', 'Nonaktif', 'Perlu perhatian'].map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        {role === 'siswa' && (
          <>
            <label className="grid gap-1 text-sm font-bold text-gray-700">NIS
              <input value={form.nis || ''} onChange={(event) => updateField('nis', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-gray-700">NISN
              <input value={form.nisn || ''} onChange={(event) => updateField('nisn', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-gray-700">Kelas
              <select value={form.classId || ''} onChange={(event) => updateField('classId', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
                <option value="">Pilih kelas</option>
                {lookups.classes.map((classItem) => <option key={classItem.id} value={classItem.id}>{classItem.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-bold text-gray-700">Gender
              <select value={form.gender || ''} onChange={(event) => updateField('gender', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
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
              <input value={form.nip || ''} onChange={(event) => updateField('nip', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
            </label>
            <label className="grid gap-1 text-sm font-bold text-gray-700">Mata pelajaran
              <select value={form.subjectId || ''} onChange={(event) => updateField('subjectId', event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
                <option value="">Pilih mapel</option>
                {lookups.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </label>
          </>
        )}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-2xl px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.name.trim() || !form.email.trim()} className="rounded-2xl bg-galaxy-action px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Simpan</button>
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
        setRows(classes)
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
          setRows(classes)
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
      setRows((current) => classItem.id ? current.map((item) => item.id === classItem.id ? localClass : item) : [localClass, ...current])
      setEditing(null)
      notify('Kelas tersimpan lokal.')
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
      setRows((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
      notify('Kelas demo dihapus.')
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
      <PageHeader eyebrow="Data Kelas" title="Kelola rombel" action={<QuickActionButton icon={Plus} label="Tambah kelas" onClick={() => setEditing({ name: '', grade: 10, academicYear: '2026/2027' })} />} />
      {error && <div className="mb-4 rounded-3xl bg-amber-50 p-4 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data kelas: {error}. Fallback dummy ditampilkan.</div>}
      {editing && <ClassForm classItem={editing} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label="Memuat kelas dari Supabase..." /> : (
        <DataTable columns={[
          { key: 'name', label: 'Kelas' },
          { key: 'grade', label: 'Tingkat' },
          { key: 'academic_year', label: 'Tahun Ajaran', render: (row) => row.academic_year || row.academicYear || '2026/2027' },
          { key: 'action', label: 'Aksi', render: (row) => <div className="flex gap-2"><button onClick={() => setEditing(row)} className="rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-bold text-galaxy-purple">Edit</button><button onClick={() => setDeleting(row)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">Hapus</button></div> },
        ]} rows={rows} />
      )}
      <ConfirmDialog open={Boolean(deleting)} title="Hapus kelas?" description={`Kelas "${deleting?.name || ''}" akan dihapus setelah konfirmasi.`} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  )
}

function ClassForm({ classItem, onCancel, onSave }) {
  const [form, setForm] = useState({ ...classItem, academicYear: classItem.academicYear || classItem.academic_year || '2026/2027' })
  return (
    <SectionCard className="mb-5">
      <h2 className="text-xl font-extrabold text-gray-950">{form.id ? 'Edit kelas' : 'Tambah kelas'}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-bold text-gray-700">Nama kelas
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Tingkat
          <input type="number" value={form.grade} onChange={(event) => setForm((current) => ({ ...current, grade: event.target.value }))} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Tahun ajaran
          <input value={form.academicYear} onChange={(event) => setForm((current) => ({ ...current, academicYear: event.target.value }))} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-2xl px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.name.trim()} className="rounded-2xl bg-galaxy-action px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Simpan</button>
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
        setRows(subjects)
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
          setRows(subjects)
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
      setRows((current) => subject.id ? current.map((item) => item.id === subject.id ? localSubject : item) : [localSubject, ...current])
      setEditing(null)
      notify('Mapel tersimpan lokal.')
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
      setRows((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
      notify('Mapel demo dihapus.')
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
      <PageHeader eyebrow="Manajemen Data" title="Mata Pelajaran" action={<QuickActionButton icon={Plus} label="Tambah mapel" onClick={() => setEditing({ name: '', code: '' })} />} />
      {error && <div className="mb-4 rounded-3xl bg-amber-50 p-4 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">Supabase belum mengirim data mapel: {error}. Fallback dummy ditampilkan.</div>}
      {editing && <SubjectForm subject={editing} onCancel={() => setEditing(null)} onSave={handleSave} />}
      {loading ? <LoadingState label="Memuat mata pelajaran dari Supabase..." /> : (
        <DataTable columns={[
          { key: 'name', label: 'Nama Mapel' },
          { key: 'code', label: 'Kode' },
          { key: 'teacher', label: 'Guru Pengampu' },
          { key: 'action', label: 'Aksi', render: (row) => <div className="flex gap-2"><button onClick={() => setEditing(row)} className="rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-bold text-galaxy-purple">Edit</button><button onClick={() => setDeleting(row)} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">Hapus</button></div> },
        ]} rows={rows} />
      )}
      <ConfirmDialog open={Boolean(deleting)} title="Hapus mapel?" description={`Mapel "${deleting?.name || ''}" akan dihapus setelah konfirmasi.`} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
    </div>
  )
}

function SubjectForm({ subject, onCancel, onSave }) {
  const [form, setForm] = useState(subject)
  return (
    <SectionCard className="mb-5">
      <h2 className="text-xl font-extrabold text-gray-950">{form.id ? 'Edit mapel' : 'Tambah mapel'}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-bold text-gray-700">Nama mapel
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
        <label className="grid gap-1 text-sm font-bold text-gray-700">Kode
          <input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-2xl px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.name.trim() || !form.code.trim()} className="rounded-2xl bg-galaxy-action px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Simpan</button>
      </div>
    </SectionCard>
  )
}

function Pengaturan({ notify }) {
  return (
    <div><PageHeader eyebrow="Pengaturan" title="Pengaturan aplikasi" description="Identitas sekolah, semester, KKM, tema, AI, dan maintenance mode." /><SectionCard><div className="grid gap-3 md:grid-cols-2">{['Nama sekolah', 'Logo sekolah', 'Tahun ajaran', 'Semester', 'KKM', 'Tema warna', 'Pengaturan ujian', 'Pengaturan AI'].map((item) => <label key={item} className="grid gap-1 text-sm font-bold text-gray-700">{item}<input defaultValue={item === 'Nama sekolah' ? 'SMA Negeri 6 Pangkajene dan Kepulauan' : ''} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none" /></label>)}</div><button onClick={() => notify('Pengaturan disimpan di mode demo.')} className="mt-5 rounded-2xl bg-galaxy-action px-5 py-3 text-sm font-bold text-white">Simpan pengaturan</button></SectionCard></div>
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
        app: 'SEA Learning',
        school: 'SMA Negeri 6 Pangkajene dan Kepulauan',
        data: { students, teachers, classes, subjects, materials, questions, quizzes },
      }
      downloadJson(fallback)
      notify('Backup JSON demo dibuat dari data lokal.')
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
    <div><PageHeader eyebrow="Backup" title="Backup aman dan terkendali" /><SectionCard><StatusBadge tone="green">Backup JSON tersedia</StatusBadge><p className="mt-4 text-sm text-gray-500">Backup mengekspor data utama ke file JSON. Restore tetap dinonaktifkan karena berisiko menghapus atau menimpa data dan perlu konfirmasi berlapis.</p><div className="mt-5 flex flex-wrap gap-2"><QuickActionButton icon={Download} label={exporting ? 'Membuat backup...' : 'Backup sekarang'} onClick={handleBackup} /><button onClick={() => setConfirmOpen(true)} className="rounded-2xl bg-rose-50 px-5 py-3 text-sm font-bold text-rose-700">Restore disabled</button></div></SectionCard></div>
  )
}

function downloadJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `sea-learning-backup-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

function PimpinanDashboard() {
  return (
    <div>
      <PageHeader
        eyebrow="Executive Dashboard"
        title="Monitoring sekolah secara menyeluruh."
        description="Pantau performa kelas, aktivitas guru, progres siswa, dan laporan akademik dari satu halaman."
      />

      <section className="dashboard-aurora-card island-wave mb-5 overflow-hidden rounded-[2rem] p-5 text-white shadow-glow sm:p-6">
        <div className="relative z-10 grid gap-5 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 lg:grid-cols-[1fr_18rem] lg:items-center">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-cyan-100">School Performance</p>
            <h2 className="mt-2 text-balance text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              Rata-rata akademik sekolah: 84.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-purple-100/85">
              Mayoritas kelas stabil, beberapa siswa membutuhkan perhatian lanjutan pada remedial dan kehadiran belajar.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-4 text-gray-950 shadow-soft">
            <ProgressRing value={84} label="Indeks akademik" />
          </div>
        </div>
      </section>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={School} label="Kelas aktif" value={classes.length} caption="terpantau" tone="purple" />
        <StatCard icon={UsersRound} label="Siswa" value={students.length} caption="dalam sistem" tone="cyan" />
        <StatCard icon={Trophy} label="Rata-rata" value="84" caption="akademik" tone="green" />
        <StatCard icon={Target} label="Perhatian" value="3" caption="kelas prioritas" tone="amber" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <DashboardCard title="Trend Nilai Sekolah">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={scoreTrend}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line dataKey="nilai" stroke="#7C3AED" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </DashboardCard>

        <DashboardCard title="Aktivitas Belajar">
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
      <PageHeader eyebrow={eyebrow} title={title} action={<QuickActionButton icon={Plus} label={button} onClick={() => notify(`${button} dibuka pada mode demo.`)} />} />
      {rows.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map((row) => <SectionCard key={row.id}><StatusBadge tone={statusTone(row.status)}>{row.status || row.subject}</StatusBadge><h2 className="mt-4 text-lg font-extrabold">{row.title || row.student}</h2><p className="mt-2 text-sm leading-6 text-gray-500">{row.description || row.subject || row.topic} {row.deadline ? `· Deadline ${row.deadline}` : ''}</p><button onClick={() => notify(`Membuka ${type} demo.`)} className="mt-5 rounded-2xl bg-galaxy-surface px-4 py-3 text-sm font-bold text-galaxy-purple">Detail</button></SectionCard>)}</div>
      ) : (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </div>
  )
}

function AdminTable({ title, rows, columns, button, notify = () => {}, setConfirmOpen = () => {} }) {
  return (
    <div><PageHeader eyebrow="Manajemen Data" title={title} action={<QuickActionButton icon={Plus} label={button} onClick={() => notify(`${button} placeholder dibuka.`)} />} /><DataTable columns={[...columns.map(([key, label]) => ({ key, label, render: key === 'classes' ? (row) => row.classes.join(', ') : undefined })), { key: 'action', label: 'Aksi', render: () => <button onClick={() => setConfirmOpen(true)} className="rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-bold text-galaxy-purple">Edit</button> }]} rows={rows} /></div>
  )
}

function CardsPage({ eyebrow, title, items, action }) {
  return <div><PageHeader eyebrow={eyebrow} title={title} action={action} /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <SectionCard key={`${item.title}-${item.meta}`}><StatusBadge>{item.status}</StatusBadge><h2 className="mt-4 text-xl font-extrabold">{item.title}</h2><p className="mt-2 text-sm text-gray-500">{item.meta}</p><p className="mt-4 text-2xl font-extrabold text-galaxy-purple">{item.value}</p><button className="mt-5 w-full rounded-2xl bg-galaxy-surface px-4 py-3 text-sm font-bold text-galaxy-purple">Detail</button></SectionCard>)}</div></div>
}

function ReportPage({ eyebrow, title, notify }) {
  return (
    <div><PageHeader eyebrow={eyebrow} title={title} action={<div className="flex gap-2"><QuickActionButton icon={Download} label="Export PDF" onClick={() => notify('Export PDF placeholder.')} /><QuickActionButton icon={Download} label="Export Excel" onClick={() => notify('Export Excel placeholder.')} /></div>} /><div className="grid gap-5 lg:grid-cols-2"><DashboardCard title="Trend nilai"><ResponsiveContainer width="100%" height={280}><LineChart data={scoreTrend}><XAxis dataKey="name" /><YAxis /><Tooltip /><Line dataKey="nilai" stroke="#7C3AED" strokeWidth={3} /></LineChart></ResponsiveContainer></DashboardCard><DashboardCard title="Aktivitas belajar"><ResponsiveContainer width="100%" height={280}><BarChart data={scoreTrend}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="aktivitas" fill="#22D3EE" radius={[12, 12, 0, 0]} /></BarChart></ResponsiveContainer></DashboardCard></div></div>
  )
}

function statusTone(status) {
  if (['Aktif', 'Berlangsung', 'Selesai', 'Terkirim', 'Publish'].includes(status)) return 'green'
  if (['Draft', 'Belum mulai', 'Dipelajari'].includes(status)) return 'amber'
  if (['Terlambat', 'Dikunci', 'Perlu latihan', 'Perlu perhatian'].includes(status)) return 'red'
  return 'purple'
}
