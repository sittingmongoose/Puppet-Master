# Shard 043: PMConcept7 Recovery Settled Layout Addendum - 2026-08-27

Source: `Plans/storage-plan.md`

Source lines: L18527-L18726

Source SHA256: `c836901e05afcb382d84b0d0377ab9e918d474d1df14a4484dafbb81a64713bc`

---

## PMConcept7 Recovery Settled Layout Addendum - 2026-08-27

This addendum closes current Plans ownership for Usage/Dashboard widget layout and the recovered Home semantic
size fields. `Concepts/PMConcept7.html` illustrates this behavior and is never a storage owner.
Audit receipts are tracked by
`Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json`; incomplete or failed
rows remain `verification_pending`, so this addendum claims no executable persistence, interaction, visual, or motion acceptance. It
does not create another database family, command family, event family, WorkNode, NodeSeed, executable queue,
implementation task, production implementation, or generated governance output.

Amended 2026-10-10 (DL-186): dashboard boards and presets. Dashboard tabs now run on the Usage board engine, one board per tab, and Jared's answers to the dashboard questions (D10 P1-P13, D35) settle what is kept where. `Plans/Widget_System.md#WS-030` owns the boards, their ids, sets and presets, and `Plans/FinalGUISpec.md#F3-638` their look; this passage owns keys, scope, migration and deletion. It supersedes this addendum's single Dashboard namespace for new writes: the sentences below that name `widget_layout:v1:dashboard` describe the old single Dashboard layout only.

- **Boards, per project (P5).** Each board the engine runs (`home`, `metrics`, `monitoring` and every `dash-<n>` a person makes) keeps one envelope of this widget-layout family under `widget_layout:v1:<project_id>:<board_id>`, registered as family `dashboard_board_layout` in `Plans/storage_value_registry.json`. The `project_id` is 1 to 64 characters with no white space and no colon. The envelope's `host_id` is `home.dashboard`, its project is the board's real project and each record's `room_id` is the board id. Besides the widgets (their sizes, order, visibility and configuration, as `UsageWidgetLayoutRecord` above), the envelope keeps the board's view (range and scope, written by the typed local action `ui.widget_board.set_view`, lead ruling F1), the `set_id` of the set the board was started from when that set is not `default`, and a custom dashboard's name (trimmed, runs of white space made one, at most 80 characters; the default "Dashboard <n>" is not stored). Agents is drawn by the dashboard kind and stores nothing here. The ids `usage` and `dashboard` and the Usage room ids are never board ids, so no board key meets `widget_layout:v1:usage` or the old `widget_layout:v1:dashboard`. An envelope that cannot be read is set aside under its key with `:quarantine` added, and the board starts again from its own default set, as the rule above for an unreadable layout says.
- **A project switch** writes each open board to the old project's key and reads it from the new project's.
- **One-time adoption.** A board saved under the unscoped `widget_layout:v1:<board_id>` by the panels concept's first build of these boards is adopted once, by the first project that shows that board while its own key is missing: the envelope is taken, its project rewritten to that project, and the unscoped key removed. The form `widget_layout:v1:dashboard:<board_id>` that canon named on 2026-10-09 was never written, so nothing migrates from it.
- **The old Dashboard layout (P1, option B).** `widget_layout:v1:dashboard` holds the old Home widgets (run progress, lanes, results), which leave Home. It is converted into no board, never written again and kept read-only as a rollback record, like `dashboard_layout:v1`.
- **Forgetting a board (D35, P6).** Delete dashboard... (custom dashboards only, after a confirm) deletes the board's key, its quarantine copy and its name. When a custom dashboard leaves the reopen list (the closed-tab stack of 20, SP-330) while it is not open as a tab, the same three are deleted. Home, Metrics and Monitoring keep their stores; they are reset, never deleted. A saved named layout may keep its own snapshot of a board (SP-330).
- **Presets, per user (P4, D35).** A person's saved presets belong to the person, not to a project: one record under `widget_presets:v1`, registered as family `widget_presets`. Each preset holds its id, its name, when it was saved, the board it was saved from, the layout of the widgets shown at each board class (S, M, L and XL, `Plans/Widget_System.md#WS-017`), each widget's size preset and each widget's configuration, and never a board's view. A name is trimmed, runs of white space made one, at most 80 characters, and an unnamed preset is "Preset <n>". Saving, renaming and deleting a preset are typed local actions with no command, receipt or event (`ui.widget_preset.save`, `ui.widget_preset.rename`, `ui.widget_preset.delete`, lead ruling F2). Applying one is `cmd.widget.reset_layout` with `set_id` `user:<preset_id>`, which writes the board's own key; deleting a preset leaves the boards that started from it as they are.
- **Registration.** Both families are registered `deferred_not_build_blocking` with retention `RP-CONFIG-CURRENT`: their keys, scope, quarantine, adoption and deletion are fixed here, and their value schema waits for the physical schema of this family's envelope, which `UsageWidgetLayoutRecord` describes record by record but no schema file holds yet. The panels concept's own stores (`pm.home.dashboards:v1:<project>` for names, its preset and board envelope schema ids) are concept lineage only, never product keys.

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
  Amended 2026-10-10 (DL-186): dashboard boards keep their envelopes per project under
  `widget_layout:v1:<project_id>:<board_id>` (family `dashboard_board_layout`; host `home.dashboard`, `room_id` the
  board id; the envelope also keeps the board's view, a non-default `set_id` and a custom dashboard's name), set an
  unreadable envelope aside under `:quarantine`, adopt an unscoped `widget_layout:v1:<board_id>` once and remove it,
  and forget a custom board's key, quarantine copy and name when it is deleted or leaves the reopen list unopened.
  The old `widget_layout:v1:dashboard` converts into no board and is never written again. Presets are per user
  under `widget_presets:v1` (family `widget_presets`), saved, renamed and deleted by typed local actions; applying
  one is `cmd.widget.reset_layout` with `set_id` `user:<preset_id>`. View, preset and board-forgetting writes are
  not `cmd.widget.*` commits and take no receipt or event; every widget change on a board still is one.
  Board contents are scoped per project and per board; custom dashboard names are kept per project, with
  whitespace collapsed, trimmed to at most 80 characters and made unique against that project's dashboards
  and the built-ins by suffixes 2, 3 and so on. An empty or default Dashboard <n> name removes its stored
  entry. A project switch saves the old project's boards and rebinds every mounted board whose tab is
  retained, including hidden boards, then reloads that project's custom names. No concept-only custom-name
  storage key is admitted by this rule.
