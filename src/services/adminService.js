import { createRow, deleteRow, deleteRows, listRows, normalizeLoginIdentifier, updateRow } from './supabaseClient.js'

export async function fetchProfiles({ accessToken, role }) {
  return listRows('users_profile', {
    select: 'id,auth_user_id,name,email,role,status,created_at',
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
  const [profileRows, teacherRows, subjectRows, teacherSubjectRows] = await Promise.all([
    fetchProfiles({ accessToken, role: 'guru' }),
    listRows('teachers', { select: 'id,user_id,nip,subject_id,status', accessToken }),
    fetchSubjects({ accessToken }),
    fetchTeacherSubjectLinks({ accessToken }),
  ])
  const subjectMap = new Map(subjectRows.map((item) => [item.id, item]))
  const safeTeacherSubjectRows = teacherSubjectRows || []

  return profileRows.map((profile) => {
    const detail = teacherRows.find((teacher) => teacher.user_id === profile.id)
    const linkedSubjectIds = safeTeacherSubjectRows
      .filter((link) => link.teacher_id === detail?.id)
      .map((link) => link.subject_id)
    const subjectIds = [...new Set([
      ...linkedSubjectIds,
      ...(detail?.subject_id ? [detail.subject_id] : []),
    ])]
    const subjectNames = subjectIds.map((subjectId) => subjectMap.get(subjectId)?.name).filter(Boolean)

    return {
      ...profile,
      teacherId: detail?.id,
      nip: detail?.nip || '',
      subjectId: subjectIds[0] || '',
      subjectIds,
      subject: subjectNames.join('; ') || '-',
      detailStatus: detail?.status || profile.status,
    }
  })
}

export async function saveAdminTeacher({ accessToken, teacher }) {
  const subjectIds = [...new Set(
    (Array.isArray(teacher.subjectIds)
      ? teacher.subjectIds
      : [teacher.subjectId || teacher.subject_id]
    ).filter(Boolean),
  )]
  const existingLinks = await fetchTeacherSubjectLinks({ accessToken })

  if (existingLinks === null && subjectIds.length > 1) {
    throw new Error('Fitur multi-mapel belum diaktifkan di Supabase. Jalankan SQL teacher-subjects migration terlebih dahulu.')
  }

  const profile = await saveProfile({ accessToken, profile: { ...teacher, role: 'guru' } })
  const payload = {
    user_id: profile.id,
    nip: teacher.nip || null,
    subject_id: subjectIds[0] || null,
    status: teacher.detailStatus || teacher.status || 'Aktif',
  }
  const rows = teacher.teacherId
    ? await updateRow('teachers', teacher.teacherId, payload, accessToken)
    : await createRow('teachers', payload, accessToken)
  const teacherId = rows[0]?.id || teacher.teacherId
  await saveTeacherLoginAlias({ accessToken, profile, nip: payload.nip })

  if (existingLinks !== null && teacherId) {
    await deleteRows('teacher_subjects', { teacher_id: teacherId }, accessToken)
    if (subjectIds.length) {
      await createRow(
        'teacher_subjects',
        subjectIds.map((subjectId) => ({ teacher_id: teacherId, subject_id: subjectId })),
        accessToken,
      )
    }
  }

  const subjectRows = await fetchSubjects({ accessToken })
  const subjectMap = new Map(subjectRows.map((subject) => [subject.id, subject.name]))
  const subjectNames = subjectIds.map((subjectId) => subjectMap.get(subjectId)).filter(Boolean)

  return {
    ...profile,
    teacherId,
    ...payload,
    subjectId: subjectIds[0] || '',
    subjectIds,
    subject: subjectNames.join('; ') || '-',
  }
}

export async function removeAdminTeacher({ accessToken, teacher }) {
  if (teacher.teacherId) await deleteRow('teachers', teacher.teacherId, accessToken)
  await removeProfile({ accessToken, id: teacher.id })
}

async function fetchTeacherSubjectLinks({ accessToken }) {
  try {
    return await listRows('teacher_subjects', {
      select: 'teacher_id,subject_id',
      accessToken,
    })
  } catch (error) {
    const message = String(error?.message || '').toLowerCase()
    const missingTable = message.includes('teacher_subjects')
      && (message.includes('schema cache') || message.includes('does not exist') || message.includes('not find'))
    if (missingTable) return null
    throw error
  }
}

async function saveTeacherLoginAlias({ accessToken, profile, nip }) {
  const username = normalizeLoginIdentifier(String(nip || '').replace(/\s+/g, ''))
  if (!username || !profile?.id || !profile?.email) return

  const payload = {
    profile_id: profile.id,
    username,
    email: normalizeLoginIdentifier(profile.email),
    role: 'guru',
  }
  const aliases = await listRows('login_aliases', {
    select: 'id',
    filters: { username },
    accessToken,
  })

  if (aliases[0]) await updateRow('login_aliases', aliases[0].id, payload, accessToken)
  else await createRow('login_aliases', payload, accessToken)
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
    filters: { username: payload.username },
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
  const teacherIds = [...new Set(
    (Array.isArray(subject.teacherIds)
      ? subject.teacherIds
      : [subject.teacherRecordId]
    ).filter(Boolean),
  )]
  const existingLinks = await fetchTeacherSubjectLinks({ accessToken })

  if (existingLinks === null && teacherIds.length > 1) {
    throw new Error('Fitur multi-guru belum diaktifkan di Supabase. Jalankan SQL teacher-subjects migration terlebih dahulu.')
  }

  const teacherRows = await listRows('teachers', {
    select: 'id,user_id',
    accessToken,
  })
  const primaryTeacher = teacherRows.find((teacher) => teacher.id === teacherIds[0])
  const payload = {
    name: subject.name,
    code: subject.code,
    teacher_id: primaryTeacher?.user_id || null,
  }
  const rows = subject.id
    ? await updateRow('subjects', subject.id, payload, accessToken)
    : await createRow('subjects', payload, accessToken)
  const subjectId = rows[0]?.id || subject.id

  if (existingLinks !== null && subjectId) {
    await deleteRows('teacher_subjects', { subject_id: subjectId }, accessToken)
    if (teacherIds.length) {
      await createRow(
        'teacher_subjects',
        teacherIds.map((teacherId) => ({ teacher_id: teacherId, subject_id: subjectId })),
        accessToken,
      )
    }
  }

  return { ...rows[0], teacherIds }
}

export async function removeSubject({ accessToken, id }) {
  await deleteRow('subjects', id, accessToken)
}

export async function resetAdminTeacherPassword({ accessToken, teacher, password }) {
  const resetResponse = await fetch('/api/admin-teacher-password', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ profileId: teacher.id, password }),
  })
  const text = await resetResponse.text()
  let data = null

  try {
    data = text ? JSON.parse(text) : null
  } catch (error) {
    data = null
  }

  if (!resetResponse.ok) {
    throw new Error(data?.error || 'Reset password guru gagal.')
  }

  return data
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
