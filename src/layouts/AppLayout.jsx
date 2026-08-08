import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { navItems, roleLabels, school } from '../data/dummyData.js'
import { isTeacherHomeroom } from '../utils/homeroomAccess.js'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const items = useMemo(() => getVisibleNavItems(user), [user])
  const hasBottomNav = ['siswa', 'guru'].includes(user.role)
  const title = getPageTitle(user.role, location.pathname, items)

  return (
    <div className="min-h-dvh dashboard-mesh">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-xl focus:bg-[#17446E] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white">
        Lewati ke konten
      </a>
      <Sidebar user={user} items={items} open={mobileOpen} setOpen={setMobileOpen} onLogout={handleLogout} />

      <div className="lg:pl-[17rem]">
        <Topbar user={user} title={title} showMenuButton onMenu={() => setMobileOpen(true)} />

        <main id="main-content" className={`mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8 ${hasBottomNav ? 'pb-28 lg:pb-8' : 'pb-24'}`}>
          <Outlet />
        </main>
      </div>

      {hasBottomNav && <BottomNavigation items={items} role={user.role} />}
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
        className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] max-w-[88vw] flex-col overflow-hidden border-r border-[#0E355A] bg-[#123B63] text-white shadow-[18px_0_44px_rgba(11,37,64,0.20)] transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative flex-shrink-0 border-b border-white/10 p-4">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white p-1.5 shadow-[0_12px_28px_rgba(5,20,35,0.22)]">
                <IsleLearnMiniLogo />
              </div>

              <div className="translate-y-1">
                <p className="text-base font-black leading-tight text-white">{school.appName}</p>
                <p className="line-clamp-2 text-xs leading-snug text-sky-100/78">{school.name}</p>
              </div>
            </div>

            <button
              aria-label="Tutup sidebar"
              onClick={() => setOpen(false)}
              className="rounded-xl p-2 text-sky-100 transition hover:bg-white/10 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

        </div>

        <nav className="thin-scrollbar relative min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3" aria-label="Menu role">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-1.5 pt-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-100/52">
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
                            ? 'bg-white text-[#123B63] shadow-[0_12px_24px_rgba(5,20,35,0.14)]'
                            : 'text-sky-100/82 hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl transition ${
                              isActive
                                ? 'bg-[#EAF4FF] text-[#2F80D8]'
                                : 'bg-white/10 text-sky-100 group-hover:bg-white/16 group-hover:text-white'
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
          <div className="mb-2 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-sm font-black text-[#123B63]">
                {user.avatar}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-white">{user.name}</p>
                <p className="text-xs font-semibold text-sky-100/72">{roleLabels[user.role]}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/10 transition hover:bg-white hover:text-[#123B63]"
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
      ['Utama', ['/dashboard', '/materi', '/tugas', '/kuis', '/progres']],
    ],
    guru: [
      ['Mengajar', ['/dashboard', '/kelas', '/materi', '/bank-soal', '/tugas', '/kuis-live']],
      ['Kelola', ['/daftar-nilai', '/tugas-harian', '/daftar-hadir']],
    ],
    admin: [
      ['Konsol', ['/dashboard']],
      ['Data Sekolah', ['/guru', '/siswa', '/kelas', '/wali-kelas', '/mapel', '/daftar-hadir']],
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

function getPageTitle(role, pathname, items) {
  const directTitle = items.find((item) => pathname === item.path)?.label
  if (directTitle) return directTitle

  const hiddenTitles = {
    siswa: {
      '/siswa/kelas': 'Belajar',
      '/siswa/latihan': 'Latihan',
      '/siswa/kuis': 'Kuis',
      '/siswa/flashcard': 'Belajar',
      '/siswa/ai-tutor': 'Bantuan belajar',
      '/siswa/leaderboard': 'Progres',
      '/siswa/isleclub': 'Belajar',
      '/siswa/profil': 'Profil',
    },
    guru: {
      '/guru/bank-soal': 'Bank Soal',
      '/guru/tugas': 'Tugas',
      '/guru/kuis-live': 'Kuis',
      '/guru/studio-konten': 'Siapkan Pembelajaran',
      '/guru/tugas-harian': 'Tugas Harian',
      '/guru/rapor': 'Rapor',
      '/guru/analisis-nilai': 'Analisis Nilai',
      '/guru/remedial': 'Remedial',
      '/guru/ai-generator': 'AI Cepat',
      '/guru/laporan': 'Laporan',
      '/guru/profil': 'Profil',
    },
  }

  return hiddenTitles[role]?.[pathname] || roleLabels[role]
}

function getVisibleNavItems(user) {
  const items = navItems[user.role] || []
  if (user.role !== 'guru') return items

  const hasHomeroomAccess = isTeacherHomeroom(user)
  return items.filter((item) => item.path !== '/guru/rapor' || hasHomeroomAccess)
}

function Topbar({ user, title, showMenuButton = true, onMenu }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const visibleItems = useMemo(() => getVisibleNavItems(user), [user])
  const profilePath = user.role === 'siswa' || user.role === 'guru' ? `/${user.role}/profil` : null
  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return []
    return visibleItems
      .filter((item) => item.label.toLowerCase().includes(normalizedQuery))
      .slice(0, 5)
  }, [query, visibleItems])

  function submitSearch(event) {
    event.preventDefault()
    const firstResult = searchResults[0]
    if (!firstResult) return
    navigate(firstResult.path)
    setQuery('')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#D9E6F5] bg-white/95">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <button
          aria-label="Buka menu"
          onClick={onMenu}
          className={`h-11 w-11 place-items-center rounded-xl bg-white text-[#2F80D8] ring-1 ring-[#D9E6F5] lg:hidden ${showMenuButton ? 'grid' : 'hidden'}`}
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-black uppercase tracking-[0.12em] text-[#2F80D8]">{school.shortName}</p>
          <h1 className="truncate text-lg font-black text-[#132437] sm:text-xl">{title}</h1>
        </div>

        <form onSubmit={submitSearch} className="relative hidden min-w-[18rem] md:block lg:min-w-[26rem]">
          <label className="flex h-12 items-center gap-2 rounded-[1rem] bg-white px-4 text-sm text-[#64748B] shadow-[0_10px_24px_rgba(15,36,55,0.035)] ring-1 ring-[#D9E6F5]">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari menu, kelas, materi, atau siswa..."
              className="w-full bg-transparent text-[#132437] outline-none placeholder:text-slate-400"
            />
          </label>
          {query.trim() && (
            <div className="absolute right-0 top-12 z-40 w-full overflow-hidden rounded-xl border border-[#D9E6F5] bg-white shadow-[0_14px_34px_rgba(15,36,55,0.10)]">
              {searchResults.length ? (
                searchResults.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => {
                        navigate(item.path)
                        setQuery('')
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-[#F5F9FF] hover:text-[#2F80D8]"
                    >
                      <Icon size={16} />
                      {item.label}
                    </button>
                  )
                })
              ) : (
                <p className="px-3 py-3 text-sm font-semibold text-[#64748B]">Menu tidak ditemukan.</p>
              )}
            </div>
          )}
        </form>

        <button
          aria-label="Notifikasi"
          disabled
          className="grid h-12 w-12 place-items-center rounded-[1rem] bg-white text-[#64748B] shadow-[0_10px_24px_rgba(15,36,55,0.035)] ring-1 ring-[#D9E6F5]"
        >
          <Bell size={18} />
        </button>

        <button
          type="button"
          aria-label="Buka profil"
          onClick={() => profilePath && navigate(profilePath)}
          disabled={!profilePath}
          className="hidden min-h-12 items-center gap-3 rounded-[1rem] bg-white px-2.5 pr-3 text-left shadow-[0_10px_24px_rgba(15,36,55,0.035)] ring-1 ring-[#D9E6F5] transition hover:-translate-y-0.5 hover:bg-[#F8FBFF] disabled:cursor-default disabled:hover:translate-y-0 sm:flex"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#17446E] text-sm font-black text-white">
            {user.avatar}
          </span>
          <span className="hidden min-w-0 lg:block">
            <span className="block max-w-[9rem] truncate text-sm font-black leading-tight text-[#102A43]">{user.name}</span>
            <span className="mt-0.5 block text-xs font-bold leading-tight text-[#64748B]">{roleLabels[user.role]}</span>
          </span>
          <ChevronDown size={15} className="hidden text-[#64748B] lg:block" />
        </button>
      </div>
    </header>
  )
}

function BottomNavigation({ items = [], role }) {
  const mobileItems = items.slice(0, 5)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D9E6F5] bg-white/94 px-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-16px_44px_rgba(15,36,55,0.10)] backdrop-blur-xl lg:hidden" aria-label="Navigasi utama">
      <div className="mx-auto grid max-w-xl gap-1" style={{ gridTemplateColumns: `repeat(${mobileItems.length}, minmax(0, 1fr))` }}>
        {mobileItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex min-h-[3.75rem] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-black transition ${
                  isActive
                    ? 'bg-[#EAF4FF] text-[#17446E]'
                    : 'text-[#64748B] hover:bg-[#F8FBFF] hover:text-[#2F80D8]'
                }`
              }
            >
              <Icon size={19} />
              <span className="max-w-full truncate">{item.label.replace(' & ', ' ')}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

function IsleLearnMiniLogo() {
  return (
    <div className="inline-flex h-14 w-14 flex-shrink-0 items-center justify-center">
      <img
        src="/brand/islelearn-logo.png"
        alt="Logo IsleLearn"
        className="h-full w-full object-contain"
      />
    </div>
  )
}
