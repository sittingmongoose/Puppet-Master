# Shard 076: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/assistant-chat-design.md`

Source lines: L27427-L28121

Source SHA256: `ac6d47c2f168f72ac5934188d3f9e2871f2ac7d187534e70b5406c5a75693f1d`

---

## Wand Modules Redesign Addendum (2026-09-27)

This addendum carries the chat-behaviour parts of the redesigned Assistant wand popups and their in-chat presence (Crew, Chat Room, BrainStorm, Review, Crew Auto, Back Seat Driver, Schedule Message, Build At, the Scheduled and Automations manager, Memory, Teach, Revert Last Agent Edit, ELI5, New chat defaults and chat titles) into this owner. The source is the frozen design specification `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md` (SHA-256 `dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de`) under Jared's instruction of 2026-09-27 and his amendments J-1 and J-2 (DL-109); the 5.6 Pro concept is source lineage only. The family each record takes in the transcript is ACD-469's map and is never restated here, and the assistant-turn stream vocabulary is EP-128's. The run cards, notes, schedule cards and memory traces themselves belong to their owners (Collaborative_Workflows, Back_Seat_Driver, Scheduling_and_Quota_Resume, assistant-memory-subsystem); the GUI contract is FinalGUISpec F3-566 through F3-577. Where a unit below settles only part of a question it says which part; the rest waits for Jared's answer and is not implied. ACD-481 to ACD-483 and the later amendments to ACD-476, ACD-477 and ACD-479 compile the answers Jared gave on the decision cards (DL-125, DL-127, DL-129, DL-130 and DL-134). The design lead's rulings of 2026-09-27 on two of those answers are compiled as well: ACD-477 carries the reply's rule note of DL-116, with following defined by assistant-memory-subsystem AMS-053, and the v4 wand-contents paragraph carries the Crew Auto permission of DL-120, which Collaborative_Workflows CWR-004 and CWR-021 own. ACD-484 and section 2 compile ELI5 as Jared confirmed it on 2026-09-27 (DL-126): a project default that a chat's own override replaces for that chat, switching that changes only later replies, and "Explain this reply simply", which writes one extra reply only when asked.

### ACD-476 - Composer Dock And Per-Owner Attention Items

