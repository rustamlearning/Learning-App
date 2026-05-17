export const APP_STORAGE_PREFIX = 'islelearn'
export const LEGACY_STORAGE_PREFIX = 'sea-learning'

export const AUTH_STORAGE_KEY = appStorageKey('auth')
export const LEGACY_AUTH_STORAGE_KEY = legacyStorageKey('auth')
export const SUPABASE_SESSION_STORAGE_KEY = appStorageKey('supabase-session')
export const LEGACY_SUPABASE_SESSION_STORAGE_KEY = legacyStorageKey('supabase-session')
export const LEGACY_DEMO_PURGE_STORAGE_KEY = appStorageKey('legacy-demo-purged-v3')

export const STORAGE_SUFFIX = {
  teacherMaterials: 'teacher-materials-',
  teacherQuestions: 'teacher-questions-',
  teacherAssignments: 'teacher-assignments-',
  teacherQuizzes: 'teacher-quizzes-',
  materialProgress: 'material-progress-',
  quizResult: 'quiz-result-',
  practiceResult: 'practice-result-',
  assignmentSubmissions: 'assignment-submissions-',
  adminProfiles: 'admin-profiles-',
  adminCollection: 'admin-',
}

export function appStorageKey(suffix) {
  return `${APP_STORAGE_PREFIX}-${suffix}`
}

export function legacyStorageKey(suffix) {
  return `${LEGACY_STORAGE_PREFIX}-${suffix}`
}

export function storagePrefixAliases(suffix) {
  return [appStorageKey(suffix), legacyStorageKey(suffix)]
}

export function migrateLegacyStorageKey(newKey, legacyKey) {
  if (typeof localStorage === 'undefined' || !legacyKey || legacyKey === newKey) return newKey

  try {
    const hasNewValue = localStorage.getItem(newKey) !== null
    const legacyValue = localStorage.getItem(legacyKey)

    if (!hasNewValue && legacyValue !== null) {
      localStorage.setItem(newKey, legacyValue)
    }
  } catch (error) {
    // Storage migration is best-effort and must never block the app.
  }

  return newKey
}

export function migrateLegacyStoragePrefixes(suffixes = Object.values(STORAGE_SUFFIX)) {
  if (typeof localStorage === 'undefined') return

  try {
    suffixes.forEach((suffix) => {
      const nextPrefix = appStorageKey(suffix)
      const legacyPrefix = legacyStorageKey(suffix)

      Object.keys(localStorage)
        .filter((key) => key.startsWith(legacyPrefix))
        .forEach((legacyKey) => {
          const nextKey = `${nextPrefix}${legacyKey.slice(legacyPrefix.length)}`
          migrateLegacyStorageKey(nextKey, legacyKey)
        })
    })
  } catch (error) {
    // Ignore migration failures; local storage may be unavailable in some modes.
  }
}
