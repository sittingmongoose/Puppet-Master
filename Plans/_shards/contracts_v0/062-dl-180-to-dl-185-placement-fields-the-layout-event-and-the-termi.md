# Shard 062: DL-180 to DL-185 — Placement fields, the layout event and the terminal's agent fields (2026-10-09)

Source: `Plans/Contracts_V0.md`

Source lines: L23587-L23952

Source SHA256: `7a63689307b14a7c68ab2e251dff6df3c6fdbcf43a3869ba122b27cc2f23bda1`

---

## DL-180 to DL-185 — Placement fields, the layout event and the terminal's agent fields (2026-10-09)

This addendum compiles two of Jared's decisions of 2026-10-09 into data contracts: `Plans/Decision_Log.md#DL-180` (one universal panel system) and `#DL-181` (one terminal session per tab, shared safely by people and agents). It adds three units. CV-360 is the placement field set every open route carries and the result an open returns. CV-361 is the `workspace.layout_changed` 2.0.0 payload. CV-362 holds the fields that record who typed a command, an agent's write grant and the refusals an agent can receive. CV-360 replaces OpenFile's `target_editor_panel_id`, `target_editor_group_id` and `target_group` as home placement. CV-361 replaces CV-323's 1.1.0 payload and withdraws `terminal.workgroup_moved`. The following are amended in place: CV-055, CV-163, CV-165, CV-172 and CV-323; the PMConcept7 Home Workspace OpenFile placement addendum; section 7.3 (focus fields, object kinds, destination classes and reuse); section 7.5 (what the Terminal settings own); and the PMConcept7 Home Workspace event contracts. The opening rules belong to `Plans/FinalGUISpec.md#F3-634` and `Plans/DRY_Rules.md#DR-071`, the commands to `Plans/UI_Command_Catalog.md#UCC-200` and `#UCC-201`, the layout record to `Plans/storage-plan.md#SP-330`, and the agent rules to `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-182`. This document owns field names, values and results only.

Amended 2026-10-10 (DL-186, DL-187, DL-188): Jared's answers of 2026-10-10 are compiled into these units in place. Event Authority admitted `workspace.layout_changed` 2.0.0 (D42, DL-188), so CV-361, CV-323 and the PMConcept7 Home Workspace event contracts no longer wait for that admission. CV-361 also records that the chat's pop-out is never saved (D32), that its `command_id` list names every open route (with `cmd.chat.plan.open_version`, lead ruling F8), and which dashboard, preset and Debug Console changes append nothing (D10, D33, D35). CV-360 adds `cmd.chat.plan.open_version` and the one Debug Console tab (D33). CV-362 is unchanged.

### Placement fields (CV-360)

One placement field set travels beside the identity fields of every route that can open something in a home panel: `cmd.panel_tab.open`, `cmd.file.open` (`OpenFile`), `cmd.nav.open_subject` (`route_target` plus `OpenSubject`), `cmd.browser.open_workspace_preview` and `cmd.terminal.open`, and every route that UCC-200 maps onto them. The fields are never part of route identity (section 7.3).

| Field | Values | Default | Meaning |
|---|---|---|---|
| `where` | `auto`, `tab`, `panel`, `right`, `down` or a panel id | `auto` | `auto` is the panel that F3-634's placement and kind affinity pick, skipping locked panels. `tab` is the panel the open came from. `panel` is a new panel by the fit rule (Alt+click). `right` and `down` split the source panel that way. A panel id is that panel; an id that names no panel in the tree reads as `auto`. |
| `mode` | `preview`, `keep` | `preview` for a person's single click on a file reference; `keep` for every other open | Only kinds with a preview tab use it (`Plans/FinalGUISpec.md#F3-635`); every other kind opens kept. |
| `by` | `user`, `agent:<name>` | `user` | Who asked for the open. `agent:<name>` always opens in the background and opens files kept. |
| `background` | `true`, `false` | `false` | A background open the user asked for (Ctrl+click or Cmd+click). Agent opens are always in the background, whatever this says. |

Amended 2026-10-10 (lead ruling L1): The open result names its home panel tab panel_tab_id; the page-tab route focus field stays tab_id.

Amended 2026-10-10 (DL-186, DL-187): the routes that carry these fields include `cmd.chat.plan.open_version` beside `cmd.chat.plan.open_details` (`Plans/UI_Command_Catalog.md#UCC-200`, lead ruling F8). The Debug Console is one tab, `debug-console`, with a sub-tab per debug session (D33): an open that names a debug session, or an older tab id of the form `debug-console:<session>`, opens or reveals that one tab and selects the session's sub-tab, which is view state with no receipt and no event (lead ruling F6); the older form is never minted again. A dashboard's tab id names its board (`dashboard:<board_id>`, `Plans/Widget_System.md#WS-030`), so opening a board that is open reveals its tab.

