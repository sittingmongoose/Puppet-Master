# Component plan — microphone-only voice memo

Fixture: `ER12-A3-02-FRESH`. Scope: a small capture/playback/local-download component embedded in the existing HTTPS JavaScript workshop page. This is a component plan, not a whole application. It uses no backend, does not upload audio, and requests only microphone audio.

## Research and release record

The investigator read the exact brief before discovery and did not seek or read the concealed plan. `discovery.md` was saved at 10,244 bytes with SHA-256 `510bcbb9f05eb883d1323caa2af5603ac1a6506b73cbd2fa0705e50702944069`. The assigned reveal helper ran exactly once at `2026-10-10T04:49:35.236Z`, returning plan SHA-256 `b977457667677faa27fe5256d090e48ec798eae592ffd7d860e4c3c239167b79` (2,470 bytes). This draft addresses only that released `revealed-plan.md` and the original brief. The exact per-source identities, access times, limitations, and operation records are in `source-map.json` and `sources/index.md`.

Current release anchors for the proposed matrix are Chrome Stable desktop 155.0.8059.39/.40 on Windows/Mac or .39 on Linux, announced 2026-10-06 [S04], and Safari 26.0 build 20622.1.22 [S06]. These are test targets; no installed browser build was observed. The released evidence is deliberately more limited than a full MIME matrix. Safari 18.4 release notes describe WebM/Opus and ALAC/PCM audio tracks, but do not enumerate a complete audio-only MIME set. Safari 26.0 gives the exact example `audio/mp4; codecs=alac`; it still does not name a PCM MIME string [S05, S06]. Chromium commit `19646947…` is a 2025 implementation snapshot, not a Chrome 155 build, and its AAC branch depends on a proprietary-codecs build flag [S08]. Therefore exact current supported combinations remain runtime probes and test outcomes, not static promises.

## R1 — permission, lifecycle, track-ended, cleanup, error state

**Disposition: required correction.** The draft has no permission or track-cleanup path and resets controls on errors, which would lose state and risk leaving the microphone active. Add the following component state model:

| State | Entry and visible behavior |
|---|---|
| `idle` | No stream or recording; show Start. |
| `requesting-permission` | Enter only from the user's Start action. Request `{ audio: true, video: false }`; explain why access is needed. A denied/failed request moves to `error`. |
| `recording` | Show active indicator, elapsed time, Pause and Stop. Own exactly one live audio track. |
| `paused` | Show paused indicator and Resume/Stop; exclude paused time from the active-duration counter. |
| `finalizing` | Disable duplicate actions; collect final data, stop/release owned tracks, assemble and inspect output. |
| `ready` | Offer local playback, local download, and reset/new memo after output checks pass. |
| `error` | Show a specific recoverable reason, whether a partial memo was retained, and a user-controlled retry. Never silently retry or replace the input. |

Start calls `getUserMedia` only after explicit user action. Check for secure context/API availability and map denial (`NotAllowedError`), no matching device, unreadable/busy input, overconstrained choice, and recorder/encoder errors into understandable messages. `getUserMedia` can remain pending if a user ignores the prompt; if the user cancels/leaves while pending and a stream later resolves, stop every returned track immediately and do not start recording. Permission success is not itself a successful recorder/export.

Install recorder and track listeners before `start()`. Pause/Resume call the native methods only in valid states and update the UI on events. On a `mute` event, indicate that the input is temporarily unavailable and pause/finalize according to the selected product policy; do not imply that silence is speech. On `unmute`, require an explicit Resume if paused. On an externally ended track, let the recorder's final data/stop sequence run, release the stream, and report that the microphone ended; keep a partial only if it is nonempty and passes the output checks. Do not silently reacquire or switch devices. An explicit device chooser can be optional; changing input finalizes the current memo and asks for a fresh user Start. A `devicechange` event can supplement, not replace, track-state handling. The spec does not guarantee every reason for a microphone track ending [S02].

For normal Stop, enter `finalizing` once, call `recorder.stop()` if its state is active or paused, and stop the owned microphone track promptly. Continue receiving events until final `dataavailable` and then `stop`; assemble only after `stop`. Explicitly run the same idempotent cleanup on component reset, navigation/disposal, failures, and permission cancellation. Remove listeners/timers, stop all stream tracks, clear chunks after their required lifecycle, disconnect and close a Worklet/AudioContext/Worker if present, and revoke object URLs when the playback view is replaced or disposed. The `ended` event is not a substitute for cleanup after this component calls `track.stop()` [S02].

