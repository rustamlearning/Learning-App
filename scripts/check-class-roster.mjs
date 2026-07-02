import assert from 'node:assert/strict'
import { buildClassRoster, studentBelongsToClass } from '../src/utils/classRoster.js'

const classA = { id: 'class-a', name: 'XI Utsman Bin Affan' }
const classB = { id: 'class-b', name: 'XI Ali Bin Abi Thalib' }
const students = [
  { id: '1', name: 'Zahira', classId: 'class-a', className: classA.name },
  { id: '2', name: 'Abd. Karim', classId: 'class-b', className: classB.name },
  { id: '3', name: 'Adam', className: '  XI   Utsman Bin Affan ' },
  { id: '4', name: 'Arifin', className: classB.name },
  { id: '5', name: 'Class ID wins', classId: 'class-b', className: classA.name },
]

assert.equal(studentBelongsToClass(students[0], classA), true)
assert.equal(studentBelongsToClass(students[0], classB), false)
assert.deepEqual(buildClassRoster(students, classA).map((student) => student.id), ['3', '1'])
assert.deepEqual(buildClassRoster(students, classB).map((student) => student.id), ['2', '4', '5'])
assert.equal(buildClassRoster(students, classA).some((student) => student.id === '2'), false, 'Siswa dari kelas XI lain tidak boleh ikut masuk.')

console.log('Pemisahan roster berdasarkan class_id dan nama kelas berhasil diverifikasi.')
