import { createRow, deleteRow, listRows, updateRow } from './supabaseClient.js'

const MATERIAL_SELECT = '*,subjects(id,name,code),classes(id,name),users_profile(id,name),learning_objectives(id,code,objective,grade,semester)'

export async function fetchMaterials({ accessToken, teacherId, publishedOnly = false } = {}) {
  const filters = {}
  if (teacherId) filters.teacher_id = teacherId
  if (publishedOnly) filters.status = 'Publish'

  const rows = await listRows('materials', {
    select: MATERIAL_SELECT,
    filters,
    accessToken,
  })

  return rows.map(toMaterialItem)
}

export async function fetchMaterialLookups({ accessToken } = {}) {
  const [subjectRows, classRows] = await Promise.all([
    listRows('subjects', { select: 'id,name,code', accessToken }),
    listRows('classes', { select: 'id,name,grade', accessToken }),
  ])

  return {
    subjects: subjectRows,
    classes: classRows,
  }
}

export async function saveMaterial({ accessToken, teacherId, material }) {
  const payload = toMaterialPayload(material, teacherId)
  const rows = material.id
    ? await updateRow('materials', material.id, payload, accessToken)
    : await createRow('materials', payload, accessToken)

  return toMaterialItem(rows[0])
}

export async function removeMaterial({ accessToken, id }) {
  await deleteRow('materials', id, accessToken)
}

export async function fetchStudentMaterialProgress({ accessToken, profileId }) {
  const studentRows = await listRows('students', {
    select: 'id,user_id',
    filters: { user_id: profileId },
    accessToken,
  })
  const student = studentRows[0]
  if (!student) return { student: null, completedIds: [] }

  const progressRows = await listRows('progress', {
    select: 'id,student_id,material_id,status,completed_at',
    filters: { student_id: student.id },
    accessToken,
  })

  return {
    student,
    completedIds: progressRows.filter((item) => item.status === 'Selesai').map((item) => item.material_id),
  }
}

export async function markMaterialCompleted({ accessToken, profileId, materialId }) {
  const { student } = await fetchStudentMaterialProgress({ accessToken, profileId })
  if (!student) throw new Error('Data siswa belum terhubung ke profile.')

  const existing = await listRows('progress', {
    select: 'id,student_id,material_id,status',
    filters: { student_id: student.id, material_id: materialId },
    accessToken,
  })
  const payload = {
    student_id: student.id,
    material_id: materialId,
    status: 'Selesai',
    completed_at: new Date().toISOString(),
  }

  const rows = existing[0]
    ? await updateRow('progress', existing[0].id, payload, accessToken)
    : await createRow('progress', payload, accessToken)

  return rows[0]
}

function toMaterialPayload(material, teacherId) {
  return {
    title: material.title,
    description: material.description,
    content: material.content,
    subject_id: material.subjectId || null,
    class_id: material.classId || null,
    teacher_id: teacherId || null,
    learning_objective_id: material.learningObjectiveId || material.learning_objective_id || null,
    status: material.status,
    topic: material.topic,
    type: material.type,
    updated_at: new Date().toISOString(),
  }
}

function toMaterialItem(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || 'Materi ringan dibuka untuk jaringan kepulauan.',
    content: row.content || 'Konten materi belum diisi.',
    subjectId: row.subject_id,
    classId: row.class_id,
    teacherId: row.teacher_id,
    learningObjectiveId: row.learning_objective_id || '',
    learningObjectiveCode: row.learning_objectives?.code || '',
    learningObjectiveText: row.learning_objectives?.objective || '',
    subject: row.subjects?.name || 'Mata pelajaran',
    className: row.classes?.name || 'Semua kelas',
    teacher: row.users_profile?.name || 'Guru',
    topic: row.topic || 'Topik umum',
    status: row.status || 'Draft',
    type: row.type || 'Teks',
    progress: row.status === 'Publish' ? 35 : 0,
    lightweight: true,
    source: 'supabase',
  }
}
