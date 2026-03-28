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
  const isStartingRef = useRef(false)

  const start = useCallback(async () => {
    if (isStartingRef.current) return
    isStartingRef.current = true
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const ctx = getAudioContext()
      await ctx.resume()

      if (ctx.state !== 'running') {
        stream.getTracks().forEach(t => t.stop())
        streamRef.current = null
        setError('Audio system could not start. Try clicking again.')
        return
      }

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      source.connect(analyser)

      sourceRef.current = source
      analyserRef.current = analyser

      setIsActive(true)

      const tick = () => {
        if (!analyserRef.current) return
        setRmsLevel(computeRMS(analyserRef.current))
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } catch (err) {
      let msg: string
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            msg = 'Microphone access was denied. Allow it in your browser settings and try again.'
            break
          case 'NotFoundError':
            msg = 'No microphone found. Make sure one is connected and try again.'
            break
          case 'NotReadableError':
            msg = 'Microphone is in use by another application. Close it and try again.'
            break
          default:
            msg = 'Could not access microphone. Make sure one is connected.'
        }
      } else {
        msg = 'Could not access microphone. Make sure one is connected.'
      }
      setError(msg)
    } finally {
      isStartingRef.current = false
    }
  }, [])

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
