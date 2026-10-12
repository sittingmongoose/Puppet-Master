# Review draft — C-P02 interview preparation workspace

## Executive recommendation

Use an offline, non-destructive project manifest as the authority for source identity, stream selection, source-clock coordinates, alignment revisions, transcript annotations, excerpts, comments, and package references. Treat FFmpeg/ffprobe as version-pinned adapters for inspection and derived media, not as the project model. Retain an exact source-native time representation and expose millisecond/timecode labels only as views with visible rounding. Default to source-bound excerpt/comment anchors; display projected aligned positions through a selected alignment revision. Never make new derived media by changing the imported original.

A small first release can support multiple assets/audio streams, manual per-asset offset, source-time excerpts, stable transcript/comment anchors, thumbnails/waveforms on demand, and a checksummed package with explicit “originals included”, “proxy review copy”, or “external originals required” mode. Label constant-offset-only support and uncertainty. Add drift fitting and dense frame-by-frame decoded diagnostics as later scope if validation demonstrates need. This keeps a usable offline path while accounting for separate-device timing and VFR.

The proposal does not establish a chosen decoder version, supported input matrix, licensing for any FATE sample, or the product decision about whether an approved excerpt follows later alignment edits. Those remain release and owner choices below. Discovery covers all original brief obligations; proposed validation is distinguished from checks run.

## Exact per-clause disposition of the released provisional plan

### Plan paragraph 1: media store, timeline and time authority

| Plan clause | Disposition | Rationale and resulting requirement |
|---|---|---|
| “content-addressed media store” | **Correct / constrain** | Keep each imported original immutable and identify exact bytes by SHA-256. A hash-addressed logical identity or cache can deduplicate byte-identical assets, but do not require copying every original into a second canonical store or duplicate it per excerpt/review. Preserve original location and a project/package-relative location separately. A hash identifies bytes, not a semantic stream or the intended audio channel; the asset record must also retain stream IDs and channel mapping. BagIt checksums protect a transported payload but provide no media semantics [S015]. |
| “each interview as a collection of tracks” | **Accept with precision** | Model the interview as assets plus selected streams/tracks and explicit relationships, not one presumed common clock. Record container stream index, codec, sample rate or frame timing, channel layout and available disposition/language metadata; retain every stream even when the reviewer selects one. ffprobe stream specifiers can select the second audio stream as distinct from all audio streams [S001]. |
| “Imported metadata would establish one project timeline” | **Reject as authority; keep as evidence** | An imported start/timecode/date may propose a starting relationship, but each source retains its own presentation clock. Store metadata origin, field, raw value, parser/tool version and a confidence/quality state. A user-approved alignment transform maps named source clocks into review/project time. FFmpeg’s wall-clock timestamp option defaults off; enabling it is an explicit behavior, not an assumption [S003]. |
| “timestamps would initially be converted to milliseconds for display and stored excerpt boundaries” | **Correct** | Milliseconds may be the display format. Store boundary as exact integer stream ticks with rational time base or audio sample index/rate, plus a half-open interval, source stream, and chosen resolution. Record a separate resolved frame/sample boundary for a rendered preview. Do not round a VFR frame to nearest millisecond and then lose its PTS/time-base provenance. ELAN’s manual-sync controls and display formats in milliseconds/frame labels are useful UI precedent, not proof they retain this app’s needed source-native precision [S008, S011]. |
| “investigate whether [representation] retains sufficient information for requested inputs” | **Answer: no, not as written** | Millisecond-only boundaries lose the original stream tick/sample coordinate and cannot express the complete provenance of VFR resolution, audio sample boundaries or a changed decoder/index. Preserve source PTS/time base, frame/sample identity, rational conversion, and quantization outcome. Keep original and request values even if a decoder cannot resolve them exactly. |
| “whether embedded timestamps deserve the authority the draft gives them” | **Reject authority** | Do not assume device clocks are common, monotonic, accurate, or even present. Treat embedded wall-clock, SMPTE/timecode, BWF origin/time reference, GPS, and creation date as distinct observations with provenance. Manual correction is always available. Missing/conflicting metadata is shown as unknown/conflict, not silently imputed. |

### Plan paragraph 2: inspection, alignment and revision effects

