import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Search, Sparkles, X } from 'lucide-react'

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-sm font-bold text-galaxy-purple">{eyebrow}</p>}
        <h1 className="text-balance text-3xl font-extrabold tracking-[-0.02em] text-gray-950 sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function SectionCard({ children, className = '', dark = false }) {
  return (
    <section className={`${dark ? 'bg-galaxy-deep text-white' : 'glass-card'} rounded-3xl p-4 sm:p-6 ${className}`}>
      {children}
    </section>
  )
}

export function DashboardCard({ title, children, action, className = '' }) {
  return (
    <SectionCard className={className}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-950">{title}</h2>
        {action}
      </div>
      {children}
    </SectionCard>
  )
}

export function StatCard({ icon: Icon = Sparkles, label, value, caption, tone = 'purple' }) {
  const tones = {
    purple: 'bg-[linear-gradient(135deg,#7C3AED,#A855F7)]',
    cyan: 'bg-[linear-gradient(135deg,#0EA5E9,#22D3EE)]',
    teal: 'bg-[linear-gradient(135deg,#14B8A6,#22D3EE)]',
    coral: 'bg-[linear-gradient(135deg,#FB7185,#F97316)]',
    amber: 'bg-[linear-gradient(135deg,#F97316,#FACC15)]',
    quiz: 'bg-[linear-gradient(135deg,#7C3AED,#E879F9)]',
    green: 'bg-[linear-gradient(135deg,#14B8A6,#22D3EE)]',
    gold: 'bg-[linear-gradient(135deg,#FACC15,#F97316)]',
  }
  return (
    <div className="flex min-h-[10.5rem] flex-col rounded-3xl bg-white/[0.92] p-4 shadow-[0_18px_45px_rgba(30,27,75,0.08)] ring-1 ring-purple-500/[0.08] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(30,27,75,0.12)] sm:p-5">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_12px_26px_rgba(124,58,237,0.16)] ${tones[tone]}`}>
        <Icon size={20} />
      </div>
      <p className="font-mono text-3xl font-extrabold leading-none tracking-[-0.02em] text-gray-950">{value}</p>
      <p className="mt-2 text-sm font-bold text-gray-800">{label}</p>
      <p className="mt-1 min-h-5 text-xs leading-5 text-slate-500">{caption}</p>
    </div>
  )
}

export function StatusBadge({ children, tone = 'purple' }) {
  const tones = {
    purple: 'bg-purple-50 text-purple-700 ring-purple-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    red: 'bg-rose-50 text-rose-700 ring-rose-100',
    cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
    teal: 'bg-teal-50 text-teal-700 ring-teal-100',
    coral: 'bg-rose-50 text-rose-700 ring-rose-100',
    gold: 'bg-yellow-50 text-yellow-700 ring-yellow-100',
    gray: 'bg-gray-50 text-gray-600 ring-gray-100',
  }
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${tones[tone]}`}>{children}</span>
}

export function ProgressRing({ value = 72, label = 'Progress' }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  return (
    <div className="flex items-center gap-4">
      <svg width="108" height="108" viewBox="0 0 108 108" aria-label={`${label} ${value}%`}>
        <circle cx="54" cy="54" r={radius} stroke="#F3E8FF" strokeWidth="12" fill="none" />
        <circle cx="54" cy="54" r={radius} stroke="url(#ringGradient)" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 54 54)" />
        <defs>
          <linearGradient id="ringGradient" x1="0" x2="1">
            <stop stopColor="#7C3AED" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <text x="54" y="58" textAnchor="middle" className="fill-gray-950 text-xl font-extrabold">{value}%</text>
      </svg>
      <div>
        <p className="text-sm font-bold text-gray-950">{label}</p>
        <p className="text-sm text-gray-500">Teruskan orbit belajarmu.</p>
      </div>
    </div>
  )
}

export function QuickActionButton({ icon: Icon = Sparkles, label, onClick }) {
  return (
    <button onClick={onClick} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#7C3AED,#22D3EE)] px-4 text-sm font-bold text-white shadow-[0_12px_28px_rgba(124,58,237,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(124,58,237,0.22)] active:translate-y-0">
      <Icon size={16} />
      {label}
    </button>
  )
}

export function SearchFilterBar({ search, setSearch, filters = [], activeFilter, setActiveFilter }) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-3xl bg-white p-3 shadow-soft ring-1 ring-purple-100 lg:flex-row lg:items-center">
      <label className="flex min-h-11 flex-1 items-center gap-2 rounded-2xl bg-galaxy-surface px-4 text-sm text-gray-500">
        <Search size={17} />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari materi, kelas, atau topik" className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400" />
      </label>
      {filters.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
          {filters.map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)} className={`flex-shrink-0 rounded-2xl px-4 py-2 text-xs font-bold ring-1 transition ${activeFilter === filter ? 'bg-galaxy-deep text-white ring-galaxy-deep' : 'bg-white text-gray-600 ring-purple-100 hover:bg-galaxy-lavender'}`}>
              {filter}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function DataTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto rounded-3xl bg-white shadow-soft ring-1 ring-purple-100">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-galaxy-surface text-xs uppercase tracking-wide text-gray-500">
          <tr>{columns.map((column) => <th key={column.key} className="px-4 py-3 font-extrabold">{column.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-purple-50">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-galaxy-surface/70">
              {columns.map((column) => <td key={column.key} className="px-4 py-3 text-gray-700">{column.render ? column.render(row) : row[column.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function EmptyState({ title = 'Belum ada materi di pulau ini.', description = 'Guru akan segera menambahkan materi baru. Sambil menunggu, kamu bisa review materi sebelumnya.', action }) {
  return (
    <div className="rounded-3xl border border-dashed border-purple-200 bg-galaxy-surface p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-galaxy-purple shadow-soft">
        <Sparkles size={24} />
      </div>
      <h3 className="text-lg font-extrabold text-gray-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function LoadingState({ label = 'Memuat learning galaxy...' }) {
  return (
    <div className="flex min-h-[16rem] items-center justify-center">
      <div className="rounded-3xl bg-white p-5 text-center shadow-soft ring-1 ring-purple-100">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-galaxy-purple" />
        <p className="mt-3 text-sm font-semibold text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, 2600)
    return () => clearTimeout(timer)
  }, [message, onClose])
  if (!message) return null
  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-3xl bg-galaxy-deep p-4 text-white shadow-glow">
      <CheckCircle2 className="mt-0.5 h-5 w-5 text-galaxy-cyan" />
      <p className="text-sm font-semibold">{message}</p>
      <button aria-label="Tutup toast" onClick={onClose} className="rounded-full p-1 text-white/70 hover:bg-white/10"><X size={14} /></button>
    </div>
  )
}

export function ConfirmDialog({ open, title, description, onCancel, onConfirm }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-galaxy-navy/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-glow">
        <h3 className="text-xl font-extrabold text-gray-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-2xl px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
          <button onClick={onConfirm} className="rounded-2xl bg-galaxy-deep px-4 py-2 text-sm font-bold text-white">Konfirmasi</button>
        </div>
      </div>
    </div>
  )
}
