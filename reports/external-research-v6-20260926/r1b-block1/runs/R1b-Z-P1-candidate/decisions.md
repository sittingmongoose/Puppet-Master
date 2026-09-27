# Verifier decisions — stage1/draft-blocks.md (B-001..B-107)

Verifier: independent session. Corpus: case/sources/S001–S125 (fixed). Plan: case/plan/Viewer.md (cited as L5/L7/L9/L11).
Checked against stage1/evidence-bundle.md first, then opened case/sources/ directly wherever a quote was `not_located`, cited beyond end-of-source, or too narrow to judge scope/version. All decisions below were made on the raw source text.

### B-001..B-002
decision: not_a_claim
basis: supported
reason: Report title, scope preamble and section heading; bookkeeping. The corpus-only scope statement matches the case README.
evidence: case/README.md; case/plan/Viewer.md

### B-003
decision: confirm
basis: supported
reason: The 0.5 spec states it is defined on Zarr v3 and that all Zarr features (codecs, chunk grids, chunk key encodings, data types, storage transformers) may be used unless explicitly disallowed; the spec disallows almost nothing (the dataset-transform restriction at S003 L309 is a rare exception).
evidence: S003 lines 57-80 (esp. 67-72), S003 lines 290-327 (esp. 309)

### B-004
decision: confirm
basis: supported
reason: Metadata location in zarr.json under attributes.ome with string version and hierarchy-consistency MUST verified verbatim; image.schema requires multiscales+version; ome-zarr-py detection keys off legacy multiscales[0].version after namespace unwrap, exactly as the block says.
evidence: S003 lines 144-214 (esp. 152-156), S053 lines 14-38 (esp. 22-30), S016 lines 27-54 and 81-96 (read directly), S019 lines 79-98

### B-005
decision: confirm
basis: supported
reason: Axes rules (name required+unique, type/unit SHOULD with custom types legal, length MUST equal dimensionality, dimension_names MUST be present, 2–5 dims, ordering time→channel/custom→space with zyx only SHOULD) verified verbatim; XY-only and XYZ 0.5 samples exist in the IDR list.
evidence: S003 lines 144-214 (esp. 166-174), S003 lines 290-327 (esp. 296, 299-303), S003 lines 801-835 (0.5.2 dimension_names clarification), S010 lines 1018-1151 (XY row L1052-1059, XYZ row L1060-1068)

### B-006
decision: confirm
basis: supported
reason: multiscales is a list; dataset paths ordered highest→lowest resolution; exactly one scale per dataset (relative to level 0, default 1.0); optional translation listed after scale; group-level coordinateTransformations applied after dataset-level ones; name only SHOULD — all verified verbatim, including the choose-by-name/first-fallback reader guidance.
evidence: S003 lines 290-327 (esp. 298, 304-317), S003 lines 390-482 (esp. 388-397), S003 lines 358-397 (group-transform example, read directly)

### B-007
decision: confirm
basis: supported
reason: omero is §2.5 transitional and optional; channels/color/window MUSTs verified; rdefs described but outside the MUST sentences; real sample shows window end 1500 vs max 65535 and rdefs.defaultZ 118; bioformats2raw writes omero min/max by default with --no-minmax opt-out.
evidence: S003 lines 390-482 (esp. 398-430), S054 lines 1-120 (esp. 86-91, 109-113), S033 lines 346-359 (esp. 351-354, read directly)

### B-008
decision: confirm
basis: supported
reason: Labels rules (integer dtypes MUST, labels group lists paths, label image must be full multiscales with same level count, image-label SHOULD/MAY keys, source.image default ../../) verified verbatim; spec contributors call source.image broken and one viewer ships the labels-not-loaded-when-omero-missing bug, both located in the cited dumps.
evidence: S003 lines 390-482 (esp. 431-474), S035 line 2704, S050 line 2436

### B-009
decision: confirm
basis: supported
reason: Plate/well structure, sparse-plate norms, and the plate `version` MUST verified; the captured challenge plate (S056) demonstrably lacks both `version` and `acquisitions` inside the plate object, confirming real files violate the MUST.
evidence: S003 lines 110-137, S003 lines 507-568 (esp. 530-560), S003 lines 801-835 (well fields), S056 lines 1-320 (plate object L10-315 with no version/acquisitions keys)

### B-010
decision: confirm
basis: supported
reason: bioformats2raw.layout=3 collections, optional OME/METADATA.ome.xml and series list, consecutive-numbering fallback, and the SHOULD NOT default to first image all verified; napari's OME-XML Image-ID discovery convention confirmed in its reader.
evidence: S003 lines 144-214 and 253-282 (esp. 254-275), S048 lines 333-376 (esp. 341-365)

### B-011
decision: confirm
basis: supported
reason: JSON comment prohibition and camelCase-with-legacy-exceptions notes verified verbatim.
evidence: S003 lines 57-80 (esp. 65-66), S003 lines 801-835 (esp. 809-812)

