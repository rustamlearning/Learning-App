import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, posix } from 'node:path'

const zipPath = process.argv[2] || '/Users/rustammacbook/Downloads/MATERI LENGKAP SETIAP MAPEL.zip'
const outputRoot = 'public/materials/imported'
const dataFile = 'src/data/englishMaterials.js'
const metadataOnly = process.argv.includes('--metadata-only')

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
    .replace(/\b(revisi|fixed|final|singlefile|single|interaktif|interactive|standalone|lengkap|rapi|student|siswa|tts|hidden|script|model|optimized|sticky|navigation|transparent|hero|super|submit|baru|muncul|jawaban|fullwidth|natural|quiz|pilgan|padat|pg)\b/gi, ' ')
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

function decodeHtml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
}

function stripTags(value) {
  return decodeHtml(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function romanToNumber(value) {
  const roman = String(value || '').toUpperCase()
  const table = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
    IX: 9,
    X: 10,
  }
  return table[roman] || value
}

function normalizeChapterMarker(value) {
  return String(value || '')
    .replace(/\b(bab|chapter|unit)\s+([ivx]{1,5})\b/gi, (_, label, roman) => `${label} ${romanToNumber(roman)}`)
    .replace(/\b(bab|chapter|unit)(\d{1,2})\b/gi, '$1 $2')
    .replace(/\bBab\b/gi, 'Bab')
    .replace(/\bChapter\b/gi, 'Chapter')
    .replace(/\bUnit\b/gi, 'Unit')
}

function titleCaseMaterial(value) {
  return String(value || '')
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      const trimmed = word.trim()
      if (!trimmed) return ''
      if (/^(x|xi|xii|tl|pg|sma|nkri|uud|ac|dc|spu|spltv|sptldv|sig|bep|rab|qc)$/i.test(trimmed)) return trimmed.toUpperCase()
      if (/^(dan|di|ke|dari|pada|untuk|yang|dengan|dalam|atau|serta|and|of|on|the|a|an)$/i.test(trimmed)) return trimmed.toLowerCase()
      if (/^[A-Z]{2,}$/.test(trimmed)) return trimmed
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
    })
    .join(' ')
    .replace(/\bPai\b/g, 'PAI')
    .replace(/\bPjok\b/g, 'PJOK')
    .replace(/\bPkn\b/g, 'PKN')
    .replace(/\bNkri\b/g, 'NKRI')
}

function subjectAliases(subject) {
  return [
    subject,
    subject.replace(' dan Budi Pekerti', ''),
    subject.replace('Pendidikan Jasmani, Olahraga, dan Kesehatan', 'PJOK'),
    subject.replace('Pendidikan Agama Islam dan Budi Pekerti', 'PAI'),
    subject.replace('Pendidikan Pancasila', 'PKN'),
    subject.replace('Matematika Umum', 'Matematika'),
    subject.replace('Bahasa Inggris Tingkat Lanjut', 'Bahasa Inggris TL'),
    subject.replace('Bahasa Inggris Tingkat Lanjut', 'Advanced English'),
    subject.replace('Bahasa Inggris', 'English'),
    subject.replace('Prakarya dan Kewirausahaan', 'Prakarya'),
    subject.replace('Prakarya dan Kewirausahaan', 'PKWU'),
  ].filter(Boolean)
}

