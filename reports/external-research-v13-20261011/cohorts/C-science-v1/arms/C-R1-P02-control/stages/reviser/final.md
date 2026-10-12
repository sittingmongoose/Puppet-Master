# C-P02 — Offline interview preparation workspace

## Executive recommendation

Build the workspace around a versioned local project manifest and revision history. Treat imported originals as immutable, each with an asset identity and byte digest; use FFmpeg/ffprobe as replaceable, version-pinned adapters for inventory, decoding, and derived previews. The project model—not a container date, nominal frame rate, transcript, or editor project file—owns source identities, stream choices, clocks, alignments, transcript annotations, excerpts, comments, and package relationships.

Keep each recording’s own clock. Represent video time with its original presentation timestamp and rational time base, and audio boundaries with sample positions and sample rate. A displayed millisecond or timecode is a view with visible resolution, not the canonical value. Manual alignment is the first-release path. Show its anchors, revision, direction, and uncertainty; mark drift unsupported unless an explicit drift model is implemented and validated.

Make excerpt and comment coordinates explicit. Keep source-time anchors stable when alignment changes; show an impact preview and require a deliberate pin or rebase decision. Transcript edits preserve annotation identity and do not move time. Offer three clearly labeled export modes: one copy of each original, one review proxy per unique original, or a reference package that requires separately supplied originals. The first two can travel with media; the third cannot. Never upload recordings or alter them to create previews.

This is a planning proposal, not an editor implementation. It does not choose the shipped decoder build, supported-input matrix, public-fixture licenses, default package mode, or whether an approved excerpt follows later alignment revisions. Those need owner decisions before release. The first release can use manual constant offsets, source-time excerpts, stable annotations/comments, on-demand previews, and an explicit portable manifest; add affine drift or denser decoded diagnostics only after synthetic checks establish a need and assumptions can be made visible.

## User requirements covered

| Brief requirement | Proposal |
|---|---|
| Separate-device recordings with different starts, variable frame rates, multiple audio tracks, or uncertain clock metadata | Preserve each source/stream clock and explicit stream identity; never assume a shared wall clock or constant frame rate. |
| Offline preparation and no private-media processing in this research | Keep project state and media operations local. No documentary-team recordings were accessed, uploaded, or processed here. |
| Preserve each original and create named excerpts without rewriting it | Keep original bytes read-only; excerpts are manifest references to source-native half-open intervals. |
| Explain effects of transcript and alignment edits on excerpts/comments | Version transcript text and alignment separately; preserve stable IDs/source anchors; preview changed projections and require a pin/rebase decision. |
| Portable review after files move | Use safe package-relative paths, digests, stream identities, and explicit relinking; distinguish self-contained media packages from references to external originals. |
| Modest storage | Store each unique original at most once per package; generate only selected proxies/previews under a quota; allow reference-only export with a clear dependency label. |
| Compare time models, inspection/decode, and previews | See “Time, inspection, and derived media” and “Alternatives and boundaries.” |
| Manual correction and unsupported inputs | Keep manual anchors available; represent failed/uncertain operations and preserve retryable project state. |
| Synthetic/public fixture proposal and status | The detailed proposed matrix is below. No fixture, probe, package, decoder, or integration check was executed. |

## Architecture and behavior

### 1. Original media and stream inventory

Assign each imported original an immutable asset ID. Record the supplied filename, original path, project/package-relative path, observed size, SHA-256, import time, read-only status, container and codec summary, probe/tool version, and all discovered streams. A digest proves byte identity only; it does not identify the intended camera stream, channel mapping, or semantic recording. Keep those as explicit asset and stream fields.

For each stream retain its container stream index, codec, sample rate or video timing data, dimensions where applicable, channel count/layout, language/disposition tags when present, and selected reviewer track/channel mapping. Keep unselected streams in the inventory. Never silently choose stream 0, downmix, or change selection because it is first. A missing or unsupported stream remains a visible record tied to its asset and failed operation.

