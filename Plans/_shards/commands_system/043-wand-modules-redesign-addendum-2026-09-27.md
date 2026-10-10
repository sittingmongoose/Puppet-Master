# Shard 043: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/Commands_System.md`

Source lines: L6959-L7479

Source SHA256: `66b67be5f108e166ccde44690b9cb4ba4b6784ac3b0e7261322001bb32415aa5`

---

## Wand Modules Redesign Addendum (2026-09-27)

The redesigned Assistant wand popups and their in-chat presence reuse the catalog: UCC-169 names the surfaces they add and the rows those surfaces produce. This addendum records, for this owner, which of their controls are not commands, and one keyboard clash that the redesign makes more visible.

### CDRY-021 — Wand module controls that are not commands

Each control of the redesigned sheets, cards, dock lines and run view is a command (a row of the catalog), draft state, view state, a Settings write that the Settings owner owns, or a concept demo. The census in UCC-170 also records the few controls the design drew that canon gives no producer. This unit lists the draft and view kinds and the reuse that replaces a would-be alias, so that no port mints a command for them.

**View state (`LOCAL_PRESENTATION`): no command, no event, no catalog row.**
- Opening a sheet, except where a registered row opens it (`cmd.collaboration.configure`, `cmd.chat.crew_auto.open_config`, `cmd.chat.teach.capture`, `cmd.chat.teach.open_memory`). The Schedule Message wand row and the Revert entry points (the files row, the wand row, Changes, the message menu) only open their sheets.
- Cancel, ×, Escape and the scrim on a collaboration sheet, and "Keep going" when a cancel is confirmed in place. Teach is the exception: its Cancel, ×, Escape and scrim are `cmd.chat.teach.cancel`.
- Expand and collapse, More, tabs, filters, disclosures and Advanced, on sheets, cards and the run view, and Technical details on a setup sheet's Advanced page, the only place it remains (DL-148, DL-149).
- The Review and BrainStorm Formatted and Plain text toggles. No Review or BrainStorm view command is registered; the Plan view is the one document view toggle with a row (`cmd.chat.plan.view.set`, `shell_view`, CDRY-006). CS-079's `LOCAL_PRESENTATION` listing of the plan Rich/Markdown toggle means that it is no domain command, not that it has no row.
- The Revert preview, which is a read of the turn's change manifest; "See what's blocking it", which only opens the Revert document at that file; and "Leave my files as they are", which writes no outcome record.
- The Why? on a Back Seat Driver aside. The Why? on the advisor note itself is `cmd.bsd.finding.open`.

**Draft state: a field of the request the sheet's primary sends; no dispatch of its own.**
- Every sheet control, stepper, team recipe, specialist and Advanced row.
- "Bring back" after removing a roster row. It restores the draft and is never an undo command.

**Reuse instead of an alias: one command, never a per-kind copy.**
- Open Panel on every kind, and the dock's Show or Review on a run: `cmd.collaboration.open`, with the open target CWR-031 defines.
- Download, Export and Download transcript on every kind: `cmd.collaboration.export`.
- Run again with changes: `cmd.collaboration.start` with a seeded definition; Run Another Review: `cmd.review.run_again`.
- Send now on a held scheduled message: `cmd.chat.schedule_message.update` (SQR-013).
- Go to message and Open the original message: `cmd.chat.open_thread`.

Apart from the nine command identities that CDRY-022 and CDRY-023 record (DL-130, DL-126, DL-136), the redesign needs no new command identity. Recorded examples and other concept demo controls stay `CONCEPT_DEMO_ONLY` under CS-079.

