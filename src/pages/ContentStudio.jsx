import { useMemo, useState } from 'react'
import {
  Atom,
  Beaker,
  BookOpen,
  Brain,
  Calculator,
  CheckCircle2,
  ClipboardList,
  FileQuestion,
  FlaskConical,
  Layers3,
  Link as LinkIcon,
  Microscope,
  PenTool,
  PlayCircle,
  Plus,
  Save,
  Sparkles,
  Target,
  Wand2,
} from 'lucide-react'
import {
  DashboardCard,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  Toast,
} from '../components/ui.jsx'

const CONTENT_KEY = 'sman6_studio_content_v1'
const RUBRIC_KEY = 'sman6_studio_rubrics_v1'
const FLASHCARD_KEY = 'sman6_studio_flashcards_v1'

const subjectTemplates = {
  Matematika: {
    icon: Calculator,
    color: 'purple',
    contentTypes: ['Rumus interaktif', 'Grafik fungsi', 'Geometri', 'Latihan bertahap', 'Pembahasan langkah demi langkah'],
    tools: ['GeoGebra', 'Desmos', 'Scientific Calculator', 'Graphing Tool'],
    sampleTopic: 'Fungsi Kuadrat',
  },
  Fisika: {
    icon: Atom,
    color: 'cyan',
    contentTypes: ['Simulasi gerak', 'Listrik', 'Gelombang', 'Optik', 'Energi'],
    tools: ['PhET Simulation', 'Formula Helper', 'Unit Converter', 'Virtual Lab'],
    sampleTopic: 'Hukum Newton',
  },
  Kimia: {
    icon: Beaker,
    color: 'amber',
    contentTypes: ['Tabel periodik', 'Persamaan reaksi', 'Stoikiometri', 'Struktur atom', 'Simulasi molekul'],
    tools: ['Periodic Table', 'Equation Helper', 'PhET Chemistry', 'Molecule Viewer'],
    sampleTopic: 'Ikatan Kimia',
  },
  Biologi: {
    icon: Microscope,
    color: 'green',
    contentTypes: ['Diagram organ', 'Siklus hidup', 'Klasifikasi', 'Praktikum virtual', 'LKPD observasi'],
    tools: ['Diagram Labeling', 'Virtual Lab', 'Observation Sheet', 'Concept Map'],
    sampleTopic: 'Sistem Pernapasan',
  },
  'Bahasa Inggris': {
    icon: BookOpen,
    color: 'purple',
    contentTypes: ['Reading passage', 'Grammar drill', 'Speaking prompt', 'Writing rubric', 'Vocabulary flashcard'],
    tools: ['Dialogue Builder', 'Flashcard Maker', 'Rubric Builder', 'Speaking Prompt'],
    sampleTopic: 'Descriptive Text',
  },
  'Bahasa Indonesia': {
    icon: PenTool,
    color: 'cyan',
    contentTypes: ['Analisis teks', 'Struktur cerpen', 'Rubrik pidato', 'Latihan membaca kritis', 'LKPD literasi'],
    tools: ['Text Analyzer', 'Rubric Builder', 'Timeline', 'Reflection Prompt'],
    sampleTopic: 'Teks Eksposisi',
  },
  Sosial: {
    icon: Layers3,
    color: 'amber',
    contentTypes: ['Timeline', 'Peta konsep', 'Studi kasus', 'Infografis', 'Kuis analisis'],
    tools: ['Timeline Builder', 'Case Study', 'Concept Map', 'Discussion Prompt'],
    sampleTopic: 'Perubahan Sosial',
  },
  Umum: {
    icon: Sparkles,
    color: 'cyan',
    contentTypes: ['Materi teks', 'Kuis', 'LKPD', 'Rubrik', 'Flashcard'],
    tools: ['AI Lesson Builder', 'Quiz Maker', 'Rubric Builder', 'Exit Ticket'],
    sampleTopic: 'Topik pembelajaran',
  },
}

const classOptions = ['X', 'XI', 'XII']
const levelOptions = ['Mudah', 'Standar', 'Menantang']
const outputOptions = ['Materi', 'Tugas', 'Kuis', 'Flashcard', 'LKPD', 'Rubrik', 'Remedial', 'Pengayaan']

const stemResources = [
  {
    title: 'GeoGebra',
    description: 'Grafik, geometri, kalkulator 3D, dan aktivitas matematika interaktif.',
    url: 'https://www.geogebra.org',
    subject: 'Matematika',
    icon: Calculator,
  },
  {
    title: 'Desmos',
    description: 'Graphing calculator dan aktivitas matematika visual.',
    url: 'https://www.desmos.com/calculator',
    subject: 'Matematika',
    icon: Calculator,
  },
  {
    title: 'PhET Physics',
    description: 'Simulasi fisika interaktif untuk gerak, listrik, gelombang, energi, dan optik.',
    url: 'https://phet.colorado.edu/en/simulations/filter?subjects=physics&type=html',
    subject: 'Fisika',
    icon: Atom,
  },
  {
    title: 'PhET Chemistry',
    description: 'Simulasi kimia untuk atom, molekul, reaksi, larutan, dan stoikiometri.',
    url: 'https://phet.colorado.edu/en/simulations/filter?subjects=chemistry&type=html',
    subject: 'Kimia',
    icon: Beaker,
  },
  {
    title: 'PhET Biology',
    description: 'Simulasi biologi dan sains untuk observasi konsep secara visual.',
    url: 'https://phet.colorado.edu/en/simulations/filter?subjects=biology&type=html',
    subject: 'Biologi',
    icon: Microscope,
  },
]


