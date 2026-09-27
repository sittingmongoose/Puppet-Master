# Slide Scout — corpus research report (draft)

Case `ome-zarr-thin`. Report based solely on `case/sources/S001–S125` (fixed corpus), the brief, and the frozen Plan snapshot `case/plan/Viewer.md`. Every supported proposition cites observation IDs from `out/observations.md` (O-001…O-080), which in turn cite source lines verbatim. Nothing here is independently verified against live systems; a "validation idea" is a proposed test, not a passed one.

Plan cited by line: **L5** (open fileset, list images, canvas pan/zoom, channel controls, time/plane where relevant, label overlays, details panel, automatic pyramid-level choice), **L7** (background reads, cancellation, failure UX), **L9** (interop with real 0.5 tools, read-only, session-local settings, exclusions, review gate), **L11** (acceptance: discovery, navigation, channel/plane controls, calibrated coordinates, aligned overlays, no freeze on large data, understandable failure).

---

## 1. Established format obligations (0.5)

These are normative ("MUST"-level) or de-facto obligatory for reading released OME-Zarr 0.5.

1. **0.5 = Zarr v3 with the full Zarr feature surface.** OME-Zarr 0.5 is defined on Zarr v3, and "all features of the Zarr format including codecs, chunk grids, chunk key encodings, data types and storage transformers may be used … unless explicitly disallowed" (O-002, S003 L67-72). The 0.5 text disallows almost nothing. Consequence: a reader that supports only one chunk-grid/codec shape is not 0.5-conformant even if it opens some files.
2. **Metadata location and version.** OME metadata lives in `zarr.json` under `attributes.ome`; `ome.version` is a string and MUST be consistent within a hierarchy (O-003, S003 L152-156). The image schema makes `multiscales` + `version` required on an image group (O-016, S053 L22-30). Note: version detection in the wild keys off several locations, including the legacy `multiscales[0].version` (O-026, S016 L81-96) — a validator should check `attributes.ome.version` first but not be surprised by legacy placement.
3. **Axes.** 2–5 dimensions; `name` required and unique; `type` recommended (space/time/channel or custom strings); `unit` recommended UDUNITS-2; arrays MUST carry `dimension_names` matching axes (O-004, S003 L166-174). Ordering MUST be time → channel/custom → space; zyx is only SHOULD (O-005, S003 L299-319). Channel/time/plane UI must key off axis **type**, and may be absent entirely (real 0.5 samples include XY-only and XYZ data — O-046, S010 L1026-1133).
4. **Multiscales.** `multiscales` is a LIST; datasets paths are arbitrary strings ordered highest→lowest resolution; each dataset MUST have exactly one scale (relative to level 0, default 1.0); MAY have one translation, listed after scale; group-level `coordinateTransformations` are applied after dataset-level ones (O-006/O-007/O-008, S003 L298-397). Missing `name` is legal (SHOULD).
5. **omero display block is transitional and optional.** If present: `channels` required; per-channel `color` (6 hex digits) and `window {min,max,start,end}` required; `rdefs` (defaultT/defaultZ, model "color"|"greyscale") described but not covered by the MUSTs (O-009, S003 L398-430). Real files show window `end` far below data `max` (display window vs data range, O-017) and `defaultZ` that must be bounds-checked (S054 L109-113). Producers can legitimately omit it (`bioformats2raw --no-minmax`, O-048).
6. **Labels.** `labels` group lists label image paths; label pixels MUST be integer dtypes; each label image MUST be a full multiscales image with the SAME number of levels as the parent (O-010, S003 L431-455); `image-label` colors/rgba/properties/source are SHOULD/MAY with `source.image` defaulting to `../../` (O-011, S003 L454-474). Caution: the spec community itself considers the `source.image` reference mechanism broken and the omero schema inconsistent with its description (O-073, S035 titles), and a real viewer ships a bug where labels are not loaded when the omero block is missing (O-072, S050). Overlay code must therefore use the labels-group listing as the source of truth and verify level geometry at runtime.
7. **HCS plates/wells.** plate `{columns, rows, wells[{path,rowIndex,columnIndex}], field_count, acquisitions?, version}` and well `{images[{path,acquisition?}], version}`; sparse plates are normal (empty rows/wells SHOULD NOT exist) (O-013, S003 L118-129, L515-560, L740-752). Real plates violate the `version` MUST (O-019, S056) — strict validation would reject a flagship dataset.
8. **bioformats2raw collections (transitional).** `bioformats2raw.layout: 3`, optional `OME/METADATA.ome.xml`, optional `series` path list, else consecutive numbered groups; readers SHOULD NOT default to opening only the first image (O-012, S003 L175-275). Two other discovery conventions coexist (OME-XML Image IDs in napari, O-034; `series` in the spec) — discovery must tolerate disagreement.
9. **JSON hygiene.** No comments in JSON; exact historical key spellings (camelCase intent with acknowledged legacy exceptions) (O-014/O-015, S003 L65-66, L809-812).
10. **Dataset-level compatibility floor (from real 0.5 corpora).** Sharded arrays are mainstream, not exotic: the flagship IDR 0.5 sample uses `sharding_indexed` (blosc/zstd inside, crc32c index) with chunk shapes larger than the array extent (O-018, S055); the challenge converter shards optionally (O-047), WEBKNOSSOS writes sharded v3 (O-068), and zarr-python "auto" sharding is arriving with OME-layer tools lagging (O-045, S044). Codec floor from the dominant converters: bytes + {blosc, gzip, zstd, null}, little-endian default (O-048, S033 L152-162, L356-359).

