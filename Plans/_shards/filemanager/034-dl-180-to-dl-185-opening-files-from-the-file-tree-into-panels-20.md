# Shard 034: DL-180 to DL-185 — Opening Files From The File Tree Into Panels (2026-10-09)

Source: `Plans/FileManager.md`

Source lines: L5317-L5422

Source SHA256: `1f8b8735ac479cc2ef429cfb5eb5f2be86b8612ae35c291df95db6029ac3af6a`

---

## DL-180 to DL-185 — Opening Files From The File Tree Into Panels (2026-10-09)

Jared's home redesign (`Plans/Decision_Log.md#DL-180`, decision D7) makes Home's centre one universal panel system and
gives every file reference one set of opening rules. This addendum adds F-090: how the file tree opens files into the
panels. The rules themselves are `Plans/FinalGUISpec.md#F3-634`'s (one opening module, kept single by
`Plans/DRY_Rules.md#DR-071`), and the placement fields are `Plans/Contracts_V0.md#CV-360`'s; F-090 cites them and adds
only what is the file tree's own. It supersedes F-080 (the four stable editor panels and the Open in Panel 1 to 4
submenu) and the Home reconciliation of 2026-08-04 above it, and amends with dated notes F-009 (which panel a click
lands in), F-017 (the File Editor strip and the floating editor panels), F-023 (the focused editor group as the open
target), F-033 (file paths clicked in chat), F-034 and F-036 (the editor-panel target fields), F-040 (terminal tab
identity), F-067 ("Open in Terminal" and placement), F-073 (the minimap scrollbar stays) and the prose of sections 1,
2.1, 2.4, 4.1's route rules, 7 and 9. It creates no WorkNodes, NodeSeeds, executable queues, implementation files or
production build tasks.

### F-090 - Opening Files From The File Tree Into Panels

```yaml
plan_unit_id: F-090
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The file tree opens files into the home panels through the one opening module (DL-180, D7;
  Plans/FinalGUISpec.md#F3-634, Plans/DRY_Rules.md#DR-071) and keeps no placement or dedupe rule of its own. A single
  click on a file row opens the file in the target panel's preview tab, with an italic label, which the next single
  click replaces, and leaves keyboard focus in the tree so the arrow keys keep walking it; a double click opens the
  file kept and moves focus to its tab; an edit in the tab, or dragging the tab, keeps a preview tab. With the Preview
  Tabs setting off (`general.interaction.preview-tabs`, Plans/Settings_System.md#SSYS-050), a single click opens the
  file kept. Enter on a focused file row opens it as a double click does. The tree dispatches the existing `cmd.file.open` with the placement
  fields of Plans/Contracts_V0.md#CV-360 beside the file's identity: `mode: preview` for a single click, `mode: keep`
  for a double click or Enter, `where: panel` for Alt+click, and `background: true` for Ctrl+click (Cmd+click on
  macOS), which opens the file without taking focus. A file already open anywhere is revealed where it is, as F3-634
  says. Alt+click opens the file in a new panel by the fit rule (Plans/FinalGUISpec.md#F3-630). The target of an ordinary
  click is the last-focused panel that holds documents, as F3-634 says; this unit does not restate that rule. The
  file row's context menu starts with Open (kept, in that target), Open in new panel (`where: panel`) and Open to the
  side (`where: right`, a new panel to the right of the target panel), then a separator and the existing file-tree
  actions of section 11. The Open in Panel submenu with Panel 1 to Panel 4 and its `target_editor_panel_id` routing
  retire. Open in Terminal on a folder reveals the last-focused terminal tab whose folder is that folder, else opens a new terminal tab there; on a file it uses the file's folder in the same way; the terminal tab lands where F3-634 places a terminal. A folder row's single
  click still expands or collapses it and opens nothing. Opening, revealing and keeping a file change only the Home
  layout and the file's tab: the tree's selection, expansion, filter and multi-select state are its own (F-009,
  F-011) and never written into the Home layout record. This supersedes F-080 and the editor-panel targets of F-017,
  F-034 and F-036, and amends F-009, F-023, F-033, F-040 and F-067.
gui_related: true
gui_classification_reason: Defines what a person sees happen when they click, double-click, Alt+click or right-click a file or folder in the file tree.
split_recommended: false
depends_on: [DL-180, F3-634, CV-360]
unblocks: [ATS-075, GRRC-040]
acceptance_criteria:
  - "A single click on a file row opens that file in the target panel's one italic preview tab, replacing the previous preview there, and focus stays in the tree; with Preview Tabs off it opens the file kept."
  - "A double click, or Enter on a focused file row, opens the file kept and moves focus to its tab; an edit in a preview tab or a drag of it keeps it."
  - "Each open dispatches exactly one `cmd.file.open` with CV-360's placement fields and no `target_editor_panel_id`, `target_editor_group_id` or `target_group`."
  - "Clicking a file that is already open in any panel, including a collapsed panel or one hidden in \"+N\", reveals that tab and opens no second tab."
  - "Alt+click opens the file in a new panel by the fit rule, and Ctrl+click (Cmd+click) opens it without taking focus."
  - "The file row's context menu starts with Open, Open in new panel and Open to the side, and has no Open in Panel submenu."
  - "Open in Terminal on a folder reveals the last-focused terminal tab whose folder is that folder, else opens a new terminal tab there; on a file it uses the file's folder in the same way."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FileManager.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D7, D8)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (sections 6 and 6.2; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md, SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8 (section 3.4 and gap C5; audit lineage only)"
  - "Concepts/home-redesign/src/panels/js/48-shims.js on concept/home-panels-20261009 (the tree's clicks and its context-menu rows; concept lineage only)"
preserved_exact_tokens:
  - "cmd.file.open"
  - "mode: preview"
  - "mode: keep"
  - "where: panel"
  - "where: right"
  - "background: true"
  - "Open in new panel"
  - "Open to the side"
  - "Open in Terminal"
negative_constraints:
  - "Do not give the file tree a placement or dedupe rule of its own."
  - "Do not open a file that is already open a second time, or move its tab."
  - "Do not route a tree open by `target_editor_panel_id`, `target_editor_group_id` or `target_group`, or offer Panel 1 to Panel 4."
  - "Do not write the tree's selection, expansion or filter into the Home layout record."
compatibility_only_notes:
  - "The concept routes the tree through a compatibility shim over its old handlers; the shim and its names are concept lineage, not product names."
stale_retired_dispositions:
  - "Amended 2026-10-10 (lead ruling L11): Open in Terminal reveals the last-focused terminal tab in the target folder, else opens one there."
  - "Superseded 2026-10-09 (DL-180): F-080's Open in Panel submenu with Panel 1 to Panel 4, its four stable editor panel identities and its target_editor_panel_id routing."
owner_boundary_notes:
  - "F3-634 owns the opening rules and where a new tab lands, CV-360 the placement fields, F3-635 the tab kinds, and F3-639 the editor tab; this unit owns only the file tree's gestures and its context-menu open rows."
owner_hints:
  - Plans/FileManager.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/Contracts_V0.md#CV-360, ContractName:Plans/DRY_Rules.md#DR-071, ContractName:Plans/FileManager.md#F-080
