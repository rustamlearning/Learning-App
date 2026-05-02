import { useMemo, useState } from 'react'
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

export default function RolePage({ role, page }) {
  const { user } = useAuth()
  const [toast, setToast] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const notify = (message) => setToast(message)

  const content = useMemo(() => {
    if (role === 'siswa') return renderSiswa(page, user, notify)
    if (role === 'guru') return renderGuru(page, user, notify, setConfirmOpen)
    if (role === 'admin') return renderAdmin(page, notify, setConfirmOpen)
    return renderPimpinan(page, notify)
  }, [role, page, user])

  return (
    <>
      {content}
      <Toast message={toast} onClose={() => setToast('')} />
      <ConfirmDialog open={confirmOpen} title="Konfirmasi aksi" description="Aksi penting di aplikasi nyata akan meminta konfirmasi berlapis. Untuk demo ini, aksi hanya menampilkan feedback." onCancel={() => setConfirmOpen(false)} onConfirm={() => { setConfirmOpen(false); notify('Aksi dikonfirmasi pada mode demo.') }} />
    </>
  )
}

function renderSiswa(page, user, notify) {
  if (page === 'dashboard') return <SiswaDashboard user={user} notify={notify} />
  if (page === 'kelas') return <KelasSaya />
  if (page === 'materi') return <MateriBelajar notify={notify} />
  if (page === 'latihan') return <LatihanPage notify={notify} />
  if (page === 'kuis') return <KuisPage notify={notify} />
  if (page === 'flashcard') return <FlashcardPage />
  if (page === 'ai-tutor') return <AIPage />
  if (page === 'progres') return <ProgresPage />
  if (page === 'leaderboard') return <LeaderboardPage />
  if (page === 'seaclub') return <SEAClubPage />
  if (page === 'profil') return <ProfilPage user={user} />
  return <EmptyState />
}

function renderGuru(page, user, notify, setConfirmOpen) {
  if (page === 'dashboard') return <GuruDashboard notify={notify} />
  if (page === 'kelas') return <GuruKelas />
  if (page === 'materi') return <GuruMateri user={user} notify={notify} />
  if (page === 'bank-soal') return <BankSoal user={user} notify={notify} setConfirmOpen={setConfirmOpen} />
  if (page === 'tugas') return <GuruTugas notify={notify} />
  if (page === 'kuis-live') return <KuisLive notify={notify} />
  if (page === 'analisis-nilai') return <AnalisisNilai />
  if (page === 'remedial') return <RemedialPage notify={notify} />
  if (page === 'ai-generator') return <AIGeneratorPage />
  if (page === 'laporan') return <LaporanGuru notify={notify} />
  return <EmptyState />
}

