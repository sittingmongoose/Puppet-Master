# Final research proposal — portable reading-room annotation workspace

**Stage / run:** investigator / A2-02-treatment.  
**Plan basis:** released copy revealed-plan.md; release record at 2026-10-10T05:17:32.911Z; plan SHA-256 41c98c70681d7ab5e6534f387777df30ec06ff94ee93cdb071e124fe1a0c8ff6. Discovery SHA-256 25c962b93672822b88cc92914254cf199304d48a0b04434268d87ee25e5593f7.  
**Scope:** complete planning proposal for a 100-page pilot from multiple digitized manuscript collections, covering the full brief and exact released plan. This is research, not implementation.
**Critique:** C01 and C02 are explicitly resolved in [critique-dispositions.json](critique-dispositions.json); source IDs and URLs remain unchanged.

## Recommendation

Build an independent annotation layer over read-only provider resources. Use curator-approved stable page IDs mapped to source Manifest and Canvas URIs, and store each Annotation outside the collections’ catalogues, manifests, and image masters. The technical candidate is IIIF Presentation API 3 Annotation Pages with W3C Web Annotation bodies and selectors. Begin with full-page text and simple rectangular targets, because simple data can be tested across viewers; do not claim that the standard forces every viewer to create or render every feature.

Keep the authoring choice open pending an exact compatibility spike. Mirador offers the closer authoring fit, but the original Mirador 3 plugin is explicitly incompatible with Mirador 4. MAE is a community option; its README offers a path but describes an older React/MUI/Mirador runtime than the reviewed current Mirador release. Universal Viewer is a useful separate reader and media viewer; the reviewed evidence does not establish it as a shared annotation editor/persistence system. Pin versions and demonstrate actual create, persist, export, import and render behavior before selecting an integration.

Retain the downloadable transcription-only bundle as an optional, user-requested path. A candidate form is UTF-8 text or TSV plus a small JSON-LD sidecar linking every transcription to the curator page ID, original Canvas/Manifest identifiers, language and optional region. It contains no images or whole collection copy. This is a proposal, not an observed capability or mandatory feature. Keep access and publication policy explicit.

## Evidence and design

### Page identity and portable coordinates

IIIF Presentation API 3 defines the Canvas as a page/view and coordinate frame. The Canvas has its own absolute HTTP(S) identifier, without a fragment; its width and height set the spatial extent. The Annotation targets the Canvas for a page-wide note or a SpecificResource with a FragmentSelector for a rectangle. See [S01](sources/S01-presentation-api-v3.md), [S04](sources/S04-web-annotation-model.md).

The Canvas is not the displayed image. The IIIF Cookbook documents a Canvas whose dimensions differ from the current image pixels, including a larger Canvas prepared for replacement with a larger image. With a stable Canvas coordinate space, replacing only pixel resolution need not move an annotation. See [S03](sources/S03-canvas-coordinate-space.md).

**Proposed local choice:** Have the collections curator approve the stable page identifier scheme. Preserve both that identifier and every source Manifest/Canvas URI, source version/retrieval, image identifier, image dimensions, Canvas dimensions, and any version-to-version mapping. Do not derive identity from position, label, image URL, or dimensions. Keep annotation coordinates in the stable Canvas frame, and validate every rectangle against the recorded Canvas bounds. Percentage selectors may help when the same page geometry is merely resampled; they do not repair a crop, rotation, altered aspect ratio, replaced page, or changed physical boundary. Those cases require an explicit mapping/review state and must never silently shift a scholar’s note.

### Viewer comparison and integration boundary

