# Shard 096: DL-180 to DL-185 — One Universal Panel System, A Fixed Chat Column, Shell-Wide Bans And One Demo Studio (2026-10-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L44507-L46887

Source SHA256: `5049fc1967b53eb12bd03c1e1f58e8d7fb3f3523722601a0c28611c90807b01b`

---

## DL-180 to DL-185 — One Universal Panel System, A Fixed Chat Column, Shell-Wide Bans And One Demo Studio (2026-10-09)

This addendum compiles the owner decisions DL-180 (the home centre becomes one universal panel system and the chat a
fixed column on the right), DL-184 (no box with a coloured side, no emoji and no pills, anywhere in Puppet Master),
DL-185 (one Demo Studio for PMConcept7) and the panel side of DL-181 (a terminal is one tab kind, Split makes a new
panel beside it, and Terminals 2x2 is a named layout of four panels). The Home model of the 2026-08-04 reconciliation
addendum (F3-HOME-001 to F3-HOME-005), F3-501 to F3-504, the fixed bottom runtime zone of sections 3.1, 3.2, 5 and
7.20, and the movable chat did not come from an owner decision: they came from an audit packet of the concept as it
stood in August (`PMConcept7_Home_Workspace_Audit_Packet_v1`), and they are superseded here. What survives of them is
named in their own dated notes: the gesture transaction of F3-HOME-002 and F3-503 now moves panels and tabs, F3-505's
contact-aware silhouette becomes the one tab silhouette, F3-HOME-004's write-then-read-back transaction and F3-HOME-005's
Rust-owned model carry over to the split tree, and F3-504 keeps the web and native boundary, with Pop out a desktop app
action.
Superseded with a dated note: F3-501 (by F3-630), F3-070 (by F3-630), F3-197 (by F3-638) and F3-279 (by F3-638).
Amended in place, each with a dated note: the 2026-08-04 block's heading paragraph, F3-HOME-001 to F3-HOME-005 and the
block's superseded dispositions; F3-502 to F3-505; the executive summary; sections 3.1, 3.2, 3.5, 3.6, 4.1, 4.4, 5
(5.1, the terminal section presentation rules, 5.2 to 5.4 and 5.6 to 5.8), 7.2, 7.3, 7.12, 7.16.1, 7.18, 7.20, 8.2,
12.1, 12.3, 13.3, 15.1, 15.4 and 22 (the APR-036 to APR-038 rows), and the Assistant redesign's Plan card (section 6)
and run views (section 10); Appendix B item 4; Appendix C; F3-010, F3-019, F3-020, F3-027, F3-034, F3-035, F3-039 to
F3-041, F3-060, F3-061, F3-066 to F3-068, F3-071, F3-072, F3-102, F3-132, F3-140, F3-143, F3-151 to F3-154, F3-156,
F3-162, F3-195, F3-202, F3-205, F3-206, F3-217, F3-225, F3-234, F3-271, F3-276 to F3-278, F3-281, F3-282, F3-297,
F3-421 to F3-423, F3-445, F3-463, F3-464, F3-466, F3-467, F3-469, F3-476, F3-516, F3-517, F3-520, F3-521, F3-540,
F3-565 and F3-569; and, where their DL-162 notes or text name the bottom Debug tab or the bottom zone, the Run & Debug
units F3-483, F3-484, F3-490 to F3-492, F3-495 and F3-496 and the DL-162 addendum's heading paragraph, which now point
at the Debug Console tool kind. The left rail otherwise keeps its own canon (DL-162, DL-163, F3-618 to F3-625, DR-057):
its side panels, their segmented strips, its More tray and its looks are not home panels and are not changed here. The
terminal tab's own chrome, features, appearance, effects, faces, images and agents are F3-640 to F3-646
(DL-181 to DL-183). Behaviour and records stay with their owners and are cited, never restated: the v2 Home layout
record (`Plans/storage-plan.md#SP-330`, `Plans/home_workspace_layout_v2.schema.json`), the placement fields and the
layout event (`Plans/Contracts_V0.md#CV-360`, `Plans/Contracts_V0.md#CV-361`), the commands (`Plans/UI_Command_Catalog.md#UCC-200` to
`Plans/UI_Command_Catalog.md#UCC-203`, `Plans/Commands_System.md#CS-100`, `Plans/Commands_System.md#CS-101`), wiring (`Plans/Wiring_Matrix.md#WM-090`,
`Plans/UI_Wiring_Rules.md#UIW-040`, `Plans/UI_Wiring_Rules.md#UIW-041`), settings (`Plans/Settings_System.md#SSYS-050`), the dashboard's
boards (`Plans/Widget_System.md#WS-030`), the file tree's opens (`Plans/FileManager.md#F-090`), the chat's opens and
its port (`Plans/assistant-chat-design.md#ACD-500`, `Plans/assistant-chat-design.md#ACD-501`), the DRY rules (`Plans/DRY_Rules.md#DR-065` to
`Plans/DRY_Rules.md#DR-071`) and the words (`Plans/Glossary.md#G-030`: a panel is a tab group in the home centre, the left rail's panels
are side panels, a workspace tab is still a project tab). The panels concept (its host contract, its numbers as built
and the anatomy mock) is source lineage only: its class names, data attributes, scripts, storage keys, demo contents
and harness hooks are not canon.

Amended 2026-10-10 (DL-186, DL-187, DL-188): Jared's answers of 2026-10-10 are compiled into this block's units in
place, each with a dated note: F3-638 (every dashboard tab its own board on the Usage board engine, custom dashboards,
Start from and presets; DL-186), F3-637 (a popped-out chat starts back in its column, the Usage board's 400 px floor;
DL-187) with F3-042 and section 4.1 (the rail's Chat entry shows or hides the column), F3-635 with F3-490 (one Debug
Console tab with session sub-tabs), F3-632 (every installed shell, an SSH hosts submenu and New dashboard in "+"),
F3-631 (no terminal tab colours or icons; a kind's own tab-menu rows) and F3-521 (the tour's widget step teaches
Upcoming resets). F3-515's layout event note records that Event Authority admitted payload 2.0.0 (DL-188). Addendum 2's
items are cited as D29 to D31 (D41).

### F3-630 — The Universal Panel Model And Its Layout

```yaml
plan_unit_id: F3-630
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The home centre, between the left rail and the chat column (F3-637), is one universal panel system
  (DL-180). Its layout is an n-ary split tree: a split is a row or a column of two or more children, each
  child a panel or another split, and every leaf is a panel. A panel is a tab group, one tab strip (F3-631)
  over one body, and any panel can hold any tab kind (F3-635). Every split has its own sizes, stored as
  proportions of that split, never as pixels, so panel widths and heights are independent. The tree always
  keeps these invariants: every leaf is a panel; a split has two or more children and never runs in its
  parent's direction; every size is above 0.02; a tab lives in exactly one panel; pinned tabs come first in
  their strip; a panel has at most one preview tab. A panel's minimum is the largest content minimum of its
  tabs (F3-635) and never less than 280 x 120 px. Inserting a panel starts from half the target's share,
  redistributing available room from neighbours when necessary to preserve every resulting panel's own
  minimum; a new panel along the centre's outer edge takes 0.34 of the root. Removing a panel gives its
  share to its previous sibling, else to the next. Closing the last tab of a panel closes the panel and its
  neighbour takes the space, unless it is the only panel in the centre or the user locked it: then it stays
  and shows the empty-panel launcher (F3-632). Closing a panel closes its tabs, each kind asking first where
  it asks (F3-635). Locking a panel keeps it in place when its last tab closes, and automatic placement
  skips it (F3-634). Split fit rule: offer a split whenever the complete resulting layout can meet each
  panel's own minimum, borrowing available room from neighbours; drag, the tab menu's splits, Move panel and
  Alt+Shift+arrows use this room rule, and a panel the application places uses the automatic rule of the 2026-10-17
  amendment below (it read: drag, split menus, Move panel and Alt+Shift+arrows use this one rule). For an unspecified side prefer right, then below, else refuse with a
  reason. Panels are 6 px apart, the divider line in the middle of the gap, and the centre is inset 6 px
  from the rail, the chat and the bars; a divider's hit target is 8 px. Dragging a divider moves only the
  two neighbours it separates and commits once on release (cmd.workspace_layout.resize_surface); from the
  keyboard, Tab reaches a divider, arrows move it 8 px, Shift+arrows 48 px, Home and End move it to a
  neighbour's minimum, and Enter or a double click evens the two sides. A panel dragged below half its
  minimum along the divider's axis collapses to its 35 px strip and keeps every tab and its state; dragging
  it out again, or Expand in its panel menu, restores it (cmd.workspace_layout.set_collapsed). This replaces
  Collapse Bottom Terminal for every panel. Maximize is a flag outside the tree: the maximized panel fills
  the centre and the tree underneath does not change; Shift+Escape, the panel menu, or Escape while focus is
  in its strip restores it (ui.workspace_layout.maximize, view state with no receipt and no event). Each
  panel has a small corner grip and a panel menu (⋮) at the end of its strip: Split right, Split down,
  Maximize or Restore panels, Collapse to tabs or Expand, a hairline, Move panel, Lock panel or Unlock panel, Show all
  tabs in this panel, a hairline, Layouts, a hairline, Close other tabs and Close panel (amended 2026-10-17, DL-228:
  this unit holds the rows and their order; UCC-200 maps their dispatch).
  A whole panel moves by its grip, or by Move panel from the menu or Enter on the grip
  (cmd.workspace_layout.move_surface): beside another panel on any edge, along the centre's outer edge, or
  into another panel as its tabs. A tab dragged into the diagonal region nearest a panel side splits on that
  side (cmd.panel_tab.move with a split target); dropped on a strip, it moves into that panel at the drop
  position; pulled off its strip by 14 px vertically or 40 px horizontally beyond the strip band, it tears
  off and follows the pointer until it lands on a strip, an edge band or the "+N" list (F3-633). The panel
  body is divided along diagonals into four side regions. Only the central Join tile or a strip slot joins
  as tabs; other body regions split. A whole panel carried onto another panel's strip shows the exact
  caption Join as tabs and reuses the existing join command and caption placement rule. A central guide
  shows the four sides around Join, and outer-side dock targets plus thin left/right/bottom edge bands
  create a full-height or full-width panel; a drag starts after 4 px of travel, a zone is adopted after 100
  ms of dwell, scaled by Animation speed (skipped on release and under Reduced Motion, where the result appears in
  place, fading only, once the zone has held briefly; amended 2026-10-17, DL-228, it read: retained under Reduced
  Motion, which removes travel), and an adopted zone holds by the three hold rules of the 2026-10-17 amendment below
  (it read: while the pointer stays within 12 px of it). Every drag runs the gesture transaction Home already
  uses and shares with the Usage board's gesture kit (F3-HOME-002, F3-503, DR-066): the preview is local,
  nothing dispatches while dragging, a changed release commits one command, an unchanged release, Escape, a
  pointer cancel, a lost pointer capture, a lost window or a drop past the workspace commits nothing and
  restores the exact earlier picture, and a failed commit rolls back. Every drag outcome also has a menu
  path and a keyboard path (Move panel, Move to panel, Alt+Shift+arrows; F3-635). Motion: a panel glides
  into its new place in 180 ms by default, in Friendly 220 ms, Glass 260 ms, Basic 200 ms, Retro 140 ms in
  steps and NieR Mode 200 ms; the landing preview glides in 160 ms and fades in 140 ms; neighbours slide
  aside in 250 ms on cubic-bezier(.22,1,.36,1); a tab settles in 160 ms on cubic-bezier(.17,.84,.29,.99); a
  drop settles on a critically damped spring of stiffness 520 and damping 45.6; a cancel returns in 300 ms;
  under Reduced Motion every one of these is 0. The default layout, Home, keeps a full-width bottom row
  where the terminal sat before, 0.4 of the centre's height: an ordinary panel row that holds any tab kind
  and can be split side by side. Four named layouts ship. Home: a column of a row of 0.6 (a dashboard panel
  0.5 holding the pinned Home dashboard, F3-638, and a documents panel 0.5) over a tools row of 0.4 holding
  terminals and Output. Build: a column of a row of 0.62 (documents 0.66 and a side panel 0.34 for browsers
  and dashboards) over a row of 0.38 (terminals 0.6 and tools 0.4 holding Output and Problems). Terminals
  2x2: a column of two rows of two terminal panels, every size 0.5, one terminal in each, new ones started
  where fewer than four are open, and every other tab joining the first panel in the background. Focus: one
  panel holding every tab. Applying a named layout keeps every open tab: no terminal session ends, no
  unsaved buffer is dropped, and each tab moves to the slot that holds its kind
  (cmd.workspace_layout.apply_named). Restore home layout (cmd.workspace_layout.reset; the Settings row
  general.startup.reset-home-layout) applies Home the same way, keeping every tab. A user can save the
  current arrangement as a named layout (cmd.workspace_layout.save_named); a saved layout keeps its shape,
  its sizes, the kinds each slot holds and the tabs each slot held, and never recreates a closed tab (amended
  2026-10-17, DL-228; it read: never the tabs themselves). The named and saved layouts, Save this
  layout... and Restore home layout sit in the panel menu's Layouts submenu and in the title bar's Home
  options menu (F3-502). The layout persists in the v2 Home layout record
  `home_workspace_layout.v2:{project_id}:{workspace_tab_id}`, the only Home layout authority
  (Plans/storage-plan.md#SP-330, Plans/home_workspace_layout_v2.schema.json), through F3-HOME-004's
  write-then-read-back transaction; this unit does not restate its fields. Narrow states (F3-636), menus,
  overlays and drags are never saved. A layout from before this redesign is converted on first read and
  never reset: an upgrade never loses a user's tabs or layout. Every committed change emits the one existing
  event workspace.layout_changed (CV-361); a reveal of an open tab emits nothing. This unit supersedes
  F3-501 and the composition of F3-HOME-001 (four fixed editor panels, the singleton dashboard, the chat as
  a movable surface, terminal sections docked at the bottom), the fixed bottom runtime zone of sections 3.1,
  3.2, 5 and 7.20 (F3-034, F3-035, F3-060, F3-061, F3-066, F3-151), F3-502's Collapse Bottom Terminal row,
  the host registries, host caps and per-kind fair-share minimums of F3-HOME-002 and F3-503, and, for home
  panels, section 5.8's 240 px panel minimum. A saved named layout also keeps at most 64 KB (65,536 bytes)
  of its dashboard boards' contents; a larger save keeps the layout without those contents, records
  boards_skipped_bytes and says so (SP-330). The guide responds immediately while a stable-intent gate
  prevents a passing pointer from repeatedly rearranging the live preview. A split ghost shows the resulting
  panel/tab, joining opens the destination strip slot, a moving panel leaves an outline, and a source
  emptied by the move fades back. Escape returns the exact earlier arrangement; release commits precisely
  the shown result. Every target name remains outside the carried tab, pointer, other docks and preview
  tab/mark, including a resting pointer at bottom and edge docks. Each zone has an ordered list of caption
  positions: choose the first with 12 px clearance from the carried tab and pointer, retain it while at
  least 4 px remains clear, and return to an earlier place only after 160 ms. Captions draw above the
  carried tab. After ordinary clear positions fail, a position just past the carried tab is tried before
  sacrificing the preview mark or tab. Bottom, left and right outer docks prefer above the carried tab; the
  top dock uses below; the +N caption is below the strip. The existing clearance and hysteresis apply to
  every candidate, so a resting pointer never hides a target name. While a carried tab rests over "+N", that
  target stays under the pointer with no insertion gap pushing it away, shows "To the end", and release
  appends the tab to that strip. Approaching through the end insertion slot or directly produces the same
  settled target. The guide, captions and preview use each family's motion and material; Reduced Motion
  keeps the legible end state without spatial travel. The screen reader announces the held destination once
  its intent settles. F3-657 owns resize feedback. Jared’s 2026-10-14 grip correction puts the grip’s narrow
  end in the panel’s top-right corner. Orientation changes no drag threshold, menu route or command. Move
  panel and Layouts levels consume the shared F3-632 level/Back rule and F3-647 material; navigating them
  dispatches nothing.
  Amended 2026-10-17 (DL-228): applying a saved layout returns each tab still open to the slot it was saved
  in, with that slot's active tab, and puts back each slot's lock and collapse (a locked slot survives empty);
  tabs no longer open are not recreated, and the other open tabs go to a slot that accepts their kind
  (Plans/home_workspace_layout_v2.schema.json $defs.slot). Amended 2026-10-17 (DL-230, Jared): a saved named
  layout belongs to the person across projects, as the concept keeps it, in home_named_layouts:v1 (SP-330),
  and the dashboard boards inside a layout stay per project, skipped when it is applied elsewhere. Two fit
  rules: the room rule above serves every move whose side the person chooses, offered when the result leaves
  every panel it changes at its minimum, neighbours along the split giving up room, and a panel already under
  its minimum failing only if the move shrinks it further; the automatic split rule serves a new panel the
  application places (an open by the fit rule, Alt+click, the "+" and panel menus' Split right and Split down
  with a new tab, Ctrl+\ and Ctrl+Shift+\): right when both halves of the source panel stay at least the
  larger minimum, else down, else none. A panel cannot collapse while every other child of its split is
  collapsed (last_open_in_split), so a split never leaves its room to nobody; the menu row and the refusal say
  so. Maximize is unavailable with one panel and in the one-column narrow centre, each with its reason;
  maximizing a collapsed panel expands it first and announces "<panel> maximized. Press Escape to restore."
  Moving focus to another panel (Alt+arrows, Alt+Shift+N, a reveal or open that activates a tab elsewhere, the
  narrow switcher) restores the panels in the same view action and announces it, so the focused panel is never
  hidden; an agent's background open never restores them. A panel collapsed in a row split, side by side, is a
  35 px column: pinned tabs first, then a window of 32 px icon tabs around the active tab, "+N" for the rest,
  and its Expand control, "+" and panel menu kept at its foot; the active tab never hides, and Expand points
  the way the panel will open. Drop zones: a side whose result does not fit shows its guide tile dimmed and
  empty and gives its region to the nearest side that fits; with no side left the whole body joins, or offers
  nothing over the carried tab's own panel, which never joins itself; the top dock sits just below the strips
  so a strip's first slots stay strip slots; outer docks are offered only with two panels or more; zones are
  measured on the committed layout, never on the live preview, so the preview never moves a zone under the
  pointer. The three hold rules: a side holds until another side is nearer by about 5 % of the body, Join
  until the pointer is 12 px past its slack, and a dock until it is 12 px past its band. The stable-intent
  gate settles a zone once the pointer has held it and slowed, or held it longer, and the guide shrinks its
  tiles in small bodies and below that shows Join alone; those values are tuning, not acceptance numbers. Zone
  captions: Split left, Split right, Split up, Split down, Join as a tab (a carried tab) or Join as tabs (a
  carried panel), New panel along the left, New panel along the right, New row across the top, New row across
  the bottom, and To the end. The Lock row's second line says what locking does: "Files open in other panels"
  or "Files can open here again", and locking announces "Panel locked: files open elsewhere".
gui_related: true
gui_classification_reason: Defines the home centre's panel model, its layout tree, its named layouts and how panels move, split, collapse and persist.
split_recommended: false
depends_on: [DL-180, DL-181, F3-503]
unblocks: [SP-330, CV-361, UCC-200, CS-100, WM-090, UIW-040, UIW-041, SSYS-050, DR-065, DR-066, ATS-075, GRRC-040]
acceptance_criteria:
- 'The layout is an n-ary split tree whose leaves are panels, sizes are proportions per split, and after every
  commit the invariants hold: every leaf a panel, two or more children per split, no split in its parent''s direction,
  every size above 0.02, each tab in exactly one panel, pinned tabs first, at most one preview tab per panel.'
- Inserting a panel starts with half the target share, then the complete-layout fit allocator redistributes only
  as needed to satisfy every visible minimum; a new panel at the centre's outer edge takes 0.34 of the root; a
  removed panel's share goes to its previous sibling, else the next.
- Closing the last tab closes the panel unless it is the only panel or locked, which then shows the empty-panel
  launcher; a locked panel is skipped by automatic placement.
- A requested split is offered when the complete layout can fit all visible minima after allocation; menus, keys
  and drag previews use the same fit result.
- A divider drag moves only its two neighbours and commits once on release; the divider keys move 8 px and 48
  px, Home and End reach a neighbour's minimum, and Enter or a double click evens the sides.
- A panel dragged below half its minimum collapses to its 35 px strip with every tab and its state kept, and any
  panel, the bottom row included, can collapse.
- Maximize leaves the tree unchanged and restores with Shift+Escape, the panel menu, Escape in the strip or focus
  moving to another panel (amended 2026-10-17, DL-228); it emits no event.
- The default layout Home has a full-width bottom row of 0.4 that holds any tab kind, and Home, Build, Terminals
  2x2 and Focus build exactly the trees and proportions stated here.
- Applying a named layout or Restore home layout ends no terminal session, drops no unsaved buffer and closes
  no tab.
- A tab dragged to one of the panel's diagonal split regions splits that panel; the center Join target and tab
  strip alone merge; a tab pulled 14 px vertically or 40 px horizontally off its strip tears off; a whole panel
  moves by its grip or Move panel; each drag has a menu and keyboard equivalent.
- During a drag nothing dispatches; a changed release commits one command; Escape, pointer cancel, a lost pointer
  capture, window blur, a drop past the workspace and an unchanged release restore the exact earlier layout with
  no command, persistence or event; a failed commit rolls back.
- Under Reduced Motion every glide, slide, settle and cancel duration is 0 and every drag still shows its landing
  preview.
- Approaching "+N" directly or through the end insertion slot keeps the target under the resting pointer, with
  no gap, a visible "To the end" caption and a release that appends the tab, in every look and Reduced Motion.
- An existing Home layout from before this redesign opens converted, with its tabs, on first read; no upgrade
  resets it.
- No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks
  are created by this unit.
- A whole-panel drop onto another panel's strip displays Join as tabs, with the existing join command and caption
  clearance/placement behavior.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/home_workspace_layout_v2.schema.json
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/DND-NOTES-20261014-COMBINED.md, SHA-256
  6ffc7b0308acc0b371f997fd643f5711169f4d7d9f431ea090f3243668752734 (landing source recheck; approved direction,
  not native implementation evidence)
- Plans/FinalGUISpec.md F3-HOME-002, F3-HOME-004 and F3-HOME-005 (prose headings with no PlanUnit; cited,
  not a dependency (lead ruling L22, 2026-10-10))
- Plans/FinalGUISpec.md#F3-635 (the tab kinds consume this model; cited, not a dependency (lead ruling
  L22, 2026-10-10))
- Plans/Decision_Log.md#DL-180
- Plans/Decision_Log.md#DL-181
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D1, D2, D11)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md,
  SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md,
  SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/proposal-visual.html, SHA-256
  52dd51521a1266e39a2ab6b274176d89666baaaacb1d933e5cc2237c151ab981 (the agreed anatomy; concept lineage
  only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md, SHA-256
  f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8 (audit lineage only)
- Concepts/home-redesign on branch concept/home-panels-20261009 at 1565156bce (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-NUMBERS-51c316e18b.md,
  SHA-256 a9c42b88e5cb50706ff1716a254cb68e026a538bb7a0c840905779a9a482cff2 (small-round concept lineage
  only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-CONTRACT-2926ad987e.md,
  SHA-256 c579d0dfef41fd1fc7327d14c2adb9e2b101c24b216ff64a9db5fc19895ad989 (small-round concept lineage
  only)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/DND-NOTES-20261014-FOLLOWUP.md, SHA-256
  b5b883caeef6d774fbca250e5c7b6c82dd31eee05af8da207727179baa21b5c3 (approved campaign source lineage;
  not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-resize-glow/NOTES.md, SHA-256 0a20256d730c5b51cda138b14845a5dc2e7dfdda04385a3956721a73fb657c16
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/JARED-FEEDBACK-20261014.md, SHA-256 47218ab2d7bfdbb58e983f9e4b489f3c29cedfc7b54bcf77788d06ced0ef10e6
  (decision/source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-13-panel-dnd-resize--NOTES.md,
  SHA-256 6ffc7b0308acc0b371f997fd643f5711169f4d7d9f431ea090f3243668752734 (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-panels-picker-back--NOTES.md,
  SHA-256 29bac44f166cb8e0e67f4f00634cb15d0a3be576eb2f68e7e19606f3a4a1a71c (source lineage; not native
  certification)
preserved_exact_tokens:
- n-ary split tree
- '0.34'
- '0.02'
- 280 x 120
- 35 px
- Home
- Build
- Terminals 2x2
- Focus
- Restore home layout
- cmd.workspace_layout.resize_surface
- cmd.workspace_layout.set_collapsed
- cmd.workspace_layout.move_surface
- ui.workspace_layout.maximize
- home_workspace_layout.v2:{project_id}:{workspace_tab_id}
- workspace.layout_changed
- Join as tabs
negative_constraints:
  - "Do not reintroduce fixed editor panel slots, a singleton dashboard surface, terminal sections or a fixed bottom runtime zone."
  - "Do not store panel sizes in pixels or equalize siblings when a panel is inserted."
  - "Do not save a narrow state, a menu, an overlay or a drag in the layout record."
  - "Do not reset a user's layout on upgrade or end a terminal session or drop an unsaved buffer when a layout is applied."
  - "Do not dispatch a command, write the record or emit an event while a gesture is in progress."
compatibility_only_notes:
  - "Slint portability: the split tree, the strip, the silhouette and every gesture are projections over the Rust-owned layout model (F3-HOME-005); the concept's DOM and CSS mechanics are not the product mechanism."
  - "The concept seeds its Home layout with demo files, a demo plan and two terminals; the seed contents are illustrative, the tree and proportions are canon."
stale_retired_dispositions:
- 'Amended 2026-10-10 (lead ruling L13): Adds a lost pointer capture to the gesture''s cancel set, as
  DR-066 says.'
- 'Amended 2026-10-11 (wave 2, panels NUMBERS 51c316e18b): Named-layout saves keep at most 64 KB of dashboard
  contents and announce a larger save without them.'
- 'Amended 2026-10-14: The thin 15-percent split-band and local-half-only fit rules retire; body-centre
  merging is now deliberate Join. Alt+Shift+arrows remains the canonical split shortcut, not the early
  packet''s Ctrl+Alt spelling.'
- 'Amended 2026-10-16 (PM7 pass 2): The combined side-dock and +N follow-up landed at 98229e9d6d; its
  caption order replaces the held past-first note.'
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
  - Plans/DRY_Rules.md

```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/storage-plan.md#SP-330, ContractName:Plans/Contracts_V0.md#CV-361, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/DRY_Rules.md#DR-065, ContractName:Plans/DRY_Rules.md#DR-066

