# Research proposal — local biomedical image review workspace (Brief A)

Stage: research (fresh ER9 role). Date: 2026-10-06. This document is the standalone research-stage deliverable; catalogs are `sources.json`, `witnesses.json`, `leads.json` in this directory.

Evidence labeling used throughout:
- **[FACT]** — read directly from a captured public primary source (capture SHA-256 given in `sources.json`).
- **[INFER]** — engineering inference by the candidate from those facts; not itself evidenced.
- **[CHOICE]** — a product decision this team could reasonably make differently.
- **[CHECK-EXEC]** — executed by candidate this session (receipt id given). **[CHECK-UNEXECUTED]** — proposed, never run; labeled UNEXECUTED.

No evaluator-executed receipts were provided at this stage. This is a research plan, not a built application; nothing here establishes full-application behavior.

---

## 1. Product thesis and scope

A desktop workspace for 6 researchers that keeps **original image files immutable**, stores **annotations and view state in a separate, versioned project store**, and makes the **pixel→physical→display coordinate chain explicit and float64-exact** so a project reopened on another machine refers to the same image the same way. The three observed pain points map one-to-one onto mechanisms:

1. "Lose calibration context" → import preserves the original metadata verbatim *and* extracts an explicit, editable calibration record (origin, axis order, sampling, units) that is shown, not assumed. [CHOICE]
2. "Repeat annotation work after reopening" → annotations live in the project store, keyed to source identity (content hash), not to the file's current path. [CHOICE]
3. "Disagree whether exported annotations still refer to the same image" → every export embeds the source digest and the coordinate-space declaration; a verification procedure recomputes both. [CHOICE]

Out of minimum scope: cloud services, multi-user concurrent editing, automatic segmentation/registration, in-place modification of source images, universal format compatibility. [CHOICE]

## 2. Source-backed findings that shape the design

### F1 — Bounded access to large TIFF-family data is an already-solved component problem [FACT]
tifffile (version **2026.9.20**, README captured, `sources.json` S1) documents reading image data "as NumPy arrays or Zarr arrays/groups from strips, tiles, pages (IFDs), SubIFDs, higher-order series, and pyramidal levels", and its Zarr interface example reads a **single tile** from a pyramidal OME-TIFF: `z['0'][2, 0, 128:384, 256:].shape  # read a tile from the base layer`. It also documents `memmap` for contiguous data. This is the mechanism that satisfies the 3 GB bounded-access target without a second full in-memory copy: the viewer requests only visible tiles; the OS page cache + a small LRU tile cache hold working set. [INFER]

The same README documents calibration carriers: OME-TIFF writer metadata `PhysicalSizeX`/`PhysicalSizeXUnit` (µm) and `TimeIncrement`; ImageJ hyperstack `resolution=(1.0/2.6755, ...)`, `spacing`, `unit`, `finterval`. TIFF `XResolution` (tag 282) inspection is shown directly. Calibration is *available* for supported formats but is expressed in at least three different conventions (OME-XML, ImageJ metadata, TIFF tags) — a normalization layer is required. [INFER]

**Support-boundary evidence (failures that must not destroy a project):** the README states exactly what is *not* implemented ("OJPEG compression, chroma subsampling without JPEG compression, color space transformations, samples with differing types, or IPTC, ICC, and XMP metadata are not implemented"), that Micro-Manager MMStack "TIFF structures and metadata are often corrupted or wrong", that Hamamatsu NDPI "BitsPerSample, SamplesPerPixel, and PhotometricInterpretation tags may contain wrong values, which can be corrected using the value of tag 65441", and that NDTiff pyramids "Version 0 and 1 series, tiling, stitching, and multi-resolution pyramids are not supported." Axis ambiguity is real even in supported files: the README example shows a plain multipage TIFF whose series axes come back as `'QYX'` — an **unidentified dimension 'Q'**.

