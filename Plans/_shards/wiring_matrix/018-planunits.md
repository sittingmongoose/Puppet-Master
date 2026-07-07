# Shard 018: PlanUnits

Source: `Plans/Wiring_Matrix.md`

Source lines: L642-L2972

Source SHA256: `0e61b92e963a49a3a7d2ef861c8715659d4a977bdb72d2594152ec2699d8363c`

---

## PlanUnits

### WM-002 - Document Authority And Compatibility Naming Guard

```yaml
plan_unit_id: WM-002
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Plans/Wiring_Matrix.md is the canonical wiring matrix owner document and preserves `PUPPET MASTER -- UI WIRING MATRIX SSOT`, the platform name `Puppet Master`, and older naming only as compatibility-only legacy naming.'
gui_related: true
gui_classification_reason: 'The span includes UI wiring matrix authority and naming rules for user-visible UI wiring docs.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- WM-002 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: wiring_doc_authority
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0003
preserved_exact_tokens:
- 'Wiring Matrix (Canonical)'
- 'Canonical owner-section requirements'
- 'Route/open compatibility-only fallback marking'
- 'PUPPET MASTER -- UI WIRING MATRIX SSOT'
- 'Puppet Master'
- 'legacy naming'
- 'do not quote it'
- 'Plans/DRY_Rules.md'
- 'Plans/Contracts_V0.md'
- 'Plans/Decision_Policy.md'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- 'Older naming exists only as legacy naming and must not be quoted as live platform naming.'
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/DRY_Rules.md'
- 'Plans/Contracts_V0.md'
- 'Plans/Decision_Policy.md'
```

### WM-003 - Wiring Matrix Scope And Schema Ownership

```yaml
plan_unit_id: WM-003
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'This document provides the wiring matrix template and examples, while real project wiring matrices are generated or maintained as JSON validated against `Plans/Wiring_Matrix.schema.json` and gated by `GATE-010`.'
gui_related: false
gui_classification_reason: 'The unit defines schema/gate ownership rather than visual presentation.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-002
unblocks: []
acceptance_criteria:
- WM-003 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: wiring_matrix_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0004
preserved_exact_tokens:
- '0. Scope'
- 'wiring matrix template and example entries'
- 'generated/maintained as JSON'
- 'Plans/Wiring_Matrix.schema.json'
- 'GATE-010'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: SchemaID:Wiring_Matrix.schema.json, ContractName:Plans/UI_Wiring_Rules.md, Gate:GATE-010'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/UI_Wiring_Rules.md'
```

### WM-004 - Entry Template Contract

```yaml
plan_unit_id: WM-004
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Wiring matrix entries expose `ui_element_id`, `ui_location`, `ui_command_id`, `handler_location`, `expected_event_types`, `acceptance_checks`, and `evidence_required`, with JSON `entries` keyed by `ui_element_id` for unique interactive element IDs.'
gui_related: true
gui_classification_reason: 'The unit defines UI element and command wiring table fields for visible interactive elements.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-003
unblocks: []
acceptance_criteria:
- WM-004 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: entry_template
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0005
preserved_exact_tokens:
- 'ui_element_id'
- 'ui_location'
- 'ui_command_id'
- 'handler_location'
- 'expected_event_types'
- 'acceptance_checks'
- 'evidence_required'
- 'entries'
- 'map keyed by `ui_element_id`'
- 'btn.github.connect'
- 'Settings > GitHub/Auth'
- 'handlers::github_auth::connect'
- 'crate::core::handlers::auth::connect'
- '(none — UI-only)'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Primitive:UICommand, ContractName:Plans/Contracts_V0.md#7-uicommand, Gate:GATE-010'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Contracts_V0.md'
- 'Plans/UI_Command_Catalog.md'
```

### WM-005 - Catalog Example Rows

```yaml
plan_unit_id: WM-005
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'The Markdown example rows remain `(EXAMPLE)` rows drawn from `Plans/UI_Command_Catalog.md`, preserving the listed command IDs for GitHub auth, LSP, widgets, graph selection/retry, orchestrator tab switching, and chat thread creation.'
gui_related: true
gui_classification_reason: 'The unit preserves user-visible UI element example wiring rows.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
unblocks: []
acceptance_criteria:
- WM-005 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: example_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0006
preserved_exact_tokens:
- 'Example Entries'
- '(EXAMPLE)'
- 'btn.github.connect'
- 'btn.github.disconnect'
- 'menu.lsp.goto_def'
- 'menu.lsp.find_refs'
- 'btn.widget.add'
- 'btn.widget.remove'
- 'node.graph.select'
- 'btn.graph.retry'
- 'tab.orchestrator.switch'
- 'btn.chat.new'
- 'cmd.github.connect'
- 'cmd.github.disconnect'
- 'cmd.lsp.goto_definition'
- 'cmd.lsp.find_references'
- 'cmd.widget.add'
- 'cmd.widget.remove'
- 'cmd.graph.select_node'
- 'cmd.graph.retry_node'
- 'cmd.orchestrator.switch_tab'
- 'cmd.chat.new'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, SchemaID:Wiring_Matrix.schema.json'
- 'ContractRef: UICommand:cmd.github.connect, UICommand:cmd.github.disconnect, UICommand:cmd.lsp.goto_definition, UICommand:cmd.lsp.find_references, UICommand:cmd.widget.add, UICommand:cmd.widget.remove, UICommand:cmd.graph.select_node, UICommand:cmd.graph.retry_node, UICommand:cmd.orchestrator.switch_tab, UICommand:cmd.chat.new'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/UI_Command_Catalog.md'
```

### WM-006 - Json Example Shape

```yaml
plan_unit_id: WM-006
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'The JSON example preserves `pm.wiring_matrix.v0`, representative keyed entries, schema linkage, expected events, acceptance checks, evidence paths, and EventRecord linkage.'
gui_related: true
gui_classification_reason: 'The JSON examples describe UI element records and their event wiring.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
unblocks: []
acceptance_criteria:
- WM-006 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: json_example
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0007
preserved_exact_tokens:
- 'JSON Example'
- 'pm.wiring_matrix.v0'
- 'generated_at'
- 'btn.github.connect'
- 'menu.lsp.goto_def'
- 'btn.widget.add'
- 'auth.github.device_code.issued'
- 'auth.github.token.polling'
- 'auth.github.authenticated'
- 'auth.github.failed'
- 'tool.invoked'
- 'evidence/wiring/cmd.github.connect.json'
- 'evidence/wiring/cmd.lsp.goto_definition.json'
- 'evidence/wiring/cmd.widget.add.json'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: SchemaID:Wiring_Matrix.schema.json, ContractName:Plans/Contracts_V0.md#EventRecord'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Contracts_V0.md'
```

