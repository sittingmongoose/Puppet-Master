# audit-20260619-008-prd-planning-wizard-post-repair-head-semantic-fidelity Final Report

Status: BLOCKED

Audit-only scope held. This bundle audits `pldg-20260618-001-prd-planning-wizard` at subject/observation ref `ba61ff4e40e17c477c6260b8f33cfe9b8ef503e6` over range `be1fcd710906c1d3243cf6e2020de9ac13eebbfe..ba61ff4e40e17c477c6260b8f33cfe9b8ef503e6`. No canonical Plans, ledger state, governance artifacts, WorkNodes, NodeSeeds, executable queues, runtime dispatch, implementation files, GoalRuns, or production build tasks were edited by this audit.

Repair required count: 4.
Advisory count: 16.

## Repair-Required Findings

1. `audit-20260619-008::runtime_schema_design_only_framing_drift`
   `plans_to_code_handoff.schema.json` still frames the schema as the `pldg-20260617-001` design-only handoff while `PNC-015` and `CV-290` define the `pldg-20260618-001` runtime-aware split into `design_only` and `native_runtime`.

2. `audit-20260619-008::retired_wizard_names_remain_in_active_planunit_fields`
   Active PlanUnit fields still use current-sounding stale names such as Chain Wizard and Requirements Doc Builder where the current owner map and canonical docs use PRD Builder / Planning Wizard.

3. `ledger_latest_audit_timestamp_drift`
   Local ledger projections and the global registry agree on the audit-007 repair pointer and status, but `latest_audit_validated_at_utc` differs across projections and does not consistently tie to the repair report generation time.

4. `compile_queue_stale_repair_note`
   `compile_queue.json` latest-audit fields point to audit-007, but the narrative note still describes audit-20260619-004 as the validated repair.

## Coverage

- Atom fidelity: 168/168 source atoms are exact, equivalent with evidence, previously closed, or stale retired; no atom row requires repair.
- PlanUnit source claims: 62/62 audited source claims are `source_lineage_supported`; no missing lineage or overclaim rows require repair.
- Owner routing: no new owner-routing gaps; prior owner-map underreporting remains closed through closure reuse.
- Closure reuse: 13 prior closure rows were reused with no hash mismatches.
- Governance and forbidden artifacts: plan index, migration, sharding, Spec Lock, auto-decisions, evidence, and plan graph checks passed; no forbidden implementation/runtime artifacts were found.

## Validators

Recorded validator status is pass: 19 results, 16 pass, 3 superseded base-environment failures, 0 actionable failures, and no non-audit side effects. The superseded failures are the bare-Python `yaml` import failures for validators that passed when rerun with `PYTHONPATH=/tmp/pm_pyyaml`.

`pm-audit-closure.py validate` was run without `--require-closure-matrix` because this is an audit-only bundle with repair-required rows and no repair closure matrix yet. The final count check reported `repair_required_count=4` and `terminal_repair_state=repair_required`.

## Next Action

Run a bounded repair lane for only the four repair-required rows above, write closure evidence for those rows, rerun validators, then re-audit current HEAD. Do not broaden into WorkNodes, NodeSeeds, executable queues, runtime dispatch, implementation files, GoalRuns, or production build tasks.

Repair prompt:

```text
Repair PM Bootstrap deep semantic audit audit-20260619-008-prd-planning-wizard-post-repair-head-semantic-fidelity: read the audit bundle, repair only repair_required=true rows in semantic_risks.jsonl and ledger_consistency.json, write repair_closure_matrix.jsonl and registry closures for actionable rows only, run validators, then re-audit current HEAD. Do not repair previously_closed, stale_retired, exact_present, equivalent_with_evidence, ordinary validator warnings, audit-only currentness, or repair_required=false observations.
```
