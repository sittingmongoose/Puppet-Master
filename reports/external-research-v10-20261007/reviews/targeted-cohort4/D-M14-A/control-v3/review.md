# Independent source/science review — D-M14-A

**Status: FAIL; full declared scope assessed.** Two material conditions are missing from the nearest and dataset-mask recommendations. The rest of the material claims, optional lead, proposals and authored-view traceability were checked; no declared-scope remainder is unassessed. This is an advisory scientific review, with no cost or winner judgment.

The final SHA-256 was verified before assessment and rechecked before writing: `0ea2d5d5a4088d56ec4bc077be287fc10761be587e68a064e6f7a93b8d9ae14c`. The required report matches `b3f3f375924d4c349e27de44aef0bb71d089ea19de61310104a76f4937950ec7`. All six mapped primary captures independently byte-match their official tagged raw URLs. The finding is based on source content and call paths, not hashes alone.

The permitted authored set contains final.md and report.md; there are no mapped capture indices or additional semantic/projection files. Every line of both views was reviewed. All six M-items resolve to E1–E6 and their S1–S6 source bindings. Shorter final wording retains the integer-factor area condition and unchunked-I/O caveat through the linked full report.

The control/narrative path and job text were visible, so method/arm blinding is limited. No other arm, drafts, predecessor, prior review, parent analysis, candidate grade, timing history or campaign helper was read. No Goal or delegation was created.

## Six axes

| Axis | Disposition | Reason |
|---|---|---|
| 1. All required obligations | FAIL | All six topics are present, but decision conditions and class-label preservation are incomplete because D01/D02 omit consequential released-path guards. Comparison, optional lead, open choices, validation proposals and traceability are present. |
| 2. Consequential claims and full release/default/type/unit/path/authority conditions | FAIL | All 48 material checks are recorded with exact primary locators and inference labels. D01 contradicts the released mask-selection guards; D02 leaves nearest/native-label guarantees insufficiently conditioned. Other claims are supported or appropriately bounded. |
| 3. Bounded useful discovery, negative and optional yield | PASS | Two coherent alternatives, source limitations, independent validity/area, blockwise option and separate continuous-band lead are useful within one bounded module. Negative claims remain limited to the checked source scope. |
| 4. Wrong rejection, correction or unjustified abstention | PASS | No preset adoption truth was used. Caller choice follows missing product semantics. The mode warning is explicitly an inference to test, not a false assertion that GDAL definitely ignores masks or a categorical rejection of mode. |
| 5. Preservation, traceability, uncertainty and options across all mapped views | PASS | The complete mapped authored set is final.md plus report.md, with no mapped indices or other projection views. All six final items and anchors retain authored conditions, alternatives, source IDs/bindings, limits, uncertainties, options and leads through fuller evidence. Traceability does not establish factual correctness. |
| 6. Proposed versus executed checks | PASS | Fixtures, raster algorithms, area branches and runtime mode behavior are plainly proposed and unexecuted. Reproduced hashes support the capture claims; candidate historical execution is only a self-report because histories are excluded. Reviewer performed source/structure/hash checks only. |

## Material defects

**D01 — dataset_mask_release_guards_not_preserved (material).** Candidate: final.md:14, report.md:18.

The final presents the topic-guide mask-precedence summary as the Rasterio dataset-mask rule, and the report retains only that documented summary despite also capturing the governing 1.3.10 implementation. The implementation selects a first-band shared mask only when the first mask has per_dataset, uses a count==4/first-color-red branch next, and otherwise OR-reduces all band masks without testing nodata. A .msk can contain separate per-band masks, so its existence alone does not establish a single dataset-wide mask.

For a supported two-band dataset with no nodata and unshared external band masks, an invalid class-band pixel can be dataset-valid because another band mask is valid. A caller relying on the authored .msk/nodata guards may misunderstand when any-band OR occurs and select or summarize the wrong validity plane. This is within the brief external-mask and multiband-validity scope.

The missing conditions govern which pixels enter class votes and valid-area counts; they are not formatting or an unrequested whole-application feature.

Evidence: P03, P04, P05. Distinguish the documented summary from the released flag/branch guards, including per-band external masks and OR fallback regardless of nodata. The useful recommendation to select validity deliberately remains sound.

**D02 — nearest_native_label_provenance_condition_missing (material).** Candidate: final.md:7, final.md:16, report.md:10, report.md:22.

