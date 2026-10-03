# V8-BIO-RETR-T-M — Unresolved consequential leads

Only consequential dependencies/uncertainty; each lead blocks a specific proposal claim from being treated as verified. Nothing here was resolvable from the admitted public captures within this stage.

- **L1 — napari read-only affordances (affects B1).** napari v0.9.2 (S3) is a general viewer; the exact mechanism for locking layers against editing (e.g., a non-editable labels layer / restricted controls) was not verified from captured docs and must be confirmed against v0.9.2 at implementation time before claiming a read-only boundary.

- **L2 — ome-zarr-py 0.4 → napari layer parameter mapping (affects B2/B3).** `ome_zarr/reader.py` @ v0.19.2 (S12) surfaces per-dataset `coordinateTransformations` in `node.metadata` but the code that converts them into napari layer scale/translate lives outside the captured file. Whether it composes the multiscale-level transform (§3.2 "applied after them") and handles the 0.4.1 relative-scale reading must be confirmed before the prototype can delegate calibration math to the reader instead of its own interpreter (§6 step 3).

- **L3 — ome-zarr-py version coverage (affects B1).** v0.19.2's current class API and its newest regression test use 0.5/0.6-style metadata (`"version": "0.6"`, transforms with `input`/`output`, S11); continued first-class maintenance of the 0.4 legacy reader path needs confirmation at pin time.

- **L4 — vizarr fallback pin (affects §2.3 fallback only).** All calibration/labels behavior is on untagged `main` (S4: newest tag `v0.3.0`; S5: package version `0.3.0`); if the webview fallback is ever used, a concrete commit ≥ PR #298 must be pinned and vendored, and the open 3D regression (issue #271, S13) re-checked for 2D-only impact.

- **L5 — negative-scale rendering (fixture F9).** The 0.4 spec permits any float scale values (only length/order are constrained, §3.2); whether the chosen rendering stack displays negative (flipped) scales correctly was not verified — vizarr issue #297 shows one upstream instance of exactly this failing. F9 stays in the proposed battery with its expectation marked unverified.

- **L6 — exact upstream repair commit for the `fitImageToViewport` typo (affects §4.1 lesson only).** PR #261's diff has `availableHeight / (maxY - minX)`; `src/utils.ts` @ `main` has `(maxY - minY)` (S6 vs S9). The repairing commit was not identified; the lesson and fixture F2 do not depend on it.

- **L7 — `image-label.source.image` precedence in ambiguous layouts (affects B3 step 2).** 0.4 gives the default `"../../"` (S1 `#label-md`) but does not state precedence when `source.image` is present yet inconsistent with the directory position; the prototype withholds on inconsistency (product rule), and any stronger rule would need a normative source not found in 0.4.
