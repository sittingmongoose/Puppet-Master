# Shard 039: Commands Shortcuts Wiring Companions — 2026-09-26

Source: `Plans/Wiring_Matrix.md`

Source lines: L4897-L4930

Source SHA256: `c85055258bf1320ddf91619b6745282c1090c408cd41d9176bf7e43aea7af768`

---

## Commands Shortcuts Wiring Companions — 2026-09-26

Zero production-intent rows are added here: `WiringEntry.ui_command_id` requires `^cmd\.`, so the eight `commands.*` typed local file actions cannot be production-row targets without a schema change, and none is requested. The CS-081 census keeps its sole future handler `handlers::commands::apply_local_action` with persistent filesystem effects (actor, permission snapshot, FileSafe containment, CAS generation, idempotency, durable readback); preview stays inert with no read, shell, ask-flow, permission evaluation, or dispatch. Shortcut and hints controls dispatch only through the existing transaction production rows (`cmd.settings.transaction.preview`, `cmd.settings.transaction.apply`, `cmd.settings.transaction.rollback`) against `extensions.commands.keyboard-shortcuts`, `extensions.commands.shortcut-hints`, `extensions.commands.keyboard-layout`, and `extensions.commands.command-palette-visibility`; remaining selected controls are view-only with no dispatch. The seven UCC-165/WM-058 production rows stay exactly once each, and the `catalog.forge_pipeline_open_in_browser` row keeps its FGI-010 binding with the three FGI-021 destination kinds. Denominators are the ones `scripts/pm-touch-closure-verify.py` reports and are not frozen here.

### WM-059 - Commands Shortcuts Wiring Companions

```yaml
plan_unit_id: WM-059
unit_type: production_wiring
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: The CS-081 commands.* typed local census gains zero production-intent rows because local actions are not cmd.* primaries; shortcut, hints, layout, and palette controls reuse the existing Settings transaction production rows, presentation controls stay view-only, and the seven WM-058 rows plus the three-kind open_in_browser row stay exactly once each.
gui_related: true
gui_classification_reason: Wiring companions bind manager controls to local-action availability, transaction dispatch targets, disabled reasons, and return routes without adding a production row.
depends_on: [WM-058, UCC-166, UIW-023]
unblocks: []
acceptance_criteria:
  - Zero production entries are added; no entry targets a commands.* ID or a rejected cmd.commands.custom.*, cmd.shortcuts.*, cmd.user_command.*, or cmd.keybinding.* spelling.
  - Shortcut, backup, hints, layout, and palette controls resolve only through existing transaction rows; presentation controls stay view-only.
  - The seven WM-058 rows stay exactly once each with the same command and sole target; the open_in_browser row carries all three official_destination_kind values.
  - All rows remain handler_unavailable static intent; no EventRecord, native handler, or runtime is claimed, and no literal denominator is carried here.
validation_surfaces: [Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, python3 scripts/pm-plans-verify.py validate-wiring-matrix, python3 scripts/pm-touch-closure-verify.py --json]
risk_class: production_intent_wiring_and_claim_boundary
reasoning_tier: high
context_scope: commands_shortcuts_wiring_companions
implementation_surfaces: [Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: production_intent_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/UI_Command_Catalog.md#UCC-166, Plans/Commands_System.md#CS-081, reports/packet-integration-completion-20260926/commands-shortcuts.md]
preserved_exact_tokens: [commands.create, commands.update, commands.delete, commands.preview, commands.import_preview, commands.import_commit, commands.export, commands.reset_all, handlers::commands::apply_local_action, handler_unavailable, "expected_event_types=[]", extensions.commands.keyboard-shortcuts, extensions.commands.shortcut-hints, extensions.commands.keyboard-layout, extensions.commands.command-palette-visibility]
negative_constraints: [Do not add a production row for any commands.* local action., Do not retarget an existing row at a local action or rejected spelling., Do not claim native runtime implementation from static wiring., Do not register an event without Event Authority., Do not restore a literal actionable-primary or production-entry count; those denominators belong to scripts/pm-touch-closure-verify.py.]
compile_disposition: extend_existing_owner
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-166, ContractName:Plans/Commands_System.md#CS-081, ContractName:Plans/DRY_Rules.md#DR-042
