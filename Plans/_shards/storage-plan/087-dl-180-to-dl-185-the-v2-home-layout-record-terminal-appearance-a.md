# Shard 087: DL-180 to DL-185 — The v2 Home layout record, terminal appearance and terminal records (2026-10-09)

Source: `Plans/storage-plan.md`

Source lines: L27389-L27744

Source SHA256: `168d473174b407835e6656fbd5c861626b4ec1eee31622b63d06b63c0c6f3ca0`

---

## DL-180 to DL-185 — The v2 Home layout record, terminal appearance and terminal records (2026-10-09)

This addendum compiles Jared's home and terminal decisions of 2026-10-09 into storage: `Plans/Decision_Log.md#DL-180` (one universal panel system), `#DL-181` (one terminal session per tab), `#DL-182` (terminal images) and `#DL-183` (terminal appearance). It adds SP-330 (the v2 Home layout record, its key, transaction and the migration from v1 and from the Home part of `layout:v1`), SP-331 (where terminal appearance is stored) and SP-332 (the terminal records re-scoped, with saved scrollback). SP-330 replaces the v1 record as the selected Home layout: SP-245 and the PMConcept7 Home Workspace layout passage are amended so the v1 key is a read-only migration input. SP-122 is superseded by SP-332. SP-014, SP-093, SP-100, SP-114, SP-118, SP-123, SP-124, SP-126, SP-127 and SP-273 are amended in place, and so are the terminal persistence passages and the bounded-collections table of section 2. The panel model is `Plans/FinalGUISpec.md#F3-630`, the tab kinds and their host contract are `#F3-635`, and the terminal as one session per tab is `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180`; this document owns keys, transactions, migration, retention and failure behaviour only.

### The v2 Home layout record (SP-330)

**Key and schema.** The Home layout of a project and workspace tab is one record under `home_workspace_layout.v2:{project_id}:{workspace_tab_id}`, family `home_workspace_layout_v2`, schema `pm.home_workspace_layout.v2` 2.0.0 in `Plans/home_workspace_layout_v2.schema.json`, retention `RP-CONFIG-CURRENT`. It is the only Home layout authority. `home_workspace_layout.v1:{project_id}:{workspace_tab_id}` and the Home part of `layout:v1` (`Plans/FinalGUISpec.md` section 15.1 and `#F3-217`) are read-only migration inputs.

**What it holds.** The panel split tree (splits with an axis, children and sizes as proportions; panels with their ordered tab ids, active tab, preview tab, pinned count, collapsed and locked flags), the tab records keyed by tab id (kind, user label, pinned, kept or preview, the kind's serialized state of at most 16 KB, the domain reference), a view-state block (focused panel, maximized panel or none, recent-tab order), the chat column (width or the window default, History pinned, popped out, shown), the user's saved named layouts (shape, sizes and the kinds each slot holds), a closed-tab stack of at most 20, `revision`, `updated_at` and the migration stamp. The schema's `$comment` lists the invariants it cannot express (sizes sum to 1, one tab in exactly one panel, pinned tabs first, one preview tab per panel, no two terminal tabs showing the same session, the 16 KB cap and the rest); the owner checks them before every write. The shipped named layouts are canon in `Plans/FinalGUISpec.md#F3-630` and are not stored.

**What it never holds.** Editor buffers and dirty state, terminal sessions, PTYs and scrollback, browser history and sessions, chat messages, credentials and a dashboard's widget layout. Each dashboard tab keeps its own widget layout under `widget_layout:v1:dashboard:<board_id>` (`Plans/Widget_System.md#WS-030`). Narrow-window states, overlays, open menus, hover and drag state are never written.

**Transaction and receipt.** Every committed structural change is one admitted command (`Plans/UI_Command_Catalog.md#UCC-200`) that validates the candidate against the schema and the invariants, writes the canonical key, reads it back, and only then advances `revision` by exactly one, publishes its result and one dispatch receipt, and appends one `workspace.layout_changed` whose `change` names what happened (`Plans/Contracts_V0.md#CV-361`). A write or readback failure restores the exact prior record and commits a failed receipt with `rolled_back=true` and no event. An open that only reveals an existing tab, and a release that changes nothing, return `no_change` with no write and no event; a reveal whose tab sits in a collapsed panel expands that panel as one committed `panel_expanded` change under the open's command id (`Plans/Contracts_V0.md#CV-360`). View state (`ui.panel_tab.activate`, `ui.workspace_layout.focus_panel`, `ui.workspace_layout.maximize`, the recent-tab order, History pinned and the chat column's `shown`) is written with the record but never advances `revision`, never takes a receipt and never appends an event. So are the chat column's `popped_out`, whose pop-out and return append only their own `panel.undocked` or `panel.redocked`, and a terminal tab's domain reference moving to a new session after Restart or a restore, which keeps the tab id (SP-332). SP-273's custody carries over to v2 writes: the transaction slot holds the prior and candidate v2 bytes while a change is unresolved, the operation receipt holds the content-free result, and the reader checkpoint stays disposable. The existing slot and receipt schemas (`Plans/home_layout_pending_receipt.schema.json` and its siblings) are typed for v1 layouts and v1 event semantics and stay the v1 readers. The successor slot and receipt schema for v2 writes is not written in this addendum: it must reference `pm.home_workspace_layout.v2` and the CV-361 payload by `$ref` instead of copying them inline, and until it exists no native v2 writer is admitted through those families.

