# Decisions (independent verification)

### B-001
decision: confirm
basis: supported
reason: Scope matches the brief (local read-only desktop browser for OME-Zarr 0.5); the remaining sentences are method framing consistent with the case inputs.
evidence: brief.md lines 1-5, plan/Viewer.md lines 1-11

### B-002..B-003
decision: not_a_claim

### B-004
decision: confirm
basis: supported
reason: S003 states Zarr v3 only with all Zarr features allowed unless disallowed, and ome-namespaced version metadata consistent within a hierarchy.
evidence: S003 lines 68-72, S003 lines 150-156

### B-005
decision: confirm
basis: supported
reason: Axes range/order, dimension_names match, largest-first datasets, exactly-one-scale plus optional translation after it with axes-length vectors, and top-level transforms applied after per-dataset ones are all in S003; arbitrary level names are confirmed by the WEBKNOSSOS doc.
evidence: S003 lines 296-316, S003 lines 173-174, S058 lines 320-323

### B-006
decision: confirm
basis: supported
reason: S003 makes omero optional with required channels/color/window{min,max,start,end}; rdefs/active/label appear as display defaults in the spec example and both readers consume them.
evidence: S003 lines 401-430, S018 lines 335-388, S048 lines 293-335

### B-007
decision: confirm
basis: supported
reason: Every element (labels-group container, metadata-free intermediates, 8-member integer dtype set, SHOULD-listed labels array, multiscales with equal level count, SHOULD image-label with colors/version plus optional properties and source.image default ../../) is in S003.
evidence: S003 lines 431-474

### B-008
decision: confirm
basis: supported
reason: S003 defines the plate/row/well/field hierarchy with the stated strict plate and well keys, requires full row/column extent even when wells are undefined, and the sparse-plate example matches S056.
evidence: S003 lines 118-129, S003 lines 530-560, S003 lines 744-752, S056 lines 10-73

### B-009
decision: qualify
basis: supported
reason: The precedence and SHOULD claims are correct, but the layout value is the string "3" in S003, not the bare number 3.
evidence: S003 lines 256-275
replacement:
<<<
- P6 (corrected). `bioformats2raw.layout` transitional packaging: conforming groups MUST carry the string value "3" for the `bioformats2raw.layout` key in top-level OME-Zarr metadata (S003 lines 256-257). Image discovery precedence: plate locations when plate metadata is present (with SHOULD-provided series for unaware tools), else the OME-group `series` path list ordered to match OME-XML Image elements, else consecutively numbered groups `0,1,2...` (S003 lines 261-270). Conforming readers SHOULD make users aware of more than one image rather than defaulting to the first (S003 lines 271-272). Conditions: version 0.5 transitional collections, typically bioformats2raw conversions. Plan fit: F1 discovery (Plan L5) must implement this precedence instead of a flat list. Consequence: the browser must surface all series images with hierarchy-aware navigation. Validation idea: open a multi-series bioformats2raw fixture plus a plate-carrying one and check listed images and order against the validator.
>>>

### B-010
decision: confirm
basis: supported
reason: The v2->v3 break, the v2 marker files vs zarr.json with flat vs ome-namespaced attrs, and the 0.5.1/0.5.2 clarifications are all attested in the cited sources.
evidence: S003 lines 68-72, S003 lines 824-833, S034 lines 43-44, S058 lines 301-310, S043 lines 261-264, S019 lines 87-90

### B-011
decision: not_a_claim

### B-012
decision: confirm
basis: supported
reason: PR404 read-only on zarr v3 (Nov 2024), PR413 write-by-default merged Aug 2025 and released as v0.12.0, v0.15 deprecations/download fix, v0.16 sharding, and v0.19 permissive-0.5/scene/plain-string-codec handling are all attested; the May-2025 no-write snapshot predates v0.12.0.
evidence: S008 lines 139-150, S013 lines 128-157, S052 lines 128, S052 lines 300, S052 lines 343, S052 lines 558, S016 lines 368-384

### B-013
decision: confirm
basis: supported
reason: Each behavior is in the cited code: ome unwrap, exactly-one-scale-first with at most one translation and ndim-matched numeric vectors, multiscales[0]-only reads, silent omero/contrast degradation, zero-filled well/plate stitching, and raw-array-or-ignore fallback.
evidence: S019 lines 87-90, S016 lines 296-366, S018 lines 279-299, S018 lines 335-391, S018 lines 404-439, S018 lines 537-567, S018 lines 593-600

