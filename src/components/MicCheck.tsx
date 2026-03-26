import { useMicStream } from '../hooks/useMicStream'
import { VolumeMeter } from './VolumeMeter'
import { StatusBadge } from './StatusBadge'

export function MicCheck() {
  const { isActive, rmsLevel, error, start, stop } = useMicStream()

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎤</span>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Microphone</h2>
          <p className="text-sm text-slate-500">Speak to verify your mic is working</p>
        </div>
      </div>

      {isActive && <VolumeMeter level={rmsLevel} />}

      {isActive ? (
        <StatusBadge
          status={rmsLevel > 0.01 ? 'ok' : 'warning'}
          message={rmsLevel > 0.01 ? 'Mic detected — speak to test' : 'Listening... make some noise'}
        />
      ) : error ? (
        <StatusBadge status="error" message={error} />
      ) : (
        <StatusBadge status="idle" message="Not started" />
      )}

      <div className="flex gap-2">
        {!isActive ? (
          <button
            onClick={start}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Start Mic Test
          </button>
        ) : (
          <button
            onClick={stop}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition-colors"
          >
            Stop
          </button>
        )}
      </div>
    </section>
  )
}
