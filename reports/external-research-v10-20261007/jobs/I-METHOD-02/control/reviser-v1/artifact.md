# I-METHOD-02 — Museum object-image annotation desk
## Reviser v1 — complete proposed-change plan

**Stage:** ER10 I-METHOD-02 / control / reviser-v1  
**Status:** Complete revised plan. This is a source-bounded proposal; no application was built or validated.  
**Inputs:** The exact researcher v1 artifact and source map, exact critic v1 artifact and source map, and the reviser input map. This review did not open the original brief/plan, prior history, other case or arm materials, or assessor/scoring material. Public evidence below was independently fetched from the original locators recorded in this stage's [source-map.json](source-map.json).  
**Evidence references:** E01–E25 refer to entries in source-map.json and the full captured bytes in `sources/`.

### Research record and limits

The researcher record reports its first useful saved source at 2026-10-07T19:22:52Z, its complete-draft mark at 19:33:30Z, 28 direct public HTTP GETs and five web discovery/open calls. The critic record reports its first useful finding at 2026-10-07T19:40:32.615407596Z, its complete-artifact mark at 19:42:19.178965531Z, 25 direct public HTTP GETs and no discovery queries. Both report static source inspection only and zero upstream tests, builds, or interoperability runs.

For this revision, the first useful independent source bytes were saved at 2026-10-07T19:46:42.581504816Z (the W3C Web Annotation capture, E05). I made 25 direct HTTP GETs from the exact public locators already named by the two supplied maps, saved 25 full response files, and made no discovery queries. Requests used ordinary curl with a no-cache request header. I inspected the standards, official product pages, pinned source, release metadata, issue/PR records, and upstream test source as data. I did not execute retrieved code, run tests, build an application, or perform an interoperability witness. Every acceptance item below is a proposal, not an executed result. The complete-artifact timestamp and mechanically computed hashes/byte counts are recorded in source-map.json.

## O1 — Standards and product evidence

IIIF Presentation 3.0 models a compound object with a Manifest and ordered Canvases. A Canvas has its own identifier and dimensions; painting Annotations place content on it, and separate Annotation Pages can contain other annotations. The model provides a view identity and spatial frame that does not depend on the current array position (E01). The Presentation 2.1 specification also gives Canvases explicit dimensions and describes a Canvas as a logical view; content must be scaled into that space and stay within its extent (E02).

The versioned metadata fields differ. Presentation 2.1 describes `license` as a URI linking to the applicable license or rights statement and `attribution` as text that must be shown when the associated resource is used or displayed. Presentation 3.0 has `rights` as an informative rights URI and `requiredStatement` as text clients must display. The field names, shapes, resource levels, and display semantics must therefore be preserved by a version adapter rather than silently collapsed (E01–E02). IIIF Image API 2.1 and 3.0 separately describe image-service identifiers, info documents, dimensions, region/size requests, rights metadata and browser access concerns (E03–E04).

The W3C Web Annotation model supplies Annotation, SpecificResource, FragmentSelector, and SvgSelector structures. It supports rectangular media-fragment targets and non-rectangular SVG areas, while application review status and revision lineage remain desk metadata (E05). The IIIF Cookbook's multiple-view example supports using multiple Canvases for views of one object (E07).

The RightsStatements.org No Copyright—Contractual Restrictions page says that its statement summarizes contractual limits, is not a license, and that additional permissions may be needed. A rights URI or a museum policy label is not itself permission to republish partner pixels (E06).

Mirador is the closest product fit lead: its official page describes image comparison, IIIF Presentation/Image API v2 and v3 support, annotation creation through a plugin, and workspace import/export. The page does not establish this desk's package rights or revision workflow. Universal Viewer is a useful read-oriented/embeddable alternative; its official page describes IIIF Manifest input and OpenSeadragon image zoom, not this desk's annotation/review package. Annotorious is a possible drawing-UI spike based on its guide's OpenSeadragon/IIIF integration; no pinned code or package behavior was checked (E23–E25). These are fit hypotheses, not implementation evidence.

## O2 — Conditional component candidate and mechanism

Carry OpenSeadragon 6.1.1 as a **conditional Image API deep-zoom renderer candidate**, pinned for investigation to commit `201d47833e3f10e9fa55159cd4203630521926b8`. The v6.1.1 tag-ref and annotated tag object resolve to that commit; its release record is dated 2026-09-09, and the independently fetched latest-release endpoint returned v6.1.1 at this stage's capture time (E08–E11). This is not a final component lock or a claim about all partner services.

