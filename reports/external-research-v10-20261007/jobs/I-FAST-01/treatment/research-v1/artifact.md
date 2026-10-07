# I-FAST-01 research-v1 — proposed sandbox-plan revision

## Scope and record

This proposal covers P1–P6 for importing twenty historical scans for one town, volunteer alignment review and export. It keeps the user’s restriction against survey, cadastral or engineering conclusions. This is a researcher draft for independent criticism, not a claim that an application was built or validated.

- Brief read first; independent discovery findings were saved before opening the frozen plan: 2026-10-07 20:12:20 UTC. The frozen plan was first read at 20:12:27 UTC.
- First useful saved finding: 2026-10-07 20:12:20 UTC. Complete researcher draft written at: 2026-10-07T20:22:45Z.
- Goal identity and observed active counters from a native state read: {"identity":"01a117fd-14ce-73e2-bee7-672c336b5e59","status":"active","tokensUsed":204791,"timeUsedSeconds":540}. These are aggregate Goal counters, not source-operation counts. Input, cache, generated, reasoning and billing counters are unknown (null).
- Source-operation counts at draft time: 19 public-source search queries, 25 page-open requests, 3 page-find requests, 26 direct HTTP capture attempts (24 successful, 2 failed), and 2 read-only git reference lookups. The failed attempts were a GitHub API request (HTTP 403) and one guessed test path (HTTP 404); neither was used as evidence.
- No source, installer or test was executed. Captured immutable source files and rendered public pages are listed in source-map.json; the host computes capture hashes.

## Findings that shape the revision

