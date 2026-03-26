import { useState, useRef, useCallback, useEffect } from 'react'
import { getAudioContext, computeRMS } from '../utils/audio'

export function useMicStream() {
  const [isActive, setIsActive] = useState(false)
  const [rmsLevel, setRmsLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number>(0)

  const loop = useCallback(() => {
    if (!analyserRef.current) return
    setRmsLevel(computeRMS(analyserRef.current))
    rafRef.current = requestAnimationFrame(loop)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const ctx = getAudioContext()
      await ctx.resume()

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)

      sourceRef.current = source
      analyserRef.current = analyser

      setIsActive(true)
      rafRef.current = requestAnimationFrame(loop)
    } catch (err) {
      const msg = err instanceof DOMException && err.name === 'NotAllowedError'
        ? 'Microphone access was denied. Allow it in your browser settings and try again.'
        : 'Could not access microphone. Make sure one is connected.'
      setError(msg)
    }
  }, [loop])

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    sourceRef.current?.disconnect()
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    sourceRef.current = null
    analyserRef.current = null
    setIsActive(false)
    setRmsLevel(0)
  }, [])

  useEffect(() => () => stop(), [stop])

  return { isActive, rmsLevel, error, start, stop }
}
