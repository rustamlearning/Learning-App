import { safeReadLocalJson, safeWriteLocalJson } from './localLearningStore.js'

export const HOMEROOM_ASSIGNMENTS_KEY = 'islelearn-homeroom-assignments'

const CURRENT_CLASS_NAMES = Object.freeze({
  'X.1': 'X Aisyah Binti Abu Bakar',
  'X 1': 'X Aisyah Binti Abu Bakar',
  'X.2': 'X Khadijah Binti Khuwailid',
  'X 2': 'X Khadijah Binti Khuwailid',
  'XI.1': 'XI Utsman Bin Affan',
  'XI 1': 'XI Utsman Bin Affan',
  'XI.2': 'XI Ali Bin Abi Thalib',
  'XI 2': 'XI Ali Bin Abi Thalib',
  'XII.1': 'XII Abu Bakar As Siddiq',
  'XII 1': 'XII Abu Bakar As Siddiq',
  'XII.2': 'XII Umar Bin Khattab',
  'XII 2': 'XII Umar Bin Khattab',
  'X Pangeran Diponegoro': 'XI Utsman Bin Affan',
  'X Soeharto': 'XI Ali Bin Abi Thalib',
  'XI Jenderal Sudirman': 'XII Abu Bakar As Siddiq',
  'XI B.J. Habibie': 'XII Umar Bin Khattab',
  'XI Pangeran Diponegoro': 'XI Utsman Bin Affan',
  'XI Soeharto': 'XI Ali Bin Abi Thalib',
  'XII Jenderal Sudirman': 'XII Abu Bakar As Siddiq',
  'XII Abu Bakar Ash Siddiq': 'XII Abu Bakar As Siddiq',
  'XII B.J. Habibie': 'XII Umar Bin Khattab',
})

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
  return CURRENT_CLASS_NAMES[normalizedClass] || normalizedClass
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