### F3-631 — One Tab Strip For Every Panel

```yaml
plan_unit_id: F3-631
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Every panel has the same tab strip, the dashboard's included (DL-180, D5); no panel and no tab
  kind draws a strip of its own. The strip is 35 px tall in every panel, the change Jared asked for
  in PMConcept7 revision 19 ("Strips shortened: editor 40 -> 35px") applied to every panel, and its
  tabs are 31 px tall with 8 px between tabs, 2 px in Retro (the 8 px gap approved by Jared on
  2026-10-10, D29). The active tab's plate overlaps the body by 1 px and joins it through the
  contact-aware silhouette of F3-505, generalised here from the editor and dashboard strips to every
  panel and every tab kind, so the active tab and its panel read as one shape. That fused shape is
  the only mark of the active tab: no underline, no accent line, no accent crown strip, no pill. In
  Friendly, Glass and Basic, light and dark, the plate takes the body's own fill; no look gives the
  active tab a separately coloured plate, Glass dark included (Jared, 2026-10-10, D29: its purple
  plate is dropped), and Glass keeps only its 1 px glass rim along the plate's crown, part of its
  material and never in an accent colour. Retro fills the fused shape in reverse video and NieR Mode
  in ink (F3-647). Contact is measured to the neighbouring content, its box inset by 8 px, with a 20
  px linear morph window on each side. Crown, shoulder and flare radii per look: Friendly 16, 16 and
  25 px; Glass 16, 16 and 25 px; Basic 9, 14 and 22 px; Retro 6, 8 and 14 px on a stepped profile;
  NieR Mode 9, 14 and 22 px, or a 6, 0 and 14 px chamfer with a straight foot when its square part
  is installed. Drag to reorder is the pointer-capture gesture of F3-421 and F3-505, kept and
  polished in every strip: it starts after 4 px of travel, the carried tab tracks the pointer one to
  one, the silhouette follows it in the same frame without springing, neighbours slide aside, widths
  do not reflow while a tab is carried, and a changed release commits one cmd.panel_tab.move; the
  same gesture carries a tab to another strip, into a panel's diagonal split region or explicit Join
  target (F3-630) or off its strip (F3-630). Under Retro every selection and every reorder rolls one
  of the three Retro effects of F3-505 (phosphor, CRT and DOS) from a shuffle bag with no immediate
  repeat, in every strip, and each ends on the steady reverse-video tab; Reduced Motion shows the
  end at once. Widths: a tab's natural width is 96 to 200 px; when the strip runs short, inactive
  tabs shrink to 72 px, then become 36 px icon-only tabs; the active tab keeps at least 120 px and
  its label and never hides; after that a contiguous window of tabs around the active tab stays
  visible and the "+N" of F3-633 counts the rest. A shrunk file name keeps its start and its end and
  loses its middle (rec…es.rs). Pinned tabs are 36 px, icon only, sit at the left in pin order and
  never hide; Pin and Unpin are in the tab menu only (cmd.panel_tab.pin, cmd.panel_tab.unpin).
  Marks: a file with unsaved changes shows a 7 px dot in the close slot until the pointer is over
  the tab (Retro an asterisk after the label, NieR Mode a 6 px square); a preview tab has an italic
  label (F3-634); a tab that opened in the background shows a 6 px hollow square until the user
  activates it; a terminal whose last command failed shows the exit code after its label in the
  error colour; a tab an agent is using shows the 7 px square agent mark and its hover tag names the
  agent; a running process uses F3-658's working glyph with its look and Reduced Motion treatment.
  Every state mark comes from that shared set and its priority rule, no tab invents its own, and
  every mark is also in the tab's accessible name. Terminal tabs show no colour or icon of the
  person's choosing on the strip (D34, DL-187): Jared asked for terminal tab colours and icons to be
  redesigned within Puppet Master's neon glyph system, and F3-658 now supplies that shared redesign
  (F3-449, F3-640); this does not enable user-selected tab colors or icons. The close target is 24 x
  24 px with a 12 px glyph; it is hidden on inactive tabs narrower than 96 px, where a middle click
  and Delete still close. The "+" (F3-632) is 28 x 28 px, right after the last visible tab. "+N" is
  plain text in the strip's own type ("+7"; Retro "[+7]"; NieR Mode small caps after a hairline),
  never a badge. The strip is an ARIA tablist: arrows move between tabs, Home and End go to the
  ends, Enter or Space activates, Delete closes, and Shift+F10 opens the tab menu. The tab menu
  holds, in order, Close, Close others, Close to the right, Keep open (on a preview tab), Pin or Unpin, Rename...,
  Move to new panel, Move to panel, and Split right or Split down with this tab, each one command
  (cmd.panel_tab.close, keep, pin, unpin, rename, move; amended 2026-10-17, DL-228: Close others and Close to the
  right added, and this unit holds the rows and their order). A kind may add rows of its own at the end of the tab menu, after a
  hairline, through its registration (F3-635): the terminal adds Mute notifications (F3-641). A
  kind's rows do what that kind registers for them, which need not be a command: Mute notifications
  is the typed local action ui.terminal.mute_notifications (F3-640). Rename sets a user label that
  the kind's own label no longer overrides; an empty name gives the kind's label back. Activating a
  tab is view state (ui.panel_tab.activate), with no receipt and no event. A tab label never shows
  an internal id. Tabs and strip buttons consume F3-465's shared small-control marker; dividers
  consume F3-657's resize feedback. This unit supersedes the editor-and-dashboard scope of F3-505,
  the editor-only strip rules of F3-421, the dashboard's own Main, Metrics and Monitoring strip, and
  Basic's 2 px accent crown strip on the active tab. F3-658 supersedes the former square agent and
  static busy substitutes where a shared mark now applies; the unsaved/preview/background-open
  placements and accessible state names remain. The approved shared status vocabulary uses one mark
  slot. A working mark is shown only while its tab is offscreen; news clears when that tab is first
  shown. F3-658 owns shape, priority, tone and still/one-shot motion. These are canonical lifecycle
  rules, while Home strip adoption is explicitly deferred in the glyph landing. Move to panel and
  kind submenus use F3-632's one level/Back contract.
  Amended 2026-10-16 (DL-214; Jared's 2026-10-15 panel items 4 and 5): the active tab's mark is the look's
  switcher chip of F3-652, drawn in place without a travelling lens: exactly the tab's own box, standing
  on the panel's top rule (Retro's phosphor line, NieR's ink line) without covering it, at every tab size
  and width and on a folded panel's column. It replaces the fused plate and the per-look crown, shoulder
  and flare silhouette as the mark of the active tab; Retro's chip replaces its notched tab, as Jared
  chose over the notch. A chosen tab's close control and status read in the chip's ink, an exit status on
  a light look's tinted chip deepened toward that ink.
  Amended 2026-10-17 (DL-228): a locked panel shows a small lock mark in its strip (hover tag "Locked", "Files
  open in other panels"), and a collapsed panel shows an Expand control ("Show this panel at its size again").
  The strip controls are named New tab or panel ("+", its detail naming Ctrl+Shift+Space for the menu and
  Alt+T or Ctrl+T for a new tab of the panel's usual kind), Panel options, Move panel ("drag, or Enter then
  arrows") and Expand panel; "+N" is named "N more tabs" with the detail "List the tabs that do not fit". A
  tab's hover tag is the file's name, then "In <folder>" and its marks in words, or the tab's title, with the
  agent's name while one drives it, and keeps paths literally (F3-523). Until the deferred Home glyph adoption
  (DL-208) the marks above are the interim: the 7 px dirty dot, the 6 px hollow square and the 7 px square
  agent mark then give way to F3-658's change-modified mark in the close slot, news and the agent-driving and
  agent-cursor marks.
gui_related: true
gui_classification_reason: Defines the one tab strip every panel uses, its silhouette, widths, marks, reorder and keyboard.
split_recommended: false
depends_on: [DL-180, DL-187, DL-141, F3-505, F3-421, F3-585, F3-630, F3-635]
unblocks: [F3-633, F3-647, DR-065, UCC-200, ATS-075]
acceptance_criteria:
  - "Every panel, the dashboard's included, renders the same 35 px strip with 31 px tabs, 8 px apart (2 px in Retro)."
  - "The active tab is the look's seated chip (DL-214): exactly the tab's own box, standing on the panel's top rule without covering it, at every tab size and on a folded column, the chosen tab's close and status in the chip's ink; no underline, accent line, crown strip or pill marks the active tab in any look (amended 2026-10-17, DL-228; it read: the active tab and its body form one shape through the silhouette)."
  - "The contact morph and the crown, shoulder and flare radii listed here no longer mark the active tab; the seated chip does (DL-214; amended 2026-10-17, DL-228)."
  - "Reorder starts after 4 px, the silhouette tracks the carried tab in the same frame, widths do not reflow while carrying, and a changed release commits one cmd.panel_tab.move in every strip."
  - "Under Retro the three effects rotate from a shuffle bag with no immediate repeat on selection and reorder in every strip, and Reduced Motion shows the end state at once."
  - "Tabs are 96-200 px, then 72 px, then 36 px icons; the active tab keeps at least 120 px and its label and never hides; a contiguous window around it stays visible; shrunk file names keep both ends."
  - "Pinned tabs are 36 px, icon only, leftmost and never hidden; pin and unpin are reachable only from the tab menu."
  - "The dirty dot, italic preview label, hollow square, exit code, agent mark and busy glyph render as stated, come from the one status set, and are announced in the tab's accessible name."
  - "Close targets are 24 x 24 px and hidden on inactive tabs under 96 px, where middle click and Delete still close."
  - "The strip is an ARIA tablist with arrows, Home, End, Enter, Space, Delete and Shift+F10, and the tab menu's own rows (Close, Close others, Close to the right, Keep open, Pin or Unpin, Rename..., Move to new panel, Move to panel, Split right or Split down) each dispatch one command; a kind's rows after the hairline do what that kind registers, and the terminal's Mute notifications is the typed local action ui.terminal.mute_notifications, with no command (amended 2026-10-10, DL-187, D38: the criterion that every row of the tab menu dispatches one command now covers the menu's own rows only)."
  - "No terminal tab shows a colour or an icon the person chose; a kind's own tab-menu rows come last, after a hairline."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-180
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D5, D21, D23)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md,
  SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md,
  SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/proposal-visual.html, SHA-256
  52dd51521a1266e39a2ab6b274176d89666baaaacb1d933e5cc2237c151ab981 (the agreed anatomy; concept lineage
  only)
- Concepts/home-redesign on branch concept/home-panels-20261009 at 1565156bce (concept lineage only)
- Plans/Decision_Log.md#DL-187
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md,
  SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D34)
- '/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-2.md,
  SHA-256 1eecc96b03a1a774f52d06420c913553d5f5d1917e1bd5705e2f6e0bbc11fad6 (D29: the 8 px gap and Glass
  dark''s plate)'
- 'Concepts/home-redesign/CONTRACT.md at c4e32ec0b7 on branch concept/home-panels-20261009, SHA-256 8b1222cde3bb53a6ce534f5e436cc20b8829a230612b9e38654f5174e8d013b9
  (section 3, `tabMenu`: the tab-menu rows a kind adds after a hairline; concept lineage only)'
- /mnt/Cursor/share/puppet-master/2026-10-10-glyph-catalog-addendum/README.md, SHA-256 3d0497f01c878e8aa6f99fa8f602b9b3dbf887aead2a24d62c12969bd47a1d31
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-glyph-rollout-landing--LANDING.md,
  SHA-256 9bd8e1ed3deb6d61e516a42f0f524a36639ee098f7ce7496cb50434c9ca4ce90 (source lineage; not native
  certification)
preserved_exact_tokens:
  - "35 px"
  - "31 px"
  - "8 px"
  - "96"
  - "200"
  - "72"
  - "36"
  - "120"
  - "+N"
  - "Strips shortened: editor 40 -> 35px"
  - "cmd.panel_tab.move"
  - "ui.panel_tab.activate"
negative_constraints:
  - "Do not mark the active tab with an underline, an accent line, a crown strip, a pill or a separately coloured plate."
  - "Do not give any panel or tab kind a strip of its own."
  - "Do not scroll a strip sideways or wrap it onto a second row."
  - "Do not draw a spinner in Retro or NieR Mode, or invent a status mark outside the one status set."
  - "Do not show an internal id in a tab label."
compatibility_only_notes:
  - "Slint portability: the split tree, the strip, the silhouette and every gesture are projections over the Rust-owned layout model (F3-HOME-005); the concept's DOM and CSS mechanics are not the product mechanism."
stale_retired_dispositions:
  - "Amended 2026-10-10 (DL-187, D34): Terminal tabs show no colour or icon of the person's choosing until the neon glyph system redesigns them; a kind may add its own rows at the end of the tab menu after a hairline (the terminal's Mute notifications)."
  - "Amended 2026-10-10 (DL-187, D38): only the tab menu's own rows each dispatch one command; a kind's rows do what the kind registers, and the terminal's Mute notifications is the typed local action ui.terminal.mute_notifications."
  - 'Amended 2026-10-16 (DL-214): the active tab''s mark is the look''s switcher chip standing on the
    panel''s rule; the fused plate and silhouette, and Retro''s notch, retire as that mark.'
owner_hints:
  - Plans/FinalGUISpec.md

```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-505, ContractName:Plans/FinalGUISpec.md#F3-585, ContractName:Plans/DRY_Rules.md#DR-065, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/Decision_Log.md#DL-187, ContractName:Plans/FinalGUISpec.md#F3-449

### F3-632 — The "+" Menu And The Empty Panel