### F2 — napari's layer model keeps data→world transforms explicit and versioned in code [FACT]
At pinned merge commit `f9322732ce6118b9020c946465246e6e1139b38a` (PR #3203, capture S5), napari's `test_labels.py` constructs layers with explicit `scale=(1, 2, 1, 1)`, `translate=(5, 5, 5)` — per-dimension, signed sampling and origin — and asserts world-vs-data extent through a shared helper `check_layer_world_data_extent(layer, extent, (3, 1, 1), (10, 20, 5))`. A regression test in the same file cites upstream issue #2967 ("See the GitHub issue for more details: https://github.com/napari/napari/issues/2967") for scale/translate being padded to the correct dimensionality. Two lessons transfer: (a) per-axis `scale`/`translate` (and generally an affine) belong on the *layer*, not the file; (b) transforms regress silently and need coordinate round-trip tests. napari's own docs for this were not captured this session (404s recorded in `leads.json` L1/L2) — this finding is pinned to the code/tests, not the docs. [FACT + limit]

### F3 — Consequential issue→fix→release→test chain: undo history must store **copies**, not references [FACT — full chain]
This is the required deep chain, established end-to-end from captures S2–S6:

- **Design context (2019–2021):** issue #474 "Every GUI action in napari should be undoable." (open, 2019-08-12) and issue #2579 "Undo/ Redo & Macro Recording" (open, 2021-04-20) discuss recording old/new values in an evented model; #2579 explicitly warns the approach "might lead to a memory explosion for our `data` properties which can be large arrays." The labels-layer-specific undo/redo shipped earlier via PR #533 (merged 2019-09-28, milestone 0.2), whose body states the stack "is reset whenever you change the viewed dimensions" and that it is bound to Ctrl+Z / Ctrl+Shift+Z.
- **Failure:** PR #3203 "Ensure we save a *copy* of existing value for undo" (opened 2021-08-19 by jni) describes the bug: `_save_history((slice_coord, self.data[...], new_label))` stored the *fancy-indexed* array, which NumPy returns as a copy — but other array backends "specifically, tensorstore arrays … return a reference, so undoing reduces to 'set layer.data[index] to layer.data[index]'", i.e. **undo silently becomes a no-op and user edits cannot be reverted**.
- **Fix:** merged 2021-08-20T03:37:03Z by sofroniewn; merge commit `f9322732ce6118b9020c946465246e6e1139b38a`; head `a42730cc71e7c45f81f6dbd249fc68f43512eb92`; 1 file changed, +12/−2. The diff (capture S4) changes both `fill()` and `paint()` in `napari/layers/labels/labels.py` to save `np.array(self.data[...], copy=True)`.
- **Release applicability:** release **v0.4.11** (published 2021-09-03T00:59:21Z, tag target `35d196f6…`; capture S6) lists under Improvements: "Ensure we save a copy of existing value for undo (#3203)". The same release lists the adjacent fixes "Bug fix for undo history in 3D painting (#3154)" (no-op undo item at drag start when the drag begins outside the volume) and "Update new label action to work with tensorstore arrays (#3153)". The 0.4.11 milestone (id 28) closed 2021-09-07 with 217 closed issues.
- **Regression tests at the merge commit:** `napari/layers/labels/_tests/test_labels.py` at `f9322732…` (capture S5) contains (a) the parametrized `test_undo_redo` (brush sizes × {fill, erase, paint} × preserve-labels × n-edit-dims) which performs an edit, asserts `layer.data` equals the pre-edit array after `undo()` and the post-edit array after `redo()` — covering exactly the `fill`/`paint` paths the fix touched; and (b) `test_fill_tensorstore`, which opens a real tensorstore array backed by an on-disk zarr file and checks `fill()` correctness — the storage class whose reference-return behavior triggered the bug.
- **Limits of the chain (stated, not invented):** the #3203 diff itself adds **no new test** (1 file, `labels.py` only). `test_undo_redo` predates the fix (it exists in the tree at the merge commit; I did not establish its introduction commit), and `test_fill_tensorstore` asserts the fill *result*, not undo-history copy semantics — so a **dedicated** regression test for reference-vs-copy undo is **not established** by my evidence. Anyone reusing this lesson should add their own test with a reference-returning array wrapper, exactly because stock NumPy fancy indexing hides the bug. [FACT + INFER]

**Lesson adopted for this proposal:** the annotation undo/redo command stack must snapshot **immutable copies of previous values** (or inverse ops) at edit time, treat every array-like backend as potentially reference-returning, reset or scope the stack when dimension context changes, and carry a test with a deliberately reference-returning fake backend. Related: #2579's memory warning means undo granularity must be per-vertex/per-patch deltas, never whole-layer copies for large arrays. [INFER]

### F4 — OME-NGFF 0.4 defines the axes/transform vocabulary to borrow [FACT]
The NGFF 0.4 spec (capture S7, §2.1–§3.4) fixes: arrays "MUST be up to 5-dimensional with the axis of type time before type channel, before spatial axes"; axes names/types/units are declared per image ("axis names are arbitrary"); `coordinateTransformations` (§3.3) and `multiscales` (§3.4) metadata describe scale/translation per level; labels volumes carry the same dimensionality as the image with size 1 on irrelevant dimensions — a clean, existing convention for "annotation scoped to one slice vs the volume": set the t/z extent to 1 (or record scope explicitly). We adopt the *vocabulary* (axes: name/type/unit; transforms: scale+translation; JSON metadata next to chunked arrays) without adopting cloud Zarr as the mandatory project store. [FACT + CHOICE]

### F5 — Coordinate storage precision [CHECK-EXEC]
Executed check `exec-jehhegi9` (see `witnesses.json` W1, exit 0): storing a physical position `231000.004 µm` (motorized-stage origin + 4 nm feature offset) in IEEE-754 float32 yields `231000.0` — **the entire 4 nm offset is lost** (float32 ulp at that magnitude is 2⁻⁶ µm = 15.6 nm); the pixel index 2²⁴+1 collapses to 2²⁴; the float64 value JSON-round-trips exactly (CPython `json` emits shortest-repr). Consequence: all stored coordinates, calibration and transforms are float64; JSON serialization is safe for exact round-trip; float32 is acceptable only for GPU upload. [CHECK-EXEC; scope: arithmetic demonstration in an isolated sandbox, not any application's storage behavior]

## 3. Two independently useful implementation precedents

**P1 — napari (viewer process model: layers, explicit transforms, edit history).** Independence: a Qt/vispy *application-layer* project; its contribution is not file I/O but the **coordinate and editing model** — per-layer scale/translate/affine with world vs data coordinate spaces (F2) and a values-not-references undo history hardened by a real failure (F3). Mechanism contributed: (i) transform metadata on the annotation/layer object, not the image file; (ii) undo as snapshot-of-values with backend-agnostic copy semantics; (iii) scoping of undo to dimension context (PR #533).

**P2 — tifffile (storage/access layer: format-specific bounded I/O and metadata extraction).** Independence: a pure-Python *library* with C-extension-adjacent concerns, no GUI, unrelated codebase and release cadence (2026.9.20) versus napari's app layer; it fails and evolves for different reasons (format quirks, e.g. MMStack corruption, NDPI wrong tags). Mechanism contributed: (i) per-tile/per-page random access through a Zarr-array facade (F1) — the concrete way to meet the 3 GB target; (ii) a maintained, tested normalization point for OME/ImageJ/plain-TIFF calibration and for *documented, bounded* unsupported cases.

The two are complementary by construction: P2 supplies bytes + raw metadata; P1's lessons govern what we *record* about those bytes. A defect in either cannot silently mask the other: calibration comes from P2 but is displayed as P1-style explicit per-axis values the user can correct before import commits. [INFER]

## 4. Proposed architecture (components)

Single-process desktop app (PySide6/Qt front end), with strict model/service separation so the model is testable headless. [CHOICE]

- **C1 Source Reader.** Wraps tifffile. Opens files read-only; exposes `series → axes string → tile(chunk) reads`; never opens files for writing. Reads pages/IFD metadata + OME-XML/ImageJ JSON verbatim.
- **C2 Import Verifier.** One transaction per image: parse metadata → propose normalized calibration (axis names, order, units, sampling, origin) → **show the proposal** → on ambiguous/missing items (e.g. axis `'Q'`, missing unit, conflicting OME vs ImageJ spacing) open an explicit correction dialog listing raw values with file/byte locators → user accepts/edits/rejects. On reject: nothing is written to the project except an optional "rejected imports" note; source untouched. Raw metadata blob is always retained verbatim in the project regardless of the user's corrections. [FACT basis: F1 ambiguity evidence; CHOICE: interactive correction]
- **C3 Coordinate Service.** Single owner of the mapping chain `annotation space → source voxel index → physical (mm/µm) → world/display`. Stored as: declared axes `(name,type,unit)` (NGFF vocabulary, F4) + float64 origin vector + float64 per-axis spacing + optional float64 4×4 affine for rotated/sheared stage data; display window/level/zoom live in **Display State**, never here.
- **C4 Annotation Store.** Typed records: point / polyline / polygon / mask-raster. Fields: `id`, `kind`, `image_id`, `space` ("voxel" | "physical"), `scope` = {whole_volume | timepoint[t] | slice[z,t] | plane set} (NGFF size-1 convention available for raster masks, F4), `coords: float64`, `style_id`, `properties`, `created/modified`, `author`. Vertex edits go through C5.
- **C5 Edit History.** Command/snapshot stack per project. Every edit stores **deep copies** of prior values (F3 lesson) plus inverse deltas for large rasters (patch coordinates + before-values only, bounding-box scoped). Stack resets on dimension-context change (napari PR #533 behavior). Bounded memory via max-entries LRU.
- **C6 Display Controller.** Consumes tiles from C1 through an LRU tile cache (worker threads, cancellable reads, progress for sequential scans); applies channel visibility + window/level as pure view transforms; renders "ORIGINAL" vs "DERIVED" badges from provenance metadata (C7), never from user memory. Keyboard-first navigation and full keyboard operability of tools (accessibility requirement).
- **C7 Ops Journal & Derived Store.** Any geometric transform / resample / crop is a **recorded operation** `{op, params float64, inputs (digests), output_id, timestamp}` writing a derived image into the project store (never over the source). Derived images carry their provenance chain so the UI can badge them and exports can describe them honestly.
- **C8 Persistence (atomic) & Export.** See §6/§7.

Threading: all file I/O and long ops on worker threads with cooperative cancellation tokens; UI stays responsive; every long operation is cancellable and reports progress (brief obligation). [CHOICE]

## 5. Data contract (project layout)

```
project.qproj/            (a directory; portable bundle = this directory + optional originals/)
  manifest.json           schema_version, generation counter, image table, styles, view presets
  annotations.json        C4 records (float64)
  ops.jsonl               C7 operation journal (append-only)
  originals/              OPTIONAL copied-in source files (see §7 trade-off)
  derived/                C7 outputs (chunked TIFF or Zarr), each with sidecar provenance
  raw_metadata/           verbatim metadata blobs per image (importer + captured bytes)
  tmp/                    staging for in-flight atomic writes
```

Contract rules: [CHOICE, informed by F1/F4/F5]
1. `manifest.json` names each source by **content identity**: `sha256`, byte size, importer name, and the source-relative or absolute path recorded for relocation hints — identity is the hash, not the path (relocation-safe).
2. All coordinates/calibration/transform numbers are **float64 in JSON**; display-only values may be reduced precision at render time only.
3. Every image entry carries `axes: [{name,type,unit}…]`, `origin`, `spacing` (or `affine`), `calibration_source` ("ome_xml" | "imagej" | "tiff_tags" | "user"), and `calibration_confidence` flag if user-corrected.
4. Raw metadata is retained verbatim; user corrections are additive overlays, never destructive edits of the raw blob.
5. Display state (window/level, LUT, channel visibility, current slice/time) is project state but is **structurally separated** from data records — it cannot be applied to stored samples by construction.
6. Schema versioning with forward-compatible reading: unknown annotation `kind` or `space` values are loaded, displayed as inert entries, and never dropped on re-save.

## 6. Minimum workflow coverage (step → mechanism)

| Workflow step | Mechanism |
|---|---|
| create project | `manifest.json` generation 0 (C8) |
| import without rewriting originals | C1 read-only open; import transaction (C2); originals never opened for write |
| inspect metadata/provenance | raw blob viewer + normalized calibration panel (C2/C3), shows source and confidence |
| navigate/adjust display | C6 tiles + Display State; window/level math applied to *display buffers only* |
| annotate | C4 records in voxel or physical space; scope per record |
| save/close/reopen elsewhere | atomic writes (§7); hash-based identity; relocation UI if paths change |
| export table/overlay + small derived image | C8 export: annotation table embeds `source_sha256`, axes, space, transform digest; derived image written as OME-TIFF with calibration tags (tifffile writer, F1) |
| verify what transformed vs unchanged | verification procedure §8 |

## 7. Atomicity, recovery, identity, relocation, bundles vs references

- **Atomic save:** write `tmp/<artifact>.new`, fsync, `os.replace` onto the target (atomic on POSIX; same-volume Windows caveat noted), manifest written **last** with an incremented generation counter. [INFER — standard pattern; no dedicated public source captured this session, recorded as lead L4]
- **Recovery:** on open, if a newer `.new` artifact than the manifest exists or generation is inconsistent, offer "recover to last complete generation"; interrupted imports leave an `ops.jsonl`-journaled partial state that is either completed or rolled back; failed exports leave project untouched (export builds fully in `tmp/`, then renames into place).
- **Partial import:** staged into `tmp/` + journal; manifest entry added only after the source hash is verified post-copy; a crash before commit leaves no manifest entry → next open ignores/scraps orphans after user confirmation. [CHOICE]
- **Identity:** SHA-256 of source bytes computed at import (also a progress-reportable stream). Re-open checks hash (size check first for speed); mismatch → warning banner listing which annotations now reference a changed image.
- **Relocation:** manifest stores both relative hint paths and hashes; on miss, user resolves path once per distinct file; hash confirms the match.
- **Portable bundle vs external references:** copying a 3 GB original into every bundle is wasteful; referencing shared-storage paths breaks mobility. Proposal: per-image user choice at import (default **reference** for files >256 MB, **copy-in** below), with a "make portable" command that copies referenced files in. Trade-off stated explicitly: bundles with copies are self-contained and reproducible but duplicate storage; references save space but break silently when mounts change — mitigated by hash-matched relocation, not eliminated. [CHOICE]

## 8. Export honesty and verification

Exports state what they preserve:
- **Annotation table (CSV+JSON):** per row — annotation id, kind, scope, coordinate space, float64 coordinates in *both* voxel and physical, source file name, `source_sha256`, axes declaration, `transform_digest` (SHA-256 of the canonical transform JSON), app+schema version. What it does NOT preserve: display window/level, styles beyond style_id (styles exported in a sidecar), rendering artifacts.
- **Small derived image (OME-TIFF):** written via tifffile with `PhysicalSizeX/Y` + units and a description embedding provenance (op chain ids, source digest); the derived file is a *snapshot* — further source corrections do not propagate, which the UI says in plain language.
- **Verification check (proposed):** re-hash the source; recompute the declared voxel→physical mapping against the export; confirm `transform_digest` matches the project's current transform; report "identical / transformed / source-changed". **[CHECK-UNEXECUTED W3]**

## 9. Support boundary (testable by a small team)

In (first version, all exercised by tifffile and testable with generated fixtures): classic TIFF / BigTIFF, multi-page series, tiled+pyramidal OME-TIFF, ImageJ hyperstack, tifffile-`shaped` JSON-header series; integer + float samples; 2D–5D (t,c,z,y,x). Explicitly out (documented from F1): OJPEG, chroma-subsampled-without-JPEG, per-sample mixed types, IPTC/ICC/XMP; MMStack and NDTiff pyramids read-only-at-best or rejected; anything unknown → rejected at import with the reason and raw metadata shown; **never** a partially-mutated project (C2 transaction). DICOM, proprietary whole-slide vendor formats: out of boundary, lead L9. [FACT boundary from S1; CHOICE of the cut]

Unsupported-input failure contract: import fails *closed* (no project mutation), a legible dialog shows (a) what was detected, (b) exact unsupported property, (c) retained raw metadata, (d) an "import anyway as opaque 2D image with unknown calibration" escape hatch that records `calibration_confidence=unknown` and renders without physical units. [CHOICE]

## 10. Accessibility and interaction

Keyboard operability: all tools, channel toggles, slice/time stepping, zoom/pan presets reachable without mouse; documented single-key navigation; visible focus; high-contrast annotation styles; status bar echoing live physical coordinates (from C3) and units; errors and metadata rendered as selectable, screen-reader-legible text (0.4.11 shipped "Make notification text selectable (#3310)" — same spirit, F3 release evidence). Reusable named styles (color, stroke width, point size) stored in the manifest and referenced by id. [CHOICE]

## 11. Opportunity and alternatives

- **Opportunity (deferred):** adopt OME-Zarr (NGFF) as the derived-image store, reusing tifffile's Zarr facade (F1) and NGFF's axes/transforms vocabulary (F4) so derived outputs are readable by the wider ecosystem. Justified later, not required for v1. [CHOICE]
- **Alternative rejected for v1, kept bounded:** build the viewer on napari as an embeddable component (its transform/undo machinery is exactly F2/F3). Rejected because shipping a Qt app inside our own shell still requires our own project format, import transactions, and verification; borrowing the *mechanisms* (documented here) is lower-risk than a framework dependency for a 6-person team. Revisit if scope grows. [CHOICE]
- **Alternative annotation persistence:** NGFF `labels` raster volumes instead of JSON vector records (F4). Kept as the representation for *mask* annotations only; vectors stay JSON for diffability and precision (F5).

## 12. Proposed validation plan

- **W1 [CHECK-EXEC]:** float32-vs-float64 coordinate storage discriminator — executed this session, receipt `exec-jehhegi9`, exit 0, results in `witnesses.json`. Scope: isolated arithmetic; proves the *numeric* claim only.
- **W2 [CHECK-UNEXECUTED]:** 3 GB bounded-access benchmark — stream a synthetic tiled BigTIFF (~3 GB, e.g. 40k×40k uint16), assert peak RSS < ~1.5 GB and tile latency < 100 ms warm, with cancel mid-scan. UNEXECUTED.
- **W3 [CHECK-UNEXECUTED]:** export round-trip — export table, mutate nothing, re-run §8 verification; expect "identical"; then rotate the image (recorded op) and expect `transform_digest` change with source digest stable.
- **W4 [CHECK-UNEXECUTED]:** atomicity kill test — SIGKILL during save at randomized offsets; assert manifest generation invariant and recovery success across ≥20 trials.
- **W5 [CHECK-UNEXECUTED]:** undo-with-reference-returning-backend test (the F3 lesson localized): fake array whose `__getitem__` returns views; assert undo restores prior values — the regression test napari's #3203 fix lacked.

## 13. Critical assumptions and unsupported cases (explicit)

- **A1:** tifffile's documented per-tile Zarr access performs acceptably on 16 GB/8-core hardware at 3 GB scale — plausible from the API design (F1) but **unbenchmarked** (W2 UNEXECUTED). Fallback: pure `filehandle.seek/read + page.decode` loop as in the README's tile-iteration example.
- **A2:** os.replace atomicity + fsync ordering gives crash safety on the team's filesystems (ext4/APFS) — inference; network-share semantics on shared storage may violate ordering assumptions (lead L4); mitigation: generation counter + hash audit on open.
- **A3:** JSON float64 round-trip exactness was demonstrated only for CPython's json (W1); other serializers in the pipeline must be pinned to the same behavior.
- **U1:** annotation transforms under *non-affine* stage corrections (e.g. live drift correction) — out of contract; rejected at import if detected, or stored as provenance-only.
- **U2:** ambiguous axes with no user correction available (axis 'Q' with no metadata) — supported only in the "opaque, unknown calibration" mode with prominent unit-less warnings; exports from that mode state `calibration_confidence=unknown`.
- **U3:** concurrent edits by two researchers to one bundle — unsupported by design (bundle exchange is the collaboration boundary).

## 14. Fact / inference / choice / validation register (summary)

| Claim | Type | Anchor |
|---|---|---|
| tifffile tile-level Zarr reads, memmap, calibration fields, documented unsupported list | FACT | S1 (README 2026.9.20) |
| napari layers carry scale/translate; world-vs-data extent tests | FACT | S5 @ `f9322732` |
| undo-copy bug → fix `f9322732` → release v0.4.11 → tests at merge commit | FACT (chain) | S2–S6 |
| NGFF 0.4 axes order, coordinateTransformations, multiscales, labels scope convention | FACT | S7 |
| float32 coordinate loss; JSON float64 exact round-trip | CHECK-EXEC | W1 |
| Component split C1–C8; JSON project format; atomic-save recipe; boundary cut | CHOICE/INFER | §4–§9 |
| Performance and crash-recovery claims | PROPOSED, UNEXECUTED | W2–W5 |
