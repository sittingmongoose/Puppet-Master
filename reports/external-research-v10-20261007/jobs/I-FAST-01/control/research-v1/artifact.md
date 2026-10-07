# I-FAST-01 — Researcher findings and proposed replacement plan

**Status:** Complete researcher draft; independent same-family critic is still pending. This is a proposed plan, not an implementation report.

## Research execution and limits

I read the case brief before any other case input. I started public-source discovery from the volunteer alignment need before opening the frozen plan. The first saved useful finding was at **2026-10-07T20:11:20Z**. I opened the plan only after examining MapWarper, QGIS Georeferencer and GDAL as public analogues/mechanisms. The plan and brief identities in the supplied input map were respectively `6e511c3749bfa87d7ddb0abc0dc616e854c898feb2bdc65cf6f4b15e24993651` and `6dd2544d34fd845067a74914ec5b87767c2fdc447981616f0b231f887d53a40c`.

The native Goal identity is `01a117fc-d384-7200-815a-77a906a3cf67`; immediate create and get snapshots both showed `active`, `tokensUsed: 0`, and `timeUsedSeconds: 0`. Those are aggregate Goal counters, separate from the unavailable input/cache/generated/reasoning/billing counters, which remain unknown/null. The Goal's terminal snapshot is reported in the handoff, not folded into source-operation counts.

Research used 8 web-tool calls (16 search queries and 17 page opens/clicks), 3 `git ls-remote` reference lookups, and 33 direct public HTTP fetch attempts. Thirty response bodies were saved under `sources/`; two requested GDAL documentation URLs returned 404 and one GitHub API request returned 403/rate-limit. The saved objects have host-computed SHA-256 values in `source-map.json`. No supplied source cache or prior research was available or used. No private scan was uploaded, no third party was contacted, and no application, build, or test was run. Proposed checks below were not executed.

## O1 — Independent discovery: products, mechanisms, alternatives

- **MapWarper** is a public web georeferencing/warping product whose documented workflow pairs points on an image and reference map. Its repository describes control-point CSV import/download, transformation choices, and PNG, GeoTIFF, WMS, tile and KML output. This is strong precedent for point-pair review and portable alignment exchange. Its documented model uploads images and runs as a web/crowdsourced geospatial service; its API requires authentication for rectification. That makes it an unsuitable default for a local-first group that has not affirmatively chosen remote storage. Its automatic point placement, mosaics, digitizer and social/group features are optional leads outside this MVP. See `sources/mapwarper-1d56d8e-README.md:3-45` and `sources/mapwarper-1d56d8e-README_API.md:2032-2052,2273-2342`.
- **QGIS Georeferencer** is a local desktop analogue. Its 3.44 guide recommends a linked georeferenced reference layer, editable GCPs saved separately as `mapX,mapY,pixelX,pixelY`, continued editing, multiple transform families, residual-unit selection, and export of a transformed raster/report. It explicitly distinguishes affine, projective and TPS behavior, including TPS's exact control-point fit and possible local deformation between misregistered points. These are applicable workflow mechanisms, not proof that QGIS's residual statistic is a ground-truth accuracy measure. See `sources/qgis-3.44-georeferencer.html:362-388,396-443,444-490,560-570`.
- A relevant negative finding is that the QGIS documentation repository still had issue #8659 open when captured: the guide did not specify the calculation or meaning of its “RMS error.” At the pinned QGIS source commit, `QgsGeoreferencerMainWindow::calculateMeanError` divides squared residual components by enabled-point count minus the transform's minimum GCP count, with a source comment that its degrees-of-freedom assumption treats each control point as fixing two degrees. The table separately reports each point's residual magnitude. The implementation is inspectable, but the live docs issue confirms the summary label still needs a definition. See `sources/qgis-issue-8659.html` (issue body/status), `sources/qgis-pinned-qgsgeorefmainwindow.cpp:1745-1787,2045-2060`, and `sources/qgis-pinned-qgsgcplist.cpp:160-162`.
- **Aerial-photo limitation:** USGS describes an orthoimage as correcting displacement/scale variation from terrain relief, sensor geometry and camera tilt using control, calibration and elevation information. GCP fitting alone does not provide those inputs or establish orthorectification. The product must call its result a reviewed alignment/overlay and avoid survey, engineering or cadastral accuracy claims. See `sources/usgs-hro.html:1177` and `sources/usgs-doq-orthoimage-faq.html:1116,1138,1406`.
- **Current transformation candidate:** the official GDAL past-release page identified 3.13.2, released 2026-07-22, as current at research time. I inspected the immutable 3.13.2 release commit `b40672525acf3f5c4f29d8541aa7dcff1e18eb92`. GDAL has explicit GCP/homography and warp APIs, but is a native geospatial library with platform packaging/integration work. Treat it as the leading raster/GCP engine candidate, not an adopted dependency or an assertion that its runtime is already bundled. The actual display/tile-cache implementation remains an implementation choice pending a small cross-platform viewport spike. See `sources/gdal-stable-download_past.html:130` and the pinned code below.

