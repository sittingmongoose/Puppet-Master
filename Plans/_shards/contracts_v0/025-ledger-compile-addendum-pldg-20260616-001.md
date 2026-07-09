# Shard 025: Ledger Compile Addendum - pldg-20260616-001

Source: `Plans/Contracts_V0.md`

Source lines: L17507-L17636

Source SHA256: `4237e1c14fbacb969e3ce54fb0ac2c5742967fe20f28cc6c0acabb7a1241d4a5`

---

## Ledger Compile Addendum - pldg-20260616-001

### CV-286 - Goal Runtime Shared Record Envelope

```yaml
plan_unit_id: CV-286
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 owns shared envelope fields for Goal Runtime goal events and receipts, including goal_id, optional parent_goal_id, goal_revision, optional expected_goal_revision where compare-and-swap applies, receipt/degraded/stopped/blocked outcome refs, actor/execution_role, requested/effective provider/model/account refs, evidence refs, and approval/block refs. Goal_Runtime_System owns Goal Runtime semantics; storage-plan owns persistence/projection and concrete payload schemas; Permissions_System owns approval scope. CV-287 registers the concrete persisted Goal Runtime event names and cross-contract payload minima that consume this envelope.
gui_related: false
gui_classification_reason: Shared runtime envelope fields are contract/schema behavior, not visual presentation.
depends_on:
  - CV-145
  - CV-255
  - GRS-005
  - GRS-012
  - GRS-014
  - GRS-017
  - GRS-020
unblocks: []
acceptance_criteria:
  - Goal Runtime event and receipt records have stable shared envelope fields for goal identity, parent identity, revision, outcome refs, actor/execution role, requested/effective provider/model/account refs, evidence refs, and approval/block refs.
  - Goal_Runtime_System keeps behavior semantics while Contracts_V0 keeps cross-surface envelope names.
  - Storage and permission owners consume the shared envelope without redefining Goal Runtime lifecycle semantics.
  - Concrete Goal event names and cross-contract payload minima are registered by CV-287 and consumed by storage-plan projection rules.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_contract_owner_gap
reasoning_tier: high
context_scope: goal_runtime_shared_contracts
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Goal_Runtime_System.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
node_compile_hint:
  mode: goal_runtime_shared_envelope_contract
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0031
  - pldg-20260616-001-goal-runtime-system:atom-0032
  - pldg-20260616-001-goal-runtime-system:atom-0033
  - pldg-20260616-001-goal-runtime-system:atom-0034
  - pldg-20260616-001-goal-runtime-system:atom-0047
  - pldg-20260616-001-goal-runtime-system:atom-0048
  - pldg-20260616-001-goal-runtime-system:atom-0049
  - pldg-20260616-001-goal-runtime-system:atom-0104
  - pldg-20260616-001-goal-runtime-system:atom-0105
  - pldg-20260616-001-goal-runtime-system:atom-0109
preserved_exact_tokens:
  - "goal_id"
  - "parent_goal_id"
  - "goal_revision"
  - "expected_goal_revision"
  - "receipt/degraded/stopped/blocked outcome refs"
  - "actor/execution_role"
  - "requested/effective provider/model/account refs"
  - "evidence refs"
  - "approval/block refs"
negative_constraints:
  - Do not move Goal Runtime lifecycle semantics into Contracts_V0.
  - Do not infer provider/model/account identity from provider-native session ids alone.
  - Do not treat CV-286 alone as the concrete event registry; use CV-287 for concrete event names and payload minima.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Goal_Runtime_System.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
```

### CV-287 - Goal Runtime Event Schema Registration

```yaml
plan_unit_id: CV-287
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 registers concrete persisted Goal Runtime event names and cross-contract payload minima. Canonical goal events are goal.created, goal.scheduled, goal.progressed, goal.tool_check_recorded, goal.updated, goal.replanned, goal.child_status_changed, goal.evidence_captured, goal.verification_decided, goal.receipt_recorded, goal.completed, goal.degraded, goal.stopped, goal.blocked, and goal.cancelled. Canonical Orchestrator GoalRun events are goal_run.started, goal_run.replanned, goal_run.blocked, goal_run.certified, goal_run.cancelled, and goal_run.stopped. Existing transactional-outbox tokens GoalRunStarted and BuildStarted remain aliases for producer/outbox integration and must normalize into the canonical persisted event family before projection. Goal Runtime owns behavior and event semantics; storage-plan owns persistence, replay, projection keys, retention, and concrete stored payload schemas; Executor remains the producer/consumer boundary for scheduler, safe-point, WorkNode, and remediation events and is not re-owned by this goal event family. Every goal event payload carries event_name, schema_version, occurred_at_utc, project_id, optional thread_id, goal_id, optional parent_goal_id, goal_revision, optional expected_goal_revision, actor_ref, execution_role, requested and effective provider/model/account refs, correlation_id, optional causation_event_ref, optional idempotency_key, evidence_refs, artifact_refs, approval refs, and block refs. goal.created additionally carries objective, acceptance criteria, scope, constraints, budget, attachment refs, and model policy. goal.updated carries previous revision and objective/scope/constraint deltas. goal.replanned carries interruption class, impact, affected child goals or WorkNodes, stale/re-steer/cancel decisions, remaining evidence, new revision, and next action. goal.blocked carries blocker class, cause, affected scope, last attempted recovery, why autonomous recovery stopped, next safe action, and allowed_action_ids. Receipt events carry receipt kind, certification tier, validator outputs, child/worknode receipt refs, unresolved risks, and final certifier decision.
gui_related: false
gui_classification_reason: Event schema registration and owner boundaries are contract/governance behavior, not visual presentation.
depends_on:
  - CV-286
  - GRS-005
  - GRS-007
unblocks: [CV-288, SP-214, SP-215, GRS-012, GRS-019]
acceptance_criteria:
  - Concrete persisted goal and goal_run event names are enumerated and distinguish transactional-outbox aliases from canonical persisted names.
  - Payload minima include revision/CAS, actor/execution role, provider/model/account refs, correlation/causation/idempotency, evidence/artifact refs, approval/block refs, and family-specific fields for created, updated, replanned, blocked, and receipt events.
  - Storage projection and replay responsibilities are owned by storage-plan; Goal_Runtime_System remains semantic owner; Executor scheduler/safe-point/WorkNode/remediation events are not re-owned here.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-goal-runtime-event-fixtures
risk_class: goal_event_schema_contract
reasoning_tier: high
context_scope: goal_runtime_shared_contracts
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
  - Plans/goal_runtime_events.schema.json
node_compile_hint:
  mode: goal_event_schema_registered
  create_worknodes: false
source_lineage:
  - source_ref:audit-20260616-006-goal-runtime-system:SR-019
  - Plans/Goal_Runtime_System.md:Goal event log
  - Plans/storage-plan.md:SP-214
preserved_exact_tokens:
  - "Concrete persisted Goal Runtime event names"
  - "payload schemas"
  - "goal.created"
  - "goal_run.started"
  - "shared-envelope fields"
negative_constraints:
  - Do not preserve GoalRunStarted or BuildStarted as a second persisted naming family.
  - Do not treat storage projections as durable event truth.
  - Do not let Goal Runtime event names replace Executor scheduler, safe-point, WorkNode, or remediation events.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
```
