import { createRow, deleteRow, listRows, normalizeLoginIdentifier, updateRow } from './supabaseClient.js'

export async function fetchProfiles({ accessToken, role }) {
  return listRows('users_profile', {
    select: 'id,name,email,role,status,created_at',
    filters: { role },
    accessToken,
  })
}

export async function fetchAdminStudents({ accessToken }) {
  const [profileRows, studentRows, classRows] = await Promise.all([
    fetchProfiles({ accessToken, role: 'siswa' }),
    listRows('students', { select: 'id,user_id,nis,nisn,class_id,gender,status', accessToken }),
    fetchClasses({ accessToken }),
  ])
  const classMap = new Map(classRows.map((item) => [item.id, item]))

  return profileRows.map((profile) => {
    const detail = studentRows.find((student) => student.user_id === profile.id)
    const classItem = detail?.class_id ? classMap.get(detail.class_id) : null
    return {
      ...profile,
      studentId: detail?.id,
      nis: detail?.nis || '',
      nisn: detail?.nisn || '',
      classId: detail?.class_id || '',
      className: classItem?.name || '-',
      gender: detail?.gender || '',
      detailStatus: detail?.status || profile.status,
    }
  })
}

export async function saveAdminStudent({ accessToken, student }) {
  const profile = await saveProfile({ accessToken, profile: { ...student, role: 'siswa' } })
  const payload = {
    user_id: profile.id,
    nis: student.nis || null,
    nisn: student.nisn || null,
    class_id: student.classId || student.class_id || null,
    gender: student.gender || null,
    status: student.detailStatus || student.status || 'Aktif',
  }
  const rows = student.studentId
    ? await updateRow('students', student.studentId, payload, accessToken)
    : await createRow('students', payload, accessToken)

  return { ...profile, studentId: rows[0]?.id, ...payload }
}

export async function removeAdminStudent({ accessToken, student }) {
  if (student.studentId) await deleteRow('students', student.studentId, accessToken)
  await removeProfile({ accessToken, id: student.id })
}

export async function fetchAdminTeachers({ accessToken }) {
  const [profileRows, teacherRows, subjectRows] = await Promise.all([
    fetchProfiles({ accessToken, role: 'guru' }),
    listRows('teachers', { select: 'id,user_id,nip,subject_id,status', accessToken }),
    fetchSubjects({ accessToken }),
  ])
  const subjectMap = new Map(subjectRows.map((item) => [item.id, item]))

  return profileRows.map((profile) => {
    const detail = teacherRows.find((teacher) => teacher.user_id === profile.id)
    const subject = detail?.subject_id ? subjectMap.get(detail.subject_id) : null
    return {
      ...profile,
      teacherId: detail?.id,
      nip: detail?.nip || '',
      subjectId: detail?.subject_id || '',
      subject: subject?.name || '-',
      detailStatus: detail?.status || profile.status,
    }
  })
}

export async function saveAdminTeacher({ accessToken, teacher }) {
  const profile = await saveProfile({ accessToken, profile: { ...teacher, role: 'guru' } })
  const payload = {
    user_id: profile.id,
    nip: teacher.nip || null,
    subject_id: teacher.subjectId || teacher.subject_id || null,
    status: teacher.detailStatus || teacher.status || 'Aktif',
  }
  const rows = teacher.teacherId
    ? await updateRow('teachers', teacher.teacherId, payload, accessToken)
    : await createRow('teachers', payload, accessToken)

  return { ...profile, teacherId: rows[0]?.id, ...payload }
}

export async function removeAdminTeacher({ accessToken, teacher }) {
  if (teacher.teacherId) await deleteRow('teachers', teacher.teacherId, accessToken)
  await removeProfile({ accessToken, id: teacher.id })
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
  await saveLoginAlias({ accessToken, profile: rows[0] })
  return rows[0]
}

export async function removeProfile({ accessToken, id }) {
  const aliases = await listRows('login_aliases', {
    select: 'id',
    filters: { profile_id: id },
    accessToken,
  })
  await Promise.all(aliases.map((alias) => deleteRow('login_aliases', alias.id, accessToken)))
  await deleteRow('users_profile', id, accessToken)
}

async function saveLoginAlias({ accessToken, profile }) {
  if (!profile?.name || !profile?.email) return

  const payload = {
    profile_id: profile.id,
    username: normalizeLoginIdentifier(profile.name),
    email: normalizeLoginIdentifier(profile.email),
    role: profile.role,
  }
  const aliases = await listRows('login_aliases', {
    select: 'id',
    filters: { profile_id: profile.id },
    accessToken,
  })

  if (aliases[0]) {
    await updateRow('login_aliases', aliases[0].id, payload, accessToken)
  } else {
    await createRow('login_aliases', payload, accessToken)
  }
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
    app: 'IsleLearn',
    school: 'SMA Negeri 6 Pangkajene dan Kepulauan',
    data: Object.fromEntries(entries),
  }
}
