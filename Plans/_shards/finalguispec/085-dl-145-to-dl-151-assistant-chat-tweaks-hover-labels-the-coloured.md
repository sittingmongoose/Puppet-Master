# Shard 085: DL-145 to DL-151 — Assistant Chat Tweaks: Hover Labels, The Coloured Wand, Activity Detail, Setup Sheets, Puppet Agents, The Ask Card And Retro (2026-10-08)

Source: `Plans/FinalGUISpec.md`

Source lines: L40509-L41098

Source SHA256: `82869833b57f45dad6e8b330a66abb33118a25afbfaa916127497bd99d1b3137`

---

## DL-145 to DL-151 — Assistant Chat Tweaks: Hover Labels, The Coloured Wand, Activity Detail, Setup Sheets, Puppet Agents, The Ask Card And Retro (2026-10-08)

This addendum compiles the owner decisions DL-145 to DL-151: the sixteen tweaks Jared asked for on 2026-10-07 to the 5.6 Pro assistant chat concept, his answers on that day's eight decision cards, and the lead's rulings on the questions no card covered (recorded in each DL entry). The concept and these units land together (decision card 1). Behaviour stays with its owners: `Plans/assistant-chat-design.md` ACD-469 (transcript families and the accent budget), ACD-473 (the working activity), ACD-480 (editor documents) and ACD-485 (the subagent live transcript), `Plans/Goal_Runtime_System.md` GRS-055, `Plans/ToDo_Runtime.md` TDR-007 and TDR-011, `Plans/Collaborative_Workflows.md` CWR-018 to CWR-020, `Plans/Scheduling_and_Quota_Resume.md` SQR-002, SQR-013 and SQR-015, the global hover tag of F3-523 and the theme token tables of F3-426. The units below own the presentation only. The concept is source lineage only: its class names, keys, harness hooks, Demo Studio and every measured timing outside these units are not canon.

### F3-590 — Chat Hover Labels Wait For Intent And Activity Previews Dwell

```yaml
plan_unit_id: F3-590
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Every icon control in the assistant chat names itself through the shared PMHoverTag of F3-523, never through a
  native title (DL-145). This includes the controls the concept used to title natively: the editor's Return to chat
  and its tabs, the model picker's provider rail and favourite stars, the history drawer's status marks and resize
  handle, thread-search result actions, the thread-operation dialog's close, the Schedule Message send-time track, and
  a To-Do row's full title, assignment and waiting or blocker reason. Every chat tag waits for F3-523's deliberate
  intent, unchanged, with no faster hand-off from one tag to the next, and a press on an anchor closes its tag until
  the pointer leaves that anchor (F3-523). The owner's request that the chat's hover labels wait longer is met by
  F3-523's thresholds, which the concept now follows. Activity bar domain previews are interactive hover cards, not
  tags: a pointer opens one only after a deliberate dwell, long enough that passing between the composer and the bar
  opens none; keyboard focus on a domain opens its preview at once; moving to another domain while a preview is open
  switches at once; and a preview closes after the same short departure grace as a tag. The preview dwell the concept
  measures is a lab value (ACD-474).
gui_related: true
gui_classification_reason: Defines how the assistant chat's icon controls name themselves and when its activity previews open.
split_recommended: false
depends_on: [DL-145, F3-523, ACD-474]
unblocks: []
acceptance_criteria:
  - "No icon control in the assistant chat exposes its name only through a native title, and no chat tag opens before F3-523's thresholds."
  - "A pointer passing between the composer and the activity bar opens no preview; keyboard focus on a domain opens its preview at once."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_hover_and_chrome_drift
reasoning_tier: high
context_scope: chat_tweaks_20261007
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-145"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md, SHA-256 acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/LEAD-RULINGS-20261008.txt, SHA-256 546fa6cc210c40b50a6a5db5f4d6e436af82c2e3d9541796b214bb27061d80c7"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "PMHoverTag"
  - "native title"
  - "deliberate dwell"
negative_constraints:
  - "Do not restate or change F3-523's thresholds in this unit."
  - "Do not add a hand-off that opens a second tag faster than F3-523 allows."
  - "Do not open an activity preview for a pointer passing through."
compatibility_only_notes: []
stale_retired_dispositions:
  - "The concept's earlier label timings (about 400 ms, then about 1 s with a 120 ms hand-off) and its 220 ms preview dwell are retired; none of them was canon (ACD-474)."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-145, ContractName:Plans/FinalGUISpec.md#F3-523, ContractName:Plans/assistant-chat-design.md#ACD-474

### F3-591 — Opening More Keeps The Message Chrome On Its Row

```yaml
plan_unit_id: F3-591
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  A transcript message's chrome is one row: its meta chips and its Copy, Details and More actions, right-aligned on a
  user turn. Opening More never moves them: the overflow panel is a sibling of that row and opens on its own line
  below it, so the chips and actions keep their row and their places while it is open, and the message grows by the
  panel's height only (DL-145). In Context More Details, each capability box under Capabilities in this thread draws
  its whole outline, the left edge included, at every width, as section 20's uniform perimeter rule requires
  (APR-034).
