import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  getCurrentAuthUser,
  getLoginEmailByIdentifier,
  getProfileByAuthUserId,
  isSupabaseConfigured,
  normalizeLoginIdentifier,
  refreshSupabaseSession,
  signInWithPassword,
  signOut,
} from '../services/supabaseClient.js'
import {
  AUTH_STORAGE_KEY,
  LEGACY_AUTH_STORAGE_KEY,
  LEGACY_DEMO_PURGE_STORAGE_KEY,
  LEGACY_SUPABASE_SESSION_STORAGE_KEY,
  STORAGE_SUFFIX,
  SUPABASE_SESSION_STORAGE_KEY,
  legacyStorageKey,
  migrateLegacyStorageKey,
  migrateLegacyStoragePrefixes,
} from '../utils/storageKeys.js'
import { teachers } from '../data/dummyData.js'
import { getLocalAdminProfiles, safeReadLocalJson, safeWriteLocalJson } from '../utils/localLearningStore.js'

const AuthContext = createContext(null)
const STORAGE_KEY = AUTH_STORAGE_KEY
const SUPABASE_SESSION_KEY = SUPABASE_SESSION_STORAGE_KEY
const LEGACY_DEMO_PURGE_KEY = LEGACY_DEMO_PURGE_STORAGE_KEY
const LEGACY_DEMO_KEYS = [LEGACY_AUTH_STORAGE_KEY, LEGACY_SUPABASE_SESSION_STORAGE_KEY]
const LEGACY_DEMO_PREFIXES = Object.values(STORAGE_SUFFIX).map((suffix) => legacyStorageKey(suffix))
const TEACHER_PASSWORD_STORAGE_KEY = 'islelearn-teacher-passwords-v1'
const SESSION_REFRESH_MARGIN_MS = 2 * 60 * 1000
const SESSION_REFRESH_FALLBACK_MS = 55 * 60 * 1000
const LOCAL_PREVIEW_USERS = {
  siswa: {
    id: 'local-preview-siswa',
    name: 'Siswa',
    email: 'siswa@local.preview',
    role: 'siswa',
    avatar: 'S',
    className: 'XI Pangeran Diponegoro',
  },
  guru: {
    id: 'local-preview-guru',
    name: 'Guru',
    email: 'guru@local.preview',
    role: 'guru',
    avatar: 'G',
    subject: 'Bahasa Inggris',
  },
  admin: {
    id: 'local-preview-admin',
    name: 'Admin',
    email: 'admin@local.preview',
    role: 'admin',
    avatar: 'A',
  },
  pimpinan: {
    id: 'local-preview-pimpinan',
    name: 'Pimpinan',
    email: 'pimpinan@local.preview',
    role: 'pimpinan',
    avatar: 'P',
  },
}

function isDemoAuthEnabled() {
  return import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true'
}

function getSessionExpiryMs(session) {
  const explicitExpiry = Number(session?.expires_at)
  if (Number.isFinite(explicitExpiry) && explicitExpiry > 0) return explicitExpiry * 1000

  try {
    const payload = session?.access_token?.split('.')[1]
    if (!payload) return Date.now() + SESSION_REFRESH_FALLBACK_MS
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')))
    const tokenExpiry = Number(decoded?.exp)
    return Number.isFinite(tokenExpiry) && tokenExpiry > 0
      ? tokenExpiry * 1000
      : Date.now() + SESSION_REFRESH_FALLBACK_MS
  } catch (error) {
    return Date.now() + SESSION_REFRESH_FALLBACK_MS
  }
}

function isSessionExpiringSoon(session) {
  return getSessionExpiryMs(session) <= Date.now() + SESSION_REFRESH_MARGIN_MS
}

