# Shard 025: Ledger Compile Addendum - pldg-20260616-001

Source: `Plans/storage-plan.md`

Source lines: L15022-L15097

Source SHA256: `21bd16a8872bfbd2f641dac39e4b02bb8f311eb5f90d27fbb3c5de62157c5706`

---

## Ledger Compile Addendum - pldg-20260616-001

### SP-214 - Goal Runtime Persistence Consumer

```yaml
plan_unit_id: SP-214
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  storage-plan owns persistence, replay, and projection boundaries for Goal Runtime durable state, append-only goal event log, completion/degraded/stopped/blocked receipts, child-goal state, recovery state, evidence refs, goal_revision/expected_goal_revision, and retention anchors. Canonical persisted goal events registered by Contracts_V0 are goal.created, goal.scheduled, goal.progressed, goal.tool_check_recorded, goal.updated, goal.replanned, goal.child_status_changed, goal.evidence_captured, goal.verification_decided, goal.receipt_recorded, goal.completed, goal.degraded, goal.stopped, goal.blocked, goal.cancelled, plus Orchestrator GoalRun events goal_run.started, goal_run.replanned, goal_run.blocked, goal_run.certified, goal_run.cancelled, and goal_run.stopped. Storage persists them in an append-only goal_event_log and rebuilds disposable projections goal_state.v1:{project_id}:{goal_id}, goal_receipt.v1:{project_id}:{receipt_id}, goal_blocked_projection.v1:{project_id}:{goal_id}, goal_child_index.v1:{project_id}:{parent_goal_id}, goal_evidence_index.v1:{project_id}:{goal_id}, and goal_run_projection.v1:{project_id}:{goal_run_id}. Goal_Runtime_System owns behavior semantics; Contracts_V0 owns event-name and payload-minimum registration.
gui_related: false
gui_classification_reason: Goal Runtime persistence and projection ownership is backend storage behavior, not visual presentation.
depends_on:
  - SP-041
  - SP-057
  - SP-090
  - CV-286
unblocks: []
acceptance_criteria:
  - Goal Runtime durable state and append-only event-log records have a storage owner for persistence/projection and replay.
  - Completion, degraded, stopped, blocked, child-goal, recovery, evidence-ref, revision, and retention-anchor fields are preserved in append-only events and rebuilt projections.
  - storage-plan consumes Goal Runtime semantics from Plans/Goal_Runtime_System.md and does not redefine lifecycle policy.
  - Stale goal_revision or expected_goal_revision writes are rejected or reconciled through compare-and-swap recovery rather than overwriting current state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-goal-runtime-event-fixtures
risk_class: goal_runtime_persistence_owner_gap
reasoning_tier: high
context_scope: goal_runtime_storage
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/goal_runtime_events.schema.json
node_compile_hint:
  mode: goal_runtime_persistence_consumer
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0031
  - pldg-20260616-001-goal-runtime-system:atom-0032
  - pldg-20260616-001-goal-runtime-system:atom-0033
  - pldg-20260616-001-goal-runtime-system:atom-0034
  - pldg-20260616-001-goal-runtime-system:atom-0038
  - pldg-20260616-001-goal-runtime-system:atom-0039
  - pldg-20260616-001-goal-runtime-system:atom-0047
  - pldg-20260616-001-goal-runtime-system:atom-0048
  - pldg-20260616-001-goal-runtime-system:atom-0049
  - pldg-20260616-001-goal-runtime-system:atom-0107
  - pldg-20260616-001-goal-runtime-system:atom-0109
  - pldg-20260616-001-goal-runtime-system:atom-0110
preserved_exact_tokens:
  - "durable state"
  - "append-only goal event log"
  - "completion/degraded/stopped/blocked receipts"
  - "child-goal state"
  - "recovery state"
  - "evidence refs"
  - "goal_revision"
  - "expected_goal_revision"
  - "retention anchors"
  - "goal.*"
  - "goal_state.v1:{project_id}:{goal_id}"
  - "goal_event_log"
  - "payload schemas"
negative_constraints:
  - Do not let projection rebuild or stale state overwrite append-only event truth.
  - Do not make storage-plan the semantic owner for Goal Runtime lifecycle policy.
  - Do not preserve GoalRunStarted or BuildStarted as a second persisted event naming family.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
```
