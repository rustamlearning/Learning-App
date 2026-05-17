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
    <main className="grid min-h-dvh overflow-hidden bg-[#f7f4ee] lg:grid-cols-[0.96fr_1.04fr]">
      <section className="relative order-2 flex min-h-[44dvh] items-center overflow-hidden sea-ink-panel px-6 py-8 text-white lg:order-1 lg:min-h-dvh lg:px-14">
        <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute right-0 top-0 h-full w-2/3 bg-[radial-gradient(circle_at_82%_18%,rgba(216,166,66,0.18),transparent_27rem)]" />

        <div className="relative mx-auto w-full max-w-2xl">
          <div className="mb-5">
            <IsleLearnLogo />
          </div>

          <div className="inline-flex items-center gap-2 border border-white/15 bg-white/[0.08] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#b9e4dc] shadow-lg backdrop-blur-md">
            <Sparkles size={15} />
            Akses sekolah
          </div>

          <h1 className="mt-5 text-balance text-5xl font-black leading-none tracking-[-0.02em] sm:text-6xl">
            IsleLearn
          </h1>

          <p className="mt-5 max-w-lg text-sm font-extrabold uppercase tracking-[0.18em] text-[#b9e4dc]">
            {officialSchoolName}
          </p>

          <p className="mt-5 max-w-xl text-balance text-3xl font-black leading-tight tracking-[-0.025em] text-white sm:text-4xl">
            Masuk, lanjutkan belajar, dan lihat progres tanpa banyak langkah.
          </p>

          <p className="mt-4 max-w-xl text-base leading-8 text-slate-200/76">
            Platform sekolah yang cepat, stabil, dan terintegrasi untuk siswa, guru, admin, dan pimpinan.
          </p>

          <div className="mt-5 grid max-w-xl gap-2 sm:grid-cols-3">
            <MiniInfo icon={Waves} title="Cepat" text="Akses stabil di semua jaringan" />
            <MiniInfo icon={UserRound} title="Multi User" text="Guru & siswa terintegrasi" />
            <MiniInfo icon={ShieldCheck} title="Aman" text="Data terlindungi & terpercaya" />
          </div>
        </div>
      </section>

      <section className="order-1 flex min-h-dvh items-center justify-center px-5 py-6 lg:order-2 lg:min-h-dvh lg:px-8">
        <div className="w-full max-w-md">
          <div className="paper-surface rounded-[1.75rem] border border-white/70 p-5 ring-1 ring-[#123c3b]/10 sm:p-6">
            <header className="mb-5">
              <div className="mb-4 flex items-center gap-3 lg:hidden">
                <IsleLearnLogo compact />
                <div className="min-w-0">
                  <p className="text-base font-black leading-tight tracking-[-0.02em] text-[#13232d]">IsleLearn</p>
                  <p className="truncate text-xs font-bold text-[#0f766e]">{officialSchoolName}</p>
                </div>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f766e]">Masuk ke aplikasi</p>
              <h2 className="mt-2 text-3xl font-black leading-none tracking-[-0.02em] text-[#13232d]">
                Selamat datang di IsleLearn.
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
                  className="h-12 rounded-2xl border border-[#123c3b]/10 bg-white/76 px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#0f766e] focus:bg-white focus:ring-4 focus:ring-[#0f766e]/10"
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
                    className="h-12 w-full rounded-2xl border border-[#123c3b]/10 bg-white/76 px-4 pr-12 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#0f766e] focus:bg-white focus:ring-4 focus:ring-[#0f766e]/10"
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
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#123c3b] text-sm font-extrabold text-white shadow-[0_18px_36px_rgba(15,31,42,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
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
                  <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">
                    preview lokal
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(roleLabels).map((role) => (
                    <button
                      key={role}
                      onClick={() => finish(loginAs(role))}
                      className="rounded-2xl border border-[#123c3b]/10 bg-white/70 px-4 py-3 text-sm font-extrabold text-slate-700 transition hover:-translate-y-0.5 hover:border-[#0f766e]/25 hover:bg-[#e8f4ef] hover:text-[#0f766e]"
                    >
                      {roleLabels[role]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs font-semibold leading-6 text-slate-400">
            IsleLearn · {officialSchoolName}
          </p>
        </div>
      </section>
    </main>
  )
}

function MiniInfo({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.08] p-3 shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/[0.13]">
      <Icon className="text-[#f1c36d]" size={22} />
      <p className="mt-3 text-sm font-extrabold text-white">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-300">{text}</p>
    </div>
  )
}

function IsleLearnLogo({ compact = false }) {
  return (
    <div className={`inline-flex items-center justify-center ${
      compact
        ? 'h-14 w-14'
        : 'h-28 w-28 rounded-[1.4rem] bg-white/95 p-2.5 shadow-[0_18px_44px_rgba(0,0,0,0.22)] ring-1 ring-white/70 sm:h-32 sm:w-32'
    }`}>
      <img
        src="/brand/islelearn-logo.png"
        alt="Logo IsleLearn"
        className="h-full w-full object-contain drop-shadow-[0_10px_24px_rgba(15,31,42,0.18)]"
      />
    </div>
  )
}
