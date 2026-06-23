import { useEffect, useState } from 'react'
import { CheckCircle2, Inbox, Loader2, Search, Sparkles, X } from 'lucide-react'

const panelClass = 'glass-panel rounded-2xl'
const insetPanelClass = 'glass-inset rounded-xl'

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-[#D9E6F5] pb-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-black uppercase tracking-[0.14em] text-[#2F80D8]">{eyebrow}</p>}
        <h1 className="text-balance text-2xl font-black leading-tight text-[#132437] sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm font-medium leading-7 text-[#64748B]">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  )
}

export function SectionCard({ children, className = '', dark = false }) {
  return (
    <section className={`${dark ? 'sea-ink-panel text-white' : panelClass} p-4 ${className}`}>
      {children}
    </section>
  )
}

export function DashboardCard({ title, children, action, className = '' }) {
  return (
    <SectionCard className={className}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-black text-[#132437]">{title}</h2>
        {action}
      </div>
      {children}
    </SectionCard>
  )
}

export function StatCard({ icon: Icon = Sparkles, label, value, caption, tone = 'purple' }) {
  const tones = {
    purple: 'bg-[#2F80D8]',
    cyan: 'bg-[#4EA3E8]',
    teal: 'bg-[#2F80D8]',
    coral: 'bg-[#B87554]',
    amber: 'bg-[#D8A642]',
    quiz: 'bg-[#17446E]',
    green: 'bg-emerald-600',
    gold: 'bg-[#D8A642]',
  }
  return (
    <div className="grid min-h-[5.25rem] grid-cols-[auto_1fr] items-center gap-3 rounded-xl bg-[#F8FBFF] p-3 ring-1 ring-[#D9E6F5] transition duration-200 hover:bg-white">
      <div className={`grid h-10 w-10 place-items-center rounded-lg text-white ${tones[tone]}`}>
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="font-mono text-2xl font-black leading-none text-[#132437]">{value}</p>
        <p className="mt-1 truncate text-sm font-black text-[#132437]">{label}</p>
        {caption && <p className="mt-0.5 truncate text-xs font-semibold leading-5 text-[#64748B]">{caption}</p>}
      </div>
    </div>
  )
}

export function StatusBadge({ children, tone = 'purple' }) {
  const tones = {
    purple: 'bg-[#EAF4FF] text-[#2F80D8] ring-[#2F80D8]/10',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    red: 'bg-rose-50 text-rose-700 ring-rose-100',
    cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
    teal: 'bg-sky-50 text-sky-700 ring-sky-100',
    coral: 'bg-rose-50 text-rose-700 ring-rose-100',
    gold: 'bg-yellow-50 text-yellow-700 ring-yellow-100',
    gray: 'bg-gray-50 text-gray-600 ring-gray-100',
  }
  return <span className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-extrabold ring-1 ${tones[tone]}`}>{children}</span>
}

export function ProgressRing({ value = 72, label = 'Progress' }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  return (
    <div className="flex items-center gap-4">
      <svg width="108" height="108" viewBox="0 0 108 108" aria-label={`${label} ${value}%`}>
        <circle cx="54" cy="54" r={radius} stroke="#EAF4FF" strokeWidth="12" fill="none" />
        <circle cx="54" cy="54" r={radius} stroke="url(#ringGradient)" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 54 54)" />
        <defs>
          <linearGradient id="ringGradient" x1="0" x2="1">
            <stop stopColor="#2F80D8" />
            <stop offset="1" stopColor="#17446E" />
          </linearGradient>
        </defs>
        <text x="54" y="58" textAnchor="middle" className="fill-[#132437] text-xl font-extrabold">{value}%</text>
      </svg>
      <div>
        <p className="text-sm font-bold text-[#132437]">{label}</p>
        <p className="text-sm text-[#64748B]">Lanjutkan progres belajar.</p>
      </div>
    </div>
  )
}

export function QuickActionButton({ icon: Icon = Sparkles, label, onClick, disabled = false }) {
  return (
    <button disabled={disabled} onClick={onClick} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#17446E] px-4 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(23,68,110,0.16)] transition hover:-translate-y-0.5 hover:bg-[#2F80D8] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0">
      <Icon size={16} />
      {label}
    </button>
  )
}

export function MetricStrip({ items = [], className = '' }) {
  return (
    <section className={`${panelClass} p-1.5 ${className}`} aria-label="Ringkasan metrik">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-1.5">
        {items.map(({ label, value, caption, icon: Icon = Sparkles }) => (
          <div key={label} className="flex min-h-[4.35rem] items-center gap-2 rounded-xl px-2.5 py-2 transition hover:bg-[#F8FBFF] sm:gap-3 sm:px-3">
            <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-[#EAF4FF] text-[#2F80D8] ring-1 ring-[#D9E6F5] sm:h-10 sm:w-10">
              <Icon size={17} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
                <p className="font-mono text-xl font-black leading-none text-[#132437] sm:text-2xl">{value}</p>
                <p className="truncate text-xs font-black text-[#132437] sm:text-sm">{label}</p>
              </div>
              {caption && <p className="mt-1 truncate text-xs font-semibold text-[#64748B]">{caption}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function ActionList({ items = [], className = '' }) {
  return (
    <section className={`${panelClass} p-2 ${className}`} aria-label="Aksi cepat">
      <div className="grid gap-1 sm:grid-cols-2">
        {items.map(({ label, description, icon: Icon = Sparkles, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="group flex min-h-16 items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-[#F8FBFF] focus-visible:bg-[#F8FBFF]"
          >
            <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-[#EAF4FF] text-[#2F80D8] ring-1 ring-[#D9E6F5] transition group-hover:bg-white">
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black text-[#132437]">{label}</span>
              <span className="block truncate text-xs font-semibold text-[#64748B]">{description}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

export function CompactList({ title, description, items = [], emptyLabel = 'Belum ada data.', className = '' }) {
  return (
    <section className={`${panelClass} p-4 ${className}`}>
      {(title || description) && (
        <header className="mb-3">
          {title && <h2 className="text-lg font-black text-[#132437]">{title}</h2>}
          {description && <p className="mt-1 text-sm leading-6 text-[#64748B]">{description}</p>}
        </header>
      )}

      {items.length ? (
        <div className="divide-y divide-[#D9E6F5]">
          {items.map(({ id, title: itemTitle, eyebrow, meta, status, icon: Icon = Sparkles, actionLabel, onClick }) => (
            <div key={id || itemTitle} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-[#EAF4FF] text-[#2F80D8] ring-1 ring-[#D9E6F5]">
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                {eyebrow && <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#2F80D8]">{eyebrow}</p>}
                <p className="truncate text-sm font-black text-[#132437]">{itemTitle}</p>
                {meta && <p className="mt-0.5 truncate text-xs font-semibold text-[#64748B]">{meta}</p>}
              </div>
              {status && (
                <span className="hidden rounded-lg bg-[#F8FBFF] px-2.5 py-1 text-[11px] font-black text-[#64748B] ring-1 ring-[#D9E6F5] sm:inline-flex">
                  {status}
                </span>
              )}
              {actionLabel && (
                <button onClick={onClick} className="rounded-lg bg-[#17446E] px-3 py-2 text-xs font-black text-white transition hover:bg-[#2F80D8]">
                  {actionLabel}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className={`${insetPanelClass} px-3 py-3 text-sm font-semibold text-[#64748B]`}>{emptyLabel}</p>
      )}
    </section>
  )
}

