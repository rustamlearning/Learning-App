function cleanText(value, fallback = '') {
  const text = String(value || '').trim()
  return text || fallback
}

export function normalizeQuestionOptions(question = {}) {
  const options = Array.isArray(question.options) ? question.options : []
  return options.map((option) => cleanText(option)).filter(Boolean)
}

export function toQuizQuestionSnapshot(question = {}) {
  const id = cleanText(question.id)
  const questionText = cleanText(question.questionText)
  if (!id || !questionText) return null

  const options = normalizeQuestionOptions(question)
  return {
    id,
    questionText,
    options,
    correctAnswer: cleanText(question.correctAnswer),
    explanation: cleanText(question.explanation, 'Pembahasan belum tersedia.'),
    subject: cleanText(question.subject, 'Mata pelajaran'),
    subjectId: question.subjectId || null,
    className: cleanText(question.className, 'Semua kelas'),
    classId: question.classId || null,
    topic: cleanText(question.topic, 'Topik umum'),
    difficulty: cleanText(question.difficulty, 'Mudah'),
    type: cleanText(question.type, options.length > 0 ? 'Pilihan ganda' : 'Essay'),
    media: Array.isArray(question.media) ? question.media : [],
    source: question.source || 'quiz-snapshot',
  }
}

export function buildQuizQuestionSnapshots(availableQuestions = [], selectedQuestionIds = []) {
  const byId = new Map(
    (Array.isArray(availableQuestions) ? availableQuestions : [])
      .filter((question) => question?.id)
      .map((question) => [String(question.id), question]),
  )

  const seen = new Set()
  return (Array.isArray(selectedQuestionIds) ? selectedQuestionIds : [])
    .map((id) => String(id || ''))
    .filter((id) => id && !seen.has(id) && seen.add(id))
    .map((id) => toQuizQuestionSnapshot(byId.get(id)))
    .filter(Boolean)
}

export function getEmbeddedQuizQuestions(quiz = {}) {
  const rows = Array.isArray(quiz.questionItems)
    ? quiz.questionItems
    : Array.isArray(quiz.questions)
      ? quiz.questions
      : []

  return rows.map(toQuizQuestionSnapshot).filter(Boolean)
}

export function resolveQuizQuestionSet(quiz = {}, availableQuestions = [], fallbackCount = 8) {
  const available = (Array.isArray(availableQuestions) ? availableQuestions : [])
    .map(toQuizQuestionSnapshot)
    .filter(Boolean)
  const embedded = getEmbeddedQuizQuestions(quiz)
  const byId = new Map([...available, ...embedded].map((question) => [question.id, question]))
  const selectedIds = Array.isArray(quiz.questionIds) ? quiz.questionIds.map((id) => String(id || '')).filter(Boolean) : []

  if (selectedIds.length > 0) {
    const selected = selectedIds.map((id) => byId.get(id)).filter(Boolean)
    if (selected.length > 0) return selected
  }

  if (embedded.length > 0) return embedded

  const subject = cleanText(quiz.subject).toLowerCase()
  const bySubject = subject
    ? available.filter((question) => question.subject.toLowerCase() === subject)
    : []
  if (bySubject.length > 0) return bySubject.slice(0, fallbackCount)
  return available.slice(0, fallbackCount)
}
