# Shard 081: Chat WOW Concept Promotion Addendum - 2026-09-27

Source: `Plans/FinalGUISpec.md`

Source lines: L38523-L38744

Source SHA256: `92fd19d0d84c663ee8e8b8605b1180c8504c851139260d2f785b26f698afed7d`

---

## Chat WOW Concept Promotion Addendum - 2026-09-27

This addendum promotes the rebuilt 5.6 Pro chat transcript into the GUI contract under Jared's decisions DL-104 through DL-108. `Plans/assistant-chat-design.md` ACD-469 through ACD-475 own the behaviour; the units below place it in the GUI and name what it supersedes. The concept is source lineage only.

### F3-562 - Chat Transcript Turn Stage Presentation And Working Activity Promotion

```yaml
plan_unit_id: F3-562
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The assistant chat transcript renders in the Turn Stage presentation owned by ACD-469 (DL-104): a
  turn mark and a paint-only spine per assistant turn, seven item families by message type with
  distinct silhouettes, prose without a container, a neutral right-aligned user bubble (under Retro
  both drawn as F3-597 states, DL-151), and the accent budget. The working activity keeps Orbit as the default and Step Rail as the simple style,
  with the behaviour owned by ACD-473 (DL-105): concurrent, failed and waiting subjects, clustering
  to at most 30 nodes, narration that tucks into the card's caption, and the fold into the strip
  when the final answer starts. For the transcript and the working activity this supersedes the
  2026-09-03 redesign section's binding-by-reference list where it conflicts and Additive Correction
  v4's statements that Orbit and Step Rail stay exactly as specified and that nothing authorises a
  broad restyle. That binding-by-reference never includes the concept's lab tools (ACD-474). The
  narration tuck is a projection of the turn's own progress summary into its card and does not
  violate the rule that cards do not float out of narrative position. The eight themes keep their
  tokens; family hues and the accent budget are theme-token roles defined for all eight.
gui_related: true
gui_classification_reason: "Promotes the rebuilt chat transcript and working activity presentation."
split_recommended: false
depends_on: [DL-104, DL-105, ACD-469, ACD-473, ACD-474]
unblocks: []
acceptance_criteria:
  - "The chat transcript renders families, turn marks and the spine per ACD-469 in all eight themes."
  - "The working activity behaves per ACD-473 in both styles."
  - "No lab tool listed in ACD-474 appears in a product surface."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_transcript_presentation_drift
reasoning_tier: high
context_scope: chat_transcript_presentation
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-104"
  - "Plans/Decision_Log.md#DL-105"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "Turn Stage"
  - "Orbit"
  - "Step Rail"
negative_constraints:
  - "Do not treat the concept's lab tools as bound by reference."
  - "Do not restate the family map or the accent rule here; ACD-469 owns them."
stale_retired_dispositions:
  - "Additive Correction v4 wording that Orbit and Step Rail stay exactly as specified and that nothing authorises a broad restyle is superseded for the chat transcript and working activity by DL-104 and DL-105."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-469, ContractName:Plans/assistant-chat-design.md#ACD-473, ContractName:Plans/assistant-chat-design.md#ACD-474

### F3-563 - Composer Busy Send Steer Queue Switch Default And Send Now

```yaml
plan_unit_id: F3-563
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The composer's Steer/Queue switch stays, and its default follows general.interaction.queue-
  behavior, which is Queue (DL-108). While a reply streams or work runs, Send becomes Stop when the
  composer is empty; a send while busy is queued (Queue) or goes to the running turn (Steer); the
  follow-up queue shows at most two entries, each with Edit, Remove and Send now; Send now steers
  without stopping the answer; and after a Stop or an error queued entries stay until the user acts.
  ACD-471 owns the behaviour; UCC-168 owns the command identities.
gui_related: true
gui_classification_reason: "Defines the composer's busy-send controls."
split_recommended: false
depends_on: [DL-108, ACD-471, UCC-168]
unblocks: []
acceptance_criteria:
  - "The switch defaults to Queue and still offers Steer."
  - "Each queued entry offers Edit, Remove and Send now."
  - "Send now leaves the partial answer unmarked."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: busy_send_semantics_drift
reasoning_tier: high
context_scope: chat_queue
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-108"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "Steer"
  - "Queue"
  - "Send now"
negative_constraints:
  - "Do not remove the Steer/Queue switch."
  - "Do not make Send now a Stop."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-471, ContractName:Plans/UI_Command_Catalog.md#UCC-168

### F3-564 - Chat Sound Cues In Notifications And Sounds With A Header Mute

```yaml
plan_unit_id: F3-564
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The chat's sound cues (ACD-475: send, first word, work started, step finished, failure, needs you,
  answer arriving, turn complete, stop) form a chat cue category in the Notifications & Sounds
  routing matrix (F3-405), mapped through general.interaction.sound-mapping and switched by
  general.interaction.sound-effects, which is on by default (DL-107). The chat header carries a
  speaker button with a hover card that toggles general.interaction.sound-effects through
  cmd.settings.transaction.apply; it is a shared chrome control like the onboarding and Tour sound
  controls, not a per-view setting. A kit per theme family provides the default cues; built-in cues
  carry the same source, licence and hash metadata as other built-in sounds. Sound is optional and
  never the only signal (section 10.13).
gui_related: true
gui_classification_reason: "Places chat sound cues and the header mute in the sound settings model."
split_recommended: false
depends_on: [DL-107, ACD-475, UCC-103]
unblocks: []
acceptance_criteria:
  - "Chat cues appear as one category in the Notifications & Sounds mapping."
  - "The header mute and the Settings switch always show the same state."
  - "Built-in chat cues carry source, licence and hash metadata."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: sound_default_drift
reasoning_tier: high
context_scope: chat_sound
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
  - Plans/settings_inventory.json
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-107"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "general.interaction.sound-effects"
  - "general.interaction.sound-mapping"
  - "cmd.settings.transaction.apply"
negative_constraints:
  - "Do not add a chat-only sound setting."
  - "Do not let a cue be the only signal."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-475, ContractName:Plans/Settings_System.md#SSYS-039

### F3-565 - Narrow Chat Pane Transcript Resilience

```yaml
plan_unit_id: F3-565
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  At every chat pane width down to the narrowest the app produces (about 234px, a 900px window with
  a side panel open) the transcript never overflows sideways: a needs-you item's action row wraps to
  its own line rather than pushing past the edge, a ledger line's title ellipsizes and shows in full
  on hover or focus, text inside cards breaks long unbroken tokens, and the turn spine is paint-only
  (ACD-469). Send and Stop remain reachable at every width (section 16).
gui_related: true
gui_classification_reason: "Keeps the transcript intact in narrow chat panes."
split_recommended: false
depends_on: [ACD-469]
unblocks: []
acceptance_criteria:
  - "No demo thread overflows the transcript sideways at a 234px pane or at full width."
  - "Needs-you actions wrap; ledger titles ellipsize; long tokens break."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: narrow_pane_overflow
reasoning_tier: high
context_scope: chat_transcript_presentation
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "234px"
negative_constraints:
  - "Do not let any transcript item widen the transcript's scrollable area."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-469
