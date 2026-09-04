# Shard 041: PlanUnits

Source: `Plans/FinalGUISpec.md`

Source lines: L5152-L5203

Source SHA256: `d5dd0b8f0f130cf3a4834576d4ac87136d579819ec48bf6b3f165ac4874adc2b`

---

## PlanUnits

### F3-002 - Owner Section Scope

```yaml
plan_unit_id: F3-002
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  FinalGUISpec owner-section requirements are canonical live specification text for preserving
  product, runtime, storage, UI, and governance details in owner-section form.
gui_related: true
gui_classification_reason: >-
  This unit defines user-visible GUI surface, shell, copy, control, or projection behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The covered source span remains losslessly available for exact-text audit."
- "The behavior is addressable through this fine-grained PlanUnit instead of broad F3-001 coverage."
- "ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: owner_section_scope
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:FinalGUISpec-S0002"
preserved_exact_tokens:
- "canonical live specification text"
- "product"
- "runtime"
- "storage"
- "UI"
- "governance"
- "owner document"
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "FinalGUISpec.md owns these GUI specification sections."
owner_hints:
- "Plans/FinalGUISpec.md"
```
