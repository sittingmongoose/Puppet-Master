# DL-412: the seal check's third recorded change, truthful multi-family registry steps, 2026-11-04

**Current status, CA-SEAL-FIX7: C6-01 repaired in `5c44eaf593704fce8bf6a213b8e64ddbb32297eb`; verification is recorded below.** Landing still requires the final lander receipt and the exact DL-412-only Spec Lock entry from claude-projects-refresh in the same landing. FIX6’s stop and earlier results below are historical.

DL-412 (Jared, 2026-11-04, card E-CARDS-1 item 4c, option B) approves a third recorded change to the frozen independent seal check (`Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py`), after DL-039's holding-bucket change and DL-077's post-August admission change. Jared's verbatim answer was "approve all except 4c B". The approved option reads: "a third recorded change to the frozen check, so it accepts a truthful step that added several families at once. Each family still needs its own record. DL-077 allowed exactly one more change, so this needs your new approval."

pm7-build relayed this reading with the answer (not Jared's words): 4c B was pm7-build's suggestion, not the stream E recommendation. Make the change openly, with the same before and after reviews, and record what it does and does not relax. No other change to that check is approved.

This branch makes that change and writes its receipt. It writes no admission record. The records for the three DL-300 families come later, once each family's contract reaches 12 of 12.

**Barred from the seal.** The author (CA-SEAL, `claude-opus-5.5:ea-ca-seal-20261104`), the actual lander, CA-SEAL-FIX1 (`claude-opus-5.5:ea-ca-seal-fix1-20261104`), CA-SEAL-FIX2, CA-SEAL-FIX3, CA-SEAL-FIX4, CA-SEAL-FIX5 (Codex), CA-SEAL-FIX6 (Codex), CA-SEAL-FIX7 (Codex), the stream lead `claude-opus-5.5:pm-ea-lead` (session `b29da1b5-9877-474f-8a4c-e7a57ab7f899`, responsible for `616345d688`), and every other fix worker are procedurally excluded from applying the seal. The validator still checks exactly the author and lander in its receipt list; the complete exclusion is a procedural obligation.

**Approving entry.** DL-412 is on `plans/ea-cards1-answers-20261104` at `b6332f391a`, not yet on `main`. Its prose section (`### DL-412:`) has SHA-256 `95375f1997a193d58a3d02c82a46892e324ac0dd1cfbbc2b69efc212ae932927`, and the receipt pins that value.

## Current FIX7 ruling and landing contract

CA-SEAL-FIX7 implements pm7-build's 2026-11-05 ruling, mail `1105012742-e2fc`, within the approved card 4c B / DL-412 change. It supersedes FIX6's stopped proposal, including the proposed DL-077 anchor. **Only the DL-412 receipt gets a new Spec Lock entry.** DL-077 keeps its existing admission-record pins and gets no new anchor.

The August trust model anchors the DL-077 receipt only through existing record pins. The new DL-412 receipt has none until the DL-300 step records land. The reseal therefore supplies its byte anchor in `Plans/Spec_Lock.json`, `canonical_ssot_hashes.files`, at the same landing as this change. This worker does not edit that file.

Outside DL-077's unchanged predicate, the bridge presents the trusted DL-077 after-hash only when all three byte conditions hold:

1. The live validator SHA-256 equals DL-412's `validator_after_sha256`.
2. Exactly one Spec Lock entry has path `reports/event-authority-20261104/seal-check-multifamily-step-receipt.json`, and its `sha256` equals SHA-256 of that receipt's complete bytes. Missing, wrong-hash, duplicate and elsewhere-path entries fail closed.
3. DL-412's `validator_before_sha256` equals DL-077's `validator_after_sha256`.

Otherwise the original predicate receives the live hash, emits its original mismatch diagnostic and returns its original null old receipt pin. Legacy admission and holding both fail closed. DL-412's full authority/identity/lander/prior-byte semantic predicate remains separate and affects only the new pin and step records. A fixture with a matching trusted anchor can therefore isolate an unrelated semantic fault without changing C4's old judgments. Changing receipt bytes under an unchanged anchor is an integrity fault even if those bytes are semantically valid. A non-null new semantic pin alone does not authorize legacy admission or holding.

**Preserved history:** no August list, August fingerprint, freeze digest, earlier receipt or existing record moved. The sole new-receipt edit is its `validator_after_sha256`; every other field, pin, null lander, author/list and false flag stays byte-for-byte as before. The old receipt predicate, its diagnostic order and its return pin remain unchanged. The existing receipt's FIX5 descriptive wording is supplemented by this explicit anchor requirement; it is not rewritten.

**Detection boundary:** with trusted Spec Lock bytes and this enforcing code intact, the bridge detects modified executable/receipt bytes, invented matching receipt links, absent/ambiguous anchors and broken before-links. It does not authenticate Git history, independently prove historical registry states or inspect same-step edits of existing rows. It cannot detect an actor rewriting both the trusted anchor and the receipt/executable together, or removing the enforcing code. Git history and independent procedural review remain necessary.

**Landing order, assembled as one landing with no unanchored interval on main:**

1. DL-412 is on main; DL-413's named test allowance must also be present before the fixture patch is committed.
2. The actual lander runs `python3 -I write_multifamily_receipt.py <landing-tree> --lander <actual-lander-task>`. This fills `lander_task` and its matching checked list and pins the actual validator and DL-412 section on that tree.
3. The reseal worker, **claude-projects-refresh**, adds exactly the entry below for SHA-256 of the final receipt bytes from step 2, in the same landing that lands this change. It adds no DL-077 entry.
4. Apply the supplied fixture patch as its own commit in that same landing. Its synthetic trees include a matching fixture Spec Lock; deliberate anchor/forgery controls retain or corrupt that fixture anchor explicitly.
5. Land the validator, final receipt, exact reseal entry and separate fixture commit together, with the required Sol/Astra reviews before and after. **Until that entry exists, legacy admission and holding fail closed on this tree; this is why they must land together.** No seal, admission or landing is performed by this worker.

Exact entry template for `canonical_ssot_hashes.files` (the reseal computes the SHA from the final receipt at landing; the pending receipt digest is not a substitute):

```json
{
  "path": "reports/event-authority-20261104/seal-check-multifamily-step-receipt.json",
  "sha256": "<SHA-256 of final receipt bytes after write_multifamily_receipt.py fills lander_task>"
}
```

Any later receipt rewrite needs its exact Spec Lock entry refreshed through the authorized reseal and any observing step-record pins refreshed. The procedural seal-applier exclusion includes **CA-SEAL-FIX7 (Codex)** in addition to the author, actual lander, FIX1–FIX6, the named stream lead/session and every other fix worker. The checked receipt list remains exactly author and lander.

## The rule, before and after

**Before** (DL-077, validator `190a86f2...`, line 221 of `main`'s file). A record's step must add exactly one family:

```python
if after["family_count"] != before["family_count"] + 1 or after["sha256"] == before["sha256"]:
    problems.append("registry_before_after_not_exactly_one_family")
```

So a family registered in a step that added k > 1 families had no truthful record. The three DL-300 families went from 43 to 46 together.

**After** (current validator `743ca664...`, fix round 7; round 5 was `0cb2bd07...`; round 4 was `48ab44d7...`; round 3 was `74897e17...`; fix round 2 was `fb551b06...`; fix round 1 was `e4e988b7...` and round 0 was `bad3e7e8...`):

- **A record without `registry_step_event_types`** is judged exactly as before:
  - the one-family rule above;
  - the record pinning the DL-077 receipt;
  - DL-077's decision exclusion, byte for byte (`in ("DL-077", "DL-078")`).

  No step judgment ever adds a problem to such a record, whatever step records exist (fix round 1, CA-SEAL-02).
- **A record with `registry_step_event_types`** describes a multi-family step. It is complete only if all of the following hold:
  1. The list is a sorted list of two or more distinct, non-empty event types that includes the record's own.
  2. `registry_after.family_count == registry_before.family_count + len(list)` and the two SHA-256 differ (`registry_before_after_not_exactly_step_families`).
  3. Every listed family is registered beyond Known37 and the August pair. Each has its own record carrying the identical list and the identical `registry_before` and `registry_after` (revision, SHA-256 and family count). Otherwise every record of the step fails `registry_step_partial:<names>`.
  4. On the multi-family path every record-directory entry is read strictly: duplicate keys at any depth, non-JSON constants, non-object roots, unreadable files and noncanonical registry state types or SHA-256 (including nested registry_before/registry_after claims) invalidate every step they could touch, conservatively all steps when disambiguation is impossible, naming the file. A strictly read foreign record mentioning either step SHA anywhere in keys or values, including nested containers and normalized Unicode/case/whitespace/numeric text, fails that step. Only a listed member's own strictly read matching record is exempt. Rejected-file claimants count. A no-field record keeps exactly its own DL-077 judgment.
  5. Every listed family's record is complete on its own (`registry_step_member_incomplete:<families>`). A step counts only as a whole.
  6. The record pins the SHA-256 of the DL-412 receipt (`implementation_receipt_sha256`), the receipt it is written under.
  7. Every DL-077 rule still applies to the record itself:
     - `schema_id` and `family_id`;
     - its own decision entry, which names its exact event type (DL-077 and DL-078 cannot be cited, and a step record cannot cite DL-412 either);
     - its live registry row SHA-256;
     - its own depth assessment row at the live `family_id` and `family_revision`, with all twelve criteria PASS and Plans/ evidence for each PASS.

Code (current symbols; earlier round-specific line numbers below are historical):
- `registry_step_shape_ok`, `registry_step_states`, `strict_step_record`, `registry_step_record_scan`, `registry_step_claim` and `registry_step_problems`;
- `admission_record_problems` retains the DL-077 legacy branch and adds exact SHA string typing only when the step field is present;
- `validate_post_august_admissions` preserves its legacy file reader and adds the strict directory scan only when a step record is present.

The two-pass judgment rates every record on its own, then the records of each multi-family step together. Step problems go only to records that list a step. If the step judgment itself raised, every step record would be reported malformed. With no record carrying the field and a valid receipt chain, its admission output and issue order are identical to DL-077's. Given a valid receipt chain, a record without the field gets the same problems and admission as under DL-077, whatever other records exist. The full old-versus-new differential below checks both.

## What it relaxes

Exactly one thing: a family registered by a registry step that added several families at once can now have a complete admission record, whose before and after are that step's true states. Nothing else that failed before passes now. The counterfactual runs below show it.

## What it does not relax

- **No family without a record.** Every family registered beyond Known37 and the August pair still needs its own record file. Without one it fails with "no admission record", `post_august_admission_incomplete` and `unexpected_august_set`. A step record admits only its own family.
- **No partial step.** If one listed family lacks a record, names a different step or list, or is incomplete on its own, every record of that step fails. A strict directory scan fails every potentially affected step on an unreadable, ambiguous or noncanonical file, naming that file; any foreign mention of either step digest anywhere in structure also fails the step.
- **No depth waiver.** Each record pins its own assessment row, all twelve criteria PASS, each PASS with evidence under `Plans/`.
- **No decision waiver.** Each record cites Jared's decision entry for its family, naming its exact event type. DL-077 and DL-078 cannot be cited, as before. A step record cannot cite DL-412 either. A record without the field keeps DL-077's rule unchanged, so for it DL-412 is an ordinary entry.
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
  - Spec Lock on this worker branch, `.evidence`, `.gitignore` and `auto_decisions.jsonl`. The separately authorized reseal adds only the new DL-412 receipt entry at landing.
- **Not stronger on truthfulness than before.** The check reads only the records and the live registry. Whether the pinned before and after SHA-256 are the real registry bytes of that step is the record writer's claim, verified by review against git history. That is unchanged from one-family records.
- **Same-step row edits are not examined.** Edits to existing rows made in the same registry step are not examined, before or after this change.

## What changes

| File | Change |
|---|---|
| The seal check (CRLF kept on every line) | Frozen validator `190a86f23e06362bdb98e27eb23268c9691db46cc41bc9f97e1fbb6bde1abc20` → current `743ca664bf8bff3482185c76c01345b6b4d30178b5c9574978868592da5f3dc6`. The DL-412 receipt bridge, optional step branch, strict directory loader and recursive fail-closed claim analysis are the complete change. Existing output receipt behavior changes only by the new DL-412 input pin. |
| `INDEPENDENT_EA_VALIDATOR_SPEC.md` | A DL-412 section after the DL-077 section, as DL-077 added one after Step 3's. |
| `INDIVIDUAL_DISPOSITION_SCHEMA.md` | A note: DL-412 adds no bucket and no row field. A family accepted through a step record is treated exactly like one accepted through a one-family record. |
| `reports/event-authority-20261104/seal-check-multifamily-step-receipt.json` | The change receipt, detailed below. |

The current pending receipt has SHA-256 `713ae2743ebb3a02d7500cd23c136e914d1ae0adc5f9cb5ebd8ef6d110c7d855` (FIX5 was `ee9ce3a023d9cc35111e5cd209ea511f2f572307fff876524c6c6e584f66ed9a`) (fix round 4 was `bcdbc6f6...`; fix round 3 was `b1b3e8cb...`) (fix round 2 was `bd04156a...`) (`6c749a74...` in fix round 1; `afef45e2...` at round 0). Fix round 5 refreshes only its `validator_after_sha256` pin and aligns descriptive `prior_receipt.note`, `changes` and `notes` text. Every other pin, identity field and flag is unchanged. It binds:
- the DL-412 section (`95375f19...`, as pushed at `b6332f391a`);
- Jared's answer file (`00bb608e...`) and the cards as presented (`578a6774...`);
- the DL-077 receipt's exact bytes (`prior_receipt.sha256` `dceb7f21...`, checked by the code);
- validator before `190a86f2...` and after `743ca664...`;
- the record directory and schema;
- the author, and `seal_applier_forbidden_tasks`, which must equal the sorted author and lander;
- `seal_authorized`, `admission_authorized` and `contract_depth_complete`, all false.

**New input-pin integrity.** Missing or altered DL-412 byte-chain input, a broken before/after hash link, or altered executable bytes must reject legacy admission and holding through DL-077's unchanged failure predicate. These integrity rejections are the intended effect of the single new input pin, as clarified by Jared for FIX5. They are reported separately from legacy parity with intact byte links. No unrelated DL-412 semantic predicate may cause such a rejection. Semantic-fault fixtures supply a matching synthetic receipt anchor so they isolate semantics rather than an additional byte-anchor fault. The 125-call trace and twelve C4 controls supply the exact matching anchor and valid byte chain and remain exact.

It also states what the change relaxes and what it does not. `lander_task` is `null` as committed, so multi-family step records fail closed on this receipt until the lander fills it. Legacy-only admission and holding keep their DL-077 judgment only with the exact matching Spec Lock receipt anchor; without it both fail closed. S6 below is a historical fixture result, reproduced in FIX7 with a matching synthetic anchor.

### Every place that pins the validator's bytes

| Pin | Before | After |
|---|---|---|
| Step 3 receipt `validator_after_sha256` (`step-03-holding-bucket-receipt.json`) | `bd54afff...` | unchanged. The holding check still reaches it only through the DL-077 receipt's `validator_before_sha256`. |
| DL-077 receipt `validator_before/after_sha256` (`step-10-post-august-admission-receipt.json`) | `bd54afff...` -> `190a86f2...` | unchanged (file untouched). Its `after` is compared at the original predicate position to the frozen DL-077 hash only after both live-byte links and the exact Spec Lock receipt anchor verify; otherwise it is compared to the live hash and fails as before for changed bytes. No full DL-412 semantic predicate runs there. |
| DL-412 receipt `validator_before/after_sha256` (new) | none | `190a86f2...` -> `743ca664bf8bff3482185c76c01345b6b4d30178b5c9574978868592da5f3dc6`, checked against the current file |
| Chain code in the check | `post_august_receipt_state`: DL-077 `after` == current file | `post_august_validator_pin()` reads the live validator SHA-256 on every call. Only live == DL-412 `after`, an exact unique Spec Lock entry matching the complete DL-412 receipt bytes, and DL-412 `before` == DL-077 `after` permit presenting the frozen DL-077 hash to its original predicate. Any broken/missing/unreadable byte link or missing/incorrect/ambiguous receipt anchor presents the live hash, preserving its original failure. No full new receipt semantic predicate runs inside the old one. Separately, step records require `multi_family_receipt_state`: DL-412 `before` == DL-077 `after`, prior-byte pin == DL-077 bytes, and DL-412 `after` == current file, with every new authority/identity check intact. |
| The check's output receipt `input_pins` | holding receipt, DL-077 receipt | plus `multi_family_step_receipt_sha256` |
| `tests/test_event_authority_holding_bucket.py` fixtures | copy the Step 3 and DL-077 receipts | all fixtures copy the DL-412 receipt and install its exact synthetic Spec Lock entry to supply the byte chain; only step fixtures require its full semantic validity. External patch, not committed here. |

The pre-FIX7 anchor inventory found no script, Spec Lock entry, `.evidence` file, readiness artifact or currentness edition pinning the validator’s bytes. FIX7 now requires the new DL-412-only entry described above; the reseal supplies it at landing. Historical search evidence:
- the frozen DL-077 hash remains in its receipt and historical reports; the byte-chain bridge and new DL-412 receipt also pin it, without editing any earlier pin;
- `Plans/Spec_Lock.json` does not name the directory;
- the 2026-08-13 currentness edition does not list it.

The reports that cite `190a86f2...` as history keep their text:
- `step-10-post-august-amendment-20260924.md`;
- `step-09-coord-registered-20260925.md`;
- `LANDING_20260924_EA_VALIDATOR_AMENDMENT.md`.

## Scenario contract: the check before and after (earlier runs historical except S5 updated for FIX5)

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
| S3 `origin/main`, no DL-412, receipt | changed | coordination.agent_registered | Same legacy judgment and six failures as the corresponding old run; DL-412 authority invalid; new input pin null. There is no step record in this scenario. |
| S5 +DL, no DL-412 receipt | changed | none | New input-pin integrity rejection: original DL-077 hash-mismatch message; holding invalid; DL-077 and DL-412 returned receipt pins null. There is no step record in this scenario. |
| S6 +DL, committed receipt (`lander_task` null) | changed | coordination.agent_registered | Same legacy judgment and six failures as the corresponding old run; DL-412 lander invalid; new input pin null. There is no step record in this scenario. |
| C1 DL-300 one-family form | unchanged | coordination.agent_registered | 6; the three fail `registry_before_after_not_exactly_one_family` |
| C2 DL-300 one-family form | changed | same | identical to C1 except the new input pin: the one-family rule is unchanged |
| C3 DL-300 step form | unchanged | coordination.agent_registered | 6; the three fail `implementation_receipt_sha256` and `registry_before_after_not_exactly_one_family` |
| C4 DL-300 step form | **changed** | **coordination.agent_registered, approval.chat_tool_requested, approval.chat_tool_resolved, settings.layer.changed** | 6; the three leave `post_august_admission_incomplete` and `unexpected_august_set` |
| C5 DL-300 step form, `settings.layer.changed` at 11 of 12 | changed | coordination.agent_registered | 6; `settings.layer.changed: depth_incomplete:producer` and both others `registry_step_member_incomplete:settings.layer.changed` |

Field-by-field diffs of the check's output receipts, ignoring `generated_at_utc`:
- **S1 vs S2:** only `holding_authority_source_sha256` differs, because the Decision Log is a different file.
- **S2 vs S4:** only `multi_family_step_receipt_sha256` differs (absent -> `b5dd94e8...`, the harness receipt with its lander filled).
- **S4 vs S7:** identical.
- **C1 vs C2:** only that pin differs.
- **C3 vs C4:** besides that pin, only the three families' admission differs: `post_august_admitted`, the `post_august_admission_incomplete` issues (9 -> 3) and the `unexpected_august_set` list.

**Fix round 1 rerun.** All twelve runs were repeated on the fixed check from the branch base `5e37ffb616`. The check's inputs are identical at today's `origin/main` `16acf7594a`. Every output receipt is field-for-field identical to the reviewed head's run, except one pin: `multi_family_step_receipt_sha256` (`5b0c9753...` -> `b5dd94e8...`) in S4, S7, C2, C4 and C5, because the receipt bytes changed. S1, S2, S3, S5, S6, C1 and C3 are identical with no exception.

The seal stays failing in C4 for reasons this change does not touch:
- the census denominator;
- the provisional August rows;
- the August families' depth;
- the compaction and Browser records' depth gaps.

## Tests from fix round 1

`tests/test_event_authority_holding_bucket.py` is tracked but not named in `.gitignore` on `main`, so this branch may not edit it. DL-413 (Card 5) approves its `.gitignore` line. That line is the one commit on `plans/ea-gitignore-ea-tests-20261104` (`66af5d0d67`), not yet on `main`. The test change is therefore delivered as a patch, `test_event_authority_holding_bucket.dl412.patch`, in the evidence folder (fix round 1: SHA-256 `fbe7bcd61b42287d3dc46eb7e15a4f8041e40fd4e5f5ffdf91c20d1acdb9f8b6`, +478/-13, applies cleanly to this branch and to `main`; the reviewed head's patch was `679a095f...`, +301/-13). It goes in as a separate commit in the same landing as the validator, after the `.gitignore` line is on `main`.

The round-1 patch did five things (round 4 supersedes its receipt-chain expectation):
- Both fixtures copy the DL-412 receipt (FIX7 additionally supplies their synthetic Spec Lock anchor).
- `PostAugustAdmissionTests` records the three DL-300 families as one multi-family step: fixture states 43 -> 46, a fixture-only decision entry `DL-999` naming them, and the families in a separate `RECORDED` list. `POST` is unchanged, so `test_pm_coordination_events`'s check that `POST[3:]` equals the admitted coordination rows still holds.
- `HoldingBucketTests` gains `test_holding_pin_follows_the_dl412_receipt_chain`.
- A new `MultiFamilyStepTests` class adds 22 tests. Fix round 1 replaced one of the original 17 and added five; they are listed below.
- All 34 existing test methods remain. Four of them have their fixture expectations extended: their expected sets and iteration move from `POST` to `RECORDED`, so they also cover the three step members. No protection of older records is weakened.

| Run | Result |
|---|---|
| Patched file, integration tree (this branch + DL-412's Decision Log + receipt with lander) | 57 tests, OK, exit 0. This includes the two tests that fail on `main` today because the three DL-300 families had no records. |
| Patched file against the reviewed head's check (`bad3e7e8...`, receipt re-pinned) | 24 failures, exit 1: every malformed and misnamed claimant case, the legacy decision differential, the legacy cross-record differential and the `main()` X1 case. The new tests catch both review findings. |
| Patched file, 19 mutants of the change, each with the receipt re-pinned to the mutant's bytes so only behavior tests can catch it | 19 of 19 caught. Mutants 1-12 are the original twelve. The ninth, "no one-family conflict", mutated code that fix round 1 removed. It became "one-family records are not claimants". Mutants 13-19 are new: claims read only from fully valid states (the reviewed head), misnamed files ignored, rejected files not collected, the pair compared without normalization, the DL-412 ban on the legacy path (the reviewed head), a step problem given to a legacy record (the reviewed head), and claimants limited to families beyond Known37. |
| Unpatched file, this branch as committed | 41 failure entries, exit 1. The fixtures do not copy the DL-412 receipt, so the chain fails closed in every fixture. This is the reason the patch must land with the change. |
| Unpatched file, integration tree | the same 41, same reason |
| `test_pm_coordination_events`, this branch | 14 failure entries, exit 1. That is the count Card 5 reports for `main`; `test_holding_bucket_post_august_list_follows_admitted_coordination_rows` passes. |
| `test_pm_coordination_events` with the patched holding file in place (temporary, restored) | the same 14, and the link test still passes |
| `test_pm_emit_only_event_boundaries` | 1 failure, exit 1: the registry's first-40-row digest (`2fe49c02...` vs the pinned `a27cf49b...`). That is the registry, which this branch does not touch. |
| `test_pm_pnc019_currentness` (currentness edition copied in, 15 files, hashes match the share) | 1 failure, exit 1: 22 `event_authority_currentness_source_drift` entries for Plans documents edited since the 2026-08-13 edition. None names a file this branch changes. |
| `pm-shard-plans.py --check` | exit 0, pass |
| `pm-plan-index.py validate` | exit 0, `status: pass` |
| `pm-plans-verify.py lint-path-refs` (round 0, full checkout) | exit 1: 12 `implementation_surface_missing_or_untyped` in `Plans/.plan_index/plan_units.jsonl`, which this branch does not change. None names a file of this branch. Fix round 1's sparse checkout reports 14: the same 12 plus `BPM-009` and `DL-055`, which name `.claude/CLAUDE.md`, a path that checkout leaves out (`CA-SEAL.md`). |

Negative cases the patched tests run through the changed check:
- a missing member record;
- a different before or after revision or SHA-256 on one record;
- a different list on one record;
- a step of 45, 47 or 43 families instead of 46;
- equal before and after SHA-256;
- a listed family that is unregistered, Known37 or August;
- an extra record naming the step's SHA-256 pair. In one-family form it is complete, or has these malformations:
  - a missing, empty or numeric revision;
  - a string, null, boolean or missing family count;
  - three more families;
  - an upper-case SHA-256, or one with a trailing LF;
  - a forged schema.
- the same extra record in step form:
  - a missing revision, or a string or null count;
  - an upper-case SHA-256;
  - its own two-family step;
  - a null, empty, single, unsorted, foreign, string or the step's own list;
  - a bad list together with a missing revision.
- a misnamed copy, a file without an event type, a second record of a member, a malformed misnamed copy, and a Known37 family's record, each naming the step's pair;
- eight malformed lists;
- one member at 11 of 12 (PARTIAL or ABSENT) or with a PASS lacking Plans/ evidence;
- one member citing DL-040;
- one member citing DL-412 (even when DL-412 names it);
- `main()` with a malformed extra record naming the step's pair (the review's X1).
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
- legacy decision differential (CA-SEAL-02, the review's X2): a record without the field that cites DL-412 is judged exactly like the same record citing `DL-998`. `DL-998` is a fixture entry with DL-412's body. Both have no problems, and the family is admitted. A step record citing DL-412 is barred. Records of either form citing DL-078 are barred.
- legacy cross-record differential: every family outside the step gets the same admission and issues with and without the step records present. This holds when a one-family record names the step's pair, complete or malformed.
- all 34 existing one-family tests pass.

## Landing notes

- **Order.** This branch lands after DL-412 (`plans/ea-cards1-answers-20261104`), which the receipt pins. With the exact matching Spec Lock entry, missing DL-412 affects step semantics only (S3); without the entry, legacy admission and holding also fail closed. Before landing, rebase onto the tree that carries DL-412 and run the receipt writer:

  ```
  python3 -I write_multifamily_receipt.py <worktree> --lander <lander task>
  ```

  Commit the receipt, then have claude-projects-refresh add its exact final-byte Spec Lock entry in the same landing, as ordered above. If DL-412's prose bytes changed since `b6332f391a`, the writer re-pins them in the same run.
- **The test patch.** It lands as its own commit in the same landing, after DL-413's `.gitignore` line is on `main`. It supplies the multi-family and compatibility controls; the 34-method trace with its valid DL-412 byte-chain input retains its two pre-existing failures; the unpatched suite without that input fails closed until the same-landing patch supplies it.
- **Re-pin rule.** Any later change to the validator, DL-412's prose section or the DL-077 receipt bytes requires the DL-412 receipt to be rewritten. Its exact Spec Lock entry then needs an authorized reseal refresh, and every observing step record must be rewritten. This worker changes no old receipt.
- **The DL-300 records, when written later:**
  - Use the step form.
  - The step that appended the three rows is `102a7e99e8~1` -> `102a7e99e8`: `2026-10-09.1` on both sides, 43 -> 46, `4ffde4e8...` -> `65c9d2df...`. The revision label did not change, as with `browser.workspace.reset`.
  - `5375bfd2a7` (DL-300's landing) only relabeled the registry to `2026-11-04.1` (`443ae71d...`) and added no family. A record naming `2026-10-09.1@43` -> `2026-11-04.1@46` would pair two states that are not one commit's before and after. Which pair is the truthful step is the record writer's to state and the reviewers' to verify.
  - The same step (`102a7e99e8`) also changed eleven existing Goal rows (their application-scope editions). The check does not examine that, before or after this change. The records should say so in their notes.
- **Reviews.** Sol 6.1 max, then Astra max, before landing and right after, as DL-412 and DL-400 require.
- **The seal.** It is not applied here. The author (CA-SEAL, `claude-opus-5.5:ea-ca-seal-20261104`), the actual lander, CA-SEAL-FIX1 (`claude-opus-5.5:ea-ca-seal-fix1-20261104`), CA-SEAL-FIX2, CA-SEAL-FIX3, CA-SEAL-FIX4, CA-SEAL-FIX5 (Codex), CA-SEAL-FIX6 (Codex), CA-SEAL-FIX7 (Codex), the stream lead `claude-opus-5.5:pm-ea-lead` (session `b29da1b5-9877-474f-8a4c-e7a57ab7f899`, responsible for `616345d688`), and every other fix worker are procedurally excluded from applying the seal. The receipt's checked list remains exactly the author and lander. The seal applier must enforce the remaining exclusions procedurally; this does not add a validator rule.

## Open items

- The two DL-413 test files' `.gitignore` lines (`66af5d0d67`) must be on `main` before the test patch can be committed.
- `lander_task` is filled at landing, then claude-projects-refresh adds the exact final DL-412 receipt Spec Lock entry in that same landing (see the current landing contract).
- The three DL-300 families' records wait for 12 of 12. Today the families pass 4 of 12 and need DL-411's permission work.

## Historical fix round 1 (2026-11-04): Sol review CA-SEAL-01 and CA-SEAL-02

The blind Sol review (`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL-sol/REVIEW.md`) found two blocking defects at `d67201e885`. Both are fixed in `e10fc5c840`; no other behavior of the check changed.

- **CA-SEAL-01.** The conflict check found extra records only when their whole state pair parsed. A record naming the step's SHA-256 pair escaped it if its revision, count or list was malformed, and the step's members were admitted. Now `registry_step_claim` reads the pair from the two `sha256` fields alone, and record files rejected for their name or event type are kept as claimants.
- **CA-SEAL-02.** DL-412 had been added to DL-077's barred-entry tuple for every record. The tuple is restored byte for byte, and DL-412 is barred only for step records (line 343).
- **The same boundary.** The reviewed head also gave `registry_step_partial` to a one-family record naming a step's pair, which changed how a record without the field was judged. That loop is removed: the conflict fails the step, and the one-family record keeps exactly its DL-077 judgment.

**Old-versus-new differential over every existing record.** The harness is `differential.py` in the evidence folder. It uses two trees from `5e37ffb616`, both with the DL-412 Decision Log. The old tree has the DL-077 check `190a86f2...`; the new tree has `e4e988b7...` and a receipt with its lander filled. The four live records are `browser.workspace.created`, `browser.workspace.reset`, `context.compaction.completed` and `coordination.agent_registered`. None carries the field. The harness compares:
- **A.** `admission_record_problems` on each record and on 452 mutations of it: every field absent or set to 12 values; every registry subfield absent or set to 8 values (`sha256` also upper-case, with a trailing LF and with a leading space); four family-count deltas; equal SHA-256; and `decision_ref` set to each of the Decision Log's 179 entries with its section hash.
- **B.** `validate_post_august_admissions` with each mutated record in place.
- **X2.** For each record, DL-412 text naming its family and the record citing DL-412.
- **C.** Six legacy claimants per record next to three step records naming the same pair.
- **D.** `main()` on both trees.

Result: 1,812 A comparisons, 1,808 B comparisons, 4 X2 controls and 24 C cases, with zero differences. The `main()` outputs differ only by the new `multi_family_step_receipt_sha256` pin. The harness can see both defects. Run on the reviewed head's check (`bad3e7e8...`), it reports 16 differences:
- the 4 X2 controls (`decision_ref_not_for_family`, CA-SEAL-02);
- 12 C cases, where a complete, three-more-families or forged-schema legacy record was given `registry_step_partial` (the loop removed in fix round 1).

## Evidence

`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL/`, with its own `SHA256SUMS`. Fix round 5's current evidence is under `fix5/`; round 3's historical evidence is under `fix3/`; its report, amendment, receipt and fixture patch are also copied to the top level. Earlier rounds remain historical under their numbered directories. Fix round 1's original run evidence remains at the top level. The reviewed round's evidence is unchanged under `round0/`, with its own manifest (`round0/SHA256SUMS`, SHA-256 `4f3b0988...`, the one the review verified). The top level holds:
- the validator diffs from `5e37ffb616` and from the reviewed head;
- the scripts:
  - from round 0: the change applier, receipt writer, scenario harness, comparison, test-tree builder and mutation check, updated where fix round 1 needed it;
  - new: the fix applier, the text editors, the round comparison and `differential.py`;
- the review's reproduction scripts adapted to the fixed check, with their outputs;
- the differential results for the fixed check and for the reviewed head;
- every run's summary and the check's output receipt for each scenario, and the field-by-field comparison;
- the test patch and the full patched test file;
- the test logs and the mutation results;
- copies of this record, the branch report and the receipt.

## Historical fix round 2 (2026-11-04): Astra AS-01 and AS-02

AS-01 is fixed in `9460959cc7`: step states and claims use the same string interpretation as record validation, including accepted 64-digit JSON integers. Claim comparison then retains its strip/lower behavior. Step-only before/after equality uses the same interpretation. No-field DL-077 rules, including their legacy type handling, remain unchanged. Foreign claims fail all step members regardless of numeric/string SHA representation, invalid filenames or event types. Numeric/string mixtures within a truthful step are equivalent. Numeric/string representations of the same digest are not a change in digest for a step record.

AS-02 is fixed in the accompanying reports commit: the full procedural exclusion appears both at the start of this record and in Landing notes, and includes the author, lander, CA-SEAL-FIX1, CA-SEAL-FIX2, the named stream lead/session responsible for `616345d688` and every other fix worker. The checked forbidden-task list remains exactly author and lander. The updated fixture patch is a separate commit in the same landing, after DL-413's allowance is on main.

Round-2 results (superseded by fix round 3 below): **60 tests pass; all 23 mutants are caught** (the original 19 plus four AS-01 variants). Added controls cover five positive representations, all 80 mixed/all-numeric foreign-file combinations through admission and main, and three normalized-equal-hash negatives; they produce 78 failures against the reviewed validator. S1-S7 and C1-C5 are all rerun, with the same expected admission outcomes and failing seal exits. Sol's 26 adversarial and 112 legacy comparisons, Astra's numeric/adversarial/legacy probes and all unchanged fixture methods are rerun. The original full differential has A=1,812, B=1,808, X2=4, C=24 and zero differences; Astra's 3,936 live-record comparisons and 256 additional numeric legacy comparisons also have zero differences. Main outputs retain only the new pin/time difference. The 279 old fixture helper comparisons retain 267 exact results and 12 receipt-chain diagnostic/return differences with identical acceptance outcomes; the same two pre-existing test methods fail. This is not a claim that all fixture diagnostics are byte-identical.

Check 11 is proved with 29 semantic guard variants and 45 isolated negatives: expected negatives start to pass after their guard is weakened and all other negatives retain rejection for their own defect. Each scratch mutant has a valid validator receipt pin. The report's round-2 section contains the full table and explains the paired bridge observations and sibling-completeness target. Shards and index validation pass; no owner-derived files or governance artifacts are refreshed.

Historical round-2 validator SHA-256: `fb551b066c138be4a198ed1c875edff4a71c7932631db90d1e102ba43ce8a303`. Current fixture patch SHA-256: `a0c70aec676fb95bda2c18c0fe5ad273a56062c193603c79378bdd6a7d18dcdb`. Evidence summary: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL/fix2/results/fix2-summary.json`, SHA-256 `a93e8ab5732a4c9d39060c660533ffc6872cc8837164539aecbcb0741ceb1c5a`. Complete guard table: `fix2/results/guard-matrix.json`, SHA-256 `dda0e1656dd2b51f3bb036c3560cd587452ce6990627c133de2b936adf4104b4`. Family grades remain N/A → N/A, with no new ids or bindings. No family is admitted and no seal is applied.

## Fix round 3: AS2-01 and AS2-02 (CA-SEAL-FIX3)

Both blocking findings are fixed in `27f3912208`. The current rule above supersedes the historical flat/stringifying claim descriptions in rounds 1 and 2. Strict directory inspection rejects duplicate keys at every level, unreadable/ambiguous files and noncanonical expected hashes, including nested before/after claims. Foreign mentions of either step digest anywhere in structure invalidate the step; uninspectable claims conservatively invalidate every step they could touch. Members require their own strictly read canonical record. Legacy no-field judgments remain unchanged.

The final suite passes 68 methods; the seven new class methods fail 97 entries on the reviewed validator. Astra's ten parser probes and 112 broader scenarios pass their expected outcomes. The old/new differential has 5,500 record comparisons with zero differences; all 34 old fixture methods retain their outcomes (113 of 125 normalized helper results exact; 12 out-of-scope receipt-chain diagnostic/returned-pin differences, repaired in fix round 4). Check 11 passes 40 semantic variants over 73 isolated negatives (2920 cells), including the named duplicate pairs and retained baseline-reason intersections in CA-SEAL.md's full table. Shard/index checks pass; no owner-derived or governance artifact is refreshed.

Round-3 validator `74897e17da4d330e835e0d196acd8c2af6761f9fe209cec1b7689d88b7d8adf6`; new receipt `b1b3e8cbdba25fae91def156c661017184b0cb632e1bc36a0f7cf4e0fe566fd4`; fixture patch `54037cce41156d8c4a91b3832084c203a697d6dfb809dc75906cde1c32dbcc29`. Only the new receipt's current-validator pin and descriptive contract/change/note text change; all other pins, identities and flags are preserved. Both procedural seal-applier exclusions explicitly include CA-SEAL-FIX3.

Current evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL/fix3/results/fix3-summary.json`, SHA-256 `5ecc849eb160a2ac06a6d63843b361803fed2e2c614fd3531432bb7f97f3483c`; guard matrix `fix3/results/guard-matrix.json`, SHA-256 `40c079be9feead3c2735e08ffe58537409024f8de1281c59103691643d04cdfd`. The fixture patch remains a separate commit in the same landing after DL-413. Family grades N/A → N/A; no new ids/bindings, admission or seal.

## Historical review round 4: CA-SEAL-FIX4

C4-01 preserves exact decimal/exponent numeric tokens for foreign claim discovery, including `.0`, `e0`, fractional and overflow forms. Numeric registry SHA fields remain noncanonical; matching own files retain ordinary parsed numeric equality.

Historical FIX4 behavior below is superseded by FIX5 for missing or broken byte-chain inputs only; its intact-chain compatibility and numeric fixes remain.

C4-02 removes the complete DL-412 receipt predicate from the old DL-077 comparison. The old predicate runs in its original order with identical messages and returned DL-077 receipt hash, observing the frozen old validator hash. Full DL-412 receipt/authority/prior-byte/current-validator integrity is checked separately for step records and adds only their own errors. With no step field anywhere, all legacy outcomes, diagnostic ordering and pins are identical except the single added output input-pin field, including missing/invalid new receipts and notes-only edits to DL-077. The twelve differences in earlier rounds were outside approved scope.

C4-03 updates the current-pin table above. The validator is `48ab44d79d097ec921dceeb7830c267afa1aaaf0ed871e1cf10912cbf3c8f782`; the new receipt is `bcdbc6f6c468aacc98a3a6b66c7b084ad1a3ceeaae86fdef4d0059c50fa5fafd`. Only the new receipt's current-validator pin is refreshed; its other pins, identities and false flags are unchanged. Descriptive receipt/spec text matches the implementation. CA-SEAL-FIX4 is procedurally excluded from applying the seal in both documents.

The round-4 section in `CA-SEAL.md` contains the complete evidence: **17,480 paired legacy comparisons, zero differences**, including the 125 paired calls and 108 full CLI pairs; **74 fixture methods pass**; **43 guard variants × 86 negatives = 3,698 cells** pass. Summary `fix4/results/fix4-summary.json` SHA-256 `3a01ce4e242e9cd5b1196b50a29334f3bacb24b547c1328c2a6adcc414dbb091`; guard matrix SHA-256 `ed93bc767e4335c9a1dd8ecac492b73a351c6a1572f4b1975a150492596d33be`; fixture patch SHA-256 `2d8a52894f1dc4724dbecf5ad477a4fd131f5eea5c0ee53cdc6bdc55d80268f7`. Historical round counts and superseded expectations above are retained as history. The test patch remains a separate commit in the same landing after DL-413; no family is graded or admitted and no seal is applied.

## Review round 5: findings and responses (CA-SEAL-FIX5)

Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL-sol/REVIEW-cycle5.md`, NOT_READY at `66280444b913235ab0a242c3884f403cc14cbfdd`. **C5-01 is fixed in `4fa959c17fb979b2b8bab34da40eb27b52293187`.** No finding is disputed or stopped for Jared. This report is the verification and handoff companion, not a landing or seal.

**Where:** `Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py:238` (`post_august_validator_pin`); spec's DL-412 note at line 96; the new receipt's byte-chain description. **Cause:** the observer returned a historical constant without hashing the executing file, allowing changed bytes on legacy-only runs. **Fix:** hash the live executable on every observer call; require live SHA-256 == DL-412 `validator_after_sha256` and DL-412 `validator_before_sha256` == DL-077 `validator_after_sha256`. Only when both links match, present the frozen DL-077 after-hash to its original predicate. On a broken/missing/unreadable/non-object byte-chain input, present the live hash. The original predicate then emits its original error and null returned receipt pin. Its full AST is unchanged from the reviewed head; all other original functions are unchanged. Full DL-412 semantic/authority/identity/prior-byte/lander checks remain separate for step records. No unrelated receipt field is consulted by the bridge.

**Jared's FIX5 clarification:** use the exact guard and report integrity rejections separately. Missing or altered DL-412 input, a broken before/after hash or changed executable must fail closed as the intended effect of the **single new input pin**. Every intact-byte-chain parity pair, the 125-call trace and all twelve C4 controls must remain exact. The new byte-pin failures are not an additional legacy behavior change. The change record, spec and receipt now state that boundary.

### Full differential and the twelve C4 controls

All **17,480** pairs were rerun, including **125/125 exact** admission/holding calls and **12/12 exact** C4 controls, also equal to cycle 5's recorded original values. **17,457 pairs are exact; 23 are the intended new-pin integrity rejections below; unexpected differences: 0.** All intact-byte-chain legacy pairs are exact. Issue text, list order, admitted sets, stdout, exit status and old returned pins are compared. Only temporary roots, CLI generation time and the one added `multi_family_step_receipt_sha256` field are normalized/omitted; coexistence projections select the no-field results while step behavior is separately checked. Both original 34-method traces retain the same two pre-existing failures and no errors. The twelve controls are a subset of the 125.

| Comparison group | Paired calls | Exact | Intended integrity rejections |
|---|---:|---:|---:|
| `astra2_existing_records_helper` | 1,732 | 1,732 | 0 |
| `astra2_existing_records_admission` | 1,732 | 1,732 | 0 |
| `astra2_existing_records_with_steps` | 1,732 | 1,732 | 0 |
| `raw_existing_records_with_and_without_steps` | 472 | 472 | 0 |
| `original_125_paired_admission_holding_calls` | 125 | 125 | 0 |
| `legacy_only_full_cli_pairs` | 108 | 85 | 23 |
| `sol_original_legacy_mutations` | 112 | 112 | 0 |
| `sol_extended_existing_records` | 5,880 | 5,880 | 0 |
| `astra_original_existing_records` | 3,936 | 3,936 | 0 |
| `astra_original_fixture_helpers` | 283 | 283 | 0 |
| `cycle3_raw_legacy` | 1,112 | 1,112 | 0 |
| `numeric_legacy_with_steps` | 256 | 256 | 0 |
| **Total** | **17,480** | **17,457** | **23** |

### Each intended receipt-fault rejection

The 108 paired CLI cases execute 216 real validators. Exactly these **23** controls now reject. Each changes only the named new receipt input or byte-link value; all records, old receipts, authority and executable bytes otherwise remain at the valid baseline. For every row, the complete new output equals the actual original DL-077 validator's equivalent altered-executable output, after the same allowed normalization. Both old admission and holding error messages, the empty admitted set and the null DL-077 pin match. No other receipt-fault control changes a legacy result: the remaining 85 CLI pairs are exact, including unrelated authority/identity/lander/prior-byte faults, notes-only and repinned old notes.

| Receipt-fault control | Only cause | Exact admission message | Exact holding message |
|---|---|---|---|
| `new-receipt-missing` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-receipt-unreadable` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_before_sha256:None` | DL-412 validator_before_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_before_sha256:False` | DL-412 validator_before_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_before_sha256:{}` | DL-412 validator_before_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_before_sha256:[]` | DL-412 validator_before_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_before_sha256:0` | DL-412 validator_before_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_before_sha256:'wrong'` | DL-412 validator_before_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_after_sha256:None` | DL-412 validator_after_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_after_sha256:False` | DL-412 validator_after_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_after_sha256:{}` | DL-412 validator_after_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_after_sha256:[]` | DL-412 validator_after_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_after_sha256:0` | DL-412 validator_after_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new:validator_after_sha256:'wrong'` | DL-412 validator_after_sha256 fails its byte-link equality | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-root:b'null'` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-root:b'false'` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-root:b'true'` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-root:b'0'` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-root:b'1.0'` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-root:b'1e0'` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-root:b'"false"'` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-root:b'[]'` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |
| `new-root:b'{"nested":[[[[[[[[[[[[[[[[[[[['` | DL-412 byte-chain input missing/unreadable/non-object | `post-August amendment receipt invalid: post-August amendment receipt identity, authority or hash mismatch` | `holding authority/receipt invalid: post-August amendment receipt identity, authority or hash mismatch` |

### Executable-byte controls, tests and earlier-review probes

The original byte-only comment and appended-CRLF controls were retained through the **actual CLI**, plus a one-byte shebang-comment change and additional appended bytes. Each begins with a fully valid DL-412 receipt; no receipt or admission-record pin is refreshed after changing the executable. The old and new validators each run baseline plus all four controls (10 actual CLIs): baseline admits coordination and validates holding; every byte mutation admits no post-August family, fails holding and returns a null DL-077 receipt pin, with the exact messages above and identical failures. The original receipt probe's actual-executable assertion is restored on `post_august_receipt_state()` and passes. A forged new before/after pin is tested independently with otherwise valid bytes; missing, unreadable, scalar/container and wrong-type inputs also reject. Restore/re-mutate controls prove the observer is live rather than cached. Tests additionally show unrelated new semantic faults preserve legacy judgments.

| Verification | Exit / result |
|---|---|
| Final external fixture patch / full test file | Dry-run and apply exit 0; full file equals supplied file. **79 methods pass**, exit 0, including five new C5 methods. The test file remains external because DL-413's allowance is not on this branch. |
| Isolated live byte-pin type/representation sweep | Exit 0; **24** single-field controls cover missing, uppercase, whitespace/LF, string booleans/numbers, exact booleans/numbers, null, arrays and nested objects; every restore reproduces its valid legacy baseline exactly. |
| New C5 test sensitivity against reviewed constant validator | Exit 1; **31 failure entries** across the five-method run. The unrelated-semantic control still passes. Scratch receipt current pin alone is refreshed for this sensitivity run. |
| Original Sol scenarios, adversarial, legacy, sensitivity, writer and numeric CLIs | Rerun, recorder exits 0. All 26 original claimant negatives reject every member; X1/X2, S1–S7/C1–C5 and writer byte equality checked. S5 now has the intended missing-input rejection. C4 accepts exactly the three complete synthetic members; C5 rejects them when one is 11/12. |
| Sol extended sweep | **5,880** legacy comparisons exact; **880 + 296 = 1,176** malformed/foreign claimants reject every member. Original exit 1 retained solely for five superseded pair-only positive expectations (different/reversed/missing endpoint); no legacy difference or negative escape. |
| Original receipt probe / final classified probe | The original actual-byte assertion passes. Original aggregate exits 1 because it wrongly requires every unrelated semantic fault to break DL-077. The final probe changes only that aggregate expectation: the ten before/after-field faults reject DL-077, the other 64 do not; all 74 reject the full new predicate, and all four additional byte/prior checks pass; writer byte equality holds. Final exit 0. |
| Astra original, Astra-2, cycle-3, cycle-4 and cycle-5 probes | Replayed. Original numeric matrices, all ten parser scenarios, true 43→46 positive plus 111 negatives, 122 representation scenarios, 1,112 raw and 256 coexistence pairs, 58-case own recorder, nine float CLIs, notes/repinned-notes CLIs and 17 cycle-5 numeric CLIs complete. Ordinary and negative-zero metadata controls keep the valid step; malformed numeric SHA/foreign claims reject every member. |
| Check 11 | **46 variants × 99 negatives = 4,554 cells**; every expected flip matches, every other negative retains its own exact baseline rejection reason. Every baseline negative is corroborated through main. Named duplicate guards are paired as below. |
| Shards | Exit 0: **99 sources / 3,092 shards**, pass. |
| PlanUnit index | Exit 1, top-level **fail**: 21 pre-existing ledger-shape errors and missing DL-302 relative to newly fetched origin/main (22 total). Every named file, the index JSONL and checker are byte-identical to the reviewed head; 7,421 PlanUnits / 29,932 acceptance units remain. These unrelated findings are reported, not repaired. All 15 ignored currentness files match the share. |
| Scope / line endings | Five fix-round paths only; only `post_august_validator_pin` changes AST from the reviewed head. All **2,001** validator lines retain CRLF; whitespace check passes. Protected files, all old receipts/records, registry, generated shards/index and governance artifacts are unchanged. |

No owner `Plans/*.md` source changed, so no derived regeneration or governance refresh applies. No run-gates, governance audit, migration snapshot or landing check is claimed. Full-repository index findings do not become a family grade. The unpatched 34-method suite without the new byte input still fails closed; the same-landing patch supplies it. Synthetic PASS rows are fixtures only.

### Check 11: whole lane, including live executable integrity

Every case starts valid and changes one semantic defect. Observing assessment/receipt/record pins are refreshed except in the deliberate live-byte negatives, where unchanged receipt bytes are the premise. The historical DL-077 after-pin negative refreshes the new receipt's observing before-pin and old record pins, so it is not masked by a second byte-link defect. Each new executable negative uses its own scratch module file; production bytes are untouched. Removing the whole byte bridge also removes its fail-closed parser/object-access observations together.

**Named duplicate pairs:** `receipt-validator_before_sha256` and `bridge-before-hash` each remove both the bridge before-link and its full step-receipt duplicate. `receipt-validator_after_sha256` and `bridge-live-hash` each remove the live-byte equality and its full step-receipt duplicate. `bridge-all-links` removes the byte bridge plus both step byte-link duplicates. Existing root/state/canonical duplicates remain paired as in earlier rounds. The separate `step-receipt-application` variant still leaves byte-link faults rejected by the byte bridge, while its 18 unrelated authority/receipt negatives flip. The machine matrix lists every retained negative and its baseline-reason intersection; the final column below denotes the complement of each listed flip set.

| Guard weakened in scratch | Negatives that start to pass | Other negatives retaining their own baseline rejection |
|---|---|---:|
| `foreign` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace`, `deep-uninspectable-claim`, `duplicate-foreign`, `duplicate-member`, `foreign-Known37`, `foreign-malformed`, `foreign-newline`, `foreign-numeric-claimant`, `foreign-numeric-rejected`, `foreign-ordinary`, `foreign-rejected`, `foreign-upper`, `mention-exact-number-.0`, `mention-exact-number-.0e-0`, `mention-exact-number-.5`, `mention-exact-number-E+0`, `mention-exact-number-e0`, `mention-exact-number-e9999`, `mention-key-registry_after`, `mention-key-registry_before`, `mention-nested-registry_after`, `mention-nested-registry_before`, `mention-numeric-registry_after`, `mention-numeric-registry_before`, `mention-quoted-number-.0`, `mention-quoted-number-.0e-0`, `mention-quoted-number-.5`, `mention-quoted-number-E+0`, `mention-quoted-number-e0`, `mention-quoted-number-e9999`, `mention-space-registry_after`, `mention-space-registry_before`, `mention-unicode-registry_after`, `mention-unicode-registry_before`, `mention-upper-registry_after`, `mention-upper-registry_before`, `mention-value-registry_after`, `mention-value-registry_before`, `nested-noncanonical-side`, `non-json-constant`, `non-json-file`, `outer-array`, `unreadable-json`, `unreadable-utf8` | 50 of 99 |
| `missing` | `missing-member` | 98 of 99 |
| `states` | `same-states-counts`, `same-states-registry_after-revision`, `same-states-registry_after-sha256`, `same-states-registry_before-revision`, `same-states-registry_before-sha256` | 94 of 99 |
| `same-description` | `same-list-and-states`, `same-states-counts`, `same-states-registry_after-revision`, `same-states-registry_after-sha256`, `same-states-registry_before-revision`, `same-states-registry_before-sha256` | 93 of 99 |
| `count` | `count-padded`, `count-short` | 97 of 99 |
| `different-hashes` | `equal-hashes` | 98 of 99 |
| `sorted-unique` | `shape-duplicate`, `shape-unsorted` | 97 of 99 |
| `all-or-none` | `member-incomplete` | 98 of 99 |
| `step-pin` | `step-receipt-pin` | 98 of 99 |
| `decision-DL412` | `decision-DL412` | 98 of 99 |
| `receipt-schema_id` | `receipt-schema_id` | 98 of 99 |
| `receipt-authority_ref` | `receipt-authority_ref` | 98 of 99 |
| `receipt-authority_section_sha256` | `receipt-authority_section_sha256` | 98 of 99 |
| `receipt-validator_before_sha256` | `legacy-byte-before`, `receipt-validator_before_sha256` | 97 of 99 |
| `receipt-validator_after_sha256` | `legacy-byte-after`, `live-byte-appended-bytes`, `live-byte-comment`, `live-byte-crlf`, `live-byte-one-byte`, `receipt-validator_after_sha256` | 93 of 99 |
| `receipt-record_dir` | `receipt-record_dir` | 98 of 99 |
| `receipt-record_schema_id` | `receipt-record_schema_id` | 98 of 99 |
| `receipt-author_task` | `receipt-author_task` | 98 of 99 |
| `receipt-seal_authorized` | `receipt-seal_authorized` | 98 of 99 |
| `receipt-admission_authorized` | `receipt-admission_authorized` | 98 of 99 |
| `receipt-contract_depth_complete` | `receipt-contract_depth_complete` | 98 of 99 |
| `receipt-prior-path` | `receipt-prior-path` | 98 of 99 |
| `receipt-prior-sha256` | `receipt-prior-sha256` | 98 of 99 |
| `receipt-lander-and-list` | `receipt-forbidden`, `receipt-lander-''`, `receipt-lander-None` | 96 of 99 |
| `authority-tokens` | `authority-token-0`, `authority-token-1`, `authority-token-2`, `authority-token-3` | 95 of 99 |
| `duplicates` | `duplicate-foreign`, `duplicate-member` | 97 of 99 |
| `constants` | `non-json-constant` | 98 of 99 |
| `root-shape` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace`, `outer-array` | 92 of 99 |
| `canonical-scan` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace` | 93 of 99 |
| `uncertainty` | `canonical-boolean`, `canonical-nested`, `canonical-number`, `canonical-unicode`, `canonical-uppercase`, `canonical-whitespace`, `duplicate-foreign`, `duplicate-member`, `foreign-malformed`, `foreign-newline`, `foreign-numeric-claimant`, `foreign-numeric-rejected`, `foreign-upper`, `nested-noncanonical-side`, `non-json-constant`, `outer-array`, `unreadable-json`, `unreadable-utf8` | 81 of 99 |
| `recursive-claims` | `deep-uninspectable-claim`, `foreign-Known37`, `foreign-ordinary`, `foreign-rejected`, `mention-exact-number-.0`, `mention-exact-number-.0e-0`, `mention-exact-number-.5`, `mention-exact-number-E+0`, `mention-exact-number-e0`, `mention-exact-number-e9999`, `mention-key-registry_after`, `mention-key-registry_before`, `mention-nested-registry_after`, `mention-nested-registry_before`, `mention-numeric-registry_after`, `mention-numeric-registry_before`, `mention-quoted-number-.0`, `mention-quoted-number-.0e-0`, `mention-quoted-number-.5`, `mention-quoted-number-E+0`, `mention-quoted-number-e0`, `mention-quoted-number-e9999`, `mention-space-registry_after`, `mention-space-registry_before`, `mention-unicode-registry_after`, `mention-unicode-registry_before`, `mention-upper-registry_after`, `mention-upper-registry_before`, `mention-value-registry_after`, `mention-value-registry_before`, `non-json-file` | 68 of 99 |
| `all-files` | `non-json-file` | 98 of 99 |
| `canonical-members-paired` | `canonical-member`, `canonical-number` | 97 of 99 |
| `claim-object-keys` | `mention-key-registry_after`, `mention-key-registry_before` | 97 of 99 |
| `claim-list-values` | `deep-uninspectable-claim`, `mention-nested-registry_after`, `mention-nested-registry_before` | 96 of 99 |
| `claim-case` | `mention-upper-registry_after`, `mention-upper-registry_before` | 97 of 99 |
| `claim-whitespace` | `mention-space-registry_after`, `mention-space-registry_before` | 97 of 99 |
| `claim-unicode-decimal` | `mention-unicode-registry_after`, `mention-unicode-registry_before` | 97 of 99 |
| `deep-claim` | `deep-uninspectable-claim` | 98 of 99 |
| `nested-canonical` | `nested-noncanonical-side` | 98 of 99 |
| `exact-number-tokens` | `mention-exact-number-.0`, `mention-exact-number-.0e-0`, `mention-exact-number-.5`, `mention-exact-number-E+0`, `mention-exact-number-e0`, `mention-exact-number-e9999` | 93 of 99 |
| `step-receipt-application` | `authority-token-0`, `authority-token-1`, `authority-token-2`, `authority-token-3`, `receipt-admission_authorized`, `receipt-author_task`, `receipt-authority_ref`, `receipt-authority_section_sha256`, `receipt-contract_depth_complete`, `receipt-forbidden`, `receipt-lander-''`, `receipt-lander-None`, `receipt-prior-path`, `receipt-prior-sha256`, `receipt-record_dir`, `receipt-record_schema_id`, `receipt-schema_id`, `receipt-seal_authorized` | 81 of 99 |
| `legacy-frozen-validator-pin` | `legacy-frozen-validator-pin` | 98 of 99 |
| `bridge-live-hash` | `legacy-byte-after`, `live-byte-appended-bytes`, `live-byte-comment`, `live-byte-crlf`, `live-byte-one-byte`, `receipt-validator_after_sha256` | 93 of 99 |
| `bridge-before-hash` | `legacy-byte-before`, `receipt-validator_before_sha256` | 97 of 99 |
| `bridge-all-links` | `legacy-byte-after`, `legacy-byte-before`, `legacy-byte-receipt-array`, `legacy-byte-receipt-boolean`, `legacy-byte-receipt-missing`, `legacy-byte-receipt-null`, `legacy-byte-receipt-number`, `legacy-byte-receipt-string`, `legacy-byte-receipt-unreadable`, `live-byte-appended-bytes`, `live-byte-comment`, `live-byte-crlf`, `live-byte-one-byte`, `receipt-validator_after_sha256`, `receipt-validator_before_sha256` | 84 of 99 |

### Astra recurring-defect sweep and standing checks

| Item | Current evidence |
|---|---|
| 1. Forged/contradictory identities or hashes | Own validator bytes are recomputed live; missing/forged before/after pins and byte changes reject with the old predicate. Complete member/state/count, row/assessment/decision and new receipt mutations remain covered by the full lane matrix and replays. Historical registry truth remains the unchanged history-review obligation. |
| 2. Storage metadata | N/A: no runtime Storage metadata or payload contract changes. |
| 3. Historical/live-state crossover | All intact-byte-chain no-field pairs are exact; only the explicitly authorized input-pin faults reject, and each equals the original altered-bytes result. |
| 4. Multiple field interpretations | Exact SHA equality against a live hash rejects wrong types, containers, casing/whitespace and altered strings; the earlier strict members/recursive numeric claim rules are unchanged and rerun. |
| 5. Unresolved schema references | No schema or `$ref` is added or changed. |
| 6. Partial size limits | N/A: no stored event body or size policy changes. |
| 7. Custody on every path | Legacy admission and holding both reach the live two-link observer. Steps additionally require the unchanged full semantic receipt predicate. Main, module and actual CLI paths are covered. |
| 8. Masked negatives | Complete 4,554-cell matrix; named byte-link duplicates removed together; all other rejection reasons retained. |
| 9. Unsupported grades | N/A → N/A. No family, seal or runtime behavior is graded. |
| 10. Alternate numeric forms | Original integer/decimal/exponent/negative-zero/overflow/quoted-member and foreign-claim probes rerun; numeric SHA fields remain noncanonical for steps. New byte-pin numeric values fail equality without coercion. |
| 11. Confused types | Nulls, boolean/string booleans, numbers/string numbers, arrays, objects and malformed/deep receipt roots covered. New semantic fields are never interpreted by the byte bridge. |

Standing checks 1–4, 6–7 and 10 concern runtime family contracts outside this task. Check 5 retains full-match/trailing-LF negatives; check 8 asserts real admitted sets, fresh CLI outputs, failure messages and old pins rather than relying on exit 1; check 9 adds no references; check 11 is proved for the whole lane above.

### Pins, evidence and handoff

Validator SHA-256: `0cb2bd07a500d4314c678c0ee0cd1eae267accfb5a02e3f686f5210f92dd80d6`. Pending new receipt SHA-256: `ee9ce3a023d9cc35111e5cd209ea511f2f572307fff876524c6c6e584f66ed9a`. Fixture patch SHA-256: `a3de006aff67f53067a0a63ea00d5b4b08cedc743a755a4130f303cb86d5ec81`. Only the new receipt's `validator_after_sha256` pin is refreshed; every other pin, authority/source/card reference, identity, null lander, checked author-only pending list and false flag is preserved. Descriptive receipt/spec text is aligned. CA-SEAL-FIX5 is explicitly procedurally excluded in **both** documents and the receipt note; the checked author/lander predicate is unchanged.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL/fix5/`. Summary `results/fix5-summary.json`, SHA-256 `cca4d108363e554afa78a4d0e0ae159b22321a6e843444bed9e087e5798d79ae`; full guard matrix `results/guard-matrix.json`, SHA-256 `7a608297446ef60ef031ec0b49b6e041f9cf6314c67815accec5b7818f3bfbc3`; integrity controls `results/integrity-rejections.json`, SHA-256 `fd40d98bdac9cc061339872a6ba4a042cdfa94ba3abd8c07db0fd3c843f7d8d2`. Replay sources, exact traces, full CLI receipts, original nonzero/superseded expectations and final logs are retained with a manifest. One guard preparation run was stopped to pair the newly duplicated byte guards before the final full run; its partial output is not a verification count. Initial new-test setup assertions were corrected before the successful 79-method run; production code did not change. Raw scratch trees and the requested worktree are removed after the result is pushed and evidence copied.

**Family grades before → after:** N/A → N/A; no self-grade JSON applies. **Ids used:** none minted; DL-412 is cited authority and DL-998/DL-999 remain fixture-only. **New bindings:** none. **Open integration work:** DL-412/DL-413 dependencies, actual lander and matching receipt list, the fixture patch as its own commit in the same landing, ordered Sol/Astra pre/post reviews and landing checks. No admission, registry append, seal, main push, pm-mail or subagent occurred.

## Review round 6: findings and responses (CA-SEAL-FIX6)

**Status: STOPPED / NOT_READY.** Reviewed branch head `b99a1c920976db3207b68d7e8147501b41cda8ad`; fetched main `fb441b27fd75440e14115fb382b15a5258ad7ea3`. This is an investigation and documentation result. No implementation repair, new validator digest, admission, seal or governance refresh is claimed.

## C6-01: location, cause and required fix

**Where:** `Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py:245`, with the untrusted two-field bridge at `:249` and the separately checked complete receipt at `:207`.

**Cause:** the bridge authenticates neither the receipt nor the executable it describes. Matching two editable hash strings is sufficient to present the historical DL-077 after-hash. The complete receipt predicate can reject a forged object while legacy admission and holding still succeed. A full receipt with its after-hash repinned to changed bytes even passes that complete predicate. Checking the complete predicate alone therefore cannot authenticate that after-hash.

**Required fix, not implemented:** independently authenticate the complete DL-412 receipt, including every field, the live DL-412 Decision Log section hash, the prior DL-077 receipt byte hash and current executable hash, before an authorized bridge can present the historical hash. Keep that verification separate from DL-077's original predicate and preserve its diagnostic ordering. A protected receipt/executable anchor and a compatible boundary for semantic-invalid legacy controls are prerequisites. This worker cannot supply either by rewriting an old receipt, a protected artifact or the approved compatibility rule.

## Step 1 — the existing trust model

| Surface | What is anchored today, with path:line |
|---|---|
| DL-077 validator bytes | On main, `pm_event_authority_independent_validator.py:165` compares the live executable SHA-256 to `reports/event-authority-20260911/step-10-post-august-admission-receipt.json:24` (`190a86f23e06362bdb98e27eb23268c9691db46cc41bc9f97e1fbb6bde1abc20`). It is a comparison against an editable receipt, not an independent immutable pin. On this branch the comparison is `:182`, and the bridge supplies its operand. |
| DL-077 receipt bytes | Each existing admission record pins `dceb7f21436cbe126c23822e62caa1b6dedcb45fefae3005c1804576ca34d827` at line 5: `reports/event-authority-20260911/admission-records/browser.workspace.created.json:5`, `browser.workspace.reset.json:5`, `context.compaction.completed.json:5`, `coordination.agent_registered.json:5`. The branch checks this at `pm_event_authority_independent_validator.py:406`; main's corresponding check is at `:196`. These record pins detect a changed receipt while the records stay fixed. They are not an anchor outside the editable chain. |
| Step 3 / August history | `reports/event-authority-20260911/step-03-holding-bucket-receipt.json:12` records the prior August executable hash `24f23936c5b45398a88fcf1b81c83b0801ca9fc3659781e7336c3d71fe568398`; `:13` records the Step 3 after-hash `bd54afffc689146753daec474d6cdbc7ac663afaf21d842aad4fcf10255112d5`. DL-077 chains from the latter at its receipt `:23`. Holding obtains that before-pin from DL-077 at branch validator `:202` and compares it to Step 3's after-pin at `:582`. It does not hash or authenticate the original August executable against the Step 3 before-pin. |
| Spec Lock | `Plans/Spec_Lock.json:3` starts the 101-entry `canonical_ssot_hashes.files` list, ending at `:408`. Neither the executable nor either receipt is an entry, and none of their hashes or the August/Step 3 executable hashes occurs anywhere in the file. Identical bytes on branch and fetched main. No receipt anchor exists here. |
| Closure registry | Entire `Plans/.audits/_semantic_closure_registry.jsonl` searched: 737 rows; no executable/receipt path or relevant hash occurs. Row `:737` is an unrelated PNC currentness reopen record, not a seal-check receipt anchor. Identical bytes on branch and fetched main. |
| August freeze | `closed-world-census/CURRENT_SOURCE_INVENTORY.json:6` declares 180 sources, with its source digest at `:8`; neither it nor `closed-world-census/FREEZE_DIGEST.txt:1` contains the receipt paths or validator hashes. These freeze census source inputs, not the later validator amendments. No freeze file changes. |
| August output receipt | `independent-validator/receipts/event_authority_validator_receipt.json:48` starts its input-pin object. It contains no validator-byte hash or DL-077/DL-412 receipt hash. It is historical output; the spec at `INDEPENDENT_EA_VALIDATOR_SPEC.md:17` and `:23` expressly denies self-authorizing receipt flags/hashes. |
| `.evidence` and landing checks | Full tracked `.evidence` and `scripts` searches at both revisions contain none of the executable/receipt paths or relevant hashes. `scripts/pm-plans-verify.py:1111` checks only explicit Spec Lock entries. `scripts/pm-landing-check.py:171` classifies `stale_hash` as reseal staleness; landing checks do not supply a missing seal-check anchor. No landing check is claimed run. |

All validator-relative and freeze-relative paths in this table are under `Plans/.audits/event-authority-2026-08-12/`. The table's main line numbers were inspected at the frozen DL-077 file `16acf7594a3fe8559af89491b895f440b314b99e`; fetched main has byte-identical validator bytes. Negative search evidence is the complete inventory, not a claim that one cited line proves absence throughout a file.

**Conclusion:** there is no independent protected same-commit-forgery anchor to reuse. The existing trust model is cross-file consistency plus retained Git history and procedural review. Existing record pins protect the DL-077 receipt only while those records remain unchanged. They cannot gain a forward pin to a new DL-412 receipt without changing historical inputs. Git history/review is a human verification boundary; this CLI does not authenticate a commit, signature or trusted remote ref.

## Fresh actual CLI evidence

The cycle-6 recorder was executed unchanged, except its scratch location, using independently extracted old and requested validators. All fourteen outputs are fresh. Every case asserts unchanged DL-077 receipt and all four no-field record bytes. All exit 1 for unfinished seal conditions; admission, holding and returned pins are checked directly.

| Control | Old validator | Requested validator |
|---|---|---|
| Valid baseline and restore | coordination admitted; holding valid | same |
| Alter executable with an inert comment only | no post-August admission; holding invalid | same rejection |
| Alter executable + two-field forged receipt | no admission; holding invalid | **coordination admitted; holding valid**; new pin null |
| Alter executable + full-shaped forged identity/authority/prior receipt | no admission; holding invalid | **coordination admitted; holding valid**; new pin null |
| Alter executable + otherwise intact full receipt, only after-hash repinned | no admission; holding invalid | **coordination admitted; holding valid**; new pin present |
| Pristine executable + two-field receipt | coordination admitted; holding valid | same legacy outcome; new pin null |

The normalized forged-receipt result is byte-identical to cycle 6's result: SHA-256 `6275381bf0dbb25480a06cc4d774d6335fd7820ada02d3abc07179d501684232`. C6-01 is confirmed, not disputed or fixed.

Four further old-validator CLI controls isolate the old trust model: baseline; comment-only; comment plus changing only DL-077's after-hash; restore. The combined forgery restores **holding valid**, despite byte-identical Step 3 receipt and all four admission records. Admission stays empty because the unchanged records detect the changed DL-077 receipt bytes. This disproves an implicit independent DL-077 receipt anchor protecting holding.

## Step 2 — why this lane stops

1. **No protected entry exists.** A bridge requiring a common protected receipt anchor cannot be enabled on the current landing tree without a protected-artifact change outside this lane. Requiring the absent entry fails closed on every otherwise valid bridge use: the live amended executable hash differs from DL-077's after-pin, so legacy admission becomes empty, holding becomes invalid and the returned DL-077 pin becomes null. That is an additional difference for intact-chain baselines, not one of the existing 23 sole-cause integrity rejections. This consequence follows from the existing predicate and the fresh byte-only rejection controls; no candidate gate is presented as tested or approved code.
2. **A later reseal leaves a behavioral interval.** If such a requirement lands before its anchor, main rejects legacy admission/holding from landing until the correctly pinned anchor lands. Allowing that interval would contradict the required intact-chain behavior. Bypassing the absent entry during the interval would reopen C6-01 and is not proposed.
3. **Complete semantics also needs a boundary ruling.** The required compatibility corpus deliberately preserves legacy judgments for intact-byte new schema/authority/lander/prior-byte faults. C4's notes-only old-receipt edit makes the new prior-byte pin stale but preserves the old predicate's seven ordered admission issues and returned old pin. The pending receipt also has a null lander. A rule that presents the old constant only after the complete DL-412 predicate passes refuses these cases, even if evaluated outside the old predicate. Moving its call alone does not resolve C4-02. An independent known-executable pin could distinguish byte integrity from these semantics, but choosing a new rule would exceed this worker's scope.

### Exact proposed common anchor entries — not applied

A separately authorized reseal could establish a common anchor in `Plans/Spec_Lock.json` under `canonical_ssot_hashes.files`. For the **reviewed snapshot's existing bytes**, the exact entries are:

```json
[
  {
    "path": "reports/event-authority-20260911/step-10-post-august-admission-receipt.json",
    "sha256": "dceb7f21436cbe126c23822e62caa1b6dedcb45fefae3005c1804576ca34d827"
  },
  {
    "path": "reports/event-authority-20261104/seal-check-multifamily-step-receipt.json",
    "sha256": "ee9ce3a023d9cc35111e5cd209ea511f2f572307fff876524c6c6e584f66ed9a"
  }
]
```

The first hash stays exact because this task forbids changing the old receipt. The second identifies the **unfixed, pending** reviewed receipt, with null lander; it must not be installed as approval of C6-01. After an authorized repair, full receipt-text alignment, refresh of only its new validator pin and actual lander selection, the reseal worker must substitute SHA-256 of those final receipt bytes. No honest final DL-412 anchor digest can be calculated before that work exists. The executable then follows from the protected receipt's after-pin, while complete receipt-byte hashing binds every field. Spec Lock's generic check alone is insufficient: the future bridge must itself require the exact matching entry. No protected file is edited here, and no final digest is fabricated.

**Stop question for the lead:** Can the lead arrange a separately authorized common receipt anchor at the same landing boundary, with no unanchored main interval, and resolve whether intact-byte DL-412 semantic faults retain the exact C4 legacy judgments or instead become full-receipt integrity rejections? The present task requires both full receipt eligibility and those exact controls, while no protected common anchor exists. This worker implements neither a new trust authority nor a compatibility exception without that ruling.

This stop follows the user's explicit instruction to stop when an anchor requirement cannot preserve intact-chain and 125/twelve-control behavior; it is not an inferred approval rule from a skill.

## Detection limits and remaining verification

The existing check detects unrepinned changed validator bytes, broken hash links and inconsistent old receipt/record pins. It does **not** authenticate a forged DL-412 receipt matching altered executable bytes. Full receipt field/authority/prior consistency alone does not fix that gap. A future protected-anchor check can detect modifications while its trusted anchor and enforcing code remain intact. An actor able to rewrite the validator, the receipt, DL-412's text and the anchor together is outside any in-repo check; so is an actor simply removing the enforcing predicate from the executed program. Git/procedural review remains necessary.

**Round-6 verification:** eighteen actual CLIs; complete read-only anchor inventory at branch and fetched main; all new forged controls reproduced; old-chain isolation proved. No checker guard changed, so a new whole-lane guard-removal table, the full 17,480-pair differential, the 125/twelve replay and every earlier review probe were **not rerun after the stop**. The last independently reviewed historical result remains 17,480 pairs: 17,457 exact, 23 intended integrity rejections, zero unexpected differences in that corpus; 125/125 and 12/12 exact. It omits C6-01 and is not a FIX6 pass. No family is graded: **N/A → N/A**. No id is minted; DL-412 is existing authority. No self-grade JSON applies.

Only the change record and `CA-SEAL.md` change on the branch. CA-SEAL-FIX6 joins their procedural seal-applier exclusions; the checked author/lander list is unchanged. Validator/spec/new receipt, August artifacts, fingerprints/freeze, old receipts, records, Spec Lock, closure registry, `.evidence`, `.gitignore`, auto-decisions, shards and index remain byte-identical to the requested head. No owner source changed and no derived regeneration applies. The branch remains NOT_READY.

**Unchanged validator SHA-256:** `0cb2bd07a500d4314c678c0ee0cd1eae267accfb5a02e3f686f5210f92dd80d6`. **Unchanged pending new receipt SHA-256:** `ee9ce3a023d9cc35111e5cd209ea511f2f572307fff876524c6c6e584f66ed9a`.

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL/fix6/`. `results/anchor-inventory.json` SHA-256 `5bb76c4f051379f720571cfc53828bb910c0cdf00418a0ff90c2f81239e2cb01`; `results/forged-receipt-results.json` SHA-256 `6275381bf0dbb25480a06cc4d774d6335fd7820ada02d3abc07179d501684232`; `results/old-receipt-anchor-probe.json` SHA-256 `e8ebbee3c8a11172b74a3349bc2b08ee321340f288abc94023014705e5209f35`; `results/proposed-spec-lock-entries.reviewed-head.json` SHA-256 `0d0fa20c4a7e24be3ac0da316712026717c5d2eb8c78d07b80988468f1466678`. Replay sources and all fresh CLI outputs are retained with `SHA256SUMS`. Scratch and the requested worktree are removed after the documentation commit is pushed and the deliverables are copied.

## Review round 7: findings and responses (CA-SEAL-FIX7)

**C6-01 — fixed in `5c44eaf593704fce8bf6a213b8e64ddbb32297eb`.** No finding is disputed or stopped for Jared. This implements the DL-412-only anchor ruling (`pm7-build`, 2026-11-05, mail `1105012742-e2fc`), not FIX6's historical two-receipt proposal. The branch awaits independent review and its coordinated landing dependencies; this is no admission, seal or main landing.

**Where:** `post_august_validator_pin`, validator lines 238–264; the audit spec's DL-412 paragraph; this report and the change record's current landing contract. **Cause:** two editable hash fields let a fabricated new receipt bridge altered executable bytes to the historical DL-077 pin. **Fix:** require the complete new receipt bytes to match exactly one exact-path Spec Lock entry before either legacy caller can receive the trusted old hash. Live executable and before-link checks remain. All byte conditions are outside DL-077's unchanged predicate. Its semantics, ordering, error messages and returned receipt pin stay intact; the separate new receipt semantic observer is unchanged.

Only that bridge function changes AST from `4e3765ab003c9d2802b7b6a3277c6d1e444e3d55`. All 2,010 validator lines retain CRLF. Only `validator_after_sha256` changes in the new receipt; its other bytes and every old receipt/record pin stay fixed. The audit spec gains the exact anchor condition. The two reports document the ruling and evidence. No top-level owner source or generated artifact changes; no regeneration or governance refresh is performed. Scope audit checks 268 protected files byte-for-byte and the exact five-path fix allowlist. Spec Lock remains unedited.

### Differential on the anchored tree

**17,480 pairs: 17,457 exact; 23 intended integrity rejections; zero unexpected differences.** All 125 admission/holding calls and all twelve C4 controls are exact, including their previously recorded old returned values. Each original 34-method trace retains the same two inherited failures and no errors. The twelve controls are a subset of the 125.

The old side uses the frozen DL-077 validator (`190a86f2...`) and unchanged old receipts. The new side supplies the DL-412 receipt and its synthetic exact Spec Lock anchor. Named semantic mutations refresh their observing fixture anchor so they isolate semantics. The actual forgery and anchor-negative controls hold their trusted baseline anchor fixed. This fixture authority is explicit: none of these synthetic entries changes repository Spec Lock or authorizes a real receipt.

The comparison checks ordered diagnostics, returned old pins, admitted sets, CLI stdout and exits. Only temporary roots, CLI generation time and the single added `multi_family_step_receipt_sha256` output field are normalized/omitted. Coexistence comparisons select no-field judgments; separate positive/negative controls cover step admission.

| Group | Pairs | Exact | Intended rejections |
|---|---:|---:|---:|
| `astra2_existing_records_helper` | 1,732 | 1,732 | 0 |
| `astra2_existing_records_admission` | 1,732 | 1,732 | 0 |
| `astra2_existing_records_with_steps` | 1,732 | 1,732 | 0 |
| `raw_existing_records_with_and_without_steps` | 472 | 472 | 0 |
| `original_125_paired_admission_holding_calls` | 125 | 125 | 0 |
| `legacy_only_full_cli_pairs` | 108 | 85 | 23 |
| `sol_original_legacy_mutations` | 112 | 112 | 0 |
| `sol_extended_existing_records` | 5,880 | 5,880 | 0 |
| `astra_original_existing_records` | 3,936 | 3,936 | 0 |
| `astra_original_fixture_helpers` | 283 | 283 | 0 |
| `cycle3_raw_legacy` | 1,112 | 1,112 | 0 |
| `numeric_legacy_with_steps` | 256 | 256 | 0 |
| **Total** | **17,480** | **17,457** | **23** |

The 108 paired CLI cases execute 216 real validators. All 23 differences are individually retained in `integrity-rejections.json`: missing/unreadable receipt, six wrong values for each before/after link, eight scalar/container roots and the over-recursive root. Every complete new output equals the original validator's actual altered-executable rejection after the permitted normalization. Admission is empty, holding invalid and the old pin null. Exactly the original mismatch messages occur; no unrelated rejection is substituted. The other 85 pairs remain exact, including semantic-only faults under a matching fixture anchor and notes-only/repinned old receipt controls.

### C6 forged-receipt and anchor controls

The unchanged cycle-6 attack construction was rerun through fourteen actual CLIs, seven cases per validator. Each case asserts unchanged DL-077 receipt and all four existing record bytes. A trusted baseline new receipt is anchored once before the sequence; that anchor never changes during an attack. Baseline and restore admit coordination and validate holding. Comment-only and all three combined attacks now admit nothing, fail holding and return a null old pin with the exact old mismatch diagnostics.

| Altered executable control | Old validator | FIX7 anchored validator |
|---|---|---|
| Inert comment only | rejects | rejects |
| Comment + entire two-field forged receipt | rejects | rejects |
| Comment + full-shaped forged schema/authority/author/prior receipt | rejects | rejects |
| Comment + otherwise intact full receipt with its after-pin repinned | rejects | rejects |

The last attack may still obtain a non-null **new semantic pin** because its semantic fields and live after-link agree. That pin alone grants no legacy eligibility: the unchanged trusted anchor rejects its modified receipt bytes. The pristine-executable/two-field receipt also fails FIX7's unchanged baseline anchor. These supplemental controls are outside the 17,480 original pairs.

Twenty further actual CLI controls cover baseline/restore, missing file/entry, wrong hash, duplicate entry, entry pointing elsewhere, casing/LF/type faults, malformed and wrongly shaped lock inputs, a receipt byte edit, and three explicitly anchored unrelated semantic faults. All expected outcomes pass. Forty-one additional path/hash/root type and numeric controls reject; each same-module restore exactly reproduces its baseline. An unrelated Spec Lock entry alongside the single exact receipt entry is accepted.

The updated external fixture patch passes **82 methods**, exit 0, with no replay helper imported. Its three new FIX7 methods yield **13 failures** against the prior validator with its scratch after-pin refreshed, proving sensitivity. Patch dry-run/application and full-file equality pass. The patch is not committed to the currently unallowed test path; it remains its own required commit in the same landing, after DL-413's allowance.

### Check 11

**50 variants × 113 isolated negatives = 5,650 passing cells**, plus all baseline negatives corroborated through `main()`. Every variant has its exact expected flip set, and every other negative retains at least one exact baseline rejection reason. Receipt, assessment and synthetic Spec Lock observational copies are refreshed for semantic cases. Anchor-integrity cases deliberately preserve the trusted anchor; their only failing byte condition is that anchor observation.

Existing named duplicate pairs remain: bridge/full-step before-link and live-after-link comparisons, root/state object rules, and canonical-member checks. `anchor-required` removes the single anchor observation's lookup/shape/cardinality/hash-access defenses together for absence/malformed-source controls; removing cardinality alone would merely stop at the same absent entry's hash access. The narrower exact-path, uniqueness and receipt-byte hash variants independently prove those new guards. The broad `bridge-all-links` case removes the entire byte bridge and its named step-link duplicates. No production guard is left weakened.

| New anchor guard weakened in scratch | Negatives that flip | Other negatives retaining their own reason |
|---|---|---:|
| `anchor-exact-path` | `anchor-elsewhere` | 112 of 113 |
| `anchor-unique` | `anchor-duplicate` | 112 of 113 |
| `anchor-receipt-hash` | `anchor-forged-full`, `anchor-repinned-full`, `anchor-stale-bytes`, `anchor-two-field`, `anchor-wrong-hash` | 108 of 113 |
| `anchor-required` | `anchor-duplicate`, `anchor-elsewhere`, `anchor-entry`, `anchor-files`, `anchor-forged-full`, `anchor-malformed`, `anchor-missing-entry`, `anchor-missing-file`, `anchor-repinned-full`, `anchor-root`, `anchor-ssot`, `anchor-stale-bytes`, `anchor-two-field`, `anchor-wrong-hash` | 99 of 113 |

The full fifty-variant table is in `CA-SEAL.md` and `guards/results/guard-matrix.json`; every row includes its exact flipped and retained sets.

### Recurring-defect sweep and remaining checks

| Item | Current evidence / limit |
|---|---|
| 1. Forged/contradictory inputs | All cycle-6 combined attacks reject under the unchanged trusted anchor; original state/list/row/depth/decision mutations rerun. The checker still does not prove historical registry truth. |
| 2. Storage metadata | No runtime Storage-assigned fields are added or changed. |
| 3. Historical reader behavior | Anchored intact-chain differential, all 125 calls and all twelve C4 controls are exact. |
| 4. Multiple interpretations | Exact path/hash equality with no coercion; upper-case, whitespace/LF, numeric and container controls reject. Existing strict member and recursive claim interpretations rerun. |
| 5. Schema refs | No schema or `$ref` is added or changed. |
| 6. Size limits | No event payload, stored-body size or externalization policy changes. |
| 7. Custody paths | Both legacy admission and holding call the anchored live bridge. Actual CLI, module, baseline/restore and step controls cover these paths. |
| 8. Masked negatives | Full 5,650-cell matrix, named duplicate groups, observed-pin refreshes and retained baseline reasons. |
| 9. Grade evidence | N/A → N/A; no family, runtime implementation or seal is graded. |
| 10. Numeric forms | `.0`, `e0`, fractional, overflow, signed exponent and quoted foreign claims rerun; raw `1`, `1.0`, `1e0`, `-0` and invalid `01` lock roots reject. No numeric hash/path is coerced into a string. |
| 11. Types | Null, booleans, string booleans/numbers, numeric types, arrays, objects, malformed/nested lock shapes and missing/duplicated entries are covered. |

Standing runtime checks 1–4, 6–7 and 10 concern family contracts outside this narrow checker change. Check 5 retains full-match and trailing-LF refusals; check 8 asserts admitted sets/holding/errors/pins rather than accepting an unrelated seal exit 1; check 9 adds no refs; check 11 is proved above.

| Verification | Result |
|---|---|
| Original Sol replay | Scenarios, all 26 claimant negatives, writer/sensitivity/numeric and legacy probes complete. Extended 5,880 comparisons exact; 880 malformed + 296 foreign/rejected step claimants refuse the step. The five superseded pair-only positive expectations still yield their original nonzero aggregate result. |
| New receipt classification | All 74 full new-predicate negatives reject; ten byte-link faults reject the old predicate, 64 unrelated semantic faults under matching fixture anchors preserve it; four extra chain/current-byte checks and writer byte identity pass. The two historical aggregate coupling assertions remain intentionally nonzero. |
| Astra and representation replay | 112 step scenarios (one complete true step accepted, all 111 mutations reject), ten parser scenarios, 122 representation cases, 1,112 raw legacy comparisons and 256 numeric coexistence comparisons complete. Original numeric/notes/current-byte actual CLIs rerun. |
| Repository shards | Exit 0: 99 sources, 3,092 shards, no failures. |
| PlanUnit index validation | Exit 1, top-level `status: fail`, 23 failures: 21 inherited ledger-shape errors, main-only DL-302, and readiness staleness from the absent ignored currentness edition. Every named input equals the requested pre-fix head; none names a changed path. This is not reported as a pass. |
| Syntax/scope/line endings | Only the bridge changes AST; five fix-round paths; all 2,010 lines CRLF; only the new receipt's after-pin changes; 268 protected files byte-identical; whitespace check passes. |

Replay setup issues are retained openly: the first original trace lacked an anchor because its temporary roots were outside the synthetic fixture helper's scratch root; the corrected fresh trace is 125/125 exact. An in-process replay's automatic fixture anchoring interfered with four new tests that intentionally preserve a stale anchor; standalone 82-method execution passes, and the three affected methods pass in a separate isolated invocation. One raw replay initially stopped on a fixture copy-order collision; deferring synthetic anchoring until copy completion corrected the harness and the full 1,112 comparisons then completed. These were fixture preparation fixes; production validator bytes never changed after `5c44eaf593`. No partial run supplies a compatibility count.

No full run-gates, governance audit, migration/landing check or reseal is claimed. Initial resources were 83 GB free disk and 15 GB available RAM; later checks remained above the 50 GB/6 GB stop thresholds. No pm-mail, subagent, admission record, Decision Log entry, registry append, main push, protected-file change or governance refresh occurred. The scratch trees and requested sparse worktree are removed after the pushed handoff and evidence copy.

### Pins and evidence

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL/fix7`. The manifest pins replay sources, exact outputs, fixture patch/full file and check logs.

| Artifact | SHA-256 |
|---|---|
| `fix7-summary.json` | `20a297626a333c017820e7906011882c553d1740e13d3adbe726782def54226c` |
| `differential-summary.json` | `04953363e1415d694131d63a54b4bb19c245f2e5151d30f7ee781abb7457884d` |
| `twelve-controls.json` | `99bc7286cff8579964fecd0e5ff5b17f9dede01b2a8dca87e75d43b37d9a3822` |
| `integrity-rejections.json` | `19dd8f5e7226b59404ce4dc0f622ae68a7dcc48b7a39b18c9d7aca500fcdf09b` |
| `forged-receipt-results.json` | `d8704276dd9a4a15cbb2eb550096cfc2d815bcd68e70850c25454539c535441d` |
| `anchor-cli-results.json` | `fb2b221408e54922f8d396b64a6cd31684b44e78f09716d725e7511eab5bcd3c` |
| `anchor-types-results.json` | `fe780d363e8f05010a7910d416cbcdd31b9af9e6cc61a460de1d22e34357be56` |
| `guards/results/guard-matrix.json` | `e09c85393e8851a52410e4234d42f9d077ae8829af6d5367d67208157b6aee4a` |
| `scope-audit.json` | `a718e61907a2d7c5fca70dc072e7facfe91a0e2511d63dfd2d337bc98e583c1c` |
| `repository-checks.json` | `386306c7bc3cc20f905c3b955bab0c00012d71caed35fb083e34569088e68aee` |
| `test-patch/test_event_authority_holding_bucket.dl412.patch` | `c502e0b27a253f0aeab55ed1d94fdbfe3d18b0cbb18117fc2c9ab0646ddbba11` |

**New validator SHA-256:** `743ca664bf8bff3482185c76c01345b6b4d30178b5c9574978868592da5f3dc6`. **Pending new receipt SHA-256:** `713ae2743ebb3a02d7500cd23c136e914d1ae0adc5f9cb5ebd8ef6d110c7d855`. The latter is not the landing Spec Lock value: `lander_task` is still null, and the reseal hashes the final receipt after the lander writer runs. Only the DL-412 entry template in the current landing contract is authorized; no DL-077 anchor is added.

**Family grades before → after:** N/A → N/A. **Ids used:** none minted; existing DL-412 authority only; DL-998/DL-999 remain fixtures. **Bindings:** none. **Open integration:** independent Sol/Astra review before/after landing, DL-412 and DL-413 prerequisites, actual lander/writer, claude-projects-refresh's exact final receipt anchor and the fixture patch as a separate commit in the same landing. Until the entry exists, legacy admission and holding fail closed on this tree. CA-SEAL-FIX7 is procedurally barred from applying the seal in both documents; the checked author/lander list remains unchanged.
