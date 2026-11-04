# DL-412: the seal check's third recorded change, truthful multi-family registry steps, 2026-11-04

DL-412 (Jared, 2026-11-04, card E-CARDS-1 item 4c, option B) approves a third recorded change to the frozen independent seal check (`Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py`), after DL-039's holding-bucket change and DL-077's post-August admission change. Jared's verbatim answer was "approve all except 4c B". The approved option reads: "a third recorded change to the frozen check, so it accepts a truthful step that added several families at once. Each family still needs its own record. DL-077 allowed exactly one more change, so this needs your new approval."

pm7-build relayed this reading with the answer (not Jared's words): 4c B was pm7-build's suggestion, not the stream E recommendation. Make the change openly, with the same before and after reviews, and record what it does and does not relax. No other change to that check is approved.

This branch makes that change and writes its receipt. It writes no admission record. The records for the three DL-300 families come later, once each family's contract reaches 12 of 12.

**Barred from the seal.** The author is the agent task `claude-opus-5.5:ea-ca-seal-20261104`. The receipt names it, and the lander it records at landing, as tasks that must never apply the seal.

**Approving entry.** DL-412 is on `plans/ea-cards1-answers-20261104` at `b6332f391a`, not yet on `main`. Its prose section (`### DL-412:`) has SHA-256 `95375f1997a193d58a3d02c82a46892e324ac0dd1cfbbc2b69efc212ae932927`, and the receipt pins that value.

## The rule, before and after

**Before** (DL-077, validator `190a86f2...`, line 221 of `main`'s file). A record's step must add exactly one family:

```python
if after["family_count"] != before["family_count"] + 1 or after["sha256"] == before["sha256"]:
    problems.append("registry_before_after_not_exactly_one_family")
```

So a family registered in a step that added k > 1 families had no truthful record. The three DL-300 families went from 43 to 46 together.

**After** (validator `bad3e7e8...`):

- **A record without `registry_step_event_types`** is judged exactly as before. That includes the line above, unchanged at line 342, and the record pinning the DL-077 receipt.
- **A record with `registry_step_event_types`** describes a multi-family step. It is complete only if all of the following hold:
  1. The list is a sorted list of two or more distinct, non-empty event types that includes the record's own.
  2. `registry_after.family_count == registry_before.family_count + len(list)` and the two SHA-256 differ (`registry_before_after_not_exactly_step_families`, line 346).
  3. Every listed family is registered beyond Known37 and the August pair. Each has its own record carrying the identical list and the identical `registry_before` and `registry_after` (revision, SHA-256 and family count). No other record of either form names the same before and after SHA-256 (`registry_step_partial:<families>`). A one-family record that names those states fails too.
  4. Every listed family's record is complete on its own (`registry_step_member_incomplete:<families>`). A step counts only as a whole.
  5. The record pins the SHA-256 of the DL-412 receipt (`implementation_receipt_sha256`), the receipt it is written under.
  6. Every DL-077 rule still applies to the record itself:
     - `schema_id` and `family_id`;
     - its own decision entry, which names its exact event type (DL-077, DL-078 and now DL-412 cannot be cited);
     - its live registry row SHA-256;
     - its own depth assessment row at the live `family_id` and `family_revision`, with all twelve criteria PASS and Plans/ evidence for each PASS.

Code: `registry_step_shape_ok` (line 249), `registry_step_states` (line 256), `registry_step_problems` (line 270), the step-size branch in `admission_record_problems` (lines 335-346), and the two-pass judgment in `validate_post_august_admissions` (lines 404-425). That judgment rates every record on its own, then the records of each multi-family step together. If the step judgment itself raised, every step record would be reported malformed. With no record carrying the field, its output and issue order are identical to DL-077's.

## What it relaxes

Exactly one thing: a family registered by a registry step that added several families at once can now have a complete admission record, whose before and after are that step's true states. Nothing else that failed before passes now. The counterfactual runs below show it.

## What it does not relax

- **No family without a record.** Every family registered beyond Known37 and the August pair still needs its own record file. Without one it fails with "no admission record", `post_august_admission_incomplete` and `unexpected_august_set`. A step record admits only its own family.
- **No partial step.** If one listed family lacks a record, names a different step or list, or is incomplete on its own, every record of that step fails. An extra record naming the step's SHA-256 pair also fails the step.
- **No depth waiver.** Each record pins its own assessment row, all twelve criteria PASS, each PASS with evidence under `Plans/`.
- **No decision waiver.** Each record cites Jared's decision entry for its family, naming its exact event type. DL-412 joins DL-077 and DL-078 as entries that cannot be cited.
- **No change to anything else the check enforces:**
  - the one-family rule;
  - Known37;
  - the August pair and the August fingerprints;
  - the freeze digest;
  - the census, partition and denominator;
  - the holding bucket;
  - the exclusion, owner-sheet, August-checkpoint, evidence-shape and oracle-harness checks;
  - any pass predicate.
- **No re-stamp.** None of the following changes:
  - the freeze digest, closure hashes and cohort pins;
  - the historical validator receipt (`receipts/event_authority_validator_receipt.json`);
  - the Step 3 receipt (`d7800b98...`) and the DL-077 receipt (`dceb7f21...`);
  - the four existing admission records;
  - Spec Lock, `.evidence`, `.gitignore` and `auto_decisions.jsonl`.
- **Not stronger on truthfulness than before.** The check reads only the records and the live registry. Whether the pinned before and after SHA-256 are the real registry bytes of that step is the record writer's claim, verified by review against git history. That is unchanged from one-family records.
- **Same-step row edits are not examined.** Edits to existing rows made in the same registry step are not examined, before or after this change.

## What changes

| File | Change |
|---|---|
| The seal check (CRLF kept on every line) | SHA-256 `190a86f23e06362bdb98e27eb23268c9691db46cc41bc9f97e1fbb6bde1abc20` (1,754 lines) -> `bad3e7e852a0c4697709ca1a45083e5317cb0a5cea8ef2cf4c0eda0a5d0a544d` (1,892 lines). DL-412 constants. `multi_family_receipt_state` (line 206). `post_august_validator_pin` (line 237): the DL-077 receipt's `validator_after_sha256` now has to equal the DL-412 receipt's `validator_before_sha256` (line 181). It used to equal the current file. The three step functions above. The step branch and receipt choice in `admission_record_problems`. `"DL-412"` in the excluded decision entries (line 324). The two-pass judgment. The check's own output receipt pins the DL-412 receipt (`multi_family_step_receipt_sha256`, line 1824), as it pins DL-077's. |
| `INDEPENDENT_EA_VALIDATOR_SPEC.md` | A DL-412 section after the DL-077 section, as DL-077 added one after Step 3's. |
| `INDIVIDUAL_DISPOSITION_SCHEMA.md` | A note: DL-412 adds no bucket and no row field. A family accepted through a step record is treated exactly like one accepted through a one-family record. |
| `reports/event-authority-20261104/seal-check-multifamily-step-receipt.json` | The change receipt, detailed below. |

The receipt has SHA-256 `afef45e23eb41f6d8e22d5bd85eb53c4d3043110209bcb3d94ab2b82efc95808` as committed. It binds:
- the DL-412 section (`95375f19...`, as pushed at `b6332f391a`);
- Jared's answer file (`00bb608e...`) and the cards as presented (`578a6774...`);
- the DL-077 receipt's exact bytes (`prior_receipt.sha256` `dceb7f21...`, checked by the code);
- validator before `190a86f2...` and after `bad3e7e8...`;
- the record directory and schema;
- the author, and `seal_applier_forbidden_tasks`, which must equal the sorted author and lander;
- `seal_authorized`, `admission_authorized` and `contract_depth_complete`, all false.

It also states what the change relaxes and what it does not. `lander_task` is `null` as committed, so the check fails closed on this receipt until the lander fills it (scenario S6 below).

### Every place that pins the validator's bytes

| Pin | Before | After |
|---|---|---|
| Step 3 receipt `validator_after_sha256` (`step-03-holding-bucket-receipt.json`) | `bd54afff...` | unchanged. The holding check still reaches it only through the DL-077 receipt's `validator_before_sha256`. |
| DL-077 receipt `validator_before/after_sha256` (`step-10-post-august-admission-receipt.json`) | `bd54afff...` -> `190a86f2...` | unchanged (file untouched). Its `after` is now checked against the DL-412 receipt's `before`, not the current file. |
| DL-412 receipt `validator_before/after_sha256` (new) | none | `190a86f2...` -> `bad3e7e8...`, checked against the current file |
| Chain code in the check | `post_august_receipt_state`: DL-077 `after` == current file | `post_august_receipt_state`: DL-077 `after` == `post_august_validator_pin()`, which is DL-412's `before` through a valid DL-412 receipt, else the current file. `multi_family_receipt_state`: DL-412 `after` == current file. |
| The check's output receipt `input_pins` | holding receipt, DL-077 receipt | plus `multi_family_step_receipt_sha256` |
| `tests/test_event_authority_holding_bucket.py` fixtures | copy the Step 3 and DL-077 receipts | must also copy the DL-412 receipt: the patch below, not committed here |

No script, Spec Lock entry, `.evidence` file, readiness artifact or currentness edition pins the validator's bytes. This was checked by search:
- `git grep 190a86f2` finds only the DL-077 receipt and four history reports;
- `Plans/Spec_Lock.json` does not name the directory;
- the 2026-08-13 currentness edition does not list it.

The reports that cite `190a86f2...` as history keep their text:
- `step-10-post-august-amendment-20260924.md`;
- `step-09-coord-registered-20260925.md`;
- `LANDING_20260924_EA_VALIDATOR_AMENDMENT.md`.

## Results: the check before and after

Every run uses a scratch tree made by `git archive origin/main` (`5e37ffb616`) of exactly the inputs the check reads:
- `Plans/.audits/event-authority-2026-08-12`;
- `Plans/Decision_Log.md`;
- `Plans/event_family_registry.json`;
- `reports/event-authority-20260911`.

The validator under test is placed in the tree and run as `python3 -I <tree>/.../pm_event_authority_independent_validator.py`, so its output receipt is written in the scratch tree, never in a checkout. "+DL" means `Plans/Decision_Log.md` from `b6332f391a` (it carries DL-412 and the `### DL-300:` entry form). Every section the check pins is byte-identical there: DL-039, DL-040, DL-046, DL-077 and DL-094.

The DL-300 counterfactual adds three records for the three DL-300 families, never committed. Their states:
- before `2026-10-09.1`, 43 families, `4ffde4e8...` (`102a7e99e8~1`);
- after `2026-10-09.1`, 46 families, `65c9d2df...` (`102a7e99e8`, the commit that appended the three rows).

The counterfactual also gives their rows twelve PASS in a scratch depth assessment. "Step form" records carry the list and pin the DL-412 receipt. "One-family form" records carry no list and pin the DL-077 receipt.

| Run | Check | Admitted post-August families | Failures |
|---|---|---|---|
| S1 `origin/main` | unchanged | coordination.agent_registered | 6: `fresh_census_denominator_not_closed`, `individual_dispositions_evidence_gap_blocking`, `individual_dispositions_provisional`, `post_august_admission_incomplete` (3 no record, 3 depth), `registered_contract_depth_incomplete`, `unexpected_august_set` |
| S2 `origin/main` +DL | unchanged | same | same 6 |
| S4 `origin/main` +DL + receipt (lander filled) | changed | same | same 6; full output identical to S2 except the new input pin |
| S7 the committed receipt with only the lander filled | changed | same | identical to S4 |
| S3 `origin/main`, no DL-412, receipt | changed | none | fails closed: "DL-412 prose entry missing", `holding_bucket_invalid`, every post-August family out |
| S5 +DL, no DL-412 receipt | changed | none | fails closed: DL-077 receipt mismatch, `holding_bucket_invalid` |
| S6 +DL, committed receipt (`lander_task` null) | changed | none | fails closed: DL-412 receipt identity mismatch, `holding_bucket_invalid` |
| C1 DL-300 one-family form | unchanged | coordination.agent_registered | 6; the three fail `registry_before_after_not_exactly_one_family` |
| C2 DL-300 one-family form | changed | same | identical to C1 except the new input pin: the one-family rule is unchanged |
| C3 DL-300 step form | unchanged | coordination.agent_registered | 6; the three fail `implementation_receipt_sha256` and `registry_before_after_not_exactly_one_family` |
| C4 DL-300 step form | **changed** | **coordination.agent_registered, approval.chat_tool_requested, approval.chat_tool_resolved, settings.layer.changed** | 6; the three leave `post_august_admission_incomplete` and `unexpected_august_set` |
| C5 DL-300 step form, `settings.layer.changed` at 11 of 12 | changed | coordination.agent_registered | 6; `settings.layer.changed: depth_incomplete:producer` and both others `registry_step_member_incomplete:settings.layer.changed` |

Field-by-field diffs of the check's output receipts, ignoring `generated_at_utc`:
- **S1 vs S2:** only `holding_authority_source_sha256` differs, because the Decision Log is a different file.
- **S2 vs S4:** only `multi_family_step_receipt_sha256` differs (absent -> `6e2504c9...`).
- **C1 vs C2:** only that pin differs.
- **C3 vs C4:** besides that pin, only the three families' admission differs: `post_august_admitted`, the `post_august_admission_incomplete` issues (9 -> 3) and the `unexpected_august_set` list.

The seal stays failing in C4 for reasons this change does not touch:
- the census denominator;
- the provisional August rows;
- the August families' depth;
- the compaction and Browser records' depth gaps.

## Tests

`tests/test_event_authority_holding_bucket.py` is tracked but not named in `.gitignore` on `main`, so this branch may not edit it. DL-413 (Card 5) approves its `.gitignore` line. That line is the one commit on `plans/ea-gitignore-ea-tests-20261104` (`66af5d0d67`), not yet on `main`. The test change is therefore delivered as a patch, `test_event_authority_holding_bucket.dl412.patch`, in the evidence folder (SHA-256 `679a095f...`, +301/-13, applies cleanly to this branch). It goes in as its own commit once the `.gitignore` line is on `main`.

The patch does five things:
- Both fixtures copy the DL-412 receipt.
- `PostAugustAdmissionTests` records the three DL-300 families as one multi-family step: fixture states 43 -> 46, a fixture-only decision entry `DL-999` naming them, and the families in a separate `RECORDED` list. `POST` is unchanged, so `test_pm_coordination_events`'s check that `POST[3:]` equals the admitted coordination rows still holds.
- `HoldingBucketTests` gains `test_holding_pin_follows_the_dl412_receipt_chain`.
- A new `MultiFamilyStepTests` class adds 17 tests.
- All 34 existing tests keep their assertions.

| Run | Result |
|---|---|
| Patched file, integration tree (this branch + DL-412's Decision Log + receipt with lander) | 52 tests, OK, exit 0. This includes the two tests that fail on `main` today because the three DL-300 families had no records. |
| Patched file, 12 mutants of the change, each with the receipt re-pinned to the mutant's bytes so only behavior tests can catch it | 12 of 12 caught. The mutants: no all-or-none, no extra-claimant check, no missing-member check, no same-states check, step size unchecked, list order unchecked, step records pinning DL-077's receipt, DL-412 allowed as a decision entry, no one-family conflict, lander unchecked, prior receipt unchecked, chain bypassed. |
| Unpatched file, this branch as committed | 41 failure entries, exit 1. The fixtures do not copy the DL-412 receipt, so the chain fails closed in every fixture. This is the reason the patch must land with the change. |
| Unpatched file, integration tree | the same 41, same reason |
| `test_pm_coordination_events`, this branch | 14 failure entries, exit 1. That is the count Card 5 reports for `main`; `test_holding_bucket_post_august_list_follows_admitted_coordination_rows` passes. |
| `test_pm_coordination_events` with the patched holding file in place (temporary, restored) | the same 14, and the link test still passes |
| `test_pm_emit_only_event_boundaries` | 1 failure, exit 1: the registry's first-40-row digest (`2fe49c02...` vs the pinned `a27cf49b...`). That is the registry, which this branch does not touch. |
| `test_pm_pnc019_currentness` (currentness edition copied in, 15 files, hashes match the share) | 1 failure, exit 1: 22 `event_authority_currentness_source_drift` entries for Plans documents edited since the 2026-08-13 edition. None names a file this branch changes. |
| `pm-shard-plans.py --check` | exit 0, pass |
| `pm-plan-index.py validate` | exit 0, `status: pass` |
| `pm-plans-verify.py lint-path-refs` | exit 1: 12 `implementation_surface_missing_or_untyped` in `Plans/.plan_index/plan_units.jsonl`, which this branch does not change. None names a file of this branch. |

Negative cases the patched tests run through the changed check:
- a missing member record;
- a different before or after revision or SHA-256 on one record;
- a different list on one record;
- a step of 45, 47 or 43 families instead of 46;
- equal before and after SHA-256;
- a listed family that is unregistered, Known37 or August;
- an extra one-family record naming the step's states;
- eight malformed lists;
- one member at 11 of 12 (PARTIAL or ABSENT) or with a PASS lacking Plans/ evidence;
- one member citing DL-040;
- one member citing DL-412 (even when DL-412 names it);
- a changed live row;
- a step record pinning DL-077's receipt;
- a later edit to the DL-412 receipt;
- 20 tampered receipt fields, including a blank or null lander with a consistent forbidden list;
- a missing receipt;
- each of the four DL-412 required tokens removed;
- `main()` with a partial step.

Positive cases:
- a complete step admits each of its three families, both through `validate_post_august_admissions` and through `main()` (no `post_august_admission_incomplete`, no `unexpected_august_set`, the new pin present);
- the same step in one-family form fails exactly as before;
- all 34 existing one-family tests pass.

## Landing notes

- **Order.** This branch lands after DL-412 (`plans/ea-cards1-answers-20261104`), which the receipt pins. On `main` alone the check fails closed (S3). Before landing, rebase onto the tree that carries DL-412 and run the receipt writer:

  ```
  python3 -I write_multifamily_receipt.py <worktree> --lander <lander task>
  ```

  Commit the receipt. If DL-412's prose bytes changed since `b6332f391a`, the writer re-pins them in the same run.
- **The test patch.** It lands as its own commit in the same landing, after DL-413's `.gitignore` line is on `main`. Without it, the holding-bucket test goes from 2 to 41 failure entries.
- **Re-pin rule.** Any later change to the validator, DL-412's prose section or the DL-077 receipt bytes requires the DL-412 receipt to be rewritten. A rewritten DL-412 receipt requires every step record to be rewritten.
- **The DL-300 records, when written later:**
  - Use the step form.
  - The step that appended the three rows is `102a7e99e8~1` -> `102a7e99e8`: `2026-10-09.1` on both sides, 43 -> 46, `4ffde4e8...` -> `65c9d2df...`. The revision label did not change, as with `browser.workspace.reset`.
  - `5375bfd2a7` (DL-300's landing) only relabeled the registry to `2026-11-04.1` (`443ae71d...`) and added no family. A record naming `2026-10-09.1@43` -> `2026-11-04.1@46` would pair two states that are not one commit's before and after. Which pair is the truthful step is the record writer's to state and the reviewers' to verify.
  - The same step (`102a7e99e8`) also changed eleven existing Goal rows (their application-scope editions). The check does not examine that, before or after this change. The records should say so in their notes.
- **Reviews.** Sol 6.1 max, then Astra max, before landing and right after, as DL-412 and DL-400 require.
- **The seal.** It is not applied here. The author and the lander are barred from applying it.

## Open items

- The two DL-413 test files' `.gitignore` lines (`66af5d0d67`) must be on `main` before the test patch can be committed.
- `lander_task` is filled at landing (see Landing notes).
- The three DL-300 families' records wait for 12 of 12. Today the families pass 4 of 12 and need DL-411's permission work.

## Evidence

`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL/`, with its own `SHA256SUMS`. It holds:
- the validator diff;
- the scripts: the change applier, receipt writer, scenario harness, comparison, test-tree builder and mutation check;
- every run's summary and the check's output receipt for each scenario, and the field-by-field comparison;
- the test patch and the full patched test file;
- the test logs and the mutation results;
- copies of this record, the branch report and the receipt.
