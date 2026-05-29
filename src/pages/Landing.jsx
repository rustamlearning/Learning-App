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
    description: 'Bantuan belajar bertahap saat siswa membutuhkan penjelasan ulang.',
  },
  {
    title: 'Materi Belajar',
    icon: BookOpen,
    label: 'Konten',
    description: 'Materi tersusun per kelas, ringan dibuka, dan mudah dilanjutkan.',
  },
  {
    title: 'Latihan & Ujian',
    icon: FileQuestion,
    label: 'Evaluasi',
    description: 'Kuis, tugas, dan asesmen berada dalam alur yang rapi.',
  },
  {
    title: 'Flashcard',
    icon: Layers3,
    label: 'Review',
    description: 'Penguatan konsep penting sebelum siswa masuk ke latihan.',
  },
  {
    title: 'Analisis Nilai',
    icon: BarChart3,
    label: 'Monitoring',
    description: 'Guru dan pimpinan lebih mudah membaca perkembangan kelas.',
  },
  {
    title: 'Mode Hemat Data',
    icon: Cloud,
    label: 'Akses',
    description: 'Tampilan tetap nyaman untuk jaringan sekolah kepulauan.',
  },
]

const audienceSections = [
  {
    label: 'Siswa',
    title: 'Belajar harian dengan alur yang jelas.',
    icon: Trophy,
    points: ['Daily Mission', 'Learning Path', 'XP & Badge', 'AI Tutor'],
  },
  {
    label: 'Guru',
    title: 'Mengajar dan membaca progres dari satu tempat.',
    icon: PenLine,
    points: ['Kelola materi', 'Bank soal', 'Tugas & kuis', 'Analisis nilai'],
  },
  {
    label: 'Sekolah',
    title: 'Monitoring akademik lebih terstruktur.',
    icon: School,
    points: ['Dashboard admin', 'Monitoring pimpinan', 'Laporan sekolah', 'Role-based access'],
  },
]

const signalCards = [
  ['4', 'role pengguna', 'Siswa, guru, admin, pimpinan'],
  ['6+', 'fitur inti', 'Materi, kuis, progres, AI'],
  ['24/7', 'akses ringan', 'Nyaman dibuka dari perangkat sekolah'],
]

const featureStyles = [
  'bg-[#ecfeff] text-[#0e7490] ring-[#67e8f9]/40',
  'bg-[#f0fdfa] text-[#0f766e] ring-[#5eead4]/40',
  'bg-[#fff7ed] text-[#c2410c] ring-[#fed7aa]/70',
  'bg-[#f8fafc] text-[#334155] ring-slate-200',
  'bg-[#f0fdf4] text-[#15803d] ring-[#bbf7d0]/70',
  'bg-[#eef2ff] text-[#4338ca] ring-[#c7d2fe]/70',
]

const practiceCards = [
  ['Word of the Day', 'Harbor = pelabuhan'],
  ['Speaking Challenge', 'Describe your island in five sentences.'],
  ['Writing Prompt', 'Write about your school morning.'],
  ['AI English Feedback', 'Grammar dan vocabulary diperiksa otomatis.'],
]

