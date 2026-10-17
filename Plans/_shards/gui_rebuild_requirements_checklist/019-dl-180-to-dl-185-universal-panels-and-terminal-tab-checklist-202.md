# Shard 019: DL-180 to DL-185 — Universal Panels And Terminal Tab Checklist (2026-10-09)

Source: `Plans/GUI_Rebuild_Requirements_Checklist.md`

Source lines: L2092-L2277

Source SHA256: `3339a13bbfaba4d042834f5ababeb6cf7308083f1328b9deecdb81168b85b473`

---

## DL-180 to DL-185 — Universal Panels And Terminal Tab Checklist (2026-10-09)

Jared's home redesign (`Plans/Decision_Log.md#DL-180` to `#DL-184`) replaces the Home that the 2026-08-04 checklist
above was written for. These rows say what the rebuilt GUI must prove for the universal panels and the terminal tab;
GRRC-040 is their gate. They follow the 2026-07-08 repair: each row names its test, its harness, its owner and its
evidence, and a row is `NOT_RUN` until its harness passes; a plan validator, a screenshot or a concept check alone never
turns it into `PASS`. The checklist consumes owner truth and creates no command, event, receipt, schema or persistence
authority. It supersedes the 2026-08-04 Home checklist with the dated note at its head. It creates no WorkNodes,
NodeSeeds, executable queues, implementation files or production build tasks.

Amended 2026-10-10 (DL-186, DL-187, DL-188): Jared's answers of 2026-10-10 (dashboards on the Usage board engine and
custom dashboards, the chat after a restart and its rail entry, the Debug Console's sub-tabs, shells in "+", terminal
tab marks, notifications, secrets in saved scrollback and the total cap) and the admitted `workspace.layout_changed`
2.0.0 are added to the rows they touch as dated notes; no row is added.

