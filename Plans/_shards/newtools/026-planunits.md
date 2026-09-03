# Shard 026: PlanUnits

Source: `Plans/newtools.md`

Source lines: L1306-L8593

Source SHA256: `ab70dbc2e26cad60cd86bb6344f3244b1b7a901e6a04e3b937ede665d1c3e7ec`

---

## PlanUnits

### N2-002 - Plan-Only GUI Testing Scope

```yaml
plan_unit_id: N2-002
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Plans/newtools.md is a plan document only for interviewer GUI/testing tool discovery, headless GUI testing/debug logs, and test strategy integration. The single rollout includes Doctor platform versions, MCP Doctor check, and catalog version coverage.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plan_only_gui_testing_scope
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: plan_only_gui_testing_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0002
preserved_exact_tokens:
- PLAN DOCUMENT ONLY
- Doctor platform versions
- MCP Doctor check
- catalog version
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-003 - Rewrite Tool Registry And Event Alignment

```yaml
plan_unit_id: N2-003
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Tool discovery, permissions, validation, execution results, storage, latency, errors, analytics, and dashboard rollups align to the central tool registry, policy engine, unified event model, and seglog -> projections through redb/Tantivy.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: rewrite_tool_registry_event_alignment
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: rewrite_tool_registry_event_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0003
preserved_exact_tokens:
- central tool registry + policy engine
- unified event model
- seglog -> projections (redb/Tantivy)
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD'
```

### N2-004 - Slint Delivery And Provider Auth Alignment

```yaml
plan_unit_id: N2-004
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: UI wiring is Slint-era only, no legacy Iced runtime wiring is required. Subscription-first auth preserves Gemini Direct gemini, Antigravity CLI as the active Google-owned CLI-runtime route, key-exception semantics where supported, and gemini_cli only as retired/source-lineage vocabulary while retiring stale one-provider mixed-account Gemini wording.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: slint_provider_auth_alignment
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: slint_provider_auth_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0003
preserved_exact_tokens:
- Slint
- no legacy Iced runtime wiring
- Gemini Direct
- gemini
- Antigravity CLI
- Gemini CLI
- gemini_cli
- key-exception
- mixed-account
negative_constraints:
- Legacy Iced runtime wiring is not required for this task.
- Do not preserve Gemini CLI or gemini_cli as an active provider route.
compatibility_only_notes:
- Deliverables remain Plans-folder documentation updates for the Slint rebuild.
- Gemini CLI and gemini_cli are retained only as retired/source-lineage vocabulary.
stale_retired_dispositions:
- Stale one-provider mixed-account Gemini wording is retired in favor of Gemini Direct plus Antigravity CLI, with Gemini CLI active-provider wording retired.
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD'
```

### N2-005 - Route/View-State Target Identity Boundary

```yaml
plan_unit_id: N2-005
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: cmd.source_control.switch_subview remains a /view-state command. Repo, worktree, /worktree/compare, route/open target identity, and the runtime object envelope remain the operational target identity owners.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: route_view_state_target_identity_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: route_view_state_target_identity_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0004
preserved_exact_tokens:
- cmd.source_control.switch_subview
- /view-state
- /worktree/compare
- route/open contract
negative_constraints:
- Tooling summaries must not let shell view commands become target identity owners.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-006 - Open-Resolution And Automation Defaults

```yaml
plan_unit_id: N2-006
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Open-resolution focus resolves through shared object/surface routing. regular, visual_mode, visual_mode = auto, optional HITL, and /HTE-by-default remain one automation-first mode policy with compact status chips, icons, detail, deep-link pivots, surface identity, and sub-selection focus.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: open_resolution_automation_defaults
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: open_resolution_automation_defaults
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0004
preserved_exact_tokens:
- /open-resolution
- regular
- visual_mode
- visual_mode = auto
- /HTE-by-default
- /icons
- /detail
- /surface
- /sub-selection
negative_constraints:
- Local visual runs must not defeat the automation-first posture.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-007 - DRY Method Compliance Anchor

```yaml
plan_unit_id: N2-007
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: All implementation in this plan follows Primitive:DRYRules and Plans/DRY_Rules.md#7.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dry_method_compliance_anchor
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: dry_method_compliance_anchor
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0005
preserved_exact_tokens:
- DRY Method Compliance
- Primitive:DRYRules
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### N2-008 - Platform And Subagent Registry DRY

```yaml
plan_unit_id: N2-008
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'Implementation uses platform_specs:: and subagent_registry:: helpers and never hardcodes platform CLI commands, binary names, models, auth, capabilities, or subagent names.'
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: platform_subagent_registry_dry
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: platform_subagent_registry_dry
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0006
preserved_exact_tokens:
- 'platform_specs::'
- 'subagent_registry::'
- DRY:DATA:subagent_registry
negative_constraints:
- Never hardcode platform CLI commands, binary names, models, auth, capabilities, or subagent names.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/orchestrator-subagent-integration.md'
```

### N2-009 - GuiToolCatalog SSOT

```yaml
plan_unit_id: N2-009
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: DRY:DATA:gui_tool_catalog is the single source of truth for framework/tool data. Tool names, installation paths, and framework-specific behavior are not duplicated in views, prompts, or flow logic.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_tool_catalog_ssot
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: gui_tool_catalog_ssot
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0006
preserved_exact_tokens:
- DRY:DATA:gui_tool_catalog
- Tool/Framework Data -- Single Source of Truth
negative_constraints:
- Never hardcode tool names, installation paths, or framework-specific behavior.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### N2-010 - Reusable Tagging And Widget Reuse

```yaml
plan_unit_id: N2-010
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Reusable functions, data structures, widgets, and helpers are tagged. New interview UI checks docs/gui-widget-catalog.md, reuses src/widgets/, and requires UI-DRY-EXCEPTION for bespoke UI.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: reusable_tagging_widget_reuse
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: reusable_tagging_widget_reuse
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0006
preserved_exact_tokens:
- DRY:FN
- DRY:DATA
- DRY:WIDGET
- DRY:HELPER
- docs/gui-widget-catalog.md
- src/widgets/
- UI-DRY-EXCEPTION
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### N2-011 - Non-Web GUI Testing Summary

```yaml
plan_unit_id: N2-011
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Browser Program and policy-gated Expert Browser Program are the only PM-native web browser automation and testing paths. Native/framework GUIs such as Iced, Dioxus, Qt, Electron, and Tauri need discoverable existing tools or a custom headless GUI tool with full debug logs; independent user Project test runners remain generic external Project processes.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: non_web_gui_testing_summary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: non_web_gui_testing_summary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0008
preserved_exact_tokens:
- Browser Program
- Expert Browser Program
- web-based GUIs
- Iced
- Dioxus
- Qt
- Electron
- Tauri
- full debug log
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-012 - Interview Discovery Choice Flow

```yaml
plan_unit_id: N2-012
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The interview detects GUI stack, discovers existing framework tools, presents user choices for existing tools, custom headless tools, or both, and writes the selected choices into generated plans and test strategy.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_discovery_choice_flow
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: interview_discovery_choice_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0008
preserved_exact_tokens:
- Discovery
- User choice
- Plan and test strategy
- existing tools
- custom headless
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-013 - Success Criteria And No Regression

```yaml
plan_unit_id: N2-013
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Success requires detected non-web GUI frameworks to offer catalog/custom options, persisted choices to drive strategy and PRD content, agents to receive evidence paths, Doctor to check custom headless when chosen, MCP to be configurable for non-browser integrations, and unselected flows to preserve Browser Program behavior without creating another PM browser path.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: success_criteria_no_regression
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: success_criteria_no_regression
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0008
preserved_exact_tokens:
- Success criteria
- Doctor
- MCP
- Existing Browser Program flow
- no regression
negative_constraints:
- Existing Browser Program and test-strategy behavior remain unchanged when no new options are selected.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-014 - Interview And Orchestrator Integration

```yaml
plan_unit_id: N2-014
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: newtools extends interview and test strategy without replacing them. New settings wire through InterviewOrchestratorConfig, gui_config.interview, interview completion, test strategy generation, and orchestrator-loaded node criteria.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_orchestrator_integration
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: interview_orchestrator_integration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0009
preserved_exact_tokens:
- InterviewOrchestratorConfig
- gui_config.interview
- test strategy
- node criteria
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/interview-subagent-integration.md'
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md'
```

### N2-015 - Worktree Config Cleanup Boundary

```yaml
plan_unit_id: N2-015
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Interview toggles live in the Interview tab and gui_config.interview, use the same Option B run-config build, keep worktree evidence under the run workspace, preserve .puppet-master/evidence/ cleanup allowlisting, and add no run_with_cleanup call sites.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: worktree_config_cleanup_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: worktree_config_cleanup_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0009
preserved_exact_tokens:
- Option B run-config
- .puppet-master/evidence/
- run_with_cleanup
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/WorktreeGitImprovement.md'
- 'ContractRef: ContractName:Plans/MiscPlan.md'
```

### N2-016 - Non-Web GUI Testing Gap

```yaml
plan_unit_id: N2-016
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The current interviewer does not consistently expose Browser Program, Expert Browser Program, and framework-specific tools, leaving native/framework GUIs without reliable smoke tests or GUI-level verification.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: non_web_gui_testing_gap
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: non_web_gui_testing_gap
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0010
preserved_exact_tokens:
- Browser Program
- Expert Browser Program
- Native/framework GUIs
- smoke tests
- GUI-level verification
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-017 - Discovery And Choice Goals

```yaml
plan_unit_id: N2-017
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Goals preserve one-catalog discovery of framework tools and user options to select existing tools, custom headless tool planning/building, or both.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: discovery_choice_goals
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: discovery_choice_goals
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0011
preserved_exact_tokens:
- Discover existing tools
- Offer options to the user
- framework tools
- custom headless
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
- 'ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation'
```

### N2-018 - Custom Headless Evidence Goal

```yaml
plan_unit_id: N2-018
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: When chosen, execution plans include a project-specific tool that supports headless GUI navigation and emits a full debug log after runs so agents can verify behavior and debug failures.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: custom_headless_evidence_goal
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: custom_headless_evidence_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0011
preserved_exact_tokens:
- Custom headless tool option
- headless GUI navigation
- full debug log
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:evidence.schema.json, ContractName:AGENTS.md'
```

### N2-019 - Testing And DRY Integration Goal

```yaml
plan_unit_id: N2-019
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Selected tools and custom headless instructions appear in test strategy, PRD/execution plan language, and agent instructions while framework/tool data stays in one catalog and existing interview, generator, and prompt/context flows are reused.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: testing_dry_integration_goal
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: testing_dry_integration_goal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0011
preserved_exact_tokens:
- Integrate into testing
- DRY
- test strategy
- PRD
- agents use the tools
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation'
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#test-strategy-loading'
```

### N2-020 - Design Flow

```yaml
plan_unit_id: N2-020
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The design flow derives GUI type/framework, looks up available tools in the catalog, presents Testing-phase options, persists choices, and writes setup/build/testing instructions at interview completion.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: design_flow
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: design_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0012
preserved_exact_tokens:
- GUI type
- framework
- Lookup
- Testing phase
- Persist user choices
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#config-wiring'
```

### N2-021 - Interview Persistence And Completion Outputs

```yaml
plan_unit_id: N2-021
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Interview state/config persists use_browser_program, use_framework_tools, plan_custom_headless_tool, and selected_framework_tools. Completion writes Browser Program instructions plus tasks for existing framework-tool setup, custom headless build/adoption, and debug-log evidence paths.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_persistence_completion_outputs
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: interview_persistence_completion_outputs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0012
preserved_exact_tokens:
- use_browser_program
- use_framework_tools
- plan_custom_headless_tool
- selected_framework_tools
- debug log
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-022 - Catalog Location And Base Data

```yaml
plan_unit_id: N2-022
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The required GuiToolCatalog location is puppet-master-rs/src/interview/gui_tool_catalog.rs and it is tagged as // DRY:DATA:GuiToolCatalog.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: catalog_location_base_data
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: catalog_location_base_data
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0014
preserved_exact_tokens:
- puppet-master-rs/src/interview/gui_tool_catalog.rs
- // DRY:DATA:GuiToolCatalog
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2'
```

### N2-023 - Runtime-Mutable Overlay

```yaml
plan_unit_id: N2-023
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: GuiToolCatalog combines a shipped base catalog with a non-secret redb settings overlay editable via UI and JSON import/export. Overlay wins by framework_id and tool_id, and research-populated entries are written to overlay only.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_mutable_catalog_overlay
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: runtime_mutable_catalog_overlay
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0014
preserved_exact_tokens:
- Base catalog
- User overlay catalog
- redb settings store
- export/import as JSON
- overlay wins
- framework_id
- tool_id
negative_constraints:
- Research-populated entries are written to the overlay, never to the base catalog.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, PolicyRule:Decision_Policy.md§2, PolicyRule:no_secrets_in_storage'
```

### N2-024 - Catalog Schema And Seed Entries

```yaml
plan_unit_id: N2-024
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Catalog content preserves framework IDs web, iced, dioxus, qt, flutter, tauri, electron, detection hints, existing tool entries, custom headless default, and the compatibility-only Spectron legacy seed row.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: catalog_schema_seed_entries
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: catalog_schema_seed_entries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0014
preserved_exact_tokens:
- web
- iced
- dioxus
- qt
- flutter
- tauri
- electron
- Spectron legacy
negative_constraints: []
compatibility_only_notes:
- Spectron legacy is retained as compatibility-only seed vocabulary.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-025 - Catalog Extensibility Helpers

