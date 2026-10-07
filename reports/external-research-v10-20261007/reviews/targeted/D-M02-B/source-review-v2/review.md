**D-M02-B — independent frozen source/science review**

X final: **SUPPORTED WITH STATED CONDITIONS**. Its integer in-bounds crop and crop-based output affine are scientifically sound. The required intermediate set has a material false fractional-rounding assertion in X2 and a missing explicit edge guard; X3 and the final correct them. This is qualified support for the artifact set, not an unqualified PASS.

Y final and byte-identical intermediate: **SUPPORTED WITH STATED CONDITIONS AND A MINOR WORDING LIMIT**. The bounded recommendation is complete and supported. Its categorical interpolation wording is too absolute if interpreted as guaranteeing invalid class values for every input; the conditional nearest recommendation remains sound. This is a wording limit, not a demonstrated material scientific error.

Coverage per label: **6/6 material obligations and 14/14 consequential content groups assessed; scientific UNASSESSED = 0**. One process-history group per label remains **UNVERIFIED**. Both finals are complete, with no mapped artifact limitation. All six mapped candidate files, the brief, manifest and three frozen source files were fully read. No candidate edit, rescue, feedback, new candidate, identity map, other review/case, supervisor or lifecycle file was used.

The temporal gate is the user’s supplied frozen/quiet authorization. This review makes no lifecycle, provenance, winner, rank, cost or method-win inference.

**Brief obligations**

| Obligation | X disposition | Y disposition | Primary/check basis |
|---|---|---|---|
| O1: Q1 pixel window and crop transform | Satisfied in final/X1/X3; X2 lacks an explicit edge guard (C11). | Satisfied under explicit integer/nonempty/in-bounds condition. | W:13-29,129-164; T:83-98,343-362 |
| O2: Q2 smaller shape and output affine | Satisfied in final; X2 fractional natural-shape assertion is false and later corrected (C11). | Satisfied; correctly labeled affine inference. | R:18-48; I:438-485,587-629; A1 |
| O3: Logical pixels versus physical I/O | Satisfied; no unqualified byte/performance claim. | Satisfied; layout and measurements required for physical cost. | W:57-66,188-251; B:510-532,907-929 |
| O4: Cropped versus resampled coordinates | Satisfied; full affine and corner/center distinction. | Satisfied; full affine and corner/center distinction. | G:9-38; T:343-362; A1 |
| O5: Categorical versus continuous resampling | Satisfied conditionally; mode means most frequent, not strict majority. | Satisfied conditionally; interpolation wording has a minor universal-reading limit. | R:53-68; E:53-107; A2 |
| O6: Fixtures and layout/class-label uncertainty | Satisfied as proposed fixtures with explicit unknowns, not executed outcomes. | Satisfied as proposed fixtures with explicit unknowns, not executed outcomes. | W/R/G/E; proposal assessment, not runtime certification |

**Grouped consequential claims — X**

Artifact aliases: XF = frozen/X/final.md; X1–X3 = its intermediate-1.md through intermediate-3.md. Source ranges below are one-based raw-file lines.

