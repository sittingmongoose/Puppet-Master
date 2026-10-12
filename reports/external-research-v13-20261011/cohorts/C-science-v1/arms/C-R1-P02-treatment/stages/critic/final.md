# C-P02 — Independent critique and final planning proposal

## Recommendation

Build an offline preparation workspace around stable asset, stream, excerpt, transcript, comment, preview, and alignment records. Keep originals byte-preserved, use a session clock only as a presentation layer, and make every change to mapping or transcript state reviewable and reversible.

Use FFmpeg and ffprobe for container and stream inventory, selected packet/frame timestamp inspection, source decoding, and optional preview generation. Keep an app-owned project schema as the leading design, while retaining native OpenTimelineIO (OTIO) with namespaced metadata as a credible alternative until a round-trip prototype shows which model better preserves this team's records. Use WebVTT for timed-text exchange, not as the internal annotation database. Offer a metadata-only link package and an optional self-contained package containing each selected original once. BagIt and attached RO-Crate can describe and check included files; they do not replace a resolver for external originals.

This is a source-backed planning recommendation, not a claim that any component has been integrated or tested. It preserves every behavior in the brief and the released plan. Product choices that research cannot settle are listed at the end.

## Data and preservation model

### Originals, assets, and streams

Give each original file a stable asset ID, full-file SHA-256, byte size, import-time path hint, and a versioned parser inventory. Keep stream records separate from interview roles and from files: each selected stream needs its asset ID, observed stream index/ID, media type, codec/format descriptor, relevant time base or sample rate, and the parser/build that reported those fields. FFprobe can inventory formats, streams, tags, packets, and frames, but a successful probe does not prove that each stream decodes correctly or can be reviewed. Its interval seek is explicitly approximate. [C01](sources/00-index.md#c01) [C02](sources/00-index.md#c02)

For the preservation mode, ingest one verified copy into a managed vault and let all interviews and excerpts reference it. A lower-storage mode may reference an existing file in place under a no-write application policy. That mode must be described as externally managed: an application policy cannot prevent another program, person, or removable drive from changing or deleting that path. Recheck the recorded digest before use and relink/export; report a changed or missing file as unresolved. Do not describe an in-place path as an immutable preserved original.

Keep originals independent of derived files. Hash and retain the import-time source; never write an edit, proxy, waveform, or excerpt over it. Share an original across many reviews, and make waveform/preview caches lazy and reusable.

### Source coordinates and session time

Do not use embedded dates or device timecode as authority for a shared session clock. Give the session an explicit origin, including an arbitrary project zero when no shared wall-clock origin is known. Keep timecode, container timestamps, BWF TimeReference, and manual anchors as separate observations with provenance and trust state. EBU Tech 3285 defines BWF TimeReference as a first-sample count since midnight at the file sample frequency; it does not certify agreement between independent device clocks. [C08](sources/00-index.md#c08)

Use source-native coordinates for boundaries:

- For audio, store sample index and exact sample rate, with the selected stream and source origin.
- For video, store presentation timestamp and exact stream time base for the decoded frame, plus a stable presentation-order/frame identity and known duration where available. Retain source start, timestamp gaps/discontinuities, and relevant packet/frame observations so an implementation can distinguish presentation timing from decode order.
- Store the user's requested interval separately from the frame/sample boundaries actually resolved. Define ranges as half-open and retain an explicit unresolved state when a source boundary cannot be mapped exactly.

This representation is a design requirement to validate, not a guarantee made by a metadata probe. Variable frame rate, missing or nonmonotonic timestamps, stream offsets, decoder behavior, and sample boundaries need known-answer tests. Do not reconstruct VFR frames by dividing an ordinal by nominal or average frame rate. Preserve exact rational time values such as 24000/1001; show display rounding and any export quantization.

A versioned source-to-session map should hold offset, scale, anchors, method, author, confidence/uncertainty, residuals, parser evidence, and revision. Use offset-only when it describes the evidence over the recording's duration. Two separated anchors identify an affine offset-plus-scale line; they do not independently validate that line because those two points fit it exactly. Require independent validation anchors across the recording, or an equally strong external measurement, and an owner-approved residual/drift threshold before displaying a synced state. If residuals show changing drift, mark the source unresolved or propose a segmented mapping for explicit owner approval. A transcript must never serve as a timing oracle.

### Inspection, decoding, and previews

Inventory first: container, every stream, codec, stream IDs, time base, start/duration, available timestamps, audio sample rate/channel layout, and tags. Expose multiple audio streams for review. Keep probe, decode, and preview outcomes separate. A stream may be inventoried yet unsupported for playback; report the affected operation, stream, parser/build and error while retaining the original and a manual alignment path.

Source-based decoding is a reference playback path for checking native stream content and boundaries. It does not establish that timestamps from different devices share a clock; the project's accepted source-to-session mapping remains the timing authority. A derived preview may make routine browsing more responsive, especially on modest storage or hardware, while introducing its own timing and stream-selection risks. Compare both approaches and keep both available where supported:

| Mode | Benefit | Limit | Role |
|---|---|---|---|
| Source-based playback | Shows selected original streams and avoids proxy-time ambiguity. | Decode, seek, and codec support can be costly or incomplete. | Reference playback and boundary review when decodable. |
| Derived preview | Speeds routine browsing, thumbnails, and waveforms; one cache can serve multiple reviews. | Transcoding may alter cadence, origin, audio mapping, channels, or quality. | Browsing after its stream/time transform is verified; never canonical edit time. |

For each preview record parent hash, selected streams, FFmpeg build and libraries, exact recipe/profile, source-to-preview time transform, output hash, and validation state. Generate lazily. Write to a temporary cache identity and publish a complete result only after stream selection, timestamps, expected duration, and decodability are checked. An interrupted or failed job remains incomplete; preserve the source and offer resume, source playback, or an unavailable state. These are proposed behaviors, not executed checks. Kdenlive's 26.08 manual documents configurable proxy generation and hardware-dependent profiles, but does not establish the alignment, comment, or provenance semantics required here. [C12](sources/00-index.md#c12)

## Excerpts, transcript revisions, and comments

Give each named excerpt a stable ID and an explicit basis. A source-anchored excerpt keeps asset, selected stream(s), exact half-open source range, and the mapping revision used to display it in the session. A multi-source session excerpt also keeps the requested session interval and the resolved source range for each stream. This preserves what was requested and what a decoder could actually select.

An offset or scale edit creates a new map revision. Recalculate displayed positions and show a before/after impact preview. Source-anchored records keep their source coordinates. Session-anchored records keep their requested session interval and show the newly resolved source ranges. Require user approval before committing changed resolved ranges; preserve prior maps and resolutions for undo, export, and audit. The default excerpt/comment basis remains a product-owner decision.

Keep transcript revisions immutable. Reuse cue IDs only for unchanged logical cues; represent splits, merges, timing changes, and deletions with explicit lineage. Never assign an old ID to different text. A transcript edit changes transcript state, not media-clock mapping. Show affected cue-linked comments as review-needed and retain their source-time fallback. Comments must identify whether they point to source time, session time, or a transcript cue. WebVTT gives cues unique file-local IDs, millisecond media-relative times, ordered cue starts, and allows overlapping cues; it is a useful exchange adapter, with quantization called out, while richer source coordinates and revision links remain internal. [C07](sources/00-index.md#c07)

## Portable review packages and storage

Offer two explicit modes:

1. **Link-only review package.** Include a versioned project manifest with asset IDs, full-file digests and sizes, selected stream identities/descriptors, exact source ranges, map and transcript revisions, comments, uncertainty, and preview lineage. Include relative path hints only. Resolve by a package-relative path when available, then search only a receiver-selected local root. Accept a relink only after whole-file digest verification and show candidate path, stream summary, and unresolved/ambiguous states. This mode cannot restore an absent original.
2. **Self-contained package.** Include each selected unique original once, plus project data and only the previews the sender chooses. Attach the RO-Crate to the package root so included files have relative identifiers. BagIt can checksum included payload files; its manifests must not refer outside the payload. RO-Crate 1.2 likewise requires an attached file's relative URI to resolve within the crate root, while a detached file is web-based and uses an absolute URI. Neither standard supplies an offline search/relink policy for a missing external original. [C09](sources/00-index.md#c09) [C10](sources/00-index.md#c10)

Normalize and validate portable paths, protect against traversal and path collisions, and keep absolute private machine paths out of portable path hints. Test package-root moves separately from originals moved elsewhere. A matching full-file SHA-256 is a fixity/byte-identity check for the candidate file; it does not by itself recreate a project manifest, choose a missing stream, establish a source range, restore revisions, or make an absent file available. Preserve the manifest reference and report incomplete resolution until required media and records are present.

An OTIOZ bundle is one possible interchange convenience, with limits: OTIO 0.18.1 documents local media references and unique basenames for bundling, so it is not a general resolver for arbitrary external/offline media. Native OTIO JSON and app-specific metadata can remain a candidate canonical project format, but verify the exact fields and round trips before choosing it. [C04](sources/00-index.md#c04) [C15](sources/00-index.md#c15)

## Tool and format alternatives

- **FFmpeg/ffprobe plus project records:** broad inspection and decode support with an optional preview path; application-specific asset, clock, annotation, state, and portable-resolution behavior remains to be designed. Pin the actual binary and library versions. At the time checked, FFmpeg 9.0.2 was the latest stable 9.0 branch version, while separate stable branches also existed; do not equate a major version label with the full installed build. [C01](sources/00-index.md#c01) [C02](sources/00-index.md#c02)
- **OTIO as timeline/project representation or interchange:** its time ranges distinguish clip and parent coordinate frames, and unknown available ranges are explicit. Version 0.18 docs describe namespaced metadata on schema objects and lossless native OTIO serialization of OTIO objects/metadata, so an app-owned schema is not forced by an inability to carry custom records. Export adapters may be lossy. Treat the app-owned model as the leading recommendation because the required provenance, mappings, and revision behavior need a complete tested schema, not because OTIO is categorically incapable. [C03](sources/00-index.md#c03) [C15](sources/00-index.md#c15)
- **OTIO rate/timecode history:** PR 1477 merged a timecode-rate handling fix. A separate issue reports that the ALE adapter in OTIO and plugins 0.18.1 rejects the specific truncated rates 23.976/29.97 while exact fractional values work; the report was not reproduced here and is not a general statement about timeline time representation. Its duplicate target, issue 1980, remains open in the 0.19.0 milestone at review time. Pin OTIO and plugin versions and include these concrete cases in adapter regression tests. This evidence argues for version checks, not for excluding OTIO. [C05](sources/00-index.md#c05) [C06](sources/00-index.md#c06) [C16](sources/00-index.md#c16) [C17](sources/00-index.md#c17)
- **Kdenlive:** maintained NLE and proxy workflow worth benchmarking for a smaller initial workflow. Its proxy settings do not answer this product's multi-device alignment, source-time comment, revision, or portable resolver requirements. [C12](sources/00-index.md#c12)
- **WebVTT:** interoperable timed-text exchange, with file-local cue IDs and millisecond media-relative offsets; not the internal transcript/comment history. [C07](sources/00-index.md#c07)
- **BagIt and RO-Crate:** complementary package integrity and file-description approaches for included content. Neither removes the storage cost of including originals or makes a detached offline original available. [C09](sources/00-index.md#c09) [C10](sources/00-index.md#c10)
- **MediaInfo:** an independent metadata vocabulary/parser cross-check, not a clock authority; its field descriptions state their 23.10 scope and warn that mapping behavior depends on source format. [C11](sources/00-index.md#c11)

## Exact dispositions for the released plan

| Released clause | Disposition | Final resolution |
|---|---|---|
| “The draft keeps originals in a content-addressed media store and records each interview as a collection of tracks.” | Accept with refinement. | One managed original per asset is preferred; allow a clearly labeled externally managed in-place mode. Separate file assets, stream identity, and interview roles. Never duplicate an original per excerpt. |
| “Imported metadata would establish one project timeline.” | Reject metadata as authority; revise to candidate initialization. | Use an explicit project origin and mapping. Metadata, BWF, and timecode are independent hints with provenance, conflicts, and user review. |
| “Timestamps would initially be converted to milliseconds for display and stored excerpt boundaries.” | Split. | Millisecond display is fine; exact source coordinates are canonical. Store requested and resolved boundaries and disclose display/export quantization. |
| “A lightweight inspection component would inventory streams before creating a low-resolution preview.” | Accept with staged behavior. | Inventory all streams first. Separate inventory, decode, and optional preview outcomes; preview generation is lazy and validated. |
| “Alignment would be a per-track offset plus an optional drift adjustment.” | Revise. | Start with offset when evidence supports it; estimate affine drift only with separated anchors and independent validation. Keep uncertainty and residuals. Defer segmented mappings to an owner-approved extension. |
| “Excerpts, transcript anchors, and comments would refer to project timeline positions rather than container offsets.” | Revise. | Record both coordinate systems with an explicit basis, stream, source range, and mapping revision; session selections keep requested and resolved ranges. |
| “Updating alignment would automatically recalculate their source positions.” | Reject mutation; accept derived projection. | Show impact and new resolution, preserve old state, and require approval before changing session-anchored resolved ranges. |
| “Transcript corrections would preserve anchor identifiers.” | Accept conditionally. | Preserve IDs for unchanged cues, record lineage for edits/splits/merges, keep old revisions, and surface orphaned comments. |
| “For portability, the draft exports a manifest, previews, transcript changes, and named excerpts.” | Accept with a versioned schema. | Include source coordinates, maps, revisions, uncertainty, stream descriptors, and preview provenance; include previews only when chosen. |
| “Originals would remain external when the receiver already has them, matched by digest and a user-selected search location.” | Accept as link-only mode. | Search only a user-selected local root, verify the full-file digest, and present path/stream details. Offer a separate package that includes each selected original once. |
| “The draft currently treats matching digests as enough to resolve all references.” | Reject as stated. | A digest verifies candidate bytes; complete resolution also requires the project records, selected streams/ranges, revisions, and available media. Report missing or unresolved items. |
| “Compare offset-only and richer alignment models, and compare preview-centered review with source-based playback.” | Accept the requirement. | Recommend offset and original-source playback as the initial reference path, with an optional validated preview for browsing and an affine model when independently measured drift warrants it. |
| “Recommend how unsupported streams, changed transcripts, and ambiguous timing should be represented.” | Accept the requirement. | Expose unsupported-operation states, uncertainty/conflict, manual anchors, transcript lineage, and review-needed comments. Preserve the original. |
| “Include proposed tests for drift, variable frame rate, relinking, excerpt revision, and interrupted preview generation; label any actually executed fixture checks and their limits.” | Accept the requirement. | The final section supplies a proposed suite and states plainly that no media, fixture, or integration checks were run here. |

## Critique dispositions

| Critique ID | Disposition | Resolution |
|---|---|---|
| CR-01 — In-place reference is not equivalent to an immutable managed copy. | Accept. | Final labels in-place mode externally managed and adds digest rechecks and unresolved states. |
| CR-02 — Source coordinate types need exact frame/sample boundary semantics. | Accept. | Final specifies video presentation identity/time base, audio sample index/rate, half-open ranges, requested/resolved boundaries, origins, and unresolved states; integration must still validate them. |
| CR-03 — Two anchors do not validate an affine drift fit. | Accept. | Two anchors may estimate the line; independent validation points or metrology and an owner threshold are required before declaring sync. |
| CR-04 — A separate app-owned model is not technically required by OTIO's documented limitations. | Amend. | Keep the app-owned schema as the lead recommendation but retain native OTIO with namespaced metadata as a credible candidate; decide through schema and adapter round-trip work. |
| CR-05 — Portable linking needs an explicit resolver, path safety, and separate missing-file states. | Accept. | Final distinguishes link-only from attached package modes and adds path/collision and move tests. |
| CR-06 — “Source-based playback is authoritative” could confuse media reference with cross-device timing authority. | Accept. | Final makes the accepted source-to-session mapping the clock authority and uses source decoding as a boundary/content reference. |
| CR-07 — OTIO issue status and RO-Crate locator needed tighter version context. | Accept. | Final records the specific 0.18.1 ALE report, the open 0.19.0 issue target, and the stable RO-Crate 1.2.0 URL alongside the original source identity. |

No criticism justifies dropping a brief behavior or choosing a narrower product scope. The unresolved items below are product-owner decisions, not substitutes for research already feasible from public sources.

## Owner decisions still required

1. Which operating systems, filesystems, media sizes/counts, containers, codecs, and audio layouts must be supported?
2. May the workspace copy each original once into a managed vault, or must in-place references also be supported? What backup and retention expectations apply?
3. What does “offline” include: media and tools only, or also transcript services, licensing, waveform generation, and updates?
4. What error/residual tolerance defines “aligned,” which anchors can be automatic, and when may a segmented drift model be used?
5. Should excerpts spanning multiple devices default to source or session basis? Which mapping changes always require approval?
6. Which transcript formats and granularity are needed, and what review flow is expected after a cue split, merge, or deletion?
7. Should link-only export be the default? Which originals and previews may be included, and what storage ceiling applies?
8. What local access, encryption, retention, and deletion rules should govern interview material?

## Proposed validation and execution record

These are future integration checks, not results:

1. Generate deterministic files with numbered frames at CFR 24 and 24000/1001, plus VFR presentation timestamps with gaps and decode/presentation reordering. Add nonzero start PTS, different time bases, missing/conflicting clock tags, and multiple audio streams with known start offsets, sample rates, and channel layouts.
2. Compare packet and decoded-frame inventories with known-answer presentation boundaries. Verify exact rational/time-base conversion, sample-boundary handling, stream selection, timestamp discontinuity handling, and explicit unresolved results when an exact boundary cannot be established.
3. Fit offset and affine maps from anchors at different points in the recording. Hold out independent anchors to measure residuals; confirm a two-point fit alone cannot set the synced state. Check visible uncertainty and manually corrected anchors without silent timestamp inference.
4. Create source- and session-anchored excerpts, comments, and transcript cues. Revise offset/scale and transcript text/times; verify before/after previews, explicit approval for remapping, retained old revisions, stable cue lineage, and review-needed orphan comments.
5. Generate proxies for VFR and multitrack files; compare source-to-preview time and audio transforms. Interrupt generation and verify partial output never becomes ready, source hash remains unchanged, and retry/failure states are reviewable.
6. Move package roots and originals separately. Test exact-digest relink, changed/missing/corrupt media, duplicate candidates, basename and case collisions, safe relative paths, user-selected search roots, and no scans/uploads elsewhere. Validate BagIt payload checksums and attached RO-Crate references.
7. Use selected FFmpeg FATE cases and the public Matroska suite for parser/container robustness, then cross-check representative metadata with MediaInfo. FATE needs the external sample suite and some assertions require an explicit assert level. The Matroska suite emphasizes container support, not codec coverage. Neither replaces synthetic known-answer timing tests. [C11](sources/00-index.md#c11) [C13](sources/00-index.md#c13) [C14](sources/00-index.md#c14)

**Executed during this critic stage:** read the released brief and plan and reviewed the full investigator package; independently opened the listed governing primary sources and the supplemental OTIO version/metadata context. No media were accessed, no recordings uploaded, no executable code downloaded or run, no synthetic/public fixtures downloaded or tested, and no application integration or preview was executed. All validation above is proposed work.