**First read and migration.** The first read for a project and workspace tab that has no v2 record converts its layout into one. The sources are read in this order: the v1 record (its dotted key, then its compatibility colon keys, as SP-245 reads them), else the Home part of `layout:v1`, else nothing, which creates the default Home layout of `#F3-630` (stamp `created_default`, revision 0, no event). The conversion runs through the StorageMigrationCoordinator in one verified transaction: convert, check the schema and every invariant, write the v2 key, read it back. The source is never written, reset or deleted: it stays where it was, read-only, as input and lineage. A converted record's `revision` is the v1 `layout_revision` plus one (1 for a `layout:v1` source), and the conversion appends one `workspace.layout_changed` with `change` `migrated_from_v1` and actor `system`. A user's layout is never lost on upgrade.

The conversion table:

| v1 source | v2 result |
|---|---|
| A shown editor panel (`editor_panel_1` to `editor_panel_4`) | A panel holding that editor group's open tabs, in order, as kept `file:<path>` tabs, its active tab kept; the tabs come from the editor's own workspace state (`editor_workspace_state.v1:{project_id}`). When the panel has a `browser_session_id`, a browser tab bound to it joins the panel after the editor tabs: the active tab when `browser_active` was true, else a background tab, so no browser session is dropped. |
| A hidden editor panel (`visible: false`) that holds tabs or a browser session | A collapsed panel holding them, by the row above. |
| A hidden editor panel with no tabs and no browser session | Nothing: it holds nothing to keep. |
| The dashboard surface | A panel holding `dashboard:home`, pinned; its widgets stay where `Plans/Widget_System.md#WS-030` puts the Home board. A hidden dashboard becomes the same panel, collapsed. |
| Each terminal section | A panel in the bottom row, in slot order. Each workgroup pane becomes its own terminal tab `terminal:<terminal_session_id>` bound to its existing session, in workgroup and pane order, read from the section, workgroup, pane, leaf-pane and session records (SP-332). The tab of the section's active session is active. A pane's own tab title becomes the tab's user label; section and workgroup titles are not carried. A pane with no attached session makes no tab. A hidden terminal section becomes the same panel, collapsed, and one with no attached session makes no panel. The conversion never starts, ends or restarts a session; the terminal runtime checks liveness later (SP-125). |
| A docked or floating chat | The fixed chat column, shown as it was shown, at the window's default width; its host, slot and floating bounds are dropped. A chat popped out into its own window stays popped out. |
| A floating editor panel or dashboard | Docked: it joins the top row at its end. |
| Geometry | The top row holds the non-terminal surfaces in host order (`dock_left`, `home_main` by slot index, `dock_right`, `dock_top`, then floating ones); the bottom row holds the terminal sections; the column is 0.6 over 0.4, the Home layout's proportions, because v1 stores the bottom dock's thickness in pixels without the window height. A row's shares are its surfaces' `flex_weight` normalized to sum to 1, and the row uses equal shares when every weight is 0 or any normalized share would be at or below 0.02. A row with one panel is that panel; with no terminal sections the top row is the root. |
| Collapsed, focus and recent order | A collapsed v1 surface stays collapsed. The surface with the highest `last_focus_seq` becomes the focused panel; the recent-tab order is each surface's active tab, newest `last_focus_seq` first. |
| Ids | A converted panel keeps its v1 surface instance id as its panel id; splits get new ids. |
| `layout:v1` Home part | The same table: `layout:v1` gives geometry only (centre splits and terminal section split ratios become row shares); tabs come from the editor and terminal records; a detached Home surface's geometry is dropped and the surface docks. `layout:v1` keeps its other part, side-panel dock state and the popped-out chat window's geometry (`Plans/FinalGUISpec.md#F3-217`); only its Home part is conversion input. |