### WM-007 - Gate 010 Schema Verification

```yaml
plan_unit_id: WM-007
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'GATE-010 verifies wiring matrix entries by running JSON Schema validation against `Plans/Wiring_Matrix.schema.json` before further wiring checks.'
gui_related: false
gui_classification_reason: 'The unit defines validation gate behavior rather than GUI presentation.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-003
unblocks: []
acceptance_criteria:
- WM-007 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: gate010_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0009
preserved_exact_tokens:
- '4. Verification'
- 'GATE-010'
- 'Plans/Progression_Gates.md'
- '4.1 Schema validation'
- 'MUST validate'
- 'Plans/Wiring_Matrix.schema.json'
- 'first check'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Progression_Gates.md'
```

### WM-008 - Gate 010 Coverage And Uniqueness

```yaml
plan_unit_id: WM-008
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'GATE-010 requires every catalog `cmd.*` ID to have at least one wiring entry, treats stale research-session, web-tool, or terminal aliases as failures, and enforces one unique `ui_element_id` key/value per entry.'
gui_related: false
gui_classification_reason: 'The unit defines gate coverage and uniqueness validation rather than GUI presentation.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-007
unblocks: []
acceptance_criteria:
- WM-008 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: gate010_coverage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0011
preserved_exact_tokens:
- '4.2 Coverage'
- 'Every `cmd.*` ID'
- 'at least one wiring matrix entry'
- 'Research-session'
- 'web-tool'
- 'terminal command identity'
- 'stale local command aliases'
- 'verification failures'
- 'cmd.dev.start_session'
- 'cmd.dev.stop_session'
- 'reveal'
- 'show'
- 'rerun'
- 'split'
- 'close'
- 'clear'
- 'restart'
- 'terminate'
- 'kill'
- 'detach'
- 'reattach'
- 'focus-session'
- 'w-20260316-160450'
- '4.2.1 One element, one command enforcement'
- 'ui_element_id'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- 'Old work-item ledger `w-20260316-160450` lines 748-941 may be source-lineage evidence only and does not replace generated JSON entries.'
stale_retired_dispositions:
- 'Stale local command aliases for research-session, web-tool, or terminal command identity are verification failures, not compatibility shortcuts.'
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/UI_Command_Catalog.md'
- 'Plans/Tools.md'
```

### WM-009 - Handler And Event Validation

```yaml
plan_unit_id: WM-009
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'GATE-010 requires each `handler_location` to resolve to an existing handler path and requires dispatch tests for non-empty `expected_event_types` that assert declared events in order and no undeclared events.'
gui_related: false
gui_classification_reason: 'The unit defines handler and event validation mechanics rather than GUI presentation.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-007
unblocks: []
acceptance_criteria:
- WM-009 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: handler_event_validation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0013
preserved_exact_tokens:
- '4.3 Handler resolution'
- 'handler_location'
- 'MUST resolve'
- 'puppet-master-rs/src/'
- '(crate::)?module(::submodule)+::function'
- 'ui_element_id'
- 'ui_command_id'
- 'unresolved `handler_location`'
- 'candidate files/modules inspected'
- '4.4 Event tests'
- 'expected_event_types'
- 'declared event types'
- 'expected order'
- 'no undeclared event types'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Gate:GATE-010, Invariant:INV-011, Invariant:INV-012, SchemaID:Wiring_Matrix.schema.json'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Progression_Gates.md'
- 'Plans/Contracts_V0.md'
```

### WM-010 - Gate Schema Owner Boundary

```yaml
plan_unit_id: WM-010
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'The wiring matrix preserves gate/schema and owner limits for `cmd.runtime.*`, `correlation_id`, `allowed_action_ids[]`, route-aware evidence, extraction hazards, runtime owner references, command/wiring ownership, and route/open compatibility references without becoming a general runtime schema.'
gui_related: true
gui_classification_reason: 'The unit includes GUI command IDs, route/open evidence, and UI/runtime wiring ownership boundaries.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-007
unblocks: []
acceptance_criteria:
- WM-010 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: gate_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0014
preserved_exact_tokens:
- '4.5 Gate/schema limits and owner references'
- 'cmd.runtime'
- 'cmd.runtime.*'
- 'stale-projection revalidation'
- 'correlation_id'
- 'allowed_action_ids'
- 'allowed_action_ids[]'
- 'Wiring_Matrix.schema.json'
- 'schema.json'
- '/matrix/gate'
- 'deprecated-vs-canonical command-family status'
- 'regex-style scans'
- 'cmd.*.json'
- 'cmd.panel.switch'
- '/gate/evidence'
- 'GATE'
- 'GATE-010'
- '/route'
- 'OpenSubject'
- 'cmd.nav'
- 'cmd.nav.*'
- 'scheduler.pass'
- 'attempt.started'
- 'attempt.completed'
- 'node.blocked'
- 'safe_point'
- 'safe_point.*'
- 'attempt_record'
- 'blocked_projection'
- 'cmd.chat.run_user_command'
- '/compact'
- '/mode'
- 'runtime-mode'
- 'slash-command'
- 'IDs'
- 'GUI'
- '{ mode }'
- '/wiring'
- '/recovery'
- '/open'
- 'tab_id'
- 'resume_url'
- '/prohibited'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- 'Route/open compatibility evidence references Contracts_V0 for `/open`, `tab_id`, `resume_url`, and `/prohibited` serialization classes.'
stale_retired_dispositions:
- 'Extraction hazards and stale projection revalidation are gate failures rather than compatibility shortcuts.'
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/UI_Wiring_Rules.md'
- 'Plans/Contracts_V0.md'
- 'Plans/Progression_Gates.md'
- 'Plans/storage-plan.md'
- 'Plans/Prompt_Pipeline.md'
- 'Plans/Runtime_Artifacts_Panel.md'
- 'Plans/assistant-chat-design.md'
- 'Plans/UI_Command_Catalog.md'
- 'Plans/FileManager.md'
```

### WM-011 - Scheduler Analysis Wiring Row

