# DL-077: the seal check's post-August admission amendment, with the three admission records, 2026-09-24

DL-077 (Jared, 2026-09-24, card `EA-S10-VALIDATOR-LIVE-SET-001` item 1, option A) authorizes one more receipted change to the frozen independent seal check (`Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py`), the second after DL-039's holding-bucket change. The check still requires the registered families beyond the original 37 to be exactly the two August families. Now a later family counts only through a complete admission record, and everything else fails closed. This branch makes that change, writes its receipt, and writes the admission records for the three families admitted since August.

**Barred from the seal.** The author and lander of this change is the agent task `claude-opus-5.5:dl039-steps-8-9-20260924`. The receipt names it as the task that must never apply the seal.

## What changes

| File | Change |
|---|---|
| The seal check (CRLF kept on every line) | SHA-256 `bd54afff...` (the Step 3 bytes) -> `190a86f23e06362bdb98e27eb23268c9691db46cc41bc9f97e1fbb6bde1abc20`, after the review's repairs (it was `f3289d49...` at `59037bc032`). Functions `decision_section_bytes`, `post_august_receipt_state`, `holding_validator_pin`, `admission_record_problems` and `validate_post_august_admissions`. The live-set rule excludes only completely recorded families. A completely recorded family's old ledger row no longer counts toward the owner-veto, evidence-gap, unresolved or quarantine blocking checks or registered depth, while every other row check still applies; its depth comes from the pinned assessment. `post_august_admission_incomplete` blocks depth and overall pass. The check's own receipt pins this change's receipt. |
| `INDEPENDENT_EA_VALIDATOR_SPEC.md` | A DL-077 section, as Step 3 added one for the holding bucket. |
| `INDIVIDUAL_DISPOSITION_SCHEMA.md` | A note: DL-077 adds no bucket and no row field; a completely recorded family takes its depth from its record's pinned assessment and leaves only the owner-veto, evidence-gap, unresolved and quarantine blocking checks and registered depth. |
| `reports/event-authority-20260911/step-10-post-august-admission-receipt.json` | The change receipt. It binds the live DL-077 section (`b93a7d76...`), the Step 3 validator pin it chains from, the new validator bytes, the record contract, and the barred author/lander task. `seal_authorized`, `admission_authorized` and `contract_depth_complete` are false. SHA-256 `dceb7f21436cbe126c23822e62caa1b6dedcb45fefae3005c1804576ca34d827`, regenerated after each repair that changed the validator. |
| `reports/event-authority-20260911/admission-records/` | One record for each of the three families (below). |
| `tests/test_event_authority_holding_bucket.py` | The existing test file. It gains one holding-chain test and the `PostAugustAdmissionTests` class: the reviewer's 33-test file (review V-04, including three tests that run `main()`), plus one test for the receipt pin (V-08). 34 tests in all. |

A complete record, as the receipt's record contract defines it, has:
- Jared's decision entry for the family, with the SHA-256 of its prose section. The entry must name the family's exact event type and cannot be DL-077 or DL-078 (review V-01);
- the registry revision, SHA-256 and family count before and after the family's admission, with exactly one more family;
- the SHA-256 of the live registry row;
- the SHA-256 of the receipt it was written under (review V-08);
- a depth assessment under `reports/`, pinned by SHA-256. The family's row must carry the live registry row's `family_id` and `family_revision` (review V-02), all twelve criteria must be at PASS, and each PASS must carry at least one evidence item under `Plans/` (review V-03).

For a Step 9 registration, the decision entry is the DL-078 landing entry that names the family.

**Currentness rule (review V-10, ruled by the coordinator on 2026-09-24).** "Current" is tied to the live registry per family, not per assessment. A record's assessment row is current when its `family_id` and `family_revision` equal the live registry row, which the V-02 repair enforces. Whole-assessment equality with the live registry is not required, because it would force re-grading every family at every registration. The spec's DL-077 section states the same rule.

## The three admission records

All three pin the Step 8(a) depth assessment `reports/event-authority-20260911/step-08-depth42-assessment-20260924.json` at SHA-256 `ba9b84f99e0e0761a8b435a16602d4c88d14589ef273f789fd5b92bdbd5849fd`, the version after that branch's review cycle 2 repairs; they first pinned `ff7dbd59...`. That file has been on `main` since `3ce6eb882c` (landed with record `38b8c1301d`). If it changes before this branch lands, the records are re-pinned first. Each record also pins the final receipt (`dceb7f21...`), and the Browser records cite their admission landing records (review V-06).

| Family | Decision entry | Registry before -> after | Criteria not passing in the assessment |
|---|---|---|---|
| `context.compaction.completed` | DL-040 | `2026-08-27.1` (39, `b7e124a9...`) -> `2026-09-11.1` (40, `80d9caae...`) | oracles |
| `browser.workspace.created` | DL-046 | `2026-09-11.1` (40) -> `2026-09-11.2` (41, `e0a368e8...`) | producer, consumers, oracles |
| `browser.workspace.reset` | DL-046 | `2026-09-11.2` (41) -> `2026-09-11.2` (42, `6522979e...`) | producer |

