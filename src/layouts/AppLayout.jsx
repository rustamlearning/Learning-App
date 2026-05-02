import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Cloud, LogOut, Menu, Moon, Search, ShieldCheck, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { navItems, roleLabels, school } from '../data/dummyData.js'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const items = navItems[user.role] || []
  const title = items.find((item) => location.pathname === item.path)?.label || roleLabels[user.role]

  return (
    <div className="dashboard-mesh min-h-dvh">
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
      {open && <button aria-label="Tutup menu" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-galaxy-navy/45 backdrop-blur-sm lg:hidden" />}
      <aside className={`sidebar-aurora fixed inset-y-0 left-0 z-50 flex w-[18.5rem] max-w-[88vw] flex-col text-white shadow-glow transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex-shrink-0 border-b border-white/10 p-4">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-galaxy-action text-lg font-extrabold shadow-glow">SEA</div>
              <div>
                <p className="text-base font-extrabold leading-tight">{school.appName}</p>
                <p className="line-clamp-2 text-xs leading-snug text-cyan-100/80">{school.name}</p>
              </div>
            </div>
            <button aria-label="Tutup sidebar" onClick={() => setOpen(false)} className="rounded-xl p-2 text-white/70 hover:bg-white/10 lg:hidden"><X size={18} /></button>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-cyan-100 ring-1 ring-white/10">
            <Cloud size={12} /> Hemat Data
          </div>
        </div>

        <nav className="thin-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3" aria-label="Menu role">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-1.5 pt-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-cyan-100/52">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) => `sidebar-nav-link group flex items-center gap-2.5 rounded-2xl px-2.5 py-2 text-sm font-bold transition duration-200 ${isActive ? 'sidebar-nav-link-active text-white' : 'text-purple-100/74 hover:text-white'}`}
                    >
                      <span className="sidebar-menu-icon grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl bg-white/10 text-white transition group-hover:bg-white/[0.12]"><Icon size={17} /></span>
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="flex-shrink-0 border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-2xl bg-white/10 p-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-sm font-extrabold text-galaxy-deep">{user.avatar}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold">{user.name}</p>
              <p className="text-xs text-purple-100/72">{roleLabels[user.role]}</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-purple-100 transition hover:bg-white/10 hover:text-white">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>
    </>
  )
}

function groupNavItems(role, items) {
  const labels = {
    siswa: [
      ['Belajar', ['/dashboard', '/kelas', '/materi', '/latihan', '/kuis', '/flashcard', '/ai-tutor']],
      ['Aktivitas', ['/progres', '/leaderboard', '/seaclub']],
      ['Akun', ['/profil']],
    ],
    guru: [
      ['Mengajar', ['/dashboard', '/kelas', '/materi', '/bank-soal', '/tugas', '/kuis-live']],
      ['Evaluasi', ['/analisis-nilai', '/remedial', '/ai-generator']],
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

  return (labels[role] || [['Menu', []]]).map(([label, suffixes]) => ({
    label,
    items: items.filter((item) => suffixes.some((suffix) => item.path.endsWith(suffix))),
  })).filter((group) => group.items.length)
}

function Topbar({ user, title, onMenu }) {
  return (
    <header className="sticky top-0 z-30 border-b border-purple-100 bg-white/78 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <button aria-label="Buka menu" onClick={onMenu} className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-galaxy-purple shadow-soft ring-1 ring-purple-100 lg:hidden">
          <Menu size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-galaxy-purple">{school.shortName}</p>
          <h1 className="truncate text-lg font-extrabold text-gray-950 sm:text-xl">{title}</h1>
        </div>
        <label className="hidden min-w-[18rem] items-center gap-2 rounded-2xl bg-galaxy-surface px-4 py-2.5 text-sm text-gray-500 ring-1 ring-purple-100 md:flex">
          <Search size={17} />
          <input placeholder="Cari materi, siswa, atau laporan" className="w-full bg-transparent outline-none" />
        </label>
        <div className="hidden items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100 sm:flex">
          <ShieldCheck size={15} /> Hemat Data
        </div>
        <button aria-label="Theme placeholder" className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-gray-600 shadow-soft ring-1 ring-purple-100">
          <Moon size={18} />
        </button>
        <button aria-label="Notifikasi" className="relative grid h-11 w-11 place-items-center rounded-2xl bg-white text-galaxy-purple shadow-soft ring-1 ring-purple-100">
          <Bell size={18} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-galaxy-magenta ring-2 ring-white" />
        </button>
        <div className="hidden h-11 w-11 place-items-center rounded-2xl bg-galaxy-deep text-sm font-extrabold text-white sm:grid">{user.avatar}</div>
      </div>
    </header>
  )
}
