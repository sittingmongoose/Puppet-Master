# Shard 040: Working Notebook Command Rows Addendum (2026-09-05)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L12858-L12897

Source SHA256: `3ff2b67914c1b2b6ac34a5b6f9f5f28ff45d1cdb51c68bd2a0156e21f4c0a764`

---

## Working Notebook Command Rows Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Three catalog rows are registered above with candidate dispositions: `cmd.chat.open_working_notebook` (opens the thread Working Notebook editor/detail tab), `cmd.chat.request_fresh_context` (separately labeled fresh-context request distinct from Compact Now), and `cmd.orchestrator.open_notebook` (selected run/worker notebook access). Disposition truth: these rows are Plans-level command contracts only — no production wiring row exists in `Plans/Wiring_Matrix.production.json`, no handler is registered, and no event family is persisted; a dispatch before wiring fails closed with `command_not_registered`/`unknown_command` per the strict overlay (`error_codes`/`disabled_reason_codes` vocabularies unchanged). Payloads/availability/owner refs: `cmd.chat.open_working_notebook { thread_id }` requires a valid Project-bound thread; `cmd.chat.request_fresh_context { thread_id }` requires transition eligibility and returns `requested | deferred | denied` truthfully with disabled reasons; `cmd.orchestrator.open_notebook { focused_run_id, subject_id }` requires a selected run/worker.

```yaml
plan_unit_id: UCC-158
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Three Working Notebook command rows are registered with truthful candidate dispositions (cmd.chat.open_working_notebook, cmd.chat.request_fresh_context, cmd.orchestrator.open_notebook). No production wiring row, handler, or persisted event family exists for them; dispatch before wiring fails closed (command_not_registered/unknown_command), and every row names payload, availability, owner refs, and error vocabulary within the existing strict overlay.
  Amended 2026-10-09 (DL-180): when admitted, cmd.chat.open_working_notebook opens a document tab through the one opening module with CV-360's placement fields (UCC-200); its candidate disposition is unchanged.
gui_related: true
gui_classification_reason: Command catalog rows define user-visible command contracts.
depends_on: [UCC-157, WN-019, DL-180]
unblocks: []
acceptance_criteria:
  - Every proposed visible action has availability, payload, owner, errors, and registration disposition.
  - An unregistered candidate is not presented as a working command anywhere.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: phantom_command
reasoning_tier: high
context_scope: ui_commands
implementation_surfaces: [Plans/UI_Command_Catalog.md, Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: command_catalog_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-X05
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A53
preserved_exact_tokens: ["cmd.chat.open_working_notebook", "cmd.chat.request_fresh_context", "cmd.orchestrator.open_notebook", "candidate_not_registered", "command_not_registered"]
negative_constraints:
  - Do not add production wiring rows for unwired candidate commands.
  - Do not claim handlers or emitted events from schema/catalog rows.
stale_retired_dispositions:
  - "Amended 2026-10-09 (DL-180): the Working Notebook opens as a document tab when admitted."
owner_hints: [Plans/UI_Command_Catalog.md, Plans/UI_Wiring_Rules.md]
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/Working_Notebook.md
