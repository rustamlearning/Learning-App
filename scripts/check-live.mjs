const baseUrl = normalizeBaseUrl(process.argv[2] || process.env.ISLELEARN_APP_URL)

if (!baseUrl) {
  console.error('Isi URL aplikasi: npm run audit:live -- https://nama-domain.vercel.app')
  process.exit(1)
}

const issues = []
const checks = []

await checkPage('/')
await checkPage('/login')
await checkHealth()

if (checks.length > 0) {
  console.log('OK:')
  checks.forEach((item) => console.log(`- ${item}`))
}

if (issues.length > 0) {
  console.error('\nPerlu diperbaiki:')
  issues.forEach((item) => console.error(`- ${item}`))
  process.exit(1)
}

console.log('\nAudit live selesai: halaman utama, login, dan health endpoint merespons.')

async function checkPage(path) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: 'follow' }).catch((error) => ({ ok: false, status: 0, error }))

  if (!response.ok) {
    issues.push(`${path} gagal diakses. Status: ${response.status || response.error?.message || 'unknown'}.`)
    return
  }

  checks.push(`${path} merespons ${response.status}.`)
}

async function checkHealth() {
  const response = await fetch(`${baseUrl}/api/health`, { redirect: 'follow' }).catch((error) => ({ ok: false, status: 0, error }))

  if (!response.ok) {
    issues.push(`/api/health gagal diakses. Status: ${response.status || response.error?.message || 'unknown'}.`)
    return
  }

  const data = await response.json().catch(() => null)
  if (!data || data.status !== 'ok') {
    issues.push('/api/health memberi respons yang tidak valid.')
    return
  }

  checks.push(`/api/health ok untuk environment ${data.environment || 'unknown'}.`)

  if (!data.supabase?.configured) {
    issues.push('Supabase belum terkonfigurasi di environment live.')
  }

  if (!data.ai?.providerConfigured) {
    issues.push('Provider AI belum terkonfigurasi di environment live.')
  }

  if (!data.ai?.authRequired) {
    issues.push('AI_REQUIRE_AUTH belum true di environment live.')
  }
}

function normalizeBaseUrl(value) {
  const trimmed = String(value || '').trim().replace(/\/$/, '')
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}