const featureTargets = [
  {
    id: 'materi',
    label: 'Simpan sebagai Materi',
    shortLabel: 'Materi',
    description: 'Kirim draft ke halaman Materi Guru. Setelah itu guru bisa edit dan Publish ke siswa.',
    success: 'Draft berhasil dikirim ke Materi Guru.',
    nextStep: 'Buka halaman Materi, cek konten, lalu klik Publish agar muncul di siswa.',
    path: '/guru/materi',
    tone: 'cyan',
    icon: BookOpen,
  },
  {
    id: 'tugas',
    label: 'Buat Tugas',
    shortLabel: 'Tugas',
    description: 'Ubah draft menjadi tugas kelas dengan instruksi awal yang siap diedit.',
    success: 'Draft berhasil dikirim ke Tugas Guru.',
    nextStep: 'Buka halaman Tugas, lengkapi deadline, lalu aktifkan tugas.',
    path: '/guru/tugas',
    tone: 'amber',
    icon: ClipboardList,
  },
  {
    id: 'bank-soal',
    label: 'Kirim ke Bank Soal',
    shortLabel: 'Bank Soal',
    description: 'Buat beberapa soal pilihan ganda dari draft dan simpan ke bank soal lokal.',
    success: '5 soal berhasil dikirim ke Bank Soal.',
    nextStep: 'Buka Bank Soal untuk mengecek, mengedit, atau memakai soal di kuis.',
    path: '/guru/bank-soal',
    tone: 'purple',
    icon: FileQuestion,
  },
  {
    id: 'kuis',
    label: 'Buat Kuis Live',
    shortLabel: 'Kuis Live',
    description: 'Buat kuis baru sekaligus soal-soalnya, lalu simpan ke Kuis Live.',
    success: 'Draft kuis berhasil dikirim ke Kuis Live dan Bank Soal.',
    nextStep: 'Buka Kuis Live, cek soal, lalu klik Publish agar bisa dikerjakan siswa.',
    path: '/guru/kuis-live',
    tone: 'green',
    icon: PlayCircle,
  },
  {
    id: 'flashcard',
    label: 'Buat Flashcard',
    shortLabel: 'Flashcard',
    description: 'Ubah topik menjadi kartu konsep singkat untuk review cepat siswa.',
    success: 'Flashcard berhasil disimpan ke arsip flashcard Studio Konten.',
    nextStep: 'Buka halaman siswa Flashcard untuk melihat deck yang tersimpan.',
    path: '/siswa/flashcard',
    tone: 'cyan',
    icon: Layers3,
  },
  {
    id: 'rubrik',
    label: 'Buat Rubrik',
    shortLabel: 'Rubrik',
    description: 'Buat rubrik penilaian proyek, speaking, writing, presentasi, atau LKPD.',
    success: 'Rubrik tersimpan di arsip lokal.',
    nextStep: 'Buka tab Arsip Lokal untuk melihat rubrik yang sudah dibuat.',
    path: '/guru/studio-konten',
    tone: 'purple',
    icon: ClipboardList,
  },
  {
    id: 'remedial',
    label: 'Buat Remedial',
    shortLabel: 'Remedial',
    description: 'Buat paket belajar ulang untuk siswa yang belum tuntas.',
    success: 'Remedial tersimpan di arsip Studio Konten.',
    nextStep: 'Buka halaman siswa Flashcard untuk melihat paket remedial.',
    path: '/siswa/flashcard',
    tone: 'amber',
    icon: Target,
  },
  {
    id: 'pengayaan',
    label: 'Buat Pengayaan',
    shortLabel: 'Pengayaan',
    description: 'Buat tantangan lanjutan untuk siswa yang sudah memahami materi.',
    success: 'Pengayaan tersimpan di arsip Studio Konten.',
    nextStep: 'Buka halaman siswa Flashcard untuk melihat paket pengayaan.',
    path: '/siswa/flashcard',
    tone: 'green',
    icon: Sparkles,
  },
]


