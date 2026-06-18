import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, posix } from 'node:path'

const zipPath = process.argv[2] || '/Users/rustammacbook/Downloads/MATERI LENGKAP SETIAP MAPEL.zip'
const outputRoot = 'public/materials/imported'
const dataFile = 'src/data/englishMaterials.js'

const subjectMap = new Map([
  ['EKONOMI', 'Ekonomi'],
  ['BAHASA INDONESIA FIX', 'Bahasa Indonesia'],
  ['BAHASA INDONESIA', 'Bahasa Indonesia'],
  ['KIMIA', 'Kimia'],
  ['BAHASA INGGRIS TINGKAT LANJUT', 'Bahasa Inggris Tingkat Lanjut'],
  ['SOSIOLOGI', 'Sosiologi'],
  ['GEOGRAFI', 'Geografi'],
  ['PJOK', 'Pendidikan Jasmani, Olahraga, dan Kesehatan'],
  ['INFORMATIKA', 'Informatika'],
  ['BIOLOGI FIX', 'Biologi'],
  ['BIOLOGI', 'Biologi'],
  ['SEJARAH', 'Sejarah'],
  ['PKWU', 'Prakarya dan Kewirausahaan'],
  ['PAI', 'Pendidikan Agama Islam dan Budi Pekerti'],
  ['FISIKA', 'Fisika'],
  ['SENI BUDAYA', 'Seni Budaya'],
  ['MATEMATIKA FIX', 'Matematika Umum'],
  ['MATEMATIKA', 'Matematika Umum'],
  ['PKN', 'Pendidikan Pancasila'],
  ['BAHASA INGGRIS', 'Bahasa Inggris'],
])

const gradeNames = {
  x: 'Kelas X',
  xi: 'Kelas XI',
  xii: 'Kelas XII',
}

const subjectExportMap = [
  ['english', 'Bahasa Inggris'],
  ['mathematics', 'Matematika Umum'],
  ['biology', 'Biologi'],
  ['bahasaIndonesia', 'Bahasa Indonesia'],
  ['pkn', 'Pendidikan Pancasila'],
  ['pai', 'Pendidikan Agama Islam dan Budi Pekerti'],
]

function normalizeSubjectDir(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toUpperCase()
}

function slugify(value) {
  const slug = String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' dan ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'materi'
}

