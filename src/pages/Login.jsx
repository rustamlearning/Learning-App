import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { demoUsers, roleHome, roleLabels, school } from '../data/dummyData.js'

export default function Login() {
  const navigate = useNavigate()
  const { loginAs, loginWithEmail } = useAuth()
  const [email, setEmail] = useState('andi@sman6pangkep.sch.id')
  const [password, setPassword] = useState('demo123')
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
      const user = await loginWithEmail(email, password)
      finish(user)
    } catch (error) {
      setError(error.message || 'Login gagal. Periksa email dan password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-dvh overflow-hidden bg-white lg:grid-cols-2">
      <section className="relative flex min-h-[44dvh] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.28),transparent_30%),radial-gradient(circle_at_80%_75%,rgba(34,211,238,0.16),transparent_28%),linear-gradient(135deg,#0F172A_0%,#1E1B4B_48%,#4C1D95_100%)] px-6 py-12 text-white lg:min-h-dvh">
        <div className="absolute left-10 top-10 h-64 w-64 rounded-full bg-galaxy-violet/15 blur-3xl" />
        <div className="absolute bottom-8 right-8 h-72 w-72 rounded-full bg-galaxy-cyan/10 blur-3xl" />

        <section className="relative mx-auto flex max-w-[420px] flex-col items-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[1.5rem] bg-white/[0.045] shadow-[0_18px_52px_rgba(34,211,238,0.10)] ring-1 ring-white/[0.07] sm:h-28 sm:w-28">
            <LoginBoatLogo />
          </div>

          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.22em] text-cyan-100/70">Digital Learning Platform</p>
          <h1 className="text-balance text-[3.25rem] font-extrabold leading-[0.95] tracking-[-0.045em] sm:text-[3.75rem]">SEA Learning</h1>
          <p className="mt-5 max-w-sm text-[17px] font-semibold leading-7 text-purple-100/90">{school.name}</p>
          <p className="mt-5 text-[15px] font-semibold leading-6 text-cyan-100/90">Your learning journey starts from the islands.</p>
        </section>
      </section>

      <section className="flex min-h-[56dvh] items-center justify-center bg-[#FAFAFF] px-5 py-10 lg:min-h-dvh">
        <div className="w-full max-w-md">
          <header className="mb-7">
            <h2 className="text-3xl font-extrabold tracking-[-0.035em] text-gray-950">Masuk</h2>
            <p className="mt-3 text-base font-semibold text-gray-700">Masuk ke akun belajar Anda</p>
          </header>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="grid gap-2 text-sm font-bold text-gray-700">
              Username atau Email
              <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@sman6pangkep.sch.id" className="h-12 rounded-2xl border border-purple-500/[0.12] bg-white px-4 outline-none transition focus:border-galaxy-purple focus:ring-4 focus:ring-purple-500/[0.14]" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-gray-700">
              Password
              <span className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password" className="h-12 w-full rounded-2xl border border-purple-500/[0.12] bg-white px-4 pr-12 outline-none transition focus:border-galaxy-purple focus:ring-4 focus:ring-purple-500/[0.14]" />
                <button type="button" aria-label="Tampilkan password" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-gray-500 hover:bg-white">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#7C3AED_0%,#8B5CF6_50%,#22D3EE_100%)] text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(124,58,237,0.20)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(124,58,237,0.24)]">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Masuk <ArrowRight size={17} /></>}
            </button>
            {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">{error}</p>}
          </form>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-purple-100" />
            <span className="text-xs font-bold text-gray-400">akses demo</span>
            <div className="h-px flex-1 bg-purple-100" />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {Object.keys(demoUsers).map((role) => (
              <button key={role} onClick={() => finish(loginAs(role))} className="rounded-full border border-purple-500/[0.12] bg-white px-4 py-2 text-sm font-bold text-purple-700 transition hover:-translate-y-0.5 hover:bg-purple-500/[0.06]">
                {roleLabels[role]}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function LoginBoatLogo() {
  return (
    <svg viewBox="0 0 128 128" className="h-16 w-16 text-white sm:h-20 sm:w-20" fill="none" role="img" aria-label="Logo SEA Learning App">
      <g opacity="0.96" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M64 22v58" />
        <path d="M64 28c-14 13-23 29-27 49h27V28Z" fill="currentColor" strokeWidth="0" opacity="0.9" />
        <path d="M71 38c13 10 21 24 24 39H71V38Z" fill="currentColor" strokeWidth="0" opacity="0.82" />
        <path d="M31 82h67c-6 14-18 21-34 21s-27-7-33-21Z" fill="currentColor" strokeWidth="0" opacity="0.94" />
        <path d="M23 103c10-5 20-5 30 0s20 5 30 0 19-5 28 0" opacity="0.72" />
        <path d="M35 114c8-3 16-3 24 0s17 3 25 0 15-3 23 0" opacity="0.46" />
      </g>
    </svg>
  )
}
