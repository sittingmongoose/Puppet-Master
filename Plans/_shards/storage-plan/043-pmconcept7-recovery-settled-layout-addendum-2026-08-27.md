# Shard 043: PMConcept7 Recovery Settled Layout Addendum - 2026-08-27

Source: `Plans/storage-plan.md`

Source lines: L18225-L18372

Source SHA256: `6cae6d4bebe68a39b13ecadcec32580598254209e62566daff4d272354e4dd08`

---

## PMConcept7 Recovery Settled Layout Addendum - 2026-08-27

This addendum closes current Plans ownership for Usage/Dashboard widget layout and the recovered Home semantic
size fields. Current source lineage is the pinned `Concepts/pm7-tools/base/PM7-base.html` plus the
assertion-guarded T33-T41 pipeline in `Concepts/pm7-tools/build_pm7.py`; `Concepts/PMConcept7.html` remains the
protected generated output and is never a storage owner. Current audit receipts are tracked by
`Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json`; incomplete or failed
rows remain `verification_pending`, so this addendum claims no executable persistence, interaction, visual, or motion acceptance. It
does not create another database family, command family, event family, WorkNode, NodeSeed, executable queue,
implementation task, production implementation, or generated governance output.

### SP-249 - Settled Widget Layout Versioning Migration And Write Boundary

```yaml
plan_unit_id: SP-249
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  The sole widget-layout schema family uses separate host namespaces `widget_layout:v1:usage` and
  `widget_layout:v1:dashboard`. Usage records are scoped to the exact `usage` host and `room_id`; Dashboard
  records are scoped by Dashboard host. The named public Usage record is `UsageWidgetLayoutRecord`; it serializes exactly the
  WS-020-owned required fields `layout_schema_version`, `default_set_version`, `host_id`, `room_id`, `widget_id`,
  `visible`, `order_index`, `slot_id`, `geometry_id`, `semantic_tier_id`, `preset_id`, `configuration_refs`, and
  `committed_revision` needed for deterministic restore. It forbids preview
  rectangles, pointers or pointer coordinates, ghosts, placeholders, animation state, and drafts or per-frame
  drafts. Migration validates identities and
  maps retired geometry to supported current sizes before admission; an unversioned, incompatible, corrupt, or
  unmappable layout is quarantined or reset to the corrected current default and cannot silently override it.
  Existing `cmd.widget.*` commit paths are the only mutation seam; storage is written once after a successful
  settled commit and cancellation writes nothing.
gui_related: true
gui_classification_reason: The persisted record determines restored visible widget order, geometry, semantic content tier, and safe default fallback.
depends_on: [SP-248, WS-009, WS-020, UF-095]
unblocks: []
acceptance_criteria:
  - Usage and Dashboard persist under their separate canonical widget-layout namespaces and never write the Home workspace record.
  - "UsageWidgetLayoutRecord is the named public contract for the settled Usage widget layout and serializes exactly layout_schema_version, default_set_version, host_id, room_id, widget_id, visible, order_index, slot_id, geometry_id, semantic_tier_id, preset_id, configuration_refs, and committed_revision as required fields under the WS-020 field contract."
  - "No preview rectangle, pointer or pointer coordinate, ghost, placeholder, animation state, draft, or per-frame draft is serializable as UsageWidgetLayoutRecord."
  - Migration validates widget identities and maps only to supported current geometry; invalid or unmappable records cannot override corrected defaults.
  - One successful settled widget command results in one storage write; cancellation or unchanged release results in none.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - tests/fixtures/usage_gui/presentation/persistence_migration_matrix.json (static contract fixture only)
  - Plans/shared_runtime_command_contract_fixtures.json (static settled-write boundary fixture only)
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/raw-results.json#/migration_observations"
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/raw-results.json#/transaction_interaction_observations"
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/pointer-pair-verification-report.json"
risk_class: stale_widget_layout_or_preview_state_persistence
reasoning_tier: high
context_scope: settled_widget_layout_storage
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/Widget_System.md
node_compile_hint:
  mode: settled_widget_layout_storage
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm7-tools/base/PM7-base.html (current recovered PMConcept7 source base; source-lineage-only)"
  - "Concepts/pm7-tools/build_pm7.py (current assertion-guarded T33-T41 pipeline)"
  - "Concepts/PMConcept7.html (protected generated output; verification input only; never hand-edit)"
preserved_exact_tokens:
  - widget_layout:v1:usage
  - widget_layout:v1:dashboard
  - default-set version
  - UsageWidgetLayoutRecord
  - committed revision
  - semantic tier
  - preset
negative_constraints:
  - Do not introduce a second Usage or Dashboard widget-layout store.
  - Do not serialize transient interaction state or write storage on pointer-preview frames.
  - Do not allow an invalid old layout to override corrected current defaults.
  - Do not treat the protected generated artifact or an in-progress audit as proof that the storage write contract executes correctly.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Widget_System.md
```

