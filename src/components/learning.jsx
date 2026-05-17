import { useState } from 'react'
import { ArrowRight, Bot, Check, Circle, Copy, RotateCcw, Send, Sparkles, Trophy } from 'lucide-react'
import { askTutor, generateQuestions } from '../services/aiService.js'
import { badges, isleclub } from '../data/dummyData.js'
import { EmptyState, QuickActionButton, SectionCard, StatusBadge } from './ui.jsx'

export function DailyMissionCard() {
  const missions = ['Baca 1 materi', 'Kerjakan 5 soal', 'Review 3 flashcard']
  return (
    <SectionCard>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0f766e]">Misi hari ini</p>
          <h2 className="mt-1 text-xl font-black text-gray-950">Selesaikan satu langkah kecil</h2>
        </div>
        <StatusBadge tone="amber">+50 XP</StatusBadge>
      </div>
      <div className="divide-y divide-[#123c3b]/10">
        {missions.map((mission, index) => (
          <div key={mission} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className={`flex h-8 w-8 items-center justify-center rounded-[0.75rem] ${index < 2 ? 'bg-emerald-50 text-emerald-600' : 'bg-[#e8f4ef] text-[#0f766e]'}`}>
              {index < 2 ? <Check size={16} /> : <Circle size={15} />}
            </span>
            <span className="text-sm font-bold text-gray-800">{mission}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-[0.9rem] bg-amber-50 px-4 py-3 text-sm font-extrabold text-amber-700 ring-1 ring-amber-100">Reward selesai: +50 XP</p>
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
            <div className={`grid h-14 min-w-24 place-items-center rounded-[0.95rem] text-center text-xs font-extrabold ${index < 4 ? 'bg-[#123c3b] text-white shadow-[0_12px_28px_rgba(15,31,42,0.14)]' : 'bg-white text-[#0f766e] ring-1 ring-[#123c3b]/10'}`}>
              {step}
            </div>
            {index < steps.length - 1 && <ArrowRight className="mx-2 h-5 w-5 flex-shrink-0 text-[#0f766e]/50" />}
          </div>
        ))}
      </div>
    </div>
  )
}

