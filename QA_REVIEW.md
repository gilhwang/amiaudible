# QA/Testing Review: amiaudible

**Reviewer:** QA Tester
**Date:** 2026-03-28
**Scope:** Full client-side React app (mic, camera, speaker pre-meeting checks)

---

## 1. Edge Cases & Error Handling Gaps

### 1.1 Microphone Issues

**Gap: No microphone device found**
- `useMicStream.ts:40-42`: Error handling bundles "NotAllowedError" (permission denied) with generic "Could not access microphone" message
- No distinction between: device not connected, device is busy (already in use), permissions denied, or browser doesn't support getUserMedia
- User can't diagnose the root cause

**Gap: AudioContext fails to resume**
- `useMicStream.ts:27`: `ctx.resume()` is awaited but has no explicit error handling
- If resume() fails (rare but possible on some browsers), error silently propagates up
- Could leave the app in a hung state waiting for the promise

**Gap: Stream stops unexpectedly**
- No listener for the 'inactive' event on MediaStream
- If browser or OS suspends the mic, there's no way to detect and notify the user
- User continues testing unaware that audio isn't actually being captured

**Gap: Silent (zero RMS) detection threshold**
- `MicCheck.tsx:40`: Threshold is hard-coded at `rmsLevel > 0.01` for "Signal detected"
- No timeout—if user stays silent, component shows "Listening — speak now" indefinitely
- No feedback if RMS values are technically calculated but all zeros

---

### 1.2 Camera Issues

**Gap: Camera device enumeration race condition**
- `useCameraStream.ts:33-34`: `enumerateDevices()` is called *after* `getUserMedia()` resolves
- If user disconnects camera between getUserMedia() and enumerateDevices(), devices list becomes stale
- **Regression risk:** If a user quickly switches devices between steps, selected device ID might become invalid

**Gap: Camera in use by another app**
- `useCameraStream.ts:40-44`: NotAllowedError catch-all doesn't distinguish between permission denial and "device already in use"
- On some OS/browser combinations (Windows + Chrome), camera locked by another app returns NotAllowedError
- User sees "Access denied" but problem isn't permissions—it's a system conflict

**Gap: Invalid device selection**
- `useCameraStream.ts:48-51`: `selectDevice()` calls `start(deviceId)` without validating the deviceId still exists
- If device was unplugged after enumeration, `getUserMedia()` fails silently in the error handler
- UI stays in "active" state with stale device list

**Gap: No video track validation**
- `useCameraStream.ts:37-39`: Gets device ID from `activeTrack.getSettings()` but doesn't validate the track is actually active
- If track stops unexpectedly (user unplugged camera), component doesn't update UI
- User continues seeing "Camera is working" when it isn't

---

### 1.3 Speaker/Audio Output Issues

**Gap: AudioContext suspended (user interaction required)**
- `SpeakerCheck.tsx:16`: `getAudioContext().resume()` is called but assumes it succeeds
- Some browsers require user gesture to resume AudioContext; if it fails, `playChime()` may not produce sound
- No error handling if resume() fails

**Gap: No audio output device**
- `playChime()` in `audio.ts:21-66`: Synthesizes oscillators but has no fallback or error detection
- If user has 0 audio output devices (rare but possible), audio silently produces no sound
- Promise still resolves after the timeout, leaving user thinking speakers work when they don't

**Gap: System volume muted**
- No way to check if system volume is 0 or if audio is muted
- Web Audio API has no standard way to detect mute state
- User could have perfectly working speakers but hear nothing if system is muted

**Gap: Playback timing is dependent on setTimeout**
- `audio.ts:64`: Uses `setTimeout(resolve, (endTime - actx.currentTime) * 1000)`
- If the browser tab loses focus, setTimeout can be throttled (4x slower in some browsers)
- Promise resolves but chime is still playing, leading to desynced state

**Gap: User feedback is manual**
- `SpeakerCheck.tsx:68-84`: Requires user to click "Yes" or "No" to confirm audio was heard
- No automatic loudness detection fallback
- User might click "No" even though speakers work, creating false negatives

---

## 2. Browser Compatibility Concerns

### 2.1 Safari-Specific Issues

