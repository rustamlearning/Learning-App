import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Cloud,
  LogOut,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { navItems, roleLabels, school } from '../data/dummyData.js'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const items = navItems[user.role] || []
  const title = items.find((item) => location.pathname === item.path)?.label || roleLabels[user.role]

  return (
    <div className="min-h-dvh dashboard-mesh">
      <Sidebar user={user} items={items} open={mobileOpen} setOpen={setMobileOpen} onLogout={handleLogout} />

      <div className="lg:pl-[18.5rem]">
        <Topbar user={user} title={title} onMenu={() => setMobileOpen(true)} />

        <main className="mx-auto max-w-7xl px-4 py-5 pb-24 sm:px-6 lg:py-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function Sidebar({ user, items, open, setOpen, onLogout }) {
  const groups = groupNavItems(user.role, items)

  return (
    <>
      {open && (
        <button
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[18.5rem] max-w-[88vw] flex-col overflow-hidden sea-ink-panel text-white shadow-[0_24px_80px_rgba(15,31,42,0.32)] transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:38px_38px]" />
        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-[#d8a642]/10 blur-3xl" />

        <div className="relative flex-shrink-0 border-b border-white/10 p-4">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <IsleLearnMiniLogo />

              <div>
                <p className="text-base font-black leading-tight tracking-[-0.02em]">{school.appName}</p>
              <p className="line-clamp-2 text-xs leading-snug text-[#b9e4dc]/80">{school.name}</p>
              </div>
            </div>

            <button
              aria-label="Tutup sidebar"
              onClick={() => setOpen(false)}
              className="rounded-xl p-2 text-white/70 hover:bg-white/10 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-[#b9e4dc] ring-1 ring-white/10">
              <Cloud size={12} /> Hemat Data
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-[#f1c36d] ring-1 ring-white/10">
              <ShieldCheck size={12} /> Role-based
            </div>
          </div>
        </div>

        <nav className="thin-scrollbar relative min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3" aria-label="Menu role">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-1.5 pt-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#b9e4dc]/60">
                {group.label}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `group flex items-center gap-2.5 rounded-2xl px-2.5 py-2.5 text-sm font-bold transition duration-200 ${
                          isActive
                            ? 'bg-[linear-gradient(135deg,#0F766E,#138177,#5DB8B0)] text-white shadow-[0_16px_34px_rgba(19,129,119,0.26)] ring-1 ring-white/10'
                            : 'text-slate-200/78 hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl transition ${
                              isActive
                                ? 'bg-white/15 text-white shadow-[0_10px_20px_rgba(255,255,255,0.10)]'
                                : 'bg-white/10 text-[#b9e4dc] group-hover:bg-white/[0.14]'
                            }`}
                          >
                            <Icon size={17} />
                          </span>
                          <span className="truncate">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="relative flex-shrink-0 border-t border-white/10 p-3">
          <div className="mb-2 rounded-3xl bg-white/10 p-3 ring-1 ring-white/10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-sm font-black text-slate-950">
                {user.avatar}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black">{user.name}</p>
                <p className="text-xs font-semibold text-[#b9e4dc]/75">{roleLabels[user.role]}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white hover:text-slate-950"
            >
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

function groupNavItems(role, items) {
  const labels = {
    siswa: [
      ['Belajar', ['/dashboard', '/kelas', '/materi', '/latihan', '/kuis', '/flashcard', '/ai-tutor']],
      ['Aktivitas', ['/progres', '/leaderboard', '/isleclub']],
      ['Akun', ['/profil']],
    ],
    guru: [
      ['Mengajar', ['/dashboard', '/kelas', '/studio-konten', '/materi', '/bank-soal', '/tugas', '/kuis-live']],
      ['Evaluasi', ['/analisis-nilai', '/remedial']],
      ['Asisten', ['/ai-generator']],
      ['Laporan', ['/laporan']],
    ],
    admin: [
      ['Konsol', ['/dashboard']],
      ['Data Sekolah', ['/guru', '/siswa', '/kelas', '/mapel']],
      ['Sistem', ['/pengaturan', '/laporan', '/backup']],
    ],
    pimpinan: [
      ['Monitoring', ['/dashboard', '/monitoring-kelas', '/monitoring-guru', '/monitoring-siswa']],
      ['Laporan', ['/laporan-akademik', '/laporan-aktivitas']],
    ],
  }

  return (labels[role] || [['Menu', []]])
    .map(([label, suffixes]) => ({
      label,
      items: items.filter((item) => suffixes.some((suffix) => item.path.endsWith(suffix))),
    }))
    .filter((group) => group.items.length)
}

function Topbar({ user, title, onMenu }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#123c3b]/10 bg-[#fbfaf7]/86 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <button
          aria-label="Buka menu"
          onClick={onMenu}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#0f766e] shadow-[0_12px_28px_rgba(15,31,42,0.08)] ring-1 ring-[#123c3b]/10 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-black uppercase tracking-[0.14em] text-[#0f766e]">{school.shortName}</p>
          <h1 className="truncate text-lg font-black tracking-[-0.02em] text-[#13232d] sm:text-xl">{title}</h1>
        </div>

        <label className="hidden min-w-[18rem] items-center gap-2 rounded-2xl bg-white/78 px-4 py-2.5 text-sm text-slate-500 ring-1 ring-[#123c3b]/10 md:flex">
          <Search size={17} />
          <input
            placeholder="Cari materi, siswa, atau laporan"
            className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>

        <div className="hidden items-center gap-2 rounded-2xl bg-[#e8f4ef] px-3 py-2 text-xs font-bold text-[#0f766e] ring-1 ring-[#0f766e]/10 sm:flex">
          <ShieldCheck size={15} /> Hemat Data
        </div>

        <button
          aria-label="Ubah tema"
          className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-600 shadow-[0_12px_28px_rgba(15,31,42,0.08)] ring-1 ring-[#123c3b]/10 transition hover:-translate-y-0.5 hover:text-[#0f766e]"
        >
          <Moon size={18} />
        </button>

        <button
          aria-label="Notifikasi"
          className="relative grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#0f766e] shadow-[0_12px_28px_rgba(15,31,42,0.08)] ring-1 ring-[#123c3b]/10 transition hover:-translate-y-0.5"
        >
          <Bell size={18} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div className="hidden h-11 w-11 place-items-center rounded-2xl bg-[#123c3b] text-sm font-black text-white shadow-[0_12px_28px_rgba(15,31,42,0.12)] sm:grid">
          {user.avatar}
        </div>
      </div>
    </header>
  )
}

function IsleLearnMiniLogo() {
  return (
    <div className="inline-flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/95 p-1.5 shadow-[0_14px_32px_rgba(0,0,0,0.22)] ring-1 ring-white/70">
      <img
        src="/brand/islelearn-logo.png"
        alt="Logo IsleLearn"
        className="h-full w-full object-contain"
      />
    </div>
  )
}
