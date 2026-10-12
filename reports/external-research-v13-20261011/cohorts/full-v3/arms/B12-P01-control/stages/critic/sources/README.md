# Critic source index — B12-P01-control

Source IDs and original identities are preserved from the investigator map; critic access and verification status are in [source-map.json](../source-map.json). A carried-only or partial record is not independent confirmation.

| ID | Source | Locator | Critic status |
|---|---|---|---|
| S01 | [WebVTT: The Web Video Text Tracks Format](https://www.w3.org/TR/webvtt1/) | Status lines 2-6 and 43-46; §§3.3-3.4; §§4.1-4.5, especially cue timing/order/overlap, cue text components, regions, and settings | independently_verified |
| S02 | [WHATWG HTML Standard: media and track elements](https://html.spec.whatwg.org/multipage/media.html) | Track element section; examples around track kind, srclang, label, and default; constraints at lines 643-699 in the accessed version | independently_verified |
| S03 | [Timed Text Markup Language 2 (TTML2)](https://www.w3.org/TR/ttml2/) | §5 profiling; §8 content and timing vocabulary; §10 styling; §12 timing/timeContainer; §14 metadata and xml:lang | partially_verified |
| S04 | [RFC 9559: Matroska Media Container Format Specification](https://www.rfc-editor.org/rfc/rfc9559.html) | §5.1.4 TrackEntry; §11 timestamps; §§18-19 track flags and selection; §21 attachments; §22 cues; §27 media types | partially_verified |
| S05 | [Matroska Specification Notes](https://www.matroska.org/technical/notes.html) | TimestampScale and Segment/Track tick notes; Track Flags; Subtitle Selection; font attachment notes | partially_verified |
| S06 | [FFmpeg General Documentation: subtitle format support matrix](https://ffmpeg.org/general.html) | Supported file formats, §2.5 Subtitle Formats and the X/E legend | carried_only |
| S07 | [FFmpeg SRT muxer implementation](https://github.com/FFmpeg/FFmpeg/blob/n8.1.1/libavformat/srtenc.c) | srt_write_header and srt_write_packet; comments on encoding, line endings, and BOM | independently_verified |
| S08 | [Aegisub SRT export implementation](https://github.com/TypesettingTools/Aegisub/blob/43af875ea01e80052cc6c44f24fc8c5258261c6d/src/subtitle_format_srt.cpp) | SRTSubtitleFormat::CanSave and ConvertTags | independently_verified |
| S09 | [Aegisub 3.5.0 release notes](https://github.com/TypesettingTools/Aegisub/releases/tag/v3.5.0) | Release security note at lines 151-168 | independently_verified |
| S10 | [Aegisub issue 614: invisible Unicode at SRT file start](https://github.com/TypesettingTools/Aegisub/issues/614) | Issue description, especially the reporter's test observations and BOM exception | partially_verified |
| S11 | [The .h5p Specification](https://h5p.org/documentation/developers/h5p-specification) | Numbered package components 1-5 | not_verified_access_error |
| S12 | [H5P subtitles, captions, and descriptions](https://help.h5p.com/hc/en-us/articles/25322748576669-Subtitles-Captions-and-Descriptions) | VTT track upload instructions and the external-video-platform limitation | independently_verified |
| S13 | [OpenTimelineIO documentation at release v0.18.1](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/v0.18.1/docs/index.rst) | Overview lines 194-198 | independently_verified |
| S14 | [OpenTimelineIO timeline structure at release v0.18.1](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/v0.18.1/docs/tutorials/otio-timeline-structure.md) | Timeline Structure, Rendering, and Multiple Tracks sections | partially_verified |
| S15 | [1EdTech Common Cartridge v1.3 Profile: Implementation](https://www.imsglobal.org/cc/ccv1p3/imscc_Implementation-v1p3.html) | Profile overview; content packaging, resources, metadata, and conformance sections | independently_verified |
| S16 | [RFC 8493: The BagIt File Packaging Format](https://datatracker.ietf.org/doc/html/rfc8493) | §§2.1-2.4 and 3 for bag/manifests/validity; §§4.2 and 5.2-5.4 for fetch and security considerations | partially_verified |
| S17 | [Python 3.13 zipfile documentation](https://docs.python.org/3.13/library/zipfile.html) | ZipFile.open duplicate-name note; zipfile.Path safety note; Decompression pitfalls | partially_verified |
| S18 | [zip-rs CVE-2025-29787 security advisory](https://github.com/advisories/GHSA-94vh-gphv-8pm8) | Affected/patched versions; vulnerability summary and remediation references | independently_verified |
| S19 | [zip-rs v2.3.0 patch release](https://github.com/zip-rs/zip2/releases/tag/v2.3.0) | Release tag v2.3.0 and advisory-linked remediation commit | not_verified |
| S20 | [Aegisub ASS format test sample](https://github.com/TypesettingTools/Aegisub/blob/43af875ea01e80052cc6c44f24fc8c5258261c6d/docs/specs/ass-format-tests.ass) | Script Info, V4+ Styles, Events, and override-tag test cases | not_verified |
