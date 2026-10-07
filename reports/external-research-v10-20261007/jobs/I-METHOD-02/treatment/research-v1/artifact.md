# I-METHOD-02 — researcher proposed revision

First useful saved finding: 2026-10-07T19:28:50Z. Complete draft saved: 2026-10-07T19:38:37.842977Z.

## Recommendation

Keep the museum's P1–P6 boundaries. Use OpenSeadragon 6.1.1, pinned to commit 201d47833e3f10e9fa55159cd4203630521926b8, for deep zoom and per-image coordinate conversion. Add an application-owned IIIF Presentation adapter, annotation editor/serialization, rights-aware package code, and institutional revision service. OpenSeadragon supplies Image API tile access; it does not parse Presentation manifests or supply product annotations, storage, or rights decisions. Keep partner media remote; neither a URL nor a rights assertion grants redistribution permission.

Source IDs below resolve to exact byte snapshots, access times, raw hashes and source locations in source-map.json. Code/docs were inspected; no application was built and no acceptance test was run.

## Proposed replacement sandbox plan

### P1 — Sources and identity

Import local image files, direct IIIF Image API 2/3 services, and Presentation API 3 manifests. Parse each Manifest into an object with ordered Canvas views; a Canvas is the view identity. Preserve institution object ID, local view ID, exact Manifest/Canvas IRIs, body/service URI, source width/height, rights, required attribution and trustworthy provider version metadata. Keep the fifty-object session and fetch tiles on demand.

For direct services assign a stable local view ID tied to URI and dimensions. For institutional files reference a stable institutional asset ID and content hash; temporary browser object URLs are not reopenable identifiers. If a partner reuses a URI without a reliable version marker, content change may be undetectable: flag unverifiable identity and require curator confirmation before reattachment. Never silently move a note to a changed Canvas/image. Add a Presentation v2 adapter only if partner inventory shows material v2 use.

### P2 — Inspection and notes

Support zoom/pan, two-view comparison, rectangular and polygon notes, author text and review status; keep recognition out of MVP. Bind each note to one exact view. Store geometry in source-pixel coordinates with source dimensions, not CSS or viewport pixels. Convert through the selected per-view TiledImage when displaying/editing; different views can have different dimensions and transforms. OpenSeadragon exposes original content size and image/viewport conversions; its tests round-trip points and rectangles (S08–S09).

Serialize as Web Annotation targeting the exact view/source using SpecificResource. Use pixel xywh (top-left x/y, width/height) for rectangles, and SVG selectors for polygons relative to source dimensions (S03–S04). Restrict selector SVG to simple geometry. Store text/creator and an app-defined review-status property; Web Annotation does not define this workflow.

### P3 — Portable review package

Version the package schema. Include object/view identities, remote source references, source dimensions/version hints, annotation IDs/selectors/text/author/status, rights/attribution provenance, package ID and base revision. Include thumbnails only when institution-owned and policy permits. Never bundle partner pixels by default. A local upload requires a stable institutional reference or a separate, policy-controlled package inclusion choice. A thumbnail-only package may preserve notes without enabling close inspection; disclose this on reopen.

Preserve annotations when access is denied, a source is missing, or identity changes. Explain unavailable, denied, and changed/unverifiable distinctly. Offer explicit reattachment after showing old and candidate identity; require curator confirmation, preserve old reference/history, and never auto-map by name or URL alone. Show rights and required attribution per view and include attribution in the package.

### P4 — Storage and revisions

A small institutional service stores versioned packages/revisions. Keep independent editing and exchange; defer live coediting. Merge distinct annotation IDs only when based on the same revision. If the same note changed on both branches, or one branch deletes while another edits, retain both candidates and mark conflict for curator resolution. Never last-write-wins. Record package/base/imported revision and resolution provenance.

### P5 — Components and usability

Pin OpenSeadragon 6.1.1 at the commit above. Viewer.open accepts ordered TileSource specifiers, and IIIFTileSource handles Image API v2/v3, but a Presentation Manifest/Canvas adapter remains app-owned (S10–S11). Choose the manifest parser and annotation library only after checking partner fixtures, license/maintenance, version coverage, uploads and error behavior; research did not establish a qualified library.

Render requiredStatement attribution and rights prominently per view; rights metadata is not a redistribution grant. Under IIIF Auth a service may provide a substitute image; credentials must remain transient and never enter packages, saved URLs, logs or cache. Do not substitute different content without curator approval (S01, S05). Require keyboard-operable selection, zoom/pan, comparison and note editing; visible focus, readable rights/status, predictable focus order and low-bandwidth lazy loading. Tiling depends on advertised service profile/features; do not promise identical low-bandwidth behavior for Level 0/static sources (S02, S10).

### P6 — Proposed acceptance checks