gui_related: true
gui_classification_reason: Defines the message chrome row and the Context capability boxes' outline.
split_recommended: false
depends_on: [DL-145, F3-534]
unblocks: []
acceptance_criteria:
  - "With More open on any message, its meta chips and actions keep the row and positions they had with More closed."
  - "Every capability box in Context More Details shows a closed outline at every chat width."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_hover_and_chrome_drift
reasoning_tier: standard
context_scope: chat_tweaks_20261007
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-145"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md, SHA-256 acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "its own line below it"
  - "uniform perimeter"
negative_constraints:
  - "Do not wrap a message's meta chips or actions onto a new row when More opens."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-145, ContractName:Plans/FinalGUISpec.md#F3-534

### F3-592 — Setup Sheet Step Tiles, A Readable In Your Chat Preview, And The Send Time Track

```yaml
plan_unit_id: F3-592
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  In the setup sheets whose questions are numbered (the four collaboration kinds and Crew Auto, F3-566) each question
  number is a step tile (DL-148): a small square tile in the theme's small corner, tinted with the accent and edged in
  the focus colour, with its numeral in the accent, so the numbers read as steps. The step whose question holds focus
  fills with the accent and its numeral turns to the theme's on-accent ink, at least 4.5:1 on the accent in every
  theme, and a question in error turns its tile warm. Under NieR Mode the tile is an inverted ink square with no glow.
  The In your chat preview of CWR-018 is drawn large enough to read: it fills the hero's side column, lays the card's
  first frame out at the narrowest M-tier card width (F3-569) and scales it to fit the column, never above its real
  size, without growing the sheet; in a short window its caption drops while the preview keeps its accessible name;
  and the commit flight onto the new card lays its copy out at the real card's width. The Schedule Message sheet's
  plate of the next 48 hours is also its send-time control: dragging the send marker, or pressing the track, moves the
  send time in 15-minute steps (5 minutes with Shift); with the track focused, the arrow keys move it 5 minutes (an
  hour with Shift), Page Up a day later and Page Down a day earlier, Home to the earliest allowed time and End to the
  end of the track. It never sets a time in the past. Every move writes the same Date and Time inputs as the presets,
  so the resolved time, the read-back and the primary's label follow it, and the track explains itself through the
  hover tag, never a native title (F3-590). The Schedule Message sheet has no promise lines and no Technical details
  (F3-573).
gui_related: true
gui_classification_reason: Defines the setup sheets' step tiles, the In your chat preview's legibility and the Schedule Message send-time track.
split_recommended: false
depends_on: [DL-148, F3-566, F3-569, F3-573, CWR-018]
unblocks: []
acceptance_criteria:
  - "Each numbered sheet question renders its number as a step tile in every theme, and the focused step's tile is filled with its numeral at 4.5:1 or more."
  - "At 1440 x 900 the In your chat preview's card title is readable without zoom, and the preview is never drawn above its real size."
  - "No drag, press or key on the send-time track yields a time earlier than now, and every move updates the Date and Time inputs."
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
  - "Plans/Decision_Log.md#DL-148"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md, SHA-256 acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt, SHA-256 e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/LEAD-RULINGS-20261008.txt, SHA-256 546fa6cc210c40b50a6a5db5f4d6e436af82c2e3d9541796b214bb27061d80c7"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "step tile"
  - "In your chat"
  - "send-time control"
negative_constraints:
  - "Do not scale the In your chat preview above its real size or grow the sheet to enlarge it."
  - "Do not let the send-time track write a time in the past."
compatibility_only_notes: []
stale_retired_dispositions:
  - "The Schedule Message sheet's promise lines and its Technical details are removed (DL-148)."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-148, ContractName:Plans/FinalGUISpec.md#F3-566, ContractName:Plans/FinalGUISpec.md#F3-573, ContractName:Plans/Collaborative_Workflows.md#CWR-018

### F3-593 — Goal, To-Dos And Subagents In Activity Detail

```yaml
plan_unit_id: F3-593
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Goal (DL-147; behaviour GRS-055): Goal Activity Detail shows the objective, then one control row, Pause or Resume
  and Edit objective together at its start and Cancel Goal alone at the far edge in the danger tone, so the
  destructive action never sits in the safe group; a narrow panel may shorten Edit objective's visible label, never
  its accessible name. A bound Goal adds the Plan row (Open exact Plan · Vn, and Revise Plan when blocked), and the
  footer is an Objective history disclosure with the revision count, which opens the revision list in place. Editing
  shows the text-only objective editor with Save and Cancel edit. There is no View Goal route to a separate Goal
  document and no Ask for a replacement control; a replacement the agent proposes after the user asks for one in the
  chat still follows Goal_Runtime_System's approval path. The activity bar's Goal preview draws the same compact Goal
  projection, with the same control row, the Plan row when the Goal is bound and the Objective history disclosure,
  and has no Details button; its Edit opens this section with the objective in edit (cmd.chat.goal.open_editor),
  while Edit inside this section only swaps in the editor (amended 2026-10-09). To-Dos (DL-147; behaviour TDR-007, TDR-011): as a
  second scoped exception to the 2026-09-08 rollback, after F3-580's, each row is one line in the To-Do hover
  preview's checklist form inside the panel's native frame: the expand caret on a parent, the status mark (F3-585),
  the title (full contrast while in progress, struck through when completed), the explicit assignment, shown only when
  an agent or Persona is explicitly assigned, as the owner's mark or name, and a right-aligned status word in its tone
  (Pending, Working, Done, Blocked, Skipped; Waiting for a pending item held by a dependency or an owner wait; done
  over total on a parent), which a completed leaf may leave out because its check and strike already say it. No theme
  boxes the rows one by one. Rows carry no buttons, so there is no Start work or Run work; TDR-011's next action reads
  as the row's status word and the selected item's Open work. A row's full title, full assignment and waiting or
  blocker reason show in its hover tag (F3-523) and in the selected detail. The selected detail keeps its header with
  Close details, the Expected well, the dependency or waiting line, Open work when the item has a work binding
  (cmd.chat.todos.open_work) and its source links. The list fills the panel's height below its search and navigation
  line and puts its scrollbar at the panel's edge with no dead gutter. Subagents (DL-147; behaviour ACD-485): rows,
  the Subagents preview and the detail card underline the agent's model. Clicking a row selects it and opens the
  agent's read-only live transcript, and the detail card's button reads Open live transcript. That transcript is drawn
  in the chat's Turn Stage presentation (ACD-469, F3-562), set close like a live feed: the turn mark, the spine
  through every item, the families and the theme's motion voice. Its head is one row naming the agent, its status mark
  and word with the elapsed time, its model (underlined) and its parent, with a Read-only marker (Read-only · live
  while it works) whose hover tag reads Read-only child thread. It has no composer. Messages keep only Copy, More
  details and Expand or Collapse with their meta row, shown on hover or focus; event and needs-you items keep their
  cards without actions. Between messages, each stretch of the agent's work is one collapsed row stating a plain count
  of what it did (for example, ran 3 tools and edited 1 file); a click, Enter or Space opens it in place to list that
  stretch's records, each with its detail in its hover tag. The row carries a small Step Rail motif (ACD-473): the
  stretch the agent is working in plays a variation of the Step Rail working animation, and a finished stretch shows a
  still, completed rail. While the agent works its mark is lit and the spine's light runs to its latest item. Reduced
  motion lands every motion here at its end state.
