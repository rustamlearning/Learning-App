import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { demoUsers } from '../data/dummyData.js'
import {
  getCurrentAuthUser,
  getLoginEmailByIdentifier,
  getProfileByAuthUserId,
  isSupabaseConfigured,
  normalizeLoginIdentifier,
  signInWithPassword,
  signOut,
} from '../services/supabaseClient.js'

const AuthContext = createContext(null)
const STORAGE_KEY = 'sea-learning-auth'
const SUPABASE_SESSION_KEY = 'sea-learning-supabase-session'

function isDemoAuthEnabled() {
  return import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true'
}

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
            const storedSession = JSON.parse(rawSession)
            const authUser = await getCurrentAuthUser(storedSession.access_token)
            const profile = await getProfileByAuthUserId(authUser.id, storedSession.access_token)

            if (!profile && !isDemoAuthEnabled()) {
              throw new Error('Profil pengguna belum terdaftar di database sekolah.')
            }

            if (active) {
              setSession(storedSession)
              setUser(toAppUser(authUser, profile))
            }

            return
          }
        }

        const rawDemoUser = localStorage.getItem(STORAGE_KEY)

        if (rawDemoUser && isDemoAuthEnabled() && active) {
          setUser(JSON.parse(rawDemoUser))
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch (error) {
        localStorage.removeItem(SUPABASE_SESSION_KEY)

        const rawDemoUser = localStorage.getItem(STORAGE_KEY)
        if (rawDemoUser && isDemoAuthEnabled() && active) {
          setUser(JSON.parse(rawDemoUser))
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
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
    if (!isDemoAuthEnabled()) {
      throw new Error('Akses demo hanya aktif di mode pengembangan.')
    }

    const demo = demoUsers[role]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo))
    localStorage.removeItem(SUPABASE_SESSION_KEY)
    setSession(null)
    setUser(demo)
    return demo
  }

  async function loginWithEmail(identifier, password) {
    const normalized = normalizeLoginIdentifier(identifier)

    if (isSupabaseConfigured()) {
      try {
        const authEmail = await getLoginEmailByIdentifier(normalized)
        const supabaseSession = await signInWithPassword(authEmail, password)
        const profile = await getProfileByAuthUserId(supabaseSession.user.id, supabaseSession.access_token)

        if (!profile && !isDemoAuthEnabled()) {
          throw new Error('Akun berhasil login, tetapi profil sekolah belum dibuat. Hubungi admin sekolah.')
        }

        const appUser = toAppUser(supabaseSession.user, profile)
        localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(supabaseSession))
        localStorage.removeItem(STORAGE_KEY)
        setSession(supabaseSession)
        setUser(appUser)
        return appUser
      } catch (error) {
        if (isDemoAuthEnabled()) {
          const demo = findDemoUser(normalized)
          if (demo) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(demo))
            localStorage.removeItem(SUPABASE_SESSION_KEY)
            setSession(null)
            setUser(demo)
            return demo
          }
        }

        throw new Error(error.message || 'Login gagal. Periksa username dan password.')
      }
    }

    if (isDemoAuthEnabled()) {
      const demo = findDemoUser(normalized) || demoUsers.siswa
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demo))
      localStorage.removeItem(SUPABASE_SESSION_KEY)
      setSession(null)
      setUser(demo)
      return demo
    }

    throw new Error('Login production belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Vercel.')
  }

  async function logout() {
    if (isSupabaseConfigured()) {
      const rawSession = localStorage.getItem(SUPABASE_SESSION_KEY)

      if (rawSession) {
        try {
          const storedSession = JSON.parse(rawSession)
          await signOut(storedSession.access_token)
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
    demoAuthEnabled: isDemoAuthEnabled(),
  }), [user, loading, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function findDemoUser(identifier) {
  return Object.values(demoUsers).find((item) => (
    item.email.toLowerCase() === identifier
    || item.name.toLowerCase() === identifier
    || item.role.toLowerCase() === identifier
  ))
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

function toAppUser(authUser, profile) {
  const fallbackDemo = isDemoAuthEnabled()
    ? Object.values(demoUsers).find((item) => item.email === authUser.email)
    : null

  const role = profile?.role || authUser.user_metadata?.role || fallbackDemo?.role || 'siswa'
  const name = profile?.name || authUser.user_metadata?.name || fallbackDemo?.name || authUser.email

  return {
    id: profile?.id || authUser.id,
    authUserId: authUser.id,
    name,
    email: authUser.email,
    role,
    avatar: fallbackDemo?.avatar || name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
    className: fallbackDemo?.className || profile?.className,
    nis: fallbackDemo?.nis || profile?.nis,
    subject: fallbackDemo?.subject || profile?.subject,
  }
}