**Issue: AudioContext initialization in Safari**
- Safari requires explicit user gesture before creating or resuming AudioContext
- Current code creates AudioContext in `getAudioContext()` lazily but doesn't require a user gesture at creation time
- **Risk:** On first speaker check, `playChime()` may fail silently if AudioContext wasn't created via a click handler

**Issue: getUserMedia permissions in Safari**
- Safari's permission prompt is different (appears as "Allow" vs. "Allow Once" with 15-minute expiry)
- If user selects "Allow Once," after 15 minutes permissions are revoked mid-session
- No handling for this time-window-based permission expiry

**Issue: video.srcObject assignment**
- `CameraCheck.tsx:15`: Relies on modern `srcObject` API
- Safari < 11 requires `createObjectURL()` fallback (unlikely in 2026, but not explicitly tested)

**Issue: OscillatorNode frequency in Safari**
- `audio.ts:40,53`: Uses `setValueAtTime()` and frequency ramping
- Some older Safari versions have bugs with exponential ramping (now fixed, but compatibility unclear)

---

### 2.2 Firefox-Specific Issues

**Issue: getUserMedia constraints**
- `useCameraStream.ts:25`: Uses `{ deviceId: { exact: deviceId } }` constraint
- Firefox handles invalid `exact` constraints differently than Chrome (throws instead of gracefully failing)
- Could result in different error messages across browsers

**Issue: AnalyserNode.getByteTimeDomainData() timing**
- `computeRMS()` in `audio.ts:10`: Reads FFT data synchronously
- Firefox's implementation may have slight timing differences from Chrome; RMS readings could vary per browser

---

### 2.3 Mobile Browser Issues

**Issue: mobile Safari camera autoplay**
- `CameraCheck.tsx:16`: `<video autoPlay playsInline />`
- iOS requires `muted` attribute (present ✓) but may still prompt before first play
- Some iOS versions block autoPlay entirely without user gesture

**Issue: getUserMedia on iOS/mobile**
- iOS doesn't allow camera/microphone enumeration except after first `getUserMedia()` call
- Current code's sequential flow (get stream → enumerate) is correct, but some edge devices may hang

**Issue: Audio context state on mobile**
- Mobile browsers (especially iOS) are aggressive about suspending audio when app is backgrounded
- No handling for `audiocontext.onstatechange` to detect suspension/resumption

**Issue: Mobile device vibration / notification sounds**
- Chime audio may be overridden by incoming calls or notifications
- No way to route through speaker vs. earpiece on mobile

---

## 3. Silent Failures & Error Handling Gaps

| Component | Issue | Severity |
|-----------|-------|----------|
| `useMicStream` | `ctx.resume()` fails → silent hang | High |
| `useMicStream` | MediaStream becomes inactive (device unplugged) → no notification | High |
| `useCameraStream` | Device enumeration stale after disconnect | High |
| `useCameraStream` | Invalid deviceId after plug/unplug → silent error in catch block | High |
| `SpeakerCheck` | `ctx.resume()` fails → no sound but UI shows "Playing..." | High |
| `playChime()` | setTimeout throttling if tab backgrounded → desynced state | Medium |
| `SpeakerCheck` | User manually confirms sound (no automated fallback) | Medium |
| `MicCheck` | No timeout for "Listening — speak now" state | Medium |
| Browser compat | No feature detection; assumes all APIs available | Medium |

---

## 4. Performance on Slow Connections & Low-End Devices

**Low-end CPU impact:**
- `useMicStream.ts:14-18`: RAF loop calls `computeRMS()` on every frame (~60 FPS)
- `computeRMS()` allocates a new Uint8Array and iterates 2048 times every frame
- On low-end Android phones, this could cause jank; no debouncing or throttling

**Low-end audio processing:**
- `audio.ts`: Creates 6 oscillators (3 notes × 2 harmonics each) simultaneously
- On low-end devices, this may cause audio glitching or CPU spike

**Low-end network:**
- App is fully client-side, so network speed is only relevant during initial load
- No service worker → cold load requires full bundle fetch
- No lazy loading → all code bundled together