### B-014
decision: qualify
basis: supported
reason: Rotation/affine/sequence transforms are composed into the Affine, not warn-and-skipped; warn-and-skip applies only to unknown transform types.
evidence: S048 lines 81-126, S048 lines 672-699, S048 lines 204-213, S048 lines 707-716, S027 lines 150-159, S011 lines 163-165
replacement:
<<<
- P10 (corrected). napari-ome-zarr (post-PR123, merged, direct zarr v3 without the ome-zarr dependency; S027 lines 128-159, S011 lines 163-165) dispatches entry points as Labels/Label walk-up to the parent image, then Bioformats2raw, Multiscales, Plate, Scene by attrs, printing "No matching spec" and returning nothing on no match (S048 lines 664-699). It splits image channels into per-channel layers via channel_axis while labels keep every axis in a single layer (S048 lines 204-213, S048 lines 580-584), pops any label channel_axis and squeezes the dask data per level (S048 lines 707-716), and hides labels by default (S048 lines 652-659). Transform handling composes scale/translation/rotation/affine/sequence into one Affine (sequences flattened first); only unknown transform types warn and skip (S048 lines 81-126). Conditions: napari-ome-zarr reader code at capture, scene/v0.6-era forward compat included. Plan fit: informs F1 discovery dispatch, F3 channel layers, and F5 overlay defaults (Plan L5). Consequence: Slide Scout can follow the same dispatch/split/hide-by-default rules but must replace silent no-match empties with explicit errors and decide how to treat non-scale/translation transforms. Validation idea: open Multiscales/Plate/Bioformats2raw/Labels/Scene entry points including a bare labels subgroup, plus one fixture each with rotation, affine, sequence, and an unknown transform type, and record layers, visibility, and messages.
>>>

### B-015
decision: qualify
basis: supported
reason: The <=4 concurrent channels and time slider come from the older TIFF/CZI-era HELP.txt, not the OME-Zarr load-settings doc, which the draft does not disclose.
evidence: S072 lines 1-3, S096 lines 8-10, S096 lines 25-28, S098 lines 204-262, S117 lines 94-135, S108 lines 4-29
replacement:
<<<
- P11 (corrected). AGAVE is a desktop app reading local OME-Zarr 0.4 and 0.5 (S072 lines 1-3) on a tensorstore v0.1.78 backend (S096 lines 8-10). Its OME-Zarr Load Settings dialog offers explicit resolution-level, time, channel-exclusion, and X/Y/Z sub-region choice with a GPU-memory estimate before loading (S117 lines 94-135). The <=4 concurrently displayed channels and the time slider are documented only in the older TIFF/CZI-era HELP.txt (S108 lines 17, 29), so they must not be cited as OME-Zarr load behavior without that caveat. Its reader branches metadata lookup on the zarr version (v3 reads zarr.json attributes.ome, erroring when absent; v2 reads flat attrs) with zarr3 vs zarr driver names, counts scenes as multiscales.size(), and assumes a fixed T,C,Z,Y,X dimorder (S098 lines 204-262), the last being a correctness risk for 2D/3D/4D or custom-axis 0.5 data. Its VolumeDimensions dtype switch handles int32/uint16/uint8/float32 (S096 lines 25-28). Conditions: AGAVE at the captured commit/docs. Plan fit: informs F2 level choice, F3 channel controls, and F7 bounding strategy (Plan L5/L7). Consequence: explicit pre-load bounding with a memory estimate is a proven alternative to fully automatic loading, and dtype coverage must be declared explicitly. Validation idea: load a multichannel 0.5 volume plus a 2D/custom-axis fixture in AGAVE, record dialog options, memory estimate, and rendered dims/dtypes, and compare against Slide Scout behavior.
>>>

### B-016
decision: confirm
basis: supported
reason: The v3/0.5 codec table, TCZYX default with deprecated dimension-order, 256px/factor-2 defaults with overrides, and hierarchy/marker-altering options are all in the bioformats2raw README capture.
evidence: S033 lines 107-122, S033 lines 157-200, S033 lines 219-256, S033 lines 311-337

### B-017
decision: confirm
basis: supported
reason: Each observed fileset matches its cited source: czyx IDR scales with micrometer space units and unitless channel, sharded blosc/zstd uint16 array with dimension_names, 6x11 plate with 49 wells and field_count 32, conversions with optional sharding plus RO-Crate sidecars, and 589 MB to 1.0 TB sizes.
evidence: S054 lines 1-52, S055 lines 16-64, S056 lines 10-73, S056 lines 71-311, S034 lines 43-46, S034 lines 67-83

### B-018
decision: not_a_claim

### B-019
decision: qualify
basis: supported
reason: The auto-sharding crash is a write-path-only ome-zarr-py bug report, not a rendering/decoding failure on valid-looking 0.5 data, so the block's framing overstates it.
evidence: S014 lines 139-143, S038 lines 58, S011 lines 151-157, S013 lines 166-186, S044 lines 126-183
replacement:
<<<
- P14 (corrected). Attested viewer/dependency failures on 0.5-era data: vizarr repetitive-chunk rendering of a 3-channel uint16 resave-converted bioformats2raw-group-0 image while the 0.4 original rendered correctly (S014 lines 139-143); neuroglancer "Neither array nor OME multiscale metadata found" on a challenge 0.5 fileset plus a vanilla sharded v3 array exposing dimensions but loading no chunks with no failed requests (S038 line 58); napari-ome-zarr 0.6.1/ome-zarr 0.10.3 pinned to zarr<3 conflicting with bioio-ome-zarr 3.x requiring zarr>=3 (S011 lines 151-157); and the zarr v3 API rejecting the legacy v2 `compressor` kwarg on writes in favor of bytes-to-bytes codecs (S013 lines 166-186). Separately, ome-zarr-py issue #640 (Aug 2026) reports a write-path-only crash (ValueError via dask rechunk) when write_image is given shards="auto" (S044 lines 126-183); it is evidence of ecosystem immaturity, not of a viewer decode failure. Conditions: as captured; resave/vizarr/neuroglancer versions per cited issues. Plan fit: F8 failure taxonomy and F9 decode matrix (Plan L7/L9) must cover the viewer/decode items; the auto-shard item needs no viewer handling beyond noting writer-side risk. Consequence: Slide Scout must validate chunk/shard rendering against known-good views and explain no-chunks states instead of going silent. Validation idea: render the resave-converted and sharded fixtures next to known-good views and record chunk alignment plus the message shown for undecodable arrays.
>>>

