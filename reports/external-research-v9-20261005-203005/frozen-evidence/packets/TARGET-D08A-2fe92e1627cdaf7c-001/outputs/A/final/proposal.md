# Local Biomedical Image Review Workspace — current proposal

**Stage:** D-V08-A-treatment-critic_and_final-a001 · 5 October 2026  
**Status:** complete design proposal; no application build claimed.  
**Evidence scope:** this authoring stage reviewed the supplied seed proposal, source catalog and public-source captures. It does not establish autonomous source discovery. Citations [S1]–[S16] resolve to exact pins, locators and capture identities in `sources.json`.  
**Labels:** **FACT** = what the cited source says; **INFERENCE** = engineering conclusion; **CHOICE** = proposed product decision; **CHECK** = execution or proposed validation. Public sources are evidence, not instructions.

## 1. Recommendation

Build an incremental, local-first desktop research workspace. Preserve source files read-only; store project state, annotation edits, calibration decisions and derived outputs separately. Use a Python/Qt shell and evaluate napari as the first canvas/layer implementation, with our own project, frame and export services. Use tifffile for a deliberately narrow, fixture-tested TIFF family and a separate OME-Zarr reader adapter where its version and chunk path pass the same gates. Neither reader documentation nor the napari documentation demonstrates this application’s performance or correctness.

The corrected data contract has three explicit coordinate relationships:

1. **Sample-index frame:** an annotation’s authority is binary64 coordinates in a named source or derived raster frame. Integer coordinates designate sample centers; array-axis order and the coordinate convention are recorded. This is our internal choice, not a claim that all image formats use this convention.
2. **Physical frame:** one named, versioned mapping converts sample indices to physical coordinates. For an affine, use column vectors and `p_world = A · [p_index, 1]`, with axis order, units, matrix layout and direction stored alongside it. For NGFF input, apply the dataset transformation list in order, followed by the multiscale/group list in order; scale precedes translation. Evaluate those lists into the one canonical affine. Do not also apply that affine a second time. [FACT S1; CHOICE]
3. **Derived-raster frame:** a geometric operation records its direction as `input_index_to_output_index`; resampling samples the input using the inverse map. An annotation stays anchored to the source frame unless a user creates or explicitly exports it in the derived frame. The export records any mapping applied. This closes the seed proposal’s ambiguity about an optional affine coexisting with scale/origin and about whether a “transform chain” transforms coordinates forward or backward. [INFERENCE]

A file-byte hash establishes source-byte identity only. Each annotation also pins a frame ID; each correction, coordinate transform and resampling operation pins input/output frame IDs and content identities. Reopening or exporting must not infer frame equality from matching file bytes alone. [INFERENCE]

## 2. Minimum workflow

| Step | Proposed behavior and retained evidence |
|---|---|
| Create project | Create a versioned project manifest, empty annotation store and initial committed generation. The project is not an image container by default. |
| Import | Register a read-only source reference or make an explicitly requested copy. Stream size/hash work with progress and cancellation. Do not rewrite original samples. A failed or ambiguous import remains a recoverable project entry with the original metadata and a readable reason. |
| Inspect | Show axes, array order, channel/time/slice dimensions, dtype, calibration and units, image orientation, metadata source/precedence, reader/version and source identity. Keep a verbatim copy of original metadata separately from user corrections. |
| Navigate/display | Fetch only requested chunks/tiles for visible channels, slice/time and viewport. Store channel visibility, contrast/window-level, LUT, slice/time and zoom in view state. Display mapping never writes back to source samples. napari documents this separation and lazy NumPy-like data access [S2]. |
| Annotate | Support points, polygons and masks with reusable named styles, labels, author/time, scope (`plane(z,t)`, volume-at-time, or acquisition), frame ID and content identity. Undo/redo annotation and calibration-correction commands. A volume mask may be edited plane by plane; general 3D mesh editing is not a v1 promise. |
| Save/close/reopen | Commit project generations recoverably. On another machine resolve copy-policy sources within the project; for references, locate by path then verify bytes and preserve the saved frame definition. Present a mismatch/relink decision rather than silently attaching annotations to different bytes or geometry. |
| Export/verify | Export annotation table and selected overlay/derived image with a manifest giving source and output identities, frame conventions, transforms actually applied, sample/display changes and known losses. Compare source and derived frames independently. |

This is a research review tool, not a diagnostic or clinical system.

## 3. Source-backed precedents and the failure chain

These are independently useful components or formats, not claims that one whole-product competitor solves the brief.

