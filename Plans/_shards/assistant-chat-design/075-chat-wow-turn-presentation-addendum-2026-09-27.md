# Shard 075: Chat WOW Turn Presentation Addendum (2026-09-27)

Source: `Plans/assistant-chat-design.md`

Source lines: L26158-L26834

Source SHA256: `220d4181bffdaeb910fc6072fecd78885c71dc25830653ca8e9d16ceb17d0d93`

---

## Chat WOW Turn Presentation Addendum (2026-09-27)

This addendum carries Jared's 2026-09-26/27 decisions on the rebuilt chat transcript (DL-104 through DL-108) into this owner. The 5.6 Pro concept (`Concepts/chat-assistant-concepts/5.6 Pro/`, its `Chat updates.md`) is source lineage only; its lab tools are excluded by ACD-474. Where a unit below supersedes earlier text it says so in `stale_retired_dispositions`; everything it does not name stays as specified. The collaboration, Back Seat Driver, scheduling, memory, ELI5 and revert card internals belong to their own owners; this addendum places those items in the transcript (family, gutter, spine, accent) only.

### ACD-469 - Turn Stage Transcript Rendering Families And Accent Budget

```yaml
plan_unit_id: ACD-469
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The default chat transcript presentation is Turn Stage (DL-104). Each assistant turn opens with a
  turn mark in a gutter (24px; 18px in a chat pane narrower than 540px) that replaces the repeated
  assistant label, and a hairline spine runs from the mark through every assistant-side item of the
  turn to an end dot. The spine, its family-coloured ticks and the light that travels down it to the
  live item form a functional turn connector, not a decorative stripe under APR-008, APR-009 and
  APR-034, and they draw as paint only: they never add scroll width or height. This contract extends
  the ACD-072 rendering column: every persisted record resolves, through one owner family map keyed
  by message_type and, for runtime cards, by the owning card kind, to exactly one of seven families.
  Prose (assistant text) has no container and is the only full-contrast reading type (14px). Work
  (the working activity card) is a sunken instrument surface. Deliverable (plans, artifacts, change
  records) is a raised sheet with an icon eyebrow and a title. Needs you (approvals, questions,
  advice that waits on the user, blocking errors, waits) is an accent-tinted item with one primary
  action. People (collaboration runs, live agents, delegation) is a roster led by the agents' puppets
  (FinalGUISpec F3-594, DL-149), never initials or avatars.
  Time (scheduled messages) is a ticket with a time block. Ledger (receipts, context and thread
  operations, route changes, attachment events, informational notices) is one muted line on the
  spine. A user turn is a right-aligned bubble on a raised neutral surface with no accent. Under
  Retro (DL-151, FinalGUISpec F3-597) the user turn is a solid block in the theme's lime, a theme-token
  role under DR-043 and not the accent, and the assistant turn sits in a square box with one plain
  line all round and no coloured edge, its turn mark and spine still in the gutter; the families, the
  spine and the accent budget are otherwise unchanged. The
  accent budget: the accent colours only live work, needs-you items, the one primary action of a
  card, and Send and Stop; family hues are quiet and appear only on eyebrow tiles and spine ticks.
  Message types, their persistence and the ACD-073 boundary are unchanged.
  For scheduled-message cards, the Time-family ticket and time block identify the transcript
  family only. Scheduling_and_Quota_Resume SQR-012 owns the card's internal layout and renders its
  time in the schedule's own time zone; that layout is accepted within Time (DL-138).
  Amended 2026-10-29 (PC1–PC5, X1; PM7): Agents use the one Pip primitive F3-594; category marks use robot. Families/states remain this owner’s; Pip adds no welcome-back or other conversation capability.
gui_related: true
gui_classification_reason: "Defines how every transcript item renders in the default chat presentation."
split_recommended: false
depends_on: [DL-104, DL-149, DL-151, ACD-072, ACD-073]
unblocks: [F3-562, DR-043]
acceptance_criteria:
  - "A scheduled-message card retains its SQR-012 layout and schedule time zone within the Time family."
  - "Every persisted message type and runtime card kind maps to exactly one of the seven families through one owner map."
  - "The spine, ticks and live light add no scroll width or height at any chat pane width."
  - "In Basic Dark no transcript element uses the accent outside live work, needs-you items, a card's one primary action, and Send and Stop."
  - "Assistant prose renders without a container and user turns render as right-aligned neutral bubbles, except under Retro as FinalGUISpec F3-597 states (DL-151)."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_transcript_presentation_drift
reasoning_tier: high
context_scope: chat_transcript_presentation
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/DRY_Rules.md
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-138 (owner answers, 2026-09-29)"
  - "Plans/Decision_Log.md#DL-104"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "DL-138"
  - "SQR-012"
  - "Turn Stage"
  - "turn mark"
  - "spine"
  - "prose"
  - "work"
  - "deliverable"
  - "needs you"
  - "people"
  - "time"
  - "ledger"
  - "accent budget"
negative_constraints:
  - "Do not render every item kind in one shared card shell."
  - "Do not spend the accent on decoration, event icons, the user bubble, model chips or chart bars; the Retro user block is the theme's lime, a theme-token role, not the accent."
  - "Do not draw a coloured edge or side strip on a boxed Retro assistant turn."
  - "Do not let the spine, ticks or live light extend scrollable area."
  - "Do not infer a record's message_type from its family."
stale_retired_dispositions:
  - "ACD-072 rendering column values left-aligned bubble for user and right-aligned bubble for assistant are superseded for the default presentation by DL-104: user turns are right-aligned neutral bubbles and assistant prose has no container."
  - "The People roster's avatar stack is replaced by the agents' puppets (DL-149, FinalGUISpec F3-594)."
  - "Under Retro only, the neutral user bubble and the uncontained assistant prose are replaced by the lime user block and the boxed assistant turn (DL-151)."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-104, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/DRY_Rules.md#DR-043

### ACD-470 - Streaming Reply Presentation And Terminal Records

```yaml
plan_unit_id: ACD-470
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  An assistant reply streams in place (DL-106) over the single update path of ACD-238 and ACD-240.
  Before its first text the reply shows a thinking placeholder, the model's name and a shimmering
  is-thinking label with elapsed seconds after 4 seconds; it is a waiting indicator, not a reasoning
  stream. When the model supplies reasoning, the placeholder is the line of ACD-221's thinking block
  and the reasoning streams in that block, never in the reply (amended 2026-10-23, DL-234); the reply
  then starts writing without the label as the reasoning hands over. When text arrives the label condenses toward the turn mark while
  the first word appears where the caret starts. Words are released at a steady, rate-smoothed pace
  that speeds up when text is waiting and breathes at sentence ends; the pacing is presentation only
  and never delays, reorders or drops text. Lists, headings, inline and fenced code stream as
  themselves with the same formatting rules as the settled message, the reply's height follows its
  text smoothly, and the settled message is identical to the last streamed frame. A reply that
  follows visible work (the answer after a working card) starts writing without the thinking label.
  A reply ends in exactly one terminal state: complete; stopped, when the user pressed Stop, which
  keeps the text displayed so far with a Stopped marker; steered, when the user sent a queued
  message with Send now, which keeps the text so far with no marker (ACD-471); or error, which keeps
  the text so far with the error's note. A stopped, steered or errored partial reply is persisted as
  a partial transcript record for display and is never replayed as a complete assistant turn
  (EP-128). Leaving the thread never cancels the reply: APR-020 invalidates the view's pending
  callbacks, not the run or the reply, which is complete when the user returns. A fallback batch
  reply (ACD-229) appears whole with the settle beat only; it is never pseudo-streamed.
  Amended 2026-10-29 (L1, PC4; PM7): Thinking placeholder consumes the shared Think loader, handing over to Orbit’s Pip without duplication; one Pip per reply and no extra status key.
