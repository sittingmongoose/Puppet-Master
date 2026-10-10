# Critic review — A2-02-treatment

## Scope and method

Reviewed the frozen handoff copies of the brief, discovery, draft, source map, revealed plan, source index, and all S01–S14 evidence notes. The `check-input` gate passed: 21 complete members verified; this verifies bytes, not comprehension or source truth. I independently opened the cited public primary specifications, pinned repository pages, release records, and issue history for the consequential standards, compatibility, and viewer claims. See [sources/index.md](sources/index.md) and this stage’s [source-map.json](source-map.json). No collection endpoint, product instance, install, code, or executable/product validation was run.

## Overall assessment

The draft corrects the released plan’s pixel-rectangle/current-URL, cosmetic-migration, and single-format assumptions; preserves the complete pilot scope and the optional transcription-only bundle; keeps both owner decisions with their named owners; retains every negative constraint; and separates read-only research from product checks that remain `NOT_RUN`. The proposal distinguishes the IIIF/W3C data model from viewer UI, persistence, and interoperability, and makes image/version/access conditions explicit. I found no material wrong or materially incomplete treatment, no unsupported product-performance claim stated as fact, and no false correction. Two minor source-attribution/context notes are indexed below; neither warrants reducing scope or changing the recommendation.

## Released plan and obligation coverage

| Obligation / plan clause | Review |
| --- | --- |
| 1. Page identity, coordinates, cross-viewer and image-size portability | Adequately corrected: curator-owned stable IDs map to provider Manifest/Canvas identifiers and versions; Canvas is the coordinate frame; changed geometry is flagged for review rather than silently remapped. The Cookbook’s aspect-ratio condition is retained. |
| 2. Two viewers and analogous mechanism | Adequately compares Mirador 4 and Universal Viewer, with IIIF Presentation 3 Annotation Pages/W3C Web Annotation treated as a separate data mechanism. The draft does not promise UV authoring or annotation persistence and holds those behaviors for validation. See minor source note C01. |
| 3. Manifest versions, remote images, exchange, source preservation | Adequately covers v2/v3 conversion with source identity retained, external image capability/access conditions, and three distinct exchanges (Manifest, annotation bundle, Content State). It does not suggest editing provider material. |
| 4. Compatibility history and affected work | Adequately identifies the Mirador 4 breaking boundary, the M3 plugin limit, and the reported install-time dependency conflict; it relates these to installation/authoring and gates later persistence/export work on a tested combination. Issue follow-up context is noted in C02. |
| 5. Optional transcription-only bundle | Preserved as user-requested optional scope, not mandatory or established capability; includes a plausible text/sidecar proposal, conditions, and no unsupported exclusion. |
| 6. Owner decisions | Curator’s stable-ID authority and reading-room lead’s private-by-default authority remain explicit and unmade. These are honestly unresolved owner inputs, not inferred viewer defaults. |
| 7. Negative constraints | All four constraints remain binding. Selected annotation export is distinguished from copying collections or publishing notes. |
| 8. Coherent proposal and validation | The draft includes evidence-linked recommendations, versions, alternatives, unresolved facts, and an executed-vs-proposed validation table. Documentation review is not presented as successful product operation; proposed checks stay `NOT_RUN`. |

## Minor notes

1. **C01 — minor locator/wording.** The UV “view-oriented” and Manifest handoff descriptions cite S14, a community IIIF guide rather than versioned first-party product documentation. The draft correctly describes this as reviewed evidence and does not claim that UV lacks an editor. Keep that attribution explicit and avoid generalizing the guide’s UI steps to every UV deployment. The pinned v4.4.4 manual directly supports the cited configurable image-download defaults, not annotation authoring or persistence.
2. **C02 — minor context.** S10 captures issue #75’s original install failure and correctly avoids claiming a current general defect. The issue’s April 2023 follow-up says then-current Mirador `master` might already address the errors and asks for testers; it does not establish a released fix. Including that qualification would make the history trace complete without changing the present recommendation to validate an exact dependency set.

## Unresolved external inputs (not draft faults)

The curator’s stable-ID scheme and version mapping; the reading-room lead’s privacy default; the actual 100-page provider versions, rights, authentication/CORS, and availability; and exact-version behavior for Mirador/MAE and UV remain external facts. The draft identifies them and proposes checks rather than inventing answers. No final was written or repaired by this critique.
