# Delivered research result

TEST_ONLY_NEVER_PROMOTE. Host-assembled from immutable stage-1 draft blocks and the same-model verifier's explicit per-block decisions. Only section 1 and section 4 are asserted content. Section 2 records rejected draft assertions; section 3 holds proposals that were not verified (unresolved, undecided, or with a malformed verifier record) and earns no verified-retention credit. Section 5 is history.

## 1. Current asserted findings

#### [B-001] CONFIRMED
Context: (document top)

Basis: supported
Reason: Scope framing matches the brief (local read-only 0.5 browser), the thin Plan snapshot, and the fixed-corpus rule; the Plan-coverage and validation-idea caveats are accurate method notes.
Evidence: brief.md lines 1-9, plan/Viewer.md lines 1-11, case/README.md lines 1-8

# Slide Scout 0.5 research report (draft)

Scope: local read-only desktop browser for OME-Zarr 0.5 filesets (brief.md). This report assesses the thin Plan snapshot (plan/Viewer.md) against the fixed corpus case/sources/*.txt. A Plan passage marks specified coverage, not implemented or tested behavior. Nothing here is independently verified beyond the corpus; validation ideas are checks to run, not passed tests.

#### [B-004] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Format obligations (0.5 authority: S003 + S053)

Basis: supported
Reason: Spec states Zarr v3 only with all Zarr features allowed unless disallowed, metadata under attributes.ome, and version "0.5" consistent within a hierarchy.
Evidence: S003 lines 68-72, S003 lines 150-156

- P1. 0.5 is Zarr v3 only, with metadata in `zarr.json` under `attributes.ome` and `version: "0.5"` consistent through the hierarchy [O-001, O-002]. All Zarr features are allowed unless disallowed, so arbitrary codecs, chunk grids, key encodings, dtypes and transformers are legal input.

#### [B-005] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Format obligations (0.5 authority: S003 + S053)

Basis: supported
Reason: Spec constrains axes to 2-5 with time/channel-custom/space order, requires dimension_names match, largest-first datasets, exactly one scale plus optional translation after it with axes-length vectors, and top-level transforms applied after per-dataset ones; schema matches.
Evidence: S003 lines 173-174, S003 lines 299-316, S053 lines 126-150, S053 lines 196-265

- P2. Multiscales images are 2-5D with ordered axes (time, channel/custom, space), `dimension_names` on every level array matching axes names, datasets ordered largest-first with arbitrary path names, each dataset carrying exactly one scale plus optionally one translation after it, vectors matching axes length; an optional top-level multiscales transform applies after per-dataset ones [O-003, O-004, O-005, O-006, O-066].

#### [B-006] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Format obligations (0.5 authority: S003 + S053)

Basis: supported
Reason: Spec marks omero optional but requires channels with 6-hex color and window {min,max,start,end} when present, and documents rdefs/active/label display defaults.
Evidence: S003 lines 398-430

- P3. `omero` is optional transitional render metadata; when present, `channels` with 6-hex `color` and `window {min,max,start,end}` are required, plus `rdefs {defaultT, defaultZ, model}` and per-channel `active/label` as display defaults [O-008, O-067].

#### [B-007] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Format obligations (0.5 authority: S003 + S053)

Basis: supported
Reason: Spec places labels under a non-image "labels" group with metadata-free intermediates, 8 integer dtypes, SHOULD-listed labels array, equal level counts, and SHOULD image-label with colors/version plus optional properties and source.image default ../../.
Evidence: S003 lines 437-474

- P4. Labels live under a `labels` group (not an image), allow metadata-free intermediate groups, require integer dtype from a fixed 8-member set, SHOULD all be listed in the labels-group `labels` array, are themselves multiscales images with the same level count as the source, and SHOULD carry `image-label` with `colors` (label-value + optional rgba), `version`, optional `properties`, and `source.image` default `../../` [O-009, O-010].

#### [B-008] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Format obligations (0.5 authority: S003 + S053)

Basis: supported
Reason: Spec requires the plate/row/well/field hierarchy with strict plate keys (rows, columns, consistent wells, version) and well keys (unique alphanumeric path, acquisition when multi-acquisition); sparse plates list full extent with present wells only, confirmed by the real plate example.
Evidence: S003 lines 120-129, S003 lines 530-560, S003 lines 641-642, S003 lines 744-751, S056 lines 10-67

- P5. HCS layout is plate -> row groups -> well groups -> field images, with strict plate keys (rows, columns, wells with consistent path/rowIndex/columnIndex, version) and well keys (images with unique alphanumeric path, acquisition id when multi-acquisition) [O-011, O-012, O-013]. Sparse plates list full row/column extent but only present wells [O-023].

#### [B-009] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Format obligations (0.5 authority: S003 + S053)

Basis: supported
Reason: Spec sets bioformats2raw.layout 3 at top level with plate precedence, then OME series list, then numbered groups, and asks readers not to default to only the first image.
Evidence: S003 lines 193-206, S003 lines 256-275

- P6. `bioformats2raw.layout: 3` is transitional multi-image packaging; plate takes precedence when present, else OME `series` list, else numbered groups `0,1,2...`; readers SHOULD surface all images, not just the first [O-014].

#### [B-010] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Format obligations (0.5 authority: S003 + S053)

Basis: supported
Reason: Version history records the 0.5.0 move to Zarr v3 and the 0.5.1 omero-text and 0.5.2 dimension_names clarifications; the v3 zarr.json vs v2 flat-file contrast is documented.
Evidence: S003 lines 825-833, S058 lines 309-329

- P7. The 0.4->0.5 break is Zarr v2->v3 (`.zattrs/.zarray/.zgroup` vs `zarr.json`, flat vs `ome`-namespaced attrs); 0.5.1/0.5.2 clarified omero text and the `dimension_names` MUST [O-015, O-055-scope, O-060].

#### [B-012] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Reader implementations (observed behavior, not spec)

Basis: supported
Reason: PR404 added 0.5 read-only on zarr v3, PR413 (merged Aug 2025, released v0.12.0) made 0.5 writing default with mixed v04/v05 writes rejected, v0.16 added sharding, v0.19 added permissive-0.5/scene/plain-string-codec handling, so the May-2025 write-unsupported snapshot is stale.
Evidence: S008 lines 140-164, S013 lines 131-164, S052 lines 128, S052 lines 300, S052 lines 558, S016 lines 368-370

- P8. Reference Python reading moved in stages: 0.5 read-only on zarr v3 (PR404, Nov 2024), then 0.5 write-by-default with mixed v04/v05 writes rejected (PR413, v0.12.0), then sharding (v0.16), then permissive-0.5/scene/plain-string-codec handling (v0.19); the S016 FormatV05 snapshot (May 2025, write unsupported) is stale relative to releases [O-016, O-046, O-054, O-061].

#### [B-013] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Reader implementations (observed behavior, not spec)

Basis: supported
Reason: The reader unwraps v3 attrs under "ome", validates exactly-one-scale-first with at most one translation and ndim-matched numeric vectors, reads only multiscales[0], degrades omero silently on bad input, stitches wells/plates with zeros for missing tiles, and falls back to raw-array load or silent ignore.
Evidence: S019 lines 87-90, S016 lines 324-351, S018 lines 279-283, S018 lines 335-349, S018 lines 390-391, S018 lines 404-439, S018 lines 540-567, S018 lines 593-600

- P9. ome-zarr-py unwraps v3 attrs under `ome`, validates exactly-one-scale-first with <=1 translation and ndim-matched numeric vectors, reads only `multiscales[0]`, degrades omero/contrast silently on bad input, stitches wells/plates into lazy dask grids with zeros for missing tiles, and falls back to raw-array load or silent ignore [O-017, O-018, O-019, O-020, O-067, O-068].

#### [B-014] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Reader implementations (observed behavior, not spec)

Basis: supported
Reason: PR123 is merged (33 commits) dropping the ome-zarr dependency for direct zarr v3 (>=3.0.8 per the issue), and the reader dispatches Multiscales/Plate/Bioformats2raw/Labels/Scene, splits image channels, squeezes label channel axes, hides labels by default, walks up from arbitrary entries, and warns-and-skips unknown transforms beyond scale/translation/rotation/affine/sequence.
Evidence: S027 lines 126-178, S011 lines 163-165, S048 lines 81-133, S048 lines 204-213, S048 lines 341-365, S048 lines 652-654, S048 lines 672-716

- P10. napari-ome-zarr (post-PR123, direct zarr>=3.0.8, no ome-zarr dep) dispatches Multiscales/Plate/Bioformats2raw/Labels/Scene, splits image channels into layers while keeping label axes whole, squeezes label channel axes, hides labels by default, resolves arbitrary entry points by walking up, and tolerates rotation/affine/sequence transforms with warn-and-skip [O-026, O-027, O-049, O-062, O-063, O-064].

#### [B-015] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Reader implementations (observed behavior, not spec)

Basis: supported
Reason: The OME-Zarr load-dialog claims check out, but the <=4 concurrent channels, time slider, and 16-bit/first-sample/GB limits come from older TIFF/CZI-era desktop docs, not the OME-Zarr loading docs.
Evidence: S072 lines 1-3, S096 lines 8-10, S096 lines 25-28, S098 lines 202-223, S098 line 256, S108 lines 4-29, S117 lines 101-128

Active (verified replacement; the draft text is superseded history):

- P11 (corrected). AGAVE is a desktop GPU volume explorer (Qt + tensorstore v0.1.78 backend) that reads local OME-Zarr 0.4 and 0.5 (S072 lines 1-3; S096 lines 8-10). Its OME-Zarr Load Settings dialog offers explicit resolution-level choice (highest default, OOM risk), channel exclusion (reload to recover), X/Y/Z sub-region selection, appearance-settings reuse, and a GPU-memory estimate (S117 lines 101-128). Its FileReaderZarr branches metadata lookup on zarr version (v3 under attributes.ome, erroring when absent; v2 flat) and uses driver zarr3 vs zarr (S098 lines 202-223), but hard-codes dimorder T,C,Z,Y,X (S098 line 256), a correctness risk for 2D/3D/4D or custom-axis 0.5 data. Its VolumeDimensions dtype switch handles int32/uint16/uint8/float32 (S096 lines 25-28); behavior outside those four is unattested. Conditions: AGAVE at the captured commits; OME-Zarr load path only. The <=4 concurrent channels, time slider, 16-bit-only, first-time-sample-only, and few-GB-GPU limits appear only in older TIFF/CZI-era desktop docs (S108 lines 4-29) and MUST NOT be cited as OME-Zarr behavior. Plan fit: supports F7 explicit-bounding precedent and F9 dtype-matrix precedent only. Consequence: Slide Scout may borrow the pre-load bounding dialog and version-branched lookup but must not assume fixed dimorder or the older-docs channel/time limits. Validation idea: load a 2D custom-axis 0.5 fileset in AGAVE and check axis interpretation against the spec.

#### [B-016] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Reader implementations (observed behavior, not spec)

Basis: supported
Reason: The converter documents v3/0.5 codecs (null, blosc, gzip, zstd; no zlib) with full option ranges, 0.4+0.5 writing, TCZYX default order with deprecated dimension-order override, ~256px smallest level with factor-2 steps, and hierarchy/marker options that can break spec compatibility.
Evidence: S033 lines 107-118, S033 lines 157-200, S033 lines 219-226, S033 lines 228-325, S033 lines 333-337

- P12. Bioformats2raw writes 0.4 and 0.5 with a v3/0.5 codec table (null, blosc, gzip, zstd; no zlib), TCZYX default order, ~256px smallest level with factor-2 steps by default, and options that can produce non-spec hierarchies or drop OME/root markers [O-037, O-038, O-039, O-055, O-056].

#### [B-017] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Reader implementations (observed behavior, not spec)

Basis: supported
Reason: Each cited real-data fact matches its file: czyx scales with micrometer space units, sharded blosc/zstd uint16 array with dimension_names, sparse 6x11 plate with ~50 wells and field_count 32, v2->v3 conversions with RO-Crate sidecars, and sizes from 589 MB to 1 TB.
Evidence: S054 lines 10-74, S055 lines 16-74, S056 lines 10-67, S034 lines 43-46, S034 lines 67-83

- P13. Real 0.5 filesets observed: IDR czyx image with physical per-level scales and micrometer space units [O-021]; sharded blosc/zstd uint16 array with `dimension_names` [O-022]; sparse 6x11 plate with ~50 wells and field_count 32 [O-023]; challenge conversions with heterogeneous sharding plus top-level RO-Crate sidecars [O-024]; sizes from 589 MB to 1 TB [O-025].

#### [B-019] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Compatibility failures and contradictions (must-handle)

Basis: supported
Reason: Four of five failure items check out, but the S044 auto-sharding crash is a write-path (write_image) bug, not a rendering/decoding failure on valid-looking 0.5 data.
Evidence: S014 lines 139-143, S038 lines 58, S011 lines 151-157, S013 lines 182-186, S044 lines 139-182

Active (verified replacement; the draft text is superseded history):

- P14 (corrected). Decoding/rendering failures on valid-looking 0.5 data are attested: vizarr repetitive-chunk rendering of resave-converted 0.5 data while the 0.4 original rendered correctly (S014 lines 139-143); neuroglancer "no multiscale metadata found" plus silent no-chunks on a sharded v3 array (S038 line 58); the napari zarr<3 pin vs bioio zarr>=3 dependency conflict breaking the napari plugin (S011 lines 151-157); and rejection of the v2 `compressor` kwarg on zarr_format 3 writes (S013 lines 182-186). Separately, a write-path robustness bug (not a rendering failure): ome-zarr-py write_image crashes on shards="auto" via dask rechunk/parse_bytes (S044 lines 139-182, issue #640, Aug 2026). Conditions: versions and dates as captured. Plan fit: the first four support the F8 failure taxonomy and F9 decode-matrix rows; the S044 item is out of Slide Scout's read-only scope except as evidence that auto-sharded filesets may carry unusual shard shapes. Consequence: the viewer must explain decode/render failures per node and must never fail silently with no chunks; writer bugs need no viewer handling. Validation idea: open the resave-converted fixture and a sharded v3 array and check for correct pixels or a named error, never silent gaps.

#### [B-020] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Compatibility failures and contradictions (must-handle)

Basis: supported
Reason: The survey counts check out (dataset scale 7/11, translation only napari with vizarr image-disappears and WEBKNOSSOS fails-to-open, top-level scale 4/11, Z-downsample and non-2-factor break vizarr/avivator) plus the default-napari scale-ignoring report.
Evidence: S043 lines 2-13, S043 lines 80-89, S043 lines 318-350, S043 lines 362-392, S043 lines 394-428, S011 lines 158-159

- P15. Calibration is unevenly implemented across viewers: dataset scale read by 7/11 surveyed, translation applied only by napari (vizarr image-disappears, WEBKNOSSOS fails to open), top-level scale read by 4/11, Z-downsampled and non-2-factor pyramids break vizarr/avivator, and the default napari reader ignores transforms producing wrong anisotropy [O-029, O-030, O-033, O-034, O-035, O-044].

#### [B-021] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Compatibility failures and contradictions (must-handle)

Basis: supported
Reason: The core ambiguities check out, but "all supported:no" overstates the multi-multiscales row: OMERO has no supported field and reports all images imported with a corrupted sample, which is neither clean support nor clean failure.
Evidence: S043 lines 277-316, S027 lines 269-270, S048 lines 341-365, S003 lines 264-270, S004 lines 149-157, S003 lines 441-450

Active (verified replacement; the draft text is superseded history):

- P16 (corrected). Discovery ambiguities are real: for multiple multiscales, ten surveyed viewers report supported:no (opening the first only) and three fail to open the sample (BDV/MoBIE ArrayIndexOutOfBounds, WEBKNOSSOS non-unique mags), while OMERO reports all images imported but a corrupted sample (S043 lines 277-316), so "none opens beyond multiscales[0]" holds except for one ambiguous OMERO row; labels listings can be missing while label groups exist and the pre-0.5 spec under-defined labels objects (S027 lines 269-270); bioformats2raw discovery has competing rules (spec series/numbered-groups per S003 lines 264-270 vs napari OME-XML Image-ID parse per S048 lines 341-365); and PR206's labels-registration-move proposal (S004 lines 149-157) contradicts the released spec's labels-list-in-labels-group rule (S003 lines 441-450). Conditions: survey captures and code versions as captured. Plan fit: supports F1 (first-multiscales default with choice, listing UNION probing, bioformats2raw precedence) and F8 taxonomy rows. Consequence: Slide Scout must union listing with probing, implement a defined bioformats2raw precedence, and handle multi-multiscales groups without crashing. Validation idea: open the multi-multiscales sample and a labels-unlisted group and check choice offered / labels found without crash.

#### [B-022] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Compatibility failures and contradictions (must-handle)

Basis: supported
Reason: Vizarr's overview-plus-drill-down and both failure modes check out, but "exactly one proven low-risk pattern" ignores MoBIE, which the survey also marks as supporting plates with no disclosed pattern or crash note.
Evidence: S043 lines 207-238, S018 lines 425-439, S018 lines 540-558

Active (verified replacement; the draft text is superseded history):

- P17 (corrected). HCS at scale has one fully described low-risk pattern in the corpus: vizarr shows only the lowest-resolution plate overview and loads a clicked well in a new window (S043 lines 213-215); MoBIE also reports plate support with no stated pattern (S043 lines 223-224), so vizarr's is the only pattern whose mechanics are attested, not the only working implementation. Full-resolution stitched canvases are risky: napari loads the plate but crashes on zoom (S043 lines 218-220), and ome-zarr-py stitches wells/plates into lazy grids substituting zeros for missing/failed tiles (S018 lines 425-439, S018 lines 540-558), hiding missing data as black tiles. Conditions: survey and code captures as captured. Plan fit: informs product choice P-C1 (navigation model) and bounds F7 for TB-scale plates. Consequence: Slide Scout should default to overview-plus-drill-down or per-well/per-field navigation and must not silently zero-fill missing wells. Validation idea: open the sparse-plate fixture and check overview render, drill-down to one well/field, and explicit marking of absent wells.

#### [B-024] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Opportunities and simpler alternatives

Basis: supported
Reason: The finder command, local traversal, CSV served to BioFile Finder with Folder-tree browsing, thumbnails and copy-URL, and the v2-only (.zattrs, v3 deferred) limitation are all stated; the changelog confirms it shipped in 0.11.0.
Evidence: S023 lines 150-154, S017 lines 6-8

- P18. Directory traversal + served browsing (`ome_zarr finder` + BioFile Finder CSV with Folder tree, thumbnails, copy-URL) is a shipped simpler alternative to deep indexing; its 0.5 gap is precisely the zarr.json traversal the Apr-2025 version deferred [O-045].

#### [B-025] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Opportunities and simpler alternatives

Basis: supported
Reason: The validator is a web page for validating OME-NGFF files, the challenge routinely links per-fileset validator URLs as acceptance evidence, and IDR/challenge sample catalogs exist.
Evidence: S031 lines 1-6, S034 lines 67-85, S010 lines 1-8

- P19. The validator URL pattern plus IDR/challenge sample catalogs give a ready acceptance oracle: every representative fileset should first open in ome-ngff-validator [O-059, O-025, O-013-context S034/S010].

#### [B-026] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 1. Supported propositions > ### Opportunities and simpler alternatives

Basis: supported
Reason: Three of four precedents check out as published guidance, but AGAVE's "dtype matrix" is a four-case source-code switch (int32/uint16/uint8/float32), not a published support matrix, and out-of-switch behavior is unattested.
Evidence: S025 lines 81-86, S096 lines 25-28, S117 lines 101-128, S058 lines 385-389

Active (verified replacement; the draft text is superseded history):

- P20 (corrected). Bounded precedents exist for hard choices: Vizarr/Viv publishes an explicit supported-dtype list (int8/16/32, uint8/16/32, float32/64; S025 lines 81-86); AGAVE's dtype handling is visible only as a four-case code switch (int32/uint16/uint8/float32; S096 lines 25-28), which bounds what is handled but is not a published matrix and leaves other dtypes' behavior unattested; AGAVE publishes an explicit memory-bounding load dialog with estimate (S117 lines 101-128); WEBKNOSSOS publishes chunk/shard tuning guidance (32-128 voxels^3, sharding, 3D downsampling; S058 lines 385-389). Conditions: captures as captured. Plan fit: informs F9 (publish an explicit codecs x dtypes x layouts matrix) and F7 (bounding rule). Consequence: Slide Scout must publish its own matrix rather than inferring AGAVE's switch as a promise. Validation idea: open one fileset per claimed dtype cell and record render vs named-explain outcomes.

#### [B-029] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F1. "opens a local OME-Zarr 0.5 fileset and lists the images it finds" (Plan L5)

Basis: supported
Reason: Plan L5 names only opening and listing images, while the corpus requires version branching, plate/well/series traversal, labels probing, and multi-multiscales handling, so "correction" is the right disposition.
Evidence: plan/Viewer.md line 5, S003 lines 120-129, S003 lines 150-156, S003 lines 261-275

- Disposition: correction.

#### [B-030] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F1. "opens a local OME-Zarr 0.5 fileset and lists the images it finds" (Plan L5)

Basis: supported
Reason: The discovery rules check out except that mixed v04/v05 rejection is attested only on the write path; the read path detects versions and warns on mismatch, which changes the discovery-error wording.
Evidence: S003 lines 150-156, S003 lines 261-275, S003 lines 388-397, S058 lines 309-329, S013 lines 150-164, S019 lines 58-66, S048 lines 672-689, S027 lines 269-270

Active (verified replacement; the draft text is superseded history):

- F1 constraint (corrected): discovery must branch on store markers (0.5 zarr.json + attributes.ome.version "0.5" per S003 lines 150-156 vs 0.4 .zattrs/.zgroup markers per S058 lines 309-329), treat version inconsistency within a hierarchy as invalid-or-uncertain per the MUST-consistency rule (S003 line 156), then follow plate->well->field lists (S003 lines 120-129, 530-560, 744-751), bioformats2raw.layout precedence (plate, else OME series, else numbered groups; S003 lines 261-275), labels-listing UNION directory probing (listing per S003 lines 441-450 plus probing for unlisted groups per S027 lines 269-270), first-multiscales default with user choice by name (S003 lines 388-397), and arbitrary entry-point walk-up (S048 lines 672-689). Mixed v04-group-with-v05-format rejection is attested only for writes (S013 lines 157-164); on the read path the reference code detects the format and logs a version-mismatch warning (S019 lines 58-66), so discovery errors must say "version mismatch / inconsistent hierarchy," not "mixed-format exception." Conditions: local 0.5 filesets. Plan fit: correction to Plan L5 ("opens ... and lists the images"). Consequence: hierarchy-aware navigation (fileset > plate/well/field or series > image > labels) with version-aware errors. Validation idea: open five fixtures (plain image; sparse plate; multi-series bioformats2raw; labels-unlisted group; 0.4 fileset) and check the listed tree plus the 0.4 message against validator results.

#### [B-031] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F1. "opens a local OME-Zarr 0.5 fileset and lists the images it finds" (Plan L5)

Basis: supported
Reason: The plate/row/well/field hierarchy and multi-image bioformats2raw collections in the spec make a flat list insufficient, so hierarchy-aware navigation with version-aware errors follows.
Evidence: S003 lines 120-129, S003 lines 261-275, S056 lines 10-67

- Consequence: a flat image list is wrong for plates/collections; the finder must present hierarchy-aware navigation (fileset > plate/well/field or series > image > labels) and version-aware errors.

#### [B-034] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F2. "canvas with pan and zoom" + "chooses an available pyramid level appropriate for the current view" (Plan L5)

Basis: supported
Reason: Plan L5 assumes pyramid choice without stating ordering, scale sourcing, Z varies-per-level, or codec/shard decoding, all of which the corpus constrains, so "correction" is right.
Evidence: plan/Viewer.md line 5, S003 lines 304-312, S043 lines 2-13, S055 lines 16-58

- Disposition: correction.

#### [B-035] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F2. "canvas with pan and zoom" + "chooses an available pyramid level appropriate for the current view" (Plan L5)

Basis: supported
Reason: Level order comes from datasets[] order, pixel size from per-level scale vectors, Z may downsample per level, and arrays may be sharded with blosc/gzip/zstd-family codecs in 3D or 2D chunking.
Evidence: S003 lines 304-312, S043 lines 2-13, S043 lines 80-89, S054 lines 31-74, S055 lines 16-58, S033 lines 157-162, S034 lines 99-105, S034 line 136

- Constraint: level order is datasets[] order (never numeric sort); per-level pixel size comes from that level's scale (never assumed factor 2); z-size may differ per level; arrays may be sharded with blosc/gzip/zstd codecs and 3D or 2D chunks [O-005, O-006, O-021, O-022, O-024, O-029, O-030, O-037, O-041, O-056].

#### [B-036] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F2. "canvas with pan and zoom" + "chooses an available pyramid level appropriate for the current view" (Plan L5)

Basis: supported
Reason: Scale-aware selection, per-level plane counts, and a v3 shard/codec stack follow directly from the cited pyramid variability; uniform-2x y/x-only assumptions break the attested Z-downsampled and non-2-factor cases.
Evidence: S043 lines 2-13, S043 lines 80-89, S055 lines 16-58

- Consequence: the renderer needs scale-aware level selection, per-level plane counts, and a v3 codec/shard decode stack; assuming uniform 2x y/x-only pyramids breaks real data.

#### [B-039] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F3. "channel visibility controls" (Plan L5)

Basis: supported
Reason: Plan L5 already specifies visibility controls (covered) while saying nothing about omero-derived defaults, so "covered, with correction on defaults" is the right disposition.
Evidence: plan/Viewer.md line 5, S003 lines 398-430

- Disposition: covered, with correction on defaults.

#### [B-040] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F3. "channel visibility controls" (Plan L5)

Basis: supported
Reason: Omero supplies color/active/label/window defaults with greyscale-model whitening in both readers, the reference disables all contrast limits when any window start/end is missing, and split-layer vs blended-composite rendering is genuinely open across implementations.
Evidence: S003 lines 398-430, S018 lines 356-383, S048 lines 293-336, S048 lines 204-213, S025 lines 81-82

- Constraint: visibility/label/color/window defaults come from omero channels when present (color hex, active, label, window start/end; greyscale model whitens; missing windows must not silently reset all channels); absent omero needs deterministic fallbacks; split-layer vs composite rendering is open [O-008, O-026, O-051, O-052, O-067].

#### [B-041] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F3. "channel visibility controls" (Plan L5)

Basis: supported
Reason: Working without omero but matching it when present follows from omero's optionality, and per-channel degradation with notice is the stated improvement over the reference's wipe-all-contrast behavior.
Evidence: S003 line 426, S018 lines 379-383

- Consequence: controls work without omero but match omero when present; a single bad channel must degrade per-channel with notice, not wipe all contrast.

#### [B-044] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F4. "time-point and plane selection where relevant" (Plan L5)

Basis: supported
Reason: Plan L5's fixed-sounding selectors need axes-driven presence, per-level plane counts, and rdefs defaults from the corpus, so "correction" is right.
Evidence: plan/Viewer.md line 5, S003 lines 299-303, S003 lines 419-423, S043 lines 2-13

- Disposition: correction.

#### [B-045] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F4. "time-point and plane selection where relevant" (Plan L5)

Basis: supported
Reason: Axes order and dimensionality drive which selectors apply, Z-downsampling varies plane counts per level, and rdefs defaultT/defaultZ give initial positions; fixed 5D assumptions are contradicted by the spec and AGAVE's risky fixed dimorder.
Evidence: S003 lines 296-303, S003 lines 419-423, S043 lines 2-13, S098 line 256, S033 lines 333-337

- Constraint: which selectors appear is driven by axes (2-5D, time/channel/space/custom order), not by fixed 5D tczyx; plane counts vary per pyramid level when Z is downsampled; rdefs defaultT/defaultZ give initial positions when present [O-003, O-008, O-029, O-053, O-055].

#### [B-046] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F4. "time-point and plane selection where relevant" (Plan L5)

Basis: supported
Reason: Showing only applicable selectors and remapping plane indices per level follows from variable dimensionality/axes and per-level Z shapes.
Evidence: S003 lines 296-307, S043 lines 2-13

- Consequence: 2D/3D/4D and custom-axis images show only applicable selectors; switching pyramid level must remap plane indices through that level's shape.

#### [B-049] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F5. "optional overlays for associated label images" (Plan L5)

Basis: supported
Reason: Plan L5 names optional overlays without discovery, alignment, colors, defaults, or plate-label rules, all constrained by the corpus, so "correction" is right.
Evidence: plan/Viewer.md line 5, S003 lines 437-460, S048 lines 652-716

- Disposition: correction.

#### [B-050] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F5. "optional overlays for associated label images" (Plan L5)

Basis: supported
Reason: All overlay rules check out except plate-label derivation: napari derives plate labels from the first well's first field only, not per wells/fields.
Evidence: S003 lines 437-474, S048 lines 204-213, S048 lines 513-555, S048 lines 652-716, S043 lines 473-507

Active (verified replacement; the draft text is superseded history):

- F5 constraint (corrected): discover labels by labels-listing UNION directory probing (S003 lines 441-450; S027 lines 269-270); require integer dtype from the 8-member set and the same level count as the source image (S003 lines 437-455); align overlay level-to-level with the source using each side's transforms; default hidden with explicit toggle (S048 lines 652-654; S018 lines 316-318); colors from image-label colors, inventing a colormap only when absent (S003 lines 456-466); remove the channel axis for the overlay layer with per-level squeeze (S048 lines 707-716); and for plates note the attested implementation derives PlateLabels metadata from the first well's first field only (S048 lines 543-555) and enumerates labels paths from that field's labels listing (S048 lines 513-527), so per-well/per-field label derivation is an unsolved design point, not an attested behavior. Overlay stays label-specific, not general multi-image fusion (only 3/11 surveyed viewers support overlays; S043 lines 473-507). Conditions: local 0.5 images and plates. Plan fit: correction to Plan L5 ("optional overlays"). Consequence: a label-specific aligned layer with explicit notices for misaligned levels or missing colors, and an explicit product decision on plate-label sourcing. Validation idea: overlay a labeled image at two pyramid levels and screenshot-diff boundaries against the source; repeat with missing colors and with a plate labels fixture, checking which well's labels appear.

#### [B-051] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F5. "optional overlays for associated label images" (Plan L5)

Basis: supported
Reason: Label-specific scope follows from the survey (3/11 multi-image support) and the labels spec, and explicit notices follow from the known silent-offset/invisible-label failure modes.
Evidence: S043 lines 473-507, S003 lines 454-466, S048 lines 652-660

- Consequence: overlay is a label-specific aligned layer (not general multi-image fusion); misaligned levels or missing colors must produce explicit notices, not silent offsets or invisible labels.

#### [B-054] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F6. "details panel shows dimensions, units and coordinates" (Plan L5)

Basis: supported
Reason: Plan L5 names dimensions/units/coordinates without the dataset+top-level transform combination, axes order, UDUNITS units, dimension_names match, or translation handling the corpus requires, so "correction" is right.
Evidence: plan/Viewer.md line 5, S003 lines 166-174, S003 lines 308-316

- Disposition: correction.

#### [B-055] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F6. "details panel shows dimensions, units and coordinates" (Plan L5)

Basis: supported
Reason: Coordinates combine per-dataset with top-level transforms in axes order with UDUNITS space/time units, dimension_names must match axes, translations must at least not break rendering, and inconsistent units need a display rule per the napari precedent.
Evidence: S003 lines 166-174, S003 lines 308-316, S043 lines 318-350, S043 lines 362-392, S043 lines 394-428, S048 lines 249-258, S054 lines 10-40, S011 lines 158-159

- Constraint: coordinates combine per-dataset scale/translation with top-level multiscales transforms, in axes order with UDUNITS units (space/time lists; channel usually unitless); dimension_names must match axes names; translations must at minimum not break rendering; inconsistent/missing units need a stated display rule [O-003, O-004, O-005, O-021, O-033, O-034, O-035, O-044].

#### [B-056] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F6. "details panel shows dimensions, units and coordinates" (Plan L5)

Basis: supported
Reason: Per-axis pixel size, units, and calibrated cursor positions from the active level's combined transform follow from the spec rules, and ignoring top-level transforms or translations repeats attested viewer bugs.
Evidence: S003 lines 308-316, S043 lines 362-365, S043 lines 394-428

- Consequence: the panel shows per-axis pixel size, units, and calibrated cursor coordinates computed from the active level's combined transform; ignoring top-level transforms or translations repeats known viewer bugs.

#### [B-059] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F7. "Large image reads run in the background so navigation remains responsive. Changing the selected view cancels work that is no longer needed." (Plan L7)

Basis: supported
Reason: Plan L7 already specifies background reads with cancel (covered) while the corpus adds the memory-bounding strategy question the Plan does not settle, so "covered, with product_choice on bounding strategy" is right.
Evidence: plan/Viewer.md line 7, S117 lines 101-128, S034 lines 67-83

- Disposition: covered, with product_choice on bounding strategy.

#### [B-060] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F7. "Large image reads run in the background so navigation remains responsive. Changing the selected view cancels work that is no longer needed." (Plan L7)

Basis: supported
Reason: The corpus attests the explicit pre-load dialog and the TB-scale need, but automatic background/cancel is Plan-specified, not corpus-proven; no corpus source demonstrates background loading with cancellation.
Evidence: plan/Viewer.md line 7, S117 lines 101-128, S034 lines 67-83, S061 lines 39, S043 lines 207-238, S018 lines 404-439

Active (verified replacement; the draft text is superseded history):

- F7 constraint (corrected): the Plan specifies automatic background reads with cancellation of stale work (Plan L7); the corpus proves the complementary explicit strategy, an AGAVE-style pre-load dialog with resolution/channel/sub-region choice and memory estimate (S117 lines 101-128), and proves the need, since TB-scale plates and 21-66 GB images (S034 lines 67-83) make unbounded eager loads infeasible, remote reads without pyramid discipline are unusably slow (S061 line 39), and full-resolution stitched canvases crash or zero-fill (S043 lines 218-220; S018 lines 425-439). No corpus source demonstrates background loading with cancellation in an implementation; that half of the constraint rests on the Plan alone. Conditions: local datasets up to TB-scale plates. Plan fit: covered (Plan L7 behavior kept) with product_choice on the bounding strategy (automatic vs explicit vs hybrid low-res-first). Consequence: keep Plan background/cancel and add a bounding rule so the large-dataset acceptance case cannot OOM or freeze. Validation idea: open the largest acceptance fileset under profiling during pan/zoom/channel flips and check interaction latency, peak memory, and observable dropping of stale requests.

#### [B-061] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F7. "Large image reads run in the background so navigation remains responsive. Changing the selected view cancels work that is no longer needed." (Plan L7)

Basis: supported
Reason: Keeping specified background/cancel and adding a bounding rule is the direct consequence of the Plan text plus the attested scale hazards.
Evidence: plan/Viewer.md line 7, S034 lines 67-83, S117 lines 101-109

- Consequence: keep Plan's background/cancel behavior and add a bounding rule (auto low-res-first and/or explicit choice with estimate) so the large-dataset acceptance case cannot OOM.

#### [B-064] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F8. "Opening failures explain which image or data could not be displayed and allow the user to choose another item." (Plan L7)

Basis: supported
Reason: Plan L7 requires explanatory failures without enumerating any failure modes, while the corpus attests a full taxonomy, so "correction" is right.
Evidence: plan/Viewer.md line 7, S038 line 58, S053 lines 22-25, S016 lines 324-330

- Disposition: correction.

#### [B-065] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F8. "Opening failures explain which image or data could not be displayed and allow the user to choose another item." (Plan L7)

Basis: supported
Reason: The taxonomy rows check out except mixed v04/v05, which is attested only for writes; the read-path counterpart is format detection with a version-mismatch warning.
Evidence: S003 lines 150-156, S058 lines 309-329, S053 lines 22-25, S053 lines 196-217, S003 line 174, S025 lines 81-86, S038 line 58, S016 lines 324-351, S018 lines 425-439, S027 lines 269-270, S048 lines 698-699, S018 lines 598-600, S013 lines 157-164, S019 lines 58-66, S014 lines 139-143

Active (verified replacement; the draft text is superseded history):

- F8 constraint (corrected): attested failure taxonomy: 0.4 fileset in 0.5 scope (S058 lines 309-329); version missing/inconsistent within a hierarchy (S003 lines 150-156); absent multiscales/plate/well keys ("no metadata found," S038 line 58); schema violations of counts, required keys, and vector lengths (S053 lines 22-25, 126-150, 196-265); dimension_names mismatch (S003 line 174); unsupported codec/shard incl. silent no-chunks (S038 line 58); unsupported dtype outside the declared matrix (S025 lines 81-86; S096 lines 25-28); transform violations of exactly-one-scale-first and vector lengths (S016 lines 324-351; S003 lines 308-312); missing wells/fields zero-filled by the reference (S018 lines 425-439, 540-558); unlisted-vs-unreadable labels (S027 lines 269-270); non-multiscale entry with no matching spec (S048 lines 698-699; S018 lines 598-600); and corrupt chunk rendering (S014 lines 139-143). Mixed v04-group-with-v05-format rejection is attested only for writes (S013 lines 157-164); the read-path row must read "detected/requested version mismatch" per the detection-and-warning behavior (S019 lines 58-66). Conditions: local 0.5 scope. Plan fit: correction to Plan L7 (failure explanation). Consequence: errors name node, violated rule, and recovery action; silent ignore and silent no-chunks are known bad behaviors. Validation idea: feed one malformed fixture per row and check each message names node + rule + next action with the browser still usable.

#### [B-066] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F8. "Opening failures explain which image or data could not be displayed and allow the user to choose another item." (Plan L7)

Basis: supported
Reason: Naming node, rule, and recovery follows from the Plan's explanation requirement, and silent ignore / silent no-chunks are attested bad behaviors in both readers.
Evidence: plan/Viewer.md line 7, S018 lines 593-600, S038 line 58

- Consequence: errors must name the failing node, the violated rule, and the recovery action (pick another item/level); silent ignores and silent no-chunks states are known bad behaviors.

#### [B-069] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F9. "should interoperate with filesets from real OME-Zarr 0.5 tools" (Plan L9)

Basis: supported
Reason: Plan L9 requires interop without defining any decode matrix, while the corpus supplies codecs, dtypes, drift, and converter quirks, so "correction" is right.
Evidence: plan/Viewer.md line 9, S055 lines 16-58, S033 lines 157-162, S052 line 128

- Disposition: correction.

#### [B-070] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F9. "should interoperate with filesets from real OME-Zarr 0.5 tools" (Plan L9)

Basis: supported
Reason: Interop spans sharding_indexed with blosc/gzip/zstd/null codecs and full option ranges, arbitrary chunk grids, declared dtype coverage against spec-vs-renderer gaps, 2024-2026 behavior drift, and converter hierarchy/marker quirks.
Evidence: S055 lines 16-58, S033 lines 157-200, S003 lines 68-72, S025 lines 81-86, S096 lines 25-28, S003 lines 437-439, S052 line 128, S052 line 300, S033 lines 228-325, S034 lines 43-46, S013 lines 182-186

- Constraint: interop means the observed decode matrices: sharding_indexed + blosc (cname/clevel/shuffle variants)/gzip/zstd/null codecs, arbitrary chunk grids, uint/int/float dtype coverage declared (spec labels need all 8 int types; renderers bound support), 2024-2026 behavior drift (permissive-0.5, plain-string codec attrs), and converter quirks (custom hierarchies, dropped OME/root markers) [O-022, O-024, O-028, O-037, O-039, O-041, O-047, O-051, O-054, O-056].

#### [B-071] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F9. "should interoperate with filesets from real OME-Zarr 0.5 tools" (Plan L9)

Basis: supported
Reason: Publishing and testing an explicit matrix with loud out-of-matrix failures follows from the attested renderer bounds and silent-failure precedents.
Evidence: S025 lines 81-86, S038 line 58, S055 lines 16-58

- Consequence: publish an explicit supported/unsupported matrix (codecs x dtypes x layouts) and test it; anything outside fails loudly with the matrix row cited.

#### [B-074] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F10. "Source files remain unchanged; display settings are local to the viewing session." (Plan L9)

Basis: supported
Reason: Brief, Plan, and the resave no-modification guarantee agree on read-only behavior with nothing to correct, so "covered" is right.
Evidence: plan/Viewer.md line 9, brief.md lines 3-5, S034 lines 154-156

- Disposition: covered.

#### [B-075] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F10. "Source files remain unchanged; display settings are local to the viewing session." (Plan L9)

Basis: supported
Reason: Local read-only opening with session-scoped settings matches brief and Plan, and the challenge resave flow explicitly guarantees input is not modified.
Evidence: brief.md lines 3-5, plan/Viewer.md line 9, S034 lines 154-156, S031 lines 1-6

- Constraint: local read-only opening; no sidecar writes into the fileset; challenge resave and validator flows confirm input-must-not-be-modified expectations [O-024, O-059-context].

#### [B-076] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F10. "Source files remain unchanged; display settings are local to the viewing session." (Plan L9)

Basis: supported
Reason: Enforcing read-only handles and session settings with no fileset writes follows directly, and the absolute-path settings trap is documented in the AGAVE docs.
Evidence: S034 lines 154-156, S108 line 27

- Consequence: no action beyond enforcing read-only file handles and session-scoped settings (avoid absolute-path settings portability trap [O-058]).

#### [B-079] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F11. "Image editing, export, remote storage and automated scientific or clinical interpretation are outside this plan." (Plan L9)

Basis: supported
Reason: Brief and Plan both exclude these areas with nothing to correct, so "covered" is right.
Evidence: plan/Viewer.md line 9, brief.md lines 3-5

- Disposition: covered.

#### [B-080] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F11. "Image editing, export, remote storage and automated scientific or clinical interpretation are outside this plan." (Plan L9)

Basis: supported
Reason: Both scope documents exclude editing/export/remote/interpretation, and the remote-read performance case stays out of scope even where reading code overlaps.
Evidence: brief.md lines 3-5, plan/Viewer.md line 9, S061 lines 39

- Constraint: brief + Plan both exclude these; remote-read performance issues (QuPath) and pathology interpretation stay out of scope even where reading code overlaps [O-057].

#### [B-081] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F11. "Image editing, export, remote storage and automated scientific or clinical interpretation are outside this plan." (Plan L9)

Basis: supported
Reason: Refusing remote URLs and interpretation with a scope message while leaving local browsing intact is the direct consequence of the exclusions.
Evidence: brief.md lines 3-5, plan/Viewer.md line 9

- Consequence: decline remote URLs and interpretation requests with a scope message; do not partially implement them.

#### [B-084] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F12. "Acceptance uses representative filesets..." (Plan L11)

Basis: supported
Reason: Plan L11 says "representative filesets" without defining coverage, while the corpus demands a fixture matrix spanning layouts, transforms, codecs, and negatives, so "correction" is right.
Evidence: plan/Viewer.md line 11, S034 lines 67-83, S031 lines 1-6

- Disposition: correction.

#### [B-085] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F12. "Acceptance uses representative filesets..." (Plan L11)

Basis: supported
Reason: Each matrix axis (dimensionality, sparse plates, bioformats2raw, labels variants, Z/non-2 pyramids, translations, top-level transforms, multi-multiscales, sharding/codecs, 0.4 negative, malformed battery, validator pre-check, sized large case) is grounded in the cited corpus rows.
Evidence: S003 lines 296-316, S056 lines 10-67, S003 lines 261-275, S003 lines 437-466, S043 lines 2-13, S043 lines 80-89, S043 lines 362-392, S043 lines 394-428, S043 lines 277-316, S055 lines 16-58, S058 lines 309-329, S031 lines 1-6, S034 lines 67-83

- Constraint: representative must span: plain image (2D..5D), sparse plate, bioformats2raw collection, labels (listed + unlisted + plate labels + missing colors), Z-downsampled + non-2 pyramids, translations present, top-level transforms present, multi-multiscales group, sharded + each claimed codec, 0.4 negative, malformed battery; each pre-checked in the validator; large case sized in GB/pixels/chunks [O-025, O-059, O-008-context samples].

#### [B-086] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### F12. "Acceptance uses representative filesets..." (Plan L11)

Basis: supported
Reason: A fixture matrix with per-cell oracles follows from the breadth of attested variability; no single happy-path fileset can cover it.
Evidence: S034 lines 67-83, S031 lines 1-6, S043 lines 2-13

- Consequence: acceptance is a fixture matrix with per-cell oracle (validator + known-good view), not a single happy-path fileset.

#### [B-089] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Optional capabilities (not required by brief/Plan; adopt only with review)

Basis: supported
Reason: RO-Crate top-level metadata (organism/modality recommended, name/description suggested) is documented for challenge conversions, making it a genuinely optional display enrichment.
Evidence: S034 lines 43-46, S034 lines 190-205

- O-C1. RO-Crate top-level metadata display (specimen/modality/name/description) [O-024]. Consequence: richer details panel for challenge data; validation: show RO-Crate fields for a challenge fileset vs absent-file fallback.

#### [B-090] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Optional capabilities (not required by brief/Plan; adopt only with review)

Basis: supported
Reason: The reference reader loads a present-but-unspecified zarr array as raw data and otherwise yields nothing, grounding a raw-fallback-with-notice option.
Evidence: S018 lines 593-600

- O-C2. Raw-array fallback view for decodable-but-non-NGFF zarr with explicit notice [O-068]. Validation: open a bare v3 array and check pixels-plus-notice vs silent ignore.

#### [B-091] QUALIFIED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Optional capabilities (not required by brief/Plan; adopt only with review)

Basis: supported
Reason: The spec's user-choice rule and the survey's near-total non-support check out, but "zero surveyed viewers" inherits the P16 OMERO ambiguity (all images imported, corrupted sample, no supported field).
Evidence: S003 lines 388-397, S043 lines 277-316

Active (verified replacement; the draft text is superseded history):

- O-C3 (corrected). Multi-multiscales choice UI implementing the spec's user-choice-by-name rule with first-as-fallback (S003 lines 388-397). Ten surveyed viewers report supported:no and three fail to open the sample, while OMERO ambiguously reports all images imported with a corrupted sample (S043 lines 277-316), so support is at best one ambiguous case out of eleven. Conditions: image groups with >1 multiscale entry. Plan fit: optional capability, adopt only with review; extends F1's first-default rule. Consequence: offer the choice without crashing where the reference readers silently use multiscales[0] (S018 lines 279-283; S048 lines 201, 237). Validation: open the multi-multiscales sample without crashing and offer the choice.

#### [B-092] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Optional capabilities (not required by brief/Plan; adopt only with review)

Basis: supported
Reason: Translation-aware alignment vs ignore-safely is a real fork: only napari applies dataset translation while vizarr breaks visibly and others ignore it.
Evidence: S043 lines 352-392

- O-C4. Translation-aware alignment (napari-style) rather than ignore-safely [O-034]. Validation: overlay fixture with translation renders aligned, or documents ignore-with-notice.

#### [B-093] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Optional capabilities (not required by brief/Plan; adopt only with review)

Basis: supported
Reason: The napari reader composes scale/translation/rotation/affine/sequence into one Affine with warn-and-skip for unknown types, beyond the 0.5 datasets allowance of scale+translation, grounding a tolerance option.
Evidence: S048 lines 81-133, S003 lines 308-313

- O-C5. Rotation/affine/sequence tolerance (warn-and-skip or compose) beyond 0.5 datasets allowance [O-064]. Validation: feed each richer transform and check no-crash + message.

#### [B-094] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Optional capabilities (not required by brief/Plan; adopt only with review)

Basis: supported
Reason: The spec allows arbitrary per-label properties and the napari reader builds an inspectable properties table with index, grounding hover/inspect display.
Evidence: S003 lines 467-471, S048 lines 628-650, S027 lines 173-177

- O-C6. Label properties on hover/inspect (index + arbitrary keys) [O-010, O-062-context]. Validation: hover shows properties table for the S003-example-style fixture.

#### [B-095] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Optional capabilities (not required by brief/Plan; adopt only with review)

Basis: supported
Reason: Traversal plus served CSV/Folders-tree browsing with thumbnails and copy-URL is the shipped finder behavior, making it a real optional pattern for multi-fileset directories.
Evidence: S023 lines 150-154, S017 lines 6-8

- O-C7. Finder-style collection browsing (traversal + CSV/Folders tree + thumbnails + copy-URL) for multi-fileset directories [O-045]. Validation: point at a folder of filesets and browse without opening each.

#### [B-096] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Optional capabilities (not required by brief/Plan; adopt only with review)

Basis: supported
Reason: Channel transfer-function controls (Pct-Min sliders, exposure, per-channel show/hide) and ROI clipping are documented AGAVE/Vol-E-family behavior beyond visibility toggles.
Evidence: S108 lines 15-27, S062 lines 7-15

- O-C8. Transfer-function channel rendering and ROI clipping (Vol-E/AGAVE-style) beyond visibility toggles [O-052, O-058]. Validation: reproduce a Pct-Min/exposure adjustment on a multichannel volume.

#### [B-098] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Product choices (need explicit decisions; evidence informs but does not settle)

Basis: supported
Reason: The three navigation models are all corpus-grounded (vizarr drill-down, reference stitched grids, implicit flat listing) with attested trade-offs, so this is a genuine undecided choice.
Evidence: S043 lines 213-224, S018 lines 404-439, S018 lines 478-527

- P-C1. Plate navigation model: overview-plus-drill-down (vizarr pattern) vs stitched canvas vs flat field list [O-020, O-031]. Validation: usability pass on the sparse-plate fixture measuring time-to-first-field and zoom stability.

#### [B-099] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Product choices (need explicit decisions; evidence informs but does not settle)

Basis: supported
Reason: Split-per-channel layers and blended composites are both attested (napari splitting vs Viv composites), so rendering architecture is genuinely open.
Evidence: S048 lines 204-213, S025 lines 81-82, S117 lines 118-122

- P-C2. Channel rendering: split layers vs blended composite [O-026, O-052]. Validation: compare color fidelity and toggle behavior on a 3-channel uint16 fixture.

#### [B-100] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Product choices (need explicit decisions; evidence informs but does not settle)

Basis: supported
Reason: Fully automatic choice (Plan), explicit choice with estimate (AGAVE dialog), and hybrid low-res-first are all grounded and distinct, so the UX choice is genuine.
Evidence: plan/Viewer.md lines 5-7, S117 lines 101-128

- P-C3. Pyramid UX: fully automatic level choice (Plan) vs explicit choice with memory estimate (AGAVE) vs hybrid low-res-first [O-052]. Validation: large-fileset open under a memory cap for each mode.

#### [B-101] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Product choices (need explicit decisions; evidence informs but does not settle)

Basis: supported
Reason: Strict schema validation and permissive-with-notice (v0.19 spatial-data precedent) are both attested postures with different outcomes, so the choice is genuine.
Evidence: S053 lines 22-25, S052 line 128, S016 lines 324-351

- P-C4. Strictness posture: strict schema rejection vs permissive-with-notice (v0.19 spatial-data precedent) [O-054, O-066]. Validation: open a spatial-data-style edge fixture under both postures and compare outcomes.

#### [B-102] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Product choices (need explicit decisions; evidence informs but does not settle)

Basis: supported
Reason: Labels-only vs general multi-image overlay is a genuine scope fork: the survey shows 3/11 support general overlays while labels are a spec-defined narrower case.
Evidence: S043 lines 473-507, S003 lines 431-456

- P-C5. Overlay scope: labels-only (recommended) vs general multi-image overlay (only 3/11 viewers support) [O-036]. Validation: attempt a two-image overlay and confirm scoped refusal or supported path per decision.

#### [B-104] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unsupported (do not treat as required)

Basis: supported
Reason: General multi-image overlay is supported by only 3 of 11 surveyed viewers and appears nowhere in the format obligations, so "minority capability, not obligation" is correct.
Evidence: S043 lines 473-507, S003 lines 294-316

- U1. General multi-image overlay/fusion on one canvas: a minority viewer capability, not a format obligation [O-036].

#### [B-105] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unsupported (do not treat as required)

Basis: supported
Reason: Brief and Plan both explicitly exclude remote storage, export, editing, and clinical interpretation.
Evidence: brief.md lines 3-5, plan/Viewer.md line 9

- U2. Remote storage, export, editing, clinical interpretation: explicitly out of scope [Plan L9; O-057].

#### [B-106] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unsupported (do not treat as required)

Basis: supported
Reason: Scene/coordinateSystems graph traversal exists in the napari code and v0.6-era release notes but not in the 0.5 spec, so it is correctly excluded from 0.5 obligations.
Evidence: S048 lines 402-495, S052 line 128, S003 lines 294-316

- U3. Scene/coordinateSystems graph traversal (v0.6-era): present in napari code paths but not a 0.5 obligation [O-064, S048 Scene].

#### [B-107] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unsupported (do not treat as required)

Basis: supported
Reason: The v3/0.5 column of the converter codec table lists null/blosc/gzip/zstd without zlib, and the table governs the converter, not the format.
Evidence: S033 lines 157-162

- U4. zlib codec for 0.5: absent from the bioformats2raw v3 table (converter-specific, not a format promise) [O-037].

#### [B-109] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unresolved (evidence missing or contradictory)

Basis: supported
Reason: The contradiction is real and unresolved in the corpus: the draft PR moves labels registration into the multiscale group while the released spec keeps the labels list in the labels-group zarr.json.
Evidence: S004 lines 149-157, S003 lines 441-450

- R1. Whether the labels-registration move (labels list into the multiscale group) was adopted or reverted before 0.5.0 [O-060 vs O-009].

#### [B-110] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unresolved (evidence missing or contradictory)

Basis: supported
Reason: The only corpus record of permissive-0.5 is a one-line release note ("be more permissive with version 0.5, allowing support for spatial-data ome zarrs", PR594) with no acceptance details, so the question is correctly unresolved.
Evidence: S052 line 128

- R2. What permissive-0.5 (PR594) accepts beyond strict 0.5 [O-054].

#### [B-111] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unresolved (evidence missing or contradictory)

Basis: supported
Reason: The compressor-vs-codecs evidence covers only the write path (v2 kwarg rejected on v3 writes), leaving read-path spelling acceptance correctly unresolved.
Evidence: S013 lines 166-186

- R3. Whether read paths must accept both `compressor` and `codecs` spellings on v3 arrays [O-047].

#### [B-112] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unresolved (evidence missing or contradictory)

Basis: supported
Reason: The corpus shows the default reader ignoring transforms and the new reader listing coordinateTransformations as TODO, but never states the fixed combination, so this is correctly unresolved.
Evidence: S011 lines 158-159, S027 lines 175-178, S048 lines 260-291

- R4. Which transform combinations the fixed napari reader applies (dataset + top-level, translation handling) [O-044].

#### [B-113] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unresolved (evidence missing or contradictory)

Basis: supported
Reason: The corpus gives examples (scales, sharding, sparse plates, XML parsing, dtype lists, custom hierarchies) but no frequency data for any listed phenomenon, so this is correctly unresolved.
Evidence: S054 lines 31-74, S055 lines 16-58, S056 lines 68-73, S048 lines 348-365, S025 lines 81-86, S033 lines 228-325

- R5. Real-world frequencies: translations, top-level transforms, multi-multiscales groups, custom hierarchies, non-bioformats2raw pyramid shapes, dtype histogram [O-005..O-007, O-021..O-023, O-027, O-028, O-039, O-056].

#### [B-114] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unresolved (evidence missing or contradictory)

Basis: supported
Reason: Each listed gap is attested as open at capture (PR123 TODOs, vizarr #307 open with no root cause, neuroglancer single-shard silence, Vol-E undescribed for 0.5, AGAVE out-of-switch dtypes) with no resolving evidence in the checked sources.
Evidence: S027 lines 175-178, S014 lines 126-143, S038 line 58, S062 lines 11-15, S096 lines 25-28

- R6. Status of deferred reader gaps: napari PR123 TODOs in releases, vizarr #307 root cause, neuroglancer v3/shard support, Vol-E 0.5 support, AGAVE out-of-switch dtypes [O-042, O-043, O-048, O-049, O-051, O-058].

#### [B-115] CONFIRMED
Context: # Slide Scout 0.5 research report (draft) > ## 2. Plan fit > ### Unresolved (evidence missing or contradictory)

Basis: supported
Reason: The validator source describes only a web page with sample links and a schemas override, never its rule list, so metadata-only vs codec/shard coverage is correctly unresolved.
Evidence: S031 lines 1-15

- R7. Validator coverage: metadata-only vs codec/shard correctness [O-059].

#### [B-129] CONFIRMED
Context: # Slide Scout 0.5 research report (draft)

Basis: supported
Reason: The build order faithfully sequences the report's own corrected findings (discovery/taxonomy before decode matrix before axes-driven navigation before bounding/acceptance, optionals last) and follows corpus dependencies.
Evidence: S003 lines 120-156, S055 lines 16-58, S003 lines 296-316, S034 lines 67-83

## 5. Reading guide for implementers

Build order implied by the evidence: (1) version-aware local discovery with the F1 hierarchy and F8 taxonomy; (2) v3 decode stack per the F9 matrix with validator-gated fixtures; (3) axes/transform-driven navigation and calibration (F2-F6); (4) responsiveness bounding (F7) sized by the acceptance matrix (F12); (5) optional capabilities only after review (O-C1..O-C8) and decided product choices (P-C1..P-C5).

## 2. Rejected draft assertions (no acceptance credit)

(none)

## 3. Not verified: unresolved, undecided or malformed-record proposals (no retention credit)

(none)

## 4. Verifier additions (new verifier assertions; checked like any claim)

# Additions: lost observations, new findings, non-findings, decisions, unresolved items, coverage

## 1. Material observations the draft lost (restated with sources)

- A1. AGAVE scene count equals multiscales list size. AGAVE's `loadNumScenes` returns `multiscales.size()` (S098 lines 226-233), i.e. one scene per multiscales entry. The draft never states this mapping; it matters for the O-C3 multi-multiscales choice UI (scene-per-entry is the attested AGAVE precedent).
- A2. Mixed namespaced/flat metadata keys are unhandled territory. The v3 reader unwraps `attributes.ome` (S019 lines 87-90; S048 lines 166-170), but no source describes groups mixing namespaced and legacy flat keys (O-018 open question, S019). F1/F8 should add a taxonomy row: mixed-namespace group.
- A3. Bioformats2raw XML failure modes are open. The napari OME-XML parse path (S048 lines 348-365) has no stated behavior for missing `OME/METADATA.ome.xml` or non-numeric Image IDs (O-027 open question). F1's precedence needs a fallback row for these.
- A4. Which label channel survives the squeeze is unknown. Napari pops `channel_axis` and squeezes per level for label layers (S048 lines 707-716); for multi-channel label data the surviving channel is unstated (O-062 open question). F5 should require documenting this.
- A5. Whether 0.5 writers emit `dimension_names` is unknown. The spec MUST (S003 line 174) is clear, but writer compliance frequency is unattested (O-004 open question). F8's mismatch row needs a prevalence check on real filesets.
- A6. MoBIE is a second plate precedent the draft drops. The survey marks MoBIE plate support with no crash note (S043 lines 223-224); P17/F1 cite only vizarr. Plate navigation has two working implementations, one described pattern.
- A7. Validator `?schemas=` override. The validator accepts a custom schema-branch override (S031 lines 10-15). Useful for testing edge fixtures (e.g. scene-era schemas) in F12; the draft cites only the base URL pattern.
- A8. Resave shard-shape defaults explain real-world shards. Default shard shape is the full array shape, and shards over 100M pixels force explicit `--output-shards` (S034 lines 291-304). Expect full-shape single shards (cf. S038 line 58) in challenge-era filesets; F9 matrix should include a single-shard row.
- A9. PR123 merged May 2026, later than the draft's 2025 framing. The PR record shows merge of 33 commits on May 8, 2026 (S027 lines 126-132); O-049/P10 describe it as 2025-era. Behavior claims stand, but release-version questions (R6) must target post-May-2026 napari-ome-zarr releases.
- A10. Empty captures bound specific questions. S002 is 0 bytes (ngff latest/tools pages per catalog), S005 is a clone-cap refusal, S007 is HTTP 403 (each file line 1). Questions answerable only from the live latest/tools pages stay unresolved; an empty capture is absence of evidence, not evidence of absence.

## 2. New supported findings (from verifier's own checks)

- N1. OMERO multi-multiscales row is ambiguous, not negative. The survey's OMERO entry reports "All images imported but sample image is corrupted" with no supported field (S043 lines 311-313). Correct counts: 10x supported:no, 3x fail-to-open, 1x ambiguous.
- N2. Napari plate labels come from the first well's first field only. `PlateLabels.metadata` reads the label group under first-well/first-field (S048 lines 543-555) and enumerates that field's labels listing (S048 lines 513-527). Per-well/per-field label sourcing is undesigned.
- N3. Mixed-format rejection is write-path only. The v04/v05 mix exception (S013 lines 157-164) fires in write_image flows; the read path detects format and logs a version-mismatch warning (S019 lines 58-66). Discovery errors must use mismatch wording.
- N4. Background/cancel has no implementation precedent in the corpus. Lazy dask loads (S018 line 145; S048 line 202) prove laziness, not background scheduling with cancellation. F7's automatic half rests on Plan L7 alone.
- N5. v0.15 release confirms deprecation + download fix. v0.15.0 deprecates writing v01-v03 and fixes downloading 0.5 (S052 line 343); v0.16.0 adds sharding (S052 line 300). Pin behavior-drift claims to these tags.
- N6. Older AGAVE limits are TIFF/CZI-era, not OME-Zarr. The <=4 channels, time slider, 16-bit-only, first-sample-only, few-GB limits (S108 lines 4-29) describe the TIFF/CZI desktop viewer; the OME-Zarr dialog (S117 lines 101-128) claims only resolution/channel/sub-region choice plus memory estimate.

## 3. Correct non-findings (checked, correctly absent from required findings)

- The corpus contains no frequency data for translations, top-level transforms, multi-multiscales groups, custom hierarchies, or dtype histograms (R5 stands).
- The corpus never details what permissive-0.5/PR594 accepts (one-line release note, S052 line 128; R2 stands).
- The corpus never addresses read-path `compressor`-vs-`codecs` spelling acceptance (write-path only, S013 lines 166-186; R3 stands).
- The corpus never states the fixed napari reader's transform combination (R4 stands).
- The corpus never gives the validator's rule list (S031 is 15 lines; R7 stands) or the vizarr #307 root cause (issue open, S014), neuroglancer's later v3/shard support, Vol-E 0.5 support, or AGAVE out-of-switch dtype behavior (R6 stands).
- The corpus never demonstrates background loading with cancellation in any implementation (N4).

## 4. Grouped product decisions for the user

- D1. Navigation model (P-C1 + F1 + P17 as qualified). Options: (a) vizarr-style low-res overview plus drill-down (only fully described pattern, S043 lines 213-215); (b) MoBIE-style plates (working, undescribed); (c) per-well/per-field lists; (d) stitched canvas (crash/zero-fill risk). Recommendation: (a) with (c) as fallback; decide plate-label sourcing per N2.
- D2. Channel rendering (P-C2 + F3). Split-per-channel layers (napari, S048) vs blended composite (Viv, S025). Either satisfies Plan L5; decide before contrast-limit architecture.
- D3. Pyramid UX and bounding (P-C3 + F7 as qualified + F2). Automatic background/cancel (Plan-specified, no corpus precedent) vs explicit pre-load dialog with memory estimate (AGAVE precedent) vs hybrid low-res-first. TB-scale acceptance forces a bounding rule regardless.
- D4. Strictness posture (P-C4 + F8 as qualified). Strict schema rejection (S053/S016) vs permissive-with-notice (v0.19 spatial-data precedent, S052 line 128). Decide per taxonomy row; read-path version rows use mismatch wording (N3).
- D5. Overlay scope (P-C5 + F5 as qualified). Labels-only aligned layer (recommended; spec-defined) vs general multi-image overlay (3/11 viewers). Decide before transform/alignment work; translations (O-C4) and richer transforms (O-C5) are sub-decisions.
- D6. Optionals gate (O-C1..O-C8). None is required by brief/Plan; nearest to free are O-C2 raw fallback (reference precedent) and O-C7 finder browsing (shipped precedent). RO-Crate display (O-C1) only pays off on challenge-lineage filesets.

## 5. Unresolved and unchecked items

- Unresolved (corpus-insufficient, kept from draft): R1 labels-registration contradiction; R2 permissive-0.5 acceptance set; R3 read-path codec-spelling acceptance; R4 fixed-napari transform combination; R5 all real-world frequencies; R6 deferred reader gaps (PR123 TODOs in releases, #307 root cause, neuroglancer/Vol-E/AGAVE-dtype status); R7 validator rule coverage. Plus A2 (mixed-namespace groups), A3 (missing XML / non-numeric IDs), A4 (surviving label channel), A5 (dimension_names writer compliance).
- Unchecked by this verifier: large issue/API dumps (S015, S024, S026, S028, S035, S040, S047, S050, S051, S057, S063-S065, S073, S075-S076, S078-S095, S097, S099-S107, S109-S116, S118-S125), full 0.4 spec (S059), converter/webknossos remainders (S033-rest, S058-rest), PR/issue-body remainders (S004/S008/S013/S023/S027/S029-rests), S010 beyond head, S020, S096-context beyond grep lines, S098-rest. These could still move R2/R5/R6/R7; nothing in them is needed for the confirmed findings above.

## 6. Coverage

- Decisions: 129/129 blocks decided (B-001..B-129): 72 confirm, 10 qualify (B-015, B-019, B-021, B-022, B-026, B-030, B-050, B-060, B-065, B-091), 0 reject, 0 unresolved-as-decision, remainder not_a_claim (headings, method notes, validation proposals, B-116..B-128 bookkeeping ranges). R1-R7 items (B-109..B-115) are confirmed as correctly-unresolved statements.
- Sources read by verifier: S003 (full), S053, S054, S055, S056, S016, S018, S019, S043 (full), S034, S025, S031, S011, S014, S038, S044, S048 (lines 1-249, 329-380, 480-555, 600-722), S033 (lines 1-380), S058 (lines 289-398), S052 (tag lines + v0.12.0/v0.15.0/v0.16.0/v0.19.0 bodies), S072, S096, S098 (lines 195-275), S108 (head), S117 (lines 99-129), S061 (head), S062 (head), S070, S009 (head), S010 (head), S017 (head), S027 (lines 99-190, 259-290), S004/S008/S013/S023 (cited heads), S005, S007, catalog/brief/Plan/README, stage1 observations + draft-blocks (full).
- Corpus searches run: `594`, `spatial[ -]?data` (regex), `compressor`, `sharding`, `permissive`, `deprecat`, `tag_name` (regex), `dimorder|dimension_order|Order|order` (regex) in S098, `dimorder|dimOrder|T,C,Z|loadMultiscaleDims`, `3.0.8` in S027, `v0.15|writing v01|spatial-data ome|tag_name` (regex, no match), `dim|order|assume` in S098 (literal, no match); scope case/sources or the named file.

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
[B-009: CONFIRMED]
- P6. `bioformats2raw.layout: 3` is transitional multi-image packaging; plate takes precedence when present, else OME `series` list, else numbered groups `0,1,2...`; readers SHOULD surface all images, not just the first [O-014].
[B-010: CONFIRMED]
- P7. The 0.4->0.5 break is Zarr v2->v3 (`.zattrs/.zarray/.zgroup` vs `zarr.json`, flat vs `ome`-namespaced attrs); 0.5.1/0.5.2 clarified omero text and the `dimension_names` MUST [O-015, O-055-scope, O-060].

[B-011: NOT A CLAIM (bookkeeping)]
### Reader implementations (observed behavior, not spec)

[B-012: CONFIRMED]
- P8. Reference Python reading moved in stages: 0.5 read-only on zarr v3 (PR404, Nov 2024), then 0.5 write-by-default with mixed v04/v05 writes rejected (PR413, v0.12.0), then sharding (v0.16), then permissive-0.5/scene/plain-string-codec handling (v0.19); the S016 FormatV05 snapshot (May 2025, write unsupported) is stale relative to releases [O-016, O-046, O-054, O-061].
[B-013: CONFIRMED]
- P9. ome-zarr-py unwraps v3 attrs under `ome`, validates exactly-one-scale-first with <=1 translation and ndim-matched numeric vectors, reads only `multiscales[0]`, degrades omero/contrast silently on bad input, stitches wells/plates into lazy dask grids with zeros for missing tiles, and falls back to raw-array load or silent ignore [O-017, O-018, O-019, O-020, O-067, O-068].
[B-014: CONFIRMED]
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

[B-028: NOT A CLAIM (bookkeeping)]
### F1. "opens a local OME-Zarr 0.5 fileset and lists the images it finds" (Plan L5)
[B-029: CONFIRMED]
- Disposition: correction.
[B-030: QUALIFIED]
- Constraint: discovery must branch on store markers (0.5 `zarr.json` + `attributes.ome.version=="0.5"` vs 0.4 `.zattrs`; mixed hierarchies invalid), then follow plate->well->field lists, bioformats2raw.layout precedence (plate > OME series > numbered groups), labels-listing UNION directory probing, first-multiscales default with multi-multiscales choice, and arbitrary entry-point walk-up [O-001, O-002, O-006, O-007, O-011, O-012, O-013, O-014, O-015, O-040, O-046, O-050, O-063].
[B-031: CONFIRMED]
- Consequence: a flat image list is wrong for plates/collections; the finder must present hierarchy-aware navigation (fileset > plate/well/field or series > image > labels) and version-aware errors.
[B-032: NOT A CLAIM (bookkeeping)]
- Validation idea: open five fixtures (plain image; sparse plate S056-shape; bioformats2raw multi-series; labels-unlisted labels group; 0.4 fileset) and check the listed tree plus the 0.4 message, against validator results for the same fixtures.

[B-033: NOT A CLAIM (bookkeeping)]
### F2. "canvas with pan and zoom" + "chooses an available pyramid level appropriate for the current view" (Plan L5)
[B-034: CONFIRMED]
- Disposition: correction.
[B-035: CONFIRMED]
- Constraint: level order is datasets[] order (never numeric sort); per-level pixel size comes from that level's scale (never assumed factor 2); z-size may differ per level; arrays may be sharded with blosc/gzip/zstd codecs and 3D or 2D chunks [O-005, O-006, O-021, O-022, O-024, O-029, O-030, O-037, O-041, O-056].
[B-036: CONFIRMED]
- Consequence: the renderer needs scale-aware level selection, per-level plane counts, and a v3 codec/shard decode stack; assuming uniform 2x y/x-only pyramids breaks real data.
[B-037: NOT A CLAIM (bookkeeping)]
- Validation idea: render a Z-downsampled pyramid and a non-2-factor pyramid next to a known-good view and compare level shapes, displayed scale, and tile alignment at three zoom steps.

[B-038: NOT A CLAIM (bookkeeping)]
### F3. "channel visibility controls" (Plan L5)
[B-039: CONFIRMED]
- Disposition: covered, with correction on defaults.
[B-040: CONFIRMED]
- Constraint: visibility/label/color/window defaults come from omero channels when present (color hex, active, label, window start/end; greyscale model whitens; missing windows must not silently reset all channels); absent omero needs deterministic fallbacks; split-layer vs composite rendering is open [O-008, O-026, O-051, O-052, O-067].
[B-041: CONFIRMED]
- Consequence: controls work without omero but match omero when present; a single bad channel must degrade per-channel with notice, not wipe all contrast.
[B-042: NOT A CLAIM (bookkeeping)]
- Validation idea: open one image with full omero, one without, and one with a single broken window; record initial visibility, names, colors, and contrast limits per channel.

[B-043: NOT A CLAIM (bookkeeping)]
### F4. "time-point and plane selection where relevant" (Plan L5)
[B-044: CONFIRMED]
- Disposition: correction.
[B-045: CONFIRMED]
- Constraint: which selectors appear is driven by axes (2-5D, time/channel/space/custom order), not by fixed 5D tczyx; plane counts vary per pyramid level when Z is downsampled; rdefs defaultT/defaultZ give initial positions when present [O-003, O-008, O-029, O-053, O-055].
[B-046: CONFIRMED]
- Consequence: 2D/3D/4D and custom-axis images show only applicable selectors; switching pyramid level must remap plane indices through that level's shape.
[B-047: NOT A CLAIM (bookkeeping)]
- Validation idea: open 2D, 3D, 4D (no-t), 5D, and custom-axis fixtures; check selector presence, default positions vs rdefs, and plane-count changes across two pyramid levels.

[B-048: NOT A CLAIM (bookkeeping)]
### F5. "optional overlays for associated label images" (Plan L5)
[B-049: CONFIRMED]
- Disposition: correction.
[B-050: QUALIFIED]
- Constraint: discover labels by listing UNION probing; require integer dtype and same level count; align overlay level-to-level with the source image using each side's transforms; default hidden with explicit toggle; colors from image-label colors (invented colormap only when absent); channel axis removed for the overlay layer; plate labels derive per wells/fields [O-009, O-010, O-021-context, O-026, O-036, O-050, O-062].
[B-051: CONFIRMED]
- Consequence: overlay is a label-specific aligned layer (not general multi-image fusion); misaligned levels or missing colors must produce explicit notices, not silent offsets or invisible labels.
[B-052: NOT A CLAIM (bookkeeping)]
- Validation idea: overlay a labeled image at two pyramid levels and screenshot-diff label boundaries against the source; repeat with missing image-label colors and with a plate labels fixture.

[B-053: NOT A CLAIM (bookkeeping)]
### F6. "details panel shows dimensions, units and coordinates" (Plan L5)
[B-054: CONFIRMED]
- Disposition: correction.
[B-055: CONFIRMED]
- Constraint: coordinates combine per-dataset scale/translation with top-level multiscales transforms, in axes order with UDUNITS units (space/time lists; channel usually unitless); dimension_names must match axes names; translations must at minimum not break rendering; inconsistent/missing units need a stated display rule [O-003, O-004, O-005, O-021, O-033, O-034, O-035, O-044].
[B-056: CONFIRMED]
- Consequence: the panel shows per-axis pixel size, units, and calibrated cursor coordinates computed from the active level's combined transform; ignoring top-level transforms or translations repeats known viewer bugs.
[B-057: NOT A CLAIM (bookkeeping)]
- Validation idea: for fixtures with dataset-only scale, dataset+top-level scale, and translation, hand-compute three cursor positions from the JSON vectors and compare with panel readouts.

[B-058: NOT A CLAIM (bookkeeping)]
### F7. "Large image reads run in the background so navigation remains responsive. Changing the selected view cancels work that is no longer needed." (Plan L7)
[B-059: CONFIRMED]
- Disposition: covered, with product_choice on bounding strategy.
[B-060: QUALIFIED]
- Constraint: corpus proves both automatic background/cancel (Plan) and explicit pre-load bounding with memory estimate (AGAVE level/channel/sub-region dialog); TB-scale plates and 21-66 GB images make unbounded eager loads infeasible [O-020, O-025, O-031, O-052, O-057].
[B-061: CONFIRMED]
- Consequence: keep Plan's background/cancel behavior and add a bounding rule (auto low-res-first and/or explicit choice with estimate) so the large-dataset acceptance case cannot OOM.
[B-062: NOT A CLAIM (bookkeeping)]
- Validation idea: open the largest acceptance fileset while profiling interaction latency and peak memory during pan/zoom/channel flips; cancel must drop stale tile requests observably.

[B-063: NOT A CLAIM (bookkeeping)]
### F8. "Opening failures explain which image or data could not be displayed and allow the user to choose another item." (Plan L7)
[B-064: CONFIRMED]
- Disposition: correction.
[B-065: QUALIFIED]
- Constraint: attested failure taxonomy: 0.4-in-0.5-scope, mixed v04/v05, missing/inconsistent version, absent multiscales/plate/well keys, schema violations (counts, required keys, vector lengths), dimension_names mismatch, unsupported codec/shard, unsupported dtype, transform violations, missing wells/fields, unlisted-vs-unreadable labels, non-multiscale entry [O-002, O-015, O-040, O-042, O-046, O-047, O-048, O-060, O-063, O-066].
[B-066: CONFIRMED]
- Consequence: errors must name the failing node, the violated rule, and the recovery action (pick another item/level); silent ignores and silent no-chunks states are known bad behaviors.
[B-067: NOT A CLAIM (bookkeeping)]
- Validation idea: feed a malformed corpus (one fixture per taxonomy row) and check each message names node + rule + next action, with the browser still usable.

[B-068: NOT A CLAIM (bookkeeping)]
### F9. "should interoperate with filesets from real OME-Zarr 0.5 tools" (Plan L9)
[B-069: CONFIRMED]
- Disposition: correction.
[B-070: CONFIRMED]
- Constraint: interop means the observed decode matrices: sharding_indexed + blosc (cname/clevel/shuffle variants)/gzip/zstd/null codecs, arbitrary chunk grids, uint/int/float dtype coverage declared (spec labels need all 8 int types; renderers bound support), 2024-2026 behavior drift (permissive-0.5, plain-string codec attrs), and converter quirks (custom hierarchies, dropped OME/root markers) [O-022, O-024, O-028, O-037, O-039, O-041, O-047, O-051, O-054, O-056].
[B-071: CONFIRMED]
- Consequence: publish an explicit supported/unsupported matrix (codecs x dtypes x layouts) and test it; anything outside fails loudly with the matrix row cited.
[B-072: NOT A CLAIM (bookkeeping)]
- Validation idea: build a matrix fixture pack (one fileset per codec/dtype/layout cell claimed) and record open/render/explain outcomes per cell.

[B-073: NOT A CLAIM (bookkeeping)]
### F10. "Source files remain unchanged; display settings are local to the viewing session." (Plan L9)
[B-074: CONFIRMED]
- Disposition: covered.
[B-075: CONFIRMED]
- Constraint: local read-only opening; no sidecar writes into the fileset; challenge resave and validator flows confirm input-must-not-be-modified expectations [O-024, O-059-context].
[B-076: CONFIRMED]
- Consequence: no action beyond enforcing read-only file handles and session-scoped settings (avoid absolute-path settings portability trap [O-058]).
[B-077: NOT A CLAIM (bookkeeping)]
- Validation idea: hash the fileset tree before and after a scripted viewing session and diff; any delta fails.

[B-078: NOT A CLAIM (bookkeeping)]
### F11. "Image editing, export, remote storage and automated scientific or clinical interpretation are outside this plan." (Plan L9)
[B-079: CONFIRMED]
- Disposition: covered.
[B-080: CONFIRMED]
- Constraint: brief + Plan both exclude these; remote-read performance issues (QuPath) and pathology interpretation stay out of scope even where reading code overlaps [O-057].
[B-081: CONFIRMED]
- Consequence: decline remote URLs and interpretation requests with a scope message; do not partially implement them.
[B-082: NOT A CLAIM (bookkeeping)]
- Validation idea: attempt a remote-URL open and an export action; both must refuse with the scope message and leave local browsing intact.

[B-083: NOT A CLAIM (bookkeeping)]
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
[B-091: QUALIFIED]
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

[B-109: CONFIRMED]
- R1. Whether the labels-registration move (labels list into the multiscale group) was adopted or reverted before 0.5.0 [O-060 vs O-009].
[B-110: CONFIRMED]
- R2. What permissive-0.5 (PR594) accepts beyond strict 0.5 [O-054].
[B-111: CONFIRMED]
- R3. Whether read paths must accept both `compressor` and `codecs` spellings on v3 arrays [O-047].
[B-112: CONFIRMED]
- R4. Which transform combinations the fixed napari reader applies (dataset + top-level, translation handling) [O-044].
[B-113: CONFIRMED]
- R5. Real-world frequencies: translations, top-level transforms, multi-multiscales groups, custom hierarchies, non-bioformats2raw pyramid shapes, dtype histogram [O-005..O-007, O-021..O-023, O-027, O-028, O-039, O-056].
[B-114: CONFIRMED]
- R6. Status of deferred reader gaps: napari PR123 TODOs in releases, vizarr #307 root cause, neuroglancer v3/shard support, Vol-E 0.5 support, AGAVE out-of-switch dtypes [O-042, O-043, O-048, O-049, O-051, O-058].
[B-115: CONFIRMED]
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
  "confirm": 72,
  "not_a_claim": 47,
  "qualify": 10
 },
 "unknown_ids": [],
 "decision_entries": 118,
 "lines_outside_entries": [
  1
 ],
 "non_authoritative": [],
 "carrier_defects": 1,
 "complete": false
}
```