- **OME-NGFF 0.5 specification — geometry contract [S1].** The specification names axes, their types and UDUNITS-2 units; requires array axis order to match the axes list; defines ordered coordinate-transform lists; and restricts multiscale transforms to scale and optional translation, with translation after scale. Dataset-level transforms apply before group-level transforms. This independently governed format standard contributes the rule for parsing and exporting scale/origin metadata. It does not provide our full affine extension, project transactions or vector-annotation store.
- **napari — viewer mechanisms [S2–S4].** Its docs describe contrast limits as visualization settings that do not change underlying image values, lazy NumPy-like inputs that are materialized for display, multiscale image arrays, channel layers, world scale/units and per-shape metadata. These documented viewer mechanisms are independent of NGFF’s file contract and tifffile’s reader. Shapes have 2D editing limitations in 3D use; persistence and our annotation-frame identity remain application responsibilities [S4]. The captured docs are on moving `main`, not a release-level API promise.
- **tifffile — TIFF reader and metadata behavior [S5–S11].** Its README describes page/strip/tile/SubIFD/pyramid access, memory mapping for eligible contiguous data, and Zarr-backed access. Its explicit unsupported list and format notes are a useful small-team support-boundary precedent. This is an independent implementation from the viewer and project-format examples; it does not prove our target files have responsive bounded reads. Metadata precedence and vendor-specific units need fixtures for the exact reader pin.
- **QuPath — project, relocation and export contracts [S12–S14].** Its docs describe JSON project entries referencing image URIs, per-entry data and summaries, and a per-machine project-file pattern for shared drives. Its annotation-export docs state that coordinates are pixel units with origin at the top-left of the full-resolution image and warn that another program may use different origin/units; GeoJSON changes some shapes to polygons and label drawing has overwrite semantics. These independently contribute relocation and export-honesty practices, not a coordinate definition we can silently impose on our own formats.

### Required issue → fix → regression test → release lesson

**FACT [S7–S10]:** tifffile issue #319 (opened 26 February 2026) reports `PixelSizeX` for a TVIPS file as `1.4208036661148071` with 2026.2.20 and `1.4208036661148072e-09` with 2026.2.24. The latter is a 1e9 change in magnitude without a corresponding caller-visible unit contract. Commit `7d9eaeddc710af068f9e8c2cf30b10a7d0e5c938` adds `test_issue_tvips_pixelsize` and assertions for the file-native nanometer values. Its child commit `edede6002c817f056d75125ade0b20332d549cca` removes the nm-to-m conversion in code, references issue #319 in the changed code and bumps the version to 2026.3.3. Release commit `503cb4eb74dd28a6acc36a0e4624ba9c2001e021` records “Do not convert TVIPS pixel sizes to m (#319)”. The test commit’s source identifies the fixture as a private test asset; this stage did not rerun it.

**INFERENCE:** store imported numeric calibration with its unit and raw metadata; never make a silent unit conversion; pin reader versions and keep per-instrument calibration fixtures through the application’s import path. The chain establishes one real reader regression and a linked repair/test/release, not all formats, all downstream users, or our application’s behavior. The adjacent tifffile #54 record and changelog support metadata fallback as a real failure mode, but this evidence does not establish a commit-to-regression-test chain for #54 [S6, S11].

## 4. Proposed architecture

```text
<project>/
  project.json                 # schema version, project ID, committed generation
  sources/<id>.json            # immutable identity, verbatim metadata, frame definitions
  annotations/<id>.json        # annotation rows, styles, undoable command history
  operations/<id>.json          # correction, coordinate transform, resample provenance
  derived/<id>/                 # optional derived pixels + provenance
  generations/<n>/              # validated state snapshots and checksums
  CURRENT                       # small generation pointer, committed last
  cache/                        # deletable tile/chunk cache and stale temps
  workstation-paths.json        # local path aliases; may be kept outside exchanged bundle
```

**CHOICE:** use JSON for small project records because they are inspectable and easy to version; keep large source pixels external unless the user opts to copy them. The generation directory contains a complete validated state snapshot. Save into a new same-filesystem generation, flush files/directories where supported, validate it, then replace `CURRENT` atomically and retain the prior good generation until the next verified save. This avoids pretending that several independent file replacements form one transaction. POSIX `rename(2)` documents same-filesystem atomic replacement for one target, `EXDEV` across filesystems and an NFS caveat [S15]. SMB/NFS and power-loss behavior remain validation dependencies. Exports are written to a unique `.partial` location and promoted only after close, hash and manifest validation.

**Components:**

