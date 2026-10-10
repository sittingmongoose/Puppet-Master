# Shard 062: DL-180 to DL-185 — Placement fields, the layout event and the terminal's agent fields (2026-10-09)

Source: `Plans/Contracts_V0.md`

Source lines: L23580-L23891

Source SHA256: `5282f46ee31d3568ee0b595606144e3c11e0381b256e5082cc48205e637c704e`

---

## DL-180 to DL-185 — Placement fields, the layout event and the terminal's agent fields (2026-10-09)

This addendum compiles two of Jared's decisions of 2026-10-09 into data contracts: `Plans/Decision_Log.md#DL-180` (one universal panel system) and `#DL-181` (one terminal session per tab, shared safely by people and agents). It adds three units. CV-360 is the placement field set every open route carries and the result an open returns. CV-361 is the `workspace.layout_changed` 2.0.0 payload. CV-362 holds the fields that record who typed a command, an agent's write grant and the refusals an agent can receive. CV-360 replaces OpenFile's `target_editor_panel_id`, `target_editor_group_id` and `target_group` as home placement. CV-361 replaces CV-323's 1.1.0 payload and withdraws `terminal.workgroup_moved`. The following are amended in place: CV-055, CV-163, CV-165, CV-172 and CV-323; the PMConcept7 Home Workspace OpenFile placement addendum; section 7.3 (focus fields, object kinds, destination classes and reuse); section 7.5 (what the Terminal settings own); and the PMConcept7 Home Workspace event contracts. The opening rules belong to `Plans/FinalGUISpec.md#F3-634` and `Plans/DRY_Rules.md#DR-071`, the commands to `Plans/UI_Command_Catalog.md#UCC-200` and `#UCC-201`, the layout record to `Plans/storage-plan.md#SP-330`, and the agent rules to `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-182`. This document owns field names, values and results only.

### Placement fields (CV-360)

One placement field set travels beside the identity fields of every route that can open something in a home panel: `cmd.panel_tab.open`, `cmd.file.open` (`OpenFile`), `cmd.nav.open_subject` (`route_target` plus `OpenSubject`), `cmd.browser.open_workspace_preview` and `cmd.terminal.open`, and every route that UCC-200 maps onto them. The fields are never part of route identity (section 7.3).

| Field | Values | Default | Meaning |
|---|---|---|---|
| `where` | `auto`, `tab`, `panel`, `right`, `down` or a panel id | `auto` | `auto` is the panel that F3-634's placement and kind affinity pick, skipping locked panels. `tab` is the panel the open came from. `panel` is a new panel by the fit rule (Alt+click). `right` and `down` split the source panel that way. A panel id is that panel; an id that names no panel in the tree reads as `auto`. |
| `mode` | `preview`, `keep` | `preview` for a person's single click on a file reference; `keep` for every other open | Only kinds with a preview tab use it (`Plans/FinalGUISpec.md#F3-635`); every other kind opens kept. |
| `by` | `user`, `agent:<name>` | `user` | Who asked for the open. `agent:<name>` always opens in the background and opens files kept. |
| `background` | `true`, `false` | `false` | A background open the user asked for (Ctrl+click or Cmd+click). Agent opens are always in the background, whatever this says. |

An open returns `{ ok, tab_id, panel_id, created, reason }`. `tab_id` is the panel tab id (the record key of SP-330, the argument UCC-200 calls `panel_tab_id`); it is not section 7.3's `tab_id` focus field. `panel_id` is the panel that holds the tab. `created` is `true` when the open added a tab and `false` when it revealed one. `reason` is null when `ok` is `true`; otherwise it is the refusal: `unknown_kind` for an id or kind no tab kind claims, `not_ready` while the layout has not loaded, or a refusal from the route's own error set.

One id is one tab in the whole workspace. When the id's tab is already open, the open reveals it where it is and never moves it, whatever `where` says: the result has `created: false` and the receipt is `no_change` with no event. Activating the tab and pulling it out of "+N" are view state. When the tab's panel is collapsed, the reveal expands it (`Plans/FinalGUISpec.md#F3-634`), and that expand is one committed `panel_expanded` change under the open's command id (CV-361), because the collapsed flag is part of the stored tree. The one exception is an open with `mode: keep` of an id whose tab is its panel's preview tab: the tab is kept in place, which is one `tab_kept` change (CV-361). An open that adds a tab commits once and appends one `workspace.layout_changed` with `change: tab_opened`. A preview open into a panel that already has a preview tab replaces that tab in place (`Plans/FinalGUISpec.md#F3-635`): it is still one `tab_opened`, whose `affected_tab_ids` name the new tab and the replaced one, and the replaced preview is dropped, never put on the closed-tab stack, because it was never kept. In the narrow centre (`Plans/FinalGUISpec.md#F3-636`), `panel`, `right` and `down` open in the next panel of the switcher instead of creating a panel. Focus and the announcement for `by` and `background` are F3-634's rules.

