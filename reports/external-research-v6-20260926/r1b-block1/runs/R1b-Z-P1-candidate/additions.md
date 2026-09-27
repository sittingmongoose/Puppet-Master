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
