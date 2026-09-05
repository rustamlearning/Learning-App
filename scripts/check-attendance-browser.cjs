async (page) => {
  // Build with VITE_REMOTE_DATA_ENABLED=true and test-only Supabase URL/key,
  // serve on port 4173, then use playwright-cli run-code --filename this-file.
  const assert = (condition, message) => { if (!condition) throw new Error(message) }
  assert(page.url().startsWith('http://127.0.0.1:4173/'), 'Run only against the local preview.')
  await page.unroute('https://*.supabase.co/**')
  page.on('dialog', dialog => dialog.accept())
  const profileId = '11111111-1111-4111-8111-111111111111'
  const classId = '22222222-2222-4222-8222-222222222222'
  const subjectId = '33333333-3333-4333-8333-333333333333'
  const className = 'X Aisyah Binti Abu Bakar'
  const profile = { id: profileId, name: 'Guru Uji Absensi', role: 'guru', subject: 'Bahasa Inggris' }
  const tables = {
    classes: [{ id: classId, name: className, homeroom_teacher_id: profileId }],
    subjects: [{ id: subjectId, name: 'Bahasa Inggris', teacher_id: profileId }],
    students: [],
    attendance_sessions: [{ id: '44444444-4444-4444-8444-444444444444', scope_key: 'v1|subject|2026-08-01|x aisyah binti abu bakar|bahasa inggris|07.30 - 09.00', type: 'subject', attendance_date: '2026-08-01', class_id: classId, class_name: className, subject_id: subjectId, subject_name: 'Bahasa Inggris', lesson_time: '07.30 - 09.00', recorded_by: profileId, updated_at: '2026-08-01T10:00:00Z' }],
    attendance_rows: [{ id: '55555555-5555-4555-8555-555555555555', session_id: '44444444-4444-4444-8444-444444444444', student_key: 'legacy-amira', student_name: 'AMIRA KAESYA PUTRI', class_name: className, status: 'Izin', note: 'Rekaman lama', row_order: 0, updated_at: '2026-08-01T10:00:00Z' }],
  }
  const original = JSON.stringify(tables.attendance_rows[0])
  let serial = 100
  let failWrites = false
  let delayRead = true
  const requests = []
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('https://*.supabase.co/**', async route => {
    const req = route.request()
    const [base, query = ''] = req.url().split('?')
    const url = {
      pathname: base.replace(/^https:\/\/[^/]+/, ''),
      searchParams: new Map(query.split('&').filter(Boolean).map(pair => pair.split('=').map(value => decodeURIComponent(value.replace(/\+/g, ' '))))),
    }
    const table = url.pathname.split('/').pop()
    requests.push({ method: req.method(), table })
    const respond = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) })
    if (url.pathname === '/auth/v1/user') return respond({ id: profileId, email: 'attendance-test@example.invalid' })
    if (table === 'users_profile') return respond(url.searchParams.has('auth_user_id') ? [profile] : [])
    if (!Object.hasOwn(tables, table)) return respond([])
    const matches = row => [...url.searchParams].every(([key, filter]) => {
      if (filter.startsWith('eq.')) return String(row[key]) === filter.slice(3)
      if (filter.startsWith('in.(')) return filter.slice(4, -1).split(',').includes(String(row[key]))
      return true
    })
    if (req.method() === 'GET') {
      if (table === 'attendance_sessions' && delayRead) await page.waitForTimeout(1600)
      return respond(tables[table].filter(matches))
    }
    if (req.method() === 'DELETE') throw new Error('Unexpected delete during attendance regression test')
    if (failWrites) return respond({ message: 'Simulated connection failure' }, 503)
    await page.waitForTimeout(40)
    const payload = req.postDataJSON()
    if (req.method() === 'PATCH') {
      const changed = tables[table].filter(matches)
      changed.forEach(row => Object.assign(row, payload))
      return respond(changed)
    }
    const saved = (Array.isArray(payload) ? payload : [payload]).map(item => ({ id: `99999999-9999-4999-8999-${String(serial++).padStart(12, '0')}`, ...item }))
    tables[table].push(...saved)
    return respond(saved, 201)
  })
  await page.evaluate(({ profileId }) => {
    localStorage.clear()
    localStorage.setItem('islelearn-legacy-demo-purged-v3', 'true')
    localStorage.setItem('islelearn-supabase-session', JSON.stringify({ access_token: 'attendance-test-only', refresh_token: 'test', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: profileId } }))
  }, { profileId })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('http://127.0.0.1:4173/guru/daftar-hadir')
  const dateInput = page.getByLabel('Tanggal', { exact: true })
  await dateInput.waitFor()
  const row = () => page.locator('tr').filter({ hasText: 'AMIRA KAESYA PUTRI' }).filter({ has: page.getByRole('button', { name: 'Sakit', exact: true }) })
  const note = () => row().locator('input')
  await note().fill('Draf saat data dimuat')
  await row().getByRole('button', { name: 'Sakit', exact: true }).click()
  await page.getByRole('button', { name: 'Simpan', exact: true }).waitFor()
  assert(await note().inputValue() === 'Draf saat data dimuat', 'Initial server load erased draft')
  await page.evaluate(() => { window.__attendanceDateNode = document.querySelector('input[type=date]') })
  const readsBefore = requests.filter(req => req.table === 'attendance_sessions' && req.method === 'GET').length
  for (let index = 0; index < 3; index++) {
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('islelearn:school-data-change', { detail: { key: 'islelearn-attendance-school' } })))
    await page.waitForTimeout(250)
  }
  assert(await page.evaluate(() => window.__attendanceDateNode === document.querySelector('input[type=date]')), 'Cache update remounted attendance page')
  assert(await note().inputValue() === 'Draf saat data dimuat', 'Cache update erased draft')
  assert(requests.filter(req => req.table === 'attendance_sessions' && req.method === 'GET').length === readsBefore, 'Cache update restarted server loading')
  assert((await page.getByRole('button', { name: /Absensi Wali Kelas/ }).count()) === 1, 'Homeroom attendance mode missing')
  assert((await page.getByRole('button', { name: /Absensi Mapel/ }).count()) === 1, 'Subject attendance mode missing')
  await page.getByRole('button', { name: 'Simpan', exact: true }).click()
  assert(await page.getByRole('button', { name: 'Menyimpan...', exact: true }).isDisabled(), 'Duplicate saves are not blocked')
  await note().fill('Draf baru saat menyimpan')
  await page.getByText('Daftar hadir terakhir sudah tersimpan', { exact: false }).waitFor()
  assert(await note().inputValue() === 'Draf baru saat menyimpan', 'Save response erased a newer draft')
  const saved = tables.attendance_rows.find(item => item.note === 'Draf saat data dimuat')
  assert(saved?.status === 'Sakit', 'Status and note did not reach the server')
  assert(JSON.stringify(tables.attendance_rows[0]) === original, 'Unrelated historical attendance changed')
  const firstSavedRowCount = tables.attendance_rows.length
  const firstSavedSessionCount = tables.attendance_sessions.length
  await page.getByRole('button', { name: 'Simpan', exact: true }).click()
  await page.getByRole('button', { name: 'Simpan', exact: true }).waitFor()
  assert(tables.attendance_rows.some(item => item.note === 'Draf baru saat menyimpan'), 'Second save missing')
  assert(tables.attendance_rows.length === firstSavedRowCount, 'Repeat save duplicated student rows')
  assert(tables.attendance_sessions.length === firstSavedSessionCount, 'Repeat save duplicated sessions')
  const countAfterSave = tables.attendance_rows.length
  delayRead = false
  await page.reload()
  await page.getByRole('button', { name: 'Simpan', exact: true }).waitFor()
  assert(await note().inputValue() === 'Draf baru saat menyimpan', 'Reload lost saved attendance')
  assert(tables.attendance_rows.length === countAfterSave, 'Reload duplicated attendance rows')
  failWrites = true
  await note().fill('Draf koneksi gagal')
  await page.getByRole('button', { name: 'Simpan', exact: true }).click()
  await page.getByText('Sinkronisasi Supabase tertunda:', { exact: false }).waitFor()
  assert(await note().inputValue() === 'Draf koneksi gagal', 'Failed save erased draft')
  assert(await page.evaluate(() => localStorage.getItem('islelearn-attendance-school').includes('Draf koneksi gagal')), 'Failed save lost local backup')
  failWrites = false
  await page.getByRole('button', { name: 'Simpan', exact: true }).click()
  await page.getByRole('button', { name: 'Simpan', exact: true }).waitFor()
  assert(tables.attendance_rows.some(item => item.note === 'Draf koneksi gagal'), 'Retry failed')
  await page.getByRole('button', { name: /Absensi Wali Kelas/ }).click()
  await note().fill('Absensi wali kelas terpisah')
  await row().getByRole('button', { name: 'Izin', exact: true }).click()
  await page.getByRole('button', { name: 'Simpan', exact: true }).click()
  await page.getByRole('button', { name: 'Simpan', exact: true }).waitFor()
  const dailySession = tables.attendance_sessions.find(item => item.type === 'daily')
  assert(tables.attendance_rows.some(item => item.session_id === dailySession?.id && item.note === 'Absensi wali kelas terpisah' && item.status === 'Izin'), 'Homeroom save failed')
  await page.getByRole('button', { name: /Absensi Mapel/ }).click()
  assert(await note().inputValue() === 'Draf koneksi gagal', 'Homeroom save overwrote subject attendance')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'output/playwright/attendance-mobile.png', fullPage: false })
  const mobileRow = page.locator('article').filter({ hasText: 'AMIRA KAESYA PUTRI' })
  assert(await mobileRow.getByRole('button', { name: 'Sakit', exact: true }).isVisible(), 'Mobile attendance controls missing')
  await page.setViewportSize({ width: 1440, height: 1000 })
  await row().scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'output/playwright/attendance-desktop.png', fullPage: false })
  assert(errors.length === 0, `Browser errors: ${errors.join('; ')}`)
  return { passed: true, checks: ['draft survives delayed load', 'no remount on cache changes', 'no repeated fetch', 'separate homeroom and subject saves', 'save and reload', 'edit during save', 'no duplicate rows', 'historical data unchanged', 'offline backup and retry', 'mobile controls'], sessionReads: readsBefore, savedRows: tables.attendance_rows.length }
}
