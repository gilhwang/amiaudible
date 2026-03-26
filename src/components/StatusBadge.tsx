type Status = 'ok' | 'error' | 'idle' | 'warning'

interface Props {
  status: Status
  message: string
}

const styles: Record<Status, string> = {
  ok: 'bg-green-100 text-green-800 border-green-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  idle: 'bg-slate-100 text-slate-600 border-slate-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

const icons: Record<Status, string> = {
  ok: '✓',
  error: '✕',
  idle: '○',
  warning: '!',
}

export function StatusBadge({ status, message }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${styles[status]}`}>
      <span className="font-bold">{icons[status]}</span>
      {message}
    </span>
  )
}
