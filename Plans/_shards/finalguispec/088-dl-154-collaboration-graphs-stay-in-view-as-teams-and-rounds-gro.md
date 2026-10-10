# Shard 088: DL-154 — Collaboration Graphs Stay In View As Teams And Rounds Grow (2026-10-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L41635-L41762

Source SHA256: `de5dc2f783cf59029c19b3e7206bc5823fcdc8cb74354d4a78c485d0d1da94db`

---

## DL-154 — Collaboration Graphs Stay In View As Teams And Rounds Grow (2026-10-09)

This addendum compiles the owner decision DL-154, Jared's request of 2026-10-09 that a collaboration setup sheet's graph stay in view as helpers are added and that a Chat Room's many rounds wrap down instead of running off its preview. Behaviour stays with its owners: `Plans/Collaborative_Workflows.md` (the four kinds, their participant and round limits, the card densities of CWR-019 and the In your chat preview of CWR-018), F3-566 (the sheet grammar and its yield rules), F3-569 (run card budgets and width tiers) and F3-595 (the cast plate grammar). The units below own the presentation only; DR-045 names the one shared mechanism. The concept is source lineage only: its class names, attributes, pixel geometry and harness hooks are not canon.

### F3-601 — A Cast Plate Keeps A Drawing At Every Team Size

```yaml
plan_unit_id: F3-601
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  A collaboration setup sheet's cast plate (F3-595) stays a drawing at every team size its kind allows, up to eight
  helpers with both specialists, in every theme and at every supported window size (DL-154). Its slot still shows the
  richest mode that fits, never scaled, but it never yields past its floor: the leanest drawing that fits the slot's
  width. The slot keeps that drawing's height, and a roster whose rows no longer fit beside it drops its column
  helpers, then its rows' fine lines, and then scrolls in its own region with the fade, Add a helper kept visible. The
  caption sentence is the last resort only for a slot that no drawing fits the width of. A team too wide for one strip
  row at the strip's minimum pitch is drawn as the wrap: the strip's seats, names under the marks, on two rows, or
  three when two would sit closer than that pitch. The Coordinator or Moderator and You stand at the rows' middle
  height; a fork carries the lead's string to each row's first seat and a join brings each row's last seat to the
  accent edge to You, so the plate still reads left to right with straight strings only. Review and BrainStorm keep
  their screens between neighbouring seats in a row. The specialists stand in one column after the dotted rule, one
  per row. The wrap is drawn at a width for the narrowest two-column sheet and at the full plate width, and the slot
  shows the wider one that fits; a team whose one-row strip fits the narrow width gets no wrap. Below a 900 px sheet
  width, where the sheet body is one scrolling column, the plate stays at the top of that column while its question
  is on screen, on the sheet's own surface colour, and the roster's rows pass under it. A run view's plate (F3-569)
  uses the same wrap when the run's team is too wide for one row at the view's width, so it never drops its plate.
gui_related: true
gui_classification_reason: Defines how the collaboration cast plates stay visible as rosters grow in setup sheets and run views.
split_recommended: false
depends_on: [DL-154, F3-595, F3-566, F3-569, DR-045]
unblocks: []
acceptance_criteria:
  - "With eight helpers and both specialists, each of the four setup sheets shows a cast plate drawing (not the caption) inside the viewport at 1440 x 900, 1280 x 800, 1024 x 768, 900 x 800 and 700 x 800 in all ten themes, never scaled and with no name outside the plate or over another."
  - "A roster scrolls in its own region only while its slot shows its floor drawing."
  - "The wrap's strings are straight, and its fork and join connect every row to the lead and to You."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: wand_sheet_presentation_drift
reasoning_tier: high
context_scope: wand_modules_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-154"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-popup-graphs-20261009/JARED_REQUEST.md, SHA-256 46723a8829ea87fc5e01a261d81e92e32f3f1bc2e8a428af6704b1e3a91229e2"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-popup-graphs-20261009/SURVEY-BEFORE.md, SHA-256 b4036f1bffdf0bfb65f40fa5062540f60960b072bb46c667a7bcb00f26e0ac5f"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "cast plate"
  - "the wrap"
  - "Add a helper"
negative_constraints:
  - "Do not let a cast plate yield to its caption while a drawing fits the slot's width."
  - "Do not scale a cast plate down to fit a slot."
  - "Do not draw a wrapped row's strings as diagonals or curves."
compatibility_only_notes: []
stale_retired_dispositions:
  - "F3-566's and F3-595's yield, in which the plate fell to its caption before a roster's rows scrolled, is replaced by this unit's floor (DL-154)."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-154, ContractName:Plans/FinalGUISpec.md#F3-595, ContractName:Plans/FinalGUISpec.md#F3-566, ContractName:Plans/FinalGUISpec.md#F3-569, ContractName:Plans/DRY_Rules.md#DR-045

### F3-602 — A Run Card's Track Wraps Down And Shows Every Chat Room Round

```yaml
plan_unit_id: F3-602
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  A run card's track (named stops, counted progress, never a percent) never runs wider than its card, in the
  transcript and in a setup sheet's In your chat preview (F3-569, F3-592, DL-154). A Chat Room's track has one stop
  per round up to its round limit of 20; no lower cap hides rounds. A track of eight or more stops gives its dots
  their own rows: they wrap down onto as many rows as the card's width needs, with shorter joins between them, and
  the track's words (for example "Round 1 of 20 · not started") take a whole row under the dots instead of being cut.
  A track of six or more stops keeps hiding its per-stop labels below the 720 px width tier, as before; a shorter
  track keeps its single row. The preview re-measures its frame after the track wraps, so the whole first frame,
  track included, still fits the hero's side column at its scale (F3-592), and the card's height changes only at the
  state boundaries F3-569 allows.
gui_related: true
gui_classification_reason: Defines how a run card's stop track wraps for long tracks such as a Chat Room of many rounds.
split_recommended: false
depends_on: [DL-154, F3-569, F3-592, CWR-019, DR-045]
unblocks: []
acceptance_criteria:
  - "A Chat Room set to 20 rounds shows 20 stops in its preview and its card, every dot inside the card, at 1440 x 900 and 1024 x 768 in all ten themes."
  - "The track's words stay readable on their own row whenever the dots wrap."
  - "A track of seven or fewer stops renders exactly as before."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: wand_sheet_presentation_drift
reasoning_tier: medium
context_scope: wand_modules_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-154"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-popup-graphs-20261009/JARED_REQUEST.md, SHA-256 46723a8829ea87fc5e01a261d81e92e32f3f1bc2e8a428af6704b1e3a91229e2"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "Round 1 of 20"
negative_constraints:
  - "Do not let a track's dots run past its card."
  - "Do not cap a Chat Room's track below its round limit."
compatibility_only_notes: []
stale_retired_dispositions:
  - "The concept's cap of 12 stops on a Chat Room's track is retired (DL-154)."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-154, ContractName:Plans/FinalGUISpec.md#F3-569, ContractName:Plans/FinalGUISpec.md#F3-592, ContractName:Plans/Collaborative_Workflows.md#CWR-019, ContractName:Plans/DRY_Rules.md#DR-045
