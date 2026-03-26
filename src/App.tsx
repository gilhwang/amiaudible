import { MicCheck } from './components/MicCheck'
import { CameraCheck } from './components/CameraCheck'
import { SpeakerCheck } from './components/SpeakerCheck'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-50 flex flex-col">
      <header className="bg-gradient-to-r from-indigo-700 to-violet-700 px-6 py-5 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="size-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">amiaudible</h1>
            <p className="text-indigo-200 text-xs mt-0.5">Pre-meeting device check</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/80 font-medium">All local</span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-5">
          <p className="text-sm text-slate-500 text-center">
            Complete each check below before joining your call.
          </p>
          <MicCheck step={1} />
          <CameraCheck step={2} />
          <SpeakerCheck step={3} />
        </div>
      </main>

      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-slate-400">
          No data leaves your browser — everything runs locally on your device.
        </p>
      </footer>
    </div>
  )
}

export default App
