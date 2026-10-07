# Independent semantic judgment — I-FAST-02 / treatment / review-v1

**Source judgment: FAIL. Entire declared scientific scope assessed. One distinct material source error (D1), affecting two consequential finding groups.** This is a full-scope assessment, not a grade extrapolated from an early localized failure. The final is a useful, complete replacement plan, but its consequential correction of the pandas issue/regression history is wrong. That required history and the criticism disposition carrying it therefore do not pass.

The controlling scope is the complete original brief and frozen P1–P6 plan. No scope was dropped for time or after finding D1. I read both complete authored artifacts, examined their scientific source-map content and every cited source's pertinent governing ranges, compared every in-scope decision, and independently captured primary-source evidence. Source maps, artifact declarations, hashes, delivery status and exit codes identify or describe evidence; they were not accepted as source truth.

In references below, **B** is `cases/I-FAST-02/brief.md`, **P** is `cases/I-FAST-02/plan.md`, **D** is the admitted `jobs/I-FAST-02/treatment/research-v1/artifact.md`, and **F** is the admitted `jobs/I-FAST-02/treatment/critic-finalizer-v1/artifact.md`. These are beneath `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/`. Their byte-identical review copies are beneath this review's `sources/admitted/`; exact original paths, review-copy paths, byte counts and SHA-256 values are in [the admitted-input manifest](sources/admitted-input-manifest.json). All source IDs, immutable URLs/versions, ranges, access metadata and SHA-256 values are resolved in [source-checks.json](source-checks.json). HTML line ranges refer to the named reviewer-derived `.txt`, not a browser's unrelated line numbering; raw HTML remains alongside it.

## Full scope accounting

“Complete” below means the assessment was completed; it does not mean the candidate satisfied the item. These separate inventories overlap and must not be summed into a count of unique requirements.

| Inventory | Total | Complete / assessed | Unassessed |
|---|---:|---:|---:|
| Required O1–O6 | 6 | 6 | 0 |
| Frozen plan sections P1–P6 | 6 | 6 | 0 |
| Atomic decisions within the frozen plan | 36 | 36 | 0 |
| Original scope/boundary constraint groups | 5 | 5 | 0 |
| Authored open product questions | 8 | 8 | 0 |
| External owner documents/decisions supplied in bounded slice | 0 | 0 | 0 |
| Consequential finding groups F01–F27 | 27 | 27 | 0 |
| Candidate criticism dispositions C1–C7 | 7 | 7 | 0 |
| Preservation/disposition groups | 61 | 61 | 0 |
| Proposed P6 validation categories | 8 | 8 | 0 |
| Review axes | 6 | 6 | 0 |

Of the 27 consequential finding groups, 25 have no identified material defect; F21 and F23 share D1. **Distinct material error count: 1. Unassessed obligations/findings: none within the declared scientific scope.** No external owner cross-reference was supplied or inferred. Unresolved station, mapping, tolerance and plotting choices remain appropriately open product decisions; assessing their disposition is not claiming that their eventual implementation or local-site applicability has been validated.

## 1. Original obligations and plan decisions

| Obligation | Assessment | Concrete coverage |
|---|---|---|
| O1, B:17–22,58 | Assessed; substantively satisfied with limits | NOAA acquisition/metadata/Tide Predictions, measurement-reference guidance and a citizen-science analogue go beyond the initial undecided components. Useful limitations and optional routes appear at F:55–58,71–72,107–124,128. Discovery-before-plan order is author-reported, not independently proven from this admitted material. |
| O2, B:24–30,59 | Assessed; satisfied | Public `merge_asof`, its caller, `_AsOfMerge` key/tolerance validation and compiled join functions are tied to immutable pandas 3.0.6 commit `2905718b126579d2cf0fe5bae05bd75facb67d77`. The tag, release and Python floor were independently checked. See F16–F20. |
| O3, B:24–30,60 | Assessed; fails materially | A real issue, fix, revised regression test and released fix exist. F:20,130 incorrectly narrow affected valid inputs and discount the revised test using an earlier review. D1 below. |
| O4, B:32–37,61 | Assessed; satisfied | All 36 frozen atomic decisions have replacement behavior or an explicit open choice; F:91–105 gives bounded plan references and retain/change/already-covered dispositions. No whole-project coverage is inferred. |
| O5, B:39–43,62 | Assessed; substantive criticism present, with material defect | Seven criticism dispositions are visible and incorporated. Six are sound or appropriately limited; C5 is wrong. Critic family/identity and procedural independence are host/provenance questions, not inferred from the artifact's self-description or used to assign this scientific judgment. |
| O6, B:45–52,63 | Assessed; complete deliverable structure satisfied | F:32–85 is a coherent replacement P1–P6, followed by rationale/dispositions, five limited leads, eight open questions, validation and uncertainty. It is more than a critique or patch outline. Its completeness does not repair D1's source error. |

