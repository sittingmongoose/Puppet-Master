# Shard 047: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/assistant-chat-design.md`

Source lines: L22192-L22249

Source SHA256: `130d1d1b68c992876a6fab7d020cf9f24240580e796785bfb91b5557a32b4e1c`

---

## Ledger Compile Addendum - pldg-20260616-002

### ACD-420 - Visible Chat Goal Boundary And Doc Builder Exclusion

```yaml
plan_unit_id: ACD-420
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat owns visible Goal mode controls and completion presentation for user-directed goals, including pause, resume, stop, status, child-goal summaries, and completion reports. Chat may expose Orchestrator Goal handoff status, but Doc Builder's conversational ledger capture and invisible Requirements Doc Builder conversion remain ledger and Goal Runtime flows, not ordinary chat-owned WorkNodes.
gui_related: true
gui_classification_reason: Assistant Chat goal controls, status, and completion reports are user-visible chat UI.
depends_on:
  - ACD-416
  - ACD-418
  - GRS-002
unblocks: []
acceptance_criteria:
  - Assistant Chat continues to expose visible Goal mode control actions and completion report status.
  - Chat can show Orchestrator Goal handoff status without owning GoalRun scheduler or receipt authority.
  - Requirements Doc Builder conversational ledger capture is not represented as a default chat-owned WorkNode.
  - Invisible Doc Builder conversion remains a Goal Runtime integration with ledger lineage.
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
node_compile_hint:
  mode: assistant_chat_goal_boundary
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0003
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0005
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0008
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0079
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0103
preserved_exact_tokens:
  - "Goal mode exposed to the user in chat assistant"
  - "pause"
  - "resume"
  - "stop"
  - "completion report"
  - "Requirements Doc Builder"
  - "invisible Goal Mode"
negative_constraints:
  - Do not let chat presentation replace Goal Runtime receipt authority.
  - Do not treat Doc Builder invisible goals as default Orchestrator WorkNodes.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
  - Plans/chain-wizard-flexibility.md
```
