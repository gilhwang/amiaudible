import { useState, useCallback } from 'react'

export function useDevices() {
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([])
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([])

  const refresh = useCallback(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    setAudioInputs(devices.filter(d => d.kind === 'audioinput'))
    setVideoInputs(devices.filter(d => d.kind === 'videoinput'))
  }, [])

  return { audioInputs, videoInputs, refresh }
}
