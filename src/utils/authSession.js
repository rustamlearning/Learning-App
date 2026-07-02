function normalizeCredential(value) {
  return String(value || '').trim().replace(/\s+/g, '')
}

export function isPersistedLocalSchoolUser(user, teacherRows = []) {
  if (!user || user.role !== 'guru') return false

  const userNip = normalizeCredential(user.nip)
  if (!userNip) return false

  return (Array.isArray(teacherRows) ? teacherRows : []).some((teacher) => (
    normalizeCredential(teacher?.nip || teacher?.username) === userNip
  ))
}