function renderAdmin(page, notify, setConfirmOpen) {
  if (page === 'dashboard') return <AdminDashboard />
  if (page === 'guru') return <AdminGuru notify={notify} setConfirmOpen={setConfirmOpen} />
  if (page === 'siswa') return <AdminSiswa notify={notify} setConfirmOpen={setConfirmOpen} />
  if (page === 'kelas') return <AdminKelas notify={notify} />
  if (page === 'mapel') return <AdminMapel notify={notify} />
  if (page === 'pengaturan') return <Pengaturan notify={notify} />
  if (page === 'laporan') return <LaporanSekolah notify={notify} />
  if (page === 'backup') return <BackupPage notify={notify} setConfirmOpen={setConfirmOpen} />
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
  return (
    <div>
      <PageHeader eyebrow="Student Galaxy" title={`Selamat datang, ${user.name.split(' ')[0]} 👋`} description="Dari kepulauan, menuju masa depan. Selesaikan satu misi kecil, raih progres besar." action={<div className="flex gap-2"><QuickActionButton icon={BookOpen} label="Lanjutkan Belajar" onClick={() => notify('Membuka materi terakhir pada mode demo.')} /><QuickActionButton icon={Bot} label="Tanya AI Tutor" onClick={() => notify('AI Tutor siap di menu siswa.')} /></div>} />
      <section className="dashboard-aurora-card island-wave mb-5 overflow-hidden rounded-[2rem] p-5 text-white shadow-glow sm:p-6">
        <div className="absolute right-10 top-8 h-28 w-28 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="absolute bottom-3 left-12 h-24 w-44 rounded-full bg-purple-300/12 blur-3xl" />
        <div className="relative z-10 grid gap-5 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 lg:grid-cols-[1fr_17rem] lg:items-center">
          <div>
            <p className="text-sm font-bold text-cyan-100">Your learning galaxy starts from the islands</p>
            <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">Misi hari ini: 2/3 selesai.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-purple-100/82">Setiap topik adalah pulau baru untuk dijelajahi. Kamu makin dekat dengan mastery badge.</p>
            <div className="mt-5 h-3 max-w-md rounded-full bg-white/15">
              <div className="h-3 rounded-full bg-gradient-to-r from-galaxy-cyan via-galaxy-teal to-galaxy-gold" style={{ width: '67%' }} />
            </div>
            <p className="mt-2 text-xs font-bold text-cyan-100">Progress misi 67% · reward +50 XP</p>
          </div>
          <div className="rounded-3xl bg-white p-4 text-gray-950 shadow-soft">
            <ProgressRing value={72} label="Progress belajar" />
          </div>
        </div>
      </section>
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={LineChartIcon} label="Progress Belajar" value="72%" caption="Orbit belajar aktif" tone="purple" />
        <StatCard icon={Sparkles} label="XP Hari Ini" value="120 XP" caption="Target +50 XP lagi" tone="cyan" />
        <StatCard icon={CalendarClock} label="Streak" value="5 hari" caption="Jaga konsistensi" tone="amber" />
        <StatCard icon={Award} label="Nilai Rata-rata" value="84" caption="Naik 3 poin" tone="green" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <DailyMissionCard />
        <DashboardCard title="Learning Path"><LearningPath /></DashboardCard>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr_0.85fr]">
        <DashboardCard title="Smart Recommendation">
          <p className="text-sm leading-7 text-gray-600">Kamu masih perlu latihan di <b>Simple Past Tense</b>. Coba 10 menit hari ini agar grammar naik sebelum kuis berikutnya.</p>
          <button onClick={() => notify('Membuka latihan Simple Past Tense demo.')} className="mt-4 rounded-2xl bg-galaxy-surface px-4 py-3 text-sm font-bold text-galaxy-purple">Mulai latihan 10 menit</button>
        </DashboardCard>
        <DashboardCard title="Lanjutkan Belajar">
          <StatusBadge tone="cyan">Ringan dibuka</StatusBadge>
          <h3 className="mt-3 text-xl font-extrabold">Descriptive Text</h3>
          <p className="mt-2 text-sm text-gray-500">Progress 65% · Bahasa Inggris · Text Type</p>
          <div className="mt-4 h-2 rounded-full bg-galaxy-lavender"><div className="h-2 rounded-full bg-galaxy-action" style={{ width: '65%' }} /></div>
          <button onClick={() => notify('Melanjutkan Descriptive Text pada mode demo.')} className="mt-4 w-full rounded-2xl bg-galaxy-action px-4 py-3 text-sm font-bold text-white">Lanjutkan</button>
        </DashboardCard>
        <DashboardCard title="Upcoming Quiz">
          <StatusBadge tone="green">Berlangsung</StatusBadge>
          <h3 className="mt-3 text-lg font-extrabold">Quiz Descriptive Text</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">4 Mei 2026 · 20 menit · Rustam, S.Pd.</p>
          <button onClick={() => notify('Membuka detail kuis demo.')} className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">Cek kesiapan</button>
        </DashboardCard>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <DashboardCard title="Badge terbaru"><div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">{badges.filter((badge) => ['Island Starter', 'Vocabulary Voyager', 'SEAClub Speaker'].includes(badge.name)).map((badge) => <BadgeCard key={badge.id} badge={badge} />)}</div></DashboardCard>
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
              <button onClick={() => notify('SEAClub challenge dibuka pada mode demo.')} className="mt-3 rounded-2xl bg-teal-50 px-4 py-2.5 text-sm font-extrabold text-teal-700 ring-1 ring-teal-100">Mulai Challenge</button>
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

function MateriBelajar({ notify }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Semua')
  const filtered = materials.filter((item) => (filter === 'Semua' || item.status === filter || item.subject === filter) && item.title.toLowerCase().includes(search.toLowerCase()))
  return (
    <div>
      <PageHeader eyebrow="Materi Belajar" title="Jelajahi materi baru hari ini." description="Semua materi diberi label ringan dibuka untuk wilayah kepulauan." />
      <SearchFilterBar search={search} setSearch={setSearch} filters={['Semua', 'Bahasa Inggris', 'Matematika', 'Selesai', 'Dipelajari', 'Belum Mulai']} activeFilter={filter} setActiveFilter={setFilter} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => <MaterialCard key={item.id} item={item} notify={notify} />)}
      </div>
    </div>
  )
}

