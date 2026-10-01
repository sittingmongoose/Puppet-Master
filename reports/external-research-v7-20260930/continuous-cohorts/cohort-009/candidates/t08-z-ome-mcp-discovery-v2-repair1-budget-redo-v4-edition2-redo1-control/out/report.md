# Slide Scout research report: OME-Zarr 0.5 format obligations and reader implementations

- **Task card:** t08-z-ome-mcp-discovery-v2-repair1-budget-redo-v4-edition2-redo1-control
- **Date:** 2026-10-01
- **Admitted input:** `inputs/brief.md` (Slide Scout: small read-only desktop browser for local OME-Zarr 0.5 bioimaging filesets; find images, inspect by channel/time/plane, overlay labels, read calibrated coordinates, stay responsive on large datasets, explain undisplayable data; local filesystem only, sources unchanged; editing/export/remote/clinical out of scope)
- **Plan status:** No plan document was admitted. Per the task card, "plan implications where a plan is admitted" resolves to: none admitted — implications below are stated relative to the brief only.
- **Method:** All evidence acquired with the bounded MCP tool `public_https_get` (actual final URL, HTTP status, byte count, SHA-256, text recorded per source in `out/acquisition.json`). Search/read sequencing, dead ends, and unvisited areas are in `out/scheduling.json` (drafts: `out/scheduling.draft1.json`, `out/scheduling.draft2.json`). Locators of the form "S2 L50-57" are line numbers in a workspace transcription of the spec source (`out/cache/ngff-0.5.2-index.bs`, mapped with `mechanical line_map`); the canonical locators are the printed section anchors (e.g., `#storage-format`) in the rendered spec, since the workspace copy is a transcription, not the authoritative bytes.
- **Currency note:** Sources were read 2026-10-01. The official NGFF specification's latest released version is **0.5** (0.5.2, 2025-01-10); some ecosystem tools already reference later development states (see F14/F17).

---

## A. Established format obligations (normative, OME-Zarr 0.5.2)

**F1 — OME-Zarr 0.5 is Zarr v3, not Zarr v2. This is the single largest compatibility fact for a reader.**
Evidence: spec source S2 L50-57 (`#storage-format`: "OME-Zarr is implemented using the Zarr format as defined by the version 3 of the Zarr specification… All features of the Zarr format including codecs, chunk grids, chunk key encodings, data types and storage transformers may be used… unless explicitly disallowed"); version history entry "0.5.0, 2024-11-21: use Zarr v3 in OME-Zarr, see RFC-2"; RFC-2 S9 (status SPEC/S1; "Array and group metadata including attributes are now stored in `zarr.json`"; sharding codec now available; library list). `/latest/` redirect target confirms 0.5 is current (S23).
Consequences: metadata lives in `zarr.json` (group+array), not `.zgroup`/`.zattrs`/`.zarray`; chunk keys use the `/` separator; sharded chunks (multiple chunks in one object) are legal. A 0.4-era reader that probes `.zattrs` cannot open a 0.5 fileset at all.
Applicability/transfer limits: transferable to any desktop reader; sharding means "one file per chunk" assumptions break — chunk access must go through a Zarr v3 codec pipeline, not raw file reads.

**F2 — OME-Zarr Metadata lives under `attributes.ome` with a `version` string that MUST be consistent within a hierarchy.**
Evidence: S2 L154-165 (`#metadata`; example shows `"attributes": { "ome": { "version": "0.5" } }`).
Implication: discovery logic keys off `zarr.json` → `attributes.ome`; mixed-version hierarchies are non-conforming but must be detected and reported, not silently misread.

**F3 — Multiscales obligations: 2–5 axes; time before channel before space; level paths ordered high→low resolution; exactly one `scale` per dataset (with defined fallback semantics when physical size is unknown); optional `translation` after `scale`; optional group-level `coordinateTransformations` applied after per-level ones; `name`/`type`/`metadata` SHOULD; user choice by name with first-entry fallback.**
Evidence: S2 L293-347 (`#multiscale-md`; obligations L302-318; selection snippet L335-346); JSON Schema S20 (`$defs.multiscales`: `datasets` minItems 1 with required `path`+`coordinateTransformations`; `axes` 2–5 items, 2–3 of type space; exactly one `scale` transformation permitted per list).
Implication: scale vectors are per-level arrays as long as `axes`; when physical size is unavailable the scale value degenerates to the ratio vs. level 0 (default 1.0) — a reader must not display that as physical calibration. Multiple entries in `multiscales` are legal and need a selection UI (spec shows name-based choice with first-as-fallback).
Transfer limits: the exact `scale`-means-physical-size vs. ratio distinction is 0.4/0.5-specific; other pyramidal formats differ.

