import { fetchCurriculumOverview } from '../services/curriculumService.js'
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
  Trash2,
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
    description: 'Kirim ke Materi Guru sebagai Draft. Guru perlu cek/edit lalu Publish agar tampil ke siswa.',
    success: 'Draft materi tersimpan. Belum tampil ke siswa sampai guru klik Publish di Materi Guru.',
    nextStep: 'Buka halaman Materi, cek konten, lalu klik Publish agar muncul di siswa.',
    path: '/guru/materi',
    tone: 'cyan',
    icon: BookOpen,
  },
  {
    id: 'tugas',
    label: 'Buat Tugas',
    shortLabel: 'Tugas',
    description: 'Kirim ke Tugas Guru sebagai Draft. Guru perlu cek deadline lalu aktifkan agar tampil ke siswa.',
    success: 'Draft tugas tersimpan. Belum tampil ke siswa sampai guru mengubah status menjadi Aktif.',
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
    description: 'Buat kuis dan soal sebagai Draft. Guru perlu cek soal lalu Publish agar bisa dikerjakan siswa.',
    success: 'Draft kuis dan soal tersimpan. Belum bisa dikerjakan siswa sampai guru klik Publish di Kuis Live.',
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
    outputType: 'Soal',
    level: 'Standar',
    duration: '2 JP',
    learningObjectiveId: '',
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
    outputType: 'Soal',
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
  if (typeof localStorage === 'undefined') return fallback

  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback

    const parsed = JSON.parse(raw)

    if (Array.isArray(fallback)) {
      return Array.isArray(parsed) ? parsed : fallback
    }

    if (fallback && typeof fallback === 'object') {
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback
    }

    return parsed ?? fallback
  } catch (error) {
    return fallback
  }
}

function writeStorage(key, value) {
  if (typeof localStorage === 'undefined') return false

  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    return false
  }
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
    learningObjectiveId: form.learningObjectiveId || '',
    source: 'local',
  }))
}

function normalizeStudioQuestionsForStorage(rawQuestions, preview, form, subject, className) {
  const fallbackQuestions = makeGeneratedQuestions(preview, { ...form, subject, className: String(className || '').replace(/^Kelas\s*/i, '') }, 5)
  const sourceQuestions = Array.isArray(rawQuestions) && rawQuestions.length > 0 ? rawQuestions : fallbackQuestions
  const topic = preview.topic || form.topic || 'Topik pembelajaran'
  const now = Date.now()

  return sourceQuestions.map((question, index) => {
    const options = Array.isArray(question.options) && question.options.length >= 2
      ? question.options.filter(Boolean)
      : ['Benar', 'Salah']

    const correctAnswer = options.includes(question.correctAnswer)
      ? question.correctAnswer
      : options[0]

    return {
      id: question.id || `studio-question-${now}-${index + 1}`,
      questionText: question.questionText || question.question || `Pertanyaan ${index + 1} tentang ${topic}`,
      options,
      correctAnswer,
      explanation: question.explanation || 'Pembahasan belum tersedia.',
      subject: question.subject || subject,
      className: question.className || className,
      topic: question.topic || topic,
      difficulty: question.difficulty || (form.level === 'Menantang' ? 'Sulit' : form.level === 'Mudah' ? 'Mudah' : 'Sedang'),
      type: question.type || 'Pilihan ganda',
      learningObjectiveId: question.learningObjectiveId || form.learningObjectiveId || '',
      source: question.source || 'local',
    }
  })
}



function buildEmptyStudioPreview(form = {}) {
  return {
    id: `studio-empty-${Date.now()}`,
    title: 'Belum ada hasil generasi',
    subject: form.subject || '',
    className: form.className || '',
    topic: form.topic || '',
    contentType: form.contentType || '',
    outputType: form.outputType || 'Soal',
    level: form.level || '',
    duration: form.duration || '',
    sections: [],
    generatedQuestions: [],
    tools: [],
    source: 'empty',
    hasGenerated: false,
  }
}

function toStudioNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : fallback
}

function getConfiguredQuestionTotal(form) {
  return Math.max(
    1,
    toStudioNumber(form.mcCount, 5)
      + toStudioNumber(form.shortAnswerCount, 0)
      + toStudioNumber(form.essayCount, 0)
      + toStudioNumber(form.trueFalseCount, 0)
      + toStudioNumber(form.matchingCount, 0)
  )
}

function getQuestionDifficultyByIndex(form, index, total) {
  const easyPct = Math.max(0, Math.min(100, toStudioNumber(form.easyPct, 30)))
  const mediumPct = Math.max(0, Math.min(100, toStudioNumber(form.mediumPct, 50)))
  const easyLimit = Math.round((easyPct / 100) * total)
  const mediumLimit = easyLimit + Math.round((mediumPct / 100) * total)

  if (index < easyLimit) return 'Mudah'
  if (index < mediumLimit) return 'Sedang'
  return 'Sulit'
}

function getStudioQuestionType(form, index) {
  const counts = [
    ['Pilihan Ganda', toStudioNumber(form.mcCount, 5)],
    ['Isian Singkat', toStudioNumber(form.shortAnswerCount, 0)],
    ['Essay/Uraian', toStudioNumber(form.essayCount, 0)],
    ['Benar/Salah', toStudioNumber(form.trueFalseCount, 0)],
    ['Menjodohkan', toStudioNumber(form.matchingCount, 0)],
  ]

  let cursor = 0
  for (const [type, count] of counts) {
    cursor += count
    if (index < cursor) return type
  }

  return 'Pilihan Ganda'
}

function getStudioPreviewQuestions(preview, form) {
  if (!preview?.hasGenerated) return []

  const total = getConfiguredQuestionTotal(form)
  const subject = form.subject || preview.subject || 'Mata pelajaran'
  const className = String(form.className || preview.className || 'X').startsWith('Kelas')
    ? String(form.className || preview.className || 'X')
    : `Kelas ${form.className || preview.className || 'X'}`

  const normalized = normalizeStudioQuestionsForStorage(preview.generatedQuestions, preview, form, subject, className)
  const fallback = makeGeneratedQuestions(preview, form, total)
  const merged = [...normalized, ...fallback].filter((question, index, rows) => (
    question?.questionText && rows.findIndex((item) => item.questionText === question.questionText) === index
  ))

  const cognitiveLevels = Array.isArray(form.cognitiveLevels) && form.cognitiveLevels.length > 0
    ? form.cognitiveLevels
    : ['C2', 'C3', 'C4']

  return merged.slice(0, total).map((question, index) => ({
    ...question,
    id: question.id || `studio-preview-question-${Date.now()}-${index + 1}`,
    type: getStudioQuestionType(form, index),
    difficulty: question.difficulty || getQuestionDifficultyByIndex(form, index, total),
    cognitiveLevel: question.cognitiveLevel || cognitiveLevels[index % cognitiveLevels.length],
    indicator: question.indicator || `Mengukur pemahaman siswa tentang ${preview.topic || form.topic || 'topik pembelajaran'}.`,
  }))
}

function buildStudioConfiguredPreview(draft, form) {
  const generatedDraft = {
    ...draft,
    hasGenerated: true,
  }
  const questions = getStudioPreviewQuestions(generatedDraft, form)

  return {
    ...generatedDraft,
    outputType: form.outputType || draft.outputType || 'Soal',
    generatedQuestions: questions,
  }
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
      learningObjectiveId: form.learningObjectiveId || '',
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
    learningObjectiveId: form.learningObjectiveId || '',
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
    learningObjectiveId: form.learningObjectiveId || '',
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
    learningObjectiveId: form.learningObjectiveId || '',
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

  try {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(prefix))
      .flatMap((key) => {
        const rows = readStorage(key, [])
        return Array.isArray(rows) ? rows : []
      })
  } catch (error) {
    return []
  }
}