```yaml
plan_unit_id: WM-011
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'The scheduler analysis producer/consumer path wires canonical event `scheduler.pass` with legacy alias `run.scheduler_analysis` from executor/orchestrator scheduler pass to Run Graph queue-analysis, storage `scheduler_pass_record`, usage/analytics dashboard, and `scheduler_pass.{run_id}.{scheduler_pass_id}` projection.'
gui_related: true
gui_classification_reason: 'The unit links runtime scheduler events to user-visible Run Graph and dashboard consumers.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-007
unblocks: []
acceptance_criteria:
- WM-011 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: runtime_event_wiring
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0016
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0017
preserved_exact_tokens:
- 'Scheduler/Remediation/Event Wiring Addendum'
- 'producer -> consumer paths'
- 'scheduler.pass'
- 'run.scheduler_analysis'
- 'executor/orchestrator scheduler pass'
- 'Run Graph View queue-analysis panel'
- 'scheduler_pass_record'
- 'usage/analytics dashboard'
- 'scheduler_pass.{run_id}.{scheduler_pass_id}'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Run_Graph_View.md'
- 'Plans/storage-plan.md'
- 'Plans/usage-feature.md'
```

### WM-012 - Blocked Unblocked Wiring Rows

```yaml
plan_unit_id: WM-012
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Blocked/unblocked wiring rows cover `node.blocked`, `node.unblocked`, `wizard.blocked`, and `wizard.unblocked` with legacy aliases `run.node_blocked` and `run.node_unblocked`, producing blocked projections for Run Graph, assistant chat, dashboard counts, and storage.'
gui_related: true
gui_classification_reason: 'The unit routes blocked/unblocked events to visible Run Graph, chat, and dashboard consumers.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-007
unblocks: []
acceptance_criteria:
- WM-012 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: runtime_event_wiring
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0018
preserved_exact_tokens:
- 'Blocked/unblocked'
- 'node.blocked'
- 'node.unblocked'
- 'wizard.blocked'
- 'wizard.unblocked'
- 'run.node_blocked'
- 'run.node_unblocked'
- 'executor/orchestrator blocked-state manager'
- 'Run Graph View node badge/detail'
- 'assistant-chat blocked_notice'
- 'dashboard blocked-count badge'
- 'blocked_projection'
- 'blocked_projection.{run_id}.{node_id}.{blocked_sequence}'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- 'Legacy aliases `run.node_blocked` and `run.node_unblocked` are lineage only beside canonical blocked events.'
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Run_Graph_View.md'
- 'Plans/assistant-chat-design.md'
- 'Plans/storage-plan.md'
```

### WM-013 - Safe Point Wiring Rows

```yaml
plan_unit_id: WM-013
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Safe-point wiring rows cover mutation-capable attempt dispatcher or retry controller production of `safe_point.created` and `safe_point.restored` to runtime recovery logic, Run Graph detail, and audit/debug surfaces.'
gui_related: true
gui_classification_reason: 'The unit routes safe-point runtime events to user-visible Run Graph and audit/debug consumers.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-007
unblocks: []
acceptance_criteria:
- WM-013 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: runtime_event_wiring
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0019
preserved_exact_tokens:
- 'Safe points'
- 'mutation-capable attempt dispatcher'
- 'retry controller'
- 'safe_point.created'
- 'safe_point.restored'
- 'runtime recovery logic'
- 'Run Graph detail panel'
- 'audit/debug surfaces'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Run_Graph_View.md'
- 'Plans/Executor_Protocol.md'
```

### WM-014 - Remediation And Degradation Wiring Rows

```yaml
plan_unit_id: WM-014
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Remediation and degradation wiring rows cover `remediation.spawned`, `remediation.resolved`, and `plan.decomposition_degraded`, preserving remediation lineage storage, Run Graph, dashboard, wizard/interview planning UI, storage projections, and audit/debug consumers.'
gui_related: true
gui_classification_reason: 'The unit routes remediation/degradation events to visible Run Graph, dashboard, wizard/interview, and audit/debug consumers.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-007
unblocks: []
acceptance_criteria:
- WM-014 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: runtime_event_wiring
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0020
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0021
preserved_exact_tokens:
- 'Remediation lineage'
- 'remediation.spawned'
- 'remediation.resolved'
- 'run.remediation_started'
- 'run.remediation_completed'
- 'remediation manager'
- 'remediation_lineage_record'
- 'dashboard remediation badge'
- 'remediation.{run_id}.{remediation_root_id}'
- 'Degradation evidence'
- 'plan.decomposition_degraded'
- 'draft decomposition/planning pipeline'
- 'wizard/interview planning UI'
- 'storage projections'
- 'audit/debug surfaces'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- 'Legacy aliases `run.remediation_started` and `run.remediation_completed` are lineage only beside canonical remediation events.'
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Run_Graph_View.md'
- 'Plans/storage-plan.md'
- 'Plans/Orchestrator_Page.md'
```

### WM-015 - Runtime Recovery Packet Wiring

```yaml
plan_unit_id: WM-015
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Runtime recovery wiring requires explicit producers, handlers, projection consumers, UI command handlers, and packet-field traceability from runtime event producers through run graph, orchestrator summaries, chat banners, and history/evidence tabs.'
gui_related: true
gui_classification_reason: 'The unit wires runtime recovery data to multiple user-visible UI consumers.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-011
- WM-012
- WM-013
- WM-014
unblocks: []
acceptance_criteria:
- WM-015 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: runtime_recovery_wiring
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0022
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0023
preserved_exact_tokens:
- 'Runtime recovery wiring requirements'
- 'runtime packet'
- 'Runtime recovery wiring minimum rows'
- 'scheduler.pass'
- 'attempt.started'
- 'attempt.completed'
- 'node.blocked'
- 'safe_point.created'
- 'safe_point.restored'
- 'remediation.spawned'
- 'remediation.resolved'
- 'projection consumers'
- 'run graph'
- 'orchestrator summaries'
- 'chat banners'
- 'history/evidence tabs'
- 'queue-analysis open'
- 'attempt details open'
- 'blocked resume'
- 'retry'
- 'safe-point restore-and-retry'
- 'remediation lineage open'
- 'trace every new packet field'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Run_Graph_View.md'
- 'Plans/Orchestrator_Page.md'
- 'Plans/assistant-chat-design.md'
```

### WM-016 - Canonical Runtime Event Rows

