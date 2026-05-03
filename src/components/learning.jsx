import { useState } from 'react'
import { ArrowRight, Bot, Check, Circle, Copy, RotateCcw, Send, Sparkles, Trophy } from 'lucide-react'
import { askTutor, generateQuestions } from '../services/aiService.js'
import { badges, seaclub } from '../data/dummyData.js'
import { QuickActionButton, SectionCard, StatusBadge } from './ui.jsx'

export function DailyMissionCard() {
  const missions = ['Baca 1 materi', 'Kerjakan 5 soal', 'Review 3 flashcard']
  return (
    <SectionCard className="bg-gradient-to-br from-white to-galaxy-surface">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-galaxy-purple">Daily Learning Mission</p>
          <h2 className="text-xl font-extrabold text-gray-950">Selesaikan satu misi kecil</h2>
        </div>
        <StatusBadge tone="amber">+50 XP</StatusBadge>
      </div>
      <div className="space-y-3">
        {missions.map((mission, index) => (
          <div key={mission} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-purple-100">
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${index < 2 ? 'bg-emerald-50 text-emerald-600' : 'bg-galaxy-lavender text-galaxy-purple'}`}>
              {index < 2 ? <Check size={16} /> : <Circle size={15} />}
            </span>
            <span className="text-sm font-bold text-gray-800">{index < 2 ? '✓' : '○'} {mission}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-extrabold text-amber-700 ring-1 ring-amber-100">Reward selesai: +50 XP</p>
    </SectionCard>
  )
}

export function LearningPath() {
  const steps = ['Start', 'Materi', 'Practice', 'Quiz', 'Mastery', 'Badge']
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-[620px] items-center gap-2">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-1 items-center">
            <div className={`grid h-16 min-w-24 place-items-center rounded-3xl text-center text-xs font-extrabold ${index < 4 ? 'bg-galaxy-action text-white shadow-glow' : 'bg-white text-galaxy-purple ring-1 ring-purple-100'}`}>
              {step}
            </div>
            {index < steps.length - 1 && <ArrowRight className="mx-2 h-5 w-5 flex-shrink-0 text-galaxy-purple/50" />}
          </div>
        ))}
      </div>
    </div>
  )
}

export function BadgeCard({ badge = badges[0] }) {
  const Icon = badge.icon || Trophy
  const tones = {
    purple: 'bg-galaxy-lavender text-galaxy-purple ring-purple-100',
    cyan: 'bg-cyan-50 text-galaxy-cyan ring-cyan-100',
    teal: 'bg-teal-50 text-galaxy-teal ring-teal-100',
    coral: 'bg-rose-50 text-galaxy-coral ring-rose-100',
    gold: 'bg-yellow-50 text-amber-600 ring-yellow-100',
  }
  return (
    <div className="rounded-3xl bg-white p-4 shadow-soft ring-1 ring-purple-100">
      <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${tones[badge.tone] || tones.purple}`}>
        <Icon size={22} />
      </div>
      <p className="text-sm font-extrabold text-gray-950">{badge.name}</p>
      <p className="mt-1 text-xs leading-5 text-gray-500">{badge.description}</p>
    </div>
  )
}

export function SEAClubCorner({ compact = false }) {
  return (
    <SectionCard className="archipelago-soft island-wave">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-galaxy-action text-white shadow-glow">
          <Sparkles size={22} />
        </div>
        <div>
          <p className="text-sm font-bold text-galaxy-purple">SEAClub English Corner</p>
          <h2 className="text-xl font-extrabold text-gray-950">Practice English, island style.</h2>
        </div>
      </div>
      <div className={`grid gap-3 ${compact ? '' : 'md:grid-cols-2'}`}>
        <Info label="Word of the Day" value={`${seaclub.word} = menjelajahi`} />
        <Info label="Phrase of the Day" value={seaclub.phrase} />
        <Info label="Speaking Challenge" value={seaclub.challenge} />
        <Info label="Writing Prompt" value={seaclub.prompt} />
      </div>
    </SectionCard>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-purple-100">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-gray-850">{value}</p>
    </div>
  )
}

export function AIChatMockup() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo, saya AI Tutor SEA Learning. Mau belajar apa hari ini?' },
  ])
  const [input, setInput] = useState('')

  async function submit(prompt = input) {
    if (!prompt.trim()) return
    setMessages((current) => [...current, { role: 'user', content: prompt }])
    setInput('')
    const response = await askTutor(prompt)
    setMessages((current) => [...current, response])
  }

  const chips = ['Jelaskan materi ini', 'Buat contoh soal', 'Cek grammar saya', 'Bantu latihan speaking', 'Ringkas materi']

  return (
    <SectionCard className="min-h-[34rem]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-galaxy-action text-white shadow-glow">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-950">AI Tutor</h2>
          <p className="text-sm text-gray-500">Belajar bertahap, bukan cari jawaban ujian aktif.</p>
        </div>
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {chips.map((chip) => <button key={chip} onClick={() => submit(chip)} className="flex-shrink-0 rounded-full bg-galaxy-surface px-3 py-2 text-xs font-bold text-galaxy-purple ring-1 ring-purple-100">{chip}</button>)}
      </div>
      <div className="thin-scrollbar mb-4 max-h-80 space-y-3 overflow-y-auto rounded-3xl bg-galaxy-surface p-3">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-6 ${message.role === 'assistant' ? 'bg-white text-gray-700 shadow-sm' : 'ml-auto bg-galaxy-deep text-white'}`}>
            {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={(event) => { event.preventDefault(); submit() }} className="flex gap-2">
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Tulis pertanyaan belajarmu..." className="min-h-12 flex-1 rounded-2xl border border-purple-100 bg-white px-4 text-sm outline-none focus:border-galaxy-purple" />
        <button aria-label="Kirim pertanyaan" className="grid h-12 w-12 place-items-center rounded-2xl bg-galaxy-action text-white shadow-glow"><Send size={18} /></button>
      </form>
    </SectionCard>
  )
}

export function AIGeneratorMockup() {
  const [options, setOptions] = useState({ subject: 'Bahasa Inggris', className: 'X.1', topic: 'Descriptive Text', type: 'Soal pilihan ganda', level: 'Sedang', total: 3 })
  const [output, setOutput] = useState([])

  async function generate() {
    const result = await generateQuestions({ subject: options.subject, topic: options.topic, total: options.total })
    setOutput(result)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <SectionCard>
        <h2 className="text-xl font-extrabold text-gray-950">AI Generator Guru</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">Terhubung ke endpoint AI server saat tersedia, dengan fallback mock agar tetap aman saat offline.</p>
        <div className="mt-5 grid gap-3">
          {[
            ['subject', 'Mata pelajaran'],
            ['className', 'Kelas'],
            ['topic', 'Topik'],
            ['type', 'Jenis output'],
            ['level', 'Level'],
            ['total', 'Jumlah soal'],
          ].map(([key, label]) => (
            <label key={key} className="grid gap-1 text-sm font-bold text-gray-700">
              {label}
              <input value={options[key]} onChange={(event) => setOptions((current) => ({ ...current, [key]: event.target.value }))} className="rounded-2xl border border-purple-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-galaxy-purple" />
            </label>
          ))}
          <QuickActionButton icon={Sparkles} label="Generate" onClick={generate} />
        </div>
      </SectionCard>
      <SectionCard className="bg-galaxy-deep text-white">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Output AI</h2>
          <button className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-bold text-white"><Copy size={14} className="mr-1 inline" /> Salin</button>
        </div>
        <div className="space-y-3">
          {(output.length ? output : [{ question: 'Klik Generate untuk membuat soal.', options: [], answer: '-', explanation: 'Output akan tampil di sini.' }]).map((item, index) => (
            <div key={`${item.question}-${index}`} className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
              <p className="text-sm font-bold text-white">{item.question}</p>
              {item.options?.length > 0 && <p className="mt-2 text-xs leading-5 text-white/70">{item.options.join(' · ')}</p>}
              <p className="mt-3 text-xs text-cyan-200">Kunci: {item.answer}</p>
              <p className="mt-1 text-xs leading-5 text-white/70">{item.explanation}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

export function FlashcardDeck({ deck }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <SectionCard>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-gray-950">{deck.title}</h3>
          <p className="text-sm text-gray-500">{deck.count} kartu · {deck.progress}% progress</p>
        </div>
        <StatusBadge tone="cyan">{deck.subject}</StatusBadge>
      </div>
      <button onClick={() => setFlipped(!flipped)} className="min-h-44 w-full rounded-3xl bg-galaxy-deep p-5 text-left text-white shadow-glow">
        <p className="text-sm text-white/60">{flipped ? 'Jawaban' : 'Pertanyaan'}</p>
        <p className="mt-5 text-3xl font-extrabold">{flipped ? deck.back : deck.front}</p>
      </button>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">Saya Tahu</button>
        <button className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700"><RotateCcw size={15} className="mr-1 inline" /> Ulangi</button>
      </div>
    </SectionCard>
  )
}
