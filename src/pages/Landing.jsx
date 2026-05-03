import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Cloud,
  FileQuestion,
  Layers3,
  LineChart,
  PenLine,
  School,
  Sparkles,
  Trophy,
  UsersRound,
  Waves,
} from 'lucide-react'
import { school } from '../data/dummyData.js'

const features = [
  {
    title: 'AI Tutor',
    icon: Bot,
    color: 'text-violet-700 bg-violet-50 ring-violet-100',
    description: 'Pendamping belajar yang membantu siswa memahami materi secara bertahap dan aman.',
  },
  {
    title: 'Materi Belajar',
    icon: BookOpen,
    color: 'text-cyan-700 bg-cyan-50 ring-cyan-100',
    description: 'Materi ringan dibuka di laptop maupun HP, cocok untuk jaringan sekolah kepulauan.',
  },
  {
    title: 'Latihan & Ujian',
    icon: FileQuestion,
    color: 'text-teal-700 bg-teal-50 ring-teal-100',
    description: 'Latihan, kuis, ujian resmi, pembahasan, dan hasil belajar dalam satu sistem.',
  },
  {
    title: 'Flashcard',
    icon: Layers3,
    color: 'text-rose-700 bg-rose-50 ring-rose-100',
    description: 'Review cepat untuk kosakata, istilah, konsep penting, dan persiapan kuis.',
  },
  {
    title: 'Analisis Nilai',
    icon: BarChart3,
    color: 'text-orange-700 bg-orange-50 ring-orange-100',
    description: 'Grafik perkembangan siswa untuk guru, admin, dan pimpinan sekolah.',
  },
  {
    title: 'Mode Hemat Data',
    icon: Cloud,
    color: 'text-emerald-700 bg-emerald-50 ring-emerald-100',
    description: 'Desain ringan tanpa media berat berlebihan agar tetap nyaman di jaringan terbatas.',
  },
]

const audienceSections = [
  {
    label: 'Untuk Siswa',
    title: 'Belajar lebih terarah, ringan, dan menyenangkan.',
    icon: Trophy,
    accent: 'from-violet-600 to-cyan-400',
    points: ['Daily Mission', 'Learning Path', 'XP & Badge', 'SEAClub English Corner', 'AI Tutor'],
  },
  {
    label: 'Untuk Guru',
    title: 'Kelola pembelajaran tanpa dashboard yang rumit.',
    icon: PenLine,
    accent: 'from-teal-500 to-cyan-400',
    points: ['Kelola materi', 'Bank soal', 'Tugas & kuis', 'Analisis nilai', 'AI Generator'],
  },
  {
    label: 'Untuk Sekolah',
    title: 'Monitoring akademik sekolah dalam satu sistem.',
    icon: School,
    accent: 'from-rose-500 to-amber-400',
    points: ['Dashboard admin', 'Monitoring pimpinan', 'Laporan sekolah', 'Backup data', 'Role-based access'],
  },
]

const heroCards = [
  ['AI Tutor siap membantu', 'Siswa bisa memahami materi dengan penjelasan bertahap.'],
  ['Belajar singkat, progres meningkat', 'Misi harian membuat proses belajar lebih konsisten.'],
  ['Mode hemat data', 'Tampilan ringan untuk kondisi jaringan sekolah kepulauan.'],
  ['SEAClub English Corner', 'Latihan Bahasa Inggris harian yang dekat dengan kehidupan siswa.'],
]

