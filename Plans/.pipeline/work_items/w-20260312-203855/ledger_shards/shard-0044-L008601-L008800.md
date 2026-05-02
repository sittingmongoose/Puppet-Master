- `Plans/Executor_Protocol.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/WorktreeGitImprovement.md`
- current `working_ledger.md`

### Key findings
- The execution-core mismatch is now sharper than a generic “tier drift” note. The docs are split across two incompatible centers of gravity:
  - `Executor_Protocol.md` presents execution as a canonical `Builder` / `Verifier` / `Overseer` loop over graph nodes.
  - `orchestrator-subagent-integration.md` still defines substantial runtime machinery around `Phase -> Task -> Subtask -> Iteration`, `TierContext`, tier-boundary hooks, tier crews, and tier-keyed worktree identity.
- `Executor_Protocol.md` has newer scheduler addenda that move toward the rewrite direction, but the base protocol still frames role semantics, lifecycle wording, and dispatch in a singular overseer model with no first-class package/seam governance, corroboration, or concern authority. The addenda add node/lane vocabulary without replacing the stale top-level ontology.
- `orchestrator-subagent-integration.md` now contains both old and new models at once:
  - old model: dynamic subagent selection “for each tier level,” start/end verification at tier boundaries, `TierContext`, task/phase inspectors, tier-scoped crews, tier-keyed coordination
  - newer model: scored ready set, `scheduler_lane`, `replan_generation`, runnable-unit fields like `attempt_id`, blocked reason codes, worktree conflict classification
  - result: the doc is effectively trying to consume a node/lane scheduler while still operationalizing execution via tier-native runtime structs
- `WorktreeGitImprovement.md` has moved the UI boundary in the right direction, but its concrete execution/storage assumptions are still tier-keyed:
  - `owner run/tier`
  - `get_tier_worktree(tier_id)`
  - tier-based branch/worktree naming and recovery language
  - Orchestrator consumption still says `Progress, Tiers, History, and Node Graph`
  - that conflicts directly with the rewrite direction where lanes/package context/node attempts need to survive even after tier language stops being execution-canonical
- A specific structural problem is emerging: execution identity is spread across incompatible keys:
  - node-native pieces: `run_id`, `thread_id`, `node_id`, `attempt_id`, `replan_generation`, `scheduler_lane`
  - stale tier-native pieces: `tier_id`, `TierType`, `TierContext`, tier-level crews, tier worktree ownership
  - without a canonical replacement execution-context object, downstream docs keep papering over the split locally

### Impacted docs
- `Plans/Executor_Protocol.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/WorktreeGitImprovement.md`
- downstream consumers that depend on these execution assumptions:
  - `Plans/Orchestrator_Page.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/storage-plan.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/human-in-the-loop.md`

### Contradictions / gaps surfaced
- `Executor_Protocol.md` still claims canonical execution roles as `Builder`, `Verifier`, and `Overseer`, but the rewrite now needs at least:
  - runtime scheduler ownership
  - node execution worker identity
  - package/seam governance identity
  - reviewer / corroborator / remediation / recovery execution hooks
- `orchestrator-subagent-integration.md` still treats `Iteration` as a lowest execution tier and keeps significant logic at phase/task/subtask boundaries, even while newer addenda require node-first scheduling and runnable-unit identity.
- `WorktreeGitImprovement.md` already recognizes Source Control vs Orchestrator surface separation, but its runtime ownership language is still `tier`-first rather than `lane/worktree` plus canonical execution-unit refs.
- The doc set still lacks one explicit replacement for `TierContext`. That absence is now a primary blocker because multiple seams need the same fields:
  - canonical execution-unit refs
  - lane/worktree refs
  - requested/effective runtime identity
  - execution role
  - governance lineage
  - remediation/replan generation

