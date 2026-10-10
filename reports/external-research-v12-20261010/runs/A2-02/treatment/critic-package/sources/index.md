# Critic source index

Stable source IDs S01–S14 are carried unchanged from the investigator handoff; the accompanying [source-map.json](../source-map.json) preserves each exact URL, version/commit, locator, original access time, operation, conditions, and applicability, with a separate critic review note. Local bounded source descriptions remain in the immutable handoff at `handoff/stages/investigator/sources/`.

## Standards and coordinates

- [S01 — IIIF Presentation API 3.0](https://iiif.io/api/presentation/3.0/) — Canvas IDs, bounds, annotation pages, non-painting annotation distinction.
- [S02 — Presentation API 3 change log](https://iiif.io/api/presentation/3.0/change-log/) — v2 `otherContent` to v3 Annotation Page transition.
- [S03 — Cookbook 0004, differing Canvas/image dimensions](https://iiif.io/api/cookbook/recipe/0004-canvas-size/) — stable Canvas space and its aspect-ratio condition.
- [S04 — W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/) — body/target, FragmentSelector and `xywh`.
- [S05 — IIIF Image API 3.0](https://iiif.io/api/image/3.0/) — compliance levels, static responses, access conditions.
- [S06 — IIIF Content State API 1.0](https://iiif.io/api/content-state/1.0/) — resource/view transfer, distinct from annotation record exchange.

## Viewer and compatibility evidence

- [S07 — Mirador 4.0.0 release](https://github.com/ProjectMirador/mirador/releases/tag/v4.0.0) — breaking plugin/integration migration boundary.
- [S08 — Mirador 4.2.6 release](https://github.com/ProjectMirador/mirador/releases/tag/v4.2.6) — exact candidate release identity.
- [S09 — mirador-annotations pinned README](https://github.com/ProjectMirador/mirador-annotations/blob/f2e80c7c8400f7802d4e89d88956ecdaa2546d64/README.md) — Mirador 3 authoring and persistence boundary.
- [S10 — mirador-annotations issue #75](https://github.com/ProjectMirador/mirador-annotations/issues/75) — reported install conflict and unverified master-branch follow-up.
- [S11 — MAE pinned README](https://github.com/ARVEST-APP/mirador-annotation-editor/blob/a0eb08d7c7e0c1b2e409b39dbb2a573e6bd9ad70/README.md) — stated runtime target and candidate integration.
- [S12 — Universal Viewer v4.4.4 configuration](https://github.com/UniversalViewer/universalviewer/blob/v4.4.4/manual/CONFIG.md) — configurable image-download defaults; not annotation exchange.
- [S13 — Universal Viewer release history](https://github.com/UniversalViewer/universalviewer/releases) — v4.4.3 merge-error warning and v4.4.4 release identity.
- [S14 — IIIF viewer guide](https://guides.iiif.io/using_iiif_resources/) — community-guide viewer comparison and handoff; not first-party product documentation.

Independent primary-page review was read-only. Web retrieval did not expose an exact per-page access timestamp; the exact timestamps in `source-map.json` are the original immutable handoff access records, and the critic review records this limitation rather than assigning invented times. No product or collection behavior was tested.
