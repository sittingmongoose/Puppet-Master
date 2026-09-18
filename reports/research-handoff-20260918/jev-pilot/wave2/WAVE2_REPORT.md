# Jev pilot, wave 2 report (final), 2026-09-17

Pilot root: `~/PM-Experiments/jev-pilot-20260917/`. Written by the pilot lead (Claude Fable 5.1) between 05:00 and 09:00 UTC on 2026-09-17, replacing `WAVE2_REPORT_draft.md`. Every number below has a file behind it (index in section 9). Jev model pinned to `jev-1.13.0`. Total Jev exposure at the end of the night: $2.06 of the $50 cap (client-side estimate of input tokens at $0.042 per million; not an invoice guarantee).

Consent scope, stated as in every earlier report: Jared authorised testing "on a snapshot of the real plans/work". The pilot sent Jev frozen canon passages, the six research arms' notes, the transfer-topic notes and the pilot's own records; nothing was sent that is not already in the repository or the evidence share; no secrets, and the API key was never printed, logged or copied. Results are read-only shadow evidence; nothing was written to `Plans/**` or landed anywhere.

## 1. The question and the short answer

Jared's question: can Jev replace the expensive, slow, high-end-model steps of the planning pipeline (audit, verification, plan-document creation, ledger to plan documents, PlanUnit creation and update, external research, later work-node creation)?

Short answer from two waves of measurement on real material:

- **As an authority that acts on its own: no, not for any step tested.** Every family fails the frozen zero-harm screen. Jev's characteristic failure is the hard boundary: a necessary correction that reads like "already covered", a clause that belongs to a neighbouring finding, a condition or modality quietly weakened. It does not fail on the coarse sorts.
- **As a cheap first stage in front of a strong model: yes, for two specific jobs, with numbers.** (a) Attribution pre-filter: Jev's "not present" answer at 0.5 or above removes 56% of note-by-finding pairs and lost none of the 52 credited links on the held-out Jujutsu notes (upper bound 5.6%); on the transfer topic the strict form of the rule (R1 question at 0.9) loses 0 of 109 credited links but removes only about 4% of that dense candidate set, and the looser wave-1 rule loses 2; on a sparse cross-topic set of 5,390 known-absent pairs the strict rule removes 69% (an upper bound, since cross-topic absence is the easy case). (b) Preservation screening: on per-qualifier checks Jev ranks damaged against faithful passages with AUC 0.99; a two-question rule chosen on development cut its misses from 20 to 6 of 124 on held-out, and then, with the rule fixed, missed 1 of 206 lost qualifiers on a second passage population (upper bound 2.3%, 0 false alarms), the same count Opus scored on the shared cases. This is the one Jev recipe that passed a prospective check.
- **Where a strong model was run on identical evidence it was not simply "better".** On finding class Opus recalls every correction but calls 19 of 28 held-out unsupported findings corrections; Jev does the reverse. On attribution under the wave-1 question Opus recovers more credited links (0.56 vs 0.46) at slightly lower precision; under the policy-explicit R1 question the two are nearly identical on Jujutsu (same 7 whole assertions, component-tier false credits 6 vs 9 of 25) and Opus recovers more on the transfer topic (0.65 vs 0.50 at the whole tier). On preservation Opus was perfect on 396 cases where Jev missed 30. On the terminal transfer topic both are weak; Opus is much better than Jev.
- **Cascades that looked good on the Jujutsu topic failed a prospective check on the terminal topic** (section 4.6). The pre-filter had its prospective check on the transfer topic (section 4.6): safe only in its strict form, with a saving that depends on how sparse the candidate set is. The preservation two-question rule had its prospective check on the family P passages (section 5.4) and passed.
- **Cost and speed are as advertised.** Whole-family runs cost cents and finish in seconds; the cheap reasoning comparator cost 20 to 60 times more and took 50 to 300 times longer per case; Opus is more again.

Outcome labels (fixed vocabulary from the plan): `not_evaluable`, `not_useful_under_tested_recipe`, `promising_shadow`, `needs_prospective_validation`.

