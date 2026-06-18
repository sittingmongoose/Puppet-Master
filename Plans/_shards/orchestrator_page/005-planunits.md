# Shard 005: PlanUnits

Source: `Plans/Orchestrator_Page.md`

Source lines: L398-L1403

Source SHA256: `e5f5b2c36a94c0619e3c535b01896c26b8782cdf73c4138eb0edc3b36f8d3f18`

---

## PlanUnits

### OP-002 - Orchestrator Scope Page Shell And Owner Boundary

```yaml
plan_unit_id: OP-002
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Orchestrator owns scheduling, concern tracking, blocked-state handling, runtime identity presentation, page layout and controls, view-model projections, and run-control intents for the Progress, Plan Compile, Seams, Node Graph, Evidence, History, and Ledger tab set, while runtime, storage, and scheduler contracts own canonical truth.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: true
split_recommendation_reason: >-
  S0032 mixes page shell, runtime ownership, compatibility, routing, and governance material; this unit covers the scope and owner-boundary subset.
depends_on: []
unblocks: []
acceptance_criteria:
  - Orchestrator remains distinct from the UI, CLI, and external providers.
  - The page shell is a seven-tab single-page surface over node/package/seam/lane-aware runtime state.
  - The live tab set is Progress, Plan Compile, Seams, Node Graph, Evidence, History, and Ledger.
  - Tier, widget, and legacy tab labels remain compatibility inputs rather than execution authority.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: orchestrator_scope_owner_boundary
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0002
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
  - Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:7
  - Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:7
  - Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:10
preserved_exact_tokens:
  - "Orchestrator Page -- Single-Page 6-Tab Specification"
  - "/page-shell"
  - "six-tab single-page surface"
  - "seven-tab single-page surface"
  - "Tiers"
  - "Progress/Seams/Node Graph/Evidence/History/Ledger"
  - "Progress/Plan Compile/Seams/Node Graph/Evidence/History/Ledger"
  - "Progress"
  - "Plan Compile"
  - "Seams"
  - "Node Graph"
  - "History"
  - "Evidence"
  - "Ledger"
  - "package/lane aware"
negative_constraints:
  - "Orchestrator must not define page-local runtime authority for enums, event semantics, or scheduler truth."
  - "Tiers must not remain a primary tab/page authority."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-003 - Governance Runtime Record Envelope

```yaml
plan_unit_id: OP-003
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Governance and runtime records use a shared record envelope with family-specific payload blocks so records remain distinct from artifacts, receipts, and rendered summaries.
gui_related: false
gui_classification_reason: This unit defines runtime, governance, or ownership contract behavior rather than visual presentation.
split_recommended: true
split_recommendation_reason: >-
  S0032 contains record-envelope examples interleaved with GUI and ownership material.
depends_on: []
unblocks: []
acceptance_criteria:
  - Shared lineage, artifact, and evidence refs stay in the record envelope.
  - Concern, promotion, recovery, and review payloads remain structured family payloads.
  - Rendered summaries do not replace durable records.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: record_envelope_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0004
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0067
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "/blocking/HITL"
  - "resolution_thread"
  - "safe-point"
  - "promotion_class"
  - "revoked"
  - "/reopened"
  - "rendered summaries"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-004 - Concern Record Lifecycle And Authority Contract

