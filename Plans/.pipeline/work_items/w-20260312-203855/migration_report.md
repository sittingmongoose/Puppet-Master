# Migration Report

## Outcome
- Converted legacy work item `w-20260312-203855` into the simplified migrated-audit format inside the same work item directory.
- Status set to `ready_for_planning`.
- `reconciliation_plan.json` was generated because the legacy canon is exact enough to drive an owner-first repair plan.

## Migration decisions
- Treated `canonical_obligations.json` as the exact canon inventory and `section_obligation_map.json` as the owner/consumer propagation map.
- Treated `r-20260312-203855-07/ledger_fidelity_report.txt` as the durable open-gap baseline and `r-20260312-203855-07/fidelity_recovery_plan.txt` as the exact recovery-shape map, because `mode_status.md` says that pair still governs next actions.
- Preserved chunked-ledger evidence rather than relying on one-pass full-ledger reading.
- Preserved the ledgers explicit exclusions: missing-transfer auditing stays focused on refinement omissions and mixed-era survivors, not on falsely claiming that already-landed primitives are absent wholesale.

## Legacy sources read
- Work item files:
  - `Plans/.pipeline/work_items/w-20260312-203855/meta.json`
  - `Plans/.pipeline/work_items/w-20260312-203855/mode_status.md`
  - `Plans/.pipeline/work_items/w-20260312-203855/mode_rules.md`
  - `Plans/.pipeline/work_items/w-20260312-203855/coverage_collection.json`
  - `Plans/.pipeline/work_items/w-20260312-203855/bucket_plan.json`
  - `Plans/.pipeline/work_items/w-20260312-203855/packet_plan.json`
  - `Plans/.pipeline/work_items/w-20260312-203855/canonical_obligations.json`
  - `Plans/.pipeline/work_items/w-20260312-203855/section_obligation_map.json`
- Run artifacts:
  - `Plans/.pipeline/runs/r-20260312-203855-03/canonical_cleanup_plan.txt`
  - `Plans/.pipeline/runs/r-20260312-203855-03/repair_scope.txt`
  - `Plans/.pipeline/runs/r-20260312-203855-07/ledger_fidelity_report.txt`
  - `Plans/.pipeline/runs/r-20260312-203855-07/fidelity_recovery_plan.txt`
  - `Plans/.pipeline/runs/r-20260312-203855-07/repair_scope.txt`
  - `Plans/.pipeline/runs/r-20260312-203855-09/canonical_obligations.json`
  - `Plans/.pipeline/runs/r-20260312-203855-09/section_obligation_map.json`
  - `Plans/.pipeline/runs/r-20260312-203855-09/mode_status.md`
- Ledger chunks:
  - `working_ledger.md:1911-2038`
  - `working_ledger.md:2363-2489`
  - `working_ledger.md:3987-4275`
  - `working_ledger.md:9052-9379`
  - `working_ledger.md:12782-13060`
  - `working_ledger.md:14967-15144`
  - `working_ledger.md:17256-17494`

## Current migrated outputs
- `migration_report.md` - migration method and decisions.
- `missing_transfer_report.md` - exact partial/stubbed/stale transfer failures.
- `current_state.md` - present readiness and pressure summary.
- `canon_inventory.json` - obligation inventory crosswalked to mapped sections and open gaps.
- `open_gaps.json` - structured live gap list with recovery operations.
- `reconciliation_plan.json` - owner-first repair phases and cluster grouping.
- `meta.json` - migrated status and summary metadata.

## Migration result
- Exact canon retained: 45 obligations.
- Active mapped sections retained in the current work item: 119.
- Open transfer failures preserved for planning: 85.
- Obligations still impacted: 43.
