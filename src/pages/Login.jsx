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
import { demoUsers, roleHome, roleLabels, school } from '../data/dummyData.js'

const officialSchoolName = school?.name || 'SMA Negeri 6 Pangkajene dan Kepulauan'

export default function Login() {
  const navigate = useNavigate()
  const { loginAs, loginWithEmail } = useAuth()
  const [identifier, setIdentifier] = useState('Andi Saputra')
  const [password, setPassword] = useState('password123')
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
    <main className="grid min-h-dvh overflow-hidden bg-[#F8FAFC] lg:grid-cols-[1.02fr_0.98fr]">
      <section className="relative flex min-h-[42dvh] items-center overflow-hidden bg-[#0F172A] px-6 py-12 text-white lg:min-h-dvh lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(124,58,237,0.34),transparent_30%),radial-gradient(circle_at_82%_72%,rgba(34,211,238,0.16),transparent_28%),linear-gradient(135deg,#0F172A_0%,#1E1B4B_48%,#4C1D95_100%)]" />
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-violet-400/15 blur-3xl" />

        <div className="relative mx-auto w-full max-w-xl">
          <div className="mb-9">
            <SandeqLogo />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-100 ring-1 ring-white/15">
            <Sparkles size={15} />
            Digital Learning Platform
          </div>

          <h1 className="mt-7 text-balance text-5xl font-black leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            SEA Learning
          </h1>

          <p className="mt-5 max-w-lg text-sm font-extrabold uppercase tracking-[0.18em] text-cyan-200/95">
            {officialSchoolName}
          </p>

          <p className="mt-7 max-w-xl text-balance text-3xl font-black leading-tight tracking-[-0.04em] text-white sm:text-4xl">
            Dari Kepulauan, Menuju Masa Depan.
          </p>

          <p className="mt-5 max-w-lg text-base leading-8 text-slate-200/82">
            Platform pembelajaran digital yang ringan, rapi, dan terintegrasi untuk siswa,
            guru, admin, dan pimpinan sekolah.
          </p>

          <div className="mt-9 grid max-w-lg gap-3 sm:grid-cols-3">
            <MiniInfo icon={Waves} title="Ringan" text="Ramah jaringan" />
            <MiniInfo icon={UserRound} title="Role-based" text="Sesuai akses" />
            <MiniInfo icon={ShieldCheck} title="Terintegrasi" text="Siap produksi" />
          </div>
        </div>
      </section>

      <section className="flex min-h-[58dvh] items-center justify-center px-5 py-10 lg:min-h-dvh lg:px-10">
        <div className="w-full max-w-md">
          <div className="rounded-[2rem] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] ring-1 ring-slate-200 sm:p-8">
            <header className="mb-7">
              <p className="text-sm font-extrabold text-violet-700">Masuk ke aplikasi</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">
                Selamat datang kembali.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Gunakan akun sekolah atau pilih akses demo sesuai role.
              </p>
            </header>

            <form onSubmit={submit} className="space-y-4">
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Username atau Email
                <input
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="Contoh: Andi Saputra"
                  className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
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
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-12 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
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
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#7C3AED_0%,#8B5CF6_48%,#22D3EE_100%)] text-sm font-extrabold text-white shadow-[0_16px_36px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(124,58,237,0.26)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
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

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">
                akses demo
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Object.keys(demoUsers).map((role) => (
                <button
                  key={role}
                  onClick={() => finish(loginAs(role))}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-extrabold text-slate-700 transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                >
                  {roleLabels[role]}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-xs font-semibold leading-6 text-slate-400">
            SEA Learning · {officialSchoolName}
          </p>
        </div>
      </section>
    </main>
  )
}

function MiniInfo({ icon: Icon, title, text }) {
  return (
    <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
      <Icon className="text-cyan-200" size={20} />
      <p className="mt-3 text-sm font-extrabold text-white">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-300">{text}</p>
    </div>
  )
}

function SandeqLogo() {
  return (
    <div className="inline-flex h-20 w-20 items-center justify-center rounded-[1.65rem] bg-white/10 ring-1 ring-white/15">
      <svg
        viewBox="0 0 128 128"
        className="h-14 w-14 text-white"
        fill="none"
        role="img"
        aria-label="Logo SEA Learning"
      >
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M64 19V80" strokeWidth="5.5" />
          <path d="M68 25L99 78H68V25Z" fill="currentColor" strokeWidth="0" opacity="0.96" />
          <path d="M58 35L30 78H58V35Z" fill="currentColor" strokeWidth="0" opacity="0.72" />
          <path
            d="M27 84C38 94 51 99 65 98C80 97 93 92 104 84"
            strokeWidth="6"
          />
          <path
            d="M20 101C30 106 40 106 50 101C60 96 69 96 79 101C89 106 99 106 109 101"
            strokeWidth="4.2"
            opacity="0.68"
          />
          <path
            d="M34 113C43 110 52 110 61 113C70 116 78 116 87 113C95 110 103 110 111 113"
            strokeWidth="3.4"
            opacity="0.42"
          />
        </g>
      </svg>
    </div>
  )
}