```yaml
plan_unit_id: WM-016
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Canonical runtime event rows use `Plans/Contracts_V0.md` identities for scheduler, attempts, blocked/prerequisite, remediation, and graph lock/integrity events, including persisted `attempt_record` and consumers across storage, Run Graph, Orchestrator Page, history/evidence, scheduler, recovery, executor admission, progression gates, and blocked/replan surfaces.'
gui_related: true
gui_classification_reason: 'The unit routes canonical runtime event rows to user-visible and runtime consumers.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-015
unblocks: []
acceptance_criteria:
- WM-016 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: canonical_runtime_events
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0024
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0025
preserved_exact_tokens:
- 'Canonical Runtime Event Wiring Canonical Alignment'
- 'Plans/Contracts_V0.md'
- 'scheduler/executor'
- 'scheduler.pass'
- 'scheduler_pass_id'
- 'attempt.started'
- 'attempt.completed'
- 'attempt_record'
- 'node.blocked'
- 'node.unblocked'
- 'node.prerequisite_resolved'
- 'remediation.spawned'
- 'remediation.resolved'
- 'run.graph_canonical_locked'
- 'run.graph_integrity_failed'
- 'executor admission logic'
- 'progression gates'
- 'blocked/replan surfaces'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Contracts_V0.md'
- 'Plans/storage-plan.md'
- 'Plans/Run_Graph_View.md'
- 'Plans/Orchestrator_Page.md'
- 'Plans/Progression_Gates.md'
```

### WM-017 - Recovery Ui Action Binding

```yaml
plan_unit_id: WM-017
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Recovery UI handlers are keyed by canonical `allowed_action_id` families before binding domain-specific command IDs through blocked payload metadata.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible recovery UI handler command binding.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-015
- WM-016
unblocks: []
acceptance_criteria:
- WM-017 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: ui_action_binding
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0026
preserved_exact_tokens:
- 'UI command handler rule'
- 'Recovery UI handlers'
- 'canonical `allowed_action_id` families'
- 'domain-specific command ids'
- 'blocked payload metadata'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/UI_Command_Catalog.md'
- 'Plans/Contracts_V0.md'
```

### WM-018 - Context Lens Wiring Rows

```yaml
plan_unit_id: WM-018
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Context Lens wiring rows preserve thread-local multi-select in all modes and explicit `Subcompact` apply/revert semantics, including mode toggle, target selection, export/revoke, Debug Automation banner, browser takeover, and investigation cancellation commands.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible Context Lens and Debug investigation command wiring rows.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-007
unblocks: []
acceptance_criteria:
- WM-018 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: context_lens_wiring
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0028
preserved_exact_tokens:
- 'Context Lens minimum rows'
- 'cmd.chat.context_lens.toggle'
- 'cmd.chat.context_lens.set_mode'
- 'cmd.chat.context_lens.turn_off'
- 'cmd.chat.context_lens.toggle_message_selection'
- 'cmd.chat.context_lens.clear_selection'
- 'cmd.chat.context_lens.apply_subcompact'
- 'cmd.chat.context_lens.revert_subcompact'
- 'mute'
- 'focus'
- 'subcompact'
- 'Subcompact'
- 'explicit-apply'
- 'automatic dynamic context shrinking'
- 'cmd.chat.mode'
- 'cmd.chat.open_debug_target_picker'
- 'cmd.chat.export_investigation_bundle'
- 'cmd.chat.revoke_investigation_item'
- 'cmd.runtime.approve'
- 'cmd.runtime.resume_after_prerequisite'
- 'cmd.runtime.retry_now'
- 'cmd.browser.stop_agent_keep_browser'
- 'cmd.browser.promote_to_normal_browsing'
- 'cmd.runtime.abort_run'
negative_constraints:
- 'Context Lens wiring must remain thread-local, support multi-select in all modes, and keep `Subcompact` as explicit apply/revert distinct from automatic dynamic context shrinking.'
preserved_contractrefs:
- 'ContractRef: Context Lens wiring MUST remain thread-local, must support multi-select in all modes, and must keep `Subcompact` as an explicit apply/revert path distinct from automatic dynamic context shrinking. [Source: assistant-chat-design.md#176-context-lens-mute--focus--subcompact; Prompt_Pipeline.md#dynamic-context-shrinking]'
- 'ContractRef: Wiring rows for Context Lens MUST remain aligned with command IDs, chat placement, and overlay persistence semantics; a packet may not leave those elements split between unrelated addenda. [Source: UI_Command_Catalog.md#context-lens-command-set; FinalGUISpec.md#context-lens-placement-and-behavior]'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/assistant-chat-design.md'
- 'Plans/Prompt_Pipeline.md'
- 'Plans/UI_Command_Catalog.md'
- 'Plans/FinalGUISpec.md'
- 'Plans/storage-plan.md'
```

### WM-019 - Project Thread Minimum Rows

```yaml
plan_unit_id: WM-019
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Minimum required rows cover project switcher, thread details, compaction, restore branch, and related shell/chat/history command wiring without losing canonical project/thread identity, including explicit Compact Now dispatch, context.compaction.failed or equivalent visible degraded-state wiring, and command-result statuses for already_running, cancelled, no_op, unavailable, retry_scheduled, completed, and failed.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible project/thread command wiring rows.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
unblocks: []
acceptance_criteria:
- WM-019 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: promoted_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0030
- Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/compaction_compile_readiness_matrix.json:cmp-automated-testing-acceptance
- Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0094
preserved_exact_tokens:
- 'Minimum required rows'
- 'project switcher'
- 'thread details'
- 'compaction'
- 'Compact Now'
- 'context.compaction.failed'
- 'already_running'
- 'cancelled'
- 'no_op'
- 'retry_scheduled'
- 'restore branch'
- 'cmd.chat'
- 'cmd.project'
- 'cmd.history'
- 'thread'
- 'project'
- 'shell'
- 'history'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/assistant-chat-design.md'
- 'Plans/FinalGUISpec.md'
```

### WM-020 - Browser Command Rows

