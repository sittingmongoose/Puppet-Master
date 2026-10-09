# Shard 046: Commands Shortcuts Central Consumers — 2026-09-26

Source: `Plans/UI_Command_Catalog.md`

Source lines: L13360-L13400

Source SHA256: `5705578cb997d259f3f92c0269cc237d9b9444008a8134b52a77a08a61654ad0`

---

## Commands Shortcuts Central Consumers — 2026-09-26

This section consumes the Commands-owned CS-081 census without minting anything: zero catalog rows are added here. The eight `commands.*` typed local file actions (`commands.create`, `commands.update`, `commands.delete`, `commands.preview`, `commands.import_preview`, `commands.import_commit`, `commands.export`, `commands.reset_all`) are owner-local actions with sole future handler `handlers::commands::apply_local_action`, not UICommand primaries; per CS-060 minting authority and the WM-041 precedent they gain no catalog row and no production wiring row. Required guard: reject every per-command-name, per-binding, custom-command or shortcut namespace alias forbidden by the CS-081 contract, every ID minted from a preset name or binding identity, and every retired first-draft spelling (`commands.save_new`, `commands.save_override`, `commands.save_existing`).

Control resolution over `route:settings/commands-shortcuts`: Create command commits through `commands.create`; hero-sheet fields (Text, Arguments hint, One line, Scope, Persona, Mode, Model, Permissions profile, Enabled) mutate through `commands.update`; Delete command unlinks through `commands.delete`; Preview (dry run) renders through `commands.preview` (inert: no read, shell, ask-flow, permission evaluation, or dispatch); the Import file choice binds a plan through `commands.import_preview`; the Import commit applies it through `commands.import_commit`; Export collects through `commands.export`; Reset applies through `commands.reset_all`. Shortcut add/change/remove/reset and shortcuts backup write the registered Project value `extensions.commands.keyboard-shortcuts` through `cmd.settings.transaction.preview` then `cmd.settings.transaction.apply` (collisions warn, never block); Show shortcut hints toggles `extensions.commands.shortcut-hints` through the same route; keyboard layout (S6) selects `extensions.commands.keyboard-layout` and palette visibility (S7) toggles `extensions.commands.command-palette-visibility` through the same route. Remaining selected controls (New command opener, row opens, lists, `Where command files live`, `Reserved shortcuts`, cheat sheet, `How commands work`, filters, sample input, resolved prompt, run preview, back navigation, modals-as-evidence) are view-only with no dispatch. File roots come from the action target scope plus project binding, never from the Settings scope selector. The seven UCC-165 primaries stay mapped exactly once each; no EventRecord, native handler, or runtime is claimed here.

### UCC-166 - Commands Shortcuts Central Consumers

```yaml
plan_unit_id: UCC-166
unit_type: gui_command_catalog
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: The 2026-09-26 central consumers reference the CS-081 eight-action commands.* typed local census with sole future handler handlers::commands::apply_local_action while adding zero catalog rows; shortcut, hints, layout, and palette controls bind registered Project values through the existing Settings transaction route, remaining controls are view-only, and rejected cmd.* spellings gain no primary.
gui_related: true
gui_classification_reason: This companion resolves every selected Commands and Shortcuts manager control to its typed local action, Settings value route, or view-only classification without adding a visible command.
depends_on: [UCC-165, CS-081]
unblocks: [WM-059]
acceptance_criteria:
  - Zero catalog rows are added; the eight commands.* IDs appear only as referenced local actions with sole future handler handlers::commands::apply_local_action.
  - Every selected mutating control resolves to a commands.* local action or to cmd.settings.transaction.preview/apply against extensions.commands.keyboard-shortcuts, extensions.commands.shortcut-hints, extensions.commands.keyboard-layout, or extensions.commands.command-palette-visibility.
  - Presentation controls are classified view-only with no dispatch; file roots never follow the Settings scope selector.
  - No row ID uses a per-command-name, per-binding, custom-command or shortcut namespace alias forbidden by the CS-081 contract, and no retired commands.save_* spelling is reused.
  - The seven UCC-165 primaries stay mapped exactly once each; no EventRecord, native handler, or runtime is claimed.
validation_surfaces: [Plans/touch_closure.json, Plans/settings_system_contract_fixtures.json, python3 scripts/pm-plans-verify.py validate-wiring-matrix, python3 scripts/pm-plan-index.py validate]
risk_class: central_admission_alias_collision_or_simulated_success
reasoning_tier: high
context_scope: commands_shortcuts_central_consumers
implementation_surfaces: [Plans/UI_Command_Catalog.md, Plans/touch_closure.json]
node_compile_hint: {mode: static_command_catalog_reference_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Commands_System.md#CS-081, Plans/commands_shortcuts_contracts.schema.json, Concepts/pm7-tools/settings_refresh/managers/24-commands.js, reports/packet-integration-completion-20260926/commands-shortcuts.md]
preserved_exact_tokens: [commands.create, commands.update, commands.delete, commands.preview, commands.import_preview, commands.import_commit, commands.export, commands.reset_all, handlers::commands::apply_local_action, route:settings/commands-shortcuts, extensions.commands.keyboard-shortcuts, extensions.commands.shortcut-hints, extensions.commands.keyboard-layout, extensions.commands.command-palette-visibility, handler_unavailable, cmd.settings.transaction.preview, cmd.settings.transaction.apply, commands.save_new, commands.save_override, commands.save_existing]
negative_constraints:
  - Do not add a catalog row for any commands.* local action.
  - Do not mint a cmd.* primary from a preset name, binding identity, or rejected alias.
  - Do not claim a native dispatcher, handler, rendered control, receipt, event, or runtime from static reference.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/Settings_System.md]
owner_boundary_notes: [Commands System owns the local-action census and file semantics; Settings owns transaction execution; this catalog owns the control-resolution reference only.]
```

ContractRef: ContractName:Plans/Commands_System.md#CS-081, ContractName:Plans/DRY_Rules.md#DR-042, ContractName:Plans/touch_closure.json
