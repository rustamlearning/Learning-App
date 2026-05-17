const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.GROQ_API_KEY) {
    return response.status(503).json({ error: 'GROQ_API_KEY belum dikonfigurasi di server.' })
  }

  try {
    const body = request.body || {}
    const action = body.action || 'askTutor'
    const messages = buildMessages(action, body)

    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: action === 'generateQuestions' ? 0.35 : 0.45,
        max_tokens: action === 'generateQuestions' ? 1200 : 700,
      }),
    })

    const data = await groqResponse.json()
    if (!groqResponse.ok) {
      return response.status(groqResponse.status).json({ error: data?.error?.message || 'Groq request failed.' })
    }

    return response.status(200).json({
      content: data?.choices?.[0]?.message?.content || '',
      model: data?.model || DEFAULT_MODEL,
    })
  } catch (error) {
    return response.status(500).json({ error: error.message || 'AI service failed.' })
  }
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
