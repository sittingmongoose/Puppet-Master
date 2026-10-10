# Independent critic review — Portable reading-room annotation workspace

Run: A2-02-control  
Stage: critic  
Review basis: complete original brief, saved discovery and proposal, released plan and reveal receipt, and carried source index/map. I independently opened the indexed public primary pages S1–S21 and checked the consequential standards, recipe, viewer, plugin, issue/fix and release claims. My review records, retaining the same source IDs, are in source-map.json. Web research is research evidence only. No collection, viewer build, annotation store, or import/export operation was exercised.

## Overall assessment

The proposal is substantially responsive and preserves the brief. It corrects the unsafe pixel/current-URL draft, gives a bounded IIIF path and analogous mechanism, retains the optional transcription-only path, makes owner decisions explicit, and marks product checks NOT_RUN or PROPOSED. I found no material wrong claim that invalidates the proposal. The main weaknesses are conditional gaps in source-revision and versioned round-trip behavior, and a release-history claim whose cited evidence does not establish the last link in the chain.

This critique is an independent review, not authority to reduce scope or replace the reviser’s responsibility to produce a complete final.

## Findings

### C1 — Material incomplete: source revision behavior is not operationalized
**Locators:** draft.md, “Recommendation and scope” and Canvas-coordinate paragraph; “Open owner and implementation inputs,” curator bullet.  
**Evidence:** The proposal says to save the source revision used to create each target and flag changed content for review, but does not say how a note maps to an exact manifest/image state if a collection exposes no revision identifier, or how a later change is recognized. IIIF Presentation 3 defines Canvas as a frame of reference and recommends persistent IDs; that is not a content-version history (S1, Canvas and URI recommendations). The differing-dimensions recipe supports mapping across image-size changes only with consistent source/Canvas aspect ratios (S7, Restrictions).  
**Assessment:** The safe response to crop/content/identity changes is correct, but detection and traceability remain incomplete for a portability proposal. This is a pilot design question. Do not assume a timestamp or stable Canvas URI identifies the image content version.

### C2 — Material incomplete, conditional on source versions: the v2 import/export branch is ambiguous
**Locators:** draft.md, “Recommendation and scope,” first paragraph; “Evidence and limits,” version paragraph; “Alternatives and decision conditions,” item 1; “Open owner and implementation inputs,” pilot-team bullet.  
**Evidence:** The text prefers v3 where supplied and calls for a read-only v2.1.1 adapter only if inputs require it, while also requiring version-selected output and loss reporting. Presentation 3 changed the annotation model and structural names; its change log says practical effects are limited but real (S2, annotation structures; S3, sections 1.1.2 and 1.2.1).  
**Assessment:** The conditional v2 branch needs an explicit disposition if an authorized collection supplies v2: whether notes export as v2, convert to v3/W3C Web Annotation, or use another named reuse package, and what loss makes export fail. “Read-only v2” leaves the reuse obligation uncertain for that branch. Whether v2 is actually needed remains an honestly unresolved external input until inventory.

### C3 — Unsupported as presently evidenced: Mirador fix-to-release inclusion
**Locators:** draft.md, “Evidence and limits,” Mirador regression paragraph; source-map.json, S15–S16.  
**Evidence:** Issue #4198 reports the missing annotation/layer notification dot in Mirador 4; PR #4201 is merged and titled as restoring the badge (S14–S15). The PR page displays merge commit 25c0b0e; the carried map lists 056262a without saying whether that is a PR-head or merge commit. The v4.2.4 page identifies tag commit 73fafe9 and a 2026-09-02 release date, but the inspected release notes do not themselves identify PR #4201.  
**Assessment:** Issue → merged fix is supported and relevant. The final release edge is plausible from chronology, but is not established by the cited locators. Verify tag ancestry/released source, or describe inclusion as an inference. Disambiguate the PR commit from its merge commit. This does not show the fix is absent.

