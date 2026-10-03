# Unresolved consequential leads — V8-BIO-BATCH-C-Z research-proposal stage

Only consequential dependencies/uncertainties are listed. Each names the affected obligation and the concrete follow-up. Nothing here is claimed as verified.

1. **ome-zarr-py reading support for multiscales-level `coordinateTransformations` (affects B2/P2).** Issue #172 (open since 2022-03-02, `ome/ome-zarr-py/issues/172`) documents missing support at the API level; the captured body addresses *writing* such metadata, so whether current v0.19.2 *reads* multiscales-level transformations correctly is unverified. Consequence neutralized by design: the prototype composes transformations itself from raw `.zattrs` and does not depend on any library for this rule; the witness (PROPOSAL §8.2) tests our rule, not a library's.

2. **napari-ome-zarr #171 — reader writes to disk on open (affects B1).** Open as of 2026-10-01 (`ome/napari-ome-zarr/issues/171`): opening a label store creates an empty `zarr.json` in a parent directory via default-mode group open. Unresolved upstream. Consequence: our read-only boundary must not route group opening through that code path; audit fixture V11 (UNEXECUTED) is the guard.

3. **napari-ome-zarr #99 — multiple labels groups / labels-only stores (affects B3).** Open since 2024-01-24: only the first labels group is loaded; a labels-only store fails to read. Our prototype supports the single optional label of the brief and refuses/withholds beyond that; deeper multi-label behavior remains unverified and is out of scope unless the product grows.

4. **Relative-vs-absolute `scale` ambiguity on non-first levels (affects B2).** S1 (`ome/ngff@0.4.1`, `0.4/index.bs`, § multiscales) permits a non-first level's scale to be a factor relative to the first dataset when absolute scaling is unavailable. In edge cases the metadata alone cannot disambiguate absolute pixel sizes from such factors. The prototype's level-0-anchored normalization plus withheld-readout fallback is a documented convention choice, not a spec-derivable resolution; a survey of writer conventions (e.g., bioformats2raw output) would strengthen it but was out of this stage's scope.

5. **vizarr 0.3.0 label-overlay capability (affects RQ1 comparison completeness).** The 0.3.0 README documents no label-overlay feature; the code was not inspected. Irrelevant to the chosen approach (vizarr is the rejected comparator) but would be needed if the comparison were revisited.

6. **napari scale-bar/unit-display internals (affects B2 display).** napari 0.9.2's built-in scale-bar behavior against declared axis units was not captured. Consequence neutralized by product choice: the prototype renders its own scale indication and cursor readout from the same interpretation module, so no napari display semantics are load-bearing.

7. **Specification silence on label/image frame sharing (affects B3).** NGFF 0.4 contains no normative clause guaranteeing that a label group's physical frame coincides with its image's (each group declares its own mapping; the layout figure's "same or 1" dimension comment is non-normative prose). The overlay-justification check (PROPOSAL §7 step 3) is therefore a reader-established inference, and the refusal state is the honest bound of what the format supports. No upstream fix can be cited because nothing is broken upstream — this is a format-property limit, not a defect.

No other consequential dependencies were identified. Proposed tests/arithmetic (PROPOSAL §7 fixtures V1–V11, §8.2 witness) remain UNEXECUTED pending an implementation stage with an admitted execution path.