```yaml
plan_unit_id: CDRY-021
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The wand-module redesign's non-command controls are fixed. View state (LOCAL_PRESENTATION, no
  command, no event, no catalog row): opening a sheet unless a registered row opens it; Cancel, x,
  Escape and scrim on a collaboration sheet and Keep going; expand, More, tabs, filters, disclosures
  and Advanced, and Technical details on a setup sheet's Advanced page (DL-148, DL-149); the Review and BrainStorm Formatted and Plain text toggles; the
  Revert preview, See what's blocking it and Leave my files as they are; the Why? on a Back Seat
  Driver aside. Draft state: every sheet control, stepper, team recipe, specialist and Advanced row,
  and Bring back, which is never an undo command. Reuse replaces aliases: cmd.collaboration.open for
  every Open Panel and the dock's Show or Review, cmd.collaboration.export for every download or
  export, cmd.collaboration.start or cmd.review.run_again for run again,
  cmd.chat.schedule_message.update for Send now, cmd.chat.open_thread for going to a message. Teach
  closes through cmd.chat.teach.cancel. The Plan view stays the one document view toggle with a
  shell_view row, cmd.chat.plan.view.set. Recorded examples and other concept demo controls stay
  CONCEPT_DEMO_ONLY, and apart from the nine identities of CDRY-022 and CDRY-023 the redesign needs no
  new command identity.
gui_related: true
gui_classification_reason: "Classifies visible sheet, card, dock and run-view controls as view state, draft state or command reuse."
split_recommended: false
depends_on: [CS-079, UCC-169, CWR-031, SQR-013]
unblocks: [WM-062, UCC-170, CDRY-022]
acceptance_criteria:
  - "No catalog row, production wiring entry or event exists for a control this unit lists as view state or draft state."
  - "No per-kind open, export or run-again alias is registered."
  - "No Review or BrainStorm view command is registered."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: view_state_command_inflation
reasoning_tier: medium
context_scope: assistant_wand_module_commands
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: static_command_disposition_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md sha256:dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de sections 8.4, 8.5, 8.12, 8.15"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 lines B-CMD-07, B-CMD-08"
  - "Plans/ledgers/v2/pldg-20260927-006-wand-command-census/records/design_atoms.jsonl"
preserved_exact_tokens:
  - "LOCAL_PRESENTATION"
  - "cmd.chat.plan.view.set"
  - "shell_view"
  - "cmd.collaboration.open"
  - "cmd.collaboration.export"
  - "cmd.review.run_again"
  - "cmd.chat.schedule_message.update"
  - "cmd.chat.open_thread"
  - "cmd.chat.teach.cancel"
  - "CONCEPT_DEMO_ONLY"
negative_constraints:
  - "Do not register a Review or BrainStorm view-mode command."
  - "Do not register a recipe, Bring back, dock show, Send now, jump-to-message, Revert preview or Revert keep command."
  - "Do not mint a per-kind open, export or run-again alias."
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
```

### CS-086 - Text-Editing Keys Inside Sheet Text Fields

Inside a focused text field, the defaults of `extensions.commands.text-editing-keys` bind Ctrl+K to "Delete to end of line" and Ctrl+W to "Delete previous word". The global shortcuts bind the same chords to "Open command palette" and "Close current tab/panel" (FinalGUISpec 4.4). The clash predates the Assistant wand redesign: it already exists in the chat composer, and each redesigned sheet's main text field now carries it too. The redesign adds no key binding and changes no default. Which binding wins inside a text field belongs to the Commands and Shortcuts owner and is not decided here. The clash-handling choice the manager exposes from 2026-09-27 (S8, `When two actions share keys`, `extensions.commands.conflict-handling`, CS-081) governs shortcut bindings in the shortcuts delta that share keys; whether it also governs these text-field defaults is part of the same owner decision and is not assumed here.

