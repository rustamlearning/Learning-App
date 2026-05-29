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

const signalStyles = [
  'border-cyan-300/25 bg-cyan-300/10 text-cyan-100',
  'border-amber-300/30 bg-amber-300/10 text-amber-100',
  'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
]

const featureStyles = [
  'border-cyan-300/20 bg-cyan-300/10 text-cyan-100',
  'border-amber-300/25 bg-amber-300/10 text-amber-100',
  'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
  'border-sky-300/20 bg-sky-300/10 text-sky-100',
  'border-lime-300/20 bg-lime-300/10 text-lime-100',
  'border-teal-200/20 bg-teal-200/10 text-teal-100',
]

const practiceCards = [
  ['Word of the Day', 'Harbor = pelabuhan'],
  ['Speaking Challenge', 'Describe your island in five sentences.'],
  ['Writing Prompt', 'Write about your school morning.'],
  ['AI English Feedback', 'Grammar dan vocabulary diperiksa otomatis.'],
]

export default function Landing() {
  return (
    <main className="min-h-dvh bg-[#041817] text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,#062f2e_0%,#0f766e_48%,#123c3b_100%)]">
        <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute inset-x-0 top-0 h-2 bg-[linear-gradient(90deg,#22d3ee,#facc15,#34d399)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,transparent,#041817)]" />

        <div className="relative mx-auto grid min-h-[76dvh] max-w-7xl gap-8 px-5 py-8 sm:px-6 lg:grid-cols-[0.94fr_1.06fr] lg:px-8 lg:py-10">
          <motion.div
            className="flex flex-col justify-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="mb-7 grid max-w-2xl gap-5 sm:grid-cols-[auto_1fr] sm:items-end">
              <div className="relative w-fit">
                <img
                  src="/brand/islelearn-logo.png"
                  alt="Logo IsleLearn"
                  className="relative h-44 w-44 object-contain drop-shadow-[0_24px_55px_rgba(0,0,0,0.32)] sm:h-56 sm:w-56 lg:h-64 lg:w-64"
                />
              </div>

              <div>
                <p className="mb-5 inline-flex w-fit items-center gap-2 border border-cyan-200/25 bg-white/10 px-3 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100 shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur-md">
                  <Compass size={15} />
                  Platform belajar sekolah kepulauan
                </p>

                <h1 className="max-w-4xl text-balance text-5xl font-black leading-[0.95] text-white sm:text-6xl lg:text-7xl">
                  {school.appName}
                </h1>
              </div>
            </div>

            <p className="mt-5 max-w-xl text-balance text-2xl font-extrabold leading-tight text-amber-100 sm:text-3xl">
              Pembelajaran digital yang tetap ringan saat jaringan tidak selalu ramah.
            </p>

            <p className="mt-5 max-w-[62ch] text-base leading-8 text-teal-50/80">
              Dibangun untuk {school.name}: materi, kuis, AI tutor, progres siswa, dan monitoring sekolah dalam alur yang lebih tenang, jelas, dan siap dipakai dari perangkat apa pun.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center gap-2 bg-[#facc15] px-5 text-sm font-black text-[#063332] shadow-[0_18px_42px_rgba(250,204,21,0.24)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#fde047] active:translate-y-0"
              >
                Masuk ke aplikasi <ArrowRight size={17} />
              </Link>

              <a
                href="#fitur"
                className="inline-flex min-h-12 items-center border border-cyan-100/20 bg-white/10 px-5 text-sm font-extrabold text-cyan-50 transition duration-200 hover:-translate-y-0.5 hover:bg-white/20 active:translate-y-0"
              >
                Lihat fitur
              </a>
            </div>

            <div className="mt-8 grid max-w-2xl gap-2 sm:grid-cols-3">
              {signalCards.map(([value, label, detail], index) => (
                <div key={label} className={`border p-4 shadow-[0_18px_45px_rgba(0,0,0,0.16)] backdrop-blur-md ${signalStyles[index]}`}>
                  <p className="font-mono text-3xl font-black leading-none text-white">{value}</p>
                  <p className="mt-2 text-sm font-black">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-teal-50/70">{detail}</p>
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
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#062f2e]/80 p-5 text-white shadow-[0_28px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#22d3ee,#facc15,#34d399)]" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">learning cockpit</p>
                  <h2 className="mt-3 max-w-sm text-balance text-3xl font-black leading-none tracking-[-0.02em] text-white">
                    Hari belajar terlihat dalam satu layar.
                  </h2>
                </div>
                <div className="hidden h-16 w-16 place-items-center rounded-2xl bg-white/10 text-[#facc15] ring-1 ring-white/10 sm:grid">
                  <Route size={30} />
                </div>
              </div>

              <div className="relative mt-6 grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl bg-[linear-gradient(135deg,#083b3a,#0f766e)] p-4 text-white ring-1 ring-white/10">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">progress siswa</p>
                  <div className="mt-5 flex items-end gap-2">
                    <span className="font-mono text-5xl font-black leading-none">72</span>
                    <span className="pb-1 text-lg font-black">%</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/20">
                    <div className="h-2 w-[72%] rounded-full bg-[#facc15]" />
                  </div>
                </div>

                <div className="grid gap-3">
                  {[
                    ['Materi baru', 'Bahasa Inggris - descriptive text'],
                    ['Kuis aktif', 'Matematika dasar, 15 soal'],
                    ['AI Tutor', 'Siap bantu jelaskan ulang materi'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-100">{label}</p>
                      <p className="mt-1 text-sm font-extrabold leading-5 text-white">{value}</p>
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
                <div key={title} className="border border-white/10 bg-white/10 p-4 text-white shadow-[0_18px_45px_rgba(0,0,0,0.16)] backdrop-blur-md">
                  <Icon className="text-[#facc15]" size={22} />
                  <p className="mt-3 text-base font-black">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-teal-50/70">{description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="fitur" className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="mb-7 grid gap-5 md:grid-cols-[0.82fr_1fr] md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">Fitur utama</p>
            <h2 className="mt-3 max-w-2xl text-balance text-4xl font-black leading-none tracking-[-0.02em] text-white">
              Satu alur belajar dari kelas sampai laporan.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-teal-50/70">
            Fokusnya bukan menambah layar sebanyak mungkin, tetapi membuat pekerjaan harian siswa, guru, admin, dan pimpinan terasa singkat dan terbaca.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-6">
          {features.map(({ title, icon: Icon, label, description }, index) => (
            <article
              key={title}
              className={`group rounded-[1.5rem] border p-5 shadow-[0_18px_48px_rgba(0,0,0,0.18)] transition duration-200 hover:-translate-y-1 hover:bg-white/20 ${
                index < 2 ? 'lg:col-span-3' : 'lg:col-span-2'
              } ${featureStyles[index]}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10 transition group-hover:bg-white/20">
                  <Icon size={21} />
                </div>
                <span className="border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-teal-50/70">
                  {label}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-black tracking-[-0.01em] text-white">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-teal-50/70">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        {audienceSections.map((section, index) => {
          const Icon = section.icon

          return (
            <article key={section.label} className="rounded-[1.5rem] border border-white/10 bg-[#062f2e]/70 p-5 text-white shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-[#facc15] ring-1 ring-white/10">
                  <Icon size={22} />
                </div>
                <span className={index === 1 ? 'text-xs font-black uppercase tracking-[0.18em] text-amber-100' : 'text-xs font-black uppercase tracking-[0.18em] text-cyan-100'}>
                  {section.label}
                </span>
              </div>
              <h2 className="text-balance text-2xl font-black leading-tight">{section.title}</h2>

              <div className="mt-5 grid gap-2">
                {section.points.map((point) => (
                  <div key={point} className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2.5 text-sm font-bold text-teal-50/80 ring-1 ring-white/10">
                    <CheckCircle2 className="text-[#facc15]" size={16} />
                    {point}
                  </div>
                ))}
              </div>
            </article>
          )
        })}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-cyan-200/20 bg-[linear-gradient(135deg,#062f2e_0%,#0b4b49_48%,#083332_100%)] p-5 shadow-[0_22px_58px_rgba(0,0,0,0.24)] md:p-7">
          <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 border border-cyan-100/20 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-cyan-100">
                <Waves size={15} /> IsleClub English Corner
              </div>
              <h2 className="text-balance text-4xl font-black leading-none tracking-[-0.02em] text-white">
                English practice yang dekat dengan hidup siswa.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-teal-50/70">
                Latihan Bahasa Inggris harian tentang pulau, sekolah, laut, keluarga, dan masa depan. Cukup singkat untuk dimulai, cukup jelas untuk membangun keberanian speaking.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {practiceCards.map(([label, value], index) => (
                <div key={label} className={`rounded-2xl border p-5 ${signalStyles[index % signalStyles.length]}`}>
                  <p className="text-xs font-black uppercase tracking-[0.14em]">{label}</p>
                  <p className="mt-2 text-sm font-extrabold leading-6 text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 text-white shadow-[0_22px_58px_rgba(0,0,0,0.20)] md:p-7">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <UsersRound className="text-[#facc15]" />
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Role pengguna</p>
              </div>
              <h2 className="max-w-2xl text-balance text-3xl font-black leading-none">Siap dipakai oleh semua peran sekolah.</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Siswa', 'Guru', 'Admin', 'Pimpinan'].map((role) => (
                  <span key={role} className="border border-white/10 bg-white/10 px-4 py-2 text-sm font-extrabold text-teal-50/80">
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <Link
              to="/login"
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#facc15] px-5 text-sm font-black text-[#063332] transition duration-200 hover:-translate-y-0.5 hover:bg-[#fde047] active:translate-y-0"
            >
              Masuk sekarang <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#031312] px-5 py-8 text-center text-sm text-teal-50/60">
        <b className="text-white">IsleLearn</b>
        <br />
        {school.name}
        <br />
        Your Learning Galaxy Starts Here
      </footer>
    </main>
  )
}
