import { useEffect, useMemo, useState } from 'react'
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

import { useAuth } from '../context/AuthContext.jsx'
import { fetchMaterialLookups, saveMaterial } from '../services/materialService.js'
import { saveQuestion } from '../services/questionService.js'
import { saveQuiz } from '../services/quizService.js'
import { saveAssignment } from '../services/assignmentService.js'

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


const contentStudioWorkflowSteps = [
  {
    title: 'Pilih cara membuat',
    text: 'Mulai dari AI Lesson Builder, Smart Templates, STEM Tools, atau Import Teks/Video.',
  },
  {
    title: 'Buat draft',
    text: 'Guru dapat generate draft, memakai template, atau mengubah teks modul menjadi paket belajar.',
  },
  {
    title: 'Review dan edit',
    text: 'Periksa ringkasan, aktivitas, soal, LKPD, rubrik, flashcard, remedial, dan pengayaan.',
  },
  {
    title: 'Kirim ke fitur aplikasi',
    text: 'Simpan sebagai Materi, Tugas, Bank Soal, Kuis Live, Flashcard, Rubrik, Remedial, atau Pengayaan.',
  },
  {
    title: 'Publish ke siswa',
    text: 'Buka halaman tujuan, cek ulang konten, lalu Publish agar siswa bisa mengaksesnya.',
  },
]

const publishChecklistItems = [
  'Judul dan topik sudah jelas',
  'Kelas dan mata pelajaran sudah sesuai',
  'Instruksi siswa mudah dipahami',
  'Soal atau aktivitas punya tujuan yang jelas',
  'Konten sudah dikirim ke fitur yang tepat',
]

const sampleImportText = `Sistem pernapasan manusia adalah sistem organ yang berfungsi untuk mengambil oksigen dari udara dan mengeluarkan karbon dioksida dari tubuh. Udara masuk melalui hidung, kemudian melewati faring, laring, trakea, bronkus, dan bronkiolus sebelum sampai ke alveolus. Di alveolus terjadi pertukaran gas antara oksigen dan karbon dioksida. Oksigen kemudian dibawa oleh darah ke seluruh tubuh, sedangkan karbon dioksida dikeluarkan saat kita menghembuskan napas. Menjaga kesehatan sistem pernapasan dapat dilakukan dengan menghindari asap rokok, berolahraga secara teratur, menjaga kebersihan lingkungan, dan menggunakan masker saat udara berdebu.`

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



function splitSourceSentences(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .split(/[.!?]\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 24)
}

function extractSourceKeywords(text, limit = 10) {
  const stopWords = new Set([
    'yang', 'dan', 'atau', 'dengan', 'untuk', 'pada', 'dalam', 'dari', 'adalah', 'sebagai',
    'karena', 'yaitu', 'agar', 'oleh', 'ke', 'di', 'ini', 'itu', 'akan', 'dapat', 'siswa',
    'guru', 'materi', 'pembelajaran', 'the', 'and', 'for', 'with', 'from', 'that', 'this',
  ])

  const words = String(text || '')
    .toLowerCase()
    .replace(/[^a-zA-ZÀ-ž0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 4 && !stopWords.has(word))

  const frequency = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {})

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word)
}

function titleCase(text) {
  return String(text || '')
    .split(' ')
    .map((word) => word ? word[0].toUpperCase() + word.slice(1) : word)
    .join(' ')
}

function buildQuestionsFromText(text, topic, form) {
  const sentences = splitSourceSentences(text)
  const keywords = extractSourceKeywords(text, 8)
  const base = sentences.length > 0 ? sentences : [
    `${topic} memiliki konsep utama yang perlu dipahami melalui contoh dan latihan.`,
    `Pemahaman ${topic} dapat ditingkatkan melalui diskusi dan refleksi.`,
  ]

  return Array.from({ length: 5 }).map((_, index) => {
    const keyword = keywords[index] || topic
    const sentence = base[index % base.length]
    const correctAnswer = sentence.slice(0, 120) || `Konsep ${topic} dijelaskan dalam teks.`

    return {
      id: `import-question-${Date.now()}-${index + 1}`,
      questionText: index === 0
        ? `Apa gagasan utama dari teks tentang ${topic}?`
        : `Berdasarkan teks, pernyataan mana yang paling sesuai dengan konsep "${keyword}"?`,
      options: [
        correctAnswer,
        `Konsep ${topic} tidak perlu dikaitkan dengan contoh.`,
        'Siswa cukup menghafal tanpa memahami hubungan konsep.',
        'Teks tidak memiliki informasi penting untuk dipelajari.',
      ],
      correctAnswer,
      explanation: `Jawaban benar karena didukung oleh bagian teks yang membahas ${keyword}.`,
      subject: form.subject,
      className: `Kelas ${form.className}`,
      topic,
      difficulty: form.level === 'Menantang' ? 'Sulit' : form.level === 'Mudah' ? 'Mudah' : 'Sedang',
      type: 'Pilihan ganda',
      source: 'import-text',
    }
  })
}

function buildFlashcardsFromText(text, topic, form) {
  const keywords = extractSourceKeywords(text, 8)
  const sourceWords = keywords.length > 0 ? keywords : [topic, 'konsep utama', 'contoh', 'latihan', 'refleksi']

  const cards = sourceWords.slice(0, 8).map((keyword, index) => ({
    id: `import-card-${Date.now()}-${index + 1}`,
    front: titleCase(keyword),
    back: `Jelaskan makna "${keyword}" berdasarkan teks tentang ${topic}.`,
  }))

  return {
    id: `import-flashcard-${Date.now()}`,
    title: `Flashcard ${topic}`,
    subject: form.subject,
    className: `Kelas ${form.className}`,
    topic,
    count: cards.length,
    progress: 0,
    cards,
    source: 'import-text',
  }
}

function buildImportTextDraft(form) {
  const text = form.sourceText.trim()
  const topic = form.topic.trim() || 'Materi dari teks'
  const sentences = splitSourceSentences(text)
  const keywords = extractSourceKeywords(text, 10)
  const questions = buildQuestionsFromText(text, topic, form)
  const flashcards = buildFlashcardsFromText(text, topic, form)

  const summary = sentences.slice(0, 3).join('. ') || `Teks ini membahas ${topic}. Guru dapat mengembangkan materi dengan contoh, latihan, dan refleksi.`
  const importantPoints = keywords.length > 0
    ? keywords.slice(0, 6).map((keyword, index) => `${index + 1}. ${titleCase(keyword)}`).join('\n')
    : `1. Konsep utama ${topic}\n2. Contoh penerapan\n3. Latihan pemahaman\n4. Refleksi siswa`

  return {
    id: `studio-import-text-${Date.now()}`,
    title: `Import Teks: ${topic}`,
    subject: form.subject,
    className: form.className,
    topic,
    contentType: 'Import teks',
    outputType: form.outputType || 'Materi',
    level: form.level,
    duration: form.duration,
    createdAt: new Date().toISOString(),
    source: 'import-text',
    importedText: text,
    generatedQuestions: questions,
    generatedFlashcard: flashcards,
    sections: [
      { title: 'Ringkasan materi', body: summary },
      { title: 'Poin penting', body: importantPoints },
      { title: 'Glosarium / flashcard', body: flashcards.cards.map((card) => `${card.front}: ${card.back}`).join('\n') },
      { title: '5 soal pilihan ganda', body: questions.map((question, index) => `${index + 1}. ${question.questionText}\nJawaban: ${question.correctAnswer}`).join('\n\n') },
      {
        title: '3 pertanyaan refleksi',
        body: [
          `Apa gagasan paling penting dari teks tentang ${topic}?`,
          `Bagian mana yang masih membingungkan dan perlu dijelaskan ulang?`,
          `Bagaimana konsep ${topic} bisa digunakan dalam kehidupan sehari-hari atau lingkungan sekolah?`,
        ].join('\n'),
      },
      {
        title: 'LKPD singkat',
        body: `A. Baca teks dengan teliti.\nB. Tandai 5 kata/konsep penting.\nC. Buat peta konsep sederhana.\nD. Jawab 5 soal pilihan ganda.\nE. Tulis kesimpulan ${topic} dengan bahasa sendiri.`,
      },
      {
        title: 'Exit ticket',
        body: `Sebelum keluar kelas, tuliskan: 1 hal yang dipahami, 1 pertanyaan, dan 1 contoh penerapan ${topic}.`,
      },
    ],
    tools: ['Text Analyzer', 'Flashcard Maker', 'Quiz Maker', 'LKPD Builder', 'Exit Ticket'],
  }
}


