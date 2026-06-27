# Shard 022: PlanUnits

Source: `Plans/usage-feature.md`

Source lines: L924-L5001

Source SHA256: `f36a9f06b8895a1798524dc3927ddc35e21f798849f9dcd5a232fc159dafda39`

---

## PlanUnits

### UF-002 - Usage Feature Envelope

```yaml
plan_unit_id: UF-002
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: The Usage feature is a first-class app/GUI area that remains a plan-only, implementation-agnostic specification for quota visibility, plan type, ledger inspection, analytics, and alerts, including 5h/7d usage and plan type where available.
gui_related: true
gui_classification_reason: This unit defines the user-visible Usage app/GUI feature envelope.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-002 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_feature_envelope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0011
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0015
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0018
preserved_exact_tokens:
- PLAN DOCUMENT ONLY
- first-class area in the app/GUI
- Usage
- 5h/7d
- plan type
- ledger
- analytics
- alerts
- implementation-agnostic
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-003 - Rollup Backed Storage Dependency

```yaml
plan_unit_id: UF-003
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage reads 5h/7d, dashboard, and analytics values from redb rollups produced by analytics scan jobs over the canonical seglog pipeline, with Tantivy search/projector support where applicable; usage.jsonl remains a human-readable mirror or compatibility input, not the canonical rollup source.
gui_related: true
gui_classification_reason: The unit supports user-visible Usage numbers but primarily preserves storage-backed projection requirements.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-003 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: rollup_backed_storage_dependency
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0013
preserved_exact_tokens:
- seglog
- redb
- Tantivy
- analytics scan jobs
- 5h/7d
- dashboard
- usage.jsonl
- canonical rollup source
- Projector pipeline
negative_constraints:
- 5h/7d and dashboard windows are owned by rollups, not by ad hoc `usage.jsonl` scans.
preserved_contractrefs: []
compatibility_only_notes:
- usage.jsonl may still appear as a human-readable mirror or Ledger compatibility input during migration, but it is not the canonical rollup source.
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-004 - Usage Storage Routing Identity

```yaml
plan_unit_id: UF-004
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage storage and routing are scoped by canonical project, run, package, lane, UsageRecord, runtime object identity, usage_event_ref, and Ledger/Usage route targets rather than legacy timestamp/thread/tier shortcuts.
gui_related: true
gui_classification_reason: The unit governs user-visible deep-links and route targets in Usage surfaces.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-004 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_storage_routing_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0014
preserved_exact_tokens:
- project
- run
- package
- lane
- usage_event_ref
- UsageRecord
- Ledger/Usage route targets
- run_id/thread_id/timestamp
- usage_event_seq
negative_constraints:
- Usage `/runtime/storage` paths and artifacts are scoped per-project, per-run, per-package, and per-lane; old tier/workspace-only layouts remain migration inputs and must not replace canonical project/run/package/lane identity.
- GUI deep-links no longer use `run_id/thread_id/timestamp`, `/thread_id/timestamp`, `usage_event_seq`, broad timestamp filters, or tier-based `usage.jsonl` rollups as canonical navigation.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-005 - Usage Export Taxonomy

```yaml
plan_unit_id: UF-005
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Usage export semantics stay distinct: record export returns exact record envelopes with stable ids, canonical ids, refs, metadata, and schema-aware payloads; bundle export packages records, Evidence, blobs/files, selected-object bundles, manifests, and run-history artifacts; view export produces filtered tables, charts, CSV/JSON summaries, search results, analytics views, and graph renders without becoming canonical record truth.'
gui_related: true
gui_classification_reason: Export is user-facing Usage behavior and file output presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-005 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_export_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0014
preserved_exact_tokens:
- Export taxonomy and manifest contract
- record export
- bundle export
- view export
- /records
- /refs
- .pm-bundle
- CSV/JSON
- graph `/render`
- JSONL mirror
negative_constraints:
- Filtered CSV and JSON summaries are view exports unless they preserve the exact record envelope.
preserved_contractrefs: []
compatibility_only_notes:
- JSONL mirror export is projection-derived rather than a replacement for seglog ownership.
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-006 - Projection Trust Blocking And Freshness

```yaml
plan_unit_id: UF-006
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage must preserve projection trust, action gating, blocked/runtime recovery ownership, attention-center rows, freshness labeling, and advisory quiet-window behavior without hiding canonical blocked or approval-wait episodes.
gui_related: true
gui_classification_reason: The unit governs user-visible freshness, attention, blocked, and recovery presentation.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-006 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: projection_trust_blocking_and_freshness
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0004
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0009
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0014
preserved_exact_tokens:
- Projection trust and action gating
- Identity and blocked-policy transfer cluster
- Blocked-owner eight-kind taxonomy
- Last updated
- Refresh
- quiet suppression
- /approval-wait
- blocked/runtime authority
negative_constraints:
- Quiet suppression only affects advisory resurfacing; canonical blocked and `/approval-wait` rows must preserve precise owner and reason metadata.
- Usage consumes Executor_Protocol blocked/runtime recovery ownership outcomes without inventing a separate authority.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- 'Usage freshness is a user-trust requirement: stale values must be visibly marked with `Last updated` and an explicit `Refresh` action.'
owner_hints:
- Plans/usage-feature.md
```

### UF-007 - Account Switch Pressure And Bridge Identity

```yaml
plan_unit_id: UF-007
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage attribution preserves account switch and pressure history through actor-scoped snapshots, account_switch_event and account_pressure_episode records, and explicit bridge precedence where attempt_id is the local runtime anchor, provider_attempt_ref? is provider/runtime trace, usage_event_ref is the Usage bridge, and receipt refs are external side-effect lineage.
gui_related: false
gui_classification_reason: The unit preserves backend/runtime identity and attribution rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-007 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: account_switch_pressure_and_bridge_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0014
preserved_exact_tokens:
- Execution role and operational identity
- Account switch and pressure history
- attempt_id
- provider_attempt_ref?
- usage_event_ref
- receipt refs
- actor_kind
- execution_role
- account_switch_event
- account_pressure_episode
negative_constraints:
- Scheduler-internal IDs remain scheduler/effective-resolution evidence and must not be inserted into usage_record by default.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-008 - Widget Shell And Project Card Usage Consumers

```yaml
plan_unit_id: UF-008
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Usage consumes widget and shell presentation contracts without re-owning them: Widget_System broad pre-rewrite Orchestrator widget material is compatibility lineage, dashboard_layout migration reads yield to widget_layout:v1:dashboard, and project-card usage copy stays compact with one primary and one secondary line.'
gui_related: true
gui_classification_reason: The unit constrains user-visible widget, shell, and project-card presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-008 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: widget_shell_and_project_card_usage_consumers
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0014
preserved_exact_tokens:
- Widget_System
- compatibility lineage
- dashboard_layout:v1
- dashboard_layout
- widget_layout:v1:dashboard
- project-card usage copy
- one primary line
- one secondary line
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Widget_System broad pre-rewrite Orchestrator widget model is compatibility lineage, not Usage ownership.
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-009 - Quota Visibility And Alerts

```yaml
plan_unit_id: UF-009
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage surfaces show quota and plan visibility with 5h and 7d windows, detected/configured plan type, always-visible limits, background refresh, live vs after-run source disclosure, approaching-limit warnings such as 80%, and rate-limit-hit actions to switch platform or pause.
gui_related: true
gui_classification_reason: The unit defines visible quota/alert UI behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-009 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: quota_visibility_and_alerts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0019
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0020
preserved_exact_tokens:
- '5h: X / Y'
- '7d: X / Y'
- Plan type
- Background refresh
- live
- after-run
- 80%
- Switch platform
- pause
- Always-visible limits
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-010 - Ledger Analytics Reporting And Retention

```yaml
plan_unit_id: UF-010
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage keeps event-level usage ledger inspection, filtering/export, optional analytics by time/platform/project/tier, cost tracking/attribution, retention/privacy controls, and drill-down without turning filtered exports into canonical history.
gui_related: true
gui_classification_reason: The unit defines visible ledger, analytics, reporting, and export surfaces.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-010 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: ledger_analytics_reporting_and_retention
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0021
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0022
preserved_exact_tokens:
- Event-level log
- platform
- operation
- tokens in/out
- cost
- filtering
- export
- JSON
- Aggregated view
- Cost tracking
- Retention policy
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-011 - Chat Context Circle Affordance