An open returns `{ ok, panel_tab_id, panel_id, created, reason }`. `panel_tab_id` is the panel tab id (the record key of SP-330, the argument UCC-200 calls `panel_tab_id`); it is not section 7.3's `tab_id` focus field. `panel_id` is the panel that holds the tab. `created` is `true` when the open added a tab and `false` when it revealed one. `reason` is null when `ok` is `true`; otherwise it is the refusal: `unknown_kind` for an id or kind no tab kind claims, `not_ready` while the layout has not loaded, or a refusal from the route's own error set.

One id is one tab in the whole workspace. When the id's tab is already open, the open reveals it where it is and never moves it, whatever `where` says: the result has `created: false` and the receipt is `no_change` with no event. Activating the tab and pulling it out of "+N" are view state. When the tab's panel is collapsed, the reveal expands it (`Plans/FinalGUISpec.md#F3-634`), and that expand is one committed `panel_expanded` change under the open's command id (CV-361), because the collapsed flag is part of the stored tree. The one exception is an open with `mode: keep` of an id whose tab is its panel's preview tab: the tab is kept in place, which is one `tab_kept` change (CV-361). An open that adds a tab commits once and appends one `workspace.layout_changed` with `change: tab_opened`. A preview open into a panel that already has a preview tab replaces that tab in place (`Plans/FinalGUISpec.md#F3-635`): it is still one `tab_opened`, whose `affected_tab_ids` name the new tab and the replaced one, and the replaced preview is dropped, never put on the closed-tab stack, because it was never kept. In the narrow centre (`Plans/FinalGUISpec.md#F3-636`), `panel`, `right` and `down` open in the next panel of the switcher instead of creating a panel. Focus and the announcement for `by` and `background` are F3-634's rules.

### The layout event (CV-361)

