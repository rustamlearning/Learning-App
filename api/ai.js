const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const OPENROUTER_DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free'
const OPENROUTER_FALLBACK_MODEL = process.env.OPENROUTER_FALLBACK_MODEL || 'openai/gpt-oss-20b:free'
const GROQ_DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
const GROQ_FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct'
const OPENROUTER_ENABLED = process.env.OPENROUTER_ENABLED === 'true'

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
    const body = normalizeBody(request.body)
    const action = body.action || 'askTutor'
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
  const aiResponse = await fetch(provider.apiUrl, {
    method: 'POST',
    headers: provider.headers,
    body: JSON.stringify({
      model,
      messages,
      temperature: action === 'generateQuestions' ? 0.35 : 0.45,
      max_tokens: action === 'generateQuestions' ? 1200 : 700,
    }),
  })

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
        content: `Buat ${options.total || 3} soal ${options.type || 'pilihan ganda'} untuk ${options.subject || 'Bahasa Inggris'}, kelas ${options.className || 'X.1'}, topik ${options.topic || 'Descriptive Text'}, level ${options.level || 'Sedang'}. Formatkan dengan nomor, opsi, kunci jawaban, dan pembahasan singkat.`,
      },
    ]
  }

  if (action === 'summarizeMaterial') {
    return [
      {
        role: 'system',
        content: 'Anda adalah AI Tutor IsleLearn. Ringkas materi untuk siswa SMA dengan bahasa sederhana, bertahap, dan mudah dibaca di HP.',
      },
      { role: 'user', content: body.text || 'Ringkas materi ini.' },
    ]
  }

  if (action === 'generateFlashcards') {
    return [
      {
        role: 'system',
        content: 'Anda adalah pembuat flashcard belajar. Buat flashcard ringkas dengan format Front: ... Back: ...',
      },
      { role: 'user', content: body.text || 'Buat flashcard dari materi ini.' },
    ]
  }

  return [
    {
      role: 'system',
      content: 'Anda adalah AI Tutor IsleLearn untuk siswa SMA. Jelaskan konsep bertahap, edukatif, dan aman. Jangan memberi jawaban langsung untuk ujian aktif; bantu siswa memahami cara berpikirnya.',
    },
    { role: 'user', content: body.prompt || 'Jelaskan materi ini.' },
  ]
}
