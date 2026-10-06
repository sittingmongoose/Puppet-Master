# Source-grounded critique: biomedical image review workspace

**Stage:** I-05-CONTROL-ARTIFACT-RECOVERY-R001-revision-a001  
**Review date:** 2026-10-05  
**Scope:** source check and correction of the frozen same-arm proposal, catalogs and review. This is a design critique, not a viewer build, importer test or project-format qualification.

## Assessment and preserved direction

Keep the narrow import boundary; use napari as a viewing/editing component rather than project authority; own axis mappings, coordinates, identity, annotations and provenance in the application; keep source pixels immutable and large arrays outside SQLite; edit locally and exchange closed bundles; require explicit refusal or correction for ambiguous inputs; and use manifests/sidecars where standard exports do not express the full project contract. These remain product choices, not demonstrated application behavior.

The precedents are independently useful: napari v0.6.5 contributes multidimensional layer/view behavior and a tested metadata-retention fix; tifffile 2025.5.10 contributes an OME-TIFF-to-Zarr-2 regional read interface; SQLite documents a transactional recovery mechanism under explicit filesystem assumptions. None proves that this proposed combination is integrated, responsive on a 3 GB input, or durable on the lab's shared storage. Preserve the earlier isolated coordinate check W1 only as arithmetic evidence. W2–W6 remain acceptance plans, not results.

## Findings and corrections for the current proposal

### R1 — OME pixel spacing is distinct from stage position and plane timing

**Verified external facts.** The pinned OME 2016-06 schema describes `Pixels/@PhysicalSizeX|Y|Z` as optional pixel-size values. Their unit attributes have schema defaults of micrometres; `Pixels/@TimeIncrement` is a global time-series interval with a default unit of seconds. `Plane/@PositionX|Y|Z` describes stage position for a plane and its schema unit default is “reference frame”; `Plane/@DeltaT` is plane timing with a seconds default. The schema documentation also says TIFF structural pixel values can override inconsistent OME-XML pixel values in readers. OME-TIFF 6.2.2 separately defines `DimensionOrder` rasterization and `TiffData` IFD-to-plane assignments. Neither set of fields defines one universal oriented laboratory affine. [S2; S11]

**Correction.** Retain the proposed float64 spatial map and explicit-null/override path, but preserve raw XML, literal unit attributes, schema-effective defaults, TIFF structural values and the reader's selected value separately. The metadata panel must state whether a unit was literal, supplied by schema default, or supplied by a user. Never use `Plane.Position*` as a global affine origin without a documented mapping. Preserve per-plane positions and `DeltaT`; do not convert irregular positions/times to uniform scale. If a single mapping is unsupported, retain array-index coordinates and raw metadata, mark physical coordinates unavailable (or explicitly frame an image-local coordinate convention), and require a recorded correction before claiming a laboratory frame. Report OME/TIFF conflicts and the selected interpretation.

**Dependencies:** import contract, coordinate contract, metadata panel, exports; W4/W5. Add fixtures for omitted unit attributes, nonzero/varying plane positions, irregular `DeltaT`, `TimeIncrement`, and conflicting OME/TIFF dimensions.

### R2 — Bind annotations to source and derived grids separately

**Finding type:** engineering inference from the brief and the earlier contract. Source-anchored annotations plus derived-image records were present, but the proposal did not define which grid geometry uses after crop/resampling or how transformed annotations remain traceable.

**Correction.** Make an annotation's immutable anchor the source asset digest, selected series/group, grid/axis definition, and calibration-interpretation revision. Store source geometry in named sample-index coordinates. Every geometry-changing operation receives an operation ID, a new derived asset/grid identity, and an explicit source-index-to-derived-index mapping (float64 affine in v1). A mapped copy of an annotation has a new UUID, points back to the source annotation UUID and operation ID, and names its coordinate grid. Never rewrite source geometry in place. Export manifests identify source and derived digests, both grids, transformation chain, annotation IDs, selectors and coordinate frame; if a format cannot carry that mapping, call the export lossy/incomplete or require an explicit resampled derivative.

