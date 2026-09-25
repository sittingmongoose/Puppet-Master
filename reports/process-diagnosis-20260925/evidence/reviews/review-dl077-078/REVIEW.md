# Blind review: DL-077 and DL-078 (branch plans/ea-seal-check-decisions-20260924)

Branch tip: `705d823031`. Base: `792d2fb8b1`. Reviewed on 2026-09-24 from the bytes.

**Verdict: fix_then_land.** 12 findings: none blocking, 5 should_fix, 7 notes. Each finding is in `findings.jsonl` in this directory.

## What holds

- **Correct options recorded.** DL-077 records item 1 as Approve (A). DL-078 records item 2 as Approve (option 2). This matches `ANSWERS_SEAL_CHECK.md`, whose SHA-256 `afdbdd4e...cdb` I recomputed and confirmed. The attribution ("Answered on 2026-09-24 by Jared, in conversation with the coordinator, from the card page") matches the answers file.
- **SourceRef resolves.** It points to the answers file, whose hash matches. The card and the procedure record both exist on the branch.
- **Decision form followed.** Both entries use the DL-036 form (Name, Question, Why, What you get, What it costs, Options, Recommendation, Answer) in the style of DL-068 to DL-075.
- **Well-formed PlanUnits.**
  - ids, `owner_doc: Plans/Decision_Log.md`, `unit_type`, `status` and `node_compile_hint` all follow precedent: owner_decision_record, no WorkNodes, no NodeSeeds.
  - `gui_related: false`.
  - Negative constraints are present, and no runtime behavior is admitted.
- **Facts checked against the repo.**
  - The validator is tracked, and its hash matches the card (`bd54afff...`). The failure `unexpected_august_set` is at lines 433 to 437.
  - The checkpoint constants on main are `2026-09-11.2` and 42, matching the 42 families in the registry.
  - The two test pins exist: `test_pm_testing_session_events.py:82` and `test_pm_github_project_integration.py:254`.
  - The Step 4 command sequence (readiness, plan-index, readiness) matches the Step 4 and Step 8 receipts.
  - The step list's hash `85dde9aa...` matches both the ignored file and the copy in Evidence.
- **Procedure record states DL-078 faithfully.** The standing rule, its preconditions, the scope limit and the ability to revoke it all match. It also restates the Step 9 list correctly (outcomes, one family per landing, no bulk or sibling inference, no silent quarantine). The only problem is the review step (D-05).
- **Scope.** The branch touches only `Plans/Decision_Log.md`, `Plans/_shards/decision_log/**`, `Plans/.plan_index/**` and three files under `reports/event-authority-20260911/`.
- **Derived files and validation**, run on a scratch export of `705d823031`:
  - `pm-shard-plans.py --check` passes: 2,722 shards, 99 sources.
  - Regenerating the shards and the index reproduces the committed files byte for byte, except `generated_at_utc`.
  - The index changes affect only the 75 Decision_Log units: 73 location and hash shifts plus the 2 new units.
  - `pm-plan-index.py validate` reports status pass, 0 failures, 6,723 PlanUnits and 26,241 acceptance units. It shows no cycles (`true_cycle_component_count 0`, `cycle_blocker_count 0`) and `unresolved_reference_count 0`. For this run, `origin/main` in the scratch repository held only base `792d2fb8b1`'s `plan_units.jsonl` (6,721 units).
- **Landing.** `origin/main` has moved 2 commits to `aa38fc0454`. Both touch only `reports/landing-checks/**` and `reports/governance-reseal-20260924/`, so they do not overlap this branch. The card is byte-identical to the copy on `plans/ea-step08-depth42-20260924` (f714842ef8), so whichever branch lands second rebases cleanly.

## Exact edits (should_fix)

After these edits, regenerate with `pm-shard-plans.py --generate --config Plans/sharding_config.json` and then `pm-plan-index.py generate`, and commit the derived files with the edit.

