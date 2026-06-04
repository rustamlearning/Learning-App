const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const OPENROUTER_DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free'
const OPENROUTER_FALLBACK_MODEL = process.env.OPENROUTER_FALLBACK_MODEL || 'openai/gpt-oss-20b:free'
const GROQ_DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
const GROQ_FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct'
const OPENROUTER_ENABLED = process.env.OPENROUTER_ENABLED === 'true'
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
const REQUIRE_AUTH = process.env.AI_REQUIRE_AUTH === 'true' || (SUPABASE_CONFIGURED && process.env.AI_REQUIRE_AUTH !== 'false')
const MAX_PROMPT_CHARS = Number(process.env.AI_MAX_PROMPT_CHARS || 6000)
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 22000)
const RATE_LIMIT_MAX = Number(process.env.AI_RATE_LIMIT_MAX || 24)
const RATE_LIMIT_WINDOW_MS = Number(process.env.AI_RATE_LIMIT_WINDOW_MS || 60_000)
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const REMOTE_RATE_LIMIT_CONFIGURED = Boolean(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN)
const rateLimitStore = new Map()
const allowedActions = new Set(['askTutor', 'generateQuestions', 'summarizeMaterial', 'generateFlashcards'])

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const providers = getConfiguredProviders()

  if (providers.length === 0) {
    return response.status(503).json({ error: 'GROQ_API_KEY belum dikonfigurasi di server.' })
  }

  try {
    const auth = await authenticateRequest(request)

    if (REQUIRE_AUTH && !auth.user) {
      return response.status(401).json({ error: 'Login diperlukan untuk menggunakan AI.' })
    }

    const rateKey = auth.user?.id || getClientIp(request)
    if (!(await checkRateLimit(rateKey))) {
      return response.status(429).json({ error: 'Terlalu banyak permintaan AI. Coba lagi sebentar.' })
    }

    const body = normalizeBody(request.body)
    const action = body.action || 'askTutor'

    if (!allowedActions.has(action)) {
      return response.status(400).json({ error: 'Action AI tidak dikenal.' })
    }

    if (auth.profile && action === 'generateQuestions' && !['guru', 'admin'].includes(auth.profile.role)) {
      return response.status(403).json({ error: 'Hanya guru dan admin yang dapat memakai AI Generator.' })
    }

    const messages = buildMessages(action, body)
    const lastError = { status: 502, message: 'AI service request failed.' }

    for (const provider of providers) {
      const models = uniqueModels([provider.model, provider.fallbackModel])

      for (const model of models) {
        const { aiResponse, data } = await requestAIProvider({ provider, model, messages, action })

        if (aiResponse.ok) {
          return response.status(200).json({
            content: data?.choices?.[0]?.message?.content || '',
            model: data?.model || model,
            provider: provider.name,
          })
        }

        lastError.status = aiResponse.status
        lastError.message = data?.error?.message || `${provider.name} request failed.`

        if (!shouldRetryWithFallback(aiResponse.status)) {
          break
        }
      }
    }

    return response.status(lastError.status).json({ error: lastError.message })
  } catch (error) {
    return response.status(500).json({ error: error.message || 'AI service failed.' })
  }
}

async function requestAIProvider({ provider, model, messages, action }) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

  const aiResponse = await fetch(provider.apiUrl, {
    method: 'POST',
    headers: provider.headers,
    signal: controller.signal,
    body: JSON.stringify({
      model,
      messages,
      temperature: action === 'generateQuestions' ? 0.35 : 0.45,
      max_tokens: action === 'generateQuestions' ? 1200 : 700,
    }),
  }).finally(() => clearTimeout(timeout))

  return {
    aiResponse,
    data: await parseJsonResponse(aiResponse),
  }
}

async function parseJsonResponse(aiResponse) {
  const text = await aiResponse.text()

  try {
    return JSON.parse(text)
  } catch (error) {
    return { error: { message: text || 'AI service returned an unreadable response.' } }
  }
}

function shouldRetryWithFallback(status) {
  return [400, 403, 404, 408, 422, 429, 500, 502, 503].includes(status)
}

function getConfiguredProviders() {
  const providers = []

  if (process.env.GROQ_API_KEY) {
    providers.push({
      name: 'Groq',
      apiUrl: GROQ_API_URL,
      model: GROQ_DEFAULT_MODEL,
      fallbackModel: GROQ_FALLBACK_MODEL,
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })
  }

  if (OPENROUTER_ENABLED && process.env.OPENROUTER_API_KEY) {
    providers.push({
      name: 'OpenRouter',
      apiUrl: OPENROUTER_API_URL,
      model: OPENROUTER_DEFAULT_MODEL,
      fallbackModel: OPENROUTER_FALLBACK_MODEL,
      headers: getOpenRouterHeaders(),
    })
  }

  return providers
}

function getOpenRouterHeaders() {
  const headers = {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'X-OpenRouter-Title': process.env.OPENROUTER_APP_NAME || 'IsleLearn App',
  }

  const siteUrl = getOpenRouterSiteUrl()

  if (siteUrl) {
    headers['HTTP-Referer'] = siteUrl
  }

  return headers
}

