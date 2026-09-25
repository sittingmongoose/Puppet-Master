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

## Second application: Card 4, its addendum, question 4 and the host ruling on the retention cells, 2026-09-25

This section is added after the first application above, which stays as it was written. Where they differ, this section is current. It is recorded in the application record under the new key `card4_and_retention_ruling_application`. The record's earlier content is byte-identical.

Jared's answers:

| DL | Question | Answer | What it decides | J248 rows |
|---|---|---|---|---|
| DL-087 | `EA-S09B2-CREW-HISTORY-001` (Card 4) | No answer; he wrote "retire them but register the shared collaborative workflow events, so adding scope to this." | The six crew lifecycle events are retired, which is the substance of option 1 in his own words. The added scope is DL-090 to DL-092 | 6, excluded as retired |
| DL-090 | `EA-S09B2-COLLAB-EVENTS-001` (addendum 4a) | Option 2, written in the note with no radio button selected | All 17 names of `Plans/Collaborative_Workflows.md` section 13 are to be registered, one family per landing, under a separate bounded technical-binding permission on DL-045's terms, as DL-046 did. New scope outside the 252 | none |
| DL-091 | `EA-S09B2-COLLAB-FAILED-001` (addendum 4b) | Approve (option 1) | Section 13 gains `collaboration.failed`, registered under DL-090's permission, whose exact list is therefore 18 names | none |
| DL-092 | `EA-S09B2-COLLAB-RETENTION-001` (addendum 4c) | Approve (option 1) | The events of DL-090 and DL-091 are kept as long as the chat exists, DL-084's lifetime and the same Storage reuse check. This covers the recorded events only | none |
| DL-093 | The host's question 4 (review question D-02, for the seven coordination admissions) | "4 i approve" | The Decision Log entry each registration landing of the seven coordination families adds is Jared's decision entry for that family in the DL-077 sense. D-02 stays open for every other Step 9 registration | none |