function MaterialCard({ item, notify }) {
  return (
    <SectionCard>
      <div className="mb-4 flex items-center justify-between"><StatusBadge tone="cyan">{item.subject}</StatusBadge><StatusBadge tone="green">Ringan dibuka</StatusBadge></div>
      <h2 className="text-xl font-extrabold text-gray-950">{item.title}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-500">{item.description}</p>
      <div className="mt-4 h-2 rounded-full bg-galaxy-lavender"><div className="h-2 rounded-full bg-galaxy-action" style={{ width: `${item.progress}%` }} /></div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button onClick={() => notify(`Membuka ${item.title}`)} className="rounded-2xl bg-galaxy-deep px-4 py-3 text-sm font-bold text-white">Lanjutkan</button>
        <button onClick={() => notify('AI Tutor siap membantu materi ini.')} className="rounded-2xl bg-galaxy-surface px-4 py-3 text-sm font-bold text-galaxy-purple">Tanya AI</button>
      </div>
    </SectionCard>
  )
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

function KuisPage({ notify }) {
  return (
    <div>
      <PageHeader eyebrow="Kuis / Ujian" title="Kuis aktif dan ujian resmi" description="Cek status sebelum mulai. Tidak ada autoplay, ringan dibuka." />
      <div className="grid gap-4 md:grid-cols-2">
        {quizzes.map((quiz) => (
          <SectionCard key={quiz.id}>
            <div className="flex items-center justify-between gap-3"><StatusBadge tone={statusTone(quiz.status)}>{quiz.status}</StatusBadge><span className="text-sm font-bold text-gray-500">{quiz.duration} menit</span></div>
            <h2 className="mt-4 text-xl font-extrabold">{quiz.title}</h2>
            <p className="mt-2 text-sm text-gray-500">{quiz.subject} · {quiz.teacher} · {quiz.date}</p>
            <button onClick={() => notify(quiz.status === 'Selesai' ? `Nilai kamu ${quiz.score}` : 'Membuka mode kuis demo.')} className="mt-5 w-full rounded-2xl bg-galaxy-action px-4 py-3 text-sm font-bold text-white">{quiz.status === 'Selesai' ? 'Lihat hasil' : 'Mulai / Detail'}</button>
          </SectionCard>
        ))}
      </div>
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
    ['Buat Kuis Live', PlayCircle],
    ['Buka AI Generator', Sparkles],
  ]

  return (
    <div>
      <PageHeader eyebrow="Teaching Command Center" title="Ruang mengajar modern." description="Kelola konten, kuis, dan sinyal kelas dengan cepat tanpa membuat dashboard terasa berat." />
      <section className="command-banner mb-5 rounded-[1.75rem] p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-sm font-extrabold text-galaxy-purple">Fokus Mengajar Hari Ini</p>
            <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-[-0.03em] text-gray-950 sm:text-4xl">117 siswa aktif belajar minggu ini.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">3 siswa perlu perhatian, 2 kuis berjalan, dan 5 tugas menunggu pantauan.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <StatusBadge>4 kelas aktif</StatusBadge>
              <StatusBadge tone="cyan">117 siswa aktif</StatusBadge>
              <StatusBadge tone="amber">5 tugas aktif</StatusBadge>
              <StatusBadge tone="purple">2 kuis berjalan</StatusBadge>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {quickActions.map(([label, Icon]) => (
              <button key={label} onClick={() => notify(`${label} dibuka pada mode demo.`)} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-purple-500/[0.12] bg-[linear-gradient(135deg,rgba(124,58,237,0.10),rgba(34,211,238,0.10))] px-4 text-sm font-bold text-purple-700 shadow-[0_10px_24px_rgba(30,27,75,0.06)] transition hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,rgba(124,58,237,0.16),rgba(34,211,238,0.14))]">
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
          ].map(([kelas, detail]) => <p key={kelas} className="mb-2 rounded-2xl bg-orange-50 p-3 text-sm font-semibold text-orange-800 ring-1 ring-orange-100"><b>{kelas}:</b> {detail}</p>)}
        </DashboardCard>
        <DashboardCard title="AI Insight">
          <div className="rounded-3xl bg-gradient-to-br from-purple-50 to-cyan-50 p-4 ring-1 ring-purple-100">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-galaxy-purple ring-1 ring-purple-200"><Sparkles size={18} /></div>
              <div>
                <p className="text-sm leading-6 text-gray-700"><b>Siswa banyak salah di Simple Past Tense.</b> Rekomendasi: buat latihan remedial 10 soal.</p>
                <button onClick={() => notify('AI Generator siap membuat remedial demo.')} className="mt-3 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-galaxy-purple ring-1 ring-purple-100">Buat remedial</button>
              </div>
            </div>
          </div>
        </DashboardCard>
        <DashboardCard title="Soal paling banyak salah">
          {[
            ['Simple Past Tense', '62% salah'],
            ['Narrative Text', '48% salah'],
            ['Persamaan Kuadrat', '41% salah'],
          ].map(([item, score]) => <p key={item} className="flex justify-between border-b border-purple-50 py-3 text-sm last:border-b-0"><span className="font-semibold text-gray-700">{item}</span><span className="text-slate-500">{score}</span></p>)}
        </DashboardCard>
        <DashboardCard title="Aktivitas Kelas Hari Ini">
          {['X.1 menyelesaikan Quiz Descriptive Text.', 'XI.1 membuka materi Narrative Text.', '12 siswa mengumpulkan tugas Daily Writing.'].map((item) => <p key={item} className="border-b border-purple-50 py-3 text-sm leading-6 text-gray-600 last:border-b-0">{item}</p>)}
        </DashboardCard>
        <DashboardCard title="Kuis & Tugas Terdekat" className="lg:col-span-2">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ['Quiz Descriptive Text', 'hari ini'],
              ['Tugas Daily Writing', 'besok'],
              ['Remedial Simple Past', '2 hari lagi'],
            ].map(([title, due]) => <div key={title} className="rounded-2xl bg-galaxy-surface p-4 ring-1 ring-purple-100"><p className="text-sm font-extrabold text-gray-900">{title}</p><p className="mt-1 text-sm text-slate-500">{due}</p></div>)}
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}

