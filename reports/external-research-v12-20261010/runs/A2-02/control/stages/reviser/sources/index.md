# Reviser source index — A2-02-control

This index preserves source IDs S1–S21 from the investigator and critic maps without rebinding. S22 is a new, separately identified GitHub compare endpoint used to recheck the Mirador fix-to-release claim. Full version/commit identity, locator, access UTC, observed operation, governing condition, and applicability are in [../source-map.json](../source-map.json). Public-source review is research evidence, not product validation.

## Standards and coordinate model

- [S1 — IIIF Presentation API 3.0](https://iiif.io/api/presentation/3.0/) — 3.0.0; Canvas, annotations, requests and authentication.
- [S2 — IIIF Presentation API 2.1.1](https://iiif.io/api/presentation/2.1/) — prior version; Canvas, Sequence, AnnotationList and Layer structures.
- [S3 — IIIF Presentation API 3.0 Change Log](https://iiif.io/api/presentation/3.0/change-log/) — major-version annotation and property changes.
- [S4 — W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/) — textual bodies, selectors, specific resources.
- [S5 — W3C Media Fragments URI 1.0](https://www.w3.org/TR/media-frags/) — spatial xywh semantics.
- [S6 — IIIF Image API 3.0](https://iiif.io/api/image/3.0/) — remote image service, CORS, profiles, errors and authentication.
- [S7 — Image and Canvas with Differing Dimensions](https://iiif.io/api/cookbook/recipe/0004-canvas-size/) — Canvas coordinate space and aspect-ratio restriction.
- [S8 — Simplest Annotation: full Canvas](https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/) — whole-page targets and client-visible marker caveat.
- [S9 — Transcripts, Captions, and Subtitles](https://iiif.io/api/cookbook/recipe/0231-transcript-meta-recipe/) — download/rendering link, supplementing annotation and synchronized-text patterns.
- [S21 — Visible Text Resource on a Canvas](https://iiif.io/api/cookbook/recipe/0561-text-on-image/) — painted transcription versus commentary and client restrictions.

## Viewers and annotation mechanisms

- [S10 — IIIF Cookbook Viewer Matrix](https://iiif.io/api/cookbook/recipe/matrix/) — generated per-recipe viewer support matrix.
- [S11 — IIIF Viewers](https://iiif.io/get-started/iiif-viewers/) — high-level Mirador and Universal Viewer descriptions.
- [S12 — Announcing Mirador 4.0](https://github.com/ProjectMirador/mirador/discussions/4200) — breaking plugin/integration changes.
- [S13 — mirador-annotations README](https://github.com/ProjectMirador/mirador-annotations) — Mirador 3 plugin, local-storage example and server persistence boundary.
- [S18 — Annotorious release history](https://github.com/annotorious/annotorious/releases) — v3.4.0 candidate release.
- [S19 — Annotorious with OpenSeadragon and IIIF](https://annotorious.dev/guides/openseadragon-iiif/) — JSON and image-coordinate integration guide.
- [S20 — Annotorious Annotation Data Model](https://annotorious.dev/guides/data-model/) — native model and W3C adapter limits.

## Compatibility and release history

- [S14 — Mirador issue #4198](https://github.com/ProjectMirador/mirador/issues/4198) — missing annotation/layer notification badge report.
- [S15 — Mirador PR #4201](https://github.com/ProjectMirador/mirador/pull/4201) — merged badge repair; PR head 056262a, merge commit 25c0b0e.
- [S16 — Mirador v4.2.4 release](https://github.com/ProjectMirador/mirador/releases/tag/v4.2.4) — release tag commit 73fafe9; ancestry check is separately recorded as S22.
- [S17 — Universal Viewer release history](https://github.com/UniversalViewer/universalviewer/releases) — v4.4.4 candidate and unusable-tag notices as observed at access time.
- [S22 — GitHub compare: Mirador PR merge to v4.2.4](https://api.github.com/repos/ProjectMirador/mirador/compare/25c0b0e...73fafe9) — read-only compare; merge base 25c0b0e confirms the fix commit is in release history.