The reset admission did not change the revision label. The SHA-256 values tell the 41-family and 42-family registries apart, and the record says so. No record claims a criterion passing that the assessment does not show, so the amended check fails closed for all three until their gaps close:
- compaction's oracle cell (the PM7 GUI validator);
- the Browser pair's producers (SP-286 adoption);
- created's consumer and oracle cells (Step 8(c)).

## Results, on this branch with the depth42 assessment (`ba9b84f9...`, on `main` since `3ce6eb882c`)

The branch is rebased onto `main` `38b8c1301d`, which carries that file. Without the file (before depth42 landed) the three families fail with `depth_assessment.sha256` instead of their real gaps.

| Run | Failures |
|---|---|
| `main`'s unmodified check on this tree | 5: `unexpected_august_set`, `fresh_census_denominator_not_closed`, `individual_dispositions_evidence_gap_blocking`, `individual_dispositions_provisional`, `registered_contract_depth_incomplete` |
| The amended check, with the three incomplete records | 6: the same five, plus `post_august_admission_incomplete`, naming the three families and their failing criteria |
| Counterfactual: the three assessment rows set to twelve PASS and the records re-pinned (harness only, never committed) | 3: `fresh_census_denominator_not_closed`, `individual_dispositions_provisional`, `registered_contract_depth_incomplete` (the August families) |

The counterfactual shows what the amendment does and does not do. With complete records, `unexpected_august_set`, `post_august_admission_incomplete` and the compaction row's evidence-gap block clear. The census denominator, the provisional August rows and the August families' depth stay failing, because the amendment does not touch them. The runs go through a harness that loads the check from its own path, points `REPO` at a scratch copy of the reports it reads, and writes its receipt there, so the tracked receipt `receipts/event_authority_validator_receipt.json` is unchanged. With the repairs, the probes the review describes for V-01, V-02 and V-03 fail closed with `decision_ref_not_for_family`, `depth_assessment.family_revision` and `depth_pass_without_plans_evidence`.

## Other checks

- **Tests.** `test_event_authority_holding_bucket`: 34 tests, OK. `test_pm_emit_only_event_boundaries`: OK. `test_pm_pnc019_currentness`: 1 failure, the `Plans/Decision_Log.md` currentness drift that `main` has had since DL-077 and DL-078 landed. It waits for the wave's reseal and is not caused by this branch.
- **Currentness.** The currentness inventory does not list the seal check, and its only drifted source is `Plans/Decision_Log.md`, as on `main`.
- **Scope.** No sharded Plans document, shard, index, registry row, ledger, cohort pin, freeze digest, closure hash or historical validator receipt changes. The only Plans files changed are the validator and the two `Plans/.audits` documents above.

## Evidence

`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-10-post-august-amendment-20260924/`. That directory was rewritten in place at 23:15 when the records were re-pinned (review V-11). The `SHA256SUMS` cited at `59037bc032` (`f8d6d081...`) was superseded in place by `2cbfed75a4fde219765de0e2d75e1cf53cef1d7280d8587d22b8ce86f93ff35c` (16 files, cited at `5cd53e7bc2`), which verifies. From now on an evidence directory is never rewritten: this repair round's runs are in the new dated subdirectory `cycle2-20260924T2343Z/`, with its own `SHA256SUMS`. The top level holds:
- the validator diff and the three harness runs;
- the test logs and the currentness output;
- copies of the receipt and the records;
- the writer, harness and amendment scripts.

The repair round's subdirectory `cycle2-20260924T2343Z/`, whose `SHA256SUMS` has SHA-256 `41adfb4331789fa383867aa1272dec1b27c6e9d6bf5abda673f54e05cefef63c` and lists 25 files, holds:
- the validator diff against `main`;
- the live and counterfactual harness runs, and `main`'s unmodified check at the rebased base;
- the three test logs;
- copies of the final receipt and records;
- the writer, harness and replacement scripts, with the exact repair snippets.

## Landing notes (review V-07, ruled by the coordinator)

- **Order.** This branch lands after the depth42 branch, whose assessment the records pin. That branch is on `main` at `38b8c1301d`, with the assessment at `ba9b84f99e0e0761a8b435a16602d4c88d14589ef273f789fd5b92bdbd5849fd`. If those bytes change before this branch lands, the three records are re-pinned first.
- **Lander.** The receipt pins `lander_task` to this task, `claude-opus-5.5:dl039-steps-8-9-20260924`, so this task lands it. If another agent had to land it, stop and ask: correcting `lander_task` would take another validator edit, which DL-077 does not allow.
- **Re-pin rule after landing.** The records pin the three live registry rows, the DL-040 and DL-046 prose sections, the depth assessment bytes and the receipt. The receipt pins the DL-077 prose section and the validator bytes. Any later change to one of them re-pins the affected records in the same landing: a changed receipt means rewriting all three records. Without that, the check fails closed.
- **Step 9 registrations.** Every registration landing under DL-078 adds its family's record in the same landing.
- **The seal.** It is not applied here. DL-077 bars this task from applying it.

## Open items

- **The test file has no `.gitignore` line (review V-09).** `tests/test_event_authority_holding_bucket.py` is tracked but matches `/tests/*` and has no `!` line of its own. That goes against the rule that `.gitignore` names each tracked test file. The gap predates this branch: Step 3 created the file. This branch does not edit `.gitignore`. The coordinator is asking Jared for the line `!/tests/test_event_authority_holding_bucket.py`.
