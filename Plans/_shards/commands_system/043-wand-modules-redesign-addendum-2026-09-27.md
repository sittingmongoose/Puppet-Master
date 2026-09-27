# Shard 043: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/Commands_System.md`

Source lines: L6929-L7073

Source SHA256: `665b996dc169a60c1b3d540557fcd5a27812c4b6a0de59a12dc3d7b8d01c1984`

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

Apart from the new-command requests that wait on the owner's decision, the redesign needs no new command identity. Recorded examples and other concept demo controls stay `CONCEPT_DEMO_ONLY` under CS-079.

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