Sources: `ANSWERS_STEP09_BATCH2.md` (`e224ff62...`), `ANSWERS_CARD4_ADDENDUM.md` (`b09b2afd...`) and `ANSWERS_OPEN_QUESTIONS.md` (`678b9a32...`), all in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/`. The answered addendum is kept byte-identical as `step-09-batch2-card4-addendum-20260925.md` (`295f17d7...`, artifact `QaLQRPQHwhsqQnNeRQ6g1z` version 1).

### Campaign count

| | After the first application | After this one |
|---|---:|---:|
| Registered | 0 | 0 |
| Excluded | 9 | **15** |
| Carded (waiting for an answer) | 6 | **0** |
| Remaining technical work | 237 | 237 |
| Total | 252 | 252 |

The ledger agrees. Among the 252 July cohort rows, less `context.compaction.completed`, which is outside the 252, there are 237 `KEEP_QUARANTINED` and 15 `RECLASSIFY_TO_EXCLUDED`. DL-090 and DL-091 add 18 collaborative workflow families outside the 252. They are worked as their own batch and are not in this count.

### What changed in the rows

- **The 6 crew lifecycle rows (DL-087)** move from `KEEP_QUARANTINED` to `RECLASSIFY_TO_EXCLUDED` as retired, following the procedure's "Per exclusion", exactly as the two spawn rows did under DL-088:
  - The rationale is replaced with the exclusion text. It cites the Contracts crew table row (`Plans/Contracts_V0.md:3061` to `3064`, `3068`, `3069`), CV-271 (`16669-16717`), `Plans/Collaborative_Workflows.md:51` (one run identity) and `Plans/orchestrator-subagent-integration.md:4202`. Each row also has one sentence of its own: the frozen roster (`Collaborative_Workflows.md:416`) for the two member rows, the shared transcript (`:63`) for `crew.coordination`, and `collaboration.failed` (DL-091) for `crew.disbanded`.
  - New `citations_checked` entries record the same citations.
  - The legacy bucket and the `july248` pin are kept, no evidence cell changes, and no denominator removal is claimed.
- **The host ruling on the 25 retention cells** (19 `subagent.*` rows on DL-084, 3 `crew.board_*` rows on DL-085 and `phase.force_completed`, `config.validation.failed` and `parser.error` on DL-086):
  - The first application set these cells to `PASS` on the Decision Log entry and said this was its one judgment. The host session ruled that they go to `FAIL`. Step 9 batch 1's `PASS` cells rested on owner text that had landed: `Plans/Runtime_Artifacts_Panel.md` and the storage-plan Case L-3 assignment. No owner text binds these families yet.
  - Each cell is now `{"status": "FAIL", "citation": "Plans/Decision_Log.md#DL-08x"}` with the ruling's note, "Retention decided by Jared in DL-08x (...); the Storage owner binding (Case L-3 assignment and the family contract) is not written yet, so the cell stays FAIL until it lands." The plain policy in the note is "kept as long as its chat exists" (DL-084), "kept with the run's other coordination records, 180 days after the run finishes" (DL-085) or "kept one year after the run finishes" (DL-086).
  - A three-sentence ruling is appended to each rationale. The rows stay `KEEP_QUARANTINED`, and no other evidence cell or `citations_checked` entry changes.
  - This replaces the paragraph "Why the retention cells cite the Decision Log" above: the retention decision stands, but the cell passes only once owner text binds it.
- **Both ledgers:** the same 31 lines. The individual ledger lines are rewritten from the row objects. On the census lines, the 6 crew rows get the exclusion disposition, the two card copies and the application record in `evidence_refs`, their citations in `source_citations` and a note. The 25 retention rows get one sentence in `notes`. Each file's serialization and each line's CRLF ending are kept.
- **`decision-responses.jsonl`:** the effect text of the DL-084, DL-085 and DL-086 rows said the retention cell is `PASS`. It now says the cell is `FAIL`, citing the entry, until the Storage owner binding lands. Only `effect` changes in those three lines. The four new response rows for DL-087 and DL-090 to DL-092 were added in their own commit.
- **Not changed:**
  - the 7 coordination rows;
  - the 2 spawn rows the first application excluded;
  - `OWNER_VETOES.jsonl`, which stays empty;
  - `COVERAGE.json`.

### Hashes

The new record entry lists every changed row's SHA-256 before (at the previous branch tip, `6b2653d97c`) and after. It also gives the before and after hash of every other file changed since that tip. The main ones:

| File | Before (`6b2653d97c`) | After |
|---|---|---|
| `step-09-batch2-card-answer-application-20260925.json` (this record) | `f71b2c790a5d18241d5be13ea11216d451d5fd291372134797741451bf46d940` | `ddcc37dae32267dc7c630d163a7b7e7be64b7da984e1da5f780379d3468b6d84` |
| `individual-disposition/LEDGER.jsonl` | `313545d22286dea665a0c6e35bc8d53ee34ff721dc8ef7858c8efbafaf25fc88` | `c838efed8fd4703d71275da87b7b5fe987f4f5aec1cca5450ddbf4257cbb0349` |
| `census-adjudication/LEDGER.jsonl` | `31e0124f04a0baeb19ff8e684b60089248853012bb27d2701ff76149e685d73c` | `2d35c1e4d69e8f471ac9ba3906bc3c924eb70272ace3302ccc478d6c2ac4183c` |
| `decision-responses.jsonl` | `3a435c02b11c91f401712d07169c812a72aa3a8381e6b56dede8dc7db4956324` | `4c9dbff2132df50e14d93205560248f7ef27e72bcea54317a57538cfd55e15d9` |
| `Plans/Decision_Log.md` | `bb3332032c23b5840bcf9763a3e62451e19b20ceaf6bd82617aab3bf1524ca8b` | `794261c7a6057eff765489ee4932364f0b7c0ef80cd04fea6a497af81009e8d4` |
| `step-09-procedure-20260924.md` | `0f5a9866f7584a6b264c3ab1e2ca8bbdc03cf648ae7372b0f70f2998b896eb33` | `5d67ec19789a7d28fba8ceee697cab8edd370941a7948c277646629021fcd65c` |
| `step-09-batch2-card4-addendum-20260925.md` | none (added) | `295f17d7ac6423d9f19dc5d82c001c03385db0fb3e45f2ee605cd405337ba30a` |
| this note | `59c8a60b7842b85cdb5cc04b23fbdfb757c3312b3e8bd4c969507e407b4f8f15` | given in the batch report |

The Decision_Log shards and the six `Plans/.plan_index` files are in the record with their hashes.

### Owner follow-ups added by these answers

None of them is done on this branch.

1. **DL-087, Contracts with Orchestrator.** Contracts removes the six crew lifecycle rows (`Plans/Contracts_V0.md:3061-3064`, `3068-3069`), narrows CV-270 to the board events and retires CV-271. The orchestrator adds a pointer from its Crew text (`Plans/orchestrator-subagent-integration.md:4200-4202`, `4258-4260`) to `Plans/Collaborative_Workflows.md`.
2. **DL-090 and DL-091, the collaborative workflow batch.**
   - Collaborative Workflows section 13 cites DL-090 and gains `collaboration.failed`.
   - The 18 families are prepared on one branch and admitted one per landing, each with its full contract, blind review and DL-077 admission record. Whether each one's own landing entry is Jared's decision entry for that family is review question D-02, which DL-093 answers only for the seven coordination families and which stays open for these 18.
   - The contracts of events that carry proposal or finding text say how that text is protected and deleted.
   - The run, message, proposal and finding records get their own contracts schema and fixture pair.
3. **DL-092, Storage.** The Case L-3 retention text assigns the chat lifetime to the 18 families, together with DL-084's 19 families, after the same reuse check. Each family contract carries the structured `retention_policy_ref`.

The Storage retention follow-ups of the first application stand: DL-083 and DL-089 in SP-291, and the Case L-3 bindings for DL-084 to DL-086. The 25 retention cells stay `FAIL` until those bindings land.

### Checks

`verify_card4_application.py` checks this application against `6b2653d97c`:
- exactly the 31 row files changed, and only the permitted fields;
- 31 lines in each ledger, with line endings kept, and each individual ledger line equals its row object;
- the 9 other batch 2 rows are identical;
- only `effect` changed in the three response rows;
- the record's earlier content is byte-identical and every hash in the new entry matches;
- the J248 count over the ledger is 237 and 15.

The shard check, index validation, test modules and the currentness validator run at the branch state are listed in the batch report, `step-09-batch2-20260925.md`, with the evidence directory `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09-batch2-answers-checks-final-20260925/`.

## Review repair, cycle 1, 2026-09-25

The blind cycle-1 review of this branch at `130cd5b400` found one blocking finding, three should-fix findings and four notes, B2-01 to B2-08. Its files are in `/mnt/Cursor/PM-Experiments/review-ea-step09-batch2-answers-20260925/` (`REVIEW.md` `8c3014bc81eae3fc764fd1d0fd129cb8f45a6e94eee1f4b21583754e9d7137f8`, `findings.jsonl` `f2e34fb6384b551e04abf5987de2463e1d172bd0525df29dc165e32a313f5141`, `RECONCILIATION.md` `e094844301e9c096f6d4bb884eaf08ad86b6dcf331c92c7db7206e429b3250ec`), copied to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09-batch2-answers-repair-20260925/review/`. This is DL-066's one bounded repair round: each finding is repaired in its own commit, in the reviewer's suggested words.