```yaml
plan_unit_id: CS-086
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The extensions.commands.text-editing-keys defaults bind Ctrl+K to Delete to end of line and Ctrl+W
  to Delete previous word inside a focused text field, the same chords the global shortcuts bind to
  Open command palette and Close current tab/panel. The clash predates the wand redesign and now also
  reaches every redesigned sheet's main text field. The redesign adds no binding and changes no
  default; which binding wins inside a text field is the Commands and Shortcuts owner's decision.
gui_related: true
gui_classification_reason: "Keyboard behaviour inside visible composer and sheet text fields."
split_recommended: false
depends_on: [UCC-169]
unblocks: []
acceptance_criteria:
  - "The clash is recorded for the Commands and Shortcuts owner and no document claims it resolved."
  - "No redesigned sheet adds or rebinds a key chord."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: shortcut_scope_conflict
reasoning_tier: low
context_scope: commands_shortcuts_text_fields
implementation_surfaces:
  - Plans/Commands_System.md
node_compile_hint:
  mode: static_note_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 line B-CMD-09"
  - "Plans/settings_inventory.json#extensions.commands.text-editing-keys"
  - "Plans/FinalGUISpec.md#4.4"
preserved_exact_tokens:
  - "extensions.commands.text-editing-keys"
  - "Ctrl+K"
  - "Ctrl+W"
negative_constraints:
  - "Do not change a text-editing-keys or shortcut default under this unit."
  - "Do not claim the clash was introduced or resolved by the wand redesign."
owner_hints:
  - Plans/Commands_System.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-169, ContractName:Plans/FinalGUISpec.md

### After the owner's answers (2026-09-27)

DL-130 adds seven new command identities for the wand modules. UCC-171 registers them in the catalog. This owner records their central contract records (CS-085) and the census line that nothing else was minted on DL-130 (CDRY-022). The closure answers mint two more, recorded below (CS-087, CDRY-023).

### CS-085 - Central Contract Records For The Wand Module Commands

Each of the seven rows below is a `domain_action` with one sole handler and one request and result contract. Every row carries the same boundary:
- Initial availability is `handler_unavailable`.
- A GUI control for the row renders disabled with `command_not_registered` until the central command contract layer, Event Authority, storage registration and production wiring close for that row.
- `expected_event_types` stays empty until Event Authority admits an exact event family for the row.
- Errors come from the closed catalog set.
- No page-local handler, alias or toast may simulate success.

The owning documents define what each command does. This record fixes only the dispatch identity.

| Command | Sole handler | Request → Result | Owner |
|---|---|---|---|
| `cmd.chat_room.end` | `handlers::collaboration::chat_room_end` | `ChatRoomEndRequest` → `ChatRoomEndResult` | `Plans/Collaborative_Workflows.md` |
| `cmd.brainstorm.research_lead` | `handlers::collaboration::brainstorm_research_lead` | `BrainstormLeadResearchRequest` → `BrainstormLeadResearchResult` | `Plans/Collaborative_Workflows.md` |
| `cmd.bsd.finding.dismiss` | `handlers::bsd::finding_dismiss` | `BSDFindingDismissRequest` → `BSDFindingDismissResult` | `Plans/Back_Seat_Driver.md` |
| `cmd.bsd.catch_up.release` | `handlers::bsd::catch_up_release` | `BSDCatchUpReleaseRequest` → `BSDCatchUpReleaseResult` | `Plans/Back_Seat_Driver.md` |
| `cmd.chat.teach.revoke` | `handlers::assistant_memory::teach_revoke` | `TeachRevokeRequest` → `TeachRevokeResult` | `Plans/assistant-memory-subsystem.md` |
| `cmd.chat.teach.set_lock` | `handlers::assistant_memory::teach_set_lock` | `TeachLockRequest` → `TeachLockResult` | `Plans/assistant-memory-subsystem.md` |
| `cmd.chat.memory.export` | `handlers::assistant_memory::export` | `MemoryExportRequest` → `ArtifactExportResult` | `Plans/assistant-memory-subsystem.md` |

The request and result schemas and their fixtures belong to the companion task. Until they exist, a named contract is a name only, and it is not evidence that a handler or schema exists.

```yaml
plan_unit_id: CS-085
unit_type: command_contract
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The seven wand-module commands DL-130 adds each have one sole handler and one request and result
  contract: cmd.chat_room.end (handlers::collaboration::chat_room_end), cmd.brainstorm.research_lead
  (handlers::collaboration::brainstorm_research_lead), cmd.bsd.finding.dismiss
  (handlers::bsd::finding_dismiss), cmd.bsd.catch_up.release (handlers::bsd::catch_up_release),
  cmd.chat.teach.revoke (handlers::assistant_memory::teach_revoke), cmd.chat.teach.set_lock
  (handlers::assistant_memory::teach_set_lock) and cmd.chat.memory.export
  (handlers::assistant_memory::export). Each starts handler_unavailable; its controls render disabled
  with command_not_registered until central registration, Event Authority, storage and production
  wiring close; expected_event_types stays empty until Event Authority admits a family; and no
  page-local handler, alias or toast simulates success.
  DL-138 requires companion schemas and fixtures now in the existing owner pairs:
  collaborative_workflows_contracts.schema.json owns ChatRoomEndRequest/ChatRoomEndResult and
  BrainstormLeadResearchRequest/BrainstormLeadResearchResult; back_seat_driver_contracts.schema.json
  owns BSDFindingDismissRequest/BSDFindingDismissResult and BSDCatchUpReleaseRequest/BSDCatchUpReleaseResult;
  assistant_memory_contracts.schema.json owns TeachRevokeRequest/TeachRevokeResult,
  TeachLockRequest/TeachLockResult with locked, and MemoryExportRequest/ArtifactExportResult with scope,
  plus the existing TeachConfirmRequest/TeachConfirmResult gaining locked. Each pair must validate
  closed request/result fields, accepted examples and one-constraint negative fixtures. These
  contract artifacts do not establish native handler availability or event admission.