gui_related: true
gui_classification_reason: "Defines the visible life cycle of a streaming assistant reply."
split_recommended: false
depends_on: [DL-106, ACD-238, ACD-240, ACD-221, ACD-229, EP-128, DL-234]
unblocks: []
acceptance_criteria:
  - "A reply shows the thinking placeholder until its first text and ends in exactly one of complete, stopped, steered or error."
  - "Stopped and errored replies keep their displayed text with a marker; steered replies keep it with no marker; none is replayed as a complete turn."
  - "The settled message renders identically to the final streamed frame."
  - "Switching threads during a reply does not cancel it."
  - "A fallback batch reply is shown whole, never pseudo-streamed."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_streaming_presentation_drift
reasoning_tier: high
context_scope: chat_streaming
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Executor_Protocol.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-106"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "thinking placeholder"
  - "complete"
  - "stopped"
  - "steered"
  - "error"
  - "Stopped"
  - "partial transcript record"
negative_constraints:
  - "Do not present the thinking placeholder as a reasoning stream."
  - "Do not let presentation pacing delay, reorder or drop text."
  - "Do not replay a partial reply as a complete assistant turn."
  - "Do not cancel a reply because its thread lost focus."
  - "Do not pseudo-stream a batch reply."
stale_retired_dispositions:
  - "APR-020's wording that a thread switch invalidates pending streaming completions is read as the view's callbacks only; the run and the reply continue (DL-106)."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Executor_Protocol.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-106, ContractName:Plans/Executor_Protocol.md#EP-128