const smartTemplates = [
  {
    id: 'math-graph-function',
    subject: 'Matematika',
    title: 'Grafik Fungsi Interaktif',
    topic: 'Fungsi Kuadrat',
    contentType: 'Grafik fungsi',
    outputType: 'Materi',
    level: 'Standar',
    duration: '2 JP',
    icon: Calculator,
    tone: 'purple',
    summary: 'Template untuk menjelaskan bentuk grafik, titik puncak, sumbu simetri, dan latihan membaca grafik.',
    tools: ['Desmos', 'GeoGebra', 'Graphing Tool', 'Scientific Calculator'],
    sections: [
      ['Tujuan pembelajaran', 'Siswa mampu mengenali bentuk fungsi kuadrat, menentukan titik puncak, sumbu simetri, dan membaca grafik sederhana.'],
      ['Rumus inti', 'Gunakan bentuk umum y = ax² + bx + c. Bahas pengaruh nilai a terhadap arah buka grafik dan perubahan nilai b serta c terhadap posisi grafik.'],
      ['Aktivitas interaktif', 'Guru membuka Desmos atau GeoGebra, lalu siswa mengubah nilai a, b, dan c untuk mengamati perubahan grafik.'],
      ['Latihan bertahap', 'Mulai dari menentukan nilai a, b, c, membaca titik potong, menentukan titik puncak, lalu menghubungkan grafik dengan masalah kontekstual.'],
      ['Exit ticket', 'Siswa menulis satu pola yang mereka temukan saat nilai a, b, atau c berubah.'],
    ],
  },
  {
    id: 'physics-phet-lkpd',
    subject: 'Fisika',
    title: 'LKPD Simulasi PhET',
    topic: 'Hukum Newton',
    contentType: 'Simulasi gerak',
    outputType: 'LKPD',
    level: 'Standar',
    duration: '2 JP',
    icon: Atom,
    tone: 'cyan',
    summary: 'Template LKPD berbasis simulasi untuk mengamati hubungan gaya, massa, dan percepatan.',
    tools: ['PhET Simulation', 'Formula Helper', 'Unit Converter'],
    sections: [
      ['Tujuan pembelajaran', 'Siswa mampu menjelaskan hubungan antara gaya, massa, dan percepatan melalui simulasi.'],
      ['Instruksi simulasi', 'Buka simulasi PhET tentang gaya dan gerak. Ubah massa benda dan besar gaya, lalu amati perubahan percepatan.'],
      ['Tabel observasi', 'Buat tabel berisi massa, gaya, percepatan, dan kesimpulan hubungan antarvariabel.'],
      ['Pertanyaan analisis', 'Apa yang terjadi pada percepatan jika gaya diperbesar? Apa yang terjadi jika massa diperbesar?'],
      ['Kesimpulan', 'Siswa menulis ulang Hukum II Newton dengan bahasa sendiri dan memberikan contoh di kehidupan sekitar.'],
    ],
  },
  {
    id: 'chem-reaction-stoichiometry',
    subject: 'Kimia',
    title: 'Persamaan Reaksi & Stoikiometri',
    topic: 'Penyetaraan Reaksi',
    contentType: 'Persamaan reaksi',
    outputType: 'Materi',
    level: 'Standar',
    duration: '2 JP',
    icon: Beaker,
    tone: 'amber',
    summary: 'Template untuk melatih siswa menyetarakan reaksi dan memahami koefisien reaksi.',
    tools: ['Periodic Table', 'Equation Helper', 'PhET Chemistry'],
    sections: [
      ['Tujuan pembelajaran', 'Siswa mampu menyetarakan persamaan reaksi sederhana dan menjelaskan arti koefisien reaksi.'],
      ['Konsep inti', 'Jumlah atom tiap unsur harus sama di ruas kiri dan kanan. Koefisien digunakan untuk menyeimbangkan jumlah partikel.'],
      ['Contoh bertahap', 'Mulai dari reaksi sederhana seperti H₂ + O₂ → H₂O, lalu lanjut ke reaksi pembakaran sederhana.'],
      ['Latihan', 'Sediakan 5 reaksi mudah, 3 reaksi sedang, dan 2 soal cerita terkait perbandingan mol.'],
      ['Refleksi', 'Siswa menjelaskan mengapa indeks senyawa tidak boleh diubah saat menyetarakan reaksi.'],
    ],
  },
  {
    id: 'biology-diagram-labeling',
    subject: 'Biologi',
    title: 'Diagram Labeling Organ',
    topic: 'Sistem Pernapasan',
    contentType: 'Diagram organ',
    outputType: 'LKPD',
    level: 'Mudah',
    duration: '2 JP',
    icon: Microscope,
    tone: 'green',
    summary: 'Template LKPD untuk melabeli diagram, menjelaskan fungsi organ, dan membuat alur proses.',
    tools: ['Diagram Labeling', 'Observation Sheet', 'Concept Map'],
    sections: [
      ['Tujuan pembelajaran', 'Siswa mampu mengidentifikasi organ pernapasan dan menjelaskan fungsi masing-masing organ.'],
      ['Aktivitas labeling', 'Siswa melabeli hidung, trakea, bronkus, bronkiolus, paru-paru, alveolus, dan diafragma pada diagram.'],
      ['Tabel fungsi organ', 'Siswa mengisi nama organ, fungsi, dan contoh gangguan yang mungkin terjadi.'],
      ['Alur proses', 'Siswa membuat urutan perjalanan udara dari hidung sampai alveolus.'],
      ['Exit ticket', 'Siswa menjelaskan satu cara menjaga kesehatan sistem pernapasan.'],
    ],
  },
  {
    id: 'english-speaking-writing',
    subject: 'Bahasa Inggris',
    title: 'Speaking & Writing Task',
    topic: 'Descriptive Text',
    contentType: 'Speaking prompt',
    outputType: 'Tugas',
    level: 'Standar',
    duration: '2 JP',
    icon: BookOpen,
    tone: 'purple',
    summary: 'Template tugas speaking dan writing lengkap dengan kosakata, prompt, dan rubrik sederhana.',
    tools: ['Dialogue Builder', 'Speaking Prompt', 'Writing Rubric', 'Flashcard Maker'],
    sections: [
      ['Learning objective', 'Students are able to describe a place, person, or object using simple present tense and descriptive adjectives.'],
      ['Vocabulary starter', 'beautiful, quiet, crowded, traditional, clean, friendly, famous, small, large, interesting.'],
      ['Speaking prompt', 'Describe your school or your island in 5 sentences. Practice with a partner before presenting.'],
      ['Writing task', 'Write one descriptive paragraph about a place in Pangkep. Include identification and description.'],
      ['Simple rubric', 'Content, grammar, vocabulary, pronunciation, and confidence are assessed using score 1–4.'],
    ],
  },
  {
    id: 'indo-critical-reading',
    subject: 'Bahasa Indonesia',
    title: 'Analisis Teks & Rubrik',
    topic: 'Teks Eksposisi',
    contentType: 'Analisis teks',
    outputType: 'Materi',
    level: 'Standar',
    duration: '2 JP',
    icon: PenTool,
    tone: 'cyan',
    summary: 'Template membaca kritis untuk menemukan tesis, argumen, fakta, opini, dan simpulan.',
    tools: ['Text Analyzer', 'Rubric Builder', 'Reflection Prompt'],
    sections: [
      ['Tujuan pembelajaran', 'Siswa mampu mengidentifikasi struktur teks eksposisi dan membedakan fakta serta opini.'],
      ['Aktivitas membaca', 'Siswa membaca teks pendek, menandai tesis, argumen, dan penegasan ulang.'],
      ['Tabel analisis', 'Siswa mengisi kutipan teks, jenis informasi, alasan, dan bukti pendukung.'],
      ['Diskusi', 'Apakah argumen dalam teks sudah kuat? Bukti apa yang membuatnya meyakinkan?'],
      ['Tugas lanjut', 'Siswa menulis satu paragraf eksposisi tentang isu di lingkungan sekolah.'],
    ],
  },
  {
    id: 'social-timeline-case',
    subject: 'Sosial',
    title: 'Timeline & Studi Kasus',
    topic: 'Perubahan Sosial',
    contentType: 'Timeline',
    outputType: 'Materi',
    level: 'Menantang',
    duration: '2 JP',
    icon: Layers3,
    tone: 'amber',
    summary: 'Template timeline, studi kasus, diskusi, dan refleksi untuk Sejarah, Ekonomi, Geografi, atau Sosiologi.',
    tools: ['Timeline Builder', 'Case Study', 'Concept Map', 'Discussion Prompt'],
    sections: [
      ['Tujuan pembelajaran', 'Siswa mampu menjelaskan perubahan sosial melalui urutan peristiwa, sebab-akibat, dan dampaknya.'],
      ['Timeline', 'Siswa menyusun 5–7 peristiwa penting berdasarkan urutan waktu dan menjelaskan hubungan antarperistiwa.'],
      ['Studi kasus', 'Gunakan contoh perubahan ekonomi, teknologi, lingkungan, atau budaya di sekitar masyarakat pesisir.'],
      ['Diskusi reflektif', 'Apa dampak positif dan negatif perubahan tersebut bagi masyarakat? Siapa yang paling terdampak?'],
      ['Produk akhir', 'Siswa membuat peta konsep atau infografis sederhana dari hasil diskusi.'],
    ],
  },
]