**Background policy recommendation:** when the document becomes hidden, stop and finalize the memo, release the microphone, and tell the user backgrounding ended that memo. A returned page may play/download the partial or explicitly start a new memo. This avoids continuing microphone capture without visible component controls. Test tab switch/minimize and resume behavior; do not claim capture safely continues in the background. If product wants a pause-and-resume behavior instead, make that a deliberate owner decision and test whether it keeps the microphone active.

## R2 — container/codec negotiation and fallback

**Disposition: required correction.** Remove the hard-coded WebM/Opus constructor argument. Build a candidate list of exact MIME strings, use `MediaRecorder.isTypeSupported(candidate)` to filter, and still catch constructor errors. Once started, record `recorder.mimeType` and compare it to the requested type; do not label from a browser name or file-extension guess. A true probe, successful constructor, successful start/capture, nonempty completed Blob, local playback, and completed download are separate checkpoints [S01]. A positive format probe does not prove current resources can encode it.

| Candidate | What released evidence says | Plan boundary |
|---|---|---|
| `audio/webm;codecs=opus` | Chromium's 2025 source snapshot has WebM/Opus paths; WebKit's Safari 18.4 record describes WebM using Opus [S05, S08]. | Probe and test on the exact Chrome 155 and Safari 26 build; do not treat either historical source as proof of that installed binary. |
| `audio/mp4;codecs=alac` | Safari 26.0 explicitly shows this MediaRecorder MIME [S06]. | Candidate for Safari 26; still run the exact probe, construction, capture, playback, and download steps. Do not promise on Chrome. |
| `audio/mp4;codecs=mp4a.40.2` | The Chromium implementation snapshot maps AAC only when `USE_PROPRIETARY_CODECS` is enabled [S08]. | Exploratory runtime candidate only; no universal Chrome or Safari guarantee from evidence collected here. |
| PCM in WebM/MP4 or standalone WAV | Safari release notes name ALAC/PCM but do not establish a complete audio-only MIME spelling; the W3C spec gives no browser codec list [S01, S05, S06]. | Do not advertise until exact MIME and full export path are verified. A custom WAV path is the Worklet alternative below, not a native MIME assumption. |

The probe order should reflect an owner-selected compatibility/quality preference; a reasonable experiment begins with WebM/Opus, then tested MP4 candidates. If the explicit list finds nothing, a no-options `MediaRecorder(stream)` may be attempted as a browser-default experiment. Accept it only when the browser's actual `mimeType` is known and the resulting Blob has a recognized label/extension. Otherwise show `format unavailable`. Never promise fallback after permission denial or when the fallback encoder itself was not tested.

Before offering a type, verify a real short recording: collect nonempty data, wait for final stop, create a Blob using actual MIME, load it into an `<audio>` element and test playback, then trigger a local anchor download with an honest name. `canPlayType()` or `isTypeSupported()` alone is not a playback/download guarantee. Map only verified actual MIME to a filename extension; keep a generic explicit error for unknown types. A supported and tested type can be offered as a format choice only if each choice has its own complete path. No HTTP upload endpoint or audio network path is part of this component.

## R3 — native recording versus AudioWorklet capture/encode

**Disposition: required correction.** Keep native MediaRecorder as the default because it delegates encoding and container writing to the browser and has smaller implementation scope. The page still owns permission, explicit state, runtime format selection, event handling, bounded collection, final assembly, playback, and local download.

The proposed fallback is a separate Worklet-based pipeline, not an automatic consequence of `MediaRecorder` being absent and not “Web Audio creates a WAV.” It requires `getUserMedia` permission in either case. Route the one microphone track through `MediaStreamAudioSourceNode` → `AudioWorkletNode`; have the processor copy PCM frames into fixed-size transfer blocks; pass those blocks to an encoding worker; write/finish a WAV header or use a separately tested encoder/muxer; return a final typed Blob. Web Audio/AudioWorklet provides PCM frames and real-time processing. It does not select an audio-file encoder/container for the product. A WebCodecs encoder still requires capability checks and container muxing. Use actual track/context sample-rate settings; requesting an AudioContext sample rate or inspecting settings is not proof of the physical microphone's native rate. Any intentional output-rate conversion needs an explicit resampling step and output verification [S03, S09].