function humanize(value) {
  const words = String(value || '')
    .replace(/\.[^.]+$/, '')
    .replace(/(^|[^a-z0-9])(bab|chapter|unit)[\s_-]*(\d+)/gi, '$1$2 $3')
    .replace(/[_-]+/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b(revisi|fixed|final|singlefile|single|interaktif|interactive|standalone|lengkap|rapi|student|tts|hidden|script|model|optimized|sticky|navigation|transparent|hero|super|submit|baru|muncul|jawaban)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return words
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      if (/^(x|xi|xii|tl|pg|sma|nkri|uud|ac|dc)$/i.test(word)) return word.toUpperCase()
      if (/^bab$/i.test(word)) return 'Bab'
      if (/^\d+$/.test(word)) return word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function titleFromFilename(filename, subject, className) {
  const aliases = [
    subject,
    subject.replace(' dan Budi Pekerti', ''),
    subject.replace('Pendidikan Jasmani, Olahraga, dan Kesehatan', 'PJOK'),
    subject.replace('Pendidikan Agama Islam dan Budi Pekerti', 'PAI'),
    subject.replace('Pendidikan Pancasila', 'PKN'),
    subject.replace('Matematika Umum', 'Matematika'),
    subject.replace('Bahasa Inggris', 'English'),
    subject.replace('Bahasa Inggris Tingkat Lanjut', 'Bahasa Inggris TL'),
    subject.replace('Bahasa Inggris Tingkat Lanjut', 'Advanced English'),
  ].filter(Boolean)

  let title = humanize(filename)
  for (const alias of aliases) {
    title = title.replace(new RegExp(`^${escapeRegExp(humanize(alias))}\\s+`, 'i'), '')
  }

  title = title
    .replace(new RegExp(`^${escapeRegExp(className)}\\s+`, 'i'), '')
    .replace(/^(Kelas\s*)?(XII|XI|X|12|11|10)\s+/i, '')
    .replace(/^SMA\s+/i, '')
    .replace(/^Materi\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()

  return title || humanize(filename)
}

function inferGrade(text, subject) {
  const value = String(text || '').toLowerCase()
  if (/(^|[^a-z0-9])(xii|kelas\s*12|kelas\s*xii)([^a-z0-9]|$)/.test(value)) return 'xii'
  if (/(^|[^a-z0-9])(xi|kelas\s*11|kelas\s*xi)([^a-z0-9]|$)/.test(value)) return 'xi'
  if (/(^|[^a-z0-9])(x|kelas\s*10|kelas\s*x)([^a-z0-9]|$)/.test(value)) return 'x'
  if (subject === 'Bahasa Inggris Tingkat Lanjut') return 'xi'
  return 'x'
}

function topicFromTitle(title) {
  return title
    .replace(/^(Bahasa|Indonesia|Inggris|Matematika|Fisika|Kimia|Biologi|Ekonomi|Geografi|Sosiologi|Sejarah|PJOK|PKN|PAI|Informatika)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractSubject(entryParts) {
  const subjectDir = normalizeSubjectDir(entryParts[1])
  return subjectMap.get(subjectDir) || humanize(entryParts[1] || 'Materi')
}

function materialEntryFromZipEntry(entry, index, usedPaths, usedIds) {
  const parts = entry.split('/')
  const filename = parts.at(-1)
  const subject = extractSubject(parts)
  const gradeText = `${parts.slice(2, -1).join(' ')} ${filename}`
  const gradeKey = inferGrade(gradeText, subject)
  const className = gradeNames[gradeKey]
  const title = titleFromFilename(filename, subject, className)
  const subjectSlug = slugify(subject)
  const gradeSlug = slugify(className)
  const baseSlug = slugify(filename.replace(/\.html$/i, ''))
  let relativePath = posix.join('/materials/imported', subjectSlug, gradeSlug, `${baseSlug}.html`)
  let id = `school-${subjectSlug}-${gradeSlug}-${baseSlug}`
  let duplicate = 2

  while (usedPaths.has(relativePath) || usedIds.has(id)) {
    relativePath = posix.join('/materials/imported', subjectSlug, gradeSlug, `${baseSlug}-${duplicate}.html`)
    id = `school-${subjectSlug}-${gradeSlug}-${baseSlug}-${duplicate}`
    duplicate += 1
  }

  usedPaths.add(relativePath)
  usedIds.add(id)

  return {
    id,
    title,
    description: `${subject} ${className}: ${title}. Materi HTML interaktif dari paket sekolah.`,
    content: relativePath,
    subject,
    className,
    topic: topicFromTitle(title) || title,
    type: 'HTML',
    status: 'Publish',
    progress: 0,
    teacher: 'Tim SMA Negeri 6 Pangkajene dan Kepulauan',
    lightweight: true,
    source: 'school-content',
    sourceOrder: index + 1,
  }
}

function makeDataModule(materials) {
  const body = [
    'const bySubject = (subject) => schoolMaterials.filter((item) => item.subject === subject)',
    'const bySubjectGrade = (subject, className) => schoolMaterials.filter((item) => item.subject === subject && item.className === className)',
    '',
  ]

  for (const [prefix, subject] of subjectExportMap) {
    body.push(`export const ${prefix}Grade10Materials = bySubjectGrade(${JSON.stringify(subject)}, 'Kelas X')`)
    body.push(`export const ${prefix}Grade11Materials = bySubjectGrade(${JSON.stringify(subject)}, 'Kelas XI')`)
    body.push(`export const ${prefix}Grade12Materials = bySubjectGrade(${JSON.stringify(subject)}, 'Kelas XII')`)
    body.push(`export const ${prefix}Materials = bySubject(${JSON.stringify(subject)})`)
    body.push('')
  }

  return [
    '// Generated by scripts/import-school-materials.mjs. Do not edit this list manually.',
    `export const schoolMaterials = ${JSON.stringify(materials, null, 2)}`,
    '',
    ...body,
  ].join('\n')
}

const listing = execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
const htmlEntries = listing
  .split(/\r?\n/)
  .filter((entry) => entry.endsWith('.html'))
  .filter((entry) => !entry.startsWith('__MACOSX/'))
  .filter((entry) => !entry.split('/').at(-1).startsWith('._'))

const usedPaths = new Set()
const usedIds = new Set()
const materials = htmlEntries.map((entry, index) => {
  const item = materialEntryFromZipEntry(entry, index, usedPaths, usedIds)
  const destination = `public${item.content}`
  mkdirSync(dirname(destination), { recursive: true })
  const bytes = execFileSync('unzip', ['-p', zipPath, entry], { maxBuffer: 64 * 1024 * 1024 })
  writeFileSync(destination, bytes)
  return item
})

materials.sort((left, right) => (
  left.subject.localeCompare(right.subject, 'id-ID')
  || left.className.localeCompare(right.className, 'id-ID')
  || left.sourceOrder - right.sourceOrder
))

writeFileSync(dataFile, makeDataModule(materials))

const summary = materials.reduce((accumulator, item) => {
  const key = `${item.subject} | ${item.className}`
  accumulator[key] = (accumulator[key] || 0) + 1
  return accumulator
}, {})

console.log(`Imported ${materials.length} HTML materials from ${zipPath}`)
Object.entries(summary)
  .sort(([left], [right]) => left.localeCompare(right, 'id-ID'))
  .forEach(([key, count]) => console.log(`${key}: ${count}`))