1. **D-01**, `Plans/Decision_Log.md` line 1523 (DL-077 Why). Replace
   `Jared has since admitted \`context.compaction.completed\` (DL-040) and \`browser.workspace.created\` and \`browser.workspace.reset\` (DL-046)`
   with
   `Since then \`context.compaction.completed\` was admitted in Step 6 under DL-039 and DL-040, and \`browser.workspace.created\` and \`browser.workspace.reset\` in their own Storage admission landings under DL-046`
   Reason: DL-046, at line 624, says "admits no event".

2. **D-02**, what the admission record cites.
   - Line 1525 and DL-077 canonical_text (line 5887): change "the Decision Log entry that admitted it" to "Jared's decision entry for that family". These are the card's words ("your decision entry") and the answers file's words ("Jared's decision entry").
   - Add this sentence after the checkpoint bullet list in DL-078's standing-rule paragraph (line 1571), in DL-078's canonical_text and in procedure record step 2: "The Decision Log entry each such landing adds names the family and is the decision entry its DL-077 admission record cites."
   - If the coordinator does not read item 2 as covering that, record it as an open question for Jared instead.
3. **D-03**, DL-077 AC3 (line 5900). Replace it with
   `- Admission records in the new form exist for context.compaction.completed, browser.workspace.created and browser.workspace.reset, each carrying its current depth assessment; the check fails closed for any of them whose assessment does not show all twelve criteria passing.`
   In line 1541, replace the second sentence with
   `The three families already admitted after August need admission records in the new form, and the check fails closed for each until its record shows all twelve criteria passing.`
4. **D-04**. Add `  - reports/event-authority-20260911/decision-responses.jsonl` as the first `validation_surfaces` entry of DL-077 (line 5902) and DL-078 (line 5960), as in DL-068 to DL-075.
5. **D-05**, `reports/event-authority-20260911/step-09-procedure-20260924.md` line 21. Replace step 5 with
   `5. Before landing, one blind form-driven review runs, dispatched by the coordinator. One bounded repair round addresses its blocking findings, and a re-review limited to the rows the repair touched finds no blocking finding; findings still standing after that are written down as open questions (DL-066's bound, applied here to Step 9 batches). A batch with an unrepaired blocking finding does not land.`
   Reason: DL-078 moves the checkpoint without Jared's approval for any registration that passed this review, so the review has to be as strong as DL-066's.

## Optional (notes)

- **D-06:** Add `unexpected_august_set` to DL-077's canonical_text, or remove it from the token registry.
- **D-07:** Present the readiness regeneration and the SHA-256 in DL-078 as procedure following the Step 4 and Step 8 precedent, not as part of the answer. Confirm this against the CLAUDE.md rule that reserves readiness artifacts to the designated Plans agent.
- **D-08:** At line 1539, write "DL-039's 'passes without modification' is read as passing with only the DL-039 holding-bucket change and this amendment" in place of "DL-039's seal condition now reads:". Name the Step 08 depth matrix as the source of the twelve criteria.
- **D-09:** The card still shows QUEUED_UNANSWERED. This is consistent with precedent, and a status line can be added after depth42 lands.
- **D-10:** Land batch 1 first, or mark as pending the batch-1 file reference (line 40) and its count row (line 55).
- **D-11:** Set depends_on to `[DL-039, DL-045, DL-046]` for both units.
- **D-12:** Line 1521: change "a family you admitted later" to "a family Jared admitted later".

## Reviewer conduct

I ran one command that wrote to the shared checkout, which was a mistake: `git fetch -q origin` in `/mnt/Cursor/PuppetMaster`. It updates remote-tracking refs and objects only, not the working tree or the index. Everything else was read with `git show`, `git diff` and `git ls-tree`. All other writes went to this directory: an export of `705d823031` without `Concepts`, with its own scratch git repository. That repository's `origin/main` held only the base `plan_units.jsonl`, for the retention check. I deleted the export afterwards; `git archive 705d823031` recreates it.