**An unreadable source.** When the v1 record (or the `layout:v1` blob) fails its schema, its identity is ambiguous or its conversion breaks an invariant, the conversion writes the default Home layout with stamp `default_after_unreadable_source` (revision 0 and no event, like a newly created default), keeps the old record unchanged where it was, and Home shows a notice that the saved layout could not be read and the old one is kept (`Plans/FinalGUISpec.md#F3-630` owns its words). The editor's and the terminal's own records are untouched, so their tabs can still be opened.

**A corrupt v2 record.** Corrupt, duplicate, future-version and malformed v2 records follow SP-245's quarantine path: the bad record is set aside, the default Home layout is written and disclosed, and a second reload is clean. Restored background tabs mount only when first shown; a restored terminal tab whose session did not survive keeps its tab id, starts a new session in the same folder and profile and says so (`Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180`).

**Concept lineage.** The panels concept saves its layout under `pm.home.panels:v1:<project>` and sets unreadable records aside under a quarantine key. Both are concept lineage only, never product keys.

### SP-330 - The v2 Home Layout Record, Its Transaction And The Migration From v1

```yaml
plan_unit_id: SP-330
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  The Home layout of a project and workspace tab is one record, pm.home_workspace_layout.v2 2.0.0
  (Plans/home_workspace_layout_v2.schema.json), under home_workspace_layout.v2:{project_id}:{workspace_tab_id}
  in family home_workspace_layout_v2 with RP-CONFIG-CURRENT; it is the only Home layout authority (DL-180). It
  holds the panel split tree, the tab records, a view-state block, the chat column, the user's saved named layouts,
  a closed-tab stack of at most 20, revision, updated_at and a migration stamp, and never buffers, sessions,
  scrollback, browser history, chat messages, credentials or a dashboard's widget layout, which each dashboard
  tab keeps under widget_layout:v1:dashboard:<board_id> (WS-030). Narrow, overlay, menu, hover and drag state is
  never written. Every committed structural change validates, writes, reads back, then advances revision by one,
  publishes one result and receipt and appends one workspace.layout_changed (CV-361); failure rolls back with
  rolled_back=true and no event; a reveal-only open is no_change, and a reveal into a collapsed panel is one
  panel_expanded. View state, the chat column's shown and popped_out, and a terminal tab's ref moving to a new
  session are written with the record without a revision advance, receipt or event. The first read without a v2 record converts the v1 record, else the Home part
  of layout:v1, through the StorageMigrationCoordinator by the conversion table of this section: editor panels
  become panels holding their editor tabs, the dashboard a panel with dashboard:home, each terminal section a
  bottom-row panel whose workgroup panes become terminal tabs bound to their existing sessions, a docked or
  floating chat returns to the fixed column (a popped-out chat stays popped out), floating surfaces dock, an editor
  panel's inactive browser session becomes a background browser tab there, and a hidden surface that holds anything
  becomes a collapsed panel. The
  source stays read-only and is never reset; an unreadable source yields the default Home layout, the old record
  kept and a notice. The concept's pm.home.panels keys are lineage only.
gui_related: true
gui_classification_reason: The persisted record decides the visible panels, tabs, chat column and what survives an upgrade.
split_recommended: false
depends_on: [DL-180, DL-181, SP-245, SP-273, F3-630, F3-635, WS-030, SMPFS-180]
unblocks: [SP-332, CV-361]
acceptance_criteria:
  - "home_workspace_layout_v2 is the only family a Home layout write targets; the v1 family and layout:v1 are read only as conversion input."
  - "Every valid record in Plans/home_workspace_layout_v2_fixtures.json validates against the schema and the semantic invariants, and every invalid case is rejected by the schema or by the invariant it names."
  - "A structural change writes, reads back and only then advances revision by one and appends one workspace.layout_changed; a failure leaves the prior record byte-identical with a rolled_back=true receipt and no event; a reveal-only open writes nothing."
  - "View-state writes, the chat column's shown and popped_out, and a terminal tab's ref moving to a new session never advance revision, take a receipt or append an event."
  - "A newly created default layout, and the default written after an unreadable source, are at revision 0 with no event."
  - "The fixture's v1 record (four editor panels, a dashboard, two terminal sections with workgroups and a floating chat) converts to exactly its expected_v2 record, the v1 record is unchanged afterwards and one migrated_from_v1 event is appended."
  - "No v1 surface that holds a tab, a browser session or a terminal session is dropped: an inactive browser session becomes a background browser tab in its panel, and a hidden editor panel, dashboard or terminal section becomes a collapsed panel."
  - "An unreadable v1 record yields the default Home layout with stamp default_after_unreadable_source, the old record kept unchanged and a notice; no source record is ever reset or deleted by the conversion."
  - "No v2 record holds a buffer, scrollback, browser history, chat message, credential, dashboard widget layout, narrow state, overlay, menu or drag state."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - Plans/home_workspace_layout_v2.schema.json
  - Plans/home_workspace_layout_v2_fixtures.json
  - Plans/storage_value_registry.json
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/home_workspace_layout_v2.schema.json
  - Plans/home_workspace_layout_v2_fixtures.json
  - Plans/storage_value_registry.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D1, D2, D3, D10)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (sections 2, 3 and 12; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md, SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (layout model, named layouts, the 16 KB cap; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b (section 7: the reopen stack holds 20)"
  - "Plans/storage-plan.md#SP-245"
preserved_exact_tokens:
  - "pm.home_workspace_layout.v2"
  - "home_workspace_layout.v2:{project_id}:{workspace_tab_id}"
  - "home_workspace_layout_v2"
  - "home_workspace_layout.v1:{project_id}:{workspace_tab_id}"
  - "layout:v1"
  - "widget_layout:v1:dashboard:<board_id>"
  - "dashboard:home"
  - "migrated_from_v1"
  - "default_after_unreadable_source"
  - "rolled_back=true"
  - "RP-CONFIG-CURRENT"
negative_constraints:
  - "Do not reset, overwrite or delete a v1 record or layout:v1 during or after the conversion."
  - "Do not write a Home layout anywhere but home_workspace_layout.v2."
  - "Do not save narrow, overlay, menu, hover or drag state, a buffer, scrollback, a dashboard's widget layout or a chat position."
  - "Do not use the concept's pm.home.panels keys as product keys."
  - "Do not start, end or restart a terminal session during the conversion."
compatibility_only_notes:
  - "The v1 record, its compatibility colon keys and the Home part of layout:v1 are read-only conversion inputs and lineage."
stale_retired_dispositions:
  - "Supersedes the v1 record as the selected Home layout (SP-245 amended 2026-10-09, DL-180)."
owner_hints:
  - Plans/storage-plan.md
  - Plans/home_workspace_layout_v2.schema.json
  - Plans/storage_value_registry.json
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/Contracts_V0.md#CV-361, ContractName:Plans/storage-plan.md#SP-245, ContractName:Plans/storage-plan.md#SP-273, ContractName:Plans/home_workspace_layout_v2.schema.json, SchemaID:pm.home_workspace_layout.v2

### Terminal appearance storage (SP-331)

The terminal's appearance is one model resolved field by field: the look's defaults ("Follow theme"), then the app default, then the project default, then this terminal (`Plans/FinalGUISpec.md#F3-642`, `Plans/DRY_Rules.md#DR-068`). The look's defaults ship with the product and are never stored. Until an app-wide Settings store is admitted (`Plans/Settings_System.md#SSYS-028`), the app default and the project default share one stored value per field, so today two values are stored, not three:

| Layer | Where it is stored | Written by |
|---|---|---|
| App default and project default (one shared value) | The Settings rows of `Plans/Settings_System.md#SSYS-051`, held like every Settings value in the open Project's settings snapshot (`pm.project_settings_snapshot.v1`, Settings custody `scd.settings.durable.v1`): one stored value per row over the row's bundled default. "All terminals" therefore reaches the terminals of the open Project only, and there is no separate app-level value for a project-level value to fall through to. | Settings > Terminal, and the Appearance popover's "All terminals", only through Settings transactions |
| This terminal | The terminal tab's serialized state in the v2 Home record (SP-330), inside its 16 KB | The Appearance popover's "This terminal" |

Each stored value holds only the fields the user set there; an unset field is absent and falls through, never a copy: the tab override to the shared Settings value, and that to the look's defaults. When an app-wide store is admitted, the app default moves into it as its own level, the project default stays in the Project's settings snapshot, and a project field that is cleared falls through to the app default; until then that step does not exist. The field list is `#F3-642`'s. Every field applies live; nothing stored carries a restart flag. A terminal tab moved to another panel keeps its override, because the override is part of the tab; a terminal reopened from the closed-tab stack keeps it too. An imported scheme (`#F3-642` lists the formats) is stored as its parsed colour table in Settings custody, never as the imported file.

