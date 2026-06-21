import { createRow, deleteRow, listRows, updateRow } from './supabaseClient.js'

const ASSIGNMENT_SELECT = '*,subjects(id,name,code),classes(id,name),users_profile(id,name)'
const ASSIGNMENT_META_MARKER = 'ISLELEARN_ASSIGNMENT_META:'

export async function fetchAssignments({ accessToken, teacherId, publishedOnly = false } = {}) {
  const filters = {}
  if (teacherId) filters.teacher_id = teacherId
  if (publishedOnly) filters.status = 'Aktif'

  const rows = await listRows('assignments', {
    select: ASSIGNMENT_SELECT,
    filters,
    accessToken,
  })

  return rows.map(toAssignmentItem)
}

export async function saveAssignment({ accessToken, teacherId, assignment }) {
  const payload = {
    title: assignment.title,
    description: withAssignmentMetadata(assignment.description, assignment),
    subject_id: assignment.subjectId || assignment.subject_id || null,
    class_id: assignment.classId || assignment.class_id || null,
    teacher_id: teacherId || null,
    deadline: assignment.deadline || null,
    status: assignment.status || 'Draft',
  }
  const rows = assignment.id
    ? await updateRow('assignments', assignment.id, payload, accessToken)
    : await createRow('assignments', payload, accessToken)

  return toAssignmentItem(rows[0])
}

export async function removeAssignment({ accessToken, id }) {
  await deleteRow('assignments', id, accessToken)
}

export async function createAssignmentSubmission({ accessToken, assignmentId, studentId, answerText }) {
  if (!studentId) {
    throw new Error('Data siswa belum lengkap untuk mengirim tugas.')
  }

  const rows = await createRow('submissions', {
    assignment_id: assignmentId,
    student_id: studentId,
    answer_text: answerText,
    submitted_at: new Date().toISOString(),
  }, accessToken)

  return rows[0]
}

export async function fetchAssignmentSubmissions({ accessToken, assignmentId } = {}) {
  const filters = {}
  if (assignmentId) filters.assignment_id = assignmentId
  return listRows('submissions', {
    select: '*',
    filters,
    accessToken,
  })
}

function toAssignmentItem(row) {
  const metadata = parseAssignmentMetadata(row.description)
  const cleanDescription = getAssignmentBodyDescription(row.description)
  return {
    id: row.id,
    title: row.title,
    description: cleanDescription || 'Tugas singkat dengan instruksi jelas.',
    subjectId: metadata.subjectId || row.subject_id,
    classId: metadata.classId || row.class_id,
    teacherId: row.teacher_id,
    subject: metadata.subject || row.subjects?.name || 'Mata pelajaran',
    classIds: metadata.classIds || (row.class_id ? [row.class_id] : []),
    classNames: metadata.classNames || (row.classes?.name ? [row.classes.name] : []),
    className: metadata.className || row.classes?.name || 'Semua kelas',
    teacher: row.users_profile?.name || 'Guru',
    releaseAt: metadata.releaseAt || '',
    deadline: metadata.deadline || row.deadline || '',
    latePolicy: metadata.latePolicy || 'allow-late',
    submissionTypes: metadata.submissionTypes || ['text'],
    maxScore: Number(metadata.maxScore || 100),
    gradeWeight: Number(metadata.gradeWeight || 0),
    rubricRows: metadata.rubricRows || [],
    rubric: metadata.rubric || '',
    workMode: metadata.workMode || 'Individu',
    attachments: metadata.attachments || [],
    status: row.status || 'Draft',
    submitted: 0,
    source: 'supabase',
  }
}

function getAssignmentMetadata(assignment = {}) {
  return {
    subjectId: assignment.subjectId || assignment.subject_id || '',
    classId: assignment.classId || assignment.class_id || '',
    subject: assignment.subject || '',
    classIds: Array.isArray(assignment.classIds) ? assignment.classIds : [],
    classNames: Array.isArray(assignment.classNames) ? assignment.classNames : [],
    className: assignment.className || '',
    releaseAt: assignment.releaseAt || assignment.release_at || '',
    deadline: assignment.deadline || '',
    latePolicy: assignment.latePolicy || 'allow-late',
    submissionTypes: Array.isArray(assignment.submissionTypes) ? assignment.submissionTypes : ['text'],
    maxScore: Number(assignment.maxScore || 100),
    gradeWeight: Number(assignment.gradeWeight || 0),
    rubricRows: Array.isArray(assignment.rubricRows) ? assignment.rubricRows : [],
    rubric: assignment.rubric || '',
    workMode: assignment.workMode || 'Individu',
    attachments: Array.isArray(assignment.attachments) ? assignment.attachments : [],
  }
}

function stripAssignmentMetadata(description = '') {
  return String(description || '').replace(new RegExp(`\\n?<!--\\s*${ASSIGNMENT_META_MARKER}[^>]*-->\\s*$`), '').trim()
}

function getAssignmentBodyDescription(description = '') {
  const cleanDescription = stripAssignmentMetadata(description)
  return cleanDescription.split('\n\n--- Pengaturan Tugas IsleLearn ---')[0]?.trim() || cleanDescription
}

function withAssignmentMetadata(description = '', assignment = {}) {
  const cleanDescription = stripAssignmentMetadata(description)
  const metadata = encodeURIComponent(JSON.stringify(getAssignmentMetadata(assignment)))
  return `${cleanDescription}\n\n<!-- ${ASSIGNMENT_META_MARKER}${metadata} -->`
}

function parseAssignmentMetadata(description = '') {
  const match = String(description || '').match(new RegExp(`<!--\\s*${ASSIGNMENT_META_MARKER}([^>]*)-->\\s*$`))
  if (!match) return {}
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1].trim()))
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}
