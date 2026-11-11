# Shard 042: Remaining Runtime Canon Closure Addendum (2026-08-14)

Source: `Plans/FinalGUISpec.md`

Source lines: L5353-L5444

Source SHA256: `47bdc54078fbaccc26be55db33e7ef25785c8f170d671be0fa69ddd2375af69c`

---

## Remaining Runtime Canon Closure Addendum (2026-08-14)

This addendum supersedes conflicting Settings and protected-browser presentation clauses without creating implementation or generated-governance artifacts.

### F3-510 - Layered Settings Resolution And Detached Copy

```yaml
plan_unit_id: F3-510
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: |-
  Settings presentation consumes the sparse own-value ladder in SSYS-002/059 and the effective-value result, not independently interpreted storage. SSYS-002/059 and F3-670 supply the single effective result for Default → Everywhere → Computer (Device for screen rows) → Project → existing owner/chat/run/tab levels, with Managed constraints and the declared more-careful/Computer-ceiling exceptions. App contexts omit Project. Own values remain sparse; detached copied own values do not follow their source Project. Setting Details separates origin, own value, requested/effective value, factory difference, variation elsewhere, managed restriction and stale source. A changed Everywhere value updates following contexts; an explicit Project own value still wins subject to declared safety/ceiling rules. Copy Settings From remains one previewed detached Settings transaction with owner contributions and atomic per-writer readback/rollback.
gui_related: true
gui_classification_reason: Settings source, scope, preview, override, reset, and effective-value disclosure are visible behavior.
depends_on: [F3-439, F3-442]
unblocks: []
acceptance_criteria:
- The one resolver supplies value, source, Changed and Varies for app and Project contexts.
- A following Project changes when a wider value changes; a Project own value remains its own.
- Copy stays detached; stale/offline sources do not fabricate a saved value.
validation_surfaces: [settings inventory schema validation, project settings scope fixtures]
risk_class: settings_scope_or_inheritance_drift
reasoning_tier: high
context_scope: concrete_project_settings
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/settings_inventory.json]
node_compile_hint: {mode: concrete_project_settings_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#SET-012
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-work-packages;
  /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md; A-F01,A-F08,A-F09,C-F11
negative_constraints:
- Do not implement a second settings resolver or continuous linking to the Project that was copied.
- Do not retain the superseded universal inheritance/no-app-write ban.
```

### F3-511 - Settings Lifecycle And Recovery

```yaml
plan_unit_id: F3-511
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: |-
  Settings lifecycle supports schema-versioned previewed import, export, backup, restore, reset, and migration with scope disclosure, secret exclusion, owner validation, atomic commit, read-back, rollback, and a durable result; unsupported versions or owner-invalid values fail closed without partial mutation. A level transaction names level/key and per-setting revisions, includes owner whole-thing contributions and account readiness refs, and reports per-target done/not_reached/refused for a multi-Computer batch without queueing or claiming distributed atomicity. Join Undo lasts 30 days; ordinary change Undo follows its owner policy. Secret bytes, installations, pairings and trust grants are excluded.
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
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-work-packages;
  /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md; A-F01,A-F03,A-F08,B-F02
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
