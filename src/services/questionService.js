import { createRow, deleteRow, listRows, updateRow } from './supabaseClient.js'

const QUESTION_SELECT = '*,subjects(id,name,code),classes(id,name),users_profile(id,name)'

export async function fetchQuestions({ accessToken, teacherId } = {}) {
  const filters = {}
  if (teacherId) filters.created_by = teacherId

  const rows = await listRows('questions', {
    select: QUESTION_SELECT,
    filters,
    accessToken,
  })

  return rows.map(toQuestionItem)
}

export async function saveQuestion({ accessToken, teacherId, question }) {
  const payload = toQuestionPayload(question, teacherId)
  const rows = question.id
    ? await updateRow('questions', question.id, payload, accessToken)
    : await createRow('questions', payload, accessToken)

  return toQuestionItem(rows[0])
}

export async function removeQuestion({ accessToken, id }) {
  await deleteRow('questions', id, accessToken)
}

function toQuestionPayload(question, teacherId) {
  return {
    question_text: question.questionText,
    options: Array.isArray(question.options) ? question.options : String(question.options || '').split('\n').filter(Boolean),
    correct_answer: question.correctAnswer,
    explanation: question.explanation,
    subject_id: question.subjectId || null,
    class_id: question.classId || null,
    learning_objective_id: question.learningObjectiveId || question.learning_objective_id || null,
    topic: question.topic,
    difficulty: question.difficulty,
    type: question.type,
    created_by: teacherId || null,
  }
}

function toQuestionItem(row) {
  return {
    id: row.id,
    questionText: row.question_text,
    options: Array.isArray(row.options) ? row.options : [],
    correctAnswer: row.correct_answer || '',
    explanation: row.explanation || '',
    subjectId: row.subject_id,
    classId: row.class_id,
    teacherId: row.created_by,
    learningObjectiveId: row.learning_objective_id || '',
    subject: row.subjects?.name || 'Mata pelajaran',
    className: row.classes?.name || 'Semua kelas',
    teacher: row.users_profile?.name || 'Guru',
    topic: row.topic || 'Topik umum',
    difficulty: row.difficulty || 'Mudah',
    type: row.type || 'Pilihan ganda',
    source: 'supabase',
  }
}