### C4 — Minor locator/wording: the viewer comparison is dispersed
**Locators:** draft.md, opening viewer paragraph; “Per-clause disposition,” clause 2; “Alternatives and decision conditions,” item 2.  
**Evidence:** The proposal contrasts Mirador’s multi-up comparison with Universal Viewer’s broader embeddable content support and separates display from authoring/storage. The official overview supports those high-level descriptions (S11). The current cookbook matrix marks Mirador Yes and UV No for the specific Simple Annotation — Tagging recipe, not all annotation behavior (S10, Annotation Recipes row).  
**Assessment:** The comparison obligation is met in substance, and the matrix result is properly bounded. A compact paired summary of evidenced native capability, pilot fit, and unproven integration need would make the result easier to audit. No product instance was tested.

### C5 — Minor wording: text-only bundle metadata could be more explicit
**Locator:** draft.md, “Retain the brief-authorized optional downloadable transcription-only bundle.”  
**Evidence:** The proposal retains an optional text file and page/provenance index, subject to rights/access, and excludes images. IIIF’s transcript recipe distinguishes download via a rendering link from a transcript shown alongside the Canvas (S9, options 1–2). The text-on-Canvas recipe describes painting text into the Canvas and warns that rendering/styling varies (S21, implementation notes and restrictions).  
**Assessment:** The option is correctly retained, conditional, and not presented as an existing viewer feature. Naming language and transcription status/provenance (manual, OCR, or unverified where known) would better preserve scholarly reuse. This is bounded completeness, not a reason to exclude the option.

## Exact-obligation disposition

| Brief obligation | Critic disposition |
|---|---|
| 1. Page identity, region coordinates, portability | **Mostly satisfied, with C1.** Curator-owned stable IDs stay separate from Canvas targets; Canvas-space rectangles, dimensions, aspect-ratio conditions, and review for crop/orientation/content/identity changes are addressed. Mapping remains a product proposal, not a universal viewer guarantee. |
| 2. Two viewers plus analogous mechanism | **Satisfied in substance; C4.** Mirador and UV are compared; Annotorious/OpenSeadragon is explicitly an integration proposal; recipe support is not generalized to feature parity. No product was tested. |
| 3. Versions, remote availability, import/export, untouched masters | **Mostly satisfied; C2.** The proposal covers structural version change, remote access/CORS/auth dependencies, separate storage, loss reporting and no source writes. The v2 export/reuse branch needs a conditional decision. |
| 4. Released compatibility or issue/fix history | **Partially satisfied; C3.** The IIIF change is relevant and supported. Issue and merged PR are supported; the cited evidence does not establish v4.2.4’s inclusion of the fix. |
| 5. Optional text-only download | **Satisfied; C5.** It remains authorized optional scope, conditioned on rights/access and privacy, with no image bytes and no claimed viewer support. |
| 6. Owner decisions | **Satisfied.** The curator owns stable page IDs and the reading-room lead chooses the privacy default. The private-by-default recommendation remains unapproved, not inferred. |
| 7. Negative constraints | **Satisfied.** Collection content remains at its source, viewer parity is not promised, and public publication is not mandatory. |
| 8. Complete proposal and honest validation | **Satisfied.** Alternatives, open inputs and recommendations are included. Documentation/stage-control work is separated from product checks. The table correctly marks product operation NOT_RUN and future checks PROPOSED. |

## External inputs and validation status

These are **honestly unresolved external inputs**, not defects public research can settle: the 100 actual manifest versions and stable-ID policy; whether collections expose revision identifiers; image/annotation endpoint availability, CORS, authentication and rights; the curator’s changed-page/crop crosswalk; and the reading-room lead’s privacy default. No live source or product check was run. Inventory, round-trip, coordinate, viewer, access-failure and text-bundle checks remain **PROPOSED**. Source review is not product validation.

## Source-check notes

Independent checks confirmed: S3’s W3C model adoption and identifier/type renames; S7’s aspect-ratio restriction; S8’s warning that a whole-Canvas annotation may lack a visual indicator and a full-area selector may be better supported; S9’s rendering-link download pattern; S10’s recipe-specific matrix row; S13’s Mirador 3 plugin boundary and server-persistence requirement; S14–S15’s regression and merged repair; S16’s tag identity/date but not the PR-to-tag edge at the inspected locator; S17–S20’s release and Annotorious caveats; and S21’s distinction between painted text and viewer-handled annotations. Exact identities, locators, observed operations, conditions and applicability are preserved in source-map.json.

