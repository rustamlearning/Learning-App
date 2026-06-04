import { stat } from 'node:fs/promises'
import { join } from 'node:path'
import { schoolMaterials } from '../src/data/englishMaterials.js'

const projectRoot = new URL('..', import.meta.url)
const materialSizeWarnBytes = 4 * 1024 * 1024
const errors = []
const warnings = []

for (const item of schoolMaterials) {
  if (!item.id || !item.title || !item.subject || !item.className) {
    errors.push(`Metadata materi tidak lengkap: ${item.id || item.title || '(tanpa id)'}`)
  }

  if (item.type === 'HTML') {
    const content = String(item.content || '')
    if (!/^\/materials\/[\w./%()\-]+\.html(?:[?#].*)?$/i.test(content) || content.includes('..')) {
      errors.push(`Path HTML tidak valid untuk ${item.id}: ${content}`)
      continue
    }

    const filePath = join(projectRoot.pathname, 'public', content)

    try {
      const info = await stat(filePath)
      if (info.size > materialSizeWarnBytes) {
        warnings.push(`${content} ${(info.size / 1024 / 1024).toFixed(1)} MB`)
      }
    } catch (error) {
      errors.push(`File materi tidak ditemukan untuk ${item.id}: ${content}`)
    }
  }
}

if (warnings.length > 0) {
  console.warn(`Peringatan: ${warnings.length} file materi lebih besar dari 4 MB.`)
  warnings.slice(0, 8).forEach((item) => console.warn(`- ${item}`))
}

if (errors.length > 0) {
  console.error(`Smoke test gagal: ${errors.length} masalah ditemukan.`)
  errors.slice(0, 20).forEach((item) => console.error(`- ${item}`))
  process.exit(1)
}

console.log(`Smoke test berhasil: ${schoolMaterials.length} materi terdaftar dan file HTML tersedia.`)