```yaml
plan_unit_id: OP-004
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Concern is a first-class durable record with exact lifecycle states, resolution_kind values, owner/creator/resolver separation, source-event/record/projection layers, required minimum fields, and explicit authority direction.
gui_related: false
gui_classification_reason: This unit defines runtime, governance, or ownership contract behavior rather than visual presentation.
split_recommended: true
split_recommendation_reason: >-
  S0070 includes both lifecycle/backend rules and inspector/UI behavior; this unit covers the lifecycle and authority side.
depends_on: []
unblocks: []
acceptance_criteria:
  - Concern lifecycle states remain exactly active, acknowledged, resolved, and dismissed.
  - resolution_kind values remain explicit and do not collapse distinct outcomes.
  - Concern identity survives owner reassignment and projection changes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: concern_lifecycle_identity_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0005
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0006
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0009
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0022
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0023
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0024
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0026
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0030
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0031
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0049
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0052
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0068
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0069
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0070
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0071
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0072
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0073
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0074
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "active"
  - "acknowledged"
  - "resolved"
  - "dismissed"
  - "resolution_kind"
  - "weak_integration"
  - "wiring | workflow | state | gui | design"
  - "concern_source_event_ref"
  - "concern_record"
  - "concern_projection"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-005 - Concern Actions Inspectors And Mutation Affordances

```yaml
plan_unit_id: OP-005
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Concern actions expose authority, confirmation level, rationale requirements, reversibility, audit fields, compact inspectors, route-open full records, and narrow user-facing affordances.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: true
split_recommendation_reason: >-
  S0070 mixes lifecycle rules with inspector/full-record presentation; this unit covers the GUI/action side.
depends_on: []
unblocks: []
acceptance_criteria:
  - Acknowledge, dismiss, resolve, and structural lineage edits remain distinct actions.
  - Full record inspection routes to canonical records instead of expanding giant inline records.
  - User-facing actions remain narrow and true HITL approvals stay separate from generic runtime actions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: concern_action_authority_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0008
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0016
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0025
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0035
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0039
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0051
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0070
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "audit_fields"
  - "confirmation_level"
  - "allowed_actor_kinds"
  - "open evidence"
  - "open history"
  - "open ledger"
  - "open resolution thread"
  - "approve/reject"
  - "true `/HITL` boundaries"
negative_constraints:
  - "Inspectors must not expand giant inline full records inside compact UI."
  - "Runtime `/overseer` actions must not become generic user-facing actions."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-006 - Projection Trust Freshness And Wait Semantics

```yaml
plan_unit_id: OP-006
unit_type: constraint
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Projection state, freshness, direct revalidation, degraded fallback, stale-observation waits, and timeout display are governed by canonical runtime and storage projections rather than elapsed-time guesses.
gui_related: false
gui_classification_reason: This unit defines runtime, governance, or ownership contract behavior rather than visual presentation.
split_recommended: true
split_recommendation_reason: >-
  S0032 contains trust/fallback rules mixed with page and concern material.
depends_on: []
unblocks: []
acceptance_criteria:
  - Mutation-capable projections carry projection_state, last_observed_at, source_event_ref, and revalidation_route.
  - Stale, degraded, and unavailable projections disable mutation unless the owner surface performs direct revalidation.
  - Wait and timeout cards show canonical retained timeout_class and route recovery through stored blocked episodes or receipts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: projection_trust_staleness_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0013
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0036
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0037
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "current"
  - "refreshing"
  - "stale"
  - "degraded"
  - "unavailable"
  - "/weak-integration/freshness"
  - "projection_state"
  - "timeout_class"
  - "hard execution timeout"
  - "stale-observation"
negative_constraints:
  - "Do not infer skipped/failed from stale observation alone."
  - "Do not create new blocked reason, failure class, or receipt identity from wait-copy presentation."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-007 - Object First Routing And Focused Run Context

```yaml
plan_unit_id: OP-007
unit_type: constraint
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Search, command-palette, drill-down, and cross-tab deep links route by stable object identity, focused run context, destination tab, selected object id, optional filters, and inspector detail targets.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: true
split_recommendation_reason: >-
  S0032 includes route identity examples alongside broader scope prose.
depends_on: []
unblocks: []
acceptance_criteria:
  - Concern search results are run-aware and object-first.
  - Deep links stay coherent on focused_run_id and focus_mode rather than jumping to active_run_id implicitly.
  - Search results preserve route targets rather than highlight-only matches.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_identity_loss
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0007
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0011
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0034
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0044
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0045
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "active_run_id"
  - "focused_run_id"
  - "focus_mode = live | historical"
  - "/object-first"
  - "destination tab"
  - "selected object id"
  - "concern_id"
