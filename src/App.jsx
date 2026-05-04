import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const Landing = lazy(() => import('./pages/Landing.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const RolePage = lazy(() => import('./pages/RolePage.jsx'))
const AppLayout = lazy(() => import('./layouts/AppLayout.jsx'))
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import RoleBasedRoute from './routes/RoleBasedRoute.jsx'
import { roleHome } from './data/dummyData.js'
import { useAuth } from './context/AuthContext.jsx'
import { EmptyState } from './components/ui.jsx'

const rolePages = {
  siswa: ['dashboard', 'kelas', 'materi', 'latihan', 'kuis', 'flashcard', 'ai-tutor', 'progres', 'leaderboard', 'profil', 'seaclub'],
  guru: ['dashboard', 'kelas', 'materi', 'bank-soal', 'tugas', 'kuis-live', 'studio-konten', 'analisis-nilai', 'remedial', 'ai-generator', 'laporan'],
  admin: ['dashboard', 'guru', 'siswa', 'kelas', 'mapel', 'pengaturan', 'laporan', 'backup'],
  pimpinan: ['dashboard', 'monitoring-kelas', 'monitoring-guru', 'monitoring-siswa', 'laporan-akademik', 'laporan-aktivitas'],
}

export default function App() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route element={<ProtectedRoute />}>
        {Object.entries(rolePages).map(([role, pages]) => (
          <Route key={role} element={<RoleBasedRoute role={role} />}>
            <Route path={`/${role}`} element={<AppLayout />}>
              <Route index element={<Navigate to={roleHome[role]} replace />} />
              {pages.map((page) => (
                <Route key={`${role}-${page}`} path={page} element={<RolePage role={role} page={page} />} />
              ))}
            </Route>
          </Route>
        ))}
      </Route>
        <Route path="*" element={<FallbackRedirect />} />
      </Routes>
    </Suspense>
  )
}

function RouteLoading() {
  return (
    <main className="grid min-h-dvh place-items-center bg-galaxy-surface p-4">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-500 shadow-soft">
        Memuat halaman...
      </div>
    </main>
  )
}

function Unauthorized() {
  return (
    <main className="grid min-h-dvh place-items-center bg-galaxy-surface p-4">
      <EmptyState title="Akses tidak sesuai role" description="Silakan kembali ke dashboard sesuai akun demo yang sedang aktif." />
    </main>
  )
}

function FallbackRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? roleHome[user.role] : '/login'} replace />
}
