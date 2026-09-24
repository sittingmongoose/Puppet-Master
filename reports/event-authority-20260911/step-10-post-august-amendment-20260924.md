# DL-077: the seal check's post-August admission amendment, with the three admission records, 2026-09-24

DL-077 (Jared, 2026-09-24, card `EA-S10-VALIDATOR-LIVE-SET-001` item 1, option A) authorizes one more receipted change to the frozen independent seal check (`Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py`), the second after DL-039's holding-bucket change. The check still requires the registered families beyond the original 37 to be exactly the two August families. Now a later family counts only through a complete admission record, and everything else fails closed. This branch makes that change, writes its receipt, and writes the admission records for the three families admitted since August.

**Barred from the seal.** The author and lander of this change is the agent task `claude-opus-5.5:dl039-steps-8-9-20260924`. The receipt names it as the task that must never apply the seal.

## What changes

| File | Change |
|---|---|
| The seal check (CRLF kept on every line) | SHA-256 `bd54afff...` (the Step 3 bytes) -> `f3289d49d053784e209a9f7376d0cfa7c538deae2fb7416db4f85095c76988d4`. Functions `decision_section_bytes`, `post_august_receipt_state`, `holding_validator_pin`, `admission_record_problems` and `validate_post_august_admissions`. The live-set rule excludes only completely recorded families. A completely recorded family's old quarantine ledger row no longer counts as blocking, and its depth comes from the pinned assessment. `post_august_admission_incomplete` blocks depth and overall pass. The check's own receipt pins this change's receipt. |
| `INDEPENDENT_EA_VALIDATOR_SPEC.md` | A DL-077 section, as Step 3 added one for the holding bucket. |
| `INDIVIDUAL_DISPOSITION_SCHEMA.md` | A note: DL-077 adds no bucket and no row field, and a completely recorded family is judged by its record. |
| `reports/event-authority-20260911/step-10-post-august-admission-receipt.json` | The change receipt. It binds the live DL-077 section (`b93a7d76...`), the Step 3 validator pin it chains from, the new validator bytes, the record contract, and the barred author/lander task. `seal_authorized`, `admission_authorized` and `contract_depth_complete` are false. SHA-256 `10cde310a1e7a0cf9f571ab4c338d62b03e5e917e7bee21be9841a49c1aa41ca`. |
| `reports/event-authority-20260911/admission-records/` | One record for each of the three families (below). |
| `tests/test_event_authority_holding_bucket.py` | The existing named test file. It gains one holding-chain test and the `PostAugustAdmissionTests` class, covering missing, stale, forged and incomplete records, a registry that does not grow by exactly one family, changed rows and decision entries, misnamed files, unrecorded new registrations, an invalid receipt and changed DL-077 text. 24 tests in all. |

A complete record, as the receipt's record contract defines it, has:
- Jared's decision entry for the family, with the SHA-256 of its prose section;
- the registry revision, SHA-256 and family count before and after the family's admission, with exactly one more family;
- the SHA-256 of the live registry row;
- a depth assessment under `reports/`, pinned by SHA-256, whose row for the family has all twelve criteria at PASS.

For a Step 9 registration, the decision entry is the DL-078 landing entry that names the family.

**Currentness rule (review V-10, ruled by the coordinator on 2026-09-24).** "Current" is tied to the live registry per family, not per assessment. A record's assessment row is current when its `family_id` and `family_revision` equal the live registry row, which the V-02 repair enforces. Whole-assessment equality with the live registry is not required, because it would force re-grading every family at every registration. The spec's DL-077 section states the same rule.

## The three admission records

All three pin the Step 8(a) depth assessment `reports/event-authority-20260911/step-08-depth42-assessment-20260924.json` at SHA-256 `ba9b84f99e0e0761a8b435a16602d4c88d14589ef273f789fd5b92bdbd5849fd`, the version after that branch's review cycle 2 repairs; they first pinned `ff7dbd59...`. That file is on `plans/ea-step08-depth42-20260924` and lands before this branch. If it changes again, the records are re-pinned before this branch lands.

| Family | Decision entry | Registry before -> after | Criteria not passing in the assessment |
|---|---|---|---|
| `context.compaction.completed` | DL-040 | `2026-08-27.1` (39, `b7e124a9...`) -> `2026-09-11.1` (40, `80d9caae...`) | oracles |
| `browser.workspace.created` | DL-046 | `2026-09-11.1` (40) -> `2026-09-11.2` (41, `e0a368e8...`) | producer, consumers, oracles |
| `browser.workspace.reset` | DL-046 | `2026-09-11.2` (41) -> `2026-09-11.2` (42, `6522979e...`) | producer |

The reset admission did not change the revision label. The SHA-256 values tell the 41-family and 42-family registries apart, and the record says so. No record claims a criterion passing that the assessment does not show, so the amended check fails closed for all three until their gaps close:
- compaction's oracle cell (the PM7 GUI validator);
- the Browser pair's producers (SP-286 adoption);
- created's consumer and oracle cells (Step 8(c)).

## Results, on this branch (base `main` `ac9c0ad2e4`)

| Run | Failures |
|---|---|
| `main`'s unmodified check on this tree | 5: `unexpected_august_set`, `fresh_census_denominator_not_closed`, `individual_dispositions_evidence_gap_blocking`, `individual_dispositions_provisional`, `registered_contract_depth_incomplete` |
| The amended check, with the three incomplete records | 6: the same five, plus `post_august_admission_incomplete`, naming the three families and their failing criteria |
| Counterfactual: the three assessment rows set to twelve PASS and the records re-pinned (harness only, never committed) | 3: `fresh_census_denominator_not_closed`, `individual_dispositions_provisional`, `registered_contract_depth_incomplete` (the August families) |

The counterfactual shows what the amendment does and does not do. With complete records, `unexpected_august_set`, `post_august_admission_incomplete` and the compaction row's evidence-gap block clear. The census denominator, the provisional August rows and the August families' depth stay failing, because the amendment does not touch them. The runs go through a harness that loads the check from its own path and redirects only its receipt output, so the tracked receipt `receipts/event_authority_validator_receipt.json` is unchanged.

## Other checks

- **Tests.** `test_event_authority_holding_bucket`: 24 tests, OK. `test_pm_emit_only_event_boundaries`: OK. `test_pm_pnc019_currentness`: 1 failure, the `Plans/Decision_Log.md` currentness drift that `main` has had since DL-077 and DL-078 landed. It waits for the wave's reseal and is not caused by this branch.
- **Currentness.** The currentness inventory does not list the seal check, and its only drifted source is `Plans/Decision_Log.md`, as on `main`.
- **Scope.** No Plans document, shard, index, registry row, ledger, cohort pin, freeze digest, closure hash or historical validator receipt changes.

## Evidence

`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-10-post-august-amendment-20260924/`, `SHA256SUMS` SHA-256 `2cbfed75a4fde219765de0e2d75e1cf53cef1d7280d8587d22b8ce86f93ff35c` (16 files). It holds:
- the validator diff and the three harness runs;
- the test logs and the currentness output;
- copies of the receipt and the records;
- the writer, harness and amendment scripts.

## Landing notes

- This branch lands after the depth42 branch, whose assessment the records pin.
- The seal is not applied here. DL-077 bars this task from applying it.
