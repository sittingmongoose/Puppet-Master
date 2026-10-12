# Reviser source index

Source IDs are stable keys carried forward from the frozen investigator source map and referenced in provisional-final.md. These are bounded source notes, not copied source text. The exact source identity, version, locator, access time, observed operation, governing conditions, and applicability are recorded in ../source-map.json.

## Timed text and package models

- [SRC-WEBVTT-2026-CRD](https://www.w3.org/TR/2026/CRD-webvtt1-20260520/) — W3C Candidate Recommendation Draft, 2026-05-20. Sections 2.2, 3, 4.4–4.5, 6, 7–8. External timed text, ordered cue starts, cue settings, no Unicode normalization, renderer-dependent styling.
- [SRC-TTML2-REC-2018](https://www.w3.org/TR/2018/REC-ttml2-20181108/) — W3C Recommendation, 2018-11-08. Interchange vocabulary, profiles, timing and styling.
- [SRC-TTML2-CR-2020](https://www.w3.org/TR/2020/CR-ttml2-20200128/) — W3C Candidate Recommendation snapshot, 2020-01-28. Second Edition draft used only to identify time/profile complexity; not elevated to Recommendation.
- [SRC-EPUB33-REC-2026](https://www.w3.org/TR/2026/REC-epub-33-20260113/) — W3C Recommendation, 2026-01-13. ZIP-based package, manifest/resources, OCF path rules, and media overlays for synchronized narration.
- [SRC-MATROSKA-ELEMENTS](https://www.matroska.org/technical/elements.html) and [SRC-MATROSKA-NOTES](https://www.matroska.org/technical/notes.html) — living Matroska specification. Track identities, language/default/forced flags, and player selection semantics.

## Language annotation approaches

- [SRC-ELAN-EAF3](https://www.mpi.nl/tools/elan/EAF_Annotation_Format_3.0_and_ELAN.pdf) — official EAF 3.0 format reference. Tiers, parent relationships, alignable/reference annotations, media descriptors, and shared time slots.
- [SRC-ELAN-MANUAL-MEDIA](https://www.mpi.nl/tools/elan/docs/manual/Sec_Media_Files_and_Annotation_Files.html) and [SRC-ELAN-MANUAL-TIERS](https://www.mpi.nl/tools/elan/docs/manual/Sec_Tier.html) — current ELAN manual pages. Annotation and tier data are stored in the annotation file; media is linked separately; tier types express alignment and parent constraints.
- [SRC-PRAAT-TEXTGRID](https://praat.org/manual/TextGrid.html) and [SRC-PRAAT-TEXTGRID-FORMAT](https://praat.org/manual/TextGrid_file_formats.html) — current Praat manual. Multi-tier interval and point annotation; text file formats have compatibility/encoding details.

## Parser, package and content safety

- [SRC-PY-ZIPFILE-3.14.8](https://docs.python.org/3.14/library/zipfile.html) — CPython 3.14.8 documentation. Duplicate archive names, ZIP64/compression support, CRC checks, path sanitization differences, and explicit warning to inspect untrusted archives.
- [SRC-RFC8259](https://www.rfc-editor.org/rfc/rfc8259.html) — RFC 8259 (2017), JSON member-name interoperability.
- [SRC-RFC3629](https://www.rfc-editor.org/rfc/rfc3629.html) — RFC 3629 (2003), UTF-8 validity and invalid-sequence handling.
- [SRC-RFC5646](https://www.rfc-editor.org/rfc/rfc5646.html) — RFC 5646 / BCP 47 (2009), language tags.

## Real implementation and history

- [SRC-FFMPEG-WEBVTT-N9.0.2](https://github.com/FFmpeg/FFmpeg/blob/n9.0.2/libavformat/webvttdec.c) — FFmpeg released-tag implementation. Demuxer behavior for STYLE/REGION chunks, millisecond timestamp conversion, cue identifiers/settings, and malformed timestamp handling.
- [SRC-FFMPEG-SRT-N9.0.2](https://github.com/FFmpeg/FFmpeg/blob/n9.0.2/libavformat/srtenc.c) — FFmpeg released-tag SubRip muxer; constrained one-stream output.
- [SRC-FFMPEG-CLI-DOCS](https://ffmpeg.org/ffmpeg.html) — online FFmpeg CLI documentation, stream selection, mapping, metadata, and disposition defaults; release-independent doc URL.
- [SRC-FFMPEG-WEBVTT-HISTORY](https://ffmpeg.org/pipermail/ffmpeg-devel/2025-June/344877.html) — 2025-06-10 parser discussion; records a disagreement over strict versus permissive WebVTT parsing, not proof that a proposed patch merged.
- [SRC-FFMPEG-SRT-HISTORY](https://ffmpeg.org/pipermail/ffmpeg-cvslog/2024-March/141538.html) — 2024-03 muxer commit record introducing a general one-stream-per-type limit; SRT specifically identified as single-subtitle-stream.

The investigator used web search/open only to read the listed sources. No package samples, downloaded code, media or plan content were inspected here.


## Reviser primary-source rechecks

These exact sources were reopened after the critic binding; full access windows and locators are in ../source-map.json.

- [SRC-WEBVTT-2026-CRD](https://www.w3.org/TR/2026/CRD-webvtt1-20260520/) — status, one-kind-per-file requirement, cue ordering/overlap, and Unicode processing.
- [SRC-ELAN-MANUAL-TIERS](https://www.mpi.nl/tools/elan/docs/manual/Sec_Tier.html) — tier and parent-alignment constraints.
- [SRC-ELAN-MANUAL-MEDIA](https://www.mpi.nl/tools/elan/docs/manual/Sec_Media_Files_and_Annotation_Files.html) — annotations/timing live in the annotation file; media may be separately linked.
- [SRC-FFMPEG-SRT-N9.0.2](https://github.com/FFmpeg/FFmpeg/blob/n9.0.2/libavformat/srtenc.c) — tagged muxer stream limit, scoped to this FFmpeg implementation.

The bound independent critic also recorded its own source observations for 17 of these stable IDs in ../source-map.json. Each is nested as an independent observation; identities are not silently replaced.
