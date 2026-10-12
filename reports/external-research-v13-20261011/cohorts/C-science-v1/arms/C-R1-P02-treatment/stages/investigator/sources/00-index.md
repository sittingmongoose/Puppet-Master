# Source index — C-R1-P02-treatment investigator

Bounded discovery evidence. Stable IDs and full identity records are in source-map.json; do not silently rebind them. Page access is a single minute-resolution UTC batch. The notes below paraphrase the observed material and distinguish it from work not run.

<a id="c01"></a>
## C01 — FFmpeg ffprobe documentation

- Exact URL: https://ffmpeg.org/ffprobe.html
- Version/commit: Unversioned current manual; C02 pins latest stable FFmpeg 9.0.2 on access date.
- Locator: Description/stream specifiers §2, §3.1; -show_packets/-show_frames/-show_streams/-read_intervals §3.4.
- Access UTC: 2026-10-12T02:41Z
- Observed operation: Read official manual; no ffprobe command run.
- Conditions/defaults/exceptions: Machine-readable container/stream inspection and packet/frame reporting; explicit stream selection. Interval-seek start is documented inaccurate. Probe failure returns positive exit code.
- Applicability: Metadata inventory/selected timestamps; a fast probe does not prove decode correctness or exact seeking.
- Evidence note: Use ffprobe for container and stream inspection; treat deeper frame reads as distinct from metadata-only probing and confirm review boundaries against decoded PTS.

<a id="c02"></a>
## C02 — FFmpeg release page

- Exact URL: https://ffmpeg.org/download.html
- Version/commit: FFmpeg 9.0.2 (Lei), released 2026-09-18; libavformat 63.1.102, libavcodec 63.1.102, libavutil 61.1.102.
- Locator: Release lines 110–124 and maintained branch notes.
- Access UTC: 2026-10-12T02:41Z
- Observed operation: Read official release listing; no binary installed or executed.
- Conditions/defaults/exceptions: Major releases approx. six-monthly; point releases include selected fixes; stable branches cherry-pick changes while development gets faster fixes.
- Applicability: Pin actual build and libraries for inspection/proxy reproducibility.
- Evidence note: Record FFmpeg version and library versions in probe/proxy provenance.

<a id="c03"></a>
## C03 — OpenTimelineIO time-range model

- Exact URL: https://opentimelineio.readthedocs.io/en/v0.18.1/tutorials/time-ranges.html
- Version/commit: OpenTimelineIO 0.18.1 documentation.
- Locator: Clip.available_range/source_range/trimmed_range and clip/parent time frames, lines 11–31.
- Access UTC: 2026-10-12T02:41Z
- Observed operation: Read versioned docs; no adapter run.
- Conditions/defaults/exceptions: available_range may be unknown; source_range may be absent to mean full range; both absent is invalid. Ranges are relative to named time frames.
- Applicability: Useful interchange structure; source ticks, VFR frame identity, provenance and uncertainty need an app model.
- Evidence note: Keep OTIO as interchange candidate, not presumed complete storage model.

<a id="c04"></a>
## C04 — OpenTimelineIO plugin and media-linker docs

- Exact URL: https://opentimelineio.readthedocs.io/en/v0.18.1/tutorials/otio-plugins.html
- Version/commit: OpenTimelineIO 0.18.1 documentation.
- Locator: OTIOZ and Media Linkers sections, especially lines 178–182.
- Access UTC: 2026-10-12T02:41Z
- Observed operation: Read versioned docs; no bundle/relink run.
- Conditions/defaults/exceptions: OTIOZ bundling expects local references and unique basenames; Media Linkers can resolve imported references to site-specific media.
- Applicability: Interchange/relink extension point; validate collisions, missing files and cross-volume moves.
- Evidence note: OTIOZ is not proof of a general resolver for arbitrary external offline media.

<a id="c05"></a>
## C05 — OpenTimelineIO pull request 1477

- Exact URL: https://github.com/AcademySoftwareFoundation/OpenTimelineIO/pull/1477
- Version/commit: Merged 2024-11-14; commit 383cfda; included in v0.18.0 release history.
- Locator: Merged lines 131–146; commit description lines 971–982; release history.
- Access UTC: 2026-10-12T02:41Z
- Observed operation: Read upstream fix history; no patch applied.
- Conditions/defaults/exceptions: Change adjusts rate recognition/conversion for timecode; comments distinguish frame-number timecode from absolute timestamp.
- Applicability: Fractional-rate/timecode edge cases need regression tests and exact rate storage.
- Evidence note: Upstream history demonstrates timecode-rate handling required a real correction.

<a id="c06"></a>
## C06 — OpenTimelineIO issue 1983

- Exact URL: https://github.com/AcademySoftwareFoundation/OpenTimelineIO/issues/1983
- Version/commit: Opened 2025-11-25; reports OTIO/Plugins 0.18.1 fail vs 0.17 success; closed as duplicate of issue 1980, Option to disable SMPTE Rate Check.
- Locator: Problem/reproduction lines 149–184; duplicate target 145–147.
- Access UTC: 2026-10-12T02:41Z
- Observed operation: Read issue report only; not reproduced or fix-verified.
- Conditions/defaults/exceptions: Report states truncated ALE rates 23.976/29.97 fail exact-rate checks while precise fractional values pass; not proof for all inputs/versions.
- Applicability: Pin OTIO, test fractional-rate ALE/timecode imports; mark report as unverified here.
- Evidence note: Treat the regression report as a test lead, not universal compatibility evidence.

<a id="c07"></a>
## C07 — W3C WebVTT