`workspace.layout_changed` keeps its event type and family and moves to payload 2.0.0, `Plans/event_payloads/workspace_layout_changed_v2.schema.json` (schema id `https://puppetmaster.local/schemas/event_payloads/workspace_layout_changed/2.0.0`). Event Authority admitted it on 2026-10-10 (`Plans/Decision_Log.md#DL-188`, Jared's D42, recorded as DL-039 and DL-045 were): `Plans/event_family_registry.json` registers the family at revision 2.0.0 with this payload, registry revision `2026-10-09.1`, still 43 families. (Amended 2026-10-10, DL-188: until then this paragraph said the move waited for that admission, with the family kept at 1.1.0, the 2.0.0 payload `requires_central_adjudication` and no 2.0.0 event appended.) Every committed structural change of the v2 Home layout appends exactly one, after the record has been written and read back (SP-330). Its `change` field names what happened:

| `change` | Commands |
|---|---|
| `tab_opened` | `cmd.panel_tab.open`, `cmd.panel_tab.reopen_closed`, and the open routes of CV-360 when they add a tab, a preview open that replaces the panel's preview tab included |
| `tab_closed` | `cmd.panel_tab.close` and its alias `cmd.editor.close_tab` |
| `tab_moved`, `tab_kept`, `tab_pinned`, `tab_unpinned`, `tab_renamed` | `cmd.panel_tab.move`, `.keep`, `.pin`, `.unpin`, `.rename`; `tab_kept` also under an open route of CV-360 with `mode: keep` on its panel's preview tab |
| `panel_split`, `panel_moved`, `panel_resized`, `panel_closed` | `cmd.workspace_layout.split`, `.move_surface`, `.resize_surface`, `.close_panel` |
| `panel_collapsed`, `panel_expanded` | `cmd.workspace_layout.set_collapsed`; `panel_expanded` also under an open route of CV-360 whose reveal expands the tab's collapsed panel |
| `panel_locked`, `panel_unlocked` | `cmd.workspace_layout.lock` |
| `named_layout_applied`, `named_layout_saved`, `layout_reset` | `cmd.workspace_layout.apply_named`, `.save_named`, `.reset` |
| `chat_column_changed` | `cmd.workspace_layout.resize_surface` with the chat (a width drag) |
| `migrated_from_v1` | The v1-to-v2 conversion of SP-330, with no command |

Beside `change`, the payload records what the change touched (`affected_tab_ids`, `affected_panel_ids`, `affected_split_ids`, `created_panel_ids`, `removed_panel_ids`, `named_layout_id`, `chat_column_fields`), the revision before and after (`prior_layout_revision`, `new_layout_revision`), the actor (`actor`: `user`, `agent:<name>` from CV-360's `by`, or `system` for the conversion), the command as its caller named it (`command_id`, null only for the conversion), `commit_origin`, the result and receipt references, `persisted=true`, `settled_only=true` and `preview_state_included=false`. A conversion also names its source in `migration_source_schema_id` (`pm.home_workspace_layout.v1` or `layout:v1`). An open that only reveals a tab, view state (`ui.panel_tab.activate`, `ui.workspace_layout.focus_panel`, `ui.workspace_layout.maximize`, the recent-tab order, History pinned, and the chat's show and hide through `cmd.panel.switch`, which writes the column's `shown`), menus, hover, drags and a release that changes nothing append nothing. A reveal that has to expand the tab's collapsed panel appends one `panel_expanded` under the open's command id (CV-360), and an open with `mode: keep` of a panel's preview tab appends one `tab_kept` under the open's command id. A preview open that replaces a panel's preview tab appends one `tab_opened` whose `affected_tab_ids` name both tabs; the replaced preview does not go onto the closed-tab stack. A failed write appends nothing and its receipt is `failed` with `rolled_back=true`.

Events written at 1.1.0 stay readable through the payload's `$defs/workspace_layout_changed_v1_compatibility_reader`; no 1.1.0 event is rewritten. A stored event's own `payload_schema_id` picks the schema it is validated against (`Plans/storage-plan.md#SP-273`): an event that names `.../workspace_layout_changed/1.1.0` is read and replayed by `Plans/event_payloads/workspace_layout_changed.schema.json`, which stays in place as that reader, while the family's registry row names 2.0.0 alone, so every new append carries 2.0.0. `terminal.workgroup_moved` is withdrawn under SMPFS-170's own rule (`Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-170`), with one session per tab owned by `#SMPFS-180`: no producer writes it, events already written stay readable at 1.0.0 under their existing retention, and moving a terminal tab is a `tab_moved` that keeps its session (DL-070's rule, carried by SMPFS-180). The withdrawal keeps SMPFS-170's unresolved original obligations: a move still pending or uncertain at upgrade is settled under SMPFS-170 and `Plans/storage-plan.md#SP-319` (a retry returns the same original result and event, and uncertainty fences without reminting) before SP-330's conversion reads the v1 terminal records, and no `terminal.workgroup_moved` is minted after it. The event family registry has no field that marks a family withdrawn, so its row stays as it was, citing this unit. `panel.undocked` and `panel.redocked` stay, for the chat's pop-out only (`Plans/UI_Command_Catalog.md#UCC-203`): a pop-out or return appends its own `panel.undocked` or `panel.redocked` and nothing else. The column's `popped_out` field is written with the record like view state, with no revision advance and no `workspace.layout_changed`. No new event family is added.

Amended 2026-10-10 (DL-187, D32): a chat popped out comes back in its column after a restart, so the pop-out is never saved: the v2 record has no `popped_out` field any more (`Plans/storage-plan.md#SP-330`), and the sentence above about writing it like view state no longer applies. The pop-out and its return still append only `panel.undocked` or `panel.redocked`.

Amended 2026-10-10 (DL-186, DL-187, DL-188): which commands carry the event. The payload's `command_id` list names every admitted route of `Plans/UI_Command_Catalog.md#UCC-200`'s table of routes that open or reveal a tab, `cmd.chat.plan.open_version`, `cmd.chat.plan.open_details` and `cmd.chat.attachment.open` included (the table's two candidates, `cmd.chat.open_working_notebook` and `cmd.terminal.open_retained_output`, join only when admitted), and the alias `cmd.editor.close_tab` (amended 2026-10-10, lead ruling: UCC-200's table now lists `cmd.chat.attachment.open`, which opens the attachment's document or artifact tab through the one opening module; it read: together with `cmd.chat.attachment.open`, whose production wiring row declares the event although the table does not list it yet, and the alias `cmd.editor.close_tab`); an event names the route its caller used. The `tab_opened` row accepts every one of those routes that can add a tab. Five routes of the table only reveal a tab that is already open and never add one: `cmd.terminal.show`, `cmd.terminal.focus`, `cmd.terminal.reveal`, `cmd.chat.focus_thread_context_details` and `cmd.run_debug.terminal.reveal`. They are accepted for `tab_kept` and `panel_expanded` with the rest, never for `tab_opened`, so a reveal of theirs into a collapsed panel is the one `panel_expanded` under its own command id that CV-360 describes. `cmd.browser.focus_browser_tab` stays a layout-only browser command that declares no event (the browser event rules): when the tab it focuses sits in a collapsed panel, the host expands the panel through `cmd.workspace_layout.set_collapsed`, which records the `panel_expanded` under its own id (lead ruling, 2026-10-10). `tab_closed` also accepts `cmd.chat.close_thread_context_details`. The list, less that alias, must equal the production wiring rows that declare `workspace.layout_changed`, and `scripts/pm-validate-pm7-gui-fixtures.py` checks it, so each of the five reveal routes' wiring rows declares the event too. Dashboards (DL-186): renaming a dashboard (Rename dashboard... renames its tab through `cmd.panel_tab.rename`) is one `tab_renamed`, and deleting one closes its tab through `cmd.panel_tab.close`, one `tab_closed`; forgetting the board's stored contents afterwards appends nothing. Widget commands inside a board, Start from and Reset (`cmd.widget.reset_layout` with or without `set_id`), a board's range and scope (`ui.widget_board.set_view`) and saving, renaming or deleting a preset (`ui.widget_preset.*`) never append `workspace.layout_changed` (`Plans/Widget_System.md#WS-030`). A named layout's board snapshot is written with `named_layout_saved` and put back with `named_layout_applied`; it adds no change kind. The Debug Console's chosen session sub-tab (DL-187, D33) is view state and appends nothing.

### The terminal's agent fields (CV-362)

These fields carry the rules of `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-182`; the rows and marks the user sees are `Plans/FinalGUISpec.md#F3-646`.

- **Who typed a command.** Every command record carries `by`: `user` or `agent:<name>`. It is written only from a shell-integration record that carries the terminal's secret (SMPFS-183); a mark without the secret attributes nothing. The stored command block keeps it as the optional `by` of `terminal_command_block` (`Plans/storage_value_registry.json`), absent or null when no trusted record attributed the command, as on every converted v1 row. Saved scrollback keeps it with each command record (SP-332).
- **The write grant.** An agent's grant to type in a terminal a human opened names `terminal_session_id`, `agent` and `grant`: `once` (Allow once: one command) or `this_terminal` (Allow in this terminal: until the terminal closes, the human takes over or that agent's run ends). `cmd.terminal.allow_agent_input` gives it, `cmd.terminal.deny_agent_input` refuses the pending write, `cmd.terminal.revoke_agent_input` takes it back, and `cmd.terminal.hand_back` gives a `this_terminal` grant again for the rest of the run (UCC-201). A grant is held in memory only. No storage family, setting, layout record, permission rule or event payload holds it, and it never stands in for the per-invocation approval of `Plans/Permissions_System.md#PS-041`. When a grant ends, the agent is told why: `command_finished` (a `once` grant after its command), `terminal_closed`, `taken_over`, `stopped`, `run_ended` or `revoked`.
- **Take-over.** A human keystroke in a terminal an agent is driving, or Take over, moves the writer lease to the human at once. The agent receives a notice naming `terminal_session_id` and `cause`: `keystroke` or `take_over`. `cmd.terminal.take_over` records both causes; a keystroke is recorded under that id with `origin: keystroke` (UCC-201).
- **Refusals.** An agent write that cannot reach the session writes nothing and returns `{ ok: false, refusal }`. `preempted`: the human took the lease, and this was the agent's next write. `secret_input`: a program is reading a password or another secret with echo off. `no_grant`: the terminal is a human's and the agent has no grant; the Permission row asks the human, and nothing is written while it waits. `denied`: the human chose Deny. `input_protected`: the session's input protection is on (SMPFS-165, `Plans/Decision_Log.md#DL-038`), which outranks every grant. A refusal is never silent, and a refused write is never queued for later.
- **Agent reads.** An agent read returns rendered text, never raw bytes and never images. It names `terminal_session_id`, `command_block_id` when known (else null), the `text` and a `read_state`: `empty` (known to have produced no output), `complete_so_far` (up to a live boundary), `final` (a finished command, its boundary proven closed), `partial` (some of its backing is missing) or `unavailable` (nothing readable). Missing backing is never `empty` (SMPFS-023). An image reads as `[image W×H px]` (", animated" when it is) and a Unicode-placeholder run as `[image]` (`Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-181`).

### CV-360 - Placement Fields On Every Open Route

```yaml
plan_unit_id: CV-360
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Every route that can open something in a home panel (cmd.panel_tab.open, cmd.file.open, cmd.nav.open_subject,
  cmd.browser.open_workspace_preview, cmd.terminal.open and the routes UCC-200 maps onto them) carries one placement
  field set beside its identity fields, never inside route identity: where (auto, tab, panel, right, down or a panel
  id; default auto; an id that names no panel reads as auto), mode (preview or keep; preview only for kinds with a
  preview tab), by (user or agent:<name>; default user; an agent always opens in the background and opens files kept)
  and background (default false). An open returns { ok, panel_tab_id, panel_id, created, reason }: panel_tab_id is the panel tab
  id, created is false when an open tab was revealed, and reason is null on success, else unknown_kind, not_ready or
  the route's own refusal. One id is one tab in the whole workspace: an open of an open id reveals it where it is,
  never moves it, returns no_change and appends no event, except that mode keep on a preview tab keeps it (one
  tab_kept) and a reveal into a collapsed panel expands it (one panel_expanded); an open that adds a tab appends one workspace.layout_changed with change tab_opened (CV-361), and a preview open that replaces its panel's preview tab is that one tab_opened, naming both tabs, with the replaced preview dropped rather than put on the closed-tab stack. These
  fields replace OpenFile's target_editor_panel_id, target_editor_group_id and target_group as home placement.
  Amended 2026-10-10 (DL-186, DL-187): cmd.chat.plan.open_version carries the fields like cmd.chat.plan.open_details;
  an open naming a debug session or an older debug-console:<session> id opens or reveals the one debug-console tab
  and selects that session's sub-tab as view state, with no receipt and no event.
gui_related: true
gui_classification_reason: Decides which panel every opened file, document, terminal, browser and tool tab lands in, and whether it takes focus.
split_recommended: false
depends_on: [DL-180, DL-186, DL-187, F3-634, F3-635, F3-636, DR-071, SP-330, CV-055, CV-163]
unblocks: []
acceptance_criteria:
  - "Every open route UCC-200 lists carries where, mode, by and background with the values and defaults above, and no route carries another placement field."
  - "No placement field is part of route_target identity, OpenSubject or OpenFile identity."
  - "An open of an id that is already open returns created false, reveals the tab in its own panel, writes nothing and appends no event; mode keep on that panel's preview tab keeps it with one tab_kept change, and a tab in a collapsed panel is revealed by expanding the panel with one panel_expanded change."
  - "An open that adds a tab returns created true with its panel_tab_id and panel_id and appends exactly one workspace.layout_changed with change tab_opened."
  - "A preview open into a panel that has a preview tab replaces it with one tab_opened whose affected_tab_ids name both tabs, and the replaced preview is not on the closed-tab stack afterwards."
  - "An open by agent:<name> is a background open whatever background says, and opens files kept."
  - "A refused open returns ok false with reason unknown_kind, not_ready or the route's own refusal, and changes nothing."
  - "target_editor_panel_id, target_editor_group_id and target_group never select a home panel."
  - "An open naming a debug session, or an older debug-console:<session> id, ends with exactly one debug-console tab in the workspace showing that session's sub-tab; when the tab was open it is a reveal (created false, no event), and no new tab id of the older form is minted."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D7, D8)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (section 6, the open spec and its result; concept lineage only)"
  - "Plans/Decision_Log.md#DL-186"
  - "Plans/Decision_Log.md#DL-187"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md, SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D33)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/panels-NUMBERS-339203bd76.md, SHA-256 2e2c2a95819842cd5cbcc108ed302460ddea3ed0a98be7dfe4f1b78507660ce6 (the Debug Console's one tab and its older ids folding into it; concept lineage only)"
preserved_exact_tokens:
  - "where"
  - "mode"
  - "by"
  - "background"
  - "agent:<name>"
  - "{ ok, panel_tab_id, panel_id, created, reason }"
  - "unknown_kind"
  - "not_ready"
  - "target_editor_panel_id"
  - "target_editor_group_id"
  - "target_group"
negative_constraints:
  - "Do not put a placement field in route_target, OpenSubject or OpenFile identity."
  - "Do not open a second tab for an id that is already open, and do not move an open tab to satisfy where."
  - "Do not let an agent's open take keyboard focus or open a file as a preview."
  - "Do not use target_editor_panel_id, target_editor_group_id or target_group to choose a home panel."
compatibility_only_notes:
  - "target_editor_panel_id, target_editor_group_id and target_group stay readable on old payloads as lineage; they place nothing."
stale_retired_dispositions:
  - "Amended 2026-10-10 (DL-186, DL-187, lead rulings F6 and F8): cmd.chat.plan.open_version is an open route; a debug session opens or reveals the one debug-console tab and selects its sub-tab as view state."
  - "Amended 2026-10-10 (lead ruling L1): Home panel tab references are named panel_tab_id."
  - "Replaces the PMConcept7 Home Workspace OpenFile placement addendum of 2026-08-04 and OpenFile's editor panel and group selectors as home placement (DL-180)."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/DRY_Rules.md#DR-071, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/storage-plan.md#SP-330

### CV-361 - The workspace.layout_changed 2.0.0 Payload

```yaml
plan_unit_id: CV-361
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  workspace.layout_changed keeps its event type and family and moves to payload 2.0.0
  (Plans/event_payloads/workspace_layout_changed_v2.schema.json), which Event Authority admitted on 2026-10-10 (DL-188, Jared's D42):
  Plans/event_family_registry.json registers the family at revision 2.0.0, registry revision 2026-10-09.1, 43 families.
  Every committed structural change of the v2 Home
  layout appends exactly one after the record is written and read back (SP-330), with a change discriminator
  (tab_opened, tab_closed, tab_moved, tab_kept, tab_pinned, tab_unpinned, tab_renamed, panel_split, panel_moved,
  panel_resized, panel_collapsed, panel_expanded, panel_closed, panel_locked, panel_unlocked, named_layout_applied,
  named_layout_saved, layout_reset, chat_column_changed, migrated_from_v1) bound to the commands that may produce
  it, the tab, panel and split ids it touched, prior_layout_revision and new_layout_revision, the actor (user,
  agent:<name> or system), the command id as its caller named it (null only for the conversion), commit_origin,
  result and receipt references and persisted=true. chat_column_changed is bound only to a chat width drag
  (cmd.workspace_layout.resize_surface with the chat); the chat's show and hide (cmd.panel.switch, the column's
  shown) are view state. A reveal that expands its tab's collapsed panel is one panel_expanded, and an open with
  mode keep of a preview tab one tab_kept, each under the open's command id; a preview open that replaces a
  panel's preview tab is one tab_opened naming both tabs, the replaced preview not stacked. A reveal-only open, view state, menus, hover, drags, an unchanged release and a failed write append
  nothing. 1.1.0 events stay readable through the payload's v1
  compatibility reader; a stored event's own payload_schema_id dispatches its validation, so a 1.1.0 event is read
  by the 1.1.0 schema and every new append carries 2.0.0. terminal.workgroup_moved is withdrawn under SMPFS-170's
  rule: no producer, recorded events readable at 1.0.0, a terminal tab's move is a tab_moved that keeps its
  session, and a move unresolved at upgrade is settled under SMPFS-170 and SP-319 before SP-330's conversion reads
  the v1 terminal records, never reminted. panel.undocked and panel.redocked
  stay for the chat's pop-out only (UCC-203) and are its only events; the pop-out is never saved, so the record has
  no popped_out (DL-187, D32). No new event family.
  Amended 2026-10-10 (DL-186, DL-188): command_id names every admitted route of UCC-200's table of routes that
  open or reveal a tab (cmd.chat.plan.open_version and cmd.chat.plan.open_details included), cmd.chat.attachment.open
  and the alias cmd.editor.close_tab, and less that alias equals the production wiring rows that declare this event.
  The five reveal-only routes (cmd.terminal.show, cmd.terminal.focus, cmd.terminal.reveal,
  cmd.chat.focus_thread_context_details, cmd.run_debug.terminal.reveal) are accepted for tab_kept and panel_expanded,
  never tab_opened; cmd.browser.focus_browser_tab stays layout-only, and a collapsed host panel expands through
  cmd.workspace_layout.set_collapsed. Renaming a dashboard is one tab_renamed and deleting one a tab_closed; widget commands, Start from and
  Reset, a board's view, presets, a board's stored contents and the Debug Console's session sub-tab append nothing.
  Amended 2026-10-17 (DL-228): the change discriminator gains layout_restored, bound only to
  cmd.workspace_layout.restore (UCC-200): the Guided Tour's Back, Skip or Finish putting a captured layout
  back in one command, its dashboard boards included; the command_id list gains that command, and its
  production entry tour.layout_restore declares this event. A project switch loads that project's own record
  and appends nothing.
  Amended 2026-10-17 (DL-230, Jared): saved named layouts belong to the person in home_named_layouts:v1
  (SP-330); cmd.workspace_layout.save_named writes the layout there and, as before, advances the v2 record's
  revision by one with its receipt and its one named_layout_saved, appended after both records are read back.
gui_related: true
gui_classification_reason: The event is how every visible layout change is recorded, replayed and audited.
split_recommended: false
depends_on: [DL-180, DL-181, DL-186, DL-187, DL-188, F3-630, SP-330, SMPFS-180, CV-323]
unblocks: []
acceptance_criteria:
  - "Plans/event_family_registry.json points workspace.layout_changed at family revision 2.0.0 and the v2 payload schema, registry revision 2026-10-09.1 with 43 families (amended 2026-10-10, DL-188: Event Authority admitted it; the criterion said this waited for that admission)."
  - "Every committed structural change appends exactly one workspace.layout_changed whose change and command_id agree with the table of this addendum; a reveal-only open, a view-state write and a failed or unchanged commit append none."
  - "The payload names the ids the change touched, both revisions, the actor and persisted=true, and is appended only after the v2 record has been read back."
  - "A 1.1.0 event validates against the compatibility reader and is never rewritten; a stored event is validated by the schema its own payload_schema_id names, and a new append that is not 2.0.0 is refused."
  - "The payload's command_id list, less the alias cmd.editor.close_tab, equals the production wiring rows that declare workspace.layout_changed; every admitted route of UCC-200's table of routes that open or reveal a tab is accepted for tab_kept and panel_expanded (except the layout-only cmd.browser.focus_browser_tab, whose collapsed host panel expands through cmd.workspace_layout.set_collapsed), every one that can add a tab for tab_opened, and the five reveal-only routes (cmd.terminal.show, cmd.terminal.focus, cmd.terminal.reveal, cmd.chat.focus_thread_context_details, cmd.run_debug.terminal.reveal) never for tab_opened; every valid case of tests/fixtures/pm7_shared/workspace_layout_event_fixtures.json validates against the 2.0.0 payload while each invalid case is rejected."
  - "A dashboard rename appends one tab_renamed and a dashboard delete one tab_closed; widget commands, cmd.widget.reset_layout with or without set_id, ui.widget_board.set_view, ui.widget_preset.*, a board's forgotten contents and a Debug Console sub-tab choice append none."
  - "No v2 record or event holds the chat's pop-out; a pop-out and its return append only panel.undocked or panel.redocked."
  - "An open with mode keep of a preview tab appends one tab_kept under the open's command id, and a preview open that replaces a panel's preview tab appends one tab_opened whose affected_tab_ids name both tabs."
  - "No producer writes terminal.workgroup_moved; recorded events stay readable at 1.0.0; a move pending or uncertain at upgrade is settled under SMPFS-170 before SP-330's conversion reads the v1 terminal records and is never reminted."
  - "panel.undocked and panel.redocked are produced only for the chat's pop-out and return, and neither appends a workspace.layout_changed; showing or hiding the chat appends nothing."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - Plans/event_payloads/workspace_layout_changed_v2.schema.json
  - Plans/event_family_registry.json
  - Plans/home_workspace_layout_v2_fixtures.json
  - tests/fixtures/pm7_shared/workspace_layout_event_fixtures.json
  - python3 scripts/pm-plans-verify.py validate-pm7-gui-fixtures
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/event_payloads/workspace_layout_changed_v2.schema.json
  - Plans/event_family_registry.json
node_compile_hint:
  mode: event_payload_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "Plans/Decision_Log.md#DL-181"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D1, D2, D3, D11)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (section 8, one event per committed change; concept lineage only)"
  - "Plans/Contracts_V0.md#CV-323"
  - "Plans/Decision_Log.md#DL-186"
  - "Plans/Decision_Log.md#DL-187"
  - "Plans/Decision_Log.md#DL-188"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md, SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D32, D35, D42)"
preserved_exact_tokens:
  - "workspace.layout_changed"
  - "2026-10-09.1"
  - "cmd.chat.plan.open_version"
  - "https://puppetmaster.local/schemas/event_payloads/workspace_layout_changed/2.0.0"
  - "change"
  - "tab_opened"
  - "chat_column_changed"
  - "migrated_from_v1"
  - "prior_layout_revision"
  - "new_layout_revision"
  - "persisted=true"
  - "rolled_back=true"
  - "terminal.workgroup_moved"
  - "panel.undocked"
  - "panel.redocked"
negative_constraints:
  - "Do not add an event family for panel or tab changes."
  - "Do not append an event for a reveal-only open, view state, a menu, hover, a drag, an unchanged release or a failed write."
  - "Do not produce terminal.workgroup_moved."
  - "Do not rewrite a 1.1.0 event."
compatibility_only_notes:
  - "1.1.0 payloads stay readable through $defs/workspace_layout_changed_v1_compatibility_reader of the v2 payload schema."
  - "terminal.workgroup_moved 1.0.0 events already written stay readable; the family keeps its registry row for history."
  - "Earlier text, lineage only (until 2026-10-10, DL-188): the payload applied 'when Event Authority admits it: until Jared approves the Event Authority checkpoint that moves the registered family to 2.0.0 (DL-045), Plans/event_family_registry.json keeps it at 1.1.0, the 2.0.0 payload is requires_central_adjudication and no 2.0.0 event is appended', and 'every new append after admission carries 2.0.0'."
  - "Earlier text, lineage only (until 2026-10-10, DL-187): 'popped_out is written like view state, with no revision advance and no workspace.layout_changed'."
stale_retired_dispositions:
  - "Amended 2026-10-10 (DL-188): Event Authority admitted the 2.0.0 payload (D42); the text that kept the family at 1.1.0 and the payload requires_central_adjudication until then is met and removed."
  - "Amended 2026-10-10 (DL-187, D32): the chat's pop-out is never saved; the record's popped_out is gone and writing it like view state no longer applies."
  - "Amended 2026-10-10 (DL-186, DL-188): command_id covers every admitted route of UCC-200's open-or-reveal table (cmd.chat.plan.open_version included, the five reveal-only routes for tab_kept and panel_expanded only, cmd.browser.focus_browser_tab layout-only) and cmd.chat.attachment.open, and matches the production wiring; dashboard rename and delete are tab_renamed and tab_closed, and board, preset and Debug Console sub-tab changes append nothing."
  - "Replaces CV-323's 1.1.0 payload fields (mutation kind, source and target host, target slot, insertion edge) for new events (DL-180)."
  - "Withdraws terminal.workgroup_moved (DL-181, SMPFS-170's rule)."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/event_family_registry.json
  - Plans/storage-plan.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/storage-plan.md#SP-330, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180, ContractName:Plans/Contracts_V0.md#CV-323, SchemaID:https://puppetmaster.local/schemas/event_payloads/workspace_layout_changed/2.0.0

### CV-362 - The Terminal's Attribution, Write Grant And Refusal Fields

```yaml
plan_unit_id: CV-362
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Every terminal command record carries by (user or agent:<name>), written only from a shell-integration record
  that carries the terminal's secret and stored as terminal_command_block's optional by, absent or null when nothing
  trusted attributed it. An agent's write grant names terminal_session_id, agent and grant: once (one command) or
  this_terminal (until the terminal closes, the human takes over or the agent's run ends); allow_agent_input gives
  it, deny_agent_input refuses the pending write, revoke_agent_input takes it back and hand_back renews a
  this_terminal grant for the rest of the run. The grant is held in memory only, never in storage, settings, the
  layout record, a permission rule or an event payload, and never replaces the per-invocation approval of PS-041;
  when it ends the agent is told why (command_finished, terminal_closed, taken_over, stopped, run_ended or revoked).
  A take-over notice names terminal_session_id and cause (keystroke or take_over). A refused agent write writes
  nothing, is never queued and returns { ok: false, refusal } with preempted, secret_input, no_grant, denied or
  input_protected. An agent read returns rendered text with terminal_session_id, command_block_id or null, text and
  read_state (empty, complete_so_far, final, partial or unavailable), never raw bytes or images; images read as
  [image W×H px].
gui_related: true
gui_classification_reason: These fields drive the agent rows, marks and notices the user sees in a terminal tab.
split_recommended: false
depends_on: [DL-181, SMPFS-182, SMPFS-183, SMPFS-181, SMPFS-165, SMPFS-023, SMPFS-024, PS-041]
unblocks: []
acceptance_criteria:
  - "Every command record carries by as user or agent:<name> when a record with the terminal's secret attributed it, and null or nothing otherwise; a mark without the secret never sets by."
  - "A grant is once or this_terminal, and no stored value, setting, layout record, permission rule or event payload holds a grant."
  - "A once grant ends after its command; a this_terminal grant ends when the terminal closes, the human takes over (keystroke, Take over or Stop), the agent's run ends or the human revokes it, and the agent is told which."
  - "An agent write refused for any reason writes nothing to the session, is not queued and returns exactly one of preempted, secret_input, no_grant, denied or input_protected."
  - "input_protected outranks every grant."
  - "An agent read returns text and one of the five read states, never raw bytes or images, and never reports missing backing as empty."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - Plans/storage_value_registry.json
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/storage_value_registry.json
  - Plans/Tools.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-181"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D18)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b (section 8: preempted, secret_input, by, read state final; concept lineage only)"
  - "Plans/Decision_Log.md#DL-038"
preserved_exact_tokens:
  - "by"
  - "agent:<name>"
  - "once"
  - "this_terminal"
  - "preempted"
  - "secret_input"
  - "no_grant"
  - "denied"
  - "input_protected"
  - "read_state"
  - "complete_so_far"
  - "final"
  - "[image W×H px]"
negative_constraints:
  - "Do not store, export or sync an agent's write grant, and do not let it stand in for command approval."
  - "Do not queue a refused agent write for later or refuse it silently."
  - "Do not attribute a command from a mark without the terminal's secret."
  - "Do not return raw bytes or images from an agent read."
compatibility_only_notes: []
stale_retired_dispositions:
  - "Names the concept's \"Always allow here\" this_terminal (Allow in this terminal), per the lead ruling recorded in DL-181."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-182, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-183, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-165, ContractName:Plans/Permissions_System.md#PS-041, ContractName:Plans/UI_Command_Catalog.md#UCC-201, ContractName:Plans/storage-plan.md#SP-332
