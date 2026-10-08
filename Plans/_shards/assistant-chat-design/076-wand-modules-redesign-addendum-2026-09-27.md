# Shard 076: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/assistant-chat-design.md`

Source lines: L26351-L27040

Source SHA256: `284326628056f4106d8107cd25d46608b0264d0d974da3feefaddb8ef84f1728`

---

## Wand Modules Redesign Addendum (2026-09-27)

This addendum carries the chat-behaviour parts of the redesigned Assistant wand popups and their in-chat presence (Crew, Chat Room, BrainStorm, Review, Crew Auto, Back Seat Driver, Schedule Message, Build At, the Scheduled and Automations manager, Memory, Teach, Revert Last Agent Edit, ELI5, New chat defaults and chat titles) into this owner. The source is the frozen design specification `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md` (SHA-256 `dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de`) under Jared's instruction of 2026-09-27 and his amendments J-1 and J-2 (DL-109); the 5.6 Pro concept is source lineage only. The family each record takes in the transcript is ACD-469's map and is never restated here, and the assistant-turn stream vocabulary is EP-128's. The run cards, notes, schedule cards and memory traces themselves belong to their owners (Collaborative_Workflows, Back_Seat_Driver, Scheduling_and_Quota_Resume, assistant-memory-subsystem); the GUI contract is FinalGUISpec F3-566 through F3-577. Where a unit below settles only part of a question it says which part; the rest waits for Jared's answer and is not implied. ACD-481 to ACD-483 and the later amendments to ACD-476, ACD-477 and ACD-479 compile the answers Jared gave on the decision cards (DL-125, DL-127, DL-129, DL-130 and DL-134). The design lead's rulings of 2026-09-27 on two of those answers are compiled as well: ACD-477 carries the reply's rule note of DL-116, with following defined by assistant-memory-subsystem AMS-053, and the v4 wand-contents paragraph carries the Crew Auto permission of DL-120, which Collaborative_Workflows CWR-004 and CWR-021 own. ACD-484 and section 2 compile ELI5 as Jared confirmed it on 2026-09-27 (DL-126): a project default that a chat's own override replaces for that chat, switching that changes only later replies, and "Explain this reply simply", which writes one extra reply only when asked.

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
  dock mirrors are ACD-469's map. The dock's live-run lines and the per-reply files row replace
  the stream footer pill's helpers and files chips (ACD-482, DL-129).
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
  correct. Capture only opens the capture step, and the capture step is the Teach sheet (FinalGUISpec
  F3-579) for every entry point, /teach and natural-language intent included: there is no inline capture card in the chat (DL-127). The save action is cmd.chat.teach.confirm, and
  Cancel, close and Escape are cmd.chat.teach.cancel, which persists nothing. Scope is exactly one
  of thread, project and user, shown nested from narrowest to widest as This thread, This project
  and Every project. The user scope needs public_safe: the user's explicit statement that the rule
  holds no private names, links or code; without it confirm refuses user scope and says why. In
  correct mode the scope may stay or narrow but never widen; a wider rule is a new rule. Before
  confirm the capture step screens the text for passwords, keys and tokens; when one is found it
  says so in words and confirm stays refused until it is removed. When a similar taught rule is in
  reach, the capture step shows the old and the new wording side by side and confirm waits for the
  user's choice: replace the old rule, which records supersedes_memory_id and keeps the old version
  in history, or keep both. The user may also mark the rule locked at confirm (ACD-481). The confirm
  request is TeachConfirmRequest {scope, public_safe, locked, conflict_resolution:
  replace:<memory_id> | keep_both, supersedes_memory_id?}. Each confirmed change leaves one receipt
  line in the chat (saved, or updated to a new version), and consecutive saves coalesce into one
  line. The reply's note about taught rules follows DL-116 as the design lead's ruling of
  2026-09-27 applied it and AMS-053 of assistant-memory-subsystem defines it. A rule counts as
  followed only when it was given to the assistant for that reply and the finished reply passed
  that rule's check; inclusion alone is never shown as following. The note counts only rules that
  passed, for example "Followed 1 of your rules". When any included rule failed its check the
  reply shows "Missed 1 of your rules" (the number is how many failed), with a way to see which
  rule was missed and a way to ask for a fix; the fix starts only when the user asks, and a failed
  check is never hidden behind a Followed count. A rule whose check could not run earns no tick,
  and a reply with no passed or failed check shows no rule note. Used is never shown in place of
  either note. Section 6's user-locked sentence is unchanged.
  DL-138 confirms the final wording. Persisted AMS-053 check results drive the note on reopen: passed
  counts as Followed, failed counts as Missed and could_not_run earns no tick. A mixed result is one
  line, Missed first, for example "Missed 1 of your rules · followed 2". See which rule opens the
  saved check evidence as view state. Ask for a fix reuses cmd.review.send_findings_to_agent with
  the taught_rule_check source variant (UCC-172): it fills the source thread's empty composer, returns
  ComposerBufferResult, refuses composer_not_empty, and never sends or executes a fix. The user sends it.
