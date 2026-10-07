# I-METHOD-02 — treatment/reviser-v1 complete revised plan

## Recommendation and decision status

Keep the frozen museum sandbox scope and its P1–P6 boundaries. Use OpenSeadragon 6.1.1 at commit `201d47833e3f10e9fa55159cd4203630521926b8` as the candidate image viewer/tile mechanism. Keep the Presentation adapter, annotation workflow, portable package, rights decisions, and revision service application-owned. Keep partner pixels remote by default. The viewer and upstream evidence do not validate the application adapter or grant redistribution rights.

Resolve the coordinate-frame objection by making **Canvas-space pixels the canonical annotation geometry**, while binding each image annotation to the selected Canvas, painting Annotation, and exact body/service identity. This is a proposed product contract, not a claim that upstream libraries implement the mapping. Store Canvas dimensions and body/source dimensions, version evidence, and a reversible body-to-Canvas mapping with each binding. Support annotation editing only where the adapter can derive and round-trip that mapping from the supplied Presentation data; preserve annotations and show an unresolved mapping state when it cannot. Do not guess from labels, URLs, or displayed pixels. This narrows the initial supported behavior pending fixture validation.

This is a proposed plan for review, not implementation approval or a SourcePASS. No app, adapter, package, partner fixture, upstream test suite, browser, accessibility check, or acceptance check was executed.

## Complete proposed replacement plan

### P1 — Sources, identities, and rights

Accept local image files, direct IIIF Image API 2/3 services, and Presentation 3 Manifests, with an ordered Canvas view per Manifest and a fifty-object session. Keep Presentation v2 support conditional on partner inventory. Preserve distinct identities: institutional object/file ID, Manifest IRI, Canvas IRI and dimensions, painting Annotation/Page ID, body IRI, service URI, source dimensions, rights assertion, required attribution, and available version evidence. A direct service receives a stable local view ID tied to its URI and dimensions. A local file uses a stable institutional asset reference and content hash; a browser object URL is temporary and cannot identify a reopened source.

If the provider reuses a URI without reliable version evidence, mark identity unverifiable and require curator confirmation before reattachment. Never silently move a note to changed media. Keep media remote by default; a package contains references and permitted metadata, not partner pixels. Institutional ownership alone does not authorize thumbnails. Gate thumbnails and previews on the applicable rights/policy decision. Render the Presentation `requiredStatement` and the separate `rights` assertion per view; neither a rights URI nor a URL proves redistribution permission (S01, S05).

### P2 — Inspection and annotations

Retain zoom/pan, two-view comparison, rectangular and polygon notes, author text and review status; defer recognition. A Canvas is the view/layout coordinate surface; a painting Annotation associates a body with that Canvas. For an image note, require the user to select one painting body when a Canvas has multiple bodies. Store its exact Canvas, painting Annotation, body/service, source dimensions/version evidence, and the adapter mapping. A Canvas-only note must be identified as such; do not silently choose a body.

Rectangles use pixel `xywh` in Canvas coordinates; polygons use SVG selectors with a `viewBox` based on the Canvas width and height. The annotation target identifies the Canvas, and an application binding identifies the selected body and mapping. Store mapping inputs and a versioned reversible transform so package reopen and confirmed reattachment can reproduce the same placement. The proposed supported subset is a mapping the adapter can derive exactly from the captured Canvas/body/selector data and round-trip through export/reopen; any unsupported crop, rotation, multiple-body overlap, or missing dimension that prevents this is explicitly unresolved/read-only until an authorized curator supplies a mapping. Do not invent protocol semantics or approximate silently. IIIF defines Canvas dimensions and painting relationships; Web Annotation selectors are relative to their target; neither that fact nor OSD's per-TiledImage transform alone proves this adapter mapping (S01, S03–S04, S08–S09).

Keep geometry tied to source identity, not CSS or viewport pixels. OSD's conversions are per TiledImage and use that image's dimensions, position, scale, and rotation state. Use them for the viewer-to-body part of the adapter only, then apply the separately recorded body-to-Canvas mapping. If a source changes, access is denied, or mapping is lost, keep note data readable and distinguish missing, denied, changed, substituted, and unresolved-mapping states. Reattachment always shows old and candidate identities, preserves history, and requires curator confirmation.