**A GCP review record is a stronger precedent than a “best fit” badge.** QGIS 3.44 lets a user pair image pixels to known coordinates, move or remove points, save and reload GCPs, choose a transform and resampling method, and export residual reports. Its guide explains that overdetermined non-TPS models minimize overall residuals, while TPS exactly matches entered points and can deform areas between imprecise points. This supports retaining each point and its status, showing per-point residuals with units, and explaining that fit residuals describe the chosen points rather than ground-truth accuracy. It does not identify the correct model for these particular scans. [QGIS 3.44 Georeferencer, sections 11.3.1.1–11.3.1.3](https://docs.qgis.org/3.44/en/docs/user_manual/managing_data_source/georeferencer.html)

**GDAL is the strongest researched spatial backend candidate, with one important wrapper hazard.** I inspected GDAL source at immutable release commit c8b4c45fca87d3e6fbf80e7a7898b8a661ad0edc (v3.13.3, the current release shown by GDAL on 2026-10-07). In alg/gdaltransformer.cpp, GDALCreateGenImgProjTransformer2 governs the caller path: it dispatches an explicit GCP_HOMOGRAPHY method to GDALCreateHomographyTransformerFromGCPs; absent an explicit method, it can select homography based on GCP count. alg/gdal_homography.cpp defines GDALGCPsToHomography and GDALCreateHomographyTransformer; it checks degenerate ranges and invalid transforms and reports failures through CPLError. The app therefore must map each UI choice to an explicit backend method and must display computation errors. Do not let a point count silently choose a model. These sources establish the implementation behavior only, not that homography is suitable for a historical aerial. [GDAL v3.13.3 transformer caller](https://github.com/OSGeo/gdal/blob/c8b4c45fca87d3e6fbf80e7a7898b8a661ad0edc/alg/gdaltransformer.cpp), [homography implementation](https://github.com/OSGeo/gdal/blob/c8b4c45fca87d3e6fbf80e7a7898b8a661ad0edc/alg/gdal_homography.cpp)

**Issue → fix → regression evidence → release applicability.** GDAL issue #12435 reported that an invalidly ordered set of GCPs passed to GCP_HOMOGRAPHY failed without producing an error. PR #12438 added CPLError reporting at homography failure points and changed the broken-hour-glass GCP test to expect an exception with a specific diagnostic. Backport PR #12451 merged the change into release/3.11 and targeted 3.11.1. The v3.11.1 release was published July 1, 2025; its NEWS entry names #12435. The tagged v3.11.1 source and regression test contain the change. Current v3.13.3 source also contains the diagnostic and regression assertions. This is a real, applicable precedent for surfaced failures and tests, not proof that GDAL fixes bad user points, detects all bad alignments, or validates accuracy. [Issue #12435](https://github.com/OSGeo/gdal/issues/12435), [fix PR #12438](https://github.com/OSGeo/gdal/pull/12438), [release/3.11 backport PR #12451](https://github.com/OSGeo/gdal/pull/12451), [GDAL 3.11.1 release](https://github.com/OSGeo/gdal/releases/tag/v3.11.1), [GDAL 3.13.3 release](https://github.com/OSGeo/gdal/releases/tag/v3.13.3)

The regression test changes assert that the invalid quadrilaterals raise a diagnostic; it is narrower than rerunning the reporter’s full raster-reproject command. The proposed app tests below add an end-to-end failure-display check. The fix shipped through a tagged release; it is not inferred merely from the merge.

**Large-raster display can be windowed.** In GDAL 3.13.3’s raster API tutorial, RasterIO accepts source windows and smaller output buffers, and uses suitable overviews for reduced-resolution reads. This gives a grounded bounded-memory strategy for previews; it does not establish a performance budget for twenty scans or any particular laptop. [GDAL 3.13.3 Raster API tutorial, Reading Raster Data](https://github.com/OSGeo/gdal/blob/c8b4c45fca87d3e6fbf80e7a7898b8a661ad0edc/doc/source/tutorials/raster_api_tut.rst)

**Useful product patterns and limits.** MapLibre GL Compare demonstrates synchronized two-map swipe, position changes and slide-end events. Reuse this as an interaction pattern for a before/after divider or synchronized panes, not as a georeferencer or a native-desktop component recommendation. [MapLibre GL Compare README at commit fd86addd6a666f833629ae29c4ef09ff36538662](https://github.com/maplibre/maplibre-gl-compare/tree/fd86addd6a666f833629ae29c4ef09ff36538662)

MapWarper is a hosted map rectifier with upload, control-point, rectified-map and download workflows, including KML links and source/bibliography references on examples. It is a useful analogue for provenance and export. The brief forbids uploading private data, so this hosted workflow is not an MVP dependency and no private scan should be sent there. [MapWarper homepage](https://mapwarper.net/)

A public map license does not by itself authorize arbitrary tile caching. As a concrete provider example, OpenStreetMap’s standard tile service requires attribution and cache compliance and prohibits offline/prefetch downloads; its policy also says service availability is best effort and can change. This is specific to tile.openstreetmap.org, not a claim about all providers. If a service provider cannot meet offline review needs, accept a user-supplied licensed local raster instead. [OSMF Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)

## Proposed replacement plan

### Product flow

Create a local project, add one to twenty TIFF/JPEG scans, select a licensed local raster or configured map service, and review one scan at a time. The import screen shows source name, dimensions, bands, detected metadata and stated CRS. If CRS or axis interpretation is absent or ambiguous, ask the volunteer to choose or defer alignment; never infer a projection from appearance. A split view or swipe preview compares the scan and reference. A point table and map view show active/excluded GCPs, coordinate units, per-point residuals and the chosen model. “Candidate alignment” is a saved review revision; volunteers can create alternatives without changing the source or erasing earlier evidence.

### P1 — Sources

Retain the frozen limit of twenty TIFF/JPEG scans and one selected public reference raster or map service. Keep source provenance, original dimensions, color/band details, orientation metadata when present, and stated CRS visible. Add a local source fingerprint and a clear relink warning if the file moves or changes; hashes identify a file but do not certify its date, content or rights. Never upload scans. For a map service, record provider name, endpoint, attribution text, license/terms link, and whether network access is needed. Offer a local licensed reference raster as the reproducible/offline option. MapWarper is an analogous hosted workflow only; its upload model conflicts with the no-private-upload boundary.

### P2 — Alignment

Retain user-selected control points, an explained small model set, visible residuals and multiple candidate alignments. For the first MVP, expose Helmert/similarity and first-order polynomial/affine models; require the user to choose explicitly. Explain the degrees of freedom in plain language and refuse underdetermined or degenerate inputs with an actionable error. Keep each point’s stable ID, source pixel/line, target coordinate pair and CRS, note, and active/excluded state. Save candidate revisions instead of overwriting the source scan.

Do not ship TPS or homography as ordinary choices in the first pass. They may be added after a scan-specific pilot establishes a volunteer need and the team verifies control-point distribution, edge behavior, diagnostic propagation and export. QGIS documents their different fitting behavior; GDAL’s code path can choose homography from GCP count when no method is supplied. If homography is ever exposed, send the explicit method and surface CPLError messages. [QGIS transform guidance](https://docs.qgis.org/3.44/en/docs/user_manual/managing_data_source/georeferencer.html), [GDAL caller at v3.13.3](https://github.com/OSGeo/gdal/blob/c8b4c45fca87d3e6fbf80e7a7898b8a661ad0edc/alg/gdaltransformer.cpp)

### P3 — Review

Retain the frozen no-boundary/no-engineering-accuracy rule. Show each point’s pixel and target coordinates, active status, residual vector and magnitude, and units. Summaries should state their definition and number of active points; label them “fit residual” or “alignment evidence,” never “accuracy.” Explain that reference-map currency, image distortion, point placement and model choice affect interpretation. Let the volunteer compare candidates with opacity, swipe or synchronized panes and inspect which points drive the visible fit. Provide no parcel ownership, boundary, legal or engineering conclusions.

### P4 — Working data

Retain immutable originals, saved GCPs, assumptions, transform settings, selected candidate and provenance. Store a versioned project manifest with source fingerprints; GCP pixel coordinates and target coordinates/CRS; explicit axis mapping and pixel-coordinate convention; model and parameters; active/excluded state; resampling; selected candidate; reference provider/attribution; software/backend version; and review notes. Save view state so reopening restores the chosen scan, candidate and comparison position. Reopening must not upload scans or silently fetch replacement data. A configured online map may need a network and can change; say so in the project and preserve a local user-supplied raster option.

### P5 — Components

Choose GDAL as the leading candidate for TIFF/JPEG raster access, georeferencing transforms and derived-raster output. Pin and package a current tested GDAL build; as of this research, GDAL 3.13.3 is the current published release, while v3.11.1 is the first verified release carrying the researched homography diagnostic fix. GDAL is MIT licensed; packaging still needs a platform-by-platform spike because upstream provides source/containers and points users to third-party platform builds. Read only the current view window or an appropriate overview for previews; set explicit memory limits and keep full-resolution output generation separate from the interactive preview. [GDAL download and maintenance information](https://gdal.org/en/stable/download.html), [RasterIO implementation guide](https://github.com/OSGeo/gdal/blob/c8b4c45fca87d3e6fbf80e7a7898b8a661ad0edc/doc/source/tutorials/raster_api_tut.rst)

The map viewer/UI remains a product choice. The MapLibre swipe behavior is useful inspiration but its README describes a GL JS plugin, not a native desktop component. A custom viewer over GDAL windows is the leading option; assess a QGIS-based workflow if custom UI packaging exceeds the MVP budget. Do not claim a viewer or backend has been built.

### P6 — Output and validation

Export a portable alignment package by default containing a versioned JSON manifest, a CSV GCP/residual table, provenance/attribution and a concise uncertainty README. Make the derived GeoTIFF optional and clearly marked as a derivative. Include source fingerprint, GCPs including excluded points, selected model and parameters, CRS and axis mapping, pixel convention, residual definitions, resampling, GDAL version, reference-map attribution and generation time. Do not include original scans or third-party tile caches unless the user explicitly opts in and has rights.

Proposed validation, none executed here:

1. Coordinate interpretation: synthetic TIFFs with known transforms; verify pixel/line convention, axis order, degree versus projected units, CRS selection, and half-pixel edges. Include unknown/missing CRS and refuse silent assumptions.
2. Transform behavior: exact and overdetermined Helmert/affine cases; excluded points; collinear/clustered points; error states; ensure explicit backend method matches the UI and no GCP-count default leaks through.
3. History-informed negative case: if a future build includes homography, replay a redacted synthetic invalid quadrilateral matching the GDAL regression class; ensure the failure reaches the user and no blank/stale raster is shown. The GDAL upstream test itself only establishes diagnostic behavior for that case.
4. Persistence: save/reopen after adding, excluding and moving points; compare all GCPs, chosen candidate, CRS/axis metadata, provenance and view state; test missing/changed scan relinking with no source rewrite or upload.
5. Numerical reproducibility: rerun the same project on the same pinned backend and compare transform parameters/residuals within a stated tolerance. Compare exports across backend upgrades and report version differences; do not require byte-identical raster output without evidence that is achievable.
6. Orientation and export: fixture TIFF/JPEG orientation variants and test displayed versus source pixel coordinates; export and reopen GeoTIFF metadata/CRS, compare dimensions and sampled values; retain a copy of the original byte-for-byte.
7. Large images: representative large TIFF/JPEGs plus twenty-source project; set measurable RAM, open, pan/zoom and export-time budgets on target laptops; confirm viewport reads/overviews respect the budgets.
8. Reference service behavior: test attribution visibility, provider terms, request identification/caching and offline failure for the chosen provider. Do not prefetch tiles from providers that prohibit it; test the local-raster path independently.

## Decision and uncertainty register

| Topic | Disposition |
|---|---|
| P1 input set | Retain; add local fingerprints, richer visible metadata and provider licensing/attribution. QGIS workflow supports metadata/GCP review; no scan sample was inspected. |
| P2 models and candidate handling | Retain selection, residual review and multiple candidates; clarify GCP schema and explicit model dispatch. Choose Helmert and affine for initial MVP; defer TPS/projective until a pilot. GDAL’s count-based fallback makes an explicit method a necessary correction to P5. |
| P3 uncertainty | Retain the explicit ban on cadastral and engineering conclusions; define residual labels/units and comparative presentation. Fit residuals are not an independent accuracy estimate. |
| P4 persistence/privacy | Retain immutable scans and reproducible saved review state; add versioning, fingerprint/relink, axis/pixel conventions and remote-source limitations. |
| P5 backend/viewing | Recommend a GDAL 3.13.3 packaging spike as next decision evidence; viewer and QGIS-versus-custom UI remain product choices. Pinned code does not prove Rust or desktop integration cost. |
| P6 outputs/checks | Retain export plus optional raster and all five named check categories; expand to concrete fixtures and budgets. No check is reported as executed. |

Already-covered findings: P1’s twenty-file cap, source provenance, dimensions and stated CRS are already explicit in Frozen plan P1; keep them. P2 already asks for user-selected transforms, residual inspection and multiple candidate alignments; keep these with clearer records. P3 already states uncertainty scope and forbids ownership/engineering conclusions; keep verbatim in intent. P4 already protects originals and requires saved assumptions/provenance and reopen without downloading private data; strengthen remote-source behavior. P6 already names coordinate interpretation, reopen, reproducibility, orientation and large scans; preserve all five.

Rejected/limited leads: the MapLibre compare plugin solves the swipe interaction only, not georeferencing, and is browser/GL JS code rather than a selected desktop dependency. MapWarper provides hosted upload/rectification but is outside the no-private-upload boundary. OSM standard tiles are one example of a service with no offline/prefetch permission; do not generalize this rule to other providers. TPS/projective methods are deferred because the available evidence documents fit/deformation risks but does not establish a need for this town’s scans. A pure-image library, a particular GUI toolkit and an actual reference provider were not investigated enough to recommend.

Unresolved product decisions: whether representative scans require projective correction; whether the chosen “map service” must work offline; whether to use a QGIS-based workflow or custom viewer; packaging and licensing for GDAL on target OSes; residual metric labels/tolerances; export inclusion of source assets; and what scan sizes define “bounded on a laptop.” Resolve these using synthetic fixtures and authorized sample data, not assumptions.

## O5 — independent critic reserved

No same-family critic has reviewed this draft yet. I have not invented criticism or a disposition. The coordinator’s fresh critic must independently recheck the exact GDAL code/release path, the issue-to-fix-to-test-to-release chain, every P1–P6 comparison, source limits and the full brief, then revise this artifact or append substantive criticisms with dispositions. This draft must not be represented as critique-complete.

## Executed versus proposed checks

Executed witness: public documentation opened and immutable code/test/release bytes captured at the commits named in source-map.json. That establishes what those captured sources contain and the stated release applicability. It is not an executed GDAL test, performance trial, raster calculation, packaging build or app validation. The eight validations above are proposals only.
