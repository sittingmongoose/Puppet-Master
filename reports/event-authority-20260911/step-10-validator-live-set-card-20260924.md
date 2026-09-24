# The seal check and families admitted after August

Card ID: `EA-S10-VALIDATOR-LIVE-SET-001` (two items)

Status: **QUEUED_UNANSWERED**. Prepared 2026-09-24 for the coordinator to present in Jared's card form. It records no answer, changes no validator, registry, checkpoint or seal condition, and does not re-ask anything answered in DL-035, DL-036, DL-039 or DL-040 to DL-076.

Owner: Plan To Node Compilation (PNC-019, the seal) with Storage (the event family registry). Affects Step 10 and every Step 9 registration.

## Item 1: the frozen seal check

**Name:** Letting the seal check accept families you approved after August.

**Question:** The frozen Event Authority seal check only accepts the 37 original families plus the two August ones, so should it be amended the way Step 3 amended it, to also accept a family you admitted later when that family has a complete admission record, or should the seal condition in DL-039 change instead?

**Why:** On 2026-09-10 (DL-039) you made the seal conditional on the independent seal check (`Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py`, frozen 2026-08-12) passing without modification. That check requires the registered families beyond the original 37 to be exactly the two August families (lines 433 to 437, failure `unexpected_august_set`). Since then you approved three more admissions: context compaction completion (DL-040) and the Browser workspace created/reset pair (DL-046). The unmodified check now fails on exactly those three, and it will fail again for every family Step 9 registers. Its record format also has no place for an admitted family that started among the 252 quarantined rows, so the compaction family's old row still reads "needs more evidence" and fails a second rule (`individual_dispositions_evidence_gap_blocking`). No amount of contract work can make the unmodified check pass. Step 3's author already recorded this limit on 2026-09-11 and left it alone, because your permission covered only the holding-bucket change.

**What you get (option A):** The seal check keeps every rule it has today. It additionally accepts a family registered after August only when that family has an admission record: your decision entry, the registry revision and hash before and after, and a current depth assessment with all twelve criteria passing. A family without one still fails. The same guard as Step 3 applies: whoever writes and lands the amendment cannot be the one who applies the seal, it ships with a written receipt, and it gets a blind review.

**What it costs:** A second change to a check you froze, so it has to be done carefully and reviewed. The three families already admitted need admission records in the new form; compaction's existing Step 6 record and the Browser landing records are the starting point. The amendment itself makes nothing pass: the depth, denominator and other failures stay until the work closes them.

**Options:**

1. **A: Amend the check with a receipted change like Step 3's (recommended).** It accepts post-August admissions only through complete admission records, fails closed otherwise, and is written by someone who will not apply the seal.
2. **B: Change the seal condition instead.** Keep the check frozen, and let the seal proceed when every failure it reports is on a list of failures you have explained and accepted. The check stays byte-identical, but "passes" becomes "fails only in accepted ways", which is weaker and easier to get wrong.
3. **C: Another rule.** For example, write a new check alongside the frozen one and seal on the new one. Say what you want.

**Recommendation:** A. It keeps the check honest for every family, including the ones you admitted after August, and it follows the procedure you already approved once.

**Answer:** ____________________

## Item 2: approving the checkpoint for each Step 9 registration

**Name:** How each Step 9 registration updates the approved checkpoint.

**Question:** When Step 9 registers a family, should each new registry revision wait for your own checkpoint approval, or should a registration that has passed the full Step 9 procedure move the approved checkpoint in the same landing?

**Why:** The seal compares the live registry against a checkpoint you approve: the registry revision and its family count, pinned in `scripts/pm_pnc019_currentness.py` (now `2026-09-11.2`, 42 families). You approved the last two by hand (Step 4 on 2026-09-11 and Step 8 on 2026-09-23). Every registration adds a family, which changes the revision and the hash, and readiness then reports "checkpoint changed, needs fresh approval" until you approve again. Up to 245 rows are still open, and many of them may end registered.

**What you get:** With option 2, each registration still needs everything Step 9 already requires: its full contract, a blind review, its own Storage admission landing (one family per landing) and the coordinator's landing go. The checkpoint constants, their provenance comment and the two test pins move in that same landing, and a Decision Log entry records the new revision under the standing rule. You see each one in the landing record and can revoke the rule at any time.

**What it costs:** You would no longer look at each checkpoint change before it happens, only in the record afterwards. With option 1, each registration waits for one more answer from you. With option 3, readiness shows a stale-checkpoint failure between your batch approvals.

**Options:**

1. **One approval per registration.** You approve every checkpoint change, as for Step 4 and Step 8.
2. **Standing rule (recommended).** A registration that passes the full Step 9 procedure moves the checkpoint in its own landing, recorded as a Decision Log entry citing the rule.
3. **Batch approvals.** Registrations land as they are ready, and the checkpoint moves only when you approve a batch, for example once per owner batch.

**Recommendation:** Option 2. Every protection that matters stays per family (contract, review, one family per landing). Only the bookkeeping step stops waiting on you.

**Answer:** ____________________

## What this card does not do

It registers no family, changes no validator or checkpoint, and changes no seal condition until an answer is recorded and applied. The seal still also needs the denominator closed, contract depth complete for every registered family, the review queues settled and the other seal-check failures cleared.

Evidence: the frozen check's SHA-256 is `bd54afffc689146753daec474d6cdbc7ac663afaf21d842aad4fcf10255112d5`. On `main` at `f1ce058ccd`, the unmodified check reports six failures: `unexpected_august_set`, `fresh_census_denominator_not_closed`, `individual_dispositions_owner_veto_blocking`, `individual_dispositions_evidence_gap_blocking`, `individual_dispositions_provisional` and `registered_contract_depth_incomplete`. Step 9 batch 1 (branch `plans/ea-step09-card-answers-20260924`) removes the owner-veto one. The receipts are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step09-card-answers-20260924/`. The Step 3 limit is recorded in `step-03-validation.md` ("Out-of-scope limitation"), and the Step 6 representation limit in `step-06-registration-application.json` (`representation_limit`).