| Group | Disposition and scope | Artifact evidence | Primary/check evidence |
|---|---|---|---|
| C01: Q1 pixel windows, matching crop transform and written dimensions | Supported; X2 edge guard later supplied. | XF:3-23; X1:7-12; X2:5-29; X3:7-19 | W:13-29,45-55,129-164; T:83-98,343-362 |
| C02: Q2 output shape, band/row/column order, resampling and crop-to-output scale | Correct independent axis scales and actual dimensions; X1 2-D shape is accepted. Its same-scale wording must not imply equal numeric factors. | XF:10-23; X1:12; X2:14-30; X3:7-19 | R:18-48; I:438-485,587-629,938-977; A1 |
| C03: Logical pixels versus physical block I/O; per-band inspection and unknown cost | Logical crop size is not physical bytes; all-band block inspection and measurement required. | XF:24; X1:13; X2:31,34,49; X3:20 | W:57-66,188-251; B:510-532,907-929 |
| C04: Crop versus resampled coordinates, rotation/skew, corner/center convention | Full affine translation/scaling and corner/center convention supported. | XF:22,25,27; X1:7,14; X2:32,47; X3:7,21 | G:9-38; T:343-362; R:44-48; A1 |
| C05: Continuous-data resamplers, default nearest and conditional numerical goals | Continuous methods are conditional candidates, with no universal choice. | XF:26; X1:15; X2:33; X3:22 | R:53-68; E:53-66 |
| C06: Categorical codes, sampled-label preservation versus prevalence, interpolation risk | Nearest code preservation is conditional and does not promise prevalence/rare-class retention. | XF:26-27; X1:15-16; X2:33,48; X3:22,31 | E:53-66; A2 |
| C07: Optional class aggregation, mode availability/meaning and uncertain ties/NoData | Optional mode is release-supported; most-frequent value need not be a strict majority. Ties/NoData remain unknown. | XF:26,32,34; X1:15-16; X2:33,43,48; X3:22,31 | E:65-66,86-107; I:57-68,134-160; A2 |
| C08: Proposed geometry fixtures, nonzero offsets, nonsymmetric affine and output footprint | Geometry fixtures are adequate proposals; no candidate runtime result certified. | XF:27(a); X1:16(a-b); X2:47; X3:23 | G:27-38; T:343-362; A1 |
| C09: Proposed numeric/class fixtures, rare classes, NoData/ties and acceptance criteria | Numeric/class, rare-label, NoData/tie and threshold proposals address scientific semantics. | XF:27(b); X1:16(c); X2:48; X3:23 | R:53-68; E:53-66; A2 |
| C10: Proposed I/O fixtures, band differences and layout/class-label uncertainty | Tiled/striped aligned/crossing/1x1 fixtures and unknown layout/labels/cost are adequately bounded. | XF:27(c),34; X1:13,16(d); X2:34,49; X3:20,23,36 | W:57-66,188-251; B:510-532,907-929 |
| C11: Effective-window guards, clipping, fractional natural shape and rounding correction | X2 round-up claim is false; explicit clipping guard also absent there. X3/final correctly repair both. | X1:11; X2:23; X3:18,29,35; XF:22,33 | I:580-620,938-977; T:392-415,709-728; A1 |
| C12: Pinned primary source identity, hashes, release selection and cited raw ranges | All frozen and four implementation hashes match primary bytes; all explicit raw line ranges appropriate. | X1:7,11,15,22-24; X2:55-58; X3:40-46; XF:38 | H1; H2 |
| C13: Accepted/amended/rejected/unresolved scientific dispositions and preservation | Scientific corrections and retained conditions supported; candidate historical actions remain P01. | X1:18; X2:38-43; X3:27-36; XF:31-34 | C01-C11; all mapped artifact text |
| C14: Complete bounded deliverable, six obligations and soft size/finding limits | Six obligations; bounded final 768 words, intermediates 767/1022/957; scientific X2 defect remains recorded. | All four mapped X files | brief:3-16; all mapped artifact text |

**Grouped consequential claims — Y**

YF/Y1 means both frozen/Y/final.md and intermediate-1.md; their exact bytes are identical. This identity is a content observation only.