function GuruKelas() {
  return <CardsPage eyebrow="Kelas" title="Kelas yang diajar" items={classes.map((c) => ({ title: `${c.name} Bahasa Inggris`, meta: `${c.students} siswa · rata-rata ${c.average}`, value: `${c.progress}% progress`, status: `${Math.max(1, 6 - c.grade + 10)} remedial` }))} />
}

function GuruMateri({ user, notify }) {
  const teacherSubject = user?.subject || 'Bahasa Inggris'
  const ownMaterials = materials.filter((item) => item.subject === teacherSubject)
  return <ManageList eyebrow="Materi" title={`Kelola materi ${teacherSubject}`} rows={ownMaterials} button="Tambah materi" notify={notify} type="materi" emptyTitle={`Belum ada materi ${teacherSubject}.`} emptyDescription="Materi mapel yang Anda ampu akan tampil di sini setelah dibuat." />
}

function BankSoal({ user, notify, setConfirmOpen }) {
  const teacherSubject = user?.subject || 'Bahasa Inggris'
  const ownQuestions = questions.filter((item) => item.subject === teacherSubject)
  return (
    <div>
      <PageHeader eyebrow="Bank Soal" title={`Bank soal ${teacherSubject}`} description="Hanya menampilkan soal dari mata pelajaran yang Anda ampu." action={<QuickActionButton icon={Plus} label="Tambah soal" onClick={() => notify('Form tambah soal placeholder dibuka.')} />} />
      {ownQuestions.length > 0 ? (
        <DataTable columns={[
          { key: 'questionText', label: 'Soal' },
          { key: 'subject', label: 'Mapel' },
          { key: 'topic', label: 'Topik' },
          { key: 'difficulty', label: 'Level' },
          { key: 'type', label: 'Jenis' },
          { key: 'action', label: 'Aksi', render: () => <button onClick={() => setConfirmOpen(true)} className="rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-bold text-galaxy-purple">Edit/Hapus</button> },
        ]} rows={ownQuestions} />
      ) : (
        <EmptyState title={`Belum ada soal ${teacherSubject}.`} description="Soal mapel yang Anda ampu akan tampil di sini setelah dibuat." />
      )}
    </div>
  )
}

