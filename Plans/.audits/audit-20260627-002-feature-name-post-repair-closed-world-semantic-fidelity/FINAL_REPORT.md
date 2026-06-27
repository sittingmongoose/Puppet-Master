# Closed-World Semantic Audit - audit-20260627-002-feature-name-post-repair-closed-world-semantic-fidelity

Status: PASS_WITH_WARNINGS

Ledger: `pldg-20260626-001-feature-name`  
Baseline ref: `5432e92e8`  
Subject ref: `909d47699`  
Observation ref: `HEAD`

Scope rows: 9862. Classified rows: 9862. Coverage: 100.0%.

Actionable findings: 0. Repair required count: 0.

Non-actionable warning: node readiness remains `blocked_compiler_contract_incomplete` by design; no WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, production build tasks, or legacy Iced app files were created.

Closure reuse: 5 previously repaired findings remain closed in `Plans/.audits/_semantic_closure_registry.jsonl`; no reopen condition was observed.

Validator status: pass. Validator failures: 0. Validator side effects: 0.

Validator sweep: closure_registry, closure_audit_dir, target_ledger, plan_index, migration_state, shard_check, governance_run_gates, auto_decisions, spec_lock, evidence, plan_graph, diff_check, cached_diff_check.

Git state after validators: only the new audit bundle under `Plans/.audits/audit-20260627-002-feature-name-post-repair-closed-world-semantic-fidelity` is untracked.

Next action: `TERMINAL_PASS_WITH_WARNINGS_NO_REPAIR_REQUIRED`.