### B-020
decision: confirm
basis: supported
reason: The 7/11 dataset-scale, napari-only translation with vizarr image-disappears and WEBKNOSSOS fails-to-open, 4/11 top-level-scale, vizarr/avivator Z-downsample and non-2-factor failures, and default-napari scale ignorance are exactly as surveyed.
evidence: S043 lines 1-35, S043 lines 80-109, S043 lines 318-350, S043 lines 352-392, S043 lines 394-428, S011 lines 158-159

### B-021
decision: qualify
basis: supported
reason: OMERO has no supported:no verdict on the multi-multiscales sample and notes all images imported with corruption, so "no surveyed viewer opens beyond multiscales[0]" overstates the matrix.
evidence: S043 lines 277-316, S027 lines 269-270, S048 lines 348-365, S003 lines 261-270, S004 lines 149-157, S003 lines 441-450
replacement:
<<<
- P16 (corrected). Discovery ambiguities are real. On the multi-multiscales sample, ten surveyed viewers record supported:no for opening beyond multiscales[0], with BigDataViewer/MoBIE failing (ArrayIndexOutOfBounds) and WEBKNOSSOS failing to open (non-unique mags); OMERO records no supported verdict and notes "All images imported but sample image is corrupted" (S043 lines 277-316). Label listings can be missing while label groups exist, and a Dec-2024 models discussion records that the spec text under-defines what a "labels object" must be (S027 lines 269-270; S048 lines 519-527). Bioformats2raw discovery has competing rules: the spec's series/numbered-group logic (S003 lines 261-270) vs napari-ome-zarr parsing OME/METADATA.ome.xml Image IDs (S048 lines 348-365). PR206's proposal to move labels registration into the multiscale group (S004 lines 149-157) contradicts the released spec, which keeps the labels list in the labels-group zarr.json (S003 lines 441-450). Conditions: features matrix at capture (v0.4-era samples); napari code at capture. Plan fit: F1 discovery and F8 error taxonomy (Plan L5/L7). Consequence: the viewer must union labels listings with directory probing, choose a robust bioformats2raw rule, and open multi-multiscales groups without crashing. Validation idea: open the multi-multiscales sample, a labels-unlisted labels group, and XML-less bioformats2raw fixtures, recording listed content and messages.
>>>

### B-022
decision: qualify
basis: supported
reason: "Exactly one proven low-risk pattern" is a judgment that hides MoBIE's unexplained plate support, and the corpus does not attribute napari's zoom crash to full-resolution stitched canvases.
evidence: S043 lines 207-238, S018 lines 404-439, S018 lines 537-567
replacement:
<<<
- P17 (corrected). Attested HCS-at-scale behaviors: vizarr shows only the lowest plate resolution with per-well drill-down into a new window (S043 lines 213-215); napari's plate support loads but is noted to crash on zooming in, with no cause given in the matrix (S043 lines 218-220); MoBIE records supported:yes for plates with no pattern detail (S043 lines 223-224); ome-zarr-py stitches wells into an almost-square lazy grid and plates into a full grid, substituting zeros for missing/failed tiles (S018 lines 404-439, S018 lines 537-567). Conditions: features matrix at capture (v0.4 plate sample); ome-zarr-py reader at commit 94eaf20. Plan fit: F1 navigation and F7 responsiveness (Plan L5/L7). Consequence: treat vizarr-style overview plus drill-down as the only corpus-detailed low-risk pattern, avoid presenting zero-filled stitched canvases as complete data, and verify zoom stability on a sparse-plate fixture rather than assuming napari's crash cause. Validation idea: open the sparse-plate fixture at low resolution, drill into one well/field, and record time-to-first-field, zoom stability, and how missing wells/fields are shown.
>>>

### B-023
decision: not_a_claim

### B-024
decision: confirm
basis: supported
reason: The merged finder PR's traversal/CSV/BioFile-Finder behavior with Folder-tree browsing, thumbnails, and copy-URL, and its v2-only (.zattrs) scope with v3 deferred, match S023 including the April-2025 merge date.
evidence: S023 lines 128-154, S023 lines 439-450

### B-025
decision: confirm
basis: supported
reason: S031 documents the validator page and sample catalog, S034 links every challenge sample through the ?source= validator pattern, and reader PRs point at the validator as the first check.
evidence: S031 lines 1-14, S034 lines 67-85, S008 lines 156-158