Use ffprobe for bounded metadata, stream, packet, and frame inventory. Keep inspection, decode, and encode/preview generation as separate operations with separate progress and failure states. A shallow inventory is not proof that all frames decode or that a stream’s timing is valid. Decode only when needed for playback, thumbnails, waveforms, boundary verification, or a proxy. Pin the shipped FFmpeg/libav build and options. Current FFmpeg Doxygen defines decoded AVFrame presentation timestamps in time_base units, exposes AVFrame time_base, and describes best_effort_timestamp as an estimate using heuristics; that supports preserving timestamps and provenance, not assuming all demuxers/decoders supply perfect timestamps [R001]. The actual shipped API version still needs to be selected and tested.

### 2. Clocks, alignment, and uncertainty

Keep source presentation time, decoded frame/sample identity, review/project time, and optional capture wall-clock/timecode metadata as separate coordinate spaces. For video retain integer presentation timestamps and the rational stream/frame time base; retain duration and frame identity when available. For audio retain sample index/count and sample rate. Preserve packet decode timestamps separately where relevant because decode and presentation order can differ. Do not use nominal or average frame rate as the source clock for VFR.

Treat creation dates, embedded timestamps, SMPTE/timecode, BWF time references, GPS fields, and device clock readings as observations with provenance and confidence, not as proof that separate recorders shared a reliable clock. Record raw value, field, source, parser/tool version, and conflict/quality status. FFmpeg’s current formats documentation says use_wallclock_as_timestamps defaults to 0; output avoid_negative_ts=auto can shift timestamps when required by the target format [R006]. These are explicit processing behaviors, not synchronization truth. Missing, contradictory, discontinuous, non-monotonic, or unresolved timing must remain unknown/uncertain and offer manual anchors or an abstain path.

Represent a manual alignment as a signed rational transform between named source clocks with explicit direction, anchor pairs, method, operator, time, uncertainty/residual, and revision lineage. Start with constant offset if the first release needs a smaller validated scope. State that long recordings have unmodeled drift. If affine drift is added, store scale and at least two anchor pairs and disclose the constant-rate-divergence assumption. Piecewise maps add knots, uncertainty, and editing surface; reserve them for a later validated need. Never infer alignment from transcript wording.

At a boundary, keep the requested source value and the resolved frame/sample boundary separately. Store excerpts as half-open source intervals [start,end) with source asset/stream, rational time base or sample rate, resolution rule, and alignment revision used for any cross-source display. The UI can show milliseconds or timecode only alongside source/stream and rounding/resolution information. Do not silently round VFR values to milliseconds and discard the original PTS.

### 3. Transcripts, excerpts, comments, and revisions

Keep transcript turns/words, speaker/tier data, text revisions, and media anchors in an annotation layer separate from source bytes. Give each annotation a stable ID. A spelling or wording correction creates a text revision and does not move the anchor or become evidence of timing. Reanchoring is a separate manual action that records old and new values.

Each excerpt stores an ID/name, source asset and stream, source-native interval, prior versions, approval state, and the alignment revision used to project it alongside other tracks. Each comment declares whether it refers to immutable source time, a specific alignment/project-time revision, a transcript annotation, or an excerpt identity. A new alignment may recalculate displayed/projected positions, but it must not silently rewrite source anchors. Show an impact preview with old/new positions, affected comments/excerpts, residual changes, and orphaned or ambiguous anchors. Preserve the old revision and make pin/rebase explicit and reversible.

**Owner decision:** Should an approved excerpt stay pinned to the alignment revision used for its review, or follow a later alignment? Recommend that approval pins the displayed cross-source context by default while preserving the immutable source interval. Provide an explicit “rebase to current alignment” action with impact preview. This is a default proposal, not a settled product decision.

### 4. Preview and derivative policy

A proxy, thumbnail, or waveform is a derived aid, not a replacement master or the canonical boundary record. Generate only on demand or under a stated storage policy. Key each derivative by source digest, selected streams, source range, alignment/transform inputs if relevant, generator settings, and tool version. Show whether it is current, approximate size, selected tracks, and any timing/quality limitations. Add a no-proxy mode, per-project quota, cancellation, and safe removal/rebuild.

