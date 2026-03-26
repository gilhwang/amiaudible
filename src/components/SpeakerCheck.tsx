import { useState, useCallback } from 'react'
import { getAudioContext } from '../utils/audio'
import { StatusBadge } from './StatusBadge'

type Result = 'ok' | 'no' | null

export function SpeakerCheck() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [result, setResult] = useState<Result>(null)

  const playTone = useCallback(async () => {
    setIsPlaying(true)
    setResult(null)

    const ctx = getAudioContext()
    await ctx.resume()

    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(440, ctx.currentTime)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)

    oscillator.connect(gain)
    gain.connect(ctx.destination)

    oscillator.start()
    oscillator.stop(ctx.currentTime + 2)

    oscillator.onended = () => setIsPlaying(false)
  }, [])

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔊</span>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Speakers / Headphones</h2>
          <p className="text-sm text-slate-500">Play a test tone to verify your audio output</p>
        </div>
      </div>

      <p className="text-sm text-slate-600">
        Click the button below to play a 440 Hz tone for 2 seconds. Make sure your volume is turned up.
      </p>

      {result === 'ok' && <StatusBadge status="ok" message="Speakers are working" />}
      {result === 'no' && (
        <StatusBadge status="error" message="Check your volume and output device settings" />
      )}
      {result === null && !isPlaying && <StatusBadge status="idle" message="Not tested" />}
      {isPlaying && <StatusBadge status="warning" message="Playing tone..." />}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={playTone}
          disabled={isPlaying}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {isPlaying ? 'Playing...' : 'Play Test Tone'}
        </button>

        {!isPlaying && result === null ? null : !isPlaying && (
          <>
            <button
              onClick={() => setResult('ok')}
              className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 text-sm font-medium rounded-lg transition-colors"
            >
              Yes, I heard it
            </button>
            <button
              onClick={() => setResult('no')}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-sm font-medium rounded-lg transition-colors"
            >
              No sound
            </button>
          </>
        )}
      </div>
    </section>
  )
}