---

## 2. Compatibility findings, contradictions and counterexamples

- **The 0.4→0.5 break is by design.** Metadata moved from `.zattrs`/`.zarray` into `zarr.json` attributes under an `ome` namespace; version fields moved up; chunk-key encoding became per-array (O-038, S004). 0.4-era files put `version: "0.4"` inside `multiscales[0]` (S059 L347-353). Established readers unwrap `attributes.ome` when present and otherwise read flat attributes (O-032, S048 L166-170; O-036, S019 L87-90). A 0.5-only viewer still needs this dual read if it ever meets 0.4 data; the corpus contains both (catalog: 0.4 and 0.5 sample URLs in S010; a 0.4 `.zattrs` capture, S068, is retained as unreadable binary — no content evidence).
- **Real writers emit degenerate or invalid metadata.** Default scale `[1,1,1,1,1]`, no units, axis type inferred from name; at least one major tool's 0.4 output was invalid (axis order cxyz, wrong separator) (O-044, S029). A real 0.5 plate omits the spec-required plate `version` (O-019). Unknown keys like `_creator` appear alongside `ome` keys (O-017). Strict-schema rejection is not viable; "explain what cannot be displayed" is (brief L3, Plan L11).
- **Reference-reader gaps are documented in their own trackers.** parse_url collapses "missing" and "error" into None (O-036); reader not idempotent; consolidated-metadata unresolved; RFC-5 group downloads fail; labels-from-buckets broken (O-071, S028 titles). Reusing a library does not discharge the Plan's error-UX and discovery obligations.
- **Ecosystem failure classes to design against** (viewer matrix, mostly v0.4 samples, versions pinned April 2025 — O-050/O-052, S043/S041): Z-downsampled pyramids (vizarr wrong, napari crashes on zoom); non-2 scale factors between levels (vizarr fails); plates render but crash on zoom-in; b2r collections fail in most viewers; **no tested viewer** opens images beyond the first multiscales entry, and some crash hard. Group-level multiscales scale was not applied by napari-ome-zarr at test time (O-051, S043 L394-428) — exactly the composition case in O-007.
- **0.5 rendering failures exist in current tools.** vizarr "renders chunks repetitively" for challenge-converted 0.5 data (O-040, S014, still open); the Python stack had a zarr 2/3 dependency schism with FSStore import failures and wrong anisotropic rendering in napari's built-in reader (O-039, S011, Dec 2025); ome-zarr-py crashed on zarr "auto" sharding (O-045, S044, Aug 2026).
- **Version-sniffing shortcuts exist and are fragile.** AGAVE infers NGFF version from zarr format version and errors otherwise (O-067, S082), detects zarr by the substring "zarr" in a directory path (O-080, S098), and whitelists four dtypes (O-023, S120). These are counterexamples to avoid, not patterns to copy.
- **Tool versions matter.** 0.5 read support arrived in ome-zarr-py via zarr-python v3 (Nov 2024, O-041), 0.5 write became default Aug 2025 (O-042, S013), napari-ome-zarr dropped the ome-zarr dependency and now opens all b2r series images in 0.8.0 (May 2026, O-055), and ome-zarr 0.19.2 is zarr-v3-only on Python ≥3.12 (O-079, S015). The ecosystem is simultaneously preparing 0.6 scenes (O-056, S052; O-073, S035 "0.6rc0 schemas") and loosening 0.5 validation for SpatialData (O-056).