```yaml
plan_unit_id: ACD-476
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: 'The dock is a composer-adjacent surface of at most three one-line items that carries owner attention
  while a source’s transcript card is off-screen, or its admitted cardless Work projection is eligible. FinalGUISpec
  F3-567 places it in the composer stack directly after the provider quota-wait strip; it reserves its own height there
  and never floats over the transcript. Items come in this order: needs you (an approval, a question, a failure, a tie
  or a held scheduled message that waits on the user), your move (a turn that is the user''s but is not a problem, such
  as a Chat Room that waits on the user: after its last round, while paused, between rounds while Pause between rounds
  is on, or while any Grill Me session waits for its current Confirm, before round 1 or after mid-run activation before
  the round that needs its answers, CWR-044, DL-231), live runs (newest first), and the next coming-up scheduled item.
  Questions, approvals and failures remain needs, including between numbered rounds. A room between two automatic rounds
  reads as live only when no existing user gate or manual pause requires attention. A needs-you item also shows while
  its transcript item is only partly visible. A fourth and later item collapses into one overflow line that opens Activity.
  Each item is an AttentionItem projection {source_kind, source_id, tone, sentence, primary_action_route, since} published
  by the owner of the source record, with tone needs | yourmove | live | comingup; the chat shell only merges and orders
  them. The dock owns no run, schedule or advice state and writes no words of its own: an item''s sentence is the owner''s
  current sentence. A transcript-backed item appears once its transcript item has been out of view for 400 ms and leaves
  as soon as it is visible again; a needs-you item skips the wait, and a visibility change inside the quiet window is
  re-evaluated when the window ends, never dropped. An item''s action follows its primary_action_route: it reveals the
  transcript item (scrolls to it and marks it once), or, for an owner-admitted question, opens the existing questionnaire
  (Answer now). A permission decision is never taken from the dock; it is taken only in its transcript item or the approval
  owner''s host. The families of the records the dock mirrors are ACD-469''s map. The dock''s live-run lines and the
  per-reply files row replace the stream footer pill''s helpers and files chips (ACD-482, DL-129). Amended 2026-10-29
  (D2/D8/D9; PM7): A process prompt is a needs-you dock item, live process work contributes to live runs; both are views
  of the same owner identity, not duplicate attention. Process stop differs from reply Stop; delivery never wakes a stopped
  thread. D2/D7/D9, PM7 Step4 final-source alignment, 2026-10-30 (integration e9b15abc64): One shared work dock provider reads the selected thread’s owner-projected process, agent and scheduled items. Items requiring input or review
  are needs lines with Review, live processes are live lines with current time, and the next pending scheduled
  run is comingup. These items have no transcript card to wait offscreen for; existing transcript-backed providers retain
  their visibility rules. Visible work times update through the shared tick owner. Review/Show for a process or scheduled
  item reuses cmd.chat.processes.open with that exact item selected; an agent Review selects its existing Subagents Activity
  Detail row as local view state, not cmd.agents.open_thread and not a direct permission/answer/stop action. D7: Native
  owner-row selection must bind signed owner identity, thread and generation as CS-106 requires; the concept is not evidence
  that this stronger guard exists. Process/scheduled Review already passes the item ID. QA round 2, Jared 2026-10-30;
  DL-258; GUI 7d586bad18: Q13/CC5: the owner-backed work dock provider gives a live process and the next pending scheduled run
  a 60000 ms presentation lifetime from first exposure in that thread’s dock projection. Key freshness by thread, work
  identity and run start/occurrence time; repaint or returning to the same run does not restart it, while a restarted/new
  occurrence gets a new lifetime. At elapsed >=60000 the non-needs line leaves. Needs-you lines bypass expiry and remain
  until the owning question/input is answered. One next-expiry timer requests a redraw; it owns no work, schedule or
  persisted state and expiry never stops/cancels/deletes work. Existing dock priority, at-most-three budget and transcript
  visibility gates remain; full work remains reachable through Activity and the panel. Q14/H9: Glass’s Activity bar and
  composer dock lines join Activity Detail, panel, System status, Stop/Quit list, History and hover/attachment cards
  on the persona/model menu’s near-opaque plate. The needs line keeps its warm wash over that plate. Settings dialogs
  and drawers flatten that same menu tint over the look’s ground so background labels cannot read through; ordinary panes
  keep their existing material. This is consumer treatment, no global Glass token change or extra backdrop-filter. Amended
  DL-260, Jared 2026-10-31: only real product behavior remains an implementation requirement.'
gui_related: true
gui_classification_reason: "Defines the dock above the composer and the attention items it shows."
split_recommended: false
depends_on: [ACD-469, F3-532]
unblocks: [F3-567]
acceptance_criteria:
  - "The dock shows at most three item lines plus one overflow line, needs-you first."
  - "A transcript-backed item shows only while its card is off-screen (needs also while partly visible) and leaves when the card becomes visible; cardless Work items use their provider eligibility and Q13 lifetime."
  - "No dock action approves or declines a permission request."
  - "Every dock sentence is the producing owner's sentence; the dock holds no copy of owner state."
  - "The dock reserves its own space and never covers transcript content."
  - "A Chat Room's pacing, exhaustion or stop-condition wait, manual pause and every Grill Me session's current Confirm use yourmove (CWR-044); questions, approvals and failures use needs. Between automatic rounds it shows as live only when no existing user gate or manual pause requires attention."
  - "QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q13/CC5: the owner-backed work dock provider gives a live process and the next pending scheduled run a 60000 ms presentation lifetime from first exposure in that thread’s dock projection. Key freshness by thread, work identity and run start/occurrence time; repaint or returning to the same run does not restart it, while a restarted/new occurrence gets a new lifetime. At elapsed >=60000 the non-needs line leaves. Needs-you lines bypass expiry and remain until the owning question/input is answered. One next-expiry timer requests a redraw; it owns no work, schedule or persisted state and expiry never stops/cancels/deletes work. Existing dock priority, at-most-three budget and transcript visibility gates remain; full work remains reachable through Activity and the panel. Q14/H9: Glass’s Activity bar and composer dock lines join Activity Detail, panel, System status, Stop/Quit list, History and hover/attachment cards on the persona/model menu’s near-opaque plate. The needs line keeps its warm wash over that plate. Settings dialogs and drawers flatten that same menu tint over the look’s ground so background labels cannot read through; ordinary panes keep their existing material. This is consumer treatment, no global Glass token change or extra backdrop-filter."
validation_surfaces:
- "scripts/pm-shard-plans.py"
- "scripts/pm-plan-index.py"
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
  - "Plans/Decision_Log.md DL-231 (a finished Chat Room round is no longer the user's move, 2026-10-21)"
  - "DL-260 source lineage only (no product API or implementation obligation): PM_WORK was the concept work-projection adapter; dock eligibility and lifetime are DR-078/ACD-476 product presentation rules."
  - "DL-260 source lineage only (no product API or implementation obligation): activity-panel.js registered PM56_PMX.dock.provide(workDock) over PM_WORK and patched [data-work-time]; these were concept provider/DOM spellings."
  - "DL-260 source lineage only (no product API or implementation obligation): needsYou was a concept work predicate; the owner AttentionItem projection supplies the product needs tone."
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
  The wand Teach, /teach, natural-language instruction intent and Save as a rule open the existing
  Teach step through cmd.chat.teach.capture; capture persists nothing and Cancel remains
  cmd.chat.teach.cancel. Written instruction changes use their instruction owner and return to
  Settings > Personas & Crews > Defaults > Standing instructions. A Teacher answer offered as a
  saved note instead uses the shared Memory page and AMS-141 Add/Edit/Delete owner. This project and
  Every project are the only visible saved-note levels. Add/Edit/Delete use AMS-141 quiet Memory
  contracts; automatic fading/archiving, deletion suppression, privacy and existing source
  restrictions remain. Private app-thread records stay private and are not a third visible level. No
  thread-level selector, locked checkbox, Replace/Keep both chooser, source preview or automatic
  save/update receipt is shown. Existing TeachConfirmRequest thread/public_safe/locked/conflict
  fields are compatibility/storage inputs, not an ordinary UI contract. Legacy protections, privacy
  checks and revision refusal remain; capture never changes the Persona to Teacher. Only a durable
  successful save may add Saved to memory · View to a reply; View opens the one Memory page as a
  sheet. No memory-use citation, receipt, tick, chip, count, source detail, verification or
  Followed/Missed decoration is shown.
gui_related: true
gui_classification_reason: "Defines what the user sets and sees when teaching Puppet Master a rule."
split_recommended: false
depends_on: [ACD-469, DL-127, DL-116, AMS-053]
unblocks: [F3-570, F3-574, F3-579]
acceptance_criteria:
  - "All saved-note entry points reuse the same Memory page and typed Add/Edit/Delete owner at This project or Every project."
  - "Teach persists nothing on open/cancel and uses the existing written-instruction owner; no lock/conflict/source/rollback picker or third saved-note level appears."
  - "Only a durable successful save may add Saved to memory · View to a reply; View opens the one Memory page as a sheet. No memory-use citation, receipt, tick, chip, count, source detail, verification or Followed/Missed decoration is shown."
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
- Plans/Decision_Log.md#DL-138 (owner answers, 2026-09-29)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
  sections 8.11, 8.15
- IMPACT-REGISTER B-ACD-02 (NOW part; the capture form and the locked field compiled 2026-09-27 from DL-127
  and DL-130)
- Plans/Decision_Log.md#DL-127
- Plans/Decision_Log.md#DL-130
- Plans/Decision_Log.md#DL-116 (card n07, E-36; the design lead's ruling of 2026-09-27)
- Plans/assistant-memory-subsystem.md#AMS-053
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c
- projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03
- 'Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It''s only planning
  wizard/prd builder/orchestrator that isn''t.'
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- "DL-475 follow-up; verified Ember Memory round, 2026-11-12"
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
  - "Do not persist on capture/cancel, save secrets, silently broaden availability, overwrite protected records or restore old capture controls."
  - "Do not turn /teach into a Teacher Persona switch or an alternate Memory manager."
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
  requested_route, effective_route?, outcome, title?, at} with outcome pending | named | policy_off |
  route_unavailable | awaiting_first_message | user_locked. thread.title_locked is set by a manual rename
  and cleared only by cmd.chat.thread.regenerate_title (ACD-462); while it is set, automatic naming
  records user_locked and changes nothing. An unavailable title model records route_unavailable and is
  never silently replaced by another model. The chat header's title shows the attempt's state without
  pills: New chat with a naming shimmer while pending, the title once named, a lock glyph while
  title_locked is set, and a warning glyph when naming is unavailable, each with a hover that says why. A
  failure never opens a modal. The header is a source surface of cmd.chat.thread.regenerate_title
  (chat_header) beside the thread menu, where the regenerate action sits directly under Rename and is
  disabled with its reason when the policy is off or the model is unavailable. The naming outcome reads
  as a plain sentence per outcome (naming, named, not named because automatic naming is off, could not
  name because the model is unavailable, waiting for the first message, kept the user's name). The
  command's visible label, in the thread menu and in the header's hovers, is Name it for me; it replaces
  the catalog label Regenerate Title (DL-134), and the command id is unchanged. The naming row lives in
  Settings > Models > Default models. Default resolves the smallest allowed runnable model when a naming
  attempt is created; None displays Off and produces policy_off. An explicit model and its optional
  proven depth use the shared picker, including WL4 B validation of typed names before saving. The
  resolved requested route is then frozen, so an unavailable title model still records route_unavailable
  and is never silently substituted. Manual title locks, first-message-only naming and no-modal failure
  remain unchanged.
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
  The Plan tab rules of v3 item 15 (APR-036, APR-037, APR-038) are one editor-document mechanism that the
  collaboration run views reuse. Open Panel on a Crew, Chat Room, BrainStorm or Review card or receipt
  opens that run's view as one document per run identity in the editor tab system, beside the chat,
  focusing an already open tab instead of duplicating it. At narrow widths it follows the same full-width
  presentation with a persistent Return to chat affordance, without mutating saved preferences. The chat
  and the composer destination stay visible while the view is open, and a control that changes the run is
  rendered in one place at a time (Collaborative_Workflows CWR-020 owns what the view contains). This unit
  does not change the minimum chat width. Amended 2026-10-09 (DL-180): the editor tab system beside the
  chat is the home centre's panels. Open Panel opens or reveals the run's run tab through ACD-500 and
  Plans/FinalGUISpec.md#F3-634, one tab per run identity, and it takes focus because the user clicked it;
  in a narrow window it shows through F3-636's panel switcher beside the chat. Return to chat retires for
  Home, because no tab covers the chat (ACD-500). The chat's width is F3-637's. The same exact run/Plan
  identity routes operate in app scope with No project/Computer context and owner currentness. No
  Project-focused lookup or second tab runtime is added.
gui_related: true
gui_classification_reason: "Places collaboration run views in the editor tab system."
split_recommended: false
depends_on: [ACD-452, DL-180]
unblocks: [F3-569]
acceptance_criteria:
  - "Open Panel opens one run tab per run in the home centre through F3-634 and reveals an existing tab instead of duplicating it (DL-180)."
  - "In a narrow window the run tab shows in the centre's panel switcher beside the chat, as the plan tab does (DL-180)."
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
  - "Plans/Decision_Log.md#DL-180"
  - "Plans/assistant-chat-design.md#ACD-500"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens:
  - "Open Panel"
  - "Return to chat"
  - "APR-036"
negative_constraints:
  - "Do not build a second document mechanism for run views."
  - "Do not open a run view as a centred modal panel."
stale_retired_dispositions:
  - "Amended 2026-10-09 (DL-180): run views are run tabs placed by F3-634 through ACD-500, and Return to chat retires for Home; DL-180 is in depends_on, and ACD-500 stays in source_lineage because ACD-500 reaches this unit through F3-569."
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
  Written instructions remain directly editable through Settings > Personas & Crews > Defaults >
  Standing instructions. Memory never edits a standing instruction. Existing Teach lock/revocation
  and version codecs remain for internal compatibility and protection; cmd.chat.teach.set_lock has
  no ordinary GUI producer. No user lock/unlock or rollback control and no automatic memory
  rule-change proposal panel is shown. Explicit user edits/deletions still use the owning
  instruction or Memory writer with revision/privacy checks; automatic upkeep cannot weaken retained
  protections.
gui_related: true
gui_classification_reason: "Defines how a user locks, unlocks and turns off a taught rule."
split_recommended: false
depends_on: [ACD-477, DL-130]
unblocks: [F3-579]
acceptance_criteria:
  - "Written instructions and saved notes use their separate existing owners; no Memory rule editor, lock/unlock, conflict or rollback control exists."
  - "Legacy protected records retain their internal safeguards without ordinary UI producers."
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
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
  section 8.11 (G-26, G-33)
- 'IMPACT-REGISTER B-ACD-02 (WAIT part: lock and revoke, card p15, E-32)'
- Plans/Decision_Log.md#DL-130
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- "DL-475 follow-up; verified Ember Memory round, 2026-11-12"
preserved_exact_tokens:
  - "cmd.chat.teach.set_lock"
  - "cmd.chat.teach.revoke"
  - "revoked_at"
  - "Keep it"
  - "Rule turned off:"
negative_constraints:
- Do not expose retired memory-use, verification or rule-check receipt UI.
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
  Amended 2026-10-09 (DL-180, DL-184): there is no bottom panel; the problems row opens or reveals the
  Problems tab, one per workspace, a tool tab kind of the home panels placed by the tool-kind affinity
  of Plans/FinalGUISpec.md#F3-634 (F3-635, ACD-435). The Activity bar is no longer a pill in any look;
  read "the Activity bar pill" as the Activity bar (ACD-452, Plans/DRY_Rules.md#DR-069,
  Plans/FinalGUISpec.md#F3-648).
gui_related: true
gui_classification_reason: "Removes the footer chips above the composer and names where their information went."
split_recommended: false
depends_on: [ACD-435, ACD-436, ACD-476, ACD-478, DL-129, DL-180, DL-184]
unblocks: [F3-567]
acceptance_criteria:
  - "No subagent chip, files chip or chip fan-out renders above the composer."
  - "The thread's total file count is reachable from Activity's Changes domain."
  - "The problems row still routes to the Problems tab of the home panels, one per workspace (DL-180)."
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
stale_retired_dispositions:
  - "Amended 2026-10-09 (DL-180): the problems row routes to the Problems tab of the home panels (F3-635, F3-634), not a bottom tab."
  - "Amended 2026-10-09 (DL-184): the Activity bar in the composer stack is no longer a pill (ACD-452)."
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
  ELI5 consumes the one Settings resolver: This chat override, then applicable Project, then Computer,
  then Everywhere, then factory; app chat skips Project. general.interaction.chat-eli5 remains the
  per-conversation on/off/inherit value written only by cmd.chat.eli5.set, while
  general.interaction.eli5-default is the Settings-owned layered default. Inherit removes the chat
  override and follows that resolver; Everywhere edits use the existing Settings transaction and q-035 is
  resolved in current canon. Each reply freezes style at start, a retry resolves afresh and no switch
  rewrites a streaming or old answer. Explain this reply simply adds one requested Simple reply only after
  the source finished and changes no preference. ELI5 popup/quick dot, dual tooltip/help versus single
  helper copy and technical Crew/Review/BrainStorm outputs remain unchanged. App Interaction Mode is a
  separate setting. Guided Tour consumes these same owners and never rewrites an old reply.
gui_related: true
gui_classification_reason: "Defines what a person's ELI5 choice changes in a chat, and the per-reply simpler explanation they can ask for."
split_recommended: false
depends_on: [ACD-010, DL-126, F3-572]
unblocks: [F3-581, ATS-065]
acceptance_criteria:
  - "Resolution follows This chat → Project → Computer → Everywhere → factory; an app chat skips Project and each missing override falls through to the next applicable level."
  - "After a switch, every earlier reply keeps its text and no reply is re-sent, regenerated or rewritten."
  - "A reply streaming during a switch finishes in the style it started with."
  - "Explain this reply simply adds exactly one reply, leaves the explained reply unchanged and changes no ELI5 setting."
  - "cmd.chat.eli5.explain_reply is refused for a reply that is still streaming."
  - "No helper line under a control has an Expert and an ELI5 variant."
validation_surfaces:
  - scripts/pm-shard-plans.py
  - scripts/pm-plan-index.py
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
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens:
  - "DL-138"
  - "This chat → Project → Computer → Everywhere → factory"
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
  - "Section 2.1's 'A toggle in the chat UI', its bare 'Default: OFF' and 'a per-chat or per-session flag' are superseded by this unit's Settings-owned layered resolution (DL-281); DL-126's forward-only reply behavior remains."
  - "FinalGUISpec 2026-09-03 section 14's 'ELI5 is a wand check' is superseded by the ELI5 sheet and the quick dot (FinalGUISpec F3-581)."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-126, ContractName:Plans/FinalGUISpec.md#F3-572, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Settings_System.md

ELI5 contracts: `cmd.chat.eli5.set` (`ELI5ThreadOverrideRequest`, on, off or inherit) and `cmd.chat.eli5.explain_reply` (`ELI5ExplainReplyRequest`, `ELI5ExplainReplyResult`) validate against `Plans/assistant_chat_contracts.schema.json`, with fixtures in `Plans/assistant_chat_contract_fixtures.json`.
