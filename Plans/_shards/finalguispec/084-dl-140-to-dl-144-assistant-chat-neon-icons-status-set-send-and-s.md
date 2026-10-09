# Shard 084: DL-140 to DL-144 — Assistant Chat Neon Icons, Status Set, Send And Stop, And NieR Mode (2026-10-07)

Source: `Plans/FinalGUISpec.md`

Source lines: L40224-L40629

Source SHA256: `c7439e9cdb7b3d199ed3a97467d41932978ab520568a310d530c0ea9ee272035`

---

## DL-140 to DL-144 — Assistant Chat Neon Icons, Status Set, Send And Stop, And NieR Mode (2026-10-07)

This addendum compiles the owner decisions DL-140 to DL-144 on the assistant chat's look, approved in the 5.6 Pro concept and folded into its shipped standalone on 2026-10-07. Behaviour stays with its owners: `Plans/assistant-chat-design.md` ACD-469 (transcript families and the accent budget), ACD-471 (busy send) and ACD-473 (the working activity), `Plans/FinalGUISpec.md#F3-563` (busy-send controls) and `Plans/Settings_System.md#SSYS-043` (NieR Mode settings, parts and scenes). The units below own the presentation only. The concept is source lineage only: its class names, keys, harness hooks, Demo Studio and every measured timing outside these units are not canon.

### F3-584 — Assistant Chat Neon Icon Grammar

```yaml
plan_unit_id: F3-584
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Every icon in the assistant chat (transcript, composer, thread history, activity bar and Activity Detail, working
  activity, menus, wand sheets and module cards) is drawn from one icon registry with one drawing per concept, reused
  everywhere; provider marks, agent puppets (F3-594), charts and illustrations are not icons (DL-140, DL-149). Anatomy: a lit tube with round
  caps and joins over a core halo stroke of the same ink, plus a soft radial glow on the host element for the glow's
  tail; the icon glow is never an element blur or filter, so it draws the same on the Skia CPU raster (F3-582). Roles:
  controls draw unlit in the host ink and ignite on hover or keyboard focus (the glyph lights to the text colour, the
  halo comes up on dark themes, and the glyph's act plays once); status icons are always lit in their tone and move by
  status like the activity bar; concept icons (kind marks, mode glyphs) are lit steady; a pressed toggle sits on a
  raised neutral tile with its glyph lit, never an accent tile. One control is the exception (DL-146): the composer's
  capabilities wand, and the wand in its menu head, wears its own fixed colours at rest and on hover (F3-588), never
  unlit grey and never a status tone, and turns to ink under NieR Mode. Acts: each glyph moves part by part in its own way,
  the activity bar included (the goal arrow strikes the target, the To-Do ticks check in sequence, the artifact lines
  write in, the wand's sparkles twinkle after its flick, Grill Me's kettle grill swings its lid open while smoke
  rises); acts animate transform and opacity, a draw-on is a clip reveal with both endpoints stated, looping motion
  returns along its path, and below 12 px no part moves. Tones are the activity bar's status tones: blocked danger,
  attention warning, working accent, changed accent-2, done positive, idle subtle and paused muted. Colour is reserved
  for status, apart from the capabilities wand, so menu, event-card and card-head icons sit on neutral tiles. Module
  cards and sheets draw their marks, agent puppets included (F3-594), lit and still, with one-shot acts only, inside the live card's two-loop budget. Per-family motion voices change
  easing only: Friendly overshoots, Glass glides, Retro steps, NieR steps. Reduced motion stops every act and loop
  while the lit ink, the halo and the silhouette still carry each state. On light themes the halo stays faint and
  never forms a smudge or a plate.
gui_related: true
gui_classification_reason: Defines the assistant chat's icon, status, Send and Stop, or NieR presentation.
split_recommended: false
depends_on: [DL-140, DL-146, DL-149, F3-425, F3-426, F3-582, ACD-469]
unblocks: []
acceptance_criteria:
  - "An icon census of the chat finds every icon drawn from the registry, one drawing per concept."
  - "Controls are unlit at rest and lit on hover and keyboard focus in every theme; status icons are lit and moving; concept icons are lit and still."
  - "No icon glow uses an element blur or filter."
  - "Under reduced motion no icon act or loop runs, and every state still reads."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_icon_family_drift
reasoning_tier: high
context_scope: chat_neon_icons
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-140"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/JARED-DECISIONS-20261001-07.md, SHA-256 1e43742aab47456f1c6c478106cb2ba8859291bb6a0030fcb70070b7beb30ebf"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only; folded on main 7468d1b676)"
preserved_exact_tokens:
  - "one drawing per concept"
  - "ignite on hover"
  - "part by part"
negative_constraints:
  - "Do not give a non-status glyph status colour outside a status host."
  - "Do not draw the icon glow with an element blur or filter."
  - "Do not give any glyph other than the capabilities wand its own colours."
compatibility_only_notes: []
stale_retired_dispositions:
  - "DL-140's rule that colour is reserved for status admits one exception from DL-146: the capabilities wand."
  - "Avatars are no longer named among the non-icons; agents are drawn as puppets (F3-594, DL-149)."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-140, ContractName:Plans/FinalGUISpec.md#F3-582, ContractName:Plans/assistant-chat-design.md#ACD-469

### F3-585 — Status Set And Status At A Glance

```yaml
plan_unit_id: F3-585
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  One shared set of 13 status marks draws every status in the assistant chat: thread history rows, the chat header,
  the activity bar previews, To-Dos, plan steps and module cards (DL-141). Working is a still ring with a bead
  travelling on the ring, one lap in 9 s. Reviewing is a page with a sweeping lens. Needs you is a speech bubble with
  a tall question mark that hops twice every 2.4 s while its glow swells. Waiting on a dependency is an hourglass that
  tips slowly. Idle (Ready) is a small unlit hollow ring. Complete is a bold check that draws once. Blocked is a lock
  whose shackle drops before a hard double blink. Failed is a warning triangle that stutters on arrival. Paused is two
  bars. Recovering is two opposed arrow arcs that ratchet counter-clockwise. Pending or queued is a dashed ring.
  Skipped is a slashed circle. Mixed is a half-lit ring. Tones follow F3-584. Every pair of silhouettes differs
  without colour, in grayscale and under reduced motion. In a list needs you outshines working, and idle and paused
  never read more lit than any live status on the same row state (rest, hover, selected). A thread history row shows
  its mark only while the drawer is wide; the narrow drawer hides it. The chat header shows the thread's mark beside
  its status word, and the word takes the mark's tone: Ready and Paused muted, Working and Reviewing accent, Waiting
  and Recovering warning, Complete positive, Blocked and Failed danger. In module cards the marks are lit and still
  (F3-584).