**F4 — Axes: unique `name` (MUST); `type` SHOULD be space/time/channel (custom allowed); `unit` SHOULD be a UDUNITS-2 string from a fixed vocabulary (space: angstrom…zettameter; time: attosecond…zettasecond); `dimension_names` MUST be present in each level array's `zarr.json` and match `axes` names (0.5.2 clarification).**
Evidence: S2 L179-191 (`#axes-md`; unit lists L186-187; dimension_names L191); 0.5.2 history entry "Clarify that the `dimension_names` field in `axes` MUST be included"; S20 `$defs.axes`.
Implication for "read correctly calibrated coordinates": calibration = axis `unit` (SHOULD, may be absent) + per-level `scale` (MUST, see F3 caveat) + `translation`. Because units are SHOULD and unit-vocabulary is rich, correct display requires a unit parser/converter (micrometer vs meter etc.) and an explicit "uncalibrated" state rather than assuming pixels are micrometers.
Transfer limits: UDUNITS-2 vocabulary is NGFF-specific; symptom in the wild (viewer matrix S8) is wrong/ignored Z pixel size after downsampling — a known real-world failure class.

**F5 — `omero` rendering metadata is transitional and optional; when present it MUST contain `channels` with per-channel `color` (6 hex digits) and `window` (`min`,`max`,`start`,`end` all required); `rdefs` (`defaultT`,`defaultZ`,`model`) inform initial view.**
Evidence: S2 L349-388 (`#omero-md`; obligations L384-388); S20 `$defs.omero` (window fields required).
Implication: defaults for channel colors/ranges can come from `omero` but the reader must behave sanely when absent (per-palette/percentile fallbacks are a product decision, not a format obligation). The viewer matrix (S8) shows even established viewers ignore parts (colors ignored in Vol-E and OMERO.html; rdefs unsupported in webKnossos) — treat full `omero` support as a differentiator, not table stakes.
Transfer limits: transitional by definition (see F9) — may be replaced in a future spec; keep the rendering-defaults layer pluggable.

**F6 — Labels: `labels/` group nested in the image group; label pixels MUST be one of the 8 integer dtypes (`uint8…int64`); the labels group's `zarr.json` MUST contain an `ome.labels` array of paths; a label image MUST implement `multiscales` with the SAME number of scale levels as the parent image; `image-label` SHOULD carry `colors` (array of `{label-value, rgba?}`) and `version`, MAY carry `properties` and `source.image` (relative path, default `../../`); readers SHOULD display labels using the specified colors (rgba alpha = opacity).**
Evidence: S2 L390-456 (`#labels-md`; dtypes L400-402; labels key L404-405; level parity L421-422; image-label L424-446).
Implication for overlay: compositing is value-indexed color mapping with alpha, not channel blending; level-parity simplifies overlay (render label level i atop image level i). Dimensions may differ by 1 on irrelevant axes (image-layout notes, S2 L93-99).
Transfer limits: none across 0.4/0.5 (same special-group design); matrix (S8) shows vizarr/BigDataViewer/MoBIE display nested labels, several others ignore them — implementing this is required by the brief regardless.

**F7 — HCS plates/wells: three groups above field-of-view images (plate MUST implement plate spec; well MUST implement well spec); plate MUST have `columns`, `rows`, `wells` (each well: `path` = rowName/columnName, `rowIndex`/`columnIndex` 0-based, all mutually consistent) and `version`; MAY have `acquisitions`; well MUST have `images` list (unique alphanumeric `path`; `acquisition` key required if multiple acquisitions). Empty row/well groups SHOULD NOT exist.**
Evidence: S2 L114-129 (`#hcs-layout`), L458-528 (`#plate-md`), L530-560 (`#well-md`).
Implication: plate navigation is a tree walk over strictly-shaped metadata; sparse plates are normal (empty rows/columns MUST still be declared). The viewer matrix (S8) shows broad failure/partial support for plates across viewers (only vizarr, webKnossos-adjacent tools handle reasonably; several fail outright), so this is where thin plans most often under-scope.

