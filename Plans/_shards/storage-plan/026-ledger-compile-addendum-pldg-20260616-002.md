# Shard 026: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/storage-plan.md`

Source lines: L14940-L15002

Source SHA256: `4b568e104eac2542617874a190fe38590d4ddd1308f60187f8310ff8899c74ec`

---

## Ledger Compile Addendum - pldg-20260616-002

### SP-215 - GoalRun Receipt And Evidence Persistence

```yaml
plan_unit_id: SP-215
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  storage-plan owns persistence and projection boundaries for GoalRun, WorkGraph, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, WorkNodeReceipt, and GoalCompletionReceipt records. Stored records preserve goal_id, workgraph/worknode refs, verification cycle status, defect signature, repair cycle, requested/effective provider/model/account, capability_lane, agent_role, write_mode, certification_tier, worktree lease refs, evidence refs, artifact refs, restart/model-switch lineage, and retention anchors. Concrete persisted event names and payload schemas remain deferred until contract/storage registration.
gui_related: false
gui_classification_reason: Receipt and evidence persistence is backend storage behavior; GUI panels consume projections.
depends_on:
  - SP-214
  - CV-288
unblocks: []
acceptance_criteria:
  - Storage records preserve GoalRun, WorkGraph, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, WorkNodeReceipt, and GoalCompletionReceipt identity.
  - Evidence, artifact, worktree lease, requested/effective runtime, capability lane, write mode, certification tier, restart, and model-switch refs are not lost.
  - Runtime Artifacts and GUI surfaces consume projections instead of becoming durable truth.
  - Concrete goal event names and payload schemas remain deferred until owner registration.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future GoalRun storage contract review
risk_class: goalrun_evidence_persistence_gap
reasoning_tier: high
context_scope: goalrun_storage
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: goalrun_receipt_evidence_persistence
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0014
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0015
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0052
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0056
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0071
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0091
preserved_exact_tokens:
  - "GoalRun"
  - "WorkGraph"
  - "SubagentWave"
  - "VerificationCycle"
  - "DefectBundle"
  - "RepairWorkNode"
  - "WorkNodeReceipt"
  - "GoalCompletionReceipt"
  - "capability_lane"
  - "write_mode"
  - "certification_tier"
negative_constraints:
  - Do not let storage deferral drop required receipt or evidence fields.
  - Do not make GUI projections durable source of truth.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
```
