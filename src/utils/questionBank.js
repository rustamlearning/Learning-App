function normalizeSubjectKey(value = '') {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function normalizeSubjectList(subjects = []) {
  const rows = Array.isArray(subjects) ? subjects : [subjects]
  return new Set(rows.map(normalizeSubjectKey).filter(Boolean))
}

export function filterQuestionBankBySubjects(rows = [], subjects = []) {
  const subjectKeys = normalizeSubjectList(subjects)
  if (subjectKeys.size === 0) return []
  return (Array.isArray(rows) ? rows : []).filter((row) => subjectKeys.has(normalizeSubjectKey(row?.subject)))
}

export async function loadBuiltInQuestionBank(subjects = []) {
  if (normalizeSubjectList(subjects).size === 0) return []
  const { htmlQuestionBank } = await import('../data/htmlQuestionBank.js')
  return filterQuestionBankBySubjects(htmlQuestionBank, subjects)
}

function questionSortValue(row = {}) {
  const grade = row.className === 'Kelas X' ? 10 : row.className === 'Kelas XI' ? 11 : row.className === 'Kelas XII' ? 12 : 99
  const chapterMatch = String(row.topic || row.sourceMaterialTitle || '').match(/\b(?:chapter|bab)\s*[-.:]?\s*(\d{1,2})\b/i)
  const chapter = chapterMatch ? Number(chapterMatch[1]) : 99
  return [
    grade,
    Number(row.sourceMaterialOrder || chapter || 999),
    Number(row.sourceQuestionOrder || 9999),
    String(row.topic || ''),
    String(row.questionText || ''),
  ]
}

export function sortQuestionBankRows(rows = []) {
  return [...rows].sort((left, right) => {
    const leftValue = questionSortValue(left)
    const rightValue = questionSortValue(right)
    for (let index = 0; index < leftValue.length; index += 1) {
      if (typeof leftValue[index] === 'number' && leftValue[index] !== rightValue[index]) {
        return leftValue[index] - rightValue[index]
      }
      if (typeof leftValue[index] === 'string') {
        const comparison = leftValue[index].localeCompare(rightValue[index], 'id-ID', { numeric: true, sensitivity: 'base' })
        if (comparison) return comparison
      }
    }
    return 0
  })
}

export function mergeQuestionBankRows(builtInRows = [], savedRows = []) {
  const byId = new Map()
  builtInRows.forEach((row) => row?.id && byId.set(row.id, row))
  savedRows.forEach((row) => row?.id && byId.set(row.id, row))
  return sortQuestionBankRows(Array.from(byId.values()))
}
