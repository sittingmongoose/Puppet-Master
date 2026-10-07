Source judgment: **FAIL**. The full declared scientific scope was assessed. Two material errors remain in the final's interpretation of pandas issue #35558 and its regression evidence: **D1**, the failure is described as incompatible-tolerance error-path behavior without its governing no-grouping condition or its effect on valid tolerances; **D2**, an early review of a different test revision is used to discount the corrected test shipped in v1.1.1. These errors affect required O3 and consequential component-history claims. The nearest-matching mechanism, NOAA product distinctions, safety limits, and most proposed plan changes are supported. This is a complete assessment with a failure judgment, not a localized diagnostic that leaves the rest unassessed.

The authoritative candidate is the complete 167-line `jobs/I-FAST-02/control/reviser-v1/artifact.md`, SHA-256 `3132f56c20cbf09f84db8bac3138371fd2e8279654b09505eb701b0ba8825c03`. The reviewer read the complete original brief and frozen plan, complete own-arm research and critique, the final and its source map, and the admitted linked captures. Exact copied inputs and captures are retained under [sources/admitted](sources/admitted/); [admitted-manifest.json](sources/admitted-manifest.json) records original absolute paths and independently computed byte hashes. Original source maps are advisory indexes. Their labels, hashes, counters and exit statuses were not treated as source truth.

Only the explicitly admitted arm/case inputs and current public primary sources were consulted. No candidate feedback, child reviewers, native Goal, account changes, private data, worktrees, source edits, repository/canon edits, issues or PRs were created. The public GitHub PR was read solely as source history; this review performs no PR work.

**Blinding and excluded host facts.** The allowed paths visibly name the arm, and artifact structure and native-Goal/procedure prose reveal aspects of the procedure. Source maps expose author timing and counters; those fields were ignored for scientific judgment. No counterpart output/grade, comparative cost/speed/winner target, parent analysis or evaluator answer was consulted. Candidate provider/family, dispatch independence, lifecycle, timing, billing, quota and identity assertions were not independently verified and are not inferred from delivery. O5's substantive criticism and preservation are assessed below; its family/dispatch predicates remain host facts with null reviewer judgments. There is no comparative judgment.

**Coverage counts and meaning.** “Complete” below denotes the declared number of items, not successful candidate compliance. Every item was examined and receives a finding. Open product choices are assessed as open; acknowledging an unresolved scientific obligation does not make that obligation satisfied.

| Category | Complete | Assessed | Unassessed |
|---|---:|---:|---:|
| Original obligations O1–O6 | 6 | 6 | 0 |
| Frozen scope constraints S1–S7 | 7 | 7 | 0 |
| Frozen plan decision atoms | 36 | 36 | 0 |
| In-scope owner choices | 22 | 22 | 0 |
| Declared obligation items, sum of the four rows above | **71** | **71** | **0** |
| Review axes | 6 | 6 | 0 |
| Consequential claim clusters K01–K24 | 24 | 24 | 0 |
| Consolidated criticism dispositions | 16 | 16 | 0 |
| P6 validation proposal groups | 8 | 8 | 0 |

Material error count is **2**, identities D1 and D2. These are distinct wrong conclusions about one history: triggering conditions and revision-aware regression applicability. L1–L3 are precision limitations, not additional material errors. Categories overlap semantically and must not be interpreted as independent samples or pooled into a performance score. No required scientific obligation or consequential claim cluster is left unassessed. Unknown host facts and the unsupplied station/data choices are explicitly bounded below.

**One coherent six-axis assessment.**

