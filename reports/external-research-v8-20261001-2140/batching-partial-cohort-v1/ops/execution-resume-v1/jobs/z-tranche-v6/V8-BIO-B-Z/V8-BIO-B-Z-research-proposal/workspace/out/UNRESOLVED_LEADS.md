# Unresolved consequential leads (V8-BIO-B-Z)

Only dependencies/uncertainties that can change the prototype's behavior or block an obligation.
Nothing here is asserted as resolved; none of the proposed checks below has been executed.

1. **napari version pin (blocks implementation, not design).** No version-specific napari source
   was captured in this stage; the design deliberately computes physical cursor coordinates and
   scale bars in our own layer (PROPOSAL § B2), so napari is only a canvas. Lead: pin a current
   stable napari, smoke-test two-level display + overlay draw order, and record the version in
   the input contract. If pinning fails, the fallback is a minimal Qt canvas reusing the same
   resolver modules.

2. **zarr-python compatibility pin for local Zarr v2 stores with ome-zarr-py v0.19.2.** Upstream
   test changes reference zarr ≥ 3.3 codec behavior (v0.19.0 notes) but this stage did not
   capture the dependency manifest. Lead: confirm the exact zarr-python versions supported by
   ome-zarr-py v0.19.2 for local v2 stores and pin; the B1 read-only contract depends on it.

3. **Multiscales-level `coordinateTransformations` composition fixture.** S1 permits
   multiscales-level transforms applied after per-dataset ones, and ome-zarr-py v0.19.2 does not
   parse them (observed, reader.py). Our resolver must compose both; no upstream reference
   behavior exists to copy, so a dedicated fixture (dataset scale+translation with an additional
   multiscales-level translation) should be added to the F-series before implementation.

4. **vizarr upstream status (conditional lead).** Open vizarr issues #271 (3D translation)
   and #262 (blank canvas on conformant 0.4) were open as captured (2026-10-03). They matter only
   if the product later pivots to the web/notebook embedding condition named in proposition P1;
   track their resolution before any such pivot.

5. **Label axis-equality semantics.** S1's layout note that label dimensions should equal the
   image's or be 1 is informative text, and B3 precondition 2 currently demands name/type
   equality per level. If real files in the target environment use size-1 label axes (e.g.
   missing `c`), precondition 2 should be relaxed to broadcast-compatible axes; decide against
   target-environment samples before freezing the refusal rule.
