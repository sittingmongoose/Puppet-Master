# Unresolved consequential leads — V8-BIO-COND-C-Z-S8

Only dependencies/uncertainties that could change the proposal's decisions are listed.
Each names the decision it affects and the next concrete step.

1. **Pixel-center vs corner extent convention (affects §6 extent test and the overlay
   gate).** napari #6320 (open, captured) shows the reference desktop viewer itself has an
   unresolved multiscale image/label shift from the center-vs-corner convention, noticeable
   when scale approaches layer-dimension magnitude. The proposal fixes a corner-based
   half-open extent convention as a product choice; if the upstream convention settles
   differently, ε and V4/V11 expectations shift. Next step: pin napari, run V4, and track
   #6320 before implementation.
2. **napari v0.9.x per-level API surface (affects §1 recommendation mechanics).** #9121
   (captured, open) establishes that `.scale` is single-level; 0.9.2's new [third-party excerpt omitted] action suggests the API is moving. Which stable, public API exposes/forces
   level switching in the embedded widget must be verified against the pinned version at
   implementation time; if none is adequate, the fallback is feeding napari a list of
   arrays and owning switching in the shell.
3. **Real-world prevalence of (a) `multiscales.coordinateTransformations` and (b) the
   `"unit"` prose spelling (affects §5 composition and the §4 unit gate).** Both are legal
   but ignored/absent in parts of the ecosystem (#172 open since 2022; v0.19.2 reads only
   dataset-level transforms; prose says `unit`, schema/examples say `units`). The proposal
   handles both, but their frequency in the scientist's actual datasets is unknown and was
   not measurable from the captured sources. Next step: survey the target datasets before
   freezing the parser.
4. **Vitessce OME-NGFF 0.5/0.6 status at v4.0.10 (affects the §1 component choice only if
   revisited).** Inferred from #2343 (open dependency listed 2025-11) that 0.4 is the
   supported baseline; not verified against current loader code. Only consequential if the
   napari-embed approach fails review.
5. **Unexecuted arithmetic and tests.** The §7 witness (42.5/42.0/22.5 µm) and all of V1–V12
   are derived/proposed only — no arithmetic tool is admitted in this environment and no
   runtime exists here. They must be executed in the implementation sandbox before any
   "passing" claim is made.
