# Shard 043: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/Commands_System.md`

Source lines: L6929-L7237

Source SHA256: `3ce4d5cea2d91040c330fc9706bb2c04ffefc69b2152fe3f5c7024d814c7905f`

---

## Wand Modules Redesign Addendum (2026-09-27)

The redesigned Assistant wand popups and their in-chat presence reuse the catalog: UCC-169 names the surfaces they add and the rows those surfaces produce. This addendum records, for this owner, which of their controls are not commands, and one keyboard clash that the redesign makes more visible.

### CDRY-021 — Wand module controls that are not commands

Each control of the redesigned sheets, cards, dock lines and run view is one of four kinds: a command (a row of the catalog), draft state, view state, or a concept demo. This unit lists the draft and view kinds and the reuse that replaces a would-be alias, so that no port mints a command for them.

**View state (`LOCAL_PRESENTATION`): no command, no event, no catalog row.**
- Opening a sheet, except where a registered row opens it (`cmd.collaboration.configure`, `cmd.chat.crew_auto.open_config`, `cmd.chat.teach.capture`, `cmd.chat.teach.open_memory`). The Schedule Message wand row and the Revert entry points (the files row, the wand row, Changes, the message menu) only open their sheets.
- Cancel, ×, Escape and the scrim on a collaboration sheet, and "Keep going" when a cancel is confirmed in place. Teach is the exception: its Cancel, ×, Escape and scrim are `cmd.chat.teach.cancel`.
- Expand and collapse, More, tabs, filters, Technical details, disclosures and Advanced, on sheets, cards and the run view.
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

Apart from the seven command identities that CDRY-022 records (DL-130), the redesign needs no new command identity. Recorded examples and other concept demo controls stay `CONCEPT_DEMO_ONLY` under CS-079.

```yaml
plan_unit_id: CDRY-021
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The wand-module redesign's non-command controls are fixed. View state (LOCAL_PRESENTATION, no
  command, no event, no catalog row): opening a sheet unless a registered row opens it; Cancel, x,
  Escape and scrim on a collaboration sheet and Keep going; expand, More, tabs, filters, Technical
  details, disclosures and Advanced; the Review and BrainStorm Formatted and Plain text toggles; the
  Revert preview, See what's blocking it and Leave my files as they are; the Why? on a Back Seat
  Driver aside. Draft state: every sheet control, stepper, team recipe, specialist and Advanced row,
  and Bring back, which is never an undo command. Reuse replaces aliases: cmd.collaboration.open for
  every Open Panel and the dock's Show or Review, cmd.collaboration.export for every download or
  export, cmd.collaboration.start or cmd.review.run_again for run again,
  cmd.chat.schedule_message.update for Send now, cmd.chat.open_thread for going to a message. Teach
  closes through cmd.chat.teach.cancel. The Plan view stays the one document view toggle with a
  shell_view row, cmd.chat.plan.view.set.
gui_related: true
gui_classification_reason: "Classifies visible sheet, card, dock and run-view controls as view state, draft state or command reuse."
split_recommended: false
depends_on: [CS-079, UCC-169, CWR-031, SQR-013]
unblocks: [WM-062]
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

Inside a focused text field, the defaults of `extensions.commands.text-editing-keys` bind Ctrl+K to "Delete to end of line" and Ctrl+W to "Delete previous word". The global shortcuts bind the same chords to "Open command palette" and "Close current tab/panel" (FinalGUISpec 4.4). The clash predates the Assistant wand redesign: it already exists in the chat composer, and each redesigned sheet's main text field now carries it too. The redesign adds no key binding and changes no default. Which binding wins inside a text field belongs to the Commands and Shortcuts owner and is not decided here.

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

DL-130 adds seven new command identities for the wand modules. UCC-171 registers them in the catalog. This owner records their central contract records (CS-085) and the census line that nothing else was minted (CDRY-022).

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
gui_related: true
gui_classification_reason: "Fixes the dispatch identity and disabled state of visible End discussion, Check it, Dismiss, Don't wait, Turn off, Lock and Export controls."
split_recommended: false
depends_on: [UCC-171]
unblocks: [WM-063]
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
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/commands.md sha256:1f1544580d18467a03931d8e208fbe24a253e3c4b97f14cdcd5b4f1acf7e2c6f section 3 and section 7.4 CC-2"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md sha256:71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493 line B-CMD-07"
  - "Plans/Decision_Log.md#DL-130"
  - "Plans/ledgers/v2/pldg-20260927-006-wand-command-census/records/design_atoms.jsonl"
preserved_exact_tokens:
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

### CDRY-022 - The Wand Modules Mint Exactly Seven Commands

The wand-module redesign mints exactly seven command identities, the ones DL-130 approved and UCC-171 registers:
- `cmd.chat_room.end`
- `cmd.brainstorm.research_lead`
- `cmd.bsd.finding.dismiss`
- `cmd.bsd.catch_up.release`
- `cmd.chat.teach.revoke`
- `cmd.chat.teach.set_lock`
- `cmd.chat.memory.export`

Before they were minted, an alias census ran over all live `Plans/**` at `origin/main` 3c132c7f3f (the CDRY-001 rule). It found no existing identity with the same effect.

Nothing else is minted. Every other redesigned control is one of these, per the census in UCC-170:
- a reuse of an existing row;
- draft or view state (CDRY-021);
- a Settings write;
- a concept demo control.

`cmd.runtime.automation_stop.set` is not minted while card p12 is unanswered. The Chat Room's mid-round steer waits on DL-112's follow-up and is given no new identity here.

```yaml
plan_unit_id: CDRY-022
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The wand-module redesign mints exactly seven command identities: cmd.chat_room.end,
  cmd.brainstorm.research_lead, cmd.bsd.finding.dismiss, cmd.bsd.catch_up.release,
  cmd.chat.teach.revoke, cmd.chat.teach.set_lock and cmd.chat.memory.export (DL-130, UCC-171), after an
  alias census over live Plans found no identity with the same effect. Nothing else is minted: every
  other control is a reuse, draft or view state, a Settings write or a concept demo control (UCC-170,
  CDRY-021). cmd.runtime.automation_stop.set is not minted while card p12 is unanswered.
gui_related: true
gui_classification_reason: "Bounds the command identities behind the visible controls of the redesigned wand modules."
split_recommended: false
depends_on: [UCC-170, UCC-171, CDRY-021]
unblocks: []
acceptance_criteria:
  - "The catalog gains exactly these seven identities for the wand modules, and no per-kind or view-state alias."
  - "No identity exists for cmd.runtime.automation_stop.set before card p12 is answered."
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
  - "Plans/Decision_Log.md#DL-130"
  - "Plans/ledgers/v2/pldg-20260927-006-wand-command-census/records/design_atoms.jsonl"
preserved_exact_tokens:
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
