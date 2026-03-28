# amiaudible

A browser-based pre-meeting device check tool. Verify your microphone, camera, speakers, and network connection before joining an online call — entirely client-side, with no audio or video data leaving your browser.

**[Live demo](https://giyuhwang.github.io/amiaudible/)**

---

## Features

- **Microphone check** — real-time volume meter with RMS level visualization
- **Camera check** — live video preview with multi-device selection
- **Speaker check** — synthesized C-major arpeggio chime with user confirmation
- **Network check** — measures download speed and classifies connection quality (Excellent / Good / Medium / Poor)
- **Privacy-first** — audio and video never leave the browser; the network check only downloads a test file to measure speed

---

## System Architecture

### Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                         Browser (Client Only)                       │
│              Audio & video stay local · No backend                  │
│                                                                     │
│  index.html → main.tsx → App.tsx                                    │
│                              │                                      │
│         ┌────────────────────┼────────────────────┐                 │
│         ▼          ▼         ▼         ▼           ▼                │
│    MicCheck  CameraCheck  SpeakerCheck  NetworkCheck                │
│         │          │         │               │                      │
│  useMicStream  useCameraStream  playChime()  useNetworkCheck        │
│         │          │         │               │                      │
│  getUserMedia  getUserMedia  AudioContext   fetch (Cloudflare)      │
│    (audio)      (video)    OscillatorNode  speed.cloudflare.com     │
│         │          │         │                                      │
│  AnalyserNode  <video>    GainNode (decay)                          │
│  (FFT 2048)  srcObject                                              │
│         │          │                                                │
│  computeRMS()  DeviceSelect                                         │
│  rAF loop     (camera picker)                                       │
│         │                                                           │
│  VolumeMeter                                                        │
│  (24 animated bars)                                                 │
│                                                                     │
│  Shared UI: StatusBadge (ok / error / idle / warning)               │
└────────────────────────────────────────────────────────────────────┘
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

**Network:**
```
fetch(speed.cloudflare.com, 5 MB) → measure body transfer time → Mbps → quality classification
navigator.connection.type → Wi-Fi / Ethernet / Cellular (where supported)
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
├── SpeakerCheck
│   ├── StatusBadge
│   └── [playChime utility]
└── NetworkCheck
    ├── StatusBadge
    └── [useNetworkCheck hook]
```

### Network Quality Thresholds

Thresholds are calibrated to video-conferencing requirements (Zoom/Teams/Meet HD ~4 Mbps; FCC broadband 25 Mbps):

| Quality | Speed | Typical capability |
|---|---|---|
| Excellent | ≥ 50 Mbps | 4K streaming, multiple simultaneous HD calls |
| Good | 10–50 Mbps | HD video calls, standard streaming |
| Medium | 5–10 Mbps | Standard video calls, may struggle with HD |
| Poor | < 5 Mbps | May have difficulty with video calls |

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
| `fetch` | Download speed test file from Cloudflare |
| `navigator.connection` | Connection type detection (Chrome/Android) |
| `performance.now()` | High-resolution transfer timing |

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
├── App.tsx                     # Root layout (header, 4 steps, footer)
├── index.css                   # Tailwind import
├── components/
│   ├── MicCheck.tsx            # Microphone test UI
│   ├── CameraCheck.tsx         # Camera test UI
│   ├── SpeakerCheck.tsx        # Speaker test UI
│   ├── NetworkCheck.tsx        # Network speed test UI
│   ├── VolumeMeter.tsx         # Animated audio level bars
│   ├── StatusBadge.tsx         # ok/error/idle/warning indicator
│   └── DeviceSelect.tsx        # Camera device picker dropdown
├── hooks/
│   ├── useMicStream.ts         # Microphone stream + RMS loop
│   ├── useCameraStream.ts      # Camera stream + device enumeration
│   └── useNetworkCheck.ts      # Download speed measurement + quality classification
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