gui_related: true
gui_classification_reason: "Defines what the user sets and sees when teaching Puppet Master a rule."
split_recommended: false
depends_on: [ACD-469, DL-127, DL-116, AMS-053]
unblocks: [F3-570, F3-574, F3-579]
acceptance_criteria:
  - "Reopening retains the saved rule-check result, mixed results show one Missed-first line, and Ask for a fix only fills an empty composer until the user sends."
  - "Every entry point dispatches cmd.chat.teach.capture and opens the Teach sheet; nothing persists before cmd.chat.teach.confirm."
  - "No entry point renders an inline capture card in the chat."
  - "Confirm refuses user scope without public_safe and refuses text that looks like a secret, with the reason in words."
  - "Correct mode never widens a rule's scope."
  - "A similar rule blocks confirm until replace or keep both is chosen; replace records supersedes_memory_id."
  - "TeachConfirmRequest carries scope, public_safe, locked, conflict_resolution and supersedes_memory_id and no other new field."
  - "A reply's rule note counts only included rules whose check passed; a failed check shows \"Missed 1 of your rules\" with a way to see which rule and to ask for a fix; a rule whose check could not run earns no tick."
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
  - "Plans/Decision_Log.md#DL-138 (owner answers, 2026-09-29)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 8.11, 8.15"
  - "IMPACT-REGISTER B-ACD-02 (NOW part; the capture form and the locked field compiled 2026-09-27 from DL-127 and DL-130)"
  - "Plans/Decision_Log.md#DL-127"
  - "Plans/Decision_Log.md#DL-130"
  - "Plans/Decision_Log.md#DL-116 (card n07, E-36; the design lead's ruling of 2026-09-27)"
  - "Plans/assistant-memory-subsystem.md#AMS-053"
preserved_exact_tokens:
  - "composer_not_empty"
  - "ComposerBufferResult"
  - "taught_rule_check"
  - "cmd.review.send_findings_to_agent"
  - "Missed 1 of your rules · followed 2"
  - "could_not_run"
  - "failed"
  - "passed"
  - "cmd.chat.teach.capture"
  - "cmd.chat.teach.confirm"
  - "public_safe"
  - "TeachConfirmRequest"
  - "supersedes_memory_id"
  - "keep_both"
  - "Save as a rule…"
  - "Teach sheet"
  - "no inline capture card"
  - "locked"
  - "Followed 1 of your rules"
  - "Missed 1 of your rules"
  - "AMS-053"
