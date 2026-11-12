# Shard 050: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/assistant-chat-design.md`

Source lines: L23547-L23620

Source SHA256: `b4d0a4d8ff0879dc647c9d6989ddfc930317d1880d11b8e99d9862e330f0de7a`

---

## Ledger Compile Addendum - pldg-20260616-002

### ACD-420 - Visible Chat Goal Boundary And Doc Builder Exclusion

```yaml
plan_unit_id: ACD-420
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat projects user-requested Goals through the current text-only Goal/Activity contract,
  including app Goals. Crew is an existing collaboration overlay, not child-goal orchestration. PRD
  Builder, Planning Wizard and Orchestrator retain real Project admission and their own owner boundaries.
  Conversion alone admits none of their compiler/WorkNode/certification engines.
gui_related: true
gui_classification_reason: Assistant Chat goal controls, status, and completion reports are user-visible chat UI.
depends_on:
    - ACD-416
    - ACD-418
    - GRS-002
    - PNC-009
unblocks: []
acceptance_criteria:
  - Assistant Chat continues to expose visible Goal mode control actions and completion report status.
  - Chat can show Orchestrator Goal handoff status without owning GoalRun scheduler or receipt authority.
  - PRD Builder conversational intake is not represented as a default chat-owned WorkNode.
  - Legacy invisible Requirements Doc Builder conversion remains a Goal Runtime compatibility integration with ledger lineage only.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Assistant Chat Goal UI review
risk_class: chat_goal_boundary_drift
reasoning_tier: standard
context_scope: assistant_chat_goal_mode
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
  - Plans/chain-wizard-flexibility.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: assistant_chat_goal_boundary
  create_worknodes: false
source_lineage:
  - "pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0003"
  - "pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0005"
  - "pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0008"
  - "pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0079"
  - "pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0103"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens:
  - "Goal mode exposed to the user in chat assistant"
  - "pause"
  - "resume"
  - "stop"
  - "completion report"
  - "Requirements Doc Builder"
  - "invisible Goal Mode"
  - "Planning_Ledger_System"
  - "Plan_To_Node_Compilation"
  - "PNC-009"
negative_constraints:
  - Do not let chat presentation replace Goal Runtime receipt authority.
  - Do not treat legacy Doc Builder invisible goals as default Orchestrator WorkNodes.
stale_retired_dispositions:
  - "Requirements Doc Builder is retained here only for legacy invisible Goal Runtime compatibility lineage; current product prose uses PRD Builder."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
  - Plans/chain-wizard-flexibility.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_To_Node_Compilation.md
```