A source-based playback path avoids making an additional media copy but depends on supported codecs and storage throughput. Preview-centered playback can be responsive and smaller to move, but generation consumes time/storage and may omit tracks or alter timing. Show which source streams and boundary rule produced a preview. FFmpeg documents that input -ss usually seeks to the nearest earlier seek point; with accurate seek during transcoding the extra segment is decoded/discarded, while stream copy or -noaccurate_seek preserves it [R005]. Thus an excerpt reference is not a claim that every rendered export has an exact cut point. State the actual stream selection and boundary behavior for any generated review media.

### 5. Portable package and file resolution

Use a versioned package manifest with project schema version, stable asset IDs, safe relative paths, sizes, SHA-256 values, stream identities/selections, transcript/alignment revision files, excerpt/comment anchors, and derivative provenance/tool versions. Include each unique original once even when many excerpts refer to it. Validate package-relative paths remain inside the package, verify checksums, and verify the declared stream/role mapping. A changed or missing asset is reported rather than silently rebound.

Offer three package modes:

1. **Originals included:** self-contained and playable when the declared formats are supported; one copy per unique source.
2. **Proxy review copy:** one labeled proxy per unique source plus project data; clearly says originals are excluded and the proxy may omit quality/tracks/timing detail.
3. **External originals required:** lightweight references and project data only; receiver must supply or explicitly relink originals. It is not self-contained.

When importing, first resolve exact digest matches within the user-selected root, then validate expected size/path containment and stream identity. A digest match confirms bytes but still must be associated with the expected asset, stream, and original/derivative role. If there is no exact match, show filename/size/codec/duration candidates as hints and require user confirmation; preserve ambiguity and mismatch state. Do not bind by name alone. RFC 8493 BagIt can provide payload/checksum and path-containment rules but treats payload as opaque and does not define timeline semantics [C013].

OpenTimelineIO is useful as an interchange adapter, not the canonical state store. Its documented OTIOZ/OTIOD bundle copies associated media into a flat media directory that requires unique basenames, so large sources may be copied and basename collisions need handling; its reader can parse timeline data without decoding media [R007]. The official target_url issue #1985 is still shown open; its reporter describes adapter/path-format differences, while a maintainer notes uncertainty about Windows-style paths. This is a risk signal and a report, not an independently reproduced cross-product test [R003]. Apply an app-defined relative-path rule and test moved packages across supported operating systems.

### 6. First-release boundary and owner decisions

A practical first slice is: immutable originals and asset/stream inventory; explicit manual constant offsets; source-time excerpts and comments; stable transcript annotations; on-demand thumbnail/waveform/proxy generation; and package export/import with the three modes above. Clearly label drift as not modeled. Add affine drift only if long recordings require it and the synthetic test can establish expected behavior.

Resolve these owner decisions before release:

- Constant offset only, or affine drift in the first release? Recommend constant offset with a visible “drift not modeled” status until a tested need supports affine behavior.
- Should approved excerpts pin the reviewed alignment revision or follow the latest? Recommend pin by default with an explicit rebase.
- Which package mode is the default? The smallest reference package requires external originals; a proxy package is not an original-bearing archive.
- What OS versions, containers, codecs, stream counts, and file sizes are supported? Publish a capability matrix instead of “supports all files.”
- Are exported previews evidence/review artifacts or conveniences? If review decisions depend on them, pin generator/build/settings and verify their timeline correspondence.
- Which public fixtures may be redistributed? Record license, source, version, and exact hash before bundling any sample. No documentary-team source should be used without authorization.

## Exact disposition of the released provisional plan

The released plan has four substantive design paragraphs followed by its repeated research deadline. The row order below follows that plan, so every clause has an explicit disposition.

