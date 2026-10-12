# Critic source index — C-R1-P02-treatment

C01–C14 preserve the investigator source IDs and original URLs and were independently revisited. C15–C17 are supplements. C10 remains bound to the inherited upstream-main URL and records a separately checked RO-Crate 1.2.0 tag URL; that supplement is not a silent rebind.

Access times are UTC minute-resolution batches because the browser does not expose a per-page clock instant. This is documentary evidence only. No media files, code, or fixtures were run.

<a id="c01"></a>
## C01 — FFmpeg ffprobe documentation

- Exact URL: https://ffmpeg.org/ffprobe.html
- Released version/commit: Unversioned current manual; C02 pins latest stable FFmpeg 9.0.2 on access date.
- Locator: Description/stream specifiers §2, §3.1; -show_packets/-show_frames/-show_streams/-read_intervals §3.4.
- Investigator access UTC: 2026-10-12T02:41Z
- Critic access UTC: 2026-10-12T02:51Z
- Investigator observed operation: Read official manual; no ffprobe command run.
- Critic observed operation: Opened official ffprobe manual. Confirmed stream selection, stream/packet/frame output, and that -read_intervals seeking is inaccurate; no ffprobe command run.
- Governing conditions/defaults/exceptions: Machine-readable container/stream inspection and packet/frame reporting; explicit stream selection. Interval-seek start is documented inaccurate. Probe failure returns positive exit code.
- Applicability: Metadata inventory/selected timestamps; a fast probe does not prove decode correctness or exact seeking.


<a id="c02"></a>
## C02 — FFmpeg release page

- Exact URL: https://ffmpeg.org/download.html
- Released version/commit: FFmpeg 9.0.2 (Lei), released 2026-09-18; libavformat 63.1.102, libavcodec 63.1.102, libavutil 61.1.102.
- Locator: Release lines 110–124 and maintained branch notes.
- Investigator access UTC: 2026-10-12T02:41Z
- Critic access UTC: 2026-10-12T02:52Z
- Investigator observed operation: Read official release listing; no binary installed or executed.
- Critic observed operation: Opened official FFmpeg release page. Confirmed FFmpeg 9.0.2 release date and library versions and checked that multiple maintained stable branches are listed; no binary run.
- Governing conditions/defaults/exceptions: Major releases approx. six-monthly; point releases include selected fixes; stable branches cherry-pick changes while development gets faster fixes.
- Applicability: Pin actual build and libraries for inspection/proxy reproducibility.


<a id="c03"></a>
## C03 — OpenTimelineIO time-range model

- Exact URL: https://opentimelineio.readthedocs.io/en/v0.18.1/tutorials/time-ranges.html
- Released version/commit: OpenTimelineIO 0.18.1 documentation.
- Locator: Clip.available_range/source_range/trimmed_range and clip/parent time frames, lines 11–31.
- Investigator access UTC: 2026-10-12T02:41Z
- Critic access UTC: 2026-10-12T02:51Z
- Investigator observed operation: Read versioned docs; no adapter run.
- Critic observed operation: Opened versioned OTIO 0.18.1 time-range docs. Confirmed clip and parent coordinate frames and unknown available ranges; no adapter run.
- Governing conditions/defaults/exceptions: available_range may be unknown; source_range may be absent to mean full range; both absent is invalid. Ranges are relative to named time frames.
- Applicability: Useful interchange structure; source ticks, VFR frame identity, provenance and uncertainty need an app model.


<a id="c04"></a>
## C04 — OpenTimelineIO plugin and media-linker docs

- Exact URL: https://opentimelineio.readthedocs.io/en/v0.18.1/tutorials/otio-plugins.html
- Released version/commit: OpenTimelineIO 0.18.1 documentation.
- Locator: OTIOZ and Media Linkers sections, especially lines 178–182.
- Investigator access UTC: 2026-10-12T02:41Z
- Critic access UTC: 2026-10-12T02:51Z
- Investigator observed operation: Read versioned docs; no bundle/relink run.
- Critic observed operation: Opened versioned OTIO 0.18.1 plugin docs. Confirmed OTIOZ local-reference/unique-basename condition and media-linker role; no bundle run.
- Governing conditions/defaults/exceptions: OTIOZ bundling expects local references and unique basenames; Media Linkers can resolve imported references to site-specific media.
- Applicability: Interchange/relink extension point; validate collisions, missing files and cross-volume moves.


<a id="c05"></a>
## C05 — OpenTimelineIO pull request 1477

