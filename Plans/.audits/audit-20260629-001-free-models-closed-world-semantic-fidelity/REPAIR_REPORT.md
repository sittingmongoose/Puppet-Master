# Repair Report

Status: `PASS_CERTIFIED`  
Audit: `audit-20260629-001-free-models-closed-world-semantic-fidelity`  
Ledger: `pldg-20260629-001-feature-name`  
Generated: `2026-06-29T19:53:41Z`

## Result

Original actionable findings: `3`. Post-repair actionable findings: `0`. The post-repair semantic audit covered `10428` original scope rows plus `3` repair-impact rows with no sampling.

## Closed Findings

- `semantic_risks.jsonl:1` `closure_registry_currentness_failure` -> `closure-audit-20260629-001-free-models-closed-world-semantic-fidelity-repair-001`
- `semantic_risks.jsonl:2` `compile_queue_governance_note_stale` -> `closure-audit-20260629-001-free-models-closed-world-semantic-fidelity-repair-002`
- `semantic_risks.jsonl:3` `ledger_registry_top_level_timestamp_stale` -> `closure-audit-20260629-001-free-models-closed-world-semantic-fidelity-repair-003`

## Changed Surfaces

- `Plans/ledgers/v2/pldg-20260629-001-feature-name/state/compile_queue.json`
- `Plans/ledgers/v2/ledger_registry.json`
- `Plans/.audits/_semantic_closure_registry.jsonl`
- `Plans/.evidence/goal-runtime-system-governance-seal-2026-06-16/evidence.json`
- `Plans/.evidence/part4-fable-cleanup-post-audit-repair-2026-06-15/evidence.json`
- `Plans/.audits/audit-20260629-001-free-models-closed-world-semantic-fidelity/repair_impact_matrix.jsonl`
- `Plans/.audits/audit-20260629-001-free-models-closed-world-semantic-fidelity/repair_closure_matrix.jsonl`
- `Plans/.audits/audit-20260629-001-free-models-closed-world-semantic-fidelity/repair_validator_results.json`
- `Plans/.audits/audit-20260629-001-free-models-closed-world-semantic-fidelity/post_repair_audit_report.json`
- `Plans/.audits/audit-20260629-001-free-models-closed-world-semantic-fidelity/repair_report.json`
- `Plans/.audits/audit-20260629-001-free-models-closed-world-semantic-fidelity/REPAIR_REPORT.md`
- `Plans/.audits/audit-20260629-001-free-models-closed-world-semantic-fidelity/REPAIR_CERTIFICATION.md`

No canonical PlanUnits, owner Plan docs, WorkNodes, NodeSeeds, executable queues, runtime/build surfaces, or implementation files were changed.

## Validators

- `closure_registry_validate`: pass
- `closure_audit_dir_validate_required_matrix`: pass
- `target_ledger_validate`: pass
- `plan_index_validate`: pass
- `migration_validate`: pass
- `audit_governance`: pass
- `run_gates`: pass
- `shard_check`: pass
- `validate_auto_decisions`: pass
- `validate_plan_graph`: pass
- `verify_spec_lock`: pass
- `validate_evidence`: pass
- `check_project_artifacts`: pass
- `audit_closure_unittest`: pass
- `git_diff_check`: pass

## Next Action

`TERMINAL_REPAIR_VALIDATED`. No user decision is blocked.
