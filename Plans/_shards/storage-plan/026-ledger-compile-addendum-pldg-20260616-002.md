# Shard 026: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/storage-plan.md`

Source lines: L15110-L15229

Source SHA256: `6a4eb20b9d80825dd1ca6acc4735de58c878a316d4183d8632bc80fb2d0b63da`

---

## Ledger Compile Addendum - pldg-20260616-002

### SP-215 - GoalRun Receipt And Evidence Persistence

```yaml
plan_unit_id: SP-215
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  storage-plan owns persistence and projection boundaries for GoalRun, WorkGraph, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, VerificationReceipt, WorkNodeReceipt, and GoalCompletionReceipt records. Stored VerificationCycle fields preserve verification_cycle_id, target_ref, attempt, status failed | passed | blocked only, typed VerificationFinding details, findings, defect_signatures, finding type, failing check, affected artifact/path/span, root_cause_key, repeated_signature_count, prior repair strategies, repair_strategy, and next_required_action alongside the broader GoalRun status projection. Stored records preserve goal_id, workgraph/worknode refs, GoalRun/WorkNode projection status values ready, running, provisional_success, verifying, failed_verification, repairing, certified, failed, blocked, cancelled, and stopped, defect signature, repair cycle, requested/effective provider/model/account refs, capability_lane, agent_role, write_mode, certification_tier, worktree lease refs, evidence refs, artifact refs, restart/model-switch lineage, and retention anchors. Stored VerificationReceipt fields include verifier identity, findings, defect signatures, passed/failed/skipped validator outputs, repair-cycle refs, and regression checks. Stored WorkNodeReceipt fields include executor identity, input refs, output refs, changed artifacts, validators run, evidence refs, and unresolved risks. Stored GoalCompletionReceipt fields include child receipts, WorkNode receipts, changed artifacts, validator outcomes, authority checks, and final certifier decision. Evidence refs distinguish acceptance criteria, live evidence, tests, diffs, validator outputs, canonical evidence, source evidence, process evidence, and governance evidence. GoalRun replay rebuilds projections from append-only goal_run.* events, goal receipt records, WorkNode receipts, safe-point/source-control receipts, and Executor/Auditor receipt chains; older replan_generation attempts and safe points remain queryable as historical records but are never resumable when superseded.
gui_related: false
gui_classification_reason: Receipt and evidence persistence is backend storage behavior; GUI panels consume projections.
depends_on:
  - SP-214
  - CV-288
unblocks: []
acceptance_criteria:
  - Storage records preserve GoalRun, WorkGraph, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, VerificationReceipt, WorkNodeReceipt, and GoalCompletionReceipt identity.
  - Stored VerificationCycle records preserve verification_cycle_id, target_ref, attempt, status failed | passed | blocked, typed VerificationFinding details, findings, defect_signatures, finding type, failing check, affected artifact/path/span, root_cause_key, repeated_signature_count, prior repair strategies, repair_strategy, and next_required_action.
  - GoalRun/WorkNode projection lifecycle values ready, running, provisional_success, verifying, failed_verification, repairing, certified, failed, blocked, cancelled, and stopped are not persisted as VerificationCycle.status.
  - Evidence, artifact, worktree lease, requested/effective runtime, capability lane, write mode, certification tier, restart, model-switch, verifier/executor/certifier identity, validator outcome, authority check, and unresolved-risk refs are not lost.
  - Evidence refs retain acceptance criteria, live evidence, tests, diffs, validator outputs, canonical evidence, source evidence, process evidence, and governance evidence classifications.
  - Runtime Artifacts and GUI surfaces consume projections instead of becoming durable truth.
  - GoalRun replay discloses stale, degraded, or unavailable projection state and falls back to record-backed inspection.
  - Older replan_generation attempts and safe points remain queryable but not resumable when superseded.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-goal-runtime-event-fixtures
risk_class: goalrun_evidence_persistence_gap
reasoning_tier: high
context_scope: goalrun_storage
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/goal_runtime_events.schema.json
  - Plans/WorktreeGitImprovement.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
  - Plans/Permissions_System.md
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
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0053
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0056
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0071
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0072
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0091
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0094
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
  - "attempt"
  - "status failed | passed | blocked"
  - "VerificationFinding"
  - "findings"
  - "finding type"
  - "failing check"
  - "affected artifact/path/span"
  - "root_cause_key"
  - "defect_signatures"
  - "repeated_signature_count"
  - "prior repair strategies"
  - "repair_strategy"
  - "next_required_action"
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
  - Do not expand VerificationCycle.status beyond failed | passed | blocked; ready/running/provisional_success/verifying/failed_verification/repairing/certified/failed/blocked/cancelled/stopped are GoalRun/WorkNode projection lifecycle values.
  - Do not resume superseded GoalRun attempts from stale projections.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Permissions_System.md
```
