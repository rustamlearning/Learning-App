import assert from 'node:assert/strict'
import {
  buildQuizQuestionSnapshots,
  normalizeQuestionOptions,
  resolveQuizQuestionSet,
} from '../src/utils/quizQuestions.js'

const bank = [
  {
    id: 'html-question-2',
    questionText: 'Question two?',
    options: ['Second A', 'Second B', ''],
    correctAnswer: 'Second B',
    subject: 'Bahasa Inggris',
    className: 'Kelas X',
  },
  {
    id: 'html-question-1',
    questionText: 'Question one?',
    options: ['First A', 'First B'],
    correctAnswer: 'First A',
    subject: 'Bahasa Inggris',
    className: 'Kelas X',
  },
]

assert.deepEqual(normalizeQuestionOptions(bank[0]), ['Second A', 'Second B'])

const snapshots = buildQuizQuestionSnapshots(bank, ['html-question-1', 'html-question-2'])
assert.equal(snapshots.length, 2)
assert.equal(snapshots[0].questionText, 'Question one?')
assert.deepEqual(snapshots[0].options, ['First A', 'First B'])

const savedQuiz = {
  subject: 'Bahasa Inggris',
  questionIds: ['html-question-1', 'html-question-2'],
  questionItems: snapshots,
}
assert.deepEqual(
  resolveQuizQuestionSet(savedQuiz, []).map((question) => question.id),
  ['html-question-1', 'html-question-2'],
)

const legacyQuiz = { subject: 'Bahasa Inggris', questionIds: ['html-question-2'] }
assert.deepEqual(resolveQuizQuestionSet(legacyQuiz, bank).map((question) => question.id), ['html-question-2'])

console.log('Snapshot soal kuis mempertahankan pertanyaan, opsi, dan urutan pilihan Bank Soal.')