```yaml
plan_unit_id: N2-025
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The catalog is extensible without changing interviewer flow logic and provides DRY helpers for lookup by framework, listing tools for a framework, and deciding whether to suggest custom headless.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: catalog_extensibility_helpers
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: catalog_extensibility_helpers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0014
preserved_exact_tokens:
- lookup by framework
- list tools for framework
- should suggest custom headless
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2'
```

### N2-026 - Research Input-Only Constraint

```yaml
plan_unit_id: N2-026
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Context7 MCP and web search may inform catalog population or build plans but must not be presented as standalone research-only outcomes; unknown frameworks still get catalog-backed options and/or the full-featured custom-headless option.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: research_input_only_constraint
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: research_input_only_constraint
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0015
preserved_exact_tokens:
- Context7 MCP
- web search
- research-only outcome
negative_constraints:
- Research MUST NOT be presented as a standalone research-only outcome.
- Implementation MUST NOT offer a research-only mode where the interview concludes with only researched links and no concrete tool choice or build plan.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: PolicyRule:Decision_Policy.md§4, Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### N2-027 - MCP All-Provider Boundary

```yaml
plan_unit_id: N2-027
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: MCP-backed tools are supported and configurable for Cursor, Claude Code, OpenCode, Codex, GitHub Copilot, and Gemini through Puppet Master owned configuration; per-platform files are derived adapters only where required.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_all_provider_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mcp_all_provider_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0016
preserved_exact_tokens:
- Cursor
- Claude Code
- OpenCode
- Codex
- GitHub Copilot
- Gemini
- derived adapters
negative_constraints:
- Per-platform MCP files are derived adapters only, not canonical configuration owners.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-028 - MCP Setup And Verification

```yaml
plan_unit_id: N2-028
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Implementation configures and verifies MCP servers and API-key enablement so platform CLIs see selected tools at run time through config files, env vars, flags, or runtime adapters as appropriate.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_setup_verification
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mcp_setup_verification
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0016
preserved_exact_tokens:
- MCP
- API-key enablement
- config files
- env vars
- runtime adapters
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
```

### N2-029 - MCP Catalog Metadata And UI Disclosure

```yaml
plan_unit_id: N2-029
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Catalog tools expose requires_mcp and mcp_servers so UI, run config, and prompt builder can disclose and enable required MCP servers when selected.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_catalog_metadata_ui_disclosure
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mcp_catalog_metadata_ui_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0016
preserved_exact_tokens:
- requires_mcp
- mcp_servers
- UI
- run config
- prompt builder
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7'
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#platform-capability-manager'
```

### N2-030 - GUI Framework Detection State

```yaml
plan_unit_id: N2-030
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'Architecture, UX, and project dependency inputs produce detected_gui_frameworks: Vec<String> for subsequent GUI testing tool flow.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_framework_detection_state
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: gui_framework_detection_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0018
preserved_exact_tokens:
- 'detected_gui_frameworks: Vec<String>'
- Architecture
- UX
- feature_detector
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-031 - Testing-Phase Options

```yaml
plan_unit_id: N2-031
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Testing & Verification looks up detected GUI frameworks in GuiToolCatalog, optionally research-populates sparse catalog entries, and offers Browser Program, policy-gated Expert Browser Program, framework tools, and custom headless options. Independent user Project runners are generic external Project commands/processes, not PM browser options.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: testing_phase_options
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: testing_phase_options
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0019
preserved_exact_tokens:
- Testing & Verification
- GuiToolCatalog
- Browser Program
- Expert Browser Program
- Framework tools
- Custom headless tool
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-032 - Choice Persistence And Doctor Projection

```yaml
plan_unit_id: N2-032
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: selected_framework_tools and plan_custom_headless_tool persist in interview config/state, and completion writes or removes the Doctor-readable project config projection tools.custom_headless.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: choice_persistence_doctor_projection
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: choice_persistence_doctor_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0019
preserved_exact_tokens:
- selected_framework_tools
- plan_custom_headless_tool
- tools.custom_headless
- Doctor-readable projection
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-033 - Tool Selection UI Reuse

```yaml
plan_unit_id: N2-033
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The tool-selection UI reuses existing widgets and accessible toggles, checkboxes, or multi-select controls for Browser Program, policy-gated Expert Browser Program, per-framework existing tools, and the custom-headless option with tooltips and no one-off UI patterns.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_selection_ui_reuse
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: tool_selection_ui_reuse
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0020
preserved_exact_tokens:
- Browser Program
- Expert Browser Program
- multi-select
- custom headless GUI tool
- DRY:WIDGET
- keyboard navigation
- screen reader
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, ContractName:docs/gui-widget-catalog.md'
```

### N2-034 - MCP Consumer Boundary

```yaml
plan_unit_id: N2-034
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Section 8 is consumer guidance only. Plans/MCP_Integration.md is the current MCP SSOT and owns naming, availability, credential binding, config schema, and supported flows.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_consumer_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mcp_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0021
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0022
preserved_exact_tokens:
- MCP Support and GUI Settings
- Plans/MCP_Integration.md
- live canon now
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP naming, availability, credential binding, config schema, and supported flows.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MCP_Integration.md, ContractName:Plans/FinalGUISpec.md'
```

### N2-035 - GUI Settings Provider Availability Mirror

```yaml
plan_unit_id: N2-035
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: GUI/settings alignment mirrors Plans/Tools.md and Plans/MCP_Integration.md. The global provider stack is user-changeable, per-operation priority reordering is not MVP, global MVP provider priority is not immutable policy, and row-level health/error disclosure remains visible.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_settings_provider_availability_mirror
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: gui_settings_provider_availability_mirror
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0023
preserved_exact_tokens:
- GUI/settings alignment
- global provider stack
- per-operation priority reordering is NOT MVP
- row-level health/error disclosure
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Tools.md owns provider stack, Firecrawl, and web-routing canon.
- Plans/MCP_Integration.md owns MCP availability vocabulary.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Plans/Tools.md#11.1 Provider classes, defaults, and fallback disclosure, Plans/Tools.md#12. Web tool routing algorithm, Plans/MCP_Integration.md#2. Requested versus effective availability, Plans/MCP_Integration.md#7. Effective tool availability and GUI surfacing'
```

### N2-036 - Firecrawl Defaults And Status Vocabulary

```yaml
plan_unit_id: N2-036
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Settings guidance preserves authenticated/expired/not_authenticated, connected/disabled/needs_auth/needs_client_registration/failed, LoggedIn/LoggedOut/AuthExpired/AuthFailed, {server_slug}_{tool_name}, provider ID firecrawl, display Firecrawl, priority below Exa/Tavily and above DDG, and default disabled.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_status_vocabulary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: firecrawl_status_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0023
preserved_exact_tokens:
- authenticated
- expired
- not_authenticated
- connected
- disabled
- needs_auth
- needs_client_registration
- failed
- LoggedIn
- LoggedOut
- AuthExpired
- AuthFailed
- '{server_slug}_{tool_name}'
- firecrawl
- Firecrawl
- Exa
- Tavily
- DDG
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-037 - Cited-Search Compatibility Boundary

```yaml
plan_unit_id: N2-037
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Cited-search wording is non-normative consumer guidance. Legacy aliases resolve here for cross-reference compatibility only and do not replace provider capability, routing, provenance, or billing canon.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: cited_search_compatibility_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: cited_search_compatibility_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0024
preserved_exact_tokens:
- cited-search
- cited web search contract
- Legacy TOC
- ENTIRELY MISSING
negative_constraints:
- Cited-search wording does not replace provider capability, routing, provenance, or billing canon.
compatibility_only_notes:
- Legacy cited-search aliases resolve to this landing for cross-reference compatibility only.
- Legacy TOC and ENTIRELY MISSING audit wording is retired gap history, not active product canon.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Plans/Tools.md#11.1 Provider classes, defaults, and fallback disclosure, Plans/Tools.md#12. Web tool routing algorithm, Plans/MCP_Integration.md#2. Requested versus effective availability, Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context'
```

### N2-038 - Web-Tool Search Behavior And Site Reader

```yaml
plan_unit_id: N2-038
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Web-tool consumer guidance preserves user-facing activities Searching Web, Reading Site, and Site Reader; hosted/free-tier Exa-style search; agent search-then-read expectations; DDG fallback/compatibility status; and Site Reader v1 full browser interaction.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: web_tool_search_site_reader
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: web_tool_search_site_reader
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0024
preserved_exact_tokens:
- Searching Web
- Reading Site
- Site Reader
- Exa
- DuckDuckGo/DDG
- Site Reader v1
negative_constraints:
- PM must not degrade LLM/web-research flows into search-only or instant-answer behavior by default.
- DuckDuckGo/DDG wrappers or scraping adapters are fallback/compatibility options, not the primary provider contract.
compatibility_only_notes:
- DDG wrappers or scraping-based adapters are fallback/compatibility options.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-039 - Research Session Variant Pointer

```yaml
plan_unit_id: N2-039
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Research-session behavior references the shared research_session contract in Plans/Section15_MVP_Promoted_Features_Spec.md; MCP settings do not redefine it.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: research_session_variant_pointer
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: research_session_variant_pointer
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0025
preserved_exact_tokens:
- research_session
- Plans/Section15_MVP_Promoted_Features_Spec.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Section15_MVP_Promoted_Features_Spec.md owns research_session behavior.
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-040 - Headless Execution And Action Catalog

```yaml
plan_unit_id: N2-040
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Chosen custom headless GUI tools run without display in CI-friendly mode and provide a reusable action catalog or scenario set for smoke and regression flows rather than one-off scripts.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: headless_execution_action_catalog
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: headless_execution_action_catalog
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0026
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0027
preserved_exact_tokens:
- Headless execution
- CI-friendly
- Action catalog
- not a one-off script
negative_constraints:
- The custom headless GUI tool must not be a one-off script.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:AGENTS.md-action-catalog'
```

### N2-041 - Full Evidence Output

```yaml
plan_unit_id: N2-041
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Each custom headless run emits Timeline timeline.jsonl, Summary summary.md, artifacts such as screenshots or state dumps per step, the canonical manifest described in Section 13, and evidence under .puppet-master/evidence/gui-automation/<run_id>/.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: full_evidence_output
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: full_evidence_output
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0027
preserved_exact_tokens:
- Timeline
- timeline.jsonl
- Summary
- summary.md
- Artifacts
- screenshots
- state dumps
- .puppet-master/evidence/gui-automation/<run_id>/
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:evidence.schema.json, Gate:GATE-005, ContractName:AGENTS.md-evidence'
```

### N2-042 - Plan Outputs For Existing Custom Both

```yaml
plan_unit_id: N2-042
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Generated plans document setup/use of selected existing tools, design and implementation of full-featured custom headless tools, or combined coverage using existing tools where they fit and custom tooling for full coverage and evidence.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: plan_outputs_existing_custom_both
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: plan_outputs_existing_custom_both
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0028
preserved_exact_tokens:
- If get existing tool
- If build custom
- If both
- full-featured
negative_constraints:
- Custom headless deliverables are not minimal smoke harnesses.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:evidence.schema.json, ContractName:AGENTS.md'
```

### N2-043 - Puppet Master Automation Reference

```yaml
plan_unit_id: N2-043
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Puppet Master src/automation/ headless runner and action catalog are the reference implementation for Iced projects and analogous framework automation systems.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: puppet_master_automation_reference
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: puppet_master_automation_reference
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0029
preserved_exact_tokens:
- src/automation/
- headless runner
- action catalog
- Iced
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:AGENTS.md, SchemaID:evidence.schema.json'
```

### N2-044 - Test Strategy Tool Evidence Outputs

```yaml
plan_unit_id: N2-044
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: test-strategy.md and .puppet-master/interview/test-strategy.json include selected framework tool IDs, custom headless evidence instructions, debug-log paths, and usage notes for agents.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: test_strategy_tool_evidence_outputs
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: test_strategy_tool_evidence_outputs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0031
preserved_exact_tokens:
- test-strategy.md
- .puppet-master/interview/test-strategy.json
- selected framework tool IDs
- debug log
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:pm.test_strategy.schema.v1, PolicyRule:Decision_Policy.md§2'
```

### N2-045 - Test Types And DRY Generator

