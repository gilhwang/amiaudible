import { MicCheck } from './components/MicCheck'
import { CameraCheck } from './components/CameraCheck'
import { SpeakerCheck } from './components/SpeakerCheck'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">amiaudible</h1>
          <p className="text-sm text-slate-500 mt-0.5">Check your setup before joining an online meeting</p>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <MicCheck />
          <CameraCheck />
          <SpeakerCheck />
        </div>
      </main>

      <footer className="border-t border-slate-200 px-6 py-4 text-center">
        <p className="text-xs text-slate-400">
          No data leaves your browser. All checks run locally using your device's microphone, camera, and speakers.
        </p>
      </footer>
    </div>
  )
}

export default App
