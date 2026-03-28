let ctx: AudioContext | null = null

export function getAudioContext(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

// Reused across frames to avoid per-frame allocation
let rmsBuffer: Uint8Array<ArrayBuffer> | null = null

export function computeRMS(analyser: AnalyserNode): number {
  if (!rmsBuffer || rmsBuffer.length !== analyser.fftSize) {
    rmsBuffer = new Uint8Array(analyser.fftSize)
  }
  analyser.getByteTimeDomainData(rmsBuffer)
  let sum = 0
  for (let i = 0; i < rmsBuffer.length; i++) {
    const normalized = (rmsBuffer[i] - 128) / 128
    sum += normalized * normalized
  }
  return Math.sqrt(sum / rmsBuffer.length)
}

// Plays a gentle C-major arpeggio chime (C5 → E5 → G5) with bell-like decay.
// Returns a promise that resolves when the last note has fully faded.
export function playChime(): Promise<void> {
  const actx = getAudioContext()

  // C5, E5, G5
  const notes = [523.25, 659.25, 783.99]
  const noteDuration = 1.4
  const noteSpacing = 0.14

  return new Promise(resolve => {
    notes.forEach((freq, i) => {
      const isLast = i === notes.length - 1
      const t = actx.currentTime + i * noteSpacing

      // Fundamental
      const osc = actx.createOscillator()
      const gain = actx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.28, t + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDuration)
      osc.connect(gain)
      gain.connect(actx.destination)
      osc.start(t)
      osc.stop(t + noteDuration)
      // Disconnect gain on end; resolve promise on the last note (audio-clock accurate,
      // immune to background-tab setTimeout throttling)
      osc.onended = () => {
        gain.disconnect()
        if (isLast) resolve()
      }

      // Soft harmonic for bell-like richness
      const osc2 = actx.createOscillator()
      const gain2 = actx.createGain()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(freq * 2, t)
      gain2.gain.setValueAtTime(0, t)
      gain2.gain.linearRampToValueAtTime(0.06, t + 0.008)
      gain2.gain.exponentialRampToValueAtTime(0.001, t + noteDuration * 0.6)
      osc2.connect(gain2)
      gain2.connect(actx.destination)
      osc2.start(t)
      osc2.stop(t + noteDuration * 0.6)
      osc2.onended = () => gain2.disconnect()
    })
  })
}