1. **Source reader service:** read-only adapters expose `read_region(source, level, axes_selection, bbox)`, metadata, capabilities, progress and cancellation. A bounded LRU cache starts at a proposed 512 MiB cap, with a small limit on in-flight decoded chunks. Do not auto-compute full-volume min/max for contrast. A requested import copy or resampling job has a separate destination and visible progress.
2. **Metadata/frame service:** preserves raw metadata bytes and parser/version identity; maps understood axes; stores both raw transform lists and a canonical, evaluated frame mapping. Ambiguity yields a visible correction choice or an unsupported status. Corrections append operations and never overwrite raw metadata.
3. **Viewer/controller:** Python/Qt shell with napari as the first canvas/layer option, wrapped behind a narrow adapter. Our service owns persistence, frame IDs, scope and exports. If a release pin cannot pass lazy-read, keyboard, frame and save/reopen checks, retain a custom Qt canvas as the bounded fallback; do not maintain two viewers in v1. Because source docs are moving, pin a concrete napari release in the project lock before implementation acceptance [S2–S4].
4. **Annotation/command store:** binary64 point/polygon coordinates in a frame-named index space; masks as sparse runs or a small integer label array, never silently as a full copy of a large source. Styles are reusable records. Commands capture before/after values for annotation edits and explicit frame corrections, enabling undo/redo after reopen.
5. **Operation ledger/exporter:** operations identify input/output byte identity, frame IDs, forward/inverse mapping, algorithm/version and parameters. A true resampling writes a new derived array and hash. The exporter refuses a source mismatch by default; any explicit “accept as new source” path starts a new identity and marks existing annotations as requiring review.

A six-person group exchanges closed project generations/bundles through ordinary shared storage. Concurrent multi-writer editing and cloud sync are outside v1. A stale generation check should prevent one workstation from silently overwriting another’s newer committed state.

## 5. Data and coordinate contract

### Source identity and dimensions

Each file source has a stable project `source_id`, URI, resolved local path, byte length, whole-file SHA-256, reader name/version, import policy and status. For directory stores, define a deterministic root identity over sorted relative paths, file lengths and per-file hashes; validate how the store treats mutable metadata before claiming it is immutable. A hash is not a calibration identity.

For each array, retain ordered axis records `{name, type, unit, length}` and explicit mappings to time, channel, z, y, x or a named custom axis. Require unique names and visible order. Preserve original metadata verbatim. Unknown, conflicting or >5D axes are not guessed into a familiar layout. A user may explicitly map or treat calibration as unknown; retain the raw fields and correction record. [FACT S1; CHOICE]

### Frame and transform records

A frame record includes stable `frame_id` (hash of canonical frame JSON), source/derived `content_id`, sample-index convention, axes in array order, units, original parsed metadata reference, normalized mapping, raw transform sequence and any user correction. Its normalized transform is exactly one mapping from that frame’s coordinates to a named output space. Store matrix dimensions, row-major bytes/JSON order, column-vector convention, axis names, units, origin and direction. No implicit flip, transpose, half-pixel shift or unit conversion.

For supported NGFF 0.5, preserve the original transform list and its scope/order. Apply each dataset list sequentially, with scale before translation as required, then apply any multiscale/group transform list sequentially. Normalize once to `index_to_world`; do not apply both normalized and raw transforms downstream. NGFF multiscales do not encode arbitrary rotations/shears: such geometry is an app extension with an explicit extension marker or an unsupported/intervention-required input, not something exported as conforming NGFF scale/translation [S1].

Annotations are anchored as `{content_id, frame_id, axes, coords_f64, scope, style_id}`. Pixel/index values remain authoritative for that exact source or derived frame. Physical coordinates are derived from the pinned frame, not separately authoritative. Calibration correction changes the frame/physical mapping and is recorded; it does not move pixel-anchored vertices. A view-only flip/zoom/window edit changes neither data nor annotation coordinates.

A geometric operation records a forward map from named input indices to named output indices. A true resample additionally records the inverse sampling map, interpolation, output shape/dtype, resulting pixel identity, and software/version. Mask resampling uses a label-safe method such as nearest neighbor; interpolation choices are surfaced and validated. Display windowing or channel mixing that is baked into a rendered output is a separate intensity operation and records source channel(s), mapping/LUT and output dtype.

### Support boundary and failure

**CHOICE:** v1 import is limited to fixtures-tested classic TIFF/BigTIFF, OME-TIFF and ImageJ hyperstack TIFF, plus a separately tested OME-Zarr input adapter. Begin with uncompressed, LZW and Deflate paths only where the pinned reader exposes a bounded page/tile/chunk read and metadata mapping is tested. The Zarr adapter must distinguish OME-Zarr 0.4/Zarr v2 from 0.5/Zarr v3 and report its chosen support version; do not claim both until fixtures prove both. Test unsigned/signed integer and float samples the instruments actually use (initial target: 8/16/32-bit integers and 32/64-bit floats); unsupported sample types such as float16 are explicit. tiffFile’s broad format list is not itself our compatibility promise [S5].

