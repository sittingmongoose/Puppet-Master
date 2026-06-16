# Shard 036: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L10012-L10067

Source SHA256: `0b73f2f9279538abf08313620fd9f5d277911139b86a3ab9b23e127ce0b86230`

---

## Ledger Compile Addendum - pldg-20260616-002

### CWF-151 - Requirements Doc Builder Ledger To Invisible Goal Flow

```yaml
plan_unit_id: CWF-151
unit_type: requirement
status: accepted
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: >-
  Requirements Doc Builder uses a conversational v2 ledger phase to co-shape and preserve requirements intent. After the user accepts the ledger-ready state, an invisible Goal Mode conversion may produce requirements docs, Plans, work-graph preparation artifacts, and conversion audit evidence. The conversational phase is not a Goal run by default, and the invisible conversion is not a default Orchestrator WorkNode unless the user explicitly asks to hand it to Orchestrator.
gui_related: true
gui_classification_reason: Requirements Doc Builder conversation, readiness, handoff, and status behavior are user-visible wizard/builder UI.
depends_on:
  - CWF-150
  - GRS-003
  - CW-008
unblocks: []
acceptance_criteria:
  - Requirements Doc Builder preserves user intent in a v2 ledger before invisible conversion.
  - The user-visible readiness state distinguishes conversational ledger capture from invisible Goal conversion.
  - Invisible conversion can emit requirements docs, Plans, work-graph preparation artifacts, and conversion audit evidence.
  - Orchestrator handoff is explicit rather than the default execution identity.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Requirements Doc Builder flow review
risk_class: requirements_doc_builder_runtime_drift
reasoning_tier: high
context_scope: requirements_doc_builder
implementation_surfaces:
  - Plans/chain-wizard-flexibility.md
  - Plans/chain-wizard.md
  - Plans/Goal_Runtime_System.md
  - Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: requirements_doc_builder_ledger_to_invisible_goal
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0004
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0007
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0103
preserved_exact_tokens:
  - "Requirements Doc Builder"
  - "ledger system"
  - "conversational"
  - "invisible Goal Mode"
  - "requirements docs"
  - "not a default Orchestrator WorkNode"
negative_constraints:
  - Do not treat conversational ledger capture as Goal execution by default.
  - Do not bypass ledger preservation, readiness, or audit evidence.
owner_hints:
  - Plans/chain-wizard-flexibility.md
  - Plans/chain-wizard.md
  - Plans/Goal_Runtime_System.md
```
