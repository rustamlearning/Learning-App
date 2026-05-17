import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  CheckCircle2,
  Cloud,
  Compass,
  FileQuestion,
  Layers3,
  LineChart,
  PenLine,
  Route,
  School,
  Sparkles,
  Trophy,
  UsersRound,
  Waves,
  Wifi,
} from 'lucide-react'
import { school } from '../data/dummyData.js'

const features = [
  {
    title: 'AI Tutor',
    icon: Bot,
    label: 'Bimbingan',
    description: 'Penjelasan bertahap untuk siswa yang butuh bantuan tanpa keluar dari ruang belajar.',
  },
  {
    title: 'Materi Belajar',
    icon: BookOpen,
    label: 'Konten',
    description: 'Materi dibuat ringkas, mudah dibaca dari HP, dan tetap siap dipakai guru.',
  },
  {
    title: 'Latihan & Ujian',
    icon: FileQuestion,
    label: 'Evaluasi',
    description: 'Kuis, latihan, pembahasan, dan catatan hasil belajar tersusun dalam satu alur.',
  },
  {
    title: 'Flashcard',
    icon: Layers3,
    label: 'Review',
    description: 'Review cepat untuk istilah penting, kosakata, dan konsep sebelum kuis.',
  },
  {
    title: 'Analisis Nilai',
    icon: BarChart3,
    label: 'Monitoring',
    description: 'Guru dan pimpinan bisa melihat progres siswa tanpa membuka banyak dokumen.',
  },
  {
    title: 'Mode Hemat Data',
    icon: Cloud,
    label: 'Akses',
    description: 'Tampilan ringan untuk sekolah kepulauan dengan kondisi jaringan yang berubah-ubah.',
  },
]

const audienceSections = [
  {
    label: 'Siswa',
    title: 'Belajar harian dengan jalur yang jelas.',
    icon: Trophy,
    points: ['Daily Mission', 'Learning Path', 'XP & Badge', 'IsleClub English Corner', 'AI Tutor'],
  },
  {
    label: 'Guru',
    title: 'Mengajar, membuat soal, dan membaca progres dari satu tempat.',
    icon: PenLine,
    points: ['Kelola materi', 'Bank soal', 'Tugas & kuis', 'Analisis nilai', 'AI Generator'],
  },
  {
    label: 'Sekolah',
    title: 'Monitoring akademik yang rapi untuk admin dan pimpinan.',
    icon: School,
    points: ['Dashboard admin', 'Monitoring pimpinan', 'Laporan sekolah', 'Backup data', 'Role-based access'],
  },
]

const signalCards = [
  ['4', 'role aktif', 'Siswa, guru, admin, pimpinan'],
  ['6+', 'fitur inti', 'Belajar, kuis, progres, AI'],
  ['24/7', 'akses ringan', 'Nyaman dibuka dari HP'],
]

const practiceCards = [
  ['Word of the Day', 'Harbor = pelabuhan'],
  ['Speaking Challenge', 'Describe your island in five sentences.'],
  ['Writing Prompt', 'Write about your school morning.'],
  ['AI English Feedback', 'Grammar dan vocabulary diperiksa otomatis.'],
]

