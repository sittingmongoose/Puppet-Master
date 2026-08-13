# Shard 026: PMConcept7 Home Workspace command reconciliation — 2026-08-04

Source: `Plans/UI_Command_Catalog.md`

Source lines: L10933-L11047

Source SHA256: `fef0868f7da38b681f9c712a396c6e6017c55441019bf5c4621e2896c5a26fd4`

---

## PMConcept7 Home Workspace command reconciliation — 2026-08-04

The Home workspace reuses `cmd.panel.undock`, `cmd.panel.redock`,
`cmd.browser.open_workspace_preview`, `cmd.browser.open_detached_preview`,
`cmd.browser.detach_browser_tab`, `cmd.file.open`, `cmd.terminal.reattach_section`,
and `cmd.theme.set_mode` where their existing
owner contracts already cover the action. `cmd.panel.switch` retains its closed
side-panel vocabulary and is not extended with editor panels, Dashboard, or
terminal sections. `cmd.file.open_with`, `cmd.widget.*`, and
`cmd.terminal.move_pane` retain their existing owner semantics and are not
overloaded with Home surface or workgroup placement semantics.

### New command IDs

| Command ID | Typed arguments and effect | Owner |
|---|---|---|
| `cmd.editor.open_panel` | `project_id`, `workspace_tab_id`, `editor_panel_id`, `target_host?`, `target_slot_index?`, `expected_layout_revision`, `idempotency_key`; opens one stable editor panel without creating buffers | FileManager/FinalGUISpec |
| `cmd.editor.close_panel` | `project_id`, `workspace_tab_id`, `editor_panel_id`, `close_reason`, `expected_layout_revision`, `idempotency_key`; hides the panel without closing tabs or dirty buffers | FileManager/FinalGUISpec |
| `cmd.workspace_layout.move_surface` | `project_id`, `workspace_tab_id`, `surface_instance_id`, `source_host`, `target_host`, `target_slot_index?`, `target_surface_instance_id?`, `insertion_edge?`, `expected_layout_revision`, `idempotency_key`; one semantic move commit | FinalGUISpec/storage-plan |
| `cmd.workspace_layout.resize_surface` | `project_id`, `workspace_tab_id`, `surface_instance_id`, committed width/height/flex values, `expected_layout_revision`, `idempotency_key`; one resize-end commit | FinalGUISpec/storage-plan |
| `cmd.workspace_layout.set_collapsed` | `project_id`, `workspace_tab_id`, `surface_instance_id`, `collapsed`, `expected_layout_revision`, `idempotency_key`; changes presentation collapse only | FinalGUISpec/storage-plan |
| `cmd.workspace_layout.reset` | `project_id`, `workspace_tab_id`, `expected_layout_revision`, `idempotency_key`; resets Home placement only | FinalGUISpec/storage-plan |
| `cmd.terminal.move_workgroup` | `project_id`, `terminal_workgroup_id`, `source_terminal_section_id`, `target_terminal_section_id?`, `create_target_section`, `target_workspace_host?`, `target_slot_index?`, `preserve_session_identity=true`, expected terminal/layout revisions, `idempotency_key`; moves the whole workgroup without minting a PTY | Section15/storage-plan |

### Open-file and Browser target extension

`OpenFile` carries `path`, `line?`, `range?`,
`target_editor_panel_id?`, and `target_editor_group_id?`. `target_group?`
is retained only as an explicit compatibility alias for
`target_editor_group_id?`; it is not a second semantic target.
`cmd.browser.open_workspace_preview` accepts the same optional editor panel/group
target fields and retains focused-panel behavior when omitted. No near-duplicate
open or layout command is introduced.

When either optional editor target causes a persisted panel-visibility or Browser
placement change, the command also emits `workspace.layout_changed` with the exact
changed surface IDs, hosts, slot, revision, and persistence result. A no-change
focus emits no fabricated layout event; the existing Browser session events remain
canonical for Browser creation and state.

Every Home command uses the standard typed UICommand envelope, expected layout
revision, idempotency key, projected availability, and disabled reason. Preview
frames do not dispatch commands, persist records, or emit domain events.

Opening the compact Home menu, either side flyout, a surface options popup, or the
File Manager target flyout is disclosure-only and remains view-local. Selecting
one leaf dispatches exactly one semantic command. An already-open panel or already
active Browser target uses the same command ID with a typed `no_change` receipt;
it never mints a second identity. Disabled terminal limits and an ineligible
Collapse action do not dispatch. Persistence failure returns the command's typed
failed/rolled-back receipt and emits no success event.