| Axis | Result | Basis |
|---|---|---|
| A1 — Original brief, every in-scope plan and owner obligation | Assessed; failure | All six obligations and all P1–P6 atoms/owner choices checked. O3 is not correctly satisfied despite the real tagged fix. |
| A2 — Consequential claims, conditions and versions | Assessed; failure | K01–K24 checked. D1 and D2 are contradicted by governing code and revision-specific source history. Historical nearest behavior is otherwise supported. |
| A3 — Bounded discovery, mechanisms, alternatives, negative/opportunity coverage | Assessed; pass with limitations | NOAA observation/prediction products, manual UI analogue, metadata/history, and pandas versus an explicit matcher are useful. One-provider evidence establishes no geographic suitability or provider superiority. No exhaustive opportunity recall is claimed. |
| A4 — Incorrect corrections/rejections and already-covered dispositions | Assessed; failure | D2 incorrectly discounts the released upstream regression detector. L1 leaves a request-limit rejection ambiguous. Other policy corrections and inherited dispositions are substantively justified. |
| A5 — Preservation through critique and final | Assessed; pass with limitations | All 16 consolidated substantive critique dispositions survive; nearest default becomes an open option. Scientific errors D1/D2 are preserved too. Tie-policy and exact metadata-field detail are less explicit than claimed. |
| A6 — Proposed versus executed validation; witness applicability | Assessed; failure | All eight P6 groups remain visibly proposed. No application/data/performance/usability witness exists or is claimed. The upstream test's applicability is incorrectly discounted (D2). |

**Material findings and exact evidence.** All `R` identifiers resolve to URLs, versions, access timestamps, HTTP metadata, local source paths and SHA-256 hashes in [source-checks.json](source-checks.json). HTML evidence ranges below are numbered lines of the saved normalized `.text.txt` derivative beside the original HTML. Code ranges are original file lines; JSON ranges are object pointers. Derived text is not substituted for original capture bytes.

**D1 — Mischaracterized and underspecified governing conditions for the tolerance regression.**

Claim locations: final lines **27, 84, 107 and 130**; inherited research lines 85–87; critique lines 17, 27 and 75. The final describes #35558 as an incompatible-tolerance error-path issue, omits the consequential absence of grouping keys, and uses that interpretation when discounting compatible-match regression evidence. The defect is the missing governing condition and normal-path reachability; it does not depend merely on disliking the label “error path.”

The actual old path constructs the message whenever tolerance is present, before checking compatibility. With both indexes and no grouping key, the superclass returns empty merge-key lists, the dtype-check loop does not bind `lk`, and message formatting fails even for a valid positive `Timedelta`. This is a normal bounded timestamp-match failure, not a case requiring an invalid tolerance. Grouping can bind `lk` and change whether the defect is reached. The issue's reported reproduction uses valid datetime indexes and a valid tolerance without `by`.

Evidence:

