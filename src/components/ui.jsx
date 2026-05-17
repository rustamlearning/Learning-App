import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, Search, Sparkles, X } from 'lucide-react'

const panelClass = 'rounded-[1.15rem] border border-[#123c3b]/10 bg-white/88 shadow-[0_14px_44px_rgba(15,31,42,0.065)] backdrop-blur-xl'
const insetPanelClass = 'rounded-[0.9rem] bg-[#f7f4ee]/80 ring-1 ring-[#123c3b]/8'

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-[#123c3b]/10 pb-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-black uppercase tracking-[0.16em] text-[#0f766e]">{eyebrow}</p>}
        <h1 className="text-balance text-3xl font-black leading-none text-[#13232d] sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm font-medium leading-7 text-slate-600">{description}</p>}
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
        <h2 className="text-base font-black text-[#13232d]">{title}</h2>
        {action}
      </div>
      {children}
    </SectionCard>
  )
}

export function StatCard({ icon: Icon = Sparkles, label, value, caption, tone = 'purple' }) {
  const tones = {
    purple: 'bg-[linear-gradient(135deg,#123C3B,#0F766E)]',
    cyan: 'bg-[linear-gradient(135deg,#0F766E,#5DB8B0)]',
    teal: 'bg-[linear-gradient(135deg,#138177,#5DB8B0)]',
    coral: 'bg-[linear-gradient(135deg,#C86F4A,#D8A642)]',
    amber: 'bg-[linear-gradient(135deg,#B8643B,#D8A642)]',
    quiz: 'bg-[linear-gradient(135deg,#123C3B,#5DB8B0)]',
    green: 'bg-[linear-gradient(135deg,#138177,#5DB8B0)]',
    gold: 'bg-[linear-gradient(135deg,#D8A642,#C86F4A)]',
  }
  return (
    <div className="grid min-h-[5.25rem] grid-cols-[auto_1fr] items-center gap-3 rounded-[1.05rem] bg-white/82 p-3 ring-1 ring-[#123c3b]/10 transition duration-200 hover:bg-white">
      <div className={`grid h-10 w-10 place-items-center rounded-[0.85rem] text-white shadow-[0_10px_22px_rgba(19,129,119,0.14)] ${tones[tone]}`}>
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="font-mono text-2xl font-black leading-none text-[#13232d]">{value}</p>
        <p className="mt-1 truncate text-sm font-black text-[#13232d]">{label}</p>
        {caption && <p className="mt-0.5 truncate text-xs font-semibold leading-5 text-slate-500">{caption}</p>}
      </div>
    </div>
  )
}

export function StatusBadge({ children, tone = 'purple' }) {
  const tones = {
    purple: 'bg-[#e8f4ef] text-[#0f766e] ring-[#0f766e]/10',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    red: 'bg-rose-50 text-rose-700 ring-rose-100',
    cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
    teal: 'bg-teal-50 text-teal-700 ring-teal-100',
    coral: 'bg-rose-50 text-rose-700 ring-rose-100',
    gold: 'bg-yellow-50 text-yellow-700 ring-yellow-100',
    gray: 'bg-gray-50 text-gray-600 ring-gray-100',
  }
  return <span className={`inline-flex rounded-[0.65rem] px-2.5 py-1 text-[11px] font-extrabold ring-1 ${tones[tone]}`}>{children}</span>
}

export function ProgressRing({ value = 72, label = 'Progress' }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  return (
    <div className="flex items-center gap-4">
      <svg width="108" height="108" viewBox="0 0 108 108" aria-label={`${label} ${value}%`}>
        <circle cx="54" cy="54" r={radius} stroke="#E8F4EF" strokeWidth="12" fill="none" />
        <circle cx="54" cy="54" r={radius} stroke="url(#ringGradient)" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 54 54)" />
        <defs>
          <linearGradient id="ringGradient" x1="0" x2="1">
            <stop stopColor="#0F766E" />
            <stop offset="1" stopColor="#D8A642" />
          </linearGradient>
        </defs>
        <text x="54" y="58" textAnchor="middle" className="fill-[#13232d] text-xl font-extrabold">{value}%</text>
      </svg>
      <div>
        <p className="text-sm font-bold text-[#13232d]">{label}</p>
        <p className="text-sm text-gray-500">Teruskan orbit belajarmu.</p>
      </div>
    </div>
  )
}