- Exact URL: https://github.com/AcademySoftwareFoundation/OpenTimelineIO/pull/1477
- Released version/commit: Merged 2024-11-14; commit 383cfda; included in v0.18.0 release history.
- Locator: Merged lines 131–146; commit description lines 971–982; release history.
- Investigator access UTC: 2026-10-12T02:41Z
- Critic access UTC: 2026-10-12T02:51Z
- Investigator observed operation: Read upstream fix history; no patch applied.
- Critic observed operation: Opened upstream PR 1477 and merge record. Confirmed merge date and commit 383cfda; fix history read only, not applied.
- Governing conditions/defaults/exceptions: Change adjusts rate recognition/conversion for timecode; comments distinguish frame-number timecode from absolute timestamp.
- Applicability: Fractional-rate/timecode edge cases need regression tests and exact rate storage.


<a id="c06"></a>
## C06 — OpenTimelineIO issue 1983

- Exact URL: https://github.com/AcademySoftwareFoundation/OpenTimelineIO/issues/1983
- Released version/commit: Opened 2025-11-25; reports OTIO/Plugins 0.18.1 fail vs 0.17 success; closed as duplicate of issue 1980, Option to disable SMPTE Rate Check.
- Locator: Problem/reproduction lines 149–184; duplicate target 145–147.
- Investigator access UTC: 2026-10-12T02:41Z
- Critic access UTC: 2026-10-12T02:51Z
- Investigator observed operation: Read issue report only; not reproduced or fix-verified.
- Critic observed operation: Opened upstream issue 1983. Confirmed this is a report for OTIO/plugins 0.18.1 ALE parsing with specific truncated rates; exact fractional example reportedly works; not reproduced. Checked duplicate target separately as C17.
- Governing conditions/defaults/exceptions: Report states truncated ALE rates 23.976/29.97 fail exact-rate checks while precise fractional values pass; not proof for all inputs/versions.
- Applicability: Pin OTIO, test fractional-rate ALE/timecode imports; mark report as unverified here.
- Critic version context: Issue 1983 is a user report, not a reproduced result. Its duplicate target issue 1980 is separately recorded as C17; at review time issue 1980 was still open with a 0.19.0 milestone and the release list context was v0.18.1 (C16).


<a id="c07"></a>
## C07 — W3C WebVTT

- Exact URL: https://www.w3.org/TR/webvtt1/
- Released version/commit: Current W3C WebVTT1 Recommendation page; no version tag in URL.
- Locator: Cue identifier/timing syntax and media-relative time §4.4, lines 881–905.
- Investigator access UTC: 2026-10-12T02:41Z
- Critic access UTC: 2026-10-12T02:51Z
- Investigator observed operation: Read W3C spec; no parser/conformance run.
- Critic observed operation: Opened W3C WebVTT Recommendation. Confirmed unique file-local cue IDs, millisecond media-relative offsets, ordered starts, end-after-start, and overlapping cues; no parser run.
- Governing conditions/defaults/exceptions: Cue IDs unique per file; timestamps are millisecond media-relative offsets; cue starts ordered, end after start, overlaps allowed.
- Applicability: Transcript/caption export, not full internal timing/revision/source clock/comments.


<a id="c08"></a>
## C08 — EBU Tech 3285 v2 Broadcast Wave Format

- Exact URL: https://tech.ebu.ch/docs/tech/tech3285.pdf
- Released version/commit: EBU Tech 3285 v2, 2011-05-20.
- Locator: TimeReference field, PDF page 10 / printed page 11, lines 255–259.
- Investigator access UTC: 2026-10-12T02:41Z
- Critic access UTC: 2026-10-12T02:51Z
- Investigator observed operation: Read official spec; no BWF inspected.
- Critic observed operation: Opened official EBU Tech 3285 v2 PDF at the TimeReference field. Confirmed first-sample count since midnight at the file sample frequency; no BWF inspected.
- Governing conditions/defaults/exceptions: TimeReference is a 64-bit first-sample count since midnight at the file sample frequency; it does not validate device clock accuracy.
- Applicability: Use as provenance-bearing alignment hint with visible trust state/manual correction.


<a id="c09"></a>
## C09 — RFC 8493 BagIt 1.0

