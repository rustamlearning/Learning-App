const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

export function getSupabaseConfig() {
  return {
    url: SUPABASE_URL,
    hasAnonKey: Boolean(SUPABASE_ANON_KEY),
  }
}

const DEFAULT_REQUEST_TIMEOUT_MS = 20000

async function request(path, { method = 'GET', body, accessToken, headers = {}, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS } = {}) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.')
  }

  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs)
  let response

  try {
    response = await fetch(`${SUPABASE_URL}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Request Supabase terlalu lama merespons. Data lokal tetap aman.')
    }
    throw error
  } finally {
    globalThis.clearTimeout(timeout)
  }

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = data?.error_description || data?.msg || data?.message || 'Request Supabase gagal.'
    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

export async function signInWithPassword(email, password) {
  return request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: { email, password },
  })
}

export async function refreshSession(refreshToken) {
  if (!refreshToken) {
    throw new Error('Sesi login sudah berakhir. Silakan masuk ulang.')
  }

  return request('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: { refresh_token: refreshToken },
  })
}

export async function signOut(accessToken) {
  return request('/auth/v1/logout', {
    method: 'POST',
    accessToken,
  })
}

export async function getCurrentAuthUser(accessToken) {
  return request('/auth/v1/user', { accessToken })
}

export async function getProfileByAuthUserId(authUserId, accessToken) {
  const query = new URLSearchParams({
    auth_user_id: `eq.${authUserId}`,
    select: '*',
    limit: '1',
  })
  const rows = await request(`/rest/v1/users_profile?${query.toString()}`, { accessToken })
  return rows?.[0] || null
}

export async function getLoginEmailsByIdentifier(identifier) {
  const normalized = normalizeLoginIdentifier(identifier)
  if (!normalized) return []
  if (normalized.includes('@')) return [normalized]

  const resolvedEmails = await resolveLoginEmailAliases(normalized)
  if (resolvedEmails.length) return uniqueLoginEmails(resolvedEmails)

  const query = new URLSearchParams({
    username: `eq.${normalized}`,
    select: 'email',
  })
  const rows = await request(`/rest/v1/login_aliases?${query.toString()}`)
  const aliasEmails = rows?.map((row) => row.email).filter(Boolean) || []
  return uniqueLoginEmails(aliasEmails.length ? aliasEmails : [normalized])
}

export async function getLoginEmailByIdentifier(identifier) {
  const emails = await getLoginEmailsByIdentifier(identifier)
  return emails[0] || normalizeLoginIdentifier(identifier)
}

async function resolveLoginEmailAliases(identifier) {
  try {
    const rows = await request('/rest/v1/rpc/resolve_login_email', {
      method: 'POST',
      body: { login_identifier: identifier },
    })

    return rows?.map((row) => row.email).filter(Boolean) || []
  } catch (error) {
    return []
  }
}

function uniqueLoginEmails(emails) {
  const seen = new Set()
  return emails
    .map((email) => String(email || '').trim().toLowerCase())
    .filter((email) => {
      if (!email || !email.includes('@') || seen.has(email)) return false
      seen.add(email)
      return true
    })
}

export async function listRows(tableName, { select = '*', filters = {}, accessToken } = {}) {
  const query = new URLSearchParams({ select })
  Object.entries(filters).forEach(([key, value]) => {
    const expression = buildFilterExpression(value)
    if (expression) query.set(key, expression)
  })
  return request(`/rest/v1/${tableName}?${query.toString()}`, { accessToken })
}

function buildFilterExpression(value) {
  if (value === undefined || value === null || value === '') return ''
  if (Array.isArray(value)) return `in.(${value.join(',')})`
  if (typeof value === 'object') {
    if (Array.isArray(value.values)) return `${value.operator || 'in'}.(${value.values.join(',')})`
    if (value.operator && value.value !== undefined && value.value !== null && value.value !== '') {
      return `${value.operator}.${value.value}`
    }
  }
  return `eq.${value}`
}

export async function createRow(tableName, payload, accessToken) {
  return request(`/rest/v1/${tableName}`, {
    method: 'POST',
    body: payload,
    accessToken,
    headers: { Prefer: 'return=representation' },
  })
}

export async function updateRow(tableName, id, payload, accessToken) {
  return request(`/rest/v1/${tableName}?id=eq.${id}`, {
    method: 'PATCH',
    body: payload,
    accessToken,
    headers: { Prefer: 'return=representation' },
  })
}

export async function deleteRow(tableName, id, accessToken) {
  return request(`/rest/v1/${tableName}?id=eq.${id}`, {
    method: 'DELETE',
    accessToken,
  })
}

export async function deleteRows(tableName, filters = {}, accessToken) {
  const query = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, `eq.${value}`)
  })
  return request(`/rest/v1/${tableName}?${query.toString()}`, {
    method: 'DELETE',
    accessToken,
  })
}

export function normalizeLoginIdentifier(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export function isJwtExpiredError(error) {
  return /jwt expired/i.test(String(error?.message || ''))
}
