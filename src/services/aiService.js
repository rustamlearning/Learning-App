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
  const topic = options.topic || 'topik yang dipilih'
  const subject = options.subject || 'mata pelajaran'
  const total = Number(options.total || 3)
  return Array.from({ length: total }).map((_, index) => ({
    question: `${index + 1}. Pernyataan mana yang paling tepat tentang ${topic}?`,
    options: ['Jawaban paling tepat', 'Pernyataan kurang lengkap', 'Jawaban tidak relevan', 'Distraktor konseptual'],
    answer: 'Jawaban paling tepat',
    explanation: `Dalam ${subject}, soal ini perlu menilai pemahaman inti tentang ${topic}, bukan sekadar hafalan kata.`,
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
    { front: 'Konsep inti', back: 'Gagasan utama yang harus dipahami sebelum latihan.' },
    { front: 'Kata kunci', back: 'Istilah penting yang membantu siswa mengenali pola materi.' },
    { front: 'Latihan singkat', back: 'Pertanyaan ringkas untuk mengecek pemahaman awal.' },
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
