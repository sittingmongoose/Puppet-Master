# Independent governing evidence — A2-02 control v1

Fresh read-only public primary retrievals. These support source meanings; they do not prove original candidate tool execution or product validation. Raw response hashes and HTTP metadata are in retrievals.json and source-map.json. Text files are navigable extracts from independently saved HTML, not original candidate evidence.

<a id="r01"></a>
## R01 — S1

- Primary URL: [https://iiif.io/api/presentation/3.0/](https://iiif.io/api/presentation/3.0/)
- Retrieved UTC: 2026-10-10T05:44:43.942894+00:00; HTTP 200
- Raw response: [S1.html](S1.html)
- SHA-256: `3e4cad9a0ff652e0905c4bd15a27c8d68e208dd34c1d55102870419e5ca5f77e`
- Locator: §5.3 Canvas; §5.6 Annotation; §6.1 URI Recommendations; status header
- Navigable text: [S1.txt](S1.txt)
- Version/commit: 3.0.0
- Checked operation: Canvas identity and spatial frame; placement of painting versus non-painting annotations; persistent URI guidance.
- Governing condition/default/unit/type/exception: Canvas IDs are HTTP(S) URIs without fragments. Canvas dimensions describe a coordinate frame rather than delivered pixel resolution. Non-painting notes belong under annotations; Canvas items contain painting annotations. URI persistence is recommended, not a guarantee of unchanged image bytes or a version history.
- Independent applicability: Supports stable Canvas targets, separate scholar notes, and explicit revision uncertainty. Curator and privacy ownership come from the brief, not IIIF.

<a id="r02"></a>
## R02 — S2

- Primary URL: [https://iiif.io/api/presentation/2.1/](https://iiif.io/api/presentation/2.1/)
- Retrieved UTC: 2026-10-10T05:44:43.945096+00:00; HTTP 200
- Raw response: [S2.html](S2.html)
- SHA-256: `67f7247d11409bd6736edbd0f474f553ea715f0e60a7f06b25a5eebf30221f1c`
- Locator: §5.2 Sequence; §5.3 Canvas; §5.7 Annotation List; §5.8 Layer
- Navigable text: [S2.txt](S2.txt)
- Version/commit: 2.1.1
- Checked operation: Read-only interpretation of v2 page ordering, Canvas geometry, external annotation lists and resource/on annotations.
- Governing condition/default/unit/type/exception: v2 uses @id/@type, sequences/canvases, images and otherContent. Canvas height/width are integers and clients scale images into Canvas space; matching image and Canvas dimensions is not universal. Annotation lists and non-image content are distinct from collection master image data.
- Independent applicability: Supports the conditional v2 input branch and a separate, explicitly selected output contract. It does not supply a ready-made converter.

<a id="r03"></a>
## R03 — S3

- Primary URL: [https://iiif.io/api/presentation/3.0/change-log/](https://iiif.io/api/presentation/3.0/change-log/)
- Retrieved UTC: 2026-10-10T05:44:43.946354+00:00; HTTP 200
- Raw response: [S3.html](S3.html)
- SHA-256: `a1c25c702c13ef5cea91be23888aa77279c389c1b08530f0ab4658b4faf66e35`
- Locator: §1.1.2; §1.2.1; §1.2.13; §1.3.6; §1.4.1; §1.4.3
- Navigable text: [S3.txt](S3.txt)
- Version/commit: Presentation 3.0 change log
- Checked operation: Released major-version migration of annotation model, identifiers, lists, layers and ordering structures.
- Governing condition/default/unit/type/exception: W3C Web Annotation replaces Open Annotation. @id/@type become id/type. otherContent gives way to annotations, AnnotationList/Layer to AnnotationPage/AnnotationCollection, and Sequence is removed. Some practical effects are characterized as limited but real; the complete migration is backwards incompatible.
- Independent applicability: Supports rejecting the original cosmetic-migration assumption and testing bodies, targets, lists/layers and page ordering. No adapter execution is established.

<a id="r04"></a>
## R04 — S4

- Primary URL: [https://www.w3.org/TR/annotation-model/](https://www.w3.org/TR/annotation-model/)
- Retrieved UTC: 2026-10-10T05:44:43.948067+00:00; HTTP 200
- Raw response: [S4.html](S4.html)
- SHA-256: `a7513e022f56c0a6f4e99ac11aec03f3451d1ff1ce14054780b3ccfb38fa7980`
- Locator: §3.3 Embedded Textual Body; §4 Specific Resources; §4.2.1 Fragment Selector
- Navigable text: [S4.txt](S4.txt)
- Version/commit: W3C Recommendation 2017-02-23, Data Model 1.0
- Checked operation: Embedded transcription/comment text and an explicit target selector representation.
- Governing condition/default/unit/type/exception: TextualBody has exactly one value; language and format can describe it. SpecificResource has exactly one source. FragmentSelector has exactly one type=FragmentSelector and value; conformsTo is recommended and must not occur more than once. Standards syntax is not proof of any viewer profile.
- Independent applicability: Supports structured text and region export, while preserving the final requirement to test consuming clients.

<a id="r05"></a>
## R05 — S5

- Primary URL: [https://www.w3.org/TR/media-frags/](https://www.w3.org/TR/media-frags/)
- Retrieved UTC: 2026-10-10T05:44:43.954416+00:00; HTTP 200
- Raw response: [S5.html](S5.html)
- SHA-256: `ecbaffe292d75c6d70f31b406475dd6e678440f92be34aa468fda67fb4217d9e`
- Locator: §4.2.2 Spatial Dimension; §6.1.2; §6.2.3; §6.3.3
- Navigable text: [S5.txt](S5.txt)
- Version/commit: W3C Recommendation 2012-09-25, Media Fragments 1.0 basic
- Checked operation: Rectangular xywh fragment addressing of visual media.
- Governing condition/default/unit/type/exception: pixel is the default. The basic grammar requires four comma-separated integers, including for percent. x/width percentages use source width and y/height use source height. Bounds and invalid-region handling matter; pixel fragments on multi-resolution images must be ignored. This is a fragment selector operation, distinct from Image API pct requests.
- Independent applicability: Supports the proposal’s bounded percent/pixel syntax discussion. It does not justify arbitrary decimal fragment values or automatic crop/content remapping; the final makes neither promise.

<a id="r06"></a>
## R06 — S6

- Primary URL: [https://iiif.io/api/image/3.0/](https://iiif.io/api/image/3.0/)
- Retrieved UTC: 2026-10-10T05:44:43.956180+00:00; HTTP 200
- Raw response: [S6.html](S6.html)
- SHA-256: `efcbafb8055c5bfb2880def63f1368b7db47db868f6444ac517764ceeb2180c3`
- Locator: §4 Image Requests; §4.1 Region; §5 Image Information; §7.1 CORS; §7.3 Error Conditions; §8 Authentication
- Navigable text: [S6.txt](S6.txt)
- Version/commit: IIIF Image API 3.0.0
- Checked operation: Remote service requests, advertised capabilities, browser access and failures.
- Governing condition/default/unit/type/exception: Image requests extract a region, scale, mirror/rotate and transform quality/format in order. Pixel parameters are integers; percentage/rotation parameters can be floating point. pct uses dimensions reported by info.json. CORS is recommended. 404 can also mean unsupported parameters or size limits, not only absent image content. 401, 403 and 503 differ. Authentication is outside the API within a IIIF-aware workflow.
- Independent applicability: Supports availability/access preflight and avoiding master copies as a workaround. Source correctness does not establish the pilot’s actual CORS, auth or service behavior.

<a id="r07"></a>
## R07 — S7

- Primary URL: [https://iiif.io/api/cookbook/recipe/0004-canvas-size/](https://iiif.io/api/cookbook/recipe/0004-canvas-size/)
- Retrieved UTC: 2026-10-10T05:44:44.064564+00:00; HTTP 200
- Raw response: [S7.html](S7.html)
- SHA-256: `1ae2467ff53bca8ca51b64612abbceab089523e5b1cbbed1bb34ae76b8d3b504`
- Locator: Use Case; Implementation notes; Restrictions
- Navigable text: [S7.txt](S7.txt)
- Version/commit: Presentation 3 cookbook, retrieved 2026-10-10
- Checked operation: Stable Canvas coordinates across a same-content higher-resolution image replacement.
- Governing condition/default/unit/type/exception: Canvas dimensions are unitless and need not equal image pixels. The recipe fills a Canvas with a differently sized image; aspect ratios should remain consistent to avoid distortion. It does not handle changed crops, orientation, page content or identity.
- Independent applicability: Directly supports the geometry recommendation and its final restrictions.

<a id="r08"></a>
## R08 — S8

- Primary URL: [https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/](https://iiif.io/api/cookbook/recipe/0266-full-canvas-annotation/)
- Retrieved UTC: 2026-10-10T05:44:44.215526+00:00; HTTP 200
- Raw response: [S8.html](S8.html)
- SHA-256: `d23fe75aa4b8c9089509316f201d30521a719ee2c0ece8deb06d2d00fce7c2b7`
- Locator: Implementation Notes; Restrictions; Example
- Navigable text: [S8.txt](S8.txt)
- Version/commit: Presentation 3 cookbook, retrieved 2026-10-10
- Checked operation: Full-Canvas text notes with or without a selector, and their discoverability.
- Governing condition/default/unit/type/exception: Non-painting annotations are in Canvas annotations/AnnotationPage. A Canvas-only target is valid; clients may show no marker. A full-area selector may be better supported. Viewers may display only some motivations.
- Independent applicability: A useful unfamiliar operational detail preserved in the final: test whole-page cue and region display separately.

<a id="r09"></a>
## R09 — S9

- Primary URL: [https://iiif.io/api/cookbook/recipe/0231-transcript-meta-recipe/](https://iiif.io/api/cookbook/recipe/0231-transcript-meta-recipe/)
- Retrieved UTC: 2026-10-10T05:44:44.257833+00:00; HTTP 200
- Raw response: [S9.html](S9.html)
- SHA-256: `fc61502ef1f4b8267a64f0b069f01b79c2c1e8828a190ce6b2ecc8d46198a593`
- Locator: Transcripts, options 1–3
- Navigable text: [S9.txt](S9.txt)
- Version/commit: Presentation 3 cookbook, retrieved 2026-10-10
- Checked operation: Independent transcript access/download versus alongside-resource and synchronized transcript presentation.
- Governing condition/default/unit/type/exception: A rendering link can point to an alternative representation for download or viewing outside the client. Supplementing annotations and spatial/temporal fragments provide different experiences. No viewer-created bundle or implemented download UI follows merely from the pointer.
- Independent applicability: Supports retaining the optional text-only route as an implementable local proposal, subject to access/rights and provenance.

<a id="r10"></a>
## R10 — S10

- Primary URL: [https://iiif.io/api/cookbook/recipe/matrix/](https://iiif.io/api/cookbook/recipe/matrix/)
- Retrieved UTC: 2026-10-10T05:44:44.283663+00:00; HTTP 200
- Raw response: [S10.html](S10.html)
- SHA-256: `92f0add99331eb8ec25431b0cb9ac09ab8cf641d7ccc3a7fc9137fa8fd01688a`
- Locator: Annotation Recipes table, header and Simple Annotation — Tagging row
- Navigable text: [S10.txt](S10.txt)
- Version/commit: Current unversioned viewer matrix, retrieved 2026-10-10
- Checked operation: Recipe-specific display support comparison.
- Governing condition/default/unit/type/exception: Header order is Recipe, Mirador, UV. The row’s img alt/title values are Yes and No respectively. The matrix is not tied by this row to the final’s selected release builds and is not a comprehensive authoring/export test.
- Independent applicability: The final correctly treats this as a bounded hypothesis for the pinned comparison, not a universal product guarantee.

<a id="r11"></a>
## R11 — S11

- Primary URL: [https://iiif.io/get-started/iiif-viewers/](https://iiif.io/get-started/iiif-viewers/)
- Retrieved UTC: 2026-10-10T05:44:44.284407+00:00; HTTP 200
- Raw response: [S11.html](S11.html)
- SHA-256: `57f3a7558c44989ab7f1d8d71f48752a2ad3fabb4b01920efddf22c3e29e7967`
- Locator: Image viewers: Universal Viewer and Mirador
- Navigable text: [S11.txt](S11.txt)
- Version/commit: Current IIIF project viewer overview
- Checked operation: High-level viewing capabilities and candidate fit.
- Governing condition/default/unit/type/exception: Mirador is described as a multi-up viewer with zoom/pan/rotate and image/annotation comparison. UV is rich and embeddable for IIIF images/audio/video and non-IIIF 3D/PDF. The overview gives no complete pilot authoring/storage/import-export contract.
- Independent applicability: Supports the conditional first Mirador comparison candidate and UV alternative as local pilot choices.

<a id="r12"></a>
## R12 — S12

- Primary URL: [https://github.com/ProjectMirador/mirador/discussions/4200](https://github.com/ProjectMirador/mirador/discussions/4200)
- Retrieved UTC: 2026-10-10T05:44:44.451525+00:00; HTTP 200
- Raw response: [S12.html](S12.html)
- SHA-256: `339976069b69ab6b674f1a5d54e52d20129f04d9ad29bbc169b08c785372ca6a`
- Locator: For Mirador Developers; plugin references
- Navigable text: [S12.txt](S12.txt)
- Version/commit: Mirador 4.0 announcement, 2025-10-30
- Checked operation: Breaking framework/plugin migration and community extension opportunities.
- Governing condition/default/unit/type/exception: React 19 and MUI 7 changes require custom plugin/integration/theme updates. Community annotation plugins are separate integrations. A reference does not prove compatibility with the exact pilot release or deployment.
- Independent applicability: Supports version pinning and the separation of core display from selected authoring extensions; the named MAE lead is an opportunity explored only shallowly by the candidate.

<a id="r13"></a>
## R13 — S13

- Primary URL: [https://github.com/ProjectMirador/mirador-annotations](https://github.com/ProjectMirador/mirador-annotations)
- Retrieved UTC: 2026-10-10T05:44:44.495582+00:00; HTTP 200
- Raw response: [S13.html](S13.html)
- SHA-256: `313bd5110ab2d1e989e3b1a114bd606b3f258a98f17719f5ecc0fae24650eddb`
- Locator: About; Persisting Annotations; Installing
- Navigable text: [S13.txt](S13.txt)
- Version/commit: ProjectMirador/mirador-annotations moving repository README
- Checked operation: Mirador 3 plugin authoring and persistence boundary.
- Governing condition/default/unit/type/exception: The README explicitly says this codebase does not work with Mirador 4. It describes rectangle, oval, polygon and text-descriptor tools, a local-storage demo, and annotation-server persistence. It also names MAE as a Mirador 4 community alternative. These statements are about this plugin, not all annotation storage technologies.
- Independent applicability: Supports the final’s compatibility warning and separate integration requirement without implying no Mirador 4 authoring option exists.

<a id="r14"></a>
## R14 — S14

- Primary URL: [https://github.com/ProjectMirador/mirador/issues/4198](https://github.com/ProjectMirador/mirador/issues/4198)
- Retrieved UTC: 2026-10-10T05:44:44.532259+00:00; HTTP 200
- Raw response: [S14.html](S14.html)
- SHA-256: `170e6001fc7b5e3410a9d001662440c5d0f5fbc6f88cbe654d18f66bfbb2afdd`
- Locator: Issue description, screenshots and recipe context
- Navigable text: [S14.txt](S14.txt)
- Version/commit: Mirador issue #4198, opened 2025-10-29
- Checked operation: Reported missing annotation/layer notification dots in Mirador 4.
- Governing condition/default/unit/type/exception: The report concerns sidebar annotation/layer icons when a Canvas has annotations/layers, with M3, M4 demo and an institutional M4 comparison using Cookbook recipe 33. A reported failure and closed issue alone do not prove fix release or pilot success.
- Independent applicability: Supports a bounded note-discovery regression example, not a general region-rendering failure.

<a id="r15"></a>
## R15 — S15

- Primary URL: [https://github.com/ProjectMirador/mirador/pull/4201](https://github.com/ProjectMirador/mirador/pull/4201)
- Retrieved UTC: 2026-10-10T05:44:44.688627+00:00; HTTP 200
- Raw response: [S15.html](S15.html)
- SHA-256: `55e59929469aee42ce8aa1866948125878c99e621a5315374df42bb8f8c84b27`
- Locator: PR metadata; E23 merged_at/merge_commit_sha/head.sha; E24 patch; E28 parents
- Navigable text: [S15.txt](S15.txt)
- Version/commit: PR #4201, merged 2025-12-04; head 056262ac0e990fa61bdc001e401c0201692700aa; merge 25c0b0ea119f48c0bde2276d516e3c2bbd795092
- Checked operation: Source repair of the notification palette token for annotation/layer/search badges.
- Governing condition/default/unit/type/exception: PR head and merge commit differ. The patch adds notification.contrastText; a merged source change does not itself prove release inclusion or configured UI behavior.
- Independent applicability: Confirms the reviser’s correction of the draft’s commit labeling; released inclusion is verified separately.

<a id="r16"></a>
## R16 — S16

- Primary URL: [https://github.com/ProjectMirador/mirador/releases/tag/v4.2.4](https://github.com/ProjectMirador/mirador/releases/tag/v4.2.4)
- Retrieved UTC: 2026-10-10T05:44:44.771167+00:00; HTTP 200
- Raw response: [S16.html](S16.html)
- SHA-256: `ed225f1b7f38ff420d400fbb34510309b47bc83353730f25211fb36354d41b6d`
- Locator: Release tag metadata; E25 body; S22 comparison
- Navigable text: [S16.txt](S16.txt)
- Version/commit: Mirador v4.2.4; 73fafe9c8f6ef74dff0c26373ef3eeefdcabcdf5; published 2026-09-02
- Checked operation: Identity/date of the proposed fixed viewer comparison release.
- Governing condition/default/unit/type/exception: The release notes do not name #4201; their full changelog covers v4.2.3 to v4.2.4. The old inherited locator saying the changed list includes #4201 is inaccurate. The final establishes source ancestry separately rather than using those release notes.
- Independent applicability: Final release-inclusion meaning is supported, while the stale inherited locator remains limitation L1.

<a id="r17"></a>
## R17 — S17

- Primary URL: [https://github.com/UniversalViewer/universalviewer/releases](https://github.com/UniversalViewer/universalviewer/releases)
- Retrieved UTC: 2026-10-10T05:44:44.812386+00:00; HTTP 200
- Raw response: [S17.html](S17.html)
- SHA-256: `0e5d7fe3b5107850cdee298507629d05e476f392d47089bb522651c53d179c0c`
- Locator: v4.4.4 metadata; v4.4.3 and v4.4.1 notices
- Navigable text: [S17.txt](S17.txt)
- Version/commit: UV v4.4.4, 2b92ff6; observed release list 2026-10-10
- Checked operation: A fixed comparison release and unusable-release history.
- Governing condition/default/unit/type/exception: The current page shows v4.4.4 and marks v4.4.3/v4.4.1 DO NOT USE because of merge errors. These are mutable release-list observations, not a timeless claim or demonstration of annotation capability.
- Independent applicability: Supports avoiding those named tags and rechecking before implementation.

<a id="r18"></a>
## R18 — S18

- Primary URL: [https://github.com/annotorious/annotorious/releases](https://github.com/annotorious/annotorious/releases)
- Retrieved UTC: 2026-10-10T05:44:44.917784+00:00; HTTP 200
- Raw response: [S18.html](S18.html)
- SHA-256: `b2068697e4577614642c37e867fdd7a17ce78e6c82ddd0cdcf3ee77720fb1939`
- Locator: Release metadata; E31/E32 package name/version/dependencies
- Navigable text: [S18.txt](S18.txt)
- Version/commit: Annotorious v3.4.0, 0dd99c4; published 2025-05-27
- Checked operation: Released analogous annotation library version and package applicability.
- Governing condition/default/unit/type/exception: The release includes polygon-tool changes. At v3.4.0 both @annotorious/annotorious and @annotorious/openseadragon packages identify version 3.4.0; the latter declares OpenSeadragon ^3 || ^4 || ^5 peer compatibility. The moving guide is not a product-operation witness.
- Independent applicability: The proposed version is a real applicable library release, not a mislabeled core-only version.

<a id="r19"></a>
## R19 — S19

- Primary URL: [https://annotorious.dev/guides/openseadragon-iiif/](https://annotorious.dev/guides/openseadragon-iiif/)
- Retrieved UTC: 2026-10-10T05:44:45.016923+00:00; HTTP 200
- Raw response: [S19.html](S19.html)
- SHA-256: `907aead9a3a8224095e7abc9722220e77add1abbc29c9d5c278203a90d983104`
- Locator: Quick Start; Step-by-Step Guide; IIIF Example
- Navigable text: [S19.txt](S19.txt)
- Version/commit: Current official Annotorious OpenSeadragon/IIIF guide
- Checked operation: Client-side image annotation, JSON loading, events and IIIF image sources.
- Governing condition/default/unit/type/exception: Coordinates are relative to the base resolution of the image. The guide shows createOSDAnnotator, annotation lifecycle events and loadAnnotations; it does not supply curator-stable Canvas identity, persistence or a reading-room access model.
- Independent applicability: Supports a meaningful custom-panel alternative with explicit coordinate and storage integration work.

<a id="r20"></a>
## R20 — S20

- Primary URL: [https://annotorious.dev/guides/data-model/](https://annotorious.dev/guides/data-model/)
- Retrieved UTC: 2026-10-10T05:44:45.213749+00:00; HTTP 200
- Raw response: [S20.html](S20.html)
- SHA-256: `830a2fab8cc71a0e01b0426aff4e2ec96f668d8ae4dbf3913d034ef8c7508b6d`
- Locator: Annotation Bodies; Key Differences; The W3C Adapter
- Navigable text: [S20.txt](S20.txt)
- Version/commit: Current official Annotorious data-model guide
- Checked operation: Simplified native annotation geometry and W3CImageFormat crosswalk.
- Governing condition/default/unit/type/exception: The project disclaims full W3C-model support. Bodies are application payload and are not processed/displayed directly by Annotorious. W3CImageFormat takes a string source argument; representative body/selector conversion remains necessary.
- Independent applicability: Supports the final’s adapter and custom integration caveats. The library is not falsely presented as a full scholar-note application.

<a id="r21"></a>
## R21 — S21

- Primary URL: [https://iiif.io/api/cookbook/recipe/0561-text-on-image/](https://iiif.io/api/cookbook/recipe/0561-text-on-image/)
- Retrieved UTC: 2026-10-10T05:44:45.334339+00:00; HTTP 200
- Raw response: [S21.html](S21.html)
- SHA-256: `a873ca90943773d151cd650e4b06c4441539713f4990f1e9c65989187a254467`
- Locator: Implementation Notes; Restrictions; Example
- Navigable text: [S21.txt](S21.txt)
- Version/commit: Presentation 3 cookbook, retrieved 2026-10-10
- Checked operation: Visible text painting without deriving a new master image.
- Governing condition/default/unit/type/exception: Visible painted text is ordered in Canvas items with motivation painting; other annotations are handled differently. Styling varies across clients and HTML markup is restricted. This does not make a private scholar note public or create a download bundle.
- Independent applicability: Supports separating painted display, supplementing transcription and optional standalone text reuse.

<a id="r22"></a>
## R22 — S22

- Primary URL: [https://api.github.com/repos/ProjectMirador/mirador/compare/25c0b0e...73fafe9](https://api.github.com/repos/ProjectMirador/mirador/compare/25c0b0e...73fafe9)
- Retrieved UTC: 2026-10-10T05:44:45.427123+00:00; HTTP 200
- Raw response: [S22.json](S22.json)
- SHA-256: `fd36ac608dceece586fda5ffa4e7133cf04be466a070264f445d0221c815afb5`
- Locator: JSON status, ahead_by, behind_by, base_commit.sha, merge_base_commit.sha and commits
- Navigable text: [S22.txt](S22.txt)
- Version/commit: Base 25c0b0ea119f48c0bde2276d516e3c2bbd795092; head 73fafe9c8f6ef74dff0c26373ef3eeefdcabcdf5
- Checked operation: Independent read-only comparison of merge and release source history.
- Governing condition/default/unit/type/exception: The response is ahead, ahead_by=354, behind_by=0 and merge_base_commit.sha equals the base merge. This is ancestry evidence, not runtime validation. E29 independently shows the changed notification token persists in the release source.
- Independent applicability: Resolves the C3 documentary gap and preserves the distinction from unrun UI checks.

<a id="r23"></a>
## R23 — PR #4201 metadata

- Primary URL: [https://api.github.com/repos/ProjectMirador/mirador/pulls/4201](https://api.github.com/repos/ProjectMirador/mirador/pulls/4201)
- Retrieved UTC: 2026-10-10T05:46:21.262227+00:00; HTTP 200
- Raw response: [E23.json](E23.json)
- SHA-256: `fd28b29c92c7c05244cf2ece89d24421dec20002bf10bc6cd2c5d85ebdc26f62`
- Locator: number/title/merged/merged_at/merge_commit_sha/head.sha
- Independent observation and limits: Confirms the PR head and merge commit identities and actual recorded merge date.

<a id="r24"></a>
## R24 — PR #4201 changed source

- Primary URL: [https://api.github.com/repos/ProjectMirador/mirador/pulls/4201/files](https://api.github.com/repos/ProjectMirador/mirador/pulls/4201/files)
- Retrieved UTC: 2026-10-10T05:46:21.264358+00:00; HTTP 200
- Raw response: [E24.json](E24.json)
- SHA-256: `2a682689cc15b91cd4e58ea19a92f05aeeeb7d632edfded7771af8f6e15596cb`
- Locator: [0].filename and patch in src/config/settings.js
- Independent observation and limits: The repair adds notification.contrastText; it is a source-level badge-color change, not an authoring/storage implementation.

<a id="r25"></a>
## R25 — Mirador v4.2.4 release API

- Primary URL: [https://api.github.com/repos/ProjectMirador/mirador/releases/tags/v4.2.4](https://api.github.com/repos/ProjectMirador/mirador/releases/tags/v4.2.4)
- Retrieved UTC: 2026-10-10T05:46:21.265311+00:00; HTTP 200
- Raw response: [E25.json](E25.json)
- SHA-256: `714406bc9a89fd42f97a401caf1085e70290a55beeac3ffed893fd380db85b42`
- Locator: tag_name/created_at/published_at/body
- Independent observation and limits: Confirms the release date and the absence of #4201 from its release-note body; does not independently identify the tag SHA.

<a id="r26"></a>
## R26 — UV v4.4.4 release API

- Primary URL: [https://api.github.com/repos/UniversalViewer/universalviewer/releases/tags/v4.4.4](https://api.github.com/repos/UniversalViewer/universalviewer/releases/tags/v4.4.4)
- Retrieved UTC: 2026-10-10T05:46:21.266104+00:00; HTTP 200
- Raw response: [E26.json](E26.json)
- SHA-256: `a9c181e9d423e41c44154608bac083207973833bb659f8ec964f5869ea05b4e5`
- Locator: tag_name/name/created_at/published_at/body
- Independent observation and limits: Confirms a real named fixed release. Commit identity is separately visible on S17.

<a id="r27"></a>
## R27 — Annotorious v3.4.0 release API

- Primary URL: [https://api.github.com/repos/annotorious/annotorious/releases/tags/v3.4.0](https://api.github.com/repos/annotorious/annotorious/releases/tags/v3.4.0)
- Retrieved UTC: 2026-10-10T05:46:21.267299+00:00; HTTP 200
- Raw response: [E27.json](E27.json)
- SHA-256: `e3644a0dfdf8a2a38d4872e9b223108686ab00a721834093e10337e698b96999`
- Locator: tag_name/name/published_at/body
- Independent observation and limits: Confirms the analogous library release and its bounded polygon-tool history.

<a id="r28"></a>
## R28 — Mirador merge commit

- Primary URL: [https://api.github.com/repos/ProjectMirador/mirador/commits/25c0b0e](https://api.github.com/repos/ProjectMirador/mirador/commits/25c0b0e)
- Retrieved UTC: 2026-10-10T05:46:21.441685+00:00; HTTP 200
- Raw response: [E28.json](E28.json)
- SHA-256: `82d08bc0ff5fb01245d20362e806e64b38c4ed6d7ac88d4c3f14fcfc7b274288`
- Locator: sha/commit.message/commit.committer.date/parents/files.patch
- Independent observation and limits: Confirms 25c0b0e is a merge of PR head 056262a, with the palette-token patch.

<a id="r29"></a>
## R29 — Mirador released settings source

- Primary URL: [https://raw.githubusercontent.com/ProjectMirador/mirador/73fafe9c8f6ef74dff0c26373ef3eeefdcabcdf5/src/config/settings.js](https://raw.githubusercontent.com/ProjectMirador/mirador/73fafe9c8f6ef74dff0c26373ef3eeefdcabcdf5/src/config/settings.js)
- Retrieved UTC: 2026-10-10T05:47:16.938130+00:00; HTTP 200
- Raw response: [E29-settings.js](E29-settings.js)
- SHA-256: `9c25e7dd75ec4162716c9faa8d7a1ccffaec3820c861924461baf3462a0fe917`
- Locator: src/config/settings.js lines 57–61 at 73fafe9c8f6ef74dff0c26373ef3eeefdcabcdf5
- Independent observation and limits: The released source retains notification.main and notification.contrastText. This is a static source observation only.

<a id="r30"></a>
## R30 — Annotorious v3.4.0 source tree

- Primary URL: [https://api.github.com/repos/annotorious/annotorious/git/trees/v3.4.0?recursive=1](https://api.github.com/repos/annotorious/annotorious/git/trees/v3.4.0?recursive=1)
- Retrieved UTC: 2026-10-10T05:47:47.257219+00:00; HTTP 200
- Raw response: [E30.json](E30.json)
- SHA-256: `cc56660a94a59a408554c0b174bc0fe812e74c69c705d7b05b316810dfd956f8`
- Locator: truncated=false; packages/annotorious-openseadragon/package.json and packages/annotorious/package.json
- Independent observation and limits: Locates package metadata in the exact release tree. Only relevant tree paths were inspected, not all source bodies.

<a id="r31"></a>
## R31 — Released OpenSeadragon integration package

- Primary URL: [https://raw.githubusercontent.com/annotorious/annotorious/v3.4.0/packages/annotorious-openseadragon/package.json](https://raw.githubusercontent.com/annotorious/annotorious/v3.4.0/packages/annotorious-openseadragon/package.json)
- Retrieved UTC: 2026-10-10T05:48:12.575986+00:00; HTTP 200
- Raw response: [E31.json](E31.json)
- SHA-256: `7ab247a23d527a51c35816ec1e38e71f67e090f3ca8dd6d3225b84320046ccd1`
- Locator: name/version/peerDependencies/dependencies
- Independent observation and limits: At v3.4.0 @annotorious/openseadragon is 3.4.0, consumes 3.4.0 core/annotorious, and accepts OSD ^3.0.0 || ^4.0.0 || ^5.0.0. No dependency or runtime check was executed.

<a id="r32"></a>
## R32 — Released Annotorious package

- Primary URL: [https://raw.githubusercontent.com/annotorious/annotorious/v3.4.0/packages/annotorious/package.json](https://raw.githubusercontent.com/annotorious/annotorious/v3.4.0/packages/annotorious/package.json)
- Retrieved UTC: 2026-10-10T05:48:12.578533+00:00; HTTP 200
- Raw response: [E32.json](E32.json)
- SHA-256: `f995e0b905dea1a5311069ea8f5b23f56fe3517908d0527a3ae40b6fefade55d`
- Locator: name/version/dependencies
- Independent observation and limits: At v3.4.0 @annotorious/annotorious is 3.4.0 and consumes @annotorious/core 3.4.0.

<a id="r33"></a>
## R33 — Documented MAE opportunity

- Primary URL: [https://github.com/TETRAS-IIIF/mirador-annotation-editor](https://github.com/TETRAS-IIIF/mirador-annotation-editor)
- Retrieved UTC: 2026-10-10T05:48:12.579595+00:00; HTTP 200
- Raw response: [E33.html](E33.html)
- SHA-256: `1525e19ab8dae4756399e887fb7923228c6cce4b5a6cc9451c8f4e6fcc730138`
- Locator: README Generalities/General functionalities/Persisting Annotations/Technical aspects; E33.txt lines 203–328
- Navigable text: [E33.txt](E33.txt)
- Independent observation and limits: The moving README describes a Mirador 4 editor with geometric/text annotation and server persistence. It has mixed framework-version wording, so it proves a realistic lead, not tested compatibility with 4.2.4, export parity or private defaults. No accounts, installs or writes were used.
