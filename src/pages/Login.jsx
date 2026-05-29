import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  UserRound,
  Waves,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { roleHome, roleLabels, school } from '../data/dummyData.js'

const officialSchoolName = school?.name || 'SMA Negeri 6 Pangkajene dan Kepulauan'

const brandPoints = [
  'Materi, latihan, dan progres dalam satu aplikasi',
  'Akses ringan untuk siswa dan guru',
  'Dashboard sekolah lebih mudah dipantau',
]

export default function Login() {
  const navigate = useNavigate()
  const { loginAs, loginWithEmail, demoAuthEnabled } = useAuth()
  const showPreviewAccess = demoAuthEnabled
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function finish(user) {
    navigate(roleHome[user.role], { replace: true })
  }

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await loginWithEmail(identifier, password)
      finish(user)
    } catch (error) {
      setError(error.message || 'Login gagal. Periksa username dan password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-dvh bg-white lg:grid-cols-[0.98fr_1.02fr]">
      <section className="relative flex min-h-[42dvh] items-center overflow-hidden bg-[linear-gradient(135deg,#063332_0%,#0f766e_54%,#0e7490_100%)] px-6 py-8 text-white lg:min-h-dvh lg:px-14">
        <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:52px_52px]" />
        <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#22d3ee,#facc15,#99f6e4)]" />
        <div className="absolute bottom-0 left-0 h-28 w-full bg-[linear-gradient(180deg,transparent,rgba(6,51,50,0.34))]" />

        <div className="relative mx-auto w-full max-w-2xl">
          <IsleLearnLogo />

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold text-cyan-50 backdrop-blur-md">
            <ShieldCheck size={15} />
            Akses sekolah resmi
          </div>

          <h1 className="mt-6 text-balance text-5xl font-black leading-none sm:text-6xl">
            IsleLearn
          </h1>

          <p className="mt-5 max-w-lg text-sm font-extrabold text-amber-100">
            {officialSchoolName}
          </p>

          <p className="mt-5 max-w-xl text-balance text-3xl font-black leading-tight sm:text-4xl">
            Masuk dan lanjutkan aktivitas belajar dengan lebih terarah.
          </p>

          <p className="mt-4 max-w-xl text-base leading-8 text-teal-50/80">
            Platform pembelajaran sekolah yang dirancang agar siswa, guru, admin, dan pimpinan bekerja dalam alur yang sama.
          </p>

          <div className="mt-6 grid max-w-xl gap-3 sm:grid-cols-3">
            <MiniInfo icon={Waves} title="Ringan" text="Nyaman dibuka di berbagai jaringan" />
            <MiniInfo icon={UserRound} title="Terhubung" text="Peran sekolah ada dalam satu sistem" />
            <MiniInfo icon={ShieldCheck} title="Tertata" text="Data belajar lebih mudah dipantau" />
          </div>

          <div className="mt-7 grid gap-2">
            {brandPoints.map((point) => (
              <div key={point} className="flex items-center gap-3 text-sm font-semibold text-teal-50/90">
                <CheckCircle2 className="text-[#facc15]" size={17} />
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center bg-white px-5 py-8 lg:px-8">
        <div className="w-full max-w-md">
          <header className="mb-7">
            <div className="mb-5 flex items-center gap-3 lg:hidden">
              <IsleLearnLogo compact />
              <div className="min-w-0">
                <p className="text-base font-black leading-tight text-[#10201f]">IsleLearn</p>
                <p className="truncate text-xs font-bold text-[#0f766e]">{officialSchoolName}</p>
              </div>
            </div>
            <p className="text-xs font-black text-[#0f766e]">Masuk ke aplikasi</p>
            <h2 className="mt-2 text-3xl font-black leading-none text-[#10201f]">
              Selamat datang kembali.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Gunakan akun sekolah yang sudah terdaftar.
            </p>
          </header>

          <form onSubmit={submit} className="space-y-4">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Username atau Email
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Username atau email sekolah"
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Password
              <span className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan password"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#0f766e] focus:ring-4 focus:ring-[#0f766e]/10"
                />
                <button
                  type="button"
                  aria-label="Tampilkan password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            <button
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0f766e] text-sm font-extrabold text-white shadow-[0_18px_36px_rgba(15,118,110,0.20)] transition hover:-translate-y-0.5 hover:bg-[#115e59] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Masuk <ArrowRight size={17} />
                </>
              )}
            </button>

            {error && (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">
                {error}
              </p>
            )}
          </form>

          {showPreviewAccess && (
            <>
              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-extrabold text-slate-400">preview lokal</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {Object.keys(roleLabels).map((role) => (
                  <button
                    key={role}
                    onClick={() => finish(loginAs(role))}
                    className="rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-extrabold text-slate-700 transition hover:-translate-y-0.5 hover:border-[#0f766e]/25 hover:bg-[#e6f5f1] hover:text-[#0f766e]"
                  >
                    {roleLabels[role]}
                  </button>
                ))}
              </div>
            </>
          )}

          <p className="mt-7 text-center text-xs font-semibold leading-6 text-slate-400">
            IsleLearn · {officialSchoolName}
          </p>
        </div>
      </section>
    </main>
  )
}

function MiniInfo({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-3 shadow-[0_14px_34px_rgba(0,0,0,0.12)] backdrop-blur-md">
      <Icon className="text-[#facc15]" size={22} />
      <p className="mt-3 text-sm font-extrabold text-white">{title}</p>
      <p className="mt-1 text-xs leading-5 text-teal-50/70">{text}</p>
    </div>
  )
}

function IsleLearnLogo({ compact = false }) {
  return (
    <div className={`inline-flex items-center justify-center ${
      compact
        ? 'h-14 w-14'
        : 'h-28 w-28 sm:h-32 sm:w-32'
    }`}>
      <img
        src="/brand/islelearn-logo.png"
        alt="Logo IsleLearn"
        className="h-full w-full object-contain"
      />
    </div>
  )
}
