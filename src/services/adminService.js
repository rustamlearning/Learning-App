import { createRow, deleteRow, listRows, updateRow } from './supabaseClient.js'

export async function fetchProfiles({ accessToken, role }) {
  return listRows('users_profile', {
    select: 'id,name,email,role,status,created_at',
    filters: { role },
    accessToken,
  })
}

export async function saveProfile({ accessToken, profile }) {
  const payload = {
    name: profile.name,
    email: profile.email,
    role: profile.role,
    status: profile.status || 'Aktif',
  }
  const rows = profile.id
    ? await updateRow('users_profile', profile.id, payload, accessToken)
    : await createRow('users_profile', payload, accessToken)
  return rows[0]
}

export async function removeProfile({ accessToken, id }) {
  await deleteRow('users_profile', id, accessToken)
}

export async function fetchClasses({ accessToken }) {
  return listRows('classes', {
    select: 'id,name,grade,academic_year,created_at',
    accessToken,
  })
}

export async function saveClass({ accessToken, classItem }) {
  const payload = {
    name: classItem.name,
    grade: Number(classItem.grade) || 10,
    academic_year: classItem.academicYear || classItem.academic_year || '2026/2027',
  }
  const rows = classItem.id
    ? await updateRow('classes', classItem.id, payload, accessToken)
    : await createRow('classes', payload, accessToken)
  return rows[0]
}

export async function removeClass({ accessToken, id }) {
  await deleteRow('classes', id, accessToken)
}

export async function fetchSubjects({ accessToken }) {
  return listRows('subjects', {
    select: 'id,name,code,teacher_id,users_profile(id,name)',
    accessToken,
  })
}

export async function saveSubject({ accessToken, subject }) {
  const payload = {
    name: subject.name,
    code: subject.code,
    teacher_id: subject.teacherId || subject.teacher_id || null,
  }
  const rows = subject.id
    ? await updateRow('subjects', subject.id, payload, accessToken)
    : await createRow('subjects', payload, accessToken)
  return rows[0]
}

export async function removeSubject({ accessToken, id }) {
  await deleteRow('subjects', id, accessToken)
}

export async function exportBackupData({ accessToken }) {
  const tables = [
    'users_profile',
    'classes',
    'subjects',
    'students',
    'teachers',
    'materials',
    'questions',
    'quizzes',
    'quiz_questions',
    'quiz_attempts',
    'assignments',
    'submissions',
    'progress',
    'badges',
    'student_badges',
    'announcements',
  ]

  const entries = await Promise.all(tables.map(async (table) => [table, await listRows(table, { select: '*', accessToken })]))
  return {
    exportedAt: new Date().toISOString(),
    app: 'SEA Learning',
    school: 'SMA Negeri 6 Pangkajene dan Kepulauan',
    data: Object.fromEntries(entries),
  }
}
