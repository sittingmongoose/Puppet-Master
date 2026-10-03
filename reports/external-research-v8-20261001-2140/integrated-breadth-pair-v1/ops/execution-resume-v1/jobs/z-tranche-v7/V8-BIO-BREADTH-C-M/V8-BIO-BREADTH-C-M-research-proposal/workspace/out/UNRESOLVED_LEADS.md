# UNRESOLVED_LEADS — consequential dependencies/uncertainty only

Companion to `out/PROPOSAL.md`. Each lead states what is unresolved, why it is consequential,
and the concrete next verification. Nothing here blocks the proposal's validity; each item would
change an implementation decision if resolved differently.

1. **napari version availability for explicit level control.** Manual multiscale level locking
   (`locked_data_level`) exists only from napari 0.7.1 (PR #8917, merged 2026-05-13). Consequential
   for plan step 3: if the deployment must pin an older napari, fall back to two-layer management.
   Next verification: pin the desktop environment's napari and confirm ≥ 0.7.1, or implement the
   two-layer fallback.

2. **vizarr's exact transform-composition semantics.** `src/ome.ts` builds per-source model
   matrices via `utils.coordinateTransformationsToMatrix(...)`; `src/utils.ts` was not captured, so
   its composition order (dataset vs multiscales-level; axis ordering) is unverified. Consequential
   only if vizarr is reused as a reference implementation for the B2/B3 math; the recommended
   napari path does not depend on it. Next verification: capture `src/utils.ts` and compare against
   the S1 application-order rules.

3. **ome-zarr-py as reader vs minimal custom parser.** v0.19.2 is pinned as evidence, but its
   handling of our refusal cases (label level-count mismatch, `path`-based transforms, >1 listed
   label) was not captured; only its release notes were. Consequential for plan step 1 (reuse
   reader vs own contract checks). Next verification: capture `ome_zarr` reader/validator sources
   and test the B1 refusal matrix against them.

4. **Overlay alignment tolerance ε.** The proposal sets ε = half a level-0 pixel as a product
   choice; the format does not specify any tolerance. Consequential for admission test 4 (false
   refusals vs silent misalignment). Next verification: agree ε with the intended scientist users
   against real producer conventions.

5. **Label-value range vs rendering cap.** napari v0.6.5 documents incorrect rendering above 1024
   distinct colors; large-id categorical labels (e.g., sparse uint32 ids) may exceed it.
   Consequential for F-series rendering on pathological inputs. Next verification: bound expected
   label counts in the input contract or test `DirectLabelColormap` behavior at the cap.
