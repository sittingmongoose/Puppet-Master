# Step 9, batch 2: Jared's card answers recorded as DL-084 to DL-089 and applied to their 27 rows, 2026-09-25

Jared answered the six Step 9 batch 2 cards on 2026-09-25, from the card page (artifact `2rbEp1n7rdS3KnEwZCVpvz`, version 1): **Approve** on five, and no answer with added scope on Card 4. Source: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_STEP09_BATCH2.md`, SHA-256 `e224ff62776c277a7a763ed3b5f1ea259928290719180668b57bff386a59c2af`. The cards he answered are kept byte-identical as `step-09-batch2-orchestrator-cards-20260925.md` (SHA-256 `f1b6ddda...`) and `step-09-platform-cardinality-card-20260925.md` (`2dca8e3a...`).

Each approval is a Decision Log entry in DL-036 form, in both Decision Log sections, and has a line in `decision-responses.jsonl`. Approve means the card's recommended option, option 1 on every card. This branch registers nothing.

| DL | Card | Answer | What it decides | J248 rows |
|---|---|---|---|---|
| DL-084 | `EA-S09B2-CHILDRUN-RETENTION-001` | Approve (option 1) | The history of the 19 `subagent.*` child-run families is kept as long as the chat exists. The policy object is `RP-GOAL-THREAD-LIFETIME`, subject to Storage's reuse check against the Chat content class (250,000 records per thread with a successor roll). The card named that open point, so which count rule applies is a Storage owner follow-up, not decided | 19, back to technical work |
| DL-085 | `EA-S09B2-BOARD-RETENTION-001` | Approve (option 1) | The board still hides a message at 24 hours, and the stored message is kept with the coordination records, 180 days after the run finishes (`RP-COORDINATION-180D`) | 3, back to technical work |
| DL-086 | `EA-S09B2-DIAGNOSTIC-RETENTION-001` | Approve (option 1) | `phase.force_completed`, `config.validation.failed` and `parser.error` are kept one year after the run finishes (`RP-RUNTIME-365D`) | 3, back to technical work |
| DL-087 | `EA-S09B2-CREW-HISTORY-001` | No answer; scope added | Reserved and not written. Jared wrote: "no answer \| retire them but register the shared collaborative workflow events, so adding scope to this." The entry and the six crew lifecycle rows wait for his answer to the Card 4 addendum | 6, unchanged, still carded |
| DL-088 | `EA-S09B2-SPAWN-REQUEST-001` | Approve (option 1) | `subagent.spawn_requested` and `subagent.spawn_completed` are retired | 2, excluded |
| DL-089 | `EA-S09-PLATFORM-CARDINALITY-001` | Approve (option 1) | The application-scoped evaluations of `platform.capability_evaluated` are counted in an application-wide bucket of their own under `RP-OPERATIONAL-2555D`. It has the same 2,000,000 cap, fail-closed overflow and seven years as DL-083's bucket, counted apart from it. Project-scoped evaluations keep per-project counting | none (a registered family) |

The seven coordination rows had no card. They stay technical work under DL-045 and are not touched here.

## Campaign count

| | When the cards were presented | After this branch |
|---|---:|---:|
| Registered | 0 | 0 |
| Excluded | 7 | **9** |
| Carded (waiting for an answer) | 33 | **6** |
| Remaining technical work | 212 | **237** |
| Total | 252 | 252 |

The last count row on `main` is batch 1's (0, 7, 0, 245). Presenting the batch 2 cards put 33 of the 40 batch 2 rows on cards without a count row of its own. `step-09-procedure-20260924.md` now has a row with the count after this branch, marked as not landed and to be amended when Card 4 is applied.

## What changed in the rows

All changes are in `Plans/.audits/event-authority-2026-08-12/`, following batch 1 (`8750b56e2f`, landed at `41fbecb612`):

- **The 25 retention rows** (DL-084, DL-085, DL-086) stay `KEEP_QUARANTINED` and go back to technical work with their retention choice settled:
  - The rationale keeps its DL-039 interim text, which now ends with the answer and its application.
  - The `retention` evidence cell is `PASS`, with the Decision Log entry as its citation. It was `FAIL` in 7 rows (`subagent.completed`, `failed`, `cancelled`, `message_received`, `context_warning`, `budget_warning`, `escalated`) and `OWNER_REQUIRED` in 15.
  - The 3 board rows were already `PASS`, on the 24-hour rule. Their cell stays `PASS`, but it now rests on DL-085, which reads the 24-hour rule as board visibility, not byte retention. The old citation is kept in `citations_checked`.
  - New `citations_checked` entries name the answer, the policy object's registry line and Storage's class line. No other evidence cell changes, and `bucket`, `cohort_pins`, `phase1_application` and `provisional` are unchanged.
- **The 2 spawn rows** (DL-088) move from `KEEP_QUARANTINED` to `RECLASSIFY_TO_EXCLUDED` as retired, following the procedure's "Per exclusion":
  - The rationale is replaced with the exclusion text.
  - The legacy `confirmed_persisted_unregistered` bucket and the `july248` cohort pin are kept, and no denominator removal is claimed.
  - No evidence cell changes, as for `task.failed` in batch 1.
- **`individual-disposition/LEDGER.jsonl` and `census-adjudication/LEDGER.jsonl`**: the same 27 lines are rewritten from the row objects, keeping each file's own serialization and each line's CRLF ending. On the census lines, the disposition changes for the two exclusions only. The card copy and the application record are added to `evidence_refs`, the answer and its policy lines to `source_citations`, and a sentence to `notes`. No other line changes.
- **Not changed:**
  - `OWNER_VETOES.jsonl`: the batch 2 cards were presented from the evidence map, so no batch 2 row was ever set to `NEEDS_OWNER_VETO` and there was no veto to remove. It stays empty.
  - `COVERAGE.json`: a stale 2026-09-11 snapshot, left as the earlier landings left it.
  - The 6 crew lifecycle rows and the 7 coordination rows: byte-identical, with their SHA-256 in the record.

**Why the retention cells cite the Decision Log.** Batch 1 set these cells to `PASS` once the answer settled retention, but there the owner text already carried the assignment (`Plans/Runtime_Artifacts_Panel.md:2472`, `Plans/storage-plan.md:17260`) and the cell cited it. Here none of the owner edits is written yet. So each cell cites its Decision Log entry, and its note says that the Storage assignment and the family contract's structured `retention_policy_ref` are still to be written. The frozen validator accepts any `Plans/` citation for a `PASS`. The Step 8 depth rubric is stricter: a retention cell passes only when owner text binds the policy. If the coordinator wants the J248 cells held to that rule too, these 25 cells go back to their earlier status until the owner edits land. That is the one judgment in this application.

The application record `step-09-batch2-card-answer-application-20260925.json` (SHA-256 `f71b2c790a5d18241d5be13ea11216d451d5fd291372134797741451bf46d940`) lists, for every row, the before and after SHA-256, the disposition and the retention cell. It also gives the before and after hash of each ledger file, the SHA-256 of the 13 untouched batch 2 rows, and the base (`1e5d9b097b`) and branch SHA-256 of every other file the branch changes: the Decision Log, its shards, the plan index, the response file, the two card copies and the procedure record. It records the five answers with their pending owner edits, and Card 4 as not applied.

## Owner follow-ups

Each comes from the card's "Owner edits if approved" line for option 1. None of them is done on this branch, which edits only `Plans/Decision_Log.md` among the Plans documents.

1. **DL-084, Storage with Contracts and Orchestrator.**
   - The Storage retention table (Case L-3, after `Plans/storage-plan.md:17277`) assigns the chat lifetime to the 19 families, as DL-075's line does for runtime artifacts.
   - Storage runs the DL-045 reuse check. Either it binds `RP-GOAL-THREAD-LIFETIME` as it stands (no count cap), or it materializes the Chat content class (250,000 per thread, successor roll) with the same lifetime. Either way it says which count rule applies to a very busy chat.
   - Each of the 19 family contracts carries the structured `retention_policy_ref` and says how its history goes with the chat.
   - CV-267, CV-268 and CV-269 and the orchestrator's child-run section cite DL-084.
2. **DL-085, Orchestrator with Storage and Contracts.**
   - The board lifecycle's "archived or deleted" (`Plans/orchestrator-subagent-integration.md:4587`, and the lifecycle text at 3865-3869) becomes "archived".
   - Storage binds `RP-COORDINATION-180D` for the three board families in its coordination family and retention table. Adding the `crew.*` keys there is the K1 placement the cards' technical companion lists as technical work.
   - The Contracts board rows carry the retention reference.
3. **DL-086, Storage with Orchestrator.**
   - The Storage retention table and the three family contracts bind `RP-RUNTIME-365D`.
   - The orchestrator reconciles "first 500 characters" with "All raw output is preserved" (`Plans/orchestrator-subagent-integration.md:1222`, `1226`).
   - The companion also lists, as technical work, the two payload branches of `config.validation.failed`.
4. **DL-088, Contracts with Run Modes.** This removes accepted text.
   - Contracts removes the two names from the payload sentence at `Plans/Contracts_V0.md:1469`, from the envelope sentence at 2983 (keeping its `chat.subagent_*` alias clause), from CV-116 (its third acceptance criterion and two tokens) and from CV-266 (its second criterion, the clause in its canonical text and two tokens).
   - Run Modes adds one clarifying sentence to the crew queue row (`Plans/Run_Modes.md:195`), in its own words.
5. **DL-089, Storage retention.**
   - The owner extends the SP-291 aggregate custody text (`Plans/storage-plan.md:23565`) with a second application-wide bucket for the application-scoped evaluations of `platform.capability_evaluated`, with no new policy object and no `RP-OPERATIONAL-2555D` value changed.
   - **DL-083's own SP-291 edit, the bucket for `storage.boot_recovery`, `storage.recovery_applied` and `storage.compaction_lifecycle_changed`, is still pending.** Line 23565 still says the seam is "an unproved policy-owner adapter seam". DL-089 extends that edit, so the two buckets are best written in one owner edit.
   - The companion adds that the newtools N2-157 and SP-290 text cite it.
   - After that edit, the family's retention cell in the Step 8 depth assessment can leave `PARTIAL`. The assessment's `platform.capability_evaluated` row still says the application-scoped count "stays open for Jared". Its gap text is not updated on this branch, as the DL-079 to DL-083 application did for its rows; that update is left to be scheduled.

## Checks (worktree at the branch state, base `origin/main` `1e5d9b097b`)

- **Shards.** Regenerated with the ignored currentness edition symlinked in. Only the `decision_log` shard tree and `Plans/.plan_index` changed. The check passes for 99 documents and 2,722 shards.
- **Index.** `pm-plan-index.py generate` and `validate` pass with 0 failures. PlanUnits go from 6,728 to 6,733 (DL-084, DL-085, DL-086, DL-088, DL-089) and acceptance units from 26,260 to 26,275. The 80 existing Decision Log units change only their source location and document hash. The node readiness report's summary is unchanged.
- **Decision Log text.** Each entry's Name through Recommendation equals the presented card's lines exactly, blank lines aside, and each first line is the required sentence. Every new PlanUnit parses, has DL-083's fields in DL-083's order, and carries every preserved token in its `canonical_text`. No DL-087 heading exists.
- **Rows.** `verify_application.py` checks the row files against the base:
  - exactly the 27 row files changed, and 27 lines in each ledger, with line endings kept;
  - only the permitted fields changed;
  - each individual-ledger line equals its row object;
  - the 13 untouched batch 2 rows are identical;
  - every hash in the record matches.
- **Tests.**
  - `test_event_authority_holding_bucket`: OK (34 tests).
  - `test_pm_emit_only_event_boundaries`: OK (13 tests).
  - `test_pm_pnc019_currentness`: one failure, `test_current_event_authority_audit_rehashes_cleanly_and_remains_open`. It lists the same four source-drift rows as at the base: `Plans/Decision_Log.md`, `Plans/Goal_Runtime_System.md`, `Plans/Section15_MVP_Promoted_Features_Spec.md` and `Plans/storage-plan.md`. This is currentness drift, and the currentness edition needs the designated Plans agent's reseal.
- **Currentness validator** (`pm-event-authority-currentness.py validate`, read-only, with an explicit `PM_EVIDENCE_MAP`): 13 of 14 checks true. `all_live_sources_rehashed` is false for the same drift. `quarantined_252_exact_set_and_custody` is true.
- **Not run, by instruction:** the independent validator and `pm-implementation-readiness.py generate`. The landing check belongs to the landing.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09-batch2-answers-checks-20260925/`. Its `SHA256SUMS` (SHA-256 `1fa65687a8c985c2ee3d753665489c2060fd3fb000464f59f376abccae0e7588`) covers:
- the scripts that extracted the card text, wrote the entries, the response rows and the row application, and verified them;
- the check outputs and exit codes;
- the same checks at the base;
- a copy of the answers file.

## Limits and open items

- **Retention cells.** They cite the Decision Log, not owner text, as explained above.
- **Exclusions.** The frozen disposition schema has no J248 exclusion category, so the two excluded rows keep their legacy bucket and cohort pin, as the seven earlier exclusions do. No denominator removal is claimed.
- **Reseal.** Landing adds governance staleness for `Plans/Decision_Log.md`, its shards and the index rows of its units, which the designated Plans agent's reseal owes: the currentness edition, Spec Lock and the evidence and readiness rows.
- **Another branch touches the index.** `plans/ea-s09-coordination-prep-20260925` edits `Plans/orchestrator-subagent-integration.md` and `Plans/Contracts_V0.md` (OSI-438, CV-353) and also regenerates `Plans/.plan_index`. Whichever lands second rebases and regenerates the index; it is never hand-merged.
- **Nothing else changes.** This records planning canon and the campaign rows only. It admits, registers and retires nothing in the registry, and it changes no owner contract, retention policy, validator, receipt or governance artifact.
