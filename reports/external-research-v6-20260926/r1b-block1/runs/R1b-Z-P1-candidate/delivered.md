# Delivered research result

TEST_ONLY_NEVER_PROMOTE. Host-assembled from immutable stage-1 draft blocks and the same-model verifier's explicit per-block decisions. Only section 1 and section 4 are asserted content. Section 2 records rejected draft assertions; section 3 holds proposals that were not verified (unresolved, undecided, or with a malformed verifier record) and earns no verified-retention credit. Section 5 is history.

## 1. Current asserted findings

#### [B-003] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: The 0.5 spec states it is defined on Zarr v3 and that all Zarr features (codecs, chunk grids, chunk key encodings, data types, storage transformers) may be used unless explicitly disallowed; the spec disallows almost nothing (the dataset-transform restriction at S003 L309 is a rare exception).
Evidence: S003 lines 57-80 (esp. 67-72), S003 lines 290-327 (esp. 309)

1. **0.5 = Zarr v3 with the full Zarr feature surface.** OME-Zarr 0.5 is defined on Zarr v3, and "all features of the Zarr format including codecs, chunk grids, chunk key encodings, data types and storage transformers may be used … unless explicitly disallowed" (O-002, S003 L67-72). The 0.5 text disallows almost nothing. Consequence: a reader that supports only one chunk-grid/codec shape is not 0.5-conformant even if it opens some files.

#### [B-004] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: Metadata location in zarr.json under attributes.ome with string version and hierarchy-consistency MUST verified verbatim; image.schema requires multiscales+version; ome-zarr-py detection keys off legacy multiscales[0].version after namespace unwrap, exactly as the block says.
Evidence: S003 lines 144-214 (esp. 152-156), S053 lines 14-38 (esp. 22-30), S016 lines 27-54 and 81-96 (read directly), S019 lines 79-98

2. **Metadata location and version.** OME metadata lives in `zarr.json` under `attributes.ome`; `ome.version` is a string and MUST be consistent within a hierarchy (O-003, S003 L152-156). The image schema makes `multiscales` + `version` required on an image group (O-016, S053 L22-30). Note: version detection in the wild keys off several locations, including the legacy `multiscales[0].version` (O-026, S016 L81-96) — a validator should check `attributes.ome.version` first but not be surprised by legacy placement.

#### [B-005] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: Axes rules (name required+unique, type/unit SHOULD with custom types legal, length MUST equal dimensionality, dimension_names MUST be present, 2–5 dims, ordering time→channel/custom→space with zyx only SHOULD) verified verbatim; XY-only and XYZ 0.5 samples exist in the IDR list.
Evidence: S003 lines 144-214 (esp. 166-174), S003 lines 290-327 (esp. 296, 299-303), S003 lines 801-835 (0.5.2 dimension_names clarification), S010 lines 1018-1151 (XY row L1052-1059, XYZ row L1060-1068)

3. **Axes.** 2–5 dimensions; `name` required and unique; `type` recommended (space/time/channel or custom strings); `unit` recommended UDUNITS-2; arrays MUST carry `dimension_names` matching axes (O-004, S003 L166-174). Ordering MUST be time → channel/custom → space; zyx is only SHOULD (O-005, S003 L299-319). Channel/time/plane UI must key off axis **type**, and may be absent entirely (real 0.5 samples include XY-only and XYZ data — O-046, S010 L1026-1133).

#### [B-006] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: multiscales is a list; dataset paths ordered highest→lowest resolution; exactly one scale per dataset (relative to level 0, default 1.0); optional translation listed after scale; group-level coordinateTransformations applied after dataset-level ones; name only SHOULD — all verified verbatim, including the choose-by-name/first-fallback reader guidance.
Evidence: S003 lines 290-327 (esp. 298, 304-317), S003 lines 390-482 (esp. 388-397), S003 lines 358-397 (group-transform example, read directly)

4. **Multiscales.** `multiscales` is a LIST; datasets paths are arbitrary strings ordered highest→lowest resolution; each dataset MUST have exactly one scale (relative to level 0, default 1.0); MAY have one translation, listed after scale; group-level `coordinateTransformations` are applied after dataset-level ones (O-006/O-007/O-008, S003 L298-397). Missing `name` is legal (SHOULD).

#### [B-007] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: omero is §2.5 transitional and optional; channels/color/window MUSTs verified; rdefs described but outside the MUST sentences; real sample shows window end 1500 vs max 65535 and rdefs.defaultZ 118; bioformats2raw writes omero min/max by default with --no-minmax opt-out.
Evidence: S003 lines 390-482 (esp. 398-430), S054 lines 1-120 (esp. 86-91, 109-113), S033 lines 346-359 (esp. 351-354, read directly)

5. **omero display block is transitional and optional.** If present: `channels` required; per-channel `color` (6 hex digits) and `window {min,max,start,end}` required; `rdefs` (defaultT/defaultZ, model "color"|"greyscale") described but not covered by the MUSTs (O-009, S003 L398-430). Real files show window `end` far below data `max` (display window vs data range, O-017) and `defaultZ` that must be bounds-checked (S054 L109-113). Producers can legitimately omit it (`bioformats2raw --no-minmax`, O-048).

#### [B-008] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: Labels rules (integer dtypes MUST, labels group lists paths, label image must be full multiscales with same level count, image-label SHOULD/MAY keys, source.image default ../../) verified verbatim; spec contributors call source.image broken and one viewer ships the labels-not-loaded-when-omero-missing bug, both located in the cited dumps.
Evidence: S003 lines 390-482 (esp. 431-474), S035 line 2704, S050 line 2436

6. **Labels.** `labels` group lists label image paths; label pixels MUST be integer dtypes; each label image MUST be a full multiscales image with the SAME number of levels as the parent (O-010, S003 L431-455); `image-label` colors/rgba/properties/source are SHOULD/MAY with `source.image` defaulting to `../../` (O-011, S003 L454-474). Caution: the spec community itself considers the `source.image` reference mechanism broken and the omero schema inconsistent with its description (O-073, S035 titles), and a real viewer ships a bug where labels are not loaded when the omero block is missing (O-072, S050). Overlay code must therefore use the labels-group listing as the source of truth and verify level geometry at runtime.

#### [B-009] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: Plate/well structure, sparse-plate norms, and the plate `version` MUST verified; the captured challenge plate (S056) demonstrably lacks both `version` and `acquisitions` inside the plate object, confirming real files violate the MUST.
Evidence: S003 lines 110-137, S003 lines 507-568 (esp. 530-560), S003 lines 801-835 (well fields), S056 lines 1-320 (plate object L10-315 with no version/acquisitions keys)

7. **HCS plates/wells.** plate `{columns, rows, wells[{path,rowIndex,columnIndex}], field_count, acquisitions?, version}` and well `{images[{path,acquisition?}], version}`; sparse plates are normal (empty rows/wells SHOULD NOT exist) (O-013, S003 L118-129, L515-560, L740-752). Real plates violate the `version` MUST (O-019, S056) — strict validation would reject a flagship dataset.

#### [B-010] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: bioformats2raw.layout=3 collections, optional OME/METADATA.ome.xml and series list, consecutive-numbering fallback, and the SHOULD NOT default to first image all verified; napari's OME-XML Image-ID discovery convention confirmed in its reader.
Evidence: S003 lines 144-214 and 253-282 (esp. 254-275), S048 lines 333-376 (esp. 341-365)

8. **bioformats2raw collections (transitional).** `bioformats2raw.layout: 3`, optional `OME/METADATA.ome.xml`, optional `series` path list, else consecutive numbered groups; readers SHOULD NOT default to opening only the first image (O-012, S003 L175-275). Two other discovery conventions coexist (OME-XML Image IDs in napari, O-034; `series` in the spec) — discovery must tolerate disagreement.

#### [B-011] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: JSON comment prohibition and camelCase-with-legacy-exceptions notes verified verbatim.
Evidence: S003 lines 57-80 (esp. 65-66), S003 lines 801-835 (esp. 809-812)

9. **JSON hygiene.** No comments in JSON; exact historical key spellings (camelCase intent with acknowledged legacy exceptions) (O-014/O-015, S003 L65-66, L809-812).

#### [B-012] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: The flagship IDR 0.5 level-0 array is sharding_indexed (blosc/zstd inner, crc32c index, chunk 512×512 exceeding the 275×271 extent); the challenge converter shards optionally; WEBKNOSSOS writes sharded v3; auto-sharding is arriving with ome-zarr-py failing (issue #640); b2r's 0.5 codec floor is bytes+{blosc,gzip,zstd,null} little-endian — all located.
Evidence: S055 lines 1-75, S034 lines 32-54 (esp. 43), S058 lines 346-362 (esp. 360), S044 lines 118-154 and 273-276 (grep-verified), S033 lines 140-205 and 346-359 (read directly)

10. **Dataset-level compatibility floor (from real 0.5 corpora).** Sharded arrays are mainstream, not exotic: the flagship IDR 0.5 sample uses `sharding_indexed` (blosc/zstd inside, crc32c index) with chunk shapes larger than the array extent (O-018, S055); the challenge converter shards optionally (O-047), WEBKNOSSOS writes sharded v3 (O-068), and zarr-python "auto" sharding is arriving with OME-layer tools lagging (O-045, S044). Codec floor from the dominant converters: bytes + {blosc, gzip, zstd, null}, little-endian default (O-048, S033 L152-162, L356-359).

---

#### [B-014] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 2. Compatibility findings, contradictions and counterexamples

Basis: supported
Reason: The 0.4→0.5 break design (zarr.json, ome namespace, version moved up) is documented in PR #206; 0.4-era version placement inside multiscales[0] verified in the 0.4 spec; dual unwrap implemented in both reference readers; corpus contains 0.4 and 0.5 samples and the one 0.4 .zattrs capture is binary with no content evidence.
Evidence: S004 lines 141-166 and 570-584 (grep-verified), S059 lines 349-357 (grep-verified), S048 lines 158-178 (esp. 166-170), S019 lines 79-98, S010 lines 1018-1151, S068 line 1

- **The 0.4→0.5 break is by design.** Metadata moved from `.zattrs`/`.zarray` into `zarr.json` attributes under an `ome` namespace; version fields moved up; chunk-key encoding became per-array (O-038, S004). 0.4-era files put `version: "0.4"` inside `multiscales[0]` (S059 L347-353). Established readers unwrap `attributes.ome` when present and otherwise read flat attributes (O-032, S048 L166-170; O-036, S019 L87-90). A 0.5-only viewer still needs this dual read if it ever meets 0.4 data; the corpus contains both (catalog: 0.4 and 0.5 sample URLs in S010; a 0.4 `.zattrs` capture, S068, is retained as unreadable binary — no content evidence).

#### [B-015] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 2. Compatibility findings, contradictions and counterexamples

Basis: supported
Reason: Degenerate writer defaults (scale [1,1,1,1,1], no units, name-inferred types, 2D-only downsampling, invalid webknossos 0.4 output) located in the maintainer comparison; the challenge plate omits plate.version; `_creator` appears alongside ome keys in real captures.
Evidence: S029 lines 293-296 and 334-336 (grep-verified), S056 lines 1-160, S054 lines 1-20

- **Real writers emit degenerate or invalid metadata.** Default scale `[1,1,1,1,1]`, no units, axis type inferred from name; at least one major tool's 0.4 output was invalid (axis order cxyz, wrong separator) (O-044, S029). A real 0.5 plate omits the spec-required plate `version` (O-019). Unknown keys like `_creator` appear alongside `ome` keys (O-017). Strict-schema rejection is not viable; "explain what cannot be displayed" is (brief L3, Plan L11).

#### [B-016] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 2. Compatibility findings, contradictions and counterexamples

Basis: supported
Reason: parse_url's None-collapse is in the io.py source/docstring; the cited open-issue titles (reader not idempotent, consolidated metadata, RFC-5 group download, labels from buckets, parse_url exception request) all located in S028.
Evidence: S019 lines 213-233 (read directly), S028 lines 2396, 2776, 3840, 4368, 4444, 1610 (grep-verified)

- **Reference-reader gaps are documented in their own trackers.** parse_url collapses "missing" and "error" into None (O-036); reader not idempotent; consolidated-metadata unresolved; RFC-5 group downloads fail; labels-from-buckets broken (O-071, S028 titles). Reusing a library does not discharge the Plan's error-UX and discovery obligations.

#### [B-017] QUALIFIED
Context: # Slide Scout — corpus research report (draft) > ## 2. Compatibility findings, contradictions and counterexamples

Basis: supported
Reason: Every failure class checks out against the features matrix, but "no tested viewer opens images beyond the first multiscales entry" overstates one row: OMERO/ZarrReader's entry says "All images imported but sample image is corrupted" (all viewers with a supported field are marked "supported: no").
Evidence: S043 lines 1-36, 80-108, 207-238, 240-275, 277-316, 394-428 (read in full); S041 lines 1-28

Active (verified replacement; the draft text is superseded history):