- Exact URL: https://www.w3.org/TR/webvtt1/
- Version/commit: Current W3C WebVTT1 Recommendation page; no version tag in URL.
- Locator: Cue identifier/timing syntax and media-relative time §4.4, lines 881–905.
- Access UTC: 2026-10-12T02:41Z
- Observed operation: Read W3C spec; no parser/conformance run.
- Conditions/defaults/exceptions: Cue IDs unique per file; timestamps are millisecond media-relative offsets; cue starts ordered, end after start, overlaps allowed.
- Applicability: Transcript/caption export, not full internal timing/revision/source clock/comments.
- Evidence note: Keep richer internal anchors/revisions and document quantization when exporting WebVTT.

<a id="c08"></a>
## C08 — EBU Tech 3285 v2 Broadcast Wave Format

- Exact URL: https://tech.ebu.ch/docs/tech/tech3285.pdf
- Version/commit: EBU Tech 3285 v2, 2011-05-20.
- Locator: TimeReference field, PDF page 10 / printed page 11, lines 255–259.
- Access UTC: 2026-10-12T02:41Z
- Observed operation: Read official spec; no BWF inspected.
- Conditions/defaults/exceptions: TimeReference is a 64-bit first-sample count since midnight at the file sample frequency; it does not validate device clock accuracy.
- Applicability: Use as provenance-bearing alignment hint with visible trust state/manual correction.
- Evidence note: Do not assume BWF metadata establishes shared time among independent recorders.

<a id="c09"></a>
## C09 — RFC 8493 BagIt 1.0

- Exact URL: https://datatracker.ietf.org/doc/html/rfc8493
- Version/commit: RFC 8493, October 2018; BagIt 1.0.
- Locator: §2.1.2–2.1.3, lines 347–414; checksum algorithms §2.4.
- Access UTC: 2026-10-12T02:41Z
- Observed operation: Read IETF RFC; no bag generated/validated.
- Conditions/defaults/exceptions: Requires data/ payload and manifest; every included payload file listed once with checksum and relative path. SHA-256 allowed. Manifest cannot reference outside payload.
- Applicability: Optional self-contained export; link-only packs need a separate resolver.
- Evidence note: BagIt protects integrity of included files; it does not resolve missing/external originals.

<a id="c10"></a>
## C10 — RO-Crate 1.2 File Data Entities

- Exact URL: https://github.com/ResearchObject/ro-crate/blob/main/docs/_specification/1.2/data-entities.md
- Version/commit: RO-Crate 1.2 spec path on upstream main; exact commit not exposed.
- Locator: Path encoding lines 245–248; attached/detached File entity rules 316–329.
- Access UTC: 2026-10-12T02:41Z
- Observed operation: Read spec; no crate created.
- Conditions/defaults/exceptions: Attached file IDs may be relative to crate root; use slash separators and URI escaping. Detached File entities require absolute URIs and are web-based.
- Applicability: Describe included files relative to attached crate; do not claim detached crate locates moved offline files.
- Evidence note: Use attached mode when portable media is included.

<a id="c11"></a>
## C11 — MediaInfo field descriptions

- Exact URL: https://mediaarea.net/en/MediaInfo/Support/Fields
- Version/commit: Field page states descriptions are as known for MediaInfo 23.10.
- Locator: Stream fields/mappings for rates, timecode, stream IDs, durations and metadata caveats.
- Access UTC: 2026-10-12T02:41Z
- Observed operation: Read vendor docs; no binary run.
- Conditions/defaults/exceptions: Page warns MIXML pivot has no compatibility guarantee across versions and mapped fields can depend on source format.
- Applicability: Independent parser/vocabulary check, not canonical timing truth.
- Evidence note: Acknowledge page's stated 23.10 scope.

<a id="c12"></a>
## C12 — Kdenlive proxy clip documentation

- Exact URL: https://docs.kdenlive.org/en/getting_started/configure_kdenlive/configuration_proxy_clips.html
- Version/commit: Kdenlive 26.08 manual.
- Locator: Proxy enable/threshold, width, profiles, external camera proxies and allowed FFmpeg params, lines 25–62.
- Access UTC: 2026-10-12T02:41Z
- Observed operation: Read manual; no editor/proxy run.
- Conditions/defaults/exceptions: Per-project configuration; profiles may depend on hardware; unexpected imported FFmpeg params may warn. No documented alignment/comment provenance here.
- Applicability: Maintained NLE/proxy alternative and workflow benchmark, not canonical linked data model.
- Evidence note: Useful comparison for a smaller first workflow.

<a id="c13"></a>
## C13 — FFmpeg FATE

- Exact URL: https://www.ffmpeg.org/fate.html
- Version/commit: Current FATE documentation; page revision not exposed.
- Locator: Public sample suite, setup and selected-test instructions.
- Access UTC: 2026-10-12T02:41Z
- Observed operation: Read test docs; no downloads/tests run.
- Conditions/defaults/exceptions: Uses an external sample suite, selectable tests, and some assertions require explicit assert level.
- Applicability: Public parser/codec fixture corpus; task-specific known-answer sync fixtures still needed.
- Evidence note: Use public fixture breadth alongside controlled synthetic cases.

<a id="c14"></a>
## C14 — Matroska public test suite

- Exact URL: https://www.matroska.org/downloads/test_suite.html
- Version/commit: Upstream eight-file test suite page; no per-file tag listed.
- Locator: Test1–test8 catalog, lines 40–55.
- Access UTC: 2026-10-12T02:41Z
- Observed operation: Read catalog; fixtures not downloaded/run.
- Conditions/defaults/exceptions: Container-focused suite includes non-default timecode scale, multiple audio/subtitles, seeking, damaged files and audio gaps; codec coverage is not its emphasis.
- Applicability: Public robustness suite with separate codec tests.
- Evidence note: These are useful edge-case fixtures but do not replace sync truth fixtures.

