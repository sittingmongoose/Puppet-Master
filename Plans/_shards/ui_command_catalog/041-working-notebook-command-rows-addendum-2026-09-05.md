# Shard 041: Working Notebook Command Rows Addendum (2026-09-05)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L15811-L15888

Source SHA256: `c4b3d3c6fe4f3dfa169b498f7d98f0cbe5de95057424ad835055a045300aa72d`

---

## Working Notebook Command Rows Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Three catalog rows are registered above with candidate dispositions: `cmd.chat.open_working_notebook` (opens the thread Working Notebook editor/detail tab), `cmd.chat.request_fresh_context` (separately labeled fresh-context request distinct from Compact Now), and `cmd.orchestrator.open_notebook` (selected run/worker notebook access). Disposition truth: these rows are Plans-level command contracts only — no production wiring row exists in `Plans/Wiring_Matrix.production.json`, no handler is registered, and no event family is persisted; a dispatch before wiring fails closed with `command_not_registered`/`unknown_command` per the strict overlay (`error_codes`/`disabled_reason_codes` vocabularies unchanged). Payloads/availability/owner refs: `cmd.chat.open_working_notebook { thread_id }` requires a valid Project-bound thread; `cmd.chat.request_fresh_context { thread_id }` requires transition eligibility and returns `requested | deferred | denied` truthfully with disabled reasons; `cmd.orchestrator.open_notebook { focused_run_id, subject_id }` requires a selected run/worker.

```yaml
plan_unit_id: UCC-158
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: 'Three Working Notebook command rows are registered with truthful candidate dispositions (cmd.chat.open_working_notebook,
  cmd.chat.request_fresh_context, cmd.orchestrator.open_notebook). No production wiring row, handler, or persisted
  event family exists for them; dispatch before wiring fails closed (command_not_registered/unknown_command),
  and every row names payload, availability, owner refs, and error vocabulary within the existing strict overlay.
  Amended 2026-10-09 (DL-180): when admitted, cmd.chat.open_working_notebook opens a document tab through the
  one opening module with CV-360''s placement fields (UCC-200); its candidate disposition is unchanged.


  Current projects-refresh contract: No project is genuine application scope, with a named fixed Computer after
  first message, lazy visible chat folder and no invented Project/Vault. Admit ordinary files/browser/editor/terminal/tools/notebook/history/recovery
  under exact app roots and owner versions, retaining private notebook/memory isolation and counterpart limits.
  Six projects.* read tools return explicit requested/looked_in/not_looked_in/partial coverage; source read
  grants do not authorize writes. Existing cmd.thread.request/spawn Send uses current local previews and receiver
  authority; maximum three automatic round trips. Two equal conversion choices share one manifest/copy-check/cutover/report/Undo
  engine; stop/fence Goal/Crew/Plan/timers and use linked destination records by default. No new work plus
  seven days bounds chat Undo, not independent canonical custody. Screen use is off until exact chat/app/controller/disclosure
  admission, with one targeted Stop. The exact consumer contract is UCC-216/WM-102 and Plans/projects_refresh_command_bindings.json.
  Historical schema/hash/replay resources and all unrelated PM7 service/FO-22/motion/auth/identity clauses
  remain as specified; unavailable handlers remain handler_unavailable.'
gui_related: true
gui_classification_reason: Command catalog rows define user-visible command contracts.
depends_on:
- UCC-157
- WN-019
- DL-180
unblocks: []
acceptance_criteria:
- Every proposed visible action has availability, payload, owner, errors, and registration disposition.
- An unregistered candidate is not presented as a working command anywhere.
- Validate application versus actual Project-target cases, original exact Project replay, stale scope/preview/permission/Stop/return
  refusal and the exact command/local/tool binding from UCC-216; no native/event/governance proof follows from
  static closure.
validation_surfaces:
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
- python3 scripts/pm-plans-verify.py run-gates
risk_class: phantom_command
reasoning_tier: high
context_scope: ui_commands
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/UI_Wiring_Rules.md
- Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: command_catalog_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_packet:PM-WNC-2026-09-05-v1:WNC-X05
- source_packet:PM-WNC-2026-09-05-v1:WNC-A53
- source_ref:chat:2026-11-03-projects-pass2-approved
preserved_exact_tokens:
- cmd.chat.open_working_notebook
- cmd.chat.request_fresh_context
- cmd.orchestrator.open_notebook
- candidate_not_registered
- command_not_registered
negative_constraints:
- Do not add production wiring rows for unwired candidate commands.
- Do not claim handlers or emitted events from schema/catalog rows.
- Do not replace a required real target with focus, a synthetic Project, an empty identity or borrowed app/source
  authority.
stale_retired_dispositions:
- 'Amended 2026-10-09 (DL-180): the Working Notebook opens as a document tab when admitted.'
owner_hints:
- Plans/UI_Command_Catalog.md
- Plans/UI_Wiring_Rules.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/Working_Notebook.md