| Group | Disposition and scope | Artifact evidence | Primary/check evidence |
|---|---|---|---|
| C01: Q1 pixel windows, matching crop transform and written dimensions | Supported under explicit integer, nonempty, in-bounds condition; writing metadata updates correct. | YF/Y1:5 | W:13-29,45-55,129-164; T:83-98,343-362 |
| C02: Q2 output shape, band/row/column order, resampling and crop-to-output scale | Correct crop affine and w/W, h/H scales; explicitly identified as inference, not execution. | YF/Y1:7 | R:18-48; I:438-485,587-629,938-977; A1 |
| C03: Logical pixels versus physical block I/O; per-band inspection and unknown cost | Pixels/bytes separated; source layout unknown and per-band inspection/measurements required. | YF/Y1:9,15(c) | W:57-66,188-251; B:510-532,907-929 |
| C04: Crop versus resampled coordinates, rotation/skew, corner/center convention | Full affine, rotation/skew and corner/center convention supported; no extra half-pixel shift. | YF/Y1:11,15(a-b) | G:9-38; T:343-362; R:44-48; A1 |
| C05: Continuous-data resamplers, default nearest and conditional numerical goals | Continuous interpolation/average remain conditional scientific candidates. | YF/Y1:13 | R:53-68; E:53-66 |
| C06: Categorical codes, sampled-label preservation versus prevalence, interpolation risk | Nearest guidance sound. Interpolation “would create” invalid codes is overbroad if read universally; it can, but need not on every input. | YF/Y1:13 | E:53-66; A2 |
| C07: Optional class aggregation, mode availability/meaning and uncertain ties/NoData | Optional majority/other aggregation is deferred until semantics, API, ties and NoData checks; no API availability result claimed. | YF/Y1:13,15(d) | E:65-66,86-107; I:57-68,134-160; A2 |
| C08: Proposed geometry fixtures, nonzero offsets, nonsymmetric affine and output footprint | Discriminating 1024x1024 non-origin/skew and noninteger scaling fixture proposals. | YF/Y1:15(a-b) | G:27-38; T:343-362; A1 |
| C09: Proposed numeric/class fixtures, rare classes, NoData/ties and acceptance criteria | Continuous/class and NoData/aggregation-rule proposals adequate; no retention outcome claimed. | YF/Y1:13,15(d) | R:53-68; E:53-66; A2 |
| C10: Proposed I/O fixtures, band differences and layout/class-label uncertainty | Tiled crossing/1x1, conditional unchunked fixture, all-band layout and physical counter proposals adequate. | YF/Y1:9,15(c-d) | W:57-66,188-251; B:510-532,907-929 |
| C11: Effective-window guards, clipping, fractional natural shape and rounding correction | Explicit edge/fractional scope restriction prevents the ordinary-window misregistration case. | YF/Y1:5,7 | I:580-620,938-977; T:392-415,709-728; A1 |
| C12: Pinned primary source identity, hashes, release selection and cited raw ranges | Three primary source hashes and every numbered raw citation range verified; category advice is semantic inference. | YF/Y1:5-13,21 | H1; H2 |
| C13: Accepted/amended/rejected/unresolved scientific dispositions and preservation | Scientific dispositions supported; process assertions remain P01. | YF/Y1:5-15 | C01-C11; all mapped artifact text |
| C14: Complete bounded deliverable, six obligations and soft size/finding limits | Complete bounded 736-word six-finding answer; intermediate byte-identical and fully assessed. | YF/Y1:1-21 | brief:3-16; all mapped artifact text |

**Consequential qualifications**

X2:23 says Rasterio 1.3.10 rounds fractional natural window lengths up. The released read calls `round_lengths()` at I:597; T:709–728 uses `floor(x + 0.5)`. The nearby I:580–582 comment disagrees with the implementation. Length 16.2 gives 16 rather than ceiling 17. X3:29 and XF:33 correctly reject the predecessor assertion. X2’s integer-window path also lacks an explicit in-bounds/effective-window guard: a negative requested column offset is clipped on a non-boundless read, so transforming the original requested window misregisters it. X1/X3/final supply that condition. [Released read source](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/_io.pyx), [released window source](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/windows.py).

For X’s optional mode lead, E:65–66 and 101–107 establish most-frequent sampled-value selection and enum availability; I:57–68 permits mode for reads. “Majority” is loose terminology: 3/7 can be the most frequent class without exceeding 50%, and no area-majority, tie, NoData or rare-label guarantee follows. The output’s conditional semantics and proposed checks keep the lead bounded. [Released enum](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/enums.py).

Y’s category advice is scientific inference, beyond the supplied resampling document’s continuous-data guidance. Interpolation can yield code 5 from codes 1 and 9; a constant class field may remain unchanged, and output dtype can round interpolated values. Thus “can invent codes or mix nominal semantics” is supported; a universal promise that every interpolation creates a new invalid code is not. Both recommendations correctly make the label-retention versus prevalence goal conditional.

**Actually executed reviewer checks**

