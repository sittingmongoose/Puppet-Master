# Shard 048: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L13514-L14566

Source SHA256: `e6236495f37921bf880f218081f73a050e3052c4b095f0e9540d344ab4f5b7a8`

---

## Wand Modules Redesign Addendum (2026-09-27)

The redesigned Assistant wand popups and their in-chat presence (Crew, Chat Room, BrainStorm, Review, Back Seat Driver, Schedule Message, Build At, the Scheduled and Automations manager, Memory, Teach, Revert Last Agent Edit and the chat title) add source surfaces. Apart from the nine command identities that UCC-171 and UCC-174 register on the owner's answers (CDRY-022, CDRY-023), they add no commands: every other control dispatches an existing row, writes a draft field of the request its sheet's primary sends, writes a Settings value, or is view state with no command (CDRY-021). This addendum names the new source surfaces, the existing surfaces that join more rows, and the revisions of existing rows that follow. A surface named here joins the named rows in addition to its family's "Source surfaces" line.

### Surfaces the redesign adds

| Surface | What it is | Rows it produces |
|---|---|---|
| `run_dock` | The one to three lines above the composer that carry live runs and needs-you items whose cards are off-screen (ACD-476). | `cmd.collaboration.open`, `cmd.questionnaire.resume` |
| `wonderer_workspace` | The BrainStorm Wonderer workspace, an editor-pane document like the run view (CWR-020). | `cmd.brainstorm.synthesize_plan`, `cmd.collaboration.pause`, `cmd.collaboration.resume` |
| `memory_proposal_line` | The one in-chat line that proposes a memory for review (AMS-047). | `cmd.chat.teach.open_memory` |
| `bsd_note` | The Back Seat Driver advisor note in the transcript, with its catch-up, failure and safety lines (BSD-030). | `cmd.bsd.finding.open`, `cmd.bsd.assignment.resume`, `cmd.bsd.assignment.retry`, `cmd.chat.open_thread_context_details` |
| `schedule_sheet` | The Schedule Message sheet. The wand row only opens it; its primary commits. | `cmd.chat.schedule_message` |
| `scheduled_message_card` | A scheduled message in the transcript (SQR-012). | `cmd.chat.schedule_message.update`, `cmd.chat.schedule_message.cancel`, `cmd.chat.open_thread` |
| `schedule_manager` | The Scheduled and Automations manager. | `cmd.chat.schedule_message.update`, `cmd.chat.schedule_message.cancel`, `cmd.execution_window.update`, `cmd.execution_window.cancel`, `cmd.chat.open_thread` |
| `memory_sheet` | The Memory sheet. | `cmd.chat.memory.verify`, `cmd.chat.memory.pin`, `cmd.chat.memory.discard`, `cmd.chat.memory.preview_capsule`, `cmd.chat.memory.toggle_auto_save_unverified`, `cmd.chat.teach.capture` |
| `message_files_row` | The files row under an assistant message that changed files (ACD-478). It opens the Revert confirm sheet, which is not a command. | none of its own; it leads to `revert_confirm` |
| `revert_confirm` | The Revert confirm sheet over the turn's change manifest (ACD-478). | `cmd.chat.revert` |
| `chat_header` | The chat header title and its states (ACD-479). | `cmd.chat.thread.regenerate_title` |

### Existing surfaces that join more rows

