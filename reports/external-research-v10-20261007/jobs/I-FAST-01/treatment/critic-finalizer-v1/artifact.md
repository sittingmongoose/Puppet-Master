# I-FAST-01 — final proposed sandbox-plan revision

## Record and status

This is the complete critic-finalizer proposal for P1–P6: twenty historical TIFF/JPEG scans from one town, volunteer alignment review, and export. It keeps the boundary against cadastral, survey-accuracy, legal-boundary, and engineering conclusions. It is a proposed plan, not an implementation report.

The frozen brief, plan, predecessor research artifact, predecessor source map, and all captures named by that map were read from the exact paths in the candidate input map. The brief and plan hashes are recorded in `source-map.json`. I independently reopened the governing public sources and captured version-pinned source bytes under `sources/`. No supplied critique or evaluator material existed. This same-family critic performed the O1–O6 review here; there is no separate critic response to attribute.

- Native Goal identity: `01a11809-323f-7ee1-b83c-c08acf2ddf9a` (activated before source reading; terminal state is reported separately).
- First useful independent code finding observed: 2026-10-07 20:25:11 UTC. It was the pinned GDAL caller’s method dispatch and its GCP-count conditions.
- Full artifact and source-map save times are recorded in `source-map.json`.
- Status: **DIAGNOSTIC_UNQUALIFIED**. This work does not establish a SourcePASS, comparative speed, accuracy, or fitness for any town scan.

## Critic’s disposition of the research draft

The draft is retained as a substantive, well-sourced proposal, with the following corrections and limits carried into this final version.

1. **GDAL dispatch must be described precisely.** In GDAL v3.13.3, `GDALCreateGenImgProjTransformer2()` takes an explicitly supplied source method when present. With no method, its homography branch applies to GCP counts of four or five; other nonempty GCP sets can enter the polynomial branch, whose order is automatically selected when the option is zero. Thus “point count can choose a model” is true, but the affected implicit homography condition is specifically four or five points. The app must choose and pass an explicit method or its own named solver for every candidate. This behavior does not recommend homography for aerial scans. [S2, S3]
2. **The proposed “Helmert/similarity and affine” set needs a backend correction.** The examined GDAL caller exposes polynomial, TPS, and homography GCP methods; its first-order polynomial is affine. The reviewed code does not expose a named similarity/Helmert GCP method. The final proposal keeps similarity as a product choice only with an explicitly app-owned four-parameter solver and separate tests; it must not be represented as GDAL’s affine option. If that solver fails its numerical and usability gate, ship affine alone only after the product owner accepts the narrower model set. [S2]
3. **The fit-residual statement is retained and strengthened.** Residuals at points used to fit a transform describe fit to those points, not ground truth. A minimum-point or high-order model can fit its controls closely while being wrong elsewhere. The interface and export distinguish fitting controls from optional check points excluded from the fit. Neither is advertised as survey accuracy. [S1]
4. **TPS deferral is a scope choice, not a finding that TPS is unsuitable.** The draft understated the counter-evidence: QGIS 3.44 says TPS can be useful for damaged/deformed maps and poorly orthorectified aerials. This town’s scans were not examined, so that use case remains plausible. Keep TPS out of the first proposed model set pending a representative-scan pilot, and explicitly reopen the choice if local deformation is material. Homography is also deferred, with the separate GDAL diagnostic precedent below. [S1–S4]
5. **GDAL remains a provisional backend candidate, not a proven winner.** The inspected API and implementation provide concrete raster-window, GCP, transform, and error-handling mechanisms. No comparative packaging, platform, performance, Rust integration, or licensing study was completed here. A spike must settle those matters before pinning a shipped build. The v3.13.3 source is an evidence pin, not a dependency decision. [S2, S3, S10]
6. **Overview behavior is conditional.** `RasterIO()` supports window reads and smaller output buffers; the GDAL tutorial says suitable overviews can make reduced-resolution reads more efficient. This does not guarantee that each input has overviews or that every driver/request will use one. Preview code must measure and verify its chosen path. [S10]
7. **Issue-to-test linkage is narrower than the initial summary could suggest.** Issue #12435 reports a homography failure without a useful diagnostic; PR #12438 adds `CPLError` calls at failure paths and changes assertions. Its “broken hourglass” test is labeled as a test case for older issue #11618, so it is not the same reproducer as #12435. It demonstrates a diagnostic on one pathological geometry, not coverage of the reporter’s complete raster-reproject invocation. The release/3.11 backport, v3.11.1 release record/NEWS, tagged implementation and test support shipped historical applicability. GDAL v3.13.3 contains the diagnostic and test as captured. No upstream test was executed in this work. [S5–S9]
8. **The MapWarper statement remains strictly an analogy.** Its public product page describes upload, rectification and download; it supplies no privacy, retention, licensing, or offline guarantee. It is not an MVP service and no scan should be uploaded. [S12]
9. **The OSM rule stays provider-specific and time-sensitive.** The captured OSM Foundation policy disallows offline use and bulk prefetch on `tile.openstreetmap.org`; it permits ordinary visible-viewport requests subject to the policy. Do not generalize this policy to other services; recheck the chosen provider’s current terms at implementation and release. [S13]
10. **The draft’s unresolved items are not silently promoted to facts.** No representative scan, target platform, provider, dataset license, target CRS, interaction prototype, or measured laptop budget was supplied or tested. The selected product choices below are the recommended MVP choices; these missing inputs remain gates for implementation.