- R31: [pandas v1.1.0 merge.py](https://github.com/pandas-dev/pandas/blob/d9fff2792bf16178d4e450fe7384244e50635733/pandas/core/reshape/merge.py#L1198), saved as `sources/public/pandas-1.1.0-immutable-merge.py`, immutable commit **d9fff2792bf16178d4e450fe7384244e50635733**. Governing context: constructor calls at 645–652; `_MergeOperation._validate_specification` 1198–1203; superclass `_get_merge_keys` 951–1065; `_AsOfMerge._get_merge_keys` 1632–1675; `_any` 2048–2049.
- R32: [common.py at the same old commit](https://github.com/pandas-dev/pandas/blob/d9fff2792bf16178d4e450fe7384244e50635733/pandas/core/common.py#L197), `sources/public/pandas-1.1.0-common.py`, `any_not_none` 197–201 and `maybe_make_list` 268–271 complete the empty-key interpretation.
- R33: public `git ls-remote` advertisement, `sources/public/pandas-v1.1.0-ls-remote.txt`, resolves v1.1.0's annotated tag **d9c3f01140844e4efe6edee0b0d7b2b88fb13c6c** to that commit. R24 separately captures the tag reference. Two tag-object API attempts were rate-limited; no scientific conclusion is inferred from those failures. R31 bytes also equal the independently fetched v1.1.0-tag file R22.
- R10: [issue #35558](https://github.com/pandas-dev/pandas/issues/35558), `sources/public/pandas-issue-35558.json`, `$.body`, including reproduction and traceback. R12 contains the one-line fix in the PR's file patches. R14, R17 and R18–R19 establish the changed source, release note, and v1.1.1 tag resolution.

This does not allege a present-day pandas defect. It identifies a wrong historical applicability statement required by O3. Requiring future valid and invalid fixtures is useful, but does not correct the authored source interpretation.

**D2 — An obsolete review is applied to the corrected released test.**

Claim locations: final lines **27, 84, 107 and 130**, especially the conclusion that the added successful-match test is a weak regression detector because a maintainer said it passed without the change. Research line 87 and critique lines 27 and 75 carry the same conclusion.

The warning is real, but its revision matters. The 2020-08-11 review is attached to commit **59a07c22c68d5709b1718419007b60ab67f5ccfb**. That test uses a grouping key, so it can bind the local implicated in D1. The author then reports a test correction; the 2020-08-12 corrected source at **e7f668be34081d497bc8142ab0c77bb841e2964b** removes grouping and follows the reported failing path. The released test at **f2ca0a2665b2d169c97de87b8e778dbed86aea07** retains the corrected no-grouping reproduction.

Evidence:

- R13: [PR #35654 review](https://github.com/pandas-dev/pandas/pull/35654#pullrequestreview-464891484), `sources/public/pandas-pr-35654-reviews.json`, first review `commit_id`, `submitted_at`, `body`; the exact review URL is also in that object's `html_url`. The review is revision-bound, not a conclusion about all later test versions.
- R28: [early test source](https://github.com/pandas-dev/pandas/blob/59a07c22c68d5709b1718419007b60ab67f5ccfb/pandas/tests/reshape/merge/test_merge_asof.py#L1343), `sources/public/pandas-pr-early-test.py`, 1343–1356.
- R21: `sources/public/pandas-pr-35654-issue-comments.json`, first comment's `created_at` and `body`, reports the correction on 2020-08-12. This comment is also present in admitted research S21, so the correction was available inside the reviser's allowed evidence set.
- R25: [PR commits](https://api.github.com/repos/pandas-dev/pandas/pulls/35654/commits), `sources/public/pandas-pr-35654-commits.json`, commit SHAs and dates. R29: [corrected test](https://github.com/pandas-dev/pandas/blob/e7f668be34081d497bc8142ab0c77bb841e2964b/pandas/tests/reshape/merge/test_merge_asof.py#L1343), `sources/public/pandas-pr-corrected-test.py`, 1343–1362.
- R16: [released test](https://github.com/pandas-dev/pandas/blob/f2ca0a2665b2d169c97de87b8e778dbed86aea07/pandas/tests/reshape/merge/test_merge_asof.py#L1343), `sources/public/pandas-1.1.1-test_merge_asof.py`, 1343–1363. The no-grouping call reaches D1 in the old implementation, before tolerance validation; successful matching is therefore directly pertinent to that regression. R14's changed `lt` expression explains why the failure disappears.

This is **static source/control-flow evidence**, not an executed test witness. The reviewer did not run pandas or downloaded code. The corrected test is a targeted regression detector by inspection; it does not prove every matching condition, tide-domain correctness, accuracy, or current-version behavior. The final correctly keeps those broader limits but incorrectly rejects the test's targeted value. Preserving a critique's uncertainty without revisiting its governing revision does not satisfy O3.

**Other consequential source checks, enumerated completely.**

| Check | Assessed finding and applicability | Evidence and final location |
|---|---|---|
| K01 | Separate measured/predicted products and preliminary/verified states are supported; flag meanings are product-specific. | R1 text 133–164; R2 text 27–82, 222–235; final 19, 39, 58, 97. |
| K02 | Water-level datum is required; station datum is local. A volunteer mapping requires separate evidence. | R1 text 254–296; R4 text 135–154, 210–227; final 19, 50–51, 94. |
| K03 | GMT, fixed LST and DST-adjusted local time are distinct. Unresolved folds remain a proposed interpretation gate. | R1 text 318–339; final 19, 42, 52, 92. |
| K04 | Observed-data duration limits are per request. The final's month-level rejection is ambiguous (L1). | R1 text 98–109, 160–164; final 45, 154. |
| K05 | Prediction intervals have different product/range semantics. Finer spacing supplies no accuracy or independence guarantee. | R1 text 340–365; R6 text 68–84; R7 text 62–81; final 61–64, 96. |
| K06 | Harmonic interval products and subordinate high/low products are distinct; subordinate heights use MLLW. Internal reference metadata does not add a downloaded comparison station. | R6 text 68–71; R3 text 535–551, 1012–1037; final 21, 40–41, 62, 93. |
| K07 | Quarterly updates support preserving request-time prediction metadata and prior states. | R6 text 99–105; R9 text 59–83; final 21, 40, 93. |
| K08 | Datum/sensor/detail/benchmark/offset resources exist. Exact field-level critique adoption is incomplete (L3). | R3 text 95–118, 535–551, 718–759, 842–863, 1012–1037; final 21, 40, 131. |
| K09 | Harmonic prediction and meteorological/location limits support descriptive residuals. | R7 text 55–81; R8 text 482–489; final 23, 33, 76. |
| K10 | Distance/NOAA metadata do not establish volunteer reference, site equivalence or history. This is a justified bounded inference. | R4 text 135–154, 210–227; R8 text 482–485; final 43, 50–53. |
| K11 | v1.1.1 pin and released fix are supported independently of PR merge status. | R18–R19 object pointers; R14 1660–1675; R17 3, 30; final 25, 27, 82, 84. |
| K12 | Sorted/numeric-or-datetime keys and direction/tolerance/exact controls are supported historically. | R14 291–367, 546–563, 1588–1630, 1720–1750; final 25, 82–83. |
| K13 | Datetime conversion, sorted/null checks and both grouped/ungrouped dispatch are supported. | R14 1514–1521, 1720–1789; final 25, 82–83, 95. |
| K14 | Eligible duplicate selection and backward equal-distance ties are row-order-dependent. | R15 668–852 and 859–998; final 25, 65, 82, 137. |
| K15 | The inspected matcher selects source rows and does not interpolate. Gap exclusion remains a separate proposed policy. | R14 546–563, 1786–1789; R15 966–998; final 62, 82, 95. |
| K16 | **Contradicted; D1.** Valid no-grouping index matching is affected by the old tolerance-message failure. | R31/R32/R10 and D1 above; final 27, 84, 107, 130. |
| K17 | The one-line dtype fix and shipped release are real; narrow patch size does not make valid-tolerance triggering irrelevant. | R12 patches; R14 1660–1675; R17 30; R19 target; final 27, 84. |
| K18 | **Contradicted; D2.** Early warning is not applicable to the corrected released test. | R13/R21/R25/R28/R29/R16 and D2 above; final 27, 84, 107, 130. |
| K19 | Proposed application validation is distinguished from actual work; no application witness is presented. | Final 15, 90–99, 167; research 60, 109; critique 11, 89. |
| K20 | Local/private defaults and export safeguards preserve frozen P5; actual redaction is untested. | Frozen plan 23; brief 65–68; final 33, 44, 73–76, 81, 86, 98. |
| K21 | Declared descriptive residuals, epoch separation and cadence-qualified coverage are coherent proposals. | Frozen plan 11, 15, 19, 23; R8 text 482–485; final 49–54, 58, 67–69. |
| K22 | Matching alternatives remain open, with owner rationale. Explicit tie declaration is less complete (L2). | R14 291–367; R15 966–998; research 94–96; final 54, 59–66, 82–85, 95, 148, 155. |
| K23 | Inherited/rejected dispositions checked; additions must not be mistaken for inherited detail. L1/D2 limit rejection correctness. | Frozen plan 7, 11, 15, 19, 23, 27; final 112–155. |
| K24 | Historical pin is not a deployment recommendation; no demonstrated speed reason or current support is asserted. | Frozen P5; research 55, 95–96; critique 25, 62; final 35, 81–86, 105, 129, 148, 155. |

Primary NOAA API documentation, response help, prediction help, harmonic and FAQ pages were recaptured from their official URLs on 2026-10-07 and match the relevant admitted bytes. Metadata documentation identifies v1.0; the data/prediction pages expose no immutable service release. Datum and dynamic history pages were independently captured as well; differing bytes are retained rather than called a scientific conflict. Source-checks contains actual access times and headers. [NOAA Data API](https://api.tidesandcurrents.noaa.gov/api/prod), [response help](https://api.tidesandcurrents.noaa.gov/api/prod/responseHelp.html), [Metadata API](https://api.tidesandcurrents.noaa.gov/mdapi/prod/), [prediction help](https://tidesandcurrents.noaa.gov/noaatidepredictionshelp.html), [datum definitions](https://tidesandcurrents.noaa.gov/datum_options), [harmonic explanation](https://tidesandcurrents.noaa.gov/about_harmonic_constituents), [FAQ](https://tidesandcurrents.noaa.gov/faq.html) are the governing pages.

For code, all core v1.1.1 files recaptured at **f2ca0a2665b2d169c97de87b8e778dbed86aea07** match their admitted bytes. The original map names the grouped nearest kernel, but the no-`by` caller selects the ungrouped `asof_join_nearest`; the reviewer inspected both. Their relevant tie/duplicate conclusions agree, so this mapping imprecision is not an additional material failure. Admitted supplemental issues #14887 and #53279 were examined for their relevance; they are not used to invent current defects or released fixes and no final claim depends on a full new history of them.

**Original obligation adjudication.**

| Obligation | Assessment |
|---|---|
| O1 | Substantive bounded discovery met with limits: products, station resources/history and manual UI analogue extend the bare plan; alignment mechanism and explicit matcher alternative are useful. Source counts and a claimed opening sequence do not prove chronology. Neither another provider comparison nor exhaustive recall is demanded by this bounded brief; the lack of geography prevents provider suitability from being settled. |
| O2 | Historical code obligation met with precision limits: immutable source, wrapper, validation/caller and nearest kernels are inspected. Current deployment support is deliberately left open. D1 is a wrong history-path interpretation, not a fabricated code pin. |
| O3 | **Not correctly met:** issue, patch and release are real, but affected conditions and regression evidence are misjudged (D1/D2). Labeling the obligation “partially met” does not excuse those errors. |
| O4 | All 36 frozen decision atoms are compared and receive coherent retain/change/option/unresolved dispositions. Minor inherited/addition labels and L1–L3 reduce precision. No whole-project cross-reference is assumed. |
| O5 | All substantive criticism is preserved and adjudicated. Family/dispatch eligibility remains host-only and is not asserted as verified. D1/D2 show that adopting a critic is not source verification. |
| O6 | A full coherent replacement plan exists, with options, product choices, already-covered/rejected topics, validation and uncertainty. It is structurally complete; the source-history errors prevent a scientifically passing final. |

**Every frozen plan decision.** References in the third column are final artifact lines. Frozen owner references are P1 at original plan line 7, P2 at 11, P3 at 15, P4 at 19, P5 at 23, and P6 at 27. Every row was assessed; “retained” describes the proposed product behavior, not empirical acceptance.

| ID | Frozen requirement and assessed disposition | Final lines |
|---|---|---|
| P1.1 | Two-location volunteer CSV import retained; raw rows/epochs added. | 39, 43 |
| P1.2 | Authorized public prediction/observation source for one station retained; optional observed series stays same-station. | 35, 39–41, 58 |
| P1.3 | Source retention retained; immutable bytes/hashes are supported additions. | 39, 73 |
| P1.4 | Retrieval time retained in records and exports. | 39–40, 75 |
| P1.5 | Station metadata retained; snapshots and change states added. | 40, 73, 93 |
| P1.6 | Stated reference datum retained; mapping is separately evidenced. | 39, 42, 49–51 |
| P2.1 | User time-convention selection retained. | 42, 49, 52 |
| P2.2 | User unit interpretation retained. | 42, 49–50 |
| P2.3 | Justified reference-level mapping retained; circular offsets rejected. | 50–54 |
| P2.4 | Raw/interpreted separation retained. | 42, 50–51 |
| P2.5 | Missing-information comparisons remain unresolved. | 51, 54, 74 |
| P3.1 | Selected-month aligned views retained; subordinate event mode is bounded. | 58–64 |
| P3.2 | Observation/reference gaps retained and made visible. | 61–62, 67 |
| P3.3 | Residual for a declared comparison retained with sign/context. | 50–54, 58, 75–76 |
| P3.4 | Simple descriptive summaries retained as owner choices. | 67–68 |
| P3.5 | Candidate event annotations retained as notes/predicted markers. | 69, 148 |
| P3.6 | No autonomous recalibration retained. | 33, 50, 76 |
| P3.7 | No operational forecast retained. | 33, 76, 99 |
| P4.1 | Station changes retained in explicit epochs/snapshots. | 40, 43, 73, 93 |
| P4.2 | Interpretation choices retained in declarations. | 54, 73–75 |
| P4.3 | Source ranges retained. | 39, 73, 75 |
| P4.4 | Reviewer comments retained with privacy treatment. | 69, 73, 75 |
| P4.5 | Competing interpretations retained until a view choice. | 51, 54, 74 |
| P4.6 | Chosen context exported with reproducibility proposals. | 75–77 |
| P5.1 | Public client remains a candidate decision, no forced deployment. | 35, 81 |
| P5.2 | Alignment remains undecided; pandas/custom mechanism offered. History rationale has D1/D2. | 59–64, 82–85 |
| P5.3 | Plotting remains undecided. | 85, 148 |
| P5.4 | Local after download retained. | 33, 81, 86 |
| P5.5 | Coverage exposure retained, percentage conditional on cadence. | 67–68, 86, 97 |
| P5.6 | No required location publishing retained; privacy defaults strengthened. | 44, 75, 86, 98 |
| P6.1 | Timestamp-change validation proposed. | 90, 92 |
| P6.2 | Station-metadata-change validation proposed. | 90, 93, 98 |
| P6.3 | Absent-reference-level validation proposed. | 90, 94 |
| P6.4 | Missing-interval validation proposed, with matching cases. | 90, 95, 97 |
| P6.5 | Reproducible exports proposed; no executed witness. | 77, 90, 98 |
| P6.6 | No supplied numerical summary/calibration answer. | 15, 33, 90, 148, 167 |

S1–S7 are all preserved: two locations, one reference station, one month, local-after-download behavior, read-only source/infrastructure access, no navigation advice and no surge prediction (final 13, 33, 35, 39, 44, 58, 76, 81, 99). Optional same-station observed data and subordinate internal metadata do not add a second comparison station. Review annotations and local saved states are consistent with immutable imports and the frozen review workflow.

**Every in-scope owner choice.** These 22 choices arise from frozen undecided components and the draft/critique's open decisions. They are assessed as deliberately open, not treated as completed source discovery. Source semantics constrain admissible choices; they cannot supply unsupplied volunteer facts. A specific station, geography or numeric tolerance is not required to make this proposal complete.

| ID | Choice and preserved condition | Final lines |
|---|---|---|
| OD01 | Geography open; no universal NOAA reach inferred. | 35, 148 |
| OD02 | Month open. | 15, 148 |
| OD03 | Authorized provider open; alternatives need documented semantics. | 35, 81 |
| OD04 | Exact station/type/product availability open and checked at retrieval. | 35, 40–41, 93 |
| OD05 | Same-station observed series optional and separately labeled. | 58, 153, 155 |
| OD06 | Volunteer units declared before transformation. | 42, 49–50 |
| OD07 | Volunteer measurement reference remains user-evidenced. | 42–43, 49–51, 148 |
| OD08 | Time/zone/DST interpretation declared; ambiguous civil time unresolved. | 42, 49, 52, 92 |
| OD09 | Epoch boundaries/change history declared or unknown. | 43, 53, 68 |
| OD10 | Expected cadence open; no invented coverage denominator. | 43, 61, 67 |
| OD11 | Vertical mapping requires evidence and reviewer attribution. | 50–54, 94, 148 |
| OD12 | Exact, finite nearest or labeled interpolation remain choices. | 59–62, 155 |
| OD13 | Prediction interval chosen only for a supported station/product. | 54, 61, 64, 96 |
| OD14 | Finite tolerance requires time/cadence/purpose rationale. | 54, 61, 83, 135 |
| OD15 | Tie behavior must not silently use library defaults; declaration detail limited (L2). | 82–83, 95 |
| OD16 | Duplicates retained/flagged; reference ambiguity suppresses affected residuals; later rule requires evidence. | 54, 65–66, 95, 137–138 |
| OD17 | Quality/flag inclusion remains reviewable. | 54, 67, 75, 97 |
| OD18 | Summary metric/epoch combination require a visible choice. | 68, 148, 155 |
| OD19 | Event workflow open; causes/operational labels are constrained. | 69, 148 |
| OD20 | Plotting/format/runtime/packaging remain open. | 85, 148, 155 |
| OD21 | Privacy-safe labels default; further disclosure remains an owner choice. | 44, 75, 98, 148 |
| OD22 | Local retention remains open. | 142, 148 |

**Preservation and all criticism dispositions.** All 16 consolidated rows in the final's criticism table were checked against the entire 89-line critique, not accepted from the table's own adoption labels. Research P1–P6, non-goals, uncertainty and substantive options remain represented. The only substantive draft policy reversal is nearest-as-default becoming an owner choice; finite tolerance, exact join and conditional interpolation remain available. New duplicate-reference suppression is an explicit conservative default rather than an undocumented kernel behavior.

| Criticism | Critique lines | Final disposition and assessment |
|---|---|---|
| Scientific limits/raw separation | 15, 42, 48, 79 | Final 127 and P1–P4 retain them; supported. |
| NOAA candidate, limited provider discovery | 25, 60 | Final 128/35/81 retain the limitation; no superiority claim. |
| Historical pandas versus deployment support | 17, 26, 62, 80 | Final 129/82–85 retain historical-only applicability. |
| Issue/fix/regression-test caution | 17, 27, 75, 80 | Final 130/27/84 adopt it, but D1/D2 show the adopted interpretation is wrong. |
| Exact metadata snapshot/classification | 36, 71 | Final 131/40/73 preserve resources and immutability; exact field adoption is partial (L3). |
| Filename/label/comment privacy | 38, 56 | Final 132/44/75/98 preserve concrete checks. |
| Datum label versus documented transformation/reviewer | 42–44 | Final 133/50/94 preserve evidence attribution and unresolved gates. |
| Distance is not representativeness | 44 | Final 134/53 preserve the limit. |
| Tolerance/interval and nearest default | 19, 50, 81 | Final 135/59–64/146 adopt owner rationale; nearest remains optional. |
| One-minute spacing is not accuracy/independence | 19, 50, 81 | Final 136/64/96 preserve the caveat. |
| Duplicate reference row-order policy | 17, 52, 66, 81 | Final 137/65/95 adopt flag/suppression; later deterministic rule remains conditional. |
| Volunteer duplicates not independent validation | 52 | Final 138/66 preserve rows and qualification. |
| Rebuilt export/metadata state, no screenshot witness | 56 | Final 139/74/77/98 preserve it as a proposal. |
| Repeated civil-time expected behavior | 66 | Final 140/42/92 preserve unresolved behavior unless interpretation declared. |
| Complete P1–P6 and safety/privacy scope | 79 | Final 141 and full replacement retain all six sections. |
| Product choices stay open | 83 | Final 142/148 retain them; OD01–OD22 enumerate the conditions and precision limits. |

No substantive criticism is silently rejected or lost. The final's preservation is therefore materially good, while its scientific adjudication is faulty on the history. Copying cautions faithfully cannot make them true. Reviewer disagreement is with the candidate's D1/D2 dispositions, not with the existence of the captured warning.

**Rejections, alternatives and bounded useful discovery.** The exact/nearest/interpolation alternatives survive with their different unmatched/derived-value tradeoffs. The explicit matcher alternative retains its code/review burden and lacks a speed claim. Same-station observed levels, station-history snapshots, finer supported prediction spacing, per-epoch summaries and notes remain useful optional additions. Raw/interpreted separation (frozen P2), files/retrieval metadata (P1), comments/competing interpretations/context (P4), gaps/simple summaries/events/no recalibration or forecast (P3), local/privacy behavior (P5), and the five initial validation topics (P6) are legitimately already covered. Byte hashes, exact UTC handling, export aliases, duplicate suppression and detailed declarations are supported elaborations, not literal inherited requirements. Some “retain” labels in final 116–121 refer to the draft's elaborations; the full replacement makes their proposed status understandable.

Subordinate high/low interpolation is conservatively excluded because it would create a new approximation beyond the supplied continuous product. Silent gap filling, unbounded carry-forward, invisible deduplication, fit-to-residual offsets, causal weather labels, operational thresholds and publishing/accounts are consistently excluded by the product intent. The sources do not independently dictate every product policy; these are explicit conservative choices. A low numerical residual never establishes comparability, and the notebook correctly requires user-supplied reference/time evidence before displaying one.

L1: final 154 rejects a full month of one-minute observations on the shorter documented limit, whereas R1 states a **per-request** limit and final 45 permits chunking. If read as a single-request prohibition the rejection is supported; if read as a product-wide prohibition it is unsupported. Because the proposal already permits splitting, this is recorded as nonmaterial ambiguity rather than a proved loss of the month-long option. The actual availability of one-minute observations for an unsupplied station/month remains unknown.

L2: the draft explicitly lists tie policy among owner choices (research 94–95). The final requires no implicit tie default and names a tie fixture (83, 95), but the view declaration at 54 and explicit owner list at 148 omit that field. The option survives generally; its recorded context is less precise than other matching choices.

L3: the critique asks for exact metadata resources/fields for classification. Final 40/131 name resources and a subordinate identifier in English, but do not specify the returned station `type` values or distinguish `reference_id` from offset-resource `refStationId`. R3 text 535–551 and 1012–1037 supply those definitions. Resources/snapshotting are retained; full field-level adoption should not be inferred from the “adopted” label. This is a plan precision limit without an executed wrong classifier.

O1 is not judged by the number of requests. This is useful discovery beyond the bare plan: source quality/flags, product type, station updates, reference semantics and historical matching behavior all affect the volunteer review need. The scope does not demand every tide service, datum-transformation tool, notebook product or plotting library. Their absence is not claimed as exhaustive opportunity coverage. Geography, actual volunteer practices, actual mapping evidence and current deployment support remain unestablished; the final's gates keep those unknowns consequential rather than treating them as solved.

**Validation proposals versus actually executed work.**

| P6 group | Proposed check/applicability assessed | Actually executed application witness |
|---|---|---|
| 1 — Timestamp | Raw strings retained; explicit offsets and declared conventions resolved; folds/skips/malformed values unresolved. | None |
| 2 — Station/reference history | New snapshots/states; no rewrite of earlier exports; subordinate event data excluded from continuous mode. | None |
| 3 — Vertical reference/units | Evidence-backed conversion; unknown/conflicting references suppress residuals. | None |
| 4 — Alignment | Exact/bounded/tie/duplicates/gaps/null/sort/epoch cases; retained matched row/time/offset; valid and invalid tolerance cases on a future selected version. | None |
| 5 — Prediction interval | Selected station support and correct spacing/accuracy wording. | None |
| 6 — Quality/coverage | Product-specific preliminary/verified/inferred/QA cases and exclusion counts; no percentage without cadence. | None |
| 7 — Export/privacy/reproducibility | Rebuild saved tabular outputs; new metadata state; context and identifiers checked. | None |
| 8 — Safety | Descriptive text with no operational navigation/surge/calibration claims. | None |

The planned checks are applicable and useful at this proposal stage; tolerances, tie/dedup rules and metrics still need owner choices before numeric expected outputs are set. Merely naming a fixture does not validate it. In particular, a finite tolerance alone cannot prove that every data gap is excluded; the final additionally proposes gap cases and prohibits bridging gaps, so that remains an implementation acceptance requirement, not an achieved property.

The candidates present source retrieval/inspection and proposal authoring, not runtime validation. The reviewer actually performed independent public-primary retrievals, byte comparison, source reading and static control-flow/history analysis, plus delivery JSON/reference checks. No upstream regression test, application, product data, build, performance or usability test was executed by the reviewer. A source hash verifies capture identity; a tag/release note plus inspected source verifies release applicability; neither verifies the notebook. D2 is established by revision-specific test source and governing old/fixed control flow, with no invented execution witness.

The complete source-supported judgment is **FAIL** for D1/D2. No required scientific scope remains unassessed. [coverage.json](coverage.json) gives the exact machine-readable scope map; [source-checks.json](source-checks.json) gives every check, defect identity, evidence range, capture URL/version/path and hash. Usage and billing are unknown/null; no cost or quota value is inferred.
