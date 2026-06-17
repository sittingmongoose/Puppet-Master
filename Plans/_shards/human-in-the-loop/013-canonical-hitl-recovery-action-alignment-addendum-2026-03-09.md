# Shard 013: Canonical HITL Recovery Action Alignment Addendum (2026-03-09)

Source: `Plans/human-in-the-loop.md`

Source lines: L344-L399

Source SHA256: `ee507a21b600be08f0abbf657d63ce092c83687df7b82a35a5d66a026dab7abe`

---

## Canonical HITL Recovery Action Alignment Addendum (2026-03-09)

HITL actions must be canonical across graph, orchestrator, and chat surfaces.

### Allowed action families
Depending on classification, the canonical action families are:
- `approve`
- `decline`
- `retry_now`
- `resume_after_prerequisite`
- `skip_node`
- `abort_run`
- `replan`
- `restore_safe_point_then_retry`

### Action gating rules
- `approve` / `decline` apply to external-side-effect gates and review approvals
- `resume_after_prerequisite` applies to auth recovery, policy change, or other prerequisite fulfillment
- `restore_safe_point_then_retry` is required when policy says rollback is needed before rerun
- `skip_node` is legal only when the node contract explicitly permits skip without violating graph integrity
- `replan` replaces retry when classification is `replan_required`

### Consistency rule
All surfaces MUST use the same action names, meanings, and enablement conditions. A surface may hide an action for layout reasons, but it MUST NOT rename or reinterpret it.

### Approval resolution and rerun semantics


Rules:
- waiting for approval is a blocked state with `blocked_reason_code = waiting_approval`
- approval resolution emits `node.prerequisite_resolved` and wakes scheduling in the same cycle
- when a valid safe point exists for a mutation-capable attempt, the default rerun affordance is `Retry from safe point`
- if no valid safe point exists or policy forbids restore, the explicit alternative is `Start fresh attempt`
- `Skip` remains a separate graph policy action and never masquerades as success

### Canonical visible labels
HITL surfaces MUST use the canonical runtime action families and labels.

- `Approve`
- `Decline`
- `Retry from safe point`
- `Start fresh attempt`
- `Resume after prerequisite`
- `Replan`
- `Skip node`
- `Abort run`

`Reject`, `Deny`, and other variants may remain internal or domain-specific copy, but they MUST map back to the canonical action families above.

### Re-run after decline
After decline/reject, the surface MUST choose among:
- `Retry from safe point` when a valid safe point exists and policy allows restore
- `Start fresh attempt` when no valid safe point exists or policy forbids restore
- `Replan` when the canonical classification is `replan_required`
- `Skip node` only when the node contract explicitly allows skip without violating graph integrity
- Debug verification reruns the same named-action scenario in the active isolated automation session unless corrupted state requires a fresh isolated session.