| Test ID | Required GUI behavior | Canonical owners | Validator or harness | Evidence ref | Status |
|---|---|---|---|---|---|
| `GUI-PNL-001` | The centre is one split tree of panels: its invariants hold after every change, splits follow the fit rule and shares, dividers have their gaps, hit target and keys, a panel dragged below half its minimum collapses to its 35 px strip with its state kept, maximize is a flag that restores, locked panels stay, and closing the last tab follows the panel lifecycle. | `Plans/FinalGUISpec.md` F3-630; `Plans/storage-plan.md` SP-330 | future ATS-075 split-tree matrix | pending | `NOT_RUN` |
| `GUI-PNL-002` | Every panel, the dashboard's included, has one 35 px strip with 31 px tabs and 8 px gaps (2 px in Retro); the fused silhouette is the only active-tab marker and the active tab is one surface with its panel in every look, Glass dark included; widths, shrink order, pinned tabs, close targets and every mark follow F3-631; drag reorder and Retro's three effects work. | `Plans/FinalGUISpec.md` F3-631, F3-647 | future ATS-075 strip matrix | pending | `NOT_RUN` |
| `GUI-PNL-003` | The "+" after the last tab opens its menu and never makes a tab by itself; rows in order, row body a new tab, trailing cell, Alt+click or Alt+Enter a new panel, Ctrl+T the panel's usual kind; an empty panel shows the same rows as a launcher with recent files. Amended 2026-10-10 (DL-187, D39): the Terminal row lists the installed shells inline and the SSH hosts in one "SSH hosts" submenu row, ungrouped sub-rows are not capped, and the launcher shows the same. | `Plans/FinalGUISpec.md` F3-632; `Plans/UI_Command_Catalog.md` UCC-200 | future ATS-075 "+" and launcher cases | pending | `NOT_RUN` |
| `GUI-PNL-004` | Tabs that do not fit are counted by a plain-text "+N" that opens a searchable list grouped by kind and accepts a dropped tab; the active tab never hides. | `Plans/FinalGUISpec.md` F3-633 | future ATS-075 overflow cases | pending | `NOT_RUN` |
| `GUI-PNL-005` | Every caller opens through the one opening module: one id one tab with reveal, preview and keep, placement of document, dedicated and tool kinds with the tools fallback, locked panels skipped, Alt+click a new panel, agent opens in the background without focus. | `Plans/FinalGUISpec.md` F3-634; `Plans/Contracts_V0.md` CV-360; `Plans/DRY_Rules.md` DR-071; `Plans/assistant-chat-design.md` ACD-500 | future ATS-075 opening-rules matrix | pending | `NOT_RUN` |
| `GUI-PNL-006` | In the file tree a single click opens the preview tab, a double click or Enter keeps it, Alt+click opens a new panel, Ctrl+click opens in the background, an open file is revealed where it is, the context menu starts with Open, Open in new panel and Open to the side, and no Open in Panel 1 to 4 submenu exists. | `Plans/FileManager.md` F-090 | future ATS-075 file-tree cases | pending | `NOT_RUN` |
| `GUI-PNL-007` | Each of the fifteen tab kinds registers once with its id prefixes and content minimum; tab bodies size by their own box; the shared header row follows its widths and heights; every menu opens in the one overlay root; no internal id appears as text. Amended 2026-10-10 (DL-187, D33): the Debug Console is one tab whose session sub-tabs switch the session shown as view state, and old per-session ids fold into it. | `Plans/FinalGUISpec.md` F3-635; `Plans/DRY_Rules.md` DR-065, DR-067 | future ATS-075 kind, header row, overlay and census cases | pending | `NOT_RUN` |
| `GUI-PNL-008` | The narrow ladder folds by centre width in its fixed order with 48 px hysteresis, matches the measured rail, chat and centre widths at 1920, 1680, 1470, 1440, 1280, 1024 and 900 px, and saves none of its states. | `Plans/FinalGUISpec.md` F3-636 | future ATS-075 width matrix | pending | `NOT_RUN` |
| `GUI-PNL-009` | The chat is a fixed column on the right from the title bar to the status bar, never a tab and never moved inside the window; its default width follows the window, its drag range keeps the centre at 960 px or wider, and Pop out is its only way to move, returning to its column. Amended 2026-10-10 (DL-187): the centre floor reads 960 px as F3-637 says (this row's earlier 600 px was the panels contract's first figure), and neither the default width nor a drag ever leaves the Usage page's board under 400 px; a popped-out chat starts back in its column after a restart (D32); the left rail's Chat entry shows or hides the column on every page (D40); a stored Chat Layout value of Overlay or Detached is cleared on first read with no pop-out and no notice; Keep the chat open in narrow windows is on the chat's header menu. | `Plans/FinalGUISpec.md` F3-637; `Plans/assistant-chat-design.md` ACD-500 | future ATS-075 chat-column cases | pending | `NOT_RUN` |
| `GUI-PNL-010` | Several dashboard tabs can be open, each one board with its own widget layout, any Usage widget can be added, the Home board is pinned in the default layout, and widget gestures stay inside the tab. Amended 2026-10-10 (DL-186): the old Dashboard layout is converted into no board (this row's earlier "today's Dashboard layout becomes the Home board's without a reset" is retired), and the old Home widgets leave Home; every board but Agents runs on the Usage board engine with the Usage page's gravity, Tidy and previews; boards are kept per project; a person makes, renames and deletes custom dashboards while Home, Metrics, Monitoring and Agents only reset; Reset and Start from use `set_id`; presets are per person with no command; range and scope are per board; a closed custom dashboard that leaves the reopen list is forgotten; named layouts keep their boards within 64 KB; boards sit on Home's tab surface in every look; Details opens the Usage inspector; the tour's widget step adds Upcoming resets. | `Plans/Widget_System.md` WS-030, WS-019; `Plans/FinalGUISpec.md` F3-638; `Plans/Planning_Wizard.md` PWIZ-035 | future ATS-075 dashboard cases | pending | `NOT_RUN` |
| `GUI-PNL-011` | Artifacts open in the artifact viewer tab through `cmd.nav.open_subject`, with a subtype per type, versioned tabs, honest loading, stale, error and tombstone states, and no other viewer. | `Plans/Runtime_Artifacts_Panel.md` RAP-065 | future ATS-075 artifact viewer cases | pending | `NOT_RUN` |
| `GUI-PNL-012` | The named layouts Home, Build, Terminals 2x2 and Focus apply with their exact trees and proportions and keep every tab, terminal session and unsaved buffer; Restore home layout applies Home the same way; saved layouts keep shape, sizes and slot kinds. | `Plans/FinalGUISpec.md` F3-630; `Plans/Settings_System.md` SSYS-050 | future ATS-075 layout cases | pending | `NOT_RUN` |
| `GUI-PNL-013` | The desktop keyboard map works without Ctrl+1..9 or Ctrl+K, and the web client answers the browser's four chords as Alt+T, Alt+W, Alt+Shift+T and Alt+backtick with every label showing the key that works there. | `Plans/FinalGUISpec.md` F3-635 | future ATS-075 keyboard cases | pending | `NOT_RUN` |
| `GUI-PNL-014` | A v1 Home layout and the Home part of `layout:v1` become the v2 record on first read with nothing reset and nothing lost; corrupt and unknown inputs follow the record's owner. | `Plans/storage-plan.md` SP-330 | future ATS-075 migration cases | pending | `NOT_RUN` |
| `GUI-PNL-015` | Every panel surface is drawn in Friendly, Glass, Retro and Basic, light and dark, in NieR Mode with each touch gated by its installed part, and under Reduced Motion with every motion instant. | `Plans/FinalGUISpec.md` F3-647 | future ATS-075 visual matrix | pending | `NOT_RUN` |
| `GUI-PNL-016` | A lint fails the build on a forbidden pill label under F3-648 (action buttons and non-label marks exempt), a coloured side border or inset side shadow of 2 px or wider, or an emoji in Puppet Master's chrome. | `Plans/DRY_Rules.md` DR-069; `Plans/FinalGUISpec.md` F3-648 | future bans lint | pending | `NOT_RUN` |
| `GUI-PNL-017` | Each structural commit dispatches one command and appends one `workspace.layout_changed`; reveals, `ui.*` actions, menus, hover and drags append nothing; a cancelled or rejected gesture restores the model exactly; every control is in the census with its wiring row. Amended 2026-10-10 (DL-188): each appended `workspace.layout_changed` is at family revision 2.0.0 and validates against its payload. | `Plans/UI_Command_Catalog.md` UCC-200; `Plans/Commands_System.md` CS-100; `Plans/Contracts_V0.md` CV-361; `Plans/UI_Wiring_Rules.md` UIW-040, UIW-041; `Plans/Wiring_Matrix.md` WM-090 | future ATS-075 command and census matrix | pending | `NOT_RUN` |
| `GUI-PNL-018` | The editor tab keeps the contact-aware strip and the minimap as the only code-pane scrollbar, and adds sticky scroll, find and replace, go to line, preview tabs and the side-by-side or inline diff. | `Plans/FinalGUISpec.md` F3-639; `Plans/FileManager.md` F-073 | future ATS-075 editor tab cases | pending | `NOT_RUN` |
| `GUI-TRM-001` | Each terminal tab holds one session that survives moving, collapsing, maximizing, hiding and layout changes; Split makes a new panel; closing asks first; Reopen closed tab and restore start a new session in the same folder and profile and say so. | `Plans/Section15_MVP_Promoted_Features_Spec.md` SMPFS-180; `Plans/FinalGUISpec.md` F3-640 | future ATS-076 session matrix | pending | `NOT_RUN` |
| `GUI-TRM-002` | The tab label, header row, gutter, scrollbar, the More, context and command-mark menus and the inline notices match their owner; there is no bottom bar, no modal notice, no side stripe and no internal id as text. Amended 2026-10-10 (DL-187): no terminal tab shows a colour or icon of the person's choosing on the strip (D34), and Mute notifications sits in the More menu and the tab's menu, absent where the platform has no system notifications (D38). | `Plans/FinalGUISpec.md` F3-640; `Plans/UI_Command_Catalog.md` UCC-201 | future ATS-076 chrome cases | pending | `NOT_RUN` |
| `GUI-TRM-003` | Command marks need the terminal's secret, every command records who typed it, links open by the opening rules, and find, copy mode, quick select, the plain-text buffer and the keys work; no AI action exists in the terminal. Amended 2026-10-10 (DL-187, D38): a program's notification raises a system notification only while Puppet Master is in the background, at most one every 3 s per terminal, and a muted terminal raises none. | `Plans/FinalGUISpec.md` F3-641; `Plans/Section15_MVP_Promoted_Features_Spec.md` SMPFS-183 | future ATS-076 feature cases | pending | `NOT_RUN` |
| `GUI-TRM-004` | The appearance model resolves its four layers field by field, applies every field live with no restart badge, keeps the contrast floor, and imports themes within its limits. | `Plans/FinalGUISpec.md` F3-642; `Plans/storage-plan.md` SP-331; `Plans/Settings_System.md` SSYS-051; `Plans/DRY_Rules.md` DR-068 | future ATS-076 appearance cases | pending | `NOT_RUN` |
| `GUI-TRM-005` | Effects run only in the focused, visible terminal, stop when idle, turn off on battery saver, draw only static looks without a GPU, and stop every motion under Reduced Motion. | `Plans/FinalGUISpec.md` F3-643 | future ATS-076 effects cases | pending | `NOT_RUN` |
| `GUI-TRM-006` | The six terminal faces load at their default sizes and line heights, JetBrains Mono comes from the page's code face, and every face has a permissive licence. | `Plans/FinalGUISpec.md` F3-644 | future ATS-076 faces cases | pending | `NOT_RUN` |
| `GUI-TRM-007` | Kitty graphics, sixel and iTerm2 images render in their tiers and stay anchored; every hardening case returns its exact fixed reply; quotas, eviction and limits hold; animation pauses when hidden and under Reduced Motion; screen readers and agents get text descriptions. | `Plans/Section15_MVP_Promoted_Features_Spec.md` SMPFS-181; `Plans/FinalGUISpec.md` F3-645 | future ATS-076 image and hardening matrix | pending | `NOT_RUN` |
| `GUI-TRM-008` | Saved scrollback restores with its images, shows the placeholder for an image the quota dropped, brings back a running command as ended, honours its cadence, Clear scrollback, retention and load budget, and stays on this machine. Amended 2026-10-10 (DL-187): well-known secret formats are replaced in the saved copy before it is written while the live screen keeps the original (D36), and all saved copies together stay within a fixed 512 MiB, the oldest giving way first, with 64 MiB per terminal kept (D37). | `Plans/storage-plan.md` SP-332; `Plans/FinalGUISpec.md` F3-640, F3-645 | future ATS-076 saved-scrollback cases | pending | `NOT_RUN` |
| `GUI-TRM-009` | People and agents share a terminal safely: take-over and `preempted`, Allow once, Allow in this terminal (never stored, ended on close, take-over or run end, never replacing command approval), Deny, `secret_input` with the padlock, attribution, and input protection over every grant. | `Plans/Section15_MVP_Promoted_Features_Spec.md` SMPFS-182; `Plans/FinalGUISpec.md` F3-646; `Plans/Contracts_V0.md` CV-362 | future ATS-076 agent matrix | pending | `NOT_RUN` |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Automated_Testing_System.md#ATS-075, ContractName:Plans/Automated_Testing_System.md#ATS-076

### GRRC-040 - Universal Panels And Terminal Tab Checklist Gate

```yaml
plan_unit_id: GRRC-040
unit_type: validation_criterion
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: >-
  The GUI rebuild is not Home-complete until GUI-PNL-001 to GUI-PNL-018 prove the universal panels (the split tree,
  the tab strip, "+", "+N", the opening rules, the file tree's opens, the tab kinds, the narrow ladder, the chat column,
  dashboard tabs, the artifact viewer, named layouts, the keys, the v1-to-v2 migration, every look, the bans, command
  and event truth, and the editor tab) and GUI-TRM-001 to GUI-TRM-009 prove the terminal tab (one session per tab, its
  chrome, its features, its appearance, effects and faces, images and their hardening, saved scrollback, and agents),
  each with its harness, a durable evidence reference, its owner reference and a status of PASS (DL-180 to DL-184).
  ATS-075 and ATS-076 are the certification these rows read. This supersedes the 2026-08-04 PMConcept7 Home Workspace
  checklist, its four editor panels, its terminal sections and the terminal rows the terminal audit listed; the
  checklist consumes owner truth and creates no command, event, receipt, schema or persistence authority.
  Amended 2026-10-10 (DL-186, DL-187, DL-188): the same rows also prove Jared's answers of 2026-10-10, each in the
  row named in its dated note: dashboards on the Usage board engine (GUI-PNL-010), the chat after a restart, its rail
  entry, the retired Chat Layout setting and the 400 px Usage board floor (GUI-PNL-009), the Debug Console's session
  sub-tabs (GUI-PNL-007), installed shells and SSH hosts in "+" (GUI-PNL-003), `workspace.layout_changed` at 2.0.0
  (GUI-PNL-017), terminal tabs without chosen colours or icons and the notification mute (GUI-TRM-002), terminal
  notifications (GUI-TRM-003), and secrets scrubbed from saved scrollback within the 512 MiB total cap (GUI-TRM-008).
  No row is added, so the gate still reads GUI-PNL-001 to GUI-PNL-018 and GUI-TRM-001 to GUI-TRM-009.
gui_related: true
gui_classification_reason: The gate decides whether the rebuilt GUI's universal panels and terminal tab are proven.
split_recommended: false
depends_on: [DL-180, DL-181, DL-182, DL-183, DL-184, DL-186, DL-187, DL-188, ATS-075, ATS-076, WS-030, F-090, RAP-065]
unblocks: []
acceptance_criteria:
  - "GUI-PNL-001 to GUI-PNL-018 and GUI-TRM-001 to GUI-TRM-009 each carry a harness, a durable evidence reference, an owner reference and PASS before Home is claimed complete."
  - "A plan validator, a screenshot, a dispatch count or a concept check alone cannot move a row to PASS."
  - "No row of the 2026-08-04 Home checklist counts toward Home completion."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - "future ATS-075 and ATS-076 executable matrices"
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/GUI_Rebuild_Requirements_Checklist.md
  - Plans/Automated_Testing_System.md
node_compile_hint:
  mode: shared_runtime_gui_verification_gate
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "Plans/Decision_Log.md#DL-181"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md, SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8 (section 3.7; audit lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-terminal-audit.md, SHA-256 12f95fa6f79b1c0a1f9f34b1eee004cac9edacfd8e0a7f4e6495fe1af23aabe3 (the GUI_Rebuild_Requirements_Checklist rows; audit lineage only)"
preserved_exact_tokens:
  - "GUI-PNL-001"
  - "GUI-PNL-018"
  - "GUI-TRM-001"
  - "GUI-TRM-009"
  - "NOT_RUN"
  - "PASS"
negative_constraints:
  - "Do not let the checklist become implementation authority."
  - "Do not claim PASS from plan, screenshot, dispatch-count or concept evidence."
  - "Do not count a row of the 2026-08-04 Home checklist toward Home completion."
compatibility_only_notes: []
stale_retired_dispositions:
  - "Superseded 2026-10-09 (DL-180, DL-181): the 2026-08-04 PMConcept7 Home Workspace checklist, including its more-options popup, surface movement, terminal caps, collapse chevron, Move Workgroup and kebab rows."
  - "Amended 2026-10-10 (DL-186, DL-187, DL-188): rows GUI-PNL-003, 007, 009, 010 and 017 and GUI-TRM-002, 003 and 008 carry the 2026-10-10 answers; GUI-PNL-009's centre floor reads 960 px as F3-637 says."
owner_hints:
  - Plans/GUI_Rebuild_Requirements_Checklist.md
  - Plans/Automated_Testing_System.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Automated_Testing_System.md#ATS-075, ContractName:Plans/Automated_Testing_System.md#ATS-076

### GRRC-041 - Appearance And Shell Owner Closure

```yaml
plan_unit_id: GRRC-041
unit_type: requirement
status: accepted
owner_doc: Plans/GUI_Rebuild_Requirements_Checklist.md
canonical_text: >-
  Appearance and shell requirements are covered through FinalGUISpec F3-650 through F3-658 and the
  amended notification, hover and panel owners; Settings_System SSYS-052 through SSYS-054;
  storage-plan SP-333; UI_Command_Catalog UCC-204; Commands_System CS-102; Wiring_Matrix WM-093;
  UI_Wiring_Rules UIW-043; and Automated_Testing_System ATS-077. The linked registry/census/schema
  companions must agree before implementation certification. Decision_Log DL-189 through DL-227
  records the decisions and supersessions. DL-218 is not this branch's row. The Glass/wallpaper concept publication is complete;
  F3-652, F3-644 and F3-656 own the settled hover-light, delivered font range and GLY-4 boundaries.
  F3-642/F3-643/F3-650 and SP-331 own round-3 terminal controls/presets, F3-632 owns picker levels,
  and SSYS-044 consumes MA-073. Terminal round 5 (DL-213), the consistency pass and Friendly
  lavender (DL-214), the motion bar and calls (DL-215) and the P1000 reading and covers (DL-216) and the landed lanes' contracts (DL-217) are recorded, with Q13 and every motion fix lane recorded as landed in DL-217. F6 is recorded by DL-219 through DL-223 (no platform-specific tier, concept performance work stops at not horribly slow, Q22 closed as best effort, the landed behaviours, and wallpaper fade-first). The week sweep adds DL-224 through DL-227 (the quality bar, Friendly's design cues, Glass carry frost, and Ctrl+Shift+D reserved for Readiness and Doctor). Home/Settings content glyph adoption is not falsely marked complete. No
  concept-only demo or harness becomes a product surface. An approved packet is specification
  evidence, never native implementation proof.
gui_related: true
gui_classification_reason: Appearance And Shell Owner Closure.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- All owner references and companion validation resolve; holds and native evidence gaps remain explicit.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: appearance_and_shell_owner_closure
implementation_surfaces:
- Plans/GUI_Rebuild_Requirements_Checklist.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG-20261014-LATE-DECISIONS.md,
  SHA-256 126ae52840c8e5a30d2c1788b5427e6dc219cd2804d7cbd43f94d25aa0de2d07 (Jared decisions at lines 296
  and 306; not implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- Plans/Automated_Testing_System.md#ATS-077
- Plans/UI_Wiring_Rules.md#UIW-043
- Plans/Decision_Log.md#DL-201
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round3--LANDING.md,
  SHA-256 4d6556ff98168f22719c5d401c4e677d5d380d2ef370b67a838cb3aa45301c2d (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-panels-picker-back--NOTES.md,
  SHA-256 29bac44f166cb8e0e67f4f00634cb15d0a3be576eb2f68e7e19606f3a4a1a71c (source lineage; not native
  certification)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/GUI_Rebuild_Requirements_Checklist.md
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-077, ContractName:Plans/UI_Wiring_Rules.md#UIW-043, ContractName:Plans/Decision_Log.md#DL-201
