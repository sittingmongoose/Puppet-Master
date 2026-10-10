# ER12 A3-02 investigator source index

Access windows below are UTC. Primary specifications, vendor release material, source history, and one dated implementation package were opened for this stage. No browser execution was performed. All browser-support statements are bounded to their cited API, release, and conditions; the live target browser remains unpinned.

## Governing APIs

### [S1 — W3C MediaStream Recording](https://www.w3.org/TR/mediastream-recording/)
- Identity: W3C Working Draft, 16 March 2026; exact published snapshot: <https://www.w3.org/TR/2026/WD-mediastream-recording-20260316/>. Current unversioned URL above points to the latest published version as of access.
- Access UTC: 2026-10-10 04:51:35–04:51:36.
- Locator: §§2.1–2.4 and §4; lines 80–219, 225–273, 290–319, 366–421 of the current view.
- Observed operation: read spec prose and algorithms through W3C public HTML.
- Governing points: no `mimeType` hint permits UA choice of default encoding; MIME constrains container/codecs; construction, start, and later asynchronous error paths differ; `timeslice` is a minimum or longer UA-imposed slice; track-set changes end recording with `InvalidModificationError`; all-ended tracks produce final `dataavailable` then `stop`; pause/resume alter gathering; individually emitted Blobs need not be playable while the completed concatenation must be. Current 16 Mar 2026 Working Draft marks `isTypeSupported()` deprecated and recommends `MediaCapabilities.encodingInfo({type:"record", ...})` for richer configuration support where implemented.
- Applicability: lifecycle, negotiation design, chunk collection, failure states, and resource-bound design for audio-only `MediaRecorder`; Working Draft status and unverified browser adoption are explicit limitations.

### [S2 — W3C Media Capture and Streams](https://www.w3.org/TR/mediacapture-streams/)
- Identity: W3C current published online specification; no release/version pin in URL. Additional constraints/settings locators were re-read at 2026-10-10 04:56:38–04:57:59 UTC.
- Access UTC: 2026-10-10 04:51:35–04:51:36.
- Locator: §§4.3.1, 5.2, 8, 9, and 14; actual `getSettings()` around lines 636–649; `sampleRate` constraints around 790–860 and ideal/exact semantics around 1993–1995, 2252–2268; examples around 2093–2113; event summary around 1177–1197.
- Observed operation: read capture lifecycle, event definitions, and permission policy sections.
- Governing points: `getUserMedia` requests only specified tracks and resolves/rejects asynchronously; permission and device state can prevent capture; microphone tracks can mute/unmute temporarily or end on permission revocation/device removal; `devicechange` means the available device set changed and is not itself proof that the current track changed; changing the MediaRecorder stream's track set is a recording error per S1. `sampleRate` is a constrainable setting with exact/ideal forms; inspect the selected live track using `getSettings()` rather than treating a requested value or an AudioContext rate as proof of hardware capture rate. Calling `track.stop()` is app-controlled cleanup and does not itself deliver an `ended` event.
- Applicability: HTTPS microphone-only permission flow, device change, track ended/muted handling, and cleanup. Browser delivery timing of device events is not asserted here.

### [S3 — W3C Web Audio API 1.1](https://www.w3.org/TR/webaudio/)
- Identity: W3C Web Audio API 1.1 specification, current published URL at access.
- Access UTC: 2026-10-10 04:51:35–04:51:36.
- Locator: §1.32 AudioWorklet (lines ~5522–5545), `AudioWorkletGlobalScope` and `AudioWorkletProcessor`; §2.5–2.6 render quantum sizes (lines ~6243–6262); `process()` algorithm around lines ~6380–6415.
- Observed operation: read spec definitions and processing algorithm.
- Governing points: AudioWorklet runs custom processing synchronously with the audio graph on the rendering thread; communicates with the main scope over a MessagePort; the default quantum is 128 frames but size is configurable and available as `renderQuantumSize`; processor errors fire `processorerror`; port cleanup is needed to release resources.
- Applicability: Worklet is a PCM processing mechanism, not a container/codec encoder. Processing must meet real-time deadlines; a custom recorder must transport/buffer samples and encode/mux separately.

