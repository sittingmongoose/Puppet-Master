# Shard 026: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/storage-plan.md`

Source lines: L14940-L15035

Source SHA256: `e7d2e77ccb09b5fd2c5cb96752eaebce9a4a281e7db3a5ee8c5894c69b1f45d7`

---

## Ledger Compile Addendum - pldg-20260616-002

### SP-215 - GoalRun Receipt And Evidence Persistence

```yaml
plan_unit_id: SP-215
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  storage-plan owns persistence and projection boundaries for GoalRun, WorkGraph, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, VerificationReceipt, WorkNodeReceipt, and GoalCompletionReceipt records. Stored records preserve goal_id, workgraph/worknode refs, verification cycle status values ready, running, provisional_success, verifying, failed_verification, repairing, certified, failed, blocked, cancelled, and stopped, defect signature, repair cycle, requested/effective provider/model/account refs, capability_lane, agent_role, write_mode, certification_tier, worktree lease refs, evidence refs, artifact refs, restart/model-switch lineage, and retention anchors. Stored VerificationReceipt fields include verifier identity, findings, defect signatures, passed/failed/skipped validator outputs, repair-cycle refs, and regression checks. Stored WorkNodeReceipt fields include executor identity, input refs, output refs, changed artifacts, validators run, evidence refs, and unresolved risks. Stored GoalCompletionReceipt fields include child receipts, WorkNode receipts, changed artifacts, validator outcomes, authority checks, and final certifier decision. Evidence refs distinguish acceptance criteria, live evidence, tests, diffs, validator outputs, canonical evidence, source evidence, process evidence, and governance evidence. Concrete persisted event names and payload schemas remain deferred until contract/storage registration.
gui_related: false
gui_classification_reason: Receipt and evidence persistence is backend storage behavior; GUI panels consume projections.
depends_on:
  - SP-214
  - CV-288
unblocks: []
acceptance_criteria:
  - Storage records preserve GoalRun, WorkGraph, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, VerificationReceipt, WorkNodeReceipt, and GoalCompletionReceipt identity.
  - Evidence, artifact, worktree lease, requested/effective runtime, capability lane, write mode, certification tier, restart, model-switch, verifier/executor/certifier identity, validator outcome, authority check, and unresolved-risk refs are not lost.
  - Evidence refs retain acceptance criteria, live evidence, tests, diffs, validator outputs, canonical evidence, source evidence, process evidence, and governance evidence classifications.
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
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
node_compile_hint:
  mode: goalrun_receipt_evidence_persistence
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0014
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0015
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0021
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0022
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0033
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0036
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0051
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0052
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0056
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0071
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0072
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0091
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0102
preserved_exact_tokens:
  - "GoalRun"
  - "WorkGraph"
  - "SubagentWave"
  - "VerificationCycle"
  - "DefectBundle"
  - "RepairWorkNode"
  - "VerificationReceipt"
  - "WorkNodeReceipt"
  - "GoalCompletionReceipt"
  - "ready"
  - "running"
  - "provisional_success"
  - "verifying"
  - "failed_verification"
  - "repairing"
  - "certified"
  - "failed"
  - "blocked"
  - "cancelled"
  - "stopped"
  - "capability_lane"
  - "write_mode"
  - "certification_tier"
  - "verifier identity"
  - "executor identity"
  - "final certifier decision"
  - "validator outputs"
  - "canonical evidence"
  - "source evidence"
  - "process evidence"
  - "governance evidence"
negative_constraints:
  - Do not let storage deferral drop required receipt or evidence fields.
  - Do not make GUI projections durable source of truth.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
```
