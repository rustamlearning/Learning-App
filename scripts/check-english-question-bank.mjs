import assert from 'node:assert/strict'
import { englishHtmlQuestionBank, englishHtmlQuestionSummary } from '../src/data/englishQuestionBank.js'

assert.equal(englishHtmlQuestionSummary.length, 18, 'Semua 18 materi HTML Bahasa Inggris harus terdaftar.')
assert.equal(englishHtmlQuestionBank.length, 447, 'Jumlah soal hasil ekstraksi berubah; periksa kembali format materi HTML.')

const ids = new Set()
const questionKeysByMaterial = new Map()
const countsByClass = new Map()

englishHtmlQuestionBank.forEach((row) => {
  assert.equal(row.subject, 'Bahasa Inggris')
  assert.equal(row.type, 'Pilihan ganda')
  assert.ok(['Kelas X', 'Kelas XI', 'Kelas XII'].includes(row.className), `Kelas tidak valid: ${row.className}`)
  assert.ok(row.questionText.length > 8, `Pertanyaan terlalu pendek: ${row.id}`)
  assert.ok(row.options.length >= 2 && row.options.length <= 5, `Jumlah opsi tidak valid: ${row.id}`)
  assert.ok(row.options.includes(row.correctAnswer), `Kunci tidak ditemukan di opsi: ${row.id}`)
  assert.ok(!ids.has(row.id), `ID soal duplikat: ${row.id}`)
  ids.add(row.id)

  const questionKey = row.questionText.toLowerCase().replace(/[^a-z0-9]+/g, '')
  const materialKeys = questionKeysByMaterial.get(row.sourceMaterialId) || new Set()
  assert.ok(!materialKeys.has(questionKey), `Soal duplikat dalam materi ${row.sourceMaterialTitle}: ${row.questionText}`)
  materialKeys.add(questionKey)
  questionKeysByMaterial.set(row.sourceMaterialId, materialKeys)
  countsByClass.set(row.className, (countsByClass.get(row.className) || 0) + 1)
})

assert.deepEqual(Object.fromEntries(countsByClass), {
  'Kelas X': 196,
  'Kelas XI': 146,
  'Kelas XII': 105,
})

englishHtmlQuestionSummary.forEach((material) => {
  assert.ok(material.questionCount > 0, `Tidak ada soal terbaca dari ${material.materialTitle}`)
  assert.equal(questionKeysByMaterial.get(material.materialId)?.size, material.questionCount)
})

assert.ok(englishHtmlQuestionBank.some((row) => row.questionText.includes('What do you think about using AI for homework?') || row.options.includes('What do you think about using AI for homework?')))
assert.ok(englishHtmlQuestionBank.some((row) => row.sourceMaterialTitle === 'Chapter 7 Eco Awareness'))

console.log('Bank Soal Bahasa Inggris tervalidasi: 447 soal, 18 materi, urutan kelas dan materi lengkap.')
