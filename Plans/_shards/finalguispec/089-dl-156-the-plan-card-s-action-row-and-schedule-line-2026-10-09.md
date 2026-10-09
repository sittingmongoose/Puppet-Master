# Shard 089: DL-156 — The Plan Card's Action Row And Schedule Line (2026-10-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L41645-L41781

Source SHA256: `2d2c1daec00bac477bcf98a919885bf127bcc1151a3124fe3612a96bd997e00b`

---

## DL-156 — The Plan Card's Action Row And Schedule Line (2026-10-09)

This addendum compiles DL-156, Jared's request of 2026-10-09 that the Plan card's buttons line up and fit the card in every theme. Behaviour stays with its owners: `Plans/Assistant_Plan_Runtime.md` (the one Build control, its labels and the actions each status admits), `Plans/Scheduling_and_Quota_Resume.md#SQR-015` (what the schedule line says) and the wand modules' grammar of `#F3-566` (J-2 spacing). The units below own the layout only, and DR-047 makes the action row one shared row. The concept is source lineage only: its class names and measured pixels outside these units are not canon.

### F3-606 — The Transcript Plan Card's Status Zone And One Action Row

```yaml
plan_unit_id: F3-606
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The transcript Plan card reads, top to bottom: its kicker (Plan, the version and strategy), the title and a summary
  of at most two lines, then one hairline that opens the card's status zone. The zone holds the schedule line when
  the Plan has a scheduled build (F3-607), the step count with the Plan's status in words ("6 steps · Ready"), and
  the action row. The action row is Build, Revise only while the Plan is Ready, and Open plan. It sits on the card's
  content edge with the card's own padding below it: no tinted band, no inset of its own and no second hairline.
  Every place a Plan shows actions uses one action row (DR-047): the transcript card, the editor's sticky footer and
  its More row, the compact Completed or Canceled card, a Building plan's attention actions, the schedule line's
  decision and the Build-started receipt's Open plan. In that row every control is 32 px tall with the same 12 px
  type; boxed controls sit 10 px apart and text actions 6 px apart, and nothing compresses when the row wraps (F3-566
  J-2). The Build control keeps the primary's 14 px sides, every other control 10 px. Its Building…, Completed and
  Canceled labels stay at full contrast: they are disabled, but they are not faded. While a Plan builds, its To-Do
  count ("0 of 6 steps done", or "Updating progress…" while the projection catches up) is plain words at the row's
  end, never a chip or a third button. A wait or attention line takes its own row under the buttons: its mark sits
  in a 16 px column 10 px from the copy, the same column as the schedule line's mark, and the actions it admits form
  an action row under the copy. The theme supplies each control's corners, lines and fills (square and flat under
  Retro and NieR); no theme changes a control's size. The zone holds at every transcript width down to a 280 px
  card: the row wraps rather than shrinking its controls.
gui_related: true
gui_classification_reason: Defines the transcript Plan card's status zone and the one action row every Plan surface uses.
split_recommended: false
depends_on: [DL-156, DR-047, F3-566, F3-597, F3-589]
unblocks: [F3-607]
acceptance_criteria:
  - "Build, Revise, Open plan and every other control in a Plan action row have the same height and type size in all ten themes."
  - "The transcript card's action row starts on the card's content edge with no tinted band, and one hairline separates the summary from the status zone."
  - "Building…, Completed and Canceled render at full contrast while disabled."
  - "The To-Do count while building is plain words, not a chip, and an attention line's actions sit on their own row under its copy."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 "Concepts/chat-assistant-concepts/5.6 Pro/build.py" --check
risk_class: plan_card_layout_drift
reasoning_tier: medium
context_scope: chat_plan_card_actions_20261009
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-156"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-plan-card-actions-20261009/JARED_REQUEST.md, SHA-256 4454066fa6584209b779ebf33441037b484f09f452599fcbef3477383782a93d"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-plan-card-actions-20261009/JARED-SCREENSHOT-retro-light.png, SHA-256 e668fe203ee8aeeb9c9ed1e8aa2f263f525188ce14d4a837958074aace4b839b"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "status zone"
  - "action row"
  - "6 steps · Ready"
negative_constraints:
  - "Do not draw the Plan card's actions on a tinted band with its own inset."
  - "Do not size one Plan action differently from the others in the same row."
  - "Do not fade a disabled Build label."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-156, ContractName:Plans/DRY_Rules.md#DR-047, ContractName:Plans/FinalGUISpec.md#F3-566, ContractName:Plans/Assistant_Plan_Runtime.md#APR-071

### F3-607 — The Plan Card's Schedule Line Layout

```yaml
plan_unit_id: F3-607
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Plan card's schedule line (content SQR-015, placement APR-071) is laid out in three parts so it never squeezes
  its sentence. The first row is the mark and the canon token or cadence ("Builds weeknights 10 PM–2 AM (Chicago
  time)") in the text colour, with Details beside it (Review while a new version waits); Details is a 32 px text
  action centred on that row, with its label on the card's right content edge. The detail ("next: tonight", "wraps
  up 1:50 AM") follows on the row below, then the night ribbon and the steps built, wrapping together as the width
  allows. A decision's controls (Use V6, Cancel schedule) are an action row of their own under the sentence
  (F3-606), never a column beside it. A time zone in parentheses never breaks inside them. The separator between
  the token and the detail stays in the text for assistive technology. On a card narrower than 360 px, Details moves
  under the sentence on the content edge. In the transcript card the line takes the status zone's hairline above it
  and has none of its own; above the editor's Plan document it keeps its own hairline below it.
gui_related: true
gui_classification_reason: Lays out the Plan card's schedule line so its sentence and controls fit every width.
split_recommended: false
depends_on: [DL-156, F3-606, SQR-015, APR-071]
unblocks: []
acceptance_criteria:
  - "The schedule line's token or cadence has a row of its own beside Details, and its detail and night ribbon flow on the row below."
  - "Use V6 and Cancel schedule sit on their own row under the sentence at every width."
  - "No time zone in parentheses breaks across lines."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: plan_card_layout_drift
reasoning_tier: medium
context_scope: chat_plan_card_actions_20261009
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-156"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-plan-card-actions-20261009/JARED_REQUEST.md, SHA-256 4454066fa6584209b779ebf33441037b484f09f452599fcbef3477383782a93d"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-plan-card-actions-20261009/JARED-SCREENSHOT-retro-light.png, SHA-256 e668fe203ee8aeeb9c9ed1e8aa2f263f525188ce14d4a837958074aace4b839b"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "Details"
  - "Review"
  - "Use V6"
  - "Cancel schedule"
negative_constraints:
  - "Do not place a schedule decision's controls in a column beside the sentence."
  - "Do not change what the schedule line says through its layout; SQR-015 owns the words."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Scheduling_and_Quota_Resume.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-156, ContractName:Plans/FinalGUISpec.md#F3-606, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-015, ContractName:Plans/Assistant_Plan_Runtime.md#APR-071