```yaml
plan_unit_id: N2-045
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Test strategy generation adds or reuses headless_gui and framework_tool test types through the same interview state and generator, without duplicating tool-selection logic in views and generators.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: test_types_dry_generator
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: test_types_dry_generator
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0031
preserved_exact_tokens:
- headless_gui
- framework_tool
- test_strategy_generator
- TestItem
negative_constraints:
- Do not duplicate what tools to use across views and generators.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-046 - PRD Execution Plan Tasks And Acceptance Criteria

```yaml
plan_unit_id: N2-046
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: PRD or execution plans include obtain/setup tasks for selected tools and custom-headless design/build tasks when selected. Acceptance criteria require Browser Program or policy-gated Expert Browser Program when web testing applies, selected framework tools, and custom-headless runs plus debug-log checks as applicable.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: prd_execution_acceptance_criteria
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: prd_execution_acceptance_criteria
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0032
preserved_exact_tokens:
- Obtain/set up
- Plan and implement custom headless GUI tool
- Acceptance criteria
- debug log
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation, SchemaID:evidence.schema.json'
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#test-strategy-loading, SchemaID:evidence.schema.json'
```

### N2-047 - Prompt Context Injection

```yaml
plan_unit_id: N2-047
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Prompt builder includes framework tools, custom headless instructions, debug-log paths, and other new test strategy content in the loaded test strategy excerpt so agents know when and how to use each tool.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: prompt_context_injection
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: prompt_context_injection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0033
preserved_exact_tokens:
- Prompt builder
- load_interview_outputs
- debug log path
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#test-strategy-loading, ContractName:Plans/interview-subagent-integration.md#dry-compliance'
```

### N2-048 - In-Window Implementation Checklist Mirror

```yaml
plan_unit_id: N2-048
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Lines 386-400 of the implementation checklist mirror covered requirements for GuiToolCatalog, research input-only, MCP invocation, GUI stack detection, Testing-phase options, tool-selection UI, MCP settings, custom headless, test strategy, PRD/execution plans, prompt context, and the custom-headless Doctor check. This checklist mirror is not WorkNode or task-manifest creation.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, or evidence behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source lines 386-400 remain losslessly available for exact-text audit.
- The checklist items covered by this window remain represented as PlanUnit mirror coverage only.
- newtools-S0034 lines 401-408 are covered by N2-049 after Phase 2B batch 105.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: implementation_checklist_mirror_partial
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: implementation_checklist_mirror_partial
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0034
preserved_exact_tokens:
- Implementation Checklist
- '6.1'
- '6.2'
- '6.3'
- '7.1'
- '7.2'
- '7.3'
- '8.1'
- '8.2'
- '9'
- '10.1'
- '10.2'
- '10.3'
- Doctor
negative_constraints:
- This checklist mirror does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-049 - Residual Implementation Checklist Quality Gates

```yaml
plan_unit_id: N2-049
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Lines 401-405 of the implementation checklist require Doctor platform version reporting, an MCP Doctor check, catalog version/overlay last_updated, DRY-only catalog data with no hardcoded tool lists, and closure of the listed Section 12.6 gaps. This is checklist mirror coverage only and creates no WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: residual_checklist_quality_gates
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: residual_checklist_quality_gates
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0034
preserved_exact_tokens:
- Doctor (platform versions)
- Doctor (MCP)
- Catalog version / last-updated
- DRY
- Gaps §12.6
negative_constraints:
- This checklist mirror creates no WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-050 - Catalog Maintenance And Unknown Framework Fallback

```yaml
plan_unit_id: N2-050
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Tool catalog maintenance stays centralized in one file or module. Unknown frameworks still offer the option to plan/build the full-featured custom headless tool; research may populate the catalog or inform that plan, but there is no research-only user outcome.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: catalog_maintenance_unknown_framework_fallback
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: catalog_maintenance_unknown_framework_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0036
preserved_exact_tokens:
- full-featured
- research-only outcome
negative_constraints:
- Unknown framework handling must not become a research-only outcome.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-051 - Full-Featured Custom Headless Tool Scope

```yaml
plan_unit_id: N2-051
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Custom headless GUI tools are substantial, full-featured systems with headless runner, action catalog, timeline, summary, and artifacts. Puppet Master automation is the reference for Iced; other frameworks need analogous evidence depth, and the deliverable must not be framed as a minimal smoke harness.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: full_featured_custom_headless_scope
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: full_featured_custom_headless_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0037
preserved_exact_tokens:
- full-featured
- headless runner
- action catalog
- timeline
- summary
- artifacts
- Iced
- minimal smoke harness
negative_constraints:
- Do not frame the deliverable as a minimal smoke harness.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:AGENTS.md, SchemaID:evidence.schema.json'
```

### N2-052 - Interview Widget Reuse

```yaml
plan_unit_id: N2-052
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: New interview UI uses docs/gui-widget-catalog.md and src/widgets/ and tags widgets with // DRY:WIDGET:... .
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_widget_reuse
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: interview_widget_reuse
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0038
preserved_exact_tokens:
- docs/gui-widget-catalog.md
- src/widgets/
- // DRY:WIDGET
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-053 - Tool Data And Test Strategy DRY Gates

```yaml
plan_unit_id: N2-053
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Framework/tool data lives only in GuiToolCatalog or equivalent, test strategy behavior extends existing generator/types instead of duplicating tool-use rules, and pre-completion requires cargo check, cargo test, DRY checks, no hardcoded tool lists, and scope respected.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_data_test_strategy_dry_gates
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: tool_data_test_strategy_dry_gates
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0038
preserved_exact_tokens:
- GuiToolCatalog
- test_strategy_generator
- cargo check
- cargo test
- no hardcoded tool lists
negative_constraints:
- Framework/tool data must not be hardcoded outside the catalog.
- Test strategy behavior must not duplicate tool-use rules across multiple places.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-054 - Interview Testing Phase Consistency

```yaml
plan_unit_id: N2-054
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The interview plan Testing phase already uses qa-expert and test-automator; newtools adds tool discovery and selection as part of that phase, with config wiring following orchestrator config wiring.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_testing_phase_consistency
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: interview_testing_phase_consistency
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0039
preserved_exact_tokens:
- qa-expert
- test-automator
- tool discovery and selection
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-8-testing, ContractName:Plans/orchestrator-subagent-integration.md#config-wiring'
```

### N2-055 - Orchestrator Test Strategy Merge Consistency

```yaml
plan_unit_id: N2-055
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Orchestrator test strategy loading and node-criteria merging must include new tool instructions and debug-log paths in the merged context.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: orchestrator_test_strategy_merge_consistency
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: orchestrator_test_strategy_merge_consistency
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0039
preserved_exact_tokens:
- test strategy
- node criteria
- debug log paths
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#test-strategy-loading'
```

### N2-056 - GUI Framework Detection Gap

```yaml
plan_unit_id: N2-056
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Implementation must add a dedicated GUI framework detection step from Architecture/UX output, project files, or catalog detection hints, or extend TechnologyExtractor with GUI-framework patterns and derive detected_gui_frameworks; the chosen approach must be documented in implementation evidence.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_framework_detection_gap
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: gui_framework_detection_gap
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- feature_detector
- technology_matrix
- TechnologyExtractor
- detected_gui_frameworks
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:evidence.schema.json, Gate:GATE-005, PolicyRule:Decision_Policy.md§2'
```

### N2-057 - PRD Tool Task Injection Path

```yaml
plan_unit_id: N2-057
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Tasks for obtaining selected tools and building custom headless tooling must be injected through the PRD generator, requirements document fallback, or separate .puppet-master/interview/gui-testing-plan.md only if PRD cannot be amended; the implementation must document the chosen path and must not leave tasks unwired.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: prd_tool_task_injection_path
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: prd_tool_task_injection_path
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- PRD generator
- .puppet-master/interview/gui-testing-plan.md
- tasks unwired
negative_constraints:
- Implementation must not leave tool setup or custom-headless tasks unwired.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation, SchemaID:evidence.schema.json, Gate:GATE-005, PolicyRule:Decision_Policy.md§4'
```

### N2-058 - Interview State And Config Persistence

```yaml
plan_unit_id: N2-058
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'InterviewState gains detected_gui_frameworks: Vec<String>, while InterviewGuiConfig and InterviewOrchestratorConfig gain selected_framework_tools: Vec<FrameworkToolChoice> and plan_custom_headless_tool: bool; app.rs and interview completion wire those values into test strategy and PRD/execution-plan generation.'
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: interview_state_config_persistence
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: interview_state_config_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- InterviewState
- 'detected_gui_frameworks: Vec<String>'
- InterviewGuiConfig
- InterviewOrchestratorConfig
- 'selected_framework_tools: Vec<FrameworkToolChoice>'
- 'plan_custom_headless_tool: bool'
- app.rs
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#config-wiring, SchemaID:evidence.schema.json, Gate:GATE-005'
```

### N2-059 - Additive Test Strategy Schema Compatibility

```yaml
plan_unit_id: N2-059
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: NodeTree::load_test_strategy and Plans/test_strategy.schema.json extend additively for headless_gui, framework_tool, and optional tool metadata while preserving backward compatibility for existing files and requiring no migration of old files.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: additive_test_strategy_schema_compatibility
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: additive_test_strategy_schema_compatibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- NodeTree::load_test_strategy
- Plans/test_strategy.schema.json
- headless_gui
- framework_tool
- no migration of old files required
negative_constraints: []
compatibility_only_notes:
- Backward compatibility is required for existing test-strategy files.
- No migration of old files is required.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:pm.test_strategy.schema.v1, Gate:GATE-001, PolicyRule:Decision_Policy.md§2'
```

### N2-060 - Custom Headless Verification Command Convention

```yaml
plan_unit_id: N2-060
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The test strategy generator emits a deterministic convention-based command when the project follows documented naming, or an EXAMPLE-only command with criterion-based instructions when the executable command is project-specific.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: custom_headless_verification_command_convention
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: custom_headless_verification_command_convention
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- verification_command
- cargo run --bin headless_runner
- npm run test:headless
- EXAMPLE-only
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:evidence.schema.json, Gate:GATE-005, PolicyRule:Decision_Policy.md§4'
```

### N2-061 - Runtime-Mutable GuiToolCatalog Overlay

```yaml
plan_unit_id: N2-061
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The base catalog is code-shipped defaults; the overlay is stored in non-secret app settings, is editable/importable/exportable, overrides base entries by stable IDs, carries source and last_updated, and all updates pass structured validation.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: runtime_mutable_gui_tool_catalog_overlay
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: runtime_mutable_gui_tool_catalog_overlay
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- Resolved — runtime-mutable overlay
- stable IDs
- last_updated
- structured validation
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, Gate:GATE-009, PolicyRule:Decision_Policy.md§2'
```

### N2-062 - Catalog Module Ownership Boundary

```yaml
plan_unit_id: N2-062
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The catalog must live in src/interview/gui_tool_catalog.rs; automation stays focused on running tests, and any later framework branching depends on interview or shared config rather than duplicating catalog data.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: catalog_module_ownership_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: catalog_module_ownership_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- src/interview/gui_tool_catalog.rs
- interview owns what tools to offer
- automation runs tests
negative_constraints:
- Framework/tool catalog data must not be duplicated in automation.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Interview owns what tools to offer; automation remains focused on running tests.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2'
```

### N2-063 - GUI Automation Evidence Path State Files

```yaml
plan_unit_id: N2-063
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: .puppet-master/evidence/gui-automation/ must be documented in STATE_FILES.md and added to the cleanup allowlist so generated evidence is never removed by prepare/cleanup.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_automation_evidence_path_state_files
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: gui_automation_evidence_path_state_files
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- .puppet-master/evidence/gui-automation/
- STATE_FILES.md
- cleanup allowlist
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:STATE_FILES.md, ContractName:Plans/MiscPlan.md#cleanup, SchemaID:evidence.schema.json'
```

### N2-064 - Conditional Custom Headless Doctor Check

```yaml
plan_unit_id: N2-064
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Doctor conditionally verifies that the custom headless tool exists and runs when plan_custom_headless_tool was true, using the Section 12.6 detection contract as input.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: conditional_custom_headless_doctor_check
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: conditional_custom_headless_doctor_check
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- Doctor check
- plan_custom_headless_tool
- detection contract
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, SchemaID:evidence.schema.json, Gate:GATE-005'
```

### N2-065 - Consistent Interview Config Field Names

```yaml
plan_unit_id: N2-065
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: GUI config, YAML config, and InterviewOrchestratorConfig use the same field names detected_gui_frameworks, selected_framework_tools, and plan_custom_headless_tool, serialized through the Option B run-config shape.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: consistent_interview_config_field_names
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: consistent_interview_config_field_names
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0040
preserved_exact_tokens:
- detected_gui_frameworks
- selected_framework_tools
- plan_custom_headless_tool
- Option B run-config
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#config-wiring, ContractName:Plans/WorktreeGitImprovement.md#option-b-run-config'
```

### N2-066 - Custom Headless Detection Contract

```yaml
plan_unit_id: N2-066
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Interview completion writes .puppet-master/config.json with tools.custom_headless only when plan_custom_headless_tool == true; Doctor reads that key, validates string/object shape and executable path, registers CustomHeadlessTool only when valid, warns and skips invalid values, skips cleanly when absent, and emits doctor.custom_headless.checked.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: custom_headless_detection_contract
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: custom_headless_detection_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- tools.custom_headless
- CustomHeadlessTool
- tool.custom_headless.invalid
- tool.custom_headless.skipped
- doctor.custom_headless.checked
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, ContractName:STATE_FILES.md, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§2'
```

### N2-067 - Test Strategy Artifact Schema Ownership

```yaml
plan_unit_id: N2-067
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: .puppet-master/interview/test-strategy.json has top-level project, generatedAt, coverageLevel, and items[]; Plans/test_strategy.schema.json remains canonical schema pm.test_strategy.schema.v1; interview writes it, orchestrator reads it, and newtools extends it additively.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: test_strategy_artifact_schema_ownership
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: test_strategy_artifact_schema_ownership
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- .puppet-master/interview/test-strategy.json
- project
- generatedAt
- coverageLevel
- items[]
- pm.test_strategy.schema.v1
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:pm.test_strategy.schema.v1, Gate:GATE-001, PolicyRule:Decision_Policy.md§2'
```

### N2-068 - MCP Adapter Injection CWD Boundary

