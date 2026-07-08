# Shard 011: PlanUnits

Source: `Plans/Glossary.md`

Source lines: L300-L1612

Source SHA256: `57e4e8c784c7e0f702e8788fbd30c5eb74c73c3610e2eb27d45e6a815fa6ca63`

---

## PlanUnits

### G-002 - Canonical Owner-Section Requirement

```yaml
plan_unit_id: G-002
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Glossary owner-section requirements preserve the product, runtime, storage, UI, and governance details required for this owner document in canonical live specification form.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: canonical_owner_section_requirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0002
preserved_exact_tokens:
- Canonical owner-section requirements
- product, runtime, storage, UI, and governance details
- owner document
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/Glossary.md owns short canonical terminology and vocabulary for downstream plan documents.
owner_hints:
- Plans/Glossary.md
```

### G-003 - Glossary Authority Scope And Platform Naming

```yaml
plan_unit_id: G-003
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Glossary.md defines canonical terms to prevent drift and synonym creep, requires Puppet Master as the only correct platform name, allows legacy naming only as the unquoted older-name reference, and preserves help-entry/template governance setup.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: glossary_authority_scope_platform_naming
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0004
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0006
preserved_exact_tokens:
- PUPPET MASTER -- CANONICAL TERMINOLOGY
- Puppet Master
- legacy naming
- prevent drift and synonym creep
- Primitive:Glossary
- Invariant:INV-010
negative_constraints:
- Older platform naming may be referred to only as legacy naming and must not be quoted.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: Primitive:Glossary'
- 'ContractRef: Invariant:INV-010'
```

### G-004 - Orchestrator Rewrite Terms

```yaml
plan_unit_id: G-004
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Orchestrator rewrite terminology defines execution unit context, concern records, trust/degraded states, inline/context/canonical help layers, and owner_node_id lineage with tier-rooted owner fields retained only as source-lineage aliases.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: orchestrator_rewrite_terms
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0008
preserved_exact_tokens:
- Execution Unit Context
- Concern Record
- Trust State
- Degraded State
- Inline Help
- Context Help
- Canonical Help Entry
- owner_node_id
negative_constraints:
- Older tier-rooted ownership field names are migration/source-lineage aliases only.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md'
```

### G-005 - Runtime Help-entry Routing And Gap Governance

```yaml
plan_unit_id: G-005
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Runtime and routing help entries use help-entry records with canonical fields and route gap governance through live owner docs, aliases, exact gap items, and broken-anchor cleanup evidence rather than durable two-column glossary tables.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: runtime_help_entry_routing_gap_governance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0009
preserved_exact_tokens:
- help-entry
- canonical_name
- short_definition
- why_it_matters
- what_it_is_not
- common_related_states
- related_concepts
- surface_examples
- gap-001
- gap-008
- broken-anchor cleanup
negative_constraints:
- Avoid two-column Term | Definition tables for durable glossary ownership.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
split_recommendation_reason: Glossary-S0009 contains many runtime/routing term families split across G-005 through G-008.
```

### G-006 - Requested Effective Identity Persona And Provider Vocabulary

```yaml
plan_unit_id: G-006
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Runtime vocabulary uses requested/effective identity, protected core Persona, provider-layer, provider_unavailable, and raw-finding terms without creating duplicate runtime nouns, conflating provider-layer with runtime identity, or treating Document Writer as a protected Persona.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: requested_effective_identity_persona_provider_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0009
preserved_exact_tokens:
- requested_persona
- effective_persona
- Protected core Persona
- assistant
- general-purpose
- overseer
- provider-layer
- provider_unavailable
- raw-finding
- effective_model
- Document Writer
negative_constraints:
- Do not create duplicate top-level nouns such as chat_model; use owner-owned fields such as effective_model.
- Provider-layer terms must not be conflated with runtime identity terms.
- Document Writer is legacy/source-lineage wording, not a protected core Persona unless a later owner decision reopens it.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
```

### G-007 - Route Artifact Decomposition And Account-attempt Boundaries

