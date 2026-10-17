# Shard 014: DL-180 to DL-185 — Panels, Tabs And The Words Around Them (2026-10-09)

Source: `Plans/Glossary.md`

Source lines: L2192-L2328

Source SHA256: `416d1491a66af54d9902841aebae61034a446c4af9a232b6b1d26a1c08b2d15a`

---

## DL-180 to DL-185 — Panels, Tabs And The Words Around Them (2026-10-09)

Jared's home redesign of 2026-10-09 (DL-180, DL-181) makes the middle of the window one universal panel system and the terminal one session per tab. Several of its words were already taken: the left rail calls its views panels, a workspace tab is a project tab, and the terminal had sections, workgroups, sub-tabs and panes. G-030 fixes one meaning for each word and lists the words that retire. It amends G-010 and the Terminal runtime terms above, which keep Terminal Session and Dev Session unchanged.

Amended 2026-10-10 (DL-186, DL-187): Jared's answers add words for dashboards that people make and the presets they save, and bring back sub-tab for one current use, the Debug Console's session sub-tabs. G-030 now defines board, built-in dashboard, custom dashboard, Start from, preset (saved preset) beside a widget's size preset, and session sub-tab.

### G-030 - Panels, Tabs And The Words Around Them

```yaml
plan_unit_id: G-030
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: >-
  The words for the home centre's panels and tabs have one meaning each (DL-180, DL-181). A panel is a tab group in
  the home centre: a leaf of the centre's split tree that can hold tabs of any kind (FinalGUISpec F3-630). A side
  panel is one of the left rail's panels, such as Files, Search or Source Control (F3-481, F3-618); where a home panel
  could be meant, say side panel, and the rail and the chat keep the cmd.panel.* vocabulary (UCC-138, UCC-203). A tab,
  or panel tab where it could be confused, is one tab in a panel's strip, with an opaque, stable id whose prefix names
  its kind; it is separate from the domain object it shows and lives in exactly one panel (F3-635). A tab kind is one
  of the fifteen kinds of F3-635: editor, terminal, browser, dashboard, plan, document, artifact, run, transcript,
  context, record, output (one tab; its channel switches inside it), problems, ports and debug_console. A tool kind is one of output, problems, ports and
  debug_console, the runtime views that used to sit in the bottom zone; a tools panel is a panel that holds only tool
  kinds and terminals, where those kinds land beside the terminals (F3-634). A workspace tab is still a project tab,
  the tab that switches projects (workspace_tab_id, F3-038); where older text says editor/workspace tab for the place
  a browser opens, it means a panel tab. A page is still a primary page reached from the activity bar, such as Home or
  Usage; Home is the page that holds the panels, and the pages inside a browser tab are web pages. The Orchestrator
  page's tabs and other in-page tabs are that page's own views, not panel tabs. A split is a row or a column of
  panels, each with its own share of the space (F3-630). A named layout is a saved arrangement of the home centre: the
  four that ship (Home, Build, Terminals 2x2, Focus) and any the user saves (F3-630). A preview tab is a panel's one
  tab with an italic label that the next single-clicked file replaces, until a double click, an edit or a drag keeps
  it (F3-634). A pinned tab is an icon-only tab at the left of its strip that never hides (F3-631). A dashboard tab is
  a tab of kind dashboard showing one widget board; there may be several (F3-638, WS-030). A terminal tab is a tab of
  kind terminal that holds exactly one terminal session (F3-640, SMPFS-180, G-010). The "+" menu is the menu the "+"
  after a panel's last tab opens, whose rows open a kind as a new tab or as a new panel; an empty panel shows the same
  rows as its launcher (F3-632). The "+N" list is the searchable list of a panel's tabs that do not fit, opened from
  the plain "+N" at the end of its strip (F3-633). The chat column is neither a panel nor a tab (F3-637). Retired
  words, kept only in lineage and migration text: terminal section, workgroup, sub-tab, quadrant, terminal pane, the
  four fixed editor panels, the singleton Dashboard surface, and the bottom panel or bottom zone as a place; the
  default Home layout's bottom row is an ordinary panel row.
  Amended 2026-10-10 (DL-186, DL-187): a board is one widget board of the one board engine, the Usage page's or a
  dashboard tab's; a dashboard tab shows exactly one board (WS-030). A built-in dashboard is Home, Metrics,
  Monitoring or Agents, which can be reset but never renamed as a board or deleted; a custom dashboard is one a
  person made with New dashboard, which they can rename and delete (D35). Start from is the Board menu's choice that
  replaces a board's widgets with a set: the board's own default, a Usage room's set, the dashboard starter or a
  saved preset. A preset, or saved preset where a size preset could be meant, is a board's arrangement that a person
  saved and can rename or delete; it belongs to the person across projects and is applied through Start from. A
  widget's size preset (WS-017) is always called a size preset where the two could be confused. A session sub-tab is
  the Debug Console's switch between debug sessions inside its one tab (D33): it is view state, never a panel tab,
  and it does not revive the retired terminal sub-tab.
  Amended 2026-10-17 (DL-228, DL-230, Jared): a Usage widget is a card everywhere, on the Usage page, on its
  boards and on a dashboard tab inside a Home panel: Hide card, Cards in <Room>, "N cards", Move card. The
  concept's Usage copy is the reference wording with its "panel" read as "card", so a Usage card never reads as
  a Home panel or the Home panel's Move panel.
gui_related: true
gui_classification_reason: This unit defines the user-visible words for panels, tabs and the home centre and the words they retire.
split_recommended: false
depends_on: [DL-180, DL-181, DL-186, DL-187, F3-630, F3-635]
unblocks: []
acceptance_criteria:
- Each word defined here has one meaning, and an owner document that uses it in another sense qualifies it (panel tab, side panel, workspace tab, web page).
- No active unit uses terminal section, workgroup, sub-tab, quadrant, terminal pane or the bottom panel as a place for current product behaviour; they appear only in lineage, migration or retirement text.
- "Amended 2026-10-10 (DL-187): the retired sub-tab is a terminal's sub-tab; the Debug Console's session sub-tab (D33) is a current word and names view state inside one tab."
- "Amended 2026-10-10 (DL-186): board, built-in dashboard, custom dashboard, Start from, preset and session sub-tab each have one meaning, and a widget's size preset is called a size preset wherever a saved preset could be meant."
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
- "Output in the tab-kind and tool-kind lists means one tab with its channel switched inside it; split-off channel identity follows F3-635."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-2.md, SHA-256 1eecc96b03a1a774f52d06420c913553d5f5d1917e1bd5705e2f6e0bbc11fad6 (D31)"
- Plans/Decision_Log.md#DL-180
- Plans/Decision_Log.md#DL-181
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D1, D2, D5-D11)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md, SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8, section 7.3 gap C17 (worklist)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-terminal-audit.md, SHA-256 12f95fa6f79b1c0a1f9f34b1eee004cac9edacfd8e0a7f4e6495fe1af23aabe3, Appendix 5 C.3 and Appendix 8 F.3 (worklist)
- Plans/Decision_Log.md#DL-186
- Plans/Decision_Log.md#DL-187
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md, SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D33, D35)"
preserved_exact_tokens:
- panel
- side panel
- panel tab
- tab kind
- tool kind
- tools panel
- workspace tab
- page
- split
- named layout
- preview tab
- pinned tab
- dashboard tab
- terminal tab
- '"+" menu'
- '"+N" list'
- terminal section
- workgroup
- sub-tab
- quadrant
- bottom panel
- board
- built-in dashboard
- custom dashboard
- Start from
- saved preset
- size preset
- session sub-tab
negative_constraints:
- Do not call a left rail panel a panel where a home panel could be meant; call it a side panel.
- Do not use workspace tab for a panel tab.
- Do not revive a retired word as a current product term.
- Do not call a widget's size preset a preset where a person's saved board preset could be meant, or a debug session's sub-tab a panel tab.
compatibility_only_notes:
- Terminal section, workgroup, sub-tab, quadrant and terminal pane stay readable in superseded units and in the old records that are read-only migration inputs (SP-330, SP-332).
stale_retired_dispositions:
- "Amended 2026-10-10 (D31, DL-180): Output uses one tab with its channel as view state; only an explicit channel split-off uses output:<channel>."
- "Amended 2026-10-10 (DL-186, DL-187): adds board, built-in dashboard, custom dashboard, Start from, preset (saved preset) beside size preset, and the Debug Console's session sub-tab; the retired sub-tab is the terminal's."
- 'Retired 2026-10-09 (DL-180, DL-181): terminal section, workgroup, sub-tab, quadrant, terminal pane, the four fixed editor panels, the singleton Dashboard surface, and the bottom panel or bottom zone as a place.'
owner_boundary_notes:
- Glossary owns the words; the panel model is FinalGUISpec F3-630 to F3-639, the terminal tab F3-640 and SMPFS-180, the dashboard boards WS-030, and the layout record SP-330.
- The boards, Start from and presets are WS-030's; the size presets WS-017's; the Debug Console's sub-tabs F3-635's and F3-490's.
owner_hints:
- Plans/Glossary.md
- Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/FinalGUISpec.md#F3-618, ContractName:Plans/FinalGUISpec.md#F3-038, ContractName:Plans/Widget_System.md#WS-030, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180