**Memory leaks on repeated test cycles:**
- If user starts/stops mic multiple times, RAF refs should be cleaned up (✓ via cleanup in useEffect)
- But if user rapidly switches camera devices, previous stream's tracks may linger if cleanup isn't synchronous enough

---

## 5. Regression Risks & Fragile Code

### 5.1 Tight coupling to browser APIs

**Risk:** getUserMedia API shape changes
- `useMicStream.ts:23`, `useCameraStream.ts:29`: Direct `navigator.mediaDevices.getUserMedia()` calls
- No wrapper or abstraction; breaking changes in API would require code changes

**Risk:** AnalyserNode API changes
- `computeRMS()` uses `getByteTimeDomainData()` which is part of older Web Audio spec
- If browsers deprecate in favor of new API, this silently breaks

**Risk:** AudioContext destination changing**
- `audio.ts:45`: Hard-codes `gain.connect(actx.destination)`
- If browsers change how destination works or require different connection logic, breaks

---

### 5.2 State management coupling

**Risk:** Ref/useState synchronization in camera
- `useCameraStream.ts`: `streamRef`, `videoRef`, `isActive` state must stay in sync
- If `applyStream()` is called but `setIsActive()` is missed, UI and internals diverge

**Risk:** RAF loop lifecycle in mic
- `useMicStream.ts:38`: RAF is started on `setIsActive(true)` but cleaned up in useEffect return
- If render cycles cause re-invocations, RAF might be double-started (though deps should prevent this)

---

### 5.3 Device enumeration fragility

**Risk:** deviceId format changes across browsers
- `DeviceSelect.tsx:22`: Falls back to `d.deviceId.slice(0, 8)` for unnamed devices
- If deviceId format changes or becomes non-deterministic, fallback breaks

**Risk:** Device list order is unstable**
- Unplugging/replugging changes device order
- If user's previously selected device is re-enumerated at a different index, it still works (matched by ID ✓) but order confusion is possible

---

## 6. Proposed Test Plan

### 6.1 Manual Testing (Critical Path)

#### Mic Check
- [ ] Speak normally; verify bars fill green
- [ ] Whisper; verify bars still show activity but lower level
- [ ] Stay silent; verify UI shows "Listening" but no bars light up
- [ ] Deny permission; verify error message appears and recovers after refresh
- [ ] Unplug mic mid-test; observe whether test continues (should show stale data)
- [ ] Plug in different mic; restart test; verify new device works
- [ ] Use Firefox, Safari, Chrome, Edge on Windows/Mac
- [ ] Test on iPhone Safari and Android Chrome
- [ ] Keep mic check running for 5+ minutes; verify no memory leaks

#### Camera Check
- [ ] Start camera; verify video feed displays
- [ ] Switch device (if multiple cameras); verify feed switches smoothly
- [ ] Unplug camera; observe whether UI updates (should ideally show "Camera disconnected")
- [ ] Deny permission; verify error message
- [ ] Open camera in another app; try to start in amiaudible (should show "device in use")
- [ ] Test on iPhone (front + back camera switching if applicable)
- [ ] Keep camera running for 5+ minutes; verify no memory leaks
- [ ] Rapidly switch cameras; verify no crashed state

#### Speaker Check
- [ ] Click "Play Chime"; verify 3-note chime is heard
- [ ] Mute system volume; click "Play Chime"; verify no sound and UI doesn't reflect this
- [ ] Mute browser tab in OS; click "Play Chime"; verify chime still plays (if browser allows)
- [ ] On mobile, test with speaker, earpiece, and Bluetooth headphones
- [ ] Click "Play Chime" repeatedly; verify no audio overlapping or distortion
- [ ] Select "No" for chime; verify error tips appear

#### Cross-Device
- [ ] Test with no devices connected (all getUserMedia calls fail)
- [ ] Test with degraded audio (high background noise); verify RMS bars still work
- [ ] Test with external USB mic/camera; verify detection and selection
- [ ] Test on 4G network (slow initial load)

---

### 6.2 Automated Testing (Suggested)

If tests were to be added (currently none exist):

