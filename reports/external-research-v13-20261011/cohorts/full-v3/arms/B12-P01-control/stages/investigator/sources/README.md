# Primary-source index

This index points to the exact source IDs cited in ../discovery.md and the later investigator draft. Full URL, release/commit status, access UTC, source operation, governing conditions, and applicability are recorded in ../source-map.json.

| ID | Source and fixed locator | What it supports |
| --- | --- | --- |
| S01 | [W3C WebVTT](https://www.w3.org/TR/webvtt1/) — 2026-05-20 CR Draft; §§3–4, cue timing/overlap/formatting | Web text tracks and draft status |
| S02 | [WHATWG HTML media tracks](https://html.spec.whatwg.org/multipage/media.html) — track element and language/default rules | Track kind, srclang, labels, defaults |
| S03 | [W3C TTML2](https://www.w3.org/TR/ttml2/) — 2018-11-08 Recommendation; profiles, timing, language, styling | Rich timed-text interchange with profile conditions |
| S04 | [RFC 9559 Matroska](https://www.rfc-editor.org/rfc/rfc9559.html) — §§5, 11, 18–22 | Container tracks, timing, flags, attachments |
| S05 | [Matroska specification notes](https://www.matroska.org/technical/notes.html) — timestamps and track selection | Defaults and selection hints |
| S06 | [FFmpeg general support matrix](https://ffmpeg.org/general.html) — §2.5 | Directional and build-dependent subtitle support |
| S07 | [FFmpeg SRT writer at n8.1.1](https://github.com/FFmpeg/FFmpeg/blob/n8.1.1/libavformat/srtenc.c) — srt_write_header / srt_write_packet | Concrete timing and packet omission behavior |
| S08 | [Aegisub SRT exporter at v3.5.0](https://github.com/TypesettingTools/Aegisub/blob/43af875ea01e80052cc6c44f24fc8c5258261c6d/src/subtitle_format_srt.cpp) — CanSave / ConvertTags | Explicit loss guard in a real exporter |
| S09 | [Aegisub v3.5.0 release](https://github.com/TypesettingTools/Aegisub/releases/tag/v3.5.0) — security note | Crafted-subtitle Automation execution history |
| S10 | [Aegisub issue 614](https://github.com/TypesettingTools/Aegisub/issues/614) — issue description | One reported invisible-Unicode SRT parsing failure |
| S11 | [H5P .h5p specification](https://h5p.org/documentation/developers/h5p-specification) — package components | ZIP tree and library-specific semantics |
| S12 | [H5P subtitles/captions/descriptions](https://help.h5p.com/hc/en-us/articles/25322748576669-Subtitles-Captions-and-Descriptions) — VTT upload section | Current product-specific track import path |
| S13 | [OpenTimelineIO v0.18.1 overview](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/v0.18.1/docs/index.rst) — Overview | Timeline model and external media references |
| S14 | [OpenTimelineIO v0.18.1 timeline structure](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/v0.18.1/docs/tutorials/otio-timeline-structure.md) — rendering/multiple tracks | Overlap via transitions and application-specific effects |
| S15 | [1EdTech Common Cartridge v1.3](https://www.imsglobal.org/cc/ccv1p3/imscc_Implementation-v1p3.html) — implementation guide | Learning-course package alternative |
| S16 | [RFC 8493 BagIt](https://datatracker.ietf.org/doc/html/rfc8493) — manifests, validation, fetch, security | Payload checksums; remote-fetch caveat |
| S17 | [Python 3.13.16 zipfile](https://docs.python.org/3.13/library/zipfile.html) — duplicate names/path/decompression notes | ZIP path, duplicate-name, and resource boundaries |
| S18 | [zip-rs GHSA-94vh-gphv-8pm8](https://github.com/advisories/GHSA-94vh-gphv-8pm8) — CVE-2025-29787 | Symlink-mediated extraction escape and affected releases |
| S19 | [zip-rs v2.3.0 patch release](https://github.com/zip-rs/zip2/releases/tag/v2.3.0) — advisory-linked fix | Patched-version boundary |
| S20 | [Aegisub ASS test sample at v3.5.0](https://github.com/TypesettingTools/Aegisub/blob/43af875ea01e80052cc6c44f24fc8c5258261c6d/docs/specs/ass-format-tests.ass) — styles/events/overrides | Real authoring fixture, not a normative ASS spec |
