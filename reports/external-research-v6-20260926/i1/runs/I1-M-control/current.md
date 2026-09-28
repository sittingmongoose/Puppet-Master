# Slide Scout 0.5 research report (CURRENT)

Scope: local read-only desktop viewing of OME-Zarr 0.5 filesets (brief.md lines 1-5). Admitted corpus is exactly case/sources/S001..S125 per case/catalog.json; no live fetching was performed. The thin Plan (case/plan/Viewer.md) is specified coverage, not implemented behavior. Every validation proposal below is UNEXECUTED — a distinguishing check to run, never a passing test. No claim in this report is declared independently verified.

## R-01 — Zarr v3 foundation with full feature surface (correction)

Supported proposition (O-001, O-033, O-037): OME-Zarr 0.5 is implemented on Zarr format version 3, and all Zarr features (codecs, chunk grids, chunk key encodings, data types, storage transformers) may be used unless explicitly disallowed. No disallowed-feature list was located in S003 lines 1-400 read. 0.4 used Zarr v2 + .zattrs (O-037), so v2 metadata paths must not be reused.

Plan fit: Viewer.md line 5 ("opens a local OME-Zarr 0.5 fileset") and line 9 ("interoperate with filesets from real OME-Zarr 0.5 tools") assume decoding works but name no storage layer. This is a correction: the Plan's silence on Zarr v3 reads as a narrower obligation than the format imposes.

Exact constraint: decode groups/arrays from zarr.json; honor per-array chunk_key_encoding (O-033) rather than hardcoding separators; never assume a fixed codec/chunking/dtype subset.

Consequence: any Zarr v3 construct Slide Scout cannot decode (unknown codec, transformer, chunk grid) must trigger the Plan line 7 explain-which-data path, not a crash or silent misrender.

Validation proposal (unexecuted): open a fixture matrix of minimal 0.5 groups exercising default vs sharded chunk grids and null/blosc/gzip/zstd codecs; assert each opens or produces a named-codec explanation. Distinguishes full-surface compliance from fixed-subset decoding.

## R-02 — ShardedCodec support is a compat requirement (correction)

Supported proposition (O-039, O-040, O-029, O-035): the real 0.5 array capture S055 is sharding_indexed (shard [1,10,512,512], inner [1,1,256,256], bytes little-endian + blosc/zstd clevel 5 + crc32c, uint16); the challenge migration optionally shards data and cites 21 GB-1 TB samples; WEBKNOSSOS recommends sharded Zarr v3 output. Zarr v3 rejects v2-style compressor config (O-035).

Plan fit: Viewer.md lines 5 ("chooses an available pyramid level") and 7 ("large image reads run in the background") miss sharding entirely. Correction: without sharding_indexed + bytes-to-bytes codec chains, real 0.5 filesets do not open at all.

Exact constraint: support sharding_indexed with nested bytes/blosc(/gzip/zstd)/crc32c chains at minimum; chunk shapes come from array metadata only.

Consequence: failure to decode sharding is an open failure for the whole image/level and must be explained per Plan line 7; it must never present as repetitive tiling (cf. the vizarr allegation O-032).

Validation proposal (unexecuted): open S055-shaped sharded fixture plus an unsharded control; assert identical pixels and no tiling artifacts. Distinguishes correct shard indexing from chunk-grid confusion.

## R-03 — ome namespace + hierarchy-consistent version (correction)

Supported proposition (O-002, O-033): 0.5 metadata lives at zarr.json attributes.ome with string version, and the version MUST be consistent within a hierarchy. Per-object versions moved up into ome (O-033). The pinned ome-zarr-py reader instead reads multiscales[0].version defaulting to 0.1 (O-017) — a visible contradiction between the 0.5 spec capture and that reader pin's expectation.

Plan fit: Viewer.md has no metadata-location or version rule; discovery (line 5) cannot be correct without one. Correction.

Exact constraint: parse path attributes.ome.version; require hierarchy consistency; tolerate extra ome keys such as _creator (O-030, O-038).

Consequence: missing/foreign namespaces or inconsistent versions are malformed-input feedback cases (Viewer.md line 11), not silent mixed-version opens.