### P3 — Portable review package

Version the package schema. Include package ID, base revision, object and Canvas IDs/dimensions, selected painting/body/service IDs, body dimensions/version evidence, mapping and mapping-version, annotation IDs/selectors/text/author/status, rights and required-attribution provenance, and import/resolution history. Export remote references by default; include only a policy-authorized institutional thumbnail. Apply the rights gate to previews, retries, import/export code paths, and the nominal export control. Never put credentials or transient authorization state in a package, saved URL, log, or cache (S05).

A substitute image is a distinct representation, not the original identity. Preserve the original body/source binding. Display the substitute status and identity; allow an overlay only if the stored mapping is verified for that representation, and otherwise make it read-only with an explicit explanation. Missing or denied media must not delete annotations. A thumbnail-only package may preserve notes without supporting close inspection; disclose that limitation on reopen.

### P4 — Storage and revisions

Use a small institutional service for versioned packages/revisions, independent editing and exchange; defer live simultaneous editing. Give packages stable IDs, explicit base revisions, and stable annotation IDs. Detect duplicate IDs with different content as a conflict; never deduplicate by view name or URL. Carry deletion tombstones so deletion survives exchange.

Merge disjoint additions only when both packages have the same base revision and matching object/Canvas/body identity, mapping, and relevant rights metadata. Divergent bases, changed source/mapping/rights metadata, or ID collisions preserve both candidates/revisions for curator resolution. Same-note edit/edit and delete/edit conflicts remain visible; never use last-write-wins. Record import base, source revision, and each curator resolution. These are proposed rules, not tested merge behavior.

### P5 — Components and usability

Pin OpenSeadragon 6.1.1 to commit `201d47833e3f10e9fa55159cd4203630521926b8`. Its `Viewer.open` accepts tile-source inputs and its IIIF tile source handles Image API service requests; it does not parse Presentation Manifests, persist notes, implement packages, or decide rights (S06–S11). Keep the Presentation parser and annotation library unselected until partner fixtures, supported versions, license fit, maintenance, uploads, and error behavior are reviewed. Mirador and its annotation plugins remain comparison leads, not qualified replacements; their captured repository overviews do not establish this museum's package, upload, persistence, rights, concurrency, or accessibility fit (S22–S24). Annotorious issues #593 and #595 remain reported/closed leads, not proof of a current coordinate or polygon defect (S25–S26).

Require keyboard-operable source selection, zoom/pan, comparison and note editing; visible focus, readable rights/status, predictable focus order, and visible missing/denied/conflict states. Load visible tiles first and lazily load others. Describe bandwidth expectations by the Image API profile/features actually advertised; do not promise identical tiling for Level 0/static sources (S02, S10). Never use an Auth substitute as an unannounced replacement or persist credentials.

### P6 — Proposed acceptance checks (none executed)

1. Import a Presentation 3 Manifest with ordered, differently sized Canvases, direct Image API v2/v3 services, and a local upload; check IDs, dimensions, rights, attribution, and v2 support only if inventory requires it.
2. Fixture a plain full-image Canvas, an explicitly cropped/scaled/rotated body, and a Canvas with multiple painted bodies. Check that the adapter records the correct body selection and reversible mapping. For unsupported/ambiguous mappings, assert editing is blocked with a readable unresolved state and existing notes remain intact.
3. Create/reopen rectangle and polygon notes across zoom, pan, rotation, resize, comparison, package export/reopen, and confirmed reattachment. Assert exact Canvas-pixel round-trip, SVG `viewBox`, pixel `xywh`, body binding, and no drift. Reject malformed/out-of-bounds selectors. Include mapping uncertainty and same-URL changed-source cases.
4. Test denied, missing, changed, substitute, and permitted-thumbnail flows. Assert notes remain readable, original identity remains bound, substitutes are explicit, credentials are absent from all package/URL/log/cache paths, and rights gating covers previews and every export/retry path.
5. Under constrained bandwidth, load fifty objects and verify visible-first, demand-driven tiles, per-source errors, and profile-limitation messaging.
6. Import same-base disjoint additions, same-note edits, delete-vs-edit, divergent bases, duplicate-ID collisions, changed source/mapping/rights, and tombstones. Assert the explicit P4 outcomes and no silent overwrite.
7. Keyboard-only and screen-reader checks for source changes, focus order, zoom/pan, editing, rights, missing/denied/unresolved mapping, substitutes, and conflicts.
8. Check package schema migration, malformed imports, attribution, and absence of credentials/partner pixels.
9. Run a rotated `World.arrange` regression only if the selected comparison layout puts rotated items in the same OSD World and invokes that method. Otherwise retain #2708 as a risk note and prioritize the Canvas/body mapping round-trip. Do not count the separate #2249 viewport tests as coverage of #2708.

