# ER12 A3-02 critic source index

The carried IDs S1–S12 retain their investigator meanings and URLs. Critic source C1 is new. Access times are recorded as a conservative UTC window in `../source-map.json`, because the web tool did not expose a per-page timestamp. Links point to primary specifications/vendor documentation/issues and the upstream third-party README where applicable.

## Governing standards

- [S1 — W3C MediaStream Recording, 2026-03-16 Working Draft](https://www.w3.org/TR/2026/WD-mediastream-recording-20260316/): §§2.1, 2.3, 2.4; constructor/start failure, MIME and preflight limits, timeslice minimum, final chunk ordering, non-playable individual chunk allowance, and complete-concatenation playability.
- [S2 — W3C Media Capture and Streams](https://www.w3.org/TR/mediacapture-streams/): §§4.3.1, devicechange, getSettings; track ending/revocation, stop cleanup, event and settings semantics.
- [S3 — W3C Web Audio API 1.1](https://www.w3.org/TR/webaudio/): §§1.32.3, 2.5–2.6; AudioWorklet execution, render quantum, and real-time deadline context.
- [C1 — W3C Media Capabilities](https://www.w3.org/TR/media-capabilities/): §§2.1.1, 2.1.3, 2.1.8; `record` configuration and audio `contentType`.

## Release and implementation history

- [S4 — WebKit Safari 14.1](https://webkit.org/blog/11648/new-webkit-features-in-safari-14-1/): Safari 14.1 MediaStream Recording with platform default encodings; adjacent WebM statement concerns playback.
- [S5 — WebKit Safari 18.4](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/): MediaRecorder container/codec announcements and explicit Ogg OS-version scope.
- [S6 — WebKit Safari 26.0](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/): ALAC/PCM MediaRecorder example and AudioEncoder/AudioDecoder.
- [S7 — Apple Safari 17.4 Release Notes](https://developer.apple.com/documentation/safari-release-notes/safari-17_4-release-notes): pause/timeslice resolved issue 115979604. Direct body extraction failed; an official Apple indexed excerpt was readable.
- [S8 — WebKit Bug 258567](https://bugs.webkit.org/show_bug.cgi?id=258567): Safari 16 incident conditions, reporter workaround, maintainer non-reproduction, and later RESOLVED FIXED status/commit.
- [S9 — WebKit Bug 243837](https://bugs.webkit.org/show_bug.cgi?id=243837): iOS 15 pause/requestData/stop report and exact fixed commit.
- [S10 — Chrome Developers MediaRecorder article](https://developer.chrome.com/blog/mediarecorder): dated Chrome 47/48/49 history, MIME examples, default and preflight discussion.
- [S11 — Chromium muxer README at pinned commit](https://chromium.googlesource.com/chromium/src/media/+/042aaa189184e3d303c01946589eb84926d91000/muxers/README.md): pinned WebM/MP4 audio muxer codec list; not a branded Chrome release claim.
- [S12 — opus-media-recorder package](https://www.npmjs.com/package/opus-media-recorder?activeTab=code) / [upstream README](https://github.com/kbumsik/opus-media-recorder): third-party WASM/worker architecture and WAV chunk limitation. Registry version metadata was not independently confirmed in this critic stage.

No browser execution or audio observation is represented by these sources. For exact version/commit, locator, condition, applicability, and observed operation, see the navigable records in `../source-map.json`.