```yaml
plan_unit_id: N2-068
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: CliBridge provider MCP adapter config is derived from the central registry and generated before CLI start in the actual spawn cwd, preferably at spawn time so worktree runs see correct project-local files; DirectApi providers do not use provider-side MCP config files.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_adapter_injection_cwd_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mcp_adapter_injection_cwd_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- CliBridge
- actual spawn cwd
- worktree
- DirectApi
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The central MCP registry remains authoritative; provider-side files are derived adapters only.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/WorktreeGitImprovement.md, PolicyRule:Decision_Policy.md§2, SchemaID:evidence.schema.json'
```

### N2-069 - Credential-Store-Only API Key Storage

```yaml
plan_unit_id: N2-069
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Secrets must not be written to seglog, redb, Tantivy, YAML config, .puppet-master/config.json, logs, evidence bundles, or state files. Allowed persistence is OS credential store only, with environment variables first and credential-store SecretId second, and UI shows only key stored/missing.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: credential_store_only_api_key_storage
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: credential_store_only_api_key_storage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- seglog
- redb
- Tantivy
- .puppet-master/config.json
- OS credential store
- SecretId
- Key stored/missing
negative_constraints:
- Secrets must not be written to seglog, redb, Tantivy, YAML config, .puppet-master/config.json, logs, evidence bundles, or state files.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Invariant:INV-002, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002'
```

### N2-070 - Iced Catalog Detection Hints

```yaml
plan_unit_id: N2-070
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Catalog detection rules must reliably set detected_gui_frameworks; for Iced, preferred detection checks Cargo.toml for iced or scans for src/automation/headless_runner or src/automation/action_catalog.rs, and must not miss Puppet Master automation pattern.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: iced_catalog_detection_hints
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: iced_catalog_detection_hints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- Cargo.toml
- iced
- src/automation/headless_runner
- src/automation/action_catalog.rs
negative_constraints:
- Detection must not miss Iced when the Puppet Master automation pattern is present.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, ContractName:AGENTS.md, PolicyRule:Decision_Policy.md§2'
```

### N2-071 - Browser Program And Framework Tool Strategy Wiring

```yaml
plan_unit_id: N2-071
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: write_test_strategy, TestStrategyConfig, InterviewOrchestratorConfig, and app.rs must pass selected_framework_tools and plan_custom_headless_tool through interview completion so markdown and JSON include framework tools and custom headless sections/items.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_program_framework_tool_strategy_wiring
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: browser_program_framework_tool_strategy_wiring
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- write_test_strategy
- TestStrategyConfig
- InterviewOrchestratorConfig
- app.rs
- selected_framework_tools
- plan_custom_headless_tool
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/interview-subagent-integration.md#phase-5-document-generation, ContractName:Plans/orchestrator-subagent-integration.md#config-wiring, SchemaID:evidence.schema.json, Gate:GATE-005'
```

### N2-072 - Headless Tool Binary Convention Documentation

```yaml
plan_unit_id: N2-072
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The generator and agents share documented command conventions in AGENTS.md or STATE_FILES.md, emitting stable commands when conventions are followed and EXAMPLE markers plus criterion-based instructions otherwise.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: headless_tool_binary_convention_documentation
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: headless_tool_binary_convention_documentation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- AGENTS.md
- STATE_FILES.md
- EXAMPLE
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:AGENTS.md, ContractName:STATE_FILES.md, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§2, PolicyRule:Decision_Policy.md§4'
```

### N2-073 - Doctor Platform Version Report

```yaml
plan_unit_id: N2-073
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Doctor or a small platform config report records CLI version per platform, such as agent --version or codex --version, so support can correlate behavior with platform churn.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: doctor_platform_version_report
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: doctor_platform_version_report
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- agent --version
- codex --version
- platform churn
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, SchemaID:evidence.schema.json, Gate:GATE-005'
```

### N2-074 - Existing Test Strategy Backward Compatibility

```yaml
plan_unit_id: N2-074
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Existing pre-newtools test-strategy.md and test-strategy.json continue to work; loader and prompt builder tolerate missing headless_gui and framework_tool items and optional tool metadata, with verification by tests or manual pre-newtools fixture.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: existing_test_strategy_backward_compatibility
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: existing_test_strategy_backward_compatibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- test-strategy.md
- test-strategy.json
- headless_gui
- framework_tool
negative_constraints: []
compatibility_only_notes:
- No migration of old files is required.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:evidence.schema.json, Gate:GATE-001, PolicyRule:Decision_Policy.md§2'
```

### N2-075 - MCP Doctor Reachability Check

```yaml
plan_unit_id: N2-075
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Doctor verifies configured MCP servers such as Context7 are reachable or can list tools per selected platform, complementing the headless-tool check.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_doctor_reachability_check
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mcp_doctor_reachability_check
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- Context7
- list tools
- headless-tool check
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, SchemaID:evidence.schema.json, Gate:GATE-005'
```

### N2-076 - Catalog Version And Overlay Metadata

```yaml
plan_unit_id: N2-076
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The catalog exposes a base CATALOG_VERSION and overlay last_updated metadata so agents and docs can reference catalog freshness while debugging tool availability.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: catalog_version_overlay_metadata
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: catalog_version_overlay_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0041
preserved_exact_tokens:
- CATALOG_VERSION
- last_updated
- catalog freshness
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, SchemaID:evidence.schema.json'
```

### N2-077 - Tool Discovery Crew Communication Boundary

```yaml
plan_unit_id: N2-077
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Tool-discovery crews follow PM child-run behavior, communicate through an attributable crew board when enabled, persist findings through canonical event/storage structures rather than .puppet-master/memory/*, and disclose degradation to independent child runs or a single child when crew coordination is unavailable.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_discovery_crew_communication_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: tool_discovery_crew_communication_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0042
preserved_exact_tokens:
- crew board
- .puppet-master/memory/*
- child runs
negative_constraints:
- Crew findings must not be persisted through .puppet-master/memory/* files.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Crew findings are persisted through canonical event/storage structures.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-chat-design.md'
```

### N2-078 - Tool Discovery Lifecycle Canon

```yaml
plan_unit_id: N2-078
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Tool-discovery lifecycle and quality features use canonical blocked payload fields, runtime taxonomy, child-run or crew events, handoff bundles, canonical state, and lineage-preserving reroute, replacement, or cancellation instead of active-agent or child-memory side files.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: tool_discovery_lifecycle_canon
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: tool_discovery_lifecycle_canon
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0043
preserved_exact_tokens:
- blocked payload fields
- runtime taxonomy
- handoff bundles
- canonical lineage
negative_constraints:
- Tool discovery continuity must not depend on active-agent side files or child-memory files.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Canonical state and events own tool-discovery continuity.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-memory-subsystem.md'
```

### N2-079 - GUI Automation Evidence Run Layout

```yaml
plan_unit_id: N2-079
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Each GUI automation run stores manifest.json, timeline.jsonl, summary.md, checks.json, screenshots, recordings, traces, and optional state dumps under .puppet-master/evidence/gui-automation/<run_id>/.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_automation_evidence_run_layout
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: gui_automation_evidence_run_layout
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0045
preserved_exact_tokens:
- manifest.json
- timeline.jsonl
- summary.md
- checks.json
- run.webm
- run.mp4
- trace.zip
- .puppet-master/evidence/gui-automation/<run_id>/
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-080 - Manifest Metadata And Chat Cards

```yaml
plan_unit_id: N2-080
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: manifest.json records run identity, timing, status, tool name/version, artifact paths, stable artifact metadata including hashes and render hints, optional step/test/timeline linkage, and pre-ranked chat_cards[] for fast chat rendering.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: manifest_metadata_chat_cards
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: manifest_metadata_chat_cards
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0045
preserved_exact_tokens:
- schema_id
- artifact_id
- mime_type
- sha256
- chat_cards[]
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-081 - Timeline Linkage And Manifest Schema Boundary

```yaml
plan_unit_id: N2-081
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: timeline.jsonl events should reference artifact_ids[]; manifest.json validates against Plans/gui_automation_manifest.schema.json with SchemaID:pm.gui_automation_manifest.schema.v1, and Plans/evidence.schema.json remains unextended by this plan.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: timeline_manifest_schema_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: timeline_manifest_schema_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0045
preserved_exact_tokens:
- artifact_ids[]
- Plans/gui_automation_manifest.schema.json
- SchemaID:pm.gui_automation_manifest.schema.v1
- Plans/evidence.schema.json
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/evidence.schema.json remains the evidence bundle schema and is not extended by this plan.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:pm.gui_automation_manifest.schema.v1, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§2'
```

### N2-082 - Chat Evidence Media Render Order

```yaml
plan_unit_id: N2-082
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'Chat renders evidence media in order: inline image card for image artifacts, inline video player for supported WebM/MP4 with poster and controls, playable link fallback for video failure, and download link fallback for traces, zips, and state dumps.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: chat_evidence_media_render_order
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: chat_evidence_media_render_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0046
preserved_exact_tokens:
- Inline image card
- Inline video player
- Playable link fallback
- Download link fallback
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-083 - Chat Rendering Rules And MCP Typed Content

```yaml
plan_unit_id: N2-083
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'Chat evidence shows a compact structured header, prioritizes first failure screenshot plus nearest recording segment, avoids base64 in normal chat, uses deterministic preview fallback text, and may render MCP type: image or type: resource content with MIME-aware handling.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: chat_rendering_mcp_typed_content
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: chat_rendering_mcp_typed_content
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0046
preserved_exact_tokens:
- Media preview unavailable
- 'type: image'
- 'type: resource'
negative_constraints:
- Normal chat should prefer path/resource references over base64.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-084 - GUI Scenario Evidence Capture Lifecycle

```yaml
plan_unit_id: N2-084
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: gui_run_scenario creates the run folder, initializes manifest/timeline, records step start/pass/fail events with artifact linkage, captures screenshots and optional recordings/traces, writes summary/checks, finalizes chat_cards, and lets chat load artifacts lazily from the manifest.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_scenario_evidence_capture_lifecycle
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: gui_scenario_evidence_capture_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0047
preserved_exact_tokens:
- gui_run_scenario
- step.started
- step.passed|step.failed
- artifact_ids[]
- chat_cards
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-085 - Generic Test Capture Attachment Interop

```yaml
plan_unit_id: N2-085
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Generic Test Capture producers keep attachment metadata such as contentType and file path aligned with the PM artifact contract so evidence remains portable across reporters. Artifacts from a generic external Project command/process retain explicit producer and external-Project attribution and confer no PM browser authority.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: generic_test_capture_attachment_interop
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: generic_test_capture_attachment_interop
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0047
preserved_exact_tokens:
- Test Capture
- contentType
- report attachments
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-086 - Evidence Media Doctor Checks

```yaml
plan_unit_id: N2-086
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Doctor Evidence Media checks validate required layout files, artifact path/hash/MIME integrity, timeline artifact references, renderability for failed runs, fallback link generation, chat-card quality, and emit doctor.evidence_media.checked with PASS/FAIL and remediation.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: evidence_media_doctor_checks
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: evidence_media_doctor_checks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0048
preserved_exact_tokens:
- doctor.evidence_media.checked
- chat_cards
- PASS/FAIL
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-087 - Evidence Media Failure Severity

```yaml
plan_unit_id: N2-087
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Evidence media failures classify missing manifest/timeline as FAIL, missing failed-run media as WARN unless policy requires mandatory video, and hash mismatch or broken paths as FAIL.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: evidence_media_failure_severity
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: evidence_media_failure_severity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0048
preserved_exact_tokens:
- FAIL
- WARN
- Hash mismatch
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-088 - Live Visualization Execution Scope

```yaml
plan_unit_id: N2-088
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Live visualization defines non-headless visual execution for web, desktop, iOS, and Android so users can watch automation in real time while preserving the Section 13 evidence contract.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: live_visualization_execution_scope
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: live_visualization_execution_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0049
preserved_exact_tokens:
- non-headless visual execution
- web
- desktop
- iOS
- Android
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-089 - Live Visualization Unified Orchestrator Flow

```yaml
plan_unit_id: N2-089
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Unified live visualization selects a provider/tool profile, runs preflight, launches a visible target, emits live.session.started, executes scenario actions, captures evidence in parallel, streams progress to chat, finalizes manifest/summary/checks, emits live.session.completed, and renders evidence using Section 13 media rules.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: live_visualization_unified_orchestrator_flow
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: live_visualization_unified_orchestrator_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0050
preserved_exact_tokens:
- live.session.started
- live.session.completed
- web.pm_browser.visible
- desktop.appium.windows
- ios.appium.xcuitest.simulator
- android.appium.uiautomator2.emulator
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md'
```

### N2-090 - Visible Web Browser Product Boundary

```yaml
plan_unit_id: N2-090
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Web live visualization uses only Browser Program or policy-gated Expert Browser Program over BrowserRuntimeService. BrowserWorkspace, BrowserPage, PageGeneration, BrowserAction, and Test Capture are PM-owned contracts; external Project artifacts may be ingested only with explicit attribution and confer no browser authority.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: visible_web_browser_product_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: visible_web_browser_product_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0050
preserved_exact_tokens:
- BrowserRuntimeService
- Browser Program
- Expert Browser Program
- BrowserWorkspace
- BrowserPage
- PageGeneration
- BrowserAction
- Test Capture
negative_constraints:
- Do not implement, expose, label, or imply a PM Playwright runtime, facade, compatibility layer, browser backend, attach bridge, package, port, MCP route, command, Doctor or Settings capability, or capture engine.
- Do not treat a user Project's independently managed Playwright suite, run only as a generic external Project command/process, as a PM browser path or ingest its Test Capture/artifact refs without explicit external-Project attribution.
- Do not grant a generic external Project command/process BrowserWorkspace, BrowserPage, BrowserControllerLease, AuthBrowserSession, profile, credential, or internal transport authority through artifact ingestion.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-091 - Native And Mobile Visible Providers

