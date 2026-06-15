# Shard 019: Ledger Compile Addendum - pldg-20260615-001

Source: `Plans/Wiring_Matrix.md`

Source lines: L2913-L2994

Source SHA256: `b08cf4c54b9292599261ec1ecb9dfe01c02080ca309a46af4066d141b0336783`

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
gui_related: true
gui_classification_reason: The unit wires runtime events and allowed actions to user-visible Run Graph, Orchestrator, chat, dashboard, and recovery UI consumers.
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
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, Spec Lock, shards, evidence bundles, plan_graph, or auto_decisions are created or updated.
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
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: runtime_wiring_addenda_consolidation
  create_worknodes: false
source_lineage:
  - pldg-20260615-001-part-4-fable-cleanup:atom-0015
  - pldg-20260615-001-part-4-fable-cleanup:atom-0018
  - local:Plans/Wiring_Matrix.md:207
  - local:Plans/Wiring_Matrix.md:251
  - local:Plans/Wiring_Matrix.md:276
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
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/Run_Graph_View.md
```