function GuruTugas({ notify }) {
  return <ManageList eyebrow="Tugas" title="Tugas kelas" rows={assignments} button="Buat tugas" notify={notify} type="tugas" />
}

function KuisLive({ notify }) {
  return (
    <div>
      <PageHeader eyebrow="Kuis Live" title="Live quiz seperti Kahoot, dibuat ringan." action={<QuickActionButton icon={FlaskConical} label="Buat Kuis Live" onClick={() => notify('Kode join 482 913 dibuat.')} />} />
      <SectionCard dark><p className="text-sm text-white/60">Kode join kelas</p><p className="mt-3 text-6xl font-extrabold">482 913</p><p className="mt-3 text-white/70">{liveParticipants.length} peserta bergabung.</p></SectionCard>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">{liveParticipants.map((name, index) => <SectionCard key={name}><p className="text-sm font-extrabold">{name}</p><p className="text-sm text-gray-500">Skor live {800 - index * 54}</p></SectionCard>)}</div>
    </div>
  )
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
  const weeklyActivity = [
    { day: 'Senin', value: 42 },
    { day: 'Selasa', value: 58 },
    { day: 'Rabu', value: 64 },
    { day: 'Kamis', value: 51 },
    { day: 'Jumat', value: 73 },
    { day: 'Sabtu', value: 35 },
  ]

  return (
    <div>
      <PageHeader eyebrow="Admin" title="Konsol sekolah" description="Pantau data inti, aktivitas sistem, dan status backup." />
      <section className="admin-overview-banner mb-5 rounded-[1.75rem] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-extrabold text-galaxy-purple">Admin Console</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.02em] text-gray-950 sm:text-3xl">Konsol sekolah.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Pantau data inti, aktivitas sistem, dan status backup dengan tampilan yang clean dan stabil.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="green">Online</StatusBadge>
            <StatusBadge tone="teal">Backup aman</StatusBadge>
            <StatusBadge tone="cyan">Hemat data aktif</StatusBadge>
          </div>
        </div>
      </section>
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6"><StatCard label="Siswa" value="145" /><StatCard label="Guru" value="24" tone="cyan" /><StatCard label="Kelas" value="5" tone="amber" /><StatCard label="Mapel" value="8" /><StatCard label="Materi" value="10" tone="green" /><StatCard label="Ujian aktif" value="2" tone="teal" /></div>
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <DashboardCard title="Status sistem">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100"><StatusBadge tone="green">Online</StatusBadge><p className="mt-3 text-sm font-bold text-emerald-800">Aplikasi siap dipakai</p></div>
            <div className="rounded-2xl bg-cyan-50 p-4 ring-1 ring-cyan-100"><StatusBadge tone="cyan">Hemat Data</StatusBadge><p className="mt-3 text-sm font-bold text-cyan-800">Media berat tidak autoplay</p></div>
            <div className="rounded-2xl bg-purple-50 p-4 ring-1 ring-purple-100"><StatusBadge>Backup</StatusBadge><p className="mt-3 text-sm font-bold text-purple-800">Terakhir 2 Mei 2026 08.00</p></div>
            <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100"><StatusBadge tone="amber">Maintenance</StatusBadge><p className="mt-3 text-sm font-bold text-amber-800">Nonaktif pada demo</p></div>
          </div>
        </DashboardCard>
        <DashboardCard title="Quick action">
          <div className="grid gap-2 sm:grid-cols-2">
            {['Tambah Siswa', 'Tambah Guru', 'Import Data', 'Lihat Laporan'].map((item) => <button key={item} className="rounded-2xl border border-purple-500/[0.08] bg-purple-500/[0.06] px-4 py-3 text-sm font-bold text-purple-700 transition hover:-translate-y-0.5 hover:bg-purple-500/[0.10]">{item}</button>)}
          </div>
        </DashboardCard>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <DashboardCard title="Grafik aktivitas mingguan">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={weeklyActivity}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="value" fill="#14B8A6" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>
        <DashboardCard title="Ringkasan status backup">
          <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
            <StatusBadge tone="green">Aman</StatusBadge>
            <p className="mt-3 text-sm font-bold text-emerald-800">Backup terakhir: 2 Mei 2026 08.00</p>
            <p className="mt-1 text-sm text-emerald-700">Mode restore: Nonaktif pada demo</p>
          </div>
        </DashboardCard>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <DashboardCard title="Aktivitas user">{activities.map((item) => <p key={item} className="border-b border-purple-50 py-3 text-sm leading-6 text-gray-600 last:border-b-0">{item}</p>)}</DashboardCard>
        <DashboardCard title="Ringkasan jumlah data">
          {[
            ['Data siswa aktif', '145'],
            ['Data guru aktif', '24'],
            ['Materi publish', '10'],
            ['Ujian aktif', '2'],
          ].map(([label, value]) => <p key={label} className="flex justify-between border-b border-purple-50 py-3 text-sm last:border-b-0"><span className="text-gray-600">{label}</span><b>{value}</b></p>)}
        </DashboardCard>
      </div>
    </div>
  )
}

