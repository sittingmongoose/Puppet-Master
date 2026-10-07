# D-M03-B independent source/science review

X: **supported core with qualification required**. Y: **consequential scientific errors present**. Both recommend the correct `from_crs(..., always_xy=True)` and geographic degree-input/FORWARD call. Neither receives an unrestricted scientific PASS. These are independent semantic conclusions, with no ranking, lifecycle or provenance inference.

Both finals are complete files. All eight frozen candidate artifacts, both pinned source files, brief and manifest were read. All ten supplied hashes match; the two tagged remote source files also match their frozen hashes. X has 754 whitespace words and eight findings; Y has 988 words and eight findings. All six brief obligations were assessed for each label.

X has 19 applicable scientific claim groups assessed, zero unassessed; Y has 20 assessed, zero unassessed. Including process assertions, total applicable claim groups are X: 21 (19 assessed / 2 unassessed), Y: 23 (20 assessed / 3 unassessed). Two X and three Y candidate-process groups remain **UNASSESSED**. Four empirical runtime groups remain **UNASSESSED** for both. Assessed coverage does not mean an obligation was satisfied or a runtime proposal executed.

## Material semantic findings

- **X P2 needs qualification.** “Only one sane” is ambiguous for a four-way encoding/flag test: degree input with `radians=False` and converted radian input with `radians=True` are both correct. Mismatched encoding can also yield finite plausible coordinates. If it means one matching flag per fixed encoding, that condition is missing. X also leaves projected/angular unit scope and AOI/error-versus-validation limits incomplete. Its explicit two-file CRS-metadata uncertainty is honest, not a fabricated fact. [Frozen angular contract](https://raw.githubusercontent.com/pyproj4/pyproj/3.6.1/pyproj/transformer.py) L759–763 and L1223–1225; evidence E3/E4/E6.

- **Y finding 4 is wrong about projected units.** The final L59–64 and required intermediates 1–3 add “else degrees” after the geographic-output condition. `radians` governs geographic angular coordinates; EPSG:3857 output remains projected metres. The authentic source’s angular qualifier does not convert non-geographic output to degrees. [Released Cython implementation](https://raw.githubusercontent.com/pyproj4/pyproj/3.6.1/pyproj/_transformer.pyx) L704–743/L799–828; [PROJ axis metadata](https://raw.githubusercontent.com/OSGeo/PROJ/9.3.0/data/sql/axis.sql) L158–159 links both 3857 axes to metre unit EPSG:9001.

- **Y’s axis-check prediction is false.** Final L114–115 and intermediate-3 L40 say only `True+(lon,lat)` matches. `False+(lat,lon)` matches too because EPSG:4326 has latitude then longitude as its native order. For the source-documented example location (2°,49°), both correctly ordered combinations analytically give `(222638.98158654713, 6274861.394006575)` metres. This was reviewer-authored arithmetic, **not an executed pyproj witness**. [Released CRS-to-CRS contract](https://raw.githubusercontent.com/OSGeo/PROJ/9.3.0/docs/source/development/reference/functions.rst) L126–131 and [Web Mercator equations](https://raw.githubusercontent.com/OSGeo/PROJ/9.3.0/docs/source/operations/projections/webmerc.rst) L69–90.

- **Two Y intermediate claims exceed their evidence.** Intermediate-3 E4/L32 drops the **geographic destination** condition on the `right < left` antimeridian polygon rule; forward EPSG:3857 has a projected destination. E5/L36 says an identity example confirms order sensitivity; an identity transform preserving its tuple does not discriminate axis semantics. These remain defects in required material even though the final does not repeat the identity inference. [Frozen implementation/docstrings](https://raw.githubusercontent.com/pyproj4/pyproj/3.6.1/pyproj/transformer.py) L1009–1010 and L812–815.

Both correctly state that a successful city example cannot establish the general axis/unit/error/edge/operation/environment contract. Both explain selection and reported-error handling, but neither explicitly completes the distinction between AOI selection guidance, CRS area metadata, mathematical projection domain and application validation. For example, the formula at latitude 86° is finite although the released EPSG:3857 area is bounded by ±85.06°. This calculation does not claim an observed runtime result. No exact numeric cutoff or empirical test was required merely to acknowledge the distinction. [Released extent](https://raw.githubusercontent.com/OSGeo/PROJ/9.3.0/data/sql/extent.sql) L2523; [area selection contract](https://raw.githubusercontent.com/OSGeo/PROJ/9.3.0/docs/source/development/reference/functions.rst) L145–153/L242–257.

## Brief obligations

| Obligation | X disposition | Y disposition | Claim groups |
|---|---|---|---|
| O1: Trace from_crs configuration into creation and transform use | SATISFIED | SATISFIED | G01, G02 |
| O2: Bind caller input order separately from native CRS axes | SATISFIED_CONDITIONAL | SATISFIED_CONDITIONAL | G03, G12 |
| O3: Meaning and limits of always_xy | SATISFIED | SATISFIED | G04, G05 |
| O4: Radians and output unit domains | PARTIAL_DOMAIN_QUALIFICATION | CONSEQUENTIAL_ERROR | G06, G07, G13 |
| O5: Area-of-use and invalid-input/error handling limits | PARTIAL_LIMIT_EXPLANATION | PARTIAL_LIMIT_EXPLANATION | G08, G09, G10, G14 |
| O6: Boundary checks and dependency/environment uncertainty | PARTIAL_CHECK_QUALIFICATION | PARTIAL_WITH_INCORRECT_CHECKS | G11, G12, G13, G14, G15, G16 |

## Grouped claim coverage

Each row includes the consequential claims in the final and its required intermediates. Full independent per-label assessments, exact artifact locations and source ranges are in `REVIEW.json`; these compact rows avoid repeating the source catalog.

| Group | Scope | X | Y | Evidence |
|---|---|---|---|---|
| G01 | Required EPSG:4326 to EPSG:3857 lon/lat-degree constructor and call contract | SUPPORTED | SUPPORTED | E1, E2, E3 |
| G02 | Construction, maker/thread-local and scalar/array consuming-call trace; signatures | SUPPORTED_WITH_BOUNDARY | SUPPORTED | E1 |
| G03 | Caller order separated from native CRS axes; default behavior and frozen metadata gap | SUPPORTED_CONDITIONAL | SUPPORTED_CONDITIONAL | E2 |
| G04 | always_xy meaning, both endpoints, default False, geographic/projected scope and limitations | SUPPORTED | SUPPORTED | E2, E3, E5 |
| G05 | itransform switch is separate; deprecated from_proj/module paths | SUPPORTED | SUPPORTED | E9 |
| G06 | Radians: angular inputs/outputs versus linear projected domains; pipeline and worked examples | NEEDS_QUALIFICATION | CONTRADICTED | E3, E4 |
| G07 | EPSG:3857 output units, geocentric/metre text and introspection claims | SUPPORTED_UNCERTAINTY_WITH_INCOMPLETE_DOMAIN | SUPPORTED_GAP_BUT_INCONSISTENT | E3, E4 |
| G08 | AOI, authority, accuracy, ballpark, force_over, only_best, environment/ini and version gates | SUPPORTED | SUPPORTED | E5 |
| G09 | Candidate ordering, available/unavailable operations, accuracy/area/use and operation/network introspection | SUPPORTED_WITH_OBJECT_QUALIFICATION | SUPPORTED_WITH_SCOPE_QUALIFICATION | E5 |
| G10 | Area-of-use and invalid-input/error handling limits, including structural validation | PARTIAL_LIMIT_EXPLANATION | PARTIAL_LIMIT_EXPLANATION | E5, E6 |
| G11 | Single-city success, source examples and unsupported extrapolation | SUPPORTED | SUPPORTED_MAIN_ARGUMENT | E2, E7 |
| G12 | Axis-pair proposed check and its prediction | SUPPORTED_PROPOSAL | CONTRADICTED_PREDICTION | E2, E7 |
| G13 | Unit-confusion proposed check and its prediction | AMBIGUOUS_OR_OVERSTRONG_PREDICTION | SUPPORTED_PROPOSAL | E3, E7 |
| G14 | Proposed invalid-input errcheck comparison | SUPPORTED_CONDITIONAL_PROPOSAL | SUPPORTED_CONDITIONAL_PROPOSAL | E2, E6 |
| G15 | Bounds, densification, antimeridian and geographic-destination governing condition | SUPPORTED_PROPOSAL_WITH_SCOPE | CONDITION_DROPPED_IN_REQUIRED_INTERMEDIATE | E8 |
| G16 | Optional checks and dependency/environment uncertainty | SUPPORTED_PROPOSALS_AND_UNCERTAINTY | SUPPORTED_WITH_WORDING_LIMIT | E1, E4, E5, E6, E7 |
| G17 | Semantic preservation, accepted/amended/rejected/unresolved dispositions | PRESERVED_WITH_DEFICIENCIES | PRESERVED_BUT_ERRORS_PROPAGATED | E1, E2, E3, E4, E9, E10 |
| G18 | Source IDs, release/capture claims, cited ranges and apparent verification assurances | INTEGRITY_CONFIRMED_CONTENT_ONLY | INTEGRITY_CONFIRMED_WITH_SEMANTIC_MISREADS | E1, E2, E3, E4, E5, E6, E8, E10 |
| G19 | Bounded recommendation, six-obligation coverage, eight findings and soft word limit | COMPLETE_ARTIFACT_WITH_PARTIAL_OBLIGATIONS | COMPLETE_ARTIFACT_WITH_SCIENTIFIC_ERRORS | E10 |
| G20 | Identity example claimed to confirm order sensitivity | NOT_ASSERTED | UNSUPPORTED_INFERENCE | E7 |

Evidence key (source IDs refer to the exact hashed captures in the JSON):

- **E1**: projcode:99-115,325-359,553-637,716-726,818-860; pyx:525-584,636-654.
- **E2**: projdoc:14-20; projcode:179-182,525-528,583-586,1230-1233,1302-1305; proj-functions:119-153; proj-geodetic-crs:523; proj-axis:263-264; proj-c-api:9040-9050.
- **E3**: projcode:759-763,791-811,888-892,1046-1048,1223-1225,1295-1297; pyx:704-743,799-828.
- **E4**: proj-projected-crs:3655; proj-axis:158-159; proj-unit:20; projcode:473-503,1241-1244; proj-fwd:139-149.
- **E5**: projcode:146-152,156-219,221-297,389-406,432-471,587-618; pyx:280-345; proj-functions:145-153,193-223,242-266.
- **E6**: projcode:764-766,893-895,953-986,1049-1051,1226-1229; pyx:697-698,723-732,808-819; proj-fwd:40-85; proj-projected-crs:3656; proj-extent:2523.
- **E7**: projcode:778-815,905-948,1323-1325; analytic-counterexamples (reviewer arithmetic, not pyproj execution).
- **E8**: projcode:990-1069, especially geographic-destination antecedent at 1009-1010.
- **E9**: projcode:514,545-550,1210-1211,1256-1258,1274-1275,1337-1339; switch at 883-885,978-986; pyx:886-914.
- **E10**: All exact artifacts and input hashes below; measured final word counts X=754/Y=988; X intermediate-2 embedded final equals frozen X final after stripping section-delimiting whitespace.

## Preservation and uncertainty

X preserves its core contract, explicit metadata/dependency uncertainty and P1–P8; its intermediate-2 embedded final matches the frozen final after section-delimiting whitespace is stripped. The intermediate-1 geographic qualifier on degrees is weakened in the final, and P2’s ambiguity persists. Y preserves the valid constructor/deprecation/radian-input/switch distinctions and uncertainty; its unit and unique-correct-axis mistakes survive into final. Dropping an intermediate claim from final does not prove it was scientifically corrected.

It is legitimate to say the supplied two files omit native EPSG axis/3857 unit registry records. Reviewer supplemental released data establishes native 4326 latitude/longitude and 3857 easting/northing metres. That source-level resolution certifies neither the installed binaries nor any candidate’s environment. Optional group/introspection/round-trip/bounds/environment checks are supported as proposals subject to the qualifications above; a round trip alone is not an independent label/unit oracle.

## Executed checks and unassessed scope

Executed by this reviewer: exact-file SHA-256 checks; full frozen corpus/artifact reads; 17 bounded direct primary fetch attempts (16 captures, including two remote frozen-file reproductions, and one `usage.sql` 404); release implementation/SQL text inspection; independent standard-library arithmetic for axis/unit/domain counterexamples; word counts and internal embedded-final comparison. No downloaded/project/candidate code or SQL was executed. No installations, delegates, Goal engineering, candidate edits or feedback were performed.

The browser opened a tagged raw Cython representation but exact evidence uses directly fetched raw bytes; two rendered PROJ 9.3 pages returned Internal Error. Released-tag raw files provided the needed sources. Additional capture URLs, versions, hashes, actual capture timestamps, reviewed ranges and limitations are recorded in the JSON. The analytic evidence is retained under `reviewer-source-checks/analytic-counterexamples.json`.

**UNASSESSED process groups:** P01 candidate historical source reads/hash checks/no-execution/no-install/export assertions; P02 predecessor-only locator/reverification and forbidden-access assertions; P03 Y’s inline stage timing/native Goal completion/readback assertions. Artifacts assert these histories but do not independently establish them. External export paths, `timings.json` and lifecycle/state files were not read. Parent evaluates lifecycle.

**UNASSESSED runtime groups:** U01 installed-version coordinate/unit/inverse/array behavior; U02 invalid/NaN/infinity/mixed-batch/pole exceptions; U03 actual operation/grids/network/defaults; U04 actual bounds/wrapping/densification. Candidate X describes static hash/read operations and P1–P8 as proposals; Y describes static reads and an empty runtime-check set. No candidate runtime success is inferred from either description.

## Integrity, blinding and timing

The user’s quiet/held/frozen temporal gate was accepted as the prerequisite and not independently lifecycle-verified. Method blinding is limited: X authorized text explicitly says `control`/`normal_retrieval-v2`; Y says `treatment`/`navigate`/`focused_read`/`expand`/`finalize` and includes a Goal statement. No identity map, winner/economics/metrics/other grades/parent analysis, other cases or reviews were read. No winner, rank, cost, method-win, lifecycle or provenance conclusion is made.

Finite allowance: preparation **2026-10-07T20:00:01.435065+00:00**, ceiling **2026-10-07T20:20:01.435065+00:00**. First observed check **20:00:10.933682+00:00**; initial complete reports saved **2026-10-07T20:07:47.688604+00:00**. Final validation and report completion: **2026-10-07T20:09:54.027488+00:00** (592.592 seconds after the original preparation). JSON/evidence references, coverage arithmetic and frozen hashes all passed the final check; completed before the original ceiling. No clock reset; usage is `null`.

## Exact reviewed hashes

| Artifact | SHA-256 |
|---|---|
| X/final.md | `c6a0a9bb5bdb2ddc2bbc264199c1256b87d22349d35ebfcdbd5657858a469e0f` |
| X/intermediate-1.md | `efbc663b19492bec983184b5c09e619d771458760bd01d9852b5b2d888a9451a` |
| X/intermediate-2.md | `192e2574880aaa665f52740ee2b96435be590d9111ba1efc9cf6d1699f4438ec` |
| Y/final.md | `cdf6c9e9b93a950e7f09fa481937279d3f7f014257013be88988029bed49d1a6` |
| Y/intermediate-1.md | `d7d434be06608c199766a0a7943e4dc6a506d31fb4c96d231a1ad8254a45198f` |
| Y/intermediate-2.md | `5493bc03b12527a8c2e2d42789924235d88779183a2d433b2cc03b50d5cefc7a` |
| Y/intermediate-3.md | `154d2c4198e0555628dbc59fc283cabccd47c9799598f2fadc4c6fb47459bb6e` |
| Y/intermediate-4.md | `ceca68c3428c61e6c4036f59aa4a4fc3dc1473e5f688d1d60fefa0a9ad16b142` |
| projdoc | `261a0a3602984e91ed13179990c535bf19a4e841302554ee4fad25b77e4ade51` |
| projcode | `f5f8a43cb7030e5d0462121a54414be74504586dbb1d32d4c37857f1de9dabda` |
| brief.md | `f2883527565efec006d62f4066c9578f01339eb35bbb4fcf21b6c53360230c60` |
| sources.json | `73f74502cba5442210467e83f98a2edc08d5492161c654b574ccf8ab52030cd6` |
