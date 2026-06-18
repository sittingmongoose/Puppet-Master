# Repair Report - audit-20260617-013-plans-to-code-handoff-post-repair-fidelity

Status: REPAIRED_CORE_VALIDATORS_PASSED_GOVERNANCE_STALE_NOT_SEALED
Ledger: pldg-20260617-001-plans-to-code-handoff
Generated: 2026-06-18T00:18:48Z

## Result

Bounded repair is complete for the latest Deep Audit finding. The missing exact PlanUnit term `progress/speed/ETA/status panels` is now present in OP-023 and F3-397 canonical text, acceptance criteria, and preserved exact tokens. `.plan_index` was regenerated after the Plans edit stabilized.

Governance is intentionally not sealed: Spec Lock, shards, evidence bundles, and plan graph remain stale until an explicit governance seal phase is authorized.

## Closure Summary

- repair_closure_matrix rows: 2
- closure statuses: {"repaired": 2}
- source artifacts: {"implementation_readiness_findings.jsonl": 1, "semantic_risks.jsonl": 1}
- registry rows total: 94

## Validator Summary

- core failures: 0
- governance expected failures: 5
- governance unexpected failures: 0
- governance passes: 1
- status: pass_with_governance_stale

## Generated Index And Migration

- PlanUnit index: pass; plan_unit_count=5105; node_readiness=blocked_compiler_contract_incomplete
- Migration pds002: pass; coverage_rows=3916; live_plan_unit_count=5105

## Boundary

No redesign, PlanCompile runtime enablement, WorkNodes, NodeSeeds, executable queues, product implementation files, production build tasks, or governance seal artifacts were created.

## Next Safe Action

Commit the bounded repair bundle, or run an explicit governance seal phase if Spec Lock, shards, evidence bundles, and plan graph should be refreshed.