export function BadgeCard({ badge = badges[0] }) {
  const safeBadge = badge || {
    icon: Trophy,
    tone: 'teal',
    name: 'Belum ada badge',
    description: 'Badge akan muncul setelah aktivitas belajar tersedia.',
  }
  const Icon = safeBadge.icon || Trophy
  const tones = {
    purple: 'bg-[#e8f4ef] text-[#0f766e] ring-[#0f766e]/10',
    cyan: 'bg-cyan-50 text-galaxy-cyan ring-cyan-100',
    teal: 'bg-teal-50 text-galaxy-teal ring-teal-100',
    coral: 'bg-rose-50 text-galaxy-coral ring-rose-100',
    gold: 'bg-yellow-50 text-amber-600 ring-yellow-100',
  }
  return (
    <div className="rounded-[1.05rem] bg-white/86 p-4 ring-1 ring-[#123c3b]/10">
      <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-[0.9rem] ring-1 ${tones[safeBadge.tone] || tones.teal}`}>
        <Icon size={22} />
      </div>
      <p className="text-sm font-extrabold text-gray-950">{safeBadge.name}</p>
      <p className="mt-1 text-xs leading-5 text-gray-500">{safeBadge.description}</p>
    </div>
  )
}

export function IsleClubCorner({ compact = false }) {
  const hasClubContent = isleclub.word || isleclub.phrase || isleclub.challenge || isleclub.prompt

  if (!hasClubContent) {
    return (
      <EmptyState
        title="IsleClub belum diisi"
        description="Konten English Corner akan muncul setelah guru menambahkannya."
      />
    )
  }

  return (
    <SectionCard className="archipelago-soft island-wave">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[0.9rem] bg-[#123c3b] text-white shadow-[0_12px_28px_rgba(15,31,42,0.14)]">
          <Sparkles size={22} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0f766e]">IsleClub English Corner</p>
          <h2 className="mt-1 text-xl font-black text-gray-950">Practice English, island style.</h2>
        </div>
      </div>
      <div className={`grid gap-3 ${compact ? '' : 'md:grid-cols-2'}`}>
        <Info label="Word of the Day" value={`${isleclub.word} = menjelajahi`} />
        <Info label="Phrase of the Day" value={isleclub.phrase} />
        <Info label="Speaking Challenge" value={isleclub.challenge} />
        <Info label="Writing Prompt" value={isleclub.prompt} />
      </div>
    </SectionCard>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-[0.95rem] bg-white/82 p-4 ring-1 ring-[#123c3b]/10">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-gray-850">{value}</p>
    </div>
  )
}


function FormattedAIText({ text }) {
  const lines = normalizeAiText(text).split(/\n+/).map((line) => line.trim()).filter(Boolean)

  return (
    <div className="space-y-2">
      {lines.map((line, index) => (
        <p key={`${line}-${index}`} className={/^\d+\./.test(line) ? 'pl-1' : ''}>
          {renderInlineMarkdown(line)}
        </p>
      ))}
    </div>
  )
}

function normalizeAiText(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\s+(\d+\.\s)/g, '\n\n$1')
    .replace(/\s+([-•]\s)/g, '\n$1')
}

function renderInlineMarkdown(line) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-extrabold text-slate-950">{part.slice(2, -2)}</strong>
    }

    return <span key={index}>{part}</span>
  })
}

export function AIChatPanel() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo, saya AI Tutor IsleLearn. Mau belajar apa hari ini?' },
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
        <div className="flex h-12 w-12 items-center justify-center rounded-[0.9rem] bg-[#123c3b] text-white shadow-[0_12px_28px_rgba(15,31,42,0.14)]">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-950">AI Tutor</h2>
          <p className="text-sm font-medium text-gray-500">Tanyakan materi dan latihan tanpa keluar dari halaman.</p>
        </div>
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {chips.map((chip) => <button key={chip} onClick={() => submit(chip)} className="flex-shrink-0 rounded-[0.8rem] bg-[#f7f4ee] px-3 py-2 text-xs font-bold text-[#0f766e] ring-1 ring-[#123c3b]/10">{chip}</button>)}
      </div>
      <div className="thin-scrollbar mb-4 max-h-80 space-y-3 overflow-y-auto rounded-[1rem] bg-[#f7f4ee] p-3">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`max-w-[88%] rounded-[1rem] px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${message.role === 'assistant' ? 'bg-white text-gray-700 shadow-sm' : 'ml-auto bg-[#123c3b] text-white'}`}>
            <FormattedAIText text={message.content} />
          </div>
        ))}
      </div>
      <form onSubmit={(event) => { event.preventDefault(); submit() }} className="flex gap-2">
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Tulis pertanyaan belajarmu..." className="min-h-12 flex-1 rounded-[0.9rem] border border-[#123c3b]/10 bg-white px-4 text-sm outline-none focus:border-[#2f7d74]" />
        <button aria-label="Kirim pertanyaan" className="grid h-12 w-12 place-items-center rounded-[0.9rem] bg-[#123c3b] text-white shadow-[0_12px_28px_rgba(15,31,42,0.14)]"><Send size={18} /></button>
      </form>
    </SectionCard>
  )
}

export function AIGeneratorPanel() {
  const [options, setOptions] = useState({ subject: '', className: '', topic: '', type: '', level: '', total: 3 })
  const [output, setOutput] = useState([])

  async function generate() {
    if (!options.topic.trim()) return
    const result = await generateQuestions({ subject: options.subject, topic: options.topic, total: options.total })
    setOutput(result)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <SectionCard>
        <h2 className="text-xl font-extrabold text-gray-950">AI Generator Guru</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">Terhubung ke endpoint AI server saat tersedia, dengan mode fallback aman saat offline atau API belum dikonfigurasi.</p>
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
              <input value={options[key]} onChange={(event) => setOptions((current) => ({ ...current, [key]: event.target.value }))} placeholder={key === 'topic' ? 'Tulis topik yang ingin dibuat' : 'Isi sesuai kebutuhan'} className="rounded-[0.9rem] border border-[#123c3b]/10 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-[#2f7d74]" />
            </label>
          ))}
          <QuickActionButton icon={Sparkles} label="Generate" onClick={generate} disabled={!options.topic.trim()} />
        </div>
      </SectionCard>
      <SectionCard className="bg-galaxy-deep text-white">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Output AI</h2>
          <button className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-bold text-white"><Copy size={14} className="mr-1 inline" /> Salin</button>
        </div>
        <div className="space-y-3">
          {output.length > 0 ? output.map((item, index) => (
            <div key={`${item.question}-${index}`} className="rounded-[1rem] bg-white/10 p-4 ring-1 ring-white/10">
              <p className="text-sm font-bold text-white">{item.question}</p>
              {item.options?.length > 0 && <p className="mt-2 text-xs leading-5 text-white/70">{item.options.join(' · ')}</p>}
              <p className="mt-3 text-xs text-cyan-200">Kunci: {item.answer}</p>
              <p className="mt-1 text-xs leading-5 text-white/70">{item.explanation}</p>
            </div>
          )) : (
            <EmptyState
              title="Belum ada output"
              description="Isi topik dan konfigurasi, lalu generate draft."
            />
          )}
        </div>
      </SectionCard>
    </div>
  )
}

export function FlashcardDeck({ deck }) {
  const [flipped, setFlipped] = useState(false)
  const safeDeck = deck || {
    title: 'Belum ada flashcard',
    count: 0,
    progress: 0,
    subject: 'Mata pelajaran',
    front: 'Belum ada kartu',
    back: 'Flashcard akan muncul setelah guru membuatnya.',
  }

  return (
    <SectionCard>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-gray-950">{safeDeck.title}</h3>
          <p className="text-sm text-gray-500">{safeDeck.count} kartu · {safeDeck.progress}% progress</p>
        </div>
        <StatusBadge tone="cyan">{safeDeck.subject}</StatusBadge>
      </div>
      <button onClick={() => setFlipped(!flipped)} className="min-h-44 w-full rounded-[1rem] bg-[#123c3b] p-5 text-left text-white shadow-[0_16px_40px_rgba(15,31,42,0.16)]">
        <p className="text-sm text-white/60">{flipped ? 'Jawaban' : 'Pertanyaan'}</p>
        <p className="mt-5 text-3xl font-extrabold">{flipped ? safeDeck.back : safeDeck.front}</p>
      </button>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">Saya Tahu</button>
        <button className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700"><RotateCcw size={15} className="mr-1 inline" /> Ulangi</button>
      </div>
    </SectionCard>
  )
}
