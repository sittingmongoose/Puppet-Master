# Proposal — Local Biomedical Image Review Workspace (research stage)

Stage: research (fresh native). Author: admitted candidate. Date: 2026-10-06.
Claim labels used throughout: **[FACT S#]** = external fact from captured public source; **[INFER]** = my engineering inference; **[CHOICE]** = product decision this team could reasonably take differently; **[W# EXECUTED]** = check I executed (receipt IDs in `witnesses.json`); **[P# UNEXECUTED]** = proposed check not run.

Evidence base (full catalog in `sources.json`): OME-NGFF 0.4 specification [S2]; napari viewer sources/tests/release tag [S3–S7, S10–S12]; QuPath repository documentation [S8–S9, S14]; the brief [S1]. All HTTP captures are exact response bytes with SHA-256 recorded at capture time.

---

## 1. Problem restatement and minimum obligations

Six researchers, shared-storage bundles, mixed instruments. Losses today: calibration context, annotation persistence across reopen, and confidence that exports still refer to the same image after transformation. The minimum workflow (brief §3, [S1]) decomposes into obligations:

- **R1** project create; import local data without silently rewriting originals
- **R2** inspectable metadata/provenance (including *original, retained* metadata when ambiguous)
- **R3** navigate: channels, window/level, slice/time; display mapping must never alter stored samples
- **R4** annotate: points, polygons, masks; per-slice/time or volume/acquisition scope
- **R5** explicit relationship between visible, stored, and physical coordinates, at reopen-safe precision
- **R6** geometric transform/resampling = distinct recorded data operation
- **R7** save/close/reopen on another machine; recoverable state after partial import, interrupted save, failed export
- **R8** export annotation table/overlay + small derived image, with honest statement of what is preserved
- **R9** undo/redo, reusable styles, keyboard operability, legible metadata/error feedback
- **R10** a declared, testable format support boundary; unsupported input fails without destroying the project

## 2. Two independently useful implementation precedents

**P-A. napari (Python/Qt n-D scientific viewer).** Independence: a research-viewer codebase in a different language and UI stack from QuPath, whose layer/dims machinery is directly visible in captured tests and release tags. Mechanisms it contributes:
1. *Per-layer display transforms and physical units as metadata, not data*: scale, translate and units live on the layer and are combined at render time; "If you do not set units, napari assumes pixels"; units do not rename axes; layers with different units still align in one world space [FACT S11]. This is exactly the R3/R5 separation (display mapping never touches samples).
2. *Axis identity as an explicit contract* — and a cautionary tale: napari's own docs carry a warning that axis-name semantics churned across 0.6/0.7/0.9 (names held only on `Viewer.dims`, then layers gained names that were ignored, then units propagated, then names propagated), with right-aligned negative indexing to align arrays of mixed dimensionality [FACT S10]. Lesson for us: fix axis identity and its propagation rules in the *file format* from day one; do not leave it implicit in in-memory ordering.
3. *A real, fully traced undo/redo chain for annotation painting* (Section 3).

**P-B. QuPath (Java desktop bioimage analysis).** Independence: an actively maintained desktop tool with a different persistence tradition; its repository documentation states its own architectural lessons. Mechanisms it contributes:
1. *Strict core/UI separation with image decoding isolated in optional extensions*: `qupath-core` and `qupath-core-processing` have no JavaFX/UI dependency; the UI jar depends on them; "ImageServer" extensions add support for image types and "Extensions are all optional; QuPath should be able to launch without them" [FACT S9]; the repo tree shows `qupath-extension-bioformats` and `qupath-extension-openslide` as separate modules [FACT S14]. This is the pattern that lets format support be a maintainable boundary (R10): the core opens projects even when an image codec is missing.
2. *Persistence honesty*: QuPath's developer notes say to avoid Java serialization ("Serialization is currently used for `.qpdata` files, but ultimately this should be removed"), to prefer JSON ("Thinking *'could I read this in Python if I wanted to?'* can be a good guide"), and to keep forward/backward compatibility in mind; its versioning policy explicitly prefers breaking a script completely over subtly changing behavior [FACT S9]. That last principle transfers directly to R8 (exports must state plainly what they preserve, and behave visibly, not silently).

**P-C (supporting standard). OME-NGFF 0.4** supplies the storage-side coordinate vocabulary both tools interoperate with (Section 4). NGFF 0.4 is pinned deliberately: the spec states "This is the 0.4 release of this specification. Migration scripts will be provided between numbered versions" and that editor's-draft data "will not necessarily be supported" [FACT S2].

These are independent because each mechanism is usable without the other: napari gives the runtime display/undo machinery, QuPath gives the process/persistence architecture, NGFF gives the on-disk coordinate contract. No single one covers the brief.

## 3. Issue → fix → regression-test chain (real, traced)

**Finding F1. napari labels-layer undo/redo: napari/napari PR #533.**
- *Change*: "add undo/redo to labels layer" by kne42, merged 2019-09-28T04:16:18Z by sofroniewn into `master` (base `dd48e8e6…`), merge commit `d09bea9c1b36ef3d78b97b64a159bc36c1b8d9b8`, milestone "0.2"; 4 files changed, +116/−15 [FACT S4].
- *Mechanism (from the merged patch)* [FACT S5]: bounded history (`_history_limit = 100`); each entry is a **snapshot of the currently displayed slice only** (`self.data[self.dims.indices].copy()`); a `_block_saving` flag is set at mouse-press and cleared at mouse-release so one paint stroke = one undo entry; changing the viewed dimensions **resets both stacks** (`_set_view_slice` clears `_undo_history`/`_redo_history`; the PR body states "the undo/redo stack is reset whenever you change the viewed dimensions"); bound to Ctrl+Z / Ctrl+Shift+Z.
- *Regression test*: `napari/tests/test_advanced.py::test_labels_undo_redo` — asserts fill→undo→redo round trip and the history-limit behavior (with limit 1, one undo works, a second undo is a no-op) [FACT S5].
- *Release applicability*: the raw file at tag **v0.2.0** contains `test_labels_undo_redo`, captured in full [FACT S6]. So the feature + test ship in the 0.2 line, matching the milestone. Limit of that link: I verified presence at v0.2.0 and at the merge commit's patch; I did not audit every later refactoring of the test's location, so I claim applicability to v0.2.0 specifically, not to today's test layout.
- *Limits of the chain (stated, not invented)*: the mechanism records only paint/fill performed through the layer's own code paths. **Direct writes** `layer.data[...] = …` (the route a plugin, e.g. a watershed split, would take) bypass history. A later proposal to fix this by overriding `Labels.data.__setitem__` — PR #3155, opened 2021-08-13 — was left as a **draft and never merged** (merged_at: null; closed 2022-06-28) [FACT S3]. I therefore claim: upstream napari *documented* this gap in a public proposal, and **no fix/regression chain exists for it**; I do not claim it was ever repaired. The PR body itself names the safer rejected alternative (`data_setitem` API) — evidence that the maintainers saw expanding the API as a real cost.
- *Transferable lesson (INFER)*: (a) undo must be **bounded and slice-scoped** to keep memory predictable on big volumes; (b) **one user gesture = one undo entry**, not one function call; (c) dimension/scope changes reset undo or must be modeled as entries themselves; (d) any write path outside the command log silently escapes undo — so our annotation store must have exactly one write path (Section 5), or we reproduce napari's gap.

## 4. Data contract

### 4.1 Coordinate spaces and their relationship (R5)

**[CHOICE]** Three named spaces, with conversions stored, never implied:

| space | definition | representation |
|---|---|---|
| `voxel` | sample indices into the source array, axis order = stored order | int64 indices |
| `physical` | per-axis affine of voxel space: scale + translation, units attached | float64, JSON numbers |
| `display` | channel visibility, window/level, zoom/pan, slice selection | view state; **never written into stored coordinates or samples** |

The voxel→physical mapping follows the NGFF 0.4 shape: axes carry unique `name`, `type` (`space`/`time`/`channel`), and `unit` (UDUNITS-2 strings); transformations are `translation` and `scale` vectors of floats, and "The transformations in the list are applied sequentially and in order" [FACT S2 §3.1, §3.3]. NGFF 0.4 supports only identity/translation/scale — **rotated or sheared stage calibration is unsupported in v1**; such inputs fail visibly at import (Section 6). NGFF restricts multiscale images to 2–5 dims, time-first then channel/custom then space axis ordering [FACT S2 §3.4]; we adopt the same canonical order for export and record the *stored* axis order of every import so nothing is silently permuted.

**Precision (executed).** Stored coordinates are IEEE-754 binary64 serialized as JSON decimal text. W1 [W1 EXECUTED, receipt `exec-x4c6a5fo`, exit 0]: for representative coordinates (including 0.1+0.2 and 0.04999999999), Python float→JSON→float round-trips **exactly**, while float32 coercion erring up to 4.0e-8 relative. Scope limits: this validates the serialization step only (stdlib `json`, shortest-round-trip repr); it does not validate other JSON writers/parsers, nor any application's persistence code. Consequence [INFER]: float32 has no place in stored coordinates or calibration; annotation JSON is human-inspectable, matching the QuPath "could I read this in Python" principle [FACT S9].

**Transform algebra (executed).** W2 [W2 EXECUTED, receipt `exec-3iboy8ea`, exit 0]: composing voxel→physical with physical→display and inverting recovers voxel coordinates to ≤4.6e-13 (pure-Python 2-D affine reference, sample points up to 4095.95 px; determinant nonzero). Scope: reference mathematics only — no GPU path, no resampling, no application code. Consequence [INFER]: storing two small affines per image (voxel→physical recorded; physical→display derived at runtime) makes "what transformed" decidable: display changes recompose the second affine and alter nothing else; a recorded resample (R6) produces a *new image entry* with its own voxel→physical affine and a provenance pointer to inputs and parameters.

### 4.2 Annotations (R4)

**[CHOICE]** Each annotation: `id` (UUID), `type` ∈ {point, polygon, mask}, `space` ∈ {physical, voxel}, coordinates as float64 arrays, `scope` ∈ {volume} | {slice: axis+index, time: index} — matching the brief's per-slice vs whole-acquisition distinction. Masks are integer-label arrays; NGFF's label layout specifies integer-only label arrays and that label dimensions match the image or are 1 where irrelevant [FACT S2 §2.1] — float masks are out of boundary. `style` is a reference into a shared style table (reusable styles, R9). Every annotation records the source-image content hash it was drawn against, so "does this still refer to the same image" is checkable, not arguable (R8, R7).

### 4.3 Provenance and identity (R1, R2, R6)

At import we record: absolute + project-relative path, file size, **SHA-256 of the source bytes**, and a verbatim copy of the parsed metadata sidecar. Originals are opened read-only and never rewritten (in-place modification out of scope per brief). Derived images are separate entries with an operation record (type, parameters, input hashes) — a distinct recorded data operation, satisfying R6 by construction. Exports carry the source hash and the exact space/units of exported coordinates, plus a generated "what this export preserves" manifest (R8) — modeled on the principle that silent behavior changes are worse than visible ones [FACT S9].

## 5. Architecture

**[CHOICE]** A small desktop app in the QuPath-shaped layering, with Python/Qt as the pragmatic language (napari ecosystem compatibility, [INFER]):

1. **project-core** (no UI): project manifest, annotation store, provenance, undo command log, export/import logic. Unit-testable headless.
2. **image-access** pluggable backends behind one interface: `open(path) → metadata, tile/chunk reader`. Supported boundary (Section 6) lives only here.
3. **view** (Qt + GPU raster): consumes tiles + view state; renders original vs derived with a visible distinction (derived views carry a border/badge and a provenance tooltip) (brief; R8/R9).
4. **project file layout**: `project.json` (manifest, versioned), `annotations/<image>.json` (append-tolerant, per-image), `derived/<id>/` (chunked store, NGFF-shaped), `originals/` copies or external references, `sidecars/<image>/` (verbatim original metadata).

**Undo/redo** follows the traced napari mechanism (Section 3), improved where napari is weak: all annotation mutations go through the command log (no public `data[...] =` escape hatch — closing the gap PR #3155 showed, [FACT S3, INFER]); bounded to N entries and per-slice snapshots for volume data; scope changes recorded as commands, not stack resets, so undo survives navigation.

**Atomic save / recovery (R7).** Save writes `project.json.tmp` → flush → `os.replace` onto the target, keeping the previous version as `project.json.bak`; annotations save per-image so one corrupt file cannot lose the project. W3 [W3 EXECUTED, receipt `exec-kvg4bgso`, exit 0] demonstrates the mechanism: after `os.replace` the temp is gone and the target is whole; an aborted save that never reaches rename leaves the previous target intact. Honest limits: no crash injection was performed (SIGKILL mid-write, full-disk, and directory-fsync durability are **[P2 UNEXECUTED]**); POSIX rename atomicity is filesystem-homogeneous (bundle must stay on one filesystem — cross-device rename would fail loudly, which is acceptable).

**Bounded access on 16 GB / 3 GB sources (brief target).** [INFER] The image-access layer exposes chunk/tile reads (NGFF/Zarr-style chunk addressing, per [FACT S2 §2]); the viewer holds a bounded tile cache plus exactly one composed render buffer; annotations are small JSON/mask structures. This is an engineering target, not evidence: the end-to-end 3 GB single-copy goal is **[P1 UNEXECUTED]**, and the specific streaming libraries to pin (e.g. tifffile/zarr-class) are an explicit unresolved dependency (L4, L7 — not captured in this stage).

**Portable bundle vs external references.** **[CHOICE]** Both, explicitly per image: `copy` (inside bundle — portable, duplicates storage) or `reference` (absolute path + SHA-256 + size). On reopen, a reference is resolved and hash-checked; on mismatch the project still opens with that image marked *missing/changed* (annotations retained, image tile area shows a placeholder) — relocation never strands the project (R7). Default: reference for sources > 256 MB, copy below, user-overridable at import.

## 6. Format support boundary (R10) and failure behavior

**Tested/maintained support set [CHOICE, bounded for a 6-person team]:**
- OME-Zarr / NGFF **0.4** stores (axes, coordinateTransformations, multiscales as specified [FACT S2]);
- plain TIFF: uncompressed or deflate, ≤5 dims, single series per file, with calibration only when unambiguous;
- PNG/JPEG: 2-D; calibration absent → explicit unit prompt (default 1 px = 1 unit, recorded as an explicit user-confirmed assumption).

**Unsupported, rejected at import with reasons [CHOICE]:** vendor microscope containers (.czi/.nd2/.lif…), per-plane exotic compressions, >5-D, rotated/sheared calibrations, ambiguous axis order that the user declines to resolve, non-UDUNITS-2 unit strings. Failure behavior: import writes nothing but a *staging record*; the error dialog lists the reason plus the retained verbatim metadata (sidecar), and offers explicit corrections (axis order, units, t-vs-z disambiguation) as a **new import decision**, preserving the original metadata copy regardless [R2]. Because format decoding is isolated in image-access backends (QuPath pattern [FACT S9]), an unknown format cannot corrupt or block the project — the project manifest remains valid and other images stay usable. Export behavior is equally explicit: annotation tables carry `space`, `unit`, `axis_order`, `source_sha256` columns; overlays ship with a sidecar text of the exact affine and units; derived exports state what they preserve (values in original units; no display LUT/window/level baked in unless the user opts in).

## 7. Workflow walk-through (minimum workflow of the brief)

create project → import (hash, sidecar, copy/reference decision; ambiguity dialog if needed) → inspect metadata (manifest view incl. raw sidecar) → navigate (channel toggles, window/level — view state only) → annotate (points/polygons/masks; styles; undo/redo) → save (atomic replace + backup) → close → reopen on another machine (hash check; missing-reference placeholders) → export table/overlay/derived image with preservation manifest → verify (hashes unchanged; transforms only in derived entries' recorded operations). Display edits demonstrably do not touch samples because samples are only readable through image-access and all write paths are the recorded operation/annotation stores [INFER, verified by design; app-level test is P4 UNEXECUTED].

## 8. Accessibility and UX obligations (R9)

Keyboard operability for all annotation tools (napari's own keybinding pattern — e.g. Ctrl+Z/Ctrl+Shift+Z bound in `keybindings.py` — is precedent [FACT S5]); every error/metadata panel as real text (screen-reader/legibility), no icon-only calibration warnings; undo/redo and visible original-vs-derived distinction as first-class UI; progress + cancel on any operation over ~1 s (tile loads, imports, exports).

## 9. Assumptions, unsupported cases, risks

- **A1 [INFER]** Chunked streaming libraries for TIFF/Zarr meeting the 3 GB target exist and are maintainable by this team — *unresolved dependency*; pin candidates in a follow-up stage (leads L4/L7). If none qualify, fallback: convert-on-import to NGFF-shaped store (explicit, recorded, original untouched).
- **A2 [INFER]** POSIX `os.replace` gives crash-atomic manifests — mechanics executed (W3); true crash/durability behavior untested (P2).
- **A3 [FACT S2]** NGFF 0.4 is a stable pin with promised migration scripts, but is explicitly *not* future-proof against editor's drafts; we pin 0.4 and treat 0.5+ as a migration, not an upgrade.
- **A4** Rotation/affine stage calibration is unsupported in v1 (NGFF 0.4 transform vocabulary has translation/scale only) — visible rejection, not silent misuse.
- **A5 [INFER]** One render buffer + tile cache fits the envelope; unmeasured (P1).
- **A6** A JSON-schema version field from v1 (QuPath's compatibility warning [FACT S9] argues for it).

## 10. Opportunity and alternative

**Opportunity.** Exporting derived images and label masks as OME-Zarr/NGFF 0.4 gives the team free interop with the existing ecosystem (napari consumes axis/units/scale metadata natively [FACT S11]; NGFF exists precisely so tools share one bioimaging layout [FACT S2]) — the review workspace stays small because round-tripping does not need custom bridges.

**Alternative (kept bounded).** If bundle portability dominates: copy *pyramidal overviews only* into the bundle (multiscale, NGFF-shaped, a few MB) while keeping full-resolution sources as external hash-pinned references. Trade-off: bundles open instantly anywhere and survive source relocation; cost is a recorded, re-derivable copy and one extra import step — acceptable because overview generation is itself a recorded derived operation (R6).

## 11. Proposed validation (all UNEXECUTED here)

- **P1** 3 GB source benchmark: peak RSS < ~1.5 GB while scrolling/annotating; cancel responds < 500 ms.
- **P2** crash-during-save test: kill -9 between temp-write and rename across 100 trials; manifest always loads (last or previous version).
- **P3** two-machine round trip: project + annotations reopen with identical coordinates (bit-equal JSON) and hash-verified sources.
- **P4** format-boundary fixtures: each unsupported class above rejected with the specified message; sidecar metadata retained byte-identical.
- **P5** undo regression suite mirroring `test_labels_undo_redo` (fill/undo/redo/limit), plus a direct-write-path test proving the escape hatch napari left (PR #3155) is closed in our store.

Executed checks are W1–W3 (Section 4/5) — isolated component checks only; none establishes full-application behavior.