- H1: SHA-256 inventory and full direct reading of the 11 mapped files, starting 20:43:23 UTC and complete by the 20:44:35 UTC clock checkpoint. All six candidate artifact hashes and three frozen source hashes match the supplied expectations. Brief/manifest hashes were first computed here and verified stable on reread.
- H2: seven independent raw primary fetches at 20:44:03.041–20:44:03.316 UTC. Three network captures are byte-identical to the frozen sources; four extra released implementation digests match X’s reported digests. All explicit numerical citation ranges were inspected against raw bytes; final integrity/word-count assertions ran at 20:45:59 UTC. Web-reader line numbering differs from raw numbering and was not used for citation adjudication.
- A1/A2: own isolated Python standard-library exact-rational arithmetic at 20:45:18.759–20:45:18.760 UTC; no Rasterio/GDAL or downloaded project code. A skewed affine `(3, 1/2, 100, -1/4, -2, 200)`, window `(17,23,91,67)`, and output `(11 rows,13 columns)` preserve all four outer corners and the tested first/last pixel centers with independent axis scales. Wrong full-source/unscaled-crop transforms and a clipped-origin mismatch are counterexamples. Fractional rounding, class-code interpolation and mode/plurality arithmetic also passed. These are arithmetic results, not service/runtime or candidate witnesses.

The governing affine relation is `T_out(p) = T_source((col_off,row_off) + diag(window_width/output_width, window_height/output_height) p)`. This proves the crop footprint relationship under the stated effective-window/grid conditions.

Not executed or certified: Rasterio/GDAL imports, downloaded code, raster reads/writes, any candidate code or candidate witness, raster fixtures, physical-byte/performance measurements or deployment-specific NoData/ties. The candidates describe their fixtures as proposals; suitability was assessed and no runtime result is inferred.

**Exact reviewed artifact hashes**

Inputs are under the authorized case inputs directory; X/Y artifacts under this review directory’s frozen/ tree. Full absolute paths and byte/line/word counts are in REVIEW.json.

| Artifact | SHA-256 |
|---|---|
| [inputs/brief.md](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M02-B/inputs/brief.md) | `e07ea001f30f1aaba839bfcfe14939a85e4c2a0814472579b395e03469e1e5b3` |
| [inputs/sources.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M02-B/inputs/sources.json) | `779a28bf9ec6e4aba05abb84a9288f78603f94caa6534d9645050599f78ad543` |
| [inputs/sources/rasterwindow.rst](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M02-B/inputs/sources/rasterwindow.rst) | `4056fb30d030bf9df614ec8bc927cf83ffb2d4abe33471cf1622ad0d913ca0d1` |
| [inputs/sources/rasterresample.rst](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M02-B/inputs/sources/rasterresample.rst) | `2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727` |
| [inputs/sources/geotransform.rst](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M02-B/inputs/sources/geotransform.rst) | `5b9c3093776741a5b00f3bef76aa7515f021e4ddc62f87f8326f6e6d1c1a33cc` |
| [X/final.md](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted/D-M02-B/source-review-v2/frozen/X/final.md) | `85067b2d8c885c86f3fd1314a3cb00a8341e09baf4e6cdf03cf1cb3f0d82949c` |
| [X/intermediate-1.md](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted/D-M02-B/source-review-v2/frozen/X/intermediate-1.md) | `f2dad9fb43d90bff299fb5927fb91052e8f3e8fe810d5f3f9296df151e1b4ec9` |
| [X/intermediate-2.md](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted/D-M02-B/source-review-v2/frozen/X/intermediate-2.md) | `ba9f3117294e3127537ee74aba1cbc4aed9ff8c863b04203345c273130f07489` |
| [X/intermediate-3.md](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted/D-M02-B/source-review-v2/frozen/X/intermediate-3.md) | `08ef9a444ce907620c01d7106e824b89c732ca0bb8aeb249ac9af4adbe0e4b77` |
| [Y/final.md](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted/D-M02-B/source-review-v2/frozen/Y/final.md) | `ce98f0d3f37b6e195f440f8dbae2bd00448d6385a3730c91758be1dc67629956` |
| [Y/intermediate-1.md](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted/D-M02-B/source-review-v2/frozen/Y/intermediate-1.md) | `ce98f0d3f37b6e195f440f8dbae2bd00448d6385a3730c91758be1dc67629956` |

