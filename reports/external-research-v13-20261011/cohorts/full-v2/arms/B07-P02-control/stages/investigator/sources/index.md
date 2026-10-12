# Source index — investigator

This index maps immutable source IDs to their exact source records in [source-map.json](../source-map.json). The records include access UTC, release/version, locator, observed operation, behavior/default/exception, and applicability. IDs are not rebound if a source changes.

| ID | Source / scope | Pinned location |
|---|---|---|
| SRC-001 | W3C Media Fragments 1.0 | [Recommendation §4.2.1](https://www.w3.org/TR/media-frags/) |
| SRC-002 | W3C Web Annotation Data Model | [Recommendation selectors](https://www.w3.org/TR/annotation-model/) |
| SRC-003 | WCAG 2.2 | [W3C Recommendation](https://www.w3.org/TR/WCAG22/) |
| SRC-004 | WAI-ARIA APG Slider Pattern | [Current pattern page](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) |
| SRC-005 | Peaks.js API | [v3.4.2 tag / API.md](https://github.com/bbc/peaks.js/blob/v3.4.2/doc/API.md) |
| SRC-006 | Peaks.js API caller | [v3.4.2 demo/index.html](https://github.com/bbc/peaks.js/blob/v3.4.2/demo/index.html) |
| SRC-007 | WaveSurfer.js Regions code | [8.0.0 tag / regions.ts](https://github.com/katspaugh/wavesurfer.js/blob/8.0.0/src/plugins/regions.ts) |
| SRC-008 | WaveSurfer.js issue/fix/release trail | [Upstream releases](https://github.com/katspaugh/wavesurfer.js/releases) |
| SRC-009 | Audacity interaction/export reference | [Label Tracks manual](https://manual.audacityteam.org/man/label_tracks.html) |
| SRC-010 | GStreamer seek precision | [Seeking design doc](https://gstreamer.freedesktop.org/documentation/additional/design/seeking.html) |
| SRC-011 | Apple AVPlayer seek precision | [seek with tolerance API](https://developer.apple.com/documentation/avfoundation/avplayer/seek%28to%3Atolerancebefore%3Atoleranceafter%3Acompletionhandler%3A)) |
| SRC-012 | Web Audio decoding | [Web Audio API 1.1](https://webaudio.github.io/web-audio-api/) |

## Research boundaries

Opened primary documentation, one tagged API caller, one tagged implementation file, and release history. No downloaded code was run and no actual implementation, source tests, benchmark, accessibility audit, export, or audio file was executed. The WaveSurfer keydown observation is scoped only to its Regions source file. Audacity is a workflow precedent; Peaks and WaveSurfer are component candidates. No candidate is selected as the product winner.