Validation proposal (unexecuted): fixtures with (a) missing ome key, (b) version 0.5 vs 0.4 mixed across levels, (c) extra _creator key; assert (a)/(b) explain precisely and (c) opens. Distinguishes namespace/version gating from blind parsing. Reader behavior on inconsistency was not located in S003 lines 150-165 (O-002) and stays unresolved.

## R-04 — dimension_names must match axes names (correction)

Supported proposition (O-003, O-039): each multiscale level array zarr.json MUST include dimension_names matching axes names (clarified in 0.5.2). S055 shows a conforming instance ([c,z,y,x]).

Plan fit: Viewer.md line 11 acceptance ("calibrated coordinate display") assumes axis identity is known; without this check axes can silently misalign. Correction.

Exact constraint: per-array equality check dimension_names == [axes names]; mismatch is malformed input with named-array feedback.

Consequence: prevents transposed-axis display and wrong unit attachment.

Validation proposal (unexecuted): fixture with swapped dimension_names on one level; assert the viewer refuses that level with a named explanation rather than rendering transposed. Real-writer omission rate was not located in the specified search (O-003); unresolved.

## R-05 — Axis roles from axes type+order, never fixed positions (correction)

Supported proposition (O-004, O-027): 2-5 dims, 2-3 space axes, order t then channel/custom then space matching array order; spatial zyx is SHOULD. bioformats2raw defaults TCZYX (O-027) but that is writer habit, not reader license.

Plan fit: Viewer.md line 5 ("channel visibility controls, time-point and plane selection where relevant") presupposes roles are known. Correction: roles must be derived per fileset.

Exact constraint: channel/time/plane controls bind to axes entries by type+order; custom-type axes get an explicit defined behavior (slider vs channel treatment is product choice, O-004).

Consequence: fixed (t,c,z,y,x) indexing would misbind controls on 2D, 3D, or custom-axis filesets.

Validation proposal (unexecuted): 2D (y,x), 4D (c,z,y,x per O-038), and custom-axis fixtures; assert controls appear only for present roles and bind to the right dims. Distinguishes derived binding from positional assumption.

## R-06 — Per-level scale+translation composition incl. multiscales-level stacking (correction)

Supported proposition (O-005, O-025): per-dataset coordinateTransformations is mandatory: exactly one scale, optional one translation after scale, vector length == ndim; an optional multiscales-level entry of the same shape applies after per-level ones. Matrix evidence (O-025) shows readers honor these four slots unevenly (dataset-translation only in napari; multiscales-level widely ignored).

Plan fit: Viewer.md lines 5 and 11 require calibrated coordinates but define no transform composition. Correction: four distinct slots with a stacking order.

Exact constraint: physical = multiscales-level(scale,translation) applied after per-level(scale,translation); scale-first ordering; length==ndim enforced.

Consequence: ignoring translation or the multiscales-level entry yields wrong origins/scales (the anisotropic-rendering failure class alleged in O-031).

Validation proposal (unexecuted): fixture with distinct per-level scale, per-level translation, and multiscales-level scale; assert displayed origin/spacing equals the composed value at two levels. Distinguishes full stacking from dataset-scale-only parsing.

## R-07 — Relative fallback scales must not masquerade as physical units (correction)

Supported proposition (O-006): where physical scale is unavailable, scale values MUST be relative downsampling factors (default 1.0). How a reader distinguishes physical from relative values was not located in S003 lines 308-316.

Plan fit: Viewer.md line 5 details panel ("dimensions, units and coordinates") implies calibrated display. Correction: the panel needs a calibrated-vs-relative distinction.

Exact constraint: when unit is absent for an axis, present its scale as relative factor, never with physical units; never silently label relative factors micrometers.

Consequence: prevents false-precision coordinates on unitless axes (e.g. channel scale 1.0 in O-038).

Validation proposal (unexecuted): fixture with unitless channel axis and unit-bearing space axes; assert the details panel marks channel scale relative and space scales physical. The distinguishing rule itself is unresolved and needs spec clarification.

## R-08 — Axis type/unit vocabularies are SHOULD-level (covered)

