# Shard 076: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/assistant-chat-design.md`

Source lines: L26288-L26636

Source SHA256: `9c07fb610dd8cf08beb9335766a862a77e258c5642423573000eeb4edc37f270`

---

## Wand Modules Redesign Addendum (2026-09-27)

This addendum carries the chat-behaviour parts of the redesigned Assistant wand popups and their in-chat presence (Crew, Chat Room, BrainStorm, Review, Crew Auto, Back Seat Driver, Schedule Message, Build At, the Scheduled and Automations manager, Memory, Teach, Revert Last Agent Edit, ELI5, New chat defaults and chat titles) into this owner. The source is the frozen design specification `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md` (SHA-256 `dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de`) under Jared's instruction of 2026-09-27 and his amendments J-1 and J-2 (DL-109); the 5.6 Pro concept is source lineage only. The family each record takes in the transcript is ACD-469's map and is never restated here, and the assistant-turn stream vocabulary is EP-128's. The run cards, notes, schedule cards and memory traces themselves belong to their owners (Collaborative_Workflows, Back_Seat_Driver, Scheduling_and_Quota_Resume, assistant-memory-subsystem); the GUI contract is FinalGUISpec F3-566 through F3-577. Where a unit below settles only part of a question it says which part; the rest waits for Jared's answer and is not implied.

### ACD-476 - Composer Dock And Per-Owner Attention Items

```yaml
plan_unit_id: ACD-476
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The dock is a composer-adjacent surface of at most three one-line items that carries only what
  needs to be seen while its own transcript item is off-screen. FinalGUISpec F3-567 places it in the
  composer stack directly after the provider quota-wait strip; it reserves its own height there and
  never floats over the transcript. Items come in this order: needs you (an approval, a question,
  a failure, a tie or a held scheduled message that waits on the user), your move (a turn that is
  the user's but is not a problem, such as a finished round), live runs (newest first), and the next
  coming-up scheduled item. A needs-you item also shows while its transcript item is only partly
  visible. A fourth and later item collapses into one overflow line that opens Activity. Each item
  is an AttentionItem projection {source_kind, source_id, tone, sentence, primary_action_route,
  since} published by the owner of the source record, with tone needs | yourmove | live | comingup;
  the chat shell only merges and orders them. The dock owns no run, schedule or advice state and
  writes no words of its own: an item's sentence is the owner's current sentence. An item appears
  once its transcript item has been out of view for 400 ms and leaves as soon as it is visible again;
  a needs-you item skips the wait, and a visibility change inside the quiet window is re-evaluated
  when the window ends, never dropped. An item's action follows its primary_action_route: it reveals
  the transcript item (scrolls to it and marks it once), or, for an owner-admitted question, opens
  the existing questionnaire (Answer now). A permission decision is never taken from the dock; it is
  taken only in its transcript item or the approval owner's host. The families of the records the
  dock mirrors are ACD-469's map. This unit does not change the stream footer pill (ACD-435,
  ACD-436).
gui_related: true
gui_classification_reason: "Defines the dock above the composer and the attention items it shows."
split_recommended: false
depends_on: [ACD-469, F3-532]
unblocks: [F3-567]
acceptance_criteria:
  - "The dock shows at most three item lines plus one overflow line, needs-you first."
  - "An item shows only while its transcript item is off-screen (a needs-you item also while partly visible) and leaves when the item becomes visible."
  - "No dock action approves or declines a permission request."
  - "Every dock sentence is the producing owner's sentence; the dock holds no copy of owner state."
  - "The dock reserves its own space and never covers transcript content."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: attention_surface_duplicates_owner_state
reasoning_tier: high
context_scope: chat_composer_stack
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/Collaborative_Workflows.md
  - Plans/Scheduling_and_Quota_Resume.md
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 4.3 C14-C15, 4.5 G-10, 7.4, 7.8"
  - "IMPACT-REGISTER B-ACD-10, B-ACD-08 (reference only)"
preserved_exact_tokens:
  - "dock"
  - "AttentionItem"
  - "primary_action_route"
  - "needs | yourmove | live | comingup"
  - "Answer now"
  - "ACD-469"
negative_constraints:
  - "Do not take a permission decision from the dock."
  - "Do not let the dock float over the transcript or hide the composer."
  - "Do not keep run, schedule or advice state in the dock or write dock-only sentences."
  - "Do not restate the transcript family map; ACD-469 owns it."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-469, ContractName:Plans/FinalGUISpec.md#F3-567, ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Scheduling_and_Quota_Resume.md

### ACD-477 - Teach Capture Scope Safety Screen And Supersession

```yaml
plan_unit_id: ACD-477
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Teach capture and confirm (section 6). The wand's Teach…, /teach, natural-language intent and
  Save as a rule… in a message's More row each dispatch cmd.chat.teach.capture with mode new,
  prefilled with the proposed rule text and a reference to its source message; the user's message
  stays in the chat as sent. Editing a taught rule dispatches cmd.chat.teach.capture with mode
  correct. Capture only opens the capture step; the save action is cmd.chat.teach.confirm, and
  Cancel, close and Escape are cmd.chat.teach.cancel, which persists nothing. Scope is exactly one
  of thread, project and user, shown nested from narrowest to widest as This thread, This project
  and Every project. The user scope needs public_safe: the user's explicit statement that the rule
  holds no private names, links or code; without it confirm refuses user scope and says why. In
  correct mode the scope may stay or narrow but never widen; a wider rule is a new rule. Before
  confirm the capture step screens the text for passwords, keys and tokens; when one is found it
  says so in words and confirm stays refused until it is removed. When a similar taught rule is in
  reach, the capture step shows the old and the new wording side by side and confirm waits for the
  user's choice: replace the old rule, which records supersedes_memory_id and keeps the old version
  in history, or keep both. The confirm request is TeachConfirmRequest {scope, public_safe,
  conflict_resolution: replace:<memory_id> | keep_both, supersedes_memory_id?}. Each confirmed change
  leaves one receipt line in the chat (saved, or updated to a new version), and consecutive saves
  coalesce into one line. This unit does not specify the capture step's form (a sheet or an inline
  card), per-rule lock or revoke controls, or the wording of the reply disclosure; section 6's
  user-locked sentence is unchanged.
