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

  function generateDraft() {
    const draft = buildFallbackLesson(form)
    setPreview(draft)
    setToast('Draft konten berhasil dibuat dengan fallback lokal.')
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
      setToast('Draft berhasil dikirim ke Materi Guru.')
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
      setToast('Draft berhasil dikirim ke Tugas Guru.')
      return
    }

    if (target === 'bank-soal') {
      const generatedQuestions = makeGeneratedQuestions(preview, form, 5)
      appendStorageRows(teacherStorageKey('questions', user, subject), generatedQuestions)
      setToast('5 soal berhasil dikirim ke Bank Soal.')
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
      setToast('Draft kuis berhasil dikirim ke Kuis Live dan Bank Soal.')
      return
    }

    if (target === 'flashcard') {
      const flashcard = makeFlashcards(preview, form)
      appendStorageRows(FLASHCARD_KEY, [flashcard])
      setToast('Flashcard berhasil disimpan ke arsip flashcard Studio Konten.')
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
      setToast(`${item.outputType} tersimpan di arsip Studio Konten.`)
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
          ['templates', 'Template Mapel', Layers3],
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
          <PreviewPanel preview={preview} publishToFeature={publishToFeature} />
        </div>
      )}

      {activeTab === 'templates' && <TemplatePanel onUseSubject={(subject) => { updateForm('subject', subject); setActiveTab('builder') }} />}

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
          <PreviewPanel preview={preview} publishToFeature={publishToFeature} />
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

function PreviewPanel({ preview, publishToFeature }) {
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
        <div className="mt-5 rounded-3xl bg-gradient-to-r from-violet-50 to-cyan-50 p-4 ring-1 ring-violet-100">
          <p className="text-sm font-extrabold text-slate-950">Kirim draft ke fitur aplikasi</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Gunakan tombol ini agar hasil Studio Konten langsung masuk ke fitur guru yang sudah ada.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ['materi', 'Materi'],
              ['tugas', 'Tugas'],
              ['bank-soal', 'Bank Soal'],
              ['kuis', 'Kuis Live'],
              ['flashcard', 'Flashcard'],
              ['rubrik', 'Rubrik'],
              ['remedial', 'Remedial'],
              ['pengayaan', 'Pengayaan'],
            ].map(([target, label]) => (
              <button
                key={target}
                onClick={() => publishToFeature(target)}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-galaxy-purple ring-1 ring-purple-100 transition hover:-translate-y-0.5 hover:bg-galaxy-lavender"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  )
}

function TemplatePanel({ onUseSubject }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
