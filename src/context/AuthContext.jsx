import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { demoUsers } from '../data/dummyData.js'
import { getCurrentAuthUser, getProfileByAuthUserId, isSupabaseConfigured, signInWithPassword, signOut } from '../services/supabaseClient.js'

const AuthContext = createContext(null)
const STORAGE_KEY = 'sea-learning-auth'
const SUPABASE_SESSION_KEY = 'sea-learning-supabase-session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function restoreSession() {
      try {
        if (isSupabaseConfigured()) {
          const rawSession = localStorage.getItem(SUPABASE_SESSION_KEY)
          if (rawSession) {
            const session = JSON.parse(rawSession)
            const authUser = await getCurrentAuthUser(session.access_token)
            const profile = await getProfileByAuthUserId(authUser.id, session.access_token)
            if (active) {
              setSession(session)
              setUser(toAppUser(authUser, profile))
            }
            return
          }
        }

        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw && active) setUser(JSON.parse(raw))
      } catch (error) {
        localStorage.removeItem(SUPABASE_SESSION_KEY)
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw && active) setUser(JSON.parse(raw))
      } finally {
        if (active) setLoading(false)
      }
    }

    restoreSession()
    return () => {
      active = false
    }
  }, [])

  function loginAs(role) {
    const demo = demoUsers[role]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo))
    localStorage.removeItem(SUPABASE_SESSION_KEY)
    setSession(null)
    setUser(demo)
    return demo
  }

  async function loginWithEmail(email, password) {
    const normalized = email.toLowerCase()

    if (isSupabaseConfigured()) {
      try {
        const session = await signInWithPassword(normalized, password)
        const profile = await getProfileByAuthUserId(session.user.id, session.access_token)
        const appUser = toAppUser(session.user, profile)
        localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(session))
        localStorage.removeItem(STORAGE_KEY)
        setSession(session)
        setUser(appUser)
        return appUser
      } catch (error) {
        const demo = Object.values(demoUsers).find((item) => item.email === normalized)
        if (!demo) throw error
      }
    }

    const demo = Object.values(demoUsers).find((item) => item.email === normalized) || demoUsers.siswa
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo))
    localStorage.removeItem(SUPABASE_SESSION_KEY)
    setSession(null)
    setUser(demo)
    return demo
  }

  async function logout() {
    if (isSupabaseConfigured()) {
      const rawSession = localStorage.getItem(SUPABASE_SESSION_KEY)
      if (rawSession) {
        try {
          const session = JSON.parse(rawSession)
          await signOut(session.access_token)
        } catch (error) {
          // Local cleanup must still happen if the remote session is already expired.
        }
      }
    }

    localStorage.removeItem(SUPABASE_SESSION_KEY)
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
    setUser(null)
  }

  const value = useMemo(() => ({
    user,
    loading,
    session,
    accessToken: session?.access_token,
    loginAs,
    loginWithEmail,
    logout,
    supabaseEnabled: isSupabaseConfigured(),
  }), [user, loading, session])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

function toAppUser(authUser, profile) {
  const fallbackDemo = Object.values(demoUsers).find((item) => item.email === authUser.email)
  const role = profile?.role || authUser.user_metadata?.role || fallbackDemo?.role || 'siswa'
  const name = profile?.name || authUser.user_metadata?.name || fallbackDemo?.name || authUser.email

  return {
    id: profile?.id || authUser.id,
    authUserId: authUser.id,
    name,
    email: authUser.email,
    role,
    avatar: fallbackDemo?.avatar || name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
    className: fallbackDemo?.className,
    nis: fallbackDemo?.nis,
    subject: fallbackDemo?.subject || profile?.subject,
  }
}