gui_related: true
gui_classification_reason: Defines the Goal, To-Dos and Subagents Activity Detail presentation and the subagent live transcript's look.
split_recommended: false
depends_on: [DL-147, GRS-055, TDR-007, TDR-011, ACD-485, ACD-469, ACD-473, F3-580, F3-585]
unblocks: []
acceptance_criteria:
  - "Goal Activity Detail renders one control row with Cancel Goal alone at the far edge and an Objective history footer; no View Goal route or Ask for a replacement control exists."
  - "Every To-Do row is one line with no button, shows an explicit assignment only when one exists, and Open work appears only in the selected detail."
  - "A subagent's live transcript renders in the Turn Stage presentation with no composer, only Copy, More details and Expand or Collapse on messages, and each stretch of work as one collapsed row with a count."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_activity_detail_drift
reasoning_tier: high
context_scope: chat_tweaks_20261007
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Goal_Runtime_System.md
  - Plans/ToDo_Runtime.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-147"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md, SHA-256 acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt, SHA-256 e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/LEAD-RULINGS-20261008.txt, SHA-256 546fa6cc210c40b50a6a5db5f4d6e436af82c2e3d9541796b214bb27061d80c7"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "Objective history"
  - "Open live transcript"
  - "Read-only child thread"
  - "Step Rail"