| Candidate | Evidence-backed capability | Boundary for this pilot |
| --- | --- | --- |
| Mirador 4 | Multi-window IIIF viewer with annotation ecosystem; v4.0.0 release documents IIIF v3 support. The Mirador 3 annotation plugin describes rectangle/oval/polygon authoring and text. | That old plugin says it does not work with Mirador 4. Choose a tested v4 plugin (MAE is one community candidate) or integrate an editor. Persistence needs an annotation server; browser local storage is not a shared institutional store. |
| Universal Viewer 4.4.4 | The IIIF community guide describes UV as more view-oriented than Mirador and able to display varied IIIF presentations/media; it gives Manifest URL share/import examples. The guide says themed deployments can move or relabel controls. | The reviewed pinned documentation does not establish the authoring, private persistence, or annotation-bundle exchange needed here. Keep UV as a real reader candidate and test it with the pilot records; do not infer that UV has no annotation capability. Community-guide descriptions are not first-party, version-pinned guarantees. |
| IIIF Presentation 3 Annotation Pages + W3C Web Annotation | Standards-based body/target/selector model, allowing annotations to be stored separately from source pages and linked to full Canvas or region. | A data model is not a UI, backend, authorization policy or interoperability guarantee. Implement only the shared plain-text/rectangle subset initially and test each client. |

Mirador 4.0.0 (release commit ce377cf464918db562b24ee63edf274e732327a4) is an explicit compatibility boundary: its release notes call for updates to plugins/integrations after major React/MUI changes. The original mirador-annotations README says it is for Mirador 3 and does not work with Mirador 4. Issue #75 reports a concrete pre-runtime installation conflict for plugin 0.5.0 plus Mirador 3.3.0 because the packages require incompatible React peer ranges. A June 21, 2023 thread comment says the then-current Mirador master might address the errors and asks testers to confirm before a release; the thread does not establish a released fix. These facts affect pilot dependency installation and annotation creation before persistence/export can be tested; the report is historical and is not a current general failure claim. MAE is a realistic alternative: the README describes Mirador 4 authoring and annotation-server/local-storage adapters, but its stated React 18/MUI 5 and Mirador 4.0.0-alpha.2 example is not evidence of compatibility with reviewed Mirador 4.2.6. Test an exact locked set. See [S07](sources/S07-mirador-v4-breaking-change.md), [S08](sources/S08-mirador-current-release.md), [S09](sources/S09-mirador-annotations.md), [S10](sources/S10-plugin-install-issue-75.md), and [S11](sources/S11-mae-compatibility.md).

As of research access on 2026-10-10, the reviewed release identities were Mirador 4.2.6 and UV 4.4.4. The UV release page warns against v4.4.3 because of a merge error; it does not claim the next version fixes annotation behavior. Do not use mutable latest aliases for an implementation. The UV 4.4.4 config describes whole-image high/low-resolution and current-view download controls as enabled by default. These are configurable reader controls, not permission to download any source image. Review collection terms and provider behavior; never write back to source masters. See [S12](sources/S12-universal-viewer-config.md) and [S13](sources/S13-universal-viewer-release.md). The comparison of UV’s view-oriented feel and Manifest handoff comes from the live community guide S14; it is not a versioned capability guarantee, and UI-specific steps vary by theme. The reviewed sources do not establish that UV lacks annotation capability.

### Version, image and annotation exchange

Read each collection’s declared Presentation API version. Presentation API 3 changed the v2 pattern: v2 otherContent/AnnotationList transcription/commentary links are represented in v3 through Annotation Pages linked by Canvas annotations; v3 uses its own context and changed language/value representation. Any adapter should preserve original source identity/version and return loss or unsupported-feature warnings. Do not change a v2 document’s context to v3 or treat a conversion as a source update. See [S02](sources/S02-presentation-v3-changelog.md).

Images are external resources. Image API 3 can provide dimensions and service capabilities; static/limited services may only support listed sizes, and browser use can be affected by rights, authentication, CORS and availability. The 100-page intake should record the image URL or service identifier, dimensions, profile/features, access outcome and rights cues. Do not infer that an image ID will always resolve or that a service permits arbitrary region/size downloads. If an image is offline or inaccessible, keep the text/annotation record and show that its visual target could not be checked; do not copy the source image as a workaround. See [S01](sources/S01-presentation-api-v3.md) and [S05](sources/S05-image-api-v3.md).