function parseVideoQuestions(text) {
  const lines = String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const parsed = lines.map((line, index) => {
    const parts = line.split('|').map((item) => item.trim())
    if (parts.length >= 2) {
      return {
        id: `video-question-${Date.now()}-${index + 1}`,
        timestamp: parts[0],
        question: parts.slice(1).join(' | '),
      }
    }

    return {
      id: `video-question-${Date.now()}-${index + 1}`,
      timestamp: `0${index + 1}:00`,
      question: line,
    }
  })

  return parsed.length > 0 ? parsed : [
    {
      id: `video-question-${Date.now()}-1`,
      timestamp: '00:30',
      question: 'Apa konsep awal yang dijelaskan dalam video?',
    },
    {
      id: `video-question-${Date.now()}-2`,
      timestamp: '03:00',
      question: 'Contoh apa yang muncul dan bagaimana siswa menjelaskannya kembali?',
    },
    {
      id: `video-question-${Date.now()}-3`,
      timestamp: '05:00',
      question: 'Apa kesimpulan penting dari video?',
    },
  ]
}

function buildVideoQuestions(form, parsedQuestions) {
  const topic = form.topic?.trim() || form.videoTitle?.trim() || 'Video pembelajaran'

  return parsedQuestions.slice(0, 5).map((item, index) => ({
    id: `video-quiz-${Date.now()}-${index + 1}`,
    questionText: `${item.timestamp} — ${item.question}`,
    options: [
      `Jawaban sesuai isi video tentang ${topic}.`,
      'Jawaban tidak berkaitan dengan isi video.',
      'Siswa tidak perlu menonton bagian tersebut.',
      'Bagian video tersebut tidak memiliki konsep penting.',
    ],
    correctAnswer: `Jawaban sesuai isi video tentang ${topic}.`,
    explanation: `Pertanyaan ini mengarahkan siswa untuk memperhatikan bagian video pada ${item.timestamp}.`,
    subject: form.subject,
    className: `Kelas ${form.className}`,
    topic,
    difficulty: form.level === 'Menantang' ? 'Sulit' : form.level === 'Mudah' ? 'Mudah' : 'Sedang',
    type: 'Pilihan ganda',
    source: 'video-interactive',
  }))
}

function buildVideoFlashcard(form) {
  const topic = form.topic?.trim() || form.videoTitle?.trim() || 'Video pembelajaran'
  const cards = [
    ['Konsep utama video', `Tuliskan ide pokok dari video tentang ${topic}.`],
    ['Contoh dalam video', 'Contoh nyata yang muncul dalam video dan bisa dijelaskan ulang oleh siswa.'],
    ['Pertanyaan timestamp', 'Pertanyaan yang dijawab siswa pada menit tertentu saat menonton video.'],
    ['Catatan guru', 'Arahan tambahan agar siswa menonton video secara aktif.'],
    ['Exit ticket', 'Refleksi singkat setelah siswa selesai menonton video.'],
  ]

  return {
    id: `video-flashcard-${Date.now()}`,
    title: `Flashcard Video ${topic}`,
    subject: form.subject,
    className: `Kelas ${form.className}`,
    topic,
    count: cards.length,
    progress: 0,
    cards: cards.map(([front, back], index) => ({
      id: `video-card-${Date.now()}-${index + 1}`,
      front,
      back,
    })),
    source: 'video-interactive',
  }
}

function buildVideoInteractiveDraft(form) {
  const topic = form.topic?.trim() || form.videoTitle?.trim() || 'Video pembelajaran'
  const videoTitle = form.videoTitle?.trim() || `Video Interaktif: ${topic}`
  const parsedQuestions = parseVideoQuestions(form.videoTimestamps)
  const generatedQuestions = buildVideoQuestions(form, parsedQuestions)
  const generatedFlashcard = buildVideoFlashcard(form)

  return {
    id: `studio-video-interactive-${Date.now()}`,
    title: videoTitle,
    subject: form.subject,
    className: form.className,
    topic,
    contentType: 'Video interaktif',
    outputType: 'Video Interaktif',
    level: form.level,
    duration: form.duration,
    createdAt: new Date().toISOString(),
    source: 'video-interactive',
    videoUrl: form.videoUrl,
    videoTitle,
    videoQuestions: parsedQuestions,
    generatedQuestions,
    generatedFlashcard,
    sections: [
      {
        title: 'Link video',
        body: form.videoUrl || 'Link video belum diisi.',
      },
      {
        title: 'Tujuan menonton',
        body: `Siswa menonton video untuk memahami konsep ${topic}, mencatat poin penting, dan menjawab pertanyaan pada timestamp tertentu.`,
      },
      {
        title: 'Pertanyaan berbasis timestamp',
        body: parsedQuestions.map((item, index) => `${index + 1}. ${item.timestamp} — ${item.question}`).join('\n'),
      },
      {
        title: 'Catatan guru',
        body: form.videoNote?.trim() || 'Minta siswa menonton secara aktif, menjeda video pada timestamp pertanyaan, lalu menulis jawaban singkat.',
      },
      {
        title: 'Aktivitas siswa',
        body: `A. Tonton video.\nB. Jeda pada timestamp yang ditentukan.\nC. Jawab pertanyaan.\nD. Diskusikan jawaban dengan teman.\nE. Tulis kesimpulan tentang ${topic}.`,
      },
      {
        title: '5 soal pilihan ganda',
        body: generatedQuestions.map((question, index) => `${index + 1}. ${question.questionText}\nJawaban: ${question.correctAnswer}`).join('\n\n'),
      },
      {
        title: 'Exit ticket',
        body: `Setelah menonton video, tuliskan 1 hal baru yang dipahami, 1 bagian yang masih membingungkan, dan 1 contoh penerapan ${topic}.`,
      },
    ],
    tools: ['Video Question Builder', 'Timestamp Prompt', 'Quiz Maker', 'Flashcard Maker', 'Exit Ticket'],
  }
}


function readRowsByPrefix(prefix) {
  if (typeof localStorage === 'undefined') return []

  return Object.keys(localStorage)
    .filter((key) => key.startsWith(prefix))
    .flatMap((key) => {
      try {
        const rows = JSON.parse(localStorage.getItem(key)) || []
        return Array.isArray(rows) ? rows : []
      } catch (error) {
        return []
      }
    })
}

function countByField(rows, field) {
  return rows.reduce((acc, item) => {
    const key = item?.[field] || 'Lainnya'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
}

function topEntries(counter, limit = 6) {
  return Object.entries(counter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }))
}