export function QuickActionButton({ icon: Icon = Sparkles, label, onClick, disabled = false }) {
  return (
    <button disabled={disabled} onClick={onClick} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#123c3b] px-4 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(15,31,42,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0f766e] hover:shadow-[0_14px_30px_rgba(19,129,119,0.18)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0">
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
          <div key={label} className="flex min-h-[4.35rem] items-center gap-2 rounded-[0.85rem] px-2.5 py-2 transition hover:bg-[#f7f4ee] sm:gap-3 sm:px-3">
            <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-[0.8rem] bg-[#e8f4ef] text-[#0f766e] ring-1 ring-[#0f766e]/10 sm:h-10 sm:w-10">
              <Icon size={17} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
                <p className="font-mono text-xl font-black leading-none text-[#13232d] sm:text-2xl">{value}</p>
                <p className="truncate text-xs font-black text-[#13232d] sm:text-sm">{label}</p>
              </div>
              {caption && <p className="mt-1 truncate text-xs font-semibold text-slate-500">{caption}</p>}
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
            className="group flex min-h-16 items-center gap-3 rounded-[0.9rem] px-3 py-2 text-left transition hover:bg-[#e8f4ef] focus-visible:bg-[#e8f4ef]"
          >
            <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-[0.85rem] bg-[#f7f4ee] text-[#0f766e] ring-1 ring-[#123c3b]/8 transition group-hover:bg-white">
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black text-[#13232d]">{label}</span>
              <span className="block truncate text-xs font-semibold text-slate-500">{description}</span>
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
          {title && <h2 className="text-lg font-black tracking-[-0.01em] text-[#13232d]">{title}</h2>}
          {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
        </header>
      )}

      {items.length ? (
        <div className="divide-y divide-[#123c3b]/8">
          {items.map(({ id, title: itemTitle, eyebrow, meta, status, icon: Icon = Sparkles, actionLabel, onClick }) => (
            <div key={id || itemTitle} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[#e8f4ef] text-[#0f766e] ring-1 ring-[#0f766e]/10">
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                {eyebrow && <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#0f766e]">{eyebrow}</p>}
                <p className="truncate text-sm font-black text-[#13232d]">{itemTitle}</p>
                {meta && <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{meta}</p>}
              </div>
              {status && (
                <span className="hidden rounded-[0.65rem] bg-[#f7f4ee] px-2.5 py-1 text-[11px] font-black text-slate-600 ring-1 ring-[#123c3b]/8 sm:inline-flex">
                  {status}
                </span>
              )}
              {actionLabel && (
                <button onClick={onClick} className="rounded-[0.8rem] bg-[#123c3b] px-3 py-2 text-xs font-black text-white transition hover:bg-[#0f766e]">
                  {actionLabel}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className={`${insetPanelClass} px-3 py-3 text-sm font-semibold text-slate-500`}>{emptyLabel}</p>
      )}
    </section>
  )
}

export function TimelineList({ title, items = [], className = '' }) {
  return (
    <section className={`${panelClass} p-4 ${className}`}>
      {title && <h2 className="mb-3 text-lg font-black tracking-[-0.01em] text-[#13232d]">{title}</h2>}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className="grid grid-cols-[0.75rem_1fr] gap-3">
            <span className="mt-1.5 h-3 w-3 rounded-full bg-[#0f766e] ring-4 ring-[#e8f4ef]" />
            <p className="text-sm font-semibold leading-6 text-slate-600">{item}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function SearchFilterBar({ search, setSearch, filters = [], activeFilter, setActiveFilter }) {
  return (
    <div className={`mb-4 flex flex-col gap-2 p-2.5 lg:flex-row lg:items-center ${panelClass}`}>
      <label className="flex min-h-11 flex-1 items-center gap-2 rounded-[0.9rem] bg-[#f7f4ee] px-4 text-sm text-gray-500">
        <Search size={17} />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari materi, kelas, atau topik" className="w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400" />
      </label>
      {filters.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
          {filters.map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)} className={`flex-shrink-0 rounded-[0.9rem] px-4 py-2 text-xs font-bold ring-1 transition ${activeFilter === filter ? 'bg-[#123c3b] text-white ring-[#123c3b]' : 'bg-white text-gray-600 ring-[#123c3b]/10 hover:bg-[#e8f4ef]'}`}>
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
        <thead className="bg-[#f7f4ee] text-xs uppercase tracking-wide text-gray-500">
          <tr>{columns.map((column) => <th key={column.key} className="px-4 py-3 font-extrabold">{column.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-[#123c3b]/5">
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
    <div className="rounded-[1.15rem] border border-dashed border-[#0f766e]/25 bg-[#f7f4ee] p-5 text-center">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-[0.9rem] bg-white text-[#0f766e] shadow-soft">
        <Sparkles size={20} />
      </div>
      <h3 className="text-base font-black text-[#13232d]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function LoadingState({ label = 'Memuat learning galaxy...' }) {
  return (
    <div className="flex min-h-[10rem] items-center justify-center">
      <div className={`${panelClass} p-4 text-center`}>
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#0f766e]" />
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
    <div className="fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-[1rem] bg-[#123c3b] p-4 text-white shadow-[0_18px_50px_rgba(15,31,42,0.22)]">
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
      <div className="w-full max-w-md rounded-[1.15rem] bg-white p-5 shadow-[0_18px_50px_rgba(15,31,42,0.18)]">
        <h3 className="text-xl font-extrabold text-gray-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-[0.85rem] px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
          <button onClick={onConfirm} className="rounded-[0.85rem] bg-[#123c3b] px-4 py-2 text-sm font-bold text-white">Konfirmasi</button>
        </div>
      </div>
    </div>
  )
}