gui_related: true
gui_classification_reason: "Defines what the user sets and sees when teaching Puppet Master a rule."
split_recommended: false
depends_on: [ACD-469]
unblocks: [F3-574]
acceptance_criteria:
  - "Every entry point dispatches cmd.chat.teach.capture; nothing persists before cmd.chat.teach.confirm."
  - "Confirm refuses user scope without public_safe and refuses text that looks like a secret, with the reason in words."
  - "Correct mode never widens a rule's scope."
  - "A similar rule blocks confirm until replace or keep both is chosen; replace records supersedes_memory_id."
  - "TeachConfirmRequest carries scope, public_safe, conflict_resolution and supersedes_memory_id and no other new field."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: taught_memory_scope_or_secret_leak
reasoning_tier: high
context_scope: teach_capture
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: owner_behavior_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 8.11, 8.15"
  - "IMPACT-REGISTER B-ACD-02 (NOW part)"
preserved_exact_tokens:
  - "cmd.chat.teach.capture"
  - "cmd.chat.teach.confirm"
  - "public_safe"
  - "TeachConfirmRequest"
  - "supersedes_memory_id"
  - "keep_both"
  - "Save as a rule…"
negative_constraints:
  - "Do not persist anything on capture."
  - "Do not let an edit widen a rule's scope."
  - "Do not save text that looks like a password, key or token."
  - "Do not overwrite a similar rule without the user's replace choice."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md#F3-574

### ACD-478 - Revert Files Row Confirm Sheet And Outcome Display