function readStorage(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback
  } catch (error) {
    return fallback
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function teacherStorageKey(kind, user, subject) {
  const owner = user?.id || subject || 'demo'
  const keys = {
    materials: `sea-learning-teacher-materials-${owner}`,
    questions: `sea-learning-teacher-questions-${owner}`,
    quizzes: `sea-learning-teacher-quizzes-${owner}`,
    assignments: `sea-learning-teacher-assignments-${owner}`,
  }
  return keys[kind]
}

function appendStorageRows(key, rows) {
  const currentRows = readStorage(key, [])
  const nextRows = [...rows, ...currentRows]
  writeStorage(key, nextRows)
  return nextRows
}

function previewToPlainText(preview) {
  return (preview.sections || [])
    .map((section) => `${section.title}\n${section.body}`)
    .join('\n\n')
}

function makeGeneratedQuestions(preview, form, total = 5) {
  const topic = preview.topic || form.topic || 'Topik pembelajaran'
  const baseQuestions = [
    {
      questionText: `Apa konsep utama dari ${topic}?`,
      options: ['Memahami inti materi', 'Menghafal tanpa contoh', 'Mengabaikan konteks', 'Menyalin jawaban teman'],
      correctAnswer: 'Memahami inti materi',
      explanation: `Konsep utama ${topic} perlu dipahami melalui penjelasan, contoh, dan latihan.`,
    },
    {
      questionText: `Mengapa contoh kontekstual penting dalam mempelajari ${topic}?`,
      options: ['Agar materi lebih dekat dengan kehidupan siswa', 'Agar materi lebih sulit', 'Agar siswa tidak berdiskusi', 'Agar tidak perlu latihan'],
      correctAnswer: 'Agar materi lebih dekat dengan kehidupan siswa',
      explanation: 'Contoh kontekstual membantu siswa menghubungkan materi dengan pengalaman nyata.',
    },
    {
      questionText: `Aktivitas apa yang paling sesuai setelah mempelajari ${topic}?`,
      options: ['Latihan dan refleksi', 'Menutup buku', 'Menghapus catatan', 'Tidak bertanya'],
      correctAnswer: 'Latihan dan refleksi',
      explanation: 'Latihan dan refleksi membantu guru melihat pemahaman siswa.',
    },
    {
      questionText: `Apa fungsi remedial dalam pembelajaran ${topic}?`,
      options: ['Membantu siswa yang belum tuntas', 'Menghukum siswa', 'Menghapus nilai', 'Mengganti semua materi'],
      correctAnswer: 'Membantu siswa yang belum tuntas',
      explanation: 'Remedial memberi kesempatan belajar ulang dengan langkah yang lebih mudah.',
    },
    {
      questionText: `Apa fungsi pengayaan dalam pembelajaran ${topic}?`,
      options: ['Memberi tantangan tambahan bagi siswa yang sudah paham', 'Mengulang soal yang sama', 'Mengurangi aktivitas', 'Menghapus tugas'],
      correctAnswer: 'Memberi tantangan tambahan bagi siswa yang sudah paham',
      explanation: 'Pengayaan memperluas pemahaman siswa melalui tantangan lebih tinggi.',
    },
  ]

  return baseQuestions.slice(0, total).map((question, index) => ({
    id: `studio-question-${Date.now()}-${index + 1}`,
    ...question,
    subject: form.subject,
    className: `Kelas ${form.className}`,
    topic,
    difficulty: form.level === 'Menantang' ? 'Sulit' : form.level === 'Mudah' ? 'Mudah' : 'Sedang',
    type: 'Pilihan ganda',
    source: 'local',
  }))
}

function makeFlashcards(preview, form) {
  const topic = preview.topic || form.topic || 'Topik pembelajaran'
  const cards = [
    ['Konsep utama', `Ide pokok yang harus dipahami dalam ${topic}.`],
    ['Contoh kontekstual', 'Contoh yang dekat dengan kehidupan siswa.'],
    ['Latihan', 'Aktivitas untuk menguji pemahaman setelah belajar.'],
    ['Remedial', 'Pembelajaran ulang untuk siswa yang belum tuntas.'],
    ['Pengayaan', 'Tantangan tambahan untuk siswa yang sudah paham.'],
  ]

  return {
    id: `studio-flashcard-${Date.now()}`,
    title: `Flashcard ${topic}`,
    subject: form.subject,
    className: `Kelas ${form.className}`,
    topic,
    count: cards.length,
    progress: 0,
    cards: cards.map(([front, back], index) => ({
      id: `studio-card-${Date.now()}-${index + 1}`,
      front,
      back,
    })),
    source: 'local',
  }
}


function buildFallbackLesson(form) {
  const template = subjectTemplates[form.subject] || subjectTemplates.Umum
  const topic = form.topic?.trim() || template.sampleTopic
  const level = form.level || 'Standar'

  return {
    id: `studio-content-${Date.now()}`,
    title: `${form.outputType}: ${topic}`,
    subject: form.subject,
    className: form.className,
    topic,
    contentType: form.contentType,
    outputType: form.outputType,
    level,
    duration: form.duration,
    createdAt: new Date().toISOString(),
    sections: [
      {
        title: 'Tujuan pembelajaran',
        body: `Siswa mampu memahami konsep utama ${topic}, menjelaskan contoh penggunaannya, dan menerapkan konsep tersebut dalam latihan sesuai level ${level.toLowerCase()}.`,
      },
      {
        title: 'Ringkasan materi',
        body: `${topic} dipelajari melalui penjelasan bertahap, contoh kontekstual, aktivitas singkat, dan refleksi. Guru dapat menyesuaikan contoh dengan kondisi siswa SMAN 6 Pangkep.`,
      },
      {
        title: 'Contoh kontekstual',
        body: `Gunakan contoh yang dekat dengan kehidupan siswa, misalnya lingkungan sekolah, kepulauan, aktivitas harian, atau fenomena sekitar Pangkep.`,
      },
      {
        title: 'Aktivitas siswa',
        body: `Siswa membaca ringkasan, mengamati contoh, berdiskusi berpasangan, lalu mengerjakan latihan singkat atau LKPD sesuai arahan guru.`,
      },
      {
        title: 'Latihan',
        body: `Buat 5 soal pemahaman dasar, 3 soal penerapan, dan 2 soal refleksi. Tambahkan pembahasan singkat agar siswa bisa belajar mandiri.`,
      },
      {
        title: 'Remedial dan pengayaan',
        body: `Remedial: berikan contoh lebih sederhana dan latihan bertahap. Pengayaan: berikan studi kasus atau proyek kecil yang menantang.`,
      },
      {
        title: 'Exit ticket',
        body: `Tuliskan satu hal yang kamu pahami, satu hal yang masih membingungkan, dan satu contoh penggunaan ${topic}.`,
      },
    ],
    tools: template.tools,
  }
}


function buildSmartTemplateDraft(template, form) {
  return {
    id: `studio-smart-template-${Date.now()}`,
    title: template.title,
    subject: template.subject,
    className: form.className || 'X',
    topic: template.topic,
    contentType: template.contentType,
    outputType: template.outputType,
    level: template.level,
    duration: template.duration,
    createdAt: new Date().toISOString(),
    source: 'smart-template',
    sections: template.sections.map(([title, body]) => ({ title, body })),
    tools: template.tools,
  }
}


function buildRubric(form) {
  const topic = form.topic?.trim() || 'Tugas pembelajaran'
  return {
    id: `studio-rubric-${Date.now()}`,
    title: `Rubrik ${topic}`,
    subject: form.subject,
    className: form.className,
    createdAt: new Date().toISOString(),
    criteria: [
      {
        aspect: 'Pemahaman konsep',
        levels: {
          4: 'Menjelaskan konsep dengan lengkap, tepat, dan memakai contoh sendiri.',
          3: 'Menjelaskan konsep dengan tepat, tetapi contoh masih terbatas.',
          2: 'Menjelaskan sebagian konsep, tetapi masih ada kekeliruan.',
          1: 'Belum menunjukkan pemahaman konsep yang memadai.',
        },
      },
      {
        aspect: 'Keterampilan proses',
        levels: {
          4: 'Langkah kerja runtut, mandiri, dan hasilnya akurat.',
          3: 'Langkah kerja cukup runtut dengan sedikit bantuan.',
          2: 'Langkah kerja belum konsisten dan butuh bimbingan.',
          1: 'Belum mampu mengikuti langkah kerja.',
        },
      },
      {
        aspect: 'Komunikasi hasil',
        levels: {
          4: 'Hasil disampaikan jelas, rapi, dan reflektif.',
          3: 'Hasil disampaikan cukup jelas dan rapi.',
          2: 'Hasil masih kurang lengkap atau kurang rapi.',
          1: 'Hasil belum dapat dipahami dengan baik.',
        },
      },
    ],
  }
}


function cleanJsonText(text) {
  return String(text || '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()
}

function getAIResponseText(data) {
  if (!data) return ''
  if (typeof data === 'string') return data
  return data.content || data.text || data.answer || data.message || data.result || data.output || ''
}

function buildStudioPrompt(form) {
  return `
Anda adalah asisten guru profesional untuk aplikasi SEA Learning SMAN 6 Pangkep.

Buat draft konten pembelajaran yang siap diedit guru.

Data:
- Mata pelajaran: ${form.subject}
- Kelas: ${form.className}
- Topik: ${form.topic}
- Jenis konten: ${form.contentType}
- Output: ${form.outputType}
- Level: ${form.level}
- Durasi: ${form.duration}

Balas HANYA JSON valid tanpa markdown.
Format:
{
  "title": "judul konten",
  "sections": [
    {"title": "Tujuan pembelajaran", "body": "..."},
    {"title": "Ringkasan materi", "body": "..."},
    {"title": "Contoh kontekstual", "body": "..."},
    {"title": "Aktivitas siswa", "body": "..."},
    {"title": "Latihan", "body": "..."},
    {"title": "Remedial dan pengayaan", "body": "..."},
    {"title": "Exit ticket", "body": "..."}
  ],
  "tools": ["tool 1", "tool 2"]
}

Gunakan bahasa Indonesia yang jelas, ramah, dan sesuai konteks sekolah kepulauan.
Untuk Matematika/Fisika/Kimia, sertakan tools seperti grafik, formula, simulasi, PhET, GeoGebra, Desmos, tabel periodik, atau unit converter jika relevan.
Untuk Bahasa, sertakan reading, speaking, writing, rubrik, vocabulary, atau analisis teks jika relevan.
`.trim()
}

function normalizeAILesson(aiText, form) {
  const template = subjectTemplates[form.subject] || subjectTemplates.Umum
  const topic = form.topic?.trim() || template.sampleTopic

  try {
    const parsed = JSON.parse(cleanJsonText(aiText))
    return {
      id: `studio-ai-content-${Date.now()}`,
      title: parsed.title || `${form.outputType}: ${topic}`,
      subject: form.subject,
      className: form.className,
      topic,
      contentType: form.contentType,
      outputType: form.outputType,
      level: form.level,
      duration: form.duration,
      createdAt: new Date().toISOString(),
      source: 'ai',
      sections: Array.isArray(parsed.sections) && parsed.sections.length > 0
        ? parsed.sections.map((section) => ({
            title: section.title || 'Bagian materi',
            body: section.body || '',
          }))
        : buildFallbackLesson(form).sections,
      tools: Array.isArray(parsed.tools) && parsed.tools.length > 0 ? parsed.tools : template.tools,
    }
  } catch (error) {
    const fallback = buildFallbackLesson(form)
    return {
      ...fallback,
      id: `studio-ai-text-${Date.now()}`,
      title: `${form.outputType}: ${topic}`,
      source: 'ai-text',
      sections: [
        {
          title: 'Draft AI',
          body: String(aiText || '').trim() || 'AI belum mengembalikan konten yang dapat dibaca.',
        },
        ...fallback.sections.slice(1),
      ],
    }
  }
}

async function requestStudioAIDraft(form) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'askTutor',
      prompt: buildStudioPrompt(form),
    }),
  })

  if (!response.ok) {
    throw new Error(`AI server merespons ${response.status}`)
  }

  const data = await response.json()
  const text = getAIResponseText(data)

  if (!text) {
    throw new Error('AI tidak mengembalikan konten.')
  }

  return normalizeAILesson(text, form)
}

