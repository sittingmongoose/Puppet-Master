# Shard 012: Canonical Runtime Event Wiring Canonical Alignment (2026-03-09)

Source: `Plans/Wiring_Matrix.md`

Source lines: L311-L337

Source SHA256: `19194fcefd8d6cea265679176a05cf90c19065b8e276eb8accd9d94a7b8ae9c2`

---

## Canonical Runtime Event Wiring Canonical Alignment (2026-03-09)

Compatibility/source-lineage disposition: this historical event-wiring alignment preserves canonical event row tokens and handler-rule wording. Follow the named Wiring_Matrix PlanUnits and Contracts_V0 event identities rather than adjacent addendum order.

The wiring matrix MUST use the canonical runtime names and identities from `Plans/Contracts_V0.md`.

### Canonical runtime event minimum rows
- producer: scheduler/executor
  - canonical event: `scheduler.pass`
  - identity: `scheduler_pass_id`
  - consumers: storage pass projection, Run Graph, Orchestrator Page, analytics/debug surfaces
- producer: executor attempt dispatcher / retry controller
  - canonical events: `attempt.started`, `attempt.completed`
  - persisted record: `attempt_record`
  - consumers: storage attempt projection, Run Graph attempt detail, history/evidence tabs, scheduler retry logic, safe-point and remediation recovery flows
- producer: executor/orchestrator/auth/permissions/HITL/FileSafe/worktree/plugins
  - canonical events: `node.blocked`, `node.unblocked`, `node.prerequisite_resolved`
  - consumers: blocked projections, Run Graph, Orchestrator Page, assistant thread/banner surfaces
- producer: remediation controller
  - canonical events: `remediation.spawned`, `remediation.resolved`
  - consumers: remediation lineage storage, Run Graph, Orchestrator Page, artifacts/evidence views
- producer: graph builder / replan reconciler
  - canonical events: `run.graph_canonical_locked`, `run.graph_integrity_failed`
  - consumers: executor admission logic, progression gates, blocked/replan surfaces

### UI command handler rule
Recovery UI handlers MUST be keyed by canonical `allowed_action_id` families and then bind any domain-specific command ids using the blocked payload metadata.
