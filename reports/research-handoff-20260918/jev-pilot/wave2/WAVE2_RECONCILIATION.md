# Wave 2 reconciliation note (append-only), 2026-09-17, 11:15 UTC

Responds to the independent review of the wave-2 report (items R01 to R10). Every quantity below was regenerated from the saved records by `wave2/reconcile_wave2.py` into `wave2/reconciliation_metrics.json`, which records the SHA-256 and modification time of each input file. No new paid inference was run for this note. `wave2/WAVE2_REPORT.md` is preserved as a snapshot; a trailer at its end points here, and where the two disagree this note governs.

## Decisions adopted from the review

1. The broad family A and C recipe search stops. No further calibration wave is proposed.
2. The action vocabulary is corrected everywhere: "auto-credit" becomes "propose credit with evidence"; the preservation rule is a supplemental early warning, never a clearance; the strict attribution pre-filter is an experimental cost candidate whose realised savings are unmeasured.
3. The report's statements that the preservation rule "passed a prospective check" and that the pre-filter is "the most practical cost result of the pilot" are withdrawn.
4. Replacement conclusion, adopted from the review:

> The pilot does not qualify Jev to dismiss corrections, award authoritative research credit, clear preservation checks, or close audits. It reports low client-estimated inference cost and useful bounded signals. The strict R1 attribution filter discarded no known credited links in the two reported samples, with pair reduction falling from 35% to 4%; downstream cost savings remain unmeasured and the transfer label census is reconciled below. The two-question preservation rule substantially improved detection, with six misses among 124 lost qualifiers on P2 held-out and one among 206 on reused family P material. These are promising supplemental-warning results, not zero-harm passes. Executable witnesses cover three already identified continuation corrections without inference, while F107 has deterministic semantic-gate checks. The next useful evaluation is a small real-workflow drafting-feedback trial with authoritative review unchanged, not another broad search for an autonomous adjudicator.

## R01. Pass claims and the action boundary

The frozen P2 screen (`labels/rules_P2.json`) required zero lost-called-present on development. The two-question rule has 2 of 121 on P2 development, 6 of 124 on P2 held-out and 1 of 206 on P3. None of these is a zero-observed-harm pass, and the review is right that a favourable rate cannot retroactively replace a frozen criterion.

The four questions, answered separately:

| Question | Answer | Evidence |
|---|---|---|
| Did the recipe execute on the intended inputs? | Supported, with one limitation (corrected 11:30 UTC) | P2 and P3: case-file hashes and request spans in `reconciliation_metrics.json`, sections A and E. Aligned P re-run: joined by case id on the current file; exact case-content-to-request correspondence was not checked, so its results stay descriptive (R02) |
| Did it detect many of the supplied defects? | Yes | 118 of 124 and 205 of 206 lost qualifiers flagged; 0 false alarms on 117 and 144 faithful cases |
| Did it meet its frozen screening criteria? | No | development harm 2 of 121, not 0 |
| Is it authorised to remove authoritative review? | No | nothing in the plan or its amendments grants that; the report's "strong model behind it" sentence is withdrawn as a safeguard claim |

What the "preserved" branch would contain if only flagged cases were reviewed (binary rule, no uncertainty routing):

| Population | Called preserved | Damaged among them | Share |
|---|---|---|---|
| P2 development | 117 | 2 | 1.7% |
| P2 held-out | 123 | 6 | 4.9% |
| P3 | 145 | 1 | 0.7% |

A downstream reviewer that sees only flags never sees those cases. The rule's proper job is to surface likely losses while the writer still has the context, with the independent audit unchanged over the full scope.

## R02. P3 is a fixed-rule cross-set replay on previously examined material

Timeline from file times and receipts (all 2026-09-17 UTC):