At that commit, `IIIFTileSource` normalizes v2 `@id` and v3 `id` into its internal identifier, requires an identifier and image dimensions, consumes Image API metadata for tiling, and constructs partner Image API region/size URLs. Viewer source resolution selects a TileSource; the inspected code does not parse a Presentation Manifest. The desk therefore needs a separate Manifest adapter that selects a Canvas and resolves its painting content before handing an image service to OpenSeadragon (E12–E13).

OpenSeadragon's TiledImage helpers convert between **image-pixel** and viewer coordinates, including rectangle helpers. They do not perform the separate Canvas-to-painted-image mapping required by a Manifest. Its overlay API describes locations relative to the viewport, and overlays may be cleared on close or sequence-page changes unless configured otherwise. Store notes in the desk's durable model and redraw them; treat overlays as rendering state only (E13–E15). Upstream coordinate round-trip assertions and overlay tests were inspected, not run (E15, E17).

## O3 — Issue, fix, regression source, and release

Issue #2962 reports a valid IIIF v2 info document with `sizes: []` that fails during OpenSeadragon 6.1.0 tile-source construction. PR #2963 adds a non-empty-array guard and a fixture/test named “IIIFTileSource ignores an empty sizes array.” The test source asserts that an empty sizes list yields no derived legacy pyramid and matches the no-sizes case for max level, tile width, and tile URL. The pinned v6.1.1 source contains the guard and test; its release record names fix #2963. This supports the bounded issue → fix → regression-test-in-source → released-version chain for that case (E10, E12, E16, E18–E20). It does not establish broad partner compatibility, and no test was run here.

**Root-cause attribution remains uncertain.** The supplied draft repeats the issue/PR text attributing the regression to `ae500afb` and “#2710.” The separately reacquired commit record describes that commit as a refactor associated with PR #2337, while the supplied “issue #2710” locator returns a different change titled “Change to getTileUrl.” The final plan does not rely on a precise #2710 link; preserve it only as an unresolved upstream attribution, not as a verified causal chain (E18–E22).

## O4 — Complete comparison with inherited P decisions

| Inherited plan item | Disposition | Revised comparison |
|---|---|---|
| **P1 — Sources, multiple views, source identifiers, rights; session bound up to fifty objects** | **Retain and correct.** | Keep local uploads and curator-supplied IIIF resources, stable object/view identity, and per-view rights/source metadata. Parse Presentation manifests separately from Image API info documents. Add explicit v2/v3 metadata adapters. Keep the fifty-object bound as a session limit with lazy selected-view loading. Supported versions remain a museum decision pending partner inventory. |
| **P2 — Zoom/pan, two-view comparison, rectangle/polygon notes, identity, coordinates, text, author/status; no recognition** | **Retain and correct.** | Keep separate view panes, durable view targets, Canvas-coordinate intent, and no recognition. Derive Canvas-to-image mapping from the actual painting Annotation target/selector and image body/service; OSD then maps image pixels to viewer coordinates. Do not treat a dimension ratio alone as a complete transform. |
| **P3 — Portable packet, annotations, selected locally owned thumbnails, partner pixels omitted by default, reopen states** | **Retain and strengthen.** | Retain object/view references, annotation records, rights snapshots, missing/changed/denied-source explanations, and note preservation. Reject the conditional partner-pixel exception: no partner image bytes, crops, proxies, or partner-derived thumbnails in any package. A local thumbnail is eligible only if the museum establishes both local ownership and authorization for package use. |
| **P4 — Institutional package/revision service, independent review, no live co-editing, surfaced conflicts** | **Retain.** | These choices already appear in the inherited plan. Keep immutable package/base revision metadata, idempotent duplicate import, and human-visible conflicts; add delete-versus-edit to proposed conflict checks. Authentication, roles, retention, backup, merge UI, and audit policy remain museum decisions. |
| **P5 — Viewer/parser/serialization undecided; keyboard, focus, readable rights, low bandwidth, explicit coordinates** | **Retain as requirements; do not lock components.** | Keep OpenSeadragon 6.1.1 as a conditional renderer, Mirador and Annotorious as unverified prototype options, and Universal Viewer as a read-oriented alternative. Require a distinct Manifest adapter, app-owned annotation records, keyboard/focus support, readable rights, and a museum-defined low-bandwidth threshold. |
| **P6 — Multi-view, replacement, reopen, geometry, missing-image, and rights-dependent acceptance** | **Retain and expand.** | Keep the inherited themes. Add v2/v3 field preservation, a Canvas-to-image transform fixture including offset/crop, the absolute package prohibition, duplicate/delete-edit conflict cases, and a measurable request bound selected by the museum. All checks remain proposals. |

