import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, BookOpen, Bot, Cloud, FileQuestion, Layers3, LineChart, PenLine, School, Sparkles, Trophy, UsersRound, Waves } from 'lucide-react'
import { school } from '../data/dummyData.js'

const features = [
  { title: 'AI Tutor', icon: Bot, color: 'text-galaxy-purple bg-purple-50 ring-purple-100', description: 'Teman belajar yang menjelaskan materi bertahap dan aman untuk siswa.' },
  { title: 'Materi Belajar', icon: BookOpen, color: 'text-galaxy-cyan bg-cyan-50 ring-cyan-100', description: 'Materi ringan dibuka, cocok untuk HP dan jaringan kepulauan.' },
  { title: 'Latihan & Ujian', icon: FileQuestion, color: 'text-galaxy-teal bg-teal-50 ring-teal-100', description: 'Latihan pendek, kuis aktif, ujian resmi, dan hasil belajar terpantau.' },
  { title: 'Flashcard', icon: Layers3, color: 'text-galaxy-coral bg-rose-50 ring-rose-100', description: 'Review kosakata, istilah, dan rumus dengan kartu flip sederhana.' },
  { title: 'Analisis Nilai', icon: BarChart3, color: 'text-galaxy-orange bg-orange-50 ring-orange-100', description: 'Grafik perkembangan untuk siswa, guru, admin, dan pimpinan.' },
  { title: 'Mode Hemat Data', icon: Cloud, color: 'text-emerald-700 bg-emerald-50 ring-emerald-100', description: 'Indikator dan pola UI yang menghindari media berat secara default.' },
]

const audienceSections = [
  {
    label: 'Untuk Siswa',
    title: 'Belajar terasa seperti menjelajah pulau baru.',
    icon: Trophy,
    accent: 'from-galaxy-purple to-galaxy-cyan',
    points: ['Daily Mission', 'Learning Path', 'XP & Badge', 'SEAClub English Corner', 'AI Tutor'],
  },
  {
    label: 'Untuk Guru',
    title: 'Teaching command center yang ringan.',
    icon: PenLine,
    accent: 'from-galaxy-teal to-galaxy-cyan',
    points: ['Kelola materi', 'Bank soal', 'Tugas dan kuis', 'Analisis nilai', 'AI Generator'],
  },
  {
    label: 'Untuk Sekolah',
    title: 'Pantauan akademik dalam satu orbit.',
    icon: School,
    accent: 'from-galaxy-coral to-galaxy-gold',
    points: ['Dashboard admin', 'Monitoring pimpinan', 'Laporan sekolah', 'Backup data', 'Mode hemat jaringan'],
  },
]

