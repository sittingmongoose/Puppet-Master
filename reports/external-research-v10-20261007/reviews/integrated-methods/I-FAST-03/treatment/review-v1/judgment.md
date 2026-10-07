# Independent semantic judgment — I-FAST-03

**Source judgment: FAIL. Assessment is complete for the declared scientific scope. Two distinct material defects were found.** The final is a substantial, coherent proposed replacement and most of its component advice is correctly conditional. It nevertheless misidentifies the historical regression evidence required by O3, and does not retain P6's required uncertainty in the ordinary comparison export. These are separate evidence and scope defects; neither establishes that pandas v3.0.6 is defective or that a dashboard was built incorrectly.

Coverage: **44/44 required coverage units assessed; 0 unassessed** (O1–O6 plus 38 atomic frozen-plan obligations). All **6/6 axes, 6/6 plan owners, 20/20 consequential checks, 6/6 criticism dispositions, and 26/26 preservation comparisons** were assessed. These inventories overlap and are not added together as independent errors. Of the 38 plan atoms, 37 are retained and one is partial. There are no additional supplied owner decisions beyond the six bounded sections. No exhaustive opportunity-recall denominator is claimed.

## Admitted scope and limits

I read the complete original brief (70 lines), frozen plan (27 lines), researcher draft (104 lines), final (76 lines), both complete source maps, and all 28 mapped capture entries (16 distinct capture files). Copies are preserved under `sources/admitted/`. Byte/digest verification is an integrity check, not source judgment. No other arm, case, parent history, campaign state, locks, selections, other reviews, or evaluator materials were consulted. No candidate received feedback and no additional reviewer or child was created.

Public primary-source retrieval and static inspection independently checked consequential claims. The supporting byte files, access metadata, URLs, hashes, definitions/callers, versions and ranges are in [source-checks.json](source-checks.json), [the independent capture manifest](sources/independent-manifest.json), and [the admitted capture manifest](sources/admitted-manifest.json). All relative evidence paths in this report resolve inside:

`/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/integrated-methods/I-FAST-03/treatment/review-v1/`

Blinding is limited: the exact input paths visibly identify the arm, and headings, same-family wording, handoff structure and source-map roles reveal procedure. Author timing/counters and provenance classifications were visible but excluded from scientific judgment. No comparative judgment, expected winner, cost or speed target was supplied or inferred. Provider/family identity, lifecycle, quotas, billing and distinct usage are not established by these source artifacts; unknown fields remain null. The review evaluates substantive criticism, not an authored identity claim. In particular, native terminal delivery or a digest match cannot establish SourcePASS.

## Material findings

**E01 — The claimed version-specific historical regression witness is not what the captured page shows.** Locations: researcher draft line 19; final criticism 1 at line 12; final O3 disposition at line 72; candidate S7/S16.

The draft explicitly says the release note displays corrected values with a suffixed final column and calls that reproducer exact evidence of the original regression and correction. The final retains a “v0.19.0 before/after release-note reproducer” as its O3 evidence. However, the captured live page's old-feature text is rendered within the current pandas documentation. Its “New behavior” block raises the modern duplicate-name `ValueError`, with the current `readers.py` stack; it does not display the claimed successful v0.19.0 result. Both candidate captures and my recapture show this. See [candidate captured page text](sources/admitted/pandas-v0.19.0-whatsnew.review-text.txt), lines 431–472, and [independent page text](sources/independent/pandas-live-v0.19.0.review-text.txt), the same range, from [the live release-note page](https://pandas.pydata.org/docs/whatsnew/v0.19.0.html). Raw HTML and SHA-256 for both candidate captures are retained in C06. The critique's general caveat about parser edge cases does not identify this version/rendering mismatch.

