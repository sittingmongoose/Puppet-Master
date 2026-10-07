# I-METHOD-02 — independent critic-v1

First useful saved finding: 2026-10-07 19:44:50 UTC. Complete artifact saved: 2026-10-07 19:46:23 UTC.

## Critic conclusion

This is a strong, evidence-conscious proposed revision and it preserves the frozen scope. I support retaining the central boundaries and most of the added safeguards. I would not pass the P2/P3 design to finalization until the coordinate frame between a Presentation Canvas and its painted image body is explicit. I also recommend tightening revision-merge semantics and making the rotated `World.arrange` check conditional on the final viewer layout. This is a critique of the proposed plan, not a replacement plan.

## Supported material to preserve

- Keep partner pixels remote by default, keep annotations readable when media is missing or denied, and require an explicit curator decision before reattachment. A rights URI is an assertion to display, not proof that this museum may redistribute the media. Presentation 3 distinguishes `rights` from `requiredStatement`; the latter is a statement clients must render, while the former identifies a rights assertion (S01, §5.3 / property definitions). The draft appropriately keeps these separate and calls for attribution.
- Keep stable institutional object/file references, avoid browser object URLs in reopenable packages, preserve source dimensions/version evidence, and flag unverifiable same-URL changes. This directly addresses the brief's requirement to reopen without guessing which image a note refers to.
- Keep an app-owned Presentation adapter and annotation workflow. The pinned OpenSeadragon code is a viewer/tile mechanism: `Viewer.open` consumes TileSource inputs, while `IIIFTileSource` interprets Image API info and composes tile requests. That does not establish Manifest/Canvas parsing, annotation persistence, package exchange, or rights policy (S10–S11).
- The 6.1.1 source is bound by the tag record to commit `201d47833e3f10e9fa55159cd4203630521926b8` (S06–S07; release S18). In that source, `TiledImage.getContentSize` reports source dimensions and the per-item image/viewport conversions use that item’s scale, rotation, and current/target spring state (S08, lines 553–557, 603–655). This supports source-pixel storage as an implementation option and per-view transforms; it does not validate the museum adapter.
- Preserve the OSD issue history with its present caveat. Issue #2708 reports rotated items being misplaced/scaled by `World.arrange`; PR #2709 changes the bounds call from `getBounds()` to `getBoundsNoRotate()`. The patch changes only `src/world.js`; it adds no regression test. The fix is present in the pinned 6.1.1 `World.arrange` implementation, so release applicability is supported (S16–S18, S14). The pinned world tests cover ordinary arrangement but no rotated arrangement case (S15). PR #2249 and its patch/test show separate rotated-viewport-boundary evolution and are useful regression-process evidence, not a test of #2709 (S19–S21).
- Keep the no-recognition MVP, multi-view inspection, rectangles/polygons, explicit text/status, no live simultaneous editing, and keyboard/focus/low-bandwidth acceptance intent from P1–P6.

## Material corrections and evidence

### 1. Define Canvas-space versus image-pixel-space regions (required before P2/P3 approval)

The draft makes a Canvas the view identity (P1), stores note geometry in source pixels (P2), and targets an “exact view/source” with Web Annotation. Those can work together, but the relation is not specified. A Presentation Canvas is a coordinate surface with its own dimensions and painting Annotation(s); the painted body is a separate resource. A body can occupy only part of the Canvas or be transformed. Therefore, OSD’s transform for one TiledImage does not by itself map a Canvas region to the underlying body/service pixels.

Require the final plan to choose a canonical annotation target and coordinate frame. If Canvas space is canonical, specify how each painting body’s crop/placement/scale/rotation maps between Canvas and body pixels, and preserve enough mapping/source identity to reopen against the same body. If source pixels are canonical, define how a note selects one body when a Canvas has multiple painted bodies and how the note is placed back on that Canvas. Set SVG `viewBox`/coordinate conventions and bounds relative to the chosen frame; “relative to source dimensions” is not enough if the source body is cropped or transformed on the Canvas. S01 (Canvas and painting Annotation model), S03 (SpecificResource/SvgSelector), and S08 support this correction. Web Annotation does permit SVG regions relative to image content (S03 §4.2.7); the missing piece is which IIIF resource and transform the application means.

Add fixtures for a plain full-image Canvas, a cropped/scaled/rotated body, and a Canvas with more than one painted body. Round-trip rectangle and polygon coordinates after zoom, rotation, comparison, package export/reopen, and confirmed reattachment. OSD’s existing round-trip example uses an ordinary unrotated setup (S09); it is not evidence that this Canvas/body mapping works.

### 2. Keep rights and authorization states distinct

The draft's “never bundle partner pixels by default” is the right baseline for the brief's no-republication authority. Keep the export test that asserts no partner pixels, and make its policy apply to previews, retries, and import/export paths, not only the nominal export button. “Institution-owned” should not alone imply permission to include a thumbnail; retain the policy/rights gate.

IIIF Auth describes tiered access and substitute versions and leaves authentication/authorization policy outside the protocol (S05). A substitute image is not necessarily the same image/version as the original. Treat it as an explicitly identified representation and preserve the original source reference for annotations; never silently bind a note to a substitute body. The draft already says not to substitute without curator approval and to keep credentials out of packages/logs/cache; preserve that, while specifying how the viewer communicates a reduced or substituted view and whether annotation is disabled or clearly bound to the original.