## Browser release and implementation evidence

### [S4 — WebKit: New WebKit Features in Safari 14.1](https://webkit.org/blog/11648/new-webkit-features-in-safari-14-1/)
- Identity: WebKit release article for Safari 14.1, released 26 April 2021.
- Access UTC: 2026-10-10 04:51:35–04:51:36.
- Locator: “MediaRecorder API” and “WebM Support” sections, lines 69–78.
- Observed operation: read vendor release article.
- Finding/applicability: WebKit says Safari 14.1 added MediaStream Recording using platform default encodings. Its adjacent WebM playback support statement is specifically macOS VP8/VP9 video plus Vorbis audio; it does not establish that MediaRecorder could create those formats. This is historical Safari implementation evidence, not a current compatibility floor or blanket claim.

### [S5 — WebKit: WebKit Features in Safari 18.4](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/)
- Identity: WebKit release article dated 31 March 2025; Safari 18.4, with OS release applicability stated in the page.
- Access UTC: 2026-10-10 04:51:35–04:51:36.
- Locator: “Media” section, lines 145–168.
- Observed operation: read vendor release notes/article.
- Finding/applicability: Safari 18.4 added MediaRecorder creation of WebM with Opus audio and VP8/VP9 video; fragmented MP4; ALAC or PCM audio; Ogg Opus/Vorbis on macOS Sequoia 15.4, iOS 18.4, iPadOS 18.4, visionOS 2.4. These release facts make candidate formats worth probing on matching builds; they do not prove a particular audio-only MIME string succeeds on the unpinned target.

### [S6 — WebKit: WebKit Features in Safari 26.0](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/)
- Identity: Safari 26.0 release article dated 15 September 2025.
- Access UTC: 2026-10-10 04:51:35–04:51:36.
- Locator: “Media” section; Safari 26.0 MediaRecorder ALAC/PCM example and AudioEncoder/AudioDecoder notes.
- Observed operation: read vendor release article.
- Finding/applicability: release provides an explicit `audio/mp4; codecs=alac` construction example and says ALAC/PCM audio is available in MediaRecorder; it also adds WebCodecs AudioEncoder/AudioDecoder. Candidate only for the exact Safari 26 family/context; runtime construction/capture/export remain separate tests.

### [S7 — Apple Safari 17.4 Release Notes](https://developer.apple.com/documentation/safari-release-notes/safari-17_4-release-notes)
- Identity: Safari 17.4 release notes; Apple page identifies version 17.4 (19618.1.15), released 5 March 2024.
- Access UTC: 2026-10-10 04:43:44–04:45:55 and 2026-10-10 05:02:47–05:03:20; release version/date and issue text were observed in official Apple search-result excerpts (direct Apple page exposes no readable body in this browser tool).
- Locator: Media → Resolved Issues; issue 115979604.
- Observed operation: official Apple search result read, no successful direct page-body extraction.
- Finding/applicability: Apple lists a fix for pausing MediaRecorder while `ondataavailable` continued at each timeslice. Relevant to Safari pause behavior and chunk tests in that release family; not proof the bug existed or remains in any other pinned target.

### [S8 — WebKit Bug 258567: empty MediaRecorder Blobs](https://bugs.webkit.org/show_bug.cgi?id=258567)
- Identity: WebKit issue; reported 27 June 2023, case discussion through 17 July 2023; Safari 16.x report.
- Access UTC: 2026-10-10 04:51:35–04:51:36.
- Locator: comments 4–12, especially lines 62–99.
- Observed operation: read public bug history and reporter/maintainer comments.
- Conditions/finding: reporter on M1 MacBook Pro, macOS Ventura 13.4.1, Safari 16.4/16.5.1 saw empty `audio/mp4` data for microphone/stream-destination cases when system *output* sample rate was 96 kHz; changing output to 48 kHz and reloading fixed their repro. Maintainer could not reproduce on another setup. It is a bounded incident report, not a confirmed general Safari behavior or current regression. It motivates checking nonempty output under real system/device settings.