negative_constraints:
  - "Do not give a To-Do row a Start work, Run work or other mutation button."
  - "Do not drop a To-Do's explicit assignment from Activity Detail."
  - "Do not give the subagent live transcript a composer or a control that acts on the child or the parent thread."
  - "Do not lay a subagent's work records out one line each between messages; each stretch is one collapsed row until opened."
compatibility_only_notes: []
stale_retired_dispositions:
  - "For the To-Do rows only, the native card presentation of F3-542 and F3-580 is replaced by one-line checklist rows (DL-147); the panel keeps its native frame."
  - "The Goal panel's View Goal route and its Ask for a replacement control are retired (DL-147); the agent-proposed replacement path is not."
  - "The Goal preview's Details button is retired with them (DL-147); the preview draws the compact Goal projection instead (amended 2026-10-09)."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-147, ContractName:Plans/Goal_Runtime_System.md#GRS-055, ContractName:Plans/ToDo_Runtime.md#TDR-011, ContractName:Plans/assistant-chat-design.md#ACD-485, ContractName:Plans/FinalGUISpec.md#F3-580

### F3-594 — Agents Are Puppets

```yaml
plan_unit_id: F3-594
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Every agent is drawn as a small marionette puppet (DL-149), after PMConcept7's onboarding helpers: a control bar
  with strings to the head and both hands, a chibi figure (a large round head, a small tunic, thin limbs) and one prop
  or piece of headwear that names its role, so roles read in grayscale; the seat hue is the second cue and paints the
  figure. One puppet primitive draws every agent, so a sheet's roster, specialists and cast plate (F3-595), a run
  card's cluster and lanes, a run view's plate, roster and conversation, Activity's team and subagent rows and the
  chat's live agents card show the same puppet; no agent is drawn as initials, letters or an avatar, and the puppet
  replaces F3-566's cast mark and ACD-469's avatar stack. Props by role: the Coordinator, and the chat's own
  assistant, wears a crown and keeps the text colour or its seat colour, never the accent (DL-111); the Chat Room
  Moderator holds a gavel wherever it is drawn; builders, implementers and helpers wear a hard hat; reviewers,
  checkers and testers hold a magnifier; critics and adversarial reviewers wear a jester's cap; Wonderer has an orbit
  ring and moon; Grill Me stands behind a little kettle grill, the same kettle as its glyph (F3-588); scribes,
  teachers and writers hold a page; architects and designers a set square; product roles a pennant; and You hold the
  control bar up yourself, with no strings. A Persona matches on its full name, then on its last word, and an unknown
  role wears the hard hat. Material by theme family: Basic is a blueprint line puppet, with the neon halo only on dark
  themes; Friendly is felt (a skin head with hair, a solid tunic in the seat hue, a wooden bar); Glass is crystal (a
  clear body with a lit edge and a light core); Retro is a pixel sprite. Under NieR Mode every agent is PMConcept7's
  NieR puppet unit: ink on parchment with no hue and no halo, a rigid ink visor band that overhangs the head, an ink
  coat, square joints and the role prop in ink. Its geometry and ink tokens belong to PMConcept7's onboarding owner of
  that unit, F3-598; the chat adds only Grill Me's kettle grill
  and the Moderator's gavel, drawn in ink, and the working state's static ink stage-floor line. No NieR part gates the
  puppet's look or its visor. Detail by size: the smallest sizes draw a bust, or under NieR Mode a pixel figure;
  larger sizes add the whole figure and its strings, then the face, then the joints, feet and family detail. States
  keep the mark grammar, drawn puppet-native: working is taut strings over a lit stage floor, queued slack strings and
  dimmed, needs you a raised hand with the warning notch, done the check notch, failed a cut hand string with a
  slumped head and the failed notch, abstained dimmed, optional a dashed figure, and a stand-in shows the swap notch.
  Motion: inside setup sheets puppets hold still; in run cards and run views a puppet acts once, swung on its strings
  as it starts working and hopping once when it is done or needs you, within the module cards' one-shot rule (F3-584);
  only on the chat's live agents card, which is not a module surface, does a working puppet keep swaying from its bar.
  Nothing moves at the smallest size, the motion voice is the family's (Retro and NieR step), and reduced motion and
  NieR Mode's Still preset leave the rest pose, with the NieR visor in its static state.
gui_related: true
gui_classification_reason: Defines how every agent is drawn in the assistant chat and the wand module sheets.
split_recommended: false
depends_on: [DL-149, F3-566, F3-584, F3-585, F3-588, F3-589, F3-598, DL-111]
unblocks: [F3-595]
acceptance_criteria:
  - "One puppet primitive renders every agent in sheets, run cards, run views, Activity and the live agents card in every theme, NieR Mode included, and no agent is drawn as initials."
  - "Every role prop is distinguishable in grayscale at the sizes the surfaces use."
  - "No setup sheet runs a puppet motion, no run card or run view runs a looping one, and reduced motion shows the rest pose."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: agent_mark_presentation_drift
reasoning_tier: high
context_scope: chat_tweaks_20261007
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-149"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md, SHA-256 acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt, SHA-256 e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/LEAD-RULINGS-20261008.txt, SHA-256 546fa6cc210c40b50a6a5db5f4d6e436af82c2e3d9541796b214bb27061d80c7"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/nier-puppets-final-handoff.md, SHA-256 492a3bbeae1285f1dd1d55dfbdc87da3bfa9fce207c9ef01a9f2005abb0ddfa0"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/PM7-COORDINATION-20261008.md, SHA-256 c31bdbf5c69cf7f3110b2bbdc63258848bba8eee69da4154f976c295e2881002"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "marionette puppet"
  - "puppet primitive"
  - "visor band"
  - "kettle grill"
negative_constraints:
  - "Do not draw an agent with initials, letters or an avatar."
  - "Do not draw a second puppet primitive for any surface."
  - "Do not give the puppet a hue or a glow under NieR Mode."
  - "Do not run a looping puppet motion in a setup sheet, run card or run view."
compatibility_only_notes: []
stale_retired_dispositions:
  - "F3-566's cast mark drawn from silhouette, spike and hue with its state as a ring, and ACD-469's avatar stack, are replaced by the puppet (DL-149)."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-149, ContractName:Plans/FinalGUISpec.md#F3-566, ContractName:Plans/FinalGUISpec.md#F3-584, ContractName:Plans/FinalGUISpec.md#F3-589, ContractName:Plans/FinalGUISpec.md#F3-598, ContractName:Plans/DRY_Rules.md#DR-044

### F3-595 — Cast Plates In Sheets And Run Views

```yaml
plan_unit_id: F3-595
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  One cast plate grammar draws every collaboration graph, in the four kinds' setup sheets and at the head of each run
  view (DL-149); each kind only describes its cast. A bar across the top reads from what goes in (the job, the topic,
  or Review's snapshot locked at Start) to who runs it: the Coordinator's or the Moderator's puppet on the bar, or
  Review's junction, where the snapshot goes down to the reviewers and their notes come back up to be compared. It
  ends in one accent edge to You (one checked result, one report, one plan, or pick what to keep). BrainStorm's bar is
  its seven chapters ending at You, and its team hangs from a bar of its own under the chapter names. The cast hangs
  under the bar on straight vertical and horizontal strings only, never diagonals or curves; every seat stands on one
  baseline at one pitch and is always named, and the full mode adds the model on a second line. A queued helper hangs
  on a slack string, and "waits its turn" is written once under the group. Review and BrainStorm stand a short screen
  between seats, because the helpers cannot see each other, said once in a note line. The specialists (Wonderer, Grill
  Me) stand in a wing on the right after a dotted rule in every kind that has them, and nothing routes under or
  through the wing. Chat Room's turn policy and rounds are one note line built from its settings, never arcs or a
  table. State shows on the seats only. The plate shows its richest mode that fits: full, then compact (names only),
  then a one-row strip, then one caption sentence, with BrainStorm adding a lean mode between compact and strip that
  keeps its chapters and Chat Room, whose slot is the shortest, adding a lean line between its strip and the caption
  that keeps every name whole. It skips any mode whose seats would sit closer than its minimum pitch, is never scaled
  to fit a sheet, and grows into spare height. Hovering or focusing a sheet control lights the plate parts it affects
  (F3-566). Every run view heads with the run's plate, its seats in their live states (working, waits, needs you, done
  or failed); a run that has not started shows everyone idle, never "waits its turn", and the Coordinator is done when
  the run is. The Crew view hangs a short after arrow from the helper a seat waits for, the BrainStorm view lights the
  chapter it is on, and the Chat Room's room document and a recorded Review report have a plate too. Run cards and run
  views show no Technical details, neither as a control nor as fine print; a collaboration setup sheet keeps its
  Technical details as the last row of its Advanced page (DL-149, decision card 8).