async function restoreSupabaseSession(storedSession) {
  let activeSession = storedSession

  if (isSessionExpiringSoon(activeSession) && activeSession?.refresh_token) {
    activeSession = await refreshSupabaseSession(activeSession.refresh_token)
  }

  try {
    const authUser = await getCurrentAuthUser(activeSession.access_token)
    return { activeSession, authUser }
  } catch (error) {
    if (!activeSession?.refresh_token || activeSession !== storedSession) throw error
    activeSession = await refreshSupabaseSession(activeSession.refresh_token)
    const authUser = await getCurrentAuthUser(activeSession.access_token)
    return { activeSession, authUser }
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function restoreSession() {
      try {
        purgeLegacyDemoStorage()

        if (isSupabaseConfigured()) {
          const rawSession = localStorage.getItem(SUPABASE_SESSION_KEY)

          if (rawSession) {
            const storedSession = JSON.parse(rawSession)
            const { activeSession, authUser } = await restoreSupabaseSession(storedSession)
            const profile = await getProfileByAuthUserId(authUser.id, activeSession.access_token)

            if (!profile && !isDemoAuthEnabled()) {
              throw new Error('Profil pengguna belum terdaftar di database sekolah.')
            }

            if (active) {
              localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(activeSession))
              setSession(activeSession)
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

  useEffect(() => {
    if (!session?.refresh_token || !isSupabaseConfigured()) return undefined

    let active = true
    const refreshDelay = Math.max(
      1000,
      getSessionExpiryMs(session) - Date.now() - SESSION_REFRESH_MARGIN_MS,
    )

    const timer = window.setTimeout(async () => {
      try {
        const refreshedSession = await refreshSupabaseSession(session.refresh_token)
        const authUser = refreshedSession.user || await getCurrentAuthUser(refreshedSession.access_token)
        const profile = await getProfileByAuthUserId(authUser.id, refreshedSession.access_token)

        if (!profile && !isDemoAuthEnabled()) {
          throw new Error('Profil pengguna tidak lagi tersedia di database sekolah.')
        }

        if (active) {
          localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(refreshedSession))
          setSession(refreshedSession)
          setUser(toAppUser(authUser, profile))
        }
      } catch (error) {
        console.error('[auth] Gagal memperbarui sesi Supabase.', error)
        if (active) {
          localStorage.removeItem(SUPABASE_SESSION_KEY)
          setSession(null)
          setUser(null)
        }
      }
    }, refreshDelay)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [session?.access_token, session?.expires_at, session?.refresh_token])

  function loginAs(role) {
    if (!isDemoAuthEnabled()) {
      throw new Error('Akses demo hanya aktif di mode pengembangan.')
    }

    const demo = LOCAL_PREVIEW_USERS[role]
    if (!demo) {
      throw new Error('Akses demo sudah dinonaktifkan. Gunakan akun sekolah yang terdaftar.')
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo))
    localStorage.removeItem(SUPABASE_SESSION_KEY)
    setSession(null)
    setUser(demo)
    return demo
  }

  function loginLocalUser(appUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser))
    localStorage.removeItem(SUPABASE_SESSION_KEY)
    setSession(null)
    setUser(appUser)
    return appUser
  }

  async function loginWithEmail(identifier, password) {
    const normalized = normalizeLoginIdentifier(identifier)
    const teacherByNip = findTeacherByNipCredentials(identifier, password)

    if (teacherByNip) {
      return loginLocalUser(teacherByNip)
    }

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
          const demo = findDemoUser(normalized, password)
          if (demo) {
            return loginLocalUser(demo)
          }
        }

        throw new Error(error.message || 'Login gagal. Periksa username dan password.')
      }
    }

    if (isDemoAuthEnabled()) {
      const demo = findDemoUser(normalized, password)
      if (!demo) {
        throw new Error('Akun tidak ditemukan. Gunakan akun sekolah yang terdaftar.')
      }
      return loginLocalUser(demo)
    }

    throw new Error('Login production belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Vercel.')
  }

  function changeTeacherPassword(currentPassword, nextPassword) {
    if (!user || user.role !== 'guru') {
      throw new Error('Perubahan password hanya tersedia untuk akun guru.')
    }

    const teacher = findTeacherByNip(user.nip)
    const teacherNip = normalizeTeacherCredential(teacher?.nip || user.nip)
    if (!teacherNip) {
      throw new Error('NIP guru belum terdaftar. Hubungi admin untuk melengkapi data guru.')
    }

    if (!isTeacherPasswordValid(teacherNip, currentPassword)) {
      throw new Error('Password saat ini belum sesuai.')
    }

    const cleanPassword = normalizeTeacherPassword(nextPassword)
    if (cleanPassword.length < 6) {
      throw new Error('Password baru minimal 6 karakter.')
    }

    setStoredTeacherPassword(teacherNip, cleanPassword)
    const updatedUser = {
      ...user,
      passwordChangedAt: new Date().toISOString(),
    }

    if (!session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))
    }

    setUser(updatedUser)
    return true
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
    changeTeacherPassword,
    logout,
    supabaseEnabled: isSupabaseConfigured(),
    demoAuthEnabled: isDemoAuthEnabled(),
  }), [user, loading, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function findDemoUser(identifier, password = '') {
  const teacherUser = findTeacherByNipCredentials(identifier, password)
  if (teacherUser) return teacherUser

  return Object.values(LOCAL_PREVIEW_USERS).find((item) => (
    item.email.toLowerCase() === identifier
    || item.name.toLowerCase() === identifier
    || item.role.toLowerCase() === identifier
  ))
}

function findTeacherByNipCredentials(identifier, password) {
  const username = normalizeTeacherCredential(identifier)
  const teacher = findTeacherByNip(username)
  if (!teacher) return null
  if (!isTeacherPasswordValid(teacher.nip || username, password)) return null

  const name = teacher.name || 'Guru'
  return {
    id: teacher.id || `teacher-${username}`,
    name,
    email: teacher.email || `${username}@guru.local.preview`,
    role: 'guru',
    avatar: getInitials(name),
    nip: teacher.nip || username,
    subject: teacher.subject || '',
  }
}

function normalizeTeacherCredential(value) {
  return String(value || '').trim().replace(/\s+/g, '')
}

function normalizeTeacherPassword(value) {
  return String(value || '').trim()
}

function getTeacherRows() {
  return getLocalAdminProfiles('guru', teachers.map((teacher) => ({ ...teacher, role: 'guru' })))
}

function findTeacherByNip(nip) {
  const normalizedNip = normalizeTeacherCredential(nip)
  if (!normalizedNip) return null

  return getTeacherRows().find((item) => (
    normalizeTeacherCredential(item.nip || item.username || item.id) === normalizedNip
  )) || null
}

function isTeacherPasswordValid(nip, password) {
  const normalizedNip = normalizeTeacherCredential(nip)
  const passwordValue = normalizeTeacherPassword(password)
  if (!normalizedNip || !passwordValue) return false

  const storedPassword = getStoredTeacherPassword(normalizedNip)
  return storedPassword ? passwordValue === storedPassword : passwordValue === normalizedNip
}

function getTeacherPasswordMap() {
  const rows = safeReadLocalJson(TEACHER_PASSWORD_STORAGE_KEY, {})
  return rows && typeof rows === 'object' && !Array.isArray(rows) ? rows : {}
}

function getStoredTeacherPassword(nip) {
  const normalizedNip = normalizeTeacherCredential(nip)
  return getTeacherPasswordMap()[normalizedNip] || ''
}

function setStoredTeacherPassword(nip, password) {
  const normalizedNip = normalizeTeacherCredential(nip)
  if (!normalizedNip) return false

  const rows = getTeacherPasswordMap()
  rows[normalizedNip] = normalizeTeacherPassword(password)
  return safeWriteLocalJson(TEACHER_PASSWORD_STORAGE_KEY, rows)
}

function getInitials(name) {
  return String(name || 'G')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function purgeLegacyDemoStorage() {
  if (typeof localStorage === 'undefined') return

  migrateLegacyStorageKey(STORAGE_KEY, LEGACY_AUTH_STORAGE_KEY)
  migrateLegacyStorageKey(SUPABASE_SESSION_KEY, LEGACY_SUPABASE_SESSION_STORAGE_KEY)
  migrateLegacyStoragePrefixes()

  if (localStorage.getItem(LEGACY_DEMO_PURGE_KEY)) return

  try {
    Object.keys(localStorage)
      .filter((key) => LEGACY_DEMO_KEYS.includes(key) || LEGACY_DEMO_PREFIXES.some((prefix) => key.startsWith(prefix)))
      .forEach((key) => localStorage.removeItem(key))
    localStorage.setItem(LEGACY_DEMO_PURGE_KEY, 'true')
  } catch (error) {
    // Storage cleanup is best-effort; auth restoration should not fail because of it.
  }
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

function toAppUser(authUser, profile) {
  const fallbackDemo = isDemoAuthEnabled()
    ? Object.values(LOCAL_PREVIEW_USERS).find((item) => item.email === authUser.email)
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
    nip: fallbackDemo?.nip || profile?.nip,
    subject: fallbackDemo?.subject || profile?.subject,
  }
}
