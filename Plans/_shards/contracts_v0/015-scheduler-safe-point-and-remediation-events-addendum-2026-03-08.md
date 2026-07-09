# Shard 015: Scheduler, Safe-Point, and Remediation Events Addendum (2026-03-08)

Source: `Plans/Contracts_V0.md`

Source lines: L2231-L2514

Source SHA256: `4237e1c14fbacb969e3ce54fb0ac2c5742967fe20f28cc6c0acabb7a1241d4a5`

---

## Scheduler, Safe-Point, and Remediation Events Addendum (2026-03-08)


Add the following event families to the canonical contract set.

### 1. Scheduler analysis and readiness events

#### `scheduler.pass`

Canonical `wake_reason` is closed to `prerequisite_resolved | approval_resolved | clarification_resolved | auth_recovered | startup_recovered | backoff_expired | verification_completed | remediation_resolved | safe_point_restored | capacity_available | replan_applied | watchdog_recheck`. `startup_recovered` is the scheduler-pass value used for the first pass after startup recovery, while `watchdog_recheck` is a defensive verification wake that may recheck readiness without becoming the primary correctness path.


> **Migration note:** `run.scheduler_analysis` is a deprecated legacy alias for this event. New producers MUST emit `scheduler.pass`. Consumers SHOULD accept both during migration.

ContractRef: EventType:scheduler.pass, ContractName:Plans/Executor_Protocol.md

Minimum payload:
- `schema_version`
- `scheduler_pass_id` (canonical identity -- `analysis_id` is a legacy alias)
- `run_id`
- `thread_id`
- `replan_generation`
- `wake_reason`
- `coalesced_wake_reasons[]?`
- `wake_event_refs[]?`
- `available_slots`
- `ready_nodes[]`
- `selected_nodes[]` with per-node `{ node_id, score_tuple, lane }`
- `non_selected_nodes[]` with per-node `{ node_id, non_selected_reason }`
- `ts`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

#### `run.node_ready`
Minimum payload:
- `schema_version`
- `run_id`
- `node_id`
- `ready_since_utc`
- `wake_reason`
- `replan_generation`

#### `node.blocked`

> **Migration note:** `run.node_blocked` is a deprecated legacy alias for this event. New producers MUST emit `node.blocked`.

Approval scopes that still use tier boundaries normalize to `/node/blocked` runtime scope: blocked-episode identity is anchored by run/node/blocked sequence, not by tier boundary, tier type, or page-local approval grouping.

ContractRef: EventType:node.blocked, ContractName:Plans/Executor_Protocol.md

Minimum payload:
- `schema_version`
- `run_id`
- `node_id`
- `attempt_id?`
- `blocked_reason_code`
- `blocked_sequence`
- `allowed_action_ids[]`
- `preserved_local_work`
- `detail_ref?`
- `failure_class?` (only when the block originated from a classified outcome)
- `timeout_class?` (only when the blocked state originated from a timeout-class event)
- `wait_state_class?` (only when the blocked state represents a known wait)
- `ts`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

#### `node.unblocked`

> **Migration note:** `run.node_unblocked` is a deprecated legacy alias for this event. New producers MUST emit `node.unblocked`.

Minimum payload:
- `schema_version`
- `run_id`
- `node_id`
- `attempt_id?`
- `blocked_sequence`
- `resolution` (the action that resolved the block)
- `ts`

`node.unblocked.resolution` is closed to `approval_granted | clarification_provided | auth_recovered | prerequisite_resolved | safe_point_restored | remediation_resolved | replan_applied | policy_or_permission_changed | capacity_available | manual_override_granted`.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

### 2. Retry/backoff events

#### `run.node_backoff_started`
Minimum payload:
- `run_id`
- `node_id`
- `attempt_id`
- `failure_class`
- `backoff_until_utc`
- `retry_count`
- `ts`

#### `run.node_backoff_expired`
Minimum payload:
- `run_id`
- `node_id`
- `attempt_id`
- `failure_class`
- `ts`

#### `run.node_retry_scheduled`
Minimum payload:
- `run_id`
- `node_id`
- `prior_attempt_id`
- `retry_count`
- `failure_class`
- `safe_point_id?`
- `ts`

### 3. Safe-point events

#### `safe_point.created`


