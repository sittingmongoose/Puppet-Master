# CA-SEAL branch report: the DL-412 seal-check change, 2026-11-04

Branch `plans/ea-seal-check-multifamily-20261104`, from `origin/main` `5e37ffb616`. Worker CA-SEAL, stream E, agent task `claude-opus-5.5:ea-ca-seal-20261104`. Fix round 1 was done by worker CA-SEAL-FIX1, agent task `claude-opus-5.5:ea-ca-seal-fix1-20261104`. The full change record is `seal-check-multifamily-step-amendment.md` beside this file.

## What this branch does

It makes exactly the change Jared approved in E-CARDS-1 item 4c, option B (DL-412): the frozen seal check now accepts an admission record that describes a truthful registry step that added several families at once, provided every family of that step has its own complete record naming the same step. Nothing else in the check changes.

| Commit | What |
|---|---|
| `e217c94c3b` | The validator (`190a86f2...` -> `bad3e7e8...`, CRLF), its spec section, the disposition-schema note and the DL-412 change receipt |
| `d67201e885` | The change record and this report (reviewed by Sol: NOT_READY, CA-SEAL-01 and CA-SEAL-02) |
| `e10fc5c840` | Fix round 1: the validator (`bad3e7e8...` -> `e4e988b7...`, CRLF), the spec's DL-412 section, and the receipt's validator pin and text |
| fix round 1, reports commit | The change record and this report, aligned with the fixed check |

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
| The check before and after, 11 scenarios plus S7 (fix round 1 rerun) | 1 (the seal is expected to fail) | Only the approved behavior changed (field-by-field diffs in the change record). Every output is identical to the reviewed head's except the DL-412 receipt pin. |
| Old-versus-new differential over every existing record (fix round 1) | 0 | 1,812 + 1,808 + 4 + 24 comparisons and the `main()` pair: zero differences. On the reviewed head: 16 differences (the 4 X2 controls, and 12 legacy records given a step problem). |
| Sol review probes on the fixed check: 22 negatives, 4 malformed-claimant counterexamples, X1 and X2 `main()`, the 112-field legacy probe | 0 | Every step member is rejected in all 26 cases. X2 old and new are identical except the new pin. 112 of 112 are equal. |
| Sol review test matrix (main / branch / integration unpatched / integration patched) | 1, 1, 1, 0 | 34 tests with 2 failures; 34 with 41; 34 with 41; patched 57 tests OK |
| Patched holding-bucket test, integration tree | 0 | 57 tests OK (52 at the reviewed head) |
| Patched holding-bucket test, the reviewed head's check | 1 | 24 failures: the new tests catch CA-SEAL-01 and CA-SEAL-02 |
| Mutation check, 19 mutants | n/a | 19 of 19 caught (12 original, one retargeted; 7 new for the two findings) |
| Unpatched holding-bucket test, this branch | 1 | 41 failure entries: the fixtures lack the DL-412 receipt (the patch fixes it) |
| `test_pm_coordination_events` | 1 | 14 failure entries, the count Card 5 reports for `main` and the same 14 as round 0; same with the patched holding file in place |
| `test_pm_emit_only_event_boundaries` | 1 | 1 failure: registry prefix digest; the registry is untouched here |
| `test_pm_pnc019_currentness` | 1 | 1 failure: the same 22 pre-existing currentness source drifts as round 0, none in this branch's files |
| `pm-shard-plans.py --check` | 0 | pass |
| `pm-plan-index.py validate` | 0 | `status: pass` |
| `pm-plans-verify.py lint-path-refs` | 1 | 14 failures, all in `Plans/.plan_index/plan_units.jsonl` (untouched). These are round 0's 12, plus `BPM-009` and `DL-055` naming `.claude/CLAUDE.md`, which the fix worktree's sparse checkout (`Plans scripts reports tests`) leaves out. |

No `Plans/*.md` owner document changed, so no shard or index regeneration was needed. The tracked validator output receipt was never written: every run used a scratch tree.

## Review round 1: findings and responses

Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL-sol/REVIEW.md` (Sol, NOT_READY at `d67201e885`). Both blocking findings are fixed. No finding is disputed and none needed Jared. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL/` (fix round 1 at the top level, the reviewed round under `round0/`).

### CA-SEAL-01 (blocking): malformed extra claimants escaped the step conflict check

**Fixed in `e10fc5c840`.**

The cause was that conflict detection used `registry_step_states()`, which returns `None` when any revision, count or SHA-256 is malformed. A record naming the step's SHA-256 pair dropped out of the claimant set, and the members were admitted.

**What changed in the validator** (`e4e988b7...`):
- **`registry_step_claim` (line 270)** reads the `(before, after)` `sha256` pair from the two fields alone. It trims whitespace and lower-cases, and validates nothing else.
- **`registry_step_problems` (lines 286-318)** fails the step for every record whose pair matches, other than a listed member's own record (line 310).
- **Rejected files count.** `validate_post_august_admissions` keeps parseable record files rejected for their name or event type (line 422). They are claimants under their file name (line 311).
- **The claimant keeps exactly its own problems**, such as `registry_before`.

