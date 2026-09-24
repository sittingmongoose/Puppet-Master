# The five depth-grading answers, recorded as DL-079 to DL-083 and applied to the depth assessment, 2026-09-24

Jared answered the product cards from the Step 8(a) depth grading (`step-08-depth42-product-cards-20260924.md`) on 2026-09-24. He approved four and gave no answer to one, with a reason. Source: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260924/ANSWERS_DEPTH_GRADING.md`, SHA-256 `cfea2eb818663d22eba69dca9296657aa05c51383a470bc1796b87aef65b923c`.

Each answer is a Decision Log entry in DL-036 form, in both Decision Log sections, and has a line in `decision-responses.jsonl`. Approve means the card's recommended option, as the DL-036 form defines it.

| DL | Card | Answer | What it decides |
|---|---|---|---|
| DL-079 | `EA-S08D-GOAL-RECORD-EVENTS-001` | Approve (option 1) | `goal.evidence_captured`, `goal.receipt_recorded` and `goal.tool_check_recorded` become read-only history, in the pattern of the four retired on 2026-09-12 (GRS-069 to GRS-072 with SP-300 to SP-303) |
| DL-080 | `EA-S08D-GOALRUN-LIFECYCLE-EVENTS-001` | Approve (option 1) | `goal_run.blocked`, `goal_run.replanned` and `goal_run.stopped` get current events: stopped and blocked first, replanned after the Replan v8 source work, which is therefore needed (not scheduled here) |
| DL-081 | `EA-S08D-VERIFICATION-EXCEPTION-001` | Approve (option 1) | The verification exception route stays. The user who owns the project approves each exception through the existing approval flow, naming the residual risks, and the finish is labelled "completed with approved verification exception" |
| DL-082 | `EA-S08D-PLATFORM-CATALOG-001` | No answer | Deferred to build time, with Jared's reason verbatim. It is not an approval of option 1. The catalog is filled in right before Puppet Master is built, as part of the building process and likely as one of the worknodes; `platform.capability_evaluated` stays registered and dormant |
| DL-083 | `EA-S08D-OPERATIONAL-CARDINALITY-001` | Approve (option 1) | Application-wide records of the three Storage families the card named count in one application-wide bucket under `RP-OPERATIONAL-2555D`, with the same cap and overflow rule. Platform's application-scoped evaluations sit on the same seam but were not on the card, so they are not covered; that part stays open for Jared |

## What the answers change in the depth assessment

No grade and no disposition changes. Every answer decides what owner work is left, and the rubric grades owner text:
- a family is HISTORICAL_ONLY only where an owner unit prohibits current writes and defines its reader;
- a current writer needs its contract;
- a retention cell passes only when the owner text binds the policy.

So the totals stay 335 PASS, 144 PARTIAL, 13 CONFLICT and 12 ABSENT, and the dispositions stay 27 current writers, 7 historical-only and 8 without a current disposition.

What changes is the text of 11 rows (`step-08-depth42-card-answers-20260924.json` lists each row's gaps and notes before and after):

| Rows | Change |
|---|---|
| `goal.evidence_captured`, `goal.receipt_recorded`, `goal.tool_check_recorded` | The product gap is answered (DL-079). The "if retained" branch is dropped, and the "if retired" branch becomes the owner work. A note says the disposition waits for the historical contract. |
| `goal_run.blocked`, `goal_run.replanned`, `goal_run.stopped` | The product gap is answered (DL-080). The "if retired" branch is dropped, and the "if current" branch becomes the owner work. `goal_run.replanned` names the Replan v8 package. A note says the disposition waits for the current contract. |
| `goal.completed` | The verification-exception gap is answered (DL-081) and becomes owner work, the route contract. |
| `platform.capability_evaluated` | The catalog gap is recorded as deferred (DL-082), with the worknode follow-up. The cardinality gap and the retention finding now say that DL-083 does not cover this family, because the card Jared answered named only the three Storage families; that part stays open for Jared, and the retention cell stays PARTIAL. |
| `storage.boot_recovery`, `storage.recovery_applied`, `storage.compaction_lifecycle_changed` | The cardinality gap and the retention finding are answered (DL-083), and the retention cells stay PARTIAL until the owner edit. |

The assessment's MD says the same things where it listed these questions:
- the Result summary;
- "What is left" items 7 and 8;
- the Step 8(b) Replan bullet;
- "Product questions this grading surfaced, and their answers".

The card file is kept as presented, with its status line and blank Answer lines, as the DL-068 to DL-075 cards are. Review fix G-01 (`fb7e6a2877`) had added a Platform sentence to card 4 after the cards were published. That sentence was never on the page Jared answered, so the file is restored to the presented bytes (SHA-256 `193f481dd79112c81eda3a98b497c6d505f7e4e06ea5402311e8aed49f38d90f`), and all five response rows pin them. Card 3 said the platform event meets 11 of 12 criteria. Review G-01 later lowered its retention cell to PARTIAL for the application-scoped count that card 4 covers, so the assessment shows 10 of 12.

**Re-anchored citations.** The branch was rebased onto `main` `ac9c0ad2e4`, which carries DL-077 and DL-078, and this recording inserts DL-079 to DL-083. Both sit above the DL-076 PlanUnit, so its line moved from 5775 to 5997 in `Plans/Decision_Log.md`. The three evidence items that quote it now cite line 5997:
- `workspace.layout_changed`, consumers;
- `workspace.layout_changed`, oracles;
- `browser.workspace.reset`, consumers.

So does the MD's table of lowering rules. The quoted bytes are unchanged, and all quotes verify exactly against this branch (2,633 after the review cycle 2 repairs).

## Owner follow-ups

These are left open and not done here. None of them edits a document on this branch, which edits `Plans/Decision_Log.md` only.
1. **DL-079, Goal Runtime with Storage.** Write a current-writer prohibition and an assigned historical reader for each of the three families (`Plans/Goal_Runtime_System.md`, `Plans/storage-plan.md`).
2. **DL-080, Orchestrator and Executor with Goal Runtime and Storage.** Write the full current contracts: `goal_run.stopped` and `goal_run.blocked` first, then `goal_run.replanned` after the Replan v8 source work, which needs its own go.
3. **DL-081, Goal Runtime and the Workflow certification owner with Human-in-the-loop.** Write the exception route contract: the approval request, the approver, the waivable residual risks and the receipt.
4. **DL-082, whoever owns the worknode work.** Fill the Platform capability catalog right before Puppet Master is built, as part of the building process, likely as a worknode. Each entry needs owner-cited evidence, an evaluation contract and tests.
5. **DL-083, Storage retention.** Write the application-wide bucket for `storage.boot_recovery`, `storage.recovery_applied` and `storage.compaction_lifecycle_changed` into the SP-291 policy text (`Plans/storage-plan.md` 23548), replacing the "unproved policy-owner adapter seam" statement for them, together with the units that route those families to `RP-OPERATIONAL-2555D`. Platform's application-scoped evaluations wait for Jared's separate answer.

Follow-ups 1, 2 and 5 edit `Plans/Goal_Runtime_System.md` or `Plans/storage-plan.md`. Their plan-sharding evidence rows exceed the landing check's print cap, so those landings wait for the landing-check exports repair.

## Checks (worktree at the branch tip, base `main` `ac9c0ad2e4`)

- **Shards.** Regenerated with the ignored currentness edition present; the check passes for 99 documents and 2,722 shards. Only the `decision_log` shard tree changes.
- **Index.** `pm-plan-index.py generate` and `validate` pass with 0 failures. PlanUnits go from 6,723 to 6,728 (DL-079 to DL-083) and acceptance units from 26,241 to 26,257, and only `Plans/Decision_Log.md` units change. The node readiness report's runtime status is unchanged from `main`.
- **YAML.** Every new PlanUnit block parses, and every preserved token occurs in its unit's `canonical_text`.
- **Assessment.** It was recompiled from the batch rows: 42 families, all quotes exact (2,630 when the answers were applied, 2,633 after the review cycle 2 repairs), and the totals and dispositions as above. The builder of the JSON record fails if any cell status, evidence list or disposition of the 11 rows differs from before.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-08-depth42-card-answers-20260924/`, whose `SHA256SUMS` (SHA-256 `6c75b0a84efb2e96c8de5f8e1b7d719166dc376ed14f82214ca80299e88880d7`) covers:
- the 11 rows before and after;
- the scripts, and the Decision Log texts they insert;
- the assessment JSON before the answers (`078d64bb5ec40c18308a342999962d8ac2cdb5fe439bf8d1b087abdf793ee1b9`, after review fix G-08), after them (`ff7dbd59b678aa53f311e5c6727ea5835e2a03c398d9b5d4639d52957f73e30e`), and after the review cycle 2 repairs (`ba9b84f99e0e0761a8b435a16602d4c88d14589ef273f789fd5b92bdbd5849fd`);
- a copy of the answers file.

This records planning canon only. It admits, retires and registers nothing, and it changes no registry row, owner contract, retention policy or governance artifact.