```yaml
plan_unit_id: G-007
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Route, artifact, decomposition, storage, runtime artifact help, Orchestrator page help, final GUI route copy, assistant chat controls, and account-attempt terms preserve canonical identity, usage, ledger, receipt, retry/resume, and route_target boundaries.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: route_artifact_decomposition_account_attempt_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0009
preserved_exact_tokens:
- decomposition_context
- usage_event_ref
- /Ledger
- cost_usage
- route_target
- resume_url
- /retry
- /account/attempt
- task_id
- attempt_id
negative_constraints:
- decomposition_context must not override canonical node, package, seam, lane, worktree, or attempt identity.
- resume_url is not a stronger ad hoc primitive than route_target.
- Assistant chat surfaces must not invent thread-local resume paths.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
```

### G-008 - Tier Compatibility Widget Hostability And Projection-era Migration

```yaml
plan_unit_id: G-008
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Tier-shaped, widget-hostability, projection-era event, route payload, evidence wrapper alias, Crosswalk drift, blocked sequence, attempt attribution, Projects registry, and assistant-chat compatibility terms are migration/source-lineage vocabulary that must not revive stale tier-era, widget-era, standalone, page:string, or six-tab models that omit Plan Compile.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: tier_compatibility_widget_hostability_projection_migration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0009
preserved_exact_tokens:
- Tier-shaped compatibility
- widget-hostability
- widget-layout
- TierChanged
- IterationStart
- TierTree
- route payload vocabulary
- /wrapper/alias
- Crosswalk Orchestrator primitive drift
- Blocked sequence runtime identity
- Attempt attribution migration
- projects:v1
negative_constraints:
- Do not revive stale tier-era execution terms, widget-era non-Progress Orchestrator assumptions, standalone-surface page models, non-canonical persona fields, or tier_type as a core node UI field.
- widget-hostability and widget-layout are compatibility-only vocabulary for non-Progress Orchestrator surfaces.
- Crosswalk Orchestrator primitive text must not keep stale six-tab or Tiers wording that conflicts with the seven-tab rewrite model.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
```

### G-009 - Shell And Workspace Surface Vocabulary

```yaml
plan_unit_id: G-009
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Shell and workspace terms define Source Control as Git-first repo/worktree state, GitHub Actions as hosted workflow/admin/runtime state, and Docker Manager as container/runtime operations attention state.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: shell_workspace_surface_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0010
preserved_exact_tokens:
- Source Control
- GitHub Actions
- Docker Manager
- local SCM state
- workflow runs
- repository Actions settings
- unhealthy containers
negative_constraints:
- GitHub Actions is separate from Source Control.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md'
```

### G-010 - Terminal Runtime Vocabulary

```yaml
plan_unit_id: G-010
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Terminal runtime terms distinguish Terminal Section, Terminal Tab, Terminal Pane, Terminal Session, terminal_session_id, Dev Session, and dev_session_id so visible terminal binding and runtime PTY continuity stay separate.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: terminal_runtime_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0011
preserved_exact_tokens:
- Terminal Section
- Terminal Tab
- Terminal Pane
- Terminal Session
- terminal_session_id
- Dev Session
- dev_session_id
negative_constraints:
- Dev Session must not replace terminal_session_id when exact shell reuse matters.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
```

### G-011 - Provider Entry Projection Policy And Usage Pressure Vocabulary

```yaml
plan_unit_id: G-011
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Provider and account terms distinguish provider_entry_id, internal projection policy fields, per-account CODEX_HOME sandboxing, and usage-pressure state from generic platform fields, health state, and final resolution outcome.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: provider_entry_projection_policy_usage_pressure_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0012
preserved_exact_tokens:
- provider_entry_id
- conflict_policy
- drift_detection
- overlay_policy
- share_classes[]
- deny_classes[]
- projection_mode
- selectable_unit
- root_path
- per-account CODEX_HOME
- Usage-pressure state
negative_constraints:
- Projection policy fields stay internal/provider-registry/scheduler-only by default unless an owner doc proves audit visibility.
- Usage-pressure state is distinct from general health state and final resolution outcome.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
```

