# Delivered research result

TEST_ONLY_NEVER_PROMOTE. Host-assembled from immutable stage-1 draft blocks and the same-model verifier's explicit per-block decisions. Only section 1 and section 4 are asserted content. Section 2 records rejected draft assertions; section 3 holds proposals that were not verified (unresolved, undecided, or with a malformed verifier record) and earns no verified-retention credit. Section 5 is history.

## 1. Current asserted findings

#### [B-003] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: Quote verified verbatim: 0.5 is defined on Zarr v3 with all Zarr features in scope unless explicitly disallowed; the spec text disallows almost nothing (only scattered MUST NOTs such as no JSON comments, metadata-free intermediate label groups, plate path shape).
Evidence: S003 lines 56-72; S003 lines 437-440; S003 lines 553-556

1. **0.5 = Zarr v3 with the full Zarr feature surface.** OME-Zarr 0.5 is defined on Zarr v3, and "all features of the Zarr format including codecs, chunk grids, chunk key encodings, data types and storage transformers may be used … unless explicitly disallowed" (O-002, S003 L67-72). The 0.5 text disallows almost nothing. Consequence: a reader that supports only one chunk-grid/codec shape is not 0.5-conformant even if it opens some files.

#### [B-004] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: Metadata location (zarr.json, attributes.ome, version string, hierarchy-wide MUST) and the image.schema required keys verified; legacy version detection in ome-zarr-py (multiscales[0].version, plate/well/image-label) and the ome-namespace unwrap in the caller both verified.
Evidence: S003 lines 152-156; S053 lines 22-30; S016 lines 81-96; S019 lines 87-90

2. **Metadata location and version.** OME metadata lives in `zarr.json` under `attributes.ome`; `ome.version` is a string and MUST be consistent within a hierarchy (O-003, S003 L152-156). The image schema makes `multiscales` + `version` required on an image group (O-016, S053 L22-30). Note: version detection in the wild keys off several locations, including the legacy `multiscales[0].version` (O-026, S016 L81-96) — a validator should check `attributes.ome.version` first but not be surprised by legacy placement.

#### [B-005] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: Axes rules verified (name required+unique; type/unit SHOULD with custom types legal; axes length MUST; dimension_names MUST per 0.5.2 note); TCZYX ordering MUST with zyx only SHOULD; real 0.5 samples span XY-only through XYZCT.
Evidence: S003 lines 166-174; S003 lines 298-303; S003 lines 825-827; S010 lines 1026-1143

3. **Axes.** 2–5 dimensions; `name` required and unique; `type` recommended (space/time/channel or custom strings); `unit` recommended UDUNITS-2; arrays MUST carry `dimension_names` matching axes (O-004, S003 L166-174). Ordering MUST be time → channel/custom → space; zyx is only SHOULD (O-005, S003 L299-319). Channel/time/plane UI must key off axis **type**, and may be absent entirely (real 0.5 samples include XY-only and XYZ data — O-046, S010 L1026-1133).

#### [B-006] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: multiscales-is-a-list, paths ordered highest-to-lowest resolution, exactly one relative scale per dataset (default 1.0), optional translation listed after scale, group-level transforms applied after dataset-level, and name only SHOULD — all verified.
Evidence: S003 lines 298-317; S003 lines 304-316; S003 lines 388-397

4. **Multiscales.** `multiscales` is a LIST; datasets paths are arbitrary strings ordered highest→lowest resolution; each dataset MUST have exactly one scale (relative to level 0, default 1.0); MAY have one translation, listed after scale; group-level `coordinateTransformations` are applied after dataset-level ones (O-006/O-007/O-008, S003 L298-397). Missing `name` is legal (SHOULD).

#### [B-007] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: omero optional/transitional with channels/color/window MUSTs verified; rdefs appears only in the example (no MUST); the S054 capture shows window end 1500 vs max 65535 and defaultZ 118; --no-minmax legitimately omits the block.
Evidence: S003 lines 398-430; S054 lines 77-113; S033 lines 351-354

5. **omero display block is transitional and optional.** If present: `channels` required; per-channel `color` (6 hex digits) and `window {min,max,start,end}` required; `rdefs` (defaultT/defaultZ, model "color"|"greyscale") described but not covered by the MUSTs (O-009, S003 L398-430). Real files show window `end` far below data `max` (display window vs data range, O-017) and `defaultZ` that must be bounds-checked (S054 L109-113). Producers can legitimately omit it (`bioformats2raw --no-minmax`, O-048).

#### [B-008] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: Labels rules verified (integer dtypes; labels-group listing; equal level count as MUST; image-label SHOULD/MAY with source.image default ../../); the spec community's "source.image is broken" and "OMERO schema inconsistent" titles and vizarr's "Labels not loaded if omero block is missing" title all verified.
Evidence: S003 lines 431-474; S035 lines 2703-2704; S035 lines 3942-3943; S050 lines 2434-2436

6. **Labels.** `labels` group lists label image paths; label pixels MUST be integer dtypes; each label image MUST be a full multiscales image with the SAME number of levels as the parent (O-010, S003 L431-455); `image-label` colors/rgba/properties/source are SHOULD/MAY with `source.image` defaulting to `../../` (O-011, S003 L454-474). Caution: the spec community itself considers the `source.image` reference mechanism broken and the omero schema inconsistent with its description (O-073, S035 titles), and a real viewer ships a bug where labels are not loaded when the omero block is missing (O-072, S050). Overlay code must therefore use the labels-group listing as the source of truth and verify level geometry at runtime.

#### [B-009] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: Plate/well structures verified including plate version MUST (S003 line 550) and sparse-plate normality; the S056 capture confirmed by direct read plus grep to contain no plate "version" and no "acquisitions" key anywhere.
Evidence: S003 lines 118-129; S003 lines 515-560; S003 lines 740-752; S056 lines 1-68

7. **HCS plates/wells.** plate `{columns, rows, wells[{path,rowIndex,columnIndex}], field_count, acquisitions?, version}` and well `{images[{path,acquisition?}], version}`; sparse plates are normal (empty rows/wells SHOULD NOT exist) (O-013, S003 L118-129, L515-560, L740-752). Real plates violate the `version` MUST (O-019, S056) — strict validation would reject a flagship dataset.

#### [B-010] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: bioformats2raw.layout=3 semantics, optional OME/METADATA.ome.xml and series list, consecutive-numbering fallback, and the reader SHOULD NOT default to the first image all verified; napari's OME-XML Image-ID discovery confirmed as the coexisting convention.
Evidence: S003 lines 175-275; S048 lines 341-365

8. **bioformats2raw collections (transitional).** `bioformats2raw.layout: 3`, optional `OME/METADATA.ome.xml`, optional `series` path list, else consecutive numbered groups; readers SHOULD NOT default to opening only the first image (O-012, S003 L175-275). Two other discovery conventions coexist (OME-XML Image IDs in napari, O-034; `series` in the spec) — discovery must tolerate disagreement.

#### [B-011] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: JSON comment prohibition and camelCase-with-legacy-exceptions naming rule verified verbatim.
Evidence: S003 lines 65-66; S003 lines 809-812

9. **JSON hygiene.** No comments in JSON; exact historical key spellings (camelCase intent with acknowledged legacy exceptions) (O-014/O-015, S003 L65-66, L809-812).

#### [B-012] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 1. Established format obligations (0.5)

Basis: supported
Reason: Sharding in the flagship IDR sample verified in the S055 array metadata (regular grid chunk [1,10,512,512] vs shape [2,236,275,271]; sharding_indexed with blosc/zstd inner and bytes+crc32c index); optional sharding in the challenge converter, WEBKNOSSOS sharded v3 output, auto-sharding friction, and the b2r v3/0.5 codec table (null/blosc/gzip/zstd; little-endian since 0.12.0) all verified.
Evidence: S055 lines 1-74; S034 lines 41-46; S058 lines 255-264; S058 line 360; S044 lines 126-159; S033 lines 152-162; S033 lines 356-359

10. **Dataset-level compatibility floor (from real 0.5 corpora).** Sharded arrays are mainstream, not exotic: the flagship IDR 0.5 sample uses `sharding_indexed` (blosc/zstd inside, crc32c index) with chunk shapes larger than the array extent (O-018, S055); the challenge converter shards optionally (O-047), WEBKNOSSOS writes sharded v3 (O-068), and zarr-python "auto" sharding is arriving with OME-layer tools lagging (O-045, S044). Codec floor from the dominant converters: bytes + {blosc, gzip, zstd, null}, little-endian default (O-048, S033 L152-162, L356-359).

---

#### [B-014] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 2. Compatibility findings, contradictions and counterexamples

Basis: supported
Reason: PR #206's main changes (zarr.json, attributes, ome namespace, version moved up, chunk_key_encoding respected) and its closure in favor of RFC-2 #227 verified; 0.4 spec places version inside multiscales[0]; the implemented dual read (ome-namespace else flat) verified in both napari-ome-zarr and ome-zarr-py; corpus contains both 0.4 and 0.5 sample URLs and the unreadable 0.4 .zattrs capture (S068) confirmed binary.
Evidence: S004 lines 149-158; S004 lines 573-584; S059 lines 347-353; S048 lines 166-170; S019 lines 87-90; S010 lines 1010-1143; S068 line 1

- **The 0.4→0.5 break is by design.** Metadata moved from `.zattrs`/`.zarray` into `zarr.json` attributes under an `ome` namespace; version fields moved up; chunk-key encoding became per-array (O-038, S004). 0.4-era files put `version: "0.4"` inside `multiscales[0]` (S059 L347-353). Established readers unwrap `attributes.ome` when present and otherwise read flat attributes (O-032, S048 L166-170; O-036, S019 L87-90). A 0.5-only viewer still needs this dual read if it ever meets 0.4 data; the corpus contains both (catalog: 0.4 and 0.5 sample URLs in S010; a 0.4 `.zattrs` capture, S068, is retained as unreadable binary — no content evidence).

#### [B-015] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 2. Compatibility findings, contradictions and counterexamples

Basis: supported
Reason: Degenerate writer metadata verified in the maintainer comparison ("Scale starts at [1, 1, 1, 1, 1]", "No units", 2D-only downsampling, webknossos 0.4 output invalid with cxyz and '..' separator); plate.version omission and _creator key verified in the S056/S054 captures.
Evidence: S029 lines 293-296; S029 lines 334-336; S056 lines 1-68; S054 lines 5-7

