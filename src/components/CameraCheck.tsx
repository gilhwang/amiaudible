import { useCameraStream } from '../hooks/useCameraStream'
import { DeviceSelect } from './DeviceSelect'
import { StatusBadge } from './StatusBadge'

interface Props { step: number }

export function CameraCheck({ step }: Props) {
  const { videoRef, isActive, videoDevices, selectedDeviceId, selectDevice, error, start, stop } = useCameraStream()

  return (
    <section className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
      {isActive && (
        <div className="relative bg-slate-900 aspect-video">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
            <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs text-white font-medium">LIVE</span>
          </div>
        </div>
      )}

      <div className="px-6 pt-5 pb-5 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 flex items-center justify-center size-11 rounded-xl bg-indigo-50 ring-1 ring-indigo-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-5 text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">{step}</span>
              <h2 className="text-base font-semibold text-slate-900">Camera</h2>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">Preview your video before the call</p>
          </div>
        </div>

        {isActive && (
          <DeviceSelect
            devices={videoDevices}
            value={selectedDeviceId}
            onChange={selectDevice}
            label="Select camera"
          />
        )}

        <div className="flex items-center justify-between">
          {isActive ? (
            <StatusBadge status="ok" message="Camera is working" />
          ) : error ? (
            <StatusBadge status="error" message="Camera unavailable" />
          ) : (
            <StatusBadge status="idle" message="Not started" />
          )}

          {!isActive ? (
            <button
              onClick={() => start()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Start Camera
            </button>
          ) : (
            <button
              onClick={stop}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
              </svg>
              Stop
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
            To fix: open your browser's site settings and allow camera access, then refresh.
          </p>
        )}
      </div>
    </section>
  )
}
