import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { demoUsers } from '../data/dummyData.js'

const AuthContext = createContext(null)
const STORAGE_KEY = 'sea-learning-auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) setUser(JSON.parse(raw))
    setLoading(false)
  }, [])

  function loginAs(role) {
    const demo = demoUsers[role]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo))
    setUser(demo)
    return demo
  }

  function loginWithEmail(email) {
    const normalized = email.toLowerCase()
    const demo = Object.values(demoUsers).find((item) => item.email === normalized) || demoUsers.siswa
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo))
    setUser(demo)
    return demo
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  const value = useMemo(() => ({ user, loading, loginAs, loginWithEmail, logout }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
