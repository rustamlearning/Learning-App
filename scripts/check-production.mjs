import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { schoolMaterials } from '../src/data/englishMaterials.js'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const strict = process.argv.includes('--strict')
const env = { ...await loadEnvFiles(), ...process.env }
const issues = []
const warnings = []
const checks = []

checkRequiredEnv('VITE_SUPABASE_URL', 'Supabase frontend URL wajib di production.')
checkRequiredEnv('VITE_SUPABASE_ANON_KEY', 'Supabase anon key wajib di production.')
checkRequiredEnv('GROQ_API_KEY', 'GROQ_API_KEY tidak terlihat di env lokal; pastikan sudah ada di Vercel atau isi file env untuk audit lokal.')
checkEnvValue('AI_REQUIRE_AUTH', 'true', 'AI_REQUIRE_AUTH tidak true di env lokal; production live tetap perlu dicek dengan audit:live.')

if (env.OPENROUTER_ENABLED === 'true') {
  checkRequiredEnv('OPENROUTER_API_KEY', 'OpenRouter aktif tetapi key belum diisi.')
  checkRequiredEnv('OPENROUTER_MODEL', 'OpenRouter aktif tetapi model utama belum diisi.')
}

if (!hasEnv('UPSTASH_REDIS_REST_URL') || !hasEnv('UPSTASH_REDIS_REST_TOKEN')) {
  warnings.push('UPSTASH_REDIS_REST_URL/TOKEN belum diisi; rate limit AI memakai fallback in-memory.')
} else {
  checks.push('Upstash Redis rate limit siap.')
}

await checkSchemaReadiness()
await checkVercelHeaders()
await checkMaterialInventory()

if (checks.length > 0) {
  console.log('OK:')
  checks.forEach((item) => console.log(`- ${item}`))
}

if (warnings.length > 0) {
  console.log('\nPeringatan:')
  warnings.forEach((item) => console.log(`- ${item}`))
}

if (issues.length > 0) {
  console.log('\nPerlu diperbaiki:')
  issues.forEach((item) => console.log(`- ${item}`))
  if (strict) process.exit(1)
}

if (issues.length === 0) {
  console.log('\nAudit production selesai: tidak ada masalah wajib pada konfigurasi lokal.')
} else {
  console.log('\nAudit production selesai: jalankan dengan --strict untuk menggagalkan CI saat ada masalah wajib.')
}

async function loadEnvFiles() {
  const result = {}

  for (const fileName of ['.env', '.env.local', '.env.production']) {
    const filePath = join(projectRoot, fileName)
    const text = await readFile(filePath, 'utf8').catch(() => '')
    Object.assign(result, parseEnv(text))
  }

  return result
}

function parseEnv(text) {
  const rows = {}

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separator = trimmed.indexOf('=')
    if (separator === -1) continue

    const key = trimmed.slice(0, separator).trim()
    const rawValue = trimmed.slice(separator + 1).trim()
    rows[key] = rawValue.replace(/^['"]|['"]$/g, '')
  }

  return rows
}

function hasEnv(key) {
  const value = env[key]
  return Boolean(value && !value.startsWith('your-') && !value.includes('isi_api_key'))
}

function checkRequiredEnv(key, message) {
  if (hasEnv(key)) {
    checks.push(`${key} terisi.`)
    return
  }

  issues.push(message)
}

function checkEnvValue(key, expected, message) {
  if (env[key] === expected) {
    checks.push(`${key}=${expected}.`)
    return
  }

  issues.push(message)
}

async function checkSchemaReadiness() {
  const schema = await readFile(join(projectRoot, 'supabase/schema.sql'), 'utf8')
  const requiredSnippets = [
    'create or replace function resolve_login_email',
    'Students can insert own submissions',
    'Students can insert quiz attempts',
    'create table if not exists attendance_sessions',
    'create table if not exists attendance_rows',
    'Teachers and admins can manage attendance sessions',
  ]
  const missing = requiredSnippets.filter((snippet) => !schema.includes(snippet))

  if (missing.length > 0) {
    issues.push(`supabase/schema.sql belum memuat hardening terbaru: ${missing.join(', ')}.`)
  } else {
    checks.push('supabase/schema.sql memuat RPC login alias, policy submission/quiz, dan tabel absensi.')
  }
}

async function checkVercelHeaders() {
  const config = JSON.parse(await readFile(join(projectRoot, 'vercel.json'), 'utf8'))
  const headerText = JSON.stringify(config.headers || [])

  if (!headerText.includes('X-Content-Type-Options') || !headerText.includes('Permissions-Policy')) {
    issues.push('vercel.json belum memuat security headers utama.')
  } else {
    checks.push('Security headers Vercel tersedia.')
  }
}

async function checkMaterialInventory() {
  const largeFiles = []
  const missingFiles = []

  for (const item of schoolMaterials) {
    if (item.type !== 'HTML') continue
    const content = String(item.content || '')
    const filePath = join(projectRoot, 'public', content)

    try {
      const info = await stat(filePath)
      if (info.size > 4 * 1024 * 1024) {
        largeFiles.push(`${content} ${(info.size / 1024 / 1024).toFixed(1)} MB`)
      }
    } catch (error) {
      missingFiles.push(`${item.id}: ${content}`)
    }
  }

  if (missingFiles.length > 0) {
    issues.push(`Ada file materi HTML tidak ditemukan: ${missingFiles.slice(0, 5).join(', ')}.`)
  } else {
    checks.push(`${schoolMaterials.length} materi terdaftar dan file HTML tersedia.`)
  }

  if (largeFiles.length > 0) {
    warnings.push(`${largeFiles.length} file materi lebih besar dari 4 MB: ${largeFiles.slice(0, 5).join(', ')}.`)
  }
}
