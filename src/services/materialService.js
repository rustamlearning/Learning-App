import { createRow, deleteRow, listRows, updateRow } from './supabaseClient.js'

const MATERIAL_SELECT = '*,subjects(id,name,code),classes(id,name),users_profile(id,name)'

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

function toMaterialPayload(material, teacherId) {
  return {
    title: material.title,
    description: material.description,
    content: material.content,
    subject_id: material.subjectId || null,
    class_id: material.classId || null,
    teacher_id: teacherId || null,
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