### B-026
decision: qualify
basis: supported
reason: Neither dtype source is a published matrix: Vizarr/Viv gives a supported-dtype list and AGAVE's is a four-case switch in code, so "publish explicit dtype matrices" overstates both.
evidence: S025 lines 81-86, S096 lines 25-28, S117 lines 94-135, S058 lines 385-389
replacement:
<<<
- P20 (corrected). Bounded precedents exist for hard choices, with exact shapes: Vizarr/Viv publishes a supported-dtype list (int8/16/32, uint8/16/32, float32/64) in its README (S025 lines 81-86); AGAVE's bound is a four-case dtype switch (int32/uint16/uint8/float32) in VolumeDimensions code (S096 lines 25-28), not a published matrix; AGAVE publishes an explicit memory-bounding Load Settings dialog (resolution/channel/sub-region choice plus GPU-memory estimate, S117 lines 94-135); WEBKNOSSOS publishes chunk/shard tuning guidance (32-128 voxel chunks, sharding for Zarr 3+, 3D downsampling, S058 lines 385-389). Conditions: captures as cited. Plan fit: F7 bounding and F9 supported/unsupported matrix (Plan L7/L9). Consequence: Slide Scout should publish its own explicit dtype/coverage matrix and bounding rule rather than implying parity with these differently-shaped precedents. Validation idea: draft the Slide Scout matrix and dialog, then check each claimed cell against one fixture and record open/render/explain outcomes.
>>>

### B-027
decision: not_a_claim

### B-028
decision: confirm
basis: supported
reason: The quote matches Plan L5 verbatim.
evidence: plan/Viewer.md line 5

### B-029
decision: confirm
basis: supported
reason: Plan L5's flat image list omits the hierarchy, precedence, version-branching, and multi-multiscales rules attested in S003 and the readers, so correction is the fitting disposition.
evidence: plan/Viewer.md line 5, S003 lines 118-129, S003 lines 256-275, S003 lines 388-397, S019 lines 87-90