```yaml
plan_unit_id: N2-091
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Desktop automation uses Appium Windows Driver or mac2; iOS supports Xcode previews and Appium XCUITest simulator sessions; Android launches a deterministic emulator/AVD and runs UiAutomator2, with optional direct emulator lifecycle via Android emulator CLI.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: native_mobile_visible_providers
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: native_mobile_visible_providers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0050
preserved_exact_tokens:
- Appium Windows Driver
- mac2
- Xcode previews
- XCUITest
- UiAutomator2
- Android emulator CLI
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
```

### N2-092 - Live Visualization Doctor Categories And Common Checks

```yaml
plan_unit_id: N2-092
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Doctor preflight adds doctor.live_visualization and doctor.browser.runtime, and common checks cover Node/npm availability, writable evidence/runtime artifact path, and display availability unless the selected provider supports an alternative.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: live_visualization_doctor_common_checks
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: live_visualization_doctor_common_checks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0051
preserved_exact_tokens:
- doctor.live_visualization
- doctor.browser.runtime
- DISPLAY
- Wayland
- Node/npm
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-093 - PM Browser Runtime Preflight And Packaging Boundary

```yaml
plan_unit_id: N2-093
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: BrowserRuntimeService preflight verifies bundled runtime health/version, startup, editor-tab and detached hosts, packaging/update/install metadata, offline packaging distinction, optional wef/cargo-wef CEF integrity, package-size budget around 1 GB, experimental-status risk capture without user-facing experimental toggles, and target page reachability for Browser Program.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: pm_browser_runtime_packaging_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: pm_browser_runtime_packaging_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0051
preserved_exact_tokens:
- BrowserRuntimeService
- Browser Program
- wef
- cargo-wef
- CEF
- ~1 GB
- /offline
negative_constraints:
- Implementation risk for experimental browser wrappers must not create user-facing experimental runtime toggles.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
```

### N2-094 - Native And Mobile Preflight Dependencies

```yaml
plan_unit_id: N2-094
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Desktop, iOS, and Android preflight checks cover Appium server, WinAppDriver, installed mac2 driver, Xcode CLI tools, simulator runtime, XCUITest driver/WebDriverAgent prerequisites, Xcode previews capability when selected, Android SDK/emulator/adb, requested AVD boot, and UiAutomator2 device visibility.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or live visualization behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: native_mobile_preflight_dependencies
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: native_mobile_preflight_dependencies
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0051
preserved_exact_tokens:
- Appium server
- WinAppDriver
- mac2
- Xcode CLI tools
- WebDriverAgent
- Android SDK
- adb
- AVD
- UiAutomator2
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-095 - Preflight Failure Payload And Runtime Capability Mapping

```yaml
plan_unit_id: N2-095
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Preflight failures emit code, severity, dependency, expected, observed, and remediation fields; PM browser runtime failures map to runtime_unavailable in requested/effective browser capability disclosure when a PM browser session is involved.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: preflight_failure_payload_runtime_mapping
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: preflight_failure_payload_runtime_mapping
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0051
preserved_exact_tokens:
- code
- severity
- dependency
- expected
- observed
- remediation
- runtime_unavailable
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
```

### N2-096 - Visual Mode Fallback Policy

```yaml
plan_unit_id: N2-096
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'Lines 790-800 define visual_mode policy: local default auto prefers visible mode with interactive desktop and falls back to headless on missing visible dependencies; CI defaults to headless; forced_visible fails fast on missing prerequisites; forced_headless skips visible launch steps. Lines 801-817 of newtools-S0052 are covered by N2-097 and N2-098 after Phase 2B batch 106.'
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: visual_mode_fallback_policy
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: visual_mode_fallback_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0052
preserved_exact_tokens:
- visual_mode = auto
- visual_mode = headless
- visual_mode = forced_visible
- visual_mode = forced_headless
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- newtools-S0052 is split across N2-096, N2-097, and N2-098 after Phase 2B batch 106.
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-097 - Browser-Capable Visible Run Contract

```yaml
plan_unit_id: N2-097
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Browser-capable web runs use Browser Program as the PM-native visible path. Missing BrowserRuntimeService prerequisites surface as runtime_unavailable; forced_visible fails fast rather than silently swapping to another browser product model; Browser Program headless operation remains valid for CI or explicitly headless flows but does not redefine the visible browser UX contract.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_visible_run_contract
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: browser_visible_run_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0052
preserved_exact_tokens:
- Browser Program
- BrowserRuntimeService
- runtime_unavailable
- forced_visible
- headless fallback
- visible browser UX contract
negative_constraints:
- forced_visible mode must fail fast rather than silently swapping to a different browser product model.
- Headless fallback must not redefine the visible browser UX contract.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Permissions_System.md'
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
```

### N2-098 - Visual Mode Run Metadata

```yaml
plan_unit_id: N2-098
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Runs record requested_visual_mode, effective_visual_mode, and nullable fallback_reason so visual/headless behavior is auditable across auto, forced_visible, and forced_headless modes.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: visual_mode_run_metadata
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: visual_mode_run_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0052
preserved_exact_tokens:
- requested_visual_mode
- auto|forced_visible|forced_headless
- effective_visual_mode
- visible|headless
- fallback_reason
- missing_display
- runtime_unavailable
- simulator_unavailable
- emulator_boot_timeout
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md'
```

### N2-099 - Live Visualization Config Fields

```yaml
plan_unit_id: N2-099
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'Implementation MUST include InterviewGuiConfig and InterviewOrchestratorConfig fields live_visualization_enabled: bool, visual_mode: "auto" | "forced_visible" | "forced_headless", and visual_targets: { web?: bool, desktop?: bool, ios?: "preview"|"simulator"|"both", android?: bool }.'
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: live_visualization_config_fields
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: live_visualization_config_fields
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0053
preserved_exact_tokens:
- Implementation MUST include
- InterviewGuiConfig
- InterviewOrchestratorConfig
- 'live_visualization_enabled: bool'
- 'visual_mode: "auto" | "forced_visible" | "forced_headless"'
- 'visual_targets: { web?: bool, desktop?: bool, ios?: "preview"|"simulator"|"both", android?: bool }'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#config-wiring, ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md'
```

### N2-100 - GuiToolCatalog Capability Flags

```yaml
plan_unit_id: N2-100
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: GuiToolCatalog entries expose capability flags supports_visible_run, supports_attach_existing, supports_recording, requires_display_server, supports_pm_built_in_browser_visible, and supports_pm_browser_focus_or_reopen.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: gui_tool_catalog_capability_flags
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: gui_tool_catalog_capability_flags
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0053
preserved_exact_tokens:
- GuiToolCatalog
- supports_visible_run
- supports_attach_existing
- supports_recording
- requires_display_server
- supports_pm_built_in_browser_visible
- supports_pm_browser_focus_or_reopen
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
```

### N2-101 - Additive Visual Test Strategy Schema

```yaml
plan_unit_id: N2-101
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The additive test strategy schema extension includes test_type values visual_web, visual_desktop, visual_ios, and visual_android, plus optional visual_launch_command, attach_command, and evidence_capture_mode fields.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: visual_test_strategy_schema
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: visual_test_strategy_schema
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0053
preserved_exact_tokens:
- test_type
- visual_web
- visual_desktop
- visual_ios
- visual_android
- visual_launch_command
- attach_command
- evidence_capture_mode
negative_constraints: []
compatibility_only_notes:
- The schema extension is additive.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: SchemaID:pm.test_strategy.schema.v1, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md'
```

### N2-102 - Live Visualization Seglog Events

```yaml
plan_unit_id: N2-102
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Live visualization emits live.session.started, live.step.updated, live.artifact.created, live.session.completed, and live.session.degraded events; visible Browser Program targets additionally carry browser_session_id? and session_class? when available.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: live_visualization_seglog_events
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: live_visualization_seglog_events
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0053
preserved_exact_tokens:
- live.session.started
- live.step.updated
- live.artifact.created
- live.session.completed
- live.session.degraded
- browser_session_id?
- session_class?
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
```

### N2-103 - Live Visualization Doctor Checks

```yaml
plan_unit_id: N2-103
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Doctor coverage for live visualization preserves doctor.live_visualization, doctor.live_visualization.evidence, and doctor.browser.runtime checks.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: live_visualization_doctor_checks
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: live_visualization_doctor_checks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0053
preserved_exact_tokens:
- doctor.live_visualization
- doctor.live_visualization.evidence
- doctor.browser.runtime
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
```

### N2-104 - Chat Renderer Live Run Contract

```yaml
plan_unit_id: N2-104
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The chat renderer keeps live_run_card as the live status card type; PM browser open/focus actions resolve through browser_session_id when present rather than raw path guessing; artifact links resolve through manifest IDs only.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: chat_renderer_live_run_contract
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: chat_renderer_live_run_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0053
preserved_exact_tokens:
- live_run_card
- browser_session_id
- raw path guessing
- manifest IDs only
negative_constraints:
- Open/focus actions for PM browser runs resolve through browser_session_id when present rather than raw path guessing.
- Artifact links resolve through manifest IDs only.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md'
```

### N2-105 - Mobile Testing Stack Defaults Scope

```yaml
plan_unit_id: N2-105
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The Mobile Testing Stacks section adds concrete command-level defaults for iOS, Android, and Expo/React Native testing and preview workflows.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mobile_testing_stack_defaults_scope
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mobile_testing_stack_defaults_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0054
preserved_exact_tokens:
- 14.5 Mobile Testing Stacks
- research-mobile-testing-stacks
- iOS
- Android
- Expo/React Native
- testing and preview workflows
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-106 - Mobile Testing Comparison Matrix

```yaml
plan_unit_id: N2-106
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'The comparison matrix preserves Swift/iOS XCTest, XCUITest, SwiftUI #Preview, @Previewable, Xcode Canvas, and iOS Simulator; Kotlin/Android Jetpack Compose testing, createComposeRule, Espresso, UIAutomator, Appium UiAutomator2, Android Emulator, and ADB; and Expo/React Native Jest/unit, Detox default, Maestro/Appium fallbacks, Expo CLI, Detox artifacts, screenshots, video, and logs.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mobile_testing_comparison_matrix
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mobile_testing_comparison_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0055
preserved_exact_tokens:
- XCTest
- XCUITest
- '#Preview'
- '@Previewable'
- Xcode Canvas
- iOS Simulator
- Jetpack Compose testing
- createComposeRule
- Espresso
- UIAutomator
- Appium UiAutomator2
- Expo / React Native
- Detox
- Maestro
- Appium
- Detox artifacts plugin
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-107 - Mobile Stack Default And Fallback Paths

```yaml
plan_unit_id: N2-107
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Recommended mobile paths are SwiftUI previews plus XCTest/XCUITest on iOS Simulator with Appium XCUITest fallback; Compose UI tests plus Espresso and UIAutomator with Appium UiAutomator2 fallback; and Expo CLI plus Detox with Maestro/Appium fallbacks for Expo/React Native.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mobile_stack_default_fallback_paths
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mobile_stack_default_fallback_paths
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0056
preserved_exact_tokens:
- SwiftUI previews
- '#Preview'
- '@Previewable'
- XCTest/XCUITest
- Appium XCUITest driver
- Compose UI tests
- Espresso
- UIAutomator
- Appium UiAutomator2
- Expo CLI
- Detox
- Maestro
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-108 - Swift IOS Generated Plan Snippets

```yaml
plan_unit_id: N2-108
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'Generated Swift/iOS plans preserve the manual Xcode preview loop using #Preview and @Previewable, xcodebuild test with -scheme MyApp and -destination platform=iOS Simulator,name=iPhone 16, and simulator screenshot capture to .puppet-master/evidence/ios/sim.png.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: swift_ios_generated_plan_snippets
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: swift_ios_generated_plan_snippets
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0058
preserved_exact_tokens:
- '#Preview'
- '@Previewable'
- xcodebuild test
- -scheme MyApp
- -destination 'platform=iOS Simulator,name=iPhone 16'
- xcrun simctl io booted screenshot .puppet-master/evidence/ios/sim.png
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-109 - Kotlin Android Generated Plan Snippets

```yaml
plan_unit_id: N2-109
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Generated Kotlin/Android plans preserve ./gradlew testDebugUnitTest, ./gradlew connectedDebugAndroidTest, adb exec-out screencap -p, adb shell screenrecord /sdcard/test.mp4, and adb pull /sdcard/test.mp4 .puppet-master/evidence/android/test.mp4.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: kotlin_android_generated_plan_snippets
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: kotlin_android_generated_plan_snippets
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0059
preserved_exact_tokens:
- ./gradlew testDebugUnitTest
- ./gradlew connectedDebugAndroidTest
- adb exec-out screencap -p
- .puppet-master/evidence/android/screen.png
- adb shell screenrecord /sdcard/test.mp4
- adb pull /sdcard/test.mp4 .puppet-master/evidence/android/test.mp4
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-110 - Expo React Native Generated Plan Commands