function AdminGuru({ notify, setConfirmOpen }) {
  return <AdminTable title="Data Guru" rows={teachers} columns={[['name', 'Nama'], ['nip', 'NIP'], ['email', 'Email'], ['subject', 'Mapel'], ['status', 'Status']]} button="Tambah guru" notify={notify} setConfirmOpen={setConfirmOpen} />
}

function AdminSiswa({ notify, setConfirmOpen }) {
  return <AdminTable title="Data Siswa" rows={students} columns={[['name', 'Nama'], ['nis', 'NIS'], ['nisn', 'NISN'], ['className', 'Kelas'], ['status', 'Status']]} button="Tambah siswa / Import Excel" notify={notify} setConfirmOpen={setConfirmOpen} />
}

function AdminKelas({ notify }) {
  return <CardsPage eyebrow="Data Kelas" title="Kelola rombel" items={classes.map((c) => ({ title: c.name, meta: `Wali kelas ${c.homeroom}`, value: `${c.students} siswa`, status: `${c.progress}% progress` }))} action={<QuickActionButton icon={Plus} label="Tambah kelas" onClick={() => notify('Form tambah kelas placeholder.')} />} />
}

function AdminMapel({ notify }) {
  return <AdminTable title="Mata Pelajaran" rows={subjects} columns={[['name', 'Nama Mapel'], ['code', 'Kode'], ['teacher', 'Guru Pengampu'], ['classes', 'Kelas Terkait']]} button="Tambah mapel" notify={notify} />
}