```yaml
plan_unit_id: UF-011
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Thread-scoped Usage appears as the chat context circle with hover-revealed Usage, Tokens, Cost, and More Details actions plus click-to-Compact Now behavior; More Details opens the editor-tab Context Detail Pane and app-wide Usage remains a separate surface.
gui_related: true
gui_classification_reason: The unit defines user-visible chat Usage controls.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-011 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: chat_context_circle_affordance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0023
preserved_exact_tokens:
- context circle
- Usage
- Tokens
- Cost
- More Details
- Compact Now
- Context Detail Pane
- app-wide Usage
- OpenCode
negative_constraints:
- OpenCode references are non-binding UX references and do not replace Puppet Master canonical behavior.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Prompt_Pipeline.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-012 - Context Detail Pane Inspection

```yaml
plan_unit_id: UF-012
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: The Context Detail Pane provides curated overview cards, grouped usage breakdowns, per-message inspection, raw payload toggles, provider/model/mode/persona drill-downs, and side-by-side Expert/ELI5 help copy for thread-scoped usage.
gui_related: true
gui_classification_reason: The unit defines visible Context Detail Pane inspection behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-012 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: context_detail_pane_inspection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0023
preserved_exact_tokens:
- Context Detail Pane
- curated overview
- grouped breakdowns
- per-message inspection
- raw payload
- provider
- model
- mode
- persona
- Expert
- ELI5
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Prompt_Pipeline.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-013 - Per Thread Estimated Cost Rule

```yaml
plan_unit_id: UF-013
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Per-thread estimated cost and context usage preserve provider-sensitive caveats: reasoning tokens may be charged at output-token estimate when needed, cache read/write buckets remain visible, and raw/debug paths disclose normalization limits instead of claiming exact billing truth.'
gui_related: true
gui_classification_reason: The unit governs visible per-thread cost/usage copy and caveat presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-013 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: per_thread_estimated_cost_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0023
preserved_exact_tokens:
- estimated cost
- reasoning tokens
- output-token estimate
- cache read/write
- provider-sensitive cache normalization caveats
- raw/debug paths
negative_constraints:
- Provider-sensitive cache normalization caveats must remain visible in raw/debug paths and must not be hidden behind authoritative wording in the chat UI.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Prompt_Pipeline.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/usage-feature.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-014 - Cursor Usage Account Augmentation

```yaml
plan_unit_id: UF-014
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Cursor Usage rows treat CURSOR_API_KEY as an advanced usage/account augmentation path, keep cursor-agent login as the default local account path, classify usage source confidence honestly, and avoid fake universal remaining-request counters or inferred remaining-requests; .cursorrules remains deprecated compatibility projection.
gui_related: true
gui_classification_reason: The unit governs visible Cursor usage/account rows and source-confidence presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-014 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: cursor_usage_account_augmentation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0024
preserved_exact_tokens:
- CURSOR_API_KEY
- cursor-agent
- source classes
- remaining-requests
- .cursorrules
- Cursor Rules
negative_constraints:
- PM must not invent a fake universal remaining-request counter when Cursor exposes only plan totals, team allotments, or runtime/editor refusal signals.
- Cursor browser-auth accounts may provide strong local per-run usage, but `/limit` and account-row truth require provider or team API augmentation.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes:
- .cursorrules / cursorrules are deprecated compatibility rather than the primary managed format.
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-015 - Codex Direct Provider Buckets

```yaml
plan_unit_id: UF-015
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Codex direct provider Usage must keep ChatGPT sign-in and API-key rows as distinct buckets with requested/effective auth labels, plan-backed vs API-billed usage separation, and setup/status probes such as codex login status treated as setup evidence only.
gui_related: true
gui_classification_reason: The unit governs visible Codex account/usage rows and labels.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-015 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: codex_direct_provider_buckets
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0025
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0026
preserved_exact_tokens:
- Sign in with ChatGPT
- Use API Key
- MUST NOT merge those buckets
- 'Plan: ChatGPT <tier>'
- 'Usage Bucket: API billed'
- codex login status
negative_constraints:
- PM MUST NOT merge those buckets into one shared pressure or cooldown pool, even when they belong to the same human owner.
- codex login status is setup/status evidence only; it does not become usage quantity, quota, or remaining-window evidence.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Codex stale-vs-live provider/model labeling must distinguish last-known upstream data from current direct-provider state.
owner_hints:
- Plans/usage-feature.md
```

### UF-016 - Copilot Billing Pressure Evidence

```yaml
plan_unit_id: UF-016
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: GitHub Copilot pressure preserves premium exhaustion, paid-overage policy, org policy, entitlement-missing, billing/entity, runtime-side entitlement, and bridge-visible usage-record evidence as distinct conditions and must not promise a simple per-account remaining-requests endpoint without provider support.
gui_related: false
gui_classification_reason: The unit preserves provider/account evidence rules rather than GUI presentation.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-016 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: copilot_billing_pressure_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0027
preserved_exact_tokens:
- premium-request exhaustion
- paid-overage policy
- org policy
- entitlement-missing
- remaining-requests
- bridge-visible
- usage-record
- usage_record
negative_constraints:
- premium-request exhaustion, paid-overage policy, org policy blocks, and entitlement-missing states are distinct conditions and must not all be flattened into a generic cooldown.
- Team admin APIs such as `/metrics/spending` may inform Copilot pressure, but PM must not promise a simple per-account `remaining-requests` endpoint unless the provider exposes one.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-017 - Copilot Status Disclosure

```yaml
plan_unit_id: UF-017
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Copilot Usage and status surfaces disclose selected billing/entity context and explicit status copy such as Premium requests exhausted, with subtext and included-model eligibility notes when they explain the active quota bucket.
gui_related: true
gui_classification_reason: The unit owns user-visible Copilot status and explanatory copy.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-017 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: copilot_status_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0027
preserved_exact_tokens:
- Premium requests exhausted
- Premium-request-backed features are unavailable until reset or policy change
- Included models may still be available
- selected billing/entity context
- active quota bucket
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-018 - Claude Code Admin Api Usage

```yaml
plan_unit_id: UF-018
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Claude Code Usage can consume Anthropic Admin API and stream-json usage evidence, but must distinguish subscriber-backed, API-backed, Console, and organization-backed limits and must not reuse org/API hard limit semantics without provider evidence.
gui_related: false
gui_classification_reason: The unit preserves provider usage evidence and account semantics rather than GUI layout.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-018 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: claude_code_admin_api_usage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0028
preserved_exact_tokens:
- Admin API
- /v1/organizations/usage_report/claude_code
- ANTHROPIC_API_KEY
- stream-json
- subscriber-backed
- API-backed
- RPM
- /TPM
negative_constraints:
- Subscriber-backed rows must not reuse API / Console / organization-backed hard limit semantics without provider evidence.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-019 - Gemini Direct Cli Separation

```yaml
plan_unit_id: UF-019
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Gemini Usage must distinguish Gemini direct from Gemini CLI and retire stale-canon wording that collapses Gemini into local counters, one mixed-account provider, or a generic API-key key-exception; CLI runtime transport remains owned by CLI_Bridged_Providers.
gui_related: false
gui_classification_reason: The unit preserves provider mode and owner-boundary semantics rather than visual presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-019 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: gemini_direct_cli_separation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0029
preserved_exact_tokens:
- Gemini
- Gemini CLI
- mixed-account
- key-exception
- local counters
- CLI_Bridged_Providers.md
negative_constraints:
- Usage must not collapse Gemini into one direct provider with mixed OAuth/API-key pools and no CLI runtime.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Stale-canon wording that reduces Gemini to local counters, a single `mixed-account` provider, or a generic API-key `key-exception` is not live Usage canon.
owner_hints:
- Plans/usage-feature.md
```

### UF-020 - Gemini Direct Setup Usage

```yaml
plan_unit_id: UF-020
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Gemini direct rows are API-key-backed provider entries using GEMINI_API_KEY and Use API Key as the canonical setup path, with project/quota attribution and estimated or unknown wording when authoritative remaining quota cannot be proven.
gui_related: true
gui_classification_reason: The unit governs visible Gemini direct setup and quota labels.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-020 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: gemini_direct_setup_usage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0030
preserved_exact_tokens:
- GEMINI_API_KEY
- Use API Key
- estimated
- /unknown
- API-key-backed
- quota bucket
- Code Assist
negative_constraints:
- API-key-backed rows must not be mislabeled as the same quota bucket or plan path as OAuth-backed Code Assist-style quota semantics.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Media_Generation_and_Capabilities.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-021 - Retired Gemini CLI Usage Evidence

