import { useState, useRef, useCallback, useEffect } from 'react'

export function useCameraStream() {
  const [isActive, setIsActive] = useState(false)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const applyStream = useCallback((stream: MediaStream) => {
    streamRef.current = stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
    setIsActive(true)
  }, [])

  const start = useCallback(async (deviceId?: string) => {
    setError(null)
    streamRef.current?.getTracks().forEach(t => t.stop())

    const constraints: MediaStreamConstraints = {
      video: deviceId ? { deviceId: { exact: deviceId } } : true,
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      applyStream(stream)

      // Enumerate after permission granted so labels are populated
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videos = devices.filter(d => d.kind === 'videoinput')
      setVideoDevices(videos)

      const activeTrack = stream.getVideoTracks()[0]
      const settings = activeTrack.getSettings()
      setSelectedDeviceId(settings.deviceId ?? (videos[0]?.deviceId ?? ''))
    } catch (err) {
      const msg = err instanceof DOMException && err.name === 'NotAllowedError'
        ? 'Camera access was denied. Allow it in your browser settings and try again.'
        : 'Could not access camera. Make sure one is connected.'
      setError(msg)
    }
  }, [applyStream])

  const selectDevice = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId)
    start(deviceId)
  }, [start])

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setIsActive(false)
    setVideoDevices([])
    setSelectedDeviceId('')
  }, [])

  useEffect(() => () => stop(), [stop])

  return { videoRef, isActive, videoDevices, selectedDeviceId, selectDevice, error, start, stop }
}
