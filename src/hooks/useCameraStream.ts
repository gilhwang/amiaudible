import { useState, useRef, useCallback, useEffect } from 'react'

export function useCameraStream() {
  const [isActive, setIsActive] = useState(false)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const isStartingRef = useRef(false)
  const startAbortRef = useRef<AbortController | null>(null)

  const applyStream = useCallback((stream: MediaStream) => {
    streamRef.current = stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
    setIsActive(true)
  }, [])

  const start = useCallback(async (deviceId?: string) => {
    if (isStartingRef.current) return
    isStartingRef.current = true

    // Cancel any previously in-flight start so stop() can invalidate a pending getUserMedia
    startAbortRef.current?.abort()
    const controller = new AbortController()
    startAbortRef.current = controller

    setError(null)
    streamRef.current?.getTracks().forEach(t => t.stop())

    const constraints: MediaStreamConstraints = {
      video: deviceId ? { deviceId: { exact: deviceId } } : true,
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      // If stop() was called while getUserMedia was pending, discard the stream
      if (controller.signal.aborted) {
        stream.getTracks().forEach(t => t.stop())
        return
      }

      applyStream(stream)

      // Enumerate after permission granted so labels are populated
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videos = devices.filter(d => d.kind === 'videoinput')
      setVideoDevices(videos)

      const activeTrack = stream.getVideoTracks()[0]
      const settings = activeTrack.getSettings()
      setSelectedDeviceId(settings.deviceId ?? (videos[0]?.deviceId ?? ''))
    } catch (err) {
      let msg: string
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            msg = 'Camera access was denied. Allow it in your browser settings and try again.'
            break
          case 'NotFoundError':
            msg = 'No camera found. Make sure one is connected and try again.'
            break
          case 'NotReadableError':
            msg = 'Camera is in use by another application. Close it and try again.'
            break
          case 'OverconstrainedError':
            msg = 'Selected camera could not be opened. Try a different device.'
            break
          default:
            msg = 'Could not access camera. Make sure one is connected.'
        }
      } else {
        msg = 'Could not access camera. Make sure one is connected.'
      }
      setError(msg)
    } finally {
      isStartingRef.current = false
    }
  }, [applyStream])

  const selectDevice = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId)
    start(deviceId)
  }, [start])

  const stop = useCallback(() => {
    startAbortRef.current?.abort()  // discard any getUserMedia response that hasn't arrived yet
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setIsActive(false)
    setVideoDevices([])
    // selectedDeviceId is intentionally preserved so re-starting restores the user's last choice
  }, [])

  useEffect(() => () => stop(), [stop])

  return { videoRef, isActive, videoDevices, selectedDeviceId, selectDevice, error, start, stop }
}
