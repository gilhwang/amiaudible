import { useState, useRef, useCallback, useEffect } from 'react'

export type NetworkQuality = 'excellent' | 'good' | 'medium' | 'poor'

export interface NetworkResult {
  speedMbps: number
  quality: NetworkQuality
  connectionType: string
}

// Thresholds based on video-conferencing best practices:
// Zoom/Teams/Meet HD requires ~4 Mbps; FCC broadband = 25 Mbps; 4K streaming = 25+ Mbps
function classifySpeed(mbps: number): NetworkQuality {
  if (mbps >= 50) return 'excellent'
  if (mbps >= 10) return 'good'
  if (mbps >= 5)  return 'medium'
  return 'poor'
}

function getConnectionType(): string {
  // Network Information API — well-supported on Chrome/Android; returns 'unknown' on most desktops
  const conn = (navigator as unknown as { connection?: { type?: string } }).connection
  if (!conn?.type || conn.type === 'unknown') return 'Unknown'
  const labels: Record<string, string> = {
    wifi:     'Wi-Fi',
    ethernet: 'Ethernet',
    cellular: 'Cellular',
    bluetooth: 'Bluetooth',
    wimax:    'WiMAX',
    other:    'Other',
    none:     'Offline',
  }
  return labels[conn.type] ?? 'Unknown'
}

export function useNetworkCheck() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<NetworkResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const run = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('testing')
    setError(null)
    setResult(null)

    try {
      // 5 MB test file from Cloudflare's speed test infrastructure (CORS-enabled)
      const TEST_BYTES = 5 * 1024 * 1024
      const url = `https://speed.cloudflare.com/__down?bytes=${TEST_BYTES}`

      // Start timing AFTER headers arrive (response object is available) so TTFB
      // (DNS + TCP + TLS handshake + server processing) is excluded from the measurement.
      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const t0 = performance.now()
      await response.arrayBuffer()
      const elapsed = (performance.now() - t0) / 1000 // seconds

      const speedMbps = (TEST_BYTES * 8) / elapsed / 1_000_000

      setResult({
        speedMbps,
        quality: classifySpeed(speedMbps),
        connectionType: getConnectionType(),
      })
      setStatus('done')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError('Speed test failed. Check your internet connection and try again.')
      setStatus('error')
    }
  }, [])

  useEffect(() => () => { abortRef.current?.abort() }, [])

  return { status, result, error, run }
}