| Family / job | Tested recipe(s) | Outcome label |
|---|---|---|
| A, finding class (Jujutsu held-out) | frozen bank, t=0 | not_useful_under_tested_recipe (2 of 5 corrections dismissed) |
| A, finding class (terminal transfer) | same bank | not_useful_under_tested_recipe (13 of 92 corrections called) |
| A, Jev-vetoes-Opus cascade | q chosen on Jujutsu dev | needs_prospective_validation, and the first prospective check failed |
| C, attribution as credit authority | wave-1 asserts; R1 whole tier; R2 clauses | not_useful_under_tested_recipe for full recovery; the R1 `asserts_whole` tier is precision 1.0 on reviewed links on both topics at 0.13 to 0.48 recovery; on 28 cross-topic firings two independent Opus judges both credited 21 and both refused 4 (promising_shadow as a partial auto-credit with a measured 14% refusal rate, not zero) |
| C, attribution pre-filter before a strong model | R1 not_present >= 0.9 (strict) / wave-1 >= 0.5 (loose) | promising_shadow in the strict form (0 credited lost on both topics); the loose form lost 2 of 109 prospectively |
| P, passage preservation (coarse Choice) | frozen | not_useful_under_tested_recipe |
| P2 / P, per-qualifier two-question rule | present >= 0.5 AND weakened < 0.3, chosen on P2 development | promising_shadow, passed a prospective check on a second population (1 of 206 lost qualifiers missed, 0 false alarms); still not a proven zero-harm authority |
| D, seal dispositions | none possible | not_evaluable (no independent labels) |
| W4, schema enforcement witness | deterministic, no model | done: three of four continuation corrections are witnessable mechanically |

## 2. Populations and discipline (unchanged from the plan)

Rules were frozen before any held-out result was opened (`labels/rules.json` 04:01 UTC, `rules_P.json`, `rules_P2.json`, `rules_A_transfer.json`). Splits are lineage-grouped (seed 20260917); sparse classes are held out whole. Any threshold or wording chosen after seeing development data is said so; anything chosen after seeing held-out data is labelled post hoc. Harmful-direction events use exact binomial upper bounds (Clopper-Pearson at 95%). Majority and keyword baselines are computed on the same population as the model. Every Jev request has a receipt (`runs/receipts.jsonl`, 3,714 rows plus the family P re-run) and the replay cache makes re-scoring free.

Jev repeatability on real material: 20 of 20 family A cases identical across three uncached runs; 96.1% identical per-finding choices on three family C notes (`wave2/repeatability.json`).

Reference arms: Opus 5 judged the identical evidence-only states through sub-agents instructed to open only their state files (instruction-level isolation, not enforced; the state files were checked to contain no label fields). A cheap reasoning model (`opencode-go/deepseek-v4.1-flash`, thinking max) judged the identical states through a copied OMP profile (`wave2/comparator/REPORT.md`).

## 3. Family A: which class is a research finding

### 3.1 Jujutsu topic (110 findings; 61 held-out, 5 corrections held out whole)
- Jev, frozen bank, t=0 (`reports/CALIBRATION.md`): held-out BA 0.711 vs majority 0.25, coverage 0.95, corrections 3 of 5 (F108 dismissed at 0.63, F109 at 0.85). Fails the zero-harm screen.
- Opus 5 on identical states (`wave2/opus_arm/scores_A_opus.json`): held-out BA 0.766, corrections 5 of 5, but correction precision 0.19 (19 of 28 unsupported findings called corrections); on development 22 of 34. Opposite failure direction.
- deepseek-v4.1-flash on identical states (`wave2/comparator/REPORT.md`): held-out BA 0.813, corrections 4 of 5, F109 still dismissed at 0.97. Cost $0.385 vs Jev $0.006; 18.5 min vs 3 s.
- Error correlates (`wave2/a_error_correlates.json`): Jev accuracy falls with clause count (0.81 / 0.70 / 0.67 for 1 / 2 / 3+ clauses); Jev-only right 29, Opus-only right 9, both wrong 12.