Every atomic frozen decision was checked, as enumerated in `source-checks.json` and `coverage.json`:

- **P1:7 — six:** two-site volunteer CSV; authorized one-station public download; source files; retrieval time; station metadata; stated datum. F:36–41 retains them and adds request/parser/source-row provenance and setup epochs.
- **P2:11 — five:** user-selected time convention; units; justified reference mapping; raw/interpreted separation; unresolved state. F:45–49 retains these, makes DST and datum limits explicit, and does not supply a mapping from absent volunteer data.
- **P3:15 — seven:** month-aligned series; gaps; declared residual; simple summaries; event annotations; no autonomous recalibration; no operational forecast. F:53–58 preserves each. Equality default, bounded approximate matching and conditional event-only output are proposed choices, not executed science.
- **P4:19 — six:** station changes; interpretation choices; source ranges; comments; competing interpretations; export context. F:36–40,62–65 preserves ranges through source-row IDs and request begin/end parameters, with retained source files and selected month. Comments and alternatives remain visible.
- **P5:23 — six:** undecided client; alignment; plotting; local operation after download; input coverage; no required public location details. F:69–72 recommends acquisition/alignment, explicitly leaves plotting open, and retains local/privacy bounds. Coverage/counts and gaps remain at F:53,57,84.
- **P6:27 — six:** proposals for timestamp changes, metadata changes, absent reference levels, missing intervals and reproducible exports; no numerical summary/calibration offered as a research answer. All are retained at F:78–85,135. No numerical result is fabricated.

The five boundary groups also pass at the authored scientific-scope level: frozen cardinality/window; education/read-only review; no navigation/surge/operational forecasting or recalibration; public/local/privacy boundaries; and one complete artifact without a false build/validation claim. This does not reconstruct unseen operational behavior.

## 2. Consequential claims and governing conditions

**D1 — incorrect interpretation and criticism of pandas #35558's regression evidence.**

Claim locations: F:20 (C5) calls the issue an incompatible-tolerance diagnostic regression and states that the added valid-index result test passes without the change and does not establish coverage of the changed branch. F:130 repeats that qualification. The critic source map repeats it under S13 and audit disposition C5. These are one error identity, not several independently counted failures.