```yaml
plan_unit_id: WM-020
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Browser command rows cover browser open/focus/detach, DevTools, share/capture, takeover, pause/continue/stop/promote, screenshot capture, and recovery commands while preserving browser-session identity.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible browser command wiring rows.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
unblocks: []
acceptance_criteria:
- WM-020 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: browser_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0030
preserved_exact_tokens:
- 'cmd.browser.focus_browser_tab'
- 'Focus Browser'
- 'cmd.browser.detach_browser_tab'
- 'Detach Browser'
- 'cmd.browser.open_devtools'
- 'Open DevTools'
- 'cmd.browser.toggle_devtools_dock'
- 'Toggle DevTools Dock'
- 'cmd.browser.share_with_agent'
- 'cmd.browser.revoke_share_with_agent'
- 'cmd.browser.pick_element_for_chat'
- 'cmd.browser.add_selection_to_chat'
- 'cmd.browser.add_selection_screenshot_to_chat'
- 'cmd.browser.add_selection_full_screenshot_to_chat'
- 'cmd.browser.add_screenshot_to_chat'
- 'cmd.browser.add_full_screenshot_to_chat'
- 'cmd.browser.take_over'
- 'Pause Agent'
- 'Let agent continue'
- 'Stop agent and keep browser'
- 'cmd.browser.promote_to_normal_browsing'
- 'cmd.browser.reopen'
- 'cmd.browser.retry'
- 'cmd.browser.keep_closed'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Section15_MVP_Promoted_Features_Spec.md'
- 'Plans/Runtime_Artifacts_Panel.md'
- 'Plans/FinalGUISpec.md'
```

### WM-021 - Terminal Dev And Catalog Rows

```yaml
plan_unit_id: WM-021
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Terminal, dev, and catalog wiring rows cover terminal reveal/show/rerun/detach/new/split/add/embed/focus/move/rename/pin/close/clear/restart/terminate/kill/reattach commands, dev session start/stop/restart/status commands, and catalog install/remove lifecycle commands.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible terminal, dev, and catalog command wiring rows.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
unblocks: []
acceptance_criteria:
- WM-021 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: terminal_dev_catalog_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0030
preserved_exact_tokens:
- 'cmd.terminal.open'
- 'cmd.terminal.show'
- 'cmd.terminal.rerun'
- 'cmd.terminal.detach'
- 'cmd.terminal.new_tab'
- 'cmd.terminal.activate_workgroup'
- 'cmd.terminal.activate_subtab'
- 'cmd.terminal.reorder_workgroup'
- 'cmd.terminal.reorder_subtab'
- 'cmd.terminal.split_pane'
- 'cmd.terminal.add_leaf'
- 'cmd.terminal.embed_in_editor'
- 'cmd.terminal.remove_from_editor'
- 'cmd.terminal.undock_all_from_editor'
- 'cmd.terminal.focus_session'
- 'cmd.terminal.move_tab_to_section'
- 'cmd.terminal.rename_tab'
- 'cmd.terminal.pin_tab'
- 'cmd.terminal.close_pane'
- 'cmd.terminal.close_tab'
- 'cmd.terminal.clear_scrollback'
- 'cmd.terminal.restart_session'
- 'cmd.terminal.terminate_session'
- 'cmd.terminal.kill_session'
- 'cmd.terminal.detach_section'
- 'cmd.terminal.reattach_section'
- 'cmd.dev.start_session'
- 'cmd.dev.stop_session'
- 'cmd.dev.restart_session'
- 'cmd.dev.show_output'
- 'cmd.dev.show_problems'
- 'cmd.dev.show_ports'
- 'cmd.catalog.install_item'
- 'cmd.catalog.remove_item'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Section15_MVP_Promoted_Features_Spec.md'
- 'Plans/storage-plan.md'
- 'Plans/UI_Command_Catalog.md'
```

### WM-022 - Terminal Identity Constraints

```yaml
plan_unit_id: WM-022
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Terminal wiring preserves terminal workspace/session identity, distinguishing content-only actions from destructive workspace mutations, preserving `/replacement`, `/close`, `/disconnected/review-only`, `Concepts/PMConcept.html` GUI lineage, drag/drop layout concepts, and the rule that split-parent opacity effects must not dim terminal grids.'
gui_related: true
gui_classification_reason: 'The unit preserves user-visible terminal identity, layout, and GUI concept lineage constraints.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-021
unblocks: []
acceptance_criteria:
- WM-022 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: terminal_identity_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0030
preserved_exact_tokens:
- 'Terminal wiring owner split'
- 'Section15_MVP_Promoted_Features_Spec.md §3.14'
- 'terminal_workspace_state'
- 'terminal_session_record'
- 'terminal_command_block'
- 'dev_session_record'
- 'restart'
- '/replacement'
- 'replace-with-new-terminal'
- '/close'
- '/disconnected/review-only'
- 'clear'
- '/reset'
- 'Concepts/PMConcept.html'
- '/workgroup'
- '/subtab'
- 'split-pane tree operations'
- 'multi-panel terminal stacks'
- '/drop'
- '/center/right'
- '/right'
- '/resizers'
- 'accent-led subtab focus'
- 'command-log removal'
- 'must not dim terminal grids'
negative_constraints:
- 'Split-parent opacity effects must not dim terminal grids during reorder or drag operations.'
preserved_contractrefs: []
compatibility_only_notes:
- 'Concepts/PMConcept.html is GUI concept lineage only while preserving implied command coverage.'
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/Section15_MVP_Promoted_Features_Spec.md'
- 'Plans/storage-plan.md'
```

### WM-023 - Browser Session Capture And Recovery Invariants

```yaml
plan_unit_id: WM-023
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Browser wiring invariants preserve stale `newfeatures.md §15.18` cleanup, the CEF-class tab-first in-app `/browser` model, `auth_session` limits, explicit chip-based capture, DevTools contract, takeover behavior, and recovery behavior for workspace, detached, automation, and auth sessions.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible browser session, capture, takeover, DevTools, and recovery invariants.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-020
unblocks: []
acceptance_criteria:
- WM-023 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_199
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: browser_invariants
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0031
preserved_exact_tokens:
- 'Browser session, capture, and recovery wiring invariants'
- 'newfeatures.md §15.18'
- 'trust-tier'
- '/trust-tier'
- 'permission-layer `/capability-degradation`'
- 'CEF-class, tab-first, in-app `/browser` model'
- 'workspace_preview'
- 'detached_preview'
- 'automation_session'
- 'auth_session'
- '/cookie'
- 'Take over and pause agent'
- 'Let agent continue'
- 'Stop agent and keep browser'
- '/stop/take-over'
- '/stop/take'
- 'chip-based'
- 'share-to-chat'
- 'non-auto-send'
- '/highlight/share-to-chat'
- '/elements'
- '/selection'
- '/DOM'
- 'Add Selection to Chat'
- 'Pick Element for Chat'
- 'Add Selection + Screenshot'
- 'Add Element + Screenshot'
- '/trace/video'
- 'Open DevTools'
- 'Toggle DevTools Dock'
- 'runtime_unavailable'
negative_constraints:
- 'auth_session is not general-purpose browsing state, is not auto-restored, must not auto-close or auto-complete on presumed success.'
- 'Ordinary clicks do not inject `/context`.'
- 'Automation/auth sessions never auto-resume active work, auth never auto-completes.'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes:
- 'Stale `Plans/newfeatures.md §15.18` and `/newfeatures.md` references are cross-reference cleanup lineage only.'
stale_retired_dispositions: []
owner_hints:
- 'Plans/Wiring_Matrix.md'
- 'Plans/storage-plan.md'
- 'Plans/assistant-chat-design.md'
- 'Plans/Runtime_Artifacts_Panel.md'
- 'Plans/Section15_MVP_Promoted_Features_Spec.md'
- 'Plans/FinalGUISpec.md'
- 'Plans/Permissions_System.md'
- 'Plans/UI_Command_Catalog.md'
```
### WM-024 - Debug Investigation Minimum Rows

