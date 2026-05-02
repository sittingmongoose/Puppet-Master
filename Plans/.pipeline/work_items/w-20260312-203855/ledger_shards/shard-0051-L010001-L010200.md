  - artifact ownership

### Practical routing/correlation rule
- Canonical mutation and audit actions should route by:
  - `run_id`
  - `node_id`
  - `attempt_id?`
  - `blocked_sequence?`
- Tier-shaped surfaces may still display and group by `tier_id`, but they should resolve through pointers to canonical execution objects rather than using `tier_id` as if it were the durable execution key.

### Impacted docs
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/human-in-the-loop.md`
- `Plans/storage-plan.md`
- `Plans/Runtime_Artifacts_Panel.md`

### Contradictions / gaps surfaced
- `Run_Graph_View.md` calls itself a node graph but still uses `tier_id` for major data-source joins, including Usage and Output filtering.
- `Orchestrator_Page.md` still describes tab 2 as `Tiers` and uses tier-keyed widgets/event rows even though the rewrite direction is now `Seams` plus node/package/seam/lane-native execution objects.
- `human-in-the-loop.md` still stores approval state as `request_id + tier_id + tier_type`, which conflicts with the newer blocked-episode identity model.
- Evidence and terminal routing are still described as tier-keyed, which will be increasingly wrong once multiple attempts, blocked episodes, and graph generations are first-class.

### Candidate fixes to carry forward
- Keep `tier_runtime_record` only as a compatibility/overlay projection and say that explicitly in `storage-plan.md`.
- Update surface specs so tier/group views carry pointers to canonical execution objects instead of using `tier_id` as the primary mutation/audit key.
- Retarget Run Graph and Usage links toward `node_id` / `attempt_id` semantics, with `tier_id` surviving only as a display/grouping label where needed.
- Recast HITL surface state around blocked-episode identity first, with tier labels as explanatory metadata rather than canonical targeting.

### Do-not-forget details
- This is now a surface-drift problem, not just a storage problem.
- `tier_id` can still survive as a human-readable grouping label, but it should stop acting like the canonical execution correlation key.
- The downstream pages most likely to keep reintroducing the old model are `Orchestrator_Page.md`, `Run_Graph_View.md`, and `human-in-the-loop.md`.

## Research Progress - 2026-03-16 - Concrete executor-facing `execution_unit_context` field contract

### Targeted docs read
- `Plans/Contracts_V0.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/Executor_Protocol.md`
- `Plans/storage-plan.md`
- spot-checks against `Plans/orchestrator-subagent-integration.md`

### Key findings
- The concrete field family is already present, but split across three owner docs:
  - `Contracts_V0.md` already owns the canonical runtime event field packets for `scheduler.pass`, `attempt.started`, `attempt.completed`, `node.blocked`, `safe_point.*`, and remediation events.
  - `Prompt_Pipeline.md` already owns the immutable runtime handoff bundle captured at attempt start.
  - `storage-plan.md` already owns the persisted `attempt_record`, `blocked_projection`, and related runtime records.
- The missing contract is not “which fields exist somewhere”; it is the executor-facing statement of which fields are mandatory for correctness at dispatch time versus optional disclosure/overlay fields.
- The cleanest resolution is to define `execution_unit_context` as the runtime-facing union of:
  - immutable attempt handoff identity
  - currently active blocked/recovery/runtime gating anchors when applicable
  - workspace/isolation refs required for side effects and recovery
- That context should be strict enough to support:
  - scheduler dispatch
  - worker spawn
  - safe-point creation/restore
  - retry/remediation lineage
  - approval/recovery targeting
  - UI inspection/audit

### Recommended executor-facing field classes

### 1. Mandatory dispatch identity
- must exist for any dispatched attempt:
  - `run_id`
  - `node_id`
  - `attempt_id`
  - `scheduler_pass_id`
  - `replan_generation`
  - `execution_role`
- reasoning:
  - these fields identify the concrete execution unit and the scheduler decision that produced it

### 2. Mandatory runtime lineage / recovery anchors
- required when applicable, but canonical field names must exist in the contract:
  - `safe_point_id?`
  - `remediation_root_id?`
  - `remediation_parent_attempt_id?`
  - `blocked_sequence?`
  - `failure_class?`
  - `blocked_reason_code?`
- reasoning:
  - these fields are what make retry, blocked recovery, remediation, and restart behavior deterministic instead of heuristic

### 3. Mandatory requested/effective runtime snapshots by reference
- required for all provider-executed attempts:
  - requested/effective persona snapshot ref
  - requested/effective model snapshot ref
  - requested/effective permission snapshot ref
  - `requested_auth_mode?`
  - `effective_auth_mode?`
  - `requested_account_policy?`
  - `effective_account_id?`
  - `account_switch_reason?`
- reasoning:
  - executor/runtime/UI surfaces all need the same truth; these should be carried by stable refs or canonical embedded snapshot fragments, not rederived from prompt text or surface config later

### 4. Mandatory workspace / side-effect anchors for mutation-capable work
- required whenever execution can touch repo/worktree or external side effects:
  - `mutation_capable`
  - `lane_id?`
  - `worktree_id?`
  - `workspace_ref` or canonical workspace path ref
  - `provider_attempt_ref?`
- reasoning:
  - mutation/recovery flows cannot be audited or repaired correctly without stable workspace and provider-attempt anchors

### 5. Optional but strongly recommended disclosure fields
- useful for UI/ledger/history/debuggability, but not required to make dispatch valid:
  - `thread_id?`
  - `feature_seam_id?`
  - `work_package_id?`
  - `scheduler_lane`
  - `manual_priority?`
  - `allowed_action_ids[]?`
  - `operational_identity?`
  - `effective_project_id?`
- reasoning:
  - these improve explanation, routing, and cross-surface joins, but the executor can still be correct without all of them being present on every attempt snapshot

### Recommended canonical rule
- `execution_unit_context` should be defined as a runtime contract with:
  - one strict mandatory core for executor correctness
  - one conditional family for blocked/remediation/recovery cases
  - one disclosure family for UI/audit convenience
- `attempt.started` and the immutable provider handoff bundle should be isomorphic enough that one can be projected from the other without inventing new fields.

### Impacted docs
- `Plans/Executor_Protocol.md`
- `Plans/Contracts_V0.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/storage-plan.md`
- likely consumers:
  - `Plans/orchestrator-subagent-integration.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/human-in-the-loop.md`

### Contradictions / gaps surfaced
- `Contracts_V0.md` already has a fairly strong `attempt.started` packet, but it still does not name `execution_role`, which is now needed to separate provider/account identity from what the actor was doing.
- `Prompt_Pipeline.md` captures the immutable handoff bundle, but its later packet omits some fields that executor/runtime surfaces now want to inspect, such as blocked/recovery anchors when a resumed flow launches.
- `storage-plan.md` keeps `tier_runtime_record` alive next to `attempt_record`, which increases the risk that consumers keep binding to the looser tier-shaped projection instead of the stricter attempt-shaped context.
- `EventEnvelopeV1` still says writers only “should” include `run_id` / `thread_id`; that is fine for compatibility, but executor-facing docs should not inherit that looseness for runtime dispatch contracts.

### Candidate fixes to carry forward
- Add an explicit `execution_unit_context` section to `Executor_Protocol.md` that names:
  - mandatory dispatch fields
  - conditional recovery/blocked fields
  - optional disclosure fields
- Add `execution_role` to the canonical runtime attempt packet in `Contracts_V0.md`.
- Align the immutable prompt handoff bundle with the `attempt.started` packet so they differ only by storage/event framing, not by identity content.
- Push tier/group surfaces to consume pointers into this contract instead of reconstructing runtime identity from `tier_id` plus ambient state.

### Do-not-forget details
- The executor-facing contract is now mostly a normalization task across existing owner docs, not a greenfield schema invention.
- The most important missing field in the current runtime packet set is `execution_role`.
- The highest-value invariants are:
  - attempt handoff bundle is immutable
  - `attempt.started` is the canonical runtime start packet
  - blocked/recovery lineage is conditional but first-class, not inferred later

## Research Progress - 2026-03-16 - Placement of `execution_role` and `operational_identity`

### Targeted docs read
- `Plans/Multi-Account.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/usage-feature.md`
- spot-checks against `Plans/Orchestrator_Page.md`

### Key findings
- The docs are already consistent on one important point: provider/account identity is shared across assistant, interviewer, builders, overseers, and node workers, but that does not by itself explain what the actor was doing.
- `Multi-Account.md` already makes execution-role-aware routing canonical through role-by-provider and role-by-account policy, but the runtime event/attempt packets still do not carry an explicit `execution_role`.
- `effective_provider_identity` / `provider_identity` / `effective_project_id` are already treated as optional non-secret disclosure fields. That makes them the wrong place to encode actor role or side-effect target identity.
- `orchestrator.receipt.{run_id}.{attempt_id}` in `storage-plan.md` is already the bridge object for external operational surfaces:
  - GitHub workflow refs
  - Docker refs
  - Kubernetes refs
  - worktree/branch refs
- That receipt-style bridge is much closer to where `operational_identity` belongs than the persona/runtime snapshot is.

### Recommended placement rule
- `execution_role` belongs in the canonical runtime attempt/dispatch packet family:
  - immutable prompt handoff bundle
  - `attempt.started`
  - `attempt_record`
  - usage/worker-inspection projections when relevant
- `operational_identity` belongs in the operational bridge family:
  - `attempt_record` when side-effect context exists
  - receipts
  - runtime artifacts / tool traces when they touch an external operational target
  - history/ledger/detail inspectors

### Why this split matters
- `execution_role` answers:
  - what kind of actor or execution responsibility this was
  - assistant / interviewer / builder / package overseer / seam overseer / node worker / verifier / corroborator / recovery actor
- `operational_identity` answers:
