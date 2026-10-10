# Final component plan — microphone-only voice memo

Run: A3-02-treatment. Fixture: ER12-A3-02-FRESH. Stage: reviser.

## Scope and evidence status

This plan covers a small voice-memo component in the existing HTTPS JavaScript workshop page. It keeps the requested Record, Pause, Resume, Stop, Playback, and Download controls; one memo per session; a five-minute limit; microphone input only; and local export. It does not build the rest of the application, add a backend, upload or persist audio on a server, capture system audio, or claim equal quality or universal playback across browsers. The starting environment selects no recorder/encoder library and pins no browser version; version strings below are research and test targets only.

The released plan is the finalized user draft in the investigator handoff. The complete brief, that exact plan, the investigator discovery, and the independent critique were reviewed. The source records and critique dispositions are included below and in source-map.json. The source index at sources/index.md is a navigable map of the bounded evidence.

**No browser or microphone test was run.** No permission prompt was opened, no audio was recorded or downloaded, and no executable witness was run. All browser rows and validation steps below are proposed. Do not treat source review or MIME probing guidance as a runtime result.

## Recommended component behavior

### Permission, controls, and state

Only a user-initiated Start action may request microphone access. In the secure HTTPS page, request one audio track with video disabled. Do not request display or system audio. Before showing active recording, confirm that a live audio track and a usable recording path exist. Permission granted is not proof that a recorder can start or that an export will work.

| State | Behavior |
|---|---|
| idle | No stream or memo is active. Offer Start. |
| requesting-permission | Enter only after Start. Explain why microphone access is needed. Denial or failure moves to error. If the user cancels or leaves while the prompt is pending and a stream later arrives, immediately stop its tracks and do not start recording. |
| recording | Show a visible microphone-active indicator and elapsed active time. Offer Pause and Stop. |
| paused | Show that capture is paused and offer Resume or Stop. Paused time does not count toward the five-minute active-time request. |
| finalizing | Enter once; prevent duplicate controls; wait for recorder final data and stop events; assemble and inspect the completed output; release resources. |
| ready | Offer local playback and a locally initiated download only for a nonempty, verified file. |
| error | Name the failed operation in user-facing language, say whether a valid partial was retained, and offer a user-controlled retry or discard. Never silently reset the UI, retry permission, or switch inputs. |

Guard every command by state. Catch permission, constructor, start, pause, resume, stop, encoding, and export failures. Map common errors such as NotAllowedError, NotFoundError, NotReadableError, and OverconstrainedError to actionable messages without claiming more about the device than the error establishes. Install MediaRecorder and track listeners before starting. On mute, show an input-interrupted state; do not imply that silence is speech. Do not automatically resume when unmuted. The owner must choose whether a temporary mute pauses capture, finalizes it, or leaves it recording with a clear interruption warning; the initial recommendation is pause when possible and finalize if it cannot pause safely. For an externally ended track, let final data/stop events complete, release the stream, and retain a partial only if it passes the same nonempty, format, duration, and playback checks as a normal recording. Do not silently reacquire a track. An input chooser is optional; changing input must finalize the current memo and require a new explicit Start.

