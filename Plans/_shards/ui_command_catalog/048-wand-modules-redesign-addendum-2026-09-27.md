# Shard 048: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L13514-L13649

Source SHA256: `1a6e69fd6f2415249f56b3a4ecd455c29335d99a0789d709d6d95d97dfde7830`

---

## Wand Modules Redesign Addendum (2026-09-27)

The redesigned Assistant wand popups and their in-chat presence (Crew, Chat Room, BrainStorm, Review, Back Seat Driver, Schedule Message, Build At, the Scheduled and Automations manager, Memory, Teach, Revert Last Agent Edit and the chat title) add source surfaces, not commands. Every control dispatches an existing row, writes a draft field of the request its sheet's primary sends, or is view state with no command (CDRY-021). This addendum names the new source surfaces, the existing surfaces that join more rows, and the revisions of existing rows that follow. A surface named here joins the named rows in addition to its family's "Source surfaces" line.

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
- `cmd.chat.thread.regenerate_title`: gains the `chat_header` surface. This addendum does not change its label.
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
  The wand-module redesign adds source surfaces, not commands. New surfaces: run_dock,
  wonderer_workspace, memory_proposal_line, bsd_note, schedule_sheet, scheduled_message_card,
  schedule_manager, memory_sheet, message_files_row, revert_confirm and chat_header. Existing
  surfaces join more rows: mode_menu, natural_language and plan_schedule produce
  cmd.collaboration.configure; wand produces cmd.chat.teach.open_memory and cmd.chat.teach.capture;
  brainstorm_card and run_dock produce cmd.questionnaire.resume for BrainStorm "Answer now", disabled
  with command_not_registered while the family is candidate_not_registered; workflow_card alone
  produces cmd.runtime.approve, cmd.runtime.decline and cmd.permissions.review_request; review and
  Chat Room cards and panels produce cmd.chat.todos.open. cmd.chat.plan.build_with_crew is produced
  by the Crew sheet in Build With Crew mode and never decomposes into cmd.collaboration.start.
  cmd.chat.revert is dispatched only by revert_confirm, whose expected_turn_manifest_sha256 is the
  hash of the manifest it shows; there is no kept or conflict-dismissal outcome. chat_header produces
  cmd.chat.thread.regenerate_title with its label unchanged. cmd.chat.teach.capture carries mode new
  or correct; the Teach sheet saves through cmd.chat.teach.confirm and closes through
  cmd.chat.teach.cancel. Every added surface takes the UCC-156 availability and disabled-reason
  obligation.
gui_related: true
gui_classification_reason: "Names the visible sheets, cards, dock lines and header that produce existing commands, and their disabled states."
split_recommended: false
depends_on: [UCC-156, ACD-476, ACD-477, ACD-478, ACD-479, CWR-020, CWR-031, BSD-030, SQR-012, SQR-013, AMS-047]
unblocks: [WM-062, CDRY-021]
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
  - "This unit does not change the Crew Auto open-config surfaces, the Crew Auto set payload, the Regenerate Title label, the Teach lock field, what /teach opens, or the ELI5, Teach document, Teach receipt and Crew Auto receipt surfaces; those wait on owner decisions."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-476, ContractName:Plans/assistant-chat-design.md#ACD-478, ContractName:Plans/Collaborative_Workflows.md#MODAL-013, ContractName:Plans/Commands_System.md#CDRY-021, ContractName:Plans/Wiring_Matrix.md#WM-062