```yaml
plan_unit_id: ACD-478
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Under the assistant reply whose turn changed files, one files row states the change ("Changed 3
  files +5 −3") and is visible at rest. It offers Revert only on the latest eligible turn; an older
  turn prints the reason in its place. The files row, the wand row, Changes and the message overflow
  open one compact confirm sheet over the resolved turn's change manifest; opening it dispatches
  nothing. The sheet lists every file with a plain verb (put back the old version, delete the file
  it made, bring back the file it deleted) and its counts, and marks a file the user changed since
  the edit; looking at what blocks it only opens the Revert document at that file and never
  re-runs the revert. The sheet's primary dispatches cmd.chat.revert with the identical immutable
  target and the expected_turn_manifest_sha256 of the manifest it shows, which settles Case L for
  these entry points. An ineligible target shows its reason and no primary. Revert is all or none:
  the display shows each closed outcome (restored_clean, restore_skipped, restore_refused,
  restore_failed, restore_recovery_required) as one plain sentence while the record keeps the
  canonical value; a refusal, a failure and a conflict each say that nothing was touched, no
  wording reads as partial success, and there is no kept or conflict-dismissal outcome: leaving the
  files as they are only dismisses the line and writes no record. The files row's rewind motion
  and its "Reverted" state start only after a durable restored_clean result, never on the click or
  a pending result. The Revert document (a timeline and one diff per file with the assistant's
  change, what revert put back, and the file now) opens only when asked and is view state.
gui_related: true
gui_classification_reason: "Defines the Revert entry under a reply, its confirm sheet and its outcome display."
split_recommended: false
depends_on: [ACD-469]
unblocks: [F3-570, F3-574]
acceptance_criteria:
  - "The files row is visible at rest and offers Revert only on the latest eligible turn."
  - "Opening the confirm sheet dispatches no command; its primary dispatches cmd.chat.revert with expected_turn_manifest_sha256 of the shown manifest."
  - "No displayed outcome reads as partial success and no outcome outside the closed five is recorded."
  - "The rewind motion starts only on a durable restored_clean."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: partial_revert_or_premature_success
reasoning_tier: high
context_scope: chat_revert
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: owner_behavior_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 4.3 C24, 8.12, 8.15"
  - "IMPACT-REGISTER B-ACD-03"
preserved_exact_tokens:
  - "cmd.chat.revert"
  - "expected_turn_manifest_sha256"
  - "restored_clean"
  - "restore_recovery_required"
  - "Case L"
  - "files row"
negative_constraints:
  - "Do not dispatch cmd.chat.revert on opening the confirm sheet or on looking at a conflict."
  - "Do not show a per-file or partial success."
  - "Do not record a kept or conflict-dismissal outcome."
  - "Do not play the rewind before a durable restored_clean."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md#F3-574, ContractName:Plans/assistant-chat-design.md#ACD-469

### ACD-479 - Thread Title Attempts Title Lock And Header Title States

```yaml
plan_unit_id: ACD-479
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Each automatic or explicit naming of a thread is one ThreadTitleAttempt {thread_id, attempt_id,
  requested_route, effective_route?, outcome, title?, at} with outcome pending | named | policy_off
  | route_unavailable | awaiting_first_message | user_locked. thread.title_locked is set by a manual
  rename and cleared only by cmd.chat.thread.regenerate_title (ACD-462); while it is set, automatic
  naming records user_locked and changes nothing. An unavailable title model records
  route_unavailable and is never silently replaced by another model. The chat header's title shows
  the attempt's state without pills: New chat with a naming shimmer while pending, the title once
  named, a lock glyph while title_locked is set, and a warning glyph when naming is unavailable,
  each with a hover that says why. A failure never opens a modal. The header is a source surface of
  cmd.chat.thread.regenerate_title (chat_header) beside the thread menu, where the regenerate
  action sits directly under Rename and is disabled with its reason when the policy is off or the
  model is unavailable. The naming outcome reads as a plain sentence per outcome (naming, named,
  not named because automatic naming is off, could not name because the model is unavailable,
  waiting for the first message, kept the user's name). This unit does not change the command's
  visible label.
gui_related: true
gui_classification_reason: "Defines the chat title record and the header title states."
split_recommended: false
depends_on: [ACD-462]
unblocks: [F3-575]
acceptance_criteria:
  - "Every naming attempt produces one ThreadTitleAttempt with one of the six outcomes."
  - "A manual rename sets thread.title_locked and automatic naming never overwrites it."
  - "An unavailable title model is never substituted silently."
  - "The header shows the naming, locked and unavailable states without a pill or modal."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: title_overwrite_or_silent_route_swap
reasoning_tier: standard
context_scope: chat_titles
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: owner_behavior_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) section 8.14 (G-33, G-34)"
  - "IMPACT-REGISTER B-ACD-06 (NOW part)"
preserved_exact_tokens:
  - "ThreadTitleAttempt"
  - "thread.title_locked"
  - "chat_header"
  - "pending | named | policy_off | route_unavailable | awaiting_first_message | user_locked"
  - "New chat"
negative_constraints:
  - "Do not overwrite a user-named title automatically."
  - "Do not switch title models silently."
  - "Do not report a naming failure in a modal."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Models_System.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-462, ContractName:Plans/Models_System.md, ContractName:Plans/FinalGUISpec.md#F3-575

### ACD-480 - Collaboration Run Views Are Editor Documents

```yaml
plan_unit_id: ACD-480
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The Plan tab rules of v3 item 15 (APR-036, APR-037, APR-038) are one editor-document mechanism
  that the collaboration run views reuse. Open Panel on a Crew, Chat Room, BrainStorm or Review card
  or receipt opens that run's view as one document per run identity in the editor tab system, beside
  the chat, focusing an already open tab instead of duplicating it. At narrow widths it follows the
  same full-width presentation with a persistent Return to chat affordance, without mutating saved
  preferences. The chat and the composer destination stay visible while the view is open, and a
  control that changes the run is rendered in one place at a time (Collaborative_Workflows CWR-020
  owns what the view contains). This unit does not change the minimum chat width.
gui_related: true
gui_classification_reason: "Places collaboration run views in the editor tab system."
split_recommended: false
depends_on: [ACD-452]
unblocks: [F3-569]
acceptance_criteria:
  - "Open Panel opens one editor document per run and focuses an existing tab instead of duplicating it."
  - "Narrow widths show the run view full width with Return to chat, as the Plan tab does."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_document_mechanism
reasoning_tier: standard
context_scope: editor_documents
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Collaborative_Workflows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 4.4, 7.9, 7.12"
  - "IMPACT-REGISTER B-ACD-05 (item 15)"
preserved_exact_tokens:
  - "Open Panel"
  - "Return to chat"
  - "APR-036"
negative_constraints:
  - "Do not build a second document mechanism for run views."
  - "Do not open a run view as a centred modal panel."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/FinalGUISpec.md#F3-569