The authored set promises that nearest preserves a sampled input class ID and recommends reading class and mask with the same nearest policy, without qualifying native-resolution provenance or existing overviews. GDAL reduced reads can select an already aggregated overview; selecting nearest at read time does not undo that aggregation.

A native class raster containing only IDs 1 and 3 can have an average overview with value 2. A nearest reduced read selecting that overview can return 2, outside the native class-ID set, and cannot establish the stated representative native-pixel semantics. This is a mathematical/static counterexample, not an executed Rasterio result. Class/mask overview provenance can also differ, so a common resampling enum alone is insufficient for a native source pair.

The guarantee is central to one of the two alternatives. The missing condition can create a different label and product meaning; it is not a request for optimization or application expansion.

Evidence: P07, P12. Make nearest/native-ID and representative-pixel guarantees conditional on native sampling or validated class-preserving overview provenance and compatible validity sampling. No specific configuration command is prescribed or executed.

The two counterexamples are static reasoning from released APIs, not executed raster tests. D01 is directly established by the mapped Rasterio 1.3.10 branch code plus the GDAL external-mask contract. D02 uses GDAL 3.9 as a concrete released source-condition example; it does not assert the candidate had that installed runtime or that any supplied raster actually contained an unsuitable overview.

## Obligation coverage

| Obligation | Disposition | Checked claims |
|---|---|---|
| O1: Give a decision with conditions, rather than a universal processing rule. | PARTIAL | C01, C05, C07, C13, C22, C31 |
| O2: Compare two alternatives under the same brief. | SATISFIED | C01, C03, C04, C06 |
| O3: Preserve mask/nodata/class-label distinctions. | PARTIAL | C02, C10, C11, C12, C13, C15, C16, C17, C21, C22, C26 |
| O4: Retain source limitations and optional continuous-band opportunity. | SATISFIED | C20, C28, C29, C31, C32, C33, C35, C38 |
| O5: Include validation proposals and open product choices. | SATISFIED | C40, C41, C42, C43, C44, C45, C47 |
| O6: Make every decision-view item traceable to full candidate-authored evidence without omitted meaning. | SATISFIED | C46, C48 |

## Primary evidence and capture limits

**S1** — Rasterio 1.3.10; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rastermask.rst`. [Official primary URL](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/masks.rst). SHA-256 of full primary bytes: `27e0deec311306bf071bf5e15fb23281103f61646727cd1e98b2e89edda51bb9`.

**S2** — Rasterio 1.3.10; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterresample.rst`. [Official primary URL](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/resampling.rst). SHA-256 of full primary bytes: `2a92fec75d5d0629227f5b47b73529981e3204eb1a3bb6c2fa86a3c99df2e727`.

**S5** — Rasterio 1.3.10; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/rasterwindow.rst`. [Official primary URL](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/docs/topics/windowed-rw.rst). SHA-256 of full primary bytes: `4056fb30d030bf9df614ec8bc927cf83ffb2d4abe33471cf1622ad0d913ca0d1`.

**S6** — GDAL 3.9.0; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M14-A/inputs/sources/geotransform.rst`. [Official primary URL](https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/tutorials/geotransforms_tut.rst). SHA-256 of full primary bytes: `5b9c3093776741a5b00f3bef76aa7515f021e4ddc62f87f8326f6e6d1c1a33cc`.