negative_constraints:
  - "Do not persist anything on capture."
  - "Do not let an edit widen a rule's scope."
  - "Do not save text that looks like a password, key or token."
  - "Do not overwrite a similar rule without the user's replace choice."
  - "Do not render an inline capture card for /teach or natural-language intent."
  - "Do not show a rule as followed because it was included in the reply's context."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/assistant-memory-subsystem.md#AMS-053, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md#F3-570, ContractName:Plans/FinalGUISpec.md#F3-574, ContractName:Plans/FinalGUISpec.md#F3-579, ContractName:Plans/Decision_Log.md#DL-127, ContractName:Plans/Decision_Log.md#DL-116

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
  requested_route, effective_route?, outcome, title?, at} with outcome pending | named | policy_off | route_unavailable | awaiting_first_message | user_locked. thread.title_locked is set by a manual
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
  waiting for the first message, kept the user's name). The command's visible label, in the thread
  menu and in the header's hovers, is Name it for me; it replaces the catalog label Regenerate Title
  (DL-134), and the command id is unchanged.
gui_related: true
gui_classification_reason: "Defines the chat title record and the header title states."
split_recommended: false
depends_on: [ACD-462, DL-134]
unblocks: [F3-575]
acceptance_criteria:
  - "Every naming attempt produces one ThreadTitleAttempt with one of the six outcomes."
  - "A manual rename sets thread.title_locked and automatic naming never overwrites it."
  - "An unavailable title model is never substituted silently."
  - "The header shows the naming, locked and unavailable states without a pill or modal."
  - "Every visible label of cmd.chat.thread.regenerate_title reads Name it for me."
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
  - "IMPACT-REGISTER B-ACD-06 (NOW part; the label compiled 2026-09-27 from DL-134)"
  - "Plans/Decision_Log.md#DL-134"
preserved_exact_tokens:
  - "ThreadTitleAttempt"
  - "thread.title_locked"
  - "chat_header"
  - "pending | named | policy_off | route_unavailable | awaiting_first_message | user_locked"
  - "New chat"
  - "Name it for me"
  - "Regenerate Title"
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

### ACD-481 - Teach Rule Lock And Turn Off

```yaml
plan_unit_id: ACD-481
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Per-rule lock and turn off for taught rules (section 6; DL-130 adds both commands). A rule is
  locked when the user ticks Locked in the Teach sheet, which sets TeachConfirmRequest.locked, or
  uses Lock on the rule's row in Your rules. cmd.chat.teach.set_lock {locked} sets or clears the
  user-locked flag of one taught rule; a locked rule can be changed only by the user, and this
  command is the explicit user unlock that section 6 requires before automated cleanup,
  summarization or profile migration may weaken a user-locked rule. Unlocking is the same command
  with locked false. Turning a rule off is cmd.chat.teach.revoke: it sets revoked_at on one rule, the
  rule stays in history, older versions do not come back, and the rule leaves future prompt
  assembly; there is no undo, and the way back is to teach the rule again. Turn off asks inline in
  the rule's row, never in a modal: "Stop using this rule? It stays in history, and older versions
  don't come back." with Keep it, which is view state and dispatches nothing, and Turn off, which
  dispatches the command. Both commands act on one rule at its current revision and refuse a stale
  revision or an already turned-off rule with the reason in words. Turning a rule off leaves one
  receipt line in the chat (Rule turned off: and the rule's words); locking and unlocking change the
  rule's row and write no chat line. Your rules (the taught memory document) is the source surface of
  both commands, and the Memory sheet is a source surface of cmd.chat.teach.revoke. The catalog rows
  are UI_Command_Catalog's and the stored flags are assistant-memory-subsystem's; this unit states
  the chat behaviour.
gui_related: true
gui_classification_reason: "Defines how a user locks, unlocks and turns off a taught rule."
split_recommended: false
depends_on: [ACD-477, DL-130]
unblocks: [F3-579]
acceptance_criteria:
  - "cmd.chat.teach.set_lock changes the lock of exactly one rule and is the only way a user-locked rule is unlocked."
  - "cmd.chat.teach.revoke sets revoked_at on one rule, keeps it in history and never restores an older version."
  - "Keep it dispatches nothing; Turn off never opens a modal."
  - "A stale revision is refused with its reason."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: taught_rule_lock_bypass
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
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) section 8.11 (G-26, G-33)"
  - "IMPACT-REGISTER B-ACD-02 (WAIT part: lock and revoke, card p15, E-32)"
  - "Plans/Decision_Log.md#DL-130"
preserved_exact_tokens:
  - "cmd.chat.teach.set_lock"
  - "cmd.chat.teach.revoke"
  - "revoked_at"
  - "Keep it"
  - "Rule turned off:"
negative_constraints:
  - "Do not let automated cleanup unlock or weaken a user-locked rule."
  - "Do not restore an older version when a rule is turned off."
  - "Do not ask to turn a rule off in a modal."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/assistant-memory-subsystem.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-130, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md#F3-579

### ACD-482 - Dock And Files Row Supersede The Stream Footer Summary

```yaml
plan_unit_id: ACD-482
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The summary above the composer that ACD-435 and ACD-436 defined, a subagent chip with a helpers
  count and a files chip reading N file changes with a fan-out under both, is superseded (DL-129).
  What it carried now has these homes: a live run whose card is off-screen is a dock line (ACD-476);
  each assistant reply whose turn changed files carries its own files row (ACD-478); and the thread's
  total file count and every file's diff are in Activity's Changes domain, one click away. Nothing
  else stacks above the composer for this purpose, so the composer stack is the Activity bar pill,
  the follow-up queue, the quota-wait strip and the dock (FinalGUISpec F3-567). The problems row
  that ACD-435 renders for threads with diagnostics, with its route to the Problems bottom tab, is
  not part of this decision and is unchanged, as are FinalGUISpec F3-422's floating geometry and
  jump-to-latest rules.