gui_related: true
gui_classification_reason: Defines the assistant chat's icon, status, Send and Stop, or NieR presentation.
split_recommended: false
depends_on: [DL-141, F3-584]
unblocks: []
acceptance_criteria:
  - "The 13 marks render with distinct silhouettes in every theme, in grayscale and under reduced motion."
  - "In the wide thread list needs you moves more than working, and idle and paused never read more lit than a live status."
  - "Thread history rows show no status mark in the narrow drawer."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_status_legibility_drift
reasoning_tier: high
context_scope: chat_neon_icons
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-141"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/JARED-DECISIONS-20261001-07.md, SHA-256 1e43742aab47456f1c6c478106cb2ba8859291bb6a0030fcb70070b7beb30ebf"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only; folded on main 7468d1b676)"
preserved_exact_tokens:
  - "13 status marks"
  - "needs you outshines working"
negative_constraints:
  - "Do not move the working bead off its ring."
  - "Do not show a thread-row status mark in the narrow history drawer."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-141, ContractName:Plans/FinalGUISpec.md#F3-584

### F3-586 — Working Activity Dark Disc

```yaml
plan_unit_id: F3-586
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  In the working activity (ACD-473), the live subject's node and the centre disc are a dark disc, the canvas colour on
  dark themes and a dark puck on light themes, rimmed in the current phase's hue, with the subject's glyph lit in that
  hue (DL-142). The live glyph plays its act while the run runs, and the node keeps its pop and pulse ring. Finished
  subjects are lit green (positive ink with a faint done halo on a neutral tile) and never act; pending subjects sit
  at rest; only the live node and the current strip or rail disc ever act. A failed subject's flag is the warning
  triangle, and a subject waiting for the reader shows the needs-you mark as its flag and in the centre disc (F3-585).
  The compact strip and the Step Rail follow the same rule: the current disc is a dark disc with its glyph lit, and
  finished discs are lit green. Under NieR Mode the disc is ink with a paper glyph and its pulse steps.
gui_related: true
gui_classification_reason: Defines the assistant chat's icon, status, Send and Stop, or NieR presentation.
split_recommended: false
depends_on: [DL-142, ACD-473, F3-562, F3-585]
unblocks: []
acceptance_criteria:
  - "The live node and the centre disc render as a dark disc with the glyph lit in the phase hue in every theme."
  - "Finished subjects are lit green and run no act; only the live node and the current disc act."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_working_activity_presentation_drift
reasoning_tier: high
context_scope: chat_neon_icons
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-142"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/JARED-DECISIONS-20261001-07.md, SHA-256 1e43742aab47456f1c6c478106cb2ba8859291bb6a0030fcb70070b7beb30ebf"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only; folded on main 7468d1b676)"
preserved_exact_tokens:
  - "dark disc"
negative_constraints:
  - "Do not draw the live node as a filled accent disc with a dark glyph."
  - "Do not give a finished or pending node an act."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-142, ContractName:Plans/assistant-chat-design.md#ACD-473, ContractName:Plans/FinalGUISpec.md#F3-562

### F3-587 — Composer Send And Stop Solid Living Control

```yaml
plan_unit_id: F3-587
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The composer's Send and Stop control is the solid-living control: one 24 px chip with an 8 px radius at the field's
  bottom-right, kept in place through every state (DL-143); when it shows Stop and what the queue does stay with
  F3-563 and ACD-471. The chip stays solid: accent for Send and Queue, danger for Stop. Idle (empty composer): the
  accent chip with its glyph at rest. Ready (text typed): the glyph ignites with a short flicker and the plane hops
  once. Hover lifts the chip one pixel; press squeezes it. Sending into a run: the plane lifts off along its heading,
  a fresh plane slides in and morphs point by point into a rounded square on the accent, and only then does the danger
  colour flood out from under the square, so a plane never sits on the danger colour; Retro steps from accent to
  danger in one step as the square lands. Stop shows while a run is live and the composer is empty: a light square
  that breathes about one pixel, at the 2.2 s working cadence while words arrive and at 3.2 s while the model thinks
  or a tool runs, over a calm danger glow, so a long run reads as running and not as an alarm; the breathing animates
  transform and opacity only. Clicking Stop clunks the square, drains the danger colour first and then opens the
  square back into the plane; a run that ends any other way morphs back without the clunk. Stop never clears the
  follow-up queue and never sends the next queued message. The second click of a double-click is ignored by its click
  count, never by a time window, so a double-click on Send cannot stop the run it started. Busy with text, Queue
  stacks a second plane behind the front one with a badge counting the messages already waiting (1 or 2); with two
  waiting the chip is Full, neutral with muted planes. A click with nothing to send, or on a full chip, sputters (a
  300 ms flicker that does not light, the full chip also showing the queue-full notice); a refused send shakes once
  with a danger flash. Opening a busy thread shows Stop without the send motion. Reduced motion shows end states only,
  and a refused send then shows a static danger ring for 1.4 s. Under NieR Mode the chip is an ink block with a paper
  plane and Stop an ink block with a paper square that turns NieR's error colour on hover, after a pointer that just
  sent has left and come back; corners are square, motion steps, and nothing glows.
