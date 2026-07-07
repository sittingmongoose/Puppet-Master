# Contract Runtime Core Repair - FABLE 20260706

Generated: 2026-07-07T21:35:04Z

## Status

This bounded repair closes only the FABLE contract-runtime core super-slice:

- `fable-20260706-p0-tier-vocabulary-and-subagent-config-canon`
- `fable-20260706-p1-contracts-v0-open-enums-field-drift`
- `fable-20260706-p1-goal-runtime-event-payload-minima`
- `fable-20260706-p1-executor-wake-reasons-and-coalescing-missing-owner-section`

Closure source artifact: `Plans/.audits/fable-20260706/semantic_risks.jsonl`

Registry closures:

- `closure-fable-20260706-contract-runtime-core-tier-policy-001`
- `closure-fable-20260706-contract-runtime-core-contracts-v0-001`
- `closure-fable-20260706-contract-runtime-core-goal-runtime-001`
- `closure-fable-20260706-contract-runtime-core-executor-001`

## Repairs

`Plans/orchestrator-subagent-integration.md` now fences Phase/Task/Subtask/Iteration, `tier_overrides`, and `enable_tier_subagents` as compatibility/search aliases. `SubagentPolicy` is the canonical runtime policy with field names, units, numeric defaults, hard limits, fanout thresholds, max parallel subagents, max cost per wave, retry policy, and compatibility alias mapping.

`Plans/Contracts_V0.md` now closes the critical schema drift for `wake_reason`, `stop_reason_code`, `attention_required_reason_code`, `budget_kind`, `node.unblocked.resolution`, `conflict_reason_code`, `blocked_reason_code = auth_required`, `safe_point.created`, per-event payload `schema_version`, `UICommandResponse`, `ConcernRecord`, `AuthEvent`, and `package_id` versus `work_package_id`.

`Plans/Goal_Runtime_System.md` now enumerates the shared goal-event envelope, payload minima for all 15 `goal.*` events and all 6 `goal_run.*` events, plus the spec-level records `LoopBreakerRegistry`, `AgentControlEnvelope`, `CertificationReceipt`, `ChildAgentLease`, `WorkNodeRequests`, `AuditCycle`, `AuditFinding`, and `AuditClosure`.

`Plans/Executor_Protocol.md` now owns the missing Wake reasons and coalescing section, the deterministic score tuple algorithm, closed failure/blocked mapping, stream terminal timeout, backpressure bounds, and `transport_decision_receipt`.

## Boundaries

Still out of scope and intentionally not closed here: UI command catalog missing families, wiring matrix placeholder rows, launch approval implementation proof, missing referenced docs, progression gate coverage, broad PlanUnit boilerplate, FileSafe, storage, platform_specs, GUI, runtime certification harness, executable runtime proof, and buildability gate proof.

Buildability remains blocked unless live executable PNC-019/runtime-lifecycle evidence and clean-room harness proof are supplied by a later repair.