**Proposed memory bound for a Worklet prototype:** at most 2 seconds of pending PCM in the producer/worker handoff; if the worker cannot keep up, stop and present `buffer limit reached` rather than drop audio silently or grow the queue. Convert/encode blocks continuously. Set an app-owned completed-output cap (proposed 64 MiB per memo, owner-adjustable); stop and reject over-cap output. At 48 kHz, 16-bit PCM is about 28.8 MB for 5 minutes mono and 57.6 MB stereo; an all-at-once Float32 stereo staging array would be about 115.2 MB. Do not hold all Float32 samples until Stop. The 2-second handoff cap bounds queued raw data, not total encoded output; tests must verify both. Native MediaRecorder also needs an aggregate retained-blob byte cap and a maximum memo duration because the app stores chunks until local export.

An established third-party analog is `extendable-media-recorder` [S09]. Its mutable README describes custom audio encoders with Web Audio PCM paths. Its issue history shows both WAV-header compromises and a library-specific doubled-speed/timeslice report [S10, S11]. It may reduce custom encoder work, but it introduces dependency versioning, worker/encoder packaging, API-conformance and regression responsibilities. This plan does not select it. Use native recording where a verified type works; offer the Worklet/WAV fallback only if the owner accepts implementing, bundling, bounding, and validating it; otherwise explicitly refuse unsupported formats.

## R4 — chunk timing, duration, and assembly

**Disposition: required correction.** Delete the `duration += 1` callback counter and `300 callbacks` stop rule. The spec gives `timeslice` a UA-imposed minimum and queues events; callbacks can be delayed. It does not make a callback a reliable clock. `timeslice` is a payload-rotation hint only [S01]. A 1–2 second requested timeslice is a practical experiment, not a schedule guarantee.

For native recording, append each nonempty `dataavailable` Blob in arrival order, retain its actual MIME, and track aggregate bytes. Stop requests a final data event; the normal flow is final `dataavailable` then `stop`. On `stop`, create one Blob from all captured chunks with the actual recorder MIME, and verify nonzero size and playback before offering download. Do not claim each chunk can play alone; only the complete combination has that requirement [S01]. A deliberately delayed event loop and stop with pending data belong in validation.

**Duration proposal:** define five minutes as 300,000 ms of active recording (paused time excluded). Track with `performance.now()` accumulated over recording segments; the High Resolution Time draft specifies a monotonic clock not affected by system clock adjustments [S12]. Pause freezes the accumulator, Resume starts another segment, and a timer requests Stop at the remaining duration. On hidden-page transition, stop/finalize immediately under R1. Because visibility changes queue tasks and background timers may be throttled/frozen, stop can arrive late [S12, S13]. At finalization, read actual media duration when the Blob can be loaded and verify it is within the allowed cap. Neither a correct monotonic clock, a browser timer, nor native stop guarantees a strict physical ≤300.000 s file while the main thread is suspended; neither `timeslice` nor callback count is a clock. If the product requires a literal hard boundary, the owner must accept additional sample-timeline measurement/trim work or a failure/refusal for output over the limit. Do not claim an exact hard cap until that implementation and test exist.

**Buffer proposal:** cap app-retained native chunk bytes at 64 MiB per memo and reject the completed output if the cap is exceeded; size threshold is a proposed default, adjustable after product review. Do not rely on the native UA delivering a bounded chunk after a delayed event. On a chunk that would exceed the cap, request Stop, avoid retaining further chunks, finalize/release devices, and show a storage-limit error; do not label a partial prefix as playable without verifying it. Apply the separate bounded PCM queue described in R3 for Worklet capture.

## R5 — released implementation/history and version-bound claims

**Disposition: required correction.** Replace “Safari cannot use MediaRecorder” with this narrower record: WebKit announced MediaRecorder in Safari 14.1; Safari 18.4 release notes describe WebM/Opus recording and Ogg conditions; Safari 26.0 explicitly adds ALAC/PCM and shows `audio/mp4; codecs=alac` [S05, S06]. The Safari 18.4 article's wider ALAC/PCM wording does not identify every audio-only type or codec/container pairing; the Safari 26 example supports that specific audio/mp4/ALAC configuration on that release, not every PCM string. Do not claim WebM/Ogg playback support solely from recording release text.

A historical Safari regression pointer is Safari Technology Preview 110: release notes recorded fixes for an empty stop Blob after first use and ignored `timeslice`, with named WebKit revision ranges [S07]. Use these as regression-test ideas only; they do not state a current Safari 26 defect. Chromium commit `19646947…` shows build-conditional AAC and WebM/MP4 recognition in that source snapshot; it does not pin Chrome 155 or a platform codec build [S08]. For every positive or negative capability claim in a shipped support table, include browser and full version/build, OS, API, exact MIME/container+codec, operation tested (probe/constructor/start/capture/playback/download), and conditions. “Unsupported” means only that exact tested operation returned the recorded result under recorded conditions.