function getTeacherAnalyticsSnapshot(contentRows, rubricRows) {
  const flashcards = readStorage(FLASHCARD_KEY, [])
  const materials = readRowsByPrefix('sea-learning-teacher-materials-')
  const questions = readRowsByPrefix('sea-learning-teacher-questions-')
  const quizzes = readRowsByPrefix('sea-learning-teacher-quizzes-')
  const assignments = readRowsByPrefix('sea-learning-teacher-assignments-')

  const allContent = [
    ...contentRows,
    ...materials.map((item) => ({ ...item, outputType: 'Materi' })),
    ...assignments.map((item) => ({ ...item, outputType: 'Tugas' })),
    ...quizzes.map((item) => ({ ...item, outputType: 'Kuis Live' })),
    ...flashcards.map((item) => ({ ...item, outputType: 'Flashcard' })),
    ...rubricRows.map((item) => ({ ...item, outputType: 'Rubrik' })),
  ]

  const subjectCounts = topEntries(countByField(allContent, 'subject'))
  const typeCounts = topEntries(countByField(allContent, 'outputType'))

  const recentItems = allContent
    .filter((item) => item?.title)
    .sort((a, b) => String(b.createdAt || b.id || '').localeCompare(String(a.createdAt || a.id || '')))
    .slice(0, 8)

  const recommendations = []

  if (materials.length < 3) {
    recommendations.push({
      title: 'Tambah materi inti',
      description: 'Jumlah materi guru masih sedikit. Buat materi inti dari Smart Templates atau Import Teks.',
      tone: 'cyan',
    })
  }

  if (questions.length < 10) {
    recommendations.push({
      title: 'Perbanyak bank soal',
      description: 'Bank soal masih perlu diperkuat. Gunakan Import Teks atau Video Builder untuk membuat soal otomatis.',
      tone: 'purple',
    })
  }

  if (quizzes.length < 2) {
    recommendations.push({
      title: 'Buat kuis diagnostik',
      description: 'Kuis diagnostik membantu guru melihat pemahaman awal siswa sebelum remedial.',
      tone: 'amber',
    })
  }

  if (flashcards.length < 2) {
    recommendations.push({
      title: 'Buat flashcard konsep',
      description: 'Flashcard membantu siswa mengulang istilah penting dan konsep inti secara cepat.',
      tone: 'green',
    })
  }

  if (!contentRows.some((item) => item.outputType === 'Remedial')) {
    recommendations.push({
      title: 'Siapkan remedial otomatis',
      description: 'Belum ada paket remedial dari Studio Konten. Buat satu paket untuk siswa yang belum tuntas.',
      tone: 'amber',
    })
  }

  if (!contentRows.some((item) => item.outputType === 'Pengayaan')) {
    recommendations.push({
      title: 'Siapkan pengayaan',
      description: 'Belum ada paket pengayaan. Buat tantangan tambahan untuk siswa yang sudah memahami materi.',
      tone: 'cyan',
    })
  }

  return {
    totals: {
      content: contentRows.length,
      materials: materials.length,
      questions: questions.length,
      quizzes: quizzes.length,
      assignments: assignments.length,
      flashcards: flashcards.length,
      rubrics: rubricRows.length,
      all: allContent.length,
    },
    subjectCounts,
    typeCounts,
    recentItems,
    recommendations,
  }
}

