interface Props {
  level: number // 0–1
}

export function VolumeMeter({ level }: Props) {
  const pct = Math.min(100, Math.round(level * 400)) // amplify for visual feedback

  const color =
    pct < 20 ? 'bg-slate-300' :
    pct < 60 ? 'bg-green-500' :
    pct < 85 ? 'bg-yellow-400' :
               'bg-red-500'

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-slate-500">Input level</span>
        <span className="text-xs text-slate-400 ml-auto">{pct}%</span>
      </div>
      <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-75 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