| Event | Time |
|---|---|
| `rules_P.json` written | 05:06:02 |
| Family P run (730 requests) | 05:19:33 to 05:27:57 |
| P held-out opened (`frozen_P.json`, `scores_P.json`), per-transformation errors examined | 05:20:40 |
| `rules_P2.json` written; its `why` field cites P's held-out per-qualifier AUC as the reason for the P2 design | 05:22:01 |
| `cases_P.jsonl` rebuilt in place by the W3 builder | 05:28:16 |
| `cases_P2.jsonl` built | 05:30:44 |
| P2 run | 05:31:20 to 05:32:19 |
| P2 held-out opened (`frozen_P2.json`, `scores_P2.json`) | 05:32:21 |
| Two-question rule chosen in the first `cascade.py` run: w = 0.3 selected on development (2 vs 10 vs 13 misses of 121), but the held-out values for all three w were printed in the same output | about 05:42 |
| P aligned re-run; P kept-noul recipes and the Opus P comparison examined | 08:37 to 08:39 |
| P3 run: the P2 question pair on the 350 exact-edit P cases with a probe | 08:51:15 to 08:52:06 |

So: P's held-out results informed the P2 design (declared in the rules file); the P2 rule was selected by development numbers with held-out visible; P material was examined twice before P3 was run; the decision to use P as the P3 population came after that examination. What is clean: the P2 question pair had never been sent for any P case before P3, the lineage overlap between P3 and P2 held-out is 0 source passages, and 0 qualifier texts are shared. Populations: P2 held-out 241 cases from 59 source passages in 25 documents; P3 350 cases from 73 source passages in 7 documents.

Adopted label: **fixed-rule cross-set replay on previously examined family P material.** The result is kept at that evidentiary weight.

On the aligned re-run: answers are joined to cases by case id on the current file (content hash `786b011f...`), and receipts carry request payload hashes, but the case file carries no per-case content hash and no request-hash join was implemented. The re-run is descriptive, as the report says; the modification-time check is a necessary but not sufficient alignment test, and a content-hash join is the correct fix for any future run.

## R03. Transfer attribution census and pair coverage

Sections 4.2 and 4.6 describe the same population: 119 reviewed links = 109 credited and 10 denied at t = 0 (`scores_C_transfer_all27_R1w.json` and `scores_Ct_opus_R1w.json` agree). The "113 credited / 6 denied" in 4.2 was an arithmetic slip: 6 is the number of denied links still scored at t = 0.5 under the whole+component recipe (3 true refusals, 3 false credits; 4 denied and 16 credited links abstained, 99 scored), and 113 is 119 minus 6, which is not a credited count.

Pair coverage: 49 notes by 27 findings is 1,323 pairs, and all 1,323 were asked of Jev. The case file pairs each note only with the findings of its own candidate (27 OME-Zarr notes by 19 OME-Zarr findings = 513; 22 usage-thin notes by 8 usage findings = 176; total 689: 109 credited, 10 denied, 570 unknown). All 689 were answered by Jev and by Opus, which is what "complete coverage" meant. The other 634 cross-candidate pairs carry no labels, were never given to Opus and appear in no comparison.

Denominator conventions in every C score file: false-credit rates are given against all eligible reviewed denials at t = 0 (10 here) and against the denials remaining after abstention at each threshold (6 at t = 0.5), and `recovery_all_credited` counts credited abstentions as unrecovered. Both conventions are named where quoted.

## R04. Observed precision does not extend to unknown links

| arm, whole tier | reviewed credited proposals | proposals on denied links | proposals on unknown pairs | share unadjudicated | 95% upper bound, error among reviewed proposals | 95% upper bound, false-positive rate on 10 reviewed denials |
|---|---|---|---|---|---|---|
| Jev R1 | 54 | 0 | 94 | 63.5% | 5.4% | 25.9% |
| Opus | 71 | 0 | 161 | 69.4% | 4.1% | 25.9% |

These are conditional binomial illustrations; they do not correct selection of the reviewed subset, provisional labels, or dependence between notes and findings.