Supported proposition (O-007): type SHOULD be space/time/channel (custom strings allowed); unit SHOULD be a UDUNITS-2 string from the enumerated lists. Missing/unknown values are permitted, not malformed.

Plan fit: Viewer.md line 11 ("units and coordinates") is compatible: display what is present, explain what is absent. Covered — no Plan change, but strict rejection would be a compatibility failure.

Exact constraint: tolerate missing/unknown units and custom types; unit conversion beyond display is not a located obligation.

Consequence: filesets with partial units remain viewable with honest gaps.

Validation proposal (unexecuted): fixture with unknown unit string + custom axis type; assert open-with-explanation, no rejection. Full conversion obligations unresolved.

## R-09 — Multiple multiscales entries need a selection rule (correction)

Supported proposition (O-008, O-017, O-024): the multiscales list may hold >1 entry; S003 gives name-based choice with first-entry fallback (informative example); pinned ome-zarr-py reads only multiscales[0] (O-017); matrix evidence says no listed viewer supports beyond-first, with hard failures on sample 4995115.zarr (O-024).

Plan fit: Viewer.md line 5 discovery/selection covers images, not multiple multiscales within an image. Correction.

Exact constraint: define selection (recommended: name match where meaningful, else first) AND surface the existence of additional entries; never hard-fail.

Consequence: avoids silent data loss (dropped scale variants) and BigDataViewer-class crashes.

Validation proposal (unexecuted): two-entry multiscales fixture; assert the viewer names the active entry, offers the other, and never throws. Normative-vs-example status of name selection is unresolved (O-008).

## R-10 — omero rendering defaults (optional_capability)

Supported proposition (O-009, O-018, O-038): omero is optional-but-constrained (channels/color/window min,max,start,end MUST when present); rdefs defaultT/defaultZ/model, active/label/color/window give initial display. Both pinned readers parse it tolerantly (O-018, S048 lines 293-337). S054 shows defaultT 0, defaultZ 118, model color.

Plan fit: Viewer.md line 5 channel controls + line 9 session-local display settings fit omero as the source of defaults. Optional capability: honor it when present; define fallbacks when absent.

Exact constraint: initial colors/visibility/contrast/defaultT/defaultZ come from omero when present; session changes stay local (Plan line 9); missing omero never blocks opening.

Consequence: first-render matches producer intent (e.g. plane 118 of a 236-stack) instead of arbitrary plane 0.

Validation proposal (unexecuted): S054-shaped fixture; assert initial plane/channel colors/windows match omero, then diverge locally without touching source files. min/max-vs-start/end slider semantics unresolved (O-018, O-038).

## R-11 — Label overlays: integer multiscales + level-count + colors (correction)

Supported proposition (O-010, O-011, O-022): label images are integer-typed (uint8..int64) multiscales with the same level count as the source, listed under labels; intermediate groups allowed but metadata-free; image-label colors/version SHOULD with rgba+alpha SHOULD-honored; properties/source MAY. napari capture defaults labels hidden and squeezes channel axis (O-022).

Plan fit: Viewer.md lines 5 ("optional overlays") and 11 ("aligned label overlays") underspecify the checks. Correction: alignment requires dtype, level-count, and per-level shape/transform verification plus a colors-absent fallback.

Exact constraint: verify integer dtype + level-count match + per-level geometry before overlay; honor colors array when present; default hidden with explicit toggle.

Consequence: prevents misaligned overlays and undefined rendering when image-label is absent.

Validation proposal (unexecuted): fixtures (a) conforming labels, (b) level-count mismatch, (c) missing image-label; assert (a) aligns toggled-hidden, (b) explains refusal, (c) renders with a fallback palette. Same-count-implies-same-shapes is unresolved (O-010).

## R-12 — HCS plate/well/acquisition navigation (product_choice)

Supported proposition (O-012, O-030, O-042): plate (rows/columns/wells + rowIndex/columnIndex, optional acquisitions/field_count/name) and well (images/path/acquisition) are specified; sparse plates allowed; real 0.5 plate S056 shows unsorted wells, missing acquisitions, field_count 32 as maximum. Reader history shows missing-wells, non-5D, and hard-coded-field-path bugs (O-042). Stitched-grid vs per-field opening differs between readers (S018 lazy grids vs S048 get_pyramid_lazy).