| Plan clause | Disposition and resulting requirement |
|---|---|
| “keeps originals in a content-addressed media store” | **Amend / constrain.** Keep original bytes immutable and identify them by digest. A hash-addressed logical identity or derivative cache may deduplicate byte-identical assets, but do not require a second canonical copy or a duplicate per excerpt/package. Keep source and package paths distinct; a digest alone does not identify the intended stream or channel. |
| “records each interview as a collection of tracks” | **Accept with precision.** Model assets, all discovered streams, selected tracks/channels, and explicit relationships. Do not assume a common clock or silently choose the first audio stream. |
| “Imported metadata would establish one project timeline” | **Reject as authority; retain as evidence.** A timestamp/date/timecode may propose an alignment, but retain raw provenance/confidence and require an approved mapping between named source clocks. |
| “timestamps would initially be converted to milliseconds for display and stored excerpt boundaries” | **Amend.** Milliseconds may be a display. Store source PTS plus rational time base, or audio sample position/rate, source stream, requested interval, half-open range, and resolved boundary/rounding separately. |
| “whether this representation retains sufficient information for the requested inputs” | **Answer: no, not if it is millisecond-only.** It loses source-native VFR/sample coordinates and resolution provenance. Keep exact source values even if a decoder cannot resolve them. |
| “whether embedded timestamps deserve the authority the draft gives them” | **Reject that authority.** Devices may have unrelated, drifting, missing, or contradictory clocks. Use metadata as a confidence-qualified observation and keep manual correction/abstention available. |
| “inventory streams before creating a low-resolution preview” | **Accept, stage the work.** Inventory first; decode only for preview, playback, or boundary checks. A shallow probe is not full decode validation. Keep inspection, decode, and encode status separate. |
| “Alignment would be a per-track offset” | **Accept for MVP.** Define direction and clock pair; store an exact signed rational offset, anchors, method, operator/time, uncertainty, and revision. |
| “plus an optional drift adjustment” | **Accept with bounded semantics and scope decision.** Compare offset, affine drift, and piecewise maps. Affine requires multiple anchors and states a constant-rate-drift assumption; piecewise adds knots and more uncertainty/editing burden. Ship only after tests and manual presentation make it reviewable. |
| “Excerpts, transcript anchors, and comments would refer to project timeline positions rather than container offsets” | **Amend.** Each record names its coordinate space. Source-time excerpts/comments remain bound to immutable source coordinates; project-time comments name an alignment revision; transcript annotations keep stable IDs plus source anchor and text revision. Project positions are projections, not the only stored coordinate. |
| “Updating alignment would automatically recalculate their source positions” | **Reject silent mutation.** Recompute displayed projections and show old/new positions, affected records, residuals, and orphaned anchors. Preserve source coordinates and previous alignment; require an explicit reversible pin/rebase action. |
| “transcript corrections would preserve anchor identifiers” | **Accept with revision history.** Text corrections preserve stable IDs and do not move timing. Reanchoring is a separate recorded manual edit. |
| “the semantics of an already approved excerpt need an explicit decision” | **Accept as an owner decision.** Recommend that approval pins the alignment revision for displayed context while always preserving the source interval; provide previewed explicit rebase. |
| “exports a manifest, previews, transcript changes, and named excerpts” | **Accept and version.** Export project schema, assets/streams, alignment/transcript revisions, excerpt/comment anchors, selected derivative provenance, and checksums. Include only selected derivatives and allow package validation independent of full media decode. |
| “Originals would remain external when the receiver already has them” | **Accept as reference-only mode.** Label “external originals required.” Offer a self-contained-original package and proxy-review package as alternatives; do not call the reference package self-contained. |
| “matched by digest and a user-selected search location” | **Amend.** Search only the explicitly selected root, validate digest and containment, then verify expected asset/stream/role mapping. If digest differs, show hints and require explicit confirmation; never silently bind a similar file. |
| “matching digests as enough to resolve all references” | **Reject.** Digest confirms file bytes, not path safety, stream selection, media role, availability, or annotation/alignment mapping. |
| “investigate metadata, stream identity, unavailable files, and storage trade-offs” | **Answer.** Record all streams and selected identities; preserve missing assets; allow explicit relink; include each unique source once; distinguish original, proxy-only, and external-original package modes. |
| “Compare offset-only and richer alignment models, and compare preview-centered review with source-based playback.” | **Required; comparison above.** Offset is simpler but cannot model drift; affine adds assumptions; piecewise adds complexity. Source playback saves copies but depends on throughput/support; proxies save review effort/transfer but cost storage and may differ. |
| “Recommend how unsupported streams, changed transcripts, and ambiguous timing should be represented.” | **Required; recommendation above.** Preserve failed operation/source/tool/version and retry path; keep conflicting timing observations and uncertainty; version transcript text independently from anchors. |
| “Give explicit dispositions for the provisional design, supported by primary context and useful public history.” | **Required; supplied here.** Source IDs and direct links below include official documentation/releases/specs and corrected OTIO issue history. Frozen discovery’s #1990 identification is wrong and remains disclosed as a frozen-record error; #1985 is the actual target_url issue. |
| “Include proposed tests for drift, variable frame rate, relinking, excerpt revision, and interrupted preview generation” | **Accept and expand.** Future test matrix below covers each named case plus multiple streams, uncertainty, immutability, package movement, and safe path resolution. |
| “label any actually executed fixture checks and their limits” | **Executed fixture checks: none.** No fixture generation/download, media probe/decode, package creation, or software validation occurred. FFmpeg FATE is only a future candidate suite, not an app-level semantics check [S016, C014]. |
| Repeated research deadline and “no minimum research duration” | **Process constraint, not product behavior.** Work concluded when research and required artifacts were complete; no waiting was used to consume the allowance. |

