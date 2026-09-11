# Shard 013: Ledger Compile Addendum - pldg-20260627-001-feature-intake

Source: `Plans/UI_Command_Catalog.md`

Source lines: L7537-L7689

Source SHA256: `f464cd8c3d8971c2dff2e913983a3d7e24dfbac25ab8f4253c88a4b52a6146e1`

---

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into UI Command Catalog owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### UCC-103 - Notifications And Sounds Command Catalog

```yaml
plan_unit_id: UCC-103
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Notifications and Sounds navigation uses the current `cmd.settings.open` typed Settings route. The historical
  `cmd.settings.open_notifications` spelling is retained only as non-alias local-affordance lineage and receives no
  primary handler or production-wiring row. Domain commands include destination create/update/delete/toggle/test,
  notification mapping update, runtime override set, and sound preview/upload/pack import/asset delete/asset restore/asset
  export/mapping set. Destination test commands require explicit user action, enabled destination authority, rate limiting,
  masking, and receipt recording. Destination create/update payloads carry provider-specific profile fields from CV-298
  for Slack, Discord, generic webhook, ntfy, Pushover, and Telegram while storing only credential refs for secrets. Sound
  preview is local only and must not send external notifications.
gui_related: true
gui_classification_reason: Defines user-visible settings, destination, mapping, preview, upload, import/export, and test-send commands.
depends_on: [CV-298, PS-124]
unblocks: [WM-039, ATS-016]
acceptance_criteria:
  - The Notifications & Sounds navigation affordance emits cmd.settings.open with a Settings-owned typed target; cmd.settings.open_notifications is not a command or alias.
  - Every Notifications & Sounds domain control routes through its stable owner command ID.
  - Destination create/update commands accept provider-specific profile payloads without exposing raw URLs or tokens.
  - Test-send commands are separate from local preview and cannot mutate alert state.
  - Sound asset commands distinguish user-uploaded assets, imported packs, built-ins, hide/disable, restore, and export behavior.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Notifications and Sounds command catalog fixtures
risk_class: notification_command_catalog_gap
reasoning_tier: high
context_scope: notifications_sounds_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - future Settings > General > Notifications & Sounds commands
node_compile_hint:
  mode: notifications_sounds_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-settings-gui-command-wiring
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:preview-test-send-accessibility
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0064
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0068
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0069
source_atom_ids: [atom-0064, atom-0068, atom-0069]
preserved_exact_tokens:
  - "cmd.settings.open"
  - "cmd.settings.open_notifications"
  - "cmd.notifications.destination.create"
  - "cmd.notifications.destination.update"
  - "cmd.notifications.destination.delete"
  - "cmd.notifications.destination.toggle"
  - "cmd.notifications.destination.test"
  - "cmd.notifications.mapping.update"
  - "cmd.notifications.override.set"
  - "cmd.sound.preview"
  - "cmd.sound.upload"
  - "cmd.sound.pack.import"
  - "cmd.sound.asset.delete"
  - "cmd.sound.asset.restore"
  - "cmd.sound.asset.export"
  - "cmd.sound.mapping.set"
negative_constraints:
  - Do not register, alias, or wire cmd.settings.open_notifications; retain it only as local-affordance source lineage.
  - Do not route local sound preview through external notification delivery.
  - Do not make test-send implicit from saving settings.
  - Do not create visualizer bridge aliases as UI command IDs unless they dispatch outside the iframe host bridge.
compatibility_only_notes:
  - "cmd.settings.open_notifications is a retired local-affordance spelling with no alias; the current affordance emits cmd.settings.open with the typed Settings target."
stale_retired_dispositions:
  - "cmd.settings.open_notifications: retained source lineage only; no primary handler, production-wiring row, or alias."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
```

### UCC-104 - DRY Method Settings Command

```yaml
plan_unit_id: UCC-104
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Under DL-041, the DRY Method toggle's eventual mutation path reuses cmd.settings.transaction.preview and
  cmd.settings.transaction.apply from SSYS-018 and the Settings atomic mutation envelope. Until an owner-proven
  mapping from the exact guard key to a valid ordinary setting_id and its writer exists, the toggle is disabled
  with the existing owner_contract_missing reason and dispatches no mutation command or setting write. Preserve the exact guard identity
  app.agent_rules.dry_method_default_guard and values enabled | disabled_by_user. The approved future event
  identity for this change is settings.updated, carrying that exact setting key and the existing transaction_id
  from pm.settings_transaction_result.v1, joined to request_id, project_id, changed_setting_ids, revisions and
  receipt_ref under the current owner contract. Event Authority must independently admit a closed payload and
  producer/consumer binding before emission; this naming choice does not register a family. The historical
  settings.agent_rules.dry_method_default_guard.updated spelling is read-only source/history lineage, not an
  automatic alias or permission to rewrite old payloads. cmd.settings.agent_rules.dry_method_default_guard.set
  is retired source lineage, with no primary handler, production row or dispatch alias. Visible Settings > General >
  Agent Rules and Assistant Chat DRY disclosure preserve their help copy: disabling the default reuse-first guard
  does not disable explicit project/user instructions, safety, secrets, source authority, governance, permissions,
  source-control hygiene, or receipt provenance.
gui_related: true
gui_classification_reason: Defines a user-visible Settings command, toggle payload, event, and help copy.
depends_on: [CV-299, SP-223]
unblocks: [WM-040, ATS-018]
acceptance_criteria:
  - Until the exact guard-key/writer mapping is owner-proven, the toggle is disabled with owner_contract_missing and dispatches zero mutation commands and writes zero setting values. After that prerequisite, the existing preview/apply sequence and enabled | disabled_by_user values apply; no per-setting command or handler is reintroduced.
  - Future settings.updated records preserve app.agent_rules.dry_method_default_guard and the existing committed transaction identity after independent Event Authority admission; historical dedicated spellings remain read-only without an assumed payload alias.
  - The visible command copy explains that disabling DRY only disables the default reuse-first guard.
  - Command handling preserves DRY receipt provenance and does not weaken non-DRY authority boundaries.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - DRY Method settings command fixture
risk_class: dry_method_settings_command_gap
reasoning_tier: high
context_scope: dry_method_settings_command
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - future Settings > General > Agent Rules commands
node_compile_hint:
  mode: dry_method_settings_command_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-app-default
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-001
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-002
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0089
source_atom_ids: [atom-0073, atom-0089]
decision_refs: [dec-0016, dec-0017]
preserved_exact_tokens:
  - "cmd.settings.agent_rules.dry_method_default_guard.set"
  - "app.agent_rules.dry_method_default_guard"
  - "enabled"
  - "disabled_by_user"
  - "Settings > General > Agent Rules"
  - "DRY Method is on by default. Turning it off disables only PM's default reuse-first guard; project/user instructions, safety, secrets, source authority, governance, permissions, and source-control rules still apply."
negative_constraints:
  - Do not make DRY opt-in by default.
  - Do not treat disabled DRY as permission to bypass explicit instructions, safety, secrets, source authority, governance, permissions, or source-control hygiene.
  - Do not delete DRY receipt provenance when the user disables the default guard.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
```
