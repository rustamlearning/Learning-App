import assert from 'node:assert/strict'

class MemoryStorage {
  #rows = new Map()

  getItem(key) {
    return this.#rows.has(key) ? this.#rows.get(key) : null
  }

  setItem(key, value) {
    const textValue = String(value)
    this.#rows.set(key, textValue)
    this[key] = textValue
  }

  removeItem(key) {
    this.#rows.delete(key)
    delete this[key]
  }

  key(index) {
    return Array.from(this.#rows.keys())[index] || null
  }

  get length() {
    return this.#rows.size
  }
}

if (typeof CustomEvent === 'undefined') {
  globalThis.CustomEvent = class CustomEvent extends Event {
    constructor(type, options = {}) {
      super(type)
      this.detail = options.detail
    }
  }
}

globalThis.localStorage = new MemoryStorage()
globalThis.window = new EventTarget()

const {
  readLocalRowsByPrefix,
  safeWriteLocalJson,
  setLocalAdminProfiles,
  subscribeToSharedSchoolDataChanges,
} = await import('../src/utils/localLearningStore.js')

const changedKeys = []
const unsubscribe = subscribeToSharedSchoolDataChanges((key) => changedKeys.push(key))
const flushEvents = () => new Promise((resolve) => setTimeout(resolve, 0))

setLocalAdminProfiles('guru', [{ id: 'teacher-1', name: 'Guru Satu' }])
await flushEvents()
assert.deepEqual(changedKeys, ['islelearn-admin-profiles-guru'])

setLocalAdminProfiles('guru', [{ id: 'teacher-1', name: 'Guru Satu' }])
await flushEvents()
assert.equal(changedKeys.length, 1, 'Data yang sama tidak boleh memicu sinkronisasi ulang.')

safeWriteLocalJson('islelearn-quiz-result-student-1', { score: 90 })
await flushEvents()
assert.equal(changedKeys.length, 1, 'Data belajar pribadi tidak boleh me-refresh semua akun.')

safeWriteLocalJson('islelearn-daily-tasks-school', [{ id: 'daily-task-1', title: 'Praktek' }])
await flushEvents()
assert.equal(changedKeys.at(-1), 'islelearn-daily-tasks-school', 'Tugas harian sekolah harus memicu sinkronisasi akun lokal.')

safeWriteLocalJson('islelearn-attendance-school', [{ id: 'attendance-1', date: '2026-08-01' }])
await flushEvents()
assert.equal(changedKeys.at(-1), 'islelearn-attendance-school', 'Absensi sekolah harus memicu sinkronisasi akun lokal.')

safeWriteLocalJson('sea-learning-attendance-local-preview-guru', [{ id: 'legacy-attendance-1', date: '2026-08-02' }])
await flushEvents()
assert.equal(changedKeys.at(-1), 'sea-learning-attendance-local-preview-guru', 'Absensi legacy harus memicu sinkronisasi akun lokal.')
assert.deepEqual(
  readLocalRowsByPrefix('sea-learning-attendance-').map((item) => item.id),
  ['legacy-attendance-1'],
  'Absensi legacy harus tetap dapat dibaca untuk pemulihan.'
)

safeWriteLocalJson('sea-learning-daily-tasks-local-preview-guru', [{ id: 'legacy-daily-task-1', title: 'Tugas lama' }])
await flushEvents()
assert.equal(changedKeys.at(-1), 'sea-learning-daily-tasks-local-preview-guru', 'Tugas harian legacy harus memicu sinkronisasi akun lokal.')

const storageEvent = new Event('storage')
Object.defineProperty(storageEvent, 'key', { value: 'islelearn-admin-classes' })
window.dispatchEvent(storageEvent)
assert.equal(changedKeys.at(-1), 'islelearn-admin-classes')

unsubscribe()
console.log('Sinkronisasi data inti lokal berhasil diverifikasi.')