## Evidence and discovery conclusions

**GCP workflow and model tradeoffs.** QGIS 3.44 documents entering, moving, excluding, saving, and reloading GCPs; choosing transformations and resampling; and inspecting residuals. It explains that overdetermined non-TPS models minimize overall residual error, while TPS matches specified controls with a locally deforming surface. TPS can fit damaged or poorly orthorectified aerial material, but that does not establish whether these scans need it. This supports saved point status, named models, residual units and a deliberate pilot—not a universal transform recommendation. [S1]

**GDAL transform mechanism and error behavior.** The v3.13.3 caller and homography implementation show explicit method dispatch, automatic polynomial-order selection, a homography least-squares fit, degenerate-input checks, and errors reported via `CPLError`. Those details require an app wrapper to preserve the selected method and diagnostics. They do not measure registration quality or validate user point placement. [S2, S3]

**Shipped diagnostic-fix history.** GDAL issue #12435 describes a real `GCP_HOMOGRAPHY` reproject failure without an error message. PR #12438 adds error reporting for failed inversion, degenerate ranges, failed homography application/solve, and invalid geometry; its tests assert diagnostics, including on the preexisting broken-hourglass case. PR #12451 backports the change to `release/3.11`; the v3.11.1 release page and NEWS plus tagged code/test show release applicability. The current pinned v3.13.3 source still contains the diagnostic path. This justifies a proposed “failure reaches the volunteer; stale/blank output is not shown” test if homography is ever shipped. It does not show that GDAL rejects all bad alignments, detects inaccurate but mathematically valid fits, or repairs points. [S5–S9]

**Bounded image preview mechanism.** The pinned GDAL Raster API guide documents reading a source window into a differently sized output buffer and using suitable overviews for reduced resolution. It is a mechanism to investigate for previews, not proof of memory or latency budgets, overview availability, or twenty-file performance. [S10]

**Comparison and hosted analogues.** MapLibre GL Compare demonstrates a synchronized two-map swipe interaction and slider events, useful as a review interaction reference. Its pinned README describes a GL JS plugin, not a native desktop georeferencer. MapWarper illustrates a hosted upload/rectify/download workflow and provenance references, but conflicts with this plan’s no-private-upload rule and does not establish terms suitable for this use. [S11, S12]

**Reference-service constraints.** The OSM standard tile policy is one concrete example that licensing a map does not grant permission to bulk cache or provide offline copies. The MVP therefore selects no default provider and does not prefetch. A user-provided licensed local raster is the reproducible offline path. [S13]

## Replacement plan: proposed MVP

### Product flow

Create a local project; add one to twenty TIFF/JPEG scans; choose one licensed local reference raster or one explicitly configured public map service; select a scan; place control points; select an explained transform; inspect residuals and an overlay; preserve alternative alignment revisions; then export an alignment package and, optionally, a derived raster. Keep the original source immutable. Use a focused local desktop review workspace as the MVP; the view can use opacity, a swipe divider, or synchronized panes. A comparison control is for visual review, not for asserting registration quality.

No scan is uploaded. No UI or report makes parcel-ownership, cadastral, legal-boundary, engineering, or survey-accuracy conclusions.

### P1 — Sources and provenance

**Retain** Frozen plan P1’s limit of twenty TIFF/JPEG scans, one chosen public reference raster or map service, and visible provenance, dimensions, and stated coordinate reference information. **Add** visible band/color and orientation metadata when available, plus a source fingerprint used only to detect relink/change. A fingerprint is not proof of a file’s date, history, license, or authenticity.

