# Shard 020: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L760-L833

Source SHA256: `27d5680bbb7e65b143de99d8f12198cffadc4cb6cd207ccf58e749406862f5be`

---

## Ledger Compile Addendum - pldg-20260616-002

### RAP-027 - Goal Runtime Receipt And Verification Evidence Projection

```yaml
plan_unit_id: RAP-027
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts projects receipt and evidence records without becoming the receipt owner. It must expose WorkNodeReceipt, validator evidence, restart records, model-switch evidence, skipped validator reasons, unresolved risks, and evidence taxonomy across acceptance criteria, live evidence, tests, diffs, validator outputs, canonical evidence, source evidence, process evidence, and governance evidence through artifact identity and open-by-artifact routing, with degraded views when underlying storage or contract records are stale.
gui_related: true
gui_classification_reason: Runtime Artifacts receipt, evidence, restart, and model-switch projection is a user-visible panel behavior.
depends_on:
  - RAP-024
  - RAP-026
  - CV-288
  - GRS-053
unblocks: []
acceptance_criteria:
  - Runtime Artifacts can show WorkNodeReceipt references and Goal evidence under GRS-053.
  - Runtime Artifacts can show skipped validator reasons and unresolved risks from owner records.
  - Validator evidence, restart records, and model-switch evidence are visible through artifact identity.
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
  - "validator evidence"
  - "skipped validator reasons"
  - "unresolved risks"
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
