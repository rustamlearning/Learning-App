const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const RESET_LIMIT = 10
const RESET_WINDOW_MS = 60_000
const resetRateLimits = new Map()

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return response.status(503).json({
      error: 'Reset password admin belum dikonfigurasi. Tambahkan SUPABASE_SERVICE_ROLE_KEY di Vercel.',
    })
  }

  try {
    const token = getBearerToken(request)
    if (!token) return response.status(401).json({ error: 'Sesi admin tidak tersedia.' })

    const admin = await authenticateAdmin(token)
    if (!admin) return response.status(403).json({ error: 'Hanya admin aktif yang dapat mereset password guru.' })
    if (!checkResetRateLimit(admin.id)) {
      return response.status(429).json({ error: 'Terlalu banyak reset password. Coba lagi satu menit.' })
    }

    const body = normalizeBody(request.body)
    const profileId = String(body.profileId || '').trim()
    const password = String(body.password || '').trim()

    if (!isUuid(profileId)) return response.status(400).json({ error: 'ID profil guru tidak valid.' })
    if (!isStrongPassword(password)) {
      return response.status(400).json({ error: 'Password minimal 8 karakter dan harus memuat huruf serta angka.' })
    }

    const teacherProfile = await getTeacherProfile(profileId)
    if (!teacherProfile) return response.status(404).json({ error: 'Profil guru tidak ditemukan.' })
    if (!teacherProfile.email) return response.status(400).json({ error: 'Email guru belum tersedia.' })

    const teacherRecord = await getTeacherRecord(profileId)
    const normalizedNip = normalizeNip(teacherRecord?.nip)
    if (normalizedNip && password === normalizedNip) {
      return response.status(400).json({ error: 'Password baru tidak boleh sama dengan NIP.' })
    }

    let authUserId = teacherProfile.auth_user_id
    let created = false

    if (!authUserId) {
      const existingUser = await findAuthUserByEmail(teacherProfile.email)
      authUserId = existingUser?.id

      if (!authUserId) {
        const createdUser = await serviceRequest('/auth/v1/admin/users', {
          method: 'POST',
          body: {
            email: teacherProfile.email,
            password,
            email_confirm: true,
            user_metadata: {
              name: teacherProfile.name,
              role: 'guru',
              profile_id: teacherProfile.id,
            },
          },
        })
        authUserId = createdUser?.id || createdUser?.user?.id
        created = true
      }
    }

    if (!authUserId) throw new Error('Supabase Auth tidak mengembalikan ID pengguna guru.')

    await serviceRequest(`/auth/v1/admin/users/${encodeURIComponent(authUserId)}`, {
      method: 'PUT',
      body: { password },
    })

    await linkTeacherProfile(teacherProfile.id, authUserId)
    if (normalizedNip) {
      await upsertTeacherLoginAlias({
        profileId: teacherProfile.id,
        username: normalizedNip,
        email: teacherProfile.email,
      })
    }

    return response.status(200).json({
      success: true,
      authUserId,
      created,
      message: created ? 'Akun Auth guru dibuat dan password ditetapkan.' : 'Password guru berhasil direset.',
    })
  } catch (error) {
    const status = Number(error?.status) || 500
    const safeStatus = status >= 400 && status < 600 ? status : 500
    return response.status(safeStatus).json({ error: error.message || 'Reset password guru gagal.' })
  }
}

async function authenticateAdmin(token) {
  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  })
  if (!userResponse.ok) return null

  const user = await userResponse.json()
  const query = new URLSearchParams({
    auth_user_id: `eq.${user.id}`,
    role: 'eq.admin',
    status: 'eq.Aktif',
    select: 'id,role,status',
    limit: '1',
  })
  const profiles = await serviceRequest(`/rest/v1/users_profile?${query.toString()}`)
  return profiles?.[0] || null
}

async function getTeacherProfile(profileId) {
  const query = new URLSearchParams({
    id: `eq.${profileId}`,
    role: 'eq.guru',
    select: 'id,auth_user_id,name,email,role,status',
    limit: '1',
  })
  const rows = await serviceRequest(`/rest/v1/users_profile?${query.toString()}`)
  return rows?.[0] || null
}

async function getTeacherRecord(profileId) {
  const query = new URLSearchParams({
    user_id: `eq.${profileId}`,
    select: 'id,nip',
    limit: '1',
  })
  const rows = await serviceRequest(`/rest/v1/teachers?${query.toString()}`)
  return rows?.[0] || null
}

async function findAuthUserByEmail(email) {
  const targetEmail = String(email || '').trim().toLowerCase()

  for (let page = 1; page <= 5; page += 1) {
    const data = await serviceRequest(`/auth/v1/admin/users?page=${page}&per_page=1000`)
    const users = Array.isArray(data?.users) ? data.users : []
    const match = users.find((user) => String(user.email || '').toLowerCase() === targetEmail)
    if (match) return match
    if (users.length < 1000) break
  }

  return null
}

async function linkTeacherProfile(profileId, authUserId) {
  await serviceRequest(`/rest/v1/users_profile?id=eq.${encodeURIComponent(profileId)}`, {
    method: 'PATCH',
    body: { auth_user_id: authUserId },
    headers: { Prefer: 'return=minimal' },
  })
}

async function upsertTeacherLoginAlias({ profileId, username, email }) {
  await serviceRequest('/rest/v1/login_aliases?on_conflict=username', {
    method: 'POST',
    body: { profile_id: profileId, username, email: email.toLowerCase(), role: 'guru' },
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
  })
}

async function serviceRequest(path, { method = 'GET', body, headers = {} } = {}) {
  const supabaseResponse = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await supabaseResponse.text()
  let data = null

  try {
    data = text ? JSON.parse(text) : null
  } catch (error) {
    data = null
  }

  if (!supabaseResponse.ok) {
    const requestError = new Error(
      data?.error_description || data?.msg || data?.message || 'Permintaan Supabase gagal.',
    )
    requestError.status = supabaseResponse.status
    throw requestError
  }

  return data
}

function getBearerToken(request) {
  const header = request.headers.authorization || request.headers.Authorization || ''
  return String(header).match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || ''
}

function normalizeBody(body) {
  if (!body) return {}
  if (typeof body !== 'string') return body
  try {
    return JSON.parse(body)
  } catch (error) {
    return {}
  }
}

function normalizeNip(value) {
  return String(value || '').trim().replace(/\s+/g, '')
}

function isStrongPassword(value) {
  return value.length >= 8 && /[a-zA-Z]/.test(value) && /\d/.test(value)
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function checkResetRateLimit(adminId) {
  const now = Date.now()
  const current = resetRateLimits.get(adminId)
  if (!current || now - current.startedAt >= RESET_WINDOW_MS) {
    resetRateLimits.set(adminId, { count: 1, startedAt: now })
    return true
  }
  if (current.count >= RESET_LIMIT) return false
  current.count += 1
  return true
}
