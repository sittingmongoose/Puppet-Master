# Shard 024: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/Contracts_V0.md`

Source lines: L17182-L17277

Source SHA256: `ebc3c68907f77ac66eb2b1deb461089af20bed76a95ece6eaa5a083a39b5a91e`

---

## Ledger Compile Addendum - pldg-20260616-002

### CV-288 - GoalRun Verification And Receipt Contract Envelope

```yaml
plan_unit_id: CV-288
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 owns the shared envelope for GoalRun, WorkGraph, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, VerificationReceipt, WorkNodeReceipt, and GoalCompletionReceipt references. The envelope preserves goal_id, workgraph_ref, worknode_ref, verification_cycle_id, target_ref, status values ready, running, provisional_success, verifying, failed_verification, repairing, certified, failed, blocked, cancelled, and stopped, repeated_signature_count, repair_strategy, next_required_action, route-open owner commands, page-local mutation semantics, receipt refs, evidence refs, adjudication refs, requested/effective runtime identity, write_mode, and certification_tier. VerificationReceipt preserves verifier identity, findings, defect signatures, passed/failed/skipped validator outputs, repair-cycle refs, and regression checks. WorkNodeReceipt preserves executor identity, input refs, output refs, changed artifacts, validators run, evidence refs, and unresolved risks. GoalCompletionReceipt preserves child receipts, WorkNode receipts, changed artifacts, validator outcomes, authority checks, and final certifier decision. Requested/effective provider/model/account meanings are owned by Models_System, Multi-Account, and provider-specific docs; this envelope only carries their references. Concrete goal event payload schemas remain deferred until promoted by contract and storage owners.
gui_related: false
gui_classification_reason: Shared contract envelopes and receipt references are backend/runtime schema work, not visual presentation.
depends_on:
  - CV-286
  - CV-287
  - SP-214
unblocks: []
acceptance_criteria:
  - Shared references exist for GoalRun, WorkGraph, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, VerificationReceipt, WorkNodeReceipt, and GoalCompletionReceipt.
  - VerificationCycle records preserve target, full status enum, repeated signature count, repair_strategy, next required action, evidence, and adjudication refs.
  - Receipt envelopes preserve requested/effective runtime identity, write_mode, certification_tier, verifier/executor/certifier identity, changed artifacts, validator outcomes, authority checks, evidence refs, and unresolved risks.
  - Route-open owner commands and page-local mutation semantics do not mint unauthorized panel-local mutations.
  - Concrete goal event payload schemas remain deferred until owner registration.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future GoalRun contract registration review
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
  - "repeated_signature_count"
  - "repair_strategy"
  - "route-open"
  - "owner commands"
  - "page-local mutation semantics"
  - "passed/failed/skipped"
  - "repair-cycle refs"
  - "regression checks"
negative_constraints:
  - Do not invent concrete persisted goal event payload schemas in this PlanUnit.
  - Do not let contract envelopes own Goal Runtime lifecycle semantics.
  - Do not mint unauthorized panel-local mutations.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Provider_OpenCode.md
```