```yaml
plan_unit_id: F3-632
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The "+" right after the last tab of every strip opens the "+" menu; it never makes a tab by itself
  (DL-180, D6). Ctrl+Shift+Space opens it from the keyboard. Each row's body opens its item as a new
  tab in this panel; the row's trailing cell, 34 x 34 px, opens it as a new panel placed by the fit
  rule (F3-630), and Alt+click or Alt+Enter on the row does the same. Ctrl+T (Alt+T in a web
  browser, F3-635) makes a new tab of the panel's usual kind without the menu: the panel's dedicated
  kind, else its active tab's kind, else an editor buffer. The rows, in this order: a type-to-filter
  field, "Open anything: kinds, files, URLs", focused when the menu opens, whose typing also finds
  files and an address; Terminal (Ctrl+Shift+`), with a sub-row of every shell installed on the
  computer, from the terminal kind (F3-640, D39); when the terminal kind knows SSH hosts, the row
  SSH hosts, right under Terminal; Browser (Ctrl+Shift+B), with a sub-row of recent addresses;
  File... (Ctrl+P), with the three most recent files inline, each clickable; Dashboard, with inline
  sub-row links Home, Metrics, Monitoring, Agents and New dashboard, then one Your dashboards row
  when this project has custom dashboards, opening a submenu of them by name with the widget count
  on the second line and a search field above 7 entries (F3-638); Plan or document...; Artifact...;
  one row "Output, Problems, Ports, Debug Console" whose submenu lists those four tool kinds; a
  hairline; Split right (Ctrl+\); Split down (Ctrl+Shift+\); Reopen closed tab (Ctrl+Shift+T,
  Alt+Shift+T in a web browser). Kinds join the menu through their registration (F3-635) in this
  order, and every row shows the shortcut that works where the app runs. A sub-row lists all of its
  kind's entries unless the kind caps its own; the Terminal row lists every installed shell (D39).
  SSH hosts opens a submenu with one row per host, its host name and, as the second line, user@host;
  a host row's body opens that host in this panel and its trailing cell in a new panel, and the
  submenu has a filter field of its own once it holds more than 7 hosts. Typing in the menu's field
  also lists the hosts themselves ("SSH host · <detail>"), found by name or detail, and Enter opens
  one. Recent files open as kept tabs (F3-634). A row that cannot act is shown disabled with its
  reason on the row (Split right where the centre is too narrow to split, Reopen closed tab when
  nothing has been closed). Opening, filtering, browsing and closing the menu dispatch nothing; the
  chosen row dispatches its one open or split command (cmd.panel_tab.open,
  cmd.workspace_layout.split, cmd.panel_tab.reopen_closed). The menu opens in the one overlay root
  (DR-067) in the look's menu style (F3-647). An empty panel (the only panel in the centre, or a
  locked panel whose last tab closed) shows the same rows as a launcher: 32 px full-width list rows
  with the kind's icon, its label and its shortcut, no tiles and no pills, each row's sub-row under
  it as a line of links whose text starts 32 px in from the row's edge (hidden in a panel under 360
  px wide), the SSH hosts row opening its submenu from the row, then the five most recent files,
  then a one-line hint. A sub-row that wraps never starts its new line with a separator dot. The
  menu and the launcher read one row list, so a kind that joins one joins the other. This supersedes
  F3-HOME-003's and F3-502's Open Panel and Open Browser in Panel rows with their Panel 1 to Panel 4
  flyouts. The Output row opens or reveals `output`, the one Output tab whose channel switches
  inside it (F3-635). The Dashboard row body opens or reveals dashboard:home; its sub-rows open or
  reveal that dashboard, and New dashboard makes a new, empty custom dashboard (D35, DL-186;
  F3-638). A picker reached from a kind row opens as the next level in the same menu plate. Every
  nested level has a visible Back control named Back to <previous level>, restoring that level's
  query, filtered rows, scroll and focus on the originating row without opening a tab or panel. This
  covers File, Plan or document, Artifact, tools, SSH hosts, Your dashboards, and existing panel/tab
  submenus including Show all tabs. A picker entered from the empty launcher has Back to the empty
  panel and returns focus to its invoking row; a standalone Ctrl+P picker starts at its root with no
  Back. Escape returns one level, then closes at the root. A fresh Backspace in an empty search goes
  back; holding Backspace to erase a query never also goes back. Backspace on a row erases the
  query's last character first. Left outside the field goes back. Outside click, Tab, or clicking +
  again closes the whole menu; the + origin regains focus on root dismissal. Arrow order is Back,
  search, rows; Enter or Space activates Back. The plate and Filter field expose the current level's
  title to assistive technology. Rows scroll inside the plate while Back, title, search and footer
  remain in place. F3-647 owns the per-look level exchange and Back drawing; F3-635 records its
  keyboard map. The plate is named New tab or panel at its + root, the Back control Back to <level>,
  the field Filter: <title>, and the Back hover detail Esc or Backspace (Esc or Delete on a Mac).
  This is view-local navigation with no saved level stack, command, receipt or event; only a final
  item choice uses the existing open command.
  Amended 2026-10-17 (DL-228): the empty-panel launcher is titled "Open something here" and its hint reads
  "Drop a tab here, or press Ctrl+Shift+Space for more." A panel too short for the list, below about 200 px of
  body, shows one line instead: "Empty panel. Ctrl+Shift+Space opens the menu." Each launcher row's picker
  opens with the launcher as its level before, so Back returns to the row. An empty panel's whole body is one
  Join target for a carried tab. Reopen closed tab reopens the most recent entry whose tab is not open,
  skipping and dropping stale entries; it returns into its own panel at its own position while that panel
  exists, otherwise into the focused panel, as a kept tab with its live marks cleared, and announces "<label>
  reopened" or "No closed tab to reopen"; a terminal comes back as a new session (SMPFS-180); opening a tab by
  any route removes its entries from the stack.
gui_related: true
gui_classification_reason: Defines the plus menu after the last tab and the empty-panel launcher.
split_recommended: false
depends_on: [DL-180, DL-186, DL-187, F3-630, F3-631, F3-634, F3-635]
unblocks: [UCC-200, WM-090, PWIZ-035, ATS-075]
acceptance_criteria:
- The "+" opens the menu and never creates a tab by itself; Ctrl+T creates a tab of the panel's usual
  kind.
- 'The menu lists exactly, in order: the filter field, Terminal, SSH hosts (only when the terminal kind
  knows hosts), Browser, File..., Dashboard, Plan or document..., Artifact..., the one Output, Problems,
  Ports, Debug Console row with its submenu, a hairline, Split right, Split down, Reopen closed tab, with
  the shortcuts and sub-rows stated here.'
- A row's body opens a new tab in this panel; its 34 x 34 px trailing cell, Alt+click or Alt+Enter opens
  a new panel by the fit rule.
- Opening and browsing the menu dispatch nothing; each chosen row dispatches one command; disabled rows
  show their reason.
- An empty panel shows the same rows as 32 px full-width list rows, then five recent files, then a hint,
  with no tiles and no pills.
- No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build
  tasks are created by this unit.
- The Output row opens or reveals output and never makes output:<channel>; a reveal leaves its tab where
  it is.
- The Terminal row's sub-row lists every installed shell; with SSH hosts known, an SSH hosts row right
  under Terminal opens a submenu of the hosts (a filter field above 7), whose row body opens a host here
  and trailing cell in a new panel, and typing in the menu's field finds a host by name or detail.
- The Dashboard sub-row has Home, Metrics, Monitoring, Agents and New dashboard inline; this project's
  custom dashboards appear by name and widget count in one Your dashboards submenu, with search above
  7; New dashboard makes a new empty dashboard.
- The empty-panel launcher shows each row's sub-row as a line of links under it, hidden under 360 px of
  panel width, and no wrapped sub-row starts with a separator dot.
- From + > Plan or document, Back returns to the kind list with that row focused, the picker open and
  nothing added; the same holds for all nested kinds and both new-panel entry paths.
- Query, filtered rows and scroll survive Back; empty-search key handling, standalone Ctrl+P, launcher
  return, outside click, Tab and + toggle obey the same level engine.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-2.md,
  SHA-256 1eecc96b03a1a774f52d06420c913553d5f5d1917e1bd5705e2f6e0bbc11fad6 (D31)
- Plans/Decision_Log.md#DL-180
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D6)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md,
  SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md,
  SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/proposal-visual.html, SHA-256
  52dd51521a1266e39a2ab6b274176d89666baaaacb1d933e5cc2237c151ab981 (the agreed anatomy; concept lineage
  only)
- Concepts/home-redesign/src/panels/js/38-menus.js on branch concept/home-panels-20261009 at 1565156bce
  (the disabled Split and Reopen closed tab rows with their reasons; concept lineage only)
