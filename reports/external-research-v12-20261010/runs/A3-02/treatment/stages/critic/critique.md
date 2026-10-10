# Critique — voice memo capture component

Run: A3-02-treatment. Stage: critic. Basis: the finalized brief, complete investigator discovery/draft/source map, released plan, and direct checks of the carried primary sources and relevant release history. No browser or microphone test was run in this stage.

## Findings

### F1 — Material wrong: the Safari validation target is stale

Draft locations: Research and release record; R2 candidate table; R6 first row. The draft calls Safari 26.0 the current release target. WebKit released Safari 27.0 on 2026-09-17, before this review date, and says it is available on macOS 26 and macOS 15. The matrix therefore omits the current desktop Safari release and cannot support the brief's current-Safari research target. Keep Safari 26.0 evidence as history, add Safari 27.0 as the present test target, and record the actual build and OS. The Safari 27 release summary does not announce a MediaRecorder format change; that absence does not establish either support or regression, so exact MIME and export behavior still require runtime checks. See C01.

### F2 — Material incomplete: the five-minute contract remains undecided

Draft locations: R4 Duration proposal and Owner decisions before implementation. The proposal defines 300,000 ms of active time and stops on hidden, but explicitly leaves open whether “up to five minutes” is a strict encoded-duration ceiling. A monotonic clock gives reliable elapsed time; it does not make a throttled/frozen stop callback run on time. The draft proposes inspecting the final duration but does not state the user-visible result if it exceeds the cap or how it would trim/retain a valid memo. Since the brief requires one memo up to five minutes, the plan needs an explicit accepted boundary and over-limit behavior before implementation. The document is appropriately candid about the limitation; this is an open product/engineering disposition, not evidence of a browser test. See S01, S12, S13.

### F3 — Material incomplete: the format candidate inventory omits a released Safari path

Draft locations: R2 candidate table and R6 MIME cases. Safari 18.4 release notes also announce Ogg recording with Opus and Vorbis, under explicit OS-version conditions (including macOS Sequoia 15.4). The draft records this condition in S05 but does not include Ogg among its candidate probes. This is not a claim that Ogg is currently supported in Safari 27; it is a potentially useful released path that the proposed matrix would not discover. Either test the exact audio-only MIME candidates on applicable current Safari builds through the full operation chain, or state that Ogg is intentionally outside the offered format set. See S05.

### F4 — Minor locator/evidence-record gap: Safari 14.1 history

Draft location: R5. The statement that WebKit announced MediaRecorder in Safari 14.1 is supported by WebKit's 2021 release article, but the investigator source map has no source ID or locator for that sentence. It is historical context, not a false claim. Add a stable source record if the statement remains. See C02.

### F5 — Minor history-context correction: library WAV issue #692

Draft location: R3; investigator source-map entry S11. The current issue history contains more context than “no maintainer resolution was exposed”: the maintainer pointed to a Web Audio MediaStream destination reporting two channels, and the reporter described an AudioContext/MediaStreamAudioDestinationNode path and closed the report as completed in 2025. A later 2026 comment describes a similar symptom and asks for more detail. This remains library- and pipeline-specific and does not prove a native Chrome/Safari defect or a general fix. The draft's cautious test-risk use is sound, but the source-map summary should preserve the diagnosis and closure context instead of implying there was no maintainer response. See S11.

## Obligation and disposition review

| Brief clause | Assessment of investigator draft |
|---|---|
| R1 lifecycle, permission, track-ended, cleanup, error state | Covered well: user-initiated permission, explicit states, end/mute handling, idempotent cleanup, partial-output checks, and visible errors. The pause/finalize policy on mute remains a deliberate owner choice and is identified as such. |
| R2 negotiation and fallback | Correctly separates probe, construction, start/capture, output, playback, and download. It avoids a fixed browser MIME promise and specifies a native default plus optional Worklet/refusal boundary. F1 and F3 limit the proposed current-browser candidate matrix. |
| R3 native versus Worklet | Substantive comparison: browser-owned encoding/muxing versus PCM, worker encoding/muxing, queue/output bounds, channel/sample-rate handling, and dependency cost. The fallback is correctly optional and not portrayed as automatic. F5 narrows the analog history. |
| R4 chunk timing and assembly | Correctly rejects callback counts as a clock, explains final concatenation and that individual chunks need not play, and uses monotonic active-time accounting. F2 leaves the required five-minute acceptance behavior open. |
| R5 release history and bounded claims | Correctly rejects blanket Safari denial and distinguishes historical releases, immutable Chromium source, and runtime evidence. Claims are generally qualified by operation and conditions. F1 is a stale current-version anchor; F4 is a source traceability gap. |
| R6 bounded validation and execution record | Matrix is appropriately bounded and clearly proposed, not executed. No browser, permission, capture, playback, or download observation is claimed. F1 requires updating the Safari lane; F2's semantic decision still needs an acceptance outcome. |

The released plan's misleading assumptions are all directly challenged: hard-coded WebM/Opus, callback-count timing, probe-as-proof, blanket Safari denial, “Web Audio makes WAV,” sample-rate assumptions, unbounded PCM retention, and missing cleanup/error behavior. The draft preserves the microphone-only, local-only, no-upload, no-system-audio, one-memo, component-only scope. Its alternatives and unresolved questions are useful and not treated as authority to reduce scope.

## Validation status

Proposed only: the Chrome/Safari matrix, permission/device interruptions, MIME operations, playback/download, delayed callbacks, duration and byte caps, cleanup, and Worklet checks. Executed in this critic stage: source review only. No browser test, recording, executable witness, or downloaded code was run. This distinction is accurate.

## Cutoff note

The stage deadline was 2026-10-10T05:06:53.818Z. Final artifact writing began after that cutoff. This report preserves the review completed from the assigned inputs and direct source checks; the stage was not completed within its deadline.


Exact source-access UTC timestamps were not exposed by the browser tool and remain UNKNOWN; the exact artifact-save UTC is also UNKNOWN. No attempt was made to reconstruct either timestamp. The saved review explicitly records these limitations.

