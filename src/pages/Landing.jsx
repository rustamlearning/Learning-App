import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  LibraryBig,
  MapPin,
  Sparkles,
  UsersRound,
  Waves,
} from 'lucide-react'
import { classes, school, students, teachers } from '../data/dummyData.js'

const images = {
  hero: '/landing/school-community.jpg',
  academics: '/landing/digital-lab.jpg',
  culture: '/landing/cultural-ensemble.jpg',
  scout: '/landing/scout-leadership.jpg',
  leaders: '/landing/student-leaders.jpg',
}

const navLinks = [
  ['Profil', '#profil'],
  ['Akademik', '#akademik'],
  ['Kehidupan', '#kehidupan'],
  ['Agenda', '#agenda'],
]

const stats = [
  { value: classes.length, label: 'Rombel aktif' },
  { value: students.length, label: 'Siswa terdata' },
  { value: teachers.length, label: 'Guru & mapel' },
  { value: '4', label: 'Portal peran' },
]

const pillars = [
  {
    title: 'Belajar bermakna',
    description: 'Materi, tugas, latihan, dan asesmen disusun agar siswa punya arah belajar yang jelas setiap hari.',
    icon: BookOpen,
  },
  {
    title: 'Karakter lulusan',
    description: 'Sekolah menumbuhkan nalar kritis, kemandirian, disiplin, kepedulian, dan kesiapan hidup bermasyarakat.',
    icon: GraduationCap,
  },
  {
    title: 'Digital sekolah',
    description: 'IsleLearn menghubungkan daftar hadir, daftar nilai, materi, dan monitoring akademik dalam satu sistem.',
    icon: Sparkles,
  },
]

const programs = [
  ['Akademik', 'Pembelajaran kelas XI dan XII berbasis mapel, asesmen, dan perkembangan siswa.'],
  ['Kesiswaan', 'Aktivitas sekolah, pembinaan karakter, dan ruang berkembang sesuai minat siswa.'],
  ['Administrasi', 'Data guru, siswa, kelas, kehadiran, dan nilai dikelola lebih tertata.'],
]

const agenda = [
  ['Hari ini', 'Absensi harian dan pembelajaran kelas berjalan melalui dashboard guru.'],
  ['Mingguan', 'Rekap kehadiran, latihan, kuis, dan progres belajar dibaca secara ringkas.'],
  ['Semester', 'Daftar nilai menjadi dasar monitoring hasil belajar siswa.'],
]