gui_related: true
gui_classification_reason: "Fixes the dispatch identity and disabled state of visible End discussion, Check it, Dismiss, Don't wait, Turn off, Lock and Export controls."
split_recommended: false
depends_on: [UCC-171]
unblocks: [WM-063, CS-087]
acceptance_criteria:
  - "Each of the seven commands dispatches to exactly its named sole handler."
  - "Each renders disabled with command_not_registered and reports handler_unavailable until admission."
  - "No event type is expected for any of the seven before Event Authority admits one."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: command_identity_registration
reasoning_tier: high
context_scope: assistant_wand_module_commands
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: static_command_contract_records
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-138 (owner answers, 2026-09-29)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/commands.md sha256:1f1544580d18467a03931d8e208fbe24a253e3c4b97f14cdcd5b4f1acf7e2c6f section 3 and section 7.4 CC-2"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 line B-CMD-07"
  - "Plans/Decision_Log.md#DL-130"
  - "Plans/ledgers/v2/pldg-20260927-006-wand-command-census/records/design_atoms.jsonl"
preserved_exact_tokens:
  - "scope"
  - "locked"
  - "TeachConfirmResult"
  - "TeachConfirmRequest"
  - "ArtifactExportResult"
  - "MemoryExportRequest"
  - "TeachLockResult"
  - "TeachLockRequest"
  - "TeachRevokeResult"
  - "TeachRevokeRequest"
  - "BSDCatchUpReleaseResult"
  - "BSDCatchUpReleaseRequest"
  - "BSDFindingDismissResult"
  - "BSDFindingDismissRequest"
  - "BrainstormLeadResearchResult"
  - "BrainstormLeadResearchRequest"
  - "ChatRoomEndResult"
  - "ChatRoomEndRequest"
  - "DL-138"
  - "handlers::collaboration::chat_room_end"
  - "handlers::collaboration::brainstorm_research_lead"
  - "handlers::bsd::finding_dismiss"
  - "handlers::bsd::catch_up_release"
  - "handlers::assistant_memory::teach_revoke"
  - "handlers::assistant_memory::teach_set_lock"
  - "handlers::assistant_memory::export"
  - "handler_unavailable"
  - "command_not_registered"