## R6 — bounded proposed validation, unsupported cases, and execution record

**Disposition: required correction.** The plan's list is proposal only. No native browser was opened, no microphone was requested, no file was recorded/downloaded, and no test was executed. The only executions were the assigned reveal helper and text/JSON output checks; no browser observations are claimed.

| Lane / group | Proposed bounded cases and observations to record |
|---|---|
| Chrome Stable desktop 155; Safari 26.0 desktop | Record OS, exact full browser build, secure context, and the currently visible permission state. Safari is macOS desktop only. |
| Permission and state | User permits/denies; prompt remains pending then user leaves; permission revocation; no device; busy/unreadable device; Start/Pause/Resume/Stop; repeated commands; Stop from paused; error and second recording after cleanup. Record state/event order and that owned tracks end. |
| Input and visibility | Unplug/revoke active input; temporary mute/unmute; change selected input; hide/background and return. Record ended/mute behavior, final data/stop order, mic-release result, and whether partial playback/download works. |
| MIME, per exact candidate | For every candidate in R2: probe, constructor, start, short real capture, Stop, nonempty final Blob, actual MIME, duration, audio-element playback, downloaded file type/open. Include no-options default path and a known unsupported string. Do not infer other strings or releases from one pass. |
| Timing and assembly | Request 1s timeslice; introduce event-loop delay; pause/resume; stop while data is pending; concatenate all chunks and play the final memo. Confirm UI elapsed time is not callback count and do not require each partial chunk to play. |
| Limits and cleanup | Test a shortened duration limit and 64 MiB cap in a controlled test build; Worklet-only path checks queue backpressure and final header/sample rate/channels; verify over-limit refusal, device release, timer/listener cleanup, object URL cleanup, and a successful second session. Then test the full 300-second boundary if available. |

Unsupported/uncertain at this stage: exact `audio/mp4;codecs=pcm` spelling; Chrome 155's exact MIME set for each OS/proprietary build; Safari 26 PCM audio-only type; whether every selected recording type also plays in both browsers; exact event delay while hidden; and strict five-minute enforcement in frozen runtimes. No explicit MIME should be advertised from the collected release notes alone. If no selected native MIME completes the probe → construct → capture → playback/download sequence, show an explicit unsupported-format state. The optional Worklet/WAV route remains unselected unless its byte, queue, channel/sample-rate, and playback rules are implemented and tested.

## Already covered, rejected assumptions, optional improvements, and owner decisions

**Already covered and retained:** the component has Record, Pause, Stop, Playback, Download; only one memo; microphone-only; five-minute target; local file output; no server or upload. Keep the implementation at component scope.

**Rejected/corrected:** one hard-coded WebM/Opus type; using 300 callbacks as time; assuming `isTypeSupported` proves a successful recording/export; assuming Safari has no MediaRecorder; assuming Web Audio automatically yields WAV; assuming requested sample rate means hardware capture rate; retaining all raw samples without a bound; assuming each `dataavailable` chunk is independently playable; and resetting controls without surfacing errors or releasing the mic.

**Optional improvements:** let users choose an input only after permission and only if a real input chooser is needed; offer a second download only after that full format path passes; preserve a validated partial memo after device/encoder interruption; choose a modest timeslice to reduce typical chunk size; add a simple elapsed-time display driven by a monotonic clock.

**Owner decisions before implementation:** (1) whether backgrounding must stop/finalize as recommended or pause a memo while the mic stays active; (2) whether 5 minutes is a strict encoded-duration ceiling or an active-time target with documented stop latency; (3) whether 64 MiB is an acceptable per-memo output cap; (4) whether a tested Worklet/WAV dependency path is worth its memory and packaging cost, or unsupported native combinations should be refused; (5) whether an interrupted partial is retained; (6) the preferred format/quality order. Until decided and validated, the default plan is stop on hidden, active-time tracking, a 64 MiB app-retained output cap, native verified formats first, and a truthful refusal instead of an untested fallback.

## Negative constraints carried forward

- No recording until the user explicitly starts and microphone permission is granted.
- No audio upload, server persistence, or audio network path.
- No hidden/background-surveillance behavior; hidden page finalizes and releases the microphone by default.
- No system-audio/display capture and no video track.
- No five-minute promise based on callback count or requested timeslice.
- No fabricated browser observations; the matrix above is proposed only.
- No blanket Safari denial from an old compatibility summary; version- and operation-specific probes decide.
- No unbounded raw-audio buffering; Worklet pending queue and output bytes have explicit caps.
- No whole-app build scope.
