# I-METHOD-02 / control / research-v2 — complete research and proposed revision

**Classification: DIAGNOSTIC_UNQUALIFIED.** This is an unqualified research artifact. It makes no quality or speed claim. It is the complete research-stage proposal for the frozen museum review-desk scope; the application was not built or validated.

**Inputs:** exact input map [input-map.json](input-map.json); original brief [brief.md](../../../../cases/I-METHOD-02/brief.md); frozen plan [plan.md](../../../../cases/I-METHOD-02/plan.md). The input map records the full paths, sizes, and SHA-256 identities. Research began from the user need, then used public-source discovery before the P1–P6 comparison.

**Time boundary:** research stage closes no later than **2026-10-07 20:45:48 UTC**. The earlier prospective host-preparation bound is authoritative: whole-arm deadline **21:20:48 UTC**, as recorded in [method02-v2-prospective-clock-annotation.json](../../../../helpers/integrated-execution/method02-v2-prospective-clock-annotation.json). No reset or extension was used. The first useful discovery was the IIIF spatial-region recipe, seen by **20:23:21 UTC**; the exact browser-call completion time was not separately recorded.

## Recommendation

Keep the P1–P6 user constraints. Build the MVP around stable object/view/Canvas identities, IIIF Presentation API 3 manifests and Canvas targets, OpenSeadragon for tiled zoom/pan, and Annotorious for region selection and W3C Web Annotation serialization. Treat these libraries as pinned implementation candidates, not as the product contract: the app owns rights decisions, package semantics, source replacement, review workflow, keyboard access, and revision conflict handling.

Pin the research candidate to OpenSeadragon **6.0.2**, release commit **7842cd92e6799d97c18227a79cb69af4f706b023**, plus **@annotorious/openseadragon** and **@annotorious/annotorious** **3.9.4**, both published from Git commit **3fbefb2cb4646c11e2d0d0b9fb4977fe028186a4**. Raw OpenSeadragon files were re-fetched from the release commit and SHA-256 matched the files first obtained from the **v6.0.2** tag. The annotated release tag is unsigned; the commit pin and captured byte hashes provide the reproducible source boundary. NPM metadata gives the exact 3.9.4 tarball integrity and states that the OSD adapter accepts OpenSeadragon 4, 5, or 6. See linked package metadata and tarballs in [source-map.json](source-map.json).

Do not silently equate OSD image pixels with IIIF Canvas coordinates. Keep notes anchored to the exact stable Canvas/view they were created against. For single-image Canvases with matching dimensions, a tested transform may be identity; for composed Canvases, service crops, rotation, or mismatched dimensions, define and test a transform or make the view read-only. If a source changes, preserve the original target and note, mark it unresolved, and require a curator to re-anchor explicitly.

## O1 — open discovery from the user need

The user needs a curator to return to a particular detail across multiple views and hand a review packet to another curator without copying partner images or losing context. That makes identity, rights, coordinate frames, and reopen behavior first-class requirements.

