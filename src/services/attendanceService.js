import { createRow, deleteRow, deleteRows, listRows, updateRow } from './supabaseClient.js'

const validAttendanceStatuses = new Set(['Hadir', 'Izin', 'Sakit', 'Alpa'])
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function compactText(value) {
  return String(value || '').trim().replace(/\s+/g, ' ')
}

function normalizeScopeText(value) {
  return compactText(value).toLowerCase()
}

function normalizeAttendanceType(type) {
  return type === 'subject' ? 'subject' : 'daily'
}

function normalizeIsoDate(value) {
  const dateText = compactText(value)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return dateText
  const parsed = dateText ? new Date(dateText) : new Date()
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10)
  return parsed.toISOString().slice(0, 10)
}

function isUuid(value) {
  return uuidPattern.test(String(value || ''))
}

function normalizeUpdatedAt(value) {
  const parsed = value ? new Date(value) : new Date()
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
}

export function attendanceScopeKey(session = {}) {
  const type = normalizeAttendanceType(session.type)
  const subjectKey = type === 'subject'
    ? normalizeScopeText(session.subject || session.subjectName || session.subject_name)
    : 'wali-kelas'
  const lessonKey = type === 'subject'
    ? normalizeScopeText(session.lessonTime || session.lesson_time)
    : 'harian'

  return [
    'v1',
    type,
    normalizeIsoDate(session.date || session.attendance_date),
    normalizeScopeText(session.className || session.class_name || 'Kelas umum'),
    subjectKey,
    lessonKey,
  ].join('|')
}