export default function ContentStudio({ user }) {
  const [toast, setToast] = useState('')
  const [activeTab, setActiveTab] = useState('builder')
  const [form, setForm] = useState({
    subject: 'Bahasa Inggris',
    className: 'X',
    topic: 'Descriptive Text',
    contentType: 'Reading passage',
    outputType: 'Materi',
    level: 'Standar',
    duration: '2 JP',
    sourceText: '',
    videoUrl: '',
  })
  const [preview, setPreview] = useState(() => buildFallbackLesson({
    subject: 'Bahasa Inggris',
    className: 'X',
    topic: 'Descriptive Text',
    contentType: 'Reading passage',
    outputType: 'Materi',
    level: 'Standar',
    duration: '2 JP',
  }))
  const [contentRows, setContentRows] = useState(() => readStorage(CONTENT_KEY, []))
  const [rubricRows, setRubricRows] = useState(() => readStorage(RUBRIC_KEY, []))
  const [deliveryStatus, setDeliveryStatus] = useState(null)

  const template = subjectTemplates[form.subject] || subjectTemplates.Umum
  const availableContentTypes = template.contentTypes

  const stats = useMemo(() => {
    return {
      content: contentRows.length,
      rubrics: rubricRows.length,
      quizzes: contentRows.filter((item) => item.outputType === 'Kuis').length,
      remedials: contentRows.filter((item) => ['Remedial', 'Pengayaan'].includes(item.outputType)).length,
    }
  }, [contentRows, rubricRows])

  function updateForm(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value }
      if (field === 'subject') {
        const nextTemplate = subjectTemplates[value] || subjectTemplates.Umum
        next.topic = nextTemplate.sampleTopic
        next.contentType = nextTemplate.contentTypes[0]
      }
      return next
    })
  }

  async function generateDraft() {
    try {
      setToast('Membuat draft dengan AI server...')
      const draft = await requestStudioAIDraft(form)
      setPreview(draft)
      setToast(draft.source === 'ai' ? 'Draft konten berhasil dibuat dengan AI server.' : 'Draft AI berhasil dibuat dan dirapikan.')
    } catch (aiError) {
      const draft = buildFallbackLesson(form)
      setPreview(draft)
      setToast('AI belum tersedia, draft lokal berhasil dibuat.')
    }
  }

  function saveContent() {
    const item = { ...preview, id: `studio-content-${Date.now()}`, savedAs: form.outputType }
    const nextRows = [item, ...contentRows]
    setContentRows(nextRows)
    writeStorage(CONTENT_KEY, nextRows)
    setToast(`${form.outputType} tersimpan di arsip Studio Konten.`)
  }

  function saveRubric() {
    const rubric = buildRubric(form)
    const nextRows = [rubric, ...rubricRows]
    setRubricRows(nextRows)
    writeStorage(RUBRIC_KEY, nextRows)
    setToast('Rubrik tersimpan di arsip lokal.')
  }

  function showDeliverySuccess(target) {
    const info = featureTargets.find((item) => item.id === target)
    if (!info) return

    setDeliveryStatus({
      ...info,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    })
    setToast(info.success)
  }

  function publishToFeature(target) {
    const subject = form.subject || user?.subject || 'Bahasa Inggris'
    const className = `Kelas ${form.className}`
    const topic = preview.topic || form.topic || 'Topik pembelajaran'
    const contentText = previewToPlainText(preview)

    if (target === 'materi') {
      appendStorageRows(teacherStorageKey('materials', user, subject), [{
        id: `studio-material-${Date.now()}`,
        title: preview.title || `Materi ${topic}`,
        description: `Draft materi dari Studio Konten untuk topik ${topic}.`,
        content: contentText,
        subject,
        className,
        teacher: user?.name || 'Guru',
        topic,
        type: 'Teks',
        status: 'Draft',
        progress: 0,
        source: 'local',
      }])
      showDeliverySuccess('materi')
      return
    }

    if (target === 'tugas') {
      appendStorageRows(teacherStorageKey('assignments', user, subject), [{
        id: `studio-assignment-${Date.now()}`,
        title: `Tugas ${topic}`,
        description: contentText.slice(0, 600),
        subject,
        className,
        teacher: user?.name || 'Guru',
        deadline: '',
        status: 'Draft',
        source: 'local',
      }])
      showDeliverySuccess('tugas')
      return
    }

    if (target === 'bank-soal') {
      const generatedQuestions = makeGeneratedQuestions(preview, form, 5)
      appendStorageRows(teacherStorageKey('questions', user, subject), generatedQuestions)
      showDeliverySuccess('bank-soal')
      return
    }

    if (target === 'kuis') {
      const generatedQuestions = makeGeneratedQuestions(preview, form, 5)
      appendStorageRows(teacherStorageKey('questions', user, subject), generatedQuestions)

      appendStorageRows(teacherStorageKey('quizzes', user, subject), [{
        id: `studio-quiz-${Date.now()}`,
        title: `Kuis ${topic}`,
        description: `Kuis otomatis dari Studio Konten untuk topik ${topic}.`,
        subject,
        className,
        teacher: user?.name || 'Guru',
        duration: 30,
        status: 'Draft',
        source: 'local',
        questionIds: generatedQuestions.map((item) => item.id),
        questionCount: generatedQuestions.length,
      }])
      showDeliverySuccess('kuis')
      return
    }

    if (target === 'flashcard') {
      const flashcard = makeFlashcards(preview, form)
      appendStorageRows(FLASHCARD_KEY, [flashcard])
      showDeliverySuccess('flashcard')
      return
    }

    if (target === 'rubrik') {
      saveRubric()
      return
    }

    if (target === 'remedial' || target === 'pengayaan') {
      const item = {
        ...preview,
        id: `studio-${target}-${Date.now()}`,
        title: `${target === 'remedial' ? 'Remedial' : 'Pengayaan'} ${topic}`,
        outputType: target === 'remedial' ? 'Remedial' : 'Pengayaan',
        savedAs: target === 'remedial' ? 'Remedial' : 'Pengayaan',
        createdAt: new Date().toISOString(),
      }
      const nextRows = [item, ...contentRows]
      setContentRows(nextRows)
      writeStorage(CONTENT_KEY, nextRows)
      showDeliverySuccess(target)
    }
  }

  function createFromText() {
    const text = form.sourceText.trim()
    const topic = form.topic.trim() || 'Materi dari teks'
    const summary = text
      ? text.split(/[.!?]/).map((item) => item.trim()).filter(Boolean).slice(0, 3).join('. ')
      : `Ringkasan otomatis untuk ${topic}.`

    const draft = {
      ...buildFallbackLesson(form),
      id: `studio-text-${Date.now()}`,
      title: `Materi dari teks: ${topic}`,
      sections: [
        { title: 'Ringkasan', body: summary || `Materi tentang ${topic}.` },
        { title: 'Poin penting', body: '1. Pahami konsep utama. 2. Catat istilah penting. 3. Hubungkan dengan contoh nyata.' },
        { title: '5 pertanyaan pilihan ganda', body: 'Buat 5 soal pilihan ganda berdasarkan teks, lengkap dengan kunci jawaban dan pembahasan.' },
        { title: '3 pertanyaan refleksi', body: 'Apa yang kamu pahami? Bagian mana yang sulit? Bagaimana konsep ini digunakan dalam kehidupan sehari-hari?' },
        { title: 'Flashcard konsep', body: 'Ambil istilah penting dari teks dan ubah menjadi kartu tanya-jawab.' },
      ],
    }

    setPreview(draft)
    setToast('Teks berhasil diubah menjadi struktur materi.')
  }

  function createVideoInteractive() {
    const draft = {
      ...buildFallbackLesson(form),
      id: `studio-video-${Date.now()}`,
      title: `Video interaktif: ${form.topic || 'Topik video'}`,
      outputType: 'Video Interaktif',
      videoUrl: form.videoUrl,
      sections: [
        { title: 'Link video', body: form.videoUrl || 'Tempel link video pembelajaran di sini.' },
        { title: 'Pertanyaan menit awal', body: 'Apa konsep utama yang dikenalkan pada awal video?' },
        { title: 'Pertanyaan tengah video', body: 'Contoh apa yang muncul dan bagaimana siswa menjelaskannya kembali?' },
        { title: 'Exit ticket', body: 'Tulis 2 hal yang dipahami dan 1 pertanyaan setelah menonton video.' },
      ],
    }

    setPreview(draft)
    setToast('Draft video interaktif dibuat.')
  }
  function useSmartTemplate(template) {
    const nextForm = {
      ...form,
      subject: template.subject,
      topic: template.topic,
      contentType: template.contentType,
      outputType: template.outputType,
      level: template.level,
      duration: template.duration,
    }

    setForm(nextForm)
    setPreview(buildSmartTemplateDraft(template, nextForm))
    setDeliveryStatus(null)
    setActiveTab('builder')
    setToast(`Template ${template.title} siap diedit.`)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Teacher Content Studio"
        title="Studio Konten Guru"
        description="Pusat pembuatan materi, kuis, LKPD, rubrik, flashcard, remedial, pengayaan, dan resource STEM untuk semua mata pelajaran."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BookOpen} label="Konten tersimpan" value={stats.content} caption="Materi, kuis, LKPD, flashcard" tone="cyan" />
        <StatCard icon={ClipboardList} label="Rubrik" value={stats.rubrics} caption="Penilaian proyek/tugas" tone="purple" />
        <StatCard icon={FileQuestion} label="Kuis draft" value={stats.quizzes} caption="Siap dipakai ulang" tone="amber" />
        <StatCard icon={Target} label="Remedial/Pengayaan" value={stats.remedials} caption="Diferensiasi belajar" tone="green" />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          ['builder', 'AI Lesson Builder', Wand2],
          ['templates', 'Smart Templates', Layers3],
          ['stem', 'STEM Tools', FlaskConical],
          ['rubric', 'Rubric Builder', ClipboardList],
          ['import', 'Import Teks/Video', LinkIcon],
          ['archive', 'Arsip Lokal', Save],
        ].map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold transition ${
              activeTab === id
                ? 'bg-galaxy-action text-white shadow-glow'
                : 'bg-white text-galaxy-purple ring-1 ring-purple-100 hover:bg-galaxy-lavender'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'builder' && (
        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <BuilderPanel
            form={form}
            template={template}
            availableContentTypes={availableContentTypes}
            updateForm={updateForm}
            generateDraft={generateDraft}
            saveContent={saveContent}
          />
          <PreviewPanel preview={preview} publishToFeature={publishToFeature} deliveryStatus={deliveryStatus} />
        </div>
      )}

      {activeTab === 'templates' && <TemplatePanel onUseSubject={(subject) => { updateForm('subject', subject); setActiveTab('builder') }} onUseSmartTemplate={useSmartTemplate} />}

      {activeTab === 'stem' && <StemToolsPanel />}

      {activeTab === 'rubric' && (
        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <RubricPanel form={form} updateForm={updateForm} saveRubric={saveRubric} />
          <RubricPreview rubric={buildRubric(form)} />
        </div>
      )}

      {activeTab === 'import' && (
        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <ImportPanel form={form} updateForm={updateForm} createFromText={createFromText} createVideoInteractive={createVideoInteractive} />
          <PreviewPanel preview={preview} publishToFeature={publishToFeature} deliveryStatus={deliveryStatus} />
        </div>
      )}

      {activeTab === 'archive' && <ArchivePanel contentRows={contentRows} rubricRows={rubricRows} />}

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}

