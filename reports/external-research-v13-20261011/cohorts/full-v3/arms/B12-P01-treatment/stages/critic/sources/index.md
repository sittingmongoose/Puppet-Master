# Critic source index

This independent review checked the listed primary documentation and implementation sources. Source identities, access time, version, locator, observed operation, conditions and applicability are recorded in [source-map.json](../source-map.json). IDs preserve the investigator’s carried keys.

## Timed text, interchange, and language

- [SRC-WEBVTT-2026-CRD](https://www.w3.org/TR/2026/CRD-webvtt1-20260520/) — W3C Candidate Recommendation Draft (20 May 2026); cue ordering/overlap, Unicode normalization, single data kind, features, and status.
- [SRC-TTML2-REC-2018](https://www.w3.org/TR/2018/REC-ttml2-20181108/) — W3C Recommendation (8 Nov 2018); frame/tick/time-base parameters.
- [SRC-MATROSKA-ELEMENTS](https://www.matroska.org/technical/elements.html) and [SRC-MATROSKA-NOTES](https://www.matroska.org/technical/notes.html) — official living spec; track default flag and player-selection hint.
- [SRC-ELAN-MANUAL-MEDIA](https://www.mpi.nl/tools/elan/docs/manual/Sec_Media_Files_and_Annotation_Files.html) and [SRC-ELAN-MANUAL-TIERS](https://www.mpi.nl/tools/elan/docs/manual/Sec_Tier.html) — official manual; EAF data separation and tier constraints.
- [SRC-PRAAT-TEXTGRID](https://praat.org/manual/TextGrid.html) — official manual; interval and point tiers.
- [SRC-EPUB33-REC-2026](https://www.w3.org/TR/2026/REC-epub-33-20260113/) — W3C Recommendation (13 Jan 2026); OCF ZIP container and media overlays.
- [SRC-RFC5646](https://www.rfc-editor.org/rfc/rfc5646.html) — RFC 5646 (2009); language-tag case behavior.
- [SRC-RFC3629](https://www.rfc-editor.org/rfc/rfc3629.html) — RFC 3629 (2003); UTF-8 validity and invalid-sequence handling.

## Package parsing and implementation behavior

- [SRC-PY-ZIPFILE-3.14.8](https://docs.python.org/3.14/library/zipfile.html) — versioned Python 3.14.8 docs; duplicate archive member identity and path-handling cautions.
- [SRC-RFC8259](https://www.rfc-editor.org/rfc/rfc8259.html) — RFC 8259 (2017); duplicate JSON member names.
- [SRC-FFMPEG-WEBVTT-N9.0.2](https://github.com/FFmpeg/FFmpeg/blob/n9.0.2/libavformat/webvttdec.c) — tagged FFmpeg n9.0.2 source; exact parser behavior.
- [SRC-FFMPEG-SRT-N9.0.2](https://github.com/FFmpeg/FFmpeg/blob/n9.0.2/libavformat/srtenc.c) — tagged FFmpeg n9.0.2 source; SRT muxer stream limit.
- [SRC-FFMPEG-CLI-DOCS](https://ffmpeg.org/ffmpeg.html) — official current CLI docs; conditional automatic versus explicit stream mapping.
- [SRC-FFMPEG-SRT-HISTORY](https://ffmpeg.org/pipermail/ffmpeg-cvslog/2024-March/141538.html) — FFmpeg primary commit-list archive (March 2024); muxer one-stream-per-type history.
- [SRC-FFMPEG-WEBVTT-HISTORY](https://ffmpeg.org/pipermail/ffmpeg-devel/2025-June/344877.html) — FFmpeg developer-list message (10 Jun 2025); opinion/review on parser tolerance, not a merged behavior claim.
