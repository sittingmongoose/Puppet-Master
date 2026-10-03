# Unresolved consequential leads — V8-BIO-RETR-C-M research stage

Consequential dependencies/uncertainty that remain after research (per TASK.md). Each lists why it
matters and the next concrete check. The proposal does not assert these are resolved, and no
proposed test has been executed in this stage.

1. **napari plugin transform mapping (affects B2 implementation reuse).** `ome_zarr/reader.py@master`
   (capture sha256 `c46ba936…`) surfaces only per-dataset `coordinateTransformations` in
   `node.metadata`; where the napari plugin converts those into layer `scale`/`translate` was not
   captured (the conversion lives outside the captured file). Consequence: we planned our own
   calibration module, but if the plugin's mapping is verified we could reuse it; if it diverges
   (e.g., ignores group-level transforms), reusing it would silently drop §3.4 multiscales-level
   transforms. Next check: capture `ome_zarr/napari/` sources at a pinned ref and compare against
   our composed-transform unit test.

2. **Reader-side support for multiscales-level `coordinateTransformations` (affects B2).** ome-zarr-py
   issue #172 (open since 2022-03-02) documents the writer-side gap; the reader-side behavior in the
   captured `reader.py` shows only datasets-level transforms surfaced. Our module composes
   group-level transforms per §3.4 ("applied after"), but upstream behavior is unverified — relevant
   if we switch to letting the plugin own layer scales.

3. **vizarr version pinning (affects the B4 comparison's reproducibility).** vizarr publishes no
   GitHub releases (releases API `[]`); `package.json` on branch `master` says 0.3.0 while the
   default branch is `main`. Which deployable snapshot contains PRs #261/#298 is not identifiable
   from a release tag; if vizarr is ever reconsidered, pin by merge commit of #298 and re-verify
   `utils.coordinateTransformationsToMatrix` (it still reads only `datasets[0]` as of the #261 diff).

4. **Open upstream regressions in the calibration path (affects trust in reuse).** vizarr #271 (3D
   translation makes images disappear) was open at capture time; vizarr #288 (per-level anisotropic
   scale ignored in rendering) was closed without a cross-referenced fix PR in its timeline. If
   either is fixed later, the Q3 supporting history should be re-checked before citing the "no
   automated tests in fix diffs" lesson as current.

5. **napari labels rendering at pyramid levels (affects B3 sampling claim).** The proposal's
   nearest-neighbor, per-level-transform sampling is a product choice on napari labels-layer
   behavior; that napari resamples labels through layer `scale`/`translate` with nearest-neighbor at
   every zoom level was not verified against napari 0.9.2 sources. Mitigation in design: the
   alignment gate compares composed physical extents before display, and F4 discriminates this
   behavior once implemented.

6. **Unit conversion scope (affects B2 display).** Axes units are UDUNITS-2 names per §3.1, but the
   prototype displays them verbatim without conversion (e.g., Å vs µm mixes would mislead). Kept as
   an explicit limit; a UDUNITS-backed conversion is the follow-up if the scientist's inputs mix
   units.

7. **Relative-vs-absolute scale ambiguity (affects B2 semantics badge).** §3.4 allows scale values
   to be absolute physical sizes *or* factors relative to level 0 when scaling info is
   unavailable/applicable. No metadata field disambiguates them; our visible badge is a product
   mitigation. A normative clarification upstream (ome/ngff) would resolve this; tracking it there
   is an open lead, not a blocker for the two-level prototype.