The historical fix itself is real. The original issue describes supplied duplicate `names` on 0.13.0/0.13.1/0.14.0rc1, while duplicate file headers already had suffix handling: [GH-7160](https://github.com/pandas-dev/pandas/issues/7160), captured text lines 124–139. At the immutable v0.19.0 commit **b97dbd01e49f54ae6fa8df382d6f6e4c771d2bc0**, [pandas/io/parsers.py](https://github.com/pandas-dev/pandas/blob/b97dbd01e49f54ae6fa8df382d6f6e4c771d2bc0/pandas/io/parsers.py#L1161) defines `ParserBase._maybe_dedup_names` at lines 1161–1179. The governing `CParserWrapper.read` path uses it before constructing the name-keyed dictionary at lines 1533–1587. The released [original note source](https://github.com/pandas-dev/pandas/blob/b97dbd01e49f54ae6fa8df382d6f6e4c771d2bc0/doc/source/whatsnew/v0.19.0.txt#L195), lines 195–220, documents the change and supplies an expression to render its new result. That source is different evidence from the candidate's live, modern rendering.

I independently found the exact GH-7160 assertion in [v0.19.0 common.py](https://github.com/pandas-dev/pandas/blob/b97dbd01e49f54ae6fa8df382d6f6e4c771d2bc0/pandas/io/tests/parser/common.py#L1320), lines 1320–1332, with the parser test harness at `pandas/io/tests/parser/test_parsers.py`, lines 11, 27–32 and 50–98, applying the shared tests to C high/low-memory and Python readers. At immutable v3.0.6 commit **2905718b126579d2cf0fe5bae05bd75facb67d77**, [test_mangle_dupes.py](https://github.com/pandas-dev/pandas/blob/2905718b126579d2cf0fe5bae05bd75facb67d77/pandas/tests/io/parser/test_mangle_dupes.py#L36), lines 36–54, distinguishes inferred-header preservation from rejection of duplicate supplied names. These are inspected test definitions, not executed tests. They diagnose the missing/misidentified candidate evidence; they are not retroactive completion of candidate O3. The candidate's captured `test_mangles_multi_index` instead cites GH-18062 and exercises multi-row headers. Its honest “related, not exact” qualification is correct but does not satisfy the missing required regression link. This is one material error, not separate errors for each mention or each missing test.

**E02 — Required comparison-export uncertainty is moved into an optional review package.** Locations: frozen plan line 27; draft lines 65/69/78; final lines 45/49/58/70/72. Frozen P6 separately requires input identities, coverage, interpretations **and uncertainty** in a period comparison. The final's ordinary export contract at line 49 specifies identities, coverage and interpretations, plus unit/value metadata and exceptions, but does not require comparison-specific uncertainty. Its export validation proposal at line 58 likewise checks those fields without uncertainty. Explicit export uncertainty appears at line 45 in the opt-in review package. The same distinction was already present in the draft and survives the critic's claim that P6 is retained.

Coverage counts convey missingness, and value semantics/interpretations convey assumptions; they do not by themselves specify disclosure of the remaining uncertainty arising from competing interpretations, unresolved readings or allocation/integration choices. A general non-certification disclaimer and the planning document's remaining-questions paragraph also do not require that information to accompany the comparison output. The original expressly lists uncertainty separately from coverage and interpretations. Accordingly P6.05 is partial, and O4/O6's complete-retention claim is too strong. This is a proposal-completeness finding, not an assertion about an implemented export. Evidence: [frozen plan](sources/admitted/plan.md), line 27; [final](sources/admitted/critic-finalizer-v1-artifact.md), lines 35/37/45/49/58/70/72/76; [draft](sources/admitted/research-v1-artifact.md), lines 65/69/78. C16 preserves exact paths and hashes.

## One six-axis assessment

1. **Original scope and owner decisions — FAIL.** All O1–O6 and every frozen plan atom were assessed against the complete replacement. Core boundaries remain: local operation, one building, three meters/year, descriptive comparison, review of inconsistent exports, privacy, no billing certification, equipment purchasing advice, causal savings or automated control. Parser/store/chart choices remain explicitly conditional. O3's regression evidence is incomplete/misidentified (E01); P6's uncertainty-export obligation is partial (E02). None of the scope was excused because a component was convenient or because a question remained open.
2. **Consequential claims and conditions — FAIL on E01; otherwise supported or explicitly conditional.** The current supplied-name rejection is established by `_read` calling `_validate_names` before `TextFileReader`, at v3.0.6 `readers.py` lines 234–306. The old issue's affected conditions differ from inferred file-header mangling. The parallel issue is not evidence of that path in the selected release. Docs support gap rendering, folds and deployment timezone data, with noted limits. Each checked claim is enumerated below and in source-checks.json.
3. **Useful bounded discovery — PASS_WITH_LIMITATIONS.** The draft begins with the operational need and an energy-domain analogue, then develops parser, interpretation and timezone mechanisms beyond initial plan entries. Final preserves gaps/comparison patterns, a sparse-cumulative failure scenario, CSV/pandas alternatives, upgrade caution and a later optional fill view. Relational versus project-file storage and chart selection remain choices behind acceptance checks. There is no source-backed comparison of concrete storage/chart candidates or a packaging benchmark; no claim of such selection is credited. The brief does not demand exhaustive search or selection of every undecided component. Temporal ordering of actual search operations is not inferred from counters; the available scientific narrative is brief-led. No exhaustive opportunity recall is claimed.
4. **Incorrect corrections/rejections and already-covered claims — FAIL with bounded findings.** Restricting GH-66259 to upgrades is appropriate for the pinned parser path; rejecting unsupported server architecture selection is appropriate; separating folds from gaps and adding raw-byte/CSV handling are useful corrections. Switching conditional preference from pandas to CSV is a product judgment, not a demonstrated speed result. No source proves CSV is universally superior, and final does not claim it. The historical witness remains misidentified within criticism 1 (E01), while the blanket P6 retention disposition overlooks E02. Plan references P1–P6 precisely identify the supplied one-paragraph sections; no absent cross-reference was treated as whole-project coverage.
5. **Preservation through draft, criticism and final — PASS_WITH_LIMITATIONS as preservation, not scientific correctness.** All six objections/dispositions are visible; no separate critique or response was supplied. Most findings, optional paths, negative conclusions and uncertainty remain, sometimes with justified narrowing. The incorrect historical witness and original-export omission are carried forward rather than repaired. The draft's optional event authoring-date/note detail is omitted without changing a required user obligation. See the complete 26-item preservation inventory below.
6. **Validation and witnesses — FAIL on E01's witness identification; proposed/executed separation is sound.** Seven concrete later-sandbox groups cover CSV, clocks, values, review/store, comparisons, exports/privacy and packaging. All are explicitly proposed, with no build, benchmark, meter import or application check represented as executed. Captures and digest checks establish source availability/integrity only. Inspected test assertions do not establish test execution, packaged-app correctness, operational accuracy or released status. The issue author's reported local test passes are not candidate-run or release evidence. The before/after live-page witness does not establish the historical successful result it is invoked to establish.

## Original obligations

| Obligation | Assessed result | Final locations and reason |
|---|---|---|
| O1 | Met with limitations | Lines 12–17, 25, 29, 37, 65–76: bounded useful discovery, alternatives and negative leads; unresolved selection is not an executed comparison. |
| O2 | Met | Lines 12–13/25/45: actual released source and governing current caller; immutable commits independently resolved. Narrow mechanism proof only. |
| O3 | Partial | Lines 12/72: real issue/fix/release supported; relied-on historical regression witness misidentified. Reviewer-only exact tests do not fill candidate research. E01. |
| O4 | Partial | Lines 21–70: six owners compared, 37/38 atoms retained, P6.05 partial. E02. |
| O5 | Substantively met with limitations | Lines 10–17: six real criticisms/dispositions. Family/independence provenance is not verified from self-description or used as scientific evidence. E01 survives. |
| O6 | Partial | Lines 19–76: coherent replacement, alternatives, rejections, validation and remaining questions; required evidence/export gaps prevent entire-scope satisfaction. E01/E02. |

All remaining brief clauses were included in these six assessments: public primary sources and chosen versions, code beyond docs, equivalent-history fallback (not needed because a real issue was chosen), necessary/additional/optional/retained/rejected/uncertain distinctions, preservation of criticism, absent-cross-reference limits, one authored final, later-sandbox validation status, and product non-claims. Scientific artifacts supplied no application witness. Hidden actor permissions/actions or family routing are not invented from an authored paragraph.

## Every frozen plan obligation

The IDs below are review coverage subdivisions of the supplied paragraphs, not new product requirements or WorkNodes. Final line numbers refer to the copied full final. All entries are assessed; “met” here means retained in the proposal, not implemented or verified.

| ID | Required decision/obligation | Final lines | Result |
|---|---|---|---|
| P1.01 | CSV interval export intake | 23-25 | met |
| P1.02 | Three meters and one year | 23,41 | met |
| P1.03 | Preview meter identity | 23 | met |
| P1.04 | Preview interval labeling | 23 | met |
| P1.05 | Preview timestamp convention | 23,37 | met |
| P1.06 | Preview units | 23,35 | met |
| P1.07 | Distinguish interval and cumulative readings | 23,35 | met |
| P1.08 | Immutable originals | 23 | met |
| P2.01 | Local originals store | 29 | met |
| P2.02 | Interpretation choices stored | 29 | met |
| P2.03 | Review flags stored | 29 | met |
| P2.04 | Repeated and overlapping exports reviewed | 29 | met |
| P2.05 | Provenance and no automatic overwrite | 29 | met |
| P3.01 | Daily and monthly totals | 33 | met |
| P3.02 | Time-of-day profiles | 33,37 | met |
| P3.03 | User-selected period comparison | 33,37 | met |
| P3.04 | Missing intervals visible | 33 | met |
| P3.05 | Excluded suspect readings visible | 29,33 | met |
| P3.06 | Estimates never silently measured | 33 | met |
| P4.01 | Competing interpretations retained | 41 | met |
| P4.02 | Operator event labels | 41 | met |
| P4.03 | Descriptive comparison without causal savings | 37,41 | met |
| P4.04 | No tariff or billing conclusions | 41 | met |
| P5.01 | Delimited ingestion component decision/alternatives | 25,45 | met |
| P5.02 | Interval aggregation component decision | 35,45 | met |
| P5.03 | Chart component decision | 37,45,76 | met |
| P5.04 | Local operation on normal laptop | 45,59 | met |
| P5.05 | Identifiers excluded unless explicitly selected for review package | 45,58 | met |
| P6.01 | Period comparison export | 49 | met |
| P6.02 | Input identities exported | 49 | met |
| P6.03 | Coverage exported | 49 | met |
| P6.04 | Interpretations exported | 49 | met |
| P6.05 | Uncertainty accompanies comparison export | 45,49,58 | partial |
| P6.06 | Counter reset checks proposed | 55 | met |
| P6.07 | Overlap checks proposed | 56 | met |
| P6.08 | Clock transition checks proposed | 54,57 | met |
| P6.09 | Unit handling checks proposed | 55 | met |
| P6.10 | Aggregation reproducibility checks proposed | 55,57,58 | met |

## Consequential source-check inventory

All 20 checks were assessed; none remains unassessed. “Supported as proposal” distinguishes a coherent requested rule from an implemented library guarantee. Exact raw-source paths/URLs/versions/ranges/hashes are attached to each C ID in [source-checks.json](source-checks.json).

| Check | Consequential finding | Result |
|---|---|---|
| C01 | Emoncms graph/coverage analogy | SUPPORTED |
| C02 | Emoncms architecture applicability | SUPPORTED_WITH_LIMITS |
| C03 | Emoncms issue 142 caution | SUPPORTED_WITH_LIMITS |
| C04 | GH-7160 original affected conditions | SUPPORTED |
| C05 | Historical fix definition and governing caller | SUPPORTED |
| C06 | Claimed historical before/after release-note witness | CONTRADICTED |
| C07 | Current duplicate supplied-name rejection | SUPPORTED |
| C08 | Current tests and missing regression history | SUPPORTED_BUT_REQUIRED_CHAIN_INCOMPLETE |
| C09 | CSV raw-field/width preservation conditions | SUPPORTED_WITH_LIMITS |
| C10 | Parallel path applicability to v3.0.6 | SUPPORTED |
| C11 | Closed issue does not establish released fix | SUPPORTED_WITH_LIMITS |
| C12 | ZoneInfo folds and deployment data | SUPPORTED_WITH_METADATA_LIMIT |
| C13 | Nonexistent wall times need validation | SUPPORTED_AS_PROPOSAL |
| C14 | Energy, power, registers and arithmetic | SUPPORTED_AS_PROPOSAL |
| C15 | Calendar coverage, DST and boundary policies | SUPPORTED_AS_PROPOSAL |
| C16 | Export obligation and uncertainty | INCOMPLETE |
| C17 | Component recommendations and product boundaries | SUPPORTED_AS_CHOICES |
| C18 | Proposed versus executed validation | SUPPORTED_WITH_WITNESS_DEFECT |
| C19 | Bounded discovery, alternatives and opportunities | SUPPORTED_WITH_LIMITS |
| C20 | Complete comparison, criticism and preservation | COMPLETE_ASSESSMENT_WITH_DEFECTS |

Additional governing conditions: Python's [CSV documentation](https://docs.python.org/3.14/library/csv.html) supports string rows and newline handling, while `strict` defaults false (review text lines 64–79 and 366–368). An explicit conversion dialect such as `QUOTE_NONNUMERIC` would change the raw-string promise. The pandas example options alone do not detect original row widths: v3.0.6 `readers.py` defaults to skipped blank lines at line 376; [tokenizer.c](https://github.com/pandas-dev/pandas/blob/2905718b126579d2cf0fe5bae05bd75facb67d77/pandas/_libs/src/parser/tokenizer.c#L460), lines 460–472, pads short rows. Final separately requires width validation and parity fixtures. I treat the adapter's complete realization as unresolved, not as a proven safe implementation or an additional material false claim.

[ZoneInfo docs](https://docs.python.org/3.14/library/zoneinfo.html) support separate fold offsets and timezone-data fallback (review text 81–109). [PEP 495](https://peps.python.org/pep-0495/) explains that constructors permit missing/invalid times and defines missing-time round-trip behavior (review text 95–121 and 213–240). The final's gap validation is a proposal requiring tests. The candidate S12 map says Python 3.14.7, but its captured title actually says **3.14.8**, matching my access; this is a metadata inaccuracy without a shown consequential semantic difference. It does not create an additional material error. Another nonconsequential map error labels `readers.py` lines 900–1045 as `read_csv`; that range is `read_table`. The actual `read_csv` definition/call at lines 350–407/855–872 and the correctly mapped validator at 234–306 support the narrow behavior claim.

For GH-66259, the captured issue view genuinely lacks a visible development link. My public timeline capture exposes merged August fixes and a merged 2026-10-06 follow-up whose body says the parallel path remains unreleased. This corroborates the final's restraint; it does not turn a closed issue or merged PR into release proof. Scope is the named GH-64347 path on the main/3.1 line under its reported conditions, not every parser engine or all multithreading. The final's statement is qualified to the issue view and its upgrade caution is valid (C10/C11).

[NIST's joule definition](https://www.nist.gov/glossary-term/26261) and [OpenEnergyMonitor's cumulative-energy documentation](https://docs.openenergymonitor.org/emoncms/daily-kwh.html) corroborate energy/power duration semantics and reset/gap risks. The domain documentation also describes gap joining/reset removal; those mechanisms would need explicit interpretation here and do not justify silently filling measured totals. No numeric formula or energy result was falsely claimed as validated.

## Criticism dispositions

| Criticism | Draft → final disposition | Independent assessment |
|---|---|---|
| 1: safe duplicate-header path | Positional raw mapping, no duplicate supplied names, internal positions; final 12/23–25/45 | Current caller/rejection correction is useful. Historical before/after evidence characterization remains defective (E01). Captured MultiIndex test is correctly limited. |
| 2: parallel applicability | General avoidance caution → v3.0.6 non-applicability and upgrade gate; 13/45/57 | Correct, conditional to the reported parallel path. No released fix inferred. |
| 3: Emoncms analogy | Gap/compare/sparse-cumulative ideas retained, architecture not selected; 14/66–69 | Appropriate negative applicability finding. Issue report is a fixture idea, not verified implementation history. |
| 4: folds versus gaps | Raw timestamps, both classes reviewed, tested validation required; 15/23/37/54 | Correct distinction; round-trip/offset method is not claimed executed. |
| 5: CSV/export details | Immutable original bytes, strict CSV, width guard, expected-calendar coverage; 16/23–25/33/53 | Useful proposal. Parser example alone is insufficient for row preservation; guard/testing remains binding. Does not catch E02. |
| 6: unjustified choices | Runtime/store/chart remain choices; CSV default preference; fill later; bundle optional; 17/25/29/33/37/45/76 | Supported as product judgment, not benchmark conclusion. Draft said event authoring date, not required author identity. No material incorrect rejection established. |

There is no separate supplied critic response, disagreement file or unresolved-objection file to preserve. The same finalizer records objections and dispositions in the authoritative artifact, which the brief permits. Substantive O5 is credited for these checks, not for self-described identity or counters.

## Full preservation inventory

All 26 comparisons were assessed. References identify draft → final lines; the dispositions explain retained meaning, changed conditions or limits. No useful original requirement was silently marked unnecessary on the basis of the library choice.

| ID | Draft content | Draft → final lines | Preservation disposition |
|---|---|---|---|
| R01 | Building/meter/year and non-claims | 31/57 → 23/41 | Retained; year bound explicit. |
| R02 | Raw strings, hash, row, run and interpretations | 31–33 → 23–25/29 | Retained and strengthens original-byte evidence. Paths remain local; default exports omit them. |
| R03 | Original header positions as identity | 19–21/61 → 12/23–25/45 | Reinforced by valid duplicate-supplied-name rejection. |
| R04 | No silent malformed-row skipping or unknown coercion | 33/61 → 25/53 | Retained; width/strict validation is required, not demonstrated. |
| R05 | Local relational versus file store | 37/63 → 17/29/76 | Retained as unresolved conditional choice; no performance superiority implied. |
| R06 | Duplicate/conflict/partial-overlap/timestamp categories | 39 → 29/56 | Retained. |
| R07 | Separate scenario exclusions, raw immutability | 39/55 → 29/41/56 | Retained. |
| R08 | Requested views and period-specific coverage | 43/51 → 33/37/57 | Retained; expected count tied to explicit calendar. |
| R09 | Energy sums and boundary allocation | 47 → 35/37/57 | Retained; midnight policy additionally explicit. |
| R10 | Power integration conditions and no unjustified point-sample totals | 48 → 35/55 | Retained. |
| R11 | Register differences, resets/rollover range | 49 → 35/55 | Retained as review/interpretation rules. |
| R12 | Timestamp originals, distinct folds, nonexistent-time review | 23/51/74 → 15/23/37/54 | Retained and sharpened; no automatic resolution. |
| R13 | Later filled/estimated/extrapolated option | 43/51 → 17/33 | Fill opportunity retained outside MVP; extrapolation withheld. Explicit narrowing, consistent with descriptive scope. |
| R14 | Competing interpretations and closure events | 55 → 41/56 | Core behavior retained; optional authoring-date/note detail omitted. No user-required author identity existed. |
| R15 | Conditional pandas preference and lighter CSV alternative | 21/61 → 17/25/45 | Both retained; conditional preference switches to CSV as judgment, not measured superiority. |
| R16 | Chart acceptance and deterministic domain layer | 63 → 37/45/76 | Retained; no component chosen or researched benchmark asserted. |
| R17 | Privacy and optional review-package fields | 65 → 45/58 | Retained, including optional uncertainty; does not supply required ordinary-export uncertainty (E02). |
| R18 | Comparison manifest, aliases, units, provenance | 69/78 → 49/58 | Retained; default uncertainty gap remains. |
| R19 | Six proposed validation families | 73–78 → 53–59 | Retained/expanded to seven including packaging. No execution promoted. |
| R20 | Emoncms graph comparison/gap analogy | 17/63 → 14/67/72 | Retained in abbreviated form; specific statistics/CSV alignment details are not adopted as product guarantees. |
| R21 | Sparse cumulative missing-day lead | 25/88 → 14/67 | Retained as fixture only; no fix inferred. |
| R22 | Parallel-parser negative lead | 25/90 → 13/45/57/72 | Appropriately narrowed to upgrade applicability. |
| R23 | GH-7160 issue/fix/release-note witness | 19/96 → 12/72 | History retained; defective live-page witness attribution propagated (E01). |
| R24 | Current related test versus exact regression uncertainty | 19/96 → 12/72 | Related-versus-exact limit retained. Draft's explicit not-located statement becomes less clear, but no exact test is fabricated. Required evidence still incomplete. |
| R25 | Vendor/timezone/units/runtime/store/chart/open product questions | 101–104 → 76 plus 29/37/45 | Retained. No representative meter file or jurisdiction inferred. |
| R26 | Proposal-only, no app/tests/performance established | 4/80 → 4/51/59/76 | Retained. Source review is not validation of the application. |

## Validation reach and final rationale

The final's proposed checks are concrete and useful: adversarial CSV and position/raw evidence; clock conventions and folds/gaps; units and power/register models; scenario provenance and recovery; aggregation/coverage/boundaries; export/privacy; target-laptop packaging and timezone data. They are not executed. Specifically, default-export uncertainty is not among the final's export assertions, matching E02. The chosen workload, actual export semantics, single-user/portability requirements and component behavior on target laptops still require later product evidence. Those open decisions are not counted as implemented selections or runtime correctness.

This review executed only evidence tooling: admitted-file reads/copies/digests, public HTTP retrieval, read-only remote tag resolution, static definition/caller/test inspection and report consistency checks. No application, pandas regression test, representative meter fixture, benchmark, downloaded-code execution, infrastructure operation, account action, issue/PR or third-party communication occurred. Tag refs were resolved and the immutable code recaptures matched release-tag bytes; that establishes which inspected code was considered, not what an application would do. Published test definitions establish intended coverage/assertions, not CI success. Some public requests returned 403/404; those attempts are recorded as unavailable and never treated as evidence. Later successful exact-path sources are distinguished in the capture manifest.

The completed review supports **FAIL**, not HOLD or UNASSESSED: both material findings have concrete source/input evidence, and all remaining declared scientific scope was assessed. It does not claim exhaustive discovery of every possible opportunity, verify hidden provenance/lifecycle, or rescue the candidate with reviewer-only sources. The revised plan's strong retained behavior and valid conditional corrections do not satisfy the two missing/mischaracterized required obligations. See [coverage.json](coverage.json) for exact assessed/unassessed counts and finding identities.