The important condition is **both index flags true, no `by` grouping keys, and a non-None compatible tolerance**. At the immutable pre-fix parent, the base merge specification gives empty column-key lists for an index-only join. The subclass loop therefore does not bind `lk`. It then formats its tolerance message before testing compatibility. A valid `DatetimeIndex`/`Timedelta` call can fail there; it is not confined to an invalid-tolerance exception path. The original issue supplies precisely such a valid-input reproduction. This conclusion is a static control-flow interpretation of source and issue evidence, not a test I executed. [Issue #35558](https://github.com/pandas-dev/pandas/issues/35558), [pre-fix governing source](https://github.com/pandas-dev/pandas/blob/59ffa251269ddb8b561d8d88f631a5db21f660dc/pandas/core/reshape/merge.py#L1632).

The maintainer's “passes without code changes” review belongs to **commit `59a07c22c68d5709b1718419007b60ab67f5ccfb`**, whose preliminary test contains `by="ticker"`. That grouping binds a merge key. The author then acknowledges a mistaken test and replaces it. The revised test at **`e7f668be34081d497bc8142ab0c77bb841e2964b` / `7214b3c50b058094ddcb5f8687e3d8394780ba14`** has both index flags, no grouping, a compatible 0.5-second tolerance and an expected matched frame. It reaches the original failure mechanism. The current 3.0.6 test retains the same setup with timestamp-unit handling. The finalizer applied an obsolete review to the later test and consequently rejected useful regression evidence. [Version-bound preliminary review](https://github.com/pandas-dev/pandas/pull/35654#pullrequestreview-464891484), [author's subsequent test correction](https://github.com/pandas-dev/pandas/pull/35654#issuecomment-672984640), [revised test](https://github.com/pandas-dev/pandas/blob/7214b3c50b058094ddcb5f8687e3d8394780ba14/pandas/tests/reshape/merge/test_merge_asof.py#L1343).

The fix really changes `lk.dtype` to `lt.dtype`, and released v1.1.1 source contains it. The release note records #35558 and the official release was published on 2020-08-20. D1 does **not** imply that this old defect remains in pandas 3.0.6, nor that the one historical test proves general grouped/nearest behavior. Those limits are valid. The material error is the lost valid-input condition and false claim that the revised test misses the changed code. [Released source](https://github.com/pandas-dev/pandas/blob/f2ca0a2665b2d169c97de87b8e778dbed86aea07/pandas/core/reshape/merge.py#L1660), [v1.1.1 release note](https://github.com/pandas-dev/pandas/blob/f2ca0a2665b2d169c97de87b8e778dbed86aea07/doc/source/whatsnew/v1.1.1.rst#L30).

Decisive check bytes are preserved under this review directory:

| Source ID and local path | Exact range/selector | SHA-256 |
|---|---|---|
| R29 `sources/public/pandas-parent-59ffa251-merge.py` | Caller 645–652; base keys 951–1065; specification 1198–1203; subclass 1632–1677 | `0e8ea28321951ed4b5aa8d70f8302592010c1bd4018e8ebbca7bc0e3af44270a` |
| R28 `sources/public/pandas-preliminary-59a07c-tests.py` | `test_left_index_right_index_tolerance`, 1343–1356 | `0465111fec102d9dbfb683bd6c94884080a17af7bc7a398d02cc52a35bff9ec1` |
| R18 `sources/public/pandas-pr-35654-reviews.json` | Review 464891484, `commit_id` and `body` | `efae5b9b09dec14ffb2f596f1be72173834d371d79a51a6428b42cb66678a2c1` |
| R17 `sources/public/pandas-pr-35654-comments.json` | `issuecomment-672984640` | `24e631428e81ae979930a72344b670a2ba5f0eab3b7c5ce24d25f1f8cb8cacc6` |
| R31 `sources/public/pandas-fixed-7214b3c-tests.py` | Same test, 1343–1363 | `b3f51fcef805c5f7c1d6bd600fcb4050d4963cc17d2caf974d05763ee657cd38` |
| R24 `sources/public/pandas-v1.1.1-merge.py` | Released validator, 1660–1677 | `f68bc7410c13a2aed16cdfad761b9ff21ff8b349dcc0b3b046cab2af52b5920d` |
| S11 `sources/public/pandas-v3.0.6-test_merge_asof.py` | Current same test, 3332–3357 | `dc01ff95dcd9d8d56042df247c8276cdf73e0c849798232fb2dc5bff75ee0d90` |

All remaining consequential groups were assessed, rather than left behind after D1:

| Finding groups | Judgment and governing evidence |
|---|---|
| F01–F04 | Product identity/verification, time conventions, units and datum constraints are sound for the selected products. The API's Air Gap datum exception is outside the selected series. Zero time/tolerance interpretation still requires compatible types. S01, derived lines 120–167,254–338. [NOAA API](https://api.tidesandcurrents.noaa.gov/api/prod). |
| F05–F07 | Metadata resources exist. Benchmark guidance supports documenting vertical references, while mapping sufficiency and geographic equivalence are product inferences/open decisions. The final does not assert actual volunteer-site comparability. S02 derived 101–118,716–738,842–863; S07 derived 32–41. [Metadata API](https://api.tidesandcurrents.noaa.gov/mdapi/prod/), [measurement resources](https://tidesandcurrents.noaa.gov/education/tech-assist/training/water-level/). |
| F08–F10 | Harmonic/subordinate distinctions, prediction-specific limits and quarterly updates are correctly conditioned. C4 correctly repairs the draft's overly broad one-month cap. Live page access does not establish an older station state. S01 derived 98–113,347–365; S03 derived 68–71,99–105. [NOAA API](https://api.tidesandcurrents.noaa.gov/api/prod), [Tide Predictions help](https://tidesandcurrents.noaa.gov/noaatidepredictionshelp.html). |
| F11–F14 | Astronomical-vs-weather limitations, station/year RMS context, the 2018 photo/GPS analogue and OFS exclusion are supported. The final neither adopts an annual RMS threshold nor claims the historical app is currently available. S04 derived 482–485; S05 page 1/text 1–31; S06 derived 40–47; S08 derived 41–48. [FAQ](https://tidesandcurrents.noaa.gov/faq.html), [NOAA report](https://tidesandcurrents.noaa.gov/pdf/Tide_Prediction_Error_for_the_United_States_Coastline.pdf), [2018 analogue](https://coastalscience.noaa.gov/news/new-citizen-science-water-level-application-available-nationwide/), [OFS definition](https://oceanservice.noaa.gov/facts/ofs.html). |
| F15–F16 | Download formats/URLs and offline snapshots are feasible proposed mechanisms. pandas release/tag/commit and Python >=3.11 are verified; the actual app interpreter remains unselected. S01 derived 464–476; S03 derived 91–98; S15/R21 JSON; R22 line 31. [Release](https://github.com/pandas-dev/pandas/releases/tag/v3.0.6). |
| F17–F20 | Defaults, global time-key sorting, grouping, compatible nonnegative tolerance, dispatch, inclusive distance limit and backward nearest ties agree with the pinned source. No interpolation is performed. Equality default is an allowed product choice; the candidate does not claim an unconfigured equality merge retains gaps or validates nulls/duplicates. S09 145–218,657–740,917–934,2447–2651; S10 687–880; S11 2037–2061,2818–2846. [Public definition/caller](https://github.com/pandas-dev/pandas/blob/2905718b126579d2cf0fe5bae05bd75facb67d77/pandas/core/reshape/merge.py#L657), [compiled nearest routine](https://github.com/pandas-dev/pandas/blob/2905718b126579d2cf0fe5bae05bd75facb67d77/pandas/_libs/join.pyx#L830). |
| F22,F24 | The historic fix really shipped; the current source is separately checked. No old-issue-to-current-defect inference is made. D1 affects the history's conditions/test interpretation, not the verified fix identity or release. |
| F25–F27 | Options, provenance/review/privacy and validation boundaries were checked throughout the final. They are proposed design decisions with unresolved inputs, not empirical claims of a built or validated notebook. |

## 3. Bounded discovery, alternatives, negative and opportunity coverage

The useful discovery covers actual data/metadata products, station prediction classifications, external measurement/reference guidance, a citizen-science analogue and concrete alignment machinery. It is adequate substantive discovery beyond the initial plan entries. The primary corpus has limits: it is concentrated on NOAA and pandas, no concrete plotting-library alternatives are surveyed, and the harbour jurisdiction and station/site relationship remain unknown. The final leaves plotting, station selection and mapping requirements open instead of claiming demonstrated suitability. I do not treat that acknowledgment as feasibility proof, or claim exhaustive opportunity recall.

All five negative/limited leads at D:92–96 survive at F:109–113 and were assessed: OFS as primary reference; annual RMS as universal threshold/calibration; invented dense subordinate series; photo/GPS reports as standardized gauges; and silent zero-centering/interpolation/unbounded-age matching. The first four are grounded in their specific NOAA sources; the last is an explicit question-preserving product constraint. The artifact retains an optional interpolation route with conditions, so its rejection concerns silent transformation rather than all interpolation.

All eight open questions at D:100–107 survive at F:117–124: volunteer convention/setup evidence; selected station/geographic/class relationship; observed contextual series; matching tolerance/tie/interpolation policy; epoch-specific benchmark evidence; calendar versus contiguous month; plots/summaries; and export privacy. Event-only comparisons and static/interactive plots are preserved alternatives. No mandatory obligation is excused merely because the answer labels it uncertain; these are genuinely unsupplied product inputs rather than substitute research answers.

## 4. Incorrect corrections, rejections and already-covered claims

| Criticism | Assessment of disposition |
|---|---|
| C1, F:16 | Supported clarification of an alignment hazard. The draft was ambiguous; the final correctly explains the unconfigured backward/unbounded default and makes the exact policy explicit. It does not prove every configured as-of exact strategy is invalid. |
| C2, F:17 | Supported: no public tie parameter; backward tie at pinned implementation. Adopting/testing it, wrapping, or retaining unresolved ties remain options. |
| C3, F:18 | Supported: compatible zero tolerance is API-valid; strictly positive finite approximate tolerance is product policy. |
| C4, F:19 | Supported correction separating measured-data and tide-prediction limits. |
| C5, F:20 | **Incorrect; D1.** An obsolete review is applied to the revised regression test and valid-input applicability is lost. The refusal to extrapolate to general grouped/nearest correctness remains sound. |
| C6, F:21 | Supported with limits: benchmark/reference guidance is relevant; actual mapping and cross-site equivalence are not demonstrated. Conservative design inference is labeled. |
| C7, F:22 | Supported: live docs/metadata do not prove historical run state, so snapshots remain required. |

The six already-covered dispositions at F:100–105 are true against precise P:7,11,15,19,23,27 respectively. The frozen plan really has the claimed file/provenance, raw/unresolved, gap/declared-comparison, review/export, offline/privacy and validation commitments. NOAA applicability justifies retaining them; it does not claim the frozen plan already covered the added exact/API/tie/epoch details. No false already-covered disposition or other material rejected-lead error was found. The blanket tolerance wording in F:102 is imprecise for an equality join; F:55,69 correctly restrict finite positive tolerance to approximate matching, so this is a nonmaterial rationale limitation rather than a changed exact-match requirement.

## 5. Preservation through finalization

The preservation inventory contains **33 replacement-plan clauses**, **six already-covered entries**, **five rejected/limited leads**, **eight open product questions**, **seven visible criticism dispositions**, plus **one history** and **one discovery-content** group: **61 assessed, zero unassessed**. Within the 33 replacement clauses, 28 are textually unchanged and five are clarified or corrected: P3 matching, P4 live-snapshot caveat, P5 alignment, P5 retrieval limits and P6 matching tests. Text identity was only a comparison aid; the actual semantics were checked.

Raw data, setup epochs, datum/time uncertainty, no implicit calibration, no station-equivalence inference, observed context as optional, gaps, residual sign, descriptive summaries, event annotations, reviewer alternatives, local/private operation and exported context remain. The eight product questions and five negative leads are retained verbatim in substance. All seven criticism dispositions remain visible; there is no undisclosed disagreement in the admitted criticism artifact to reconstruct.

The material preservation failure is the history: the researcher correctly retained an index-based tolerance regression test and its bounded applicability. The final's C5 qualification incorrectly discounts that revised test and narrows the affected conditions. Merely keeping a visible disposition is not correct preservation when the governing evidence is misread. This is the same D1, not a second error count.

F:24 discloses that finalizer inspection followed plan reading, while F:128 carries the research-stage discovery-order assertion. I interpret that carefully as retained researcher attribution, not independently verified finalizer chronology. No sequence is proven from counters or timestamps.

## 6. Validation proposed versus executed; witness applicability

All eight P6 categories were assessed: input integrity; time; vertical/unit handling; station/epoch changes; matching; API/month; analysis/exports; and review. Together they address every original acceptance obligation. They remain **proposed**, and the final explicitly says there was no application build, runtime test, acceptance-suite execution or numerical volunteer/reference result. No executed numerical witness is presented to assess for application applicability. The historical/current upstream tests are source evidence only; they were not executed in this review or claimed as application runs. D1 records their incorrectly narrowed source-level reach separately.

My executed checks were read-only evidence capture, static code/caller/test/release inspection, complete artifact and preservation comparison, full NOAA PDF text extraction plus relevant first-page visual inspection, and output/map integrity checks. No downloaded code, upstream test or application was executed. The plan's tolerance, grouping, tie, null/duplicate, datum/DST and export cases require an implementation to test later; no result is implied by listing them.

## Review limits and separation from host reporting

The admitted paths visibly name the arm, and method-specific prose/critic-finalizer structure reveal procedure. Artifact headers and source maps expose native Goal identifiers, lifecycle labels, timing and counters. I ignored those for scientific judgment; they are a blinding limit, not evidence of source correctness. No counterpart output/grade, parent analysis, evaluator answer, expected winner, cost target or speed target was supplied or accessed. Critic family/identity, operational independence, lifecycle timing and unknown quota/usage fields remain host concerns; no SourcePASS is inferred from delivery or identity.

Independent captures were made on 2026-10-07; exact UTC access starts/completions and HTTP metadata are preserved in the capture manifest. Thirty-one public responses were successfully saved. Two optional extra GitHub API tag lookups were rate-limited; their failures are recorded and no finding depends on them. Immutable parent/fix/revised-test/released/current files and official release records establish the controlling facts without those optional lookups. NOAA pages remain live/unversioned snapshots; the PDF is undated and does not establish present station accuracy. No actual volunteer input or chosen-station run was provided, so local scientific applicability remains unproven as the final itself requires.

The source judgment is **FAIL**, rather than FULL_PASS or PASS_WITH_LIMITATIONS, because D1 materially corrupts the required issue/regression interpretation and its preserved criticism disposition. This assessment nonetheless covers the entire declared scientific scope. Token usage, billing and cost are **null/unknown**; none were invented. No candidate feedback or rewritten candidate answer was produced.