- **Ecosystem failure classes to design against** (ome-ngff-tools viewer matrix; samples mostly v0.4, viewer versions pinned April 2025 — S041 L2-20, S043): Z-downsampled pyramids (vizarr mis-renders — "expects the same number of Z-sections for each pyramid resolution", S043 L9-13; napari crashes on zoom, L16-17); non-2 scale factors between levels (vizarr fails, S043 L80-89); HCS plates render but crash on zoom-in (napari, S043 L218-220) or show only the lowest resolution (vizarr, L213-215); bioformats2raw collections fail or need redirects in most tested viewers (S043 L240-275); for multiple `multiscales` entries no tested viewer lists/uses images beyond the first (every viewer with a `supported` field is "supported: no", S043 L277-316), several crash hard (BigDataViewer and MoBIE: ArrayIndexOutOfBoundsException), and OMERO reported importing all images but with a corrupted sample. Group-level multiscales scale was not applied by napari-ome-zarr at test time (S043 L394-428, issue #73) — exactly the composition case of dataset-then-group transforms in S003 L304-316.

#### [B-018] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 2. Compatibility findings, contradictions and counterexamples

Basis: supported
Reason: All three 0.5-era failures located: vizarr #307 still Open with "renders chunks repetitively" for challenge-converted data; the Dec 2025 zarr 2/3 FSStore schism and napari's ignored coordinateTransformations; ome-zarr-py auto-sharding issue #640 opened Aug 31, 2026.
Evidence: S014 lines 128-151, S011 lines 133-185, S044 lines 118-154 plus line 137 (grep-verified)

- **0.5 rendering failures exist in current tools.** vizarr "renders chunks repetitively" for challenge-converted 0.5 data (O-040, S014, still open); the Python stack had a zarr 2/3 dependency schism with FSStore import failures and wrong anisotropic rendering in napari's built-in reader (O-039, S011, Dec 2025); ome-zarr-py crashed on zarr "auto" sharding (O-045, S044, Aug 2026).

#### [B-019] QUALIFIED
Context: # Slide Scout — corpus research report (draft) > ## 2. Compatibility findings, contradictions and counterexamples

Basis: counterevidence
Reason: Two of the three cited shortcuts are verified (zarr-format→NGFF-version inference; substring-"zarr" path sniffing), but the "whitelists four dtypes (O-023, S120)" citation is beyond the end of its source: S120 contains only a "No literal matches" notice, so the four-dtype whitelist claim has no corpus support.
Evidence: S082 lines 47-63 (esp. 55), S098 lines 64-85 (esp. 72-74), S120 line 1

Active (verified replacement; the draft text is superseded history):

- **Format sniffing shortcuts exist and are fragile.** AGAVE infers NGFF version from the Zarr format version (zarrv2→0.4, zarr.json→0.5) and errors outside that assumption (S082 L55), and dispatches any directory whose path contains the substring "zarr" to its Zarr reader (S098 L72-74). Its documented pixel-intensity coverage is limited (8-bit, 16-bit unsigned, 32-bit float; S117 L45) and vizarr/Viv supports eight dtypes (S025 L84-85), so established viewers do restrict dtypes — but the corpus grep extract claiming an exact four-dtype whitelist (former cite O-023/S120) is not in evidence: S120 is a "No literal matches" placeholder. These are counterexamples to avoid, not patterns to copy: read `attributes.ome.version` (S003 L152-156) and classify nodes by metadata, not names; give an explicit unsupported-dtype message.

#### [B-020] QUALIFIED
Context: # Slide Scout — corpus research report (draft) > ## 2. Compatibility findings, contradictions and counterexamples

Basis: supported
Reason: Four of the five dated claims verify exactly (write-default Aug 7 2025; napari-ome-zarr 0.8.0 on 2026-05-20; ome-zarr 0.19.2 zarr>=3 on Python >=3.12; 0.6/SpatialData activity), but "0.5 read support arrived Nov 2024" is only evidenced as PR #404 being open in Nov 2024 — the corpus shows 0.10.2 (Nov 2024) still pinned zarr<3 and PR activity into mid-2025, so the release date is not pinned.
Evidence: S013 lines 118-193 (grep-verified 151, 184-186), S065 lines 21-44, S015 lines 28-71, S052 v0.19.0/v0.13.0 bodies (grep-verified), S008 lines 140-171, S017 lines 1-21

Active (verified replacement; the draft text is superseded history):

- **Tool versions matter.** ome-zarr-py's 0.5 read support came via the zarr-python v3 migration PR #404, which was open by Nov 7, 2024 (S008); the corpus does not pin its merge/release date — the Nov 2024 changelog release (0.10.2) still pinned zarr<3 and the April 2025 0.11.x entries do not list #404 (S017) — so cite the PR, not a release date. 0.5 writing merged Aug 7, 2025 and became the default CurrentFormat (S013). napari-ome-zarr 0.8.0 (2026-05-20) dropped the ome-zarr dependency and opens all bioformats2raw series images (S065). ome-zarr 0.19.2 requires zarr>=3.0.0 and Python >=3.12 (S015). The ecosystem is simultaneously preparing 0.6 scenes (S052 v0.19.0 "image class v06"/"Ready for 06"; S035 "0.6rc0 schemas") and loosening 0.5 validation for SpatialData (S052 v0.19.0). Interop claims must name producer and version because 0.5 support dates differ by a year or more across tools.

#### [B-023] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "opens a local OME-Zarr 0.5 fileset and lists the images it finds"

Basis: supported
Reason: The correction is well-founded: the spec itself requires surfacing multiple images per fileset (b2r SHOULD NOT open only the first; plates have per-well fields; multiple named multiscales are user-selectable), so "lists the images it finds" read as one-image-per-open is too narrow.
Evidence: S003 lines 253-282 (esp. 271-274), S003 lines 290-327 and 390-482 (esp. 388-397), S003 lines 110-137 and 507-568, S048 lines 656-707 (entry-point dispatch)

- **Disposition: correction** (the intent is covered; the specified scope of "images it finds" is too narrow as written).

#### [B-024] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "opens a local OME-Zarr 0.5 fileset and lists the images it finds"

Basis: supported
Reason: Every listed content class is spec- or corpus-verified: single image, multiple named multiscales (choose by name, first fallback), sparse plates with per-well fields, b2r collections whose images SHOULD all be surfaced, labels groups as entry points (napari dispatches on them), ro-crate-metadata.json non-image content, and 2D-XY through 5D-XYZCT in the real 0.5 list.
Evidence: S003 lines 290-327 and 390-482, S003 lines 110-137 and 507-568, S003 lines 144-214 and 253-282, S048 lines 656-707, S034 lines 32-54, S010 lines 1018-1151

- **Exact constraint:** one fileset can contain: a single multiscale image; multiple named multiscales entries (spec: user chooses by name, first is fallback — O-008); a plate with sparse wells and per-well fields (O-013); a bioformats2raw collection whose images SHOULD all be surfaced (O-012); a labels group or label image as the entry point (O-035); plus non-image content that must not confuse discovery (ro-crate-metadata.json, O-047). 2D-XY through 5D-XYZCT all occur (O-046).

#### [B-025] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "opens a local OME-Zarr 0.5 fileset and lists the images it finds"

Basis: supported
Reason: The first-class-discovery consequence follows directly from the verified content classes; the spec's "SHOULD NOT default to only opening the first image" and the ome-zarr finder gap (O-043) support it.
Evidence: S003 lines 253-282 (esp. 271-272), S023 lines 142-165

- **Product consequence:** discovery is a first-class subsystem (node classification: image / plate / well / collection / labels / unsupported), not a byproduct of opening one image; the image list must not silently show only the first item of anything.

#### [B-026] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "opens a local OME-Zarr 0.5 fileset and lists the images it finds"

Basis: supported
Reason: All fixture anchors exist in-corpus as stated (9-image b2r collection BR00109990_C2 — note the IDR row is the 0.4 copy, hedged by "-like"; sparse plate 190129 with no plate.version — it has 49 wells, not 50, per S010; 2D XY images; misleading "zarr" names per the AGAVE diff). As a validation proposal it stands.
Evidence: S010 lines 1125-1134 and 1040-1047, S056 lines 1-320, S010 lines 1052-1059, S098 lines 64-85

- **Distinguishing validation idea:** fixture set = a 9-image b2r collection (BR00109990_C2-like), a sparse 50-well plate (190129-like, no plate.version), a single 2D XY image, and a misleading directory name containing "zarr"; assert the list contents and that opening the labels group directly resolves to the parent image.

#### [B-028] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "canvas with pan and zoom, channel visibility controls, time-point and plane selection where relevant"

Basis: supported
Reason: "Where relevant" is load-bearing: channel/time axes may be absent entirely (2–3 space axes required, one MAY time, one MAY channel), so the Plan's hedge matches the format.
Evidence: S003 lines 290-327 (esp. 299-303), S010 lines 1018-1151 (XY/XYZ rows)

- **Disposition: covered** (Plan's "where relevant" is correct and load-bearing), with two **optional_capability** notes.

#### [B-029] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "canvas with pan and zoom, channel visibility controls, time-point and plane selection where relevant"

Basis: supported
Reason: All constraints verified: channel identified by axis type; omero optional/transitional; greyscale model forces white channel colors in both reference readers; window start/end is the display range vs min/max data range; defaultZ needs bounds-checking; missing omero is a required path (--no-minmax) and vizarr's labels-when-omero-missing bug is the counterexample.
Evidence: S003 lines 290-327 (esp. 301-302), S003 lines 390-482 (esp. 398-430), S018 lines 268-427 (esp. 336-391), S048 lines 221-338 (esp. 293-314, read directly), S054 lines 1-120, S033 lines 346-359, S050 line 2436

- **Exact constraint:** channel axis is identified by type, may be absent; omero is optional/transitional (O-009), so defaults must fall back to computed or neutral rendering; `rdefs.model: greyscale` overrides channel colors to white in established readers (O-030); window uses start/end for display and min/max for range (O-017); `defaultZ`/`defaultT` need bounds-checking. Missing/partial omero is a required path (bioformats2raw `--no-minmax`, O-048), and one real viewer's failure to load labels when omero is absent is the counterexample to avoid (O-072).

#### [B-030] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "canvas with pan and zoom, channel visibility controls, time-point and plane selection where relevant"

Basis: supported
Reason: The matrix shows several viewers ignore omero colors/windows/rdefs (Vol-E ignores colors; WEBKNOSSOS "rdefs are not supported"; avivator/BDV/MoBIE/neuroglancer/OMERO marked no), so honoring omero defaults is a differentiator and a missing-omero fallback must be specified.
Evidence: S043 lines 38-78

- **Product consequence:** honoring omero defaults (colors, names, windows, active flags, greyscale model) is a differentiator, not table stakes (O-051); a missing-omero fallback must be specified, not emergent.

#### [B-031] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "canvas with pan and zoom, channel visibility controls, time-point and plane selection where relevant"

Basis: supported
Reason: Validation proposal anchored on verified values: the IDR 0.5 label-image sample is CZYX with omero window end 1500 / max 65535 and rdefs.defaultZ 118; the omero-free path is required per --no-minmax.
Evidence: S054 lines 1-120 (esp. 10-44, 77-113), S033 lines 346-359

- **Distinguishing validation idea:** open the 0.5 IDR label-image sample (CZYX, omero window end 1500 / max 65535, defaultZ 118): assert per-channel colors/labels, display window 0–1500, initial plane clamped to z-size; then open an omero-free fixture and assert rendering still occurs with stated defaults.

#### [B-033] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "optional overlays for associated label images"

Basis: supported
Reason: Overlay promise is Plan-covered while the sourcing mechanism needs correction: the labels-group listing is the reliable registration path and the image-label source.image pointer is considered broken by spec contributors.
Evidence: S003 lines 390-482 (esp. 431-474), S035 line 2704

- **Disposition: covered** as a promise, with a **correction** on the sourcing mechanism.

#### [B-034] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "optional overlays for associated label images"

Basis: supported
Reason: All constraints verified: labels discovered via labels group; label pixels integer dtypes; equal level counts a MUST real files may violate; rgba optional; overlay alignment requires the same transform composition as the base image; napari keeps labels single-layer and initially hidden; established tools require manual labels-URL assembly via the validator.
Evidence: S003 lines 390-482 (esp. 431-474), S048 lines 574-598 and 652-656 and 707-717 (read directly), S016 lines 268-294 (centering translations), S041 lines 1-28 (esp. 11-14)

- **Exact constraint:** labels are discovered via the labels group listing (O-010); `image-label.source.image` is the documented pointer but is considered broken by spec contributors (O-073); label pixels must be integer dtypes; equal level counts are a MUST that real files may violate (O-010); rgba per label value is optional (O-011); overlay alignment requires the same transform composition as the base image (dataset scale, optional translation, group-level transforms — O-006/O-007/O-027). Established viewers keep labels single-layer and initially hidden (O-033); manual labels-URL assembly is the current UX in established tools (O-052).

#### [B-035] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "optional overlays for associated label images"

Basis: supported
Reason: The matrix's "overlay multiple images" row shows only napari, WEBKNOSSOS and Microscopy Nodes support it, so the Plan promises more overlay capability than most viewers ship; alignment math is the documented hard part.
Evidence: S043 lines 473-507, S043 lines 352-392 (translation rows mostly unsupported)

- **Product consequence:** in-product labels discovery is real added value, but alignment math and per-level verification are the hard part; the Plan promises more overlay capability than most viewers ship (O-051), so this needs its own acceptance fixtures, not a rider on image display.

#### [B-036] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "optional overlays for associated label images"

Basis: supported
Reason: Validation proposal is sound: mismatched level counts are a spec violation to explain (MUST at S003 L454-455), and registration must be checked under dataset+group transform composition (S003 L304-316).
Evidence: S003 lines 390-482, S003 lines 290-327

- **Distinguishing validation idea:** fixture with a label image whose level count deliberately differs from the parent (spec-violating): the viewer must explain the mismatch rather than crash or silently misalign; plus a correct fixture where overlay registration is checked at two zoom levels against dataset+group transforms.

#### [B-038] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "A details panel shows dimensions, units and coordinates"

Basis: supported
Reason: Disposition (covered, one correction) is right: physical size requires composing dataset scale with group-level transforms, and units are frequently absent — both verified.
Evidence: S003 lines 290-327 (esp. 304-316), S003 lines 358-397, S029 lines 293-296 (grep-verified "No units")

- **Disposition: covered**, with one **correction**.

#### [B-039] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "A details panel shows dimensions, units and coordinates"

Basis: supported
Reason: All constraints verified verbatim: scale is relative to level 0 with group transforms applied after; translation after scale; units SHOULD-level and often missing; custom axis types legal; the spec's own example hides a time unit (0.1 ms) in a group-level scale; and napari-ome-zarr's code documents that one unit-less layer hides the whole view's scale bar.
Evidence: S003 lines 290-327 (esp. 304-316), S003 lines 144-214 (esp. 166-174), S003 lines 358-374 (read directly), S029 lines 293-296, S048 lines 221-258 (read directly, esp. 249-254)

- **Exact constraint:** physical size = composition of dataset-level scale (relative to level 0) with any group-level transform, translation applied after scale (O-006/O-007); units are SHOULD-level and frequently absent (O-044, O-004); custom axis types are legal (O-004); time units can hide in group-level transforms (S003 L368-374). One viewer's whole-view scale bar disappears if any layer lacks units (O-032).

#### [B-040] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "A details panel shows dimensions, units and coordinates"

Basis: supported
Reason: The consequences follow: an explicit "unspecified" unit state is required (units are SHOULD and documented absent in common writer output), and cursor readout must compose dataset+group transforms per selected level.
Evidence: S003 lines 290-327, S003 lines 358-374, S029 lines 293-296

- **Product consequence:** the panel needs an explicit "unspecified" state per axis and must not derive physical units from axis names; coordinate readout at the cursor should use composed transforms per selected level.

#### [B-041] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "A details panel shows dimensions, units and coordinates"

Basis: supported
Reason: Validation proposal matches the spec example (group-level scale [0.1, 1, 1, 1, 1] on a millisecond time axis, S003 L368-374) and exercises exactly the composition rule at S003 L314-316.
Evidence: S003 lines 358-397

- **Distinguishing validation idea:** synthetic file with group-level `scale [0.1, 1, 1, 1, 1]` (time) and per-level spatial scales; assert the panel and cursor readout show the composed values and degrade to "pixel" when a unit is absent.

#### [B-043] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "The viewer chooses an available pyramid level appropriate for the current view"

Basis: supported
Reason: The product_choice disposition is accurate: the closest desktop analog (AGAVE) ships a manual resolution-level picker defaulting to highest with an out-of-memory warning, so the Plan's automatic choice is a deliberate step beyond the analog and "appropriate" needs level-geometry awareness.
Evidence: S117 lines 98-134 (read directly, esp. 108-109), S072 lines 1-11

- **Disposition: product_choice** (the Plan picks automatic selection where the closest desktop analog ships a manual picker; both are legitimate, but they have different failure modes), plus a **correction** on what "appropriate" must mean.

#### [B-044] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "The viewer chooses an available pyramid level appropriate for the current view"

Basis: supported
Reason: Level-geometry hazards verified: Z-downsampled pyramids and non-2 factors break established viewers; ome-zarr-py writers emit centering translations per level; chunk shapes can exceed array extents and be sharded; vizarr's repetitive-chunk rendering is the documented assumption-driven failure.
Evidence: S043 lines 1-36 and 80-108, S016 lines 268-294 (esp. 285-286), S055 lines 1-75, S014 lines 128-151

- **Exact constraint:** level choice must respect level geometry — levels can be Z-downsampled and have non-2, non-uniform factors, and dataset translations can center levels (O-027, O-050); chunk shapes can exceed array extents and be sharded (O-018). The documented failure class is choosing/reading levels by assumption (vizarr's "same number of Z-sections" expectation; repetitive-chunk rendering).

#### [B-045] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "The viewer chooses an available pyramid level appropriate for the current view"

Basis: supported
Reason: The alternatives are evidenced: AGAVE documents sub-region selection and a low-res-first workflow, and its zarr dialog shows per-level memory estimates; a manual override is a reasonable safety valve for automatic selection.
Evidence: S117 lines 98-134 (esp. 127-128), S125 lines 47-63 (esp. 55)

- **Product consequence:** automatic choice needs viewport↔level math plus per-level size feedback; the simpler alternative (implemented in the desktop analog) is a level picker with memory estimates and optional sub-region, with documented low-res-first workflow (O-060, O-063). If automatic selection is kept, a manual override is the safety valve.

#### [B-046] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "The viewer chooses an available pyramid level appropriate for the current view"

Basis: supported
Reason: Validation proposal targets the two documented failure signatures (repeated chunks on Z-downsampled pyramids, breakage on non-uniform factors), both evidenced in the matrix.
Evidence: S043 lines 1-36 and 80-108, S014 lines 128-151

- **Distinguishing validation idea:** pyramid with Z-downsampling and a factor-3 level: zoom from 1× to 1/16× and assert the displayed features stay put (no repeated chunks, no drift), and that the chosen level changes at sane thresholds.

#### [B-048] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L7 — "Large image reads run in the background… Changing the selected view cancels work…"

Basis: supported
Reason: Covered disposition is right; the adjacent cache-policy capability note is a fair optional item (Plan promises background reads + cancellation, not a cache policy).
Evidence: case/plan/Viewer.md L7; S114 lines 7-23 and titles (grep-verified volumecache/memory-estimate items)

- **Disposition: covered** (as a specified obligation), with an adjacent **optional_capability** (cache policy).

#### [B-049] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L7 — "Large image reads run in the background… Changing the selected view cancels work…"

Basis: supported
Reason: The analog's #1 pain is exactly blocking, hard-to-cancel loads during time-series playback; its shipped answers were an in-memory volume cache and memory-estimate UI; sharded-read pain is correctly labeled search-listing evidence only.
Evidence: S103 lines 3-19 and 58 (grep-verified body), S104 lines 3-19, S105 lines 3-19, S119 lines 3-19, S114 titles (grep-verified), S049 lines 1-26, S028 line 456

- **Exact constraint:** the direct desktop analog's most-upvoted issue is exactly "loading blocks the whole application and is not easy to cancel" during time-series playback (O-064, S103); its shipped answers were an in-memory volume cache and memory-estimate UI (O-066); sharded local reads are a known performance pain point ecosystem-wide (O-018, O-045 — search-listing evidence only, S049).

#### [B-050] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L7 — "Large image reads run in the background… Changing the selected view cancels work…"

Basis: supported
Reason: Consequence follows from the verified evidence: cancellation policy for partially-read data and time-series scrubbing as the stress case mirror the analog's documented failure mode.
Evidence: S103 line 58, S104 lines 3-19

- **Product consequence:** cancellation needs a defined policy for partially-read data (discard vs cache), and time-series scrubbing is the stress case, not static pan/zoom.

#### [B-051] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L7 — "Large image reads run in the background… Changing the selected view cancels work…"

Basis: supported
Reason: Validation idea is anchored on verified tracker items: cancellable async loading (#84) and the GPU/RAM leak on image switch (#276).
Evidence: S103 lines 3-19 and 58, S119 lines 3-19

- **Distinguishing validation idea:** start loading a large level, switch images/timepoints mid-read, and assert: UI stays responsive, the superseded read is cancelled (no completion-driven repaint of the old view), and memory returns to baseline (the analog had a GPU/RAM leak bug on image switch, O-064).

#### [B-053] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L7 — "Opening failures explain which image or data could not be displayed and allow the user to choose another item"

Basis: supported
Reason: The correction stands: the reference library's own tracker lists the error-UX gaps as open, so failure UX cannot be inherited from parse_url-style APIs.
Evidence: S019 lines 213-233, S028 lines 2320, 2776, 4444 (grep-verified)

- **Disposition: covered**, with a **correction**: this cannot be inherited from reference libraries.

#### [B-054] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L7 — "Opening failures explain which image or data could not be displayed and allow the user to choose another item"

Basis: supported
Reason: The constraint is supported: parse_url collapses missing vs broken into None; real files violate MUSTs (plate without version); misleading names exist; draft-only transform types (rotation/sequence/displacement) exist in PR #206's history but not in released 0.5; and dtype ceilings in established viewers are documented (AGAVE docs: 8/16u/32f only; Viv: 8 dtypes) — noting the original O-023 grep citation is void (S120 has no content), the proposition survives on the other citations.
Evidence: S019 lines 213-233, S028 line 2776, S056 lines 1-160, S098 lines 64-85, S004 lines 141-166 and 195-310 (grep-verified), S003 lines 17-35 (esp. 25-27), S117 line 45 (read directly), S025 lines 79-92 (grep-verified)

- **Exact constraint:** parse_url-style APIs collapse missing vs broken into None (O-036); reference tracker lists error-UX gaps as open (O-071); real files violate MUSTs (O-019) and misleading names exist (O-080); unsupported dtypes/transforms/versions will occur (O-023, O-038 draft-only transform types, O-001 editor drafts).

#### [B-055] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L7 — "Opening failures explain which image or data could not be displayed and allow the user to choose another item"

Basis: supported
Reason: The error-taxonomy consequence matches the verified failure classes (unreadable arrays, unsupported codecs/shards/dtypes/transforms, version mismatch, inconsistent hierarchy), each evidenced in the corpus.
Evidence: S044 lines 118-154, S035 line 2147, S056 lines 1-160, S098 lines 64-85, S004 lines 141-166

- **Product consequence:** Slide Scout needs its own error taxonomy (missing metadata, unreadable array, unsupported codec/shard/dtype/transform, version mismatch, inconsistent hierarchy) each naming the offending node, with the list still usable.

#### [B-056] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L7 — "Opening failures explain which image or data could not be displayed and allow the user to choose another item"

Basis: supported
Reason: The malformed-fixture pack maps one-to-one to verified corpus cases (plate missing version; identity transforms proposed for disallowal; window start/end handling differences between reference readers; partial omero via --no-minmax; misleading names).
Evidence: S056 lines 1-160, S035 line 2147, S018 lines 268-427 (esp. 375-391), S048 lines 221-338 (esp. 316-324), S033 lines 346-359, S098 lines 64-85

- **Distinguishing validation idea:** malformed-input fixture pack (truncated zarr.json, missing dataset path, float label image, unknown ome.version, plate without version, identity transform in datasets): each must produce a specific message plus a working "choose another image" path, never a crash.

#### [B-058] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — "should interoperate with filesets from real OME-Zarr 0.5 tools"

Basis: supported
Reason: The correction is accurate: the Plan names "real OME-Zarr 0.5 tools" but never names the Zarr v3 storage surface (shards, codecs, chunk key encodings) that 0.5 is defined on, nor a producer set.
Evidence: case/plan/Viewer.md L9; S003 lines 57-80 (esp. 67-72)

- **Disposition: correction** (under-specified: "real tools" must be enumerated, and the hard half of 0.5 — the Zarr v3 storage surface — is nowhere named in the Plan).

#### [B-059] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — "should interoperate with filesets from real OME-Zarr 0.5 tools"

Basis: supported
Reason: The producer set and storage surface are each corpus-verified: challenge converter (sharding option, zarr.json migration, ro-crate), bioformats2raw (0.4 default, 0.5 opt-in, codec floor, little-endian), IDR samples, ome-zarr-py (2D-only downsampling, degenerate defaults), WEBKNOSSOS (sharded v3), SpatialData (permissive 0.5), NGFF-Converter, plus crc32c sharding indexes.
Evidence: S034 lines 32-54, S033 lines 140-205 and 346-359, S010 lines 1018-1151, S029 lines 293-296 and 334-336, S058 lines 346-362, S052 v0.19.0 body, S070 lines 52-109 (esp. 107), S055 lines 1-75, S044 lines 118-154

- **Exact constraint:** producer set evidenced in-corpus: ome2024-ngff-challenge converter (sharded, ro-crate, zarr.json migration — O-047), bioformats2raw 0.4-default/0.5-opt-in (O-048), IDR samples (O-046), ome-zarr-py (2D-only downsampling, degenerate defaults — O-044), WEBKNOSSOS (sharded v3, O-068), SpatialData (permissively-validated 0.5, O-056), NGFF-Converter (O-075). Storage surface: sharding (incl. upcoming "auto"), blosc/gzip/zstd/null codecs, crc32c indexes, little-endian (O-018, O-045, O-048, O-047).

#### [B-060] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — "should interoperate with filesets from real OME-Zarr 0.5 tools"

Basis: supported
Reason: The version-provenance consequence is verified: 0.5 read (PR open Nov 2024), 0.5 write default (Aug 2025), and napari-ome-zarr's all-series opening (May 2026) differ by more than a year across tools.
Evidence: S008 lines 140-171, S013 lines 118-193, S065 lines 21-44

- **Product consequence:** acceptance fixtures must span producers and storage shapes; interop claims should name the producer and version, since 0.5 support dates differ by a year across tools (O-041, O-042, O-055).

#### [B-061] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — "should interoperate with filesets from real OME-Zarr 0.5 tools"

Basis: supported
Reason: Validation proposal is anchored on real corpus shapes (challenge-style sharded filesets like 4496763/9822152; b2r codec matrix from S033's supported-codec table; known-good decode comparison).
Evidence: S034 lines 62-78, S033 lines 140-205, S055 lines 1-75

- **Distinguishing validation idea:** a locally-captured sharded challenge-style fileset (single-shard-per-Z layout like 4496763) plus a blosc-gzip-zstd-null codec matrix, each opened and pixel-compared against a known-good decode.

#### [B-063] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — "Source files remain unchanged; display settings are local to the viewing session"

Basis: supported
Reason: "Covered" is correct: the Plan states read-only and session-local settings at L9, and the corpus readers open read-only (mode "r" paths).
Evidence: case/plan/Viewer.md L9; S019 lines 79-98 (esp. 83-84)

- **Disposition: covered.**

#### [B-064] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — "Source files remain unchanged; display settings are local to the viewing session"

Basis: supported
Reason: Read-only open paths verified (mode "r" throughout io.py; the challenge resave never modifies input), and the rejected alternative is real: AGAVE's saved-settings JSON stores an absolute data path (brittle, session-crossing). Note the draft's "O-019" tag for mode "r" is a mis-cite; the fact is in S019.
Evidence: S019 lines 79-98 and 213-233, S034 lines 150-168 (esp. 155-156, grep-verified), S108 line 27 (read directly)

- **Exact constraint:** read-only open paths throughout the corpus readers (O-019 mode "r"; the challenge resave likewise never modifies input, O-047). The rejected alternative is visible in the corpus: AGAVE persists settings to a JSON containing an absolute file path (O-062/AGAVE HELP L27) — brittle and session-crossing.

#### [B-065] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — "Source files remain unchanged; display settings are local to the viewing session"

Basis: supported
Reason: The consequence is consistent with the Plan's review gate: any settings persistence would be an additional capability requiring explicit review.
Evidence: case/plan/Viewer.md L9

- **Product consequence:** trivial to honor but worth an explicit test; settings persistence (if ever added) is an "additional capability" under the L9 review gate.

#### [B-066] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — "Source files remain unchanged; display settings are local to the viewing session"

Basis: supported
Reason: Checksum validation idea is a sound, cheap test of the read-only obligation on the documented session operations.
Evidence: case/plan/Viewer.md L9; S019 lines 79-98

- **Distinguishing validation idea:** checksum all fixture files before/after a session that opens, pans, zooms, switches channels and force-closes.

#### [B-068] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — exclusions ("Image editing, export, remote storage and automated … interpretation are outside")

Basis: supported
Reason: Boundary disposition plus watch item is right: local-only excludes the storage-related failure classes by construction, while non-image payloads inside local filesets remain a discovery obligation.
Evidence: case/plan/Viewer.md L9; S028 line 4368 (labels from buckets), S028 line 3080 (proxy), S034 lines 32-54 (ro-crate), S003 lines 144-214 (OME/METADATA.ome.xml)

- **Disposition: covered** (boundary) with one **unresolved** watch item.

#### [B-069] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — exclusions ("Image editing, export, remote storage and automated … interpretation are outside")

Basis: supported
Reason: All constraints verified: OME-XML, ro-crate-metadata.json and OME/METADATA.ome.xml must be classified without being treated as images; the cited storage failures (labels from buckets, proxy issues) are remote-specific and located.
Evidence: S003 lines 144-214 and 253-282, S034 lines 32-54, S028 lines 3080 and 4368 (grep-verified)

- **Exact constraint:** local-filesystem-only simplifies storage (no HTTP range/S3), but several corpus failures are storage-related (labels from buckets O-071; proxy issues S028 titles) and thus out of scope by construction. Watch item: local filesets embed non-image payloads (OME-XML, ro-crate, OME/METADATA.ome.xml — O-012, O-047) that discovery must classify without treating as images.

#### [B-070] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — exclusions ("Image editing, export, remote storage and automated … interpretation are outside")

Basis: supported
Reason: Consequence follows: the storage layer stays thin while discovery remains hierarchy-aware, per the verified payload inventory.
Evidence: S003 lines 144-214 and 253-282, S034 lines 32-54

- **Product consequence:** the boundary keeps the storage layer thin; discovery must still be hierarchy-aware.

#### [B-071] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — exclusions ("Image editing, export, remote storage and automated … interpretation are outside")

Basis: supported
Reason: Validation idea matches the verified b2r layout (OME group, METADATA.ome.xml, ro-crate, numbered image groups) and the spec's MAY-ignore rule for non-image groups.
Evidence: S003 lines 144-214 and 253-282 (esp. 275), S034 lines 32-54

- **Distinguishing validation idea:** fixture with OME/METADATA.ome.xml + ro-crate-metadata.json + numbered image groups; assert exactly the image groups are listed.

#### [B-073] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — "Additional capability choices require explicit review"

Basis: supported
Reason: All review-gate candidates are corpus-evidenced as user demand or ecosystem direction: channels from separate files and LUTs (AGAVE tracker titles), 0.6 scenes/RFC-5 (release notes and ngff issues), zip stores (RFC-9 listed in the RFC index and an open ome-zarr-py zipStore issue), >5D (RFC-3).
Evidence: S112 lines 15, 785 (grep-verified), S052 v0.19.0 body (grep-verified), S035 line 356, S051 lines 63, 74, 87, 104-112 (grep-verified), S028 line 3612 (grep-verified)

- **Disposition: covered** (gate). Items that would cross it, evidenced as user-demand or ecosystem direction: multi-image overlay sessions / channels from separate files (O-065); LUT-based channel display (O-065); 0.6 scenes/RFC-5 transforms (O-053, O-056); zip stores (RFC-9, O-053; ome-zarr-py open issue S028); >5D arrays (RFC-3, O-053).

#### [B-075] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L11 — "Acceptance uses representative filesets…"

Basis: supported
Reason: "Unsupported as written" is accurate: the Plan's L11 says "representative filesets" without defining them, and the corpus supplies the concrete definition.
Evidence: case/plan/Viewer.md L11

- **Disposition: unsupported as written** (the Plan does not say what "representative" is); **correction** available cheaply from the corpus.

#### [B-076] QUALIFIED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L11 — "Acceptance uses representative filesets…"

Basis: supported
Reason: The fixture inventory verifies (IDR 0.5 plates 384/1 and 49/32 wells/fields, 2D XY, XYZ, XYZC, XYZCT, 0.5 b2r collections, 21.57 GB single-plane image; PR #123's test list; S068 binary), but "no multi-entry-multiscales fixture exists anywhere" is wrong: the ome-ngff-tools matrix exercised a real multi-multiscales sample (4995115.zarr) — it is 0.4; the gap is that no 0.5 multi-multiscales fixture appears in the corpus.
Evidence: S010 lines 1018-1151, S024 lines 9-25 and body (grep-verified), S068 line 1, S043 lines 277-316 (esp. 279), S034 lines 62-78

Active (verified replacement; the draft text is superseded history):

- **Exact constraint:** concrete 0.5 fixtures with provenance exist in-corpus: the IDR 0.5 sample list (S010 L1018-1151: a plate with 384 wells/1 field, a plate with 49 wells/32 fields, 2D XY-only, XYZ, XYZC and XYZCT images, bioformats2raw.layout collections, and the 21.57 GB single-plane 9822152.zarr per S034 L69-70) and napari-ome-zarr PR #123's test URL list (S024). Gaps: no 0.5 fixture with multiple multiscales entries appears in the corpus's 0.5 sample lists — the only real multi-multiscales sample evidenced is the 0.4 fileset 4995115.zarr used by the ome-ngff-tools matrix (S043 L277-283) — and no readable 0.4/0.5 mixed-hierarchy sample exists in-corpus (the one 0.4 .zattrs capture, S068, is retained as binary, O-020).

#### [B-077] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L11 — "Acceptance uses representative filesets…"

Basis: supported
Reason: The consequence holds with the B-076 correction: acceptance can anchor to named public filesets, and the multi-multiscales case must be synthetic because no 0.5 multi-multiscales fixture exists in-corpus.
Evidence: S010 lines 1018-1151, S043 lines 277-316, S024 lines 9-25

- **Product consequence:** acceptance can be anchored to named public filesets plus synthetic spec-edge fixtures; the multi-multiscales case must be synthetic.

#### [B-078] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L11 — "Acceptance uses representative filesets…"

Basis: supported
Reason: The fixture-matrix validation idea is consistent with the verified producer/shape inventory and adds the synthetic malformed pack whose members are individually corpus-evidenced.
Evidence: S010 lines 1018-1151, S034 lines 32-54, S033 lines 140-205, S056 lines 1-160

- **Distinguishing validation idea:** adopt a fixture matrix: {per-producer 0.5 filesets} × {image, plate, collection, labels} × {sharded, plain} + synthetic malformed pack; record expected image lists and coordinate values.

#### [B-080] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L11 — "A large dataset must not freeze interaction"

Basis: supported
Reason: "Covered with differentiating risk" is supported: the matrix and tracker show zoom-during-load crashes, blocking loads, leaks and GPU ceilings are exactly where established products fail.
Evidence: S043 lines 1-36 and 207-238, S103 line 58, S119 lines 3-19, S115 lines 4-22

- **Disposition: covered** (promise), with evidence it is the differentiating risk.

#### [B-081] QUALIFIED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L11 — "A large dataset must not freeze interaction"

Basis: supported
Reason: The failure inventory verifies, but "1 TB plates ... are real 0.5 data (O-046)" is not evidenced: no corpus source states a 1 TB size (largest stated is 21.57 GB single-plane; the largest plate's size is not stated anywhere in-corpus).
Evidence: S043 lines 1-36 and 207-238, S103 line 58, S119 lines 3-19, S115 lines 4-22, S034 lines 62-78 (esp. 69-70), S010 lines 1018-1151 (grep for TB/GB sizes: no matches)

Active (verified replacement; the draft text is superseded history):

- **Exact constraint:** the analog product's tracker and the viewer matrix show zoom-time crashes on plates and pyramids in established viewers (S043 L1-36, L207-238), blocking non-cancellable loads during time-series playback (S103 L58), memory leaks on image switch (S119), and GPU-memory ceilings for volume approaches (S115 L14; S062 L7). Real 0.5 scale is large but bounded in-corpus: a 21.57 GB single-plane image (9822152.zarr, S034 L69-70) and plate-scale data (190129.zarr: 2048×2044×31 per field with 49 wells × 32 fields, S010 L1040-1047, S056); no in-corpus source states a 1 TB dataset, so size claims should use the evidenced figures.

#### [B-082] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L11 — "A large dataset must not freeze interaction"

Basis: supported
Reason: The 2D-canvas simplification is evidenced (volume viewers are GPU-bound by their own docs) and zoom-during-load on plate/stitched data is the documented crash scenario.
Evidence: S115 lines 4-22 (esp. 14), S062 lines 1-23 (esp. 7), S043 lines 207-238, S043 lines 1-36

- **Product consequence:** the 2D-canvas approach avoids the volume-rendering memory ceiling (O-059) — worth stating as the deliberate product simplification; interaction freeze testing must include zoom-during-load on plate/stitched data.

#### [B-083] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L11 — "A large dataset must not freeze interaction"

Basis: supported
Reason: Validation idea matches the documented failure modes (zoom during load, repeated image switching leaks) with responsive-UI and memory-baseline assertions.
Evidence: S103 line 58, S119 lines 3-19, S043 lines 207-238

- **Distinguishing validation idea:** open the largest local fixture, immediately zoom/pan and scrub time; sample UI thread responsiveness; assert no unbounded memory growth across repeated image switches.

#### [B-085] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L11 — "Malformed or unavailable input must produce understandable feedback rather than a crash"

Basis: supported
Reason: Each listed malformed case is corpus-evidenced: plate missing version, identity transforms (proposal to disallow implies they occur), window start/end divergence between reference readers, partial omero via --no-minmax, and misleading names.
Evidence: S056 lines 1-160, S035 line 2147, S018 lines 268-427 (esp. 375-391), S048 lines 221-338 (esp. 316-324), S033 lines 346-359, S098 lines 64-85

- **Disposition: covered** (see L7 failure-UX row for the shared constraint/validation idea); the corpus adds specific malformed cases to test: plate missing `version` (O-019), identity transforms (O-073), window missing start/end (O-030/O-032's differing behaviors), partial omero (O-048), misleading names (O-080).

#### [B-087] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### Not in the Plan at all (each **unresolved** for Plan purposes, obligation established by corpus)

Basis: supported
Reason: Verified: the spec makes multiple named multiscales a user choice with first-entry fallback, both reference readers read only multiscales[0], and in the matrix every viewer with a supported field is "supported: no" with several crashing — so the unresolved product question (list vs first-entry-only) is genuine.
Evidence: S003 lines 290-327 and 390-482 (esp. 298, 317, 388-397), S018 lines 268-323 (esp. 279-296), S048 lines 191-221 (esp. 201), S043 lines 277-316

- **Multiple multiscales entries** — spec-defined user choice, zero ecosystem support, some viewers crash (O-008, O-029, O-033, O-050). Unresolved: whether Slide Scout lists them (spec-faithful, beyond-ecosystem) or matches ecosystem behavior (first entry only). Product decision needed.

#### [B-088] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### Not in the Plan at all (each **unresolved** for Plan purposes, obligation established by corpus)

Basis: supported
Reason: Verified: the whole-Zarr-v3 feature surface is obligatory for 0.5, sharding is mainstream in real files; the Plan leaves both the storage-feature strategy and the stack choice open; the candidate routes (tensorstore C++, zarr-python >=3, napari's direct-zarr rewrite) are each corpus-evidenced (tensorstore v0.1.78 vendoring is evidenced at S096 L9 even though O-070's S120 cite is void).
Evidence: S003 lines 57-80, S055 lines 1-75, S111 lines 3-19, S113 lines 23-39, S096 lines 1-9 (read directly), S015 lines 28-71, S024 lines 9-25, case/plan/Viewer.md

- **Zarr v3 storage-feature strategy** (shards/codecs) — obligatory per O-002/O-018 but unspecified in the Plan; build-vs-library decision also open (tensorstore C++ route O-070/O-074 vs zarr-python ≥3 route O-079 vs napari's direct-zarr rewrite precedent O-054). Unresolved in-corpus.

#### [B-089] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### Not in the Plan at all (each **unresolved** for Plan purposes, obligation established by corpus)

Basis: supported
Reason: Verified: the strict-vs-permissive decision is live — the reference reader deliberately loosened 0.5 validation for SpatialData, AGAVE infers version from Zarr format, and 0.6rc0 signals are in the ngff tracker — and the Plan does not state a policy.
Evidence: S052 v0.19.0 body (grep-verified), S082 lines 47-63, S035 lines 348-364, case/plan/Viewer.md L9

- **Version handling policy** — strict 0.5-only vs permissive (SpatialData precedent O-056; AGAVE inference O-067; spec signals 0.6rc0 approaching O-073). Unresolved product decision.

---

#### [B-091] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 4. Simpler alternatives and opportunities noted (not obligations)

Basis: supported
Reason: Verified: AGAVE ships a manual resolution-level picker with per-level memory estimates and sub-region ROI, documented with a low-res-first workflow — the simpler alternative pattern the block describes.
Evidence: S117 lines 98-134, S125 lines 47-63 (esp. 55)

- **Manual level picker with memory estimate + sub-region ROI** instead of fully automatic level choice — shipped pattern in the closest desktop analog (O-060, O-063); automatic choice can layer on top later.

#### [B-092] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 4. Simpler alternatives and opportunities noted (not obligations)

Basis: supported
Reason: Verified: AGAVE/Vol-E are GPU-bound (path tracer; GPU memory dictates max load size) while vizarr proves the 2D-slice product class with eight dtypes.
Evidence: S115 lines 4-22, S062 lines 1-23, S025 lines 79-92

- **2D-slice canvas (Plan's shape)** vs volume rendering: avoids GPU-memory ceilings that bind AGAVE/Vol-E (O-059); vizarr proves the 2D-slice product class with 8-dtype support (O-058).

#### [B-093] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 4. Simpler alternatives and opportunities noted (not obligations)

Basis: supported
Reason: Verified: ome-zarr-py stitches wells into an almost-square grid with zero-filled missing fields, while the spec explicitly allows offering users a choice of images — a real product fork requiring a deliberate choice.
Evidence: S018 lines 394-472 (esp. 406-409, 428-438), S003 lines 253-282 (esp. 274)

- **Stitched-plate rendering vs well-by-well navigation**: ome-zarr-py stitches with zero-filled gaps (O-031); the spec explicitly allows offering users a choice of images (O-012). Well-navigation is simpler and avoids fake data; stitching is the incumbent behavior to consciously accept or reject (product choice).

#### [B-094] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 4. Simpler alternatives and opportunities noted (not obligations)

Basis: supported
Reason: Verified: the ome-zarr finder + BioFile Finder pattern (CSV/manifest + external browser, desktop+web with a local file-explorer service) is the incumbent local-browsing shape; Slide Scout's integrated list is the delta.
Evidence: S023 lines 142-165 (esp. 153), S022 lines 1-20, S066 lines 16-27, S067 lines 1-16

- **Collection browsing via manifest/CSV + external app** (ome-zarr finder + BioFile Finder, O-043/O-069) — the incumbent local-browsing shape; Slide Scout's integrated list is the delta.

#### [B-095] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 4. Simpler alternatives and opportunities noted (not obligations)

Basis: supported
Reason: All five differentiators are matrix/tracker-evidenced gaps: omero colors/rdefs ignored by several viewers; group-level multiscales scale unapplied by napari-ome-zarr; dynamic scale bar an open vizarr request with many viewers lacking scalebar support; labels URLs hand-assembled via the validator; b2r series enumeration fixed only in May 2026.
Evidence: S043 lines 38-78, 318-350, 394-428; S050 lines 2284, 2436 (grep-verified); S041 lines 1-28 (esp. 11-14); S065 lines 21-44

- **Differentiators with documented ecosystem gaps**: omero-faithful defaults incl. greyscale model and rdefs (O-051); group-level transform composition (O-051, napari gap); dynamic scale bar / calibrated display (O-072 — vizarr request open); in-product labels discovery (O-052); b2r series enumeration (fixed only May 2026 in napari-ome-zarr, O-055).

#### [B-096] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 4. Simpler alternatives and opportunities noted (not obligations)

Basis: supported
Reason: Verified: AGAVE's docs ship timestamp overlays in physical time units and per-timepoint transfer-function adaptation (absolute vs percentile) — absent from the Plan, a legitimate review-gate candidate.
Evidence: S117 lines 294-324 (esp. 302-314), S117 lines 505-537 (grep-verified esp. 521-532)

- **Timestamp overlay in physical time units and per-timepoint window adaptation** — shipped in AGAVE docs (O-061), absent from the Plan; candidate future capability under the L9 review gate.

---

#### [B-098] QUALIFIED
Context: # Slide Scout — corpus research report (draft) > ## 5. Deferred items (with reasons)
Table columns: | Item | Reason for deferral |

Basis: counterevidence
Reason: The deferral itself is sound (0.6/RFC-5 content is not part of released 0.5), but the stated reason "RFC text not in corpus" is false: S051 is the RFC-5 page and contains the full proposal text (state S3 "Update implementations", the coordinateSystems/axes/transformation semantics from L312 on).
Evidence: S003 lines 17-35 (esp. 25-27), S051 lines 1, 79-129, 130-209, 255-374 (read directly)

Active (verified replacement; the draft text is superseded history):

| 0.6 scenes / RFC-5 coordinate systems & transforms | Not part of released 0.5 (S003 L25-27: 0.5 is the released version; editor's-draft data "will not necessarily be supported"). The RFC-5 draft text IS in-corpus (S051: RFC state S3 "Update implementations" at L130; Proposal with coordinateSystems/axes/transform semantics from L312), and 0.6 support is already shipping in the reference stack (S052 v0.19.0; S035 "0.6rc0 schemas" issue), but it targets the next version and is still converging. Deferral stands: handle via clear "unsupported version/transform" messaging only, and treat S051 as the reference if 0.6 support is later reviewed.

#### [B-099] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 5. Deferred items (with reasons)
Table columns: | Item | Reason for deferral |

Basis: supported
Reason: Verified: remote/http/S3 is excluded by Plan L9, and the corpus storage-failure evidence (labels from buckets, proxy issues) is remote-specific, so the deferral is correct.
Evidence: case/plan/Viewer.md L9; S028 lines 3080, 4368 (grep-verified)

| Remote/http/S3 storage | Excluded by Plan L9 / brief L5; corpus failure evidence (O-071) is remote-specific. |

#### [B-100] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 5. Deferred items (with reasons)
Table columns: | Item | Reason for deferral |

Basis: supported
Reason: Verified: zip stores are RFC-9 (listed in the RFC index) with open zipStore friction in the reference library ("unable to write_image into a zipStore?"), so detect-and-explain deferral is right.
Evidence: S051 line 112 (grep-verified), S028 line 3612 (grep-verified)

| Zip stores (RFC-9) | Future RFC (O-053); open issue even in reference lib (S028). |

#### [B-101] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 5. Deferred items (with reasons)
Table columns: | Item | Reason for deferral |

Basis: supported
Reason: Verified: >5D arrays and axis orientation are RFC-3/RFC-4 future work, not released 0.5; detect-and-explain is the right scope.
Evidence: S051 lines 63, 74 (grep-verified), S003 lines 290-327 (esp. 296: 2–5 dims)

| >5D arrays, axis orientation (RFC-3/4) | Future RFCs (O-053); detect-and-explain only. |

#### [B-102] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 5. Deferred items (with reasons)
Table columns: | Item | Reason for deferral |

Basis: supported
Reason: Verified: multi-image overlay sessions / channels from separate files breach the single-fileset boundary (Plan L9) while user demand exists in the analog's tracker — a correct review-gate deferral.
Evidence: case/plan/Viewer.md L9; S112 line 15 (grep-verified)

| Multi-image overlay sessions; channels from separate files | Breaches single-fileset boundary (Plan L9); user demand exists elsewhere (O-065) — review-gate item. |

#### [B-103] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 5. Deferred items (with reasons)
Table columns: | Item | Reason for deferral |

Basis: supported
Reason: Verified: the corpus holds only issue-title/listing evidence for sharded-read performance (S049 listing; S028 title), no measurements — so correctness-first deferral is right.
Evidence: S049 lines 1-26, S028 line 456, S102 lines 1-7

| Sharded-read performance tuning | Needs measurement on real hardware; corpus has only issue-title evidence (S049, O-018). Correctness first. |

#### [B-104] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 5. Deferred items (with reasons)
Table columns: | Item | Reason for deferral |

Basis: supported
Reason: Verified: consolidated metadata appears in the reference tracker as an open question and is not among 0.5's metadata obligations (§2.1-2.8 of the spec enumerate them; none is consolidated metadata).
Evidence: S028 line 1610 (grep-verified), S003 lines 28-35 (section list) and 144-568

| Consolidated metadata | Unresolved concept in zarr ecosystem (S028 title); no 0.5 obligation. |

#### [B-105] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 5. Deferred items (with reasons)
Table columns: | Item | Reason for deferral |

Basis: supported
Reason: Verified: 3D/volume rendering is outside the Plan's 2D canvas scope, and the GPU-memory ceiling in volume viewers is documented — the deliberate-simplification note stands.
Evidence: case/plan/Viewer.md L5; S115 lines 4-22, S062 lines 1-23

| 3D/volume rendering | Out of Plan scope; noted as the deliberate simplification (O-059). |

## 2. Rejected draft assertions (no acceptance credit)

(none)

## 3. Not verified: unresolved, undecided or malformed-record proposals (no retention credit)

(none)

## 4. Verifier additions (new verifier assertions; checked like any claim)

# Verifier additions — material items the draft lost, corrections, and coverage

Companion to out/decisions.md. Everything below was checked against case/sources/ directly.

## 1. Corrections to observations the draft inherited (restated with sources)

1. **O-051's parenthetical about dataset-level scale is wrong.** It says "only some viewers (Vol-E no, napari yes) read dataset-level scale for a scalebar". The matrix (S043) shows for *dataset-level* scale (L318-350): Vol-E supported: **yes**, napari supported: **yes** (avivator, vizarr, OMERO, Microscopy Nodes are the "no" rows). It is the *group-level multiscales* scale (L394-428) where Vol-E and napari are both "supported: no". No draft block repeated the error, but the corrected reading is: dataset-level scale is widely read; group-level transform composition is the ecosystem gap.
2. **O-023 has no corpus support.** It cites "S120 lines 25-28" (AGAVE four-dtype whitelist grep), but S120 is a single line: "No literal matches. This does not establish semantic absence." The bundle flags the citation as beyond end-of-source. The draft's use in B-019 was qualified accordingly; B-054 survives on other evidence. The closest documented fact is S117 L45: "AGAVE can read 8-bit, 16-bit unsigned, or 32-bit float pixel intensities" (see §2 below).
3. **O-070's tensorstore-version citation is broken but the fact is true.** "AGAVE vendors tensorstore v0.1.78 (S120 lines 9, 38)" — those lines do not exist. The fact is evidenced at **S096 line 9**: AGAVE's CMake pins `https://github.com/google/tensorstore/archive/refs/tags/v0.1.78.tar.gz`.
4. **O-022 (and draft B-107's coverage) wrongly classify S096 and S121 as failed/empty captures with "no substantive source content".** Both contain grep extracts: S121 holds AGAVE's `FileReaderZarr::getOmero` excerpt showing the 0.5-namespace-first, legacy-fallback omero lookup (`omero = ome["omero"]` … `omero = attrs["omero"]`, S121 lines 5-6) — it is the sole support for O-024; S096 holds AGAVE build-file greps (tensorstore requirement and v0.1.78 pin). The truly empty no-evidence handles are S002, S005, S007, S030, S042, S045, S046, S077, S095, S057 ("[]"), S068 (binary), and **S120** ("No literal matches" — not a capture failure but a null search result; either way it supports nothing).
5. **O-053's condition "RFC contents beyond titles are NOT in this capture" is false.** S051 is the RFC-5 page and contains the full proposal text: RFC state S3 "Update implementations" (L130), roles table, and the Proposal from L312 on — coordinateSystems objects (MUST name + axes), axis types extended with "array"/"coordinate"/"displacement", discrete vs continuous axes with interpolation semantics, and transformations modeled as a directed graph between coordinate systems for multi-image alignment, stitching/tiling, deskew and drift correction. Handled in the B-098 replacement; relevant reference material if the 0.6 review gate ever opens.
6. **O-019's "50 sparse wells" is off by one.** S056's wells array contains 49 entries and S010's 190129 row lists 49 wells / 32 fields. The draft hedged ("190129-like") in B-026, so no block was qualified, but fixtures should say 49.
7. **O-041/B-020's "Nov 2024" is the PR-open era, not a release date.** PR #404 was open Nov 7, 2024 (S008 L140), but the Nov 2024 release (0.10.2) still pinned zarr<3 and the April 2025 changelog (0.11.x) does not list #404; PR activity runs into mid-2025. The merge/release date is not pinned in-corpus (B-020 qualified).
8. **O-046/O-059's "1 TB plates" figure is not in the corpus.** No source states a 1 TB size; the largest stated size is the 21.57 GB single-plane 9822152.zarr (S034 L69-70). B-081 qualified.
9. **O-050's multi-multiscales row nuance.** Every viewer with a `supported` field is "supported: no" and several crash (BigDataViewer, MoBIE: ArrayIndexOutOfBoundsException), but OMERO/ZarrReader's row reads "All images imported but sample image is corrupted. See issue" — so "no tested viewer *opens* images beyond the first" (draft B-017) was qualified to "no tested viewer lists/uses images beyond the first". Also note the matrix's multi-multiscales sample (4995115.zarr) is **0.4**; no 0.5 multi-multiscales fixture appears in-corpus (B-076 qualified).

## 2. New supported findings (not asserted in the draft)

1. **Documented dtype coverage of the desktop analog.** AGAVE docs state: "AGAVE can read 8-bit, 16-bit unsigned, or 32-bit float pixel intensities" (S117 line 45). Together with vizarr/Viv's eight-dtype list (S025 lines 84-85), this grounds the unsupported-dtype messaging requirement (Plan L11, brief L3) without the void O-023 citation.
2. **AGAVE's tensorstore pin.** AGAVE builds against tensorstore v0.1.78 (S096 line 9, CMake URL). Concrete version datum for the B-088 build-vs-library discussion and for O-074's codec/shard edge-case caveats.
3. **RFC-5 draft semantics are in-corpus.** Beyond the titles: coordinateSystems MUST have unique name + axes; axis "type" extended set; "discrete" boolean axis flag with interpolation implications; transformations as a directed graph over coordinate systems (S051 L312-374+). Supports the deferred 0.6 item with real reference text rather than titles only.
4. **Zip-store friction detail in the reference library.** Beyond the open issue title ("unable to `write_image` into a zipStore?", S028 line 3612), a captured PR notes zarr ZipStores are not updatable after creation, so ome-zarr-py's write ordering breaks group attributes (S028 line 2292). Strengthens the B-100/B-073 deferral rationale.
5. **napari-ome-zarr implementation precedents for two watch items.** (a) It forwards per-axis units preserving None entries specifically so napari's scale bar keeps rendering when some layers lack units (S048 lines 249-258) — a concrete pattern for the B-039/B-040 unit handling. (b) It already dispatches a "Scene" spec and a "coordinateSystems" (labeled v0.6+) multiscales form (S048 lines 218-220, 402-495), i.e., next-version metadata is being consumed defensively in the wild.
6. **Plane-selection friction in an established viewer.** vizarr's open tracker includes "Error changing z-plane" and "Allow setting z/t plane" (S050 lines 2812, 3264), plus "Problem in reading contrast metadata" (L2208) and "3D translation causes images to disappear" (L2360) — extra support that the Plan's plane/window controls are live failure surfaces, not commodity features.

## 3. Correct non-findings (negative results that hold)

- S120 supports no claim of any kind (single-line null search result).
- S002 (0 bytes), S005, S007, S030, S042, S045, S046, S077, S095 (failed captures), S057 (empty JSON array), S068 (binary .zattrs) — no evidence either way; not proof of absence.
- S102: zero textual hits for "shard" in the AGAVE tracker — textual absence only; AGAVE's sharding behavior via tensorstore remains unknown.
- No in-corpus source states a 1 TB dataset size.
- No 0.5 fixture with multiple multiscales entries appears in the corpus's 0.5 sample lists (the only real multi-multiscales sample evidenced is 0.4's 4995115.zarr, S043 L279).
- The corpus contains no readable 0.4/0.5 mixed-hierarchy sample (S068 is binary).

## 4. Grouped product decisions for the user (from the decided blocks)

1. **Discovery scope and multi-multiscales policy** (B-023..B-026, B-087): treat discovery as a first-class classifier (image / plate / well / collection / labels / unsupported); decide whether multiple named multiscales entries are listed (spec-faithful, zero ecosystem precedent) or the ecosystem's first-entry-only behavior is matched.
2. **Zarr v3 storage strategy** (B-003, B-012, B-088): the reader must cover the whole v3 surface actually in the wild — sharding_indexed with crc32c indexes, bytes+{blosc, gzip, zstd, null} codecs, little-endian default, chunk shapes exceeding extents. Build-vs-library (tensorstore C++ vs zarr-python ≥3 vs direct implementation) is open.
3. **Version handling policy** (B-089, B-098): strict 0.5-only vs permissive (the reference reader deliberately loosened 0.5 for SpatialData); read `attributes.ome.version` first, tolerate legacy placements; 0.6/RFC-5 content → explicit "unsupported version/transform" messaging.
4. **Level selection UX** (B-043..B-046, B-091): Plan picks automatic selection; the closest desktop analog ships a manual picker with memory estimates and sub-region ROI. If automatic is kept, a manual override is the safety valve; level choice must respect Z-downsampled levels, non-uniform factors, and centering translations.
5. **Plate presentation** (B-093): stitched grid with zero-filled gaps (ome-zarr-py behavior) vs well-by-well navigation (spec-sanctioned choice) — pick deliberately and disclose synthetic zeros if stitching.
6. **Labels overlays** (B-034..B-036): source of truth is the labels-group listing; verify level counts at runtime; compose dataset-then-group transforms; choose initial visibility (established viewers hide labels initially); in-product discovery is a differentiator.
7. **Error taxonomy** (B-053..B-056, B-084, B-085): first-party error classes (missing metadata, unreadable array, unsupported codec/shard/dtype/transform, version mismatch, inconsistent hierarchy) naming the offending node, with the list still usable; malformed-fixture pack for acceptance.
8. **omero fidelity** (B-029..B-031, B-095): honor omero colors/names/windows/active/greyscale model as a differentiator; specify the missing/partial-omero fallback (required path via b2r --no-minmax); window start/end is display range vs min/max data range; bounds-check defaultZ/defaultT.

## 5. Unresolved and unchecked items (carried forward)

1. Reader-side auto-shard behavior and latency in current zarr libraries — issue-title/listing evidence only (S049; S028 line 456).
2. AGAVE's actual behavior on sharded files — zero textual tracker hits (S102) is not capability evidence.
3. PR #404's exact merge/release date — open Nov 2024, activity through mid-2025, not pinned in-corpus.
4. Whether current viewer versions have fixed the April-2025 matrix failures (S041/S043 snapshot is version-pinned).
5. Rectilinear chunk grids in the wild — tensorstore issue titles only (S109); no sample in corpus.
6. Content of the 0.4 `.zattrs` capture (S068, binary).
7. Exact nature of the omero schema inconsistency (S035 line 3943, title only).
8. Which bioformats2raw release first defaulted to 0.5 (README states supported values only, S033 L223-226).
9. Exact permissiveness of ome-zarr-py PR #594 (0.5-for-SpatialData) — release-note title only (S052).
10. Details of napari-ome-zarr #123's pre-0.4 handling beyond its TODO list (S024 body).

## 6. Verifier coverage

- **Verified in full or near-full** (raw source or complete bundle windows): S003 (all cited sections plus L328-397 read directly), S043 (entire features matrix), S048 (all cited ranges plus units/labels/reader-dispatch sections), S016, S018, S019 (including parse_url L213-233), S053, S054, S055, S056 (entire), S108 (entire), S033 (all cited ranges: codecs, --ngff-version, omero defaults, endianness, TCZYX), S034 (challenge outputs, samples, input-immutability), S010 (0.5 sample section), S011, S013, S014, S008 (body and date spans), S004 (body, transform history, #227 closure), S023, S024 (full PR body), S025, S015, S017, S009, S051 (RFC index plus proposal text L130-374), S052 (v0.19.x/v0.13.0 bodies), S065, S062, S072, S115, S117 (cited ranges plus grep), S125, S103/S104/S105/S119, S081/S082/S083, S098, S102, S091, S096, S120, S121, S058, S059 (version-layout grep), S022, S066, S067, S068, S057.
- **Verified by targeted search (titles/fields, each cited title individually located):** S028 (11 titles), S035 (10 titles), S050 (8 titles plus spot reads), S109, S112, S114 (title greps).
- **Seen via bundle only (search-listing captures, no claims rest on them):** S001, S012, S021, S032, S036, S049, S060, S069, S071.
- **Not read; no claims made from them:** S026, S027, S037, S038, S039, S040, S041 beyond the versions window, S044 beyond the cited issue, S047, S052 releases other than the bodies grepped, S057, S063/S064 (napari 0.7.x release bodies — cited only as "read" in the draft's coverage), S066/S067 beyond windows, S070 (grep only), S073/S074/S078/S079/S080, S084-S089, S090, S092-S094, S097, S100, S101, S105 beyond the cited window, S106-S111 partial, S113 beyond window, S116, S118, S122-S125 (S125 verified), S122-S124.
- **Every quotation flagged not_located by the host's locator was opened in the raw source**; all were confirmed as elision artifacts except O-023 and O-070's S120 citations, which are beyond end-of-source (S120 has one line) and were treated accordingly (B-019 qualified; O-070's fact re-sourced to S096).

## 5. History appendix

### 5.1 Complete stage-1 draft with block decisions

[B-001: NOT A CLAIM (bookkeeping)]
# Slide Scout — corpus research report (draft)

Case `ome-zarr-thin`. Report based solely on `case/sources/S001–S125` (fixed corpus), the brief, and the frozen Plan snapshot `case/plan/Viewer.md`. Every supported proposition cites observation IDs from `out/observations.md` (O-001…O-080), which in turn cite source lines verbatim. Nothing here is independently verified against live systems; a "validation idea" is a proposed test, not a passed one.

Plan cited by line: **L5** (open fileset, list images, canvas pan/zoom, channel controls, time/plane where relevant, label overlays, details panel, automatic pyramid-level choice), **L7** (background reads, cancellation, failure UX), **L9** (interop with real 0.5 tools, read-only, session-local settings, exclusions, review gate), **L11** (acceptance: discovery, navigation, channel/plane controls, calibrated coordinates, aligned overlays, no freeze on large data, understandable failure).

---

[B-002: NOT A CLAIM (bookkeeping)]
## 1. Established format obligations (0.5)

These are normative ("MUST"-level) or de-facto obligatory for reading released OME-Zarr 0.5.

[B-003: CONFIRMED]
1. **0.5 = Zarr v3 with the full Zarr feature surface.** OME-Zarr 0.5 is defined on Zarr v3, and "all features of the Zarr format including codecs, chunk grids, chunk key encodings, data types and storage transformers may be used … unless explicitly disallowed" (O-002, S003 L67-72). The 0.5 text disallows almost nothing. Consequence: a reader that supports only one chunk-grid/codec shape is not 0.5-conformant even if it opens some files.
[B-004: CONFIRMED]
2. **Metadata location and version.** OME metadata lives in `zarr.json` under `attributes.ome`; `ome.version` is a string and MUST be consistent within a hierarchy (O-003, S003 L152-156). The image schema makes `multiscales` + `version` required on an image group (O-016, S053 L22-30). Note: version detection in the wild keys off several locations, including the legacy `multiscales[0].version` (O-026, S016 L81-96) — a validator should check `attributes.ome.version` first but not be surprised by legacy placement.
[B-005: CONFIRMED]
3. **Axes.** 2–5 dimensions; `name` required and unique; `type` recommended (space/time/channel or custom strings); `unit` recommended UDUNITS-2; arrays MUST carry `dimension_names` matching axes (O-004, S003 L166-174). Ordering MUST be time → channel/custom → space; zyx is only SHOULD (O-005, S003 L299-319). Channel/time/plane UI must key off axis **type**, and may be absent entirely (real 0.5 samples include XY-only and XYZ data — O-046, S010 L1026-1133).
[B-006: CONFIRMED]
4. **Multiscales.** `multiscales` is a LIST; datasets paths are arbitrary strings ordered highest→lowest resolution; each dataset MUST have exactly one scale (relative to level 0, default 1.0); MAY have one translation, listed after scale; group-level `coordinateTransformations` are applied after dataset-level ones (O-006/O-007/O-008, S003 L298-397). Missing `name` is legal (SHOULD).
[B-007: CONFIRMED]
5. **omero display block is transitional and optional.** If present: `channels` required; per-channel `color` (6 hex digits) and `window {min,max,start,end}` required; `rdefs` (defaultT/defaultZ, model "color"|"greyscale") described but not covered by the MUSTs (O-009, S003 L398-430). Real files show window `end` far below data `max` (display window vs data range, O-017) and `defaultZ` that must be bounds-checked (S054 L109-113). Producers can legitimately omit it (`bioformats2raw --no-minmax`, O-048).
[B-008: CONFIRMED]
6. **Labels.** `labels` group lists label image paths; label pixels MUST be integer dtypes; each label image MUST be a full multiscales image with the SAME number of levels as the parent (O-010, S003 L431-455); `image-label` colors/rgba/properties/source are SHOULD/MAY with `source.image` defaulting to `../../` (O-011, S003 L454-474). Caution: the spec community itself considers the `source.image` reference mechanism broken and the omero schema inconsistent with its description (O-073, S035 titles), and a real viewer ships a bug where labels are not loaded when the omero block is missing (O-072, S050). Overlay code must therefore use the labels-group listing as the source of truth and verify level geometry at runtime.
[B-009: CONFIRMED]
7. **HCS plates/wells.** plate `{columns, rows, wells[{path,rowIndex,columnIndex}], field_count, acquisitions?, version}` and well `{images[{path,acquisition?}], version}`; sparse plates are normal (empty rows/wells SHOULD NOT exist) (O-013, S003 L118-129, L515-560, L740-752). Real plates violate the `version` MUST (O-019, S056) — strict validation would reject a flagship dataset.
[B-010: CONFIRMED]
8. **bioformats2raw collections (transitional).** `bioformats2raw.layout: 3`, optional `OME/METADATA.ome.xml`, optional `series` path list, else consecutive numbered groups; readers SHOULD NOT default to opening only the first image (O-012, S003 L175-275). Two other discovery conventions coexist (OME-XML Image IDs in napari, O-034; `series` in the spec) — discovery must tolerate disagreement.
[B-011: CONFIRMED]
9. **JSON hygiene.** No comments in JSON; exact historical key spellings (camelCase intent with acknowledged legacy exceptions) (O-014/O-015, S003 L65-66, L809-812).
[B-012: CONFIRMED]
10. **Dataset-level compatibility floor (from real 0.5 corpora).** Sharded arrays are mainstream, not exotic: the flagship IDR 0.5 sample uses `sharding_indexed` (blosc/zstd inside, crc32c index) with chunk shapes larger than the array extent (O-018, S055); the challenge converter shards optionally (O-047), WEBKNOSSOS writes sharded v3 (O-068), and zarr-python "auto" sharding is arriving with OME-layer tools lagging (O-045, S044). Codec floor from the dominant converters: bytes + {blosc, gzip, zstd, null}, little-endian default (O-048, S033 L152-162, L356-359).

---

[B-013: NOT A CLAIM (bookkeeping)]
## 2. Compatibility findings, contradictions and counterexamples

[B-014: CONFIRMED]
- **The 0.4→0.5 break is by design.** Metadata moved from `.zattrs`/`.zarray` into `zarr.json` attributes under an `ome` namespace; version fields moved up; chunk-key encoding became per-array (O-038, S004). 0.4-era files put `version: "0.4"` inside `multiscales[0]` (S059 L347-353). Established readers unwrap `attributes.ome` when present and otherwise read flat attributes (O-032, S048 L166-170; O-036, S019 L87-90). A 0.5-only viewer still needs this dual read if it ever meets 0.4 data; the corpus contains both (catalog: 0.4 and 0.5 sample URLs in S010; a 0.4 `.zattrs` capture, S068, is retained as unreadable binary — no content evidence).
[B-015: CONFIRMED]
- **Real writers emit degenerate or invalid metadata.** Default scale `[1,1,1,1,1]`, no units, axis type inferred from name; at least one major tool's 0.4 output was invalid (axis order cxyz, wrong separator) (O-044, S029). A real 0.5 plate omits the spec-required plate `version` (O-019). Unknown keys like `_creator` appear alongside `ome` keys (O-017). Strict-schema rejection is not viable; "explain what cannot be displayed" is (brief L3, Plan L11).
[B-016: CONFIRMED]
- **Reference-reader gaps are documented in their own trackers.** parse_url collapses "missing" and "error" into None (O-036); reader not idempotent; consolidated-metadata unresolved; RFC-5 group downloads fail; labels-from-buckets broken (O-071, S028 titles). Reusing a library does not discharge the Plan's error-UX and discovery obligations.
[B-017: QUALIFIED]
- **Ecosystem failure classes to design against** (viewer matrix, mostly v0.4 samples, versions pinned April 2025 — O-050/O-052, S043/S041): Z-downsampled pyramids (vizarr wrong, napari crashes on zoom); non-2 scale factors between levels (vizarr fails); plates render but crash on zoom-in; b2r collections fail in most viewers; **no tested viewer** opens images beyond the first multiscales entry, and some crash hard. Group-level multiscales scale was not applied by napari-ome-zarr at test time (O-051, S043 L394-428) — exactly the composition case in O-007.
[B-018: CONFIRMED]
- **0.5 rendering failures exist in current tools.** vizarr "renders chunks repetitively" for challenge-converted 0.5 data (O-040, S014, still open); the Python stack had a zarr 2/3 dependency schism with FSStore import failures and wrong anisotropic rendering in napari's built-in reader (O-039, S011, Dec 2025); ome-zarr-py crashed on zarr "auto" sharding (O-045, S044, Aug 2026).
[B-019: QUALIFIED]
- **Version-sniffing shortcuts exist and are fragile.** AGAVE infers NGFF version from zarr format version and errors otherwise (O-067, S082), detects zarr by the substring "zarr" in a directory path (O-080, S098), and whitelists four dtypes (O-023, S120). These are counterexamples to avoid, not patterns to copy.
[B-020: QUALIFIED]
- **Tool versions matter.** 0.5 read support arrived in ome-zarr-py via zarr-python v3 (Nov 2024, O-041), 0.5 write became default Aug 2025 (O-042, S013), napari-ome-zarr dropped the ome-zarr dependency and now opens all b2r series images in 0.8.0 (May 2026, O-055), and ome-zarr 0.19.2 is zarr-v3-only on Python ≥3.12 (O-079, S015). The ecosystem is simultaneously preparing 0.6 scenes (O-056, S052; O-073, S035 "0.6rc0 schemas") and loosening 0.5 validation for SpatialData (O-056).

---

[B-021: NOT A CLAIM (bookkeeping)]
## 3. Plan fit, line by line

[B-022: NOT A CLAIM (bookkeeping)]
### L5 — "opens a local OME-Zarr 0.5 fileset and lists the images it finds"

[B-023: CONFIRMED]
- **Disposition: correction** (the intent is covered; the specified scope of "images it finds" is too narrow as written).
[B-024: CONFIRMED]
- **Exact constraint:** one fileset can contain: a single multiscale image; multiple named multiscales entries (spec: user chooses by name, first is fallback — O-008); a plate with sparse wells and per-well fields (O-013); a bioformats2raw collection whose images SHOULD all be surfaced (O-012); a labels group or label image as the entry point (O-035); plus non-image content that must not confuse discovery (ro-crate-metadata.json, O-047). 2D-XY through 5D-XYZCT all occur (O-046).
[B-025: CONFIRMED]
- **Product consequence:** discovery is a first-class subsystem (node classification: image / plate / well / collection / labels / unsupported), not a byproduct of opening one image; the image list must not silently show only the first item of anything.
[B-026: CONFIRMED]
- **Distinguishing validation idea:** fixture set = a 9-image b2r collection (BR00109990_C2-like), a sparse 50-well plate (190129-like, no plate.version), a single 2D XY image, and a misleading directory name containing "zarr"; assert the list contents and that opening the labels group directly resolves to the parent image.

[B-027: NOT A CLAIM (bookkeeping)]
### L5 — "canvas with pan and zoom, channel visibility controls, time-point and plane selection where relevant"

[B-028: CONFIRMED]
- **Disposition: covered** (Plan's "where relevant" is correct and load-bearing), with two **optional_capability** notes.
[B-029: CONFIRMED]
- **Exact constraint:** channel axis is identified by type, may be absent; omero is optional/transitional (O-009), so defaults must fall back to computed or neutral rendering; `rdefs.model: greyscale` overrides channel colors to white in established readers (O-030); window uses start/end for display and min/max for range (O-017); `defaultZ`/`defaultT` need bounds-checking. Missing/partial omero is a required path (bioformats2raw `--no-minmax`, O-048), and one real viewer's failure to load labels when omero is absent is the counterexample to avoid (O-072).
[B-030: CONFIRMED]
- **Product consequence:** honoring omero defaults (colors, names, windows, active flags, greyscale model) is a differentiator, not table stakes (O-051); a missing-omero fallback must be specified, not emergent.
[B-031: CONFIRMED]
- **Distinguishing validation idea:** open the 0.5 IDR label-image sample (CZYX, omero window end 1500 / max 65535, defaultZ 118): assert per-channel colors/labels, display window 0–1500, initial plane clamped to z-size; then open an omero-free fixture and assert rendering still occurs with stated defaults.

[B-032: NOT A CLAIM (bookkeeping)]
### L5 — "optional overlays for associated label images"

[B-033: CONFIRMED]
- **Disposition: covered** as a promise, with a **correction** on the sourcing mechanism.
[B-034: CONFIRMED]
- **Exact constraint:** labels are discovered via the labels group listing (O-010); `image-label.source.image` is the documented pointer but is considered broken by spec contributors (O-073); label pixels must be integer dtypes; equal level counts are a MUST that real files may violate (O-010); rgba per label value is optional (O-011); overlay alignment requires the same transform composition as the base image (dataset scale, optional translation, group-level transforms — O-006/O-007/O-027). Established viewers keep labels single-layer and initially hidden (O-033); manual labels-URL assembly is the current UX in established tools (O-052).
[B-035: CONFIRMED]
- **Product consequence:** in-product labels discovery is real added value, but alignment math and per-level verification are the hard part; the Plan promises more overlay capability than most viewers ship (O-051), so this needs its own acceptance fixtures, not a rider on image display.
[B-036: CONFIRMED]
- **Distinguishing validation idea:** fixture with a label image whose level count deliberately differs from the parent (spec-violating): the viewer must explain the mismatch rather than crash or silently misalign; plus a correct fixture where overlay registration is checked at two zoom levels against dataset+group transforms.

[B-037: NOT A CLAIM (bookkeeping)]
### L5 — "A details panel shows dimensions, units and coordinates"

[B-038: CONFIRMED]
- **Disposition: covered**, with one **correction**.
[B-039: CONFIRMED]
- **Exact constraint:** physical size = composition of dataset-level scale (relative to level 0) with any group-level transform, translation applied after scale (O-006/O-007); units are SHOULD-level and frequently absent (O-044, O-004); custom axis types are legal (O-004); time units can hide in group-level transforms (S003 L368-374). One viewer's whole-view scale bar disappears if any layer lacks units (O-032).
[B-040: CONFIRMED]
- **Product consequence:** the panel needs an explicit "unspecified" state per axis and must not derive physical units from axis names; coordinate readout at the cursor should use composed transforms per selected level.
[B-041: CONFIRMED]
- **Distinguishing validation idea:** synthetic file with group-level `scale [0.1, 1, 1, 1, 1]` (time) and per-level spatial scales; assert the panel and cursor readout show the composed values and degrade to "pixel" when a unit is absent.

[B-042: NOT A CLAIM (bookkeeping)]
### L5 — "The viewer chooses an available pyramid level appropriate for the current view"

[B-043: CONFIRMED]
- **Disposition: product_choice** (the Plan picks automatic selection where the closest desktop analog ships a manual picker; both are legitimate, but they have different failure modes), plus a **correction** on what "appropriate" must mean.
[B-044: CONFIRMED]
- **Exact constraint:** level choice must respect level geometry — levels can be Z-downsampled and have non-2, non-uniform factors, and dataset translations can center levels (O-027, O-050); chunk shapes can exceed array extents and be sharded (O-018). The documented failure class is choosing/reading levels by assumption (vizarr's "same number of Z-sections" expectation; repetitive-chunk rendering).
[B-045: CONFIRMED]
- **Product consequence:** automatic choice needs viewport↔level math plus per-level size feedback; the simpler alternative (implemented in the desktop analog) is a level picker with memory estimates and optional sub-region, with documented low-res-first workflow (O-060, O-063). If automatic selection is kept, a manual override is the safety valve.
[B-046: CONFIRMED]
- **Distinguishing validation idea:** pyramid with Z-downsampling and a factor-3 level: zoom from 1× to 1/16× and assert the displayed features stay put (no repeated chunks, no drift), and that the chosen level changes at sane thresholds.

[B-047: NOT A CLAIM (bookkeeping)]
### L7 — "Large image reads run in the background… Changing the selected view cancels work…"

[B-048: CONFIRMED]
- **Disposition: covered** (as a specified obligation), with an adjacent **optional_capability** (cache policy).
[B-049: CONFIRMED]
- **Exact constraint:** the direct desktop analog's most-upvoted issue is exactly "loading blocks the whole application and is not easy to cancel" during time-series playback (O-064, S103); its shipped answers were an in-memory volume cache and memory-estimate UI (O-066); sharded local reads are a known performance pain point ecosystem-wide (O-018, O-045 — search-listing evidence only, S049).
[B-050: CONFIRMED]
- **Product consequence:** cancellation needs a defined policy for partially-read data (discard vs cache), and time-series scrubbing is the stress case, not static pan/zoom.
[B-051: CONFIRMED]
- **Distinguishing validation idea:** start loading a large level, switch images/timepoints mid-read, and assert: UI stays responsive, the superseded read is cancelled (no completion-driven repaint of the old view), and memory returns to baseline (the analog had a GPU/RAM leak bug on image switch, O-064).

[B-052: NOT A CLAIM (bookkeeping)]
### L7 — "Opening failures explain which image or data could not be displayed and allow the user to choose another item"

[B-053: CONFIRMED]
- **Disposition: covered**, with a **correction**: this cannot be inherited from reference libraries.
[B-054: CONFIRMED]
- **Exact constraint:** parse_url-style APIs collapse missing vs broken into None (O-036); reference tracker lists error-UX gaps as open (O-071); real files violate MUSTs (O-019) and misleading names exist (O-080); unsupported dtypes/transforms/versions will occur (O-023, O-038 draft-only transform types, O-001 editor drafts).
[B-055: CONFIRMED]
- **Product consequence:** Slide Scout needs its own error taxonomy (missing metadata, unreadable array, unsupported codec/shard/dtype/transform, version mismatch, inconsistent hierarchy) each naming the offending node, with the list still usable.
[B-056: CONFIRMED]
- **Distinguishing validation idea:** malformed-input fixture pack (truncated zarr.json, missing dataset path, float label image, unknown ome.version, plate without version, identity transform in datasets): each must produce a specific message plus a working "choose another image" path, never a crash.

[B-057: NOT A CLAIM (bookkeeping)]
### L9 — "should interoperate with filesets from real OME-Zarr 0.5 tools"

[B-058: CONFIRMED]
- **Disposition: correction** (under-specified: "real tools" must be enumerated, and the hard half of 0.5 — the Zarr v3 storage surface — is nowhere named in the Plan).
[B-059: CONFIRMED]
- **Exact constraint:** producer set evidenced in-corpus: ome2024-ngff-challenge converter (sharded, ro-crate, zarr.json migration — O-047), bioformats2raw 0.4-default/0.5-opt-in (O-048), IDR samples (O-046), ome-zarr-py (2D-only downsampling, degenerate defaults — O-044), WEBKNOSSOS (sharded v3, O-068), SpatialData (permissively-validated 0.5, O-056), NGFF-Converter (O-075). Storage surface: sharding (incl. upcoming "auto"), blosc/gzip/zstd/null codecs, crc32c indexes, little-endian (O-018, O-045, O-048, O-047).
[B-060: CONFIRMED]
- **Product consequence:** acceptance fixtures must span producers and storage shapes; interop claims should name the producer and version, since 0.5 support dates differ by a year across tools (O-041, O-042, O-055).
[B-061: CONFIRMED]
- **Distinguishing validation idea:** a locally-captured sharded challenge-style fileset (single-shard-per-Z layout like 4496763) plus a blosc-gzip-zstd-null codec matrix, each opened and pixel-compared against a known-good decode.

[B-062: NOT A CLAIM (bookkeeping)]
### L9 — "Source files remain unchanged; display settings are local to the viewing session"

[B-063: CONFIRMED]
- **Disposition: covered.**
[B-064: CONFIRMED]
- **Exact constraint:** read-only open paths throughout the corpus readers (O-019 mode "r"; the challenge resave likewise never modifies input, O-047). The rejected alternative is visible in the corpus: AGAVE persists settings to a JSON containing an absolute file path (O-062/AGAVE HELP L27) — brittle and session-crossing.
[B-065: CONFIRMED]
- **Product consequence:** trivial to honor but worth an explicit test; settings persistence (if ever added) is an "additional capability" under the L9 review gate.
[B-066: CONFIRMED]
- **Distinguishing validation idea:** checksum all fixture files before/after a session that opens, pans, zooms, switches channels and force-closes.

[B-067: NOT A CLAIM (bookkeeping)]
### L9 — exclusions ("Image editing, export, remote storage and automated … interpretation are outside")

[B-068: CONFIRMED]
- **Disposition: covered** (boundary) with one **unresolved** watch item.
[B-069: CONFIRMED]
- **Exact constraint:** local-filesystem-only simplifies storage (no HTTP range/S3), but several corpus failures are storage-related (labels from buckets O-071; proxy issues S028 titles) and thus out of scope by construction. Watch item: local filesets embed non-image payloads (OME-XML, ro-crate, OME/METADATA.ome.xml — O-012, O-047) that discovery must classify without treating as images.
[B-070: CONFIRMED]
- **Product consequence:** the boundary keeps the storage layer thin; discovery must still be hierarchy-aware.
[B-071: CONFIRMED]
- **Distinguishing validation idea:** fixture with OME/METADATA.ome.xml + ro-crate-metadata.json + numbered image groups; assert exactly the image groups are listed.

[B-072: NOT A CLAIM (bookkeeping)]
### L9 — "Additional capability choices require explicit review"

[B-073: CONFIRMED]
- **Disposition: covered** (gate). Items that would cross it, evidenced as user-demand or ecosystem direction: multi-image overlay sessions / channels from separate files (O-065); LUT-based channel display (O-065); 0.6 scenes/RFC-5 transforms (O-053, O-056); zip stores (RFC-9, O-053; ome-zarr-py open issue S028); >5D arrays (RFC-3, O-053).

[B-074: NOT A CLAIM (bookkeeping)]
### L11 — "Acceptance uses representative filesets…"

[B-075: CONFIRMED]
- **Disposition: unsupported as written** (the Plan does not say what "representative" is); **correction** available cheaply from the corpus.
[B-076: QUALIFIED]
- **Exact constraint:** concrete 0.5 fixtures with provenance exist in-corpus: the IDR 0.5 sample list (plates with 384 wells/1 field and 49 wells/32 fields, 2D XY, XYZ, XYZC, XYZCT, b2r collections, a 21.6 GB single-plane image — O-046) and the PR #123 test list (O-054). Gaps: no multi-entry-multiscales fixture exists anywhere (O-050), and no 0.4/0.5 mixed-hierarchy sample is readable in-corpus (S068 is binary).
[B-077: CONFIRMED]
- **Product consequence:** acceptance can be anchored to named public filesets plus synthetic spec-edge fixtures; the multi-multiscales case must be synthetic.
[B-078: CONFIRMED]
- **Distinguishing validation idea:** adopt a fixture matrix: {per-producer 0.5 filesets} × {image, plate, collection, labels} × {sharded, plain} + synthetic malformed pack; record expected image lists and coordinate values.

[B-079: NOT A CLAIM (bookkeeping)]
### L11 — "A large dataset must not freeze interaction"

[B-080: CONFIRMED]
- **Disposition: covered** (promise), with evidence it is the differentiating risk.
[B-081: QUALIFIED]
- **Exact constraint:** the analog product's tracker shows zoom-time crashes on plates and pyramids in established viewers (O-050), blocking loads (O-064), memory leaks (O-064), and GPU-memory ceilings for volume approaches (O-059); 1 TB plates and 21.6 GB single-plane images are real 0.5 data (O-046).
[B-082: CONFIRMED]
- **Product consequence:** the 2D-canvas approach avoids the volume-rendering memory ceiling (O-059) — worth stating as the deliberate product simplification; interaction freeze testing must include zoom-during-load on plate/stitched data.
[B-083: CONFIRMED]
- **Distinguishing validation idea:** open the largest local fixture, immediately zoom/pan and scrub time; sample UI thread responsiveness; assert no unbounded memory growth across repeated image switches.

[B-084: NOT A CLAIM (bookkeeping)]
### L11 — "Malformed or unavailable input must produce understandable feedback rather than a crash"

[B-085: CONFIRMED]
- **Disposition: covered** (see L7 failure-UX row for the shared constraint/validation idea); the corpus adds specific malformed cases to test: plate missing `version` (O-019), identity transforms (O-073), window missing start/end (O-030/O-032's differing behaviors), partial omero (O-048), misleading names (O-080).

[B-086: NOT A CLAIM (bookkeeping)]
### Not in the Plan at all (each **unresolved** for Plan purposes, obligation established by corpus)

[B-087: CONFIRMED]
- **Multiple multiscales entries** — spec-defined user choice, zero ecosystem support, some viewers crash (O-008, O-029, O-033, O-050). Unresolved: whether Slide Scout lists them (spec-faithful, beyond-ecosystem) or matches ecosystem behavior (first entry only). Product decision needed.
[B-088: CONFIRMED]
- **Zarr v3 storage-feature strategy** (shards/codecs) — obligatory per O-002/O-018 but unspecified in the Plan; build-vs-library decision also open (tensorstore C++ route O-070/O-074 vs zarr-python ≥3 route O-079 vs napari's direct-zarr rewrite precedent O-054). Unresolved in-corpus.
[B-089: CONFIRMED]
- **Version handling policy** — strict 0.5-only vs permissive (SpatialData precedent O-056; AGAVE inference O-067; spec signals 0.6rc0 approaching O-073). Unresolved product decision.

---

[B-090: NOT A CLAIM (bookkeeping)]
## 4. Simpler alternatives and opportunities noted (not obligations)

[B-091: CONFIRMED]
- **Manual level picker with memory estimate + sub-region ROI** instead of fully automatic level choice — shipped pattern in the closest desktop analog (O-060, O-063); automatic choice can layer on top later.
[B-092: CONFIRMED]
- **2D-slice canvas (Plan's shape)** vs volume rendering: avoids GPU-memory ceilings that bind AGAVE/Vol-E (O-059); vizarr proves the 2D-slice product class with 8-dtype support (O-058).
[B-093: CONFIRMED]
- **Stitched-plate rendering vs well-by-well navigation**: ome-zarr-py stitches with zero-filled gaps (O-031); the spec explicitly allows offering users a choice of images (O-012). Well-navigation is simpler and avoids fake data; stitching is the incumbent behavior to consciously accept or reject (product choice).
[B-094: CONFIRMED]
- **Collection browsing via manifest/CSV + external app** (ome-zarr finder + BioFile Finder, O-043/O-069) — the incumbent local-browsing shape; Slide Scout's integrated list is the delta.
[B-095: CONFIRMED]
- **Differentiators with documented ecosystem gaps**: omero-faithful defaults incl. greyscale model and rdefs (O-051); group-level transform composition (O-051, napari gap); dynamic scale bar / calibrated display (O-072 — vizarr request open); in-product labels discovery (O-052); b2r series enumeration (fixed only May 2026 in napari-ome-zarr, O-055).
[B-096: CONFIRMED]
- **Timestamp overlay in physical time units and per-timepoint window adaptation** — shipped in AGAVE docs (O-061), absent from the Plan; candidate future capability under the L9 review gate.

---

[B-097: NOT A CLAIM (bookkeeping)]
## 5. Deferred items (with reasons)

| Item | Reason for deferral |
|---|---|
[B-098: QUALIFIED]
| 0.6 scenes / RFC-5 coordinate systems & transforms | Not part of released 0.5 (O-001, O-053); RFC text not in corpus; ecosystem still converging (O-056, O-073). Handle via clear "unsupported version/transform" messaging only. |
[B-099: CONFIRMED]
| Remote/http/S3 storage | Excluded by Plan L9 / brief L5; corpus failure evidence (O-071) is remote-specific. |
[B-100: CONFIRMED]
| Zip stores (RFC-9) | Future RFC (O-053); open issue even in reference lib (S028). |
[B-101: CONFIRMED]
| >5D arrays, axis orientation (RFC-3/4) | Future RFCs (O-053); detect-and-explain only. |
[B-102: CONFIRMED]
| Multi-image overlay sessions; channels from separate files | Breaches single-fileset boundary (Plan L9); user demand exists elsewhere (O-065) — review-gate item. |
[B-103: CONFIRMED]
| Sharded-read performance tuning | Needs measurement on real hardware; corpus has only issue-title evidence (S049, O-018). Correctness first. |
[B-104: CONFIRMED]
| Consolidated metadata | Unresolved concept in zarr ecosystem (S028 title); no 0.5 obligation. |
[B-105: CONFIRMED]
| 3D/volume rendering | Out of Plan scope; noted as the deliberate simplification (O-059). |

[B-106: NOT A CLAIM (bookkeeping)]
---

[B-107: NOT A CLAIM (bookkeeping)]
## 6. Coverage

**Sources read in full (or near-full):** S003 (0.5 spec), S053 (image.schema), S054–S056 (0.5 zarr.json captures), S016 (format.py), S018 (reader.py), S019 (io.py), S048 (napari reader), S009 (repo tree), S017 (changelog), S025 (vizarr), S062 (Vol-E), S072 (AGAVE README), S108 (AGAVE HELP), S115 (AGAVE docs index), S022/S066/S067 (BioFile Finder), S037/S041 (ome-ngff-tools page/docs), S043 (features.yml), S039 (tools README), S033/S034 (converter READMEs), S070 (tools resources), S010 (sample catalog, 0.5 section + headers), S004/S008/S011/S013/S014/S023/S029/S044 (issue/PR bodies), S024 (PR #123 body), S052 (releases, key bodies), S063–S065 (napari release bodies), S081–S083 (AGAVE #258/#220 + comment), S103/S104/S105/S110/S118/S119/S125 (AGAVE issue bodies), S102 (empty shard search), S057 (empty arrays), S120/S121 (AGAVE grep extracts), S098 (PR #220 diff, grepped).

**Sources sampled by targeted search only (titles/listings; no claim rests on unread content):** S028, S035, S050, S090, S097, S100, S101, S109, S112, S114 (issue/search dumps), S052/S091 (release lists), S015 (PyPI fields), S059 (0.4 spec, grepped for version/layout markers), S051 (RFC index, grepped).

**Failed or empty captures — no evidence either way (not proof of absence):** S002 (0 bytes), S005, S007, S030, S042, S045, S046, S077, S095, S096, S121; search-result-only listings: S001, S012, S021, S032, S036, S049, S060, S069, S071 (O-021/O-022).

**Not read (no claims made from them):** S027 (HTML duplicate of S024's PR content), S040 (file tree listing), S068 (binary, unreadable — O-020), S073, S074, S078, S079, S080, S084, S085, S086, S087, S088, S092, S093, S094, S107, S116.

**Unresolved questions carried forward:** (1) reader-side auto-shard behavior/latency in current zarr libraries (O-045); (2) full semantics of RFC-5/scene metadata (O-053); (3) exact nature of the omero schema inconsistency (O-073); (4) which bioformats2raw release defaults to 0.5 (O-048); (5) AGAVE's actual sharded-file behavior (O-077); (6) whether current viewer versions fixed the O-050 matrix failures; (7) rectilinear chunk grids in the wild (O-074); (8) content of the 0.4 `.zattrs` capture (S068, binary).

---

*Prepared as a research deliverable only; contains no replacement Plan prose, patches, or PlanUnits. All "validation ideas" are proposals for future verification.*


### 5.2 Raw verifier records for non-authoritative or unknown blocks

(none)

### 5.3 Host assembly report (mechanical completeness only)

```json
{
 "blocks": 107,
 "by_status": {
  "not_a_claim": 23,
  "confirm": 78,
  "qualify": 6
 },
 "unknown_ids": [],
 "decision_entries": 104,
 "lines_outside_entries": [
  1,
  3,
  4
 ],
 "non_authoritative": [],
 "carrier_defects": 1,
 "complete": false
}
```
