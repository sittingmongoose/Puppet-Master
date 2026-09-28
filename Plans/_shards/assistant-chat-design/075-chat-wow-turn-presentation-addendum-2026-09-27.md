# Shard 075: Chat WOW Turn Presentation Addendum (2026-09-27)

Source: `Plans/assistant-chat-design.md`

Source lines: L25821-L26314

Source SHA256: `c0598b7cd330cb81288c38ca4b6a84c5c384b981cceeb49af40429a0507db3ff`

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
  action. People (collaboration runs, live agents, delegation) is a roster led by an avatar stack.
  Time (scheduled messages) is a ticket with a time block. Ledger (receipts, context and thread
  operations, route changes, attachment events, informational notices) is one muted line on the
  spine. A user turn is a right-aligned bubble on a raised neutral surface with no accent. The
  accent budget: the accent colours only live work, needs-you items, the one primary action of a
  card, and Send and Stop; family hues are quiet and appear only on eyebrow tiles and spine ticks.
  Message types, their persistence and the ACD-073 boundary are unchanged.
gui_related: true
gui_classification_reason: "Defines how every transcript item renders in the default chat presentation."
split_recommended: false
depends_on: [DL-104, ACD-072, ACD-073]
unblocks: [F3-562, DR-043]
acceptance_criteria:
  - "Every persisted message type and runtime card kind maps to exactly one of the seven families through one owner map."
  - "The spine, ticks and live light add no scroll width or height at any chat pane width."
  - "In Basic Dark no transcript element uses the accent outside live work, needs-you items, a card's one primary action, and Send and Stop."
  - "Assistant prose renders without a container; user turns render as right-aligned neutral bubbles."
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
  - "Plans/Decision_Log.md#DL-104"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
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
  - "Do not spend the accent on decoration, event icons, the user bubble, model chips or chart bars."
  - "Do not let the spine, ticks or live light extend scrollable area."
  - "Do not infer a record's message_type from its family."
stale_retired_dispositions:
  - "ACD-072 rendering column values left-aligned bubble for user and right-aligned bubble for assistant are superseded for the default presentation by DL-104: user turns are right-aligned neutral bubbles and assistant prose has no container."
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
  stream (ACD-221 is unchanged). When text arrives the label condenses toward the turn mark while
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
gui_related: true
gui_classification_reason: "Defines the visible life cycle of a streaming assistant reply."
split_recommended: false
depends_on: [DL-106, ACD-238, ACD-240, ACD-221, ACD-229, EP-128]
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
gui_related: true
gui_classification_reason: "Keeps concept lab controls out of product surfaces."
split_recommended: false
depends_on: [DL-106]
unblocks: []
acceptance_criteria:
  - "No product catalog, settings inventory, wiring matrix or persisted key names a lab tool listed here."
  - "The working card offers no play, pause, step, complete, reset or history controls in product."
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
preserved_exact_tokens:
  - "Demo Studio"
  - "Motion voice"
  - "Live turns"
negative_constraints:
  - "Do not register a lab tool as a command, setting, wiring row, persisted key or test gate."
  - "Do not carry concept family or variant indices into product settings."
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
  Chat motion has one voice per theme family (DL-106): Basic, Friendly, Glass and Retro, with dark
  and light sharing a voice. Every beat (sending, the thinking placeholder, word arrival, the
  working card's birth, the narration tuck, the fold, family entrances, thread switch) is written
  once; a voice changes only its path, easing and texture, never its timing or order, and light
  themes replace glows with soft shadows. Retro quantizes its steps inside the same window. Reduced
  motion, from the operating system or general.visual.reduce-animations, lands every beat at its end
  state. The chat's sound cues (DL-107) are send, first word, work started, step finished, failure,
  needs you, answer arriving, turn complete and stop. They are events of the Notifications & Sounds
  owner, played through its sound mapping and the global general.interaction.sound-effects switch
  (on by default), with one kit per theme family; the chat header's speaker button toggles that same
  key. Cues are subtle, at most one per 120ms, step ticks at most one per 250ms and silent inside
  bursts; audio starts only after a user gesture; and each cue accompanies a visible change, never
  carrying information alone. Reduced motion does not mute sound.
gui_related: true
gui_classification_reason: "Defines per-theme motion and the chat's sound cues."
split_recommended: false
depends_on: [DL-106, DL-107, UCC-103]
unblocks: [F3-564, DR-043]
acceptance_criteria:
  - "The same beat has the same timing and order in all four families."
  - "Reduced motion from either source lands end states."
  - "Chat cues route through the Notifications & Sounds owner; no chat-local sound setting or volume exists."
  - "No more than one cue plays per 120ms and no step tick within 250ms of another; nothing plays before a user gesture."
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
  - "Plans/Decision_Log.md#DL-106"
  - "Plans/Decision_Log.md#DL-107"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "Basic"
  - "Friendly"
  - "Glass"
  - "Retro"
  - "general.visual.reduce-animations"
  - "general.interaction.sound-effects"
negative_constraints:
  - "Do not let a voice change timing or order."
  - "Do not add a chat-local sound setting, volume or registry."
  - "Do not let a sound carry information alone."
  - "Do not offer a per-theme voice override as a product setting."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Settings_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-106, ContractName:Plans/Decision_Log.md#DL-107, ContractName:Plans/UI_Command_Catalog.md#UCC-103
