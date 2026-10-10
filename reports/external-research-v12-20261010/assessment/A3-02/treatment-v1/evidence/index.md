# Independent primary evidence index

Scope: A3-02 treatment only. Independent retrieval and mechanism review; no browser/microphone tests. A locator identifies the governing condition, not a claim that the source settles another API operation. Full standards/code captures retain their original licensing. Retrieval receipts record URL, bytes, SHA-256 and wall-clock request times; those facts are integrity evidence only.

[Assessment](../assessment.md) · [Structured source map](../source-map.json) · [Original inspected hashes](../original-inspected-hashes.json)

<a id="e01"></a>

## E01 — MediaStream Recording

[MediaStream Recording](https://www.w3.org/TR/2026/WD-mediastream-recording-20260316/). Working Draft 2026-03-16.

**Locator:** §2.1 constructor step 4; §2.3 start, stop, pause/resume, inactivate, isTypeSupported; §6.1.

**Independent judgment:** Lifecycle/chunk/default distinctions supported; important probe exception missing from authored maps.

**Condition/limit:** Public probe passes false, constructor passes true to deferred-codec check. Only enumerated codec identifiers are synchronously exposed; newer identifiers can give a negative probe without the same constructor rejection. Empty MIME leaves UA choice. Normal stop yields final data before stop; completed concatenation rather than every chunk is the playable object. Resource exhaustion remains possible.

Local evidence: [recording-wd20260316.html](recording-wd20260316.html), [recording-wd20260316-readable.txt](recording-wd20260316-readable.txt), [recording-wd20260316-retrieval.json](recording-wd20260316-retrieval.json).

<a id="e02"></a>

## E02 — Media Capture and Streams

[Media Capture and Streams](https://www.w3.org/TR/2025/CRD-mediacapture-streams-20251009/). Candidate Recommendation Draft 2025-10-09.

**Locator:** §4.3.1 track lifecycle; §9–10 MediaDevices/getUserMedia; permissions integration.

**Independent judgment:** Permission, mute/end and owned-track cleanup claims supported.

**Condition/limit:** Secure-context and permission requirements apply. Muted/disabled audio yields silence. External ending queues ended; application track.stop() does not. Revocation ends relevant live tracks. Devicechange is supplementary and may be coalesced; cause inference is limited.

Local evidence: [capture-crd20251009.html](capture-crd20251009.html), [capture-crd20251009-readable.txt](capture-crd20251009-readable.txt), [capture-crd20251009.html.retrieval.json](capture-crd20251009.html.retrieval.json).

<a id="e03"></a>

## E03 — Web Audio API 1.1

[Web Audio API 1.1](https://www.w3.org/TR/2026/WD-webaudio-1.1-20260922/). Working Draft 2026-09-22.

**Locator:** §1.2.5 AudioContextOptions; §1.24 MediaStreamAudioSourceNode; §1.32 AudioWorklet; §2 rendering.

**Independent judgment:** PCM-processing/encoding distinction, quantum and sample-rate qualifications supported.

**Condition/limit:** Default render quantum is 128 frames; renderSizeHint may request another size and may not be honored. Worklet processing has a rendering deadline. A stream source resamples to context rate; that processing rate is not proof of physical hardware rate. File encoding/header/muxing are separate responsibilities.

Local evidence: [webaudio-wd20260922.html](webaudio-wd20260922.html), [webaudio-wd20260922-readable.txt](webaudio-wd20260922-readable.txt), [webaudio-wd20260922.html.retrieval.json](webaudio-wd20260922.html.retrieval.json).

<a id="e04"></a>

## E04 — Chrome desktop release anchor

[Chrome desktop release anchor](https://chromereleases.googleblog.com/2026/10/?amp=1). Official October 2026 archive: Stable desktop announcement 2026-10-06.

**Locator:** Stable Channel Update for Desktop, Tuesday October 6; also October 7 Early Stable entry.

**Independent judgment:** 155 stable announcement verified; direct article fetch failed, official archive and corresponding official Android entry corroborate builds.

**Condition/limit:** 155.0.8059.39/.40 Windows/Mac, .39 Linux; staged rollout. October 7 also introduces 156 early stable for a small Windows/Mac population. The selected 155 lane is a bounded ordinary-stable baseline, not all currently distributed binaries. No installed browser was observed.

Evidence is the independently opened primary page at the linked heading/comment/date locator; no raw page capture is claimed. Exact tool access timestamps are UNKNOWN; review window is recorded in source-map.json.

<a id="e05"></a>

## E05 — WebKit Features in Safari 18.4

[WebKit Features in Safari 18.4](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/). Safari 18.4; 2025-03-31.

**Locator:** Media heading: WebM MediaRecorder paragraph versus following Ogg paragraph (web extraction lines 145–168).

**Independent judgment:** WebM recording history supported; critic F3 conflates generic Ogg media support with recording.

**Condition/limit:** WebM recording has explicit Opus/audio and VP8/VP9/video wording, with ALAC/PCM recording discussion. Ogg support is qualified to macOS Sequoia 15.4, iOS/iPadOS 18.4 and visionOS 2.4. The Ogg paragraph supplies neither an Ogg MediaRecorder recording claim nor exact audio-only recorder MIME strings.

Evidence is the independently opened primary page at the linked heading/comment/date locator; no raw page capture is claimed. Exact tool access timestamps are UNKNOWN; review window is recorded in source-map.json.

<a id="e06"></a>

## E06 — WebKit Features in Safari 26.0

[WebKit Features in Safari 26.0](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/). Safari 26.0; 2025-09-15.

**Locator:** Media heading, lines 349–358 in web extraction.

**Independent judgment:** ALAC/PCM MediaRecorder history and audio/mp4 ALAC example supported.

**Condition/limit:** Historical released example audio/mp4; codecs=alac is explicit. AudioEncoder/AudioDecoder additions are also announced. This does not prove exact current Safari 27 binary behavior or a universal PCM support table.

Evidence is the independently opened primary page at the linked heading/comment/date locator; no raw page capture is claimed. Exact tool access timestamps are UNKNOWN; review window is recorded in source-map.json.

<a id="e07"></a>

## E07 — Safari Technology Preview 110 release notes

[Safari Technology Preview 110 release notes](https://webkit.org/blog/10929/release-notes-for-safari-technology-preview-110/). 2020-07-16; WebKit revisions 263214–263988.

**Locator:** WebRTC entries: empty stop Blob after first use, ignored timeslice; changesets r263511/r263633/r263891 and r263565/r263651/r263892.

**Independent judgment:** Historical regression details accurately used as prospective checks.

**Condition/limit:** STP 110 history is not a diagnosis of Safari 27. No current defect or current successful regression test follows from those entries.

Evidence is the independently opened primary page at the linked heading/comment/date locator; no raw page capture is claimed. Exact tool access timestamps are UNKNOWN; review window is recorded in source-map.json.

<a id="e08"></a>

## E08 — Chromium authored implementation snapshot

[Chromium authored implementation snapshot](https://chromium.googlesource.com/chromium/src/third_party/+/19646947eb735f84c5ae91af1fe901273d67d4f7/blink/renderer/modules/mediarecorder/media_recorder_handler.cc). Immutable 19646947eb735f84c5ae91af1fe901273d67d4f7 (2025 snapshot).

**Locator:** AudioStringToCodecId lines 155–175; CanSupportAudioType lines 180–186; CanSupportMimeType/codec lists lines 286–355.

**Independent judgment:** WebM/MP4, Opus/PCM and build-conditional AAC claims supported by direct decoded source.

**Condition/limit:** USE_PROPRIETARY_CODECS conditions AAC mp4a.40.2. Source supports forming audio/webm with pcm candidates too, although the final declines guessed PCM offerings. Snapshot does not authenticate a current installed Chrome binary.

Local evidence: [chromium-2025-handler.cpp](chromium-2025-handler.cpp), [chromium-2025-handler.cpp.retrieval.json](chromium-2025-handler.cpp.retrieval.json).

<a id="e09"></a>

## E09 — extendable-media-recorder architecture analog

[extendable-media-recorder architecture analog](https://github.com/chrisguttandin/extendable-media-recorder/blob/3107005ffdf1a4857c15f224438ef86fa35dd7d6/README.md). Independent reviewer resolved master to 3107005ffdf1a4857c15f224438ef86fa35dd7d6 (committer 2026-09-02); candidate used mutable README.

**Locator:** Using a custom encoder; Setting the sample rate; Inner Workings.

**Independent judgment:** Analog mechanism supported; candidate correctly does not select or claim a tested dependency release.

**Condition/limit:** Native implementation used when possible. Custom audio encoding path in Chrome consumes native WebM/PCM and parses EBML; other browsers use Web Audio PCM. AudioContext resampling is described. This is an analog, not a native browser compatibility matrix.

Local evidence: [library-readme-pinned.txt](library-readme-pinned.txt), [library-readme-pinned.txt.retrieval.json](library-readme-pinned.txt.retrieval.json), [library-readme-at-review.txt](library-readme-at-review.txt), [library-master-ref.json](library-master-ref.json), [library-readme-at-review.txt.retrieval.json](library-readme-at-review.txt.retrieval.json), [library-master-ref.json.retrieval.json](library-master-ref.json.retrieval.json).

<a id="e10"></a>

## E10 — Recorder WAV timeslice issue 263

[Recorder WAV timeslice issue 263](https://github.com/chrisguttandin/extendable-media-recorder/issues/263). Opened 2019-05-20; completed 2019-09-03 via 2fe86e8.

**Locator:** Maintainer comments May 25 and September 3; closure entry.

**Independent judgment:** Sentinel-header and missing requestData history supported.

**Condition/limit:** Library-specific WAV compromise for unknown length during chunking. The closure does not imply all native containers share it or that a present package behaves identically.

Evidence is the independently opened primary page at the linked heading/comment/date locator; no raw page capture is claimed. Exact tool access timestamps are UNKNOWN; review window is recorded in source-map.json.

<a id="e11"></a>

## E11 — Recorder WAV doubled-speed issue 692

[Recorder WAV doubled-speed issue 692](https://github.com/chrisguttandin/extendable-media-recorder/issues/692). 2025-08-08 opening; 2025-08-12 reporter closure; 2026-04-14/15 follow-up.

**Locator:** 2025 reporter/owner comments and April 15 adapted destination-stream advice (web extraction lines 273–474).

**Independent judgment:** Final expanded history is supported; inherited summary was incomplete.

**Condition/limit:** 2025 report clarified Windows-only reproduction and two-channel destination stream despite mono request. Owner proposed channel-count patching; reporter closed. Later reporter said a general patch failed, then did not try the adapted destination-stream suggestion and wrote a custom Worklet solution. Neither closure nor advice proves a verified general fix.

Evidence is the independently opened primary page at the linked heading/comment/date locator; no raw page capture is claimed. Exact tool access timestamps are UNKNOWN; review window is recorded in source-map.json.

<a id="e12"></a>

## E12 — High Resolution Time 3

[High Resolution Time 3](https://www.w3.org/TR/2026/WD-hr-time-3-20260901/). Working Draft 2026-09-01.

**Locator:** §2.1 clocks and background timer paragraph; performance.now.

**Independent judgment:** Independent clock versus delayed handler distinction supported.

**Condition/limit:** Monotonic time within the relevant origin is independent of system-clock adjustment. UA throttling/freezing of background callbacks does not turn the clock into a guarantee that a scheduled Stop executes promptly.

Local evidence: [hrtime-wd20260901.html](hrtime-wd20260901.html), [hrtime-wd20260901-readable.txt](hrtime-wd20260901-readable.txt), [hrtime-wd20260901.html.retrieval.json](hrtime-wd20260901.html.retrieval.json).

<a id="e13"></a>

## E13 — HTML page visibility

[HTML page visibility](https://html.spec.whatwg.org/multipage/interaction.html#page-visibility). Living Standard retrieved 2026-10-10.

**Locator:** §6.2 system visibility update, queued global task and visibilitychange.

**Independent judgment:** Hidden-page signal policy supported; instantaneous release explicitly disclaimed.

**Condition/limit:** UA determines visibility and queues the update/event. Signal-driven application stopping is a policy with scheduling limitations, not a hard realtime bound.

Evidence is the independently opened primary page at the linked heading/comment/date locator; no raw page capture is claimed. Exact tool access timestamps are UNKNOWN; review window is recorded in source-map.json.

<a id="e14"></a>

## E14 — WebKit Features for Safari 27.0

[WebKit Features for Safari 27.0](https://webkit.org/blog/18325/webkit-features-for-safari-27-0/). Safari 27.0; 2026-09-17.

**Locator:** Updating to Safari 27; Media and resolved issues; web extraction line 1241 for OS availability.

**Independent judgment:** F1 stale Safari anchor correction supported.

**Condition/limit:** Comes with macOS 27 Golden Gate and is separately available on macOS 26/15. Microphone AudioSession and OverconstrainedError fixes are listed. No MediaRecorder MIME change is announced; silence is not proof of persistence/regression. Final selects two older supported OS lanes rather than every current OS.

Evidence is the independently opened primary page at the linked heading/comment/date locator; no raw page capture is claimed. Exact tool access timestamps are UNKNOWN; review window is recorded in source-map.json.

<a id="e15"></a>

## E15 — New WebKit Features in Safari 14.1

[New WebKit Features in Safari 14.1](https://webkit.org/blog/11648/new-webkit-features-in-safari-14-1/). Safari 14.1; 2021-04-29.

**Locator:** MediaRecorder API heading.

**Independent judgment:** F4 historical support and added locator are correct.

**Condition/limit:** Historical API introduction refutes blanket denial. It supplies no complete current recording/playback format matrix.

Evidence is the independently opened primary page at the linked heading/comment/date locator; no raw page capture is claimed. Exact tool access timestamps are UNKNOWN; review window is recorded in source-map.json.

<a id="e16"></a>

## E16 — Apple Safari 18.4 release notes

[Apple Safari 18.4 release notes](https://developer.apple.com/documentation/safari-release-notes/safari-18_4-release-notes). Safari 18.4 released notes.

**Locator:** Media New Features; official DocC JSON endpoint https://developer.apple.com/tutorials/data/documentation/safari-release-notes/safari-18_4-release-notes.json.

**Independent judgment:** Independent second primary source confirms Ogg/recording distinction.

**Condition/limit:** Generic Ogg Opus/Vorbis support and explicit WebM MediaRecorder support are separate release bullets. This supplies no claim that Ogg is a recorder export container.

Local evidence: [apple-safari18.4.json](apple-safari18.4.json), [apple-safari18.4-retrieval.json](apple-safari18.4-retrieval.json).

<a id="e17"></a>

## E17 — WebKit Cocoa recorder implementation

[WebKit Cocoa recorder implementation](https://github.com/WebKit/WebKit/blob/73f39d84ea9d4071994214373efbde3665402b05/Source/WebCore/platform/mediarecorder/MediaRecorderPrivateAVFImpl.cpp). Immutable WPE 2.54.0 commit 73f39d84ea9d4071994214373efbde3665402b05; historical comparator webkitgtk-2.48.0.

**Locator:** MediaRecorderPrivateAVFImpl::isTypeSupported, lines 53–99 in downloaded 2.54 source.

**Independent judgment:** Recorded source restricts this recorder implementation to MP4 and enabled WebM, not Ogg.

**Condition/limit:** Cocoa source is a recorder operation check, not an observation of any installed Safari 27 binary. WebM has compile/settings conditions. An unrelated release tag identifies the source revision, not a tested Safari version.

Local evidence: [webkit-254-recorder.cpp](webkit-254-recorder.cpp), [webkit-254-recorder-retrieval.json](webkit-254-recorder-retrieval.json), [webkit-248-recorder.cpp](webkit-248-recorder.cpp), [webkit-248-recorder-retrieval.json](webkit-248-recorder-retrieval.json), [webkit-tags.json](webkit-tags.json), [webkit-tags-retrieval.json](webkit-tags-retrieval.json).

<a id="e18"></a>

## E18 — Chrome 155 MediaRecorder implementation

[Chrome 155 MediaRecorder implementation](https://chromium.googlesource.com/chromium/src/+/refs/tags/155.0.8059.39/third_party/blink/renderer/modules/mediarecorder/media_recorder_handler.cc). Chrome release tag 155.0.8059.39; companion media_recorder.cc same tag.

**Locator:** CanSupportMimeType lines 218–254; codec lists 270–344; AAC runtime check 449–453; Initialize 469–471; recorder isTypeSupported 391–409.

**Independent judgment:** Implementation inspected to avoid treating the 2026 draft exception as observed current browser behavior.

**Condition/limit:** Constructor and public probe use the same codec support function in this snapshot; caller distinguishes telemetry. AAC additionally requires a supported Mojo audio encoder. Build configuration and actual encoder resources still matter. No browser run was performed.

Local evidence: [chrome155-handler-cc.cpp](chrome155-handler-cc.cpp), [chrome155-handler-cc-retrieval.json](chrome155-handler-cc-retrieval.json), [chrome155-recorder-cc.cpp](chrome155-recorder-cc.cpp), [chrome155-recorder-cc-retrieval.json](chrome155-recorder-cc-retrieval.json).

<a id="e19"></a>

## E19 — WebCodecs

[WebCodecs](https://www.w3.org/TR/2026/WD-webcodecs-20261007/). Working Draft 2026-10-07.

**Locator:** §5 AudioEncoder interface/support; §7.4 codec string; encoded audio chunks.

**Independent judgment:** Encoding-versus-container qualification supported.

**Condition/limit:** WebCodecs exposes raw/encoded chunks and codec configuration checks; encoded media is not containerized. Selecting it still leaves file muxing, queues, resource lifecycle and output verification.

Local evidence: [webcodecs-wd20261007.html](webcodecs-wd20261007.html), [webcodecs-wd20261007-readable.txt](webcodecs-wd20261007-readable.txt), [webcodecs-wd20261007.html.retrieval.json](webcodecs-wd20261007.html.retrieval.json).

<a id="e20"></a>

## E20 — Media Capabilities

[Media Capabilities](https://www.w3.org/TR/2026/WD-media-capabilities-20260609/). Working Draft 2026-06-09; independently retrieved 2026-10-10.

**Locator:** §2.1.3 MediaEncodingType; encodingInfo algorithm.

**Independent judgment:** Independent lead for the newer-codec probe condition; no universal support promise.

**Condition/limit:** type record addresses recording configurations rather than decoding; it is the alternative pointed to by the dated recording draft for precise/newer codecs. Implementations and exact profiles require testing.

Local evidence: [media-capabilities-wd20260609.html](media-capabilities-wd20260609.html), [media-capabilities-wd20260609-readable.txt](media-capabilities-wd20260609-readable.txt), [media-capabilities-wd20260609.html.retrieval.json](media-capabilities-wd20260609.html.retrieval.json).