Plan fit: Viewer.md line 5 lists "images it finds" with no plate/well/field/acquisition navigation. Product choice: decide the HCS navigation model (plate→well→field picker vs stitched overview vs both). The brief's "find images within a fileset" (brief.md line 3) pulls toward at least a picker.

Exact constraint: whatever is chosen must sort by rowIndex/columnIndex (not list order), tolerate absent acquisitions and extra keys, and treat field_count as maximum.

Consequence: a choice is forced — HCS filesets (incl. 1 TB plates per O-029) are in-scope filesets with no specified navigation today.

Validation proposal (unexecuted): S056-shaped sparse plate fixture; assert every listed well is reachable, empty row/cols are marked absent (not errors), and navigation never assumes field path "0". UI shape unresolved by design.

## R-13 — bioformats2raw collections + OME-XML series (correction)

Supported proposition (O-013): transitional layout==3 multi-image collections (numbered 0..N fallback, OME/METADATA.ome.xml + series list, plate precedence) remain specified 0.5 compat surface; readers SHOULD NOT default to first-image-only. napari PR #123 tests single, 3-image, and 9-image-grid layouts (O-036).

Plan fit: Viewer.md line 5 discovery assumes image-level opening. Correction: root collections need enumeration and a series picker honoring series order == OME-XML Image order.

Exact constraint: enumerate series (series list or 0..N fallback); plate key takes precedence when both present; never silently open only the first image.

Consequence: multi-series filesets become navigable instead of misleadingly single-image.

Validation proposal (unexecuted): 3-series layout fixture with OME-XML; assert all three listed in series order and first-image-only never the silent default. OME-XML parsing depth for a read-only viewer unresolved (O-013).

## R-14 — Render dtype list with explain-and-skip (product_choice)

Supported proposition (O-028, O-010, O-039): the format permits all Zarr dtypes (O-001); Viv documents int8/16/32, uint8/16/32, float32/64 (O-028); labels require integer dtypes incl. uint64/int64 (O-010); real capture is uint16 little-endian (O-039, O-027).

Plan fit: Viewer.md is silent on dtypes; line 7 open-failure explanation covers the fallback. Product choice: publish Slide Scout's supported dtype list; everything else gets named explain-and-skip.

Exact constraint: the list must cover at least the Viv set + label integers incl. 64-bit, or explicitly justify exclusions; float16/complex/bool need a stated verdict.

Consequence: avoids Viv-parity-by-accident and silent truncation of 64-bit labels.

Validation proposal (unexecuted): one-level fixtures per dtype incl. uint64 labels and float64; assert each renders or names its exclusion. Minimal acceptance set unresolved (O-028).

## R-15 — Codec floor: null/blosc/gzip/zstd + sharding (correction)

Supported proposition (O-026, O-035, O-039): bioformats2raw documents 0.5 writer codecs null/blosc/gzip/zstd (zlib no; default blosc/lz4 clevel 5) with blosc/zstd/gzip parameters; real capture uses blosc/zstd inside sharding_indexed (O-039); v3 requires bytes-to-bytes codecs (O-035).

Plan fit: Viewer.md line 9 interop with real 0.5 tools requires this floor; line 7 covers the failure path. Correction: name the floor explicitly.

Exact constraint: must decode null, blosc (cname lz4/zstd/zlib/blosclz/lz4hc, shuffle variants), gzip, zstd incl. inside sharding_indexed; unknown codecs produce named-data explanations.

Consequence: bioformats2raw- and challenge-shaped filesets open; exotic codecs degrade honestly.

Validation proposal (unexecuted): per-codec single-chunk fixtures incl. one nested in sharding; assert decode-or-named-explanation for each. In-the-wild distribution unresolved (O-026).

## R-16 — Anisotropic + non-2 + Z-downsampled pyramids (correction)

