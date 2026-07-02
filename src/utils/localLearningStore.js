export function readLocalRowsByPrefix(prefix) {
  if (typeof localStorage === 'undefined') return []

  try {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(prefix))
      .flatMap((key) => {
        const rows = safeReadLocalJson(key, [])
        return Array.isArray(rows) ? rows : []
      })
      .filter((row) => !isLegacyDemoRow(row))
  } catch (error) {
    return []
  }
}

export function isLegacyDemoRow(row) {
  return /^(material|question|assignment|quiz)-\d+$/.test(row?.id || '')
}

export function safeReadLocalJson(key, fallback = null) {
  if (typeof localStorage === 'undefined') return fallback

  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback

    const parsed = JSON.parse(raw)

    if (Array.isArray(fallback)) {
      return Array.isArray(parsed) ? parsed : fallback
    }

    if (fallback && typeof fallback === 'object') {
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback
    }

    return parsed ?? fallback
  } catch (error) {
    return fallback
  }
}

export function safeWriteLocalJson(key, value) {
  if (typeof localStorage === 'undefined') return false

  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    return false
  }
}

export function getCompletedMaterials(userId) {
  return safeReadLocalJson(`islelearn-material-progress-${userId || 'demo'}`, [])
}

export function setCompletedMaterials(userId, ids) {
  safeWriteLocalJson(`islelearn-material-progress-${userId || 'demo'}`, Array.isArray(ids) ? ids : [])
}

export function getStoredResultsByPrefix(prefix) {
  if (typeof localStorage === 'undefined') return []

  try {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(prefix))
      .map((key) => {
        const item = safeReadLocalJson(key, null)
        return item && typeof item === 'object' ? item : null
      })
      .filter((item) => item && typeof item.score === 'number')
  } catch (error) {
    return []
  }
}

export function getQuizResult(quizId, userId) {
  return safeReadLocalJson(`islelearn-quiz-result-${userId || 'demo'}-${quizId}`, null)
}

export function saveQuizResult(quizId, userId, result) {
  safeWriteLocalJson(`islelearn-quiz-result-${userId || 'demo'}-${quizId}`, result || {})
}

export function getLocalAssignmentSubmissions(assignmentId) {
  return safeReadLocalJson(assignmentSubmissionStorageKey(assignmentId), [])
}

export function getLocalAssignmentSubmission(assignmentId, userId) {
  return getLocalAssignmentSubmissions(assignmentId).find((item) => item.userId === (userId || 'demo')) || null
}

export function saveLocalAssignmentSubmission(assignmentId, submission) {
  const rows = getLocalAssignmentSubmissions(assignmentId)
  const nextRows = rows.some((item) => item.userId === submission.userId)
    ? rows.map((item) => item.userId === submission.userId ? submission : item)
    : [submission, ...rows]

  safeWriteLocalJson(assignmentSubmissionStorageKey(assignmentId), nextRows)
  return nextRows
}

export function getLocalTeacherQuestions(user, teacherSubject) {
  const rows = safeReadLocalJson(teacherStorageKey('questions', user, teacherSubject), null)
  return Array.isArray(rows) ? rows.filter((row) => !isLegacyDemoRow(row)) : []
}

export function setLocalTeacherQuestions(user, teacherSubject, rows) {
  safeWriteLocalJson(teacherStorageKey('questions', user, teacherSubject), Array.isArray(rows) ? rows : [])
}

export function getLocalTeacherAssignments(user, teacherSubject) {
  const rows = safeReadLocalJson(teacherStorageKey('assignments', user, teacherSubject), null)
  return Array.isArray(rows) ? rows.filter((row) => !isLegacyDemoRow(row)) : []
}

export function setLocalTeacherAssignments(user, teacherSubject, rows) {
  safeWriteLocalJson(teacherStorageKey('assignments', user, teacherSubject), Array.isArray(rows) ? rows : [])
}

export function getLocalTeacherQuizzes(user, teacherSubject) {
  const rows = safeReadLocalJson(teacherStorageKey('quizzes', user, teacherSubject), null)
  return Array.isArray(rows) ? rows.filter((row) => !isLegacyDemoRow(row)) : []
}

export function setLocalTeacherQuizzes(user, teacherSubject, rows) {
  safeWriteLocalJson(teacherStorageKey('quizzes', user, teacherSubject), Array.isArray(rows) ? rows : [])
}

export function getLocalAdminProfiles(role, fallbackRows) {
  const safeFallbackRows = Array.isArray(fallbackRows) ? fallbackRows : []
  const key = `islelearn-admin-profiles-${role}`
  const storedRows = safeReadLocalJson(key, null)

  if (Array.isArray(storedRows)) {
    if (!storedRows.length && safeFallbackRows.length) {
      safeWriteLocalJson(key, safeFallbackRows)
      return safeFallbackRows
    }

    const storedIds = new Set(storedRows.map((row) => row?.id).filter(Boolean))
    const missingFallbackRows = safeFallbackRows.filter((row) => row?.id && !storedIds.has(row.id))
    if (missingFallbackRows.length) {
      const mergedRows = [...storedRows, ...missingFallbackRows]
      safeWriteLocalJson(key, mergedRows)
      return mergedRows
    }

    return storedRows
  }

  safeWriteLocalJson(key, safeFallbackRows)
  return safeFallbackRows
}

export function setLocalAdminProfiles(role, rows) {
  safeWriteLocalJson(`islelearn-admin-profiles-${role}`, Array.isArray(rows) ? rows : [])
}

export function getLocalAdminCollection(collection, fallbackRows) {
  const safeFallbackRows = Array.isArray(fallbackRows) ? fallbackRows : []
  const key = `islelearn-admin-${collection}`
  const storedRows = safeReadLocalJson(key, null)

  if (Array.isArray(storedRows)) {
    if (collection === 'subjects' && safeFallbackRows.length) {
      const storedByName = new Map()
      storedRows.forEach((row) => {
        const nameKey = normalizeCollectionName(row?.name || row?.subject)
        if (nameKey && !storedByName.has(nameKey)) storedByName.set(nameKey, row)
      })
      const canonicalRows = safeFallbackRows.map((fallbackRow) => ({
        ...(storedByName.get(normalizeCollectionName(fallbackRow?.name)) || {}),
        ...fallbackRow,
      }))
      safeWriteLocalJson(key, canonicalRows)
      return canonicalRows
    }

    if (!storedRows.length && safeFallbackRows.length) {
      safeWriteLocalJson(key, safeFallbackRows)
      return safeFallbackRows
    }

    const storedIds = new Set(storedRows.map((row) => row?.id).filter(Boolean))
    const missingFallbackRows = safeFallbackRows.filter((row) => row?.id && !storedIds.has(row.id))
    if (missingFallbackRows.length) {
      const mergedRows = [...storedRows, ...missingFallbackRows]
      safeWriteLocalJson(key, mergedRows)
      return mergedRows
    }

    return storedRows
  }

  safeWriteLocalJson(key, safeFallbackRows)
  return safeFallbackRows
}

export function setLocalAdminCollection(collection, rows) {
  safeWriteLocalJson(`islelearn-admin-${collection}`, Array.isArray(rows) ? rows : [])
}

function assignmentSubmissionStorageKey(assignmentId) {
  return `islelearn-assignment-submissions-${assignmentId || 'unknown'}`
}

function teacherStorageKey(collection, user, teacherSubject) {
  return `islelearn-teacher-${collection}-${user?.id || teacherSubject || 'demo'}`
}

function normalizeCollectionName(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
}
