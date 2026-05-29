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
  'bg-[#ecfeff] text-[#0f766e] border-[#67e8f9]/40 shadow-[0_14px_34px_rgba(8,145,178,0.10)]',
  'bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]/70 shadow-[0_14px_34px_rgba(234,88,12,0.09)]',
  'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]/70 shadow-[0_14px_34px_rgba(22,163,74,0.09)]',
]

const practiceCards = [
  ['Word of the Day', 'Harbor = pelabuhan'],
  ['Speaking Challenge', 'Describe your island in five sentences.'],
  ['Writing Prompt', 'Write about your school morning.'],
  ['AI English Feedback', 'Grammar dan vocabulary diperiksa otomatis.'],
]

const featureStyles = [
  {
    card: 'bg-[#ecfeff] border-[#67e8f9]/45 shadow-[0_18px_44px_rgba(8,145,178,0.10)]',
    icon: 'bg-white text-[#0891b2] ring-[#67e8f9]/45 group-hover:bg-[#0891b2]',
    label: 'bg-white/78 text-[#0891b2] border-[#67e8f9]/45',
  },
  {
    card: 'bg-[#fff7ed] border-[#fed7aa]/70 shadow-[0_18px_44px_rgba(234,88,12,0.09)]',
    icon: 'bg-white text-[#ea580c] ring-[#fed7aa]/70 group-hover:bg-[#ea580c]',
    label: 'bg-white/78 text-[#c2410c] border-[#fed7aa]/70',
  },
  {
    card: 'bg-[#f0fdf4] border-[#bbf7d0]/70 shadow-[0_18px_44px_rgba(22,163,74,0.09)]',
    icon: 'bg-white text-[#16a34a] ring-[#bbf7d0]/70 group-hover:bg-[#16a34a]',
    label: 'bg-white/78 text-[#15803d] border-[#bbf7d0]/70',
  },
  {
    card: 'bg-[#eef2ff] border-[#c7d2fe]/70 shadow-[0_18px_44px_rgba(79,70,229,0.09)]',
    icon: 'bg-white text-[#4f46e5] ring-[#c7d2fe]/70 group-hover:bg-[#4f46e5]',
    label: 'bg-white/78 text-[#4338ca] border-[#c7d2fe]/70',
  },
  {
    card: 'bg-[#fdf2f8] border-[#fbcfe8]/70 shadow-[0_18px_44px_rgba(219,39,119,0.08)]',
    icon: 'bg-white text-[#db2777] ring-[#fbcfe8]/70 group-hover:bg-[#db2777]',
    label: 'bg-white/78 text-[#be185d] border-[#fbcfe8]/70',
  },
  {
    card: 'bg-[#fefce8] border-[#fde68a]/80 shadow-[0_18px_44px_rgba(202,138,4,0.08)]',
    icon: 'bg-white text-[#ca8a04] ring-[#fde68a]/80 group-hover:bg-[#ca8a04]',
    label: 'bg-white/78 text-[#a16207] border-[#fde68a]/80',
  },
]

const audienceStyles = [
  {
    card: 'bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_68%)] border-[#67e8f9]/45',
    icon: 'bg-[#cffafe] text-[#0891b2] ring-[#67e8f9]/40',
    tag: 'text-[#0891b2]',
    point: 'bg-white/82 ring-[#67e8f9]/30',
  },
  {
    card: 'bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_68%)] border-[#fed7aa]/70',
    icon: 'bg-[#ffedd5] text-[#ea580c] ring-[#fed7aa]/60',
    tag: 'text-[#c2410c]',
    point: 'bg-white/82 ring-[#fed7aa]/50',
  },
  {
    card: 'bg-[linear-gradient(135deg,#eef2ff_0%,#ffffff_68%)] border-[#c7d2fe]/70',
    icon: 'bg-[#e0e7ff] text-[#4f46e5] ring-[#c7d2fe]/60',
    tag: 'text-[#4338ca]',
    point: 'bg-white/82 ring-[#c7d2fe]/50',
  },
]

const practiceStyles = [
  'bg-[#ecfeff] text-[#0891b2] ring-[#67e8f9]/40',
  'bg-[#fff7ed] text-[#c2410c] ring-[#fed7aa]/60',
  'bg-[#f0fdf4] text-[#15803d] ring-[#bbf7d0]/60',
  'bg-[#eef2ff] text-[#4338ca] ring-[#c7d2fe]/60',
]

