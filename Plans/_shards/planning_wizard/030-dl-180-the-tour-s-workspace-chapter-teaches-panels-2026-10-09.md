# Shard 030: DL-180 — The Tour's Workspace Chapter Teaches Panels (2026-10-09)

Source: `Plans/Planning_Wizard.md`

Source lines: L2716-L2817

Source SHA256: `d9bb319478a72b955fb98a9312216c4e9917879338ecb172cf0aa94c6c95dfb4`

---

## DL-180 — The Tour's Workspace Chapter Teaches Panels (2026-10-09)

This addendum compiles the Guided Tour item of `Plans/Decision_Log.md#DL-180`. It amends PWIZ-023, whose
workspace practice asked the learner to move or dock the chat; that step retires, and the workspace chapter
teaches the panels instead.

### PWIZ-035 - The Tour's Workspace Chapter Teaches Panels

```yaml
plan_unit_id: PWIZ-035
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  The Guided Tour's workspace chapter teaches the panels. The published tour has 18 steps and becomes 20:
  move_or_dock_chat retires, and workspace_orientation stays, with the panels centre as its spotlight and
  copy saying the chat stays on the right and moves only by popping out. Three action steps follow it in
  this order, each finished by what the panels report, never by a timer: open_from_plus opens a tab from a
  panel's "+" menu, open_file_from_rail opens a file from the left rail into a panel, and split_by_drag
  drags a tab to a panel edge (the tab menu's Split right / Split down also counts). widget_action stays
  and first shows the Home dashboard tab. Each step runs the owner command: open_from_plus runs
  cmd.panel_tab.open, open_file_from_rail runs cmd.file.open with placement, split_by_drag runs
  cmd.panel_tab.move with an edge split, and widget_action runs cmd.widget.add addressed to a dashboard
  board; Show Me runs the same owner command. Saved positions follow the lead ruling of 2026-10-10: a
  position naming a retired step resumes at the first step of that step's chapter (move_or_dock_chat
  resumes at workspace_orientation); finished ids of retired steps are dropped; a position saved under
  another step order resumes at its own step by id; only a position whose chapter is gone starts fresh with
  the notice; the restore stays quiet (DL-153). Back puts the panels back as they were when the step began;
  Skip and Finish restore the captured v2 layout.
  Every saved tour position is stamped with its step id and the signature of the step order under which it
  was saved.
  The workspace chapter has 4 action steps rather than 2, within the 20-step tour rather than 18. Show Me
  aims the split drop 34 px inside the documents panel's right edge or 30 px above its bottom, clear of the
  centre's 12 px root-edge band, and proceeds only when a split target is ready. In the source's 1920 × 1080
  Home layout with the rail open and chat about 600 px, the documents panel is 511 × 598 px against a 280 ×
  120 px editor minimum, so only Split down fits and the copy names it. The widget action waits at most 1500
  ms for Add widget after revealing dashboard:home; the file step waits at most 900 ms for a file row. The
  source's 6-minute estimate is a publish census measurement to confirm, not a completion deadline. The plus
  step completes only after the menu is used and a tab is opened or a new tab id appears; the file step
  requires an editor tab created since the step began; the drag step requires an applied cmd.panel_tab.move
  with a split and increased panel count, with the menu alternative above retained. Back and Skip/Finish use
  their respective restore paths.
gui_related: true
gui_classification_reason: Defines the workspace chapter's steps, copy, owner commands, completion observation, and saved-position and restore rules.
split_recommended: false
depends_on: [DL-180, PWIZ-023]
unblocks: []
acceptance_criteria:
  - The tour has 20 steps; move_or_dock_chat is retired, and workspace_orientation is followed in this order by open_from_plus, open_file_from_rail and split_by_drag before widget_action.
  - workspace_orientation spotlights the panels centre, and its copy says the chat stays on the right and moves only by popping out.
  - open_from_plus opens a tab from a panel's "+" menu through cmd.panel_tab.open, open_file_from_rail opens a file from the left rail into a panel through cmd.file.open with placement, and split_by_drag drags a tab to a panel edge through cmd.panel_tab.move with an edge split; the tab menu's Split right / Split down also completes split_by_drag.
  - Each action step is finished by what the panels report, never by a timer, and Show Me runs the same owner command.
  - widget_action stays, first shows the Home dashboard tab, and runs cmd.widget.add addressed to a dashboard board.
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
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md, SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)"
  - Plans/Decision_Log.md#DL-180
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-52-tour-8571666731.js (SHA-256 433ca7b6d0146c8cb438373c5ebb26df847ad51ef51588d8e80c0484688280c9; concept lineage only)"
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
negative_constraints:
  - Do not finish an action step by a timer; only what the panels report finishes it.
  - Do not ask the learner to move or dock the chat.
  - Do not start a saved position fresh while its chapter still exists.
  - Do not keep the demonstrated layout without an explicit Keep selection.
stale_retired_dispositions:
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Adds workspace action census, split demonstration geometry and bounded reveal waits."
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Stamps saved positions with step id and step-order signature."
owner_hints:
  - Plans/Planning_Wizard.md
  - Plans/guided_tour_contracts.schema.json
  - Plans/guided_tour_contract_fixtures.json
```

ContractRef: ContractName:Plans/Planning_Wizard.md, ContractName:Plans/guided_tour_contracts.schema.json
