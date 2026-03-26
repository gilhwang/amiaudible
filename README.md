# amiaudible

A browser-based pre-meeting device check tool. Verify your microphone, camera, and speakers before joining an online call — entirely client-side, with no data leaving your browser.

**[Live demo](https://giyuhwang.github.io/amiaudible/)**

---

## Features

- **Microphone check** — real-time volume meter with RMS level visualization
- **Camera check** — live video preview with multi-device selection
- **Speaker check** — synthesized C-major arpeggio chime with user confirmation
- **Privacy-first** — all processing happens locally; no network calls, no backend

---

## System Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client Only)                     │
│                    No backend · No network calls                 │
│                                                                  │
│  index.html → main.tsx → App.tsx                                 │
│                              │                                   │
│              ┌───────────────┼───────────────┐                   │
│              ▼               ▼               ▼                   │
│        MicCheck.tsx    CameraCheck.tsx   SpeakerCheck.tsx        │
│              │               │               │                   │
│    ┌─────────┘    ┌──────────┘       ┌───────┘                   │
│    │  Hook        │   Hook           │  Util                     │
│    │ useMicStream │ useCameraStream  │ playChime()               │
│    └────┬─────────┘ ────┬────────── └────────┬──────────         │
│         │               │                    │                   │
│    getUserMedia     getUserMedia        AudioContext             │
│      (audio)          (video)         + OscillatorNode          │
│         │               │              (C5 / E5 / G5)           │
│    AnalyserNode    <video srcObject>   + GainNode (decay)        │
│    (FFT 2048)      + enumerateDevs                               │
│         │               │                                        │
│    computeRMS()    DeviceSelect.tsx                              │
│    rAF loop        (camera picker)                               │
│         │                                                        │
│    VolumeMeter.tsx                                               │
│    (24 animated bars)                                            │
│                                                                  │
│  Shared UI: StatusBadge.tsx (ok / error / idle / warning)        │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

**Microphone:**
```
getUserMedia(audio) → MediaStream → AnalyserNode → computeRMS() → rAF loop → rmsLevel → VolumeMeter
```

**Camera:**
```
getUserMedia(video) → MediaStream → <video>.srcObject → live preview
                   → enumerateDevices() → DeviceSelect dropdown
```

**Speaker:**
```
AudioContext → OscillatorNode (C5/E5/G5) → GainNode (bell decay) → destination → user hears chime
                                                                               → Yes/No confirmation
```

### Component Tree

```
App
├── MicCheck
│   ├── StatusBadge
│   ├── VolumeMeter
│   └── [useMicStream hook]
├── CameraCheck
│   ├── DeviceSelect
│   ├── StatusBadge
│   └── [useCameraStream hook]
└── SpeakerCheck
    ├── StatusBadge
    └── [playChime utility]
```

### Browser APIs Used

| API | Purpose |
|---|---|
| `navigator.mediaDevices.getUserMedia()` | Request mic and camera access |
| `navigator.mediaDevices.enumerateDevices()` | List available input devices |
| `AudioContext` | Audio processing graph |
| `AnalyserNode` (FFT 2048) | Real-time microphone level analysis |
| `OscillatorNode` + `GainNode` | Synthesize chime tones with bell decay |
| `<video>.srcObject` | Display live camera preview |
| `requestAnimationFrame` | Smooth volume level updates |

### Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS 4 |
| Build | Vite 8 |
| State | React Hooks only (`useState`, `useRef`, `useCallback`, `useEffect`) |
| Linting | ESLint 9 (flat config) |
| Deployment | GitHub Pages via GitHub Actions |

### File Structure

```
src/
├── main.tsx                    # React entry point
├── App.tsx                     # Root layout (header, 3 steps, footer)
├── index.css                   # Tailwind import
├── components/
│   ├── MicCheck.tsx            # Microphone test UI
│   ├── CameraCheck.tsx         # Camera test UI
│   ├── SpeakerCheck.tsx        # Speaker test UI
│   ├── VolumeMeter.tsx         # Animated audio level bars
│   ├── StatusBadge.tsx         # ok/error/idle/warning indicator
│   └── DeviceSelect.tsx        # Camera device picker dropdown
├── hooks/
│   ├── useMicStream.ts         # Microphone stream + RMS logic
│   ├── useCameraStream.ts      # Camera stream + device enumeration
│   └── useDevices.ts           # Generic device enumeration (unused)
└── utils/
    └── audio.ts                # AudioContext singleton, computeRMS(), playChime()
```

### CI/CD

Push to `main` → GitHub Actions → `tsc -b && vite build` → deploy `dist/` to GitHub Pages at `/amiaudible/`

---

## Local Development

```bash
npm install
npm run dev       # dev server with HMR at localhost:5173
npm run build     # type-check + production bundle
npm run preview   # preview built dist locally
npm run lint      # ESLint
```
