# Shard 030: DL-180 — The Tour's Workspace Chapter Teaches Panels (2026-10-09)

Source: `Plans/Planning_Wizard.md`

Source lines: L2757-L2915

Source SHA256: `5bcfdfe2d87332d6a3479f8df7acdb3a953084a6ff4ce0df690813e0c668715d`

---

## DL-180 — The Tour's Workspace Chapter Teaches Panels (2026-10-09)

This addendum compiles the Guided Tour item of `Plans/Decision_Log.md#DL-180`. It amends PWIZ-023, whose
workspace practice asked the learner to move or dock the chat; that step retires, and the workspace chapter
teaches the panels instead.

Amended 2026-10-10 (DL-186): the old Home widgets leave Home, so the chapter's widget step now teaches a Usage widget,
Upcoming resets, on the Home dashboard board, and the tour's snapshots cover that board's widgets (PWIZ-035).

### PWIZ-035 - The Tour's Workspace Chapter Teaches Panels

```yaml
plan_unit_id: PWIZ-035
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  The Guided Tour's workspace chapter teaches the panels. The published tour has 18 steps and becomes 20:
  move_or_dock_chat retires, and workspace_orientation stays, with the panels centre as its spotlight and copy
  saying the chat stays on the right and moves only by popping out. Three action steps follow it in this order,
  each finished by what the panels report, never by a timer: open_from_plus opens a tab from a panel's "+" menu,
  open_file_from_rail opens a file from the left rail into a panel, and split_by_drag drags a tab to a panel
  edge (the tab menu's Split right / Split down also counts). widget_action stays and first shows the Home
  dashboard tab. Each step runs the owner command: open_from_plus runs cmd.panel_tab.open, open_file_from_rail
  runs cmd.file.open with placement, split_by_drag runs cmd.panel_tab.move with an edge split, and widget_action
  runs cmd.widget.add addressed to a dashboard board; Show Me runs the same owner command. Amended 2026-10-10
  (DL-186, Jared's answers P1 and P10): the old Home widgets are gone from Home, and with them the step's
  Approval queue practice; widget_action now teaches a Usage widget, Upcoming resets (`ov-resets`). It reveals
  `dashboard:home`, and the learner adds Upcoming resets to the Home board from the tab's Add widget, then drags
  it up to where they can glance at it. Home's default set already holds Upcoming resets, so the step first
  takes it off the Home board (cmd.widget.remove) as part of the tour's captured practice layout, then teaches
  adding it; Back, Skip and Finish restore the captured layout quietly (DL-153), Upcoming resets back on the
  Home board where it was, unless Finish's explicit Keep keeps the demonstrated layout (amended 2026-10-10, lead
  ruling; it read: When the Home board already shows Upcoming resets, the step first takes it off the board
  (cmd.widget.remove) so that it can be added). The step is finished only when, since it began, the Home board
  reports an accepted cmd.widget.add of `ov-resets` with room `home`, followed by an accepted cmd.widget.move or
  cmd.widget.resize of that widget there; the tour contract's `predicate:workspace:widget-added` names that
  whole condition, the add followed by the move or resize, never the add alone. Show Me adds it and moves it to
  the top of the board through the same board commands. Every widget command of the step names the Home board in
  its existing room field (Plans/Widget_System.md#WS-030). Saved positions follow the lead ruling of 2026-10-10:
  a position naming a retired step resumes at the first step of that step's chapter (move_or_dock_chat resumes
  at workspace_orientation); finished ids of retired steps are dropped; a position saved under another step
  order resumes at its own step by id; only a position whose chapter is gone starts fresh with the notice; the
  restore stays quiet (DL-153). Back puts the panels back as they were when the step began; Skip and Finish
  restore the captured v2 layout. Amended 2026-10-10 (DL-186): the Home board's widgets live in that board's own
  per-project key, outside the v2 record (WS-030), so the tour's snapshots take the Home board's widgets with
  the panels through the board owner's own snapshot, per project, and Back, Skip and Finish put the board back
  as well, unless Finish keeps the demonstrated layout. Every saved tour position is stamped with its step id
  and the signature of the step order under which it was saved. The workspace chapter has 4 action steps rather
  than 2, within the 20-step tour rather than 18. Show Me resolves F3-630's current split zones and
  complete-layout fit rule, then aims at a ready split target clear of Join and outer docks. In the source's
  1920 × 1080 Home layout with the rail open and chat about 600 px, the documents panel is 511 × 598 px against
  a 280 × 120 px editor minimum, the earlier local-half rule offered only Split down there; after the 2026-10-14
  room-fit amendment the ready target decides the direction and the copy names that target. The widget action
  opens dashboard:home and waits at most 1500 ms, checking each frame, for its Home board before it uses Add
  widget in the tab's header row; the file step waits at most 900 ms for a file row. The tour's estimate is 5
  minutes: measured 4.8 minutes at 200 words a minute, with 16 actions; Planning has 7 actions (44 %) and 49 %
  of the time, and the workspace chapter has 5 actions (the widget step counts two), never a completion
  deadline. The plus step completes only after the menu is used and a tab is opened or a new tab id appears; the
  file step requires an editor tab created since the step began; the drag step requires an applied
  cmd.panel_tab.move with a split and increased panel count, with the menu alternative above retained. Back and
  Skip/Finish use their respective restore paths. A legacy checkpoint from before the panels that has no
  step-order stamp is read against the published 18-step order, then follows the same saved-id and
  retired-chapter resume rules; only when its step and chapter are both gone does it start fresh with the
  notice.
gui_related: true
gui_classification_reason: Defines the workspace chapter's steps, copy, owner commands, completion observation, and saved-position and restore rules.
split_recommended: false
depends_on: [DL-180, DL-186, PWIZ-023, WS-030]
unblocks: []
acceptance_criteria:
  - The tour has 20 steps; move_or_dock_chat is retired, and workspace_orientation is followed in this order by open_from_plus, open_file_from_rail and split_by_drag before widget_action.
  - workspace_orientation spotlights the panels centre, and its copy says the chat stays on the right and moves only by popping out.
  - open_from_plus opens a tab from a panel's "+" menu through cmd.panel_tab.open, open_file_from_rail opens a file from the left rail into a panel through cmd.file.open with placement, and split_by_drag drags a tab to a panel edge through cmd.panel_tab.move with an edge split; the tab menu's Split right / Split down also completes split_by_drag.
  - Each action step is finished by what the panels report, never by a timer, and Show Me runs the same owner command.
  - widget_action stays, first shows the Home dashboard tab, and runs cmd.widget.add addressed to a dashboard board.
  - "Amended 2026-10-10 (DL-186): widget_action teaches Upcoming resets (ov-resets) on the Home board; because Home's default set already holds it, the step first removes it (cmd.widget.remove) as part of the tour's captured practice layout, and Back, Skip and Finish restore that layout quietly (amended 2026-10-10, lead ruling; it read: when the board already shows it the step first removes it); the step finishes only on an accepted cmd.widget.add of ov-resets with room home followed by an accepted cmd.widget.move or cmd.widget.resize of it, never on a timer, and predicate:workspace:widget-added is that whole condition; Show Me uses the same board commands; no old Home widget or Approval queue practice remains."
  - "Amended 2026-10-10 (DL-186): Back, Skip and Finish put the Home board's widgets back with the panels through the board owner's snapshot, per project, unless Finish keeps the demonstrated layout."
  - A saved position naming a retired step resumes at the first step of that step's chapter (move_or_dock_chat resumes at workspace_orientation); finished ids of retired steps are dropped; a position saved under another step order resumes at its own step by id; only a position whose chapter is gone starts fresh with the notice; the restore stays quiet (DL-153).
  - Back puts the panels back as they were when the step began, and Skip and Finish restore the captured v2 layout.
  - "Every saved position carries its step id and step-order signature, and resumes by the saved-id and retired-step rules above."
validation_surfaces:
  - Plans/guided_tour_contracts.schema.json
  - Plans/guided_tour_contract_fixtures.json
  - python3 scripts/pm-new-contracts-verify.py
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/Planning_Wizard.md
  - Plans/guided_tour_contracts.schema.json
  - Plans/guided_tour_contract_fixtures.json
node_compile_hint:
  mode: guided_tour_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md,
  SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)
- Plans/Decision_Log.md#DL-180
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-52-tour-8571666731.js
  (SHA-256 433ca7b6d0146c8cb438373c5ebb26df847ad51ef51588d8e80c0484688280c9; concept lineage only)
- Plans/Decision_Log.md#DL-186
- 'Concepts/home-redesign/src/panels/js/52-tour.js at 339203bd76 on concept/home-panels-20261009, SHA-256 456375285dbe1462e78167c21be04bf6a9b37e13fba17fc54ce9725566cf8afd
  (the widget step as built: Upcoming resets, its done rule and Show Me; concept lineage only)'
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/D10-DESIGN-per-instance-boards.md,
  SHA-256 927d0ed893c513f2f20efa3ff678f19ba785ac43cf84d690412038daa5d41796 (section 5, option B; design lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-NUMBERS-51c316e18b.md,
  SHA-256 a9c42b88e5cb50706ff1716a254cb68e026a538bb7a0c840905779a9a482cff2 (small-round concept lineage only)
- /mnt/Cursor/share/puppet-master/2026-10-13-panel-dnd-resize/NOTES.md, SHA-256 03a80f0dea3235ea637149bbec63626c4a4be8521078f9dd601f2b691f03d2d6
  (approved campaign source lineage; not native implementation evidence)
preserved_exact_tokens:
  - move_or_dock_chat
  - workspace_orientation
  - open_from_plus
  - open_file_from_rail
  - split_by_drag
  - widget_action
  - cmd.panel_tab.open
  - cmd.file.open
  - cmd.panel_tab.move
  - cmd.widget.add
  - Split right / Split down
  - ov-resets
  - Upcoming resets
  - cmd.widget.remove
  - predicate:workspace:widget-added
negative_constraints:
  - Do not finish an action step by a timer; only what the panels report finishes it.
  - Do not ask the learner to move or dock the chat.
  - Do not start a saved position fresh while its chapter still exists.
  - Do not keep the demonstrated layout without an explicit Keep selection.
  - Do not teach an old Home widget or the Approval queue in the widget step, or finish it before the board reports the add and the move or resize.
stale_retired_dispositions:
- 'Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Adds workspace action census, split demonstration geometry
  and bounded reveal waits.'
- 'Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Stamps saved positions with step id and step-order signature.'
- 'Amended 2026-10-10 (DL-186): widget_action teaches Upcoming resets on the Home board (add, then move or resize),
  and the tour''s snapshots and restores cover the Home board''s widgets; the old Home widgets and the Approval queue
  practice are gone.'
- 'Amended 2026-10-10 (DL-186): the tour contract''s predicate:workspace:widget-added keeps its name and now means
  the add followed by a move or resize.'
- 'Amended 2026-10-10 (lead ruling): Home''s default set already holds Upcoming resets, so the widget step always
  first takes it off the Home board as part of the captured practice layout, and Back, Skip and Finish restore that
  layout quietly (DL-153).'
- 'Amended 2026-10-11 (wave 2, panels NUMBERS 51c316e18b): The tour estimate is the measured 5 minutes and its widget
  step waits for the Home board.'
- 'Amended 2026-10-11 (wave 2, panels NUMBERS 51c316e18b): Legacy unstamped tour checkpoints are interpreted against
  the earlier 18-step order.'
- 'Amended 2026-10-14: The tour consumes the current split target/fit rule, not fixed pixel coordinates or the retired
  local-half refusal.'
owner_hints:
  - Plans/Planning_Wizard.md
  - Plans/guided_tour_contracts.schema.json
  - Plans/guided_tour_contract_fixtures.json

```

ContractRef: ContractName:Plans/Planning_Wizard.md, ContractName:Plans/guided_tour_contracts.schema.json
