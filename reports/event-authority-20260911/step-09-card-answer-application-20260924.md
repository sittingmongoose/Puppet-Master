# Step 9, batch 1: the two answered Step 9 cards applied to their 20 rows, 2026-09-24

Jared answered both Step 9 product cards on 2026-09-23, and those answers are recorded as DL-074 and DL-075 with their owner edits on `main`. The 20 J248 rows the cards held were still marked `NEEDS_OWNER_VETO`. This batch records the answers on those rows. It registers nothing.

| Rows | Card and answer | Outcome for the row |
|---|---|---|
| `task.failed` | `EA-S09-EXEC-TASK-FAILURE`, Approve, option A (DL-074) | **Excluded.** `RECLASSIFY_TO_EXCLUDED`: a presentation notification over canonical child-run records, not a separately persisted EventRecord family and not an alias of `subagent.failed` (`Plans/assistant-chat-design.md:1380`). |
| The 19 `runtime_artifact.*` rows | `EA-S09-EXEC-RUNTIME-ARTIFACT-RETENTION`, Approve, option A (DL-075) | **Back to technical work, retention settled.** `KEEP_QUARANTINED`; the retention cell becomes PASS for `RP-AUTHORITY-INDEFINITE` for the time each full contract is admitted (`Plans/Runtime_Artifacts_Panel.md:2472`, `Plans/storage-plan.md:17260`). Every other binding gap stays open, including the embedded-text and deletion reconciliation that DL-075 puts on each full contract. |

## Campaign count after this batch

| | Before | After |
|---|---:|---:|
| Registered | 0 | 0 |
| Excluded | 6 | **7** |
| Carded (waiting for an answer) | 20 | **0** |
| Remaining technical work | 226 | **245** |
| Total | 252 | 252 |

No row is left on a card. The 19 artifact rows move from "carded" to "remaining" because their only product question is answered; their contracts are not finished.

## What changed

All in `Plans/.audits/event-authority-2026-08-12/`, following the pattern of the six exclusions recorded on 2026-09-11 (`e54a2c8a5c`):

- `individual-disposition/rows/ROW_<event>.json` for the 20 rows: new disposition and rationale, `owner_veto` set to `null` because the question is answered, and new `citations_checked` entries for the owner edit and the Decision Log entry. For the 19 artifact rows the `retention` evidence cell changes from `FAIL` to `PASS` with its Plans citation. No other evidence cell changes, and `bucket`, `cohort_pins`, `phase1_application` and `provisional` are unchanged.
- `individual-disposition/LEDGER.jsonl` and `census-adjudication/LEDGER.jsonl`: the same 20 lines, rewritten from the row objects with each file's own serialization and each line's own line ending. No other line changes.
- `individual-disposition/OWNER_VETOES.jsonl`: the 20 answered vetoes are removed. It lists pending vetoes, and none is pending now; it is back to the empty state it had before the cards were raised. The removed objects are kept verbatim in the application record.

The application record `step-09-card-answer-application-20260924.json` (SHA-256 `4fc7b86d35378fbe9af58ed1a589cb5dec4f1046cbfade4e06f9a418600b4fb1`) lists every row with its before and after SHA-256, the before and after hash of each ledger file, the two answers with their source, and the removed vetoes.

## Checks (worktree at the branch tip, base `origin/main` `792d2fb8b1`)

- **Independent validator, unmodified** (run in the worktree; its receipt file was restored afterwards so the tracked receipt is unchanged): 6 failures before, **5 after**. `individual_dispositions_owner_veto_blocking` is gone. The other five are unchanged: `unexpected_august_set`, `fresh_census_denominator_not_closed`, `individual_dispositions_evidence_gap_blocking` (the `context.compaction.completed` ledger row, see below), `individual_dispositions_provisional` (the two August rows) and `registered_contract_depth_incomplete`.
- **Currentness validator** (`pm-event-authority-currentness.py validate`, with an explicit `PM_EVIDENCE_MAP` for the symlinked currentness audit): `evidence_valid` true, all 14 checks true, including `quarantined_252_exact_set_and_custody`.
- **Tests:** `test_event_authority_holding_bucket` OK, `test_pm_pnc019_currentness` OK, `test_pm_emit_only_event_boundaries` OK.
- No Plans document, shard, index, registry, validator, cohort pin, freeze digest or closure hash changes, so no shard regeneration applies.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step09-card-answers-20260924/`, whose `SHA256SUMS` covers the apply script (`9d78276609aa8b81f9b518557cfd443183a104657f5ef65ebca11d4c394251df`), the before and after validator receipts (`5c9379f8...` and `1d0e2cd5...`), the currentness output, the evidence map and the three test logs.

## Limits and open items

- The frozen disposition schema has no J248 exclusion category, so the excluded row keeps its legacy `confirmed_persisted_unregistered` bucket and cohort pin, exactly as the six earlier exclusions do. No denominator removal is claimed.
- `COVERAGE.json` in `individual-disposition/` is a 2026-09-11 15:12 snapshot and was already stale before this batch (it predates the cards and the six exclusions). It is left unchanged, as the 2026-09-11 exclusion landing left it.
- The validator's `unexpected_august_set` failure cannot clear while any family registered after August stays registered, and every Step 9 registration will add to it. That is a question for Jared, raised separately.
