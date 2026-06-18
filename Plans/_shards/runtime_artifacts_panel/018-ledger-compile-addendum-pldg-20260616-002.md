# Shard 018: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L653-L732

Source SHA256: `5c878b9ad9d6f6c67618d3ceed33d14e6f908843fa7ab9feaeb2fb1e05cb08bd`

---

## Ledger Compile Addendum - pldg-20260616-002

### RAP-027 - Goal Runtime Receipt And Verification Evidence Projection

```yaml
plan_unit_id: RAP-027
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts projects Goal Runtime receipt and verification evidence without becoming the receipt owner. It must expose WorkNodeReceipt, GoalCompletionReceipt, VerificationReceipt, validator evidence, adjudication records, repair cycles, restart records, model-switch evidence, skipped validator reasons, unresolved risks, certification status, and evidence taxonomy across acceptance criteria, live evidence, tests, diffs, validator outputs, canonical evidence, source evidence, process evidence, and governance evidence through artifact identity and open-by-artifact routing, with degraded views when underlying storage or contract records are stale.
gui_related: true
gui_classification_reason: Runtime Artifacts receipt, evidence, restart, and model-switch projection is a user-visible panel behavior.
depends_on:
  - RAP-024
  - RAP-026
  - CV-288
  - SP-215
  - GRS-027
unblocks: []
acceptance_criteria:
  - Runtime Artifacts can show WorkNodeReceipt and GoalCompletionReceipt references.
  - Runtime Artifacts can show VerificationReceipt references, skipped validator reasons, unresolved risks, and certification status.
  - Validator evidence, adjudication records, repair cycles, restart records, and model-switch evidence are visible through artifact identity.
  - Evidence projection distinguishes acceptance criteria, live evidence, tests, diffs, validator outputs, canonical evidence, source evidence, process evidence, and governance evidence.
  - Stale or missing owner records degrade the view rather than becoming artifact truth.
  - Runtime Artifacts does not replace Contracts_V0 or storage-plan receipt authority.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Runtime Artifacts receipt projection review
risk_class: receipt_projection_authority_drift
reasoning_tier: high
context_scope: goal_runtime_artifacts
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: goal_runtime_receipt_artifact_projection
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0021
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0051
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0052
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0060
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0062
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0071
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0091
preserved_exact_tokens:
  - "WorkNodeReceipt"
  - "GoalCompletionReceipt"
  - "VerificationReceipt"
  - "validator evidence"
  - "adjudication records"
  - "repair cycles"
  - "skipped validator reasons"
  - "unresolved risks"
  - "certification status"
  - "acceptance criteria"
  - "live evidence"
  - "tests"
  - "diffs"
  - "validator outputs"
  - "canonical evidence"
  - "source evidence"
  - "process evidence"
  - "governance evidence"
  - "Runtime Artifacts"
  - "restart"
  - "model switch"
negative_constraints:
  - Do not let Runtime Artifacts replace receipt authority.
  - Do not hide stale owner records behind apparently final evidence.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
```
