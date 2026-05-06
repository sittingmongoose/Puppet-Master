# Current State — Work Item w-20260312-203855

## Section Status
- Section C (Ledger Preparation): **complete** — `section_exit_C.json` (C5).
- Section D (Obligation Conversion): **complete** — `section_exit_D.json` (D4).
- Section E (Coverage): **complete** — `section_exit_E.json` (E4).

## Active source for Gaps / Routing / Doc Discovery (Section F)
- **`Plans/.pipeline/work_items/w-20260312-203855/transfer_coverage.json`** — merged coverage rows (393; one per canonical obligation); **use this as the active source for Section F**, not `canonical_obligations.json` alone. Latest blob SHA256 (per `section_exit_E.json`): `31acb58214921cce5ab4837feba2d6e63bd37e64a6645c008da9a2e0c027dcb6`.
- **`Plans/.pipeline/work_items/w-20260312-203855/transfer_coverage_source_gate_report.json`** — source gate **passed**; row counts and classification inventory reconciled to the coverage worklist.

## Key Section E artifacts
- `Plans/.pipeline/work_items/w-20260312-203855/coverage_worklist.json`
- `Plans/.pipeline/work_items/w-20260312-203855/coverage_classifications/coverage.*.json` (61 task artifacts)
- `Plans/.pipeline/work_items/w-20260312-203855/doc_discovery_resolution.json` (F5 mechanical bindings ingested in E3 re-merge)
- `Plans/.pipeline/work_items/w-20260312-203855/stage_report.E0.json` … `stage_report.E4.json`

## Coverage summary (transfer_coverage)
- Classified rows: **337**; process-followup exclusions: **56**; total rows: **393**.
- Effective class histogram (rows): present **118**, partial **16**, open_decision **42**, needs_doc_discovery **161**, excluded_process_followup **56**.

## Ledger lineage
- Working ledger SHA256 (carried on obligations / coverage): `6f40a9e1491e9ade6af05af1249de45db2950595d6f4cdfee9c37c02acdceac1`

## Notes
- E2 used deterministic token overlap; treat coverage classes as heuristic inputs for routing until revised.
- E3 re-merge refreshed `coverage_merge` from classifications and applied **99** F5 resolved bindings (paths validated on disk); **2** doc_discovery rows remain `f5_unresolved_explicit` (empty classifier `live_doc_targets_union`).
- Obligations inherit semantic sampling scope from the ledger seed set (not every ledger line is a seed).
- Section C noted a non-blocking `line_in_source` reference defect on some shard-0082 items; numeric source lines on affected seeds may be inconsistent.

## Next prompt
- Paste prompt **F0** — Section Entry: Gaps / Routing / Doc Discovery v3.1.12.