negative_constraints:
  - "Do not collapse similarly named seams, packages, nodes, or work packages across unrelated runs."
  - "Do not route with highlight-only matches."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-008 - Notification Escalation And Blocked Owner Routing

```yaml
plan_unit_id: OP-008
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Notifications, attention rows, blocked-owner summaries, escalation levels, quieting behavior, and surface routing are determined by severity, execution impact, blocked owner, persistence, and projection trust.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: true
split_recommendation_reason: >-
  S0032 and S0058 combine escalation, help, and project taxonomy material.
depends_on: []
unblocks: []
acceptance_criteria:
  - History receives chronological notifications while Progress and Dashboard show active warnings, attention, blocked states, severity markers, and badges.
  - Thread, chat, or input surfaces are reserved for user decisions.
  - Blocked-owner summaries identify a primary blocked owner or attention owner.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: notification_escalation_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0015
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0018
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0020
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0028
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0050
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0054
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0057
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0058
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0059
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "Info"
  - "Warning"
  - "Attention"
  - "Action Required"
  - "Runtime"
  - "Package Overseer"
  - "Seam Overseer"
  - "External Resource"
  - "info"
  - "watch"
  - "attention_required"
  - "blocked"
  - "escalated"
negative_constraints:
  - "Quiet windows must never suppress canonical blocked episodes."
  - "Dismissed presentation must not clear canonical blocked episodes that remain active."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-009 - Project Summary Attention Account Pressure And Switch History

```yaml
plan_unit_id: OP-009
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Project summary, project attention item, account pressure episode, and account switch event records remain durable, project-scoped, and split between current-state and historical-state facts.
gui_related: false
gui_classification_reason: This unit defines runtime, governance, or ownership contract behavior rather than visual presentation.
split_recommended: true
split_recommendation_reason: >-
  S0032 includes project, attention, and account examples mixed with broader scope material.
depends_on: []
unblocks: []
acceptance_criteria:
  - project_summary carries activity_state, attention_state, health_state, owner, and projection-trust disclosure.
  - project_attention_item carries a primary route payload and projection-trust disclosure consumable across surfaces.
  - account_switch_reason is split into pressure cause, switch outcome, and historical lineage.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: project_projection_account_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0019
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0020
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0021
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0047
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0056
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0057
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "project_state:v1:{project_id}"
  - "project_summary"
  - "project_attention_item"
  - "account_pressure_episode"
  - "account_switch_event"
  - "account_switch_reason"
  - "projection_trust_state"
negative_constraints:
  - "Do not overload account_switch_reason with current and historical facts in one field."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-010 - Promotion Review And Gate Evidence

```yaml
plan_unit_id: OP-010
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Promotion classes, review records, gate facts, evidence expectations, decision outcomes, and revocation or reopen lineage remain explicit package, seam, lane, and governance data.
gui_related: false
gui_classification_reason: This unit defines runtime, governance, or ownership contract behavior rather than visual presentation.
split_recommended: true
split_recommendation_reason: >-
  S0032 contains promotion gate and review references inside broad scope prose.
depends_on: []
unblocks: []
acceptance_criteria:
  - Promotion classes are lane_to_package, package_to_seam_available, and seam_complete.
  - Promotion gate facts remain separate from generic promotion state.
  - Review records preserve scope refs, effective reviewer identity, findings, verdict, decision, evidence links, and timestamps.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: promotion_gate_evidence_loss
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0010
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0061
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "lane_to_package"
  - "package_to_seam_available"
  - "seam_complete"
  - "GUI readiness"
  - "accepted_risk"
  - "superseded"
  - "review_id"
  - "verdict"
  - "decision"
negative_constraints:
  - "Do not collapse gate facts into a generic promotion state."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-011 - Progress Widget Hostability And Catalog

```yaml
plan_unit_id: OP-011
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Widget-composed Orchestrator content is restricted to Progress, and the 13-widget Progress catalog, drill mappings, labels, action labels, alert taxonomy, event taxonomy, and condition-aging behavior are preserved.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: true
split_recommendation_reason: >-
  S0032 includes stale widget compatibility while S0040 carries the catalog.
