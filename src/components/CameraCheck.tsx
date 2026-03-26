import { useCameraStream } from '../hooks/useCameraStream'
import { DeviceSelect } from './DeviceSelect'
import { StatusBadge } from './StatusBadge'

export function CameraCheck() {
  const { videoRef, isActive, videoDevices, selectedDeviceId, selectDevice, error, start, stop } = useCameraStream()

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📷</span>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Camera</h2>
          <p className="text-sm text-slate-500">Preview your video feed before the call</p>
        </div>
      </div>

      {isActive && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full rounded-xl bg-slate-900 aspect-video object-cover"
        />
      )}

      {isActive && (
        <DeviceSelect
          devices={videoDevices}
          value={selectedDeviceId}
          onChange={selectDevice}
          label="Select camera"
        />
      )}

      {isActive ? (
        <StatusBadge status="ok" message="Camera is working" />
      ) : error ? (
        <StatusBadge status="error" message={error} />
      ) : (
        <StatusBadge status="idle" message="Not started" />
      )}

      <div className="flex gap-2">
        {!isActive ? (
          <button
            onClick={() => start()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Start Camera
          </button>
        ) : (
          <button
            onClick={stop}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition-colors"
          >
            Stop
          </button>
        )}
      </div>
    </section>
  )
}