Initially defer proprietary CZI, slide pyramids requiring stitching, unsupported JPEG/OJPEG/chroma/color conversions, unusual sample layouts, nonstandard/custom axes, inconsistent series metadata and any calibration conflict that cannot be resolved from retained facts. Unsupported imports display the source ID, reader/error, conflicting values and next action; they can be registered as unresolved with raw metadata, and do not block opening/saving the rest of the project. Never create an annotation frame by guessing. No source image is modified in place.

## 6. Save, reopen, relocation and portability

On save, serialize a new complete generation, validate schemas and referenced IDs, write checksums, flush, then replace `CURRENT` last. Keep at least one known-good generation and report recovery actions. The current generation is authoritative only if its checksum and schema validate. If rename returns an error on NFS, inspect `CURRENT` and generation identities before retry: the `rename(2)` manual cautions that a reported failure does not prove a rename did not happen [S15]. Do not move a temp file across mounts; do not imply `os.replace` makes a whole bundle transactional. Proposed tests must include interruption before/after pointer replacement and the group’s real share.

At import, hash file sources by streaming; for directory sources, hash a sorted manifest. This can cost time and I/O, so report progress and allow a cancel that leaves the source unregistered or explicitly pending verification. On reopen:

1. Resolve an existing path and verify byte identity.
2. Try saved project-relative paths and the workstation-local alias table.
3. If missing, ask for a replacement and verify its content identity. A different hash remains unresolved by default; explicit adoption creates a new source/content identity and marks annotations for review.
4. Load the saved frame and operations by their IDs. Do not replace a saved user correction just because the relocated file’s metadata parser now returns a different interpretation. If the user chooses to revise calibration, append a new frame/correction and show its effect.

**CHOICE:** reference external files by default to keep the project small; offer explicit copy-into-project and bundle packaging where storage permits. References minimize copying but depend on stable storage, path relocation and permission. Portable bundles travel better but consume space and take longer to verify; include source bytes only after an explicit choice. A per-machine path map may vary without changing project annotations. A matching content hash plus a matching persisted frame ID establishes the intended identity; bytes alone do not.

## 7. Export contract

Every export has an adjacent manifest with:

- source or derived content ID and hash, source frame ID, output frame ID and annotation frame ID;
- coordinate convention, axis order, scope (`z`,`t` included), units, origin/center convention and output resolution level;
- every transform ID in application order, its direction and matrix; whether coordinates were mapped forward, inversely mapped, or left in the source frame;
- whether image samples were resampled, interpolation and dtype; channels/time/slice selected; whether contrast/LUT/channel mixing was baked into a rendered image;
- annotation type/style fields retained, approximations/losses, writer and schema versions, and any source hash drift.

CSV can carry full-dimensional vertices and frame columns. GeoJSON is an interchange container here, not a claim of geographic CRS or universal microscopy semantics: export a 2D geometry at an explicit z/t or put remaining indices/scope in properties, and include the manifest. A QuPath-style output needs a separately verified coordinate-convention adapter; its documented top-left/full-resolution rule is not interchangeable by assumption with our sample-center index choice [S13]. Validate any half-pixel/origin mapping on fixtures for the actual target. Ellipses or masks converted to polygons/labels may be approximate or lose source representation; state it. Prefer integer TIFF or OME-Zarr labels when preserving multi-class mask values; a display-colored PNG overlay is explicitly rendered output, not the original mask model.

A small derived image export identifies whether it is raw samples from a selected plane or a resampled/contrast-baked view. Its pixel hash and operation history differ from the source whenever output samples differ. Manifest fields say exactly what remains equal and what changed; “same image” is not inferred from a path or display name.

## 8. Accessibility and daily use

Provide keyboard access to image open/import, slice/time stepping, channel selection, zoom, tool choice, drawing, selection, undo/redo, save and export. Publish a key map and allow users to remap conflicting single-key shortcuts. All controls must expose keyboard focus and visible focus. Metadata, calibration choices, progress and errors appear as selectable text with source ID, expected/found values and recovery action; never make status color-only. Use legible contrast and a textual alternative for status indicators. Test the workflow with keyboard only and at increased text scaling. These are product acceptance choices, not accessibility claims established by the sources.

## 9. Critical assumptions, alternatives and opportunities