function BuilderPanel({ form, template, availableContentTypes, updateForm, generateDraft, saveContent }) {
  return (
    <SectionCard>
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-galaxy-lavender text-galaxy-purple">
          <Brain size={22} />
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-slate-950">Wizard pembuatan konten</h2>
          <p className="text-sm text-slate-500">8 langkah cepat untuk membuat draft pembelajaran.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <SelectField label="1. Mata pelajaran" value={form.subject} onChange={(value) => updateForm('subject', value)} options={Object.keys(subjectTemplates)} />
        <SelectField label="2. Kelas" value={form.className} onChange={(value) => updateForm('className', value)} options={classOptions} />
        <TextField label="3. Topik" value={form.topic} onChange={(value) => updateForm('topic', value)} placeholder={template.sampleTopic} />
        <SelectField label="4. Jenis konten" value={form.contentType} onChange={(value) => updateForm('contentType', value)} options={availableContentTypes} />
        <SelectField label="5. Level" value={form.level} onChange={(value) => updateForm('level', value)} options={levelOptions} />
        <TextField label="6. Durasi" value={form.duration} onChange={(value) => updateForm('duration', value)} placeholder="2 JP" />
        <SelectField label="7. Simpan sebagai" value={form.outputType} onChange={(value) => updateForm('outputType', value)} options={outputOptions} />
      </div>

      <div className="mt-5 rounded-3xl bg-gradient-to-r from-violet-50 to-cyan-50 p-4 ring-1 ring-violet-100">
        <p className="text-sm font-extrabold text-slate-950">8. Preview dan publish</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Buat draft, cek hasilnya, lalu simpan ke arsip lokal. Tahap berikutnya bisa dihubungkan ke Materi, Bank Soal, Kuis, Flashcard, dan LKPD.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={generateDraft} className="inline-flex items-center gap-2 rounded-2xl bg-galaxy-action px-5 py-3 text-sm font-extrabold text-white">
          <Sparkles size={16} />
          Generate draft
        </button>
        <button onClick={saveContent} className="inline-flex items-center gap-2 rounded-2xl bg-galaxy-surface px-5 py-3 text-sm font-extrabold text-galaxy-purple">
          <Save size={16} />
          Simpan konten
        </button>
      </div>
    </SectionCard>
  )
}