### Candidate fixes to carry forward
- Consolidate execution-core docs around a single node-native execution context object that replaces or wraps `TierContext` and is the canonical handoff between scheduler, worker spawn, verification, remediation, recovery, and UI projections.
- Treat tier language as legacy decomposition/help/view terminology unless a specific derived UI surface still needs it. Stop letting tier IDs remain runtime ownership keys for worktrees, crews, or agent coordination.
- Rewrite `Executor_Protocol.md` so the top-level role model matches the rewrite:
  - runtime scheduler remains canonical readiness/transition authority
  - node execution workers are explicit
  - package/seam overseers are governance actors, not the scheduler
  - reviewer/corroborator/remediation/recovery hooks become first-class execution participants
- Rewrite `orchestrator-subagent-integration.md` so it becomes a consumer/worker-spawn document over canonical runnable units, not a competing tier-era execution model.
- Move worktree ownership to lane/worktree plus canonical run/node/attempt references, with Source Control remaining worktree-first at the UI level and Orchestrator remaining lane/package/seam/node-first operationally.

### Do-not-forget details
- the problem is no longer just stale terminology; there is a real split-brain between execution context keys
- scheduler addenda are not enough if the top-level docs still teach the old ontology
- any reconciliation that touches UI/storage/help without first tightening execution-core ownership will keep reopening the same seams
- `TierContext` replacement/wrapper is now one of the most important structural follow-ups still open

## Research Progress - 2026-03-16 - Execution-context replacement shape

### Targeted docs read
- `Plans/orchestrator-subagent-integration.md`
- `Plans/Contracts_V0.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/storage-plan.md`
- current `working_ledger.md`

### Key findings
- The current `TierContext` in `orchestrator-subagent-integration.md` is overloaded. It combines:
  - decomposition/view identity: `tier_type`, `tier_id`, `title`, `description`
  - workspace binding: `workspace`, `worktree_path`
  - project heuristics: language/domain/framework
  - live execution hints: code-review/testing/error flags
  - requested/effective runtime state: persona/platform/model snapshot fragments
- That mixture is the core reason it cannot become the rewrite-era canonical execution context. It is trying to be both a planner/decomposition helper and a runtime/audit object.
- The cross-cutting canonical runtime fields already exist elsewhere:
  - `Contracts_V0.md` and `Prompt_Pipeline.md` already own the requested/effective persona/platform/model/auth/account snapshot contract
  - `storage-plan.md` already owns canonical runnable identity through `run_id`, `node_id`, `attempt_id`, blocked projections, and attempt/runtime records
  - newer scheduler addenda already expect runnable-unit fields like `replan_generation`, `scheduler_lane`, and queue-analysis refs
- That means the replacement should not be “TierContext but with more fields.” The cleaner model is a split:
  - canonical `execution_unit_context` for runtime/scheduler/worker/governance/storage/UI inspection
  - optional derived `decomposition_context` or `view_context` for legacy prompt heuristics, decomposition labels, or UI help text
- `ActiveAgent`, crew structs, and coordination payloads are still tier-keyed and therefore inherit the same problem. They should key on canonical execution refs first, with tier/package/seam labels only as secondary metadata when still useful.

### Recommended execution-context shape
- Minimum canonical `execution_unit_context` should carry:
  - identity:
    - `project_id`
    - `run_id`
    - `thread_id?`
    - `feature_seam_id?`
    - `work_package_id?`
    - `node_id`
    - `attempt_id`
    - `replan_generation`
  - execution/governance:
    - `execution_role`
    - `scheduler_lane`
    - `manual_priority?`
    - `remediation_root_id?`
    - `remediation_parent_attempt_id?`
    - `safe_point_id?`
  - workspace/isolation:
    - `lane_id?`
    - `worktree_id?`
    - `workspace_path`
    - `worktree_path?`
    - `snapshot_ref?`
  - requested/effective runtime identity:
    - refs or embedded snapshot for canonical requested/effective persona/runtime record
    - `requested_account_policy?`
    - `requested_account_id?`
    - `requested_account_binding?`
    - `effective_account_id?`
    - `account_switch_reason?`
    - `operational_identity?`
  - runtime state hooks:
    - `blocked_reason_code?`
    - `allowed_action_ids[]?`
    - `failure_class?`
    - `permission_snapshot_id?`
    - `model_snapshot_id?`
    - `provider_attempt_ref?`