A devicechange event may inform the UI but can be coalesced and does not replace track-ended handling. The browser does not promise that every microphone-ended cause will be distinguishable. Do not infer a specific cause when the platform reports only that the track ended [S02](sources/index.md#s02).

### Cleanup and visibility

Make cleanup idempotent and run it on normal stop, external track end, error, cancel, reset, and component disposal. Request recorder stop when its state permits; stop all component-owned microphone tracks promptly; keep the final data listener active until dataavailable and then stop have been handled; assemble only after stop. Explicit track.stop() does not itself provide the external ended event, so owned cleanup cannot depend on that event [S02](sources/index.md#s02). Clear timers and listeners, clear chunk references when no longer needed, close/disconnect any AudioContext, Worklet, or worker used by the optional path, and revoke playback object URLs when the view is replaced or disposed.

**Default background policy:** when the page becomes hidden, request stop/finalization and release the microphone; tell the user that backgrounding ended the memo. On return, allow playback/download of a valid result or require a fresh Start. The visibility event is queued and JavaScript may be throttled or frozen, so this policy is not an instantaneous stop guarantee. Do not leave capture running as a background-surveillance feature. If the owner wants pause-on-hidden instead, that is a separate decision with explicit notice that the microphone may stay active and requires dedicated tests.

## R2 — recording format selection and export boundary

Remove the single hard-coded WebM/Opus argument. Maintain an explicit candidate list and evaluate each exact string independently. For each candidate, distinguish these gates:

1. The exact MIME probe result.
2. Successful MediaRecorder construction.
3. Successful start and real capture.
4. Actual recorder MIME and a nonempty completed output after final stop.
5. Playback in the target browser.
6. Downloaded file type, honest filename/extension, and successful local open.

A positive isTypeSupported result indicates format capability, not guaranteed encoder resources or successful capture. Constructor/start/capture/export failures remain possible [S01](sources/index.md#s01). A negative result describes only that exact queried type in that tested browser/build/condition. Record actual MIME and bytes; do not infer them from browser brand. A playback probe is not a recording probe, and the reverse is also true.

| Candidate to probe | Released evidence and limit |
|---|---|
| audio/webm;codecs=opus | Safari 18.4 announced WebM recording with Opus [S05](sources/index.md#s05); the pinned Chromium source snapshot also has WebM/Opus paths [S08](sources/index.md#s08). Neither establishes support in a particular current binary or exact audio-only behavior. Probe in every selected lane. |
| audio/mp4; codecs=alac | Safari 26.0 explicitly showed this MIME example [S06](sources/index.md#s06). This is a useful Safari probe candidate, not a promise for Safari 27 or Chrome. |
| audio/mp4;codecs=mp4a.40.2 | The cited Chromium source maps AAC under a proprietary-codecs build condition [S08](sources/index.md#s08). Treat as exploratory; do not promise a Chrome build or Safari result. |
| audio/ogg;codecs=opus and audio/ogg;codecs=vorbis | Safari 18.4 announced Ogg Opus/Vorbis support for macOS Sequoia 15.4 and named mobile/visionOS releases [S05](sources/index.md#s05). The announcement supplies no exact audio-only MediaRecorder MIME strings. These two strings are proposed probes, not quoted or confirmed strings from WebKit. Check them on current Safari 27/macOS 15 and macOS 26 separately; the historical announcement does not guarantee continued support. |
| PCM in a native container or standalone WAV | The release notes mention PCM audio but do not establish a complete audio-only MIME spelling. Do not advertise a guessed PCM string or native WAV path. A custom WAV writer belongs to the separate Worklet proposal below. |

The owner should select a preferred format/quality order before implementation. A reasonable experiment is to probe WebM/Opus and supported MP4 candidates, and also include the two Ogg candidates for Safari because of the released Ogg history. If no explicit candidate succeeds, a no-options MediaRecorder construction may be tried as a separate browser-default experiment. The MediaStream Recording draft treats an empty MIME type as leaving container and codec selection to the user agent; when recording starts, the recorder exposes the selected type. An empty-type probe therefore tests UA choice, not any specific format, and does not prove capture/export success. Accept the default only if the actual type is known, the complete capture/playback/download path passes, and the file can be honestly labeled [S01](sources/index.md#s01). Otherwise show “format unavailable.” Never invoke format fallback after permission denial.

Offer multiple download types only when each type has independently passed the complete path. Map only a verified MIME to an extension; do not guess from a browser name. Keep audio local to the page and user-controlled download. There is no upload endpoint or audio network path.

## R3 — native recorder and AudioWorklet alternative

| Path | Responsibilities, bounds, and scope |
|---|---|
| Native MediaRecorder — recommended baseline | The browser performs encoding and container writing. The component owns permission, state, MIME selection, event/error handling, bounded retention of encoded chunks, assembly, playback, and download. This is the smaller implementation path. |
| AudioWorklet capture and encode — optional, unselected | Requires a microphone permission flow too. Route the one microphone track through MediaStreamAudioSourceNode to AudioWorkletNode; copy PCM frames into fixed-size transfer blocks; send them to a worker/library that encodes and writes a complete file container; then return a typed Blob. AudioWorklet supplies PCM processing on the rendering side; it does not automatically create WAV or any other audio file. A WebCodecs encoder still requires its own support checks, worker lifecycle, and container muxing. |

For a Worklet prototype, cap the producer/worker handoff at two seconds of pending raw PCM. If the worker falls behind, stop and report a buffer-limit error; do not silently drop audio or grow an unbounded queue. Process arrays by their observed frame length: the Web Audio draft's default render quantum is 128 frames but configurable [S03](sources/index.md#s03). Keep work in the real-time callback below its deadline. Set a separate proposed 64 MiB per-memo cap for the app-retained completed output. At 48 kHz, 16-bit PCM is about 28.8 MB for five minutes mono or 57.6 MB stereo before headers; Float32 stereo for the whole five minutes would be about 115.2 MB. Do not accumulate all raw samples until Stop. The transfer queue cap and completed-output cap are different bounds.

For the native path, also cap app-retained encoded chunk bytes at a proposed 64 MiB per memo. This limits what the component keeps after events arrive; it does not bound browser-internal memory or a single large Blob delivered after delayed events. If a chunk would exceed the app cap, request stop, stop retaining more data, release the microphone, and report a storage-limit error. Do not call a retained prefix a valid memo without verifying the complete output.

Neither a requested AudioContext sample rate nor a reported setting proves the physical microphone's native rate. Inspect actual stream/context/output properties, handle channel count explicitly, and perform an intentional resampling step if the product needs another rate. Validate the final file header, sample rate, channel layout, duration, and playback.

The third-party extendable-media-recorder project is an architecture analog only [S09](sources/index.md#s09). Its mutable README describes native recording where possible and custom encoders/Web Audio PCM on other paths; no pinned release or commit was exposed in the reviewed view. Its WAV timeslice issue records a library-specific header compromise [S10](sources/index.md#s10): a maximum/sentinel size was used because a chunked WAV header cannot know final size, and requestData remained absent at that issue's 2019 closure. Issue 692 is also library-specific [S11](sources/index.md#s11). Its 2025 reporter traced a two-times speed symptom to a destination-node stream that exposed two channels despite a mono request; the project owner recommended patching channel count. A separate 2026 follow-up reported a similar symptom, received advice to adjust the destination stream, and ended with the reporter saying they had not tried that advice and implemented their own solution. That history motivates channel/rate/header tests; it does not prove a native Chrome/Safari problem or a generally verified library fix. This plan does not select the dependency.

Use native MediaRecorder where one tested exact type works. Offer a Worklet/WAV route only if its encoder, container, queue, worker lifecycle, size bound, channel/rate handling, playback, and download are implemented and verified. Otherwise refuse an unsupported operation truthfully. The Worklet path is not an automatic fallback just because one MIME fails.

## R4 — chunks and the five-minute contract

Delete the callback counter and 300-callback stop rule. A requested timeslice is a payload-rotation request, not a clock; the user agent may impose a larger minimum and queues dataavailable events [S01](sources/index.md#s01). The page must measure elapsed active time independently. Use a monotonic clock such as performance.now(), accumulate recording segments, freeze the accumulator on Pause, and resume it on Resume [S12](sources/index.md#s12). A requested one-second or two-second timeslice is a test parameter, not a schedule guarantee.

Append every nonempty native dataavailable Blob in arrival order. Retain the actual MIME and count app-retained bytes. On Stop, request recorder stop if valid, wait for its final dataavailable and then stop events, and only then create one Blob from all chunks using the actual MIME. The individual chunks need not be independently playable; the complete combination must pass final playback checks. Do not treat callback timing as elapsed seconds.

**Proposed duration contract:** interpret “up to five minutes” as a strict maximum of 300,000 ms of final encoded media. Count active recording time and request stop at 300,000 ms; paused time is excluded. On hidden-page transition, request stop immediately. Because a timer or visibility handler can be delayed while a page is frozen, this stop request alone does not guarantee a file under the maximum [S12](sources/index.md#s12), [S13](sources/index.md#s13).

Before offering a completed file, verify its encoded duration with a format-specific check whose accuracy has been demonstrated for that exact output type. Do not rely on callback count, requested timeslice, or an unqualified UI duration. If the duration is over 300,000 ms or cannot be measured reliably, do not offer it as a compliant five-minute memo. The current plan selects no trim/remux implementation; the default over-limit action is a clear error and refusal to download, then discard the invalid result on user reset. A local trim/re-encode may replace refusal only after the owner accepts its quality/cost implications and that exact path is validated. This strict ceiling is the recommended interpretation of the brief; the owner must accept this potentially lossy failure behavior before implementation. It does not promise to preserve every recording if the runtime misses the stop request.

The 64 MiB native chunk-retention cap is independent of the duration limit. On overflow stop, release the mic, and fail the memo unless a complete valid bounded output can be independently established; do not label a truncated prefix as saved. Apply the separate two-second PCM handoff cap to the optional Worklet path.

## R5 — version-bounded findings and released history

As of the evidence date, the proposed current desktop lanes are Chrome Stable 155 and Safari 27.0, but no installed browser was observed. Google's 2026-10-06 desktop announcement lists Chrome 155.0.8059.39/.40 for Windows/Mac and .39 for Linux and says rollout continues over coming days or weeks [S04](sources/index.md#s04). Test and record the actual full build and OS; do not assume all installations updated.

WebKit's Safari 27.0 release material says it is available on macOS 26 and macOS 15, separately from the OS update [C01](sources/index.md#c01). Its media summary does not announce a MediaRecorder MIME change. It does list microphone-session and OverconstrainedError-related fixes, which make permission, active capture, and input-error handling worth testing. The release summary's silence about a format change does not prove that a previous format persists or regresses.

Safari history corrects the blanket assumption that Safari cannot use MediaRecorder: WebKit announced MediaRecorder in Safari 14.1 [C02](sources/index.md#c02); Safari 18.4 announced WebM/Opus recording, ALAC/PCM audio support, and Ogg Opus/Vorbis subject to OS-release conditions [S05](sources/index.md#s05); Safari 26.0 explicitly gave audio/mp4 with ALAC as an example [S06](sources/index.md#s06). Those announcements establish history and probe candidates, not the complete MIME matrix of Safari 27. Safari Technology Preview 110's historical empty-stop-Blob and ignored-timeslice fixes are regression-test ideas, not evidence of a present Safari 27 defect [S07](sources/index.md#s07).

The Chromium commit cited in the source map is immutable but from 2025, not mapped to Chrome 155 [S08](sources/index.md#s08). It recognizes WebM and MP4 paths in that snapshot and gates AAC on a proprietary-codecs build option. It is useful for candidate selection, not a Chrome 155 promise. The library README is mutable and its package version/commit was not exposed, so its architecture description is not a release support statement.

Every later positive or negative support result must bind browser name and full version/build, OS, API, exact container/codec/MIME, exact operation (probe, construct, start, capture, assembled output, playback, or download), and relevant permission/device/resource conditions. A failure for one operation does not establish failure of another. Do not extrapolate from one OS, version, or MIME string.

## R6 — bounded proposed validation

Run the following bounded manual matrix on at most five configurations: desktop Chrome Stable 155 on Windows (155.0.8059.39 or .40), macOS (.39 or .40), and Linux (.39); plus desktop Safari 27.0 on macOS 26 and macOS 15. Use one full installed build per configuration and record the actual OS and build. If a target is unavailable, report that lane as untested; do not substitute Safari 26 as current. Safari 26 may be a historical comparison only. The release notes do not establish exact MIME support.

| Group | Proposed cases and recorded results |
|---|---|
| Permission and state | Fresh allow, already granted, deny, prompt left pending then component/page canceled, permission revoked during capture; record state/error and whether a late stream is stopped. |
| Device and tracks | No microphone, busy/unreadable device, unplug or change input, temporary mute/unmute, external track end, devicechange; record track events, recorder final-event order, cleanup, and whether a partial passes full output checks. |
| Controls and cleanup | Start/Pause/Resume/Stop, Stop while paused, invalid or repeated commands, cancel/dispose, recorder/encoder error, and a second clean session. Confirm owned tracks, listeners, timers, worker/audio resources, and playback URLs are released. |
| Exact formats | For each candidate in R2, test probe, construction, short capture, stop/final data, nonempty Blob, actual MIME, measured duration, local playback, download extension/type, and opening the downloaded file. Include a no-options default experiment and a known unsupported MIME string. Never infer another MIME from one result. |
| Chunk behavior | Request one-second timeslice; introduce event-loop delay; pause/resume; stop with data pending; assemble all chunks; play the complete memo. Record actual event times/order and confirm no code uses callback count as a clock. Do not require individual chunks to play. |
| Limits and visibility | Use a short configurable limit in an initial test build; test the five-minute boundary on each selected output path; exercise pause-excluded time, delayed stop, hidden/background and return, and output just over the cap. Confirm exact-duration verification and fail-closed/refusal behavior. |
| Resource and optional Worklet path | Exercise the 64 MiB output boundary and native delayed-chunk case. If Worklet is selected, test two-second producer backpressure, overflow stop, encoder/muxer completion, sample rate, channel count, WAV length/header, duration, playback, download, and resource teardown. If not implemented, label those tests not applicable and do not claim the fallback exists. |

**Execution record:** none of these checks has been run for this fixture. No browser, microphone, permission prompt, recording, local playback, download, or executable witness was used. The table is proposed validation only.

## Critique dispositions

| Critique | Disposition and resulting change |
|---|---|
| F1 — Safari 26 was stale as the current test target. | **Accept.** Current proposed Safari lane is 27.0 on macOS 26 and macOS 15. Keep Safari 26 as history only. WebKit's 27.0 article does not announce a MediaRecorder format change, so no current MIME claim is inferred from that absence. |
| F2 — five-minute contract and over-limit outcome were undecided. | **Accept and amend.** Recommend a strict 300,000 ms encoded-file ceiling. Request Stop from active-time/visibility events; verify final encoded duration; refuse download and discard on reset when over-limit or unverifiable unless a separately tested local trim/re-encode path is approved. This is explicit but remains an owner decision because refusal may lose a recording if the runtime delays Stop. |
| F3 — Safari Ogg path was not in the probe inventory. | **Accept.** Add separate exploratory audio/ogg Opus and Vorbis MIME candidates for current Safari lanes. The Safari 18.4 evidence is OS-qualified and does not specify audio-only MIME strings; runtime probe and full export tests remain required. |
| F4 — Safari 14.1 history had no source binding. | **Accept.** Add C02 with the official WebKit article, MediaRecorder locator, date, and historical-only applicability. |
| F5 — issue 692 source summary omitted diagnosis and closure context. | **Accept with amendment.** Add the 2025 reporter's destination-node/channel diagnosis, the project owner's channel-count advice, the issue's reporter closure, and the separate 2026 follow-up where the reporter did not try the advice and used a self-implemented solution. Keep the evidence library-specific and do not call it a confirmed fix. |

Critic agreement does not settle browser behavior: the Safari 27 and Ogg statements are checked against the linked WebKit release pages, and issue 692 was reopened directly for its history. The absence of a Safari 27 format announcement is not a support denial and does not replace per-build testing.

## Retained scope, options, and owner decisions

Retained user requests: one short memo component; record, pause, stop, playback, local download; microphone only; no backend/upload; up to five minutes; explicit unsupported-operation behavior; no requirement for equal quality or cross-browser file compatibility.

Corrected draft assumptions: one hard-coded WebM/Opus type; one-second callbacks as a clock; 300 callbacks as five minutes; probe-as-proof; blanket Safari denial; Web Audio automatically producing WAV; requested sample rate as proof of hardware capture rate; unbounded raw samples; resetting controls without errors or cleanup; and independently playable timeslice chunks.

Optional capabilities preserved: user-selected input after permission; more than one download type only after each full path passes; retention of a validated partial after interruption; modest timeslice to reduce typical event payload; elapsed-time display; and an optional Worklet/WAV path. None is claimed as already implemented or tested.

Owner decisions before implementation: (1) accept the recommended strict encoded-duration ceiling and refusal/discard behavior or fund/test a local trim path; (2) select format and quality order; (3) accept the proposed 64 MiB output cap; (4) decide whether a Worklet/encoder dependency is worth its implementation, packaging, and test costs; (5) choose whether to retain a verified interrupted partial; and (6) confirm the hidden-page stop policy; and (7) choose mute handling. Until decided, the recommended defaults are explicit start, hidden-page stop, active-time accounting with strict final-file verification, 64 MiB app-retained output cap, verified native types first, and truthful refusal when no complete path passes.

## Negative constraints

- Never record before explicit user action and microphone permission.
- Never upload audio or add server persistence/network audio paths.
- Never capture system audio, screen audio, or video.
- Never continue hidden/background capture by default.
- Never promise five minutes based on callback counts or requested timeslice.
- Never invent browser tests or claim proposed checks were run.
- Never deny all Safari MediaRecorder capability from an old compatibility summary.
- Never advertise an exact type without its own verified capture/export path.
- Never retain unbounded raw PCM or call an unverified partial prefix a saved memo.
- Never expand this component plan into a whole-app build.