gui_related: true
gui_classification_reason: "Removes the footer chips above the composer and names where their information went."
split_recommended: false
depends_on: [ACD-435, ACD-436, ACD-476, ACD-478, DL-129]
unblocks: [F3-567]
acceptance_criteria:
  - "No subagent chip, files chip or chip fan-out renders above the composer."
  - "The thread's total file count is reachable from Activity's Changes domain."
  - "The problems row still routes to the Problems bottom tab."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: stacked_composer_summaries
reasoning_tier: standard
context_scope: chat_composer_stack
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) sections 4.3 C14-C15 and C24, 7.8"
  - "IMPACT-REGISTER B-ACD-11, B-ACD-10 (footer pill part), B-FGS-03 (footer pill part); card p13, E-27"
  - "Plans/Decision_Log.md#DL-129"
preserved_exact_tokens:
  - "N file changes"
  - "files row"
  - "Changes domain"
  - "Problems"
negative_constraints:
  - "Do not render the footer chips beside the dock."
  - "Do not drop the problems row as part of this supersession."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-129, ContractName:Plans/assistant-chat-design.md#ACD-435, ContractName:Plans/assistant-chat-design.md#ACD-476, ContractName:Plans/FinalGUISpec.md#F3-567

### ACD-483 - Composer Source References For Sent Review Findings