```yaml
plan_unit_id: WM-024
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Debug Mode and Investigation Context wiring requires the listed cmd.chat.mode, cmd.chat.open_debug_target_picker, investigation export/revoke, cmd.runtime.* approval/resume/retry/abort rows, and browser stop/promote rows, including explicit-confirmation and stop_reason_code = investigation.cancelled_by_user.
gui_related: true
gui_classification_reason: The unit defines user-visible Debug Mode and Investigation Context command rows and attention-surface actions.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-018
- WM-020
- WM-023
unblocks: []
acceptance_criteria:
- WM-024 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: debug_investigation_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0032
preserved_exact_tokens:
- Debug investigation minimum rows
- cmd.chat.mode
- /mode debug
- cmd.chat.open_debug_target_picker
- cmd.chat.export_investigation_bundle
- cmd.chat.revoke_investigation_item
- cmd.runtime.approve
- cmd.runtime.resume_after_prerequisite
- cmd.runtime.retry_now
- cmd.browser.stop_agent_keep_browser
- cmd.browser.promote_to_normal_browsing
- explicit-confirmation
- cmd.runtime.abort_run
- stop_reason_code = investigation.cancelled_by_user
negative_constraints:
- Do not silently promote the automation/auth session.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
- Plans/storage-plan.md
```

### WM-025 - Assistant Worktree Lifecycle Wiring

```yaml
plan_unit_id: WM-025
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Chat-to-WorktreeManager wiring covers create/remove/bind/list/merge/create-pr flows, auto-create via branching.assistant_auto_worktree, and preservation of thread_id, branch/base refs, worktree_id, and path data flow.
gui_related: true
gui_classification_reason: The unit covers user-visible chat header, dropdown, merge dialog, PR, and Source Control worktree actions.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-019
unblocks: []
acceptance_criteria:
- WM-025 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: assistant_worktree_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0033
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0034
preserved_exact_tokens:
- Source Control, GitHub Actions, and Docker Manager Wiring Addendum (2026-03-12)
- Assistant Worktree Wiring Addendum
- Chat ↔ WorktreeManager wiring
- Create Worktree
- cmd.chat.worktree.create
- remove_worktree
- list_worktrees
- merge_worktree
- create_pr
- branching.assistant_auto_worktree
- thread_id
- branch_name
- base_ref
- worktree_id
- path
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/assistant-chat-design.md
- Plans/GitHub_Integration.md
- Plans/Contracts_V0.md
```

### WM-026 - Worktree Cross-Surface Identity And Execution Context

```yaml
plan_unit_id: WM-026
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Worktree binding wires Source Control, File Manager roots, LSP root_identity, and executor execution_unit_context.worktree_id / working_directory deterministically; Glossary keeps thread-worktree terminology as compatibility reference only while Wiring Matrix records producer/consumer edges.
gui_related: true
gui_classification_reason: The unit covers visible Source Control, File Manager, chat, LSP, and execution context switching behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-019
- WM-025
unblocks: []
acceptance_criteria:
- WM-026 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: worktree_cross_surface_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0034
preserved_exact_tokens:
- Chat ↔ Source Control wiring
- Chat ↔ File Manager wiring
- Chat ↔ LSP wiring
- Chat ↔ Executor wiring
- worktree_follow_thread
- worktree_path
- project_root
- root_identity
- (host_id, server_id, root_identity)
- execution_unit_context.worktree_id
- execution_unit_context.working_directory
- working_directory
- Plans/Glossary.md
- /Glossary.md
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Run_Modes.md'
compatibility_only_notes:
- Terminology for thread worktree binding, accordion layout, working_directory, merge lock, and pre-merge test gate stays in Plans/Glossary.md; Wiring Matrix records producer/consumer edges only.
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/FileManager.md
- Plans/LSPSupport.md
- Plans/Executor_Protocol.md
- Plans/Run_Modes.md
- Plans/Glossary.md
```

### WM-027 - Search File And Source Control Command Handoff Rows

```yaml
plan_unit_id: WM-027
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Search, file, chat restore/reference, Source Control review/conflict, host-aware LSP projection, and cmd.remote.reconnect handoffs share one shell slot and identity model; cmd.git.* rows stay lower-level, diff-local local-search must not route through project-wide search, and cmd.chat.rewind must not restore files.
gui_related: true
gui_classification_reason: The unit defines user-visible Search panel, File Manager, chat, Source Control review/conflict, and remote reconnect command routing.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-025
- WM-026
unblocks: []
acceptance_criteria:
- WM-027 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: side_panel_command_handoff
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0034
preserved_exact_tokens:
- cmd.search.show
- cmd.search.find_in_files
- cmd.search.replace_in_files
- cmd.search.open_result
- cmd.file.*
- cmd.chat.add_file_reference
- cmd.chat.revert
- cmd.chat.rewind
- cmd.source_control.switch_subview
- cmd.source_control.open_review
- cmd.source_control.set_compare_target
- cmd.source_control.toggle_generated_filter
- cmd.source_control.open_conflict
- cmd.source_control.open_merge_editor
- cmd.source_control.resolve_conflict_side
- cmd.source_control.mark_conflict_resolved
- cmd.git.diff_set_compare_target
- cmd.git.diff_search
- cmd.git.stage_hunks
- cmd.git.unstage_hunks
- cmd.git.discard_hunks
- cmd.git.conflict_apply_resolution
- local-search
- /hunk/conflict/search-in-diff
- cmd.remote.reconnect
negative_constraints:
- cmd.git.* rows are lower-level diff/git operations, not substitutes for cmd.source_control.* GUI entrypoints.
- Diff-local local-search belongs to the git diff/review surface and must not route through project-wide cmd.search.find_in_files.
- cmd.chat.rewind must not restore files.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/FinalGUISpec.md
- Plans/FileManager.md
- Plans/GitHub_Integration.md
- Plans/UI_Command_Catalog.md
- Plans/WorktreeGitImprovement.md
- Plans/assistant-chat-design.md
- Plans/LSPSupport.md
```