```yaml
plan_unit_id: UF-021
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Gemini CLI usage evidence vocabulary is retired/source-lineage only. OAuth, direct API key, Vertex/Google
  credentials, ADC, gcloud, service-account, /stats model, Configured, Working, Operational, and requested/effective model
  difference tokens remain auditable, but PM must not create active Gemini CLI usage rows or scheduler pressure signals.
gui_related: false
gui_classification_reason: The unit preserves runtime/provider evidence rather than GUI presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-021 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: retired_gemini_cli_usage_resurrection
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: retired_gemini_cli_usage_evidence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0031
preserved_exact_tokens:
- OAuth
- direct API key
- Vertex
- Google credential
- ADC
- gcloud
- service-account
- /stats model
- Configured
- Working
- Operational
- requested/effective
negative_constraints:
- Do not create active Gemini CLI usage rows.
- Do not use retired Gemini CLI stats as scheduler pressure signals.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes:
- Gemini CLI usage tokens are retained only for migration/currentness lineage.
stale_retired_dispositions:
- Active Gemini CLI usage evidence is retired by provider-update ledger pldg-20260624-001-provider-updates.
owner_hints:
- Plans/usage-feature.md
```

### UF-022 - Active Provider Family Pooling Capability Posture

```yaml
plan_unit_id: UF-022
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: When policy pools active provider entries, Usage still shows the concrete runtime surface, requested/effective
  auth/account intent, quota bucket, source confidence, capability posture supports_* flags, auth recovery methods, and quota
  signal sources. Gemini Direct and Antigravity may pool only when their effective capabilities satisfy the request; retired
  Gemini CLI cannot be selected as an active pool member. API-key buckets must not be mislabeled as OAuth/Code Assist quota paths.
gui_related: true
gui_classification_reason: The unit governs visible pooled Gemini usage and capability disclosure.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-022 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: active_provider_family_pooling_capability_posture
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0032
preserved_exact_tokens:
- supports_multi_account
- supports_threshold_switch
- supports_hard_exhaustion_detection
- supports_rate_limit_detection
- supports_reset_countdown
- supports_manual_set_active
- supports_cooldown
- supports_retry_budget
- supports_role_scoped_account_pools
- auth_recovery_methods
- quota_signal_sources
negative_constraints:
- Gemini API-key-backed rows remain a separate quota bucket and MUST NOT be mislabeled as the same quota bucket or plan path.
- Retired Gemini CLI must not participate as an active pool member.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md'
compatibility_only_notes:
- The exact phrase "Gemini direct and Gemini CLI" pooling wording is retained only as source-lineage.
stale_retired_dispositions:
- Stale `/AI-Studio-oriented` copy is historical context only.
- Active Gemini CLI usage pooling is retired.
owner_hints:
- Plans/usage-feature.md
```

### UF-023 - Provider Source Confidence Augmentation

```yaml
plan_unit_id: UF-023
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Provider/backend usage normalization distinguishes authoritative native quota, authoritative session/tool stats, and inferred or estimated usage, with visible source-confidence, row-type, secondary labels, cooldown/reset handling, coding-plan reset semantics, and documented/default versus effective observed state separation.
gui_related: true
gui_classification_reason: The unit defines visible provider usage rows, tables, badges, and source labels.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-023 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: provider_source_confidence_augmentation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0033
preserved_exact_tokens:
- authoritative native usage
- authoritative session `/tool` stats
- inferred `/estimated` usage
- row-type
- /secondary
- authoritative_rate_limit_or_cooldown
- Unknown reset
- Unknown cooldown end
- Alibaba Coding Plan
- MiniMax Coding Plan
- documented/default expectation
- effective observed state
negative_constraints:
- Known reset/cooldown times tick live; unknown values render `Unknown reset` or `Unknown cooldown end`, never a fabricated countdown.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-024 - Direct Provider Status Probes

```yaml
plan_unit_id: UF-024
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Direct-provider status probes such as codex login status may record account login setup/status evidence but must not be converted into usage quantity, quota, or remaining-window evidence.
gui_related: false
gui_classification_reason: The unit preserves provider setup evidence semantics rather than GUI presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-024 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: direct_provider_status_probes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0034
preserved_exact_tokens:
- Direct-provider status probes
- codex login status
- setup/status evidence
- usage quantity
- quota
- remaining-window evidence
negative_constraints:
- codex login status does not convert the probe into usage quantity, quota, or remaining-window evidence.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-025 - Cost Usage Artifact Routing

```yaml
plan_unit_id: UF-025
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: The cost_usage runtime artifact is an attribution record that uses the canonical usage pipeline, with Show in Ledger and Show in Usage actions routing to Ledger, app-wide Usage, or the thread-scoped Context Detail Pane by scope and without creating a second token or cost model.
gui_related: true
gui_classification_reason: The unit defines user-visible artifact actions and routing.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-025 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: cost_usage_artifact_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0036
preserved_exact_tokens:
- cost_usage
- Show in Ledger
- Show in Usage
- Context Detail Pane
- app-wide Usage
- thread-scoped
- canonical usage schema
- second token or cost model
negative_constraints:
- thread-scoped cost usage does not open a chat side-panel usage surface.
- the artifact does not create a second token or cost model outside the canonical usage schema.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-026 - OpenCode Product Pipeline Reference

```yaml
plan_unit_id: UF-026
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: OpenCode product usage flow is a non-binding reference for provider response to usage normalization to message and usage.event storage; Puppet Master does not replicate it exactly and instead normalizes all providers and transports to the same usage.event/message usage shape.
gui_related: true
gui_classification_reason: The unit preserves user-visible usage-message reference behavior and storage normalization boundary.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-026 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_194
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: opencode_product_pipeline_reference
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0037
preserved_exact_tokens:
- provider response
- LanguageModelV2Usage
- getUsage
- Session.getUsage
- finish-step
- message
- usage.event
- Puppet Master does not replicate this exactly
- all providers
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Provider_OpenCode.md, PolicyRule:Decision_Policy.md\xA72"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-027 - Backend Input Hierarchy

```yaml
plan_unit_id: UF-027
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage backend inputs follow a hierarchy of canonical usage projections and redb rollups over seglog first, supported provider/runtime outputs second, and compatibility mirrors such as usage.jsonl or retired side files only as noncanonical migration/debug inputs.
gui_related: false
gui_classification_reason: The unit preserves backend storage/input hierarchy and source attribution rather than visual presentation.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-027 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: backend_input_hierarchy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0038
preserved_exact_tokens:
- canonical usage projections
- redb rollups
- seglog
- usage.jsonl
- active-subagents.json
- side-file
- live-state
- 'change_status: "new"'
- URL
- UsageRecord
- signal weighting
negative_constraints:
- active-subagents.json and other side-file/live-state mirrors must not be presented as canonical or endorsed usage enrichment sources after side-file retirement.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/FinalGUISpec.md'
- "ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md, PolicyRule:Decision_Policy.md\xA72"
compatibility_only_notes:
- usage.jsonl may still be read as a human-readable mirror or migration input, but not as the canonical 5h/7d rollup source.
stale_retired_dispositions:
- Retired subagent side files remain compatibility projections only.
owner_hints:
- Plans/usage-feature.md
```

### UF-028 - Usage Linked Planning Widget Consumer Boundary

```yaml
plan_unit_id: UF-028
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage-linked planning widgets consume sticky-card and execution-tracker contracts after approval with read-mostly status badges, item-focus navigation, and post-approval edit restrictions, without becoming a second plan state owner.
gui_related: true
gui_classification_reason: The unit governs user-visible planning widget status badges and navigation in Usage-linked surfaces.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-028 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_linked_planning_widget_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0038
preserved_exact_tokens:
- sticky-card
- execution-tracker
- read-mostly status badges
- item-focus navigation
- post-approval edit restrictions
- second plan state owner
negative_constraints:
- Usage-linked planning widgets must not become a second plan state owner.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/FinalGUISpec.md'
- "ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md, PolicyRule:Decision_Policy.md\xA72"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-029 - Canonical Usage Placement And Exclusions

```yaml
plan_unit_id: UF-029
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Usage placement is fixed: app-wide Usage is its own page or view, compact usage appears in shell/status surfaces, thread-scoped context detail lives in chat via the context circle plus editor-tab Context Detail Pane, and artifact/chat deep-links land on canonical surfaces by scope.'
gui_related: true
gui_classification_reason: The unit defines user-visible Usage placement and excludes competing detailed surfaces.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-029 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: canonical_usage_placement_and_exclusions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0039
preserved_exact_tokens:
- app-wide Usage
- shell and status surfaces
- context circle
- editor-tab Context Detail Pane
- artifact deep-links
- chat usage activation
- thread Usage
- detached usage pop-out
- tab or panel or pop-out
negative_constraints:
- Thread Usage in the chat shell or side panel is not the primary detailed surface.
- Detached usage pop-out is not the canonical thread detail model.
- Direct click on the context circle must not open the detail pane without the hover/click split.
- Unresolved `tab or panel or pop-out` phrasing must not leave implementation guessing.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md'
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-030 - Canonical Usage Event Pipeline

