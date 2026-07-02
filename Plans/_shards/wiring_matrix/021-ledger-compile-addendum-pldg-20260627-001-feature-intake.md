# Shard 021: Ledger Compile Addendum - pldg-20260627-001-feature-intake

Source: `Plans/Wiring_Matrix.md`

Source lines: L3187-L3260

Source SHA256: `92272bddd30537bddea3eaa0e8a3c7c69a01b24826ada938495dd0da0bded28b`

---

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Wiring Matrix owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### WM-039 - Notifications And Sounds Settings Wiring

```yaml
plan_unit_id: WM-039
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Notifications and Sounds wiring maps `cmd.settings.open_notifications` to Settings > General > Notifications & Sounds;
  destination create/update/delete/toggle/test commands to notification destination storage, credential custody, live-send
  authority, delivery service, and receipt projection; mapping/override commands to global/project override records; and
  sound preview/upload/pack import/asset delete/asset restore/asset export/mapping set commands to sound asset validation,
  manifest storage, PM-managed blobs, and local-only preview. Destination create/update wiring validates provider-specific
  Slack, Discord, generic webhook, ntfy, Pushover, and Telegram profile payloads against CV-298 before writing non-secret
  settings and credential refs. This PlanUnit records wiring obligations only and does not generate wiring JSON.
gui_related: true
gui_classification_reason: Defines user-visible settings command wiring and command-to-surface behavior.
depends_on: [UCC-103, F3-405, CV-298, SP-222, PS-124]
unblocks: [ATS-016]
acceptance_criteria:
  - Destination test-send wiring requires explicit user action, enabled destination, masking, rate limit, and receipt recording.
  - Provider-specific destination payloads are validated before storage or live-send test wiring can proceed.
  - Sound preview wiring stays local-only and cannot send remote notifications.
  - Global/project override wiring follows built-in < global < project < runtime safety constraints.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Notifications and Sounds wiring fixtures
risk_class: notification_wiring_gap
reasoning_tier: high
context_scope: notifications_sounds_wiring
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - future Settings command wiring
node_compile_hint:
  mode: notifications_sounds_settings_wiring
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-settings-gui-command-wiring
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-global-project-overrides
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0064
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0065
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0068
source_atom_ids: [atom-0064, atom-0065, atom-0068]
preserved_exact_tokens:
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
  - Do not generate wiring JSON, WorkNodes, or executable queues during this compile phase.
  - Do not wire local preview through remote delivery.
  - Do not let quiet/mute override blocked or security-sensitive notifications.
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
```