**Already covered in the inherited plan:** P1 already includes multiple views and locally owned thumbnails; P2 already includes two-view comparison and no recognition; P3 already includes the default exclusion of partner pixels and missing/changed-source note preservation; P4 already defers simultaneous editing and requires surfaced conflicts; P6 already has the broad validation themes. Those are retained requirements. The revisions above make their conditions more precise and add the critic's missing cases.

## Complete revised sandbox plan

### P1 — Sources and view identity

Accept local images and curator-supplied IIIF resources without assuming ownership of partner imagery. Normalize an input into an object record and one or more view records. For a Presentation Manifest, retain its source/version, Manifest URI, Canvas URI and dimensions, and the painting Annotation's raw target and body/service identifiers. For a direct Image API info document, retain its service identifier, API version and dimensions and attach it to a desk-owned stable view ID. A local upload also receives a desk-owned view ID; any local content fingerprint is an identity aid, not proof of export permission.

Implement version-specific adapters. Preserve the original source fields and their provenance/resource level alongside normalized display metadata:

- Presentation 2.1: retain each `license` URI and `attribution` value at the resource level where it appeared. Display applicable attribution text; do not turn a license/rights link into an export grant.
- Presentation 3.0: retain each `rights` value and `requiredStatement` label/value at its source resource level. Make required statements available to the user as required by the specification.
- Keep Presentation and Image API support matrices separate. The museum must inspect representative partner inventory and choose the supported versions before implementation. Until then, claim neither dual-version support nor general compatibility. Reject unsupported or malformed input clearly while preserving existing notes and raw source references.

A session may contain up to fifty objects. Load the selected/current views and only the thumbnails needed for navigation; do not request fifty full-resolution images merely because the session permits fifty objects. A view is never identified by current array order or pane position.

### P2 — Inspection and annotation model

Use an Image API viewer for remote service views and a separately checked local-file path. Compare two views in separate panes by default, with each pane bound to its own stable view identity. Do not use OpenSeadragon sequence position as identity.

Store geometry in the source Canvas frame: top-left origin, unrotated coordinates, finite values inside the Canvas extent. For each painting Annotation, retain the raw annotation and derive an explicit mapping from its target (including any Canvas fragment/selector or offset/crop) and its body image/service metadata. Apply that mapping from Canvas coordinates to the painted image's pixels, then use OpenSeadragon's image-pixel/viewer helpers for display. A single dimension ratio is insufficient when target placement, crop, multiple painted resources, or other transforms affect the mapping. If the mapping cannot be interpreted safely, mark the view unsupported/uncertain and do not guess where notes belong.

Represent rectangle exchange with a Web Annotation SpecificResource and FragmentSelector; represent polygons with an SvgSelector in a documented Canvas-sized coordinate frame. Validate geometry and preserve stable Annotation ID, author, timestamps, text body, target/view identity, selector, and review status. Review status is desk metadata, not a claim that Web Annotation defines it. Sanitize imported SVG/text and render content as data. No visual recognition is included.

OpenSeadragon 6.1.1 is a renderer candidate only. Reopen annotations from the desk's durable records and redraw them using the composed mapping. Never treat overlays, viewport positions, sequence positions, or transient selection as canonical annotation data.

### P3 — Review package and rights behavior

Define one versioned package document containing package ID/version, object and view records, annotation records, source metadata snapshot, rights/attribution snapshot, revision lineage, and per-view reopen status. A ZIP may contain that document and only thumbnails that the museum can establish are locally owned and authorized for this package use, and that a curator explicitly selects.

**Never package, proxy, or fetch for packaging/export any partner image bytes, partner crop, or partner-derived thumbnail.** A rights URI, required statement, or local policy label does not change this rule. For in-browser inspection, use only the curator-supplied source reference and only under the applicable provider access terms; this plan makes no general permission claim about remote display. Keep display requests distinct from packaging and export.

On reopen, try the supplied reference and retain the note even when the source cannot open. Show object/view identity and distinguish unreachable, denied/authentication-required, unsupported, metadata-changed, and identity-not-verifiable states. Keep prior rights/attribution data and newly observed source metadata side by side when they differ. Matching URL and dimensions alone do not verify that image content is unchanged; say “metadata matches; content version unverified” unless a stable provider version signal exists.

