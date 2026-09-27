# Verification decisions

### B-001
decision: confirm
basis: supported
reason: Scope framing matches the brief (local read-only 0.5 browser), the thin Plan snapshot, and the fixed-corpus rule; the Plan-coverage and validation-idea caveats are accurate method notes.
evidence: brief.md lines 1-9, plan/Viewer.md lines 1-11, case/README.md lines 1-8

### B-002
decision: not_a_claim
reason: Section heading with no proposition.

### B-003
decision: not_a_claim
reason: Subsection heading with no proposition.

### B-004
decision: confirm
basis: supported
reason: Spec states Zarr v3 only with all Zarr features allowed unless disallowed, metadata under attributes.ome, and version "0.5" consistent within a hierarchy.
evidence: S003 lines 68-72, S003 lines 150-156

### B-005
decision: confirm
basis: supported
reason: Spec constrains axes to 2-5 with time/channel-custom/space order, requires dimension_names match, largest-first datasets, exactly one scale plus optional translation after it with axes-length vectors, and top-level transforms applied after per-dataset ones; schema matches.
evidence: S003 lines 173-174, S003 lines 299-316, S053 lines 126-150, S053 lines 196-265

### B-006
decision: confirm
basis: supported
reason: Spec marks omero optional but requires channels with 6-hex color and window {min,max,start,end} when present, and documents rdefs/active/label display defaults.
evidence: S003 lines 398-430

### B-007
decision: confirm
basis: supported
reason: Spec places labels under a non-image "labels" group with metadata-free intermediates, 8 integer dtypes, SHOULD-listed labels array, equal level counts, and SHOULD image-label with colors/version plus optional properties and source.image default ../../.
evidence: S003 lines 437-474

### B-008
decision: confirm
basis: supported
reason: Spec requires the plate/row/well/field hierarchy with strict plate keys (rows, columns, consistent wells, version) and well keys (unique alphanumeric path, acquisition when multi-acquisition); sparse plates list full extent with present wells only, confirmed by the real plate example.
evidence: S003 lines 120-129, S003 lines 530-560, S003 lines 641-642, S003 lines 744-751, S056 lines 10-67

### B-009
decision: confirm
basis: supported
reason: Spec sets bioformats2raw.layout 3 at top level with plate precedence, then OME series list, then numbered groups, and asks readers not to default to only the first image.
evidence: S003 lines 193-206, S003 lines 256-275

### B-010
decision: confirm
basis: supported
reason: Version history records the 0.5.0 move to Zarr v3 and the 0.5.1 omero-text and 0.5.2 dimension_names clarifications; the v3 zarr.json vs v2 flat-file contrast is documented.
evidence: S003 lines 825-833, S058 lines 309-329

### B-011
decision: not_a_claim
reason: Subsection heading with no proposition.

### B-012
decision: confirm
basis: supported
reason: PR404 added 0.5 read-only on zarr v3, PR413 (merged Aug 2025, released v0.12.0) made 0.5 writing default with mixed v04/v05 writes rejected, v0.16 added sharding, v0.19 added permissive-0.5/scene/plain-string-codec handling, so the May-2025 write-unsupported snapshot is stale.
evidence: S008 lines 140-164, S013 lines 131-164, S052 lines 128, S052 lines 300, S052 lines 558, S016 lines 368-370

### B-013
decision: confirm
basis: supported
reason: The reader unwraps v3 attrs under "ome", validates exactly-one-scale-first with at most one translation and ndim-matched numeric vectors, reads only multiscales[0], degrades omero silently on bad input, stitches wells/plates with zeros for missing tiles, and falls back to raw-array load or silent ignore.
evidence: S019 lines 87-90, S016 lines 324-351, S018 lines 279-283, S018 lines 335-349, S018 lines 390-391, S018 lines 404-439, S018 lines 540-567, S018 lines 593-600

### B-014
decision: confirm
basis: supported
reason: PR123 is merged (33 commits) dropping the ome-zarr dependency for direct zarr v3 (>=3.0.8 per the issue), and the reader dispatches Multiscales/Plate/Bioformats2raw/Labels/Scene, splits image channels, squeezes label channel axes, hides labels by default, walks up from arbitrary entries, and warns-and-skips unknown transforms beyond scale/translation/rotation/affine/sequence.
evidence: S027 lines 126-178, S011 lines 163-165, S048 lines 81-133, S048 lines 204-213, S048 lines 341-365, S048 lines 652-654, S048 lines 672-716