**F8 — `bioformats2raw.layout` (transitional) multi-image filesets: top-level value "3" (MUST); optional `OME/METADATA.ome.xml` (MetadataOnly); optional `OME` group `series` attribute (ordered string paths matching OME-XML Images); otherwise consecutively numbered groups from "0"; a present `plate` key takes precedence. Conforming readers SHOULD make users aware of more than one image (SHOULD NOT silently open only the first).**
Evidence: S2 L194-270 (`#bf2raw`; reader duties L266-270).
Implication: this is the format-side anchor for the brief's "find images within a fileset": fileset-open must enumerate series and offer selection. Matrix (S8): most viewers fail or partially handle bf2raw filesets — a real gap a thin plan would miss.

**F9 — "Transitional" metadata class: reading it may be REQUIRED (MUST) of implementations, writing optional; it exists to serve filesets already in the wild and may be removed later.**
Evidence: S2 L39-45 (`Document conventions`, Transitional definition).
Implication: `omero` (F5) and `bioformats2raw.layout` (F8) are not optional extras for a practical reader — real filesets carry them; plan for read-side support plus graceful degradation, and keep them isolated for future spec churn.

**F10 — Validation is normatively backed: 0.5 ships JSON Schemas (`image`, `label`, `plate`, `well`, `bf2raw`, `ome`, `ome_zarr`, plus `strict_*` variants and `_version`), and the ecosystem maintains validators (ome-ngff-validator web app, ome-zarr-models-py, yaozarrs).**
Evidence: schema listing S19; `image.schema` S20 (e.g., `ome` requires `multiscales`+`version`; window requires `start,min,end,max`; exactly one `scale` allowed); validators section in S7.
Implication: the brief's "clearly explain data it cannot display" can be implemented as embedded schema validation with precise per-key diagnostics, instead of ad-hoc checks.

---

## B. Actual reader/viewer implementations (compatibility evidence)

**F11 — ome-zarr-py (Python reference reader/writer): current release v0.19.2 (2026-09-08); current master requires `zarr>=3.0.0`, `ome-zarr-models>=1.8.1`, Python ≥ 3.12. It historically pinned `zarr < 3` (v0.10.2, Nov 2024) and has since migrated onto zarr-python 3.**
Evidence: S10 (release API), S13 (pyproject dependencies), S12 (changelog entry "pin zarr at < 3" under 0.10.2), S14 (README.rst).
Applicability/limits: Python-side reference behavior and conformance tests; not a desktop stack by itself. Its current NGFF-version support table was not locatable (docs restructured; see unresolved U3) — claims here are version-qualified to the dependency evidence above. Transfer: the migration lag (0.10.2 pin → later zarr>=3) demonstrates that 0.5 support lagged spec release by ~a year across the ecosystem; a Slide Scout plan must pin reader-library versions explicitly.

