import assert from 'node:assert/strict'

class MemoryStorage {
  #rows = new Map()

  getItem(key) {
    return this.#rows.has(key) ? this.#rows.get(key) : null
  }

  setItem(key, value) {
    this.#rows.set(key, String(value))
  }

  removeItem(key) {
    this.#rows.delete(key)
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

const storageEvent = new Event('storage')
Object.defineProperty(storageEvent, 'key', { value: 'islelearn-admin-classes' })
window.dispatchEvent(storageEvent)
assert.equal(changedKeys.at(-1), 'islelearn-admin-classes')

unsubscribe()
console.log('Sinkronisasi data inti lokal berhasil diverifikasi.')