export default function Landing() {
  return (
    <main className="min-h-dvh bg-[#f7f4ee] text-slate-950">
      <section className="relative overflow-hidden sea-ink-panel text-white">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_80%_24%,rgba(216,166,66,0.22),transparent_26rem)]" />

        <div className="relative mx-auto grid min-h-[76dvh] max-w-7xl gap-8 px-5 py-7 sm:px-6 lg:grid-cols-[0.94fr_1.06fr] lg:px-8 lg:py-10">
          <motion.div
            className="flex flex-col justify-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="mb-7 grid max-w-2xl gap-5 sm:grid-cols-[auto_1fr] sm:items-end">
              <div className="relative w-fit">
                <div className="absolute -inset-7 rounded-full bg-[#f1c36d]/16 blur-3xl" />
                <img
                  src="/brand/islelearn-logo.png"
                  alt="Logo IsleLearn"
                  className="relative h-44 w-44 object-contain drop-shadow-[0_18px_42px_rgba(0,0,0,0.32)] sm:h-56 sm:w-56 lg:h-64 lg:w-64"
                />
              </div>

              <div>
                <p className="mb-5 inline-flex w-fit items-center gap-2 border border-white/15 bg-white/[0.08] px-3 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-teal-50 backdrop-blur-md">
                  <Compass size={15} />
                  Platform belajar sekolah kepulauan
                </p>

                <h1 className="max-w-4xl text-balance text-5xl font-black leading-[0.95] text-white sm:text-6xl lg:text-7xl">
                  {school.appName}
                </h1>
              </div>
            </div>

            <p className="mt-5 max-w-xl text-balance text-2xl font-extrabold leading-tight text-[#b9e4dc] sm:text-3xl">
              Pembelajaran digital yang tetap ringan saat jaringan tidak selalu ramah.
            </p>

            <p className="mt-5 max-w-[62ch] text-base leading-8 text-slate-100/78">
              Dibangun untuk {school.name}: materi, kuis, AI tutor, progres siswa, dan monitoring sekolah dalam alur yang lebih tenang, jelas, dan siap dipakai dari perangkat apa pun.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center gap-2 bg-[#f1c36d] px-5 text-sm font-black text-[#16232b] shadow-[0_18px_42px_rgba(0,0,0,0.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffd37f] active:translate-y-0"
              >
                Masuk ke aplikasi <ArrowRight size={17} />
              </Link>

              <a
                href="#fitur"
                className="inline-flex min-h-12 items-center border border-white/16 bg-white/[0.08] px-5 text-sm font-extrabold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.13] active:translate-y-0"
              >
                Lihat fitur
              </a>
            </div>

            <div className="mt-8 grid max-w-2xl gap-2 sm:grid-cols-3">
              {signalCards.map(([value, label, detail]) => (
                <div key={label} className="border border-white/12 bg-white/[0.07] p-4 backdrop-blur-md">
                  <p className="font-mono text-3xl font-black leading-none text-white">{value}</p>
                  <p className="mt-2 text-sm font-black text-[#b9e4dc]">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-200/62">{detail}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative grid content-center gap-4 lg:pl-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <div className="paper-surface relative overflow-hidden rounded-[2rem] border border-white/60 p-5 text-slate-950 sm:p-6">
              <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[#d8a642]/20 blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f766e]">learning cockpit</p>
                  <h2 className="mt-3 max-w-sm text-balance text-3xl font-black leading-none tracking-[-0.02em] text-[#13232d]">
                    Hari belajar terlihat dalam satu layar.
                  </h2>
                </div>
                <div className="hidden h-16 w-16 place-items-center rounded-2xl bg-[#123c3b] text-[#f1c36d] shadow-xl sm:grid">
                  <Route size={30} />
                </div>
              </div>

              <div className="relative mt-6 grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl bg-[#123c3b] p-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b9e4dc]">progress siswa</p>
                  <div className="mt-5 flex items-end gap-2">
                    <span className="font-mono text-5xl font-black leading-none">72</span>
                    <span className="pb-1 text-lg font-black">%</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/15">
                    <div className="h-2 w-[72%] rounded-full bg-[#f1c36d]" />
                  </div>
                </div>

                <div className="grid gap-3">
                  {[
                    ['Materi baru', 'Bahasa Inggris - descriptive text'],
                    ['Kuis aktif', 'Matematika dasar, 15 soal'],
                    ['AI Tutor', 'Siap bantu jelaskan ulang materi'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-white/78 p-4 ring-1 ring-[#123c3b]/10">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0f766e]">{label}</p>
                      <p className="mt-1 text-sm font-extrabold leading-5 text-[#13232d]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [Wifi, 'Mode hemat data', 'Tampilan ringan untuk jaringan sekolah kepulauan.'],
                [LineChart, 'Monitoring sekolah', 'Data belajar lebih mudah dibaca pimpinan.'],
              ].map(([Icon, title, description]) => (
                <div key={title} className="border border-white/12 bg-white/[0.07] p-4 backdrop-blur-md">
                  <Icon className="text-[#f1c36d]" size={22} />
                  <p className="mt-3 text-base font-black">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-200/68">{description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="fitur" className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 grid gap-5 md:grid-cols-[0.82fr_1fr] md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0f766e]">Fitur utama</p>
            <h2 className="mt-3 max-w-2xl text-balance text-4xl font-black leading-none tracking-[-0.02em] text-[#13232d]">
              Satu alur belajar dari kelas sampai laporan.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-slate-600">
            Fokusnya bukan menambah layar sebanyak mungkin, tetapi membuat pekerjaan harian siswa, guru, admin, dan pimpinan terasa singkat dan terbaca.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-6">
          {features.map(({ title, icon: Icon, label, description }, index) => (
            <article
              key={title}
              className={`group rounded-[1.5rem] border border-[#123c3b]/10 bg-white/76 p-5 shadow-[0_18px_48px_rgba(15,31,42,0.06)] transition duration-200 hover:-translate-y-1 hover:border-[#0f766e]/24 hover:shadow-[0_22px_58px_rgba(15,31,42,0.10)] ${
                index < 2 ? 'lg:col-span-3' : 'lg:col-span-2'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e8f4ef] text-[#0f766e] ring-1 ring-[#0f766e]/10 transition group-hover:bg-[#123c3b] group-hover:text-white">
                  <Icon size={21} />
                </div>
                <span className="border border-[#123c3b]/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                  {label}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-black tracking-[-0.01em] text-[#13232d]">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        {audienceSections.map((section) => {
          const Icon = section.icon

          return (
            <article key={section.label} className="rounded-[1.5rem] bg-[#13232d] p-5 text-white shadow-[0_22px_58px_rgba(15,31,42,0.16)]">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-[#f1c36d] ring-1 ring-white/12">
                  <Icon size={22} />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#b9e4dc]">{section.label}</span>
              </div>
              <h2 className="text-balance text-2xl font-black leading-tight">{section.title}</h2>

              <div className="mt-5 grid gap-2">
                {section.points.map((point) => (
                  <div key={point} className="flex items-center gap-2 rounded-2xl bg-white/[0.07] px-3 py-2.5 text-sm font-bold text-slate-100 ring-1 ring-white/10">
                    <CheckCircle2 className="text-[#f1c36d]" size={16} />
                    {point}
                  </div>
                ))}
              </div>
            </article>
          )
        })}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-[#123c3b]/10 bg-white/82 p-5 shadow-[0_22px_58px_rgba(15,31,42,0.08)] md:p-7">
          <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 border border-[#0f766e]/15 bg-[#e8f4ef] px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#0f766e]">
                <Waves size={15} /> IsleClub English Corner
              </div>
              <h2 className="text-balance text-4xl font-black leading-none tracking-[-0.02em] text-[#13232d]">
                English practice yang dekat dengan hidup siswa.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
                Latihan Bahasa Inggris harian tentang pulau, sekolah, laut, keluarga, dan masa depan. Cukup singkat untuk dimulai, cukup jelas untuk membangun keberanian speaking.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {practiceCards.map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-[#f7f4ee] p-5 ring-1 ring-[#123c3b]/8">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0f766e]">{label}</p>
                  <p className="mt-2 text-sm font-extrabold leading-6 text-[#13232d]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] sea-ink-panel p-5 text-white shadow-[0_28px_70px_rgba(15,31,42,0.18)] md:p-7">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <UsersRound className="text-[#f1c36d]" />
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b9e4dc]">Role pengguna</p>
              </div>
              <h2 className="max-w-2xl text-balance text-3xl font-black leading-none">Siap dipakai oleh semua peran sekolah.</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Siswa', 'Guru', 'Admin', 'Pimpinan'].map((role) => (
                  <span key={role} className="border border-white/12 bg-white/[0.08] px-4 py-2 text-sm font-extrabold text-white">
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <Link
              to="/login"
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#f1c36d] px-5 text-sm font-black text-[#16232b] transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffd37f] active:translate-y-0"
            >
              Masuk sekarang <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#123c3b]/10 bg-[#fbfaf7] px-5 py-8 text-center text-sm text-slate-500">
        <b className="text-[#13232d]">IsleLearn</b>
        <br />
        {school.name}
        <br />
        Your Learning Galaxy Starts Here
      </footer>
    </main>
  )
}
