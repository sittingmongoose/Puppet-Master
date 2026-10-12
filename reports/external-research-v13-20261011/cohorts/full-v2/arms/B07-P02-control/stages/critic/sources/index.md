# Critic source index — B07-P02-control

This index maps the investigator’s original source IDs to the independent records in [source-map.json](../source-map.json). SRC-001 through SRC-012 retain their original identities; SRC-013 through SRC-015 are separate supplemental records. Evidence is limited to standards, vendor documentation, upstream code/caller pages, and release histories. No downloaded code or test suite was run.

| ID | Checked source | Exact URL |
|---|---|---|
| SRC-001 | W3C Media Fragments 1.0 | [Recommendation](https://www.w3.org/TR/media-frags/) |
| SRC-002 | W3C Web Annotation, selector boundaries and stale-anchor warning | [Recommendation](https://www.w3.org/TR/annotation-model/) |
| SRC-003 | WCAG 2.2, keyboard/color/focus/status messages | [Recommendation](https://www.w3.org/TR/WCAG22/) |
| SRC-004 | WAI-ARIA APG slider | [Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) |
| SRC-005 | Peaks.js v3.4.2 API | [Pinned API](https://github.com/bbc/peaks.js/blob/v3.4.2/doc/API.md) |
| SRC-006 | Peaks.js v3.4.2 caller | [Pinned demo](https://github.com/bbc/peaks.js/blob/v3.4.2/demo/index.html) |
| SRC-007 | WaveSurfer.js Regions source | [8.0.0 source](https://github.com/katspaugh/wavesurfer.js/blob/8.0.0/src/plugins/regions.ts) |
| SRC-008 | WaveSurfer.js fix history | [Releases](https://github.com/katspaugh/wavesurfer.js/releases) |
| SRC-009 | Audacity labels, navigation and limits | [Manual](https://manual.audacityteam.org/man/label_tracks.html) |
| SRC-010 | GStreamer seek modes | [Design documentation](https://gstreamer.freedesktop.org/documentation/additional/design/seeking.html) |
| SRC-011 | Investigator-listed Apple URL; direct open errored, identity preserved | [Original URL](https://developer.apple.com/documentation/avfoundation/avplayer/seek%28to%3Atolerancebefore%3Atoleranceafter%3Acompletionhandler%3A) |
| SRC-012 | Web Audio decodeAudioData | [API 1.1](https://webaudio.github.io/web-audio-api/) |
| SRC-013 | Apple seek tolerances | [Method documentation](https://developer.apple.com/documentation/avfoundation/avplayer/seek%28to%3Atolerancebefore%3Atoleranceafter%3A%29?changes=_1) |
| SRC-014 | Apple interrupted-seek completion | [Method documentation](https://developer.apple.com/documentation/avfoundation/avplayer/seek%28to%3Acompletionhandler%3A%29-75bls?changes=_3) |
| SRC-015 | Peaks.js release status | [Release history](https://github.com/bbc/peaks.js/releases) |

The Apple URL from SRC-011 is not silently rebound: SRC-013 and SRC-014 separately record the official pages checked for tolerance and interruption claims.