### [S9 — WebKit Bug 243837: extra bytes after pause/requestData/stop](https://bugs.webkit.org/show_bug.cgi?id=243837)
- Identity: WebKit issue for iOS 15 / Safari 15, reported 11 August 2022; fixed in WebKit commit 253529@main (`f2967879748b`) on 17 August 2022.
- Access UTC: 2026-10-10 04:51:35–04:51:36.
- Locator: description lines 36–58; committed-fix history lines 61–75.
- Observed operation: read public issue and linked commit record.
- Conditions/finding: reported operation sequence was `start(); pause(); requestData(); stop()`; reported extra bytes/truncation after pause; fix landed in WebKit mainline. The specific reproduction was iOS media recording, not this component’s tested desktop mic path. Treat as pause/final-flush history, not universal behavior.

### [S10 — Chrome for Developers: Record audio and video with MediaRecorder](https://developer.chrome.com/blog/mediarecorder)
- Identity: Google Chrome Developers article, last updated 30 January 2016.
- Access UTC: 2026-10-10 04:51:35–04:51:36.
- Locator: support notes and examples around lines 50–73; MIME detection/constructor discussion later in page.
- Observed operation: read official historical Chrome API article.
- Finding/applicability: documents Chrome 47/48 video-only behind a flag and audio recording from Chrome 49; shows `audio/webm` as an example and advises feature detection or omitted options for default. This is historical implementation history only; never use the old version table to deny capability in current Chrome.

### [S11 — Chromium muxer implementation at commit 042aaa189184e3d303c01946589eb84926d91000](https://chromium.googlesource.com/chromium/src/media/%2B/042aaa189184e3d303c01946589eb84926d91000/muxers/README.md)
- Identity: exact Chromium source commit `042aaa189184e3d303c01946589eb84926d91000`; not itself a branded Chrome release version.
- Access UTC: 2026-10-10 04:51:35–04:51:36.
- Locator: README lines 8–16.
- Observed operation: read pinned implementation documentation.
- Finding/applicability: says these muxers are primarily used by MediaRecorder; lists WebM with Opus audio and MP4 with Opus/AAC audio. Useful as implementation candidates, not public browser-release support or runtime success evidence.

### [S12 — opus-media-recorder package 0.8.0](https://www.npmjs.com/package/opus-media-recorder?activeTab=code)
- Identity: npm package page displayed version `0.8.0`, MIT license, last publish about five years before access; package/repository not pinned to newer HEAD.
- Access UTC: 2026-10-10 04:45:55–04:51:35 (package page/search result and README were observed in this interval; direct version-subpage attempt returned a tool error).
- Locator: package README “Why”, “How to use”, “Browser support”, “MIME Type support”, and “Limitations” sections; npm sidebar version/publish fields.
- Observed operation: read package README and npm registry page; no install or code execution.
- Finding/applicability: established alternative/polyfill architecture uses libopus/libogg/libwebm/speexdsp compiled to WebAssembly and a Web Worker, with worker/WASM asset/bundler setup; advertises Ogg/WebM/WAV. It documents WAV output as individually complete per `dataavailable` event and therefore not concatenable, plus generic non-DOMException errors and no video support. Its old browser matrix is stale and is not used as current platform evidence. This illustrates encoder/muxer and maintenance cost if native output is insufficient.

## Evidence boundary

No target Chrome or Safari version was supplied, and no browser capture/playback/download was executed. No `isTypeSupported`, `MediaCapabilities.encodingInfo`, constructor, `start`, permission prompt, chunk, or export result was observed in a browser. Release histories and source files are evidence for what those exact releases/commits documented, not substitutes for the proposed target matrix.