gui_related: true
gui_classification_reason: Defines the assistant chat's icon, status, Send and Stop, or NieR presentation.
split_recommended: false
depends_on: [DL-143, F3-563, ACD-471, F3-584]
unblocks: []
acceptance_criteria:
  - "Every state renders as stated in every theme, with no frame showing a plane on the danger colour."
  - "A double-click on Send leaves the run going; a Stop click 200 ms after a Queue click stops the run."
  - "Stop leaves the follow-up queue as it was."
  - "The Stop breathing runs on transform and opacity only."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_send_stop_presentation_drift
reasoning_tier: high
context_scope: chat_send_stop
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-143"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/SOLID-LIVING-NOTES.md, SHA-256 15bcacd90861b391404fbe9415f71fe79df7670c12a962c9cb59035875b9eb87"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/specs/SENDSTOP-BUILD.md, SHA-256 50c4cf5663543942eb6b11bab45c0d9b1bacfddeb4460979a748a3ad0b50890b"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only; folded on main 7468d1b676)"
preserved_exact_tokens:
  - "solid-living"
  - "sputter"
negative_constraints:
  - "Do not guard the double-click with a time window."
  - "Do not clear the follow-up queue on Stop."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-143, ContractName:Plans/FinalGUISpec.md#F3-563, ContractName:Plans/assistant-chat-design.md#ACD-471

