# Delivered research result

TEST_ONLY_NEVER_PROMOTE. Host-assembled from immutable stage-1 draft blocks and the same-model verifier's explicit per-block decisions. Only section 1 and section 4 are asserted content. Section 2 records rejected draft assertions; section 3 holds proposals that were not verified (unresolved, undecided, or with a malformed verifier record) and earns no verified-retention credit. Section 5 is history.

## 1. Current asserted findings

#### [B-001] CONFIRMED
Context: (document top)

Basis: supported
Reason: Scope matches the brief (local read-only desktop browser for OME-Zarr 0.5); the remaining sentences are method framing consistent with the case inputs.
Evidence: brief.md lines 1-5, plan/Viewer.md lines 1-11

# Slide Scout 0.5 research report (draft)

Scope: local read-only desktop browser for OME-Zarr 0.5 filesets (brief.md). This report assesses the thin Plan snapshot (plan/Viewer.md) against the fixed corpus case/sources/*.txt. A Plan passage marks specified coverage, not implemented or tested behavior. Nothing here is independently verified beyond the corpus; validation ideas are checks to run, not passed tests.

#### [B-004] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Format obligations (0.5 authority: S003 + S053)

Basis: supported
Reason: S003 states Zarr v3 only with all Zarr features allowed unless disallowed, and ome-namespaced version metadata consistent within a hierarchy.
Evidence: S003 lines 68-72, S003 lines 150-156

- P1. 0.5 is Zarr v3 only, with metadata in `zarr.json` under `attributes.ome` and `version: "0.5"` consistent through the hierarchy [O-001, O-002]. All Zarr features are allowed unless disallowed, so arbitrary codecs, chunk grids, key encodings, dtypes and transformers are legal input.

#### [B-005] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Format obligations (0.5 authority: S003 + S053)

Basis: supported
Reason: Axes range/order, dimension_names match, largest-first datasets, exactly-one-scale plus optional translation after it with axes-length vectors, and top-level transforms applied after per-dataset ones are all in S003; arbitrary level names are confirmed by the WEBKNOSSOS doc.
Evidence: S003 lines 296-316, S003 lines 173-174, S058 lines 320-323

- P2. Multiscales images are 2-5D with ordered axes (time, channel/custom, space), `dimension_names` on every level array matching axes names, datasets ordered largest-first with arbitrary path names, each dataset carrying exactly one scale plus optionally one translation after it, vectors matching axes length; an optional top-level multiscales transform applies after per-dataset ones [O-003, O-004, O-005, O-006, O-066].

#### [B-006] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Format obligations (0.5 authority: S003 + S053)

Basis: supported
Reason: S003 makes omero optional with required channels/color/window{min,max,start,end}; rdefs/active/label appear as display defaults in the spec example and both readers consume them.
Evidence: S003 lines 401-430, S018 lines 335-388, S048 lines 293-335

- P3. `omero` is optional transitional render metadata; when present, `channels` with 6-hex `color` and `window {min,max,start,end}` are required, plus `rdefs {defaultT, defaultZ, model}` and per-channel `active/label` as display defaults [O-008, O-067].

#### [B-007] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Format obligations (0.5 authority: S003 + S053)

Basis: supported
Reason: Every element (labels-group container, metadata-free intermediates, 8-member integer dtype set, SHOULD-listed labels array, multiscales with equal level count, SHOULD image-label with colors/version plus optional properties and source.image default ../../) is in S003.
Evidence: S003 lines 431-474

- P4. Labels live under a `labels` group (not an image), allow metadata-free intermediate groups, require integer dtype from a fixed 8-member set, SHOULD all be listed in the labels-group `labels` array, are themselves multiscales images with the same level count as the source, and SHOULD carry `image-label` with `colors` (label-value + optional rgba), `version`, optional `properties`, and `source.image` default `../../` [O-009, O-010].

#### [B-008] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Format obligations (0.5 authority: S003 + S053)

Basis: supported
Reason: S003 defines the plate/row/well/field hierarchy with the stated strict plate and well keys, requires full row/column extent even when wells are undefined, and the sparse-plate example matches S056.
Evidence: S003 lines 118-129, S003 lines 530-560, S003 lines 744-752, S056 lines 10-73

- P5. HCS layout is plate -> row groups -> well groups -> field images, with strict plate keys (rows, columns, wells with consistent path/rowIndex/columnIndex, version) and well keys (images with unique alphanumeric path, acquisition id when multi-acquisition) [O-011, O-012, O-013]. Sparse plates list full row/column extent but only present wells [O-023].

#### [B-009] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Format obligations (0.5 authority: S003 + S053)

Basis: supported
Reason: The precedence and SHOULD claims are correct, but the layout value is the string "3" in S003, not the bare number 3.
Evidence: S003 lines 256-275

Active (verified replacement; the draft text is superseded history):

- P6 (corrected). `bioformats2raw.layout` transitional packaging: conforming groups MUST carry the string value "3" for the `bioformats2raw.layout` key in top-level OME-Zarr metadata (S003 lines 256-257). Image discovery precedence: plate locations when plate metadata is present (with SHOULD-provided series for unaware tools), else the OME-group `series` path list ordered to match OME-XML Image elements, else consecutively numbered groups `0,1,2...` (S003 lines 261-270). Conforming readers SHOULD make users aware of more than one image rather than defaulting to the first (S003 lines 271-272). Conditions: version 0.5 transitional collections, typically bioformats2raw conversions. Plan fit: F1 discovery (Plan L5) must implement this precedence instead of a flat list. Consequence: the browser must surface all series images with hierarchy-aware navigation. Validation idea: open a multi-series bioformats2raw fixture plus a plate-carrying one and check listed images and order against the validator.

#### [B-010] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Format obligations (0.5 authority: S003 + S053)

Basis: supported
Reason: The v2->v3 break, the v2 marker files vs zarr.json with flat vs ome-namespaced attrs, and the 0.5.1/0.5.2 clarifications are all attested in the cited sources.
Evidence: S003 lines 68-72, S003 lines 824-833, S034 lines 43-44, S058 lines 301-310, S043 lines 261-264, S019 lines 87-90

- P7. The 0.4->0.5 break is Zarr v2->v3 (`.zattrs/.zarray/.zgroup` vs `zarr.json`, flat vs `ome`-namespaced attrs); 0.5.1/0.5.2 clarified omero text and the `dimension_names` MUST [O-015, O-055-scope, O-060].

#### [B-012] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Reader implementations (observed behavior, not spec)

Basis: supported
Reason: PR404 read-only on zarr v3 (Nov 2024), PR413 write-by-default merged Aug 2025 and released as v0.12.0, v0.15 deprecations/download fix, v0.16 sharding, and v0.19 permissive-0.5/scene/plain-string-codec handling are all attested; the May-2025 no-write snapshot predates v0.12.0.
Evidence: S008 lines 139-150, S013 lines 128-157, S052 lines 128, S052 lines 300, S052 lines 343, S052 lines 558, S016 lines 368-384

- P8. Reference Python reading moved in stages: 0.5 read-only on zarr v3 (PR404, Nov 2024), then 0.5 write-by-default with mixed v04/v05 writes rejected (PR413, v0.12.0), then sharding (v0.16), then permissive-0.5/scene/plain-string-codec handling (v0.19); the S016 FormatV05 snapshot (May 2025, write unsupported) is stale relative to releases [O-016, O-046, O-054, O-061].

#### [B-013] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Reader implementations (observed behavior, not spec)

Basis: supported
Reason: Each behavior is in the cited code: ome unwrap, exactly-one-scale-first with at most one translation and ndim-matched numeric vectors, multiscales[0]-only reads, silent omero/contrast degradation, zero-filled well/plate stitching, and raw-array-or-ignore fallback.
Evidence: S019 lines 87-90, S016 lines 296-366, S018 lines 279-299, S018 lines 335-391, S018 lines 404-439, S018 lines 537-567, S018 lines 593-600

- P9. ome-zarr-py unwraps v3 attrs under `ome`, validates exactly-one-scale-first with <=1 translation and ndim-matched numeric vectors, reads only `multiscales[0]`, degrades omero/contrast silently on bad input, stitches wells/plates into lazy dask grids with zeros for missing tiles, and falls back to raw-array load or silent ignore [O-017, O-018, O-019, O-020, O-067, O-068].

#### [B-014] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Reader implementations (observed behavior, not spec)

Basis: supported
Reason: Rotation/affine/sequence transforms are composed into the Affine, not warn-and-skipped; warn-and-skip applies only to unknown transform types.
Evidence: S048 lines 81-126, S048 lines 672-699, S048 lines 204-213, S048 lines 707-716, S027 lines 150-159, S011 lines 163-165

Active (verified replacement; the draft text is superseded history):

- P10 (corrected). napari-ome-zarr (post-PR123, merged, direct zarr v3 without the ome-zarr dependency; S027 lines 128-159, S011 lines 163-165) dispatches entry points as Labels/Label walk-up to the parent image, then Bioformats2raw, Multiscales, Plate, Scene by attrs, printing "No matching spec" and returning nothing on no match (S048 lines 664-699). It splits image channels into per-channel layers via channel_axis while labels keep every axis in a single layer (S048 lines 204-213, S048 lines 580-584), pops any label channel_axis and squeezes the dask data per level (S048 lines 707-716), and hides labels by default (S048 lines 652-659). Transform handling composes scale/translation/rotation/affine/sequence into one Affine (sequences flattened first); only unknown transform types warn and skip (S048 lines 81-126). Conditions: napari-ome-zarr reader code at capture, scene/v0.6-era forward compat included. Plan fit: informs F1 discovery dispatch, F3 channel layers, and F5 overlay defaults (Plan L5). Consequence: Slide Scout can follow the same dispatch/split/hide-by-default rules but must replace silent no-match empties with explicit errors and decide how to treat non-scale/translation transforms. Validation idea: open Multiscales/Plate/Bioformats2raw/Labels/Scene entry points including a bare labels subgroup, plus one fixture each with rotation, affine, sequence, and an unknown transform type, and record layers, visibility, and messages.

#### [B-015] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Reader implementations (observed behavior, not spec)

Basis: supported
Reason: The <=4 concurrent channels and time slider come from the older TIFF/CZI-era HELP.txt, not the OME-Zarr load-settings doc, which the draft does not disclose.
Evidence: S072 lines 1-3, S096 lines 8-10, S096 lines 25-28, S098 lines 204-262, S117 lines 94-135, S108 lines 4-29

Active (verified replacement; the draft text is superseded history):

- P11 (corrected). AGAVE is a desktop app reading local OME-Zarr 0.4 and 0.5 (S072 lines 1-3) on a tensorstore v0.1.78 backend (S096 lines 8-10). Its OME-Zarr Load Settings dialog offers explicit resolution-level, time, channel-exclusion, and X/Y/Z sub-region choice with a GPU-memory estimate before loading (S117 lines 94-135). The <=4 concurrently displayed channels and the time slider are documented only in the older TIFF/CZI-era HELP.txt (S108 lines 17, 29), so they must not be cited as OME-Zarr load behavior without that caveat. Its reader branches metadata lookup on the zarr version (v3 reads zarr.json attributes.ome, erroring when absent; v2 reads flat attrs) with zarr3 vs zarr driver names, counts scenes as multiscales.size(), and assumes a fixed T,C,Z,Y,X dimorder (S098 lines 204-262), the last being a correctness risk for 2D/3D/4D or custom-axis 0.5 data. Its VolumeDimensions dtype switch handles int32/uint16/uint8/float32 (S096 lines 25-28). Conditions: AGAVE at the captured commit/docs. Plan fit: informs F2 level choice, F3 channel controls, and F7 bounding strategy (Plan L5/L7). Consequence: explicit pre-load bounding with a memory estimate is a proven alternative to fully automatic loading, and dtype coverage must be declared explicitly. Validation idea: load a multichannel 0.5 volume plus a 2D/custom-axis fixture in AGAVE, record dialog options, memory estimate, and rendered dims/dtypes, and compare against Slide Scout behavior.

#### [B-016] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Reader implementations (observed behavior, not spec)

Basis: supported
Reason: The v3/0.5 codec table, TCZYX default with deprecated dimension-order, 256px/factor-2 defaults with overrides, and hierarchy/marker-altering options are all in the bioformats2raw README capture.
Evidence: S033 lines 107-122, S033 lines 157-200, S033 lines 219-256, S033 lines 311-337

- P12. Bioformats2raw writes 0.4 and 0.5 with a v3/0.5 codec table (null, blosc, gzip, zstd; no zlib), TCZYX default order, ~256px smallest level with factor-2 steps by default, and options that can produce non-spec hierarchies or drop OME/root markers [O-037, O-038, O-039, O-055, O-056].

#### [B-017] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Reader implementations (observed behavior, not spec)

Basis: supported
Reason: Each observed fileset matches its cited source: czyx IDR scales with micrometer space units and unitless channel, sharded blosc/zstd uint16 array with dimension_names, 6x11 plate with 49 wells and field_count 32, conversions with optional sharding plus RO-Crate sidecars, and 589 MB to 1.0 TB sizes.
Evidence: S054 lines 1-52, S055 lines 16-64, S056 lines 10-73, S056 lines 71-311, S034 lines 43-46, S034 lines 67-83

- P13. Real 0.5 filesets observed: IDR czyx image with physical per-level scales and micrometer space units [O-021]; sharded blosc/zstd uint16 array with `dimension_names` [O-022]; sparse 6x11 plate with ~50 wells and field_count 32 [O-023]; challenge conversions with heterogeneous sharding plus top-level RO-Crate sidecars [O-024]; sizes from 589 MB to 1 TB [O-025].

#### [B-019] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Compatibility failures and contradictions (must-handle)

Basis: supported
Reason: The auto-sharding crash is a write-path-only ome-zarr-py bug report, not a rendering/decoding failure on valid-looking 0.5 data, so the block's framing overstates it.
Evidence: S014 lines 139-143, S038 lines 58, S011 lines 151-157, S013 lines 166-186, S044 lines 126-183

Active (verified replacement; the draft text is superseded history):

- P14 (corrected). Attested viewer/dependency failures on 0.5-era data: vizarr repetitive-chunk rendering of a 3-channel uint16 resave-converted bioformats2raw-group-0 image while the 0.4 original rendered correctly (S014 lines 139-143); neuroglancer "Neither array nor OME multiscale metadata found" on a challenge 0.5 fileset plus a vanilla sharded v3 array exposing dimensions but loading no chunks with no failed requests (S038 line 58); napari-ome-zarr 0.6.1/ome-zarr 0.10.3 pinned to zarr<3 conflicting with bioio-ome-zarr 3.x requiring zarr>=3 (S011 lines 151-157); and the zarr v3 API rejecting the legacy v2 `compressor` kwarg on writes in favor of bytes-to-bytes codecs (S013 lines 166-186). Separately, ome-zarr-py issue #640 (Aug 2026) reports a write-path-only crash (ValueError via dask rechunk) when write_image is given shards="auto" (S044 lines 126-183); it is evidence of ecosystem immaturity, not of a viewer decode failure. Conditions: as captured; resave/vizarr/neuroglancer versions per cited issues. Plan fit: F8 failure taxonomy and F9 decode matrix (Plan L7/L9) must cover the viewer/decode items; the auto-shard item needs no viewer handling beyond noting writer-side risk. Consequence: Slide Scout must validate chunk/shard rendering against known-good views and explain no-chunks states instead of going silent. Validation idea: render the resave-converted and sharded fixtures next to known-good views and record chunk alignment plus the message shown for undecodable arrays.

#### [B-020] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Compatibility failures and contradictions (must-handle)

Basis: supported
Reason: The 7/11 dataset-scale, napari-only translation with vizarr image-disappears and WEBKNOSSOS fails-to-open, 4/11 top-level-scale, vizarr/avivator Z-downsample and non-2-factor failures, and default-napari scale ignorance are exactly as surveyed.
Evidence: S043 lines 1-35, S043 lines 80-109, S043 lines 318-350, S043 lines 352-392, S043 lines 394-428, S011 lines 158-159

- P15. Calibration is unevenly implemented across viewers: dataset scale read by 7/11 surveyed, translation applied only by napari (vizarr image-disappears, WEBKNOSSOS fails to open), top-level scale read by 4/11, Z-downsampled and non-2-factor pyramids break vizarr/avivator, and the default napari reader ignores transforms producing wrong anisotropy [O-029, O-030, O-033, O-034, O-035, O-044].

#### [B-021] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Compatibility failures and contradictions (must-handle)

Basis: supported
Reason: OMERO has no supported:no verdict on the multi-multiscales sample and notes all images imported with corruption, so "no surveyed viewer opens beyond multiscales[0]" overstates the matrix.
Evidence: S043 lines 277-316, S027 lines 269-270, S048 lines 348-365, S003 lines 261-270, S004 lines 149-157, S003 lines 441-450

Active (verified replacement; the draft text is superseded history):

- P16 (corrected). Discovery ambiguities are real. On the multi-multiscales sample, ten surveyed viewers record supported:no for opening beyond multiscales[0], with BigDataViewer/MoBIE failing (ArrayIndexOutOfBounds) and WEBKNOSSOS failing to open (non-unique mags); OMERO records no supported verdict and notes "All images imported but sample image is corrupted" (S043 lines 277-316). Label listings can be missing while label groups exist, and a Dec-2024 models discussion records that the spec text under-defines what a "labels object" must be (S027 lines 269-270; S048 lines 519-527). Bioformats2raw discovery has competing rules: the spec's series/numbered-group logic (S003 lines 261-270) vs napari-ome-zarr parsing OME/METADATA.ome.xml Image IDs (S048 lines 348-365). PR206's proposal to move labels registration into the multiscale group (S004 lines 149-157) contradicts the released spec, which keeps the labels list in the labels-group zarr.json (S003 lines 441-450). Conditions: features matrix at capture (v0.4-era samples); napari code at capture. Plan fit: F1 discovery and F8 error taxonomy (Plan L5/L7). Consequence: the viewer must union labels listings with directory probing, choose a robust bioformats2raw rule, and open multi-multiscales groups without crashing. Validation idea: open the multi-multiscales sample, a labels-unlisted labels group, and XML-less bioformats2raw fixtures, recording listed content and messages.

#### [B-022] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Compatibility failures and contradictions (must-handle)

Basis: supported
Reason: "Exactly one proven low-risk pattern" is a judgment that hides MoBIE's unexplained plate support, and the corpus does not attribute napari's zoom crash to full-resolution stitched canvases.
Evidence: S043 lines 207-238, S018 lines 404-439, S018 lines 537-567

Active (verified replacement; the draft text is superseded history):

- P17 (corrected). Attested HCS-at-scale behaviors: vizarr shows only the lowest plate resolution with per-well drill-down into a new window (S043 lines 213-215); napari's plate support loads but is noted to crash on zooming in, with no cause given in the matrix (S043 lines 218-220); MoBIE records supported:yes for plates with no pattern detail (S043 lines 223-224); ome-zarr-py stitches wells into an almost-square lazy grid and plates into a full grid, substituting zeros for missing/failed tiles (S018 lines 404-439, S018 lines 537-567). Conditions: features matrix at capture (v0.4 plate sample); ome-zarr-py reader at commit 94eaf20. Plan fit: F1 navigation and F7 responsiveness (Plan L5/L7). Consequence: treat vizarr-style overview plus drill-down as the only corpus-detailed low-risk pattern, avoid presenting zero-filled stitched canvases as complete data, and verify zoom stability on a sparse-plate fixture rather than assuming napari's crash cause. Validation idea: open the sparse-plate fixture at low resolution, drill into one well/field, and record time-to-first-field, zoom stability, and how missing wells/fields are shown.

#### [B-024] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Opportunities and simpler alternatives

Basis: supported
Reason: The merged finder PR's traversal/CSV/BioFile-Finder behavior with Folder-tree browsing, thumbnails, and copy-URL, and its v2-only (.zattrs) scope with v3 deferred, match S023 including the April-2025 merge date.
Evidence: S023 lines 128-154, S023 lines 439-450

- P18. Directory traversal + served browsing (`ome_zarr finder` + BioFile Finder CSV with Folder tree, thumbnails, copy-URL) is a shipped simpler alternative to deep indexing; its 0.5 gap is precisely the zarr.json traversal the Apr-2025 version deferred [O-045].

#### [B-025] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Opportunities and simpler alternatives

Basis: supported
Reason: S031 documents the validator page and sample catalog, S034 links every challenge sample through the ?source= validator pattern, and reader PRs point at the validator as the first check.
Evidence: S031 lines 1-14, S034 lines 67-85, S008 lines 156-158

- P19. The validator URL pattern plus IDR/challenge sample catalogs give a ready acceptance oracle: every representative fileset should first open in ome-ngff-validator [O-059, O-025, O-013-context S034/S010].

#### [B-026] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Opportunities and simpler alternatives

Basis: supported
Reason: Neither dtype source is a published matrix: Vizarr/Viv gives a supported-dtype list and AGAVE's is a four-case switch in code, so "publish explicit dtype matrices" overstates both.
Evidence: S025 lines 81-86, S096 lines 25-28, S117 lines 94-135, S058 lines 385-389

Active (verified replacement; the draft text is superseded history):

- P20 (corrected). Bounded precedents exist for hard choices, with exact shapes: Vizarr/Viv publishes a supported-dtype list (int8/16/32, uint8/16/32, float32/64) in its README (S025 lines 81-86); AGAVE's bound is a four-case dtype switch (int32/uint16/uint8/float32) in VolumeDimensions code (S096 lines 25-28), not a published matrix; AGAVE publishes an explicit memory-bounding Load Settings dialog (resolution/channel/sub-region choice plus GPU-memory estimate, S117 lines 94-135); WEBKNOSSOS publishes chunk/shard tuning guidance (32-128 voxel chunks, sharding for Zarr 3+, 3D downsampling, S058 lines 385-389). Conditions: captures as cited. Plan fit: F7 bounding and F9 supported/unsupported matrix (Plan L7/L9). Consequence: Slide Scout should publish its own explicit dtype/coverage matrix and bounding rule rather than implying parity with these differently-shaped precedents. Validation idea: draft the Slide Scout matrix and dialog, then check each claimed cell against one fixture and record open/render/explain outcomes.

#### [B-028] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit

Basis: supported
Reason: The quote matches Plan L5 verbatim.
Evidence: plan/Viewer.md line 5

### F1. "opens a local OME-Zarr 0.5 fileset and lists the images it finds" (Plan L5)

#### [B-029] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F1. "opens a local OME-Zarr 0.5 fileset and lists the images it finds" (Plan L5)

Basis: supported
Reason: Plan L5's flat image list omits the hierarchy, precedence, version-branching, and multi-multiscales rules attested in S003 and the readers, so correction is the fitting disposition.
Evidence: plan/Viewer.md line 5, S003 lines 118-129, S003 lines 256-275, S003 lines 388-397, S019 lines 87-90

- Disposition: correction.

#### [B-030] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F1. "opens a local OME-Zarr 0.5 fileset and lists the images it finds" (Plan L5)

Basis: supported
Reason: Walk-up in S048 applies only to Labels/Label roots (1-2 dirs); other entry points dispatch by attrs and non-matches print and return nothing, so "arbitrary entry-point walk-up" overstates the mechanism.
Evidence: S003 lines 68-72, S003 lines 150-156, S003 lines 305-306, S003 lines 388-397, S003 lines 515-560, S003 lines 744-752, S003 lines 256-275, S003 lines 824-833, S048 lines 664-699, S048 lines 519-527, S058 lines 309-318, S013 lines 150-157

Active (verified replacement; the draft text is superseded history):

- F1 constraint (corrected). Discovery must branch on store markers (0.5 zarr.json plus attributes.ome.version "0.5" vs 0.4 .zattrs-style markers, mixed hierarchies invalid), then follow plate wells lists, well images lists, and bioformats2raw precedence (plate locations, else OME series list, else numbered groups), union the labels listing with directory probing of labels/* groups, default to the first multiscale while offering user choice by name when several exist, and dispatch entry points by attrs with walk-up only for Labels roots (1 dir) and Label roots (2 dirs) to the parent image; anything matching no spec must produce an explicit error, replacing napari's print-and-return-nothing behavior (S003 and S048 lines 664-699 as cited above; S058 lines 309-318; S013 lines 150-157). Conditions: local 0.5 filesets including plates, bioformats2raw collections, and labels. Plan fit: corrects Plan L5 "opens a local OME-Zarr 0.5 fileset and lists the images it finds". Consequence: the finder must present hierarchy-aware navigation (fileset, plate/well/field or series, image, labels) with version-aware errors instead of a flat list. Validation idea: open five fixtures (plain image; S056-shaped sparse plate; multi-series bioformats2raw; labels group missing from the listing; 0.4 fileset) plus a bare-labels-subgroup entry point, and check the listed tree and messages against validator results.

#### [B-031] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F1. "opens a local OME-Zarr 0.5 fileset and lists the images it finds" (Plan L5)

Basis: supported
Reason: Hierarchy-aware navigation and version-aware errors follow directly from the plate/well/series structures and v2/v3 marker split in S003.
Evidence: S003 lines 118-129, S003 lines 256-275, S003 lines 68-72, S058 lines 309-318

- Consequence: a flat image list is wrong for plates/collections; the finder must present hierarchy-aware navigation (fileset > plate/well/field or series > image > labels) and version-aware errors.

#### [B-033] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit

Basis: supported
Reason: Both quotes match Plan L5 verbatim.
Evidence: plan/Viewer.md line 5

### F2. "canvas with pan and zoom" + "chooses an available pyramid level appropriate for the current view" (Plan L5)

#### [B-034] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F2. "canvas with pan and zoom" + "chooses an available pyramid level appropriate for the current view" (Plan L5)

Basis: supported
Reason: Plan L5 names pyramid-level choice but omits ordering, per-level scale, Z-downsampling, and codec/shard rules attested in S003 and the corpus, so correction fits.
Evidence: plan/Viewer.md line 5, S003 lines 305-312, S043 lines 1-13, S043 lines 80-89, S055 lines 16-58

- Disposition: correction.

#### [B-035] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F2. "canvas with pan and zoom" + "chooses an available pyramid level appropriate for the current view" (Plan L5)

Basis: supported
Reason: Datasets-order levels, per-level scale vectors, differing z-sizes, and sharded blosc/gzip/zstd arrays with 2D-style or 3D chunking are each attested in the cited sources.
Evidence: S003 lines 305-312, S054 lines 31-52, S055 lines 16-58, S034 lines 291-307, S033 lines 157-200, S058 lines 385-389, S043 lines 1-13, S043 lines 80-89

- Constraint: level order is datasets[] order (never numeric sort); per-level pixel size comes from that level's scale (never assumed factor 2); z-size may differ per level; arrays may be sharded with blosc/gzip/zstd codecs and 3D or 2D chunks [O-005, O-006, O-021, O-022, O-024, O-029, O-030, O-037, O-041, O-056].

#### [B-036] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F2. "canvas with pan and zoom" + "chooses an available pyramid level appropriate for the current view" (Plan L5)

Basis: supported
Reason: Scale-aware selection, per-level plane counts, and a v3 codec/shard stack follow from the per-level scale, Z-downsampling, and sharding evidence; uniform-2x y/x-only assumptions break the surveyed fixtures.
Evidence: S003 lines 308-312, S043 lines 1-13, S043 lines 80-89, S055 lines 16-58

- Consequence: the renderer needs scale-aware level selection, per-level plane counts, and a v3 codec/shard decode stack; assuming uniform 2x y/x-only pyramids breaks real data.

#### [B-038] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit

Basis: supported
Reason: The quote matches Plan L5 verbatim.
Evidence: plan/Viewer.md line 5

### F3. "channel visibility controls" (Plan L5)

#### [B-039] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F3. "channel visibility controls" (Plan L5)

Basis: supported
Reason: Plan L5 specifies the controls (covered) while omero defaults, the greyscale override, and the contrast-degradation behaviors come from the spec and readers (correction on defaults).
Evidence: plan/Viewer.md line 5, S003 lines 401-430, S018 lines 335-388, S048 lines 293-335

- Disposition: covered, with correction on defaults.

#### [B-040] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F3. "channel visibility controls" (Plan L5)

Basis: supported
Reason: Omero default fields, greyscale whitening in both readers, per-channel vs wipe-all contrast degradation, fallback need, and the open split-vs-composite question are each attested.
Evidence: S003 lines 401-430, S018 lines 356-388, S048 lines 293-335, S048 lines 204-213, S025 lines 81-83, S117 lines 118-123

- Constraint: visibility/label/color/window defaults come from omero channels when present (color hex, active, label, window start/end; greyscale model whitens; missing windows must not silently reset all channels); absent omero needs deterministic fallbacks; split-layer vs composite rendering is open [O-008, O-026, O-051, O-052, O-067].

#### [B-041] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F3. "channel visibility controls" (Plan L5)

Basis: supported
Reason: Working with and without omero plus per-channel degradation with notice follows from the optional-omero rule and the two readers' differing contrast-failure behaviors.
Evidence: S003 lines 426-430, S018 lines 375-383, S048 lines 316-323

- Consequence: controls work without omero but match omero when present; a single bad channel must degrade per-channel with notice, not wipe all contrast.

#### [B-043] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit

Basis: supported
Reason: The quote matches Plan L5 verbatim.
Evidence: plan/Viewer.md line 5

### F4. "time-point and plane selection where relevant" (Plan L5)

#### [B-044] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F4. "time-point and plane selection where relevant" (Plan L5)

Basis: supported
Reason: Plan L5's fixed-sounding selectors omit axes-driven dimensionality, per-level plane counts, and rdefs defaults attested in S003 and the matrix, so correction fits.
Evidence: plan/Viewer.md line 5, S003 lines 296-303, S043 lines 1-13, S003 lines 419-422

- Disposition: correction.

#### [B-045] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F4. "time-point and plane selection where relevant" (Plan L5)

Basis: supported
Reason: Axes-driven 2-5D selectors with time/channel/space/custom ordering, per-level plane counts under Z downsampling, and rdefs defaultT/defaultZ initials are each attested.
Evidence: S003 lines 296-303, S043 lines 1-13, S003 lines 419-422, S098 lines 254-256, S033 lines 333-337

- Constraint: which selectors appear is driven by axes (2-5D, time/channel/space/custom order), not by fixed 5D tczyx; plane counts vary per pyramid level when Z is downsampled; rdefs defaultT/defaultZ give initial positions when present [O-003, O-008, O-029, O-053, O-055].

#### [B-046] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F4. "time-point and plane selection where relevant" (Plan L5)

Basis: supported
Reason: Showing only applicable selectors and remapping plane indices through each level's shape follow from the axes-order and Z-downsampling evidence.
Evidence: S003 lines 296-303, S043 lines 1-13

- Consequence: 2D/3D/4D and custom-axis images show only applicable selectors; switching pyramid level must remap plane indices through that level's shape.

#### [B-048] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit

Basis: supported
Reason: The quote matches Plan L5 verbatim.
Evidence: plan/Viewer.md line 5

### F5. "optional overlays for associated label images" (Plan L5)

#### [B-049] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F5. "optional overlays for associated label images" (Plan L5)

Basis: supported
Reason: Plan L5 names optional label overlays but omits discovery, dtype/level-count, alignment, default-visibility, and color rules attested in S003 and napari code, so correction fits.
Evidence: plan/Viewer.md line 5, S003 lines 431-474, S048 lines 519-527, S048 lines 652-659

- Disposition: correction.

#### [B-050] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F5. "optional overlays for associated label images" (Plan L5)

Basis: supported
Reason: Napari plate-labels metadata derives from the first well/first field only, and the plate-wide label pyramid helper itself is not in the corpus, so "plate labels derive per wells/fields" is unverified as stated.
Evidence: S003 lines 431-474, S054 lines 10-52, S048 lines 204-213, S048 lines 535-555, S048 lines 652-716, S043 lines 473-507

Active (verified replacement; the draft text is superseded history):

- F5 constraint (corrected). Discover labels by listing UNION directory probing of labels/* groups; require integer dtype from the 8-member set and equal level counts with the source image; align the overlay level-to-level using each side's transforms; default the overlay to hidden with an explicit toggle; take colors from image-label colors and invent a colormap only when absent (noting that napari shows no labels at all without colors); remove the channel axis for the overlay layer; for plates, derive label metadata from the first well/first field and label data from the plate-wide lazy pyramid helper, whose per-well behavior is not verifiable here because napari plate.py is absent from the corpus (S003 lines 431-474; S048 lines 535-555, S048 lines 652-716). Conditions: 0.5 label images, single images and plates. Plan fit: corrects Plan L5 "optional overlays for associated label images". Consequence: overlay is a label-specific aligned layer, not general multi-image fusion (supported by only 3/11 surveyed viewers, S043 lines 473-507); misaligned levels or missing colors need explicit notices. Validation idea: overlay a labeled image at two pyramid levels and screenshot-diff label boundaries against the source; repeat with missing image-label colors and with a plate-labels fixture.

#### [B-051] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F5. "optional overlays for associated label images" (Plan L5)

Basis: supported
Reason: Labels-only overlay scope follows from the 3/11 multi-image-overlay support, and the notice requirements follow from napari's no-colors-shows-nothing behavior and the alignment evidence.
Evidence: S043 lines 473-507, S048 lines 652-659, S003 lines 454-456

- Consequence: overlay is a label-specific aligned layer (not general multi-image fusion); misaligned levels or missing colors must produce explicit notices, not silent offsets or invisible labels.

#### [B-053] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit

Basis: supported
Reason: The quote matches Plan L5 verbatim.
Evidence: plan/Viewer.md line 5

### F6. "details panel shows dimensions, units and coordinates" (Plan L5)

#### [B-054] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F6. "details panel shows dimensions, units and coordinates" (Plan L5)

Basis: supported
Reason: Plan L5 names the panel but omits transform combination, unit rules, dimension_names matching, and translation handling attested in S003 and the matrix, so correction fits.
Evidence: plan/Viewer.md line 5, S003 lines 308-316, S003 lines 170-174, S043 lines 318-350, S043 lines 352-392

- Disposition: correction.

#### [B-055] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F6. "details panel shows dimensions, units and coordinates" (Plan L5)

Basis: supported
Reason: Combined per-dataset plus top-level transforms, UDUNITS space/time units with the IDR channel unitless, dimension_names matching, and the translation/units display rules are each attested.
Evidence: S003 lines 308-316, S003 lines 166-174, S054 lines 10-29, S043 lines 318-350, S043 lines 352-392, S043 lines 394-428, S011 lines 158-159, S048 lines 249-254

- Constraint: coordinates combine per-dataset scale/translation with top-level multiscales transforms, in axes order with UDUNITS units (space/time lists; channel usually unitless); dimension_names must match axes names; translations must at minimum not break rendering; inconsistent/missing units need a stated display rule [O-003, O-004, O-005, O-021, O-033, O-034, O-035, O-044].

#### [B-056] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F6. "details panel shows dimensions, units and coordinates" (Plan L5)

Basis: supported
Reason: Per-axis pixel size, units, and calibrated cursor coordinates from the combined active-level transform follow from the transform and units evidence; ignoring top-level transforms or translations repeats surveyed viewer bugs.
Evidence: S003 lines 308-316, S043 lines 352-392, S043 lines 394-428, S011 lines 158-159

- Consequence: the panel shows per-axis pixel size, units, and calibrated cursor coordinates computed from the active level's combined transform; ignoring top-level transforms or translations repeats known viewer bugs.

#### [B-058] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit

Basis: supported
Reason: Both quotes match Plan L7 verbatim.
Evidence: plan/Viewer.md line 7

### F7. "Large image reads run in the background so navigation remains responsive. Changing the selected view cancels work that is no longer needed." (Plan L7)

#### [B-059] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F7. "Large image reads run in the background so navigation remains responsive. Changing the selected view cancels work that is no longer needed." (Plan L7)

Basis: supported
Reason: Plan L7 specifies background reads with cancel (covered) while the corpus adds AGAVE's explicit pre-load bounding as a genuine strategy alternative (product choice).
Evidence: plan/Viewer.md line 7, S117 lines 94-135

- Disposition: covered, with product_choice on bounding strategy.

#### [B-060] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F7. "Large image reads run in the background so navigation remains responsive. Changing the selected view cancels work that is no longer needed." (Plan L7)

Basis: supported
Reason: Plan's automatic background/cancel is explicitly attributed to the Plan, AGAVE's explicit bounding with memory estimate is attested, and the 21-66 GB images and TB-scale plates make unbounded eager loads infeasible.
Evidence: plan/Viewer.md line 7, S117 lines 94-135, S034 lines 67-85, S018 lines 404-439, S043 lines 207-220, S061 lines 39

- Constraint: corpus proves both automatic background/cancel (Plan) and explicit pre-load bounding with memory estimate (AGAVE level/channel/sub-region dialog); TB-scale plates and 21-66 GB images make unbounded eager loads infeasible [O-020, O-025, O-031, O-052, O-057].

#### [B-061] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F7. "Large image reads run in the background so navigation remains responsive. Changing the selected view cancels work that is no longer needed." (Plan L7)

Basis: supported
Reason: Keeping Plan behavior while adding a stated bounding rule follows from the large-data sizes and the two attested bounding patterns.
Evidence: plan/Viewer.md line 7, S034 lines 67-85, S117 lines 94-135

- Consequence: keep Plan's background/cancel behavior and add a bounding rule (auto low-res-first and/or explicit choice with estimate) so the large-dataset acceptance case cannot OOM.

#### [B-063] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit

Basis: supported
Reason: The quote matches Plan L7 verbatim.
Evidence: plan/Viewer.md line 7

### F8. "Opening failures explain which image or data could not be displayed and allow the user to choose another item." (Plan L7)

#### [B-064] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F8. "Opening failures explain which image or data could not be displayed and allow the user to choose another item." (Plan L7)

Basis: supported
Reason: Plan L7 names explained failures abstractly while the corpus supplies a concrete attested taxonomy, so correction fits.
Evidence: plan/Viewer.md line 7, S003 lines 150-156, S003 lines 824-833, S013 lines 150-157, S038 line 58

- Disposition: correction.

#### [B-065] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F8. "Opening failures explain which image or data could not be displayed and allow the user to choose another item." (Plan L7)

Basis: supported
Reason: Each taxonomy row is attested: version/version-mismatch, missing spec keys, schema and vector violations, dimension_names, codec/shard, dtype, transforms, missing wells/fields, unlisted labels, and non-matching entries.
Evidence: S003 lines 150-174, S003 lines 824-833, S058 lines 309-318, S014 lines 139-143, S013 lines 150-186, S038 line 58, S004 lines 149-157, S048 lines 672-699, S053 lines 126-266, S025 lines 81-86, S016 lines 296-366

- Constraint: attested failure taxonomy: 0.4-in-0.5-scope, mixed v04/v05, missing/inconsistent version, absent multiscales/plate/well keys, schema violations (counts, required keys, vector lengths), dimension_names mismatch, unsupported codec/shard, unsupported dtype, transform violations, missing wells/fields, unlisted-vs-unreadable labels, non-multiscale entry [O-002, O-015, O-040, O-042, O-046, O-047, O-048, O-060, O-063, O-066].

#### [B-066] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F8. "Opening failures explain which image or data could not be displayed and allow the user to choose another item." (Plan L7)

Basis: supported
Reason: Naming node, rule, and recovery follows from the taxonomy evidence, and silent-ignore plus silent-no-chunks are attested bad behaviors in ome-zarr-py and neuroglancer.
Evidence: S018 lines 593-600, S038 line 58

- Consequence: errors must name the failing node, the violated rule, and the recovery action (pick another item/level); silent ignores and silent no-chunks states are known bad behaviors.

#### [B-068] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit

Basis: supported
Reason: The quote matches Plan L9 verbatim.
Evidence: plan/Viewer.md line 9

### F9. "should interoperate with filesets from real OME-Zarr 0.5 tools" (Plan L9)

#### [B-069] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F9. "should interoperate with filesets from real OME-Zarr 0.5 tools" (Plan L9)

Basis: supported
Reason: Plan L9 states interop abstractly while the corpus supplies concrete decode matrices, dtype bounds, behavior drift, and converter quirks, so correction fits.
Evidence: plan/Viewer.md line 9, S055 lines 16-58, S033 lines 157-200, S025 lines 81-86, S052 line 128

- Disposition: correction.

#### [B-070] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F9. "should interoperate with filesets from real OME-Zarr 0.5 tools" (Plan L9)

Basis: supported
Reason: Sharding plus the blosc/gzip/zstd/null codec options, arbitrary chunk grids, the 8-int-type label requirement against bounded renderer support, 2025-2026 behavior drift, and converter hierarchy/marker quirks are each attested.
Evidence: S055 lines 16-58, S034 lines 43-46, S033 lines 157-200, S003 lines 68-72, S003 lines 438-439, S025 lines 81-86, S096 lines 25-28, S052 line 128, S033 lines 219-256, S033 lines 311-325, S013 lines 166-186, S058 lines 385-389, S033 lines 107-122

- Constraint: interop means the observed decode matrices: sharding_indexed + blosc (cname/clevel/shuffle variants)/gzip/zstd/null codecs, arbitrary chunk grids, uint/int/float dtype coverage declared (spec labels need all 8 int types; renderers bound support), 2024-2026 behavior drift (permissive-0.5, plain-string codec attrs), and converter quirks (custom hierarchies, dropped OME/root markers) [O-022, O-024, O-028, O-037, O-039, O-041, O-047, O-051, O-054, O-056].

#### [B-071] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F9. "should interoperate with filesets from real OME-Zarr 0.5 tools" (Plan L9)

Basis: supported
Reason: Publishing an explicit matrix and failing loudly outside it follows from the attested codec/dtype/layout variety and the silent-failure counterexamples.
Evidence: S033 lines 157-200, S025 lines 81-86, S038 line 58

- Consequence: publish an explicit supported/unsupported matrix (codecs x dtypes x layouts) and test it; anything outside fails loudly with the matrix row cited.

#### [B-073] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit

Basis: supported
Reason: The quote matches Plan L9 verbatim.
Evidence: plan/Viewer.md line 9

### F10. "Source files remain unchanged; display settings are local to the viewing session." (Plan L9)

#### [B-074] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F10. "Source files remain unchanged; display settings are local to the viewing session." (Plan L9)

Basis: supported
Reason: Read-only sources with session-local settings are stated in both brief and Plan, and no corpus evidence contradicts them.
Evidence: plan/Viewer.md line 9, brief.md lines 3-5

- Disposition: covered.

#### [B-075] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F10. "Source files remain unchanged; display settings are local to the viewing session." (Plan L9)

Basis: supported
Reason: Local read-only opening with no sidecar writes is the brief/Plan rule, and the challenge resave flow explicitly states input data is not modified.
Evidence: brief.md lines 3-5, plan/Viewer.md line 9, S034 lines 152-155, S031 lines 1-14

- Constraint: local read-only opening; no sidecar writes into the fileset; challenge resave and validator flows confirm input-must-not-be-modified expectations [O-024, O-059-context].

#### [B-076] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F10. "Source files remain unchanged; display settings are local to the viewing session." (Plan L9)

Basis: supported
Reason: Enforcing read-only handles with session-scoped settings follows from the brief/Plan rule, and the absolute-path settings trap is attested in AGAVE docs.
Evidence: brief.md lines 3-5, plan/Viewer.md line 9, S108 lines 27

- Consequence: no action beyond enforcing read-only file handles and session-scoped settings (avoid absolute-path settings portability trap [O-058]).

#### [B-078] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit

Basis: supported
Reason: The quote matches Plan L9 verbatim.
Evidence: plan/Viewer.md line 9

### F11. "Image editing, export, remote storage and automated scientific or clinical interpretation are outside this plan." (Plan L9)

#### [B-079] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F11. "Image editing, export, remote storage and automated scientific or clinical interpretation are outside this plan." (Plan L9)

Basis: supported
Reason: The exclusions are stated in both brief and Plan, so covered is correct.
Evidence: plan/Viewer.md line 9, brief.md lines 3-5

- Disposition: covered.

#### [B-080] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F11. "Image editing, export, remote storage and automated scientific or clinical interpretation are outside this plan." (Plan L9)

Basis: supported
Reason: Both brief and Plan exclude these areas, and QuPath's remote-read struggle is attested but out of scope.
Evidence: brief.md lines 3-5, plan/Viewer.md line 9, S061 lines 39

- Constraint: brief + Plan both exclude these; remote-read performance issues (QuPath) and pathology interpretation stay out of scope even where reading code overlaps [O-057].

#### [B-081] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F11. "Image editing, export, remote storage and automated scientific or clinical interpretation are outside this plan." (Plan L9)

Basis: supported
Reason: Refusing remote URLs and export with a scope message follows directly from the brief/Plan exclusions.
Evidence: brief.md lines 3-5, plan/Viewer.md line 9

- Consequence: decline remote URLs and interpretation requests with a scope message; do not partially implement them.

#### [B-083] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit

Basis: supported
Reason: The quote matches Plan L11 verbatim.
Evidence: plan/Viewer.md line 11

### F12. "Acceptance uses representative filesets..." (Plan L11)

#### [B-084] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F12. "Acceptance uses representative filesets..." (Plan L11)

Basis: supported
Reason: Plan L11's single-paragraph acceptance omits the fixture variety, validator oracles, and large-case sizing the corpus shows are needed, so correction fits.
Evidence: plan/Viewer.md line 11, S034 lines 67-85, S031 lines 1-14, S043 lines 1-13

- Disposition: correction.

#### [B-085] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F12. "Acceptance uses representative filesets..." (Plan L11)

Basis: supported
Reason: Each matrix row (dimensionality, plates, collections, labels variants, pyramid/transform edge cases, multi-multiscales, codecs/sharding, negatives, validator pre-checks, sized large case) is grounded in cited corpus evidence.
Evidence: S034 lines 67-85, S031 lines 1-14, S056 lines 10-73, S003 lines 431-474, S043 lines 1-13, S043 lines 80-89, S043 lines 277-316, S055 lines 16-58, S003 lines 824-833

- Constraint: representative must span: plain image (2D..5D), sparse plate, bioformats2raw collection, labels (listed + unlisted + plate labels + missing colors), Z-downsampled + non-2 pyramids, translations present, top-level transforms present, multi-multiscales group, sharded + each claimed codec, 0.4 negative, malformed battery; each pre-checked in the validator; large case sized in GB/pixels/chunks [O-025, O-059, O-008-context samples].

#### [B-086] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F12. "Acceptance uses representative filesets..." (Plan L11)

Basis: supported
Reason: A fixture matrix with per-cell oracles follows from the attested data variety and the validator's role as first check in reader PRs.
Evidence: S034 lines 67-85, S031 lines 1-14, S008 lines 156-158

- Consequence: acceptance is a fixture matrix with per-cell oracle (validator + known-good view), not a single happy-path fileset.

#### [B-089] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Optional capabilities (not required by brief/Plan; adopt only with review)

Basis: supported
Reason: RO-Crate sidecars with specimen/modality plus name/description flags are attested in the challenge README, and the block correctly scopes display as optional.
Evidence: S034 lines 43-46, S034 lines 201-204

- O-C1. RO-Crate top-level metadata display (specimen/modality/name/description) [O-024]. Consequence: richer details panel for challenge data; validation: show RO-Crate fields for a challenge fileset vs absent-file fallback.

#### [B-090] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Optional capabilities (not required by brief/Plan; adopt only with review)

Basis: supported
Reason: ome-zarr-py's raw-array fallback with silent ignore is attested, and the block correctly scopes a noticed fallback view as optional.
Evidence: S018 lines 593-600

- O-C2. Raw-array fallback view for decodable-but-non-NGFF zarr with explicit notice [O-068]. Validation: open a bare v3 array and check pixels-plus-notice vs silent ignore.

#### [B-091] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Optional capabilities (not required by brief/Plan; adopt only with review)

Basis: supported
Reason: The spec's user-choice-by-name rule with first-multiscales fallback and the zero surveyed supporters are both attested, and the block correctly scopes the UI as optional.
Evidence: S003 lines 388-397, S043 lines 277-316

- O-C3. Multi-multiscales choice UI (spec user-choice rule) despite zero surveyed viewers supporting it [O-007, O-032]. Validation: open the multi-multiscales sample without crashing and offer the choice.

#### [B-092] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Optional capabilities (not required by brief/Plan; adopt only with review)

Basis: supported
Reason: Napari-only translation support with vizarr/WEBKNOSSOS failures is attested, and the block correctly scopes alignment-vs-ignore as an optional choice.
Evidence: S043 lines 352-392

- O-C4. Translation-aware alignment (napari-style) rather than ignore-safely [O-034]. Validation: overlay fixture with translation renders aligned, or documents ignore-with-notice.

#### [B-093] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Optional capabilities (not required by brief/Plan; adopt only with review)

Basis: supported
Reason: Napari composes rotation/affine/sequence beyond the 0.5 datasets allowance with warn-and-skip for unknown types, and the block correctly scopes tolerance as optional.
Evidence: S048 lines 81-126, S003 lines 308-313

- O-C5. Rotation/affine/sequence tolerance (warn-and-skip or compose) beyond 0.5 datasets allowance [O-064]. Validation: feed each richer transform and check no-crash + message.

#### [B-094] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Optional capabilities (not required by brief/Plan; adopt only with review)

Basis: supported
Reason: Label properties arrays and napari's properties-table construction from them are attested, and the block correctly scopes hover/inspect display as optional.
Evidence: S003 lines 467-474, S048 lines 628-650

- O-C6. Label properties on hover/inspect (index + arbitrary keys) [O-010, O-062-context]. Validation: hover shows properties table for the S003-example-style fixture.

#### [B-095] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Optional capabilities (not required by brief/Plan; adopt only with review)

Basis: supported
Reason: The merged finder PR's traversal plus CSV/Folders-tree browsing with thumbnails and copy-URL is attested, and the block correctly scopes it as optional.
Evidence: S023 lines 150-154

- O-C7. Finder-style collection browsing (traversal + CSV/Folders tree + thumbnails + copy-URL) for multi-fileset directories [O-045]. Validation: point at a folder of filesets and browse without opening each.

#### [B-096] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Optional capabilities (not required by brief/Plan; adopt only with review)

Basis: supported
Reason: Channel intensity sliders, exposure controls, and ROI clipping are attested in the AGAVE/Vole-era docs, and the block correctly scopes them beyond visibility toggles as optional.
Evidence: S108 lines 13-30, S062 lines 11-15

- O-C8. Transfer-function channel rendering and ROI clipping (Vol-E/AGAVE-style) beyond visibility toggles [O-052, O-058]. Validation: reproduce a Pct-Min/exposure adjustment on a multichannel volume.

#### [B-098] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Product choices (need explicit decisions; evidence informs but does not settle)

Basis: supported
Reason: The three navigation options are a fair framing: vizarr's overview-plus-drill-down and napari's zoom crash are attested while zero-filled stitching argues against naive stitched canvases.
Evidence: S043 lines 207-220, S018 lines 404-439, S018 lines 537-567

- P-C1. Plate navigation model: overview-plus-drill-down (vizarr pattern) vs stitched canvas vs flat field list [O-020, O-031]. Validation: usability pass on the sparse-plate fixture measuring time-to-first-field and zoom stability.

#### [B-099] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Product choices (need explicit decisions; evidence informs but does not settle)

Basis: supported
Reason: Split per-channel layers (napari) and blended composites (vizarr/Viv) are both attested, so the rendering choice is genuinely open.
Evidence: S048 lines 204-213, S025 lines 81-83, S117 lines 118-123

- P-C2. Channel rendering: split layers vs blended composite [O-026, O-052]. Validation: compare color fidelity and toggle behavior on a 3-channel uint16 fixture.

#### [B-100] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Product choices (need explicit decisions; evidence informs but does not settle)

Basis: supported
Reason: Fully automatic choice (Plan), explicit choice with memory estimate (AGAVE), and the hybrid are fairly posed given the large-data evidence.
Evidence: plan/Viewer.md lines 5-7, S117 lines 94-135, S034 lines 67-85

- P-C3. Pyramid UX: fully automatic level choice (Plan) vs explicit choice with memory estimate (AGAVE) vs hybrid low-res-first [O-052]. Validation: large-fileset open under a memory cap for each mode.

#### [B-101] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Product choices (need explicit decisions; evidence informs but does not settle)

Basis: supported
Reason: Strict schema gates and the v0.19 permissive-0.5-for-spatial-data precedent are both attested, so the posture choice is genuinely open.
Evidence: S053 lines 126-266, S052 line 128

- P-C4. Strictness posture: strict schema rejection vs permissive-with-notice (v0.19 spatial-data precedent) [O-054, O-066]. Validation: open a spatial-data-style edge fixture under both postures and compare outcomes.

#### [B-102] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Product choices (need explicit decisions; evidence informs but does not settle)

Basis: supported
Reason: Only 3/11 surveyed viewers support multi-image overlay while label overlay is a brief requirement, so the scoping choice is fairly posed.
Evidence: S043 lines 473-507, brief.md line 3

- P-C5. Overlay scope: labels-only (recommended) vs general multi-image overlay (only 3/11 viewers support) [O-036]. Validation: attempt a two-image overlay and confirm scoped refusal or supported path per decision.

#### [B-104] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unsupported (do not treat as required)

Basis: supported
Reason: General multi-image overlay is a minority viewer capability (3/11) with no format obligation in S003.
Evidence: S043 lines 473-507

- U1. General multi-image overlay/fusion on one canvas: a minority viewer capability, not a format obligation [O-036].

#### [B-105] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unsupported (do not treat as required)

Basis: supported
Reason: These areas are explicitly excluded by both brief and Plan.
Evidence: plan/Viewer.md line 9, brief.md lines 3-5

- U2. Remote storage, export, editing, clinical interpretation: explicitly out of scope [Plan L9; O-057].

#### [B-106] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unsupported (do not treat as required)

Basis: supported
Reason: Scene/coordinateSystems graph traversal appears in napari code paths and v0.6-era references but nowhere in the 0.5 spec text.
Evidence: S048 lines 402-495, S048 lines 219, S048 lines 273, S003 full-text search for scene|coordinateSystem with no hits

- U3. Scene/coordinateSystems graph traversal (v0.6-era): present in napari code paths but not a 0.5 obligation [O-064, S048 Scene].

#### [B-107] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unsupported (do not treat as required)

Basis: supported
Reason: The bioformats2raw v3/0.5 column shows no zlib while v2/0.4 shows yes, and the table governs that converter, not the format.
Evidence: S033 lines 157-162

- U4. zlib codec for 0.5: absent from the bioformats2raw v3 table (converter-specific, not a format promise) [O-037].

#### [B-109] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unresolved (evidence missing or contradictory)

Basis: supported
Reason: The released 0.5 text settles the actionable question (labels list lives in the labels-group zarr.json), leaving only the immaterial history of the draft proposal.
Evidence: S003 lines 102-112, S003 lines 441-450, S004 lines 149-157

Active (verified replacement; the draft text is superseded history):

- R1 (resolved as actionable). In released OME-Zarr 0.5 the labels list lives in the labels-group zarr.json ("labels" array of label-image paths; all label images SHOULD be listed), per both the layout figure and the labels section (S003 lines 102-112, S003 lines 441-450). PR206's draft proposal to move labels registration into the multiscale group (S004 lines 149-157) is not reflected in the released text. Whether that move was adopted-and-reverted or never adopted is not answerable from the corpus and is immaterial to implementation. Conditions: version 0.5. Plan fit: F1/F5 discovery (Plan L5) follows S003, treating PR206 as superseded intent. Consequence: implement labels discovery against the labels-group listing (union directory probing) and ignore the proposal. Validation idea: open a fixture whose labels-group zarr.json lists two labels and confirm both resolve.

#### [B-129] CONFIRMED
Context: # Slide Scout 0.5 research report (draft)

Basis: supported
Reason: The five-step build order faithfully sequences the confirmed F-block constraints, matrix-gated fixtures, and deferred optional/choice items.
Evidence: plan/Viewer.md lines 5-11, S003 lines 68-72, S055 lines 16-58, S003 lines 296-316, S034 lines 67-85, S031 lines 1-14

## 5. Reading guide for implementers

Build order implied by the evidence: (1) version-aware local discovery with the F1 hierarchy and F8 taxonomy; (2) v3 decode stack per the F9 matrix with validator-gated fixtures; (3) axes/transform-driven navigation and calibration (F2-F6); (4) responsiveness bounding (F7) sized by the acceptance matrix (F12); (5) optional capabilities only after review (O-C1..O-C8) and decided product choices (P-C1..P-C5).

## 2. Rejected draft assertions (no acceptance credit)

(none)

## 3. Not verified: unresolved, undecided or malformed-record proposals (no retention credit)

#### [B-110] UNRESOLVED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unresolved (evidence missing or contradictory)

Basis: insufficient
Reason: The corpus gives only the PR594 title ("more permissive with version 0.5, allowing support for spatial-data ome zarrs") with no rule-level detail of what strict 0.5 rejects but permissive accepts.
Evidence: S052 line 128, S052 line 171

Proposal text (not verified):

- R2. What permissive-0.5 (PR594) accepts beyond strict 0.5 [O-054].

#### [B-111] UNRESOLVED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unresolved (evidence missing or contradictory)

Basis: insufficient
Reason: Only the write-path rejection of `compressor` on zarr_format 3 is attested; no read-path evidence shows whether v3 arrays may carry either spelling.
Evidence: S013 lines 166-186, corpus search for compressor across case/sources (hits only write-path or v2-era contexts)

Proposal text (not verified):

- R3. Whether read paths must accept both `compressor` and `codecs` spellings on v3 arrays [O-047].

#### [B-112] UNRESOLVED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unresolved (evidence missing or contradictory)

Basis: insufficient
Reason: The features matrix says napari does not read top-level scale while the post-PR123 code path combines dataset and top-level transforms but uses only the first dataset transform, leaving the applied combination genuinely contradictory.
Evidence: S043 lines 394-411, S048 lines 260-291

Proposal text (not verified):

- R4. Which transform combinations the fixed napari reader applies (dataset + top-level, translation handling) [O-044].

#### [B-113] UNRESOLVED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unresolved (evidence missing or contradictory)

Basis: insufficient
Reason: The corpus gives examples of each phenomenon but no frequency data for translations, top-level transforms, multi-multiscales groups, custom hierarchies, non-bioformats2raw pyramids, or dtype histograms.
Evidence: S054 lines 31-52, S056 lines 10-73, S043 lines 277-316, S033 lines 251-256, S025 lines 81-86

Proposal text (not verified):

- R5. Real-world frequencies: translations, top-level transforms, multi-multiscales groups, custom hierarchies, non-bioformats2raw pyramid shapes, dtype histogram [O-005..O-007, O-021..O-023, O-027, O-028, O-039, O-056].

#### [B-114] UNRESOLVED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unresolved (evidence missing or contradictory)

Basis: insufficient
Reason: Each listed gap (PR123 TODOs in releases, vizarr #307 root cause, neuroglancer v3/shard support, Vol-E 0.5 support, AGAVE out-of-switch dtypes) has no resolving evidence in the corpus beyond its original report.
Evidence: S027 lines 175-178, S014 lines 139-143, S038 line 58, S062 lines 11-15, S096 lines 25-28

Proposal text (not verified):

- R6. Status of deferred reader gaps: napari PR123 TODOs in releases, vizarr #307 root cause, neuroglancer v3/shard support, Vol-E 0.5 support, AGAVE out-of-switch dtypes [O-042, O-043, O-048, O-049, O-051, O-058].

#### [B-115] UNRESOLVED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unresolved (evidence missing or contradictory)

Basis: insufficient
Reason: The validator capture is a 16-line README describing a web page with sample links and schema overrides, saying nothing about codec/shard vs metadata-only coverage.
Evidence: S031 lines 1-16

Proposal text (not verified):

- R7. Validator coverage: metadata-only vs codec/shard correctness [O-059].

## 4. Verifier additions (new verifier assertions; checked like any claim)

# Additions (independent verification)

## 1. Material observations the draft lost

Restated from stage1/observations.md with sources. Each is supported by the cited source text I re-checked.

- L1. ome-zarr-py builds the full dask pyramid eagerly at open (one dask array per resolution appended to node.data, S018 lines 298-313) and attaches any labels group as a hidden child. The eager-pyramid part never made it into the draft; it is the reference reader's memory model and the baseline Slide Scout's lazy/bounded loading (F7) must beat. (From O-019.)
- L2. Early-0.5-era reads were validated against a small set of challenge conversions, so read-path edge cases (codecs, sharding, translations, multi-multiscales) may be under-tested even in reference code (O-061 implication; PR404 tested against IDR/challenge examples, S008 lines 154-160). The draft cites PR404 only for timeline (P8), losing this caution. It strengthens the F12 matrix argument.
- L3. MoBIE records supported:yes for HCS plates with no pattern detail (S043 lines 223-224). The draft's P17 ("exactly one proven low-risk pattern") drops this second supporting viewer; my B-022 replacement restores it. (From O-031 context.)
- L4. OMERO's multi-multiscales entry records no supported verdict and notes "All images imported but sample image is corrupted" (S043 lines 311-313). The draft's "no surveyed viewer opens beyond multiscales[0]" drops this exception; my B-021 replacement restores it. (From O-032 context.)
- L5. When plate metadata is present, matching series metadata SHOULD still be provided for plate-unaware tools (S003 lines 261-263). The draft's P6/F1 precedence omits this SHOULD, which matters for a viewer choosing which list to trust when both exist. (From O-014 context.)
- L6. AGAVE shows a scene-selection dialog for multi-scene data (re-open to switch scenes) and an error dialog with the reason in the AGAVE log when data cannot load (S117 lines 63-70). The draft's AGAVE portrait (P11) covers the Load Settings dialog but loses the multi-scene and error-dialog precedents, both directly relevant to F1/F8. (Found in O-052's source during verification.)
- L7. bioformats2raw 0.3.0+ writes reflect layout version 3 (OME/METADATA.ome.xml inside an OME dir), and plate/series groups follow the 0.2-era conventions before converter 0.5.0 (S033 lines 339-345). The draft's converter portrait (P12) loses this lineage detail, which dates the layout-3 population. (From O-055 context.)
- L8. The omero-reader support row was never summarized: vizarr, napari, and WEBKNOSSOS (except rdefs) apply omero rendering metadata, while Vol-E, BigDataViewer, MoBIE, neuroglancer, vtk-itk-viewer, OMERO, and Microscopy Nodes do not (S043 lines 38-78, incl. "rdefs are not supported" at line 70). The draft's F3/F4 lean on omero/rdefs defaults without noting most surveyed viewers ignore them. (From O-033/O-035 context; see also N5 below.)

## 2. New supported findings

Found during verification reads outside the O-block citations. All are supported by the quoted source text.

- N1. Resave chunk/shard defaults: resave's default shard shape is the full image-array shape, and shards over 100,000,000 pixels require an explicit --output-shards value (applied to all resolutions, with matching --output-chunks when chunk shapes vary per level); per-resolution tuning goes through a JSON details file (S034 lines 291-315). Consequence for F9/F2: converted 0.5 filesets may carry whole-array shards, so shard-shape handling is not an edge case. Validation: open a default-resave fixture and a tuned-shard fixture and compare tile-fetch counts at one zoom step.
- N2. Plate metadata-request amplification: a vizarr feature issue reports row x col .zarray requests before any pixel data for plates (e.g. 394 x 5 = 1970 requests for a 0.1 plate) and proposes reusing the first image's array metadata for the rest (S050 lines 3644, 3691). Caveat: v2-era (.zarray) report; the concern carries to v3 (one zarr.json per array) but the fix's validity for heterogeneous 0.5 arrays is unproven. Consequence for F7: plate opening needs a metadata-fetch budget, not just a pixel budget. Validation: count metadata requests when opening the sparse-plate fixture.
- N3. Napari post-PR123 transform narrowing: for non-scene images the code takes only the first dataset transform plus the first intrinsic-matching top-level transform (S048 lines 260-283), which for plain 0.5 data means a dataset-level translation at index 1 is dropped even though the matrix credits napari with translation support (S043 lines 370-371). This internal contradiction is why R4 stays unresolved; see B-112. Consequence for F6: do not cite "napari applies translation" without a version pin.
- N4. Second hidden-by-default precedent: ome-zarr-py attaches the labels child with visibility=False (S018 lines 315-318), matching napari's visible:False for label layers (S048 lines 652-654). Strengthens the F5 default. Validation: none needed beyond the two code cites.
- N5. Reader-architecture drift signal: a 2025 ome-zarr-py issue thread proposes deprecating ome-zarr-py's reading/graph-traversal role in favor of ngff-zarr (writing) and ome-zarr-models-py (validation), keeping only simple first-dataset reads plus napari's reworked traversal (S028 line 3051). Caveat: single issue thread in a large dump, proposal not decision. Consequence: Slide Scout should depend on specified behavior (S003/S053), not on ome-zarr-py reader internals that its own maintainers propose to retire.
- N6. WEBKNOSSOS label-dimension tolerance: each label dimension should equal the image's or be 1 when irrelevant (S058 lines 333-337). The 0.5 spec says label images are "usually" same-dimensions (S003 lines 432-433) without this rule; a converter/consumer doc stating singleton-tolerance is a genuine interop nuance for F5 alignment. Validation: overlay a singleton-dimension label fixture and check broadcast behavior.

## 3. Correct non-findings

Absence claims I checked with bounded searches. Each states its scope so it can be re-run.

- NF1. No Scene/coordinateSystems obligation in 0.5: regex search for `scene|coordinateSystem` over case/sources/S003.txt returns no hits. Supports U3 (B-106).
- NF2. No read-path `compressor`-on-v3 evidence: regex search for `compressor` over case/sources returns only the S013 write-path rejection plus v2-era/write contexts (S017, S028, S029) and one unrelated vizarr-notebook hit (S050). Supports R3 staying unresolved (B-111).
- NF3. Napari plate.py content absent: only the tree listing (S047 lines 199-206, blob metadata, no code) and S048's import/call sites exist in the corpus. Supports the B-050 qualification.
- NF4. Validator coverage unknown: S031 is 16 lines (page, samples link, schemas override); no rule list in the corpus. Supports R7 (B-115).
- NF5. No PR594 rule detail: both v0.19.0 bodies carrying the "more permissive with version 0.5" title (S052 lines 128, 171) give PR numbers only, no acceptance rules. Supports R2 (B-110).
- NF6. No labels key inside the 0.5 multiscales group: regex search for `labels` over S003 shows the listing only in the labels-group zarr.json (lines 102-112, 441-450) and prose. Supports the B-109 resolution.

## 4. Grouped product decisions for the user

Evidence informs but does not settle these. Recommended defaults are marked where the corpus leans; the rest are neutral.

### G1. Navigation and discovery

- Plate navigation model (P-C1, B-098): overview-plus-drill-down (vizarr pattern, S043 lines 213-215) vs stitched canvas (zero-fill precedent, S018) vs flat field list. Recommended: overview plus drill-down; it is the only corpus-detailed low-risk pattern.
- Multi-multiscales choice UI (O-C3, B-091): implement spec user-choice-by-name (S003 lines 388-397) vs first-only like all surveyed viewers (S043 lines 277-316). Recommended: first-by-default with an explicit switcher; it satisfies the spec without breaking the common single-multiscale case.
- Finder-style collection browsing (O-C7, B-095): adopt traversal-plus-served-browsing (S023 lines 150-154) or keep single-fileset open only. Neutral; depends on whether users hold folders of filesets.
- Raw-array fallback view (O-C2, B-090): pixels-plus-notice for decodable non-NGFF arrays (S018 lines 593-600) vs hard refusal. Recommended: fallback with notice; silent ignore is an attested bad behavior.

### G2. Rendering and calibration

- Channel rendering (P-C2, B-099): split per-channel layers (S048 lines 204-213) vs blended composite (S025 lines 81-83). Neutral; affects toggle semantics and color fidelity.
- Pyramid UX (P-C3, B-100): fully automatic level choice (Plan L5) vs explicit choice with memory estimate (S117 lines 94-135) vs hybrid low-res-first. Recommended: hybrid (auto with a visible cap/override) for TB-scale safety.
- Overlay scope (P-C5, B-102): labels-only (recommended; only 3/11 viewers do general overlay, S043 lines 473-507) vs general multi-image overlay. Recommended: labels-only per brief.
- Translation handling (O-C4, B-092): napari-style alignment vs ignore-with-notice. Neutral, but ignore-silently is disallowed by the vizarr/WEBKNOSSOS failure modes (S043 lines 361-365, 383-386).
- Rotation/affine/sequence tolerance (O-C5, B-093): compose (S048 lines 81-126) vs warn-and-skip vs reject. Recommended: compose where the math is total, else warn-and-skip; never crash.
- Scalebar/coordinate display (from O-033's lost open question): per-axis pixel size plus calibrated cursor readout is the F6 minimum; scalebar styling and unit-mismatch rules need an explicit decision. Neutral.

### G3. Correctness posture and errors

- Strictness (P-C4, B-101): strict schema rejection (S053) vs permissive-with-notice (v0.19 spatial-data precedent, S052 line 128). Neutral; pick per acceptance matrix row.
- Contrast degradation: per-channel fallback with notice (napari behavior, S048 lines 316-323) vs wipe-all-limits (ome-zarr-py behavior, S018 lines 379-383). Recommended: per-channel; the draft's F3 already takes this position.
- Units display rule: state the rule for missing/inconsistent units (napari hides units with a warning, S048 lines 249-254). Neutral on the exact rule; having none is disallowed.
- Failure taxonomy verbosity (F8, B-065): node-plus-rule-plus-recovery messages per row. Recommended as specified; silent states are attested bad behaviors.

### G4. Scope and acceptance

- RO-Crate display (O-C1, B-089) and label-properties inspect (O-C6, B-094): adopt or defer; both have clean validation fixtures (S034 lines 201-204; S003 lines 467-474 with S048 lines 628-650). Neutral.
- Transfer-function rendering and ROI clipping (O-C8, B-096): adopt or defer (S108 lines 13-30). Neutral; beyond brief minimum.
- (dtype, codec, layout) support matrix (F9, B-070): which cells Slide Scout claims. The corpus fixes the label dtype row (all 8 int types, S003 lines 438-439) and the converter codec rows (S033 lines 157-200); the rest is a capacity decision.
- Acceptance large-case threshold (F12, B-085): size in GB/pixels/chunks (corpus spans 589 MB to 1.0 TB, S034 lines 67-83). Neutral on the number; leaving it unsized is disallowed.

## 5. Unresolved and unchecked items

### U-A. Standing unresolved (see decisions B-110..B-115)

- R2: what permissive-0.5 (PR594) accepts beyond strict 0.5 (B-110, NF5).
- R3: whether v3 read paths must accept `compressor` and `codecs` spellings (B-111, NF2).
- R4: which transform combinations the current napari reader applies (B-112, N3).
- R5: real-world frequencies of translations, top-level transforms, multi-multiscales groups, custom hierarchies, non-bioformats2raw pyramids, dtype histograms (B-113).
- R6: napari PR123 TODOs in releases, vizarr #307 root cause, neuroglancer v3/shard support, Vol-E 0.5 support, AGAVE out-of-switch dtypes (B-114).
- R7: validator metadata-only vs codec/shard coverage (B-115, NF4).
- R1 is settled as actionable (B-109, NF6).

### U-B. Open questions the draft dropped (still open)

- How should the viewer report mixed-version hierarchies (O-002), and how do readers treat groups mixing namespaced and flat keys (O-018)?
- Do existing 0.5 writers always emit dimension_names, and what should mismatch do (O-004)?
- How common are custom/null axis types and 2D/3D/4D images; does AGAVE validate axes against its dimorder (O-003, O-053)?
- Do real 0.5 filesets use top-level multiscales transforms and translations, and do any contain rotation/affine/sequence (O-005, O-064)?
- Do filesets use non-numeric dataset paths, non-default scale-format layouts, or disagreeing plate path/index pairs (O-006, O-012, O-039)?
- What fraction of labels use intermediate groups, omit listing, or lack image-label colors/version; what survives multi-channel label squeeze (O-009, O-010, O-062)?
- Must Slide Scout expose plate/well/acquisition navigation or flatten fields; what is the largest plate it must open (O-011, O-013, O-023)?
- How many filesets still use bioformats2raw.layout, what does napari do without OME-XML, and which bioformats2raw version first wrote 0.5 (O-014, O-027, O-038)?
- Should Slide Scout detect-and-explain 0.4 or treat non-0.5 as generic malformed input (O-015)?
- Does ome-zarr-py validate top-level transforms like dataset transforms, and what read-path error do mixed-format opens produce (O-017, O-046)?
- Does any 0.5 tool expose non-first multiscales; are multi-multiscales groups present in 0.5 data (O-019, O-032)?
- Which codecs beyond the bioformats2raw table (zlib? others) and which dtypes appear in real 0.5 arrays (O-022, O-028, O-037)?
- Should RO-Crate surface in the details panel, and what acceptance size threshold applies (O-024, O-025)?
- Split-channel vs composite rendering; which napari PR123 TODOs remain (O-026, O-049)?
- Do filesets use translations for label/image alignment; how often top-level scale (O-034, O-035)?
- Label overlay: reuse image levels or independent label levels (O-036)?
- What chunk/shard shapes do local 0.5 filesets use; does the store.root walk-up work for v3/remote stores (O-041, O-063)?
- How does AGAVE render out-of-switch dtypes; does Vol-E support 0.5; does WEBKNOSSOS read local filesets (O-051, O-058, O-040)?
- Which bioformats2raw 0.5 layout details differ; what non-bioformats2raw pyramid shapes exist (O-038, O-056)?
- Is QuPath slowness per-chunk requests, missing pyramid use, or decompression (O-057)?
- Does the validator enforce schema plus prose MUSTs; should raw fallback apply to unknown codecs (O-066, O-068)?
- Single bad channel window: disable all contrast or just that channel (O-067; draft F3 recommends per-channel)?

### U-C. Unchecked by this verifier

- Large issue/API dumps: S015, S026, S028 (beyond two targeted hits), S035, S050 (beyond two targeted hits), S073, S078-S080, S087, S089-S091, S097, S100-S101, S109, S112, S114, S118-S125 and S024, S063-S065, S075-S076, S081-S086, S088, S092-S094, S102-S107, S110-S111, S113, S116 — not read; stage-1 D1/D3 stands except where my targeted searches touched them.
- Sample/version context: S010 catalog, S059 (0.4 spec), S051 (RFCs) beyond stage-1 sampling; S020, S029, S040, S057 remainders.
- No live fetching, rendering, or code execution was performed (case rules); all validation ideas in decisions and draft remain unexecuted proposals.

## 6. Coverage

### What I verified and how

- Read fully: S003 (0.5 spec, 896 lines), S043 (features matrix, 567 lines), S053 (image schema, 269 lines), S048 (napari reader, 723 lines), S018 (ome-zarr-py reader, 611 lines), S016 (format.py validation + FormatV05), S044 (auto-shard issue), S056 (plate wells listing, 49 paths counted), S054/S055 (IDR image/array examples), plan/Viewer.md, brief.md.
- Read in targeted windows or via the evidence bundle with follow-up context: S004, S008, S011, S013, S014, S019, S023, S025, S027, S031, S033 (codec table, formatting, usage changes), S034 (challenge, resave, chunk/shard tuning), S038, S052 (release bodies incl. v0.12.0/v0.15/v0.16/v0.19.x), S058, S061, S062, S072, S096, S098, S108, S117, S047, plus S002/S005/S007-class empty/stub captures via O-065.
- Corpus searches (muse.search, regex): `compressor` over case/sources; `scene|coordinateSystem` over S003; `labels` over S003; `get_pyramid_lazy|get_first_well|plate\.py` over case/sources; `merged|20(24|25)|...` date checks over S008/S013/S023/S027; `v0\.(12|15|16|19)|sharding|permissive|...` over S052; dimorder/driver over S098; resave/modify over S034; compressor-option flags over S033; plate title over S050. Scopes and hit sets are recorded in decisions B-106, B-109..B-115 and non-findings NF1-NF6.
- Quote-locator results in stage1/evidence-bundle.md were treated as retrieval hints only; every decided claim was checked against the underlying source lines, and not_located quotes (O-003..O-006, O-008, O-009, O-014, O-017..O-024, O-027, O-032, O-035, O-037..O-039, O-048, O-050, O-053, O-062, O-064..O-068) were verified by reading the cited windows, not by lookup success.

### Decision tally

- 129 blocks decided: 78 confirm, 10 qualify (B-009, B-014, B-015, B-019, B-021, B-022, B-026, B-030, B-050, B-109, each with a stand-alone replacement), 0 reject, 6 unresolved (B-110..B-115), 35 not_a_claim (headings, validation-idea proposals, and stage-1 process records in B-116..B-128).
- No block left undecided; grouped ranges cover only contiguous bookkeeping blocks (B-002..B-003, B-116..B-121, B-122..B-128).

### Limits

- Verification is textual only: I compared draft claims against pinned source text and the Plan. I did not open filesets, run readers, render images, or fetch live sources.
- Absence findings (NF1-NF6) are bounded by the stated search scopes; re-running the recorded patterns is the check.
- Deferred stage-1 sources (U-C) could still move R5/R6 and several U-B questions; nothing in them was assumed.

## 5. History appendix

### 5.1 Complete stage-1 draft with block decisions

[B-001: CONFIRMED]
# Slide Scout 0.5 research report (draft)

Scope: local read-only desktop browser for OME-Zarr 0.5 filesets (brief.md). This report assesses the thin Plan snapshot (plan/Viewer.md) against the fixed corpus case/sources/*.txt. A Plan passage marks specified coverage, not implemented or tested behavior. Nothing here is independently verified beyond the corpus; validation ideas are checks to run, not passed tests.

[B-002: NOT A CLAIM (bookkeeping)]
## 1. Supported propositions

[B-003: NOT A CLAIM (bookkeeping)]
### Format obligations (0.5 authority: S003 + S053)

[B-004: CONFIRMED]
- P1. 0.5 is Zarr v3 only, with metadata in `zarr.json` under `attributes.ome` and `version: "0.5"` consistent through the hierarchy [O-001, O-002]. All Zarr features are allowed unless disallowed, so arbitrary codecs, chunk grids, key encodings, dtypes and transformers are legal input.
[B-005: CONFIRMED]
- P2. Multiscales images are 2-5D with ordered axes (time, channel/custom, space), `dimension_names` on every level array matching axes names, datasets ordered largest-first with arbitrary path names, each dataset carrying exactly one scale plus optionally one translation after it, vectors matching axes length; an optional top-level multiscales transform applies after per-dataset ones [O-003, O-004, O-005, O-006, O-066].
[B-006: CONFIRMED]
- P3. `omero` is optional transitional render metadata; when present, `channels` with 6-hex `color` and `window {min,max,start,end}` are required, plus `rdefs {defaultT, defaultZ, model}` and per-channel `active/label` as display defaults [O-008, O-067].
[B-007: CONFIRMED]
- P4. Labels live under a `labels` group (not an image), allow metadata-free intermediate groups, require integer dtype from a fixed 8-member set, SHOULD all be listed in the labels-group `labels` array, are themselves multiscales images with the same level count as the source, and SHOULD carry `image-label` with `colors` (label-value + optional rgba), `version`, optional `properties`, and `source.image` default `../../` [O-009, O-010].
[B-008: CONFIRMED]
- P5. HCS layout is plate -> row groups -> well groups -> field images, with strict plate keys (rows, columns, wells with consistent path/rowIndex/columnIndex, version) and well keys (images with unique alphanumeric path, acquisition id when multi-acquisition) [O-011, O-012, O-013]. Sparse plates list full row/column extent but only present wells [O-023].
[B-009: QUALIFIED]
- P6. `bioformats2raw.layout: 3` is transitional multi-image packaging; plate takes precedence when present, else OME `series` list, else numbered groups `0,1,2...`; readers SHOULD surface all images, not just the first [O-014].
[B-010: CONFIRMED]
- P7. The 0.4->0.5 break is Zarr v2->v3 (`.zattrs/.zarray/.zgroup` vs `zarr.json`, flat vs `ome`-namespaced attrs); 0.5.1/0.5.2 clarified omero text and the `dimension_names` MUST [O-015, O-055-scope, O-060].

[B-011: NOT A CLAIM (bookkeeping)]
### Reader implementations (observed behavior, not spec)

[B-012: CONFIRMED]
- P8. Reference Python reading moved in stages: 0.5 read-only on zarr v3 (PR404, Nov 2024), then 0.5 write-by-default with mixed v04/v05 writes rejected (PR413, v0.12.0), then sharding (v0.16), then permissive-0.5/scene/plain-string-codec handling (v0.19); the S016 FormatV05 snapshot (May 2025, write unsupported) is stale relative to releases [O-016, O-046, O-054, O-061].
[B-013: CONFIRMED]
- P9. ome-zarr-py unwraps v3 attrs under `ome`, validates exactly-one-scale-first with <=1 translation and ndim-matched numeric vectors, reads only `multiscales[0]`, degrades omero/contrast silently on bad input, stitches wells/plates into lazy dask grids with zeros for missing tiles, and falls back to raw-array load or silent ignore [O-017, O-018, O-019, O-020, O-067, O-068].
[B-014: QUALIFIED]
- P10. napari-ome-zarr (post-PR123, direct zarr>=3.0.8, no ome-zarr dep) dispatches Multiscales/Plate/Bioformats2raw/Labels/Scene, splits image channels into layers while keeping label axes whole, squeezes label channel axes, hides labels by default, resolves arbitrary entry points by walking up, and tolerates rotation/affine/sequence transforms with warn-and-skip [O-026, O-027, O-049, O-062, O-063, O-064].
[B-015: QUALIFIED]
- P11. AGAVE (desktop, tensorstore v0.1.78) reads local 0.4+0.5 with explicit resolution/channel/sub-region choice, GPU-memory estimate, <=4 concurrent channels, time slider, and version-branched metadata lookup, but assumes T,C,Z,Y,X dimorder and documents a 4-dtype switch [O-051, O-052, O-053].
[B-016: CONFIRMED]
- P12. Bioformats2raw writes 0.4 and 0.5 with a v3/0.5 codec table (null, blosc, gzip, zstd; no zlib), TCZYX default order, ~256px smallest level with factor-2 steps by default, and options that can produce non-spec hierarchies or drop OME/root markers [O-037, O-038, O-039, O-055, O-056].
[B-017: CONFIRMED]
- P13. Real 0.5 filesets observed: IDR czyx image with physical per-level scales and micrometer space units [O-021]; sharded blosc/zstd uint16 array with `dimension_names` [O-022]; sparse 6x11 plate with ~50 wells and field_count 32 [O-023]; challenge conversions with heterogeneous sharding plus top-level RO-Crate sidecars [O-024]; sizes from 589 MB to 1 TB [O-025].

[B-018: NOT A CLAIM (bookkeeping)]
### Compatibility failures and contradictions (must-handle)

[B-019: QUALIFIED]
- P14. Rendering/decoding failures on valid-looking 0.5 data are attested: vizarr repetitive-chunk rendering of resave conversions [O-042]; neuroglancer no-metadata-found plus silent no-chunks on sharded v3 [O-048]; napari zarr<3 pin vs bioio zarr>=3 conflict [O-043]; v2 `compressor` kwarg rejected on v3 writes [O-047]; auto-sharding writer crash (S044 file, read; no separate O-block).
[B-020: CONFIRMED]
- P15. Calibration is unevenly implemented across viewers: dataset scale read by 7/11 surveyed, translation applied only by napari (vizarr image-disappears, WEBKNOSSOS fails to open), top-level scale read by 4/11, Z-downsampled and non-2-factor pyramids break vizarr/avivator, and the default napari reader ignores transforms producing wrong anisotropy [O-029, O-030, O-033, O-034, O-035, O-044].
[B-021: QUALIFIED]
- P16. Discovery ambiguities are real: no surveyed viewer opens beyond `multiscales[0]` and three crash on the multi-multiscales sample [O-032]; labels listings can be missing while label groups exist and the pre-0.5 spec under-defined labels objects [O-050]; bioformats2raw discovery has three competing rules (spec series/numbered-groups vs napari OME-XML parse) [O-027]; PR206's labels-registration-move proposal contradicts released spec text [O-060].
[B-022: QUALIFIED]
- P17. HCS at scale has exactly one proven low-risk pattern in the corpus: plate overview at low resolution plus drill-down per well/field (vizarr); full-resolution stitched canvases crash (napari zoom crash) or hide missing data as zeros (ome-zarr-py) [O-020, O-031].

[B-023: NOT A CLAIM (bookkeeping)]
### Opportunities and simpler alternatives

[B-024: CONFIRMED]
- P18. Directory traversal + served browsing (`ome_zarr finder` + BioFile Finder CSV with Folder tree, thumbnails, copy-URL) is a shipped simpler alternative to deep indexing; its 0.5 gap is precisely the zarr.json traversal the Apr-2025 version deferred [O-045].
[B-025: CONFIRMED]
- P19. The validator URL pattern plus IDR/challenge sample catalogs give a ready acceptance oracle: every representative fileset should first open in ome-ngff-validator [O-059, O-025, O-013-context S034/S010].
[B-026: QUALIFIED]
- P20. Bounded precedents exist for hard choices: Vizarr/Viv and AGAVE publish explicit dtype matrices [O-028, O-051]; AGAVE publishes an explicit memory-bounding load dialog [O-052]; WEBKNOSSOS publishes chunk/shard tuning guidance [O-041].

[B-027: NOT A CLAIM (bookkeeping)]
## 2. Plan fit

Plan citations use plan/Viewer.md line numbers. Each item carries one disposition, the exact constraint, product consequence, and a distinguishing validation idea (not a passed test).

[B-028: CONFIRMED]
### F1. "opens a local OME-Zarr 0.5 fileset and lists the images it finds" (Plan L5)
[B-029: CONFIRMED]
- Disposition: correction.
[B-030: QUALIFIED]
- Constraint: discovery must branch on store markers (0.5 `zarr.json` + `attributes.ome.version=="0.5"` vs 0.4 `.zattrs`; mixed hierarchies invalid), then follow plate->well->field lists, bioformats2raw.layout precedence (plate > OME series > numbered groups), labels-listing UNION directory probing, first-multiscales default with multi-multiscales choice, and arbitrary entry-point walk-up [O-001, O-002, O-006, O-007, O-011, O-012, O-013, O-014, O-015, O-040, O-046, O-050, O-063].
[B-031: CONFIRMED]
- Consequence: a flat image list is wrong for plates/collections; the finder must present hierarchy-aware navigation (fileset > plate/well/field or series > image > labels) and version-aware errors.
[B-032: NOT A CLAIM (bookkeeping)]
- Validation idea: open five fixtures (plain image; sparse plate S056-shape; bioformats2raw multi-series; labels-unlisted labels group; 0.4 fileset) and check the listed tree plus the 0.4 message, against validator results for the same fixtures.

[B-033: CONFIRMED]
### F2. "canvas with pan and zoom" + "chooses an available pyramid level appropriate for the current view" (Plan L5)
[B-034: CONFIRMED]
- Disposition: correction.
[B-035: CONFIRMED]
- Constraint: level order is datasets[] order (never numeric sort); per-level pixel size comes from that level's scale (never assumed factor 2); z-size may differ per level; arrays may be sharded with blosc/gzip/zstd codecs and 3D or 2D chunks [O-005, O-006, O-021, O-022, O-024, O-029, O-030, O-037, O-041, O-056].
[B-036: CONFIRMED]
- Consequence: the renderer needs scale-aware level selection, per-level plane counts, and a v3 codec/shard decode stack; assuming uniform 2x y/x-only pyramids breaks real data.
[B-037: NOT A CLAIM (bookkeeping)]
- Validation idea: render a Z-downsampled pyramid and a non-2-factor pyramid next to a known-good view and compare level shapes, displayed scale, and tile alignment at three zoom steps.

[B-038: CONFIRMED]
### F3. "channel visibility controls" (Plan L5)
[B-039: CONFIRMED]
- Disposition: covered, with correction on defaults.
[B-040: CONFIRMED]
- Constraint: visibility/label/color/window defaults come from omero channels when present (color hex, active, label, window start/end; greyscale model whitens; missing windows must not silently reset all channels); absent omero needs deterministic fallbacks; split-layer vs composite rendering is open [O-008, O-026, O-051, O-052, O-067].
[B-041: CONFIRMED]
- Consequence: controls work without omero but match omero when present; a single bad channel must degrade per-channel with notice, not wipe all contrast.
[B-042: NOT A CLAIM (bookkeeping)]
- Validation idea: open one image with full omero, one without, and one with a single broken window; record initial visibility, names, colors, and contrast limits per channel.

[B-043: CONFIRMED]
### F4. "time-point and plane selection where relevant" (Plan L5)
[B-044: CONFIRMED]
- Disposition: correction.
[B-045: CONFIRMED]
- Constraint: which selectors appear is driven by axes (2-5D, time/channel/space/custom order), not by fixed 5D tczyx; plane counts vary per pyramid level when Z is downsampled; rdefs defaultT/defaultZ give initial positions when present [O-003, O-008, O-029, O-053, O-055].
[B-046: CONFIRMED]
- Consequence: 2D/3D/4D and custom-axis images show only applicable selectors; switching pyramid level must remap plane indices through that level's shape.
[B-047: NOT A CLAIM (bookkeeping)]
- Validation idea: open 2D, 3D, 4D (no-t), 5D, and custom-axis fixtures; check selector presence, default positions vs rdefs, and plane-count changes across two pyramid levels.

[B-048: CONFIRMED]
### F5. "optional overlays for associated label images" (Plan L5)
[B-049: CONFIRMED]
- Disposition: correction.
[B-050: QUALIFIED]
- Constraint: discover labels by listing UNION probing; require integer dtype and same level count; align overlay level-to-level with the source image using each side's transforms; default hidden with explicit toggle; colors from image-label colors (invented colormap only when absent); channel axis removed for the overlay layer; plate labels derive per wells/fields [O-009, O-010, O-021-context, O-026, O-036, O-050, O-062].
[B-051: CONFIRMED]
- Consequence: overlay is a label-specific aligned layer (not general multi-image fusion); misaligned levels or missing colors must produce explicit notices, not silent offsets or invisible labels.
[B-052: NOT A CLAIM (bookkeeping)]
- Validation idea: overlay a labeled image at two pyramid levels and screenshot-diff label boundaries against the source; repeat with missing image-label colors and with a plate labels fixture.

[B-053: CONFIRMED]
### F6. "details panel shows dimensions, units and coordinates" (Plan L5)
[B-054: CONFIRMED]
- Disposition: correction.
[B-055: CONFIRMED]
- Constraint: coordinates combine per-dataset scale/translation with top-level multiscales transforms, in axes order with UDUNITS units (space/time lists; channel usually unitless); dimension_names must match axes names; translations must at minimum not break rendering; inconsistent/missing units need a stated display rule [O-003, O-004, O-005, O-021, O-033, O-034, O-035, O-044].
[B-056: CONFIRMED]
- Consequence: the panel shows per-axis pixel size, units, and calibrated cursor coordinates computed from the active level's combined transform; ignoring top-level transforms or translations repeats known viewer bugs.
[B-057: NOT A CLAIM (bookkeeping)]
- Validation idea: for fixtures with dataset-only scale, dataset+top-level scale, and translation, hand-compute three cursor positions from the JSON vectors and compare with panel readouts.

[B-058: CONFIRMED]
### F7. "Large image reads run in the background so navigation remains responsive. Changing the selected view cancels work that is no longer needed." (Plan L7)
[B-059: CONFIRMED]
- Disposition: covered, with product_choice on bounding strategy.
[B-060: CONFIRMED]
- Constraint: corpus proves both automatic background/cancel (Plan) and explicit pre-load bounding with memory estimate (AGAVE level/channel/sub-region dialog); TB-scale plates and 21-66 GB images make unbounded eager loads infeasible [O-020, O-025, O-031, O-052, O-057].
[B-061: CONFIRMED]
- Consequence: keep Plan's background/cancel behavior and add a bounding rule (auto low-res-first and/or explicit choice with estimate) so the large-dataset acceptance case cannot OOM.
[B-062: NOT A CLAIM (bookkeeping)]
- Validation idea: open the largest acceptance fileset while profiling interaction latency and peak memory during pan/zoom/channel flips; cancel must drop stale tile requests observably.

[B-063: CONFIRMED]
### F8. "Opening failures explain which image or data could not be displayed and allow the user to choose another item." (Plan L7)
[B-064: CONFIRMED]
- Disposition: correction.
[B-065: CONFIRMED]
- Constraint: attested failure taxonomy: 0.4-in-0.5-scope, mixed v04/v05, missing/inconsistent version, absent multiscales/plate/well keys, schema violations (counts, required keys, vector lengths), dimension_names mismatch, unsupported codec/shard, unsupported dtype, transform violations, missing wells/fields, unlisted-vs-unreadable labels, non-multiscale entry [O-002, O-015, O-040, O-042, O-046, O-047, O-048, O-060, O-063, O-066].
[B-066: CONFIRMED]
- Consequence: errors must name the failing node, the violated rule, and the recovery action (pick another item/level); silent ignores and silent no-chunks states are known bad behaviors.
[B-067: NOT A CLAIM (bookkeeping)]
- Validation idea: feed a malformed corpus (one fixture per taxonomy row) and check each message names node + rule + next action, with the browser still usable.

[B-068: CONFIRMED]
### F9. "should interoperate with filesets from real OME-Zarr 0.5 tools" (Plan L9)
[B-069: CONFIRMED]
- Disposition: correction.
[B-070: CONFIRMED]
- Constraint: interop means the observed decode matrices: sharding_indexed + blosc (cname/clevel/shuffle variants)/gzip/zstd/null codecs, arbitrary chunk grids, uint/int/float dtype coverage declared (spec labels need all 8 int types; renderers bound support), 2024-2026 behavior drift (permissive-0.5, plain-string codec attrs), and converter quirks (custom hierarchies, dropped OME/root markers) [O-022, O-024, O-028, O-037, O-039, O-041, O-047, O-051, O-054, O-056].
[B-071: CONFIRMED]
- Consequence: publish an explicit supported/unsupported matrix (codecs x dtypes x layouts) and test it; anything outside fails loudly with the matrix row cited.
[B-072: NOT A CLAIM (bookkeeping)]
- Validation idea: build a matrix fixture pack (one fileset per codec/dtype/layout cell claimed) and record open/render/explain outcomes per cell.

[B-073: CONFIRMED]
### F10. "Source files remain unchanged; display settings are local to the viewing session." (Plan L9)
[B-074: CONFIRMED]
- Disposition: covered.
[B-075: CONFIRMED]
- Constraint: local read-only opening; no sidecar writes into the fileset; challenge resave and validator flows confirm input-must-not-be-modified expectations [O-024, O-059-context].
[B-076: CONFIRMED]
- Consequence: no action beyond enforcing read-only file handles and session-scoped settings (avoid absolute-path settings portability trap [O-058]).
[B-077: NOT A CLAIM (bookkeeping)]
- Validation idea: hash the fileset tree before and after a scripted viewing session and diff; any delta fails.

[B-078: CONFIRMED]
### F11. "Image editing, export, remote storage and automated scientific or clinical interpretation are outside this plan." (Plan L9)
[B-079: CONFIRMED]
- Disposition: covered.
[B-080: CONFIRMED]
- Constraint: brief + Plan both exclude these; remote-read performance issues (QuPath) and pathology interpretation stay out of scope even where reading code overlaps [O-057].
[B-081: CONFIRMED]
- Consequence: decline remote URLs and interpretation requests with a scope message; do not partially implement them.
[B-082: NOT A CLAIM (bookkeeping)]
- Validation idea: attempt a remote-URL open and an export action; both must refuse with the scope message and leave local browsing intact.

[B-083: CONFIRMED]
### F12. "Acceptance uses representative filesets..." (Plan L11)
[B-084: CONFIRMED]
- Disposition: correction.
[B-085: CONFIRMED]
- Constraint: representative must span: plain image (2D..5D), sparse plate, bioformats2raw collection, labels (listed + unlisted + plate labels + missing colors), Z-downsampled + non-2 pyramids, translations present, top-level transforms present, multi-multiscales group, sharded + each claimed codec, 0.4 negative, malformed battery; each pre-checked in the validator; large case sized in GB/pixels/chunks [O-025, O-059, O-008-context samples].
[B-086: CONFIRMED]
- Consequence: acceptance is a fixture matrix with per-cell oracle (validator + known-good view), not a single happy-path fileset.
[B-087: NOT A CLAIM (bookkeeping)]
- Validation idea: publish the matrix and run it end-to-end; any cell without an oracle or threshold fails the acceptance definition itself.

[B-088: NOT A CLAIM (bookkeeping)]
### Optional capabilities (not required by brief/Plan; adopt only with review)

[B-089: CONFIRMED]
- O-C1. RO-Crate top-level metadata display (specimen/modality/name/description) [O-024]. Consequence: richer details panel for challenge data; validation: show RO-Crate fields for a challenge fileset vs absent-file fallback.
[B-090: CONFIRMED]
- O-C2. Raw-array fallback view for decodable-but-non-NGFF zarr with explicit notice [O-068]. Validation: open a bare v3 array and check pixels-plus-notice vs silent ignore.
[B-091: CONFIRMED]
- O-C3. Multi-multiscales choice UI (spec user-choice rule) despite zero surveyed viewers supporting it [O-007, O-032]. Validation: open the multi-multiscales sample without crashing and offer the choice.
[B-092: CONFIRMED]
- O-C4. Translation-aware alignment (napari-style) rather than ignore-safely [O-034]. Validation: overlay fixture with translation renders aligned, or documents ignore-with-notice.
[B-093: CONFIRMED]
- O-C5. Rotation/affine/sequence tolerance (warn-and-skip or compose) beyond 0.5 datasets allowance [O-064]. Validation: feed each richer transform and check no-crash + message.
[B-094: CONFIRMED]
- O-C6. Label properties on hover/inspect (index + arbitrary keys) [O-010, O-062-context]. Validation: hover shows properties table for the S003-example-style fixture.
[B-095: CONFIRMED]
- O-C7. Finder-style collection browsing (traversal + CSV/Folders tree + thumbnails + copy-URL) for multi-fileset directories [O-045]. Validation: point at a folder of filesets and browse without opening each.
[B-096: CONFIRMED]
- O-C8. Transfer-function channel rendering and ROI clipping (Vol-E/AGAVE-style) beyond visibility toggles [O-052, O-058]. Validation: reproduce a Pct-Min/exposure adjustment on a multichannel volume.

[B-097: NOT A CLAIM (bookkeeping)]
### Product choices (need explicit decisions; evidence informs but does not settle)

[B-098: CONFIRMED]
- P-C1. Plate navigation model: overview-plus-drill-down (vizarr pattern) vs stitched canvas vs flat field list [O-020, O-031]. Validation: usability pass on the sparse-plate fixture measuring time-to-first-field and zoom stability.
[B-099: CONFIRMED]
- P-C2. Channel rendering: split layers vs blended composite [O-026, O-052]. Validation: compare color fidelity and toggle behavior on a 3-channel uint16 fixture.
[B-100: CONFIRMED]
- P-C3. Pyramid UX: fully automatic level choice (Plan) vs explicit choice with memory estimate (AGAVE) vs hybrid low-res-first [O-052]. Validation: large-fileset open under a memory cap for each mode.
[B-101: CONFIRMED]
- P-C4. Strictness posture: strict schema rejection vs permissive-with-notice (v0.19 spatial-data precedent) [O-054, O-066]. Validation: open a spatial-data-style edge fixture under both postures and compare outcomes.
[B-102: CONFIRMED]
- P-C5. Overlay scope: labels-only (recommended) vs general multi-image overlay (only 3/11 viewers support) [O-036]. Validation: attempt a two-image overlay and confirm scoped refusal or supported path per decision.

[B-103: NOT A CLAIM (bookkeeping)]
### Unsupported (do not treat as required)

[B-104: CONFIRMED]
- U1. General multi-image overlay/fusion on one canvas: a minority viewer capability, not a format obligation [O-036].
[B-105: CONFIRMED]
- U2. Remote storage, export, editing, clinical interpretation: explicitly out of scope [Plan L9; O-057].
[B-106: CONFIRMED]
- U3. Scene/coordinateSystems graph traversal (v0.6-era): present in napari code paths but not a 0.5 obligation [O-064, S048 Scene].
[B-107: CONFIRMED]
- U4. zlib codec for 0.5: absent from the bioformats2raw v3 table (converter-specific, not a format promise) [O-037].

[B-108: NOT A CLAIM (bookkeeping)]
### Unresolved (evidence missing or contradictory)

[B-109: QUALIFIED]
- R1. Whether the labels-registration move (labels list into the multiscale group) was adopted or reverted before 0.5.0 [O-060 vs O-009].
[B-110: UNRESOLVED]
- R2. What permissive-0.5 (PR594) accepts beyond strict 0.5 [O-054].
[B-111: UNRESOLVED]
- R3. Whether read paths must accept both `compressor` and `codecs` spellings on v3 arrays [O-047].
[B-112: UNRESOLVED]
- R4. Which transform combinations the fixed napari reader applies (dataset + top-level, translation handling) [O-044].
[B-113: UNRESOLVED]
- R5. Real-world frequencies: translations, top-level transforms, multi-multiscales groups, custom hierarchies, non-bioformats2raw pyramid shapes, dtype histogram [O-005..O-007, O-021..O-023, O-027, O-028, O-039, O-056].
[B-114: UNRESOLVED]
- R6. Status of deferred reader gaps: napari PR123 TODOs in releases, vizarr #307 root cause, neuroglancer v3/shard support, Vol-E 0.5 support, AGAVE out-of-switch dtypes [O-042, O-043, O-048, O-049, O-051, O-058].
[B-115: UNRESOLVED]
- R7. Validator coverage: metadata-only vs codec/shard correctness [O-059].

[B-116: NOT A CLAIM (bookkeeping)]
## 3. Deferred items

[B-117: NOT A CLAIM (bookkeeping)]
- D1. Large issue-dump sources (S015, S028, S035, S050, S073, S078, S079, S080, S087, S089, S090, S091, S097, S100, S101, S109, S112, S114) were not read exhaustively; sampled only via targeted search or not at all. Reason: token budget vs marginal yield after core reader/spec/compat coverage; each remains available for follow-up on R5/R6.
[B-118: NOT A CLAIM (bookkeeping)]
- D2. Full 0.4 spec (S059) and RFC pages (S051) were sampled for version-contrast points only. Reason: 0.5 is the authority for this case; 0.4 detail matters only for the negative-message path.
[B-119: NOT A CLAIM (bookkeeping)]
- D3. Full sample catalog (S010), tensorstore/API dumps (S075, S084-S086, S107, S111, S113, S116, S122, S123), release lists (S026, S063, S064, S065), remaining PR/issue bodies (S008-rest, S013-rest, S023-rest, S027-rest, S029-rest), converter/webknossos remainders (S033-rest, S058-rest), and agave/hcs small captures were partially read or searched. Reason: bounded single-session pass; observations already cover their load-bearing facts, with R5-R7 marking the residue.
[B-120: NOT A CLAIM (bookkeeping)]
- D4. Empty/failed captures (O-065) contribute no facts and were treated as absence of evidence throughout.
[B-121: NOT A CLAIM (bookkeeping)]
- D5. No live fetching, rendering, or code execution was performed (case rules); all validation ideas are therefore unexecuted by design.

[B-122: NOT A CLAIM (bookkeeping)]
## 4. Coverage

[B-123: NOT A CLAIM (bookkeeping)]
- Sources read fully or near-fully: S003 (0.5 spec), S004-head (ngff PR206), S008-head (PR404), S009 (repo tree), S011 (napari issue 139), S013-head (PR413), S014 (vizarr issue 307), S016 (format.py), S017 (changelog), S018 (reader.py), S019 (io.py), S023-head (PR436), S025 (vizarr README), S027-part (napari PR123), S031, S033-part, S034 (challenge), S037, S038, S039, S041, S043 (features matrix), S044 (auto-shard issue), S048 (napari reader), S052-part (releases), S053 (image.schema), S054, S055, S056 (0.5 examples), S058-part, S061-part (QuPath), S062, S066, S067, S068, S072, S074-head, S096, S098-part (AGAVE diff), S099, S108, plus empty/stub captures S001, S002-catalog, S005, S006, S007, S012, S021, S030, S032, S036, S042, S045, S046, S049, S060, S069, S071, S077, S095.
[B-124: NOT A CLAIM (bookkeeping)]
- Sources partially read or searched: S010-head, S020-head, S027-rest, S029-part, S059-part (0.4 contrast), S098-rest, S117-part (AGAVE docs).
[B-125: NOT A CLAIM (bookkeeping)]
- Sources read fully (also): S070 (NGFF tools catalog).
[B-126: NOT A CLAIM (bookkeeping)]
- Sources not visited: S015, S024, S026, S028, S033-rest, S035, S040, S047, S050, S051, S057, S058-rest, S063, S064, S065, S073, S075, S076, S078, S079, S080, S081, S082, S083, S084, S085, S086, S087, S088, S089, S090, S091, S092, S093, S094, S097, S100, S101, S102, S103, S104, S105, S106, S107, S109, S110, S111, S112, S113, S114, S115, S116, S118, S119, S120, S121, S122, S123, S124, S125.
[B-127: NOT A CLAIM (bookkeeping)]
- Questions unvisited: per-codec performance tuning, exact validator rule list, spatial-data 0.5 deviations, scene-graph UX, thumbnail generation pipeline.
[B-128: NOT A CLAIM (bookkeeping)]
- Questions unresolved: R1-R7 above; all open questions attached to O-blocks persist as stated.

[B-129: CONFIRMED]
## 5. Reading guide for implementers

Build order implied by the evidence: (1) version-aware local discovery with the F1 hierarchy and F8 taxonomy; (2) v3 decode stack per the F9 matrix with validator-gated fixtures; (3) axes/transform-driven navigation and calibration (F2-F6); (4) responsiveness bounding (F7) sized by the acceptance matrix (F12); (5) optional capabilities only after review (O-C1..O-C8) and decided product choices (P-C1..P-C5).


### 5.2 Raw verifier records for non-authoritative or unknown blocks

(none)

### 5.3 Host assembly report (mechanical completeness only)

```json
{
 "blocks": 129,
 "by_status": {
  "confirm": 78,
  "not_a_claim": 35,
  "qualify": 10,
  "unresolved": 6
 },
 "unknown_ids": [],
 "decision_entries": 117,
 "lines_outside_entries": [
  1
 ],
 "non_authoritative": [],
 "carrier_defects": 1,
 "complete": false
}
```
