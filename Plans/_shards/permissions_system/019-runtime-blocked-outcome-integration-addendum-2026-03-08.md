# Shard 019: Runtime blocked-Outcome Integration Addendum (2026-03-08)

Source: `Plans/Permissions_System.md`

Source lines: L1057-L1210

Source SHA256: `6fea7cd9e8c993ab6551844d3149b3ef238328a3abe6b93c2011663974721db1`

---

## Runtime blocked-Outcome Integration Addendum (2026-03-08)

### 1. Policy-denied outcomes are blocked outcomes

When the permission layer prevents execution, the runtime must treat the result as blocked/denied rather than generic failure.

This includes:
- deny rules
- user rejection of `ask`
- headless `ask -> deny`
- `external_publish_side_effect` blocks

### 2. Recovery-option payloads

Permission outcomes that surface to runtime/UI must include canonical blocked-state actions and family identity.

Minimum fields:
- `blocked_family` (`blocked_policy` | `blocked_approval` | `blocked_preflight` | `blocked_governance`)
- `blocked_reason_code`
- `guard_name?`
- `allowed_action_ids[]`
- `approval_scope_key?`
- `approval_target_ref?`
- `permission_snapshot_id?`
- `runtime_identity_context?`
- `revalidation_required?`
- `executed: false`

Rules:
- `allowed_action_ids[]` is canonical; prose-only recovery hints are non-conforming
- Runtime payload field names are closed: legacy `recovery_options[]` and `allowed_actions[]` are compatibility aliases only and MUST NOT replace `allowed_action_ids[]` in new blocked or recovery payloads.
- approval surfaces in chat/dialogs/cards must summarize the exact target, scope, and drift boundary for the request
- UI labels may vary, but the exposed actions must map to the canonical semantics: one-shot approval, reusable scope/session approval when policy allows, and deny/decline
- `blocked_preflight` is used for stale target, undeclared host, drift, or capability/preflight failures discovered before dispatch; these outcomes do not masquerade as `failure_class`
- payload consumers must render blocked family + action ids without inventing local enum families or alias field names
- Domain-sensitive operational sessions use permission classes instead of one generic run-command approval. Read-only inspection, interactive shell `/exec`, and network tunnel exposure are separate classes for `docker exec`, `docker attach`, `kubectl exec`, and `kubectl port-forward`; approvals for one class do not imply approval for another.
- Tool permission and domain approval are separate: generic tool allow, `/session/YOLO`, or headless defaults never approve domain-sensitive Git push/force-push/prune/destructive discard (`/force-push/prune/destructive`), workflow `/cancel/rerun/admin` CRUD, image push/repo create/template push, or Kubernetes `/delete/exec/port-forward` operations. Protection-rule changes, `/namespace/workload` mutations, SCM destructive actions, `docker exec`, `docker attach`, `kubectl exec`, and `kubectl port-forward` require their own domain approval class.
- `/queued` and background approval requests bind to the exact queued attempt, target, guard, and preflight snapshot. Approval may pause one node, block the whole run, or block only a follow-on step according to the blocked payload, but resumption always re-runs preflight when the target, policy, or permission snapshot may have changed.
- Policy-denied, approval-missing, and preflight-failed outcomes remain distinct: `blocked_policy`, `blocked_approval`, and `blocked_preflight` choose different copy, recovery actions, and retry paths instead of collapsing into a generic blocked reason.
- Mutating actions use a per-target in-flight operation key for `/dedupe` across the main window, detached windows, Dashboard, and Orchestrator shortcuts. Identical operations coalesce, while conflicting operations surface `operation_in_progress` with the owning target/action context.
- Every mutating action revalidates stable target identity immediately before execution, including stale table rows, stale cards, and stale `/selections`. If the selected target has materially changed, the action aborts with `state_changed_refresh_required` and requires refresh or reselection.
- Remote-side-effect transports may end as `indeterminate_remote_outcome` when the server-side action might have succeeded but the client lost confirmation. The receipt preserves `requested`, `transport_lost`, and later `reconciled` states, and the UI exposes a `Refresh remote state` recovery CTA rather than labeling the action simply failed.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md

A permission snapshot captures the resolved permission state at attempt start for auditability, immutability, and replay-safe approval logic.

After any approval, policy, mode, or project change, a retry creates a new permission snapshot; the prior snapshot stays frozen for historical audit and never mutates in place.