- Optional derived `decomposition_context` can still carry:
  - human-readable labels/titles
  - former tier grouping if needed for help or migration
  - language/domain/framework hints
  - subtask-focus style heuristics
  - parent-summary/dependency prompt conveniences
- Recommended rule: worker spawn, verification, remediation, recovery, coordination state, history, ledger, receipts, and graph/detail inspectors should all anchor to `execution_unit_context`, not to decomposition context.

### Impacted docs
- `Plans/orchestrator-subagent-integration.md`
- `Plans/Executor_Protocol.md`
- `Plans/storage-plan.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/Contracts_V0.md`
- downstream consumers:
  - `Plans/human-in-the-loop.md`
  - `Plans/Runtime_Artifacts_Panel.md`
  - `Plans/Tools.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/Run_Graph_View.md`

### Contradictions / gaps surfaced
- `Prompt_Pipeline.md` still allows `persona_override_owner_id` scope values that include `tier_id`, which is increasingly a legacy ownership key for Orchestrator execution. That likely needs a migration path toward run/node/attempt/subagent-owned scopes.
- `storage-plan.md` still has both `attempt_record` and `tier_runtime_record`. That may remain acceptable, but only if `tier_runtime_record` becomes clearly derived/view-oriented rather than the place where runtime identity hides.
- Coordination examples and crew creator payloads still treat `tier_id` as the canonical orchestrator ownership key; that will misalign with lane/package/node-first execution once the rewrite lands.

### Candidate fixes to carry forward
- Define one canonical `execution_unit_context` owner doc, likely shared between `Executor_Protocol.md` and `Prompt_Pipeline.md`, then have storage/event/docs consume it by reference instead of cloning partial field sets.
- Keep any replacement for `TierContext` as a compatibility wrapper at most:
  - `legacy_decomposition_context`
  - plus canonical `execution_unit_context`
  - never the other way around
- Migrate coordination and crew models from `tier_id` anchoring to canonical execution refs plus secondary labels:
  - `run_id`
  - `node_id`
  - `attempt_id`
  - `lane_id?`
  - `work_package_id?`
  - `feature_seam_id?`
- Treat worktree/lane binding and requested/effective account/runtime identity as mandatory parts of the canonical execution context, not optional downstream embellishments.

### Do-not-forget details
- the replacement should inherit existing canonical runtime snapshot contracts, not create a parallel runtime-resolution schema
- `tier_runtime_record` may still survive, but only as a derived grouping/view object if execution ownership moves elsewhere
- coordination state is one of the places where stale `tier_id` usage will quietly persist unless explicitly migrated

## Research Progress - 2026-03-16 - Approval scope / HITL anchoring

### Targeted docs read
- `Plans/human-in-the-loop.md`
- `Plans/Contracts_V0.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/storage-plan.md`
- current `working_ledger.md`

### Key findings
- HITL now visibly contains two contract eras at once:
  - older request-local contract: `HITLRequest` with `tier_id`, `tier_type`, and HITL-only `allowed_actions[]` like `approve_continue`
  - newer runtime-facing correction: `waiting_approval` is a blocked overlay, canonical action vocabulary is `allowed_action_ids[]`, and all actions route through `cmd.runtime.*`
- This is not just wording drift. It creates a real ownership split:
  - older model treats approval as a tier-boundary pause object
  - newer model treats approval as a blocked episode attached to canonical runtime execution
- `human-in-the-loop.md` now effectively says the newer model should win:
  - `waiting_approval` is `blocked_reason_code = waiting_approval`
  - approval resolution emits `node.prerequisite_resolved`