```yaml
plan_unit_id: N2-110
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Generated Expo/React Native plans preserve npx expo start with i/a simulator shortcuts, npx expo run:ios, npx expo run:android, detox test -c ios.sim.debug, and detox test -c android.emu.debug.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: expo_react_native_generated_plan_commands
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: expo_react_native_generated_plan_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0060
preserved_exact_tokens:
- npx expo start
- press i
- a (Android emulator)
- npx expo run:ios
- npx expo run:android
- detox test -c ios.sim.debug
- detox test -c android.emu.debug
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-111 - Detox Artifact Config Baseline

```yaml
plan_unit_id: N2-111
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The Detox artifact baseline preserves detox.config.js with artifacts.rootDir .puppet-master/evidence/detox and enabled screenshot, video, and log plugins, including shouldTakeAutomaticSnapshots.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: detox_artifact_config_baseline
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: detox_artifact_config_baseline
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0060
preserved_exact_tokens:
- detox.config.js
- rootDir
- .puppet-master/evidence/detox
- screenshot
- shouldTakeAutomaticSnapshots
- video
- log
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-112 - Fallback E2E Snippets

```yaml
plan_unit_id: N2-112
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Fallback E2E snippets preserve maestro test flows/smoke.yaml and Appium driver-managed screenshots/recordings through session APIs or executeScript mobile commands in the test runtime.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: fallback_e2e_snippets
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: fallback_e2e_snippets
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0061
preserved_exact_tokens:
- maestro test flows/smoke.yaml
- Appium
- session APIs
- executeScript
- mobile commands
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-113 - Preview Build Docker Actions Scope

```yaml
plan_unit_id: N2-113
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Preview, Build, Docker, and Actions contracts define deterministic Slint-rebuild behavior for Preview/Build actions and their Docker/GitHub Actions integrations.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: preview_build_docker_actions_scope
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: preview_build_docker_actions_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0062
preserved_exact_tokens:
- 14.6 Preview, Build, Docker, and Actions Contracts
- Slint-rebuild
- Preview/Build actions
- Docker/GitHub Actions integrations
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md#7.2, ContractName:Plans/Project_Output_Artifacts.md'
```

### N2-114 - Preview UX And Session Behavior

```yaml
plan_unit_id: N2-114
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Preview controls require Dashboard Orchestrator Status to include PREVIEW and Orchestrator Progress widget.orchestrator_status to include Preview. Preview resolves from selected stack and visual_targets, launches one preview_session_id per action, emits manifest.json, timeline.jsonl, screenshots/video when available, and shows inline chat evidence or a deterministic clickable artifact fallback.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: preview_ux_session_behavior
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: preview_ux_session_behavior
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0063
preserved_exact_tokens:
- PREVIEW
- widget.orchestrator_status
- Preview
- visual_targets
- preview_session_id
- manifest.json
- timeline.jsonl
- screenshot/video
- clickable artifact path
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: UICommand:cmd.orchestrator.preview_open, UICommand:cmd.orchestrator.preview_stop, UICommand:cmd.orchestrator.open_preview_artifact, SchemaID:evidence.schema.json'
```

### N2-115 - Preview UI Command IDs

```yaml
plan_unit_id: N2-115
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Reserved canonical preview UI command IDs are cmd.orchestrator.preview_open, cmd.orchestrator.preview_stop, and cmd.orchestrator.open_preview_artifact.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: preview_ui_command_ids
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: preview_ui_command_ids
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0063
preserved_exact_tokens:
- cmd.orchestrator.preview_open
- cmd.orchestrator.preview_stop
- cmd.orchestrator.open_preview_artifact
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- These command IDs are canonical and reserved.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: UICommand:cmd.orchestrator.preview_open, UICommand:cmd.orchestrator.preview_stop, UICommand:cmd.orchestrator.open_preview_artifact, SchemaID:evidence.schema.json'
```

### N2-116 - Build Controls And Artifact UI

```yaml
plan_unit_id: N2-116
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Build controls require Dashboard Orchestrator Status to include BUILD and Orchestrator Progress widget.orchestrator_status to include Build. Build action resolves native, web, mobile, or container profile from project stack and settings; GUI shows latest artifact list with open path / copy path action; chat shows a concise build summary plus artifact links.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: build_controls_artifact_ui
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: build_controls_artifact_ui
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0064
preserved_exact_tokens:
- BUILD
- widget.orchestrator_status
- Build
- native
- web
- mobile
- container
- open path / copy path
- artifact links
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: UICommand:cmd.orchestrator.build_run, UICommand:cmd.orchestrator.open_build_artifact, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/UI_Command_Catalog.md'
```

### N2-117 - Build Result Payload Minima

```yaml
plan_unit_id: N2-117
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Build runs produce a normalized build_result payload containing build_id, build_profile, status, artifacts[] with path, kind, sha256, and size_bytes, plus logs_path.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: build_result_payload_minima
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: build_result_payload_minima
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0064
preserved_exact_tokens:
- build_result
- build_id
- build_profile
- status
- artifacts[]
- path
- kind
- sha256
- size_bytes
- logs_path
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: UICommand:cmd.orchestrator.build_run, UICommand:cmd.orchestrator.open_build_artifact, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/UI_Command_Catalog.md'
```

### N2-118 - Build Output Examples And Commands

```yaml
plan_unit_id: N2-118
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Build output examples and commands preserve Linux installer outputs under installer/linux/, multi-platform installer helper concrete path reporting, and reserved canonical command IDs cmd.orchestrator.build_run and cmd.orchestrator.open_build_artifact.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: build_output_examples_commands
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: build_output_examples_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0064
preserved_exact_tokens:
- installer/linux/
- Multi-platform installer helper
- cmd.orchestrator.build_run
- cmd.orchestrator.open_build_artifact
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: UICommand:cmd.orchestrator.build_run, UICommand:cmd.orchestrator.open_build_artifact, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/UI_Command_Catalog.md'
```

### N2-119 - Docker Manager Runtime Auth Surface

```yaml
plan_unit_id: N2-119
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Docker support is expressed through the Docker Manager surface covering containers, images, compose, registries, build/bake, Publish / Unraid, and project-focused Kubernetes. Docker is the default runtime mode and Podman is an alternate runtime mode inside the same surface; requested vs effective auth capability disclosure, protected missing-repository creation, and publish-side-effect separation remain required.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_manager_runtime_auth_surface
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: docker_manager_runtime_auth_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0065
preserved_exact_tokens:
- Docker Manager
- containers
- images
- compose
- registries
- build/bake
- Publish / Unraid
- project-focused Kubernetes
- Docker as default runtime mode
- Podman as alternate runtime mode
- requested vs effective auth capability disclosure
- protected missing-repository creation
- publish-side-effect separation
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Containers_Registry_and_Unraid.md owns the Preflight and approval ordering contract, Kubernetes enablement rules, Kubernetes doctor checks, Future-scope placeholders, project-focused K8s deep linkage, and the Event registration contract.
- Plans/Contracts_V0.md remains the registration authority for Docker/Unraid events and Kubernetes event names.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md'
```

### N2-120 - Docker Doctor Preflight And Deprecated Alias

```yaml
plan_unit_id: N2-120
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Docker doctor/preflight rules preserve doctor.docker.engine, doctor.docker.compose, doctor.docker.buildx, doctor.dockerhub.auth.capability, doctor.dockerhub.repo.access, and Kubernetes-specific runtime checks when Kubernetes subview actions are invoked. doctor.registry.auth is a deprecated alias for DockerHub-specific flows and MUST NOT remain the visible canonical term in surface docs.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_doctor_preflight_deprecated_alias
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: docker_doctor_preflight_deprecated_alias
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0065
preserved_exact_tokens:
- doctor.docker.engine
- doctor.docker.compose
- doctor.docker.buildx
- doctor.dockerhub.auth.capability
- doctor.dockerhub.repo.access
- Kubernetes-specific runtime checks
- doctor.registry.auth
- deprecated alias
- MUST NOT remain the visible canonical term
negative_constraints:
- doctor.registry.auth is a deprecated alias for DockerHub-specific flows and MUST NOT remain the visible canonical term in surface docs.
compatibility_only_notes: []
stale_retired_dispositions:
- doctor.registry.auth is deprecated for DockerHub-specific flows.
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/storage-plan.md'
```

### N2-121 - Docker Result Payload Minima

```yaml
plan_unit_id: N2-121
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'Docker result payload minima remain authoritative and must be reused by other docs: docker_auth_result, docker_publish_result, and unraid_template_result.'
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_result_payload_minima
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: docker_result_payload_minima
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0065
preserved_exact_tokens:
- docker_auth_result
- docker_publish_result
- unraid_template_result
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Result payload minima remain authoritative here and must be reused by other docs.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
```

### N2-122 - GitHub Actions Settings Controls

```yaml
plan_unit_id: N2-122
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Settings > Advanced coverage for GitHub Actions includes workflow template selection, trigger and matrix controls, required-secrets readiness checklist, and preview/apply generation flow.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_actions_settings_controls
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: github_actions_settings_controls
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0066
preserved_exact_tokens:
- Settings > Advanced
- workflow template selection
- trigger and matrix controls
- required-secrets readiness checklist
- preview/apply generation flow
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/FinalGUISpec.md'
```

### N2-123 - GitHub Actions Surface Readiness Alignment

```yaml
plan_unit_id: N2-123
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Generated workflows are visible from the Workflows subview; current-branch run behavior and workflow dispatch use the same repository and branch context; admin readiness for secrets, variables, and environments reuses the live GitHub Actions Settings capability/auth model; doctor.actions.workflow-ready remains the canonical readiness gate.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_actions_surface_readiness_alignment
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: github_actions_surface_readiness_alignment
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0066
preserved_exact_tokens:
- Workflows
- current-branch
- workflow dispatch
- same repository and branch context
- secrets
- variables
- environments
- doctor.actions.workflow-ready
- canonical readiness gate
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/FinalGUISpec.md'
```

### N2-124 - GitHub Workflow Source Truth And Receipts

```yaml
plan_unit_id: N2-124
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Repository workflow files under .github/workflows/ / github/workflows/ are the runtime source of truth after preview /save or apply; generated-workflow and generated required-secrets /configuration lists are historical hints and must not override current repo /worktree workflow YAML, hosted /variables/environments, or GitHub Actions > Current Branch context. Repo-level Actions /admin operations create project-scoped /receipt records and may /link a run_id through github_api evidence but never store secret values or reversible value-derived material.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: github_workflow_source_truth_receipts
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: github_workflow_source_truth_receipts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0066
preserved_exact_tokens:
- .github/workflows/
- github/workflows/
- /save
- generated-workflow
- /configuration
- /worktree
- YAML
- /variables/environments
- GitHub Actions > Current Branch
- /admin
- /receipt
- /link
- run_id
- github_api
- secret values
- value-derived
negative_constraints:
- generated-workflow and generated required-secrets /configuration lists must not override current repo /worktree workflow YAML, hosted /variables/environments, or GitHub Actions > Current Branch context.
- Receipts never store secret values or reversible value-derived material.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/FinalGUISpec.md'
```

### N2-125 - Iced To Slint Automation Migration Boundary

```yaml
plan_unit_id: N2-125
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The existing Iced automation implementation remains a reference pattern while rewrite deliverables target Slint runtime semantics. Migration preserves manifest/timeline/media evidence schema compatibility, introduces backend abstraction for Slint UI surfaces, supports both headless and visible modes, and preserves doctor/preflight checks for automation dependencies and media capture capability.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: iced_slint_automation_migration_boundary
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: iced_slint_automation_migration_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0067
preserved_exact_tokens:
- Iced automation implementation
- reference pattern
- Slint runtime semantics
- manifest/timeline/media
- backend abstraction
- headless
- visible
- doctor/preflight
negative_constraints: []
compatibility_only_notes:
- Keep evidence schema compatibility (manifest/timeline/media) across automation backends.
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/FinalGUISpec.md#2, ContractName:Plans/Contracts_V0.md#EventRecord, SchemaID:evidence.schema.json'
```

### N2-126 - Core Preview Build Docker Actions Doctor Matrix

```yaml
plan_unit_id: N2-126
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The Doctor/preflight matrix preserves deterministic readiness checks before Preview/Build/Docker/Actions flows execute, including doctor.preview.visual-runtime, doctor.mobile.ios-simulator, doctor.mobile.android-emulator, doctor.docker.engine, doctor.docker.compose, doctor.dockerhub.auth.capability, doctor.actions.workflow-ready, and doctor.evidence.media with their block, degrade, remediation, and fallback behaviors.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: core_preview_build_docker_actions_doctor_matrix
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: core_preview_build_docker_actions_doctor_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0068
preserved_exact_tokens:
- doctor.preview.visual-runtime
- doctor.mobile.ios-simulator
- doctor.mobile.android-emulator
- doctor.docker.engine
- doctor.docker.compose
- doctor.dockerhub.auth.capability
- doctor.actions.workflow-ready
- doctor.evidence.media
- Block
- Keep run result
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, ContractName:Plans/FinalGUISpec.md#74-settings-unified, ContractName:Plans/newtools.md#13-evidence-in-chat-contract-and-flow-research-evidence-media-chat, SchemaID:evidence.schema.json'
```

### N2-127 - Browser And Custom GUI Doctor Matrix

```yaml
plan_unit_id: N2-127
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Browser and custom GUI Doctor checks preserve doctor.browser.runtime for PM-managed bundled CEF-class runtime health, wef/cargo-wef CEF cache integrity, runtime_unavailable failure behavior, doctor.gui.custom-headless for plan_custom_headless_tool = true evidence layout, and doctor.gui_tool_catalog.freshness last_updated metadata warnings.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: browser_custom_gui_doctor_matrix
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: browser_custom_gui_doctor_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0068
preserved_exact_tokens:
- doctor.browser.runtime
- PM-managed bundled CEF-class runtime
- wef
- cargo-wef
- runtime_unavailable
- doctor.gui.custom-headless
- plan_custom_headless_tool = true
- doctor.gui_tool_catalog.freshness
- last_updated
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions:
- doctor.gui_tool_catalog.freshness warns when catalog metadata may be stale.
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, ContractName:Plans/FinalGUISpec.md#74-settings-unified, ContractName:Plans/newtools.md#13-evidence-in-chat-contract-and-flow-research-evidence-media-chat, SchemaID:evidence.schema.json'
```

### N2-128 - MCP And Cited Websearch Doctor Matrix

```yaml
plan_unit_id: N2-128
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: MCP and cited websearch Doctor checks preserve doctor.mcp.context7, doctor.mcp.provider-ready, doctor.websearch.cited, and websearch_cited dry-run/provider health behavior; missing tools are not silently advertised and unavailable cited search surfaces explicit config, auth, or timeout reasons.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_cited_websearch_doctor_matrix
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: mcp_cited_websearch_doctor_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0068
preserved_exact_tokens:
- doctor.mcp.context7
- doctor.mcp.provider-ready
- doctor.websearch.cited
- websearch_cited
- configured provider order
- do not silently advertise missing tools
negative_constraints:
- MCP-backed tools must not be silently advertised when missing.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md#72-manual-prune-clean-workspace-action, ContractName:Plans/FinalGUISpec.md#74-settings-unified, ContractName:Plans/newtools.md#13-evidence-in-chat-contract-and-flow-research-evidence-media-chat, SchemaID:evidence.schema.json'
```

### N2-129 - Debug Target Classification And Routing

```yaml
plan_unit_id: N2-129
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Debug Mode classifies targets as workspace-built /workspace, browser/website, or black-box binary/app before choosing tooling. The Debug target registry records launch config, URL, attach PID, browser session, or imported evidence bundle and routes each target to the collector through log sink, built-in browser session plus agent tools, DAP adapter, or manual attach intake.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_target_classification_routing
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: debug_target_classification_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0069
preserved_exact_tokens:
- Debug Mode
- /workspace
- browser/website
- black-box binary/app
- Debug target registry
- launch config
- URL
- attach PID
- browser session
- imported evidence bundle
- collector
- DAP adapter
- manual attach intake
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-130 - Grounded PM Debug Core And Web Repro Path