#### Unit Tests
```javascript
// Test: computeRMS with known input
- Verify RMS calculation is mathematically correct
- Edge case: silence (all 128 values) → RMS = 0
- Edge case: max amplitude → RMS approaches ~0.707

// Test: playChime timing
- Mock AudioContext.createOscillator
- Verify all 6 oscillators are created
- Verify start() and stop() called with correct times
- Verify Promise resolves after expected duration
```

#### Integration Tests (manual through Playwright/Cypress)
```javascript
// Test: Mic workflow
- Start test
- Wait for error or active state
- Verify RAF loop running
- Stop test
- Verify RAF loop cleaned up and DOM updated

// Test: Camera workflow
- Start camera
- Wait for video feed to display
- Enumerate devices
- Switch device
- Verify stream switches (srcObject updates)
- Verify enumerateDevices called after getUserMedia

// Test: Speaker workflow
- Click Play
- Verify isPlaying = true
- Wait for playChime() promise
- Verify isPlaying = false and prompt appears

// Test: Error recovery
- Deny permission
- Verify error shown
- Refresh page
- Try again (should work if permissions re-granted)
```

#### E2E Tests (real browser automation)
```javascript
// Test: Full flow on multiple browsers
- Run through mic → camera → speaker on Chrome, Firefox, Safari, Edge
- Verify each step completes or shows appropriate error

// Test: Mobile flow
- Run on iOS Safari and Android Chrome emulators
- Verify touch interactions work (no hover states breaking on mobile)

// Test: Stress test
- Keep all three checks running for 10+ minutes
- Monitor memory usage
- Verify no leaks or degradation
```

---

### 6.3 Browser Compatibility Matrix

| Browser | Version | Mic | Camera | Speaker | Notes |
|---------|---------|-----|--------|---------|-------|
| Chrome | Latest | ✓ | ✓ | ✓ | Baseline |
| Firefox | Latest | ✓ | ✓ | ✓ | Test `exact` constraint |
| Safari | Latest | ⚠️ | ⚠️ | ⚠️ | Test AudioContext resume |
| Edge | Latest | ✓ | ✓ | ✓ | Chromium-based |
| iOS Safari | Latest | ⚠️ | ⚠️ | ⚠️ | Limited API support |
| Android Chrome | Latest | ✓ | ✓ | ✓ | Test low-end devices |

**Legend:**
- ✓ = Expected to work fully
- ⚠️ = Potential issues (outlined above)
- ✗ = Known to fail

---

## 7. Summary of Critical Issues

1. **No error handling for `AudioContext.resume()` failures** → Speaker test silently fails
2. **Camera enumeration race condition** → Device list becomes stale after disconnect
3. **No detection of stream becoming inactive** → User doesn't know if device was unplugged
4. **No AudioContext creation in user gesture handler** → Safari may fail first speaker test
5. **No timeout or feedback** → Mic test can hang on "Listening" forever if user stays silent
6. **Manual speaker confirmation** → No automatic fallback if audio plays but user doesn't hear it
7. **Tap throttling after focus loss** → setTimeout for playChime may be delayed, causing desynced state
8. **No feature detection** → App assumes all APIs available; no graceful degradation

---

## 8. Recommendations

### High Priority (Fix before production)
1. Add try-catch around `AudioContext.resume()` in mic and speaker checks
2. Add 'inactive' event listener to MediaStream to detect device unplugging
3. Add timeout to mic "Listening" state (e.g., 30 seconds before auto-timeout)
4. Create AudioContext in a user gesture handler (first button click) rather than on-demand
5. Validate device still exists before calling getUserMedia after enumeration

### Medium Priority (Improve robustness)
1. Use `setInterval` with frame-rate cap instead of RAF in mic loop to avoid jank on low-end devices
2. Cache device list with invalidation on device change
3. Add 'devicechange' event listener to navigator.mediaDevices for real-time updates
4. Implement automatic audio output loudness detection as speaker test fallback
5. Add feature detection for AudioContext and getUserMedia APIs

### Low Priority (Nice to have)
1. Add service worker for offline first load
2. Add telemetry to track which checks fail most often
3. Add config UI to adjust mic threshold or timeout durations
4. Add accessibility improvements (ARIA labels, keyboard navigation)
5. Test and document Safari/iOS-specific workarounds