**Background images.** A custom background image is never stored inline in a settings row or in a tab's state. It follows SP-222's uploaded-asset pattern: the image bytes are stored once by content hash with a manifest (content hash, media type, byte size, scope), and the layer stores only the asset reference. Dim and blur are fields of the layer; the blur is baked once into the image when the terminal draws it, never a backdrop blur (`#F3-642`), and no pre-blurred copy is stored. An asset no layer references any more is deleted. Backup follows the layer: an image the app or project default references is backed up with Settings; an image only a tab override references follows the Home record, which is resettable UI state and is not backed up, and when it is missing the tab falls through to the next layer's background. The assets' physical family is registered with Settings custody, whose physical registration is still pending in `Plans/storage_value_registry.json` (`physical_family_registration_pending`).

This replaces SP-122's global `terminal_font.v1:global` and `terminal_color.v1:global` and fills SP-127's "per-tab overrides, font and color references".

### SP-331 - Terminal Appearance Storage

```yaml
plan_unit_id: SP-331
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  The terminal's appearance resolves field by field from the look's defaults, which are never stored, then the app
  default, the project default and the tab override (DL-183, F3-642, DR-068). Until an app-wide Settings store is
  admitted (SSYS-028), the app default and the project default share one stored value per field: the Settings rows
  of SSYS-051, held like every Settings value in the open Project's settings snapshot (pm.project_settings_snapshot.v1,
  Settings custody scd.settings.durable.v1) and written only through Settings transactions, so All terminals reaches
  the open Project's terminals only and no project field falls through to a separate app value. The per-tab override
  lives inside the terminal tab's serialized state in the v2 Home record (SP-330), within its 16 KB. Each stored value
  holds only the fields set there; an unset field falls through to the next value down. When an app-wide store is
  admitted the app default becomes its own stored level beneath the project default. Every
  field applies live and nothing stored carries a restart flag. An imported scheme is stored as its parsed colour
  table, never the file. A custom background image is stored once by content hash with a manifest under SP-222's
  uploaded-asset pattern and referenced by the layer; dim and blur are fields applied when drawing; an unreferenced
  asset is deleted. Images an app or project layer references are backed up with Settings; an image only a tab
  override references follows the Home record, is not backed up, and when missing the tab falls through to the next
  layer. This replaces SP-122's terminal_font.v1:global and terminal_color.v1:global.
gui_related: true
gui_classification_reason: Decides where each terminal look choice is kept and what survives a move, a reopen and a restore.
split_recommended: false
depends_on: [DL-183, DR-068, SSYS-051, SSYS-028, SP-330, SP-222]
unblocks: []
acceptance_criteria:
  - "The app and project defaults are stored only as SSYS-051's Settings rows in the Project's settings snapshot, as one shared value per field until an app-wide store is admitted (SSYS-028); the tab override only in the tab's state; the look's defaults are not stored."
  - "A stored value holds only the fields set in it; clearing a tab override field shows the Settings value, and clearing a Settings field shows the look's default."
  - "Moving, collapsing or reopening a terminal tab keeps its override; only Settings writes the project layer."
  - "No appearance value is stored with a restart flag."
  - "A background image is stored once by content hash and referenced, never inlined in a settings row or tab state; an unreferenced image is deleted."
  - "Backup includes images the app or project layer references and excludes images only a tab override references."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/Settings_System.md
  - Plans/home_workspace_layout_v2.schema.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-183"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D15)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b (section 6, the appearance model; concept lineage only)"
  - "Plans/storage-plan.md#SP-222"
preserved_exact_tokens:
  - "scd.settings.durable.v1"
  - "pm.project_settings_snapshot.v1"
  - "terminal_font.v1:global"
  - "terminal_color.v1:global"
negative_constraints:
  - "Do not store the look's defaults or a copy of a lower layer's value."
  - "Do not inline a background image in a settings row or a tab's state."
  - "Do not store an imported scheme file."
  - "Do not mark any appearance value as needing a restart."
compatibility_only_notes:
  - "terminal_font.v1:global and terminal_color.v1:global were prose-only keys (SP-122) and map to the app layer."
stale_retired_dispositions:
  - "Replaces SP-122's global font and colour keys (DL-183)."
owner_hints:
  - Plans/storage-plan.md
  - Plans/Settings_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-183, ContractName:Plans/FinalGUISpec.md#F3-642, ContractName:Plans/DRY_Rules.md#DR-068, ContractName:Plans/Settings_System.md#SSYS-051, ContractName:Plans/storage-plan.md#SP-330, ContractName:Plans/storage-plan.md#SP-222

### Terminal records re-scoped, and saved scrollback (SP-332)

**One session per tab.** A terminal tab shows one session at a time. Its tab id is `terminal:<session>`, minted from the session it was first opened with, and it never changes; its domain reference names the session it shows now, which differs from the id's suffix after Restart or after a restore whose session did not survive (`Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180`). `terminal_session_record` moves to value `pm.storage_value.terminal_session_record.v2` 2.0.0 at its unchanged key `terminal_session_record.v1:{project_id}:{terminal_session_id}`: its required `terminal_leaf_pane_id` becomes an optional `tab_id`: the id of the terminal tab that shows the session, or that last showed it once the session has ended, or null. It is the tab's id, never derived from the session's own id, so a session survives every view change and a tab keeps its id across sessions. When Restart, a restore or a reopen starts a new session in a tab, the new session's record takes that tab's id, and the ended session's record keeps it as history. Moving, collapsing, maximizing or hiding the tab never touches the session record; closing the tab ends the session (SMPFS-180), and the record keeps its history under its retention. The StorageMigrationCoordinator converts every row: `terminal_leaf_pane_id` moves to `legacy_terminal_leaf_pane_id`, and `tab_id` is the id of the terminal tab SP-330's conversion placed the session in (minted from that session, so `terminal:<terminal_session_id>`), else null. The exact v1 value schema stays under `$defs.legacy_v1` for old-store admission, conversion and backup inspection, as the command-block migration does.

**Read-only migration inputs.** `terminal_workspace_state`, `terminal_section_record`, `terminal_workgroup_record` and `editor_terminal_panel_state` become read-only migration inputs; so do `terminal_tab_record`, `terminal_pane_record` and `terminal_leaf_pane_record`, because one session per tab and no splits inside a terminal leave them nothing to hold (DL-181: terminal layout records are converted or retired). SP-330's conversion reads them once; nothing writes them again. `terminal_session_record`, `terminal_command_block` and `dev_session_record` stay current. The terminal's place in the layout lives only in the v2 Home record.

**SP-122's nine keys.** They were prose-only and never registered (section 2.3.1). Each now maps to a registered family or an owner:

| SP-122 key | Now |
|---|---|
| `terminal_session.v1:{terminal_session_id}` | `terminal_session_record.v1:{project_id}:{terminal_session_id}` |
| `terminal_layout.v1:{project_id}` | The v2 Home layout record (SP-330); there is no separate terminal layout |
| `terminal_history.v1:{terminal_session_id}` | `terminal_command_block.v1:{project_id}:{terminal_session_id}:{command_block_id}` |
| `terminal_profile.v1:{profile_name}` | Shell profiles in Settings (`Plans/Settings_System.md#SSYS-051`) |
| `terminal_env.v1:{project_id}` | The Project's Settings (`pm.project_settings_snapshot.v1`) |
| `terminal_cwd.v1:{terminal_session_id}` | `cwd_ref` of `terminal_session_record` |
| `terminal_scroll.v1:{terminal_session_id}` | Saved scrollback, below |
| `terminal_font.v1:global`, `terminal_color.v1:global` | The appearance layers of SP-331 |