```yaml
plan_unit_id: UF-030
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage events flow into immutable UsageRecord data for tokens, costs, tool calls, API calls, helper/background usage, and parent run/thread plus concrete invocation attribution.
gui_related: false
gui_classification_reason: The unit preserves backend UsageRecord event pipeline behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-030 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: canonical_usage_event_pipeline
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0041
preserved_exact_tokens:
- Usage events
- UsageRecord
- tokens
- costs
- tool calls
- API calls
- immutable
- explicit versioning
- helper/background
- parent run/thread
negative_constraints:
- Usage records are immutable once committed; corrections require a new record with explicit versioning.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-031 - Debug Investigation Phase Attribution

```yaml
plan_unit_id: UF-031
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage analytics may group Debug Mode work by investigation lifecycle phase labels such as instrumenting, reproducing, collecting_evidence, analyzing, and applying_fix without making Usage the owner of Debug runtime state-machine semantics.
gui_related: false
gui_classification_reason: The unit preserves analytics attribution dimensions rather than GUI presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-031 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: debug_investigation_phase_attribution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0042
preserved_exact_tokens:
- instrumenting
- reproducing
- collecting_evidence
- analyzing
- applying_fix
- Debug runtime state-machine
negative_constraints:
- Usage does not own Debug runtime state-machine semantics.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-032 - Billing Attribution Family And Pricing Metadata

```yaml
plan_unit_id: UF-032
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage preserves billing identity, provider usage billing evidence, shared attribution family, run/attempt/thread/node/artifact/provider/usage anchors, rate cards, and surcharges as attribution and pressure evidence without replacing canonical usage_record, entitlement, or billing-entity contracts.
gui_related: false
gui_classification_reason: The unit preserves backend billing and attribution metadata semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-032 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: billing_attribution_family_and_pricing_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0043
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0045
preserved_exact_tokens:
- /billing
- /usage/billing
- usage_record
- entitlement
- billing entity
- run/attempt/thread/node/artifact/provider/usage anchors
- rate cards
- surcharges
negative_constraints:
- Provider `/billing` and `/usage/billing` metadata remains attribution and pressure evidence; it does not replace canonical contracts.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-033 - Artifact Bridge And Inspector Routing

```yaml
plan_unit_id: UF-033
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Artifact drill-through and receipt lineage use attempt_id, provider_attempt_ref, usage_event_ref, receipt refs, and explicit inspector_target values for details/evidence/usage/lineage, avoiding timestamp heuristics, tier_id pivots, eager deref, and feature-local routing semantics.
gui_related: true
gui_classification_reason: The unit governs user-visible inspector routing and artifact drill-through behavior.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-033 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: artifact_bridge_and_inspector_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0053
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0054
preserved_exact_tokens:
- attempt_id
- provider_attempt_ref
- usage_event_ref
- receipt refs
- inspector_target = details | evidence | usage | lineage
- timestamp heuristics
- tier_id
- on-demand
- payload.meta
- ref/blob pointers
- click-to-expand
negative_constraints:
- None of those bridge fields replace the primary local key.
- Prefer usage_event_ref rather than timestamp heuristics when routing cost-bearing artifacts to Usage and Ledger.
- History inspector deref policy is on-demand only, never eager.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-034 - Notification Projection Health Gating

```yaml
plan_unit_id: UF-034
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage help, notification, quiet-window, projection-health, and sensitive-action behavior routes notifications by severity, execution impact, blocked owner, persistence, and projection trust; quiet windows apply only to advisory warnings; degraded projections expose current/refreshing/stale/degraded/unavailable states and record-backed fallback.
gui_related: true
gui_classification_reason: The unit governs user-visible notification, projection-health, and degraded-state behavior.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-034 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: notification_projection_health_gating
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0056
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0057
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0058
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0059
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0060
preserved_exact_tokens:
- severity
- execution impact
- blocked owner
- persistence
- projection trust
- quiet windows
- current/refreshing/stale/degraded/unavailable
- record-backed fallback
negative_constraints:
- Quiet windows are allowed for advisory warnings but not for canonical blocked episodes.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-035 - UsageRecord Schema Source Attribution

```yaml
plan_unit_id: UF-035
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: UsageRecord schema expectations preserve unified schema aliases, usage_id, created_at_utc, account_id, provider_id, model_id, usage_source_kind, provider_runtime_usage, provider_quota_api, provider_usage_api, provider_error_hint, project_rollup, local-estimated, API-key-derived, and OAuth-quota-derived source detail.
gui_related: false
gui_classification_reason: The unit preserves backend UsageRecord schema and attribution fields.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-035 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usagerecord_schema_source_attribution
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0061
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0062
preserved_exact_tokens:
- UsageRecord
- usage_id
- created_at_utc
- account_id
- provider_id
- model_id
- usage_source_kind
- provider_runtime_usage
- provider_quota_api
- local-estimated
- API-key-derived
- OAuth-quota-derived
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-036 - Cost Precision Display Boundary

```yaml
plan_unit_id: UF-036
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage cost display uses clamp/derived-field precision rules derived from cost_microdollars or exact provider minor-unit receipts, including <$0.01 = 6dp, <$1 = 4dp, otherwise 2dp, while cost_usd is display/migration material and raw provider cost values remain provenance/debug evidence only.
gui_related: true
gui_classification_reason: The unit defines visible cost precision and display boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-036 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: cost_precision_display_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0061
preserved_exact_tokens:
- /clamp/derived-field
- cost_microdollars
- <$0.01 = 6dp
- <$1 = 4dp
- cost_usd = cost_microdollars / 1_000_000
- raw-cost provider values
negative_constraints:
- Raw-cost provider values must not become independent billing authority.
- cost_usd is not a persisted UsageRecord authority field.
preserved_contractrefs: []
compatibility_only_notes:
- cost_usd = cost_microdollars / 1_000_000 is derived only at display/export boundaries or compatibility import/migration edges.
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-037 - Blocked Escalation Observability

```yaml
plan_unit_id: UF-037
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage blocked-state observability preserves attention_required, blocked_notice, blocked_family, allowed_action_ids[] stale-token retirement, escalation_level, action_available ownership, an 8-kind blocked-owner taxonomy, and a 5-level escalation ladder across Orchestrator, Dashboard, thread badges, and notifications.
gui_related: true
gui_classification_reason: The unit governs user-visible blocked/escalation rows and badges.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-037 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: blocked_escalation_observability
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0063
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0064
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0065
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0066
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0067
preserved_exact_tokens:
- attention_required
- blocked_notice
- blocked_family
- allowed_action_ids[]
- escalation_level
- action_available
- 8-kind taxonomy
- 5-level escalation ladder
- Dashboard
- thread badges
- notifications
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- allowed_action_ids[] is preserved as a stale-token disposition in this usage-side carry-through span.
owner_hints:
- Plans/usage-feature.md
```

### UF-038 - Usage Secrets Fallback Source Labeling

```yaml
plan_unit_id: UF-038
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: When platform APIs require secrets such as ANTHROPIC_API_KEY or GITHUB_TOKEN/GH_TOKEN, Usage must label missing live data honestly and always show project-local canonical usage summaries from rollups/projections as fallback.
gui_related: true
gui_classification_reason: The unit defines user-visible source labels, env-var help, and fallback messages.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-038 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_secrets_fallback_source_labeling
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0068
preserved_exact_tokens:
- ANTHROPIC_API_KEY
- GITHUB_TOKEN
- GH_TOKEN
- N/A
- Set ANTHROPIC_API_KEY
- From this project's usage
- From Claude (API)
negative_constraints:
- Users must not be led to assume no data means no usage.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-039 - Usage Api Refresh Rate Limiting

```yaml
plan_unit_id: UF-039
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage refreshes provider API data at reasonable cached intervals, supports explicit Refresh, updates from run results when available, and avoids excessive polling that could hit rate limits or consume quota.
gui_related: false
gui_classification_reason: The unit preserves backend/provider refresh policy with limited visible Refresh behavior.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-039 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_api_refresh_rate_limiting
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0069
preserved_exact_tokens:
- 5-15 min
- cache last result
- Refresh
- After each run
- rate limits
- API errors
negative_constraints:
- Polling usage endpoints too frequently must not consume user quota or cause blocked requests.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-040 - Canonical UsageRecord Write Path

```yaml
plan_unit_id: UF-040
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage must unify around one canonical write path and one UsageRecord schema so Ledger, rollups, and UI projections read the same attribution model rather than parsing ad hoc JSON or duplicate tracker types.
gui_related: true
gui_classification_reason: The unit affects user-visible correctness in Ledger/rollup/UI projections and shared backend schema.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-040 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: canonical_usagerecord_write_path
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0070
preserved_exact_tokens:
- state::UsageTracker
- types::UsageRecord
- platforms::UsageTracker
- UsageEvent
- UsageSummary
- one canonical write path
- one `UsageRecord` schema
- usage.jsonl
negative_constraints:
- Ledger, rollups, and UI projections must not fork into separate attribution models.
preserved_contractrefs: []
compatibility_only_notes:
- If usage.jsonl persists, it is a mirror / compatibility artifact rather than an independent canonical source.
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-041 - Usage Window Model And Platform Semantics

