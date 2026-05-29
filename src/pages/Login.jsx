import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Sparkles,
  UserRound,
  Waves,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { roleHome, roleLabels, school } from '../data/dummyData.js'

const officialSchoolName = school?.name || 'SMA Negeri 6 Pangkajene dan Kepulauan'

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
    <main className="grid min-h-dvh overflow-hidden bg-[#041817] lg:grid-cols-[0.96fr_1.04fr]">
      <section className="relative order-2 flex min-h-[44dvh] items-center overflow-hidden border-r border-white/10 bg-[linear-gradient(135deg,#062f2e_0%,#0f766e_52%,#123c3b_100%)] px-6 py-8 text-white lg:order-1 lg:min-h-dvh lg:px-14">
        <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute inset-x-0 top-0 h-2 bg-[linear-gradient(90deg,#22d3ee,#facc15,#34d399)]" />
        <div className="absolute inset-y-0 right-0 w-2/3 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(250,204,21,0.12),transparent)]" />

        <div className="relative mx-auto w-full max-w-2xl">
          <div className="mb-5">
            <IsleLearnLogo />
          </div>

          <div className="inline-flex items-center gap-2 border border-cyan-100/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-100 shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur-md">
            <Sparkles size={15} />
            Akses sekolah
          </div>

          <h1 className="mt-5 text-balance text-5xl font-black leading-none tracking-[-0.02em] sm:text-6xl">
            IsleLearn
          </h1>

          <p className="mt-5 max-w-lg text-sm font-extrabold uppercase tracking-[0.18em] text-amber-100">
            {officialSchoolName}
          </p>

          <p className="mt-5 max-w-xl text-balance text-3xl font-black leading-tight tracking-[-0.025em] text-white sm:text-4xl">
            Masuk, lanjutkan belajar, dan lihat progres tanpa banyak langkah.
          </p>

          <p className="mt-4 max-w-xl text-base leading-8 text-teal-50/75">
            Platform sekolah yang cepat, stabil, dan terintegrasi untuk siswa, guru, admin, dan pimpinan.
          </p>

          <div className="mt-5 grid max-w-xl gap-2 sm:grid-cols-3">
            <MiniInfo icon={Waves} title="Cepat" text="Akses stabil di semua jaringan" />
            <MiniInfo icon={UserRound} title="Multi User" text="Guru & siswa terintegrasi" />
            <MiniInfo icon={ShieldCheck} title="Aman" text="Data terlindungi & terpercaya" />
          </div>
        </div>
      </section>

      <section className="order-1 flex min-h-dvh items-center justify-center bg-[linear-gradient(135deg,#041817_0%,#062f2e_58%,#031312_100%)] px-5 py-6 lg:order-2 lg:min-h-dvh lg:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 shadow-[0_28px_70px_rgba(0,0,0,0.30)] ring-1 ring-white/10 backdrop-blur-xl sm:p-6">
            <header className="mb-5">
              <div className="mb-4 flex items-center gap-3 lg:hidden">
                <IsleLearnLogo compact />
                <div className="min-w-0">
                  <p className="text-base font-black leading-tight tracking-[-0.02em] text-white">IsleLearn</p>
                  <p className="truncate text-xs font-bold text-cyan-100">{officialSchoolName}</p>
                </div>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Masuk ke aplikasi</p>
              <h2 className="mt-2 text-3xl font-black leading-none tracking-[-0.02em] text-white">
                Selamat datang di IsleLearn.
              </h2>
              <p className="mt-3 text-sm leading-6 text-teal-50/70">
                Gunakan akun sekolah yang sudah terdaftar.
              </p>
            </header>

            <form onSubmit={submit} className="space-y-4">
              <label className="grid gap-2 text-sm font-bold text-teal-50/80">
                Username atau Email
                <input
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="Username atau email sekolah"
                  className="h-12 rounded-2xl border border-white/10 bg-[#041817]/60 px-4 text-white outline-none transition placeholder:text-teal-100/40 focus:border-cyan-200/40 focus:bg-[#062f2e] focus:ring-4 focus:ring-cyan-200/10"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-teal-50/80">
                Password
                <span className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan password"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-[#041817]/60 px-4 pr-12 text-white outline-none transition placeholder:text-teal-100/40 focus:border-cyan-200/40 focus:bg-[#062f2e] focus:ring-4 focus:ring-cyan-200/10"
                  />
                  <button
                    type="button"
                    aria-label="Tampilkan password"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-teal-50/60 transition hover:bg-white/10 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>

              <button
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#facc15] text-sm font-extrabold text-[#063332] shadow-[0_18px_36px_rgba(250,204,21,0.22)] transition hover:-translate-y-0.5 hover:bg-[#fde047] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
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
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-50/40">
                    preview lokal
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(roleLabels).map((role) => (
                    <button
                      key={role}
                      onClick={() => finish(loginAs(role))}
                      className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-extrabold text-teal-50/80 transition hover:-translate-y-0.5 hover:border-cyan-200/30 hover:bg-white/10 hover:text-white"
                    >
                      {roleLabels[role]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs font-semibold leading-6 text-teal-50/40">
            IsleLearn · {officialSchoolName}
          </p>
        </div>
      </section>
    </main>
  )
}

function MiniInfo({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3 shadow-[0_18px_45px_rgba(0,0,0,0.16)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/10">
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
