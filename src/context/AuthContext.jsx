import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  getCurrentAuthUser,
  getLoginEmailsByIdentifier,
  getProfileByAuthUserId,
  isSupabaseConfigured,
  normalizeLoginIdentifier,
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
import { students, teachers } from '../data/dummyData.js'
import {
  getLocalAdminProfiles,
  safeReadLocalJson,
  safeWriteLocalJson,
  subscribeToSharedSchoolDataChanges,
} from '../utils/localLearningStore.js'
import { isPersistedLocalSchoolUser } from '../utils/authSession.js'

const AuthContext = createContext(null)
const STORAGE_KEY = AUTH_STORAGE_KEY
const SUPABASE_SESSION_KEY = SUPABASE_SESSION_STORAGE_KEY
const LEGACY_DEMO_PURGE_KEY = LEGACY_DEMO_PURGE_STORAGE_KEY
const LEGACY_DEMO_KEYS = [LEGACY_AUTH_STORAGE_KEY, LEGACY_SUPABASE_SESSION_STORAGE_KEY]
const LEGACY_DEMO_PREFIXES = Object.values(STORAGE_SUFFIX).map((suffix) => legacyStorageKey(suffix))
const TEACHER_PASSWORD_STORAGE_KEY = 'islelearn-teacher-passwords-v1'
const LOCAL_PREVIEW_USERS = {
  siswa: {
    id: 'local-preview-siswa',
    name: 'Siswa',
    email: 'siswa@local.preview',
    role: 'siswa',
    avatar: 'S',
    className: 'XI Utsman Bin Affan',
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
const DEFAULT_LOGIN_EMAILS = {
  admin: 'admin@islelearn.local',
  guru: 'guru@islelearn.local',
  siswa: 'siswa@islelearn.local',
  pimpinan: 'pimpinan@islelearn.local',
}
const PRIMARY_TEACHER_NIP = '198503112011011007'

function isDemoAuthEnabled() {
  return import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true'
}

function isRemoteDataEnabled() {
  return import.meta.env.VITE_REMOTE_DATA_ENABLED === 'true'
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
            const authUser = await getCurrentAuthUser(storedSession.access_token)
            const profile = await getProfileByAuthUserId(authUser.id, storedSession.access_token)

            if (!profile && !isDemoAuthEnabled()) {
              throw new Error('Profil pengguna belum terdaftar di database sekolah.')
            }

            if (active) {
              setSession(storedSession)
              setUser(hydrateUserFromSharedSchoolData(toAppUser(authUser, profile)))
            }

            return
          }
        }

        const restoredLocalUser = getPersistedLocalUser()

        if (restoredLocalUser && active) {
          setUser(hydrateUserFromSharedSchoolData(restoredLocalUser))
        } else if (!restoredLocalUser) {
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch (error) {
        localStorage.removeItem(SUPABASE_SESSION_KEY)

        const restoredLocalUser = getPersistedLocalUser()
        if (restoredLocalUser && active) {
          setUser(hydrateUserFromSharedSchoolData(restoredLocalUser))
        } else if (!restoredLocalUser) {
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

  useEffect(() => subscribeToSharedSchoolDataChanges(() => {
    setUser((currentUser) => {
      const nextUser = hydrateUserFromSharedSchoolData(currentUser)
      if (!nextUser || nextUser === currentUser) return currentUser

      if (!localStorage.getItem(SUPABASE_SESSION_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
      }

      return nextUser
    })
  }), [])

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
    const hydratedUser = hydrateUserFromSharedSchoolData(appUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hydratedUser))
    localStorage.removeItem(SUPABASE_SESSION_KEY)
    setSession(null)
    setUser(hydratedUser)
    return hydratedUser
  }

  async function loginWithEmail(identifier, password) {
    const normalized = normalizeLoginIdentifier(identifier)
    const teacherByNip = findTeacherByNip(identifier)
    const localTeacherByNip = findTeacherByNipCredentials(identifier, password)
    const preferRemoteAuth = isSupabaseConfigured() && isRemoteDataEnabled()

    if (localTeacherByNip && !preferRemoteAuth) {
      return loginLocalUser(localTeacherByNip)
    }

    if (isSupabaseConfigured()) {
      try {
        const authEmails = await getRemoteLoginEmailCandidates(normalized, teacherByNip)
        const supabaseSession = await signInWithFirstWorkingEmail(authEmails, password)
        const profile = await getProfileByAuthUserId(supabaseSession.user.id, supabaseSession.access_token)

        if (!profile && !isDemoAuthEnabled()) {
          throw new Error('Akun berhasil login, tetapi profil sekolah belum dibuat. Hubungi admin sekolah.')
        }

        const appUser = hydrateUserFromSharedSchoolData(toAppUser(supabaseSession.user, profile))
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
    accessToken: isRemoteDataEnabled() ? session?.access_token : null,
    loginAs,
    loginWithEmail,
    changeTeacherPassword,
    logout,
    supabaseEnabled: isSupabaseConfigured(),
    remoteDataEnabled: isRemoteDataEnabled(),
    demoAuthEnabled: isDemoAuthEnabled(),
  }), [user, loading, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

async function getRemoteLoginEmailCandidates(identifier, teacherByNip) {
  const candidates = []

  try {
    candidates.push(...await getLoginEmailsByIdentifier(identifier))
  } catch (error) {
    if (!teacherByNip) throw error
  }

  candidates.push(DEFAULT_LOGIN_EMAILS[identifier])

  if (teacherByNip) {
    candidates.push(getTeacherAuthEmail(teacherByNip))
    candidates.push(DEFAULT_LOGIN_EMAILS.guru)
  }

  if (identifier.includes('@')) {
    candidates.push(identifier)
  }

  return uniqueLoginCandidates(candidates)
}

function getTeacherAuthEmail(teacher) {
  const nip = normalizeTeacherCredential(teacher?.nip || teacher?.username || teacher?.id)
  if (!nip) return teacher?.email || ''
  return teacher?.email || (nip === PRIMARY_TEACHER_NIP ? DEFAULT_LOGIN_EMAILS.guru : `guru.${nip}@islelearn.local`)
}

async function signInWithFirstWorkingEmail(authEmails, password) {
  let lastError = null

  for (const authEmail of authEmails) {
    try {
      return await signInWithPassword(authEmail, password)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('Login gagal. Periksa username dan password.')
}

function uniqueLoginCandidates(candidates) {
  const seen = new Set()
  return candidates
    .map((candidate) => String(candidate || '').trim().toLowerCase())
    .filter((candidate) => {
      if (!candidate || !candidate.includes('@') || seen.has(candidate)) return false
      seen.add(candidate)
      return true
    })
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

function getStudentRows() {
  return getLocalAdminProfiles('siswa', students.map((student) => ({ ...student, role: 'siswa' })))
}

function getPersistedLocalUser() {
  const rawUser = localStorage.getItem(STORAGE_KEY)
  if (!rawUser) return null

  try {
    const storedUser = JSON.parse(rawUser)
    if (isDemoAuthEnabled()) return storedUser
    return isPersistedLocalSchoolUser(storedUser, getTeacherRows()) ? storedUser : null
  } catch (error) {
    return null
  }
}

function hydrateUserFromSharedSchoolData(user) {
  if (!user || !['guru', 'siswa'].includes(user.role)) return user

  const rows = user.role === 'guru' ? getTeacherRows() : getStudentRows()
  const profile = rows.find((row) => sharedProfileMatchesUser(row, user))
  if (!profile) return user

  const name = profile.name || profile.fullName || user.name
  const nextUser = {
    ...user,
    name,
    avatar: getInitials(name),
    ...(profile.email ? { email: profile.email } : {}),
    ...(profile.status ? { status: profile.status } : {}),
  }

  if (user.role === 'guru') {
    nextUser.nip = profile.nip || profile.username || user.nip
    nextUser.subject = profile.subject || profile.subjectNames?.join('; ') || user.subject || ''
    nextUser.subjectNames = Array.isArray(profile.subjectNames) ? profile.subjectNames : user.subjectNames
    nextUser.subjectIds = Array.isArray(profile.subjectIds) ? profile.subjectIds : user.subjectIds
  } else {
    nextUser.nis = profile.nis || user.nis
    nextUser.className = profile.className || profile.class || profile.class_name || user.className
  }

  return JSON.stringify(nextUser) === JSON.stringify(user) ? user : nextUser
}

function sharedProfileMatchesUser(profile, user) {
  const profileKeys = [profile?.id, profile?.authUserId, profile?.auth_user_id, profile?.email, profile?.nip, profile?.nis, profile?.name, profile?.fullName]
    .map(normalizeSharedProfileKey)
    .filter(Boolean)
  const userKeys = new Set([user?.id, user?.authUserId, user?.email, user?.nip, user?.nis, user?.name]
    .map(normalizeSharedProfileKey)
    .filter(Boolean))

  return profileKeys.some((key) => userKeys.has(key))
}

function normalizeSharedProfileKey(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
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
