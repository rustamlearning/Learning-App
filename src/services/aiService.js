export async function askTutor(prompt) {
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
  await wait(240)
  return `Ringkasan: ${text?.slice(0, 120) || 'materi ini'}... Intinya, pahami konsep utama, catat kata kunci, lalu kerjakan latihan singkat.`
}

export async function generateFlashcards(text) {
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
