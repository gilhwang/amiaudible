interface Props {
  level: number // 0–1
}

const TOTAL = 24

export function VolumeMeter({ level }: Props) {
  const lit = Math.min(TOTAL, Math.round(level * TOTAL * 5)) // amplify for visual feedback

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Input Level</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-400">Live</span>
        </span>
      </div>
      <div className="flex gap-[3px] items-end h-6">
        {Array.from({ length: TOTAL }, (_, i) => {
          const isLit = i < lit
          const isGreen = i < 16
          const isYellow = i >= 16 && i < 21

          const litColor = isGreen ? 'bg-emerald-500' : isYellow ? 'bg-amber-400' : 'bg-rose-500'
          const dimColor = isGreen ? 'bg-emerald-100' : isYellow ? 'bg-amber-100' : 'bg-rose-100'

          const height = i < 8 ? 'h-2' : i < 16 ? 'h-3.5' : i < 21 ? 'h-5' : 'h-6'

          return (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-colors duration-75 ${height} ${isLit ? litColor : dimColor}`}
            />
          )
        })}
      </div>
    </div>
  )
}
