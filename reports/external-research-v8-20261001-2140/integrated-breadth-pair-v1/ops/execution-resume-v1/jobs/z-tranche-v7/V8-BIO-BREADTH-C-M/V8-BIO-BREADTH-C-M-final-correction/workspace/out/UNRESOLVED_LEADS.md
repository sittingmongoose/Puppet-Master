# UNRESOLVED_LEADS — consequential dependencies/uncertainty only (final-correction stage)

Companion to `out/FINAL_PROPOSAL.md` (V8-BIO-BREADTH-C-M). Each lead states what is unresolved,
why it is consequential, and the concrete next verification. Nothing here blocks the proposal's
validity; each item would change an implementation decision if resolved differently. Updated after
applying critique corrections C1–C6: lead 1 is partially resolved by this stage's napari v0.7.1
release capture (S7′), lead 5 is widened by C4, and lead 6 is added from the critique's residual
unknowns.

1. **napari deployment floor vs prototype pin.** The proposal now pins **napari ≥ 0.7.1** for both
   `locked_data_level` (S9) and the units-aware scale bar (S7′). That v0.7.1 exists and ships both
   is **resolved** (release published 2026-06-15, capture `8016c43e…`). Still unresolved: whether
   the deployment environment can accept that floor. Consequential for plan steps 2–3: if an older
   napari must be pinned, the two-layer fallback applies and the scale indication must become a
   product-owned readout (below 0.7.1 the scale bar shows no units, S7′). Next verification: pin
   the desktop environment's napari and confirm ≥ 0.7.1, or commit to the fallback path.

2. **vizarr's exact transform-composition semantics.** `src/ome.ts` (S4) builds per-source model
   matrices via `utils.coordinateTransformationsToMatrix(...)`; `src/utils.ts` was never captured,
   so its composition order (dataset vs multiscales-level; axis ordering) is unverified.
   Consequential only if vizarr is reused as a reference implementation for the B2/B3 math; the
   recommended napari path does not depend on it. Next verification: capture
   `hms-dbmi/vizarr` `src/utils.ts` @ `master` and compare against S1's application-order rules.

3. **ome-zarr-py behavior on the proposal's refusal cases.** Only its v0.19.2 release notes were
   captured (S11); its handling of label level-count mismatch, `path`-based transforms, and >1
   listed label was not. Consequential for plan step 1 (reuse the reader vs own contract checks).
   Next verification: capture `ome_zarr` reader/validator sources and test the B1 refusal matrix
   against them.

4. **Overlay alignment tolerance ε.** ε = half a level-0 pixel is a [PRODUCT] choice; the format
   specifies no tolerance. Consequential for B3 admission test 4 (false refusals vs silent
   misalignment). Next verification: agree ε with the intended scientist users against real
   producer conventions.

5. **Label-value range vs rendering cap (widened by C4).** The documented incorrect-rendering
   caveat ("more than 1024 distinct colors") sits in the docstring of napari v0.6.5's **deprecated**
   `color` dict mapping (S8); behavior of the modern `DirectLabelColormap` path at/above the cap is
   **unverified**. Consequential for rendering large-id categorical labels (e.g., sparse uint32
   ids) in the F-series. Next verification: bound expected label counts in the input contract, or
   test `DirectLabelColormap` behavior at the cap on the pinned napari.

6. **napari v0.9.2 release-object status for S10.** PR #9495 is verified merged into closed
   milestone 0.9.2 (critic capture `3df623b1…`), but no v0.9.2 **release** object was captured, so
   "shipped in v0.9.2" is not separately established. Not consequential for the proposal's use of
   S10 (corroborating evidence that level switching must re-derive scale/translate, which stands on
   the merge record alone), but would matter if level extraction itself were reused. Next
   verification: capture `…/napari/releases/tags/v0.9.2` if that feature is ever depended upon.