### P4 — Storage and revisions

Keep the small institutional package/revision service and independent review exchange; defer live simultaneous editing. Persist immutable package and revision IDs, parent/base revision, author, timestamp, and import origin. Detect an unchanged duplicate import. If revisions diverge from a shared base, preserve both and present field/annotation conflicts for human review; never silently overwrite or resolve by timestamp alone.

Before implementation, the museum must choose authentication, access roles, retention, backup, merge interaction, and export/audit policy. Do not infer these service choices from IIIF or viewer evidence.

### P5 — Components and usability

Keep three bounded fit options for comparison before component lock: (1) OpenSeadragon 6.1.1 plus a small Manifest adapter and desk-owned annotation model; (2) Mirador integrated with the review package and revision service; (3) if useful, OpenSeadragon with Annotorious as the drawing UI and an adapter to the same desk-owned model. Universal Viewer remains a read-oriented alternative. The cited pages/guides do not verify these integrations, their accessibility, package rights behavior, revision conflicts, selector interoperability, or pinned implementation compatibility.

The MVP must provide keyboard navigation across objects/views, zoom/pan, visible focus, predictable return from dialogs, keyboard-operable rectangle authoring, a documented accessible alternative for polygon editing, readable rights/attribution, and review status not conveyed by color alone. Cap concurrent image requests and load thumbnails on demand. The museum must set a numeric request/response or transfer budget before low-bandwidth acceptance can be judged. Local file types, size limits, TIFF/RAW handling, and any browser-side conversion/tiling limits remain product decisions.

### P6 — Proposed acceptance matrix (none executed)

| Proposed check | Setup and expected result |
|---|---|
| Version adapters and identity | Use representative Presentation 2.1/3.0 manifests and Image API 2.1/3.0 services chosen from museum inventory. Preserve raw source fields, resource-level provenance, Manifest/Canvas/service IDs, dimensions, rights/attribution, and notes. Unsupported input reports a clear error without losing annotations. |
| Empty-`sizes` regression | Use the valid v2 info document with `sizes: []`; verify the selected pinned build uses dimensions/profile and requests the same tile URL as the no-sizes case. Retain the regression fixture in the desk suite. The upstream source test was inspected, not run here. |
| Canvas-to-image geometry | Round-trip known Canvas points/rectangles through target/selector → image pixels → viewport → image pixels → Canvas. Cover equal and unequal dimensions, target offset/crop, malformed or unsupported targets, polygon exchange, out-of-bounds values, rotation, pan, zoom, resize, close/reopen. Unsupported transforms must not silently place notes at guessed coordinates. |
| View identity and comparison | Compare two views in two panes, annotate each, then reorder, replace, close, reopen, and exchange. Notes stay attached to Canvas or desk-owned view identity rather than pane or array order. |
| Missing/changed source | Exercise unreachable, timeout, denied/auth-required, CORS failure, unsupported version, changed identifiers/dimensions, and unchanged metadata with no stable version signal. Explain each state and preserve annotations/targets. |
| Rights and package boundary | Inspect archive contents and export request logs. No partner pixels, crop, proxy, or partner-derived thumbnail is included or fetched for packaging. Rights/attribution stays readable; no metadata field activates export. Include only a curator-selected thumbnail with established local ownership and authorization. |
| Revision conflict | Import an unchanged base twice, then divergent edits from two reviewers, including delete-versus-edit. Duplicate import is idempotent; divergent content is preserved and shown to a curator. No silent last-write-wins. |
| Keyboard, focus, and bandwidth | Use keyboard only for object/view navigation, pan/zoom, rectangle creation/editing, review status, rights inspection, and dialog return. Verify visible focus and non-color status. Measure requests with fifty objects against a numeric budget chosen by the museum before the check. |

## O5 — Critic disposition record