function getOpenRouterSiteUrl() {
  if (process.env.OPENROUTER_SITE_URL) return process.env.OPENROUTER_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  return 'http://localhost:5173'
}

function uniqueModels(models) {
  return [...new Set(models.filter(Boolean))]
}

function normalizeBody(body) {
  if (!body) return {}
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch (error) {
      return {}
    }
  }

  return body
}

async function authenticateRequest(request) {
  const token = getBearerToken(request)
  if (!token || !SUPABASE_CONFIGURED) return { user: null, profile: null }

  try {
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    })

    if (!userResponse.ok) return { user: null, profile: null }

    const user = await userResponse.json()
    const profile = await fetchProfileForAuthUser(user.id, token)
    return { user, profile }
  } catch (error) {
    return { user: null, profile: null }
  }
}

async function fetchProfileForAuthUser(authUserId, token) {
  const query = new URLSearchParams({
    auth_user_id: `eq.${authUserId}`,
    select: 'id,role,status',
    limit: '1',
  })
  const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/users_profile?${query.toString()}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  })

  if (!profileResponse.ok) return null
  const rows = await profileResponse.json()
  return rows?.[0] || null
}

function getBearerToken(request) {
  const header = request.headers.authorization || request.headers.Authorization || ''
  const match = String(header).match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || ''
}

async function checkRateLimit(key) {
  if (REMOTE_RATE_LIMIT_CONFIGURED) {
    try {
      return await checkRemoteRateLimit(key)
    } catch (error) {
      return checkMemoryRateLimit(key)
    }
  }

  return checkMemoryRateLimit(key)
}

async function checkRemoteRateLimit(key) {
  const redisKey = `islelearn:ai-rate:${sanitizeRateLimitKey(key)}`
  const initialized = await redisCommand(['SET', redisKey, '1', 'PX', RATE_LIMIT_WINDOW_MS, 'NX'])

  if (initialized === 'OK') return true

  const count = Number(await redisCommand(['INCR', redisKey]))
  if (count === 1) await redisCommand(['PEXPIRE', redisKey, RATE_LIMIT_WINDOW_MS])

  return count <= RATE_LIMIT_MAX
}

async function redisCommand(command) {
  const redisUrl = UPSTASH_REDIS_REST_URL.replace(/\/$/, '')
  const redisResponse = await fetch(redisUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  })
  const data = await parseJsonResponse(redisResponse)

  if (!redisResponse.ok || data?.error) {
    throw new Error(data?.error || 'Redis rate limit request failed.')
  }

  return data?.result
}

function sanitizeRateLimitKey(key) {
  return String(key || 'anonymous').replace(/[^\w:.-]/g, '_').slice(0, 120)
}

function checkMemoryRateLimit(key) {
  const now = Date.now()
  const current = rateLimitStore.get(key)

  cleanupRateLimits(now)

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (current.count >= RATE_LIMIT_MAX) return false

  current.count += 1
  return true
}

function cleanupRateLimits(now) {
  if (rateLimitStore.size < 500) return
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) rateLimitStore.delete(key)
  }
}

function getClientIp(request) {
  const forwarded = request.headers['x-forwarded-for'] || request.headers['X-Forwarded-For']
  return String(forwarded || request.socket?.remoteAddress || 'anonymous').split(',')[0].trim()
}

function limitText(value, fallback = '') {
  return String(value || fallback).slice(0, MAX_PROMPT_CHARS)
}

function buildMessages(action, body) {
  if (action === 'generateQuestions') {
    const options = body.options || {}
    return [
      {
        role: 'system',
        content: 'Anda adalah AI Generator untuk guru SMA. Buat output edukatif, aman, ringkas, dan siap dipakai. Jangan membuat konten berbahaya.',
      },
      {
        role: 'user',
        content: limitText(`Buat ${options.total || 3} soal ${options.type || 'pilihan ganda'} untuk ${options.subject || 'Bahasa Inggris'}, kelas ${options.className || 'X.1'}, topik ${options.topic || 'Descriptive Text'}, level ${options.level || 'Sedang'}. Formatkan dengan nomor, opsi, kunci jawaban, dan pembahasan singkat.`),
      },
    ]
  }

  if (action === 'summarizeMaterial') {
    return [
      {
        role: 'system',
        content: 'Anda adalah AI Tutor IsleLearn. Ringkas materi untuk siswa SMA dengan bahasa sederhana, bertahap, dan mudah dibaca di HP.',
      },
      { role: 'user', content: limitText(body.text, 'Ringkas materi ini.') },
    ]
  }

  if (action === 'generateFlashcards') {
    return [
      {
        role: 'system',
        content: 'Anda adalah pembuat flashcard belajar. Buat flashcard ringkas dengan format Front: ... Back: ...',
      },
      { role: 'user', content: limitText(body.text, 'Buat flashcard dari materi ini.') },
    ]
  }

  return [
    {
      role: 'system',
      content: 'Anda adalah AI Tutor IsleLearn untuk siswa SMA. Jelaskan konsep bertahap, edukatif, dan aman. Jangan memberi jawaban langsung untuk ujian aktif; bantu siswa memahami cara berpikirnya.',
    },
    { role: 'user', content: limitText(body.prompt, 'Jelaskan materi ini.') },
  ]
}
