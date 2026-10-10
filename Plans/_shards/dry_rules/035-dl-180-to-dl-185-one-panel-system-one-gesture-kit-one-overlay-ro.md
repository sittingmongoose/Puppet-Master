# Shard 035: DL-180 to DL-185 — One Panel System, One Gesture Kit, One Overlay Root, One Terminal Appearance Model, Shell-Wide Bans, One Demo Studio And One Opening Module (2026-10-09)

Source: `Plans/DRY_Rules.md`

Source lines: L3196-L3682

Source SHA256: `11109edad77de99e5435ec7d13cd33654af0587b6a16f26eba546597831321c0`

---

## DL-180 to DL-185 — One Panel System, One Gesture Kit, One Overlay Root, One Terminal Appearance Model, Shell-Wide Bans, One Demo Studio And One Opening Module (2026-10-09)

Jared's home redesign of 2026-10-09 (DL-180 to DL-185) replaces Home's four fixed editor panels, singleton dashboard, bottom terminal zone and movable chat with one universal panel system, rebuilds the terminal as one session per tab, and makes the bans on side stripes, emoji and pills one rule for the whole app. Each piece the redesign shares across surfaces lives in one place, and these seven rules say where. They supersede the per-surface owners of the 2026-08-04 Home owner boundary and its U10 sentence (both amended in place above), and they amend the PMConcept7 SSOT table's Home row and DR-039 for several dashboard tabs, the Guided Tour paragraph of the touch-closure addendum, DR-044's run view, DR-047's Plan footer and DR-057's pill clause, which now reads as the left rail's instance of DR-069. The concept builds are lineage only: no concept class, storage key or script global is a product name here.

### DR-065 - One Panel And Tab Grammar For Every Panel In The Home Centre