```yaml
plan_unit_id: UF-041
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage/cooldown semantics use a generic usage-window model with window_kind, window_label, window_scope, rolling, fixed_reset, billing_cycle, session_only, and unknown semantics so platform-specific windows such as Codex, Claude, Gemini, Cursor, MiniMax, and provider estimates are labeled rather than flattened into one 5h/7d column.
gui_related: true
gui_classification_reason: The unit defines user-visible platform-specific window labels and tooltips.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-041 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_window_model_and_platform_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0071
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0072
preserved_exact_tokens:
- 5h/7d
- usage-window
- window_kind
- rolling
- fixed_reset
- billing_cycle
- session_only
- unknown
- window_scope
- MiniMax Coding Plan
negative_constraints:
- Avoid one generic `5h/7d` column when semantics differ.
- The UI may show inferred/estimated usage only if it labels the evidence source and avoids pretending to know reset semantics.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-042 - Seglog Retention Rollup Freshness

```yaml
plan_unit_id: UF-042
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage event storage uses retention, optional export-first archival/compaction, daily summary records, incremental redb rollup refresh, and explicit freshness cues; usage.jsonl is a human-readable mirror only and MUST NOT serve aggregation or 5h/7d windows.
gui_related: true
gui_classification_reason: The unit defines visible rollup freshness and backend retention behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-042 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: seglog_retention_rollup_freshness
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0073
preserved_exact_tokens:
- 90 days
- archive
- compact
- daily summary records
- redb rollups
- freshness cue
- usage.jsonl
- MUST NOT be used for aggregation
negative_constraints:
- usage.jsonl is a human-readable mirror only and MUST NOT be used for aggregation, rollup computation, or 5h/7d window serving.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes:
- usage.jsonl follows the same retention policy as seglog if retained for debugging.
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-043 - Stale Data And Project Scope Disclosure

```yaml
plan_unit_id: UF-043
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage must show Last updated and Refresh for stale values, may refresh on focus/run start with rate limiting, and must distinguish current-project Usage from future all-project aggregation through explicit scope labels/selectors.
gui_related: true
gui_classification_reason: The unit defines user-visible freshness and project-scope disclosure.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-043 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: stale_data_and_project_scope_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0074
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0075
preserved_exact_tokens:
- Last updated
- Refresh
- 5h/7d
- Usage for this project
- Current project
- All projects
- scope selector
negative_constraints:
- Old numbers must not be presented as current.
- All-project aggregation requires an explicit scope selector and documented read path.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-044 - Deferred Time Window Selector

```yaml
plan_unit_id: UF-044
unit_type: deferred_enhancement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage may later add a time-window selector with 5h, 7d, 24h, and custom date range presets; the phase label is v1 optional and fixed 5h/7d can ship first.
gui_related: false
gui_classification_reason: The unit is a deferred option-set control requirement rather than current visual layout.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-044 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: deferred_time_window_selector
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0077
preserved_exact_tokens:
- 5h
- 7d
- 24h
- custom date range
- dropdown
- preset buttons
- v1 optional
- fixed 5h/7d first
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-045 - Deferred Reset Countdown

```yaml
plan_unit_id: UF-045
unit_type: deferred_enhancement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage may show reset countdowns such as Resets in 2h 15m from QuotaInfo.resets_at or parsed error/API responses; phase label is v1 if already parsed, low effort.
gui_related: true
gui_classification_reason: The unit defines visible reset countdown copy.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-045 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: deferred_reset_countdown
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0078
preserved_exact_tokens:
- Reset countdown
- Resets in 2h 15m
- QuotaInfo.resets_at
- v1
- low effort
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-046 - Deferred Per Run Config Usage

```yaml
plan_unit_id: UF-046
unit_type: deferred_enhancement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Execution settings may show per-run, node, package, or execution-scope usage aggregated from usage_event_ref, run_id, node_id, attempt_id, and runtime attribution fields rather than tier_id; phase label is Post-v1.
gui_related: false
gui_classification_reason: The unit preserves backend aggregation scope for future Config consumers.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-046 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: deferred_per_run_config_usage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0079
preserved_exact_tokens:
- This run / node / package
- usage_event_ref
- run_id
- node_id
- attempt_id
- tier_id
- Post-v1
negative_constraints:
- Aggregate from canonical usage identity rather than by `tier_id`.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-047 - Deferred Usage Page Export

```yaml
plan_unit_id: UF-047
unit_type: deferred_enhancement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage page export may export the current ledger filter, date range, or analytics table as CSV/JSON, unifying Ledger export under Usage; phase label is v1 for Ledger export and later analytics extension.
gui_related: true
gui_classification_reason: The unit defines visible Usage export actions.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-047 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: deferred_usage_page_export
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0080
preserved_exact_tokens:
- Export from Usage page
- CSV/JSON
- Ledger export
- date-range/analytics export
- v1
- analytics
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-048 - Deferred Compact Header Usage

```yaml
plan_unit_id: UF-048
unit_type: deferred_enhancement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage may expose compact header text such as Cursor 5h and Claude 7d percentages linked to full Usage; phase label is v1 or post-v1 depending on placement.
gui_related: true
gui_classification_reason: The unit defines visible header usage presentation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-048 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: deferred_compact_header_usage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0081
preserved_exact_tokens:
- Usage in header
- 'Cursor 5h: 80%'
- 'Claude 7d: 45%'
- compact
- full Usage page
- v1 or post-v1
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-049 - Deferred Doctor Usage Integration

```yaml
plan_unit_id: UF-049
unit_type: deferred_enhancement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage and Doctor may cross-link through usage_check, View in Usage, Run Doctor, and Doctor-tab navigation for warning/error triage; phase label is v1 optional.
gui_related: true
gui_classification_reason: The unit defines visible Doctor/Usage navigation affordances.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-049 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: deferred_doctor_usage_integration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0082
preserved_exact_tokens:
- Doctor integration
- View in Usage
- Run Doctor
- Doctor tab
- usage_check
- v1 optional
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-050 - Deferred Cost Column

```yaml
plan_unit_id: UF-050
unit_type: deferred_enhancement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Usage may add a cost column when platform runners or parsers provide cost, replacing current cost: None values with persisted cost shown in Ledger and analytics; phase label is when at least one platform provides cost.'
gui_related: false
gui_classification_reason: The unit preserves future cost data availability and persistence behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-050 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: deferred_cost_column
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0083
preserved_exact_tokens:
- Cost column
- 'cost: None'
- Ledger
- analytics
- cost by project/date
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-051 - Deferred Alerts History

```yaml
plan_unit_id: UF-051
unit_type: deferred_enhancement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage may log approaching-limit or quota-exhausted alerts in a small log such as alerts.jsonl and display them in Usage or Settings; phase label is Post-v1.
gui_related: false
gui_classification_reason: The unit preserves future alert history persistence rather than current GUI layout.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-051 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: deferred_alerts_history
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0084
preserved_exact_tokens:
- Alerts history
- approaching limit
- quota exhausted
- alerts.jsonl
- Usage or Settings
- Post-v1
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-052 - Out Of Scope Peer Benchmarks

```yaml
plan_unit_id: UF-052
unit_type: deferred_enhancement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Peer/benchmark comparison requires anonymized opt-in telemetry and a backend and is future work, not in current scope.
gui_related: false
gui_classification_reason: The unit records out-of-scope future analytics rather than GUI implementation work.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-052 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: out_of_scope_peer_benchmarks
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0085
preserved_exact_tokens:
- Comparison with peers / benchmarks
- anonymized opt-in data
- backend
- Future
- not in scope
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-053 - Usage Plan Out Of Scope Constraints

```yaml
plan_unit_id: UF-053
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: This Usage plan excludes platform CLI contract changes, new platform-specific APIs beyond AGENTS.md, chat/context-window token counting, and current-stack Rust/Iced implementation details as live authority.
gui_related: false
gui_classification_reason: The unit preserves scope boundaries and retired implementation-stack references.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-053 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_plan_out_of_scope_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0086
preserved_exact_tokens:
- platform CLI contracts
- new platform-specific APIs
- AGENTS.md
- Token counting
- context-window usage
- assistant-chat-design
- Rust/Iced
negative_constraints:
- Do not treat the current Rust/Iced stack reference as canonical implementation authority for the rebuilt Rust + Slint direction.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Rust/Iced is retained here as historical implementation context only.
owner_hints:
- Plans/usage-feature.md
```