### ACD-471 - Busy Sends Steer Or Queue With Queue Default Send Now Steers Stop Holds The Queue

```yaml
plan_unit_id: ACD-471
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  While a reply streams or work runs, the composer's Send becomes Stop (the Send/Stop morph)
  whenever the composer is empty, and Stop is never a control inside the working activity. A message
  sent while the assistant is busy follows general.interaction.queue-behavior, whose default is
  Queue (DL-108): Queue adds it to the FIFO follow-up queue of at most two entries; Steer, still
  offered by the composer's Steer/Queue switch, sends it into the running turn at once. Send now on
  a queued entry steers without stopping the answer (ACD-219): the reply written so far stays with
  no Stopped marker, that entry is delivered through cmd.chat.queue.send_now, and any other queued
  entry keeps waiting. Edit on a queued entry returns its text to the composer and removes it
  through cmd.chat.queue.remove; Remove does the same without restoring. The queue advances on its
  own only when a turn completes normally; after a Stop or an error it waits for the user's Send,
  Send now, Edit or Remove, as section 4 already says that Stop does not clear the queue. Every
  automatic advance and every Send now goes through the same send handler as an ordinary send, so
  holds and validations run again.
  Amended 2026-10-29 (D8; PM7): Composer Stop ends the current reply and holds the queue only. It does not stop background processes; Processes explicitly says so and offers owner-routed Stop/Stop all.
gui_related: true
gui_classification_reason: "Defines the visible composer behaviour while the assistant is busy."
split_recommended: false
depends_on: [DL-108, ACD-219, ACD-228]
unblocks: [F3-563, UCC-168]
acceptance_criteria:
  - "With the default setting, a send while busy is queued; with Steer selected it goes to the running turn."
  - "Send now steers without stopping the reply and sends only its own entry."
  - "After Stop or an error, queued entries remain queued until the user acts."
  - "Queued sends and Send now pass through the ordinary send handler, holds included."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: busy_send_semantics_drift
reasoning_tier: high
context_scope: chat_queue
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/Settings_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_behaviour_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-108"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "Queue"
  - "Steer"
  - "Send now"
  - "cmd.chat.queue.send_now"
  - "cmd.chat.queue.remove"
  - "general.interaction.queue-behavior"
negative_constraints:
  - "Do not make Send now stop the reply."
  - "Do not advance the queue after a Stop or an error."
  - "Do not bypass holds or validations for a queued send."
  - "Do not place Stop inside the working activity."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-108, ContractName:Plans/UI_Command_Catalog.md#UCC-168

### ACD-472 - Follow Along Release Rules And The Fold Height Hold

```yaml
plan_unit_id: ACD-472
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Follow-along (general.interaction.auto-follow, section 4) keeps a reader at the bottom attached
  while a reply streams or a card grows, gliding after the growth with a critically damped approach
  rather than jumping. It is released only by the reader: wheel or touch scrolling up, dragging the
  scrollbar, a scrolling key outside a text field, or anything that moves the view up such as a jump
  to a search result; it re-engages when the reader returns to the bottom or uses the jump-to-latest
  control. Growth never moves a reader who scrolled away, and a receipt landing never drags them
  back down. When a turn's working card folds as its answer starts (ACD-473), the height the card
  gives up is held for the answer, as a floor on the list's height taken from before the fold, and
  released gently once the answer settles, so content above the reader moves at most a few pixels
  instead of jumping. A working card that gets shorter mid-turn under a reader at the bottom (a
  narration line tucking into its caption, a subject's rows folding) holds the list's height the
  same way for a moment, so the next subject can fill it, and then eases the rest away; the thread
  never snaps down under the reader. Clamping and layout anchoring are not reader input and never
  release follow-along.
gui_related: true
gui_classification_reason: "Defines scroll behaviour the reader sees during streaming and card changes."
split_recommended: false
depends_on: [ACD-239, ACD-249, ACD-473]
unblocks: []
acceptance_criteria:
  - "A reader at the bottom stays within 24px of the bottom through a streaming turn, never away for more than 300ms."
  - "A wheel-up during a stream is never pulled back to the bottom."
  - "When a card folds as its answer starts, content above the reader moves at most 5px."
  - "When a working card shrinks mid-turn, the thread above a reader at the bottom eases down rather than snapping (no drop faster than 0.4px/ms)."
  - "The jump-to-latest control keeps its unseen-count badge (section 4)."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: scroll_follow_drift
reasoning_tier: high
context_scope: chat_scroll
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_behaviour_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-105"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "follow-along"
  - "general.interaction.auto-follow"
  - "jump-to-latest"
negative_constraints:
  - "Do not move a reader who scrolled away."
  - "Do not treat clamping or anchoring as reader input."
  - "Do not let a folding card move content above the reader by more than a few pixels."
  - "Do not let a card shrinking mid-turn snap the thread down under a reader at the bottom."
owner_hints:
  - Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-105

### ACD-473 - Working Activity Behaviour Over Operation Records

```yaml
plan_unit_id: ACD-473
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The working activity card (Orbit by default, Step Rail as the simple style under
  general.interaction.working-activity-style) is a projection over the turn's operation and tool-
  call records (ACD-104, EP-128): the records stay the source of truth, keep their narrative order
  in the record stream, and remain individually inspectable in the card's panel; the card aggregates
  them into subjects instead of rendering one transcript card per tool call. Subjects spawn as their
  tool calls start and several may be live at once; each carries a status of running, completed,
  failed or waiting. A failed subject is flagged; a subject waiting for approval shows a pause
  state, the card's core reads Waiting for you, and a needs-you approval item appears in the
  transcript directly under the card offering the ACD-011 approval ladder through
  cmd.runtime.approve and cmd.runtime.decline. Past 16 visible subjects, adjacent subjects of the
  same kind merge into a counted cluster; past 30 nodes the oldest fold into one Earlier node, so
  the card never shows more than 30 nodes. A short narration line between tool calls streams at the
  foot of the card and tucks into the card's head caption when the next subject starts; narration is
  a user-facing progress summary, durable and attributed to its turn, not an internal work note
  (APR-056); text longer than about 160 characters, or that ends the turn, stays transcript prose. A
  live card stays expanded; when the turn's final answer starts streaming it folds into its compact
  strip (DL-105), and the strip can be reopened. A new live card grows out of its turn's mark. Only
  live cards re-render on the working clock. In a provider tier without internal visibility
  (PROVIDER-005) the card shows only subjects and narration the provider actually reported and never
  invents them.
  Amended 2026-10-29 (PC4; PM7): Keep protected Orbit choreography, replacing centre with Pip and current tool badge; coordinate with thinking placeholder so a reply never has two visible Pips.
gui_related: true
gui_classification_reason: "Defines the visible behaviour of the working activity card."
split_recommended: false
depends_on: [DL-105, ACD-104, ACD-011, EP-128]
unblocks: [F3-562]
acceptance_criteria:
  - "The card never shows more than 30 nodes; clusters and the Earlier node keep every subject reachable in the panel."
  - "Several subjects can be live at once; failed and waiting states are visible on the ring and in the panel."
  - "A waiting subject produces a needs-you item under the card that offers the ACD-011 ladder."
  - "A narration line never becomes its own card while the turn's work continues."
  - "The card folds into its strip when the final answer starts streaming and can be reopened."
  - "In a provider tier without internal visibility no subject or narration is invented."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: working_activity_behaviour_drift
reasoning_tier: high
context_scope: chat_working_activity
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Executor_Protocol.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_behaviour_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-105"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "Orbit"
  - "Step Rail"
  - "Waiting for you"
  - "Earlier"
  - "general.interaction.working-activity-style"
  - "cmd.runtime.approve"
  - "cmd.runtime.decline"
negative_constraints:
  - "Do not render one transcript card per tool call inside a working turn."
  - "Do not keep the last working card expanded after its answer starts."
  - "Do not invent subjects or narration a provider did not report."
  - "Do not treat narration as an internal work note."
stale_retired_dispositions:
  - "Section 13.1 one-card-per-command placement for operations inside a live working turn is superseded by the working card projection over the same records (DL-105); the records, their order and their inspectability are unchanged."
  - "The Cumulative v3 Protected Working Activity wording that the last activity stays expanded is superseded by the fold when the answer starts (DL-105)."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Executor_Protocol.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-105, ContractName:Plans/Executor_Protocol.md#EP-128

### ACD-474 - Lab Only Concept Controls Excluded From Canon

```yaml
plan_unit_id: ACD-474
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The binding-by-reference of the 5.6 Pro concept (FinalGUISpec 2026-09-03 redesign section) and
  every later promotion of it exclude its lab tools, which are never product: Demo Studio and its
  family and variant indices, the Motion voice picker (production motion follows the theme family,
  ACD-475), the Live turns demos and thread, the Multi Orbit demo, the working card's demo drawer
  (play, pause, step, complete, reset, work history), the instant or stream reply switch, the
  scripted replies, the film clock, and every measured timing recorded in the concept's notes. None
  of them receives a command, setting, wiring row, persisted key or test gate.
  Amended 2026-10-09 (DL-185): Demo Studio is now one for all of PMConcept7 (Plans/DRY_Rules.md#DR-070,
  Plans/FinalGUISpec.md#F3-649): the chat's demo controls, the tour's and onboarding's, the home demos and later the
  Orchestrator's and the Planning Wizard's are its sections, and it stays lab only under this unit's exclusions.
gui_related: true
gui_classification_reason: "Keeps concept lab controls out of product surfaces."
split_recommended: false
depends_on: [DL-106, DL-185, DR-070]
unblocks: []
acceptance_criteria:
  - "No product catalog, settings inventory, wiring matrix or persisted key names a lab tool listed here."
  - "The working card offers no play, pause, step, complete, reset or history controls in product."
  - "The one Demo Studio of PMConcept7 is excluded from every product catalog, setting, wiring row, persisted key and test gate, like the chat's was (DL-185)."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: lab_control_leak
reasoning_tier: high
context_scope: chat_concept_boundary
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
node_compile_hint:
  mode: owner_exclusion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-106"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
  - "Plans/Decision_Log.md#DL-185"
  - "Plans/DRY_Rules.md#DR-070"
  - "Plans/FinalGUISpec.md#F3-649"
preserved_exact_tokens:
  - "Demo Studio"
  - "Motion voice"
  - "Live turns"
negative_constraints:
  - "Do not register a lab tool as a command, setting, wiring row, persisted key or test gate."
  - "Do not carry concept family or variant indices into product settings."
stale_retired_dispositions:
  - "Amended 2026-10-09 (DL-185): Demo Studio is one for all of PMConcept7 (DR-070, F3-649); DL-185 and DR-070 are in depends_on, and F3-649 stays in source_lineage because F3-649 depends on this unit."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-106

### ACD-475 - Motion Voices By Theme Family And Chat Sound Cues

```yaml
plan_unit_id: ACD-475
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Chat motion has one voice per theme family (DL-106): Basic, Friendly, Glass and Retro, with dark and
  light sharing a voice. Every beat (sending, the thinking placeholder, word arrival, the working card's
  birth, the narration tuck, the fold, family entrances, thread switch) is written once; a voice changes
  only its path, easing and texture, never its timing or order, and light themes replace glows with soft
  shadows. Retro quantizes its steps inside the same window. Friendly and Glass are each as distinct from
  Basic as Retro and NieR are (DL-179): Friendly soft, warm and a little playful; Glass depth, focus, light
  and refraction. That difference lives only in path, easing and texture, so it changes no timing or order,
  and each voice's exact values are its design tokens (DL-113), not unit text. These voices are the only
  motion voices: every surface that moves, the Usage page included, takes them from this unit and keeps no
  voice or per-view override of its own (DR-043). Within one moment every voice keeps the beats' order and
  start times; on every surface, as DL-138 allows for a card's own changes, a voice may also set the length
  of an element's own travel. Basic is crisp and exact: the old view pans away, arrivals rise straight and
  one light floor crosses the lead element. Friendly steps the old view back and tilts it away, and
  arrivals hop up on one soft spring with an alternating lifted corner; a warm bloom rises under the lead
  element, and travelling marks follow a hop arc and land with a small puff. Glass moves the camera in
  depth: going forward the old view keeps its size, drifts and defocuses at the lens while the new view
  comes toward the viewer, and going back the old view shrinks away defocused while the new view settles
  back from in front; the focus racks to the new view, which arrives sharp with the lead element first, one
  refraction band crosses the surface, and travelling marks rise toward the viewer with a glint. Retro and
  NieR Mode step every motion, NieR keeping its own owners (SSYS-043, F3-598), and their travelling marks
  take a stepped early leg rather than standing still. In every voice a value never overshoots: springs,
  hops and arcs move plates, marks, beads and paths, never a number, and a hop that lands on a number moves
  it a few pixels at most and never scales it. No voice scales the outgoing view above 1 or draws an
  arriving surface through a blur. A voice may blur only on a computer with a GPU, only the outgoing view's
  one layer, at most 6 px, ending at exactly zero and removed on finish and on every interruption; without
  a GPU no voice blurs. Continuous motion uses transform and opacity only, and nothing animates at idle.
  Reduced motion, from the operating system or general.visual.reduce-animations, lands every beat at its
  end state. The chat's sound cues (DL-107) are send, first word, work started, step finished, failure,
  needs you, answer arriving, turn complete and stop. They are events of the Notifications & Sounds owner,
  played through its sound mapping and the global general.interaction.sound-effects switch (on by default),
  with one kit per theme family; the chat header's speaker button toggles that same key. Cues are subtle,
  at most one per 120ms, step ticks at most one per 250ms and silent inside bursts; audio starts only after
  a user gesture; and each cue accompanies a visible change, never carrying information alone. Reduced
  motion does not mute sound. DL-138 confirms that theme-specific durations apply to sheets and a card's
  own changes, while transcript entrances retain this unit's shared timing and order; wand cards which opt
  out of the family entrance do not play an additional transcript entrance. Amended 2026-10-16 (DL-215;
  Jared's motion bar): every motion on every surface, these voices and every owner's own, meets one
  acceptance bar: the control acknowledges the input within 100 ms (its pressed or selected state shows, or
  the ink moves); the new state is fully drawn within 300 ms on P1000-class hardware, or a deliberate
  transition starts within 100 ms and covers the work; no frame is held longer than 100 ms mid-transition;
  and on M3-class hardware the click's Event Timing duration is 100 ms or less. The final motion judgement,
  standing in for Jared, also counts any flash, blank, jump, ghost, late snap or stall a person sees as a
  failure. Reduced Motion still lands every beat at its end state. Measured concept films are evidence for
  this bar, not native certification. Amended 2026-10-16 (DL-216; Jared chose option A of the P1000
  decision, in his words): keep every effect and accept the P1000's GPU first-draw and raster limit. The
  full bar still applies to everything bound to the main thread. GPU-raster-bound frames on the P1000 are
  recorded, not failed, as long as each moment starts within 100 ms and never blanks. No low-end-GPU tier
  reduces effects. Amended 2026-10-16 (DL-217, the shell lane): one shared busy signal answers for every
  surface whether the app is in a page change, a Usage moment, the onboarding window, a boot cover, the
  NieR reboot plate or calm cover, a look cover or a NieR switch not yet painted. It reads no style or
  layout, and an idle notice follows the end of each busy spell. Background refreshes, measurements,
  prewarming and catch-up wait on it, and no surface keeps an idle detector of its own. A second shared
  answer says whether a look's cover hides the page; a surface it hides draws nothing new until the cover
  lifts, and a selection chip waits only for a real cover, never for a merely busy page. A move begun in a
  frame that was drawn late starts from its beginning once frames come on time again, at most six frames
  later or until a page-change hold ends, so no move is spent before it is seen. In the concept these are
  PM_BUSY, the pm-idle event, PM_LOOK_COVERED and PM_START_ON_SHOWN. Amended 2026-10-17 (DL-219, DL-222): a
  page change may hold while the arriving page is still drawing its first screen. The leaving page stays,
  with the click's motion still running, until the arrival is ready or about 1.5 s from the click's own
  frame, whichever is first; then the entrance plays from the start, and the exit takes over from the
  opacity the click's fade has reached (F3-464; amended 2026-10-17, review r1). That hold is the covering
  transition this bar allows, and the bar itself is unchanged. NieR still holds and makes no fade. Under
  Reduce Animations, and under a cover, the page swaps at once, arrives whole, and is not held. A move held
  at its start, or released but not yet on its first frame, still counts as running: nothing finishes,
  cleans up or cancels it as it starts, and a held page is never shown at once with no entrance. Where the
  work behind a pick is heavy, the control shows its new state in the input's own frame and the write or
  redraw follows that frame; the latest pick wins, and a waiting write is applied before another input, a
  paint or a close. Idle preparation is this one rule for every surface. It never causes a visible hitch.
  It runs only while the page is visible, the shared busy signal is empty, the user is not interacting and
  nothing is animating, and frames are on time. A step that makes a frame late backs off and is dropped
  rather than hitching again; repeated late steps stop it for the session. It is best effort: dropping it
  never loses the screen. Preparation for a surface's next first use comes before speculative warm-up.
  Queued preparation is dropped when its surface goes away. The rule is the same on every machine (DL-219).
  Having no GPU is the existing capability path, not a lower-spec tier. Concept performance work stops at
  "not horribly slow" (DL-220); that bound does not replace this bar. During a page-change hold the leaving
  page stays the interactive page until release. The quality bar is DL-224. Coordinator default, not
  objected by Jared (2026-10-17, DL-230): a surface drawn unseen for preparation stays out of the focus
  order and the accessibility tree until it is shown, and focus that lands in it returns where it came
  from. Amended 2026-10-17 (DL-228): the page-change hold's rule holds inside a surface too: a leaving
  panel or pane stays drawn where it was, inert (out of the tab order and the accessibility tree, taking no
  keys), until the incoming view's first frame, then fades as the entrance starts; the left rail (F3-621)
  and the terminal card consume it, NieR keeps its own erase and Reduced Motion swaps at once. Reduced
  Motion is instant (DL-115): a room, page or tab change and an entrance land at their end state; where an
  owner allows a very short opacity settle under Reduced Motion (F3-520's onboarding steps, F3-438's switch
  colour) it never moves or scales, and a Usage room change takes none, so the concept's Usage dissolve
  under Reduced Motion is not adopted. A waiting cover's calm, travel-free pulse is waiting feedback and
  stays (F3-077, DL-216). Amended 2026-10-29 (X2, L3/L4, PC1; PM7): Pip’s optional sheet sway/blink/gaze
  and bounded onboarding life supersede nothing-animates-at-idle only on those illustrative surfaces.
  Needs-you remains louder; motion pauses hidden/offscreen/during drags. Loader uses family periods and
  reduced-motion breath/blink exception of F3-662, no travel. App chirps use the one master player and
  existing chat mute, default off as a Pip part. Main-button pointer/keyboard acknowledgement is within 100
  ms with no busy stall/deferral workaround and no double commit; disabled oops never activates.
  X2/L8, PM7 final GUI alignment f99ad183d2, 2026-10-30 (F3-3): the shared PM_BUSY signal also names drag,
  after cover reasons so a cover retains priority. PM_BUSY.drag() reads the five shared body drag classes;
  PM_BUSY.idle(fn, timeout) defers a request made during a drag and rechecks a callback that lands in one,
  resubmitting after pm-idle. No idle job runs inside a held drag. This helper does not make a hidden tab
  busy by itself or waive caller visibility, other busy/cover, interaction and animation gates. No new
  command, binding, setting or event family is introduced.
gui_related: true
gui_classification_reason: Defines per-theme motion and the chat's sound cues.
split_recommended: false
depends_on:
- DL-106
- DL-107
- UCC-103
unblocks:
- F3-564
- DR-043
acceptance_criteria:
- Per-theme card or sheet durations cannot change transcript entrance timing or order.
- The same logical interaction beat has the same order/timing except the explicitly approved L4 universal-loader
  family periods (F3-662, DL-138 own-travel allowance).
- Friendly and Glass motion are visibly distinct from Basic in path, easing and texture, as Retro's is, on
  every surface that uses the voices, chat and Usage alike.
- In no voice does a value overshoot, the outgoing view scale above 1 or an arriving surface draw through a
  blur; a blur appears only with a GPU, only on the outgoing layer, and is gone after every finish and interruption.
- Reduced motion from either source lands end states.
- Chat cues route through the Notifications & Sounds owner; no chat-local sound setting or volume exists.
- No more than one cue plays per 120ms and no step tick within 250ms of another; nothing plays before a user
  gesture.
- Every interaction acknowledges within 100 ms, is fully drawn within 300 ms on P1000-class hardware or starts
  a covering transition within 100 ms, holds no frame over 100 ms mid-transition, and has an Event Timing duration
  of 100 ms or less on M3-class hardware.
- On P1000-class hardware main-thread work meets the full bar; a GPU-raster-bound hold is recorded, not failed,
  only when its moment started within 100 ms and showed no blank frame.
- Deferred work on every surface waits on the one shared busy signal; nothing draws new content under a look
  cover; a move begun in a late frame is seen from its start.
- A page change holds the leaving page while the arrival is still drawing, for at most about 1.5 s from the
  click's own frame, and the entrance then plays from the start. The hold is a covering transition; the bar
  is unchanged. NieR holds and makes no fade. Under Reduce Animations, and under a cover, the page arrives
  whole and is not held. A held or not-yet-shown move is not finished, cleaned up or cancelled as it starts.
  During the hold the leaving page stays the interactive page until release.
- A heavy pick shows its new state on the control in the input's own frame; the write or redraw follows, the
  latest pick wins, and a waiting write is applied before another input, a paint or a close.
- Idle preparation is one rule. It causes no visible hitch, runs only while the page is visible, the busy signal
  is empty, the user is idle and nothing is animating, backs off and drops a late step, is best effort, puts
  first use before speculative warm-up, and is the same on every machine. No GPU is a capability path, not
  a lower-spec tier.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: chat_motion_and_sound_drift
reasoning_tier: high
context_scope: chat_motion_sound
implementation_surfaces:
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/Settings_System.md
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-138 (owner answers, 2026-09-29)
- Plans/Decision_Log.md#DL-106
- Plans/Decision_Log.md#DL-107
- 'Plans/Decision_Log.md#DL-179 (owner note of 2026-10-09: Friendly and Glass distinct from Basic)'
- '/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/lane-reports-20261010/b-motion-REPORT.md,
  SHA-256 a1f292802f9ae740765c721f8f6196b44ad98ec3a41271f208528c7c03fed87a (the Usage port''s motion lane:
  the voices as built, with GPU evidence for the blur and scale rules)'
- Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-motion-pass--JUDGEMENT.md, SHA-256
  8a3291ea2558da05d40c5a051a958f378802ec9c36454b83dbaf5ffc7efe8cf9 (the global acceptance bar and the A4, A11,
  A13 and B9 findings; source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-13-pm7-coordinator-handoff--COORDINATOR-LOG-20261016.md,
  SHA-256 d52085df3ab4a82f323d1fd2ed0a846b8e858fcaf7ec746a2ff79cc9cf2a97ba (Jared's 2026-10-15 and 2026-10-16
  rulings as relayed by the coordinator; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-p1000-decision--JARED-DECISIONS.md,
  SHA-256 a1dedd6e70bfa51ec0b07c34a86bfa65583439b18ff4ace266c4fe9e2a0aa3a6 (Jared's decisions of 2026-10-16
  ~12:10Z; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/2026-10-16-p1000-decision--DRAFT.md, SHA-256
  9fe06d34054ed8510ac5df4e621b2371fc75e451f7620d09c3f43af6c01c5813 (the P1000 decision packet and its measurements;
  source lineage)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-topup/sources/1d44afa8ce--Concepts--onboarding--opus-5.5--src--js--11-motion-start.js,
  SHA-256 b042bcd35aab9cd50ba71fcfd8b2330015b12e07cadff7886c2647e4648e84bf (shell lane head 1d44afa8ce, landed
  unchanged on main b9a08db90f, the shared busy signal and on-time start; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/BRIEF.md, SHA-256 a6c5152164942a26cba5b0216a339578ee13c47a3ba39ffbeced793203c2dece
  (Jared, 2026-10-17; decision lineage)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/Concepts--onboarding--opus-5.5--tools--shell_motion.py,
  SHA-256 e245b03ddc951281dc20463422fc9dddf3c5299c7f3ca3421f41b9da399ab625 (main 6a3ee2fe90, the entrance wait
  and the NieR wipe held until release; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/Concepts--onboarding--opus-5.5--tools--motion_finish.js,
  SHA-256 a7a522fa4a1984cafddc45b315d23b4b7792fbab0a6e1a9069c448a6095476a4 (main 6a3ee2fe90, a held move finishes;
  source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-p1000-speed/IDLE-WARM-RULE.md, SHA-256 9a79df01751fbd98f1b4d597d40e520e662b5d584e97ef9094c27dd8aa55736d
  (Jared, 2026-10-17 10:27Z, no platform-specific acceptance; source lineage)
preserved_exact_tokens:
- DL-138
- Basic
- Friendly
- Glass
- Retro
- general.visual.reduce-animations
- general.interaction.sound-effects
- Usage
- NieR Mode
negative_constraints:
- Do not let a voice change logical ordering or non-exempt timing; F3-662’s L4 loader period is the named own-travel
  exception.
- Do not let a voice make a value overshoot.
- Do not draw an arriving surface through a blur.
- Do not scale the outgoing view above 1.
- Do not add a chat-local sound setting, volume or registry.
- Do not let a sound carry information alone.
- Do not offer a per-theme voice override as a product setting.
- Do not give a lower-spec machine a different page-hold or idle-preparation rule.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/Settings_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-106, ContractName:Plans/Decision_Log.md#DL-107, ContractName:Plans/UI_Command_Catalog.md#UCC-103, ContractName:Plans/Decision_Log.md#DL-179