export default function Landing() {
  return (
    <main className="min-h-dvh bg-[#f7fbfa] text-[#10201f]">
      <section className="relative overflow-hidden border-b border-[#d7e7e3] bg-[linear-gradient(135deg,#ffffff_0%,#f0fdfa_48%,#eef7f4_100%)]">
        <div className="absolute inset-0 opacity-[0.34] [background-image:linear-gradient(rgba(15,118,110,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,118,110,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#0f766e,#22d3ee,#facc15)]" />

        <div className="relative mx-auto grid min-h-[76dvh] max-w-7xl gap-9 px-5 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-12">
          <motion.div
            className="flex flex-col justify-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="mb-7 flex flex-wrap items-end gap-5">
              <img
                src="/brand/islelearn-logo.png"
                alt="Logo IsleLearn"
                className="h-36 w-36 object-contain sm:h-44 sm:w-44 lg:h-52 lg:w-52"
              />

              <div className="max-w-xl">
                <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[#0f766e]/20 bg-white/80 px-3 py-2 text-xs font-extrabold text-[#0f766e] shadow-[0_14px_36px_rgba(15,31,42,0.06)] backdrop-blur-md">
                  <Compass size={15} />
                  Platform belajar sekolah kepulauan
                </p>

                <h1 className="max-w-4xl text-balance text-5xl font-black leading-none text-[#10201f] sm:text-6xl lg:text-7xl">
                  {school.appName}
                </h1>
              </div>
            </div>

            <p className="max-w-xl text-balance text-2xl font-extrabold leading-tight text-[#0f766e] sm:text-3xl">
              Aplikasi pembelajaran yang rapi, ringan, dan siap dipakai sekolah.
            </p>

            <p className="mt-5 max-w-[64ch] text-base leading-8 text-slate-600">
              Dibangun untuk {school.name}: materi, kuis, AI tutor, progres siswa, dan monitoring sekolah dalam pengalaman yang bersih dan mudah digunakan.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#0f766e] px-5 text-sm font-black text-white shadow-[0_18px_42px_rgba(15,118,110,0.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#115e59] active:translate-y-0"
              >
                Masuk ke aplikasi <ArrowRight size={17} />
              </Link>

              <a
                href="#fitur"
                className="inline-flex min-h-12 items-center rounded-2xl border border-[#0f766e]/20 bg-white px-5 text-sm font-extrabold text-[#0f766e] shadow-[0_12px_30px_rgba(15,31,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-[#0f766e]/40 active:translate-y-0"
              >
                Lihat fitur
              </a>
            </div>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {signalCards.map(([value, label, detail]) => (
                <div key={label} className="rounded-2xl border border-[#d7e7e3] bg-white/90 p-4 shadow-[0_12px_34px_rgba(15,31,42,0.06)] backdrop-blur-md">
                  <p className="font-mono text-3xl font-black leading-none text-[#10201f]">{value}</p>
                  <p className="mt-2 text-sm font-black text-[#0f766e]">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative grid content-center gap-4"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-[#d7e7e3] bg-white p-5 shadow-[0_30px_80px_rgba(15,31,42,0.12)] sm:p-6">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#0f766e,#22d3ee,#facc15)]" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black text-[#0f766e]">Learning cockpit</p>
                  <h2 className="mt-3 max-w-sm text-balance text-3xl font-black leading-none text-[#10201f]">
                    Hari belajar terlihat dalam satu layar.
                  </h2>
                </div>
                <div className="hidden h-16 w-16 place-items-center rounded-2xl bg-[#e6f5f1] text-[#0f766e] ring-1 ring-[#0f766e]/10 sm:grid">
                  <Route size={30} />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl bg-[linear-gradient(135deg,#0f766e,#0e7490)] p-4 text-white shadow-[0_18px_36px_rgba(15,118,110,0.22)]">
                  <p className="text-xs font-bold text-cyan-50">Progress siswa</p>
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
                    <div key={label} className="rounded-2xl bg-[#f8fafc] p-4 ring-1 ring-slate-200">
                      <p className="text-xs font-black text-[#0f766e]">{label}</p>
                      <p className="mt-1 text-sm font-extrabold leading-5 text-[#10201f]">{value}</p>
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
                <div key={title} className="rounded-2xl border border-[#d7e7e3] bg-white/90 p-4 text-[#10201f] shadow-[0_12px_34px_rgba(15,31,42,0.06)] backdrop-blur-md">
                  <Icon className="text-[#0f766e]" size={22} />
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
            <p className="text-xs font-black text-[#0f766e]">Fitur utama</p>
            <h2 className="mt-3 max-w-2xl text-balance text-4xl font-black leading-none text-[#10201f]">
              Satu alur belajar dari kelas sampai laporan.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-slate-600">
            Fokusnya membuat pekerjaan harian siswa, guru, admin, dan pimpinan terasa singkat, tenang, dan terbaca.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-6">
          {features.map(({ title, icon: Icon, label, description }, index) => (
            <article
              key={title}
              className={`group rounded-[1.5rem] border border-[#d7e7e3] bg-white p-5 shadow-[0_18px_48px_rgba(15,31,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_58px_rgba(15,31,42,0.10)] ${
                index < 2 ? 'lg:col-span-3' : 'lg:col-span-2'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`grid h-11 w-11 place-items-center rounded-2xl ring-1 ${featureStyles[index]}`}>
                  <Icon size={21} />
                </div>
                <span className="rounded-full border border-[#d7e7e3] bg-[#f8fafc] px-3 py-1 text-[11px] font-black text-slate-500">
                  {label}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-black text-[#10201f]">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        {audienceSections.map((section) => {
          const Icon = section.icon

          return (
            <article key={section.label} className="rounded-[1.5rem] border border-[#d7e7e3] bg-white p-5 text-[#10201f] shadow-[0_18px_48px_rgba(15,31,42,0.06)]">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e6f5f1] text-[#0f766e] ring-1 ring-[#0f766e]/10">
                  <Icon size={22} />
                </div>
                <span className="text-xs font-black text-[#0f766e]">{section.label}</span>
              </div>
              <h2 className="text-balance text-2xl font-black leading-tight">{section.title}</h2>

              <div className="mt-5 grid gap-2">
                {section.points.map((point) => (
                  <div key={point} className="flex items-center gap-2 rounded-2xl bg-[#f8fafc] px-3 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200">
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
        <div className="overflow-hidden rounded-[2rem] border border-[#d7e7e3] bg-[linear-gradient(135deg,#ffffff_0%,#ecfeff_55%,#f0fdfa_100%)] p-5 shadow-[0_22px_58px_rgba(15,31,42,0.08)] md:p-7">
          <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0f766e]/20 bg-white px-3 py-1.5 text-xs font-black text-[#0f766e]">
                <Waves size={15} /> IsleClub English Corner
              </div>
              <h2 className="text-balance text-4xl font-black leading-none text-[#10201f]">
                English practice yang dekat dengan hidup siswa.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
                Latihan harian tentang pulau, sekolah, laut, keluarga, dan masa depan. Singkat untuk dimulai, jelas untuk membangun keberanian speaking.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {practiceCards.map(([label, value], index) => (
                <div key={label} className={`rounded-2xl p-5 ring-1 ${featureStyles[index]}`}>
                  <p className="text-xs font-black">{label}</p>
                  <p className="mt-2 text-sm font-extrabold leading-6 text-[#10201f]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[#0f766e]/20 bg-[#0f766e] p-5 text-white shadow-[0_22px_58px_rgba(15,118,110,0.18)] md:p-7">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <UsersRound className="text-[#facc15]" />
                <p className="text-xs font-black text-teal-50">Role pengguna</p>
              </div>
              <h2 className="max-w-2xl text-balance text-3xl font-black leading-none">Siap dipakai oleh semua peran sekolah.</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {['Siswa', 'Guru', 'Admin', 'Pimpinan'].map((role) => (
                  <span key={role} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <Link
              to="/login"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#0f766e] transition duration-200 hover:-translate-y-0.5 hover:bg-[#f0fdfa] active:translate-y-0"
            >
              Masuk sekarang <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#d7e7e3] bg-white px-5 py-8 text-center text-sm text-slate-500">
        <b className="text-[#10201f]">IsleLearn</b>
        <br />
        {school.name}
        <br />
        Platform pembelajaran digital sekolah
      </footer>
    </main>
  )
}
