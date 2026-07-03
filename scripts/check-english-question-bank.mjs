import assert from 'node:assert/strict'
import { htmlQuestionBank, htmlQuestionSummary } from '../src/data/htmlQuestionBank.js'
import { filterQuestionBankBySubjects, loadBuiltInQuestionBank, sortQuestionBankRows } from '../src/utils/questionBank.js'

const expectedSubjectCounts = {
  'Bahasa Indonesia': 460,
  'Bahasa Inggris': 447,
  'Bahasa Inggris Tingkat Lanjut': 129,
  Biologi: 571,
  Ekonomi: 191,
  Fisika: 389,
  Geografi: 195,
  Informatika: 67,
  Kimia: 247,
  'Matematika Umum': 350,
  'Pendidikan Agama Islam dan Budi Pekerti': 405,
  'Pendidikan Jasmani, Olahraga, dan Kesehatan': 310,
  'Pendidikan Pancasila': 137,
  'Prakarya dan Kewirausahaan': 517,
  Sejarah: 275,
  'Seni Budaya': 210,
  Sosiologi: 318,
}

assert.equal(htmlQuestionSummary.length, 248, 'Semua materi HTML sekolah harus diaudit.')
assert.equal(htmlQuestionBank.length, 5218, 'Jumlah soal hasil ekstraksi berubah; periksa kembali format materi HTML.')

const ids = new Set()
const questionKeysByMaterial = new Map()
const countsBySubject = new Map()

htmlQuestionBank.forEach((row) => {
  assert.equal(row.type, 'Pilihan ganda')
  assert.ok(Object.hasOwn(expectedSubjectCounts, row.subject), `Mapel tidak dikenal: ${row.subject}`)
  assert.ok(['Kelas X', 'Kelas XI', 'Kelas XII'].includes(row.className), `Kelas tidak valid: ${row.className}`)
  assert.ok(row.questionText.length > 8, `Pertanyaan terlalu pendek: ${row.id}`)
  assert.ok(!/^(?:(?:LOTS|MOTS|HOTS)\s*)?(?:(?:Soal|Formatif|Sumatif)\s*)?\d+$/i.test(row.questionText), `Judul soal terbaca sebagai pertanyaan: ${row.id}`)
  assert.ok(row.options.length >= 3 && row.options.length <= 5, `Jumlah opsi tidak valid: ${row.id}`)
  assert.ok(row.options.includes(row.correctAnswer), `Kunci tidak ditemukan di opsi: ${row.id}`)
  assert.ok(!ids.has(row.id), `ID soal duplikat: ${row.id}`)
  ids.add(row.id)

  const questionKey = row.questionText.toLowerCase().replace(/[^a-z0-9]+/g, '')
  const materialKeys = questionKeysByMaterial.get(row.sourceMaterialId) || new Set()
  assert.ok(!materialKeys.has(questionKey), `Soal duplikat dalam materi ${row.sourceMaterialTitle}: ${row.questionText}`)
  materialKeys.add(questionKey)
  questionKeysByMaterial.set(row.sourceMaterialId, materialKeys)
  countsBySubject.set(row.subject, (countsBySubject.get(row.subject) || 0) + 1)
})

assert.deepEqual(
  Object.fromEntries([...countsBySubject.entries()].sort(([left], [right]) => left.localeCompare(right, 'id-ID'))),
  Object.fromEntries(Object.entries(expectedSubjectCounts).sort(([left], [right]) => left.localeCompare(right, 'id-ID'))),
)

htmlQuestionSummary.forEach((material) => {
  assert.equal(questionKeysByMaterial.get(material.materialId)?.size || 0, material.questionCount)
})

const englishRows = filterQuestionBankBySubjects(htmlQuestionBank, ['Bahasa Inggris'])
assert.equal(englishRows.length, 447)
assert.ok(englishRows.every((row) => row.subject === 'Bahasa Inggris'))
assert.ok(!englishRows.some((row) => row.subject === 'Bahasa Inggris Tingkat Lanjut'))

const chemistryRows = await loadBuiltInQuestionBank(['Kimia'])
assert.equal(chemistryRows.length, 247)
assert.ok(chemistryRows.every((row) => row.subject === 'Kimia'))

const multiSubjectRows = await loadBuiltInQuestionBank(['Pendidikan Agama Islam dan Budi Pekerti', 'Sejarah'])
assert.equal(multiSubjectRows.length, 680)
assert.deepEqual(new Set(multiSubjectRows.map((row) => row.subject)), new Set(['Pendidikan Agama Islam dan Budi Pekerti', 'Sejarah']))

const sorted = sortQuestionBankRows(chemistryRows)
assert.deepEqual(sorted.map((row) => row.id), chemistryRows.map((row) => row.id))

console.log('Bank Soal lintas mapel tervalidasi: 5.218 soal, 17 mapel, dan pemisahan akun guru ketat.')