depends_on: []
unblocks: []
acceptance_criteria:
  - Only Progress remains widget-composed inside Orchestrator.
  - The progress catalog preserves all 13 widget IDs and drill destinations.
  - Progress state/action/alert/event taxonomies transfer with the catalog.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: progress_widget_catalog_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0014
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0038
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0040
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "orchestrator:progress"
  - "progress.run-overview"
  - "progress.current-task"
  - "progress.blocked-concerns"
  - "progress.account-switches"
  - "queued|running|attention_required|blocked|recovering|degraded|complete"
  - "FinalGUISpec Appendix C"
negative_constraints:
  - "Tiers-first compatibility must not govern Progress widgets."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-012 - Artifact Receipts And External Blocked State Pivots

```yaml
plan_unit_id: OP-012
unit_type: constraint
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Artifact routing, external receipts, blocked cards, mutable target ownership, terminal-state precedence, and domain blocked payloads route to owner surfaces with retained lineage and explicit missing-link states.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: true
split_recommendation_reason: >-
  S0032 has artifact and authority fragments while S0041-S0042 carry detailed receipt rules.
depends_on: []
unblocks: []
acceptance_criteria:
  - Cost-bearing artifact routing uses usage_event_ref rather than timestamp heuristics.
  - Blocked cards expose publish-capable chains, missing-link explanations, and owner-surface pivots.
  - SCM, Actions, Docker, and Kubernetes blocked payloads carry domain-specific blocker fields.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: artifact_receipt_lineage_loss
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0029
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0041
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0042
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "usage_event_ref"
  - "publish_result_id"
  - "missing-link"
  - "indeterminate_remote_outcome"
  - "owned_by_run"
  - "dirty_worktree"
  - "worktree_conflict"
  - "Replay from last known good"
negative_constraints:
  - "Do not omit missing downstream links or invent lineage."
  - "Do not dispatch Actions-dependent steps from stale readiness snapshots."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-013 - Owner Surface Command Routing

```yaml
plan_unit_id: OP-013
unit_type: constraint
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Orchestrator command exposure for recovery and navigation is route-open only into owner surfaces, while runtime mutation recovery maps through ordered allowed_action_ids to cmd.runtime commands.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Orchestrator may surface route-open commands into Source Control, GitHub Actions, Docker Manager, Kubernetes, and receipt views.
  - Route payloads carry run_id, node_id, blocked_sequence, receipt_ref, and target owner context where available.
  - Mutation recovery remains owned by runtime commands.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_surface_command_overreach
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0043
preserved_exact_tokens:
  - "cmd.orchestrator.open_in_source_control"
  - "cmd.orchestrator.open_in_github_actions"
  - "cmd.orchestrator.open_in_docker_manager"
  - "cmd.orchestrator.open_kubernetes"
  - "cmd.orchestrator.open_receipt"
  - "allowed_action_ids[]"
  - "cmd.runtime.*"
negative_constraints:
  - "Orchestrator MUST NOT mint panel-local mutation semantics for Source Control, GitHub Actions, Docker Manager, Kubernetes, evidence, or artifact actions."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-014 - Debug Resume Target Revalidation

