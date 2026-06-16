# Shard 024: Ledger Compile Addendum - pldg-20260614-001

Source: `Plans/Models_System.md`

Source lines: L7233-L7268

Source SHA256: `6da0c29a05f08d750d91c32658484506b8ec1e8eac510c6af4b41cdbf3c7879c`

---

## Ledger Compile Addendum - pldg-20260614-001

### MS-107 - Provider Model Precedence Owner Pointer Compile Addendum

```yaml
plan_unit_id: MS-107
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  Models_System owns provider/model precedence, model availability, and provider/model selection semantics. Executor, WorktreeGitImprovement,
  orchestrator-subagent-integration, and Crosswalk consume this owner section when they need dispatch-time carry-through; they must not define
  independent provider/model precedence rules in empty owner stubs.
gui_related: true
gui_classification_reason: Provider/model precedence affects visible model selectors and settings, even though the owner rule is shared runtime metadata.
depends_on: [MS-001]
unblocks: []
acceptance_criteria:
  - Provider/model precedence stubs in adjacent docs point to Models_System or consume its PlanUnits.
  - Dispatch-time carry-through preserves requested and effective provider/model identity without creating a second precedence owner.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual provider/model owner review
risk_class: provider_model_precedence_drift
reasoning_tier: standard
context_scope: provider_model_precedence_owner
implementation_surfaces: [Plans/Models_System.md, Plans/Executor_Protocol.md, Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: provider_model_owner_pointer, create_worknodes: false}
source_lineage:
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0070
  - pldg-20260614-001-part-2-cleanup-fable-audit:atom-0072
preserved_exact_tokens: ["Coverage blocker provider/model precedence owner section", "provider/model precedence", "dispatch-time carry-through", "requested_provider", "effective_provider", "requested_model", "effective_model"]
negative_constraints:
  - Do not make Executor or WorktreeGitImprovement replace Models_System provider/model precedence ownership.
owner_hints: [Plans/Models_System.md, Plans/Executor_Protocol.md, Plans/WorktreeGitImprovement.md, Plans/orchestrator-subagent-integration.md]
```