## O1 — Discovery, alternatives, and negative findings

Presentation 3 models a compound object as a Manifest and its views as Canvases; painting Annotations associate content bodies with a Canvas. Image API 3 defines image-service regions, sizes, rotation, quality, and format. Web Annotation supplies SpecificResource/selectors and does not supply this product's storage, review status, rights, mapping contract, or conflict policy (S01–S04). IIIF Auth describes access tiers and possible substitutes; authorization remains distinct from representation identity and local policy (S05).

Retain Mirador, its annotation plugin/editor, and Annotorious as alternatives or comparison leads only. The captured sources do not qualify them for this desk's uploads, package portability, rights, concurrency, accessibility, or persistence. Retain issue #593 as an unverified multi-image integration report and #595 as a closed polygon-simplification lead with a follow-up, not proof of an active defect (S22–S26). Do not select another library based on these pages.

## O2 — Pinned code and mechanism

The inherited source map binds the v6.1.1 tag to commit `201d47833e3f10e9fa55159cd4203630521926b8` (S06–S07, S18). In that pinned code, `getContentSize` is original source-pixel size and image/viewport conversions use the individual TiledImage's transform state; upstream tests include unrotated coordinate/rectangle round-trips and rotation coverage (S08–S09). `IIIFTileSource` handles Image API service behavior, while `Viewer.open` consumes tile-source specifiers (S10–S11). This supports a candidate viewer and adapter boundary, not the Canvas/body mapping correctness proposed in P2.

## O3 — Issue, fix, regression, and release evidence

Issue #2708 reports `World.arrange` misplacing/scaling rotated items. PR #2709 changes `getBounds()` to `getBoundsNoRotate()` in `src/world.js`; the exact patch changes one line and no test file (S16–S17, C01). The fix appears in pinned `world.js`; the captured pinned World tests exercise ordinary arrange cases and contain no rotated arrange case (S14–S15). The patch was merged as `06ce53a` on 2025-04-17; v6.1.1 applicability is supported by the inherited release/tag records (S06–S07, S18). PR #2249 and its viewport-test patch show separate rotated-boundary history, not regression coverage for #2708 (S19–S21). The P6 check is conditional as stated above.

## O4 — Full frozen-plan comparison and dispositions

| Frozen section | Disposition | Revised choice and condition |
|---|---|---|
| P1 Sources | **Retain with clarification** | Keep local/IIIF sources, ordered multi-view Manifests, fifty-object session, IDs and rights. Distinguish every Manifest/Canvas/body/service/file identity. Presentation v2 and source reattachment depend on inventory and reliable version evidence; unverifiable identity requires curator confirmation. |
| P2 Inspection | **Retain and revise** | Keep zoom/pan, two-view comparison, rectangles/polygons, text/status, no recognition. Change draft's source-pixel canonical selectors to Canvas-space pixels plus an explicit body binding and reversible mapping. Complex mappings remain unresolved/read-only until supported and fixture-validated. |
| P3 Exchange | **Retain with added conditions** | Keep portable refs/annotations, no partner pixels by default, policy-gated institutional thumbnails, missing/denied/changed states, and confirmed reattachment. Add body mapping/version, complete rights gate, explicit substitute representation, and package base revision. |
| P4 Storage | **Retain and specify** | Keep a small service, independent exchange, deferred live collaboration, and visible conflicts. Add same-base merge condition, stable IDs, collision behavior, tombstones, and divergent-base/source/rights outcomes. |
| P5 Components/usability | **Retain candidate, leave options open** | Keep pinned OSD for tiles/transforms and app-owned Presentation/annotation/package/rights components. Parser and annotation library remain unselected pending fixtures, license, maintenance, version and error review. Keep keyboard/focus/rights/status and profile-aware bandwidth requirements. |
| P6 Validation | **Retain and expand** | All checks remain proposals. Add Canvas/body mapping fixtures, explicit package outcomes, policy coverage across previews/retries, and conditional #2708 arrange coverage. |