export default function Landing() {
  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#fffaf0_0%,#f8fafc_34%,#eff6ff_100%)] text-slate-950">
      <section className="relative overflow-hidden border-b border-[#123c3b]/10 bg-[linear-gradient(135deg,#fff7ed_0%,#ecfeff_42%,#eef2ff_100%)] text-[#13232d]">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.74))]" />
        <div className="absolute right-0 top-0 h-full w-[58%] bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(250,204,21,0.14)_42%,rgba(244,114,182,0.12))]" />
        <div className="absolute left-0 top-0 h-2 w-full bg-[linear-gradient(90deg,#0f766e,#0ea5e9,#f59e0b,#ec4899)]" />

        <div className="relative mx-auto grid min-h-[76dvh] max-w-7xl gap-8 px-5 py-7 sm:px-6 lg:grid-cols-[0.94fr_1.06fr] lg:px-8 lg:py-10">
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
                  className="relative h-44 w-44 object-contain sm:h-56 sm:w-56 lg:h-64 lg:w-64"
                />
              </div>

              <div>
                <p className="mb-5 inline-flex w-fit items-center gap-2 border border-[#0f766e]/15 bg-white/85 px-3 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#0f766e] shadow-[0_12px_30px_rgba(15,31,42,0.06)] backdrop-blur-md">
                  <Compass size={15} />
                  Platform belajar sekolah kepulauan
                </p>

                <h1 className="max-w-4xl text-balance text-5xl font-black leading-[0.95] text-[#13232d] sm:text-6xl lg:text-7xl">
                  {school.appName}
                </h1>
              </div>
            </div>

            <p className="mt-5 max-w-xl text-balance text-2xl font-extrabold leading-tight text-[#0f766e] sm:text-3xl">
              Pembelajaran digital yang tetap ringan saat jaringan tidak selalu ramah.
            </p>

            <p className="mt-5 max-w-[62ch] text-base leading-8 text-slate-600">
              Dibangun untuk {school.name}: materi, kuis, AI tutor, progres siswa, dan monitoring sekolah dalam alur yang lebih tenang, jelas, dan siap dipakai dari perangkat apa pun.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center gap-2 bg-[#0f766e] px-5 text-sm font-black text-white shadow-[0_18px_42px_rgba(15,118,110,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#138177] active:translate-y-0"
              >
                Masuk ke aplikasi <ArrowRight size={17} />
              </Link>

              <a
                href="#fitur"
                className="inline-flex min-h-12 items-center border border-[#f59e0b]/25 bg-[#fff7ed]/90 px-5 text-sm font-extrabold text-[#9a3412] transition duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0"
              >
                Lihat fitur
              </a>
            </div>

            <div className="mt-8 grid max-w-2xl gap-2 sm:grid-cols-3">
              {signalCards.map(([value, label, detail], index) => (
                <div key={label} className={`border p-4 backdrop-blur-md ${signalStyles[index]}`}>
                  <p className="font-mono text-3xl font-black leading-none text-[#13232d]">{value}</p>
                  <p className="mt-2 text-sm font-black">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
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
            <div className="paper-surface relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/88 p-5 text-slate-950 shadow-[0_28px_70px_rgba(15,31,42,0.12)] sm:p-6">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#0f766e,#0ea5e9,#f59e0b,#ec4899)]" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f766e]">learning cockpit</p>
                  <h2 className="mt-3 max-w-sm text-balance text-3xl font-black leading-none tracking-[-0.02em] text-[#13232d]">
                    Hari belajar terlihat dalam satu layar.
                  </h2>
                </div>
                <div className="hidden h-16 w-16 place-items-center rounded-2xl bg-[#123c3b] text-[#facc15] shadow-xl sm:grid">
                  <Route size={30} />
                </div>
              </div>

              <div className="relative mt-6 grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl bg-[linear-gradient(135deg,#0f766e,#0ea5e9)] p-4 text-white shadow-[0_16px_34px_rgba(14,165,233,0.22)]">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">progress siswa</p>
                  <div className="mt-5 flex items-end gap-2">
                    <span className="font-mono text-5xl font-black leading-none">72</span>
                    <span className="pb-1 text-lg font-black">%</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/15">
                    <div className="h-2 w-[72%] rounded-full bg-[#facc15]" />
                  </div>
                </div>

                <div className="grid gap-3">
                  {[
                    ['Materi baru', 'Bahasa Inggris - descriptive text'],
                    ['Kuis aktif', 'Matematika dasar, 15 soal'],
                    ['AI Tutor', 'Siap bantu jelaskan ulang materi'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-white/82 p-4 ring-1 ring-[#123c3b]/10">
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
              ].map(([Icon, title, description], index) => (
                <div
                  key={title}
                  className={`border p-4 text-[#13232d] backdrop-blur-md ${
                    index === 0
                      ? 'border-[#bbf7d0]/70 bg-[#f0fdf4]/88 shadow-[0_12px_32px_rgba(22,163,74,0.09)]'
                      : 'border-[#c7d2fe]/70 bg-[#eef2ff]/88 shadow-[0_12px_32px_rgba(79,70,229,0.09)]'
                  }`}
                >
                  <Icon className={index === 0 ? 'text-[#16a34a]' : 'text-[#4f46e5]'} size={22} />
                  <p className="mt-3 text-base font-black">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
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
          {features.map(({ title, icon: Icon, label, description }, index) => {
            const style = featureStyles[index % featureStyles.length]

            return (
            <article
              key={title}
              className={`group rounded-[1.5rem] border p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_58px_rgba(15,31,42,0.12)] ${
                index < 2 ? 'lg:col-span-3' : 'lg:col-span-2'
              } ${style.card}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`grid h-11 w-11 place-items-center rounded-2xl ring-1 transition group-hover:text-white ${style.icon}`}>
                  <Icon size={21} />
                </div>
                <span className={`border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${style.label}`}>
                  {label}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-black tracking-[-0.01em] text-[#13232d]">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
            </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        {audienceSections.map((section, index) => {
          const Icon = section.icon
          const style = audienceStyles[index]

          return (
            <article key={section.label} className={`rounded-[1.5rem] border p-5 text-[#13232d] shadow-[0_18px_48px_rgba(15,31,42,0.06)] ${style.card}`}>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className={`grid h-11 w-11 place-items-center rounded-2xl ring-1 ${style.icon}`}>
                  <Icon size={22} />
                </div>
                <span className={`text-xs font-black uppercase tracking-[0.18em] ${style.tag}`}>{section.label}</span>
              </div>
              <h2 className="text-balance text-2xl font-black leading-tight">{section.title}</h2>

              <div className="mt-5 grid gap-2">
                {section.points.map((point) => (
                  <div key={point} className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-700 ring-1 ${style.point}`}>
                    <CheckCircle2 className="text-[#0f766e]" size={16} />
                    {point}
                  </div>
                ))}
              </div>
            </article>
          )
        })}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-[#67e8f9]/35 bg-[linear-gradient(135deg,#ecfeff_0%,#fff7ed_50%,#eef2ff_100%)] p-5 shadow-[0_22px_58px_rgba(15,31,42,0.08)] md:p-7">
          <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 border border-[#0f766e]/15 bg-white/82 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-[#0f766e]">
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
              {practiceCards.map(([label, value], index) => (
                <div key={label} className={`rounded-2xl p-5 ring-1 ${practiceStyles[index]}`}>
                  <p className="text-xs font-black uppercase tracking-[0.14em]">{label}</p>
                  <p className="mt-2 text-sm font-extrabold leading-6 text-[#13232d]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[#123c3b]/10 bg-[linear-gradient(135deg,#f0fdf4_0%,#ecfeff_38%,#fff7ed_100%)] p-5 text-[#13232d] shadow-[0_22px_58px_rgba(15,31,42,0.08)] md:p-7">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <UsersRound className="text-[#0f766e]" />
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f766e]">Role pengguna</p>
              </div>
              <h2 className="max-w-2xl text-balance text-3xl font-black leading-none">Siap dipakai oleh semua peran sekolah.</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Siswa', 'Guru', 'Admin', 'Pimpinan'].map((role) => (
                  <span key={role} className="border border-[#123c3b]/10 bg-white/82 px-4 py-2 text-sm font-extrabold text-slate-700">
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <Link
              to="/login"
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#0f766e] px-5 text-sm font-black text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#138177] active:translate-y-0"
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
