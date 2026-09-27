# Slide Scout / OME-Zarr 0.5 viewer — research report

Investigator report on the fixed corpus (`case/sources/S001–S125`), assessing the thin Plan
(`case/plan/Viewer.md`, cited as Plan L1–L11) and the brief (`case/brief.md`). Evidence lives in
`out/observations.md` (O-001…O-076, O-060 unused). Claims below are supported **only** by the cited
corpus observations; nothing here is independently verified and no validation idea has been run.

Corpus integrity first: 8 sources are failed captures (O-032), 8 are search-discovery aids (O-033),
S068 is a binary placeholder (O-031), S002/S057 are empty (catalog; O-032), S088/S120 are capture
artifacts (O-074, catalog). No claim rests on them.

---

## 1. Supported propositions (with conditions)

### 1.1 Format obligations (released OME-Zarr 0.5)

- **P1 — 0.5 is Zarr v3 with a fully open feature surface.** OME-Zarr 0.5 is implemented on Zarr v3
  and explicitly allows all Zarr features (codecs, chunk grids, chunk key encodings, data types,
  storage transformers) unless disallowed (O-001). Version history: 0.5.0 2024-11-21, 0.5.2
  2025-01-10 (dimension_names clarification) (O-001, O-003). This is not an idle permission: the
  flagship public IDR 0.5 sample is a **sharded** array (`sharding_indexed`, inner chunks
  1×1×256×256 in regular 1×10×512×512, inner codecs bytes+blosc/zstd, index bytes+crc32c, uint16)
  (O-028); WEBKNOSSOS's converter defaults to sharded v3 (O-068); the ome2024-challenge converter
  defaults the shard shape to the **whole image array** (O-039).
- **P2 — metadata location and namespacing.** All OME metadata lives in per-node `zarr.json` under
  `attributes.ome` with `"version": "0.5"`; version MUST be consistent within a hierarchy (O-002).
  Every multiscale-level array MUST carry `dimension_names` matching `axes` (O-003).
- **P3 — axes and transforms.** `axes` is 2–5 entries ordered time → channel/custom → space; each
  dataset requires exactly one scale (vectors as long as axes) and at most one translation listed
  after it; dataset paths are ordered high→low resolution; a group-level
  `coordinateTransformations` MAY exist and applies AFTER dataset-level transforms (O-004, O-005).
  Scale/translation may alternatively be given by `path` reference to binary data (O-006).
  The published JSON schema (S053) is the concrete validation target and is *looser* than the prose
  in places (e.g., no ordering constraint on transforms; `name` optional) (O-012).
- **P4 — multiple multiscales entries are legal and unhandled everywhere.** `multiscales` is a list;
  the spec suggests name-based user choice with first-as-fallback (O-007). The reference reader reads
  only `multiscales[0]` (O-015), and a 12-viewer community matrix records that NO viewer opens beyond
  the first entry; several crash (O-041).
- **P5 — omero is transitional and optional.** When present it must contain `channels` with 6-hex
  `color` and `window{min,max,start,end}`; `rdefs` carries `defaultT`/`defaultZ`/`model`
  (O-008). Real readers tolerate every field being absent and default sensibly; a greyscale model
  forces white colormaps; a window missing start/end disables contrast limits (O-017).
- **P6 — labels.** Label images MUST be integer-dtype, MUST implement multiscales, and (spec) have
  the same number of levels as the source; `image-label.colors[].rgba` is 0–255 RGBA with alpha;
  `source.image` defaults `../../` (O-009). Ecosystem behavior: labels default to NOT visible;
  colorless labels render nothing in napari (O-024).
- **P7 — bioformats2raw.layout (transitional) = one fileset, many images.** Conforming readers
  SHOULD NOT open only the first image; discovery is via numbered groups, the `OME` group's `series`
  list, or OME-XML Image IDs; plate takes precedence when present (O-010). The two reference readers
  implement *different* mechanisms (numbered groups/series vs OME-XML parsing) (O-025), napari only
  fully handled series in its 2026-05-20 release (O-056), and this is the single worst-supported
  feature across the 2025 viewer matrix (O-045). bioformats2raw can also reshape hierarchies
  arbitrarily (`--scale-format-string`) and omit the OME group (O-038).