### G-012 - Projection Freshness Health And Trust Axes

```yaml
plan_unit_id: G-012
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Projection freshness, health, trust, degraded fallback, runtime-trust command, blocked presentation, Progress trust, concern trust, and projection_freshness/projection_health terms keep recency, safety, write availability, dismissal, trust_tier, and mutation gating axes distinct.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: projection_freshness_health_trust_axes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0013
preserved_exact_tokens:
- current | refreshing | stale
- healthy | degraded | unavailable
- writable
- pending_write
- blocked
- read_only
- ProjectionHealth
- projection_freshness
- projection_health
- trust_tier
- dismissed
negative_constraints:
- Do not flatten freshness, health, and write availability into one generic offline badge.
- dismissed is presentation state, not semantic resolution.
- Retire trust_tier from action-gating terminology.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
```

### G-013 - Help Architecture Linking And Copy-depth Vocabulary

```yaml
plan_unit_id: G-013
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Help architecture terms define exact-record links, three-depth help, help-system ownership, concept inventory, widget help ownership, deep-object help-linking, gap supersession, stability sweeps, high-risk word pairs, Orchestrator contextual help, tooltip depth, Expert/ELI5 copy, and first-class object related-concept records without changing underlying semantics.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: help_architecture_linking_copy_depth_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0014
preserved_exact_tokens:
- History/Ledger help links
- Three-depth help contract
- inline help
- context help
- canonical help entry
- help-system
- help-linking
- supersedes_prior
- tooltip-oriented
- Expert
- /ELI5
- related-concept
negative_constraints:
- Contextual help may simplify wording, but it must not mutate underlying semantics.
- Simple help can change reading level, but it must not rename runtime truth or alter contract semantics.
- tooltip-only help is insufficient for dense rewrite concepts.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md'
split_recommendation_reason: Glossary-S0014 contains help architecture and project-status term families split across G-013 and G-014.
```

### G-014 - Project Status Blocked Owner Escalation And Resurfacing Vocabulary

```yaml
plan_unit_id: G-014
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Project status terms define activity_state, attention_state, blocked-owner taxonomy, escalation ladder, and resurfacing/aging rules so Orchestrator, project inspectors, and help surfaces share blocker and project-state vocabulary.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: project_status_blocked_owner_escalation_resurfacing_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0014
preserved_exact_tokens:
- activity_state
- planning
- running
- waiting
- blocked
- cooling_down
- archived
- attention_state
- quiet
- watch
- needs_attention
- urgent
- Blocked-owner taxonomy
- runtime_owner
- approval_owner
- account_owner
- route_owner
- policy_owner
- Escalation ladder
- Resurfacing / aging rules
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md'
```

### G-015 - Help-entry Template And Related Concept Clusters

```yaml
plan_unit_id: G-015
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Help-entry template and related-concept cluster terms preserve canonical help shape, recovery/escalation/evidence fields, and concern/state cluster families such as auth, approval, route/open, runtime recovery, and projection health.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: help_entry_template_related_concept_clusters
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0015
preserved_exact_tokens:
- Title
- Canonical definition
- When this appears
- Affected execution context or surface
- Recovery steps
- Escalation path
- Related concepts
- Evidence / inspector links
- auth
- approval
- route/open
- runtime recovery
- projection health
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md'
```

### G-016 - Runtime Operation Vocabulary And Copy Boundaries

```yaml
plan_unit_id: G-016
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Runtime operation vocabulary reserves copy for Review, Requested, Effective, Why different?, Health, Capability, Readiness, Validation, Retry, Resume, Recover, Restore, wake reason, queue analysis, and remediation lineage while keeping provenance, legal hold, receipt retention, and bulk undo/cost disclosure separate.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: runtime_operation_vocabulary_copy_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0016
preserved_exact_tokens:
- Review
- Requested
- Effective
- Why different?
- Health
- Capability
- Readiness
- Validation
- Retry
- Resume
- Recover
- Restore
- wake_reason
- queue analysis
- remediation lineage
- /legal
- /undo/cost
negative_constraints:
- Surfaces must not use Actual, Resolved, Current, Available, or Fallback as synonyms for Requested/Effective concepts.
- Provenance, legal hold, receipt retention, and bulk undo/cost disclosure must not collapse into generic Health, Capability, Readiness, or Validation copy.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
```