function countByField(rows, field) {
  return rows.reduce((acc, item) => {
    const key = item?.[field] || 'Lainnya'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
}

function topEntries(counter, limit = 6) {
  return Object.entries(counter || {})
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
    ...questions.map((item) => ({ ...item, title: item.title || item.questionText, outputType: 'Bank Soal' })),
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

  const objectiveLinked = allContent.filter((item) => item.learningObjectiveId || item.learning_objective_id).length
  const objectiveCoverage = allContent.length ? Math.round((objectiveLinked / allContent.length) * 100) : 0
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

  if (allContent.length > 0 && objectiveCoverage < 80) {
    recommendations.push({
      title: 'Hubungkan konten ke TP/ATP',
      description: 'Sebagian konten lokal belum terhubung TP. Pilih TP saat membuat draft baru atau edit konten lama dari halaman guru.',
      tone: 'purple',
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
      objectiveLinked,
      objectiveCoverage,
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
  if (isEnglishSubject(form.subject)) return englishFallbackLesson(form)
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
        body: `Gunakan contoh yang dekat dengan kehidupan siswa, misalnya lingkungan sekolah, kepulauan, aktivitas harian, atau fenomena sekitar Pangkep agar belajar terasa bermakna dan menggembirakan.`,
      },
      {
        title: 'Memahami',
        body: `Siswa membaca konsep inti ${topic}, mengamati contoh, dan menandai istilah penting yang perlu dipahami.`,
      },
      {
        title: 'Mengaplikasi',
        body: `Siswa menggunakan konsep ${topic} untuk menyelesaikan latihan, studi kasus, percobaan, atau produk sederhana sesuai mata pelajaran.`,
      },
      {
        title: 'Merefleksi',
        body: `Siswa menulis apa yang dipahami, apa yang masih membingungkan, dan bagaimana konsep ${topic} dapat digunakan dalam kehidupan nyata.`,
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
    tools: Array.from(new Set([...(template.tools || []), 'Deep Learning', 'Assessment as/for/of learning'])),
  }
}


function buildSmartTemplateDraft(template, form) {
  const nextForm = {
    ...form,
    subject: template.subject,
    topic: template.topic,
    contentType: template.contentType,
    outputType: template.outputType,
    level: template.level,
    duration: template.duration,
  }

  const draft = {
    id: `studio-smart-template-${Date.now()}`,
    title: template.title,
    subject: template.subject,
    className: form.className || 'X',
    topic: template.topic,
    contentType: template.contentType,
    outputType: template.outputType,
    level: template.level,
    duration: template.duration,
    learningObjectiveId: form.learningObjectiveId || template.learningObjectiveId || '',
    createdAt: new Date().toISOString(),
    source: 'smart-template',
    sections: template.sections.map(([title, body]) => ({ title, body })),
    tools: template.tools,
  }

  return {
    ...draft,
    generatedQuestions: makeGeneratedQuestions(draft, nextForm, 5),
    generatedFlashcard: makeFlashcards(draft, nextForm),
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


function isEnglishSubject(subject) {
  const value = String(subject || '').toLowerCase()
  return value.includes('bahasa inggris') || value.includes('english')
}

function studioLanguageInstruction(form) {
  if (isEnglishSubject(form.subject)) {
    return [
      'ATURAN KHUSUS MAPEL BAHASA INGGRIS:',
      '- Gunakan format bilingual pedagogis.',
      '- Contoh teks, model text, dialogue, vocabulary, sentence examples, questions, answer options, and correct answers MUST be in English.',
      '- Penjelasan konsep, instruksi bantuan, arahan guru, scaffolding, dan pembahasan jawaban HARUS menggunakan Bahasa Indonesia yang mudah dipahami siswa.',
      '- Jangan membuat contoh teks Bahasa Inggris dalam Bahasa Indonesia.',
      '- Jangan membuat soal Bahasa Inggris dalam Bahasa Indonesia.',
      '- Struktur ideal section: Penjelasan singkat dalam Bahasa Indonesia, lalu Model Text/Examples in English, lalu guided practice dengan arahan Bahasa Indonesia.',
    ].join('\n')
  }

  return [
    'ATURAN BAHASA:',
    '- Gunakan Bahasa Indonesia yang jelas, natural, dan sesuai konteks sekolah.',
    '- Contoh, aktivitas, dan soal harus sesuai mata pelajaran yang dipilih.',
  ].join('\n')
}

function englishFallbackLesson(form) {
  const topic = form.topic || 'Learning Topic'
  const subject = form.subject || 'Bahasa Inggris'
  const className = form.className || 'X'
  const contentType = form.contentType || 'Reading passage'

  return {
    id: `studio-preview-${Date.now()}`,
    title: `${contentType}: ${topic}`,
    subject,
    className,
    topic,
    contentType,
    outputType: form.outputType || 'Materi',
    level: form.level || 'Standar',
    duration: form.duration || '2 JP',
    sections: [
      {
        title: 'Tujuan Pembelajaran',
        body: `Setelah pembelajaran, siswa diharapkan mampu memahami contoh ${topic} dalam Bahasa Inggris, menemukan ide utama, mengenali kosakata penting, dan membuat respons sederhana dalam Bahasa Inggris.`,
      },
      {
        title: 'Model Text / Example in English',
        body: `Read the following example carefully.\n\nLast Sunday, I visited a small island near my village. The weather was bright, and the sea looked very beautiful. I went there with my friends by boat. We walked along the beach, took some pictures, and talked with local fishermen. It was a simple trip, but it was very memorable because I learned how people live close to the sea.`,
      },
      {
        title: 'Penjelasan Konsep',
        body: `Teks contoh di atas menggunakan Bahasa Inggris sederhana agar siswa dapat memahami isi bacaan secara bertahap. Guru dapat membantu siswa menemukan main idea, supporting details, vocabulary, dan struktur kalimat yang digunakan dalam teks.`,
      },
      {
        title: 'Vocabulary Focus',
        body: `Important words: visited, island, village, weather, sea, boat, beach, fishermen, memorable, learned.\n\nArahan untuk siswa: cari arti kata-kata tersebut, lalu gunakan minimal tiga kata dalam kalimat Bahasa Inggris sederhana.`,
      },
      {
        title: 'Guided Practice',
        body: `Answer the questions in English.\n1. Where did the writer go last Sunday?\n2. How did the writer go there?\n3. What did the writer do on the beach?\n4. Why was the trip memorable?\n\nPembahasan dapat dilakukan dalam Bahasa Indonesia agar siswa memahami alasan jawabannya.`,
      },
      {
        title: 'Deep Learning Flow',
        body: `Memahami: students identify main idea, details, and vocabulary. Mengaplikasi: students write or speak simple sentences about their own context. Merefleksi: students explain what they can describe better after the lesson. Use local context so the activity feels bermakna and menggembirakan.`,
      },
      {
        title: 'Exit Ticket',
        body: `Write two English sentences about your own experience.\n\nBantuan: siswa boleh menulis dulu ide dalam Bahasa Indonesia, lalu mengubahnya menjadi kalimat Bahasa Inggris sederhana.`,
      },
    ],
    tools: ['Vocabulary builder', 'Reading questions', 'Guided practice', 'Deep Learning', 'Exit ticket'],
    generatedQuestions: [
      {
        id: `english-question-${Date.now()}-1`,
        questionText: 'Where did the writer go last Sunday?',
        options: ['A small island', 'A big city', 'A mountain', 'A school library'],
        correctAnswer: 'A small island',
        explanation: 'Jawaban benar adalah “A small island” karena teks menyebutkan “I visited a small island near my village.”',
        difficulty: 'Easy',
        type: 'Multiple choice',
      },
      {
        id: `english-question-${Date.now()}-2`,
        questionText: 'How did the writer go to the island?',
        options: ['By boat', 'By train', 'By plane', 'By bicycle'],
        correctAnswer: 'By boat',
        explanation: 'Jawaban benar adalah “By boat” karena dalam teks tertulis “I went there with my friends by boat.”',
        difficulty: 'Easy',
        type: 'Multiple choice',
      },
      {
        id: `english-question-${Date.now()}-3`,
        questionText: 'Which word has a similar meaning to “memorable”?',
        options: ['Unforgettable', 'Dangerous', 'Expensive', 'Difficult'],
        correctAnswer: 'Unforgettable',
        explanation: '“Memorable” berarti mudah diingat atau berkesan. Kata yang paling dekat maknanya adalah “unforgettable”.',
        difficulty: 'Medium',
        type: 'Multiple choice',
      },
    ],
    source: 'fallback',
  }
}


function buildStudioPrompt(form) {
  return [
    'WAJIB kembalikan JSON valid tanpa markdown.',
    'Gunakan struktur:',
    '{"title":"...","sections":[{"title":"...","body":"..."}],"tools":["..."],"generatedQuestions":[{"questionText":"...","options":["A","B","C","D"],"correctAnswer":"...","explanation":"..."}]}',
    '',
    studioLanguageInstruction(form),
    '',
    `Mata pelajaran: ${form.subject}`,
    `Kelas: ${form.className}`,
    `Topik: ${form.topic}`,
    `Jenis konten: ${form.contentType}`,
    `Simpan sebagai: ${form.outputType}`,
    `Level: ${form.level}`,
    `Durasi: ${form.duration}`,
    `Instruksi khusus guru: ${form.customInstruction || 'Tidak ada instruksi khusus. Buat versi terbaik yang praktis untuk kelas.'}`,
    '',
    'Ikuti instruksi khusus guru selama tidak bertentangan dengan tujuan pembelajaran.',
    '',
    'Buat draft pembelajaran yang siap dipakai guru.',
    'Untuk mapel Bahasa Inggris, pastikan model text, contoh kalimat, dialog, soal, opsi jawaban, dan correct answer berbahasa Inggris.',
    'Untuk mapel Bahasa Inggris, pastikan penjelasan konsep, pembahasan jawaban, instruksi bantuan, dan arahan belajar menggunakan Bahasa Indonesia.',
    'Sertakan tujuan pembelajaran, ringkasan/model text, aktivitas siswa, latihan/pertanyaan, dan exit ticket.',
  ].join('\n')
}


function cleanAIJsonText(text) {
  return String(text || '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()
}

function extractFirstJsonObject(text) {
  const cleaned = cleanAIJsonText(text)

  try {
    return JSON.parse(cleaned)
  } catch (error) {
    // lanjut ekstraksi manual
  }

  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const candidate = cleaned.slice(firstBrace, lastBrace + 1)
    try {
      return JSON.parse(candidate)
    } catch (error) {
      return null
    }
  }

  return null
}

function normalizeAISection(section, index) {
  if (typeof section === 'string') {
    return {
      title: `Bagian ${index + 1}`,
      body: section,
    }
  }

  if (!section || typeof section !== 'object') {
    return {
      title: `Bagian ${index + 1}`,
      body: 'Konten bagian ini perlu dilengkapi.',
    }
  }

  return {
    title: section.title || section.heading || section.name || `Bagian ${index + 1}`,
    body: Array.isArray(section.body)
      ? section.body.join('\n')
      : String(section.body || section.content || section.text || 'Konten bagian ini perlu dilengkapi.'),
  }
}

function normalizeAIQuestions(value, form) {
  const topic = form.topic || 'topik pembelajaran'
  const items = Array.isArray(value) ? value : []

  return items.slice(0, 8).map((item, index) => {
    if (typeof item === 'string') {
      return {
        id: `ai-question-${Date.now()}-${index}`,
        questionText: item,
        options: ['Benar', 'Salah', 'Perlu diskusi', 'Belum cukup informasi'],
        correctAnswer: 'Benar',
        explanation: `Pembahasan terkait ${topic}.`,
        difficulty: 'Sedang',
        type: 'Pilihan ganda',
      }
    }

    const options = Array.isArray(item?.options) && item.options.length > 0
      ? item.options
      : ['Benar', 'Salah', 'Perlu diskusi', 'Belum cukup informasi']

    return {
      id: `ai-question-${Date.now()}-${index}`,
      questionText: item?.questionText || item?.question || item?.prompt || `Pertanyaan ${index + 1} tentang ${topic}`,
      options,
      correctAnswer: item?.correctAnswer || item?.answer || options[0],
      explanation: item?.explanation || `Pembahasan terkait ${topic}.`,
      difficulty: item?.difficulty || 'Sedang',
      type: item?.type || 'Pilihan ganda',
    }
  })
}


function cleanAIPreviewText(value) {
  return String(value || '')
    .replace(/\\n/g, '\n')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function cleanAIPreviewTitle(value, fallback = 'Bagian') {
  return cleanAIPreviewText(value)
    .replace(/^[:\-\s]+/, '')
    .replace(/[:\-\s]+$/, '')
    .trim() || fallback
}

function markdownSectionsFromAIText(aiText, form) {
  const cleaned = cleanAIPreviewText(aiText)
  const lines = cleaned.split('\n').map((line) => line.trim()).filter(Boolean)
  const sections = []
  let current = null

  const titlePattern = /^(?:\d+\.\s*)?(.{3,90}?):\s*(.*)$/
  const titleKeywords = /materi|tujuan|ringkasan|model|text|example|contoh|aktivitas|activity|latihan|practice|soal|questions|assessment|asesmen|exit|vocabulary|kosakata|dialogue|dialog|pembahasan|penjelasan|instruksi/i

  lines.forEach((line) => {
    const match = line.match(titlePattern)
    const looksLikeTitle = match && titleKeywords.test(match[1])

    if (looksLikeTitle) {
      if (current && current.body.trim()) sections.push(current)

      current = {
        title: cleanAIPreviewTitle(match[1], `Bagian ${sections.length + 1}`),
        body: cleanAIPreviewText(match[2] || ''),
      }
      return
    }

    if (!current) {
      current = {
        title: sections.length === 0 ? 'Ringkasan Materi' : `Bagian ${sections.length + 1}`,
        body: '',
      }
    }

    current.body = [current.body, line].filter(Boolean).join('\n')
  })

  if (current && current.body.trim()) sections.push(current)

  return sections.map((section, index) => ({
    title: cleanAIPreviewTitle(section.title, `Bagian ${index + 1}`),
    body: cleanAIPreviewText(section.body),
  }))
}

function normalizeAILesson(aiText, form) {
  const fallback = buildFallbackLesson(form)
  const parsed = extractFirstJsonObject(aiText)

  if (parsed && typeof parsed === 'object') {
    const rawSections = Array.isArray(parsed.sections)
      ? parsed.sections
      : [
          parsed.objectives && { title: 'Tujuan Pembelajaran', body: parsed.objectives },
          parsed.summary && { title: 'Ringkasan Materi', body: parsed.summary },
          parsed.modelText && { title: 'Model Text / Example', body: parsed.modelText },
          parsed.activity && { title: 'Aktivitas Siswa', body: parsed.activity },
          parsed.practice && { title: 'Latihan', body: parsed.practice },
          parsed.assessment && { title: 'Asesmen', body: parsed.assessment },
        ].filter(Boolean)

    const sections = rawSections.length > 0
      ? rawSections.map((section, index) => {
          const normalized = normalizeAISection(section, index)
          return {
            title: cleanAIPreviewTitle(normalized.title, `Bagian ${index + 1}`),
            body: cleanAIPreviewText(normalized.body),
          }
        })
      : fallback.sections

    const generatedQuestions = normalizeAIQuestions(
      parsed.generatedQuestions || parsed.questions || parsed.quiz || parsed.latihan,
      form
    )

    return {
      ...fallback,
      title: cleanAIPreviewTitle(parsed.title || fallback.title, fallback.title),
      subject: parsed.subject || form.subject || fallback.subject,
      className: parsed.className || form.className || fallback.className,
      topic: parsed.topic || form.topic || fallback.topic,
      contentType: parsed.contentType || form.contentType || fallback.contentType,
      outputType: parsed.outputType || form.outputType || fallback.outputType,
      level: parsed.level || form.level || fallback.level,
      duration: parsed.duration || form.duration || fallback.duration,
      sections,
      tools: Array.isArray(parsed.tools) && parsed.tools.length > 0 ? parsed.tools.map(cleanAIPreviewText) : fallback.tools,
      generatedQuestions: generatedQuestions.length > 0 ? generatedQuestions : fallback.generatedQuestions,
      source: 'ai',
    }
  }

  const markdownSections = markdownSectionsFromAIText(aiText, form)

  if (markdownSections.length > 0) {
    return {
      ...fallback,
      sections: markdownSections,
      source: 'ai',
    }
  }

  return {
    ...fallback,
    sections: [
      {
        title: 'Draft AI',
        body: cleanAIPreviewText(aiText) || 'AI belum mengembalikan konten yang dapat dibaca.',
      },
      ...fallback.sections.slice(1),
    ],
    source: 'ai',
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

  const normalized = normalizeAILesson(text, form)
  // AI language guard: English subject must not fall back to Indonesian examples.
  if (isEnglishSubject(form.subject)) {
    normalized.sections = (normalized.sections || []).map((section) => ({
      ...section,
      body: String(section.body || '').replace(/Bahasa Indonesia/g, 'English').replace(/teks bahasa indonesia/gi, 'English text'),
    }))
  }
  return normalized
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

function shortStudioToken() {
  return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
}

function isDuplicateQuestionError(error) {
  const message = String(error?.message || '').toLowerCase()
  return message.includes('questions_text_subject_class_uidx')
    || message.includes('duplicate key')
    || message.includes('unique constraint')
}

function enrichStudioQuestion(question, { subjectId, classId, topic, learningObjectiveId, token, sequence, forceUnique = false }) {
  const options = Array.isArray(question.options) && question.options.length > 0
    ? question.options
    : ['Benar', 'Salah', 'Perlu diskusi', 'Belum cukup informasi']

  const baseQuestion = question.questionText || question.prompt || `Pertanyaan tentang ${topic}`
  const questionText = forceUnique
    ? `${baseQuestion} [Studio ${token || shortStudioToken()}-${sequence || 1}]`
    : baseQuestion

  return {
    questionText,
    options,
    correctAnswer: question.correctAnswer || question.answer || options[0],
    explanation: question.explanation || `Pembahasan terkait ${topic}.`,
    subjectId,
    classId,
    learningObjectiveId: learningObjectiveId || question.learningObjectiveId || '',
    topic,
    difficulty: question.difficulty || 'Sedang',
    type: question.type || 'Pilihan ganda',
  }
}

async function saveStudioQuestionsToSupabase({ accessToken, teacherId, questions, context }) {
  const savedQuestions = []
  const token = context.token || shortStudioToken()

  for (const [index, question] of questions.entries()) {
    const sequence = index + 1

    try {
      const saved = await saveQuestion({
        accessToken,
        teacherId,
        question: enrichStudioQuestion(question, { ...context, token, sequence }),
      })
      savedQuestions.push(saved)
    } catch (error) {
      if (!isDuplicateQuestionError(error)) throw error

      const saved = await saveQuestion({
        accessToken,
        teacherId,
        question: enrichStudioQuestion(question, {
          ...context,
          token,
          sequence,
          forceUnique: true,
        }),
      })
      savedQuestions.push(saved)
    }
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

  const token = shortStudioToken()
  const context = { subjectId, classId, topic, learningObjectiveId: form.learningObjectiveId || '', token }

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
        learningObjectiveId: form.learningObjectiveId || '',
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
        learningObjectiveId: form.learningObjectiveId || '',
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
        title: `Kuis ${topic} · ${token}`,
        description: contentText.slice(0, 700),
        subjectId,
        classId,
        subject,
        className,
        learningObjectiveId: form.learningObjectiveId || '',
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
  const [resultTab, setResultTab] = useState('soal')
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null)
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
    customInstruction: '',
    teacherName: user?.name || '',
    schoolName: 'SMA Negeri 6 Pangkajene dan Kepulauan',
    educationLevel: 'SMA/MA',
    assessmentType: 'Sumatif Harian',
    answerOptionCount: '4 Opsi (A-D)',
    mcCount: 5,
    shortAnswerCount: 0,
    essayCount: 0,
    trueFalseCount: 0,
    matchingCount: 0,
    easyPct: 30,
    mediumPct: 50,
    hardPct: 20,
    cognitiveLevels: ['C2', 'C3', 'C4'],
    illustrationCount: 0,
    diagramCount: 0,
    conceptMapCount: 0,
    referenceMode: 'Tanpa Materi',
  })
  const [preview, setPreview] = useState(() => buildEmptyStudioPreview({
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
  const [curriculumData, setCurriculumData] = useState(() => ({ subjects: [], phases: [], elements: [], outcomes: [], objectives: [], flows: [] }))
  const [curriculumError, setCurriculumError] = useState('')
  const [lookups, setLookups] = useState({ subjects: [], classes: [] })
  const [savingTarget, setSavingTarget] = useState('')
  const [analyticsTick, setAnalyticsTick] = useState(0)

  const template = subjectTemplates[form.subject] || subjectTemplates.Umum
  const availableContentTypes = template.contentTypes
  const analyticsSnapshot = useMemo(() => getTeacherAnalyticsSnapshot(contentRows, rubricRows), [analyticsTick, contentRows, rubricRows])

  const stats = useMemo(() => {
    return {
      content: analyticsSnapshot.totals.all,
      rubrics: analyticsSnapshot.totals.rubrics,
      quizzes: analyticsSnapshot.totals.quizzes,
      remedials: contentRows.filter((item) => ['Remedial', 'Pengayaan'].includes(item.outputType)).length,
    }
  }, [analyticsSnapshot, contentRows])


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


  useEffect(() => {
    let active = true

    async function loadCurriculum() {
      if (!accessToken) {
        setCurriculumData({ subjects: [], phases: [], elements: [], outcomes: [], objectives: [], flows: [] })
        return
      }

      try {
        const overview = await fetchCurriculumOverview({ accessToken })
        if (active) {
          setCurriculumData(overview)
          setCurriculumError('')
        }
      } catch (error) {
        if (active) {
          setCurriculumError(error.message || 'Bank kurikulum belum tersedia.')
          setCurriculumData({ subjects: [], phases: [], elements: [], outcomes: [], objectives: [], flows: [] })
        }
      }
    }

    loadCurriculum()

    return () => {
      active = false
    }
  }, [accessToken])

  const selectedLearningObjective = useMemo(() => {
    return curriculumData.objectives.find((objective) => objective.id === form.learningObjectiveId) || null
  }, [curriculumData.objectives, form.learningObjectiveId])

  function selectLearningObjective(objectiveId) {
    const objective = curriculumData.objectives.find((item) => item.id === objectiveId)
    setForm((current) => ({
      ...current,
      learningObjectiveId: objectiveId,
      subject: objective?.subjectName || current.subject,
      className: objective?.grade ? String(objective.grade) : current.className,
      topic: objective?.objective ? objective.objective.slice(0, 70) : current.topic,
    }))
    setDeliveryStatus(null)
  }

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
      setToast(form.outputType === 'Materi' ? 'Membuat materi otomatis...' : 'Membuat soal otomatis...')
      const aiDraft = await requestStudioAIDraft(form)
      const draft = buildStudioConfiguredPreview(aiDraft, form)
      setPreview(draft)
      setResultTab(form.outputType === 'Materi' ? 'materi' : 'soal')
      setToast(draft.source === 'ai' ? 'Draft berhasil dibuat dengan AI server.' : 'Draft berhasil dibuat dan dirapikan.')
    } catch (aiError) {
      const draft = buildStudioConfiguredPreview(buildFallbackLesson(form), form)
      setPreview(draft)
      setResultTab(form.outputType === 'Materi' ? 'materi' : 'soal')
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
    setPreview({
      ...rubric,
      topic: form.topic,
      contentType: 'Rubrik penilaian',
      outputType: 'Rubrik',
      level: form.level,
      duration: form.duration,
      learningObjectiveId: form.learningObjectiveId || '',
      sections: (Array.isArray(rubric.criteria) ? rubric.criteria : []).map((criterion) => ({
        title: criterion.aspect,
        body: Object.entries(criterion.levels || {}).reverse().map(([score, text]) => `Skor ${score}: ${text}`).join('\n'),
      })),
      tools: ['Rubric Builder', 'Assessment of learning', 'Feedback guru'],
    })
    setAnalyticsTick((current) => current + 1)
    setToast('Rubrik tersimpan di arsip lokal.')
  }

  function clearArchive(kind) {
    if (typeof window !== 'undefined' && !window.confirm('Kosongkan arsip lokal ini di perangkat?')) return

    if (kind === 'content') {
      setContentRows([])
      writeStorage(CONTENT_KEY, [])
      setAnalyticsTick((current) => current + 1)
      setToast('Arsip konten lokal dikosongkan.')
      return
    }

    if (kind === 'rubric') {
      setRubricRows([])
      writeStorage(RUBRIC_KEY, [])
      setAnalyticsTick((current) => current + 1)
      setToast('Arsip rubrik lokal dikosongkan.')
    }
  }

  function showDeliverySuccess(target) {
    const info = featureTargets.find((item) => item.id === target)
    if (!info) return

    setDeliveryStatus({
      ...info,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    })
    setToast(`${info.success} Langkah berikutnya: ${info.nextStep}`)
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
        learningObjectiveId: form.learningObjectiveId || '',
        teacher: user?.name || 'Guru',
        topic,
        type: 'Teks',
        status: 'Draft',
        progress: 0,
        source: 'local',
      }])
      setAnalyticsTick((current) => current + 1)
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
        learningObjectiveId: form.learningObjectiveId || '',
        teacher: user?.name || 'Guru',
        deadline: '',
        status: 'Draft',
        source: 'local',
      }])
      setAnalyticsTick((current) => current + 1)
      showDeliverySuccess('tugas')
      return
    }

    if (target === 'bank-soal') {
      if (!preview.hasGenerated || !Array.isArray(preview.generatedQuestions) || preview.generatedQuestions.length === 0) {
        setToast('Belum ada soal. Isi identitas/topik lalu klik Buat Soal Otomatis terlebih dahulu.')
        return
      }

      const generatedQuestions = normalizeStudioQuestionsForStorage(preview.generatedQuestions, preview, form, subject, className)
      appendStorageRows(teacherStorageKey('questions', user, subject), generatedQuestions)
      setAnalyticsTick((current) => current + 1)
      showDeliverySuccess('bank-soal')
      return
    }

    if (target === 'kuis') {
      if (!preview.hasGenerated || !Array.isArray(preview.generatedQuestions) || preview.generatedQuestions.length === 0) {
        setToast('Belum ada soal. Isi identitas/topik lalu klik Buat Soal Otomatis terlebih dahulu.')
        return
      }

      const generatedQuestions = normalizeStudioQuestionsForStorage(preview.generatedQuestions, preview, form, subject, className)
      appendStorageRows(teacherStorageKey('questions', user, subject), generatedQuestions)

      appendStorageRows(teacherStorageKey('quizzes', user, subject), [{
        id: `studio-quiz-${Date.now()}`,
        title: `Kuis ${topic}`,
        description: `Kuis otomatis dari Studio Konten untuk topik ${topic}.`,
        subject,
        className,
        teacher: user?.name || 'Guru',
        learningObjectiveId: form.learningObjectiveId || '',
        duration: 30,
        status: 'Draft',
        source: 'local',
        questionIds: generatedQuestions.map((item) => item.id).filter(Boolean),
        questionCount: generatedQuestions.length,
      }])
      setAnalyticsTick((current) => current + 1)
      showDeliverySuccess('kuis')
      return
    }

    if (target === 'flashcard') {
      const flashcard = preview.generatedFlashcard || makeFlashcards(preview, form)
      appendStorageRows(FLASHCARD_KEY, [flashcard])
      setAnalyticsTick((current) => current + 1)
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
      learningObjectiveId: template.learningObjectiveId || form.learningObjectiveId || '',
    }

    const draft = buildStudioConfiguredPreview(buildSmartTemplateDraft(template, nextForm), nextForm)

    setForm(nextForm)
    setPreview(draft)
    setResultTab(nextForm.outputType === 'Materi' ? 'materi' : 'soal')
    setDeliveryStatus(null)
    setActiveTab('builder')
    setToast(`Template "${template.title}" siap digunakan. Cek preview lalu kirim ke fitur aplikasi.`)
  }

  function applyQualitySuggestion() {
    const topic = preview.topic || form.topic || 'topik pembelajaran'
    const qualitySections = [
      {
        title: 'Tujuan Pembelajaran Terukur',
        body: form.learningObjectiveId
          ? `Draft ini sudah diarahkan ke TP/ATP terpilih. Guru perlu memastikan aktivitas, soal, dan refleksi tetap sesuai dengan tujuan pembelajaran tentang ${topic}.`
          : `Pilih TP/ATP terlebih dahulu, lalu pastikan tujuan belajar ${topic} ditulis sebagai kemampuan yang dapat diamati. Contoh: siswa mampu memahami, menerapkan, dan merefleksikan konsep ${topic}.`,
      },
      {
        title: 'Asesmen Formatif',
        body: `Tambahkan cek pemahaman selama pembelajaran: 3 pertanyaan cepat, 1 latihan penerapan, dan 1 umpan balik guru untuk melihat apakah siswa sudah memahami ${topic}.`,
      },
      {
        title: 'Alur Deep Learning',
        body: `Memahami: siswa membaca konsep inti ${topic} dan contoh. Mengaplikasi: siswa menyelesaikan latihan atau studi kasus. Merefleksi: siswa menulis apa yang sudah dipahami, apa yang masih membingungkan, dan bagaimana konsep ini digunakan dalam kehidupan nyata.`,
      },
      {
        title: 'Refleksi dan Diferensiasi',
        body: `Refleksi: siswa menulis hal yang dipahami, hal yang membingungkan, dan contoh penerapan ${topic}. Diferensiasi: siapkan remedial dengan contoh lebih sederhana dan pengayaan berupa studi kasus atau proyek kecil.`,
      },
    ]

    const currentSections = Array.isArray(preview.sections) ? preview.sections : []
    const qualityTitles = new Set(qualitySections.map((section) => section.title))
    const cleanedSections = currentSections.filter((section) => !qualityTitles.has(section.title))
    const existingQuestions = Array.isArray(preview.generatedQuestions) ? preview.generatedQuestions : []

    setPreview({
      ...preview,
      learningObjectiveId: form.learningObjectiveId || preview.learningObjectiveId || '',
      sections: [...cleanedSections, ...qualitySections],
      generatedQuestions: existingQuestions.length > 0 ? existingQuestions : makeGeneratedQuestions(preview, form, 5),
      tools: Array.from(new Set([...(preview.tools || []), 'Quality checklist', 'Asesmen formatif', 'Deep Learning', 'Exit ticket', 'Diferensiasi'])),
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

    const draft = buildStudioConfiguredPreview(buildImportTextDraft(form), form)
    setPreview(draft)
    setResultTab(form.outputType === 'Materi' ? 'materi' : 'soal')
    setDeliveryStatus(null)
    setToast('Teks berhasil diubah menjadi materi dan soal siap review.')
  }

  function createVideoInteractive() {
    if (!form.videoUrl.trim()) {
      setToast('Tempel link video terlebih dahulu.')
      return
    }

    const draft = buildStudioConfiguredPreview(buildVideoInteractiveDraft(form), form)
    setPreview(draft)
    setResultTab('soal')
    setDeliveryStatus(null)
    setToast('Video interaktif berhasil dibuat dengan soal dan pertanyaan timestamp.')
  }

  function updatePreviewQuestion(index, nextQuestion) {
    const questions = Array.isArray(preview.generatedQuestions) ? preview.generatedQuestions : []
    if (!questions[index]) {
      setToast('Soal tidak ditemukan.')
      return
    }

    const cleanedOptions = Array.isArray(nextQuestion.options)
      ? nextQuestion.options.map((item) => String(item || '').trim()).filter(Boolean)
      : questions[index].options || []

    const updatedQuestion = {
      ...questions[index],
      ...nextQuestion,
      options: cleanedOptions.length >= 2 ? cleanedOptions : questions[index].options,
      correctAnswer: cleanedOptions.includes(nextQuestion.correctAnswer)
        ? nextQuestion.correctAnswer
        : (questions[index].correctAnswer || cleanedOptions[0] || ''),
    }

    const nextQuestions = questions.map((item, questionIndex) => (
      questionIndex === index ? updatedQuestion : item
    ))

    setPreview({
      ...preview,
      hasGenerated: true,
      generatedQuestions: nextQuestions,
    })
    setDeliveryStatus(null)
    setEditingQuestionIndex(null)
    setToast('Soal berhasil diperbarui.')
  }

  return (
    <div>
      <PageHeader
        eyebrow="Studio Konten Guru"
        title="Buat materi dan soal otomatis."
        description="Isi identitas, pilih referensi, atur soal, lalu review hasil seperti dokumen siap pakai sebelum dikirim ke fitur guru."
      />

      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <SimpleStudioBuilder
          form={form}
          template={template}
          availableContentTypes={availableContentTypes}
          updateForm={updateForm}
          generateDraft={generateDraft}
          saveContent={saveContent}
          createFromText={createFromText}
        />

        <StudioOutputWorkspace
          preview={preview}
          form={form}
          resultTab={resultTab}
          setResultTab={setResultTab}
          publishToFeature={publishToFeature}
          deliveryStatus={deliveryStatus}
          savingTarget={savingTarget}
          editingQuestionIndex={editingQuestionIndex}
          setEditingQuestionIndex={setEditingQuestionIndex}
          updatePreviewQuestion={updatePreviewQuestion}
        />
      </div>

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
    quality: 'Quality Check',
    analytics: 'Analitik Guru',
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



function StudioMiniNumberInput({ label, value, onChange, min = 0, suffix = '' }) {
  return (
    <label className="grid gap-1 text-sm font-bold text-slate-700">
      {label}
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 ring-1 ring-slate-100">
        <input
          type="number"
          min={min}
          value={value ?? 0}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-center text-lg font-black text-slate-950 outline-none"
        />
        {suffix && <span className="text-xs font-bold text-slate-400">{suffix}</span>}
      </div>
    </label>
  )
}

function SimpleStudioBuilder({ form, template, availableContentTypes, updateForm, generateDraft, saveContent, createFromText }) {
  const outputModes = [
    ['Soal', 'Soal', FileQuestion],
    ['Kuis', 'Kuis', PlayCircle],
    ['Materi', 'Materi', BookOpen],
    ['Tugas', 'Tugas', ClipboardList],
  ]
  const referenceModes = ['Tanpa Materi', 'Ketik Manual', 'Link Video']
  const cognitiveLevels = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']
  const selectedLevels = Array.isArray(form.cognitiveLevels) ? form.cognitiveLevels : ['C2', 'C3', 'C4']
  const isQuestionMode = form.outputType !== 'Materi'

  function toggleLevel(level) {
    const next = selectedLevels.includes(level)
      ? selectedLevels.filter((item) => item !== level)
      : [...selectedLevels, level]
    updateForm('cognitiveLevels', next.length > 0 ? next : ['C2'])
  }

  return (
    <SectionCard>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Studio Konten</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Buat materi atau soal.</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Isi data inti, atur jumlah, lalu generate.</p>
        </div>
        <StatusBadge tone="green">Kosong sampai generate</StatusBadge>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-4">
        {outputModes.map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => updateForm('outputType', id)}
            className={`rounded-2xl px-3 py-3 text-left ring-1 transition ${
              form.outputType === id
                ? 'bg-galaxy-action text-white shadow-glow ring-galaxy-action'
                : 'bg-white text-slate-700 ring-purple-100 hover:bg-galaxy-lavender'
            }`}
          >
            <Icon size={17} />
            <span className="mt-1 block text-sm font-black">{label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
        <p className="mb-3 text-sm font-black text-slate-950">Identitas</p>
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField label="Jenjang" value={form.educationLevel || 'SMA/MA'} onChange={(value) => updateForm('educationLevel', value)} options={['SMA/MA', 'SMK/MAK', 'SMP/MTs']} />
          <SelectField label="Kelas" value={form.className} onChange={(value) => updateForm('className', value)} options={classOptions} />
          <SelectField label="Mapel" value={form.subject} onChange={(value) => updateForm('subject', value)} options={Object.keys(subjectTemplates)} />
          <TextField label="Topik / Materi" value={form.topic} onChange={(value) => updateForm('topic', value)} placeholder={template.sampleTopic} />
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-black text-slate-950">Referensi</p>
          <div className="flex flex-wrap gap-2">
            {referenceModes.map((mode) => (
              <button
                key={mode}
                onClick={() => updateForm('referenceMode', mode)}
                className={`rounded-xl px-3 py-2 text-xs font-extrabold ${
                  form.referenceMode === mode
                    ? 'bg-galaxy-action text-white'
                    : 'bg-white text-galaxy-purple ring-1 ring-purple-100'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {form.referenceMode === 'Ketik Manual' && (
          <label className="mt-3 grid gap-2 text-sm font-bold text-slate-700">
            Teks referensi
            <textarea
              value={form.sourceText || ''}
              onChange={(event) => updateForm('sourceText', event.target.value)}
              rows={4}
              className="rounded-2xl border border-purple-100 bg-white px-4 py-3 text-sm leading-7 outline-none focus:border-purple-300"
              placeholder="Tempel materi, ringkasan buku, modul, atau catatan guru."
            />
            <button onClick={createFromText} className="w-fit rounded-xl bg-cyan-50 px-3 py-2 text-xs font-extrabold text-cyan-700 ring-1 ring-cyan-100">
              Jadikan draft
            </button>
          </label>
        )}

        {form.referenceMode === 'Link Video' && (
          <div className="mt-3">
            <TextField label="Link video / artikel" value={form.videoUrl || ''} onChange={(value) => updateForm('videoUrl', value)} placeholder="https://..." />
          </div>
        )}
      </div>

      <div className="mt-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
        <p className="text-sm font-black text-slate-950">{isQuestionMode ? 'Konfigurasi Soal' : 'Konfigurasi Materi'}</p>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <SelectField label="Jenis" value={form.assessmentType || 'Sumatif Harian'} onChange={(value) => updateForm('assessmentType', value)} options={['Sumatif Harian', 'Formatif', 'Diagnostik', 'Latihan Harian', 'Remedial']} />
          <SelectField label="Opsi PG" value={form.answerOptionCount || '4 Opsi (A-D)'} onChange={(value) => updateForm('answerOptionCount', value)} options={['4 Opsi (A-D)', '5 Opsi (A-E)', 'Benar/Salah']} />
        </div>

        {isQuestionMode && (
          <>
            <div className="mt-3 grid gap-2 sm:grid-cols-5">
              <StudioMiniNumberInput label="PG" value={form.mcCount} onChange={(value) => updateForm('mcCount', value)} />
              <StudioMiniNumberInput label="Isian" value={form.shortAnswerCount} onChange={(value) => updateForm('shortAnswerCount', value)} />
              <StudioMiniNumberInput label="Essay" value={form.essayCount} onChange={(value) => updateForm('essayCount', value)} />
              <StudioMiniNumberInput label="B/S" value={form.trueFalseCount} onChange={(value) => updateForm('trueFalseCount', value)} />
              <StudioMiniNumberInput label="Match" value={form.matchingCount} onChange={(value) => updateForm('matchingCount', value)} />
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <StudioMiniNumberInput label="Mudah" value={form.easyPct} onChange={(value) => updateForm('easyPct', value)} suffix="%" />
              <StudioMiniNumberInput label="Sedang" value={form.mediumPct} onChange={(value) => updateForm('mediumPct', value)} suffix="%" />
              <StudioMiniNumberInput label="Sulit" value={form.hardPct} onChange={(value) => updateForm('hardPct', value)} suffix="%" />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {cognitiveLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => toggleLevel(level)}
                  className={`grid h-9 w-9 place-items-center rounded-full text-xs font-black ring-1 ${
                    selectedLevels.includes(level)
                      ? 'bg-galaxy-action text-white ring-galaxy-action'
                      : 'bg-white text-slate-500 ring-slate-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <label className="mt-3 grid gap-2 text-sm font-bold text-slate-700">
        Instruksi tambahan
        <textarea
          value={form.customInstruction || ''}
          onChange={(event) => updateForm('customInstruction', event.target.value)}
          rows={3}
          placeholder="Contoh: buat soal kontekstual, dekat dengan kehidupan siswa kepulauan, sertakan pembahasan singkat."
          className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 text-sm leading-7 outline-none focus:border-purple-300"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={generateDraft} className="inline-flex items-center gap-2 rounded-xl bg-galaxy-action px-5 py-3 text-sm font-black text-white shadow-glow">
          <Sparkles size={17} />
          {isQuestionMode ? 'Buat Soal Otomatis' : 'Buat Materi Otomatis'}
        </button>
        <button onClick={saveContent} className="inline-flex items-center gap-2 rounded-xl bg-galaxy-surface px-4 py-3 text-sm font-extrabold text-galaxy-purple ring-1 ring-purple-100">
          <Save size={16} />
          Simpan Draft
        </button>
      </div>
    </SectionCard>
  )
}


function StudioOutputWorkspace({
  preview,
  form,
  resultTab,
  setResultTab,
  publishToFeature,
  deliveryStatus,
  savingTarget,
  editingQuestionIndex,
  setEditingQuestionIndex,
  updatePreviewQuestion,
}) {
  const questions = getStudioPreviewQuestions(preview, form)
  const total = questions.length
  const tabs = [
    ['soal', 'Soal'],
    ['kunci', 'Kunci'],
    ['kisi', 'Kisi-Kisi'],
    ['kuis', 'Kuis'],
    ['analisis', 'Analisis'],
  ]
  const editingQuestion = editingQuestionIndex !== null ? questions[editingQuestionIndex] : null

  return (
    <SectionCard className="bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Hasil</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">{form.assessmentType || 'Sumatif Harian'}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {form.subject} · {String(form.className || '').startsWith('Kelas') ? form.className : `Kelas ${form.className}`} · {total} soal
          </p>
        </div>
        <StatusBadge tone={preview?.hasGenerated ? 'green' : 'amber'}>
          {preview?.hasGenerated ? 'Sudah generate' : 'Kosong'}
        </StatusBadge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-b border-purple-100 pb-3">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setResultTab(id)}
            className={`rounded-xl px-3 py-2 text-xs font-black ${
              resultTab === id
                ? 'bg-galaxy-action text-white shadow-glow'
                : 'bg-slate-50 text-slate-600 ring-1 ring-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {deliveryStatus && (
        <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold leading-6 text-emerald-800 ring-1 ring-emerald-100">
          <b>{deliveryStatus.success}</b> {deliveryStatus.nextStep}
        </div>
      )}

      {resultTab === 'soal' && (
        <StudioQuestionDocument
          questions={questions}
          form={form}
          preview={preview}
          onEditQuestion={setEditingQuestionIndex}
        />
      )}
      {resultTab === 'kunci' && <StudioAnswerKey questions={questions} />}
      {resultTab === 'kisi' && <StudioBlueprint questions={questions} form={form} />}
      {resultTab === 'kuis' && <StudioPublishPanel publishToFeature={publishToFeature} savingTarget={savingTarget} />}
      {resultTab === 'analisis' && <StudioAnalysisPanel questions={questions} form={form} />}
      {resultTab === 'materi' && <StudioMaterialDocument preview={preview} />}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-purple-100 pt-3">
        {['Copy', 'Print', 'Word', 'PDF'].map((item) => (
          <span key={item} className="rounded-xl bg-galaxy-surface px-3 py-2 text-xs font-black text-galaxy-purple ring-1 ring-purple-100">
            {item}
          </span>
        ))}
      </div>

      {editingQuestion && (
        <StudioQuestionEditorModal
          question={editingQuestion}
          questionNumber={editingQuestionIndex + 1}
          onClose={() => setEditingQuestionIndex(null)}
          onSave={(nextQuestion) => updatePreviewQuestion(editingQuestionIndex, nextQuestion)}
        />
      )}
    </SectionCard>
  )
}



function StudioQuestionDocument({ questions, form, preview, onEditQuestion }) {
  const illustrationCount = toStudioNumber(form.illustrationCount, 0)
  const diagramCount = toStudioNumber(form.diagramCount, 0)

  if (!questions.length) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-purple-200 bg-slate-50 p-5 text-center">
        <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Belum ada soal</p>
        <h3 className="mt-2 text-2xl font-black text-slate-950">Hasil generasi masih kosong.</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Isi identitas konten, pilih mata pelajaran, kelas, topik, dan konfigurasi soal. Setelah itu klik <b>Buat Soal Otomatis</b>.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-5">
      <div className="mb-4 flex items-center gap-2">
        <CheckCircle2 className="text-galaxy-purple" size={20} />
        <h3 className="text-xl font-black text-galaxy-purple">Daftar Soal</h3>
        <span className="text-sm font-bold text-slate-400">({questions.length} soal)</span>
      </div>

      <div className="grid gap-4">
        {questions.map((question, index) => (
          <div key={question.id || index} className="rounded-2xl border-l-4 border-galaxy-action bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex gap-4">
              <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl bg-galaxy-lavender text-sm font-black text-galaxy-purple">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="whitespace-pre-line text-base font-semibold leading-8 text-slate-800">{question.questionText}</p>
                  <button
                    onClick={() => onEditQuestion(index)}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 ring-1 ring-violet-100"
                  >
                    <PenTool size={13} />
                    Edit
                  </button>
                </div>

                {index < illustrationCount && (
                  <div className="mt-4 rounded-3xl bg-violet-50 p-4 ring-1 ring-violet-100">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-black text-violet-700">Ilustrasi:</p>
                      <StatusBadge tone="green">Selesai</StatusBadge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-violet-700">
                      Ilustrasi kontekstual tentang {preview.topic || form.topic}, dibuat sebagai panduan visual untuk soal ini.
                    </p>
                    <div className="mt-3 grid h-40 place-items-center rounded-3xl bg-gradient-to-br from-cyan-100 via-white to-amber-100 text-center text-sm font-black text-slate-500 ring-1 ring-white">
                      Preview Ilustrasi / Gambar
                    </div>
                  </div>
                )}

                {index < diagramCount && (
                  <div className="mt-4 rounded-3xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                    <p className="text-sm font-black text-emerald-700">Diagram/Grafik:</p>
                    <div className="mt-3 flex h-32 items-end gap-3 rounded-3xl bg-white p-4 ring-1 ring-emerald-100">
                      {[35, 68, 44, 80, 55].map((height, barIndex) => (
                        <span key={barIndex} className="w-full rounded-t-2xl bg-emerald-200" style={{ height: `${height}%` }} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 grid gap-2">
                  {(question.options || []).slice(0, 5).map((option, optionIndex) => (
                    <p key={`${question.id}-${optionIndex}`} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-100">
                      {String.fromCharCode(65 + optionIndex)}. {option}
                    </p>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusBadge>{question.type || 'Pilihan Ganda'}</StatusBadge>
                  <StatusBadge tone="purple">{question.cognitiveLevel || 'C2'}</StatusBadge>
                  <StatusBadge tone={question.difficulty === 'Sulit' ? 'red' : question.difficulty === 'Sedang' ? 'amber' : 'green'}>{question.difficulty || 'Mudah'}</StatusBadge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StudioQuestionEditorModal({ question, questionNumber, onClose, onSave }) {
  const initialOptions = Array.isArray(question.options) && question.options.length > 0
    ? [...question.options]
    : ['Benar', 'Salah', '', '']

  while (initialOptions.length < 4) initialOptions.push('')

  const [draft, setDraft] = useState({
    questionText: question.questionText || question.question || '',
    options: initialOptions.slice(0, 5),
    correctAnswer: question.correctAnswer || initialOptions.find(Boolean) || '',
    difficulty: question.difficulty || 'Sedang',
    cognitiveLevel: question.cognitiveLevel || 'C2',
    type: question.type || 'Pilihan Ganda',
    indicator: question.indicator || '',
    explanation: question.explanation || '',
  })

  useEffect(() => {
    const nextOptions = Array.isArray(question.options) && question.options.length > 0
      ? [...question.options]
      : ['Benar', 'Salah', '', '']
    while (nextOptions.length < 4) nextOptions.push('')

    setDraft({
      questionText: question.questionText || question.question || '',
      options: nextOptions.slice(0, 5),
      correctAnswer: question.correctAnswer || nextOptions.find(Boolean) || '',
      difficulty: question.difficulty || 'Sedang',
      cognitiveLevel: question.cognitiveLevel || 'C2',
      type: question.type || 'Pilihan Ganda',
      indicator: question.indicator || '',
      explanation: question.explanation || '',
    })
  }, [question])

  function updateField(field, value) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  function updateOption(index, value) {
    setDraft((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => optionIndex === index ? value : option),
    }))
  }

  function handleSave() {
    const cleanedOptions = draft.options.map((item) => String(item || '').trim()).filter(Boolean)

    if (!draft.questionText.trim()) return
    if (cleanedOptions.length < 2) return

    onSave({
      ...draft,
      questionText: draft.questionText.trim(),
      options: cleanedOptions,
      correctAnswer: cleanedOptions.includes(draft.correctAnswer) ? draft.correctAnswer : cleanedOptions[0],
      indicator: draft.indicator.trim(),
      explanation: draft.explanation.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-glow ring-1 ring-purple-100">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Edit Soal</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Soal nomor {questionNumber}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-600 ring-1 ring-slate-100">
            Tutup
          </button>
        </div>

        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Pertanyaan
          <textarea
            value={draft.questionText}
            onChange={(event) => updateField('questionText', event.target.value)}
            rows={4}
            className="rounded-2xl border border-purple-100 bg-slate-50 px-4 py-3 text-sm leading-7 outline-none focus:border-purple-300"
          />
        </label>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {draft.options.map((option, index) => (
            <label key={index} className="grid gap-2 text-sm font-bold text-slate-700">
              Opsi {String.fromCharCode(65 + index)}
              <input
                value={option}
                onChange={(event) => updateOption(index, event.target.value)}
                className="rounded-2xl border border-purple-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-purple-300"
              />
            </label>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Kunci Jawaban
            <select
              value={draft.correctAnswer}
              onChange={(event) => updateField('correctAnswer', event.target.value)}
              className="rounded-2xl border border-purple-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-purple-300"
            >
              {draft.options.filter(Boolean).map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Tipe Soal
            <select
              value={draft.type}
              onChange={(event) => updateField('type', event.target.value)}
              className="rounded-2xl border border-purple-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-purple-300"
            >
              {['Pilihan Ganda', 'Isian Singkat', 'Essay/Uraian', 'Benar/Salah', 'Menjodohkan'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Level Kognitif
            <select
              value={draft.cognitiveLevel}
              onChange={(event) => updateField('cognitiveLevel', event.target.value)}
              className="rounded-2xl border border-purple-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-purple-300"
            >
              {['C1', 'C2', 'C3', 'C4', 'C5', 'C6'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Tingkat Kesulitan
            <select
              value={draft.difficulty}
              onChange={(event) => updateField('difficulty', event.target.value)}
              className="rounded-2xl border border-purple-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-purple-300"
            >
              {['Mudah', 'Sedang', 'Sulit'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <label className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
          Indikator
          <input
            value={draft.indicator}
            onChange={(event) => updateField('indicator', event.target.value)}
            className="rounded-2xl border border-purple-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-purple-300"
          />
        </label>

        <label className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
          Pembahasan
          <textarea
            value={draft.explanation}
            onChange={(event) => updateField('explanation', event.target.value)}
            rows={3}
            className="rounded-2xl border border-purple-100 bg-slate-50 px-4 py-3 text-sm leading-7 outline-none focus:border-purple-300"
          />
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-600 ring-1 ring-slate-100">
            Batal
          </button>
          <button onClick={handleSave} className="rounded-xl bg-galaxy-action px-4 py-3 text-sm font-black text-white shadow-glow">
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  )
}


function StudioAnswerKey({ questions }) {
  if (!questions.length) {
    return (
      <div className="mt-5 rounded-3xl bg-slate-50 p-6 text-center text-sm font-semibold leading-6 text-slate-500 ring-1 ring-slate-100">
        Kunci jawaban akan muncul setelah guru membuat soal.
      </div>
    )
  }

  return (
    <div className="mt-5 grid gap-3">
      {questions.map((question, index) => (
        <div key={question.id || index} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-black text-slate-950">Nomor {index + 1}</p>
            <StatusBadge tone="green">{question.correctAnswer || '-'}</StatusBadge>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{question.explanation || 'Pembahasan belum tersedia.'}</p>
        </div>
      ))}
    </div>
  )
}

function StudioBlueprint({ questions, form }) {
  if (!questions.length) {
    return (
      <div className="mt-5 rounded-3xl bg-slate-50 p-6 text-center text-sm font-semibold leading-6 text-slate-500 ring-1 ring-slate-100">
        Kisi-kisi akan muncul setelah soal dibuat.
      </div>
    )
  }

  return (
    <div className="mt-5 grid gap-3">
      {questions.map((question, index) => (
        <div key={question.id || index} className="rounded-3xl bg-white p-4 ring-1 ring-slate-100">
          <div className="mb-2 flex flex-wrap gap-2">
            <StatusBadge tone="cyan">Soal {index + 1}</StatusBadge>
            <StatusBadge>{question.type}</StatusBadge>
            <StatusBadge tone="purple">{question.cognitiveLevel}</StatusBadge>
            <StatusBadge tone="amber">{question.difficulty}</StatusBadge>
          </div>
          <p className="text-sm font-bold leading-6 text-slate-700">
            Indikator: {question.indicator || `Siswa mampu menjawab soal tentang ${form.topic}.`}
          </p>
        </div>
      ))}
    </div>
  )
}

function StudioPublishPanel({ publishToFeature, savingTarget }) {
  const actions = [
    ['bank-soal', 'Kirim ke Bank Soal', FileQuestion, 'Simpan semua soal agar bisa diedit guru.'],
    ['kuis', 'Buat Kuis Live', PlayCircle, 'Buat draft kuis dari soal yang sudah dihasilkan.'],
    ['materi', 'Kirim ke Materi', BookOpen, 'Simpan sebagai draft materi guru.'],
    ['tugas', 'Kirim ke Tugas', ClipboardList, 'Simpan sebagai draft tugas.'],
  ]

  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2">
      {actions.map(([id, label, Icon, description]) => (
        <button
          key={id}
          onClick={() => publishToFeature(id)}
          disabled={savingTarget === id}
          className="rounded-3xl bg-gradient-to-br from-white to-violet-50 p-5 text-left shadow-sm ring-1 ring-purple-100 transition hover:-translate-y-0.5 hover:shadow-soft disabled:cursor-wait disabled:opacity-70"
        >
          <Icon size={22} className="text-galaxy-purple" />
          <p className="mt-3 text-lg font-black text-slate-950">{savingTarget === id ? 'Menyimpan...' : label}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </button>
      ))}
    </div>
  )
}

function StudioAnalysisPanel({ questions, form }) {
  if (!questions.length) {
    return (
      <div className="mt-5 rounded-3xl bg-slate-50 p-6 text-center text-sm font-semibold leading-6 text-slate-500 ring-1 ring-slate-100">
        Analisis tingkat kesulitan dan level kognitif akan muncul setelah soal dibuat.
      </div>
    )
  }

  const difficultyCounts = questions.reduce((acc, question) => {
    const key = question.difficulty || 'Sedang'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const cognitiveCounts = questions.reduce((acc, question) => {
    const key = question.cognitiveLevel || 'C2'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return (
    <div className="mt-5 grid gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Mudah" value={difficultyCounts.Mudah || 0} caption={`${form.easyPct || 0}% target`} tone="green" />
        <StatCard label="Sedang" value={difficultyCounts.Sedang || 0} caption={`${form.mediumPct || 0}% target`} tone="amber" />
        <StatCard label="Sulit" value={difficultyCounts.Sulit || 0} caption={`${form.hardPct || 0}% target`} tone="red" />
      </div>

      <SectionCard>
        <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Level Kognitif</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['C1', 'C2', 'C3', 'C4', 'C5', 'C6'].map((level) => (
            <StatusBadge key={level} tone={(cognitiveCounts[level] || 0) > 0 ? 'purple' : 'gray'}>
              {level}: {cognitiveCounts[level] || 0}
            </StatusBadge>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function StudioMaterialDocument({ preview }) {
  const sections = Array.isArray(preview.sections) ? preview.sections : []

  return (
    <div className="mt-5 grid gap-4">
      {sections.map((section, index) => (
        <div key={`${section.title}-${index}`} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
          <StatusBadge tone="cyan">{section.title}</StatusBadge>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{section.body}</p>
        </div>
      ))}
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
          <h2 className="text-xl font-extrabold text-slate-950">Buat konten pembelajaran</h2>
          <p className="text-sm text-slate-500">Isi kebutuhan guru, beri instruksi khusus, lalu buat draft AI.</p>
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
        <p className="text-sm font-extrabold text-slate-950">8. Buat draft dan kirim</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Buat draft AI sesuai instruksi guru. Setelah cocok, kirim ke Materi, Bank Soal, Kuis, Flashcard, atau LKPD.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">

      <label className="mt-5 grid gap-2 text-sm font-bold text-slate-700">
        Instruksi khusus untuk AI
        <textarea
          value={form.customInstruction || ''}
          onChange={(event) => updateForm('customInstruction', event.target.value)}
          rows={5}
          placeholder="Contoh: Buat narrative text tentang siswa kepulauan. Contoh teks, soal, pilihan jawaban, dan jawaban benar dalam English. Penjelasan dan pembahasan dalam Bahasa Indonesia. Buat 5 soal pilihan ganda dan 1 speaking activity."
          className="w-full rounded-[1.5rem] border border-purple-100 bg-galaxy-surface px-4 py-3 text-sm leading-7 outline-none focus:border-purple-300"
        />
        <span className="text-xs font-semibold leading-5 text-slate-500">
          Guru bebas mengatur gaya, jumlah soal, bahasa, konteks lokal, level kesulitan, bentuk aktivitas, dan format jawaban.
        </span>
      </label>

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
  const lowerText = text.toLowerCase()
  const words = text.split(/\s+/).filter(Boolean)
  const sections = Array.isArray(preview.sections) ? preview.sections : []
  const questions = Array.isArray(preview.generatedQuestions) ? preview.generatedQuestions : []
  const tools = Array.isArray(preview.tools) ? preview.tools : []

  const checks = [
    {
      label: 'TP/ATP sudah dipilih',
      passed: Boolean(form.learningObjectiveId || preview.learningObjectiveId),
      suggestion: 'Pilih TP/ATP di panel Kurikulum Merdeka sebelum draft dikirim ke fitur aplikasi.',
    },
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
      passed: questions.length >= 3 || lowerText.includes('pertanyaan'),
      suggestion: 'Tambahkan minimal 3 pertanyaan formatif.',
    },
    {
      label: 'Ada aktivitas siswa',
      passed: lowerText.includes('aktivitas') || lowerText.includes('diskusi') || lowerText.includes('latihan'),
      suggestion: 'Tambahkan aktivitas individu/kelompok yang jelas.',
    },
    {
      label: 'Ada asesmen atau umpan balik',
      passed: questions.length > 0 || lowerText.includes('asesmen') || lowerText.includes('penilaian') || lowerText.includes('exit ticket'),
      suggestion: 'Tambahkan asesmen formatif, exit ticket, atau umpan balik singkat.',
    },
    {
      label: 'Ada refleksi belajar',
      passed: lowerText.includes('refleksi') || lowerText.includes('exit ticket') || lowerText.includes('hal yang kamu pahami'),
      suggestion: 'Tambahkan pertanyaan refleksi agar siswa menilai pemahamannya sendiri.',
    },
    {
      label: 'Ada diferensiasi/remedial/pengayaan',
      passed: lowerText.includes('remedial') || lowerText.includes('pengayaan') || lowerText.includes('diferensiasi'),
      suggestion: 'Tambahkan opsi remedial dan pengayaan untuk siswa yang kebutuhannya berbeda.',
    },
    {
      label: 'Ada alur memahami, mengaplikasi, merefleksi',
      passed: lowerText.includes('memahami') && lowerText.includes('mengaplikasi') && lowerText.includes('merefleksi'),
      suggestion: 'Tambahkan bagian Memahami, Mengaplikasi, dan Merefleksi agar sesuai pendekatan Deep Learning.',
    },
    {
      label: 'Ada konteks bermakna atau menggembirakan',
      passed: lowerText.includes('bermakna') || lowerText.includes('menggembirakan') || lowerText.includes('kontekstual'),
      suggestion: 'Tambahkan konteks dekat dengan siswa agar pembelajaran terasa bermakna dan menggembirakan.',
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
    tone: score >= 80 ? 'green' : score >= 60 ? 'amber' : 'red',
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

function AnalyticsPanel({ preview, snapshot }) {
  const analytics = snapshot || getTeacherAnalyticsSnapshot([], [])
  const previewReport = buildContentQualityReport(preview, { topic: preview.topic, learningObjectiveId: preview.learningObjectiveId })

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total item lokal" value={analytics.totals.all} tone="cyan" />
        <StatCard label="Bank soal" value={analytics.totals.questions} tone="purple" />
        <StatCard label="Kuis" value={analytics.totals.quizzes} tone="amber" />
        <StatCard label="Coverage TP" value={`${analytics.totals.objectiveCoverage}%`} tone="green" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Distribusi Konten</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Jenis konten yang dibuat</h2>
          <div className="mt-4 grid gap-3">
            {(analytics.typeCounts.length ? analytics.typeCounts : [{ name: 'Belum ada arsip', value: 0 }]).map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                <span className="font-bold text-slate-700">{item.name}</span>
                <StatusBadge tone="cyan">{item.value}</StatusBadge>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Sebaran Mapel</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Mapel paling sering dibuat</h2>
          <div className="mt-4 grid gap-3">
            {(analytics.subjectCounts.length ? analytics.subjectCounts : [{ name: 'Belum ada arsip', value: 0 }]).map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                <span className="font-bold text-slate-700">{item.name}</span>
                <StatusBadge tone="purple">{item.value}</StatusBadge>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Rekomendasi Guru</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Tindakan berikutnya</h2>
          <div className="mt-4 grid gap-3">
            {(analytics.recommendations.length ? analytics.recommendations : [{
              title: 'Data lokal sudah cukup rapi',
              description: 'Lanjutkan membuat konten baru dengan memilih TP/ATP dan cek Quality Check sebelum publish.',
              tone: 'green',
            }]).slice(0, 6).map((item) => (
              <div key={item.title} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <StatusBadge tone={item.tone}>{item.title}</StatusBadge>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Aktivitas Terakhir</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Item lokal terbaru</h2>
          <div className="mt-4 grid gap-3">
            {analytics.recentItems.length > 0 ? analytics.recentItems.map((item, index) => (
              <div key={`${item.outputType}-${item.id || item.title || index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                <div>
                  <p className="font-bold text-slate-800">{item.title}</p>
                  <p className="text-xs font-semibold text-slate-500">{item.subject || 'Umum'} · {item.topic || item.outputType}</p>
                </div>
                <StatusBadge tone={item.learningObjectiveId ? 'green' : 'amber'}>{item.outputType || 'Draft'}</StatusBadge>
              </div>
            )) : (
              <p className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-slate-500 ring-1 ring-slate-100">
                Belum ada aktivitas lokal. Buat draft dari Smart Templates, Import Teks/Video, atau simpan rubrik terlebih dahulu.
              </p>
            )}
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



function CurriculumPickerPanel({ curriculumData, curriculumError, selectedLearningObjective, selectedObjectiveId, onSelectObjective }) {
  const objectives = curriculumData.objectives || []
  const activeSubjects = (curriculumData.subjects || []).filter((item) => item.is_active !== false)

  return (
    <SectionCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Kurikulum Merdeka</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Hubungkan draft ke CP/TP/ATP.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Pilih tujuan pembelajaran agar materi, soal, kuis, tugas, remedial, pengayaan, dan laporan bisa terbaca sebagai capaian kurikulum.
          </p>
        </div>
        <StatusBadge tone={selectedLearningObjective ? 'green' : 'amber'}>
          {selectedLearningObjective ? 'TP terhubung' : 'Belum pilih TP'}
        </StatusBadge>
      </div>

      {curriculumError && (
        <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">
          {curriculumError}. Jalankan migration dan seed kurikulum di Supabase jika data belum muncul.
        </div>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Pilih TP/ATP
          <select
            value={selectedObjectiveId || ''}
            onChange={(event) => onSelectObjective(event.target.value)}
            className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
          >
            <option value="">Belum memilih TP</option>
            {objectives.slice(0, 300).map((objective) => (
              <option key={objective.id} value={objective.id}>
                {objective.subjectCode} · K{objective.grade} S{objective.semester} · {objective.code}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
          {selectedLearningObjective ? (
            <>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone="purple">{selectedLearningObjective.subjectName}</StatusBadge>
                <StatusBadge tone="cyan">{selectedLearningObjective.phaseName}</StatusBadge>
                <StatusBadge tone="amber">Kelas {selectedLearningObjective.grade} · S{selectedLearningObjective.semester}</StatusBadge>
              </div>
              <p className="mt-3 text-sm font-extrabold text-slate-950">{selectedLearningObjective.code}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{selectedLearningObjective.objective}</p>
              <p className="mt-2 text-xs font-bold text-amber-600">{selectedLearningObjective.verification_status}</p>
            </>
          ) : (
            <>
              <p className="font-extrabold text-slate-950">Draft belum terhubung ke TP.</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Guru tetap bisa membuat draft, tetapi konten perlu dihubungkan ke TP agar masuk laporan kurikulum dan mastery learning.
              </p>
              <p className="mt-3 text-xs font-bold text-slate-400">
                Mapel aktif tersedia: {activeSubjects.length || 0}
              </p>
            </>
          )}
        </div>
      </div>
    </SectionCard>
  )
}


function PreviewPanel({ preview, publishToFeature, deliveryStatus, savingTarget }) {
  return (
    <SectionCard>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-galaxy-purple">Preview konten</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">{cleanAIPreviewTitle(preview.title, preview.title)}</h2>
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
            <h3 className="font-extrabold text-slate-950">{cleanAIPreviewTitle(section.title)}</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{cleanAIPreviewText(section.body)}</p>
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
          <StatusBadge tone="green">Siap dipakai</StatusBadge>
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
                      <StatusBadge tone="amber">{template.outputType}</StatusBadge>
                      {template.tools.slice(0, 3).map((tool) => <StatusBadge key={tool} tone="cyan">{tool}</StatusBadge>)}
                    </div>
                    <p className="mt-3 text-xs font-extrabold text-galaxy-purple">Klik untuk mengisi form dan membuat preview lengkap.</p>
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
                  Pakai template dasar
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
        {(Array.isArray(rubric.criteria) ? rubric.criteria : []).map((criterion, index) => (
          <div key={`${criterion.aspect || 'kriteria'}-${index}`} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <h3 className="font-extrabold text-slate-950">{criterion.aspect}</h3>
            <div className="mt-3 grid gap-2">
              {Object.entries(criterion.levels || {}).reverse().map(([score, text]) => (
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

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <TextField label="Judul video" value={form.videoTitle} onChange={(value) => updateForm('videoTitle', value)} placeholder="Video Interaktif: Sistem Pernapasan" />
          <TextField label="Catatan guru" value={form.videoNote} onChange={(value) => updateForm('videoNote', value)} placeholder="Minta siswa menjeda video dan menulis jawaban singkat." />
        </div>

        <label className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
          Pertanyaan timestamp
          <textarea
            value={form.videoTimestamps}
            onChange={(event) => updateForm('videoTimestamps', event.target.value)}
            rows={4}
            placeholder="00:30 | Apa konsep awal yang disampaikan?"
            className="rounded-2xl border border-purple-100 bg-galaxy-surface px-4 py-3 outline-none focus:border-purple-300"
          />
          <span className="text-xs font-semibold text-slate-500">Format sederhana: menit | pertanyaan. Satu pertanyaan per baris.</span>
        </label>

        <button onClick={createVideoInteractive} className="mt-3 inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-50 px-5 py-3 text-sm font-extrabold text-cyan-700">
          <PlayCircle size={16} />
          Buat video interaktif
        </button>
      </div>
    </SectionCard>
  )
}

function ArchivePanel({ contentRows, rubricRows, onClearArchive }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <DashboardCard title="Arsip konten lokal">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <StatusBadge tone="cyan">{contentRows.length} item</StatusBadge>
          <button
            type="button"
            onClick={() => onClearArchive('content')}
            disabled={contentRows.length === 0}
            className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-700 ring-1 ring-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={14} />
            Kosongkan
          </button>
        </div>
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <StatusBadge tone="purple">{rubricRows.length} rubrik</StatusBadge>
          <button
            type="button"
            onClick={() => onClearArchive('rubric')}
            disabled={rubricRows.length === 0}
            className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-700 ring-1 ring-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={14} />
            Kosongkan
          </button>
        </div>
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
