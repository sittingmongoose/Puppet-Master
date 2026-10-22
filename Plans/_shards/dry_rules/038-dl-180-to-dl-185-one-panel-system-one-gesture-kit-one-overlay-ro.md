# Shard 038: DL-180 to DL-185 — One Panel System, One Gesture Kit, One Overlay Root, One Terminal Appearance Model, Shell-Wide Bans, One Demo Studio And One Opening Module (2026-10-09)

Source: `Plans/DRY_Rules.md`

Source lines: L3453-L4264

Source SHA256: `113c2709f6c4c03d931c8963c3f8e8a37dfaadb61013234c3905dbb70e76ea1c`

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
  Every panel in the home centre is drawn from one grammar, whatever tab kinds it holds (DL-180, D5, D6,
  D12). There is one tab strip (FinalGUISpec F3-631, its active tab the seated chip of DL-214, which replaced F3-505's
  contact-aware silhouette; amended 2026-10-17, DL-228) with
  one tab menu, one "+" button and its menu (F3-632), one empty-panel launcher showing that menu's rows
  (F3-632), one "+N" list of the tabs that do not fit (F3-633), one shared header row for every kind that
  needs controls above its content (F3-635), and one keyboard table with one web-client mapping rule
  (F3-635). No tab kind draws its own strip, tab overflow, "+" or menu button, panel menu or header row; a
  kind draws a row of its own only when nothing in the shared header row fits, and that kind's owner unit
  records why. The panel keys are F3-635's alone and no kind redefines one: a kind's own keys work only
  inside its body, and a terminal keeps the shell's keys and gives back the host keys F3-640 lists. A kind
  supplies its content, its registration (label, group, icon, id prefixes, content minimum, its "+" row,
  mount, saved state, close check; F3-635) and its marks through the host; every tab mark that names a
  state comes from the one status set (F3-658, consumed by F3-585), and every kind icon is a bundled SVG
  icon_id (FinalGUISpec section 2.6, F3-417), never an emoji. The dashboard, the terminal and the browser
  are tab kinds of the one panel model (F3-630); none keeps a second panel model, strip, layout record or
  placement rule, so the dashboard's own strip, the terminal's sections, workgroups, sub-tabs and in-tab
  splits, and the editor-only strip and overflow rules are gone (F3-631, F3-633, SMPFS-180). A tab is a
  view of its owner's object, and the panel adds no session, store or service of its own: a browser tab
  shows a session of the Browser owner (DR-037), a terminal tab one terminal session (SMPFS-180), and a
  dashboard tab one widget board hosted through Widget_System (WS-030), never through a new host service
  (DR-038). The chat column is outside this grammar: never a panel and never a tab (F3-637). Hover on
  strip/header controls consumes F3-465's shared small-control marker without card magnet; resize bars
  consume F3-657. DR-072 keeps one owner for each grammar. This rule supersedes the per-surface Home
  owners of the 2026-08-04 Home owner boundary for panel and tab presentation. Amended 2026-10-10
  (DL-187): the Debug Console is one tab whose debug sessions are switched inside it by session sub-tabs
  (D33), the way Output switches its channel inside its one tab: which session shows is view state, never
  a panel tab, never in the strip and never a second tab model, and the row that switches it is the kind's
  own row, recorded by its owner units (F3-635, F3-490). The terminal's sub-tabs stay retired. Terminal
  tabs carry no colour or icon of the person's choosing on the strip (D34): the neon glyph system's redesign is
  F3-658's terminal family, an uncoloured kind glyph lit on hover with state only through the shared mark slot
  (amended 2026-10-17, DL-228; it read: until the neon glyph system redesigns them); every tab keeps its kind's
  bundled icon.
