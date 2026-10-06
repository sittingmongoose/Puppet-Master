# Proposal: Local Biomedical Image Review Workspace

**Stage:** D-V10-A-control-diagnostic-a001-resource-v13-a002-BUNDLE-R001. This standalone plan uses the admitted brief, seed materials and public captures; it does not claim autonomous source discovery. This research tool is not for clinical diagnosis.

## Version finding and recommendation

**[CHOICE]** Build a desktop project manager and annotation plugin around a napari viewer, with a project-owned provenance/annotation store and read-only TIFF reader. Start with single-file tiled TIFF/BigTIFF and OME-TIFF profiles; enable each only after its instrument fixtures pass. Pin the candidate reader set to tifffile v2026.9.20 and the versions its README lists as tested: Python 3.12.10, NumPy 2.5.3, imagecodecs 2026.8.16 and Zarr 3.4.0. This is a reproducible candidate lock, not proof of application compatibility. The exact napari/Qt release remains an integration gate. [S2]

**[FACT, S2–S8]** The released APIs differ: the v2026.2.24 README uses `imread(..., aszarr=True)`; v2026.9.20 uses `return_as='zarr'`. The 2026.5.2 release notes say `return_as` was added and `aszarr` deprecated, with other breaking Zarr-store and series changes. The captured v2026.9.20 README and supplied `master` README have the same full-body SHA-256, so those current docs were coherent at capture. Do not combine an older installed package with newer examples. This does not establish runtime compatibility with napari.

**Calibration failure and repair chain [FACT, S5–S8].** tifffile issue #319 reports TVIPS `PixelSizeX` changing from 1.4208036661148071 in 2026.2.20 to 1.4208036661148072e-09 in 2026.2.24, a factor of 1e9. Its title says 2026.2.26 while its body says 2026.2.24; preserve this discrepancy. Commit `edede6002c817f056d75125ade0b20332d549cca` comments out the nm-to-m division and links the issue. Its parent is test commit `7d9eaeddc710af068f9e8c2cf30b10a7d0e5c938`, which adds `test_issue_tvips_pixelsize` and asserts the TVIPS values, including `PixelSizeX == 1.4208036661148071`. The public sequence then records v2026.3.3 at release commit `503cb4eb74dd28a6acc36a0e4624ba9c2001e021`. This is a code, regression-test and release chain. The upstream fixture is private and was not run here. The chain does not prove every later release or instrument; behavior in the proposed v2026.9.20 lock stays a fixture gate.

**[EXECUTED BY CANDIDATE, W1]** A stdlib arithmetic check of the issue values returned ratio 999999999.99999988, relative distance 1.19e-16 from 1e9, exit 0. It verifies the reported ratio only, not tifffile parsing. Code and receipt are in `witnesses.json`.

## Independent precedents

- **OME-NGFF 0.5 [S1]** is a community specification independent of a viewer or TIFF parser. Its named axes, units and ordered scale/translation transforms provide geometry vocabulary. Keep an explicit affine extension for orientations its restricted transforms cannot express.
- **tifffile v2026.9.20 [S2–S8]** is an independent TIFF implementation. It documents page/tile/strip access through a TIFF-backed Zarr interface. A partial slice is a mechanism, not a latency or memory guarantee; this interface does not establish arbitrary OME-Zarr input support.
- **napari docs [S9–S10]** are an independent viewer precedent: lazy array layers, multiscale/channel display, contrast mapping separate from samples, and data-to-world units. These are moving `main` snapshots, not an installed release or proof of integration.
- **QuPath 0.7.0 docs [S11–S12]** are a separate application precedent for image-server project entries, relocation and export contracts. Its export docs state pixel units and a top-left full-resolution origin, and warn that other tools may expect different coordinates. Borrow the explicit contract, not the whole product.

## Architecture and workflow

