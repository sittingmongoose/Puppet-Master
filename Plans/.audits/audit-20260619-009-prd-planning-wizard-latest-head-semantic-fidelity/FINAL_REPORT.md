# audit-20260619-009-prd-planning-wizard-latest-head-semantic-fidelity Final Report

Status: BLOCKED

Audit-only scope held. This bundle audits `pldg-20260618-001-prd-planning-wizard` with `baseline_ref=be1fcd710906c1d3243cf6e2020de9ac13eebbfe`, `subject_ref=ba61ff4e40e17c477c6260b8f33cfe9b8ef503e6`, and `observation_ref=54c8cabf3a829a3a85f0bff9dcd76ca5ea4521fd`. `subject_ref..observation_ref` changes only prior audit artifacts, so live Plans evidence is the subject state observed at HEAD. No canonical Plans, ledgers, PlanUnit index, governance artifacts, code, WorkNodes, NodeSeeds, executable queues, runtime dispatch, implementation files, GoalRuns, or production build tasks were edited by this audit.

Repair required count: 5.
Advisory count: 0.

## Repair-Required Findings

1. `audit-20260619-009-prd-planning-wizard-latest-head-semantic-fidelity::runtime_schema_design_only_framing_drift`  
   `plans_to_code_handoff.schema.json`, PNC-014, and CV-289 still frame the shared schema as only the older design-only pldg-20260617 contract while PNC-015/CV-290 define runtime-aware `design_only` and `native_runtime` branches.

2. `audit-20260619-009-prd-planning-wizard-latest-head-semantic-fidelity::retired_wizard_names_remain_in_active_planunit_fields`  
   Active accepted PlanUnit fields still use current-sounding `Chain Wizard`, `Requirements Doc Builder`, or `future Chain Wizard` phrasing even though the PRD Builder / Planning Wizard owner map retires those names to compatibility/source-lineage use.

3. `ledger_terminal_event_missing_audit_007_repair`  
   Compact ledger projections certify audit-20260619-007 as the latest state-certifying repair, but `events.jsonl` and `terminal_ledger_event_id` still stop at `evt-0029` for audit-20260619-004.

4. `ledger_latest_audit_timestamp_drift`  
   Local projections and the global registry agree on audit-007 repair status, but their `latest_audit_validated_at_utc` / update timestamps diverge and do not consistently match the repair report generation time.

5. `compile_queue_stale_repair_note`  
   `compile_queue.json` points `latest_audit_*` at audit-007 but its narrative `notes` still describe audit-20260619-004 as the validated repair.

## Coverage

- Atom fidelity: 168/168 source atoms are exact, equivalent with evidence, previously closed, or stale retired; no atom matrix row requires repair.
- Lineage: 62/62 audited PlanUnit source claims are supported by current `compile_queue` and live PlanUnit `source_atom_ids` / `source_lineage`.
- Routing: no adopted owner-routing gap; the source-control Planning Wizard concern was adjudicated as covered by GitHub/FileSafe/Worktree/Permissions owner PlanUnits.
- Closure reuse: 13 prior closure rows were reused without reopening; `previously_closed` rows are not findings.
- Governance/index: Plan index and governance artifacts validate structurally; node readiness remains intentionally `blocked_compiler_contract_incomplete`.
- Forbidden artifacts: none found for WorkNodes, NodeSeeds, queues, final manifests, runtime dispatch, implementation files, Rust/Slint/Iced scaffolds, or build tasks.

## Validators

Validator status: pass. Results: 19 commands, 19 pass, 0 fail, 0 non-audit side effects. `pm-audit-closure.py validate` was run without `--require-closure-matrix` because this audit has repair-required rows and no repair closure matrix yet.

## Next Action

Run a bounded repair lane for only the five repair-required rows above, write closure evidence for those actionable rows, run validators, then re-audit current HEAD. Do not repair previously closed rows, audit-only artifact wording/currentness, or non-actionable observations.

Repair prompt:

```text
Repair PM Bootstrap deep semantic audit audit-20260619-009-prd-planning-wizard-latest-head-semantic-fidelity: read the audit bundle, repair only repair_required=true rows in semantic_risks.jsonl and ledger_consistency.json, write repair_closure_matrix.jsonl and registry closures for actionable rows only, run validators, then re-audit current HEAD. Do not repair previously_closed, stale_retired, exact_present, equivalent_with_evidence, repair_required=false observations, prior audit wording, audit-only currentness, or forbidden-artifact nonfindings.
```