```yaml
plan_unit_id: N2-130
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'The grounded PM Debug core is H + I + J + E + A: PM points at a target, stays inside the overlay/runtime architecture rather than creating a new runtime mode, sends evidence through runtime-artifact and seglog pipelines, supports assistant/session inspection, and allows MVP temporary instrumentation only under an explicit instrumentation contract. MVP web/debug repro uses Browser Program with dev_session_id and output-problems-ports linkage, including /test/dev-server loops; classical DAP remains a separate adapter/surface.'
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: grounded_pm_debug_core_web_repro
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: grounded_pm_debug_core_web_repro
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0069
preserved_exact_tokens:
- H + I + J + E + A
- overlay/runtime architecture
- new runtime mode
- runtime-artifact
- seglog
- temporary instrumentation
- Browser Program
- dev_session_id
- output-problems-ports
- /test/dev-server
- Classical DAP
negative_constraints:
- Debug Mode must stay inside the overlay/runtime architecture instead of creating a new runtime mode.
- Classical DAP debugging remains a separate related adapter/surface rather than the primary web repro mode.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-131 - Debug Adapters Auth Session And Evidence Attach Constraints

```yaml
plan_unit_id: N2-131
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Research-grade non-browser adapters remain advanced options behind target-registry and policy checks. Browser Program uses an isolated ephemeral BrowserWorkspace; when authentication requires protected interaction, Debug moves to attention_required and hands control to a human-only protected AuthBrowserSession. Protected content and state never enter agent/tool/recorder/PageRepresentation/screenshot/console/network capture, and tool-emitted debug evidence enters chat only through bounded user-visible attach rules.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_adapters_auth_evidence_attach_constraints
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: debug_adapters_auth_evidence_attach_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0069
preserved_exact_tokens:
- Research-grade adapters
- advanced options
- BrowserWorkspace
- AuthBrowserSession
- attention_required
- human-only
- protected session
- zero capture
- bounded, user-visible attach model
negative_constraints:
- If a target requires authentication and no valid automation session exists, Debug moves to attention_required rather than silently reusing an unrelated user profile.
- PM browser automation must not acquire a backend, attach bridge, MCP route, or compatibility surface.
- Protected AuthBrowserSession content, state, and controls must not be exposed to an agent, tool, recorder, PageRepresentation reader, screenshotter, console reader, or network observer.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-132 - Enterprise Host Trust Preflight

```yaml
plan_unit_id: N2-132
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Debug, MCP, custom-plugin, networked-tool, /shell/debugger, and /tunnel/browser actions run through shared /trust/proxy/governance preflight. Every /custom/plugin/networked tool profile declares contacted hosts and /domains before dispatch; undeclared hosts, domains, proxy targets, or remote authorities return blocked_preflight. Governance denials preserve deny-code families, and restart-persistent host/trust decisions must be explicit /durable permission or trust records rather than inferred from transient debug runs.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: enterprise_host_trust_preflight
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: enterprise_host_trust_preflight
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0070
preserved_exact_tokens:
- /trust/proxy/governance
- /shell/debugger
- /tunnel/browser
- /custom/plugin/networked
- /domains
- blocked_preflight
- deny-code
- /durable
negative_constraints:
- Undeclared host, domain, proxy target, or remote authority expansion returns blocked_preflight rather than silently broadening session permission.
- Host/trust decisions that survive restart must be explicit /durable permission or trust records, not inferred from transient debug runs.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-133 - Debug Instrumentation Scope Taxonomy

```yaml
plan_unit_id: N2-133
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The Debug automation profile classifies temporary instrumentation scope exactly as env_config_activation, ephemeral_tool_install, wrapper_launcher, temporary_source_patch, and debugger_or_profiler_attach. Each scope records temporary/durable status, cleanup path, sensitive-runtime impact, and cleanup-failure recovery; wrapper_launcher and debugger_or_profiler_attach are stricter than read-only inspection, temporary_source_patch requires a revert path, and ephemeral_tool_install requires install location, provenance, and cleanup path before dispatch.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_instrumentation_scope_taxonomy
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: debug_instrumentation_scope_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0071
preserved_exact_tokens:
- env_config_activation
- ephemeral_tool_install
- wrapper_launcher
- temporary_source_patch
- debugger_or_profiler_attach
- cleanup path
- sensitive-runtime impact
- revert path
- install location
- provenance
negative_constraints:
- temporary_source_patch requires a revert path before execution.
- ephemeral_tool_install requires an install location, provenance, and cleanup path before dispatch.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/GitHub_Integration.md'
```

### N2-134 - Debug Discovery Outputs

```yaml
plan_unit_id: N2-134
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Required Debug discovery outputs include preferred local or remote dev/test runner, browser automation stack and visibility mode support, structured log and trace collectors, source-map or symbolization support, DAP adapter availability, temporary instrumentation install/rollback path, and target discovery/environment preparation capability for dev session, browser session, debugger attach, imported bundle intake, and policy-selected tracing/debug tooling.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_discovery_outputs
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: debug_discovery_outputs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0071
preserved_exact_tokens:
- preferred local or remote dev/test runner
- browser automation stack and visibility mode support
- structured log and trace collectors
- source-map or symbolization support
- DAP adapter availability
- temporary instrumentation install / rollback path
- target discovery / environment preparation capability
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/GitHub_Integration.md'
```

### N2-135 - Debug Selection And Cleanup Escalation Order

```yaml
plan_unit_id: N2-135
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Debug selection order uses project-native or repo-declared tooling first, already-installed environment tooling second, temporary investigation-scoped tooling /install only when cleanup path and policy allow it, and imported evidence bundles/manual attach as fallback inputs. Escalation proceeds through non-invasive capture, permitted non-invasive tracers or debugger attachments, temporary instrumentation patches only after lower tiers are insufficient, tentative durable fix, automated verification, instrumentation removal, and cleanup-recovery before any new mutation-capable loop starts.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_selection_cleanup_escalation_order
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: debug_selection_cleanup_escalation_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0071
preserved_exact_tokens:
- project-native or repo-declared tooling first
- already-installed environment tooling second
- temporary, investigation-scoped tooling /install
- cleanup path
- imported evidence bundles
- manual attach
- non-invasive readback/capture
- temporary instrumentation patches
- cleanup-recovery
- mutation-capable loop
negative_constraints:
- Temporary investigation-scoped tooling /install is allowed only when a cleanup path exists and policy allows it.
- Unresolved cleanup enters explicit cleanup-recovery before any new mutation-capable loop starts.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/MiscPlan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md'
```

### N2-136 - Debug Mode Doctor Checks

```yaml
plan_unit_id: N2-136
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Debug Mode doctor checks preserve doctor.debug.browser-runtime, doctor.debug.dap-adapter, doctor.debug.log-trace-pipeline, doctor.debug.instrumentation-scope, and doctor.debug.remote-host with their hide, degrade, block, fallback, and remediation behaviors.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: debug_mode_doctor_checks
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: debug_mode_doctor_checks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0071
preserved_exact_tokens:
- doctor.debug.browser-runtime
- doctor.debug.dap-adapter
- doctor.debug.log-trace-pipeline
- doctor.debug.instrumentation-scope
- doctor.debug.remote-host
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md'
```

### N2-137 - Docker Unraid Side-Effect Gate Matrix

```yaml
plan_unit_id: N2-137
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'The Docker/Unraid validation matrix gates side effects by action scope: Docker engine, compose, buildx, and DockerHub auth block local Docker build/publish entry points when failing; dockerhub repo access blocks remote image push; Unraid template-repo and ca-profile checks block only managed template-repo follow-on stages or auto-push while preserving local Docker image push results and visible remediation.'
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_unraid_side_effect_gate_matrix
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: docker_unraid_side_effect_gate_matrix
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0074
preserved_exact_tokens:
- doctor.docker.engine
- doctor.docker.compose
- doctor.docker.buildx
- doctor.dockerhub.auth.capability
- doctor.dockerhub.repo.access
- doctor.unraid.template-repo
- doctor.unraid.ca-profile
- needs_review
- local Docker image push
- auto-push
- visible remediation
negative_constraints:
- doctor.unraid.template-repo does not block local Docker image push.
- doctor.unraid.ca-profile in needs_review state does not block local Docker image push.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-138 - After-Build Push And Blocked Outcome Semantics

```yaml
plan_unit_id: N2-138
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: push_policy = after_build dispatches cmd.orchestrator.push_image as a separate remote side-effect step only after a successful local build result exists. Permission-guard or confirmation blocks resolve to *.blocked outcomes rather than *.failed so intentional non-execution remains distinct from runtime failure.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: after_build_push_blocked_outcome_semantics
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: after_build_push_blocked_outcome_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0074
preserved_exact_tokens:
- push_policy = after_build
- cmd.orchestrator.push_image
- separate remote side-effect step
- successful local build result
- '*.blocked'
- '*.failed'
negative_constraints:
- Permission-guard or confirmation blocks MUST resolve to *.blocked outcomes, not *.failed.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-139 - DockerHub Auth Mode Resolution

```yaml
plan_unit_id: N2-139
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Where section 14.7 reads like a PAT-only contract, requested_auth_mode supports at least browser and pat. Validation MUST resolve requested auth into effective_auth_provider_state, effective_capabilities[], validated account identity, and degraded reason when capability is partial.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dockerhub_auth_mode_resolution
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: dockerhub_auth_mode_resolution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0075
preserved_exact_tokens:
- requested_auth_mode
- browser
- pat
- Validation MUST resolve
- effective_auth_provider_state
- effective_capabilities[]
- validated account identity
- degraded reason
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-140 - Effective Capability Repository Creation Guard

```yaml
plan_unit_id: N2-140
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Namespace/repository discovery and repository creation MUST use the validated effective capability set; the app MUST NOT assume browser login or PAT implies full management access. If publish is requested and the target repository does not exist, repository creation is guarded by an explicit confirmation showing namespace, repository, and privacy; this confirmation is mandatory and cannot be bypassed by YOLO/autonomy behavior.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: effective_capability_repository_creation_guard
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: effective_capability_repository_creation_guard
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0075
preserved_exact_tokens:
- Namespace/repository discovery
- repository creation
- MUST use the validated effective capability set
- MUST NOT assume browser login or PAT implies full management access
- explicit confirmation
- namespace
- repository
- privacy
- mandatory
- YOLO/autonomy behavior
negative_constraints:
- The app MUST NOT assume browser login or PAT implies full management access.
- Repository creation confirmation is mandatory and cannot be bypassed by YOLO/autonomy behavior.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-141 - DockerHub Auth Alias Retirement

```yaml
plan_unit_id: N2-141
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: doctor.registry.auth is deprecated for DockerHub-specific flows and MUST be treated as an alias of doctor.dockerhub.auth.capability only until old references are removed.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dockerhub_auth_alias_retirement
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: dockerhub_auth_alias_retirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0077
preserved_exact_tokens:
- doctor.registry.auth
- deprecated
- doctor.dockerhub.auth.capability
- only until old references are removed
negative_constraints:
- doctor.registry.auth is deprecated for DockerHub-specific flows.
compatibility_only_notes: []
stale_retired_dispositions:
- doctor.registry.auth is deprecated for DockerHub-specific flows and is compatibility-only until old references are removed.
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-142 - Docker Action-Scope Preflight Rules

