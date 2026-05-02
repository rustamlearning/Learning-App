import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { roleHome } from '../data/dummyData.js'

export default function RoleBasedRoute({ role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={roleHome[user.role] || '/login'} replace />
  return <Outlet />
}