**F12 — vizarr (browser viewer, closest thin-viewer analog): Zarr v3 support merged 2024-07-15 (PR #172: replaced zarr.js with zarrita.js; "try v3 first, fallback to v2"); as of 2026-03-17 its test fixtures explicitly cover NGFF v0.1, v0.4 AND v0.5 — plates, wells, multiscales, labels, bioformats2raw, 50-channel CYX, 5D greyscale, and ome2024-ngff-challenge Zarr-v3 data (PR #333); Python interface migrated to zarr-python v3 (PR #336). README states: 2D slices of n-D arrays, channel compositing; Viv dtype set (int8/16/32, uint8/16/32, float32/64); self-declared limitation to its registration use case. Known bugs from the viewer matrix: Z-downsampling pyramids fail (issue #60 — expects equal Z-sections per level); non-2 downsampling factors fail (issue #101).**
Evidence: S15 (README), S18 (issue-search results with PR bodies/dates), S8 (matrix cells referencing #60/#101).
Applicability/limits: web/HTTP store orientation (FetchStore); local-file desktop reading still needs a file-system store (see F13). Its 0.5 fixture coverage is strong evidence 0.5 reading is achievable in a thin JS stack, but "fixtures pass" ≠ full spec coverage (uint64 labels, float dtypes, sharding end-to-end remain risk areas — see V-proposals).

**F13 — zarrita.js: minimal TypeScript Zarr implementation; supports v2 AND v3 protocols, ZEP2 sharding, multiple stores including `FileSystemStore` (local), `FetchStore`, `ZipStore`, `ReferenceStore`; zero dependencies; runs in browsers/Node/Deno.**
Evidence: S16 (README).
Implication: a plausible core for Slide Scout if built on web tech (Electron/Tauri + TS): v2+v3 in one dependency covers legacy 0.4 filesets and 0.5 filesets, with local file reading via FileSystemStore.
Transfer limits: zarrita is a Zarr layer only — all NGFF semantics (multiscales/labels/plates) live in the app or in @fideus-labs/ngff-zarr (F14).

**F14 — ngff-zarr (Fideus Labs): Python package reads OME-Zarr v0.1–v0.6 and writes v0.4–v0.6 (v0.6 = RFC-5 coordinate systems); opt-in development version `0.9.dev1` (RFC-3); TypeScript package `@fideus-labs/ngff-zarr` supports v0.4/v0.5/v0.6 for Deno/Node/browsers; `.ozx` zipped OME-Zarr (RFC-9) support; HCS plate/well support; I/O via zarrista/Rust `zarrs` or zarrita (no zarr-python dependency); 0.4 (Zarr v2) outputs stay readable by zarr-python 2 and 3, 0.5+ (v3) by zarr-python 3. Its SlicerOMEZarr extension brings local+remote OME-Zarr, labels and time series into 3D Slicer (desktop).**
Evidence: S17 (README features), S7 (SlicerOMEZarr row).
Implication: (a) a maintained multi-version reader exists per language, useful for compat testing; (b) the official spec site tops out at 0.5.2, but implementations already target v0.6/0.9.dev1 — Slide Scout should decide explicitly which NGFF versions it claims (product decision) rather than inheriting a library's ambitions; (c) SlicerOMEZarr is the nearest existing desktop analog for behavior comparison.

**F15 — napari-ome-zarr: v0.10.0 (2026-08-12) forwards NGFF axis names and units into napari layer metadata (PR #149).**
Evidence: S11 (release notes).
Implication: precedent for surfacing calibration metadata as first-class UI state; also shows the plugin ecosystem treats units/axis names as newly load-bearing.

**F16 — Community viewer-feature compatibility matrix (ome.github.io/ome-ngff-tools; tested April 2025: napari 0.5.6 + napari-ome-zarr 0.6.1 + ome-zarr 0.10.3, vizarr April 2025, webKnossos 24.11.0, OMERO with ZarrReader 0.2.0, MoBIE 6.3.1, BigDataViewer jars listed): documented real-world gaps include — Z-downsample pyramids fail in avivator+vizarr (and crash-prone in napari; wrong Z pixel size in Microscopy Nodes); `omero` colors ignored by Vol-E/OMERO, rdefs unsupported in webKnossos; non-2 downsampling factors fail in vizarr, dtype error in neuroglancer (`>u1`); v0.3 axes fail in neuroglancer and webKnossos; HCS plates fail in vtk-itk-viewer, neuroglancer, webKnossos, OMERO (and untested/missing in avivator, Vol-E, napari, MoBIE rows); bioformats2raw filesets fail in vtk-itk-viewer, neuroglancer, webKnossos, napari (#71), OMERO; multiple `multiscales` entries largely ignored (only first opened).**
Evidence: S8 (matrix rows as listed; version banner at top of page).
Applicability/limits: tested on v0.3/v0.4 sample data — no 0.5/Zarr-v3 row was observed in the retrieved portion (see unresolved U1), so it evidences NGFF-semantics gaps, NOT 0.5-specific support. Patterns transfer: pyramid irregularity, plate navigation, multi-image filesets, and rendering-metadata fidelity are the historically broken areas — exactly the areas a thin initial plan tends to assume are easy.

---

## C. Forward compatibility and ecosystem map

**F17 — RFC pipeline (from RFC-2 page nav, S9): RFC-3 "more dimensions for thee" (versions 2026-07-17, 2026-09-26), RFC-4 Axis Orientation (2024-09-13, 2025-08-05), RFC-5 Coordinate Systems and Transformations (2025-10-31 version; adopted by ngff-zarr as "v0.6"), RFC-6 Flattening the multiscales array, RFC-7 Channel provenance, RFC-8 Collections and Extensibility (v1 2026-08), RFC-9 Zipped OME-Zarr (.ozx; 3 review rounds), RFC-10 Governance/Editorial Board. RFC-2 itself: SPEC state S1 (adopted).**
Implication: 0.5 is a moving baseline. For Slide Scout the near-term relevant ones are RFC-9 (single-file `.ozx` local datasets) and RFC-5 (richer calibration) — both already visible in tooling (F14). Nothing from RFC-3..RFC-10 is an obligation for a 0.5 reader today.

**F18 — Ecosystem map (NGFF tools page, S7): viewers incl. 3D Slicer/SlicerOMEZarr, AGAVE, MoBIE, BigDataViewer (HDF5/N5/Zarr/OME-NGFF Viewer with labels support), BigVolumeBrowser, napari-ome-zarr, Neuroglancer, Odon (Rust), QuPath, Vitessce, Vizarr, Avivator, Vol-E, WEBKNOSSOS; readers/writers incl. Bio-Formats (+OMEZarrReader), BioIO/bioio-ome-zarr, iohub, ngff-zarr, ngio, ome-zarr-py, Zarr.NET; validators (see F10); rendering libraries Viv (DeckGL layers), ome-zarr.js, Pluot (Rust/WebGPU), OMEZarrTileSource (OpenSeadragon). Two compatibility surveys are linked: viewer matrix (S8) and jwindhager/ome-ngff-readers-writers (S22 — evaluation sheet hosted on Google Docs/Drive, not fetched).**
Implication: build-vs-reuse decision space is wide; ome-zarr.js / Viv / zarrita / ngff-zarr-ts are the JS-side reuse candidates; Bio-Formats/ZarrReader and Zarr.NET show non-Python/JS stacks exist for parity testing.

---

## Established obligations vs. optional/product decisions

| Area | Established (must/should, 0.5.2) | Optional / product decision for Slide Scout |
|---|---|---|
| Storage | Zarr v3, `zarr.json`, `/` chunk keys, sharding legal (F1) | Whether to also read Zarr v2 / NGFF ≤ 0.4 filesets (recommended: yes; filesets in the wild are mostly 0.4) |
| Metadata | `attributes.ome.version`, consistent per hierarchy (F2) | How to present version-mismatch/mixed hierarchies |
| Pyramids | axes rules, level order, per-level scale (+translation) semantics (F3) | Multiscale selection UI when >1 entry; level-switch policy for responsiveness |
| Calibration | axes units SHOULD (UDUNITS-2 vocabulary), `dimension_names` MUST (F4) | Unit conversion UI, uncalibrated-pixel display state |
| Rendering defaults | `omero` optional; channel color/window MUST when present (F5) | Fallback palettes/ranges when absent; rdefs honoring |
| Labels | dtypes, `labels` list, level parity, `image-label` colors (F6) | Overlay opacity/interaction, handling `properties` |
| HCS | plate/well layout and key obligations (F7) | Plate grid UI, sparse-plate rendering |
| Multi-image filesets | bf2raw layout value "3", series semantics; readers SHOULD surface >1 image (F8) | Fileset browser UX |
| Validation | JSON Schemas exist; validators exist (F10) | Whether validation runs inline or on-demand |
| Version claims | 0.5.2 is the official latest (F1) | Whether to target v0.6/0.9.dev1 features (RFC-3/5), `.ozx` (RFC-9) |

---

## Unresolved areas and dead ends

- **U1 (partial source):** The viewer compatibility matrix (S8) was display-truncated after the "multiple 'multiscales'" row; any later rows (e.g., time axis, dtypes, units) were not observed, and the matrix tests v0.3/v0.4 data only — no 0.5-specific compatibility table was found anywhere in this session. 0.5 support claims therefore rest on F12 (vizarr fixtures) and F13/F14 (library feature lists), not on a community matrix.
- **U2 (unfetched):** Contents of `0.5/examples/*.json` and the non-image schemas (plate/well/label/bf2raw) — listing only (S19). Strict-schema nuances (e.g., `strict_image` additionalProperties behavior) unverified.
- **U3 (dead end):** ome-zarr-py's NGFF-version support table not locatable: `ome-zarr-py.readthedocs.io/en/latest/format.html` → project 404; `ome-zarr.readthedocs.io/en/latest/format.html` → 404 (docs restructured; repo docs/source has no format page — S21 is only an overview).
- **U4 (dead ends, search):** DuckDuckGo HTML returned a 202 bot-challenge; Bing SERP returned 200 but organic results were not extractable from the truncated script-heavy page. No conclusions were drawn from these failures; a failed search proves only that search result.
- **U5 (unvisited):** RFC-3..RFC-10 documents (titles/status only); ome-zarr-models-py, yaozarrs, ome-ngff-validator internals; SlicerOMEZarr/Odon/QuPath/MoBIE/BigDataViewer/WEBKNOSSOS/Neuroglancer version-specific support; zarr-python releases; image.sc forum threads; the jwindhager readers/writers evaluation sheet (Google-hosted); `ome-ngff-tools` repo data beyond the rendered matrix.
- **U6 (tool boundary):** `mechanical` operations accept only workspace-file sources (URL attempts failed with `ValueError`); the spec source was therefore cached into the workspace first. The cached copy is a transcription (hash noted in acquisition.json); the authoritative hash is the one returned by `public_https_get` for S2.

## False-dismissal checks

- "ome-zarr-py has no README" — rejected: both `README.md` guesses 404'd, so the repo listing was fetched; `README.rst` exists (S5-listing analog, ome-zarr-py contents listing; S14).
- "mechanical tool failure means sources unavailable" — rejected: failures were tool-boundary (URL source disallowed); the same URLs fetched successfully via `public_https_get`.
- "ome-zarr-py doesn't support Zarr v3 because changelog pinned `zarr < 3`" — rejected as outdated: current `pyproject.toml` requires `zarr>=3.0.0` (version-qualified claim, S13 vs S12).
- "latest spec might be newer than 0.5" — checked: `/latest/` redirect targets `/specifications/0.5/index.html` (S23), repo tags top out at 0.5.2 (S3), and the `latest` symlink in the 0.5.2 tree points to `0.5` (S5).
- "vizarr's April-2025 matrix failures mean no 0.5 support" — rejected: later merged fixtures cover v0.5 explicitly (PR #333, 2026-03-17, S18); the matrix predates those changes and used v0.3/v0.4 data.

## Proposed validation (all UNEXECUTED)

- **V1 (UNEXECUTED):** Validate public 0.5 sample filesets (e.g., ome2024-ngff-challenge data referenced in S18) with ome-ngff-validator and by applying S20's `image.schema` in-process; record failure presentations for the "explain undisplayable data" requirement.
- **V2 (UNEXECUTED):** Minimal spike: open a local 0.5 fileset via zarrita `FileSystemStore`; assert `zarr.json` → `attributes.ome.version`, `multiscales` parse, `dimension_names` vs `axes` consistency, and level-path resolution.
- **V3 (UNEXECUTED):** Calibration test set: axes with units from the UDUNITS-2 list (micrometer, millimeter, second…), missing `unit`, and ratio-only scales (per F3 fallback semantics); verify displayed coordinates and the "uncalibrated" state.
- **V4 (UNEXECUTED):** Label overlay test: uint8/uint16/int64 label arrays (int64 exercises the dtype vizarr's Viv renderer lacks), `image-label.colors` rgba-alpha compositing, `source.image` path resolution including non-default paths.
- **V5 (UNEXECUTED):** HCS + bf2raw navigation test: sparse plate (declared empty rows/columns), multi-acquisition wells, and a bioformats2raw fileset; verify all images are discoverable and selectable (F7/F8 obligations).
- **V6 (UNEXECUTED):** Performance probe on a large pyramid: time-to-first-pixel and level-switch latency with chunk-level lazy reads; repeat against a sharded 0.5 array to confirm sharding-decode path.
- **V7 (UNEXECUTED):** Parity harness: run Slide Scout's reader against vizarr's PR #333 fixture set (v0.1/v0.4/v0.5 plates, wells, multiscales, labels, bf2raw, 50-channel CYX, 5D greyscale) and diff parsed metadata.
- **V8 (UNEXECUTED):** Pin reader-library behavior: install ome-zarr-py v0.19.2 and confirm empirically which NGFF versions/Zarr formats it reads (closing U3), before relying on it in any plan.

---

## Coverage statement

All brief capabilities (find images; inspect by channel/time/plane; overlay labels; calibrated coordinates; responsiveness on large data; explain undisplayable data; read-only/no mutation; compatibility and correctness) are mapped to findings F1–F18 above and to sources in `out/acquisition.json`; scheduling (initial families, actual sequence, dead ends, partial reads, unvisited leads) is in `out/scheduling.json` with immutable drafts. Every access claim traces to an actual `public_https_get` result (status/bytes/sha256 recorded); nothing was executed and no validation above has been run.