**Saved scrollback.** A terminal's saved scrollback is the terminal restore record's transcript chunks (SP-125), not a new store. What is saved: the main screen's retained lines, at most the 10,000-line scrollback plus the screen, their styles and links, command records with `by`, and every image placement anchored in them. Never saved, `transient_only`: the alternate screen, the command line being typed, selections and find highlights. The quota is 64 MiB stored per terminal tab, text and images together. Images are stored as PNG, one record per frame, written once and reused by later saves, append-oriented like the transcript chunks. Text is bounded by the scrollback limit and never gives way to images; images that do not fit are dropped oldest first (highest in the scrollback), and a frame that cannot be read back is treated the same. An evicted image leaves a placeholder record in its cells naming it, with its width and height, which the tab draws as `[<name> <W>×<H> · not kept]` (`Plans/FinalGUISpec.md#F3-645`). A terminal tab has one saved copy, keyed by project and by the tab's id, like the layout. The copy and its 64 MiB quota belong to the tab, whichever session wrote them: the session the tab shows now writes it, and each save replaces the tab's previous copy, because the copy is always the tab's scrollback as it stands, restored lines included. After Restart or a restore the new session's first save takes the copy over, so an ended session never leaves a copy of its own and a tab never holds more than one. A restored or reopened tab loads the copy under its own tab id. An ended session's `terminal_session_record` keeps the tab's id as history only; it locates no copy.

