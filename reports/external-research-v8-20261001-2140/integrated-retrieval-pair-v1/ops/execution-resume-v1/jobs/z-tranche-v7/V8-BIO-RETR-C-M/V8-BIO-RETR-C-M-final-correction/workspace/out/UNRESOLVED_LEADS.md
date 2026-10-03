# Unresolved consequential leads — V8-BIO-RETR-C-M (final-correction stage, 2026-10-03)

Consequential dependencies/uncertainty that remain after research and correction. Each lists why it
matters and the next concrete check. Nothing here is asserted resolved, and **no proposed test has
been executed in this case**. Status updates from the correction stage are marked.

1. **napari plugin transform mapping (affects B2 implementation reuse).** `ome_zarr/reader.py@master`
   (fresh capture sha256 `c46ba936…`, 2026-10-03) surfaces only per-dataset
   `coordinateTransformations` in `node.metadata`; where the napari plugin converts those into layer
   `scale`/`translate` was not captured (the conversion lives outside the captured file).
   Consequence: we planned our own calibration module, but if the plugin's mapping is verified we
   could reuse it; if it diverges (e.g., ignores group-level transforms), reusing it would silently
   drop §3.4 multiscales-level transforms. Next check: capture `ome_zarr/napari/` sources at a
   pinned ref and compare against our composed-transform unit tests.

2. **Reader-side support for multiscales-level `coordinateTransformations` (affects B2).**
   *Re-confirmed open 2026-10-03*: the fresh `reader.py` capture builds
   `node.metadata["coordinateTransformations"]` exclusively from `datasets[].coordinateTransformations`;
   group-level transforms are never read. ome-zarr-py issue #172 (open since 2022-03-02) documents
   the writer-side gap. Our module composes group-level transforms per §3.4 ("applied after"), but
   upstream reader behavior is absent — relevant if we ever let the plugin own layer scales.

3. **vizarr version pinning (affects the B4 comparison's reproducibility).** *Re-confirmed open*:
   releases API body `[]` (fresh capture sha256 `4f53cda1…` — corrected locator per critique C2);
   `package.json@master` says 0.3.0 while the default branch is `main`. Which deployable snapshot
   contains PRs #261/#298 is not identifiable from a release tag; if vizarr is ever reconsidered,
   pin by the merge commit of #298 and re-verify
   `utils.coordinateTransformationsToMatrix` (it still reads only `datasets[0]` per the #261 diff).

4. **Open/unfixed upstream defects in the calibration path (affects trust in reuse).** vizarr #271
   (3D translation makes images disappear) was open at critique capture time (2025-04-03 created,
   state open). vizarr #288 (per-level anisotropic scale ignored in rendering) was closed by the
   reporter on 2025-09-12 **without a cross-referenced fix PR**; the fresh comments capture
   (`6a6eb50e…`, last comment 2025-07-28) confirms the maintainer's diagnosis ("I don't think that
   vizarr is taking the `dataset/scale` into account") and that the workable fix was deleting the
   last level from the JSON. If either is fixed later, the Q3 supporting history must be re-checked
   before citing the "no automated tests in fix diffs" lesson as current.

5. **napari labels rendering at pyramid levels (affects B3 sampling claim).** The nearest-neighbor,
   per-level-transform sampling is a product choice resting on napari labels-layer behavior; that
   napari 0.9.2 resamples labels through layer `scale`/`translate` with nearest-neighbor at every
   zoom level was not verified against napari sources. Mitigation in design: the alignment gate
   compares composed physical extents before display, and F4 discriminates this behavior once
   implemented.

6. **Unit conversion scope (affects B2 display).** Axes units are UDUNITS-2 names per §3.1 (SHOULD),
   but the prototype displays them verbatim without conversion (Å vs µm mixes would mislead). Kept
   as an explicit limit; UDUNITS-backed conversion is the follow-up if the scientist's inputs mix
   units.

7. **Relative-vs-absolute scale ambiguity (affects B2 semantics badge).** §3.4 allows scale values
   to be absolute physical sizes *or* factors relative to level 0 when scaling information is not
   available or applicable ("for the given axis, defaulting to 1.0 if there is no downsampling
   along the axis" — full conditional now quoted per critique C3). No metadata field disambiguates
   them; our visible badge is a product mitigation. A normative clarification upstream (ome/ngff)
   would resolve this; open lead, not a blocker for the two-level prototype.

8. **`path`-form transform vectors (new, from critique C4).** §3.3 permits `scale`/`translation`
   vectors as `"path":str` ("binary data at a location in this container"). The prototype refuses
   such inputs with an explicit reason (B1/F6b) instead of loading them [P]. Consequence:
   spec-conformant datasets using external vector storage are unusable in v1. Next checks: (a)
   survey whether real 0.4 writers emit `path` form in practice; (b) if they do, implement in-
   container vector loading behind the existing gate; (c) verify what ome-zarr-py/vizarr do with
   `path`-form transforms (unverified in this case).
