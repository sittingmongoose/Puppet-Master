# Source index — B12-P01-control reviser

Source IDs S01–S20 retain their original meanings and exact URLs. Each record in ../source-map.json carries version or commit, access UTC, locator, observed operation, governing condition/default/exception, applicability, and separately attributed critic/reviser review. A passed source claim establishes only the described external source behavior, not this proposed product.

## S01 — WebVTT: The Web Video Text Tracks Format

- Source: [https://www.w3.org/TR/webvtt1/](https://www.w3.org/TR/webvtt1/)
- Version/commit: W3C Candidate Recommendation Draft dated 2026-05-20; exact snapshot linked by the page at https://www.w3.org/TR/2026/CRD-webvtt1-20260520/; explicitly a draft, not a Recommendation
- Locator: Status lines 2-6 and 43-46; §§3.3-3.4; §§4.1-4.5, especially cue timing/order/overlap, cue text components, regions, and settings
- Original access UTC: 2026-10-12T01:05:19Z
- Observed operation: Opened current W3C page and inspected its status/version metadata and cue, timing, region, and formatting clauses.
- Governing condition/default/exception: Cue start times are nondecreasing, each cue end is after its start, and distinct cues may overlap. In-file formatting and layout are a defined subset; cue text includes b/i/u, ruby, voice, language, and text spans. Cue box settings are enumerated. The page warns its current version is a draft that may change.
- Applicability: Multilingual sidecar exchange, overlapping timed cues, relative media timing, format coverage limits, and warning against treating the latest draft as a stable final standard.
- Reviser status: independently_verified_by_reviser; Opened the pinned 2026-05-20 W3C CRD snapshot and inspected status, cue model and timing clauses. Confirmed nondecreasing cue starts, end after start, and distinct cues may overlap; formatting/settings are bounded.

## S02 — WHATWG HTML Standard: media and track elements

- Source: [https://html.spec.whatwg.org/multipage/media.html](https://html.spec.whatwg.org/multipage/media.html)
- Version/commit: Living Standard; no pinned edition or commit exposed by the page
- Locator: Track element section; examples around track kind, srclang, label, and default; constraints at lines 643-699 in the accessed version
- Original access UTC: 2026-10-12T01:05:19Z
- Observed operation: Opened the current standard and inspected the text-track language example and default-track constraints.
- Governing condition/default/exception: The example separates subtitle language (srclang) from label language. A media element may not mark more than one subtitles/captions track as default; labels and presentation defaults do not encode the whole source track semantics.
- Applicability: Track language and kind fields; browser-style track presentation mapping; do not infer content language from display label or assume multiple defaults survive browser export.
- Reviser status: independently_verified_by_reviser; Opened the current WHATWG media/track section. Confirmed subtitle language uses srclang rather than the label language and checked the separate default-track limits.

## S03 — Timed Text Markup Language 2 (TTML2)

- Source: [https://www.w3.org/TR/ttml2/](https://www.w3.org/TR/ttml2/)
- Version/commit: W3C Recommendation, 2018-11-08; stable reference; page points readers to errata
- Locator: §5 profiling; §8 content and timing vocabulary; §10 styling; §12 timing/timeContainer; §14 metadata and xml:lang
- Original access UTC: 2026-10-12T01:05:39Z
- Observed operation: Opened the Recommendation and inspected its status, profile model, timeContainer values, xml:lang examples, and style/region definitions.
- Governing condition/default/exception: TTML supports explicit content/processor profiles; validation and effective behavior depend on the profile. Timed children can be locally parallel or sequential. Language can be inherited or specified per element. Region and style features exceed WebVTT's in-file cue markup, but processors may not implement every profile or property.
- Applicability: Rich interchange option and exact timing/style source; adapters must name a profile and report unsupported features rather than claim all TTML2 documents round-trip.
- Reviser status: independently_verified_by_reviser; Opened the TTML2 Recommendation and checked profile construction and metadata sections. Metadata can be scoped to document/content elements and use foreign namespaces; arbitrary metadata semantics remain application-specific and processors may ignore it.

## S04 — RFC 9559: Matroska Media Container Format Specification

- Source: [https://www.rfc-editor.org/rfc/rfc9559.html](https://www.rfc-editor.org/rfc/rfc9559.html)
- Version/commit: RFC 9559, Standards Track, published 2024-10
- Locator: §5.1.4 TrackEntry; §11 timestamps; §§18-19 track flags and selection; §21 attachments; §22 cues; §27 media types
- Original access UTC: 2026-10-12T01:05:19Z
- Observed operation: Opened the IETF Standards Track text and inspected its schema/table of contents and track/attachment sections.
- Governing condition/default/exception: Matroska models a single audiovisual Segment with typed tracks, timing and track metadata; it also supports attachments. Track flags are selection hints, and actual selection is player-dependent. Text codec and timestamp rules remain codec-specific.
- Applicability: Practical single-media-file alternative with multiple tracks and attached resources; not itself a complete authoring-package model or guarantee of identical rendering.
- Reviser status: carried_from_critic_review_partial; No direct reviser re-open. The critic marked the RFC sections partially verified; retain Matroska as an optional single-media alternative with codec/player conditions.

## S05 — Matroska Specification Notes

- Source: [https://www.matroska.org/technical/notes.html](https://www.matroska.org/technical/notes.html)
- Version/commit: Live project-maintained notes; no pinned revision exposed
- Locator: TimestampScale and Segment/Track tick notes; Track Flags; Subtitle Selection; font attachment notes
- Original access UTC: 2026-10-12T01:05:19Z
- Observed operation: Opened and inspected the current notes for timing defaults, default/forced/accessibility flags, and selection caveats.
- Governing condition/default/exception: With default TimestampScale 1,000,000, one Segment tick is one millisecond; player selection may override Default flags for user preferences. Forced and accessibility flags indicate policy hints, not guarantees.
- Applicability: Do not collapse default/forced/accessibility track metadata into a single boolean or treat a container flag as a deterministic UI selection.
- Reviser status: carried_from_critic_review_partial; No direct reviser re-open. The critic confirmed the timestamp-scale default but did not separately check all player-selection caveats; keep the claim qualified.

## S06 — FFmpeg General Documentation: subtitle format support matrix

- Source: [https://ffmpeg.org/general.html](https://ffmpeg.org/general.html)
- Version/commit: Live documentation; page does not expose a pinned commit or release. The official release index showed FFmpeg 8.1.1 as the latest stable patch during this research window.
- Locator: Supported file formats, §2.5 Subtitle Formats and the X/E legend
- Original access UTC: 2026-10-12T01:05:19Z
- Observed operation: Opened the current support matrix and inspected demux/mux/encode/decode columns and the external-library legend.
- Governing condition/default/exception: The table distinguishes reading/writing operations and uses E for support through an external library. It describes project capability, not the feature set of every packaged binary or an exact fidelity promise.
- Applicability: Candidate local adapter/media tooling for SRT, SSA/ASS, WebVTT and TTML; deployment must pin and probe the actual binary/build and test each selected mapping.
- Reviser status: carried_only_not_independently_verified; Opened the live general documentation and located §2.5, but did not independently inspect its subtitle matrix rows or release-index context. Do not use it to promise an adapter or packaged-binary feature.

## S07 — FFmpeg SRT muxer implementation

- Source: [https://github.com/FFmpeg/FFmpeg/blob/n8.1.1/libavformat/srtenc.c](https://github.com/FFmpeg/FFmpeg/blob/n8.1.1/libavformat/srtenc.c)
- Version/commit: FFmpeg tag n8.1.1
- Locator: srt_write_header and srt_write_packet; comments on encoding, line endings, and BOM
- Original access UTC: 2026-10-12T01:07:59Z
- Observed operation: Opened the source at the named release tag and inspected the SRT writer code.
- Governing condition/default/exception: The writer sets a 1/1000 timestamp time base, accepts only text/SubRip subtitle codecs, and warns then skips a packet when PTS is absent or duration is negative. The code comments identify encoding, newline, and BOM options as TODOs.
- Applicability: Concrete implementation evidence that a widely used conversion library can quantize timestamps and omit invalid packets; use preflight diagnostics and post-write comparisons.
- Reviser status: independently_verified_by_reviser; Opened the n8.1.1 source at srt_write_header/srt_write_packet. Confirmed a 1/1000 timebase, rejection of non-text/SubRip codec, skip on absent PTS or negative duration, and TODO comments for encoding/newlines/BOM.

## S08 — Aegisub SRT export implementation

- Source: [https://github.com/TypesettingTools/Aegisub/blob/43af875ea01e80052cc6c44f24fc8c5258261c6d/src/subtitle_format_srt.cpp](https://github.com/TypesettingTools/Aegisub/blob/43af875ea01e80052cc6c44f24fc8c5258261c6d/src/subtitle_format_srt.cpp)
- Version/commit: Aegisub v3.5.0 commit 43af875ea01e80052cc6c44f24fc8c5258261c6d
- Locator: SRTSubtitleFormat::CanSave and ConvertTags
- Original access UTC: 2026-10-12T01:05:19Z
- Observed operation: Opened the exact release commit source and inspected SRT export preflight/conversion logic.
- Governing condition/default/exception: This application refuses SRT save when attachments, non-default styles, or unsupported override tags are present; conversion handles a narrow b/i/s/u subset and closes emitted tags to avoid leakage into later cues.
- Applicability: Real example of a format-specific loss guard and cue-local text conversion. These are Aegisub rules, not a universal SRT standard.
- Reviser status: independently_verified_by_reviser; Opened the exact Aegisub commit and inspected CanSave and ConvertTags. Confirmed attachment/style/override guards and narrow b/i/s/u conversion with emitted closing tags.

## S09 — Aegisub 3.5.0 release notes

- Source: [https://github.com/TypesettingTools/Aegisub/releases/tag/v3.5.0](https://github.com/TypesettingTools/Aegisub/releases/tag/v3.5.0)
- Version/commit: v3.5.0, released 2026-10-05; verified commit 43af875 (full source commit shown in S08)
- Locator: Release security note at lines 151-168
- Original access UTC: 2026-10-12T01:07:59Z
- Observed operation: Opened the release page and read the release tag/commit and security note.
- Governing condition/default/exception: Release fixes CVE-2026-92705: a crafted subtitle could run arbitrary code through referenced Automation scripts; the release also reports hardening for other crafted files.
- Applicability: Import subtitle text passively. Never execute embedded/referenced automation, scripts, macros, or active package content during preview/import.
- Reviser status: carried_from_critic_review_independently_verified; No direct reviser re-open. The critic independently verified the pinned v3.5.0 security note; retain it as implementation history, not as a product test.

## S10 — Aegisub issue 614: invisible Unicode at SRT file start

- Source: [https://github.com/TypesettingTools/Aegisub/issues/614](https://github.com/TypesettingTools/Aegisub/issues/614)
- Version/commit: Issue opened 2026-06-20; live issue page; not a normative format specification
- Locator: Issue description, especially the reporter's test observations and BOM exception
- Original access UTC: 2026-10-12T01:07:59Z
- Observed operation: Opened the project issue and read the reporter's described failure and stated exception.
- Governing condition/default/exception: A reporter says certain invisible prefix characters such as suspected U+200E/U+202A caused a parser error; the reporter explicitly says U+FEFF BOM did not reproduce in the current release. This is one issue report, not an independently reproduced universal behavior.
- Applicability: Include invisible Unicode and BOM handling in malformed-text fixtures; preserve original bytes and surface parser diagnostics.
- Reviser status: carried_from_critic_review_partially_verified; No direct reviser re-open. Keep the invisible-prefix report as one non-normative issue report; the critic did not recheck the BOM comparison.

## S11 — The .h5p Specification

- Source: [https://h5p.org/documentation/developers/h5p-specification](https://h5p.org/documentation/developers/h5p-specification)
- Version/commit: H5P developer guide; unversioned web documentation
- Locator: Numbered package components 1-5
- Original access UTC: 2026-10-12T01:05:19Z
- Observed operation: Opened the official H5P package description and read its component model.
- Governing condition/default/exception: An .h5p is a ZIP with a defined tree, h5p.json package definition, optional content/content.json, and required libraries whose semantics define content. The content structure is optional, and libraries may be dependencies.
- Applicability: Existing authoring-tool exchange adapter candidate, but content semantics are library/version-specific and cannot define a universal neutral package by themselves.
- Reviser status: not_verified_access_error; Attempted a direct open of the official H5P developer specification; browser returned an internal error. Package-structure claim remains carried only.

## S12 — H5P subtitles, captions, and descriptions

- Source: [https://help.h5p.com/hc/en-us/articles/25322748576669-Subtitles-Captions-and-Descriptions](https://help.h5p.com/hc/en-us/articles/25322748576669-Subtitles-Captions-and-Descriptions)
- Version/commit: Current H5P.com help page; unversioned
- Locator: VTT track upload instructions and the external-video-platform limitation
- Original access UTC: 2026-10-12T01:05:19Z
- Observed operation: Opened current help documentation and inspected format, track kind/language controls, and stated exception.
- Governing condition/default/exception: For directly uploaded video, the documented caption/subtitle/description text-track upload is VTT; the page says this does not apply to external video platforms. Smart Import is a separate optional service and is not required for basic VTT upload.
- Applicability: Evidence for a useful VTT adapter and a product-specific limitation; not proof that every H5P runtime or external platform has the same behavior.
- Reviser status: carried_from_critic_review_independently_verified; No direct reviser re-open. The critic verified current H5P.com help for VTT upload with directly uploaded video and the external-platform exception; keep this product-specific.

## S13 — OpenTimelineIO documentation at release v0.18.1

- Source: [https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/v0.18.1/docs/index.rst](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/v0.18.1/docs/index.rst)
- Version/commit: v0.18.1, Beta 18.1; release commit short hash 4423671 shown by the official release page
- Locator: Overview lines 194-198
- Original access UTC: 2026-10-12T01:06:54Z
- Observed operation: Opened the version-tagged documentation at v0.18.1 and inspected its overview.
- Governing condition/default/exception: OTIO is an editorial-cut API/interchange with clips, timing, tracks, transitions, markers and metadata, but media is externally referenced rather than embedded.
- Applicability: Useful unfamiliar timeline model or optional editorial adapter; it does not fulfill package asset bundling or subtitle cue/style interchange on its own.
- Reviser status: carried_from_critic_review_independently_verified; No direct reviser re-open. The critic verified the pinned overview’s timeline model and external media references.

## S14 — OpenTimelineIO timeline structure at release v0.18.1

- Source: [https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/v0.18.1/docs/tutorials/otio-timeline-structure.md](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/v0.18.1/docs/tutorials/otio-timeline-structure.md)
- Version/commit: v0.18.1
- Locator: Timeline Structure, Rendering, and Multiple Tracks sections
- Original access UTC: 2026-10-12T01:07:59Z
- Observed operation: Opened the tagged implementation documentation and inspected track, clip, gap, and transition behavior.
- Governing condition/default/exception: Clips within one track may overlap through transitions; transition extents have adjacency constraints, while effects' behavior is application-specific.
- Applicability: Reference for rational editorial timeline structures and overlapping media clips; subtitle cue overlap remains a separate concern.
- Reviser status: carried_from_critic_review_partial; No direct reviser re-open. The critic checked transition behavior but not all adjacency/effects claims; keep optional and qualified.

## S15 — 1EdTech Common Cartridge v1.3 Profile: Implementation

- Source: [https://www.imsglobal.org/cc/ccv1p3/imscc_Implementation-v1p3.html](https://www.imsglobal.org/cc/ccv1p3/imscc_Implementation-v1p3.html)
- Version/commit: Common Cartridge v1.3 profile
- Locator: Profile overview; content packaging, resources, metadata, and conformance sections
- Original access UTC: 2026-10-12T01:05:19Z
- Observed operation: Opened the official 1EdTech v1.3 implementation guide after finding it through the consortium's specification index.
- Governing condition/default/exception: This is a learning-platform course/content package profile that combines course context and resource types; it requires an importer/exporter to honor its profile and resource semantics.
- Applicability: Potential LMS/course-exchange adapter if institutions require it; more course structure than this standalone clip package needs.
- Reviser status: carried_from_critic_review_independently_verified; No direct reviser re-open. The critic verified the official Common Cartridge v1.3 course/LMS scope and profile-specific resources.

## S16 — RFC 8493: The BagIt File Packaging Format

- Source: [https://datatracker.ietf.org/doc/html/rfc8493](https://datatracker.ietf.org/doc/html/rfc8493)
- Version/commit: RFC 8493 BagIt 1.0, 2018-10
- Locator: §§2.1-2.4 and 3 for bag/manifests/validity; §§4.2 and 5.2-5.4 for fetch and security considerations
- Original access UTC: 2026-10-12T01:05:19Z
- Observed operation: Opened the RFC and inspected manifest, checksum, remote-fetch, and security sections.
- Governing condition/default/exception: A complete/valid bag checks payload presence and checksums; 1.0 tools must support SHA-256 and SHA-512 and should default to SHA-512. fetch.txt can describe remote payload, and RFC security text warns about URL control and file-size risks.
- Applicability: Optional integrity wrapper or inspiration for payload manifests only. Do not fetch URLs automatically; this task expressly excludes automatic network fetching and BagIt has no timed-text semantics.
- Reviser status: carried_from_critic_review_partial; No direct reviser re-open. The critic checked fetch/security treatment but not checksum completeness requirements; use BagIt only as an optional local-integrity idea.

## S17 — Python 3.13 zipfile documentation

- Source: [https://docs.python.org/3.13/library/zipfile.html](https://docs.python.org/3.13/library/zipfile.html)
- Version/commit: Python 3.13.16 documentation build
- Locator: ZipFile.open duplicate-name note; zipfile.Path safety note; Decompression pitfalls
- Original access UTC: 2026-10-12T01:05:19Z
- Observed operation: Opened the versioned standard-library documentation and inspected duplicate-name, path validation, decompression limit, and overwrite behavior notes.
- Governing condition/default/exception: A ZipInfo object disambiguates duplicate names. zipfile.Path does not sanitize archive names, unlike extract/extractall; resource exhaustion and overwrite-on-repeat extraction are documented pitfalls.
- Applicability: Concrete parser/extractor boundary evidence; inventory raw entries and impose app limits even when using a library helper.
- Reviser status: independently_verified_by_reviser; Opened Python 3.13.16 zipfile documentation. Confirmed ZipInfo can disambiguate duplicate member names and zipfile.Path does not sanitize archive names; this check does not establish a complete extraction policy.

## S18 — zip-rs CVE-2025-29787 security advisory

- Source: [https://github.com/advisories/GHSA-94vh-gphv-8pm8](https://github.com/advisories/GHSA-94vh-gphv-8pm8)
- Version/commit: zip Rust crate versions >=1.3.0 and <2.3.0 affected; 2.3.0 patched; advisory published 2025-03
- Locator: Affected/patched versions; vulnerability summary and remediation references
- Original access UTC: 2026-10-12T01:05:19Z
- Observed operation: Opened the GitHub-reviewed security advisory and read affected versions, attack mechanism, and fix references.
- Governing condition/default/exception: A symlink entry could redirect a later extracted path outside the destination despite prior path sanitization; the issue applied to high-level extraction APIs. Fix identified as 2.3.0.
- Applicability: Never equate a sanitized-name check with safe extraction; avoid untrusted symlink extraction and defend against path redirection across entries.
- Reviser status: independently_verified_by_reviser; Opened the GitHub-reviewed advisory. Confirmed affected zip versions >=1.3.0 and <2.3.0, 2.3.0 patched, and symlink-mediated path escape despite earlier sanitization.

## S19 — zip-rs v2.3.0 patch release

- Source: [https://github.com/zip-rs/zip2/releases/tag/v2.3.0](https://github.com/zip-rs/zip2/releases/tag/v2.3.0)
- Version/commit: zip v2.3.0; advisory identifies remediation commit short hash a2e062f
- Locator: Release tag v2.3.0 and advisory-linked remediation commit
- Original access UTC: 2026-10-12T01:05:19Z
- Observed operation: Opened the exact tagged release and the advisory-linked patch commit.
- Governing condition/default/exception: This is the version boundary the reviewed advisory calls patched; it does not remove the need for application-level entry/size policies.
- Applicability: Relevant release/fix history if a future Rust ZIP dependency is selected; no dependency is selected or installed in this research stage.
- Reviser status: partially_verified_by_reviser; Opened the advisory and official v2.3.0 release page. The advisory identifies 2.3.0 patched and links a2e062f; release notes mention canonicalized output paths and symlink handling. The exact remediation commit diff was not resolved.

## S20 — Aegisub ASS format test sample

- Source: [https://github.com/TypesettingTools/Aegisub/blob/43af875ea01e80052cc6c44f24fc8c5258261c6d/docs/specs/ass-format-tests.ass](https://github.com/TypesettingTools/Aegisub/blob/43af875ea01e80052cc6c44f24fc8c5258261c6d/docs/specs/ass-format-tests.ass)
- Version/commit: Aegisub v3.5.0 commit 43af875ea01e80052cc6c44f24fc8c5258261c6d
- Locator: Script Info, V4+ Styles, Events, and override-tag test cases
- Original access UTC: 2026-10-12T01:06:54Z
- Observed operation: Opened the release-pinned project test sample as an implementation artifact, not as a normative ASS specification.
- Governing condition/default/exception: The sample exercises style declarations, resolution-dependent formatting, positioning, attachments/metadata, and inline override content; its coverage reflects this project's test fixture, not every ASS dialect.
- Applicability: Evidence that a real authoring workflow carries presentation data beyond simple inline emphasis; require explicit dialect/profile support.
- Reviser status: partially_verified_by_reviser_non_normative_fixture; Opened the pinned Aegisub fixture around its events. It demonstrates a 640x480 render target, styles, inline override tags, positioning, rotation, layers and overlapping display examples. It is a project test fixture, not an ASS standard or universal dialect evidence.

