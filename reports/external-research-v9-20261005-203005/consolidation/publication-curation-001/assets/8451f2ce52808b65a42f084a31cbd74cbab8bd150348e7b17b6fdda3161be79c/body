# Research proposal — local biomedical image review workspace (stage: research)

Candidate: research-stage native delivery, 2026-10-06. Status labels used throughout:
**[FACT S#]** = external fact backed by captured public source (see `sources.json`);
**[INF]** = engineering inference from facts; **[CHOICE]** = product/design decision we are free to make;
**[VAL-EXEC]** = check executed by this candidate (isolated component check only);
**[VAL-PROP]** = proposed validation, UNEXECUTED.

This document is the research-stage proposal. It covers the brief's minimum workflow and data
contract, an architecture with bounded alternatives, exact source pins, one fully traced
issue→fix→regression chain, an opportunity, an alternative, and a validation plan that separates
executed from unexecuted checks. It is not a claim that any full application exists or behaves as
described; nothing here establishes full-application behavior from isolated component checks.

---

## 1. Summary

We propose a small desktop application in two layers: (1) a GUI-free Python core library that owns
the project file format, bounded image access, coordinate transforms, annotations, undo, and
export; and (2) a thin Qt front end for interaction. Project data lives in a directory bundle whose
images are **OME-NGFF 0.4 / Zarr v2 stores** (copy mode) or **references to untouched original
files** (reference mode), with an always-written JSON manifest, an append-only provenance log, and
annotations stored in **float64 index coordinates with an explicit axis table and a fixed
index→physical transform convention taken verbatim from NGFF 0.4** (`physical = scale(index)`,
then `+ translation`; NGFF 0.4 §3.3/§3.4, S1). Display settings (window/level, channel visibility,
gamma, colormap) are stored as per-channel metadata that never touch sample values — the same
separation napari documents for `contrast_limits` ("the values set in the contrast limits do not
change the underlying values of the image, only the visualization of the colormap", S8). Large
images are accessed through tile/chunk windows with a capped LRU cache; no full second in-memory
copy is ever required by the design [INF, target to be verified, §10].

---

## 2. External facts (what the sources establish)

- **F1 — Display mapping is distinct from stored samples in a shipped precedent.** napari's image
  layer documentation states contrast limits "do not change the underlying values of the image,
  only the visualization of the colormap"; gamma (0.20–2.00), colormap, interpolation and blending
  are separate controls [FACT S8]. The transitional NGFF "omero" metadata likewise stores per-
  channel display state (6-hex `color`; `window` with `min/max/start/end`) as metadata, not as
  pixel data [FACT S1].
- **F2 — Out-of-core viewing of very large images is a solved, documented pattern.** napari
  accepts NumPy-like lazy arrays (dask, zarr), defers materialization until display, and
  documents browsing ">100GB of lattice lightsheet data stored in a zarr file"; for large data it
  supports multiscale pyramids and recommends explicitly setting contrast limits because
  auto-computation over big data is expensive [FACT S8].
- **F3 — nD annotation semantics with slice scoping exist in a shipped precedent.** napari shapes
  are lists of N×D vertex arrays; for a multidimensional shape to render on a view slice, "all of
  its non-displayed coordinates must match the coordinates of that view slice"; copy/paste across
  slices keeps visible-dimension coordinates and rewrites the others to the new slice. Tools are
  keyboard-bound (e.g. `p` polygon, `r` rectangle, `e` ellipse, `a` select-all-in-slice, `Esc`
  finish) [FACT S9].
- **F4 — NGFF 0.4 defines an explicit, testable axis contract.** `axes` entries MUST have unique
  `name`; SHOULD have `type` (`space`/`time`/`channel`) and `unit` (UDUNITS-2 strings such as
  `micrometer`, `millisecond`); axis length MUST equal array dimensionality; images are 2–5
  dimensional; axes MUST be ordered time → channel → space, and 3-D stacks SHOULD order spatial
  axes `zyx` [FACT S1].
- **F5 — NGFF 0.4 fixes the index→physical transform convention.** Each dataset has exactly one
  `scale` transform and at most one `translation`; "The transformations in the list are applied
  sequentially and in order" (§3.3), and "If `translation` is given it MUST be listed after
  `scale` to ensure that it is given in physical coordinates" (§3.4). So physical =
  scale·index + translation. The spec offers only `identity`/`translation`/`scale` types — no
  orientation/direction-cosine field in the parts captured [FACT S1].
- **F6 — Zarr v2 is a key/value chunk store with no transactional guarantee.** Arrays are `.zarray`
  JSON metadata plus chunk values under keys like `"0.0"` (or nested `"0/0"`); uninitialized
  chunks read as `fill_value`; groups and `.zattrs` attributes structure the hierarchy. The v2
  specification text (captured in full) describes only get/set/delete of individual keys — there
  is no multi-key transaction, atomic rename, or fsync requirement; the document is marked
  "superseded" by the latest spec [FACT S2]. Implication: **atomicity of project saves is our
  responsibility, not the storage format's** [INF].
- **F7 — A real, bounded reader exists for the formats a small team can actually test.** tifffile
  (v2026.9.20, BSD-3) reads TIFF, BigTIFF, OME-TIFF, ImageJ hyperstack, MetaMorph STK, LSM,
  NDPI, and more; image data can be read "as NumPy arrays or Zarr arrays/groups from strips,
  tiles, pages (IFDs), SubIFDs, higher-order series, and pyramidal levels"; OME-TIFF stores up to
  8-D data with OME-XML in the ImageDescription tag; ImageJ hyperstacks >4 GB keep one IFD with
  Latin-1 ImageDescription metadata. It also documents that Micro-Manager MMStack metadata "are
  often corrupted or wrong", that NDPI tag values "may contain wrong values", and that parts of
  TIFF 6 (OJPEG, color-space transforms, mixed sample types, ICC/XMP) are not implemented [FACT S10].
- **F8 — The ecosystem is actively versioned and breaking; pin everything.** ome-zarr-py released
  v0.20.1 on 2026-10-05; recent releases include breaking changes ("BREAKING CHANGE: Deprecate
  writing v01, v02 and v03" in v0.15.0; "Update ZarrTiffStore to zarr format 3 and multiscales to
  NGFF 0.5 (breaking)" in tifffile 2026.5.2; zarr v2 itself is superseded) [FACT S6, S2, S10].

---

## 3. Independently useful implementation precedents

The brief requires ≥2 precedents with their independence and mechanism explained.

**P1 — napari (viewer/runtime layer).** Independence: an end-user viewer application developed by
a different community (napari org), orthogonal to storage formats. Mechanisms contributed: (a)
the data/display separation contract for intensity mapping (F1); (b) lazy n-D array viewing with
multiscale selection (F2) — the exact interaction pattern our viewer must reproduce over chunk
windows; (c) n-D annotation scoping rules and copy-across-slices semantics (F3), which answer the
brief's "annotations belong to one slice or time point; others describe a volume" requirement with
shipped, testable behavior; (d) keyboard-first tool operation as an accessibility baseline (F3).
We do **not** adopt napari's internal architecture wholesale; we copy its *contracts*.

**P2 — OME-NGFF 0.4 + Zarr v2 + ome-zarr-py (storage/coordinate layer).** Independence: a
community storage specification (OME) and a chunk-array specification (Zarr), with an independent
Python implementation (ome-zarr-py) whose public issue history is the evidence base; none of these
depends on napari or tifffile. Mechanisms contributed: the explicit axis table and units (F4);
the fixed index→physical transform algebra (F5) that our exports can reproduce and our regression
suite can check; chunk-key addressing (F6) that gives bounded random access to a 3 GB image; and
the omero channel-window block (F1) as a ready-made display-settings schema. This is also the
interoperability opportunity (§9).

**P3 — tifffile (bounded acquisition-reader layer).** Independence: a single-maintainer reader
library with a format scope far narrower than Bio-Formats, maintained with dated revisions and
honest limitation notes (F7). Mechanism contributed: tile/IFD/strip-level reads and Zarr views of
TIFF files, which is how we plan to touch a 3 GB source through bounded windows *without
importing it first* (reference mode), plus documented per-format caveats (MMStack/NDPI
wrong-metadata cases) that directly shape our "ambiguous calibration" import flow (F7).

These three are mutually independent (application vs storage spec vs reader library) and each
contributes a different mechanism; no single one covers the brief alone.

---

## 4. Issue → fix → regression chain (fully traced)

**Failure:** ome-zarr-py issue **#122**, "write_image assumes particular axisorder", opened
2021-10-21 by k-dominik. Body: writing a `(100, 200, 1)` uint8 array with declared axes `yxc`
failed because "The `scaler`, however, will assume a certain axisorder. This leads to weird
errors that are not super obvious" [FACT S3]. This is precisely the class of silent axis-order
assumption the brief warns about (reopened projects losing calibration context, annotations
referring to the wrong plane).

**Fix:** PR **#123**, "Validate axes for writer" (will-moore), body "Fixes #122", reusing
Constantin Pape's validation code from ome-ngff-prototypes (pinned at commit
`05b55d2516941e2eaf8fa82b722cad4371f99b5f`), merged 2021-11-08T14:16:27Z by sbesson; merge
commit **`89fcd20e82d85b94923853eec5edc6abd06ef2cd`**, head `af4f882895d3a8498f3c183fa5392e727bce6285`;
2 files changed, +118/−20 [FACT S4]. The diff (a) adds `_validate_axes_names()` which rejects
axes outside the permitted per-ndim orders (e.g. 3-D must be `zyx`/`cyx`/`tyx`) **before** the
downsampling Scaler runs — the patch comment says "check axes before trying to scale" — and adds
an explicit error when x or y has size 1; (b) documents the required `(t, c, z, y, x)` order in
the writer docstrings [FACT S5].

**Regression test:** same PR adds `test_dim_names` to `tests/test_writer.py` with explicit
`pytest.raises(ValueError)` cases for `axes=None` on 3-D, length mismatch `"yx"` for 3-D,
wrong orders `"yxt"`, `["x","y"]`, `"xyzct"`, and an end-to-end `write_image(..., axes="xyz")`
failure; plus positive assertions that valid axes pass through unchanged and that 2-D/5-D axes
are auto-assigned [FACT S5]. The bug is therefore pinned by a test that fails on the old behavior
(mis-scaled/obscure error) and passes on the new one (explicit early ValueError).

**Release applicability and limits of the chain.** The fix is applicable to ome-zarr-py from the
merge commit `89fcd20e…` (2021-11-08) onward; the earliest GitHub *release object* in the repo is
tag **v0.3.1**, whose release page was created 2022-03-16 and (re)published 2024-01-17 with an
empty body [FACT S7]. I could **not** verify tag containment (i.e., that `89fcd20e…` is an
ancestor of the v0.3.1 tag) with the tools available, and I do not claim it. The chain is:
issue → PR with merge commit → regression test file diff (all captured); release attribution is
bounded to "post-2021-11-08 master, release object record sparse" [FACT S4, S5, S7].

**Lesson for our design (why this chain is consequential here):** axis order must be *validated
before any derived computation* (scaling, pyramid building, mask rasterization), not discovered
later as a subtle error; the valid axis-order set must be an explicit enumerated table (like
`_validate_axes_names`) with an auto-derivation path only where unambiguous (2-D/5-D); and every
rejected input gets a named, specific error — the pattern we adopt in §8's import gate.

---

## 5. Data contract

**5.1 Coordinate spaces (three, never conflated).**
1. *Index space* — integer/float position in the level-0 array of an image, ordered by that
   image's axis table. **Stored annotation geometry lives here, in float64** [CHOICE].
   Justification: executed check W1 shows float32 storage of a coordinate `60000.001 px`
   collapses it to `60000.0` and merges two polygon vertices 0.0003 px apart, while float64
   round-trips exactly through JSON [VAL-EXEC, witnesses W1]. This is an isolated component
   check about number encodings, not about any application.
2. *Physical space* — derived: `physical_a = scale_a · index_a + translation_a` per axis a,
   scale applied before translation, fixed by NGFF 0.4 §3.3/§3.4 [FACT S1]. Executed check W2
   shows why the order must be *recorded*: with s=0.5 µm/px, t=10 µm, i=2 px, the two orders give
   11.0 µm vs 6.0 µm (10 px apart), and inverting with the wrong order recovers index 12 instead
   of 2 [VAL-EXEC, witnesses W2]. We adopt the NGFF order as the only convention and store
   transforms as `[{"type":"scale",...},{"type":"translation",...}]` verbatim [CHOICE, S1].
3. *Display space* — pan/zoom/rotation of the viewport. Persisted per-view as UI state, marked
   `kind: "display"`, never referenced by exported coordinates [CHOICE].

Every transform stored in the project carries: axes it applies to, units (UDUNITS-2 strings,
S1), precision (all floats JSON float64), and provenance (from where: `instrument_metadata`,
`user_declared`, `derived:<op-id>`).

**5.2 Axis table (per image).** Exactly the NGFF 0.4 `axes` list (unique names; type
space/time/channel; unit; 2–5 dims; time→channel→space ordering; `zyx` for volumes) [FACT S1].
Importers must produce this table or fail loudly (§8) — the ome-zarr-py chain (§4) is the
precedent for enumerating the allowed orders and rejecting the rest before any derived compute.

**5.3 Annotation model.** Each annotation: stable id; owning image id; **scope** =
`slice(t=…,z=…)` | `volume` | `acquisition`, mirroring napari's rule that slice-drawn shapes carry
the other coordinates of their slice while volume annotations do not [FACT S3, CHOICE]; geometry
(`point`, `polygon` (N×2 float64), `mask` (own label array, NGFF image-label conventions,
S1)); style reference (reusable style table: color, edge width, opacity — napari shows
per-shape face/edge color and width properties, S3); author/timestamp; optional free-text note.

**5.4 Identity, provenance, and "what transformed".** Each source file gets `sha256`, byte size,
and original-format metadata **retained verbatim** (raw OME-XML, ImageJ property map, or the
original `.zattrs`) in the project [CHOICE; the need for verbatim retention is [INF] from F7's
documented wrong-metadata cases — corrections must never overwrite the record of what was read].
The provenance log is append-only JSON lines: every import, correction, display change (kind:
display), and geometric/resampling operation (kind: data-op, with parameters and input/output
checksums). Exports answer "what transformed and what remained unchanged" mechanically: the
export header repeats source sha256, the transform chain applied (op ids), and the transform
*not* applied to annotation coordinates (none — coordinates are exported in both index and
physical form).

**5.5 Unsupported/ambiguous cases made explicit.**
- No orientation/direction-cosine field exists in NGFF 0.4's captured axes/transform vocabulary
  [FACT S1]: we store `orientation: "unspecified"` and never fabricate direction cosines [INF].
  Records needing them are flagged in the UI (lead L2).
- Ambiguous calibration (missing `PhysicalSizeX/unit`, or formats documented to carry wrong
  metadata such as MMStack/NDPI, F7): import pauses with an explicit dialog listing original
  values; user either declares values (recorded `user_declared` with the original kept) or
  imports as uncalibrated (unit-less index space). No silent default [CHOICE, satisfying the
  brief].
- Precision policy: all stored coordinates and transform coefficients are float64 (W1); chunk
  grids are integer-indexed (Zarr v2 keys, F6).

---

## 6. Component architecture (with bounded alternatives)

Single process, two layers [CHOICE]:
- **Core library (no GUI imports):** `store` (project bundle I/O, atomic saves), `readers`
  (format gate + windowed access), `coords` (axis tables, transforms — pure functions, the only
  place transform math lives), `annotations` (model + undoable commands), `export`, `provenance`.
  Pure core because every brief obligation here is testable headlessly (reopen, precision,
  recovery); napari's own docs treat headless/console operation as first-class (S8) [INF].
- **Qt front end (PySide6):** canvas, dimension sliders, channel/window/level controls bound to
  display state; keyboard tool bindings mirroring P1's baseline (F3). Undo/redo for annotation
  edits via a command stack (undoable add/move/vertex-edit/delete); display-setting changes are
  *not* undoable history, they are settings [CHOICE].

**Bounded access and the 3 GB target.** Reference mode reads the original through tifffile's
tile/IFD/strip or Zarr-view interfaces; copy mode reads OME-Zarr chunks (keys are the unit of
access, F6, F7). One capped LRU window cache (default budget 1.5 GB, configurable; on the 16 GB
envelope this leaves headroom) feeds both the canvas pyramid level and derived computations,
which operate per-window only. *This is a design target, not a measured result*: the per-window
path is standard practice (S8, S10), but our implementation's constant factors are UNVERIFIED
[INF + VAL-PROP V3].

**Cancellation/progress.** All long operations (import copy, resample/export, cache warming) run
on worker threads with a cooperative cancel token checked per chunk/tile; progress = chunks done
/ total; UI never blocks on I/O [CHOICE]. Rationale: chunk granularity (F6) makes per-chunk
cancellation natural; correctness of results under cancellation is guaranteed because staged
outputs are discarded on cancel (§7).

**Alternatives considered (bounded).**
- *Embed/extend napari instead of building a viewer* — fastest to a working viewer (it already
  implements F1–F3), but the brief's project/recovery/identity/export obligations would live in
  our code anyway, and a napari dependency pins a large, fast-moving stack (F8). Kept as
  opportunity O2 (a napari plugin reading our bundles) rather than the minimum plan.
- *SQLite instead of JSON files for annotations* — better concurrency, but the 6-user model
  exchanges whole bundles; human-diffable JSON wins; revisit if bundle sizes hurt [CHOICE].
- *Single-file project (zip/Zarr v2 ZipStore)* — simpler exchange, but violates the
  shared-storage partial-write recovery story (F6's key/value model plus directory rename is
  easier to make crash-safe) [INF].

---

## 7. Project layout, atomicity, recovery, portability

```
myproject/                      # the exchanged bundle (a directory)
  project.json                  # schema_version, images[], annotations ref, styles, view states
  annotations.json              # float64 geometries + scopes + styles refs
  provenance.log                # append-only JSON lines
  originals/                    # copy mode: verbatim originals + sidecar index.json (sha256, size)
  data/<image>.zarr/            # copy mode: NGFF 0.4 store (.zgroup/.zattrs/axes/…, S1)
  refs/<image>.json             # reference mode: absolute+relative path, sha256, size, mtime, format
  .staging/                     # imports/exports in progress; discarded on failure
```

- **Atomic save:** manifest/annotations are written to a temp file in the same directory,
  fsync'd, then `os.replace` (atomic rename on POSIX) over the previous file; readers validate
  `schema_version` and checksum on load [CHOICE]. Necessity is external: Zarr v2 gives no
  transactional multi-key guarantee (F6), so atomicity lives at our file level [INF].
- **Chunk writes** (copy mode) go to a unique temp key then rename; an interrupted import leaves
  `.staging/import-<id>/` with a manifest fragment; on next open the app detects staging, offers
  resume or clean discard; the last-good `project.json` always opens [INF; kill-mid-save recovery
  is VAL-PROP V4, UNEXECUTED].
- **Identity of source data:** sha256 recorded at import; open-time re-verify (fast size+mtime
  check, deep hash on demand). A changed referenced file is surfaced as a red identity warning;
  annotations are never silently reinterpreted against new pixels [CHOICE; motivated by the
  brief's "do exported annotations still refer to the same image" disagreement].
- **Relocation:** reference entries store the absolute path *and* a relative path from the
  bundle; on open, a missing file triggers a relocate dialog (pick file → sha256 must match the
  recorded hash, else refuse with explanation) [CHOICE].
- **Portable bundle vs external references (the trade-off):** copy mode is self-contained and
  reopen-safe but duplicates 3 GB files across the share; reference mode avoids duplication and
  stays honest to "do not rewrite originals" but breaks when mounts differ — mitigated by the
  sha256-verified relocation above. Default: copy for images ≤ ~1 GB, reference above, user
  override at import [CHOICE].

---

## 8. Support boundary and how unsupported input fails safely

**v1 reads (testable by 6 people):** plain multi-page/tiled TIFF and BigTIFF, ImageJ hyperstack,
OME-TIFF — all via tifffile's documented reader surface (F7) — plus OME-NGFF 0.4 Zarr stores
native (F4–F6). **Explicitly unsupported in v1:** vendor containers (.czi/.nd2/.ndpi/.vsi/.lif),
DICOM, HDF5-based formats, whole-slide stitching formats (BIF/Trestle: tifffile itself does not
stitch, F7). This is a narrower promise than Bio-Formats by design; the boundary is the
maintainable one [CHOICE, justified by F7's documented per-format caveats and F8's churn].

**Failure path (project is never destroyed):**
1. Import-time rejection: format not in the gate → the file's project entry is written with
   `status: "unsupported"`, the error, and *retained* original metadata if any bytes were
   readable; the rest of the import and the project continue (per-entry isolation) [CHOICE].
2. Ambiguous-but-readable data (wrong-metadata formats, F7): §5.5's explicit correction flow.
3. Open-time unreadable referenced file (deleted/corrupted): project opens degraded — metadata,
   annotations, provenance and exports of that image remain available; the image canvas shows the
   recorded identity warning [CHOICE].
4. Export-time failure: staged output discarded; provenance records the failed op; project
   state unchanged (§7 staging) [INF].

Precedent for loud rejection before derived compute: the ome-zarr-py #122→#123 chain (§4).

---

## 9. Opportunity, alternative, and later options

**Opportunity O1 — be NGFF-native on both sides of the bundle.** Because the bundle's image
format *is* OME-Zarr 0.4 (F4–F6), every project opens in napari today, and exports interoperate
with the OME toolchain (ome-zarr-py validated writer/reader, F8). Cost: we pin a spec version and
absorb ecosystem churn (F8); mitigation: version field + conformance tests on our own fixtures
(VAL-PROP V1) and a thin internal interface so a format migration is a reader swap [INF].

**Alternative A1 — sidecar annotations next to untouched originals (no import).** QuPath-style:
project references original TIFFs in place (reference mode only), annotations in our
`annotations.json` beside them. Pros: zero copy cost, originals never touched (outside minimum
scope anyway); Cons: no portable bundle (the failure mode §7 mitigates), identity rests entirely
on the sha256+relocation flow, derived images still need somewhere to live. Offered as an import
mode toggle (it *is* our reference mode), not as the only mode [CHOICE].

**Later options (recorded, not required):** napari plugin front end (O2); NGFF 0.5+/0.6 with
multilineage axes and the translations-in-multiscales work now visible in releases (L2, F8);
zarr v3 storage migration (L10, F2/S2 "superseded"); cloud/OMERO serving of the same bundles
(NGFF's stated purpose, S1); automatic segmentation, registration, real-time co-editing — all
deferred, in `leads.json`.

---

## 10. Validation plan

**Executed by candidate (isolated component checks; receipts in `witnesses.json`).**
- **W1 [VAL-EXEC]** — float64-vs-float32 coordinate storage and JSON round-trip: `60000.001 px`
  → float32 `60000.0` (≈0.001 px error); two vertices 0.0003 px apart collide in float32;
  float64 JSON round-trips exactly. One degenerate line in the transcript (a ULP probe printed
  `0.0` because adding 2⁻⁹ to 60000.0 round-trips to the same float32 — itself confirming the
  granularity at that magnitude). Scope: arithmetic encoding only; implies nothing about any
  application build.
- **W2 [VAL-EXEC]** — transform order discriminability: s=0.5, t=10, i=2 gives 11.0 µm
  (scale-then-translate, the NGFF 0.4 convention, S1) vs 6.0 µm (reverse); wrong-order inversion
  returns index 12 instead of 2. Scope: algebra only.

**Proposed / UNEXECUTED [VAL-PROP].**
- V1: golden-bundle round-trip — create/import/annotate/save/close/reopen on a second path;
  assert float64-identical coordinates, transforms, retained original metadata (targets §5, §7).
- V2: NGFF conformance on our own writer output vs the 0.4 axes/transform MUST-rules (S1).
- V3: 3 GB bounded-access target — scripted pan/slice sweep over a 3 GB tiled TIFF and a 3 GB
  OME-Zarr with the 1.5 GB cache cap; pass = RSS ≤ ~2.5 GB, no full-array read in I/O trace.
  Currently an engineering target only (§6); napari/tifffile documentation supports the pattern
  (S8, S10) but our numbers are unmeasured.
- V4: crash/kill tests — SIGKILL during save, import and export; assert last-good manifest opens
  and staging is resumable/discarded (§7).
- V5: cancellation test — cancel mid-import; assert no partial image is registered as complete.
- V6: unsupported-input drill — .czi and corrupt TIFF import into a populated project; assert
  per-entry failure, project intact (§8).
- V7: cross-machine reopen on a clean checkout of the shared storage; identity warnings on a
  moved referenced file; relocation via sha256 match (§7).

---

## 11. Critical assumptions and unsupported cases (explicit)

- **Assumption (unverified):** tifffile's tile/IFD reading keeps RSS bounded on our 3 GB
  fixtures — documented capability (S10), our envelope unmeasured (V3 is the gate).
- **Assumption:** 6-user bundle exchange over ordinary shares has no concurrent-writer conflicts
  (one writer per bundle); concurrent writes are out of scope and detected only via checksums.
- **Unsupported in v1:** vendor formats, DICOM, HDF5, stitched slides (§8); orientation/direction
  cosines (no NGFF 0.4 field, §5.5); RGB-in-float display ranges are clipped per napari's
  documented rgb behavior only if we adopt that rule — noted, not required (S8).
- **Dependency risks:** tifffile single-maintainer (mitigation: our reader gate isolates it;
  bioio/aicsimageio listed as fallback readers in the captured related-libraries list, S10);
  ecosystem version churn (F8) handled by pins + V1/V2 conformance tests.

## 12. Incremental milestones

M0 core `coords` + axis tables + W1/W2-style unit tests → M1 bundle store with atomic manifest
saves (V4 harness) → M2 TIFF/OME-Zarr readers with the §8 gate + window cache (V3) → M3
annotations + undo + slice/volume scopes → M4 viewer shell (channels, window/level, sliders,
keyboard) → M5 exports + provenance + identity/relocation (V1, V6, V7). Each milestone ships
alone with its tests; nothing above requires a full application to be useful.

## 13. Catalogs

Sources with pins/locators/capture identities: `sources.json`. Executed checks and proposed
witnesses: `witnesses.json`. Deferred opportunities, unverified leads, unresolved dependencies:
`leads.json`.