### B-015
decision: qualify
basis: supported
reason: The OME-Zarr load-dialog claims check out, but the <=4 concurrent channels, time slider, and 16-bit/first-sample/GB limits come from older TIFF/CZI-era desktop docs, not the OME-Zarr loading docs.
evidence: S072 lines 1-3, S096 lines 8-10, S096 lines 25-28, S098 lines 202-223, S098 line 256, S108 lines 4-29, S117 lines 101-128
replacement:
<<<
- P11 (corrected). AGAVE is a desktop GPU volume explorer (Qt + tensorstore v0.1.78 backend) that reads local OME-Zarr 0.4 and 0.5 (S072 lines 1-3; S096 lines 8-10). Its OME-Zarr Load Settings dialog offers explicit resolution-level choice (highest default, OOM risk), channel exclusion (reload to recover), X/Y/Z sub-region selection, appearance-settings reuse, and a GPU-memory estimate (S117 lines 101-128). Its FileReaderZarr branches metadata lookup on zarr version (v3 under attributes.ome, erroring when absent; v2 flat) and uses driver zarr3 vs zarr (S098 lines 202-223), but hard-codes dimorder T,C,Z,Y,X (S098 line 256), a correctness risk for 2D/3D/4D or custom-axis 0.5 data. Its VolumeDimensions dtype switch handles int32/uint16/uint8/float32 (S096 lines 25-28); behavior outside those four is unattested. Conditions: AGAVE at the captured commits; OME-Zarr load path only. The <=4 concurrent channels, time slider, 16-bit-only, first-time-sample-only, and few-GB-GPU limits appear only in older TIFF/CZI-era desktop docs (S108 lines 4-29) and MUST NOT be cited as OME-Zarr behavior. Plan fit: supports F7 explicit-bounding precedent and F9 dtype-matrix precedent only. Consequence: Slide Scout may borrow the pre-load bounding dialog and version-branched lookup but must not assume fixed dimorder or the older-docs channel/time limits. Validation idea: load a 2D custom-axis 0.5 fileset in AGAVE and check axis interpretation against the spec.
>>>

### B-016
decision: confirm
basis: supported
reason: The converter documents v3/0.5 codecs (null, blosc, gzip, zstd; no zlib) with full option ranges, 0.4+0.5 writing, TCZYX default order with deprecated dimension-order override, ~256px smallest level with factor-2 steps, and hierarchy/marker options that can break spec compatibility.
evidence: S033 lines 107-118, S033 lines 157-200, S033 lines 219-226, S033 lines 228-325, S033 lines 333-337

### B-017
decision: confirm
basis: supported
reason: Each cited real-data fact matches its file: czyx scales with micrometer space units, sharded blosc/zstd uint16 array with dimension_names, sparse 6x11 plate with ~50 wells and field_count 32, v2->v3 conversions with RO-Crate sidecars, and sizes from 589 MB to 1 TB.
evidence: S054 lines 10-74, S055 lines 16-74, S056 lines 10-67, S034 lines 43-46, S034 lines 67-83

### B-018
decision: not_a_claim
reason: Subsection heading with no proposition.

