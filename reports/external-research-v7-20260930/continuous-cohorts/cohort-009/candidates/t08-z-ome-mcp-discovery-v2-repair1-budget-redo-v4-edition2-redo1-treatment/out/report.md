# Slide Scout — OME-Zarr 0.5 research report (standalone)

Task: t08-z-ome-mcp-discovery-v2-repair1-budget-redo-v4-edition2-redo1-treatment.
Scope: read-only desktop browser ("Slide Scout") for local OME-Zarr 0.5 bioimaging filesets. Product boundary from the brief: local filesystem reading only; sources unchanged; no editing/export/remote services/clinical interpretation.
Plan status: **no plan was admitted to this workspace (plan-blind case).** "Plan implications" below are therefore implications for any thin initial plan derived from the brief alone, not for an admitted plan document. No plan/spec/answer history was consulted.

Research performed 2026-10-01 using only the bounded MCP tools (read_file, write_file, mechanical[line_map|cache_source|render_sections], public_https_get). Queries, reads, and dead ends are logged in `out/acquisition.json` and `out/scheduling.json`; family derivations precede search in `out/scheduling-initial.json`.

---

## 0. How to read the obligation labels

The 0.5 specification uses RFC 2119 keywords (MUST/SHOULD/MAY) and a **transitional** category (read-support expected or encouraged; write optional; intended for future removal). Throughout this report:

- **[OBLIGATION]** = normative MUST/SHALL in the 0.5 spec; a conforming reader must do it.
- **[RECOMMENDED]** = SHOULD in the 0.5 spec; deviating needs justification.
- **[OPTIONAL/PRODUCT-DECISION]** = MAY, absent from the spec, or transitional "omero"-style metadata; a product choice is required.
- Findings from reader implementations (not the spec) are labeled **[ECOSYSTEM]**; they are evidence of real-world expectations, not format law.

---

## 1. Findings

### R1 — OME-Zarr 0.5 is a published, final specification with its own version history [OBLIGATION-context]
- Identity: NGFF version 0.5 exists as a W3C-style Community Group Final document ("status: w3c/CG-FINAL", dated 2025-01-28), authored under editor Josh Moore. Patch history: 0.5.0 (2024-11-21: switched OME-Zarr to Zarr v3 per RFC-2; labels restricted to integer data types), 0.5.1 (2025-01-10: restored improved omero description), 0.5.2 (2025-01-10: clarified that `dimension_names` is MUST).
- Evidence locator: `https://raw.githubusercontent.com/ome/ngff-spec/0.5/index.md` (32,266 bytes, sha256 `7ca442655b11a8cdaf4e62f61e701e27cb9fe1144e4d992c523f43c42395a6d0`), front matter + `version_history.md` (sha256 `21a126a3e515333dba2ccb29ba07a5f8868110845ad363a14238ecd62163b079`). Rendered page `https://ngff.openmicroscopy.org/0.5/index.html` carries revision meta `d9164040dd61b3e4688494de1a58a69251b13f24`, identical to the git tree sha of `specifications/0.5` pinned in `ome/ngff` `.gitmodules` (branch 0.5 of `ome/ngff-spec`).
- Transfer limits: applies to 0.5 filesets only; 0.4 and earlier remain separate documents in the wild.

### R2 — 0.5 builds on Zarr v3, and ALL Zarr v3 features are in scope unless disallowed [OBLIGATION]
- Identity: "OME-Zarr is implemented using the Zarr format as defined by version 3 of the Zarr specification. All features of the Zarr format including codecs, chunk grids, chunk key encodings, data types and storage transformers may be used with OME-Zarr unless explicitly disallowed in this specification." Metadata lives in `zarr.json` under the namespaced `attributes.ome` key with `"version": "0.5"`; the version **MUST be consistent within a hierarchy**.
- Consequence for a local desktop reader: it must parse Zarr v3 (`zarr.json`), the codec pipeline (extensible), arbitrary chunk grids/key encodings, and optionally sharding (ZEP0002) — not merely `.zgroup`/`.zattrs` v2 layouts. RFC-2 ("Zarr V3 Support", Adopted, scoped to 0.5) is the decision record.
- Evidence locator: 0.5 spec `index.md` §Storage format, §OME-Zarr Metadata; `https://raw.githubusercontent.com/ome/ngff/main/rfc/listing.csv` (sha256 `9c343b6e...`); cross-confirmed by ome-zarr-py "Zarr Concepts" table (0.4 = Zarr v2 `.zarray`/`.zgroup`, no sharding, limited codecs; 0.5 = Zarr v3 `zarr.json`, sharding, extensible codecs) at `https://ome-zarr.readthedocs.io/en/stable/explanation/zarr_concepts.html` (13,892 bytes, sha256 `dca16cb6...`).
- Transfer limits: zarr-python 2 reads v2 stores; v3 stores need zarr-python 3 or independent implementations (ngff-zarr uses zarrita/zarrs and states 0.5+ output readable by zarr-python 3). A thin plan assuming v2 layout would fail on every conforming 0.5 fileset.