New evidence since the reviewed draft, at the same evidentiary weight (model judges, not adjudicators): on 28 cross-topic pairs where Jev proposed whole-tier credit against the "absent by construction" Jujutsu findings, two independent Opus judges each seeing only the note and the propositions both credited 21 (12 as whole), both refused 4 and split on 3 (exact agreement 18 of 28). The cross-topic set was therefore not a clean negative set for topic-generic findings, and the tier's refusal rate by strong-model reading is about one in seven on that sample. Action: propose credit with evidence; never award it.

## R05. Pair reduction is not measured cost reduction

Same fixed rule on both topics (from `cascade.json`):

| Fixed rule | Jujutsu held-out pairs removed | Transfer pairs removed | Known credited links lost |
|---|---|---|---|
| wave-1 `not_present` >= 0.5 | 56.1% | 17.0% | 0 of 52 (upper bound 5.6%), then 2 of 109 |
| R1 `not_present` >= 0.9 | 34.6% | 4.4% | 0 of 52 (5.6%), then 0 of 109 (2.7%) |

The 56% headline belonged to the rule that later lost credited links and is withdrawn from the economic argument. Both cascades are counterfactual replays: Jev and Opus answers were obtained on full batches and combined offline; the judge was never re-run on filtered batches, no request was repacked, and judge invariance under changed batches is not assumed to hold. The sparse cross-topic set (69% removed by the strict rule) is an upper bound on a set that R04 shows was not clean. Realised expensive-model savings are unmeasured; the strict rule stays parked until a real repacking measurement exists.

## R06. Scope of the preservation result

The tested component is a qualifier checker given an already selected qualifier and already supplied source and destination text. It does not measure whether a live workflow inventories every obligation, chooses the right destination, records an explicit disposition, preserves conditions while building the probe, detects unsupported new obligations in the reverse direction, or distinguishes authorised change from loss. An omitted obligation never produces a question. The populations were code-generated systematic edits plus byte-identical and re-flowed controls; faithful paraphrases, split units, equivalent schema references and authorised meaning changes are not represented. Performance on those is unknown, and the next applied trial should use real ordinary edits rather than a larger synthetic set.

## R07. Comparisons aligned

Corrected sentence for the summary: on the 194 P3 cases the Opus P arm also judged, Jev's fixed rule missed 0 of 115 lost qualifiers and Opus's present-noul at 0.5 missed 1 of 115; Jev's 1 of 206 is over the whole P3 population. Neither an equal count nor a one-case difference establishes equivalence.

Why 155 versus 194: the P comparison (155) is the Opus P-arm cases that are held-out under the recomputed split of the aligned re-run and exact-edit class, scored on the P question bank (Choice and kept-nouls); the P3 comparison (194) is the Opus P-arm cases among the 350 exact-edit cases with a sendable qualifier probe across both splits, scored on the P2 question pair under the fixed rule. Paired outcomes are recoverable by case id from `answers_P3.jsonl`, `answers_P_v2.jsonl` and `opus_arm/answers_P_batch*.jsonl`; the single P3 miss is a weakened-condition case.

Comparator configurations were specific: the cheap model at thinking max through a copied OMP profile; Opus through sub-agents with instruction-level isolation. Neither is a demonstration of the cheapest qualified comparator.

## R08. Cost and attempt accounting

Ledger by category at 11:12 UTC (client-side estimate at $0.042 per million input tokens; billed calls exclude replay-cache hits):