### F3-588 — Wand And Fast Mode Bolt Glyphs

```yaml
plan_unit_id: F3-588
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Three glyphs carry required drawings (DL-140, DL-146). The wand is a thin rod with a star tip and loose sparkles,
  reading as a wand and never as a pencil beside the edit pen at 14 px. On the composer's capabilities control and in
  its menu head it is drawn in colour: a silver handle, a gold star and three sparkles in blue, pink and green, each
  tube glowing in its own colour on dark themes and taking a deeper ink of at least 3:1 on light themes; hovering
  never greys it. After its hover or focus flick the sparkles twinkle in turn, each flaring into a small eight-point
  glint, all within about a second. The wand drawn as a working-activity step keeps its status ink. The Fast-mode bolt
  shows beside the model on the composer's model chip and in a Fast reply's meta row while that row's chrome shows. It
  is amber, the attention tone, and strikes like lightning, only ever brighter than at rest: it cracks top-down as a
  bright leader, white-hot on dark themes and the bolt's amber on light ones, that runs down inside the bolt from its
  top spike to its point in under 200 ms; then the whole bolt, its halo and its backlight flash, re-flash and settle
  into an afterglow, about every 5 s while Fast mode is on, and hovering it strikes it once more. Its outline never
  dims or goes dark, and the bolt never shakes or moves as a whole. Grill Me's glyph is a kettle grill (a domed lid
  with a handle, the rim, a round bowl with grill marks, two legs), drawn wherever Grill Me appears as a control or a
  label; its act swings the lid open while flames flicker and smoke rises, then drops it shut. Under reduced motion
  all three are lit and still. Under NieR Mode they draw no glow and no colour: the wand stays ink, its handle a
  lighter ink and its star filled, and its sparkles twinkle in held steps; the bolt's leader steps down band by band
  in ink and the bolt then flashes solid ink; and the grill's act steps.
gui_related: true
gui_classification_reason: Defines the assistant chat's icon, status, Send and Stop, or NieR presentation.
split_recommended: false
depends_on: [DL-140, DL-146, F3-584]
unblocks: []
acceptance_criteria:
  - "The wand reads as a wand, distinct from the edit pen, at 14 px."
  - "The Fast-mode bolt cracks top-down, flashes and settles, and never translates or shakes."
  - "The capabilities wand shows its five colours at rest and on hover outside NieR Mode, and is ink under NieR Mode."
  - "No frame of the bolt's strike is darker than the bolt at rest."
  - "Grill Me's kettle grill plays its lid, flame and smoke act on hover or focus wherever it is drawn, and is still under reduced motion."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_icon_family_drift
reasoning_tier: high
context_scope: chat_neon_icons
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-140"
  - "Plans/Decision_Log.md#DL-146"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/JARED-DECISIONS-20261001-07.md, SHA-256 1e43742aab47456f1c6c478106cb2ba8859291bb6a0030fcb70070b7beb30ebf"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/JARED_REQUEST.md, SHA-256 acf112cbd082a46daddb57044df694fb780ebbf938bc2bd7cf20dd6a96ba02fe"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/chat56-tweaks-20261007/ANSWERS-20261007.txt, SHA-256 e481b9d35a5e4bced327100b6f8e46d96c94ba21d43a353ec6b3a75d468dd1fe"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only; folded on main 7468d1b676)"
preserved_exact_tokens:
  - "star tip"
  - "cracks top-down"
  - "silver handle"
  - "kettle grill"
negative_constraints:
  - "Do not animate the bolt by shaking or moving it as a whole."
  - "Do not dim or darken the bolt during its strike."
compatibility_only_notes: []
stale_retired_dispositions:
  - "The 2026-10-07 NieR clause that the bolt cracks in ink steps with no flash is replaced by DL-146: the ink leader steps down and the bolt flashes solid ink."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-140, ContractName:Plans/Decision_Log.md#DL-146, ContractName:Plans/FinalGUISpec.md#F3-584

### F3-589 — Assistant Chat Under NieR Mode And Scene Changes

```yaml
plan_unit_id: F3-589
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  NieR Mode (SSYS-043, F3-441) covers every assistant chat surface (DL-144). With NieR Mode on, the chat paints Basic
  under NieR's ink-and-parchment tables and fonts, and its icons draw no glow: ink tubes with square caps and stepped
  acts, the status marks still distinct (needs you an inverted ink block with a paper question mark and, under the
  Target brackets part, ink corner brackets; working the diamond loader under the Diamond loaders part; idle and
  pending squares under the Square hairlines part). The capabilities wand stays ink, with a lighter handle and a filled
  star, and its sparkles twinkle in held steps (F3-588, DL-146); agents are PMConcept7's ink NieR puppets with the
  rigid visor band (F3-594); a setup sheet's step number is an inverted ink square (F3-592); and the Ask Card's chosen
  answer is the menu cursor, with diamond spine marks (F3-596). The installed parts land in the chat as follows: Menu cursor on
  menus, pickers, thread rows and wand rows; Slice open on menus, dialogs and sheets; Text decode on the thread title
  at a thread switch and on the head of an arriving assistant turn; Page wipe on a thread switch; Alert glitch, Scan
  sweep and Drifting particles on alert toasts, refusals and failed steps; Pod companion above the composer, turning
  toward toasts; Pod 042 in Chat as a persona that answers in Pod's voice; Quest banners on plan approved, build
  complete and goal complete; Unit readouts and Block progress in the status bar and the context meter; Intel tooltips
  for hover cards; Ink empty states; Save signal on saves. Each part stays individually switchable and silent while
  NieR Mode is off. In the chat the transcript stage counts as the app's ground, so the selected scene shows behind
  the conversation as well as around the panels. A change from one scene to another cross-fades by opacity over 520
  ms, with neither scene ever drawn above its resting strength; reduced motion, and the Still and Colors only presets,
  swap instantly. This cross-fade applies wherever a scene changes, PMConcept7 included. The chat adds no moving
  touches inside the scenes. NieR Mode stays the Settings switch, not a ninth theme; the concept's NieR Light and NieR
  Dark Demo Studio themes are lab only (ACD-474).