gui_related: true
gui_classification_reason: Defines the collaboration graphs in sheets and run views and the removal of Technical details from run surfaces.
split_recommended: false
depends_on: [DL-149, F3-594, F3-566, F3-569, CWR-020]
unblocks: []
acceptance_criteria:
  - "Every collaboration sheet and run view draws its graph in the cast plate grammar with straight strings only and every seat named in every mode."
  - "In a sheet the plate is never scaled to fit; it changes mode instead."
  - "No run card or run view renders Technical details as a control or as fine print."
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
  - "Plans/Decision_Log.md#DL-149"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md, SHA-256 acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt, SHA-256 e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/LEAD-RULINGS-20261008.txt, SHA-256 546fa6cc210c40b50a6a5db5f4d6e436af82c2e3d9541796b214bb27061d80c7"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "cast plate"
  - "waits its turn"
negative_constraints:
  - "Do not draw diagonal or curved strings in a cast plate."
  - "Do not route anything under or through the specialists' wing."
  - "Do not show Technical details on a run card or in a run view."
compatibility_only_notes: []
stale_retired_dispositions:
  - "F3-566's plate thresholds (full at 1 to 3 rows, compact at 4, a strip at 5 or 6, one sentence at 7 or 8) are replaced by this unit's fit rule, and the run card's and run view's Technical details are retired (DL-149)."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-149, ContractName:Plans/FinalGUISpec.md#F3-594, ContractName:Plans/FinalGUISpec.md#F3-566, ContractName:Plans/Collaborative_Workflows.md#CWR-020

