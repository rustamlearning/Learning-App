import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
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
    <main className="grid min-h-dvh bg-[#F5F9FF] lg:grid-cols-[0.98fr_1.02fr]">
      <section className="relative flex min-h-[42dvh] items-center overflow-hidden bg-[#17446E] px-6 py-10 text-white lg:min-h-dvh lg:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_42%),radial-gradient(circle_at_24%_18%,rgba(139,212,255,0.16),transparent_24rem)]" />

        <div className="relative mx-auto w-full max-w-[620px] px-2 py-6 sm:px-4">
          <IsleLearnLogo />

          <div className="mt-8 flex items-center gap-2 text-sm font-bold text-[#DBF1FF]/90">
            <ShieldCheck size={17} className="text-[#d9b85b]" />
            Akses sekolah resmi
          </div>

          <h1 className="mt-5 text-balance text-6xl font-black leading-none text-white sm:text-7xl">
            IsleLearn
          </h1>

          <p className="mt-4 max-w-lg text-base font-extrabold leading-7 text-[#d9b85b]">
            {officialSchoolName}
          </p>

          <p className="mt-7 w-full max-w-[38rem] text-2xl font-black leading-tight text-white">
            Belajar, mengajar, dan memantau progres sekolah dalam satu ruang yang tenang.
          </p>

          <div className="mt-9 h-px w-24 bg-[#d9b85b]/72" />
          <p className="mt-5 max-w-sm text-sm font-semibold leading-7 text-[#BAE6FD]/80">
            Dari Pesisir ke Masa Depan Digital
          </p>
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center bg-[#F5F9FF] px-5 py-8 lg:px-8">
        <div className="w-full max-w-md px-1 py-4 sm:px-2 sm:py-6">
          <header className="mb-7">
            <div className="mb-5 flex items-center gap-3 lg:hidden">
              <IsleLearnLogo compact />
              <div className="min-w-0">
                <p className="text-base font-black leading-tight text-[#10201f]">IsleLearn</p>
                <p className="truncate text-xs font-bold text-[#0284c7]">{officialSchoolName}</p>
              </div>
            </div>
            <p className="text-xs font-black text-[#2F80D8]">Masuk ke aplikasi</p>
            <h2 className="mt-2 text-3xl font-black leading-none text-[#132437]">
              Selamat datang kembali.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Gunakan akun sekolah yang sudah terdaftar. Guru dapat memakai NIP sebagai username.
            </p>
          </header>

          <form onSubmit={submit} className="space-y-4">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Username / NIP atau Email
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Username, NIP, atau email sekolah"
                className="h-12 rounded-xl border border-[#D9E6F5] bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#2F80D8] focus:ring-4 focus:ring-[#2F80D8]/10"
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
                  className="h-12 w-full rounded-xl border border-[#D9E6F5] bg-white px-4 pr-12 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#2F80D8] focus:ring-4 focus:ring-[#2F80D8]/10"
                />
                <button
                  type="button"
                  aria-label="Tampilkan password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-[#F5F9FF] hover:text-slate-900"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            <button
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#17446E] text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(23,68,110,0.18)] transition hover:-translate-y-0.5 hover:bg-[#2F80D8] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
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
                <div className="h-px flex-1 bg-white/70" />
                <span className="text-xs font-extrabold text-slate-400">mode pengembangan</span>
                <div className="h-px flex-1 bg-white/70" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {Object.keys(roleLabels).map((role) => (
                  <button
                    key={role}
                    onClick={() => finish(loginAs(role))}
                    className="rounded-xl border border-[#D9E6F5] bg-white px-4 py-3 text-sm font-extrabold text-slate-700 shadow-[0_8px_20px_rgba(15,36,55,0.04)] transition hover:-translate-y-0.5 hover:border-[#2F80D8]/25 hover:bg-[#F8FBFF] hover:text-[#2F80D8]"
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

function IsleLearnLogo({ compact = false }) {
  return (
    <div className={`inline-flex shrink-0 items-center justify-center ${
      compact
        ? 'h-14 w-14'
        : 'h-40 w-36 sm:h-44 sm:w-40'
    }`}>
      <img
        src="/brand/islelearn-logo.png"
        alt="Logo IsleLearn"
        className="h-full w-full object-contain"
      />
    </div>
  )
}
