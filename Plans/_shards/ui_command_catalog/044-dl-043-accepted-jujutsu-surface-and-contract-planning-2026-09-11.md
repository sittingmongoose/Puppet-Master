# Shard 044: DL-043 — Accepted Jujutsu Surface And Contract Planning (2026-09-11)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L13028-L13160

Source SHA256: `e4c23ee572a4c6025140e570dc9f0837a474d3ce1e7952c8f9414f2838ce59d1`

---

## DL-043 — Accepted Jujutsu Surface And Contract Planning (2026-09-11)

This addendum compiles accepted planning decisions only. Live semantic owners retain command admission, native behavior, authorization and evidence authority. Existing command schemas and production wiring remain unchanged.

### UCC-162 — Jujutsu Accepted Action Planning And Admission Boundary

```yaml
plan_unit_id: UCC-162
unit_type: integration_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: DL-043 accepts the visible capabilities in F3-552 through F3-560 for planning. This unit does
  not register command IDs, handlers or production rows. Each distinct semantic action requires its owner-qualified
  request/result/availability contract and exact catalog admission before dispatch; the current Jujutsu schema
  remains closed to its 31 commands.
gui_related: true
gui_classification_reason: Defines visible actions, state, producer/consumer routes and user feedback.
depends_on:
- JJI-003
- UCC-155
- SCS-018
unblocks: []
acceptance_criteria:
- Maintain separate action specifications for group undo, redo, reverse selected operation, rewrite-preview start/apply/cancel
  and earlier-state browse/return; none can be implemented as an undocumented alias of another operation.
- Each mutation specification records exact target and expected native identities, writer lease, authorization,
  FileSafe, idempotency, confirmation where required, ObservableWork and typed terminal receipt, with the JJI-003
  accepted/terminal distinction.
- Convergence, duplicate, merge, absorb and back-out require individual native semantic qualification and admission.
  Drag and keyboard are producers of the same selected admitted semantic operation. A structured hunk selection
  is typed input to the owner, never a second runtime.
- Bookmark resolution reuses existing admitted bookmark mutations. Read/navigation/presentation actions are explicitly
  classified; a persistent marker, visibility update, managed preview or export is not disguised as a view-local
  action.
- A future admitted row supplies label, purpose, command kind, request/response, owner, all producers and reverse
  consumers, availability/disabled reasons, accessibility/focus return and one handler. Until qualification and
  admission, controls explain unsupported or handler_unavailable and cannot dispatch through a generic command
  escape hatch.
- No mutation is inferred from natural-language descriptions, command-log text, labels, recent list ordering or
  preview selection. Alias normalization precedes policy and does not create another handler or receipt.
validation_surfaces:
- Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_identity_authority_or_effect_misrepresentation
reasoning_tier: high
context_scope: dl043_accepted_jujutsu_planning
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d001
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d002
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d003
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d004
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d005
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d006
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d007
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d008
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d009
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d010
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d011
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d012
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d013
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d014
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d015
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d016
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d017
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d018
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d019
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d027
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d028
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d029
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d030
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d031
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d032
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d035
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d037
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d038
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d039
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d040
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d042
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d043
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d044
- Plans/Decision_Log.md:DL-043
negative_constraints:
- 'Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema widening,
  WorkNode, NodeSeed or governance seal follows from this unit.'
- Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control library,
  external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or specialized
  AI workspace-review workflow.
owner_boundary_notes:
- Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation,
  Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe
  independently own safety, and Forge owns hosted workflows.
owner_hints:
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/FinalGUISpec.md
- Plans/Backup_Restore_System.md
- Plans/FileManager.md
- Plans/Forge_Integrations.md
- Plans/FileSafe.md
```

### UCC-163 — Jujutsu Consumer Action Inventory And Return Context

```yaml
plan_unit_id: "UCC-163"
unit_type: "integration_contract"
status: "accepted"
owner_doc: "Plans/UI_Command_Catalog.md"
canonical_text: "Every accepted action or visible state has a bounded intended consumer and exact initiating-context return contract. F3-552 through F3-560 own the visible distinctions; this inventory expresses future routing obligations and is not runtime or schema admission."
gui_related: true
gui_classification_reason: "Defines visible actions, state, producer/consumer routes and user feedback."
depends_on: ["UCC-162", "F3-552", "F3-553", "F3-554", "F3-555", "F3-556", "F3-557", "F3-558", "F3-559", "F3-560"]
unblocks: []
acceptance_criteria: ["Operation History owns markers, grouping, recent actions, action/time filters, descriptions, group undo, redo and selected-operation reversal; a named historical target carries its exact operation through preview and result.", "Source Control history/graph and change detail own rewrite preview/apply, earlier-state browsing, comparison/evolution, lane/query assistance, pinned details and change-editing actions; Files consumes bounded attribution/file-history, review correspondence and hunk selection without inventing mutation authority.", "Workspace manager and setup own read-only mode, adoption/repair and hide/unhide; Backup/history diagnostics own maintenance and separately authorized missing-data completion; technical diagnostics own explicit sanitized export and optional command log.", "Publication and review consumers bind explicit provider/workflow identity for conflict publication, bookmark alternatives, stack publication and additional-service capability; hosting failures retain independent local navigation.", "All applicable menu, palette, pointer, keyboard, Files, Settings, Project, Doctor, internal agent and owner-route consumers share their admitted semantic route and return exact repository/workspace/revision, selection, caller route/focus and invocation/currentness context. An unavailable producer retains a reason and does not fall through to hidden Git or shell mutation."]
validation_surfaces: ["Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures", "python3 scripts/pm-plan-index.py validate"]
risk_class: "jujutsu_identity_authority_or_effect_misrepresentation"
reasoning_tier: "high"
context_scope: "dl043_accepted_jujutsu_planning"
implementation_surfaces: ["Plans/UI_Command_Catalog.md", "Plans/Jujutsu_Integration.md", "Plans/Source_Control_System.md"]
node_compile_hint: {"mode": "accepted_planning_contract_only", "create_worknodes": false, "create_nodeseeds": false}
source_lineage: ["source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d001", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d002", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d003", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d004", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d005", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d006", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d007", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d008", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d009", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d010", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d011", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d012", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d013", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d014", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d015", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d016", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d017", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d018", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d019", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d027", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d028", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d029", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d030", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d031", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d032", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d035", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d037", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d038", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d039", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d040", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d042", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d043", "source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d044", "Plans/Decision_Log.md:DL-043"]
negative_constraints: ["Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema widening, WorkNode, NodeSeed or governance seal follows from this unit.", "Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control library, external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or specialized AI workspace-review workflow."]
owner_boundary_notes: ["Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation, Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe independently own safety, and Forge owns hosted workflows."]
owner_hints: ["Plans/Jujutsu_Integration.md", "Plans/Source_Control_System.md", "Plans/FinalGUISpec.md", "Plans/Backup_Restore_System.md", "Plans/FileManager.md", "Plans/Forge_Integrations.md", "Plans/FileSafe.md"]
```