The application record gains the key `review_cycle1_repair_application`. For each repair it gives the SHA-256 before and after of every file the repair changes, except the record itself, this note and the batch report, which cite the record's hash; the record's hash now is given in the batch report. The record entries of the two applications above are kept byte-identical. Where a repair below changes their text in this note, it says so. Where this section and the ones above differ, this section is current.

- **B2-01 (blocking): DL-093's scope.** Question 4 named only the seven coordination admissions, and no answer from Jared to the host's wider reading is recorded. DL-093 now records "4 i approve" for the seven coordination families only: the Decision Log entry that each of their registration landings adds under DL-078 is Jared's decision entry for that family. Review question D-02 stays open for every other Step 9 registration, including the 18 collaborative workflow families. The same narrowing is made in the procedure record's D-02 paragraph, the batch report's DL-093 row, this note's DL-093 row and its follow-up for the collaborative workflow batch (both in the second application above), and the record, whose new key has a DL-093 answer entry that supersedes the second application's.
- **B2-02 (should fix): the 25 retention rationales.** Each still carried the first application's sentence saying the retention cell was `PASS` ("the retention cell is now PASS for that answer" in the 22 subagent and diagnostic rows, "the retention cell stays PASS, now on that answer instead of the 24-hour rule" in the 3 board rows) before the appended host ruling set it to `FAIL`. In the reviewer's words, that sentence now reads "Applied at 2026-09-25T03:50:05Z: the row stays KEEP_QUARANTINED as unfinished technical contract work, and its retention cell is FAIL under the host ruling below." in the 22 rows, and "Applied at 2026-09-25T03:50:05Z: the 24-hour rule no longer supports the retention cell, the row stays KEEP_QUARANTINED as unfinished technical contract work, and its retention cell is FAIL under the host ruling below." in the 3 board rows. Nothing else in the rows changes. The 25 individual-ledger lines are rewritten from the row objects, keeping their CRLF endings, and the census ledger is unchanged. The record's B2-02 entry gives the SHA-256 before and after of each row and of the ledger; for these rows it supersedes the second application's after-hashes, which are kept as history. The batch report's row table shows the new hashes.
- **B2-03 (should fix): DL-092's policy-object sentence.** DL-092 lets the Storage owner materialize the Chat content class if `RP-GOAL-THREAD-LIFETIME` cannot be reused, and then said "No policy object is created and no policy value changes." In the reviewer's words it now says "This entry itself creates no policy object and changes no policy value; the only new policy object it allows is the Chat content class, if the Storage owner's reuse check materializes it with the same lifetime." DL-085 and DL-086 keep that sentence, since neither allows a new policy object. The DL-092 response row's "No new policy, owner text, ..." made the same claim; it now reads "This answer itself creates no policy object and changes no policy value; the only new policy object it allows is the Chat content class, if the Storage owner's reuse check materializes it with the same lifetime. No owner text, registry, admission, depth, readiness or seal change."
- **B2-04 (should fix): Card 4's response status.** The DL-087 response row's `card_status` was `deferred_recorded`, the status of DL-082's deferred card, though nothing was deferred: Jared's words were applied at once and the scope he added was answered through the addendum the same day. It is now `no_option_words_recorded_owner_contract_pending`, and the batch report's sentence now reads "Card 4 takes `no_option_words_recorded_owner_contract_pending`, since no option was selected and his words were applied, and the others take `approved_recorded_owner_contract_pending`".
- **B2-05 (note): DL-091's waiting and blocked states.** "Waiting and blocked get no events" read as a standing decision, while Card 4b only said it adds none. In the reviewer's words DL-091's prose now says "This entry adds no events for the waiting and blocked states, which the run record and the live view show, and", its `canonical_text` "This entry adds no events for the waiting and blocked states", and its response row "No events are added for the waiting or blocked states".
- **B2-06 (note): exclusions before their owner edits.** The 8 exclusions (DL-087's six crew lifecycle rows and DL-088's two spawn rows) are recorded while the Contracts owner edits that remove the names are pending, the opposite choice from the host ruling on the retention cells. The procedure's "Per exclusion" permits it and each rationale says the edits are pending, so no row changes. The procedure record's open questions gain item 8, in the reviewer's words: "Batch 2 records the DL-087 and DL-088 exclusions before the Contracts owner edits land; confirm that an exclusion may rest on a Decision Log answer while its owner edit is pending."
- **B2-07 (note): the procedure record's count row.** It said "DL-084, DL-085 and DL-086 settle retention for 25 rows, which stay technical work", though those 25 retention cells are `FAIL`. In the reviewer's words it now says "DL-084, DL-085 and DL-086 decide retention for 25 rows, which stay technical work with their retention cells FAIL until the Storage owner binding lands". The batch report already said "retention is decided".
- **B2-08 (note): the sentence count.** The second application above said "One sentence is appended to each rationale."; each of the 25 rationales gained three sentences. In the reviewer's words it now says "A three-sentence ruling is appended to each rationale."
