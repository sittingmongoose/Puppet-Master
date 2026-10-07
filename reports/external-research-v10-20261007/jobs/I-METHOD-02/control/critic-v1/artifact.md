# I-METHOD-02 — Independent critic v1

**Stage:** control/critic-v1  
**Status:** Complete critique; no final-plan rewrite.  
**Inputs:** The exact brief and frozen plan, plus the researcher artifact and source map named by the input map. Public evidence was reacquired independently into this stage's `sources/`; no predecessor source bytes or treatment cache were used. See [source-map.json](source-map.json).  
**First useful finding saved:** 2026-10-07T19:40:32.615407596Z.  
**Complete artifact mark:** Set at the final save; the source map records the filesystem timestamp.

## Overall judgment

The researcher draft is a useful, well-bounded proposal and covers all P1–P6 with explicit alternatives, unresolved museum choices, and validation proposals. The pinned OpenSeadragon code and empty-`sizes` issue/fix/test/release chain check out. Its central architecture—separate Presentation parsing from Image API rendering, stable per-view references, durable application annotations, and proposed geometry/rights/reopen tests—should be preserved.

Three changes are required before a final reviser carries this forward: remove the partner-pixel export exception that contradicts the brief; specify the mapping from IIIF Presentation v2.1 rights/attribution fields and keep API-version scope as an explicit museum decision; and define Canvas-to-painted-image coordinate mapping from the manifest's actual painting annotation, rather than treating a dimension ratio as the complete transform. The evidence supports OpenSeadragon 6.1.1 as a conditional renderer candidate, not as a complete viewer, manifest parser, annotation system, or accessibility solution.

## Material criticism and dispositions

### 1. P3: remove the partner-pixel exception — reject

The draft says partner bytes/crops/derived thumbnails are excluded “by default,” then permits an exception if institutional policy names a permission and a curator opts in. That weakens the brief's explicit constraint: the museum has no authority to republish partner images. A policy name or opt-in does not establish an external grant. For this scope, partner image pixels and partner-derived thumbnails must remain out of every review package; remove the exception sentence. Locally owned thumbnails remain an option only when the museum can establish they are locally owned and authorized for this package use. Rights URIs and required statements should be retained and shown as source metadata, never interpreted as an export permission switch. The cited NoC-CR statement itself says other permissions may be needed and is not a license [C01, C02, C05].

This does not decide whether ordinary in-browser viewing of a curator-supplied partner service is allowed by that provider's terms. The desk needs to use the supplied reference for inspection, while the package/export path must not fetch, proxy, or include partner pixels. Keep those behaviors distinct and make the export test inspect both the archive and outbound requests.

### 2. P1/P3: close the IIIF v2/v3 metadata mapping gap — correct and leave version scope open

The draft proposes a normalized record with `rights` and `requiredStatement`, and conditionally lists Presentation 2.1 and 3.0 plus Image API 2.x and 3.0. The supplied Presentation 2.1 specification uses `license` and `attribution`; Presentation 3.0 uses `rights` and `requiredStatement`. These fields are not interchangeable in name or structure, and the v2.1 attribution may contain display text/markup. The draft says “map versions into one internal representation” but does not state how the older fields are preserved or displayed. Add an explicit version adapter mapping that retains the original values, provenance/resource level, and raw source reference; display the applicable rights/attribution statement without silently converting it into permission [C01, C24, C05].

“Support 2.1/3.0 and 2.x/3.0 if the partner inventory confirms both; otherwise publish the supported subset” is an appropriate open decision, but it is not a settled MVP compatibility promise. No partner sample was supplied or examined. Mark the supported version set as a pre-implementation museum decision based on representative inventory; until decided, do not claim either dual-version support or broad compatibility. The same version matrix should cover Presentation manifests separately from Image API services. The cited v3 standards alone cannot substantiate v2 behavior [C01–C04, C24, C25].

### 3. P2: make the annotation transform a Canvas mapping, not just a scale — correct