### F3-596 — The Ask Card's Look

```yaml
plan_unit_id: F3-596
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The questions card (the Ask Card, the shared question card of assistant-chat-design section 7.4) keeps its
  behaviour, features, layout and choreography timings and takes this look (DL-150). Its quiet shell carries a faint
  accent light in its top-left corner, and the prompt, as the title, has the needs-you mark of F3-585 beside it, lit
  and still apart from one hop as each question arrives. The spine to the right of the options is a progress wire: an
  accent fill runs from the first mark to the current one and rides the thumb's spring; answered marks are accent
  beads, skipped ones hollow and the rest solid discs, and the current mark is a numbered accent circle. Next, or
  Submit on review, is the card's one filled control, in the accent. Resting option rows sit on a faint ink tint; the
  chosen row takes an accent tint with an accent hairline, an accent number and a semibold label. Pressing a row
  springs that row only, and the selection lands: the radio's dot pops in, or the check draws itself once. Review rows
  lead with a numbered disc, accent when answered and dashed for Not answered. The optional note's label is in
  sentence case and its well takes an accent focus ring. The footer rises in as the rows land, never scaling past the
  card's edges, and the spine's wire draws down from the first mark; rows leaving on a question change settle within a
  few pixels. Under NieR Mode the chosen answer is the menu cursor (an ink bar with paper text), the spine's marks are
  diamonds, the selection lands in steps and nothing glows. Reduced motion lands every Ask Card motion at its end
  state. Its accent stays within ACD-469's budget for needs-you items.
gui_related: true
gui_classification_reason: Defines the questions card's visual presentation.
split_recommended: false
depends_on: [DL-150, ACD-469, F3-585, F3-589]
unblocks: []
acceptance_criteria:
  - "The Ask Card's behaviour, draft lifecycle and choreography timings are unchanged."
  - "The chosen option, the progress wire and the one filled primary render in every theme; under NieR Mode the chosen answer is the menu cursor and nothing glows."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: question_card_presentation_drift
reasoning_tier: standard
context_scope: chat_tweaks_20261007
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-150"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md, SHA-256 acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "Ask Card"
  - "progress wire"
  - "menu cursor"
negative_constraints:
  - "Do not change the questionnaire's behaviour or draft lifecycle through its look."
  - "Do not give the Ask Card a second filled control."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-150, ContractName:Plans/assistant-chat-design.md#ACD-469, ContractName:Plans/FinalGUISpec.md#F3-585

### F3-597 — The Assistant Chat Under The Retro Themes

```yaml
plan_unit_id: F3-597
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Under Retro Dark and Retro Light the assistant chat paints the app's Retro token tables (F3-426), which now carry
  PMConcept7's retro themes (DL-151): Retro Dark is PMConcept7's olive Atlas palette with a lime-yellow primary, and
  Retro Light is ink on warm paper with a blue primary. On Retro Light the warning ink is the darker orange of
  F3-426's table, which reads at about 4.6:1 on the paper, and the user turn's text is paper-coloured on its green
  (decision card 3). The chat uses PMConcept7's retro box grammar. Every corner is square, except 2 px on inputs,
  chips and pills, and except the round dials, rings, status dots and the discs a motion draws. Structural boxes carry
  a 2 px dark structural line (--border) and inner boxes a hairline (--border-light); where a box had a 1 px border
  its second pixel is an outer ring, so no box changes size. Shadows are hard offsets with no blur, from F3-426's
  elevation tokens: 5 px (--elev-3) on menus, hover cards, drawers, dialogs and sheets, 3 px (--shadow) on thread
  rows, deliverables and the assistant turn, and 2 px (--elev-1) on the primary button and the activity bar; menus,
  hover cards, drawers and dialogs are opaque. Thread rows are boxed on a darker rail, and the selected row is a lime
  box with a lime line and a lime hard shadow. The user turn is a solid block in the theme's lime (--accent-lime, a
  theme-token role under DR-043, not the accent) inside the structural line, with PMConcept7's soft directional lime
  glow beside it, the one blurred shadow under Retro; it is a Retro-only exception to ACD-469's neutral user bubble.
  The assistant turn sits in a square box on the raised surface with one plain structural line all round and the hard
  retro shadow, never a coloured edge or side strip on any side, with its turn mark and spine still in the gutter
  outside the box (decision card 4). Live work is PMConcept7's operation card (a lime wash and an olive edge) instead
  of the accent ring and glow; deliverables are cards with a hard shadow, and system, event and plan cards are cards
  with no shadow; no surface carries a decorative gradient. The composer is a square box in the structural line that
  keeps its resting look on focus, with square selectors and a square Send, and a queued follow-up is a square chip
  with an orange line. Module sheets take the structural line and the 5 px hard shadow. Focus is a 2 px outline, lime
  on Retro Dark and blue on Retro Light (F3-201); scrollbar thumbs are square, in the primary at half strength; the
  Retro pixel grid lies over the whole app under the Retro texture settings (Settings_System section 4.4) and never
  takes a pointer. Kept unchanged: IBM Plex Mono and every retro font size, every retro motion (ACD-475's Retro voice,
  the print-in, the phosphor bloom and the block caret) and the retro sound kit. NieR Mode paints over Basic, so none
  of this applies under NieR Mode.