- Plans/Decision_Log.md#DL-186
- Plans/Decision_Log.md#DL-187
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md,
  SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D35, D39)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/panels-NUMBERS-339203bd76.md,
  SHA-256 2e2c2a95819842cd5cbcc108ed302460ddea3ed0a98be7dfe4f1b78507660ce6 (the "+" menu; concept lineage
  only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/panels-CONTRACT-339203bd76.md,
  SHA-256 6937e47dd9e63466f9c17653bf54f2a70583efbde7270d8cf9609a1920150165 (sections 3 and 7; concept
  lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/terminal-SPEC-01c5e78c42.md,
  SHA-256 a0723f6663990723fc8bd879610c8dedcf2ef6b19a467a2d5c1e1c6d183aabfc (section 1, the "+" menu row;
  concept lineage only)
- Concepts/home-redesign/NUMBERS.md at c4e32ec0b7 on branch concept/home-panels-20261009 (SHA-256 77e9c04c23959812da6799a54708c487fcb2f33f342219a1c79dae9c396614d7;
  the Dashboard sub-row as built; concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-NUMBERS-51c316e18b.md,
  SHA-256 a9c42b88e5cb50706ff1716a254cb68e026a538bb7a0c840905779a9a482cff2 (small-round concept lineage
  only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-CONTRACT-2926ad987e.md,
  SHA-256 c579d0dfef41fd1fc7327d14c2adb9e2b101c24b216ff64a9db5fc19895ad989 (small-round concept lineage
  only)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-panels-picker-back--NOTES.md,
  SHA-256 29bac44f166cb8e0e67f4f00634cb15d0a3be576eb2f68e7e19606f3a4a1a71c (source lineage; not native
  certification)
preserved_exact_tokens:
  - "output"
  - "Open anything: kinds, files, URLs"
  - "Terminal"
  - "Browser"
  - "File..."
  - "Dashboard"
  - "Plan or document..."
  - "Artifact..."
  - "Output, Problems, Ports, Debug Console"
  - "Split right"
  - "Split down"
  - "Reopen closed tab"
  - "SSH hosts"
  - "New dashboard"
  - "34 x 34"
  - "32 px"
negative_constraints:
  - "Do not make the \"+\" create a default tab."
  - "Do not draw the launcher as tiles or pills, or keep a second row list for it."
  - "Do not dispatch anything when the menu opens, filters or closes."
compatibility_only_notes:
  - "The contract's Split down shortcut Ctrl+K Ctrl+\\ is retired: the shell owns Ctrl+K, and Split down is Ctrl+Shift+\\ (F3-635)."
stale_retired_dispositions:
  - "Amended 2026-10-10 (D31, DL-180): Output uses one tab with its channel as view state; only an explicit channel split-off uses output:<channel>."
  - "Amended 2026-10-10 (lead ruling L10): The Dashboard row and sub-rows open or reveal the starting boards without creating, renaming or deleting boards."
  - "Amended 2026-10-10 (DL-187, D39): The Terminal row lists every installed shell, SSH hosts get their own submenu row under it, the field finds hosts, and the launcher shows each row's sub-row as links."
  - "Amended 2026-10-10 (DL-186, D35): The Dashboard sub-row adds this project's custom dashboards and New dashboard; L10's interim rule that no board is created, renamed or deleted is answered."
  - "Amended 2026-10-11 (wave 2, panels NUMBERS 51c316e18b): The Dashboard sub-row groups this project's custom dashboards under Your dashboards."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/Decision_Log.md#DL-186, ContractName:Plans/Decision_Log.md#DL-187, ContractName:Plans/FinalGUISpec.md#F3-638, ContractName:Plans/FinalGUISpec.md#F3-640

### F3-633 — The "+N" List Of Hidden Tabs

```yaml
plan_unit_id: F3-633
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  When a strip cannot show every tab after the width cascade of F3-631, a plain-text "+N" after the
  last visible tab counts only the hidden tabs and opens the "+N" list (DL-180, D5). It is in every
  strip, the dashboard's included, and works in the narrowest panel (280 px). The list opens in the
  one overlay root (DR-067), with a search field at the top, focused, and the panel's tabs grouped
  by kind under each kind's group name (F3-635); each row shows the kind's icon, the label, a dim
  path or address, its marks (F3-631) and a 24 x 24 px close target. Arrows move, Enter activates
  the tab and brings it into the visible window, Delete closes it, and Escape closes the list with
  focus back on "+N". Its accessible name says how many tabs are hidden (the concept's wording, for
  example "7 more tabs", is illustrative). While a tab is carried, "+N" is a drop target that takes
  the tab into this panel among its hidden tabs. Ctrl+Shift+A opens the same searchable list over
  every tab in the centre. A strip never scrolls sideways, never wraps onto a second row and never
  hides its active tab. Opening, searching and closing the list dispatch nothing; choosing a row is
  view state (ui.panel_tab.activate), and closing or moving a tab from it is one command. This
  supersedes F3-421's editor-only "+N more" chip and its picker, and F3-445's sideways-scrolling
  recipe for home strips; page tabs keep their own owner (F3-464) and the left rail's strips keep
  F3-620's fit. Show all tabs in this panel is a level of the panel menu under F3-632, with the same
  Back restoration and fixed head/search/footer; this does not change the +N or tab selection owner.
gui_related: true
gui_classification_reason: Defines the plain-text +N control and the searchable list of tabs that do not fit a strip.
split_recommended: false
depends_on: [DL-180, F3-631, F3-421, F3-445]
unblocks: [UCC-200, ATS-075]
acceptance_criteria:
  - "Every strip whose tabs do not fit after the width cascade shows a plain-text \"+N\" counting only hidden tabs, with no badge or capsule."
  - "The list is searchable, grouped by kind, shows marks and per-row close, and is fully operable by keyboard with focus returning to \"+N\" on Escape."
  - "\"+N\" accepts a carried tab as a drop target."
  - "Ctrl+Shift+A opens the list over every tab in the centre."
  - "No home strip scrolls sideways or wraps, and the active tab is never in the hidden set."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-180
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D5)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md,
  SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md,
  SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/proposal-visual.html, SHA-256
  52dd51521a1266e39a2ab6b274176d89666baaaacb1d933e5cc2237c151ab981 (the agreed anatomy; concept lineage
  only)
- Concepts/home-redesign/src/panels/js/32-strip.js on branch concept/home-panels-20261009 at 1565156bce
  (the "+N" accessible name; concept lineage only)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-panels-picker-back--NOTES.md,
  SHA-256 29bac44f166cb8e0e67f4f00634cb15d0a3be576eb2f68e7e19606f3a4a1a71c (source lineage; not native
  certification)
preserved_exact_tokens:
  - "+N"
  - "+7"
  - "[+7]"
negative_constraints:
  - "Do not draw \"+N\" as a badge, pill or chip."
  - "Do not scroll a home strip sideways or hide its active tab."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-631, ContractName:Plans/FinalGUISpec.md#F3-421, ContractName:Plans/FinalGUISpec.md#F3-445

### F3-634 — Opening Things In Panels

```yaml
plan_unit_id: F3-634
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  One opening module places everything that opens in the home centre, for every caller (DL-180, D7, D8; DR-071): the
  file tree (F-090), file names and paths in chat messages and cards, the chat's diff views and Changes rows, transcript
  file records, search results, Ctrl+P, the "+" menu and the empty-panel launcher (F3-632), everything the chat and its
  wizards open, plans, run views, transcripts, context details, records, artifacts, browsers and terminals (ACD-500),
  agents, and the terminal's `path:line:col` links and command marks (F3-641). No caller keeps a placement or dedupe
  rule of its own. Every open route carries the one placement field set, `where`, `mode`, `by` and `background`
  (Plans/Contracts_V0.md#CV-360); cmd.file.open, cmd.nav.open_subject, cmd.browser.open_workspace_preview and
  cmd.terminal.open keep their ids and resolve through this module like cmd.panel_tab.open. The rules, in order. One id,
  one tab: an id already open anywhere in the workspace is revealed where it is, activated in its panel, pulled out of
  the "+N" list into the visible window, its collapsed panel expanded, and focused when the open takes focus; it is
  never opened twice and never moved, and a reveal commits nothing and emits nothing. A kind may map alias ids to one
  canonical tab id, so a plan's query form and its plan id open one tab. Preview: a single click on any file reference a
  person clicks (the file tree, chat file references, diff views and Changes rows, transcript file records, search
  results, terminal links) opens the panel's one preview tab, with an italic label, which the next single click
  replaces; a double click, an edit in the tab, or dragging the tab keeps it (cmd.panel_tab.keep). Ctrl+P with Enter,
  the "+" menu's recent files and every file an agent opens open kept tabs. Placement of a new tab: a document kind goes
  to the last-focused panel that holds documents; panels holding only dedicated kinds (terminals, browsers, dashboards,
  tool kinds) and locked panels are skipped. A terminal, browser or dashboard goes to the last-focused panel already
  holding that kind, else the last-focused document panel. A tool kind (Output (one tab; its channel switches inside it), Problems, Ports, Debug Console) goes to
  the last-focused panel holding that kind, then to the last-focused panel holding a terminal, then to the last-focused
  document panel, so tools land beside the terminals. With no such panel, a new panel by the fit rule (F3-630).
  Alt+click anywhere opens a new panel by the fit rule; an open may also ask for the panel it came from or a split of it
  to the right or below. Focus: what the user clicked, in the chat or anywhere else, opens and takes focus. What an
  agent opened by itself lands as a background tab with the 6 px hollow square (F3-631) and a polite announcement naming
  it; it never takes keyboard focus and never changes the active tab of a panel the user is typing in. A background open
  requested by the user opens without taking focus. Narrow centre: below a centre width of 600 px no new panel is
  created; an open that asks for a new panel or a split opens in the next panel of the panel switcher instead and its
  announcement says so (F3-636); a reveal needs no room and works at every width. The kinds and their ids are F3-635's,
  the placement fields CV-360's, the file tree's single and double click F-090's, and what the chat opens and how its
  narrow return works ACD-500's. This supersedes the per-caller open rules for Home: F3-HOME-003's Open Panel and Open
  Browser in Panel targets, section 7.3's bottom_panel destination class, the "left editor tab
  bar" of APR-036 to APR-038, the "beside the chat" wording of F3-569, and, through F-090, F-080's four-panel routing.
  Opening an Output channel from anywhere switches the `output` tab to that channel, or focuses a split-off tab
  already showing it. With no Output tab, the opening module opens `output` by the tools rule above, beside the
  terminals. The channel picker's "Open in new tab" alone splits off `output:<channel>` (F3-635).
  Amended 2026-10-17 (DL-228): an open is never refused for lack of room. When the fit rule finds no side for
  a new panel (Alt+click, or an open that asks for a panel), the tab opens in the largest unlocked panel and
  says so; an explicit split (Split right or down, Move to new panel, a drop) is refused with its reason
  instead (F3-630). Announcements: "<label> opened in a new panel", "<label> opened here: there is not room
  for a new panel", "<label> opened in the next panel: the window is too narrow for a new panel", "Opened in
  the background: <label>" and "<agent> opened <label>".
gui_related: true
gui_classification_reason: Defines the one set of rules that decides where anything opened in the home centre lands and whether it takes focus.
split_recommended: false
depends_on: [DL-180, F3-630, F3-631, F3-635, F3-636]
unblocks: [CV-360, F-090, ACD-500, DR-071, UCC-200, WM-090, ATS-075]
acceptance_criteria:
  - "Every caller listed here opens through the one module with the one placement field set, and no caller has its own placement or dedupe rule."
  - "Opening an id that is already open anywhere reveals that tab where it is (activating it, pulling it out of \"+N\", expanding its collapsed panel) and never opens a second tab or moves it; a reveal emits no event."
  - "A single click on a file reference from any listed surface opens the panel's one italic preview tab, which the next single click replaces; a double click, an edit or a drag keeps it; Ctrl+P with Enter, recent files and agent opens are kept."
  - "A new document lands in the last-focused document panel, skipping dedicated-only and locked panels; a terminal, browser or dashboard in the last-focused panel holding that kind; a tool kind beside the terminals; else a new panel by the fit rule."
  - "Alt+click opens a new panel by the fit rule from any caller."
  - "A user click opens with focus; an agent's open lands in the background with the hollow square and an announcement, never takes keyboard focus and never changes the active tab of a panel the user is typing in."
  - "Below a centre width of 600 px no new panel is created and the announcement says where the item opened."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
  - "A channel opened from anywhere switches output or focuses a split-off tab already showing it; with no Output tab it opens output by the tools rule beside the terminals."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/FileManager.md
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-2.md, SHA-256 1eecc96b03a1a774f52d06420c913553d5f5d1917e1bd5705e2f6e0bbc11fad6 (D31)"
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D7, D8)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md, SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/chat56-audit.md, SHA-256 6d1563bd1776860739e6be272b191c419aba3c38b9dd9fe8ba44fd1ebb3231b5 (sections 9 and 10; audit lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md, SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8 (audit lineage only)"
preserved_exact_tokens:
  - "Open in new tab"
  - "output:<channel>"
  - "output"
  - "where"
  - "mode"
  - "by"
  - "background"
  - "cmd.panel_tab.open"
  - "cmd.panel_tab.keep"
  - "cmd.file.open"
  - "cmd.nav.open_subject"
  - "cmd.browser.open_workspace_preview"
  - "cmd.terminal.open"
  - "path:line:col"
negative_constraints:
  - "Do not give any caller its own placement or dedupe rule."
  - "Do not open an already-open id a second time or move its tab."
  - "Do not let an agent's open take keyboard focus or change the active tab of a panel the user is typing in."
  - "Do not create a new panel below a centre width of 600 px."
compatibility_only_notes:
  - "The concept names its module PM_HOME.open and its chat bridge openEditor; those names are concept lineage, not product names."
stale_retired_dispositions:
  - "Amended 2026-10-10 (D31, DL-180): Output uses one tab with its channel as view state; only an explicit channel split-off uses output:<channel>."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
  - Plans/FileManager.md
  - Plans/assistant-chat-design.md
  - Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Contracts_V0.md#CV-360, ContractName:Plans/FileManager.md#F-090, ContractName:Plans/assistant-chat-design.md#ACD-500, ContractName:Plans/DRY_Rules.md#DR-071

### F3-635 — Tab Kinds, The Host Contract And The Keys

```yaml
plan_unit_id: F3-635
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Every tab in the home centre is one of fifteen kinds (DL-180, D9), each registered once, with its
  tab id prefixes: editor (`file:<path>`, `buffer:<n>`; a diff mode and preview tabs; F3-639);
  terminal (`terminal:<session>`, one session per tab, the session id minted by the terminal kind;
  F3-640, SMPFS-180); browser (`browser:<n>`, and `link:` for a page the chat fetched; DevTools
  docked inside it and the capture toolbar); dashboard (`dashboard:<board_id>`, `dashboard:home` the
  pinned Home dashboard; F3-638); plan (`plan:<id>`, the plan query form and `deep-discovery:<run>`;
  the plan viewer with its sticky Build, Revise and More footer); document (`teach:`, `memory:`,
  `revert:`, `debug:`, `lens-source:`, `lens-effective:`, `wonderer:`, `wonder-source:`,
  `doc:<path>`: rules, memory, revert, debug investigation, lens source, wonderer); artifact
  (`artifact:<artifact_id>`, `artifact:<artifact_id>@v<n>` and the chat's artifact ids; a subtype
  per artifact kind, versioned; RAP-065); run (`collab-run:`, `crew-work:`, `review:`, `room:`,
  `brainstorm:`, `review-evidence:`, `brainstorm-evidence:`: Crew, Review, Chat Room, BrainStorm and
  their evidence); transcript (`thread-<agentId>`: an agent's read-only live feed); context
  (`context:<threadId>`: thread-keyed context detail); record (`search:`, `mcp:`, `app:`,
  `work-record:`: read-only records); output (`output`, one Output tab whose channel switches inside
  it; `output:<channel>` only for a channel split off with "Open in new tab", showing only that
  channel); problems (`problems`); ports (`ports`); and debug_console (`debug-console`, one Debug
  Console tab with a sub-tab per debug session, the session shown being its view state; F3-490). The
  document kinds are editor, plan, document, artifact, run, transcript, context and record;
  terminal, browser, dashboard and the four tool kinds output, problems, ports and debug_console are
  dedicated; a panel holding only tool kinds and terminals has the role tools. Problems, Ports and
  the Debug Console are one tab each per workspace. Never a kind: the chat's Goal tab (DL-147),
  Activity Detail (it stays inside the chat, F3-637), the chat's lab-only workspaces, and wand setup
  sheets (they stay app modals). A tab id is opaque and stable, its prefix names its kind, and one
  id is one tab in the whole workspace; an id with an unknown prefix opens nothing, and two kinds
  claiming one prefix is a start-up error. Tab identity is separate from domain identity: the path,
  terminal_session_id, board id or artifact id a tab shows is its domain reference, and moving,
  collapsing, maximizing, hiding or restoring a tab never changes it. No internal id (tab, panel,
  session, nonce) ever appears as text in the interface. Older canon that names one of these
  surfaces by its former host means the kind here, placed by F3-634: the run view called an editor
  document (ACD-480, F3-569, F3-576 and the 2026-09-03 redesign's section 10) is a run tab,
  ACD-485's subagent transcript a transcript tab, the context-detail editor tab (section 7.16.1,
  F3-132) a context tab, the Plan card's "normal artifact viewer" and an artifact opened from
  section 7.12 an artifact tab (RAP-065), the Your rules document (F3-579) a document tab, and
  F3-297's editor-tab Browser a browser tab. Each kind registers its label, its group name for the
  "+N" list, its icon (a bundled SVG icon_id, never an emoji), its id prefixes, its content minimum,
  whether it is dedicated, its "+" menu row and sub-row, how it makes a tab id for an open (the
  terminal mints a new session), the older id forms it folds into one tab, the rows it adds to the
  tab menu (F3-631), how it mounts, what it serializes and whether a tab may close now. Content
  minimums: terminal 320 x 120 px, browser 360 x 200, dashboard 320 x 120, run 360 x 200, plan,
  document, artifact, transcript and context 280 x 160, and editor, record and tools 280 x 120. The
  host mounts a tab's body only when the tab is first shown, so a restored background tab costs
  nothing until it is opened. A kind's serialized state is at most 16 KB of plain data, with no
  scrollback and no buffer text (Plans/storage-plan.md#SP-330); an untitled editor buffer's tab
  state carries only the title, language and edit or read-only state of F3-639 (amended 2026-10-10).
  Before a tab closes its kind may ask first: a dirty editor offers to save, and a running terminal
  says what will stop (F3-640). A tab body is its own box, sized by its panel: it never sizes
  against the window, only against its own width and height; it is told when they change, with a
  last call once a divider drag or a layout animation has settled so costly work can wait for it; it
  is told when it is shown, hidden, focused and blurred and when the look changes, and stops
  animation while hidden. Every kind that needs a row of controls above its content uses the one
  shared header row (D12): 30 px tall, 24 px targets, 12 px text and 11 px for secondary facts,
  labels when the body is at least 520 px wide and icons with hover tags below that, and the row
  hidden when the body is under 150 px tall; a kind draws a row of its own only when nothing in the
  shared one fits, and its owner unit says why. Menus, the "+" menu, the "+N" list, panel menus,
  drag ghosts and landing previews open in one overlay root (Plans/DRY_Rules.md#DR-067), one
  stacking order: panel content, then strips and dividers, then the overlay root, which sits above
  the status bar and below the Demo Studio's controls (F3-649), hover tags and the Guided Tour; no
  kind appends an overlay of its own. Keys: the shell owns Ctrl+1..9 and Ctrl+K, so the panels use
  neither and there are no Ctrl+K chords. In the desktop app: Ctrl+T a new tab of the panel's usual
  kind, Ctrl+W close the tab, Ctrl+Shift+T reopen the last closed tab, Ctrl+Tab and Ctrl+Shift+Tab
  step through recent tabs across panels and kinds (hold, step, release), Ctrl+Shift+Space the "+"
  menu, Ctrl+Shift+` a new terminal, Ctrl+Shift+B a new browser, Ctrl+P open a file, Ctrl+Shift+A
  every tab, Ctrl+PgDn and Ctrl+PgUp the next and previous tab in the panel, Alt+1..8 tab N and
  Alt+9 the last tab, Ctrl+Shift+PgUp and Ctrl+Shift+PgDn move the tab left and right, Alt+arrows
  focus the panel in that direction, Alt+Shift+1..9 focus panel N, Alt+Shift+arrows move the tab to
  the panel in that direction (splitting that way when there is none and it fits), F6 and Shift+F6
  cycle the rail, the panels and the chat composer, Ctrl+\ split right, Ctrl+Shift+\ split down,
  Shift+Escape maximize or restore (Escape also restores while focus is in a strip), Tab to a
  divider and then the divider keys (F3-630), the ARIA tab keys in a strip with Shift+F10 for the
  tab menu (F3-631), and Enter on a panel grip for Move panel. Pinning is in the tab menu only; no
  binding is a bare letter or digit; Escape closes only the innermost open thing (F3-568). The
  panels hold these keys while focus is in the centre; while focus is inside a tab body the kind is
  asked first, a terminal keeps the shell's keys and gives back the host keys F3-640 lists, and
  ordinary text inputs keep their own keys. Web-client mapping rule: in a web browser the chords the
  browser keeps, Ctrl+T, Ctrl+W, Ctrl+Shift+T, Ctrl+Tab and Ctrl+PgDn/PgUp, are answered as Alt+T,
  Alt+W, Alt+Shift+T, Alt+` (Alt+Shift+` backwards) and Alt+PgDn/PgUp (panels NUMBERS 6026fa8432,
  keyboard), and every label, menu shortcut and hover tag shows the key that works where the app
  runs. This supersedes F3-HOME-001's typed surface kinds and F3-152's terminal-and-browser-only tab
  identity, which now holds for every kind. The channel shown in `output` is view state, never part
  of its id (D31). The Output tab is labelled Output and a split-off channel tab Output · <Channel>;
  opening a channel from anywhere switches `output` to it (F3-634). The Debug Console is one tab,
  `debug-console`, with a sub-tab for each debug session (D33, DL-187); which session it shows is
  view state, with no command, saved with the tab (lead ruling F6), and an open that names a session
  reveals the tab and switches it to that session. An id of the earlier one-tab-per-session form,
  `debug-console:<session>`, folds into `debug-console` with that session shown wherever it appears:
  in an open, in a saved layout or a named layout, and in the reopen list. A tab's typing field,
  including the terminal input and the editor's IME field, passes the panels' navigation keys to the
  host once the tab declines the key: Alt+1..9, Alt+Shift+1..9, Alt+arrows, Alt+Shift+arrows,
  Alt+PgUp/PgDn in the web client (Ctrl+PgUp/PgDn in the desktop app), Ctrl+P, Ctrl+Shift+A and
  Alt+W on Windows and Linux. On a Mac, Option+letter and Option+backtick type text in fields and
  the editor, and never trigger the Alt stand-ins; a Dead key never triggers them on any platform.
  Keys during IME composition are ignored. F6 is handled before the tab's key claim and reaches the
  chat composer from every region. Browser and tool measurements: a browser body is at least 360 ×
  200 px. DevTools docks right at body widths of 900 px or more, otherwise below. Its right width
  defaults to 340 px, ranging from 240 px to min(60 % of body, body minus 200 px); below, its height
  defaults to 42 % and ranges from 25-70 %. Keyboard resize moves 8 px, or 48 px with Shift. Capture
  labels appear at 1100 px and session labels at 620 px; the shared icons-only step is below 520 px;
  below 480 px Full, Region, Select unless armed, and Forward move into More. The address field is
  at least 96 px. Load-line motion lasts 320 ms, 0 under Reduced Motion; shutter flash lasts 240 ms
  and is off under Reduced Motion. History is capped at 30 entries, 20 saved; captures at 24, 12
  saved; capture regions are at least 8 × 8 px. Browser saved view state includes URL,
  ordinary/protected session choice, DevTools visibility, details/DevTools/captures rail choice,
  elements/console/network/access tool choice, dock dimensions, history and index, ordinary URL,
  captures, page title and policy differences only. The agent-access policy has 14 rows: Navigation,
  Tabs and frames, Page structure and components, Styles, Console, Network, Source maps and files,
  Performance, Storage and cookies, Screenshots and recording, Form input, Downloads, Viewport and
  device sizes and Request simulation; rows cycle Off, Ask, On. Agent and browser introspection stay
  explicit opt-in (Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-092); this unit sets no row's
  default, which is the browser owner's to set and an open question for the lead until it does
  (amended 2026-10-10). Browser is the plus menu's order-20 kind, with Ctrl+Shift+B and
  recent-address sub-rows. The four tools each have a 280 × 120 px minimum and follow in plus order
  70/71/72/73. Output caps at 600 lines, turns Follow off beyond 24 px from the end, hides time
  below 520 px, and saves channel, follow and wrap. Its channel picker is 300 px wide, with a
  trailing Open in new tab cell; Alt+Enter opens the split-off tab and Alt+click a new panel. A
  split-off tab has a plain channel fact and More's Show in the Output tab. Problems rows are 28 px;
  source hides below 520 px and line/column and folder below 360 px; saved view state is
  error/warning/info visibility and collapsed files. Ports columns are 96 px / 1fr / 1.3fr / 140 px
  / 220 px; below 760 px Origin hides and actions become icon-only in 108 px; below 480 px rows
  stack; actions are 32 px and rows at least 44 px. Ports saves added and removed port numbers. Each
  Debug Console session keeps its own console, capped at 400 lines, its own state and its own frame;
  input history keeps 30 entries, 20 of them saved, and stays per session as F3-490 says; the input
  row is 34 px, and the tab saves the session shown and the history (amended 2026-10-10, DL-187,
  D33). Browser and Debug Console fields have one focus ring drawn by the header row, with no second
  field border, shadow or outline. The source's scripted Output preview begins after 700 ms, adds a
  line every 260-680 ms and pauses 1.8-5 s; Debug Console preview Continue re-hits at 1.9 s and
  Restart pauses at 1.7 s (60 ms under Reduced Motion). Those scripted timings describe preview
  presentation, not actual process or debugger completion. Plans and documents have 280 × 160 px
  content minima. The Plan or document... plus row is order 50. A plan's sticky footer uses 32 px
  controls in one row with 10 px vertical padding, a maximum 960 px inner column, 28 px sides or 16
  px below 720 px body width; Revise moves into More below 420 px and the footnote hides below 520
  px. Document frames have a maximum 960 px column, 24 px vertical and 28 px horizontal padding at
  720 px or wider, 16 px below; titles are 22 px, 18 px below 420 px; body text is 13/20 px,
  metadata 12/18 px and fine print 11.5/17 px, never below 11 px. Step marks use a 20 px column and
  16 px SVG marks; titles are 13/20 px at weight 600, body 12.5/19 px, metadata 12/18 px and code
  ids 11.5 px; children indent 32 px. Step file rows use the final 32 px reference height and shift
  left 6 px, with top margin 2 px, bottom margin -4 px and gaps 0 vertically/8 px horizontally;
  Revert file marks and state use 8 px top padding. Tables have a 440 px minimum width, horizontal
  scroll below it, and 7 × 12 px cell padding. Markdown uses 12 px code text at line height 1.65, a
  14 px rail and 6 px state dots, with blank lines between blocks. Embed previews are 320 × about
  116 px at natural size and scroll sideways below that, with 11 px tick text. Memory panes are side
  by side from 720 px, with a 300 px list and 28 px gap, stacked with Back below that. Debug phases
  are 4 columns from 640 px, 2 below and 1 below 340 px; debug arguments and Revert file state move
  below their primary row below 520 px. Wonderer has an aside from 900 px and a top hairline below.
  Document text actions are 32 px, 24 px inline; frame button radii cap at 8 px. View state saves
  rich/markdown mode with separate scroll positions and optional older version, discovery choices
  and disclosures, and each document's own view/model state, always within 16 KB. The source's
  scripted Plan build advances a step every 2600 ms while visible and pauses while hidden; checking
  previews take 1100-1200 ms, 300 ms under Reduced Motion. These scripted delays are preview
  presentation, not actual workflow completion. Run bodies have a 360 × 200 px minimum. They place a
  220 px aside beside the body from 900 px, otherwise below in an auto-fit grid of at least 180 px;
  at 904 px the grid is 652 px + 32 px gap + 220 px aside, or 904 px without an aside. BrainStorm
  options use 3 columns from 900 px, 2 from 600 px and 1 below; vote tables stack below 640 px. The
  participant plate is one row from 720 px, or from 1200 px with 5 or more seats; below that the
  input card has its own row, the plate wraps from 420-719 px and becomes a caption line below 420
  px. Chat Room head actions get their own row below 900 px; team outcomes move under names and cost
  lists hide the model column below 520 px. Puppets are 28 px in the plate, 26 px for the hub and
  You, 22 px in team rows, 20 px in timelines and 34 px in participant views; state corner marks are
  12 px. Five seat hues are blue, magenta, lime, orange and the page accent, all ink in NieR; hub
  and You are neutral. Run view state saves overview/conversation/team/cost, person and filter;
  paused/progress/rounds/ticks/promotions are session-only per run. Friendly controls and table-of-
  contents/back/picker have 6 px radii; choice/seat/team rows cap at 8 px, sorting has 0 and run
  links 3 px. File references are 24 px inline and appear only for files that exist; hover uses the
  shared tile treatment for seats, row for team rows and quiz choices, and off for the hub. Source
  preview timing runs only while visible and not paused: Crew ticks every 1 s; Review reader
  previews finish at 3, 6 and 8 s and the report preview at 10 s; Chat Room reveals 2 words every 60
  ms, arriving whole while hidden or under Reduced Motion; Write the plan preview lasts 1400 ms, 400
  ms reduced. These scripted times do not set real agent or workflow completion deadlines.
  Transcript and Context content minima are 280 × 160 px; records are 280 × 120 px. Transcript feed
  columns cap at 760 px with padding 18/24/44 px, or 14/14/40 below 720 px; the spine is 1 px with 6
  px dots and an 8 px live-dot ring. Stretch toggles are at least 30 px; step-rail discs are 16 px
  with 10 px glyphs, fold after 10 discs into +N, and record-row glyphs are 13 px. Transcript prose
  is 13/21 px, record title 12.5/19 px, detail 12/18 px and time 11.5 px. Follow-bottom threshold is
  28 px, elapsed ticks every 1 s for Working, Retrying, Fallback route and Waiting, and live breathe
  is 1.6 s or a 1-1.2 s stepped Retro/NieR blink. Step discs hide below 420 px, model below 700 px,
  Parent below 560 px, Read-only · live words below 440 px (the lock stays), and agent name below
  360 px. Transcript saves agent reference, follow, open stretches and scroll top. The source
  preview streams at 3400 + ((delivered × 7) modulo 4) × 700 ms, 3.4-5.5 s, and reveals 2 words
  every 55 ms; the new-item slide uses the shared slow motion. Context columns cap at 720 px, 960 px
  from a 960 px body; Source composition and Context growth appear side by side and start open at
  that width until the reader toggles them. Hero numbers are 32 px, bars 6 px, disclosures 34 px;
  tiles use 3 columns from 360 px and 1 below; four-tile groups use 4 from 600 px, 2 below and 1
  below 300 px. Plan-limit rows have name, bar and a 128 px figure, with the bar on its own line
  below 460 px; the usage fact hides below 380 px. Growth charts are 168 px high; the source's
  131,000-token-limit fixture uses an axis to 140,000, gridlines at 0/50K/100K, ceiling 131,000 and
  turns 1/5/9. Limit tone is ok below 70 %, warn from 70 % and bad from 90 %. Context saves thread
  reference, curated/raw view, open sections (null while width decides) and scroll top; sections are
  tokens, sources, growth, route, limits, caps, cost and compaction. The six categorical colours are
  dark #3987e5 #d95926 #199e70 #c98500 #d55181 #008300 and light #2a78d6 #eb6834 #1baf7a #eda100
  #e87ba4 #008300; NieR's charts part uses ink at .92/.72/.56/.42/.30/.20 with hatching on even
  segments. Record columns cap at 960 px; results have 10 px padding; tables scroll sideways with
  nowrap cells and notes at least 160 px. A search query label longer than 28 characters is cut at
  27 plus an ellipsis; MCP uses the tool label, or MCP; records save scroll top. Shared document
  actions are 32 px and header targets 24 px, with no text below 11 px. Header labels appear at 1100
  px for Transcript, 720 px for Context and 600 px for Record. Friendly stretch/disclosure rows use
  the shared row radius, Parent links 6 px and Jump to latest/Source-thread buttons cap at 8 px.
  Header-row labels default to a 520 px body threshold; kinds may set their own: Browser and
  Transcript 1100 px, Context 720 px, Record 600 px. Icon-only buttons are 24 px wide. File
  references are 32 px tall with a 6 px radius and 12 px code face, or 24 px inline with a 4 px
  radius and 11.5 px code face. Their 240 ms double-click window delays preview so double click can
  keep the file open; their hover tag says the path and line the reference names (amended 2026-10-17,
  DL-228; it read: Open file) / Click previews it. Double-click keeps it open., or No file to open / This reference
  names no file. without a path. In-tab view saves
  coalesce at 250 ms. Document action radii are Friendly 8 px, Glass 8 px, Basic 6 px and Retro/NieR
  square 0. Metadata separator slots are 16 px with 3 px wrapped-line clipping slack. The Debug
  Console's chosen sub-tab and every segmented toggle are filled on their own box, never underlined,
  with Friendly's, Glass's and Basic's neutral chosen-row surface, never an accent; Glass adds its 1
  px top rim, Retro uses reverse video and NieR its ink block (F3-490). Nested Home menu and picker
  keys consume F3-632: Escape returns one level then closes at the root; a fresh empty-query
  Backspace returns one level, held erasure never also navigates; Left outside the field returns; Up
  from the field reaches Back; + toggles the whole menu closed. Back/search/rows remain in that
  arrow order, with Enter or Space activating Back. These are local navigation, with no structural
  command or event.
  Amended 2026-10-17 (DL-228): wherever a panel must be named (the panel menu's title, Move panel and Move to
  panel rows, the every-tab list's sections, the narrow switcher, announcements), it is named in words by its
  active tab and its place in the layout (left, right, top, bottom or middle, combined down the tree, or "the
  only panel"), never by an id or a number other than the switcher's ordinal. Tool tabs' header rows: Output
  has Follow, Clear ("Clear this channel") and More with Wrap long lines, Copy all, Open as a document (a
  read-only editor tab titled with the channel, through cmd.panel_tab.open, the route of the terminal's Open
  output) and Open <channel> in new tab, or Show in the Output tab on a split-off tab; Problems has Filter
  (errors, warnings or notes) and Check again; Ports has Forward a port; the Debug Console has Continue or
  Pause, Restart, Stop and Clear ("Clear this session's console"), disabled once its session has ended.
  Follow, Clear, Wrap, Copy all and Filter are view-local; Check again, Forward a port and the Debug Console's
  session controls dispatch their owners' existing Problems, Ports and Run & Debug commands. Document kinds: a
  plan's More holds Export as Markdown, Export as PDF, Send to Planning Wizard, Copy plan link
  (pm://plans/<id>@v<n>) and Cancel build, which confirms ("Cancel this build?", "Steps already done stay
  done.", Cancel the build or Keep building), with Revise moving into More in a narrow tab; an artifact has
  Versions, Open in new panel and More with Copy link to this version, Copy source, Export as image, Export
  the data and Open the source file; a run's More holds Cancel <run> with a yes or no submenu, Change setup...
  (on a Crew disabled until it is cancelled: "This Crew builds one plan version. Cancel it first.") or Run
  again with changes... once finished, Run another review (Review only), Download transcript and Open in new
  panel; a transcript has Follow, Copy transcript, Show the parent thread and Context of <thread>; a context
  tab has Preview compact and Redacted JSON; a record has Show in chat, which reveals and marks the work row
  in its thread or says the message is not available, and Copy. Each row dispatches its content owner's
  existing command or is view-local; none adds a command id here.
gui_related: true
gui_classification_reason: Defines the list of tab kinds, how a kind plugs into a panel, the shared header row, the overlay order and the panel keyboard.
split_recommended: false
depends_on: [DL-180, DL-181, DL-187, DL-147, F3-568, F3-630]
unblocks: [F3-640, SP-330, UCC-200, CS-100, RAP-065, WS-030, DR-065, DR-067, G-030, ATS-075]
acceptance_criteria:
  - "Exactly the fifteen kinds listed here are registered, each with the id prefixes stated, and no Goal tab, Activity Detail, lab-only workspace or setup sheet is a kind."
  - "Opening an id with a known prefix lands in that kind; an unknown prefix opens no tab; two kinds claiming one prefix fail at start-up."
  - "Moving, collapsing, maximizing, hiding or restoring a tab never changes its domain reference, and no tab, panel or session id appears as text."
  - "Each kind's content minimum is as stated and a panel's minimum is the largest of its tabs' minimums."
  - "A restored background tab is mounted only when first shown; serialized state above 16 KB is refused."
  - "No tab body reads the window's size; each responds to its own width and height and gets a final size call after a drag or animation settles."
  - "Every kind with a control row uses the shared header row with the stated heights, targets, text sizes, label threshold and hide threshold."
  - "Every menu, list, ghost and preview opens in the one overlay root in the stated order, and no kind appends its own overlay."
  - "Every key in the desktop map works while focus is in the centre, none uses Ctrl+K or Ctrl+1..9 or a bare letter or digit, and in a web browser Alt+T, Alt+W, Alt+Shift+T, Alt+` and Alt+PgDn/PgUp replace the browser-owned chords Ctrl+T, Ctrl+W, Ctrl+Shift+T, Ctrl+Tab and Ctrl+PgDn/PgUp with every label showing the key that works."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
  - "Output has id output and switches channel as view state; Open in new tab produces output:<channel> showing only that channel."
  - "The Debug Console is one tab per workspace, debug-console, with a sub-tab per debug session; choosing a sub-tab dispatches nothing, and an older debug-console:<session> id opens, restores or reopens as that tab with that session shown."
  - "Each kind may fold older id forms into one tab and may add rows to the tab menu after a hairline, through its registration."
  - "Typing fields pass host navigation keys after the tab declines them, with the Mac typing rule and IME composition respected; F6 reaches the chat composer from every region."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/home_workspace_layout_v2.schema.json
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md,
  SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-2.md,
  SHA-256 1eecc96b03a1a774f52d06420c913553d5f5d1917e1bd5705e2f6e0bbc11fad6 (D31)
- Plans/Decision_Log.md#DL-180
- Plans/Decision_Log.md#DL-181
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D9, D11, D12)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md,
  SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md,
  SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/chat56-audit.md, SHA-256 6d1563bd1776860739e6be272b191c419aba3c38b9dd9fe8ba44fd1ebb3231b5
  (sections 9 and 10; audit lineage only)
- Concepts/home-redesign on branch concept/home-panels-20261009 at 1565156bce (concept lineage only)
- Plans/Decision_Log.md#DL-187
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md,
  SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D33)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/panels-NUMBERS-339203bd76.md,
  SHA-256 2e2c2a95819842cd5cbcc108ed302460ddea3ed0a98be7dfe4f1b78507660ce6 (Debug Console, Output; concept
  lineage only)
- '/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/panels-CONTRACT-339203bd76.md,
  SHA-256 6937e47dd9e63466f9c17653bf54f2a70583efbde7270d8cf9609a1920150165 (sections 2 and 3: the kinds
  and fold; concept lineage only)'
- 'Concepts/home-redesign/CONTRACT.md at c4e32ec0b7 on branch concept/home-panels-20261009, SHA-256 8b1222cde3bb53a6ce534f5e436cc20b8829a230612b9e38654f5174e8d013b9
  (section 3, `tabMenu`: the tab-menu rows a kind adds; concept lineage only)'
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-CONTRACT-2926ad987e.md,
  SHA-256 c579d0dfef41fd1fc7327d14c2adb9e2b101c24b216ff64a9db5fc19895ad989 (small-round concept lineage
  only)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-panels-picker-back--NOTES.md,
  SHA-256 29bac44f166cb8e0e67f4f00634cb15d0a3be576eb2f68e7e19606f3a4a1a71c (source lineage; not native
  certification)
preserved_exact_tokens:
  - "Open in new tab"
  - "output:<channel>"
  - "editor"
  - "terminal"
  - "browser"
  - "dashboard"
  - "plan"
  - "document"
  - "artifact"
  - "run"
  - "transcript"
  - "context"
  - "record"
  - "output"
  - "problems"
  - "ports"
  - "debug_console"
  - "debug-console"
  - "dashboard:home"
  - "16 KB"
  - "30 px"
  - "520 px"
  - "150 px"
  - "Alt+T"
  - "Alt+W"
  - "Alt+Shift+T"
  - "Alt+`"
negative_constraints:
  - "Do not make the chat, Activity Detail, the Goal tab or a setup sheet a tab kind."
  - "Do not size a tab body against the window."
  - "Do not show a tab, panel or session id in the interface."
  - "Do not bind a panel action to Ctrl+K, a Ctrl+K chord, Ctrl+1..9 or a bare letter or digit."
  - "Do not let a tab kind append its own overlay outside the one overlay root."
compatibility_only_notes:
  - "The concept's registration call, host API names, container name and z-index values are concept lineage; the stacking order is canon, its numbers are not."
  - "The concept spells the tool kind debug-console in its id prefix; the kind's schema name is debug_console."
  - "The panels concept (339203bd76) shares one Debug Console input history across its sessions; canon keeps the history per session, as F3-490 already said, and the concept's demo sessions are demo data."
  - "The concept browser's demo agent-access defaults (panels NUMBERS 6026fa8432, browser): Navigation, Tabs and frames, Page structure and components, Styles, Console, Source maps and files, Screenshots and recording and Viewport and device sizes On; Network, Performance, Storage and cookies, Form input and Downloads Ask; Request simulation Off. They are concept lineage only, not product defaults (SMPFS-092)."
stale_retired_dispositions:
  - "Amended 2026-10-10 (R35 review, panels NUMBERS 6026fa8432 keyboard): The web-client mapping rule also answers Ctrl+PgDn/PgUp as Alt+PgDn/PgUp."
  - "Amended 2026-10-10 (R35 review, SMPFS-092): The agent-access policy keeps its 14 rows and the Off, Ask, On cycle; the concept's per-row defaults move to compatibility_only_notes as lineage, and the product defaults are left to the browser owner as an open question for the lead."
  - "Amended 2026-10-10 (R35 review, SP-330): Restores the no-buffer-text exclusion; the bounded editor-buffer text state the R35 line below permits is concept lineage; lead ruling L25 (2026-10-10): SP-330 does not admit buffer text."
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Uses the per-kind document minima and permits the bounded editor-buffer state."
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Adds settled browser, tool, document, run, transcript, context, record and shared-helper dimensions and timings."
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Passes host navigation keys from tab typing fields and cycles F6 to the chat composer."
  - "Amended 2026-10-10 (D31, DL-180): Output uses one tab with its channel as view state; only an explicit channel split-off uses output:<channel>."
  - "Amended 2026-10-10 (DL-187, D33): The Debug Console is one tab, debug-console, with a sub-tab per session as view state; debug-console:<session> ids fold into it; each session keeps its console, state and frame, and its input history stays per session (F3-490)."
  - "Amended 2026-10-10 (DL-180, D31 as built, panels NUMBERS 339203bd76; DL-187, D33 and D38): The Output tabs are labelled Output and Output · <Channel>; a kind may fold older ids and add tab-menu rows through its registration."
  - "Amended 2026-10-11 (lead ruling 2026-10-11, D29): The Debug Console sub-tab passage uses the shared neutral chosen fill."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/DRY_Rules.md
  - Plans/Glossary.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/DRY_Rules.md#DR-065, ContractName:Plans/DRY_Rules.md#DR-067, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/Commands_System.md#CS-100, ContractName:Plans/Decision_Log.md#DL-187, ContractName:Plans/FinalGUISpec.md#F3-490

### F3-636 — Narrow Windows: The Centre-Width Ladder

```yaml
plan_unit_id: F3-636
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Narrow windows fold in one fixed order, keyed on the centre's width C, the window's width minus the rail and the chat
  column, never on the window's width (DL-180, D4; Jared: "Rail, then chat"). C below 960 px: the rail's side panel
  eases to 240 px, F3-471's minimum. C below 760 px: the side panel folds to its icon bar and opens over the panels as
  an overlay when the user picks it, then the chat eases toward 400 px. C below 600 px: the centre shows one panel
  column, with a panel switcher ("2/3", named "Panel 2 of 3: switch panel") in the visible panel's strip that opens the
  list of panels, one row per panel ("N. <its active tab>", its tab count and place as the second line, the shown
  one marked), and choosing a row shows and focuses that panel (ui.workspace_layout.focus_panel; amended 2026-10-17,
  DL-228, it read: that steps through the panels); the real split tree
  is kept unchanged underneath, new panels are not created, and an open or a split that asks for one lands in the next
  panel of the switcher and says so (F3-634). C below 480 px: the chat folds to a 32 px edge strip that opens it again,
  unless the user turned on "Keep the chat open in narrow windows" (F3-637). Each step undoes itself only when C has
  come back 48 px past its threshold, so a window near a boundary never flickers. None of these states is ever saved:
  widening the window or opening it again shows the saved layout. Measured with the default rail and chat: at a 1920 px
  window the rail is 240, the chat 600 and C 1041; at 1680 the chat is 441 and C 960; at 1470 the rail is folded, the
  chat 473 and C 960; at 1440 the chat is 443; at 1280 the chat is 400 and C 847; at 1024 the centre is one panel column
  with C 567; at 900 the chat is its edge strip and C 811. Everything inside a tab responds to its own tab body, never
  to the window (F3-635): a dashboard's columns follow its tab's width (F3-638) and the shared header row its body's
  width. The centre never scrolls sideways as a narrow fallback. This supersedes, for Home and dashboard tabs, the
  window-width breakpoints of section 12.1 and F3-195 and of section 12.3 and Appendix C.1 (F3-197, the dashboard's
  window-width columns, is superseded by F3-638), F3-503's below-1320
  px overflow-x exception, F3-517's rule that Home collapses to a single column, and the chat's own narrow-width rules
  as they apply to Home (APR-038's full-width plan tab is read through the switcher and ACD-500).
  With History pinned and the rail folded, the centre-width ladder, before the chat folds, drops the pinned
  History to a flyout; measured as window widths, the drop happens at 1170 px going narrower and History
  returns at 1210 px going wider, and the chat folds to its strip at 930 px going narrower and unfolds at
  990 px going wider. These are measured outcomes of the C keys above, not window-width keys. The ladder
  uses 48 px hysteresis; these transition pairs and temporary History drops are never saved.
  Amended 2026-10-10 (DL-187): the ladder acts only while Home is the page shown, since it measures Home's centre; on
  the Usage page the chat keeps the Usage board at least 400 px wide instead, and on other pages the chat column is the
  person's width (F3-637).
  Amended 2026-10-17 (DL-228): when the centre drops to one panel column it announces "The window is narrow:
  one panel at a time. Use the panel switcher in the tab strip.", and it announces the return when the panels
  come back.
gui_related: true
gui_classification_reason: Defines what gives way, and in what order, when the room left for the panels gets narrow.
split_recommended: false
depends_on: [DL-180, DL-187, F3-471, F3-630, F3-637]
unblocks: [SSYS-050, ACD-500, ATS-075]
acceptance_criteria:
  - "Every narrow step keys on the centre width (window minus rail minus chat), never on the window width."
  - "Below 960 the side panel eases to 240; below 760 it folds to its icon bar and opens as an overlay, then the chat eases toward 400; below 600 one panel column shows with a switcher and the tree is kept; below 480 the chat folds to a 32 px strip unless kept open."
  - "Each step reverts only 48 px past its threshold, and no narrow state is written to the layout record."
  - "At the measured window widths the rail, chat and centre widths match the values stated here."
  - "No dashboard, header row or other tab content reads the window width, and the centre never scrolls sideways."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
  - "With History pinned and the rail folded, the centre-width ladder drops History at a measured 1170 px window width and returns it at 1210 px, and folds the chat at 930 px and returns it at 990 px; the 48 px ladder hysteresis and temporary states are never saved."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md, SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)"
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D4)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md, SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/proposal-visual.html, SHA-256 52dd51521a1266e39a2ab6b274176d89666baaaacb1d933e5cc2237c151ab981 (the agreed anatomy; concept lineage only)"
  - "Concepts/home-redesign/src/panels/js/44-narrow.js at 7ad8442ad4 on branch concept/home-panels-20261009 (the ladder only while Home is the page; concept lineage only)"
preserved_exact_tokens:
  - "960"
  - "760"
  - "600"
  - "480"
  - "48 px"
  - "2/3"
  - "Keep the chat open in narrow windows"
negative_constraints:
  - "Do not key a Home narrow rule on the window width."
  - "Do not save a narrow state or destroy the split tree to fit a narrow window."
  - "Do not fold the chat before the rail's side panel."
stale_retired_dispositions:
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Adds History drop and strip fold thresholds with the rail folded, without saving narrow state."
  - "Amended 2026-10-10 (DL-187): The ladder acts only while Home is the page shown; the Usage page keeps its own 400 px board floor (F3-637)."
compatibility_only_notes: []
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-637, ContractName:Plans/FinalGUISpec.md#F3-471, ContractName:Plans/Settings_System.md#SSYS-050

### F3-637 — The Chat Column

```yaml
plan_unit_id: F3-637
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The chat is a fixed column on the right of the window (DL-180, D3). It runs from the title bar to
  the status bar, which both stay full width (Jared, 2026-08-13, PMConcept7 revision 15: "The chat
  assistant window should be full vertical height, unless it pops out, then the user can adjust
  it."). It is never a tab and never in the split tree, and it is never moved, docked, grabbed or
  floated inside the window: it carries no grip and no surface menu of the home centre. Its default
  width follows the window: clamp(400, 0.26667 x window width + 88, 640) px, so 480 px on a 1470 px
  window, 600 px at 1920 px and 640 px from 2070 px. The user drags the column's inner edge between
  400 and 760 px, never so wide that the centre drops below 960 px, and on the Usage page never so
  wide that the Usage board drops below 400 px (below); the drag previews locally and commits once
  on release as cmd.workspace_layout.resize_surface with the surface chat and its width, kept in the
  v2 layout record (SP-330), and a width the user never set follows the window. Showing and hiding
  the chat stay cmd.panel.switch with chat, and the left rail's Chat entry shows or hides the column
  on every page without changing the page in front (F3-042, D40). The narrow ladder (F3-636) eases
  it toward 400 px and, below a centre width of 480 px, folds it to a 32 px edge strip that opens it
  again; "Keep the chat open in narrow windows" keeps it open instead. That toggle is the chat's own
  preference, not a Settings row: it sits in the chat header's menu (ACD-442) and in the title bar's
  Home options menu (the planning thread's ruling of 2026-10-10 under D4). Amended 2026-10-10 (lead
  ruling): it is a check in the chat header's menu, and the concept also offers it in the Home
  options menu; both dispatch the same typed local action, ui.chat_column.keep_open with its
  argument keep_open, whose value is saved in the v2 record's chat column as keep_open
  (Plans/storage-plan.md#SP-330), never a Settings row. Pop out is the only way to move it (D3: the
  desktop app). In the desktop app Pop out opens the same chat, with its History and Activity
  Detail, in its own window that the user sizes and places (cmd.panel.undock with chat;
  panel.undocked, F3-527), and Dock back returns it to its column (cmd.panel.redock;
  panel.redocked); exactly one chat exists at a time. The web client offers no Pop out; the chat
  stays in its column. The title bar's Home options menu carries Show the chat or Hide the chat, and
  in the desktop app Pop out the chat or Dock the chat back, and Keep the chat open in narrow
  windows (F3-502). The 5.6 Pro chat's History list is a flyout over the chat by default; pinning it
  widens the chat by the list's own width instead of squeezing the messages. Activity Detail stays
  inside the chat as the 5.6 Pro chat designs it (APR-001), never a panel tab. One thread-history
  list survives, the 5.6 Pro one. The chat sizes itself by its own column, never by the window
  (ACD-501). Everything the chat opens lands in the centre through F3-634 (ACD-500). This supersedes
  chat docking to any host, the chat's grip, its grab and keyboard move, floating it inside the
  window and its Dock back to a host (F3-HOME-001, F3-HOME-002 and F3-HOME-003 as they apply to the
  chat; F3-516's saved dock), and the four different chat minimums: F3-HOME-002's 260 px nominal
  minimum, F3-423's floating floor (it now holds only for the desktop app's popped-out chat window),
  F3-565's narrowest chat (its resilience rules now hold for a popped-out window narrower than 400
  px), and the 360 px chat beside an open document of APR-038 and F3-569. After a restart the chat
  starts in its column, also when it was popped out as the app closed (Jared, D32; F3-504): the
  pop-out is never saved, while the column's visibility and width are (SP-330). A Chat Layout value
  saved before this redesign, Overlay or Detached, never pops the chat out at start:
  general.visual.chat-layout-mode retires, and a stored value is ignored and cleared on first read,
  with no pop-out and no notice (SSYS-050). On the Usage page the chat never squeezes the Usage
  board below 400 px, the narrowest board every Usage widget's smallest preset is checked at
  (Plans/Widget_System.md#WS-017; the planning thread's ruling of 2026-10-10): a pinned History
  drops back to its flyout first, then the column gives way down to its 400 px minimum, and it grows
  back toward the person's width as the board gets room again; a width drag there stops where the
  board would drop below 400 px. None of this is saved beyond the width the person dragged to. The
  narrow ladder of F3-636 runs only while Home is the page shown; on any other page the column is
  the person's width, plus a pinned History. ui.chat_column.pin_history is a typed local action
  (view state); its value is saved in the v2 record's chat column as history_pinned, with no
  workspace.layout_changed event, revision advance or receipt, like ui.workspace_layout.maximize.
  The saved width and the 400-760 px drag range describe the message area. Pinning History adds 240
  px to the column, or 200 px while the whole column is under 540 px; the messages keep their width.
  The pinned column's minimum is 640 px; its drag range is 640 to 760 + 240 px, capped by the 960 px
  centre budget. A folded chat always has History dropped to a flyout, so its peek opens at 400 px;
  with History pinned in the peek it is 640 px, capped at the row width minus 48 px. Measured
  History cases: at 1920 px in Friendly dark, the flyout column is 600 px, the pinned column 666 px
  (History 240 px, messages 425 px) and C 960 px; at 1920 px in NieR, flyout is 600 px and pinned
  681 px (History 240 px, messages 440 px), with C 960 px. At 1470 px in Glass light with the rail
  folded, flyout is 434 px with C 960 px, and pinned is 640 px (History 240 px, messages 399 px),
  with C 754 px. At 900 px in Retro dark the chat folds to 32 px, with a 400 px flyout peek or 640
  px pinned peek. These measurements include centre-budget clamping, while the saved width remains
  the message-area preference. The v2 layout record's chat_column keeps width_px, history_pinned and
  keep_open (defaults null, false and false), in addition to its shown state; none is a Settings
  value. width_px is the message area's width, rounded to an integer in 400-760 px, with an
  out-of-range finite number stored at the nearer bound and null following the window's default;
  other values are refused. The resize command is cmd.workspace_layout.resize_surface { surface:
  'chat', width }: a changed release commits once with one receipt, one workspace.layout_changed and
  a new revision; Escape or release with no movement commits nothing. Double-clicking the resizer
  commits once with width null. The two pin actions accept their named boolean or toggle when it is
  absent, and save like view state with no receipt, event or revision; History's button, the pin in
  its list header and Keep History open in More dispatch ui.chat_column.pin_history. A named layout
  and Restore home layout keep all three fields; a project switch shows that project's own record,
  or the defaults if none exists. Once at boot, the former stored chat.width (finite, rounded and
  clamped to 400-760), chat.history value pinned and chat.pinOpen true copy into this project's
  layout and every other project's saved layout only where the target field still holds its default;
  existing non-default fields stay. The three old keys are dropped only after this project's layout
  is written, never while an unreadable record waits to be set aside; stored defaults (null, flyout
  and false) are just dropped. The chat's More menu rows, in order, are Show the current chat, Pop
  out or Dock back where supported, Keep History open (checked, ui.chat_column.pin_history), Keep
  the chat open in narrow windows (checked, ui.chat_column.keep_open), and Clear what you sent. Keep
  open's second line says Instead of folding to a strip at the edge. At 1920 px with width_px 500,
  History pinning grows the column from 500 to 681 px (History 240 px, centre 960 px) and unpinning
  returns it to 500; dragging the 600 px column's inner edge 100 px right stores width_px 500, and
  double-click resets it to 600 with width_px null. At 900 x 700, keep_open on keeps the chat at 400
  px with centre 443 px; off it folds to the strip with centre 811 px. Jared’s 2026-10-14
  shell-spacing direction reduces excess space between the left rail and page content and between
  content and the chat column on all pages. Glass needs the larger reduction; other looks retain
  their grammar with smaller adjustments where needed. The Glass landing fixes the shell row gap at
  2 px, giving about 8 px between the painted columns. Settings ends 10 px from the chat in Glass
  and 20 px in other looks. The Orchestrator Glass header and board are inset 6 px instead of 16 px;
  F3-655 consumes that shell placement. This changes no chat or panel minimum, collapse threshold or
  persistence boundary.
gui_related: true
gui_classification_reason: Defines the chat's fixed column, its width, show and hide, Pop out, History flyout and Activity Detail.
split_recommended: false
depends_on: [DL-180, DL-187, F3-504, F3-527, F3-630]
unblocks: [ACD-500, ACD-501, SSYS-050, UCC-203, PWIZ-035, ATS-075]
acceptance_criteria:
  - "The chat column spans from the title bar to the status bar at full width of both bars, and no gesture, menu or key moves it inside the window."
  - "The default width equals clamp(400, 0.26667 x window width + 88, 640) px (480 at 1470, 600 at 1920, 640 from 2070) until the user drags it."
  - "A width drag stays within 400-760 px and never leaves the centre below 960 px, and commits once on release as cmd.workspace_layout.resize_surface with the surface chat."
  - "Pop out in the desktop app opens the one chat in its own window and Dock back returns it to its column; no second chat surface ever exists."
  - "History opens as a flyout by default and pinning it widens the column by the list's width without narrowing the messages; Activity Detail stays in the chat."
  - "Below a centre width of 480 px the chat folds to a 32 px strip unless Keep the chat open in narrow windows is on."
  - "Keep the chat open in narrow windows is reachable from the chat header's menu and the title bar's Home options menu and is not a Settings row."
  - "Keep the chat open in narrow windows is a check in the chat header's menu and in the Home options menu; both dispatch ui.chat_column.keep_open with keep_open, and the value is saved in the v2 record's chat column (SP-330), never in Settings (amended 2026-10-10, lead ruling)."
  - "After a restart a chat that was popped out shows in its column, and no stored Chat Layout value (Overlay or Detached) pops it out or shows a notice."
  - "The left rail's Chat entry shows or hides the column on every page and never changes the page in front."
  - "On the Usage page no chat width, drag or pinned History leaves the Usage board below 400 px: a pinned History drops to its flyout first, then the column gives way down to 400 px, and a drag stops there."
  - "The narrow ladder acts only while Home is the page shown; on another page the column is the person's width plus a pinned History."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
  - "History adds 240 px, or 200 px below a 540 px whole-column width, without changing the message area's width or its 400-760 px drag range; the pinned column and peek obey the stated minima and centre budget."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Settings_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md,
  SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)
- Plans/FinalGUISpec.md#F3-636 (the narrow ladder consumes the chat column; cited, not a dependency (lead
  ruling L22, 2026-10-10))
- Plans/Decision_Log.md#DL-180
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D3, D4)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md,
  SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/proposal-visual.html, SHA-256
  52dd51521a1266e39a2ab6b274176d89666baaaacb1d933e5cc2237c151ab981 (the agreed anatomy; concept lineage
  only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/chat56-audit.md, SHA-256 6d1563bd1776860739e6be272b191c419aba3c38b9dd9fe8ba44fd1ebb3231b5
  (sections 9 and 10; audit lineage only)
- Concepts/home-redesign on branch concept/home-panels-20261009 at 1565156bce (concept lineage only)
- Plans/Decision_Log.md#DL-187
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md,
  SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D32, D40)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/panels-NUMBERS-339203bd76.md,
  SHA-256 2e2c2a95819842cd5cbcc108ed302460ddea3ed0a98be7dfe4f1b78507660ce6 (chat column, D32 and D40;
  concept lineage only)
- 'The planning thread''s rulings of 2026-10-10: the Usage board''s 400 px floor (pm-mail 1010142236-fced)
  and Chat Layout''s retirement with the narrow-window pin on the chat''s header menu (pm-mail 1010211322-7b6c)'
- Concepts/home-redesign/src/panels/js/44-narrow.js and 46-chat.js at 7ad8442ad4 on branch concept/home-panels-20261009
  (the Usage board floor as built; concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-NUMBERS-51c316e18b.md,
  SHA-256 a9c42b88e5cb50706ff1716a254cb68e026a538bb7a0c840905779a9a482cff2 (small-round concept lineage
  only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-CONTRACT-2926ad987e.md,
  SHA-256 c579d0dfef41fd1fc7327d14c2adb9e2b101c24b216ff64a9db5fc19895ad989 (small-round concept lineage
  only)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/JARED-FEEDBACK-20261014.md, SHA-256 47218ab2d7bfdbb58e983f9e4b489f3c29cedfc7b54bcf77788d06ced0ef10e6
  (decision/source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-glass-review--LANDING-HANDOFF.md,
  SHA-256 b920b1435478aaf5723b8051acc0aa07247680ed3d231fa6e5a67e1cfd11f48f (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/SPACING-4511b2c0eb.patch, SHA-256 57d02d7bfe773a8bde37c5c0aee4ade312a29d7530124c3e2e7ebc70629f147d
  (source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/SPACING-84997e7cad.patch, SHA-256 2b5acd7b306e3133fa64dec16ff4c32a95fd229e2b89b563cf367f2c05cf96c3
  (source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/SPACING-dc743c7320.patch, SHA-256 d88a28be144814a3c486e810afcf8c3dd348b06ebef611bbbf44fd4d5095a20b
  (source lineage; not native certification)
preserved_exact_tokens:
  - "clamp(400, 0.26667 x window width + 88, 640)"
  - "400"
  - "760"
  - "600"
  - "Pop out"
  - "Dock back"
  - "cmd.panel.switch"
  - "cmd.panel.undock"
  - "cmd.panel.redock"
  - "Keep the chat open in narrow windows"
  - "general.visual.chat-layout-mode"
  - "The chat assistant window should be full vertical height, unless it pops out, then the user can adjust it."
negative_constraints:
  - "Do not dock, grab, float or move the chat inside the window or, in the web client, inside the page, or make it a tab."
  - "Do not size the chat against the window inside its column."
  - "Do not make Activity Detail or the History list a panel tab."
  - "Do not keep a second thread-history list."
  - "Do not save the chat's pop-out across a restart, or let a stored Chat Layout value pop it out."
  - "Do not let the chat leave the Usage page's board below 400 px."
compatibility_only_notes:
  - "The concept floats the popped-out chat inside the page at 440 x min(720, window - 140) px with Dock back; that is the concept's browser stand-in, not a canon size."
stale_retired_dispositions:
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Adds pinned History widths, keeps the width and drag range tied to the messages, and records the measured pinned History column and message widths from NUMBERS; a folded chat's peek opens at 400 px with History dropped, and is 640 px only with History pinned in the peek."
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Saves History pin as view state with no layout event, revision advance or receipt."
  - "Amended 2026-10-10 (lead ruling L9, corrected): The History pin is the typed local action ui.chat_column.pin_history, view state saved in the v2 record's chat column as history_pinned with no event; this supersedes the earlier L9 wording 'commits history_pinned with chat_column_changed'."
  - "Amended 2026-10-10 (lead ruling L7): After restart the chat starts in its column; reopening popped out remains an open question for Jared."
  - "Amended 2026-10-10 (lead ruling L6): Pop out is desktop only; the web chat stays in its column."
  - "Amended 2026-10-10 (DL-187, D32): Jared answered L7's question: a popped-out chat starts back in its column after a restart, the pop-out is never saved, and a stored Chat Layout value (general.visual.chat-layout-mode, retired) never pops it out."
  - "Amended 2026-10-10 (DL-187, D40): The left rail's Chat entry shows or hides the column on every page (F3-042)."
  - "Amended 2026-10-10 (DL-187, the planning thread's rulings): Keep the chat open in narrow windows is the chat's own preference in its header menu and the Home options menu, not a Settings row; on the Usage page the chat never leaves the board below 400 px; the narrow ladder runs only while Home is the page shown."
  - "Amended 2026-10-10 (lead ruling): Keep the chat open in narrow windows is a check in the chat header's menu, also offered in the Home options menu, both dispatching ui.chat_column.keep_open, saved in the v2 chat column."
  - "Amended 2026-10-11 (wave 2, panels NUMBERS 51c316e18b): The layout chat column keeps the rounded message width and pins, migrates former preferences once, and owns the More rows."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/assistant-chat-design.md#ACD-500, ContractName:Plans/assistant-chat-design.md#ACD-501, ContractName:Plans/FinalGUISpec.md#F3-504, ContractName:Plans/UI_Command_Catalog.md#UCC-203, ContractName:Plans/Decision_Log.md#DL-187, ContractName:Plans/FinalGUISpec.md#F3-042, ContractName:Plans/Widget_System.md#WS-017, ContractName:Plans/Settings_System.md#SSYS-050

### F3-638 — The Dashboard Tab

```yaml
plan_unit_id: F3-638
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  A dashboard is a tab kind (F3-635), not a singleton surface (DL-180, D10). Every dashboard tab holds its own board on
  the Usage board engine (DL-186): it shows the Usage page's widget design and can show every Usage widget, and
  Plans/usage-feature.md#UF-062's rule that every Usage widget can be hosted on the dashboard now holds. Boards are
  built for more than one widget source: Usage widgets now, Orchestrator widgets after the Orchestrator page's own
  redesign, and other sources later, each under its own label (Plans/Widget_System.md#WS-030); the widget commands'
  payloads do not change. The built-in dashboards are Home (`dashboard:home`, pinned in the default layout, F3-630),
  Metrics (`dashboard:metrics`), Monitoring (`dashboard:monitoring`) and Agents (`dashboard:agents`), and a person can
  make custom dashboards with n from 1 to 9999 (`dashboard:dash-<n>`, called "Dashboard <n>" until renamed). Home,
  Metrics and Monitoring start from their own sets of Usage widgets (WS-030); a new custom dashboard starts empty. The
  old Home widgets (run progress, lanes and results) have left Home until Orchestrator widgets join the board engine
  after that page's redesign, and there is no Home (current) board (Jared, P1 B). Agents is drawn by the dashboard
  kind itself, not by the board engine: one card per agent at work, each opening that agent's transcript as a kept tab
  (Alt+click in a new panel), with the filters All agents, Working, Needs you, Waiting and Finished in its Show menu;
  it has no widgets and no board record, and resetting it means its filter (lead ruling F7). A dashboard tab sits in
  the same tab strip as every other tab (F3-631): it has no strip of its own and no second tab model. Inside the tab
  the board is the Usage widget board: its widget grid, its gestures, gravity and Tidy behave exactly as on the Usage
  page, each settled change one transaction (Plans/Widget_System.md#WS-019), and they act inside the tab only, never
  laying out panels (DR-066). The board lays out on the Usage board's tracks and width classes
  (Plans/Widget_System.md#WS-017), measured on the tab's own width, never the window (F3-635), and it sits on Home's
  tab surface, not the Usage page's background, in every look (P11). Each board's contents are kept per project
  (`widget_layout:v1:<project_id>:<board_id>`; the keys, the one-time adoption of an older key and the records are
  Plans/Widget_System.md#WS-030's and Plans/storage-plan.md's), so a project switch shows each dashboard tab with that
  project's board and a project lists only its own custom dashboards. A dashboard's widget layout is never stored
  inside the Home layout record, and Home's panels are not widgets.
  The header row is F3-635's shared row. Its left side shows the dashboard's name, the Live mark while Live readings
  are on and the board holds a Usage widget, the widget count ("N widgets", "1 widget" or "No widgets") and the range,
  with the scope when it is not all usage; its right side shows Add widget, Board and Maximize (Restore while
  maximized; Shift+Escape). The Live mark is the Usage page's own indicator in each look's words (Live; Retro [LIVE];
  NieR Mode LIVE) and pulses once for each live change the board applies, never between them and never under Reduced
  Motion. On Agents the left side counts the agents at work ("N agents · N working · N need you", and "Showing
  <filter>" under a filter) and Show takes the place of Add widget and Board.
  Add widget opens a searchable list ("Find a widget") of every widget the board can be given: a section for each
  Usage room in the Usage page's room order (F3-514), then the Usage widgets that belong to no room, then one section
  for each other widget source under its label. Each row's second line names its room or source and what kind of
  widget it is in plain words; a widget already on the board is checked and disabled with the reason "Already on this
  dashboard". Choosing one adds it (cmd.widget.add), scrolls to it and moves focus onto it.
  The Board menu holds, in order: Dashboards (Home, Metrics, Monitoring, Agents, this project's custom dashboards by
  name with their widget counts, and New dashboard; the current one checked); This dashboard (Range, Scope, Start
  from, Save as preset..., Tidy, Reset widgets); Live (Live readings); and, on a custom dashboard only, after a
  hairline, Rename dashboard... and Delete dashboard.... On Agents it holds Dashboards and Show. On an empty board Save
  as preset... and Tidy are disabled with their reasons ("Add a widget first", "Nothing to tidy yet"). Range (Last 5
  hours, Last 24 hours, Last 7 days, Last 30 days) and Scope (All current usage, Work accounts, Personal accounts, or
  one provider) belong to each dashboard and change only its board, independent of the Usage page's (P2); choosing one
  is the typed local action ui.widget_board.set_view, view state kept in the board's record with no receipt and no
  event (lead ruling F1). Live readings is the Usage page's own Live / Paused choice, one switch shared with the Usage
  page (Plans/usage-feature.md#UF-107). Tidy and Reset widgets are the board's own (WS-019, WS-030): Reset widgets
  returns Home, Metrics and Monitoring to their default sets and a custom dashboard to empty.
  Start from lists the sets a board can start from in four groups (P4): This dashboard (the board's own default),
  Dashboard starter, Usage rooms (the Usage page's 13 room sets, in its room order) and Your presets. Each row's second
  line says what the set holds, a preset adding the day it was saved, and the active set is checked; a filter field
  ("Find a room or a preset") appears once there are more than three presets. Choosing a set replaces the board's
  widgets with it through one cmd.widget.reset_layout naming the set (set_id; WS-030). Because Start from replaces the
  widgets, an Undo notice then shows at the foot of the tab for 8 s, held while the pointer or focus is on it and for 3
  s after; it ends at the next change to the board's widgets, on Escape (focus returns to Board), on a project switch
  and when the tab closes, and Undo puts the board back as it was and says so. Amended 2026-10-10 (lead ruling): Undo
  dispatches one cmd.widget.reset_layout with { scope: room, room: <board_id>, restore_revision }, restore_revision
  being the board's committed layout revision just before that Start from, with one receipt and only while the
  notice is up; it never carries set_id, the owner puts back exactly that revision's records, a restore is refused without dispatch if any other change was committed on the board since,
  excluding the preset hold's own settling resizes, and Undo is disabled with its reason, and it emits no
  workspace.layout_changed (WS-030, UCC-200). The empty board's Start from... button
  opens the same list.
  Presets are the person's own, kept across projects and offered on every dashboard (WS-030). Save as preset... asks
  for a name, starting from the dashboard's name made unique; a name is trimmed, its spaces collapsed and kept to at
  most 80 characters, and a preset saved without one is called "Preset <n>". With no presets, Your presets holds "Save
  this dashboard as a preset..."; with some, its last row, "Rename or delete presets", lists them, each with Start
  from this preset, Rename preset... and Delete preset... behind a confirm (Delete preset or Keep it). A dashboard that
  started from a deleted preset keeps its widgets. A preset keeps the widgets shown at each board width class with
  their sizes and settings, never the board's own range and scope. Saving, renaming and deleting a preset are the
  typed local actions ui.widget_preset.save, ui.widget_preset.rename and ui.widget_preset.delete, with no command;
  using one is cmd.widget.reset_layout with set_id user:<id> (lead ruling F2).
  New dashboard, in the Board menu, the "+" menu's Dashboard sub-row (F3-632) and the catalog, makes a custom dashboard
  (D35); so does a new tab or a split in a panel whose usual kind is the dashboard (Ctrl+T, F3-632). It starts empty
  and is called "Dashboard <n>". Rename dashboard... asks for a name and renames the tab with cmd.panel_tab.rename;
  renaming the tab renames the dashboard too, and clearing the tab's label gives back "Dashboard <n>". A name is
  trimmed and kept to at most 80 characters, and is kept per project with the board (WS-030). The name shows on the
  tab, in the header row, in the Board menu, in the "+" menu and in the catalog. Delete dashboard... asks first
  ("Delete <name>?": Delete dashboard, whose widgets cannot be brought back, or Keep it), then closes the tab
  (cmd.panel_tab.close), drops it from the reopen list and forgets its board and its name; it leaves the "+" menu and
  the catalog. Home, Metrics, Monitoring and Agents can be reset but never deleted, and show neither Rename
  dashboard... nor Delete dashboard...; a label the person gives one of their tabs names that tab only (F3-631).
  A closed custom dashboard keeps its board while it can be reopened from the reopen list and is forgotten when it
  leaves the list, unless it is open as a tab; the built-in dashboards keep theirs (P6). A saved named layout keeps the
  boards of the dashboards it holds, at most 64 KB of them per named layout; a larger save keeps the layout without its
  boards and says so (lead ruling F3; Plans/storage-plan.md#SP-330); applying the layout puts back the boards it kept,
  and a named layout saved before this applies as before.
  A board's first show plays the Usage page's calm reading-order entrance, and none under Reduced Motion (P7). An empty
  board shows an invitation over the board, which stays laid out beneath it: a small sketch of a board, "<Name> is
  empty", one line saying what to do, and Add widget and Start from... buttons; a new, empty dashboard puts focus on its
  Add widget, and otherwise focus goes to the board's first card in reading order. Details on a widget opens the Usage
  page at that widget's room with its inspector open (P8). Live readings apply to dashboards too, each board
  separately, with the Usage page's idle rule (F3-628, UF-107): nothing animates at idle except one live change per
  applied batch while Live is on, and a board that is not on screen does no live work (P12). Play the next hour, Back
  to now and the Demo time, which the concept also runs on dashboards, stay the lab-only demo controls UF-107
  classifies, part of the one Demo Studio (F3-649), never product controls. This supersedes F3-279's exact four-widget
  catalogue and the dashboard catalogue limit of Appendix C.4 and C.4.1, F3-517's "distinct tab models" for Home and
  Dashboard and its Dashboard-frozen resize peers (with F3-515's and F3-518's), section 7.2's singleton dashboard,
  and the dashboard's own Main, Metrics and Monitoring strip of F3-505.
  Measurements: the Agents tab body pads its cards 12, 12 and 16 px, or 8, 8 and 12 px below 420 px of
  width; Agents cards sit in tracks at least 240 px wide, one column below 420 px; the header row is icon-only below
  520 px and hidden below 150 px (F3-635). The Board menu is 320 px wide, Start from 340 px and Add widget 380 px. The
  Live mark is a 7 px dot with a 1.5 px ring, 6 px from its word set at weight 550, in the ok colour (Friendly's
  lavender #6F55A8, #D2C4EE in dark, DL-214; Glass with a 6 px glow); Retro shows [LIVE] and a 6 x 11 px block and NieR Mode LIVE and a 6 px ink
  diamond, both in the code face; its pulse is a 240 ms two-step blink in Retro and NieR Mode and, in the other looks,
  a 600 ms ring that grows from 0.6 to 2.2 times and fades. The Undo notice sits 16 px above the tab's foot (10 px
  below 420 px of width), centred, with 12.5/18 px text and a 28 px Undo button with a 14 % accent fill (outlined in
  Retro and NieR Mode); it enters in 220 ms, rising 8 px, and leaves in 160 ms, with no motion under Reduced Motion. The
  empty board's invitation has 24, 20 and 32 px of padding; its sketch of three 44 px tracks by 30 px rows hides below
  320 px of height and its line below 220 px; its title is 15/21 px and its line 12.5/18 px, at most 360 px wide; its
  buttons sit 18 px below, 8 px apart; its tiles enter 40 ms apart over 320 ms and its words and buttons follow from
  160 ms, 50 ms apart, with no motion under Reduced Motion. The Agents clock ticks every 1 s while shown; the concept's
  working progress gains 1 % every 9 s up to 96 % and moves in 260 ms, stepped in NieR Mode and at once under Reduced
  Motion; a filter other than All agents is that tab's own state, saved about 250 ms after it changes.
  The Dashboard plus sub-row keeps the four built-ins and New dashboard inline; Your dashboards opens this
  project's custom dashboards by name with their widget counts and search above 7 (F3-632). A custom board's
  number is one more than the largest across open tabs, the reopen list, this project's stores, unadopted
  unscoped board stores, names and live boards; past 9999, opening falls back to Home. An unknown board
  opens Home; dashboard:new creates one and dashboard:current resolves to dashboard:home. Custom names
  collapse whitespace before trimming, at most 80 characters; a clash with a built-in or another of this
  project's dashboards gains 2, 3 and so on, and an empty or default Dashboard <n> name clears the stored
  name. Preset names use the same uniqueness rule among presets. The current dashboard in Board and the
  active set in Start from are checked and focused. Board shows Empty for a zero-widget custom board's
  detail; Start from shows the active set's label, Save as preset... says Reuse these widgets anywhere, and
  Reset widgets says Back to its default widgets or Back to an empty dashboard. Add widget labels the Usage
  widgets without a room More widgets. An Undo notice follows a Reset widgets that changed anything as well
  as Start from; its restore_revision is the committed revision immediately before that operation. The owner
  writes and reads that revision's captured envelope in this project, with one receipt and no
  workspace.layout_changed, and restore_revision never accompanies set_id. Undo's availability is checked on
  a commit that leaves the notice up, on pointer or focus entering it and on its click; if stale, the
  envelope is invalid or the board is gone, nothing dispatches, Undo is aria-disabled at 50 % opacity, and
  the notice text and button's hover detail give the reason. Preset-hold resizes settle the set and never
  end the notice or make its revision stale. The notice is at most the body width minus 24 px, with padding
  5, 5, 5 and 14 px and a 14 px gap; its text ellipsizes, Retro and NieR's Undo reverses on hover, and Glass
  uses a 30 px blur at saturation 1.5. NieR's Live word is 11.5 px in the code face with 0.08 em spacing.
  The empty board stays laid out but is visually hidden under its invitation; its three-track sketch has 6
  px gaps and sits 20 px above the title, whose weight is 620. A board card focused by an API move or resize
  returns focus to a menu, prompt, header or Undo notice that held it, unless the person pressed or pointed
  on a board, pressed Tab or F6, or the kind deliberately focused it within 600 ms. A project switch rebinds
  every mounted board whose tab the new layout keeps, hidden ones included, reloads custom names and
  refreshes the catalog; an unmounted tab writes to its prior project. A named layout restores only
  envelopes saved for the current project, skipping another project's envelope; a custom board that the
  applied layout does not hold keeps its current contents. The lab-only Demo time reads on paint, on each
  beat and every 2 s while the demo hour plays and the tab is visible; its Board rows remain Play the next
  hour or Back to now, disabled with the availability reason, within F3-649's Demo Studio.
  Amended 2026-10-16 (DL-214; Jared's 2026-10-15 panel item 1): the Home board opens as the pinned 36 px
  Home tab from every path, the "+" menu, the Board menu and a page's subtab, never as a second, unpinned
  tab at natural width.
gui_related: true
gui_classification_reason: Defines how a dashboard looks and behaves as a tab kind in any panel.
split_recommended: false
depends_on: [DL-180, DL-186, F3-514, F3-631, F3-635]
unblocks: [WS-030, ATS-075]
acceptance_criteria:
  - "A dashboard opens as a tab of kind dashboard in any panel; several may be open, each holding its own board on the Usage board engine, and Agents is drawn by the kind with its filters and no board record."
  - "A dashboard tab can show every Usage widget, no four-widget limit applies, and no old Home widget (run progress, lanes, results) or Home (current) board appears on any dashboard."
  - "Home, Metrics and Monitoring open with their own default sets; a new custom dashboard opens empty, shows the invitation with Add widget and Start from..., and puts focus on Add widget."
  - "A dashboard tab uses the panel's one strip and has no strip of its own."
  - "The widget grid, Add widget and widget gestures act only inside the tab and never move or size panels; gravity and Tidy behave as on the Usage page, each settled change one transaction."
  - "The board's width class follows the tab's own width, the board sits on Home's tab surface in every look, and a dashboard's widget layout is never written into the Home layout record."
  - "Range and scope are chosen per dashboard and change only that board, through ui.widget_board.set_view with no receipt and no event."
  - "Start from lists This dashboard, Dashboard starter, the 13 Usage room sets in room order and Your presets; a pick dispatches one cmd.widget.reset_layout with that set's set_id, and the Undo notice that follows puts the board back as it was through one cmd.widget.reset_layout with restore_revision and no set_id, offered only while the notice is up and refused without dispatch and disabled with a reason once any other board change was committed since, excluding the preset hold's settling resizes (amended 2026-10-10, lead ruling)."
  - "Saving, renaming and deleting a preset dispatch no command; a saved preset shows in Start from on every dashboard of every project, and deleting it leaves the dashboards that used it unchanged."
  - "A custom dashboard is renamed from Rename dashboard... or by renaming its tab, each renaming the other, and is deleted only after the confirm, which closes its tab and forgets its board and name; Home, Metrics, Monitoring and Agents show no Rename dashboard... or Delete dashboard...."
  - "Each board's contents belong to the project: a project switch shows that project's boards and lists only its own custom dashboards."
  - "A closed custom dashboard can be reopened with its board while it is in the reopen list and is forgotten once it leaves it unless it is open; a named layout puts back the boards it saved, and a save whose boards exceed 64 KB keeps the layout without them and says so."
  - "A board's first show plays the reading-order entrance (none under Reduced Motion); Details opens the Usage page's inspector for that widget; a board that is not on screen does no live work, and nothing animates at idle except one live change per applied batch while Live is on."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Widget_System.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-186"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md, SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D35)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/D10-DESIGN-per-instance-boards.md, SHA-256 927d0ed893c513f2f20efa3ff678f19ba785ac43cf84d690412038daa5d41796 (P1-P13; Jared's answers relayed by the planning thread, pm-mail 1010191613-9ce1; design lineage only)"
  - "The panels thread's build facts, pm-mail 1010221905-e13e and 1010223444-a10e (2026-10-10)"
  - "Concepts/home-redesign/NUMBERS.md (SHA-256 77e9c04c23959812da6799a54708c487fcb2f33f342219a1c79dae9c396614d7) and CONTRACT.md section 3.1 (SHA-256 8b1222cde3bb53a6ce534f5e436cc20b8829a230612b9e38654f5174e8d013b9) at c4e32ec0b7 on branch concept/home-panels-20261009 (the dashboard kind as built; concept lineage only)"
  - "Concepts/home-redesign/src/panels/kinds/30-dashboard.js at c4e32ec0b7 on branch concept/home-panels-20261009 (labels, prompts and confirms as built; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md, SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)"
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D10)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md, SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md, SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8 (audit lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-NUMBERS-51c316e18b.md, SHA-256 a9c42b88e5cb50706ff1716a254cb68e026a538bb7a0c840905779a9a482cff2 (small-round concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-CONTRACT-2926ad987e.md, SHA-256 c579d0dfef41fd1fc7327d14c2adb9e2b101c24b216ff64a9db5fc19895ad989 (small-round concept lineage only)"
  - /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/aec2916c94--Concepts--home-redesign--src--panels--kinds--30-dashboard.js,
    SHA-256 68f488e94f6ffb0927ea52c46a03771d93f9dde05a7852b2f19170fe0a9781e5 (Q16 landed on main as aec2916c94;
    source lineage; not native certification)
  - /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/c0305227f7-friendly-lavender.diff,
    SHA-256 fb6f7127bfa67d809d9fdfef3b44da8603511e24c4782b1f24627376566a3b77 (landed main c0305227f7;
    Jared approved lavender 2026-10-15; source lineage)
preserved_exact_tokens:
  - "dashboard:home"
  - "dashboard:dash-<n>"
  - "widget_layout:v1:<project_id>:<board_id>"
  - "UF-062"
  - "Start from"
  - "set_id"
  - "Save as preset..."
  - "Rename dashboard..."
  - "Delete dashboard..."
  - "New dashboard"
  - "Reset widgets"
  - "Already on this dashboard"
  - "ui.widget_board.set_view"
  - "ui.widget_preset.save"
  - "64 KB"
negative_constraints:
  - "Do not limit a dashboard tab to the four widgets of F3-279."
  - "Do not lay out panels with the widget grid or store dashboard widget layout in the Home layout record."
  - "Do not give a dashboard tab a strip or tab model of its own."
  - "Do not keep the old Home widgets, a Home (current) board or a dashboard engine of its own beside the Usage board engine."
  - "Do not delete Home, Metrics, Monitoring or Agents, or offer Rename dashboard... on them."
  - "Do not dispatch a command or emit an event for a dashboard's range or scope, or for saving, renaming or deleting a preset."
  - "Do not draw a dashboard's board on the Usage page's background, or let a board that is not on screen do live work."
compatibility_only_notes:
  - "Earlier text, lineage only (DL-180, 2026-10-09): Several dashboard tabs may be open, each a board with its own widget layout; `dashboard:home` is the Home dashboard, pinned in the default layout, and the \"+\" menu's Dashboard row lists the project's boards. The board's columns follow the dashboard tab's own width, never the window. Hosting, the boards, the per-board widget layout `widget_layout:v1:dashboard:<board_id>`, the catalogue and the move of today's one dashboard into `dashboard:home` are Plans/Widget_System.md#WS-030's. The Usage board engine runs several boards at once after the Usage port lands (this thread family does that refactor), and the per-kind widget presets tested at 400, 550 and 700 px are Plans/Widget_System.md#WS-017's one per-kind table (DL-176)."
  - "Earlier text, lineage only (R35, panels NUMBERS 6026fa8432): Below 200 px height the shared-holder note hides its icon and sub-line. Add widget is a 24 px target, about 98-119 px with its label and 24 × 24 px below 520 px; Show it here and Open transcript use 32 px document actions. Text formerly 10 px or 9 px inside the board is 11 px; compact status labels are 11/16 px with 10 px glyphs, lane dots 8 px and agent bars 4 px high with a 1 px radius. Card buttons have an 8 px radius and header Add widget 6 px, both 0 in Retro and NieR. Shared grid content has one holder: explicit activate or reveal claims it; an open while another grid is visible shows the note; hiding hands over to another visible grid and closing parks it. Widget-grid columns, reset sizes and reset-save timing are Plans/Widget_System.md#WS-030's. These described the old Home widgets moved between dashboard tabs, which left Home with DL-186."
  - "The concept keeps custom dashboard names in pm.home.dashboards:v1:<project>, names its engine and hooks PMU.boards and PMW.dashboard, and gives its preset record a schema id of its own; those are concept lineage. `widget_presets:v1` is the product key for the person's presets (section 15.1), and the records are WS-030's and storage-plan's."
  - "The concept's agents, their models and progress, and its build-failure notes for a missing board engine are demo data or build lineage, not canon."
stale_retired_dispositions:
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Adds dashboard tab presentation dimensions and shared-holder behaviour."
  - "Amended 2026-10-10 (DL-186): Every dashboard tab is its own board on the Usage board engine: built-in and custom dashboards, per-project boards, per-dashboard range and scope, Start from with set_id and Undo, presets, rename and delete, the reopen-list and named-layout rules, the entrance, the empty board, Details to the Usage inspector, Home's tab surface and live readings per board; the old Home widgets, the shared-holder note and the wave 1 board key leave."
  - "Amended 2026-10-10 (lead ruling on the Undo after Start from): Undo dispatches cmd.widget.reset_layout with restore_revision, the board's committed layout revision just before the Start from."
  - "Amended 2026-10-11 (wave 2, panels NUMBERS 51c316e18b): Dashboard controls gain the remaining round-two menu, name, focus and Undo details."
  - "Amended 2026-10-11 (wave 2, panels NUMBERS 51c316e18b): Only Agents uses the measured card-body padding; the engine board keeps its own layout."
  - 'Amended 2026-10-16 (DL-214): Friendly''s Live mark is lavender (#6F55A8, #D2C4EE in dark); it read
    the rose #C2557A and #E07BA0, outside Friendly''s palette.'
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Widget_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Decision_Log.md#DL-186, ContractName:Plans/Widget_System.md#WS-030, ContractName:Plans/Widget_System.md#WS-019, ContractName:Plans/Widget_System.md#WS-017, ContractName:Plans/usage-feature.md#UF-062, ContractName:Plans/usage-feature.md#UF-107, ContractName:Plans/FinalGUISpec.md#F3-279

### F3-639 — The Code Editor Tab

```yaml
plan_unit_id: F3-639
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The editor is a document tab kind (F3-635) that keeps the two things Jared likes and polishes them (DL-180,
  D21): its tabs are the contact-aware strip of F3-631, and its scrollbar is the minimap, the only scrollbar of
  the code pane, with its change marks. Plans/FileManager.md#F-073 stays the minimap scrollbar's file-side owner
  (its canvas, its thumb, click to jump, drag to scrub, one scroll authority); this unit owns how it looks in
  each look (F3-647). The editor adds sticky scroll, so the scopes that enclose the top visible line stay pinned
  at the top of the code pane; find and replace in the file; go to line; a diff mode that shows the two sides
  side by side when the tab body is wide and inline when it is narrow, switching by the body's own width
  (F3-635); preview tabs (F3-634); syntax colours per look from each look's token table (F3-426); and the
  JetBrains Mono code face in every look, Retro included (D17a; F3-644 owns the face, and DL-161, F3-426 and
  F3-430 own general code text elsewhere). It uses the shared header row only where it needs one (F3-635). Its
  settings (scheme choice, font size, minimap, sticky scroll, diff layout, word wrap) are SSYS-050's. This
  amends F3-140 and section 7.18 (editor groups are now panels, F3-630) and F3-505's editor-only scope. The
  editor's ⋮ menu opens the full Customize screen of F3-650; its appearance, caret, token-color and indentation
  behavior is F3-651's. Its own scheme choice defaults to "Follow look", using the per-look syntax colours
  above, and can select any scheme from the same code colour-scheme catalog. Retro's editor syntax stays
  monochrome: brightness and weight in dark, the black and red ribbon in light. Its colour follows the
  terminal's Retro scheme choice, Phosphor Green or Amber; choosing Amber turns Retro's editor syntax amber.
  That choice is stored once in F3-642's terminal appearance model; the editor reads it and keeps no copy.
  Selecting a catalog scheme writes all 17 syntax colours and the editor's background, gutter, text, caret,
  selection, line numbers, current line, find hits, minimap ink and diff tints. Under a scheme, syntax tokens,
  text, secondary and dim text, line numbers and diff signs keep at least 4.5:1 contrast, and the find-hit ring
  keeps 3:1. Catalog schemes meet these floors as authored (F3-642), so the editor draws their values as they
  are; the floor and the catalog's values are one rule. The floors still apply when the editor draws an imported
  scheme's colours. The ⋮ menu's Appearance... row shows the scheme name or Follow look together with the font
  and size. Editor measurements: line height is round(font size × line-height multiplier), 20 px at 13 px ×
  1.55; character width is measured, 7.8 px for JetBrains Mono at 13 px. The line-number gutter is max(3 digits,
  line-count digits) × character width + 16 px, plus a 16 px sign column, 56 px under 1,000 lines, with 10 px
  between gutter and text. The header plate is a 30 px row and 1 px hairline, with 11 px blur and 140 %
  saturation at 72 % opacity; Glass uses an unblurred 90 % plate and NieR an unblurred 92 % paper plate. The row
  hides below 150 px body height. The minimap track is 22 px wide, with a 13 px line lane and 4 px mark lane;
  below 420 px body width, or with the minimap off, it becomes a 10 px marks-only track. Its thumb is at least
  24 px and centred on the exact visible range; the lane maps 80 columns. Files that fit draw at 3 px pitch with
  no thumb; long files aggregate per pixel row. The horizontal thumb is 6 px, appears on hover or scroll, and
  fades after 900 ms. Sticky scroll shows at most 3 lines, with a 1-5 line range, and turns off below 240 px
  code-area height. Automatic diff uses side by side at 900 px and returns inline below 852 px, with 48 px
  hysteresis; forced side by side falls back inline below 600 px, and switching waits for the final resize call.
  Changes show 3 context lines, never fold 1-2 lines at file edges, and mark words only for pairs at least 40 %
  alike. Find is min(440 px, body minus track minus 24 px), becomes a full-width bar below 440 px, hides toggles
  below 340 px, uses 24 px targets and caps hits at 9,999, displayed as 9999+. Go to line is min(320 px, body
  minus 24 px). The focus band uses code.editing.goto-highlight-ms, default 5,000 ms, then fades for 600 ms,
  instantly under Reduced Motion. Reveal is 150 ms per row with an 8 ms stagger capped at 40 rows in the first
  viewport only; caret blink is 1.06 s and the thumb has no easing. Undo groups changes of one kind on one line
  within 900 ms and keeps 400 steps. Rendering covers visible lines plus 24 above and below; a far jump guesses
  when more than 300 lines past the tokenized prefix; background tokenizing processes 1,200 lines per 12 ms
  slice; brace scopes wait for full tokenizing above 3,000 lines. Saved editor state carries path, reveal line,
  scroll top, mode, optional diff layout and the bounded appearance override of SP-333; buffer state adds title,
  language and edit or read-only state; a buffer's text is not saved in the tab state
  (Plans/storage-plan.md#SP-330), and an unsaved buffer's text is kept by unsaved editor recovery
  (Plans/storage-plan.md#SP-169) (amended 2026-10-10). The line is a reveal target and top restores scroll.
  Untitled buffers are numbered Untitled 1, Untitled 2 and onward. Editor keys are Ctrl+F, Ctrl+H, Ctrl+G,
  Ctrl+S, F3/Shift+F3 and Alt+F5/Shift+Alt+F5 for next/previous change; find uses Alt+C and Alt+R, Ctrl+Shift+1
  replaces one and Ctrl+Alt+Enter replaces all; Alt+W remains the host close key and whole word has no shortcut.
  Scheme tints in dark/light are add 12 %/10 %, modified 10 %/8 %, deleted 12 %/9 %, conflict 15 %/12 %,
  added-word marks 30 %/22 % and deleted-word marks 30 %/20 %. Current line is 5 %/6 % of foreground, focus band
  ANSI blue at 16 %, minimap ink alpha .28/.34. Retro dark Amber uses foreground, caret and selection #ffc25f;
  keywords and current line numbers #ffedd1; strings, links and code #ffd797; comments and line numbers #c37800;
  functions, macros and tags #ffdfad; types #ffce7e; numbers, escapes, headings and variables #fff3de;
  punctuation #e38c00; properties and attributes #ffcc79; current-line wash rgba(255,194,95,.06), focus band
  .14, find-hit fills rgba(255,243,222,.18/.34) and ring #fff3de. The concept's measured 10,000-line scroll step
  about 1.2 ms, far jump about 8 ms and keystroke about 8 ms (about 120 ms before isolation) are source
  measurements, not native certification.
  Amended 2026-10-17 (DL-228): the editor tab's header row holds the caret position ("Ln N, Col N"), which
  opens Go to line; in diff mode Previous change and Next change and the diff layout menu (Automatic, "Side by
  side from 900 px wide"; Side by side; Inline), whose pick is that tab's view state; a Changes toggle ("Show
  what changed since the last commit" or "Back to the file"), disabled with nothing changed; Find; and More.
  More holds, in order: Go to line, Find and replace, the Word wrap, Minimap and Sticky scroll checks
  (F3-651), Appearance... with its scheme, face and size as the second line, Indentation... with its size and
  source ("2 spaces · from the file"), Save while the buffer has changes, and Copy path ("Path copied").
  Closing a tab with unsaved changes asks "Save changes to <name>?" with Save, Close without saving and
  Cancel. Ctrl+P's Open a file lists Recent (five), Files and Changed in the chat with each file's chat
  status, a chat-changed file opening at its changed line; its foot reads "Enter opens it here · Alt+Enter
  opens it in a new panel". Save is FileManager's one save path, the editor's Ctrl+S; Copy path is
  cmd.file.copy_path; Find, Find and replace, Go to line and next or previous change are view-local editor
  actions with the keys above, so no command id is added for them. The side-by-side width is fixed at 900 px
  with its 48 px return and is not a Settings row; the concept's registered width key is lineage.
gui_related: true
gui_classification_reason: Defines the code editor as a tab kind and the editing features it adds.
split_recommended: false
depends_on: [DL-180, DL-183, F3-505, F3-631, F3-635, F-073]
unblocks: [SSYS-050, ATS-075]
acceptance_criteria:
- The editor's tabs use the one strip and its seated chip (DL-214; amended 2026-10-17, DL-228, from silhouette),
  and the minimap is the only code-pane scrollbar with its change marks.
- Sticky scroll, find and replace, go to line and preview tabs work in every editor tab.
- The diff mode shows side by side when the tab body is wide and inline when it is narrow, decided by the body's width,
  never the window's.
- With Follow look, syntax colours follow each look's token table, and the code face is JetBrains Mono in every look,
  Retro included.
- No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are
  created by this unit.
- The editor scheme choice defaults to Follow look, can select any catalog scheme and opens the shared Customize component
  (F3-650/F3-651) from its ⋮ menu.
- Retro editor syntax remains monochrome in dark and keeps the black and red ribbon in light; Phosphor Green or Amber
  follows the one terminal Retro scheme choice, Amber turns the editor amber, and the editor stores no copy.
- Every scheme supplies 17 syntax tokens, paints all listed editor surfaces and meets the 4.5:1 text and diff-sign
  floor and 3:1 find-hit ring floor; Appearance... opens the complete F3-650/F3-651 screen.
- The editor Appearance entry opens F3-650's full Customize screen, and the editor's 4.5:1 floor for syntax tokens
  holds when it draws any catalog or imported scheme.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/FileManager.md
  - Plans/Settings_System.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md,
  SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-2.md,
  SHA-256 1eecc96b03a1a774f52d06420c913553d5f5d1917e1bd5705e2f6e0bbc11fad6 (D30)
- Plans/Decision_Log.md#DL-180
- Plans/Decision_Log.md#DL-183
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D21, D17)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS-ADDENDUM-1.md, SHA-256 1651ae9c41a61f215ee960288b27bb78ee8d9ad804c741495e3313ff4a33e299
  (D17a)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md,
  SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-e741dfbc6c.md,
  SHA-256 5fe7d1e04e5e54c47013c503254527265b94420239772ac711f760f43f96674d (R36; concept lineage only)
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
preserved_exact_tokens:
  - "sticky scroll"
  - "find and replace"
  - "go to line"
  - "JetBrains Mono"
negative_constraints:
  - "Do not add a native scrollbar beside the minimap scrollbar."
  - "Do not switch the diff layout by the window's width."
  - "Do not use IBM Plex Mono or VT323 as the editor's code face in Retro."
compatibility_only_notes:
  - "The width at which the diff turns inline was a concept number still to come (wave 2); retired 2026-10-10 (R35, panels NUMBERS 6026fa8432): the canonical text now gives side by side at 900 px and inline below 852 px."
  - "The concept saves an untitled buffer's text, up to 12,000 characters, in its tab state (panels NUMBERS 6026fa8432, editor saved state); that is concept lineage only: lead ruling L25 (2026-10-10) keeps buffer text out of the Home record (SP-330)."
stale_retired_dispositions:
- 'Amended 2026-10-10 (R36, terminal SPEC e741dfbc6c): The editor''s Appearance popover offers only scheme, font and
  size, and catalog schemes meet the editor''s 4.5:1 syntax-token floor as authored, so the editor draws their values
  as they are; the floor and the catalog''s values are one rule.'
- 'Amended 2026-10-10 (R35 review, SP-330): A buffer''s tab state keeps title, language and edit or read-only state
  only; its text stays out of the Home record and the concept''s 12,000-character text state is lineage (lead ruling
  L25: SP-330 does not admit buffer text).'
- 'Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Adds editor metrics, minimap, sticky scroll, diff, find, rendering,
  undo, state and scheme tint numbers.'
- 'Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Specifies scheme-painted editor surfaces, contrast floors
  and Appearance row detail.'
- 'Amended 2026-10-10 (D30, DL-183): Retro editor syntax reads the terminal Retro scheme choice once and keeps no
  copy.'
- 'Amended 2026-10-10 (D30, DL-183): Shares the code colour-scheme catalog and Appearance popover with the editor
  and terminal.'
- 'Amended 2026-10-14: The editor-only scheme/font/size popover is replaced by F3-650 and F3-651.'
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/FileManager.md

```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FileManager.md#F-073, ContractName:Plans/FinalGUISpec.md#F3-644, ContractName:Plans/FinalGUISpec.md#F3-505

### F3-647 — Panels And Tabs In Every Look

```yaml
plan_unit_id: F3-647
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Every panel surface, the strip, the "+" menu, the "+N" list, the empty-panel launcher, the panel
  and tab menus, the dividers, drag ghosts and landing previews, is designed in Friendly, Glass,
  Retro and Basic, light and dark, and in NieR Mode and Reduced Motion, from the first build
  (DL-180, D23). Friendly, Glass and Basic mark the active tab with F3-631's seated chip (DL-214; amended
  2026-10-17, DL-228, it read: draw the fused silhouette with their own crown, shoulder and flare, the active tab one
  surface with its body); Glass keeps its 1 px glass rim on
  the plate, goes to .92 opacity only while a tab is carried (F3-505), takes its replacement sheet
  and lens material from F3-652 since the 2026-10-15 publication; the old closed Glass blur count is
  superseded. Retro: reverse-video tabs (the active tab a phosphor-filled block with dark text),
  bracket glyphs ("[+7]", "[+]"), the reverse-video chip in place of the notch and its stepped corners (DL-214), kind icons as glyphs of at most
  two cells from the code face (never emoji), the dirty mark an asterisk after the label, box-drawn
  menus with a hard frame and reverse-video rows, dividers drawn as a single box-drawing line that
  doubles while hovered or dragged, and a dithered landing preview with a box-drawn outline; Retro
  motion snaps and never springs, and its three rotating effects play on selection and reorder
  (F3-631). NieR Mode paints only while NieR Mode is on, and each touch is gated by its own
  installed part, using the existing part keys only and never a new part (SSYS-043, F3-598, DL-152):
  square gives the chip square corners (the chamfered silhouette with a straight foot it gave is superseded by
  DL-214), an
  ink rule under each strip, square dirty and attention marks, hairline dividers with ticks and a
  hatched landing preview; cursor fills the active tab and hovered or chosen menu and launcher rows
  with ink, the YoRHa menu cursor, puts the square list cursor before the focused panel's active
  label and gives other panels' active tabs the same ink fill as their fused panel; headers sets tab
  labels, "+N" and menu headings in the YoRHa caption treatment; brackets puts target brackets on
  the focused or chosen item; icons draws kind icons with square strokes; empty draws the
  empty-panel launcher's ink empty state; ground shows the parchment dot grid between panels. NieR
  colours come only from the NieR token tables or the ordinary theme tokens NieR repaints; NieR
  motion is stepped, with no glow, filter or blur, loops only by transform or opacity, and no
  surface larger than 340 x 256 px reverses its opacity more than once a second; there is one NieR
  Mode editor and one reboot plate (DR-056). Reduced Motion: every gesture, glide, settle, spring
  and effect is instant (every duration of F3-630 and F3-631 is 0), the Retro effects and NieR fills
  show their end state at once, drags still work and still show their landing previews, and NieR's
  Still and Colors only presets show end states at once. Hover follows the merged hover system:
  Plans/DRY_Rules.md#DR-072 owns its grammar and boundary and F3-465 its behaviour. Tab,
  strip/header and terminal icon buttons consume F3-465's small-control marker without card magnet.
  Dividers use F3-657's shared resize feedback; editor and terminal text stay outside card effects.
  Card hover rests during a divider drag. No look draws a forbidden pill label, coloured side stripe
  or chrome emoji under F3-648 and its explicit exemptions. This supersedes F3-505's and F3-466's
  per-theme tab skins where they differ, and gives the home panels the NieR Mode treatment they
  lacked (DL-144 and DL-152 covered the chat, onboarding and the Tour). Retro's editor syntax stays
  monochrome: brightness and weight in dark, the black and red ribbon in light. Its colour follows
  the terminal's Retro scheme choice, Phosphor Green or Amber; choosing Amber turns Retro's editor
  syntax amber. That choice is stored once in F3-642's terminal appearance model; the editor reads
  it and keeps no copy. The active tab's chip follows the look's selection grammar (amended 2026-10-17, DL-228; it read:
  the active tab and its panel are one shape in every look; the shape's fill follows it): the body's fill in Friendly, Glass and Basic, reverse video
  in Retro, ink in NieR. Glass's 1 px rim along the crown is material, not an accent. Text and state
  colours, including dim text, accent, ok, warn, bad and inactive tabs, reach at least 4.5:1 in
  every look and in NieR. They are mixed from the page's own colours so the Settings accent flows
  through. A primary button chooses black or white ink from the fill's luminance and keeps at least
  4.5:1 contrast. Kind icons consume the shared F3-658 glyph registry; the earlier ASCII kind
  substitutions are compatibility lineage, not a second icon set. Each kind supplies its icon to the
  strip, +N list, every-tab list and recent-tab switcher through the one registered icon source.
  Primary-button black/white ink switches at fill luminance Y 0.1791, with a 4.58:1 theoretical
  floor. Source measurements changed Glass light from 1.75:1 to 4.68:1 (hover 7.3:1), Friendly light
  from 2.97:1 to 6.79:1, and give at least 4.68:1 in every look; the required floor remains 4.5:1.
  The menus' nested levels and Back consume F3-632. Basic, Friendly and Glass exchange levels on one
  axis with their own crisp, gentle or soft voice, the old level gone before the incoming text
  becomes visible; Retro and NieR cut the old level and step in the new. The plate morphs its size
  and position without row reflow, keeping its bottom edge when it opens upward. Reduced Motion
  swaps immediately.
  Amended 2026-10-16 (DL-214, the consistency pass): the active Home tab in every look is F3-631's
  switcher chip, Retro's reverse-video block seated on its rule line. The add-a-tab picker's search is the
  look's own search field, a raised surface with the look's hairline and corner, and in Glass one seamless
  Glass field whose typing area blends into its bar (as F3-652's Find fields). Every control draws only
  its own look's palette: Settings' primary buttons take the look's accent with its on-accent ink, Retro's
  the reverse-video key the chat's primary buttons use; danger buttons take the look's own red and
  attention notes its own amber; Projects, the Planning Wizard and the Orchestrator take each look's own
  hues; Glass Dark's quieter Settings words and its toggle key take Glass's cool white, not lavender. Hues
  kept on purpose: swatches that show a real choice, Basic's Usage good teal (its colour-blind separation
  from warn), the approved glyph status cyan and the Usage pulse in Glass, Settings' pick-several chip
  toggles in the palette's accent (their checkbox carries the state), and Friendly Light's own lavender
  borders.
gui_related: true
gui_classification_reason: Defines how panels, strips, menus, dividers and drags render in each look, NieR Mode and Reduced Motion.
split_recommended: false
depends_on: [DL-180, DL-152, SSYS-043, F3-598, F3-465, F3-631, F3-632, F3-633]
unblocks: [ATS-075]
acceptance_criteria:
- Each panel surface listed here renders in the eight family variants, NieR Mode and Reduced Motion with
  the treatments stated.
- Retro shows reverse-video tabs, the seated reverse-video chip, bracket glyphs, box-drawn menus and dividers and kind
  glyphs of at most two cells, and its motion snaps.
- With NieR Mode off no NieR touch draws; with it on each touch appears only when its part is installed,
  every colour resolves to NieR or repainted theme tokens, and no glow, filter or blur is used.
- Under Reduced Motion every panel and tab duration is 0 and drags still show landing previews.
- Small controls use F3-465 without card magnet; dividers use F3-657.
- Glass panels and strips use F3-652 since the 2026-10-15 publication; the old closed blur budget is superseded.
- No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build
  tasks are created by this unit.
- Retro editor syntax remains monochrome in dark and keeps the black and red ribbon in light; Phosphor
  Green or Amber follows the one terminal Retro scheme choice, Amber turns the editor amber, and the editor
  stores no copy.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md,
  SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-2.md,
  SHA-256 1eecc96b03a1a774f52d06420c913553d5f5d1917e1bd5705e2f6e0bbc11fad6 (D30)
- Plans/Decision_Log.md#DL-180
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D23, D24)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/NIER-RULES-for-new-surfaces.md,
  SHA-256 4634aba3abe147493c0f71de49419e63ba667a6784ca4b36967b537abb231728 (the NieR lead's rule for new
  surfaces)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md,
  SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/proposal-visual.html, SHA-256
  52dd51521a1266e39a2ab6b274176d89666baaaacb1d933e5cc2237c151ab981 (the agreed anatomy; concept lineage
  only)
- Concepts/home-redesign on branch concept/home-panels-20261009 at 1565156bce (concept lineage only)
- /mnt/Cursor/share/puppet-master/2026-10-10-glyph-catalog-addendum/README.md, SHA-256 3d0497f01c878e8aa6f99fa8f602b9b3dbf887aead2a24d62c12969bd47a1d31
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-resize-glow/NOTES.md, SHA-256 0a20256d730c5b51cda138b14845a5dc2e7dfdda04385a3956721a73fb657c16
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-hover-polish-all-looks/NOTES.md, SHA-256 6a86e56a9edc818c4a6c812e484e40c377cf7657180d652457de64ab82fdb12c
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-glass-v3/README.md, SHA-256 0e424cba2f2d03932159b6e25977959f23d8f65cbcca57ca1d067b505f61db54
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-glass-review--LANDING.md,
  SHA-256 4585c89ab98c4ee6c88f0683ac8d00244725047fe2637fe657371ec42cff17bd (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-panels-picker-back--NOTES.md,
  SHA-256 29bac44f166cb8e0e67f4f00634cb15d0a3be576eb2f68e7e19606f3a4a1a71c (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-consistency-pass--NOTES.md,
  SHA-256 3065192be40e317876ab989ca939d0d016faeec1f8592628a3a2d1edfb5de5ae (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/aec2916c94--Concepts--onboarding--opus-5.5--src--css--61-look-palette.css,
  SHA-256 44f2e9a4e741db9ae8f3adc283713a6b3399e7b5cc57bb3c6eb58cdc19458e23 (Q16 landed on main as aec2916c94;
  source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-15-consistency-pass--JARED-FEEDBACK-20261015.md,
  SHA-256 afd66d07739267c5a7d7d6f711af6bd7a709062ef5afd8f3834d2ea819a4dda5 (Jared's 2026-10-15 panel items
  and the Retro chip ruling; decision lineage)
preserved_exact_tokens:
  - "NieR Mode"
  - "square"
  - "cursor"
  - "headers"
  - "brackets"
  - "icons"
  - "empty"
  - "ground"
  - "[+7]"
  - "[+]"
negative_constraints:
- Do not add a NieR part, or paint a NieR touch while NieR Mode is off or its part is not installed.
- Small controls use F3-465 without card magnet; dividers use F3-657.
- Glass panels and strips use F3-652 since the 2026-10-15 publication; the old closed blur budget is superseded.
- Do not use an emoji as a kind icon in any look.
compatibility_only_notes:
  - "The concept also gates some touches by its own hook names and by part keys outside this list; only the existing part keys named here are canon."
stale_retired_dispositions:
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Uses the shared icon glyph grammar and primary-button luminance crossover."
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Requires page-derived text and state contrast and luminance-selected primary-button ink."
  - "Amended 2026-10-10 (D30, DL-183): Retro editor syntax reads the terminal Retro scheme choice once and keeps no copy."
  - "Amended 2026-10-10 (lead ruling L5): The active tab and its panel share one shape and the look selection fill; the Glass crown rim is material."
owner_hints:
  - Plans/FinalGUISpec.md

```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/DRY_Rules.md#DR-072, ContractName:Plans/FinalGUISpec.md#F3-465, ContractName:Plans/DRY_Rules.md#DR-056, ContractName:Plans/FinalGUISpec.md#F3-598

### F3-648 — No Side Stripes, No Emoji, No Pills: Presentation

```yaml
plan_unit_id: F3-648
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Puppet Master's chrome follows one shell-wide rule (DL-184; the rule is
  Plans/DRY_Rules.md#DR-069): no box with a coloured border or stripe on one side, no emoji, and no
  pill-shaped labels, meaning status chips, tags, suggestion chips and state badges. Pill action
  buttons such as Install and Sign in, and rounded Friendly/Glass action buttons, are allowed;
  keyboard key caps and non-label progress marks are not labels, and a program's own output in a
  terminal may contain emoji. This unit owns how the rule looks. Selection is shown by the surface
  itself: the seated tab chip (F3-631, DL-214; amended 2026-10-17, DL-228, it read: the fused tab silhouette), a
  filled or tinted row, the NieR square cursor, Retro
  reverse video, or a fill or outline on the element's own box; never an edge stripe. A status is a
  mark and a word from the one status set (F3-658, consumed by F3-585 and F3-619), a count is a
  plain number, and an icon is a bundled SVG icon_id (section 2.6). Where an owner unit says pill,
  chip or badge for a status or a count, it renders as a mark and a word or a plain number; action
  buttons may retain their approved rounded shape, while tabs and selectors use their specified
  joined/fused geometry. Retired defaults, each amended in place with a dated note: section 3.5's
  "3px left-edge accent stripe" as the active or selected indicator and F3-039's token for it;
  Appendix C's and F3-276's accent left border on call-to-action cards; F3-469's 3 px inset left
  accent bar; the workgroup pill of section 5.1; and the pill skins of F3-422 (the chat footer
  pill), F3-463 (the Orchestrator strip's pills), F3-464 (the page tabs' frost and mint-mix pills)
  and F3-467 (Friendly's pill fields). The chat's, Settings' and the left rail's own statements of
  the rule (APR-034, F3-534, Settings section 22, F3-618, F3-619, DR-057) stay, as instances of this
  one rule. Checks: F3-619's pill detector (an element whose corner radius is at least half its
  height and which has a fill or a border, label-like elements only; action buttons, key caps and
  non-label progress marks excepted) and a side-border detector (a coloured border, or an inset
  shadow standing in for one, of 2 px or more on one side only) find nothing in any look except the
  structural rails of working activities (APR-034, DR-069), and no emoji appears in chrome text or
  icons. A chosen option is filled on its own box, never underlined. Debug Console sub-tabs and
  every segmented toggle use each look's neutral selection fill in Friendly, Glass and Basic, never
  an accent; Glass adds its 1 px rim on the top edge of the filled box, Retro keeps reverse video
  and NieR its ink block (F3-490). Every joined/segmented choice consumes F3-438's shared fitting,
  motion and keyboard-focus grammar. Projects consumes this same rule: card status is a mark and
  word, stack tags are words with a small square, and New Project templates are joined choice cells
  with a clear selected state. A running mark may breathe while its word stays at full readable ink;
  Reduced Motion keeps the mark still. Action-button rounding remains allowed.
  Amended 2026-10-17 (DL-228): F3-619's pill detector measures the short side, not the height, so an upright
  capsule counts too, and takes a shape for a pill only when it is elongated, never a round or square mark;
  full-width top and bottom rules are dividers, not side stripes; a status or tag label draws no box at all
  (no fill, border, shadow or padding), and a tag's mark is square. The detector's tolerances are calibration
  of the check, not product numbers. A hover card and a labelled selector are controls, not label pills: they
  keep their rounded shape under the action-button exception, and the chat's own wording follows this.
gui_related: true
gui_classification_reason: Owns how the shell-wide ban on side stripes, emoji and pills looks, and lists the retired defaults.
split_recommended: false
depends_on: [DL-184, DL-141, F3-585, F3-619]
unblocks: [DR-069, ATS-075]
acceptance_criteria:
- The pill detector finds no pill-shaped status/tag/suggestion/state label in any look; action buttons, key caps,
  switch keys and non-label progress marks are exempt; the side-border detector exempts the structural rails of working
  activities (APR-034, DR-069) and otherwise finds nothing.
- No emoji appears in Puppet Master's chrome; a terminal program's own output is exempt.
- Every retired default listed here carries a dated note in its own unit or section.
- Selection everywhere is shown by the element's own surface, never by an edge stripe.
- No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are
  created by this unit.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-184
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64
  (D22 and Jared's brief)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md,
  SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-CONTRACT-2926ad987e.md,
  SHA-256 c579d0dfef41fd1fc7327d14c2adb9e2b101c24b216ff64a9db5fc19895ad989 (small-round concept lineage
  only)
- /mnt/Cursor/share/puppet-master/2026-10-11-onboarding-no-pills/README.md, SHA-256 1ab0aedc5910ab03097439cf9cd48da77eb7cefad458ca705a556727d327fd1a
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-projects-no-pills--NOTES.md,
  SHA-256 a69eaef00e2ad1f9b1ca65e1f58b766065bd7d3e5ef50b4ff7accd6aa2609d86 (source lineage; not native
  certification)
preserved_exact_tokens:
  - "3px left-edge accent stripe"
  - "accent-left-border"
  - "pill"
  - "key caps"
negative_constraints:
- Do not draw a coloured border or stripe on one side of a box, except the structural rails of working activities
  (APR-034, DR-069).
- Do not draw a pill-shaped label, tag, suggestion chip or state badge.
- Do not put an emoji in Puppet Master's chrome.
compatibility_only_notes: []
stale_retired_dispositions:
- 'Amended 2026-10-10 (lead ruling L21): The structural-rail carve-out applies to the side-border check only.'
- 'Amended 2026-10-10 (lead ruling L21): The side-border check exempts the structural rails of working activities
  (APR-034, DR-069).'
- 'Amended 2026-10-11 (lead ruling 2026-10-11, D29): A chosen option uses its own filled box and never an underline.'
- 'Amended 2026-10-14: The earlier blanket button ban and all-elements pill detector are superseded by Jared''s label-only
  clarification (DL-196).'
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md

```

ContractRef: ContractName:Plans/Decision_Log.md#DL-184, ContractName:Plans/DRY_Rules.md#DR-069, ContractName:Plans/FinalGUISpec.md#F3-619, ContractName:Plans/FinalGUISpec.md#F3-585

### F3-649 — One Demo Studio

```yaml
plan_unit_id: F3-649
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  PMConcept7 has one Demo Studio for every concept surface, modelled on the 5.6 Pro chat's (DL-185, D26; the rule is
  Plans/DRY_Rules.md#DR-070). The Guided Tour's and onboarding's demo controls, the chat's demo controls, the home demos
  and, later, the Orchestrator and Planning Wizard pages' demo controls are sections of that one studio; no surface
  draws a demo panel of its own. The Demo Studio and every control in it are lab only, in the pattern of
  Plans/assistant-chat-design.md#ACD-474: never a product control, setting, command, wiring row, saved value or test
  gate, never shown in the product's menus or Settings, and no canon number comes from them. In the concept it opens
  above the one overlay root and below hover tags and the Guided Tour (F3-635). It follows the bans (F3-648) and the
  looks (F3-647) like any surface. This supersedes the concept practice of a demo panel per surface and changes no
  product unit.
gui_related: true
gui_classification_reason: Defines the one Demo Studio for PMConcept7's concept surfaces and keeps it out of the product.
split_recommended: false
depends_on: [DL-185, ACD-474]
unblocks: [DR-070, ACD-501]
acceptance_criteria:
  - "Every PMConcept7 concept surface's demo controls are sections of the one Demo Studio, and no surface draws its own demo panel."
  - "No product catalog, settings inventory, wiring matrix, persisted key or test gate names the Demo Studio or a control in it."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-185"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D26)"
preserved_exact_tokens:
  - "Demo Studio"
negative_constraints:
  - "Do not give the Demo Studio or any demo control a command, setting, wiring row, saved value or test gate."
  - "Do not draw a separate demo panel per surface."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-185, ContractName:Plans/DRY_Rules.md#DR-070, ContractName:Plans/assistant-chat-design.md#ACD-474