- Exact URL: https://datatracker.ietf.org/doc/html/rfc8493
- Released version/commit: RFC 8493, October 2018; BagIt 1.0.
- Locator: §2.1.2–2.1.3, lines 347–414; checksum algorithms §2.4.
- Investigator access UTC: 2026-10-12T02:41Z
- Critic access UTC: 2026-10-12T02:51Z
- Investigator observed operation: Read IETF RFC; no bag generated/validated.
- Critic observed operation: Opened RFC 8493. Confirmed required data payload/manifest semantics, exactly-once payload listing, and no manifest references outside payload; no bag generated or validated.
- Governing conditions/defaults/exceptions: Requires data/ payload and manifest; every included payload file listed once with checksum and relative path. SHA-256 allowed. Manifest cannot reference outside payload.
- Applicability: Optional self-contained export; link-only packs need a separate resolver.


<a id="c10"></a>
## C10 — RO-Crate 1.2 File Data Entities

- Exact URL: https://github.com/ResearchObject/ro-crate/blob/main/docs/_specification/1.2/data-entities.md
- Released version/commit: RO-Crate 1.2 spec path on upstream main; exact commit not exposed.
- Locator: Path encoding lines 245–248; attached/detached File entity rules 316–329.
- Investigator access UTC: 2026-10-12T02:41Z
- Critic access UTC: 2026-10-12T02:51Z
- Investigator observed operation: Read spec; no crate created.
- Critic observed operation: Opened the inherited upstream-main path and, at 02:54Z, the same RO-Crate 1.2 data-entities file at tag 1.2.0. Confirmed attached relative paths resolve under crate root and detached file identifiers are absolute/web-based; no crate generated.
- Governing conditions/defaults/exceptions: Attached file IDs may be relative to crate root; use slash separators and URI escaping. Detached File entities require absolute URIs and are web-based.
- Applicability: Describe included files relative to attached crate; do not claim detached crate locates moved offline files.
- Supplemental same-version pinned URL: https://github.com/ResearchObject/ro-crate/blob/1.2.0/docs/_specification/1.2/data-entities.md
- Locator note: The original C10 URL remains the inherited upstream-main URL. The pinned 1.2.0 tag was checked as supplemental same-version context; C10 was not silently rebound.


<a id="c11"></a>
## C11 — MediaInfo field descriptions

- Exact URL: https://mediaarea.net/en/MediaInfo/Support/Fields
- Released version/commit: Field page states descriptions are as known for MediaInfo 23.10.
- Locator: Stream fields/mappings for rates, timecode, stream IDs, durations and metadata caveats.
- Investigator access UTC: 2026-10-12T02:41Z
- Critic access UTC: 2026-10-12T02:55Z
- Investigator observed operation: Read vendor docs; no binary run.
- Critic observed operation: Opened MediaInfo field page and inspected stream/order and timing fields and the mappings section. Confirmed the page says descriptions are as known for 23.10 and MIXML has no cross-version compatibility guarantee; no binary run.
- Governing conditions/defaults/exceptions: Page warns MIXML pivot has no compatibility guarantee across versions and mapped fields can depend on source format.
- Applicability: Independent parser/vocabulary check, not canonical timing truth.


<a id="c12"></a>
## C12 — Kdenlive proxy clip documentation

- Exact URL: https://docs.kdenlive.org/en/getting_started/configure_kdenlive/configuration_proxy_clips.html
- Released version/commit: Kdenlive 26.08 manual.
- Locator: Proxy enable/threshold, width, profiles, external camera proxies and allowed FFmpeg params, lines 25–62.
- Investigator access UTC: 2026-10-12T02:41Z
- Critic access UTC: 2026-10-12T02:51Z
- Investigator observed operation: Read manual; no editor/proxy run.
- Critic observed operation: Opened Kdenlive 26.08 proxy clip manual. Confirmed per-project enablement, threshold/width, hardware-dependent profiles; no editor/proxy run.
- Governing conditions/defaults/exceptions: Per-project configuration; profiles may depend on hardware; unexpected imported FFmpeg params may warn. No documented alignment/comment provenance here.
- Applicability: Maintained NLE/proxy alternative and workflow benchmark, not canonical linked data model.


<a id="c13"></a>
## C13 — FFmpeg FATE