- **Real writers emit degenerate or invalid metadata.** Default scale `[1,1,1,1,1]`, no units, axis type inferred from name; at least one major tool's 0.4 output was invalid (axis order cxyz, wrong separator) (O-044, S029). A real 0.5 plate omits the spec-required plate `version` (O-019). Unknown keys like `_creator` appear alongside `ome` keys (O-017). Strict-schema rejection is not viable; "explain what cannot be displayed" is (brief L3, Plan L11).

#### [B-016] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 2. Compatibility findings, contradictions and counterexamples

Basis: supported
Reason: parse_url's documented None collapse verified; the tracker titles for non-idempotent reader, consolidated-metadata question, RFC-5 group download failures, and labels-from-buckets all verified at the cited lines.
Evidence: S019 lines 213-233; S028 lines 4443-4444; S028 lines 1609-1611; S028 lines 2395-2397; S028 lines 4367-4368

- **Reference-reader gaps are documented in their own trackers.** parse_url collapses "missing" and "error" into None (O-036); reader not idempotent; consolidated-metadata unresolved; RFC-5 group downloads fail; labels-from-buckets broken (O-071, S028 titles). Reusing a library does not discharge the Plan's error-UX and discovery obligations.

#### [B-017] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 2. Compatibility findings, contradictions and counterexamples

