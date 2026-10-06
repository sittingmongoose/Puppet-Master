# Proposal — Local Biomedical Image Review Workspace ("ScopeBook", working name)

**Stage:** research & proposal (fresh candidate). Date: 2026-10-05.
**Basis:** development brief A only; all external evidence discovered and captured during this stage (catalog: `out/research/sources.json`, captures under the boundary tool's `public_captures/` store; executed checks: `out/research/witnesses.json`).

Every claim below is labeled:
- **[E]** external fact, tied to a pinned source `[S#]`.
- **[I]** engineering inference (my reasoning from [E]s; could be wrong, and says where).
- **[P]** product choice for this team (could be chosen differently).
- **[V]** validation — either *executed by candidate* (with receipt IDs) or **UNEXECUTED** (proposed).

This is a plan, not a built application. No claim below asserts the behavior of a complete product; executed checks are isolated component checks only.

---

## 0. Executive summary

The team needs a desktop reviewer that (1) keeps calibration and coordinate context attached to images, (2) makes annotations durable and machine-portable, and (3) is honest about what transforms do to identity. The recommended design:

1. **A project directory** (JSON manifest + per-image sidecars + append-only annotation/op journals), saved atomically via write-temp-then-`os.replace`, with a small summary sidecar written together with the main data — the pattern QuPath uses (`project.qpproj` + per-entry `data.qpdata` + `summary.json` written at the same time) [E, S9].
2. **An explicit three-frame coordinate contract** (index → physical → display) built as an ordered affine chain per axis, adopting OME-NGFF 0.4's rules: named axes with `name/type/unit`, exactly one `scale` per level, optional `translation` listed **after** scale, transformations applied sequentially in order [E, S13]. Coordinates and calibration are stored as IEEE-754 doubles serialized with full round-trip precision; the proposal includes an executed check showing JSON round-trip exactness, float32 drift under a realistic stage origin, and that transform composition order changes results [V, W1].
3. **Axis order and plane membership always explicit.** Same stored bytes read under two plausible axis orders give different samples (executed check W2) — matching the class of bug where tifffile regressed on Micro-Manager's string-typed `z-step_um` and the class where QuPath's "split annotations by lines" broke on z-stacks/time-series until the fix filtered lines to the annotation's own (z, t) plane [E, S7, S8, S15–S17].
4. **Bounded image access** through a tile/chunk image-access service (tifffile's Zarr store view of TIFF pages, or an OpenSlide-style region reader with per-level downsamples and a bounded decoded-tile cache) so a 3 GB source never requires a full in-memory copy [E, S14, S18, S19]. The 3 GB envelope is an **engineering target with proposed, UNEXECUTED validation**, not a demonstrated property.
5. **Display strictly separated from data** (window/level/LUT only affects display; QuPath's documentation states pixel values are the raw data and must be preserved unchanged) [E, S11]; geometric transforms or resampling are **recorded data operations** producing new derived images with provenance back to the original's content hash; exports state explicitly which coordinates/units/origin they preserve, in the spirit of QuPath's "units and origin" export admonition [E, S10].

Key precedents (independent, mechanisms complementary): **napari** (layer/transform/annotation model for nD microscopy) [S1–S6, S21], **QuPath** (durable desktop project + annotation persistence/export) [S7–S12], plus two components used as mechanisms rather than products: **tifffile** (TIFF/OME-TIFF reading incl. Zarr-backed tile access) [S14–S17] and **OpenSlide** (bounded region reads, level-0 reference frame, latching errors) [S18]. Standards anchors: **OME-NGFF 0.4** [S13], **Zarr v2** [S19], and nibabel's voxel/world affine explanation [S20].

The single most consequential source-backed lesson is the **tifffile issue #334 chain** — a real regression (2026.5.2–2026.9.9) caused by assuming a calibration value's type, fixed in 2026.9.15, with a public regression test asserting that Z *coordinates* are recovered from the string value (commit `ed361c5`, test `test_read_mmstack_zstep_str`). It directly motivates: validate calibration at import, quarantine what you cannot interpret, and pin regression tests on parsed *coordinates*, not just absence of crashes (Section 8).

---

## 1. Scope restated from the brief (obligations this proposal must cover)

Minimum obligations: create project; import local images without rewriting originals; inspect metadata/provenance; navigate (channels, window/level, slice, time); annotate (points, polygons, masks; slice/tp-scoped and volume/acquisition-scoped); save; close; reopen on another machine; export annotation table/overlay + small derived image; verify what transformed and what did not; explicit coordinate relationship with enough precision to reopen/export reliably; atomic save/recovery; source identity; external-path relocation; portable-bundle vs external-reference trade-off; reusable annotation styles; keyboard navigation; undo/redo; visible original-vs-derived distinction; honest export description; accessibility (keyboard operability, legible metadata/error feedback); support boundary a small team can test; unsupported inputs fail without destroying the project; cancellation + progress for long operations; 3 GB bounded-access target on an 8-core/16 GB workstation.

Explicitly deferred by the brief (recorded as leads, Section 11): collaboration beyond bundle exchange, cloud services, automatic segmentation, registration.

---

## 2. External facts discovered (with pins)

### 2.1 napari — layer/transform/annotation model and a documented transform-bug chain

- **[E, S1]** napari issue **#6631** "Transform mode problem when zoomed in on multiscale layer with `scale=` set", filed 2024-01-31 by m-albert, labeled `bug`, closed 2024-02-01. Body states: "This issue is very similar to #6382, which has been fixed by #6390", and gives a minimal reproduction (`add_image([im] + [pyramid_reduce(...)], scale=[10, 10])`, transform mode, zoom). Reporter environment: napari 0.4.19rc8. Context: reporter works on manual transform editing for `napari-stitcher`.
- **[E, S2]** napari issue **#6382** "Transform mode problem when zoomed out on multiscale layer", published 2023-10-25 by m-albert (captured page title + embedded issue JSON): "The transform box adopts a wrong shape when zooming out on a multiscale layer", with a reproduction script and environment napari 0.5.0a2.dev413.
- **[E, S3]** PR **#6390** diff (complete, 5,614 bytes): adds `Image._extent_level_data` / `_extent_level_data_augmented` and `_display_bounding_box_augmented_data_level`, and reroutes the interaction-box and bounding-box overlays to compute bounds at the **current multiscale level** (`level_shapes[self.data_level]`) instead of the full-resolution extent. The diff changes only source files — **no test file appears in the diff**.
- **[E, S4, S5]** PR **#6633** "Respect scale when render bounding box around multiscale level", body "closes #6631", labeled `bugfix`, merged 2024-02-01T07:25:30Z, milestone **0.4.19**. The complete diff (2,191 bytes) changes only `napari/_vispy/layers/base.py::_on_matrix_change`: the child-node translate is now composed through the layer transform chain's rotation/scale (`new_translate = dot(trans_rotate, translate_child - translate) / trans_scale`). **No test file appears in this diff either.**
- **[E, S6]** At tag `v0.4.19`, `napari/_vispy/layers/base.py` contains the #6633 fix verbatim (verified by fetching the raw file at that tag) — so the fix shipped in release 0.4.19.
- **[E, S21]** napari's current documentation (image layer page) describes per-image properties including contrast limits, opacity, colormaps, blending and interpolation; the docs tree includes dedicated guides for axis names, units, handedness, performance, and a "Labels" layer page (navigation captured; page content partially captured).

*Independence*: napari is a Python/Qt/OpenGL nD viewer library; its contribution here is the **coordinate model** (per-layer scale/translate/rotate/affine, world coordinates shared across layers, nD points/shapes/labels layers) and the cautionary multiscale+transform history.

### 2.2 QuPath — durable project store, annotation export honesty, plane-scoped annotation ops

- **[E, S9]** QuPath "Project structure" (docs 0.7.x): the default project is a folder with a **`project.qpproj` JSON file** (image entries, each with a `serverBuilder` that names the image-reading library, e.g. OpenSlide or Bio-Formats, plus a URI, and a unique `entryID`), plus a per-entry `data` directory containing `data.qpdata` (object hierarchy) and a `summary.json` that "should be written at the same time as data.qpdata" to allow preview "without opening the entire (possibly-large) data.qpdata file". The docs describe **duplicating the .qpproj file so image paths can differ per computer** on a shared drive — i.e., machine-specific relocation is an officially supported pattern — with a warning about IDs when re-adding images. Projects "are actually represented by a Java interface… do not have to rely on the local filesystem".
- **[E, S10]** QuPath "Exporting annotations": exports are shapes (vertices) or images (binary/labeled); **"All of the shape export methods below define coordinates in pixel units, taking the origin (0, 0) as the top left corner of the full-resolution image"** and this "may be different from how other software expects the origin and units to be defined"; GeoJSON is the preferred export ("preserves quite a lot of information"; limitation: ellipses become polygons); labeled-image export has explicit draw-order semantics (last-drawn class wins overlaps); a note explains QuPath rejects ad-hoc "XML annotations" in favor of well-defined open formats.
- **[E, S11]** QuPath "Images" concepts page: changing brightness/contrast changes the LUT **without changing pixel values** ("the pixel values are the raw data in scientific imaging. These need to be preserved unchanged"); "Pixel size information is **not** guaranteed to be a) present, or b) correct within a file" (JPEG/PNG typically don't preserve it; TIFF may carry a print-oriented DPI instead); "the pixel size is the crucial value needed to make measurements in physical units"; z-stacks/time-series have limited support: "Objects (e.g. annotations, cells) also should remember which plane they belong to."
- **[E, S7, S8]** QuPath issue **#1729** "'Split annotations by lines' does not work for z-stacks or time-series if line thickness > 0" (filed 2025-08-21, closed; title and repro captured via search API) was fixed by PR **#1730** "Fix 'Split annotations by lines' bug", body "Fixes https://github.com/qupath/qupath/issues/1729", merged 2024-12-13T06:44:39Z — wait, that merge timestamp (2024-12-13) precedes the issue's creation timestamp (2025-08-21) in the captured search metadata; the milestone on PR #1730 is **v0.6.0**. The PR diff (complete capture) changes `CHANGELOG.md` (adds the #1729 line under fixed bugs) and `PathObjectTools.splitAreasByBufferedLines`, which now filters lines to those with `roi.getZ() == line.getZ() && roi.getT() == line.getT()` before geometric subtraction. **The diff contains no test file.**
  - *Honesty note on the chain:* the issue→fix linkage is explicit and captured, and the code change is visible in the diff, but (a) I did not verify the v0.6.0 release tag contents for QuPath, and (b) **no regression test accompanies the fix**, and (c) the captured timestamps for issue #1729 (2025-08-21) vs PR merge (2024-12-13) are inconsistent — most likely the search index reflects an *edit/update* time for the issue, but I could not confirm which. I therefore treat the QuPath chain as **established for issue→fix→milestone only**, and do not lean on it for the regression-test obligation (that role is filled by the tifffile chain, Section 8). This timestamp discrepancy is recorded as an open lead (L2).

*Independence*: QuPath is a Java/JavaFX desktop application with its own project/annotation persistence; its contribution is the **project-format and export-contract** pattern, not shared code with napari.

### 2.3 OME-NGFF 0.4 — the physical-calibration representation

- **[E, S13]** NGFF 0.4 (Final Community Group Report, updated 1 October 2026; spec revision table: 0.4.0 added "multiscales: add axes type, units and coordinateTransformations", 2022-02-08):
  - Layout: Zarr v2 hierarchy; arrays up to 5-D; "the axis of type time before type channel, before spatial axes"; chunk directories nested with the terminal chunk a file.
  - **"axes" metadata**: length 2–5, MUST equal array dimensionality; entries of type space, MAY one time and one channel/custom; order MUST match array dimensions and be ordered time, channel, space; spatial axes SHOULD be `zyx` when a z-stack of `yx` planes. Axes carry `name`, `type`, `unit` (example: `t: millisecond`, `z/y/x: micrometer`).
  - **"coordinateTransformations"** (per dataset/level): list; "The transformations in the list are applied sequentially and in order"; MUST contain **exactly one `scale`** (pixel size in physical units or time duration); MAY contain exactly one `translation` which **MUST be listed after scale** "to ensure that it is given in physical coordinates"; vector length MUST equal axes length. A group-level `coordinateTransformations` MAY apply to all levels and is applied **after** per-level transforms.
  - **"omero" display metadata** (transitional): per-channel `color`, `label`, `active`, and a `window` with `min/max/start/end` — i.e., window/level is channel display metadata, stored separately from pixels.
  - **"labels" / "image-label"**: label images with per-label-value `rgba` colors and arbitrary per-label `properties`; `source.image` relative path links a label image to its source.
- *Independence*: a written specification, not a codebase; its contribution is the **data contract vocabulary** this proposal adopts (axes, per-level scale/translation, display windows, label images).

### 2.4 tifffile — reader mechanisms and the issue #334 chain (see also Section 8)

- **[E, S14]** tifffile (PyPI JSON, version pinned **2026.9.20**, BSD-3-Clause, author Christoph Gohlke): reads TIFF, BigTIFF, **OME-TIFF** ("up to 8-dimensional image data… UTF-8 encoded OME-XML metadata found in the ImageDescription tag of the first IFD defines the position of TIFF IFDs in the high-dimensional image data"), ImageJ hyperstacks, LSM, NDPI, and others; exposes **series with `axes`/`sizes`** (e.g. `series.axes == 'ZYX'`); can return image data as **Zarr arrays/groups** from "strips, tiles, pages (IFDs), SubIFDs, higher-order series, and pyramidal levels" (`imread(..., return_as='zarr')`, then `z['0'][2, 0, 128:384, 256:]` reads a single tile), and documents a tile-decode loop via `page.decode` on raw `dataoffsets`/`databytecounts`; notes explicit **non-goals** ("OJPEG compression… samples with differing types, or IPTC, ICC, and XMP metadata are not implemented") and format caveats (e.g., NDPI tags "may contain wrong values"; MMStack metadata "often corrupted or wrong"). Changelog 2026.9.15: "**Fix MMStack series when numeric Summary metadata values are strings (#334)**".
- **[E, S15]** tifffile issue **#334** "Regression in 2026.5.2: reading MMStack fails with `TypeError: bad operand type for abs(): 'str'` when `z-step_um` is a string" (filed and closed 2026-09-15; full body captured): versions affected 2026.5.2–2026.9.9, working ≤ 2026.4.11; minimal reproduction with a real Micro-Manager 1.4 file; traceback in `series_mmstack` (`coords['Z'] = (0.0, sizez * abs(zstep))`); root cause: `zstep != 0` is true for any non-empty string; explanation that Micro-Manager 1.4 writes `z-step_um` **as a JSON string** through `setAcquisitionProperty` (with the plugin code line quoted); suggested fix: `isinstance(zstep, (int, float))` type check, "matching the pattern already used for ScanImage"; sample file attached.
- **[E, S16, S17]** The repository's ATOM feed for `tests/test_tifffile.py` lists commit **`ed361c575930474938b5552c6745fbf2fa513cee`** dated 2026-09-15T15:00:19Z (issue closed 14:41Z). The commit patch (complete capture) adds test `test_read_mmstack_zstep_str` — "Test read MM v1.4 MMStack where z-step_um is JSON string. # https://github.com/cgohlke/tifffile/issues/334" — asserting `isinstance(summ['z-step_um'], str)`, `series.shape == (3, 2048, 2048)`, `series.axes == 'ZYX'`, **`series.coords['Z'] == pytest.approx([0.0, 2.9033, 5.8066])`** ("Z coordinates must be resolved from the string value '2.9033'"), array shape/dtype, and equality with `is_mmstack=False` reading; the test-file version header is bumped to 2026.9.15. The source fix itself is documented in the 2026.9.15 changelog entry [S14].
- *Independence*: tifffile contributes the **image-access mechanism** (metadata + tiled reads from the formats this team actually has) and the maintenance-history evidence; it shares no code or design authority with napari/QuPath.

### 2.5 OpenSlide — bounded access mechanics for very large images

- **[E, S18]** OpenSlide Python 1.4.6 docs: whole-slide images "can occupy tens of gigabytes when uncompressed, and so cannot be easily read using standard tools"; OpenSlide "allows reading a small amount of image data at the resolution closest to a desired zoom level". `read_region(location, level, size)` takes `location` as an `(x, y)` "top left pixel in the **level 0 reference frame**" — an explicit single reference frame across pyramid levels; `level_downsamples[k]` and `get_best_level_for_downsample(downsample)` expose per-level scale factors; `set_cache` stores "recently decoded slide tiles" (per-object cache by default); error semantics: any failure raises `OpenSlideError`, and errors **latch** ("once OpenSlideError is raised, all future operations… will also raise"); unrecognized files raise `OpenSlideUnsupportedFormatError`; `detect_format` returns `None` if unrecognized.
- *Independence*: C library with Python bindings, separate lineage from napari/QuPath/tifffile; contributes the **region-reader + bounded cache + explicit-reference-frame + fail-loudly** mechanism.

### 2.6 Zarr v2 and the voxel/affine conceptual anchor

- **[E, S19]** Zarr Storage Specification Version 2 (zarr-specs.readthedocs.io): arrays live in any key/value store; `.zarray` metadata MUST contain `zarr_format, shape, chunks, dtype, compressor, fill_value, order, filters`; optional `dimension_separator` (`"."` default, `"/"` nested); all chunks the same shape. Status: **superseded by v3** — a migration-risk fact for choosing chunked storage.
- **[E, S20]** nibabel docs "Coordinate systems and affines": an image is (data array, affine array, image metadata/header); "voxel coordinates are coordinates in the image data array"; voxel coordinates alone "tell us almost nothing about where the data came from in terms of position in the scanner"; the affine array "tells you the position of the image array data in a reference space". (Capture covers the first 32,768 bytes of an 84,712-byte response; the quoted sections are within the captured range.)
- **[E, S19-method]** Execution receipts in this stage were produced in isolated sandboxes; GitHub REST **core** API was rate-limited (60/60 used) during capture, so issue/PR evidence was gathered via the **search** API (10-request budget), raw `raw.githubusercontent.com`, `patch-diff.githubusercontent.com` `.diff`/`.patch` endpoints, and GitHub's server-rendered pages. This is recorded because it explains why some evidence is `.diff`/raw-file based rather than timeline-API based.

---

## 3. Engineering inferences [I] (each traceable to the [E]s above)

- **I1 (from S1–S6).** Display-side geometry (overlays, transform boxes) on multiscale + scaled layers is a repeatable bug habitat: two user-visible bugs (#6382, #6631) in the same code area within ~3 months, the second explicitly a recurrence in a case the first fix did not cover, and **neither fix PR included a test**. Inference: a reviewer must keep a small, explicit transform-chain core with contract tests written against stored numbers (not screenshots), and any transform that *changes stored geometry* must be a separate recorded operation — never a side effect of display state.
- **I2 (from S13, S19, W2).** Ambiguity of axis order and per-level scale is the largest silent-corruption risk for calibration context loss (the team's stated pain). The NGFF rules (explicit axes; exactly one scale per level; translation after scale; sequential application) are a *sufficient* representation for 2D/volume/channel/time data this team holds, and are simple enough for a 6-person team to implement and test. General affines/direction cosines (nibabel/NIfTI-style) are **out of the minimum scope**, recorded as a lead (L5), because NGFF 0.4 itself restricts to scale+translation.
- **I3 (from S7, S8, S11).** Annotations need an explicit plane anchor (`z`, `t`) or an explicit "applies to volume/acquisition" flag; geometric tools must scope their inputs by that anchor. QuPath's split-by-lines bug is exactly the failure of an operation that ignored plane membership; QuPath's own docs already state objects "should remember which plane they belong to."
- **I4 (from S9, W3).** A directory-of-JSON project with atomic replace + a summary sidecar is implementable and testable by a small team, avoids single-file database corruption modes, keeps the project greppable/diffable, and matches a proven desktop-app pattern (QuPath). SQLite is a viable alternative (Section 6.3) but buys concurrency features the team's bundle-exchange workflow doesn't use.
- **I5 (from S10, S11).** Export honesty is a documentation problem as much as a format problem: pin exports to a stated frame ("full-resolution pixel coordinates, origin top-left") and say so in the exported file itself, plus a human-readable "what this export preserves" sheet. QuPath's caution that pixel size may be absent or wrong (JPEG/PNG; DPI-in-TIFF) means import must record *where calibration came from* (parsed vs user-supplied vs absent), not just its value.
- **I6 (from S14, S18, S19).** Bounded access on this format stack should come from existing tile/chunk readers (tifffile's Zarr view of TIFF pages; NGFF/Zarr chunks; an OpenSlide-style region reader for tiled TIFF), wrapped in one in-house interface with an LRU cache and cancellation — not from a bespoke IO layer. Zarr v2's supersession by v3 is a dependency risk to manage by pinning and by keeping the in-house interface narrow (I9).
- **I7 (from S15, S17).** Instrument metadata cannot be trusted for type or units (string-typed `z-step_um`; NDPI "wrong values" per tifffile's notes). Import must type-check and normalize calibration values, and record parse provenance; regression tests must assert the resulting *coordinates*, as `test_read_mmstack_zstep_str` does.
- **I8 (from S1–S5, S10).** "Does the exported annotation still refer to the same image after transformation?" is answerable only if identity is content-addressed: record source `sha256+size` at import and have derived images carry parent identity; the dispute dissolves into checking the provenance chain (W4 demonstrates the identity/relink mechanics).
- **I9 (from all).** The four independent precedents (napari: view/transform model; QuPath: project/annotation persistence; tifffile: readers; OpenSlide: bounded region access) contribute **complementary mechanisms with no shared lineage**; none alone is a template for the whole tool, which is why the architecture composes them behind in-house interfaces.

---

## 4. Product choices [P] (decisions for this team; alternatives noted)

- **P1. Language/stack:** Python 3.12+ with PySide6 (Qt) for the desktop shell; **no GPU requirement in v1** (GPU remains an optional acceleration path). Rationale: same language as tifffile/zarr tooling [S14, S19]; Qt gives keyboard accessibility primitives; the team can test and maintain this. *Alternative:* embed napari as the canvas (Section 6.3) — rejected for v1 because it imports napari's transform/overlay behaviors (the exact area with the #6382/#6631 history) as a black box the team cannot easily fix, but kept as a lead for a later "power view" mode (L6).
- **P2. Project format:** directory project (P2a) as primary; a "bundle" is a zip of that directory (P2b). Layout sketch:

  ```
  myproject.scopework/
    manifest.json          # schema version, images[], styles[], view settings
    images/<entry-id>/     # per-entry sidecars: meta.json (verbatim original
                           #   metadata + parse report), display.json, thumbnail.png
    annotations.jsonl      # append-only journal of annotation ops (create/edit/delete)
    ops.jsonl              # recorded data operations (transform/resample/crop)
    exports/               # generated artifacts (never inputs)
    .tmp/                  # in-flight atomic writes; cleaned at startup
  ```
- **P3. Sources are never rewritten.** Import copies nothing by default ("linked" mode: manifest references absolute/relative paths + `sha256+size`); "bundled" mode additionally copies sources under `bundle/`. In-place modification of source images is out of scope (per brief).
- **P4. Masks** (raster annotations) are stored as chunked label arrays beside the project (Zarr v2 directory store, pinned layout per S19), not embedded in JSON; vector annotations live in `annotations.jsonl`.
- **P5. UI:** single-window, dockable panels (image list, metadata/provenance inspector, layers/channels, annotation styles, status/log). Every panel reachable by keyboard; a persistent status bar shows cursor position in **all three frames** (index, physical µm, display px) with units spelled out.

---

## 5. Data contract (the core of the proposal)

### 5.1 Axes and coordinate frames

Each image entry stores an **axes descriptor**, one entry per array axis, NGFF-0.4-style [S13]:

```json
{"axes": [
  {"name": "t", "type": "time",    "unit": "second"},
  {"name": "c", "type": "channel"},
  {"name": "z", "type": "space", "unit": "micrometer"},
  {"name": "y", "type": "space", "unit": "micrometer"},
  {"name": "x", "type": "space", "unit": "micrometer"}],
 "axis_order_in_file": ["t","c","z","y","x"]}
```

- **[P]** `axis_order_in_file` is stored even when identical to the descriptor order — the executed check W2 shows the same stored samples read as CZ vs ZC give different channel values, so order is never inferred silently.
- Three frames, related by an ordered transform chain (nibabel's voxel→world concept [S20], napari's data→world scale/translate [S21], NGFF's scale-then-translation [S13]):
  1. **index frame** — integer/float positions in array coordinates (what annotations store);
  2. **physical frame** — per-axis `scale` (e.g., 0.101 µm/px, 2.9033 µm/z-step) then `translation` (stage origin), applied in that order [S13];
  3. **display frame** — window/level/LUT (per channel, `min/max/start/end` vocabulary from NGFF "omero" [S13]) and view zoom/pan; **display transforms never write back to samples** (QuPath's LUT separation, stated as "pixel values are the raw data" [S11]).
- **[P]** All coordinates, scales, translations stored as JSON numbers (IEEE-754 double, full round-trip precision — W1 shows exact JSON round-trip; float32 intermediate math drifts ~1.2 nm per operation at a 100,000 µm stage origin, and composition order changes results: scale∘translate ≠ translate∘scale — so the chain order is fixed and recorded).
- **[P]** Per-multiscale-level scale is stored per level (NGFF requires exactly one scale per dataset/level [S13]); annotations always live in **level-0 index coordinates** (the OpenSlide "level 0 reference frame" convention [S18]).

### 5.2 Annotations

```json
{"op": "add_polygon", "id": "b3f1…-uuid4", "ts": "2026-10-05T22:59:00Z", "author": "kas",
 "image": "entry-7f2a", "anchor": {"kind": "plane", "z": 4, "t": 0},
 "coords_index_frame": [[12.5, 9.0], [40.0, 9.0], [40.0, 33.5]],
 "style": "tumor-margin-red", "note": "…", "provenance": {"view_state_rev": 118}}
```

- **[P]** Anchors: `{"kind":"plane","z":..,"t":..}` (slice-scoped), `{"kind":"volume"}`, `{"kind":"acquisition"}` — implementing I3; every geometric tool scopes by anchor (the #1729/#1730 lesson [S7, S8]).
- **[P]** Styles are named, reusable records (color, stroke width, fill alpha, z-order) referenced by id; changing a style does not rewrite annotations.
- **[I]** Undo/redo = replay of the append-only journal with inverse ops; journals double as the recovery log (Section 5.5). Masks get their own chunked store with per-edit journal entries.
- **[I]** Reopen-on-another-machine works because (a) the manifest is JSON (readable anywhere), (b) missing paths trigger **relink by sha256+size** (W4: a renamed, mtime-changed copy relinks correctly; identity is the hash, path is a hint), and (c) annotations are in level-0 index coordinates, which are machine-independent.

### 5.3 Source identity, relocation, bundles vs references

- **[P]** At import, record `{path, sha256, size, mtime_at_import, format, parser, parse_report}`. Hash+size is identity [I8]; W4 executed check demonstrates rename/relocation/mtime-change survival and relink-by-content.
- **[P]** Trade-off, made explicit per entry: **linked** (small project dir; requires the external file at open time; relink flow handles moves; matches QuPath's per-machine `.qpproj` duplication pattern [S9]) vs **bundled** (source copied inside the project; large but self-contained; the brief's "portable bundle"). The manifest records the mode; conversion is an explicit command.
- **[P]** Derived images (from recorded ops) carry `parent: {sha256, entry}`; a derived image is never re-derivable ambiguity-free unless its op record (parameters, resampling kernel, target grid) is complete — ops are therefore recorded in `ops.jsonl` with all parameters.

### 5.4 Import: support boundary and quarantine

- **[P]** v1 readers: (1) OME-TIFF and TIFF/ImageJ-hyperstack via tifffile [S14] (axes/sizes from `series.axes`; calibration from OME PhysicalSize* or ImageJ spacing/unit; **typed and sanity-checked**, I7); (2) Zarr/OME-NGFF stores via zarr (v2 layout pinned [S19]); (3) plain 2D PNG/JPEG via Pillow **flagged "no calibration in file"** (QuPath's warning that such formats typically do not preserve pixel size [S11]) with a mandatory user-confirmed pixel size or an explicit "uncalibrated" state.
- **[P]** Explicitly unsupported in v1 (recorded, not silently attempted): proprietary vendor slides (CZI/VMS/MRXS/…), DICOM series, files relying on tifffile's documented non-goals (OJPEG etc.) [S14]. This is the testable support boundary.
- **[P, I7]** Unsupported or ambiguous input → **quarantine flow**: `detect` first (OpenSlide-style explicit detection, returns not-supported instead of crashing [S18]); the entry is created with `status: quarantined`, **verbatim original metadata** stored in `meta.json`, a legible parse report (what failed, what was ambiguous — axis order? unitless scale? string-typed number?), and an explicit correction dialog (choose axes order / supply units / force generic TIFF reading). The project manifest write is the *last* step of import, so a partial import cannot corrupt the project (additive design + W3 atomicity). Errors latch for that entry (OpenSlide's latching-error semantics as a model [S18]) instead of poisoning the session.

### 5.5 Save, close, recovery

- **[P]** All manifest/annotation writes: serialize to `.tmp/…`, `os.replace` onto the target; per-file atomicity demonstrated by W3 (interrupted save left the previous complete state intact; stale partial temp detected and discarded at startup; completed save atomically replaced the old file). Journal files append (append is atomic for practical record sizes on local POSIX; fsync before replace for the manifest).
- **[P]** A `summary.json` per image entry (entry id, name, shape, axes, thumbnail ref, annotation count, last-opened) is written **together with** each entry's main data — the QuPath mechanism — so the project list renders without opening big files [S9].
- **[I]** Recovery = "last complete manifest + journal replay"; worst case the user loses the last unsaved edits, never the project.

### 5.6 Exports and what they preserve

- **[P]** Annotation table (CSV/JSON): every row carries `image_entry_id`, `image_sha256`, `axes`, `anchor{z,t}`, coordinates in **stated units and stated origin**, style id, note. The file embeds a `provenance` header mirroring QuPath's honesty pattern: "coordinates are in level-0 pixel units, origin = top-left corner of the full-resolution image" — QuPath states exactly this for its exports and warns other software may assume differently [S10].
- **[P]** Overlay PNG: rendered at a recorded downsample; header JSON records downsample, window/level used, and source hash — this is a **derived view**, marked as such in the UI and in the file.
- **[P]** Derived image export (small): produced only through a recorded op; export report lists exactly what transformed (samples, grid) and what did not (annotations, source identity), directly answering the team's "does the annotation still refer to the same image" dispute via the provenance chain [I8].

---

## 6. Architecture

### 6.1 Components

1. **ImageAccessService** — opens an entry, exposes `read_tile(plane_key, tile_key) → ndarray` and level/pyramid info; implementations: `TiffTileSource` (tifffile zarr view / page decode [S14]), `ZarrTileSource` (zarr v2 [S19]); LRU decoded-tile cache with a configurable byte budget (default 2 GB; 16 GB machine target: cache + one display plane + headroom < RAM, no second full copy of the 3 GB source); cooperative cancellation tokens; progress callbacks per tile (I6, OpenSlide mechanisms [S18]).
2. **MetadataImporter** — format detect → parse → normalize → `parse_report`; quarantine path (5.4).
3. **ProjectStore** — manifest + sidecars + journals; atomic save/recovery (5.5).
4. **AnnotationStore** — journal replay, spatial index for hit-testing, undo/redo stack; masks via chunked store (P4).
5. **DisplayPipeline** — channel selection, window/level/LUT per channel (NGFF "omero" window vocabulary [S13]), plane navigation; renders **original** vs **derived** with a visible badge + distinct border (brief obligation; P).
6. **OpEngine** — executes recorded data operations (rotate/flip = lossless metadata-level ops; resample = new chunked array + full op record); refuses ad-hoc pixel mutation of originals.
7. **Exporter** — table/overlay/derived-image per 5.6, with embedded "what is preserved" sheet.
8. **Shell/UI** — Qt panels, keyboard map, status bar (P5), legible error surfaces from parse reports.

### 6.2 Why this composition

Each mechanism is adopted where a precedent proved it in production: transform/annotation model shaped by napari's layer design *and its bug history* [S1–S6]; project persistence by QuPath's format [S9]; tile access by tifffile/OpenSlide [S14, S18]; contract vocabulary by NGFF [S13]. Nothing depends on napari or QuPath at runtime (P1) — they are design precedents, not dependencies.

### 6.3 Bounded alternatives (decided against for v1, revisitable)

- **Embed napari as the canvas** (alternative to components 5 + parts of 1): fastest route to a capable viewer; costs: Qt event-loop integration, and inheriting the multiscale+transform overlay behaviors documented buggy twice in early 2024 [S1–S6] — we would not control the fix cadence. **Kept as lead L6** (a secondary "napari mode" for advanced rendering).
- **Single-file SQLite project** (alternative to P2): atomic transactions out of the box, but opaque to diff/backup tooling, and our concurrency need is ~zero (bundle exchange, single writer). Directory-JSON + `os.replace` meets the obligation with fewer moving parts (W3).
- **General affine/direction-cosine coordinate system** (beyond scale+translation): more faithful for tilted volumes (nibabel/NIfTI world [S20]), but exceeds NGFF 0.4's scale+translation contract [S13]; deferred (L5) with the explicit note that axes fields must then be versioned.

---

## 7. Performance & responsiveness plan (engineering target, not evidence)

- **[P]** Bounded access for the 3 GB target: tiles/chunks only; a full plane of a 3 GB source at 8-bit RGB (e.g., 40k×25k) is read as ~1–4 MB tiles; the display plane at reduced level when zoomed out (OpenSlide `get_best_level_for_downsample` semantics [S18]; tifffile pyramidal levels [S14]).
- **[V-P1, UNEXECUTED]** Benchmark: open a ≥3 GB OME-TIFF on the 8-core/16 GB envelope; measure (a) peak RSS < ~6 GB, (b) time-to-first-plane < 2 s from OS page cache, (c) pan/zoom jitter < 100 ms with warm cache, (d) cancel latency < 250 ms during bulk pre-fetch. **No component in this stage has been run against real 3 GB data; this target is currently unsubstantiated.**
- **[P]** Long operations (import hashing, resample, export) run on worker threads with progress (per tile/plane) and cooperative cancel checkpoints; UI thread does no disk IO beyond atomic manifest writes.
- **[V-P2, UNEXECUTED]** Interrupt tests: kill -9 during save/import/export; verify recoverable state per 5.5 on relaunch.

---

## 8. Issue→fix→regression-test dossier (required consequential lesson)

**Primary chain (complete, all legs pinned): tifffile #334.**

1. **Public issue:** cgohlke/tifffile **#334**, "Regression in 2026.5.2: reading MMStack fails with `TypeError: bad operand type for abs(): 'str'` when `z-step_um` is a string" — filed & closed 2026-09-15; full reproduction, traceback (`series_mmstack`: `coords['Z'] = (0.0, sizez * abs(zstep))`), root cause (`zstep != 0` true for non-empty strings), affected versions (2026.5.2, 2026.5.15, 2026.6.1, 2026.7.14, 2026.9.9 fail; ≤ 2026.4.11 fine), cause of the string (Micro-Manager 1.4 `setAcquisitionProperty` writes `z-step_um` as a decimal **string**, with the writing plugin line quoted), and a suggested `isinstance` fix [S15].
2. **Fix:** release **2026.9.15** changelog: "Fix MMStack series when numeric Summary metadata values are strings (#334)" (captured in the pinned PyPI metadata for 2026.9.20) [S14]. (The maintainer commits directly; no PR exists — applicability is pinned by release + test commit, not by a PR.)
3. **Regression test:** commit **`ed361c575930474938b5552c6745fbf2fa513cee`** (2026-09-15T15:00:19Z, ~19 minutes after the issue closed; found via the `tests/test_tifffile.py` ATOM feed [S16]) adds `test_read_mmstack_zstep_str`, which (a) cites the issue URL, (b) asserts the metadata really is a **string**, (c) asserts parsed series properties (`shape (3, 2048, 2048)`, `axes 'ZYX'`), and (d) asserts **`series.coords['Z'] == pytest.approx([0.0, 2.9033, 5.8066])`** — the Z *coordinates recovered from the string value* — plus equality of pixel data with `is_mmstack=False` [S17].
4. **Applicability & limits:** the regression bites tifffile 2026.5.2–2026.9.9 and is fixed in 2026.9.15 (per changelog [S14]); the test commit is dated within the 2026.9.15 dev cycle (its test-file header bumps to 2026.9.15 [S17]). I did not fetch the source-fix commit hash for `tifffile.py` itself (the maintainer's history is dense; the changelog + test commit pin the release); the fix's *presence* in ≥2026.9.15 is documented, not re-verified by running the library. **Limits of the chain:** no linked PR (direct-commit workflow); the exact source commit hash is unpinned; behavior claims are the maintainer's and reporter's, not executed here.

**Secondary chains (established with stated limits):**
- **napari #6382 → PR #6390** (multiscale transform box; fix shipped; **no test in the diff**) and **#6631 → PR #6633** (same code area, `scale=` case; merged into milestone 0.4.19; fix verified present at tag `v0.4.19` [S6]; **no test in the diff**). The recurrence *is* the lesson: a fix without a contract test covering the neighboring parameter (`scale=`) re-broke [I1]. Release applicability: 0.4.19 contains the fix (verified at tag); affected range: everything before it containing the overlay code (not exhaustively bisected — stated honestly).
- **QuPath #1729 → PR #1730** (plane-scoped line filtering for split-by-lines; milestone v0.6.0; **no test in the diff**; issue-vs-merge timestamp inconsistency in captured metadata recorded as L2) [S7, S8].

**Design defenses adopted from these chains:** (1) import-time type/unit validation with quarantine [I7]; (2) plane-scoped geometry ops [I3]; (3) contract tests on parsed coordinates and transform math (W1/W2 style) for every importer and op; (4) treat display-adjacent geometry as suspect until tested with scaled + multiscale combinations [I1].

---

## 9. Accessibility & operability [P]

- Full keyboard operability: navigation (plane/step, zoom presets), tool switching, annotation accept/cancel, panel focus cycling, all exposed in a shortcuts dialog (QuPath publishes a shortcuts reference — pattern, not dependency [S12]); no pointer-only interactions.
- Legible feedback: parse reports and errors rendered as structured text (field names, offending values, suggested corrections), not modal-only toasts; screen-reader labels on all controls; unit-bearing status bar (5.1); high-contrast theme option; minimum font sizes configurable.
- Metadata inspector always shows the **verbatim original metadata** alongside the normalized view, with per-field provenance (parsed-from-file vs user-supplied) — supporting the "unsupported/ambiguous shown clearly" obligation.

---

## 10. Validation summary

**Executed by candidate** (isolated component checks; receipts in `witnesses.json`; none establishes whole-application behavior):
- **W1** `exec-tria9pbb` — JSON/float64 coordinate round-trip exact for all tested values; float32 path drifts (1.19×10⁻³ µm at 100,124.6 µm); scale∘translate ≠ translate∘scale ((14,6) vs (24,6)).
- **W2** `exec-x2fpceqe` — same stored samples read as `CZ` vs `ZC` give different values (10 vs 1) for the same (c,z) query.
- **W3** `exec-_fe0rayi` — interrupted save leaves prior complete project state; stale partial temp detectable; clean save via `os.replace` atomically supersedes.
- **W4** `exec-y9ke719k` — identity by sha256+size survives rename/relocation/mtime change; relink-by-content finds the moved file; (first run `exec-8zodkcc4` had an ordering bug — original-missing checked before removal — superseded by the rerun, both retained).

**Proposed / UNEXECUTED** (design and pass criteria stated in `witnesses.json`): P1 3 GB bounded-access benchmark; P2 kill-during-save/import/export recovery; P3 second-machine reopen with relink; P4 NGFF export round-trip read by an independent reader; P5 export coordinate spot-check against a QuPath-produced GeoJSON; P6 plane-scoped op property test (split/clip ops never leak across (z,t)).

---

## 11. Opportunities and alternatives (deferred, with leads)

- **Opportunity O1 — OME-NGFF export/import as the interoperability boundary** [S13]: exporting projects' images + label images to NGFF makes annotations convertible and future-proofs storage; deferred because write-side support adds a testing burden the team cannot yet fund (L1).
- **Opportunity O2 — assisted segmentation later** (e.g., StarDist/InstanSeg-style models; QuPath's docs treat deep learning as an extension area [S12]): recorded as lead L7 with the boundary that any model output enters as *derived* labeled images with provenance, never as silent auto-annotations.
- **Alternative A1 — napari-based viewer mode** (L6), **A2 — SQLite project store** (6.3), **A3 — registration/cloud collaboration** (out of minimum scope per brief; L8/L9).
- Preserved smaller leads: GeoJSON RFC 7946 position-precision rules before finalizing the annotation-table format (L3); Zarr v3/sharding migration strategy (L4); NIfTI-style direction cosines (L5); vizarr/bigdataviewer-ome-zarr as read-side references (L10).

## 12. Critical assumptions and unsupported dependencies (explicit)

1. **Single-writer assumption** on a project directory; bundle exchange instead of concurrent editing (brief-sanctioned). Concurrent writes are unsupported and unprotected beyond atomic-rename sanity.
2. **tifffile and zarr pinned versions** are critical dependencies; both have breaking-change histories (tifffile 2026.5.2 "breaking" churn [S14]; Zarr v2 superseded by v3 [S19]). Mitigation: pin + narrow in-house interface + contract tests; a reader regression like #334 is assumed possible again (I7).
3. **JSON manifest scale**: vector annotations in JSONL are fine at research scale (10⁴–10⁵ ops); raster masks must not go in JSON (P4). If a project outgrows this, migration to SQLite (A2) is the fallback.
4. **POSIX atomicity of `os.replace`** is assumed (W3 run on Linux); Windows semantics (rename-over-existing) need a platform check before shipping — proposed check P2c, UNEXECUTED.
5. **3 GB bounded-access target** is unsubstantiated until P1 runs (Section 7). If tifffile's zarr view cannot hold the target, the fallback is an OpenSlide-style custom tiled-TIFF reader over `page.dataoffsets`/`decode` [S14, S18].
6. **GPU absence** accepted for v1; large-plane rendering may need downsampling strategy choices that P1 must exercise.
7. Unverified-by-execution: all statements about third-party software behavior (napari/QuPath/tifffile/OpenSlide) rest on the cited public documentation/issues/commits captured in `sources.json`, not on running those tools here.

---

## Source index

Full catalog with capture identities in `out/research/sources.json`. Inline keys:
[S1] napari issue #6631 · [S2] napari issue #6382 · [S3] napari PR #6390 diff · [S4] napari PR #6633 record · [S5] napari PR #6633 diff · [S6] napari v0.4.19 `_vispy/layers/base.py` (tag fetch) · [S7] QuPath issue #1729 record · [S8] QuPath PR #1730 record+diff · [S9] QuPath "Project structure" (0.7.x docs) · [S10] QuPath "Exporting annotations" · [S11] QuPath "Images" concepts · [S12] QuPath docs index (0.7.0) · [S13] OME-NGFF 0.4 spec (2026-10-01 update) · [S14] tifffile 2026.9.20 PyPI metadata + changelog · [S15] tifffile issue #334 · [S16] tifffile `tests/test_tifffile.py` ATOM feed · [S17] tifffile commit `ed361c5` patch · [S18] OpenSlide Python 1.4.6 API docs · [S19] Zarr v2 storage spec · [S20] nibabel "Coordinate systems and affines" · [S21] napari image-layer docs page (partial capture).