Each project records the selected reference’s local path or provider name/endpoint, attribution, terms/license link, access time, and whether network access is required. Do not choose a default third-party provider. Online imagery can change or become unavailable; reopening it may require network access and must not silently substitute content. The local licensed-raster path is the supported reproducible/offline option. Do not upload scans to a hosted analogue or send private scans to a service. Only cache network tiles when the selected provider expressly permits the actual cache behavior.

### P2 — Alignment and candidate revisions

**Retain** user-placed GCPs, an explained small model set, residual review, and multiple candidate alignments from Frozen plan P2. Each point has a stable ID, source pixel/line, target coordinate pair and CRS, note, role (`fit` or optional `check`), and included/excluded state. Excluding a point is a saved, reversible review action; never automatically delete an outlier without the volunteer’s explicit action.

For the proposed first set, offer:

- **Similarity (uniform scale, rotation, translation):** app-owned four-parameter least-squares solver. This is not the GDAL affine polynomial method.
- **Affine (first-order polynomial):** six parameters; GDAL may be evaluated for this explicit method.

Require deliberate model selection and state the model in every candidate. Use a minimum of three distinct active fit points for both choices, with mode-specific rank/degeneracy checks; explain that extra points produce a least-squares fit. Reject underdetermined/degenerate inputs with an actionable diagnostic and do not render a stale result as current. Compute any residual summary from active fit points, name the formula and units, and show the count. Optional check points are never passed to the fitter and appear separately.

Do not expose homography or TPS as first-pass choices. This is a bounded MVP decision, not evidence that they are inappropriate for the town. Revisit TPS after a representative scan pilot because QGIS documents its use on poorly orthorectified aerials; revisit homography only with explicit implementation, diagnostics and failure-path coverage. Do not let GCP count silently switch the selected model. For GDAL polynomial use, pass the explicit method/order that means affine; for similarity use the app solver, never a default GDAL polynomial/homography choice. Preserve backend errors for the reviewer.

### P3 — Review and uncertainty

**Retain** Frozen plan P3’s uncertainty framing and ban on boundary/engineering conclusions. Show the source and target coordinates, CRS/units, role and active status for each point; show residual vector/magnitude with units for fit points and any check points in separate labeled groups. Let a volunteer inspect, include/exclude and compare candidate revisions using opacity, swipe or synced panes. Show which candidate/model is active and when the displayed raster is stale or recomputation failed.

Use labels such as “fit residual” and “check-point difference,” not “accuracy.” Explain that map currency, source distortion, projection/axis interpretation, point placement, reference quality and model choice affect the result. Check points can offer additional evidence only when independently selected and held out; they do not turn the product into a survey instrument.

### P4 — Working data, privacy, and reopen

**Retain** Frozen plan P4’s immutable originals, saved controls/assumptions/settings/selection/provenance, and reopen behavior without downloading private data. **Add** a versioned local project manifest recording scan fingerprints; GCP IDs, roles, coordinates, CRS and units; axis mapping and pixel/line convention; selected model/parameters; included/excluded status; resampling; candidate revision and selection; reference identity/attribution/terms; software and backend versions; review notes; and comparison view state.

On relink, compare the fingerprint and warn if the source is missing or changed; never rewrite the original or silently adopt a replacement. Reopen of a local source must not upload it. A service reference may need network access and may change; state those limits instead of promising byte-for-byte reproducibility. Store no third-party tile cache unless its terms permit it.

### P5 — Components and bounded processing

GDAL is the **provisional leading raster/spatial backend candidate** because the pinned source exposes explicit GCP transform paths, diagnostics, raster windows, and overviews. GDAL v3.13.3 is the reviewed source version as of this research; it is not yet the shipped version pin. Before implementation, run a platform packaging/integration spike that chooses the supported OSes, a tested GDAL build and its PROJ/data dependencies, license notices, distribution source, and error-marshalling behavior. The spike must explicitly test the wrapper so the UI model maps to the intended solver. If packaging or desktop integration does not fit the MVP, bring back a QGIS-based workflow as an alternative decision; no QGIS component or Rust integration cost has been established here.

Use viewport/source-window reads and reduced output buffers for previews; use suitable overviews when present and verified. Set explicit memory limits. Keep full-resolution derived-raster generation separate from interactive preview. Do not claim bounded laptop performance until target hardware, scan sizes and measurable budgets are agreed and measured. MapLibre swipe behavior remains interaction inspiration, not a selected dependency. MapWarper remains a rejected hosted workflow for private scans.