Not executed by this researcher:
1. Import a Presentation 3 manifest with multiple differently sized Canvases, direct Image API v2/v3 and local upload; verify order, identity, rights and attribution.
2. Load fifty objects under constrained bandwidth; verify visible-first, demand-driven tiles, per-source errors and profile limitation messaging.
3. Create/reopen rectangle and polygon notes across zoom, rotation, pan, resize and comparison layouts; round-trip to the same view without drift. Include rotated World.arrange regression cases (O3).
4. Check pixel xywh and polygon coordinates against source dimensions; safely reject malformed/out-of-bounds selectors.
5. Export/reopen partner, institutional, denied, missing, changed, same-URL uncertain, and permitted-thumbnail cases. Assert no partner pixels export and notes remain readable.
6. Import same-base disjoint changes, same-note edits, delete-vs-edit and divergent packages; assert explicit conflict or deterministic merge, never silent overwrite.
7. Keyboard-only and screen-reader checks for source changes, focus order, zoom/pan, editing, rights, missing-source and conflict flow.
8. Check package version migration, malformed imports, attribution, and absence of credentials in exports.

## Findings and frozen-plan comparison

### O1 — Discovery and alternatives

IIIF Presentation 3 models compound object as Manifest and view as Canvas; AnnotationPages support annotations. It supplies identifiers, not the product review workflow (S01, S03). Image API 3 defines region/size/rotation/quality/format services; OpenSeadragon handles image tiling, not Presentation parsing (S02, S10).

Mirador is an open multi-up IIIF viewer. Its Mirador 3 annotations plugin and community Mirador 4 editor demonstrate shapes/text, but do not establish our upload, portable packages, rights, concurrency or accessibility; persistence requires a configured backend. Treat as reference/alternative to evaluate, not selected base (S22–S24). Annotorious issue #593 requests collection/multi-image support for its OpenSeadragon integration and is closed not planned. The reporter's coordinate-conversion explanation is unverified; it flags integration risk and the need for per-image tests (S25). Issue #595 is a closed polygon-simplification lead with a linked follow-up, not proof of a current unresolved defect (S26).

### O2 — Pinned code and mechanism

Tag/release v6.1.1 resolves to 201d47833e3f10e9fa55159cd4203630521926b8 (S06–S07, S18). In that exact source, src/tiledimage.js defines original-pixel getContentSize and image↔viewport conversion with rotation/spring state; tests/modules/tiledimage.js has point/rectangle round trips and rotation tests (S08–S09). src/iiiftilesource.js configures Image API v2/v3 requests and profile-dependent tiling; Viewer.open accepts TileSource specifiers, not Presentation manifests (S10–S11). Use per-TiledImage transforms bound to the selected view; this does not establish correctness of our adapter.

### O3 — Issue/fix/regression/release evidence

OpenSeadragon issue #2708 reports World.arrange misplacing/scaling a rotated TiledImage. PR #2709 changed src/world.js to use getBoundsNoRotate, merged commit 06ce53a on 2025-04-17. v6.0.0 release notes list #2709; pinned v6.1.1 world.js has the no-rotation bounds path (S16–S18, S14). PR #2709 changed no test file; pinned World arrange tests show unrotated examples and no rotated regression case was found (S15). So #2708 lacks direct regression-test evidence here.

Related evolution: PR #2249 corrected rotated viewport boundary constraints, added viewport tests, and appears in v4.0.0 release notes (S19–S21). This is concrete same-component rotation regression evidence, but not a test for #2708. P6 therefore proposes a rotated arrange and annotation round-trip regression test. Upstream history does not validate this application.

### O4 — Complete P1–P6 disposition

- P1: retain local/IIIF sources, fifty objects, multiple views and rights/IDs; clarify Manifest/object vs Canvas/view, stable IDs, dimensions and changed-source handling. v2 Presentation is inventory-dependent.
- P2: retain zoom/pan, comparison, rectangles/polygons, author text/status, no recognition; add explicit source-pixel coordinates and per-view transforms.
- P3: retain portable package, refs/annotations, selected local thumbnails and no partner pixels; add schema/base revision, attribution, identity-change states and confirmed reattachment. Resolve local-file portability and disclose thumbnail-only limitation.
- P4: retain small service, independent exchange and deferred live editing; specify non-overwrite conflict cases.
- P5: frozen undecided components and usability concerns are apt. Select only pinned viewer; parser/annotation library remain options pending fixtures. Add per-view attribution and profile-dependent bandwidth expectations.
- P6: retain listed validation categories and expand for source dimensions, rotation, selector formats, uncertain identity, Auth denial, portability, rights, conflicts, accessibility and schema versions. Frozen categories are proposals, not interoperability evidence.

No missing cross-reference was treated as whole-project coverage; only this isolated sandbox plan was supplied.

### O5 — Criticism disposition

No same-family critic input was supplied to this researcher. Criticism remains pending; none is invented. The final stage must retain each actual criticism, response, accepted change, disagreement or unresolved objection.

### O6 — Decisions and uncertainty

Decide after inventory: partner Presentation versions/profiles/Auth; stable institutional IDs and local-file portability policy; package signing/retention/schema migration; rights/thumbnail policy; parser and annotation library after fixture/license/maintenance review; and conflict UI/permissions. Public sources cannot establish partner compliance, URL stability, local bandwidth, legal permission or institutional policy. No partner data was accessed. The selected viewer and history do not test the app adapter.

## Executed work and limits

Executed: read supplied brief/input map and frozen plan; public source discovery; inspected immutable OpenSeadragon code, definitions/callers and upstream tests; captured exact-byte source fetches/warm reads in source-map.json. Upstream QUnit tests were inspected, not run locally. Proposed checks above were not executed. No app was built, no private/partner data used, no external service operated.