| category | billed calls | input tokens | usd |
|---|---|---|---|
| probe | 94 | 86,561 | 0.0036 |
| wave1-A | 109 | 147,742 | 0.0062 |
| wave1-C | 256 | 4,818,012 | 0.2024 |
| wave2-A-research | 104 | 187,857 | 0.0079 |
| wave2-A-suff | 109 | 157,007 | 0.0066 |
| wave2-A-transfer | 419 | 476,647 | 0.0200 |
| wave2-C-R1 | 493 | 8,961,553 | 0.3764 |
| wave2-C-R1-transfer | 112 | 2,009,437 | 0.0844 |
| wave2-C-R2-jujutsu | 241 | 3,762,685 | 0.1580 |
| wave2-C-R2-transfer | 120 | 1,843,671 | 0.0774 |
| wave2-C-W1-transfer | 104 | 1,654,143 | 0.0695 |
| wave2-C-R1-sparse | 418 | 8,051,037 | 0.3381 |
| wave2-C-W1-sparse | 331 | 6,433,478 | 0.2702 |
| wave2-F108 | 11 | 41,127 | 0.0017 |
| wave2-P | 581 | 905,227 | 0.0380 |
| wave2-P-v2 | 198 | 457,974 | 0.0192 |
| wave2-P2 | 477 | 400,722 | 0.0168 |
| wave2-P3 | 350 | 397,066 | 0.0167 |
| wave2-ratelimit (three probes) | 308 | 6,908,035 | 0.2901 |
| wave2-repeat | 52 | 234,540 | 0.0099 |
| settled | | | 2.0132 |
| unresolved liabilities (9) | | | 0.0424 |
| exposure | | | 2.0557 |

The report's cost table was built from `receipts.jsonl` at 08:33 UTC (27.4M tokens, $1.15) plus the P re-run ($0.02). The three rate-limit probes ($0.29) wrote to the ledger only, which is the gap the review found; P3 ($0.017) and the two sparse runs ($0.61) came later. Receipt semantics: 5,647 rows, one per attempt outcome: 5,493 answered, 83 refused by the egress check before sending, 63 refused as over budget before sending, 7 rate-limit exhausted, 1 API error; 914 of the answered rows were replay-cache hits and were not billed.

Strong-model work is not metered in the ledger. From the harness's per-agent token counts in completion notifications, the eight named Opus arms launched after 05:30 UTC used at least 7.22 million tokens (P2 0.67M, terminal A 0.92M, transfer C 1.15M, research condition 0.43M, P 1.59M, cross-topic judges 1.20M, R1 Jujutsu judges 1.26M). Excluded: 21 attempts terminated by the session limit, the comparator agent, the six workstream agents and the A and C arms launched before 05:30 UTC, and the pilot lead's own context. These are usage counts, not billed amounts, and are not converted to money. The report's "a thousandth of the cost" is withdrawn; the defensible statement is: Jev inference was inexpensive under the client's valuation; the pilot's total cost and any downstream saving were not measured.

Authorisation pointers: the $50 Jev cap and the consent scope are Jared's chat instructions of 2026-09-17 (recorded in `PLAN/` and every report); the comparator ran through a copied OMP profile as plan v2.1 requires; the Opus sub-agents ran under the night's authorisation to run whatever tests would help, including Opus. The cap authorises nothing outside the pilot.

## R09. Deterministic witnesses, narrowed

W4 shows that the already identified F106, F108 and F109 obligations can be executed as witnesses against the baseline and current validators, with 0 of 125 disagreements on whole-pack replay. It does not show that code would have discovered those corrections without the research and adjudication that identified the lifecycle, field, omission and expected outcome. F107's relational rules live in the Python semantic gate and are deterministic there. Before any landing, the owner should compare the witnesses with existing tests and extend the approved validators through their normal flow; this note is not permission to modify `Plans/**` or governance.

## R10. Denominators, contamination slice, units

Terminal family A, every denominator:

| population | count | substantive | abstained (insufficient / compound / uncertain) | share substantive |
|---|---|---|---|---|
| claims in the transfer set | 474 | | 55 never sent (no usable proposition or passages) | |
| answered | 419 | Jev 215 / Opus 333 | Jev 171 / 31 / 2; Opus 62 / 10 / 14 | Jev 51.3% / Opus 79.5% |
| answered with a mapped class label | 362 | Jev 189 / Opus 294 | Jev 145 / 27 / 1; Opus 48 / 7 / 13 | Jev 52.2% / Opus 81.2% |
| unmapped labels among answered | 57 | | 34 "appropriately_uncertain", 23 without a class | |

The report's 145 / 27 / 1 were over the 362 mapped claims; the review's 247 combined those with the 419 denominator. Jev's substantive share of all 474 is 39.9% (mapped) or 45.4% (all answered).