export default function Landing() {
  return (
    <main className="min-h-dvh bg-galaxy-surface text-gray-950">
      <section className="aurora-bg relative overflow-hidden text-white">
        <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-galaxy-magenta/14 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-galaxy-cyan/12 blur-3xl" />
        <div className="relative mx-auto grid min-h-[88dvh] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 ring-1 ring-white/15">Purple Galaxy Learning · Light, AI-ready, island-friendly</p>
            <h1 className="max-w-4xl text-balance text-5xl font-extrabold tracking-[-0.04em] sm:text-7xl">{school.appName}</h1>
            <p className="mt-5 text-2xl font-bold text-galaxy-cyan">{school.tagline}</p>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-purple-100/86">Platform belajar digital modern untuk sekolah kepulauan. Dari Pangkajene dan Kepulauan, menuju masa depan belajar yang ringan, rapi, dan terhubung.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-galaxy-action px-5 text-sm font-extrabold text-white shadow-glow">
                Mulai Belajar <ArrowRight size={17} />
              </Link>
              <a href="#fitur" className="inline-flex min-h-12 items-center rounded-2xl bg-white/10 px-5 text-sm font-extrabold text-white ring-1 ring-white/15">Lihat Fitur</a>
            </div>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2">
            {['AI Tutor siap membantu', 'Belajar singkat, progres meningkat', 'Mode Hemat Data', 'SEAClub English Corner'].map((item, index) => (
              <div key={item} className={`island-wave rounded-3xl p-5 ring-1 ring-white/10 ${index === 0 ? 'bg-white text-gray-950 shadow-glow sm:col-span-2' : 'bg-white/10 text-white'}`}>
                <Sparkles className={index === 0 ? 'text-galaxy-purple' : 'text-galaxy-cyan'} />
                <p className="mt-4 text-xl font-extrabold">{item}</p>
                <p className={`mt-2 text-sm leading-6 ${index === 0 ? 'text-gray-500' : 'text-purple-100/78'}`}>Teruskan orbit belajarmu dengan pengalaman yang ringan, rapi, dan modern.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="fitur" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-bold text-galaxy-purple">Fitur utama</p>
          <h2 className="mt-2 text-4xl font-extrabold tracking-[-0.03em]">Satu learning galaxy untuk seluruh sekolah.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, Icon, icon, color, description }) => {
            const FeatureIcon = Icon || icon
            return (
            <div key={title} className="group flex min-h-52 flex-col rounded-3xl bg-white p-5 shadow-soft ring-1 ring-purple-100 transition duration-200 hover:-translate-y-1 hover:shadow-ocean">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${color}`}><FeatureIcon size={22} /></div>
              <h3 className="text-lg font-extrabold">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-gray-500">{description}</p>
              <p className="mt-4 text-xs font-extrabold text-galaxy-purple">Ringan, responsive, siap integrasi</p>
            </div>
          )})}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 lg:grid-cols-3 lg:px-8">
        {audienceSections.map((section) => {
          const Icon = section.icon
          return (
          <article key={section.label} className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-purple-100">
            <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${section.accent} text-white shadow-glow`}>
              <Icon size={22} />
            </div>
            <p className="text-sm font-bold text-galaxy-purple">{section.label}</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.02em]">{section.title}</h2>
            <div className="mt-5 grid gap-2">
              {section.points.map((point) => (
                <div key={point} className="rounded-2xl bg-galaxy-surface px-4 py-3 text-sm font-bold text-gray-700">{point}</div>
              ))}
            </div>
          </article>
        )})}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="archipelago-soft island-wave overflow-hidden rounded-[2.25rem] p-6 shadow-ocean ring-1 ring-cyan-100 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-extrabold text-galaxy-teal ring-1 ring-cyan-100">
                <Waves size={15} /> SEAClub English Corner
              </div>
              <h2 className="text-balance text-4xl font-extrabold tracking-[-0.03em] text-gray-950">Your learning galaxy starts from the islands.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">Latihan Bahasa Inggris harian yang dekat dengan kehidupan siswa kepulauan: bicara tentang pulau, sekolah, laut, keluarga, dan masa depan.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Word of the Day', 'Explore = menjelajahi'],
                ['Speaking Challenge', 'Tell us about your island in 5 English sentences.'],
                ['Writing Prompt', 'Write a short paragraph about your school.'],
                ['AI English Feedback', 'Placeholder feedback grammar dan vocabulary.'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl bg-white/88 p-5 shadow-soft ring-1 ring-white/80">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-galaxy-teal">{label}</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-gray-800">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-purple-100">
          <div className="mb-5 flex items-center gap-3">
            <UsersRound className="text-galaxy-purple" />
            <h2 className="text-2xl font-extrabold">Role pengguna</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            {['Siswa', 'Guru', 'Admin', 'Pimpinan'].map((role) => <div key={role} className="rounded-3xl bg-galaxy-surface p-4 text-center text-sm font-extrabold text-galaxy-deep">{role}</div>)}
          </div>
          <p className="mt-5 text-center text-sm font-semibold text-slate-500">Belajar ringan, tetap terhubung. Setiap topik adalah pulau baru untuk dijelajahi.</p>
        </div>
      </section>

      <footer className="border-t border-purple-100 bg-white px-5 py-8 text-center text-sm text-gray-500">
        <b className="text-gray-800">SEA Learning</b><br />
        {school.name}<br />
        “Your Learning Galaxy Starts Here”
      </footer>
    </main>
  )
}