export function TimelineList({ title, items = [], className = '' }) {
  return (
    <section className={`${panelClass} p-4 ${className}`}>
      {title && <h2 className="mb-3 text-lg font-black text-[#132437]">{title}</h2>}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className="grid grid-cols-[0.75rem_1fr] gap-3">
            <span className="mt-1.5 h-3 w-3 rounded-full bg-[#2F80D8] ring-4 ring-[#EAF4FF]" />
            <p className="text-sm font-semibold leading-6 text-[#64748B]">{item}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function SearchFilterBar({ search, setSearch, filters = [], activeFilter, setActiveFilter }) {
  return (
    <div className={`mb-4 flex flex-col gap-2 p-2.5 lg:flex-row lg:items-center ${panelClass}`}>
      <label className="flex min-h-11 flex-1 items-center gap-2 rounded-xl bg-[#F8FBFF] px-4 text-sm text-[#64748B] ring-1 ring-[#D9E6F5]">
        <Search size={17} />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari materi, kelas, atau topik" className="w-full bg-transparent text-[#132437] outline-none placeholder:text-slate-400" />
      </label>
      {filters.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
          {filters.map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)} className={`flex-shrink-0 rounded-xl px-4 py-2 text-xs font-bold ring-1 transition ${activeFilter === filter ? 'bg-[#17446E] text-white ring-[#17446E]' : 'bg-white text-[#64748B] ring-[#D9E6F5] hover:bg-[#EAF4FF] hover:text-[#2F80D8]'}`}>
              {filter}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function DataTable({ columns, rows }) {
  if (!rows.length) {
    return (
      <EmptyState
        title="Belum ada data"
        description="Data akan tampil setelah tersimpan di sistem atau berhasil dimuat dari server."
      />
    )
  }

  return (
    <div className={`${panelClass} overflow-x-auto`}>
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[#F8FBFF] text-xs uppercase tracking-wide text-[#64748B]">
          <tr>{columns.map((column) => <th key={column.key} className="px-4 py-3 font-extrabold">{column.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-[#D9E6F5]">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-[#F8FBFF]">
              {columns.map((column) => <td key={column.key} className="px-4 py-3 text-slate-700">{column.render ? column.render(row) : row[column.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function EmptyState({ title = 'Belum ada data yang perlu ditampilkan.', description = 'Mulai dari aksi utama di halaman ini atau cek kembali setelah guru/admin menyiapkan data.', action }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#B9D4F0] bg-[linear-gradient(135deg,#F8FBFF,#FFFFFF)] p-5 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#2F80D8] shadow-[0_12px_24px_rgba(15,36,55,0.06)] ring-1 ring-[#D9E6F5]">
        <Inbox size={20} />
      </div>
      <h3 className="text-base font-black text-[#132437]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function LoadingState({ label = 'Memuat data...' }) {
  return (
    <div className="flex min-h-[10rem] items-center justify-center">
      <div className={`${panelClass} p-4 text-center`}>
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#2F80D8]" />
        <p className="mt-3 text-sm font-semibold text-[#64748B]">{label}</p>
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
    <div className="fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-white/12 bg-[#17446E] p-4 text-white shadow-[0_18px_44px_rgba(15,36,55,0.20)]">
      <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#8BD4FF]" />
      <p className="text-sm font-semibold">{message}</p>
      <button aria-label="Tutup toast" onClick={onClose} className="rounded-full p-1 text-white/70 hover:bg-white/10"><X size={14} /></button>
    </div>
  )
}

export function ConfirmDialog({ open, title, description, onCancel, onConfirm }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#102A43]/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#D9E6F5] bg-white p-5 shadow-[0_24px_68px_rgba(15,36,55,0.16)]">
        <h3 className="text-xl font-extrabold text-gray-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#64748B]">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-[#F8FBFF]">Batal</button>
          <button onClick={onConfirm} className="rounded-xl bg-[#17446E] px-4 py-2 text-sm font-bold text-white">Konfirmasi</button>
        </div>
      </div>
    </div>
  )
}