```yaml
plan_unit_id: OP-014
unit_type: constraint
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Before resuming a Debug investigation, Orchestrator revalidates stored session identity and remote authority, then keeps the run attention_required when reconnection or target selection is required.
gui_related: false
gui_classification_reason: This unit defines runtime, governance, or ownership contract behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - dev_session_id, browser_session_id, DAP session identity, and remote authority are checked against stored route and runtime identity.
  - Recoverable stale identity yields session_reconnect_required.
  - Missing deterministic rebinding target yields target_selection_required.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_resume_identity_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0046
preserved_exact_tokens:
  - "dev_session_id"
  - "browser_session_id"
  - "DAP session identity"
  - "attention_required_reason_code = session_reconnect_required"
  - "attention_required_reason_code = target_selection_required"
negative_constraints:
  - "Orchestrator must not silently mint or infer a different target identity to continue execution."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-015 - Source Control And Worktree Boundary

```yaml
plan_unit_id: OP-015
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Orchestrator remains lane-pool operational truth while Source Control remains the concrete repo and worktree operator; rows, review routes, conflict actions, receipts, and cross-surface links preserve run, package, lane, worktree, repo, branch, head, receipt, and recovery lineage.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: true
split_recommendation_reason: >-
  S0032 carries worktree display compatibility while S0060-S0062 carry the owner boundary and handshake.
depends_on: []
unblocks: []
acceptance_criteria:
  - Worktree rows display owning package, lane, run refs, lifecycle state, and blocked/recovery state.
  - Conflict cards route to Source Control Changes through cmd.source_control.open_conflict.
  - Cross-surface links reopen with stable context after restart or label partial lineage when incomplete.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: source_control_boundary_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
  - Plans/WorktreeGitImprovement.md
  - Plans/UI_Command_Catalog.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0012
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0060
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0062
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "repo/worktree/branch/head"
  - "Open Conflict Assistant"
  - "cmd.source_control.open_conflict"
  - "partial lineage"
  - "lane-pool operational truth"
  - "concrete repo/worktree operator"
negative_constraints:
  - "Never silently omit missing hops or invent repo, worktree, branch, head, receipt, or recovery targets."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md"
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-016 - Owner First Canonicalization And Reconciliation Readiness

```yaml
plan_unit_id: OP-016
unit_type: validation_rule
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Owner-doc corrections precede consumer and mirror cleanup, open owner-decision guardrails remain explicit, and reconciliation readiness is classified into still-structural gaps, spec-integrity failures, and plain cleanup buckets.
gui_related: false
gui_classification_reason: This unit defines runtime, governance, or ownership contract behavior rather than visual presentation.
split_recommended: true
split_recommendation_reason: >-
  S0032 includes design-open and authority presentation guardrails in broad scope prose.
depends_on: []
unblocks: []
acceptance_criteria:
  - Owner corrections happen before consumer and mirror cleanup.
  - Fidelity audit reruns after owner and consumer corrections are in place.
  - Open owner decisions remain visible until their owning docs close them.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: canonicalization_false_closure
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: validation_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0003
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0066
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "owner-doc corrections"
  - "fidelity audit"
  - "design-open"
  - "/owner"
  - "still-structural gaps"
  - "spec-integrity failures"
negative_constraints:
  - "Do not hide owner decisions or collapse authority presentation to one monolithic Puppet Master center."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-017 - Glossary And Help Governance

```yaml
plan_unit_id: OP-017
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Glossary and help coverage use stable canonical terms, layered help, a single help-entry template, related-concept clusters, and asymmetric lane/worktree explanations across Orchestrator and Source Control.
gui_related: false
gui_classification_reason: This unit defines runtime, governance, or ownership contract behavior rather than visual presentation.
split_recommended: true
split_recommendation_reason: >-
  S0032 includes lane/worktree help asymmetry while S0063-S0065 carry the help structure.
depends_on: []
unblocks: []
acceptance_criteria:
  - Glossary covers rewrite-critical objects, states, and trust terms.
  - Help is layered as inline help, context help, and canonical help-entry pages.
  - Help entries preserve canonical term, trigger conditions, operator meaning, routes, related concepts, and recovery guidance.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: help_glossary_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0017
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0027
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0063
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0064
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0065
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0032
preserved_exact_tokens:
  - "inline help"
  - "context help"
  - "canonical term"
  - "trigger conditions"
  - "operator meaning"
  - "related concepts"
  - "lane"
  - "worktree"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-018 - Orchestrator Wide Scale Contract