### WM-028 - Regex Index Query And Dirty Layer Wiring

```yaml
plan_unit_id: WM-028
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Grep/index wiring routes agent grep calls and Search-panel regex queries through IndexEngine candidates and ripgrep verification, while PM-mediated writes, file watchers, and remote re-anchor insert generation-stamped DirtyLayer entries before callers can observe false-negative search results.
gui_related: false
gui_classification_reason: The unit defines backend index, verification, dirty-layer, and remote re-anchor wiring rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-009
unblocks: []
acceptance_criteria:
- WM-028 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: regex_index_dirty_layer
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0035
preserved_exact_tokens:
- Search Index Acceleration Wiring Addendum
- sparse n-gram regex index
- Agent/subagent `grep` call
- IndexEngine `query`
- ripgrep verification
- DirtyLayer `insert`
- PM-mediated writes
- SYNCHRONOUSLY
- agent-write-then-grep CRITICAL FIX
- HashMap
- generation stamps
- old_anchor..new_HEAD
negative_constraints:
- DirtyLayer storage is a HashMap with generation stamps, not a plain HashSet.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/Tools.md
- Plans/storage-plan.md
- Plans/GitHub_Integration.md
```

### WM-029 - Search Panel Index UX And Cache Commands

```yaml
plan_unit_id: WM-029
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Search-panel regex, status-bar Indexing / Refreshing index, cmd.search.rebuild_regex_index, cmd.search.evict_remote_cache, and cmd.search.clear_all_remote_caches expose index state and cache control without re-owning storage or remote correctness.
gui_related: true
gui_classification_reason: The unit covers user-visible Search panel regex behavior, status-bar indicators, and cache control commands.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-027
- WM-028
unblocks: []
acceptance_criteria:
- WM-029 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: search_index_user_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0035
preserved_exact_tokens:
- Search-panel regex query
- regex ON
- cmd.search.rebuild_regex_index
- Indexing
- Refreshing index
- cmd.search.evict_remote_cache
- cmd.search.clear_all_remote_caches
- RemoteCacheManager `evict_project`
- RemoteCacheManager `evict_all`
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/storage-plan.md
- Plans/GitHub_Integration.md
```

### WM-030 - Index Build Storage Publication And Recovery

```yaml
plan_unit_id: WM-030
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Index build/storage wiring covers project-ready full or validation builds, Git incremental rebuilds, IndexSnapshot load, ArcSwap publication, crash recovery, remote fetch cadence, git diff --name-only old_anchor..new_HEAD, and cache-only no-data-loss behavior.
gui_related: false
gui_classification_reason: The unit defines backend index build, storage publication, recovery, and remote refresh wiring rather than GUI presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-028
unblocks: []
acceptance_criteria:
- WM-030 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: index_storage_publication
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0035
preserved_exact_tokens:
- Index build <-> Storage wiring
- Project open
- IndexBuilder `build_full`
- IndexBuilder `build_incremental`
- IndexSnapshot `load`
- ArcSwap
- arc-swap
- Project-ready signal
- Git fetch (remote)
- git diff --name-only old_anchor..new_HEAD
- mmap
- rebuild
- timer every 5 minutes
- cache
- no data loss
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/storage-plan.md
- Plans/GitHub_Integration.md
- Plans/Tools.md
```

### WM-031 - Route Open Contract Carry Through

```yaml
plan_unit_id: WM-031
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Route/open reconciliation carries selector precedence, reject rules, closed tab_id vocabulary, scoped resolver rules, route examples, ref-family split, resume_url demotion, Primitive:RouteTarget, OpenSubject, and wrapper/canonical normalization into owner docs and wiring consumers.
gui_related: false
gui_classification_reason: The unit carries route/open contract semantics and wiring-consumer metadata rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-010
unblocks: []
acceptance_criteria:
- WM-031 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: route_open_contract_carrythrough
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0036
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0037
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0038
preserved_exact_tokens:
- Route-aware wiring reconciliation
- Route-aware navigation and open-contract rows
- selector precedence
- reject rules
- closed tab_id vocabulary
- scoped resolver rules
- route examples
- ref-family split
- resume_url demotion
- Primitive:RouteTarget/OpenSubject
- wrapper/canonical normalization
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/Contracts_V0.md
- Plans/Crosswalk.md
- Plans/UI_Command_Catalog.md
```

### WM-032 - Route Aware Gate Evidence Hooks

```yaml
plan_unit_id: WM-032
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: GATE-010 must verify route args, wrapper normalization, stale revalidation, admissibility, correlation passthrough, and structured gate-specific evidence for route-aware verification. The Expand Wiring Matrix source wording is preserved as stale/carry-through lineage, not as a new owner schema.
gui_related: false
gui_classification_reason: The unit defines verification and evidence requirements rather than GUI implementation work.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-007
- WM-008
- WM-009
- WM-010
- WM-031
unblocks: []
acceptance_criteria:
- WM-032 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gate_coverage_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: route_aware_gate_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0039
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0040
preserved_exact_tokens:
- Verification evidence hooks
- GATE-010
- route args
- wrapper normalization
- stale revalidation
- admissibility
- correlation passthrough
- structured gate-specific evidence details
- Expand Wiring Matrix and GATE-010
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Expand Wiring Matrix and GATE-010 to verify route args, wrapper normalization, stale revalidation, admissibility, and correlation passthrough is preserved as carry-through lineage rather than a second routing owner schema.
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/Progression_Gates.md
- Plans/UI_Wiring_Rules.md
- Plans/Contracts_V0.md
```

### WM-033 - Route Open Compatibility Only Fallback Marking

