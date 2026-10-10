# Source index — investigator stage

Bounded research index for `A3-02-treatment`; discovery was produced from the brief before plan release. Source IDs are stable and are not rebound. Evidence consists of these paraphrased notes and direct links; no full-page copies or browser captures were saved. Access times and exact locators are also recorded in `../source-map.json`.

## Primary API and runtime-version sources

### <a id="s01"></a>S01 — W3C MediaStream Recording, 2026-03-16 Working Draft

[Fixed dated report](https://www.w3.org/TR/2026/WD-mediastream-recording-20260316/). §2.1–2.3 defines construction, actual `mimeType`, event/state behavior, recording errors, `isTypeSupported`, and timeslice. A positive type probe indicates format capability but not guaranteed resources for concrete encoding; constructor rejection and later `start`/capture errors remain distinct. Requested timeslice has a UA minimum and events are queued. All ended tracks end the recorder; the final data blob is delivered before `stop`. §2.3 says chunks from `timeslice`/`requestData()` need not be separately playable, but their completed combination must be playable. §6.1 warns about resource exhaustion from large buffering. Draft status is Work in Progress.

### <a id="s02"></a>S02 — W3C Media Capture and Streams, 2025-10-09 Candidate Recommendation Draft

[Fixed dated report](https://www.w3.org/TR/2025/CRD-mediacapture-streams-20251009/). §4.3.1.2 covers live/ended track lifecycle and says mic/camera end causes beyond app stop are implementation-defined; external end queues `ended`, but explicit `track.stop()` does not. §4.3.2 distinguishes temporary `mute`/`unmute` from permanent end. §9.1 exposes secure-context `MediaDevices`; §10.2 permission failure rejects `NotAllowedError`; §13 ties microphone permission to feature policy. Device changes can be coalesced and only reflect the exposed available-device set.

### <a id="s03"></a>S03 — W3C Web Audio API 1.1, 2026-09-22 Working Draft

[Fixed dated report](https://www.w3.org/TR/2026/WD-webaudio-1.1-20260922/). §1.32 defines `AudioWorkletGlobalScope` and processing on the audio rendering thread; §2.6 describes real-time callback deadlines and a default 128-frame quantum that may be configured. Worklet output is processed PCM, not a self-describing finished recording format.

### <a id="s04"></a>S04 — Chrome Stable desktop release anchor, 2026-10-06

[Official Chrome Releases article](https://chromereleases.googleblog.com/2026/10/stable-channel-update-for-desktop_086471744.html). Names desktop Stable 155.0.8059.39/.40 for Windows/Mac and .39 for Linux; rollout may take days or weeks. Version anchor only: it does not claim a particular MIME support set. The exact full installed build must be recorded in testing.

## Released browser capability history

### <a id="s05"></a>S05 — WebKit features in Safari 18.4, 2025-03-31

[WebKit release article](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/), Media section. Safari 18.4 added WebM recording with Opus and describes ALAC/PCM audio tracks and fragmented MP4. The surrounding paragraph does not enumerate a complete standalone audio-only MIME matrix; do not infer exact PCM strings from it. It explicitly scopes Ogg Opus/Vorbis to macOS Sequoia 15.4, iOS/iPadOS 18.4, and visionOS 2.4. This disproves reliance on an old blanket Safari incompatibility summary, but is not the exact runtime matrix for Safari 26.

### <a id="s06"></a>S06 — Safari 26.0 release capability and build

[WebKit feature article](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/), Media section, says Safari 26.0 added MediaRecorder ALAC and PCM and shows `audio/mp4; codecs=alac`. Apple's [Safari 26.0 release notes](https://developer.apple.com/documentation/safari-release-notes/safari-26-release-notes) identify the release as build 26 (20622.1.22), released 2025-09-15. Neither page states a complete MIME matrix or an exact PCM MIME string.

### <a id="s07"></a>S07 — Safari Technology Preview 110 historical fixes, 2020-07-16

[WebKit release notes](https://webkit.org/blog/10929/release-notes-for-safari-technology-preview-110/) identify revision range 263214–263988 and fix changesets for an empty stop Blob after first use (r263511/r263633/r263891) and a `start()` call ignoring `timeslice` (r263565/r263651/r263892). Historical regression rationale only; it does not establish present Safari 26 behavior.

### <a id="s08"></a>S08 — Chromium MediaRecorder MIME implementation snapshot, commit 2025-09-04

[Immutable source file](https://chromium.googlesource.com/chromium/src/third_party/+/19646947eb735f84c5ae91af1fe901273d67d4f7/blink/renderer/modules/mediarecorder/media_recorder_handler.cc); [commit metadata](https://chromium.googlesource.com/chromium/src/third_party/+/19646947eb735f84c5ae91af1fe901273d67d4f7). The source recognizes audio/webm and audio/mp4; maps Opus and PCM; and maps mp4a.40.2 AAC only under `USE_PROPRIETARY_CODECS`. It is a 2025 source snapshot, not the Chrome 155 release commit or binary; use it to form exact runtime probes, not promise support.

### <a id="s12"></a>S12 — High Resolution Time, 2026-09-01 Working Draft

[Fixed dated report](https://www.w3.org/TR/2026/WD-hr-time-3-20260901/), §2.1 and §7.1. `performance.now()` uses a monotonic clock, so system clock changes do not make elapsed time go backward. The report also says a user agent may throttle timers/callbacks or freeze them in a background tab while the monotonic clock remains accurate. A correct elapsed-time source therefore does not make a stop timer real-time.

### <a id="s13"></a>S13 — HTML Living Standard, page visibility

[Current Page Visibility section](https://html.spec.whatwg.org/multipage/interaction.html#page-visibility), §6.2, last updated 2026-10-09. The user agent determines whether the page's system visibility is hidden/visible. On a change, it queues a global task to update the document's state and then fires `visibilitychange`; this is a signal for the recommended hidden-stop policy, not a synchronous deadline guarantee.

## Implementation analog and issue/fix history

### <a id="s09"></a>S09 — `extendable-media-recorder` architecture analog

[Repository README](https://github.com/chrisguttandin/extendable-media-recorder) describes a partial MediaRecorder-compatible wrapper, custom audio encoders and use of Web Audio PCM when native recording is not used; its custom Chrome path consumes WebM/PCM and parses EBML. The rendered page did not expose a pinned README commit or current package release, so this mutable README is an architecture clue only, not a versioned support claim or dependency recommendation.

### <a id="s10"></a>S10 — WAV timeslice issue, closed with implementation commit

[`extendable-media-recorder` issue #263](https://github.com/chrisguttandin/extendable-media-recorder/issues/263) opened 2019-05-20 and closed completed in commit `2fe86e8` on 2019-09-03. Maintainer discussion says the WAV encoder used a maximum/sentinel file size for timesliced output because an early chunk cannot later rewrite the final header; `requestData()` remained absent then. This is one library's container-header tradeoff, not a native MediaRecorder limitation.

### <a id="s11"></a>S11 — WAV speed/timeslice report, not a verified fix

[`extendable-media-recorder` issue #692](https://github.com/chrisguttandin/extendable-media-recorder/issues/692), opened 2025-08-08 and shown closed in the page. The report describes ~2x WAV playback and ~2x requested event spacing. Its library version is blank, its OS/browser examples are placeholders, and no maintainer resolution was visible. Treat only as a library-specific test-risk signal; do not generalize to native Chrome/Safari.

## Access and execution notes

The fixed W3C/WebKit sources S01–S07 were opened on 2026-10-10 at 04:47:40 UTC; S12–S13 were opened at 04:52:20 UTC. Chrome release details were retrieved from the official stable article/search result at 04:48:07 UTC. Chromium commit/library/issue search results S08–S11 were retrieved at 04:48:29 UTC; some direct page opens were unavailable, as disclosed in the source map. No native browser, downloaded implementation, test suite, or executable witness was run.