```yaml
plan_unit_id: OP-018
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  Dense Orchestrator tabs require slice-based loading, virtualization, lazy expansion, and demand-loaded inspectors across tabs.
gui_related: true
gui_classification_reason: This unit defines user-visible Orchestrator page behavior or controls.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Slice-based loading is mandatory across dense tabs.
  - Virtualization and lazy expansion are cross-tab requirements.
  - Scale is not limited to the graph tab.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dense_tab_scale_drift
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0055
preserved_exact_tokens:
  - "slice-based loading"
  - "virtualization"
  - "lazy expansion"
  - "demand-loaded inspectors"
  - "cross-tab contract"
negative_constraints:
  - "Scale must not be treated as a graph-tab-only concern."
owner_hints:
  - Plans/Orchestrator_Page.md
```

### OP-019 - Owner Consumer Map And Migration Boundary

```yaml
plan_unit_id: OP-019
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  This standardized Orchestrator Page document keeps stated owner and consumer boundaries, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.
gui_related: false
gui_classification_reason: This unit defines runtime, governance, or ownership contract behavior rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - Owner / Consumer Map remains reporting structure for owner and consumer boundaries.
  - Cross-doc ownership follows ContractRefs and boundary notes already present in source text.
  - Plan Document System and Bootstrap Planning Migration references are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_consumer_map_loss
reasoning_tier: standard
context_scope: orchestrator_page
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: requirement
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0075
preserved_exact_tokens:
  - "Owner / Consumer Map"
  - "source-preserving standardization"
  - "ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md"
negative_constraints:
  - "No additional negative constraints beyond the canonical text."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md"
owner_hints:
  - Plans/Orchestrator_Page.md
```
### OP-001 - Orchestrator Page Retired Source-Preserving Bridge

```yaml
plan_unit_id: OP-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Orchestrator_Page.md
canonical_text: >-
  OP-001 is a retired source-preserving bridge for generated PDS PlanUnit and Migration Coverage audit material. Product prose from Orchestrator_Page-S0001 through Orchestrator_Page-S0076 is covered by fine-grained OP-002 through OP-019; Orchestrator_Page-S0077 is retired bridge lineage and Orchestrator_Page-S0078 is Migration Coverage metadata. No residual source_preserving_planunit product coverage remains for Plans/Orchestrator_Page.md.
gui_related: false
gui_classification_reason: The live retired bridge is migration/audit metadata only; the historical bridge span preserved GUI-related tokens in span_map and coverage_map.
split_recommended: false
depends_on:
  - OP-002
  - OP-003
  - OP-004
  - OP-005
  - OP-006
  - OP-007
  - OP-008
  - OP-009
  - OP-010
  - OP-011
  - OP-012
  - OP-013
  - OP-014
  - OP-015
  - OP-016
  - OP-017
  - OP-018
  - OP-019
unblocks: []
acceptance_criteria:
  - OP-001 does not override OP-002 through OP-019 for Orchestrator_Page-S0001 through S0076.
  - Retired generated bridge and Migration Coverage spans remain available for exact-text audit.
  - Plans/Orchestrator_Page.md has no residual source_preserving_planunit product coverage after this bridge retirement.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this disposition.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: orchestrator_page_residual_bridge
implementation_surfaces:
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: retired_source_preserving_bridge
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0077
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Orchestrator_Page-S0078
preserved_exact_tokens:
  - "OP-001"
  - "Orchestrator Page -- Single-Page 6-Tab Specification Source-Preserving PlanUnit"
  - "source_preserving_planunit"
  - "retired_source_preserving_bridge"
  - "source_preserving_bridge_retired"
  - "PlanUnits"
  - "Migration Coverage"
negative_constraints:
  - "OP-001 must not be used as implementation-ready product coverage for spans now mapped to OP-002 through OP-019."
owner_hints:
  - Plans/Orchestrator_Page.md
```
