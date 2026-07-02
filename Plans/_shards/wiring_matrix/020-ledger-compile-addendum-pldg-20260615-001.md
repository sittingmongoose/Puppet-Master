# Shard 020: Ledger Compile Addendum - pldg-20260615-001

Source: `Plans/Wiring_Matrix.md`

Source lines: L2990-L3150

Source SHA256: `706b23aeae0e3a6b18fd2b9f9790023b13f5094d62a12bc95f330dc441beb64a`

---

## Ledger Compile Addendum - pldg-20260615-001

### WM-036 - Runtime Wiring Addenda Consolidation Boundary

```yaml
plan_unit_id: WM-036
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Wiring_Matrix runtime recovery, blocked/unblocked, safe-point, remediation,
  canonical event row, and recovery action-binding addenda are consolidated into
  explicit producer/consumer/action wiring PlanUnits. Historical `Scheduler/Remediation/Event
  Wiring Addendum (2026-03-08)`, `Canonical Runtime Event Wiring Canonical Alignment
  (2026-03-09)`, and `Canonical Runtime Producer Consumer and Action Wiring Canonical
  Alignment (2026-03-09)` headings remain source-lineage and compatibility search
  targets; wiring implementers must follow the named PlanUnits and referenced
  Contracts_V0 event identities instead of inferring precedence from adjacent
  addendum order.
gui_related: false
gui_classification_reason: This unit defines runtime producer/consumer/action wiring and precedence; GUI consumers are referenced, but the unit does not define visual presentation.
depends_on:
  - WM-012
  - WM-013
  - WM-014
  - WM-015
  - WM-016
  - WM-017
unblocks: []
acceptance_criteria:
  - Runtime wiring precedence is explicit through PlanUnits for blocked/unblocked, safe-point, remediation, packet wiring, canonical event rows, and recovery action binding.
  - Legacy aliases and addendum headings/dates remain auditable without becoming competing wiring canon.
  - Wiring_Matrix remains a wiring-row owner and does not replace Contracts_V0 event identity or Executor scheduler ownership.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, product implementation files, Rust/Slint app scaffolds, legacy Iced app files, or production build tasks are created; explicit governance/index/evidence refreshes are recorded in the repair/seal artifacts.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260615-001-part-4-fable-cleanup
risk_class: wiring_addenda_precedence_drift
reasoning_tier: high
context_scope: wiring_matrix_runtime_addenda_consolidation
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
  - Plans/Run_Graph_View.md
  - Plans/Orchestrator_Page.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: runtime_wiring_addenda_consolidation
  create_worknodes: false
source_lineage:
  - pldg-20260615-001-part-4-fable-cleanup:atom-0013
  - pldg-20260615-001-part-4-fable-cleanup:atom-0014
  - pldg-20260615-001-part-4-fable-cleanup:atom-0015
  - pldg-20260615-001-part-4-fable-cleanup:atom-0018
  - local:Plans/Wiring_Matrix.md:207
  - local:Plans/Wiring_Matrix.md:243
  - local:Plans/Wiring_Matrix.md:255
  - local:Plans/Wiring_Matrix.md:282
preserved_exact_tokens:
  - "Scheduler/Remediation/Event Wiring Addendum (2026-03-08)"
  - "Runtime recovery wiring requirements (2026-03-09)"
  - "Canonical Runtime Event Wiring Canonical Alignment (2026-03-09)"
  - "Canonical Runtime Producer Consumer and Action Wiring Canonical Alignment (2026-03-09)"
  - "node.blocked"
  - "node.unblocked"
  - "wizard.blocked"
  - "wizard.unblocked"
  - "attempt.started"
  - "attempt.completed"
  - "node.prerequisite_resolved"
  - "run.graph_canonical_locked"
  - "run.graph_integrity_failed"
  - "safe_point.created"
  - "safe_point.restored"
  - "remediation.spawned"
  - "remediation.resolved"
  - "allowed_action_id"
negative_constraints:
  - Do not rely on adjacent addendum order as wiring precedence.
  - Do not make Wiring_Matrix a general runtime schema owner.
compatibility_only_notes:
  - Plans/chain-wizard-flexibility.md remains the wizard_status / wizard blocked lifecycle consumer/existing-coverage surface for wizard.blocked / wizard.unblocked; WM-036 only wires canonical event/action identities.
  - Cited wiring addenda sections are compatibility/source-lineage sections; named wiring PlanUnits and Contracts_V0 event identities carry precedence.
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
  - Plans/Run_Graph_View.md
  - Plans/Orchestrator_Page.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/chain-wizard-flexibility.md
```

### WM-037 - Assistant Chat Goal Command Wiring

```yaml
plan_unit_id: WM-037
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Wiring_Matrix binds Assistant Chat Goal Mode command producers to stable command IDs and the Goal Runtime controller. Goal button/chip/icon activation and slash `/goal` dispatch `cmd.chat.goal.start`; Goal status update icon, `/goal again`, and natural-language update requests dispatch `cmd.chat.goal.update`. Wiring uses the Goal Runtime event envelope and does not define concrete Goal event payload schemas.
gui_related: true
gui_classification_reason: This unit wires user-visible Assistant Chat Goal button, chip, icon, slash command, and status update surfaces to command IDs.
depends_on:
  - UCC-096
  - CS-051
  - ACD-416
unblocks: []
acceptance_criteria:
  - Goal activation producers route to `cmd.chat.goal.start`.
  - Goal update producers route to `cmd.chat.goal.update`.
  - Goal command wiring targets the Goal Runtime controller without re-owning Goal Runtime lifecycle semantics.
  - Wiring rows avoid inventing concrete Goal event names or payload schemas.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future wiring coverage validation
risk_class: goal_command_wiring_gap
reasoning_tier: standard
context_scope: assistant_chat_goal_commands
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: assistant_chat_goal_command_wiring
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0017
  - pldg-20260616-001-goal-runtime-system:atom-0024
  - pldg-20260616-001-goal-runtime-system:atom-0025
  - pldg-20260616-001-goal-runtime-system:atom-0030
  - pldg-20260616-001-goal-runtime-system:dec-0008
  - source_ref:audit-20260616-006-goal-runtime-system:SR-018
preserved_exact_tokens:
  - "/goal"
  - "/goal again"
  - "cmd.chat.goal.start"
  - "cmd.chat.goal.update"
  - "Goal button/chip/icon"
  - "Goal status update icon"
negative_constraints:
  - Do not make Wiring_Matrix the owner of concrete Goal Runtime event payload schemas.
  - Do not route Goal command wiring through unregistered local command IDs.
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
```
