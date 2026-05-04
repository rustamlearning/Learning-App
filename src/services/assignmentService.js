import { createRow, deleteRow, listRows, updateRow } from './supabaseClient.js'

const ASSIGNMENT_SELECT = '*,subjects(id,name,code),classes(id,name),users_profile(id,name),learning_objectives(id,code,objective,grade,semester)'

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
    description: assignment.description,
    subject_id: assignment.subjectId || assignment.subject_id || null,
    class_id: assignment.classId || assignment.class_id || null,
    teacher_id: teacherId || null,
    learning_objective_id: assignment.learningObjectiveId || assignment.learning_objective_id || null,
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
  const rows = await createRow('submissions', {
    assignment_id: assignmentId,
    student_id: studentId || null,
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
  return {
    id: row.id,
    title: row.title,
    description: row.description || 'Tugas singkat dengan instruksi jelas.',
    subjectId: row.subject_id,
    classId: row.class_id,
    teacherId: row.teacher_id,
    learningObjectiveId: row.learning_objective_id || '',
    learningObjectiveCode: row.learning_objectives?.code || '',
    learningObjectiveText: row.learning_objectives?.objective || '',
    subject: row.subjects?.name || 'Mata pelajaran',
    className: row.classes?.name || 'Semua kelas',
    teacher: row.users_profile?.name || 'Guru',
    deadline: row.deadline ? row.deadline.slice(0, 10) : '',
    status: row.status || 'Draft',
    submitted: 0,
    source: 'supabase',
  }
}