### SP-250 - Home Workspace Cross-Axis And Semantic Preset Persistence

```yaml
plan_unit_id: SP-250
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  `pm.home_workspace_layout.v1` stores committed Home shell surfaces only. Each canonical surface size includes
  `basis_px`, `cross_basis_px`, `flex_weight`, `min_width_px`, and `min_height_px`; `cross_basis_px` owns the
  top/bottom row-dock track thickness and migrates from `basis_px` for pre-field records before canonical
  validation. An optional `preset_id` preserves the committed semantic size identity using `compact`,
  `standard`, `wide`, `tall`, or `focus`, so the shared Home composition can restore the matching adaptive
  content tier. Both fields are settled state: held-resize drafts and pointer coordinates remain local and are
  never serialized. Dashboard widget geometry remains in `widget_layout:v1:dashboard`; the Home record owns
  the Dashboard surface, not the widgets inside it.
gui_related: true
gui_classification_reason: These schema fields determine restored Home dock thickness and adaptive surface content after a committed size change.
depends_on: [SP-245, WS-018, WS-020]
unblocks: []
acceptance_criteria:
  - Plans/home_workspace_layout.schema.json admits and requires cross_basis_px in canonical normalized surface sizes.
  - The schema admits optional preset_id only for compact, standard, wide, tall, or focus.
  - Pre-field records receive cross_basis_px from basis_px during migration before canonical validation; a migration input is not treated as a current canonical record until normalized.
  - Held preview dimensions, pointer coordinates, ghosts, placeholders, and animation state remain absent from the schema and persisted records.
  - Dashboard widget geometry cannot be written into the Home surface record.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Draft 2020-12 validation of Plans/home_workspace_layout.schema.json
  - Concepts/pm7-tools/verify/home_workspace_matrix.mjs
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/raw-results.json#/home_restoration_observations"
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/browser-verification-report.json"
risk_class: home_cross_axis_or_semantic_preset_schema_drift
reasoning_tier: high
context_scope: home_workspace_cross_axis_semantic_preset
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/home_workspace_layout.schema.json
  - Plans/storage_value_registry.json
node_compile_hint:
  mode: home_workspace_cross_axis_semantic_preset
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm7-tools/base/PM7-base.html (current recovered PMConcept7 source base; source-lineage-only)"
  - "Concepts/pm7-tools/build_pm7.py (current assertion-guarded T33-T41 pipeline)"
  - "Concepts/PMConcept7.html (protected generated output; verification input only; never hand-edit)"
  - Plans/home_workspace_layout.schema.json
preserved_exact_tokens:
  - pm.home_workspace_layout.v1
  - basis_px
  - cross_basis_px
  - preset_id
  - compact
  - standard
  - wide
  - tall
  - focus
negative_constraints:
  - Do not add preview-only fields to the canonical Home layout schema.
  - Do not place Dashboard widget geometry in the Home surface layout record.
  - Do not claim schema acceptance proves runtime migration or persistence behavior.
  - The run-002 Home observation binds only restored visible Home composition; product persistence and migration remain schema-governed and are not promoted to executed native-runtime evidence.
owner_hints:
  - Plans/storage-plan.md
  - Plans/home_workspace_layout.schema.json
```
