# ScopeDesk — a local biomedical image review workspace
## Research-stage proposal (frozen), Development Brief A
Author: candidate research stage · Date: 2026-10-05 · Status: complete proposal for critique

Working name "ScopeDesk" is a placeholder. This document separates evidence types inline:
**[F-Snn]** external fact from source Snn; **[I]** engineering inference; **[C]** product choice;
**[W-n]** executed witness check (candidate-authored code, receipts recorded); **[U-n]** proposed check, UNEXECUTED.

---

## 1. Executive summary

Six researchers need a desktop workspace that opens multi-dimensional microscopy images from
different instruments, keeps calibration and annotations alive across save/close/reopen/export,
and never mutates source data. The plan below is deliberately built from four small, independently
useful precedents rather than one whole-product clone:

1. **napari** (Python, Qt/vispy) contributes the *display-state versus data* separation and an
   explicit per-layer transform chain (`tile2data → data2physical → physical2world`) **[F-S04]**,
   plus N-D annotation layers and cancellable background workers **[F-S14]**.
2. **QuPath** (Java) contributes the *project persistence* mechanics: content relocation with URI
   fixing, missing-image warnings, display-settings persistence, tile caching, and a
   backup-restore path for corrupted saves **[F-S09, F-S05–S08]**.
3. **OME-NGFF 0.4 + Zarr** contributes the *data-at-rest contract*: explicit axes with UDUNITS-2
   units, per-resolution `scale`/`translation` coordinateTransformations, channel display windows,
   and chunk-addressable storage for images too large to decode at once **[F-S11, F-S12]**.
4. **tifffile** contributes the *format support boundary reality*: a maintained TIFF/OME-TIFF
   reader whose changelog shows the boundary moving monthly, which is why the support set must be
   small, pinned, and test-corpus guarded **[F-S13]**.

Two issue→fix chains are traced end-to-end:
- **napari #7962 → PR #8098 → parametrized regression test → release 0.6.5** (complete chain,
  including the fix's own documented limits: translation case still xfail; label extent static
  after creation) **[F-S01–S03]**.
- **QuPath #1252 → PR #1255 (`PathIO.java` exception-wrapping fix) → v0.5.0 changelog** (fix chain
  complete; **no regression test identified** — stated honestly, not invented) **[F-S05–S08]**.

Recommendation (detail in §5): a small Python/Qt application that **embeds napari's viewer
component**, reads through a **bounded tile/chunk adapter layer** (tifffile + zarr), stores
**annotations in float64 sample coordinates in an append-only journal**, keeps **display state in a
separate views file**, records **every geometric/resampling operation as a logged derived-data
operation**, and saves **atomically via temp-file + fsync + rename** with a recovery scan. The
3 GB envelope is analyzed numerically at tile granularity (≈24 MiB working set, no second full
copy) **[W-2]** and marked as an engineering target with the on-GPU/real-data test still UNEXECUTED
**[U-1]**.

---

## 2. Minimum obligations restated as component requirements

| Brief obligation | Where satisfied |
|---|---|
| Project with several images from different instruments | `project.json` manifest + per-image source records (§4.1) |
| 2D/volume, channels, time, int/float samples, physical calibration | axes model with per-axis type/unit (§4.2), NGFF-style [F-S11] |
| File too large to decode into memory | bounded tile/chunk adapters + LRU cache (§5.3), [W-2] |
| Visible channels, window/level, slice/time; draw points/polygons/masks | views file + annotation journal (§4.4) |
| Per-slice / per-time / volume / whole-acquisition annotation scope | annotation `scope` field (§4.4) |
| Explicit data↔stored↔physical coordinate relationship, full precision | coordinate contract, float64 JSON (§4.2, [W-1]) |
| Import without rewriting originals; metadata/provenance inspection | read-only adapters; streamed sha256 identity; raw metadata sidecar (§4.1) |
| Display edits never alter samples; transform/resample distinct + recorded | views-vs-data separation; ops log (§4.5) |
| Unsupported/ambiguous axes or calibration: explicit, original retained | quarantine + import correction dialog (§3.2, §4.6) |
| Honest support boundary, safe failure | §3.1 boundary list, §3.2 failure behavior |
| 8-core/16 GB machine, 3 GB image via bounded access | §5.4 envelope analysis, [W-2], [U-1] |
| Cancel + progress for long operations | worker threads with cancel tokens, napari precedent [F-S14, F-S03] |
| Partial import / interrupted save / failed export recoverable | atomic save + journal + recovery scan (§6), [W-3] |
| Atomic save/recovery, source identity, relocation, bundle trade-off | §6.2–6.4 (POSIX rename [F-S15], QuPath lessons [F-S09]) |
| Annotation styles, keyboard nav, undo/redo | style records + journal-based undo (§4.4, §7) |
| Original vs derived visible; honest export account | derived-asset registry + export manifest (§4.5, §4.7) |
| Accessibility: keyboard operability, legible feedback | §7 |
| Opportunities and alternatives kept separate | §8 and `leads.json` |

