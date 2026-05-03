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

async function request(path, { method = 'GET', body, accessToken, headers = {} } = {}) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.')
  }

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = data?.error_description || data?.msg || data?.message || 'Request Supabase gagal.'
    throw new Error(message)
  }

  return data
}

export async function signInWithPassword(email, password) {
  return request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: { email, password },
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

export async function getLoginEmailByIdentifier(identifier) {
  const normalized = normalizeLoginIdentifier(identifier)
  if (!normalized || normalized.includes('@')) return normalized

  const query = new URLSearchParams({
    username: `eq.${normalized}`,
    select: 'email',
    limit: '1',
  })
  const rows = await request(`/rest/v1/login_aliases?${query.toString()}`)
  return rows?.[0]?.email || normalized
}

export async function listRows(tableName, { select = '*', filters = {}, accessToken } = {}) {
  const query = new URLSearchParams({ select })
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, `eq.${value}`)
  })
  return request(`/rest/v1/${tableName}?${query.toString()}`, { accessToken })
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
