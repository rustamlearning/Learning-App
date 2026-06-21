export function isExternalMaterialType(type) {
  return ['Link', 'Video', 'Audio', 'PDF', 'Dokumen', 'Document', 'Presentasi', 'Spreadsheet', 'Embed'].includes(type)
}

export function isHtmlMaterialType(type) {
  return type === 'HTML'
}

export function isLinkedMaterialType(type) {
  return isExternalMaterialType(type) || isHtmlMaterialType(type)
}

export function isValidMaterialUrl(value) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch (error) {
    return false
  }
}

export function isValidMaterialPath(value) {
  const path = String(value || '').trim()
  return /^\/materials\/[\w./%()\-]+\.html(?:[?#].*)?$/i.test(path) && !path.includes('..')
}

export function isValidLinkedMaterial(value, type) {
  if (isHtmlMaterialType(type)) return isValidMaterialPath(value) || isValidMaterialUrl(value)
  if (isExternalMaterialType(type)) return isValidMaterialUrl(value)
  return true
}
