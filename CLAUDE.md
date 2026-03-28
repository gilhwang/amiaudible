# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at localhost:5173 (Vite + HMR)
npm run build     # Type-check (tsc -b) then bundle for production
npm run preview   # Serve the built dist/ locally
npm run lint      # Run ESLint (flat config)
```

There are no tests. CI runs `npm run build` on push to `main` and deploys to GitHub Pages.

## Architecture

**amiaudible** is a fully client-side React app — no backend, no network calls. Users verify their mic, camera, and speakers before an online meeting. Deployed at `https://giyuhwang.github.io/amiaudible/` (base URL configured in `vite.config.ts`).

### Component tree

```
App.tsx
├── MicCheck     — getUserMedia(audio) → AnalyserNode → RMS loop → VolumeMeter (24 bars)
├── CameraCheck  — getUserMedia(video) → <video>.srcObject; enumerateDevices → DeviceSelect
└── SpeakerCheck — playChime() synthesizes C5/E5/G5 arpeggio; user confirms Yes/No
```

Each check step is self-contained: its logic lives in a custom hook (`useMicStream`, `useCameraStream`) and its UI in a single component file.

### Key utilities (`src/utils/audio.ts`)

- `getAudioContext()` — lazy singleton AudioContext
- `computeRMS(analyser)` — normalizes FFT time-domain data to 0–1
- `playChime()` — synthesizes a 3-note bell arpeggio using OscillatorNode + GainNode; returns a Promise that resolves when done

### State management

Pure React hooks only (`useState`, `useRef`, `useCallback`, `useEffect`). No external state library.

### Styling

Tailwind CSS 4 via the `@tailwindcss/vite` plugin. Only `src/index.css` imports Tailwind.

### Notes

- Camera device enumeration runs *after* `getUserMedia()` resolves so that device labels are populated.
- The `vite.config.ts` base path `/amiaudible/` is required for GitHub Pages; changing it breaks the deployed site.
