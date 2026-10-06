# Research proposal — local biomedical image review workspace (Brief A)

**Stage:** research (fresh native run). **Date of research:** 2026-10-06.
**Companion catalogs:** `sources.json` (evidence, pins, capture identity), `witnesses.json` (executed and proposed checks), `leads.json` (deferred/optional ideas).

---

## 0. How to read this document

Every load-bearing claim is tagged as one of:

- **[FACT]** — an external fact taken from a cited public primary source `[S#]`, with the exact locator (section, heading, file path, or diff hunk) pinned in `sources.json`.
- **[INFER]** — an engineering inference of mine that goes beyond any single source (applies source facts to this team's envelope).
- **[CHOICE]** — a product/design decision this team could legitimately make differently.
- **[VALIDATION]** — a check: **W1–W3 executed by candidate** (isolated stdlib-Python component checks with recorded stdout/exit; *isolated component checks do not establish full application behavior*), **W4–W7 proposed/UNEXECUTED**.

Citations use `[S#]`; each `S#` has URL, pin, capture SHA-256 and applicability in `sources.json`. Numbers in the text come from executed receipts in `witnesses.json`, never from memory alone.

---

## 1. Problem restated

Six researchers on ordinary workstations review and annotate multi-dimensional biomedical images (2D/volume, channels, time, int/float samples, physical calibration) and exchange projects over shared storage. Their three named pains map directly onto three contract gaps:

1. **Calibration context is lost** → there is no persisted, explicit relationship between user-visible coordinates, stored coordinates, and physical units.
2. **Annotation work is repeated after reopening** → there is no project/annotation store independent of the image files.
3. **Disputes about whether exported annotations still refer to the same image after transformations** → there is no recorded identity of source data and no recorded distinction between display changes and data operations.

The minimum workflow to support: create project → import (no silent rewrite of originals) → inspect metadata/provenance → navigate + display adjust → annotate → save → close → reopen on another machine → export annotation table/overlay and a small derived image → verify what transformed and what did not. In-place modification of source images is out of scope.

---

## 2. Investigated precedents and why they are independent

The brief asks for at least two independently useful implementation precedents. I selected one viewer-side and one project/annotation-side precedent; they come from different codebases, languages, teams, and problem emphases, share no code, and contribute different mechanisms.

### 2.1 Precedent A — napari (viewer side; Python/Qt/VisPy)

**[FACT]** napari describes itself as "a fast, interactive, multi-dimensional image viewer for Python … designed for exploring, annotating, and analyzing multi-dimensional images," built on Qt and VisPy `[S2, S3 header]`. Its homepage states it overlays "derived data such as points, polygons, segmentations" and annotates "using standard data structures such as NumPy or Zarr arrays" `[S13]`.

**Mechanism contributed — the layered affine transform chain.** **[FACT]** Each layer carries `scale`, `translate`, and a full `affine`; the shipped implementation composes transforms as `rotate @ shear @ scale` (`compose_linear_matrix` in `napari/utils/transforms/transform_utils.py`, tag `v0.5.0`) and broadcasts component vectors into leading dimensions ("a scale of [4, 18, 34] in 3D can be used as a scale of [1, 4, 18, 34] in 4D without modification") `[S7]`. This is exactly the representational pattern this project needs for voxel↔physical↔display mapping. **[INFER]** For this team the minimal *storage* vocabulary should be NGFF-style per-axis scale+translation `[S1 §3.3–3.4]`, with the full affine reserved for later alignment features — napari shows the affine machinery is where subtle bugs live (Section 3).

**Mechanism contributed — bounded big-data access.** **[FACT]** napari 0.5.0 rebuilt its slicing to be asynchronous ("Replace old async loading with new approach" #5816; "Add layer slicer base class for async slicing" #5170) `[S3]`. **[INFER]** Combined with zarr-backed chunk storage (§7 below), this is precedent that interactive nD viewing over chunked data is achievable with bounded memory — an architecture pattern, not a benchmark.

**Honest limitation discovered.** **[FACT]** napari 0.5.0 added `axis_labels` and `units` to layers *and stated in its own release notes*: "Currently, napari is *not* using this information, but we will in upcoming versions" `[S3 Highlights]`. **[INFER]** napari alone therefore does not solve this team's calibration-persistence problem even today; we must own the calibration data model ourselves and treat any future napari reuse as a renderer/embedding layer, not as the coordinate authority.

### 2.2 Precedent B — QuPath (project/annotation side; Java/JavaFX)

**Mechanism contributed — project directory store with external image references.** **[FACT]** A QuPath project is a directory: a `project.qpproj` JSON file where each entry has "a **serverBuilder** to create the `ImageServer`", "a unique **entryID**", and a human-readable name; per-entry data lives under `data/<entryID>/` (main `data.qpdata`, `thumbnail.jpg`, `summary.json`) `[S8]`. **[FACT]** QuPath explicitly documents the shared-drive relocation pattern: "You are working on a shared drive, and want to work with the same project across multiple computers. The paths to the images might differ for each computer. You can set the image paths within each *.qpproj* file differently…" — with a documented hazard warning about accidentally creating different images with the same IDs `[S8]`. **[INFER]** This is direct precedent both for our layout and for the relocation trap: path-only identity is fragile; content hashes must complement entry IDs.

**Mechanism contributed — export honesty.** **[FACT]** QuPath's annotation-export documentation opens with "In which format exactly?" and pins the semantics: "All of the shape export methods below define coordinates in pixel units, taking the origin (0, 0) as the top left corner of the full-resolution image," notes GeoJSON's limitation that "ellipses become polygons," and documents labeled-vs-binary export trade-offs including drawing-order wins `[S9]`. **[INFER]** The exportable artifact must carry its coordinate-space contract in-band, and the UI must state what is *not* preserved.

**Mechanism contributed — display/data separation and keyboard model.** **[FACT]** QuPath teaches LUT separation explicitly: changing the LUT changes brightness/contrast "without changing the underlying pixel values… the pixel values are the raw data in scientific imaging," warning that photo editors do not preserve values `[S10]`; it also warns "Pixel size information is **not** guaranteed to be a) present, or b) correct within a file!" with the TIFF-DPI trap and the rule "always sanity-check pixel sizes" `[S10]`. **[FACT]** QuPath ships a documented single-key tool model (Move M, Rectangle R, Ellipse O, Line L, Polygon P, Polyline V, Brush B, Wand W, Points `.`; H/A show-hide; Ctrl+S save; Ctrl+R reload; Shift+C brightness/contrast) `[S11]`, and objects "remember which plane they belong to" in z-stacks/time series `[S10]`.

### 2.3 Component precedents (smaller than whole products)

- **OME-NGFF 0.4 specification** `[S1]` — the only open, testable metadata contract that covers exactly this data shape (2–5D, axes with type/unit, per-level scale/translation, channel windowing). Key normative facts in §4.
- **tifffile** (BSD-3, version pinned 2026.9.20) `[S12]` — reads OME-TIFF/ImageJ/BigTIFF; "Image data can be read as NumPy arrays or Zarr arrays/groups from strips, tiles, pages (IFDs), SubIFDs, higher-order series, and pyramidal levels"; OME-XML lives in "the ImageDescription tag of the first IFD"; documents unimplemented TIFF6 corners (OJPEG, chroma subsampling, differing sample types) and states of Micro-Manager MMStack that "The TIFF structures and metadata are often corrupted or wrong" — all evidence for a narrow support boundary (§8). Its 2026.5.2 release notes list multiple "breaking" API changes (series callable; ZarrTiffStore moved to zarr format 3 / NGFF 0.5), justifying version pinning `[S12 Revisions]`.
- **RFC 7946 (GeoJSON)** `[S6]` — pins what GeoJSON does and does not promise (§10 below).

---

## 3. Traced issue → fix → regression-test chain (required consequential lesson)

### 3.1 Complete chain: napari axis-order/scale display bug

Every link below was captured as public bytes (hashes in `sources.json`):

1. **Issue:** napari/napari **#4926, "3D scaling does not match axis order"** — opened 2022-08-12 by Steffen-Wolf; labeled `bug`, `priority:high`; body: "Images with non-trivial scale factors are not correctly visualized if (visible) axis order is changed"; reproducer: `np.zeros([100,100,50])` with `scale=(1,1,2)`, toggle 3D, press the "change visible axis order" button; expected: "Images should be scaled correctly independently of the axis order" `[S4]`.
2. **Fix:** PR **#5004** "Fix display of order and scale combinations." The diff shows two code changes: `reorder_after_dim_reduction` was moved from `napari/components/dims.py` into `napari/utils/misc.py` and reimplemented from a *single* argsort to a **double argsort** with the comment "A single argsort works for strictly increasing/decreasing orders, but not for arbitrary orders"; and `Image._get_order` was changed to reduce the displayed dims through that rank map before transposing `[S5]`.
3. **Regression tests (in the same diff):** a new file `napari/_vispy/_tests/test_vispy_image_layer.py` with four tests, each parametrized over **every permutation** of the axis order (2D-image-in-3D, 3D-in-2D, 3D, 4D cases with non-isotropic scales), each docstring citing `https://github.com/napari/napari/issues/4926`; plus a new parametrized `test_reorder_after_dim_reduction` over monotonic and non-monotonic orders `[S5]`.
4. **Release applicability:** the napari **0.4.18** release notes list under Bug Fixes: "Fix display of order and scale combinations ([napari/napari/#5004])" (file captured at tag `v0.4.18`) `[S2]`. The 0.4.18 notes also carry sibling fixes on the same theme: "Enforce that contrast limits must be increasing (#5036)", "Fix editing shape data above 2 dimensions (#5383)", "Fix copy/paste of points (#5795)", and a new "Add cancellation functionality to progress (#5728)" `[S2]`.

**Lesson for this design.** **[INFER]** Axis-permutation plus scale composition is precisely where display/annotation code silently breaks, and the failure mode is *wrong geometry without any error*. Consequently our contract must (a) treat axis order as recorded data, never as implicit state; (b) compute coordinate mapping through one explicit rank-map + transform chain tested over **all permutations** at every dimensionality reduction (the #5004 test pattern, adopted in W3); and (c) round-trip annotations through open→save→reopen in tests, not just render them.

**Limits of this chain.** It establishes napari's history only: it does not measure our application, and the fix concerns napari's vispy display path (a different rendering strategy than ours would need). The regression tests verify internal consistency of napari's transform pipeline, not cross-application interchange.

### 3.2 Second chain (fix + regression tests; standalone issue not traced — stated honestly)

PR **#6636** "Fix decomposition function to properly work with more than 2x2 matrices" (in napari **0.5.0** release notes `[S3]`) rewrote `decompose_linear_matrix` (old code only special-cased reflections via `det<0` branch; new code normalizes per-axis signs) and added regression tests `test_decompose_linear_matrix_3d` (rotation·5 decomposes back to rotation and scale [5,5,5] with `upper_triangular=False`) and `test_affine_rotate_3d`; it also **changed an existing test's expectation** (`test_world_extent_mixed_flipped`: `_data_to_world.scale` from `(1, -1)` to `(1, 1)`), evidence the previous behavior was observably wrong `[S5b = S5 diff for 6636; S7 final code]`. **[FACT-limit]** I did not find/trace a standalone issue number for this one within this stage's budget; the chain issue→PR is therefore *not* asserted — PR+tests+release note is what is pinned. **[INFER]** Lesson: decomposition (matrix → rotate/scale/shear) is lossy-looking and version-sensitive; **store the full matrix as the authority** and treat components as derived conveniences, tested by round-trip.

---

## 4. Proposed data contract

### 4.1 Project directory layout `[CHOICE, informed by S8]`

```
myproject/
  project.json                 # manifest: schema_version, image records, sessions, styles
  annotations/<image-id>.json  # annotation documents per image (append-friendly)
  derived/<op-id>/             # app-written derived images (OME-Zarr or TIFF) + op record
  provenance.log               # append-only JSON lines of committed operations
  cache/                       # machine-local tile cache; safe to delete, never exchanged
```

**[INFER]** Separating exchanged state (`project.json`, `annotations/`, `derived/`, `provenance.log`) from machine-local `cache/` makes bundle export trivial and recovery safe. Per-entry subdirectories keyed by UUID (QuPath's `data/<entryID>` `[S8]`) are adopted for derived data.

### 4.2 Image record (in `project.json`)

- `id` (UUID), `format` (`ome-tiff | ome-zarr | tiff`), `locator` (absolute path at import **and** project-relative path when inside the project), `size_bytes`, `content_sha256` (of the file, or of the Zarr metadata root listing for OME-Zarr), `imported_at`, `imported_by` (app version).
- **Axis table** (NGFF 0.4-aligned `[S1 §3.1]`): ordered list of `{name, kind: space|time|channel, unit (UDUNITS-2 string), size, sampling (float64, unit/voxel), origin (float64)}`; canonical internal order time→channel→space(s) exactly as NGFF requires arrays to be ordered `[S1 §3.4]`. Axis order *of the file* is recorded separately as `file_axis_map`.
- `orientation_note`: free-text plus structured flip flags per axis (see §5.2 on what we deliberately do *not* promise).
- `raw_metadata`: the format's own metadata block retained verbatim (OME-XML string, ImageJ map, or `.zattrs` JSON) — this implements "original metadata retained" when the user corrects anything.
- `import_report`: per-file decisions and warnings (e.g., "unit missing → assumed micrometer, user confirmed", "channel names absent → generated").

**[FACT]** Storing sampling per level with explicit scale+translation mirrors NGFF 0.4's requirement that each dataset "MUST contain exactly one `scale` transformation" and any `translation` "MUST be listed after `scale` to ensure that it is given in physical coordinates" `[S1 §3.4]`.

### 4.3 Coordinate frames and the precision rule

Three named frames per image:

| Frame | Definition | Storage |
|---|---|---|
| **voxel** | integer indices in canonical axis order | int64 |
| **physical** | micrometer / second / channel-index, origin = first voxel center at `origin` | **float64** |
| **display** | screen pixels of the current 2D view | transient, never persisted as annotation coordinates |

Mapping voxel→physical is per-axis `physical = origin + index × sampling` (NGFF scale+translation `[S1 §3.3]`); display←data is a view transform held in the session, not in annotations. **[VALIDATION W1, executed]** With a 90° rotation, anisotropic sampling (0.104/0.104/0.400 µm) and a 250 000 µm stage offset, a voxel→physical→voxel round-trip errs **7.2e-11 voxels in float64** but **0.0253 voxels (≈2.5% of a pixel) in float32**. **[INFER]** Rule: all stored coordinates, sampling, origins, and transforms are float64; float32 may exist only transiently inside a render path. Scope limits of W1: pure-arithmetic model of a 3-axis affine; no real instrument data.

### 4.4 Annotations

Stored per image in `annotations/<image-id>.json`, one document with `schema_version` and an `annotations` array. Each annotation:

```
id            UUID
type          point | polygon | mask
coordinates   float64 array in the named frame below
space         {frame: "physical", axes: ["z","y","x"], units: ["um","um","um"]}
binding       {kind: "frame", axes: {"z": 17, "t": 0}}        # slice/time-bound
            | {kind: "volume", axes: ["z","y","x"], t: 0}     # per-timepoint volume
            | {kind: "acquisition"}                            # whole acquisition
style_ref     id into project styles (reusable annotation styles)
properties    free JSON (class, notes)
provenance    {author, created_at, app_version, source_transform_sha256}
```

**[FACT precedents]** QuPath objects "remember which plane they belong to" `[S10]`; napari release notes show the same need ("Fix editing shape data above 2 dimensions" #5383 `[S2]`). **[CHOICE]** Coordinates are stored in **physical** units, not pixels, so annotations survive display zoom and remain meaningful if the user corrects calibration (with `source_transform_sha256` recording which calibration transform they were authored against — if the calibration changes, the app can offer migration and the disagreement is explicit rather than silent).

**Undo/redo** `[CHOICE]`: command-pattern stack over annotation edits with coalescing of continuous drags; persisted as an in-session stack only (not in the project file). QuPath's restore-last-annotation shortcut (Shift+E `[S11]`) and napari's points/shapes undo fixes (`Fix copy/paste of points` #5795 `[S2]`) show both apps treat edit-history correctness as a bug-prone area; our stack operates on whole-annotation diffs, making redo trivial and the export story auditable.

### 4.5 Display settings vs data operations

- **Display-only** (never changes samples, never leaves the project as "data"): channel visibility, per-channel window/level (`start,end` within `min,max` — the exact fields NGFF's transitional `omero` block defines `[S1 §3.5]`), colormap, gamma, slice/time position. **[FACT]** QuPath's LUT doctrine: brightness/contrast changes must not touch pixel values "because the pixel values are the raw data" `[S10]`.
- **Data operations** (each a recorded, reversible-by-recompute op in `provenance.log` with input id+hash, parameters, output id+hash): resample, crop, intensity mapping to a new buffer, geometric transform. Output gets a **new image id**; the UI marks every derived view with a "derived" badge and its op chain; exports of derived data name the chain. **[FACT]** napari learned the sharp edge of blurring these categories: "Warn if float image data being saved to non-tiff" (#6884) and display fixes like "Enforce that contrast limits must be increasing" (#5036) `[S2, S3]`.

---

## 5. Architecture

### 5.1 Components `[CHOICE]`

1. **Import service** with one reader plugin per format (§8 boundary); produces an ImageRecord + capability report; writes nothing outside the project directory (staging + atomic promote, §7).
2. **Bounded array accessor**: uniform `read(region) -> ndarray` facade. OME-Zarr → zarr arrays (native chunks); OME-TIFF → tifffile tile/IFD access or its Zarr store (`return_as='zarr'`; "read a tile from the base layer" is documented usage `[S12]`); contiguous ImageJ-style files optionally memory-mapped (`memmap` documented `[S12]`). Plus an LRU chunk cache (§9).
3. **Coordinate service**: the single owner of axis tables, rank maps, and frame conversions. All other components ask it; nothing recomputes scale/order locally (the #4926 lesson, §3.1).
4. **Render pipeline**: for visible channels, fetch the view region at display resolution, apply window/level/colormap in the display path, composite; never writes samples.
5. **Annotation model + command stack**: authoritative in-memory model, emits diffs to the persistence layer.
6. **Persistence layer**: atomic writers (§7), journal, recovery scan.
7. **Export service** (§10).
8. **UI shell**: Qt-based desktop app; keyboard-first model (§11); all long operations cancellable with progress (napari added exactly this to its progress utility — "Add cancellation functionality to progress" #5728 `[S2]`).

### 5.2 Bounded alternatives considered

- **Build on napari directly as the app skeleton** — attractive (free nD rendering, chunked loading), but: axis-labels/units were only recently added and "not used" yet `[S3]`; embedding a full Qt app inside our own shell brings napari's plugin machinery; and its coordinate authority would not be ours to evolve (project files, exports). **[INFER]** Rejected for the core; kept as a lead for later "open this project in napari" interop via a reader plugin (`leads.json` L1).
- **ImageJ/Fiji or BigDataViewer as the base** — mature, but Java stack splits the small team's skills, and project/annotation persistence would still be ours. Deferred (`leads.json` L8).
- **Web viewer (vizarr-style)** — NGFF lists vizarr as a purely client-side viewer `[S1 §5]`; useful as a sharing later-step, wrong for the 3 GB-local-file desktop requirement now.
- **Single-file project (SQLite) instead of a directory** — genuinely viable (atomic transactions for free); bounded alternative kept in reserve (§7.3, `leads.json` L9). Chosen against for v1 because diffable JSON files match the team's shared-storage review habits and git-style diffing of annotation changes.

---

## 6. Minimum workflow mapped to the design

| Workflow step | Mechanism | Evidence |
|---|---|---|
| create project | `project.json` with schema_version | S8 layout precedent |
| import, no silent rewrite | readers open sources read-only; project records hash; corrections live in the project, never the file | S10 ("not guaranteed present or correct"), S12 (MMStack "metadata … corrupted or wrong") |
| inspect metadata/provenance | metadata pane shows axis table + raw_metadata + import_report | S1 §3.1 (axes contract) |
| navigate/display | slice/time widgets, per-channel window/level; display transform in session only | S10 LUT; S1 §3.5 window fields |
| annotate | physical-coordinate annotations with frame binding + styles + undo | S10 plane membership; S2 #5383/#5795 |
| save/close | atomic writes + journal (§7) | this proposal; W4 proposed |
| reopen elsewhere | hash verify + relink dialog + per-machine path table | S8 duplicate-`.qpproj` precedent + hazard |
| export | §10 exports with in-band coordinate contract | S9, S6 |
| verify what transformed | provenance.log + derived badge + export "preserves" table | §10 |

---

## 7. Crash safety, identity, relocation, bundles

### 7.1 Atomic save / recovery options `[CHOICE among two, v1 = A]`

- **A. Temp-file + fsync + rename per JSON document, manifest last.** Every document write goes to `<name>.tmp-<pid>`, flush + fsync, `os.replace` onto the target (same filesystem), then fsync the directory. `project.json` is written last per save so it commits the new generation. On open, a recovery scan deletes stale temps and, if `provenance.log` ends with an uncommitted op record, discards that op. **[INFER]** With the layered layout, an interrupted save loses at most the one document being written; annotations and manifest from the previous generation remain valid.
- **B. SQLite project file.** Transactions give atomicity across documents in one file. **[INFER]** Better crash semantics, worse diffability; kept as the fallback if field testing shows torn saves (leads L9).

**[VALIDATION W4, proposed/UNEXECUTED]** kill -9 during save on the target filesystems (ext4, NTFS over SMB), verify: old generation opens; zero-length `.tmp` leftovers cleaned; journal replay idempotent.

### 7.2 Identity of source data

**[CHOICE]** At import, record `size_bytes` + SHA-256 of the source file (for OME-Zarr: SHA-256 over the canonical listing of chunk filenames+sizes+`.zarray/.zattrs` bytes). On every reopen, verify size first (cheap), hash opportunistically in the background; mismatch ⇒ the image is flagged "source changed since import" and annotations are shown read-only until the user confirms or restores. **[FACT]** QuPath's documented hazard — duplicating project files "may inadvertently result in adding different images with the same IDs" `[S8]` — is the failure this prevents.

### 7.3 External-path relocation and the bundle trade-off

- Image records store: absolute path at import, best-effort project-relative path, and a per-machine **path-variants table** (mirroring QuPath's documented multiple-`.qpproj`-per-computer practice `[S8]`, but as data inside one file rather than multiple files).
- A **relink flow**: on open, missing files are matched by `size_bytes` then confirmed by SHA-256; the user resolves manually if ambiguous; resolution is written back as a new path variant.
- **Trade-off.** *Portable bundle* (copy images into `bundle/` or ship OME-Zarr): fully reproducible, big. *External references* (default): zero copy cost, requires the shared drive at view time. **[CHOICE]** v1 default = external references with per-image "copy into project" action; bundle export (zip of project + images + a manifest with hashes) as an explicit command. This mirrors the brief's shared-storage reality and QuPath's production behavior `[S8]`.

---

## 8. Support boundary and failure containment `[CHOICE, evidence-based]`

**In scope (tested by the team of six):**

- **OME-Zarr 0.4** (read + derived write): axes, multiscales, scale/translation, `omero` windows, labels `[S1]`.
- **OME-TIFF (single-file)** read, uncompressed/deflate/LZW tiles, uint8/uint16/int32/float32; OME-XML from the first-IFD ImageDescription `[S12]`.
- **Plain TIFF + explicit sidecar** (user-typed calibration/axes when tags are absent — the "explicit correction/import choice" path) and **ImageJ hyperstack** (`ImageDescription` metadata `[S12]`).
- 2D/3D (+t, +c), 2–5 dims total (NGFF's own envelope `[S1 §3.4]`).

**Explicitly out (fails cleanly):** vendor-proprietary containers (CZI/ND2/LIF/…), Bio-Formats-dependent reads, remote/cloud stores, RGB palettes with colorimetry claims, OJPEG and TIFF corners tifffile itself declares unimplemented (OJPEG, chroma subsampling, differing sample types, ICC/IPTC/XMP) `[S12 Notes]`, Micro-Manager MMStack (metadata "often corrupted or wrong" `[S12]`).

**Failure containment.** Import runs in a staging directory; only after a full capability report (axes resolved? units known? chunks readable?) does the import commit atomically. An unsupported file yields a recorded `failed_import` entry (format guess, reason, original bytes untouched) and the project opens normally. Ambiguous-but-plausible inputs (missing units, unknown axis letters, suspicious DPI-style calibration) never guess silently: the import dialog shows the raw metadata next to the proposed interpretation, requires an explicit accept/correct, and stores both (correction in the axis table, original in `raw_metadata`). **[FACT]** This is the documented QuPath position generalized: pixel size "not guaranteed to be present, or correct… always sanity-check" `[S10]`. **[FACT]** napari made the opposite default change for reader selection ("flip the default for the reader plugin dialog to *not* have the Remember box checked" #7016 `[S3]`) — precedent that remember-my-choice defaults on ambiguous input are a known hazard.

---

## 9. Bounded memory: the 3 GB target

**[VALIDATION W2, executed — arithmetic model only]** For a representative 2048×2048×362 uint16 volume (**2.83 GB**, chunks 64×256×256 = **8 MiB**, 512 chunks total): with 16 GB RAM, a 4 GB OS+app reserve, 512 MiB chunk cache and 64 MiB annotation budget, **free headroom is 11.44 GB**; the cache holds 64 chunks (12.5% coverage — appropriate for locality-biased navigation); navigating a 512×512 window along z touches **4 chunks (≈33 MiB working set) per step**. The envelope holds with an order of magnitude of margin **for this chunk plan**; the plan is a design parameter, and W2 must be re-run per real acquisition shape. Scope limits: arithmetic only — no decoder, no filesystem, no real I/O.

**[FACT]** The bounded-access mechanisms this plan relies on are documented behaviors, not aspirations: tifffile reads "as NumPy arrays or Zarr arrays/groups from strips, tiles, pages (IFDs), SubIFDs, higher-order series, and pyramidal levels" and shows tile-level Zarr reads and `memmap` for contiguous files `[S12]`; OME-Zarr's chunked nested layout makes individual chunks addressable `[S1 §2.1]`; napari's async slicing architecture (0.5.0) demonstrates the UI pattern `[S3]`. **[INFER]** Cancellation design: every long op (import hashing, export, resample) runs on a worker with a cancellation token checked at chunk boundaries; progress = chunks done / total, so cost is linear and stop latency ≤ one chunk.

---

## 10. Export contract — and an honest account of what is preserved

Three exports, each self-describing:

1. **Annotation table** (CSV + JSON): one row per annotation with id, type, frame binding, coordinates **in physical units with the axis/unit header row**, style, properties, source image `id + content_sha256`, and the `source_transform_sha256`. Anything that consumed a transform (e.g., areas computed under a corrected calibration) reports which calibration version it used — this is the direct answer to the team's "do exported annotations still refer to the same image after transformations?" dispute.
2. **GeoJSON**: RFC 7946 FeatureCollection with our metadata as **foreign members** (`"image": {id, sha256, coordinateSpace: {...}}`). **[FACT]** RFC 7946 fixes GeoJSON coordinates to "World Geodetic System 1984 … longitude and latitude units of decimal degrees" and removed alternative-CRS support from the 2008 spec "because the use of different coordinate reference systems … has proven to have interoperability issues," allowing alternatives only "where all involved parties have a prior arrangement" `[S6 §4]`; positions are ordered lon/lat "precisely in that order" `[S6 §3.1.1]`, exterior rings are counterclockwise `[S6 §3.1.6]`, and digit counts carry no precision meaning `[S6 §3.1.10]`. **[INFER]** Consequence, stated in the export dialog: *micrometer coordinates in GeoJSON are non-conformant*; the file targets partners who accept the prior arrangement (QuPath's own docs adopt GeoJSON as "preferred" with documented losses — "ellipses become polygons" `[S9]`). Winding order is normalized on export; the lossy cases are enumerated in the dialog before writing.
3. **Overlay PNG + derived image**: overlay rendered through the *recorded* display transform (which transform and window/level are written as a sidecar JSON); the derived small image is written as OME-Zarr 0.4 (or OME-TIFF) with full axis/scale metadata and its op record, so its `content_sha256` differs from the source by construction — the "derived" distinction survives export.

**[FACT]** QuPath's units/origin admonition — pixel units, origin at the top-left of the *full-resolution* image, "may be different from how other software expects" `[S9]` — is adopted as the template: every export states its coordinate space in-band, in the file, not just in the UI.

---

## 11. Interaction, accessibility

- **Keyboard model** `[CHOICE modeled on S11]`: single-letter tool keys (M/R/O/L/P/B/.), space = temporary pan, H/A toggle overlays, Ctrl+S save, Ctrl+R reload, Shift+C brightness/contrast, bracket keys slice/time step, Ctrl+Z/Ctrl+Shift+Z undo/redo, Esc cancels the active long op. Every pointer action has a keyboard path (annotation selection via list + arrow keys; numeric coordinate entry in a properties pane).
- **Original vs derived visibility**: persistent canvas badge ("ORIGINAL — file.tif, sha256 ab12…" vs "DERIVED — resample of …, op #14"), distinct border tint, and tooltip provenance chain.
- **Legible feedback**: metadata pane renders the axis table verbatim (names, kinds, units); errors name the file, the failing stage, and the recovery state ("project unchanged; import rolled back"); warnings are collectible in a session log. **[FACT]** Both precedents invest here: napari reworked its status bar for information presentation (#5451 `[S2]`) and QuPath's docs treat calibration sanity-checks as a user duty `[S10]`.
- **Accessibility invariants** `[CHOICE]`: full keyboard operability (no drag-only affordances), visible focus, contrast-checked annotation palettes, no color-only encoding of original/derived state, scalable UI font (napari exposed `font_size` as a setting — #6113 `[S3]`).

---

## 12. Validation inventory

**Executed by candidate** (full receipts, code, stdout, exit 0 in `witnesses.json`; all are *isolated component checks*, not application tests):

- **W1 transform precision** — float64 round-trip 7.2e-11 voxels vs float32 0.025 voxels at 250 000 µm offset → storage rule "float64 everywhere" `[FACT-of-check, INFER-of-rule]`.
- **W2 memory budget** — 2.83 GB volume, 8 MiB chunks: 11.4 GB headroom, 33 MiB working set per navigation step → chunk plan is feasible; must be re-derived per real shape.
- **W3 rank-map divergence + JSON round-trip** — reproduces the napari #5004 mechanism: single-argsort `(2,0,1) → (1,2,0)` (wrong) vs double-argsort `(2,0,1) → (2,0,1)` (identity-preserving); annotation JSON survives serialize/deserialize with exact float coordinates and a stable canonical SHA-256 (`33f43898f2dc2862…`). *This check verifies an arithmetic pattern found in napari's public diff; it does not import or test napari.*

**Proposed / UNEXECUTED** (required before any release):

- **W4** crash-safety: SIGKILL during save on ext4 + SMB/NTFS; old generation must open; temps cleaned (§7.1-A).
- **W5** 3 GB real OME-TIFF + real OME-Zarr: peak RSS < 4 GB while paging slices; cancel latency ≤ 1 chunk; measured on the target workstation class.
- **W6** cross-machine round-trip: project + annotations saved on machine A, opened on machine B with relocated paths; hash-verified relink; annotation coordinates bit-identical.
- **W7** export fidelity: GeoJSON/table reimport into a fresh project reproduces identical physical coordinates; overlay PNG pixel (0,0) maps to the documented physical origin under the recorded transform.

---

## 13. Opportunities and alternatives

**Opportunity (highest leverage).** **Adopt OME-Zarr 0.4 as the project's native derived-data and exchange format.** It is a published, community-tested contract for exactly our metadata (axes with units, per-level scale/translation, channel windows, labels) `[S1]`, multiple independent implementations exist (bioformats2raw, ome-zarr-py, vizarr, bigdataviewer-ome-zarr `[S1 §5]`), chunked layout gives us bounded access for free `[S1 §2.1]`, and writing derived images in it makes every export self-describing. **[INFER]** The team gets interop with napari/QuPath-adjacent tooling as a side effect of one format choice.

**Plausible alternative (kept bounded).** **SQLite single-file project store** replacing the JSON directory (§5.2/§7.1-B): strictly better crash semantics, worse reviewability; switch trigger = field evidence of torn saves. A second alternative — **napari as an embedded renderer** once its units support matures `[S3]` — is recorded as lead L1, not a dependency.

**Explicitly deferred** (not requirements; see `leads.json`): vendor formats via Bio-Formats, cloud/OMERO, collaboration, segmentation/registration assist, GPU compositing, web sharing.

---

## 14. Critical assumptions and unsupported cases

1. **Assumption:** the shared storage preserves renames and fsync ordering (true for local ext4/APFS; *not guaranteed* on all SMB servers) → W4 must run on the real NAS; fallback = SQLite store (B).
2. **Assumption:** tifffile's documented behaviors (tile reads, zarr store, memmap) hold for our pinned version; its 2026.5.2 release was "breaking" `[S12]` → pin exact version; W5 verifies on real files.
3. **Unsupported:** stage-scan stitched acquisitions needing per-tile translations, non-rigid calibration, arbitrary orientation matrices (only axis flips + order in v1 — full affine is a recorded op, not an import interpretation), multidimensional masks (masks are per-frame or per-volume only in v1).
4. **Unsupported:** verifying vendor-proprietary metadata correctness — we retain `raw_metadata` verbatim and require explicit user correction; we do not interpret what we cannot test `[S10, S12]`.
5. **Known non-goal:** universal format compatibility — the boundary in §8 is the promise; everything else fails loudly and safely.

---

## 15. Incremental delivery plan

- **M0 (weeks 1–3):** project.json + atomic writers + import of plain TIFF with sidecar calibration; metadata pane; W4 harness.
- **M1 (weeks 4–7):** OME-TIFF + OME-Zarr read paths, bounded accessor + cache; navigation + window/level; W2 re-run on real files; W5.
- **M2 (weeks 8–11):** annotation model (points/polygons), physical coordinates, styles, undo/redo, keyboard model; save/reopen on second machine (W6).
- **M3 (weeks 12–14):** masks, volume/acquisition bindings, provenance.log + derived ops (crop/resample) with badges.
- **M4 (weeks 15–16):** exports (table/GeoJSON/overlay/derived) + honesty dialog; W7; bundle export.

---

## 16. Source-index shortcut

S1 OME-NGFF 0.4 spec · S2 napari 0.4.18 notes · S3 napari 0.5.0 notes · S4 napari issue #4926 · S5 PR #5004 diff · S5b PR #6636 diff · S6 RFC 7946 · S7 napari transform_utils @v0.5.0 · S8 QuPath project structure · S9 QuPath exporting annotations · S10 QuPath image concepts · S11 QuPath shortcuts · S12 tifffile 2026.9.20 (PyPI metadata) · S13 napari homepage. Full pins and capture SHA-256 in `sources.json`.