### P6 — Export and proposed validation

Default export is a portable package containing a versioned JSON manifest, CSV point/residual table, provenance/attribution, and a concise uncertainty README. The manifest includes the selected model and parameters, all fit/check points including excluded points, coordinate and axis conventions, residual definitions, resampling, reference identity, software/backend version, review notes and generation time. A derived GeoTIFF is optional and clearly marked as a derivative. Do not bundle original scans or third-party tile caches by default; include them only if the user explicitly chooses and has the right to distribute them.

The following checks are **proposals only; none was executed here**:

1. **Coordinate interpretation:** synthetic TIFF fixtures for source pixel/line convention, pixel centers/edges and half-pixel behavior; axis order; geographic degrees versus projected units; explicit CRS choice; missing/ambiguous CRS rejection; and orientation variants.
2. **Model math:** known similarity and affine transforms, exact and overdetermined point sets, measurement perturbations, excluded controls, held-out checks, singular/rank-deficient layouts, collinear/clustered points, and numerical tolerance across supported builds. Confirm the similarity solver is not routed through GDAL’s affine method.
3. **Dispatch and errors:** prove UI model selection maps to the explicit backend method/order; exercise failures and ensure no blank or stale image appears. If homography is later added, use a redacted synthetic invalid quadrilateral in the GDAL failure class and verify the diagnostic reaches the UI. Upstream’s unit test alone does not establish app behavior.
4. **Persistence/privacy:** save and reopen after moving/excluding points and changing candidate; compare all controls, roles, CRS/axis metadata, model, provenance and view state. Test missing/changed scan relinking, no source rewrite and no upload. Confirm reopening a local project does not require a remote source.
5. **Reproducibility:** rerun the same project on the same pinned backend and compare parameters/residuals within a declared tolerance; compare across backend upgrades and report version differences. Do not demand byte-identical rasters without evidence that is achievable.
6. **Orientation/export:** TIFF/JPEG orientation fixtures; compare displayed and source pixel coordinates; export and reopen GeoTIFF CRS/metadata, dimensions and sampled values; verify original bytes remain unchanged.
7. **Large inputs:** representative large scans and a twenty-source project; measure peak RAM, open/pan/zoom responsiveness and full-resolution export time on named target laptops. Verify windowed reads and suitable overviews rather than assuming them.
8. **Reference service:** for the provider selected later, check attribution, terms, request/cache behavior, network failure and policy at release; do not prefetch when disallowed. Test the local licensed-raster path independently.
9. **Review communication:** verify residual units/formula, fit versus held-out check labels, failure state, uncertainty copy, no accuracy language, and no boundary/engineering conclusion in UI and export.
10. **Packaging:** build and inspect the chosen GDAL/PROJ distribution on each target OS, confirm license notices and data files, and test diagnostics crossing the app boundary. No build or packaging test has run.

## Complete P1–P6 comparison

| Frozen plan decision | Disposition and reason |
|---|---|
| P1 Sources | **Retain** twenty TIFF/JPEGs, one user-selected reference, provenance, dimensions and stated CRS. **Add** fingerprint/relink warning, color/orientation metadata, explicit service terms/attribution and local offline raster path. No claims about unknown scan rights or provider rights. |
| P2 Alignment | **Retain** user controls, small explained choice, residuals and multiple candidates. **Clarify/change** to named similarity and affine choices, separate similarity solver, explicit GDAL affine dispatch, stable point schema, roles and degeneracy errors. **Defer** TPS/homography behind a representative-scan and diagnostics gate; TPS remains a plausible later opportunity. |
| P3 Review | **Retain** uncertainty language and no boundary/engineering conclusions. **Add** units/formula, fit versus held-out check distinction, active state and current/stale/error display. Fit residuals are not independent accuracy estimates. |
| P4 Working data | **Retain** immutable scans, saved assumptions/settings/provenance and local reopen. **Add** versioned manifest, fingerprint/relink, explicit CRS/axis/pixel conventions and mutable remote-source caveat. |
| P5 Components | **Retain** undecided-component status pending evidence. **Recommend** a bounded GDAL packaging/integration spike, not an irrevocable dependency. **Add** explicit method dispatch, windowed preview, conditional overview use and measured resource budget. Keep QGIS workflow as an alternative; MapLibre as interaction inspiration only. |
| P6 Output/checks | **Retain** alignment package, optional derived raster and the five frozen check categories: coordinate interpretation, reopen, reproducibility, orientation and large scans. **Expand** them into the ten concrete proposals above. Keep all validation unexecuted. |

