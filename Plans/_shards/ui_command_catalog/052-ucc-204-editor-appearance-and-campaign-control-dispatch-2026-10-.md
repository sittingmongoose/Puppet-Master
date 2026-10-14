# Shard 052: UCC-204 — Editor appearance and campaign control dispatch (2026-10-14)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L15883-L15954

Source SHA256: `cdd1dd4ca4b3ebd5ab26f34d954d0f8323bf1ea54aa1eb55e596e7df80aac388`

---

## UCC-204 — Editor appearance and campaign control dispatch (2026-10-14)

```yaml
plan_unit_id: UCC-204
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.editor.appearance.set is a shell_view command with normalization.kind none, normalizes_to_contract F3-651
  and no alias. Its typed request/result are Plans/editor_appearance.schema.json; it changes only an existing
  editor tab's sparse appearance fields under the Project/workspace context and owner-state guard. A null field
  clears its override; a token-map null entry clears that key, revealing the next layer. Reset and quick sets
  are one atomic patch, never one dispatch per field. The result is a bounded applied/no_change/refused/failed
  receipt with owner readback, no domain event and no workspace.layout_changed. No Project returns
  no_project_context and no write. All editors and All terminals, Settings fields, wallpaper selection and
  resetting those Project values compose the existing cmd.settings.transaction.preview and
  cmd.settings.transaction.apply with exact inventory ids; the same CAS/permission/readback rules apply and no
  app-global fallback is admitted. This terminal retains cmd.terminal.appearance.set and import retains
  cmd.terminal.appearance.import_scheme. CS-102 and WM-093 enumerate typed local affordances and producer
  bindings; local previews never run a shell command or modify a real file. No new shortcut is added for
  Customize: More, Open Customize and Indentation are keyboard-reachable entry points. Panel split/move keys
  retain UCC-200's Alt+Shift+arrows; the earlier concept Ctrl+Alt claim is retired. Notification toast dismissal
  is view-local and moves a lasting notice into the inbox without resolving it; inbox dismissal uses
  cmd.alert.dismiss, and Clear all composes that existing command for the captured eligible ids/revisions,
  preserving truthful per-item refusals and keeping arrivals after the capture. Existing notice action commands
  retain domain approval semantics. This unit creates no bulk resolve or dismiss-all command.
gui_related: true
gui_classification_reason: Defines or binds user-visible PM7 campaign behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- A This editor patch cannot change another tab, Project setting, file or structural layout revision.
- Each durable producer maps to the one writer for its selected scope; no local action also has a catalog command
  row.
- Clear all cannot resolve a domain condition, clear new arrivals or hide a refused dismissal.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_campaign
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-notifications/NOTES.md, SHA-256 f09d2b8856652950762b6580b8ebab43022bdf053272738f52720de25922a895
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-panel-dnd-resize/NOTES.md, SHA-256 03a80f0dea3235ea637149bbec63626c4a4be8521078f9dd601f2b691f03d2d6
  (approved campaign source lineage; not native implementation evidence)
- Plans/Commands_System.md#CS-102
- Plans/Wiring_Matrix.md#WM-093
- Plans/Settings_System.md#SSYS-009
- Plans/storage-plan.md#SP-333
preserved_exact_tokens:
- cmd.editor.appearance.set
negative_constraints: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Commands_System.md#CS-102, ContractName:Plans/Wiring_Matrix.md#WM-093, ContractName:Plans/Settings_System.md#SSYS-009, ContractName:Plans/storage-plan.md#SP-333

| command_id | Label | Arguments | Preconditions | command_kind | normalization.kind | normalizes_to_contract | alias_of_command_id | Event |
|---|---|---|---|---|---|---|---|---|
| `cmd.editor.appearance.set` | Customize this editor | `project_id`, `workspace_tab_id`, `panel_tab_id`, `expected_state_hash`, `idempotency_key`, `fields` (strict field patch; null clears) | Current Project and existing editor tab, matching saved-state hash, permitted write, serialized state within SP-330 bound; schema `Plans/editor_appearance.schema.json#/$defs/request` | `shell_view` | `none` | `F3-651` | null | none; nonstructural receipt |