| Surface | Rows it now also produces |
|---|---|
| `mode_menu`, `natural_language`, `plan_schedule` | `cmd.collaboration.configure` (a preview with no side effects; `plan_schedule` is the Build At sheet's "Set up the Crew…") |
| `wand` | `cmd.chat.teach.open_memory` ("Memory…"), `cmd.chat.teach.capture` ("Teach…") |
| `brainstorm_card` | `cmd.questionnaire.resume` ("Answer now") |
| `workflow_card` | `cmd.runtime.approve`, `cmd.runtime.decline`, `cmd.permissions.review_request` (Allow once, Don't allow and Details on a needs-you decision) |
| `review_card`, `review_panel`, `chat_room_card`, `chat_room_panel` | `cmd.chat.todos.open` ("To-Do created · Open", Open To-Dos) |

### Revisions of existing rows

- `cmd.chat.plan.build_with_crew`: the Crew configuration sheet in Build With Crew mode is its GUI producer. That sheet's Start dispatches this command and never `cmd.collaboration.start`; one atomic PlanRun and CrewRun (MODAL-013).
- `cmd.chat.revert`: only the `revert_confirm` primary dispatches it. The sheet is the confirmation, and the `expected_turn_manifest_sha256` it sends is the hash of the manifest the sheet shows. Opening the sheet from `message_files_row`, the wand row, Changes or the message menu is not a command. The outcome is the FileSafe restore outcome; there is no `kept` outcome and no conflict-dismissal outcome, and leaving the files as they are is a local dismiss that writes no record. "See what's blocking it" only opens the Revert document at that file.
- `cmd.chat.thread.regenerate_title`: gains the `chat_header` surface. Its label is set by UCC-173 (DL-134).
- `cmd.chat.teach.capture` opens the Teach sheet from the wand and the Memory sheet, and carries `mode` (`new`, or `correct` for editing an existing rule). The sheet's save is `cmd.chat.teach.confirm` with the `TeachConfirmRequest` fields of ACD-477; its Cancel, ×, Escape and scrim are `cmd.chat.teach.cancel`.
- `cmd.chat.teach.open_memory` stays the one memory route: the wand's "Memory…" and the proposal line's Review both reach it.
- `cmd.chat.memory.preview_capsule`: "See what your next message will include" on the `memory_sheet` is this row, a preview computation with no persisted domain event.
- `cmd.questionnaire.resume`: BrainStorm "Answer now" on `run_dock` and on `brainstorm_card` opens the existing questionnaire. While the questionnaire family is `candidate_not_registered`, both render disabled with `command_not_registered`.
- `cmd.runtime.approve` and `cmd.runtime.decline`: a needs-you decision is taken only on its `workflow_card`. The `run_dock` line points to the card and never takes a permission decision.

Every surface above takes the UCC-156 obligation: it reads the same owner availability and the same exact disabled reason as every other producer of the row, and renders the control disabled rather than optimistic when it cannot read them.

### UCC-169 - Wand Module Source Surfaces And Catalog Revisions

```yaml
plan_unit_id: UCC-169
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The controls this unit covers add source surfaces, not commands; the redesign's nine new command
  identities are registered in UCC-171 and UCC-174 (CDRY-022, CDRY-023). New surfaces: run_dock,
  wonderer_workspace, memory_proposal_line, bsd_note, schedule_sheet, scheduled_message_card,
  schedule_manager, memory_sheet, message_files_row, revert_confirm and chat_header. Existing
  surfaces join more rows: mode_menu, natural_language and plan_schedule produce
  cmd.collaboration.configure; wand produces cmd.chat.teach.open_memory and cmd.chat.teach.capture;
  brainstorm_card and run_dock produce cmd.questionnaire.resume for BrainStorm "Answer now", disabled
  with command_not_registered while the family is candidate_not_registered; workflow_card alone
  produces cmd.runtime.approve, cmd.runtime.decline and cmd.permissions.review_request; review and
  Chat Room cards and panels produce cmd.chat.todos.open. memory_sheet produces
  cmd.chat.memory.preview_capsule, a preview computation with no persisted domain event.
  cmd.chat.plan.build_with_crew is produced by the Crew sheet in Build With Crew mode and never decomposes into cmd.collaboration.start.
  cmd.chat.revert is dispatched only by revert_confirm, whose expected_turn_manifest_sha256 is the
  hash of the manifest it shows; there is no kept or conflict-dismissal outcome. chat_header produces
  cmd.chat.thread.regenerate_title, whose label UCC-173 sets. cmd.chat.teach.capture carries mode new
  or correct; the Teach sheet saves through cmd.chat.teach.confirm and closes through
  cmd.chat.teach.cancel. Every added surface takes the UCC-156 availability and disabled-reason
  obligation.
gui_related: true
gui_classification_reason: "Names the visible sheets, cards, dock lines and header that produce existing commands, and their disabled states."
split_recommended: false
depends_on: [UCC-156, ACD-476, ACD-477, ACD-478, ACD-479, CWR-020, CWR-031, BSD-030, SQR-012, SQR-013, AMS-047]
unblocks: [WM-062, CDRY-021, UCC-170, UCC-171, UCC-172, CS-086]
acceptance_criteria:
  - "Each surface in the two tables appears in the production wiring surface list of every row it names, and in no other row because of this addendum."
  - "run_dock never produces cmd.runtime.approve, cmd.runtime.decline or cmd.permissions.review_request."
  - "Build With Crew mode dispatches cmd.chat.plan.build_with_crew and never cmd.collaboration.start."
  - "cmd.chat.revert has no kept outcome and is dispatched only from revert_confirm."
  - "BrainStorm Answer now renders disabled with command_not_registered while the questionnaire family is candidate_not_registered."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: wand_module_surface_drift
reasoning_tier: high
context_scope: assistant_wand_module_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
  - Plans/Commands_System.md
node_compile_hint:
  mode: static_command_catalog_surfaces
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 7.4, 7.12, 8.1, 8.4, 8.10, 8.12, 8.14, 8.15"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 lines B-CMD-03, B-CMD-04, B-ACD-12"
  - "Plans/ledgers/v2/pldg-20260927-006-wand-command-census/records/design_atoms.jsonl"
preserved_exact_tokens:
  - "run_dock"
  - "wonderer_workspace"
  - "memory_proposal_line"
  - "bsd_note"
  - "schedule_sheet"
  - "scheduled_message_card"
  - "schedule_manager"
  - "memory_sheet"
  - "message_files_row"
  - "revert_confirm"
  - "chat_header"
  - "brainstorm_card"
  - "workflow_card"
  - "cmd.questionnaire.resume"
  - "command_not_registered"
  - "candidate_not_registered"
  - "cmd.chat.plan.build_with_crew"
  - "cmd.collaboration.start"
  - "cmd.chat.revert"
  - "expected_turn_manifest_sha256"
  - "cmd.chat.thread.regenerate_title"
  - "cmd.chat.teach.capture"
  - "cmd.chat.teach.open_memory"
  - "cmd.chat.memory.preview_capsule"
  - "cmd.chat.todos.open"
  - "cmd.runtime.approve"
  - "cmd.runtime.decline"
negative_constraints:
  - "Do not mint a command for opening a sheet, the Revert confirm sheet, or a view toggle."
  - "Do not take a permission decision from run_dock."
  - "Do not add a kept or conflict-dismissal outcome to cmd.chat.revert."
  - "This unit does not change the Crew Auto open-config surfaces, the Crew Auto set payload, the Regenerate Title label, the Teach lock field, what /teach opens, or the ELI5, Teach document, Teach receipt and Crew Auto receipt surfaces; UCC-172, UCC-173 and UCC-175 carry the owner's answers and the lead's rulings on these."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-476, ContractName:Plans/assistant-chat-design.md#ACD-478, ContractName:Plans/Collaborative_Workflows.md#MODAL-013, ContractName:Plans/Commands_System.md#CDRY-021, ContractName:Plans/Wiring_Matrix.md#WM-062

### Wand module commands after the owner's answers (2026-09-27)

Jared answered the wand-module decision cards on 2026-09-27, and Decision_Log records the answers as DL-110 to DL-134. This part records what those answers settle for the catalog:
- UCC-170 is the census of every redesigned control.
- UCC-171 adds the seven new command rows.
- UCC-172 covers the surfaces and row revisions that were waiting on the answers.
- UCC-173 sets the labels.

Four cards were still open when this part was first written. Three were not answered: p11, Crew Auto's note in the chat; p12, a "Pause all automations" switch; and p14, live text in helper lines. One, p08 (ELI5, DL-126), was answered with a question instead of a choice.

In the closure wave on 2026-09-27, three of them were settled. The owner confirmed the resolution of DL-126 (ELI5). He approved DL-136, a project-wide automation pause, and DL-137, live text in helper lines. UCC-174 and UCC-175 compile the ELI5 and pause parts for this catalog, and the census below is amended to match. DL-137 is presentation of the existing reply stream, so it adds no command. Card p11 was answered too, as DL-135 (option A: the note in the chat is kept and worded for the project), and UCC-172 adds its `crew_auto_receipt` surface. The lead's rulings of 2026-09-27 settle the two follow-ups the census still held Open: DL-120 (a chat's Crew Auto check is that chat's override of the project value, and "Allow Crews in this chat" is retired) and DL-112 (a Chat Room message sent mid-round is queued, and Send now steers the round without interrupting it). No control stays Open below.

### UCC-170 - Wand Module Command Census

The census classifies the redesign's product controls: the sheets, cards, dock lines, run view, header, managers and documents of the redesigned Assistant wand modules. The redesign's commands audit counts 197 controls. 188 of them are product controls; the other nine are concept demo controls, which stay `CONCEPT_DEMO_ONLY` under CS-079 and are not listed here. The owner's closure answers add three product controls that the audit did not count. Two come from DL-126: the ELI5 dot by the message box, and "Explain this reply simply" on a finished reply. The third comes from DL-136: the "Pause all automations" switch, which the design had shown read-only. The census therefore lists 191 controls.

Each control has exactly one of these dispositions:
- **Command**: it dispatches the named row unchanged.
- **Command, revised**: it dispatches the named row, with the revision in the named unit.
- **New**: it dispatches a row that UCC-171 or UCC-174 adds.
- **Draft**: it is a field of the request that its sheet's primary sends (CDRY-021).
- **View**: it is view state, with no command (CDRY-021).
- **Settings**: it writes a Settings value. The value, its key and its transaction producer belong to Settings, outside this compile.
- **No producer**: the design drew it, but canon gives it no producer, because a decision retires it or the product does not draw it. The row names which.
- **Open**: it waits on an unanswered card or a follow-up, and the row names which. After DL-135 and the lead's rulings on DL-112 and DL-120, no control is Open.

A row may list several controls, and then it gives each its disposition. The Surfaces column says where the control sits. The only producer surfaces a row gains are those named in UCC-169, UCC-171, UCC-172, UCC-174 and UCC-175.

**Foundation (7)**

| Control | Disposition | Surfaces |
|---|---|---|
| Click outside a sheet | View. It does whatever the sheet's close does. On the Teach sheet the close is Command, `cmd.chat.teach.cancel` (see Teach). | every sheet |
| Stepper − and + | Draft | every sheet |
| Advanced ›, and Back to setup | View | every sheet |
| Dock line Show or Review | On a run: Command, revised, `cmd.collaboration.open` with target card (CWR-031). On a scheduled message: View. | `run_dock` |
| Ctrl/Cmd+Enter in a sheet | Command: it dispatches the same row as the primary it presses (FinalGUISpec F3-568). | the sheet |
| Escape | View, the same as clicking outside the sheet; on the Teach sheet it is `cmd.chat.teach.cancel`. It never stops the agent. | the sheet |
| Hover light, previews, autofocus | View | — |

**Shared collaboration sheet (22)**

| Control | Disposition | Surfaces |
|---|---|---|
| Wand › Crew…, Chat Room… | Command, `cmd.collaboration.configure` | `multi_agent_menu` |
| Mode menu Review (Single Agent, Multi-Pass) and Deep Plan › BrainStorm | Command, `cmd.collaboration.configure` | `mode_menu` |
| Review and BrainStorm rows in the wand | No producer (DL-119). Review opens from the Mode menu and BrainStorm from Deep Plan, and `wand` never produces `cmd.collaboration.configure` for these two kinds. | — |
| A natural-language request that opens the BrainStorm sheet | Command, `cmd.collaboration.configure` | `natural_language` |
| Job, card title, "Anything specific?" | Draft (`CollaborationStartRequest`) | `workflow_modal` |
| Add a helper, Copy, Remove | Draft | `workflow_modal` |
| Bring back after Remove | View. It restores the draft and is never an undo command. | `workflow_modal` |
| Model and Persona of each row, and the moderator, synthesis and specialist rows | Draft | `workflow_modal` |
| Start from a team | Draft | `workflow_modal` |
| Choice fields: Coordinator, who decides who does what, who talks when, research depth, review approach, what to review | Draft | `workflow_modal` |
| Steppers: working at the same time, rounds, rounds of debate, reviewers | Draft | `workflow_modal` |
| Add specialists: Wonderer, Grill Me | Draft | `workflow_modal` |
| Advanced page rows | Draft | `workflow_modal` |
| Save as default | Settings. The label is set by UCC-173 (DL-134). | `workflow_modal` |
| Cancel, ×, Escape, scrim | View | `workflow_modal` |
| Start {Kind} | Command, `cmd.collaboration.start` | `workflow_modal` |
| Start in Build With Crew mode | Command, `cmd.chat.plan.build_with_crew`, never `cmd.collaboration.start` | `crew_modal` |
| Use this Crew for the build (scheduled mode) | Draft of the Build At request, which `cmd.chat.plan.schedule_build` commits | `plan_schedule` |
| Save changes on a waiting or paused run | Command, revised, `cmd.collaboration.reconfigure` (CWR-031) | `workflow_modal` |
| Run again with changes; Run Another Review | Command. Run again with changes is `cmd.collaboration.start` with a definition seeded from the prior run; Run Another Review is `cmd.review.run_again`. | `workflow_modal` |
| Fix on a refusal | View (it opens that row's picker) | `workflow_modal` |
| "Settings…" in the Crew sheet when Crew Auto is off | Command, revised, `cmd.chat.crew_auto.open_config` (UCC-172) | `workflow_modal` |

**Run card, dock and Activity (21)**

| Control | Disposition | Surfaces |
|---|---|---|
| Expand and collapse | View | `workflow_card` |
| More | View | `workflow_card` |
| Open Panel | Command, revised, `cmd.collaboration.open` with target run_view (CWR-031) | `workflow_card` |
| Message on a live run | Command, `cmd.chat.composer.destination.set`. The later Send is `cmd.collaboration.message`. | `workflow_card` |
| Message on a finished run | Command, revised. It renders disabled with the finished-run reason (CWR-031). | `workflow_card` |
| Pause, Resume | Command, `cmd.collaboration.pause`, `cmd.collaboration.resume` | `workflow_card` |
| Cancel {Kind}… and its in-place confirmation | Command, `cmd.collaboration.cancel`. Keep going is View. | `workflow_card` |
| Change setup… | Command, `cmd.collaboration.configure`. Save changes commits it. | `workflow_card` |
| Run again with changes… | Command, the same as Run again with changes in the sheet | `workflow_card` |
| Download transcript | Command, revised, `cmd.collaboration.export` with content_kind transcript (CWR-031). It renders disabled with its reason until wired (UCC-156). | `workflow_card`, `workflow_panel` |
| Technical details | View | `workflow_card` |
| A lane or team row; "+N more · Show all" | Command, `cmd.collaboration.participant.open`. Show all is View. | `workflow_card`, `workflow_panel` |
| Needs-you decision: Allow once, Don't allow, Details | Command, `cmd.runtime.approve`, `cmd.runtime.decline`, `cmd.permissions.review_request` | `workflow_card` only |
| Helper timed out: Retry, Use another model, Continue without it | Command, revised, `cmd.collaboration.reconfigure` (retry, replacement, waiver) | `workflow_card` |
| Coordinator stopped: Retry, Pick a new Coordinator, Cancel Crew. Moderator stopped: Pick a new Moderator, End discussion. | Command, revised, `cmd.collaboration.reconfigure`. Cancel Crew is `cmd.collaboration.cancel`, and End discussion is New, `cmd.chat_room.end`. The verb is "Retry" (DL-118). | `workflow_card` |
| Limit reached: Run again with changes…, Open Panel | Command, the same as those controls above | `workflow_card` |
| Answer now | Command, `cmd.questionnaire.resume`. It renders disabled with `command_not_registered` while the family is `candidate_not_registered`. | `run_dock`, `brainstorm_card` |
| Activity bar chip of a collaboration kind | Command, revised, `cmd.collaboration.open` with target card | `activity` |
| Activity hover row | Command, revised, `cmd.collaboration.open` with target activity_detail | `activity` |
| Activity Detail: team rows, Open Panel, Message | Command, the same as a lane, Open Panel and Message | `activity` |
| Pointer to the report beside the chat | View | `workflow_card` |

**Run view in the editor pane (7)**

| Control | Disposition | Surfaces |
|---|---|---|
| Tabs | View. A deep link to a tab is `cmd.collaboration.open` with focus tab. | `workflow_panel` |
| A team row or speaker name; Back to everyone | Command, `cmd.collaboration.participant.open`. Back to everyone is View. | `workflow_panel`, `chat_room_panel` |
| Message a helper | Command, `cmd.chat.composer.destination.set` with participant_id | `workflow_panel` |
| Pause, Resume in the view head | Command, `cmd.collaboration.pause`, `cmd.collaboration.resume` | `workflow_panel` |
| Timeline filter | View | `workflow_panel` |
| Closing the run view tab | Command, `cmd.editor.close_tab` | editor |
| Where the run view opens | Command, revised. The run_view target of `cmd.collaboration.open` is the editor document of CWR-020. | — |

**Crew (3)**

| Control | Disposition | Surfaces |
|---|---|---|
| Download a result | Command, revised, `cmd.collaboration.export` with content_kind result_artifact | `workflow_card`, `workflow_panel` |
| Run another Crew | Command, the same as Run again with changes | `workflow_panel` |
| Disclosures, raw data, what the Crew started from | View | `workflow_panel` |

**Crew Auto (9)**

| Control | Disposition | Surfaces |
|---|---|---|
| Wand row "Crew Auto settings…" | Command, `cmd.chat.crew_auto.open_config` (DL-119, UCC-172). "Manage Defaults…" stays as it is. | `multi_agent_menu` |
| Crew Auto receipt "Change" | Command, revised, `cmd.chat.crew_auto.open_config` from the one-line note "Crew Auto is on for this project" (DL-135, CWR-038, UCC-172) | `crew_auto_receipt` |
| How it would decide (preview verdicts) | View. It is the deterministic evaluator's preview, with no provider call (CWR-021). | `crew_auto_modal` |
| Criteria and team fields | Draft | `crew_auto_modal` |
| Turn on Crew Auto, Save Crew Auto rules | Command, revised, `cmd.chat.crew_auto.set` with scope project. One request carries the rules and the team (DL-120, CWR-038, UCC-172). | `crew_auto_modal` |
| Back to Crew; Escape from a swapped sheet | View | `crew_auto_modal` |
| Crew Auto check in the wand | Command, revised, `cmd.chat.crew_auto.set` with scope thread. It sets only this chat's override of the project value and never opens the sheet first (DL-120, CWR-038, FinalGUISpec F3-578, UCC-172). | `multi_agent_menu` |
| Allow Crews in this chat | No producer. DL-120 retires it into the Crew Auto check, which is the chat's only per-chat Crew control. | — |
| Wand row "Build With Crew…" | View. It opens the Crew sheet in Build With Crew mode, whose Start is `cmd.chat.plan.build_with_crew`. | `wand` |

**Chat Room (11)**

| Control | Disposition | Surfaces |
|---|---|---|
| Ask Everyone | Command, `cmd.chat_room.next_round` (round 1) | `chat_room_card`, `chat_room_panel` |
| Next Round, Summarize Now | Command, `cmd.chat_room.next_round`, `cmd.chat_room.summarize` | `chat_room_card`, `chat_room_panel` |
| End discussion | New, `cmd.chat_room.end` (UCC-171) | `chat_room_card`, `chat_room_panel` |
| Member never joined: Replace helper, Continue without | Command, revised, `cmd.collaboration.reconfigure` (replacement, waiver) | `chat_room_card` |
| Add 2 more rounds | Command, revised, `cmd.collaboration.reconfigure` with added rounds | `chat_room_card` |
| "or send this to the assistant instead" | Command, `cmd.chat.composer.destination.clear` | `composer` |
| Promote to To-Do, Plan, Goal | Command, `cmd.chat_room.promote_to_todo`, `cmd.chat_room.promote_to_plan`, `cmd.chat_room.promote_to_goal` | `chat_room_card`, `chat_room_panel` |
| "To-Do created · Open", "Promoted to Plan · Open" | Command, `cmd.chat.todos.open`; for a Plan, `cmd.nav.open_subject` | `chat_room_card`, `chat_room_panel` |
| Selecting a message; a speaker name | View. A speaker name works like a team row. | `chat_room_panel` |
| A message sent while a round runs | Command, revised, `cmd.collaboration.message` with `delivery_mode`. By default it is queue: the message reaches the room when the next round starts. Its Send now choice is steer: the message goes into the round in progress without interrupting it (CWR-024, DL-112). No command is added. | `composer` |
| Download transcript (.md) | Command, revised, `cmd.collaboration.export` with content_kind transcript and format md | `chat_room_panel` |

**BrainStorm (12)**

| Control | Disposition | Surfaces |
|---|---|---|
| Must-haves | Draft (the BrainStorm constraints) | `workflow_modal` |
| "The team has N questions" › Answer now | Command, the same as Answer now above | `brainstorm_card`, `run_dock` |
| "Checking facts needs a tool": Allow, Skip | Command, `cmd.runtime.approve`, `cmd.runtime.decline` | `brainstorm_card` |
| Tie: Let the Coordinator decide, One more debate round, Cancel | Command, revised, `cmd.brainstorm.synthesize_plan` with tie_resolution coordinator (CWR-031). The other two are `cmd.brainstorm.next_round` and `cmd.collaboration.cancel`. | `brainstorm_card` |
| Write the plan; One more debate round | Command, `cmd.brainstorm.synthesize_plan` (label from UCC-173) and `cmd.brainstorm.next_round` | `brainstorm_card`, `brainstorm_panel`, `wonderer_workspace` |
| Open Plan | Command, `cmd.nav.open_subject` | `brainstorm_card`, `brainstorm_panel` |
| Allow more questions mid-run (Grill Me) | Command, revised, `cmd.collaboration.reconfigure`, adding Grill Me (CWR-031) | `brainstorm_panel` |
| Formatted, Plain text | View (CDRY-021) | `brainstorm_panel` |
| Evidence links; Back to how they decided | Command, `cmd.nav.open_subject`. Back to how they decided is `cmd.collaboration.open` with focus tab. | `brainstorm_panel` |
| Wonderer "Check it" | New, `cmd.brainstorm.research_lead` (UCC-171) | `wonderer_workspace`, `brainstorm_panel` |
| Wonderer workspace Pause, Resume | Command, `cmd.collaboration.pause`, `cmd.collaboration.resume` | `wonderer_workspace` |
| Pitch timed out: Retry, Use another model, Continue without it | Command, revised, the same as a helper that timed out | `brainstorm_card` |

**Review (12)**

| Control | Disposition | Surfaces |
|---|---|---|
| What to review; "Review the new version" or keep the earlier one | Draft (the review target and its refresh choice) | `workflow_modal` |
| Focus checks; "Also give them" | Draft (the review focus) | `workflow_modal` |
| Ticking a finding | Draft (the selection that Create To-Dos and Send Findings use) | `review_card`, `review_panel` |
| Create To-Dos | Command, `cmd.review.create_todos` | `review_card`, `review_panel` |
| Send Findings To Agent | Command, revised, `cmd.review.send_findings_to_agent`. It fills the message box and never sends (UCC-172, DL-125). | `review_card`, `review_panel` |
| Open To-Dos; "To-Do created · Open" | Command, `cmd.chat.todos.open` | `review_card`, `review_panel` |
| "1 more in the report"; Open Panel on a report | Command, revised, `cmd.collaboration.open` with target run_view and focus finding_id | `review_card` |
| Report Formatted or Plain text; Export | The view switch is View. Export is Command, revised, `cmd.collaboration.export` with content_kind report. | `review_panel` |
| Opening evidence; Back to the report | Command, `cmd.nav.open_subject`. Back to the report is `cmd.collaboration.open`. | `review_panel` |
| Partial: Retry, Continue with the rest, Cancel | Command, revised, `cmd.collaboration.reconfigure` (retry, waiver). Cancel is `cmd.collaboration.cancel`. The verb is "Retry" (DL-118). | `review_card` |
| Target changed: Review the new version, Finish on the old snapshot | Command, `cmd.review.run_again`. Finish on the old snapshot is `cmd.collaboration.reconfigure` with accept_stale_target (CWR-031). "snapshot" is the display word for the frozen target pack (UCC-173). | `review_card` |
| Reviewer stepper and strategy | Draft | `workflow_modal` |

**Back Seat Driver (15)**

| Control | Disposition | Surfaces |
|---|---|---|
| Wand sidecar Off, Auto, On | Command, `cmd.bsd.set` | `wand` |
| Configure… (wand, Context Details, Change model on the safety line) | View (it opens the sheet) | `wand`, `context`, `bsd_note` |
| Sheet mode switch | Draft. Save commits it through `cmd.bsd.set`. | the sheet |
| Sheet model, Persona, watchfulness, catch-up delay, quiet period, note retention, tidy threshold, run-in-progress policy | Draft, committed by `cmd.bsd.configure` | the sheet |
| Where it watches (stages); Reset | Draft, committed by `cmd.bsd.workflow.configure`. Reset is View. | the sheet |
| Save, Save and refresh advisor | Command. It sends `cmd.bsd.set` when the mode changed, then `cmd.bsd.configure`, then `cmd.bsd.workflow.configure` when the stages changed. Each keeps its own transaction boundary (CS-079). | the sheet |
| Inspect local usage; Advisor transcript | Command, `cmd.bsd.open_usage` (which navigates to Usage) and `cmd.bsd.open_transcript` | `context` |
| Advisor note Why? | Command, `cmd.bsd.finding.open` | `bsd_note` |
| Advisor note Dismiss; Dismiss in Context Details | New, `cmd.bsd.finding.dismiss` (UCC-171) | `bsd_note`, `bsd_details` |
| Aside Why? (expands in place) | View | `bsd_note` |
| Don't wait | New, `cmd.bsd.catch_up.release` (UCC-171) | `bsd_note` |
| Failure line Details | Command, `cmd.chat.open_thread_context_details` with focus on Back Seat Driver | `bsd_note` |
| Safety pause Resume, or Retry when quarantined | Command, `cmd.bsd.assignment.resume`, or `cmd.bsd.assignment.retry` | `bsd_note` |
| Pause, Resume, Stop advisor | Command, `cmd.bsd.assignment.pause`, `cmd.bsd.assignment.resume`, `cmd.bsd.assignment.stop` | `bsd_details` |
| Ambient eye by the composer | View | `composer` |

**Scheduling (26)**

| Control | Disposition | Surfaces |
|---|---|---|
| Wand "Schedule Message…" | View (it opens the sheet) | `wand` |
| Presets | Draft | `schedule_sheet` |
| Date, time, time zone, missed policy, grace, route model | Draft | `schedule_sheet` |
| Technical details | View | `schedule_sheet` |
| See all scheduled | View | `schedule_sheet` |
| "Schedule for {time}" | Command, revised, `cmd.chat.schedule_message` (SQR-013) | `schedule_sheet` |
| Done on the confirmation | View | `schedule_sheet` |
| Edit; Edit and send; Reschedule | Command, revised, `cmd.chat.schedule_message.update` (SQR-013) | `scheduled_message_card` |
| Cancel a scheduled message | Command, `cmd.chat.schedule_message.cancel` | `scheduled_message_card`, `schedule_manager` |
| Send now on a held message | Command, revised, `cmd.chat.schedule_message.update` with reschedule_to now | `scheduled_message_card` |
| Details; All scheduled | View | `scheduled_message_card` |
| Go to message; Open message | Command, `cmd.chat.open_thread` with route_target message | `scheduled_message_card`, `schedule_manager` |
| Dock "Coming up" or "needs you" › Show | View | `run_dock` |
| Plan card "Build At…" | View | `plan_card` |
| Build At fields | Draft | `plan_schedule` |
| Set up the Crew… | Command, `cmd.collaboration.configure` | `plan_schedule` |
| "Schedule {window}" | Command, revised, `cmd.chat.plan.schedule_build` carrying the window (SQR-013) | `plan_schedule` |
| Use V{n} | Command, `cmd.chat.plan.schedule_build` against that version's hash, as an explicit reschedule | `plan_card`, `schedule_manager` |
| Cancel schedule | Command, `cmd.execution_window.cancel` by schedule_id | `plan_card`, `schedule_manager` |
| Edit a build schedule | Command, `cmd.execution_window.update` | `schedule_manager`, `plan_card` |
| Plan schedule line; overnight receipt Open | View | `plan_card` |
| Manager tabs, search, status, sort, focused view, all build windows | View | `schedule_manager` |
| Manager rows | Command, the same as the matching card and Plan card controls | `schedule_manager` |
| "Pause all automations" switch in Resume & Safety Policy | New, `cmd.runtime.automation_pause.set` with paused true (UCC-174, DL-136). Turning the switch off while paused is the same as Turn back on. | `schedule_manager` |
| Turn back on (automations paused by you) | New, `cmd.runtime.automation_pause.set` with paused false (UCC-174, DL-136). This and the switch are the only controls that clear the pause. | `schedule_manager` |
| Done in the manager | View | `schedule_manager` |

**Memory (9)**

| Control | Disposition | Surfaces |
|---|---|---|
| Wand "Memory…"; Review on the proposal line | Command, `cmd.chat.teach.open_memory` | `wand`, `memory_proposal_line` |
| Tabs, filter, selecting a row | View | `memory_sheet` |
| "See what your next message will include" | Command, `cmd.chat.memory.preview_capsule` | `memory_sheet` |
| Verify, Pin or Unpin, Discard | Command, `cmd.chat.memory.verify`, `cmd.chat.memory.pin` (pinned), `cmd.chat.memory.discard` | `memory_sheet` |
| Keep my rule; Edit my rule… | Command, `cmd.chat.memory.discard`. Edit my rule… is `cmd.chat.teach.capture` with mode correct. | `memory_sheet` |
| "Also keep notes that aren't verified yet" | Command, `cmd.chat.memory.toggle_auto_save_unverified` | `memory_sheet` |
| Export | New, `cmd.chat.memory.export` (UCC-171) | `memory_sheet` |
| Editing a note and its half-life (not drawn) | No producer. `cmd.chat.memory.edit` has no control in the redesign. This is recorded, not filled here. | — |
| "Noted" and "Verified" in a reply's meta row | View | transcript |

**Teach (11)**

| Control | Disposition | Surfaces |
|---|---|---|
| Opening Teach: the wand's "Teach…", /teach, natural language, "Save as a rule…", "Teach a rule" | Command, revised, `cmd.chat.teach.capture`. Every entry opens the Teach sheet (DL-127, UCC-172). | `slash`, `natural_language`, `message_menu`, `wand`, `teach_document` |
| Rule text, examples, scope, "safe for my other projects", Locked, Replace or Keep both | Draft (`TeachConfirmRequest`, including locked, UCC-172) | `teach_capture` |
| Save rule; Save and replace; Save as version 2 | Command, `cmd.chat.teach.confirm` | `teach_capture` |
| Cancel, ×, Escape, scrim | Command, `cmd.chat.teach.cancel` | `teach_capture` |
| Receipt "Rule saved · View" | Command, `cmd.chat.teach.open_memory` | `teach_receipt` |
| "See what your next message will include" in the taught-rules document | Command, `cmd.chat.memory.preview_capsule` | `teach_document` |
| Edit a rule | Command, `cmd.chat.teach.capture` with mode correct | `teach_document`, `memory_sheet` |
| Lock, Unlock | New, `cmd.chat.teach.set_lock` (UCC-171) | `teach_document` |
| Turn off, and its confirmation "Keep it" or "Turn off" | New, `cmd.chat.teach.revoke` (UCC-171). Keep it is View. | `teach_document`, `memory_sheet` |
| "From your message"; Open the original message | View. Open the original message is `cmd.chat.open_thread` with route_target message. | `teach_document` |
| Export | New, `cmd.chat.memory.export`, one export for memory notes and taught rules (UCC-171) | `teach_document` |

**Revert Last Agent Edit (10)**

| Control | Disposition | Surfaces |
|---|---|---|
| Revert on the files row, the wand row or the message menu | View (it opens the confirm sheet) | `message_files_row`, `wand`, `message_menu` |
| Show the change | View | `revert_confirm` |
| See what's blocking it | View (it opens the Revert document at that file) | `revert_confirm` |
| Cancel, ×, Escape | View | `revert_confirm` |
| "Revert {n} files" | Command, `cmd.chat.revert` | `revert_confirm` |
| Leave my files as they are | View. It writes no outcome record. | transcript |
| Retry after a conflict | Command. It reopens the confirm sheet, whose primary sends `cmd.chat.revert` with a new idempotency key. The verb is "Retry", not "Check again" (DL-118). | transcript |
| See what happened | Command, `cmd.nav.open_subject` | transcript |
| Recover when a Revert needs recovery | Command, the runtime recovery command named by `allowed_action_ids[]`. The verb is "Recover", not "Open recovery" (DL-118). | transcript |
| Switch in the Revert document | View | Revert document |

**ELI5 (9)**

| Control | Disposition | Surfaces |
|---|---|---|
| The wand's ELI5 row | View. It opens the ELI5 sheet (UCC-175, DL-126). | `wand` |
| Standard or Simple | Command, revised, `cmd.chat.eli5.set` with off or on (UCC-175) | `eli5_sheet` |
| "Follow my usual setting" | Command, revised, `cmd.chat.eli5.set` with inherit. It deletes this chat's override, so the chat follows the project default (UCC-175). | `eli5_sheet` |
| "How it's decided": All chats | Settings: the app default, `general.interaction.eli5-default` | `eli5_sheet` |
| "How it's decided": Chats in this project | Settings: the project default. It needs a project scope on `general.interaction.eli5-default`, which is a Settings follow-up outside this compile (UCC-175). | `eli5_sheet` |
| "How it's decided": This chat | Command, revised, `cmd.chat.eli5.set`, the same as Standard or Simple | `eli5_sheet` |
| The disclosure; Done | View | `eli5_sheet` |
| The ELI5 dot by the message box | Command, revised, `cmd.chat.eli5.set` with on or off. It is the one-click switch for this chat (UCC-175). | `composer` |
| "Explain this reply simply" on a finished reply | New, `cmd.chat.eli5.explain_reply` (UCC-174). It writes one extra reply, and it is disabled while that reply is still streaming. | `message_chrome` |

**New chat defaults and titles (7)**

| Control | Disposition | Surfaces |
|---|---|---|
| Opening New chat defaults | Settings | `wand` |
| Explain simply in new chats | Settings | — |
| Thought Stream | Settings | — |
| Name new chats | Settings | — |
| "Name it for me" in the thread menu and the header | Command, `cmd.chat.thread.regenerate_title` (label from UCC-173) | `thread_menu`, `chat_header` |
| Rename | Command, `cmd.chat.rename` | `thread_menu` |
| "Choose another way" on the header warning | Settings (it opens New chat defaults) | `chat_header` |

```yaml
plan_unit_id: UCC-170
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The wand-module command census classifies all 191 product controls of the redesigned Assistant wand
  modules: the commands audit's 197 less nine CONCEPT_DEMO_ONLY demo controls, plus the ELI5 dot,
  "Explain this reply simply" and the "Pause all automations" switch, which the closure answers add
  (DL-126, DL-136). Each control is
  exactly one of Command (an existing row), Command revised (an existing row with a named revision),
  New (a UCC-171 or UCC-174 row), Draft, View, Settings (outside this compile), No producer (retired
  by a named decision, or not drawn in the product) or Open (a named unanswered card or follow-up;
  none remains). Review and BrainStorm have no wand producer of cmd.collaboration.configure (DL-119).
  End discussion is cmd.chat_room.end; advisor-note Dismiss is cmd.bsd.finding.dismiss; Don't wait is
  cmd.bsd.catch_up.release; Turn off and Lock are cmd.chat.teach.revoke and cmd.chat.teach.set_lock;
  memory and taught-rule Export is cmd.chat.memory.export; the Wonderer's Check it is
  cmd.brainstorm.research_lead (DL-130). Send Findings To Agent is cmd.review.send_findings_to_agent
  and fills the message box (DL-125). Every
  Teach entry opens the Teach sheet (DL-127). Recovery buttons use Retry and Recover (DL-118). The
  ELI5 sheet's choices and the ELI5 dot are cmd.chat.eli5.set with on, off or inherit from eli5_sheet
  and composer; the wand's ELI5 row only opens the sheet; the sheet's All chats and project levels are
  Settings on general.interaction.eli5-default; and "Explain this reply simply" is cmd.chat.eli5.explain_reply (DL-126). The "Pause all
  automations" switch and Turn back on are cmd.runtime.automation_pause.set with paused true and
  false (DL-136). The Crew Auto receipt's Change is cmd.chat.crew_auto.open_config from
  crew_auto_receipt (DL-135). The Crew Auto sheet's primary is cmd.chat.crew_auto.set with scope
  project; the chat's Crew Auto check is cmd.chat.crew_auto.set with scope thread and never opens the
  sheet first; Allow Crews in this chat is retired into that check (DL-120, CWR-038). A Chat Room
  message sent mid-round is cmd.collaboration.message with delivery_mode queue, or steer for Send now
  (DL-112, CWR-024). No control is Open.
gui_related: true
gui_classification_reason: "Classifies every visible control of the redesigned sheets, cards, dock, run view, header and managers."
split_recommended: false
depends_on: [UCC-169, UCC-171, UCC-172, UCC-173, UCC-174, UCC-175, CDRY-021, CWR-024, CWR-031, CWR-038, SQR-013, CS-079]
unblocks: [CDRY-022, CDRY-023, WM-063, WM-064]
acceptance_criteria:
  - "Every control in the census has exactly one disposition, and no Draft or View control has a catalog row or production wiring entry."
  - "Every New control dispatches a row of UCC-171 or UCC-174 and nothing else."
  - "The only controls that dispatch cmd.runtime.automation_pause.set with paused false are Turn back on and the switch itself, both in schedule_manager."
  - "No Open control is given a command, surface or label before its card or follow-up is answered."
  - "No wand row produces cmd.collaboration.configure for Review or BrainStorm."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: wand_module_command_census_drift
reasoning_tier: high
context_scope: assistant_wand_module_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: static_command_census
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 4.6, 6.7, 7, 8.0-8.14"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/commands.md sha256:1f1544580d18467a03931d8e208fbe24a253e3c4b97f14cdcd5b4f1acf7e2c6f section 2"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 line B-CMD-01"
  - "Plans/Decision_Log.md#DL-112, #DL-118, #DL-119, #DL-120, #DL-125, #DL-126, #DL-127, #DL-130, #DL-134, #DL-135, #DL-136"
  - "Plans/ledgers/v2/pldg-20260927-006-wand-command-census/records/design_atoms.jsonl"
preserved_exact_tokens:
  - "CONCEPT_DEMO_ONLY"
  - "crew_auto_receipt"
  - "delivery_mode"
  - "cmd.chat_room.end"
  - "cmd.bsd.finding.dismiss"
  - "cmd.bsd.catch_up.release"
  - "cmd.chat.teach.revoke"
  - "cmd.chat.teach.set_lock"
  - "cmd.chat.memory.export"
  - "cmd.brainstorm.research_lead"
  - "cmd.collaboration.configure"
  - "cmd.review.send_findings_to_agent"
  - "cmd.chat.eli5.set"
  - "cmd.chat.eli5.explain_reply"
  - "cmd.runtime.automation_pause.set"
  - "eli5_sheet"
  - "Explain this reply simply"
  - "general.interaction.eli5-default"
negative_constraints:
  - "Do not give an Open control a command, surface or label before its card or follow-up is answered."
  - "Do not list or register the concept demo controls."
  - "Do not treat the census's Surfaces column as adding producer surfaces beyond UCC-169, UCC-171, UCC-172, UCC-174 and UCC-175."
  - "Do not give the wand's ELI5 row a command; it only opens the ELI5 sheet."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-169, ContractName:Plans/Commands_System.md#CDRY-021, ContractName:Plans/Commands_System.md#CDRY-022, ContractName:Plans/Commands_System.md#CDRY-023, ContractName:Plans/Decision_Log.md#DL-126, ContractName:Plans/Decision_Log.md#DL-130, ContractName:Plans/Decision_Log.md#DL-136

### UCC-171 - Wand Module New Command Rows

DL-130 adds all seven new commands. The rows below follow the 2026-09-03 registration columns. An alias census ran over all live `Plans/**` at `origin/main` 3c132c7f3f before registration (CDRY-001). It found no existing command with any of these seven IDs, and no existing row with the same effect under another name.

Every row is a canonical owner request with one named sole future target. None of them asserts that a native dispatcher, handler, runtime, receipt or rendered control exists. Each row starts `handler_unavailable`, and its GUI controls stay disabled with `command_not_registered` until the central command contract layer, Event Authority, storage registration and production wiring close for that row. No page-local handler, alias or toast may simulate success. Mutating rows apply the §2.0B projection-freshness gating clause before dispatch, read their owner availability and exact disabled reason from their state selectors, give identical keyboard and pointer behaviour, and return to the initiating route and focus. The owning documents define what each command does. This catalog registers the identity, the contract names and the producers.

| Command ID | Label | Description | Preconditions | command_kind | Owner | Request → Result | Sole future target |
|---|---|---|---|---|---|---|---|
| `cmd.chat_room.end` | End Discussion | Ends a Chat Room: no further rounds or messages are taken, and the run settles `completed`, not `cancelled`. Promoting existing messages stays allowed. | `chat_room_run_present && run_status in {running, waiting, paused}` | `domain_action` | `Plans/Collaborative_Workflows.md` | `ChatRoomEndRequest` → `ChatRoomEndResult` | `handlers::collaboration::chat_room_end` |
| `cmd.brainstorm.research_lead` | Check It | Asks the BrainStorm research step to check one Wonderer lead, which then becomes checked or set aside with its evidence. | `brainstorm_run_present && wonderer_lead_present && run_status in {running, waiting}` | `domain_action` | `Plans/Collaborative_Workflows.md` | `BrainstormLeadResearchRequest` → `BrainstormLeadResearchResult` | `handlers::collaboration::brainstorm_research_lead` |
| `cmd.bsd.finding.dismiss` | Dismiss Advice | Closes one emitted Back Seat Driver finding for its current evidence. It stays closed across restart; changed evidence may raise it again as a new finding. It never touches the primary run. | `bsd_finding_present && finding_state == emitted && expected_epoch_current` | `domain_action` | `Plans/Back_Seat_Driver.md` | `BSDFindingDismissRequest` → `BSDFindingDismissResult` | `handlers::bsd::finding_dismiss` |
| `cmd.bsd.catch_up.release` | Don't Wait | Releases the current catch-up wait at this boundary, so the primary continues at once. The advisor keeps reviewing and its later notes arrive normally. It never pauses or stops Back Seat Driver. | `bsd_assignment_present && catch_up_state == waiting && expected_epoch_current` | `domain_action` | `Plans/Back_Seat_Driver.md` | `BSDCatchUpReleaseRequest` → `BSDCatchUpReleaseResult` | `handlers::bsd::catch_up_release` |
| `cmd.chat.teach.revoke` | Turn Off Rule | Turns off one taught rule by setting its `revoked_at`. The rule stays in history, and older versions do not come back. | `teaching_present && teaching_not_revoked && expected_revision_current` | `domain_action` | `Plans/assistant-memory-subsystem.md` | `TeachRevokeRequest` → `TeachRevokeResult` | `handlers::assistant_memory::teach_revoke` |
| `cmd.chat.teach.set_lock` | Lock Rule | Sets or clears the user lock on one taught rule. Only the user can change a locked rule. | `teaching_present && expected_revision_current` | `domain_action` | `Plans/assistant-memory-subsystem.md` | `TeachLockRequest` → `TeachLockResult` | `handlers::assistant_memory::teach_set_lock` |
| `cmd.chat.memory.export` | Export Memory | Exports the project's memory notes, its taught rules, or both, through the artifact owner. There is one export for both. | `assistant_memory_available && artifact_export_available` | `domain_action` | `Plans/assistant-memory-subsystem.md` | `MemoryExportRequest` → `ArtifactExportResult` | `handlers::assistant_memory::export` |

Source surfaces for these rows:
- `cmd.chat_room.end`: `chat_room_card`, `chat_room_panel`.
- `cmd.brainstorm.research_lead`: `wonderer_workspace`, `brainstorm_panel`.
- `cmd.bsd.finding.dismiss`: `bsd_note`, `bsd_details`.
- `cmd.bsd.catch_up.release`: `bsd_note`.
- `cmd.chat.teach.revoke`: `teach_document`, `memory_sheet`.
- `cmd.chat.teach.set_lock`: `teach_document`.
- `cmd.chat.memory.export`: `memory_sheet`, `teach_document`.

Every named surface must read the same owner availability and the same exact disabled reason; a surface that cannot read it renders the control disabled rather than optimistic.

Some request fields are fixed here:
- `TeachLockRequest` carries `locked`: true locks the rule and false unlocks it. Lock and Unlock are the two faces of the one row.
- `MemoryExportRequest` carries `scope`, which is exactly one of `gists`, `teachings` and `all`.

`cmd.runtime.automation_stop.set` is not registered and never will be. It was the audit's draft name for the "Pause all automations" command. DL-136 approved that command as `cmd.runtime.automation_pause.set`, and UCC-174 registers it under that name.

```yaml
plan_unit_id: UCC-171
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  DL-130 adds seven command rows, each a domain_action with one owner, one request and result
  contract and one sole future target, and each registered after an alias census over live Plans
  found no collision: cmd.chat_room.end (Collaborative_Workflows; the room settles completed, not
  cancelled), cmd.brainstorm.research_lead (Collaborative_Workflows), cmd.bsd.finding.dismiss and
  cmd.bsd.catch_up.release (Back_Seat_Driver), and cmd.chat.teach.revoke, cmd.chat.teach.set_lock and
  cmd.chat.memory.export (assistant-memory-subsystem). TeachLockRequest carries locked; MemoryExportRequest
  carries scope gists, teachings or all. Each row starts handler_unavailable and its controls stay
  disabled with command_not_registered until central registration, Event Authority, storage and
  production wiring close. cmd.runtime.automation_stop.set, the audit's draft name for the pause, is
  never registered; DL-136 registers the pause as cmd.runtime.automation_pause.set in UCC-174.
gui_related: true
gui_classification_reason: "Registers the commands behind visible End discussion, Check it, Dismiss, Don't wait, Turn off, Lock and Export buttons and their disabled states."
split_recommended: false
depends_on: [UCC-169, UCC-156]
unblocks: [UCC-170, UCC-172, UCC-173, UCC-174, CS-085, CDRY-022, WM-063]
acceptance_criteria:
  - "Each of the seven rows names exactly one owner document, one request contract, one result contract and one sole future target."
  - "Each row's controls render disabled with command_not_registered until its registration, Event Authority, storage and production wiring close."
  - "No row, alias or wiring entry exists for cmd.runtime.automation_stop.set; the pause is registered only as cmd.runtime.automation_pause.set (UCC-174)."
  - "cmd.chat_room.end never settles a room as cancelled."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: command_identity_registration
reasoning_tier: high
context_scope: assistant_wand_module_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.production.exclusions.json
node_compile_hint:
  mode: static_command_registration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/commands.md sha256:1f1544580d18467a03931d8e208fbe24a253e3c4b97f14cdcd5b4f1acf7e2c6f section 3, N-1 to N-8"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 line B-CMD-02"
  - "Plans/Decision_Log.md#DL-130, #DL-136"
  - "Plans/ledgers/v2/pldg-20260927-006-wand-command-census/records/design_atoms.jsonl"
preserved_exact_tokens:
  - "cmd.chat_room.end"
  - "cmd.brainstorm.research_lead"
  - "cmd.bsd.finding.dismiss"
  - "cmd.bsd.catch_up.release"
  - "cmd.chat.teach.revoke"
  - "cmd.chat.teach.set_lock"
  - "cmd.chat.memory.export"
  - "handler_unavailable"
  - "command_not_registered"
  - "TeachLockRequest"
  - "MemoryExportRequest"
  - "cmd.runtime.automation_stop.set"
  - "cmd.runtime.automation_pause.set"
negative_constraints:
  - "Do not register cmd.runtime.automation_stop.set, and do not make it an alias of cmd.runtime.automation_pause.set."
  - "Do not simulate success for any of the seven rows before admission."
  - "Do not fold End discussion into cmd.collaboration.cancel or Lock and Turn off into one update command."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
```

ContractRef: ContractName:Plans/Commands_System.md#CS-085, ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Back_Seat_Driver.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/Decision_Log.md#DL-130

### UCC-172 - Wand Module Surfaces And Row Revisions After The Owner's Answers

This unit adds the surfaces and row revisions that were waiting on the owner's answers.

**Teach (DL-127, DL-130).**
- Every way into Teach opens the same Teach sheet: /teach (`slash`), a natural-language request, the wand's "Teach…", "Save as a rule…" in the message menu, and "Teach a rule" in the taught-rules document. Each dispatches `cmd.chat.teach.capture`.
- `teach_capture` names that sheet. There is no separate capture card in the chat.
- The row's description "Captures a durable user→Puppet Master teaching from a slash command, natural language, or the message menu" is superseded as follows: it opens the Teach sheet with a pending capture from any of those entries, and it writes no memory.
- `TeachConfirmRequest` gains `locked`, the sheet's Locked choice, so a rule can be saved locked. After the save, only `cmd.chat.teach.set_lock` changes the lock.

**Two new surfaces.**
- `teach_document`, the taught-rules document, produces `cmd.chat.teach.capture` ("Teach a rule", and Edit with mode correct), `cmd.chat.memory.preview_capsule`, `cmd.chat.teach.set_lock`, `cmd.chat.teach.revoke` and `cmd.chat.memory.export`.
- `teach_receipt`, the one receipt line that a confirmed change leaves in the chat, produces `cmd.chat.teach.open_memory`.

**Crew Auto (DL-119, DL-120, DL-135).**
- `cmd.chat.crew_auto.open_config` is produced by three controls: the "Crew Auto settings…" row in `multi_agent_menu`, the "Settings…" link in the Crew sheet (`workflow_modal`), and the Change control of the Crew Auto note in the chat (`crew_auto_receipt`).
- `crew_auto_receipt` is a new surface: the one line, "Crew Auto is on for this project", that turning Crew Auto on for the project leaves in the chat where it was turned on (DL-135, CWR-038). Its Change produces only `cmd.chat.crew_auto.open_config`. Saving rules while Crew Auto is already on, and changing one chat's check, leave no note.
- `cmd.chat.crew_auto.set` carries a scope, closed as `project | thread` (DL-120, CWR-038). The Crew Auto sheet's primary sends project: one click and one command, whose one request carries the rules and the team and turns Crew Auto on for the project. A chat's Crew Auto check sends thread: it sets only that chat's override of the project value and never opens the sheet first (FinalGUISpec F3-578). There is no separate "Allow Crews in this chat" control; DL-120 retires it into the check. The project default being on is a change to the Settings key's default, outside this compile.
- The row's command label stays Configure Crew Auto; "Crew Auto settings…" is the row's menu text.
- "Manage Defaults…" is not renamed and keeps its meaning.
- Review and BrainStorm have no wand rows. `cmd.collaboration.configure` for them comes from `mode_menu` (Review, and BrainStorm under Deep Plan) and from `natural_language`, never from `wand`.

**Send Findings To Agent (DL-125).** `cmd.review.send_findings_to_agent` writes a fix request, built from the selected findings, into the source thread's empty composer, and it never sends. The user sends it. Its result is `ComposerBufferResult`, and it refuses with `composer_not_empty` when the composer already holds text. The findings' lineage goes in the message metadata, never in the text. This supersedes the row's "Sends selected normalized findings to the ordinary agent turn as an explicit follow-up", and its `CollaborationMessageResult`.

**Settled in the closure wave.** The `eli5_sheet` surface, and the `inherit` value of `cmd.chat.eli5.set`, waited on DL-126's follow-up. The owner has now confirmed DL-126's resolution, and UCC-175 adds both.

**Settled by DL-135 and the lead's ruling on DL-120.** The `crew_auto_receipt` surface waited on card p11, which is answered as DL-135. The request payload of `cmd.chat.crew_auto.set` waited on DL-120's follow-up, which the lead's ruling of 2026-09-27 settles. Both are compiled in the Crew Auto part above. Nothing in this unit is still open.

```yaml
plan_unit_id: UCC-172
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Every Teach entry (slash, natural language, the wand, the message menu and teach_document) dispatches
  cmd.chat.teach.capture and opens the one Teach sheet, which teach_capture names; there is no in-chat
  capture card and capture writes no memory (DL-127). TeachConfirmRequest gains locked; afterwards only
  cmd.chat.teach.set_lock changes the lock (DL-130). teach_document produces cmd.chat.teach.capture,
  cmd.chat.memory.preview_capsule, cmd.chat.teach.set_lock, cmd.chat.teach.revoke and
  cmd.chat.memory.export; teach_receipt produces cmd.chat.teach.open_memory.
  cmd.chat.crew_auto.open_config is produced by the Crew Auto settings… row in multi_agent_menu and by
  the Crew sheet's Settings… link in workflow_modal, and by the Change control of the Crew Auto note
  on crew_auto_receipt, the one line Crew Auto is on for this project that turning Crew Auto on for
  the project leaves in that chat (DL-135, CWR-038); Manage Defaults… is unchanged, and Review and
  BrainStorm have no wand producer (DL-119). cmd.chat.crew_auto.set carries scope project or thread:
  the Crew Auto sheet's primary sends project with the rules and the team in one request, and a chat's
  Crew Auto check sends thread, setting only that chat's override and never opening the sheet first;
  Allow Crews in this chat is retired into that check (DL-120, CWR-038).
  cmd.review.send_findings_to_agent fills the empty composer and never sends, returns
  ComposerBufferResult and refuses with composer_not_empty (DL-125). eli5_sheet and the inherit value
  are settled by DL-126 and added in UCC-175.
gui_related: true
gui_classification_reason: "Names the visible Teach sheet entries, taught-rules document, receipt, Crew Auto rows and note, and Send Findings behaviour."
split_recommended: false
depends_on: [UCC-169, UCC-171, ACD-477, CWR-038]
unblocks: [UCC-170, UCC-175, WM-063]
acceptance_criteria:
  - "Every Teach entry opens the same Teach sheet through cmd.chat.teach.capture, and no in-chat capture card exists."
  - "cmd.review.send_findings_to_agent never sends a message and refuses with composer_not_empty when the composer holds text."
  - "No wand producer of cmd.collaboration.configure exists for Review or BrainStorm."
  - "crew_auto_receipt produces only cmd.chat.crew_auto.open_config; eli5_sheet is added only by UCC-175."
  - "A chat's Crew Auto check dispatches cmd.chat.crew_auto.set with scope thread, never changes the project value and never opens the sheet first; no Allow Crews in this chat control exists."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: wand_module_surface_drift
reasoning_tier: high
context_scope: assistant_wand_module_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: static_command_catalog_surfaces
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/commands.md sha256:1f1544580d18467a03931d8e208fbe24a253e3c4b97f14cdcd5b4f1acf7e2c6f sections 4.1 (REV-5, REV-10, REV-11, REV-15) and 4.2"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 lines B-CMD-03, B-CMD-04"
  - "Plans/Decision_Log.md#DL-119, #DL-120, #DL-125, #DL-126, #DL-127, #DL-130, #DL-135"
  - "Plans/ledgers/v2/pldg-20260927-006-wand-command-census/records/design_atoms.jsonl"
preserved_exact_tokens:
  - "cmd.chat.crew_auto.set"
  - "Crew Auto is on for this project"
  - "teach_document"
  - "teach_receipt"
  - "teach_capture"
  - "TeachConfirmRequest"
  - "locked"
  - "cmd.chat.crew_auto.open_config"
  - "multi_agent_menu"
  - "workflow_modal"
  - "ComposerBufferResult"
  - "composer_not_empty"
  - "eli5_sheet"
  - "crew_auto_receipt"
negative_constraints:
  - "Do not let crew_auto_receipt produce any row but cmd.chat.crew_auto.open_config, and do not let the note or a chat's Crew Auto check change the project's Crew Auto value."
  - "Do not add a separate Allow Crews in this chat control."
  - "Do not keep an in-chat Teach capture card as a second way in."
  - "Do not rename Manage Defaults…."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-477, ContractName:Plans/Collaborative_Workflows.md#CWR-038, ContractName:Plans/Decision_Log.md#DL-119, ContractName:Plans/Decision_Log.md#DL-120, ContractName:Plans/Decision_Log.md#DL-125, ContractName:Plans/Decision_Log.md#DL-127, ContractName:Plans/Decision_Log.md#DL-135

### UCC-173 - Wand Module Labels

The owner's answers set the labels below. Each label that has changed supersedes the old one where the old label appears in this catalog, and the old words are kept as history rather than deleted.

| Command or control | Label | Decision |
|---|---|---|
| `cmd.chat.thread.regenerate_title` | Name it for me (was Regenerate Title) | DL-134 |
| `cmd.brainstorm.synthesize_plan` | Write the plan (was Synthesize Plan) | DL-134 |
| The collaboration sheets' Save as Default control (a Settings transaction, MODAL-006) | Save as default | DL-134. This sets the label only; storage and scope stay with Settings. |
| The helper, Coordinator and Review-partial recovery rows, and a Revert after a conflict | Retry, not "Try again" or "Check again" | DL-118 |
| A Revert that needs recovery | Recover, not "Open recovery" | DL-118 |
| `cmd.chat.crew_auto.open_config` | The command label stays Configure Crew Auto. The wand row reads "Crew Auto settings…", and "Manage Defaults…" is unchanged. | DL-119 |
| The seven UCC-171 rows | End Discussion, Check It, Dismiss Advice, Don't Wait, Turn Off Rule, Lock Rule (the control reads Lock or Unlock), Export Memory | DL-130 |

The following are display words only; the data keeps its own words:
- "Notes it took" is shown for Gist Review.
- "snapshot" is shown for the frozen target pack.
- "helpers" is shown for participants (DL-124).

Two catalog label drifts are older than the redesign and have no decision card: Summarize Room against Summarize Now, and Run Review Again against Run Another Review. They are unchanged here and stay open.

```yaml
plan_unit_id: UCC-173
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.chat.thread.regenerate_title is labelled Name it for me, superseding Regenerate Title, and
  cmd.brainstorm.synthesize_plan is labelled Write the plan, superseding Synthesize Plan (DL-134). The
  collaboration sheets' Settings-transaction control is labelled Save as default (DL-134, label only).
  Recovery buttons say Retry and Recover, never Try again, Check again or Open recovery (DL-118).
  cmd.chat.crew_auto.open_config keeps the label Configure Crew Auto; its wand row reads Crew Auto
  settings… and Manage Defaults… is unchanged (DL-119). The seven new rows are labelled End Discussion,
  Check It, Dismiss Advice, Don't Wait, Turn Off Rule, Lock Rule and Export Memory (DL-130). Gist
  Review, frozen target pack and participant keep their data words and show Notes it took, snapshot and
  helpers. Summarize Room against Summarize Now and Run Review Again against Run Another Review stay
  open.
gui_related: true
gui_classification_reason: "Sets the visible labels of redesigned menu rows, buttons and recovery actions."
split_recommended: false
depends_on: [UCC-171]
unblocks: [UCC-170]
acceptance_criteria:
  - "The regenerate-title and synthesize-plan rows show Name it for me and Write the plan, and the old labels appear only as superseded history."
  - "No recovery button says Try again, Check again or Open recovery."
  - "Gist Review, frozen target pack and participant remain the data words."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: canonical_label_drift
reasoning_tier: medium
context_scope: assistant_wand_module_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: static_label_decision
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/commands.md sha256:1f1544580d18467a03931d8e208fbe24a253e3c4b97f14cdcd5b4f1acf7e2c6f section 8, L-1 to L-12"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 line B-CMD-05"
  - "Plans/Decision_Log.md#DL-118, #DL-119, #DL-124, #DL-130, #DL-134"
  - "Plans/ledgers/v2/pldg-20260927-006-wand-command-census/records/design_atoms.jsonl"
preserved_exact_tokens:
  - "Name it for me"
  - "Regenerate Title"
  - "Write the plan"
  - "Synthesize Plan"
  - "Save as default"
  - "Retry"
  - "Recover"
  - "Configure Crew Auto"
  - "Crew Auto settings…"
  - "Manage Defaults…"
  - "Gist Review"
  - "frozen target pack"
negative_constraints:
  - "Do not delete the superseded labels; supersede them."
  - "Do not change the Settings key or scope behind Save as default."
  - "Do not settle Summarize Room against Summarize Now or Run Review Again against Run Another Review without a decision."
owner_hints:
  - Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-118, ContractName:Plans/Decision_Log.md#DL-134, ContractName:Plans/Collaborative_Workflows.md#MODAL-006

### Wand module commands after the closure answers (2026-09-27)

In the closure wave on 2026-09-27, Jared settled three more cards:
- He confirmed the resolution of DL-126 (ELI5, card p08).
- He approved DL-136, a project-wide "Pause all automations" (card p12, option A).
- He approved DL-137, live text in helper lines (card p14, option A).

This part records what the first two settle for the catalog:
- UCC-174 adds the two new command rows.
- UCC-175 adds the ELI5 sheet surface and revises `cmd.chat.eli5.set`.

DL-137 adds no command. A helper's live text is presentation of the existing reply stream, and the finished message still lands once.

### UCC-174 - Wand Module Closure Command Rows

DL-126 and DL-136 add two command rows. The rows follow the 2026-09-03 registration columns. Before registration, an alias census ran over all live `Plans/**` at `origin/main` 3c132c7f3f (CDRY-001). It found no existing command with either ID, and no existing row with the same effect under another name:
- `cmd.chat.stop` and `cmd.run.stop` stop one turn or run.
- `cmd.runtime.quota_resume.set` sets consent for one run.
- `cmd.chat.retry_message` retries a message. No existing row writes an extra reply that explains an earlier one.

Both rows follow the same rules as UCC-171:
- Each is a canonical owner request with one named sole future target.
- Neither asserts that a native dispatcher, handler, runtime, receipt or rendered control exists.
- Each starts `handler_unavailable`, and its GUI controls stay disabled with `command_not_registered` until the central command contract layer, Event Authority, storage registration and production wiring close for that row.
- No page-local handler, alias or toast may simulate success.

| Command ID | Label | Description | Preconditions | command_kind | Owner | Request → Result | Sole future target |
|---|---|---|---|---|---|---|---|
| `cmd.chat.eli5.explain_reply` | Explain This Reply Simply | Writes one extra assistant reply that explains one finished assistant reply more simply, only when the user asks. It never changes, re-sends or replaces the reply it explains, and it never changes the chat's ELI5 state. | `assistant_chat_available && target_message_role == assistant && target_message_finished` | `domain_action` | `Plans/assistant-chat-design.md` | `ELI5ExplainReplyRequest` → `ELI5ExplainReplyResult` | `handlers::assistant_chat::eli5_explain_reply` |
| `cmd.runtime.automation_pause.set` | Pause All Automations | Sets or clears the project-wide automation pause. While it is set, every scheduled send and scheduled build in the project stays stopped. Only the user clears it. | `project_present && scheduling_available` | `domain_action` | `Plans/Scheduling_and_Quota_Resume.md` | `AutomationPauseSetRequest` → `AutomationPauseSetResult` | `handlers::scheduling::automation_pause_set` |

Source surfaces for these rows:
- `cmd.chat.eli5.explain_reply`: `message_chrome`, where the "Explain this reply simply" action sits on a finished assistant reply.
- `cmd.runtime.automation_pause.set`: `schedule_manager`, where the "Pause all automations" switch sits in Resume & Safety Policy, with its Turn back on.

No other surface produces either row, and no automatic producer dispatches `cmd.runtime.automation_pause.set`. Every named surface must read the same owner availability and the same exact disabled reason. A surface that cannot read them renders the control disabled rather than optimistic.

Some request fields and rules are fixed here. The owning documents define the rest.

**`cmd.chat.eli5.explain_reply`.**
- `ELI5ExplainReplyRequest` targets one finished assistant reply by `message_id`.
- The command is refused while that reply is still streaming. Its control renders disabled until the reply is finished.
- One request writes exactly one extra reply. A repeated request with the same idempotency key returns the first result and writes nothing more. What the extra reply is and where it lands are defined in ACD-484.

**`cmd.runtime.automation_pause.set`.**
- The command is project-scoped: its target is the project. `AutomationPauseSetRequest` carries `paused`, which is true or false. The owner semantics, including the refusal of a clear from any actor other than the user, are in SQR-018.
- Setting `paused` true latches a manual stop at project scope, by advancing the `user_stop_epoch` the way Manual Stop does.
- Setting `paused` false is the only way to clear the pause, and only a user can do it.
- No automatic mechanism may clear or bypass the pause: not a quota reset, a window opening, a schedule time, or Goal, Plan or Crew continuation. Creating or editing a schedule does not clear it either.

```yaml
plan_unit_id: UCC-174
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  DL-126 and DL-136 add two command rows, each a domain_action with one owner, one request and result
  contract and one sole future target, registered after an alias census over live Plans found no
  collision. cmd.chat.eli5.explain_reply (assistant-chat-design, ELI5ExplainReplyRequest to
  ELI5ExplainReplyResult, handlers::assistant_chat::eli5_explain_reply) targets one finished assistant
  reply by message_id and writes exactly one extra, simpler reply, only when the user asks; it is
  refused while that reply is still streaming and never changes, re-sends or replaces the reply it
  explains. Its producer is message_chrome. cmd.runtime.automation_pause.set (Scheduling_and_Quota_Resume,
  AutomationPauseSetRequest to AutomationPauseSetResult, handlers::scheduling::automation_pause_set) is
  project-scoped and carries paused true or false. Setting it true latches a manual stop at project
  scope by advancing the user_stop_epoch the way Manual Stop does, so every scheduled send and
  scheduled build in the project stays stopped. Setting it false is the only way to clear the pause,
  and only a user does it. No automatic mechanism clears or bypasses it. Its producer is
  schedule_manager. Both start handler_unavailable, and their controls stay disabled with
  command_not_registered until central registration, Event Authority, storage and production wiring
  close.
gui_related: true
gui_classification_reason: "Registers the commands behind the visible Explain this reply simply action and the Pause all automations switch and Turn back on, and their disabled states."
split_recommended: false
depends_on: [UCC-171, UCC-156]
unblocks: [UCC-170, UCC-175, CS-087, CDRY-023, WM-064, ATS-066]
acceptance_criteria:
  - "Each of the two rows names exactly one owner document, one request contract, one result contract and one sole future target."
  - "cmd.chat.eli5.explain_reply writes exactly one extra reply per request, and is refused while its target reply is still streaming."
  - "cmd.runtime.automation_pause.set with paused false is accepted only from a user-originated dispatch, and no automatic producer dispatches it."
  - "Each row's controls render disabled with command_not_registered until its registration, Event Authority, storage and production wiring close."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: command_identity_registration
reasoning_tier: high
context_scope: assistant_wand_module_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.production.exclusions.json
node_compile_hint:
  mode: static_command_registration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/commands.md sha256:1f1544580d18467a03931d8e208fbe24a253e3c4b97f14cdcd5b4f1acf7e2c6f section 3, N-6, and section 2.17"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 lines B-CMD-01, B-CMD-02"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json sha256:33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5 answers p08, p12"
  - "Plans/Decision_Log.md#DL-126, #DL-136"
  - "Plans/ledgers/v2/pldg-20260927-006-wand-command-census/records/design_atoms.jsonl"
preserved_exact_tokens:
  - "cmd.chat.eli5.explain_reply"
  - "cmd.runtime.automation_pause.set"
  - "ELI5ExplainReplyRequest"
  - "ELI5ExplainReplyResult"
  - "AutomationPauseSetRequest"
  - "AutomationPauseSetResult"
  - "handlers::assistant_chat::eli5_explain_reply"
  - "handlers::scheduling::automation_pause_set"
  - "paused"
  - "user_stop_epoch"
  - "message_chrome"
  - "schedule_manager"
  - "handler_unavailable"
  - "command_not_registered"
negative_constraints:
  - "Do not let cmd.chat.eli5.explain_reply replace, regenerate or re-send the reply it explains, or change the chat's ELI5 state."
  - "Do not give cmd.runtime.automation_pause.set an automatic producer, or let any automatic mechanism clear or bypass the pause."
  - "Do not register cmd.runtime.automation_stop.set or any other alias for the pause."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
```

ContractRef: ContractName:Plans/Commands_System.md#CS-087, ContractName:Plans/assistant-chat-design.md#ACD-484, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-018, ContractName:Plans/Decision_Log.md#DL-126, ContractName:Plans/Decision_Log.md#DL-136

### UCC-175 - ELI5 Sheet Surface And The ELI5 Setting Command

This unit compiles DL-126's owner resolution for the ELI5 family.

**How a chat's ELI5 state is resolved.** ELI5 has a project default that applies everywhere in the project. A chat's own override replaces that default for that chat only. A chat's ELI5 state is resolved in this order:
1. the chat's own override, if it has one;
2. otherwise, the project default;
3. otherwise, the app default.

The app default is the existing setting `general.interaction.eli5-default`, and the per-chat override is the existing `general.interaction.chat-eli5`. The project default needs a project scope on `general.interaction.eli5-default`. That is a Settings follow-up, outside the wand-modules compile. This catalog names no new key and writes no Settings value.

**`cmd.chat.eli5.set` is revised.** `ELI5ThreadOverrideRequest` carries a value that is exactly one of `on`, `off` and `inherit`:
- `on` and `off` set this chat's override.
- `inherit` deletes this chat's override, so the chat follows the project default.

This supersedes the row's description, "Sets the ELI5 conversation override for the active thread independently of the application default". The override now sits over the project default, which in turn falls back to the application default. The row keeps its label, owner, contract names and sole future target.

**Switching never rewrites a reply.** A switch changes only the replies written after it. `cmd.chat.eli5.set` never re-sends, regenerates or rewrites an earlier reply, and a switch never produces a second response. The one way to get a simpler version of a finished reply is `cmd.chat.eli5.explain_reply` (UCC-174), and only when the user asks.

**Surfaces.**
- `eli5_sheet` is a new surface: the small ELI5 popup. It produces `cmd.chat.eli5.set` from Standard or Simple, "Follow my usual setting" (inherit) and the "This chat" level of "How it's decided". Its All chats and project levels are Settings writes, not commands.
- The ELI5 dot by the message box (`composer`) produces `cmd.chat.eli5.set` with on or off. It is the one-click switch for this chat.
- The wand's ELI5 row only opens the sheet. It no longer dispatches `cmd.chat.eli5.set` itself.

**Other rules.**
- Expert and ELI5 dual copy exists only for tooltips and help, not for every helper line. It adds no command and no surface.
- The guided tour shows its example answer in simple words only as one extra, simpler reply from `cmd.chat.eli5.explain_reply`, and the original reply is never changed (WM-041, DL-126). Where the tour uses `cmd.chat.eli5.set`, it is the quick dot, and it changes only later replies. The tour's own top-bar ELI5 control changes the tour's narration only. The tour's own units belong to their owner and are not changed here.

```yaml
plan_unit_id: UCC-175
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  ELI5 has a project default that applies everywhere in the project, and a chat's override replaces it
  for that chat only. A chat's ELI5 state resolves to the chat override, otherwise the project default,
  otherwise the app default (DL-126). The app default is general.interaction.eli5-default and the chat
  override is general.interaction.chat-eli5. The project level needs a project scope on
  general.interaction.eli5-default, which is a Settings follow-up outside this compile.
  cmd.chat.eli5.set takes on, off or inherit in ELI5ThreadOverrideRequest; inherit deletes the chat
  override so the chat follows the project default. A switch changes only the replies written after
  it and never re-sends, regenerates or rewrites an earlier reply, so it never produces a second
  response; a simpler version of a finished reply comes only from cmd.chat.eli5.explain_reply, as one
  extra reply the user asks for, and the guided tour uses that command for its same-answer ELI5. The
  new eli5_sheet surface and the ELI5 dot in composer produce cmd.chat.eli5.set, and the
  wand's ELI5 row only opens the sheet. Expert and ELI5 dual copy is limited to tooltips and help.
gui_related: true
gui_classification_reason: "Names the visible ELI5 sheet, its choices, the ELI5 dot by the message box and the wand row that opens the sheet."
split_recommended: false
depends_on: [UCC-172, UCC-174]
unblocks: [UCC-170, CS-087, CDRY-023, WM-064, ATS-066]
acceptance_criteria:
  - "cmd.chat.eli5.set accepts exactly on, off and inherit, and inherit leaves the chat with no override."
  - "A chat's ELI5 state resolves to the chat override, then the project default, then the app default."
  - "No ELI5 switch re-sends, regenerates or rewrites an earlier reply or produces a second response."
  - "The wand's ELI5 row opens the sheet and dispatches no command."
  - "The guided tour's same-answer ELI5 dispatches cmd.chat.eli5.explain_reply, never cmd.chat.eli5.set."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: wand_module_surface_drift
reasoning_tier: high
context_scope: assistant_wand_module_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: static_command_catalog_surfaces
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/commands.md sha256:1f1544580d18467a03931d8e208fbe24a253e3c4b97f14cdcd5b4f1acf7e2c6f section 2.17 (E-01 to E-07) and section 4.1 REV-6"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 lines B-CMD-01, B-CMD-03"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json sha256:33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5 answer p08"
  - "Plans/Decision_Log.md#DL-126"
  - "Plans/ledgers/v2/pldg-20260927-006-wand-command-census/records/design_atoms.jsonl"
preserved_exact_tokens:
  - "eli5_sheet"
  - "cmd.chat.eli5.set"
  - "ELI5ThreadOverrideRequest"
  - "inherit"
  - "general.interaction.eli5-default"
  - "general.interaction.chat-eli5"
  - "composer"
  - "cmd.chat.eli5.explain_reply"
negative_constraints:
  - "Do not add a new Settings key or write a Settings value for the ELI5 project default here."
  - "Do not let an ELI5 switch re-send, regenerate or rewrite an earlier reply."
  - "Do not give the wand's ELI5 row a command, or add Expert and ELI5 dual copy to every helper line."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-484, ContractName:Plans/Settings_System.md, ContractName:Plans/Decision_Log.md#DL-126