Basis: supported
Reason: Every matrix row cited was verified: vizarr Z-downsampling failure and napari zoom crash, vizarr non-2-factor failure, plate zoom crashes, b2r failures in most viewers, no tested viewer supporting multiple multiscales entries (with hard crashes), group-level multiscales scale unapplied by napari-ome-zarr (issue #73), all at the cited lines with versions pinned in S041.
Evidence: S043 lines 2-35; S043 lines 80-108; S043 lines 207-238; S043 lines 240-275; S043 lines 277-316; S043 lines 394-428; S041 lines 2-20

- **Ecosystem failure classes to design against** (viewer matrix, mostly v0.4 samples, versions pinned April 2025 — O-050/O-052, S043/S041): Z-downsampled pyramids (vizarr wrong, napari crashes on zoom); non-2 scale factors between levels (vizarr fails); plates render but crash on zoom-in; b2r collections fail in most viewers; **no tested viewer** opens images beyond the first multiscales entry, and some crash hard. Group-level multiscales scale was not applied by napari-ome-zarr at test time (O-051, S043 L394-428) — exactly the composition case in O-007.

#### [B-018] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 2. Compatibility findings, contradictions and counterexamples

Basis: supported
Reason: vizarr #307 (open, "renders chunks repetitively" for challenge-converted 0.5), napari-ome-zarr #139 (Dec 2025 FSStore import failure and built-in-reader anisotropic bug), and ome-zarr-py #640 (Aug 2026, auto-sharding) all verified as described.
Evidence: S014 lines 126-146; S011 lines 137-177; S044 lines 126-159

- **0.5 rendering failures exist in current tools.** vizarr "renders chunks repetitively" for challenge-converted 0.5 data (O-040, S014, still open); the Python stack had a zarr 2/3 dependency schism with FSStore import failures and wrong anisotropic rendering in napari's built-in reader (O-039, S011, Dec 2025); ome-zarr-py crashed on zarr "auto" sharding (O-045, S044, Aug 2026).

#### [B-019] QUALIFIED
Context: # Slide Scout — corpus research report (draft) > ## 2. Compatibility findings, contradictions and counterexamples

Basis: counterevidence
Reason: All three propositions are true and verified, but the citation for the four-dtype whitelist is wrong: the grep extract is in S096, while S120 is a failed search containing only "No literal matches". The replacement corrects the handle.
Evidence: S082 line 55; S098 lines 72-77; S096 lines 25-28; S120 line 1

Active (verified replacement; the draft text is superseded history):

- **Version-sniffing shortcuts exist and are fragile.** AGAVE infers the NGFF version from the Zarr format version — "The big assumption I am making is that OME-NGFF 0.4 is always zarrv2 and if we find a zarrv3 zarr.json file, then I am assuming a OME-NGFF 0.5 json file. ... Anything outside this assumption will error out in some way." (PR #220 body, merged 2025-03-22, S082 line 55); it dispatches any directory whose PATH contains the substring "zarr" to its zarr reader (PR #220 diff, S098 lines 72-77); and its renderlib/VolumeDimensions.cpp recognizes exactly four data types — int32, uint16, uint8, float32 (grep extract at commit 9e7b47f, S096 lines 25-28; note the correct handle is S096, not S120 — S120 is a failed search containing only "No literal matches"). These are counterexamples to avoid, not patterns to copy.

#### [B-020] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 2. Compatibility findings, contradictions and counterexamples

Basis: supported
Reason: Timeline verified: 0.5 reading added on zarr-python v3 (PR #404, work commencing late Oct 2024), 0.5 writing merged and made default Aug 7 2025 (PR #413), napari-ome-zarr 0.8.0 (2026-05-20) dropping the dependency and opening all b2r series images, ome-zarr 0.19.2 zarr>=3.0.0 on Python >=3.12, v0.19.0 shipping 0.6 scene support and SpatialData-permissive 0.5 validation, and 0.6rc0 schema issues in the ngff tracker.
Evidence: S008 lines 149-163; S008 line 171; S013 lines 126-131; S013 lines 150-151; S065 lines 29-41; S015 lines 46-63; S052 lines 116-128; S035 lines 355-356; S035 lines 1339-1340

- **Tool versions matter.** 0.5 read support arrived in ome-zarr-py via zarr-python v3 (Nov 2024, O-041), 0.5 write became default Aug 2025 (O-042, S013), napari-ome-zarr dropped the ome-zarr dependency and now opens all b2r series images in 0.8.0 (May 2026, O-055), and ome-zarr 0.19.2 is zarr-v3-only on Python ≥3.12 (O-079, S015). The ecosystem is simultaneously preparing 0.6 scenes (O-056, S052; O-073, S035 "0.6rc0 schemas") and loosening 0.5 validation for SpatialData (O-056).

---

#### [B-023] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "opens a local OME-Zarr 0.5 fileset and lists the images it finds"

Basis: supported
Reason: The "correction" disposition is grounded: the spec obligates awareness of multiple images (b2r SHOULD NOT default to first image; multiscales user-choice with first-entry fallback), while the reference Python readers read only multiscales[0] — so "lists the images it finds" must be read as enumerating more than one image per group.
Evidence: plan/Viewer.md line 5; S003 lines 271-275; S003 lines 388-397; S018 lines 279-292; S048 lines 199-202

- **Disposition: correction** (the intent is covered; the specified scope of "images it finds" is too narrow as written).

#### [B-024] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "opens a local OME-Zarr 0.5 fileset and lists the images it finds"

Basis: supported
Reason: Every enumerated content class verified: single image, multiple named multiscales entries with missing-name tolerance, sparse plates with per-well fields, b2r collections, labels groups/label images as entry points (napari dispatch), ro-crate-metadata.json as non-image content, and 2D-XY through 5D-XYZCT in the IDR 0.5 list.
Evidence: S003 lines 298-317; S003 lines 388-397; S003 lines 118-129; S003 lines 175-275; S048 lines 664-699; S034 lines 41-63; S010 lines 1026-1143

- **Exact constraint:** one fileset can contain: a single multiscale image; multiple named multiscales entries (spec: user chooses by name, first is fallback — O-008); a plate with sparse wells and per-well fields (O-013); a bioformats2raw collection whose images SHOULD all be surfaced (O-012); a labels group or label image as the entry point (O-035); plus non-image content that must not confuse discovery (ro-crate-metadata.json, O-047). 2D-XY through 5D-XYZCT all occur (O-046).

#### [B-025] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "opens a local OME-Zarr 0.5 fileset and lists the images it finds"

Basis: supported
Reason: The product consequence (discovery as a first-class node-classifying subsystem that never silently shows only the first item) follows directly from the verified spec obligations and reference-reader gaps.
Evidence: S003 lines 271-275; S048 lines 664-699; S018 lines 279-292

- **Product consequence:** discovery is a first-class subsystem (node classification: image / plate / well / collection / labels / unsupported), not a byproduct of opening one image; the image list must not silently show only the first item of anything.

#### [B-028] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "canvas with pan and zoom, channel visibility controls, time-point and plane selection where relevant"

Basis: supported
Reason: Verified that "where relevant" is load-bearing (channel axis by type, may be absent), omero optional with rdefs outside the MUSTs, greyscale model overriding channel colors in both reference readers, window start/end vs min/max distinction, defaultZ bounds-check need, and the missing-omero counterexample in vizarr.
Evidence: S003 lines 298-303; S003 lines 398-430; S018 lines 336-391; S048 lines 293-336; S054 lines 77-113; S033 lines 351-354; S050 lines 2434-2436

- **Disposition: covered** (Plan's "where relevant" is correct and load-bearing), with two **optional_capability** notes.

#### [B-029] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "canvas with pan and zoom, channel visibility controls, time-point and plane selection where relevant"

Basis: supported
Reason: The exact-constraint bullet matches the sources: omero optionality and MUST contents, --no-minmax as a legitimate producer path, greyscale override, active-flag visibility gating, contrast-limits disable on missing start/end (ome-zarr-py) vs skip-per-channel (napari), and the vizarr labels-not-loaded failure.
Evidence: S003 lines 398-430; S018 lines 356-391; S048 lines 316-323; S033 lines 351-354; S050 lines 2434-2436

- **Exact constraint:** channel axis is identified by type, may be absent; omero is optional/transitional (O-009), so defaults must fall back to computed or neutral rendering; `rdefs.model: greyscale` overrides channel colors to white in established readers (O-030); window uses start/end for display and min/max for range (O-017); `defaultZ`/`defaultT` need bounds-checking. Missing/partial omero is a required path (bioformats2raw `--no-minmax`, O-048), and one real viewer's failure to load labels when omero is absent is the counterexample to avoid (O-072).

#### [B-030] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "canvas with pan and zoom, channel visibility controls, time-point and plane selection where relevant"

Basis: supported
Reason: The differentiator claim is supported by the viewer matrix (WEBKNOSSOS ignores rdefs; Vol-E ignores channel colors; several viewers ignore omero), and the required fallback path follows from omero optionality.
Evidence: S043 lines 38-78; S003 lines 398-430; S033 lines 351-354

- **Product consequence:** honoring omero defaults (colors, names, windows, active flags, greyscale model) is a differentiator, not table stakes (O-051); a missing-omero fallback must be specified, not emergent.

#### [B-033] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "optional overlays for associated label images"

Basis: supported
Reason: Labels discovery via the labels-group listing is the spec mechanism, and the correction (source.image considered broken by spec contributors) is verified at the cited issue title.
Evidence: S003 lines 441-455; S035 lines 2703-2704

- **Disposition: covered** as a promise, with a **correction** on the sourcing mechanism.

#### [B-034] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "optional overlays for associated label images"

Basis: supported
Reason: Verified: labels listing as source of truth, integer dtype MUST, equal level-count MUST, optional rgba, transform-composition requirement for alignment, established viewers keeping labels single-layer and initially hidden, and manual labels-URL assembly as current UX in the matrix docs.
Evidence: S003 lines 438-455; S003 lines 456-474; S048 lines 580-598; S048 lines 652-656; S041 lines 11-14; S035 lines 2703-2704

- **Exact constraint:** labels are discovered via the labels group listing (O-010); `image-label.source.image` is the documented pointer but is considered broken by spec contributors (O-073); label pixels must be integer dtypes; equal level counts are a MUST that real files may violate (O-010); rgba per label value is optional (O-011); overlay alignment requires the same transform composition as the base image (dataset scale, optional translation, group-level transforms — O-006/O-007/O-027). Established viewers keep labels single-layer and initially hidden (O-033); manual labels-URL assembly is the current UX in established tools (O-052).

#### [B-035] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "optional overlays for associated label images"

Basis: supported
Reason: Overlay-on-canvas is documented as a niche capability in the matrix (only napari, WEBKNOSSOS, Microscopy Nodes support multi-image overlay), so the "needs its own acceptance fixtures" consequence is supported.
Evidence: S043 lines 473-507; S003 lines 431-455; S041 lines 11-14

- **Product consequence:** in-product labels discovery is real added value, but alignment math and per-level verification are the hard part; the Plan promises more overlay capability than most viewers ship (O-051), so this needs its own acceptance fixtures, not a rider on image display.

#### [B-038] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "A details panel shows dimensions, units and coordinates"

Basis: supported
Reason: Composition rule (dataset scale relative to level 0, then group-level transform; translation after scale) verified; units SHOULD-level and frequently absent verified in the spec and the maintainer comparison; the napari scale-bar/unit-consistency cascade verified in the reader source.
Evidence: S003 lines 304-317; S003 lines 166-174; S029 lines 294-296; S048 lines 249-258

- **Disposition: covered**, with one **correction**.

#### [B-039] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "A details panel shows dimensions, units and coordinates"

Basis: supported
Reason: All constraint elements verified, including time units hideable in group-level transforms (the 0.1 ms example) and the custom-axis-type legality.
Evidence: S003 lines 166-174; S003 lines 304-316; S003 lines 368-374; S048 lines 249-258; S029 lines 294-296

- **Exact constraint:** physical size = composition of dataset-level scale (relative to level 0) with any group-level transform, translation applied after scale (O-006/O-007); units are SHOULD-level and frequently absent (O-044, O-004); custom axis types are legal (O-004); time units can hide in group-level transforms (S003 L368-374). One viewer's whole-view scale bar disappears if any layer lacks units (O-032).

#### [B-040] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "A details panel shows dimensions, units and coordinates"

Basis: supported
Reason: The "unspecified per axis" and no-name-derived-units consequences follow from the SHOULD-level unit/type rules and the documented writer behavior; composed-transform cursor readout follows from the composition rule.
Evidence: S003 lines 166-174; S003 lines 304-316; S029 lines 294-296

- **Product consequence:** the panel needs an explicit "unspecified" state per axis and must not derive physical units from axis names; coordinate readout at the cursor should use composed transforms per selected level.

#### [B-043] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "The viewer chooses an available pyramid level appropriate for the current view"

Basis: supported
Reason: The product_choice disposition is factually grounded (AGAVE, the closest desktop analog, ships a manual level picker defaulting to highest resolution with an OOM warning, verified in its docs), and the "appropriate must respect level geometry" correction is supported by the Z-downsampling/non-2-factor matrix rows, centering translations in ome-zarr-py output, and sharded/chunk-exceeding-extent reality.
Evidence: plan/Viewer.md line 5; S072 lines 1-3; S117 lines 94-128; S043 lines 2-35; S043 lines 80-108; S016 lines 276-294; S055 lines 1-74

- **Disposition: product_choice** (the Plan picks automatic selection where the closest desktop analog ships a manual picker; both are legitimate, but they have different failure modes), plus a **correction** on what "appropriate" must mean.

#### [B-044] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "The viewer chooses an available pyramid level appropriate for the current view"

Basis: supported
Reason: Level-geometry hazards verified at the cited sources: vizarr's "same number of Z-sections" expectation, non-2 factors, translation-centering writer behavior, and chunk shapes exceeding array extents in the sharded IDR capture.
Evidence: S043 lines 2-13; S043 lines 80-108; S016 lines 276-294; S055 lines 2-12

- **Exact constraint:** level choice must respect level geometry — levels can be Z-downsampled and have non-2, non-uniform factors, and dataset translations can center levels (O-027, O-050); chunk shapes can exceed array extents and be sharded (O-018). The documented failure class is choosing/reading levels by assumption (vizarr's "same number of Z-sections" expectation; repetitive-chunk rendering).

#### [B-045] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L5 — "The viewer chooses an available pyramid level appropriate for the current view"

Basis: supported
Reason: The manual-picker alternative is documented in the analog's docs and PR #73 (per-level memory estimate, ROI sub-selection, low-res-first workflow); the override-as-safety-valve recommendation follows.
Evidence: S117 lines 94-128; S125 line 55; S072 lines 1-3

- **Product consequence:** automatic choice needs viewport↔level math plus per-level size feedback; the simpler alternative (implemented in the desktop analog) is a level picker with memory estimates and optional sub-region, with documented low-res-first workflow (O-060, O-063). If automatic selection is kept, a manual override is the safety valve.

#### [B-048] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L7 — "Large image reads run in the background… Changing the selected view cancels work…"

Basis: supported
Reason: Plan line 7 does specify background reads and cancellation; the adjacent cache-policy capability note is supported by the analog's cache/memory-estimate work.
Evidence: plan/Viewer.md line 7; S114 lines 91-507; S103 line 58

- **Disposition: covered** (as a specified obligation), with an adjacent **optional_capability** (cache policy).

#### [B-049] QUALIFIED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L7 — "Large image reads run in the background… Changing the selected view cancels work…"

Basis: counterevidence
Reason: The substantive pain (blocking, hard-to-cancel loads, worst during time series) is verified, but "most-upvoted issue" is contradicted by the capture itself: AGAVE #84 shows zero reactions. The replacement drops the unsupported superlative.
Evidence: S103 lines 11, 34, 58; S103 lines 60-64; S114 lines 91-507; S049 lines 1-25

Active (verified replacement; the draft text is superseded history):

- **Exact constraint:** the direct desktop analog has a long-standing open issue for exactly this failure: "Data loading currently blocks the whole application and is not easy to cancel. This is most obvious during a time series render when in between times, loading is blocking everything." (AGAVE issue #84, open at capture, created 2023-02-09 — note it is NOT the most-upvoted issue; the capture records zero reactions, S103 lines 11, 34, 58, 60-64). The analog's implemented answers include an in-memory volume cache series and a "Memory Estimate" UI element (PR/issue titles only, S114 lines 91, 163, 235, 393, 507). Sharded local reads are a known performance pain point ecosystem-wide, but the evidence is title/search-listing only, not primary measurement (S049 lines 1-25; S028 lines 455-456). Plan fit: Plan line 7's background-read and cancellation obligations target this documented failure class. Consequence: cancellation needs a defined policy for partially-read data, and time-series scrubbing is the stress case. Validation idea: cancel a large level load mid-read by switching images/timepoints and assert UI responsiveness, no completion-driven repaint of the superseded view, and memory return to baseline.

#### [B-050] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L7 — "Large image reads run in the background… Changing the selected view cancels work…"

Basis: supported
Reason: Both consequences are supported: the cache-policy question arises directly from the analog's caching/cancellation issues, and time-series scrubbing is documented as the worst case in #84.
Evidence: S103 line 58; S104 line 58

- **Product consequence:** cancellation needs a defined policy for partially-read data (discard vs cache), and time-series scrubbing is the stress case, not static pan/zoom.

#### [B-053] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L7 — "Opening failures explain which image or data could not be displayed and allow the user to choose another item"

Basis: supported
Reason: The correction is supported: parse_url's documented None collapse and the reference library's own open error-UX issues show the obligation cannot be inherited from reused libraries.
Evidence: S019 lines 213-233; S028 lines 2775-2776; S028 lines 4443-4444

- **Disposition: covered**, with a **correction**: this cannot be inherited from reference libraries.

#### [B-054] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L7 — "Opening failures explain which image or data could not be displayed and allow the user to choose another item"

Basis: supported
Reason: All constraint elements verified: None-collapse, tracker error-UX gaps, real MUST violations (S056), substring-based format sniffing (S098), the four-dtype whitelist (correctly evidenced by S096 lines 25-28), draft-only transform types in PR #206 (affine/rotation/sequence/displacement/coordinateSystems commit titles and section heading), and editor's-draft non-support in the spec.
Evidence: S019 lines 213-233; S028 lines 2319-2321; S056 lines 1-68; S098 lines 72-77; S096 lines 25-28; S004 lines 149-158; S004 lines 188-319; S004 line 526; S003 lines 25-27

- **Exact constraint:** parse_url-style APIs collapse missing vs broken into None (O-036); reference tracker lists error-UX gaps as open (O-071); real files violate MUSTs (O-019) and misleading names exist (O-080); unsupported dtypes/transforms/versions will occur (O-023, O-038 draft-only transform types, O-001 editor drafts).

#### [B-055] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L7 — "Opening failures explain which image or data could not be displayed and allow the user to choose another item"

Basis: supported
Reason: The first-party error-taxonomy consequence follows from the verified library error-collapsing behavior and the documented real-world violation classes (missing plate.version, unknown versions, unsupported dtypes, misleading names).
Evidence: S019 lines 213-233; S028 lines 2319-2321; S056 lines 1-68; S096 lines 25-28; S098 lines 72-77

- **Product consequence:** Slide Scout needs its own error taxonomy (missing metadata, unreadable array, unsupported codec/shard/dtype/transform, version mismatch, inconsistent hierarchy) each naming the offending node, with the list still usable.

#### [B-058] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — "should interoperate with filesets from real OME-Zarr 0.5 tools"

Basis: supported
Reason: Verified against the Plan text itself: line 9 names no producers and never mentions the Zarr v3 storage surface (sharding, codecs, crc32c indexes), while the corpus shows those are the hard half of real 0.5 data.
Evidence: plan/Viewer.md line 9; S055 lines 1-74; S033 lines 152-162; S044 lines 126-159

- **Disposition: correction** (under-specified: "real tools" must be enumerated, and the hard half of 0.5 — the Zarr v3 storage surface — is nowhere named in the Plan).

#### [B-059] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — "should interoperate with filesets from real OME-Zarr 0.5 tools"

Basis: supported
Reason: Every enumerated producer and storage element verified at the cited sources (challenge converter, b2r defaults, IDR sample diversity, ome-zarr-py degenerate defaults and 2D-only downsampling, WEBKNOSSOS sharded v3, SpatialData permissiveness, NGFF-Converter, and the storage surface).
Evidence: S034 lines 41-46; S034 lines 150-156; S033 lines 213-226; S033 lines 159-162; S010 lines 1026-1143; S029 lines 293-296; S058 lines 347-360; S052 line 128; S070 lines 107-108; S055 lines 1-74

- **Exact constraint:** producer set evidenced in-corpus: ome2024-ngff-challenge converter (sharded, ro-crate, zarr.json migration — O-047), bioformats2raw 0.4-default/0.5-opt-in (O-048), IDR samples (O-046), ome-zarr-py (2D-only downsampling, degenerate defaults — O-044), WEBKNOSSOS (sharded v3, O-068), SpatialData (permissively-validated 0.5, O-056), NGFF-Converter (O-075). Storage surface: sharding (incl. upcoming "auto"), blosc/gzip/zstd/null codecs, crc32c indexes, little-endian (O-018, O-045, O-048, O-047).

#### [B-060] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — "should interoperate with filesets from real OME-Zarr 0.5 tools"

Basis: supported
Reason: The year-spanning 0.5 support dates are verified (read: late 2024; write default: Aug 2025; napari b2r enumeration: May 2026), supporting the producer+version provenance requirement.
Evidence: S008 lines 149-163; S013 lines 126-131; S065 lines 29-41; S015 lines 46-63

- **Product consequence:** acceptance fixtures must span producers and storage shapes; interop claims should name the producer and version, since 0.5 support dates differ by a year across tools (O-041, O-042, O-055).

#### [B-063] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — "Source files remain unchanged; display settings are local to the viewing session"

Basis: supported
Reason: The disposition matches the Plan text: line 9 does promise unchanged source files and session-local display settings.
Evidence: plan/Viewer.md line 9

- **Disposition: covered.**

#### [B-064] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — "Source files remain unchanged; display settings are local to the viewing session"

Basis: supported
Reason: Read-only open paths verified in the corpus readers (mode "r" defaults in ome-zarr-py store/io code) and the challenge resave's "input will not be modified"; the AGAVE settings-JSON-with-absolute-path counterexample verified at S108 line 27. (Minor citation slip in the draft's "(O-019 mode 'r')" reference — the underlying sources support the claim directly.)
Evidence: S016 line 74; S019 lines 79-100; S034 lines 150-156; S108 line 27

- **Exact constraint:** read-only open paths throughout the corpus readers (O-019 mode "r"; the challenge resave likewise never modifies input, O-047). The rejected alternative is visible in the corpus: AGAVE persists settings to a JSON containing an absolute file path (O-062/AGAVE HELP L27) — brittle and session-crossing.

#### [B-065] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — "Source files remain unchanged; display settings are local to the viewing session"

Basis: supported
Reason: The consequence follows from Plan line 9's review gate; the persistence counterexample (S108 line 27) shows the brittleness the gate would guard.
Evidence: plan/Viewer.md line 9; S108 line 27

- **Product consequence:** trivial to honor but worth an explicit test; settings persistence (if ever added) is an "additional capability" under the L9 review gate.

#### [B-068] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — exclusions ("Image editing, export, remote storage and automated … interpretation are outside")

Basis: supported
Reason: Boundary reading matches Plan line 9; the storage-related corpus failures are verified (labels-from-buckets, proxy failure, RFC-5 group download in ome-zarr-py's tracker), and the embedded-payload watch item (OME-XML, ro-crate) is verified in the spec and converter docs.
Evidence: plan/Viewer.md lines 5-9; S028 lines 4367-4368; S028 lines 3079-3081; S028 lines 2395-2397; S034 lines 41-63; S003 lines 175-260

- **Disposition: covered** (boundary) with one **unresolved** watch item.

#### [B-069] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — exclusions ("Image editing, export, remote storage and automated … interpretation are outside")

Basis: supported
Reason: Same verified content as B-068 from the constraint side; discovery must classify non-image payloads, which the b2r layout section and converter listing confirm exist inside real filesets.
Evidence: S003 lines 175-275; S034 lines 41-63; S028 lines 3079-3081; S028 lines 4367-4368

- **Exact constraint:** local-filesystem-only simplifies storage (no HTTP range/S3), but several corpus failures are storage-related (labels from buckets O-071; proxy issues S028 titles) and thus out of scope by construction. Watch item: local filesets embed non-image payloads (OME-XML, ro-crate, OME/METADATA.ome.xml — O-012, O-047) that discovery must classify without treating as images.

#### [B-070] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — exclusions ("Image editing, export, remote storage and automated … interpretation are outside")

Basis: supported
Reason: The consequence (thin storage layer, hierarchy-aware discovery) follows directly from the verified boundary and payload facts.
Evidence: plan/Viewer.md line 9; S003 lines 175-275

- **Product consequence:** the boundary keeps the storage layer thin; discovery must still be hierarchy-aware.

#### [B-073] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L9 — "Additional capability choices require explicit review"

Basis: supported
Reason: The gate reading matches Plan line 9, and every crossing item is evidenced: channels-from-separate-files and LUT display (AGAVE tracker titles), 0.6 scenes/RFC-5 (RFC index; ome-zarr-py v0.19.0), zip stores (RFC-9 index; three open ome-zarr-py issues), >5D arrays (RFC-3 index entry).
Evidence: plan/Viewer.md line 9; S112 line 15; S112 line 785; S051 line 63; S051 line 87; S051 line 112; S052 line 128; S028 line 2248; S028 line 3612; S028 line 4068

- **Disposition: covered** (gate). Items that would cross it, evidenced as user-demand or ecosystem direction: multi-image overlay sessions / channels from separate files (O-065); LUT-based channel display (O-065); 0.6 scenes/RFC-5 transforms (O-053, O-056); zip stores (RFC-9, O-053; ome-zarr-py open issue S028); >5D arrays (RFC-3, O-053).

#### [B-075] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L11 — "Acceptance uses representative filesets…"

Basis: supported
Reason: Verified against the Plan text: line 11 says "representative filesets" without defining representativeness; the corpus supplies a concrete anchor (IDR 0.5 sample list), so the correction is available as claimed.
Evidence: plan/Viewer.md line 11; S010 lines 1026-1143

- **Disposition: unsupported as written** (the Plan does not say what "representative" is); **correction** available cheaply from the corpus.

#### [B-076] QUALIFIED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L11 — "Acceptance uses representative filesets…"

Basis: counterevidence
Reason: The fixture inventory and the S068 gap are verified, but "no multi-entry-multiscales fixture exists anywhere" is contradicted by the viewer matrix itself, which documents a multiple-multiscales sample (4995115.zarr, 0.4, remote). The replacement restates the gap precisely.
Evidence: S043 lines 277-283; S010 lines 1026-1143; S034 line 70; S024 line 39; S068 line 1

Active (verified replacement; the draft text is superseded history):

- **Exact constraint:** concrete 0.5 fixtures with provenance exist in-corpus for acceptance (Plan line 11): the IDR 0.5 sample list (S010 lines 1026-1143) — plates with 384 wells/1 field (76-45.ome.zarr) and 49 wells/32 fields (190129.zarr), 2D XY (ExpD), XYZ (ExpA), XYZC/XYZCT images, bioformats2raw collections (9-image BR00109990_C2.zarr), and 9822152.zarr at 144384x93184 / 21.57 GB (S034 line 70) — plus the napari-ome-zarr PR #123 test URL list (S024 body). Gaps stated precisely: no 0.5 fileset with multiple multiscales entries is listed in-corpus — the only documented multi-entry-multiscales sample is 4995115.zarr, which is 0.4 and a remote URL (S043 lines 277-283) — so a local multi-multiscales 0.5 fixture must be synthesized; and no readable 0.4/0.5 mixed-hierarchy sample exists in-corpus (the 0.4 .zattrs capture S068 is retained as opaque binary, S068 line 1).

#### [B-077] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L11 — "Acceptance uses representative filesets…"

Basis: supported
Reason: Anchoring acceptance to named public filesets plus synthetic spec-edge fixtures follows from the verified inventory, and (given the local-only boundary) the multi-multiscales case must indeed be synthetic.
Evidence: S010 lines 1026-1143; S043 lines 277-283; plan/Viewer.md lines 5-9

- **Product consequence:** acceptance can be anchored to named public filesets plus synthetic spec-edge fixtures; the multi-multiscales case must be synthetic.

#### [B-080] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L11 — "A large dataset must not freeze interaction"

Basis: supported
Reason: Plan line 11 does make the no-freeze promise, and the differentiating-risk framing is supported by the verified failure classes (zoom crashes, blocking loads, memory leaks, GPU ceilings) and the real data scales (1.0 TB plate, 21.57 GB single plane).
Evidence: plan/Viewer.md line 11; S043 lines 16-17; S043 lines 218-220; S103 lines 11-58; S119 lines 11-68; S115 line 14; S034 lines 67-79

- **Disposition: covered** (promise), with evidence it is the differentiating risk.

#### [B-081] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L11 — "A large dataset must not freeze interaction"

Basis: supported
Reason: Every constraint element verified at the cited lines, including the 1 TB plate (190129.zarr, S034 line 79) and the 21.6 GB single-plane image (9822152.zarr, S034 line 70 / S010 lines 1114-1124).
Evidence: S043 lines 2-35; S043 lines 207-238; S103 lines 11-58; S119 lines 11-68; S115 line 14; S034 lines 67-79; S010 lines 1114-1124

- **Exact constraint:** the analog product's tracker shows zoom-time crashes on plates and pyramids in established viewers (O-050), blocking loads (O-064), memory leaks (O-064), and GPU-memory ceilings for volume approaches (O-059); 1 TB plates and 21.6 GB single-plane images are real 0.5 data (O-046).

#### [B-082] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L11 — "A large dataset must not freeze interaction"

Basis: supported
Reason: The 2D-canvas avoidance of GPU-memory ceilings is supported by the analog docs (GPU memory dictates maximum load size), and zoom-during-load on plate data maps to the verified crash class.
Evidence: S062 line 7; S115 line 14; S043 lines 207-238

- **Product consequence:** the 2D-canvas approach avoids the volume-rendering memory ceiling (O-059) — worth stating as the deliberate product simplification; interaction freeze testing must include zoom-during-load on plate/stitched data.

#### [B-085] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### L11 — "Malformed or unavailable input must produce understandable feedback rather than a crash"

Basis: supported
Reason: The shared-constraint cross-reference is accurate and each listed malformed case is evidenced (plate missing version; identity-transform proposal; window start/end handling differences; partial omero via --no-minmax; misleading names).
Evidence: S056 lines 1-68; S035 lines 2146-2147; S018 lines 375-383; S048 lines 316-323; S033 lines 351-354; S098 lines 72-77

- **Disposition: covered** (see L7 failure-UX row for the shared constraint/validation idea); the corpus adds specific malformed cases to test: plate missing `version` (O-019), identity transforms (O-073), window missing start/end (O-030/O-032's differing behaviors), partial omero (O-048), misleading names (O-080).

#### [B-087] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### Not in the Plan at all (each **unresolved** for Plan purposes, obligation established by corpus)

Basis: supported
Reason: The factual base is verified (spec-defined user choice with first-entry fallback; zero ecosystem support in the matrix, with hard crashes) and the item is correctly framed as an unresolved product decision rather than an obligation.
Evidence: S003 lines 298-317; S003 lines 388-397; S043 lines 277-316

- **Multiple multiscales entries** — spec-defined user choice, zero ecosystem support, some viewers crash (O-008, O-029, O-033, O-050). Unresolved: whether Slide Scout lists them (spec-faithful, beyond-ecosystem) or matches ecosystem behavior (first entry only). Product decision needed.

#### [B-088] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### Not in the Plan at all (each **unresolved** for Plan purposes, obligation established by corpus)

Basis: supported
Reason: The obligatory nature of the Zarr v3 storage surface is verified (S003 lines 67-72; S055), the Plan is silent on it (full text checked), and the three stack options are each evidenced (tensorstore route incl. the v0.1.78 pin; zarr-python >=3 packaging; napari's direct-zarr rewrite).
Evidence: S003 lines 67-72; S055 lines 1-74; plan/Viewer.md lines 5-11; S111 lines 11-58; S096 line 9; S096 lines 25-28; S015 lines 47-61; S024 line 39

- **Zarr v3 storage-feature strategy** (shards/codecs) — obligatory per O-002/O-018 but unspecified in the Plan; build-vs-library decision also open (tensorstore C++ route O-070/O-074 vs zarr-python ≥3 route O-079 vs napari's direct-zarr rewrite precedent O-054). Unresolved in-corpus.

#### [B-089] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 3. Plan fit, line by line > ### Not in the Plan at all (each **unresolved** for Plan purposes, obligation established by corpus)

Basis: supported
Reason: All three policy inputs verified: SpatialData-permissive 0.5 validation in ome-zarr-py v0.19.0, AGAVE's zarr-format version inference, and 0.6rc0 schema signals; correctly framed as an unresolved product decision.
Evidence: S052 line 128; S082 line 55; S035 lines 355-356; S035 lines 1339-1340

- **Version handling policy** — strict 0.5-only vs permissive (SpatialData precedent O-056; AGAVE inference O-067; spec signals 0.6rc0 approaching O-073). Unresolved product decision.

---

#### [B-091] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 4. Simpler alternatives and opportunities noted (not obligations)

Basis: supported
Reason: The manual level picker with memory estimate and ROI sub-selection is verified as shipped analog behavior (docs and PR #73).
Evidence: S117 lines 94-128; S125 line 55

- **Manual level picker with memory estimate + sub-region ROI** instead of fully automatic level choice — shipped pattern in the closest desktop analog (O-060, O-063); automatic choice can layer on top later.

#### [B-092] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 4. Simpler alternatives and opportunities noted (not obligations)

Basis: supported
Reason: GPU-memory ceilings verified for both Allen Institute viewers, and vizarr's 8-dtype 2D-slice product class verified in its README.
Evidence: S062 line 7; S115 line 14; S025 lines 79-92

- **2D-slice canvas (Plan's shape)** vs volume rendering: avoids GPU-memory ceilings that bind AGAVE/Vol-E (O-059); vizarr proves the 2D-slice product class with 8-dtype support (O-058).

#### [B-093] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 4. Simpler alternatives and opportunities noted (not obligations)

Basis: supported
Reason: ome-zarr-py's stitched almost-square well grid with zero-filled missing fields verified in source, and the spec's "offer the user a choice of images" verified; correctly framed as a product choice.
Evidence: S018 lines 394-464; S003 lines 271-274

- **Stitched-plate rendering vs well-by-well navigation**: ome-zarr-py stitches with zero-filled gaps (O-031); the spec explicitly allows offering users a choice of images (O-012). Well-navigation is simpler and avoids fake data; stitching is the incumbent behavior to consciously accept or reject (product choice).

#### [B-094] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 4. Simpler alternatives and opportunities noted (not obligations)

Basis: supported
Reason: The ome-zarr finder CSV + BioFile Finder pattern and BioFile Finder's desktop/web service split are verified in the cited captures.
Evidence: S023 lines 150-157; S022 lines 1-19; S066 lines 24-26; S067 lines 1-15

- **Collection browsing via manifest/CSV + external app** (ome-zarr finder + BioFile Finder, O-043/O-069) — the incumbent local-browsing shape; Slide Scout's integrated list is the delta.

#### [B-095] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 4. Simpler alternatives and opportunities noted (not obligations)

Basis: supported
Reason: Each differentiator is evidenced: omero fidelity gaps in the matrix, napari's unapplied group-level scale, the open vizarr dynamic-scale-bar request, manual labels-URL UX, and b2r enumeration fixed only in the May 2026 release.
Evidence: S043 lines 38-78; S043 lines 394-428; S050 line 2284; S041 lines 11-14; S065 lines 29-41

- **Differentiators with documented ecosystem gaps**: omero-faithful defaults incl. greyscale model and rdefs (O-051); group-level transform composition (O-051, napari gap); dynamic scale bar / calibrated display (O-072 — vizarr request open); in-product labels discovery (O-052); b2r series enumeration (fixed only May 2026 in napari-ome-zarr, O-055).

#### [B-096] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 4. Simpler alternatives and opportunities noted (not obligations)

Basis: supported
Reason: Timestamp overlay in physical time units and per-timepoint transfer-function adaptation verified in the current AGAVE docs; genuinely absent from the Plan text.
Evidence: S117 lines 299-317; S117 lines 518-537; plan/Viewer.md lines 5-11

- **Timestamp overlay in physical time units and per-timepoint window adaptation** — shipped in AGAVE docs (O-061), absent from the Plan; candidate future capability under the L9 review gate.

---

#### [B-098] QUALIFIED
Context: # Slide Scout — corpus research report (draft) > ## 5. Deferred items (with reasons)
Table columns: | Item | Reason for deferral |

Basis: counterevidence
Reason: The deferral decision and its core reason (not part of released 0.5; ecosystem converging) are verified, but "RFC text not in corpus" is contradicted by S051, which contains the actual RFC-5 proposal text (version 0.6.dev3, state S3, overview and user stories). The replacement corrects the reason.
Evidence: S003 lines 25-27; S051 lines 63-129; S051 lines 216-304; S052 line 128; S035 lines 355-356

Active (verified replacement; the draft text is superseded history):

| 0.6 scenes / RFC-5 coordinate systems & transforms | Not part of released 0.5 (S003 lines 25-27: 0.5 is the released version; editor's-draft data not necessarily supported) and belongs to separate next-version RFC work (S051 lines 63-124). Correction to the draft's reason: RFC-5 text IS partly in-corpus — S051 lines 126-304 contain the RFC-5 proposal itself ("Coordinate Systems and Transformations", document version 0.6.dev3, status "S3 (Update implementations)", overview and user stories) — so the deferral rests on scope, not on absence of text. Ecosystem convergence confirmed (S052 line 128: v0.19.0 ships 0.6 image-class/scene support; S035 lines 355-356, 1339-1340: 0.6rc0 schema issues). Handle via clear "unsupported version/transform" messaging only. |

#### [B-099] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 5. Deferred items (with reasons)
Table columns: | Item | Reason for deferral |

Basis: supported
Reason: The exclusion is verified in Plan line 9 and the brief, and the corpus failure evidence for remote storage (labels from buckets) is title-level but real.
Evidence: plan/Viewer.md line 9; brief.md line 5; S028 lines 4367-4368

| Remote/http/S3 storage | Excluded by Plan L9 / brief L5; corpus failure evidence (O-071) is remote-specific. |

#### [B-100] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 5. Deferred items (with reasons)
Table columns: | Item | Reason for deferral |

Basis: supported
Reason: RFC-9 (Zipped OME-Zarr) is in the index as next-version work, and three separate open ome-zarr-py issues evidence zip-store friction ("Zip store", "unable to write_image into a zipStore?", "Using a ZipStore instead of FSStore").
Evidence: S051 line 112; S028 line 2248; S028 line 3612; S028 line 4068

| Zip stores (RFC-9) | Future RFC (O-053); open issue even in reference lib (S028). |

#### [B-101] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 5. Deferred items (with reasons)
Table columns: | Item | Reason for deferral |

Basis: supported
Reason: RFC-3 (more dimensions) and RFC-4 (axis orientation) are verified as future RFC work in the index; detect-and-explain is a recommendation, not an obligation.
Evidence: S051 lines 63-74; S051 lines 85-86

| >5D arrays, axis orientation (RFC-3/4) | Future RFCs (O-053); detect-and-explain only. |

#### [B-102] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 5. Deferred items (with reasons)
Table columns: | Item | Reason for deferral |

Basis: supported
Reason: The single-fileset boundary is the Plan's shape (line 5 opens "a local OME-Zarr 0.5 fileset"), the review gate is line 9, and the user demand is evidenced by the AGAVE tracker title.
Evidence: plan/Viewer.md lines 5-9; S112 line 15

| Multi-image overlay sessions; channels from separate files | Breaches single-fileset boundary (Plan L9); user demand exists elsewhere (O-065) — review-gate item. |

#### [B-103] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 5. Deferred items (with reasons)
Table columns: | Item | Reason for deferral |

Basis: supported
Reason: Correctly deferred: the corpus evidence for sharded-read performance is title/listing-level only (S049 search listing; S028 title for #640's writer-path failure), so measurement is required before tuning.
Evidence: S049 lines 1-25; S028 lines 455-456; S044 lines 126-159

| Sharded-read performance tuning | Needs measurement on real hardware; corpus has only issue-title evidence (S049, O-018). Correctness first. |

#### [B-104] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 5. Deferred items (with reasons)
Table columns: | Item | Reason for deferral |

Basis: supported
Reason: Consolidated metadata appears in ome-zarr-py's tracker as an open question (experimental zarr feature, enable on write/read?), and the 0.5 spec text contains no consolidated-metadata obligation — checked by reading the full spec and by corpus grep for "consolidated" in S003 (no matches).
Evidence: S028 lines 1609-1611; S028 line 1657; S003 lines 1-896 (grep "consolidated": no matches)

| Consolidated metadata | Unresolved concept in zarr ecosystem (S028 title); no 0.5 obligation. |

#### [B-105] CONFIRMED
Context: # Slide Scout — corpus research report (draft) > ## 5. Deferred items (with reasons)
Table columns: | Item | Reason for deferral |

Basis: supported
Reason: Volume rendering is absent from the Plan's canvas description (line 5), and the GPU-memory simplification rationale is verified in the analog docs.
Evidence: plan/Viewer.md line 5; S062 line 7; S115 line 14

| 3D/volume rendering | Out of Plan scope; noted as the deliberate simplification (O-059). |

#### [B-107] QUALIFIED
Context: # Slide Scout — corpus research report (draft)

Basis: counterevidence
Reason: The coverage inventory contains verified errors: S096 and S121 are AGAVE grep extracts with substantive content (dtype whitelist; getOmero dual lookup; tensorstore v0.1.78 pin), not failed captures, while S120 — listed as a grep extract — is the failed search. The replacement corrects the inventory; the unresolved-questions list is otherwise accurate.
Evidence: S096 lines 1-29; S121 lines 1-9; S120 line 1; S095 line 1; S051 lines 126-304

Active (verified replacement; the draft text is superseded history):

**Sources read in full (or near-full):** as listed in the draft, with one correction — the AGAVE grep extracts are S096 and S121 (not S120): S096 lines 25-28 carry the VolumeDimensions.cpp four-dtype whitelist, S096 line 9 pins tensorstore v0.1.78 in AGAVE's CMakeLists, and S121 lines 1-9 carry the FileReaderZarr::getOmero dual-layout lookup.

**Failed or empty captures — no evidence either way (not proof of absence):** S002 (0 bytes per catalog), S005, S007, S030, S042, S045, S046, S077, S095, and S120 (contains only "No literal matches. This does not establish semantic absence."); search-result-only listings: S001, S012, S021, S032, S036, S049, S060, S069, S071.

**Unresolved questions carried forward:** as listed in the draft, with item (2) narrowed — S051 does contain the RFC-5 proposal text (version 0.6.dev3, state S3, overview and user stories, S051 lines 126-304), so the unknown is the remainder of RFC-5's technical semantics and scene metadata behavior, not all of it.

## 2. Rejected draft assertions (no acceptance credit)

(none)

## 3. Not verified: unresolved, undecided or malformed-record proposals (no retention credit)

(none)

## 4. Verifier additions (new verifier assertions; checked like any claim)

# Additions — independent verification pass (ome-zarr-thin)

Material from stage1/observations.md that the draft lost, findings established during verification, correct non-findings, grouped product decisions, and outstanding gaps. All line references were read directly in case/sources/ during this verification pass.

## 1. Corrections to the draft's source-handle inventory (verified)

- **The AGAVE grep extract cited as "S120" is actually S096.** S096 lines 25-28 contain the `renderlib/VolumeDimensions.cpp` four-dtype whitelist (int32, uint16, uint8, float32); S096 line 9 additionally pins **tensorstore v0.1.78** in AGAVE's CMakeLists (`URL .../tensorstore/archive/refs/tags/v0.1.78.tar.gz`), corroborated by the tag captures S076 and S116. S120 contains only "No literal matches. This does not establish semantic absence." (S120 line 1) — it is a failed search. This corrects B-019 (decided qualify) and the B-107 coverage lists.
- **S121 is not a failed capture.** S121 lines 1-9 contain AGAVE's `FileReaderZarr::getOmero` grep extract: the reader looks for omero first under the 0.5 namespace (`ome["omero"]`) and falls back to legacy top-level `attrs["omero"]` — a dual 0.4/0.5 omero lookup. The draft lists S121 as failed (B-107) and never uses this evidence.
- **Failed/empty captures re-confirmed by direct read** (each contains only an error string, no substantive content): S002 (0 bytes per catalog), S005 ("Clone exceeded 256 MiB..."), S007 ("Git metadata is not a document source"), S030 (403), S042 (404), S045/S046 (FileNotFoundError during clone), S077 (422), S095 ("Incomplete clone is not a source"), S120 ("No literal matches").

## 2. Material observations from stage1/observations.md that the draft lost

- **AGAVE's omero dual-layout shim (O-024, S121 lines 1-9).** The closest desktop analog reads omero from the 0.5 namespace first and falls back to the 0.4 flat attribute. The draft's 0.4/0.5 discussion (B-014) cites only the napari/ome-zarr-py dual reads. For a 0.5-only product this remains an optional capability, but its cost is small and the corpus mixes versions.
- **Exact version-string matching (O-025, S016 lines 13-21).** ome-zarr-py's `format_from_version` matches the string exactly (floats normalized via `str()`) and raises ValueError otherwise — so "0.5.0"-style or float version variants hit the error path in reference tooling. Slide Scout's version handling (B-089) should normalize before comparing.
- **Reader-side strictness of ome-zarr-py (O-028, S016 lines 296-365).** Validation enforces exactly one scale, scale FIRST in the list, vector length == ndim, numeric values, raising ValueError — the reference stack hard-fails on reorderings a viewer might prefer to salvage. Strictness per error class is a product choice; feeds the error-taxonomy consequence in B-055.
- **ome-zarr-py scene behavior unresolved (O-037, S009 lines 21-72).** The repo tree contains `ome_zarr/classes/scene.py` and sharding/transforms docs, but scene.py's content is not in the corpus — the draft's unresolved list (B-107) omits this item.
- **bioformats2raw synthesizes plates from raw acquisitions (O-049, S033 lines 459-503, 335-337).** ND2PlateReader groups multiple .nd2 files into a single HCS plate purely by filename pattern; BioTekReader likewise — so plate filesets are common even outside IDR, and TCZYX is the writer default since 0.3.0 with `--dimension-order` deprecated as producing invalid data. Relevant to B-059's producer set and B-009's plate fixtures.
- **The analog caps concurrent channels at four (O-062, S117 lines 26-28; S108 line 17).** Current AGAVE docs: "can present up to 4 channels concurrently"; the older HELP doc states the same cap with a 16-bit-unsigned limit. Concrete precedent that "channel visibility controls" (Plan line 5) does not imply unlimited concurrent channels, and for explicit capability-limit messaging.
- **AGAVE tracker has zero "shard" mentions (O-077, S102 lines 1-6).** A correct non-finding: textual absence is not evidence of capability or incapability (tensorstore may handle shards transparently). The desktop analog cannot serve as a tested sharding reference point either way.
- **Desktop packaging precedent (O-076, S091 lines 30-44).** AGAVE ships versioned installers (macOS arm64/x86, Windows) through v1.10.0 (2026-07-13) — desktop OME-Zarr viewing is a maintained product category; context for the product case.
- **Python-stack packaging constraints (O-079, S015 lines 47-63).** If building on ome-zarr: 0.19.2 requires Python >=3.12, zarr>=3.0.0, and ome-zarr-models>=1.8.1 — floors to plan for in the stack decision (B-088).

## 3. New supported findings (established during this verification)

- **S051 contains the RFC-5 proposal text, not just an index.** S051 lines 126-304 include the RFC-5 document itself: "Coordinate Systems and Transformations", document version 0.6.dev3, status "This RFC is currently in RFC state S3 (Update implementations)", overview, background, and user stories (registration/alignment, stitching/tiling, acquisition artefacts, annotation/analysis). This (a) corrects B-098's "RFC text not in corpus" (decided qualify) and B-107's "S051 grepped" characterization, (b) partially resolves the draft's carried-forward unresolved item (2), and (c) strengthens the 0.6-approaching signal alongside S052 (v0.19.0 0.6 PRs) and S035 (0.6rc0 schema issues).
- **AGAVE #84 has zero reactions** (S103 lines 60-64). The draft's "most-upvoted issue" framing (B-049, decided qualify) is unsupported; the issue remains open since 2023-02-09, which still evidences a long-standing uncancellable-blocking-loads pain point.
- **The multiple-multiscales matrix sample exists: 4995115.zarr** (v0.4, remote URL; S043 lines 277-283). "No multi-entry-multiscales fixture exists anywhere" (B-076, decided qualify) is overstated; the accurate gap is: none in 0.5, none local.
- **Proxy-failure evidence for the storage-related failure class** (S028 line 3080: "OME-Zarr does not run behind proxy"; body line 3127: aiohttp ignores HTTP_PROXY env vars). Additional corroboration for B-068's reasoning that the corpus's storage failures are remote-specific and out of scope by construction.
- **The tensorstore version behind the C++ route option is pinned in-corpus**: v0.1.78 (S096 line 9, with tag captures S076/S116). Sharpens the build-vs-library option list in B-088.

## 4. Correct non-findings

- **No consolidated-metadata obligation in 0.5.** "consolidated" does not appear anywhere in the S003 spec text (full read plus corpus grep); it exists only as an open question in ome-zarr-py's tracker (S028 lines 1609-1611, 1657). Absence of an obligation is established; absence of ecosystem relevance is not claimed.
- **S068 (the 0.4 .zattrs capture) supports no claim in either direction** — it is retained as opaque binary (S068 line 1). No 0.4-attribute-layout claim may rest on it.
- **S057 is an empty JSON array** — no vizarr release history, no AGAVE #220 comment content, and no tensorstore release list content is in evidence; no claims were made from it and none should be.
- **Zero "shard" hits in the AGAVE tracker (S102)** — absence of mentions is not evidence about AGAVE's sharding behavior (see §2).

## 5. Grouped product decisions for the user

1. **Discovery scope** (B-023/024/025/087): enumerate all images in a fileset (b2r series members, plate wells and fields, labels/label entry points, plain multiscale groups) and decide explicitly whether every multiscales entry is selectable (spec-faithful) or first-entry-only (ecosystem behavior). The multi-multiscales acceptance fixture must be synthesized locally (B-076 replacement).
2. **Zarr v3 storage strategy** (B-003/012/058/059/088/103): the observed 0.5 floor is sharding (incl. upcoming "auto") over bytes+{blosc, gzip, zstd, null} with crc32c indexes and explicit endianness. Choose the stack — tensorstore (v0.1.78 pinned by the analog) vs zarr-python >=3 vs a native minimal reader — and verify shard/codec coverage per version. Correctness first; performance tuning stays deferred pending measurement.
3. **Version policy** (B-004/089 + additions §2): read `attributes.ome.version` first, normalize strings, tolerate legacy placements (`multiscales[0].version`, plate/well/image-label), and decide strict 0.5-only vs SpatialData-style permissive; fail informatively on 0.6/editor's-draft markers.
4. **Level selection** (B-042..046/091): automatic choice requires level-geometry math (Z-downsampled levels, non-2 factors, centering translations, shard-aware reads) plus a manual override or picker with per-level memory estimates — the pattern the closest desktop analog ships.
5. **omero defaults and fallbacks** (B-028..031/095): specify the missing/partial-omero path (colors, names, windows, active flags, greyscale model, defaultZ clamping, computed contrast limits). Honoring omero faithfully is a differentiator; the fallback path is mandatory because producers legitimately omit it.
6. **Label overlays** (B-032..036): treat the labels-group listing as the source of truth, verify level counts/geometry at runtime, and give alignment its own acceptance fixtures (composed dataset+group transforms at two zoom levels).
7. **Error UX** (B-052..056): build a first-party error taxonomy (missing metadata, unreadable array, unsupported codec/shard/dtype/transform, version mismatch, inconsistent hierarchy) that names the offending node and keeps the image list usable; do not inherit library None-collapses.
8. **Plate presentation** (B-093): stitched-with-zero-fill vs well-by-well navigation is a conscious product choice; stitching must disclose synthetic zero regions if adopted.
9. **Channel concurrency** (additions §2, O-062): decide whether Slide Scout caps simultaneously-displayed channels (the analog's answer is four) — a display-capacity choice, not a format obligation.

## 6. Unresolved and unchecked items

- Reader-side auto-shard support/latency in current zarr libraries (S044 evidences the writer path; S049/S028 are title-only).
- Whether current viewer versions have fixed the O-050 matrix failures (matrix pinned April 2025, mostly v0.4 samples).
- Exact nature of the omero schema inconsistency (S035 line 3943 title only).
- Which bioformats2raw release first defaults to 0.5 output (S033 documents `--ngff-version {0.4,0.5}` and 0.4-convention defaults at capture; no default-change date).
- AGAVE's actual behavior on sharded files (S102 zero hits; untestable within the corpus).
- Rectilinear chunk grids in the wild (S109/S113 titles only; no sample in corpus; legality under 0.5 follows from S003 lines 67-72 unless disallowed, which it is not).
- Content of S068 (binary; unreadable in-corpus).
- Remainder of RFC-5's technical semantics beyond the S051 proposal text, and ome-zarr-py `classes/scene.py` behavior (file not in corpus; S009 tree only) — narrowed but open.
- Not independently re-verified in this pass beyond cited lines: the bulk title dumps S090, S097, S100, S101, S109, S112 (beyond cited titles), S114 (beyond cited titles); AGAVE issue bodies S110 (#395 "Failing to build on osx.") and S118 (#55 "load zarr") were spot-checked for identity only, consistent with B-107's coverage description but not load-bearing for any decided claim.

## 7. Coverage of this verification

- Every block B-001…B-107 in stage1/draft-blocks.md has exactly one decision in out/decisions.md (68 confirm, 5 qualify, 34 not_a_claim, 0 reject, 0 unresolved).
- Substantive claims were checked against the cited source lines read directly in this session: S003 (full spec text), S053, S054, S055, S056 (plus grep for version/acquisitions), S016, S018, S019, S048, S043 (full), S041, S010, S004, S059, S011, S014, S044, S013, S008, S029 (cited lines plus grep), S065, S015, S052, S024, S051, S017, S009, S023, S025, S062, S115, S072, S117, S108, S125, S103, S104, S105, S119, S081, S082, S083, S098, S096 (full), S120, S121, S102, S091, S111, S113, S058, S070, S033, S034, S022, S066, S067, S001, S050/S035/S028 (cited title lines plus targeted greps for "zip", "proxy", "consolidated", "Labels not loaded"), and the failed-capture set S005/S007/S030/S042/S045/S046/S068/S077/S095.
- Corpus searches run with ripgrep over case/sources/: `version|acquisition` (S056), `cxyz|\[1, 1, 1, 1, 1\]|...` (S029), `consolidated metadata|Labels not loaded` (S028), `"title"` sweeps (S028, S104, S105, S112, S114, S110, S118), `zip|Zip` and `proxy` (S028), `VolumeDimensions\.cpp` and dtype-equality patterns (all sources), `0\.1\.78` (all sources), `rotation|affine|displacement|sequence|coordinateSystems` (S004), `nd2|plate` (S033), `absolute|Save JSON` (S117), `RFC-3|RFC-4: Axis Orientation` (S051), `consolidated` (S003). Scope: the fixed corpus only; no live fetching.
- Result: 3 blocks corrected via replacement (B-019 wrong source handle S120→S096; B-049 unsupported "most-upvoted" superlative; B-076 overstated fixture-gap claim), 1 block corrected on a subsidiary reason (B-098 "RFC text not in corpus"), and the coverage inventory fixed (B-107: S096/S121 are grep extracts, S120 is the failed search). All other substantive blocks were supported as written.

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
[B-017: CONFIRMED]
- **Ecosystem failure classes to design against** (viewer matrix, mostly v0.4 samples, versions pinned April 2025 — O-050/O-052, S043/S041): Z-downsampled pyramids (vizarr wrong, napari crashes on zoom); non-2 scale factors between levels (vizarr fails); plates render but crash on zoom-in; b2r collections fail in most viewers; **no tested viewer** opens images beyond the first multiscales entry, and some crash hard. Group-level multiscales scale was not applied by napari-ome-zarr at test time (O-051, S043 L394-428) — exactly the composition case in O-007.
[B-018: CONFIRMED]
- **0.5 rendering failures exist in current tools.** vizarr "renders chunks repetitively" for challenge-converted 0.5 data (O-040, S014, still open); the Python stack had a zarr 2/3 dependency schism with FSStore import failures and wrong anisotropic rendering in napari's built-in reader (O-039, S011, Dec 2025); ome-zarr-py crashed on zarr "auto" sharding (O-045, S044, Aug 2026).
[B-019: QUALIFIED]
- **Version-sniffing shortcuts exist and are fragile.** AGAVE infers NGFF version from zarr format version and errors otherwise (O-067, S082), detects zarr by the substring "zarr" in a directory path (O-080, S098), and whitelists four dtypes (O-023, S120). These are counterexamples to avoid, not patterns to copy.
[B-020: CONFIRMED]
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
[B-026: NOT A CLAIM (bookkeeping)]
- **Distinguishing validation idea:** fixture set = a 9-image b2r collection (BR00109990_C2-like), a sparse 50-well plate (190129-like, no plate.version), a single 2D XY image, and a misleading directory name containing "zarr"; assert the list contents and that opening the labels group directly resolves to the parent image.

[B-027: NOT A CLAIM (bookkeeping)]
### L5 — "canvas with pan and zoom, channel visibility controls, time-point and plane selection where relevant"

[B-028: CONFIRMED]
- **Disposition: covered** (Plan's "where relevant" is correct and load-bearing), with two **optional_capability** notes.
[B-029: CONFIRMED]
- **Exact constraint:** channel axis is identified by type, may be absent; omero is optional/transitional (O-009), so defaults must fall back to computed or neutral rendering; `rdefs.model: greyscale` overrides channel colors to white in established readers (O-030); window uses start/end for display and min/max for range (O-017); `defaultZ`/`defaultT` need bounds-checking. Missing/partial omero is a required path (bioformats2raw `--no-minmax`, O-048), and one real viewer's failure to load labels when omero is absent is the counterexample to avoid (O-072).
[B-030: CONFIRMED]
- **Product consequence:** honoring omero defaults (colors, names, windows, active flags, greyscale model) is a differentiator, not table stakes (O-051); a missing-omero fallback must be specified, not emergent.
[B-031: NOT A CLAIM (bookkeeping)]
- **Distinguishing validation idea:** open the 0.5 IDR label-image sample (CZYX, omero window end 1500 / max 65535, defaultZ 118): assert per-channel colors/labels, display window 0–1500, initial plane clamped to z-size; then open an omero-free fixture and assert rendering still occurs with stated defaults.

[B-032: NOT A CLAIM (bookkeeping)]
### L5 — "optional overlays for associated label images"

[B-033: CONFIRMED]
- **Disposition: covered** as a promise, with a **correction** on the sourcing mechanism.
[B-034: CONFIRMED]
- **Exact constraint:** labels are discovered via the labels group listing (O-010); `image-label.source.image` is the documented pointer but is considered broken by spec contributors (O-073); label pixels must be integer dtypes; equal level counts are a MUST that real files may violate (O-010); rgba per label value is optional (O-011); overlay alignment requires the same transform composition as the base image (dataset scale, optional translation, group-level transforms — O-006/O-007/O-027). Established viewers keep labels single-layer and initially hidden (O-033); manual labels-URL assembly is the current UX in established tools (O-052).
[B-035: CONFIRMED]
- **Product consequence:** in-product labels discovery is real added value, but alignment math and per-level verification are the hard part; the Plan promises more overlay capability than most viewers ship (O-051), so this needs its own acceptance fixtures, not a rider on image display.
[B-036: NOT A CLAIM (bookkeeping)]
- **Distinguishing validation idea:** fixture with a label image whose level count deliberately differs from the parent (spec-violating): the viewer must explain the mismatch rather than crash or silently misalign; plus a correct fixture where overlay registration is checked at two zoom levels against dataset+group transforms.

[B-037: NOT A CLAIM (bookkeeping)]
### L5 — "A details panel shows dimensions, units and coordinates"

[B-038: CONFIRMED]
- **Disposition: covered**, with one **correction**.
[B-039: CONFIRMED]
- **Exact constraint:** physical size = composition of dataset-level scale (relative to level 0) with any group-level transform, translation applied after scale (O-006/O-007); units are SHOULD-level and frequently absent (O-044, O-004); custom axis types are legal (O-004); time units can hide in group-level transforms (S003 L368-374). One viewer's whole-view scale bar disappears if any layer lacks units (O-032).
[B-040: CONFIRMED]
- **Product consequence:** the panel needs an explicit "unspecified" state per axis and must not derive physical units from axis names; coordinate readout at the cursor should use composed transforms per selected level.
[B-041: NOT A CLAIM (bookkeeping)]
- **Distinguishing validation idea:** synthetic file with group-level `scale [0.1, 1, 1, 1, 1]` (time) and per-level spatial scales; assert the panel and cursor readout show the composed values and degrade to "pixel" when a unit is absent.

[B-042: NOT A CLAIM (bookkeeping)]
### L5 — "The viewer chooses an available pyramid level appropriate for the current view"

[B-043: CONFIRMED]
- **Disposition: product_choice** (the Plan picks automatic selection where the closest desktop analog ships a manual picker; both are legitimate, but they have different failure modes), plus a **correction** on what "appropriate" must mean.
[B-044: CONFIRMED]
- **Exact constraint:** level choice must respect level geometry — levels can be Z-downsampled and have non-2, non-uniform factors, and dataset translations can center levels (O-027, O-050); chunk shapes can exceed array extents and be sharded (O-018). The documented failure class is choosing/reading levels by assumption (vizarr's "same number of Z-sections" expectation; repetitive-chunk rendering).
[B-045: CONFIRMED]
- **Product consequence:** automatic choice needs viewport↔level math plus per-level size feedback; the simpler alternative (implemented in the desktop analog) is a level picker with memory estimates and optional sub-region, with documented low-res-first workflow (O-060, O-063). If automatic selection is kept, a manual override is the safety valve.
[B-046: NOT A CLAIM (bookkeeping)]
- **Distinguishing validation idea:** pyramid with Z-downsampling and a factor-3 level: zoom from 1× to 1/16× and assert the displayed features stay put (no repeated chunks, no drift), and that the chosen level changes at sane thresholds.

[B-047: NOT A CLAIM (bookkeeping)]
### L7 — "Large image reads run in the background… Changing the selected view cancels work…"

[B-048: CONFIRMED]
- **Disposition: covered** (as a specified obligation), with an adjacent **optional_capability** (cache policy).
[B-049: QUALIFIED]
- **Exact constraint:** the direct desktop analog's most-upvoted issue is exactly "loading blocks the whole application and is not easy to cancel" during time-series playback (O-064, S103); its shipped answers were an in-memory volume cache and memory-estimate UI (O-066); sharded local reads are a known performance pain point ecosystem-wide (O-018, O-045 — search-listing evidence only, S049).
[B-050: CONFIRMED]
- **Product consequence:** cancellation needs a defined policy for partially-read data (discard vs cache), and time-series scrubbing is the stress case, not static pan/zoom.
[B-051: NOT A CLAIM (bookkeeping)]
- **Distinguishing validation idea:** start loading a large level, switch images/timepoints mid-read, and assert: UI stays responsive, the superseded read is cancelled (no completion-driven repaint of the old view), and memory returns to baseline (the analog had a GPU/RAM leak bug on image switch, O-064).

[B-052: NOT A CLAIM (bookkeeping)]
### L7 — "Opening failures explain which image or data could not be displayed and allow the user to choose another item"

[B-053: CONFIRMED]
- **Disposition: covered**, with a **correction**: this cannot be inherited from reference libraries.
[B-054: CONFIRMED]
- **Exact constraint:** parse_url-style APIs collapse missing vs broken into None (O-036); reference tracker lists error-UX gaps as open (O-071); real files violate MUSTs (O-019) and misleading names exist (O-080); unsupported dtypes/transforms/versions will occur (O-023, O-038 draft-only transform types, O-001 editor drafts).
[B-055: CONFIRMED]
- **Product consequence:** Slide Scout needs its own error taxonomy (missing metadata, unreadable array, unsupported codec/shard/dtype/transform, version mismatch, inconsistent hierarchy) each naming the offending node, with the list still usable.
[B-056: NOT A CLAIM (bookkeeping)]
- **Distinguishing validation idea:** malformed-input fixture pack (truncated zarr.json, missing dataset path, float label image, unknown ome.version, plate without version, identity transform in datasets): each must produce a specific message plus a working "choose another image" path, never a crash.

[B-057: NOT A CLAIM (bookkeeping)]
### L9 — "should interoperate with filesets from real OME-Zarr 0.5 tools"

[B-058: CONFIRMED]
- **Disposition: correction** (under-specified: "real tools" must be enumerated, and the hard half of 0.5 — the Zarr v3 storage surface — is nowhere named in the Plan).
[B-059: CONFIRMED]
- **Exact constraint:** producer set evidenced in-corpus: ome2024-ngff-challenge converter (sharded, ro-crate, zarr.json migration — O-047), bioformats2raw 0.4-default/0.5-opt-in (O-048), IDR samples (O-046), ome-zarr-py (2D-only downsampling, degenerate defaults — O-044), WEBKNOSSOS (sharded v3, O-068), SpatialData (permissively-validated 0.5, O-056), NGFF-Converter (O-075). Storage surface: sharding (incl. upcoming "auto"), blosc/gzip/zstd/null codecs, crc32c indexes, little-endian (O-018, O-045, O-048, O-047).
[B-060: CONFIRMED]
- **Product consequence:** acceptance fixtures must span producers and storage shapes; interop claims should name the producer and version, since 0.5 support dates differ by a year across tools (O-041, O-042, O-055).
[B-061: NOT A CLAIM (bookkeeping)]
- **Distinguishing validation idea:** a locally-captured sharded challenge-style fileset (single-shard-per-Z layout like 4496763) plus a blosc-gzip-zstd-null codec matrix, each opened and pixel-compared against a known-good decode.

[B-062: NOT A CLAIM (bookkeeping)]
### L9 — "Source files remain unchanged; display settings are local to the viewing session"

[B-063: CONFIRMED]
- **Disposition: covered.**
[B-064: CONFIRMED]
- **Exact constraint:** read-only open paths throughout the corpus readers (O-019 mode "r"; the challenge resave likewise never modifies input, O-047). The rejected alternative is visible in the corpus: AGAVE persists settings to a JSON containing an absolute file path (O-062/AGAVE HELP L27) — brittle and session-crossing.
[B-065: CONFIRMED]
- **Product consequence:** trivial to honor but worth an explicit test; settings persistence (if ever added) is an "additional capability" under the L9 review gate.
[B-066: NOT A CLAIM (bookkeeping)]
- **Distinguishing validation idea:** checksum all fixture files before/after a session that opens, pans, zooms, switches channels and force-closes.

[B-067: NOT A CLAIM (bookkeeping)]
### L9 — exclusions ("Image editing, export, remote storage and automated … interpretation are outside")

[B-068: CONFIRMED]
- **Disposition: covered** (boundary) with one **unresolved** watch item.
[B-069: CONFIRMED]
- **Exact constraint:** local-filesystem-only simplifies storage (no HTTP range/S3), but several corpus failures are storage-related (labels from buckets O-071; proxy issues S028 titles) and thus out of scope by construction. Watch item: local filesets embed non-image payloads (OME-XML, ro-crate, OME/METADATA.ome.xml — O-012, O-047) that discovery must classify without treating as images.
[B-070: CONFIRMED]
- **Product consequence:** the boundary keeps the storage layer thin; discovery must still be hierarchy-aware.
[B-071: NOT A CLAIM (bookkeeping)]
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
[B-078: NOT A CLAIM (bookkeeping)]
- **Distinguishing validation idea:** adopt a fixture matrix: {per-producer 0.5 filesets} × {image, plate, collection, labels} × {sharded, plain} + synthetic malformed pack; record expected image lists and coordinate values.

[B-079: NOT A CLAIM (bookkeeping)]
### L11 — "A large dataset must not freeze interaction"

[B-080: CONFIRMED]
- **Disposition: covered** (promise), with evidence it is the differentiating risk.
[B-081: CONFIRMED]
- **Exact constraint:** the analog product's tracker shows zoom-time crashes on plates and pyramids in established viewers (O-050), blocking loads (O-064), memory leaks (O-064), and GPU-memory ceilings for volume approaches (O-059); 1 TB plates and 21.6 GB single-plane images are real 0.5 data (O-046).
[B-082: CONFIRMED]
- **Product consequence:** the 2D-canvas approach avoids the volume-rendering memory ceiling (O-059) — worth stating as the deliberate product simplification; interaction freeze testing must include zoom-during-load on plate/stitched data.
[B-083: NOT A CLAIM (bookkeeping)]
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

[B-107: QUALIFIED]
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
  "not_a_claim": 34,
  "confirm": 68,
  "qualify": 5
 },
 "unknown_ids": [],
 "decision_entries": 107,
 "lines_outside_entries": [
  1,
  3
 ],
 "non_authoritative": [],
 "carrier_defects": 1,
 "complete": false
}
```