---

## 3. Plan fit, line by line

### L5 — "opens a local OME-Zarr 0.5 fileset and lists the images it finds"

- **Disposition: correction** (the intent is covered; the specified scope of "images it finds" is too narrow as written).
- **Exact constraint:** one fileset can contain: a single multiscale image; multiple named multiscales entries (spec: user chooses by name, first is fallback — O-008); a plate with sparse wells and per-well fields (O-013); a bioformats2raw collection whose images SHOULD all be surfaced (O-012); a labels group or label image as the entry point (O-035); plus non-image content that must not confuse discovery (ro-crate-metadata.json, O-047). 2D-XY through 5D-XYZCT all occur (O-046).
- **Product consequence:** discovery is a first-class subsystem (node classification: image / plate / well / collection / labels / unsupported), not a byproduct of opening one image; the image list must not silently show only the first item of anything.
- **Distinguishing validation idea:** fixture set = a 9-image b2r collection (BR00109990_C2-like), a sparse 50-well plate (190129-like, no plate.version), a single 2D XY image, and a misleading directory name containing "zarr"; assert the list contents and that opening the labels group directly resolves to the parent image.

### L5 — "canvas with pan and zoom, channel visibility controls, time-point and plane selection where relevant"

- **Disposition: covered** (Plan's "where relevant" is correct and load-bearing), with two **optional_capability** notes.
- **Exact constraint:** channel axis is identified by type, may be absent; omero is optional/transitional (O-009), so defaults must fall back to computed or neutral rendering; `rdefs.model: greyscale` overrides channel colors to white in established readers (O-030); window uses start/end for display and min/max for range (O-017); `defaultZ`/`defaultT` need bounds-checking. Missing/partial omero is a required path (bioformats2raw `--no-minmax`, O-048), and one real viewer's failure to load labels when omero is absent is the counterexample to avoid (O-072).
- **Product consequence:** honoring omero defaults (colors, names, windows, active flags, greyscale model) is a differentiator, not table stakes (O-051); a missing-omero fallback must be specified, not emergent.
- **Distinguishing validation idea:** open the 0.5 IDR label-image sample (CZYX, omero window end 1500 / max 65535, defaultZ 118): assert per-channel colors/labels, display window 0–1500, initial plane clamped to z-size; then open an omero-free fixture and assert rendering still occurs with stated defaults.

### L5 — "optional overlays for associated label images"

- **Disposition: covered** as a promise, with a **correction** on the sourcing mechanism.
- **Exact constraint:** labels are discovered via the labels group listing (O-010); `image-label.source.image` is the documented pointer but is considered broken by spec contributors (O-073); label pixels must be integer dtypes; equal level counts are a MUST that real files may violate (O-010); rgba per label value is optional (O-011); overlay alignment requires the same transform composition as the base image (dataset scale, optional translation, group-level transforms — O-006/O-007/O-027). Established viewers keep labels single-layer and initially hidden (O-033); manual labels-URL assembly is the current UX in established tools (O-052).
- **Product consequence:** in-product labels discovery is real added value, but alignment math and per-level verification are the hard part; the Plan promises more overlay capability than most viewers ship (O-051), so this needs its own acceptance fixtures, not a rider on image display.
- **Distinguishing validation idea:** fixture with a label image whose level count deliberately differs from the parent (spec-violating): the viewer must explain the mismatch rather than crash or silently misalign; plus a correct fixture where overlay registration is checked at two zoom levels against dataset+group transforms.

### L5 — "A details panel shows dimensions, units and coordinates"

- **Disposition: covered**, with one **correction**.
- **Exact constraint:** physical size = composition of dataset-level scale (relative to level 0) with any group-level transform, translation applied after scale (O-006/O-007); units are SHOULD-level and frequently absent (O-044, O-004); custom axis types are legal (O-004); time units can hide in group-level transforms (S003 L368-374). One viewer's whole-view scale bar disappears if any layer lacks units (O-032).
- **Product consequence:** the panel needs an explicit "unspecified" state per axis and must not derive physical units from axis names; coordinate readout at the cursor should use composed transforms per selected level.
- **Distinguishing validation idea:** synthetic file with group-level `scale [0.1, 1, 1, 1, 1]` (time) and per-level spatial scales; assert the panel and cursor readout show the composed values and degrade to "pixel" when a unit is absent.

### L5 — "The viewer chooses an available pyramid level appropriate for the current view"

- **Disposition: product_choice** (the Plan picks automatic selection where the closest desktop analog ships a manual picker; both are legitimate, but they have different failure modes), plus a **correction** on what "appropriate" must mean.
- **Exact constraint:** level choice must respect level geometry — levels can be Z-downsampled and have non-2, non-uniform factors, and dataset translations can center levels (O-027, O-050); chunk shapes can exceed array extents and be sharded (O-018). The documented failure class is choosing/reading levels by assumption (vizarr's "same number of Z-sections" expectation; repetitive-chunk rendering).
- **Product consequence:** automatic choice needs viewport↔level math plus per-level size feedback; the simpler alternative (implemented in the desktop analog) is a level picker with memory estimates and optional sub-region, with documented low-res-first workflow (O-060, O-063). If automatic selection is kept, a manual override is the safety valve.
- **Distinguishing validation idea:** pyramid with Z-downsampling and a factor-3 level: zoom from 1× to 1/16× and assert the displayed features stay put (no repeated chunks, no drift), and that the chosen level changes at sane thresholds.

### L7 — "Large image reads run in the background… Changing the selected view cancels work…"

- **Disposition: covered** (as a specified obligation), with an adjacent **optional_capability** (cache policy).
- **Exact constraint:** the direct desktop analog's most-upvoted issue is exactly "loading blocks the whole application and is not easy to cancel" during time-series playback (O-064, S103); its shipped answers were an in-memory volume cache and memory-estimate UI (O-066); sharded local reads are a known performance pain point ecosystem-wide (O-018, O-045 — search-listing evidence only, S049).
- **Product consequence:** cancellation needs a defined policy for partially-read data (discard vs cache), and time-series scrubbing is the stress case, not static pan/zoom.
- **Distinguishing validation idea:** start loading a large level, switch images/timepoints mid-read, and assert: UI stays responsive, the superseded read is cancelled (no completion-driven repaint of the old view), and memory returns to baseline (the analog had a GPU/RAM leak bug on image switch, O-064).

### L7 — "Opening failures explain which image or data could not be displayed and allow the user to choose another item"

- **Disposition: covered**, with a **correction**: this cannot be inherited from reference libraries.
- **Exact constraint:** parse_url-style APIs collapse missing vs broken into None (O-036); reference tracker lists error-UX gaps as open (O-071); real files violate MUSTs (O-019) and misleading names exist (O-080); unsupported dtypes/transforms/versions will occur (O-023, O-038 draft-only transform types, O-001 editor drafts).
- **Product consequence:** Slide Scout needs its own error taxonomy (missing metadata, unreadable array, unsupported codec/shard/dtype/transform, version mismatch, inconsistent hierarchy) each naming the offending node, with the list still usable.
- **Distinguishing validation idea:** malformed-input fixture pack (truncated zarr.json, missing dataset path, float label image, unknown ome.version, plate without version, identity transform in datasets): each must produce a specific message plus a working "choose another image" path, never a crash.

### L9 — "should interoperate with filesets from real OME-Zarr 0.5 tools"

- **Disposition: correction** (under-specified: "real tools" must be enumerated, and the hard half of 0.5 — the Zarr v3 storage surface — is nowhere named in the Plan).
- **Exact constraint:** producer set evidenced in-corpus: ome2024-ngff-challenge converter (sharded, ro-crate, zarr.json migration — O-047), bioformats2raw 0.4-default/0.5-opt-in (O-048), IDR samples (O-046), ome-zarr-py (2D-only downsampling, degenerate defaults — O-044), WEBKNOSSOS (sharded v3, O-068), SpatialData (permissively-validated 0.5, O-056), NGFF-Converter (O-075). Storage surface: sharding (incl. upcoming "auto"), blosc/gzip/zstd/null codecs, crc32c indexes, little-endian (O-018, O-045, O-048, O-047).
- **Product consequence:** acceptance fixtures must span producers and storage shapes; interop claims should name the producer and version, since 0.5 support dates differ by a year across tools (O-041, O-042, O-055).
- **Distinguishing validation idea:** a locally-captured sharded challenge-style fileset (single-shard-per-Z layout like 4496763) plus a blosc-gzip-zstd-null codec matrix, each opened and pixel-compared against a known-good decode.

### L9 — "Source files remain unchanged; display settings are local to the viewing session"

- **Disposition: covered.**
- **Exact constraint:** read-only open paths throughout the corpus readers (O-019 mode "r"; the challenge resave likewise never modifies input, O-047). The rejected alternative is visible in the corpus: AGAVE persists settings to a JSON containing an absolute file path (O-062/AGAVE HELP L27) — brittle and session-crossing.
- **Product consequence:** trivial to honor but worth an explicit test; settings persistence (if ever added) is an "additional capability" under the L9 review gate.
- **Distinguishing validation idea:** checksum all fixture files before/after a session that opens, pans, zooms, switches channels and force-closes.

### L9 — exclusions ("Image editing, export, remote storage and automated … interpretation are outside")

- **Disposition: covered** (boundary) with one **unresolved** watch item.
- **Exact constraint:** local-filesystem-only simplifies storage (no HTTP range/S3), but several corpus failures are storage-related (labels from buckets O-071; proxy issues S028 titles) and thus out of scope by construction. Watch item: local filesets embed non-image payloads (OME-XML, ro-crate, OME/METADATA.ome.xml — O-012, O-047) that discovery must classify without treating as images.
- **Product consequence:** the boundary keeps the storage layer thin; discovery must still be hierarchy-aware.
- **Distinguishing validation idea:** fixture with OME/METADATA.ome.xml + ro-crate-metadata.json + numbered image groups; assert exactly the image groups are listed.

### L9 — "Additional capability choices require explicit review"

- **Disposition: covered** (gate). Items that would cross it, evidenced as user-demand or ecosystem direction: multi-image overlay sessions / channels from separate files (O-065); LUT-based channel display (O-065); 0.6 scenes/RFC-5 transforms (O-053, O-056); zip stores (RFC-9, O-053; ome-zarr-py open issue S028); >5D arrays (RFC-3, O-053).

### L11 — "Acceptance uses representative filesets…"

- **Disposition: unsupported as written** (the Plan does not say what "representative" is); **correction** available cheaply from the corpus.
- **Exact constraint:** concrete 0.5 fixtures with provenance exist in-corpus: the IDR 0.5 sample list (plates with 384 wells/1 field and 49 wells/32 fields, 2D XY, XYZ, XYZC, XYZCT, b2r collections, a 21.6 GB single-plane image — O-046) and the PR #123 test list (O-054). Gaps: no multi-entry-multiscales fixture exists anywhere (O-050), and no 0.4/0.5 mixed-hierarchy sample is readable in-corpus (S068 is binary).
- **Product consequence:** acceptance can be anchored to named public filesets plus synthetic spec-edge fixtures; the multi-multiscales case must be synthetic.
- **Distinguishing validation idea:** adopt a fixture matrix: {per-producer 0.5 filesets} × {image, plate, collection, labels} × {sharded, plain} + synthetic malformed pack; record expected image lists and coordinate values.

### L11 — "A large dataset must not freeze interaction"

- **Disposition: covered** (promise), with evidence it is the differentiating risk.
- **Exact constraint:** the analog product's tracker shows zoom-time crashes on plates and pyramids in established viewers (O-050), blocking loads (O-064), memory leaks (O-064), and GPU-memory ceilings for volume approaches (O-059); 1 TB plates and 21.6 GB single-plane images are real 0.5 data (O-046).
- **Product consequence:** the 2D-canvas approach avoids the volume-rendering memory ceiling (O-059) — worth stating as the deliberate product simplification; interaction freeze testing must include zoom-during-load on plate/stitched data.
- **Distinguishing validation idea:** open the largest local fixture, immediately zoom/pan and scrub time; sample UI thread responsiveness; assert no unbounded memory growth across repeated image switches.

### L11 — "Malformed or unavailable input must produce understandable feedback rather than a crash"

- **Disposition: covered** (see L7 failure-UX row for the shared constraint/validation idea); the corpus adds specific malformed cases to test: plate missing `version` (O-019), identity transforms (O-073), window missing start/end (O-030/O-032's differing behaviors), partial omero (O-048), misleading names (O-080).

### Not in the Plan at all (each **unresolved** for Plan purposes, obligation established by corpus)

- **Multiple multiscales entries** — spec-defined user choice, zero ecosystem support, some viewers crash (O-008, O-029, O-033, O-050). Unresolved: whether Slide Scout lists them (spec-faithful, beyond-ecosystem) or matches ecosystem behavior (first entry only). Product decision needed.
- **Zarr v3 storage-feature strategy** (shards/codecs) — obligatory per O-002/O-018 but unspecified in the Plan; build-vs-library decision also open (tensorstore C++ route O-070/O-074 vs zarr-python ≥3 route O-079 vs napari's direct-zarr rewrite precedent O-054). Unresolved in-corpus.
- **Version handling policy** — strict 0.5-only vs permissive (SpatialData precedent O-056; AGAVE inference O-067; spec signals 0.6rc0 approaching O-073). Unresolved product decision.

---

## 4. Simpler alternatives and opportunities noted (not obligations)

- **Manual level picker with memory estimate + sub-region ROI** instead of fully automatic level choice — shipped pattern in the closest desktop analog (O-060, O-063); automatic choice can layer on top later.
- **2D-slice canvas (Plan's shape)** vs volume rendering: avoids GPU-memory ceilings that bind AGAVE/Vol-E (O-059); vizarr proves the 2D-slice product class with 8-dtype support (O-058).
- **Stitched-plate rendering vs well-by-well navigation**: ome-zarr-py stitches with zero-filled gaps (O-031); the spec explicitly allows offering users a choice of images (O-012). Well-navigation is simpler and avoids fake data; stitching is the incumbent behavior to consciously accept or reject (product choice).
- **Collection browsing via manifest/CSV + external app** (ome-zarr finder + BioFile Finder, O-043/O-069) — the incumbent local-browsing shape; Slide Scout's integrated list is the delta.
- **Differentiators with documented ecosystem gaps**: omero-faithful defaults incl. greyscale model and rdefs (O-051); group-level transform composition (O-051, napari gap); dynamic scale bar / calibrated display (O-072 — vizarr request open); in-product labels discovery (O-052); b2r series enumeration (fixed only May 2026 in napari-ome-zarr, O-055).
- **Timestamp overlay in physical time units and per-timepoint window adaptation** — shipped in AGAVE docs (O-061), absent from the Plan; candidate future capability under the L9 review gate.

---

## 5. Deferred items (with reasons)

| Item | Reason for deferral |
|---|---|
| 0.6 scenes / RFC-5 coordinate systems & transforms | Not part of released 0.5 (O-001, O-053); RFC text not in corpus; ecosystem still converging (O-056, O-073). Handle via clear "unsupported version/transform" messaging only. |
| Remote/http/S3 storage | Excluded by Plan L9 / brief L5; corpus failure evidence (O-071) is remote-specific. |
| Zip stores (RFC-9) | Future RFC (O-053); open issue even in reference lib (S028). |
| >5D arrays, axis orientation (RFC-3/4) | Future RFCs (O-053); detect-and-explain only. |
| Multi-image overlay sessions; channels from separate files | Breaches single-fileset boundary (Plan L9); user demand exists elsewhere (O-065) — review-gate item. |
| Sharded-read performance tuning | Needs measurement on real hardware; corpus has only issue-title evidence (S049, O-018). Correctness first. |
| Consolidated metadata | Unresolved concept in zarr ecosystem (S028 title); no 0.5 obligation. |
| 3D/volume rendering | Out of Plan scope; noted as the deliberate simplification (O-059). |

---

## 6. Coverage

**Sources read in full (or near-full):** S003 (0.5 spec), S053 (image.schema), S054–S056 (0.5 zarr.json captures), S016 (format.py), S018 (reader.py), S019 (io.py), S048 (napari reader), S009 (repo tree), S017 (changelog), S025 (vizarr), S062 (Vol-E), S072 (AGAVE README), S108 (AGAVE HELP), S115 (AGAVE docs index), S022/S066/S067 (BioFile Finder), S037/S041 (ome-ngff-tools page/docs), S043 (features.yml), S039 (tools README), S033/S034 (converter READMEs), S070 (tools resources), S010 (sample catalog, 0.5 section + headers), S004/S008/S011/S013/S014/S023/S029/S044 (issue/PR bodies), S024 (PR #123 body), S052 (releases, key bodies), S063–S065 (napari release bodies), S081–S083 (AGAVE #258/#220 + comment), S103/S104/S105/S110/S118/S119/S125 (AGAVE issue bodies), S102 (empty shard search), S057 (empty arrays), S120/S121 (AGAVE grep extracts), S098 (PR #220 diff, grepped).

**Sources sampled by targeted search only (titles/listings; no claim rests on unread content):** S028, S035, S050, S090, S097, S100, S101, S109, S112, S114 (issue/search dumps), S052/S091 (release lists), S015 (PyPI fields), S059 (0.4 spec, grepped for version/layout markers), S051 (RFC index, grepped).

**Failed or empty captures — no evidence either way (not proof of absence):** S002 (0 bytes), S005, S007, S030, S042, S045, S046, S077, S095, S096, S121; search-result-only listings: S001, S012, S021, S032, S036, S049, S060, S069, S071 (O-021/O-022).

**Not read (no claims made from them):** S027 (HTML duplicate of S024's PR content), S040 (file tree listing), S068 (binary, unreadable — O-020), S073, S074, S078, S079, S080, S084, S085, S086, S087, S088, S092, S093, S094, S107, S116.

**Unresolved questions carried forward:** (1) reader-side auto-shard behavior/latency in current zarr libraries (O-045); (2) full semantics of RFC-5/scene metadata (O-053); (3) exact nature of the omero schema inconsistency (O-073); (4) which bioformats2raw release defaults to 0.5 (O-048); (5) AGAVE's actual sharded-file behavior (O-077); (6) whether current viewer versions fixed the O-050 matrix failures; (7) rectilinear chunk grids in the wild (O-074); (8) content of the 0.4 `.zattrs` capture (S068, binary).

---

*Prepared as a research deliverable only; contains no replacement Plan prose, patches, or PlanUnits. All "validation ideas" are proposals for future verification.*