| Plan clause | Disposition | Rationale and resulting requirement |
|---|---|---|
| “inventory streams before creating a low-resolution preview” | **Accept, with explicit stages** | First do bounded container/stream inventory and show which tracks exist. A probe is not a full decode guarantee. Decode only for thumbnail, waveform, playback, requested frame/sample verification or proxy generation. Keep inspect, decode, and encode job status separate; failures must name the stage and source/stream. ffprobe exposes stream, packet and frame output; FATE illustrates FFmpeg-level tests but not end-to-end app validity [S001, S016]. |
| “alignment would be a per-track offset” | **Accept as MVP** | An offset is easy to review and manually correct. Define direction/sign and source/target clocks explicitly. Store it as an exact signed rational amount, not an implicit frame count or displayed decimal. Save method, shared anchor(s), operator, time, uncertainty and revision. |
| “plus an optional drift adjustment” | **Accept with bounded semantics / owner scope** | If drift is supported, record at least two anchor pairs and an explicit affine map with scale, residual and uncertainty. If behavior is piecewise, record knots and segment rule. Do not infer drift from transcript content or uncertain embedded times. For first release, either ship manual constant offset and label long takes as unverified for drift, or include the affine model only after test coverage; user-facing claims must match the selected scope. MLT release history’s AVCHD frame-rate and mixed-rate fixes supports regression testing of rate assumptions [S004]. |
| “Excerpts, transcript anchors, and comments would refer to project timeline positions rather than container offsets” | **Correct** | No single coordinate is enough. A record should identify its coordinate space. Source-time excerpt bounds and source-time comments remain bound to immutable asset/stream coordinates. Transcript annotations have stable IDs, their source anchor/range and text revision. Project/aligned-time comments can refer to a particular alignment revision. Projection into another track’s time is computed from the named alignment revision. |
| “Updating alignment would automatically recalculate their source positions” | **Reject silent mutation; compute a preview** | Recompute displayed/projected positions, not the source-anchored record itself. Show affected excerpts/comments with old and new positions, residual changes and any invalid/orphaned anchors. Keep the prior alignment revision and provide an explicit accept/keep-pinned action. ELAN offers a manual sync workflow and a separate operation to shift annotations after sync changes; the effect is consequential and should be made visible [S008]. |
| “transcript corrections would preserve anchor identifiers” | **Accept, with revisioning** | Preserve stable annotation IDs and history. A correction changes text/provenance; it does not move the anchor or become timing evidence. Reanchoring is a separate manual action, with before/after values. ELAN stores annotations and time alignment apart from the media [S010]. |
| “semantics of an already approved excerpt need an explicit decision” | **Owner decision required; recommend source pin by default** | Choose whether an approved excerpt follows a new alignment or pins the prior one. Recommendation: immutable source range is always retained; default existing approval pins the alignment revision used for its displayed cross-source context. Offer explicit “rebase to current alignment” with impact preview. That prevents an unseen scope change while allowing deliberate updates. |
| “Compare offset-only and richer alignment models” | **Required comparison** | Offset-only: simple, explainable, minimal inputs, but cannot represent clock drift across long recordings. Affine drift: two or more anchors, captures linear drift but assumes smooth constant-rate divergence. Piecewise map: handles changing drift but increases editing/error surface and uncertainty modeling. MVP: constant offset, plus optional affine mode if synthetic tests and manual UI make assumptions reviewable; no automatic alignment claim. |

### Plan paragraph 3: export and identity matching

| Plan clause | Disposition | Rationale and resulting requirement |
|---|---|---|
| “exports a manifest, previews, transcript changes, and named excerpts” | **Accept and version** | Package project schema, asset manifest, stream selections, alignment and transcript revision data, excerpt/comment anchors, preview provenance, tool versions, and checksums. Include only selected derivatives. Ensure export can be validated without decoding all media, then offer a deeper preview check. |
| “Originals remain external when receiver already has them” | **Accept as an explicit package mode** | Provide a reference package where originals are excluded, but label “external originals required” and include the stable asset ID, exact digest, safe relative path, stream details and expected byte size. Receiver must choose the source folder/relink action; do not imply the package is self-contained. For immediate portability, a package must include media (or one proxy per unique source). OTIOZ copies media into a package; this can be expensive for large interviews [S013]. |
| “matched by digest and a user-selected search location” | **Accept, with order and confirmation** | Digest match is strong byte identity and may auto-confirm exact bytes within an explicitly selected root, but still validate package containment, asset ID, selected stream existence and declared stream identity. A missing digest match should show candidates using name/size/codec/duration only as hints, and require confirmation; do not silently bind a merely similar recording. Preserve ambiguity and report mismatch. |
| “matching digests as enough to resolve all references” | **Reject** | Digest alone does not express package-relative path rules, stream index/channel selection, whether the reference is original or derivative, transcript/alignment revision, or whether a file is available. The digest can verify exact bytes for a file; complete resolution also requires the app’s asset/stream/role mapping and an explicit result. Validate any archive path cannot escape the package [S015]. |
| “metadata, stream identity, unavailable files and storage trade-offs” | **Answer explicitly** | Manifest records selected and unselected streams; unresolved media are explicit Missing/Unavailable records, not removed clips. A user may relink after confirmation. Offer (a) self-contained original package, one copy per unique source; (b) review-copy package, one proxy per unique source with originals-excluded notice; or (c) reference-only package, with companion originals required. Generated previews should be content/version keyed and regenerable. |
| “compare preview-centered review with source-based playback” | **Required comparison** | Preview-centered: responsive on modest hardware and smaller transfer, but may add generation time/storage and conceal decoder support/quality/track differences. Source-based: avoids media duplicate and keeps original as reference but can struggle with storage throughput/codec support. Recommended default: source playback when supported, optional proxy per unique source under a storage quota, visible proxy/original indicator, and “unsupported input” route. Preview must never imply the source has been transformed. |