gui_related: true
gui_classification_reason: Defines the assistant chat's presentation under the Retro theme family.
split_recommended: false
depends_on: [DL-151, F3-426, F3-201, ACD-469, ACD-475, F3-562, F3-589, DR-043]
unblocks: []
acceptance_criteria:
  - "Under Retro the chat paints only F3-426's Retro token values, with square corners, the structural line and blur-free hard shadows as stated."
  - "Retro fonts, motion and sounds are unchanged, and under NieR Mode none of this applies."
  - "No Retro transcript item draws a coloured side strip, and the assistant turn's box has one even line all round."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: theme_token_drift
reasoning_tier: high
context_scope: chat_tweaks_20261007
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-151"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md, SHA-256 acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt, SHA-256 e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/PMCONCEPT7-RETRO-VALUES.md, SHA-256 4268674a786a33f938d43a5c91c32ba8324c78d883070e13e5aaab7b030ebdec"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/LEAD-RULINGS-20261008.txt, SHA-256 546fa6cc210c40b50a6a5db5f4d6e436af82c2e3d9541796b214bb27061d80c7"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "box grammar"
  - "hard offsets with no blur"
  - "operation card"
negative_constraints:
  - "Do not give the chat a Retro palette outside F3-426."
  - "Do not change Retro motion or sounds through this unit."
  - "Do not draw a coloured left edge or side strip on a Retro assistant turn."
compatibility_only_notes: []
stale_retired_dispositions:
  - "Under Retro, ACD-469's neutral user bubble and uncontained assistant prose are replaced by the lime user block and the boxed assistant turn (DL-151)."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-151, ContractName:Plans/FinalGUISpec.md#F3-426, ContractName:Plans/assistant-chat-design.md#ACD-469, ContractName:Plans/assistant-chat-design.md#ACD-475, ContractName:Plans/DRY_Rules.md#DR-043
