# Reconciliation: blind review against the author's report

Branch `plans/ea-step09-card-answers-20260924`, tip `10c3df084e`, base `792d2fb8b1`.

I did the blind phase before reading `reports/event-authority-20260911/step-09-card-answer-application-20260924.md` or its JSON application record. It worked from the bytes of the 23 changed audit files, the governing canon at `792d2fb8b1` (DL-039, DL-074, DL-075 prose and PlanUnits, the NEXT_STEPS step 9 copy with SHA-256 `85dde9aa…150e1`, identical in the shared checkout, and the Step 9 packet and both cards) and my own runs on scratch exports of both revisions. The blind-phase notes are in `scratch/blind_notes.md`.

## The report's claims, checked

| Report claim | Result | How it was checked |
|---|---|---|
| Only files under `Plans/.audits/event-authority-2026-08-12/` change, plus the report and the application record | Confirmed | `git diff --name-status`: 23 audit files and 2 report files. No Plans document, shard, index, registry, validator, schema, cohort pin or receipt changes. |
| `task.failed` becomes `RECLASSIFY_TO_EXCLUDED`, not an alias of `subagent.failed`, with citation `assistant-chat-design.md:1380` | Confirmed | The row diff. Line 1380 at `792d2fb8b1` carries the DL-074 owner edit. `subagent.failed`, itself one of the 252, is untouched. |
| The 19 rows become `KEEP_QUARANTINED` and their retention cell becomes PASS, citing `Runtime_Artifacts_Panel.md:2472` and `storage-plan.md:17260` | Confirmed | Field-level diff of all 19 rows. Both lines hold the DL-075 owner edits at `792d2fb8b1`, and 17260 is inside Case L-3, which starts at 17239. |
| "the `retention` evidence cell changes from `FAIL` to `PASS`" | **Contradicted for 9 rows** | 10 rows were FAIL and 9 were OWNER_REQUIRED (B-02). |
| "No other evidence cell changes, and `bucket`, `cohort_pins`, `phase1_application` and `provisional` are unchanged" | Confirmed | The only changed keys are disposition, disposition_rationale, citations_checked (appended only), owner_veto, and in the 19 rows evidence.retention.*. |
| "Every other binding gap stays open, including the embedded-text and deletion reconciliation" | **Partly contradicted** | Every other cell keeps its status. But the reconciliation is not an evidence cell. In `api_web_call` and `restore_point` the cell the note points to, redaction_custody, is already PASS (B-01). |
| Both ledgers change the same 20 lines, "rewritten from the row objects with each file's own serialization and each line's own line ending" | Confirmed, with a wording caveat | Individual ledger lines equal the row objects for 20 of 20. CRLF lines, LF-only lines and each line's ensure_ascii style are preserved. The census lines are edited, not rewritten from row objects: that schema has no evidence cells, and only disposition, evidence_refs, notes and source_citations change. |
| OWNER_VETOES returns to empty, and the removed objects are kept verbatim in the application record | Confirmed | 20 records became 0 bytes, which is also the interim-application state ("Empty (zero bytes), preserved"). `removed_owner_vetoes` equals the base file object for object, in order. No NEEDS_OWNER_VETO rows or owner_veto objects remain. |
| The application record's hashes | Confirmed | Its own SHA-256 is `4fc7b86d…b4fb1`. All 20 row before/after hashes, the three file before/after hashes and the ANSWERS.md hash reproduce. ANSWERS.md records cards 7 and 8 as Approve, option A. |
| Campaign counts: registered 0, excluded 6 to 7, carded 20 to 0, remaining 226 to 245, total 252 | Confirmed | Computed over the exact 252 population from `step-09-interim-application.json` (July 248 plus the five auth.github rows, minus `context.compaction.completed`). Both ledgers agree for all 252. No member of the 252 is in the live registry (`2026-09-11.2`, 42 families). |
| Unmodified independent validator: 6 failures to 5, `individual_dispositions_owner_veto_blocking` gone, and the other five unchanged, with the stated attributions | Confirmed | My runs at `792d2fb8b1` and `10c3df084e` on scratch exports. The evidence-gap row is `context.compaction.completed` and the provisional rows are the two August rows. The report does not say that the drop happens because KEEP_QUARANTINED rows are not blocking (B-05). |
| Currentness validator: `evidence_valid` true, 14 of 14 checks | Confirmed | Base and tip, with an evidence map to the ignored currentness directory and also with that directory copied into each export. |
| Tests: holding_bucket, pnc019_currentness and emit_only_event_boundaries are OK | Confirmed | 13, 9 and 13 tests OK at base and at tip. pnc019 needs the ignored currentness directory present, and fails 9 of 9 on a bare export. I also ran `test_pm_landing_check`: 123 OK at both. Only the holding-bucket module reads the disposition ledger, and none of the three reads the 20 changed rows (B-06). |
| Evidence bundle `step09-card-answers-20260924/` and its `SHA256SUMS` | Confirmed, loosely pinned | All 8 entries verify. SHA256SUMS itself is not pinned, the receipt hashes are abbreviated, and the before receipt was taken at `f1ce058ccd`. That is equivalent, because the reseal commit touches no validator input (B-08). |
| COVERAGE.json was already stale and is left unchanged, as the 2026-09-11 landing left it | Confirmed | Its `by_disposition` gives KEEP_QUARANTINED 306 with no exclusions; the actual count is 299 and 7. `e54a2c8a5c` did not touch it either, and no validator reads it. |

## Blind-phase candidates and where they ended up

- The retention note points DL-075's precondition at redaction_custody, which is PASS in two rows. **Kept as B-01 (should_fix).** The report repeats the claim, and the apply script writes the text for every row without checking that cell.
- The retention note leaves out DL-075's carve-outs and its no-access limit. **Kept as B-03 (note).** The report does not address it.
- Superseded present-tense sentences in the rationales and census notes. **Kept as B-04 (note).** This follows the 2026-09-11 precedent.
- The 6-to-5 drop reflects that KEEP_QUARANTINED is not blocking. **Kept as B-05 (note).** The report omits it.
- Mixed citation anchors. **Kept as B-07 (note).** The drift predates the branch.
- No mechanical cross-ledger or OWNER_VETOES check. **Kept as B-06 (note)**, merged with the observation that the three test modules do not read the changed rows.
- COVERAGE.json is stale. **Dropped as a finding.** The report states it and explains it, the 2026-09-11 landing set the precedent, and no checker reads the file.

## New from the report

- B-02: the report's statement that the cells changed "from FAIL" is wrong for 9 rows.
- B-08: evidence pinning and the dangling "see below".

## Other checks with nothing to report

- The row bytes keep CRLF, two-space indentation, `ensure_ascii=False` and the trailing newline.
- The ledgers' LF-only lines are unchanged: line 71 of the individual ledger and lines 38, 39 and 106 of the census ledger.
- The timestamps (`applied 2026-09-24T21:08:23Z`, commit `21:10:56Z`) are consistent.
- Main has since moved to `2d85b37488`, which touches only `reports/landing-checks` and governance-reseal records. Nothing overlaps this branch or any passage it cites.