### B-030
decision: qualify
basis: supported
reason: Walk-up in S048 applies only to Labels/Label roots (1-2 dirs); other entry points dispatch by attrs and non-matches print and return nothing, so "arbitrary entry-point walk-up" overstates the mechanism.
evidence: S003 lines 68-72, S003 lines 150-156, S003 lines 305-306, S003 lines 388-397, S003 lines 515-560, S003 lines 744-752, S003 lines 256-275, S003 lines 824-833, S048 lines 664-699, S048 lines 519-527, S058 lines 309-318, S013 lines 150-157
replacement:
<<<
- F1 constraint (corrected). Discovery must branch on store markers (0.5 zarr.json plus attributes.ome.version "0.5" vs 0.4 .zattrs-style markers, mixed hierarchies invalid), then follow plate wells lists, well images lists, and bioformats2raw precedence (plate locations, else OME series list, else numbered groups), union the labels listing with directory probing of labels/* groups, default to the first multiscale while offering user choice by name when several exist, and dispatch entry points by attrs with walk-up only for Labels roots (1 dir) and Label roots (2 dirs) to the parent image; anything matching no spec must produce an explicit error, replacing napari's print-and-return-nothing behavior (S003 and S048 lines 664-699 as cited above; S058 lines 309-318; S013 lines 150-157). Conditions: local 0.5 filesets including plates, bioformats2raw collections, and labels. Plan fit: corrects Plan L5 "opens a local OME-Zarr 0.5 fileset and lists the images it finds". Consequence: the finder must present hierarchy-aware navigation (fileset, plate/well/field or series, image, labels) with version-aware errors instead of a flat list. Validation idea: open five fixtures (plain image; S056-shaped sparse plate; multi-series bioformats2raw; labels group missing from the listing; 0.4 fileset) plus a bare-labels-subgroup entry point, and check the listed tree and messages against validator results.
>>>

### B-031
decision: confirm
basis: supported
reason: Hierarchy-aware navigation and version-aware errors follow directly from the plate/well/series structures and v2/v3 marker split in S003.
evidence: S003 lines 118-129, S003 lines 256-275, S003 lines 68-72, S058 lines 309-318

### B-032
decision: not_a_claim

### B-033
decision: confirm
basis: supported
reason: Both quotes match Plan L5 verbatim.
evidence: plan/Viewer.md line 5

### B-034
decision: confirm
basis: supported
reason: Plan L5 names pyramid-level choice but omits ordering, per-level scale, Z-downsampling, and codec/shard rules attested in S003 and the corpus, so correction fits.
evidence: plan/Viewer.md line 5, S003 lines 305-312, S043 lines 1-13, S043 lines 80-89, S055 lines 16-58

### B-035
decision: confirm
basis: supported
reason: Datasets-order levels, per-level scale vectors, differing z-sizes, and sharded blosc/gzip/zstd arrays with 2D-style or 3D chunking are each attested in the cited sources.
evidence: S003 lines 305-312, S054 lines 31-52, S055 lines 16-58, S034 lines 291-307, S033 lines 157-200, S058 lines 385-389, S043 lines 1-13, S043 lines 80-89

### B-036
decision: confirm
basis: supported
reason: Scale-aware selection, per-level plane counts, and a v3 codec/shard stack follow from the per-level scale, Z-downsampling, and sharding evidence; uniform-2x y/x-only assumptions break the surveyed fixtures.
evidence: S003 lines 308-312, S043 lines 1-13, S043 lines 80-89, S055 lines 16-58

### B-037
decision: not_a_claim

### B-038
decision: confirm
basis: supported
reason: The quote matches Plan L5 verbatim.
evidence: plan/Viewer.md line 5

### B-039
decision: confirm
basis: supported
reason: Plan L5 specifies the controls (covered) while omero defaults, the greyscale override, and the contrast-degradation behaviors come from the spec and readers (correction on defaults).
evidence: plan/Viewer.md line 5, S003 lines 401-430, S018 lines 335-388, S048 lines 293-335

### B-040
decision: confirm
basis: supported
reason: Omero default fields, greyscale whitening in both readers, per-channel vs wipe-all contrast degradation, fallback need, and the open split-vs-composite question are each attested.
evidence: S003 lines 401-430, S018 lines 356-388, S048 lines 293-335, S048 lines 204-213, S025 lines 81-83, S117 lines 118-123

### B-041
decision: confirm
basis: supported
reason: Working with and without omero plus per-channel degradation with notice follows from the optional-omero rule and the two readers' differing contrast-failure behaviors.
evidence: S003 lines 426-430, S018 lines 375-383, S048 lines 316-323

### B-042
decision: not_a_claim

### B-043
decision: confirm
basis: supported
reason: The quote matches Plan L5 verbatim.
evidence: plan/Viewer.md line 5

### B-044
decision: confirm
basis: supported
reason: Plan L5's fixed-sounding selectors omit axes-driven dimensionality, per-level plane counts, and rdefs defaults attested in S003 and the matrix, so correction fits.
evidence: plan/Viewer.md line 5, S003 lines 296-303, S043 lines 1-13, S003 lines 419-422

### B-045
decision: confirm
basis: supported
reason: Axes-driven 2-5D selectors with time/channel/space/custom ordering, per-level plane counts under Z downsampling, and rdefs defaultT/defaultZ initials are each attested.
evidence: S003 lines 296-303, S043 lines 1-13, S003 lines 419-422, S098 lines 254-256, S033 lines 333-337

### B-046
decision: confirm
basis: supported
reason: Showing only applicable selectors and remapping plane indices through each level's shape follow from the axes-order and Z-downsampling evidence.
evidence: S003 lines 296-303, S043 lines 1-13

### B-047
decision: not_a_claim

### B-048
decision: confirm
basis: supported
reason: The quote matches Plan L5 verbatim.
evidence: plan/Viewer.md line 5

### B-049
decision: confirm
basis: supported
reason: Plan L5 names optional label overlays but omits discovery, dtype/level-count, alignment, default-visibility, and color rules attested in S003 and napari code, so correction fits.
evidence: plan/Viewer.md line 5, S003 lines 431-474, S048 lines 519-527, S048 lines 652-659

### B-050
decision: qualify
basis: supported
reason: Napari plate-labels metadata derives from the first well/first field only, and the plate-wide label pyramid helper itself is not in the corpus, so "plate labels derive per wells/fields" is unverified as stated.
evidence: S003 lines 431-474, S054 lines 10-52, S048 lines 204-213, S048 lines 535-555, S048 lines 652-716, S043 lines 473-507
replacement:
<<<
- F5 constraint (corrected). Discover labels by listing UNION directory probing of labels/* groups; require integer dtype from the 8-member set and equal level counts with the source image; align the overlay level-to-level using each side's transforms; default the overlay to hidden with an explicit toggle; take colors from image-label colors and invent a colormap only when absent (noting that napari shows no labels at all without colors); remove the channel axis for the overlay layer; for plates, derive label metadata from the first well/first field and label data from the plate-wide lazy pyramid helper, whose per-well behavior is not verifiable here because napari plate.py is absent from the corpus (S003 lines 431-474; S048 lines 535-555, S048 lines 652-716). Conditions: 0.5 label images, single images and plates. Plan fit: corrects Plan L5 "optional overlays for associated label images". Consequence: overlay is a label-specific aligned layer, not general multi-image fusion (supported by only 3/11 surveyed viewers, S043 lines 473-507); misaligned levels or missing colors need explicit notices. Validation idea: overlay a labeled image at two pyramid levels and screenshot-diff label boundaries against the source; repeat with missing image-label colors and with a plate-labels fixture.
>>>

### B-051
decision: confirm
basis: supported
reason: Labels-only overlay scope follows from the 3/11 multi-image-overlay support, and the notice requirements follow from napari's no-colors-shows-nothing behavior and the alignment evidence.
evidence: S043 lines 473-507, S048 lines 652-659, S003 lines 454-456

### B-052
decision: not_a_claim

### B-053
decision: confirm
basis: supported
reason: The quote matches Plan L5 verbatim.
evidence: plan/Viewer.md line 5

### B-054
decision: confirm
basis: supported
reason: Plan L5 names the panel but omits transform combination, unit rules, dimension_names matching, and translation handling attested in S003 and the matrix, so correction fits.
evidence: plan/Viewer.md line 5, S003 lines 308-316, S003 lines 170-174, S043 lines 318-350, S043 lines 352-392

### B-055
decision: confirm
basis: supported
reason: Combined per-dataset plus top-level transforms, UDUNITS space/time units with the IDR channel unitless, dimension_names matching, and the translation/units display rules are each attested.
evidence: S003 lines 308-316, S003 lines 166-174, S054 lines 10-29, S043 lines 318-350, S043 lines 352-392, S043 lines 394-428, S011 lines 158-159, S048 lines 249-254

### B-056
decision: confirm
basis: supported
reason: Per-axis pixel size, units, and calibrated cursor coordinates from the combined active-level transform follow from the transform and units evidence; ignoring top-level transforms or translations repeats surveyed viewer bugs.
evidence: S003 lines 308-316, S043 lines 352-392, S043 lines 394-428, S011 lines 158-159

### B-057
decision: not_a_claim

### B-058
decision: confirm
basis: supported
reason: Both quotes match Plan L7 verbatim.
evidence: plan/Viewer.md line 7

### B-059
decision: confirm
basis: supported
reason: Plan L7 specifies background reads with cancel (covered) while the corpus adds AGAVE's explicit pre-load bounding as a genuine strategy alternative (product choice).
evidence: plan/Viewer.md line 7, S117 lines 94-135

### B-060
decision: confirm
basis: supported
reason: Plan's automatic background/cancel is explicitly attributed to the Plan, AGAVE's explicit bounding with memory estimate is attested, and the 21-66 GB images and TB-scale plates make unbounded eager loads infeasible.
evidence: plan/Viewer.md line 7, S117 lines 94-135, S034 lines 67-85, S018 lines 404-439, S043 lines 207-220, S061 lines 39

### B-061
decision: confirm
basis: supported
reason: Keeping Plan behavior while adding a stated bounding rule follows from the large-data sizes and the two attested bounding patterns.
evidence: plan/Viewer.md line 7, S034 lines 67-85, S117 lines 94-135

### B-062
decision: not_a_claim

### B-063
decision: confirm
basis: supported
reason: The quote matches Plan L7 verbatim.
evidence: plan/Viewer.md line 7

### B-064
decision: confirm
basis: supported
reason: Plan L7 names explained failures abstractly while the corpus supplies a concrete attested taxonomy, so correction fits.
evidence: plan/Viewer.md line 7, S003 lines 150-156, S003 lines 824-833, S013 lines 150-157, S038 line 58

### B-065
decision: confirm
basis: supported
reason: Each taxonomy row is attested: version/version-mismatch, missing spec keys, schema and vector violations, dimension_names, codec/shard, dtype, transforms, missing wells/fields, unlisted labels, and non-matching entries.
evidence: S003 lines 150-174, S003 lines 824-833, S058 lines 309-318, S014 lines 139-143, S013 lines 150-186, S038 line 58, S004 lines 149-157, S048 lines 672-699, S053 lines 126-266, S025 lines 81-86, S016 lines 296-366

### B-066
decision: confirm
basis: supported
reason: Naming node, rule, and recovery follows from the taxonomy evidence, and silent-ignore plus silent-no-chunks are attested bad behaviors in ome-zarr-py and neuroglancer.
evidence: S018 lines 593-600, S038 line 58

### B-067
decision: not_a_claim

### B-068
decision: confirm
basis: supported
reason: The quote matches Plan L9 verbatim.
evidence: plan/Viewer.md line 9

### B-069
decision: confirm
basis: supported
reason: Plan L9 states interop abstractly while the corpus supplies concrete decode matrices, dtype bounds, behavior drift, and converter quirks, so correction fits.
evidence: plan/Viewer.md line 9, S055 lines 16-58, S033 lines 157-200, S025 lines 81-86, S052 line 128

### B-070
decision: confirm
basis: supported
reason: Sharding plus the blosc/gzip/zstd/null codec options, arbitrary chunk grids, the 8-int-type label requirement against bounded renderer support, 2025-2026 behavior drift, and converter hierarchy/marker quirks are each attested.
evidence: S055 lines 16-58, S034 lines 43-46, S033 lines 157-200, S003 lines 68-72, S003 lines 438-439, S025 lines 81-86, S096 lines 25-28, S052 line 128, S033 lines 219-256, S033 lines 311-325, S013 lines 166-186, S058 lines 385-389, S033 lines 107-122

### B-071
decision: confirm
basis: supported
reason: Publishing an explicit matrix and failing loudly outside it follows from the attested codec/dtype/layout variety and the silent-failure counterexamples.
evidence: S033 lines 157-200, S025 lines 81-86, S038 line 58

### B-072
decision: not_a_claim

### B-073
decision: confirm
basis: supported
reason: The quote matches Plan L9 verbatim.
evidence: plan/Viewer.md line 9

### B-074
decision: confirm
basis: supported
reason: Read-only sources with session-local settings are stated in both brief and Plan, and no corpus evidence contradicts them.
evidence: plan/Viewer.md line 9, brief.md lines 3-5

### B-075
decision: confirm
basis: supported
reason: Local read-only opening with no sidecar writes is the brief/Plan rule, and the challenge resave flow explicitly states input data is not modified.
evidence: brief.md lines 3-5, plan/Viewer.md line 9, S034 lines 152-155, S031 lines 1-14

### B-076
decision: confirm
basis: supported
reason: Enforcing read-only handles with session-scoped settings follows from the brief/Plan rule, and the absolute-path settings trap is attested in AGAVE docs.
evidence: brief.md lines 3-5, plan/Viewer.md line 9, S108 lines 27

### B-077
decision: not_a_claim

### B-078
decision: confirm
basis: supported
reason: The quote matches Plan L9 verbatim.
evidence: plan/Viewer.md line 9

### B-079
decision: confirm
basis: supported
reason: The exclusions are stated in both brief and Plan, so covered is correct.
evidence: plan/Viewer.md line 9, brief.md lines 3-5

### B-080
decision: confirm
basis: supported
reason: Both brief and Plan exclude these areas, and QuPath's remote-read struggle is attested but out of scope.
evidence: brief.md lines 3-5, plan/Viewer.md line 9, S061 lines 39

### B-081
decision: confirm
basis: supported
reason: Refusing remote URLs and export with a scope message follows directly from the brief/Plan exclusions.
evidence: brief.md lines 3-5, plan/Viewer.md line 9

### B-082
decision: not_a_claim

### B-083
decision: confirm
basis: supported
reason: The quote matches Plan L11 verbatim.
evidence: plan/Viewer.md line 11

### B-084
decision: confirm
basis: supported
reason: Plan L11's single-paragraph acceptance omits the fixture variety, validator oracles, and large-case sizing the corpus shows are needed, so correction fits.
evidence: plan/Viewer.md line 11, S034 lines 67-85, S031 lines 1-14, S043 lines 1-13

### B-085
decision: confirm
basis: supported
reason: Each matrix row (dimensionality, plates, collections, labels variants, pyramid/transform edge cases, multi-multiscales, codecs/sharding, negatives, validator pre-checks, sized large case) is grounded in cited corpus evidence.
evidence: S034 lines 67-85, S031 lines 1-14, S056 lines 10-73, S003 lines 431-474, S043 lines 1-13, S043 lines 80-89, S043 lines 277-316, S055 lines 16-58, S003 lines 824-833

### B-086
decision: confirm
basis: supported
reason: A fixture matrix with per-cell oracles follows from the attested data variety and the validator's role as first check in reader PRs.
evidence: S034 lines 67-85, S031 lines 1-14, S008 lines 156-158

### B-087
decision: not_a_claim

### B-088
decision: not_a_claim

### B-089
decision: confirm
basis: supported
reason: RO-Crate sidecars with specimen/modality plus name/description flags are attested in the challenge README, and the block correctly scopes display as optional.
evidence: S034 lines 43-46, S034 lines 201-204

### B-090
decision: confirm
basis: supported
reason: ome-zarr-py's raw-array fallback with silent ignore is attested, and the block correctly scopes a noticed fallback view as optional.
evidence: S018 lines 593-600

### B-091
decision: confirm
basis: supported
reason: The spec's user-choice-by-name rule with first-multiscales fallback and the zero surveyed supporters are both attested, and the block correctly scopes the UI as optional.
evidence: S003 lines 388-397, S043 lines 277-316

### B-092
decision: confirm
basis: supported
reason: Napari-only translation support with vizarr/WEBKNOSSOS failures is attested, and the block correctly scopes alignment-vs-ignore as an optional choice.
evidence: S043 lines 352-392

### B-093
decision: confirm
basis: supported
reason: Napari composes rotation/affine/sequence beyond the 0.5 datasets allowance with warn-and-skip for unknown types, and the block correctly scopes tolerance as optional.
evidence: S048 lines 81-126, S003 lines 308-313

### B-094
decision: confirm
basis: supported
reason: Label properties arrays and napari's properties-table construction from them are attested, and the block correctly scopes hover/inspect display as optional.
evidence: S003 lines 467-474, S048 lines 628-650

### B-095
decision: confirm
basis: supported
reason: The merged finder PR's traversal plus CSV/Folders-tree browsing with thumbnails and copy-URL is attested, and the block correctly scopes it as optional.
evidence: S023 lines 150-154

### B-096
decision: confirm
basis: supported
reason: Channel intensity sliders, exposure controls, and ROI clipping are attested in the AGAVE/Vole-era docs, and the block correctly scopes them beyond visibility toggles as optional.
evidence: S108 lines 13-30, S062 lines 11-15

### B-097
decision: not_a_claim

### B-098
decision: confirm
basis: supported
reason: The three navigation options are a fair framing: vizarr's overview-plus-drill-down and napari's zoom crash are attested while zero-filled stitching argues against naive stitched canvases.
evidence: S043 lines 207-220, S018 lines 404-439, S018 lines 537-567

### B-099
decision: confirm
basis: supported
reason: Split per-channel layers (napari) and blended composites (vizarr/Viv) are both attested, so the rendering choice is genuinely open.
evidence: S048 lines 204-213, S025 lines 81-83, S117 lines 118-123

### B-100
decision: confirm
basis: supported
reason: Fully automatic choice (Plan), explicit choice with memory estimate (AGAVE), and the hybrid are fairly posed given the large-data evidence.
evidence: plan/Viewer.md lines 5-7, S117 lines 94-135, S034 lines 67-85

### B-101
decision: confirm
basis: supported
reason: Strict schema gates and the v0.19 permissive-0.5-for-spatial-data precedent are both attested, so the posture choice is genuinely open.
evidence: S053 lines 126-266, S052 line 128

### B-102
decision: confirm
basis: supported
reason: Only 3/11 surveyed viewers support multi-image overlay while label overlay is a brief requirement, so the scoping choice is fairly posed.
evidence: S043 lines 473-507, brief.md line 3

### B-103
decision: not_a_claim

### B-104
decision: confirm
basis: supported
reason: General multi-image overlay is a minority viewer capability (3/11) with no format obligation in S003.
evidence: S043 lines 473-507

### B-105
decision: confirm
basis: supported
reason: These areas are explicitly excluded by both brief and Plan.
evidence: plan/Viewer.md line 9, brief.md lines 3-5

### B-106
decision: confirm
basis: supported
reason: Scene/coordinateSystems graph traversal appears in napari code paths and v0.6-era references but nowhere in the 0.5 spec text.
evidence: S048 lines 402-495, S048 lines 219, S048 lines 273, S003 full-text search for scene|coordinateSystem with no hits

### B-107
decision: confirm
basis: supported
reason: The bioformats2raw v3/0.5 column shows no zlib while v2/0.4 shows yes, and the table governs that converter, not the format.
evidence: S033 lines 157-162

### B-108
decision: not_a_claim

### B-109
decision: qualify
basis: supported
reason: The released 0.5 text settles the actionable question (labels list lives in the labels-group zarr.json), leaving only the immaterial history of the draft proposal.
evidence: S003 lines 102-112, S003 lines 441-450, S004 lines 149-157
replacement:
<<<
- R1 (resolved as actionable). In released OME-Zarr 0.5 the labels list lives in the labels-group zarr.json ("labels" array of label-image paths; all label images SHOULD be listed), per both the layout figure and the labels section (S003 lines 102-112, S003 lines 441-450). PR206's draft proposal to move labels registration into the multiscale group (S004 lines 149-157) is not reflected in the released text. Whether that move was adopted-and-reverted or never adopted is not answerable from the corpus and is immaterial to implementation. Conditions: version 0.5. Plan fit: F1/F5 discovery (Plan L5) follows S003, treating PR206 as superseded intent. Consequence: implement labels discovery against the labels-group listing (union directory probing) and ignore the proposal. Validation idea: open a fixture whose labels-group zarr.json lists two labels and confirm both resolve.
>>>

### B-110
decision: unresolved
basis: insufficient
reason: The corpus gives only the PR594 title ("more permissive with version 0.5, allowing support for spatial-data ome zarrs") with no rule-level detail of what strict 0.5 rejects but permissive accepts.
evidence: S052 line 128, S052 line 171

### B-111
decision: unresolved
basis: insufficient
reason: Only the write-path rejection of `compressor` on zarr_format 3 is attested; no read-path evidence shows whether v3 arrays may carry either spelling.
evidence: S013 lines 166-186, corpus search for compressor across case/sources (hits only write-path or v2-era contexts)

### B-112
decision: unresolved
basis: insufficient
reason: The features matrix says napari does not read top-level scale while the post-PR123 code path combines dataset and top-level transforms but uses only the first dataset transform, leaving the applied combination genuinely contradictory.
evidence: S043 lines 394-411, S048 lines 260-291

### B-113
decision: unresolved
basis: insufficient
reason: The corpus gives examples of each phenomenon but no frequency data for translations, top-level transforms, multi-multiscales groups, custom hierarchies, non-bioformats2raw pyramids, or dtype histograms.
evidence: S054 lines 31-52, S056 lines 10-73, S043 lines 277-316, S033 lines 251-256, S025 lines 81-86

### B-114
decision: unresolved
basis: insufficient
reason: Each listed gap (PR123 TODOs in releases, vizarr #307 root cause, neuroglancer v3/shard support, Vol-E 0.5 support, AGAVE out-of-switch dtypes) has no resolving evidence in the corpus beyond its original report.
evidence: S027 lines 175-178, S014 lines 139-143, S038 line 58, S062 lines 11-15, S096 lines 25-28

### B-115
decision: unresolved
basis: insufficient
reason: The validator capture is a 16-line README describing a web page with sample links and schema overrides, saying nothing about codec/shard vs metadata-only coverage.
evidence: S031 lines 1-16

### B-116..B-121
decision: not_a_claim

### B-122..B-128
decision: not_a_claim

### B-129
decision: confirm
basis: supported
reason: The five-step build order faithfully sequences the confirmed F-block constraints, matrix-gated fixtures, and deferred optional/choice items.
evidence: plan/Viewer.md lines 5-11, S003 lines 68-72, S055 lines 16-58, S003 lines 296-316, S034 lines 67-85, S031 lines 1-14