Saved images follow saved scrollback's own rules, the transcript chunks': the same 64 MiB quota of the tab, the same retention after close and the same exclusion from backups, exports and sync.

**Writes, restore and retention.** The copy is written 1.5 s after output settles, at most every 5 s while output streams, and when the page hides; an unchanged terminal is not written again. Clear scrollback empties the saved copy at the next save. A tab with no live session loads its saved copy before its new session starts (`#SMPFS-180`, `#F3-645`); placeholder cells on restored lines resolve only to restored images; a command still running when the page went away comes back ended and indeterminate, never done (SP-125, `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-023`). The load budget is 5 s; past it the tab starts without its scrollback and says so. A closed tab's copy is kept while the tab can be reopened (the closed-tab stack holds 20, SP-330) and for at most 7 days, then deleted. An open tab's copy is never deleted for age; the quota bounds it. A missing or unreadable chunk reads as partial or unavailable, never as empty output (SP-125).

**On this machine only.** Saved scrollback and its images stay on this machine: they are excluded from backups, exports and sync. SP-047's rule that the durable store does not persist interactive transcript or stdin by default covers the privileged-session evidence store Puppet Master keeps for its own external operations; it does not cover the user's terminal scrollback (lead ruling 2026-10-10). SP-047 itself is unchanged. Secret prompts need no rule of their own here, because their input is never echoed. The saved lines are the output as the terminal showed it, unredacted, like the live screen. Command blocks still point at them only by `transcript_ref` and never hold output or command text inline (the no-secret rule of `terminal_command_block` in `Plans/storage_value_registry.json`); the chunks are those refs' targets, and they stay unredacted because they never leave this machine and are deleted as above. No storage family holds an agent's write grant for a terminal (`Plans/Contracts_V0.md#CV-362`).

**Open items.** Two are left for the lead and Jared. First, SP-125's transcript chunks, and with them saved scrollback and its PNG frames, have no physical family in `Plans/storage_value_registry.json`, so no registry row yet carries their key by project and terminal tab, the 64 MiB and 7-day retention, `backup_required: false` or the export and sync exclusion. Registering them needs a value schema, a retention policy and a redaction transform, and is not done in this addendum. Second, whether saved scrollback should be scrubbed of secrets that a program itself printed (for example a file of keys shown with `cat`) is Jared's question; until he answers, it is kept unredacted on this machine only, as above.

### SP-332 - Terminal Records Re-Scoped To One Session Per Tab, And Saved Scrollback