### 3.2 Evidence boundary (development-informed, exploratory)
- Adding the arms' own research excerpts (hash-verified, 6.7 to 10K chars) to the state flips all four continuation corrections to `correction`: F106 0.77 to 0.99, F107 0.53 to 0.91, F108 0.40 to 0.92, F109 0.13 to 0.99 (`wave2/evidence_boundary_corrections.json`). The excerpts contain the arms' argument, so this shows which evidence kind decides, not independent derivation.
- The same condition on 104 findings with an asserting blind document (`wave2/scores_A_research.json`, `wave2/opus_arm/scores_Ares_opus.json`; the population contains no corrections): Jev's false corrections on unsupported findings rise from 7 to 16 of 63 (held-out 5 to 8 of 28); Opus's fall slightly from 41 to 37 of 63 (19 to 17 of 28). Research assertions push Jev toward calling corrections; Opus already over-calls them without help. Recall improves at the price of precision for Jev; the strong model's precision problem is not an evidence problem.
- Sufficiency variant (`wave2/scores_A_suff.json`): `external_fact_needed` F108 0.74 vs F109 0.30, matching the diagnosis (F108 lacked evidence; F109 was a wrong judgment on adequate evidence).

### 3.3 Terminal transfer topic (474 claims from the terminal research audit; 419 evaluable; class map frozen in `labels/rules_A_transfer.json`)
| arm | coverage | BA (scored) | corrections called / 92 | corrections abstained | corrections misclassified | correction precision |
|---|---|---|---|---|---|---|
| Jev, frozen bank | 0.52 | 0.544 | 13 | 48 | 31 | 0.81 |
| Opus 5 | 0.81 | 0.692 | 61 | 15 | 16 | 0.68 |

Majority baseline 0.333. Jev abstains on 41% of terminal claims (145 `insufficient_evidence`, 27 `compound`); the claims are the arms' final-list items, some heading-like, and 18 had no usable proposition (`wave2/scores_A_transfer.json`, `wave2/opus_arm/scores_At_opus.json`). Neither arm is usable as authority on this topic; Opus is usable as triage, Jev is not.

### 3.4 Cascades on family A (`wave2/cascade.py`, `wave2/cascade.json`)
On the Jujutsu held-out set, "Opus proposes a correction, Jev vetoes it unless its own P(correction) or contradicts-noul is at least 0.3" (q chosen on development, where it was also the best of the sweep) gives BA 0.832, keeps 4 of 5 corrections and cuts Opus's false corrections from 21 to 5. Agreement gating ("both say correction") gives BA 0.788, 3 of 5, 4 false.

Prospective check on the terminal topic with the same fixed recipes: the veto dismisses 60 of 92 corrections (Jev's correction probability is simply low on that topic), agreement keeps 12 of 92. Jev-first routing (Jev's confident substantive answer stands, Opus otherwise) matches Opus alone while saving only 13% of Opus calls. The A-family cascades do not transfer and are not recommended.

## 4. Family C: does a research note earn credit for a finding

### 4.1 Jujutsu topic, wave 1 (credit = `asserts` only, amended on development evidence and recorded)
Held-out: precision 0.98, recovery 0.42, 1 false credit of 37 scored denied (`reports/CALIBRATION.md`). The `partial_support` bucket holds most credited and most denied links.

