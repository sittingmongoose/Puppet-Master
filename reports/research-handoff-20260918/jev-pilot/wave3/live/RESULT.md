# Small trial result: early preservation warnings during drafting (2026-09-17)

Protocol: `PROTOCOL_LIVE.md`. Item: the continuation-4 corrections ledger re-drafted from its records at base 2a92905501 by two Opus writers in isolated worktrees (prose owner units only), one arm with Jev's validated preservation warnings after the saved draft, one without; identical deterministic checks in both; blind Opus reviewers; one repair-and-re-review cycle per arm (cap reached). Nothing pushed or landed. Interruption: the first launch of both writers was killed by the Opus session limit before any edit; both relaunched from the clean base at 19:10 UTC.

## What the warning step did on the saved draft (arm T)
Jev checked 92 existing obligations across the 7 edited units under the frozen two-question rule and raised **0 warnings**: the writer had preserved every existing sentence. The deterministic witnesses fired their 5 ledger-side record-versus-target items (the same on both arms, a property of the ledger). The arm-T repair pass over those 5 witness items changed nothing (0 real, 1 intentional, 4 false). Jev cost: $0.01, under a minute. So the treatment arm entered review with a draft byte-identical to its saved draft.

## Reviews and repairs
| arm | draft time | draft tokens | review 1 (findings / should-fix or blocking) | repair 1 (real / intentional / false) | review 2 (findings / should-fix or blocking) | verdict after cycle 1 |
|---|---|---|---|---|---|---|
| C, no warnings | 13 min | 175K | 6 / 4 | 2 / 2 / 0 | 12 / 7 | fix_then_land |
| T, warnings | 14 min | 177K (+99K warning-repair pass, no change) | 11 / 6 | 3 / 3 / 0 | 8 / 4 | fix_then_land |
| real thread's compile (reference, no warnings) | hours (with schemas, fixtures, gate) | not metered | 19 / 13 and 19 / 13 (two blind reviewers) | n/a | 14 / 6 after the warning-driven repairs of the earlier replay | fix_then_land |

Both arms' first reviews raised the same classes: the "where required" qualifier left standing beside the new absolute rule in JJI-008, the missing `gc_fence_covered_paths` field, and receipt gaps for obligations carried into SCS-014 and SCS-015 beyond the queue's target list; both repair passes fixed the first two and recorded the receipt gaps as licensed by the findings shard. Second reviews did not converge: a fresh blind reviewer raised new should-fix items on both arms (scope, receipts, validation surfaces, a lost stage count), so neither arm reached "land" within the one-cycle cap.

## Strong-model work
| arm | writer | reviews | repairs | total Opus tokens |
|---|---|---|---|---|
| C | 175K | 157K + 158K | 112K | 602K |
| T | 177K | 154K + 156K | 99K (warning pass) + 131K | 717K |

## Read-out
1. On this item the preservation warnings had nothing to say: a competent writer told not to weaken existing sentences did not weaken them, and the validated rule confirmed it at 92 of 92. The warning stage cost cents and added no information, so it could not reduce review findings or repair cycles; the only extra cost was the procedural repair pass over witness items, which a production flow would skip when there are no warnings.
2. What the reviews found in both arms is the ledger-to-plan carry-over class (receipts, scope, field names, validation surfaces), which is beyond the validated direction and is partly the deterministic witnesses' job (they fired the record-versus-target items on both arms) and partly reviewer work.
3. Review-to-review variance dominated: second blind reviewers found more should-fix items than first ones on the same arm after repairs. Any cost comparison at this scale is inside that noise.
4. Answer to the question the trial was for: on this evidence, Jev's preservation warnings are not worth integrating into the compile workflow. Keep the three deterministic witnesses (now on main). If Jev has a place at all it is the narrow attribution pre-filter on sparse candidate sets, which this trial did not exercise.