### 3. Finish package conflict identity rules

P4 correctly rejects last-write-wins and calls out same-note edits and delete-vs-edit. Before implementation, specify package-level base revision and stable annotation IDs, how duplicate IDs are detected, how deletions survive an exchange (tombstone or equivalent), and what happens when source/view identity or rights metadata changes between branches. Define whether disjoint annotation additions can merge only when both packages share the same base revision; otherwise preserve both revisions and ask for resolution. Do not merge by object/view name or current URL. The current proposed test list has the right cases but needs explicit expected outcomes for divergent bases and ID collisions.

### 4. Scope the OSD regression check to the selected layout

The #2708 fix is real and applies to pinned 6.1.1. However, `World.arrange` is only relevant if the chosen comparison design puts rotated TiledImages in the same OSD World and invokes that layout. Keep the regression test if that is the intended design; otherwise keep #2708 as a risk note and prioritize the more central application test: region identity and coordinate round-trip through the chosen Canvas/body mapping. Do not count the #2249 rotated viewport tests as regression coverage for #2708.

## Full frozen-plan comparison

| Frozen item | Supported disposition | Critic correction or remaining decision |
|---|---|---|
| P1 Sources | Retain local files, IIIF links, multiple views, fifty-object session, IDs and rights. Add Canvas identity, stable file references, dimensions, version hints and changed-source handling. | Gate Presentation v3/v2 support on partner inventory and fixtures. Direct IIIF service URI, Manifest IRI, Canvas IRI, body URI and institutional file ID are different identities; define which is stored for each source kind. |
| P2 Inspection | Retain zoom/pan, compare two views, rectangular/polygonal notes, text/status and no recognition. | Resolve the coordinate frame and Canvas/body transform above; bind each annotation to a specific Canvas/body and version. Define polygon frame and validation rules. |
| P3 Exchange | Retain portable references/annotations, no partner pixels by default, selected local thumbnails, missing/denied/changed states and explicit reattachment. | A package needs stable source and mapping identity plus base revision. Test rights gate on every export path and ensure reattachment preserves the old target/history. |
| P4 Storage | Retain a small service, independent editing/exchange, deferred live editing and conflict surfacing. | Specify divergent-base, ID-collision, deletion and source-change semantics before claiming deterministic merge. |
| P5 Components/usability | Selecting pinned OSD is supported for image viewing, tiles and per-TiledImage conversion. Keep parser/annotation library undecided pending partner fixture, licensing, maintenance, version and upload/error checks. | Alternatives remain leads, not qualified selections. Make layout-specific regressions conditional. Keep keyboard/focus/rights/status and profile-aware bandwidth requirements. |
| P6 Acceptance | Retain multi-view, replacement, reopen, geometry, missing-source and rights-dependent export categories; expand to auth, conflicts, accessibility and schema migration. | These are proposals only. No app build, interoperability test, acceptance test, local upstream test suite, or real partner test was run. Add the Canvas/body fixtures above and explicit package conflict outcomes. |

## Discovery, alternatives, negative findings, and open questions

The brief-led discovery usefully adds Presentation 3, Image API 3, Web Annotation, IIIF Auth, Mirador, and Annotorious beyond the frozen plan (S01–S05, S22–S26). Preserve Mirador and its annotation plugins as comparison leads, not evidence that they satisfy this desk's upload, package, rights, concurrency, accessibility, or persistence needs. Repository landing pages do not by themselves establish a pinned compatible release, maintenance status, license fit, or complete backend behavior. The draft correctly leaves those components unselected.

Treat Annotorious issue #593 as a reported multi-image integration concern, not a verified coordinate defect; the researcher says the reporter's explanation is unverified. Treat #595 as a closed polygon-simplification lead, not proof of a current defect. Do not let either issue substitute for app-level geometry tests (S25–S26).

One bounded architecture question remains open: if the institutional service fetches user-supplied Manifests or image URLs server-side, define the allowed fetch/redirect boundary and how credentials/CORS behave; if the browser fetches them directly, document the provider/CORS limitations. No server-fetch architecture or security defect was established here, so this is a discovery question for the reviser, not a claimed finding.

### Disagreements and unresolved objections

I agree with selecting OSD as a candidate viewer and with leaving parser/annotation-library selection open. I object to treating source-pixel selectors as sufficiently specified while Canvas identity is the view identity. I also object to making rotated `World.arrange` a core acceptance check unless the final comparison layout uses that code path. These objections should remain visible until the reviser resolves them.

## Validation and limits

Executed for this critique: read the full exact brief, frozen plan, researcher artifact and source map; independently verified pinned raw sources via same-arm raw-byte cache receipts; inspected OSD conversion definitions/callers/tests, IIIF/Web Annotation definitions, issue/fix patch, release applicability, and adjacent regression history. The #2709 patch was newly fetched from its public primary URL, pinned into the same-arm raw cache, and read back by record hash. Cache receipts and source hashes are in `sources/` and `source-map.json`.

Not executed: application build, local OSD tests, browser or accessibility testing, package interoperability, partner fixture testing, rights review, or network/source replacement behavior. All P6 checks and additional checks above are proposals; upstream source/test inspection establishes only what those upstream files define or cover. No partner data was accessed and no app behavior is claimed as validated.