Minimum payload:
- `schema_version`
- `safe_point_id`
- `run_id`
- `node_id`
- `attempt_id`
- `worktree_id?`
- `worktree_path?`
- `branch_name?`
- `HEAD_sha?`
- `baseline_ref`
- `replan_generation`
- `creation_reason`
- `ts`

When a safe point is created from a worktree-bound execution unit, `safe_point.created` carries the worktree snapshot fields (`worktree_id`, `worktree_path`, `branch_name`, and `HEAD_sha`) so restore, retry, and UI history can return to the same worktree context instead of silently substituting the main project root. `worktree_branch` is a compatibility alias for `branch_name`; `working_directory` is not a substitute for `worktree_path`.

#### `safe_point.restored`
Minimum payload:
- `safe_point_id`
- `run_id`
- `node_id`
- `attempt_id`
- `restore_outcome`
- `ts`

#### `restore_outcome` enum

Canonical values for the `restore_outcome` field in `safe_point.restored` events:

| Value | Meaning |
|-------|---------|
| `restored_clean` | All files and state restored to safe-point snapshot without conflicts. |
| `restored_with_conflicts` | Restore completed but one or more files had merge conflicts requiring resolution. |
| `restore_failed` | Restore could not be applied; original state preserved. |
| `restore_skipped` | Restore was requested but determined unnecessary (state already matches safe-point). |

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

#### FileSafe snapshot event compatibility

FileSafe may emit compatibility producer event names `filesafe.snapshot_created`, `filesafe.snapshot_conflict`, and `filesafe.snapshot_restore` when it creates, detects a conflict for, or restores a mutation safe-point snapshot. These names are FileSafe-facing wrappers for the Contracts-owned safe-point event contract, not separate event-family owners: creation maps to `safe_point.created`, restore maps to `safe_point.restored`, and conflict reporting carries the same safe-point/snapshot identity with a `restore_outcome` or `conflict_reason_code` as applicable. Minimum payload fields are `snapshot_id`, `safe_point_id`, `run_id`, `node_id?`, `attempt_id?`, `target_path?`, `conflict_reason_code?`, `restore_outcome?`, and `ts`. `conflict_reason_code` is closed to `worktree_path_mismatch | branch_mismatch | head_mismatch | baseline_stale | snapshot_missing | target_path_conflict | restore_conflict | canonicalization_failed | permission_denied`.

#### FileSafe fail-closed security event payloads

FileSafe fail-closed security events use the canonical `EventRecord` envelope (`schema_id = pm.event.v0`). These payload definitions cover the FileSafe P0 fail-closed repair only; they do not replace `tool.denied`, safe-point events, permission approvals, or adjacent runtime receipt contracts.

Stable event types:

| Event type | Minimum payload fields |
|---|---|
| `filesafe.guard_init_failed` | `guard_type`, `diagnostic_code`, `failure_stage`, `baseline_source?`, `project_id`, `run_id?`, `worktree_id?`, `blocked_capability`, `user_visible_message`, `redaction_profile`, `ts` |
| `filesafe.command_denied` | `guard_type`, `denial_code`, `command_preview`, `normalized_command_identity`, `segment_index?`, `pattern_matched?`, `permission_snapshot_id?`, `filesafe_scope_ref?`, `project_id`, `run_id?`, `worktree_id?`, `allowed_action_ids[]?`, `ts` |
| `filesafe.path_denied` | `guard_type`, `denial_code`, `path_preview`, `normalized_path?`, `canonical_parent?`, `path_kind`, `operation`, `filesafe_scope_ref?`, `permission_snapshot_id?`, `project_id`, `run_id?`, `worktree_id?`, `allowed_action_ids[]?`, `ts` |
| `filesafe.destructive_override_requested` | `request_id`, `guard_type`, `command_preview`, `normalized_command_identity`, `requested_scope`, `requested_duration`, `reason`, `auth_realm`, `operator_identity_ref`, `project_id`, `run_id?`, `worktree_id?`, `ts` |
| `filesafe.destructive_override_granted` | `request_id`, `receipt_id`, `guard_type`, `authorized_scope`, `reason`, `auth_realm`, `operator_identity_ref`, `issued_at`, `expires_at`, `project_id`, `run_id?`, `worktree_id?`, `ts` |
| `filesafe.destructive_override_denied` | `request_id`, `guard_type`, `denial_code`, `denial_reason`, `auth_realm?`, `operator_identity_ref?`, `project_id`, `run_id?`, `worktree_id?`, `ts` |
| `filesafe.policy_degraded` | `degraded_component`, `degradation_reason`, `authoritative_enforcement_intact`, `fallback_source?`, `project_id`, `run_id?`, `worktree_id?`, `ts` |

