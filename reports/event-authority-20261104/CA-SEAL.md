# CA-SEAL branch report: the DL-412 seal-check change, 2026-11-04

Branch `plans/ea-seal-check-multifamily-20261104`, from `origin/main` `5e37ffb616`. Worker CA-SEAL, stream E, agent task `claude-opus-5.5:ea-ca-seal-20261104`. The full change record is `seal-check-multifamily-step-amendment.md` beside this file.

## What this branch does

It makes exactly the change Jared approved in E-CARDS-1 item 4c, option B (DL-412): the frozen seal check now accepts an admission record that describes a truthful registry step that added several families at once, provided every family of that step has its own complete record naming the same step. Nothing else in the check changes.

| Commit | What |
|---|---|
| `e217c94c3b` | The validator (`190a86f2...` -> `bad3e7e8...`, CRLF), its spec section, the disposition-schema note and the DL-412 change receipt |
| this commit | The change record and this report |

## Families

None. This branch registers no family, writes no admission record, moves no registry checkpoint and grades nothing. There is no self-grade JSON. The three DL-300 families (`settings.layer.changed`, `approval.chat_tool_requested`, `approval.chat_tool_resolved`) get their records later, once each contract reaches 12 of 12.

## Newly authored bindings

None.

## Premise checks

| Item | Check | Result |
|---|---|---|
| DL-077's limit of one more change | DL-412 (pushed at `b6332f391a`) supersedes it for this third change only; the card text and Jared's answer file (`00bb608e...`) match | holds |
| The DL-077 record format the change extends | today's validator, receipt `dceb7f21...` and the four existing records | unchanged since `dfe148daad`; existing records pin `dceb7f21...` and stay valid |
| The three DL-300 families were added together | registry history | `102a7e99e8` appended all three (43 -> 46, label `2026-10-09.1` on both sides) and also changed eleven Goal rows; `5375bfd2a7` only relabeled to `2026-11-04.1`. Reported for the record writer; the check does not examine same-step row edits, before or after. |
| The sections the check pins are unchanged on the DL-412 branch | SHA-256 of DL-039, DL-040, DL-046, DL-077 and DL-094 at `origin/main` and `b6332f391a` | identical |
| The holding-bucket test may be edited | `git check-ignore -v tests/test_event_authority_holding_bucket.py` on `main` | not named; DL-413's line is only on `plans/ea-gitignore-ea-tests-20261104` (`66af5d0d67`). The test change is delivered as a patch, not committed. |

## Ids used

None minted. The receipt and the record cite DL-412 (CA-DL's entry). The test patch uses `DL-999` only as a fixture decision entry inside its own temporary copy of the Decision Log; that string never enters `Plans/`.

## Checks

| Check | Exit | Result |
|---|---|---|
| The check before and after, 11 scenarios plus S7 | 1 (the seal is expected to fail) | Only the approved behavior changed (field-by-field diffs in the change record) |
| Patched holding-bucket test, integration tree | 0 | 52 tests OK |
| Mutation check, 12 mutants | n/a | 12 of 12 caught |
| Unpatched holding-bucket test, this branch | 1 | 41 failure entries: the fixtures lack the DL-412 receipt (the patch fixes it) |
| `test_pm_coordination_events` | 1 | 14 failure entries, the count Card 5 reports for `main`; same with the patched holding file in place |
| `test_pm_emit_only_event_boundaries` | 1 | 1 failure: registry prefix digest; the registry is untouched here |
| `test_pm_pnc019_currentness` | 1 | 1 failure: 22 pre-existing currentness source drifts, none in this branch's files |
| `pm-shard-plans.py --check` | 0 | pass |
| `pm-plan-index.py validate` | 0 | `status: pass` |
| `pm-plans-verify.py lint-path-refs` | 1 | 12 failures, all in `Plans/.plan_index/plan_units.jsonl` (untouched) |

No `Plans/*.md` owner document changed, so no shard or index regeneration was needed. The tracked validator output receipt was never written: every run used a scratch tree.

## Open items

1. **The lander fills `lander_task`.** Do this at landing by running the receipt writer with `--lander` on the tree that carries DL-412 (command in the change record). Until then the check fails closed on the receipt.
2. **Landing order.** The branch lands after `plans/ea-cards1-answers-20261104` (DL-412).
3. **The test patch.** It lands as its own commit once DL-413's `.gitignore` line (`66af5d0d67`) is on `main`. Without it the holding-bucket test fails 41 entries instead of today's 2.
4. **The DL-300 records.** The record writer chooses and documents the truthful step. The commit that appended the three rows is `102a7e99e8`, and that step also changed eleven Goal rows.
5. **Reviews.** Sol 6.1 max then Astra max, before landing and right after. I am barred from applying the seal.