function makeLocalSessionId(session = {}) {
  return `attendance-${attendanceScopeKey(session)}`
    .replace(/[^a-z0-9|]+/gi, '-')
    .replace(/\|/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

function findClassId(session, classRows = []) {
  if (isUuid(session.classId || session.class_id)) return session.classId || session.class_id
  const targetClass = normalizeScopeText(session.className || session.class_name)
  const matchedClass = classRows.find((row) => normalizeScopeText(row?.name || row?.className || row?.class_name) === targetClass)
  return isUuid(matchedClass?.id) ? matchedClass.id : null
}

function findSubjectId(session, subjectRows = []) {
  if (normalizeAttendanceType(session.type) !== 'subject') return null
  if (isUuid(session.subjectId || session.subject_id)) return session.subjectId || session.subject_id
  const targetSubject = normalizeScopeText(session.subject || session.subjectName || session.subject_name)
  const matchedSubject = subjectRows.find((row) => normalizeScopeText(row?.name || row?.subject || row?.subject_name) === targetSubject)
  return isUuid(matchedSubject?.id) ? matchedSubject.id : null
}

function normalizeRemoteAttendanceRows(rows = [], fallbackClassName = '') {
  return (Array.isArray(rows) ? rows : [])
    .map((row) => ({
      id: row.id,
      remoteId: row.id,
      studentId: row.student_id || row.student_key || '',
      name: row.student_name || 'Siswa',
      nis: row.nis || '',
      className: row.class_name || fallbackClassName || 'Kelas umum',
      status: validAttendanceStatuses.has(row.status) ? row.status : 'Hadir',
      note: row.note || '',
      rowOrder: Number(row.row_order) || 0,
      updatedAt: row.updated_at || '',
    }))
    .sort((left, right) => (
      (Number(left.rowOrder) || 0) - (Number(right.rowOrder) || 0)
      || String(left.name || '').localeCompare(String(right.name || ''), 'id-ID')
    ))
}

function normalizeRemoteAttendanceSession(row = {}) {
  const session = {
    id: row.client_session_id || makeLocalSessionId({
      type: row.type,
      date: row.attendance_date,
      className: row.class_name,
      subject: row.subject_name,
      lessonTime: row.lesson_time,
    }),
    remoteId: row.id,
    scopeKey: row.scope_key,
    type: normalizeAttendanceType(row.type),
    date: normalizeIsoDate(row.attendance_date),
    classId: row.class_id || '',
    className: row.class_name || 'Kelas umum',
    subjectId: row.subject_id || '',
    subject: row.subject_name || '',
    lessonTime: row.lesson_time || '',
    teacherName: row.teacher_name || '',
    createdBy: row.recorded_by || '',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || row.created_at || '',
    syncedAt: new Date().toISOString(),
    rows: normalizeRemoteAttendanceRows(row.attendance_rows, row.class_name),
  }

  return {
    ...session,
    scopeKey: session.scopeKey || attendanceScopeKey(session),
  }
}

function buildSessionPayload(session = {}, { user, classRows = [], subjectRows = [] } = {}) {
  const type = normalizeAttendanceType(session.type)
  const subjectName = type === 'subject'
    ? compactText(session.subject || session.subjectName || session.subject_name || '')
    : null
  const lessonTime = type === 'subject'
    ? compactText(session.lessonTime || session.lesson_time || '')
    : null
  const normalizedSession = {
    ...session,
    type,
    date: normalizeIsoDate(session.date || session.attendance_date),
    className: compactText(session.className || session.class_name || 'Kelas umum') || 'Kelas umum',
    subject: subjectName || '',
    lessonTime: lessonTime || '',
  }

  return {
    scope_key: attendanceScopeKey(normalizedSession),
    client_session_id: session.id || makeLocalSessionId(normalizedSession),
    type,
    attendance_date: normalizedSession.date,
    class_id: findClassId(normalizedSession, classRows),
    class_name: normalizedSession.className,
    subject_id: findSubjectId(normalizedSession, subjectRows),
    subject_name: subjectName || null,
    lesson_time: lessonTime || null,
    recorded_by: isUuid(user?.id || session.createdBy || session.created_by) ? (user?.id || session.createdBy || session.created_by) : null,
    teacher_name: compactText(session.teacherName || user?.name || '') || null,
    metadata: {
      source: 'islelearn-web',
      localUpdatedAt: session.updatedAt || null,
    },
    updated_at: normalizeUpdatedAt(session.updatedAt),
  }
}

function buildRowPayload(row = {}, index, sessionId) {
  const studentKey = compactText(row.studentId || row.student_id || row.id || row.name || `student-${index + 1}`)

  return {
    session_id: sessionId,
    student_id: isUuid(row.studentId || row.student_id) ? (row.studentId || row.student_id) : null,
    student_key: studentKey,
    student_name: compactText(row.name || row.studentName || row.student_name || `Siswa ${index + 1}`),
    nis: compactText(row.nis || row.studentNumber || '') || null,
    class_name: compactText(row.className || row.class_name || '') || null,
    status: validAttendanceStatuses.has(row.status) ? row.status : 'Hadir',
    note: compactText(row.note || '') || null,
    row_order: index,
    updated_at: new Date().toISOString(),
  }
}

async function findRemoteSessionByScope({ accessToken, scopeKey }) {
  const rows = await listRows('attendance_sessions', {
    select: 'id,scope_key,client_session_id,type,attendance_date,class_id,class_name,subject_id,subject_name,lesson_time,recorded_by,teacher_name,created_at,updated_at',
    filters: { scope_key: scopeKey },
    accessToken,
  })
  return rows?.[0] || null
}

async function persistSessionPayload({ accessToken, payload }) {
  const existing = await findRemoteSessionByScope({ accessToken, scopeKey: payload.scope_key })
  if (existing?.id) {
    const rows = await updateRow('attendance_sessions', existing.id, payload, accessToken)
    return rows?.[0] || { ...existing, ...payload }
  }

  try {
    const rows = await createRow('attendance_sessions', payload, accessToken)
    return rows?.[0]
  } catch (error) {
    if (error.status !== 409 && !/duplicate key/i.test(String(error.message || ''))) throw error
    const duplicate = await findRemoteSessionByScope({ accessToken, scopeKey: payload.scope_key })
    if (!duplicate?.id) throw error
    const rows = await updateRow('attendance_sessions', duplicate.id, payload, accessToken)
    return rows?.[0] || { ...duplicate, ...payload }
  }
}

async function persistAttendanceRows({ accessToken, sessionId, rows = [] }) {
  const existingRows = await listRows('attendance_rows', {
    select: 'id,student_key',
    filters: { session_id: sessionId },
    accessToken,
  })
  const existingByStudentKey = new Map((existingRows || []).map((row) => [row.student_key, row]))
  const persistedRows = []

  for (const [index, row] of rows.entries()) {
    const payload = buildRowPayload(row, index, sessionId)
    const existing = existingByStudentKey.get(payload.student_key)
    const savedRows = existing?.id
      ? await updateRow('attendance_rows', existing.id, payload, accessToken)
      : await createRow('attendance_rows', payload, accessToken)
    persistedRows.push(savedRows?.[0] || { id: existing?.id, ...payload })
  }

  return persistedRows
}

export async function fetchAttendanceSessions({ accessToken }) {
  const rows = await listRows('attendance_sessions', {
    select: '*,attendance_rows(*)',
    accessToken,
  })

  return (rows || []).map(normalizeRemoteAttendanceSession)
}

export async function saveAttendanceSession({ accessToken, session, user, classRows = [], subjectRows = [] }) {
  if (!accessToken) throw new Error('Token Supabase tidak tersedia.')
  const payload = buildSessionPayload(session, { user, classRows, subjectRows })
  const savedSession = await persistSessionPayload({ accessToken, payload })
  if (!savedSession?.id) throw new Error('Supabase belum mengembalikan ID sesi absensi.')
  const savedRows = await persistAttendanceRows({
    accessToken,
    sessionId: savedSession.id,
    rows: Array.isArray(session.rows) ? session.rows : [],
  })

  return normalizeRemoteAttendanceSession({
    ...savedSession,
    attendance_rows: savedRows,
  })
}

export async function saveAttendanceSessions({ accessToken, sessions = [], user, classRows = [], subjectRows = [] }) {
  const savedSessions = []

  for (const session of sessions) {
    savedSessions.push(await saveAttendanceSession({
      accessToken,
      session,
      user,
      classRows,
      subjectRows,
    }))
  }

  return savedSessions
}

export async function deleteAttendanceSessionFromSupabase({ accessToken, session }) {
  if (!accessToken) throw new Error('Token Supabase tidak tersedia.')
  if (session?.remoteId) {
    await deleteRow('attendance_sessions', session.remoteId, accessToken)
    return
  }

  await deleteRows('attendance_sessions', {
    scope_key: session?.scopeKey || attendanceScopeKey(session),
  }, accessToken)
}