The proposal rightly stores geometry in Canvas coordinates and notes that Canvas and painting-image dimensions can differ. A single explicit scale is not enough as a general rule. Presentation associates painted content with a Canvas through painting Annotations; the Annotation target may describe a Canvas region, and a Canvas can contain multiple content resources. The v2.1 example also has Canvas and painting-resource dimensions that differ. The adapter must derive and retain the mapping from the actual painting annotation's target/selector and image body/service metadata, including any offset/crop and scale needed for that source. If a manifest's mapping cannot be interpreted safely, surface it as unsupported/uncertain rather than drawing notes at guessed coordinates [C01, C24].

OpenSeadragon's `imageToViewportCoordinates` and inverse helpers convert between an image's pixel coordinates and viewer coordinates, including viewer rotation. They do not convert IIIF Canvas coordinates into the painted image's pixel coordinates. The separate Manifest adapter therefore owns that first transform; viewer helpers own the second [C10–C12]. Preserve the proposed round-trip checks, and add fixtures for different Canvas/image dimensions, a positioned or cropped painting target, and malformed/unsupported targets. Test after pan, zoom, rotate, resize, close/reopen, and exchange. Upstream coordinate tests establish only OpenSeadragon's own coordinate conversion, not this application mapping [C15].

### 4. O2/O3: accept the evidence chain, with its stated limits

The v6.1.1 tag resolves through annotated tag object 96bdae63fc78de7cfb0721480b4e0560e0ce6b96 to commit 201d47833e3f10e9fa55159cd4203630521926b8; the release is dated 2026-09-09, and the independently queried latest-release endpoint also reports v6.1.1. The pinned `IIIFTileSource` normalizes v2 `@id`/v3 `id`, requires an identifier and dimensions, derives tiles from Image API metadata, and constructs Image API region/size URLs. The viewer resolves a tile source; this code does not parse a Presentation Manifest. The draft's separation between Manifest adapter and renderer is supported [C06–C12].

The reported issue #2962 gives a reproducible v2 `sizes: []` case and reports failure on 6.0.0/6.0.2/6.1.0. PR #2963 applies a non-empty-array guard, adds the fixture and a test asserting construction and matching max-level/tile-width/tile-URL behavior, and is named in the v6.1.1 release record. The pinned release source contains that guard and test. This is a supported issue → fix → regression-test-in-source → released-version chain. The version matrix is reporter/PR evidence, not a run performed here; neither the upstream test nor a desk build/test was executed. Keep the proposed desk regression fixture, but do not report it as validated [C08–C10, C14, C16–C20].

The overlay source documents viewport-relative overlay positions and removal on close/page changes unless preservation is enabled; the cited viewer code agrees. This supports keeping notes in the app's durable model. It does not establish that every overlay failure is fixed or that overlays are a suitable annotation store [C11, C13].

### 5. P4/P5 and product alternatives: preserve, with boundaries

P4's no-live-editing scope and conflict surfacing already appear in frozen P4. The proposed immutable revision/base identifiers and preserving divergent edits are supported design elaborations, not consequences of IIIF or OpenSeadragon. Keep authentication, roles, retention, backup, merge interaction, and export audit as museum decisions. Add tests for duplicate import and divergent edits, including delete-vs-edit, rather than implying a complete merge policy is specified.

P5 correctly leaves Mirador and Annotorious as prototype alternatives and Universal Viewer as a read-oriented baseline. Their official feature pages/guides support limited fit hypotheses only; they do not verify pinned code, package rights behavior, revision conflicts, accessibility of this desk's authoring flow, or interoperability of the proposed selector serialization. Do not elevate these pages into implementation evidence or treat the alternatives as rejected on a code comparison [C21–C23]. The researcher appropriately labels keyboard/polygon authoring and low-bandwidth behavior as proposed acceptance checks rather than proven component capability.

## Frozen-plan comparison summary