**Schema:**
```json
{
  "snapshot_id": "uuid",
  "attempt_id": "uuid",
  "node_id": "uuid",
  "captured_at": "ISO-8601 timestamp",
  "approval_scope_key": "string?",
  "approval_target_ref": "string?",
  "requested_account_binding": "string?",
  "effective_account_binding": "string?",
  "account_switch_event_ref": "string?",
  "permission_decision_context": {
    "decision_context_ref": "string?",
    "mode_override": "string?",
    "preflight_snapshot_ref": "string?",
    "policy_source_ref": "string?"
  },
  "actor_surface_context": {
    "actor_kind": "assistant | interviewer | builder | orchestrator | subagent | user | system",
    "execution_role": "string?",
    "surface_id": "string?",
    "surface_route": "string?",
    "project_id": "string?",
    "thread_id": "string?",
    "run_id": "string?"
  },
  "runtime_identity_context": {
    "requested_platform": "string",
    "effective_platform": "string",
    "provider_family_id": "string?",
    "requested_runtime_identity": "string?",
    "effective_runtime_identity": "string?",
    "host_ref": "string?",
    "transport_host_ref": "string?",
    "upstream_provider_ref": "string?",
    "repo_id": "string?",
    "worktree_id": "string?"
  },
  "resolved_permissions": {
    "<permission_key>": {
      "requested_permission_state": "allow | deny | ask | unset",
      "effective_permission_state": "allow | deny | ask",
      "downgrade_reason": "string?",
      "resolution": "allow | deny | ask",
      "source": "preset | project | user_override | session",
      "effective_value": true
    }
  }
}
```

**Rules:**
1. The snapshot is created before `attempt.started` becomes durable; when a run has no narrower attempt record yet, the effective permission snapshot is frozen before run start becomes durable.
2. The snapshot is immutable after creation; later approval, policy, mode, project, account, target, or runtime-identity changes create a new snapshot and a new attempt/run lineage entry before retry or resume.
3. Approval reuse is valid only while `approval_scope_key`, `approval_target_ref`, and the relevant runtime identity context still match. Drift invalidates the prior approval instead of silently reusing it.
4. Historical run, attempt, chat, and audit views show the frozen permission snapshot that governed that execution; current Settings state must not be presented as historical effective permission state.
5. Requested and effective permission states are both preserved per permission key. `requested_permission_state` records the state before clamping by mode, role, account, FileSafe, headless posture, or runtime capability; `effective_permission_state` records the state actually enforced. When the effective state is narrower than requested, `downgrade_reason` records the canonical reason code or policy source that caused the clamp.
6. `actor_surface_context` identifies the actor and surface that requested the snapshot so approval, blocked, and audit surfaces can distinguish Assistant, Interviewer, builder, Orchestrator, subagent, user, and system requests without inferring that context from prose.
7. `permission_decision_context` records the target, mode, preflight, and policy context used to make the permission decision; consumers may index those refs but must not collapse them into the runtime identity block.
8. `transport_host_ref` names the host or transport boundary that carried the operation, while `upstream_provider_ref` names the provider or adapter whose policy/account state influenced execution. They may match for local providers but remain separate when a bridge, proxy, tunnel, or hosted provider is involved.
9. `Plans/storage-plan.md` owns the durable key family and joins for this record, but this document owns the payload schema, enum sets (`/enums`), and interpretation rules.
10. Chat, provider, and storage surfaces may reference these fields, but they MUST NOT redefine the nested snapshot schema locally.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

ContractRef: Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor

Required fields:
- blocked_sequence
- execution_entity_id
- lane_id
- package_id
- account_id
- allowed_action_ids

Canonical terms and values:
- blocked_sequence
- execution_entity_id
- lane_id
- package_id
- account_id
- allowed_action_ids

Behavioral rules:
- Permission snapshots must preserve blocked-episode identity and scoped approval dimensions together.

Permission carry-through:
- lane/package/account scope
- ordered `allowed_action_ids[]`
### External side-effect wakeup chain

When HITL approval resolves an `external_side_effect_blocked` state:

1. The approval handler MUST emit a `prerequisite_resolved` event with `wake_reason: approval_resolved` and the `node_id` / `attempt_id` of the blocked node.
2. The event bus delivers this to the scheduler.
3. The scheduler runs a wakeup pass and transitions the node from blocked to runnable.

This is an immediate event-driven wakeup, not polling-based.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

### Target-bound domain approvals and preflight revalidation

Domain approval and preflight decisions close the historical blind-spot where an action name was approved without the exact mutable target. SCM approvals carry `project_id`, `repo_id`, optional `worktree_id`, `/worktree/context`, `branch`, and `commit`; GitHub Actions approvals carry `repo_remote`, optional `workflow_id`, `run_id`, and `/environment`; Docker approvals carry `runtime`, `registry_host`, `namespace`, `/repository`, and optional `image_ref`; Kubernetes approvals carry `kube_context`, `namespace`, optional `workload_ref`, and optional `resource_ref`. Permission evaluation runs static policy, cheap capability or `/precondition` preflight, approval request only while still actionable, and full execution-time `/revalidate` immediately before mutation. Each approval records a `preflight_revision`; any stale-preflight evidence or changed target identity invalidates reuse and returns the action to blocked state.
