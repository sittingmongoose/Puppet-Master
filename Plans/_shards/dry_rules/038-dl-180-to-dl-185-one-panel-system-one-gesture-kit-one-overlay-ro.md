# Shard 038: DL-180 to DL-185 — One Panel System, One Gesture Kit, One Overlay Root, One Terminal Appearance Model, Shell-Wide Bans, One Demo Studio And One Opening Module (2026-10-09)

Source: `Plans/DRY_Rules.md`

Source lines: L3492-L4710

Source SHA256: `ab462d8dfe2c0862859d57604e3853b18856b465034217045db575b261f78b39`

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
  D27), except the folded rail's side panel, which opens over the centre from the rail's own slot, drawn and
  fitted by the rail (F3-636, F3-621), above the panels' strips and dividers and below the overlay root. The "+"
  menu, the "+N" list, tab menus, panel menus, every menu a tab kind opens through the host, drag ghosts and
  landing previews open in that root, and no tab kind appends an overlay layer of its own to the page or the
  window. The order is fixed, bottom to top: panel content, then tab strips and dividers, then the overlay root,
  which sits above the status bar and below the Demo Studio's controls (DR-070), the hover tags and the Guided
  Tour (F3-635). Hover tags belong to the shell's one hover tag controller (FinalGUISpec F3-523) and the Guided
  Tour to its own owner; neither joins the overlay root and neither keeps a second stacking order. When the 5.6
  Pro chat is ported (ACD-501, D27), its body-portaled popouts (F3-424) and its menus open in the same root and
  order; the chat keeps no overlay layer and no stacking order of its own. A tab body never draws past its own
  box except through this root, and Escape closes only the innermost open thing (F3-568). Amended 2026-10-17
  (DL-228): above the overlay root the whole window has one order, bottom to top: the notification stage and its
  inbox (F3-447), the setup resume prompt, the Guided Tour and its page note, the onboarding window with its
  scrim and the NieR editor panel inside it, then the look cover and the NieR reboot plate and calm cover
  (F3-077, F3-598), which cover everything. Escape closes only the innermost open thing; the numbers are the
  rebuild's. Amended 2026-10-29 (PC1, D6/D10, G9; PM7): Work panel/quit dialog/pop-out view and sheet Pip
  lift-off use this overlay owner; teardown releases copies/timers. All floating Glass
  Activity/History/attachment surfaces use the persona/model menu plate token, not new plates. QA round 2, Jared
  2026-10-30; DL-258; GUI 7d586bad18: H5: the onboarding owner holds one original inert-state basis for the
  entire open lifetime. Replacing an already-open screen acquires only newly encountered background nodes; it
  never re-snapshots nodes already held by that modal as originally inert. Every close/finish/skip path removes
  only the modal’s own holds, preserves pre-existing inert nodes and restores focus/input. H1: explicit lab
  open({screen}) invokes the screen owner’s seed(S), filling only missing fixture prerequisites; seed:false opts
  out. Connect/NAS/online fixtures have coherent identities, trust/key/source/sign-in examples. Seeds and
  seedCommit are lab-only: no native Project receipt, authentication, permission or completed owner work is
  inferred, no selected live input is overwritten, and no new product action/DTO field is admitted.