Required denial codes include `guard_init_failed`, `destructive_pattern_match`, `approved_command_identity_mismatch`, `missing_allowlist`, `empty_allowlist`, `missing_baseline`, `canonicalization_failed`, `path_outside_scope`, `path_toc_tou_recheck_failed`, `override_auth_missing`, `override_scope_invalid`, and `override_expired`.

Destructive override receipt fields:
- `receipt_id`
- `request_id`
- `auth_realm`
- `operator_identity_ref`
- `reason`
- `authorized_scope` with project, optional run, optional worktree, and optional command identity
- `issued_at`
- `expires_at`
- `approver_ref` when different from the operator
- `event_refs[]` linking requested/granted/denied events
- `redaction_profile`

`filesafe.policy_degraded` is valid only when enforcement remains fail-closed or an embedded fallback baseline remains authoritative enough to block known destructive operations. It must not stand in for missing/empty allowlists, missing roots, unresolved canonical paths, failed guard initialization, or destructive override denial.

ContractRef: EventType:filesafe.guard_init_failed, EventType:filesafe.command_denied, EventType:filesafe.path_denied, EventType:filesafe.destructive_override_requested, EventType:filesafe.destructive_override_granted, EventType:filesafe.destructive_override_denied, EventType:filesafe.policy_degraded, ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md

### 4. Remediation lineage events


#### `remediation.spawned`

> **Migration note:** `run.remediation_started` is a deprecated legacy alias for this event. New producers MUST emit `remediation.spawned`.

ContractRef: EventType:remediation.spawned, ContractName:Plans/Executor_Protocol.md

Minimum payload:
- `run_id`
- `node_id`
- `remediation_root_id`
- `child_attempt_id`
- `remediation_generation`
- `parent_failure_class`
- `ts`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

#### `remediation.resolved`


> **Migration note:** `run.remediation_completed` is a deprecated legacy alias for this event. New producers MUST emit `remediation.resolved`.
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

Minimum payload:
- `run_id`
- `node_id`
- `remediation_root_id`
- `child_attempt_id`
- `resolution` (`fixed` | `superseded` | `abandoned` | `replan_required`)
- `ts`

`remediation_ceiling_exceeded` remains a blocked-state outcome (`blocked_reason_code`), not a `remediation.resolved.resolution` value.

The legacy remediation completion enum `success|failed|ceiling_exceeded` is source-lineage for older completion prose only; canonical `remediation.resolved.resolution` uses `fixed|superseded|abandoned|replan_required`. Compatibility imports map `success -> fixed`, `ceiling_exceeded -> replan_required` while preserving `remediation_ceiling_exceeded` blocked-state outcome evidence when available, and `failed -> abandoned` only when the legacy producer reported terminal failure; non-terminal legacy failure must be reclassified to an explicit current value instead of guessed.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

### 5. Degradation / integrity events

#### `plan.decomposition_degraded`
Minimum payload:
- `project_id`
- `source_stage`
- `reason_code`
- `original_shape`
- `degraded_shape`
- `evidence_ref`
- `ts`

#### `run.graph_integrity_failed`
Minimum payload:
- `run_id`
- `reason_code`
- `detail_ref`
- `replan_generation`
- `ts`

### 6. Wizard blocked escalation events


#### `wizard.blocked`
`wizard.blocked` is not standalone navigation or blocked-state ownership; it decodes through `route_target` plus blocked/remediation identity, with `resume_url` as serialized transport only and `report_ref` / `detail_ref` as inspection references.

Minimum payload:
- `wizard_id`
- `thread_id?`
- `round_count`
- `report_ref`
- `resume_url`
- `ts`

#### `wizard.unblocked`
Minimum payload:
- `wizard_id`
- `thread_id?`
- `resolution_source`
- `ts`

### 7. Contract rules

- Events above are canonical ledger events, not debug-only instrumentation.
- All UI and storage projections added by this packet derive from these events or fields normatively referenced by them.
- `safe_point.*` events are runtime-internal recovery records and are distinct from user-facing `restore_point.*` / `rollback.*` contracts.
- `plan.decomposition_degraded` is allowed only before canonical graph lock.