---

## 3. Support boundary

### 3.1 The boundary itself **[C, bounded by F-S13]**

**Read targets (first useful version):**
1. **OME-TIFF** (≤5-D, tiled or striped; OME-XML parsed for axes/units/channels) — via pinned `tifffile` (current upstream version 2026.9.20 per its changelog [F-S13]).
2. **OME-Zarr / NGFF 0.4** (Zarr v2 layout; `multiscales`, `axes`, `coordinateTransformations`, optional `omero` and `image-label` metadata) — via pinned zarr-python [F-S11, F-S12]. NGFF 0.5+ is a lead, not a promise (tifffile's changelog shows 0.5 support arriving only in 2026.5.2 [F-S13]).
3. **Plain tiled TIFF/BigTIFF** with an explicit axis-assignment and calibration dialog when metadata is absent.
4. **PNG** (8/16-bit) as the trivial single-plane case.

**Write targets:** project files; annotation tables (CSV/JSON with data + physical coordinates and units); overlay PNG + a small derived image (OME-TIFF or OME-Zarr); export manifest stating exactly what is preserved (§4.7).

**Explicitly unsupported (fail safely, do not silently approximate):** vendor natives (CZI, ND2, VSI, LIF, DICOM series) until a converter-produced TIFF/Zarr exists; ambiguous N-D stacks the user cannot explicitly map to axes; uncalibrated images the user declines to calibrate (usable in pixel units, clearly labeled "pixel units, no physical calibration").

The boundary is enforced by a **pinned-version integration corpus**: one small file per supported flavor per instrument family, with golden metadata (axes, units, shapes, dtypes) checked on every dependency bump. This is motivated by tifffile's changelog, which shows format-level behavior changes ("Fix reading multi-file pyramidal OME TIFF", "Update ZarrFileSequenceStore to zarr format 3 (breaking)", "Zarr 3 is not supported (#272)" then later "Require Zarr 3") landing monthly **[F-S13]**.

### 3.2 How an unsupported input fails

1. The adapter returns a structured `ImportRefusal(reason, raw_metadata_path)` instead of raising deep in the UI.
2. The file is copied **unmodified** into `quarantine/<id>/` together with a verbatim sidecar dump of whatever metadata was readable (original retained, per brief).
3. The project opens without that image; the image list shows it as *unavailable: reason*; the metadata inspector shows the raw sidecar.
4. The user gets exactly one explicit correction path: re-import with hand-assigned axes/order/units (the "ambiguous axes/calibration" choice), which is recorded in provenance as a user-supplied interpretation.
5. Nothing else in the project is affected; a partial import leaves the manifest referencing only images that completed, plus quarantine entries for the rest **[C; mechanism supported by QuPath's separation of project metadata from image bytes, F-S09]**.

---

## 4. Data contract

### 4.1 Project layout and source identity

```
project/
  project.json          # manifest: schema version, images[], views refs, ops log ref, app versions
  refs.json             # external-path references (see §6.3) OR sources/ for bundled copies
  annotations/
    <image-id>.jsonl    # append-only annotation journal (also the undo log)
  views.json            # display state per image (never touches sample data)
  provenance.log        # immutable-ish event log: imports, ops, exports, corrections
  derived/<op-id>/      # outputs of recorded operations + op.json spec
  quarantine/<id>/      # refused inputs + verbatim metadata sidecar
```

Source identity **[C; mechanism chosen to survive relocation]**: each image record stores
`{uri, sha256 (streamed at import), byte_size, importer_name, importer_version, import_utc}`.
On open, size+sha256 are re-checked when the file is reachable (cheap verification, QuPath-style
missing-file warning if not [F-S09]); if the hash changed, the image is flagged
`source_changed` and annotations against it are marked stale rather than silently displayed.
mtime alone is never treated as identity.

### 4.2 Coordinate contract (the core)

Three spaces with one explicit chain **[C; pieces from F-S11 and F-S04]**:

```
sample space            physical space                 display space
(per-axis indices)  →   (µm, per-axis units)      →    (canvas pixels)
       per-axis scale S (float64 diag)      view affine V
       per-axis translation T               (pan/zoom/rotate; ephemeral)
       optional orientation D (3×3 direction cosines, float64)
   M_sample→physical = [D·S | T]   (4×4 homogeneous, float64)
```

- **Axes are stored, not implied**: `axes: [{name, type: space|time|channel, unit}]`, axis order
  identical to stored chunk order, units from the UDUNITS-2 name set that NGFF 0.4 §3.1 mandates
  (e.g. `micrometer`, `millisecond`) **[F-S11]**. The importing adapter must state the axis order
  it found (OME-XML `DimensionOrder`, NGFF `axes`) — never guess silently.
- **Per-axis `scale` and `translation`** map sample indices to physical coordinates, exactly the
  NGFF 0.4 `coordinateTransformations` shape (exactly one `scale` per dataset level; `translation`
  only after `scale`) **[F-S11]**. Multiresolution pyramids carry per-level scale so annotations
  stay in level-0 sample coordinates regardless of the level displayed — the same convention NGFF
  mandates for its datasets **[F-S11]**.
- **Orientation `D`** defaults to identity; non-identity is accepted only from explicit metadata
  (or an explicit user dialog) and validated orthonormal within 1e-6 at import. This carries the
  ITK-style origin/spacing/direction idea of physical geometry in a format our JSON can store
  verbatim **[I; direction-matrix convention]**.
- **Annotation canonical coordinates are sample coordinates, float64, in the record's own
  `axes` order** (record includes the axes list it was authored against). Physical coordinates are
  *derived* for display/export using the current `M`. If calibration changes after authoring, the
  journal is untouched; the UI shows "calibration changed since annotation (old fingerprint
  X, new Y)" and exports can pin either fingerprint **[C; rationale in §8 lesson 1]**.
- **Precision rules** [W-1]: float64 everywhere in storage; JSON serialization via Python `repr`
  round-trips float64 exactly (verified); **float32 storage of sample indices is forbidden** —
  indices above 2²⁴ lose integer precision (verified: 16,777,217 → 16,777,216.0). The float32
  hazard concerns annotation/coordinate storage we control, not TIFF's own integer indices.
- **Unit handling** [W-1]: a fixed normalization table maps `µm`, `um`, `micrometer`, `micron` →
  `micrometer` etc.; a unitless axis (`px`) is legal only when explicitly chosen and is then
  labeled "pixel units, no physical calibration" everywhere it appears. This is ours to own —
  napari's own non-orthogonal-slicing work states its units handling is not yet fully validated,
  so we must not delegate unit correctness to the viewer **[F-S04]**.

### 4.3 Images (sources) and pyramids

Each image record: axes, shape, dtype (int/uint/float bit depths as found), chunk/tile geometry as
advertised by the source (TIFF tile size; Zarr chunk shape), pyramid levels with per-level scale
(NGFF-style), original metadata (verbatim dict + raw XML/JSON sidecar path), and the identity block
of §4.1. Adapters expose only `read_tile(level, chunk_index) -> ndarray` plus metadata; **no
adapter may return a whole-image array** **[C; enforced in code review, not by source evidence]**.

### 4.4 Annotations, styles, undo/redo

- Kinds: `point`, `polygon`, `mask`; each record: `{uuid, kind, image_id + source sha256, axes,
  coords (float64), scope, style_id, created_utc, author, tool_version, note}`.
- `scope`: `plane{z,t}` | `volume{z_range,t}` | `acquisition` — masks additionally carry a
  `mask_ref` into `derived/` or the journal's inline run-length payload for small masks
  **[C]**. The napari chain shows exactly why scope/extent must be bound to the *image*: its
  shapes→labels conversion once sized the label array from the annotation extent instead of the
  image extent, producing masks that "don't match what you expect" when saved **[F-S01]**.
- Styles: named records (color, line width, fill opacity, marker) referenced by `style_id`;
  restyling an annotation is a journal op, so styles are reusable and re-theming is cheap **[C]**.
- Undo/redo = journal walk: every mutating op appends an event with its inverse; undo/redo move a
  cursor, never rewrite history; compaction happens only at explicit save time **[C]**.

### 4.5 Views vs data; derived operations

`views.json` holds per image: visible channels, per-channel window/level (the NGFF `omero`
window shape — min/max data range plus start/end display window [F-S11]), colormap, current
z/t. Editing these **only** reads samples to re-map display; samples are never written back **[C;
pattern evidenced by napari layers keeping `contrast_limits`/`gamma` as layer state distinct from
`data`, F-S13/S14]**.

Any geometric transform or resampling is an **operation record**: `{op_id, type: affine|resample|
projection, inputs: [{image_id, sha256}], params (float64), output_ref, created_utc, app_version}`,
writing into `derived/<op_id>/`. Outputs are new assets with their own axes/scale metadata; the
original is untouched; the layer tree renders derived layers with a distinct hatch/badge
(original-vs-derived is always visible) **[C]**.

### 4.6 Provenance & metadata inspection

`provenance.log` records import (with raw metadata location), every correction dialog outcome,
every op, every export. The metadata inspector shows: resolved axes/units/calibration, the exact
source of each field (file tag vs user correction), and the verbatim original. This is the
"inspect metadata and provenance" step and the audit trail for "did the exported annotations
still refer to the same image".

### 4.7 Export honesty

Every export writes a machine-readable manifest beside the payload:
- annotation tables: both sample and physical coordinates, the units, the calibration fingerprint
  `sha256(canonical JSON of axes+scale+translation+orientation)`, and source sha256;
- overlay/derived images: rendering parameters (window/level) used, interpolation, and the
  statement "derived view, not original samples";
- explicitly listed **non-preserved** aspects (e.g. "display LUTs not embedded in PNG",
  "table physical coords use calibration as of export").
This exists because calibration loss in exports is a documented real failure elsewhere
(QuPath: "TileExporter with ImageJ TIFF can lose pixel size and channel color information" [F-S09];
"Add shape features wrongly gives 'Length µm' in pixels" [F-S09]).

---

## 5. Architecture

### 5.1 Components **[C]**

1. `core` — pure library: models, coordinate contract, journal, ops, import/export. No GUI imports; fully unit-testable.
2. `adapters` — `ome_tiff` (tifffile), `ome_zarr` (zarr-python), `png`; each implements `probe()` → metadata + `read_tile()`.
3. `tilehub` — LRU tile cache + async prefetch + cancel tokens; the only component allowed to schedule reads.
4. `viewer` — **embedded napari `QtViewer`** with layers fed lazily (dask/zarr arrays). napari's public API surface includes exactly the pieces we need: `Image/Labels/Points/Shapes` layers, `utils.transforms.Affine/TransformChain/ScaleTranslate`, `utils.progress`/`cancelable_progress`, and Qt worker classes **[F-S14]**.
5. `project` — manifest/journal/provenance persistence with the atomic-save protocol (§6.1).
6. `export` — tables, overlays, derived images, manifests.

### 5.2 Independence of the two main precedents

- **napari** is a Python/GPU *viewer* whose contribution is the runtime mechanism: per-layer
  affine transform chains and annotation layers operating on possibly-lazy arrays **[F-S04, S14]**.
- **QuPath** is a Java *project system* whose contribution is the persistence mechanism: URI
  relocation tooling, missing-source warnings, display-setting persistence in projects, tile
  caching keyed on servers, and failure recovery around saved data files **[F-S09]**.
They share no code, no language, and no data format; each mechanism is reusable without the other.
**NGFF/Zarr** (format contract) and **tifffile** (reader reality) are further independent because
they govern data-at-rest and decoding, orthogonal to both viewers.

### 5.3 Threading, progress, cancellation

Long operations (import hashing, pyramid conversion, resampling, exports) run on worker threads
exposing `progress` and `cancel` (cooperative: checked between tiles). Precedent: napari ships
`GeneratorWorker`/`WorkerBase` Qt threading utilities plus `progress`/`cancelable_progress`
helpers **[F-S14]**, and its 0.6.5 task manager now blocks accidental close while workers run
**[F-S03]** — the same UX guard this app needs ("users can cancel long operations").
Annotation edits stay on the UI thread and touch only cached state; journal appends are cheap.

### 5.4 Envelope analysis (8-core, 16 GB, optional GPU) — engineering target, not evidence

For a 3 GB class source (2048×2048×366 uint16 ≈ 2.86 GiB) with 256×256 uint16 tiles:
tile = 128 KiB; a z-plane = 64 tiles; an LRU cache of 128 tiles = 16 MiB; displayed plane = 8 MiB;
**working set ≈ 24 MiB — 0.15 % of RAM and 0.8 % of a second full copy** **[W-2]**. Real RSS will
be larger by decode buffers, GPU uploads, and interpreter overhead; the design claim is only
"bounded, no second full copy", and the measured test on real hardware is **[U-1]**.

---

## 6. Failure, recovery, identity across machines

### 6.1 Atomic save protocol **[C; semantics F-S15, W-3]**

For every manifest/journal/view write: write `path.tmp` in the *same directory*, `flush`+`fsync`,
then `os.replace` (POSIX rename: "If newpath already exists, it will be atomically replaced, so
that there is no point at which another process … will find it missing" **[F-S15]**). Verified
component behavior: interrupted save leaves the original intact and the `.tmp` recoverable; failed
export leaves the target untouched and cleans its temp **[W-3]**.
**Limits, stated:** rename is atomic per-file on one filesystem; it does not make a *set* of files
atomic, and the Linux man page explicitly warns rename semantics cannot be assumed on NFS **[F-S15
BUGS]** — which matters because this team exchanges bundles on ordinary shared storage. Therefore:
the manifest carries checksums of all parts; on open, a recovery scan completes any
`*.tmp` whose checksum matches the manifest's in-flight record, or discards it; journals are
append-mostly so a torn tail is detected by checksum and truncated to the last good record.
The QuPath record supports both halves: "Closing QuPath abnormally can result in broken data
files (#512)" **[F-S09]** and the #1252 lesson that recovery code must actually be reached —
see §8 chain 2.

### 6.2 Identity of source data

sha256 + size at import (§4.1); re-verified opportunistically. Annotations store the source hash
they were authored against, so the "do exported annotations still refer to the same image"
question is answerable by hash comparison, not by filename.

### 6.3 External-path relocation **[C; precedent F-S09]**

Image records reference sources either bundled (`sources/<id>/...`, relative path) or external
(`refs.json` absolute URI + hash). A relocate/re-link dialog (QuPath's `UriResource`/`UriUpdater`
generalizes exactly this [F-S09]) rewrites external refs after a directory move, with a
missing-source warning list on open (QuPath shows "a warning indicator if image files are missing"
[F-S09]).

### 6.4 Portable bundles vs external references — trade-off

- **Bundle (copy in):** fully portable across machines; costs disk (a 3 GB image doubles); hash
  pinned at copy time. Good for sharing a finished annotation set.
- **Reference (path out):** zero copy cost, works against huge datasets, but breaks when mounts
  differ; relocation dialog + hash check mitigates, never eliminates.
- Default policy **[C]**: reference by default, one-click "make portable" that copies and re-hashes
  selected images. QuPath settled the same question the same way: "Self-contained projects … no
  longer prompt the user to update URIs if moved" while reference-based projects keep the update
  flow **[F-S09]**.

---

## 7. Interaction, keyboard, accessibility

- **Keyboard operability [C; precedents F-S09]**: full navigation without mouse — z/t stepping,
  channel toggles, tool selection, undo/redo, save — each action listed with its key in a
  shortcuts overlay (QuPath added "keyboard shortcuts to tooltips" and tuned navigation speed for
  arrow keys **[F-S09]**). Its bug history also warns us: an arrow-key navigation bug for
  z-stacks/time-series shipped and was later fixed (#748) **[F-S09]** — keyboard paths get
  regression tests here, not manual QA.
- **Legible metadata/error feedback**: structured panels, plain-language refusal reasons, monospace
  raw-metadata view; every error carries an id linking to the provenance entry.
- **Original vs derived**: derived layers carry a visible badge and hatch; exports restate it.
- Contrast levels and font sizes configurable; all state readable as text (no color-only
  signaling). (Product choices; no external standard was pinned in this research pass.)

---

## 8. Evidence chains (issue → fix → regression test → release)

### Chain 1 — napari shapes→labels sizing bug (COMPLETE)

1. **Issue #7962** (2025-05-23): converting a Shapes layer to Labels via the UI used the
   *Shapes extent* instead of the image/LayerList extent, so "you can't paint in certain areas and
   when you save the layer for using later it doesn't match what you expect" **[F-S01]**.
2. **Fix PR #8098** (merged 2025-09-24): `_convert` in `src/napari/layers/_layer_actions.py` now
   computes the label shape from the LayerList world extent mapped into the layer's data space:
   `data = lay.to_labels(labels_shape=lay.world_to_data(ll_shape))` — i.e. the fix is precisely a
   *coordinate-space conversion between frames* **[F-S02]**.
3. **Regression test added in the same PR**: `test_make_label_from_shape_param` in
   `src/napari/layers/_tests/test_layer_actions.py`, parametrized over scale/translate
   (default; translated → `xfail("Converting layers with translations does not work")`; scaled)
   asserting `ll[-1].extent.world == ll.extent.world` **[F-S02]**.
4. **Release**: napari 0.6.5 (published 2025-10-02) lists under Bug Fixes: "Fix effect of scaling
   when converting shapes to labels (#8098)" **[F-S03]**.

**Limits of this chain (stated, not hidden):** the merged test *xfails* the translated case —
translation-dependent conversions were still broken at merge time; the PR description itself lists
remaining defects (label extent static after creation; min-world assumptions); the fix targets the
UI conversion action, not the `to_labels` API's general behavior. Applicability to us: bind
annotation-derived rasters to the *image* extent, and treat world→data conversion as the failure
point to test first.

### Chain 2 — QuPath save-failure recovery (FIX CHAIN COMPLETE, NO REGRESSION TEST FOUND)

1. **Issue #1252** (2023-03-14): "PathIO doesn't restore backup if writing ImageData fails";
   expected behavior per reporter: "write a new temporary file, and then only rename if the
   writing has succeeded"; linked to a real corrupted-file forum report **[F-S05]**.
2. **Fix PR #1255** (merged 2023-03-23): `qupath-core/src/main/java/qupath/lib/io/PathIO.java`
   re-throws `EOFException` and wraps *any* other exception in `IOException`, so the existing
   backup-restore path in project loading actually triggers — i.e. the repair made *failures
   visible as the exception type the recovery code catches* **[F-S06]**.
3. **Bookkeeping PR #1300** (merged 2023-08-24) added the CHANGELOG line for #1252; its file list
   contains no PathIO change — good evidence the code fix is #1255's **[F-S07]**.
4. **Release applicability**: listed under "Version 0.5.0 → Bugs fixed" in the public CHANGELOG
   **[F-S09]**.

**Limits:** no regression test was found in the reviewed PR file lists; the chain establishes the
fix and release, and *stops there*. We do not claim QuPath's recovery is tested. Applicability:
our recovery scan (§6.1) gets a test that injects truncated/corrupt journals and asserts
restore-or-refuse — the exact gap this chain exposes.

### Corroborating defects from the same public records (not full chains; used as risk evidence)

- "TileExporter with ImageJ TIFF can lose pixel size and channel color information" (#1516) and
  "'Add shape features' wrongly gives 'Length µm' in pixels" (#2158) — export/unit honesty is a
  recurring failure class **[F-S09]**.
- "Tile caching based on image path isn't enough whenever files change on disk" (#2012) — cache
  keys must include content identity **[F-S09]**; mirrored in our tile cache keying tiles by
  `(source_sha256, level, chunk_index)` **[C]**.
- "Timepoint data is rarely available (or correct)" (#1628) — time-axis metadata is commonly
  unreliable; treat as user-correctable **[F-S09]**.
- napari PR #9337 (open, 2026): 2-D slicing of transformed n-D images shows the transform-chain
  architecture in detail and *admits* units handling is not fully validated — relevant as an
  upstream watch-item and as a reason our calibration math must live in `core`, not the viewer
  **[F-S04]**.

---

## 9. Critical assumptions and unsupported cases

| Assumption | Basis | If wrong |
|---|---|---|
| napari can be embedded as a component in a custom Qt app | public API exposes `QtViewer`, layers, workers **[F-S14]** | **[I]** embed effort grows; fallback is a thin custom Qt+vispy canvas reusing `core` unchanged (the architecture isolates the viewer) |
| TIFF/OME-TIFF via pinned tifffile covers the lab's instruments | boundary list §3.1; corpus tests | a vendor file fails → quarantine path (§3.2), convert once outside the tool |
| float64 sample-coordinate storage is sufficient | float64 exact through JSON **[W-1]**; stage origins in µm are ≪ float64 limits | add decimal-string encoding for extreme offsets (reserved field) |
| Tile-granularity bounded access meets the 3 GB target | arithmetic **[W-2]** | **[U-1]** measures real RSS; fallback: mmap windows, smaller LRU |
| Shared-storage exchange tolerates rename-based saves | POSIX semantics **[F-S15]** + checksummed recovery scan | NFS edge cases **[F-S15 BUGS]** handled by scan, worst case = recoverable conflict, never silent loss |
| Teams accept explicit axis-assignment dialogs on ambiguous imports | brief demands explicit choice | friction mitigated by remembering per-instrument defaults |

Unsupported-by-design (v1): writing source images in place; automatic segmentation; registration;
multi-user simultaneous editing; web viewer; DICOM network (PACS) query.

---

## 10. Opportunities and alternatives

**Opportunity 1 — OME-Zarr as the derived/mask exchange format.** NGFF 0.4 already specifies
`labels` and `image-label` metadata (label values, rgba, properties, source image link)
**[F-S11]**; QuPath 0.6+ both reads and writes OME-Zarr **[F-S09]**. Masks exported this way
reopen in napari, QuPath, and Fiji-family tools *with coordinates intact* — directly attacking the
"exported annotations refer to the same image" disagreement. Cost: one writer path. This is the
first optional feature we would pull in (M3).

**Opportunity 2 — napari plugin ecosystem later.** If annotation tooling gaps appear, napari
plugins can be adopted before we write code (deferred; see leads).

**Plausible alternative (bounded): build as a QuPath extension instead.** Pros: project system,
tile server, OME-Zarr IO and segmentation integrations already exist **[F-S09]**. Cons: Java/Gradle
toolchain and GPL-3.0 licensing (repo metadata **[F-S06]**), UX not ours, and our coordinate
contract would live inside someone else's release cadence. Kept as a fallback if embedding napari
fails its [U-1]/usability gates — not the MVP.

---

## 11. Validation plan

**Executed by candidate (isolated component checks; receipts in `witnesses.json`):**
- **[W-1]** Coordinate precision/units: float64 JSON round-trip exact; float32 index loss at 2²⁴+1;
  anisotropic y/x scale-swap produces a 331.3 µm position error (detectable); unit table maps
  µm/um/micrometer/micron → micrometer and flags unitless. Scope: pure arithmetic/serialization
  only — it validates the *storage choice*, not any shipped reader.
- **[W-2]** Bounded-access arithmetic for the 3 GB envelope: tile/plane/volume tile counts,
  16 MiB LRU + 8 MiB plane = 24 MiB working set (0.15 % of 16 GiB), zarr v2 chunk key forms.
  Scope: arithmetic; no real reader exercised.
- **[W-3]** Atomic save protocol: clean save replaces atomically; simulated crash before replace
  leaves original intact + `.tmp` recoverable; recovery completes; failed export leaves target
  untouched. Scope: single file, local filesystem, POSIX; does not prove crash-during-rename or
  NFS behavior.

**Proposed — UNEXECUTED (need desktop env / real data / pinned libs):**
- **[U-1]** Embed napari, stream a synthetic 3 GB zarr-backed volume, measure RSS while panning all z; assert working set ≪ 1 GiB and no full decode (would validate §5.4 on real hardware).
- **[U-2]** Interrupted OME-Zarr write → recovery scan (needs zarr in sandbox).
- **[U-3]** Inventory `.zarray` `dimension_separator` across the lab's real NGFF exports (the NGFF doc illustrates a nested directory layout; zarr v2 also has a dotted form — the adapter must accept both, verified against real files).
- **[U-4]** QuPath-style backup-restore replay against our journal: truncated tail → truncate to last checksummed record.
- **[U-5]** Pinned tifffile golden-metadata corpus run (per §3.1) on a dependency bump.
- **[U-6]** Export round-trip: table coordinates re-imported land within 1e-9 sample units of origin.

---

## 12. Incremental delivery plan

- **M1 (core first):** `core` + atomic save + quarantine + PNG/TIFF read via tifffile + metadata inspector. Exit: reopen-after-crash test green **[U-4]**, corpus partial.
- **M2:** napari embedding, OME-Zarr read, tile cache + cancel, annotation journal with undo/redo + styles. Exit: [U-1] measured, keyboard matrix passes.
- **M3:** exports (tables with manifests, overlay, derived ops log) + optional OME-Zarr labels writer. Exit: [U-6], cross-tool open in QuPath.
- **M4:** relocation/relink tooling, corpus CI on pinned deps, accessibility pass.

---

## 13. Source index (meaningful citations; full catalog in `sources.json`)

- S01 napari issue #7962 · S02 napari PR #8098 files/patch incl. regression test · S03 napari 0.6.5 release notes · S04 GitHub search capture incl. PR #9337 description (transform chain; open limitations)
- S05 QuPath issue #1252 · S06 #1252 timeline (refs to commits/PRs; repo license) · S07 PR #1255 files (PathIO.java patch) · S08 PR #1300 files (changelog-only for #1252) · S09 QuPath CHANGELOG.md (+window into 0.2.x–0.3.x sections) · S10 QuPath v0.4.0 release tag
- S11 OME-NGFF 0.4 specification (axes; coordinateTransformations; multiscales; omero; labels; layout) · S12 zarr-python README · S13 tifffile CHANGES.rst (v2026.9.20) · S14 napari `napari.layers.Image` API page (layers/transforms/worker/progress surface) · S15 rename(2) man page (atomicity; NFS caveat) · S16 napari/docs repo tree
- Negative results recorded: `coordinate_systems.md` and `guides/layers.md` raw paths 404 in napari/docs; SimpleITK v2.2.0 `fundamental_concepts.html` 404; `cgohlke/tifffile` `CHANGES` (old name) 404 → use `CHANGES.rst`.