### The layout event (CV-361)

`workspace.layout_changed` keeps its event type and family and moves to payload 2.0.0, `Plans/event_payloads/workspace_layout_changed_v2.schema.json` (schema id `https://puppetmaster.local/schemas/event_payloads/workspace_layout_changed/2.0.0`). Every committed structural change of the v2 Home layout appends exactly one, after the record has been written and read back (SP-330). Its `change` field names what happened:

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
  and background (default false). An open returns { ok, tab_id, panel_id, created, reason }: tab_id is the panel tab
  id, created is false when an open tab was revealed, and reason is null on success, else unknown_kind, not_ready or
  the route's own refusal. One id is one tab in the whole workspace: an open of an open id reveals it where it is,
  never moves it, returns no_change and appends no event, except that mode keep on a preview tab keeps it (one
  tab_kept) and a reveal into a collapsed panel expands it (one panel_expanded); an open that adds a tab appends one workspace.layout_changed with change tab_opened (CV-361), and a preview open that replaces its panel's preview tab is that one tab_opened, naming both tabs, with the replaced preview dropped rather than put on the closed-tab stack. These
  fields replace OpenFile's target_editor_panel_id, target_editor_group_id and target_group as home placement.
gui_related: true
gui_classification_reason: Decides which panel every opened file, document, terminal, browser and tool tab lands in, and whether it takes focus.
split_recommended: false
depends_on: [DL-180, F3-634, F3-635, F3-636, DR-071, SP-330, CV-055, CV-163]
unblocks: []
acceptance_criteria:
  - "Every open route UCC-200 lists carries where, mode, by and background with the values and defaults above, and no route carries another placement field."
  - "No placement field is part of route_target identity, OpenSubject or OpenFile identity."
  - "An open of an id that is already open returns created false, reveals the tab in its own panel, writes nothing and appends no event; mode keep on that panel's preview tab keeps it with one tab_kept change, and a tab in a collapsed panel is revealed by expanding the panel with one panel_expanded change."
  - "An open that adds a tab returns created true with its tab_id and panel_id and appends exactly one workspace.layout_changed with change tab_opened."
  - "A preview open into a panel that has a preview tab replaces it with one tab_opened whose affected_tab_ids name both tabs, and the replaced preview is not on the closed-tab stack afterwards."
  - "An open by agent:<name> is a background open whatever background says, and opens files kept."
  - "A refused open returns ok false with reason unknown_kind, not_ready or the route's own refusal, and changes nothing."
  - "target_editor_panel_id, target_editor_group_id and target_group never select a home panel."
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
preserved_exact_tokens:
  - "where"
  - "mode"
  - "by"
  - "background"
  - "agent:<name>"
  - "{ ok, tab_id, panel_id, created, reason }"
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
  (Plans/event_payloads/workspace_layout_changed_v2.schema.json). Every committed structural change of the v2 Home
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
  stay for the chat's pop-out only (UCC-203) and are its only events: popped_out is written like view state, with
  no revision advance and no workspace.layout_changed. No new event family.
gui_related: true
gui_classification_reason: The event is how every visible layout change is recorded, replayed and audited.
split_recommended: false
depends_on: [DL-180, DL-181, F3-630, SP-330, SMPFS-180, CV-323]
unblocks: []
acceptance_criteria:
  - "Plans/event_family_registry.json points workspace.layout_changed at family revision 2.0.0 and the v2 payload schema."
  - "Every committed structural change appends exactly one workspace.layout_changed whose change and command_id agree with the table of this addendum; a reveal-only open, a view-state write and a failed or unchanged commit append none."
  - "The payload names the ids the change touched, both revisions, the actor and persisted=true, and is appended only after the v2 record has been read back."
  - "A 1.1.0 event validates against the compatibility reader and is never rewritten; a stored event is validated by the schema its own payload_schema_id names, and a new append that is not 2.0.0 is refused."
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
preserved_exact_tokens:
  - "workspace.layout_changed"
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
stale_retired_dispositions:
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