function Pengaturan({ notify }) {
  return (
    <div><PageHeader eyebrow="Pengaturan" title="Pengaturan aplikasi" description="Identitas sekolah, semester, KKM, tema, AI, dan maintenance mode." /><SectionCard><div className="grid gap-3 md:grid-cols-2">{['Nama sekolah', 'Logo sekolah', 'Tahun ajaran', 'Semester', 'KKM', 'Tema warna', 'Pengaturan ujian', 'Pengaturan AI'].map((item) => <label key={item} className="grid gap-1 text-sm font-bold text-gray-700">{item}<input defaultValue={item === 'Nama sekolah' ? 'SMA Negeri 6 Pangkajene dan Kepulauan' : ''} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none" /></label>)}</div><button onClick={() => notify('Pengaturan disimpan di mode demo.')} className="mt-5 rounded-2xl bg-galaxy-action px-5 py-3 text-sm font-bold text-white">Simpan pengaturan</button></SectionCard></div>
  )
}

function LaporanSekolah({ notify }) {
  return <ReportPage eyebrow="Laporan Sekolah" title="Aktivitas, nilai, ujian, dan remedial" notify={notify} />
}

function BackupPage({ notify, setConfirmOpen }) {
  return (
    <div><PageHeader eyebrow="Backup" title="Backup aman dan terkendali" /><SectionCard><StatusBadge tone="green">Backup terakhir: 2 Mei 2026 08.00</StatusBadge><p className="mt-4 text-sm text-gray-500">Restore dinonaktifkan di demo dan membutuhkan konfirmasi berlapis di aplikasi nyata.</p><div className="mt-5 flex gap-2"><QuickActionButton icon={Download} label="Backup sekarang" onClick={() => notify('Backup demo dibuat.')} /><button onClick={() => setConfirmOpen(true)} className="rounded-2xl bg-rose-50 px-5 py-3 text-sm font-bold text-rose-700">Restore disabled</button></div></SectionCard></div>
  )
}

function PimpinanDashboard() {
  return (
    <div><PageHeader eyebrow="Pimpinan" title="Executive learning overview" description="Statistik seluruh sekolah dalam satu tampilan ringan." /><div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Kelas paling aktif" value="X.1" icon={School} /><StatCard label="Guru paling aktif" value="Rustam" icon={GraduationCapIcon} /><StatCard label="Siswa perhatian" value="5" icon={UsersRound} tone="amber" /><StatCard label="Mapel rendah" value="Fisika" icon={Target} tone="cyan" /></div><DashboardCard title="Aktivitas mingguan"><ResponsiveContainer width="100%" height={300}><LineChart data={scoreTrend}><XAxis dataKey="name" /><YAxis /><Tooltip /><Line dataKey="aktivitas" stroke="#22D3EE" strokeWidth={3} /><Line dataKey="nilai" stroke="#A855F7" strokeWidth={3} /></LineChart></ResponsiveContainer></DashboardCard></div>
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
  if (['Aktif', 'Berlangsung', 'Selesai', 'Terkirim'].includes(status)) return 'green'
  if (['Draft', 'Belum mulai', 'Dipelajari'].includes(status)) return 'amber'
  if (['Terlambat', 'Dikunci', 'Perlu latihan', 'Perlu perhatian'].includes(status)) return 'red'
  return 'purple'
}