### Plan paragraph 5: repeated deadline clause

This clause repeats the research-stage time cap and has no product-design requirement. Work concluded when the required research, released-plan review and saved draft were complete, before the absolute stage deadline; no time was consumed waiting. See the native Goal terminal receipt and delivered file set for actual completion state.

### Plan paragraph 4: uncertainty, manual paths and validation

| Plan clause | Disposition | Rationale and resulting requirement |
|---|---|---|
| “Recommend how unsupported streams, changed transcripts, and ambiguous timing should be represented” | **Required** | Unsupported stream state records asset, stream, failed operation, tool/version, reason and attempted remedy; preserve source and manifest so a later adapter can retry. Ambiguous timing stores competing observations/ranges, chosen/manual state and uncertainty instead of a single rounded value. Transcript text is a versioned annotation layer; correction/reanchor are separate actions. Never discard the original timing claim. |
| “offset-only and richer alignment; preview versus source playback” | **Addressed above** | Provide the three alignment choices and two playback modes with their conditions and limits in the owner-ready recommendation. |
| “tests for drift, VFR, relinking, excerpt revision, and interrupted preview generation” | **Accept and expand** | Tests below cover all named cases, plus absent metadata, multi-audio selection, hash mismatch, package traversal, timestamps and immutability. Label these as proposed only. |
| “label any actually executed fixture checks and their limits” | **Executed checks: none** | No fixture was generated/downloaded, no ffprobe/decoder ran, and no package was made. Work executed was reading the brief, primary-source research, and saving this planning artifact. FATE is a future fixture source; its documented suite validates FFmpeg, not the product semantics [S016]. |

## Design record: corrections, optional improvements, owner decisions

### Corrections required for a safe/sound proposal

1. Replace millisecond-only storage with source-native rational ticks/sample positions, half-open ranges, source stream identity and explicit resolution/rounding.
2. Separate source, project/alignment and wall-clock/timecode spaces. Metadata may suggest but never silently establish alignment.
3. Replace automatic excerpt/comment source-position rewrite with impact preview, immutable source anchors and revision-pinned mappings.
4. Replace “digest is enough” relink with a validated, explicit asset + stream + role resolution process. Verify hash and package path; never bind by name alone.
5. Make every package mode and derivative explicit. Do not silently include, transcode, upload, or duplicate originals.

### Optional improvements, ordered after core behavior

- Piecewise drift map after affine/offset validation, with residual visualization.
- Waveform-assisted synchronization as a user aid; any suggested alignment remains a proposal until accepted.
- Proxy profile comparison/quota UI; Kdenlive offers a precedent for optional per-clip/project proxies [S007].
- OpenTimelineIO export/import for exchange with editorial tools; test schema downgrade and importer behavior [S012].
- BagIt wrapper for integrity-oriented handoff [S015].
- Public-clip interoperability demonstration only after permission/license, version and hash capture. FFmpeg FATE is a candidate source of test samples, not a license blanket [S016].

### Decisions for product owner

- Is the first release constant offset only, or must it include affine clock drift? Recommended initial offset-only with visible “drift not modeled” status; include affine if long recordings require dependable sync.
- Should an approved excerpt stay pinned to an alignment revision (recommended), or follow the latest alignment? Store immutable source interval in either case.
- Which portable mode is the default: self-contained originals, small review proxies, or external-original reference package? The smallest mode is not self-contained.
- What exact operating systems, codecs, containers, stream counts and maximum file sizes are supported? Publish an input capability matrix, not “supports all files”.
- Is an export preview an evidence/review artifact or just a convenience? If reviewer decisions depend on it, pin generator/version/settings and validate timeline correspondence.
- May public test fixtures be redistributed? Resolve each license before bundling. No source recording from the documentary team should be used as a test fixture without explicit authorization.

