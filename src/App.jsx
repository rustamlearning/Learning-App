import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import RolePage from './pages/RolePage.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import RoleBasedRoute from './routes/RoleBasedRoute.jsx'
import { roleHome } from './data/dummyData.js'
import { useAuth } from './context/AuthContext.jsx'
import { EmptyState } from './components/ui.jsx'

const rolePages = {
  siswa: ['dashboard', 'kelas', 'materi', 'latihan', 'kuis', 'flashcard', 'ai-tutor', 'progres', 'leaderboard', 'profil', 'seaclub'],
  guru: ['dashboard', 'kelas', 'materi', 'bank-soal', 'tugas', 'kuis-live', 'analisis-nilai', 'remedial', 'ai-generator', 'laporan'],
  admin: ['dashboard', 'guru', 'siswa', 'kelas', 'mapel', 'pengaturan', 'laporan', 'backup'],
  pimpinan: ['dashboard', 'monitoring-kelas', 'monitoring-guru', 'monitoring-siswa', 'laporan-akademik', 'laporan-aktivitas'],
}

export default function App() {
  return (
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
