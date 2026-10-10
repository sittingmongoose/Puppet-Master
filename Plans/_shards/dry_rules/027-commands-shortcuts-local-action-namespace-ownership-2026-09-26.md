# Shard 027: Commands Shortcuts local-action namespace ownership — 2026-09-26

Source: `Plans/DRY_Rules.md`

Source lines: L2528-L2592

Source SHA256: `ca72c37ea1b762b9c00bc3847eafc82c58fd94427b12ea28bddadd53266ef371`

---

## Commands Shortcuts local-action namespace ownership — 2026-09-26

`commands.*` is a Commands-owned typed local-action namespace (CS-081: `commands.create`, `commands.update`, `commands.delete`, `commands.preview`, `commands.import_preview`, `commands.import_commit`, `commands.export`, `commands.reset_all`). Only `Plans/Commands_System.md` may add or retire IDs under it; no other doc, catalog, wiring row, or User Command may mint, alias, or rebind them; no `cmd.*` spelling may shadow them; and the retired `commands.save_new`/`commands.save_override`/`commands.save_existing` spellings MUST NOT be reused.

Classification: DR-041's "typed local UI actions use typed owner-local controllers and cannot contain a handlers:: domain identity" governs reversible-presentation local UI actions (the `settings.*` presentation set). The `commands.*` file actions are owner-local actions with persistent filesystem effects and exact DR-040 keys — one action ID, one owner contract, one sole native owner handler (`handlers::commands::apply_local_action`), availability with the closed disabled-reason set, and real reverse consumers — so they name their handler without becoming `cmd.*` primaries and without gaining catalog or production rows. Preview stays inert with no read, shell, ask-flow, permission evaluation, or dispatch.

This section supersedes the UCC-165-batch note that the census remains unadmitted: central companions now admit it as `TOUCH-CMDSC-001` through `TOUCH-CMDSC-016` under profile `TCP-CMDSC` (`partial`), the `commands-shortcuts` descriptor's `owner_local_action_refs`, and the UCC-166/WM-059 reference companions. No EventRecord, native handler, or runtime is claimed.

### DR-042 - Commands Local-Action Namespace Ownership

```yaml
plan_unit_id: DR-042
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  commands.* is a Commands-owned typed local-action namespace (CS-081: commands.create,
  commands.update, commands.delete, commands.preview, commands.import_preview,
  commands.import_commit, commands.export, commands.reset_all). Only
  Plans/Commands_System.md may add or retire IDs under it; no other doc, catalog,
  wiring row, or User Command may mint, alias, or rebind them; no cmd.* spelling
  may shadow them; and the retired commands.save_new, commands.save_override, and
  commands.save_existing spellings MUST NOT be reused. These owner-local file actions
  carry exact DR-040 keys with sole native owner handler
  handlers::commands::apply_local_action, gain no catalog or production row, and keep
  preview inert.
gui_related: true
gui_classification_reason: The invariant fixes every Commands and Shortcuts manager control to its owning local action, Settings route, or view-only classification with no duplicate command identity.
split_recommended: false
depends_on: [DR-040, DR-041, CS-081, UCC-166, WM-059]
unblocks: []
acceptance_criteria:
  - "The namespace admits exactly the eight CS-081 commands.* IDs; no ninth action and no cmd.* shadow spelling exists."
  - "Only Plans/Commands_System.md adds or retires IDs under commands.*; retired commands.save_* spellings are never reused."
  - "Owner-local file actions name sole handler handlers::commands::apply_local_action with persistent filesystem effects; reversible-presentation local UI actions carry no handlers:: identity."
  - "No commands.* action has a catalog row or production wiring row; rejected cmd.commands.custom.*, cmd.shortcuts.*, cmd.user_command.*, and cmd.keybinding.* spellings stay rejected."
  - "Preview substitutes sample arguments only with inert placeholders and no read, shell, ask-flow, permission evaluation, or dispatch."
validation_surfaces:
  - python3 scripts/pm-touch-closure-verify.py --json
  - python3 scripts/pm-plans-verify.py validate-touch-closure
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_command_handler_schema_or_gui_authority
reasoning_tier: high
context_scope: commands_local_action_namespace_ownership
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/touch_closure.json
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/settings_system_contract_fixtures.json
node_compile_hint: {mode: exact_key_static_dry_gate_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Commands_System.md#CS-081
  - Plans/commands_shortcuts_contracts.schema.json
  - reports/packet-integration-completion-20260926/commands-shortcuts.md
preserved_exact_tokens: [commands.create, commands.update, commands.delete, commands.preview, commands.import_preview, commands.import_commit, commands.export, commands.reset_all, handlers::commands::apply_local_action, commands.save_new, commands.save_override, commands.save_existing, TOUCH-CMDSC-001, TOUCH-CMDSC-016, TCP-CMDSC, owner_local_action_refs]
negative_constraints:
  - "Do not mint, alias, or rebind a commands.* ID outside Plans/Commands_System.md."
  - "Do not give a commands.* action a catalog row, production row, or cmd.* primary spelling."
  - "Do not present preview as reading, executing, asking, or dispatching."
  - "Do not fabricate controls, handlers, schemas, events, receipts, persistence, or runtime evidence to close a row."
owner_hints: [Plans/DRY_Rules.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md]
```

ContractRef: ContractName:Plans/DRY_Rules.md#DR-040, ContractName:Plans/DRY_Rules.md#DR-041, ContractName:Plans/Commands_System.md#CS-081, ContractName:Plans/UI_Command_Catalog.md#UCC-166, ContractName:Plans/Wiring_Matrix.md#WM-059
