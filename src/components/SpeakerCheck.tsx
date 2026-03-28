import { useState, useCallback } from 'react'
import { getAudioContext, playChime } from '../utils/audio'
import { StatusBadge } from './StatusBadge'

interface Props { step: number }

type Result = 'ok' | 'no' | null

export function SpeakerCheck({ step }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [result, setResult] = useState<Result>(null)

  const handlePlay = useCallback(async () => {
    setIsPlaying(true)
    setResult(null)
    try {
      const ctx = getAudioContext()
      await ctx.resume()
      // Guard: if the context is still not running (e.g. browser policy blocked it),
      // bail out — otherwise playChime()'s oscillators are scheduled on a frozen clock
      // and onended never fires, leaving isPlaying stuck true forever.
      if (ctx.state !== 'running') return
      await playChime()
    } finally {
      setIsPlaying(false)
    }
  }, [])

  return (
    <section className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
      <div className="px-6 pt-5 pb-5 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 flex items-center justify-center size-11 rounded-xl bg-indigo-50 ring-1 ring-indigo-100">
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-5 text-indigo-600 animate-pulse">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-5 text-indigo-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">{step}</span>
              <h2 className="text-base font-semibold text-slate-900">Speakers / Headphones</h2>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">Play a chime to verify your audio output</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {result === 'ok' ? (
            <StatusBadge status="ok" message="Speakers are working" />
          ) : result === 'no' ? (
            <StatusBadge status="error" message="Check volume and output device" />
          ) : isPlaying ? (
            <StatusBadge status="warning" message="Playing chime..." />
          ) : (
            <StatusBadge status="idle" message="Not tested" />
          )}

          <button
            onClick={handlePlay}
            disabled={isPlaying}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
              <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            {isPlaying ? 'Playing...' : 'Play Chime'}
          </button>
        </div>

        {result !== null && !isPlaying && (
          <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
            <p className="text-sm text-slate-500 flex-1">Did you hear the chime?</p>
            <button
              onClick={() => setResult('ok')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${result === 'ok' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'}`}
            >
              Yes
            </button>
            <button
              onClick={() => setResult('no')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${result === 'no' ? 'bg-rose-600 text-white' : 'bg-rose-50 hover:bg-rose-100 text-rose-700'}`}
            >
              No
            </button>
          </div>
        )}

        {result === 'no' && (
          <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
            Try: check your system volume, switch the output device in sound settings, or try a different browser.
          </p>
        )}
      </div>
    </section>
  )
}