```yaml
plan_unit_id: ACD-483
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Send Findings To Agent fills the message box instead of sending (DL-125). It writes a fix request
  into the source thread's composer buffer, the one invisible per-thread buffer, only when that
  buffer is empty, and otherwise refuses with "Your message box already has text. Send or clear it first."; nothing is sent until the user presses Send. The request is ordinary editable text, one
  numbered item per selected finding with its claim, its suggested fix and how the user will know it
  is fixed. The lineage never appears in the text: the buffer carries source_refs[] {kind:
  review_finding, run_id, finding_id}, one entry per finding in the request, and when the user sends,
  the sent message record carries the same source_refs. Editing the text keeps them; if the user
  clears the message box entirely, they are dropped with it. source_refs are metadata for lineage
  and Details only and change nothing the model is sent. Collaborative_Workflows owns the command's
  revised result and refusal; this unit owns the buffer and message fields.
gui_related: true
gui_classification_reason: "Defines what Send Findings To Agent puts in the composer and what the sent message records."
split_recommended: false
depends_on: [ACD-462, DL-125]
unblocks: []
acceptance_criteria:
  - "Send Findings To Agent never sends; it fills an empty message box or refuses with its reason."
  - "The message text holds no run or finding id; the buffer and the sent message carry source_refs."
  - "Clearing the message box drops the source_refs."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: lineage_leaks_into_prompt_text
reasoning_tier: standard
context_scope: chat_composer_buffer
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Collaborative_Workflows.md
node_compile_hint:
  mode: owner_behavior_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) section 8.5 (G-33, the Send Findings To Agent text)"
  - "IMPACT-REGISTER B-ACD-09; card p07, E-07"
  - "Plans/Decision_Log.md#DL-125"
preserved_exact_tokens:
  - "Send Findings To Agent"
  - "source_refs"
  - "review_finding"
  - "Your message box already has text. Send or clear it first."
negative_constraints:
  - "Do not send a findings request without the user pressing Send."
  - "Do not overwrite text already in the message box."
  - "Do not put run or finding ids in the message text."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-125, ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/assistant-chat-design.md#ACD-462

### ACD-484 - ELI5 Chat Override Project Default And App Default With Forward-Only Switching

```yaml
plan_unit_id: ACD-484
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  ELI5 in a chat, as Jared confirmed it on 2026-09-27 (DL-126). A chat's ELI5 state is resolved in
  this order: the chat override, otherwise the project default, otherwise the app default. The chat
  override is the per-conversation setting `general.interaction.chat-eli5`, written only by
  cmd.chat.eli5.set with on, off or inherit; inherit deletes the override, so the chat follows the
  project default again. The app default is `general.interaction.eli5-default` (Explain Terms Everywhere), whose value Settings owns and registers as off. The project default is that same
  setting at project scope and applies to every chat in the project that has no override of its
  own. Settings owns and persists that project scope under DL-138 (SSYS-028). Each assistant reply resolves the style once, when it starts, and records the style it was written in, Standard or Simple; a retry the user
  asks for resolves the style again when the retry starts. Switching ELI5 changes only the replies
  that start after the switch. It never re-sends, regenerates or rewrites an earlier reply, and a
  reply still streaming at the moment of the switch finishes in the style it started with, so a switch never produces a second response. Each finished assistant reply may offer
  Explain this reply simply. It dispatches cmd.chat.eli5.explain_reply with that reply's message id
  and writes one extra reply, a simpler explanation of that reply, only when the user asks; the
  command is refused while that reply is still streaming. The extra reply is an ordinary assistant
  reply at the end of the thread that names the reply it explains and is written in Simple; it
  never rewrites or replaces the reply it explains and changes no ELI5 setting. ELI5 is its own
  small popup, the ELI5 sheet, opened from the wand's ELI5 row, and the quick dot by the message
  box is the one-click on and off for the chat; FinalGUISpec F3-581 is their GUI contract. ELI5
  changes only how answers are worded: code, plans, files and generated documents never change,
  and Crew, Review and BrainStorm results stay technical. Dual copy: the Expert and ELI5 pair exists only for tooltips and help (section 2.2, FinalGUISpec F3-572), and the plain helper lines
  under controls are single copy. The app-level Interaction Mode of section 2.2 is a separate
  setting with its own default and is not one of the three levels. Obligation on the guided tour
  owner: the guided tour teaches the retired one-click toggle and applies ELI5 to the same answer.
  It must be re-pointed to the ELI5 popup and the quick dot, and because a switch never rewrites a
  reply, a tour step that shows an answer explained simply may do so only through Explain this
  reply simply, which adds one reply. The obligation covers the Planning_Wizard guided tour
  chapter, FinalGUISpec F3-521, the Wiring_Matrix tour consumer rows, the Automated_Testing_System
  tour acceptance items and the guided tour contract schema and fixtures; this unit edits none of
  them. They carry the re-point as of 2026-09-27: Planning_Wizard PWIZ-023 and its tour chapter,
  FinalGUISpec F3-521, Automated_Testing_System ATS-020, Wiring_Matrix WM-041 and the guided tour
  contract pair. What still teaches the old behaviour is the touch closure tour action pin and the
  concept tour source, which the tour owner changes together.