Separate three exchanges:
1. **Manifest import/export:** viewer handoff of the provider Manifest URL. This is how a reader opens the same source in another client; it is not an annotation backup.
2. **Annotation import/export:** proposed JSON-LD/IIIF bundle of selected Annotation records and their Annotation Page grouping, with page ID, exact source Manifest/Canvas target, dimensions/version, language, motivation and selector. Import resolves curator-approved IDs, checks the current source/version and bounds, retains source target IDs, and reports unresolved targets instead of guessing.
3. **Viewer Content State:** IIIF Content State 1.0 can share a Manifest/Canvas/region to initialize a compatible viewer. It describes a view, not annotation content. A valid deep link should not be sold as annotation portability. See [S06](sources/S06-content-state-v1.md), [S14](sources/S14-iiif-viewer-guide.md). S14 is a community guide and its per-viewer UI steps are examples, not universal instructions; its older Content State status is superseded by S06.

For the optional transcript bundle, export selected UTF-8 transcription text or TSV with a JSON-LD sidecar, language, page and source links, and a machine-readable selector where applicable. Let a researcher explicitly choose records for export; do not turn an export into public publication or include master images. Verify Unicode, line/page grouping, access rules and round-trip import before calling the option supported in the product.

### Owner decisions and constraints

- **Collections curator:** owns stable page identifiers and must decide the actual scheme and source-version mapping. The proposal does not choose IDs on the curator’s behalf.
- **Reading-room lead:** decides whether annotations are private by default. Viewer defaults do not decide this. Before the decision, keep privacy as an explicit configuration/owner input; do not assume local storage means private across devices or that public static annotation pages are authorized.
- The provider collections retain their masters and catalogues. Do not copy whole collections, edit masters/catalogues, promise all-viewer feature parity, or require public publication of notes. Selected annotation/transcription exports are distinct from collection copying and remain user-controlled.

## Critique reconciliation

The independent critique raised two limited wording/locator issues. Both were checked against the exact public sources before finalization. The final keeps S01–S14 unchanged as source identities. C01 narrows the attribution for the UV comparison to the community guide and explicitly avoids inferring lack of capability. C02 preserves the issue’s reported dependency conflict and adds the thread’s unverified master-branch qualification; direct review shows the comment is dated June 21, 2023, correcting the critic package’s April date. No released fix is claimed. Full dispositions are in [critique-dispositions.json](critique-dispositions.json).

## Exact per-clause disposition

| Released plan clause | Disposition and complete treatment |
| --- | --- |
| 1. Page identity, region coordinates, portability across viewers and image-size changes | Correct the draft assumption to use curator-owned stable page IDs mapped to Manifest/Canvas IDs and source versions. Use Canvas coordinates and a Canvas target/rectangular selector; preserve version/image provenance and test scaled replacement images. Crops, rotations, changed page geometry and missing IDs are unresolved mapping/review conditions, not automatically portable. |
| 2. Compare two viewers and analogous mechanism; distinguish native capability from integration | Compare Mirador 4.2.6 and Universal Viewer 4.4.4 as separate viewers. Mirador authoring depends on an exact plugin/integration and persistence server; UV is a reader until editor/save/export behavior is demonstrated. IIIF Annotation Pages + W3C Web Annotation are the analogous mechanism, not a viewer. MAE and a separate annotation service are candidate integrations; none is selected or assumed native. |
| 3. Manifest/version compatibility, external-image availability and exchange; do not modify source masters | Correct “support one format first” into a version-aware intake and adapter proposal retaining the original source version/IDs and reporting unsupported conversions. Explicitly cover v2-to-v3 Annotation Page/context changes, external image dimensions/service profile/availability/CORS/auth/rights, and three distinct exchanges: Manifest URL, annotation bundle, viewer Content State. Keep all source manifests, catalogues and images read-only. |
| 4. Released compatibility change or issue/fix chain and affected operations | Replace the cosmetic-migration assumption with the Mirador 4 breaking release plus the old plugin’s explicit M3-only boundary and issue #75 installation conflict. Explain effects on dependency resolution and authoring availability, then on save/reopen/export/import only if a compatible store/plugin is installed. MAE is an alternative, but its stated runtime target is dated relative to current M4 and must be verified. No current defect/fix is invented. |
| 5. Optional transcription-only bundle | Retain as optional, authorized scope; it is not mandatory and not established technically. Propose UTF-8/TSV plus JSON-LD links and no images. Conditions are Unicode/page association, language/selector preservation, licensing/privacy/access, and successful round trip. No evidence-based exclusion currently applies. |
| 6. Stable ID and privacy owners | Preserve both explicit owner roles and their exact authority. Curator chooses stable page ID scheme; reading-room lead chooses private-by-default. Neither decision was obtained or inferred. Record these as unresolved owner inputs. |
| 7. Negative constraints | Binding exclusions remain: no full collection copy, no source-master changes, no promise that every viewer has every annotation feature, and no mandatory public note publication. The recommended separate selected export does not override these. |
| 8. Complete evidence-backed proposal and validation distinctions | This draft gives source-linked recommendations, version applicability, opportunities, alternatives, owner inputs, uncertainties and a validation table. Research retrieval is not product validation. Proposed checks stay NOT_RUN; no product install, live write or implementation is claimed. |