### UF-054 - Usage Success Criteria

```yaml
plan_unit_id: UF-054
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: Usage success requires 5h/7d usage and plan visibility without a manual usage command, a dedicated Usage view or equivalent ledger/analytics access, clear warnings with path to Usage or tier config, current usage in tier/config flows, and always-visible limits plus optional analytics/cost views.
gui_related: true
gui_classification_reason: The unit defines user-visible acceptance criteria for Usage.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-054 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_success_criteria
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0087
preserved_exact_tokens:
- 5h/7d
- manual "usage" command
- dedicated Usage view
- warning
- Usage or tier config
- current usage
- always-visible
- analytics/cost
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-055 - Widget Composed Usage Page Scope

```yaml
plan_unit_id: UF-055
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: The Usage page is a required dedicated top-level page composed entirely of widgets from Widget_System, with no static/fixed content area and user support for move, resize, configure, add, and remove widget operations.
gui_related: true
gui_classification_reason: The unit defines visible widget-composed Usage page layout behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-055 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: widget_composed_usage_page_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0090
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0091
preserved_exact_tokens:
- Widget-Composed Page Layout
- required, dedicated top-level page
- Every content area
- widget
- no static/fixed content area
- Move
- Resize
- Configure
- Add
- Remove
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Widget_System.md'
- 'ContractRef: ContractName:Plans/Widget_System.md#3, ContractName:Plans/Widget_System.md#4'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-056 - Default Usage Layout Non Empty Seed

```yaml
plan_unit_id: UF-056
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: The widget-composed Usage page ships with a default 4-column layout, starts non-empty, and allows customization after first load; the detailed table continues in usage-feature-S0093.
gui_related: true
gui_classification_reason: The unit defines visible default Usage layout seed behavior.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-056 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_195
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: default_usage_layout_non_empty_seed
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0092
preserved_exact_tokens:
- Default Widget Layout (4-column grid)
- ships with this default layout
- No page starts empty
- customize after first load
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/usage-feature.md
```

### UF-057 - Search Acceleration Analytics Signal

```yaml
plan_unit_id: UF-057
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Usage analytics consumes `tool.invoked.index_used`: `true` means sparse-n-gram candidate narrowing; `false` means raw ripgrep fallback or another unindexed path.'
gui_related: false
gui_classification_reason: 'The unit defines analytics event semantics rather than GUI layout or visual presentation.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-010
unblocks: []
acceptance_criteria:
- UF-057 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: search_acceleration_usage_signal
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0093
preserved_exact_tokens:
- 'Gap 6: Analytics not implemented'
- 'tool.invoked.index_used'
- 'true'
- 'false'
- 'sparse-n-gram candidate narrowing'
- 'raw ripgrep fallback'
- 'another unindexed path'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Tools.md'
- 'Plans/storage-plan.md'
split_recommendation_reason: 'The source span mixes backend analytics signal semantics with the visible default widget table.'
```

### UF-058 - Default Usage Widget Layout Table

```yaml
plan_unit_id: UF-058
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'The non-empty default Usage layout preserves the source Col/Row/Size table for `widget.quota_summary`, `widget.alert_thresholds`, `widget.analytics_chart`, `widget.budget_donuts`, `widget.tool_usage`, `widget.multi_account`, and `widget.ledger_table`.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible Usage widget layout and default placement.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-056
unblocks: []
acceptance_criteria:
- UF-058 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: default_usage_widget_layout_table
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0093
preserved_exact_tokens:
- 'Default Widget Layout (4-column grid)'
- 'No page starts empty'
- 'Col'
- 'Row'
- 'Widget ID'
- 'Size'
- 'What It Shows'
- 'widget.quota_summary'
- 'widget.alert_thresholds'
- 'widget.analytics_chart'
- 'widget.budget_donuts'
- 'widget.tool_usage'
- 'grep/Search `index_used` fallback mix'
- 'widget.multi_account'
- 'widget.ledger_table'
- '2x1'
- '2x2'
- '4x3'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Widget_System.md'
- 'Plans/FinalGUISpec.md'
split_recommendation_reason: 'The source span mixes backend analytics signal semantics with the visible default widget table.'
```

### UF-059 - Usage Widget Responsive Grid Resizing

```yaml
plan_unit_id: UF-059
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Usage widgets use the Widget_System grid system with responsive 2, 3, and 4 column counts, independent min/max grid constraints, and resize-dependent data density such as more chart granularity or more ledger rows.'
gui_related: true
gui_classification_reason: 'The unit defines visible widget grid resizing and responsive layout behavior.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-055
unblocks: []
acceptance_criteria:
- UF-059 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_widget_responsive_grid_resizing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0094
preserved_exact_tokens:
- 'Grid-Based Resizing'
- '2 columns (<1200px)'
- '3 columns (1200-1600px)'
- '4 columns (>1600px)'
- 'min/max grid constraints'
- 'widget.analytics_chart'
- 'widget.ledger_table'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Widget_System.md#3, ContractName:Plans/FinalGUISpec.md#12.3'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Widget_System.md'
- 'Plans/FinalGUISpec.md'
```

### UF-060 - Usage Widget Configuration And Persistence

```yaml
plan_unit_id: UF-060
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Each Usage widget has a gear icon for per-widget configuration of windows, filters, chart type, sort, columns, page size, and cooldown timers, and that configuration persists alongside the widget layout.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible per-widget configuration controls and persistence behavior.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-055
unblocks: []
acceptance_criteria:
- UF-060 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_widget_configuration_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0095
preserved_exact_tokens:
- 'Per-Widget Configuration'
- 'gear icon'
- 'Time window (5h/7d)'
- 'chart type (bar/line/area)'
- 'sort by (count/latency/errors/index_used fallback rate)'
- 'Visible columns'
- 'page size'
- 'show cooldown timers (on/off)'
- 'persisted alongside the widget layout'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Widget_System.md#5'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Widget_System.md'
- 'Plans/storage-plan.md'
```

### UF-061 - Multi Account Widget Observability Boundary

```yaml
plan_unit_id: UF-061
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: '`widget.multi_account` is a first-class catalog entry for status and observability, not the canonical setup surface; it shows provider or server-profile rows, active/effective status, Working or concrete reason text, pressure/cooldown, stale/source-confidence labels, and Agent-Config repair links.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible multi-account widget content and boundaries.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-061 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: multi_account_widget_observability_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0096
preserved_exact_tokens:
- 'Multi-Account Widget as First-Class Catalog Entry'
- 'status and observability widget'
- 'canonical setup surface'
- 'provider entry or server-profile row label'
- 'active/effective marker'
- 'Working'
- 'Operational'
- 'pressure/cooldown summary'
- 'source-confidence / stale label'
- 'Agent-Config'
- 'one GitHub Copilot auth-backed row'
- 'OpenCode server profiles'
- 'profile-mode labels'
negative_constraints:
- 'The widget does not replace Agent-Config for account management, billing/entity selection, instruction control, skills, or MCP setup.'
- 'The widget must not imply that every provider row has literal installed-local-state semantics; some rows are account-backed, some are server-profile-backed.'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Widget_System.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/FinalGUISpec.md'
- 'ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions:
- 'source-confidence / stale label where needed'
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Widget_System.md'
- 'Plans/Multi-Account.md'
- 'Plans/FinalGUISpec.md'
- 'Plans/Provider_OpenCode.md'
- 'Plans/storage-plan.md'
```

### UF-062 - Dashboard Add Widget Reuse For Usage Widgets

```yaml
plan_unit_id: UF-062
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'All Usage widgets are also Dashboard-hostable through the add-widget flow: Add Widget opens a catalog overlay, selecting and adding a Usage widget places it on the Dashboard grid at its default size, and the user can then configure and resize it.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible Dashboard add-widget reuse for Usage widgets.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-062 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: dashboard_add_widget_reuse_for_usage_widgets
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0097
preserved_exact_tokens:
- 'Reuse on Dashboard via Add-Widget Flow'
- 'Add Widget'
- 'catalog overlay'
- 'Dashboard-compatible widgets'
- 'widget.quota_summary'
- 'default size'
- 'Configure and resize as needed'
- 'usage information alongside orchestrator status'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Widget_System.md#4'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Widget_System.md'
- 'Plans/FinalGUISpec.md'
```

### UF-063 - Runtime Recovery Counters And Metrics Integrity