```yaml
plan_unit_id: WM-033
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Timestamp/run/thread fallback logic is compatibility-only inside route/open contracts, and the ref-family split remains explicit when route/open normalization is transferred.
gui_related: false
gui_classification_reason: The unit defines compatibility-only route/open contract handling rather than GUI presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-031
unblocks: []
acceptance_criteria:
- WM-033 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: route_open_compatibility_marking
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0041
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0042
preserved_exact_tokens:
- Compatibility-only fallback marking
- timestamp/run/thread fallback logic
- compatibility-only
- route/open contracts
- ref-family split
- route/open normalization
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Timestamp/run/thread fallback logic is compatibility-only inside route/open contracts.
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/Contracts_V0.md
- Plans/Crosswalk.md
- Plans/UI_Command_Catalog.md
```

### WM-034 - Catalog Owned Wrapper Normalization Boundary

```yaml
plan_unit_id: WM-034
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Plans/UI_Command_Catalog.md owns command identity and alias metadata; Wiring Matrix consumes that metadata, still exposes ui_element_id, ui_command_id, handler_location, and expected_event_types, and must not create a second routing schema inside the matrix.
gui_related: false
gui_classification_reason: The unit defines catalog/wiring ownership and gate-consumer boundaries rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-004
- WM-010
- WM-031
- WM-032
- WM-033
unblocks: []
acceptance_criteria:
- WM-034 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: wiring_matrix_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: catalog_owned_normalization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0043
preserved_exact_tokens:
- Catalog-owned normalization metadata
- Plans/UI_Command_Catalog.md
- /UI_Command_Catalog.md
- command identity
- alias metadata
- ui_element_id
- ui_command_id
- handler_location
- expected_event_types
- wrapper command
- canonical route/open semantics
- /open
- /gates
- not a second routing schema inside the matrix
negative_constraints:
- Wiring Matrix must not duplicate route semantics or create a second routing schema inside the matrix.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- GATE-010 completeness includes stale-projection revalidation as gate coverage consumed by wiring/gates, not a second routing schema.
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/UI_Command_Catalog.md
- Plans/UI_Wiring_Rules.md
- Plans/Progression_Gates.md
- Plans/Contracts_V0.md
```

### WM-035 - Runtime Record Demotion Hazard For Wiring

```yaml
plan_unit_id: WM-035
unit_type: constraint
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: tier_runtime_record, tier-keyed usage_record, and tier-keyed evidence_record remain demotion hazards; generated wiring rows must not treat them as canonical producers or consumers until owner-level demotion or replacement is complete.
gui_related: false
gui_classification_reason: The unit records runtime/storage owner demotion risk rather than GUI implementation work.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WM-016
- WM-034
unblocks: []
acceptance_criteria:
- WM-035 remains addressable as a fine-grained Wiring Matrix PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: owner_demotion_drift
reasoning_tier: standard
context_scope: wiring_matrix_batch_200
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: runtime_record_demotion_hazard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0043
preserved_exact_tokens:
- Owner-level runtime records remain a demotion hazard for wiring
- tier_runtime_record
- tier-keyed usage_record
- tier-keyed evidence_record
- owner-level demotion
- generated wiring rows
- canonical producers or consumers
negative_constraints:
- Generated wiring rows must not treat tier_runtime_record, tier-keyed usage_record, or tier-keyed evidence_record as canonical producers or consumers until owner-level demotion or replacement is complete.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/Wiring_Matrix.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/usage-feature.md
```

### WM-001 - Wiring Matrix Source-Preserving Bridge Retired

```yaml
plan_unit_id: WM-001
unit_type: generated_artifact_residual
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'WM-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 201 because Wiring_Matrix-S0044 through S0047 are generated standardization tail material: Owner / Consumer Map, PlanUnits heading, former generated WM-001 bridge, and Migration Coverage. Wiring_Matrix-S0001 through S0043 are covered by WM-002 through WM-035 or explicit structural/reference dispositions. WM-001 no longer carries source_preserving_planunit compile mode and must not own product coverage.'
gui_related: false
gui_classification_reason: The retired bridge is generated migration lineage rather than implementation-facing GUI behavior, even though the retired source lineage preserved earlier GUI-related Wiring Matrix product tokens.
split_recommended: false
depends_on:
- WM-002
- WM-003
- WM-004
- WM-005
- WM-006
- WM-007
- WM-008
- WM-009
- WM-010
- WM-011
- WM-012
- WM-013
- WM-014
- WM-015
- WM-016
- WM-017
- WM-018
- WM-019
- WM-020
- WM-021
- WM-022
- WM-023
- WM-024
- WM-025
- WM-026
- WM-027
- WM-028
- WM-029
- WM-030
- WM-031
- WM-032
- WM-033
- WM-034
- WM-035
unblocks: []
acceptance_criteria:
- Wiring_Matrix-S0001 through S0043 remain mapped to fine-grained Wiring Matrix PlanUnits or structural dispositions rather than WM-001.
- Wiring_Matrix-S0044 through S0047 are generated standardization tail material or retired bridge lineage, not product implementation coverage.
- WM-001 no longer uses source_preserving_planunit mode and creates no WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: wiring_matrix_generated_tail_batch_201
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0044
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0045
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0046
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Wiring_Matrix-S0047
preserved_exact_tokens:
- source_preserving_planunit
- Wiring Matrix (Canonical)
- Wiring_Matrix-S0044
- Wiring_Matrix-S0047
- Migration Coverage
- PlanUnits
- Owner / Consumer Map
negative_constraints:
- WM-001 must not provide product implementation coverage for Wiring_Matrix-S0001 through S0047 after Phase 2B batch 201.
- WM-001 must not override WM-002 through WM-035 or later fine-grained Wiring Matrix PlanUnits.
- Do not rely on one coarse source_preserving_planunit as the final implementation standard for Wiring_Matrix.md.
preserved_contractrefs:
- ContractRef lineage remains preserved in span_map and coverage_map; malformed trailing apostrophes from the generated WM-001 bridge are lineage only and are not promoted as active ContractRefs.
compatibility_only_notes:
- The retired bridge is compatibility lineage for generated Owner / Consumer Map, generated PlanUnits, former WM-001 bridge, and Migration Coverage tail spans only.
stale_retired_dispositions:
- Former generated source-preserving bridge material is retired as migration lineage only.
owner_hints:
- Plans/Wiring_Matrix.md
```
