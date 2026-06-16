# Shard 024: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/Contracts_V0.md`

Source lines: L17182-L17246

Source SHA256: `288295cdcf8a8a624ff14efcb1b53dfd566889c06a307d5f56e885ebb5f4f094`

---

## Ledger Compile Addendum - pldg-20260616-002

### CV-288 - GoalRun Verification And Receipt Contract Envelope

```yaml
plan_unit_id: CV-288
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 owns the shared envelope for GoalRun, WorkGraph, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, WorkNodeReceipt, and GoalCompletionReceipt references. The envelope preserves goal_id, workgraph_ref, worknode_ref, verification_cycle_id, target_ref, repeated_signature_count, repair_strategy, next_required_action, receipt refs, evidence refs, adjudication refs, requested/effective runtime identity, write_mode, and certification_tier. Concrete goal event payload schemas remain deferred until promoted by contract and storage owners.
gui_related: false
gui_classification_reason: Shared contract envelopes and receipt references are backend/runtime schema work, not visual presentation.
depends_on:
  - CV-286
  - CV-287
  - SP-214
unblocks: []
acceptance_criteria:
  - Shared references exist for GoalRun, WorkGraph, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, WorkNodeReceipt, and GoalCompletionReceipt.
  - VerificationCycle records preserve target, status, repeated signature count, repair strategy, next required action, evidence, and adjudication refs.
  - Receipt envelopes preserve requested/effective runtime identity, write_mode, and certification_tier.
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
node_compile_hint:
  mode: goalrun_verification_receipt_envelope
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0014
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0015
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0019
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
  - "WorkNodeReceipt"
  - "GoalCompletionReceipt"
  - "repeated_signature_count"
  - "repair_strategy"
negative_constraints:
  - Do not invent concrete persisted goal event payload schemas in this PlanUnit.
  - Do not let contract envelopes own Goal Runtime lifecycle semantics.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
```