gui_related: true
gui_classification_reason: The persisted record determines restored visible widget order, geometry, semantic content tier, and safe default fallback.
depends_on: [SP-248, WS-009, WS-020, UF-095, DL-186]
unblocks: []
acceptance_criteria:
  - Usage and Dashboard persist under their separate canonical widget-layout namespaces and never write the Home workspace record.
  - "UsageWidgetLayoutRecord is the named public contract for the settled Usage widget layout and serializes exactly layout_schema_version, default_set_version, host_id, room_id, widget_id, visible, order_index, slot_id, geometry_id, semantic_tier_id, preset_id, configuration_refs, and committed_revision as required fields under the WS-020 field contract."
  - "No preview rectangle, pointer or pointer coordinate, ghost, placeholder, animation state, draft, or per-frame draft is serializable as UsageWidgetLayoutRecord."
  - Migration validates widget identities and maps only to supported current geometry; invalid or unmappable records cannot override corrected defaults.
  - One successful settled widget command results in one storage write; cancellation or unchanged release results in none.
  - "A dashboard board's widgets, view, non-default set_id and custom name are written only to widget_layout:v1:<project_id>:<board_id> of the board's own project; a project switch writes the open boards to the old project's keys and reads the new project's; no board key is ever usage, dashboard or a Usage room id."
  - "An unscoped widget_layout:v1:<board_id> is adopted once into the first project that shows the board while its key is missing and is then removed; widget_layout:v1:dashboard is never converted into a board or written."
  - "Deleting a custom dashboard, or its leaving the reopen list while not open, deletes its key, its :quarantine copy and its name; Home, Metrics and Monitoring keep theirs."
  - "Presets are one per-user record under widget_presets:v1 holding id, name, saved time, source board, the layout per board class S, M, L and XL, each widget's size preset and configuration, never a board's view; names are at most 80 characters, default Preset <n>; save, rename and delete take no receipt or event."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - tests/fixtures/usage_gui/presentation/persistence_migration_matrix.json (static contract fixture only)
  - Plans/storage_value_registry.json (families dashboard_board_layout and widget_presets)
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
  - "Concepts/pm7-tools/base/PM7-base.html (historical PM7 prototype lineage only)"
  - "Concepts/pm7-tools/build_pm7.py (historical PM7 prototype lineage only)"
  - "Concepts/PMConcept7.html (look-and-behaviour reference only)"
  - "Plans/Decision_Log.md#DL-186"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md, SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D35)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/D10-DESIGN-per-instance-boards.md, SHA-256 927d0ed893c513f2f20efa3ff678f19ba785ac43cf84d690412038daa5d41796 (P1, P4, P5, P6; Jared's answers relayed by the planning thread, pm-mail 1010191613-9ce1; the panels thread's build facts, pm-mail 1010221905-e13e and 1010223444-a10e)"
  - "Concepts/home-redesign/CONTRACT.md at c4e32ec0b7, SHA-256 8b1222cde3bb53a6ce534f5e436cc20b8829a230612b9e38654f5174e8d013b9 (section 3.1, the Dashboard kind's keys, adoption, names and forgetting; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-NUMBERS-51c316e18b.md, SHA-256 a9c42b88e5cb50706ff1716a254cb68e026a538bb7a0c840905779a9a482cff2 (small-round concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-CONTRACT-2926ad987e.md, SHA-256 c579d0dfef41fd1fc7327d14c2adb9e2b101c24b216ff64a9db5fc19895ad989 (small-round concept lineage only)"
