# Compaction's July ledger row: a superseded note

Application `EA-B1-DS-COMPACTION-ROW-SUPERSEDED-NOTE` (JSON beside this file). Lane DS, stream E batch 1, 2026-11-04.

**What changed.** `context.compaction.completed`'s individual-disposition row (ledger line 71, `rows/ROW_context.compaction.completed.json`) gains one appended sentence block in `disposition_rationale`. The census-adjudication line gains one in `notes`. Nothing else changes:
- the disposition stays `NEEDS_MORE_EVIDENCE`;
- the evidence cells, bucket, category and cohort pins stay as they were;
- it remains the historical July record.

**What the note says.**
- The family was registered in Step 6 (`b240dd93e2`, registry `2026-09-11.1`).
- The production wiring now declares `expected_event_types: ["context.compaction.completed"]` for `catalog.chat_compact_context`. That is the repair DL-039 `COMPACT-001` asked for (`Plans/Wiring_Matrix.production.json:18191`).
- Under DL-077 the row is superseded by the admission record `reports/event-authority-20260911/admission-records/context.compaction.completed.json`, which now pins `reports/event-authority-20261104/depth-b1-seal-families.json` with twelve PASS cells. `Plans/.audits/event-authority-2026-08-12/INDIVIDUAL_DISPOSITION_SCHEMA.md:44`: "Its row here, for example `context.compaction.completed`, stays as written."

**Why.** The frozen seal check already ignores this row for blocking once the admission record is complete (step 4 of this lane). The note is for truthfulness only: the row's rationale still says "No live-registry admission or depth closure", which stopped being true on 2026-09-11.
