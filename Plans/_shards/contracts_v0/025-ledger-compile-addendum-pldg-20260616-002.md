# Shard 025: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/Contracts_V0.md`

Source lines: L17364-L17476

Source SHA256: `0eaafb76ad2c020549f2b0338605377c5a1ddab901b1d3aa3167c39c88382a01`

---

## Ledger Compile Addendum - pldg-20260616-002

### CV-288 - GoalRun Verification And Receipt Contract Envelope

```yaml
plan_unit_id: CV-288
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 owns the shared envelope for GoalRun, WorkGraph, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, VerificationReceipt, WorkNodeReceipt, and GoalCompletionReceipt references. The envelope preserves goal_id, workgraph_ref, worknode_ref, verification_cycle_id, target_ref, GoalRun/WorkNode projection status values ready, running, provisional_success, verifying, failed_verification, repairing, certified, failed, blocked, cancelled, and stopped, repeated_signature_count, repair_strategy, next_required_action, route-open owner commands, page-local mutation semantics, receipt refs, evidence refs, adjudication refs, requested/effective runtime identity, write_mode, and certification_tier. The contract-owned VerificationCycle example shape preserves verification_cycle_id, target_ref, attempt, status failed | passed | blocked only, typed VerificationFinding details, findings, defect_signatures, finding type, failing check, affected artifact/path/span, root_cause_key, repeated_signature_count, prior repair strategies, repair_strategy, and next_required_action. VerificationReceipt preserves verifier identity, findings, defect signatures, passed/failed/skipped validator outputs, repair-cycle refs, and regression checks. WorkNodeReceipt preserves executor identity, input refs, output refs, changed artifacts, validators run, evidence refs, and unresolved risks. GoalCompletionReceipt preserves child receipts, WorkNode receipts, changed artifacts, validator outcomes, authority checks, and final certifier decision. Requested/effective provider/model/account meanings are owned by Models_System, Multi-Account, and provider-specific docs; write_mode authority and worktree lease semantics are owned by Permissions_System and WorktreeGitImprovement; this envelope only carries their references. Concrete goal event names and payload minima are registered by CV-287 and stored/replayed under storage-plan.
gui_related: false
gui_classification_reason: Shared contract envelopes and receipt references are backend/runtime schema work, not visual presentation.
depends_on:
  - CV-286
  - CV-287
  - SP-214
unblocks: []
acceptance_criteria:
  - Shared references exist for GoalRun, WorkGraph, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, VerificationReceipt, WorkNodeReceipt, and GoalCompletionReceipt.
  - VerificationCycle records preserve verification_cycle_id, target_ref, attempt, status failed | passed | blocked, typed VerificationFinding details, findings, defect_signatures, finding type, failing check, affected artifact/path/span, root_cause_key, repeated_signature_count, prior repair strategies, repair_strategy, next_required_action, evidence, and adjudication refs.
  - Receipt envelopes preserve requested/effective runtime identity, write_mode, certification_tier, verifier/executor/certifier identity, changed artifacts, validator outcomes, authority checks, evidence refs, and unresolved risks.
  - Route-open owner commands and page-local mutation semantics do not mint unauthorized panel-local mutations.
  - Concrete goal event payload minima are registered by CV-287 and storage-plan owns persistence/replay schemas.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-goal-runtime-event-fixtures
risk_class: goalrun_contract_envelope_gap
reasoning_tier: high
context_scope: goalrun_shared_contracts
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
  - Plans/Permissions_System.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: goalrun_verification_receipt_envelope
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0014
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0015
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0019
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0021
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0022
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0026
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0033
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0036
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0052
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0053
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0056
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0091
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0094
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
  - "route-open"
  - "owner commands"
  - "page-local mutation semantics"
  - "passed/failed/skipped"
  - "repair-cycle refs"
  - "regression checks"
negative_constraints:
  - Do not invent additional persisted goal event names outside CV-287.
  - Do not let contract envelopes own Goal Runtime lifecycle semantics.
  - Do not expand VerificationCycle.status beyond failed | passed | blocked; ready/running/provisional_success/verifying/failed_verification/repairing/certified/failed/blocked/cancelled/stopped are GoalRun/WorkNode projection lifecycle values.
  - Do not mint unauthorized panel-local mutations.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
  - Plans/Permissions_System.md
  - Plans/WorktreeGitImprovement.md
```