## O2 — Pinned component code and governing context

The consequential implementation inspected is GDAL 3.13.2 at commit `b40672525acf3f5c4f29d8541aa7dcff1e18eb92`.

- `alg/gdal_homography.cpp`, `GDALGCPsToHomography` (lines 121-190, 302-318) documents least-squares fitting and checks degenerate geometry; it emits `CPLError` on detected failures. `GDALCreateHomographyTransformerFromGCPs` (516-526) returns a transformer only after that fit succeeds.
- `alg/gdaltransformer.cpp`, `GDALCreateGenImgProjTransformer2` (2409-2438) is the governing caller: it selects the GCP/homography branch when the method is explicitly `GCP_HOMOGRAPHY` (or, when method is unspecified, for 4–5 GCPs), obtains GCP coordinates/CRS, calls the constructor and fails when it returns null. The neighboring polynomial branch is at 2440 onward. **Product implication:** pass the user's named method explicitly and validate point count/geometry before rendering; do not silently inherit a library heuristic from the count.
- `alg/gdal_alg.h` (119-121, 153-178) exposes the transformer and GCP APIs. `apps/gdalalg_raster_reproject.cpp` (410-438) shows the public raster-reproject caller forwarding transformer options to `GDALWarp`; this is relevant for a derived-raster export, not a reason to shell out to a remote service.
- GDAL's official warp guide documents polynomial orders, TPS, resampling and memory/output options. The docs say TPS exactly transforms GCPs and warn it can be costly at very large point counts; for this 20-image town case the more important risk is misleading exact fit/deformation, not thousands of points. See `sources/gdal-stable-gdalwarp.html` and `sources/gdal-stable-gdal_alg.html`.

The detailed source identities, exact URLs, capture times, hashes, paths, code symbols and ranges are in `source-map.json`.

## O3 — Issue, fix, regression evidence and release applicability