**Dependencies:** annotations, operation history, mask grid, derived image, table/overlay manifests; W5/W6. Test crop, anisotropic resampling, reflection, rotation/shear, persistence, and readback. A new isolated arithmetic witness can show a chosen source/derived coordinate mapping, but cannot validate viewer, persistence or exporter behavior.

### R3 — A digest is only identity for stable bytes actually hashed

**Finding type:** engineering inference. A read-only handle does not prevent another process from changing a linked file or Zarr tree during hash or decode; size/path/timestamp alone is not content identity.

**Correction.** Allow browsing while a streaming digest is pending, but visibly mark the asset and its annotations provisional. A verified portable copy or filesystem snapshot is the strong v1 identity route. For linked files, require a quiescent-source confirmation, hash the complete content, and recheck before a verified export or relocation; detect ordinary mutations and conservatively mark the asset changed/unavailable. State that a path-based read without an immutable snapshot cannot prove that no transient write occurred during review. For NGFF directories, version the tree manifest; include every regular file (metadata and chunks), canonical relative UTF-8 path, size and content hash in bytewise path order; reject symlinks, unsupported path encodings, normalization/case-fold collisions and non-file objects. Compare membership before/after hashing; any change or incomplete scan leaves identity pending/invalid. Do not silently relink by filename or file size.

**Dependencies:** project asset model, import UI, relocation, verified export; W3/W4 and leads on linked-source stability. Test mutation during and after hashing, same-name changed content, missing/added Zarr objects and interrupted traversal. Strong identity of data actually reviewed remains conditional on source quiescence unless an immutable snapshot/copy is used.

### R4 — Artifact publication and database commit are not one transaction

**Verified external fact.** SQLite's atomic-commit article explicitly assumes filesystem/VFS behavior for locking, flushes, sector/file operations and rollback recovery; it is not a certification of network shares. The article applies to rollback-journal mode, while WAL uses a different mechanism. [S10]

**Correction.** Choose and record `journal_mode=DELETE` (rollback journal) and `synchronous=FULL` for the local project database, then qualify that configuration on target systems. Publish large artifacts in this order: write a temporary sibling on the destination filesystem; close, read back and hash it; flush each file; rename into its immutable final name; flush the containing directory where supported; then commit the database pointer durably. This is still not a cross-resource atomic transaction. A crash before DB commit can leave an orphan artifact; a platform that cannot durably flush the rename cannot support the claimed pointer-order guarantee. On recovery, retain the DB and prior revision, classify missing/partial/unreferenced artifacts, and offer only a revision whose references verify; never auto-delete an ambiguous artifact. For exports, publish a verified bundle directory by same-filesystem rename and write its complete marker last. Keep live editing local and copy closed bundles to shared storage only after testing the actual backend.

**Dependencies:** save/recovery, migration and export protocol; W3 and shared-storage lead. Fault-inject before/after file flush, rename, directory flush and DB commit. The ordering improves recoverability but does not replace qualification of each filesystem.

### R5 — Enforce NGFF 0.4's axis and transform rules at the boundary

**Verified external fact.** NGFF 0.4 specifies Zarr v2. A multiscale image has 2–5 dimensions, 2 or 3 `space` axes, optionally one `time` axis, and optionally one `channel` or custom/null axis; axis names are unique, array order must agree, and axis-type ordering is time, channel/custom, then space. Dataset arrays are ordered largest to smallest. Dataset coordinate transforms contain exactly one scale and optionally one translation after scale, with vectors matching axes. Its image-label convention uses integer label values; the `source.image` path is optional. This metadata cannot carry a general rotation/shear affine. [S1 §§2, 3.1, 3.3–3.7]

**Correction.** Validate those requirements before opening an NGFF array. An explicit user remapping of unsupported/malformed axes is an application interpretation, not a claim that the input is unmodified conformant NGFF. Refuse unsupported dimensionality, transform length/order or broken multiscale/label-grid relationship with a legible explanation and retained source metadata. Do not assert that the optional image-label source link is present. Keep a full affine in the application contract/sidecar or make a recorded resampled derivative.