## Critique dispositions

The independent critique is evidence to assess, not authority. I rechecked consequential external claims in official primary sources and made these dispositions:

| Criticism | Disposition | Evidence-based result |
|---|---|---|
| Frozen discovery attributes the OTIO target_url issue to #1990 / Jan 15; correct issue is #1985 / Dec 11 | **Accept.** | Direct official issue pages confirm #1985 is open, titled “Clarity requested on Media Reference's target_url format,” opened Dec 11, 2025; #1990 is a release-automation/version-matrix issue opened Jan 15, 2026 [R003, R004]. Keep the correction explicit; do not alter frozen discovery. The reporter’s cross-product behavior remains a report, not a reproduced test. |
| MLT “v7.40.0 latest” may have changed during a nine-minute window | **Amend; resolve with the available release chronology.** | The official release page now marks v7.42.0 (11e84ec) latest and displays it as released Oct 3 18:34, while the investigator source capture is dated Oct 12 02:40 UTC. The release page does not provide a preserved historical snapshot or an explicit timezone for the displayed clock, but its displayed date is over a week earlier; the available record supports that v7.40.0 was already stale at the recorded capture. The critic’s “could have appeared during nine minutes” uncertainty is not supported by this date. Pin the exact shipped release. v7.30.0 (d6eaddc) records the cited AVCHD frame-rate and mixed-rate XML fixes, not a guarantee for every camera [R002]. |
| Draft listed paragraph 5 before paragraph 4 | **Accept.** | The final crosswalk follows the released order: four substantive paragraphs, then the repeated deadline clause. |
| Timestamp/time-base recommendation lacked an exact API locator | **Accept and amend.** | Direct FFmpeg Doxygen review confirms decoded AVFrame presentation timestamp is in time_base units and that best_effort_timestamp is heuristic; the proposed source-native model is still subject to the selected build’s behavior [R001]. |
| Draft points to an investigator Goal terminal receipt outside the stage input map | **Accept and remove.** | This proposal makes no claim about the investigator’s Goal lifecycle and does not rely on an unlisted receipt. The current reviser’s native Goal receipts are process artifacts, not product/source evidence. |

The critique’s broad conclusion that the architecture is sound is consistent with this independent review, but the disposition above rests on source checks and clause coverage rather than agreement alone.

## Proposed validation plan — not executed

