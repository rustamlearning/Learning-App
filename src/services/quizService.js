import { createRow, deleteRow, deleteRows, listRows, updateRow } from './supabaseClient.js'

const QUIZ_SELECT = '*,subjects(id,name,code),classes(id,name),users_profile(id,name)'
const QUIZ_QUESTION_SELECT = '*,questions(*)'

export async function fetchQuizzes({ accessToken, teacherId, publishedOnly = false } = {}) {
  const filters = {}
  if (teacherId) filters.teacher_id = teacherId
  if (publishedOnly) filters.status = 'Publish'

  const rows = await listRows('quizzes', {
    select: QUIZ_SELECT,
    filters,
    accessToken,
  })

  return rows.map(toQuizItem)
}

export async function fetchQuizQuestions({ accessToken, quizId }) {
  const rows = await listRows('quiz_questions', {
    select: QUIZ_QUESTION_SELECT,
    filters: { quiz_id: quizId },
    accessToken,
  })

  return rows.map((row) => toQuestionItem(row.questions)).filter(Boolean)
}

export async function saveQuiz({ accessToken, teacherId, quiz, questionIds = [] }) {
  const payload = toQuizPayload(quiz, teacherId)
  const rows = quiz.id
    ? await updateRow('quizzes', quiz.id, payload, accessToken)
    : await createRow('quizzes', payload, accessToken)
  const saved = rows[0]

  if (questionIds.length > 0) {
    await deleteRows('quiz_questions', { quiz_id: saved.id }, accessToken)
    await Promise.all(questionIds.map((questionId) => createRow('quiz_questions', {
      quiz_id: saved.id,
      question_id: questionId,
    }, accessToken)))
  }

  return toQuizItem(saved)
}

export async function removeQuiz({ accessToken, id }) {
  await deleteRow('quizzes', id, accessToken)
}

export async function submitQuizAttempt({ accessToken, quiz, questions, answers, studentId }) {
  const total = questions.length || 1
  const correct = questions.filter((question) => answers[question.id] === question.correctAnswer).length
  const score = Math.round((correct / total) * 100)
  const rows = await createRow('quiz_attempts', {
    quiz_id: quiz.id,
    student_id: studentId || null,
    answers,
    score,
    submitted_at: new Date().toISOString(),
  }, accessToken)

  return { ...rows[0], score, correct, total }
}

export async function fetchStudentRecord({ accessToken, profileId }) {
  const rows = await listRows('students', {
    select: 'id,user_id,class_id',
    filters: { user_id: profileId },
    accessToken,
  })
  return rows[0] || null
}

export async function fetchQuizAttempts({ accessToken, quizId } = {}) {
  const filters = {}
  if (quizId) filters.quiz_id = quizId
  return listRows('quiz_attempts', {
    select: '*',
    filters,
    accessToken,
  })
}

function toQuizPayload(quiz, teacherId) {
  return {
    title: quiz.title,
    description: quiz.description,
    subject_id: quiz.subjectId || null,
    class_id: quiz.classId || null,
    teacher_id: teacherId || null,
    duration: Number(quiz.duration) || 30,
    status: quiz.status || 'Draft',
    start_time: quiz.startTime || null,
    end_time: quiz.endTime || null,
  }
}

function toQuizItem(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || 'Kuis ringan dengan soal terpilih dari bank soal.',
    subjectId: row.subject_id,
    classId: row.class_id,
    teacherId: row.teacher_id,
    subject: row.subjects?.name || 'Mata pelajaran',
    className: row.classes?.name || 'Semua kelas',
    teacher: row.users_profile?.name || 'Guru',
    status: row.status || 'Draft',
    duration: row.duration || 30,
    date: row.start_time ? new Date(row.start_time).toLocaleDateString('id-ID') : 'Belum dijadwalkan',
    startTime: row.start_time,
    endTime: row.end_time,
    source: 'supabase',
  }
}

function toQuestionItem(row) {
  if (!row) return null
  return {
    id: row.id,
    questionText: row.question_text,
    options: Array.isArray(row.options) ? row.options : [],
    correctAnswer: row.correct_answer || '',
    explanation: row.explanation || '',
    subjectId: row.subject_id,
    classId: row.class_id,
    topic: row.topic || 'Topik umum',
    difficulty: row.difficulty || 'Mudah',
    type: row.type || 'Pilihan ganda',
  }
}
