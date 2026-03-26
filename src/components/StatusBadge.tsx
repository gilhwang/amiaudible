type Status = 'ok' | 'error' | 'idle' | 'warning'

interface Props {
  status: Status
  message: string
}

const config: Record<Status, { dot: string; text: string; bg: string; pulse: boolean }> = {
  ok:      { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200',  pulse: false },
  error:   { dot: 'bg-rose-500',    text: 'text-rose-700',    bg: 'bg-rose-50 border-rose-200',        pulse: false },
  idle:    { dot: 'bg-slate-400',   text: 'text-slate-600',   bg: 'bg-slate-50 border-slate-200',      pulse: false },
  warning: { dot: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',      pulse: true  },
}

export function StatusBadge({ status, message }: Props) {
  const c = config[status]
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${c.bg} ${c.text}`}>
      <span className={`size-2 rounded-full flex-shrink-0 ${c.dot} ${c.pulse ? 'animate-pulse' : ''}`} />
      {message}
    </span>
  )
}