1. **Synthetic timing oracle:** Create future local fixtures for two devices with known offsets; include a known affine-drift case, and a piecewise case only if that model is implemented. Record expected clock transforms independently of the app.
2. **VFR and stream selection:** Include irregular video PTS, nonzero/negative starts, decode/display reordering, missing/duplicate/non-monotonic PTS, missing duration, fractional rates, a long duration, and two distinguishable audio streams plus audio-only PCM cues at known sample boundaries. Compare inventory with decoded frame/sample identity and explicit selection.
3. **Clock uncertainty:** Include absent and conflicting wall-clock/timecode values. Verify raw values/provenance remain visible, no common-clock inference occurs, and manual anchors or abstention work.
4. **Excerpt/alignment/transcript revisions:** Change an offset and (if supported) drift; verify impact preview, old/new projected positions, residuals, pin/rebase, undo, orphaned anchors, and unchanged source-time anchors. Correct transcript words and verify stable IDs/bounds; separately reanchor and record old/new positions.
5. **Immutability and preview interruption:** Hash originals before and after every operation. Stop thumbnail/waveform/proxy generation mid-job; confirm no partial result is marked complete, cache recovery/rebuild works, quota is honored, and originals are unchanged.
6. **Relinking and package movement:** Export multiple excerpts from one source and assert each unique source is included once. Move the package under a different absolute root and resolve references/hashes. Test missing/corrupt files, renamed sources, duplicate basenames, same-name/different-hash candidates, matching bytes with wrong stream selection, and path-traversal archive entries. Require explicit relink and containment checks.
7. **Package modes:** Verify “originals included,” “proxy review copy,” and “external originals required” labels and behavior. Confirm the reference package fails clearly when external media are absent and that the proxy package is not described as an original archive.
8. **Public media and release matrix:** After recording license, source, exact file hash, and decoder version, select a small pinned FFmpeg FATE subset and separately licensed public media. Keep those separate from the deterministic synthetic oracle. Test supported OS/build combinations, multi-track playback, schema migration, export/import, and offline operation. FATE validates FFmpeg/build behavior, not this application's alignment, annotation, or package semantics.

**Checks actually run:** Read the assigned brief and named predecessor artifacts; reviewed their source maps; independently opened/rechecked the official AVFrame API docs, MLT releases, FFmpeg seek/formats docs, OTIO file-bundle docs, and OTIO #1985/#1990 pages. Research access times are recorded in source-map.json; per-request browser timestamps were unavailable. No app implementation, software test, executable witness, sample download, fixture creation, probe/decode, package round-trip, or integration validation was run. All validation steps above are future work.

## Navigable source map

source-map.json merges the investigator’s original IDs S001–S017, critic’s independent IDs C001–C014, and reviser’s direct rechecks R001–R007. Existing IDs retain their source identities. Each record includes exact URL, version/commit or UNKNOWN, locator, access UTC/window, observed operation, governing default/condition/exception, and applicability. The map also records the frozen-discovery correction and critic-disposition audit. Begin with:

- Time representation and seeking: [S001](https://ffmpeg.org/ffprobe.html), [S002](https://www.ffmpeg.org/ffmpeg.html), [S003](https://www.ffmpeg.org/ffmpeg-formats.html), [R001](https://ffmpeg.org/doxygen/trunk/structAVFrame.html), [R005](https://www.ffmpeg.org/ffmpeg.html), [R006](https://www.ffmpeg.org/ffmpeg-formats.html).
- Maintained tools and path behavior: [S004](https://github.com/mltframework/mlt/releases), [S006](https://docs.kdenlive.org/en/project_and_asset_management/file_management/project_files.html), [S007](https://docs.kdenlive.org/en/project_and_asset_management/project_settings/proxy_settings.html), [S008](https://www.mpi.nl/tools/elan/docs/manual/Sec_Synchronizing_video_files.html), [S009](https://www.mpi.nl/tools/elan/docs/manual/Sec_Changing_the_links_to_media_files.html), [S010](https://www.mpi.nl/tools/elan/docs/manual/Sec_Media_Files_and_Annotation_Files.html), [S011](https://www.mpi.nl/tools/elan/docs/manual/Sec_The_Media_Player_options.html), [S012](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/releases), [S013](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/main/docs/tutorials/otio-filebundles.md), [R002](https://github.com/mltframework/mlt/releases), [R007](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/blob/main/docs/tutorials/otio-filebundles.md).
- Corrected issue history and transfer integrity: [S014](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/issues/1985), [S015](https://datatracker.ietf.org/doc/html/rfc8493), [S017](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/issues/1990), [R003](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/issues/1985), [R004](https://github.com/AcademySoftwareFoundation/OpenTimelineIO/issues/1990).
- Test-fixture context: [S016](https://www.ffmpeg.org/fate.html), [C014](https://www.ffmpeg.org/fate.html).
