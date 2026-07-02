function normalizeClassKey(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('id-ID')
}

export function studentBelongsToClass(student = {}, classItem = {}) {
  const studentClassId = student.classId || student.class_id || ''
  const targetClassId = classItem.id || classItem.classId || classItem.class_id || ''

  if (studentClassId && targetClassId) {
    return String(studentClassId) === String(targetClassId)
  }

  if (studentClassId) return false

  const studentClassName = student.className || student.class || student.class_name || ''
  const targetClassName = classItem.name || classItem.className || classItem.class_name || ''
  const studentClassKey = normalizeClassKey(studentClassName)
  const targetClassKey = normalizeClassKey(targetClassName)

  return Boolean(studentClassKey && targetClassKey && studentClassKey === targetClassKey)
}

export function buildClassRoster(studentRows = [], classItem = {}) {
  return (Array.isArray(studentRows) ? studentRows : [])
    .filter((student) => studentBelongsToClass(student, classItem))
    .sort((left, right) => String(left.name || left.fullName || '').localeCompare(
      String(right.name || right.fullName || ''),
      'id-ID',
      { sensitivity: 'base' },
    ))
}