```yaml
plan_unit_id: SP-332
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Terminal storage follows one session per tab (DL-181, SMPFS-180). terminal_session_record moves to value
  pm.storage_value.terminal_session_record.v2 at its unchanged key: the required terminal_leaf_pane_id becomes an
  optional tab_id, the id of the terminal tab that shows the session (or last showed it, once ended) or null, never
  derived from the session's own id, so a session survives every view change and a tab keeps its id when Restart
  or a restore gives it a new session, with a
  coordinator-only conversion and the v1 value schema kept under $defs.legacy_v1. terminal_workspace_state,
  terminal_section_record, terminal_workgroup_record and editor_terminal_panel_state, and with them
  terminal_tab_record, terminal_pane_record and terminal_leaf_pane_record, are read-only migration inputs read once
  by SP-330. SP-122's nine prose-only keys map to terminal_session_record, the v2 Home record, terminal_command_block,
  Settings, the Project's Settings, cwd_ref, saved scrollback and SP-331. Saved scrollback is the terminal restore
  record's transcript chunks (SP-125), not a new store: the main screen's retained lines (at most the 10,000-line
  scrollback plus the screen), styles, links, command records with by and anchored image placements, never the
  transient_only alternate screen, typed line, selections or find highlights; 64 MiB per terminal tab for text
  and images, images as PNG with one record per frame written once; text never gives way to images, images drop oldest
  first and leave a placeholder record naming them; written 1.5 s after output settles, at most every 5 s while
  streaming and when the page hides; Clear scrollback empties it at the next save; kept for a closed tab while the
  20-tab stack can reopen it and at most 7 days; a 5 s load budget; one copy per terminal tab, keyed by project
  and tab id whichever session wrote it, each save replacing the tab's previous copy, so after Restart or a restore
  the new session's first save takes the copy over and a restored or reopened tab loads the copy under its own tab
  id. Saved images follow saved scrollback's storage, retention and exclusion rules. Saved scrollback is excluded
  from backups, exports and sync and holds the output unredacted, which command blocks reach only by
  transcript_ref; its physical family registration and whether to scrub secrets a program printed are open items. SP-047's no-transcript rule covers the privileged-session evidence store, not terminal
  scrollback. No storage family holds an agent's terminal write grant (CV-362).
gui_related: true
gui_classification_reason: Decides what a terminal tab keeps across moves, restarts and reopen, and what its restored scrollback shows.
split_recommended: false
depends_on: [DL-181, DL-182, SMPFS-180, SMPFS-181, SP-125, SP-128, SP-330, SP-331, CV-362]
unblocks: []
acceptance_criteria:
  - "A terminal tab moved, collapsed, maximized or hidden leaves its terminal_session_record unchanged; tab_id is the tab that shows the session (or last showed it) or null, and it may differ from terminal:<this session id> after Restart or a restore."
  - "A terminal tab has at most one saved copy, keyed by project and tab id; the first save of a new session after Restart or a restore replaces the earlier copy, an ended session keeps no copy of its own, and a restored or reopened tab loads the copy under its own tab id."
  - "terminal_session_record v1 values convert only through the StorageMigrationCoordinator, with the v1 schema kept under $defs.legacy_v1."
  - "The seven terminal layout families have no writer after the conversion and are read only by SP-330."
  - "Each of SP-122's nine keys maps to exactly one registered family, owner or rule, and none is written as a key."
  - "Saved scrollback stores the main screen's lines, styles, links, command records and anchored images within 64 MiB per terminal tab, never the alternate screen, the typed line, selections or find highlights."
  - "Text never gives way to images; images drop oldest first and an evicted image leaves a placeholder record with its name and size."
  - "Writes follow the 1.5 s, 5 s and page-hide cadence and skip unchanged terminals; Clear scrollback empties the saved copy at the next save."
  - "A closed tab's copy is deleted when the tab leaves the 20-tab stack or after 7 days, whichever comes first; an open tab's copy is bounded by its quota and never deleted for age; past the 5 s load budget the tab starts without its scrollback and says so."
  - "No backup, export or sync carries saved scrollback or its images, and no stored value holds an agent's terminal write grant."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - Plans/storage_value_registry.json
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-181"
  - "Plans/Decision_Log.md#DL-182"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D11, D14)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b (section 7, saved scrollback; concept lineage only)"
  - "Plans/storage-plan.md#SP-122"
  - "Plans/storage-plan.md#SP-125"
preserved_exact_tokens:
  - "pm.storage_value.terminal_session_record.v2"
  - "terminal_session_record.v1:{project_id}:{terminal_session_id}"
  - "tab_id"
  - "legacy_terminal_leaf_pane_id"
  - "transient_only"
  - "64 MiB"
  - "terminal_workspace_state"
  - "terminal_section_record"
  - "terminal_workgroup_record"
  - "editor_terminal_panel_state"
negative_constraints:
  - "Do not tie a session's lifetime to a view: no move, collapse, maximize or hide changes the session record."
  - "Do not write the seven terminal layout families after the conversion."
  - "Do not save the alternate screen, the typed line, selections or find highlights."
  - "Do not let images push out text, and do not show an evicted image as empty cells."
  - "Do not put saved scrollback or its images in a backup, an export or sync."
  - "Do not store an agent's terminal write grant."
compatibility_only_notes:
  - "terminal_leaf_pane_id survives only as legacy_terminal_leaf_pane_id on converted values."
stale_retired_dispositions:
  - "Supersedes SP-122's nine-key decomposition (DL-181)."
  - "Retires the section, workgroup, tab, pane, leaf-pane, workspace and editor-terminal-panel families as writable records (DL-181)."
owner_hints:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/Section15_MVP_Promoted_Features_Spec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/Decision_Log.md#DL-182, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-181, ContractName:Plans/storage-plan.md#SP-125, ContractName:Plans/storage-plan.md#SP-330, ContractName:Plans/Contracts_V0.md#CV-362, SchemaID:pm.storage_value.terminal_session_record.v2