```yaml
plan_unit_id: N2-142
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Docker action-scope rules keep build-only actions limited to doctor.docker.engine and doctor.docker.buildx unless compose is selected; Run/preview actions require doctor.docker.compose when compose is the selected runtime path and port availability only when a user-facing access URL is expected; Publish requires doctor.dockerhub.auth.capability and doctor.dockerhub.repo.access and must not fail solely because compose validation is irrelevant.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_action_scope_preflight_rules
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: docker_action_scope_preflight_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0077
preserved_exact_tokens:
- Build-only actions
- doctor.docker.engine
- doctor.docker.buildx
- doctor.docker.compose
- Run/preview actions
- user-facing access URL
- Publish
- doctor.dockerhub.auth.capability
- doctor.dockerhub.repo.access
- MUST NOT fail solely because compose validation is irrelevant
negative_constraints:
- Publish MUST NOT fail solely because compose validation is irrelevant to the selected publish path.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-143 - DockerHub Unraid Doctor Table Rows

```yaml
plan_unit_id: N2-143
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Canonical DockerHub/Unraid Doctor rows preserve doctor.docker.buildx, doctor.dockerhub.auth.capability, doctor.dockerhub.repo.access, doctor.unraid.template-repo, and doctor.unraid.ca-profile with their required signals and block/warn/follow-on failure behaviors.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: dockerhub_unraid_doctor_table_rows
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: dockerhub_unraid_doctor_table_rows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0076
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0077
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0078
preserved_exact_tokens:
- doctor.docker.buildx
- doctor.dockerhub.auth.capability
- doctor.dockerhub.repo.access
- doctor.unraid.template-repo
- doctor.unraid.ca-profile
- Block container build/publish
- Block repo browsing/creation/publish
- Block publish; preserve local build result
- Block managed follow-on push/update
- Allow local generation with warning
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- newtools-S0076 is a structural doctor/preflight heading; its concrete doctor rows are represented here.
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-144 - Docker Auth Result Payload Minimum

```yaml
plan_unit_id: N2-144
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: docker_auth_result MUST include requested_auth_mode, effective_auth_provider_state, effective_capabilities[], effective_account_identity, last_validation_timestamp, last_validation_host, and degraded_reason?. Evidence/result contract additions record requested mode, effective capability set, account identity, validation timestamp, and degraded reason if any.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_auth_result_payload_minimum
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: docker_auth_result_payload_minimum
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0075
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0078
preserved_exact_tokens:
- docker_auth_result
- MUST include
- requested_auth_mode
- effective_auth_provider_state
- effective_capabilities[]
- effective_account_identity
- last_validation_timestamp
- last_validation_host
- degraded_reason?
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The payload token is introduced by the normative override and expanded in the Result payload minima section.
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-145 - Docker Publish Result Payload Minimum

```yaml
plan_unit_id: N2-145
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: docker_publish_result MUST include publish_result_id, registry_host, namespace, repository, tags[], digests[], platforms[], and sanitized_logs_path. Evidence/result contract additions record registry host, namespace, repository, pushed tags, digest(s), platform list, and sanitized logs path.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_publish_result_payload_minimum
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: docker_publish_result_payload_minimum
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0075
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0078
preserved_exact_tokens:
- docker_publish_result
- publish_result_id
- registry_host
- namespace
- repository
- tags[]
- digests[]
- platforms[]
- sanitized_logs_path
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The payload token is introduced by the normative override and expanded in the Result payload minima section.
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-146 - Unraid Template Result Payload And Enums

```yaml
plan_unit_id: N2-146
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: unraid_template_result MUST include publish_result_id, template_xml_path, template_repo_id, maintainer_slug, commit_status, push_status, ca_profile_state, and review_state. Its enums preserve commit_status values not_attempted, committed, skipped_review_required, skipped_unrelated_changes, failed; push_status values not_attempted, skipped_auto_push_disabled, push_in_progress, completed, failed; review_state values clean and needs_review; and ca_profile_state values existing_user_managed, auto_generated_needs_review, and project_override_active.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: unraid_template_result_payload_enums
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: unraid_template_result_payload_enums
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0075
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0078
preserved_exact_tokens:
- unraid_template_result
- template_xml_path
- template_repo_id
- maintainer_slug
- commit_status
- push_status
- ca_profile_state
- review_state
- not_attempted
- committed
- skipped_review_required
- skipped_unrelated_changes
- failed
- skipped_auto_push_disabled
- push_in_progress
- completed
- clean
- needs_review
- existing_user_managed
- auto_generated_needs_review
- project_override_active
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- The payload token is introduced by the normative override and expanded in the Result payload minima section.
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-147 - Docker CLI Buildx API Responsibility Split

```yaml
plan_unit_id: N2-147
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: 'DockerHub/Unraid responsibilities are separated: Docker CLI / Buildx performs local runtime, image build, login, and push execution; Docker Hub API is used only for namespace/repository discovery and repository creation when Puppet Master needs app-managed listing/creation behavior; DockerHub is not a storage location for Unraid XML.'
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_cli_buildx_api_responsibility_split
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: docker_cli_buildx_api_responsibility_split
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0078
preserved_exact_tokens:
- Docker CLI / Buildx
- local runtime
- image build
- login
- push execution
- Docker Hub API
- namespace/repository discovery
- repository creation
- Do not treat DockerHub as a storage location for Unraid XML
negative_constraints:
- Do not treat DockerHub as a storage location for Unraid XML.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-148 - Expanded DockerHub Auth Creation Flow

```yaml
plan_unit_id: N2-148
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The expanded DockerHub flow detects whether the active project is Docker-related, resolves requested_auth_mode, validates effective_capabilities, allows browser/device login or PAT-based auth with PAT remaining the recommended explicit path, and gates missing-repository creation behind a mandatory confirmation dialog showing namespace, repository name, and privacy that cannot be bypassed by YOLO/autonomy modes.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: expanded_dockerhub_auth_creation_flow
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: expanded_dockerhub_auth_creation_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0078
preserved_exact_tokens:
- Detect whether the active project is Docker-related
- requested_auth_mode
- effective_capabilities
- browser/device login
- PAT-based auth
- PAT remaining the recommended explicit path
- mandatory confirmation dialog
- namespace
- repository name
- privacy
- YOLO/autonomy modes
negative_constraints:
- Missing-repository creation confirmation cannot be bypassed by YOLO/autonomy modes.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-149 - Buildx Preview Push And Unraid Follow-On Flow

```yaml
plan_unit_id: N2-149
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: The expanded runtime/publish flow builds with docker buildx build, runs containers for preview/testing and surfaces user-facing access points when available, pushes to DockerHub using the selected namespace/repository/tag set, generates or updates Unraid XML by default unless disabled, and for managed template-repo workflows updates the repo, auto-commits by default, exposes a one-click push UI action, and keeps auto-push disabled by default.
gui_related: true
gui_classification_reason: The unit covers GUI/user-visible testing, settings, evidence, or surface behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: buildx_preview_push_unraid_follow_on_flow
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: buildx_preview_push_unraid_follow_on_flow
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0078
preserved_exact_tokens:
- docker buildx build
- preview/testing
- user-facing access points
- Push to DockerHub
- namespace/repository/tag set
- generate/update Unraid XML by default unless the user disabled it
- managed template-repo workflow
- auto-commit by default
- one-click push UI action
- auto-push disabled by default
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/newtools.md
preserved_contractrefs: []
```

### N2-150 - Docker Unraid Evidence ContractRef Overlay

```yaml
plan_unit_id: N2-150
unit_type: requirement
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Docker/Unraid evidence/result contract additions preserve docker_auth_result, docker_publish_result, and unraid_template_result summary semantics and retain the final ContractRef overlay to Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md, Plans/Orchestrator_Page.md, PolicyRule:no_secrets_in_storage, and SchemaID:evidence.schema.json.
gui_related: false
gui_classification_reason: The unit covers backend, policy, schema, compatibility, or owner-boundary behavior rather than GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Covered source spans remain losslessly available for exact-text audit.
- The covered requirement remains represented by a fine-grained PlanUnit instead of the residual source-preserving bridge.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: docker_unraid_evidence_contractref_overlay
reasoning_tier: standard
context_scope: newtools_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: docker_unraid_evidence_contractref_overlay
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0078
preserved_exact_tokens:
- Evidence/result contract additions
- docker_auth_result
- docker_publish_result
- unraid_template_result
- PolicyRule:no_secrets_in_storage
- SchemaID:evidence.schema.json
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Containers_Registry_and_Unraid.md, FinalGUISpec, Orchestrator_Page, and evidence schema remain cross-doc consumers/authorities through the preserved ContractRef.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md, PolicyRule:no_secrets_in_storage, SchemaID:evidence.schema.json'
```

### N2-001 - GUI Testing Tools Retired Source-Preserving Bridge

```yaml
plan_unit_id: N2-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/newtools.md
canonical_text: N2-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 107 because newtools-S0001 through newtools-S0078 are covered by N2-002 through N2-150 or explicit structural, reference-only, retired, and migration-coverage dispositions. N2-001 no longer carries source_preserving_planunit compile mode and must not own product coverage.
gui_related: false
gui_classification_reason: The live unit is retired migration-lineage compatibility only; GUI-related source coverage is carried by fine-grained newtools PlanUnits and coverage_map proof.
split_recommended: false
depends_on:
- N2-002
- N2-003
- N2-004
- N2-005
- N2-006
- N2-007
- N2-008
- N2-009
- N2-010
- N2-011
- N2-012
- N2-013
- N2-014
- N2-015
- N2-016
- N2-017
- N2-018
- N2-019
- N2-020
- N2-021
- N2-022
- N2-023
- N2-024
- N2-025
- N2-026
- N2-027
- N2-028
- N2-029
- N2-030
- N2-031
- N2-032
- N2-033
- N2-034
- N2-035
- N2-036
- N2-037
- N2-038
- N2-039
- N2-040
- N2-041
- N2-042
- N2-043
- N2-044
- N2-045
- N2-046
- N2-047
- N2-048
- N2-049
- N2-050
- N2-051
- N2-052
- N2-053
- N2-054
- N2-055
- N2-056
- N2-057
- N2-058
- N2-059
- N2-060
- N2-061
- N2-062
- N2-063
- N2-064
- N2-065
- N2-066
- N2-067
- N2-068
- N2-069
- N2-070
- N2-071
- N2-072
- N2-073
- N2-074
- N2-075
- N2-076
- N2-077
- N2-078
- N2-079
- N2-080
- N2-081
- N2-082
- N2-083
- N2-084
- N2-085
- N2-086
- N2-087
- N2-088
- N2-089
- N2-090
- N2-091
- N2-092
- N2-093
- N2-094
- N2-095
- N2-096
- N2-097
- N2-098
- N2-099
- N2-100
- N2-101
- N2-102
- N2-103
- N2-104
- N2-105
- N2-106
- N2-107
- N2-108
- N2-109
- N2-110
- N2-111
- N2-112
- N2-113
- N2-114
- N2-115
- N2-116
- N2-117
- N2-118
- N2-119
- N2-120
- N2-121
- N2-122
- N2-123
- N2-124
- N2-125
- N2-126
- N2-127
- N2-128
- N2-129
- N2-130
- N2-131
- N2-132
- N2-133
- N2-134
- N2-135
- N2-136
- N2-137
- N2-138
- N2-139
- N2-140
- N2-141
- N2-142
- N2-143
- N2-144
- N2-145
- N2-146
- N2-147
- N2-148
- N2-149
- N2-150
unblocks: []
acceptance_criteria:
- N2-001 no longer uses node_compile_hint.mode source_preserving_planunit after Phase 2B batch 107.
- newtools-S0001 through newtools-S0078 product coverage is owned by N2-002 through N2-150 or explicit structural, reference-only, retired, and migration-coverage dispositions.
- N2-001 remains only to preserve migration lineage for the former source-preserving bridge.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/newtools.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0072
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:newtools-S0073
preserved_exact_tokens:
- N2-001
- GUI Testing Tools Residual Source-Preserving PlanUnit
- source_preserving_planunit
- source_preserving_bridge_retired
- 15. References
- 14.7A DockerHub browser auth, repository management, and Unraid publishing addendum
- Result payload minima
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- N2-001 must not re-own newtools-S0001 through newtools-S0078 after Phase 2B batch 107.
- N2-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Retired bridge lineage must not be treated as implementation-ready product coverage.
- The retired bridge must not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
compatibility_only_notes:
- N2-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former N2-001 residual source-preserving bridge is retired by Phase 2B batch 107.
owner_boundary_notes:
- N2-002 through N2-150 and explicit coverage dispositions own newtools product coverage after bridge retirement.
- newtools-S0072 is reference-only lineage/provenance coverage after bridge retirement.
- newtools-S0073 is a structural addendum heading after bridge retirement.
owner_hints:
- Plans/newtools.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
split_recommendation_reason: The former source-preserving bridge has been atomized or structurally/reference dispositioned and is now retired.
```