preserved_exact_tokens:
  - widget_layout:v1:usage
  - widget_layout:v1:dashboard
  - "widget_layout:v1:<project_id>:<board_id>"
  - "widget_layout:v1:<board_id>"
  - ":quarantine"
  - widget_presets:v1
  - home.dashboard
  - dashboard_board_layout
  - widget_presets
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
  - "Do not share a board across projects, write a board under the old widget_layout:v1:dashboard or widget_layout:v1:dashboard:<board_id>, or keep presets per project."
compatibility_only_notes:
  - "widget_layout:v1:dashboard (the old single Dashboard layout) stays a read-only rollback record, like dashboard_layout:v1; 'Dashboard records are scoped by Dashboard host' describes it only."
  - "The concept's pm.home.dashboards:v1:<project> name store and its board and preset envelope schema ids are concept lineage only."
stale_retired_dispositions:
  - "Amended 2026-10-10 (DL-186): dashboard boards are per project under widget_layout:v1:<project_id>:<board_id> with quarantine, one-time adoption and forgetting; presets are per user under widget_presets:v1; the single Dashboard namespace is the old layout's only."
  - "Amended 2026-10-11 (wave 2, panels NUMBERS 51c316e18b): Board contents are per project and board, and custom names remain per project without a concept-only key."
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
  Amended 2026-10-10 (DL-186): this describes the v1 record; dashboard boards now keep their widgets per project
  under `widget_layout:v1:<project_id>:<board_id>` (SP-249), and `widget_layout:v1:dashboard` is read-only.
gui_related: true
gui_classification_reason: These schema fields determine restored Home dock thickness and adaptive surface content after a committed size change.
depends_on: [SP-245, WS-018, WS-020, DL-186]
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
  - "Concepts/pm7-tools/base/PM7-base.html (historical PM7 prototype lineage only)"
  - "Concepts/pm7-tools/build_pm7.py (historical PM7 prototype lineage only)"
  - "Concepts/PMConcept7.html (look-and-behaviour reference only)"
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
stale_retired_dispositions:
  - "Amended 2026-10-10 (DL-186): the widget_layout:v1:dashboard sentence describes the v1 record only; boards are per project (SP-249)."
owner_hints:
  - Plans/storage-plan.md
  - Plans/home_workspace_layout.schema.json
```