### UCC-144 - Home Workspace Command Routing And Leaf Semantics

```yaml
plan_unit_id: UCC-144
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Home disclosure controls are view-local and every selected leaf maps one-to-one to the
  existing typed panel, Browser, file, terminal, theme, or bounded Home command family with
  projected disabled/no-change/failure semantics and no command overload. Amended
  2026-08-12 - the per-surface Move or dock menu leaves are retired as affordances;
  cmd.workspace_layout.move_surface is unchanged and is dispatched from the surface grab
  handle (pointer drag or keyboard pick-up/move/drop) and from the live drop regions, still
  exactly one command and one persist per semantic commit.
  cmd.workspace_layout.set_collapsed is dispatched with the negated current value by the
  terminal collapse chevron, which is a toggle, while the top-bar Collapse Bottom Terminal
  row remains one-way. No new command IDs are minted. Amended 2026-08-13 - Reset Layout is
  dual-surface: the top-bar Home menu Reset Layout row and the Settings Startup & Recovery
  row both dispatch the same cmd.workspace_layout.reset; the concept demo's page reload
  after the top-bar reset is demo-flow behavior only and is not part of the typed command
  contract. Pop Out generalizes: the editor panel, Chat, and Dashboard Pop Out rows all
  dispatch cmd.panel.undock into the single in-canvas float system, and cmd.panel.undock
  and cmd.panel.redock are unchanged. Dragging a surface past the window edge is
  invalid_target and dispatches nothing. Still no new command IDs.
gui_related: true
gui_classification_reason: This unit owns command IDs, typed arguments, availability, disabled reasons, and results for visible Home controls.
split_recommended: false
depends_on: [UCC-143, F3-501]
unblocks: [CV-323, F-080, SMPFS-138, UIW-010]
acceptance_criteria:
- cmd.file.open_with retains exactly source_editor, image_viewer, workspace_preview, detached_preview, and diff_review; Panel 1 through Panel 4 routing is only on cmd.file.open/OpenFile fields.
- No Home surface uses cmd.widget.* and cmd.panel.switch keeps its existing side-panel vocabulary.
- cmd.workspace_layout.move_surface is reachable by pointer drag and by keyboard from the grab handle, and carries target_slot_index, target_surface_instance_id and insertion_edge unchanged.
- cmd.workspace_layout.set_collapsed round-trips collapse and expand from the terminal chevron with one command per activation.
- Open/focus Browser in Panels 1 through 4 uses cmd.browser.open_workspace_preview with target_editor_panel_id and target_editor_group_id.
- One changed drop/resize dispatches and persists exactly once; pointermove, disclosure, cancellation, unchanged drop, window-exit during a drag, and disabled actions do not dispatch a changed command.
- cmd.workspace_layout.reset is dispatched identically from the top-bar Reset Layout row and from the Settings Startup & Recovery row; neither surface mints a new command ID and the concept demo's post-reset reload is not observable on the command bus.
- cmd.panel.undock is dispatched from the Pop Out row on editor panels, Chat, and Dashboard, each routing into the in-canvas float layer.
- Every applied/no_change/failed result follows CV-323 and the exact canonical event family.
validation_surfaces:
- python3 scripts/pm-validate-wiring-matrix.py
- node Concepts/pm7-tools/verify/home_workspace_matrix.mjs
- python3 scripts/pm-plan-index.py validate
risk_class: home_command_overload_or_orphan
reasoning_tier: standard
context_scope: home_command_routing
implementation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, Concepts/pm7-tools/home_workspace_source.py]
node_compile_hint:
  mode: home_command_catalog
  create_worknodes: false
source_lineage:
- PMConcept7_Home_Workspace_Audit_Packet_v1/shared/04_COMMAND_EVENT_STORAGE_WIRING.md
preserved_exact_tokens: [cmd.file.open_with, cmd.file.open, cmd.browser.open_workspace_preview, cmd.widget.*, no_change]
negative_constraints:
- Do not add Panel 1 through Panel 4 to cmd.file.open_with.
- Do not dispatch on pointermove or popup disclosure.
- Do not mint near-duplicate Home commands.
compatibility_only_notes:
- target_group is only an alias of target_editor_group_id.
stale_retired_dispositions: []
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Contracts_V0.md, Plans/UI_Wiring_Rules.md]
```