GDAL issue [#12435](https://github.com/OSGeo/gdal/issues/12435), opened 2025-05-21 against GDAL 3.11, describes `GCP_HOMOGRAPHY` failing on image chunks when lower corner GCP coordinates are switched; the reporter observed no output and no error to handle. This is directly relevant to volunteer point-order mistakes, though the reported marine-image dataset is not the proposed town dataset.

The linked [PR #12438](https://github.com/OSGeo/gdal/pull/12438) merged commit `eda0ae2` on 2025-05-23. It adds `CPLError` diagnostics to homography construction/inversion and GCP failure paths, and changes invalid-input expectations in `autotest/alg/gcps2homography.py` and `autotest/alg/homography.py` to assert errors. The [3.11 backport PR #12451](https://github.com/OSGeo/gdal/pull/12451) merged to `release/3.11` the same day and was assigned to 3.11.1; GDAL 3.11.1 `NEWS.md` lists the #12435 fix. This establishes release applicability through the maintenance branch/release notes, not by assuming a merged change shipped.

At the current pinned GDAL 3.13.2 commit, the same diagnostic code remains in `alg/gdal_homography.cpp` and the tests remain in `autotest/alg/gcps2homography.py` (`test_gcps2h_broken_hour_glass`) and `autotest/alg/homography.py` (`test_homography_1`). The hourglass tests exercise invalid geometry and the new error text; they are regression evidence for the failure-reporting path, not a replay of the issue's exact attached marine input. The tests were inspected but not executed here. Relevant captured versions: `sources/gdal-issue-12435.html`, `sources/gdal-commit-eda0ae2.html`, `sources/gdal-pr-12438.html`, `sources/gdal-pr-12451.html`, `sources/gdal-v3.11.4-NEWS.md`, and the 3.13.2 code/test captures listed in `source-map.json`.

## Proposed replacement sandbox plan

The following replaces P1–P6 for the same frozen scope: 20 scans in one town, volunteer alignment review and export, and no automated cadastral conclusions.

### P1 — Sources and provenance

Import up to twenty TIFF/JPEG scans as independent source records. Preserve the original bytes read-only; record path, file fingerprint, dimensions, channels, orientation metadata and any embedded CRS/georeferencing claim. Show scan provenance and reference provenance beside the working view. Require a user-confirmed target CRS/coordinate interpretation where needed; show “unknown” and pause the affected transformation when required information is missing instead of guessing.

The user selects exactly one modern reference source for a project: a local licensed raster (best for offline/repeatable review) or a public map service whose current access terms, attribution and connection requirements the group accepts. Record its identity/URL, attribution/license statement, coordinate reference and capture/retrieval date where available. A URL alone does not freeze a changing service; disclose that limitation. Do not upload scans or add credentials/sync to a service by default.

### P2 — Alignment candidates and transforms

For each scan, let a reviewer create a named candidate containing paired image-pixel and reference-map coordinates. Store stable point IDs, the point's pixel/line convention, target CRS/units, reference source, enabled/excluded state and optional reviewer note. Support deliberate add, move, disable and undo; never silently discard or auto-replace a point. Put points across the visible image footprint, but do not convert a point-count/coverage rule into an accuracy promise.

MVP transform set: **Affine (polynomial 1)** as the general default for flat scans/approximately planar frames, and **Projective (homography)** as an explicit alternative for appropriate oblique images. Explain the geometry each permits; enforce the method's minimum and nondegenerate geometry, surface engine errors, and require the user to choose. Do not automatically choose a model from GCP count. Defer TPS/rubber-sheet to a later opt-in opportunity unless the product owner accepts a third, clearly marked exploratory mode: TPS can force exact GCP fit while bending the image between them. Never present a more flexible fit as stronger accuracy evidence.

Preview each candidate against the chosen reference with linked extent, side-by-side source/reference point placement, opacity/blink overlay and visible point IDs. Preserve the original scan; candidate changes create a new/revised review state rather than replacing the original.

### P3 — Review and uncertainty

A reviewer can inspect and adjust each point, exclude it with a reason, compare named candidates and select a reviewed candidate. For each enabled GCP show its fit residual in source pixels and, only when a suitable projected CRS is known, in that CRS's map units. Define any summary statistic and denominator in the UI and export; distinguish **in-sample fit residual** from independent positional accuracy. A model can fit its own control points closely without proving alignment elsewhere; TPS is a particularly clear example.

Use plain statements such as “fit residuals describe these control points; they do not estimate survey accuracy.” Show when no independent checks exist, points are clustered, CRS is unresolved, or reference provenance is incomplete. Optionally allow a reviewer to reserve trusted checkpoint pairs that are excluded from fitting and report them separately; do not label that result an accuracy certification. No property-boundary, ownership, engineering or cadastral determination is produced.

### P4 — Working data and reopen

Store a versioned project manifest plus GCP/candidate records. Each scan record refers to the untouched source by relative path where possible and includes a strong file fingerprint; on reopen, report missing/changed source files rather than silently substituting. Persist all raw control coordinates, active transform and parameters, target CRS/axis/unit interpretation, exclusions/notes, selected candidate, reference identity/attribution, output settings and last review view. Do not bundle private source imagery unless the user explicitly chooses that export.

A project using a local reference raster should reopen without network access. A project using a service must retain the URL and explain that fresh tiles/reference content may require a connection and can change; the reviewed candidate data itself remains local. Keep credentials and unrelated machine state out of the project.

### P5 — Components and bounded processing

Prototype GDAL 3.13.x (or the then-supported pinned maintenance release) behind a narrow Rust adapter for raster metadata/read, explicit GCP transform and optional derived GeoTIFF; the 3.13.2 source inspection above establishes the mechanism, not packaging readiness. Surface GDAL failures in the UI, including the homography failure path from #12435. Pin GDAL/PROJ versions for a build and record them in every export. Test native runtime availability and licensing/deployment on each supported OS before adopting. QGIS can be an interoperability/checking tool; its full desktop workflow is the alternative if bundling a new application is acceptable. MapWarper is the hosted alternative only if the group expressly approves upload/service terms.

Keep the display engine decision open until a prototype proves pan/zoom, linked extent, overlays, point hit-testing and responsive navigation at representative scan sizes on supported systems. Load one full-resolution scan for processing at a time; use windowed reads/overviews and bounded cache/warp memory, explicit output resolution and progress/cancel. Select hard dimension/file-size/cache limits from an actual supported-laptop benchmark; do not invent a numeric limit in this plan. No absent CRS, axis order, image orientation or resampling choice is inferred silently.

### P6 — Export and proposed validation

Export one portable alignment package with a versioned JSON manifest as the authoritative record and a documented CSV of point pairs for exchange. Include scan fingerprints and source provenance, reference identity/attribution/license statement and date, exact CRS and axis/unit interpretation, transform name/parameters, every GCP including disabled status/notes/residual, selected candidate, software versions, raster dimensions/orientation and uncertainty statement. Offer an optional derived GeoTIFF with explicit output CRS, extent/resolution, resampling, nodata/alpha and a link back to the package/candidate. Never imply that the derived raster is a certified orthophoto. Do not silently include the full original scans.

Proposed checks (none executed in this researcher stage):

1. Synthetic fixtures for known translations/rotation/scale/shear and projective cases; verify image-coordinate orientation, corner/pixel convention, CRS axis order/units, forward/inverse round-trip and stable candidate reopen.
2. Degenerate/collinear/duplicate/swapped/hourglass GCP fixtures; require a clear actionable error, preserve the last valid candidate, and never report a missing or partial output as successful. Include a regression case modeled on GDAL #12435.
3. Fit-vs-checkpoint separation: verify excluded/held-out points are not included in fitting, and export labels fit residuals separately. Compare any summary to the documented formula.
4. Reopen and export round-trip: same project state, point IDs, CRS and transformation settings; export then inspect GeoTIFF and package independently in GDAL/QGIS. Compare semantic pixels/geotransform/metadata, not raw file hashes when container metadata can vary.
5. Source immutability: verify fingerprints before and after preview, warp and export. Test TIFF/JPEG orientation tags and corrupt/unsupported input messages.
6. Representative large scans and all 20 project entries: confirm one-at-a-time processing, configured memory/cache ceilings, progress/cancel and useful behavior when a source/reference is unavailable.
7. UI review with volunteers: point placement, disabled-point visibility, candidate comparison, and comprehension of the fit-residual warning; verify no view or export wording implies ownership or survey accuracy.

## Decision trace: every frozen P decision

| Frozen decision | Disposition and exact comparison |
|---|---|
| **P1 Sources** — 20 TIFF/JPEG scans plus one public reference; visible provenance, dimensions and stated CRS | **Retain and extend** the single-reference/visible-metadata choice. Add immutable source fingerprints, orientation, reference attribution/license/date and local-vs-service reopening semantics. The exact existing constraint is Plan §P1; applicable QGIS and MapWarper workflow evidence is above. Unknown CRS remains explicit, never guessed. |
| **P2 Alignment** — points, small explained transform set, residuals/overlay, multiple candidates | **Retain** human GCP entry, preview and multiple candidates. **Specify/correct** the unspecified transform choice with explicit affine/projective methods and counts/geometry/error handling. GDAL's actual caller chooses a homography by default at 4–5 GCPs if no method is specified, so passing an explicit method is necessary. Add in-sample-vs-checkpoint language and append/revise candidate states. Plan §P2 already contains the product concepts, but not these semantics. |
| **P3 Review** — point inspect/include/exclude, candidate comparison, uncertainty, no boundary/engineering result | **Retain** every restriction in Plan §P3. Add per-point residual display, a defined summary formula and warning that fit residual is not independent positional accuracy. The open QGIS docs issue #8659 and pinned implementation demonstrate why a bare “RMS” label is not enough. |
| **P4 Working data** — immutable original, stored points/assumptions/transform/selection/provenance, reopen without private-data download | **Retain** all existing requirements in Plan §P4. Add source fingerprint/missing-file handling, versioned manifest, complete point revision state and local/service reopen distinction. This extends rather than substitutes for the existing privacy/reopen decision. |
| **P5 Components** — undecided raster/CRS/transform/viewer; bounded laptop work; explain missing projection; preserve choice | **Narrow to a GDAL candidate for raster/GCP/warp**, conditional on platform packaging and runtime tests; keep the view engine open pending spike. Do not adopt QGIS or MapWarper as a component without deciding whether a full desktop app or upload-based service matches local use. Add explicit method passing and bounded one-scan processing; retain no-guess CRS behavior. Plan §P5 already supplies these constraints but no component evidence. |
| **P6 Output/checks** — package plus optional raster, provenance/uncertainty, listed checks | **Retain** both output forms and every listed check in Plan §P6. Add portable versioned schema, fingerprints, reference license/attribution, residual semantics, synthetic degeneracy/error checks, source immutability, independent-reader check and benchmark-driven resource limits. Do not claim checks/builds were run. |

## O1–O6 obligation disposition and open choices

- **O1:** satisfied by independent MapWarper/QGIS/GDAL/USGS discovery, including the negative hosted-upload fit and the optional automatic placement/mosaic leads.
- **O2:** satisfied by pinned GDAL 3.13.2 implementation, public declarations, the `GDALCreateGenImgProjTransformer2` caller and the warp application call. Applicability is to a candidate raster/GCP engine; viewer performance and packaging remain unproven.
- **O3:** satisfied by the actual #12435 report → #12438 fix → changed invalid-input tests → #12451 maintenance backport / 3.11.1 release note → same mechanism/tests in the pinned current release. The regression tests do not replay the reporter's exact file.
- **O4:** satisfied above, with an explicit row for P1–P6 and exact frozen-plan references.
- **O5:** **pending.** No same-family critic input was supplied or received. The critic should independently verify the GDAL code/version/selection behavior, the issue-test-release chain, QGIS residual interpretation, source applicability and all P1–P6 obligations. No criticism or disposition is invented here.
- **O6:** supplied as the coherent replacement P1–P6 sections, evidence rationale, options/conditions, already-covered matters, rejected/optional leads, proposed checks and remaining uncertainties above. Final reviewer/reviser must append actual O5 criticism and its disposition before treating the full campaign deliverable as final.

## Remaining product choices and uncertainty

The project owner still needs to select the reference source/service and accept its terms; decide whether affine and projective are the right MVP transform pair for the actual scan collection; decide if TPS merits a labeled future mode; choose the raster viewer after a cross-platform spike; and set concrete import, cache and output limits from a representative-laptop benchmark. The town, scan calibration/CRS metadata, terrain relief, map licenses and reference point quality are not supplied, so this research cannot estimate accuracy or guarantee a model is suitable for every frame. A locally fitted 2-D warp cannot correct unknown terrain/camera displacement or replace orthorectification inputs.

**Complete researcher draft saved:** `2026-10-07T20:23:10.152480+00:00`.