- Exact URL: https://www.ffmpeg.org/fate.html
- Released version/commit: Current FATE documentation; page revision not exposed.
- Locator: Public sample suite, setup and selected-test instructions.
- Investigator access UTC: 2026-10-12T02:41Z
- Critic access UTC: 2026-10-12T02:53Z
- Investigator observed operation: Read test docs; no downloads/tests run.
- Critic observed operation: Opened FFmpeg FATE documentation. Confirmed external sample suite setup, selectable tests, and assertions disabled by default unless configured; no tests or downloads.
- Governing conditions/defaults/exceptions: Uses an external sample suite, selectable tests, and some assertions require explicit assert level.
- Applicability: Public parser/codec fixture corpus; task-specific known-answer sync fixtures still needed.


<a id="c14"></a>
## C14 — Matroska public test suite

- Exact URL: https://www.matroska.org/downloads/test_suite.html
- Released version/commit: Upstream eight-file test suite page; no per-file tag listed.
- Locator: Test1–test8 catalog, lines 40–55.
- Investigator access UTC: 2026-10-12T02:41Z
- Critic access UTC: 2026-10-12T02:53Z
- Investigator observed operation: Read catalog; fixtures not downloaded/run.
- Critic observed operation: Opened Matroska test suite catalog. Confirmed its eight container-focused files and examples including multiple tracks, non-default timecode scale, damaged input, and audio gap; no fixtures downloaded/run.
- Governing conditions/defaults/exceptions: Container-focused suite includes non-default timecode scale, multiple audio/subtitles, seeking, damaged files and audio gaps; codec coverage is not its emphasis.
- Applicability: Public robustness suite with separate codec tests.


<a id="c15"></a>
## C15 — OpenTimelineIO Writing an Adapter

- Exact URL: https://opentimelineio.readthedocs.io/en/v0.18.0/tutorials/write-an-adapter.html
- Released version/commit: OpenTimelineIO 0.18.0 documentation.
- Locator: Lossless native .otio serialization, adapter lossiness, metadata support and namespace guidance.
- Investigator access UTC: 2026-10-12T02:53Z
- Critic access UTC: 2026-10-12T02:53Z
- Investigator observed operation: Read official versioned documentation; no adapter or round-trip test run.
- Critic observed operation: Independently opened the official v0.18.0 adapter tutorial; no code or data was run.
- Governing conditions/defaults/exceptions: The native OTIO JSON adapter can store/retrieve OTIO objects, metadata, and supported OTIO features; external adapters may be lossy. The core carries custom metadata without interpreting it, and docs recommend a namespace.
- Applicability: A native OTIO project with versioned namespaced application metadata is a viable architecture candidate; this does not prove that the required media semantics or downstream adapters are lossless.


<a id="c16"></a>
## C16 — OpenTimelineIO release list and v0.18.1 release record

- Exact URL: https://github.com/AcademySoftwareFoundation/OpenTimelineIO/releases
- Released version/commit: v0.18.1 release tag resolves to commit 4423671; the next listed Beta 18.1 is identified as a pre-release.
- Locator: Release list and v0.18.1 record; accessed 2026-10-12.
- Investigator access UTC: 2026-10-12T02:52Z
- Critic access UTC: 2026-10-12T02:52Z
- Investigator observed operation: Read upstream release listing; no release artifacts downloaded.
- Critic observed operation: Opened the upstream release page and inspected its v0.18.1 tag/commit and pre-release label.
- Governing conditions/defaults/exceptions: The release page is a mutable listing. At access it showed the v0.18.1 release and a Beta 18.1 pre-release; it did not list a 0.19.0 release.
- Applicability: Version context for issue 1983 and explicit pinning of OTIO plus separately versioned plugins.


<a id="c17"></a>
## C17 — OpenTimelineIO issue 1980 — Option to disable SMPTE Rate Check

- Exact URL: https://github.com/AcademySoftwareFoundation/OpenTimelineIO/issues/1980
- Released version/commit: Upstream issue opened 2025-11-11; page lists milestone 0.19.0 and status Open at review time.
- Locator: Issue description/activity, including the 90 fps report and rate-check discussion.
- Investigator access UTC: 2026-10-12T02:53Z
- Critic access UTC: 2026-10-12T02:53Z
- Investigator observed operation: Read upstream issue only; no reproduction and no fix verification.
- Critic observed operation: Opened issue 1980 and confirmed Open status and 0.19.0 milestone.
- Governing conditions/defaults/exceptions: The issue reports a 90 fps timecode conversion limitation and asks for opt-in/out policy; an issue/milestone is not a release guarantee. It is the duplicate target for issue 1983.
- Applicability: Supplemental version/adapter context. Does not establish that OTIO RationalTime cannot represent arbitrary rates or that all OTIO timeline use is unsuitable.