### B-019
decision: qualify
basis: supported
reason: Four of five failure items check out, but the S044 auto-sharding crash is a write-path (write_image) bug, not a rendering/decoding failure on valid-looking 0.5 data.
evidence: S014 lines 139-143, S038 lines 58, S011 lines 151-157, S013 lines 182-186, S044 lines 139-182
replacement:
<<<
- P14 (corrected). Decoding/rendering failures on valid-looking 0.5 data are attested: vizarr repetitive-chunk rendering of resave-converted 0.5 data while the 0.4 original rendered correctly (S014 lines 139-143); neuroglancer "no multiscale metadata found" plus silent no-chunks on a sharded v3 array (S038 line 58); the napari zarr<3 pin vs bioio zarr>=3 dependency conflict breaking the napari plugin (S011 lines 151-157); and rejection of the v2 `compressor` kwarg on zarr_format 3 writes (S013 lines 182-186). Separately, a write-path robustness bug (not a rendering failure): ome-zarr-py write_image crashes on shards="auto" via dask rechunk/parse_bytes (S044 lines 139-182, issue #640, Aug 2026). Conditions: versions and dates as captured. Plan fit: the first four support the F8 failure taxonomy and F9 decode-matrix rows; the S044 item is out of Slide Scout's read-only scope except as evidence that auto-sharded filesets may carry unusual shard shapes. Consequence: the viewer must explain decode/render failures per node and must never fail silently with no chunks; writer bugs need no viewer handling. Validation idea: open the resave-converted fixture and a sharded v3 array and check for correct pixels or a named error, never silent gaps.
>>>

### B-020
decision: confirm
basis: supported
reason: The survey counts check out (dataset scale 7/11, translation only napari with vizarr image-disappears and WEBKNOSSOS fails-to-open, top-level scale 4/11, Z-downsample and non-2-factor break vizarr/avivator) plus the default-napari scale-ignoring report.
evidence: S043 lines 2-13, S043 lines 80-89, S043 lines 318-350, S043 lines 362-392, S043 lines 394-428, S011 lines 158-159

### B-021
decision: qualify
basis: supported
reason: The core ambiguities check out, but "all supported:no" overstates the multi-multiscales row: OMERO has no supported field and reports all images imported with a corrupted sample, which is neither clean support nor clean failure.
evidence: S043 lines 277-316, S027 lines 269-270, S048 lines 341-365, S003 lines 264-270, S004 lines 149-157, S003 lines 441-450
replacement:
<<<
- P16 (corrected). Discovery ambiguities are real: for multiple multiscales, ten surveyed viewers report supported:no (opening the first only) and three fail to open the sample (BDV/MoBIE ArrayIndexOutOfBounds, WEBKNOSSOS non-unique mags), while OMERO reports all images imported but a corrupted sample (S043 lines 277-316), so "none opens beyond multiscales[0]" holds except for one ambiguous OMERO row; labels listings can be missing while label groups exist and the pre-0.5 spec under-defined labels objects (S027 lines 269-270); bioformats2raw discovery has competing rules (spec series/numbered-groups per S003 lines 264-270 vs napari OME-XML Image-ID parse per S048 lines 341-365); and PR206's labels-registration-move proposal (S004 lines 149-157) contradicts the released spec's labels-list-in-labels-group rule (S003 lines 441-450). Conditions: survey captures and code versions as captured. Plan fit: supports F1 (first-multiscales default with choice, listing UNION probing, bioformats2raw precedence) and F8 taxonomy rows. Consequence: Slide Scout must union listing with probing, implement a defined bioformats2raw precedence, and handle multi-multiscales groups without crashing. Validation idea: open the multi-multiscales sample and a labels-unlisted group and check choice offered / labels found without crash.
>>>

### B-022
decision: qualify
basis: supported
reason: Vizarr's overview-plus-drill-down and both failure modes check out, but "exactly one proven low-risk pattern" ignores MoBIE, which the survey also marks as supporting plates with no disclosed pattern or crash note.
evidence: S043 lines 207-238, S018 lines 425-439, S018 lines 540-558
replacement:
<<<
- P17 (corrected). HCS at scale has one fully described low-risk pattern in the corpus: vizarr shows only the lowest-resolution plate overview and loads a clicked well in a new window (S043 lines 213-215); MoBIE also reports plate support with no stated pattern (S043 lines 223-224), so vizarr's is the only pattern whose mechanics are attested, not the only working implementation. Full-resolution stitched canvases are risky: napari loads the plate but crashes on zoom (S043 lines 218-220), and ome-zarr-py stitches wells/plates into lazy grids substituting zeros for missing/failed tiles (S018 lines 425-439, S018 lines 540-558), hiding missing data as black tiles. Conditions: survey and code captures as captured. Plan fit: informs product choice P-C1 (navigation model) and bounds F7 for TB-scale plates. Consequence: Slide Scout should default to overview-plus-drill-down or per-well/per-field navigation and must not silently zero-fill missing wells. Validation idea: open the sparse-plate fixture and check overview render, drill-down to one well/field, and explicit marking of absent wells.
>>>

### B-023
decision: not_a_claim
reason: Subsection heading with no proposition.

### B-024
decision: confirm
basis: supported
reason: The finder command, local traversal, CSV served to BioFile Finder with Folder-tree browsing, thumbnails and copy-URL, and the v2-only (.zattrs, v3 deferred) limitation are all stated; the changelog confirms it shipped in 0.11.0.
evidence: S023 lines 150-154, S017 lines 6-8

### B-025
decision: confirm
basis: supported
reason: The validator is a web page for validating OME-NGFF files, the challenge routinely links per-fileset validator URLs as acceptance evidence, and IDR/challenge sample catalogs exist.
evidence: S031 lines 1-6, S034 lines 67-85, S010 lines 1-8

### B-026
decision: qualify
basis: supported
reason: Three of four precedents check out as published guidance, but AGAVE's "dtype matrix" is a four-case source-code switch (int32/uint16/uint8/float32), not a published support matrix, and out-of-switch behavior is unattested.
evidence: S025 lines 81-86, S096 lines 25-28, S117 lines 101-128, S058 lines 385-389
replacement:
<<<
- P20 (corrected). Bounded precedents exist for hard choices: Vizarr/Viv publishes an explicit supported-dtype list (int8/16/32, uint8/16/32, float32/64; S025 lines 81-86); AGAVE's dtype handling is visible only as a four-case code switch (int32/uint16/uint8/float32; S096 lines 25-28), which bounds what is handled but is not a published matrix and leaves other dtypes' behavior unattested; AGAVE publishes an explicit memory-bounding load dialog with estimate (S117 lines 101-128); WEBKNOSSOS publishes chunk/shard tuning guidance (32-128 voxels^3, sharding, 3D downsampling; S058 lines 385-389). Conditions: captures as captured. Plan fit: informs F9 (publish an explicit codecs x dtypes x layouts matrix) and F7 (bounding rule). Consequence: Slide Scout must publish its own matrix rather than inferring AGAVE's switch as a promise. Validation idea: open one fileset per claimed dtype cell and record render vs named-explain outcomes.
>>>

### B-027
decision: not_a_claim
reason: Section heading plus report-convention note; bookkeeping, not a factual claim.

### B-028
decision: not_a_claim
reason: Item heading quoting the Plan with no proposition of its own.

### B-029
decision: confirm
basis: supported
reason: Plan L5 names only opening and listing images, while the corpus requires version branching, plate/well/series traversal, labels probing, and multi-multiscales handling, so "correction" is the right disposition.
evidence: plan/Viewer.md line 5, S003 lines 120-129, S003 lines 150-156, S003 lines 261-275

### B-030
decision: qualify
basis: supported
reason: The discovery rules check out except that mixed v04/v05 rejection is attested only on the write path; the read path detects versions and warns on mismatch, which changes the discovery-error wording.
evidence: S003 lines 150-156, S003 lines 261-275, S003 lines 388-397, S058 lines 309-329, S013 lines 150-164, S019 lines 58-66, S048 lines 672-689, S027 lines 269-270
replacement:
<<<
- F1 constraint (corrected): discovery must branch on store markers (0.5 zarr.json + attributes.ome.version "0.5" per S003 lines 150-156 vs 0.4 .zattrs/.zgroup markers per S058 lines 309-329), treat version inconsistency within a hierarchy as invalid-or-uncertain per the MUST-consistency rule (S003 line 156), then follow plate->well->field lists (S003 lines 120-129, 530-560, 744-751), bioformats2raw.layout precedence (plate, else OME series, else numbered groups; S003 lines 261-275), labels-listing UNION directory probing (listing per S003 lines 441-450 plus probing for unlisted groups per S027 lines 269-270), first-multiscales default with user choice by name (S003 lines 388-397), and arbitrary entry-point walk-up (S048 lines 672-689). Mixed v04-group-with-v05-format rejection is attested only for writes (S013 lines 157-164); on the read path the reference code detects the format and logs a version-mismatch warning (S019 lines 58-66), so discovery errors must say "version mismatch / inconsistent hierarchy," not "mixed-format exception." Conditions: local 0.5 filesets. Plan fit: correction to Plan L5 ("opens ... and lists the images"). Consequence: hierarchy-aware navigation (fileset > plate/well/field or series > image > labels) with version-aware errors. Validation idea: open five fixtures (plain image; sparse plate; multi-series bioformats2raw; labels-unlisted group; 0.4 fileset) and check the listed tree plus the 0.4 message against validator results.
>>>

### B-031
decision: confirm
basis: supported
reason: The plate/row/well/field hierarchy and multi-image bioformats2raw collections in the spec make a flat list insufficient, so hierarchy-aware navigation with version-aware errors follows.
evidence: S003 lines 120-129, S003 lines 261-275, S056 lines 10-67

### B-032
decision: not_a_claim
reason: Proposed future check, not a factual claim.

### B-033
decision: not_a_claim
reason: Item heading quoting the Plan with no proposition of its own.

### B-034
decision: confirm
basis: supported
reason: Plan L5 assumes pyramid choice without stating ordering, scale sourcing, Z varies-per-level, or codec/shard decoding, all of which the corpus constrains, so "correction" is right.
evidence: plan/Viewer.md line 5, S003 lines 304-312, S043 lines 2-13, S055 lines 16-58

### B-035
decision: confirm
basis: supported
reason: Level order comes from datasets[] order, pixel size from per-level scale vectors, Z may downsample per level, and arrays may be sharded with blosc/gzip/zstd-family codecs in 3D or 2D chunking.
evidence: S003 lines 304-312, S043 lines 2-13, S043 lines 80-89, S054 lines 31-74, S055 lines 16-58, S033 lines 157-162, S034 lines 99-105, S034 line 136

### B-036
decision: confirm
basis: supported
reason: Scale-aware selection, per-level plane counts, and a v3 shard/codec stack follow directly from the cited pyramid variability; uniform-2x y/x-only assumptions break the attested Z-downsampled and non-2-factor cases.
evidence: S043 lines 2-13, S043 lines 80-89, S055 lines 16-58

### B-037
decision: not_a_claim
reason: Proposed future check, not a factual claim.

### B-038
decision: not_a_claim
reason: Item heading quoting the Plan with no proposition of its own.

### B-039
decision: confirm
basis: supported
reason: Plan L5 already specifies visibility controls (covered) while saying nothing about omero-derived defaults, so "covered, with correction on defaults" is the right disposition.
evidence: plan/Viewer.md line 5, S003 lines 398-430

### B-040
decision: confirm
basis: supported
reason: Omero supplies color/active/label/window defaults with greyscale-model whitening in both readers, the reference disables all contrast limits when any window start/end is missing, and split-layer vs blended-composite rendering is genuinely open across implementations.
evidence: S003 lines 398-430, S018 lines 356-383, S048 lines 293-336, S048 lines 204-213, S025 lines 81-82

### B-041
decision: confirm
basis: supported
reason: Working without omero but matching it when present follows from omero's optionality, and per-channel degradation with notice is the stated improvement over the reference's wipe-all-contrast behavior.
evidence: S003 line 426, S018 lines 379-383

### B-042
decision: not_a_claim
reason: Proposed future check, not a factual claim.

### B-043
decision: not_a_claim
reason: Item heading quoting the Plan with no proposition of its own.

### B-044
decision: confirm
basis: supported
reason: Plan L5's fixed-sounding selectors need axes-driven presence, per-level plane counts, and rdefs defaults from the corpus, so "correction" is right.
evidence: plan/Viewer.md line 5, S003 lines 299-303, S003 lines 419-423, S043 lines 2-13

### B-045
decision: confirm
basis: supported
reason: Axes order and dimensionality drive which selectors apply, Z-downsampling varies plane counts per level, and rdefs defaultT/defaultZ give initial positions; fixed 5D assumptions are contradicted by the spec and AGAVE's risky fixed dimorder.
evidence: S003 lines 296-303, S003 lines 419-423, S043 lines 2-13, S098 line 256, S033 lines 333-337
### B-046
decision: confirm
basis: supported
reason: Showing only applicable selectors and remapping plane indices per level follows from variable dimensionality/axes and per-level Z shapes.
evidence: S003 lines 296-307, S043 lines 2-13

### B-047
decision: not_a_claim
reason: Proposed future check, not a factual claim.

### B-048
decision: not_a_claim
reason: Item heading quoting the Plan with no proposition of its own.

### B-049
decision: confirm
basis: supported
reason: Plan L5 names optional overlays without discovery, alignment, colors, defaults, or plate-label rules, all constrained by the corpus, so "correction" is right.
evidence: plan/Viewer.md line 5, S003 lines 437-460, S048 lines 652-716

### B-050
decision: qualify
basis: supported
reason: All overlay rules check out except plate-label derivation: napari derives plate labels from the first well's first field only, not per wells/fields.
evidence: S003 lines 437-474, S048 lines 204-213, S048 lines 513-555, S048 lines 652-716, S043 lines 473-507
replacement:
<<<
- F5 constraint (corrected): discover labels by labels-listing UNION directory probing (S003 lines 441-450; S027 lines 269-270); require integer dtype from the 8-member set and the same level count as the source image (S003 lines 437-455); align overlay level-to-level with the source using each side's transforms; default hidden with explicit toggle (S048 lines 652-654; S018 lines 316-318); colors from image-label colors, inventing a colormap only when absent (S003 lines 456-466); remove the channel axis for the overlay layer with per-level squeeze (S048 lines 707-716); and for plates note the attested implementation derives PlateLabels metadata from the first well's first field only (S048 lines 543-555) and enumerates labels paths from that field's labels listing (S048 lines 513-527), so per-well/per-field label derivation is an unsolved design point, not an attested behavior. Overlay stays label-specific, not general multi-image fusion (only 3/11 surveyed viewers support overlays; S043 lines 473-507). Conditions: local 0.5 images and plates. Plan fit: correction to Plan L5 ("optional overlays"). Consequence: a label-specific aligned layer with explicit notices for misaligned levels or missing colors, and an explicit product decision on plate-label sourcing. Validation idea: overlay a labeled image at two pyramid levels and screenshot-diff boundaries against the source; repeat with missing colors and with a plate labels fixture, checking which well's labels appear.
>>>

### B-051
decision: confirm
basis: supported
reason: Label-specific scope follows from the survey (3/11 multi-image support) and the labels spec, and explicit notices follow from the known silent-offset/invisible-label failure modes.
evidence: S043 lines 473-507, S003 lines 454-466, S048 lines 652-660

### B-052
decision: not_a_claim
reason: Proposed future check, not a factual claim.

### B-053
decision: not_a_claim
reason: Item heading quoting the Plan with no proposition of its own.

### B-054
decision: confirm
basis: supported
reason: Plan L5 names dimensions/units/coordinates without the dataset+top-level transform combination, axes order, UDUNITS units, dimension_names match, or translation handling the corpus requires, so "correction" is right.
evidence: plan/Viewer.md line 5, S003 lines 166-174, S003 lines 308-316

### B-055
decision: confirm
basis: supported
reason: Coordinates combine per-dataset with top-level transforms in axes order with UDUNITS space/time units, dimension_names must match axes, translations must at least not break rendering, and inconsistent units need a display rule per the napari precedent.
evidence: S003 lines 166-174, S003 lines 308-316, S043 lines 318-350, S043 lines 362-392, S043 lines 394-428, S048 lines 249-258, S054 lines 10-40, S011 lines 158-159

### B-056
decision: confirm
basis: supported
reason: Per-axis pixel size, units, and calibrated cursor positions from the active level's combined transform follow from the spec rules, and ignoring top-level transforms or translations repeats attested viewer bugs.
evidence: S003 lines 308-316, S043 lines 362-365, S043 lines 394-428

### B-057
decision: not_a_claim
reason: Proposed future check, not a factual claim.

### B-058
decision: not_a_claim
reason: Item heading quoting the Plan with no proposition of its own.

### B-059
decision: confirm
basis: supported
reason: Plan L7 already specifies background reads with cancel (covered) while the corpus adds the memory-bounding strategy question the Plan does not settle, so "covered, with product_choice on bounding strategy" is right.
evidence: plan/Viewer.md line 7, S117 lines 101-128, S034 lines 67-83

### B-060
decision: qualify
basis: supported
reason: The corpus attests the explicit pre-load dialog and the TB-scale need, but automatic background/cancel is Plan-specified, not corpus-proven; no corpus source demonstrates background loading with cancellation.
evidence: plan/Viewer.md line 7, S117 lines 101-128, S034 lines 67-83, S061 lines 39, S043 lines 207-238, S018 lines 404-439
replacement:
<<<
- F7 constraint (corrected): the Plan specifies automatic background reads with cancellation of stale work (Plan L7); the corpus proves the complementary explicit strategy, an AGAVE-style pre-load dialog with resolution/channel/sub-region choice and memory estimate (S117 lines 101-128), and proves the need, since TB-scale plates and 21-66 GB images (S034 lines 67-83) make unbounded eager loads infeasible, remote reads without pyramid discipline are unusably slow (S061 line 39), and full-resolution stitched canvases crash or zero-fill (S043 lines 218-220; S018 lines 425-439). No corpus source demonstrates background loading with cancellation in an implementation; that half of the constraint rests on the Plan alone. Conditions: local datasets up to TB-scale plates. Plan fit: covered (Plan L7 behavior kept) with product_choice on the bounding strategy (automatic vs explicit vs hybrid low-res-first). Consequence: keep Plan background/cancel and add a bounding rule so the large-dataset acceptance case cannot OOM or freeze. Validation idea: open the largest acceptance fileset under profiling during pan/zoom/channel flips and check interaction latency, peak memory, and observable dropping of stale requests.
>>>

### B-061
decision: confirm
basis: supported
reason: Keeping specified background/cancel and adding a bounding rule is the direct consequence of the Plan text plus the attested scale hazards.
evidence: plan/Viewer.md line 7, S034 lines 67-83, S117 lines 101-109

### B-062
decision: not_a_claim
reason: Proposed future check, not a factual claim.

### B-063
decision: not_a_claim
reason: Item heading quoting the Plan with no proposition of its own.

### B-064
decision: confirm
basis: supported
reason: Plan L7 requires explanatory failures without enumerating any failure modes, while the corpus attests a full taxonomy, so "correction" is right.
evidence: plan/Viewer.md line 7, S038 line 58, S053 lines 22-25, S016 lines 324-330

### B-065
decision: qualify
basis: supported
reason: The taxonomy rows check out except mixed v04/v05, which is attested only for writes; the read-path counterpart is format detection with a version-mismatch warning.
evidence: S003 lines 150-156, S058 lines 309-329, S053 lines 22-25, S053 lines 196-217, S003 line 174, S025 lines 81-86, S038 line 58, S016 lines 324-351, S018 lines 425-439, S027 lines 269-270, S048 lines 698-699, S018 lines 598-600, S013 lines 157-164, S019 lines 58-66, S014 lines 139-143
replacement:
<<<
- F8 constraint (corrected): attested failure taxonomy: 0.4 fileset in 0.5 scope (S058 lines 309-329); version missing/inconsistent within a hierarchy (S003 lines 150-156); absent multiscales/plate/well keys ("no metadata found," S038 line 58); schema violations of counts, required keys, and vector lengths (S053 lines 22-25, 126-150, 196-265); dimension_names mismatch (S003 line 174); unsupported codec/shard incl. silent no-chunks (S038 line 58); unsupported dtype outside the declared matrix (S025 lines 81-86; S096 lines 25-28); transform violations of exactly-one-scale-first and vector lengths (S016 lines 324-351; S003 lines 308-312); missing wells/fields zero-filled by the reference (S018 lines 425-439, 540-558); unlisted-vs-unreadable labels (S027 lines 269-270); non-multiscale entry with no matching spec (S048 lines 698-699; S018 lines 598-600); and corrupt chunk rendering (S014 lines 139-143). Mixed v04-group-with-v05-format rejection is attested only for writes (S013 lines 157-164); the read-path row must read "detected/requested version mismatch" per the detection-and-warning behavior (S019 lines 58-66). Conditions: local 0.5 scope. Plan fit: correction to Plan L7 (failure explanation). Consequence: errors name node, violated rule, and recovery action; silent ignore and silent no-chunks are known bad behaviors. Validation idea: feed one malformed fixture per row and check each message names node + rule + next action with the browser still usable.
>>>

### B-066
decision: confirm
basis: supported
reason: Naming node, rule, and recovery follows from the Plan's explanation requirement, and silent ignore / silent no-chunks are attested bad behaviors in both readers.
evidence: plan/Viewer.md line 7, S018 lines 593-600, S038 line 58

### B-067
decision: not_a_claim
reason: Proposed future check, not a factual claim.

### B-068
decision: not_a_claim
reason: Item heading quoting the Plan with no proposition of its own.

### B-069
decision: confirm
basis: supported
reason: Plan L9 requires interop without defining any decode matrix, while the corpus supplies codecs, dtypes, drift, and converter quirks, so "correction" is right.
evidence: plan/Viewer.md line 9, S055 lines 16-58, S033 lines 157-162, S052 line 128

### B-070
decision: confirm
basis: supported
reason: Interop spans sharding_indexed with blosc/gzip/zstd/null codecs and full option ranges, arbitrary chunk grids, declared dtype coverage against spec-vs-renderer gaps, 2024-2026 behavior drift, and converter hierarchy/marker quirks.
evidence: S055 lines 16-58, S033 lines 157-200, S003 lines 68-72, S025 lines 81-86, S096 lines 25-28, S003 lines 437-439, S052 line 128, S052 line 300, S033 lines 228-325, S034 lines 43-46, S013 lines 182-186

### B-071
decision: confirm
basis: supported
reason: Publishing and testing an explicit matrix with loud out-of-matrix failures follows from the attested renderer bounds and silent-failure precedents.
evidence: S025 lines 81-86, S038 line 58, S055 lines 16-58

### B-072
decision: not_a_claim
reason: Proposed future check, not a factual claim.

### B-073
decision: not_a_claim
reason: Item heading quoting the Plan with no proposition of its own.

### B-074
decision: confirm
basis: supported
reason: Brief, Plan, and the resave no-modification guarantee agree on read-only behavior with nothing to correct, so "covered" is right.
evidence: plan/Viewer.md line 9, brief.md lines 3-5, S034 lines 154-156

### B-075
decision: confirm
basis: supported
reason: Local read-only opening with session-scoped settings matches brief and Plan, and the challenge resave flow explicitly guarantees input is not modified.
evidence: brief.md lines 3-5, plan/Viewer.md line 9, S034 lines 154-156, S031 lines 1-6

### B-076
decision: confirm
basis: supported
reason: Enforcing read-only handles and session settings with no fileset writes follows directly, and the absolute-path settings trap is documented in the AGAVE docs.
evidence: S034 lines 154-156, S108 line 27

### B-077
decision: not_a_claim
reason: Proposed future check, not a factual claim.

### B-078
decision: not_a_claim
reason: Item heading quoting the Plan with no proposition of its own.

### B-079
decision: confirm
basis: supported
reason: Brief and Plan both exclude these areas with nothing to correct, so "covered" is right.
evidence: plan/Viewer.md line 9, brief.md lines 3-5

### B-080
decision: confirm
basis: supported
reason: Both scope documents exclude editing/export/remote/interpretation, and the remote-read performance case stays out of scope even where reading code overlaps.
evidence: brief.md lines 3-5, plan/Viewer.md line 9, S061 lines 39

### B-081
decision: confirm
basis: supported
reason: Refusing remote URLs and interpretation with a scope message while leaving local browsing intact is the direct consequence of the exclusions.
evidence: brief.md lines 3-5, plan/Viewer.md line 9

### B-082
decision: not_a_claim
reason: Proposed future check, not a factual claim.

### B-083
decision: not_a_claim
reason: Item heading quoting the Plan with no proposition of its own.

### B-084
decision: confirm
basis: supported
reason: Plan L11 says "representative filesets" without defining coverage, while the corpus demands a fixture matrix spanning layouts, transforms, codecs, and negatives, so "correction" is right.
evidence: plan/Viewer.md line 11, S034 lines 67-83, S031 lines 1-6

### B-085
decision: confirm
basis: supported
reason: Each matrix axis (dimensionality, sparse plates, bioformats2raw, labels variants, Z/non-2 pyramids, translations, top-level transforms, multi-multiscales, sharding/codecs, 0.4 negative, malformed battery, validator pre-check, sized large case) is grounded in the cited corpus rows.
evidence: S003 lines 296-316, S056 lines 10-67, S003 lines 261-275, S003 lines 437-466, S043 lines 2-13, S043 lines 80-89, S043 lines 362-392, S043 lines 394-428, S043 lines 277-316, S055 lines 16-58, S058 lines 309-329, S031 lines 1-6, S034 lines 67-83

### B-086
decision: confirm
basis: supported
reason: A fixture matrix with per-cell oracles follows from the breadth of attested variability; no single happy-path fileset can cover it.
evidence: S034 lines 67-83, S031 lines 1-6, S043 lines 2-13

### B-087
decision: not_a_claim
reason: Proposed future check, not a factual claim.

### B-088
decision: not_a_claim
reason: Subsection heading with no proposition.

### B-089
decision: confirm
basis: supported
reason: RO-Crate top-level metadata (organism/modality recommended, name/description suggested) is documented for challenge conversions, making it a genuinely optional display enrichment.
evidence: S034 lines 43-46, S034 lines 190-205

### B-090
decision: confirm
basis: supported
reason: The reference reader loads a present-but-unspecified zarr array as raw data and otherwise yields nothing, grounding a raw-fallback-with-notice option.
evidence: S018 lines 593-600

### B-091
decision: qualify
basis: supported
reason: The spec's user-choice rule and the survey's near-total non-support check out, but "zero surveyed viewers" inherits the P16 OMERO ambiguity (all images imported, corrupted sample, no supported field).
evidence: S003 lines 388-397, S043 lines 277-316
replacement:
<<<
- O-C3 (corrected). Multi-multiscales choice UI implementing the spec's user-choice-by-name rule with first-as-fallback (S003 lines 388-397). Ten surveyed viewers report supported:no and three fail to open the sample, while OMERO ambiguously reports all images imported with a corrupted sample (S043 lines 277-316), so support is at best one ambiguous case out of eleven. Conditions: image groups with >1 multiscale entry. Plan fit: optional capability, adopt only with review; extends F1's first-default rule. Consequence: offer the choice without crashing where the reference readers silently use multiscales[0] (S018 lines 279-283; S048 lines 201, 237). Validation: open the multi-multiscales sample without crashing and offer the choice.
>>>

### B-092
decision: confirm
basis: supported
reason: Translation-aware alignment vs ignore-safely is a real fork: only napari applies dataset translation while vizarr breaks visibly and others ignore it.
evidence: S043 lines 352-392

### B-093
decision: confirm
basis: supported
reason: The napari reader composes scale/translation/rotation/affine/sequence into one Affine with warn-and-skip for unknown types, beyond the 0.5 datasets allowance of scale+translation, grounding a tolerance option.
evidence: S048 lines 81-133, S003 lines 308-313

### B-094
decision: confirm
basis: supported
reason: The spec allows arbitrary per-label properties and the napari reader builds an inspectable properties table with index, grounding hover/inspect display.
evidence: S003 lines 467-471, S048 lines 628-650, S027 lines 173-177

### B-095
decision: confirm
basis: supported
reason: Traversal plus served CSV/Folders-tree browsing with thumbnails and copy-URL is the shipped finder behavior, making it a real optional pattern for multi-fileset directories.
evidence: S023 lines 150-154, S017 lines 6-8

### B-096
decision: confirm
basis: supported
reason: Channel transfer-function controls (Pct-Min sliders, exposure, per-channel show/hide) and ROI clipping are documented AGAVE/Vol-E-family behavior beyond visibility toggles.
evidence: S108 lines 15-27, S062 lines 7-15

### B-097
decision: not_a_claim
reason: Subsection heading with no proposition.

### B-098
decision: confirm
basis: supported
reason: The three navigation models are all corpus-grounded (vizarr drill-down, reference stitched grids, implicit flat listing) with attested trade-offs, so this is a genuine undecided choice.
evidence: S043 lines 213-224, S018 lines 404-439, S018 lines 478-527

### B-099
decision: confirm
basis: supported
reason: Split-per-channel layers and blended composites are both attested (napari splitting vs Viv composites), so rendering architecture is genuinely open.
evidence: S048 lines 204-213, S025 lines 81-82, S117 lines 118-122

### B-100
decision: confirm
basis: supported
reason: Fully automatic choice (Plan), explicit choice with estimate (AGAVE dialog), and hybrid low-res-first are all grounded and distinct, so the UX choice is genuine.
evidence: plan/Viewer.md lines 5-7, S117 lines 101-128

### B-101
decision: confirm
basis: supported
reason: Strict schema validation and permissive-with-notice (v0.19 spatial-data precedent) are both attested postures with different outcomes, so the choice is genuine.
evidence: S053 lines 22-25, S052 line 128, S016 lines 324-351

### B-102
decision: confirm
basis: supported
reason: Labels-only vs general multi-image overlay is a genuine scope fork: the survey shows 3/11 support general overlays while labels are a spec-defined narrower case.
evidence: S043 lines 473-507, S003 lines 431-456

### B-103
decision: not_a_claim
reason: Subsection heading with no proposition.

### B-104
decision: confirm
basis: supported
reason: General multi-image overlay is supported by only 3 of 11 surveyed viewers and appears nowhere in the format obligations, so "minority capability, not obligation" is correct.
evidence: S043 lines 473-507, S003 lines 294-316

### B-105
decision: confirm
basis: supported
reason: Brief and Plan both explicitly exclude remote storage, export, editing, and clinical interpretation.
evidence: brief.md lines 3-5, plan/Viewer.md line 9

### B-106
decision: confirm
basis: supported
reason: Scene/coordinateSystems graph traversal exists in the napari code and v0.6-era release notes but not in the 0.5 spec, so it is correctly excluded from 0.5 obligations.
evidence: S048 lines 402-495, S052 line 128, S003 lines 294-316

### B-107
decision: confirm
basis: supported
reason: The v3/0.5 column of the converter codec table lists null/blosc/gzip/zstd without zlib, and the table governs the converter, not the format.
evidence: S033 lines 157-162

### B-108
decision: not_a_claim
reason: Subsection heading with no proposition.

### B-109
decision: confirm
basis: supported
reason: The contradiction is real and unresolved in the corpus: the draft PR moves labels registration into the multiscale group while the released spec keeps the labels list in the labels-group zarr.json.
evidence: S004 lines 149-157, S003 lines 441-450

### B-110
decision: confirm
basis: supported
reason: The only corpus record of permissive-0.5 is a one-line release note ("be more permissive with version 0.5, allowing support for spatial-data ome zarrs", PR594) with no acceptance details, so the question is correctly unresolved.
evidence: S052 line 128

### B-111
decision: confirm
basis: supported
reason: The compressor-vs-codecs evidence covers only the write path (v2 kwarg rejected on v3 writes), leaving read-path spelling acceptance correctly unresolved.
evidence: S013 lines 166-186

### B-112
decision: confirm
basis: supported
reason: The corpus shows the default reader ignoring transforms and the new reader listing coordinateTransformations as TODO, but never states the fixed combination, so this is correctly unresolved.
evidence: S011 lines 158-159, S027 lines 175-178, S048 lines 260-291

### B-113
decision: confirm
basis: supported
reason: The corpus gives examples (scales, sharding, sparse plates, XML parsing, dtype lists, custom hierarchies) but no frequency data for any listed phenomenon, so this is correctly unresolved.
evidence: S054 lines 31-74, S055 lines 16-58, S056 lines 68-73, S048 lines 348-365, S025 lines 81-86, S033 lines 228-325

### B-114
decision: confirm
basis: supported
reason: Each listed gap is attested as open at capture (PR123 TODOs, vizarr #307 open with no root cause, neuroglancer single-shard silence, Vol-E undescribed for 0.5, AGAVE out-of-switch dtypes) with no resolving evidence in the checked sources.
evidence: S027 lines 175-178, S014 lines 126-143, S038 line 58, S062 lines 11-15, S096 lines 25-28

### B-115
decision: confirm
basis: supported
reason: The validator source describes only a web page with sample links and a schemas override, never its rule list, so metadata-only vs codec/shard coverage is correctly unresolved.
evidence: S031 lines 1-15

### B-116..B-121
decision: not_a_claim
reason: Section heading plus the author's process record of deferred reading; bookkeeping, not corpus claims.

### B-122..B-128
decision: not_a_claim
reason: Section heading plus the author's coverage record of what was read or not; bookkeeping, not corpus claims.

### B-129
decision: confirm
basis: supported
reason: The build order faithfully sequences the report's own corrected findings (discovery/taxonomy before decode matrix before axes-driven navigation before bounding/acceptance, optionals last) and follows corpus dependencies.
evidence: S003 lines 120-156, S055 lines 16-58, S003 lines 296-316, S034 lines 67-83