```yaml
plan_unit_id: DR-065
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Every panel in the home centre is drawn from one grammar, whatever tab kinds it holds (DL-180, D5, D6, D12). There
  is one tab strip (FinalGUISpec F3-631, F3-505's contact-aware silhouette generalised) with one tab menu, one "+"
  button and its menu (F3-632), one empty-panel launcher showing that menu's rows (F3-632), one "+N" list of the tabs
  that do not fit (F3-633), one shared header row for every kind that needs controls above its content (F3-635), and
  one keyboard table with one web-client mapping rule (F3-635). No tab kind draws its own strip, tab overflow, "+" or
  menu button, panel menu or header row; a kind draws a row of its own only when nothing in the shared header row
  fits, and that kind's owner unit records why. The panel keys are F3-635's alone and no kind redefines one: a
  kind's own keys work only inside its body, and a terminal keeps the shell's keys and gives back the host keys
  F3-640 lists. A kind supplies its content, its registration (label, group, icon,
  id prefixes, content minimum, its "+" row, mount, saved state, close check; F3-635) and its marks through the host;
  every tab mark that names a state comes from the one status set (F3-585, DL-141), and every kind icon is a
  bundled SVG icon_id (FinalGUISpec section 2.6, F3-417), never an emoji. The dashboard, the terminal and the browser
  are tab kinds of the one panel model (F3-630); none keeps a second panel model, strip, layout record or placement
  rule, so the dashboard's own strip, the terminal's sections, workgroups, sub-tabs and in-tab splits, and the
  editor-only strip and overflow rules are gone (F3-631, F3-633, SMPFS-180). A tab is a view of its owner's object,
  and the panel adds no session, store or service of its own: a browser tab shows a session of the Browser owner
  (DR-037), a terminal tab one terminal session (SMPFS-180), and a dashboard tab one widget board hosted through
  Widget_System (WS-030), never through a new host service (DR-038). The chat column is outside this grammar: never a
  panel and never a tab (F3-637). Hover on tabs, strip buttons, dividers and header-row buttons is the shell's one
  hover system, a static tint at most (DR-059, F3-465). This rule supersedes the per-surface Home owners of the
  2026-08-04 Home owner boundary for panel and tab presentation.
gui_related: true
gui_classification_reason: "Fixes one grammar for every panel and tab in the home centre."
split_recommended: false
depends_on: [DL-180, F3-630, F3-631, F3-632, F3-633, F3-635]
unblocks: []
acceptance_criteria:
  - "No tab kind or panel owner defines its own tab strip, tab overflow, \"+\" button, menu button, panel menu or header row, and every kind-specific row is justified in its owner unit."
  - "The dashboard, the terminal and the browser are tab kinds of F3-630's one panel model, with no second panel model, layout record, strip or placement rule."
  - "Every tab state mark comes from the one status set of F3-585 and every kind icon is a bundled SVG icon_id."
  - "One keyboard table and one web-client mapping rule serve every panel; no kind redefines a panel key."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D1, D5, D6, D9, D12, D24)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9, sections 3, 4, 5 and 9 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md, SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8, section 6.3, part 1.7 (worklist)"
preserved_exact_tokens:
  - "+N"
  - "header row"
  - "web-client mapping rule"
  - "F3-631"
  - "F3-635"
negative_constraints:
  - "Do not give a tab kind its own strip, overflow, \"+\" or menu button, panel menu or header row."
  - "Do not build a second panel model, layout store or placement rule for the dashboard, the terminal or the browser."
  - "Do not add a tab status glyph outside the one status set or a kind icon outside the bundled icon registry."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/FinalGUISpec.md#F3-631, ContractName:Plans/FinalGUISpec.md#F3-632, ContractName:Plans/FinalGUISpec.md#F3-633, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/FinalGUISpec.md#F3-585, ContractName:Plans/Widget_System.md#WS-030, ContractName:Plans/DRY_Rules.md#DR-059, ContractName:Plans/Decision_Log.md#DL-141

### DR-066 - One Gesture Kit For Panels And The Usage Board

```yaml
plan_unit_id: DR-066
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Panels and the Usage widget board move with one gesture kit (DL-180, D1; Jared, in the question form: "Split tree +
  Usage gestures (Recommended)"). The kit is the interaction layer only: pick-up after a small travel threshold, the
  held item following the pointer one to one, the landing preview, target hysteresis and dwell, edge auto-scroll, the
  settle on drop and the glide back on cancel, a keyboard path for every pointer move, and polite announcements of
  where the item would land and where it landed. Its transaction is one rule for both layouts: the preview is local and dispatches nothing, writes nothing
  and emits no event; a changed release commits exactly one owner command; an unchanged or invalid release, Escape, a
  pointer cancel or the window losing focus commits nothing and restores the exact earlier picture; and a failed
  commit rolls back (UIW-012, CS-068). The pointer rules are F3-HOME-002's and F3-503's, which F3-630 applies to
  panels and tabs; the Usage board uses the same kit under WS-019. Each layout supplies only its own target model, its
  keys and its numbers: the split tree resolves strips, panel edges and the "+N" list with F3-630's
  thresholds, and the board resolves grid cells with its own. The kit carries no layout model. The board's snapping
  widget grid, its tracks, its push-down resolver and its gravity lay out widgets only: on the Usage page and, in the
  home centre, only inside dashboard tabs (WS-030); they never lay out panels, and the split tree never lays out
  widgets. No widget command, widget hostability, widget order or geometry, or Dashboard widget state enters the Home
  layout record, and no panel or tab command reaches a widget board. How the board's previews look stays F3-628's
  (DR-058) and how panel previews look stays F3-630's and F3-647's. Under Reduced Motion every part of the kit is
  instant and every close path still works. This replaces the 2026-08-04 Home owner boundary's sentence that U10's
  interaction behaviour is "a reusable interaction vocabulary only".
gui_related: true
gui_classification_reason: "Fixes one gesture kit for moving panels, tabs and Usage widgets."
split_recommended: false
depends_on: [DL-180, F3-630, F3-503, WS-019]
unblocks: []
acceptance_criteria:
  - "The panel split tree and the Usage widget board run one gesture kit; neither keeps its own pointer controller, preview transaction, keyboard move path or announcement scheme."
  - "No preview dispatches a command, writes storage or emits an event; a changed release commits one owner command and a cancel restores the exact earlier picture."
  - "The snapping widget grid lays out widgets only, and in the home centre only inside dashboard tabs; no panel is placed on widget tracks."
  - "The Home layout record holds no widget command, widget order, widget geometry or Dashboard widget state."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/Widget_System.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D1, D2)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/widgets-and-coordination.md, SHA-256 631c28a9198c9f550514c856ade138627410b94c48fe5f96a67450b14f407a90, part A, A4 and A6 (research lineage)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9, section 8 (concept lineage only)"
