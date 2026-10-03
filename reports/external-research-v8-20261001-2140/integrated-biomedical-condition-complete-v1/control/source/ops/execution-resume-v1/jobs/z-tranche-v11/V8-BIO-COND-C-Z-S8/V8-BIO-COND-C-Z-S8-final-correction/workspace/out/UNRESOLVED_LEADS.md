# Unresolved consequential leads — V8-BIO-COND-C-Z-S8 (final correction)

Only dependencies/uncertainties that could still change the corrected proposal's decisions
are listed. Each names the decision it affects and the next concrete step. Correction-stage
note: CR-1–CR-7 from `inputs/CRITIQUE.md` are resolved in `out/FINAL_PROPOSAL.md` (§1
dispositions); the leads below are the ones the critique did **not** resolve and that no
packaged capture could resolve.

1. **Pixel-center vs corner extent convention (affects §8 extent predicate, ε, and
   V4/V11/V13–V15 expectations).** napari #6320 (open, captured) shows the reference desktop
   viewer itself has an unresolved multiscale image/label shift from the center-vs-corner
   convention, noticeable when scale approaches layer-dimension magnitude. The corrected
   proposal fixes a corner-based half-open extent convention as a product choice; if the
   upstream convention settles differently, every endpoint in the predicate shifts by half a
   pixel and ε semantics change. Next step: pin napari, run V4/V13–V15, and track #6320
   before implementation.
2. **napari v0.9.x per-level API surface (affects §3 recommendation mechanics).** #9121
   (captured, open) establishes that `.scale` is single-level; 0.9.2's new [third-party excerpt omitted] action (#9495) suggests the API is moving. Which stable, public API
   exposes/forces level switching in the embedded widget must be verified against the pinned
   version at implementation time; if none is adequate, the fallback is feeding napari a
   list of arrays and owning switching in the shell.
3. **Real-world prevalence of (a) `multiscales.coordinateTransformations` and (b) the
   `"unit"` prose spelling (affects §7 composition and the §6 unit gate).** Both are legal
   but ignored/absent in parts of the ecosystem (#172 open since 2022; v0.19.2 reads only
   dataset-level transforms and silently carries inline units — corrected grounding, CR-2;
   prose says `unit`, schema/examples say `units`). The prototype handles both, but their
   frequency in the scientist's actual datasets is unknown and was not measurable from the
   captured sources. Next step: survey the target datasets before freezing the parser.
4. **Vitessce OME-NGFF 0.5/0.6 status at v4.0.10 (affects the §3 component choice only if
   revisited).** Inferred from #2343 (open dependency listed 2025-11) that 0.4 is the
   supported baseline; the release metadata itself was not independently re-retrieved
   (critique §5.3). Only consequential if the napari-embed approach fails review.
5. **Unexecuted arithmetic and tests.** The §9 witness (42.5/42.0/22.5 µm and all extent
   cases) and all of V1–V16 are derived/proposed only — no arithmetic-executing
   deterministic tool is admitted in this environment and no runtime exists here. They must
   be executed in the implementation sandbox before any "passing" claim is made.
6. **Critique-side residuals (non-load-bearing, marked for completeness).** (a) napari
   #8814's "writer-side cropped levels" detail lives in unretrieved issue comments; used
   only as labeled third-party corroborating history. (b) The ome/ngff 0.4.0 tag→commit
   mapping (`0f033738…`) was not independently re-checked, but the captured blob's content,
   line count (934), sha, and every cited locator verify against the published 0.4 spec.
   Nothing in the proposal's decision chain depends on (a) or (b).
