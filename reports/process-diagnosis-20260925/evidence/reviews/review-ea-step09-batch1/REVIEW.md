# Review: Step 9 batch 1 (DL-074 and DL-075 applied to their 20 J248 rows)

Branch `plans/ea-step09-card-answers-20260924`, tip `10c3df084e`, base `792d2fb8b1`. This was a blind review with no edits to the repository. Findings are in `findings.jsonl` and the report comparison is in `RECONCILIATION.md`.

## Verdict: fix_then_land

The 20 row changes do what DL-074 and DL-075 decided, and no disposition, count or cell status needs to change. Two text fixes are needed before landing:

- **B-01.** The retention note in the 19 artifact rows says DL-075's embedded-text and deletion obligation is held in `redaction_custody`. That cell is already PASS in `api_web_call` and `restore_point`, so in those two rows no open cell holds the obligation.
- **B-02.** The report says all 19 retention cells went "from FAIL". Nine were OWNER_REQUIRED.

Neither is blocking. The six other findings are notes.

## Answers to the questions

1. **Do the 20 row changes follow DL-074 and DL-075, and go no further?** Yes.
   - **task.failed:**
     - Changed fields: `NEEDS_OWNER_VETO` becomes `RECLASSIFY_TO_EXCLUDED`, the rationale is rewritten, two citations are appended, and `owner_veto` becomes null. No evidence cell changes.
     - Evidence: the exclusion cites DL-074 and the owner edit at `Plans/assistant-chat-design.md:1380`, which is correct at `792d2fb8b1`.
     - What the card required: the rationale says task.failed is not a separately persisted family and not an alias of `subagent.failed`. It says the change creates no alias, deletes no history and changes no registered family. It also keeps the failure signal, visible errors, the child lifecycle, parent-owned retries, timeout distinctions and audit attribution.
     - What stays unchanged: `subagent.failed`, which is itself one of the 252, is untouched. The legacy bucket and cohort pin stay, as they did for the six earlier exclusions.
   - **The 19 runtime_artifact rows:** each goes from `NEEDS_OWNER_VETO` to `KEEP_QUARANTINED`, and the retention cell becomes PASS citing `Runtime_Artifacts_Panel.md:2472`, which is correct.
     - Nothing beyond the retention cell changes. The field-level diff shows only disposition, the rationale, three appended citations, `owner_veto` set to null and `evidence.retention.*`.
     - No row is registered, no binding is defined and no schema is completed.
   - **Imprecisions:** B-01, B-03 (the note leaves out DL-075's carve-outs) and B-04 (superseded sentences are still in the present tense).
2. **Do the ledgers and OWNER_VETOES match the rows?** Yes.
   - The individual ledger's 20 lines equal the row objects.
   - The census ledger's 20 lines carry the same dispositions. Across all 252 rows the two ledgers agree.
   - Line order, CRLF and LF-only lines, and each line's serialization are preserved.
   - `OWNER_VETOES.jsonl` goes from 20 records to 0 bytes, the same state it had after the interim application. No `NEEDS_OWNER_VETO` row or `owner_veto` object remains. The 20 removed vetoes are in the application record, verbatim and in order.
3. **Can the counts be reproduced?** Yes. Over the exact 252 population (July 248 plus the five auth.github rows, minus `context.compaction.completed`):
   - Base: 0 registered, 6 excluded, 20 carded, 226 remaining.
   - Tip: 0 registered, 7 excluded, 0 carded, 245 remaining.
   - None of the 252 is in the live registry `2026-09-11.2`.
4. **Does anything change outside `Plans/.audits` and `reports`?** No. There are 23 files under `Plans/.audits/event-authority-2026-08-12/` and 2 under `reports/event-authority-20260911/`. No Plans document, shard, index, registry, validator or receipt changes, so no regeneration applies.
5. **Checks,** run read-only on `git archive` exports of both revisions:
   - **Unmodified independent validator:** 6 failures at base and 5 at tip, where `individual_dispositions_owner_veto_blocking` is gone. See B-05: KEEP_QUARANTINED rows do not block, so no remaining failure tracks the 245 unfinished rows.
   - **Currentness validator:** `evidence_valid` true with 14 of 14 checks, at base and at tip.
   - **Tests:** `test_event_authority_holding_bucket` passes 13 of 13, `test_pm_pnc019_currentness` 9 of 9 and `test_pm_emit_only_event_boundaries` 13 of 13, at both revisions. The pnc019 module needs the git-ignored currentness directory; on a bare export it errors 9 of 9. `test_pm_landing_check` also passes 123 of 123. None of these reads the 20 changed rows (B-06).
   - **Application record:** every hash in it reproduces.

## Exact edits to land

**Edit 1 (B-01, required; also covers B-03).** In each of the 19 files `Plans/.audits/event-authority-2026-08-12/individual-disposition/rows/ROW_runtime_artifact.*.json`, and in the 19 matching lines of `individual-disposition/LEDGER.jsonl`, replace this literal ASCII string once per row:

Old:
```
Retention only: embedded-text and deletion reconciliation remain part of the full contract (redaction_custody), and no registry row, binding or admission follows.
```
New:
```
Retention only: DL-075 requires the full contract to make the retained embedded text and any applicable deletion requirement explicit before admission; that precondition is still open and no evidence cell in this row records it as met. Retention grants no access to a linked body, and artifact bodies, original receipts, restore points, Usage and source records keep their own policies. No registry row, binding or admission follows.
```

How to apply it:
- Both strings are ASCII and need no JSON escaping, so a byte-level replace keeps each file's CRLF and each ledger line's own serialization.
- The census ledger has no evidence cells and does not change.
- In the application record, update the 19 `rows[].after_sha256` values and `files["…/individual-disposition/LEDGER.jsonl"].after_sha256`. Then update the report's record SHA-256 and add the fix script to the evidence bundle.

I dry-ran this edit on a scratch copy of the tip:
- The 19 rows changed and the 19 ledger lines were replaced.
- Every row still equals its ledger line, and every retention cell is still PASS.
- The validator still reports the same 5 failures, the currentness check is still valid, and the holding-bucket tests pass.
- The new individual ledger SHA-256 is `90661e86d772ec83507b1f468d26c85e06819332fdfcea33b265eca8dbe1878c`. The new row hashes are in `scratch/tipfix_row_hashes.json`.

**Edit 2 (B-02, required; plus the report half of B-01).** In `reports/event-authority-20260911/step-09-card-answer-application-20260924.md`, make two replacements. Each old string occurs exactly once.

2a. Old:
```
For the 19 artifact rows the `retention` evidence cell changes from `FAIL` to `PASS` with its Plans citation.
```
New:
```
For the 19 artifact rows the `retention` evidence cell changes to `PASS` with its Plans citation (from `FAIL` in 10 rows and `OWNER_REQUIRED` in 9).
```
2b. Old:
```
Every other binding gap stays open, including the embedded-text and deletion reconciliation that DL-075 puts on each full contract.
```
New:
```
Every other evidence cell is unchanged. The embedded-text and deletion reconciliation that DL-075 puts on each full contract stays an open admission precondition in each row's rationale and retention note; it is not an evidence cell, and in `api_web_call` and `restore_point` the existing `redaction_custody` PASS predates DL-075 and does not cover it.
```

**Edit 3 (B-05, recommended).** In the report, append this sentence to the end of the "Independent validator, unmodified" bullet:
```
The drop is the owner-veto check alone: the validator counts `NEEDS_OWNER_VETO` and `NEEDS_MORE_EVIDENCE` rows as blocking but not `KEEP_QUARANTINED`, so none of the five remaining failures tracks the 245 unfinished rows; the campaign count above is the only measure of them.
```

**Edit 4 (B-08, recommended).** In the report:

4a. Old:
```
(the `context.compaction.completed` ledger row, see below)
```
New:
```
(the `context.compaction.completed` ledger row, `NEEDS_MORE_EVIDENCE`, outside the 252)
```
4b. Old:
```
the before and after validator receipts (`5c9379f8...` and `1d0e2cd5...`)
```
New:
```
the before validator receipt (`5c9379f81a308b3d79797688923425a949ebfe75fd9f2eb5d8c76889933fa39a`, produced at `f1ce058ccd`, which differs from `792d2fb8b1` only in governance files the validator does not read) and the after receipt (`1d0e2cd5b7a02be72ba62cabf8b3c582a1622f9f4e13a2481257f30004fd87cb`)
```
4c. After `SHA256SUMS`, add its own SHA-256. It is currently `46330420bc4b0e86de742943580189387b1058a0194c32325c6a815283a387b8`, and it will change if the bundle is extended for edit 1.

B-04, B-06 and B-07 need no edit for this landing.

## Landing notes

- `origin/main` has moved to `2d85b37488`. That commit changes only `reports/landing-checks/baseline.json` and two governance-reseal records, and overlaps no file this branch touches or cites. The rebase is clean, and the cited lines (`assistant-chat-design.md:1380`, `Runtime_Artifacts_Panel.md:2472`, `storage-plan.md:17260`) are unchanged.
- After edits 1 and 2, re-run the unmodified validator (expect the same 5 failures), the currentness validator and the three test modules, then run the landing check in the shared checkout as `.claude/CLAUDE.md` requires.