| Criticism | Disposition and basis |
|---|---|
| **1. P3 partner-pixel exception contradicts the constraint; policy name/opt-in is not a grant.** | **Accepted.** The exception is removed. Packages and export paths exclude partner image bytes, crops, proxies, and partner-derived thumbnails. Local thumbnails remain only with established local ownership and package-use authorization plus curator selection. Remote display is separately conditional on provider access terms. E06 warns that a rights statement is not itself a license and other permission may be needed. |
| **2. P1/P3 v2/v3 rights/attribution fields need explicit mapping; version scope is not settled without partner samples.** | **Accepted.** P1 now preserves v2 `license`/`attribution` and v3 `rights`/`requiredStatement` verbatim with provenance and resource level, while using version-specific adapters. Presentation and Image API version support remain separate museum decisions pending representative inventory; no dual-version support is claimed. E01–E04 support these field distinctions. |
| **3. P2 scale ratio is not a complete Canvas-to-image mapping.** | **Accepted.** P2 derives and retains the mapping from actual painting Annotation target/selector and image body/service metadata, including offsets/crops and scale. OSD conversion is limited to image pixels ↔ viewer coordinates. Uninterpretable mappings fail closed as unsupported/uncertain; validation adds transform fixtures. E01–E05, E12–E14 support the separation of coordinate frames. |
| **4. O2/O3 evidence supports OSD 6.1.1 only as a conditional renderer; issue chain limits must remain explicit.** | **Accepted.** The component remains renderer-only and conditional. The source issue, fix, test source, pinned implementation, and release are recorded; reporter version comparisons and upstream tests are not reported as this stage's execution. E08–E20 support the limited chain. The researcher’s `#2710` root-cause linkage is not adopted as verified because reacquired records disagree; it remains unresolved and is not required for the empty-`sizes` acceptance. |
| **5. P4/P5 alternatives and service choices require boundaries; add delete/edit and measurable bandwidth acceptance.** | **Accepted.** Revision semantics remain design proposals and museum choices, with delete-versus-edit added to proposed coverage. Mirador, Annotorious, and Universal Viewer remain limited fit hypotheses, not code comparisons or validated integrations. Usability requirements remain acceptance proposals. Low-bandwidth acceptance requires a museum-set numeric budget before it can pass or fail. E23–E25 support only the narrow product descriptions. |

There is no unresolved disagreement with the critic. The upstream `#2710` attribution remains uncertain as stated above; museum choices listed below also remain open.

## Product choices, options, and rejected behaviors

**Recommended starting path:** evaluate OpenSeadragon 6.1.1 only as a deep-zoom renderer with a separate Presentation adapter and a desk-owned Web Annotation-shaped record. Do not lock it until representative v2/v3 inputs and the complete Canvas-to-image transform fixtures pass in the candidate path.

**Alternatives:** Mirador may reduce viewer/Manifest work if an integration can satisfy the package, rights, and revision behavior; the captured page establishes only feature leads. Universal Viewer is a read-oriented baseline, not evidence of authoring or review exchange. Annotorious may reduce drawing work, but the guide alone does not establish pinned compatibility, selectors, keyboard access, or package integration. A custom SVG drawing surface remains an option only if the same geometry, accessibility, sanitization, identity, and revision requirements are met.

**Rejected behaviors:** exporting or proxying partner pixels; treating rights metadata as permission; conflating Image API info with a Presentation Manifest; identifying views by array/pane order; persisting viewport geometry or viewer overlays as canonical notes; guessing a transform for an unsupported painting target; silently dropping notes when a source is unavailable; or resolving revision conflicts by last-write-wins.

**Museum decisions still needed:** Presentation and Image API version subsets based on actual partner inventory; authorized local image types, file-size/performance ceilings, and TIFF/RAW handling; who may approve locally owned thumbnails and the evidence of package authorization; exact review-status vocabulary; source identity/version signals; authentication, access roles, retention, backup, merge interaction, and export audit policy; and the numeric low-bandwidth budget.

### Remaining uncertainty and limitations

No partner Manifest, Image API service, local image, service policy, or museum revision system was examined. Version adapters and painting-target transforms therefore remain proposals; a real input that cannot be mapped safely must be rejected or flagged uncertain. The captured standards and OSD source do not establish client interoperability, accessible polygon authoring, low-bandwidth performance, browser memory limits, or the museum's permission to include any local derivative. The product alternatives were not run. No application code, deployment, upstream test, desk test, build, or interoperability test was performed.

## O6 — Complete proposed-change artifact

This document is the complete revised plan: it covers the O1 standards/product evidence, O2 conditional component and mechanism, O3 bounded issue/fix/test/release evidence, O4 every inherited P1–P6 comparison, O5 explicit critic dispositions, and a full P1–P6 replacement plan with proposed acceptance checks, alternatives, product decisions, rejected behaviors, and limitations. It reports no unexecuted validation as completed work.