function makeRecommendedLearningPack(kind) {
  const isRemedial = kind === 'Remedial'
  const topic = isRemedial ? 'Penguatan konsep dasar' : 'Tantangan lanjutan'
  const title = isRemedial ? 'Remedial Otomatis: Penguatan Konsep' : 'Pengayaan Otomatis: Tantangan Lanjutan'

  return {
    id: `studio-auto-${kind.toLowerCase()}-${Date.now()}`,
    title,
    subject: 'Umum',
    className: 'Kelas X',
    topic,
    contentType: isRemedial ? 'Remedial' : 'Pengayaan',
    outputType: kind,
    savedAs: kind,
    level: isRemedial ? 'Mudah' : 'Menantang',
    duration: '1 JP',
    createdAt: new Date().toISOString(),
    source: 'analytics-recommendation',
    sections: [
      {
        title: isRemedial ? 'Tujuan remedial' : 'Tujuan pengayaan',
        body: isRemedial
          ? 'Membantu siswa mengulang konsep dasar dengan contoh lebih sederhana dan latihan bertahap.'
          : 'Memberikan tantangan lanjutan bagi siswa yang sudah memahami konsep inti.',
      },
      {
        title: 'Aktivitas siswa',
        body: isRemedial
          ? 'A. Baca ringkasan singkat. B. Kerjakan contoh terbimbing. C. Jawab 5 latihan mudah. D. Tulis bagian yang masih sulit.'
          : 'A. Baca studi kasus. B. Buat solusi atau penjelasan alternatif. C. Presentasikan hasil. D. Tulis refleksi.',
      },
      {
        title: 'Latihan',
        body: isRemedial
          ? 'Buat 5 soal dasar, 3 soal penerapan sederhana, dan 1 refleksi pemahaman.'
          : 'Buat 3 soal HOTS, 1 proyek kecil, dan 1 pertanyaan reflektif.',
      },
      {
        title: 'Feedback guru',
        body: isRemedial
          ? 'Berikan umpan balik singkat pada konsep yang belum dikuasai siswa.'
          : 'Berikan apresiasi pada ide orisinal, argumentasi, dan kerapian produk siswa.',
      },
      {
        title: 'Exit ticket',
        body: isRemedial
          ? 'Tulis satu konsep yang sudah lebih dipahami dan satu hal yang masih perlu ditanyakan.'
          : 'Tulis satu ide baru yang ditemukan dan satu penerapan konsep dalam kehidupan nyata.',
      },
    ],
    tools: isRemedial ? ['Latihan bertahap', 'Feedback singkat', 'Exit Ticket'] : ['Studi kasus', 'Proyek kecil', 'Refleksi'],
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


function gradeNumberFromClassName(className) {
  const value = String(className || '').toUpperCase()
  if (value.includes('XII')) return 12
  if (value.includes('XI')) return 11
  if (value.includes('X')) return 10
  const number = Number(value.replace(/[^0-9]/g, ''))
  return Number.isFinite(number) && number > 0 ? number : null
}

function resolveStudioSubjectId(lookups, subjectName) {
  const normalized = String(subjectName || '').trim().toLowerCase()
  if (!normalized) return ''
  const subject = lookups.subjects.find((item) => (
    String(item.name || '').trim().toLowerCase() === normalized
    || String(item.code || '').trim().toLowerCase() === normalized
  ))
  return subject?.id || ''
}

function resolveStudioClassId(lookups, className) {
  const normalized = String(className || '').replace(/^kelas\s+/i, '').trim().toLowerCase()
  if (!normalized) return ''
  const exact = lookups.classes.find((item) => String(item.name || '').trim().toLowerCase() === normalized)
  if (exact) return exact.id

  const grade = gradeNumberFromClassName(normalized)
  if (grade) {
    const gradeMatch = lookups.classes.find((item) => Number(item.grade) === grade)
    if (gradeMatch) return gradeMatch.id
  }

  const partial = lookups.classes.find((item) => String(item.name || '').trim().toLowerCase().startsWith(normalized))
  return partial?.id || ''
}

function enrichStudioQuestion(question, { subjectId, classId, topic }) {
  const options = Array.isArray(question.options) && question.options.length > 0
    ? question.options
    : ['Benar', 'Salah', 'Perlu diskusi', 'Belum cukup informasi']

  return {
    questionText: question.questionText || question.prompt || `Pertanyaan tentang ${topic}`,
    options,
    correctAnswer: question.correctAnswer || question.answer || options[0],
    explanation: question.explanation || `Pembahasan terkait ${topic}.`,
    subjectId,
    classId,
    topic,
    difficulty: question.difficulty || 'Sedang',
    type: question.type || 'Pilihan ganda',
  }
}

async function saveStudioQuestionsToSupabase({ accessToken, teacherId, questions, context }) {
  const savedQuestions = []
  for (const question of questions) {
    const saved = await saveQuestion({
      accessToken,
      teacherId,
      question: enrichStudioQuestion(question, context),
    })
    savedQuestions.push(saved)
  }
  return savedQuestions
}

async function publishStudioDraftToSupabase({ target, accessToken, user, form, preview, lookups }) {
  const subject = form.subject || user?.subject || 'Bahasa Inggris'
  const className = String(form.className || '').startsWith('Kelas') ? form.className : `Kelas ${form.className || 'umum'}`
  const topic = preview.topic || form.topic || 'Topik pembelajaran'
  const contentText = previewToPlainText(preview)
  const subjectId = resolveStudioSubjectId(lookups, subject)
  const classId = resolveStudioClassId(lookups, form.className)

  const context = { subjectId, classId, topic }

  if (target === 'materi') {
    await saveMaterial({
      accessToken,
      teacherId: user.id,
      material: {
        title: preview.title || `Materi ${topic}`,
        description: `Draft materi dari Studio Konten untuk topik ${topic}.`,
        content: contentText,
        subjectId,
        classId,
        subject,
        className,
        topic,
        type: 'Teks',
        status: 'Draft',
      },
    })
    return
  }

  if (target === 'tugas') {
    await saveAssignment({
      accessToken,
      teacherId: user.id,
      assignment: {
        title: `Tugas ${topic}`,
        description: contentText.slice(0, 900),
        subjectId,
        classId,
        subject,
        className,
        deadline: '',
        status: 'Draft',
      },
    })
    return
  }

  if (target === 'bank-soal') {
    const generatedQuestions = preview.generatedQuestions || makeGeneratedQuestions(preview, form, 5)
    await saveStudioQuestionsToSupabase({
      accessToken,
      teacherId: user.id,
      questions: generatedQuestions.slice(0, 8),
      context,
    })
    return
  }

  if (target === 'kuis') {
    const generatedQuestions = preview.generatedQuestions || makeGeneratedQuestions(preview, form, 5)
    const savedQuestions = await saveStudioQuestionsToSupabase({
      accessToken,
      teacherId: user.id,
      questions: generatedQuestions.slice(0, 8),
      context,
    })

    await saveQuiz({
      accessToken,
      teacherId: user.id,
      quiz: {
        title: `Kuis ${topic}`,
        description: contentText.slice(0, 700),
        subjectId,
        classId,
        subject,
        className,
        duration: 30,
        status: 'Draft',
      },
      questionIds: savedQuestions.map((question) => question.id),
    })
  }
}


export default function ContentStudio({ user: propUser }) {
  const authContext = useAuth()
  const user = propUser || authContext.user
  const accessToken = authContext.accessToken
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
    videoTitle: '',
    videoTimestamps: '00:30 | Apa konsep awal yang disampaikan?\n03:00 | Contoh apa yang muncul dalam video?\n05:00 | Apa kesimpulan penting dari video?',
    videoNote: '',
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
  const [lookups, setLookups] = useState({ subjects: [], classes: [] })
  const [savingTarget, setSavingTarget] = useState('')

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


  useEffect(() => {
    let active = true

    async function loadLookups() {
      if (!accessToken) {
        setLookups({ subjects: [], classes: [] })
        return
      }

      try {
        const lookupRows = await fetchMaterialLookups({ accessToken })
        if (active) setLookups(lookupRows)
      } catch (lookupError) {
        if (active) {
          setLookups({ subjects: [], classes: [] })
          setToast(`Lookup Supabase belum tersedia: ${lookupError.message}`)
        }
      }
    }

    loadLookups()

    return () => {
      active = false
    }
  }, [accessToken])

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

  async function publishToFeature(target) {
    const subject = form.subject || user?.subject || 'Bahasa Inggris'
    const className = `Kelas ${form.className}`
    const topic = preview.topic || form.topic || 'Topik pembelajaran'
    const contentText = previewToPlainText(preview)
    const supabaseTargets = ['materi', 'tugas', 'bank-soal', 'kuis']

    if (supabaseTargets.includes(target) && accessToken && user?.id) {
      try {
        setSavingTarget(target)
        setToast('Menyimpan draft ke Supabase...')
        await publishStudioDraftToSupabase({ target, accessToken, user, form, preview, lookups })
        showDeliverySuccess(target)
      } catch (publishError) {
        setToast(`Gagal mengirim ke Supabase: ${publishError.message}`)
      } finally {
        setSavingTarget('')
      }
      return
    }


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
      const generatedQuestions = preview.generatedQuestions || makeGeneratedQuestions(preview, form, 5)
      appendStorageRows(teacherStorageKey('questions', user, subject), generatedQuestions)
      showDeliverySuccess('bank-soal')
      return
    }

    if (target === 'kuis') {
      const generatedQuestions = preview.generatedQuestions || makeGeneratedQuestions(preview, form, 5)
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
      const flashcard = preview.generatedFlashcard || makeFlashcards(preview, form)
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

  function useSmartTemplate(template) {
    const nextForm = {
      ...form,
      subject: template.subject || form.subject,
      topic: template.topic || template.sampleTopic || form.topic,
      contentType: template.contentType || template.type || form.contentType,
      outputType: template.outputType || form.outputType || 'Materi',
      level: template.level || form.level || 'Standar',
      duration: template.duration || form.duration || '2 JP',
    }

    const draft = buildSmartTemplateDraft(template, nextForm)

    setForm(nextForm)
    setPreview(draft)
    setDeliveryStatus(null)
    setActiveTab('builder')
    setToast(`Template "${template.title}" siap digunakan. Cek preview lalu kirim ke fitur aplikasi.`)
  }

  function applyQualitySuggestion() {
    const topic = preview.topic || form.topic || 'topik pembelajaran'
    const qualitySection = {
      title: 'Catatan Perbaikan dari Quality Check',
      body: `Perkuat draft ini dengan tujuan pembelajaran yang terukur, contoh kontekstual untuk siswa, minimal 3 pertanyaan cek pemahaman, aktivitas diferensiasi, dan exit ticket tentang ${topic}.`,
    }

    const currentSections = Array.isArray(preview.sections) ? preview.sections : []
    const cleanedSections = currentSections.filter((section) => section.title !== qualitySection.title)

    setPreview({
      ...preview,
      sections: [...cleanedSections, qualitySection],
      tools: Array.from(new Set([...(preview.tools || []), 'Quality checklist', 'Exit ticket', 'Diferensiasi'])),
    })
    setDeliveryStatus(null)
    setActiveTab('builder')
    setToast('Saran Quality Check ditambahkan ke preview draft.')
  }

  function createFromText() {
    if (!form.sourceText.trim()) {
      setToast('Tempel teks materi terlebih dahulu.')
      return
    }

    const draft = buildImportTextDraft(form)
    setPreview(draft)
    setDeliveryStatus(null)
    setToast('Teks berhasil diubah menjadi materi, soal, flashcard, LKPD, dan exit ticket.')
  }

  function createVideoInteractive() {
    if (!form.videoUrl.trim()) {
      setToast('Tempel link video terlebih dahulu.')
      return
    }

    const draft = buildVideoInteractiveDraft(form)
    setPreview(draft)
    setDeliveryStatus(null)
    setToast('Video interaktif berhasil dibuat dengan pertanyaan timestamp, soal, flashcard, dan exit ticket.')
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

      <StudioWorkflowGuide activeTab={activeTab} />

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          ['builder', 'AI Lesson Builder', Wand2],
          ['templates', 'Smart Templates', Layers3],
          ['stem', 'STEM Tools', FlaskConical],
          ['rubric', 'Rubric Builder', ClipboardList],
          ['import', 'Import Teks/Video', LinkIcon],
          ['quality', 'Quality Check', CheckCircle2],
          ['analytics', 'Analitik Guru', Target],
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
          <PreviewPanel preview={preview} publishToFeature={publishToFeature} deliveryStatus={deliveryStatus} savingTarget={savingTarget} />
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
          <PreviewPanel preview={preview} publishToFeature={publishToFeature} deliveryStatus={deliveryStatus} savingTarget={savingTarget} />
        </div>
      )}

      {activeTab === 'quality' && (
        <QualityCheckPanel preview={preview} form={form} onApplySuggestion={applyQualitySuggestion} />
      )}


      {activeTab === 'analytics' && (
        <AnalyticsPanel contentRows={contentRows} rubricRows={rubricRows} preview={preview} />
      )}


      {activeTab === 'archive' && <ArchivePanel contentRows={contentRows} rubricRows={rubricRows} />}

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}


function StudioWorkflowGuide({ activeTab }) {
  const activeLabels = {
    builder: 'AI Lesson Builder',
    templates: 'Smart Templates',
    stem: 'STEM Tools',
    rubric: 'Rubric Builder',
    import: 'Import Teks/Video',
    archive: 'Arsip Lokal',
  }

  return (
    <SectionCard className="mb-5 bg-gradient-to-br from-white via-violet-50/70 to-cyan-50/80">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Alur Kerja Guru</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Buat konten sampai siap dipakai siswa.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Anda sedang berada di mode <b>{activeLabels[activeTab] || 'Studio Konten'}</b>. Ikuti alur sederhana ini agar konten tidak berhenti di draft saja.
          </p>
        </div>
        <StatusBadge tone="green">Panduan Cepat</StatusBadge>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {contentStudioWorkflowSteps.map((step, index) => (
          <div key={step.title} className="rounded-3xl bg-white p-4 ring-1 ring-purple-100">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-galaxy-action text-sm font-black text-white">
              {index + 1}
            </span>
            <h3 className="mt-3 text-sm font-extrabold text-slate-950">{step.title}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">{step.text}</p>
          </div>
        ))}
      </div>
    </SectionCard>
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


function buildContentQualityReport(preview, form) {
  const text = previewToPlainText(preview)
  const words = text.split(/\s+/).filter(Boolean)
  const sections = Array.isArray(preview.sections) ? preview.sections : []
  const questions = Array.isArray(preview.generatedQuestions) ? preview.generatedQuestions : []
  const tools = Array.isArray(preview.tools) ? preview.tools : []

  const checks = [
    {
      label: 'Judul jelas dan sesuai topik',
      passed: String(preview.title || '').trim().length >= 8,
      suggestion: 'Buat judul lebih spesifik sesuai topik dan kelas.',
    },
    {
      label: 'Struktur materi minimal 3 bagian',
      passed: sections.length >= 3,
      suggestion: 'Tambahkan tujuan, aktivitas, latihan, dan penutup.',
    },
    {
      label: 'Konten cukup lengkap untuk dipakai guru',
      passed: words.length >= 120,
      suggestion: 'Perpanjang penjelasan, contoh, dan langkah kegiatan.',
    },
    {
      label: 'Ada pertanyaan cek pemahaman',
      passed: questions.length >= 3 || text.toLowerCase().includes('pertanyaan'),
      suggestion: 'Tambahkan minimal 3 pertanyaan formatif.',
    },
    {
      label: 'Ada aktivitas siswa',
      passed: text.toLowerCase().includes('aktivitas') || text.toLowerCase().includes('diskusi') || text.toLowerCase().includes('latihan'),
      suggestion: 'Tambahkan aktivitas individu/kelompok yang jelas.',
    },
    {
      label: 'Ada alat bantu atau strategi pembelajaran',
      passed: tools.length > 0,
      suggestion: 'Tambahkan tools, media, rubrik, atau strategi diferensiasi.',
    },
  ]

  const passed = checks.filter((item) => item.passed).length
  const score = Math.round((passed / checks.length) * 100)

  return {
    score,
    words: words.length,
    sections: sections.length,
    questions: questions.length,
    tools: tools.length,
    checks,
    tone: score >= 80 ? 'green' : score >= 60 ? 'amber' : 'rose',
    label: score >= 80 ? 'Siap dipakai' : score >= 60 ? 'Perlu sedikit revisi' : 'Perlu dilengkapi',
  }
}

function QualityCheckPanel({ preview, form, onApplySuggestion }) {
  const report = buildContentQualityReport(preview, form)

  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <SectionCard>
        <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Quality Check</p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">Cek kelayakan draft sebelum publish.</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Panel ini membantu guru melihat apakah konten sudah punya struktur, aktivitas, pertanyaan, dan alat bantu yang cukup.
        </p>

        <div className="mt-5 rounded-[1.75rem] bg-galaxy-surface p-5 ring-1 ring-purple-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-500">Skor kualitas</p>
              <p className="mt-1 text-5xl font-black text-slate-950">{report.score}%</p>
            </div>
            <StatusBadge tone={report.tone}>{report.label}</StatusBadge>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <StatCard label="Kata" value={report.words} tone="cyan" />
            <StatCard label="Bagian" value={report.sections} tone="purple" />
            <StatCard label="Soal" value={report.questions} tone="amber" />
            <StatCard label="Tools" value={report.tools} tone="green" />
          </div>
        </div>

        <button
          onClick={onApplySuggestion}
          className="mt-5 w-full rounded-2xl bg-galaxy-action px-5 py-3 text-sm font-extrabold text-white shadow-glow"
        >
          Terapkan saran kualitas ke draft
        </button>
      </SectionCard>

      <SectionCard>
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Checklist Publish</p>
            <h2 className="text-xl font-black text-slate-950">Yang perlu dicek guru</h2>
          </div>
          <StatusBadge tone={report.tone}>{report.score}%</StatusBadge>
        </div>

        <div className="grid gap-3">
          {report.checks.map((check) => (
            <div key={check.label} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <div className="flex items-start gap-3">
                <span className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-2xl ${
                  check.passed ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' : 'bg-amber-50 text-amber-600 ring-amber-100'
                } ring-1`}>
                  {check.passed ? '✓' : '!'}
                </span>
                <div>
                  <p className="font-extrabold text-slate-950">{check.label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {check.passed ? 'Sudah terpenuhi.' : check.suggestion}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function AnalyticsPanel({ contentRows, rubricRows, preview }) {
  const rows = Array.isArray(contentRows) ? contentRows : []
  const rubrics = Array.isArray(rubricRows) ? rubricRows : []
  const byType = rows.reduce((acc, row) => {
    const key = row.savedAs || row.outputType || 'Draft'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const bySubject = rows.reduce((acc, row) => {
    const key = row.subject || 'Umum'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const topTypes = Object.entries(byType).sort((a, b) => b[1] - a[1])
  const topSubjects = Object.entries(bySubject).sort((a, b) => b[1] - a[1])
  const previewReport = buildContentQualityReport(preview, { topic: preview.topic })

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Konten arsip" value={rows.length} tone="cyan" />
        <StatCard label="Rubrik" value={rubrics.length} tone="purple" />
        <StatCard label="Kuis draft" value={rows.filter((row) => row.outputType === 'Kuis' || row.savedAs === 'Kuis').length} tone="amber" />
        <StatCard label="Kualitas draft" value={`${previewReport.score}%`} tone="green" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Distribusi Konten</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Jenis konten yang dibuat</h2>
          <div className="mt-4 grid gap-3">
            {(topTypes.length ? topTypes : [['Belum ada arsip', 0]]).map(([label, total]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                <span className="font-bold text-slate-700">{label}</span>
                <StatusBadge tone="cyan">{total}</StatusBadge>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Sebaran Mapel</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Mapel paling sering dibuat</h2>
          <div className="mt-4 grid gap-3">
            {(topSubjects.length ? topSubjects : [['Belum ada arsip', 0]]).map(([label, total]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                <span className="font-bold text-slate-700">{label}</span>
                <StatusBadge tone="purple">{total}</StatusBadge>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Draft Aktif</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">{preview.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Analitik ini membantu guru melihat kesiapan draft sebelum dikirim ke Materi, Bank Soal, Kuis Live, atau Flashcard.
            </p>
          </div>
          <StatusBadge tone={previewReport.tone}>{previewReport.label}</StatusBadge>
        </div>
      </SectionCard>
    </div>
  )
}


function PreviewPanel({ preview, publishToFeature, deliveryStatus, savingTarget }) {
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

          <div className="mt-4 rounded-3xl bg-white p-4 ring-1 ring-slate-100">
            <p className="text-sm font-extrabold text-slate-950">Checklist sebelum publish</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {publishChecklistItems.map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-600">
                  <CheckCircle2 className="mt-0.5 flex-shrink-0 text-emerald-500" size={16} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {featureTargets.map((target) => {
              const Icon = target.icon
              return (
                <button
                  key={target.id}
                  onClick={() => publishToFeature(target.id)}
                  disabled={savingTarget === target.id}
                  className="group rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-purple-100 transition hover:-translate-y-0.5 hover:shadow-soft hover:ring-purple-200 disabled:cursor-wait disabled:opacity-70"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl bg-galaxy-lavender text-galaxy-purple ring-1 ring-purple-100 group-hover:bg-galaxy-action group-hover:text-white">
                      <Icon size={19} />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-extrabold text-slate-950">{savingTarget === target.id ? "Menyimpan..." : target.label}</p>
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
  const [activeTool, setActiveTool] = useState('graph')

  const tools = [
    ['graph', 'Graphing Tool', Calculator, 'Grafik fungsi linear dan kuadrat sederhana.'],
    ['unit', 'Unit Converter', Calculator, 'Konversi satuan panjang, massa, suhu, dan waktu.'],
    ['physics', 'Physics Helper', Atom, 'Rumus fisika populer dengan kalkulasi cepat.'],
    ['chemistry', 'Chemistry Helper', Beaker, 'Stoikiometri dasar dan catatan persamaan reaksi.'],
    ['periodic', 'Periodic Table Mini', FlaskConical, 'Data unsur penting untuk pembelajaran kimia.'],
  ]

  return (
    <div className="grid gap-5">
      <SectionCard>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Smart STEM Tools</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Tools interaktif untuk Matematika, Fisika, Kimia, dan Biologi.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Guru bisa memakai tools ini untuk membuat contoh, aktivitas kelas, LKPD, latihan, dan demonstrasi konsep tanpa API berbayar.
            </p>
          </div>
          <StatusBadge tone="green">Tahap 6</StatusBadge>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {tools.map(([id, label, Icon, description]) => (
            <button
              key={id}
              onClick={() => setActiveTool(id)}
              className={`rounded-[1.5rem] p-4 text-left ring-1 transition hover:-translate-y-0.5 hover:shadow-soft ${
                activeTool === id
                  ? 'bg-galaxy-action text-white ring-galaxy-action'
                  : 'bg-white text-slate-700 ring-purple-100 hover:bg-galaxy-lavender'
              }`}
            >
              <Icon size={22} />
              <p className="mt-3 font-extrabold">{label}</p>
              <p className={`mt-1 text-xs leading-5 ${activeTool === id ? 'text-white/80' : 'text-slate-500'}`}>{description}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      {activeTool === 'graph' && <GraphingTool />}
      {activeTool === 'unit' && <UnitConverterTool />}
      {activeTool === 'physics' && <PhysicsFormulaHelper />}
      {activeTool === 'chemistry' && <ChemistryHelper />}
      {activeTool === 'periodic' && <PeriodicTableMini />}

      <SectionCard>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Resource eksternal</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Simulasi dan kalkulator siap pakai.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Gunakan resource ini untuk membuat pembelajaran STEM lebih visual dan interaktif.
            </p>
          </div>
          <StatusBadge tone="cyan">GeoGebra · Desmos · PhET</StatusBadge>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {stemResources.map((resource) => (
            <StemResourceCard key={resource.title} resource={resource} />
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function GraphingTool() {
  const [mode, setMode] = useState('quadratic')
  const [a, setA] = useState('1')
  const [b, setB] = useState('0')
  const [c, setC] = useState('0')
  const [m, setM] = useState('1')
  const [n, setN] = useState('0')

  const A = Number(a) || 0
  const B = Number(b) || 0
  const C = Number(c) || 0
  const M = Number(m) || 0
  const N = Number(n) || 0

  const points = Array.from({ length: 41 }).map((_, index) => {
    const x = -10 + index * 0.5
    const y = mode === 'quadratic' ? A * x * x + B * x + C : M * x + N
    return { x, y }
  })

  const yValues = points.map((point) => point.y)
  const minY = Math.min(-10, ...yValues)
  const maxY = Math.max(10, ...yValues)
  const spanY = maxY - minY || 1

  const polyline = points
    .map((point) => {
      const sx = ((point.x + 10) / 20) * 360
      const sy = 220 - ((point.y - minY) / spanY) * 200
      return `${sx},${sy}`
    })
    .join(' ')

  const equation = mode === 'quadratic'
    ? `y = ${A}x² ${B >= 0 ? '+' : '-'} ${Math.abs(B)}x ${C >= 0 ? '+' : '-'} ${Math.abs(C)}`
    : `y = ${M}x ${N >= 0 ? '+' : '-'} ${Math.abs(N)}`

  const vertexX = mode === 'quadratic' && A !== 0 ? -B / (2 * A) : null
  const vertexY = vertexX !== null ? A * vertexX * vertexX + B * vertexX + C : null

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard>
        <h2 className="text-xl font-extrabold text-slate-950">Graphing Tool</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Buat visual fungsi linear atau kuadrat untuk membantu siswa memahami bentuk grafik.
        </p>

        <div className="mt-5 grid gap-3">
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Jenis fungsi
            <select value={mode} onChange={(event) => setMode(event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
              <option value="quadratic">Kuadrat: y = ax² + bx + c</option>
              <option value="linear">Linear: y = mx + c</option>
            </select>
          </label>

          {mode === 'quadratic' ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniNumberInput label="a" value={a} setValue={setA} />
              <MiniNumberInput label="b" value={b} setValue={setB} />
              <MiniNumberInput label="c" value={c} setValue={setC} />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <MiniNumberInput label="m" value={m} setValue={setM} />
              <MiniNumberInput label="c" value={n} setValue={setN} />
            </div>
          )}
        </div>

        <div className="mt-5 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-sm font-extrabold text-slate-950">Persamaan</p>
          <p className="mt-2 text-2xl font-black text-galaxy-purple">{equation}</p>
          {mode === 'quadratic' && vertexX !== null && (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Titik puncak kira-kira di x = {formatNumber(vertexX)}, y = {formatNumber(vertexY)}.
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-950">Preview grafik</h2>
          <StatusBadge tone="purple">{mode === 'quadratic' ? 'Kuadrat' : 'Linear'}</StatusBadge>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl bg-white p-4 ring-1 ring-slate-100">
          <svg viewBox="0 0 360 240" className="h-72 w-full">
            <rect x="0" y="0" width="360" height="240" rx="18" fill="#F8FAFC" />
            <line x1="180" y1="10" x2="180" y2="230" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="10" y1="120" x2="350" y2="120" stroke="#CBD5E1" strokeWidth="1.5" />
            {Array.from({ length: 9 }).map((_, index) => {
              const x = 20 + index * 40
              return <line key={`vx-${index}`} x1={x} y1="20" x2={x} y2="220" stroke="#E2E8F0" strokeWidth="0.8" />
            })}
            {Array.from({ length: 6 }).map((_, index) => {
              const y = 30 + index * 35
              return <line key={`hy-${index}`} x1="20" y1={y} x2="340" y2={y} stroke="#E2E8F0" strokeWidth="0.8" />
            })}
            <polyline points={polyline} fill="none" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-500">
          Gunakan grafik ini sebagai ilustrasi cepat. Untuk eksplorasi lebih detail, buka GeoGebra atau Desmos di resource eksternal.
        </p>
      </SectionCard>
    </div>
  )
}

function UnitConverterTool() {
  const [category, setCategory] = useState('length')
  const [value, setValue] = useState('1')
  const [fromUnit, setFromUnit] = useState('m')
  const [toUnit, setToUnit] = useState('cm')

  const unitGroups = {
    length: {
      label: 'Panjang',
      units: { mm: 0.001, cm: 0.01, m: 1, km: 1000 },
    },
    mass: {
      label: 'Massa',
      units: { mg: 0.000001, g: 0.001, kg: 1, ton: 1000 },
    },
    time: {
      label: 'Waktu',
      units: { detik: 1, menit: 60, jam: 3600 },
    },
  }

  const group = unitGroups[category]
  const result = (Number(value) || 0) * group.units[fromUnit] / group.units[toUnit]

  function changeCategory(nextCategory) {
    const nextUnits = Object.keys(unitGroups[nextCategory].units)
    setCategory(nextCategory)
    setFromUnit(nextUnits[0])
    setToUnit(nextUnits[1] || nextUnits[0])
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard>
        <h2 className="text-xl font-extrabold text-slate-950">Unit Converter</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Konversi satuan dasar untuk Matematika, Fisika, dan Kimia.</p>

        <div className="mt-5 grid gap-3">
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Kategori
            <select value={category} onChange={(event) => changeCategory(event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
              {Object.entries(unitGroups).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}
            </select>
          </label>

          <MiniNumberInput label="Nilai" value={value} setValue={setValue} />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Dari
              <select value={fromUnit} onChange={(event) => setFromUnit(event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
                {Object.keys(group.units).map((unit) => <option key={unit}>{unit}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Ke
              <select value={toUnit} onChange={(event) => setToUnit(event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
                {Object.keys(group.units).map((unit) => <option key={unit}>{unit}</option>)}
              </select>
            </label>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="bg-gradient-to-br from-violet-50 to-cyan-50">
        <StatusBadge tone="cyan">Hasil konversi</StatusBadge>
        <p className="mt-5 text-4xl font-black text-slate-950">{formatNumber(result)} {toUnit}</p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {value || 0} {fromUnit} = {formatNumber(result)} {toUnit}
        </p>
        <div className="mt-5 rounded-3xl bg-white p-4 ring-1 ring-cyan-100">
          <p className="text-sm font-extrabold text-slate-950">Ide aktivitas</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Minta siswa membuat 5 contoh konversi satuan dari kehidupan sehari-hari, misalnya jarak rumah ke sekolah, massa benda, atau durasi kegiatan.
          </p>
        </div>
      </SectionCard>
    </div>
  )
}

function PhysicsFormulaHelper() {
  const [formula, setFormula] = useState('newton')
  const [x, setX] = useState('10')
  const [y, setY] = useState('2')

  const formulas = {
    newton: {
      label: 'Hukum II Newton',
      equation: 'F = m × a',
      xLabel: 'massa m (kg)',
      yLabel: 'percepatan a (m/s²)',
      resultLabel: 'gaya F',
      unit: 'N',
      calculate: (a, b) => a * b,
      explanation: 'Gaya adalah hasil kali massa dan percepatan.',
    },
    density: {
      label: 'Massa Jenis',
      equation: 'ρ = m ÷ V',
      xLabel: 'massa m (kg)',
      yLabel: 'volume V (m³)',
      resultLabel: 'massa jenis ρ',
      unit: 'kg/m³',
      calculate: (a, b) => b === 0 ? 0 : a / b,
      explanation: 'Massa jenis menunjukkan massa tiap satuan volume.',
    },
    wave: {
      label: 'Kecepatan Gelombang',
      equation: 'v = f × λ',
      xLabel: 'frekuensi f (Hz)',
      yLabel: 'panjang gelombang λ (m)',
      resultLabel: 'kecepatan v',
      unit: 'm/s',
      calculate: (a, b) => a * b,
      explanation: 'Kecepatan gelombang bergantung pada frekuensi dan panjang gelombang.',
    },
    ohm: {
      label: 'Hukum Ohm',
      equation: 'V = I × R',
      xLabel: 'arus I (A)',
      yLabel: 'hambatan R (Ω)',
      resultLabel: 'tegangan V',
      unit: 'V',
      calculate: (a, b) => a * b,
      explanation: 'Tegangan adalah hasil kali arus dan hambatan.',
    },
    kinetic: {
      label: 'Energi Kinetik',
      equation: 'Ek = ½ × m × v²',
      xLabel: 'massa m (kg)',
      yLabel: 'kecepatan v (m/s)',
      resultLabel: 'energi kinetik Ek',
      unit: 'J',
      calculate: (a, b) => 0.5 * a * b * b,
      explanation: 'Energi kinetik dipengaruhi oleh massa dan kuadrat kecepatan.',
    },
  }

  const current = formulas[formula]
  const result = current.calculate(Number(x) || 0, Number(y) || 0)

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard>
        <h2 className="text-xl font-extrabold text-slate-950">Physics Formula Helper</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Pilih rumus, masukkan nilai, lalu gunakan hasilnya sebagai contoh pembelajaran.</p>

        <div className="mt-5 grid gap-3">
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Rumus
            <select value={formula} onChange={(event) => setFormula(event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300">
              {Object.entries(formulas).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniNumberInput label={current.xLabel} value={x} setValue={setX} />
            <MiniNumberInput label={current.yLabel} value={y} setValue={setY} />
          </div>
        </div>
      </SectionCard>

      <SectionCard className="bg-gradient-to-br from-cyan-50 to-violet-50">
        <StatusBadge tone="cyan">{current.label}</StatusBadge>
        <p className="mt-4 text-3xl font-black text-galaxy-purple">{current.equation}</p>
        <p className="mt-5 text-4xl font-black text-slate-950">{formatNumber(result)} {current.unit}</p>
        <p className="mt-2 text-sm font-bold text-slate-600">{current.resultLabel}</p>
        <div className="mt-5 rounded-3xl bg-white p-4 ring-1 ring-cyan-100">
          <p className="text-sm font-extrabold text-slate-950">Pembahasan singkat</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{current.explanation}</p>
        </div>
      </SectionCard>
    </div>
  )
}

function ChemistryHelper() {
  const [mass, setMass] = useState('18')
  const [mr, setMr] = useState('18')
  const [equation, setEquation] = useState('2H₂ + O₂ → 2H₂O')
  const mol = (Number(mass) || 0) / ((Number(mr) || 1) || 1)

  const examples = [
    ['Pembentukan air', '2H₂ + O₂ → 2H₂O', 'Jumlah atom H dan O seimbang di kedua ruas.'],
    ['Pembakaran metana', 'CH₄ + 2O₂ → CO₂ + 2H₂O', 'Contoh reaksi pembakaran hidrokarbon sederhana.'],
    ['Pembentukan amonia', 'N₂ + 3H₂ → 2NH₃', 'Koefisien menunjukkan perbandingan mol zat.'],
  ]

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <SectionCard>
        <h2 className="text-xl font-extrabold text-slate-950">Chemistry Helper</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Bantu guru menjelaskan mol, Mr, dan persamaan reaksi sederhana.</p>

        <div className="mt-5 grid gap-3">
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Persamaan reaksi
            <input value={equation} onChange={(event) => setEquation(event.target.value)} className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniNumberInput label="massa zat (gram)" value={mass} setValue={setMass} />
            <MiniNumberInput label="Mr zat" value={mr} setValue={setMr} />
          </div>
        </div>

        <div className="mt-5 rounded-3xl bg-amber-50 p-4 ring-1 ring-amber-100">
          <p className="text-sm font-extrabold text-amber-800">Catatan penyetaraan</p>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Saat menyetarakan reaksi, ubah koefisien di depan zat, bukan indeks dalam rumus kimia.
          </p>
        </div>
      </SectionCard>

      <SectionCard>
        <StatusBadge tone="amber">Stoikiometri dasar</StatusBadge>
        <p className="mt-4 text-2xl font-black text-slate-950">{equation}</p>
        <p className="mt-5 text-4xl font-black text-galaxy-purple">{formatNumber(mol)} mol</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">n = massa ÷ Mr = {mass || 0} ÷ {mr || 1}</p>

        <div className="mt-5 grid gap-3">
          {examples.map(([title, eq, note]) => (
            <button key={title} onClick={() => setEquation(eq)} className="rounded-3xl bg-slate-50 p-4 text-left ring-1 ring-slate-100 transition hover:bg-galaxy-lavender">
              <p className="font-extrabold text-slate-950">{title}</p>
              <p className="mt-1 text-sm font-bold text-galaxy-purple">{eq}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{note}</p>
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function PeriodicTableMini() {
  const elements = [
    ['H', 'Hidrogen', 1, 1.008, 'Nonlogam'],
    ['C', 'Karbon', 6, 12.011, 'Nonlogam'],
    ['N', 'Nitrogen', 7, 14.007, 'Nonlogam'],
    ['O', 'Oksigen', 8, 15.999, 'Nonlogam'],
    ['Na', 'Natrium', 11, 22.99, 'Logam alkali'],
    ['Mg', 'Magnesium', 12, 24.305, 'Logam alkali tanah'],
    ['Al', 'Aluminium', 13, 26.982, 'Logam'],
    ['Si', 'Silikon', 14, 28.085, 'Metaloid'],
    ['P', 'Fosfor', 15, 30.974, 'Nonlogam'],
    ['S', 'Sulfur', 16, 32.06, 'Nonlogam'],
    ['Cl', 'Klorin', 17, 35.45, 'Halogen'],
    ['K', 'Kalium', 19, 39.098, 'Logam alkali'],
    ['Ca', 'Kalsium', 20, 40.078, 'Logam alkali tanah'],
    ['Fe', 'Besi', 26, 55.845, 'Logam transisi'],
    ['Cu', 'Tembaga', 29, 63.546, 'Logam transisi'],
    ['Zn', 'Seng', 30, 65.38, 'Logam transisi'],
  ]

  const [selected, setSelected] = useState(elements[0])
  const [symbol, name, atomicNumber, mass, group] = selected

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
      <SectionCard>
        <h2 className="text-xl font-extrabold text-slate-950">Periodic Table Mini</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Data unsur populer untuk contoh cepat di kelas kimia.</p>

        <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {elements.map((element) => (
            <button
              key={element[0]}
              onClick={() => setSelected(element)}
              className={`rounded-2xl p-3 text-center ring-1 transition hover:-translate-y-0.5 ${
                selected[0] === element[0]
                  ? 'bg-galaxy-action text-white ring-galaxy-action'
                  : 'bg-white text-slate-700 ring-purple-100 hover:bg-galaxy-lavender'
              }`}
            >
              <p className="text-xl font-black">{element[0]}</p>
              <p className="mt-1 text-[10px] font-bold">{element[2]}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard className="bg-gradient-to-br from-amber-50 to-cyan-50">
        <StatusBadge tone="amber">Unsur terpilih</StatusBadge>
        <p className="mt-5 text-6xl font-black text-slate-950">{symbol}</p>
        <h3 className="mt-2 text-2xl font-black text-slate-950">{name}</h3>
        <div className="mt-5 grid gap-3 text-sm text-slate-700">
          <p className="rounded-2xl bg-white p-3 ring-1 ring-amber-100"><b>Nomor atom:</b> {atomicNumber}</p>
          <p className="rounded-2xl bg-white p-3 ring-1 ring-amber-100"><b>Massa atom relatif:</b> {mass}</p>
          <p className="rounded-2xl bg-white p-3 ring-1 ring-amber-100"><b>Golongan sederhana:</b> {group}</p>
        </div>
      </SectionCard>
    </div>
  )
}

function StemResourceCard({ resource }) {
  const Icon = resource.icon

  return (
    <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
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
}

function MiniNumberInput({ label, value, setValue }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <input
        type="number"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300"
      />
    </label>
  )
}

function formatNumber(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '0'
  if (Math.abs(number) >= 1000) return number.toLocaleString('id-ID', { maximumFractionDigits: 2 })
  return Number(number.toFixed(3)).toString()
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
  const textLength = form.sourceText.trim().length
  const estimatedSentences = splitSourceSentences(form.sourceText).length
  const keywords = extractSourceKeywords(form.sourceText, 6)

  return (
    <SectionCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Import Teks & Video</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Ubah teks modul menjadi paket belajar.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Guru bisa menyalin teks dari buku, modul, artikel, atau PDF, lalu aplikasi membuat ringkasan, soal, flashcard, LKPD, dan exit ticket.
          </p>
        </div>
        <StatusBadge tone="green">Tahap 7</StatusBadge>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <SelectField label="Mata pelajaran" value={form.subject} onChange={(value) => updateForm('subject', value)} options={Object.keys(subjectTemplates)} />
        <SelectField label="Kelas" value={form.className} onChange={(value) => updateForm('className', value)} options={classOptions} />
        <TextField label="Topik" value={form.topic} onChange={(value) => updateForm('topic', value)} placeholder="Masukkan topik" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_18rem]">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span>Tempel teks materi</span>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault()
                updateForm('sourceText', sampleImportText)
              }}
              className="rounded-2xl bg-white px-3 py-2 text-xs font-extrabold text-galaxy-purple ring-1 ring-purple-100 hover:bg-galaxy-lavender"
            >
              Isi contoh teks
            </button>
          </span>
          <textarea
            value={form.sourceText}
            onChange={(event) => updateForm('sourceText', event.target.value)}
            rows={12}
            placeholder="Tempel materi dari buku, catatan, artikel, modul, atau teks hasil copy dari PDF..."
            className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300"
          />
        </label>

        <div className="space-y-3">
          <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <p className="text-sm font-extrabold text-slate-950">Analisis teks</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p><b>Karakter:</b> {textLength}</p>
              <p><b>Kalimat terdeteksi:</b> {estimatedSentences}</p>
              <p><b>Kata kunci:</b></p>
              <div className="flex flex-wrap gap-2">
                {keywords.length > 0
                  ? keywords.map((keyword) => <StatusBadge key={keyword} tone="cyan">{keyword}</StatusBadge>)
                  : <span className="text-xs text-slate-400">Belum ada teks</span>}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-violet-50 to-cyan-50 p-4 ring-1 ring-violet-100">
            <p className="text-sm font-extrabold text-slate-950">Output yang dibuat</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Ringkasan', 'Poin penting', 'Glosarium', '5 Soal PG', 'Refleksi', 'LKPD', 'Exit ticket'].map((item) => (
                <StatusBadge key={item} tone="purple">{item}</StatusBadge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button onClick={createFromText} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-galaxy-action px-5 py-3 text-sm font-extrabold text-white">
        <Wand2 size={16} />
        Ubah teks menjadi paket belajar
      </button>

      <div className="mt-7 border-t border-purple-100 pt-5">
        <h3 className="text-lg font-black text-slate-950">Video interaktif</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Tambahkan link video untuk membuat pertanyaan awal, tengah, akhir, dan exit ticket.
        </p>

        <label className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
          Link video
          <input
            value={form.videoUrl}
            onChange={(event) => updateForm('videoUrl', event.target.value)}
            placeholder="https://youtube.com/..."
            className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300"
          />
        </label>

        <button onClick={createVideoInteractive} className="mt-3 inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-50 px-5 py-3 text-sm font-extrabold text-cyan-700">
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