gui_related: true
gui_classification_reason: "Fixes one overlay root and one stacking order for the home centre and the ported chat."
split_recommended: false
depends_on: [DL-180, DL-185, F3-635]
unblocks: [F3-640, ACD-501]
acceptance_criteria:
  - "Every menu, list, drag ghost and landing preview over the home centre opens in the one overlay root."
  - "No tab kind and, after the port, no part of the 5.6 Pro chat appends its own overlay layer or keeps its own stacking order."
  - "The order is panel content, then strips and dividers, then the overlay root above the status bar, with the Demo Studio's controls, hover tags and the Guided Tour above it."
  - "QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: H5: the onboarding owner holds one original inert-state basis for the entire open lifetime. Replacing an already-open screen acquires only newly encountered background nodes; it never re-snapshots nodes already held by that modal as originally inert. Every close/finish/skip path removes only the modal’s own holds, preserves pre-existing inert nodes and restores focus/input. H1: explicit lab open({screen}) invokes the screen owner’s seed(S), filling only missing fixture prerequisites; seed:false opts out. Connect/NAS/online fixtures have coherent identities, trust/key/source/sign-in examples. Seeds and seedCommit are lab-only: no native Project receipt, authentication, permission or completed owner work is inferred, no selected live input is overwritten, and no new product action/DTO field is admitted."
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
  PMConcept7 has one Demo Studio (DL-185, D26; Jared: "So that should all just be folded into one demo
  studio(like 5.6 chat's system)."). Every concept surface's demo controls are sections of it: the Guided Tour's
  and onboarding's, the chat's, the home demos', and later the Orchestrator and Planning Wizard pages'. No
  surface draws a demo panel, demo bar or demo menu of its own, and when the 5.6 Pro chat is ported its demo
  controls move into the studio (ACD-501). The studio and everything in it are lab only, in the pattern ACD-474
  set for the chat: never a product control, setting, command, wiring row, saved value or test gate, and no
  canon number comes from a demo control. No product catalog (UI_Command_Catalog, settings_inventory,
  Wiring_Matrix, touch_closure, storage_value_registry, Automated_Testing_System) names a demo control. Its
  presentation is F3-649's, and in the concept it sits above the one overlay root (DR-067). W8 review D-1,
  lead-accepted PM7 Step4, 2026-10-30: the one named temporary DR-070 exception is 5.6
  Pro/pm7-port/js/50-demo-bridge.js, inherited from main since 2026-10-22. Its lab bridge presses a hidden
  .demo-dialog .demo-trigger so PM56_EXT.action/app.js and the recorded-example/reset chains all run. This is
  tracked DOM-coupling debt, not permission for other synthetic clicks, hidden controls or product dispatch.
  Retirement requires the chat owner to expose one PM56_APP dispatcher taking (action, dataset, {demo:true}) for
  both real clicks and the bridge; migrate every recorded example/reset chain, prove equivalent behavior, then
  delete the hidden host/button and close this named exception. PM56_DEMO.trigger/reset alone do not run all
  chains and are not a substitute. QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: H1/H5/H7/Q19: one lab
  Studio opens seeded owner screens and steps aside when launching a panel, chat view, Stop all or Quit.
  Recorded guides name the actual current control, including Schedule for …, and advance only after that
  control’s real example boundary. The teach-missed example owns its intended Send and finishes its recorded
  correction through the normal reply boundary; it does not simulate a native model promise. Natural user
  choices may remain waiting, and finished examples need not be forced into an artificial Done label. Keep
  DR-070’s existing named hidden-bridge debt unchanged; no additional synthetic click, demo product command,
  preference, persisted field or production wiring is authorized.
gui_related: true
gui_classification_reason: "Fixes one Demo Studio for every PMConcept7 concept surface and keeps it out of the product."
split_recommended: false
depends_on: [DL-185]
unblocks: [ACD-501]
acceptance_criteria:
  - "Every PMConcept7 surface's demo controls are sections of the one Demo Studio; no surface draws a demo panel of its own."
  - "No command catalog, settings inventory, wiring matrix, touch-closure row, storage registry entry or test gate names a Demo Studio control."
  - "QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: H1/H5/H7/Q19: one lab Studio opens seeded owner screens and steps aside when launching a panel, chat view, Stop all or Quit. Recorded guides name the actual current control, including Schedule for …, and advance only after that control’s real example boundary. The teach-missed example owns its intended Send and finishes its recorded correction through the normal reply boundary; it does not simulate a native model promise. Natural user choices may remain waiting, and finished examples need not be forced into an artificial Done label. Keep DR-070’s existing named hidden-bridge debt unchanged; no additional synthetic click, demo product command, preference, persisted field or production wiring is authorized."
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
  is a starting value only; History pin, chat width and Keep open remain layout view state, and Activity Detail opens full size until closed (G1/G2). Recipe selectors, arbitrary family takes, motion-voice overrides
  and guided examples belong only to the concept's one Demo Studio (DR-070). The port's class names,
  DOM roots, JavaScript globals, localStorage keys and build-layer APIs are concept lineage and grant
  no native API or persistence authority. Integrated concept 59ca2d4382 is assembled from the
  standalone chat's own module list by pm7-port/tools/chat56_layer.py at opus build step 6b; the port
  does not maintain a second conversation implementation. Its column layer is
  div.pm56-frame.pmw-scope#pmw-chat56 containing div.pm56-host#pmRoot inside #chatPanel. Its scoped
  overlays and effects mount in body > div#pm56-layers.pmw-scope under the host stacking order.
  This actual wrapper is a concept mounting boundary, not evidence of the product's single overlay
  root acceptance. Chat CSS is scoped under .pm56-host; column and tab width queries use pm56col and
  pm56tab containers while app sheets and menus keep window queries. The remaining window-based
  isPhone helper means full container-based behavior is not yet demonstrated. The hosted build drops
  the chat's first-paint reader, theme picker and NieR scripts and follows the host's existing look
  and NieR controllers. SSYS-055 records the project-only adapter and session-only ELI5 limit rather
  than treating every concept control as a persistent application setting.
  Amended 2026-10-29 (G1–G3, S1–S9; PM7): Jared G1 B (2026-10-30) restores the view-local Pin/unpin lifetime
  contract: pinned detail stays open and follows the new thread across switches, while unpinned detail closes
  on a switch; only the small view is retired. History pin remains local layout state. Pip parts read the same
  Project row/transaction in every host, never pip-chat:v1 or a second option registry.
gui_related: true
gui_classification_reason: Keeps shared host presentation and Settings control ownership single.
split_recommended: false
depends_on: [DL-232, DR-050, DR-054, DR-056, DR-067, DR-070, DR-072, SSYS-050]
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
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/handoff/plans-sources/integrated-behavior-59ca2d4382.md, SHA-256 108510ec4a80a24dc8a3fe05d7c45ebb7632934cd5b36bfd4edb3f01f833c649 (lead integration brief, corroborated against concept source; not native or final visual verification)"
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


### DR-076 - One Brand Mark And One Pip Kit

```yaml
plan_unit_id: DR-076
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  X1/X3, A1–A5, O1/O8, PC1–PC5, S1/S9: one kit owns Pip geometry, string solver, faces, role props, token
  colours and shared styles for static brand/release assets/tray/notifications, loader, onboarding and the
  single chat-agent primitive. Robot is only category art. No per-surface renderer/palette, legacy puppet
  fallback, random drawing IDs or switchable brand/loader. Pip parts is one registry/editor/Settings row,
  not a shadow store. Declarative static base remains meaningful without animation. NieR Pip shows eyes
  through the band on live and static marks, including title bar, app icon and tray, at every size (X3 B,
  Jared 2026-10-30).
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on:
- DL-235
- DR-044
- DR-051
unblocks: []
acceptance_criteria:
- A drawing-source audit finds one Pip kit/solver/palette owner and no legacy puppet/monogram fallback.
- Brand, tray, release assets, onboarding and agents share tokens/geometry/static base at consistent logical
  tiers across DPR.
- Pip parts exclude brand/loader/notifications and every individual agent remains the same primitive.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/Icon-Concepts/Opus5.5icon/README.md
- Concepts/onboarding/opus-5.5-pip/README.md
- Concepts/chat-assistant-concepts/opus-5.5-pip/README.md
- "/mnt/Cursor/share/puppet-master/2026-10-29-pm7-build-decisions/README.md — Jared's answers (2026-10-30)"
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-235, ContractName:Plans/DRY_Rules.md#DR-044, ContractName:Plans/DRY_Rules.md#DR-051




### DR-077 - One Loading Indicator

```yaml
plan_unit_id: DR-077
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  L1–L8, X2: one F3-662 loader owner/opt-in/class contract and clock supplies every indeterminate wait with
  contextual Swing/Think/Hop, per-family timing, size/accessibility and pause gates. Preserve layout skeletons
  and determinate bars; working status remains st-working. NieR routes to its Diamond owner/fallback. No surface
  spinner, loader-setting or duplicate thinking/Orbit Pip. L8 B (Jared 2026-10-30): this build removes
  menu-sprout duplication. DR-079 is the one sprout owner for every menu; chat menus.js, Usage PMU.menu and Home
  PMW.menu delegate to it with no private animation implementation. Q11 B, Jared 2026-10-30: only live Work rows
  animate, capped to rows on screen. Working, checking and retrying agents use the shared Think loader; running
  process marks move on the shared document clock. Waiting, waiting-dep, blocked, finished/done, stopped and
  scheduled rows stay still. Offscreen rows, drags, hidden tabs and effective Reduced Motion hold recognizable
  rest poses. The panel, Agents rail and Home board consume the same row renderer and eligibility policy. Lead
  clarification 1030183348-18bd permits no NieR exemption: a working NieR agent uses its existing Diamond loader
  owner and L7 part/fallback rules, never animated Pip; running NieR process marks move in their existing
  material language. The 2200 ms category-head breath remains distinct and below needs-you priority. No polling
  loop, command, event, setting, state or extra loader owner is added.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on:
- DL-237
- DR-043
- SSYS-010
unblocks: []
acceptance_criteria:
  - "Every loader consumer opts into one owner/class/clock rather than implementing a spinner."
  - "Skeletons, measured bars and status marks retain their own contracts, including NieR routing."
  - "Family periods, size gate, accessibility and hidden/drag/Reduced Motion behavior agree across all consumers."
  - "Q11: working/checking/retrying rows animate in all ten looks; waiting/dependency/blocked/finished/stopped/scheduled rows stay still; offscreen, drag, hidden-tab and Reduced Motion gates hold."
  - "Q11: the working-agent loader uses the one Think owner, with NieR Diamond/fallback rather than animated Pip; process marks reuse their own status rhythm/clock."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/Icon-Concepts/Opus5.5icon/README.md
- "/mnt/Cursor/share/puppet-master/2026-10-29-pm7-build-decisions/README.md — Jared's answers (2026-10-30)"
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-237, ContractName:Plans/DRY_Rules.md#DR-043, ContractName:Plans/Settings_System.md#SSYS-010




### DR-078 - One Work Projection And Resource Owner

```yaml
plan_unit_id: DR-078
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  D2/D5–D14, G4/G7: thread Processes, status items/panel, Agents rail, Home Agents board, tray/project badge and
  composer attention are filtered OperationalAwareness over ObservableWork and registry lineage. No consumer
  owns a separate list/count/status/needs-you set. Executor/terminal owns subordinate ProcessFacts; host monitor
  owns server/environment resource samples while Resources is open only. Actions route to one owner
  command/handler; services are read-only and stop lists are generation-bound. D7, PM7 Step4 final-source
  alignment, 2026-10-30 (integration e9b15abc64): PM7_WORK_UI.list(host, options), agentGroup and agentSummary
  in src/js/48-work.js are the shared row/filter/summary adapters. The rail #panel-agents [data-work-rail] keeps
  its four shelves (Needs you, Active with lineage, Queued, Recently completed); Home dashboard:agents in
  30-dashboard.js keeps its frame/filter. Both read PM_WORK and the same needs-you set; no AGENTS fixture array,
  private clock or parallel transcript opener remains. list refreshes on change, patchTicks updates
  times/progress/output, hidden lists catch up on show, and destroy removes subscriptions/observers. Rail uses
  spelled-out ages; Home keeps its short time form. These source adapters demonstrate the projection boundary
  without certifying native runtime. Q11 B, Jared 2026-10-30: only live Work rows animate, capped to rows on
  screen. Working, checking and retrying agents use the shared Think loader; running process marks move on the
  shared document clock. Waiting, waiting-dep, blocked, finished/done, stopped and scheduled rows stay still.
  Offscreen rows, drags, hidden tabs and effective Reduced Motion hold recognizable rest poses. The panel,
  Agents rail and Home board consume the same row renderer and eligibility policy. Lead clarification
  1030183348-18bd permits no NieR exemption: a working NieR agent uses its existing Diamond loader owner and L7
  part/fallback rules, never animated Pip; running NieR process marks move in their existing material language.
  The 2200 ms category-head breath remains distinct and below needs-you priority. No polling loop, command,
  event, setting, state or extra loader owner is added. QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18:
  Q12 amends G4: every Project’s Resources includes This computer and Puppet Master’s own services, which are
  shared and belong to no individual Project, alongside that Project’s own servers. An empty Project says that
  nothing in this Project is running, above the shared rows; it does not look empty or report another Project’s
  work as its own. Shared machines show only environments with running work. Metadata/freshness is available on
  tab entry; the existing visible-only 2 s sampling owner remains. Permission, exact host/environment identity
  and stale disclosure remain authoritative; shared read scope creates no Stop/Restart/Stop all or
  service-control authority. Q13/CC5: the PM_WORK dock provider gives a live process and the next pending
  scheduled run a 60000 ms presentation lifetime from first exposure in that thread’s dock projection. Key
  freshness by thread, work identity and run start/occurrence time; repaint or returning to the same run does
  not restart it, while a restarted/new occurrence gets a new lifetime. At elapsed >=60000 the non-needs line
  leaves. Needs-you lines bypass expiry and remain until the owning question/input is answered. One next-expiry
  timer requests a redraw; it owns no work, schedule or persisted state and expiry never stops/cancels/deletes
  work. Existing dock priority, at-most-three budget and transcript visibility gates remain; full work remains
  reachable through Activity and the panel.
gui_related: false
gui_classification_reason: Defines owner authority, record semantics or lifecycle.
split_recommended: false
depends_on:
- DL-246
- SIR-054
unblocks: []
acceptance_criteria:
  - "Counts, rows, freshness and attention agree across thread/status/panel/rail/board/tray/composer filters."
  - "ProcessFacts and resource samples resolve their sole Executor/terminal/host owner with stable identity."
  - "No surface-private runtime list/stop handler or system-service mutation is introduced."
  - "Q11: working/checking/retrying rows animate in all ten looks; waiting/dependency/blocked/finished/stopped/scheduled rows stay still; offscreen, drag, hidden-tab and Reduced Motion gates hold."
  - "Q11: the working-agent loader uses the one Think owner, with NieR Diamond/fallback rather than animated Pip; process marks reuse their own status rhythm/clock."
  - "QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q12 amends G4: every Project’s Resources includes This computer and Puppet Master’s own services, which are shared and belong to no individual Project, alongside that Project’s own servers. An empty Project says that nothing in this Project is running, above the shared rows; it does not look empty or report another Project’s work as its own. Shared machines show only environments with running work. Metadata/freshness is available on tab entry; the existing visible-only 2 s sampling owner remains. Permission, exact host/environment identity and stale disclosure remain authoritative; shared read scope creates no Stop/Restart/Stop all or service-control authority. Q13/CC5: the PM_WORK dock provider gives a live process and the next pending scheduled run a 60000 ms presentation lifetime from first exposure in that thread’s dock projection. Key freshness by thread, work identity and run start/occurrence time; repaint or returning to the same run does not restart it, while a restarted/new occurrence gets a new lifetime. At elapsed >=60000 the non-needs line leaves. Needs-you lines bypass expiry and remain until the owning question/input is answered. One next-expiry timer requests a redraw; it owns no work, schedule or persisted state and expiry never stops/cancels/deletes work. Existing dock priority, at-most-three budget and transcript visibility gates remain; full work remains reachable through Activity and the panel."
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/DRY_Rules.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/background-activity/opus-5.5/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-246, ContractName:Plans/Shared_Integration_Runtime.md#SIR-054

### DR-079 - One Menu Sprout Owner

```yaml
plan_unit_id: DR-079
unit_type: requirement
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  L8 B, Jared 2026-10-30: one shared menu sprout owner supplies every menu’s origin, open/close
  lifecycle, family motion tokens, Reduced Motion settle, drag/hidden pause and teardown. Chat menus.js,
  Usage PMU.menu and Home PMW.menu delegate to that owner instead of carrying duplicate sprout
  implementations. This build closes the former L8 DRY debt. Menus retain their existing items, routing,
  focus and availability contracts; sharing motion dispatches no command or runtime write. L8 B, PM7 Step4,
  2026-10-30: the shared implementation is window.PM6_SPROUT in base/script/pm7-sprout.js with
  base/style/pm7-sprout.css, registered as pm7-sprout-js/css. Its contract is open(el, afterOpen, anchor,
  opts), close(el, done, opts), isOpen, aim, resize, morph, bounce, keep and reduced; pm-sprout/pm-sprout-edge opt in and
  the owner writes is-open/is-closing/is-size-bounce and six --pm6-sprout-* values. Legacy selector adapters
  may keep their names only while using that same lifecycle. Title, chat/worktree/sidecar, Settings, rail
  PMR.menu/filterMenu, Usage PMU.menu, Home PMW.menu, PMMenu/File Manager and live notification inbox
  #pmnPanel all consume it; there is no inbox exemption. The standalone chat reads the same owner files.
  Preserve each trigger’s opening origin/fade, one speed-scaled close timeline, last-relevant-transition
  completion with cancellation/reopen guards and bounded fallback, and drag hold even for motion already in
  flight. L8 B, joined review fixes at 4c49e10567: opts.origin accepts corner (default), trigger, or
  {ox,oy,tx,ty,sx,sy}; opts.shown waits for timely painted entrance frames, and close opts.instant settles
  immediately. The shared --pm6-sprout-fade-in/--pm6-sprout-fade-ease inputs preserve the consumers' fades
  (160 ms for Home/Usage/chat, 140 ms default). morph(el, from, to, opts) moves the same box between
  {left,top,width,height} geometries: height-only changes use the shared height spring/size bounce;
  a level's width/place change uses its opts.shape duration/easing, with the same motion gates.
  Shared presentation APIs create no new product command or saved key. L8 B, PM7 Step4 final-source alignment,
  2026-10-30 (integration e9b15abc64): the owner also supplies --pm6-sprout-height-ease. A growing resize may
  overshoot; a shrinking resize or height-only morph settles without passing below its content. A drag
  catching an in-flight morph settles it at the end. All editor overflow menus (.pm-ed-overflow-menu) use the
  same open/close owner, and superseded local styles/lifecycles are retired.
gui_related: true
gui_classification_reason: Defines one visible menu motion and lifecycle owner.
split_recommended: false
depends_on:
- DL-237
- DR-043
- ACD-439
unblocks: []
acceptance_criteria:
- All menu consumers use one sprout implementation; chat menus.js, Usage PMU.menu and Home PMW.menu have no
  private copies.
- Every consumer preserves its family tokens, origin, focus return, Reduced Motion and teardown behavior.
- The shared sprout is presentation only and creates no command, Settings row, event or runtime write.
validation_surfaces:
- python3 scripts/pm7-build-check.py
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- GUI source audit and 60 fps menu recordings across all ten looks and Reduced Motion
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/DRY_Rules.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build-decisions/README.md — Jared's answers (2026-10-30)
- reports/pm7-build-20261029/IDS.md
preserved_exact_tokens:
- menus.js
- PMU.menu
- PMW.menu
negative_constraints:
- Do not keep a per-surface sprout implementation or mark the L8 duplication deferred.
owner_hints:
- Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-237, ContractName:Plans/DRY_Rules.md#DR-043, ContractName:Plans/assistant-chat-design.md#ACD-439


Q22 appearance amendment (Jared, 2026-10-30; Plans/Decision_Log.md#DL-257): current appearance contracts use five ordered families and ten variants. Earlier override-only or eight-theme evidence is historical, not current acceptance. Settings_System SSYS-043 owns the retired-key migration and retained NieR Adjust rows.


QA2 owner amendment (2026-10-30; DL-258; integration 7d586bad18): current requirements in this document’s amended units take precedence over earlier presentation descriptions. Q18: when a concept page has no usable storage at all (opaque-origin sandbox access throws), each existing owner store retains a secret-free, key-isolated memory record for that visit and exposes persistent:false. Home PMW.store.raw/get/set/remove and O55.store.get/set/clear/scrub remain their sole adapters; reload/new visit loses memory. Settings’ corresponding Project adapter must preserve Project isolation and ordinary owner admission. Available storage whose write/quota/readback fails still reports failure and rolls back: never silently switch a failing persistent store to memory. Visit-only success is fixture-local, non-authoritative and never native durability, a restored backup, verified credential or a native owner receipt; production Storage/Settings CAS/readback/rollback rules are unchanged. Q17: hover-to-light/dimming starts only from an actual control inside its affects region (button, input, select, textarea, label, link, switch/radio/checkbox/tab/slider/spinbutton/combobox semantics, or editable text). Plain words, empty section space and the plate picture do not dim the cast. Keyboard focus on a control gives the same feedback; a plate-embedded control remains eligible. Scheduled highlights only rows/marks with a real partner on its plate; markless rows dim nothing. One affectsOf/linkStyle owner supplies this behavior, with no per-sheet hover engine. Q16: You is the person alone, head and shoulders in each family’s materials and small-size maps. It carries no marionette cross, strings, holding arm/control or connection to a cross, and is never an agent Pip. Diagram edges to You express the plate’s result/topology, not puppet strings. The one ppYou/PX_YOU/pnYou drawer serves crew diagrams, cast plates, run cards and rosters. Optional agent strings and the single Pip primitive retain their existing meaning. Q15: the menu head and trigger use the same registry wand with the same rod/star/sparkle ink roles. Pip and that wand remain the head’s own children so a wrapper cannot discard the glyph’s role-specific colours. The sign’s kind glyph matches its sheet head; do not fork a second wand or fallback icon. H5: the onboarding owner holds one original inert-state basis for the entire open lifetime. Replacing an already-open screen acquires only newly encountered background nodes; it never re-snapshots nodes already held by that modal as originally inert. Every close/finish/skip path removes only the modal’s own holds, preserves pre-existing inert nodes and restores focus/input. H1: explicit lab open({screen}) invokes the screen owner’s seed(S), filling only missing fixture prerequisites; seed:false opts out. Connect/NAS/online fixtures have coherent identities, trust/key/source/sign-in examples. Seeds and seedCommit are lab-only: no native Project receipt, authentication, permission or completed owner work is inferred, no selected live input is overwritten, and no new product action/DTO field is admitted. H1/H5/H7/Q19: one lab Studio opens seeded owner screens and steps aside when launching a panel, chat view, Stop all or Quit. Recorded guides name the actual current control, including Schedule for …, and advance only after that control’s real example boundary. The teach-missed example owns its intended Send and finishes its recorded correction through the normal reply boundary; it does not simulate a native model promise. Natural user choices may remain waiting, and finished examples need not be forced into an artificial Done label. Keep DR-070’s existing named hidden-bridge debt unchanged; no additional synthetic click, demo product command, preference, persisted field or production wiring is authorized. Q20: Glass has only the F3-465/PMH shared hover light on registered edge-glow objects, including Usage/Home widgets, cards, tiles and rows. Remove the independent sheet-wide lg-shine/light, pointer listener and stale data-lg-lit. Its central sheen is at Basic’s level (Glass Dark white 4.5 percent, Glass Light accent 4.5 percent); edge glow is unchanged. Plain panels, bars and dialog ground do not light merely because the pointer crosses them. Retro and NieR retain their non-soft-light forms and existing Reduced Motion, software and gesture holds. Q12 amends G4: every Project’s Resources includes This computer and Puppet Master’s own services, which are shared and belong to no individual Project, alongside that Project’s own servers. An empty Project says that nothing in this Project is running, above the shared rows; it does not look empty or report another Project’s work as its own. Shared machines show only environments with running work. Metadata/freshness is available on tab entry; the existing visible-only 2 s sampling owner remains. Permission, exact host/environment identity and stale disclosure remain authoritative; shared read scope creates no Stop/Restart/Stop all or service-control authority. Q13/CC5: the PM_WORK dock provider gives a live process and the next pending scheduled run a 60000 ms presentation lifetime from first exposure in that thread’s dock projection. Key freshness by thread, work identity and run start/occurrence time; repaint or returning to the same run does not restart it, while a restarted/new occurrence gets a new lifetime. At elapsed >=60000 the non-needs line leaves. Needs-you lines bypass expiry and remain until the owning question/input is answered. One next-expiry timer requests a redraw; it owns no work, schedule or persisted state and expiry never stops/cancels/deletes work. Existing dock priority, at-most-three budget and transcript visibility gates remain; full work remains reachable through Activity and the panel.


### DR-080 - One Joined-Choice Tray And Option Hint Owner

```yaml
plan_unit_id: DR-080
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: 'QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q7/H2/H8: a selected choice’s follow-up belongs
  immediately in a tray joined to that card, before sibling alternatives. One C.cards under slot owns the join,
  indentation and line from the parent mark across all twelve affected screens. The parent opens into the tray in
  every look, with matching edges, no gap or overlapping lower corner/ring; narrow layouts put the parent question
  note first inside the tray. Arrow keys stay in their own choice list, and the option, its radio and question control
  never overlap. Apply to backup places/Kit, existing-work origins, work computer checks, sign-up links, Settings
  copy, remote routes/hosting/certificate fields, online service kind/address, device notes and connection routes.
  Naming and Review display the same selected mounted/network source, rather than an empty local-location field.
  Q3/Q8/Q9: question controls answer pointer hover and keyboard focus in the current look. Remove duplicate explanation-only
  disclosures (What is a Server?, the Connect proxy explanation, and What does Puppet Master read? on Choose a key);
  put their information in the shared option tips. Keep functional sections: More about keeping versions contains
  FileSafe, Which proxy contains the Caddy/NGINX/Traefik selector; identity fingerprints and Creating/restore receipts
  are data and remain. H3: SMB sign-in uses the operating system’s shared-folder keychain; Puppet Master stores
  no password. The SSH add-key password remains a separate one-use protected flow; never reuse its never-saved hint
  for SMB. One component renders the option question affordance, its expanded note and joined tray in every family;
  no screen appends a second tray, disclosure grammar, pointer engine or sibling-level follow-up. Source API C.cards
  accepts under; source classes o55-under/o55-card-parent are presentation only.'
gui_related: true
gui_classification_reason: Fixes shared joined-choice tray and option hint grammar across onboarding screens.
split_recommended: false
depends_on:
- PWIZ-022
- F3-520
- F3-663
- DL-258
unblocks: []
acceptance_criteria:
- All twelve joined-tray screens use one C.cards under owner; parent edges join with no gap, lower ring or corner
  overlap in all ten looks.
- A narrow parent note is the first line of the tray; keyboard arrows stay in their own list and question controls
  do not overlap inputs.
- Functional sections and data remain; explanation-only duplicates use the shared tips.
- No new setting, command, local action, persisted field or permission is created.
validation_surfaces:
- python3 scripts/pm7-qa2-alignment-check.py
- python3 scripts/pm-shard-plans.py --check
risk_class: duplicate_choice_presentation
reasoning_tier: high
context_scope: qa2_joined_choices
implementation_surfaces:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Concepts/onboarding/opus-5.5/src/js/61-components.js
node_compile_hint:
  mode: static_presentation_contract
  create_worknodes: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/QA-ROUND2.md Q7
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/lanes/onb/REPORT.md QA round 2
- Concepts/onboarding/opus-5.5/src/js/61-components.js at 7d586bad18
preserved_exact_tokens:
- C.cards
- under
- o55-under
- o55-card-parent
negative_constraints:
- Do not draw follow-up choices below a different parent or duplicate the joined tray per screen.
- Do not remove FileSafe/proxy selectors or identity/receipt data as if they were explanation-only tips.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
```
