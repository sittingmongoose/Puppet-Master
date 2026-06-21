# Shard 037: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L10061-L10136

Source SHA256: `0bb989004ab59492ebece74db2d19344b5a672d52c303484828fc038cac5fcbe`

---

## Ledger Compile Addendum - pldg-20260616-002

### CWF-151 - PRD Builder Legacy Compatibility Ledger To Invisible Goal Flow

```yaml
plan_unit_id: CWF-151
unit_type: requirement
status: retired
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  PRD Builder uses a conversational v2 ledger phase to co-shape and preserve requirements intent; Requirements Doc Builder survives here only as a compatibility/source-lineage label for the same migrated product surface. After the user accepts the ledger-ready state, an invisible Goal Mode conversion may produce requirements docs, Plans, work-graph preparation artifacts, and conversion audit evidence, with any work-graph preparation artifact boundary routed through Plan_To_Node_Compilation/PNC-009. The conversational phase is not a Goal run by default, and the invisible conversion is not a default Orchestrator WorkNode unless the user explicitly asks to hand it to Orchestrator.
gui_related: true
gui_classification_reason: PRD Builder conversation, readiness, handoff, and status behavior are user-visible builder UI.
depends_on:
  - CWF-150
  - GRS-003
  - CW-008
  - PNC-009
unblocks: []
acceptance_criteria:
  - PRD Builder preserves user intent in a v2 ledger before invisible conversion.
  - Requirements Doc Builder appears only as a compatibility/source-lineage label for the migrated PRD Builder surface.
  - The user-visible readiness state distinguishes conversational ledger capture from invisible Goal conversion.
  - Invisible conversion can emit requirements docs, Plans, work-graph preparation artifacts, and conversion audit evidence.
  - Work-graph preparation artifacts route through the Plan_To_Node_Compilation compiler boundary and do not become executable WorkNodes by default.
  - Orchestrator handoff is explicit rather than the default execution identity.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future PRD Builder legacy compatibility flow review
risk_class: prd_builder_legacy_runtime_drift
reasoning_tier: high
context_scope: prd_builder_legacy_compatibility
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/chain-wizard.md
  - Plans/Goal_Runtime_System.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: prd_builder_legacy_ledger_to_invisible_goal
  create_worknodes: false
source_lineage:
  - pldg-20260618-001-prd-planning-wizard:atom-0001
  - pldg-20260618-001-prd-planning-wizard:atom-0002
  - pldg-20260618-001-prd-planning-wizard:atom-0004
  - pldg-20260618-001-prd-planning-wizard:atom-0158
  - pldg-20260618-001-prd-planning-wizard:atom-0159
  - pldg-20260618-001-prd-planning-wizard:atom-0160
  - pldg-20260618-001-prd-planning-wizard:atom-0161
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0004
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0007
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0103
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0028
preserved_exact_tokens:
  - "Requirements Doc Builder"
  - "ledger system"
  - "conversational"
  - "invisible Goal Mode"
  - "requirements docs"
  - "work-graph preparation artifacts"
  - "Plan_To_Node_Compilation"
  - "not a default Orchestrator WorkNode"
compatibility_only_notes:
  - "'Requirements Doc Builder' is retained in this PlanUnit only as the former label for PRD Builder."
stale_retired_dispositions:
  - Requirements Doc Builder is not the active finished-product name; PRD Builder is current.
negative_constraints:
  - Do not use Requirements Doc Builder as an active current-product name.
  - Do not treat conversational ledger capture as Goal execution by default.
  - Do not bypass ledger preservation, readiness, or audit evidence.
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/chain-wizard.md
  - Plans/Goal_Runtime_System.md
  - Plans/Plan_To_Node_Compilation.md
```