**Primary source identities and independent fetches**

Frozen sources: Rasterio 1.3.10 W/R and GDAL 3.9.0 G, supplied capture date 2026-10-07. Additional I/T/E/B sources are released Rasterio tag 1.3.10. All reviewer network checks returned HTTP 200; no source code was executed.

| Alias | Primary URL | Independently checked SHA-256 |
|---|---|---|
| W | [windowed-rw.rst](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/windowed-rw.rst) | `4056fb30d030bf9df614ec8bc927cf83ffb2d4abe33471cf1622ad0d913ca0d1` |
| R | [resampling.rst](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst) | `2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727` |
| G | [geotransforms_tut.rst](https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/tutorials/geotransforms_tut.rst) | `5b9c3093776741a5b00f3bef76aa7515f021e4ddc62f87f8326f6e6d1c1a33cc` |
| I | [_io.pyx](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/_io.pyx) | `1d06b63aff8f2dbc961ec8c431998d11beb3d1ce805018296177248aaa7ff190` |
| T | [windows.py](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/windows.py) | `91659f9becc7a61cf29109f29d2388507c5df916c88ecccc5462d3864c6518d3` |
| E | [enums.py](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/enums.py) | `4ed7dcb46b145673887b45815267fd88b9335700147ecc7d9061f7669a7e8f7b` |
| B | [_base.pyx](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/_base.pyx) | `432cfcf812e2b1b5c5a154bb615f7fb45c5f5708799520fe2f578a5c038cb12f` |

Source integrity is verified at the byte/version/cited-range level. Hash equality does not prove candidate acquisition times, reading, hash-check execution or stage-manifest preservation. The referenced candidate sources/manifest.json and dispatch maps were not opened. Source capture dates are supplied metadata, not an independently reconstructed timeline. GDAL 3.9.0 tutorial identity does not establish the service’s installed GDAL build.

**Process-history group P01 — explicitly unverified**

X: XF:38–40; X1:3,18,22–24; X2:38,51,58; X3:5,40,46,48. Reading/fetching/hashing, predecessor availability and dispatch-map checks, source capture times and local preservation, and declarations of no code/fixture execution remain unverified historical assertions.

Y: YF/Y1:19–21. Reading/hashing, no-draft/no-additional-source assertions and declarations of no code/fixture execution likewise remain unverified. The reviewer’s independent matching digests validate scientific bytes, not these histories.

**Remaining uncertainty and blinding limits**

Scientific UNASSESSED scope: none within the complete supplied artifacts and brief. Actual block layout, per-band differences, compression/cache/overview/storage effects, class labels and meaning, target dimensions/tolerances, intended plurality/area aggregation, installed GDAL and deployed NoData/ties remain unknown deployment inputs. Runtime validation beyond the bounded path is still proposed. These are stated conditions, not omitted review scope.

Visible method clues limit blinding: X names control, Q1/Q2 and join/predecessor reconciliation; Y names treatment. Relative source paths and extra-source references also reveal method structure. No identity map, other grades, winner/economics/target metrics or parent analysis were read; no ranking or lifecycle/provenance conclusion is made.

Allowance began at 2026-10-07T20:43:05.283110+00:00; hard ceiling 2026-10-07T21:03:05.283110+00:00. Assessment JSON was written at 2026-10-07T20:48:19.794576+00:00; readable report writing and final validation timestamps are recorded in REVIEW.json. Deadline was not exhausted. Reviewer token/cost usage is unknown (`null`).

Final consistency checks completed at 2026-10-07T20:52:10.900161+00:00, 545.617 seconds after the original allowance start; temporary reviewer source/check files were removed. An initial table-count check matched prose cells; an anchored row-count check corrected it and all validations passed. Scientific coverage remains complete and process-history assertions remain unverified.