```yaml
plan_unit_id: UF-063
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Usage rollups keep runtime recovery observability queryable with blocked attempts by `blocked_reason_code`, retries by `failure_class`, remediation child activity, queue-analysis passes, safe-point creates/restores, `escalation_level`, `action_available`, and blocked outcomes distinct from failures.'
gui_related: false
gui_classification_reason: 'The unit defines runtime observability and rollup metrics semantics rather than GUI implementation.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-006
unblocks: []
acceptance_criteria:
- UF-063 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: runtime_recovery_usage_counters
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0100
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0101
preserved_exact_tokens:
- 'Runtime Scheduler / Recovery Observability Addendum'
- 'blocked_reason_code'
- 'failure_class'
- 'remediation children spawned and resolved'
- 'queue-analysis passes and wake reasons'
- 'safe-point creates/restores'
- 'blocked outcomes remain distinct from failures'
- 'escalation_level'
- 'action_available'
- 'usage rollups'
- 'executed-tool metrics separate'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Executor_Protocol.md'
- 'Plans/Contracts_V0.md'
- 'Plans/storage-plan.md'
- 'Plans/Orchestrator_Page.md'
- 'Plans/Run_Graph_View.md'
```

### UF-064 - Cross Surface Cost Routing And View Ban

```yaml
plan_unit_id: UF-064
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Source Control, GitHub Actions, Docker Manager, Kubernetes, and Orchestrator receipts do not create feature-local cost views; `usage_event_ref` or equivalent canonical usage identity routes `Show in Ledger` and `Show in Usage` to canonical Usage surfaces, with feature-local summaries only secondary.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible routing from receipts into canonical Usage/Ledger surfaces.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-025
- UF-033
unblocks: []
acceptance_criteria:
- UF-064 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: cross_surface_cost_usage_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0102
preserved_exact_tokens:
- 'Source Control, GitHub Actions, Docker Manager, Kubernetes, and Orchestrator'
- 'must not create feature-local cost views'
- 'usage_event_ref'
- 'Show in Ledger'
- 'Show in Usage'
- 'canonical Usage surfaces'
- 'canonical usage records'
- 'feature-local summary is secondary presentation only'
negative_constraints:
- 'Cross-surface receipts from Source Control, GitHub Actions, Docker Manager, Kubernetes, and Orchestrator must not create feature-local cost views.'
- 'Any feature-local summary is secondary presentation only and must not replace the canonical Usage/Ledger pipeline.'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Runtime_Artifacts_Panel.md'
- 'Plans/storage-plan.md'
- 'Plans/GitHub_Integration.md'
split_recommendation_reason: 'The source span mixes cost routing, undo disclosure, bulk receipt shape, high-cost warnings, and owner-precedence compatibility constraints.'
```

### UF-065 - Reversibility Undo And High Cost Disclosure

```yaml
plan_unit_id: UF-065
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Cost-bearing actions disclose reversibility and undo/accounting before execution, including undo-window duration, `local-only` versus `remote-compensating`, invalidators, and high-cost warning semantics for repeated or long-lived remote actions when platform/provider data allows it.'
gui_related: true
gui_classification_reason: 'The unit defines user-facing receipts, confirmations, and warning disclosures.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-065 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: cost_action_accounting_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0102
preserved_exact_tokens:
- 'Reversibility and undo disclosure'
- '/accounting'
- 'immediately undoable'
- 'reversible with a compensating action'
- 'non-reversible but confirmable'
- 'destructive and `non-undoable`'
- 'non-reversible'
- 'undo-window duration'
- 'local-only'
- 'remote-compensating'
- 'background refresh'
- '/poll'
- 'high-cost'
- 'rerun-many-workflows'
- 'bulk log retrieval'
- 'repeated registry refreshes'
- 'many `/Kubernetes` refreshes'
- 'user-requested long-lived observation'
negative_constraints:
- 'Non-reversible and non-undoable actions must disclose that before execution rather than only in `/history`.'
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/GitHub_Integration.md'
- 'Plans/Containers_Registry_and_Unraid.md'
- 'Plans/Orchestrator_Page.md'
split_recommendation_reason: 'The source span mixes cost routing, undo disclosure, bulk receipt shape, high-cost warnings, and owner-precedence compatibility constraints.'
```

### UF-066 - Bulk Receipt Shape And Owner Precedence

```yaml
plan_unit_id: UF-066
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Bulk-operation receipts preserve parent aggregate `/failed/blocked/skipped` counts and child `per-target` result, `usage_event_ref`, rollback or `/undo` expectation, and blocked reason; owner precedence keeps `usage-feature.md` on cost_usage routing while legacy `allowed_actions[]` remains compatibility-only and ordered `allowed_action_ids[]` stays live.'
gui_related: false
gui_classification_reason: 'The unit defines receipt data shape and cross-doc owner precedence rather than visual presentation.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-066 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: bulk_receipt_shape_owner_precedence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0102
preserved_exact_tokens:
- 'Bulk-operation receipts'
- 'parent/child shape'
- '/failed/blocked/skipped'
- 'per-target'
- 'usage_event_ref'
- 'rollback'
- '/undo'
- 'Orchestrator and history must not flatten'
- 'Small-sweep owner precedence'
- 'cost_usage routing'
- 'deprecated-alias doctor IDs'
- '/precedence'
- '/Docker/Orchestrator'
- 'deprecated-alias'
- 'allowed_actions[]'
- 'compatibility-only'
- 'allowed_action_ids[]'
- 'without accidental global find/replace'
negative_constraints:
- 'Bulk-operation receipts preserve the parent/child shape for usage and history.'
- 'Orchestrator and history must not flatten a bulk action into one ambiguous line item.'
preserved_contractrefs: []
compatibility_only_notes:
- 'Legacy `allowed_actions[]` remains compatibility-only; blocked/recovery flows use ordered `allowed_action_ids[]` without accidental global find/replace.'
stale_retired_dispositions:
- 'deprecated-alias handling is preserved as owner-precedence compatibility lineage.'
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/newtools.md'
- 'Plans/Crosswalk.md'
- 'Plans/Runtime_Artifacts_Panel.md'
- 'Plans/storage-plan.md'
split_recommendation_reason: 'The source span mixes cost routing, undo disclosure, bulk receipt shape, high-cost warnings, and owner-precedence compatibility constraints.'
```

### UF-067 - Requested Account And Pressure Record Boundary

```yaml
plan_unit_id: UF-067
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: '`manual_preferred_account_id` is a run-request field, not a project policy default; account pressure and switching are append-only account-switch and pressure-episode `/record` families consumed by Usage, Ledger, History, routing, and account-pressure projections.'
gui_related: false
gui_classification_reason: 'The unit defines durable routing/projection record boundaries rather than GUI presentation.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-007
unblocks: []
acceptance_criteria:
- UF-067 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: requested_account_pressure_record_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0103
preserved_exact_tokens:
- 'manual_preferred_account_id'
- 'run-request field'
- 'project policy default'
- 'append-only event `/record` family'
- 'account-pressure'
- 'account-switch records'
- 'Usage, Ledger, History, and routing projections'
- 'account-switch / pressure-episode family'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Multi-Account.md'
- 'Plans/storage-plan.md'
split_recommendation_reason: 'The source span contains multiple distinct routing, export, history, subject identity, and provenance constraints.'
```

### UF-068 - Usage Contract Evidence And Consolidation Gate

```yaml
plan_unit_id: UF-068
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Gate-side Usage contract changes require verifiable `/schema` evidence before prose expands; matrix/schema drift and gate-side drift are one contract-risk pattern, and A2A duplicate attempt-continuity plus tier-boundary schema signals wait for version-governed consolidation.'
gui_related: false
gui_classification_reason: 'The unit defines governance and schema evidence constraints rather than GUI presentation.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-068 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_contract_evidence_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0103
preserved_exact_tokens:
- 'Gate-side usage contract changes'
- '/schema'
- 'matrix/schema drift'
- 'gate-side drift'
- 'same contract-risk pattern'
- 'A2A duplicate attempt-continuity addenda'
- 'tier-boundary schema signal'
- 'version-governed consolidation requirement'
- 'Usage waits'
negative_constraints:
- 'Gate-side usage contract changes must land with verifiable `/schema` evidence before prose expands.'
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Contracts_V0.md'
- 'Plans/Wiring_Matrix.md'
- 'Plans/Progression_Gates.md'
split_recommendation_reason: 'The source span contains multiple distinct routing, export, history, subject identity, and provenance constraints.'
```

### UF-069 - Subject Routing And Inspector History Focus