function stripSubjectAndClass(value, subject, className) {
  let title = String(value || '')
  const classPattern = '(?:kelas|grade)?\\s*(?:xii|xi|x|12|11|10)'

  for (const alias of subjectAliases(subject)) {
    const aliasPattern = escapeRegExp(humanize(alias)).replace(/\\s+/g, '\\s+')
    title = title
      .replace(new RegExp(`^\\s*(?:materi\\s+)?${aliasPattern}\\s+${classPattern}\\s*[-–—:|]?\\s*`, 'i'), '')
      .replace(new RegExp(`^\\s*(?:materi\\s+)?${aliasPattern}\\s*[-–—:|]?\\s*`, 'i'), '')
      .replace(new RegExp(`\\b${aliasPattern}\\s+${classPattern}\\b`, 'gi'), '')
  }

  return title
    .replace(new RegExp(`^\\s*${escapeRegExp(className)}\\s*[-–—:|]?\\s*`, 'i'), '')
    .replace(new RegExp(`\\b${classPattern}\\b`, 'gi'), '')
    .replace(/\b(?:SMA|MA|SMK|MAK|materi)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanMaterialTitle(value, subject, className) {
  let title = normalizeChapterMarker(stripTags(value))
  const pipeSegments = title.split(/\s*\|\s*/).map((segment) => segment.trim()).filter(Boolean)
  const chapterSegment = pipeSegments.find((segment) => /\b(?:bab|chapter|unit)\s*\d{1,2}\b/i.test(segment) && !/^(?:revisi|fixed|final|lengkap)$/i.test(segment))
  if (chapterSegment) title = chapterSegment

  title = stripSubjectAndClass(title, subject, className)
    .replace(/\([^)]*(?:revisi|fixed|final|model|layout|gambar|chapter|bab|submit|jawaban)[^)]*\)/gi, ' ')
    .replace(/\s+\|\s+.*$/g, ' ')
    .replace(/\b(?:revisi|fixed|final|singlefile|single|interaktif|interactive|standalone|lengkap|rapi|student|siswa|tts|hidden|script|optimized|sticky|navigation|transparent|hero|super|natural|quiz|pilgan|padat|pg|html|v2)\b.*$/i, ' ')
    .replace(/\b(?:model|tone|like)\s+(?:bab|chapter)\s*\d{1,2}\b.*$/i, ' ')
    .replace(/\b(?:top\s*nav|ch\d+\s*tone|ukuran\s+sama|layout|image\d+|after\s+intro|fullwidth|semua\s+gambar|gambar\s+(?:jelas|realistik|terbaru|utuh|besar|masuk)|tanpa\s+(?:peta|navigasi|gambar|box|ruang|catatan)|perbaikan\s+\w+|aktivitas\s+sama\s+lebar|minilab|pembuka)\b.*$/i, ' ')
    .replace(/\s*[-–—:]\s*(?:revisi|fixed|final|html|model|layout|gambar|interactive|interaktif|jawaban|submit|muncul).*/i, ' ')
    .replace(/\s*[-–—:]\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return (titleCaseMaterial(title) || titleCaseMaterial(humanize(value)))
    .replace(/\bnkri\b/gi, 'NKRI')
}

function titleFromHtml(html, subject, className) {
  const candidates = [
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1],
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1],
  ]
    .map((candidate) => cleanMaterialTitle(candidate, subject, className))
    .filter(Boolean)

  const explicitChapter = candidates.find((candidate) => /\b(?:Bab|Chapter|Unit)\s+\d{1,2}\b/.test(candidate))
  return explicitChapter || candidates[0] || ''
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function titleFromFilename(filename, subject, className) {
  let title = humanize(filename)
  for (const alias of subjectAliases(subject)) {
    title = title.replace(new RegExp(`^${escapeRegExp(humanize(alias))}\\s+`, 'i'), '')
  }

  title = title
    .replace(new RegExp(`^${escapeRegExp(className)}\\s+`, 'i'), '')
    .replace(/^(Kelas\s*)?(XII|XI|X|12|11|10)\s+/i, '')
    .replace(/^SMA\s+/i, '')
    .replace(/^Materi\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()

  return cleanMaterialTitle(title || humanize(filename), subject, className)
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

function materialEntryFromZipEntry(entry, index, usedPaths, usedIds, html) {
  const parts = entry.split('/')
  const filename = parts.at(-1)
  const subject = extractSubject(parts)
  const gradeText = `${parts.slice(2, -1).join(' ')} ${filename}`
  const gradeKey = inferGrade(gradeText, subject)
  const className = gradeNames[gradeKey]
  const title = titleFromHtml(html, subject, className) || titleFromFilename(filename, subject, className)
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
  const bytes = execFileSync('unzip', ['-p', zipPath, entry], { maxBuffer: 64 * 1024 * 1024 })
  const html = bytes.toString('utf8')
  const item = materialEntryFromZipEntry(entry, index, usedPaths, usedIds, html)
  if (!metadataOnly) {
    const destination = `public${item.content}`
    mkdirSync(dirname(destination), { recursive: true })
    writeFileSync(destination, bytes)
  }
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