### G-017 - Evidence And Spec-integrity Vocabulary

```yaml
plan_unit_id: G-017
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Evidence vocabulary distinguishes evidence bundles, wrapper/alias evidence, spec-integrity evidence, and interview artifact evidence so command proof, alias normalization, ghost IDs, missing schema/sections, dead references, and node evidence stay machine-consistent.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: evidence_spec_integrity_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0017
preserved_exact_tokens:
- Evidence bundle
- Wrapper and alias evidence
- evidence.schema.json
- /fail
- wrapper-normalization
- alias-resolution
- spec-integrity
- Interview artifact evidence
- Project_Output_Artifacts
- node_id
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: SchemaID:evidence.schema.json'
```

### G-018 - Secret Handling Vocabulary

```yaml
plan_unit_id: G-018
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: Secret handling vocabulary defines Secret and Credential store and keeps OS-backed credential storage as the only allowed persistence for secrets.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: secret_handling_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0018
preserved_exact_tokens:
- Secret
- Credential store
- OS-backed keychain/credential manager
- only allowed persistence for secrets
negative_constraints:
- OS-backed credential store is the only allowed persistence for secrets.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: Invariant:INV-002'
```

### G-019 - DRYRules Primitive

```yaml
plan_unit_id: G-019
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: DRYRules primitive vocabulary defines reuse-first methodology and DRY tags for widget, data, function, and helper reuse under DRY_Rules ownership.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: dryrules_primitive
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0020
preserved_exact_tokens:
- DRYRules
- DRY:WIDGET
- DRY:DATA
- DRY:FN
- DRY:HELPER
- Plans/DRY_Rules.md
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md'
```

### G-020 - PatchPipeline Primitive

```yaml
plan_unit_id: G-020
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: PatchPipeline primitive vocabulary defines the Git and PR workflow pipeline and preserves local git ownership under WorktreeGitImprovement and hosting ownership under GitHub_API_Auth_and_Flows.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: patchpipeline_primitive
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0021
preserved_exact_tokens:
- PatchPipeline
- Git + PR workflow pipeline
- worktrees
- branches
- commits
- push
- hosting operations
- local git operations
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- WorktreeGitImprovement owns local git operations; GitHub_API_Auth_and_Flows owns hosting operations.
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: Primitive:PatchPipeline, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md'
```

### G-021 - SessionStore Primitive And Runtime Persistence Boundary

```yaml
plan_unit_id: G-021
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: SessionStore primitive vocabulary defines session/run/event/artifact storage over seglog, redb, Tantivy, replay, projections, runtime records, and storage-owned overlay shape while forbidding secrets and keeping runtime state out of plan-node shards and project-local JSON sidecars.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: sessionstore_runtime_persistence_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0022
preserved_exact_tokens:
- SessionStore
- seglog
- redb
- Tantivy
- target_seq
- freshness notifications
- attempt_record
- tier_runtime_record
- blocked_projection
- usage_record
- /redb/projections
negative_constraints:
- Secrets are forbidden in persistent storage.
- Runtime state is not stored in plan-node shards or project-local JSON sidecars.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: Primitive:SessionStore, ContractName:Plans/storage-plan.md, PolicyRule:no_secrets_in_storage'
```

### G-022 - InstantGrep User-facing Name

```yaml
plan_unit_id: G-022
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: InstantGrep primitive vocabulary defines the promoted user-facing name for transparent regex-grep acceleration over SparseNgramIndex plus grep and Search-panel integration.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: instantgrep_user_facing_name
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0023
preserved_exact_tokens:
- InstantGrep
- Instant Grep
- SparseNgramIndex
- grep
- Search-panel integration
negative_constraints:
- Instant Grep is not a second tool name and not a separate index family.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: Primitive:SparseNgramIndex, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md'
```