gui_related: true
gui_classification_reason: Defines the assistant chat's icon, status, Send and Stop, or NieR presentation.
split_recommended: false
depends_on: [DL-144, DL-146, DL-149, SSYS-043, F3-441, F3-584, F3-585, ACD-474]
unblocks: []
acceptance_criteria:
  - "Every chat surface renders under NieR Mode with no glow and with its parts placed as listed."
  - "A scene change cross-fades over 520 ms with neither scene above its resting strength, and swaps instantly under reduced motion and the Still and Colors only presets."
  - "With NieR Mode off no NieR part draws, moves or plays in the chat."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_nier_mode_drift
reasoning_tier: high
context_scope: chat_nier_mode
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-144"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/JARED-DECISIONS-20261001-07.md, SHA-256 1e43742aab47456f1c6c478106cb2ba8859291bb6a0030fcb70070b7beb30ebf"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/neon-icons-20261001-handoff/specs/NIER.md, SHA-256 ea5f2a23dc4b48b50bdd90da19492aecbfa9b779a853d1d55942a1571fa059b5"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only; folded on main 7468d1b676)"
preserved_exact_tokens:
  - "NieR Mode"
  - "cross-fades"
negative_constraints:
  - "Do not make NieR Mode a ninth selectable theme."
  - "Do not add moving touches inside the scenes in the chat."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-144, ContractName:Plans/Settings_System.md#SSYS-043, ContractName:Plans/FinalGUISpec.md#F3-441