**Dependencies:** NGFF support matrix, ambiguous-axis dialog, masks and exports; W4/W5 and leads L2/L6. Separate standard-conformant fixtures from explicit correction/refusal fixtures.

### R6 — Preserve the napari repair chain and narrow both the fix and performance claims

**Verified repair history.** Issue #7085 reports that “Split RGB” lost a nontrivial image transform on napari `0.4.16.dev1413+ga4fa1fa0`. Maintainer discussion identifies inconsistent handling; the PR description says `split_rgb` called `stack_to_images`, which discarded affine/rotate/shear, while `split_channels` already propagated metadata. Patch #8256 changes `split_rgb` to use `split_channels` and adjusts metadata handling (three code commits `2b51110e65af469863697797921ff12aa668d301`, `3f994d36130e5d673ce059a1a0d66fac9cca03b0`, `9f262998cbe464e0ec826eae691e487af752658c`). The second commit adds the regression test. GitHub records merge `afd1bb88f296726fe98bc0a94119a51bba6870c4` on 2025-09-26 with milestone 0.6.5, and the v0.6.5 source and test contain the path and test. [S4–S7]

**Limit.** The tagged test compares the resulting affine matrix for identity, scale, translation, and `Affine(translate=[0,4])`; it does not exercise a general non-diagonal affine, rotation/shear, persistence or export. The patch code handles rotate/shear in the path, but that is not a corresponding regression assertion. Treat this as a real layer-operation metadata failure and narrow tested repair, not proof of the proposed application's coordinate pipeline.

Issue #9515 is open and reports slow/over-fetching behavior for a particular n-dimensional multiscale Zarr path. Its inline reproducer requests napari 0.9.1 and Zarr >=3, while the displayed environment reports napari `0.6.1rc1.dev1` and Dask 2026.8.0; it is not the proposed 0.6.5/Zarr 2.18.7 stack. The report/comments support measuring useful bytes, read amplification, stale work and latency; they establish neither a general defect nor a repair. [S9]

**Dependencies:** viewer adapter, channel/transform checks and exact-stack performance qualification; W2/W5 and leads L1/L3. Keep the issue as a risk lead, not a failed qualification result.

## Evidence that remains useful and open dependencies

- **Independent viewer and reader mechanisms:** napari 0.6.5 `slice_from_axis` wraps direct Zarr arrays with Dask for lazy slicing and its RGB split path carries layer metadata [S4/S5]. Tifffile 2025.5.10 separately documents `aszarr=True` regional reads and a Dask adapter for TIFF tiles, while requiring Zarr 2 for the path and noting multi-file pyramidal OME-TIFF limits [S3]. One is layer/view code and its test; the other is reader release documentation/examples. They are not an integrated or memory-bounded application result.
- Napari's v0.6.5 `pyproject.toml` declares Python >=3.10, Dask arrays, tifffile and optional Zarr >=2.12; it does not lock Qt, codecs or the complete dependency graph [S8]. Zarr 2.18.7 appears in the tifffile release's documented tested requirements [S3]. Keep the pins as a candidate baseline, not a resolved or cross-platform build.
- NGFF integer image-label interchange is a useful optional mask route; it does not replace the project's vector geometry, identity, affine or undo history [S1]. A Bio-Formats/vendor adapter remains a plausible alternative only after a named instrument need and independent qualification. Live collaboration, cloud sync, GPU, segmentation, registration and broader format coverage remain optional.
- Keep the 3 GB budget, 512 MiB cache, four concurrent reads, 32 MiB decoded chunk ceiling and UI latency/cancellation thresholds as proposed acceptance targets. No cited source establishes those values for this product.

All preceding W2–W6 claims remain UNEXECUTED. The repair dependencies above require the new final coordinate-grid arithmetic witness plus application-level tests still listed as UNEXECUTED; no source-chain correction or witness closes an integration risk by itself.