### G-023 - SparseNgramIndex Query And Storage Semantics

```yaml
plan_unit_id: G-023
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: SparseNgramIndex vocabulary defines sparse n-gram regex acceleration, build/query extraction, Roaring Bitmap postings keyed by xxh3, generation-numbered snapshots, ArcSwap publish, and ripgrep final verification.
gui_related: true
gui_classification_reason: This unit defines user-visible terminology, copy, help, surface, or UI routing vocabulary.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: sparse_ngram_index_query_storage_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0024
preserved_exact_tokens:
- SparseNgramIndex
- sparse n-grams
- Roaring Bitmaps
- xxh3
- generation-numbered directories
- ArcSwap
- ripgrep
negative_constraints:
- The index narrows candidate files only; ripgrep verifies final correctness.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: Primitive:SparseNgramIndex, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md'
```

### G-024 - DirtyLayer Freshness Model

```yaml
plan_unit_id: G-024
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: DirtyLayer vocabulary defines generation-aware dirty path tracking, synchronous PM-mediated write updates, external file watcher updates, verification inclusion, and generation-stamped clearing for SparseNgramIndex freshness.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: dirtylayer_freshness_model
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0025
preserved_exact_tokens:
- DirtyLayer
- generation-aware
- dirty paths
- PM-mediated writes
- file watcher
- generation-stamped clearing
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: Primitive:SparseNgramIndex, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md'
```

### G-025 - SearchDomainSplit Boundary

```yaml
plan_unit_id: G-025
unit_type: requirement
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: SearchDomainSplit vocabulary defines grep-vs-keyword ownership where grep owns raw regex over file content, codesearch owns Tantivy/LSP keyword/snippet/symbol retrieval, File Manager search remains tree filtering, and LSP symbol/reference surfaces keep their own semantics.
gui_related: false
gui_classification_reason: This unit defines canonical terminology, runtime/storage/search/evidence/security semantics, or owner boundaries, not GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- The behavior is addressable through this fine-grained PlanUnit instead of broad G-001 coverage.
- ContractRefs, anchors or aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: glossary_drift
reasoning_tier: standard
context_scope: glossary_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: search_domain_split_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0026
preserved_exact_tokens:
- SearchDomainSplit
- grep-vs-keyword
- grep
- codesearch
- Tantivy
- LSP-backed keyword
- File Manager search
- LSP symbol/reference
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- Plans/Glossary.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md'
```

### G-001 - Glossary Retired Source-Preserving Bridge

```yaml
plan_unit_id: G-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Glossary.md
canonical_text: G-001 is retained only as migration-lineage compatibility disposition for the retired Glossary source-preserving bridge. Product coverage has been atomized into G-002 through G-025 or structurally dispositioned, and G-001 must not re-own Glossary product spans or use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: This retired bridge records migration lineage only; the old bridge span mentions GUI/help tokens, but product GUI coverage is owned by fine-grained Glossary PlanUnits.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- G-001 no longer uses source_preserving_planunit compile mode.
- G-002 through G-025 own product coverage for atomized Glossary spans.
- Glossary-S0001, S0003, S0007, S0019, S0027, S0028, S0029, and S0031 are explicit structural dispositions.
- G-001 maps only to retired bridge lineage Glossary-S0030.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/Glossary.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Glossary-S0030
preserved_exact_tokens:
- G-001
- Glossary-S0030
- source_preserving_planunit
- source_preserving_bridge_retired
- Glossary (Canonical)
- g-001-glossary-canonical-source-preserving-planunit
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- G-001 must not re-own Glossary-S0001 through Glossary-S0029 product coverage.
- G-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this retired bridge.
compatibility_only_notes:
- G-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former G-001 residual source-preserving bridge is retired by Phase 2B batch 079.
owner_boundary_notes:
- G-002 through G-025 own atomized Glossary body coverage.
- Glossary-S0030 is migration-lineage coverage only after bridge retirement.
owner_hints:
- Plans/Glossary.md
```