## Already covered, rejected, optional and uncertain

**Already covered by the original brief:** pilot setting and 100-page scale; user note/full-page or region plus transcription and export; provider ownership of masters/catalogues; the exact optional transcription-only scope; the two owner authorities; all four negative constraints. These are requirements, not findings that a product already satisfies them.

**Rejected plan assumptions:** pixel rectangles tied to a current image URL as durable identity; deferring resizing/identifier changes; migration as cosmetic; choosing UV only as an alternative name without evaluating it; assuming one input manifest format without preservation/loss reporting. The evidence shows why these assumptions need correction.

**Retained option:** transcription-only package, optional and user requested, conditional on rights/access, language and round-trip preservation. It is not promoted to mandatory capability.

**Uncertain:** curator’s stable-ID scheme and source-version mapping; lead’s privacy default; actual provider format versions and endpoint behavior; which selected pages are externally accessible and with what rights/authentication; whether a tested MAE release works with the chosen Mirador release; which annotation features UV renders or can exchange; whether other target formats/viewers are needed. Public documentation answers some general requirements but not these local facts.

## Validation status and prioritized proposals

### Executed in this investigation

| Activity | Status | Result |
| --- | --- | --- |
| Public standards, pinned project documentation, release pages and issue history reviewed | EXECUTED as read-only research | Sources S01–S14 indexed with URLs, version/commit, locator, access UTC, operation, conditions and applicability. |
| Product install, live viewer use, collection manifest/image access, annotation create/save/export/import, offline bundle round trip, or source mutation | NOT_RUN | No product behavior is claimed as tested. |
| Local implementation or executable witness | NOT_RUN | No implementation or downloaded code was run. |

### Proposed checks

| Priority | Proposed check | Success evidence to collect | Status |
| --- | --- | --- | --- |
| 1 | Owner decisions: curator signs off stable IDs/source-version mapping; lead records privacy default and authorized export audiences | Explicit decision record and access/export implications | NOT_RUN |
| 2 | Intake all 100 selected pages across collections | Per-page Manifest/Canvas IDs, format version, labels/order, Canvas and image dimensions, image service/profile, rights/access/CORS result; no collection-wide copy | NOT_RUN |
| 3 | Validate identity and coordinate behavior | Whole-Canvas and rectangular selectors on different dimensions; same-page resolution replacement; changed crop/rotation/aspect ratio and missing/renumbered Canvas cases are flagged or mapped with curator approval | NOT_RUN |
| 4 | Compatibility smoke on exact lockfile | Install pinned Mirador/MAE and persistence service; author page and region note plus transcription; save, close/reopen, export selected data, import and compare; record runtime/browser/dependency versions | NOT_RUN |
| 5 | Cross-viewer read test | Feed same Manifest and plain text/rectangular annotation sample to Mirador and UV; record which fields, motivations, selectors, offline/error states and download controls each actually handles | NOT_RUN |
| 6 | Optional text-only package round trip | Export selected UTF-8/TSV and JSON-LD sidecar without images; inspect Unicode, language, IDs, source links, selectors and re-import/warning behavior; confirm access policy | NOT_RUN |
| 7 | Non-mutation and recovery checks | Compare provider source and annotation store before/after; interruption/retry, correction, missing external image and backup/restore flows; verify no source write occurred | NOT_RUN |

No research source or proposed validation is described as a successful product test.
