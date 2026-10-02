# UNRESOLVED LEADS — V8-BIO-P-Z (consequential only)

1. **napari v0.9.2 unit readout API.** Captured evidence shows units are integrated (release note #9411 "Avoid redundant unit conversion when aggregating layer extents"; a units application registry in the #9065 test hunk) and `Cursor.position` is world-coordinate (captured `cursor.py` @ v0.9.2), but the exact v0.9.2 API for formatting a world coordinate into a physical-unit string for B2's readout was not captured. Consequential: B2 display string. Action: inspect `napari.utils` units/`get_application_registry` at implementation time and pin the call.

2. **itk-vtk-viewer 14.51.0 calibration surface.** The captured public `index.d.ts` shows `image`/`labelImage`/Zarr `Store` options but no axis/unit or NGFF-metadata API. If the product flips to the embeddable-web variant (PROPOSAL §2 tradeoff), a calibration capability probe of exactly v14.51.0 is required before adoption. Consequential: the fallback component choice.

3. **Voxel center-vs-corner convention.** napari #6320 ("Multiscale layers have a shift due to handling of center vs corner of pixel/voxel") remains **open** upstream; PR #9065 fixed only the 3D half-voxel variant. NGFF 0.4 §3.3 declares index→physical mappings without fixing the sampling convention. The prototype declares voxel-center (PROPOSAL §7), but cross-tool agreement is not guaranteed. Consequential: sub-voxel overlay registration claims and the W3/T3e consistency checks.

4. **Zarr v2 compressor support matrix.** NGFF 0.4 mandates Zarr v2 arrays (§2) but the accepted compressor set for the prototype's reader (`null`/`zlib`/`blosc`?) is a product pin not yet fixed; `E-ZARR` behavior depends on it. Consequential: B1's unsupported-input path. Action: pin the matrix with the chosen Zarr reading library version at implementation time.

*(No execution receipts exist for any proposed validation; see PROPOSAL §9.3.)*