## Alternatives and decision register

- **Custom local review workspace + provisional GDAL:** selected proposal for the first MVP; packaging and model-wrapper spikes are required before dependency lock.
- **QGIS-based workflow:** credible alternative for a smaller/earlier product, supported as a georeferencing workflow by QGIS 3.44 docs. Not selected because this research did not compare its project/export workflow, integration or packaging against the specific local-history-group need. Reopen if the custom UI spike exceeds scope.
- **MapLibre GL Compare:** retain as a swipe/synchronized-pane interaction reference. Reject as georeferencing backend or selected native desktop widget; its pinned README documents a GL JS plugin.
- **MapWarper:** reject as an MVP dependency because the hosted upload flow is outside the no-private-upload boundary. Retain only as a provenance/export analogue; public homepage does not establish private-data handling or license suitability.
- **OSM standard tiles:** do not select as the default reference. The captured policy specifically prohibits offline/bulk tile download for that service. This does not reject other providers; their terms must be checked individually.
- **TPS:** do not put in the first set, but retain as a live opportunity, not a scientific rejection. A sample pilot may reverse this recommendation.
- **Homography:** defer; if reconsidered, explicit selection, current backend, diagnostics, test coverage and explanation are mandatory. The historical issue supports error handling, not suitability.
- **Other raster readers, GUI frameworks and providers:** not sufficiently compared in this bounded review; no winner is asserted.

## Remaining uncertainty and gates

No source scan or town-specific control-point geometry was supplied. Need the owner to identify target OSes, target laptop class, actual scan sizes/orientation/condition, reference CRS/provider and licenses, and whether offline operation is a must. Confirm if check points are available from an independent source. Decide the residual summary shown to volunteers and its wording after prototype review. The proposed MVP models and local UI are explicit recommendations, but similarity implementation, packaging, provider choice, performance budgets, and TPS need remain gated by the proposed checks. Recheck live documentation, release status and provider policy when a build version is selected.

## Executed evidence versus proposed validation

Executed in this critic pass: read the frozen inputs and full predecessor artifact/map; reopened primary QGIS, GDAL source/issue/PR/release, MapLibre and OSM pages; fetched version-pinned source/documentation captures and computed capture hashes; inspected source paths/symbols and the fix patch. These operations establish the content of those captured sources at their stated URLs/versions and the existence of the release records as captured. They do **not** establish that GDAL tests passed during this pass, that a raster was transformed, that the software was built, that privacy/performance is acceptable, or that an alignment is accurate.

No app, test, benchmark, raster calculation, build, install, upload, or external contact was performed. All ten validation items above remain proposals.


## O1–O6 obligation closure

| Obligation | Disposition in this final artifact |
|---|---|
| O1 — brief-led primary-source discovery | Addressed by the QGIS/GDAL mechanisms, issue and release history, RasterIO preview mechanism, comparison interaction, hosted analogue and provider-policy evidence, with bounded limits and negative findings above. |
| O2 — pinned code and governing context | Addressed by the v3.13.3 caller, homography implementation and regression-test captures; explicit method dispatch and the 4/5-GCP implicit condition are recorded. |
| O3 — issue/fix/regression/release applicability | Addressed by issue #12435, fix PR #12438, release/3.11 backport #12451, v3.11.1 release/NEWS and tagged code. The broken-hourglass test’s older issue label and narrower scope are made explicit. |
| O4 — complete plan comparison | Addressed in the P1–P6 table with retain/change/add/defer decisions and exact frozen-plan section references. |
| O5 — substantive same-family criticism | Addressed in “Critic’s disposition”: dispatch precision, similarity solver, TPS counter-evidence, residual limits, RasterIO overview qualification, issue/test distinction, backend evidence limits, hosted analogues and unresolved inputs are corrected or dispositioned. |
| O6 — complete proposed-change artifact | Addressed by the replacement plan, alternatives, retained/rejected/deferred matters, validation proposals, product choices and remaining uncertainty. Nothing is represented as built or validated. |


Source-directory reconciliation: the predecessor map links 21 captured files. The declared predecessor capture directory also contained two additional files that its map does not link; both were copied and hashed for completeness, and neither supports a claim in this artifact. Their status is explicit in `source-map.json`.
