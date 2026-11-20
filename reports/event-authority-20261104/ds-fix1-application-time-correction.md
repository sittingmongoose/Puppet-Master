# Lane DS-FIX1: correction of four post-dated application times (review DS-SOL-04)

**Record:** `ds-fix1-application-time-correction.json`, applied 2026-11-04T20:31:21Z on `31cd37713c`.
**Finding:** DS-SOL-04 named the second-pass record (`ds-p2-august-regrade-application.json`), whose recorded time was later than its commit. The three first-pass records have the same defect, so all four are corrected.
**Pattern:** a receipted row update with before and after hashes, as in step 5. The four original records are left byte-unchanged as history; their hash chain continues here.

## Times

| Application record | Recorded | Evidenced (application commit) | Recorded time after the commit |
|---|---|---|---|
| `ds-step5-august-ledger-application.json` | 2026-11-04T18:30:00Z | 2026-11-04T18:08:51Z (`55f68a717e`) | 1269 s |
| `ds-step6-compaction-ledger-note.json` | 2026-11-04T18:45:00Z | 2026-11-04T18:09:32Z (`ade1ee3d6c`) | 2128 s |
| `ds-step7-exclusions-application.json` | 2026-11-04T18:50:00Z | 2026-11-04T18:11:24Z (`43d1ab5555`) | 2316 s |
| `ds-p2-august-regrade-application.json` | 2026-11-04T23:30:00Z | 2026-11-04T19:11:41Z (`af9bff39ae`) | 15499 s |

**Why the commit time.** The rows were written after the preceding commit and before the application commit. The application commit's author and committer time is therefore the latest the application can have happened, and it is recorded as the evidenced time. Each record's preceding commit and its time are in the JSON.

## What changed

Only the mirrored timestamps change, plus one appended note per row and census line. No cell, disposition, `provisional`, bucket, cohort pin or owner choice changes.

| Row | Fields changed | Row file SHA-256 before → after |
|---|---|---|
| `workspace.layout_changed` | disposition_rationale, quality_notes; census `notes` | `b7416f6da4ec464f…` → `4482699e0f2976d8…` |
| `terminal.workgroup_moved` | disposition_rationale, quality_notes; census `notes` | `0882d023d6005e4f…` → `beb9214f5bb51d99…` |
| `context.compaction.completed` | disposition_rationale, quality_notes; census `notes` | `b60aae68fb22118e…` → `416d06a5170fdbde…` |
| `dashboard.widget_added` | disposition_rationale, quality_notes; census `notes` | `e13e00454ab92237…` → `bbe7ed0147f3b82a…` |
| `coordination.debug_mirror_exported` | disposition_rationale, quality_notes; census `notes` | `bbf2d77771a15586…` → `9cd55ed65b351dce…` |

| File | SHA-256 before | SHA-256 after | Lines changed |
|---|---|---|---|
| `Plans/.audits/event-authority-2026-08-12/individual-disposition/LEDGER.jsonl` | `92cc8ea83b67ef5e…` | `52f0ac862efe889d…` | 5 |
| `Plans/.audits/event-authority-2026-08-12/census-adjudication/LEDGER.jsonl` | `6769cee73fc0b7da…` | `15cd4acc993b29b6…` | 5 |

The file before-hashes equal the after-hashes of `ds-p2-august-regrade-application.json`, the last application that touched these ledgers.