**What changed in the tests** (patch `fbe7bcd6...`):
- `test_a_malformed_record_naming_the_step_still_fails_the_step` (24 cases): one-family form and step form, with malformed revision, count and SHA-256, and with malformed lists;
- `test_any_other_record_file_naming_the_step_fails_the_step` (5 cases): misnamed, no event type, a second record of a member, malformed and misnamed, and a Known37 family;
- `test_main_rejects_a_step_named_by_a_malformed_record`: the review's X1 through `main()`.

**How to verify:**
- Run the review's `adversarial.py` on the fixed check: all 26 cases reject every step member, including the four counterexamples. X1's `main()` admits only `coordination.agent_registered`.
- Run the patched test against `bad3e7e8...`: it fails 24 entries.
- Mutants 13-16 and 19 are caught.

### CA-SEAL-02 (blocking): the DL-412 decision ban reached old-format records

**Fixed in `e10fc5c840`.**

**The tuple.** Lines 341-342 are again byte for byte DL-077's: `if match.group(1) in ("DL-077", "DL-078") or not named:`. DL-412 is barred only by `elif multi and match.group(1) == "DL-412":` (line 343), where `multi` means the record carries `registry_step_event_types`.

**A second change on the same boundary, beyond the finding's text.** The reviewed head also gave `registry_step_partial:<self>` to a one-family record naming a step's SHA-256 pair. That changed how a record without the field was judged whenever step records existed. The task's rule is that such a record "must be judged byte-for-byte as before". So that loop is removed. The conflict now fails the step (CA-SEAL-01's claimant rule), and the one-family record keeps exactly its DL-077 judgment. On the reviewed head's check the differential shows 12 differences from this loop, and zero on the fixed check.

**Tests:**
- `test_a_record_without_the_field_keeps_the_dl077_decision_rule`, the explicit legacy differential. A record without the field citing DL-412 is judged exactly like the same record citing `DL-998`, a fixture entry with DL-412's body: both have no problems. A step record citing DL-412 is barred. Records of either form citing DL-078 are barred. In `validate_post_august_admissions`, the legacy record citing DL-412 is admitted.
- `test_step_records_never_change_a_record_without_the_field`: 5 cases.
- `test_a_one_family_record_naming_the_step_fails_the_step_and_keeps_its_own_judgment`, which replaces the reviewed head's `..._fails_the_step_and_itself`.
- `test_dl412_is_not_a_family_decision_entry` keeps the multi-family self-citation negative.

**How to verify:**
- Run the review's `legacy_probe.py` on the fixed check: old and new problems are both `[]`, and old and new `main()` both admit `coordination.agent_registered`. The output receipts differ only in `multi_family_step_receipt_sha256`. 112 of 112 mutations are equal.
- Run `differential.py`: zero differences.
- Mutants 8, 17 and 18 are caught.

### Note 3: landing prerequisites

**No change; they stay open items 1-3.** The receipt is committed with `lander_task: null`, as before. Its `authority_section_sha256` (`95375f19...`, DL-412 at `b6332f391a`) and `prior_receipt` pin are unchanged. Only `validator_after_sha256` and the text of `record_contract_change`, `changes` and `does_not_relax` changed. The receipt's SHA-256 is `afef45e2...` -> `6c749a74...`.

### Families, grades and ids

**Families.** None. This branch grades no family, before or after.

**Ids.** None minted. `DL-998` is a fixture-only decision entry inside the test's temporary Decision Log copy, beside the existing fixture-only `DL-999`. Neither enters `Plans/`.

### Round-1 checks

All runs used scratch trees; no checkout's tracked output receipt was written.

| Run | Result |
|---|---|
| **S1-S7, C1-C5** | All exit 1. Output identical to round 0 except the DL-412 receipt pin, in S4, S7, C2, C4 and C5. |
| **Differential**, fixed check | 0 differences |
| **Differential**, reviewed head | 16 differences |
| **Review probes** | 26 of 26 reject; X2 identical; 112 of 112 equal |
| **Patched tests** | 57 OK |
| **Mutants** | 19 of 19 caught |
| **Repository suites** | Same as round 0: coordination 14, emit-only 1, pnc019 1 (22 drifts), shard check pass, index validate pass. lint-path-refs as in the checks table. |

## Open items

1. **The lander fills `lander_task`.** Do this at landing by running the receipt writer with `--lander` on the tree that carries DL-412 (command in the change record). Until then the check fails closed on the receipt.
2. **Landing order.** The branch lands after `plans/ea-cards1-answers-20261104` (DL-412).
3. **The test patch.** It lands as its own commit once DL-413's `.gitignore` line (`66af5d0d67`) is on `main`. Without it the holding-bucket test fails 41 entries instead of today's 2.
4. **The DL-300 records.** The record writer chooses and documents the truthful step. The commit that appended the three rows is `102a7e99e8`, and that step also changed eleven Goal rows.
5. **Reviews.** Sol 6.1 max then Astra max, before landing and right after. The author (CA-SEAL) and the fix worker (CA-SEAL-FIX1) are barred from applying the seal.
6. **The seal bar for the fix worker is procedural.** The receipt's checked `seal_applier_forbidden_tasks` must equal the author and the lander. Adding CA-SEAL-FIX1 would be another check change, which is not approved. The seal applier's procedure must exclude CA-SEAL-FIX1 by hand.