export default function Landing() {
  return (
    <main className="school-landing min-h-dvh bg-[#F6F7F3] text-[#102033]">
      <Header />
      <Hero />
      <AtAGlance />
      <Profile />
      <Academics />
      <LifeAtSchool />
      <Agenda />
      <Portal />
      <Footer />
    </main>
  )
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-[#071827]/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8" aria-label="Navigasi utama">
        <a href="/" className="flex min-w-0 items-center gap-3 text-white">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-lg bg-white shadow-[0_12px_28px_rgba(0,0,0,0.12)]">
            <img src="/brand/islelearn-logo.png" alt="Logo IsleLearn" className="h-9 w-9 object-contain" />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-black">SMAN 6 Pangkep</span>
            <span className="block text-xs font-semibold text-sky-100/75">Pangkajene dan Kepulauan</span>
          </span>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map(([label, href]) => (
            <a key={label} href={href} className="text-sm font-bold text-white/80 transition hover:text-white">
              {label}
            </a>
          ))}
        </div>

        <Link
          to="/login"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-[#0F3E66] shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:bg-[#DDF1FF] active:translate-y-0"
        >
          Masuk <ArrowRight size={16} />
        </Link>
      </nav>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative isolate min-h-[92dvh] overflow-hidden">
      <img
        src={images.hero}
        alt="Keluarga besar SMA Negeri 6 Pangkajene dan Kepulauan"
        className="absolute inset-0 h-full w-full object-cover object-[center_54%]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,22,38,0.92)_0%,rgba(6,22,38,0.72)_42%,rgba(6,22,38,0.30)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(246,247,243,0)_0%,#F6F7F3_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[92dvh] max-w-7xl items-end px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl"
        >
          <p className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-sky-100 backdrop-blur-md">
            <MapPin size={15} />
            Website sekolah resmi
          </p>
          <h1 className="school-serif max-w-5xl text-balance text-[clamp(2.9rem,7.2vw,6.9rem)] font-black leading-[0.94] tracking-[-0.04em] text-white">
            <span className="block">SMA Negeri 6 </span>
            <span className="block">Pangkajene dan </span>
            <span className="block">Kepulauan</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-white/80 sm:text-xl">
            Sekolah pesisir yang menyiapkan pembelajar berkarakter, cakap digital, dan siap berkontribusi untuk masa depan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#profil" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#F5C84C] px-5 text-sm font-black text-[#102033] shadow-[0_18px_44px_rgba(245,200,76,0.20)] transition hover:-translate-y-0.5 hover:bg-[#FFDA72] active:translate-y-0">
              Jelajahi sekolah <ArrowRight size={17} />
            </a>
            <Link to="/login" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-white px-5 text-sm font-black text-[#102033] shadow-[0_18px_44px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:bg-[#DDF1FF] active:translate-y-0">
              Buka IsleLearn <Sparkles size={17} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function AtAGlance() {
  return (
    <section className="relative z-20 mx-auto -mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden rounded-lg bg-white shadow-[0_24px_70px_rgba(16,32,51,0.11)] ring-1 ring-slate-200/70 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="border-b border-slate-200 p-5 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0">
            <p className="font-mono text-4xl font-black tracking-[-0.04em] text-[#0F6FAE]">{item.value}</p>
            <p className="mt-2 text-sm font-black uppercase tracking-[0.08em] text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Profile() {
  return (
    <section id="profil" className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-24">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#0F6FAE]">Profil</p>
        <h2 className="school-serif mt-4 max-w-2xl text-balance text-[clamp(2.4rem,5vw,5.25rem)] font-black leading-[0.95] tracking-[-0.035em] text-[#102033]">
          Sekolah yang tumbuh dari identitas pesisir.
        </h2>
      </div>
      <div className="space-y-7">
        <p className="max-w-3xl text-lg font-semibold leading-9 text-slate-700">
          {school.name} menghadirkan ruang belajar yang dekat dengan konteks daerah, tertata secara akademik, dan diperkuat layanan digital melalui IsleLearn.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map(({ title, description, icon: Icon }) => (
            <article key={title} className="rounded-lg bg-white p-5 shadow-[0_16px_42px_rgba(16,32,51,0.07)] ring-1 ring-slate-200">
              <Icon className="text-[#0F6FAE]" size={24} />
              <h3 className="mt-4 text-lg font-black text-[#102033]">{title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Academics() {
  return (
    <section id="akademik" className="bg-[#E9F2F8] py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:items-center">
        <div className="overflow-hidden rounded-lg shadow-[0_24px_70px_rgba(16,32,51,0.14)]">
          <img src={images.academics} alt="Siswa belajar menggunakan komputer di laboratorium" className="aspect-[4/3] w-full object-cover object-[center_50%]" />
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#0F6FAE]">Akademik</p>
          <h2 className="school-serif mt-4 max-w-2xl text-balance text-[clamp(2.3rem,5vw,4.8rem)] font-black leading-[0.95] tracking-[-0.035em]">
            Pembelajaran yang rapi dari kelas sampai evaluasi.
          </h2>
          <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-slate-700">
            Guru dapat mengelola materi, tugas, kehadiran, dan nilai. Siswa mendapatkan jalur belajar yang lebih mudah diikuti.
          </p>
          <div className="mt-8 divide-y divide-slate-300 border-y border-slate-300">
            {programs.map(([title, description]) => (
              <div key={title} className="grid gap-2 py-5 sm:grid-cols-[9rem_1fr]">
                <h3 className="text-base font-black text-[#102033]">{title}</h3>
                <p className="text-sm font-semibold leading-7 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function LifeAtSchool() {
  return (
    <section id="kehidupan" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#0F6FAE]">Kehidupan sekolah</p>
          <h2 className="school-serif mt-4 max-w-2xl text-balance text-[clamp(2.3rem,5vw,4.8rem)] font-black leading-[0.95] tracking-[-0.035em]">
            Belajar di kelas, bertumbuh di komunitas.
          </h2>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="relative min-h-[26rem] overflow-hidden rounded-lg bg-[#102033]">
          <img src={images.culture} alt="Siswa menampilkan busana budaya daerah" className="absolute inset-0 h-full w-full object-cover object-[center_44%]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,32,51,0.08)_0%,rgba(16,32,51,0.78)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="mb-3 flex items-center gap-2 text-sm font-black text-sky-100"><LibraryBig size={18} /> Budaya & karakter</p>
            <h3 className="school-serif max-w-2xl text-4xl font-black leading-none tracking-[-0.03em]">
              Identitas lokal menjadi bagian dari pembelajaran.
            </h3>
          </div>
        </article>

        <article className="relative min-h-[26rem] overflow-hidden rounded-lg bg-[#102033]">
          <img src={images.scout} alt="Siswa pramuka SMA Negeri 6 Pangkajene dan Kepulauan" className="absolute inset-0 h-full w-full object-cover object-[center_40%]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,32,51,0.08)_0%,rgba(16,32,51,0.72)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="mb-3 flex items-center gap-2 text-sm font-black text-sky-100"><Waves size={18} /> Kemandirian</p>
            <h3 className="school-serif text-4xl font-black leading-none tracking-[-0.03em]">
              Siswa bertumbuh lewat organisasi dan kegiatan.
            </h3>
          </div>
        </article>
      </div>
    </section>
  )
}

function Agenda() {
  return (
    <section id="agenda" className="bg-white py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#0F6FAE]">Agenda layanan</p>
          <h2 className="school-serif mt-4 max-w-xl text-balance text-[clamp(2.3rem,5vw,4.6rem)] font-black leading-[0.95] tracking-[-0.035em]">
            Informasi penting mudah ditemukan.
          </h2>
        </div>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {agenda.map(([time, description], index) => (
            <article key={time} className="grid gap-4 py-6 sm:grid-cols-[4rem_8rem_1fr] sm:items-start">
              <span className="font-mono text-2xl font-black text-[#0F6FAE]">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="text-lg font-black text-[#102033]">{time}</h3>
              <p className="text-base font-semibold leading-8 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Portal() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="grid overflow-hidden rounded-lg bg-[#0B2338] text-white shadow-[0_24px_70px_rgba(16,32,51,0.18)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-6 sm:p-8 lg:p-10">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#F5C84C]">Portal IsleLearn</p>
          <h2 className="school-serif mt-4 max-w-3xl text-balance text-[clamp(2.25rem,5vw,4.8rem)] font-black leading-[0.95] tracking-[-0.035em]">
            Aplikasi belajar tetap menjadi pintu kerja harian.
          </h2>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-white/75">
            Masuk sebagai siswa, guru, admin, atau pimpinan untuk membuka dashboard, daftar hadir, daftar nilai, dan laporan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {['Siswa', 'Guru', 'Admin', 'Pimpinan'].map((role) => (
              <span key={role} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-black ring-1 ring-white/10">
                <CheckCircle2 size={16} /> {role}
              </span>
            ))}
          </div>
          <Link to="/login" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#F5C84C] px-5 text-sm font-black text-[#102033] transition hover:bg-[#FFDA72]">
            Masuk ke IsleLearn <ArrowRight size={17} />
          </Link>
        </div>
        <div className="relative min-h-[24rem] overflow-hidden bg-[#123B63]">
          <img src={images.leaders} alt="Siswa pengurus organisasi sekolah" className="absolute inset-0 h-full w-full object-cover object-[center_45%]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,35,56,0.04)_0%,rgba(11,35,56,0.72)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <div className="inline-flex items-center gap-2 rounded-lg bg-white/12 px-3 py-2 text-sm font-black text-white ring-1 ring-white/20 backdrop-blur-md">
              <UsersRound size={17} />
              Data sekolah terhubung dalam IsleLearn
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#F6F7F3] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <img src="/brand/islelearn-logo.png" alt="Logo IsleLearn" className="h-12 w-12 object-contain" />
          <div>
            <p className="font-black text-[#102033]">{school.name}</p>
            <p className="text-sm font-semibold text-slate-500">Website sekolah dan portal pembelajaran digital</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-slate-500">
          <a href="#profil" className="hover:text-[#0F6FAE]">Profil</a>
          <a href="#akademik" className="hover:text-[#0F6FAE]">Akademik</a>
          <a href="#agenda" className="hover:text-[#0F6FAE]">Agenda</a>
          <Link to="/login" className="rounded-lg bg-[#102033] px-4 py-2.5 text-white hover:bg-[#0F6FAE]">
            IsleLearn
          </Link>
        </div>
      </div>
    </footer>
  )
}