export default function Landing() {
  return (
    <main className="min-h-dvh bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.20),transparent_30%),radial-gradient(circle_at_82%_72%,rgba(139,92,246,0.34),transparent_34%),linear-gradient(135deg,#0F172A_0%,#1E1B4B_48%,#4C1D95_100%)]" />
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />

        <div className="relative mx-auto grid min-h-[88dvh] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-100 ring-1 ring-white/15 backdrop-blur-md">
              <Sparkles size={15} />
              Digital Learning Platform
            </p>

            <h1 className="max-w-4xl text-balance text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-7xl">
              {school.appName}
            </h1>

            <p className="mt-5 max-w-xl text-xl font-extrabold text-cyan-200 sm:text-2xl">
              Dari Pesisir ke Masa Depan Digital.
            </p>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200/85 sm:text-lg">
              Platform pembelajaran digital modern untuk sekolah kepulauan:
              ringan, rapi, role-based, dan siap dikembangkan untuk siswa,
              guru, admin, dan pimpinan sekolah.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-violet-500 to-cyan-400 px-5 text-sm font-extrabold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl"
              >
                Masuk ke Aplikasi <ArrowRight size={17} />
              </Link>

              <a
                href="#fitur"
                className="inline-flex min-h-12 items-center rounded-2xl bg-white/10 px-5 text-sm font-extrabold text-white ring-1 ring-white/15 transition hover:bg-white/15"
              >
                Lihat Fitur
              </a>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {[
                ['4', 'Role pengguna'],
                ['6+', 'Fitur utama'],
                ['24/7', 'Akses belajar'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-md">
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="mt-1 text-xs font-bold text-cyan-100">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="grid gap-4 sm:grid-cols-2"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            {heroCards.map(([title, description], index) => (
              <div
                key={title}
                className={`rounded-3xl p-5 ring-1 ${
                  index === 0
                    ? 'bg-white text-slate-950 shadow-[0_24px_80px_rgba(34,211,238,0.18)] ring-white sm:col-span-2'
                    : 'bg-white/10 text-white ring-white/15 backdrop-blur-md'
                }`}
              >
                <Sparkles className={index === 0 ? 'text-violet-700' : 'text-cyan-200'} />
                <p className="mt-4 text-xl font-black tracking-[-0.02em]">{title}</p>
                <p className={`mt-2 text-sm leading-6 ${index === 0 ? 'text-slate-500' : 'text-slate-200/78'}`}>
                  {description}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="fitur" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold text-violet-700">Fitur utama</p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.04em]">
              Satu platform belajar untuk seluruh sekolah.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-slate-500">
            Dibuat agar pembelajaran digital terasa ringan, mudah dipakai, dan tetap terlihat profesional.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, icon: Icon, color, description }) => (
            <div
              key={title}
              className="group flex min-h-52 flex-col rounded-3xl bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-200 transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.10)]"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${color}`}>
                <Icon size={22} />
              </div>
              <h3 className="text-lg font-black">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{description}</p>
              <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.14em] text-violet-700">
                Ringan · Responsive · Siap integrasi
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 lg:grid-cols-3 lg:px-8">
        {audienceSections.map((section) => {
          const Icon = section.icon

          return (
            <article key={section.label} className="rounded-[2rem] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${section.accent} text-white shadow-lg`}>
                <Icon size={22} />
              </div>
              <p className="text-sm font-extrabold text-violet-700">{section.label}</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">{section.title}</h2>

              <div className="mt-5 grid gap-2">
                {section.points.map((point) => (
                  <div key={point} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-100">
                    {point}
                  </div>
                ))}
              </div>
            </article>
          )
        })}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-cyan-50 via-white to-violet-50 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] ring-1 ring-cyan-100 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-extrabold text-teal-700 ring-1 ring-cyan-100">
                <Waves size={15} /> SEAClub English Corner
              </div>
              <h2 className="text-balance text-4xl font-black tracking-[-0.04em] text-slate-950">
                English practice yang dekat dengan kehidupan siswa.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                Latihan Bahasa Inggris harian tentang pulau, sekolah, laut, keluarga,
                dan masa depan. Cocok untuk membangun keberanian speaking siswa.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Word of the Day', 'Explore = menjelajahi'],
                ['Speaking Challenge', 'Tell us about your island in 5 English sentences.'],
                ['Writing Prompt', 'Write a short paragraph about your school.'],
                ['AI English Feedback', 'Placeholder feedback grammar dan vocabulary.'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-3xl bg-white/90 p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] ring-1 ring-white/80">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-teal-700">{label}</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="rounded-[2rem] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
          <div className="mb-5 flex items-center gap-3">
            <UsersRound className="text-violet-700" />
            <h2 className="text-2xl font-black">Role pengguna</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {['Siswa', 'Guru', 'Admin', 'Pimpinan'].map((role) => (
              <div key={role} className="rounded-3xl bg-slate-50 p-4 text-center text-sm font-extrabold text-slate-800 ring-1 ring-slate-100">
                {role}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 rounded-3xl bg-slate-950 p-5 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-black tracking-[-0.02em]">Siap mulai belajar?</p>
              <p className="mt-1 text-sm text-slate-300">
                Masuk ke aplikasi dan lanjutkan progres belajar hari ini.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-violet-500 to-cyan-400 px-5 text-sm font-extrabold text-white shadow-lg transition hover:scale-[1.02]"
            >
              Masuk Sekarang <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
        <b className="text-slate-800">SEA Learning</b>
        <br />
        {school.name}
        <br />
        “Your Learning Galaxy Starts Here”
      </footer>
    </main>
  )
}
