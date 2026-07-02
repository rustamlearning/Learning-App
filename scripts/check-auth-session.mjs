import assert from 'node:assert/strict'
import { isPersistedLocalSchoolUser } from '../src/utils/authSession.js'

const teachers = [
  { id: 'teacher-rustam', name: 'Rustam', nip: '198503112011011007', role: 'guru' },
]

assert.equal(isPersistedLocalSchoolUser({ role: 'guru', nip: '198503112011011007' }, teachers), true)
assert.equal(isPersistedLocalSchoolUser({ role: 'guru', nip: ' 198503112011011007 ' }, teachers), true)
assert.equal(isPersistedLocalSchoolUser({ role: 'guru', nip: '000000000000000000' }, teachers), false)
assert.equal(isPersistedLocalSchoolUser({ role: 'admin', nip: '198503112011011007' }, teachers), false)
assert.equal(isPersistedLocalSchoolUser({ role: 'siswa', nip: '198503112011011007' }, teachers), false)
assert.equal(isPersistedLocalSchoolUser({ role: 'guru' }, teachers), false)
assert.equal(isPersistedLocalSchoolUser(null, teachers), false)

console.log('Persistensi sesi hanya menerima guru sekolah dengan NIP terdaftar.')
