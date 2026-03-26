import { useMicStream } from '../hooks/useMicStream'
import { VolumeMeter } from './VolumeMeter'
import { StatusBadge } from './StatusBadge'

interface Props { step: number }

export function MicCheck({ step }: Props) {
  const { isActive, rmsLevel, error, start, stop } = useMicStream()

  return (
    <section className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
      <div className="px-6 pt-6 pb-5 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 flex items-center justify-center size-11 rounded-xl bg-indigo-50 ring-1 ring-indigo-100">
            {isActive ? (
              <span className="relative flex size-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-3 bg-rose-500" />
              </span>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-5 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">{step}</span>
              <h2 className="text-base font-semibold text-slate-900">Microphone</h2>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">Speak to verify your mic is picking up sound</p>
          </div>
        </div>

        {isActive && <VolumeMeter level={rmsLevel} />}

        <div className="flex items-center justify-between">
          {isActive ? (
            <StatusBadge
              status={rmsLevel > 0.01 ? 'ok' : 'warning'}
              message={rmsLevel > 0.01 ? 'Signal detected' : 'Listening — speak now'}
            />
          ) : error ? (
            <StatusBadge status="error" message="Access denied — check browser settings" />
          ) : (
            <StatusBadge status="idle" message="Not started" />
          )}

          {!isActive ? (
            <button
              onClick={start}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Start Test
            </button>
          ) : (
            <button
              onClick={stop}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
              </svg>
              Stop
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
            To fix: open your browser's site settings and allow microphone access, then refresh.
          </p>
        )}
      </div>
    </section>
  )
}