### 4.2 Policy-explicit recipe R1 (whole / component / neighbouring / evidence-only tiers; `wave2/scores_C_R1_*.json`)
- Jujutsu held-out: whole+component recovery 0.867 at t=0 but 15 of 48 false credits; at t=0.6 precision 0.92, recovery 0.62, 6 of 23. The `asserts_whole` tier alone: 24 credited, 0 denied on held-out.
- Transfer topic, complete coverage (27 control findings, 49 notes, 119 reviewed links = 113 credited / 6 denied; `wave2/scores_C_transfer_all27_*.json`): whole-only precision 1.0, recovery 0.477, 0 of 6 false credits; whole+component 0.965 / 0.752 / 3 of 6. The negative side is thin (denials come from one case's stage ratings).

### 4.3 Clause-level recipe R2 (`wave2/scores_C_R2_jujutsu.json`, `wave2/scores_C_transfer_16_R2.json`)
Jujutsu held-out precision 0.919, recovery 0.602, 6 of 48 false credits (three of the six among the eleven findings W2 flagged as possibly contaminated by my briefing error). Transfer (16 findings with propositions, 75 links): t=0.5 0.953 / 0.631 / 2 of 10; t=0.6 1.0 / 0.523 / 0 of 4. R2's misses are total, not partial (90 credited-but-not-present links had zero clauses asserted).

### 4.4 Strong and cheap comparators on the same 12 held-out notes (77 reviewed links, 732 pairs)
| arm (credit = asserts) | precision | recovery | BA | false credits / 25 denied |
|---|---|---|---|---|
| Jev 1.13 wave 1 | 0.960 | 0.462 | 0.711 | 1 |
| Opus 5 | 0.935 | 0.558 | 0.739 | 2 |
| deepseek-v4.1-flash | 0.944 | 0.327 | 0.643 | 1 |

All three put most denied links in `partial_support`: the bucket is a property of the question, not the model.

Under the policy-explicit R1 question on the same 12 notes (`wave2/opus_arm/scores_Cr1_*.json`, 09:16 UTC), Opus and Jev are close:

| arm, credit tier | precision | recovery | false credits / 25 denied | credit proposed on 655 unknown pairs |
|---|---|---|---|---|
| Opus, asserts_whole only | 1.0 | 0.135 | 0 | 1 |
| Jev R1, asserts_whole only | 1.0 | 0.135 | 0 | 2 |
| Opus, whole + component | 0.867 | 0.750 | 6 | 45 |
| Jev R1, whole + component | 0.827 | 0.827 | 9 | 82 |

Both credit the same 7 whole assertions; the component tier is where both make their false credits (Opus 6, Jev 9 of 25 denied), so the tier boundary, not the model, sets the error. Opus on the transfer topic under the same policy: section 4.6.

### 4.5 Pre-filter cascade (held-out only, descriptive; `wave2/cascade.json` section C)
Jev wave-1 `not_present` at 0.5 or above drops 56% of all note-by-finding pairs on the 12 notes; none of the 52 credited links is dropped (upper bound 5.6%); Opus then judges the remainder with its unchanged result (precision 0.935, recovery 0.558). The R1 `not_present` at 0.9 drops 35% with the same zero loss. A tiered design (R1 `asserts_whole` auto-credit, `not_present` drop, Opus for the rest) reaches the same recovery with 36 to 48% of pairs read by Opus. This is the most practical cost result of the pilot; its prospective check on the transfer topic is in section 4.6.

### 4.6 Opus on the transfer topic under the R1 policy
Opus judged all 49 transfer notes under the same R1 credit policy and options Jev saw (`wave2/opus_arm/scores_Ct_opus_*.json`; Jev restricted to the same pairs in `scores_Ct_jev_same_pairs_*.json`). Reviewed links on the common pairs: 119 (109 credited / 10 denied), t=0.

| arm, credit tier | precision | recovery | false credits / denied scored | credit proposed on unknown pairs |
|---|---|---|---|---|
| Opus, asserts_whole only | 1.0 | 0.651 | 0 / 10 | 161 / 570 |
| Jev R1, asserts_whole only | 1.0 | 0.495 | 0 / 10 | 94 / 570 |
| Opus, whole + component | 0.969 | 0.862 | 3 / 10 | 348 / 570 |
| Jev R1, whole + component | 0.958 | 0.835 | 4 / 10 | 337 / 570 |

Prospective check of the pre-filter with the rules fixed from the Jujutsu analysis (`wave2/cascade.json`, section C_transfer; judge = Opus under the R1 policy, 689 common pairs, 119 reviewed):

| rule | pairs removed by Jev | credited links lost | judge result after the filter (whole tier) |
|---|---|---|---|
| wave-1 question, not_present >= 0.5 (the Jujutsu rule) | 17% | 2 of 109 | precision 1.0, recovery 0.642, false credits 0 of 10 |
| R1 question, not_present >= 0.7 | 12% | 0 of 109 | precision 1.0, recovery 0.651, false credits 0 of 10 |
| R1 question, not_present >= 0.9 (the Jujutsu rule) | 4% | 0 of 109 | precision 1.0, recovery 0.651, false credits 0 of 10 |
| tiered: R1 whole auto-credit, drop >= 0.9, Opus for the rest | 26% | 0 of 109 | precision 1.0, recovery 0.651, false credits 0 of 10 |

Opus alone on the same pairs (whole tier): precision 1.0, recovery 0.651; Jev R1 alone: 1.0, 0.495.

Sparse-set measurement (`wave2/scores_C_sparse_filter.json`, run 08:55 UTC, $0.61): to measure the saving on a candidate set that is mostly absent, the 49 transfer notes were paired with the 110 Jujutsu findings (5,390 cross-topic pairs, absent by construction). The strict rule (R1 `not_present` at 0.9) removes 68.6% of them; at 0.7, 83.2%; the wave-1 rule at 0.5 removes 86.1%. Cross-topic pairs are easier to call absent than same-topic ones, so these are upper bounds; the Jujutsu same-topic figures (35 to 56%) are the realistic range. Side finding: Jev called `asserts_whole` on 28 of the 5,390 cross-topic pairs (0.5%; 8 findings, mostly topic-generic obligations such as "empty, absent and failed reads are distinct" and "bound reads before allocating", 25 of the 28 on OME-Zarr notes, probabilities 0.34 to 0.87) and the wave-1 question called `asserts` on 62 (1.2%). Two independent Opus judges then read the 28 pairs under the same R1 policy (`wave2/opus_arm/scores_Xt_opus.json`, 09:06 UTC; each judge saw only the note and the finding propositions). Both judges credited 21 of the 28 (12 as `asserts_whole`, the rest as a component), both refused 4 (two `neighbouring_only`, two absent or passing mentions), and they split on 3; exact agreement 18 of 28, agreement on credit-or-not 25 of 28. So "absent by construction" was wrong for topic-generic findings: an OME-Zarr note that says failed reads must be distinguished from empty ones is, by the policy's literal reading, asserting the Jujutsu finding that says so. On this sample the auto-credit tier's precision by a strong model's reading is between 0.75 and 0.86 (21 to 24 of 28; exact 95% lower bound 0.58 for 21 of 28, computed as one minus the upper bound on the 7 refused-or-split), not the 1.0 the reviewed links show. That is the number to carry: about one in seven of the tier's cross-topic credits would be refused by two independent strong-model judges.

Read-out: the transfer candidate set is dense by construction (27 control findings against notes written for them), so there is little for a pre-filter to remove: the Jujutsu rules cut only about 17 to 4% of pairs here, against 35 to 56% on Jujutsu. The wave-1 rule at 0.5 loses 2 of 109 credited links prospectively; the stricter R1 rule at 0.9 loses 0. The pre-filter therefore passes its prospective check only in the strict form (R1 not_present at 0.9), and its saving depends on how sparse the real candidate population is; a pipeline candidate set of all findings against all notes is Jujutsu-like, not transfer-like. Jev's own `asserts_whole` tier is again precision 1.0 on this topic.

## 5. Families P and P2: was a passage preserved

### 5.1 Coarse Choice (family P, synthetic edits of Jujutsu-cited passages plus provisional audit rows)
Frozen at 05:20 UTC with no valid operating point (no threshold reaches zero damaged-called-preserved on development). Incident: the case file was rebuilt by the W3 builder at 05:28 UTC, after the run and the scoring; 399 of 730 case ids changed content, so the recorded `wave2/scores_P.json` is a valid record of the earlier file but is not reproducible from disk. Jev was re-run on the current file at 08:37 UTC (`wave2/runs/answers_P_v2.jsonl`, $0.02, 32 s) and every P figure below is from that aligned run; the split was recomputed with the same seed, so these are descriptive, not the frozen screen.

Aligned run, exact-edit population (406 cases; 214 held-out): controls 103 of 103 faithful, prohibition dropped 48 of 49, modality changed 26 of 26, condition weakened 17 of 24, scope broadened 7 of 11; damaged called faithful 12 of 111 (upper bound 16.9%). The provisional audit rows (324 "exact_present" atom-to-PlanUnit pairs and similar) are a different task (detail presence, not textual faithfulness) and Jev calls only about half of them faithful; they are reported, not scored.

Jev-only rules from its own four questions (chosen on development, reported on held-out, exact population): "all three kept-nouls at 0.7 or above" misses 2 of 111 damaged (upper bound 5.6%) with 0 false alarms on 103 faithful; the frozen Choice missed 12. Per-qualifier noul: AUC 0.955 on this population.

### 5.2 Per-qualifier Noul as the scored action (family P2, 491 new passages; `wave2/scores_P2.json`)
No threshold pair reaches zero lost-called-present on development, so no valid operating point; held-out at 0.5 descriptively: n 241, AUC 0.989, controls 117 of 117, prohibitions 35 of 35, exceptions 6 of 6, scope 3 of 3, condition weakened 36 of 48, modality changed 24 of 32; present-called-lost 0. Two-question rule "present at 0.5 or above AND weakened below 0.3" (w chosen on development, where it took misses from 16 to 2 of 121): held-out misses 20 to 6 of 124 (upper bound 9.3%), 0 false alarms.

### 5.3 Opus on identical P and P2 states
- P2 held-out, 241 cases: 241 correct, 0 damaged called present of 124 (upper bound 2.4%), AUC 1.0 (`wave2/opus_arm/scores_P2_opus.json`).
- P exact population, 155 common cases: BA 1.0, 0 of 78 damaged called faithful (upper bound 3.8%), all four nouls AUC 0.997 to 1.0; Jev on the same cases 10 of 78 (`wave2/opus_arm/scores_P_opus.json`).
- Cascade on P2: Jev decides when its present-noul is at or above 0.971 (the development maximum among damaged) or at or below 0.05, Opus otherwise: 2 of 124 misses at 28% Opus share. Jev is confidently wrong on one or two damaged passages per 124, so no band reaches zero without sending everything.

### 5.4 Prospective check of the two-question rule on a second population (`wave2/scores_P3.json`, run 08:52 UTC)
The P2 question pair (present-with-same-force, present-but-weakened) was sent, with the rule fixed at present >= 0.5 AND weakened < 0.3, to the 350 family P exact-edit passages that carry a qualifier probe (144 present / 206 lost; Jujutsu-cited passages, a different population from P2's). Result: 1 of 206 lost qualifiers called present (a weakened condition; upper bound 2.3%), 0 false alarms on 144 present. The present question alone misses 11. On the 194 cases the Opus P arm also judged: Jev's rule 0 of 115, Opus 1 of 115. Cost $0.02, 52 s.

The edits in P and P2 are systematic (a dropped "only", must to may, a removed condition), which a reasoning model can find by diffing; that is the job, and with the two-question rule Jev does nearly all of it at a thousandth of the cost.

## 6. Family D and the enforcement witness
- Family D (seal dispositions): `not_evaluable`. All 82 disposition rows were authored by the candidate model; there is no independent per-failure adjudication; 51 of 82 remain after mechanical resolution (`wave2/familyD/INVENTORY.md`). One independent labelling pass over the 11 r6 rows would make it evaluable.
- W4 deterministic witness (`wave2/enforce/REPORT.md`): F109's four omissions are accepted by the 2026-09-13 baseline schema and rejected at main; F106's value defect is witnessed; F108 is inverted (an honest pre-init request is rejected at baseline and accepted at main); F107's relational rules are gate-enforced in Python and not schema-expressible; whole-pack replay across Jujutsu and main shows 0 of 125 disagreements. Three of the four continuation corrections could have been caught with no model at all.

## 7. Cost and speed (measured, not quoted)
| run | requests | input tokens | cost | per-request p50 / p90 / max |
|---|---|---|---|---|
| Jev, all pilot categories | 3,714 (+730 P re-run) | 27.4M (+0.5M) | $1.15 (+$0.02) | 0.2 to 0.7 s / 0.3 to 0.8 s / 15.3 s |
| Jev, family C R1 Jujutsu (553 requests) | 553 | 10.0M | $0.42 | 0.33 / 0.43 / 0.83 s |
| deepseek-v4.1-flash, A 109 cases | 109 | 0.16M in, 0.60M out | $0.385 | 11.7 / 68.7 / 298 s |
| deepseek-v4.1-flash, C 12 notes | 48 | 0.54M in, 1.21M out | $0.807 | 132 / 215 / 264 s |
| Opus 5 (sub-agents) | 16 A/P2/At agents about 100K tokens each; 13 P agents about 120K each | n/a | not metered here | 2 to 9 min per 30 cases |

Rate limits: 7 of 296 wave-1 C requests hit 429 at 8 in flight; three probes up to 16.4M tokens/min could not reproduce it (one 503); mechanism unconfirmed. Size: 100K-char YAML answered, 200K rejected with `max_tokens_exceeded`; the size estimate must be prose-aware (`JEV_CPT=4.0`).

## 8. Incidents and corrections during the night
- Family P case file rebuilt after the run (section 5.1); fixed by an aligned re-run; every other case file was verified to be older than its run start, except the transfer notes, which were finalised at 05:24:32 UTC and are fully covered by the R1 and R2 transfer re-runs that started afterwards.
- Egress checker false positives: label-file path in a sentence (fixed with path tokens), then external URLs in research notes refused 76 chunks (fixed by exempting URL-like tokens); a manual misuse of the checker with a dummy key flagged every string and invalidated one F108 run (v3 is the valid run).
- Two Jev C candidates were blocked by BM25 top-20 in an early design and missed 84 of 224 credited links; all findings are now sent per note.
- Opus sub-agents sharing one scratchpad overwrote each other's generic helper scripts (`app.py`, `append.py`); both affected agents detected and repaired it; all batch files were validated (ids match manifests, no duplicates). Later instructions require batch-numbered helper names.
- The Opus session limit at about 05:50 UTC killed 17 running sub-agents; all were relaunched at 08:32 UTC with incremental-write instructions; partial files were resumed, not discarded.
- W2's clause decomposer was pointed at the reports by my briefing; 11 Jujutsu findings are flagged as possibly contaminated; the transfer set is unaffected.
- Corrections accepted from the independent review of wave 1 stand (read-out overclaim, denominators, bound units, F110 in development, repeatability withdrawn until measured, and later measured).

## 9. What this means for the pipeline question, and what to do next
1. Do not put Jev in the loop as an authority for any of the listed steps. The failures are exactly the ones that matter (necessary corrections, weakened conditions, neighbouring clauses).
2. Two jobs are worth a shadow trial next: the preservation screen (the two-question rule, now checked on two populations at 1 miss in 206 and 6 in 124, with a strong-model diff review behind it for anything it flags or is unsure about) and the attribution pre-filter in its strict form (R1 not_present >= 0.9; zero credited links lost on both topics; the saving is large only when the candidate set is sparse, as a real all-findings-by-all-notes set is).
3. The R1 `asserts_whole` tier can auto-credit a minority of links at precision 1.0 on reviewed links on both topics, but two independent strong-model judges refused 4 of its 28 cross-topic credits (14%), so it is a strong prior for the judge, not an unreviewed authority.
4. Three of four continuation corrections are catchable by deterministic schema witnesses; that is cheaper than any model and should land first.
5. The strong-model reference arms show the ceiling is the task and the evidence, not only the model: Opus over-calls corrections on the same passages, and adding the arms' research notes fixes recall but not precision.

## 10. Artifact index
Plans and reviews: `PLAN/`. Wave 1: `reports/CALIBRATION.md`, `reports/DIAGNOSIS.md`. Wave 2 scripts: `wave2/*.py`, `wave2/opus_arm/*.py`. Scores: `wave2/scores_*.json`, `wave2/opus_arm/scores_*.json`, `wave2/comparator/`. Cascades: `wave2/cascade.py`, `wave2/cascade.json`. Cross-topic adjudication: `wave2/opus_arm/scores_Xt_opus.json`; Opus R1 on Jujutsu: `wave2/opus_arm/scores_Cr1_*.json`. Family P aligned run: `wave2/runs/answers_P_v2.jsonl`; P3 prospective check: `wave2/run_p3.py`, `wave2/runs/answers_P3.jsonl`, `wave2/scores_P3.json`; wave-1 question on transfer notes: `wave2/runs/answers_C_W1_transfer.jsonl`; sparse cross-topic set: `wave2/runs/answers_C_R1_transfer_x_jujutsu.jsonl`, `answers_C_W1_transfer_x_jujutsu.jsonl`, `wave2/scores_C_sparse_filter.json`. Progress log with timestamps: `wave2/PROGRESS.md`. Receipts and ledger: `runs/receipts.jsonl`, `runs/ledger.json`.

---
Trailer added 2026-09-17 11:15 UTC: an independent review of this report was answered in `wave2/WAVE2_RECONCILIATION.md` with metrics regenerated from the saved records (`wave2/reconcile_wave2.py`, `wave2/reconciliation_metrics.json`). The body above is preserved as a snapshot. Where the reconciliation note and this body disagree, the note governs; in particular the "passed a prospective check" and "most practical cost result" statements, the "auto-credit" vocabulary, the "a thousandth of the cost" comparison, the 4.2 census figures and the 3.3 abstention denominators are superseded there.