- **A1, performance:** a pinned reader plus chunk cache can serve the actual 3 GB source on an 8-core/16 GB workstation without a second full decoded copy. Design with viewport reads and a bounded cache, then measure. Proposed target: p95 visible-tile latency below 100 ms, peak resident memory below 4 GB during review, and cancellation response below 250 ms. These are gates to evaluate, not established properties of tifffile, napari, GPU use or any real application [V2].
- **A2, parser/calibration:** the team’s files have enough metadata for a sensible import decision. #319 shows unit semantics can regress; per-instrument fixtures and an explicit “uncalibrated/ambiguous” state are required [S7–S10].
- **A3, save durability:** generation commit behavior works on the actual file share. POSIX `rename(2)` is only one-path evidence; NFS has the documented ambiguity and SMB is unverified [S15].
- **A4, UI dependency:** one pinned napari release can support the project-owned frame adapter, lazy source service, required keyboard flow and reopen behavior. The captured docs move on `main`; pin and validate a release before committing the UI plan [S2–S4].
- **A5, derived transforms:** the chosen resampler records a complete invertible coordinate relation for supported operations. Non-invertible crops/downsamples still have explicit mappings and pixel-center conventions; they cannot be treated as exact inverses for arbitrary points. Validate crop offsets, flips, right-angle rotations, noninteger scale and changed array shape before enabling each operation.

**Opportunity:** after core project/open/annotation tests pass, export selected derived rasters and integer labels as OME-Zarr 0.5, using NGFF axes/units/scale/translation and labels metadata where representable. This makes outputs more reusable across tools and uses an existing geometry vocabulary [S1]. It is deferred from the native project format; arbitrary app affines and vector annotations must not be mislabeled as native NGFF features.

**Plausible platform alternative:** adopt QuPath if whole-slide imaging and its project/export conventions become the dominant requirement. Its project/relocation/export documentation is useful, but this proposal keeps a custom data contract because the brief emphasizes mixed microscopy volumes, time and channels [S12–S14]. Keep napari’s documented viewer as a bounded UI fallback/accelerator, not a reason to surrender project-owned annotation persistence [S2–S4].

Cloud sync, collaborative simultaneous editing, automatic segmentation and registration are optional future directions only. They add conflict, provenance or scientific-validation requirements and are not needed to exchange closed bundles. See `leads.json` for deferred leads and their validation dependencies.

## 10. Checks and validation plan

**Executed by candidate — isolated component only:** W4 in `witnesses.json` checks ordered scale→translation, a named source-to-derived affine and inverse coordinate mapping with a small point. It does not exercise OME parsing, resampling, rendering, file export, serialization, project reopen or an application.

**Proposed, UNEXECUTED validation:**

| Check | Discriminating acceptance condition |
|---|---|
| V1 — instrument reader fixtures | For each supported instrument/file family, compare raw metadata, axes, dtype, calibration `(value, unit)`, sample values and reader version; inject malformed/conflicting metadata and verify safe unresolved import. Include a #319-style unit fixture. |
| V2 — 3 GB bounded review | Use representative tiled/compressed files on the specified workstation; measure peak RSS, p95 visible tile latency, cache, concurrency, progress and cancellation. Investigate whether cache+in-flight chunks stay below the proposed memory/latency targets. |
| V3 — frame/import round trip | Save/reopen with source path moved; verify byte hash, frame ID, raw metadata and annotations remain stable. Change reader version and corrected calibration while retaining identical bytes; verify saved frame is preserved and an explicit correction creates a new frame ID. |
| V4 — transformed export round trip | Export one annotation in source coordinates and once in a derived frame. Verify frame IDs and transform direction in manifests, forward-map to derived coordinates, inverse-map where mathematically defined, and compare against expected values within a format-specific tolerance. Test crop, flip, rotation and resample separately; do not require derived-frame values to equal stored source indices. |
| V5 — save/export interruption on local disk and shared storage | Interrupt before and after committing `CURRENT`, and during export promotion. Confirm a valid old or new complete generation reopens, partial output is not presented as complete, backups work, and SMB/NFS semantics are recorded. |
| V6 — bundle/reference relocation | Copy a reference project to another machine/path, relocate sources with matching and mismatching hashes, and open a copied-data bundle. Confirm the mismatch remains unresolved absent explicit adoption and that per-workstation paths do not alter frame/annotation identities. |
| V7 — keyboard/accessibility | Complete import, navigation, annotation, undo/redo, save, reopen, inspect and export without mouse; test focus, text scaling, readable errors and non-color status. |

The previous supplied witness catalog reports W1–W3 executions, but it does not contain their code or complete input payloads. This proposal does not rely on those reports as independently reproducible checks; `witnesses.json` records that limitation. No evaluator-only execution is supplied at this stage.