preserved_exact_tokens:
  - "Split tree + Usage gestures (Recommended)"
  - "a reusable interaction vocabulary only"
  - "F3-630"
  - "WS-019"
  - "WS-030"
  - "UIW-012"
negative_constraints:
  - "Do not build a second gesture controller, preview transaction or keyboard move path for panels or for widgets."
  - "Do not lay out panels on the widget grid or widgets in the split tree."
  - "Do not write widget layout into the Home record or panel layout into a widget board."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/Widget_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/FinalGUISpec.md#F3-503, ContractName:Plans/Widget_System.md#WS-019, ContractName:Plans/Widget_System.md#WS-030, ContractName:Plans/UI_Wiring_Rules.md#UIW-012, ContractName:Plans/Commands_System.md#CS-068, ContractName:Plans/DRY_Rules.md#DR-058

### DR-067 - One Overlay Root And One Stacking Order

```yaml
plan_unit_id: DR-067
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Everything that floats over the home centre opens in one overlay root with one stacking order (DL-180, DL-185,
  D27). The "+" menu, the "+N" list, tab menus, panel menus, every menu a tab kind opens through the host, drag ghosts
  and landing previews open in that root, and no tab kind appends an overlay layer of its own to the page or the
  window. The order is fixed, bottom to top: panel content, then tab strips and dividers, then the overlay root, which
  sits above the status bar and below the Demo Studio's controls (DR-070), the hover tags and the Guided Tour
  (F3-635). Hover tags belong to the shell's one hover system (DR-059) and the Guided Tour to its own owner; neither
  joins the overlay root and neither keeps a second stacking order. When the 5.6 Pro chat is ported (ACD-501, D27),
  its body-portaled popouts (F3-424) and its menus open in the same root and order; the chat keeps no overlay layer
  and no stacking order of its own. A tab body never draws past its own box except through this root, and Escape
  closes only the innermost open thing (F3-568).
gui_related: true
gui_classification_reason: "Fixes one overlay root and one stacking order for the home centre and the ported chat."
split_recommended: false
depends_on: [DL-180, DL-185, F3-635]
unblocks: [F3-640, ACD-501]
acceptance_criteria:
  - "Every menu, list, drag ghost and landing preview over the home centre opens in the one overlay root."
  - "No tab kind and, after the port, no part of the 5.6 Pro chat appends its own overlay layer or keeps its own stacking order."
  - "The order is panel content, then strips and dividers, then the overlay root above the status bar, with the Demo Studio's controls, hover tags and the Guided Tour above it."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "Plans/Decision_Log.md#DL-185"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D27)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9, section 14 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md, SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162, the z ladder (concept lineage only)"
preserved_exact_tokens:
  - "overlay root"
  - "F3-424"
  - "F3-635"
  - "F3-568"
negative_constraints:
  - "Do not open a tab kind's or the ported chat's overlay outside the one overlay root."
  - "Do not introduce a second stacking order for menus, ghosts or previews."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Decision_Log.md#DL-185, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/FinalGUISpec.md#F3-424, ContractName:Plans/FinalGUISpec.md#F3-568, ContractName:Plans/assistant-chat-design.md#ACD-501, ContractName:Plans/DRY_Rules.md#DR-059

### DR-068 - One Terminal Appearance Model

```yaml
plan_unit_id: DR-068
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  The terminal has one appearance model (DL-183, D15). Four layers resolve field by field, an unset field falling
  through: the look's defaults ("Follow theme": the current look's scheme, face and effects), then the app default
  (Settings > Terminal), then the project default, then the per-tab override, each later layer winning (F3-642). The
  Appearance popover in the terminal's More menu, Settings > Terminal and the per-look defaults read and write this
  one model: the popover writes This terminal (the tab's override) or All terminals (the app default), only Settings
  writes the project default, and the look layer reads the current look from its one store (SSYS-010, DR-056) and
  keeps no copy. The fields are F3-642's, the storage SP-331's (the app default in Settings rows, the project default
  in the Project's Settings, the override inside the terminal tab's saved state) and the Settings rows SSYS-051's; the
  existing terminal appearance rows, code.terminal.theme and code.terminal.font-family among them, bind the app layer
  of this model. There is no fifth layer (a shell profile carries no appearance of its own), and no second terminal
  theme, scheme, font, background or effects store or terminal-local settings key outside the model. Every field
  applies live, and no terminal appearance setting carries a restart badge. The faces are F3-644's and their files
  DR-050's one set. The effects (F3-643) are paint on the terminal's own screen inside this model, not motion voices:
  DR-043's per-family motion voices and its accent rule stand, so the scheme colours the screen and the terminal's
  chrome takes the theme's token roles.
gui_related: true
gui_classification_reason: "Fixes one layered appearance model for every terminal."
split_recommended: false
depends_on: [DL-183]
unblocks: [F3-642, SSYS-051, SP-331]
acceptance_criteria:
  - "The popover, Settings > Terminal and the per-look defaults resolve through one four-layer model field by field, and the popover writes only This terminal or All terminals."
  - "No terminal theme, font, background or effects value is stored outside SP-331's places, and no shell profile carries an appearance of its own."
  - "Every terminal appearance field applies live and no terminal setting shows a restart badge."
  - "Terminal effects stay paint on the terminal's screen; no terminal setting overrides DR-043's motion voices or hard-codes the accent role."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-183"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D15, D16)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md, SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b, section 6 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-terminal-audit.md, SHA-256 12f95fa6f79b1c0a1f9f34b1eee004cac9edacfd8e0a7f4e6495fe1af23aabe3, Appendix 7, E.3.4 and E.5 (worklist)"
preserved_exact_tokens:
  - "Follow theme"
  - "This terminal"
  - "All terminals"
  - "Settings > Terminal"
  - "code.terminal.theme"
  - "code.terminal.font-family"
negative_constraints:
  - "Do not keep a second terminal theme, scheme, font, background or effects store."
  - "Do not mark a terminal appearance setting as needing a restart."
  - "Do not let the popover write the project default."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
  - Plans/storage-plan.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-183, ContractName:Plans/FinalGUISpec.md#F3-642, ContractName:Plans/FinalGUISpec.md#F3-643, ContractName:Plans/FinalGUISpec.md#F3-644, ContractName:Plans/storage-plan.md#SP-331, ContractName:Plans/Settings_System.md#SSYS-051, ContractName:Plans/Settings_System.md#SSYS-010, ContractName:Plans/DRY_Rules.md#DR-043, ContractName:Plans/DRY_Rules.md#DR-050, ContractName:Plans/DRY_Rules.md#DR-056

### DR-069 - No Side Stripes, No Emoji And No Pills Anywhere In Puppet Master

```yaml
plan_unit_id: DR-069
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Puppet Master has one rule against side stripes, emoji and pills, for every surface (DL-184, D22; Jared: "Remember,
  no boxes with side colors, no emojis, no pills are to be used."). No box carries a coloured border or stripe on one
  side, and no inset accent border, inset shadow or pseudo-element stripe stands in for one. No emoji appears in
  Puppet Master's chrome; a program's own output in the terminal may contain emoji. No pill: no fully rounded capsule
  used as a tab, tag, badge, button or status chip; keyboard key caps are the one capsule-like shape allowed.
  Selection is shown by the surface itself: the fused tab silhouette, a filled or tinted row, the NieR square cursor,
  Retro reverse video, never an edge stripe. A status is a mark and a word from its owner's status set (F3-585,
  DL-141; the left rail's F3-619 through DR-057), and a count is a plain number. How the rule looks, and the list of
  retired defaults it replaces, are F3-648's: section 3.5's 3 px left-edge accent stripe and F3-039's token, Appendix
  C's and F3-276's accent left border, F3-469's inset left accent bar, the workgroup pill of section 5.1, and the pill
  skins of F3-422, F3-463, F3-464 and F3-467. The surface statements that came first stay as instances of this one
  rule and do not narrow it: the chat's and Settings' stripe ban (APR-034, F3-534), Settings' status tokens
  (Settings_System section 22), the left rail's rules (DL-162, F3-618, F3-619, DR-057), the decision cards' text
  statuses (DL-036) and the production icon contract with no emoji (FinalGUISpec section 2.6, F3-417); where one of
  them names only the chat, Settings or the rail, this rule covers every other surface as well. A new surface cites
  this rule instead of restating it. The checks are F3-648's and the home certification's (ATS-075).
gui_related: true
gui_classification_reason: "Fixes one shell-wide rule against side stripes, emoji and pills."
split_recommended: false
depends_on: [DL-184, F3-648, DR-057]
unblocks: []
acceptance_criteria:
  - "No surface in any look or NieR Mode draws a box with a coloured border or stripe on one side, a pill, or an emoji in Puppet Master's chrome; keyboard key caps and a terminal program's own output are the only exceptions."
  - "Selection is shown by the selected element's own surface, never by an edge stripe."
  - "The earlier surface statements (APR-034, F3-534, Settings section 22, DL-162, F3-618, F3-619, DR-057, DL-036, F3-417) stay as instances of this rule, and none of them narrows it."
  - "New surfaces cite this rule instead of restating it."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-184"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D22 and Jared's brief)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md, SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8, sections 2.12 and 7.1 (A11, A12) (worklist)"
preserved_exact_tokens:
  - "Remember, no boxes with side colors, no emojis, no pills are to be used."
  - "APR-034"
  - "F3-648"
  - "key caps"
negative_constraints:
  - "Do not draw a coloured border or stripe on one side of a box, a pill-shaped tab, tag, badge, button or status chip, or an emoji in Puppet Master's chrome."
  - "Do not restate this rule per surface or carve a surface out of it."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-184, ContractName:Plans/FinalGUISpec.md#F3-648, ContractName:Plans/FinalGUISpec.md#F3-417, ContractName:Plans/FinalGUISpec.md#F3-534, ContractName:Plans/Settings_System.md, ContractName:Plans/Decision_Log.md#DL-162, ContractName:Plans/Decision_Log.md#DL-036, ContractName:Plans/DRY_Rules.md#DR-057, ContractName:Plans/Automated_Testing_System.md#ATS-075, ContractName:Plans/FinalGUISpec.md#F3-585, ContractName:Plans/Decision_Log.md#DL-141

### DR-070 - One Demo Studio For PMConcept7

```yaml
plan_unit_id: DR-070
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  PMConcept7 has one Demo Studio (DL-185, D26; Jared: "So that should all just be folded into one demo studio(like 5.6
  chat's system)."). Every concept surface's demo controls are sections of it: the Guided Tour's and onboarding's,
  the chat's, the home demos', and later the Orchestrator and Planning Wizard pages'. No surface draws a demo panel,
  demo bar or demo menu of its own, and when the 5.6 Pro chat is ported its demo controls move into the studio
  (ACD-501). The studio and everything in it are lab only, in the pattern ACD-474 set for the chat: never a product
  control, setting, command, wiring row, saved value or test gate, and no canon number comes from a demo control. No
  product catalog (UI_Command_Catalog, settings_inventory, Wiring_Matrix, touch_closure, storage_value_registry,
  Automated_Testing_System) names a demo control. Its presentation is F3-649's, and in the concept it sits above the
  one overlay root (DR-067).
gui_related: true
gui_classification_reason: "Fixes one Demo Studio for every PMConcept7 concept surface and keeps it out of the product."
split_recommended: false
depends_on: [DL-185]
unblocks: [ACD-501]
acceptance_criteria:
  - "Every PMConcept7 surface's demo controls are sections of the one Demo Studio; no surface draws a demo panel of its own."
  - "No command catalog, settings inventory, wiring matrix, touch-closure row, storage registry entry or test gate names a Demo Studio control."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-185"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D26, D27)"
preserved_exact_tokens:
  - "Demo Studio"
  - "So that should all just be folded into one demo studio(like 5.6 chat's system)."
  - "ACD-474"
  - "F3-649"
negative_constraints:
  - "Do not give a demo control a command, setting, wiring row, saved value or test gate."
  - "Do not draw a separate demo panel per surface."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-185, ContractName:Plans/FinalGUISpec.md#F3-649, ContractName:Plans/assistant-chat-design.md#ACD-474, ContractName:Plans/assistant-chat-design.md#ACD-501, ContractName:Plans/DRY_Rules.md#DR-067

### DR-071 - One Opening Module For Everything That Opens In A Panel

```yaml
plan_unit_id: DR-071
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Everything that opens in the home centre goes through one opening module with one placement rule and one placement
  field set (DL-180, D7, D8; Jared: "Files referenced in chat or in the diff panel(or anywhere else in the chat wizards
  stuff) open the same way as the rules you stated for the file tree."). The callers are all of them: the left rail's
  file tree (F-090); file references, diff views, Changes rows and transcript file records in the chat (ACD-500);
  search results; Ctrl+P; the "+" menu and the empty-panel launcher (F3-632); agents; and the terminal's path:line:col
  links and command marks (F3-641). Each passes its request with CV-360's placement fields (where, mode, by and
  background) and gets back the tab it opened or revealed; which panel, the preview tab, kind affinity,
  reveal-if-open and agents' background opens are F3-634's alone. No caller keeps its own routing, target panel,
  dedupe, preview rule or focus rule, and no caller places a tab into a panel by itself. The open commands that
  already exist keep their ids and resolve through the module: cmd.file.open, cmd.nav.open_subject,
  cmd.browser.open_workspace_preview and cmd.terminal.open carry the same placement fields, and cmd.panel_tab.open is
  the module's own (UCC-200); a new tab and a new panel are values of where, never two commands or aliases (DR-041).
  One id is one tab: an open of an id already open anywhere reveals that tab, never opens a second one and never moves
  it, and a kind maps alias ids to one canonical tab id. The module invents no identity: a tab id comes from its
  kind's id rule over the owner's identity (FileManager's file open identity, DR-011; OpenSubject and route_target,
  owned by Contracts_V0, DR-008; terminal_session_id), and the 5.6 Pro chat's way of opening editor documents maps
  onto the module (ACD-500). Placement fields that named a fixed editor panel or group are lineage only (CV-360).
gui_related: true
gui_classification_reason: "Fixes one opening module, one placement rule and one placement field set for every caller."
split_recommended: false
depends_on: [DL-180, F3-634]
unblocks: [UCC-200, F-090, ACD-500]
acceptance_criteria:
  - "Every caller named here opens through the one opening module with CV-360's placement fields; none keeps its own routing, target panel, dedupe, preview or focus rule."
  - "A new tab and a new panel are values of the placement field where, never two commands or aliases."
  - "An open of an id that is already open reveals that tab and opens no second one."
  - "Tab ids come from the kind's id rule over the owner's identity; the module invents no file, subject or session identity."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/FileManager.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D7, D8)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9, section 6 (concept lineage only)"
preserved_exact_tokens:
  - "cmd.file.open"
  - "cmd.nav.open_subject"
  - "cmd.browser.open_workspace_preview"
  - "cmd.terminal.open"
  - "cmd.panel_tab.open"
  - "path:line:col"
  - "CV-360"
  - "F3-634"
negative_constraints:
  - "Do not give any caller its own placement, dedupe, preview or focus rule."
  - "Do not register a second open command or alias for a new tab or a new panel."
  - "Do not open a second tab for an id that is already open."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/Contracts_V0.md#CV-360, ContractName:Plans/FileManager.md#F-090, ContractName:Plans/assistant-chat-design.md#ACD-500, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/DRY_Rules.md#DR-041, ContractName:Plans/DRY_Rules.md#DR-011, ContractName:Plans/DRY_Rules.md#DR-008
