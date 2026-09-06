# Shard 042: Remaining Runtime Canon Closure Addendum (2026-08-14)

Source: `Plans/FinalGUISpec.md`

Source lines: L5205-L5288

Source SHA256: `342462919f6e41f5f85d7c9e4eaf265d109a277d8ac29b0b7343a69abd20694c`

---

## Remaining Runtime Canon Closure Addendum (2026-08-14)

This addendum supersedes conflicting Settings and protected-browser presentation clauses without creating implementation or generated-governance artifacts.

### F3-510 - Concrete Project Settings Resolution

```yaml
plan_unit_id: F3-510
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Project settings are concrete persisted project values with an explicit source and effective-value projection; Global values may seed a project only through a previewed one-time copy, and copied, explicitly set, reset, imported, invalid, and unavailable are distinguishable without any continuous inheritance state.
gui_related: true
gui_classification_reason: Settings source, scope, preview, override, reset, and effective-value disclosure are visible behavior.
depends_on: [F3-439, F3-442]
unblocks: []
acceptance_criteria:
  - SET-012 is owned here for behavior while Plans/settings_inventory.json remains the machine inventory.
  - A Project value never changes merely because a Global value changed; there is no inherited Project state.
  - One-time copy previews the exact keys and supports atomic read-back or rollback.
validation_surfaces: [settings inventory schema validation, project settings scope fixtures]
risk_class: settings_scope_or_inheritance_drift
reasoning_tier: high
context_scope: concrete_project_settings
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/settings_inventory.json]
node_compile_hint: {mode: concrete_project_settings_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#SET-012
negative_constraints: [Do not treat Settings inventory rows as behavior authority., Do not silently convert copied values into inheritance., Do not store or resolve an inherited Project state.]
```

### F3-511 - Settings Lifecycle And Recovery

```yaml
plan_unit_id: F3-511
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Settings lifecycle supports schema-versioned previewed import, export, backup, restore, reset, and migration with scope disclosure, secret exclusion, owner validation, atomic commit, read-back, rollback, and a durable result; unsupported versions or owner-invalid values fail closed without partial mutation.
gui_related: true
gui_classification_reason: Settings import, export, reset, migration, validation, recovery, and result disclosure are user-facing flows.
depends_on: [F3-510]
unblocks: []
acceptance_criteria:
  - SET-013 is owned here for visible behavior and exact scope disclosure.
  - Export and backup omit raw secrets and local machine paths; import cannot create unsupported manager destinations.
  - Reset and migration identify changed keys and restore the previous valid state when commit/read-back fails.
validation_surfaces: [settings lifecycle positive and negative fixtures]
risk_class: settings_lifecycle_data_loss
reasoning_tier: high
context_scope: settings_lifecycle_recovery
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/settings_inventory.json, Plans/storage-plan.md]
node_compile_hint: {mode: settings_lifecycle_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#SET-013
negative_constraints: [Do not describe Settings as having no import or export lifecycle., Do not persist raw credentials in Settings exports.]
```

### F3-512 - Protected Auth Browser Surface Discrimination

```yaml
plan_unit_id: F3-512
unit_type: security_constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Every browser-facing GUI contract discriminates ordinary from protected_auth subjects; ordinary Browser Program surfaces may expose policy-approved navigation, observation, DevTools, capture, artifacts, and automation, while protected AuthBrowserSession exposes only its foreground human interaction and redacted lifecycle or denial metadata outside that surface.
gui_related: true
gui_classification_reason: Defines the visible protected authentication surface and every prohibited adjacent GUI consumer.
depends_on: [F3-509, SMPFS-145]
unblocks: []
acceptance_criteria:
  - Generic navigation, capture, recording, screenshot, DOM/PageRepresentation, console, network, storage, profile, clipboard, artifact, Chat, agent, tool, BSD, and awareness-detail paths reject protected_auth.
  - AuthBrowserSession is ephemeral and cannot be restored, promoted, attached, shared, or represented as an ordinary tab or PreviewSession overlay.
  - Outside the foreground human-only surface, only redacted lifecycle, domain-policy, and denial metadata may render.
validation_surfaces: [protected AuthBrowser schema negative fixtures, GUI command subject-discriminator audit]
risk_class: protected_auth_browser_escape
reasoning_tier: high
context_scope: protected_auth_browser_gui_boundary
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/protected_auth_browser_contracts.schema.json]
node_compile_hint: {mode: protected_auth_browser_gui_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md
negative_constraints: [Do not expose protected authentication content outside its human-only surface., Do not preserve legacy auth_session capabilities as live behavior.]
```