negative_constraints:
  - "Do not name a second handler or an alias for any of the seven commands."
  - "Do not claim a schema, fixture or handler exists because it is named here."
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
```

### CDRY-022 - The Wand Modules Mint Exactly Seven Commands On DL-130

On DL-130, the wand-module redesign mints exactly seven command identities, the ones DL-130 approved and UCC-171 registers:
- `cmd.chat_room.end`
- `cmd.brainstorm.research_lead`
- `cmd.bsd.finding.dismiss`
- `cmd.bsd.catch_up.release`
- `cmd.chat.teach.revoke`
- `cmd.chat.teach.set_lock`
- `cmd.chat.memory.export`

Before they were minted, an alias census ran over all live `Plans/**` at `origin/main` 3c132c7f3f (the CDRY-001 rule). It found no existing identity with the same effect.

Nothing else is minted on DL-130. Apart from the two closure identities that CDRY-023 records, every other redesigned control is one of these, per the census in UCC-170:
- a reuse of an existing row;
- draft or view state (CDRY-021);
- a Settings write;
- a control that canon gives no producer;
- a concept demo control.

`cmd.runtime.automation_stop.set` is not minted, and never will be. It was the audit's draft name for the automation pause. The closure answers DL-126 and DL-136 are new decisions, and they mint two more identities, `cmd.chat.eli5.explain_reply` and `cmd.runtime.automation_pause.set`; CDRY-023 records them, and with them the redesign mints nine in all. A Chat Room message sent mid-round, and its Send now steer, reuse `cmd.collaboration.message` with `delivery_mode` queue or steer (CWR-024, DL-112) and get no new identity.

```yaml
plan_unit_id: CDRY-022
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  On DL-130 the wand-module redesign mints exactly seven command identities: cmd.chat_room.end,
  cmd.brainstorm.research_lead, cmd.bsd.finding.dismiss, cmd.bsd.catch_up.release,
  cmd.chat.teach.revoke, cmd.chat.teach.set_lock and cmd.chat.memory.export (DL-130, UCC-171), after an
  alias census over live Plans found no identity with the same effect. Nothing else is minted on
  DL-130: apart from the two closure identities of CDRY-023, every other control is a reuse, draft or
  view state, a Settings write, a control with no producer or a concept demo control (UCC-170,
  CDRY-021). cmd.runtime.automation_stop.set, the audit's draft name for the pause, is never minted;
  the closure decisions DL-126 and DL-136 mint cmd.chat.eli5.explain_reply and
  cmd.runtime.automation_pause.set, which CDRY-023 records, nine identities in all. A Chat Room
  message sent mid-round reuses cmd.collaboration.message with delivery_mode queue or steer (DL-112).
gui_related: true
gui_classification_reason: "Bounds the command identities behind the visible controls of the redesigned wand modules."
split_recommended: false
depends_on: [UCC-170, UCC-171, CDRY-021]
unblocks: [CDRY-023]
acceptance_criteria:
  - "The catalog gains exactly these seven identities for the wand modules on DL-130, and no per-kind or view-state alias; only the closure decisions in CDRY-023 add more."
  - "A Chat Room message sent mid-round, and its Send now, dispatch cmd.collaboration.message and no new identity."
  - "No identity exists for cmd.runtime.automation_stop.set; the pause's only identity is cmd.runtime.automation_pause.set (CDRY-023)."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: view_state_command_inflation
reasoning_tier: medium
context_scope: assistant_wand_module_commands
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: static_command_disposition_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 line B-CMD-07"
  - "Plans/Decision_Log.md#DL-112, #DL-130"
  - "Plans/ledgers/v2/pldg-20260927-006-wand-command-census/records/design_atoms.jsonl"
preserved_exact_tokens:
  - "delivery_mode"
  - "cmd.chat_room.end"
  - "cmd.brainstorm.research_lead"
  - "cmd.bsd.finding.dismiss"
  - "cmd.bsd.catch_up.release"
  - "cmd.chat.teach.revoke"
  - "cmd.chat.teach.set_lock"
  - "cmd.chat.memory.export"
  - "cmd.runtime.automation_stop.set"
negative_constraints:
  - "Do not mint any other command identity for the wand modules without a new decision."
owner_hints:
  - Plans/Commands_System.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-170, ContractName:Plans/UI_Command_Catalog.md#UCC-171, ContractName:Plans/Decision_Log.md#DL-130

### After the closure answers (2026-09-27)

In the closure wave, the owner's resolution of DL-126 (ELI5) and his approval of DL-136 (a project-wide automation pause) add two command identities. UCC-174 registers them in the catalog. This owner records:
- their central contract records, and the revised value set of `cmd.chat.eli5.set` (CS-087);
- the census line saying that nothing else was minted (CDRY-023).

### CS-087 - Central Contract Records For The Closure-Wave Commands

Both rows below are `domain_action` rows. Each has one sole handler and one request and result contract, and each carries the same boundary as CS-085:
- Initial availability is `handler_unavailable`.
- A GUI control for the row renders disabled with `command_not_registered` until the central command contract layer, Event Authority, storage registration and production wiring close for that row.
- `expected_event_types` stays empty until Event Authority admits an exact event family.
- Errors come from the closed catalog set.
- No page-local handler, alias or toast may simulate success.

| Command | Sole handler | Request → Result | Owner |
|---|---|---|---|
| `cmd.chat.eli5.explain_reply` | `handlers::assistant_chat::eli5_explain_reply` | `ELI5ExplainReplyRequest` → `ELI5ExplainReplyResult` | `Plans/assistant-chat-design.md` |
| `cmd.runtime.automation_pause.set` | `handlers::scheduling::automation_pause_set` | `AutomationPauseSetRequest` → `AutomationPauseSetResult` | `Plans/Scheduling_and_Quota_Resume.md` |

The contract records fix these dispatch rules:
- **`cmd.chat.eli5.explain_reply`.** It carries the target reply's `message_id`. It is refused while that reply is still streaming, and one request writes exactly one extra reply. It is not an alias of `cmd.chat.retry_message`: it never replaces, re-sends or regenerates the reply it explains.
- **`cmd.runtime.automation_pause.set`.** It is project-scoped and carries `paused`.
  - With `paused` true, it advances the project's `user_stop_epoch` the way Manual Stop does.
  - With `paused` false, it is the only command that clears the pause, and it is accepted only from a user-originated dispatch.
  - No automatic producer, whether a schedule, an execution window, a quota resume, Crew Auto, or Goal or Plan continuation, may dispatch it.

**`cmd.chat.eli5.set` keeps its handler and its contract names.** Its `ELI5ThreadOverrideRequest` value becomes exactly one of `on`, `off` and `inherit`, and `inherit` deletes the chat's override (UCC-175). No other ELI5 identity exists:
- There is no inherit command.
- There is no project-level command. The project default is a Settings write, and that is a Settings follow-up outside this compile.

The request and result schemas, and their fixtures, belong to the companion task, and they live in two files:
- The ELI5 pair and the `inherit` member are in `Plans/assistant_chat_contracts.schema.json`, with fixtures in `Plans/assistant_chat_contract_fixtures.json`: `ELI5ExplainReplyRequest`, `ELI5ExplainReplyResult` and the `inherit` member of `ELI5ThreadOverrideRequest` are defined there.
- The pause pair, `AutomationPauseSetRequest` and `AutomationPauseSetResult`, is in `Plans/scheduling_and_quota_resume_contracts.schema.json`, with fixtures in `Plans/scheduling_and_quota_resume_contract_fixtures.json`.

A schema is still not evidence that a handler exists. For any other name, until its schema exists, a named contract is a name only. It is not evidence that a handler or schema exists.

```yaml
plan_unit_id: CS-087
unit_type: command_contract
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  cmd.chat.eli5.explain_reply has the sole handler handlers::assistant_chat::eli5_explain_reply and
  the contract ELI5ExplainReplyRequest to ELI5ExplainReplyResult (assistant-chat-design). It carries
  the target reply's message_id, is refused while that reply is still streaming, and writes exactly one
  extra reply per request; it is not an alias of cmd.chat.retry_message. cmd.runtime.automation_pause.set
  has the sole handler handlers::scheduling::automation_pause_set and the contract
  AutomationPauseSetRequest to AutomationPauseSetResult (Scheduling_and_Quota_Resume). It is
  project-scoped and carries paused: true advances the project's user_stop_epoch the way Manual Stop
  does, and false is the only clear and is accepted only from a user-originated dispatch; no automatic
  producer dispatches it. Both start handler_unavailable, render disabled with command_not_registered
  until admission, and expect no event type before Event Authority admits one. cmd.chat.eli5.set keeps
  its handler and contract names, and its ELI5ThreadOverrideRequest value becomes on, off or inherit
  (DL-126, DL-136). The ELI5 pair and the inherit member are in Plans/assistant_chat_contracts.schema.json
  with fixtures in Plans/assistant_chat_contract_fixtures.json; the pause pair is in
  Plans/scheduling_and_quota_resume_contracts.schema.json. A schema is not evidence of a handler.
gui_related: true
gui_classification_reason: "Fixes the dispatch identity and disabled state of the visible Explain this reply simply action, the Pause all automations switch, Turn back on and the ELI5 choices."
split_recommended: false
depends_on: [UCC-174, UCC-175, CS-085]
unblocks: [CDRY-023, WM-064, ATS-066]
acceptance_criteria:
  - "Each of the two commands dispatches to exactly its named sole handler."
  - "cmd.runtime.automation_pause.set is refused from every automatic producer for either value of paused."
  - "cmd.chat.eli5.set accepts exactly on, off and inherit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: command_identity_registration
reasoning_tier: high
context_scope: assistant_wand_module_commands
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: static_command_contract_records
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/commands.md sha256:1f1544580d18467a03931d8e208fbe24a253e3c4b97f14cdcd5b4f1acf7e2c6f section 3 N-6 and section 4.1 REV-6"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS-20260927-final.json sha256:33d13386f28fc5f667fd1df85ba9cb70eefff7eb43c92723e14cefa08237aaf5 answers p08, p12"
  - "Plans/Decision_Log.md#DL-126, #DL-136"
  - "Plans/ledgers/v2/pldg-20260927-006-wand-command-census/records/design_atoms.jsonl"
preserved_exact_tokens:
  - "handlers::assistant_chat::eli5_explain_reply"
  - "handlers::scheduling::automation_pause_set"
  - "ELI5ExplainReplyRequest"
  - "AutomationPauseSetRequest"
  - "ELI5ThreadOverrideRequest"
  - "user_stop_epoch"
  - "inherit"
  - "handler_unavailable"
  - "command_not_registered"
  - "Plans/assistant_chat_contract_fixtures.json"
  - "Plans/scheduling_and_quota_resume_contracts.schema.json"
negative_constraints:
  - "Do not name a second handler or an alias for either command."
  - "Do not accept a pause clear from an automatic producer."
  - "Do not claim a schema, fixture or handler exists because it is named here."
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-174, ContractName:Plans/UI_Command_Catalog.md#UCC-175, ContractName:Plans/Decision_Log.md#DL-126, ContractName:Plans/Decision_Log.md#DL-136

### CDRY-023 - The Closure Answers Mint Exactly Two More Commands

The closure answers mint exactly two more command identities for the wand modules. Both are registered in UCC-174:
- `cmd.chat.eli5.explain_reply`, on DL-126;
- `cmd.runtime.automation_pause.set`, on DL-136.

The alias census for them ran over all live `Plans/**` at `origin/main` 3c132c7f3f (the CDRY-001 rule). It found no existing identity with the same effect. With the seven in CDRY-022, the redesign mints nine identities in all.

Nothing else is minted:
- The ELI5 sheet, the ELI5 dot and "Follow my usual setting" reuse `cmd.chat.eli5.set`, with the value `inherit`. No inherit command or project-level ELI5 command exists.
- The ELI5 project default is a Settings write, which is a Settings follow-up.
- The draft name `cmd.runtime.automation_stop.set` is never minted.
- DL-137, live text in helper lines, is presentation of the existing reply stream and mints no command.

```yaml
plan_unit_id: CDRY-023
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The closure answers mint exactly two more wand-module command identities, cmd.chat.eli5.explain_reply
  (DL-126) and cmd.runtime.automation_pause.set (DL-136), registered in UCC-174 after an alias census
  over live Plans found no identity with the same effect; with CDRY-022's seven, the redesign mints
  nine. The ELI5 sheet, the ELI5 dot and Follow my usual setting reuse cmd.chat.eli5.set with inherit;
  no inherit or project-level ELI5 command exists, and the project default is a Settings write.
  cmd.runtime.automation_stop.set is never minted, and DL-137's live helper text mints no command.
gui_related: true
gui_classification_reason: "Bounds the command identities behind the visible ELI5 controls, the Explain this reply simply action and the Pause all automations switch."
split_recommended: false
depends_on: [CDRY-022, UCC-170, UCC-174, UCC-175, CS-087]
unblocks: [ATS-066]
acceptance_criteria:
  - "The closure wave adds exactly cmd.chat.eli5.explain_reply and cmd.runtime.automation_pause.set, and no alias of either."
  - "No command identity exists for ELI5 inherit, the ELI5 project default or live helper text."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: view_state_command_inflation
reasoning_tier: medium
context_scope: assistant_wand_module_commands
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: static_command_disposition_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 lines B-CMD-01, B-CMD-02, B-CMD-07"
  - "Plans/Decision_Log.md#DL-126, #DL-136, #DL-137"
  - "Plans/ledgers/v2/pldg-20260927-006-wand-command-census/records/design_atoms.jsonl"
preserved_exact_tokens:
  - "cmd.chat.eli5.explain_reply"
  - "cmd.runtime.automation_pause.set"
  - "cmd.chat.eli5.set"
  - "inherit"
  - "cmd.runtime.automation_stop.set"
negative_constraints:
  - "Do not mint an ELI5 inherit command, a project-level ELI5 command or a live-helper-text command."
  - "Do not mint any other command identity for the wand modules without a new decision."
owner_hints:
  - Plans/Commands_System.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-174, ContractName:Plans/Commands_System.md#CDRY-022, ContractName:Plans/Decision_Log.md#DL-126, ContractName:Plans/Decision_Log.md#DL-136, ContractName:Plans/Decision_Log.md#DL-137