- **P8 — plate/well (HCS).** Row/well/plate group hierarchy with `plate{rows,columns,wells,…}` and
  `well{images[…]}`; empty rows/wells SHOULD NOT exist (O-011). A real challenge plate violates the
  spec MUST on `plate.version` (O-030). Known reader traps: wells with varying zyx dimensions,
  plates with no wells, hard-coded FOV names (O-070, O-059).
- **P9 — 0.4 is structurally cheap to add.** 0.4 = Zarr v2 with `.zgroup`/`.zattrs`, version strings
  inside `multiscales[0]`/`plate`/`well`/`image-label`; metadata content is essentially identical to
  0.5 (O-061). The reference library reads 0.1–0.5 with one codebase via namespace unwrap +
  format detection (O-014). Old-version filesets remain in active service (O-048).
- **P10 — the 0.5 ecosystem converged only recently.** ome-zarr-py shipped 0.5 read/write in
  v0.12.0 (PR#413) and sharding write in v0.16.0; napari-ome-zarr required ome-zarr≥0.13 in
  v0.7.0 (2026-03-16) and handled b2r series in 0.8.0 (2026-05-20); as of Dec 2025 the *released*
  napari plugin still crashed with zarr≥3 installed (O-052, O-056, O-054). AGAVE (C++/tensorstore
  v0.1.78) shipped 0.5 reading 2025-03-22 using the heuristic "zarr.json ⇒ 0.5", loading no display
  metadata at first (O-064; releases v1.8.0 2025-05-22 / v1.10.0 2026-07-13, catalog S091).
  vizarr still had a 0.5 chunk-repetition rendering bug open as of Oct 2025 (O-055).
- **P11 — draft-0.6 material circulates.** napari-ome-zarr main already parses `coordinateSystems`,
  scene transform graphs, and rotation/affine/sequence transforms (warn-and-skip on unknown types)
  (O-022, O-035); RFC-5 is at "Update implementations" state; 0.6rc0 schemas exist; RFC-9 targets
  Zipped OME-Zarr (`.ozx`) (O-062, O-069).
- **P12 — calibration correctness splits the ecosystem.** Dataset-level scale: honored by napari,
  Vol-E, BDV, MoBIE, neuroglancer, WEBKNOSSOS; avivator/vizarr show no scalebar at all. Group-level
  scale/translation: napari NOT supported per the (2025-dated, O-063) matrix; BDV/MoBIE/neuroglancer
  yes (O-044). ome-zarr-py ignores group-level transforms in code (O-016) while napari main
  conditionally combines them (O-022/O-044 tension — matrix predates the code).
- **P13 — product-pattern prior art (AGAVE).** Level picker with per-level memory estimate + XYZ
  ROI subregion at load (O-065); ≤4 concurrent channels; irreversible channel exclusion at load
  (anti-pattern); timestamp overlay in physical time units; "Labels" colormap mode; progressive
  refinement rendering (O-067). BioFile Finder (its companion browser) routes local reads through a
  local HTTP service (O-074). Long-running-viewer hazards are documented: blocking loads still an
  open issue (O-066), GPU memory leak on image switch (O-072), tensorstore double-caching (O-066),
  "too slow to be usable" first cut in QuPath (O-076).

### 1.2 Useful counterexamples (keep explicit)

- Challenge plate without required `version` key — real MUST violation that readers tolerate (O-030).
- Nameless `multiscales` entry in IDR 0.5 capture; unknown `_creator` key; anisotropic z vs y/x
  scale; `defaultZ: 118` navigation hint (O-029).
- Big-endian dtype `>u1` sample that broke neuroglancer; non-2× pyramid factors that broke vizarr
  (O-043).
- Z-downsampled pyramid that breaks vizarr (won't open) and napari (crashes on zoom) (O-042).
- Single-scale images have no 0.5 spec home (ngff#207 open); ome-zarr-py nonetheless renders raw
  arrays (O-049, O-019).
- ome-zarr-py write path crashes on zarr-python `shards: "auto"` (O-058) — shard parameters vary.
- zarr v3 write-mode wipes directories; ome-zarr-py needed a read-only-store fix after shipping 0.5
  (O-051).
- The pinned ome-zarr-py tree contains a stale docstring ("writing not supported yet") contradicted
  by merged code/release history — comments lag behavior even in this corpus (O-053).

---

## 2. Plan fit (each item: constraint → disposition, consequence, validation idea)

Plan text: L5 (open fileset, list images, canvas pan/zoom, channel visibility, time/plane, label
overlays, details panel, pyramid level choice), L7 (background reads, cancellation, failure
explanations), L9 (interop with real 0.5 tools, files unchanged, session-local settings, exclusions),
L11 (acceptance fixtures; no freeze; understandable failure feedback).

| # | Plan line | Constraint (exact) | Disposition | Product consequence | Distinguishing validation idea |
|---|---|---|---|---|---|
| A | L5 | "opens a local OME-Zarr 0.5 fileset" — 0.5-only scope | **correction** | Local corpora include 0.1–0.4 filesets (P9, O-048); define version policy explicitly: read 0.4 (cheap, O-061) or refuse with a message naming the detected version. Never silently misparse. | Open a 0.4 IDR sample and a 0.5 sample; observe the *defined* behavior for each (and a 0.6-draft scene file → warn+degrade, O-022). |
| B | L5 | "lists the images it finds" | **covered**, with an unspecified-discovery gap flagged under L9 interop below | Must implement all b2r discovery paths (numbered groups, `series`, OME-XML Image IDs; plate precedence, O-010/O-025) and must not choke on `ro-crate-metadata.json` (O-039) or `OME/` absence (O-038). Multi-image-ness must be visible (spec SHOULD, O-010). | BR00109990_C2.zarr ("bioformats2raw.layout (9 images)", O-047): assert the list shows 9 images without manual URL surgery (napari needed `/0` appended as late as 2025, O-050). |
| C | L5 | "channel visibility controls" | **covered**; omero-absent defaults are a **correction** to any schema-strict reading | omero is optional (O-008) and real files omit it (`--no-minmax`, O-037; many 0.5 samples have no channel axis at all, O-047). Defaults: name `channel_N`, visible, grayscale; honor `active`, `label`, `color`, `window.start/end`, greyscale model (O-017). | Open a fileset with no `omero` → controls render with defaults and a hint; open 6001240_labels.zarr → Dapi/LaminB1 labels+colors+window from metadata (O-029). |
| D | L5 | "time-point and plane selection where relevant" | **covered**; axis-derivation is a **correction**; honoring `rdefs` defaults is an **optional_capability** | Derive t/z roles from `axes` types, never position (channel-first czyx exists, O-028); hide controls when axes absent (XY/XYZ/XYZC 0.5 samples exist, O-047); `defaultT`/`defaultZ` are the writer's intended first view (O-008, O-029) — WEBKNOSSOS ignores them (O-046), so honoring them is a differentiator. | 6001240_labels.zarr: initial plane = 118 (defaultZ) with z-scale 0.5002 µm vs y/x 0.3604 µm shown per-axis (O-029). |
| E | L5 | "optional overlays for associated label images" | **covered**; colorless-label fallback is a **product_choice** | Resolve parent via `image-label.source.image` (default `../../`), tolerate wrong/missing paths as "overlay unavailable" (O-018, O-009); labels default hidden (O-024); RGBA alpha built in (O-009); cross-layer unit consistency required or calibration display downgrades (O-023). Watch the open spec gap: 0.5 cannot distinguish a label-image group from an image group except via the parent's `labels` list (O-069). | IDR 5514375 or 6001240: overlay aligns level-for-level; a deliberately depth-mismatched label pyramid → defined behavior (spec says levels MUST match, wild data may not, O-009). |
| F | L5 | "details panel shows dimensions, units and coordinates" | **covered**; transform composition is a **correction** | Compose dataset-level THEN group-level `coordinateTransformations` (O-005); half the ecosystem gets this wrong (O-044, O-016). Units are SHOULD-level and may be missing → fall back to pixels with an explicit "no units" state (O-004, O-012). Scale/translation-by-`path` would defeat inline-only parsing (O-006). | idr0101 samples: 13457539 (multiscales-level translation) and 13457537 (dataset-level) — displayed coordinates must differ by the composed offset (fixtures named in S010, O-047). |
| G | L5 | "chooses an available pyramid level appropriate for the current view" | **covered**; per-level shape/scale independence is a **correction**; level-picker-with-memory-estimate is an **optional_capability** | Read each level's own `zarr.json` (shape, codecs, transforms); never extrapolate from level 0 (z-downsample trap O-042; non-2× factors O-043; sharded arrays O-028). AGAVE's memory-estimate + ROI picker is proven UX for large data (O-065). | 9836832 (z-downsampled) + 9846318 (÷3 factors): correct render + correct per-level scale; plus a pixel-content assertion (tile hash vs direct array read) on the sharded IDR sample — the failure class vizarr shipped (O-055). |
| H | L7 | "Large image reads run in the background so navigation remains responsive" | **covered** (requirement); risk is load-bearing | The closest shipping analog still has blocking loads as an open issue (O-066); zarr-python v3/sharding has known performance issue titles (O-034); QuPath's first cut was "too slow to be very usable" (O-076). Library choice (zarr-python vs tensorstore) is a first-order decision the Plan doesn't surface (O-034, O-036, O-065). | Scripted pan/zoom during initial load of a large sharded local fileset (e.g., a 9822152-like array, 21.6 GB, O-034/S010): interaction stays live; chunk reads stream. |
| I | L7 | "Changing the selected view cancels work that is no longer needed" | **covered** | Cancellation is where peers fail (O-066); stale tiles must never render after a switch, and resource lifecycle (free prior image memory, bound caches) needs explicit design — agave shipped a 12-PR cache series and still leaks GPU memory on switch (O-072). | Switch images mid-load N times; assert no stale render, stable memory (this is also the agave#276 leak scenario, O-072). |
| J | L7 | "Opening failures explain which image or data could not be displayed and allow the user to choose another item" | **covered**; silent-skip is the ecosystem baseline to beat | ome-zarr-py silently yields nothing for unrecognized groups (O-019) and `parse_url` returning `None` is a known complaint (O-070); unsupported codecs/grids/transforms are expected, not exceptional (O-071, O-022) → messages must name the failing node, array, codec, or transform type. | Six malformed fixtures from published-schema violations (O-012) + the wild ones: plate without `version` (O-030), `>u1` dtype (O-043), scene/coordinateSystems group (O-022): each yields a message naming the path and reason; list stays usable. |
| K | L9 | "interoperate with filesets from real OME-Zarr 0.5 tools" | **covered**; definition is a **correction** | "Real tools" = a writer zoo (Java/Python/Rust/.NET, O-075) emitting sharded (O-028, O-039, O-068), multi-codec (null/blosc/gzip/zstd, O-037) filesets, with real MUST violations (O-030) and a reference library that relaxed 0.5 strictness after it broke real spatialdata files (O-052). Validate advisory-style: report violations, don't refuse. | Fixture set sampled across ≥2 independent writer stacks: bioformats2raw (zarr-java) output AND ome2024-challenge (zarr-python/zarrs) output, both local copies. |
| L | L9 | "Source files remain unchanged" | **covered** | Enforce read-only stores; the ecosystem's own near-miss (zarr v3 write-mode wipe, O-051) shows this needs a test, not an intention. | Before/after byte-hash of a full fileset (incl. mtimes, no new files) across a session that opens every feature (labels, plates, malformed nodes). |
| M | L9 | "display settings are local to the viewing session" | **covered** as **product_choice** | No corpus tension; note AGAVE's contrasting feature (save/load viewer-settings JSON with absolute paths, O-067/S108) stays out unless reviewed (Plan L9 "Additional capability choices require explicit review"). | Scope guard: no settings file written next to data after a session (same test as L). |
| N | L9 | "Image editing, export, remote storage … outside this plan" | **covered** | Consistent with brief. Note the cost: peers are remote-first (agave https/s3/gc, vizarr URLs, O-067/O-073); local-only is a genuine simplification but local fixtures must be full local copies. | None needed beyond scope guard. |
| O | L11 | "representative filesets" | **covered**; fixture list is a **correction** (must be explicit) | The IDR catalog (O-047) + the ome-ngff-tools matrix sample list (O-041–O-046) are ready-made fixture menus covering every acceptance row: discovery (b2r 9-image), navigation (z-downsample, non-2×), channels/planes (13457227), calibration (6001240, 13457537/39), labels (5514375, 6001240), plates (76-45, 190129, 2551), multi-multiscales (4995115). | Fixtures chosen from both menus; matrix samples reused so results are comparable to published viewer behavior (O-063 dating applies). |
| P | L11 | "aligned label overlays" | **covered** | See E; alignment must be asserted, not assumed (levels MUST match per spec but wild data varies, O-009). | Overlay pixel registration check at two zoom levels on a labels sample. |
| Q | L11 | "A large dataset must not freeze interaction" | **covered** | This is THE recurring peer failure (napari plate zoom crash O-046; QuPath slowness O-076; agave blocking O-066; zarr-python sharding slowness O-034). Level-select + lazy chunk reads + cancellation (L7) are the levers; time-series stepping deserves its own test (agave#323, O-066). | Interactive test during load (H) plus a time-series sweep on a multi-GB t-series with UI interaction between steps. |
| R | L11 | "Malformed or unavailable input must produce understandable feedback rather than a crash" | **covered** | "Unavailable" includes missing chunk files/dirs and unreadable arrays mid-pyramid; "malformed" includes schema violations and wild MUST violations; message quality bar per J. | Truncate/delete a chunk file in a copy of a fixture → specific "missing chunk data for <array>" message, other images still listable. |

### Plan gaps (things the thin Plan doesn't mention that the corpus shows are load-bearing)

| # | Gap | Disposition | Consequence / validation |
|---|---|---|---|
| S1 | Multiple `multiscales` entries in one group | **optional_capability** | Match ecosystem (read first, O-015/O-041) but never crash; name-based chooser would be ecosystem-leading. Fixture: 4995115.zarr. |
| S2 | HCS plate filesets | **unresolved** (product scope) | 0.5 plates are in the canonical sample set (76-45: 384 wells; 190129: 49 wells × 32 fields, O-047). If out of scope, the image list must still say "plate fileset, N wells" instead of appearing empty (vizarr's lowest-res-only and napari's crash are the anti-patterns, O-046). Fixture: 190129.zarr root capture S056. |
| S3 | Dtype support matrix | **correction** (must be explicit) | Spec allows all Zarr dtypes (O-001); peers restrict (agave: int32/uint16/uint8/float32, O-036; vizarr: 8 dtypes incl. int64-adjacent, O-073); labels MUST be integer (O-009). Decide + document + message on unsupported dtype. |
| S4 | Label-vs-image group distinction during discovery | **correction** | In 0.5 only the parent's `labels` list identifies label images (O-069); the image list should not present label pyramids as sibling images without marking them. |
| S5 | Resource lifecycle (memory/cache bounds across images) | **optional_capability** (strongly evidenced) | agave leak + cache series (O-072); test I covers the validation. |
| S6 | 0.6-draft tolerance (scenes, coordinateSystems, rotation/affine transforms) | **correction** (minimal: warn+degrade) | Draft data exists in the wild and in readers (O-022, O-035, O-052, O-070); hard parse failure would violate J. |
| S7 | Which version(s) of the reading stack | **unresolved** (engineering decision with product impact) | zarr-python ≥3 on Python ≥3.11 (O-050) vs tensorstore (agave's choice; heavy build, open zarr-v3 gaps: rectilinear grid extension, codec-merge errors, O-071); sharding perf risk (O-034); ome-zarr-py churn 0.12→0.19 (O-052). |
| S8 | Time-axis units display | **optional_capability** | Physical time-unit readout from axis `unit` is shipped UX in agave (O-067); units vocabulary itself is under debate upstream (O-069). |
| S9 | Single-scale (non-pyramid) groups | **correction** (minimal) | No 0.5 spec home (ngff#207 open, O-049) but ome-zarr-py renders raw arrays (O-019); decide render-with-default-scale vs explicit message. |

---

## 3. Deferred items (with reasons)

- **Plate navigation UI** (beyond detection/listing): largest scope item; peer implementations crash
  or degrade (O-046); needs per-well lazy reads and varying-shape handling (O-070). Requires the S2
  product decision first.
- **0.6 scenes / coordinateSystems / expanded transforms**: spec unreleased (RFC-5 state S3,
  O-062); only warn+degrade support is proposed (S6).
- **Remote URLs (http/s3) reading**: explicitly out of Plan (L9); peers are remote-first, so local
  is a differentiator, but all fixtures/perf claims here assume local disks.
- **Zipped OME-Zarr (`.ozx`, RFC-9) and zip stores**: spec draft + open library issues (O-062,
  O-070); not an obligation for released 0.5.
- **Multiple-multiscales chooser UI** (S1): no peer implements it; defer until after core parity.
- **Consolidated metadata (`.zmetadata`) handling**: unresolved upstream even for ome-zarr-py
  (O-070); monitor.
- **Group-level transform composition by `path` reference** (O-006): spec-legal but unseen in
  corpus samples; implement detection + clear "unsupported transform storage" message, defer full
  support until a sample appears.

## 4. Coverage

**Sources (125 handles):**
- Read in full or substantial part (≈60): S001, S003, S005–S012, S014, S016–S019, S021, S022,
  S025, S029–S034, S036–S038, S041–S043, S045, S046, S048, S049, S053–S056, S058 (grep), S060,
  S062, S066–S069, S071, S072, S077, S081, S082, S088, S094–S097 (titles), S099, S102–S105,
  S108, S110, S111, S112 (titles), S114 (titles), S115, S117–S123, S125.
- Targeted extraction only (grep of titles/key fields; bodies not fully read): S004, S008, S013,
  S023, S027, S028, S035, S044, S051, S052, S059, S061, S063–S065, S070, S091, S098, S099.
- Not read at all (catalog metadata only): S002 (empty), S015, S020, S024, S026, S039, S040, S047,
  S050, S057 (empty/failed), S073–S075, S078–S080, S083, S085–S087, S089, S090, S092, S093, S098
  (diff body), S100, S101, S106, S107, S109, S113, S116. These are predominantly GitHub
  chrome-heavy issue-list dumps, git trees, PR file lists, and tensorstore repo contents — sampled
  via the dedicated issue captures instead. **An unread source is not evidence of absence.**
- Known-unreadable within corpus: S005, S007, S030, S031(read), S042, S045, S046, S077, S095
  (failed captures, O-032); S068 (binary placeholder, O-031); S002/S057 (empty).

**Questions left unresolved (explicitly):**
1. Whether any admitted 0.5 sample uses group-level `coordinateTransformations` or transform
   `path` references (greps not run over the large JSON dumps; O-005/O-006 remain spec-level).
2. Whether the three IDR pyramid levels shard identically (only level 0 captured, O-028).
3. What `6001240_labels.zarr`'s inner hierarchy looks like beyond its root `zarr.json` (O-029).
4. Current (2026) viewer-matrix results — the corpus matrix is dated ≈April–May 2025 (O-063);
   O-041–O-046 describe the 2025 reader generation.
5. Exact ome-zarr-py pinned-commit provenance (post-#413, pre-0.12.0; inferred from S016+S017+S052,
   O-053) and whether S048's napari reader postdates the features matrix (O-044 open question).
6. Whether "zarr-python sharding slowness" (title-level, O-034) still applies to current zarr-python.
7. All product decisions flagged `product_choice`/`unresolved` above (plates, dtype matrix, storage
   library, colorless-label fallback, 0.4 scope).

**Deliverable note:** validation ideas in section 2 are proposals, not executed or passing tests;
no claim in this report has been independently verified against live systems (none were contacted).