**[INFER]** Separate immutable source bytes, derived image artifacts and view state. A reader service supplies regions/chunks; a project service owns source identity, verbatim/interpreted metadata, axes/calibration, annotations, styles, edit history and export manifests. Use a napari plugin first because its documented layer model covers useful display/annotation mechanisms. Own persistence and undo/redo. If no compatible released napari/Qt set passes integration, use a Qt canvas with the same reader/project services. Component documentation does not establish full app behavior.

| Step | Proposed behavior |
|---|---|
| Create/import | Create a project; register local source read-only; stream size/SHA-256 with progress; preserve original metadata bytes. Cancel leaves a resumable/removable incomplete entry and never rewrites source samples. |
| Inspect | Show parsed and verbatim metadata, provenance, shape/dtype, axis order and calibration. Show conflicts as readable text with choices: correct mapping, treat spatial axes as uncalibrated pixels, or leave unresolved. Record corrections and retain original values. |
| Navigate/display | Choose channels, intensity mapping, slice/time and zoom. Persist these as view state only; contrast changes have no source write path. |
| Annotate | Points, polygons and masks; plane, volume and acquisition scope; reusable styles; keyboard operation; undo/redo. Plane geometry binds z,t; volume geometry uses z,y,x and optional t; acquisition notes carry spatial coordinates only when explicitly supplied. |
| Save/reopen | Commit state, close, relocate and reopen on another workstation after source identity checks. Referencing and copying source data are explicit choices. |
| Export/verify | Export a coordinate table or overlay and a small derived raster. Sidecar names source hash, frame, axis order, units, origin convention, plane/channel, display mapping baked into rendering, operations and output hash. Compare source before/after and state what changed. |

## Data contract

**[CHOICE]** Use a versioned project directory with manifest, source records, annotations, derived artifacts, export manifests and discardable cache. Source fields include stable ID, URI and last resolved path, byte size, whole-file SHA-256, format, reader/version, shape/dtype, original metadata verbatim or by content-addressed sidecar, and status (`ok`, `ambiguous`, `unsupported`, `incomplete`). Hash incrementally with progress; a partial hash is not verified identity.

For each axis record its exact array position, name, type, length and unit or explicit unknown. Keep normalized calibration separate from native metadata. Fix one transform convention: binary64, row-major 4x4, column-vector multiplication from `[x_index,y_index,z_index,1]` to world coordinates. Integer indices identify sample centers; vector vertices use the same index frame. State axis order and units with every coordinate. Time has its own scale/origin; channels are categorical. Missing calibration permits pixel annotations but leaves physical coordinates unavailable. Unresolved orientation or units block physical export. Use NGFF scale/translation where it fits; otherwise store an explicit affine and convention. Never retain unnamed competing transforms.

Annotation records include ID, source ID/hash, geometry kind, coordinate axes/frame revision, binary64 vertices or mask artifact, scope, style ID, labels and edit provenance. Plane rows identify z,t; volume rows define 3D geometry/time scope; acquisition rows have explicit geometry or no spatial coordinates. Masks use aligned label arrays with shape, axis order, frame and checksum. Persist edit/correction operations for undo/redo and reopening.

Display state holds visible channels, per-channel contrast/window and LUT, slice/time and zoom/pan. A geometric transform or resampling records input/output hashes, matrix, interpolation, crop, dtype and software version, and creates a new derived image. Display adjustment never creates new pixel data. CSV exports state pixel and physical coordinates with per-column units. Raster overlays state dimensions, orientation, channel and plane/time. A derived image includes its operation chain and hash. Do not call local pixel-coordinate GeoJSON standards-compliant; QuPath’s docs warn that origin and units differ between tools [S12]. Add such an adapter only after defining a tested CRS/origin contract.

## Save, recovery and portability