gui_related: true
gui_classification_reason: "Fixes one grammar for every panel and tab in the home centre."
split_recommended: false
depends_on: [DL-180, DL-187, F3-630, F3-631, F3-632, F3-633, F3-635]
unblocks: []
acceptance_criteria:
  - "No tab kind or panel owner defines its own tab strip, tab overflow, \"+\" button, menu button, panel menu or header row, and every kind-specific row is justified in its owner unit."
  - "The dashboard, the terminal and the browser are tab kinds of F3-630's one panel model, with no second panel model, layout record, strip or placement rule."
  - "Every tab state mark comes from the one status set of F3-658 and every kind icon is a bundled SVG icon_id."
  - "One keyboard table and one web-client mapping rule serve every panel; no kind redefines a panel key."
  - "Amended 2026-10-10 (DL-187): the Debug Console's session sub-tabs switch a view inside its one tab and never act as panel tabs; no terminal tab shows a colour or icon of the person's choosing on the strip."
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
- Plans/Decision_Log.md#DL-180
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D1, D5, D6, D9, D12, D24)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md,
  SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9, sections 3, 4, 5 and 9 (concept lineage
  only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md, SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8,
  section 6.3, part 1.7 (worklist)
- /mnt/Cursor/share/puppet-master/2026-10-13-hover-polish-all-looks/NOTES.md, SHA-256 6a86e56a9edc818c4a6c812e484e40c377cf7657180d652457de64ab82fdb12c
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-resize-glow/NOTES.md, SHA-256 0a20256d730c5b51cda138b14845a5dc2e7dfdda04385a3956721a73fb657c16
  (approved campaign source lineage; not native implementation evidence)
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
  - "Do not make a debug session its own panel tab or draw its sub-tabs as a second tab strip."
stale_retired_dispositions:
  - "Amended 2026-10-10 (DL-187): the Debug Console's session sub-tabs (D33) are view state inside its one tab, and terminal tab colours and icons stay off the strip (D34)."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/FinalGUISpec.md

```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Decision_Log.md#DL-187, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/FinalGUISpec.md#F3-631, ContractName:Plans/FinalGUISpec.md#F3-632, ContractName:Plans/FinalGUISpec.md#F3-633, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/FinalGUISpec.md#F3-585, ContractName:Plans/Widget_System.md#WS-030, ContractName:Plans/DRY_Rules.md#DR-072, ContractName:Plans/Decision_Log.md#DL-141

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
  and emits no event; a changed release commits exactly one owner command; an unchanged or invalid release, Escape, a pointer cancel, a lost pointer capture or the window losing focus commits nothing and restores the exact earlier picture; and a failed
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
  Amended 2026-10-10 (DL-186): every dashboard tab's board is a board of the one Usage board engine (WS-030), so the
  board's resolver, gravity, Tidy and previews are one and the same on the Usage page and on every dashboard
  (WS-019): no dashboard keeps a settlement, gravity or resize rule of its own, and one widget gesture at a time
  holds across every board on the page, a gesture started on one board ending any still running on another.
gui_related: true
gui_classification_reason: "Fixes one gesture kit for moving panels, tabs and Usage widgets."
split_recommended: false
depends_on: [DL-180, DL-186, F3-630, F3-503, WS-019]
unblocks: []
acceptance_criteria:
  - "The panel split tree and the Usage widget board run one gesture kit; neither keeps its own pointer controller, preview transaction, keyboard move path or announcement scheme."
  - "No preview dispatches a command, writes storage or emits an event; a changed release commits one owner command and a cancel restores the exact earlier picture."
  - "The snapping widget grid lays out widgets only, and in the home centre only inside dashboard tabs; no panel is placed on widget tracks."
  - "The Home layout record holds no widget command, widget order, widget geometry or Dashboard widget state."
  - "Amended 2026-10-10 (DL-186): gravity, Tidy and the move and resize previews are the same on every dashboard board as on the Usage page, no dashboard keeps its own settlement, and at most one widget gesture runs on the page at a time."
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
  - "Do not keep a second board engine, or a dashboard-only settlement, gravity or resize rule."
stale_retired_dispositions:
  - "Amended 2026-10-10 (lead ruling L13): Lost pointer capture cancels a gesture and restores the earlier picture without a commit."
  - "Amended 2026-10-10 (DL-186): dashboards run the one Usage board engine, so its gravity, Tidy and previews are the same on every board."
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
  D27), except the folded rail's side panel, which opens over the centre from the rail's own slot, drawn and fitted
  by the rail (F3-636, F3-621), above the panels' strips and dividers and below the overlay root. The "+" menu, the "+N" list, tab menus, panel menus, every menu a tab kind opens through the host, drag ghosts
  and landing previews open in that root, and no tab kind appends an overlay layer of its own to the page or the
  window. The order is fixed, bottom to top: panel content, then tab strips and dividers, then the overlay root, which
  sits above the status bar and below the Demo Studio's controls (DR-070), the hover tags and the Guided Tour
  (F3-635). Hover tags belong to the shell's one hover tag controller (FinalGUISpec F3-523) and the Guided Tour to its own owner; neither
  joins the overlay root and neither keeps a second stacking order. When the 5.6 Pro chat is ported (ACD-501, D27),
  its body-portaled popouts (F3-424) and its menus open in the same root and order; the chat keeps no overlay layer
  and no stacking order of its own. A tab body never draws past its own box except through this root, and Escape
  closes only the innermost open thing (F3-568).
  Amended 2026-10-17 (DL-228): above the overlay root the whole window has one order, bottom to top: the
  notification stage and its inbox (F3-447), the setup resume prompt, the Guided Tour and its page note, the
  onboarding window with its scrim and the NieR editor panel inside it, then the look cover and the NieR
  reboot plate and calm cover (F3-077, F3-598), which cover everything. Escape closes only the innermost open
  thing; the numbers are the rebuild's.
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

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Decision_Log.md#DL-185, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/FinalGUISpec.md#F3-424, ContractName:Plans/FinalGUISpec.md#F3-568, ContractName:Plans/assistant-chat-design.md#ACD-501, ContractName:Plans/FinalGUISpec.md#F3-523

### DR-068 - One Terminal Appearance Model

```yaml
plan_unit_id: DR-068
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  The terminal has one appearance model (DL-183, D15). Four layers resolve field by field, an unset
  field falling through: the look's defaults ("Follow look": the current look's scheme, face and
  effects), then the app default (Settings > Terminal), then the project default, then the per-tab
  override, each later layer winning (F3-642). The Customize screen (F3-650) in the terminal's More
  menu, Settings > Terminal and the per-look defaults read and write this one model: the Customize
  screen writes This terminal (the tab's override) or All terminals (the project default, written
  through the same Settings transaction Settings uses over SSYS-051's rows, F3-642), no surface
  writes an app-wide value until q-035 admits an app-wide store (SSYS-002), and the look layer reads
  the current look from its one store (SSYS-010, DR-056) and keeps no copy. The fields are F3-642's,
  the storage SP-331's (the app default in Settings rows, the project default in the Project's
  Settings, the override inside the terminal tab's saved state) and the Settings rows SSYS-051's;
  the existing terminal appearance rows, code.terminal.theme and code.terminal.font-family among
  them, bind the Project layer under SSYS-002. The app-default layer is reserved
  compatibility/default lineage, not an admitted writable app store. There is no fifth layer (a
  shell profile carries no appearance of its own), and no second terminal theme, scheme, font,
  background or effects store or terminal-local settings key outside the model. Every field applies
  live, and no terminal appearance setting carries a restart badge. The faces are F3-644's and their
  files DR-050's one set. The effects (F3-643) are paint on the terminal's own screen inside this
  model, not motion voices: DR-043's per-family motion voices and its accent rule stand, so the
  scheme colours the screen and the terminal's chrome takes the theme's token roles. One code
  colour-scheme catalog and the shared Customize presentation serve the editor and terminal (F3-642,
  F3-650, F3-651). Each curated scheme carries the terminal palette and editor syntax colours. Each
  surface has its own scheme choice, defaulting to "Follow look"; neither surface keeps its own
  scheme list or duplicate Customize implementation. F3-650 alone owns scope entry and preview
  docking for both screens; F3-438 owns the shared selector layout. F3-651 owns editor field
  behavior; SSYS-052 and SSYS-051 own their Project rows. Compatibility concept keys never authorize
  a no-Project write. Each kind’s quick sets resolve from Plans/appearance_quick_sets.json; This and
  All adapt the same exact patch to their existing writers, never maintain their own patch copies.
  Separate editor/terminal field identities remain intact. Plans/terminal_background_catalog.json
  owns design ids/categories/names and compatibility mapping; Customize, Settings and the renderer
  consume it. F3-650's saved preset library is a reusable set of sparse field values, never a fifth
  appearance layer; SP-331 owns its computer-local custody and the existing scope writers alone
  apply it. The extended bezel/background fields use the existing one model and shared
  reset/quick-set registry.
  Amended 2026-10-17 (DL-228): each field's choice words and help text have one owner, its inventory row
  (F3-441), which Settings and the Customize screens both read. The concept's Customize words that differ
  (Fill, Fit, Tile, Centre for Picture Fit; Still for Off in Background Motion; the materials' "plastic";
  "Less colour"; "Grain"; "Text drawing") were adopted in F3-441's wording pass (2026-10-17, DL-230, Jared) as
  those rows' labels and option_labels, and its Bell help's "flash" is stale: Bell is Follow look or Off
  (DL-213, DL-216).
gui_related: true
gui_classification_reason: "Fixes one layered appearance model for every terminal."
split_recommended: false
depends_on: [DL-183]
unblocks: [F3-642, SSYS-051, SP-331]
acceptance_criteria:
- Customize, Settings > Terminal and the per-look defaults resolve through one four-layer model field by field,
  and the Customize screen writes only This terminal or All terminals.
- No terminal theme, font, background or effects value is stored outside SP-331's places, and no shell profile
  carries an appearance of its own.
- Every terminal appearance field applies live and no terminal setting shows a restart badge.
- Terminal effects stay paint on the terminal's screen; no terminal setting overrides DR-043's motion voices
  or hard-codes the accent role.
- The editor and terminal read one catalog and use one Customize component (F3-650); neither has its own scheme
  list or Customize implementation.
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
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md,
  SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-2.md,
  SHA-256 1eecc96b03a1a774f52d06420c913553d5f5d1917e1bd5705e2f6e0bbc11fad6 (D30)
- Plans/Decision_Log.md#DL-183
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D15, D16)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md,
  SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b, section 6 (concept lineage
  only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-terminal-audit.md, SHA-256
  12f95fa6f79b1c0a1f9f34b1eee004cac9edacfd8e0a7f4e6495fe1af23aabe3, Appendix 7, E.3.4 and E.5 (worklist)
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round3--LANDING.md,
  SHA-256 4d6556ff98168f22719c5d401c4e677d5d380d2ef370b67a838cb3aa45301c2d (source lineage; not native
  certification)
preserved_exact_tokens:
  - "Follow look"
  - "This terminal"
  - "All terminals"
  - "Settings > Terminal"
  - "code.terminal.theme"
  - "code.terminal.font-family"
negative_constraints:
- Do not keep a second terminal theme, scheme, font, background or effects store.
- Do not mark a terminal appearance setting as needing a restart.
- Do not let the Customize screen or any other surface write an app-wide terminal appearance value until q-035
  admits an app-wide store.
stale_retired_dispositions:
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Uses Follow look for editor and terminal appearance defaults."
  - "Amended 2026-10-10 (lead ruling L16): The popover's All terminals writes the project default through the Settings transaction (F3-642, SSYS-051), replacing the app default and the rule that only Settings writes the project default; no surface writes an app-wide value until q-035."
  - "Amended 2026-10-10 (D30, DL-183): Shares the code colour-scheme catalog and Appearance popover with the editor and terminal."
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
  Puppet Master has one rule against side stripes, emoji and pills, for every surface (DL-184, D22; Jared:
  "Remember, no boxes with side colors, no emojis, no pills are to be used."). No box carries a coloured border
  or stripe on one side, and no inset accent border, inset shadow or pseudo-element stripe stands in for one. No
  emoji appears in Puppet Master's chrome; a program's own output in the terminal may contain emoji. No
  pill-shaped label: status chips, tags, suggestion chips and state badges cannot be fully rounded capsules.
  Pill-shaped action buttons, including Install, Sign in and the rounded Friendly and Glass actions, are
  allowed; keyboard key caps and non-label progress marks are not labels. Joined selectors and tabs retain their
  own specified geometry. Selection is shown by the surface itself: the seated tab chip (F3-631, DL-214; amended 2026-10-17, DL-228, it
  read: the fused tab silhouette), a filled or tinted row, the NieR square cursor, Retro reverse video, never an edge stripe. A status is a mark and a word from the
  shared F3-658 set consumed by F3-585 and F3-619 through DR-057, and a count is a plain number. How the rule
  looks, and the list of retired defaults it replaces, are F3-648's: section 3.5's 3 px left-edge accent stripe
  and F3-039's token, Appendix C's and F3-276's accent left border, F3-469's inset left accent bar, the
  workgroup pill of section 5.1, and the pill skins of F3-422, F3-463, F3-464 and F3-467. The surface statements
  that came first stay as instances of this one rule and do not narrow it: the chat's and Settings' stripe ban
  (APR-034, F3-534), Settings' status tokens (Settings_System section 22), the left rail's rules (DL-162,
  F3-618, F3-619, DR-057), the decision cards' text statuses (DL-036) and the production icon contract with no
  emoji (FinalGUISpec section 2.6, F3-417); where one of them names only the chat, Settings or the rail, this
  rule covers every other surface as well. A new surface cites this rule instead of restating it. The checks are
  F3-648's and the home certification's (ATS-075). A chosen option is filled on its own box, never underlined.
  Debug Console sub-tabs and every segmented toggle use each look's neutral selection fill in Friendly, Glass
  and Basic, never an accent; Glass adds its 1 px rim on the top edge of the filled box, Retro keeps reverse
  video and NieR its ink block (F3-490).
gui_related: true
gui_classification_reason: "Fixes one shell-wide rule against side stripes, emoji and pills."
split_recommended: false
depends_on: [DL-184, F3-648, DR-057]
unblocks: []
acceptance_criteria:
- The label-pill detector and side-border detector follow F3-648, with its explicit action-button, key-cap, switch-key,
  non-label-mark and structural-rail exemptions; no emoji appears in chrome.
- Selection is shown by the selected element's own surface, never by an edge stripe.
- The earlier surface statements (APR-034, F3-534, Settings section 22, DL-162, F3-618, F3-619, DR-057, DL-036, F3-417)
  stay as instances of this rule, and none of them narrows it.
- New surfaces cite this rule instead of restating it.
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
- Plans/Decision_Log.md#DL-184
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D22 and Jared's brief)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md, SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8,
  sections 2.12 and 7.1 (A11, A12) (worklist)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-CONTRACT-2926ad987e.md,
  SHA-256 c579d0dfef41fd1fc7327d14c2adb9e2b101c24b216ff64a9db5fc19895ad989 (small-round concept lineage only)
- /mnt/Cursor/share/puppet-master/2026-10-11-onboarding-no-pills/README.md, SHA-256 1ab0aedc5910ab03097439cf9cd48da77eb7cefad458ca705a556727d327fd1a
  (approved campaign source lineage; not native implementation evidence)
preserved_exact_tokens:
  - "Remember, no boxes with side colors, no emojis, no pills are to be used."
  - "APR-034"
  - "F3-648"
  - "key caps"
negative_constraints:
- Do not draw a coloured border or stripe on one side of a box, a pill-shaped label, tag, suggestion chip or state
  badge, or an emoji in Puppet Master's chrome.
- Do not restate this rule per surface or carve a surface out of it.
stale_retired_dispositions:
- 'Amended 2026-10-11 (lead ruling 2026-10-11, D29): A chosen option uses its own filled box and never an underline.'
- 'Amended 2026-10-14: Jared''s 2026-10-11 clarification limits the capsule ban to labels and explicitly allows pill
  action buttons; it is not a blanket ban on rounded controls.'
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

### DR-073 - One Wallpaper Catalog And One Writer

```yaml
plan_unit_id: DR-073
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  One wallpaper registry supplies stable ids, family/order, names, dark/light assets, thumbnails and
  defaults to every wallpaper consumer. Plans/wallpaper_catalog.json is that registry; F3-653 owns
  presentation, SSYS-054 owns the single Project choice and SP-333 owns storage. No theme, Settings
  gallery, onboarding or native renderer keeps a competing list or default. Picking through any
  surface uses the Settings transaction, never a wallpaper-specific settings store or duplicate
  command. The terminal Lens consumes the same selected print and catalog as Glass; it never derives
  another wallpaper from computed page styling or stores a second choice. The six NieR prints derive
  from the original scene drawings, while their native packaged assets are registered here.
  Amended 2026-10-16 (DL-217, the motion lanes): every consumer of the selected print, the terminal Lens
  and Glass's optics included, asks the one wallpaper owner for it through a synchronous, cache-only query
  by print id and mode. The query answers the print's prepared source, not cached yet, or no image, and it
  reads no page style. A consumer told not cached yet keeps its fallback until the owner announces the
  print, and a watch on the selected print never forces a style recalculation. In the concept this is
  PM_WALLPAPERS.sourceUrl(id, mode), returning a URL, undefined or null.
  Amended 2026-10-16 (DL-217, the Settings and Glass lanes): the owner prepares a print and its frost
  before the choice is published, and fills the source query's cache first. Preparing nearby and visible choices ahead of a pick runs at idle, one job at a time, pauses for input,
  Settings navigation and the shared busy signal, and never delays a pick; hover or keyboard focus
  prepares the intended tile after a short quiet pause, and a press requests it at once, still behind
  those guards. A cancelled or stale preparation changes nothing on screen and only the newest pick
  commits; a pick whose preparation fails still commits through the ordinary print and frost fallback, so
  no pick is lost. Glass alone keeps the decoded prints, the visible gallery choices among them within a
  bounded budget, and a byte-bounded frost cache; the gallery keeps no image cache of its own.
  Amended 2026-10-17 (DL-222, DL-223): preparing prints at idle follows ACD-475 and does not restate
  that rule. The owner prepares a print and its frost before the choice commits. The print may start
  fading before the frost is ready (F3-653); the setting still writes at the pick. An intent, hover or
  keyboard focus after a short quiet pause, or a press, never waits behind background preparation of
  another print. A pick or intent for a print runs whatever preparation is left at once (review r1).
  This unit still owns the cache-only query and the rule
  that a failed preparation still commits.
  Amended 2026-10-17 (DL-228): the requirement is one synchronous, cache-only print query; the concept's
  page API for it is lineage, not an interface the rebuild keeps. A wallpaper joins the
  catalog only with a Dark and a Light print, each composed with a quiet middle and its detail toward the
  edges (opaque looks cover the middle with panels and Glass frosts what sits behind a sheet) and drawn at the
  contrast its mode's text needs; its thumbnails are made from the same print, and the gallery never decodes a
  full print. Byte and pixel budgets are the packager's.
gui_related: true
gui_classification_reason: One wallpaper catalog and one writer.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Every wallpaper id/default/asset resolves from the registry and every committed choice uses the same Project transaction.
- A consumer references the owner and cannot silently add a private wallpaper or background mode.
- The selected print reaches every consumer through the owner's one synchronous, cache-only query (its
  source, not cached yet, or no image); no consumer or wallpaper watch reads page styles to find it.
- Preparing a print at idle follows ACD-475. An intent never waits behind another print's background
  preparation, a pick runs the remaining bake at once, and the print may fade before its frost commits
  (F3-653).
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: one_wallpaper_catalog_and_one_writer
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-13-wallpapers/OWNER-PROPOSAL.md, SHA-256 07778e16e4bc6082aa1d56435a826692662718069ceaaa2f20e37ae56984ba2d
  (approved campaign source lineage; not native implementation evidence)
- Plans/FinalGUISpec.md#F3-653
- Plans/Settings_System.md#SSYS-054
- Plans/storage-plan.md#SP-333
- Plans/FinalGUISpec.md#F3-650
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/Concepts--wallpapers--opus-5.5--CONTRACT.md,
  SHA-256 6550b3e5d31dbeca5e9d5cf11f7c06db13f37e189da270ac25e6504a5ec4a3da (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round3--CANON-PROPOSALS.md,
  SHA-256 4a4b91f257467e76ec6d43e37a04a81cf5f9dee515242177f0d08db04483700d (source lineage; not native
  certification)
- '/mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/Concepts--home-redesign--src--terminal--js--44-grounds-glass.js,
  SHA-256 029716017b916a8c93c6817a458ba7d17c56dae295462655c31bb69dfe2c2392 (main 89d1a6c057, the terminal
  lane: the consumer of the wallpaper source query; source lineage; not native certification)'
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-motion-fixes--LANDING-REVIEW.md,
  SHA-256 b1ca802f406fa585b3be8d1096e8aefada4bac0c94ef81a3ee93f3be3611918e (cross-lane contract check;
  source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/d02f2ac26b--Concepts--wallpapers--opus-5.5--CONTRACT.md, SHA-256
  1687dac3d7dc7905598780595e7df743255edaf6619f038c97d5bfcaa043d544 (Settings lane head d02f2ac26b, landed unchanged on main
  a0f844455c (L1), wallpaper preparation and source cache; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/BRIEF.md,
  SHA-256 a6c5152164942a26cba5b0216a339578ee13c47a3ba39ffbeced793203c2dece (idle preparation is one rule;
  decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-motion-fixes/pm7-liquid-glass/F6-NOTES.md,
  SHA-256 86b0f12a17d3eab6becf2410e1c5950a6c619066c8a6d683ba57328a9fef7899 (fade-first, option (c);
  decision lineage)
preserved_exact_tokens: []
negative_constraints: []
stale_retired_dispositions:
- 'Amended 2026-10-17 (DL-223): the print may fade before the frost is ready, and the choice commits
  when the frost follows. It read: the owner prepares a print and its frost before the choice is
  published.'
owner_hints:
- Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-653, ContractName:Plans/Settings_System.md#SSYS-054, ContractName:Plans/storage-plan.md#SP-333, ContractName:Plans/FinalGUISpec.md#F3-650

### DR-074 - One Owner For The Board Commit Shape And For Hosted Settings Controls

```yaml
plan_unit_id: DR-074
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Added 2026-10-17 (DL-228). Two rules are restated in many owners and have drifted. Widget_System WS-019
  alone owns how a board commits: gravity inside the one move, resize, add or remove that caused it, and Tidy as
  one cmd.widget.move with its arrange field, one receipt, the repack computed by the owner. Settings_System
  SSYS-044 owns which surface may host which row, the bound value and the preview-then-apply transaction;
  Multi-Account MA-073 owns the switch and warning hold rules, and SSYS-044 consumes them (review r1).
  usage-feature UF-092, UF-093 and UF-107, UI_Command_Catalog UCC-147, UI_Wiring_Rules UIW-012, Wiring_Matrix
  WM-043 and WM-045, Commands_System CS-067 and FinalGUISpec F3-514, F3-515 and F3-628 consume them; where a consumer's wording differs from its owner, the
  owner wins, and a later edit cites the owner by id instead of restating it.
gui_related: true
gui_classification_reason: One owner for the board commit shape and for hosted Settings controls.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- A board commit or a hosted Settings control is judged by WS-019 or SSYS-044, and a switch or warning hold by MA-073; a differing consumer sentence does not create a second rule.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: board_commit_and_hosted_controls_owners
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Widget_System.md#WS-019
- Plans/Settings_System.md#SSYS-044
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/SWEEP-WEEK-OPUS-B.md, SHA-256
  a74054b4fea13526b56a1e0a395b6ad434d62828bb407cd1a79b228e8f2ef144 (OB-47, OB-48, OB-30; source lineage)
preserved_exact_tokens: []
negative_constraints:
- "Do not restate the board commit shape or the hosted-control rule in a consumer; cite WS-019 or SSYS-044."
owner_hints:
- Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/Widget_System.md#WS-019, ContractName:Plans/Settings_System.md#SSYS-044


### DR-075 - The Hosted Chat Reuses The Host And The Settings Writer

```yaml
plan_unit_id: DR-075
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  The hosted chat uses one owner for each shared behavior (DL-232). Opening, placement, deduplication,
  preview, focus and tab chrome are the universal panels' F3-634 and F3-635, never a second chat
  opener. Look, fonts, NieR parts, first-paint appearance, hover tags and overlay stacking are the
  app's existing owners (DR-050, DR-054, DR-056, DR-067, DR-072); the hosted chat neither loads its
  standalone first-paint theme reader nor owns a theme, scene, ground layer or reboot moment. A chat
  settings sheet and the Settings page edit the same admitted setting through the same Settings
  transaction; copying a value to a concept renderer is a projection, not another source of truth. The
  application/project ELI5 default and the active chat's override remain separate. The History default
  is a starting value only; History pin, chat width and Keep open remain layout view state, and an
  Activity unpin remains temporary. Recipe selectors, arbitrary family takes, motion-voice overrides
  and guided examples belong only to the concept's one Demo Studio (DR-070). The port's class names,
  DOM roots, JavaScript globals, localStorage keys and build-layer APIs are concept lineage and grant
  no native API or persistence authority.
gui_related: true
gui_classification_reason: Defines the hosted chat port and its visible controls or their shared ownership.
split_recommended: false
depends_on: [DL-232, DR-050, DR-054, DR-067, DR-070, DR-072, SSYS-050]
unblocks: []
acceptance_criteria:
  - "Changing an admitted preference through either visible surface updates one Settings value and both consumers without a feedback loop."
  - "No hosted theme store, second tab-placement rule, second hover tag system or second Demo Studio is introduced."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: hosted_chat_owner_drift
reasoning_tier: high
context_scope: chat56_pmconcept7_port
implementation_surfaces:
  - "Plans/DRY_Rules.md"
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-185"
  - "/mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D3, D4, D7, D8, D9, D26, D27, D28)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/CONTRACT.md, SHA-256 10adf449002887257c2a95eb97bf25d923e68a1650264622b6461e954f87389b (concept integration lineage, not native API authority)"
preserved_exact_tokens:
  - "Demo Studio"
  - "Keep open"
negative_constraints:
  - "Do not promote localStorage keys or bridge globals into product contracts."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - "Plans/DRY_Rules.md"
```

ContractRef: ContractName:Plans/Settings_System.md#SSYS-055, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/assistant-chat-design.md#ACD-501
