# Shard 025: Ledger Compile Addendum - pldg-20260616-001

Source: `Plans/storage-plan.md`

Source lines: L14866-L14933

Source SHA256: `22492b23ca80b4680ff6688b26b9a6496ebc52f8263c778285a125fbb350127b`

---

## Ledger Compile Addendum - pldg-20260616-001

### SP-214 - Goal Runtime Persistence Consumer

```yaml
plan_unit_id: SP-214
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  storage-plan owns persistence and projection boundaries for Goal Runtime durable state, append-only goal event log, completion/degraded/stopped/blocked receipts, child-goal state, recovery state, evidence refs, revision/expected_revision, and retention anchors. Exact storage substrate remains deferred and must not weaken the required Goal Runtime fields.
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
  - Completion, degraded, stopped, blocked, child-goal, recovery, evidence-ref, revision, and retention-anchor fields are not lost when storage substrate is deferred.
  - storage-plan consumes Goal Runtime semantics from Plans/Goal_Runtime_System.md and does not redefine lifecycle policy.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Goal Runtime persistence review
risk_class: goal_runtime_persistence_owner_gap
reasoning_tier: high
context_scope: goal_runtime_storage
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
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
  - "revision/expected_revision"
  - "retention anchors"
negative_constraints:
  - Do not let storage substrate deferral remove required Goal Runtime fields.
  - Do not make storage-plan the semantic owner for Goal Runtime lifecycle policy.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
```