gui_related: true
gui_classification_reason: "Defines what a person's ELI5 choice changes in a chat, and the per-reply simpler explanation they can ask for."
split_recommended: false
depends_on: [ACD-010, DL-126, F3-572]
unblocks: [F3-581, ATS-065]
acceptance_criteria:
  - "A chat with an override uses it; a chat without one uses the project default; a project without one uses the app default."
  - "After a switch, every earlier reply keeps its text and no reply is re-sent, regenerated or rewritten."
  - "A reply streaming during a switch finishes in the style it started with."
  - "Explain this reply simply adds exactly one reply, leaves the explained reply unchanged and changes no ELI5 setting."
  - "cmd.chat.eli5.explain_reply is refused for a reply that is still streaming."
  - "No helper line under a control has an Expert and an ELI5 variant."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: eli5_second_response_or_rewrite
reasoning_tier: high
context_scope: chat_eli5
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Settings_System.md
node_compile_hint:
  mode: owner_behavior_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-138 (owner answers, 2026-09-29)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) section 8.13 and its amendments G-21 and G-34, section 10.1 item f"
  - "IMPACT-REGISTER B-ACD-01 (card p08, E-11), C-21 (the guided tour), D-30 (retry re-resolves the style)"
  - "Plans/Decision_Log.md#DL-126 (Owner resolution, Jared, 2026-09-27, confirmed in chat)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json (SHA-256 33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5) answer record p08"
preserved_exact_tokens:
  - "DL-138"
  - "the chat override, otherwise the project default, otherwise the app default"
  - "general.interaction.chat-eli5"
  - "general.interaction.eli5-default"
  - "Explain Terms Everywhere"
  - "cmd.chat.eli5.set"
  - "inherit"
  - "cmd.chat.eli5.explain_reply"
  - "Explain this reply simply"
  - "a switch never produces a second response"
  - "refused while that reply is still streaming"
  - "resolves the style once, when it starts"
  - "exists only for tooltips and help"
  - "DL-126"
  - "Plans/assistant_chat_contracts.schema.json"
negative_constraints:
  - "Do not re-send, regenerate or rewrite any reply because ELI5 was switched."
  - "Do not produce a second response from a switch."
  - "Do not let Explain this reply simply replace or edit the reply it explains."
  - "Do not give helper lines under controls an Expert and an ELI5 variant."
  - "Do not let ELI5 change code, plans, files or generated documents."
  - "Do not define the Settings project scope here; Settings owns it."
stale_retired_dispositions:
  - "Section 2.1's 'A toggle in the chat UI', its bare 'Default: OFF' and 'a per-chat or per-session flag' are superseded by the three-level resolution in this unit (DL-126)."
  - "FinalGUISpec 2026-09-03 section 14's 'ELI5 is a wand check' is superseded by the ELI5 sheet and the quick dot (FinalGUISpec F3-581)."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-126, ContractName:Plans/FinalGUISpec.md#F3-572, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Settings_System.md

ELI5 contracts: `cmd.chat.eli5.set` (`ELI5ThreadOverrideRequest`, on, off or inherit) and `cmd.chat.eli5.explain_reply` (`ELI5ExplainReplyRequest`, `ELI5ExplainReplyResult`) validate against `Plans/assistant_chat_contracts.schema.json`, with fixtures in `Plans/assistant_chat_contract_fixtures.json`.