Supported proposition (O-023, O-024, O-031, O-038): scale factors need not be 2 (vizarr failure alleged, O-024); Z may downsample (equal-Z assumption alleged, O-023); ignoring scales misrenders anisotropic volumes (O-031); S054 shows XY-only + anisotropic spacing as one valid shape.

Plan fit: Viewer.md line 5 ("chooses an available pyramid level appropriate for the current view") assumes level choice exists but defines no mapping. Correction: mapping must derive from per-level shapes/scales, never 2x/XY-only assumptions.

Exact constraint: zoom-to-level mapping uses actual scale vectors and shapes per level incl. Z; level ordering largest-to-smallest per datasets order (S003 lines 304-306).

Consequence: correct zoom, aspect, and scale display on non-dyadic and Z-downsampled pyramids.

Validation proposal (unexecuted): 3-level fixture with 3x XY factor and 2x Z factor + anisotropic base; assert level choice, aspect, and scalebar match composed scales at each zoom. 0.5 prevalence unresolved (O-024).

## R-17 — Foreground responsiveness: background reads + cancel + TB-scale validation (covered)

Supported proposition (O-029, O-034): challenge samples reach 21 GB-1 TB with sharding; ~1 TB v0.5 store read reported working with napari-ome-zarr (O-034); resave bounds memory with 16 parallel chunks (S034 lines 222-229).

Plan fit: Viewer.md lines 7 ("background", "cancels work no longer needed") and 11 ("must not freeze") already specify this. Covered.

Exact constraint: chunk-level async reads; view change cancels in-flight work; memory bounded independent of dataset size.

Consequence: TB-scale plates/images stay navigable.

Validation proposal (unexecuted): 100+ GB sharded fixture; assert interaction latency stays within budget during a pan/zoom burst and cancelled reads release promptly. Concrete budgets are product choice.

## R-18 — 0.4 input boundary (product_choice)

Supported proposition (O-037, O-041): 0.4 (Zarr v2, .zattrs, per-object versions) is structurally disjoint from 0.5; AGAVE claims dual 0.4/0.5 desktop support as an existence proof (O-041), which creates no obligation here.

Plan fit: Viewer.md says 0.5 only (line 5). Product choice: explicitly reject-or-explain 0.4 input, or widen scope to dual support with stated fallback behavior.

Exact constraint: whichever is chosen, 0.4 layouts must never be half-parsed (no .zattrs read as zarr.json, no v2 separators assumed).

Consequence: honest boundary instead of confusing partial opens.

Validation proposal (unexecuted): 0.4 .zattrs fixture; assert the chosen behavior (named rejection vs full dual open) with no partial render. Decision itself unresolved.

## R-19 — Forward tolerance for post-0.5 metadata (correction)

Supported proposition (O-021, O-043): RFC-5 (0.6.dev3) adds coordinateSystems/scenes/rotation/affine graphs; napari capture already parses them and warns-and-skips unknown transform types (O-021).

Plan fit: Viewer.md line 11 malformed-input feedback must distinguish corrupt-vs-future. Correction: unknown transform types and 0.6-style keys are warn-and-continue, not errors, while 0.5 scale/translation stays exact.

Exact constraint: skip-with-warning coordinateSystems/scene/rotation/affine/sequence; state in the UI that calibration excludes skipped transforms (wording is product choice, O-021).

Consequence: 0.5 filesets with forward-looking metadata remain viewable without adopting RFC-5 semantics.

Validation proposal (unexecuted): 0.5 fixture + one rotation entry; assert open with visible warning and documented calibration caveat. Contamination prevalence unresolved (O-043).

## R-20 — Simpler alternatives worth adopting (optional_capability)