No section is rejected outright. The draft's source-pixel canonical coordinate decision is **replaced** by the Canvas-space contract above because its Canvas/body relationship was underspecified. Source-pixel dimensions and OSD per-image transforms remain useful inputs, not durable annotation coordinates. Library selections, Presentation v2 support, arbitrary body transformations, provider identity guarantees, legal/policy permission, and server/browser fetch architecture remain **uncertain or conditional**, not silently accepted.

## O5 — Criticism-by-criticism disposition

1. **Canvas versus painted-body coordinate frame — accept and resolve at plan level.** Canvas-space pixels are canonical; each image note selects a Canvas and exact painting/body identity, records dimensions and a reversible mapping, and uses Canvas-relative selectors. Multiple bodies require explicit selection. Mapping cases that cannot be derived exactly remain read-only/unresolved. The critic's plain, cropped/transformed, and multi-body fixtures are added to P6. This is a proposed design and test requirement, not a validated implementation.
2. **Rights, previews, and authorization substitutes — accept.** Keep partner pixels remote, require a policy gate even for institutional thumbnails, apply it to previews/retries/all paths, distinguish `rights` from `requiredStatement`, keep credentials transient, and treat substitutes as distinct representations. Preserve the original annotation target; disable editing/overlay where a representation mapping is unverified.
3. **Revision merge identity — accept.** P4 now specifies stable IDs, base revisions, duplicate-ID conflicts, tombstones, same-base-only disjoint merges, divergent-base preservation, source/mapping/rights-change conflicts, and expected edit/edit and delete/edit outcomes. No deterministic merge is claimed as tested.
4. **Conditional `World.arrange` test — accept.** Retain #2708 as relevant upstream history; make the app regression conditional on the selected layout invoking the same OSD path. Do not treat #2249 as #2708 coverage.
5. **Alternatives and issue-report strength — accept the caution.** Mirador/editor and Annotorious remain leads only. #593 is an unverified report; #595 is a closed lead, not a current defect finding. No alternative is promoted to a qualified component.
6. **Server-side fetch/redirect versus browser CORS question — defer as an open architecture decision, not a finding or new stage.** No server-fetch architecture or security defect was established. The existing implementation design must state whether the browser or service fetches sources; if service-side fetching is selected, specify allowed destinations/redirects and credential handling, and if browser fetching is selected, document provider CORS limits. This remains unresolved pending architecture choice.
7. **Critic's remaining approval objection — partially resolved.** The plan now makes an explicit coordinate choice and adds merge semantics. Fixture/build/package validation has not occurred, so implementation approval and claims of correct mapping remain open. Unsupported transforms must not be guessed.

## O6 — Decisions, uncertainties, and execution limits

Before implementation, obtain partner inventory for Presentation versions, Canvas/body patterns, Image API profiles, Auth and stable version markers; choose local-file portability and institutional-ID policy; set package signing/retention/schema migration and thumbnail permission policy; select parser/annotation library after fixture/license/maintenance review; define curator permissions/conflict UI; and decide browser versus service source fetching. Public specifications and upstream code do not establish partner conformance, URL stability, legal permission, local bandwidth, or application mapping correctness. No partner data was accessed. No new discovery stage is authorized by this plan.

Executed here: read only the named input map, exact predecessor drafts/maps, and their same-arm captured source bytes; performed 27 warm raw-byte-cache reads and inspected relevant specification/code/test/patch excerpts. No independent query, cold fetch, application build, upstream test run, acceptance test, or validation proposal was executed. Proposed checks above remain unexecuted.
