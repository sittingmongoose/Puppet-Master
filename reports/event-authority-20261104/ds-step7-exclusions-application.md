# Two J248 rows excluded on today's owner evidence

Application `EA-B1-DS-EXCLUSIONS-WIDGET-MIRROR` (JSON beside this file, with before and after hashes). Lane DS, stream E batch 1, 2026-11-04. Follows "Per exclusion" in `reports/event-authority-20260911/step-09-procedure-20260924.md`.

| Row | Before | After | Owner evidence (verified at `ade1ee3d6c`) | Decision behind it |
|---|---|---|---|---|
| `dashboard.widget_added` | KEEP_QUARANTINED | RECLASSIFY_TO_EXCLUDED | UCC-202: "No event named dashboard.widget_added is emitted." (`Plans/UI_Command_Catalog.md:16977`); UCC's own amendment "its `dashboard.widget_added` effect is withdrawn (UCC-202)" (`:8589`); Wiring Matrix "No entry declares terminal.workgroup_moved or dashboard.widget_added." (`Plans/Wiring_Matrix.md:7286`) | DL-180 (Jared, 2026-10-09) |
| `coordination.debug_mirror_exported` | KEEP_QUARANTINED | RECLASSIFY_TO_EXCLUDED | "the live mirror files it described are retired, so no new mirror export attempt is recorded" (`Plans/storage-plan.md:553`); "the mirror writer … and the `coordination.debug_mirror_exported` event end with them" (`:570`); an on-request `pm export` failure "is reported in the `pm export` result" (`:572`); SP-339 (`:28363`) | DL-270 card 5 (Jared, 2026-10-31) |

## Premise checks

- **`dashboard.widget_added`.**
  - DL-180 is from 2026-10-09 and UCC-202 is accepted current text.
  - The row of UCC's command table that still lists the effect (`:8586`) is amended in place by the very next line, so the two owner texts do not conflict.
- **`coordination.debug_mirror_exported`.**
  - DL-270 and SP-339 are from 2026-10-31 and current.
  - The residual "prepared, not admitted" text (CV-310's table in `Plans/Contracts_V0.md`, `Plans/coordination_event_contract_fixtures.json`) never admitted the family, and storage-plan says it is "swept separately".

## What was written

- **Each row.**
  - `disposition` becomes `RECLASSIFY_TO_EXCLUDED`.
  - `disposition_rationale` cites the owner text and the decision, and keeps the previous rationale after it.
  - `citations_checked` gains the exact-quote citations.
  - Bucket, `working_bucket`, cohort pins, evidence cells and provenance are unchanged.
- **Each census-adjudication line.**
  - `disposition` becomes `RECLASSIFY_TO_EXCLUDED`, and `notes` gains the record.
  - Category `persisted_unregistered_quarantine` stays as legacy representation, because the frozen schema has no J248 exclusion category.
- **Not claimed.** No denominator removal, alias, deletion, registry change or seal is claimed.

## Checks

The frozen seal check, run on a scratch copy, adds no failure. Census category counts, partition and exclusion revalidation all still pass, and `evidence_shape_ok` is true. `tests/test_event_authority_holding_bucket.py` has the same 2 failures as `main`.
