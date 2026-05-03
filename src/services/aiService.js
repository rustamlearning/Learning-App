export async function askTutor(prompt) {
  const live = await callAiEndpoint('askTutor', { prompt })
  if (live) return { role: 'assistant', content: live.content }

  await wait(280)
  const topic = prompt || 'materi ini'
  return {
    role: 'assistant',
    content: `${topic.includes('descriptive') || topic.includes('Descriptive')
      ? 'Descriptive text adalah teks yang menjelaskan seseorang, tempat, benda, atau hewan secara detail. Struktur umumnya adalah identification dan description.'
      : `Baik, kita bahas "${topic}" bertahap. Mulai dari konsep inti, contoh sederhana, lalu latihan singkat.`
    }\n\nAku tidak akan memberi jawaban ujian aktif, tapi aku bisa bantu kamu memahami langkah berpikirnya.`,
  }
}

export async function generateQuestions(options = {}) {
  const live = await callAiEndpoint('generateQuestions', { options })
  if (live) return parseGeneratedQuestions(live.content)

  await wait(320)
  const topic = options.topic || 'Descriptive Text'
  const subject = options.subject || 'Bahasa Inggris'
  const total = Number(options.total || 3)
  return Array.from({ length: total }).map((_, index) => ({
    question: `${index + 1}. Which statement best describes ${topic}?`,
    options: ['It explains details clearly', 'It lists random facts', 'It only tells opinions', 'It gives instructions'],
    answer: 'It explains details clearly',
    explanation: `Dalam ${subject}, ${topic} menekankan detail, ciri, dan gambaran yang mudah dipahami pembaca.`,
  }))
}

export async function summarizeMaterial(text) {
  const live = await callAiEndpoint('summarizeMaterial', { text })
  if (live) return live.content

  await wait(240)
  return `Ringkasan: ${text?.slice(0, 120) || 'materi ini'}... Intinya, pahami konsep utama, catat kata kunci, lalu kerjakan latihan singkat.`
}

export async function generateFlashcards(text) {
  const live = await callAiEndpoint('generateFlashcards', { text })
  if (live) return parseFlashcards(live.content)

  await wait(240)
  return [
    { front: 'Identification', back: 'Bagian awal descriptive text yang mengenalkan objek.' },
    { front: 'Description', back: 'Bagian yang menjelaskan ciri dan detail objek.' },
    { front: 'Explore', back: 'Menjelajahi atau mempelajari sesuatu lebih dalam.' },
  ]
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function callAiEndpoint(action, payload) {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
    })

    if (!response.ok) return null
    return response.json()
  } catch (error) {
    return null
  }
}

function parseGeneratedQuestions(content) {
  if (!content) return []
  const blocks = content.split(/\n(?=\d+[\).]\s)/).filter(Boolean)
  const parsed = blocks.map((block, index) => {
    const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)
    const answerLine = lines.find((line) => /kunci|jawaban/i.test(line))
    const explanationLine = lines.find((line) => /pembahasan/i.test(line))
    const options = lines.filter((line) => /^[A-D][\).]/i.test(line)).map((line) => line.replace(/^[A-D][\).]\s*/i, ''))

    return {
      question: lines[0] || `${index + 1}. Soal AI`,
      options,
      answer: answerLine?.replace(/^.*?:\s*/, '') || '-',
      explanation: explanationLine?.replace(/^.*?:\s*/, '') || 'Pembahasan dibuat oleh AI.',
    }
  })

  return parsed.length > 0 ? parsed : [{ question: content, options: [], answer: '-', explanation: 'Output AI belum terstruktur.' }]
}

function parseFlashcards(content) {
  if (!content) return []
  const cards = content.split(/\n(?=Front:|Depan:)/i).map((block) => {
    const front = block.match(/(?:Front|Depan):\s*(.+)/i)?.[1]
    const back = block.match(/(?:Back|Belakang):\s*(.+)/i)?.[1]
    return front && back ? { front, back } : null
  }).filter(Boolean)
  return cards.length > 0 ? cards : [{ front: 'Ringkasan AI', back: content }]
}