| Plan item | Critic disposition |
|---|---|
| P1 sources and multiple views | Preserve local uploads and source identifiers. Keep Presentation parsing separate from Image API rendering. Correct v2/v3 metadata mapping; leave supported versions open pending museum inventory. |
| P2 inspection and region notes | Preserve no-recognition scope, two-view comparison, durable view identity, and Canvas-coordinate intent. Specify Canvas-to-painting-image mapping and add positioned/cropped source fixtures. |
| P3 exchange and rights | Preserve missing/changed/denied-source states and annotation retention. **Reject and remove** the partner-pixel exception; package only explicitly selected museum-owned/authorized thumbnails. |
| P4 revisions | Preserve deferred live editing and visible conflicts. Identify merge semantics as a museum choice; test duplicate and divergent imports. |
| P5 components/usability | Keep OpenSeadragon 6.1.1 conditional and renderer-only. Keep Mirador/Annotorious as unverified spikes; retain keyboard, focus, readable rights, and low-bandwidth requirements. |
| P6 acceptance | Preserve the proposed matrix, add the rights prohibition and complete coordinate transform cases below. No row was executed in this critic stage. |

## Validation proposals and remaining uncertainty

Add or retain these proposed checks; they are not executed witnesses:

1. **Rights boundary:** open remote partner views through their supplied service references; export/reopen packets and inspect archive contents plus request logs. No partner image, crop, or partner-derived thumbnail is packaged or fetched for packaging. Rights/attribution is retained and readable; no metadata field triggers export.
2. **Version adapters:** exercise representative Presentation 2.1 and 3.0 manifests and Image API 2.x and 3.0 info documents selected from the museum's inventory. Verify exact source identifiers and each version's rights/attribution metadata survive normalization. Unsupported versions fail clearly without losing notes.
3. **Geometry:** assert known Canvas points and rectangles round-trip through Canvas → painting target/image pixels → viewport and back for equal-size and unequal-size examples, offsets/crops, and rotation; exercise polygon SVG exchange, clipping, invalid bounds, and unsupported transforms.
4. **Identity/reopen/revisions:** preserve notes across changed, unavailable, unauthorized, and metadata-only-changed source states; keep notes bound to Canvas or desk-owned view identity, not array order; test duplicate imports and delete/edit conflicts.
5. **Usability/performance:** run the proposed keyboard-only workflows, visible-focus and rights-display checks, and a measured request bound with fifty objects. The draft currently says “bounded”/“small” but gives no numeric request or response threshold; set that with the museum before treating low-bandwidth acceptance as objective.

Remaining uncertainty is appropriately centered on actual partner API versions and manifest quality, provider identity/version signals, rights/attribution completeness, local file types and limits, selector interoperability, accessible polygon editing, and the museum's service/revision policy. No evidence here establishes a built or deployed application.

## Critic record

- **Preserve:** the source-role separation, stable view identities, durable annotation model, OpenSeadragon 6.1.1 conditional renderer candidate, and the bounded empty-`sizes` regression proposal.
- **Correct:** remove the partner-pixel export exception; map v2 `license`/`attribution` and v3 `rights`/`requiredStatement` explicitly; define Canvas-to-painted-image geometry from actual manifest targets.
- **Reject:** any inference that rights metadata or a local policy label grants permission to republish a partner image.
- **Already covered in frozen plan:** multiple views, no recognition, locally owned thumbnails, missing-image behavior, conflict surfacing, deferred simultaneous editing, and the broad validation themes (P1–P6). The draft mostly elaborates these rather than discovering new product scope.
- **Unresolved:** museum API-version support, authoritative local-thumbnail policy, concrete low-bandwidth threshold, identity-change signals, and institutional revision/security policies.
- **Disagreement:** the draft's conditional authorization exception conflicts with the stated brief; this critique rejects it. No other blocking disagreement identified.
- **Executed validation:** independent public-source acquisition and static source/spec inspection only. No application build, upstream test execution, interoperability run, or product test occurred.