R2 contamination slice (credit = asserts, t = 0; all eleven flagged findings fall in the held-out split, so no development-side R2 decision used their pairs):

| slice | findings represented in slice (universe) | notes | pairs | credited / denied / unknown | true credits | false credits | missed | precision | recovery | credit proposed on unknown |
|---|---|---|---|---|---|---|---|---|---|---|
| flagged, held-out | 11 (11) | 118 | 1,298 | 42 / 24 / 1,232 | 27 | 3 | 15 | 0.90 | 0.64 | 155 |
| clean, held-out | 50 (99) | 118 | 5,900 | 71 / 24 / 5,805 | 41 | 3 | 30 | 0.93 | 0.58 | 371 |
| clean, development | 49 (99) | 118 | 5,782 | 111 / 26 / 5,645 | 66 | 1 | 45 | 0.99 | 0.60 | 695 |

(Column corrected 11:30 UTC: the earlier "99" was the clean universe, not the findings represented in each split. The 11 flagged findings sit in the held-out splits (7 held-out, 4 held-out-whole-class); the 99 clean findings split 49 development / 43 held-out / 7 held-out-whole-class; every slice spans the 118 notes.)

This is a sensitivity view; it cannot undo any decision informed by the contaminated reading, and the flagged slice's recovery is higher than the clean slice's, which is the direction contamination would push.

Statistical units behind the quoted bounds: P2 held-out 241 cases from 59 source passages in 25 documents; P3 350 cases from 73 source passages in 7 documents; Jujutsu attribution 12 notes by 61 findings with 77 reviewed links; transfer attribution 49 notes by 27 findings with 119 reviewed links and 10 denials from one case's stage ratings; family A 110 findings with 5 corrections; terminal A 474 claims with 92 mapped corrections. Every binomial bound in the report and here is a case- or link-level illustration under independence, not a workflow guarantee.

## What happens next

Nothing further is run from this pilot without separate authorisation. The proposed applied experiment is the review's: one ordinary ledger-to-Plan or PlanUnit update that is already scheduled, with deterministic checks first, Jev's two-question warnings shown to the writer while the source context is available, the writer repairing what is really a loss, and the independent audit unchanged over the full scope; compared against the same workflow without the warnings on preassigned comparable work, budgeting writer, reviewers, controller and preparation together, and measuring strong-model work, wall time, repair cycles, unresolved losses and cost per accepted deliverable. The strict attribution filter waits for a workflow where request repacking shows a material saving. Family D stays not evaluable until independent labels exist. WorkNode creation and general Plan authoring were not tested and inherit nothing from this pilot.


## Corrections after the second review (11:30 UTC, append-only)

1. R01, "intended inputs": the answer is qualified as shown in the table. The aligned family P re-run is aligned by case id on the current case file, not by an exact content-to-request join; its results remain descriptive. For future runs the content join is part of normal result recording; no historical case is re-run to remove this disclosed limitation.
2. R10, contamination table: the finding-count column now shows the findings represented in each slice (11 / 50 / 49) beside the universe (11 / 99), confirmed from unique finding ids in `cases.jsonl` and regenerated in `reconciliation_metrics.json` (`findings_represented_in_slice`, `notes_in_slice`).
3. Recorded from the second review: the reviewer withdraws its own earlier figure of 247 substantive terminal answers; the census stands at 189 of 362 mapped and 215 of 419 answered.
4. Two implementation details adopted for the applied drafting-feedback trial: the draft is saved before any Jev warning is shown, so a repair attributable to a warning can be told apart from one the writer had already made and unnecessary changes caused by false warnings are visible; the independent reviewer receives the source, the governing decisions and the candidate artifact only, records its findings before seeing any Jev verdict, and reviews the complete scope including unflagged material. The trial's outcome measure is whether the same acceptance standard is reached with fewer late repair cycles or less total expensive-model work after counting the warning stage and any extra work it caused; an inconclusive result does not expand the trial.
5. No model calls were made for these corrections.
