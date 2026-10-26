# Shard 014: Execution unit context and worktree allocation strategy

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L758-L792

Source SHA256: `35d1512263810cd671e3c64529e82dd4eaee8b11fcf78a5b0aace7fc6c7328f4`

---

## Execution unit context and worktree allocation strategy

### Canonical runtime context

- Consume `execution_unit_context` as the Executor-owned canonical runtime-facing context object defined in `Plans/Executor_Protocol.md` and `Plans/execution_unit_context.schema.json`.
- Demote TierContext to a derived or compatibility-only selection/decomposition helper.
- Anchor worker spawn, recovery, remediation, coordination, and UI inspection to execution_unit_context.
- Orchestrator handoff, spawn, recovery, remediation, coordination, and inspection records MUST NOT redefine required fields, optional fields, enum values, or nullability; they read those rules from the Executor schema.
- Persisted orchestrator payloads MUST NOT embed `execution_unit_context` without `schema_version`, and the payload must not store secrets, tokens, passwords, credentials, API keys, provider auth values, or local machine secrets.
- Any remaining `TierContext` or `tier_id` mention in this subsection is compatibility-only and never canonical runtime state.

### Worktree allocation strategy

- Define concrete worktree allocation strategy: each `execution_unit_context` receives a lane-managed worktree lease; package or seam reuse is allowed only when lineage matches the lane assignment and no contamination guard is active.
- Define contamination, reuse, and cleanup rules for that strategy: contaminated worktrees are quarantined until recovery clears the blocker, reuse requires clean lineage plus no dirty/conflict state, and cleanup waits for archive, receipt, and recovery checks instead of age alone.
- This subsection stays separate from runtime-context canon language and separate from stale-token retirement language.

### SCM lineage snapshot for Orchestrator consumers

`scm_lineage_snapshot` is a projector-owned Orchestrator consumer snapshot assembled from canonical runtime, storage, and Source Control records for UI inspection, run receipts, blocked `/recovery`, and later `/reconciliation`. It does not replace the owner records. Every run, node, `/tier/attempt`, and attempt consumer must be able to resolve `project_id`, `repo_id`, `repo_root`, `worktree_id`, `worktree_path`, `worktree_status`, `branch_name`, `base_branch`, `upstream_remote`, `upstream_branch`, `head_commit_oid`, `baseline_commit_oid`, `compare_target_ref`, `ahead_count`, `behind_count`, `dirty_file_count`, `conflict_file_count`, `owner_run_id`, `owner_node_id`, compatibility `owner_tier_id`, `owner_attempt_id`, `safe_point_id`, `requires_safe_point_restore`, active git operation, last commit summary, and `pr_ref`.

`worktree_status` uses explicit states: `clean`, `dirty`, `conflict`, `orphaned`, `unknown_ownership`, `locked`, `repairable`, and `prunable`. `Progress > Current Task`, `Progress > Orchestrator Status`, graph/detail views, History rows, blocked cards, and run receipts consume this snapshot as projection data only; mutation authority, safe-point restore rules, compare target calculation, and persisted SCM evidence remain owned by `Plans/WorktreeGitImprovement.md`, `Plans/storage-plan.md`, and `Plans/Contracts_V0.md`.

### Compatibility retirement

- Retire TierContext/tier_id/TierType/Tiers/Phase-Task-Subtask runtime canon.
- Retire allowed_actions[] / reason_code / recovery_options[] survivors from live blocked/HITL contracts.
- Retirement targets are exactly: `TierContext`, `tier_id`, `TierType`, `Tiers`, `allowed_actions[]`, `reason_code`, `recovery_options[]`, `approve_continue`.
- This subsection is retirement-only; canonical runtime-context rules and worktree-allocation rules remain in sibling subsections.

#### Child effective authority and timeout contract

Child timeout, budget, and `/time` supervision must reuse the corrected `Plans/Run_Modes.md` kill/done `/outcome` taxonomy. The pre-fix mixed `stop.*` / `kill.*` vocabulary is retired for child supervision: pre-dispatch budget denial is `kill.budget_exceeded`, post-response overrun after durable usage recording is `done.budget_exceeded`, and child effective authority must surface the resulting outcome without inventing a local stop-state dialect.

The child timeout envelope carries `timeout_ms`, request identity, `/response` identity, parent remaining-budget snapshot, and the clamped child deadline. `/propagation` is explicit: if a child asks for more time than the parent has remaining, the child timeout is clamped and the response records the clamp. shell-isolation is contract-level behavior, not governance-level guidance; each child execution boundary owns shell scope lifecycle, teardown, and leak prevention.
