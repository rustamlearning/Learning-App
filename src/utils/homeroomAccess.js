import { safeReadLocalJson, safeWriteLocalJson } from './localLearningStore.js'

export const HOMEROOM_ASSIGNMENTS_KEY = 'islelearn-homeroom-assignments'

export function getHomeroomAssignments() {
  return normalizeHomeroomAssignments(safeReadLocalJson(HOMEROOM_ASSIGNMENTS_KEY, []))
}

export function setHomeroomAssignments(rows) {
  const normalizedRows = normalizeHomeroomAssignments(rows)
  safeWriteLocalJson(HOMEROOM_ASSIGNMENTS_KEY, normalizedRows)
  return normalizedRows
}

export function normalizeHomeroomAssignments(rows = []) {
  const byClass = new Map()

  ;(Array.isArray(rows) ? rows : []).forEach((row) => {
    const className = promoteHomeroomClassName(row?.className || row?.class_name || row?.name)
    if (!className) return

    const teacherId = String(row?.teacherId || row?.teacher_id || '').trim()
    const teacherNip = normalizeHomeroomCredential(row?.teacherNip || row?.teacher_nip || row?.nip)
    const teacherName = String(row?.teacherName || row?.teacher_name || row?.name || '').trim()

    byClass.set(className, {
      id: row?.id || `homeroom-${slugify(className)}`,
      className,
      teacherId,
      teacherNip,
      teacherName,
      subject: row?.subject || '',
      updatedAt: row?.updatedAt || '',
    })
  })

  return Array.from(byClass.values()).sort((a, b) => a.className.localeCompare(b.className, 'id-ID'))
}

export function getHomeroomClassesForUser(user) {
  if (!user) return []
  return getHomeroomAssignments()
    .filter((assignment) => homeroomTeacherMatchesUser(assignment, user))
    .map((assignment) => assignment.className)
}

export function getHomeroomAssignmentForUser(user, className = '') {
  const assignments = getHomeroomAssignments().filter((assignment) => homeroomTeacherMatchesUser(assignment, user))
  if (!className) return assignments[0] || null
  const normalizedClass = normalizeHomeroomText(promoteHomeroomClassName(className))
  return assignments.find((assignment) => normalizeHomeroomText(assignment.className) === normalizedClass) || null
}

export function isTeacherHomeroom(user) {
  return getHomeroomClassesForUser(user).length > 0
}

export function homeroomTeacherMatchesUser(assignment, user) {
  if (!assignment || !user) return false
  const userKeys = getUserHomeroomKeys(user)
  const teacherKeys = [
    assignment.teacherId,
    assignment.teacherNip,
    assignment.teacherName,
  ].map(normalizeHomeroomCredential).filter(Boolean)

  return teacherKeys.some((key) => userKeys.has(key))
}

export function getUserHomeroomKeys(user) {
  return new Set([
    user?.id,
    user?.authUserId,
    user?.nip,
    user?.email,
    user?.name,
  ].map(normalizeHomeroomCredential).filter(Boolean))
}

export function promoteHomeroomClassName(className = '') {
  const normalizedClass = String(className || '').trim()
  if (normalizedClass === 'X Pangeran Diponegoro') return 'XI Pangeran Diponegoro'
  if (normalizedClass === 'X Soeharto') return 'XI Soeharto'
  if (normalizedClass === 'XI Jenderal Sudirman') return 'XII Jenderal Sudirman'
  if (normalizedClass === 'XI B.J. Habibie') return 'XII B.J. Habibie'
  return normalizedClass
}

export function normalizeHomeroomCredential(value) {
  return normalizeHomeroomText(value)
}

function normalizeHomeroomText(value) {
  return String(value || '').trim().toLowerCase()
}

function slugify(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'kelas'
}