**S4** — Rasterio 1.3.10; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M14-A/control/narrative_full_final-v3/sources/rasterio-1.3.10-_io.pyx`. [Official primary URL](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/_io.pyx). SHA-256 of full primary bytes: `1d06b63aff8f2dbc961ec8c431998d11beb3d1ce805018296177248aaa7ff190`.

**S3** — Rasterio 1.3.10; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M14-A/control/narrative_full_final-v3/sources/rasterio-1.3.10-enums.py`. [Official primary URL](https://raw.githubusercontent.com/rasterio/rasterio/1.3.10/rasterio/enums.py). SHA-256 of full primary bytes: `4ed7dcb46b145673887b45815267fd88b9335700147ecc7d9061f7669a7e8f7b`.

**A1** — PROJ 9.4.0; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M14-A/control-v3/sources/proj-9.4.0-geodesic.rst`. [Official primary URL](https://raw.githubusercontent.com/OSGeo/PROJ/9.4.0/docs/source/geodesic.rst). SHA-256 of full primary bytes: `bc448262ca3b2bbc172d4bb574a0485c639cafa8da596711361a8a906c54d71f`.

**A2** — PROJ 9.4.0; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M14-A/control-v3/sources/proj-9.4.0-laea.rst`. [Official primary URL](https://raw.githubusercontent.com/OSGeo/PROJ/9.4.0/docs/source/operations/projections/laea.rst). SHA-256 of full primary bytes: `c61df73c56e561cd6f58f141b01a722f1eb3b8861b5feacabf36d12bbbc92a28`.

**A3** — GDAL 3.9.0; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M14-A/control-v3/sources/gdal-3.9.0-rfc51.rst`. [Official primary URL](https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/development/rfc/rfc51_rasterio_resampling_progress.rst). SHA-256 of full primary bytes: `6769c39a8bc5ac2c7dac90e29ac0f3cd1f5ccc2fcfebc4f8fe479db8f49c0905`.

**A4** — GDAL 3.9.0; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M14-A/control-v3/sources/gdal-3.9.0-raster_data_model.rst`. [Official primary URL](https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/user/raster_data_model.rst). SHA-256 of full primary bytes: `8fc2bb5fa1f23d1e1c25f5b2175b1d878d3bd973004c352dca98a8c8304db92e`.

**A5** — GDAL 3.9.0; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M14-A/control-v3/sources/gdal-3.9.0-gdal_translate.rst`. [Official primary URL](https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/programs/gdal_translate.rst). SHA-256 of full primary bytes: `5c582ce394add555bee6593f5accef12a8b3dbe412eecff80081e1cd7cae8707`.

**A6** — GDAL 3.9.0; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M14-A/control-v3/sources/gdal-3.9.0-rasterio-api-documentation.json`. [Official primary URL](https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/gcore/gdalrasterband.cpp). SHA-256 of full primary bytes: `984a2fb02108d2c45b05225b8afe601486dc3d559af7cbea36488a848e348797`.
Only original API documentation comment lines 114–169 are retained in the JSON excerpt; its own SHA-256 is `bfb6c35af94a607a2c3a20150e4f3e19a92497f3e5befeeb2df5703e44c50bf3`. Full source was hashed in memory, not installed, stored as code, imported or executed.

**A7** — GDAL 3.9.0; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M14-A/control-v3/sources/gdal-3.9.0-rfc15.rst`. [Official primary URL](https://raw.githubusercontent.com/OSGeo/gdal/v3.9.0/doc/source/development/rfc/rfc15_nodatabitmask.rst). SHA-256 of full primary bytes: `4c326c13b339f243d78eabaf8d2bca12e10f07b28947a669e3984c98f7d042f4`.

**P01** (S2:53–68; S3:48–100; S4:438–485; S4:57–68): The resampling guide supplies no generally correct method. Resampling enum defines nearest as default, mode as most frequent sampled value, and average as weighted non-NODATA average. read() and read_masks() default to nearest; validate_resampling accepts mode=6. The enum is framed as warp/overview algorithms; read availability is checked in released implementation. Limit: Descriptions do not select categorical product meaning, arbitrary caller tie policy, validity scope, coverage threshold, or a physical-area model. GDAL 3.9 tutorial capture does not identify the deployed GDAL runtime.

**P02** (S1:7–15; S1:49–79; S1:185–216; S4:742–780; S4:836–849; A7:24–29): GDAL masks are byte arrays with zero invalid and nonzero valid, usually 255. NumPy masked-array True means invalid. read_masks() uses uint8 output and the docs give the inverse-mask identity. Limit: Resampled mask values need not be exclusively 0/255; source-native binary validity is interpreted with nonzero, not equality to 255.

**P03** (S1:85–92; S1:111–124; S1:175–183; A7:75–110): Eight-bit data can contain legitimate values rounded to the metadata nodata sentinel. A recognized external .msk overrides nodata-derived masks without altering values or nodata metadata. RFC15 permits per-dataset one-band masks and per-band multi-band sidecars, with mask flags stored per band. Limit: Recognized mask storage and flags matter. Existence of any .msk does not imply a single mask shared by every band.

**P04** (S1:219–236; S4:1038–1076; S3:167–172; A7:56–70; A7:102–110): The topic guide documents .msk/alpha/internal-mask, RGBA shadow-nodata, nodata-OR, then all-valid precedence. Actual 1.3.10 dataset_mask() first tests MaskFlags.per_dataset on band 1 and returns read_masks(1); otherwise it tests count==4 and first color interpretation red and returns read_masks(4); otherwise it OR-reduces read_masks() for all bands. The fallback has no nodata-present test. Limit: Documentation summary is not an exact specification of released branch guards. Per-band masks can enter the OR fallback without nodata; all-valid is a consequence of all-valid component masks, not a separately coded nodata-absence branch.

**P05** (S1:141–159; S1:219–236; S4:1061–1076): A manually constructed intersection of band masks differs from the dataset-mask OR fallback. Per-band and per-dataset validity are distinct APIs and policies. Limit: Whether any-band, class-band, or all-required-bands validity is scientifically correct is a product choice.

**P06** (S4:120–162; S4:208–215; S4:221–283; S4:633–676; S4:678–734; S4:966–978): Ordinary bounded read resamples values through _read, reads/resamples masks separately if needed, inverts the masks and constructs a masked array. All-valid can bypass mask I/O. Boundless-window reads use VRT branches. Value calls pass a dataset/band handle and resampling arguments to GDAL; no explicit validity array is passed in this Rasterio call. Limit: This does not prove GDAL ignores a mask or nodata known to the source handle. It does not establish mode-vote behavior on an unspecified driver, overview path, and GDAL runtime. Boundless mask paths have different defaults from the ordinary bounded path.

**P07** (S4:438–485; S4:528–578; S4:603–629; S4:653–662; S4:742–780; S4:857–903): Rasterio uses native band dtype by default, permits output dtype/shape conversion, and passes each values/mask request onward. For ordinary bounded nearest requests, values and masks receive the same nearest argument. Limit: Same algorithm name is not proof of original-pixel provenance, compatible stored overviews, arbitrary requested dtype exactness, or every boundless path.

**P08** (S6:9–32): The geotransform maps pixel/line coordinates to projected or geographic coordinates using linear coefficients GT(1), GT(2), GT(4), GT(5); the corner is (0,0) and the first center is (0.5,0.5). Limit: The tutorial supplies an affine coordinate transform, not physical-area units, an ellipsoid, or an equal-area guarantee. Determinant and coverage formulae are mathematical derivations by the author/reviewer.

**P09** (A1:9–18; A1:70–78; A1:144–152; A2:4–20): PROJ describes ellipsoidal geodesics and geodesic polygon area in square meters, including pole adjustment. Its LAEA documentation identifies spherical/ellipsoidal equal-area projection forms and projected output. Limit: Supplemental science check only. Exact ellipsoid, pixel-edge model, CRS, units and distortion treatment remain unspecified; no claim that a four-corner geodesic polygon is automatically the exact area of every geographic raster cell.

**P10** (S2:62–68; S3:53–66): The guide recommends considering bilinear/cubic for continuous data and mentions average for retaining numerical properties. The enum calls average weighted non-NODATA average. Limit: No band-specific scientific statistic is selected, and enum/warp wording alone does not establish the read-time handling of an arbitrary external mask.

**P11** (S5:6–15; S5:57–66; S5:185–191; S5:221–251): Windows enable chunked application processing. Disk/network reads can fetch complete storage chunks; unchunked inputs can require whole-dataset I/O for a tiny window. Bands can have different block layouts; the guide recommends checking layout assumptions. Limit: Bounded requested arrays do not guarantee bounded underlying I/O. Identical block shape is an efficiency/iteration assumption, not a general prohibition on accessing the same geometric window in different bands.

**P12** (A6:124–169; A4:280–289; A5:103–114; A5:125–131; S4:120–215; S4:966–978): Released GDAL RasterIO API documentation says reduced reads can select lower-resolution overview bands, with default selection conditions and a 3.9 threshold change. gdal_translate documents independent overview selection and forcing base resolution; average is a distinct aggregation operation. Rasterio forwards reads to GDAL without an overview-provenance guard in this path. Limit: gdal_translate CLI options are not presented as Rasterio options. GDAL 3.9 is a concrete released counterexample for source conditions, not an assertion about an observed installed runtime. Only API documentation comments from the released C++ source were retained.

**P13** (A4:203–215; S4:528–578; S4:603–629): Raster bands include datatype, nodata metadata and optional masks separately. Rasterio defaults output dtype to the source band; GDAL documents limitations of some UInt64/Int64 operations using floating intermediates. Limit: No specific candidate input dtype/range or actual precision-loss result was supplied. No independent defect is assigned for hypothetical output dtype conversions.

**P14** (A3:25–111; A3:113–129): RFC51 documents the resampling selector in RasterIO extra arguments, relation to overview algorithms, and some palette-related fallbacks. Limit: This API description still does not prove the mode mask/nodata behavior of a particular runtime. Palette-related fallbacks do not independently invalidate the candidate optional continuous-band lead.

## Every material claim and recommendation

Exact candidate and primary line locators use the frozen raw files. Each check labels source facts, recommendations, mathematical derivations, inference, proposals or provenance assertions. Full machine-readable records are in review.json.

**C01 — SUPPORTED_WITH_MATERIAL_CONDITION_DEFECT** (final.md:3, final.md:7-10, report.md:10-12; conditional recommendation; P01, P05). Choose nearest for representative-pixel meaning and valid-only majority for footprint-frequency meaning, with explicit caller choice. The two product meanings are coherent and compared under the same brief. The nearest implementation guarantee needs the conditions in D02.

**C02 — CONDITION_MISSING** (final.md:7, report.md:10; algorithm fact applied to pipeline; P01, P07, P12). Nearest preserves a sampled input class ID. True for direct nearest selection from native labels with exact representation. A reduced GDAL read may select an overview whose labels were formed with another method. The authored set never conditions original-ID preservation on native sampling or validated class overviews.

**C03 — SUPPORTED** (final.md:7, report.md:10; mathematical inference; P01). Nearest can omit small classes. A representative sample can miss a minority class lying elsewhere in a footprint. This is a possibility, not a claimed empirical rate.

**C04 — SUPPORTED** (final.md:8, report.md:10; defined policy and recommendation; P01, P02, P05). Valid-only majority means most frequent valid class in the footprint, excluding invalid cells before voting. Explicit valid-only counting is a defensible policy. It is not equated with the library mode implementation.

**C05 — SUPPORTED** (final.md:8, report.md:10-12; policy and bounded negative source claim; P01, P06). Define deterministic ties and any minimum valid coverage; the sources do not choose a read-time tie policy. Neither the mapped enum definitions nor the Rasterio read call supplies a caller policy. The report carefully limits the tie claim to these sources/read(), rather than claiming no GDAL tie behavior exists.

**C06 — SUPPORTED** (final.md:8, report.md:10; mathematical inference; P01). Majority can remove minority classes. A maximum frequency selection need not output any less-frequent contributor class. Exact preservation of rare classes is not promised.

**C07 — SUPPORTED** (final.md:8, report.md:10-12; policy recommendation; P01). Require a caller choice if coarse-label semantics are unspecified. Appropriate unresolved product choice; it retains two usable alternatives and is not an unjustified rejection of both.

**C08 — SUPPORTED** (final.md:10, report.md:12; source fact; P01). There is no generally correct resampling method. Supported as general guide advice. The candidate does not turn interpolation-quality wording into a ranking of categorical policies.

**C09 — SUPPORTED** (final.md:10, report.md:12; release/API fact; P01). Nearest is the 1.3.10 default; enum mode is most frequent sampled value and read accepts it. Confirmed using enum values, read signature, and validate_resampling. Warp/overview enum descriptions are not used alone to assert read support.

**C10 — SUPPORTED** (final.md:14, report.md:18-20; source-backed modeling recommendation; P02, P03, P13). Class IDs, nodata metadata and validity are separate. Explicit masks can validate stored sentinel-valued data, making value equality an insufficient validity model.

**C11 — SUPPORTED** (final.md:14, report.md:18; type/value convention fact; P02). read_masks uses zero invalid and nonzero usually 255 valid. Confirmed including uint8 mask type and nonzero rather than exactly-255 interpretation.

**C12 — SUPPORTED** (final.md:14, report.md:18; source/API fact; P02, P06). NumPy mask sense is inverted. Confirmed: True marks invalid; Rasterio converts GDAL mask to bool and negates it.

**C13 — RELEASE_CONDITIONS_INCOMPLETE** (final.md:14, report.md:18; documented rule asserted as release behavior; P04, P03). dataset_mask priority is .msk/alpha/internal, RGBA shadow nodata, nodata-band-OR, otherwise all-valid. The documentation states this summary, but released code governs via per_dataset and RGBA-like guards then unconditional OR fallback. External per-band masks are a supported case not captured by this summary.

**C14 — SUPPORTED_WITH_MATERIAL_CONDITION_DEFECT** (final.md:14, report.md:18; source fact and mathematical inference; P05). OR means any-band-valid and may differ from class-band or all-required-band validity. Correct when using the actual OR fallback. The report fails to disclose that this fallback can also operate without nodata (D01).

**C15 — SUPPORTED** (final.md:14, report.md:20; source fact; P03). A recognized .msk can override nodata metadata without changing stored values. Confirmed. The per-band/shared-mask distinction affects dataset-wide selection, not this per-band precedence fact.

**C16 — SUPPORTED** (final.md:14, report.md:18-20; source fact and recommendation; P03). Eight-bit nodata can collide with legitimate data; do not reapply sentinel equality over an authoritative chosen mask. Confirmed example and mask override. This correctly preserves valid class 0 or another sentinel-valued class where the authoritative mask validates it.

**C17 — SUPPORTED** (final.md:14, report.md:20; policy recommendation; P05). Choose class-band, dataset-wide, or all-required-band validity deliberately; normally read_masks(class_band). Appropriate choice exposure. Defaulting the validity source to the class band is a stated recommendation, not a library default.

**C18 — SUPPORTED** (final.md:16, report.md:22; released call-path fact; P06). Rasterio resamples values and masks separately then applies the output mask. Supported for ordinary bounded reads with non-all-valid masks. All-valid skips mask I/O and boundless windows use VRT paths, but still construct masking separately. No universal kernel outcome is established.

**C19 — SUPPORTED** (final.md:16, report.md:22; released call-signature fact; P06, P14). The value I/O call has no explicit source validity-array argument. Confirmed. GDAL receives a handle that can supply nodata/masks internally, so lack of an array argument must not be read as proof they are ignored.

**C20 — SUPPORTED** (final.md:16, report.md:22; explicit implementation-based inference; P06, P14). Do not assume masked=True mode excludes invalid sentinels from its vote; verify on the pinned runtime. Acceptable bounded uncertainty. It does not claim mode certainly includes invalid values or falsely reject the API. There is no supplied deployed runtime to settle its exact behavior.

**C21 — SUPPORTED** (final.md:16, report.md:22; algorithm proposal; P02, P05, P06). For majority, filter native-resolution values with the chosen mask before aggregation. Correct by construction for the defined valid-only policy, preserving mask precedence without relying on an unverified library mode vote.

**C22 — CONDITION_MISSING** (final.md:16, report.md:22; implementation recommendation; P07, P12). For nearest, read/sample class and mask with the same nearest policy. Necessary geometric sampling consistency is sound, but same resampler name does not ensure native source provenance or compatible overview masks/labels.

**C23 — SUPPORTED** (final.md:20, report.md:28; mathematical derivation; P02, P08). On aligned footprints, valid_fraction = valid_count/source_count from native mask. For the report explicit aligned integer-factor same-area case, denominator is the complete contributing source-cell count. This is correctly separated from coarse-label validity.

**C24 — SUPPORTED** (final.md:20, report.md:28; mathematical derivation; P08, P09). Aligned equal-area valid area is sum(fraction times target area), equivalent to count times source-cell area. If each target cell partitions N whole equal-area source cells of area a, target area is Na, hence (valid_count/N)Na=valid_count*a. Aggregation requires no overlapping/double-counted target footprints; the authored aligned-grid context provides the intended partition.

**C25 — SUPPORTED** (final.md:20, report.md:28; mathematical inference; P05, P08). A valid nearest/modal class does not make the entire target footprint valid area. One label is not a contributor-count/coverage statistic. Supported independently of the mode runtime caveat.

**C26 — SUPPORTED** (final.md:20, report.md:28; policy recommendation; P02, P05). Keep no-valid-contributor results invalid; partial-coverage cutoff is a choice. Explicit mask/count policy correctly distinguishes no contributors from optional coverage thresholds and output encoding.

**C27 — SUPPORTED** (final.md:22, report.md:30; explicit mathematical derivation; P08). Affine planar cell area is abs(GT1*GT5-GT2*GT4). The source defines edge vectors (GT1,GT4) and (GT2,GT5). Their absolute determinant is parallelogram coordinate area, including rotation and negative north-up height.

**C28 — SUPPORTED** (final.md:22, report.md:30; mathematical inference and source limitation; P08, P09). The determinant is squared coordinate units, not automatically physical ground area. Correct for geographic degrees as well as projected coordinates with a non-equal-area model. No universal square-meter claim is made.

**C29 — SUPPORTED** (final.md:22, report.md:30; scientific recommendation; P08, P09). Use an appropriate equal-area or geodesic area model for physical ground area. Supported by primary geodesic/equal-area descriptions. Choosing ellipsoid, units and cell-edge model is expressly left open; no specific software runtime/method is promised.

**C30 — SUPPORTED** (final.md:22, report.md:30; geometric inference; P08, P09). For unaligned/reprojected footprints use actual overlap weighting. Whole-cell counts no longer represent each contribution fraction; overlap areas are needed under the chosen physical or planar area model. Reprojection itself does not make planar area physical.

**C31 — SUPPORTED** (final.md:22, report.md:30; bounded reporting recommendation; P08, P09). Unknown CRS/area semantics justify reporting coverage or grid units only. Useful uncertainty-preserving output, not blanket abstention. Area-model choice remains unresolved rather than silently invented.

**C32 — SUPPORTED** (final.md:26, report.md:36; conditional recommendation; P10). Average is an optional mean-like continuous-band opportunity. Confirmed weighted-average definition and continuous-band context. This is a lead to evaluate, not a claim every external-mask/read path already implements the desired statistic.

**C33 — SUPPORTED** (final.md:26, report.md:36; conditional recommendation; P10). Bilinear/cubic are optional choices for a smooth continuous surface. The guide explicitly considers them better suited to continuous data; smooth interpolation remains different from a conservation or band-specific statistic.

**C34 — SUPPORTED_WITH_MATERIAL_CONDITION_DEFECT** (final.md:26, report.md:36; categorical-semantics recommendation; P01, P10). Do not apply those continuous interpolation choices to class IDs. Linear/smooth numerical combinations of label identifiers are not the stated categorical policies. This reasoning is correct; pre-existing unsuitable overviews also need to be excluded (D02).

**C35 — SUPPORTED** (final.md:26, report.md:36; bounded negative source-scope claim; P01, P05, P08, P10). Sources describe behavior but do not choose scientific band meaning, validity scope, tie rule, coverage threshold or area model. Full relevant primary reading confirms these missing product definitions. This does not assert such choices are unknowable or no other primary source can exist.

**C36 — SUPPORTED** (final.md:34, report.md:38; implementation option and source fact; P11). Native-resolution validity/vote accumulation may be blockwise; windows can bound application memory. Chunked source reads with accumulation preserve the defined counts when contributions are retained correctly. The candidate proposes parity validation and does not claim measured memory or performance.

**C37 — SUPPORTED** (final.md:34, report.md:38; I/O source fact; P11). Small reads can fetch whole storage blocks. Confirmed. Requested window dimensions are not minimum disk/network I/O dimensions.

**C38 — SUPPORTED** (report.md:38; I/O source limitation; P11). Unchunked input may require whole-dataset I/O even for a tiny window. Confirmed and retained in fuller linked evidence; the shorter final wording does not erase the limitation.

**C39 — SUPPORTED** (final.md:34, report.md:38; source fact and conservative proposal; P11). Block shapes can differ by band; verify shared block-window assumptions. Confirmed. The advice concerns blockwise processing assumptions and efficiency; it is not an unsupported claim that any shared geometric window is forbidden.

**C40 — SUPPORTED** (final.md:30, report.md:44; validation proposal; P02, P03, P04, P05). Propose a fixture with valid ID 0, separate sentinel, conflicting .msk and per-band masks. Useful mask/label discrimination test. It is not executed. It should expose D01 if it includes the supported unshared external-mask branch, but the prose does not resolve that branch today.

**C41 — SUPPORTED** (final.md:30, report.md:44; validation proposal; P01, P02, P05). Propose hand-computed nearest/majority, ties, rare classes, partial coverage and all-invalid cases. Appropriate for label and contributor policy. No pass is claimed; stored overview provenance is not included in the proposal, leaving D02 unaddressed.

**C42 — SUPPORTED** (final.md:30, report.md:44; validation proposal; P08, P09). Propose exact area counts, rotated affine and geographic grids. Appropriate for the determinant and physical-area branch, contingent on selecting the area model/CRS and expected values.

**C43 — SUPPORTED** (final.md:30, report.md:44; validation proposal; P06, P11). Propose blockwise/in-memory parity and runtime-specific mode/nodata/external-mask checks. Appropriate. Exact Rasterio/GDAL runtime is still to be recorded; no tested runtime result can be inferred.

**C44 — SUPPORTED** (final.md:34, report.md:46; product-choice record; P01, P05, P08). Leave point/majority, tie, coverage, mask scope and summary granularity open. Every listed choice is retained between the final item and evidence report; library prose does not choose these product meanings.

**C45 — SUPPORTED** (final.md:34, report.md:46; product-choice record; P02, P03, P08, P09, P10). Leave CRS, physical-area method, units, sentinel encoding and continuous method open. Explicit scientific/output choices appropriately preserved. Sentinel encoding must accommodate valid sentinel-valued classes, as the candidate mask separation already recognizes.

**C46 — SUPPORTED** (report.md:54-59; provenance claim; P01, P02, P03, P04, P06, P08, P10, P11). S1-S6 register URLs, versions, capture paths, sizes, hashes and primary locators. All six full files independently byte-match their stated official tagged raw URLs and mapped SHA-256/length. Candidate-selected implementation captures were not accepted solely on their manifest. Versioned rendered-page URLs were not all availability-checked; the independently fetched raw URLs supply accessible exact bytes.

**C47 — CONSISTENT_SELF_REPORT_WITH_PROVENANCE_LIMIT** (final.md:30, report.md:61; execution self-report; P01, P06). Only hashes/source captures were executed; raster algorithms and proposed fixtures were not. Reviewer reproduced capture/hash consistency and found no authored claim of raster validation passing. Candidate historical operations cannot be independently attested without forbidden run-history access; this limitation is explicit.

**C48 — SUPPORTED** (final.md:3-34, report.md:6-61; preservation/traceability claim; P01, P02, P03, P04, P05, P06, P08, P10, P11). Every final decision item links to fuller authored evidence and primary bindings. All six named anchors resolve in the frozen report and all S1-S6 IDs bind to checked primary files. Authored source conditions, alternatives, uncertainties and proposals survive the final-to-report linkage. Primary scientific errors D01/D02 remain even when traceability itself passes.

## Preservation across all mapped views

| Decision item | Full authored evidence | Source IDs | Meaning retained |
|---|---|---|
| M1 (final.md:5-10) | E1 (report.md:6-12) | S2, S3, S4 | nearest versus majority semantics; invalid filtering; ties and minimum coverage; minority/rare-class loss; caller choice; no universal method and read tie prescription |
| M2 (final.md:12-16) | E2 (report.md:14-22) | S1, S4 | class/nodata/validity distinction; mask sense; documented precedence and OR meaning; external-mask override; sentinel collision; deliberate validity source; separate value/mask call-path inference; native majority and matched nearest; runtime uncertainty |
| M3 (final.md:18-22) | E3 (report.md:24-30) | S1, S6 | native mask; aligned integer-factor same-area condition in full evidence; fractions and total area; no-valid contributors; coverage choice; affine determinant; coordinate units; physical-area limits; overlap/CRS caveats |
| M4 (final.md:24-26) | E4 (report.md:32-38) | S2, S3 | continuous-band lead is optional; average versus bilinear/cubic meaning; categorical exclusion; band-specific science not supplied; source limits; window option retained via full report and M6 |
| M5 (final.md:28-30) | E5 (report.md:40-46) | S1, S4, S5, S6 | proposed not executed; mask/sentinel fixture; nearest/majority hand expectations; ties/rare/partial/all-invalid; exact area/rotated/geographic cases; block parity; exact runtime and mode probe; only source checks executed |
| M6 (final.md:32-34) | E5 and E4 (report.md:38-46) | S5 | point versus majority; tie and threshold; validity scope; per-cell/aggregate/per-class summary; CRS/model/units; invalid encoding; continuous method; block layouts and whole-block reads; unchunked full-I/O caveat in linked fuller evidence |

No omitted authored meaning was found between the mapped views. Preservation does not cure the two scientific source-condition defects. Source ordering, IDs, URL/hash/path bindings, uncertainties, options and the continuous-band lead remain available.

## Assessment extent and provenance

Full declared scope was primary-checked: original brief/manifest, all final/report material items, all six primary bindings, mask/type/default/read-path/area conditions, negative scope statements, all six obligations, all proposed-versus-executed distinctions, and every mapped semantic/preservation view. There is no unassessed declared-scope remainder. Unrelated write/statistics code in a complete captured implementation file is outside this diagnostic subject; its bytes were nevertheless included in identity checks.

Mode-vote behavior on the actual runtime, historical candidate source-operation execution, and unavailable real raster/CRS details are explicitly bounded uncertainties, not facts invented by this review. Proposed runtime fixtures were not part of the requested execution scope and were not run. Hash results reproduce the capture claims but do not attest the candidate historical actions.

The fixed deadline is 2026-10-07T21:14:04.949343+00:00. T3 requestedAt is 2026-10-07T20:54:29.213Z; its twenty-minute endpoint is later than the fixed deadline, so the fixed deadline governs. Review closed early. Actual source operations and observed cache information are in timings.json; unavailable token/billing counters remain null.

Candidate bytes and candidate grades were not changed. Review artifacts and retained primary documentation evidence are confined to the designated review directory. No pending child tasks.