function PreviewPanel({ preview, publishToFeature, deliveryStatus }) {
  return (
    <SectionCard>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Preview konten</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">{preview.title}</h2>
        </div>
        <StatusBadge tone="cyan">{preview.outputType || preview.savedAs || 'Draft'}</StatusBadge>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <StatusBadge>{preview.subject}</StatusBadge>
        <StatusBadge tone="purple">Kelas {preview.className}</StatusBadge>
        <StatusBadge tone="amber">{preview.level}</StatusBadge>
      </div>

      <div className="space-y-3">
        {(preview.sections || []).map((section) => (
          <div key={section.title} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <h3 className="font-extrabold text-slate-950">{section.title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{section.body}</p>
          </div>
        ))}
      </div>

      {preview.tools?.length > 0 && (
        <div className="mt-4 rounded-3xl bg-cyan-50 p-4 ring-1 ring-cyan-100">
          <p className="text-sm font-extrabold text-cyan-800">Tools yang disarankan</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {preview.tools.map((tool) => <StatusBadge key={tool} tone="cyan">{tool}</StatusBadge>)}
          </div>
        </div>
      )}

      {publishToFeature && (
        <div className="mt-5 rounded-[1.75rem] bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-4 ring-1 ring-violet-100">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Kirim ke Fitur Aplikasi</p>
              <h3 className="mt-1 text-xl font-black text-slate-950">Pilih tujuan draft ini.</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Guru bisa membuat satu draft lalu mengirimnya ke materi, tugas, bank soal, kuis, flashcard, rubrik, remedial, atau pengayaan.
              </p>
            </div>
            <StatusBadge tone="green">Workflow Guru</StatusBadge>
          </div>

          {deliveryStatus && (
            <div className="mt-4 rounded-3xl bg-white p-4 shadow-soft ring-1 ring-emerald-100">
              <div className="flex gap-3">
                <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <CheckCircle2 size={19} />
                </span>
                <div>
                  <p className="font-extrabold text-slate-950">{deliveryStatus.success}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{deliveryStatus.nextStep}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusBadge tone={deliveryStatus.tone}>{deliveryStatus.shortLabel}</StatusBadge>
                    <span className="text-xs font-bold text-slate-400">Dikirim pukul {deliveryStatus.time}</span>
                    <a href={deliveryStatus.path} className="rounded-2xl bg-galaxy-action px-4 py-2 text-xs font-extrabold text-white">
                      Buka halaman
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {featureTargets.map((target) => {
              const Icon = target.icon
              return (
                <button
                  key={target.id}
                  onClick={() => publishToFeature(target.id)}
                  className="group rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-purple-100 transition hover:-translate-y-0.5 hover:shadow-soft hover:ring-purple-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl bg-galaxy-lavender text-galaxy-purple ring-1 ring-purple-100 group-hover:bg-galaxy-action group-hover:text-white">
                      <Icon size={19} />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-extrabold text-slate-950">{target.label}</p>
                        <StatusBadge tone={target.tone}>{target.shortLabel}</StatusBadge>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{target.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </SectionCard>
  )
}

function TemplatePanel({ onUseSubject, onUseSmartTemplate }) {
  return (
    <div className="grid gap-5">
      <SectionCard>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Smart Templates</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Template siap pakai untuk semua rumpun mata pelajaran.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Pilih template sesuai mapel. Draft akan langsung berisi aktivitas, tools, LKPD, latihan, dan arahan yang lebih spesifik.
            </p>
          </div>
          <StatusBadge tone="green">Tahap 5</StatusBadge>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {smartTemplates.map((template) => {
            const Icon = template.icon
            return (
              <button
                key={template.id}
                onClick={() => onUseSmartTemplate(template)}
                className="group rounded-[1.75rem] bg-white p-4 text-left shadow-sm ring-1 ring-purple-100 transition hover:-translate-y-0.5 hover:shadow-soft hover:ring-purple-200"
              >
                <div className="flex gap-3">
                  <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-galaxy-lavender text-galaxy-purple ring-1 ring-purple-100 group-hover:bg-galaxy-action group-hover:text-white">
                    <Icon size={22} />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-slate-950">{template.title}</h3>
                      <StatusBadge tone={template.tone}>{template.subject}</StatusBadge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{template.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {template.tools.slice(0, 3).map((tool) => <StatusBadge key={tool} tone="cyan">{tool}</StatusBadge>)}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Template dasar mapel</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Mulai dari rumpun mata pelajaran.</h2>
          </div>
          <StatusBadge tone="cyan">Cepat</StatusBadge>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(subjectTemplates).map(([subject, template]) => {
            const Icon = template.icon
            return (
              <SectionCard key={subject}>
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-galaxy-lavender text-galaxy-purple">
                    <Icon size={22} />
                  </span>
                  <StatusBadge tone={template.color}>{subject}</StatusBadge>
                </div>
                <h2 className="text-lg font-extrabold text-slate-950">{subject}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Contoh topik: {template.sampleTopic}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {template.contentTypes.slice(0, 3).map((item) => <StatusBadge key={item}>{item}</StatusBadge>)}
                </div>
                <button onClick={() => onUseSubject(subject)} className="mt-5 w-full rounded-2xl bg-galaxy-action px-4 py-3 text-sm font-extrabold text-white">
                  Gunakan template
                </button>
              </SectionCard>
            )
          })}
        </div>
      </SectionCard>
    </div>
  )
}


function StemToolsPanel() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
      <SectionCard>
        <h2 className="text-xl font-extrabold text-slate-950">Resource STEM</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Untuk Matematika, Fisika, Kimia, dan Biologi, guru dapat memakai resource interaktif eksternal tanpa API berbayar.
        </p>
        <div className="mt-5 grid gap-3">
          {stemResources.map((resource) => {
            const Icon = resource.icon
            return (
              <div key={resource.title} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <div className="flex gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-galaxy-purple ring-1 ring-purple-100">
                    <Icon size={20} />
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-extrabold text-slate-950">{resource.title}</h3>
                      <StatusBadge tone="cyan">{resource.subject}</StatusBadge>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{resource.description}</p>
                    <a href={resource.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-extrabold text-galaxy-purple ring-1 ring-purple-100">
                      Buka resource <LinkIcon size={15} />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard>
        <h2 className="text-xl font-extrabold text-slate-950">Mini tools lokal</h2>
        <div className="mt-4 grid gap-3">
          {[
            ['Formula editor', 'Tulis rumus dan penjelasan singkat untuk materi.'],
            ['Graphing helper', 'Siapkan fungsi y = ax + b atau y = ax² + bx + c.'],
            ['Unit converter', 'Buat latihan konversi satuan sederhana.'],
            ['Physics formula helper', 'Bantu siswa memilih rumus sesuai kasus.'],
            ['Chemistry equation helper', 'Siapkan persamaan reaksi dan langkah penyetaraan.'],
            ['Periodic table note', 'Catatan unsur penting untuk pembelajaran kimia.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-3xl bg-galaxy-surface p-4 ring-1 ring-purple-100">
              <h3 className="font-extrabold text-slate-950">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function RubricPanel({ form, updateForm, saveRubric }) {
  return (
    <SectionCard>
      <h2 className="text-xl font-extrabold text-slate-950">Rubric Builder</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Cocok untuk Bahasa, Seni, PPKn, Sejarah, proyek, presentasi, speaking, writing, dan LKPD.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <SelectField label="Mata pelajaran" value={form.subject} onChange={(value) => updateForm('subject', value)} options={Object.keys(subjectTemplates)} />
        <SelectField label="Kelas" value={form.className} onChange={(value) => updateForm('className', value)} options={classOptions} />
        <TextField label="Tugas / proyek" value={form.topic} onChange={(value) => updateForm('topic', value)} placeholder="Pidato, laporan praktikum, proyek sejarah..." />
        <SelectField label="Level" value={form.level} onChange={(value) => updateForm('level', value)} options={levelOptions} />
      </div>

      <button onClick={saveRubric} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-galaxy-action px-5 py-3 text-sm font-extrabold text-white">
        <Save size={16} />
        Simpan rubrik
      </button>
    </SectionCard>
  )
}

function RubricPreview({ rubric }) {
  return (
    <SectionCard>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-2xl font-black text-slate-950">{rubric.title}</h2>
        <StatusBadge tone="purple">{rubric.subject}</StatusBadge>
      </div>
      <div className="space-y-3">
        {rubric.criteria.map((criterion) => (
          <div key={criterion.aspect} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <h3 className="font-extrabold text-slate-950">{criterion.aspect}</h3>
            <div className="mt-3 grid gap-2">
              {Object.entries(criterion.levels).reverse().map(([score, text]) => (
                <p key={score} className="rounded-2xl bg-white p-3 text-sm leading-6 text-slate-600 ring-1 ring-slate-100">
                  <b>Skor {score}:</b> {text}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

function ImportPanel({ form, updateForm, createFromText, createVideoInteractive }) {
  return (
    <SectionCard>
      <h2 className="text-xl font-extrabold text-slate-950">Import teks dan video</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Tempel teks materi atau link video, lalu ubah menjadi struktur materi, pertanyaan, flashcard, dan exit ticket.
      </p>

      <div className="mt-5 grid gap-3">
        <TextField label="Topik" value={form.topic} onChange={(value) => updateForm('topic', value)} placeholder="Masukkan topik" />
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Tempel teks materi
          <textarea
            value={form.sourceText}
            onChange={(event) => updateForm('sourceText', event.target.value)}
            rows={8}
            placeholder="Tempel materi dari buku, catatan, artikel, atau modul..."
            className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300"
          />
        </label>
        <button onClick={createFromText} className="rounded-2xl bg-galaxy-action px-5 py-3 text-sm font-extrabold text-white">
          Ubah teks menjadi materi
        </button>

        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Link video
          <input
            value={form.videoUrl}
            onChange={(event) => updateForm('videoUrl', event.target.value)}
            placeholder="https://youtube.com/..."
            className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300"
          />
        </label>
        <button onClick={createVideoInteractive} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-50 px-5 py-3 text-sm font-extrabold text-cyan-700">
          <PlayCircle size={16} />
          Buat video interaktif
        </button>
      </div>
    </SectionCard>
  )
}

function ArchivePanel({ contentRows, rubricRows }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <DashboardCard title="Arsip konten lokal">
        {contentRows.length === 0 ? (
          <p className="text-sm leading-6 text-slate-500">Belum ada konten tersimpan.</p>
        ) : (
          <div className="space-y-3">
            {contentRows.map((item) => (
              <div key={item.id} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-extrabold text-slate-950">{item.title}</h3>
                  <StatusBadge tone="cyan">{item.savedAs || item.outputType}</StatusBadge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{item.subject} · Kelas {item.className} · {item.topic}</p>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      <DashboardCard title="Arsip rubrik lokal">
        {rubricRows.length === 0 ? (
          <p className="text-sm leading-6 text-slate-500">Belum ada rubrik tersimpan.</p>
        ) : (
          <div className="space-y-3">
            {rubricRows.map((item) => (
              <div key={item.id} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-extrabold text-slate-950">{item.title}</h3>
                  <StatusBadge tone="purple">{item.subject}</StatusBadge>
                </div>
                <p className="mt-1 text-sm text-slate-500">Kelas {item.className} · {item.criteria?.length || 0} aspek penilaian</p>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  )
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300"
      />
    </label>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300"
      >
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  )
}
