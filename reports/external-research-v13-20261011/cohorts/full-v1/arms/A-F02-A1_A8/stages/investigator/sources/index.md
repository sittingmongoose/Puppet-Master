# Source index

Source records are in the root source-map.json. IDs are stable within this stage and are cited from discovery.md; do not rebind them. Source-map records carry bounded UTC access windows: SRC-01–SRC-11 were read during 00:31:25–00:33:33; SRC-12–SRC-14 during 00:33:33–00:37:22; SRC-10 was rechecked through 00:42:08, all on 2026-10-12. Individual web-call timestamps were not exposed, so bounded windows are recorded rather than invented per page.

| ID | Source | Version / locator | Use |
|---|---|---|---|
| [SRC-01](https://github.com/FFmpeg/FFmpeg/blob/n8.1.1/doc/ffprobe.texi) | FFmpeg ffprobe manual | n8.1.1; JSON, stream/container/error sections | Probe fields and output caveats |
| [SRC-02](https://github.com/FFmpeg/FFmpeg/blob/n8.1.1/tests/fate/ffprobe.mak) | FFmpeg FATE call/test | n8.1.1; JSON writer target | Upstream regression coverage |
| [SRC-03](https://github.com/FFmpeg/FFmpeg/blob/n8.1.1/doc/formats.texi) | libavformat options | n8.1.1; probing size/time defaults | Completeness and latency |
| [SRC-04](https://github.com/MediaArea/MediaInfo/releases/tag/v26.10) | MediaInfo release notes | v26.10 / f057dd3 | Recent channel and VBR fixes |
| [SRC-05](https://github.com/MediaArea/MediaInfoLib/blob/v26.10/Source/Resource/Text/Stream/Audio.csv) | MediaInfoLib audio fields | v26.10; channel/sample fields | Metadata normalization |
| [SRC-06](https://github.com/MediaArea/MediaInfo/issues/373) | Duration discrepancy issue | #373, open at access | Conflicting duration provenance |
| [SRC-07](https://github.com/MediaArea/MediaInfo/issues/1103) | JSON cardinality issue | #1103 / PR #2295, open at access | Normalize multi-file JSON |
| [SRC-08](https://github.com/richardlehane/siegfried/blob/v1.11.9/README.md) | Siegfried docs | v1.11.9 / 7fb430b | Signature identification |
| [SRC-09](https://github.com/libsndfile/libsndfile/blob/1.2.2/docs/api.md) | libsndfile API | 1.2.2; SF_INFO and RAW exception | Narrow audio alternative |
| [SRC-10](https://www.w3.org/TR/WCAG22/) | W3C WCAG | Recommendation 2.2 | Keyboard and textual status |
| [SRC-11](https://www.rfc-editor.org/rfc/rfc8493) | BagIt | RFC 8493 v1.0 | Portable checksum handoff |
| [SRC-12](https://www.w3.org/TR/webaudio/) | W3C Web Audio API | API 1.1; channel splitter | Live per-channel audition on a supported decode path |
| [SRC-13](https://www.w3.org/TR/webvtt1/) | W3C WebVTT | WebVTT 1; cue timings | Preserve existing time alignment |
| [SRC-14](https://www.sqlite.org/lang_transaction.html) | SQLite transactions | Current docs; one-writer / busy conditions | Per-item restart checkpoint option |