## Recommended minimal architecture

1. **Project manifest**: schema version; project UUID; immutable asset UUID/hash/size; source and package paths; probe result and tool version; all streams; supported/unsupported status.
2. **Alignment ledger**: revision UUID, clock-space IDs, signed rational transform or explicitly chosen model, anchor pairs, method, operator/time, uncertainty/residual, predecessor revision.
3. **Annotation ledger**: stable IDs for transcript turns/words and comments; separate text revisions and coordinate-space anchor; optional speaker/tier IDs; manual timing edits recorded as events.
4. **Excerpt records**: name/ID, source asset and stream, source-native [start,end), preview resolution, alignment revision, approval state and immutable prior versions.
5. **Derivative cache**: thumbnail/waveform/proxy job status and source/settings/version keys; quota, cancellation, interrupted-job cleanup; never replaces originals.
6. **Portable exporter/importer**: one entry per unique asset, safe relative paths, checksums, versioned manifest, selected derivatives; verify in a moved path and surface unresolved media. Use BagIt-compatible integrity envelope if useful; do not mistake BagIt for the timeline schema.

## Proposed validation plan (not executed)

**Synthetic oracle.** Generate local micro-fixtures only in future implementation work: (a) two independent clocks with known offset and known drift; (b) VFR video with irregular presentation intervals and nonzero/negative start; (c) a container with two distinguishable audio streams/channels; (d) audio-only PCM with exact sample-boundary cues; (e) no/conflicting start-time metadata. Include decoder reordering, missing/duplicate PTS, missing duration, fractional rate, long duration and unsupported codec. Keep expected frame PTS/sample indices and cross-clock transform separately generated from app behavior.

**Integrity and state tests.**
- Hash each original before import and after every preview, excerpt and export path; hashes must match.
- Compare ffprobe inventory with the UI, preserve stream choice on save/reopen, and separately verify frame/sample boundaries through decoding. Record exact FFmpeg build/options.
- Reopen project and confirm source time, offsets, transcript ID/text and annotation bounds stay exact through save/load and schema migration.
- Change one offset and one drift scale; confirm impact report identifies changed aligned excerpt positions and comments while source-time anchors remain fixed. Test pin/rebase and undo.
- Correct transcript spelling and confirm anchor IDs/bounds are unchanged; explicitly reanchor and verify a revision records the old/new anchor.
- Stop preview generation mid-job; restart; ensure incomplete cache entries are discarded/retried, source stays unchanged, and UI does not show a partial preview as complete.
- Export multiple excerpts from one asset; assert a self-contained package includes that asset once. Move package to a fresh root with a different absolute path and verify all internal refs and hashes. Reference-only package must report external originals required; proxy package must identify proxy-only review.
- Test renamed files, duplicate basenames, corrupt file, same name/different hash, matching bytes with different stream selection, missing audio track, and a path traversal archive entry; only explicit valid relink may clear unresolved status.

**Public fixtures and limits.** After licenses and file hashes are recorded, use a small pinned subset of FFmpeg FATE samples and independent public-domain/licensed media to check real demuxers. Keep those separate from synthetic expected-output fixtures. FATE tests codec/tool behavior, not whether this application implements the alignment/approval semantics. No fixture checks were executed during this research.

## Source and confidence notes

Source records S001–S017 and direct links are in [sources/index.md](sources/index.md); machine-readable identity, locator, access window, observed operation, governing conditions/defaults/exceptions and applicability are in [source-map.json](source-map.json). Primary official manuals/releases/specification and the official OTIO release history and exact issue pages informed this draft. The browser initially surfaced a misleading issue-list association: frozen discovery says #1990 for the target_url issue. Direct page review established that #1990 concerns release automation updating the version matrix [S017], while the correct target_url interoperability issue is #1985 [S014]. Discovery was not edited after its hash was frozen; source-map.json, sources/index.md and this draft carry the corrected record. The browser displayed excerpts/pages, not pinned archival snapshots. Several live docs did not expose exact commit/version, recorded as UNKNOWN; recheck and pin the actual shipped decoder/framework releases before implementation. MLT release notes establish that specific fixes shipped; they do not prove every camera/container variant is fixed. The open OTIO target_url issue is a risk signal, not proof that OTIO cannot bundle media. ELAN demonstrates workable manual sync/relink flows, but its documented millisecond interface should be tested against intended VFR/precision requirements.