```yaml
plan_unit_id: UF-069
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Runtime artifacts and receipts preserve canonical usage identity plus run `/thread/attempt/worktree` linkage, and `inspector_target = history` changes chronological or detail-history focus inside the already-selected object rather than the selected subject identity.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible routing and inspector/history focus behavior.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-004
- UF-033
unblocks: []
acceptance_criteria:
- UF-069 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: subject_routing_inspector_history_focus
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0103
preserved_exact_tokens:
- 'Runtime artifacts and receipts'
- 'canonical usage identity'
- '/thread/attempt/worktree'
- 'Usage must not invent feature-local routing semantics'
- 'inspector_target = history'
- 'chronological'
- '/detail-history'
- 'selected object'
- 'selected subject identity'
negative_constraints:
- 'Runtime artifacts and receipts preserve canonical usage identity plus run `/thread/attempt/worktree` linkage; Usage must not invent feature-local routing semantics when a receipt or runtime artifact already carries the shared subject.'
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Runtime_Artifacts_Panel.md'
- 'Plans/UI_Command_Catalog.md'
- 'Plans/FinalGUISpec.md'
split_recommendation_reason: 'The source span contains multiple distinct routing, export, history, subject identity, and provenance constraints.'
```

### UF-070 - Export Labels And View Export Boundary

```yaml
plan_unit_id: UF-070
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Usage export labels distinguish exact record payload, filtered table dump, and convenience summary; filtered ledger CSV, filtered concern `/table` CSV, and analytics chart/table export are view exports unless they carry the exact record envelope required for canonical record export.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible export labels and export surface boundaries.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- UF-005
unblocks: []
acceptance_criteria:
- UF-070 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: usage_export_view_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0103
preserved_exact_tokens:
- 'JSON export labels'
- 'exact record payload'
- 'filtered table dump'
- 'convenience summary'
- 'record envelope'
- 'view export'
- 'filtered ledger CSV'
- 'filtered concern `/table` CSV'
- 'analytics chart/table export'
- 'canonical record export'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/storage-plan.md'
- 'Plans/Runtime_Artifacts_Panel.md'
split_recommendation_reason: 'The source span contains multiple distinct routing, export, history, subject identity, and provenance constraints.'
```

### UF-071 - Source Control Views And History Dimensions

```yaml
plan_unit_id: UF-071
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'Historical-only projects are not degraded solely because of unrelated completed historical runs; Source Control usage views stay compact around current `/live` worktree rows with toggles for retained, cleanup-eligible, and archived `/removed` history, while Usage history preserves distinct chronological-first dimensions.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible Source Control usage view and history presentation constraints.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-071 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: source_control_usage_history_dimensions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0103
preserved_exact_tokens:
- 'Historical-only projects'
- 'no-active-run'
- 'absence of current execution'
- 'not a problem state'
- 'Source Control usage views'
- 'current `/live` worktree rows'
- '/toggles'
- 'retained'
- 'cleanup-eligible'
- 'archived `/removed` history'
- 'graph generation history'
- 'safe-point and recovery history'
- 'promotion `/revocation` audit'
- 'cleanup `/archive/remove` traceability'
- 'chronological-first'
- '/continuation'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/WorktreeGitImprovement.md'
- 'Plans/Orchestrator_Page.md'
- 'Plans/storage-plan.md'
split_recommendation_reason: 'The source span contains multiple distinct routing, export, history, subject identity, and provenance constraints.'
```

### UF-072 - Effective Resolution Display Boundary

```yaml
plan_unit_id: UF-072
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'The `effective-resolution` record carries blocked and `/degraded` reason fields plus confidence and `/source` hooks so Usage can display why resolution changed without owning provider or runtime truth.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible explanation of effective-resolution changes while preserving owner boundaries.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-072 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: effective_resolution_display_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0103
preserved_exact_tokens:
- 'effective-resolution'
- 'blocked'
- '/degraded'
- 'reason fields'
- 'confidence'
- '/source'
- 'display why resolution changed'
- 'without owning provider or runtime truth'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Contracts_V0.md'
- 'Plans/Executor_Protocol.md'
- 'Plans/FinalGUISpec.md'
split_recommendation_reason: 'The source span contains multiple distinct routing, export, history, subject identity, and provenance constraints.'
```

### UF-073 - Provider Provenance Before Resolved Facts

```yaml
plan_unit_id: UF-073
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'OpenCode bridge limits, DAE enforcement, promoted-feature shell ownership, and runtime identity provenance remain explicit architectural edges before Usage presents those events as fully resolved provider/account facts.'
gui_related: false
gui_classification_reason: 'The unit defines architectural provenance constraints before Usage may treat provider/account facts as resolved.'
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- UF-073 remains addressable as a fine-grained Usage Feature PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: usage_feature_drift
reasoning_tier: standard
context_scope: usage_feature_batch_196
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: provider_provenance_before_resolved_facts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0103
preserved_exact_tokens:
- 'OpenCode bridge limits'
- 'DAE enforcement'
- 'promoted-feature shell ownership'
- 'runtime identity provenance'
- 'architectural edges'
- 'fully resolved provider/account facts'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/usage-feature.md'
- 'Plans/Provider_OpenCode.md'
- 'Plans/Executor_Protocol.md'
- 'Plans/Section15_MVP_Promoted_Features_Spec.md'
- 'Plans/Contracts_V0.md'
split_recommendation_reason: 'The source span contains multiple distinct routing, export, history, subject identity, and provenance constraints.'
```
### UF-001 - Usage Feature Source-Preserving Bridge Retired

```yaml
plan_unit_id: UF-001
unit_type: generated_artifact_residual
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: 'UF-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 197 because usage-feature-S0104 through S0107 are generated standardization tail material: Owner / Consumer Map, PlanUnits heading, former generated UF-001 bridge, and Migration Coverage. usage-feature-S0001 through S0103 are covered by UF-002 through UF-073 or explicit structural/reference dispositions. UF-001 no longer carries source_preserving_planunit compile mode and must not own product coverage.'
gui_related: false
gui_classification_reason: 'The retired bridge is generated migration lineage rather than implementation-facing GUI behavior, even though the retired source lineage preserved earlier GUI-related product tokens.'
split_recommended: false
depends_on:
- UF-002
- UF-003
- UF-004
- UF-005
- UF-006
- UF-007
- UF-008
- UF-009
- UF-010
- UF-011
- UF-012
- UF-013
- UF-014
- UF-015
- UF-016
- UF-017
- UF-018
- UF-019
- UF-020
- UF-021
- UF-022
- UF-023
- UF-024
- UF-025
- UF-026
- UF-027
- UF-028
- UF-029
- UF-030
- UF-031
- UF-032
- UF-033
- UF-034
- UF-035
- UF-036
- UF-037
- UF-038
- UF-039
- UF-040
- UF-041
- UF-042
- UF-043
- UF-044
- UF-045
- UF-046
- UF-047
- UF-048
- UF-049
- UF-050
- UF-051
- UF-052
- UF-053
- UF-054
- UF-055
- UF-056
- UF-057
- UF-058
- UF-059
- UF-060
- UF-061
- UF-062
- UF-063
- UF-064
- UF-065
- UF-066
- UF-067
- UF-068
- UF-069
- UF-070
- UF-071
- UF-072
- UF-073
unblocks: []
acceptance_criteria:
- usage-feature-S0001 through S0103 remain mapped to fine-grained Usage Feature PlanUnits or structural dispositions rather than UF-001.
- usage-feature-S0104 through S0107 are generated standardization tail material or retired bridge lineage, not product implementation coverage.
- UF-001 no longer uses source_preserving_planunit mode and creates no WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: usage_feature_generated_tail_batch_197
implementation_surfaces:
- Plans/usage-feature.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0104
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0105
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0106
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:usage-feature-S0107
preserved_exact_tokens:
- source_preserving_planunit
- Usage Feature -- App/GUI Plan
- usage-feature-S0104
- usage-feature-S0107
- Migration Coverage
- PlanUnits
- Owner / Consumer Map
negative_constraints:
- UF-001 must not provide product implementation coverage for usage-feature-S0001 through S0107 after Phase 2B batch 197.
- UF-001 must not override UF-002 through UF-073 or later fine-grained Usage Feature PlanUnits.
- Do not rely on one coarse source_preserving_planunit as the final implementation standard for usage-feature.md.
preserved_contractrefs:
- 'ContractRef lineage remains preserved in span_map and coverage_map; the malformed trailing apostrophe from usage-feature-S0106 is lineage only and is not promoted as an active ContractRef.'
compatibility_only_notes:
- The retired bridge is compatibility lineage for generated Owner / Consumer Map, generated PlanUnits, former UF-001 bridge, and Migration Coverage tail spans only.
stale_retired_dispositions:
- Former generated source-preserving bridge material is retired as migration lineage only.
owner_hints:
- Plans/usage-feature.md
```