### B-012
decision: confirm
basis: supported
reason: The flagship IDR 0.5 level-0 array is sharding_indexed (blosc/zstd inner, crc32c index, chunk 512×512 exceeding the 275×271 extent); the challenge converter shards optionally; WEBKNOSSOS writes sharded v3; auto-sharding is arriving with ome-zarr-py failing (issue #640); b2r's 0.5 codec floor is bytes+{blosc,gzip,zstd,null} little-endian — all located.
evidence: S055 lines 1-75, S034 lines 32-54 (esp. 43), S058 lines 346-362 (esp. 360), S044 lines 118-154 and 273-276 (grep-verified), S033 lines 140-205 and 346-359 (read directly)

### B-013
decision: not_a_claim
basis: supported
reason: Section heading only.
evidence: none needed

### B-014
decision: confirm
basis: supported
reason: The 0.4→0.5 break design (zarr.json, ome namespace, version moved up) is documented in PR #206; 0.4-era version placement inside multiscales[0] verified in the 0.4 spec; dual unwrap implemented in both reference readers; corpus contains 0.4 and 0.5 samples and the one 0.4 .zattrs capture is binary with no content evidence.
evidence: S004 lines 141-166 and 570-584 (grep-verified), S059 lines 349-357 (grep-verified), S048 lines 158-178 (esp. 166-170), S019 lines 79-98, S010 lines 1018-1151, S068 line 1

### B-015
decision: confirm
basis: supported
reason: Degenerate writer defaults (scale [1,1,1,1,1], no units, name-inferred types, 2D-only downsampling, invalid webknossos 0.4 output) located in the maintainer comparison; the challenge plate omits plate.version; `_creator` appears alongside ome keys in real captures.
evidence: S029 lines 293-296 and 334-336 (grep-verified), S056 lines 1-160, S054 lines 1-20

### B-016
decision: confirm
basis: supported
reason: parse_url's None-collapse is in the io.py source/docstring; the cited open-issue titles (reader not idempotent, consolidated metadata, RFC-5 group download, labels from buckets, parse_url exception request) all located in S028.
evidence: S019 lines 213-233 (read directly), S028 lines 2396, 2776, 3840, 4368, 4444, 1610 (grep-verified)

### B-017
decision: qualify
basis: supported
reason: Every failure class checks out against the features matrix, but "no tested viewer opens images beyond the first multiscales entry" overstates one row: OMERO/ZarrReader's entry says "All images imported but sample image is corrupted" (all viewers with a supported field are marked "supported: no").
evidence: S043 lines 1-36, 80-108, 207-238, 240-275, 277-316, 394-428 (read in full); S041 lines 1-28
replacement:
<<<
- **Ecosystem failure classes to design against** (ome-ngff-tools viewer matrix; samples mostly v0.4, viewer versions pinned April 2025 — S041 L2-20, S043): Z-downsampled pyramids (vizarr mis-renders — "expects the same number of Z-sections for each pyramid resolution", S043 L9-13; napari crashes on zoom, L16-17); non-2 scale factors between levels (vizarr fails, S043 L80-89); HCS plates render but crash on zoom-in (napari, S043 L218-220) or show only the lowest resolution (vizarr, L213-215); bioformats2raw collections fail or need redirects in most tested viewers (S043 L240-275); for multiple `multiscales` entries no tested viewer lists/uses images beyond the first (every viewer with a `supported` field is "supported: no", S043 L277-316), several crash hard (BigDataViewer and MoBIE: ArrayIndexOutOfBoundsException), and OMERO reported importing all images but with a corrupted sample. Group-level multiscales scale was not applied by napari-ome-zarr at test time (S043 L394-428, issue #73) — exactly the composition case of dataset-then-group transforms in S003 L304-316.
>>>

### B-018
decision: confirm
basis: supported
reason: All three 0.5-era failures located: vizarr #307 still Open with "renders chunks repetitively" for challenge-converted data; the Dec 2025 zarr 2/3 FSStore schism and napari's ignored coordinateTransformations; ome-zarr-py auto-sharding issue #640 opened Aug 31, 2026.
evidence: S014 lines 128-151, S011 lines 133-185, S044 lines 118-154 plus line 137 (grep-verified)

### B-019
decision: qualify
basis: counterevidence
reason: Two of the three cited shortcuts are verified (zarr-format→NGFF-version inference; substring-"zarr" path sniffing), but the "whitelists four dtypes (O-023, S120)" citation is beyond the end of its source: S120 contains only a "No literal matches" notice, so the four-dtype whitelist claim has no corpus support.
evidence: S082 lines 47-63 (esp. 55), S098 lines 64-85 (esp. 72-74), S120 line 1
replacement:
<<<
- **Format sniffing shortcuts exist and are fragile.** AGAVE infers NGFF version from the Zarr format version (zarrv2→0.4, zarr.json→0.5) and errors outside that assumption (S082 L55), and dispatches any directory whose path contains the substring "zarr" to its Zarr reader (S098 L72-74). Its documented pixel-intensity coverage is limited (8-bit, 16-bit unsigned, 32-bit float; S117 L45) and vizarr/Viv supports eight dtypes (S025 L84-85), so established viewers do restrict dtypes — but the corpus grep extract claiming an exact four-dtype whitelist (former cite O-023/S120) is not in evidence: S120 is a "No literal matches" placeholder. These are counterexamples to avoid, not patterns to copy: read `attributes.ome.version` (S003 L152-156) and classify nodes by metadata, not names; give an explicit unsupported-dtype message.
>>>

### B-020
decision: qualify
basis: supported
reason: Four of the five dated claims verify exactly (write-default Aug 7 2025; napari-ome-zarr 0.8.0 on 2026-05-20; ome-zarr 0.19.2 zarr>=3 on Python >=3.12; 0.6/SpatialData activity), but "0.5 read support arrived Nov 2024" is only evidenced as PR #404 being open in Nov 2024 — the corpus shows 0.10.2 (Nov 2024) still pinned zarr<3 and PR activity into mid-2025, so the release date is not pinned.
evidence: S013 lines 118-193 (grep-verified 151, 184-186), S065 lines 21-44, S015 lines 28-71, S052 v0.19.0/v0.13.0 bodies (grep-verified), S008 lines 140-171, S017 lines 1-21
replacement:
<<<
- **Tool versions matter.** ome-zarr-py's 0.5 read support came via the zarr-python v3 migration PR #404, which was open by Nov 7, 2024 (S008); the corpus does not pin its merge/release date — the Nov 2024 changelog release (0.10.2) still pinned zarr<3 and the April 2025 0.11.x entries do not list #404 (S017) — so cite the PR, not a release date. 0.5 writing merged Aug 7, 2025 and became the default CurrentFormat (S013). napari-ome-zarr 0.8.0 (2026-05-20) dropped the ome-zarr dependency and opens all bioformats2raw series images (S065). ome-zarr 0.19.2 requires zarr>=3.0.0 and Python >=3.12 (S015). The ecosystem is simultaneously preparing 0.6 scenes (S052 v0.19.0 "image class v06"/"Ready for 06"; S035 "0.6rc0 schemas") and loosening 0.5 validation for SpatialData (S052 v0.19.0). Interop claims must name producer and version because 0.5 support dates differ by a year or more across tools.
>>>

### B-021..B-022
decision: not_a_claim
basis: supported
reason: Section and subsection headings; bookkeeping.
evidence: none needed

### B-023
decision: confirm
basis: supported
reason: The correction is well-founded: the spec itself requires surfacing multiple images per fileset (b2r SHOULD NOT open only the first; plates have per-well fields; multiple named multiscales are user-selectable), so "lists the images it finds" read as one-image-per-open is too narrow.
evidence: S003 lines 253-282 (esp. 271-274), S003 lines 290-327 and 390-482 (esp. 388-397), S003 lines 110-137 and 507-568, S048 lines 656-707 (entry-point dispatch)

### B-024
decision: confirm
basis: supported
reason: Every listed content class is spec- or corpus-verified: single image, multiple named multiscales (choose by name, first fallback), sparse plates with per-well fields, b2r collections whose images SHOULD all be surfaced, labels groups as entry points (napari dispatches on them), ro-crate-metadata.json non-image content, and 2D-XY through 5D-XYZCT in the real 0.5 list.
evidence: S003 lines 290-327 and 390-482, S003 lines 110-137 and 507-568, S003 lines 144-214 and 253-282, S048 lines 656-707, S034 lines 32-54, S010 lines 1018-1151

### B-025
decision: confirm
basis: supported
reason: The first-class-discovery consequence follows directly from the verified content classes; the spec's "SHOULD NOT default to only opening the first image" and the ome-zarr finder gap (O-043) support it.
evidence: S003 lines 253-282 (esp. 271-272), S023 lines 142-165

### B-026
decision: confirm
basis: supported
reason: All fixture anchors exist in-corpus as stated (9-image b2r collection BR00109990_C2 — note the IDR row is the 0.4 copy, hedged by "-like"; sparse plate 190129 with no plate.version — it has 49 wells, not 50, per S010; 2D XY images; misleading "zarr" names per the AGAVE diff). As a validation proposal it stands.
evidence: S010 lines 1125-1134 and 1040-1047, S056 lines 1-320, S010 lines 1052-1059, S098 lines 64-85

### B-027
decision: not_a_claim
basis: supported
reason: Subsection heading; bookkeeping.
evidence: none needed

### B-028
decision: confirm
basis: supported
reason: "Where relevant" is load-bearing: channel/time axes may be absent entirely (2–3 space axes required, one MAY time, one MAY channel), so the Plan's hedge matches the format.
evidence: S003 lines 290-327 (esp. 299-303), S010 lines 1018-1151 (XY/XYZ rows)

### B-029
decision: confirm
basis: supported
reason: All constraints verified: channel identified by axis type; omero optional/transitional; greyscale model forces white channel colors in both reference readers; window start/end is the display range vs min/max data range; defaultZ needs bounds-checking; missing omero is a required path (--no-minmax) and vizarr's labels-when-omero-missing bug is the counterexample.
evidence: S003 lines 290-327 (esp. 301-302), S003 lines 390-482 (esp. 398-430), S018 lines 268-427 (esp. 336-391), S048 lines 221-338 (esp. 293-314, read directly), S054 lines 1-120, S033 lines 346-359, S050 line 2436

### B-030
decision: confirm
basis: supported
reason: The matrix shows several viewers ignore omero colors/windows/rdefs (Vol-E ignores colors; WEBKNOSSOS "rdefs are not supported"; avivator/BDV/MoBIE/neuroglancer/OMERO marked no), so honoring omero defaults is a differentiator and a missing-omero fallback must be specified.
evidence: S043 lines 38-78

### B-031
decision: confirm
basis: supported
reason: Validation proposal anchored on verified values: the IDR 0.5 label-image sample is CZYX with omero window end 1500 / max 65535 and rdefs.defaultZ 118; the omero-free path is required per --no-minmax.
evidence: S054 lines 1-120 (esp. 10-44, 77-113), S033 lines 346-359

### B-032
decision: not_a_claim
basis: supported
reason: Subsection heading; bookkeeping.
evidence: none needed

### B-033
decision: confirm
basis: supported
reason: Overlay promise is Plan-covered while the sourcing mechanism needs correction: the labels-group listing is the reliable registration path and the image-label source.image pointer is considered broken by spec contributors.
evidence: S003 lines 390-482 (esp. 431-474), S035 line 2704

### B-034
decision: confirm
basis: supported
reason: All constraints verified: labels discovered via labels group; label pixels integer dtypes; equal level counts a MUST real files may violate; rgba optional; overlay alignment requires the same transform composition as the base image; napari keeps labels single-layer and initially hidden; established tools require manual labels-URL assembly via the validator.
evidence: S003 lines 390-482 (esp. 431-474), S048 lines 574-598 and 652-656 and 707-717 (read directly), S016 lines 268-294 (centering translations), S041 lines 1-28 (esp. 11-14)

### B-035
decision: confirm
basis: supported
reason: The matrix's "overlay multiple images" row shows only napari, WEBKNOSSOS and Microscopy Nodes support it, so the Plan promises more overlay capability than most viewers ship; alignment math is the documented hard part.
evidence: S043 lines 473-507, S043 lines 352-392 (translation rows mostly unsupported)

### B-036
decision: confirm
basis: supported
reason: Validation proposal is sound: mismatched level counts are a spec violation to explain (MUST at S003 L454-455), and registration must be checked under dataset+group transform composition (S003 L304-316).
evidence: S003 lines 390-482, S003 lines 290-327

### B-037
decision: not_a_claim
basis: supported
reason: Subsection heading; bookkeeping.
evidence: none needed

### B-038
decision: confirm
basis: supported
reason: Disposition (covered, one correction) is right: physical size requires composing dataset scale with group-level transforms, and units are frequently absent — both verified.
evidence: S003 lines 290-327 (esp. 304-316), S003 lines 358-397, S029 lines 293-296 (grep-verified "No units")

### B-039
decision: confirm
basis: supported
reason: All constraints verified verbatim: scale is relative to level 0 with group transforms applied after; translation after scale; units SHOULD-level and often missing; custom axis types legal; the spec's own example hides a time unit (0.1 ms) in a group-level scale; and napari-ome-zarr's code documents that one unit-less layer hides the whole view's scale bar.
evidence: S003 lines 290-327 (esp. 304-316), S003 lines 144-214 (esp. 166-174), S003 lines 358-374 (read directly), S029 lines 293-296, S048 lines 221-258 (read directly, esp. 249-254)

### B-040
decision: confirm
basis: supported
reason: The consequences follow: an explicit "unspecified" unit state is required (units are SHOULD and documented absent in common writer output), and cursor readout must compose dataset+group transforms per selected level.
evidence: S003 lines 290-327, S003 lines 358-374, S029 lines 293-296

### B-041
decision: confirm
basis: supported
reason: Validation proposal matches the spec example (group-level scale [0.1, 1, 1, 1, 1] on a millisecond time axis, S003 L368-374) and exercises exactly the composition rule at S003 L314-316.
evidence: S003 lines 358-397

### B-042
decision: not_a_claim
basis: supported
reason: Subsection heading; bookkeeping.
evidence: none needed

### B-043
decision: confirm
basis: supported
reason: The product_choice disposition is accurate: the closest desktop analog (AGAVE) ships a manual resolution-level picker defaulting to highest with an out-of-memory warning, so the Plan's automatic choice is a deliberate step beyond the analog and "appropriate" needs level-geometry awareness.
evidence: S117 lines 98-134 (read directly, esp. 108-109), S072 lines 1-11

### B-044
decision: confirm
basis: supported
reason: Level-geometry hazards verified: Z-downsampled pyramids and non-2 factors break established viewers; ome-zarr-py writers emit centering translations per level; chunk shapes can exceed array extents and be sharded; vizarr's repetitive-chunk rendering is the documented assumption-driven failure.
evidence: S043 lines 1-36 and 80-108, S016 lines 268-294 (esp. 285-286), S055 lines 1-75, S014 lines 128-151

### B-045
decision: confirm
basis: supported
reason: The alternatives are evidenced: AGAVE documents sub-region selection and a low-res-first workflow, and its zarr dialog shows per-level memory estimates; a manual override is a reasonable safety valve for automatic selection.
evidence: S117 lines 98-134 (esp. 127-128), S125 lines 47-63 (esp. 55)

### B-046
decision: confirm
basis: supported
reason: Validation proposal targets the two documented failure signatures (repeated chunks on Z-downsampled pyramids, breakage on non-uniform factors), both evidenced in the matrix.
evidence: S043 lines 1-36 and 80-108, S014 lines 128-151

### B-047
decision: not_a_claim
basis: supported
reason: Subsection heading; bookkeeping.
evidence: none needed

### B-048
decision: confirm
basis: supported
reason: Covered disposition is right; the adjacent cache-policy capability note is a fair optional item (Plan promises background reads + cancellation, not a cache policy).
evidence: case/plan/Viewer.md L7; S114 lines 7-23 and titles (grep-verified volumecache/memory-estimate items)

### B-049
decision: confirm
basis: supported
reason: The analog's #1 pain is exactly blocking, hard-to-cancel loads during time-series playback; its shipped answers were an in-memory volume cache and memory-estimate UI; sharded-read pain is correctly labeled search-listing evidence only.
evidence: S103 lines 3-19 and 58 (grep-verified body), S104 lines 3-19, S105 lines 3-19, S119 lines 3-19, S114 titles (grep-verified), S049 lines 1-26, S028 line 456

### B-050
decision: confirm
basis: supported
reason: Consequence follows from the verified evidence: cancellation policy for partially-read data and time-series scrubbing as the stress case mirror the analog's documented failure mode.
evidence: S103 line 58, S104 lines 3-19

### B-051
decision: confirm
basis: supported
reason: Validation idea is anchored on verified tracker items: cancellable async loading (#84) and the GPU/RAM leak on image switch (#276).
evidence: S103 lines 3-19 and 58, S119 lines 3-19

### B-052
decision: not_a_claim
basis: supported
reason: Subsection heading; bookkeeping.
evidence: none needed

### B-053
decision: confirm
basis: supported
reason: The correction stands: the reference library's own tracker lists the error-UX gaps as open, so failure UX cannot be inherited from parse_url-style APIs.
evidence: S019 lines 213-233, S028 lines 2320, 2776, 4444 (grep-verified)

### B-054
decision: confirm
basis: supported
reason: The constraint is supported: parse_url collapses missing vs broken into None; real files violate MUSTs (plate without version); misleading names exist; draft-only transform types (rotation/sequence/displacement) exist in PR #206's history but not in released 0.5; and dtype ceilings in established viewers are documented (AGAVE docs: 8/16u/32f only; Viv: 8 dtypes) — noting the original O-023 grep citation is void (S120 has no content), the proposition survives on the other citations.
evidence: S019 lines 213-233, S028 line 2776, S056 lines 1-160, S098 lines 64-85, S004 lines 141-166 and 195-310 (grep-verified), S003 lines 17-35 (esp. 25-27), S117 line 45 (read directly), S025 lines 79-92 (grep-verified)

### B-055
decision: confirm
basis: supported
reason: The error-taxonomy consequence matches the verified failure classes (unreadable arrays, unsupported codecs/shards/dtypes/transforms, version mismatch, inconsistent hierarchy), each evidenced in the corpus.
evidence: S044 lines 118-154, S035 line 2147, S056 lines 1-160, S098 lines 64-85, S004 lines 141-166

### B-056
decision: confirm
basis: supported
reason: The malformed-fixture pack maps one-to-one to verified corpus cases (plate missing version; identity transforms proposed for disallowal; window start/end handling differences between reference readers; partial omero via --no-minmax; misleading names).
evidence: S056 lines 1-160, S035 line 2147, S018 lines 268-427 (esp. 375-391), S048 lines 221-338 (esp. 316-324), S033 lines 346-359, S098 lines 64-85

### B-057
decision: not_a_claim
basis: supported
reason: Subsection heading; bookkeeping.
evidence: none needed

### B-058
decision: confirm
basis: supported
reason: The correction is accurate: the Plan names "real OME-Zarr 0.5 tools" but never names the Zarr v3 storage surface (shards, codecs, chunk key encodings) that 0.5 is defined on, nor a producer set.
evidence: case/plan/Viewer.md L9; S003 lines 57-80 (esp. 67-72)

### B-059
decision: confirm
basis: supported
reason: The producer set and storage surface are each corpus-verified: challenge converter (sharding option, zarr.json migration, ro-crate), bioformats2raw (0.4 default, 0.5 opt-in, codec floor, little-endian), IDR samples, ome-zarr-py (2D-only downsampling, degenerate defaults), WEBKNOSSOS (sharded v3), SpatialData (permissive 0.5), NGFF-Converter, plus crc32c sharding indexes.
evidence: S034 lines 32-54, S033 lines 140-205 and 346-359, S010 lines 1018-1151, S029 lines 293-296 and 334-336, S058 lines 346-362, S052 v0.19.0 body, S070 lines 52-109 (esp. 107), S055 lines 1-75, S044 lines 118-154

### B-060
decision: confirm
basis: supported
reason: The version-provenance consequence is verified: 0.5 read (PR open Nov 2024), 0.5 write default (Aug 2025), and napari-ome-zarr's all-series opening (May 2026) differ by more than a year across tools.
evidence: S008 lines 140-171, S013 lines 118-193, S065 lines 21-44

### B-061
decision: confirm
basis: supported
reason: Validation proposal is anchored on real corpus shapes (challenge-style sharded filesets like 4496763/9822152; b2r codec matrix from S033's supported-codec table; known-good decode comparison).
evidence: S034 lines 62-78, S033 lines 140-205, S055 lines 1-75

### B-062
decision: not_a_claim
basis: supported
reason: Subsection heading; bookkeeping.
evidence: none needed

### B-063
decision: confirm
basis: supported
reason: "Covered" is correct: the Plan states read-only and session-local settings at L9, and the corpus readers open read-only (mode "r" paths).
evidence: case/plan/Viewer.md L9; S019 lines 79-98 (esp. 83-84)

### B-064
decision: confirm
basis: supported
reason: Read-only open paths verified (mode "r" throughout io.py; the challenge resave never modifies input), and the rejected alternative is real: AGAVE's saved-settings JSON stores an absolute data path (brittle, session-crossing). Note the draft's "O-019" tag for mode "r" is a mis-cite; the fact is in S019.
evidence: S019 lines 79-98 and 213-233, S034 lines 150-168 (esp. 155-156, grep-verified), S108 line 27 (read directly)

### B-065
decision: confirm
basis: supported
reason: The consequence is consistent with the Plan's review gate: any settings persistence would be an additional capability requiring explicit review.
evidence: case/plan/Viewer.md L9

### B-066
decision: confirm
basis: supported
reason: Checksum validation idea is a sound, cheap test of the read-only obligation on the documented session operations.
evidence: case/plan/Viewer.md L9; S019 lines 79-98

### B-067
decision: not_a_claim
basis: supported
reason: Subsection heading; bookkeeping.
evidence: none needed

### B-068
decision: confirm
basis: supported
reason: Boundary disposition plus watch item is right: local-only excludes the storage-related failure classes by construction, while non-image payloads inside local filesets remain a discovery obligation.
evidence: case/plan/Viewer.md L9; S028 line 4368 (labels from buckets), S028 line 3080 (proxy), S034 lines 32-54 (ro-crate), S003 lines 144-214 (OME/METADATA.ome.xml)

### B-069
decision: confirm
basis: supported
reason: All constraints verified: OME-XML, ro-crate-metadata.json and OME/METADATA.ome.xml must be classified without being treated as images; the cited storage failures (labels from buckets, proxy issues) are remote-specific and located.
evidence: S003 lines 144-214 and 253-282, S034 lines 32-54, S028 lines 3080 and 4368 (grep-verified)

### B-070
decision: confirm
basis: supported
reason: Consequence follows: the storage layer stays thin while discovery remains hierarchy-aware, per the verified payload inventory.
evidence: S003 lines 144-214 and 253-282, S034 lines 32-54

### B-071
decision: confirm
basis: supported
reason: Validation idea matches the verified b2r layout (OME group, METADATA.ome.xml, ro-crate, numbered image groups) and the spec's MAY-ignore rule for non-image groups.
evidence: S003 lines 144-214 and 253-282 (esp. 275), S034 lines 32-54

### B-072
decision: not_a_claim
basis: supported
reason: Subsection heading; bookkeeping.
evidence: none needed

### B-073
decision: confirm
basis: supported
reason: All review-gate candidates are corpus-evidenced as user demand or ecosystem direction: channels from separate files and LUTs (AGAVE tracker titles), 0.6 scenes/RFC-5 (release notes and ngff issues), zip stores (RFC-9 listed in the RFC index and an open ome-zarr-py zipStore issue), >5D (RFC-3).
evidence: S112 lines 15, 785 (grep-verified), S052 v0.19.0 body (grep-verified), S035 line 356, S051 lines 63, 74, 87, 104-112 (grep-verified), S028 line 3612 (grep-verified)

### B-074
decision: not_a_claim
basis: supported
reason: Subsection heading; bookkeeping.
evidence: none needed

### B-075
decision: confirm
basis: supported
reason: "Unsupported as written" is accurate: the Plan's L11 says "representative filesets" without defining them, and the corpus supplies the concrete definition.
evidence: case/plan/Viewer.md L11

### B-076
decision: qualify
basis: supported
reason: The fixture inventory verifies (IDR 0.5 plates 384/1 and 49/32 wells/fields, 2D XY, XYZ, XYZC, XYZCT, 0.5 b2r collections, 21.57 GB single-plane image; PR #123's test list; S068 binary), but "no multi-entry-multiscales fixture exists anywhere" is wrong: the ome-ngff-tools matrix exercised a real multi-multiscales sample (4995115.zarr) — it is 0.4; the gap is that no 0.5 multi-multiscales fixture appears in the corpus.
evidence: S010 lines 1018-1151, S024 lines 9-25 and body (grep-verified), S068 line 1, S043 lines 277-316 (esp. 279), S034 lines 62-78
replacement:
<<<
- **Exact constraint:** concrete 0.5 fixtures with provenance exist in-corpus: the IDR 0.5 sample list (S010 L1018-1151: a plate with 384 wells/1 field, a plate with 49 wells/32 fields, 2D XY-only, XYZ, XYZC and XYZCT images, bioformats2raw.layout collections, and the 21.57 GB single-plane 9822152.zarr per S034 L69-70) and napari-ome-zarr PR #123's test URL list (S024). Gaps: no 0.5 fixture with multiple multiscales entries appears in the corpus's 0.5 sample lists — the only real multi-multiscales sample evidenced is the 0.4 fileset 4995115.zarr used by the ome-ngff-tools matrix (S043 L277-283) — and no readable 0.4/0.5 mixed-hierarchy sample exists in-corpus (the one 0.4 .zattrs capture, S068, is retained as binary, O-020).
>>>

### B-077
decision: confirm
basis: supported
reason: The consequence holds with the B-076 correction: acceptance can anchor to named public filesets, and the multi-multiscales case must be synthetic because no 0.5 multi-multiscales fixture exists in-corpus.
evidence: S010 lines 1018-1151, S043 lines 277-316, S024 lines 9-25

### B-078
decision: confirm
basis: supported
reason: The fixture-matrix validation idea is consistent with the verified producer/shape inventory and adds the synthetic malformed pack whose members are individually corpus-evidenced.
evidence: S010 lines 1018-1151, S034 lines 32-54, S033 lines 140-205, S056 lines 1-160

### B-079
decision: not_a_claim
basis: supported
reason: Subsection heading; bookkeeping.
evidence: none needed

### B-080
decision: confirm
basis: supported
reason: "Covered with differentiating risk" is supported: the matrix and tracker show zoom-during-load crashes, blocking loads, leaks and GPU ceilings are exactly where established products fail.
evidence: S043 lines 1-36 and 207-238, S103 line 58, S119 lines 3-19, S115 lines 4-22

### B-081
decision: qualify
basis: supported
reason: The failure inventory verifies, but "1 TB plates ... are real 0.5 data (O-046)" is not evidenced: no corpus source states a 1 TB size (largest stated is 21.57 GB single-plane; the largest plate's size is not stated anywhere in-corpus).
evidence: S043 lines 1-36 and 207-238, S103 line 58, S119 lines 3-19, S115 lines 4-22, S034 lines 62-78 (esp. 69-70), S010 lines 1018-1151 (grep for TB/GB sizes: no matches)
replacement:
<<<
- **Exact constraint:** the analog product's tracker and the viewer matrix show zoom-time crashes on plates and pyramids in established viewers (S043 L1-36, L207-238), blocking non-cancellable loads during time-series playback (S103 L58), memory leaks on image switch (S119), and GPU-memory ceilings for volume approaches (S115 L14; S062 L7). Real 0.5 scale is large but bounded in-corpus: a 21.57 GB single-plane image (9822152.zarr, S034 L69-70) and plate-scale data (190129.zarr: 2048×2044×31 per field with 49 wells × 32 fields, S010 L1040-1047, S056); no in-corpus source states a 1 TB dataset, so size claims should use the evidenced figures.
>>>

### B-082
decision: confirm
basis: supported
reason: The 2D-canvas simplification is evidenced (volume viewers are GPU-bound by their own docs) and zoom-during-load on plate/stitched data is the documented crash scenario.
evidence: S115 lines 4-22 (esp. 14), S062 lines 1-23 (esp. 7), S043 lines 207-238, S043 lines 1-36

### B-083
decision: confirm
basis: supported
reason: Validation idea matches the documented failure modes (zoom during load, repeated image switching leaks) with responsive-UI and memory-baseline assertions.
evidence: S103 line 58, S119 lines 3-19, S043 lines 207-238

### B-084
decision: not_a_claim
basis: supported
reason: Subsection heading; bookkeeping.
evidence: none needed

### B-085
decision: confirm
basis: supported
reason: Each listed malformed case is corpus-evidenced: plate missing version, identity transforms (proposal to disallow implies they occur), window start/end divergence between reference readers, partial omero via --no-minmax, and misleading names.
evidence: S056 lines 1-160, S035 line 2147, S018 lines 268-427 (esp. 375-391), S048 lines 221-338 (esp. 316-324), S033 lines 346-359, S098 lines 64-85

### B-086
decision: not_a_claim
basis: supported
reason: Subsection heading; bookkeeping.
evidence: none needed

### B-087
decision: confirm
basis: supported
reason: Verified: the spec makes multiple named multiscales a user choice with first-entry fallback, both reference readers read only multiscales[0], and in the matrix every viewer with a supported field is "supported: no" with several crashing — so the unresolved product question (list vs first-entry-only) is genuine.
evidence: S003 lines 290-327 and 390-482 (esp. 298, 317, 388-397), S018 lines 268-323 (esp. 279-296), S048 lines 191-221 (esp. 201), S043 lines 277-316

### B-088
decision: confirm
basis: supported
reason: Verified: the whole-Zarr-v3 feature surface is obligatory for 0.5, sharding is mainstream in real files; the Plan leaves both the storage-feature strategy and the stack choice open; the candidate routes (tensorstore C++, zarr-python >=3, napari's direct-zarr rewrite) are each corpus-evidenced (tensorstore v0.1.78 vendoring is evidenced at S096 L9 even though O-070's S120 cite is void).
evidence: S003 lines 57-80, S055 lines 1-75, S111 lines 3-19, S113 lines 23-39, S096 lines 1-9 (read directly), S015 lines 28-71, S024 lines 9-25, case/plan/Viewer.md

### B-089
decision: confirm
basis: supported
reason: Verified: the strict-vs-permissive decision is live — the reference reader deliberately loosened 0.5 validation for SpatialData, AGAVE infers version from Zarr format, and 0.6rc0 signals are in the ngff tracker — and the Plan does not state a policy.
evidence: S052 v0.19.0 body (grep-verified), S082 lines 47-63, S035 lines 348-364, case/plan/Viewer.md L9

### B-090
decision: not_a_claim
basis: supported
reason: Section heading; bookkeeping.
evidence: none needed

### B-091
decision: confirm
basis: supported
reason: Verified: AGAVE ships a manual resolution-level picker with per-level memory estimates and sub-region ROI, documented with a low-res-first workflow — the simpler alternative pattern the block describes.
evidence: S117 lines 98-134, S125 lines 47-63 (esp. 55)

### B-092
decision: confirm
basis: supported
reason: Verified: AGAVE/Vol-E are GPU-bound (path tracer; GPU memory dictates max load size) while vizarr proves the 2D-slice product class with eight dtypes.
evidence: S115 lines 4-22, S062 lines 1-23, S025 lines 79-92

### B-093
decision: confirm
basis: supported
reason: Verified: ome-zarr-py stitches wells into an almost-square grid with zero-filled missing fields, while the spec explicitly allows offering users a choice of images — a real product fork requiring a deliberate choice.
evidence: S018 lines 394-472 (esp. 406-409, 428-438), S003 lines 253-282 (esp. 274)

### B-094
decision: confirm
basis: supported
reason: Verified: the ome-zarr finder + BioFile Finder pattern (CSV/manifest + external browser, desktop+web with a local file-explorer service) is the incumbent local-browsing shape; Slide Scout's integrated list is the delta.
evidence: S023 lines 142-165 (esp. 153), S022 lines 1-20, S066 lines 16-27, S067 lines 1-16

### B-095
decision: confirm
basis: supported
reason: All five differentiators are matrix/tracker-evidenced gaps: omero colors/rdefs ignored by several viewers; group-level multiscales scale unapplied by napari-ome-zarr; dynamic scale bar an open vizarr request with many viewers lacking scalebar support; labels URLs hand-assembled via the validator; b2r series enumeration fixed only in May 2026.
evidence: S043 lines 38-78, 318-350, 394-428; S050 lines 2284, 2436 (grep-verified); S041 lines 1-28 (esp. 11-14); S065 lines 21-44

### B-096
decision: confirm
basis: supported
reason: Verified: AGAVE's docs ship timestamp overlays in physical time units and per-timepoint transfer-function adaptation (absolute vs percentile) — absent from the Plan, a legitimate review-gate candidate.
evidence: S117 lines 294-324 (esp. 302-314), S117 lines 505-537 (grep-verified esp. 521-532)

### B-097
decision: not_a_claim
basis: supported
reason: Section heading; bookkeeping.
evidence: none needed

### B-098
decision: qualify
basis: counterevidence
reason: The deferral itself is sound (0.6/RFC-5 content is not part of released 0.5), but the stated reason "RFC text not in corpus" is false: S051 is the RFC-5 page and contains the full proposal text (state S3 "Update implementations", the coordinateSystems/axes/transformation semantics from L312 on).
evidence: S003 lines 17-35 (esp. 25-27), S051 lines 1, 79-129, 130-209, 255-374 (read directly)
replacement:
<<<
| 0.6 scenes / RFC-5 coordinate systems & transforms | Not part of released 0.5 (S003 L25-27: 0.5 is the released version; editor's-draft data "will not necessarily be supported"). The RFC-5 draft text IS in-corpus (S051: RFC state S3 "Update implementations" at L130; Proposal with coordinateSystems/axes/transform semantics from L312), and 0.6 support is already shipping in the reference stack (S052 v0.19.0; S035 "0.6rc0 schemas" issue), but it targets the next version and is still converging. Deferral stands: handle via clear "unsupported version/transform" messaging only, and treat S051 as the reference if 0.6 support is later reviewed.
>>>

### B-099
decision: confirm
basis: supported
reason: Verified: remote/http/S3 is excluded by Plan L9, and the corpus storage-failure evidence (labels from buckets, proxy issues) is remote-specific, so the deferral is correct.
evidence: case/plan/Viewer.md L9; S028 lines 3080, 4368 (grep-verified)

### B-100
decision: confirm
basis: supported
reason: Verified: zip stores are RFC-9 (listed in the RFC index) with open zipStore friction in the reference library ("unable to write_image into a zipStore?"), so detect-and-explain deferral is right.
evidence: S051 line 112 (grep-verified), S028 line 3612 (grep-verified)

### B-101
decision: confirm
basis: supported
reason: Verified: >5D arrays and axis orientation are RFC-3/RFC-4 future work, not released 0.5; detect-and-explain is the right scope.
evidence: S051 lines 63, 74 (grep-verified), S003 lines 290-327 (esp. 296: 2–5 dims)

### B-102
decision: confirm
basis: supported
reason: Verified: multi-image overlay sessions / channels from separate files breach the single-fileset boundary (Plan L9) while user demand exists in the analog's tracker — a correct review-gate deferral.
evidence: case/plan/Viewer.md L9; S112 line 15 (grep-verified)

### B-103
decision: confirm
basis: supported
reason: Verified: the corpus holds only issue-title/listing evidence for sharded-read performance (S049 listing; S028 title), no measurements — so correctness-first deferral is right.
evidence: S049 lines 1-26, S028 line 456, S102 lines 1-7

### B-104
decision: confirm
basis: supported
reason: Verified: consolidated metadata appears in the reference tracker as an open question and is not among 0.5's metadata obligations (§2.1-2.8 of the spec enumerate them; none is consolidated metadata).
evidence: S028 line 1610 (grep-verified), S003 lines 28-35 (section list) and 144-568

### B-105
decision: confirm
basis: supported
reason: Verified: 3D/volume rendering is outside the Plan's 2D canvas scope, and the GPU-memory ceiling in volume viewers is documented — the deliberate-simplification note stands.
evidence: case/plan/Viewer.md L5; S115 lines 4-22, S062 lines 1-23

### B-106..B-107
decision: not_a_claim
basis: supported
reason: Separator plus the "## 6. Coverage" heading and coverage/footer text: process bookkeeping, not a substantive obligation. Two coverage statements are factually wrong and are corrected in out/additions.md rather than asserted: (1) S096 and S121 are listed as failed/empty captures, but both contain substantive grep-extract content (S096: tensorstore build/vendoring refs incl. v0.1.78; S121: AGAVE's omero dual-namespace lookup), and S121 backs O-024; (2) S051 is listed as "RFC index, grepped" but contains the full RFC-5 proposal text. Also note S120 (not listed) is the truly empty "no literal matches" capture.
evidence: S096 lines 1-9, S121 lines 1-10, S051 lines 130-374, S120 line 1, S057 line 1, S068 line 1