**[INFER/CHOICE]** Write a new immutable project generation in the project filesystem, validate schema/hashes, flush files, switch a small current-generation pointer and retain the prior good generation. On open, validate current state and offer a prior generation if damaged, identifying recovered edits. Same-filesystem replacement must be tested on the target OS/filesystem. Linux `rename(2)` documents atomic replacement and an NFS caveat: a reported failure does not prove rename did not happen [S13]. This is not a guarantee for Windows, SMB or this group share. Use a single-writer lock, verify the committed generation after network saves, and test interruption/reopen on the actual share. Exports commit from temporary siblings only after validation; partials never replace good exports.

Default to references for large sources and include project metadata, annotations and small derivatives in exchange bundles. Offer explicit copying for portable sources. Store project-relative and prior resolved paths. On relocation, search and verify whole-file hash. A mismatch stays unresolved until the user accepts a new identity, marking linked annotations for review. Bundle exchange is v1 collaboration; no simultaneous writers to one project.

## Support boundary, assumptions and alternatives

**[CHOICE]** First profile: local single-file TIFF/BigTIFF and OME-TIFF, 2D or Z,Y,X spatial axes, explicit C/T axes, common integer/float dtypes and an enumerated codec set. Qualify every profile with instrument fixtures for samples, metadata, orientation, calibration and partial-region reads. tifffile’s format list is not universal compatibility; its docs list unsupported codec/color/metadata cases and formats needing stitching. Unsupported or ambiguous input remains recorded with original bytes untouched and annotation blocked until resolved. Defer arbitrary OME-Zarr 0.4/0.5 input: the reviewed tifffile feature is a Zarr view over TIFF, and NGFF is a specification, not a reader. Add a separate pinned NGFF reader only after qualification. Defer proprietary CZI, stitching-required slides, unexplained axes and >5D application models.

**[INFER]** Tifffile region access and napari lazy layers can support a design without a second full decoded copy, but prove neither the 3 GB target nor responsiveness. Tiling, strips, codecs, pyramids, cache and rendering affect cost. Critical dependencies are the exact napari/Qt release, reader integration, real-file performance, instrument calibration and shared-storage recovery. The supplied seed’s broad OME-Zarr input claim is narrowed.

**Opportunity:** after provenance/export checks, write derived rasters as OME-NGFF 0.5 and verify with an independent reader [S1]. **Plausible alternative:** evaluate QuPath if whole-slide review dominates; borrow its relocation/export lessons without claiming fit for volumes/time series [S11–S12]. Cloud, automatic segmentation, registration and concurrent collaboration are optional later work.

## Validation

1. **W1 executed:** arithmetic check of #319 values only; details in `witnesses.json`.
2. **UNEXECUTED API smoke test:** in the app build, use the locked release set to open tiled OME-TIFF with `return_as='zarr'`; check partial slice shape/dtype/values, versions and RSS. Avoid old-call-only assumptions and arbitrary NGFF input claims.
3. **UNEXECUTED calibration fixtures:** assert native metadata, normalized value/unit, axes, origin/orientation and pixels for each supported instrument on the exact reader lock. Fail qualification on drift.
4. **UNEXECUTED 3 GB test:** tiled and strip files on 8 cores/16 GB; measure peak RSS, decoded bytes, p95 viewport latency, cache ceiling and cancel latency. Proposed targets: no second source-sized decoded buffer, RSS below 4 GB, p95 tile below 100 ms, cancel below 250 ms. These are not results.
5. **UNEXECUTED coordinates/export:** anisotropic 3D data with nonzero origin and rotated affine; round-trip binary64 vertices/masks; export CSV, overlay and small resampled raster; check transform order, frame, source and output hashes.
6. **UNEXECUTED recovery/relocation:** interrupt import, generation write, pointer swap and export locally and on actual share; reopen; move reference/portable projects to another workstation; reject silent hash-mismatched relinking.
7. **UNEXECUTED accessibility:** perform minimum workflow keyboard-only and review textual calibration conflicts and recovery feedback.

These checks determine the first supported release boundary; component facts alone do not.