Supported propositions: (a) direct-Zarr-v3 dependency instead of a full OME framework (O-036, PR #123 lead); (b) per-channel layers sharing spatial transforms with labels kept whole (O-019); (c) scale-separated-from-affine calibration math (O-020); (d) read-only-first shipping aligned with the #404/#413 read/write split (O-034); (e) validator-first entry-point disambiguation (/0 suffix habit, O-034).

Plan fit: compatible with Viewer.md lines 5-9; these are implementation strategy options, not coverage gaps. Optional capability as a bundle: adopt any subset.

Exact constraint: none beyond the referenced items' own constraints; each adoption must keep its validation proposal.

Consequence: smaller dependency surface, proven channel/label patterns, earlier read-only delivery.

Validation proposal (unexecuted): spike each adopted alternative against the R-01..R-19 fixtures; assert no regression vs the current approach. Adoption decisions unresolved.

## Deferred items (current, with reasons)

- D-01 Full S010 catalog scan (lines 121-1160): deferred for budget; only lines 1-120 read (O-045). Reason: version-mixed catalog needs a bounded filter pass to identify 0.5 rows; recorded as unknown, not absent.
- D-02 AGAVE/TensorStore/QuPath/neuroglancer deep reads (S073-S125 issue corpora): deferred for budget. Reason: high-volume, low-marginal-yield after the format+reader core; any dtype/codec claims from those vendors stay unresolved, not rejected.
- D-03 RFC-5 full semantics: deferred as out-of-scope post-0.5 (O-043). Reason: 0.5 obligations are decidable without it; only the forward-tolerance posture (R-19) is needed now.
- D-04 OME-XML parsing depth (O-013), min/max-vs-start/end semantics (O-018/O-038), defaultZ indexing basis (O-038): deferred pending spec clarification. Reason: not located in the specified searches; guessing would fabricate requirements.

## Unresolved disputes (current)

- U-01 Version-location contradiction: S003/S004 place the version at attributes.ome.version (O-002/O-033); pinned ome-zarr-py reader.py reads multiscales[0].version defaulting to 0.1 (O-017). Both records stand. Current posture: follow S003 (final spec capture) for Slide Scout and treat the reader behavior as a legacy-compat data point. Challenge: a 0.5 fileset carrying only per-multiscale versions would invert this; no such instance was located in the specified search (S054/S056 carry ome/version). Unresolved scope, not a rejection of either record.
- U-02 Labels-registration design: PR #206 proposed moving labels registration into the multiscale group (O-033), contested in review (S004 lines 405-430). S003 keeps the labels-group list (O-010). Current posture: S003 authoritative. The proposal itself is neither adopted nor refuted beyond that scoping; unresolved as a design question, closed as a Slide Scout requirement (follow S003).
- No unsupported disposition was assigned: nothing researched so far warranted rejection, so no unsupported-rejection dispute exists. Anything not located is marked unresolved with its bounded domain, never silently discarded.

## Coverage

Sources read fully (all lines): S001, S003 (full 896 lines in two windows), S005, S007, S016, S017, S018, S019, S025, S030, S033 (full 518), S043 (full 566 in two windows), S048 (full 722 in two windows), S053, S054, S055, S056, S072.
Sources read partially via targeted regex search (variants recorded in O-031/O-032/O-033/O-034/O-035/O-036/O-037/O-040/O-043): S004, S008, S011, S013, S014, S027, S051, S058, S059.
Sources read partially by window: S010 (lines 1-120 of 1160), S034 (lines 1-280 of 366), S041 (lines 1-194 of 212), S070 (lines 1-100 of 212), S009 (lines 1-97 of 97 — complete listing file), S020 (lines 1-100 of 344).
Corpus-integrity gaps: S002 empty; S005/S007/S030 capture-error placeholders (O-044). S006 and all S021-S024, S026, S028-S029, S031-S032, S035-S042, S044-S050, S052, S057, S060-S071, S073-S125 were not visited in this budget window; no absence or truth claim is grounded on unvisited sources — a missed string, empty result, or unsearched field proves neither absence nor truth.
Unvisited questions: 0.5 codec/sharding distribution in the wild; writer omission rate for dimension_names; min/max-vs-start/end and defaultZ semantics; OME-XML depth; dual 0.4/0.5 decision; minimal dtype acceptance set; RFC-5 contamination prevalence. Each is recorded above as unresolved with its bounded evidence limits.
Gap disclosure: no observation, draft, snapshot, or history record existed before this session; out/observations.md (O-001..O-045), this draft, out/history.md, and out/snapshots/0001.md were all created in this session. Nothing was reconstructed from a prior final answer.