### R3 — What a conforming 0.5 image group must contain (multiscales core) [OBLIGATION]
- Identity (from full spec text): group `attributes.ome` carries `multiscales` (a list). Each entry **MUST** have `axes` (2–5 entries; ordered time → channel/custom → space; names unique; length equal to array dimensionality; `dimension_names` in each level's `zarr.json` MUST match axes names) and `datasets` (paths **MUST** be ordered largest/highest-resolution → smallest; each dataset **MUST** have `coordinateTransformations` restricted to `scale`/`translation`; **exactly one `scale` is mandatory**, expressing physical pixel size or, absent downsampling on an axis, the ratio to level 0 defaulting to 1.0; `translation` if present **MUST** follow `scale`). Group-level `coordinateTransformations` **MAY** exist and are applied after the per-dataset ones. `name` **SHOULD** be present; `type` (downsampling method) and `metadata` **SHOULD** be present. Where three spatial axes exist with an anisotropic stack axis, `zyx` ordering is SHOULD.
- Multiple `multiscales` entries: the spec's own guidance is to let the user choose by name, falling back to the first entry (pseudo-code included in the spec).
- Evidence locator: 0.5 spec `index.md` §"multiscales" metadata, §"axes" metadata, §"coordinateTransformations" metadata (same sha256 as R1).
- Transfer limits: 0.4 differs (axes units/transforms introduced in 0.4; v2 store). The 0.6 draft relaxes/extends axes (RFC-3) — do not build 0.6 assumptions into the 0.5 reader.

### R4 — Calibration: units are SHOULD, not MUST — a reader must survive their absence [OBLIGATION + PRODUCT-DECISION]
- Identity: axis `unit` SHOULD be one of a fixed UDUNITS-2 vocabulary (space: `micrometer`, `nanometer`, …; time: `second`, `millisecond`, …). `type` is SHOULD (`space`/`time`/`channel`, custom allowed). Because scale is mandatory but units are only SHOULD, "correctly calibrated coordinates" (brief) requires: apply the scale transform chain (per-dataset then group-level, in order), render the unit string when present, and degrade gracefully (explicit "uncalibrated/unknown units" state) when absent or outside the vocabulary.
- Real-world shape of the data: the documented IDR 0.5 sample `6001240_labels.zarr` exposes axes `c,z,y,x`, per-axis scales with a genuinely anisotropic z (`z: 0.5002025531914894` vs `y/x: 0.3603981534640209`), units `micrometer` — i.e., z spacing is NOT the y/x pixel size and must not be conflated when displaying plane coordinates.
- Evidence locator: spec `index.md` §"axes"; `https://ome-zarr.readthedocs.io/en/stable/basic/read_image.html` (33,345 bytes, sha256 `7fbba82a...`), output block for `OMEZarrMultiscale.from_ome_zarr("https://livingobjects.ebi.ac.uk/idr/zarr/v0.5/idr0062A/6001240_labels.zarr")`.
- Transfer limits: unit conversion (µm↔nm) is not required by the spec; display choice is a product decision.

### R5 — "omero" display metadata is transitional and optional — but drives viewer defaults [OPTIONAL/PRODUCT-DECISION]
- Identity: the `omero` block (transitional) is optional; **if present** it MUST contain `channels[]` where each entry has `color` (6 hex digits) and `window` {`min`,`max`,`start`,`end`}; it also carries `label` (channel name), `active`, `rdefs.defaultT`, `rdefs.defaultZ`, `rdefs.model` (`color`|`greyscale`). These are exactly the initial channel-name/window/default-time/default-plane hooks a viewer needs; a thin plan that *requires* omero will reject conforming 0.5 files that omit it.
- Evidence locator: spec `index.md` §"omero" metadata (transitional) with JSON field list; napari-ome-zarr README states "image metadata from OMERO will be used to set channel names and rendering settings" — an ecosystem confirmation of the optional-but-load-bearing role.
- Transfer limits: 0.5.1 history shows this section was dropped and re-added — treat as unstable across versions.

### R6 — Labels: structure, dtypes, level-parity, and coloring obligations [OBLIGATION + RECOMMENDED]
- Identity: labels live in a `labels` group nested in the image group; the labels group's `zarr.json` **MUST** contain `labels: [paths]`; label pixels **MUST** be one of `uint8|int8|uint16|int16|uint32|int32|uint64|int64`; each label image **MUST** itself implement multiscales with the **same number of scale levels** as its parent; intermediate groups MUST NOT carry metadata. The label image SHOULD carry `image-label` with `colors` (each entry MUST have integer `label-value`; MAY have `rgba` = 4 ints 0–255), MUST-when-present string `version`, optional `properties` (arbitrary per-object key-values keyed by `label-value`) and `source.image` (relative path, default `../../`). Conforming readers SHOULD display labels using the specified colors. napari-ome-zarr adds labels as label layers "initially inactive" — a sensible overlay default.
- Evidence locator: spec `index.md` §"labels" metadata; `https://ome-zarr.readthedocs.io/en/stable/advanced/labels/labels_metadata.html` (24,834 bytes, sha256 `ab2de815...`); `https://raw.githubusercontent.com/ome/napari-ome-zarr/main/README.md` (5,234 bytes, sha256 `ba152552...`).
- Product decisions: what to do when rgba/`image-label` is absent (auto color LUT), and whether properties are surfaced (useful, optional).
- Transfer limits: the "same number of scale levels" MUST is a real interop trap — label/image level mismatch is a validation-grade error, not a soft case.

### R7 — Navigation surface: images, plates/wells, multi-series collections, scene graphs [OBLIGATION for discovery + ECOSYSTEM UX]
- Identity: three structure families must be discoverable by a reader that claims to "find images within a fileset":
  1. **Plain images** (multiscales groups, R3).
  2. **HCS plates**: three groups above images (well → row → plate); plate metadata MUST have `columns`, `rows`, `wells` (each well `path` = row name + "/" + column name, `rowIndex`/`columnIndex` 0-based), `version`; well metadata MUST have `images[]` (`path` per field of view, `acquisition` when multiple); names are case-sensitive alphanumeric and the spec explicitly warns about collisions on case-insensitive filesystems (a local-desktop-relevant hint).
  3. **`bioformats2raw.layout` = "3" (transitional)**: multi-series collections with `OME/METADATA.ome.xml` (MetadataOnly) and optional `OME`→`series` path list; un-numbered fallback is consecutive groups `0,1,2,…`; every multiscales group maps to exactly one OME-XML Image in order. Conforming readers **SHOULD make users aware of more than one image and SHOULD NOT default to only opening the first** — a direct navigational obligation on Slide Scout.
- 0.5 also recognizes **Scene** groups (a graph of images joined by named coordinate systems/transforms): napari-ome-zarr documents reading Scenes, building the graph purely from `coordinateTransformations` and supporting `identity`, `scale`, `translation`, `rotation`, `affine`, `sequence`. (The normative Scene/coordinate-system machinery is expanded in 0.6 via RFC-5; in 0.5 the reader-facing rule set is thinner — treat Scene handling as [RECOMMENDED] breadth, not 0.5 MUST.)
- Evidence locator: spec `index.md` §Images/HCS layouts, §"plate"/"well", §`bioformats2raw.layout`; napari-ome-zarr README "Data support" section; ome-zarr-py `write_hcs_plate` docs page (listed, structure per spec).
- Transfer limits: plate grid rendering and scene-graph visualization are product decisions; the SHOULD-not-default-to-first-image rule is normative for conforming readers.

### R8 — Reader ecosystem and the version-support matrix (compatibility risk register) [ECOSYSTEM]
- Identity of implementers, with claimed spec support:
  - **ome-zarr-py** (OME, BSD-2; docs `ome-zarr.readthedocs.io/en/stable/`, RTD "stable"): writes 0.5 by default **on Zarr v3**; explicitly warns "OME-Zarr v0.5 is not yet supported by all OME-Zarr tools"; provides `OMEZarrMultiscale`/`OMEZarrImage`/`OMEZarrLabels` classes and a node-based `Reader`; CLI; sharding via storage options.
  - **ngff-zarr** (Fideus Labs, MIT; README sha256 `2fe1f23b...`): reads 0.1–0.6, writes 0.4–0.6; Python + TypeScript (Deno/Node/browser); lazy/parallel, "no local filesystem required"; sharded stores; RFC-4 orientation metadata; `.ozx` single-file zip (RFC-9); HCS; optional validation during reading; 0.9.dev1 dev version adopts RFC-3.
  - **napari-ome-zarr** (OME, BSD-3): supports **all** OME-Zarr versions; images, plates, bioformats2raw collections, scenes; channel→layer splitting; labels→label layers.
  - **vizarr** (hms-dbmi, MIT; README sha256 `e2b6135a...`): purely client-side; zarrita.js store access; Viv GPU rendering; 2D slices of n-D data; single-channel or blended composites; dtypes int8–float64; limitations: built for registration use-case, generic zarr "not as well tested".
  - Others surfaced by query: `bioio-devs/bioio-ome-zarr` (reader plugin), `Huber-group-EMBL/Rarr` + `romeo` (R), `bcdev/jzarr` (Java), `constantinpape/z5` (C++), `glencoesoftware/NGFF-Converter`, `InsightSoftwareConsortium/ITKIOOMEZarrNGFF` (referenced), `ome/ome_zarr_test_suite` (reader/writer conformance tests).
- Compatibility cliffs to respect in a desktop build: (a) 0.4 stores are Zarr v2, 0.5 stores are Zarr v3 — two metadata dialects (`​.zgroup`/`.zarray`/`.zattrs` vs `zarr.json`); (b) the ecosystem itself flags 0.5 as not universally supported; (c) sharded 0.5 arrays are unreadable in stacks below specific floors (see R9).
- Evidence locators: as listed above plus GitHub API result payloads recorded in `out/acquisition.json`.
- Transfer limits: claims are implementer-stated (README/docs), not independently benchmarked here.

### R9 — Sharding is the pivotal 0.5 performance/compatibility feature [ECOSYSTEM + FORMAT-ADJACENT]
- Identity: ZEP0002 sharding bundles many chunks into one storage unit. ome-zarr-py's worked example measures file counts for the same array: **2,070 files unsharded → 282 with shard (1,1,32,32,32) → 21 with one shard per level-0 array**. Constraints: shard size MUST be an integer multiple of the chunk size; per-level shard sizes are supported. Explicit compatibility note in the same page: "sharding is only available for dask > 2026.3.0 … conversely … *reading* sharded data is also not possible with dask <= 2025.11.0." Motivations documented: fewer filesystem operations, faster transfers, filesystems that limit files-per-volume, less streaming overhead.
- Consequences for Slide Scout: (1) a local 0.5 fileset may legally be fully sharded — the reader's Zarr-v3 layer must implement shard-index parsing or it will fail on real data; (2) "remains responsive while opening large saved datasets" (brief) is best served by chunk-lazy reads at a chosen pyramid level rather than whole-array loads; (3) any dask-based backend must be pinned above the sharding-reading floor.
- Evidence locator: `https://ome-zarr.readthedocs.io/en/stable/advanced/sharding.html` (28,657 bytes, sha256 `cd46de4e...`); ZEP0002 at `https://zarr.dev/zeps/accepted/ZEP0002.html` (referenced by both ome-zarr-py and ngff-zarr; not fetched — recorded as a lead).
- Transfer limits: file-count numbers are from a 128³ toy array; absolute numbers will differ, the 3-orders-of-magnitude trend and the dask floor are the transferable parts.

### R10 — Explaining unsupported data: validation tooling and the normative error surface [RECOMMENDED + ECOSYSTEM]
- Identity: the 0.5 spec's MUST/SHOULD/MAY set (R2–R7) *is* the checklist a reader can test against; JSON Schemas for exactly this live in the `ome/ngff-spec` repo `schemas/` directory (branch per version; the validator even supports a `schemas=` URL parameter to load alternative schema branches). Tooling: **ome-ngff-validator** (web app, BSD-2, Svelte, deployed at `https://ome.github.io/ome-ngff-validator`, driven against the sample corpus at `https://idr.github.io/ome-ngff-samples/` which links every sample to the validator and to vizarr); **ome/ome_zarr_test_suite** ("Test suite of reader and writer implementations"); ngff-zarr's "optional OME-Zarr data model validation during reading". The 0.6 draft makes the intended trend explicit: readers MUST parse identity/scale/translation (+sequences) and **SHOULD display an informative warning for transformations they cannot parse** — a forward-looking norm for "clearly explain data it cannot display."
- Product implication: an explain-failure layer should distinguish (a) schema-invalid metadata, (b) spec-legal but unsupported features (e.g., unimplemented codec, sharding, Scene transforms), (c) Zarr-level structural damage (missing chunks). (c) is outside schema validation — an reader-side concern.
- Evidence locator: `https://raw.githubusercontent.com/ome/ome-ngff-validator/main/README.md` (506 bytes, sha256 `679c3eb9...`); `ome/ngff-spec` contents listing (branch 0.5, `schemas/` tree sha `b5b6337e...`); `https://idr.github.io/ome-ngff-samples/` (270,221 bytes, truncated view); 0.6 draft §coordinateTransformations "Conforming readers" (truncated fetch, see U1).
- Transfer limits: the validator is a web app (URL-based); running it offline against local paths was **not executed** here (see §4).

### R11 — Currency: 0.5 is not the frontier; design for coexistence [OBLIGATION-context]
- Identity: the `ome/ngff` site already publishes **0.6** (`specifications/0.6` submodule; source ~90 KB; fetched head confirmed RFC-5 machinery: named `coordinateSystems`, `scene` metadata, transform types `mapAxis`, `projectAxis`, `affine`, `rotation`, `sequence`, `displacements`, `coordinates`, `bijection`, `byDimension`, pixel-center origin convention, new axis types incl. `discrete`). RFC ledger: RFC-3 (remove axis restrictions) under review, adopted in dev `0.9.dev1`; RFC-4 (axis anatomical orientation) Accepted; RFC-6 superseded; RFC-8 Collections / RFC-9 Zipped OME-Zarr / RFC-10 governance under review (2025–2026). ngff-zarr already reads 0.1–0.6 and `.ozx` zips; IDR hosts filesets of versions 0.1–0.5 in one catalog.
- Implication: a "local OME-Zarr 0.5 browser" will nonetheless meet 0.4 directories and, increasingly, 0.6/`.ozx`. The brief's "clearly explain data it cannot display" should include a version gate: parse `attributes.ome.version`, display it, and refuse-with-explanation anything outside the supported set rather than misparsing.
- Evidence locator: `https://raw.githubusercontent.com/ome/ngff-spec/0.6/index.md` (89,897 bytes, sha256 `def334d0...`, **fetch truncated at 50 KB** — see U1); `rfc/listing.csv`; ngff-zarr README; version_history.md.
- Transfer limits: 0.6 status page-header lacks the `w3c/CG-FINAL` marker observed for 0.5 in the fetched portion; treat 0.6 normative weight as "published draft" until verified (U1).

### R12 — Local, read-only, unchanged-source operation [OBLIGATION-context + ECOSYSTEM]
- Identity: the directory store is the documented "most common" Zarr backend and the 0.5 layout section states the hierarchy "is represented here as it would appear locally but could equally be stored on a web server … or in object storage." Reading requires no writes to the store (chunks and `zarr.json` are read-only artifacts); ome-zarr-py's reader explicitly accepts local paths ("the same code can be used to read data on a local file system"). Two filesystem-flavored obligations appear in the spec itself: plate row/column name collisions on case-insensitive filesystems (SHOULD-avoidance duty on writers; a reader should tolerate/flag), and sharding's mitigation of per-volume file limits (a local-FS constraint).
- Product decisions: open-by-folder picker vs. `.ozx`/zip; cache location (must be outside the source tree to honor "source files must remain unchanged"); handling of partially-downloaded/malformed chunk files with a clear message.
- Evidence locator: spec `index.md` §Storage format, §"plate"; `zarr_concepts.html` §Stores; `read_image.html` ("same code … local file system").
- Transfer limits: remote-store behaviors (S3/HTTP range logic) are out of the product boundary but the same Zarr layer usually provides them for free.

---

## 2. Obligations vs optional capabilities (decision list for a thin plan)

**Established format obligations (must-do):** Zarr v3 store parsing incl. `zarr.json`; `attributes.ome.version` read + hierarchy consistency check; axes validation (2–5, ordering, unique names, `dimension_names` match); multiscale datasets ordered high→low res; exactly-one-`scale` rule with per-level application then group-level transforms; unit vocabulary awareness with graceful absence handling; labels structure (integer dtypes, level parity, `labels` listing); plate/well discovery structure; `bioformats2raw.layout` awareness incl. the SHOULD of surfacing multiple series.

**Optional capabilities needing a product decision:** `omero` rendering defaults (use when present, sane defaults when absent); `image-label` colors/properties display; Scene/coordinate-graph rendering; multiple-multiscales picker UI; unit conversion UI; `.ozx`/zip support; sharding write-side (never needed in a read-only product) vs read-side (needed for real 0.5 data); caching strategy; unsupported-feature messaging taxonomy (R10).

## 3. Applicability/transfer limits of this research
- Spec MUSTs transfer to any 0.5 reader regardless of language. SHOULDs are judgment calls with named trade-offs. Ecosystem claims are implementer-stated as of 2026-10-01 fetches (exact bytes+sha256 in `out/acquisition.json`) and were not independently benchmarked; the only quantitative performance evidence (file-count experiment, dask version floor) comes from ome-zarr-py's own tutorial page. Web-viewer UX evidence (vizarr/Viv) transfers only partially to a native desktop shell (GPU canvas vs. native widgets), and dask-specific constraints apply only if a Python/dask backend is chosen.

## 4. Unresolved areas and proposed validation — ALL UNEXECUTED
- **U1**: Tail ~40 KB of the 0.6 spec (incl. scene/labels/plate deltas) uninspected after the 50 KB client truncation. Lead, not a conclusion about 0.6 content.
- **U2**: General web search engines were unusable from this client (4 engines; dead ends recorded). Image.sc forum threads, mailing lists, and Fiji/BigDataViewer OME-Zarr reader behavior were therefore **not** directly evidenced — unvisited leads, not absences.
- **U3**: `zarr-specs` v3 core document and ZEP0002 not fetched directly; their obligations enter this report only via the 0.5 spec's normative reference and two ecosystem pages.
- **U4**: ome-zarr-py `view_images` / `transforms` pages unread; napari-ome-zarr README used as proxy.
- **U5**: `zarr-benchmarks-cryoet` (third-party chunking/sharding benchmark notebooks) listed but not read.
- **Proposed validation (label: UNEXECUTED — none of this was run here):**
  1. Validate the target local corpus with ome-ngff-validator schemas (0.5 branch) + run `ome/ome_zarr_test_suite` against Slide Scout's reader; record every MUST violation encountered.
  2. Reader-stack spike: open a sharded 0.5 store (e.g., re-create the ome-zarr-py shard example) with the chosen Zarr layer; confirm chunk-lazy plane reads < 100 ms p95 and cold-open on a ≥100 GB pyramid stays responsive (explicit success gate).
  3. Calibration check: render the anisotropic IDR-style case (z ≠ y/x scale) and a unit-less fileset; assert the "unknown units" state appears instead of defaulting to pixels-as-µm.
  4. Labels parity: open a labels image whose level count differs from its parent; assert the reader reports the R6 violation rather than rendering misaligned overlay.
  5. Discovery sweep: point the fileset finder at (a) plate, (b) bioformats2raw multi-series, (c) plain image, (d) 0.4 directory, (e) `.ozx`; assert per-category behavior including the multiple-series disclosure rule.

## 5. False-dismissal checks performed
- Web search "failure" was not silently accepted as evidence of absence: after 8 DDG blocks, 4 engine probes, and 8 irrelevant Bing-RSS results, the query channel was switched to the GitHub search API (which returned real results) before any family was marked thin. The Bing HTML path (status 200) was retained as "partial" rather than dead, since organic results may exist beyond this client's 50 KB truncation.
- No family was dropped for returning few results: F5's repo search returned one tangential repository; the family was instead covered by the normative spec text (axes/units/transforms) and a worked example.
- 0.5's "transitional" omero block was not dismissed as ignorable despite being optional: its field list is the only spec-blessed source of channel names/windows, and ecosystem viewers consume it.
- The 0.6 existence was not treated as a reason to skip 0.5 depth; the brief fixes 0.5 as the target, with 0.6 recorded as forward-compat currency only.

## 6. Coverage statement
Families F1 (spec obligations), F2 (reader landscape), F3 (navigation/inspection UX), F4 (label overlay), F5 (calibration), F6 (performance), F7 (validation/error explanation), F8 (local layout/read-only) each received ≥1 external query and ≥1 primary-source inspection before any lead deepening; per-family statuses, dead ends, and unvisited leads are itemized in `out/scheduling.json`. Nothing in this report asserts an external capability beyond what a fetched, hashed source actually showed; failed searches prove only their own failure.