IIIF Presentation API 3.0 supplies a useful object model: a Manifest contains Canvases, each Canvas identifies a view, and AnnotationPages/Annotations can be embedded or linked. Its rights fields can carry rights statements, but metadata does not itself grant permission. The IIIF Image API 3.0 supports a standard image service and publishes optional rights information; do not treat a service response as a license decision. The [Presentation API](https://iiif.io/api/presentation/3.0/), [Image API](https://iiif.io/api/image/3.0/), and captured bytes ([Presentation](sources/iiif-presentation-3.0.html), [Image](sources/iiif-image-3.0.html)) support using IIIF identifiers and metadata while keeping partner pixels remote.

The Cookbook's [“Addressing a Spatial Region” recipe](https://iiif.io/api/cookbook/recipe/0299-region/) uses a SpecificResource and selector to identify a region while leaving the original image intact. The [polygon annotation recipe #0261](https://iiif.io/api/cookbook/recipe/0261-non-rectangular-commenting/) and [embedded/referenced annotation recipe #0269](https://iiif.io/api/cookbook/recipe/0269-embedded-or-referenced-annotations/) are relevant interoperability profiles. Recipe #0261 shows a Canvas-targeted SVG selector and warns that viewers differ in SVG interpretation; the [viewer matrix](https://iiif.io/api/cookbook/recipe/matrix/) is a useful discovery index, not a guarantee for every deployed version. Captures: [#0299](sources/iiif-cookbook-region-0299.html), [#0261](sources/iiif-cookbook-polygon-0261.html), [#0269](sources/iiif-cookbook-annotations-0269.html), [matrix](sources/iiif-cookbook-matrix.html).

Products and alternatives:

- **Mirador 4** is the closest ready-made IIIF alternative. Its official project describes a configurable, extensible browser viewer with multi-window comparison and annotation; it is a candidate for a short prototype if minimizing viewer work is more important than owning the inspection interaction. It still needs this museum's rights-safe package, review, and revision service. Sources: [Mirador](https://projectmirador.org/) and its [repository](https://github.com/ProjectMirador/mirador), captured as [home](sources/mirador-home.html) and [repository page](sources/mirador-repo.html).
- **Universal Viewer**, **TIFY**, and **Curation Viewer** are useful ecosystem alternatives for viewing or IIIF collection workflows. Their inclusion in IIIF guidance/matrix does not establish they satisfy this specific polygon, keyboard, and export profile. Run the same pinned fixture against whichever is shortlisted; no product-level feature parity is assumed.
- **Annotorious Serverless** is described as upcoming on the Annotorious site. Do not rely on it as the museum's institutional revision store. The selected design uses the annotation library as a client component and specifies the small service separately.
- A simple image-only viewer would be easier, but it loses reusable IIIF identity and makes multi-view exchange less robust; reject it as the default. Preserve local uploads as supported input, but assign them stable local IDs and explicit rights/provenance just like remote sources.

An important negative finding is that an interoperable annotation object does not make region geometry universally interoperable. The [W3C Web Annotation Model](https://www.w3.org/TR/annotation-model/) and IIIF provide useful target/selector vocabulary, while Cookbook examples and viewer matrices show differing support. The captured [single-image Manifest recipe](sources/iiif-cookbook-simple-annotation.html) is a useful simple baseline, but does not cover the multi-view review workflow. The application must preserve a lossless source annotation even when another viewer cannot render it.

## O2 — pinned code and governing mechanism

### OpenSeadragon 6.0.2

The tag **v6.0.2** resolves through GitHub's tag object to commit **7842cd92e6799d97c18227a79cb69af4f706b023**; see [tag ref](sources/osd-tag-v6.0.2.json) and [tag object](sources/osd-tag-object-v6.0.2.json). Captured source includes **src/overlay.js**, **src/viewer.js**, **src/iiiftilesource.js**, and **test/modules/overlays.js** at that commit ([overlay](sources/osd-6.0.2-commit-overlay.js), [viewer](sources/osd-6.0.2-commit-viewer.js), [IIIF source](sources/osd-6.0.2-commit-iiiftilesource.js), [overlay tests](sources/osd-6.0.2-commit-overlays-test.js)); the duplicate tag-fetched source bytes are retained and hash-equal.

**Overlay.destroy** removes a parented overlay and hides a reparented existing element; **Overlay.drawHTML** reattaches it, computes viewport placement/size, and sets it visible. **Viewer.open** recreates global overlays when **preserveOverlays** is false, and **Viewer.addOverlay** documents that overlays are removed on close, including sequence page changes. This is a concrete lifecycle that matters to region-note affordances. OSD documents these addOverlay locations as viewport-relative, so they are transient viewer overlays and must not be used as persistent annotation coordinates. The same source supports the image-tile viewer choice; it does not define the application's persistent annotation store.

### Annotorious 3.9.4

NPM's captured 3.9.4 metadata pins **@annotorious/openseadragon**, **@annotorious/annotorious**, and the React wrapper to commit **3fbefb2cb4646c11e2d0d0b9fb4977fe028186a4**; package tarballs and source maps are in sources/. Code extracts are from those package source maps/tarballs, not executed.

- **src/Annotorious.ts**, **createOSDAnnotator**, creates state/display/drawing layers and exposes **setDrawingTool**; defaults disable drawing, then use drag on touch devices and click on other devices. Rectangles and polygons are in core **src/annotation/tools/drawingToolsRegistry.ts**.
- **src/annotation/svg/drawing/SVGDrawingLayer.svelte**, **toolTransform** and **onSelectionCreated**, maps viewer-local pointer positions to OpenSeadragon image coordinates, generates a UUID, and stores the selected geometry, creator, and timestamp.
- **src/utils/viewerCoordinates.ts**, **viewerOffsetPointToImageXY**, handles flip and rotation before returning image coordinates. This supports image-coordinate selection, not automatic conversion from arbitrary IIIF Canvas compositions.
- Core **src/model/w3c/W3CImageFormatAdapter.ts**, **W3CImageFormat/serializeW3CImageAnnotation**, serializes a SpecificResource whose source is the caller-supplied string. Non-rotated rectangles become FragmentSelector (**xywh=pixel**); other shapes use SVG selectors.
- Core **src/model/w3c/fragment/FragmentSelector.ts** rejects fragments over 512 characters and does not accept percent coordinates. **src/model/w3c/svg/SVGSelector.ts** defaults polygons to **<polygon>**; it has an optional Mirador-safe **<path>** mode, and its code comments describe Mirador's element support. The default selector has no explicit viewBox.

These are useful mechanisms, not a portable package format by themselves. The app must pass the exact Canvas ID it intends to target, preserve the raw annotation and dimension/transform profile, and validate the serialized selector in another viewer. Do not silently use an Image API service URI as though it were the Canvas URI. The default polygon SVG format and the cookbook's viewer-specific warnings create a concrete interop risk. Any change to selector serialization must preserve original annotations and have round-trip tests.

The official [Annotorious site](https://annotorious.dev/) says it is client-side and has no server dependency; the NPM metadata and captured sources are more consequential for this proposal than marketing descriptions. Exact extracted file paths and hashes appear in [source-map.json](source-map.json).

## O3 — real issue, fix, and release applicability

OpenSeadragon issue [#774](https://github.com/openseadragon/openseadragon/issues/774) reported that global overlays referencing existing DOM elements were lost when sequence mode changed pages. Issue [#1861](https://github.com/openseadragon/openseadragon/issues/1861) then reported later overlays hidden in SequentialMode. Both pointed to the same live “overlaying complex HTML” reproduction. Primary captures: [#774 JSON](sources/osd-issue-774.json) and [#1861 JSON](sources/osd-issue-1861.json).

PR [#1865](https://github.com/openseadragon/openseadragon/pull/1865) merged as **ed7da66b69eb7843982aa1a1c26913f49d9e018e** on 2021-04-08. Its patch removes a conditional **style.display !== 'none'** check and makes the draw path set **display='block'** unconditionally. The captured PR file listing shows one changed file (**src/overlay.js**), one addition and four deletions; no test file changed ([PR API](sources/osd-pr-1865.json), [file listing](sources/osd-pr-1865-files.json), [patch](sources/osd-pr-1865.patch)). The v3.0.0 release notes, published 2021-12-15, explicitly list “Fixed a bug causing overlays to disappear in Sequence Mode (#1865)” ([release JSON](sources/osd-release-v3.0.0.json), [release page](sources/osd-release-v3.0.0.html)). This establishes fix-to-release applicability for the component, not end-to-end annotation persistence.

Regression evidence is limited: the issue supplies a manual reproduction, but the PR added no automated regression test. At the pinned 6.0.2 release, **test/modules/overlays.js** has overlay coordinate/zoom/rotation cases but no sequence-specific regression case (the captured file contains no sequence-mode case). The current source still has the reparent/hide/show behavior, and the viewer still documents sequence close behavior. Therefore treat the fix as relevant historical evidence, not proof that this product's annotation flow is correct. Require a proposed test that switches views/sequences, replaces a source, reopens the annotation, and checks visible geometry plus stable target identity.

A separate current Annotorious issue, [#599](https://github.com/annotorious/annotorious/issues/599), reports a production Webpack drawing-mode failure after the 3.7.13 nanostores migration, with a reporter-described workaround on 3.7.4. This is an open report, not verified root-cause analysis; 3.9.4's existence does not prove it fixed. Make production-bundle drawing a release gate. Issue [#603](https://github.com/annotorious/annotorious/issues/603) reports a potential ReDoS/strict-parser bypass for W3C FragmentSelector parsing; the pinned code's 512-character guard is relevant but is not evidence the report is resolved. Treat package imports as untrusted input and add bounded-input/parser tests; review #603 before adoption.

## O4 — disposition of every frozen plan decision

| Frozen decision | Disposition | Evidence and change |
|---|---|---|
| **P1 Sources:** local upload and user-supplied IIIF Presentation/Image links; up to 50 objects and multiple views; retain source ID and rights. | **Retain; clarify identity and rights boundaries.** | IIIF Manifest/Canvas and Image API support reusable identifiers and service metadata. Add separate stable museum object ID, source/Manifest ID, Canvas/view ID, and service ID. Snapshot rights statement and provenance per source/view; show rights to curators but never treat metadata as permission. Do not fetch partner pixels into exports. Validate 50-object lazy loading and CORS/auth failures. |
| **P2 Inspection:** zoom/pan, compare two views, rectangle/polygon note; view identity, geometry, author text, status; no recognition. | **Retain; constrain coordinate mapping and serialization.** | OSD + Annotorious code supports zoomed image coordinates and rectangle/polygon creation. Store Canvas target ID, source dimensions and transform/profile. Support identity transform only for validated full-image cases; read-only or explicit mapping for composite/mismatched sources. Add keyboard creation/editing and non-color review state as requirements; those are not established by the inspected code. Keep recognition out of scope. |
| **P3 Exchange:** portable package with object/view refs, annotations, selected museum-owned thumbnails; no partner pixels by default; reopen explains unavailable/changed/denied sources and keeps notes. | **Retain; make package and failure states explicit.** | IIIF annotation/Canvas identifiers support references, but viewer-specific selector handling varies. Define a versioned ZIP profile with manifest, annotations, revision/provenance metadata and only allowed locally owned thumbnails. Preserve exact target and body on re-open; surface status and require explicit re-anchor if a source changed. |
| **P4 Storage/revisions:** small institutional service; independent curators; exchange package; defer live editing; surface conflicting imports. | **Retain; define conflict protocol.** | Store append-only revision IDs with parent revision, author and timestamp. Use conditional writes (ETag/If-Match, [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)) so stale writes fail visibly. Imported conflicts remain parallel proposals until curator choice; do not auto-merge geometries or overwrite a revision. Auth, retention and deployment needs remain institution-specific unknowns. |
| **P5 Components/usability:** viewer, manifest parser, serialization undecided; keyboard/focus, rights, low bandwidth; explicit coordinates. | **Resolve candidates; retain usability scope; add portability cautions.** | Candidate pins: OSD 6.0.2 and Annotorious 3.9.4. Use IIIF Presentation 3 parsing internally, with a compatibility adapter only if real partner data requires IIIF 2. Test package and viewer alternatives before treating these as locked. Low-bandwidth loading, keyboard path, focus order, and readable rights remain app requirements. |
| **P6 Acceptance:** multiple views, source replacement, package reopen, geometry, missing images, rights export; no pinned version/interoperability test. | **Retain and make tests executable.** | Pin candidate versions now, and add round-trip, cross-viewer, service failure, concurrency, accessibility, production-bundle, and untrusted-selector checks below. No such application check was executed in this research stage. |

No frozen user constraint was rejected. Explicitly rejected assumptions are that IIIF rights metadata alone authorizes an export, that image pixels and Canvas coordinates are always identical, that an annotation accepted by one viewer will render in every other viewer, or that a merged upstream fix proves this desk's flow.

## O5 — independent candidate criticism (pending)

**Pending fresh flash-family critic.** No critic output was available to this research stage, and no criticism or approval is invented. Preserve this handoff for the later independent review: verify the exact brief and P1–P6 coverage; independently check the pinned OSD/Annotorious source paths, versions and package applicability; challenge Canvas/image transform and polygon serialization assumptions; review the issue/fix/release/test limits; and identify missing product, rights, accessibility, security, or validation choices. Record every objection with a disposition in the final stage. This artifact is not the critic's review.

## O6 — complete proposed replacement plan

### P1 — Sources and identities

Accept local uploads and user-entered IIIF Presentation manifests or Image API service links. Model up to 50 objects per review session, with multiple views. Store distinct stable IDs for the museum object, original source record, Manifest, Canvas/view, and Image API service; preserve exact source URIs and any supplied labels. Lazy-load remote manifests, metadata, tiles, and thumbnails. Record the source's protocol/API profile and relevant dimensions. A museum-owned upload receives a stable internal source ID and provenance record.

Record rights statements at source/view level with source URI and observation time, and display them in the desk and package. The museum still makes the permission decision. Do not bundle partner pixels or create proxy copies. A thumbnail may be included only when the museum owns it or has an explicit recorded permission for that package use; otherwise include a link and an explanatory unavailable/rights notice. Treat CORS, authentication, rate limits, and IIIF 2 manifests as partner-specific compatibility questions, not silent fallback opportunities.

### P2 — Inspection and annotations

Use OpenSeadragon for tiled zoom/pan and two-up comparison; prototype Mirador 4 as the alternative if its workflow better satisfies the same acceptance fixture. Use Annotorious 3.9.4 as the candidate rectangle/polygon interaction layer. Pin dependencies and lockfile in implementation. A note has a stable annotation ID, exact Canvas/view ID, geometry and coordinate-frame metadata, textual body, author and timestamps, review status, and revision lineage. Keep the MVP free of recognition or generated annotations.

Target IIIF annotations to the Canvas when a valid Canvas identity exists. Keep **xywh=pixel** for supported non-rotated rectangular selectors; use an explicitly profiled Canvas-coordinate SVG selector for polygons only after round-trip testing. Record original dimensions and the transform from displayed image pixels to Canvas coordinates. For composed or transformed Canvases, use the IIIF painting annotation transform only if implemented and tested; otherwise display the view without annotation editing and explain why. On replacement/mismatch, retain the old target and body as unresolved; require a curator to select a replacement view and confirm a mapping. Never move geometry silently.

Provide keyboard-operable view navigation, zoom, shape selection, point/rectangle entry or equivalent accessible drawing controls, annotation editing, and review status. Preserve visible focus and a non-color-only status label. Rights notices must remain readable at normal zoom and in exported packages. Library keyboard support has not been established by this research and is a validation gate.

### P3 — Portable review package

Define a versioned **museum-review-v1.zip** profile containing:

1. **package.json**: profile/schema version, package ID, created/updated times, creator, and revision IDs.
2. **objects.json**: museum object IDs and labels; original source/Manifest URIs; Canvas/view IDs and labels; observed dimensions/profile; rights statements and observation times; per-source resolution status.
3. W3C Web Annotation JSON-LD AnnotationPages targeting the recorded Canvas IDs, preserving annotation IDs, bodies, selectors, authors, times, review-status extension and source revision lineage. Preserve unsupported selectors losslessly even when the receiving viewer cannot render them.
4. **assets/** only for individually recorded museum-owned or expressly licensed thumbnails, with provenance and checksum. No partner image tiles or full-resolution copies.
5. **README.txt** with reopen instructions and the meaning of unavailable, changed, authentication-denied, and rights-restricted sources.

On import, validate schema and resource limits, retain originals, and report errors per view/annotation. A missing or changed remote source does not erase or detach the annotation record; render a clear unresolved state. A changed source requires curator-confirmed remapping. If the link is denied, show saved text and status and explain that image pixels remain unavailable. Avoid network retrieval beyond what linked source resolution requires.

### P4 — Service and revision flow

Use a small authenticated institutional service for packages and annotation revisions. Store immutable revision records with **revisionId**, **parentRevisionId**, author, time, changed annotation IDs, and source package identity. Accept a write only if its expected ETag matches via **If-Match**; return a conflict state on stale writes. Package import with a divergent history presents both revisions and offers explicit keep/import/curator-resolve choices. Do not auto-merge or drop either branch. Live simultaneous editing remains deferred. The institution must still choose identity provider, role policy, backup/retention period, storage location, and audit policy before implementation.

### P5 — Component and usability choices

Start implementation evaluation with pinned OSD 6.0.2 plus Annotorious 3.9.4; use IIIF Presentation API 3 as the internal parser/normalization profile and W3C Web Annotation for annotation exchange. Keep those behind a small viewer/annotation adapter so a Mirador comparison or future replacement does not change package semantics. Require explicit Canvas coordinate conversion and source-change behavior. If museum partner data cannot be handled with API 3 alone, add a tested IIIF 2 ingestion adapter while preserving original source identifiers. Optimize for low bandwidth through lazy loading, progressive previews, and no eager source mirroring. Do not make selection, rights display, annotation identity, or revision semantics depend on the viewer library.

### P6 — acceptance and validation proposals

Before release, run a public or synthetic fixture set and record exact browsers, package versions, test data, and outcomes:

- Load 50 objects with two or more Canvases each; verify stable object/view IDs, lazy loading, compare two views, and preserve the right view identity when switching.
- Test single-image Canvas identity mapping, dimensions mismatch, composed Canvas, rotated/flipped view, service crop, and non-rectangular polygon. Verify pixel-to-Canvas coordinates at corners/interior points, round-trip serialization, geometry after pan/zoom/rotation, and no silent transfer on replacement.
- Export/import the package with local owned thumbnail, with no thumbnail, with unavailable/changed/auth-denied partner source, and with a rights-restricted source. Inspect archive to confirm no partner pixels; confirm text, original target, rights snapshot, and explanatory notices survive.
- Open the same annotation fixture in the chosen build and a pinned independent IIIF viewer (Mirador or another shortlisted viewer). Include rectangle, polygon, external/embedded AnnotationPage, and unsupported selector. Check correct render and graceful unsupported preservation; never infer broad interoperability from one successful sample.
- Run keyboard-only creation, editing, review, focus order, screen-reader labels, contrast/readability, and 200% zoom checks. Ensure no function depends only on color or pointer gestures.
- Exercise two independent revisions: valid conditional update, stale If-Match, duplicate package import, and divergent revision import. Confirm neither side is silently discarded and curator resolution is auditable.
- Build the production bundle and test drawing mode on the exact pinned package versions, in light and production conditions, addressing unresolved #599. Apply input size limits and malformed/oversized selector tests; review #603 before release.
- Test slow network, CORS denial, IIIF 2/3 representative manifests, missing service metadata, and interrupted reload. Verify clear error states and no partner pixel caching/export.

These are proposals, not completed tests. No app, production bundle, interoperability run, or acceptance suite was executed here.

## Executed work, limitations, and cost record

Executed: read the mapped original inputs and dispatch/clock bounds; independently discovered and retrieved public standards, official product pages, GitHub issue/PR/release records, exact release-commit source, and NPM metadata/tarballs; inspected code/source maps as data; compared SHA-256 hashes of tag-fetched and commit-pinned OpenSeadragon files; recorded captured source byte lengths and SHA-256 values in [source-map.json](source-map.json). No downloaded package code was run. No private museum data, third-party service, issue tracker, repository, canonical plan, WorkNode, or external messaging was touched beyond the single required activation notice.

Not executed: building the product; browser interaction; package round-trip; IIIF interoperability; accessibility review; production bundling; service writes; issue-status monitoring after capture. Source inspection can establish code paths and published metadata, not behavior in this proposed application or the continued current status of a public issue.

Exact operation counts and per-operation elapsed time were not recorded. First useful finding time is bounded above. The role clock is capped at 1,500 seconds and the stage deadline above. Cost fields (**input**, **cache**, **generated**, **reasoning**, **billing**) are **unknown/null**, not estimated. Native Goal counters are recorded separately in [source-map.json](source-map.json) and are not summed into a cost estimate.

